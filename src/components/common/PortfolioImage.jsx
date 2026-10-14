import React from 'react';
import dimensions from '../../data/originalImageManifest.json';

const imagePath = src => '/' + src.replace(/^\//, '');
export const hasPortfolioImage = src => Boolean(src && dimensions[imagePath(src)]);

export default function PortfolioImage({ src, className = '', width, height, loading = 'lazy', decoding = 'async', ...props }) {
  const path = imagePath(src);
  const size = dimensions[path];
  return <img {...props} src={path} width={size?.width || width} height={size?.height || height}
    loading={loading} decoding={decoding} className={('portfolio-image ' + className).trim()} />;
}
