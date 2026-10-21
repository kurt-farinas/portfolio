import React, { useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Shape } from 'three';

// A flat black cat that leaps up and slams against the outside of the back-wall window, hisses, then drops away.
// Same flat, unlit style as the window landscape; it lives between the landscape (z 0.071-0.079) and the mullions.
export const CAT_DURATION = 2.1;
const HOLD_END = 1.6;
const easeOut = t => 1 - (1 - t) * (1 - t);

// Pose for an elapsed time: lift (window units), scale, opacity, and how far the paws have slid down the glass.
export function catPose(elapsed, still = false) {
  if (elapsed < 0 || elapsed >= CAT_DURATION) return null;
  if (still) return { y: 0, scale: 1, opacity: 1, slide: 0, blink: false };
  if (elapsed < 0.12) { const t = easeOut(elapsed / 0.12); return { y: -0.7 * (1 - t), scale: 0.45 + 0.75 * t, opacity: t, slide: 0, blink: false }; }
  if (elapsed < 0.24) { const t = (elapsed - 0.12) / 0.12; return { y: 0, scale: 1.2 - 0.2 * t, opacity: 1, slide: 0, blink: false }; }
  if (elapsed < HOLD_END) return { y: 0, scale: 1, opacity: 1, slide: (elapsed - 0.24) * 0.08, blink: elapsed > 1 && elapsed < 1.08 };
  const t = (elapsed - HOLD_END) / (CAT_DURATION - HOLD_END);
  return { y: -0.9 * t * t, scale: 1, opacity: 1 - t, slide: 0.08, blink: false };
}

function triangle(points) {
  const shape = new Shape();
  shape.moveTo(...points[0]); points.slice(1).forEach(point => shape.lineTo(...point)); shape.closePath();
  return shape;
}

// Layers are drawn in a fixed order (renderOrder) instead of by camera distance, which is ambiguous for coplanar parts.
function CatPart({ layer, color, register, children, ...props }) {
  return <mesh renderOrder={10 + layer} {...props}>{children}<meshBasicMaterial ref={register} color={color} transparent opacity={0} depthWrite={false} toneMapped={false} /></mesh>;
}

const WindowCat = React.forwardRef(function WindowCat({ colors, still, onShake }, ref) {
  const group = useRef(null);
  const paws = useRef(null);
  const eyes = useRef(null);
  const start = useRef(-1);
  const materials = useRef([]);
  const invalidate = useThree(state => state.invalidate);
  const shapes = useMemo(() => ({
    ear: triangle([[-0.13, 0], [0.13, 0], [0.02, 0.28]]),
    innerEar: triangle([[-0.07, 0.02], [0.07, 0.02], [0.01, 0.17]]),
    nose: triangle([[-0.045, 0.03], [0.045, 0.03], [0, -0.03]]),
    fang: triangle([[-0.02, 0], [0.02, 0], [0, -0.06]])
  }), []);
  const register = useCallback(material => { if (material && !materials.current.includes(material)) materials.current.push(material); }, []);
  useImperativeHandle(ref, () => ({
    leap() { if (start.current < 0) { start.current = performance.now(); invalidate(); return true; } return false; },
    get active() { return start.current >= 0; }
  }), [invalidate]);
  useFrame(() => {
    if (start.current < 0 || !group.current) return;
    const elapsed = (performance.now() - start.current) / 1000;
    const pose = catPose(elapsed, still);
    if (!pose) {
      start.current = -1; group.current.visible = false; onShake?.(0); invalidate();
      return;
    }
    group.current.visible = true;
    group.current.position.y = 0.42 + pose.y;
    group.current.scale.setScalar(pose.scale * 0.85);
    materials.current.forEach(material => { material.opacity = pose.opacity; });
    if (paws.current) paws.current.position.y = -pose.slide;
    if (eyes.current) eyes.current.scale.y = pose.blink ? 0.12 : 1;
    // The impact rattles the window frame for a moment.
    onShake?.(!still && elapsed > 0.1 && elapsed < 0.4 ? Math.sin(elapsed * 90) * 0.025 * (0.4 - elapsed) / 0.3 : 0);
    invalidate();
  });
  const fur = colors.catFur, eye = colors.catEye, pink = colors.catPink, white = colors.paper;
  return <group ref={group} position={[-0.72, 0.42, 0.081]} visible={false}>
    <CatPart register={register} layer={1} color={fur} position={[0, -0.72, 0]} scale={[1.25, 0.75, 1]}><circleGeometry args={[0.5, 24]} /></CatPart>
    {[-1, 1].map(side => <group key={side} position={[side * 0.27, 0.36, 0.001]} rotation={[0, 0, -side * 0.25]}>
      <CatPart register={register} layer={2} color={fur}><shapeGeometry args={[shapes.ear]} /></CatPart>
      <CatPart register={register} layer={3} color={pink} position={[0, 0, 0.001]}><shapeGeometry args={[shapes.innerEar]} /></CatPart>
    </group>)}
    <CatPart register={register} layer={2} color={fur} position={[0, 0.05, 0.002]} scale={[1.12, 1, 1]}><circleGeometry args={[0.4, 28]} /></CatPart>
    <group ref={eyes} position={[0, 0.1, 0.003]}>
      <CatPart register={register} layer={5} color={eye} position={[-0.16, 0, 0]} scale={[1, 1.15, 1]}><circleGeometry args={[0.095, 20]} /></CatPart>
      <CatPart register={register} layer={5} color={eye} position={[0.16, 0, 0]} scale={[1, 1.15, 1]}><circleGeometry args={[0.095, 20]} /></CatPart>
      <CatPart register={register} layer={6} color={fur} position={[-0.16, 0, 0.001]}><planeGeometry args={[0.035, 0.15]} /></CatPart>
      <CatPart register={register} layer={6} color={fur} position={[0.16, 0, 0.001]}><planeGeometry args={[0.035, 0.15]} /></CatPart>
    </group>
    <CatPart register={register} layer={3} color={pink} position={[0, -0.06, 0.003]}><shapeGeometry args={[shapes.nose]} /></CatPart>
    {/* Hissing mouth with two fangs. */}
    <CatPart register={register} layer={3} color={pink} position={[0, -0.17, 0.003]} scale={[1.3, 0.75, 1]}><circleGeometry args={[0.08, 20]} /></CatPart>
    {[-1, 1].map(side => <CatPart register={register} layer={4} color={white} key={side} position={[side * 0.05, -0.12, 0.004]}><shapeGeometry args={[shapes.fang]} /></CatPart>)}
    {[-1, 1].flatMap(side => [-1, 0, 1].map(row => <CatPart register={register} layer={4} color={white} key={side + ':' + row} position={[side * 0.36, -0.08 + row * 0.045, 0.004]} rotation={[0, 0, side * row * -0.12]}>
      <planeGeometry args={[0.3, 0.012]} /></CatPart>))}
    {/* Front paws splayed on the glass, toe beans and all. */}
    <group ref={paws}>
      {[-1, 1].map(side => <group key={side} position={[side * 0.5, -0.22, 0.004]}>
        <CatPart register={register} layer={4} color={fur} scale={[0.85, 1, 1]}><circleGeometry args={[0.15, 20]} /></CatPart>
        <CatPart register={register} layer={5} color={pink} position={[0, -0.03, 0.001]}><circleGeometry args={[0.05, 14]} /></CatPart>
        {[-0.07, 0, 0.07].map(x => <CatPart register={register} layer={5} color={pink} key={x} position={[x, 0.06 + (x ? 0 : 0.02), 0.001]}><circleGeometry args={[0.025, 10]} /></CatPart>)}
      </group>)}
    </group>
  </group>;
});

export default WindowCat;
