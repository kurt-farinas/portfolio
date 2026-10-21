import React, { useMemo } from 'react';
import { useAsk } from '../common/AskOverlay';
import MergeStatic from './MergeStatic';

function readColor(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

// A rubber debugging duck on the front-left of the desk; clicking it opens the Ask anything prank.
export default function RubberDuck({ colors }) {
  const { openAsk } = useAsk();
  // The palette object changes with the theme, so re-read the duck tokens alongside it.
  const duck = useMemo(() => ({ body: readColor('--desk-duck', '#f2c230'), beak: readColor('--desk-duck-beak', '#e0782a') }), [colors]);
  return <MergeStatic deps={[colors, duck]}>
    <group position={[-3.85, 0.78, 1.8]} rotation={[0, 0.45, 0]} userData={{ label: 'Ask anything' }} onClick={event => { event.stopPropagation(); openAsk(); }}>
      <mesh position={[0, 0.15, 0]} scale={[1, 0.72, 1.25]}><sphereGeometry args={[0.2, 24, 16]} /><meshStandardMaterial color={duck.body} roughness={0.35} /></mesh>
      <mesh position={[0, 0.25, -0.22]} rotation={[-0.9, 0, 0]}><coneGeometry args={[0.07, 0.14, 12]} /><meshStandardMaterial color={duck.body} roughness={0.35} /></mesh>
      <mesh position={[0, 0.36, 0.09]}><sphereGeometry args={[0.12, 24, 16]} /><meshStandardMaterial color={duck.body} roughness={0.35} /></mesh>
      <mesh position={[0, 0.34, 0.22]} scale={[1, 0.45, 1]}><sphereGeometry args={[0.06, 16, 12]} /><meshStandardMaterial color={duck.beak} roughness={0.4} /></mesh>
      <mesh position={[0.055, 0.4, 0.19]}><sphereGeometry args={[0.018, 10, 8]} /><meshStandardMaterial color={colors.noteInk} roughness={0.3} /></mesh>
      <mesh position={[-0.055, 0.4, 0.19]}><sphereGeometry args={[0.018, 10, 8]} /><meshStandardMaterial color={colors.noteInk} roughness={0.3} /></mesh>
    </group>
  </MergeStatic>;
}
