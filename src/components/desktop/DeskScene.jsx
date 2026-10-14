import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, events, useThree } from '@react-three/fiber';
import { CameraControls, Html, PerspectiveCamera, RoundedBox, useContextBridge, useCursor, useTexture } from '@react-three/drei';
import { Box3, Color, SRGBColorSpace, Spherical, Vector3 } from 'three';
import DesktopWorkspace from './DesktopWorkspace';
import { bindDesktopCameraInput, computeDesktopScenePointer } from './desktopCameraInput';
import { DesktopWorkspaceContext } from '../../context/DesktopWorkspaceContext';
import { ModalContext } from '../../context/ModalContext';
import { RetroOSContext, useRetroOS } from '../../context/RetroOSContext';
import { CoffeeMug, DeskClock, DeskLamp, DESK_CAMERA_POSITION, DESK_CAMERA_TARGET, RetroMonitor, MONITOR_CENTER_Y, MONITOR_SCREEN_Z, RetroKeyboard, RetroMouse } from './DeskPeripherals';

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
      material.emissive.copy(tint); material.emissiveIntensity = 0.25;
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

function DeskObjects({ view, onOpenDesktop, onOpenApp, colors }) {
  const photoClick = () => onOpenApp('after-hours');
  const root = useRef(null);
  const { handlers, tooltip } = useDeskHover(view === 'desk', colors.accent);
  // Every desk mesh casts and receives hard-edged shadows; set once here instead of on each mesh.
  useEffect(() => { root.current?.traverse(node => { if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; } }); });
  return (
    <group ref={root} {...handlers}>
      {tooltip}
      <mesh position={[0, 0.64, 0]} receiveShadow><boxGeometry args={[12, 0.28, 6.8]} /><meshStandardMaterial color={colors.board} roughness={0.78} /></mesh>
      <mesh position={[-4.8, -0.4, -2.2]}><boxGeometry args={[0.22, 2.05, 0.22]} /><meshStandardMaterial color={colors.frame} /></mesh>
      <mesh position={[4.8, -0.4, -2.2]}><boxGeometry args={[0.22, 2.05, 0.22]} /><meshStandardMaterial color={colors.frame} /></mesh>
      <mesh position={[-4.8, -0.4, 2.1]}><boxGeometry args={[0.22, 2.05, 0.22]} /><meshStandardMaterial color={colors.frame} /></mesh>
      <mesh position={[4.8, -0.4, 2.1]}><boxGeometry args={[0.22, 2.05, 0.22]} /><meshStandardMaterial color={colors.frame} /></mesh>
      <RetroMonitor colors={colors} onOpenDesktop={onOpenDesktop} onOpenApp={onOpenApp} />
      <RoundedBox args={[3.5, 0.02, 1.55]} radius={0.01} smoothness={2} position={[0, 0.79, 1.28]}><meshStandardMaterial color={colors.objectDark} roughness={0.95} /></RoundedBox>
      <RoundedBox args={[0.95, 0.015, 0.95]} radius={0.01} smoothness={2} position={[2.14, 0.787, 1.23]}><meshStandardMaterial color={colors.objectDark} roughness={0.95} /></RoundedBox>
      <RetroKeyboard colors={colors} onOpenProjects={() => onOpenApp('projects')} />
      <RetroMouse colors={colors} onOpenProjects={() => onOpenApp('projects')} />
      <DeskLamp colors={colors} /><CoffeeMug colors={colors} /><DeskClock colors={colors} />
      <group position={[3.75, 0.78, 0.1]} userData={{ label: 'Gear & Collections' }} onClick={event => { event.stopPropagation(); onOpenApp('gear'); }}>
        <RoundedBox args={[0.52, 0.7, 0.3]} radius={0.06} smoothness={4} position={[0, 0.35, 0]}><meshPhysicalMaterial color={colors.accent} roughness={0.12} clearcoat={1} clearcoatRoughness={0.08} /></RoundedBox>
        <mesh position={[0, 0.34, 0.152]}><planeGeometry args={[0.3, 0.2]} /><meshStandardMaterial color={colors.paper} roughness={0.9} /></mesh>
        <mesh position={[0, 0.74, 0]}><cylinderGeometry args={[0.07, 0.09, 0.08, 24]} /><meshStandardMaterial color={colors.frame} roughness={0.25} metalness={0.85} /></mesh>
        <mesh position={[0, 0.87, 0]}><cylinderGeometry args={[0.15, 0.15, 0.2, 32]} /><meshStandardMaterial color={colors.objectDark} roughness={0.35} metalness={0.4} /></mesh>
      </group>
      <group position={[2.92, 0.78, -0.88]} rotation={[0, -0.4, 0]} userData={{ label: 'Contact' }} onClick={event => { event.stopPropagation(); onOpenApp('contact'); }}>
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
      <group position={[0.92, 0.82, 0.55]} rotation={[-Math.PI / 2, 0, -0.12]} userData={{ label: 'Résumé' }} onClick={event => { event.stopPropagation(); onOpenApp('resume'); }}>
        <mesh position={[0, 0, -0.025]}><boxGeometry args={[0.74, 1.02, 0.04]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <mesh position={[0, 0, 0.002]}><planeGeometry args={[0.67, 0.93]} /><meshStandardMaterial color={colors.screen} roughness={0.92} /></mesh>
        <mesh position={[0, 0.28, 0.008]}><boxGeometry args={[0.38, 0.025, 0.01]} /><meshStandardMaterial color={colors.accent} /></mesh>
        <mesh position={[0, 0.16, 0.008]}><boxGeometry args={[0.48, 0.014, 0.01]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <mesh position={[0, 0.08, 0.008]}><boxGeometry args={[0.48, 0.014, 0.01]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <mesh position={[0, 0, 0.008]}><boxGeometry args={[0.45, 0.014, 0.01]} /><meshStandardMaterial color={colors.frame} /></mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.52, 0]} receiveShadow><planeGeometry args={[80, 80]} /><meshStandardMaterial color={colors.world} roughness={0.92} /></mesh>
      <mesh position={[0, 6, -5]}><planeGeometry args={[80, 30]} /><meshStandardMaterial color={colors.wall} roughness={0.95} /></mesh>
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
    <Html portal={portal} transform position={[0, MONITOR_CENTER_Y, MONITOR_SCREEN_Z]} distanceFactor={1.2} style={{ width: '1280px', height: '760px', overflow: 'hidden', pointerEvents: view === 'desk' ? 'none' : 'auto' }} wrapperClass="desk-projected-html" prepend>
      <div ref={screenReady} className={'desk-projection-frame' + (view === 'desk' ? ' desk-projection-overview' : '')} inert={view === 'desk' ? true : undefined} aria-hidden={view === 'desk' || undefined}>
        <ContextBridge>
          <DesktopWorkspace presentation={view === 'desk' ? 'preview' : 'screen'} theme={theme} toggleTheme={toggleTheme} onBackToDesk={onBackToDesk} />
        </ContextBridge>
      </div>
    </Html>
  );
}

const SCREEN_POSE = [0, MONITOR_CENTER_Y + 0.03, 2.8, 0, MONITOR_CENTER_Y, MONITOR_SCREEN_Z];
// The desk view was framed on a 2.21 aspect screen; narrower screens back the camera up along the same line so the desk still fits.
function deskPose(aspect) {
  const k = Math.min(1.4, Math.max(1, 2.21 / aspect));
  const position = DESK_CAMERA_POSITION.map((value, index) => DESK_CAMERA_TARGET[index] + (value - DESK_CAMERA_TARGET[index]) * k);
  return [...position, ...DESK_CAMERA_TARGET];
}
const SMOOTH_TIME = 0.3;
// Scrolling closer than this locks onto the monitor; scrolling the monitor view out past UNLOCK returns to the desk.
const LOCK_DISTANCE = 5.5;
const UNLOCK_DISTANCE = 6;

function DeskCamera({ view, reducedMotion, onOpenDesktop, onBackToDesk }) {
  const { introKey } = useRetroOS();
  const controls = useRef(null);
  const camera = useThree(state => state.camera);
  const setFrameloop = useThree(state => state.setFrameloop);
  const clock = useThree(state => state.clock);
  const aspect = useThree(state => state.size.width / Math.max(1, state.size.height));
  const DESK_POSE = useMemo(() => deskPose(aspect), [aspect]);
  const initializedCamera = useRef(null);
  const activeGlides = useRef(0);
  // On-demand rendering sees one long frame after idling and would finish a move instantly,
  // so render continuously from a fresh clock until every glide settles.
  const glide = useCallback((pose, smoothTime = SMOOTH_TIME) => {
    const current = controls.current;
    if (!current) return;
    if (reducedMotion) { current.setLookAt(...pose, false); return; }
    current.smoothTime = smoothTime;
    clock.getDelta();
    activeGlides.current += 1;
    setFrameloop('always');
    current.setLookAt(...pose, true).finally(() => {
      activeGlides.current -= 1;
      if (activeGlides.current > 0) return;
      // Once at rest the remaining easing is invisible but keeps redrawing; finish it so the scene can sleep.
      current.setLookAt(...pose, false);
      current.smoothTime = SMOOTH_TIME;
      setFrameloop('demand');
    });
  }, [reducedMotion, clock, setFrameloop]);
  useEffect(() => {
    const pose = view === 'screen' ? SCREEN_POSE : DESK_POSE;
    if (initializedCamera.current === camera) glide(pose);
    else controls.current?.setLookAt(...pose, false);
    initializedCamera.current = camera;
  }, [camera, view, glide]);
  // Resizing reframes the desk instantly; it never animates.
  useEffect(() => {
    if (view === 'desk' && initializedCamera.current === camera) controls.current?.setLookAt(...DESK_POSE, false);
  }, [DESK_POSE]);
  // After the boot splash, start on the monitor and pull back to the whole desk once.
  useEffect(() => {
    if (!introKey || !controls.current) return;
    controls.current.setLookAt(...SCREEN_POSE, false);
    glide(DESK_POSE, 0.9);
  }, [introKey]);
  const spherical = useMemo(() => new Spherical(), []);
  // Wheel input fires 'control' before the smoothed camera moves, so compare the destination distance.
  // Passed as a prop because drei recreates the controls instance once the default camera is set.
  const onControl = useCallback(() => {
    const distance = controls.current?.getSpherical(spherical, true).radius;
    if (view === 'desk' && distance < LOCK_DISTANCE) onOpenDesktop();
    else if (view === 'screen' && distance > UNLOCK_DISTANCE) onBackToDesk();
  }, [view, onOpenDesktop, onBackToDesk, spherical]);
  return <><PerspectiveCamera makeDefault position={DESK_CAMERA_POSITION} fov={38} /><CameraControls ref={controls} makeDefault onControl={onControl} smoothTime={SMOOTH_TIME} restThreshold={0.05} minDistance={3.5} maxDistance={18} minPolarAngle={0.65} maxPolarAngle={1.42} maxAzimuthAngle={0.8} minAzimuthAngle={-0.8} /></>;
}

export default function DeskScene({ view, theme, reducedMotion, onOpenDesktop, onOpenApp, onOpenResume, toggleTheme, onBackToDesk, onSceneFailure }) {
  const contextLostCleanup = useRef(null);
  const screenPortal = useRef(null);
  const ContextBridge = useContextBridge(DesktopWorkspaceContext, ModalContext, RetroOSContext);
  const palette = useMemo(() => ({
    world: readColor('--desk-world', '#292a27'),
    wall: readColor('--desk-wall', '#3b3c35'),
    board: readColor('--desk-board', '#544136'),
    frame: readColor('--desk-frame', '#393936'),
    objectDark: readColor('--desk-object-dark', '#1a1b1a'),
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
    lamp: readColor('--desk-lamp'), mug: readColor('--desk-mug'), coffee: readColor('--desk-coffee')
  }), [theme]);
  const motionReduced = Boolean(reducedMotion);

  useEffect(() => () => contextLostCleanup.current?.(), []);

  return (
    <Canvas
      className="desk-canvas"
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
        <ambientLight intensity={1.15} />
        <directionalLight position={[-3, 8, 6]} intensity={2.3} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} shadow-normalBias={0.02} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-camera-near={1} shadow-camera-far={25} />
        <directionalLight position={[6, 5, -4]} intensity={1.1} color={palette.accent} />
        <DeskCamera view={view} reducedMotion={motionReduced} onOpenDesktop={onOpenDesktop} onBackToDesk={onBackToDesk} />
        <DeskObjects view={view} onOpenDesktop={onOpenDesktop} onOpenApp={onOpenApp} colors={palette} />
        <ScreenProjection view={view} theme={theme} onOpenResume={onOpenResume} toggleTheme={toggleTheme} onBackToDesk={onBackToDesk} ContextBridge={ContextBridge} portal={screenPortal} />
      </ContextBridge>
    </Canvas>
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
