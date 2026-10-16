import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { CatmullRomCurve3, Vector3 } from 'three';
import { snapshotsDeckData } from '../../data/projectData';
import optimized from '../../data/optimizedImageManifest.json';
import fitTexture from './fitTexture';

// A string of warm fairy lights in two swags across the back wall, with After Hours photos pegged on as polaroids.
// Pinned high at both ends and the middle; sags clear of the monitor, certificate, and window.
const WALL_Z = -4.88;
const CURVE = new CatmullRomCurve3([[-2.6, 5.65], [-1.5, 5.12], [-0.4, 5.6], [0.7, 5.06], [1.8, 5.6]].map(([x, y]) => new Vector3(x, y, WALL_Z)));
const BULB_COUNT = 14;
const BULBS = Array.from({ length: BULB_COUNT }, (_, i) => CURVE.getPointAt((i + 0.5) / BULB_COUNT));
// Newest snapshots (10-12) alternate with two earlier ones along the string.
const PHOTOS = [9, 0, 10, 4, 11].map(index => snapshotsDeckData[index]).filter(Boolean);
const PHOTO_AT = [0.13, 0.31, 0.5, 0.69, 0.87];
const TILT = [0.07, -0.05, 0.04, -0.08, 0.05];
const GLOW_LIGHTS = [-1.5, 0.1, 1.3];

function Polaroid({ photo, texture, index, colors, animate, onOpen }) {
  const swing = useRef(null);
  const hovered = useRef(false);
  const anchor = CURVE.getPointAt(PHOTO_AT[index]);
  useFrame(({ clock }) => {
    if (!swing.current) return;
    const amount = hovered.current ? 0.09 : 0.025;
    swing.current.rotation.z = TILT[index] + (animate ? Math.sin(clock.getElapsedTime() * 1.1 + index * 1.9) * amount : 0);
  });
  return <group position={[anchor.x, anchor.y, WALL_Z + 0.03]}>
    <group ref={swing} rotation={[0, 0, TILT[index]]} userData={{ label: 'Photo: ' + photo.subtitle }}
      onPointerOver={() => { hovered.current = true; }} onPointerOut={() => { hovered.current = false; }}
      onClick={event => { event.stopPropagation(); onOpen(photo); }}>
      <mesh position={[0, -0.01, 0.02]}><boxGeometry args={[0.06, 0.14, 0.03]} /><meshStandardMaterial color={colors.accent} roughness={0.8} /></mesh>
      <mesh position={[0, -0.4, 0]}><boxGeometry args={[0.58, 0.7, 0.008]} /><meshStandardMaterial color={colors.paper} roughness={0.92} /></mesh>
      <mesh position={[0, -0.35, 0.006]}><planeGeometry args={[0.5, 0.5]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
    </group>
  </group>;
}

export default function FairyLights({ colors, animate, lit, onOpenPhoto }) {
  const sources = useTexture(PHOTOS.map(photo => optimized[photo.src] || photo.src));
  const textures = useMemo(() => sources.map(source => {
    const texture = fitTexture(source);
    // Crop each photo to a square, centred.
    const aspect = source.image.width / source.image.height;
    if (aspect > 1) { texture.repeat.set(1 / aspect, 1); texture.offset.set((1 - 1 / aspect) / 2, 0); }
    else { texture.repeat.set(1, aspect); texture.offset.set(0, (1 - aspect) / 2); }
    texture.needsUpdate = true;
    return texture;
  }), [sources]);
  useEffect(() => () => textures.forEach(texture => texture.dispose()), [textures]);
  const wire = useMemo(() => CURVE, []);
  const bulbs = useRef([]);
  useFrame(({ clock }) => {
    if (!lit) return;
    const t = clock.getElapsedTime();
    bulbs.current.forEach((bulb, i) => {
      if (bulb) bulb.material.emissiveIntensity = animate ? 1.4 + Math.sin(t * 1.3 + i * 2.4) * 0.6 : 1.6;
    });
  });
  return <group>
    <mesh><tubeGeometry args={[wire, 120, 0.008, 6, false]} /><meshStandardMaterial color={colors.fairyWire} roughness={0.6} /></mesh>
    {BULBS.map((point, i) => <mesh key={i} ref={node => { bulbs.current[i] = node; }} position={[point.x, point.y - 0.04, point.z + 0.01]}>
      <sphereGeometry args={[0.045, 12, 10]} />
      <meshStandardMaterial color={colors.fairyBulb} emissive={colors.fairyBulb} emissiveIntensity={lit ? 1.6 : 0.05} roughness={0.3} />
    </mesh>)}
    {/* Hidden while off so daytime frames skip their lighting math; SceneReady precompiles shaders for both states. */}
    {GLOW_LIGHTS.map(x => <pointLight key={x} position={[x, 5.1, WALL_Z + 0.5]} color={colors.fairyBulb} intensity={1.5} distance={3.2} decay={2} visible={lit} userData={{ optionalLight: true }} />)}
    {PHOTOS.map((photo, index) => <Polaroid key={photo.id} photo={photo} texture={textures[index]} index={index} colors={colors} animate={animate} onOpen={onOpenPhoto} />)}
  </group>;
}
