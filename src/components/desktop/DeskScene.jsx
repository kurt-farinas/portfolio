import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Canvas, events, useThree } from '@react-three/fiber';
import { CameraControls, Html, PerspectiveCamera, useContextBridge, useTexture } from '@react-three/drei';
import { SRGBColorSpace } from 'three';
import DesktopWorkspace from './DesktopWorkspace';
import { bindDesktopCameraInput, computeDesktopScenePointer } from './desktopCameraInput';
import { DesktopWorkspaceContext } from '../../context/DesktopWorkspaceContext';
import { ModalContext } from '../../context/ModalContext';
import { RetroOSContext } from '../../context/RetroOSContext';
import { CoffeeMug, DeskLamp, DESK_CAMERA_POSITION, DESK_CAMERA_TARGET, RetroMonitor, MONITOR_CENTER_Y, MONITOR_SCREEN_Z, RetroKeyboard, RetroMouse } from './DeskPeripherals';

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

function DeskObjects({ onOpenDesktop, onOpenApp, colors }) {
  const photoClick = () => onOpenApp('after-hours');
  return (
    <group>
      <mesh position={[0, 0.64, 0]} receiveShadow><boxGeometry args={[12, 0.28, 6.8]} /><meshStandardMaterial color={colors.board} roughness={0.78} /></mesh>
      <mesh position={[-4.8, -0.4, -2.2]}><boxGeometry args={[0.22, 2.05, 0.22]} /><meshStandardMaterial color={colors.frame} /></mesh>
      <mesh position={[4.8, -0.4, -2.2]}><boxGeometry args={[0.22, 2.05, 0.22]} /><meshStandardMaterial color={colors.frame} /></mesh>
      <mesh position={[-4.8, -0.4, 2.1]}><boxGeometry args={[0.22, 2.05, 0.22]} /><meshStandardMaterial color={colors.frame} /></mesh>
      <mesh position={[4.8, -0.4, 2.1]}><boxGeometry args={[0.22, 2.05, 0.22]} /><meshStandardMaterial color={colors.frame} /></mesh>
      <RetroMonitor colors={colors} onOpenDesktop={onOpenDesktop} onOpenApp={onOpenApp} />
      <RetroKeyboard colors={colors} onOpenProjects={() => onOpenApp('projects')} />
      <RetroMouse colors={colors} onOpenProjects={() => onOpenApp('projects')} />
      <DeskLamp colors={colors} /><CoffeeMug colors={colors} />
      <group position={[3.75, 0.83, 0.1]} onClick={event => { event.stopPropagation(); onOpenApp('gear'); }}>
        <mesh position={[0, 0.38, 0]}><boxGeometry args={[0.52, 0.72, 0.32]} /><meshStandardMaterial color={colors.accent} roughness={0.32} metalness={0.16} /></mesh>
        <mesh position={[0, 0.82, 0]}><cylinderGeometry args={[0.13, 0.15, 0.2, 24]} /><meshStandardMaterial color={colors.objectDark} roughness={0.4} metalness={0.5} /></mesh>
        <mesh position={[0, 0.92, 0]}><cylinderGeometry args={[0.16, 0.16, 0.08, 24]} /><meshStandardMaterial color={colors.frame} roughness={0.35} metalness={0.65} /></mesh>
      </group>
      <group position={[2.92, 0.82, -0.88]} onClick={event => { event.stopPropagation(); onOpenApp('contact'); }}>
        <mesh position={[0, 0.14, 0]}><cylinderGeometry args={[0.13, 0.12, 0.28, 20]} /><meshStandardMaterial color={colors.objectDark} roughness={0.38} metalness={0.3} /></mesh>
        <mesh position={[0, 0.42, 0]}><cylinderGeometry args={[0.07, 0.1, 0.34, 20]} /><meshStandardMaterial color={colors.frame} roughness={0.42} /></mesh>
        <mesh position={[0, 0.61, 0]} rotation={[0.4, 0, 0]}><sphereGeometry args={[0.13, 16, 10]} /><meshStandardMaterial color={colors.objectDark} roughness={0.4} /></mesh>
        <mesh position={[0, -0.04, 0]}><cylinderGeometry args={[0.22, 0.28, 0.08, 24]} /><meshStandardMaterial color={colors.frame} /></mesh>
      </group>
      <group position={[-3.9, 0.81, 0.4]} rotation={[-Math.PI / 2, 0, 0]} onClick={event => { event.stopPropagation(); photoClick(); }}>
        <mesh position={[0.02, 0, -0.025]}><boxGeometry args={[0.82, 1.02, 0.04]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <PhotoPrint onClick={photoClick} paper={colors.paper} />
      </group>
      <group position={[-3.3, 0.83, 0.36]} rotation={[-Math.PI / 2, 0, 0.16]} onClick={photoClick}>
        <mesh position={[0, 0, -0.02]}><boxGeometry args={[0.8, 1, 0.04]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <PhotoPrint onClick={photoClick} paper={colors.paper} />
      </group>
      <group position={[0.92, 0.82, 0.55]} rotation={[-Math.PI / 2, 0, -0.12]} onClick={event => { event.stopPropagation(); onOpenApp('resume'); }}>
        <mesh position={[0, 0, -0.025]}><boxGeometry args={[0.74, 1.02, 0.04]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <mesh position={[0, 0, 0.002]}><planeGeometry args={[0.67, 0.93]} /><meshStandardMaterial color={colors.screen} roughness={0.92} /></mesh>
        <mesh position={[0, 0.28, 0.008]}><boxGeometry args={[0.38, 0.025, 0.01]} /><meshStandardMaterial color={colors.accent} /></mesh>
        <mesh position={[0, 0.16, 0.008]}><boxGeometry args={[0.48, 0.014, 0.01]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <mesh position={[0, 0.08, 0.008]}><boxGeometry args={[0.48, 0.014, 0.01]} /><meshStandardMaterial color={colors.frame} /></mesh>
        <mesh position={[0, 0, 0.008]}><boxGeometry args={[0.45, 0.014, 0.01]} /><meshStandardMaterial color={colors.frame} /></mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.52, 0]} receiveShadow><planeGeometry args={[80, 80]} /><meshStandardMaterial color={colors.world} roughness={0.92} /></mesh>
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

function DeskCamera({ view, reducedMotion }) {
  const controls = useRef(null);
  const camera = useThree(state => state.camera);
  const initializedCamera = useRef(null);
  useEffect(() => {
    const ease = initializedCamera.current === camera && !reducedMotion;
    if (view === 'screen') controls.current?.setLookAt(0, MONITOR_CENTER_Y + 0.03, 2.8, 0, MONITOR_CENTER_Y, MONITOR_SCREEN_Z, ease);
    else controls.current?.setLookAt(...DESK_CAMERA_POSITION, ...DESK_CAMERA_TARGET, ease);
    initializedCamera.current = camera;
  }, [camera, view, reducedMotion]);
  return <><PerspectiveCamera makeDefault position={DESK_CAMERA_POSITION} fov={38} /><CameraControls ref={controls} makeDefault minDistance={3.5} maxDistance={18} minPolarAngle={0.65} maxPolarAngle={1.42} maxAzimuthAngle={0.8} minAzimuthAngle={-0.8} /></>;
}

export default function DeskScene({ view, theme, reducedMotion, onOpenDesktop, onOpenApp, onOpenResume, toggleTheme, onBackToDesk, onSceneFailure }) {
  const contextLostCleanup = useRef(null);
  const screenPortal = useRef(null);
  const ContextBridge = useContextBridge(DesktopWorkspaceContext, ModalContext, RetroOSContext);
  const palette = useMemo(() => ({
    world: readColor('--desk-world', '#292a27'),
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
    lamp: readColor('--desk-lamp'), mug: readColor('--desk-mug')
  }), [theme]);
  const motionReduced = Boolean(reducedMotion);

  useEffect(() => () => contextLostCleanup.current?.(), []);

  return (
    <Canvas
      className="desk-canvas"
      dpr={[1, 1.25]}
      frameloop="demand"
      events={desktopSceneEvents}
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
        <directionalLight position={[-3, 8, 6]} intensity={2.3} />
        <directionalLight position={[6, 5, -4]} intensity={1.1} color={palette.accent} />
        <DeskCamera view={view} reducedMotion={motionReduced} />
        <DeskObjects onOpenDesktop={onOpenDesktop} onOpenApp={onOpenApp} colors={palette} />
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
