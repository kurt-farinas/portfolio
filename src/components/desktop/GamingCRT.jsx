import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { CanvasTexture, NearestFilter, SRGBColorSpace } from 'three';
import { useDesktopWorkspace } from '../../context/DesktopWorkspaceContext';
import { useRetroOS } from '../../context/RetroOSContext';
import { createFightingClock, drawFightingDemo, fightingPose } from './fightingDemo';
import MergeStatic from './MergeStatic';

export default function GamingCRT({ colors, animate, indicator }) {
  const { getAppState, setAppState } = useDesktopWorkspace();
  const { playSound } = useRetroOS();
  const lastBeat = useRef(null);
  const clock = useRef(null);
  if (!clock.current) clock.current = createFightingClock(getAppState('room:gaming-crt', 0));
  const display = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 120;
    const context = canvas.getContext('2d'); context.imageSmoothingEnabled = false;
    drawFightingDemo(context, colors, fightingPose(Math.floor(clock.current.time * 12) / 12));
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace;
    texture.minFilter = NearestFilter; texture.magFilter = NearestFilter; texture.generateMipmaps = false;
    return { texture, context };
  }, [colors]);
  useEffect(() => () => display.texture.dispose(), [display]);
  // Existing in-memory room state preserves the phase if expanded view unmounts 3D.
  useEffect(() => () => setAppState('room:gaming-crt', clock.current.time), [setAppState]);
  useFrame((_, delta) => {
    const time = clock.current.step(delta, animate && document.visibilityState !== 'hidden');
    if (time === null) return;
    const pose = fightingPose(time);
    // A chiptune hit each time a fighter lands a strike (the 12 s loop peaks at 4.5 s and 9.5 s).
    const beat = ((time % 12) + 12) % 12;
    if (lastBeat.current !== null && [4.5, 9.5].some(peak => lastBeat.current < peak && beat >= peak)) playSound('chip');
    lastBeat.current = beat;
    drawFightingDemo(display.context, colors, pose); display.texture.needsUpdate = true;
    indicator.current?.color.set(colors.led).multiplyScalar(pose.indicator);
  });
  return <MergeStatic deps={[colors]}><group position={[-7.1, 2.01, -4.35]} rotation={[0, 0.06, 0]}>
    <RoundedBox args={[1.1, 0.7, 0.85]} radius={0.045} smoothness={2}><meshStandardMaterial color={colors.fragranceStone} roughness={0.8} /></RoundedBox>
    <RoundedBox args={[0.84, 0.6, 0.055]} radius={0.035} smoothness={2} position={[-0.055, 0.01, 0.43]}><meshStandardMaterial color={colors.hardwareEdge} roughness={0.7} /></RoundedBox>
    <mesh position={[-0.055, 0.01, 0.461]}><planeGeometry args={[0.76, 0.57]} /><meshBasicMaterial map={display.texture} toneMapped={false} /></mesh>
    {[0, 1, 2, 3, 4, 5].map(i => <mesh key={i} position={[0.455, 0.17 - i * 0.047, 0.43]}><boxGeometry args={[0.08, 0.012, 0.009]} /><meshStandardMaterial color={colors.hardwareDetail} /></mesh>)}
    {[-0.18, -0.26].map(y => <mesh key={y} rotation={[Math.PI / 2, 0, 0]} position={[0.45, y, 0.445]}><cylinderGeometry args={[0.025, 0.025, 0.024, 10]} /><meshStandardMaterial color={colors.hardwareEdge} /></mesh>)}
    {[-0.38, 0.38].map(x => <mesh key={x} position={[x, -0.36, 0]}><boxGeometry args={[0.12, 0.04, 0.53]} /><meshStandardMaterial color={colors.hardwareEdge} /></mesh>)}
  </group></MergeStatic>;
}
