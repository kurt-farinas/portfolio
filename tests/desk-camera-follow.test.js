import { describe, expect, it } from 'vitest';
import { cameraFollowTarget, easeToward, zoomProgress } from '../src/components/desktop/deskCameraFollow';

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

describe('easeToward', () => {
  it('closes 1 - 1/e of the gap in one time constant', () => {
    expect(easeToward(0, 1, 0.1, 0.1)).toBeCloseTo(1 - Math.exp(-1), 6);
  });
  it('does not move with no elapsed time', () => {
    expect(easeToward(0, 1, 0, 0.1)).toBe(0);
  });
  it('is frame-rate independent', () => {
    const twice = easeToward(easeToward(0, 1, 0.05, 0.1), 1, 0.05, 0.1);
    expect(twice).toBeCloseTo(easeToward(0, 1, 0.1, 0.1), 9);
  });
});

describe('cameraFollowTarget', () => {
  it('follows the cursor at progress 0', () => {
    const t = cameraFollowTarget(1, 1, 0, [0, 1]);
    expect(t.x).toBeCloseTo(1.2); expect(t.y).toBeCloseTo(-0.6);
    expect(t.azimuth).toBeCloseTo(-0.2); expect(t.polar).toBeCloseTo(0.08);
  });
  it('clamps the cursor', () => {
    const t = cameraFollowTarget(5, -5, 0, [0, 1]);
    expect(t.x).toBeCloseTo(1.2); expect(t.y).toBeCloseTo(0.6);
    expect(t.azimuth).toBeCloseTo(-0.2); expect(t.polar).toBeCloseTo(-0.08);
  });
  it('returns +0 at the centre', () => {
    const t = cameraFollowTarget(0, 0, 0, [0, 0]);
    expect([t.x, t.y, t.azimuth, t.polar].every(v => Object.is(v, 0))).toBe(true);
  });
  it('homes on the focus with no turn at progress 1', () => {
    const t = cameraFollowTarget(1, 1, 1, [0, 1]);
    expect(t.x).toBeCloseTo(0); expect(t.y).toBeCloseTo(1);
    expect(t.azimuth).toBeCloseTo(0); expect(t.polar).toBeCloseTo(0);
  });
});
