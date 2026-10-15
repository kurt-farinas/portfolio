import React, { useEffect, useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { CanvasTexture, SRGBColorSpace } from 'three';

// Geometry and a small procedural label echo the owner's Hawas Ice reference photo.
export default function HawasIceBottle({ colors, onOpen, position = [0, 0, 0], scale = 1, label = 'Rasasi Hawas Ice' }) {
  const textures = useMemo(() => {
    const body = document.createElement('canvas'); body.width = 64; body.height = 128;
    const paint = body.getContext('2d');
    const tint = paint.createLinearGradient(0, 0, 0, 128);
    tint.addColorStop(0, colors.hawasTop); tint.addColorStop(0.5, colors.hawasBlue); tint.addColorStop(1, colors.hawasBase);
    paint.fillStyle = tint; paint.fillRect(0, 0, 64, 128);
    const label = document.createElement('canvas'); label.width = 256; label.height = 320;
    const ink = label.getContext('2d'); ink.textAlign = 'center'; ink.fillStyle = colors.hawasInk;
    ink.font = '40px Georgia, serif'; ink.fillText('HAWAS', 128, 112);
    ink.font = '13px Arial, sans-serif'; ink.fillText('For Him', 128, 137);
    ink.font = 'bold 24px Arial, sans-serif'; ink.fillText('I C E', 128, 190);
    ink.font = 'italic 15px Georgia, serif'; ink.fillText('RASASI', 128, 281);
    return [body, label].map(canvas => { const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture; });
  }, [colors.hawasTop, colors.hawasBlue, colors.hawasBase, colors.hawasInk]);
  useEffect(() => () => textures.forEach(texture => texture.dispose()), [textures]);
  return <group position={position} scale={scale} userData={{ label }} onClick={event => { event.stopPropagation(); onOpen(); }}>
    <RoundedBox args={[0.58, 0.8, 0.34]} radius={0.12} smoothness={4} position={[0, 0.4, 0]}>
      <meshPhysicalMaterial map={textures[0]} roughness={0.2} clearcoat={1} clearcoatRoughness={0.12} />
    </RoundedBox>
    <mesh position={[0, 0.41, 0.172]}><planeGeometry args={[0.43, 0.56]} /><meshBasicMaterial map={textures[1]} transparent depthWrite={false} toneMapped={false} /></mesh>
    <mesh position={[0, 0.81, 0]}><cylinderGeometry args={[0.082, 0.095, 0.05, 20]} /><meshStandardMaterial color={colors.hawasCap} metalness={0.35} roughness={0.35} /></mesh>
    <group position={[0, 0.94, 0]}>
      <mesh><cylinderGeometry args={[0.125, 0.103, 0.22, 24]} /><meshStandardMaterial color={colors.hawasCap} roughness={0.5} /></mesh>
      {[-0.005, 0.04, 0.085].map(y => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0.1, 0]}><torusGeometry args={[0.123, 0.018, 6, 24]} /><meshStandardMaterial color={colors.hawasCap} roughness={0.6} /></mesh>)}
    </group>
  </group>;
}
