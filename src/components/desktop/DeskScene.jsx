import React, { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, events, useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Html, PerspectiveCamera, RoundedBox, useContextBridge, useCursor, useTexture } from '@react-three/drei';
import { Box3, CanvasTexture, Color, SRGBColorSpace, Spherical, Vector3 } from 'three';
import DesktopWorkspace from './DesktopWorkspace';
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
import FragranceTray from './FragranceTray';
import { CoffeeMug, DeskClock, DeskLamp, DeskPrinter, DESK_CAMERA_POSITION, DESK_CAMERA_TARGET, RetroMonitor, MONITOR_CENTER_Y, MONITOR_SCREEN_Z, RetroKeyboard, RetroMouse } from './DeskPeripherals';

function readColor(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function desktopSceneEvents(store) {
  const manager = events(store);
  return { ...manager, compute: (event, state, previous) => computeDesktopScenePointer(event, state, previous, manager.compute) };
}

function PhotoPrint({ onClick, paper }) {
  const texture = useTexture('/images/outside/1.jpg');
  texture.colorSpace = SRGBColorSpace;
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
  useCursor(Boolean(hovered));
  useEffect(() => { if (!enabled) setHovered(null); }, [enabled]);
  useEffect(() => {
    if (!hovered) return undefined;
    const saved = [];
    const tint = new Color(accent);
    hovered.traverse(node => {
      const material = node.material;
      if (!node.isMesh || !material?.emissive) return;
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

function DeskWindow({ phase, colors, animate }) {
  const stars = useRef(null);
  useFrame(({ clock }) => {
    if (!animate || !stars.current) return;
    const t = clock.getElapsedTime();
    stars.current.children.forEach((star, index) => star.scale.setScalar(0.7 + 0.45 * Math.abs(Math.sin(t * 0.9 + index * 1.7))));
  });
  const sky = phase === 'day' ? colors.skyDay : phase === 'dusk' ? colors.skyDusk : colors.skyNight;
  return <group position={[5.2, 4.8, -4.93]}>
    <mesh><boxGeometry args={[3.2, 2.4, 0.12]} /><meshStandardMaterial color={colors.retroShell} roughness={0.8} /></mesh>
    <mesh position={[0, 0, 0.065]}><planeGeometry args={[2.9, 2.1]} /><meshBasicMaterial color={sky} toneMapped={false} /></mesh>
    <WindowLandscape colors={colors} phase={phase} />
    <mesh position={[0, 0, 0.09]}><boxGeometry args={[0.08, 2.1, 0.04]} /><meshStandardMaterial color={colors.retroShell} /></mesh>
    <mesh position={[0, 0, 0.09]}><boxGeometry args={[2.9, 0.08, 0.04]} /><meshStandardMaterial color={colors.retroShell} /></mesh>
    {phase === 'night' && <group ref={stars}>{[[-1, 0.6], [-0.5, 0.25], [0.4, 0.75], [0.95, 0.35], [-0.85, -0.45], [0.6, -0.6]].map(([x, y]) => <mesh key={x + ':' + y} position={[x, y, 0.07]}><planeGeometry args={[0.035, 0.035]} /><meshBasicMaterial color={colors.paper} toneMapped={false} /></mesh>)}</group>}
  </group>;
}

function DeskObjects({ view, phase, animate, onOpenDesktop, onOpenApp, colors }) {
  const { noteDeskOpen, unlock, warmLamp } = useRetroOS();
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
      <mesh position={[-4.8, -0.4, -2.2]}><boxGeometry args={[0.22, 2.05, 0.22]} /><meshStandardMaterial color={colors.frame} /></mesh>
      <mesh position={[4.8, -0.4, -2.2]}><boxGeometry args={[0.22, 2.05, 0.22]} /><meshStandardMaterial color={colors.frame} /></mesh>
      <mesh position={[-4.8, -0.4, 2.1]}><boxGeometry args={[0.22, 2.05, 0.22]} /><meshStandardMaterial color={colors.frame} /></mesh>
      <mesh position={[4.8, -0.4, 2.1]}><boxGeometry args={[0.22, 2.05, 0.22]} /><meshStandardMaterial color={colors.frame} /></mesh>
      <RetroMonitor colors={colors} onOpenDesktop={() => { noteDeskOpen('desktop'); onOpenDesktop(); }} onOpenApp={openFromDesk} />
      <RoundedBox args={[3.5, 0.02, 1.55]} radius={0.01} smoothness={2} position={[0, 0.79, 1.28]}><meshStandardMaterial color={colors.objectDark} roughness={0.95} /></RoundedBox>
      <RoundedBox args={[0.95, 0.015, 0.95]} radius={0.01} smoothness={2} position={[2.14, 0.787, 1.23]}><meshStandardMaterial color={colors.objectDark} roughness={0.95} /></RoundedBox>
      <RetroKeyboard colors={colors} onOpenProjects={() => openFromDesk('projects')} />
      <RetroMouse colors={colors} onOpenProjects={() => openFromDesk('projects')} />
      <DeskLamp colors={colors} night={phase === 'night'} /><CoffeeMug colors={colors} /><DeskClock colors={colors} />
      <DeskPrinter colors={colors} onPrinted={() => { unlock('paper-trail'); openFromDesk('resume'); }} />
      <FragranceTray colors={colors} onOpenCollection={() => openFromDesk('gear')} onOpenPhoto={openFragrance} />
      <group position={[3.05, 0.78, -1.15]} rotation={[0, -0.4, 0]} userData={{ label: 'Contact' }} onClick={event => { event.stopPropagation(); openFromDesk('contact'); }}>
        <mesh position={[0, 0.025, 0]}><cylinderGeometry args={[0.26, 0.28, 0.05, 32]} /><meshStandardMaterial color={colors.objectDark} roughness={0.5} metalness={0.3} /></mesh>
        <mesh position={[0, 0.23, 0]}><cylinderGeometry args={[0.03, 0.03, 0.38, 12]} /><meshStandardMaterial color={colors.objectDark} roughness={0.4} metalness={0.5} /></mesh>
        <mesh position={[0, 0.58, 0]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.17, 0.018, 8, 24, Math.PI]} /><meshStandardMaterial color={colors.objectDark} roughness={0.4} metalness={0.5} /></mesh>
        <mesh position={[0, 0.58, 0]} rotation={[0.18, 0, 0]}><capsuleGeometry args={[0.13, 0.42, 8, 24]} /><meshStandardMaterial color={colors.hardwareBlack} roughness={0.55} /></mesh>
        <mesh position={[0, 0.77, 0.035]} rotation={[0.18, 0, 0]}><cylinderGeometry args={[0.134, 0.134, 0.2, 32]} /><meshStandardMaterial color={colors.hardwareEdge} roughness={0.3} metalness={0.7} /></mesh>
      </group>
      <group position={[-3.9, 0.81, 0.4]} rotation={[-Math.PI / 2, 0, 0]} userData={{ label: 'After Hours' }} onClick={event => { event.stopPropagation(); photoClick(); }}>
        <mesh position={[0.02, 0, -0.025]}><boxGeometry args={[0.82, 1.02, 0.04]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <PhotoPrint onClick={photoClick} paper={colors.paper} />
      </group>
      <group position={[-3.3, 0.83, 0.36]} rotation={[-Math.PI / 2, 0, 0.16]} userData={{ label: 'After Hours' }} onClick={photoClick}>
        <mesh position={[0, 0, -0.02]}><boxGeometry args={[0.8, 1, 0.04]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <PhotoPrint onClick={photoClick} paper={colors.paper} />
      </group>
      <group position={[0.92, 0.82, 0.55]} rotation={[-Math.PI / 2, 0, -0.12]} userData={{ label: 'Résumé' }} onClick={event => { event.stopPropagation(); openFromDesk('resume'); }}>
        <mesh position={[0, 0, -0.025]}><boxGeometry args={[0.74, 1.02, 0.04]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <mesh position={[0, 0, 0.002]}><planeGeometry args={[0.67, 0.93]} /><meshStandardMaterial color={colors.screen} roughness={0.92} /></mesh>
        <mesh position={[0, 0.28, 0.008]}><boxGeometry args={[0.38, 0.025, 0.01]} /><meshStandardMaterial color={colors.accent} /></mesh>
        <mesh position={[0, 0.16, 0.008]}><boxGeometry args={[0.48, 0.014, 0.01]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <mesh position={[0, 0.08, 0.008]}><boxGeometry args={[0.48, 0.014, 0.01]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <mesh position={[0, 0, 0.008]}><boxGeometry args={[0.45, 0.014, 0.01]} /><meshStandardMaterial color={colors.frame} /></mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.52, 0]} receiveShadow><planeGeometry args={[80, 80]} /><meshStandardMaterial color={colors.world} roughness={0.92} /></mesh>
      <mesh position={[0, 6, -5]}><planeGeometry args={[80, 30]} /><meshStandardMaterial color={colors.wall} roughness={0.95} /></mesh>
      <DeskWindow phase={phase} colors={colors} animate={animate} />
      <DeskRoom colors={colors} animate={animate} lampOn={warmLamp || phase === 'night'} />
      <CorkBoard colors={colors} onOpen={() => openFromDesk('projects')} />
      <FairyLights colors={colors} animate={animate} lit={warmLamp || phase === 'night'} onOpenPhoto={openPhoto} />
      <group position={[2.45, 4.75, -4.94]} userData={{ label: 'Recognition' }} onClick={event => { event.stopPropagation(); openFromDesk('recognition'); }}>
        <mesh><boxGeometry args={[1.05, 0.8, 0.06]} /><meshStandardMaterial color={colors.frame} roughness={0.6} /></mesh>
        <mesh position={[0, 0, 0.035]}><planeGeometry args={[0.9, 0.65]} /><meshStandardMaterial color={colors.paper} roughness={0.9} /></mesh>
        <mesh position={[0, 0.18, 0.04]}><boxGeometry args={[0.5, 0.05, 0.005]} /><meshStandardMaterial color={colors.accent} /></mesh>
        <mesh position={[0, 0.04, 0.04]}><boxGeometry args={[0.62, 0.018, 0.005]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <mesh position={[0, -0.04, 0.04]}><boxGeometry args={[0.5, 0.018, 0.005]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <mesh position={[0.26, -0.19, 0.04]}><circleGeometry args={[0.07, 24]} /><meshStandardMaterial color={colors.accent} /></mesh>
      </group>
    </group>
  );
}

function ScreenProjection({ view, theme, onOpenResume, toggleTheme, onBackToDesk, ContextBridge, portal }) {
  const invalidate = useThree(state => state.invalidate);
  const controls = useThree(state => state.controls);
  const inputCleanup = useRef(null);
  const scrollCleanup = useRef(null);
  const screenReady = useCallback(node => {
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
  return (
    <Html portal={portal} transform scale={view === 'desk' ? 0.5 : 1} position={[0, MONITOR_CENTER_Y, MONITOR_SCREEN_Z]} distanceFactor={1.2} style={{ width: view === 'desk' ? '2560px' : '1280px', height: view === 'desk' ? '1520px' : '760px', overflow: 'hidden', pointerEvents: view === 'desk' ? 'none' : 'auto' }} wrapperClass="desk-projected-html" prepend>
      <div ref={screenReady} className={'desk-projection-frame' + (view === 'desk' ? ' desk-projection-overview' : '')} inert={view === 'desk' ? true : undefined} aria-hidden={view === 'desk' || undefined}>
        <ContextBridge>
          <DesktopWorkspace presentation={view === 'desk' ? 'preview' : 'screen'} theme={theme} toggleTheme={toggleTheme} onBackToDesk={onBackToDesk} />
        </ContextBridge>
      </div>
    </Html>
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
const SMOOTH_TIME = 0.30;
// Scrolling closer than this locks onto the monitor; scrolling the monitor view out past UNLOCK returns to the desk.
const LOCK_DISTANCE = 5.5;
const UNLOCK_DISTANCE = 6;

function DeskCamera({ view, ready, reducedMotion, onOpenDesktop, onBackToDesk, onSceneFailure }) {
  const { introKey, claimIntro } = useRetroOS();
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
      controls.current?.setLookAt(...SCREEN_POSE, false);
      move(DESK_POSE, !reducedMotion, 0.45);
      return;
    }
    const animate = ready && !reducedMotion && prior?.camera === camera && prior.view !== view && prior.aspect === aspect;
    move(pose, animate);
  }, [camera, view, ready, aspect, reducedMotion, introKey, claimIntro, motion, DESK_POSE, SCREEN_POSE, onSceneFailure]);
  const spherical = useMemo(() => new Spherical(), []);
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
    if (view === 'desk' && distance < LOCK_DISTANCE) { handoff.current = { view: 'screen' }; onOpenDesktop(); }
    else if (view === 'screen' && distance > UNLOCK_DISTANCE) { handoff.current = { view: 'desk' }; onBackToDesk(); }
  }, [view, onOpenDesktop, onBackToDesk, spherical]);
  return <><PerspectiveCamera makeDefault position={DESK_CAMERA_POSITION} fov={38} /><CameraControls ref={controls} makeDefault onControl={onControl} smoothTime={SMOOTH_TIME} draggingSmoothTime={0.18} dollySpeed={0.75} restThreshold={0.01} minDistance={3.5} maxDistance={18} minPolarAngle={0.65} maxPolarAngle={1.42} maxAzimuthAngle={0.8} minAzimuthAngle={-0.8} /></>;
}

// Requests ~30 frames a second only while ambient motion is active; otherwise the demand-rendered scene sleeps.
function AmbientDriver({ active }) {
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => {
    if (!active) return undefined;
    const id = window.setInterval(() => invalidate(), 33);
    return () => window.clearInterval(id);
  }, [active, invalidate]);
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

// Mounts only after every suspended desk asset (e.g. the photo texture) has loaded.
function SceneReady({ onReady }) {
  useEffect(onReady, [onReady]);
  return null;
}

export default function DeskScene({ view, theme, reducedMotion, onOpenDesktop, onOpenApp, onOpenResume, toggleTheme, onBackToDesk, onSceneFailure, onLoading, onReady }) {
  const contextLostCleanup = useRef(null);
  const screenPortal = useRef(null);
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => { setReady(true); onReady(); }, [onReady]);
  useLayoutEffect(() => { onLoading(); }, [onLoading]);
  const ContextBridge = useContextBridge(DesktopWorkspaceContext, ModalContext, RetroOSContext);
  const palette = useMemo(() => ({
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
    fairyBulb: readColor('--desk-fairy-bulb'), fairyWire: readColor('--desk-fairy-wire')
  }), [theme]);
  const motionReduced = Boolean(reducedMotion);
  const phase = roomPhase(useMinuteClock());
  const light = ROOM_LIGHT[phase];
  const pageVisible = usePageVisible();
  const animate = ready && view === 'desk' && !motionReduced && pageVisible;

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
      gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }}
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
        <directionalLight position={[-4, 7, 3]} intensity={light.key} color={palette.keyLight} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} shadow-normalBias={0.02} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-camera-near={1} shadow-camera-far={25} />
        <directionalLight position={[0, 3, 6]} intensity={light.fill} color={palette.daylight} />
        <directionalLight position={[6, 5, -4]} intensity={light.window} color={phase === 'dusk' ? palette.accent : palette.skyDay} />
        <DeskCamera view={view} ready={ready} reducedMotion={motionReduced} onOpenDesktop={onOpenDesktop} onBackToDesk={onBackToDesk} onSceneFailure={onSceneFailure} />
        <Suspense fallback={null}>
          <DeskObjects view={view} phase={phase} animate={animate} onOpenDesktop={onOpenDesktop} onOpenApp={onOpenApp} colors={palette} />
          <SceneReady onReady={markReady} />
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
