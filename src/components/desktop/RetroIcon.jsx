import React from 'react';
import { PIXEL_ICONS } from './pixelIcons';

// 16x16 pixel-art icons drawn as crisp rectangles; colours come from the --pix-* palette in variables.css.
export default function RetroIcon({ id }) {
  if (id === 'classic') return <img className="retro-icon retro-icon-logo" src="/favicon.svg" alt="" width="28" height="28" />;
  const rects = PIXEL_ICONS[id] || PIXEL_ICONS.about;
  return <svg className="retro-icon" width="32" height="32" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
    {rects.map(([x, y, width, color]) => <rect key={x + '-' + y} x={x} y={y} width={width} height="1" fill={'var(--pix-' + color + ')'} />)}
  </svg>;
}
