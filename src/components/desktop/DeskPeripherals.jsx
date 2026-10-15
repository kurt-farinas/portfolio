import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Instance, Instances, RoundedBox, RoundedBoxGeometry, useTexture } from '@react-three/drei';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useRetroOS } from '../../context/RetroOSContext';
import useMinuteClock, { formatClock } from './useMinuteClock';
import { useDesktopWorkspace } from '../../context/DesktopWorkspaceContext';
import { portfolioProfile } from '../../data/portfolioFacts';

export const MONITOR_CENTER_Y = 2.54;
export const MONITOR_SCREEN_Z = -0.86;
export const DESK_CAMERA_POSITION = [2.0, 4.2, 11.5];
export const DESK_CAMERA_TARGET = [0, 2.5, 0];

function StickyNote({ label, color, position, rotation, colors, onClick }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = color; context.fillRect(0, 0, 256, 256);
    context.fillStyle = colors.noteInk; context.font = '700 32px monospace'; context.fillText(label, 18, 72);
    context.font = '22px monospace'; context.fillText('click to open', 18, 119);
    const value = new CanvasTexture(canvas); value.colorSpace = SRGBColorSpace; return value;
  }, [label, color, colors.noteInk]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={position} rotation={rotation} userData={{ label }} onClick={event => { event.stopPropagation(); onClick(); }}><planeGeometry args={[0.68, 0.66]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>;
}

export function RetroMonitor({ colors, onOpenDesktop, onOpenApp }) {
  const { monitorOn, togglePower } = useRetroOS();
  return <group userData={{ label: 'Open desktop' }} onClick={event => { event.stopPropagation(); onOpenDesktop(); }}>
    <RoundedBox args={[1.58, 0.13, 1.08]} radius={0.05} smoothness={3} position={[0, 0.845, -1.5]}><meshStandardMaterial color={colors.retroShell} roughness={0.7} /></RoundedBox>
    <RoundedBox args={[0.52, 0.48, 0.42]} radius={0.07} smoothness={3} position={[0, 1.09, -1.5]}><meshStandardMaterial color={colors.retroEdge} roughness={0.75} /></RoundedBox>
    <RoundedBox args={[4.92, 3.18, 1.06]} radius={0.1} smoothness={3} position={[0, 2.48, -1.5]}><meshStandardMaterial color={colors.retroShell} roughness={0.66} /></RoundedBox>
    <RoundedBox args={[4.5, 2.74, 0.11]} radius={0.045} smoothness={3} position={[0, MONITOR_CENTER_Y, -0.925]}><meshStandardMaterial color={colors.retroRecess} roughness={0.8} /></RoundedBox>
    <RoundedBox args={[4.22, 2.48, 0.025]} radius={0.01} smoothness={3} position={[0, MONITOR_CENTER_Y, -0.882]}><meshStandardMaterial color={colors.displayGlass} roughness={0.3} /></RoundedBox>
    {[0,1,2].map(index => <mesh key={index} position={[-1.96 + index * 0.055, 1.095, -0.958]}><boxGeometry args={[0.034,0.08,0.024]} /><meshStandardMaterial color={colors.badge} roughness={0.6} /></mesh>)}
    <RoundedBox args={[0.26,0.13,0.035]} radius={0.012} smoothness={2} position={[1.99,1.095,-0.956]} userData={{ label: 'Monitor power' }} onClick={event => { event.stopPropagation(); togglePower(); }}><meshStandardMaterial color={colors.retroEdge} roughness={0.7} /></RoundedBox>
    <mesh position={[1.73,1.095,-0.936]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.018,0.018,0.018,16]} /><meshStandardMaterial color={monitorOn ? colors.led : colors.retroRecess} emissive={monitorOn ? colors.led : colors.retroRecess} emissiveIntensity={monitorOn ? 0.3 : 0} /></mesh>
    <StickyNote label="Projects" color={colors.noteYellow} position={[2.65,2.94,-0.85]} rotation={[0,0,-0.09]} colors={colors} onClick={() => onOpenApp('projects')} />
    <StickyNote label="Contact" color={colors.noteGreen} position={[-2.64,1.64,-0.85]} rotation={[0,0,0.1]} colors={colors} onClick={() => onOpenApp('contact')} />
  </group>;
}

const ROWS = [[...Array(12).fill(1),2],[1.5,...Array(11).fill(1),1.5],[1.75,...Array(10).fill(1),2.25],[2.25,...Array(9).fill(1),2.75],[1.25,1.25,1.25,6.25,1,1,1,1]];
const LABELS = [['1','2','3','4','5','6','7','8','9','0','-','=','BACKSPACE'],['TAB',...'QWERTYUIOP[',']'],['CAPS',...'ASDFGHJKL;','ENTER'],['SHIFT',...'ZXCVBNM,.','SHIFT'],['CTRL','ALT','META',' ','ALT','LEFT','DOWN','RIGHT']];
const KEYS = ROWS.flatMap((row,r) => { let x=-7*0.174; return row.map((units,c) => { const key={ id:r+'-'+c,x:x+units*0.174/2,z:-0.33+r*0.165,width:units*0.174-0.024,units,label:LABELS[r][c] }; x+=units*0.174; return key; }); });

export function RetroKeyboard({ colors, onOpenProjects }) {
  const { pressedKey } = useRetroOS();
  return <group position={[0,0.81,1.28]} rotation={[0.055,0,0]} userData={{ label: 'Projects' }} onClick={event => { event.stopPropagation(); onOpenProjects(); }}>
    <RoundedBox args={[2.91,0.15,1.09]} radius={0.035} smoothness={3} position={[0,0.06,0]}><meshStandardMaterial color={colors.retroShell} roughness={0.72} /></RoundedBox>
    <RoundedBox args={[2.66,0.025,0.92]} radius={0.01} smoothness={2} position={[0,0.14,0]}><meshStandardMaterial color={colors.retroEdge} roughness={0.8} /></RoundedBox>
    <Instances limit={KEYS.length} range={KEYS.length}><RoundedBoxGeometry args={[0.15,0.075,0.13]} radius={0.015} smoothness={2} bevelSegments={2} /><meshStandardMaterial color={colors.retroKey} roughness={0.78} />
      {KEYS.map(key => <Instance key={key.id} position={[key.x,0.176-(pressedKey===key.label?0.012:0),key.z]} scale={[key.width/0.15,1,1]} />)}
    </Instances>
    <Instances limit={KEYS.length} range={KEYS.length}><boxGeometry args={[0.025,0.002,0.015]} /><meshStandardMaterial color={colors.noteInk} roughness={0.8} />
      {KEYS.map(key => <Instance key={key.id} position={[key.x-(key.units<2?0.025:0),0.215-(pressedKey===key.label?0.012:0),key.z-0.023]} scale={[key.units>5?6:1,1,1]} />)}
    </Instances>
  </group>;
}

export function RetroMouse({ colors, onOpenProjects }) {
  return <group position={[2.14,0.79,1.23]} rotation={[0,-0.25,0]} userData={{ label: 'Projects' }} onClick={event => { event.stopPropagation(); onOpenProjects(); }}>
    <mesh position={[0,0.018,0.015]} scale={[0.245,1,0.405]}><cylinderGeometry args={[1,1,0.036,40]} /><meshStandardMaterial color={colors.retroEdge} roughness={0.8} /></mesh>
    <mesh position={[0,0.036,0.015]} scale={[0.245,0.205,0.405]}><sphereGeometry args={[1,32,18,0,Math.PI*2,0,Math.PI/2]} /><meshStandardMaterial color={colors.retroShell} roughness={0.72} /></mesh>
    {[Math.PI+0.04,Math.PI*1.5+0.04].map(angle => <mesh key={angle} position={[0,0.041,0.015]} scale={[0.247,0.207,0.407]}><sphereGeometry args={[1,18,14,angle,Math.PI/2-0.08,0.18,1.25]} /><meshStandardMaterial color={colors.retroKey} roughness={0.75} /></mesh>)}
    <mesh position={[0,0.22,-0.19]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.047,0.047,0.058,24]} /><meshStandardMaterial color={colors.retroRecess} roughness={0.9} /></mesh>
  </group>;
}

// Postage-stamp portrait taped to the lamp shade: paper border, perforated edge, cropped photo.
const STAMP_W = 0.24, STAMP_H = 0.28, STAMP_HOLE = 0.04;
const stampHoles = [];
for (let x = -STAMP_W / 2; x <= STAMP_W / 2 + 1e-6; x += STAMP_HOLE) stampHoles.push([x, STAMP_H / 2], [x, -STAMP_H / 2]);
for (let y = -STAMP_H / 2 + STAMP_HOLE; y < STAMP_H / 2 - 1e-6; y += STAMP_HOLE) stampHoles.push([STAMP_W / 2, y], [-STAMP_W / 2, y]);
function ProfileStamp({ colors }) {
  const source = useTexture('/optimized/images/kurt-farinas-profile.png.webp');
  const photo = useMemo(() => {
    const texture = source.clone();
    texture.colorSpace = SRGBColorSpace;
    texture.repeat.set(0.18 / 0.22, 1); // crop the square portrait to the stamp's portrait window
    texture.offset.set((1 - 0.18 / 0.22) / 2, 0);
    texture.needsUpdate = true;
    return texture;
  }, [source]);
  return <group>
    <mesh><planeGeometry args={[STAMP_W, STAMP_H]} /><meshStandardMaterial color={colors.paper} roughness={0.9} /></mesh>
    <mesh position={[0, 0, 0.002]}><planeGeometry args={[0.18, 0.22]} /><meshBasicMaterial map={photo} toneMapped={false} /></mesh>
    {stampHoles.map(([x, y]) => <mesh key={x.toFixed(3) + ':' + y.toFixed(3)} position={[x, y, 0.001]}><circleGeometry args={[0.012, 10]} /><meshStandardMaterial color={colors.lamp} /></mesh>)}
  </group>;
}

export function DeskLamp({ colors, night }) {
  const { warmLamp: lampSetting } = useRetroOS();
  const warmLamp = lampSetting || night; // the lamp switches itself on after dark
  const arm = <meshStandardMaterial color={colors.retroRecess} metalness={0.35} roughness={0.55} />;
  // Articulated arm: base, lower arm leaning toward the keyboard, upper arm reaching over, domed shade aimed down.
  return <group position={[-4.4,0.8,-0.8]} rotation={[0,-0.55,0]}>
    <mesh position={[0,0.05,0]}><cylinderGeometry args={[0.38,0.42,0.1,32]} /><meshStandardMaterial color={colors.lamp} roughness={0.5} metalness={0.2} /></mesh>
    <mesh position={[0,0.13,0]}><sphereGeometry args={[0.07,16,12]} />{arm}</mesh>
    <group position={[0,0.13,0]} rotation={[0,0,-0.32]}>
      <mesh position={[0,0.55,0]}><cylinderGeometry args={[0.028,0.028,1.1,12]} />{arm}</mesh>
      <mesh position={[0,1.1,0]}><sphereGeometry args={[0.06,16,12]} />{arm}</mesh>
      <group position={[0,1.1,0]} rotation={[0,0,-1.45]}>
        <mesh position={[0,0.42,0]}><cylinderGeometry args={[0.024,0.024,0.84,12]} />{arm}</mesh>
        <group position={[0,0.86,0]} rotation={[0,0,1.47]}>
          <mesh position={[0,-0.12,0]}><sphereGeometry args={[0.3,32,16,0,Math.PI*2,0,Math.PI/2]} /><meshStandardMaterial color={colors.lamp} roughness={0.45} metalness={0.25} side={2} /></mesh>
          {/* Faces the camera: yaw undoes the lamp's turn, pitch tips it onto the upper dome. */}
          <group position={[0,-0.12,0]} rotation={[-0.5,0.53,0.05,'YXZ']}><group position={[0,0,0.315]}><ProfileStamp colors={colors} /></group></group>
          <mesh position={[0,-0.06,0]}><sphereGeometry args={[0.09,16,10]} /><meshStandardMaterial color={colors.retroKey} emissive={colors.paper} emissiveIntensity={warmLamp?1.2:0} /></mesh>
          {warmLamp && <pointLight position={[0,-0.3,0]} color={colors.paper} intensity={5} distance={7} decay={2} />}
        </group>
      </group>
    </group>
  </group>;
}
export function CoffeeMug({ colors }) {
  return <group position={[3.55,0.79,1.65]}>
    <mesh position={[0,0.24,0]}><cylinderGeometry args={[0.24,0.22,0.46,40,1,true]} /><meshStandardMaterial color={colors.mug} roughness={0.35} side={2} /></mesh>
    <mesh position={[0,0.015,0]}><cylinderGeometry args={[0.22,0.22,0.03,40]} /><meshStandardMaterial color={colors.mug} roughness={0.35} /></mesh>
    <mesh position={[0,0.47,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[0.226,0.016,10,48]} /><meshStandardMaterial color={colors.mug} roughness={0.3} /></mesh>
    <mesh position={[0,0.41,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[0.226,40]} /><meshStandardMaterial color={colors.coffee} roughness={0.25} /></mesh>
    <mesh position={[0.27,0.25,0]} rotation={[0,0,-Math.PI*0.65]}><torusGeometry args={[0.12,0.04,14,28,Math.PI*1.3]} /><meshStandardMaterial color={colors.mug} roughness={0.35} /></mesh>
  </group>;
}
export function DeskClock({ colors }) {
  const now = useMinuteClock();
  const invalidate = useThree(state => state.invalidate);
  const canvas = useMemo(() => { const value = document.createElement('canvas'); value.width = 256; value.height = 96; return value; }, []);
  const texture = useMemo(() => { const value = new CanvasTexture(canvas); value.colorSpace = SRGBColorSpace; return value; }, [canvas]);
  useEffect(() => () => texture.dispose(), [texture]);
  useEffect(() => {
    const context = canvas.getContext('2d');
    context.fillStyle = colors.displayGlass; context.fillRect(0, 0, 256, 96);
    context.fillStyle = colors.led; context.font = '700 52px monospace'; context.textAlign = 'center'; context.textBaseline = 'middle';
    context.fillText(formatClock(now).replace(/\s?[AP]M$/i, ''), 128, 50);
    texture.needsUpdate = true; invalidate();
  }, [now, canvas, texture, colors.displayGlass, colors.led, invalidate]);
  return <group position={[-2.3,0.78,0.75]} rotation={[0,0.35,0]}>
    <RoundedBox args={[0.62,0.3,0.24]} radius={0.04} smoothness={3} position={[0,0.15,0]}><meshStandardMaterial color={colors.retroShell} roughness={0.7} /></RoundedBox>
    <mesh position={[0,0.16,0.122]}><planeGeometry args={[0.5,0.19]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
  </group>;
}
const PRINT_SECONDS = 1.4;
const PAPER_HEIGHT = 1.1;

// A dot-matrix printer that feeds out a résumé page, then opens the Résumé app.
export function DeskPrinter({ colors, onPrinted }) {
  const { reducedMotion } = useDesktopWorkspace();
  const { playSound } = useRetroOS();
  const invalidate = useThree(state => state.invalidate);
  const paper = useRef(null);
  const progress = useRef(0);
  const [printing, setPrinting] = useState(false);
  const [printed, setPrinted] = useState(false);
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 330;
    const context = canvas.getContext('2d');
    context.fillStyle = colors.paper; context.fillRect(0, 0, 256, 330);
    context.fillStyle = colors.noteInk; context.font = '700 22px monospace'; context.fillText(portfolioProfile.name, 18, 46);
    context.font = '15px monospace'; context.fillText(portfolioProfile.role, 18, 72);
    context.fillRect(18, 90, 220, 2);
    [120, 146, 172, 198, 224, 250].forEach((y, index) => context.fillRect(18, y, index % 2 ? 160 : 210, 6));
    const value = new CanvasTexture(canvas); value.colorSpace = SRGBColorSpace; return value;
  }, [colors.paper, colors.noteInk]);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame((state, delta) => {
    if (!printing || !paper.current) return;
    progress.current = Math.min(1, progress.current + Math.min(delta, 0.05) / PRINT_SECONDS);
    paper.current.position.y = 0.33 - PAPER_HEIGHT / 2 + PAPER_HEIGHT * progress.current;
    if (progress.current < 1) { invalidate(); return; }
    setPrinting(false); onPrinted();
  });
  const print = event => {
    event.stopPropagation();
    if (printing) return;
    if (reducedMotion) { onPrinted(); return; }
    progress.current = 0; setPrinted(true); setPrinting(true); playSound('print'); invalidate();
  };
  return <group position={[3.65,0.78,-2.5]} rotation={[0,-0.35,0]} userData={{ label: 'Print résumé' }} onClick={print}>
    <RoundedBox args={[1.2,0.32,0.72]} radius={0.05} smoothness={3} position={[0,0.16,0]}><meshStandardMaterial color={colors.retroShell} roughness={0.72} /></RoundedBox>
    <mesh position={[0,0.325,-0.12]}><boxGeometry args={[0.92,0.02,0.07]} /><meshStandardMaterial color={colors.retroRecess} roughness={0.9} /></mesh>
    <mesh position={[0,0.06,-0.56]}><boxGeometry args={[0.95,0.12,0.36]} /><meshStandardMaterial color={colors.paper} roughness={0.95} /></mesh>
    <mesh position={[0.45,0.2,0.362]}><boxGeometry args={[0.05,0.03,0.01]} /><meshStandardMaterial color={colors.led} emissive={colors.led} emissiveIntensity={printing ? 0.8 : 0.3} /></mesh>
    <mesh ref={paper} visible={printed} position={[0,0.33 - PAPER_HEIGHT / 2,-0.12]} rotation={[-0.22,0,0]}><planeGeometry args={[0.85,PAPER_HEIGHT]} /><meshStandardMaterial map={texture} roughness={0.95} side={2} /></mesh>
  </group>;
}
