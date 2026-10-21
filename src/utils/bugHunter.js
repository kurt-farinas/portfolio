// BugHunter 3D: a small first-person wave shooter. Bugs path toward the player through a breadth-first
// distance field, bite on contact, and come back in bigger, faster waves. Everything here is pure so it can be tested.

export const HUNTER_MAP = [
  '111111111111',
  '100000000001',
  '101101101101',
  '100000000001',
  '100100001001',
  '100100001001',
  '100000000001',
  '100001100001',
  '100000000001',
  '101101101101',
  '100000000001',
  '111111111111'
].map(row => [...row].map(Number));

const ROWS = HUNTER_MAP.length;
const COLS = HUNTER_MAP[0].length;
const SPAWNS = [[1.5, 1.5], [10.5, 1.5], [1.5, 10.5], [10.5, 10.5], [5.5, 1.5], [6.5, 10.5], [1.5, 6.5], [10.5, 6.5]];
const PLAYER_RADIUS = 0.2;
const MOVE_SPEED = 2.6;
const TURN_SPEED = 2.4;
const FIRE_COOLDOWN = 0.28;
const BITE_RANGE = 0.5;
const BITE_COOLDOWN = 1.2;
const RECOIL = 0.5;
const WAVE_HEAL = 20;

export const BUG_TYPES = {
  mite: { hp: 1, speed: 0.9, damage: 5, points: 1, size: 0.85, radius: 0.24 },
  beetle: { hp: 3, speed: 0.6, damage: 10, points: 3, size: 1.2, radius: 0.32 },
  fly: { hp: 1, speed: 1.5, damage: 4, points: 2, size: 0.6, radius: 0.2, flying: true }
};

export function isWall(x, y) {
  const row = HUNTER_MAP[Math.floor(y)];
  return !row || row[Math.floor(x)] !== 0;
}
export const isWalkable = (x, y) => !isWall(x, y);

const blocked = (x, y, r) => isWall(x - r, y - r) || isWall(x + r, y - r) || isWall(x - r, y + r) || isWall(x + r, y + r);

// Try each axis separately so a body slides along a wall instead of sticking to it.
// A body already overlapping a wall corner (pushed there by the swarm) moves by its centre only, so it can always back out.
export function slideMove(x, y, dx, dy, radius) {
  const r = blocked(x, y, radius) ? 0 : radius;
  const nx = blocked(x + dx, y, r) ? x : x + dx;
  const ny = blocked(nx, y + dy, r) ? y : y + dy;
  return { x: nx, y: ny };
}

// Grid DDA: exact wall distance, which face was hit (0 = vertical, 1 = horizontal) and where along it (0-1).
export function castRay(px, py, angle, limit = 20) {
  const dx = Math.cos(angle), dy = Math.sin(angle);
  let mapX = Math.floor(px), mapY = Math.floor(py);
  const deltaX = dx === 0 ? Infinity : Math.abs(1 / dx);
  const deltaY = dy === 0 ? Infinity : Math.abs(1 / dy);
  const stepX = dx < 0 ? -1 : 1, stepY = dy < 0 ? -1 : 1;
  let sideX = (dx < 0 ? px - mapX : mapX + 1 - px) * deltaX;
  let sideY = (dy < 0 ? py - mapY : mapY + 1 - py) * deltaY;
  let side = 0, distance = 0;
  while (distance < limit) {
    if (sideX < sideY) { distance = sideX; sideX += deltaX; mapX += stepX; side = 0; }
    else { distance = sideY; sideY += deltaY; mapY += stepY; side = 1; }
    if (HUNTER_MAP[mapY]?.[mapX] !== 0) {
      const hit = side === 0 ? py + distance * dy : px + distance * dx;
      return { distance, side, wallX: hit - Math.floor(hit) };
    }
  }
  return { distance: limit, side, wallX: 0 };
}

export const rayDistance = (player, angle, limit) => castRay(player.x, player.y, angle, limit).distance;
const relativeAngle = (angle, dir) => Math.atan2(Math.sin(angle - dir), Math.cos(angle - dir));
const canSee = (from, to, distance) => rayDistance(from, Math.atan2(to.y - from.y, to.x - from.x), distance + 1) + 0.05 >= distance;

// Steps from every open cell to the player's cell; bugs walk downhill through it to get around pillars.
export function distanceField(player) {
  const field = new Array(ROWS * COLS).fill(Infinity);
  const start = Math.floor(player.y) * COLS + Math.floor(player.x);
  if (isWall(player.x, player.y)) return field;
  field[start] = 0;
  const queue = [start];
  for (let head = 0; head < queue.length; head += 1) {
    const index = queue[head];
    const x = index % COLS, y = Math.floor(index / COLS);
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      const next = ny * COLS + nx;
      if (HUNTER_MAP[ny]?.[nx] === 0 && field[next] === Infinity) { field[next] = field[index] + 1; queue.push(next); }
    }
  }
  return field;
}

export function waveRoster(wave) {
  return Array.from({ length: 2 + wave * 2 }, (_, i) => (wave >= 3 && i % 3 === 2 ? 'fly' : wave >= 2 && i % 4 === 3 ? 'beetle' : 'mite'));
}

function makeBug(id, type, x, y, extra = {}) {
  return { id, type, x, y, hp: BUG_TYPES[type].hp, hit: 0, dead: 0, bite: 0, recoil: 0, phase: id, ...extra };
}

// The game opens with one bug asleep in plain sight; squashing it wakes the swarm.
export function newHunterGame(best = 0) {
  return {
    status: 'ready', time: 0, wave: 0, queue: [], spawnTimer: 0, banner: 0,
    player: { x: 3.5, y: 6.5, dir: 0, hp: 100, moving: false },
    bugs: [makeBug(1, 'mite', 6.5, 6.5, { sleeping: true })], nextId: 2,
    score: 0, squashed: 0, best, fireCooldown: 0, fireFlash: 0, hurt: 0
  };
}

// The nearest live bug under the crosshair with a clear line of sight, if any.
export function aimedBug(state) {
  const { player } = state;
  let best = null;
  for (const bug of state.bugs) {
    if (bug.dead) continue;
    const distance = Math.hypot(bug.x - player.x, bug.y - player.y);
    const tolerance = Math.atan2(BUG_TYPES[bug.type].radius, distance) + 0.02;
    const relative = relativeAngle(Math.atan2(bug.y - player.y, bug.x - player.x), player.dir);
    if (distance < 14 && Math.abs(relative) < tolerance && canSee(player, bug, distance) && (!best || distance < best.distance)) best = { bug, distance };
  }
  return best?.bug || null;
}

export function fireHunter(state) {
  if (state.status === 'over' || state.fireCooldown > 0) return { state, events: [] };
  const events = ['fire'];
  const target = aimedBug(state);
  let { score, squashed, best, status } = state;
  const bugs = state.bugs.map(bug => {
    if (bug !== target) return bug;
    const hp = bug.hp - 1;
    if (hp > 0) { events.push('hit'); return { ...bug, hp, hit: 0.12 }; }
    events.push('kill');
    score += BUG_TYPES[bug.type].points; squashed += 1;
    return { ...bug, hp, hit: 0, dead: 0.6, sleeping: false };
  });
  if (target?.sleeping && status === 'ready') status = 'playing';
  return { state: { ...state, status, bugs, score, squashed, best: Math.max(best, score), fireCooldown: FIRE_COOLDOWN, fireFlash: 0.08 }, events };
}

export function stepHunter(state, input = {}, rawDt = 0, random = Math.random) {
  if (state.status !== 'playing') return { state, events: [] };
  const dt = Math.min(0.05, Math.max(0, rawDt));
  const events = [];
  const time = state.time + dt;

  // Player: A/D or arrows turn, W/S move, Q/E strafe.
  const dir = state.player.dir + ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * TURN_SPEED * dt;
  const forward = (input.forward ? 1 : 0) - (input.back ? 1 : 0);
  const strafe = (input.strafeRight ? 1 : 0) - (input.strafeLeft ? 1 : 0);
  const length = Math.hypot(forward, strafe) || 1;
  const step = MOVE_SPEED * dt / length;
  const moved = slideMove(state.player.x, state.player.y,
    (Math.cos(dir) * forward - Math.sin(dir) * strafe) * step,
    (Math.sin(dir) * forward + Math.cos(dir) * strafe) * step, PLAYER_RADIUS);
  let hp = state.player.hp;
  const player = { ...state.player, ...moved, dir, moving: Boolean(forward || strafe) };

  const field = distanceField(player);
  const pace = 1 + Math.min(0.6, (state.wave - 1) * 0.07);
  let bugs = [];
  for (const bug of state.bugs) {
    if (bug.dead) { const dead = bug.dead - dt; if (dead > 0) bugs.push({ ...bug, dead }); continue; }
    const type = BUG_TYPES[bug.type];
    const next = { ...bug, hit: Math.max(0, bug.hit - dt), bite: Math.max(0, bug.bite - dt), recoil: Math.max(0, (bug.recoil || 0) - dt), phase: bug.phase + dt * type.speed * 9 };
    const distance = Math.hypot(player.x - bug.x, player.y - bug.y);
    if (next.recoil > 0) {
      // After a bite the bug scuttles back for a moment, giving the player a window to answer.
      const away = type.speed * pace * dt * 1.2 / (distance || 1);
      Object.assign(next, slideMove(bug.x, bug.y, (bug.x - player.x) * away, (bug.y - player.y) * away, type.radius * 0.6));
    } else if (distance > BITE_RANGE) {
      let goal = player;
      if (!canSee(bug, player, distance)) {
        const x = Math.floor(bug.x), y = Math.floor(bug.y);
        let bestStep = field[y * COLS + x];
        for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
          const value = field[ny * COLS + nx];
          if (HUNTER_MAP[ny]?.[nx] === 0 && value < bestStep) { bestStep = value; goal = { x: nx + 0.5, y: ny + 0.5 }; }
        }
      }
      const gx = goal.x - bug.x, gy = goal.y - bug.y, gd = Math.hypot(gx, gy) || 1;
      const speed = type.speed * pace * dt;
      Object.assign(next, slideMove(bug.x, bug.y, gx / gd * speed, gy / gd * speed, type.radius * 0.6));
    } else if (next.bite === 0) {
      hp = Math.max(0, hp - type.damage); next.bite = BITE_COOLDOWN; next.recoil = RECOIL; events.push('hurt');
    }
    bugs.push(next);
  }
  // Keep the swarm from collapsing into one sprite.
  for (let i = 0; i < bugs.length; i += 1) for (let j = i + 1; j < bugs.length; j += 1) {
    const a = bugs[i], b = bugs[j];
    if (a.dead || b.dead) continue;
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
    if (d > 0.001 && d < 0.4) {
      const push = (0.4 - d) / 2;
      Object.assign(a, slideMove(a.x, a.y, -dx / d * push, -dy / d * push, 0.12));
      Object.assign(b, slideMove(b.x, b.y, dx / d * push, dy / d * push, 0.12));
    }
  }

  let { queue, spawnTimer, wave, banner, nextId } = state;
  banner = Math.max(0, banner - dt);
  if (queue.length) {
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      // Spawn where the player is roughly looking, so the swarm is seen coming instead of biting from behind.
      const view = ([x, y]) => Math.abs(relativeAngle(Math.atan2(y - player.y, x - player.x), player.dir));
      const far = SPAWNS.filter(([x, y]) => Math.hypot(x - player.x, y - player.y) > 4).sort((a, b) => view(a) - view(b)).slice(0, 3);
      const [x, y] = far[Math.min(far.length - 1, Math.floor(random() * far.length))] || SPAWNS[0];
      bugs = [...bugs, makeBug(nextId, queue[0], x, y)];
      nextId += 1; queue = queue.slice(1); spawnTimer = 0.75;
    }
  } else if (!bugs.some(bug => !bug.dead)) {
    if (wave > 0) hp = Math.min(100, hp + WAVE_HEAL);
    wave += 1; queue = waveRoster(wave); spawnTimer = 0.6; banner = 1.6; events.push('wave');
  }

  const status = hp <= 0 ? 'over' : 'playing';
  if (status === 'over') events.push('over');
  return {
    state: {
      ...state, status, time, wave, queue, spawnTimer, banner, nextId, bugs,
      player: { ...player, hp },
      fireCooldown: Math.max(0, state.fireCooldown - dt), fireFlash: Math.max(0, state.fireFlash - dt),
      hurt: status === 'over' ? 0 : events.includes('hurt') ? 0.4 : Math.max(0, state.hurt - dt)
    },
    events
  };
}
