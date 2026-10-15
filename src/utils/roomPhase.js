// The desk room follows the visitor's local clock: daylight 7-17h, dusk 5-7h and 17-20h, night otherwise.
export function roomPhase(date) {
  const hour = date.getHours();
  if (hour >= 7 && hour < 17) return 'day';
  if ((hour >= 17 && hour < 20) || (hour >= 5 && hour < 7)) return 'dusk';
  return 'night';
}

export const ROOM_LIGHT = {
  day: { ambient: 0.8, key: 2.2, window: 1.25, fill: 0.3 },
  dusk: { ambient: 0.65, key: 1.5, window: 0.75, fill: 0.35 },
  night: { ambient: 0.58, key: 0.7, window: 0, fill: 0.45 }
};
