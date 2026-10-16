import { CanvasTexture, SRGBColorSpace } from 'three';

// Room photos appear at most ~200px tall on screen, but their source images are up to 2000px. A 512px copy looks the
// same and uploads ~15x less data to the GPU (the lightbox still opens the original file). The caller disposes it.
// Load sources with useLoader(TextureLoader), not drei's useTexture: that one uploads the full-size source too.
export default function fitTexture(source, max = 512) {
  const { image } = source;
  const scale = Math.min(1, max / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = source.anisotropy;
  return texture;
}
