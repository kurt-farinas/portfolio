import React, { useMemo } from 'react';
import { Shape } from 'three';
import MergeStatic from './MergeStatic';

// Decorative geometry uses the room's existing frame driver and introduces no extra lights or assets.
export function WindowLandscape({ colors, phase }) {
  const hills = useMemo(() => [
    [[-1.45, -0.25], [-1, 0.08], [-0.3, -0.28], [0.45, 0.02], [1.45, -0.15]],
    [[-1.45, -0.6], [-0.8, -0.3], [0.1, -0.5], [0.8, -0.26], [1.45, -0.38]]
  ].map(points => {
    const shape = new Shape();
    shape.moveTo(-1.45, -1.05);
    shape.lineTo(...points[0]);
    for (let i = 1; i < points.length; i += 1) {
      const [x, y] = points[i];
      const [px, py] = points[i - 1];
      shape.bezierCurveTo(px + (x - px) / 3, py, x - (x - px) / 3, y, x, y);
    }
    shape.lineTo(1.45, -1.05); shape.closePath();
    return shape;
  }), []);
  const night = phase === 'night';
  return <group>
    <mesh position={[0.82, 0.64, 0.071]}><circleGeometry args={[night ? 0.13 : 0.19, 24]} /><meshBasicMaterial color={night ? colors.paper : colors.fairyBulb} toneMapped={false} /></mesh>
    {hills.map((shape, i) => <mesh key={i} position={[0, 0, 0.073 + i * 0.002]}><shapeGeometry args={[shape]} /><meshBasicMaterial color={night ? colors.frame : i ? colors.landNear : colors.landFar} toneMapped={false} /></mesh>)}
    {[[-1.12, -0.68], [-0.88, -0.73], [1.15, -0.63]].map(([x, y]) => <group key={x} position={[x, y, 0.079]}>
      <mesh position={[0, 0.05, 0]}><planeGeometry args={[0.025, 0.4]} /><meshBasicMaterial color={night ? colors.objectDark : colors.curtain} toneMapped={false} /></mesh>
      <mesh position={[0, 0.27, 0]} scale={[0.58, 1, 1]}><circleGeometry args={[0.25, 7]} /><meshBasicMaterial color={night ? colors.objectDark : colors.curtain} toneMapped={false} /></mesh>
    </group>)}
  </group>;
}

function SillPlant({ colors }) {
  return <group position={[6.08, 3.54, -4.5]}>
    <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.17, 0.12, 0.24, 12]} /><meshStandardMaterial color={colors.retroShell} roughness={0.9} /></mesh>
    <mesh position={[0, 0.245, 0]}><cylinderGeometry args={[0.15, 0.15, 0.015, 12]} /><meshStandardMaterial color={colors.coffee} /></mesh>
    {[0, 1, 2, 3, 4].map(i => <group key={i} rotation={[0, i * 2.4, 0.35 + i * 0.1]} position={[0, 0.24, 0]}>
      <mesh position={[0, 0.19, 0]} scale={[0.4, 1, 0.22]} rotation={[0.15, 0, -0.5]}><sphereGeometry args={[0.24, 8, 6]} /><meshStandardMaterial color={i % 2 ? colors.plant : colors.leafLight} roughness={0.85} /></mesh>
    </group>)}
  </group>;
}

function WorkInProgress({ colors }) {
  return <group position={[-2.7, 0.8, 1.9]} rotation={[0, 0.12, 0]}>
    <mesh position={[0, 0.025, 0]}><boxGeometry args={[0.82, 0.05, 1.05]} /><meshStandardMaterial color={colors.mug} roughness={0.9} /></mesh>
    <mesh position={[0.025, 0.057, 0]}><boxGeometry args={[0.73, 0.015, 0.95]} /><meshStandardMaterial color={colors.paper} roughness={1} /></mesh>
    {[0, 1, 2, 3, 4].map(i => <mesh key={i} position={[-0.24, 0.07, -0.35 + i * 0.17]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.045, 0.008, 4, 8]} /><meshStandardMaterial color={colors.curtainRod} metalness={0.4} roughness={0.5} /></mesh>)}
    {[0, 1, 2, 3].map(i => <mesh key={i} position={[0.08, 0.067, -0.28 + i * 0.14]}><boxGeometry args={[i === 2 ? 0.24 : 0.39, 0.005, 0.012]} /><meshStandardMaterial color={colors.retroEdge} /></mesh>)}
    <group position={[0.5, 0.05, 0.08]} rotation={[0, 0.3, Math.PI / 2]}>
      <mesh><cylinderGeometry args={[0.026, 0.026, 0.8, 6]} /><meshStandardMaterial color={colors.noteYellow} /></mesh>
      <mesh position={[0, 0.44, 0]}><coneGeometry args={[0.026, 0.08, 6]} /><meshStandardMaterial color={colors.coffee} /></mesh>
    </group>
  </group>;
}

// A single bed on the right of the room, headboard to the right and foot toward the desk, so the room reads as a lived-in bedroom study.
function Bed({ colors }) {
  return <group position={[9.2, -1.5, -1.6]} rotation={[0, -Math.PI / 2, 0]} scale={1.4}>
    <mesh position={[0, 0.3, 0]}><boxGeometry args={[2.3, 0.45, 3.6]} /><meshStandardMaterial color={colors.board} roughness={0.8} /></mesh>
    {[[-1.05, -1.7], [1.05, -1.7], [-1.05, 1.7], [1.05, 1.7]].map(([x, z]) => <mesh key={x + ':' + z} position={[x, 0.06, z]}><boxGeometry args={[0.14, 0.12, 0.14]} /><meshStandardMaterial color={colors.frame} /></mesh>)}
    <mesh position={[0, 1.05, -1.75]}><boxGeometry args={[2.4, 1.6, 0.14]} /><meshStandardMaterial color={colors.board} roughness={0.8} /></mesh>
    <mesh position={[0, 0.72, 0.05]}><boxGeometry args={[2.1, 0.4, 3.35]} /><meshStandardMaterial color={colors.paper} roughness={0.95} /></mesh>
    <mesh position={[0, 0.95, 0.45]}><boxGeometry args={[2.2, 0.1, 2.5]} /><meshStandardMaterial color={colors.curtain} roughness={0.95} /></mesh>
    <mesh position={[0, 0.98, -0.75]}><boxGeometry args={[2.2, 0.06, 0.35]} /><meshStandardMaterial color={colors.paper} roughness={0.95} /></mesh>
    <mesh position={[0, 1.08, -1.3]} rotation={[0.25, 0, 0]}><boxGeometry args={[1.5, 0.22, 0.55]} /><meshStandardMaterial color={colors.paper} roughness={0.95} /></mesh>
    <mesh position={[0, 0.7, 1.73]}><boxGeometry args={[2.25, 0.35, 0.1]} /><meshStandardMaterial color={colors.curtain} roughness={0.95} /></mesh>
  </group>;
}

export default function RoomSurroundings({ colors }) {
  return <MergeStatic deps={[colors]}>
    {/* The low dado and baseboard give the wall a floor junction without filling the welcome area. */}
    <mesh position={[0, -0.43, -4.96]}><boxGeometry args={[40, 2.15, 0.045]} /><meshStandardMaterial color={colors.wainscot} roughness={0.95} /></mesh>
    {[0.66, -1.38].map(y => <mesh key={y} position={[0, y, -4.87]}><boxGeometry args={[40, 0.1, 0.12]} /><meshStandardMaterial color={colors.trim} roughness={0.8} /></mesh>)}
    {Array.from({ length: 15 }, (_, i) => <mesh key={i} position={[(i - 7) * 1.15, -1.505, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.13, 25]} /><meshStandardMaterial color={i % 3 ? colors.floor : colors.floorAlternate} roughness={0.9} /></mesh>)}
    <mesh position={[5.2, 3.53, -4.67]}><boxGeometry args={[3.45, 0.12, 0.52]} /><meshStandardMaterial color={colors.retroShell} roughness={0.75} /></mesh>
    <SillPlant colors={colors} />
    <WorkInProgress colors={colors} />
    <Bed colors={colors} />
    <mesh position={[3.55, 0.797, 1.65]}><cylinderGeometry args={[0.37, 0.37, 0.025, 24]} /><meshStandardMaterial color={colors.cork} roughness={1} /></mesh>
  </MergeStatic>;
}
