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

export const BUG_MAP = [
  [1,1,1,1,1,1,1,1], [1,0,0,0,0,0,0,1], [1,0,1,0,0,1,0,1],
  [1,0,0,0,0,0,0,1], [1,0,1,0,0,1,0,1], [1,0,0,0,0,0,0,1], [1,1,1,1,1,1,1,1]
];
export function isWalkable(x, y) { return BUG_MAP[Math.floor(y)]?.[Math.floor(x)] === 0; }
export function rayDistance(player, angle, limit = 12) {
  for (let distance = 0.05; distance < limit; distance += 0.05) {
    if (!isWalkable(player.x + Math.cos(angle) * distance, player.y + Math.sin(angle) * distance)) return distance;
  }
  return limit;
}
export function moveBugPlayer(player, key) {
  if (key === 'ArrowLeft' || key === 'a') return { ...player, dir: player.dir - 0.14 };
  if (key === 'ArrowRight' || key === 'd') return { ...player, dir: player.dir + 0.14 };
  const step = key === 'ArrowUp' || key === 'w' ? 0.22 : key === 'ArrowDown' || key === 's' ? -0.22 : 0;
  const x = player.x + Math.cos(player.dir) * step;
  const y = player.y + Math.sin(player.dir) * step;
  return isWalkable(x, y) ? { ...player, x, y } : player;
}
export function bugCanBeHit(player, target) {
  const angle = Math.atan2(target.y - player.y, target.x - player.x);
  const relative = Math.atan2(Math.sin(angle - player.dir), Math.cos(angle - player.dir));
  const distance = Math.hypot(target.x - player.x, target.y - player.y);
  return Math.abs(relative) < 0.14 && distance < 6 && rayDistance(player, angle) + 0.06 >= distance;
}
export function nextBugTarget(player, random = Math.random) {
  const cells = BUG_MAP.flatMap((row, y) => row.flatMap((wall, x) => !wall && Math.hypot(x + 0.5 - player.x, y + 0.5 - player.y) > 1.5 ? [{ x: x + 0.5, y: y + 0.5 }] : []));
  return cells[Math.min(cells.length - 1, Math.floor(random() * cells.length))];
}
export const INITIAL_BUG_GAME = { player: { x: 3.5, y: 3.5, dir: 0 }, target: { x: 6.5, y: 3.5 }, score: 0 };

// Bugsweeper: a 9x7 board with 10 bugs; the first reveal and its neighbours are always safe.
export const SWEEPER = { rows: 9, cols: 7, bugs: 10 };

export function sweeperNeighbours(index, rows, cols) {
  const row = Math.floor(index / cols), col = index % cols, result = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const r = row + dr, c = col + dc;
    if ((dr || dc) && r >= 0 && r < rows && c >= 0 && c < cols) result.push(r * cols + c);
  }
  return result;
}

export function newSweeper({ rows, cols, bugs } = SWEEPER) {
  return { rows, cols, bugs, started: false, status: 'playing', cells: Array.from({ length: rows * cols }, () => ({ bug: false, adjacent: 0, open: false, flag: false })) };
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
    return { ...game, started: true, cells, status: 'lost' };
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
