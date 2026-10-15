import { describe, expect, it } from 'vitest';
import { createFightingClock, fightingPose } from '../src/components/desktop/fightingDemo';

describe('quiet gaming CRT playback', () => {
  it('limits redraws to 12 per active second even with a fast frame driver', () => {
    const clock = createFightingClock(); let redraws = 0;
    for (let i = 0; i < 240; i++) if (clock.step(1 / 240, true) !== null) redraws++;
    expect(redraws).toBeGreaterThanOrEqual(11); expect(redraws).toBeLessThanOrEqual(12);
    expect(clock.time).toBeCloseTo(1);
  });
  it('freezes while inactive and never catches up a long hidden-tab delta', () => {
    const clock = createFightingClock(5);
    expect(clock.step(120, false)).toBeNull(); expect(clock.time).toBe(5);
    expect(clock.step(120, true)).toBeCloseTo(5 + 1 / 12);
    expect(clock.time).toBeCloseTo(5 + 1 / 12);
  });
  it('resumes saved room time without shifting the visible pose', () => {
    const clock = createFightingClock(4.43);
    const saved = clock.time, resumed = createFightingClock(saved);
    expect(fightingPose(Math.floor(resumed.time * 12) / 12)).toEqual(fightingPose(Math.floor(saved * 12) / 12));
    expect(resumed.step(1 / 120, false)).toBeNull(); expect(resumed.time).toBeCloseTo(saved);
  });
  it('returns to the same pose after a round and keeps the indicator continuously lit', () => {
    expect(fightingPose(0)).toEqual(fightingPose(12));
    for (let frame = 0; frame < 144; frame++) {
      const pose = fightingPose(frame / 12);
      expect(pose.indicator).toBeGreaterThanOrEqual(1); expect(pose.indicator).toBeLessThanOrEqual(1.22);
      expect(pose.healthA).toBeGreaterThanOrEqual(.78); expect(pose.healthB).toBeGreaterThanOrEqual(.82);
      if (frame < 135) expect(pose.indicator).toBe(1);
    }
    expect(fightingPose(11.6).indicator).toBeCloseTo(1.22);
    expect(fightingPose(4.5).strikeA).toBeGreaterThan(.9);
    expect(fightingPose(9.5).strikeB).toBeGreaterThan(.9);
  });
  it('ignores invalid frame deltas rather than corrupting playback', () => {
    const clock = createFightingClock();
    for (const delta of [NaN, Infinity, -1, 0]) expect(clock.step(delta, true)).toBeNull();
    expect(clock.time).toBe(0);
  });
});
