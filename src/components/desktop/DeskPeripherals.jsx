import React, { useEffect, useMemo } from 'react';
import { Instance, Instances, RoundedBox, RoundedBoxGeometry } from '@react-three/drei';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { useRetroOS } from '../../context/RetroOSContext';

export const MONITOR_CENTER_Y = 2.54;
export const MONITOR_SCREEN_Z = -0.86;
export const DESK_CAMERA_POSITION = [0, 6.3, 12.4];
export const DESK_CAMERA_TARGET = [0, 0, 0];

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
  return <mesh position={position} rotation={rotation} onClick={event => { event.stopPropagation(); onClick(); }}><planeGeometry args={[0.68, 0.66]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>;
}

export function RetroMonitor({ colors, onOpenDesktop, onOpenApp }) {
  const { monitorOn, togglePower } = useRetroOS();
  return <group onClick={event => { event.stopPropagation(); onOpenDesktop(); }}>
    <RoundedBox args={[1.58, 0.13, 1.08]} radius={0.05} smoothness={3} position={[0, 0.845, -1.5]}><meshStandardMaterial color={colors.retroShell} roughness={0.7} /></RoundedBox>
    <RoundedBox args={[0.52, 0.48, 0.42]} radius={0.07} smoothness={3} position={[0, 1.09, -1.5]}><meshStandardMaterial color={colors.retroEdge} roughness={0.75} /></RoundedBox>
    <RoundedBox args={[4.92, 3.18, 1.06]} radius={0.16} smoothness={3} position={[0, 2.48, -1.5]}><meshStandardMaterial color={colors.retroShell} roughness={0.73} /></RoundedBox>
    <RoundedBox args={[4.5, 2.74, 0.11]} radius={0.045} smoothness={3} position={[0, MONITOR_CENTER_Y, -0.925]}><meshStandardMaterial color={colors.retroRecess} roughness={0.8} /></RoundedBox>
    <RoundedBox args={[4.22, 2.48, 0.025]} radius={0.01} smoothness={3} position={[0, MONITOR_CENTER_Y, -0.882]}><meshStandardMaterial color={colors.displayGlass} roughness={0.3} /></RoundedBox>
    {[0,1,2].map(index => <mesh key={index} position={[-1.96 + index * 0.055, 1.095, -0.958]}><boxGeometry args={[0.034,0.08,0.024]} /><meshStandardMaterial color={colors.badge} roughness={0.6} /></mesh>)}
    <RoundedBox args={[0.26,0.13,0.035]} radius={0.012} smoothness={2} position={[1.99,1.095,-0.956]} onClick={event => { event.stopPropagation(); togglePower(); }}><meshStandardMaterial color={colors.retroEdge} roughness={0.7} /></RoundedBox>
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
  return <group position={[0,0.81,1.28]} rotation={[0.055,0,0]} onClick={event => { event.stopPropagation(); onOpenProjects(); }}>
    <RoundedBox args={[2.91,0.15,1.09]} radius={0.05} smoothness={3} position={[0,0.06,0]}><meshStandardMaterial color={colors.retroShell} roughness={0.77} /></RoundedBox>
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
  return <group position={[2.14,0.79,1.23]} rotation={[0,-0.25,0]} onClick={event => { event.stopPropagation(); onOpenProjects(); }}>
    <mesh position={[0,0.018,0.015]} scale={[0.245,1,0.405]}><cylinderGeometry args={[1,1,0.036,40]} /><meshStandardMaterial color={colors.retroEdge} roughness={0.8} /></mesh>
    <mesh position={[0,0.036,0.015]} scale={[0.245,0.205,0.405]}><sphereGeometry args={[1,32,18,0,Math.PI*2,0,Math.PI/2]} /><meshStandardMaterial color={colors.retroShell} roughness={0.72} /></mesh>
    {[Math.PI+0.04,Math.PI*1.5+0.04].map(angle => <mesh key={angle} position={[0,0.041,0.015]} scale={[0.247,0.207,0.407]}><sphereGeometry args={[1,18,14,angle,Math.PI/2-0.08,0.18,1.25]} /><meshStandardMaterial color={colors.retroKey} roughness={0.75} /></mesh>)}
    <mesh position={[0,0.22,-0.19]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.047,0.047,0.058,24]} /><meshStandardMaterial color={colors.retroRecess} roughness={0.9} /></mesh>
  </group>;
}

export function DeskLamp({ colors }) {
  const { warmLamp } = useRetroOS();
  return <group position={[-4.4,0.8,-0.8]}>
    <mesh position={[0,0.045,0]}><cylinderGeometry args={[0.36,0.41,0.09,28]} /><meshStandardMaterial color={colors.retroEdge} roughness={0.7} /></mesh>
    <mesh position={[0,0.65,0]}><cylinderGeometry args={[0.035,0.035,1.18,16]} /><meshStandardMaterial color={colors.retroRecess} metalness={0.3} roughness={0.65} /></mesh>
    <mesh position={[0.16,1.3,0.08]} rotation={[0,0,0.35]}><coneGeometry args={[0.44,0.45,28,1,true]} /><meshStandardMaterial color={colors.lamp} roughness={0.7} side={2} /></mesh>
    <mesh position={[0.16,1.13,0.08]} rotation={[0,0,0.35]}><sphereGeometry args={[0.085,16,10]} /><meshStandardMaterial color={colors.retroKey} emissive={colors.paper} emissiveIntensity={warmLamp?1.2:0} /></mesh>
    {warmLamp && <pointLight position={[0.16,1.1,0.3]} color={colors.paper} intensity={4} distance={7} decay={2} />}
  </group>;
}
export function CoffeeMug({ colors }) {
  return <group position={[3.4,0.79,1.28]}>
    <mesh position={[0,0.24,0]}><cylinderGeometry args={[0.24,0.21,0.46,32]} /><meshStandardMaterial color={colors.mug} roughness={0.6} /></mesh>
    <mesh position={[0,0.475,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[0.214,28]} /><meshStandardMaterial color={colors.retroRecess} roughness={0.95} /></mesh>
    <mesh position={[0.265,0.26,0]}><torusGeometry args={[0.13,0.043,12,24]} /><meshStandardMaterial color={colors.mug} roughness={0.6} /></mesh>
  </group>;
}
