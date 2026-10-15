import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { CatmullRomCurve3, SRGBColorSpace, TextureLoader, Vector3 } from 'three';
import GamingCRT from './GamingCRT';
import { playstationCollection } from '../../data/playstationCollection';

// Optional cover art must never make the whole room fail. Each texture is owned here.
function Cover({ game, position, rotation = [0, 0, 0], size = 0.5 }) {
  const [map, setMap] = useState(null);
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => {
    let disposed = false;
    const texture = new TextureLoader().load(game.image, loaded => {
      if (disposed) return;
      loaded.colorSpace = SRGBColorSpace; setMap(loaded); invalidate();
    }, undefined, () => { if (!disposed) invalidate(); });
    return () => { disposed = true; texture.dispose(); };
  }, [game.image, invalidate]);
  return map ? <mesh position={position} rotation={rotation}><planeGeometry args={[size, size]} /><meshBasicMaterial map={map} toneMapped={false} /></mesh> : null;
}

export default function PlayStationCorner({ colors, animate }) {
  const indicator = useRef(null);
  const cable = useMemo(() => new CatmullRomCurve3([
    new Vector3(-0.35, 0.18, 0.36), new Vector3(-0.52, 0.08, 0.55),
    new Vector3(-0.06, 0.08, 0.64), new Vector3(0.34, 0.08, 0.47), new Vector3(0.16, 0.13, 0.35)
  ]), []);
  return <><GamingCRT colors={colors} animate={animate} indicator={indicator} /><group position={[-5.4, 1.66, -4.35]}>
    {/* Compact gray console, circular lid, vents, ports, memory card and power lamp. */}
    <group position={[-0.22, 0, 0]} rotation={[0, -0.06, 0]}>
      <RoundedBox args={[1.25, 0.22, 0.85]} radius={0.045} smoothness={2} position={[0, 0.13, 0]}><meshStandardMaterial color={colors.fragranceStone} roughness={0.78} /></RoundedBox>
      <mesh position={[0, 0.248, 0]}><cylinderGeometry args={[0.35, 0.35, 0.018, 32]} /><meshStandardMaterial color={colors.hardwareDetail} roughness={0.8} /></mesh>
      <mesh position={[0, 0.26, 0]}><cylinderGeometry args={[0.328, 0.328, 0.01, 32]} /><meshStandardMaterial color={colors.fragranceStone} roughness={0.72} /></mesh>
      <mesh position={[0, 0.268, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.09, 0.04]} /><meshStandardMaterial color={colors.pin} /></mesh>
      {[-0.49, 0.49].map(x => <group key={x}>
        <mesh position={[x, 0.25, 0.23]}><cylinderGeometry args={[0.085, 0.085, 0.02, 16]} /><meshStandardMaterial color={colors.hardwareDetail} /></mesh>
        {[-0.27, -0.2, -0.13, -0.06, 0.01].map(z => <mesh key={z} position={[x, 0.247, z]}><boxGeometry args={[0.13, 0.008, 0.018]} /><meshStandardMaterial color={colors.hardwareEdge} /></mesh>)}
      </group>)}
      {[-0.3, 0.3].map(x => <group key={x}>
        <mesh position={[x, 0.115, 0.431]}><boxGeometry args={[0.23, 0.065, 0.012]} /><meshStandardMaterial color={colors.hardwareEdge} /></mesh>
        <mesh position={[x, 0.19, 0.432]}><boxGeometry args={[0.25, 0.023, 0.015]} /><meshStandardMaterial color={colors.hardwareDetail} /></mesh>
      </group>)}
      <mesh position={[0.3, 0.19, 0.47]}><boxGeometry args={[0.18, 0.04, 0.1]} /><meshStandardMaterial color={colors.fragranceStone} /></mesh>
      <mesh position={[-0.49, 0.264, 0.32]}><boxGeometry args={[0.045, 0.008, 0.02]} /><meshBasicMaterial ref={indicator} color={colors.led} toneMapped={false} /></mesh>
    </group>
    <mesh><tubeGeometry args={[cable, 24, 0.012, 5, false]} /><meshStandardMaterial color={colors.hardwareEdge} roughness={0.9} /></mesh>
    <group position={[0.28, 0.085, 0.48]} rotation={[0, -0.3, 0]}>
      <RoundedBox args={[0.5, 0.11, 0.2]} radius={0.04} smoothness={2}><meshStandardMaterial color={colors.fragranceStone} roughness={0.85} /></RoundedBox>
      {[-0.2, 0.2].map(x => <mesh key={x} position={[x, -0.01, 0.08]} rotation={[0.3, 0, x]}><capsuleGeometry args={[0.075, 0.12, 3, 8]} /><meshStandardMaterial color={colors.fragranceStone} /></mesh>)}
      <mesh position={[-0.15, 0.063, 0]}><boxGeometry args={[0.11, 0.012, 0.035]} /><meshStandardMaterial color={colors.hardwareEdge} /></mesh>
      <mesh position={[-0.15, 0.063, 0]}><boxGeometry args={[0.035, 0.012, 0.11]} /><meshStandardMaterial color={colors.hardwareEdge} /></mesh>
      {[[0.15, -0.045, colors.plant], [0.105, 0, colors.books[0]], [0.195, 0, colors.pin]].map(([x, z, color]) => <mesh key={x} position={[x, 0.075, z]}><cylinderGeometry args={[0.02, 0.02, 0.014, 8]} /><meshStandardMaterial color={color} /></mesh>)}
      <mesh position={[0.15, 0.075, 0.045]}><cylinderGeometry args={[0.02, 0.02, 0.014, 8]} /><meshStandardMaterial color={colors.books[2]} /></mesh>
    </group>
    {playstationCollection.map((game, i) => {
      const standing = i < 2;
      return <group key={game.id} position={standing ? [0.79 + i * 0.58, 0.29, -0.15] : [1.04, 0.06 + (i - 2) * 0.06, 0.39]} rotation={[0, standing ? -0.12 : (i - 2) * 0.09, 0]}>
        <mesh><boxGeometry args={standing ? [0.54, 0.54, 0.055] : [0.54, 0.055, 0.54]} /><meshStandardMaterial color={colors.hardwareEdge} roughness={0.4} /></mesh>
        <Cover game={game} position={standing ? [0, 0, 0.029] : [0, 0.029, 0]} rotation={standing ? [0, 0, 0] : [-Math.PI / 2, 0, 0]} />
      </group>;
    })}
  </group></>;
}
