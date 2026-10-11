import React from 'react';
import manifest from '../../data/ditherManifest.json';
const files = import.meta.glob('../../assets/{projects,personal}/*.png', { eager: true, query: '?url', import: 'default' });

export const hasDitherImage = src => Boolean(manifest['/' + src.replace(/^\//, '')]);

export default function DitherImage({ src, className = '', width, height, ...props }) {
  const image = manifest['/' + src.replace(/^\//, '')];
  const url = image && files['../../' + image.file.replace('../', '')];
  return <img {...props} src={url || src} width={image?.width || width} height={image?.height || height}
    className={('dither-image ' + className).trim()} />;
}
