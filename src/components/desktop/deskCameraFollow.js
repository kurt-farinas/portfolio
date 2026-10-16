// Focal offset shifts camera and target together; azimuth/polar are small orbit deltas.
export const FOLLOW_RANGE = { x: 1.2, y: 0.6, azimuth: 0.2, polar: 0.08 };
export const FOLLOW_TAU = 0.1;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function zoomProgress(distance, deskDistance, lockDistance) {
  const t = clamp((deskDistance - distance) / (deskDistance - lockDistance), 0, 1);
  return t * t * (3 - 2 * t);
}

export function easeToward(current, target, dt, tau) {
  return current + (target - current) * (1 - Math.exp(-dt / tau));
}

export function cameraFollowTarget(nx, ny, progress, focus) {
  const follow = 1 - progress;
  const cx = clamp(nx, -1, 1), cy = clamp(ny, -1, 1);
  return {
    x: cx * FOLLOW_RANGE.x * follow + focus[0] * progress,
    y: cy * FOLLOW_RANGE.y * follow + focus[1] * progress,
    azimuth: cx * FOLLOW_RANGE.azimuth * follow,
    polar: -cy * FOLLOW_RANGE.polar * follow
  };
}
