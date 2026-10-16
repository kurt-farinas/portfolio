import { describe, expect, it } from 'vitest';
import { cameraFocalOffset, zoomProgress } from '../src/components/desktop/deskCameraFollow';

describe('zoomProgress', () => {
  it('is 0 at or beyond the desk distance and 1 at the lock distance', () => {
    expect(zoomProgress(9, 9, 5.5)).toBe(0);
    expect(zoomProgress(12, 9, 5.5)).toBe(0);
    expect(zoomProgress(5.5, 9, 5.5)).toBe(1);
    expect(zoomProgress(4, 9, 5.5)).toBe(1);
  });
  it('eases through the middle', () => {
    expect(zoomProgress(7.25, 9, 5.5)).toBeCloseTo(0.5);
  });
});

describe('cameraFocalOffset', () => {
  it('follows the cursor at progress 0 and clamps it', () => {
    expect(cameraFocalOffset(1, -1, 0, [0, 1])).toEqual([0.35, -0.18]);
    expect(cameraFocalOffset(5, 5, 0, [0, 1])).toEqual([0.35, 0.18]);
    expect(cameraFocalOffset(0, 0, 0, [0, 1])).toEqual([0, 0]);
  });
  it('homes on the focus at progress 1', () => {
    expect(cameraFocalOffset(1, 1, 1, [0, 1])).toEqual([0, 1]);
  });
});
