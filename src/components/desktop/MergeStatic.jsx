import React, { useLayoutEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Matrix4, Mesh } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

function materialKey(material) {
  return [material.type, material.color?.getHexString(), material.emissive?.getHexString(), material.emissiveIntensity,
    material.roughness, material.metalness, material.map?.uuid, material.side, material.toneMapped].join('|');
}
const noRaycast = () => {};
// Meshes merge only within their nearest interactive ancestor, so hover labels and click handlers keep their targets.
function ownerOf(node, root) {
  for (let parent = node.parent; parent && parent !== root; parent = parent.parent) {
    if (parent.userData?.label || parent.__r3f?.eventCount) return parent;
  }
  return root;
}

// Draws a static, non-animated subtree as one mesh per distinct material instead of one per JSX mesh.
// The originals stay mounted (React keeps owning them) but are hidden and skipped by raycasting; the merged mesh
// reuses the first original's material, so hover tint still works.
// The subtree's matrices are then frozen, so three.js stops recomputing them every frame.
// Only wrap subtrees whose meshes never move; pass every value that changes their materials in `deps`.
export default function MergeStatic({ children, deps = [] }) {
  const group = useRef(null);
  const invalidate = useThree(state => state.invalidate);
  useLayoutEffect(() => {
    const root = group.current;
    if (!root) return undefined;
    root.updateWorldMatrix(true, true);
    const buckets = new Map();
    root.traverse(node => {
      const material = node.material;
      if (!node.isMesh || node.isInstancedMesh || !node.visible || !material || Array.isArray(material) || material.transparent) return;
      if (node.__r3f?.eventCount) return;
      const owner = ownerOf(node, root);
      const key = owner.uuid + '|' + materialKey(material);
      if (!buckets.has(key)) buckets.set(key, { owner, meshes: [] });
      buckets.get(key).meshes.push(node);
    });
    const added = [];
    const hidden = [];
    buckets.forEach(({ owner, meshes }) => {
      if (meshes.length < 2) return;
      const inverse = new Matrix4().copy(owner.matrixWorld).invert();
      const relative = new Matrix4();
      const parts = meshes.map(mesh => {
        const source = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
        Object.keys(source.attributes).forEach(name => { if (!['position', 'normal', 'uv'].includes(name)) source.deleteAttribute(name); });
        return source.applyMatrix4(relative.multiplyMatrices(inverse, mesh.matrixWorld));
      });
      const names = part => Object.keys(part.attributes).sort().join();
      const geometry = parts.every(part => names(part) === names(parts[0])) ? mergeGeometries(parts) : null;
      parts.forEach(part => part.dispose());
      if (!geometry) return;
      const merged = new Mesh(geometry, meshes[0].material);
      merged.castShadow = true; merged.receiveShadow = true;
      owner.add(merged);
      added.push(merged);
      meshes.forEach(mesh => { hidden.push([mesh, mesh.raycast]); mesh.visible = false; mesh.raycast = noRaycast; });
    });
    root.updateWorldMatrix(false, true);
    const frozen = [];
    root.traverse(node => {
      if (node === root) return;
      frozen.push(node);
      node.matrixAutoUpdate = false; node.matrixWorldAutoUpdate = false;
    });
    invalidate();
    return () => {
      frozen.forEach(node => { node.matrixAutoUpdate = true; node.matrixWorldAutoUpdate = true; });
      added.forEach(mesh => { mesh.removeFromParent(); mesh.geometry.dispose(); });
      hidden.forEach(([mesh, raycast]) => { mesh.visible = true; mesh.raycast = raycast; });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return <group ref={group}>{children}</group>;
}
