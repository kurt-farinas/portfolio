import React from 'react';
import { PIXEL_ICONS } from './pixelIcons';

// One <path> per palette colour instead of one <rect> per pixel run: the same crisp pixels, but ~5 elements per icon
// instead of ~65. The rects were most of the desktop's DOM, so every full restyle (view switches toggle `inert`) paid for them.
const paths = new Map();
function iconPaths(id) {
  if (!paths.has(id)) {
    const byColor = new Map();
    for (const [x, y, width, color] of PIXEL_ICONS[id] || PIXEL_ICONS.about) byColor.set(color, (byColor.get(color) || '') + `M${x} ${y}h${width}v1h-${width}z`);
    paths.set(id, [...byColor]);
  }
  return paths.get(id);
}

// 16x16 pixel-art icons drawn as crisp rectangles; colours come from the --pix-* palette in variables.css.
export default function RetroIcon({ id }) {
  if (id === 'classic') return <img className="retro-icon retro-icon-logo" src="/favicon.svg" alt="" width="28" height="28" />;
  return <svg className="retro-icon" width="32" height="32" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
    {iconPaths(id).map(([color, d]) => <path key={color} d={d} fill={'var(--pix-' + color + ')'} />)}
  </svg>;
}
