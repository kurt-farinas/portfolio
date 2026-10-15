// A silent original attract-mode vignette, not a game or an emulator.
export function createFightingClock(initial = 0) {
  let time = Number.isFinite(initial) ? ((initial % 12) + 12) % 12 : 0;
  let frame = Math.floor(time * 12);
  return {
    get time() { return time; },
    step(delta, active) {
      if (!active || !Number.isFinite(delta) || delta <= 0) return null;
      // The first frame after a sleeping canvas/tab cannot fast-forward the demo.
      time = (time + Math.min(delta, 1 / 12)) % 12;
      const next = Math.floor(time * 12);
      if (next === frame) return null;
      frame = next;
      return frame / 12;
    }
  };
}

export function fightingPose(seconds) {
  const t = ((seconds % 12) + 12) % 12;
  const ramp = (a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
  const approach = t < 4 ? ramp(2, 4) : t < 6 ? 1 : t < 8 ? 1 - ramp(6, 8) : t < 10 ? ramp(8, 9) : 1 - ramp(10, 11.2);
  const strikeA = t >= 4 && t < 6 ? Math.max(0, Math.sin((t - 4) * Math.PI)) : 0;
  const strikeB = t >= 9 && t < 10 ? Math.sin((t - 9) * Math.PI) : 0;
  const reset = ramp(11.2, 12);
  return {
    left: 48 + approach * 15, right: 112 - approach * 15,
    bob: Math.sin(t * Math.PI) * 1.1,
    strikeA, strikeB,
    healthA: 1 - 0.22 * ramp(9, 10) * (1 - reset),
    healthB: 1 - 0.18 * ramp(4, 6) * (1 - reset),
    indicator: 1 + 0.22 * Math.sin(reset * Math.PI)
  };
}

export function drawFightingDemo(ctx, colors, pose) {
  const polygon = (points, fill) => {
    ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(...points[0]);
    points.slice(1).forEach(point => ctx.lineTo(...point)); ctx.closePath(); ctx.fill();
  };
  ctx.fillStyle = colors.skyNight; ctx.fillRect(0, 0, 160, 120);
  ctx.fillStyle = colors.hardwareEdge;
  ctx.fillRect(0, 38, 160, 25);
  [10, 40, 120, 150].forEach(x => { ctx.fillRect(x - 3, 27, 6, 43); });
  polygon([[0, 70], [160, 70], [160, 120], [0, 120]], colors.curtain);
  ctx.strokeStyle = colors.hardwareDetail; ctx.lineWidth = 0.5;
  [-100, -40, 20, 80, 140, 200, 260].forEach(x => {
    ctx.beginPath(); ctx.moveTo(80 + (x - 80) * 0.2, 70); ctx.lineTo(x, 120); ctx.stroke();
  });
  [76, 85, 100, 119].forEach(y => { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(160, y); ctx.stroke(); });
  const fighter = (x, facing, outfit, strike, bob) => {
    ctx.save(); ctx.translate(Math.round(x), 100 + Math.round(bob)); ctx.scale(facing, 1);
    polygon([[-10, 1], [10, 1], [17, 5], [-17, 5]], colors.hardwareEdge);
    polygon([[-6, -17], [1, -15], [-7, 0], [-13, 0]], colors.objectDark);
    polygon([[1, -16], [6, -17], [14, -1], [8, 0]], colors.objectDark);
    polygon([[-8, -35], [5, -37], [9, -17], [-6, -15]], outfit);
    polygon([[-6, -44], [2, -46], [7, -41], [4, -34], [-4, -34]], colors.paper);
    polygon([[-7, -44], [2, -47], [7, -43], [-6, -41]], colors.hardwareBlack);
    polygon([[-7, -33], [-13, -25], [-8, -20], [-4, -26]], outfit);
    const reach = Math.round(strike * 13);
    polygon([[5, -35], [11, -31], [14 + reach, -34], [17 + reach, -30], [11, -24], [4, -28]], outfit);
    polygon([[14 + reach, -34], [19 + reach, -33], [20 + reach, -29], [15 + reach, -29]], colors.paper);
    ctx.restore();
  };
  fighter(pose.left, 1, colors.fragranceStone, pose.strikeA, pose.bob);
  fighter(pose.right, -1, colors.fragranceRed, pose.strikeB, -pose.bob);
  // Simple bars remain legible without tiny text or flashing effects.
  ctx.fillStyle = colors.hardwareEdge; ctx.fillRect(9, 10, 64, 7); ctx.fillRect(87, 10, 64, 7);
  ctx.fillStyle = colors.led; ctx.fillRect(11, 12, Math.round(60 * pose.healthA), 3);
  ctx.fillStyle = colors.fragranceRed; ctx.fillRect(149 - Math.round(60 * pose.healthB), 12, Math.round(60 * pose.healthB), 3);
}
