import { describe, expect, it } from 'vitest';
import { BUG_TYPES, aimedBug, castRay, distanceField, fireHunter, isWalkable, newHunterGame, slideMove, stepHunter, waveRoster } from '../src/utils/bugHunter';

const run = (state, seconds, input = {}) => {
  let current = state; const events = [];
  for (let t = 0; t < seconds; t += 0.05) { const result = stepHunter(current, input, 0.05, () => 0); current = result.state; events.push(...result.events); }
  return { state: current, events };
};

describe('BugHunter', () => {
  it('bounds the arena and slides along walls instead of sticking', () => {
    expect(isWalkable(-1, 100)).toBe(false);
    expect(isWalkable(3.5, 6.5)).toBe(true);
    const slid = slideMove(1.3, 1.5, -0.5, 0.3, 0.2);
    expect(slid.x).toBe(1.3);
    expect(slid.y).toBeCloseTo(1.8);
  });
  it('casts rays to the nearest wall', () => {
    expect(castRay(3.5, 6.5, 0).distance).toBeCloseTo(7.5);
    expect(castRay(3.5, 6.5, Math.PI).distance).toBeCloseTo(2.5);
  });
  it('starts with a sleeping bug in the crosshair; squashing it starts wave one', () => {
    const start = newHunterGame();
    expect(aimedBug(start)).toBe(start.bugs[0]);
    const { state, events } = fireHunter(start);
    expect(events).toEqual(['fire', 'kill']);
    expect(state.squashed).toBe(1);
    expect(state.status).toBe('playing');
    const next = stepHunter(state, {}, 0.05, () => 0);
    expect(next.events).toContain('wave');
    expect(next.state.wave).toBe(1);
    expect(next.state.queue).toEqual(waveRoster(1));
  });
  it('blocks shots through pillars and respects the fire cooldown', () => {
    const game = { ...newHunterGame(), player: { x: 1.5, y: 4.5, dir: 0, hp: 100 }, bugs: [{ id: 9, type: 'mite', x: 4.5, y: 4.5, hp: 1, hit: 0, dead: 0, bite: 0, phase: 0 }] };
    expect(aimedBug(game)).toBeNull();
    const fired = fireHunter({ ...newHunterGame() }).state;
    expect(fireHunter(fired).state).toBe(fired);
  });
  it('sends bugs around pillars toward the player and bites on contact', () => {
    const field = distanceField({ x: 3.5, y: 6.5 });
    expect(field[6 * 12 + 3]).toBe(0);
    expect(field[0]).toBe(Infinity);
    const bug = { id: 5, type: 'mite', x: 4.5, y: 3.5, hp: 1, hit: 0, dead: 0, bite: 0, phase: 0 };
    const game = { ...newHunterGame(), status: 'playing', wave: 1, queue: ['mite'], spawnTimer: 99, bugs: [bug] };
    const before = Math.hypot(bug.x - 3.5, bug.y - 6.5);
    const { state, events } = run(game, 8);
    const moved = state.bugs.find(b => b.id === 5);
    expect(Math.hypot(moved.x - 3.5, moved.y - 6.5)).toBeLessThan(before);
    expect(events).toContain('hurt');
    expect(state.player.hp).toBeLessThan(100);
  });
  it('ends the game when health runs out', () => {
    const bugs = Array.from({ length: 4 }, (_, i) => ({ id: i + 10, type: 'beetle', x: 3.6 + i * 0.05, y: 6.5, hp: 3, hit: 0, dead: 0, bite: 0, phase: 0 }));
    const game = { ...newHunterGame(), status: 'playing', wave: 3, queue: [], bugs, player: { x: 3.5, y: 6.5, dir: 0, hp: BUG_TYPES.beetle.damage } };
    const { state, events } = stepHunter(game, {}, 0.05, () => 0);
    expect(state.status).toBe('over');
    expect(events).toContain('over');
    expect(stepHunter(state, { forward: true }, 0.05).state).toBe(state);
  });
  it('grows waves and mixes in tougher bugs', () => {
    expect(waveRoster(1)).toEqual(['mite', 'mite', 'mite', 'mite']);
    expect(waveRoster(2)).toContain('beetle');
    expect(waveRoster(3)).toContain('fly');
    expect(waveRoster(4)).toHaveLength(10);
  });
});
