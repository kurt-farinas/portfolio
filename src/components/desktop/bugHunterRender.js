import { BUG_TYPES, HUNTER_MAP, aimedBug, castRay } from '../../utils/bugHunter';

const FOV = Math.PI / 3;
const PLANE = Math.tan(FOV / 2);
const FOG_STEPS = 16;
const FOG_DISTANCE = 13;

function rgb(hex) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? [...value].map(c => c + c).join('') : value.slice(0, 6);
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16) || 0);
}
function mix(a, b, t) {
  const [x, y] = [rgb(a), rgb(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

// Solid colour steps (no gradients): distance fog, wall faces and the banded floor/ceiling are precomputed per theme.
export function buildHunterPalette(read) {
  const c = name => read('--game-' + name) || '#808080';
  const ceiling = c('ceiling'), floor = c('floor'), wall = c('wall');
  const fog = step => step / (FOG_STEPS - 1);
  return {
    wall: [0, 1].map(side => Array.from({ length: FOG_STEPS }, (_, i) => mix(mix(wall, '#000000', side ? 0.28 : 0), ceiling, fog(i) * 0.85))),
    seam: Array.from({ length: FOG_STEPS }, (_, i) => mix(mix(wall, '#000000', 0.5), ceiling, fog(i) * 0.85)),
    trim: Array.from({ length: FOG_STEPS }, (_, i) => mix(mix(wall, '#ffffff', 0.22), ceiling, fog(i) * 0.85)),
    ceiling: Array.from({ length: 6 }, (_, i) => mix(ceiling, '#000000', 0.3 - i * 0.05)),
    floor: Array.from({ length: 7 }, (_, i) => mix(floor, '#000000', 0.35 - i * 0.055)),
    bug: { mite: c('target'), beetle: c('beetle'), fly: c('fly') },
    head: mix(c('target'), '#000000', 0.45),
    leg: mix(floor, '#000000', 0.55),
    wing: mix(c('ink'), ceiling, 0.45),
    splat: c('splat'), ink: c('ink'), pupil: '#111111', shadow: mix(floor, '#000000', 0.5),
    crosshair: c('crosshair'), aim: c('target'), gun: c('gun'), gunDark: mix(c('gun'), '#000000', 0.45),
    flash: c('flash'), hurt: c('hurt'), mapWall: mix(wall, '#000000', 0.2), mapFloor: mix(ceiling, '#000000', 0.3)
  };
}

const ellipse = (ctx, x, y, rx, ry, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2); ctx.fill(); };
const line = (ctx, points, color, width) => { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); };

function drawBug(ctx, bug, sx, floorY, size, palette, time, still) {
  const type = BUG_TYPES[bug.type];
  const hover = type.flying ? size * 1.2 + (still ? 0 : Math.sin(time * 6 + bug.id) * size * 0.15) : 0;
  const cy = floorY - size * 0.5 - hover;
  ellipse(ctx, sx, floorY - size * 0.04, size * 0.8, size * 0.15, palette.shadow);
  if (bug.dead) {
    const spread = 1.25 - bug.dead * 0.6;
    ellipse(ctx, sx, floorY - size * 0.08, size * spread, size * 0.2 * spread, palette.splat);
    for (let i = 0; i < 5; i += 1) ellipse(ctx, sx + Math.cos(i * 1.3 + bug.id) * size * spread * 1.2, floorY - size * 0.1 + Math.sin(i * 2.1) * size * 0.12, size * 0.1, size * 0.05, palette.splat);
    return;
  }
  const body = bug.hit ? palette.ink : palette.bug[bug.type];
  const wiggle = still || bug.sleeping ? 0 : Math.sin(bug.phase);
  const legWidth = Math.max(1, size * 0.07);
  for (const side of [-1, 1]) for (let i = 0; i < 3; i += 1) {
    const sway = (i % 2 ? wiggle : -wiggle) * size * 0.12;
    const rootY = cy + (i - 1) * size * 0.24;
    line(ctx, [[sx + side * size * 0.3, rootY], [sx + side * size * 0.78, rootY - size * 0.2 + sway], [sx + side * size * 1.0, rootY + size * 0.32 + sway]], palette.leg, legWidth);
  }
  if (type.flying) {
    const flap = still ? 1 : 0.55 + Math.abs(Math.sin(time * 28 + bug.id)) * 0.45;
    for (const side of [-1, 1]) ellipse(ctx, sx + side * size * 0.6, cy - size * 0.45, size * 0.55, size * 0.3 * flap, palette.wing);
  }
  ellipse(ctx, sx, cy - size * 0.12, size * 0.5, size * 0.56, body);
  if (bug.type === 'beetle') {
    line(ctx, [[sx, cy - size * 0.66], [sx, cy + size * 0.3]], palette.head, Math.max(1, size * 0.05));
    for (let i = 0; i < BUG_TYPES.beetle.hp; i += 1) {
      ctx.fillStyle = i < bug.hp ? palette.ink : palette.shadow;
      ctx.fillRect(sx - size * 0.3 + i * size * 0.22, cy - size * 0.95, size * 0.16, size * 0.08);
    }
  } else ellipse(ctx, sx - size * 0.18, cy - size * 0.35, size * 0.12, size * 0.08, palette.ink);
  const headY = cy + size * 0.36;
  ellipse(ctx, sx, headY, size * 0.32, size * 0.26, bug.hit ? palette.ink : palette.head);
  const antenna = still ? 0 : Math.sin(time * 5 + bug.id) * size * 0.08;
  for (const side of [-1, 1]) {
    line(ctx, [[sx + side * size * 0.12, headY - size * 0.2], [sx + side * size * 0.4 + antenna, headY - size * 0.62]], palette.leg, Math.max(1, size * 0.04));
    ellipse(ctx, sx + side * size * 0.4 + antenna, headY - size * 0.62, size * 0.05, size * 0.05, palette.leg);
    ellipse(ctx, sx + side * size * 0.13, headY - size * 0.02, size * 0.09, size * 0.1, palette.ink);
    const pupil = bug.sleeping ? 0.02 : 0.06;
    ellipse(ctx, sx + side * size * 0.11, headY, size * 0.045, size * pupil, palette.pupil);
    // Sleeping bugs have flat lids; awake ones scowl.
    line(ctx, bug.sleeping
      ? [[sx + side * size * 0.04, headY - size * 0.03], [sx + side * size * 0.22, headY - size * 0.03]]
      : [[sx + side * size * 0.03, headY - size * 0.08], [sx + side * size * 0.24, headY - size * 0.15]], palette.pupil, Math.max(1, size * 0.04));
  }
  line(ctx, [[sx - size * 0.1, headY + size * 0.2], [sx - size * 0.03, headY + size * 0.3]], palette.pupil, Math.max(1, size * 0.04));
  line(ctx, [[sx + size * 0.1, headY + size * 0.2], [sx + size * 0.03, headY + size * 0.3]], palette.pupil, Math.max(1, size * 0.04));
}

function drawWeapon(ctx, state, w, h, palette, still) {
  const unit = Math.max(2, Math.round(w / 90));
  const bob = still || !state.player.moving ? 0 : Math.round(Math.sin(state.time * 10) * unit);
  const recoil = state.fireFlash > 0 ? unit * 2 : 0;
  const x = Math.round(w / 2 + w * 0.12), y = h - unit * 14 + bob + recoil;
  ctx.fillStyle = palette.gunDark;
  ctx.fillRect(x - unit * 3, y + unit * 6, unit * 6, unit * 9);
  ctx.fillStyle = palette.gun;
  ctx.fillRect(x - unit * 5, y, unit * 10, unit * 7);
  ctx.fillRect(x - unit * 2, y - unit * 6, unit * 4, unit * 7);
  ctx.fillStyle = palette.crosshair;
  ctx.fillRect(x - unit * 4, y + unit * 2, unit * 8, unit);
  ctx.fillStyle = palette.gunDark;
  ctx.fillRect(x - unit, y - unit * 7, unit * 2, unit * 2);
  if (state.fireFlash > 0 && !still) {
    ctx.fillStyle = palette.flash;
    const fx = x, fy = y - unit * 8;
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const r = (i % 2 ? unit * 1.5 : unit * 4);
      const a = (i / 10) * Math.PI * 2;
      ctx[i ? 'lineTo' : 'moveTo'](fx + Math.cos(a) * r, fy + Math.sin(a) * r);
    }
    ctx.fill();
  }
}

export function drawHunter(ctx, state, { width: w, height: h, palette, time, still, showMap }) {
  ctx.imageSmoothingEnabled = false;
  const horizon = Math.round(h / 2);
  palette.ceiling.forEach((color, i) => { ctx.fillStyle = color; ctx.fillRect(0, Math.floor(i * horizon / 6), w, Math.ceil(horizon / 6) + 1); });
  palette.floor.forEach((color, i) => {
    const y0 = horizon + (h - horizon) * Math.pow(i / 7, 1.5), y1 = horizon + (h - horizon) * Math.pow((i + 1) / 7, 1.5);
    ctx.fillStyle = color; ctx.fillRect(0, Math.floor(y0), w, Math.ceil(y1 - y0) + 1);
  });

  const { player } = state;
  const depth = new Float32Array(w);
  for (let x = 0; x < w; x += 1) {
    const offset = Math.atan((2 * (x + 0.5) / w - 1) * PLANE);
    const hit = castRay(player.x, player.y, player.dir + offset, 24);
    const perp = Math.max(0.05, hit.distance * Math.cos(offset));
    depth[x] = perp;
    const wallH = h / perp;
    const top = horizon - wallH / 2;
    const fog = Math.min(FOG_STEPS - 1, Math.floor(perp / FOG_DISTANCE * FOG_STEPS));
    ctx.fillStyle = palette.wall[hit.side][fog]; ctx.fillRect(x, top, 1, wallH);
    const panel = (hit.wallX * 2) % 1;
    if (panel < 0.06) { ctx.fillStyle = palette.seam[fog]; ctx.fillRect(x, top, 1, wallH); }
    ctx.fillStyle = palette.trim[fog]; ctx.fillRect(x, top + wallH * 0.06, 1, Math.max(1, wallH * 0.03));
    ctx.fillStyle = palette.seam[fog]; ctx.fillRect(x, top + wallH * 0.86, 1, Math.max(1, wallH * 0.14));
  }

  const sprites = state.bugs.map(bug => {
    const dx = bug.x - player.x, dy = bug.y - player.y;
    const relative = Math.atan2(Math.sin(Math.atan2(dy, dx) - player.dir), Math.cos(Math.atan2(dy, dx) - player.dir));
    return { bug, relative, perp: Math.hypot(dx, dy) * Math.cos(relative) };
  }).filter(sprite => sprite.perp > 0.2 && Math.abs(sprite.relative) < FOV / 2 + 0.5).sort((a, b) => b.perp - a.perp);
  for (const { bug, relative, perp } of sprites) {
    const sx = (0.5 + Math.tan(relative) / PLANE / 2) * w;
    const size = h / perp * 0.3 * BUG_TYPES[bug.type].size;
    const floorY = horizon + h / perp / 2;
    const x0 = Math.max(0, Math.floor(sx - size * 1.3)), x1 = Math.min(w, Math.ceil(sx + size * 1.3));
    // Clip the sprite to the columns where it is in front of the wall.
    ctx.save(); ctx.beginPath();
    let open = false, start = 0, visible = false;
    for (let x = x0; x <= x1; x += 1) {
      const front = x < x1 && depth[x] > perp;
      if (front && !open) { open = true; start = x; }
      if (!front && open) { open = false; visible = true; ctx.rect(start, 0, x - start, h); }
    }
    if (visible) { ctx.clip(); drawBug(ctx, bug, sx, floorY, size, palette, time, still); }
    ctx.restore();
  }

  // Edge arrows warn about nearby bugs outside the field of view.
  ctx.fillStyle = palette.hurt;
  for (const bug of state.bugs) {
    if (bug.dead) continue;
    const dx = bug.x - player.x, dy = bug.y - player.y;
    const relative = Math.atan2(Math.sin(Math.atan2(dy, dx) - player.dir), Math.cos(Math.atan2(dy, dx) - player.dir));
    if (Math.abs(relative) < FOV / 2 || Math.hypot(dx, dy) > 4) continue;
    const side = relative > 0 ? 1 : -1, x = side > 0 ? w - 6 : 6, size = Math.max(6, w / 50);
    ctx.beginPath(); ctx.moveTo(x, horizon); ctx.lineTo(x - side * size, horizon - size); ctx.lineTo(x - side * size, horizon + size); ctx.fill();
  }
  const aimed = state.status !== 'over' && aimedBug(state);
  const cx = Math.round(w / 2), cy = horizon, arm = Math.max(3, Math.round(w / 70)), thick = Math.max(1, Math.round(w / 300));
  ctx.fillStyle = aimed ? palette.aim : palette.crosshair;
  ctx.fillRect(cx - arm * 2, cy - thick, arm, thick * 2); ctx.fillRect(cx + arm, cy - thick, arm, thick * 2);
  ctx.fillRect(cx - thick, cy - arm * 2, thick * 2, arm); ctx.fillRect(cx - thick, cy + arm, thick * 2, arm);
  drawWeapon(ctx, state, w, h, palette, still);

  if (state.hurt > 0) {
    const edge = Math.round(w * 0.04 * (state.hurt / 0.4)) + 1;
    ctx.globalAlpha = 0.55; ctx.fillStyle = palette.hurt;
    ctx.fillRect(0, 0, w, edge); ctx.fillRect(0, h - edge, w, edge); ctx.fillRect(0, 0, edge, h); ctx.fillRect(w - edge, 0, edge, h);
    ctx.globalAlpha = 1;
  }

  if (showMap) {
    const cell = Math.max(3, Math.floor(w / 60)), ox = 6, oy = 6;
    HUNTER_MAP.forEach((row, y) => row.forEach((wall, x) => { ctx.fillStyle = wall ? palette.mapWall : palette.mapFloor; ctx.fillRect(ox + x * cell, oy + y * cell, cell, cell); }));
    state.bugs.forEach(bug => { if (!bug.dead) { ctx.fillStyle = palette.bug[bug.type]; ctx.fillRect(ox + bug.x * cell - 1, oy + bug.y * cell - 1, 3, 3); } });
    ctx.fillStyle = palette.crosshair;
    ctx.fillRect(ox + player.x * cell - 2, oy + player.y * cell - 2, 4, 4);
    ctx.fillRect(ox + (player.x + Math.cos(player.dir) * 0.8) * cell - 1, oy + (player.y + Math.sin(player.dir) * 0.8) * cell - 1, 2, 2);
  }
}
