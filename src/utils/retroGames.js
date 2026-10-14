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
