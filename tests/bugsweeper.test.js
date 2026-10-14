import { describe, expect, it } from 'vitest';
import { newSweeper, revealCell, toggleFlag, sweeperNeighbours } from '../src/utils/retroGames';

const seeded = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

describe('Bugsweeper', () => {
  it('never places a bug on the first reveal or its neighbours', () => {
    for (let seed = 1; seed < 40; seed++) {
      const game = revealCell(newSweeper(), 31, seeded(seed));
      expect(game.status).not.toBe('lost');
      expect([31, ...sweeperNeighbours(31, 9, 7)].some(i => game.cells[i].bug)).toBe(false);
      expect(game.cells.filter(cell => cell.bug)).toHaveLength(10);
    }
  });
  it('flood-fills empty areas and wins when every safe cell is open', () => {
    let game = revealCell(newSweeper(), 0, seeded(7));
    expect(game.cells.filter(cell => cell.open).length).toBeGreaterThan(1);
    game.cells.forEach((cell, index) => { if (!cell.bug && !cell.open) game = revealCell(game, index); });
    expect(game.status).toBe('won');
  });
  it('loses on a bug and ignores flagged cells', () => {
    let game = revealCell(newSweeper(), 0, seeded(3));
    const bug = game.cells.findIndex(cell => cell.bug);
    game = toggleFlag(game, bug);
    expect(revealCell(game, bug)).toBe(game);
    game = toggleFlag(game, bug);
    expect(revealCell(game, bug).status).toBe('lost');
  });
});
