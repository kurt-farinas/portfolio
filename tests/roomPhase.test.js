import { describe, expect, it } from 'vitest';
import { roomPhase } from '../src/utils/roomPhase';

const at = hour => new Date(2026, 9, 14, hour, 30);

describe('roomPhase', () => {
  it('maps the visitor clock to day, dusk and night at the boundaries', () => {
    expect([4, 5, 6, 7, 16, 17, 19, 20, 23].map(hour => roomPhase(at(hour))))
      .toEqual(['night', 'dusk', 'dusk', 'day', 'day', 'dusk', 'dusk', 'night', 'night']);
  });
});
