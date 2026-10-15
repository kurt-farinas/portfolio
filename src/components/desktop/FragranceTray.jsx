import React, { useEffect, useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { gearCatalogData } from '../../data/projectData';
import HawasIceBottle from './HawasIceBottle';

const BOTTLES = ['hawas-ice', 'afnan-sce', 'liquid-brun', 'jaguar-red'].map(id => gearCatalogData.find(item => item.id === id));

function CollectionBottle({ item, colors, position, onOpen }) {
  const afnan = item.id === 'afnan-sce';
  const brun = item.id === 'liquid-brun';
  const textures = useMemo(() => {
    const body = document.createElement('canvas'); body.width = 128; body.height = 256;
    const paint = body.getContext('2d');
    paint.fillStyle = afnan ? colors.fragranceStone : brun ? colors.fragranceBrown : colors.fragranceRed;
    paint.fillRect(0, 0, 128, 256);
    if (afnan) {
      paint.fillStyle = colors.objectDark;
      for (let i = 0; i < 160; i++) {
        const x = (Math.sin(i * 78.23) + 1) * 64;
        const y = (Math.cos(i * 37.17) + 1) * 128;
        paint.fillRect(x, y, 0.6 + i % 2, 0.6 + i % 3);
      }
    }
    const label = document.createElement('canvas'); label.width = 256; label.height = 256;
    const ink = label.getContext('2d'); ink.textAlign = 'center';
    ink.fillStyle = afnan || brun ? colors.fragranceGold : colors.hawasInk;
    ink.font = '22px Georgia, serif';
    const lines = []; let line = '';
    item.title.toUpperCase().split(' ').forEach(word => {
      if (line && ink.measureText(line + ' ' + word).width > 230) { lines.push(line); line = word; }
      else line = line ? line + ' ' + word : word;
    });
    lines.push(line);
    lines.forEach((text, index) => ink.fillText(text, 128, 130 + index * 28));
    return [body, label].map(canvas => { const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture; });
  }, [afnan, brun, item.title, colors.fragranceStone, colors.fragranceBrown, colors.fragranceRed, colors.fragranceGold, colors.hawasInk, colors.objectDark]);
  useEffect(() => () => textures.forEach(texture => texture.dispose()), [textures]);
  return <group position={position} scale={0.75} userData={{ label: item.title }} onClick={event => { event.stopPropagation(); onOpen(item); }}>
    {afnan ? <>
      <RoundedBox args={[0.58, 0.75, 0.34]} radius={0.07} smoothness={2} position={[0, 0.375, 0]}><meshStandardMaterial map={textures[0]} roughness={0.7} /></RoundedBox>
      <mesh position={[0, 0.85, 0]}><cylinderGeometry args={[0.105, 0.105, 0.2, 20]} /><meshStandardMaterial color={colors.objectDark} roughness={0.3} metalness={0.4} /></mesh>
      <mesh position={[0, 1.05, 0]}><torusGeometry args={[0.15, 0.022, 6, 24]} /><meshStandardMaterial color={colors.objectDark} metalness={0.5} roughness={0.3} /></mesh>
      <mesh position={[0.13, 0.58, 0.177]}><circleGeometry args={[0.07, 12]} /><meshStandardMaterial color={colors.objectDark} roughness={0.5} /></mesh>
    </> : brun ? <>
      <group position={[0, 0.46, 0]} scale={[1, 1, 0.65]}><mesh rotation={[0, Math.PI / 4, 0]}><cylinderGeometry args={[0.3, 0.34, 0.86, 4]} /><meshStandardMaterial map={textures[0]} roughness={0.7} /></mesh></group>
      {[0.04, 0.92].map(y => <mesh key={y} position={[0, y, 0]}><boxGeometry args={[0.48, 0.05, 0.3]} /><meshStandardMaterial color={colors.fragranceGold} metalness={0.65} roughness={0.3} /></mesh>)}
      <mesh position={[0, 1, 0]}><cylinderGeometry args={[0.13, 0.13, 0.12, 16]} /><meshStandardMaterial color={colors.fragranceGold} metalness={0.65} roughness={0.3} /></mesh>
      <RoundedBox args={[0.48, 0.25, 0.31]} radius={0.02} smoothness={2} position={[0, 1.16, 0]}><meshPhysicalMaterial color={colors.fragranceBrown} clearcoat={0.7} roughness={0.35} /></RoundedBox>
      <mesh position={[0, 0.62, 0.165]}><boxGeometry args={[0.14, 0.16, 0.025]} /><meshStandardMaterial color={colors.fragranceGold} metalness={0.6} roughness={0.3} /></mesh>
    </> : <>
      <RoundedBox args={[0.6, 0.78, 0.35]} radius={0.12} smoothness={3} position={[0, 0.39, 0]}><meshStandardMaterial color={colors.fragranceSilver} metalness={0.65} roughness={0.25} /></RoundedBox>
      <RoundedBox args={[0.48, 0.62, 0.025]} radius={0.01} smoothness={2} position={[0, 0.38, 0.182]}><meshPhysicalMaterial map={textures[0]} clearcoat={1} roughness={0.2} /></RoundedBox>
      <mesh position={[0, 0.84, 0]}><cylinderGeometry args={[0.09, 0.16, 0.12, 20]} /><meshStandardMaterial color={colors.fragranceSilver} metalness={0.7} roughness={0.2} /></mesh>
      <mesh position={[0, 0.98, 0]}><cylinderGeometry args={[0.1, 0.1, 0.2, 20]} /><meshStandardMaterial color={colors.fragranceSilver} metalness={0.7} roughness={0.2} /></mesh>
    </>}
    <mesh position={[0, 0.38, afnan ? 0.172 : brun ? 0.16 : 0.2]}><planeGeometry args={[0.38, 0.4]} /><meshBasicMaterial map={textures[1]} transparent depthWrite={false} toneMapped={false} /></mesh>
  </group>;
}

export default function FragranceTray({ colors, onOpenCollection, onOpenPhoto }) {
  return <group position={[4.65, 0.79, 0.05]} userData={{ label: 'Gear & Collections' }} onClick={event => { event.stopPropagation(); onOpenCollection(); }}>
    <RoundedBox args={[2.2, 0.055, 0.95]} radius={0.025} smoothness={2} position={[0, 0.025, 0]}><meshStandardMaterial color={colors.board} roughness={0.8} /></RoundedBox>
    <mesh position={[0, 0.055, 0]}><boxGeometry args={[2.06, 0.01, 0.81]} /><meshStandardMaterial color={colors.coffee} roughness={1} /></mesh>
    {[-1, 1].map(side => <React.Fragment key={side}>
      <mesh position={[side * 1.06, 0.07, 0]}><boxGeometry args={[0.08, 0.1, 0.95]} /><meshStandardMaterial color={colors.board} roughness={0.8} /></mesh>
      <mesh position={[0, 0.07, side * 0.435]}><boxGeometry args={[2.05, 0.1, 0.08]} /><meshStandardMaterial color={colors.board} roughness={0.8} /></mesh>
    </React.Fragment>)}
    {BOTTLES.map((item, index) => {
      const position = [-0.78 + index * 0.52, 0.065, index % 2 ? -0.08 : 0.08];
      return item.id === 'hawas-ice'
        ? <HawasIceBottle key={item.id} colors={colors} position={position} scale={0.75} label={item.title} onOpen={() => onOpenPhoto(item)} />
        : <CollectionBottle key={item.id} item={item} colors={colors} position={position} onOpen={onOpenPhoto} />;
    })}
  </group>;
}
