// Focal offset shifts camera and target together, so orbit angles and the lock distance are unaffected.
export const FOLLOW_RANGE = { x: 0.35, y: 0.18 };

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function zoomProgress(distance, deskDistance, lockDistance) {
  const t = clamp((deskDistance - distance) / (deskDistance - lockDistance), 0, 1);
  return t * t * (3 - 2 * t);
}

export function cameraFocalOffset(nx, ny, progress, focus) {
  const follow = 1 - progress;
  return [
    clamp(nx, -1, 1) * FOLLOW_RANGE.x * follow + focus[0] * progress,
    clamp(ny, -1, 1) * FOLLOW_RANGE.y * follow + focus[1] * progress
  ];
}
