import { describe, expect, it } from 'vitest';
import { SWEEPER_LEVELS, chordCell, newSweeper, revealCell, toggleFlag, sweeperNeighbours } from '../src/utils/retroGames';

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
  it('builds each difficulty with its size and bug count', () => {
    for (const [level, config] of Object.entries(SWEEPER_LEVELS)) {
      const game = revealCell(newSweeper(level), 0, seeded(5));
      expect(game.level).toBe(level);
      expect(game.cells).toHaveLength(config.rows * config.cols);
      expect(game.cells.filter(cell => cell.bug)).toHaveLength(config.bugs);
    }
  });
  it('chords a satisfied number and loses on a wrong flag', () => {
    let game = revealCell(newSweeper(), 31, seeded(9));
    const number = game.cells.findIndex((cell, index) => cell.open && cell.adjacent && sweeperNeighbours(index, 9, 7).some(n => !game.cells[n].open && !game.cells[n].bug));
    const around = sweeperNeighbours(number, 9, 7);
    expect(chordCell(game, number)).toBe(game);
    let flagged = game;
    around.filter(n => game.cells[n].bug).forEach(n => { flagged = toggleFlag(flagged, n); });
    const chorded = chordCell(flagged, number);
    expect(around.every(n => chorded.cells[n].bug ? chorded.cells[n].flag : chorded.cells[n].open)).toBe(true);
    const safe = around.find(n => !game.cells[n].open && !game.cells[n].bug);
    let wrong = game;
    around.filter(n => !game.cells[n].open).slice(0, game.cells[number].adjacent).forEach(n => { wrong = toggleFlag(wrong, n); });
    if (around.filter(n => wrong.cells[n].flag && !wrong.cells[n].bug).length) {
      const lost = chordCell(wrong, number);
      expect(lost.status).toBe('lost');
      expect(lost.cells[lost.exploded].bug).toBe(true);
    }
    expect(safe).toBeDefined();
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
