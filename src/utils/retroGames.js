export const WORD_BANK = ['REACT', 'STACK', 'BUILD', 'NODES', 'FETCH', 'QUERY', 'SHIPS'];

export function scoreGuess(guess, target) {
  const marks = Array(5).fill('absent');
  const remaining = {};
  for (let i = 0; i < 5; i += 1) {
    if (guess[i] === target[i]) marks[i] = 'correct';
    else remaining[target[i]] = (remaining[target[i]] || 0) + 1;
  }
  for (let i = 0; i < 5; i += 1) {
    if (marks[i] === 'correct') continue;
    if (remaining[guess[i]] > 0) { marks[i] = 'present'; remaining[guess[i]] -= 1; }
  }
  return marks;
}

// Bugsweeper: three board sizes (Easy is the original 9x7 board with 10 bugs); the first reveal and its neighbours are always safe.
export const SWEEPER_LEVELS = {
  easy: { label: 'Easy', rows: 9, cols: 7, bugs: 10 },
  medium: { label: 'Medium', rows: 9, cols: 11, bugs: 18 },
  hard: { label: 'Hard', rows: 10, cols: 14, bugs: 28 }
};
export const SWEEPER = SWEEPER_LEVELS.easy;

export function sweeperNeighbours(index, rows, cols) {
  const row = Math.floor(index / cols), col = index % cols, result = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const r = row + dr, c = col + dc;
    if ((dr || dc) && r >= 0 && r < rows && c >= 0 && c < cols) result.push(r * cols + c);
  }
  return result;
}

export function newSweeper(level = 'easy') {
  const key = typeof level === 'string' ? level : 'custom';
  const { rows, cols, bugs } = typeof level === 'string' ? SWEEPER_LEVELS[level] || SWEEPER : level;
  return { level: key, rows, cols, bugs, started: false, status: 'playing', exploded: -1, elapsed: 0, cells: Array.from({ length: rows * cols }, () => ({ bug: false, adjacent: 0, open: false, flag: false })) };
}

export function createSweeperBoard(rows, cols, bugs, safeIndex, random = Math.random) {
  const safe = new Set([safeIndex, ...sweeperNeighbours(safeIndex, rows, cols)]);
  const candidates = Array.from({ length: rows * cols }, (_, index) => index).filter(index => !safe.has(index));
  for (let i = candidates.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [candidates[i], candidates[j]] = [candidates[j], candidates[i]]; }
  const bugSet = new Set(candidates.slice(0, bugs));
  return Array.from({ length: rows * cols }, (_, index) => ({
    bug: bugSet.has(index),
    adjacent: sweeperNeighbours(index, rows, cols).filter(n => bugSet.has(n)).length,
    open: false,
    flag: false
  }));
}

export function revealCell(game, index, random = Math.random) {
  if (game.status !== 'playing') return game;
  let cells = game.started ? game.cells.map(cell => ({ ...cell })) : createSweeperBoard(game.rows, game.cols, game.bugs, index, random);
  const target = cells[index];
  if (target.open || target.flag) return game;
  if (target.bug) {
    cells = cells.map(cell => (cell.bug ? { ...cell, open: true } : cell));
    return { ...game, started: true, cells, status: 'lost', exploded: index };
  }
  const queue = [index];
  while (queue.length) {
    const current = queue.shift();
    const cell = cells[current];
    if (cell.open || cell.flag) continue;
    cell.open = true;
    if (cell.adjacent === 0) queue.push(...sweeperNeighbours(current, game.rows, game.cols).filter(n => !cells[n].open && !cells[n].bug));
  }
  const won = cells.every(cell => cell.bug || cell.open);
  return { ...game, started: true, cells, status: won ? 'won' : 'playing' };
}

export function toggleFlag(game, index) {
  if (game.status !== 'playing' || game.cells[index].open) return game;
  return { ...game, cells: game.cells.map((cell, i) => (i === index ? { ...cell, flag: !cell.flag } : cell)) };
}

// Chording: on a revealed number whose flags already match it, reveal every other neighbour at once.
export function chordCell(game, index) {
  const cell = game.cells[index];
  if (game.status !== 'playing' || !cell.open || !cell.adjacent) return game;
  const around = sweeperNeighbours(index, game.rows, game.cols);
  if (around.filter(n => game.cells[n].flag).length !== cell.adjacent) return game;
  let next = game;
  for (const n of around) {
    if (next.status !== 'playing') break;
    if (!next.cells[n].open && !next.cells[n].flag) next = revealCell(next, n);
  }
  return next;
}
