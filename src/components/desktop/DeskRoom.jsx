import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { DoubleSide, PlaneGeometry } from 'three';
import RoomSurroundings from './RoomSurroundings';
import PlayStationCorner from './PlayStationCorner';
import MergeStatic from './MergeStatic';

// Room dressing around the desk. Motion runs only while `animate` is true (desk overview, tab visible, motion allowed);
// DeskScene's ambient driver supplies the frames, so the demand-rendered scene still sleeps otherwise.

function foldedPanel(width, height) {
  const geometry = new PlaneGeometry(width, height, 24, 1);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) position.setZ(i, Math.sin(position.getX(i) * 38) * 0.045);
  geometry.computeVertexNormals();
  return geometry;
}

function Curtains({ colors, animate }) {
  const panel = useMemo(() => foldedPanel(0.85, 2.9), []);
  useEffect(() => () => panel.dispose(), [panel]);
  const left = useRef(null);
  const right = useRef(null);
  useFrame(({ clock }) => {
    if (!animate || !left.current) return;
    const t = clock.getElapsedTime();
    left.current.rotation.x = Math.sin(t * 0.7) * 0.025;
    right.current.rotation.x = Math.sin(t * 0.7 + 1.3) * 0.025;
  });
  return <group position={[5.2, 6.35, -4.78]}>
    <mesh position={[0, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.035, 0.035, 4.3, 12]} /><meshStandardMaterial color={colors.curtainRod} metalness={0.4} roughness={0.5} /></mesh>
    {/* Each panel hangs from its top edge so the sway pivots at the rod. */}
    <group ref={left} position={[-1.55, 0, 0]}><mesh geometry={panel} position={[0, -1.45, 0]}><meshStandardMaterial color={colors.curtain} roughness={0.95} side={DoubleSide} /></mesh></group>
    <group ref={right} position={[1.55, 0, 0]}><mesh geometry={panel} position={[0, -1.45, 0]}><meshStandardMaterial color={colors.curtain} roughness={0.95} side={DoubleSide} /></mesh></group>
  </group>;
}

const LEAVES = [[0, 0.5, 0], [0.7, 0.42, 0.9], [-0.7, 0.45, -0.6], [1.4, 0.38, 2.1], [-1.3, 0.4, 2.6], [2.2, 0.34, -2.2]];
function Plant({ colors, animate }) {
  const leaves = useRef(null);
  useFrame(({ clock }) => {
    if (animate && leaves.current) leaves.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.03;
  });
  return <group position={[-5.3, 0.78, -2.5]}>
    <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.28, 0.22, 0.4, 24]} /><meshStandardMaterial color={colors.pot} roughness={0.8} /></mesh>
    <mesh position={[0, 0.39, 0]}><cylinderGeometry args={[0.25, 0.25, 0.02, 24]} /><meshStandardMaterial color={colors.coffee} roughness={1} /></mesh>
    <group ref={leaves} position={[0, 0.4, 0]}>
      {LEAVES.map(([tilt, height, turn]) => (
        <group key={turn} rotation={[0, turn, tilt * 0.35]}>
          <mesh position={[0, height, 0]} rotation={[0.25, 0, -0.22]} scale={[0.3, 1, 0.12]}><sphereGeometry args={[height, 8, 6]} /><meshStandardMaterial color={turn > 1 ? colors.leafLight : colors.plant} roughness={0.85} /></mesh>
        </group>
      ))}
    </group>
  </group>;
}

const BOOKS = [[0.12, 0.42, 0], [0.09, 0.36, 1], [0.14, 0.46, 2], [0.1, 0.4, 0], [0.13, 0.33, 1]];
function WallShelf({ colors }) {
  let x = -2.32;
  return <group position={[-6, 1.62, -4.35]}>
    <mesh><boxGeometry args={[4.8, 0.08, 1.1]} /><meshStandardMaterial color={colors.board} roughness={0.75} /></mesh>
    {BOOKS.map(([width, height, color], index) => {
      const book = <group key={index} position={[x + width / 2, 0.03 + height / 2, 0]}>
        <mesh><boxGeometry args={[width, height, 0.24]} /><meshStandardMaterial color={colors.books[color]} roughness={0.8} /></mesh>
        {[-0.3, 0.3].map(y => <mesh key={y} position={[0, height * y, 0.122]}><planeGeometry args={[width * 0.8, 0.015]} /><meshStandardMaterial color={colors.rugEdge} /></mesh>)}
      </group>;
      x += width + 0.015;
      return book;
    })}
    <group position={[-2.24, 0.17, 0.38]}>
      <mesh><cylinderGeometry args={[0.12, 0.09, 0.25, 10]} /><meshStandardMaterial color={colors.pot} roughness={0.9} /></mesh>
      {[0, 1, 2].map(vine => <group key={vine} position={[-0.04 + vine * 0.045, 0.07, 0.1]}>
        {[0, 1, 2, 3, 4].map(i => <mesh key={i} position={[Math.sin(i + vine) * 0.07, -i * 0.15, i * 0.025]} rotation={[0.1, 0, (i % 2 ? 1 : -1) * 0.6]} scale={[0.55, 1, 0.25]}><sphereGeometry args={[0.09, 6, 5]} /><meshStandardMaterial color={i % 2 ? colors.plant : colors.leafLight} roughness={0.9} /></mesh>)}
      </group>)}
    </group>
    <mesh position={[2.18, 0.2, -0.34]} rotation={[0, 0, -0.35]}><boxGeometry args={[0.12, 0.38, 0.24]} /><meshStandardMaterial color={colors.books[2]} roughness={0.8} /></mesh>
    {[-1.9, 1.9].map(x => <group key={x} position={[x, -0.14, -0.06]}>
      <mesh><boxGeometry args={[0.055, 0.25, 0.05]} /><meshStandardMaterial color={colors.curtainRod} /></mesh>
      <mesh position={[0, 0.04, 0.07]} rotation={[0.7, 0, 0]}><boxGeometry args={[0.055, 0.26, 0.04]} /><meshStandardMaterial color={colors.curtainRod} /></mesh>
    </group>)}
  </group>;
}

function Rug({ colors }) {
  return <group position={[0, -1.5, 0.6]}>
    <RoundedBox args={[9.6, 0.03, 5.6]} radius={0.01} smoothness={2}><meshStandardMaterial color={colors.rugEdge} roughness={1} /></RoundedBox>
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[9.1, 5.1]} /><meshStandardMaterial color={colors.rug} roughness={1} /></mesh>
    <mesh position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[8.75, 4.75]} /><meshStandardMaterial color={colors.rugEdge} roughness={1} /></mesh>
    <mesh position={[0, 0.024, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[8.65, 4.65]} /><meshStandardMaterial color={colors.rug} roughness={1} /></mesh>
    {[-3.3, -1.65, 0, 1.65, 3.3].map(x => <mesh key={x} position={[x, 0.026, 1.85]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}><planeGeometry args={[0.25, 0.25]} /><meshStandardMaterial color={colors.rugEdge} roughness={1} /></mesh>)}
  </group>;
}

const NOTES = [[-0.45, 0.12, -0.08], [0.12, 0.18, 0.06], [0.5, -0.12, -0.04], [-0.1, -0.2, 0.1]];
export function CorkBoard({ colors, onOpen }) {
  return <MergeStatic deps={[colors]}><group position={[4.4, 2.75, -4.9]} userData={{ label: 'Projects' }} onClick={event => { event.stopPropagation(); onOpen(); }}>
    <mesh><boxGeometry args={[1.7, 1.0, 0.06]} /><meshStandardMaterial color={colors.frame} roughness={0.7} /></mesh>
    <mesh position={[0, 0, 0.035]}><planeGeometry args={[1.56, 0.86]} /><meshStandardMaterial color={colors.cork} roughness={1} /></mesh>
    {NOTES.map(([x, y, turn], index) => <group key={index} position={[x, y, 0.04]} rotation={[0, 0, turn]}>
      <mesh><planeGeometry args={[0.36, 0.3]} /><meshStandardMaterial color={index % 2 ? colors.noteYellow : colors.paper} roughness={0.9} /></mesh>
      <mesh position={[0, 0.11, 0.02]}><sphereGeometry args={[0.025, 10, 8]} /><meshStandardMaterial color={colors.pin} /></mesh>
    </group>)}
  </group></MergeStatic>;
}

function Steam({ colors, animate }) {
  const puffs = useRef([]);
  useFrame(({ clock }) => {
    if (!animate) return;
    const t = clock.getElapsedTime();
    puffs.current.forEach((puff, index) => {
      if (!puff) return;
      const phase = (t * 0.25 + index / 3) % 1;
      puff.position.y = 0.5 + phase * 0.6;
      puff.position.x = Math.sin(t * 0.8 + index * 2) * 0.05;
      puff.material.opacity = Math.sin(phase * Math.PI) * 0.22;
    });
  });
  if (!animate) return null;
  return <group position={[3.55, 0.79, 1.65]}>
    {[0, 1, 2].map(index => <mesh key={index} ref={node => { puffs.current[index] = node; }}>
      <planeGeometry args={[0.12, 0.28]} /><meshBasicMaterial color={colors.paper} transparent opacity={0} depthWrite={false} />
    </mesh>)}
  </group>;
}

const MOTE_COUNT = 40;
function DustMotes({ colors, animate }) {
  const points = useRef(null);
  const seeds = useMemo(() => Array.from({ length: MOTE_COUNT }, (_, i) => [Math.sin(i * 12.9) * 0.6, (i * 0.37) % 1, Math.cos(i * 7.3) * 0.5, 0.5 + (i % 5) * 0.12]), []);
  const positions = useMemo(() => new Float32Array(MOTE_COUNT * 3), []);
  useFrame(({ clock }) => {
    if (!animate || !points.current) return;
    const t = clock.getElapsedTime();
    seeds.forEach(([x, y, z, speed], i) => {
      positions[i * 3] = x + Math.sin(t * 0.3 * speed + i) * 0.12;
      positions[i * 3 + 1] = 1.0 + ((y + t * 0.03 * speed) % 1) * 1.4;
      positions[i * 3 + 2] = z + Math.cos(t * 0.25 * speed + i) * 0.12;
    });
    points.current.geometry.attributes.position.needsUpdate = true;
  });
  if (!animate) return null;
  return <points ref={points} position={[-3.7, 0, 0]}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <pointsMaterial color={colors.paper} size={0.03} transparent opacity={0.55} depthWrite={false} />
  </points>;
}

export default function DeskRoom({ colors, animate, lampOn }) {
  return <>
    <RoomSurroundings colors={colors} />
    <Curtains colors={colors} animate={animate} />
    <Plant colors={colors} animate={animate} />
    <MergeStatic deps={[colors]}><WallShelf colors={colors} /><Rug colors={colors} /></MergeStatic>
    <PlayStationCorner colors={colors} animate={animate} />
    <Steam colors={colors} animate={animate} />
    {lampOn && <DustMotes colors={colors} animate={animate} />}
  </>;
}
