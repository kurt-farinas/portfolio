// The desk room follows the visitor's local clock: daylight 7-17h, dusk 5-7h and 17-20h, night otherwise.
export function roomPhase(date) {
  const hour = date.getHours();
  if (hour >= 7 && hour < 17) return 'day';
  if ((hour >= 17 && hour < 20) || (hour >= 5 && hour < 7)) return 'dusk';
  return 'night';
}

export const ROOM_LIGHT = {
  day: { ambient: 1.15, key: 2.3, window: 1.1 },
  dusk: { ambient: 0.8, key: 1.6, window: 0.9 },
  night: { ambient: 0.6, key: 0.95, window: 0 }
};
