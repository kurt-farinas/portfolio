import React, { Suspense, startTransition, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, events, useFrame, useThree, useLoader } from '@react-three/fiber';
import { CameraControls, Html, PerspectiveCamera, RoundedBox, useContextBridge, useCursor } from '@react-three/drei';
import { domToCanvas } from 'modern-screenshot';
import { Box3, CanvasTexture, Color, SRGBColorSpace, Spherical, Vector3, TextureLoader } from 'three';
import DesktopWorkspace from './DesktopWorkspace';
import { POST_LINES } from './BootScreen';
import { createDeskCameraMotion } from './deskCameraMotion';
import { bindDesktopCameraInput, computeDesktopScenePointer } from './desktopCameraInput';
import { DesktopWorkspaceContext } from '../../context/DesktopWorkspaceContext';
import { ModalContext, useModal } from '../../context/ModalContext';
import { RetroOSContext, useRetroOS } from '../../context/RetroOSContext';
import { roomPhase, ROOM_LIGHT } from '../../utils/roomPhase';
import useMinuteClock from './useMinuteClock';
import DeskRoom, { CorkBoard } from './DeskRoom';
import { WindowLandscape } from './RoomSurroundings';
import FairyLights from './FairyLights';
import WindowCat from './WindowCat';
import MergeStatic from './MergeStatic';
import fitTexture from './fitTexture';
import optimized from '../../data/optimizedImageManifest.json';
import FragranceTray from './FragranceTray';
import RubberDuck from './RubberDuck';
import { cameraFollowTarget, easeToward, FOLLOW_TAU, zoomProgress } from './deskCameraFollow';
import { CoffeeMug, DeskClock, DeskLamp, DeskPrinter, DESK_CAMERA_POSITION, DESK_CAMERA_TARGET, RetroMonitor, MONITOR_CENTER_Y, MONITOR_SCREEN_Z, RetroKeyboard, RetroMouse } from './DeskPeripherals';

function readColor(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function desktopSceneEvents(store) {
  const manager = events(store);
  return { ...manager, compute: (event, state, previous) => computeDesktopScenePointer(event, state, previous, manager.compute) };
}

const PRINT_ASPECT = 0.66 / 0.82;
function PhotoPrint({ src, onClick, paper }) {
  const source = useLoader(TextureLoader, optimized[src] || src);
  // A downscaled copy before cropping: useLoader shares one cached texture per URL with the wall polaroids.
  const texture = useMemo(() => {
    const value = fitTexture(source);
    const aspect = source.image.width / source.image.height;
    if (aspect > PRINT_ASPECT) { value.repeat.set(PRINT_ASPECT / aspect, 1); value.offset.set((1 - PRINT_ASPECT / aspect) / 2, 0); }
    else { value.repeat.set(1, aspect / PRINT_ASPECT); value.offset.set(0, (1 - aspect / PRINT_ASPECT) / 2); }
    value.needsUpdate = true;
    return value;
  }, [source]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group onClick={event => { event.stopPropagation(); onClick(); }}>
      <mesh position={[0, 0, -0.008]}><boxGeometry args={[0.74, 0.9, 0.025]} /><meshStandardMaterial color={paper} roughness={0.9} /></mesh>
      <mesh position={[0, 0, 0.01]}><planeGeometry args={[0.66, 0.82]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
    </group>
  );
}

function labelledAncestor(object) {
  for (let node = object; node; node = node.parent) if (node.userData?.label) return node;
  return null;
}

// Hovering a clickable desk object tints it with the accent colour and shows a Win98 tooltip naming what it opens.
function useDeskHover(enabled, accent) {
  const [hovered, setHovered] = useState(null);
  // Hovering a desk object shows the pixel hand; '' afterwards hands the cursor back to the stylesheet instead of the system arrow.
  useCursor(Boolean(hovered), "url('/cursors/retro-hand.svg') 11 1, pointer", '');
  useEffect(() => { if (!enabled) setHovered(null); }, [enabled]);
  useEffect(() => {
    if (!hovered) return undefined;
    const saved = [];
    const tint = new Color(accent);
    hovered.traverse(node => {
      const material = node.material;
      // Merged meshes share a material with a hidden original; save each material once so restoring cannot reapply the tint.
      if (!node.isMesh || !material?.emissive || saved.some(([seen]) => seen === material)) return;
      saved.push([material, material.emissive.clone(), material.emissiveIntensity]);
      material.emissive.copy(tint); material.emissiveIntensity = 0.4;
    });
    return () => saved.forEach(([material, emissive, intensity]) => { material.emissive.copy(emissive); material.emissiveIntensity = intensity; });
  }, [hovered, accent]);
  // The wall and floor share this root group, so 'over' fires only once; track the nearest hit on every move instead.
  const handlers = {
    onPointerMove: event => { event.stopPropagation(); setHovered(enabled ? labelledAncestor(event.object) : null); },
    onPointerLeave: () => setHovered(null)
  };
  const tooltipPosition = useMemo(() => {
    if (!hovered) return null;
    const box = new Box3().setFromObject(hovered);
    const center = box.getCenter(new Vector3());
    return [center.x, box.max.y + 0.18, center.z];
  }, [hovered]);
  const tooltip = hovered && <Html position={tooltipPosition} center zIndexRange={[20, 10]} style={{ pointerEvents: 'none' }}><span className="desk-tooltip" aria-hidden="true">{hovered.userData.label}</span></Html>;
  return { handlers, tooltip };
}

function DeskWindow({ phase, colors, animate, onCat }) {
  const stars = useRef(null);
  const frame = useRef(null);
  const cat = useRef(null);
  const { reducedMotion } = useContext(DesktopWorkspaceContext);
  const controls = useThree(state => state.controls);
  const zoomBack = useRef(0);
  // The jumpscare pulls the camera in on the window, then returns to where the visitor was looking.
  const leap = useCallback(() => {
    if (!cat.current?.leap()) return;
    onCat();
    if (!controls || reducedMotion) return;
    const position = controls.getPosition(new Vector3()), target = controls.getTarget(new Vector3());
    void controls.setLookAt(4.75, 5.05, 0.2, 4.6, 5.0, -4.9, true);
    window.clearTimeout(zoomBack.current);
    zoomBack.current = window.setTimeout(() => { void controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z, true); }, 2300);
  }, [onCat, controls, reducedMotion]);
  useEffect(() => () => window.clearTimeout(zoomBack.current), []);
  // Every minute or two, while the overview is visible and moving, a cat jumps up at the glass. Clicking the window calls it too.
  useEffect(() => {
    if (!animate) return undefined;
    let timer = 0;
    const schedule = () => { timer = window.setTimeout(() => { leap(); schedule(); }, 60000 + Math.random() * 60000); };
    schedule();
    return () => window.clearTimeout(timer);
  }, [animate, leap]);
  const shake = useCallback(offset => { if (frame.current) frame.current.position.x = 5.2 + offset; }, []);
  useFrame(({ clock }) => {
    if (!animate || !stars.current) return;
    const t = clock.getElapsedTime();
    stars.current.children.forEach((star, index) => star.scale.setScalar(0.7 + 0.45 * Math.abs(Math.sin(t * 0.9 + index * 1.7))));
  });
  const sky = phase === 'day' ? colors.skyDay : phase === 'dusk' ? colors.skyDusk : colors.skyNight;
  return <group ref={frame} position={[5.2, 4.8, -4.93]} userData={{ label: 'Peek outside' }} onClick={event => { event.stopPropagation(); leap(); }}>
    <mesh><boxGeometry args={[3.2, 2.4, 0.12]} /><meshStandardMaterial color={colors.retroShell} roughness={0.8} /></mesh>
    <mesh position={[0, 0, 0.065]}><planeGeometry args={[2.9, 2.1]} /><meshBasicMaterial color={sky} toneMapped={false} /></mesh>
    <WindowLandscape colors={colors} phase={phase} />
    <mesh position={[0, 0, 0.09]}><boxGeometry args={[0.08, 2.1, 0.04]} /><meshStandardMaterial color={colors.retroShell} /></mesh>
    <mesh position={[0, 0, 0.09]}><boxGeometry args={[2.9, 0.08, 0.04]} /><meshStandardMaterial color={colors.retroShell} /></mesh>
    {phase === 'night' && <group ref={stars}>{[[-1, 0.6], [-0.5, 0.25], [0.4, 0.75], [0.95, 0.35], [-0.85, -0.45], [0.6, -0.6]].map(([x, y]) => <mesh key={x + ':' + y} position={[x, y, 0.07]}><planeGeometry args={[0.035, 0.035]} /><meshBasicMaterial color={colors.paper} toneMapped={false} /></mesh>)}</group>}
    <WindowCat ref={cat} colors={colors} still={reducedMotion} onShake={shake} />
  </group>;
}

function DeskObjects({ view, phase, animate, onOpenDesktop, onOpenApp, colors, decor, onBaseMounted }) {
  useEffect(onBaseMounted, [onBaseMounted]);
  const { noteDeskOpen, unlock, warmLamp, playSound } = useRetroOS();
  const spooked = useCallback(() => { playSound('hiss'); unlock('curiosity'); }, [playSound, unlock]);
  const openFromDesk = appId => { noteDeskOpen(appId); onOpenApp(appId); };
  const { openLightbox } = useModal();
  const openPhoto = photo => { noteDeskOpen('after-hours'); openLightbox(photo.src, photo.caption); };
  const openFragrance = item => {
    noteDeskOpen('gear');
    const photo = item.images[0];
    openLightbox(photo.src, photo.caption, item.url, 'View product');
  };
  const photoClick = () => openFromDesk('after-hours');
  // A small deterministic wood map gives the existing desk a material identity without another asset request.
  const wood = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 128;
    const context = canvas.getContext('2d');
    context.fillStyle = colors.board; context.fillRect(0, 0, 256, 128);
    context.strokeStyle = colors.coffee;
    for (let band = 0, y = 1; y < 128; band += 1) {
      y += 1.8 + (Math.sin(band * 4.7) + 1) * 1.5;
      context.globalAlpha = 0.025 + (Math.sin(band * 2.7) + 1) * 0.02;
      context.lineWidth = 0.4 + (Math.cos(band * 1.3) + 1) * 0.3;
      context.beginPath();
      for (let x = 0; x <= 256; x += 4) {
        const grain = y + Math.sin(x * 0.019 + band * 0.8) * 0.9 + Math.sin(x * 0.047 + band) * 0.25;
        if (x === 0) context.moveTo(x, grain); else context.lineTo(x, grain);
      }
      context.stroke();
    }
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace;
    return texture;
  }, [colors.board, colors.coffee]);
  useEffect(() => () => wood.dispose(), [wood]);
  const root = useRef(null);
  const { handlers, tooltip } = useDeskHover(view === 'desk', colors.accent);
  // Every desk mesh casts and receives hard-edged shadows; set once here instead of on each mesh.
  useEffect(() => { root.current?.traverse(node => { if (node.isMesh && !node.material?.transparent) { node.castShadow = true; node.receiveShadow = true; } }); });
  return (
    <group ref={root} {...handlers}>
      {tooltip}
      <RoundedBox args={[12, 0.28, 6.8]} radius={0.045} smoothness={2} position={[0, 0.64, 0]} receiveShadow><meshStandardMaterial map={wood} roughness={0.76} /></RoundedBox>
      <MergeStatic deps={[colors]}>
      <mesh position={[-4.8, -0.4, -2.2]}><boxGeometry args={[0.22, 2.05, 0.22]} /><meshStandardMaterial color={colors.frame} /></mesh>
      <mesh position={[4.8, -0.4, -2.2]}><boxGeometry args={[0.22, 2.05, 0.22]} /><meshStandardMaterial color={colors.frame} /></mesh>
      <mesh position={[-4.8, -0.4, 2.1]}><boxGeometry args={[0.22, 2.05, 0.22]} /><meshStandardMaterial color={colors.frame} /></mesh>
      <mesh position={[4.8, -0.4, 2.1]}><boxGeometry args={[0.22, 2.05, 0.22]} /><meshStandardMaterial color={colors.frame} /></mesh>
      <RoundedBox args={[3.5, 0.02, 1.55]} radius={0.01} smoothness={2} position={[0, 0.79, 1.28]}><meshStandardMaterial color={colors.objectDark} roughness={0.95} /></RoundedBox>
      <RoundedBox args={[0.95, 0.015, 0.95]} radius={0.01} smoothness={2} position={[2.14, 0.787, 1.23]}><meshStandardMaterial color={colors.objectDark} roughness={0.95} /></RoundedBox>
      </MergeStatic>
      <RetroMonitor colors={colors} onOpenDesktop={() => { noteDeskOpen('desktop'); onOpenDesktop(); }} onOpenApp={openFromDesk} />
      <RetroKeyboard colors={colors} onOpenProjects={() => openFromDesk('projects')} />
      <RetroMouse colors={colors} onOpenProjects={() => openFromDesk('projects')} />
      <DeskLamp colors={colors} night={phase === 'night'} /><CoffeeMug colors={colors} /><DeskClock colors={colors} /><RubberDuck colors={colors} />
      <DeskPrinter colors={colors} onPrinted={() => { unlock('paper-trail'); openFromDesk('resume'); }} />
      {decor && <FragranceTray colors={colors} onOpenCollection={() => openFromDesk('gear')} onOpenPhoto={openFragrance} />}
      <MergeStatic deps={[colors]}>
      <group position={[3.05, 0.78, -1.15]} rotation={[0, -0.4, 0]} userData={{ label: 'Contact' }} onClick={event => { event.stopPropagation(); openFromDesk('contact'); }}>
        <mesh position={[0, 0.025, 0]}><cylinderGeometry args={[0.26, 0.28, 0.05, 32]} /><meshStandardMaterial color={colors.objectDark} roughness={0.5} metalness={0.3} /></mesh>
        <mesh position={[0, 0.23, 0]}><cylinderGeometry args={[0.03, 0.03, 0.38, 12]} /><meshStandardMaterial color={colors.objectDark} roughness={0.4} metalness={0.5} /></mesh>
        <mesh position={[0, 0.58, 0]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.17, 0.018, 8, 24, Math.PI]} /><meshStandardMaterial color={colors.objectDark} roughness={0.4} metalness={0.5} /></mesh>
        <mesh position={[0, 0.58, 0]} rotation={[0.18, 0, 0]}><capsuleGeometry args={[0.13, 0.42, 8, 24]} /><meshStandardMaterial color={colors.hardwareBlack} roughness={0.55} /></mesh>
        <mesh position={[0, 0.77, 0.035]} rotation={[0.18, 0, 0]}><cylinderGeometry args={[0.134, 0.134, 0.2, 32]} /><meshStandardMaterial color={colors.hardwareEdge} roughness={0.3} metalness={0.7} /></mesh>
      </group>
      <group position={[-3.9, 0.81, 0.4]} rotation={[-Math.PI / 2, 0, 0]} userData={{ label: 'After Hours' }} onClick={event => { event.stopPropagation(); photoClick(); }}>
        <mesh position={[0.02, 0, -0.025]}><boxGeometry args={[0.82, 1.02, 0.04]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <PhotoPrint src="/images/outside/10.jpg" onClick={photoClick} paper={colors.paper} />
      </group>
      <group position={[-3.3, 0.83, 0.36]} rotation={[-Math.PI / 2, 0, 0.16]} userData={{ label: 'After Hours' }} onClick={photoClick}>
        <mesh position={[0, 0, -0.02]}><boxGeometry args={[0.8, 1, 0.04]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <PhotoPrint src="/images/outside/11.jpg" onClick={photoClick} paper={colors.paper} />
      </group>
      <group position={[0.92, 0.82, 0.55]} rotation={[-Math.PI / 2, 0, -0.12]} userData={{ label: 'Résumé' }} onClick={event => { event.stopPropagation(); openFromDesk('resume'); }}>
        <mesh position={[0, 0, -0.025]}><boxGeometry args={[0.74, 1.02, 0.04]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <mesh position={[0, 0, 0.002]}><planeGeometry args={[0.67, 0.93]} /><meshStandardMaterial color={colors.screen} roughness={0.92} /></mesh>
        <mesh position={[0, 0.28, 0.008]}><boxGeometry args={[0.38, 0.025, 0.01]} /><meshStandardMaterial color={colors.accent} /></mesh>
        <mesh position={[0, 0.16, 0.008]}><boxGeometry args={[0.48, 0.014, 0.01]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <mesh position={[0, 0.08, 0.008]}><boxGeometry args={[0.48, 0.014, 0.01]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <mesh position={[0, 0, 0.008]}><boxGeometry args={[0.45, 0.014, 0.01]} /><meshStandardMaterial color={colors.frame} /></mesh>
      </group>
      </MergeStatic>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.52, 0]} receiveShadow><planeGeometry args={[80, 80]} /><meshStandardMaterial color={colors.world} roughness={0.92} /></mesh>
      <mesh position={[0, 6, -5]}><planeGeometry args={[80, 30]} /><meshStandardMaterial color={colors.wall} roughness={0.95} /></mesh>
      {/* Room decor mounts one frame after the desk so building the scene never blocks the page in one long task. */}
      {decor && <>
        <DeskWindow phase={phase} colors={colors} animate={animate} onCat={spooked} />
        <DeskRoom colors={colors} animate={animate} />
        <CorkBoard colors={colors} onOpen={() => openFromDesk('projects')} />
        <FairyLights colors={colors} animate={animate} lit={warmLamp || phase === 'night'} onOpenPhoto={openPhoto} />
      </>}
      <MergeStatic deps={[colors]}><group position={[2.45, 4.75, -4.94]} userData={{ label: 'Recognition' }} onClick={event => { event.stopPropagation(); openFromDesk('recognition'); }}>
        <mesh><boxGeometry args={[1.05, 0.8, 0.06]} /><meshStandardMaterial color={colors.frame} roughness={0.6} /></mesh>
        <mesh position={[0, 0, 0.035]}><planeGeometry args={[0.9, 0.65]} /><meshStandardMaterial color={colors.paper} roughness={0.9} /></mesh>
        <mesh position={[0, 0.18, 0.04]}><boxGeometry args={[0.5, 0.05, 0.005]} /><meshStandardMaterial color={colors.accent} /></mesh>
        <mesh position={[0, 0.04, 0.04]}><boxGeometry args={[0.62, 0.018, 0.005]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <mesh position={[0, -0.04, 0.04]}><boxGeometry args={[0.5, 0.018, 0.005]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <mesh position={[0.26, -0.19, 0.04]}><circleGeometry args={[0.07, 24]} /><meshStandardMaterial color={colors.accent} /></mesh>
      </group></MergeStatic>
    </group>
  );
}

// CSS-projected HTML has no mipmaps or edge antialiasing, so the shrunken, angled overview desktop looked blurry and jagged.
// In the desk overview the (inert) desktop is shown as a mipmapped snapshot texture instead; the live page returns on focus.
// Capturing blocks the main thread for ~250 ms, so an unchanged desktop (markup, root theme attributes, scroll) reuses the last snapshot.
const SNAPSHOT_DELAY = 250;
const snapshotKey = node => [...document.documentElement.attributes].map(({ name, value }) => `${name}=${value}`).join(' ') + node.innerHTML;
function useScreenSnapshot(node, active) {
  const gl = useThree(state => state.gl);
  const invalidate = useThree(state => state.invalidate);
  const [snapshot, setSnapshot] = useState(null);
  const last = useRef({ texture: null, key: '' });
  useEffect(() => {
    if (!node) return undefined;
    // Scrolling an app window changes the picture without changing the markup.
    const stale = () => { last.current.key = ''; };
    node.addEventListener('scroll', stale, true);
    return () => node.removeEventListener('scroll', stale, true);
  }, [node]);
  useEffect(() => () => last.current.texture?.dispose(), []);
  useEffect(() => {
    if (!active || !node) return undefined;
    let cancelled = false, running = false, again = false, timer = 0;
    const capture = async () => {
      if (running) { again = true; return; }
      const key = snapshotKey(node);
      if (key === last.current.key) { setSnapshot(last.current.texture); invalidate(); return; }
      running = true;
      try {
        const canvas = await domToCanvas(node, { width: 1280, height: 760, scale: 1 });
        if (!cancelled) {
          const texture = new CanvasTexture(canvas);
          texture.colorSpace = SRGBColorSpace;
          texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
          last.current.texture?.dispose();
          last.current = { texture, key };
          setSnapshot(texture);
          invalidate();
        }
      } catch {
        // A failed capture keeps the live projected page visible.
      }
      running = false;
      if (again && !cancelled) { again = false; schedule(); }
    };
    const schedule = () => { clearTimeout(timer); timer = setTimeout(capture, SNAPSHOT_DELAY); };
    // shortcut: text-only changes (the taskbar clock) don't recapture, so the overview clock can lag until the next change; it's unreadable at that size.
    const observer = new MutationObserver(schedule);
    observer.observe(node, { subtree: true, childList: true, attributes: true });
    const themeObserver = new MutationObserver(schedule);
    themeObserver.observe(document.documentElement, { attributes: true });
    if (snapshotKey(node) === last.current.key) capture(); else schedule();
    return () => { cancelled = true; clearTimeout(timer); observer.disconnect(); themeObserver.disconnect(); setSnapshot(null); };
  }, [node, active, gl, invalidate]);
  return active ? snapshot : null;
}

function ScreenProjection({ view, theme, onOpenResume, toggleTheme, onBackToDesk, ContextBridge, portal }) {
  const { screenBooting } = useRetroOS();
  const invalidate = useThree(state => state.invalidate);
  const controls = useThree(state => state.controls);
  const inputCleanup = useRef(null);
  const scrollCleanup = useRef(null);
  const [frameNode, setFrameNode] = useState(null);
  const snapshot = useScreenSnapshot(frameNode, view === 'desk' && !screenBooting);
  const screenReady = useCallback(node => {
    setFrameNode(node);
    inputCleanup.current?.();
    inputCleanup.current = node && view === 'screen' && controls ? bindDesktopCameraInput(node, controls) : null;
    scrollCleanup.current?.();
    scrollCleanup.current = null;
    // scrollIntoView/focus inside the screen also scrolls this overflow-hidden 3D wrapper, which throws the screen out of view.
    const wrapper = node?.closest('.desk-projected-html');
    if (wrapper) {
      const pin = () => { wrapper.scrollTop = 0; wrapper.scrollLeft = 0; };
      wrapper.addEventListener('scroll', pin);
      scrollCleanup.current = () => wrapper.removeEventListener('scroll', pin);
    }
    if (node) invalidate();
  }, [view, controls, invalidate]);
  useEffect(() => () => { inputCleanup.current?.(); scrollCleanup.current?.(); }, []);
  // One fixed size and scale in both views: switching them made the page repaint at the new size before drei re-placed it (a zoom flash).
  // 1280x760 CSS px at distanceFactor 1.2 (1.2/400 units per px) is 3.84x2.28 world units.
  return (
    <>
    {snapshot && <mesh position={[0, MONITOR_CENTER_Y, MONITOR_SCREEN_Z]} raycast={() => null}><planeGeometry args={[3.84, 2.28]} /><meshBasicMaterial map={snapshot} toneMapped={false} /></mesh>}
    <Html portal={portal} transform scale={1} position={[0, MONITOR_CENTER_Y, MONITOR_SCREEN_Z]} distanceFactor={1.2} style={{ width: '1280px', height: '760px', overflow: 'hidden', pointerEvents: view === 'desk' ? 'none' : 'auto' }} wrapperClass={'desk-projected-html' + (snapshot ? ' desk-projected-snapshot' : '')} prepend>
      <div ref={screenReady} className={'desk-projection-frame' + (view === 'desk' ? ' desk-projection-overview' : '')} inert={view === 'desk' ? true : undefined} aria-hidden={view === 'desk' || undefined}>
        <ContextBridge>
          <DesktopWorkspace presentation={view === 'desk' ? 'preview' : 'screen'} theme={theme} toggleTheme={toggleTheme} onBackToDesk={onBackToDesk} />
        </ContextBridge>
        {/* CRT power-on during the room intro: a bright line opens to full height, BIOS text prints, then the desktop shows through. */}
        {screenBooting && <div className="desk-screen-boot" aria-hidden="true"><div className="desk-screen-boot-beam" /><pre className="desk-screen-boot-text">{POST_LINES.map((line, index) => <span key={line} style={{ '--line': index }}>{line + '\n'}</span>)}</pre></div>}
      </div>
    </Html>
    </>
  );
}

// Fit the glass plus a narrow bezel margin in both dimensions at the camera's 38-degree FOV.
function screenPose(aspect) {
  const halfHeight = Math.max(2.6 / 2, 4.12 / (2 * aspect));
  const distance = halfHeight / Math.tan(38 * Math.PI / 360) / 0.92;
  return [0, MONITOR_CENTER_Y, MONITOR_SCREEN_Z + distance, 0, MONITOR_CENTER_Y, MONITOR_SCREEN_Z];
}
// The desk view was framed on a 2.21 aspect screen; narrower screens back the camera up along the same line so the desk still fits.
function deskPose(aspect) {
  const k = Math.min(1.4, Math.max(1, 2.21 / aspect));
  const position = DESK_CAMERA_POSITION.map((value, index) => DESK_CAMERA_TARGET[index] + (value - DESK_CAMERA_TARGET[index]) * k);
  return [...position, ...DESK_CAMERA_TARGET];
}
// The boot intro starts high on the left of the room and orbits round to the desk view (inside the controls' distance and angle limits).
const INTRO_SMOOTH_TIME = 1.0;
function introPose([px, py, pz, tx, ty, tz]) {
  const radius = Math.min(17.5, Math.hypot(px - tx, py - ty, pz - tz) * 1.08);
  const azimuth = -0.6, polar = 1.12;
  return [tx + radius * Math.sin(polar) * Math.sin(azimuth), ty + radius * Math.cos(polar), tz + radius * Math.sin(polar) * Math.cos(azimuth), tx, ty, tz];
}
const SMOOTH_TIME = 0.15;
// Scrolling closer than LOCK locks onto the monitor; scrolling the monitor view out past UNLOCK returns to the desk.
const LOCK_DISTANCE = 5.5;
const UNLOCK_DISTANCE = 6;
// Resting the cursor on the monitor glass (4.22x2.48, as built in RetroMonitor) this long zooms in; leaving the desktop zooms out.
const HOVER_DWELL_MS = 60;
const GLASS_HALF_WIDTH = 2.11;
const GLASS_HALF_HEIGHT = 1.24;

function DeskCamera({ view, ready, reducedMotion, onOpenDesktop, onBackToDesk, onSceneFailure }) {
  const { introKey, claimIntro, endScreenBoot } = useRetroOS();
  const controls = useRef(null);
  const camera = useThree(state => state.camera);
  const canvas = useThree(state => state.gl.domElement);
  const setFrameloop = useThree(state => state.setFrameloop);
  const clock = useThree(state => state.clock);
  const aspect = useThree(state => state.size.width / Math.max(1, state.size.height));
  const DESK_POSE = useMemo(() => deskPose(aspect), [aspect]);
  const SCREEN_POSE = useMemo(() => screenPose(aspect), [aspect]);
  const previous = useRef(null);
  const handoff = useRef(null);
  const recheckHover = useRef(null);
  const introActive = useRef(false);
  const motion = useMemo(() => createDeskCameraMotion(() => controls.current, clock, setFrameloop), [clock, setFrameloop]);
  useEffect(() => () => motion.dispose(), [motion]);
  useEffect(() => {
    const prior = previous.current;
    previous.current = { camera, view, aspect };
    const pose = view === 'screen' ? SCREEN_POSE : DESK_POSE;
    const transition = { view };
    handoff.current = transition;
    const move = (destination, animate, smoothing = SMOOTH_TIME) => {
      void motion.move(destination, animate, smoothing).then(() => {
        if (handoff.current === transition) handoff.current = null;
      }).catch(onSceneFailure);
    };
    // A request to read an app takes precedence over an unfinished boot introduction.
    if (view !== 'desk') claimIntro(introKey);
    if (ready && view === 'desk' && claimIntro(introKey)) {
      // A slow orbit into the desk while the monitor powers on. Starting on the monitor read as a flash of the zoomed-in screen.
      if (reducedMotion) { move(DESK_POSE, false); return; }
      controls.current?.setLookAt(...introPose(DESK_POSE), false);
      introActive.current = true;
      void motion.move(DESK_POSE, true, INTRO_SMOOTH_TIME).then(() => {
        introActive.current = false;
        if (handoff.current === transition) handoff.current = null;
      }).catch(onSceneFailure);
      return;
    }
    follow.current = { x: 0, y: 0, azimuth: 0, polar: 0 };
    followTarget.current = { x: 0, y: 0, azimuth: 0, polar: 0 };
    controls.current?.setFocalOffset(0, 0, 0, false);
    const animate = ready && !reducedMotion && prior?.camera === camera && prior.view !== view && prior.aspect === aspect;
    move(pose, animate);
  }, [camera, view, ready, aspect, reducedMotion, introKey, claimIntro, motion, DESK_POSE, SCREEN_POSE, onSceneFailure]);
  // Any click, scroll or key press during the intro skips straight to the finished desk view.
  useEffect(() => {
    const skip = () => {
      if (!introActive.current) return;
      introActive.current = false;
      endScreenBoot();
      void motion.move(DESK_POSE, false).catch(onSceneFailure);
    };
    const options = { capture: true, passive: true };
    ['pointerdown', 'wheel', 'keydown'].forEach(type => window.addEventListener(type, skip, options));
    return () => ['pointerdown', 'wheel', 'keydown'].forEach(type => window.removeEventListener(type, skip, options));
  }, [motion, DESK_POSE, endScreenBoot, onSceneFailure]);
  const spherical = useMemo(() => new Spherical(), []);
  const cursor = useRef([0, 0]);
  const follow = useRef({ x: 0, y: 0, azimuth: 0, polar: 0 });
  const followTarget = useRef({ x: 0, y: 0, azimuth: 0, polar: 0 });
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => {
    const host = canvas.parentElement;
    if (!host) return undefined;
    const wheel = event => {
      if (!handoff.current || !controls.current?.enabled || !event.deltaY || event.ctrlKey || event.target.closest?.('.desk-projection-frame')) return;
      // Consume only room zoom during a handoff. Desktop scrolling remains native.
      event.preventDefault();
      event.stopPropagation();
      const next = event.deltaY < 0 ? 'screen' : 'desk';
      if (next === handoff.current.view) return;
      handoff.current = { view: next };
      if (next === 'screen') onOpenDesktop(); else onBackToDesk();
    };
    host.addEventListener('wheel', wheel, { capture: true, passive: false });
    return () => host.removeEventListener('wheel', wheel, true);
  }, [canvas, onOpenDesktop, onBackToDesk]);
  // Wheel input fires 'control' before the smoothed camera moves, so compare the destination distance.
  // Passed as a prop because drei recreates the controls instance once the default camera is set.
  const onControl = useCallback(() => {
    if (handoff.current) return;
    if (controls.current) controls.current.smoothTime = SMOOTH_TIME;
    const distance = controls.current?.getSpherical(spherical, true).radius;
    if (view === 'desk' && !reducedMotion) {
      // Scrolling in eases the view toward the monitor before the lock.
      const deskDistance = Math.hypot(DESK_POSE[0] - DESK_POSE[3], DESK_POSE[1] - DESK_POSE[4], DESK_POSE[2] - DESK_POSE[5]);
      followTarget.current = cameraFollowTarget(cursor.current[0], cursor.current[1], zoomProgress(distance, deskDistance, LOCK_DISTANCE), [0, MONITOR_CENTER_Y - DESK_CAMERA_TARGET[1]]);
      invalidate();
    }
    if (view === 'desk' && distance < LOCK_DISTANCE) { handoff.current = { view: 'screen' }; onOpenDesktop(); }
    else if (view === 'screen' && distance > UNLOCK_DISTANCE) { handoff.current = { view: 'desk' }; onBackToDesk(); }
  }, [view, reducedMotion, DESK_POSE, onOpenDesktop, onBackToDesk, spherical, invalidate]);
  // The camera follows the cursor: resting on the monitor glass zooms in, leaving the projected desktop zooms out.
  useEffect(() => {
    const host = canvas.parentElement;
    if (!host || (view !== 'desk' && view !== 'screen')) return undefined;
    const corner = new Vector3();
    let timer = 0, pending = null;
    const clear = () => { clearTimeout(timer); timer = 0; pending = null; };
    const overGlass = event => {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      const xs = [], ys = [];
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        corner.set(sx * GLASS_HALF_WIDTH, MONITOR_CENTER_Y + sy * GLASS_HALF_HEIGHT, MONITOR_SCREEN_Z).project(camera);
        xs.push(corner.x); ys.push(corner.y);
      }
      return x >= Math.min(...xs) && x <= Math.max(...xs) && y >= Math.min(...ys) && y <= Math.max(...ys);
    };
    let last = null;
    const evaluate = event => {
      // Window drags/resizes and camera orbits (buttons held) never switch views, nor does a running transition.
      if (handoff.current || event.buttons) return clear();
      const inside = view === 'desk' ? overGlass(event) : Boolean(event.target.closest?.('.desk-projection-frame'));
      const next = view === 'desk' ? (inside ? 'screen' : null) : (inside ? null : 'desk');
      if (next === pending) return;
      clear();
      if (!next) return;
      pending = next;
      timer = setTimeout(() => {
        clear();
        if (handoff.current) return;
        handoff.current = { view: next };
        if (next === 'screen') onOpenDesktop(); else onBackToDesk();
      }, HOVER_DWELL_MS);
    };
    const move = event => { last = { clientX: event.clientX, clientY: event.clientY, buttons: event.buttons, target: event.target }; evaluate(last); };
    // The camera keeps easing under a still cursor (cursor follow), so re-test the last pointer position each frame, not only on pointer moves.
    recheckHover.current = view === 'desk' ? () => { if (last) evaluate(last); } : null;
    host.addEventListener('pointermove', move, { passive: true });
    const leave = () => { last = null; clear(); };
    host.addEventListener('pointerleave', leave);
    window.addEventListener('blur', clear);
    return () => { recheckHover.current = null; clear(); host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave); window.removeEventListener('blur', clear); };
  }, [canvas, camera, view, onOpenDesktop, onBackToDesk]);
  // The desk view turns and drifts with the cursor, eased per frame (a ~0.1 s response); it returns to centre when the cursor leaves.
  useEffect(() => {
    const host = canvas.parentElement;
    if (!host || view !== 'desk' || reducedMotion) return undefined;
    const zero = { x: 0, y: 0, azimuth: 0, polar: 0 };
    const settle = () => { cursor.current = [0, 0]; followTarget.current = zero; invalidate(); };
    const move = event => {
      if (handoff.current || event.buttons || event.target.closest?.('.desk-projection-frame')) return;
      const rect = canvas.getBoundingClientRect();
      cursor.current = [((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1)];
      const distance = controls.current?.getSpherical(spherical, false).radius;
      const deskDistance = Math.hypot(DESK_POSE[0] - DESK_POSE[3], DESK_POSE[1] - DESK_POSE[4], DESK_POSE[2] - DESK_POSE[5]);
      followTarget.current = cameraFollowTarget(cursor.current[0], cursor.current[1], zoomProgress(distance, deskDistance, LOCK_DISTANCE), [0, MONITOR_CENTER_Y - DESK_CAMERA_TARGET[1]]);
      invalidate();
    };
    host.addEventListener('pointermove', move, { passive: true });
    host.addEventListener('pointerleave', settle);
    window.addEventListener('blur', settle);
    return () => { host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', settle); window.removeEventListener('blur', settle); settle(); };
  }, [canvas, view, reducedMotion, DESK_POSE, spherical, invalidate]);
  useFrame((_, delta) => {
    recheckHover.current?.();
    const c = controls.current, f = follow.current, t = followTarget.current;
    if (!c || (f.x === t.x && f.y === t.y && f.azimuth === t.azimuth && f.polar === t.polar)) return;
    const dt = Math.min(delta, 0.05);
    const next = view === 'desk' && !reducedMotion
      ? { x: easeToward(f.x, t.x, dt, FOLLOW_TAU), y: easeToward(f.y, t.y, dt, FOLLOW_TAU), azimuth: easeToward(f.azimuth, t.azimuth, dt, FOLLOW_TAU), polar: easeToward(f.polar, t.polar, dt, FOLLOW_TAU) }
      : { ...t };
    // Snap the last sliver so the scene can sleep.
    const near = Math.abs(next.x - t.x) + Math.abs(next.y - t.y) + Math.abs(next.azimuth - t.azimuth) + Math.abs(next.polar - t.polar) < 1e-3;
    const applied = near ? { ...t } : next;
    c.setFocalOffset(applied.x, applied.y, 0, false);
    c.rotate(applied.azimuth - f.azimuth, applied.polar - f.polar, false);
    follow.current = applied;
    if (!near) invalidate();
  });
  return <><PerspectiveCamera makeDefault position={DESK_CAMERA_POSITION} fov={38} /><CameraControls ref={controls} makeDefault onControl={onControl} smoothTime={SMOOTH_TIME} draggingSmoothTime={0.18} dollySpeed={0.75} restThreshold={0.01} minDistance={3.5} maxDistance={18} minPolarAngle={0.65} maxPolarAngle={1.42} maxAzimuthAngle={0.8} minAzimuthAngle={-0.8} /></>;
}

// Requests ~30 frames a second only while ambient motion is active; otherwise the demand-rendered scene sleeps.
// Driven by requestAnimationFrame so frames land on display refreshes (a timer drifts against vsync and judders).
function AmbientDriver({ active }) {
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => {
    if (!active) return undefined;
    let id = 0, last = 0;
    const tick = now => {
      // 2 ms slack: on a 60 Hz display every second refresh qualifies instead of alternating 2 and 3.
      if (now - last >= 31) { last = now; invalidate(); }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [active, invalidate]);
  return null;
}

// Light and geometry rarely move, so the shadow map is redrawn at most ~8 times a second, and immediately when the room changes.
// When `frozen`, only room changes redraw it: the periodic refresh mainly follows the swaying plant and polaroids.
function ShadowRefresh({ changeKey, frozen }) {
  const gl = useThree(state => state.gl);
  const invalidate = useThree(state => state.invalidate);
  const last = useRef(0);
  useLayoutEffect(() => {
    gl.shadowMap.autoUpdate = false;
    return () => { gl.shadowMap.autoUpdate = true; };
  }, [gl]);
  useEffect(() => { gl.shadowMap.needsUpdate = true; invalidate(); }, [gl, invalidate, changeKey]);
  useFrame(() => {
    const now = performance.now();
    if (frozen || now - last.current < 125) return;
    last.current = now;
    gl.shadowMap.needsUpdate = true;
  });
  return null;
}

// Slow machines step down once each: 1x pixel ratio, then a frozen shadow map, then no ambient motion. None of the
// steps recompiles shaders (switching shadows off did, freezing for seconds on exactly these machines).
// Measured only on ambient frames, whose ~33 ms cadence is known; a median above 45 ms means the machine cannot keep up.
function AdaptiveQuality({ active, onLevel }) {
  const setDpr = useThree(state => state.setDpr);
  const invalidate = useThree(state => state.invalidate);
  const samples = useRef([]);
  const level = useRef(0);
  useFrame((_, delta) => {
    if (!active || level.current >= 3) { samples.current.length = 0; return; }
    samples.current.push(delta);
    if (samples.current.length < 45) return;
    const median = samples.current.sort((a, b) => a - b)[22];
    samples.current.length = 0;
    if (median <= 0.045) return;
    level.current += 1;
    if (level.current === 1) setDpr(1);
    onLevel(level.current);
    invalidate();
  });
  return null;
}

function usePageVisible() {
  const [visible, setVisible] = useState(() => document.visibilityState !== 'hidden');
  useEffect(() => {
    const update = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return visible;
}

// Mounts only after every suspended desk asset (e.g. the photo texture) has loaded. Shaders are compiled and
// textures uploaded behind the loading panel, so the first frames and first camera turns do not stall on them.
// Shaders are compiled with the optional lamp/fairy lights both on and off, so switching them later reuses programs.
function SceneReady({ onReady }) {
  const gl = useThree(state => state.gl);
  const scene = useThree(state => state.scene);
  const camera = useThree(state => state.camera);
  useEffect(() => {
    let cancelled = false;
    scene.traverse(node => [node.material].flat().forEach(material => {
      if (material) Object.values(material).forEach(value => { if (value?.isTexture) gl.initTexture(value); });
    }));
    const optional = [];
    scene.traverse(node => { if (node.userData.optionalLight) optional.push([node, node.visible]); });
    const compile = async () => {
      optional.forEach(([light]) => { light.visible = true; });
      await gl.compileAsync(scene, camera);
      optional.forEach(([light]) => { light.visible = false; });
      await gl.compileAsync(scene, camera);
    };
    compile().catch(() => {}).finally(() => {
      optional.forEach(([light, visible]) => { light.visible = visible; });
      if (!cancelled) onReady();
    });
    return () => { cancelled = true; };
  }, [gl, scene, camera, onReady]);
  return null;
}

function readPalette() {
  return {
    world: readColor('--desk-world', '#292a27'),
    wall: readColor('--desk-wall', '#3b3c35'),
    wainscot: readColor('--desk-wainscot'), trim: readColor('--desk-trim'),
    floor: readColor('--desk-floor'), floorAlternate: readColor('--desk-floor-alternate'),
    landFar: readColor('--desk-land-far'), landNear: readColor('--desk-land-near'), leafLight: readColor('--desk-leaf-light'),
    skyDay: readColor('--desk-sky-day'), skyDusk: readColor('--desk-sky-dusk'), skyNight: readColor('--desk-sky-night'),
    board: readColor('--desk-board', '#544136'),
    frame: readColor('--desk-frame', '#393936'),
    objectDark: readColor('--desk-object-dark', '#1a1b1a'),
    hawasTop: readColor('--desk-hawas-top'), hawasBlue: readColor('--desk-hawas-blue'), hawasBase: readColor('--desk-hawas-base'),
    hawasCap: readColor('--desk-hawas-cap'), hawasInk: readColor('--desk-hawas-ink'),
    fragranceStone: readColor('--desk-fragrance-stone'), fragranceBrown: readColor('--desk-fragrance-brown'), fragranceGold: readColor('--desk-fragrance-gold'),
    fragranceRed: readColor('--desk-fragrance-red'), fragranceSilver: readColor('--desk-fragrance-silver'),
    screen: readColor('--desk-screen', '#151617'),
    key: readColor('--desk-key', '#202125'),
    accent: readColor('--desk-accent', '#ad7852'),
    paper: readColor('--desk-paper', '#f0e9df'),
    hardwareBlack: readColor('--desk-hardware-black', '#151619'),
    hardwareEdge: readColor('--desk-hardware-edge', '#303237'),
    hardwareDetail: readColor('--desk-hardware-detail', '#72757d'),
    displayGlass: readColor('--desk-display-glass', '#11151b'),
    purpleLed: readColor('--desk-purple-led', '#8e47e6'),
    keyLegend: readColor('--desk-key-legend', '#aaa1ba'),
    retroShell: readColor('--desk-retro-shell'), retroEdge: readColor('--desk-retro-edge'),
    retroKey: readColor('--desk-retro-key'), retroRecess: readColor('--desk-retro-recess'),
    noteYellow: readColor('--desk-note-yellow'), noteGreen: readColor('--desk-note-green'),
    noteInk: readColor('--desk-note-ink'), badge: readColor('--desk-badge'), led: readColor('--desk-led'),
    lamp: readColor('--desk-lamp'), mug: readColor('--desk-mug'), coffee: readColor('--desk-coffee'),
    curtain: readColor('--desk-curtain'), curtainRod: readColor('--desk-curtain-rod'), plant: readColor('--desk-plant'), pot: readColor('--desk-pot'),
    rug: readColor('--desk-rug'), rugEdge: readColor('--desk-rug-edge'), cork: readColor('--desk-cork'), pin: readColor('--desk-pin'),
    books: [readColor('--desk-book-a'), readColor('--desk-book-b'), readColor('--desk-book-c')], nightWarm: readColor('--desk-night-warm'),
    daylight: readColor('--desk-daylight'), keyLight: readColor('--desk-key-light'),
    fairyBulb: readColor('--desk-fairy-bulb'), fairyWire: readColor('--desk-fairy-wire'),
    catFur: readColor('--desk-cat-fur', '#141414'), catEye: readColor('--desk-cat-eye', '#f2d23c'), catPink: readColor('--desk-cat-pink', '#d98a96')
  };
}

export default function DeskScene({ view, theme, reducedMotion, onOpenDesktop, onOpenApp, onOpenResume, toggleTheme, onBackToDesk, onSceneFailure, onLoading, onReady }) {
  const contextLostCleanup = useRef(null);
  const screenPortal = useRef(null);
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => { setReady(true); onReady(); }, [onReady]);
  // Decor follows the desk's first commit by a frame; a transition keeps the desk shown while decor textures load.
  const [decor, setDecor] = useState(false);
  const mountDecor = useCallback(() => {
    const id = requestAnimationFrame(() => startTransition(() => setDecor(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  useLayoutEffect(() => { onLoading(); }, [onLoading]);
  const ContextBridge = useContextBridge(DesktopWorkspaceContext, ModalContext, RetroOSContext);
  // Read after ThemeProvider's layout effect has switched data-theme, so the room never shows the previous theme's colors.
  const [palette, setPalette] = useState(readPalette);
  useEffect(() => {
    setPalette(current => { const next = readPalette(); return JSON.stringify(next) === JSON.stringify(current) ? current : next; });
  }, [theme]);
  const motionReduced = Boolean(reducedMotion);
  const phase = roomPhase(useMinuteClock());
  const light = ROOM_LIGHT[phase];
  const pageVisible = usePageVisible();
  const [qualityLevel, setQualityLevel] = useState(0);
  const animate = ready && view === 'desk' && !motionReduced && pageVisible && qualityLevel < 3;
  // The desk clock ticks softly while the whole room is in view.
  const { playSound, warmLamp } = useRetroOS();
  useEffect(() => {
    if (!ready || view !== 'desk' || !pageVisible) return undefined;
    const id = window.setInterval(() => playSound('tick'), 1000);
    return () => window.clearInterval(id);
  }, [ready, view, pageVisible, playSound]);

  useEffect(() => () => contextLostCleanup.current?.(), []);

  return (
    <>
    <Canvas
      className="desk-canvas"
      data-room-phase={phase}
      dpr={[1, 1.25]}
      frameloop="demand"
      events={desktopSceneEvents}
      shadows
      gl={{ antialias: (window.devicePixelRatio || 1) < 1.5, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        screenPortal.current = gl.domElement.parentNode;
        const onContextLost = event => { event.preventDefault(); onSceneFailure(); };
        gl.domElement.addEventListener('webglcontextlost', onContextLost);
        contextLostCleanup.current = () => gl.domElement.removeEventListener('webglcontextlost', onContextLost);
        gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
      }}
    >
      <ContextBridge>
        <color attach="background" args={[palette.world]} />
        <ambientLight intensity={light.ambient} color={phase === 'night' ? palette.nightWarm : palette.daylight} />
        <AmbientDriver active={animate} />
        <AdaptiveQuality active={animate} onLevel={setQualityLevel} />
        <ShadowRefresh changeKey={[ready, phase, theme, view, animate, warmLamp].join('|')} frozen={qualityLevel >= 2} />
        <directionalLight position={[-4, 7, 3]} intensity={light.key} color={palette.keyLight} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} shadow-normalBias={0.02} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-camera-near={1} shadow-camera-far={25} />
        <directionalLight position={[0, 3, 6]} intensity={light.fill} color={palette.daylight} />
        <directionalLight position={[6, 5, -4]} intensity={light.window} color={phase === 'dusk' ? palette.accent : palette.skyDay} />
        <DeskCamera view={view} ready={ready} reducedMotion={motionReduced} onOpenDesktop={onOpenDesktop} onBackToDesk={onBackToDesk} onSceneFailure={onSceneFailure} />
        <Suspense fallback={null}>
          <DeskObjects view={view} phase={phase} animate={animate} onOpenDesktop={onOpenDesktop} onOpenApp={onOpenApp} colors={palette} decor={decor} onBaseMounted={mountDecor} />
          {decor && <SceneReady onReady={markReady} />}
        </Suspense>
        <ScreenProjection view={view} theme={theme} onOpenResume={onOpenResume} toggleTheme={toggleTheme} onBackToDesk={onBackToDesk} ContextBridge={ContextBridge} portal={screenPortal} />
      </ContextBridge>
    </Canvas>
    </>
  );
}

export class DeskSceneBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { this.props.onError?.(error); }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
