import React, { useState } from 'react';
import dimensions from '../../data/originalImageManifest.json';
import optimized from '../../data/optimizedImageManifest.json';

const imagePath = src => '/' + src.replace(/^\//, '');
export const hasPortfolioImage = src => Boolean(src && dimensions[imagePath(src)]);

export default function PortfolioImage({ src, className = '', width, height, loading = 'lazy', decoding = 'async', onError, ...props }) {
  const path = imagePath(src);
  const size = dimensions[path];
  const [failedPath, setFailedPath] = useState(null);
  const webp = failedPath === path ? null : optimized[path];
  // A failed WebP retries the original file; only a failed original reaches the caller.
  const handleError = event => (webp ? setFailedPath(path) : onError?.(event));
  return <img {...props} src={webp || path} width={size?.width || width} height={size?.height || height}
    loading={loading} decoding={decoding} onError={handleError} className={('portfolio-image ' + className).trim()} />;
}
