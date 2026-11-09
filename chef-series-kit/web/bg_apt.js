// Apartment sets: apt_night (living room), apt_kitchen (+ doorway view, ceiling), microwave_cu, stove_cu.
import { W, H, INK, M, rng, clamp, lerp, rect, circ, ell, poly, line, P, box, clipTo, halftone, stripes, speckle, txt, glow, blobPath, rrPath, shadeCol, hash,
  fillAll, defSet, pool, shaft, ao, castShadow, rimP, halftoneIn, emit, vignette2, keyGrad, holed, rectHole, texture, sky, clockFace, wisps, twinkle, screenSpace,
  noodleCup, cupTower, plant, frame, stringLightsWire, stringLightsGlow, windowBlinds, skyline, moon, stars, woodFloor, eggSplat, shell, scorch, puff } from './bgkit.js';
const fill = (ctx, col) => fillAll(ctx, col);
const B0 = [-M, -M, W + M, H + M];

/* ---------- far-city helpers ---------- */
// a row of buildings; mode 'stat' paints buildings + windows, 'anim' repaints a blinking subset
function cityRow(ctx, x, y, w, h, seed, { cols = ['#1a2250', '#222c5e'], lit = ['#ffd27a', '#9fe3ff'], dens = 0.33, t = 0, mode = 'stat', ww = 10, wh = 14, ant = true } = {}) {
  const R = rng(seed); let xx = x - 20, k = 0;
  while (xx < x + w) { const bw = 60 + R() * 90, bh = h * (0.25 + R() * 0.6), col = R() < 0.5 ? cols[0] : cols[1], top = y + h - bh;
    if (mode === 'stat') { ctx.fillStyle = col; ctx.fillRect(xx, top, bw, bh + 4); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(xx, top, 6, bh); }
    for (let wy = top + 16; wy < y + h - 10; wy += wh * 2) for (let wx = xx + 10; wx < xx + bw - 14; wx += ww * 2.2) { const r = R(), r2 = R(); k++;
      if (mode === 'stat') { if (r < dens) { ctx.fillStyle = r2 < 0.8 ? lit[0] : lit[1]; ctx.fillRect(wx, wy, ww, wh); } }
      else if (r < dens * 1.3 && hash(k * 3.7 + seed) < 0.12) { const on = hash(Math.floor(t * 0.7 + hash(k) * 9) * 1.3 + k) > 0.5; ctx.fillStyle = on ? lit[0] : col; ctx.fillRect(wx, wy, ww, wh); } }
    const a = R(); if (ant && a < 0.3) { if (mode === 'stat') { ctx.fillStyle = col; ctx.fillRect(xx + bw / 2 - 3, top - 40, 6, 40); }
      else { const on = Math.sin(t * 3 + xx) > 0.2; circ(ctx, xx + bw / 2, top - 42, 5, on ? '#ff5d5d' : '#5a2a3a', 0); if (on) emit(ctx, xx + bw / 2, top - 42, 26, '#ff5d5d', 0.6); } }
    xx += bw + 4; }
}
// car light streaks on a road band (y = road centre)
export function carStreaks(ctx, x0, x1, y, t, { n = 5, seed = 1, scale = 1, a = 1 } = {}) {
  for (let i = 0; i < n; i++) { const dir = i % 2 ? 1 : -1, sp = (180 + hash(i * 7 + seed) * 220) * scale, L = x1 - x0 + 400;
    const x = dir > 0 ? x0 - 200 + ((t * sp + hash(i + seed) * L) % L) : x1 + 200 - ((t * sp + hash(i + seed) * L) % L);
    const yy = y + (dir > 0 ? 6 : -6) * scale, len = 70 * scale, col = dir > 0 ? '#ffffff' : '#ff4d4d', head = dir > 0 ? '#fff6d0' : '#ff8a7a';
    const g = ctx.createLinearGradient(x - dir * len, 0, x, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, col);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(Math.min(x, x - dir * len), yy - 2.5 * scale, len, 5 * scale); ctx.restore();
    emit(ctx, x, yy, 22 * scale, head, 0.8 * a); }
}

/* ======================= apt_night ======================= */
const NWIN = { x: 590, y: 250, w: 420, h: 560 };
function aptFarStat(ctx) {
  const { x, y, w, h } = NWIN;
  sky(ctx, 300, -120, 1100, 1100, [[0, '#0a0f30'], [0.45, '#18205a'], [0.75, '#3a2f74'], [0.9, '#5a3a7a']]);
  stars(ctx, 300, 0, 1100, 520, 40, 4, 0); moon(ctx, x + w * 0.72, y + 200, 50);
  cityRow(ctx, 300, y + 300, 1100, 230, 23, { cols: ['#2a2a62', '#30306c'], lit: ['#c9a6ff', '#9fe3ff'], dens: 0.2, ww: 7, wh: 9, ant: false });
  cityRow(ctx, 300, y + 340, 1100, 240, 11, { dens: 0.33 });
  ctx.fillStyle = '#121838'; ctx.fillRect(300, y + 520, 1100, 400); ctx.fillStyle = '#2a2f55'; ctx.fillRect(300, y + 520, 1100, 8);
  for (let xx = 300; xx < 1400; xx += 40) { ctx.fillStyle = '#2a2f55'; ctx.fillRect(xx, y + 506, 5, 20); }
}
function aptFarAnim(ctx, o) {
  const t = o.t || 0, { x, y, w } = NWIN;
  stars(ctx, 300, 0, 1100, 520, 14, 99, t * 2);
  cityRow(ctx, 300, y + 340, 1100, 240, 11, { dens: 0.33, t, mode: 'anim' });
  carStreaks(ctx, 300, 1400, y + 540, t, { n: 6, seed: 3, scale: 0.8 });
  // a plane crossing slowly, blinking
  const px = 300 + ((t * 30 + 200) % 1100), py = y + 90 + Math.sin(t * 0.2) * 10; if (Math.floor(t * 2) % 2) { circ(ctx, px, py, 3, '#ff6b6b', 0); emit(ctx, px, py, 18, '#ff6b6b', 0.7); } circ(ctx, px - 8, py, 2, '#fff', 0);
}
function aptMidStat(ctx, o) {
  const { x: wx, y: wy, w: ww, h: wh } = NWIN;
  holed(ctx, B0, [rectHole(wx, wy, ww, wh)], () => {
    fill(ctx, '#2b3568'); stripes(ctx, -M, -M, W + 2 * M, 1480 + M, '#27305f', 72, 30);
    for (let x = -M + 36; x < W + M; x += 72) { ctx.fillStyle = 'rgba(255,220,160,0.05)'; for (let yy = 100; yy < 1450; yy += 48) ctx.fillRect(x + 8, yy, 14, 14); } // tiny wallpaper motif
    halftone(ctx, -M, 900, W + 2 * M, 580, '#1f2752', 22, 5, 'down', 0.8); texture(ctx, -M, -M, W + 2 * M, 1500 + M, 31, 0.05, 500);
    ctx.fillStyle = '#222a58'; ctx.fillRect(-M, -M, W + 2 * M, M + 70);
    // light: warm lamp pool, cool window spill, AO under the ceiling + corners + above baseboard
    pool(ctx, 1010, 930, 520, 600, '255,190,110', 0.42); pool(ctx, 1010, 930, 220, 260, '255,220,150', 0.35);
    shaft(ctx, [wx - 30, wy + wh + 40, wx + ww + 30, wy + wh + 40, wx + ww + 120, 1450, wx - 120, 1450], '130,170,255', 0.16, 0, 0, wy + wh, 0, 1450);
    ao(ctx, -M, 70, W + 2 * M, 120, 't', 0.45); ao(ctx, -M, 1330, W + 2 * M, 130, 'b', 0.4); ao(ctx, -M, -M, M + 120, H, 'l', 0.35);
    line(ctx, -M, 70, W + M, 70, 6);
  });
  // window frame + blinds (over the hole) + mullion
  box(ctx, wx - 24, wy - 24, ww + 48, 24, '#e6dcc4', '#c9bc9e', { side: 'b', sw: 8 }); box(ctx, wx - 24, wy - 24, 24, wh + 48, '#e6dcc4', '#c9bc9e', { side: 'r', sw: 8 }); box(ctx, wx + ww, wy - 24, 24, wh + 48, '#e6dcc4', '#c9bc9e', { side: 'l', sw: 8 });
  clipTo(ctx, (c) => c.rect(wx, wy, ww, wh), () => { windowBlinds(ctx, wx, wy, ww, wh, 0.28); ctx.fillStyle = 'rgba(160,200,255,0.08)'; ctx.beginPath(); ctx.moveTo(wx + 40, wy + wh); ctx.lineTo(wx + 200, wy + 160); ctx.lineTo(wx + 250, wy + 160); ctx.lineTo(wx + 90, wy + wh); ctx.fill(); });
  rect(ctx, wx, wy, ww, wh, null, 6); line(ctx, wx + ww / 2, wy + wh * 0.28, wx + ww / 2, wy + wh, 10, '#e6dcc4'); line(ctx, wx + ww / 2 - 6, wy + wh * 0.28 + 10, wx + ww / 2 - 6, wy + wh, 3); line(ctx, wx + ww / 2 + 6, wy + wh * 0.28 + 10, wx + ww / 2 + 6, wy + wh, 3);
  box(ctx, wx - 44, wy + wh + 14, ww + 88, 30, '#efe6d0', '#cfc2a2', { side: 'b', sw: 10, r: 4 }); rect(ctx, wx - 24, wy + wh, ww + 48, 14, '#cfc2a2', 5);
  // sill props: cactus, mugs, tiny radio
  P(ctx, (c) => { c.roundRect(wx + 40, wy + wh - 70, 40, 84, 18); }, '#4f9a5c', 5); line(ctx, wx + 60, wy + wh - 50, wx + 60, wy + wh, 2, '#2f7f50'); rect(ctx, wx + 26, wy + wh - 10, 68, 30, '#d4693d', 5, 4);
  rect(ctx, wx + ww - 120, wy + wh - 24, 40, 40, '#ff8a5c', 5, 6); P(ctx, (c) => c.arc(wx + ww - 122, wy + wh - 4, 10, Math.PI * 0.5, Math.PI * 1.5), null, 5); rect(ctx, wx + ww - 74, wy + wh - 34, 40, 50, '#9fd3e8', 5, 6);
  rimP(ctx, (c) => c.roundRect(wx + ww - 74, wy + wh - 34, 40, 50, 6), 'rgba(170,200,255,0.8)', -5, -3, 5);
  // posters with cast shadows (lamp on the right → shadows fall left/down)
  castShadow(ctx, (c) => c.rect(70, 270, 270, 380), -16, 18); castShadow(ctx, (c) => c.rect(370, 420, 170, 210), -14, 16);
  frame(ctx, 70, 270, 270, 380, '#f2b33d', (x, y, w, h) => {
    ctx.fillStyle = '#e8542f'; ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.62, w * 0.62, Math.PI, 0); ctx.fill();
    for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#e8542f' : '#f7c75a'; ctx.beginPath(); ctx.moveTo(x + w / 2, y + h * 0.62); ctx.arc(x + w / 2, y + h * 0.62, w, Math.PI + i * 0.52, Math.PI + i * 0.52 + 0.26); ctx.fill(); }
    P(ctx, (c) => { c.moveTo(x + 30, y + h * 0.6); c.lineTo(x + w - 30, y + h * 0.6); c.quadraticCurveTo(x + w - 40, y + h * 0.88, x + w / 2, y + h * 0.88); c.quadraticCurveTo(x + 40, y + h * 0.88, x + 30, y + h * 0.6); }, '#fbf3e3', 5);
    line(ctx, x + w * 0.55, y + h * 0.25, x + w * 0.4, y + h * 0.62, 8); line(ctx, x + w * 0.7, y + h * 0.26, x + w * 0.48, y + h * 0.62, 8);
    for (let i = 0; i < 3; i++) P(ctx, (c) => { c.moveTo(x + 70 + i * 40, y + h * 0.6); c.bezierCurveTo(x + 50 + i * 40, y + h * 0.5, x + 90 + i * 40, y + h * 0.45, x + 70 + i * 40, y + h * 0.38); }, null, 4, '#fff7e0');
    txt(ctx, 'NOODLE', x + w / 2, y + 44, { font: 'Anton', weight: 400, size: 52, col: INK }); txt(ctx, 'KING', x + w / 2, y + h - 22, { font: 'Anton', weight: 400, size: 30, col: INK, spacing: 6 });
    halftone(ctx, x, y + h * 0.5, w, h * 0.5, 'rgba(120,30,10,0.25)', 12, 3, 'down');
  });
  frame(ctx, 370, 420, 170, 210, '#3aa6a0', (x, y, w, h) => {
    poly(ctx, [x + 30, y + 40, x + w - 30, y + 40, x + w / 2, y + h - 50], '#f7c75a', 5); poly(ctx, [x + 26, y + 30, x + w - 26, y + 30, x + w - 34, y + 52, x + 34, y + 52], '#d98a3a', 5);
    circ(ctx, x + w / 2 - 14, y + 80, 11, '#d6453d', 4); circ(ctx, x + w / 2 + 16, y + 106, 10, '#d6453d', 4); circ(ctx, x + w / 2, y + 140, 8, '#d6453d', 4);
    txt(ctx, 'SLICE CLUB', x + w / 2, y + h - 22, { font: 'Anton', weight: 400, size: 22, col: '#fbf3e3' });
  });
  // polaroids taped under the shelf
  [[372, 335, -0.12, '#f2b33d'], [440, 342, 0.08, '#d96aa0']].forEach(([x, y, r, c]) => { ctx.save(); ctx.translate(x + 30, y + 34); ctx.rotate(r); rect(ctx, -30, -34, 60, 68, '#fbf7ee', 4, 2); ctx.fillStyle = c; ctx.fillRect(-24, -28, 48, 42); circ(ctx, 0, -10, 9, '#7a4528', 0); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-12, -40, 24, 10); ctx.restore(); });
  // shelf with books + headphones + trophy cup noodle
  castShadow(ctx, (c) => c.rect(360, 300, 200, 22), -10, 14);
  box(ctx, 360, 300, 200, 22, '#a8693f', '#8a5230', { side: 'b', sw: 8 });
  [['#e8542f', 30, 78], ['#f2b33d', 26, 64], ['#4fa3d9', 34, 84], ['#e6dcc4', 22, 70]].reduce((x, [c, w, h]) => { box(ctx, x, 300 - h, w, h, c, shadeCol(c, -0.2), { side: 'r', sw: 7, lw: 4 }); line(ctx, x + 4, 300 - h + 14, x + w - 6, 300 - h + 14, 3, 'rgba(255,255,255,0.5)'); return x + w + 2; }, 380);
  P(ctx, (c) => { c.arc(505, 270, 26, Math.PI, 0); }, null, 6); rect(ctx, 474, 262, 14, 30, '#e8542f', 4, 5); rect(ctx, 522, 262, 14, 30, '#e8542f', 4, 5);
  // wall clock mount shadow (hands animate)
  castShadow(ctx, (c) => c.arc(455, 770, 66, 0, 7), -12, 14);
  // ceiling fan downrod
  line(ctx, 300, -M, 300, 96, 8); line(ctx, 300, -M, 300, 96, 3, '#3a3350');
  stringLightsWire(ctx, -60, 120, 1140, 150, 90);
  // baseboard
  box(ctx, -M, 1452, W + 2 * M, 36, '#e6dcc4', '#c9bc9e', { side: 'b', sw: 10 });
}
function fan(ctx, x, y, t, r = 210) {
  const sp = t * 7; const blades = [];
  for (let i = 0; i < 4; i++) { const a = sp + i * Math.PI / 2; blades.push([Math.sin(a), a]); }
  blades.sort((p, q) => p[0] - q[0]);
  const blade = (a, alpha) => { const ca = Math.cos(a), sa = Math.sin(a); const tip = [x + ca * r, y + 16 + sa * 26], w = 0.22;
    ctx.save(); ctx.globalAlpha = alpha; P(ctx, (c) => { c.moveTo(x + Math.cos(a - w) * 40, y + 16 + Math.sin(a - w) * 6); c.lineTo(x + Math.cos(a - w * 0.5) * r, y + 16 + Math.sin(a - w * 0.5) * 26); c.quadraticCurveTo(tip[0] + ca * 14, tip[1] + sa * 3, x + Math.cos(a + w * 0.5) * r, y + 16 + Math.sin(a + w * 0.5) * 26); c.lineTo(x + Math.cos(a + w) * 40, y + 16 + Math.sin(a + w) * 6); c.closePath(); }, '#a8693f', 5); ctx.restore(); };
  for (const [z, a] of blades) if (z < 0) { blade(a - 0.25, 0.25); blade(a, 1); }
  P(ctx, (c) => c.roundRect(x - 34, y, 68, 34, 14), '#c9a24a', 5); ell(ctx, x, y + 40, 26, 12, '#fff2c4', 4); emit(ctx, x, y + 48, 90, '#ffe9a8', 0.35);
  for (const [z, a] of blades) if (z >= 0) { blade(a - 0.25, 0.25); blade(a, 1); }
}
function aptMidAnim(ctx, o) {
  const t = o.t || 0, { x: wx, y: wy, w: ww, h: wh } = NWIN;
  stringLightsGlow(ctx, -60, 120, 1140, 150, 90, t);
  fan(ctx, 300, 92, t);
  clockFace(ctx, 455, 770, 60, t + 17, { rim: '#e8542f', hour: 11.75 });
  wisps(ctx, wx + ww - 100, wy + wh - 30, t, { n: 2, h: 90, w: 9, a: 0.5, seed: 4 });
  const fl = 0.92 + 0.08 * Math.sin(t * 2.1) * Math.sin(t * 5.3);
  emit(ctx, 1010, 930, 320, '#ffcf7a', 0.32 * fl); emit(ctx, 1010, 1000, 120, '#fff2c4', 0.4 * fl);
}
function aptNearStat(ctx, o) {
  woodFloor(ctx, 1480);
  // floor light: lamp pool (warm) + window shaft (cool) + AO along the baseboard
  pool(ctx, 980, 1560, 520, 200, '255,190,110', 0.35); shaft(ctx, [560, 1490, 1050, 1490, 860, H + M, 160, H + M], '140,175,255', 0.2, 0.02, 0, 1490, 0, H);
  ao(ctx, -M, 1486, W + 2 * M, 90, 't', 0.45);
  // rug
  castShadow(ctx, (c) => c.roundRect(40, 1640, 1000, 230, 30), 0, 10, 'rgba(14,8,30,0.35)');
  P(ctx, (c) => c.roundRect(40, 1640, 1000, 230, 30), '#3aa6a0', 6); P(ctx, (c) => c.roundRect(80, 1668, 920, 174, 20), null, 4, '#2c8580');
  for (let x = 120; x < 1000; x += 80) rect(ctx, x, 1700, 36, 110, '#f2b33d', 0);
  for (let x = 60; x < 1030; x += 22) line(ctx, x, 1870, x + 3, 1886, 4, '#2c8580');
  ctx.globalAlpha = 0.25; ctx.fillStyle = INK; ctx.fillRect(40, 1820, 1000, 50); ctx.globalAlpha = 1;
  // couch shadow on the wall (lamp right → shadow left)
  castShadow(ctx, (c) => c.roundRect(40, 1060, 820, 420, 40), -40, -10, 'rgba(10,8,30,0.3)');
  const cc = o.couch || '#e07b39', cs = shadeCol(cc, -0.2);
  box(ctx, 90, 1030, 760, 260, cc, cs, { r: 40, side: 'b', sw: 40 });
  for (let i = 0; i < 2; i++) box(ctx, 130 + i * 345, 1060, 330, 200, shadeCol(cc, 0.08), cc, { r: 34, side: 'b', sw: 30, lw: 5 });
  box(ctx, 60, 1250, 820, 220, cc, cs, { r: 30, side: 'b', sw: 70 });
  halftone(ctx, 60, 1400, 820, 70, shadeCol(cc, -0.35), 14, 3.5, 'down');
  for (let i = 0; i < 2; i++) box(ctx, 150 + i * 320, 1240, 320, 80, shadeCol(cc, 0.12), shadeCol(cc, -0.05), { r: 24, side: 'b', sw: 18, lw: 5 });
  box(ctx, 30, 1150, 130, 310, cc, cs, { r: 40, side: 'r', sw: 34 }); box(ctx, 780, 1150, 130, 310, cc, cs, { r: 40, side: 'r', sw: 34 });
  rimP(ctx, (c) => c.roundRect(780, 1150, 130, 310, 40), 'rgba(255,214,150,0.85)', 8, -4, 6); rimP(ctx, (c) => c.roundRect(90, 1030, 760, 260, 40), 'rgba(255,214,150,0.6)', 6, -6, 6);
  rect(ctx, 90, 1460, 26, 26, INK, 0); rect(ctx, 820, 1460, 26, 26, INK, 0);
  ctx.save(); ctx.translate(210, 1180); ctx.rotate(-0.2); box(ctx, -70, -70, 140, 140, '#3aa6a0', '#2c8580', { r: 30, side: 'b', sw: 30 }); halftone(ctx, -60, -60, 120, 120, '#2c8580', 22, 5, 'none'); ctx.restore();
  // throw blanket over the right arm
  P(ctx, (c) => { c.moveTo(700, 1140); c.quadraticCurveTo(800, 1120, 900, 1160); c.lineTo(880, 1330); c.quadraticCurveTo(840, 1300, 820, 1340); c.lineTo(780, 1220); c.quadraticCurveTo(740, 1200, 700, 1240); c.closePath(); }, '#7b5cc4', 5);
  for (let i = 0; i < 4; i++) line(ctx, 720 + i * 44, 1150 + i * 4, 730 + i * 40, 1230 + i * 20, 4, '#9a80dc');
  speckle(ctx, 90, 1030, 760, 420, 'rgba(255,255,255,0.08)', 60, 5, 3);
  // shoes + game controller on the floor
  ell(ctx, 940, 1560, 44, 16, '#e2463f', 5); ell(ctx, 990, 1572, 44, 16, '#e2463f', 5); line(ctx, 910, 1552, 960, 1552, 3, '#fff');
}
function aptNearAnim(ctx, o) { const t = o.t || 0; plant(ctx, 40, 1470, 1.1, 9, Math.sin(t * 1.3) * 0.05 + Math.sin(t * 3.1) * 0.015); }
function floorLamp(ctx) { line(ctx, 1010, 1000, 1010, 1470, 10); ell(ctx, 1010, 1478, 60, 14, '#3a3350', 5); poly(ctx, [940, 990, 1080, 990, 1050, 870, 970, 870], '#f2d38a', 6); ctx.fillStyle = '#d9b46a'; ctx.fillRect(1030, 880, 30, 100); poly(ctx, [940, 990, 1080, 990, 1050, 870, 970, 870], null, 6); }
function leaf(ctx, x, y, s, a, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); P(ctx, (c) => { c.moveTo(0, 0); c.quadraticCurveTo(34, -20, 70, 0); c.quadraticCurveTo(34, 22, 0, 0); }, col, 4); line(ctx, 4, 0, 60, 0, 2.5, shadeCol(col, -0.3)); ctx.restore(); }
function vine(ctx, x, y, len, s, seed, sway = 0) { const R = rng(seed); ctx.beginPath(); ctx.moveTo(x, y); const pts = []; for (let k = 0; k <= 10; k++) { const q = k / 10, xx = x + Math.sin(q * 3 + seed) * 18 * s + sway * q * q * 60, yy = y + q * len; pts.push([xx, yy]); ctx.lineTo(xx, yy); } ctx.lineWidth = 4 * s; ctx.strokeStyle = '#2a5a3a'; ctx.stroke(); pts.forEach(([xx, yy], k) => { if (k) leaf(ctx, xx, yy, 0.55 * s * (1.1 - k / 14), (k % 2 ? 0.6 : 2.5) + R() * 0.4 + sway, k % 3 ? '#3f9a62' : '#2f7f50'); }); }
function leavesFg(ctx) { const R = rng(5); for (let i = 0; i < 16; i++) leaf(ctx, 900 + R() * 260, -60 + R() * 300, 1.4 + R() * 1.2, R() * 6.3, i % 2 ? '#1f5a3a' : '#2a6f48'); vine(ctx, 1000, -100, 520, 1.8, 3); }
function aptGrade(ctx) { keyGrad(ctx, 'soft-light', [[0, 'rgba(70,110,255,0.55)'], [0.55, 'rgba(120,120,200,0.1)'], [1, 'rgba(255,170,80,0.55)']], 'h'); vignette2(ctx, 0.5, '8,6,30'); }
defSet('apt_night', {
  layers: [
    { name: 'far', d: 0.12, blur: 2.2, bounds: [300, -120, 1400, 1000], stat: aptFarStat, anim: aptFarAnim },
    { name: 'mid', d: 0.86, stat: aptMidStat, anim: aptMidAnim },
    { name: 'near', d: 1, stat: (c, o) => { aptNearStat(c, o); floorLamp(c); }, anim: aptNearAnim },
    { name: 'fg', d: 1.12, front: true, stat: aptFgStat, anim: aptFgAnim },
    { name: 'fg2', d: 1.35, blur: 7, front: true, bounds: [760, -M, W + M, 520], stat: leavesFg },
  ],
  grade: aptGrade,
});
function aptFgAnim(ctx, o) { const t = o.t || 0; emit(ctx, 730, 1510, 230, '#8fe0ff', 0.28 + 0.05 * Math.sin(t * 7)); ctx.fillStyle = 'rgba(255,255,255,0.75)'; const sc = (t * 26) % 26; ctx.save(); ctx.beginPath(); ctx.moveTo(632, 1590); ctx.lineTo(828, 1590); ctx.lineTo(812, 1444); ctx.lineTo(646, 1444); ctx.clip(); for (let i = -1; i < 6; i++) ctx.fillRect(668, 1470 + i * 26 - sc, 90 + (i % 2) * 40, 10); ctx.restore(); twinkle(ctx, 540, 1534, 0.5 * Math.max(0, Math.sin(t * 2)), 1); }

/* ======================= apt_kitchen ======================= */
export const KITCHEN = { pot: [700, 990], micro: [300, 790, 270, 210], alarm: [540, 196], stove: [600, 920], egg: [640, -430], ceil: 150 };
export function drawAlarm(ctx, t, on) {
  const [ax, ay] = KITCHEN.alarm; ell(ctx, ax, ay - 30, 60, 16, '#f4f1ea', 5); P(ctx, (c) => { c.moveTo(ax - 60, ay - 30); c.lineTo(ax - 50, ay); c.lineTo(ax + 50, ay); c.lineTo(ax + 60, ay - 30); }, '#f4f1ea', 5); ell(ctx, ax, ay, 50, 10, '#e2ddd2', 5);
  for (let i = -2; i <= 2; i++) line(ctx, ax + i * 16, ay - 20, ax + i * 16, ay - 8, 3, '#b8b2a5');
  const lit = on && Math.floor(t * 4) % 2 === 0; circ(ctx, ax + 34, ay - 14, 6, lit ? '#ff3b3b' : '#7a2a3a', 3); if (lit) { emit(ctx, ax + 34, ay - 14, 140, '#ff3b3b', 0.7); }
}
const KWIN = [976, 656, 198, 228];
const day = (o) => (o.time || 'day') !== 'night';
function kFarStat(ctx, o) {
  const [x, y, w, h] = KWIN;
  if (day(o)) { sky(ctx, 880, 540, 420, 440, [[0, '#5fb8ec'], [0.7, '#bfe6f7'], [1, '#f6e7c4']]); glow(ctx, 1150, 690, 160, '#fff7d0', 0.8);
    cityRow(ctx, 880, 720, 420, 180, 5, { cols: ['#e9a87a', '#d98a6a'], lit: ['#bfe6f7', '#9fd3e8'], dens: 0.5, ww: 9, wh: 12, ant: false });
    rect(ctx, 1040, 700, 50, 40, '#8a5a3a', 4); poly(ctx, [1036, 700, 1094, 700, 1065, 676], '#6b4632', 4); line(ctx, 1046, 740, 1046, 770, 4); line(ctx, 1084, 740, 1084, 770, 4);
    for (let i = 0; i < 6; i++) circ(ctx, 900 + i * 70, 900, 50, i % 2 ? '#3f9a62' : '#4fae6e', 5); }
  else { ctx.fillStyle = '#18204a'; ctx.fillRect(880, 540, 420, 440); stars(ctx, x, y, w, 100, 8, 6, 0); skyline(ctx, x, 760, w, 124, 5, 0); }
}
function kFarAnim(ctx, o) {
  const t = o.t || 0; if (!day(o)) { cityRow(ctx, 976, 760, 198, 124, 5, { t, mode: 'anim' }); return; }
  for (let i = 0; i < 3; i++) { const cx = 860 + ((t * (14 + i * 6) + i * 170) % 480), cy = 600 + i * 34; ctx.save(); ctx.globalAlpha = 0.95; puff(ctx, cx, cy, 30 + i * 6, '#ffffff', 0, i + 40); ctx.restore(); }
  for (let i = 0; i < 2; i++) { const bx = 880 + ((t * 60 + i * 140) % 440), by = 640 + i * 30 + Math.sin(t * 2 + i) * 8, fl = Math.sin(t * 14 + i * 2) * 7; ctx.beginPath(); ctx.moveTo(bx - 10, by - fl); ctx.quadraticCurveTo(bx - 5, by - 4, bx, by); ctx.quadraticCurveTo(bx + 5, by - 4, bx + 10, by - fl); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }
}
function messWall(ctx, m) {
  scorch(ctx, 760, 560, 150 * m, 3, clamp(m * 1.6)); scorch(ctx, 820, 760, 90 * m, 11, clamp(m * 2 - 0.6));
  const splats = [[520, 300, 46], [980, 420, 50], [380, 820, 34], [160, 720, 40], [640, 700, 36], [1040, 260, 30], [110, 470, 28]];
  splats.forEach(([x, y, r], i) => { if (i / splats.length < m * 1.2) eggSplat(ctx, x, y, r, i + 7, i); });
}
function kMidStat(ctx, o) {
  const m = clamp(o.mess || 0), dy = day(o);
  holed(ctx, B0, [rectHole(...KWIN)], () => {
    fill(ctx, '#3f7d74'); stripes(ctx, -M, -M, W + 2 * M, 1100 + M, '#3a746c', 64, 26); texture(ctx, -M, -M, W + 2 * M, 1100 + M, 12, 0.05, 400);
    ctx.fillStyle = '#efe4cc'; ctx.fillRect(230, 580, W + M - 230, 420);
    ctx.fillStyle = '#d8c9a8'; for (let y = 580; y < 1000; y += 60) ctx.fillRect(230, y, W + M, 5); for (let y = 580, r = 0; y < 1000; y += 60, r++) for (let x = 230 + (r % 2) * 40; x < W + M; x += 80) ctx.fillRect(x, y, 5, 60);
    halftone(ctx, 230, 580, W + M, 420, 'rgba(160,130,90,0.35)', 20, 4, 'up');
    ao(ctx, 230, 580, W + M, 110, 't', 0.45); // under the upper cabinets
    if (dy) shaft(ctx, [976, 884, 1174, 884, 1060, 1000, 760, 1000], '255,225,150', 0.55, 0.12, 0, 884, 0, 1000);
    pool(ctx, 260, 330, 380, 300, '255,225,160', 0.3);
    ao(ctx, -M, 150, W + 2 * M, 120, 't', 0.4);
  });
  line(ctx, 230, 580, W + M, 580, 6);
  // upper cabinets
  const cab = '#f0c25a';
  [[240, 160, 190, 420], [434, 160, 160, 420], [930, 160, 250, 420]].forEach(([x, y, w, h], i) => cabinetDoor(ctx, x, y, w, h, cab, m > 0.55 && i !== 1 ? 1 : 0, i));
  box(ctx, 598, 160, 330, 300, cab, shadeCol(cab, -0.14), { side: 'b', sw: 20 }); rect(ctx, 616, 178, 140, 264, null, 4, 6); rect(ctx, 770, 178, 140, 264, null, 4, 6);
  if (!(m > 0.55)) for (const x of [240, 930]) rimP(ctx, (c) => c.roundRect(x, 160, x === 240 ? 190 : 250, 420, 6), 'rgba(255,240,190,0.7)', 0, -6, 6);
  // range hood with rim
  poly(ctx, [620, 460, 906, 460, 940, 610, 586, 610], '#c3ccd5', 6); ctx.fillStyle = '#a6b0bb'; ctx.fillRect(590, 596, 346, 14); rimP(ctx, (c) => { c.moveTo(620, 460); c.lineTo(906, 460); c.lineTo(940, 610); c.lineTo(586, 610); c.closePath(); }, 'rgba(255,255,255,0.7)', -6, 0, 6);
  for (let i = 0; i < 5; i++) line(ctx, 650 + i * 50, 560, 640 + i * 54, 592, 4, '#8f9aa5');
  // utensil rail bar (utensils swing in anim)
  line(ctx, 250, 640, 560, 640, 8);
  // window frame + sill herbs
  box(ctx, 960, 640, 230, 16, '#e6dcc4', '#c9bc9e', { side: 'b', sw: 6 }); box(ctx, 960, 640, 16, 260, '#e6dcc4', '#c9bc9e', { side: 'r', sw: 6 }); box(ctx, 1174, 640, 16, 260, '#e6dcc4', '#c9bc9e', { side: 'l', sw: 6 });
  rect(ctx, 976, 656, 198, 228, null, 5); line(ctx, 1075, 656, 1075, 884, 8, '#e6dcc4'); line(ctx, 976, 770, 1174, 770, 6, '#e6dcc4'); rect(ctx, 976, 656, 198, 228, null, 5);
  box(ctx, 950, 884, 250, 20, '#efe6d0', '#cfc2a2', { side: 'b', sw: 6 });
  if (dy) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.moveTo(990, 880); ctx.lineTo(1040, 660); ctx.lineTo(1070, 660); ctx.lineTo(1020, 880); ctx.fill(); }
  // fridge
  castShadow(ctx, (c) => c.roundRect(-80, 330, 320, 1230, 22), 26, 0, 'rgba(14,8,30,0.25)');
  box(ctx, -80, 330, 320, 1230, '#e9eef0', '#c4ccd3', { side: 'r', sw: 50, r: 22 }); line(ctx, -80, 760, 240, 760, 6);
  rimP(ctx, (c) => c.roundRect(-80, 330, 320, 1230, 22), 'rgba(255,255,255,0.9)', 0, -8, 6); line(ctx, -80, 760, 240, 760, 6);
  rect(ctx, 200, 420, 18, 260, '#a6b0bb', 5, 8); rect(ctx, 200, 800, 18, 340, '#a6b0bb', 5, 8); line(ctx, 205, 430, 205, 670, 3, '#fff'); line(ctx, 205, 810, 205, 1130, 3, '#fff');
  [['#e2463f', 30, 440], ['#2f8fd8', 120, 520], ['#f2b33d', 70, 860], ['#3aa060', 150, 960]].forEach(([c, x, y]) => { circ(ctx, x, y, 14, c, 4); circ(ctx, x - 4, y - 4, 4, 'rgba(255,255,255,0.7)', 0); });
  ctx.save(); ctx.translate(100, 940); ctx.rotate(0.06); rect(ctx, -70, -90, 140, 180, '#fbf7ee', 4, 2); txt(ctx, 'WOK THIS', 0, -60, { font: 'Anton', weight: 400, size: 24, col: '#d6453d' }); txt(ctx, 'WAY', 0, -32, { font: 'Anton', weight: 400, size: 24, col: '#d6453d' }); for (let i = 0; i < 5; i++) { ctx.fillStyle = '#c9c1b0'; ctx.fillRect(-50, -6 + i * 18, 70 + (i % 3) * 15, 7); } ctx.restore();
  ctx.save(); ctx.translate(40, 1120); ctx.rotate(-0.1); rect(ctx, -50, -40, 100, 80, '#fff', 4, 2); ctx.fillStyle = '#9fd3e8'; ctx.fillRect(-40, -30, 80, 50); circ(ctx, -14, -2, 12, '#f2c09a', 3); circ(ctx, 16, -4, 13, '#e8b08a', 3); ctx.restore();
  ctx.save(); ctx.translate(60, 1300); ctx.rotate(0.04); rect(ctx, -50, -60, 120, 130, '#ffb3d1', 4, 2); txt(ctx, 'MOM', 10, -30, { font: 'Anton', weight: 400, size: 28, col: '#d6453d' }); txt(ctx, '♥ call', 10, 6, { weight: 800, size: 20 }); ctx.restore();
  cupTower(ctx, 30, 330, 3, 0.75, 4); cupTower(ctx, 140, 330, 2, 0.75, 8);
  if (m > 0) messWall(ctx, m);
}
function kMidAnim(ctx, o) {
  const t = o.t || 0;
  // utensils swaying on the rail
  [[280, 'ladle'], [340, 'spat'], [400, 'whisk'], [460, 'ladle'], [520, 'spat']].forEach(([x, k], i) => { const a = Math.sin(t * 1.8 + i * 1.3) * 0.06; ctx.save(); ctx.translate(x, 640); ctx.rotate(a); line(ctx, 0, 0, 0, 60, 5); if (k === 'ladle') circ(ctx, 0, 72, 18, '#c3ccd5', 4); else if (k === 'spat') rect(ctx, -16, 60, 32, 38, '#e2463f', 4, 6); else ell(ctx, 0, 78, 14, 26, null, 4); ctx.restore(); });
  // flapping fridge note
  const fl = Math.sin(t * 2.2) * 0.5 + 0.5, ff = 0.06 + 0.1 * Math.max(0, Math.sin(t * 6.3)) * fl;
  ctx.save(); ctx.translate(90, 545); ctx.rotate(-0.08); circ(ctx, 0, -2, 10, '#e2463f', 4); ctx.transform(1, 0, ff, 1 - ff * 0.6, 0, 0);
  rect(ctx, -60, 0, 120, 120, '#ffe36e', 4, 2); ctx.fillStyle = 'rgba(14,8,30,0.15)'; ctx.fillRect(-58, 90, 116, 28); txt(ctx, 'EGGS??', 0, 44, { font: 'Inter', weight: 800, size: 22 }); txt(ctx, 'butter', 0, 78, { font: 'Inter', weight: 600, size: 18 }); ctx.restore();
  // wall clock between hood and window + hanging pothos
  clockFace(ctx, 868, 740, 52, t + 33, { rim: '#2f5d73', hour: 6.4 });
  const sw = Math.sin(t * 1.1) * 0.12 + Math.sin(t * 2.7) * 0.03;
  line(ctx, 1080, -M, 1080, 40, 3); P(ctx, (c) => c.ellipse(1080, 60, 50, 26, 0, 0, Math.PI), '#d4693d', 5); ell(ctx, 1080, 60, 50, 10, '#b4532d', 5);
  vine(ctx, 1050, 66, 300, 1, 7, sw); vine(ctx, 1100, 66, 220, 1, 9, sw * 1.2); vine(ctx, 1075, 70, 380, 1, 11, sw * 0.8);
}
// ceiling plane above y=150 (seen when the camera tilts up)
function ceiling(ctx, o) {
  const top = -1500, base = 150, vx = 540, vy = 1300;
  ctx.fillStyle = '#e8e2d2'; ctx.fillRect(-M, top, W + 2 * M, base - top);
  const g = ctx.createLinearGradient(0, base, 0, top); g.addColorStop(0, 'rgba(120,100,70,0.35)'); g.addColorStop(0.35, 'rgba(255,250,235,0)'); g.addColorStop(1, 'rgba(120,100,70,0.18)'); ctx.fillStyle = g; ctx.fillRect(-M, top, W + 2 * M, base - top);
  ctx.strokeStyle = '#d1c9b4'; ctx.lineWidth = 5;
  for (let x = -900; x <= 2000; x += 170) { const dx = x - vx, dy = base - vy, k = (top - base) / dy; ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x + dx * k, top); ctx.stroke(); }
  for (let y = base, s = 60; y > top; y -= s, s *= 1.22) { ctx.fillRect(-M, y - 3, W + 2 * M, 5); ctx.fillStyle = '#d1c9b4'; }
  // crown molding
  ctx.fillStyle = '#d1c9b4'; ctx.fillRect(-M, 116, W + 2 * M, 34); ctx.fillStyle = '#f3eee2'; ctx.fillRect(-M, 116, W + 2 * M, 10); line(ctx, -M, 150, W + M, 150, 6); line(ctx, -M, 116, W + M, 116, 4);
  // fixtures: flush dome light, vent, water stain, crack
  castShadow(ctx, (c) => c.ellipse(300, -720, 120, 46, 0, 0, 7), 0, 10, 'rgba(14,8,30,0.15)');
  ell(ctx, 300, -720, 120, 46, '#fff6cf', 6); ell(ctx, 300, -730, 80, 26, '#fffbe8', 0);
  rect(ctx, 820, -900, 160, 70, '#d9d2c0', 5, 6); for (let i = 0; i < 5; i++) line(ctx, 836, -885 + i * 12, 964, -885 + i * 12, 3, '#9a927f');
  P(ctx, (c) => blobPath(c, 160, -300, 90, 33, 10, 0.5), 'rgba(180,150,90,0.18)', 0); P(ctx, (c) => blobPath(c, 160, -300, 60, 34, 10, 0.5), null, 2, 'rgba(160,130,80,0.35)');
  P(ctx, (c) => { c.moveTo(930, 100); c.lineTo(900, 20); c.lineTo(918, -40); c.lineTo(880, -120); c.lineTo(890, -200); }, null, 3, '#9a927f');
  if (o.ceilingEgg || (o.mess || 0) > 0.1) { // the egg on the ceiling: foreshortened splat + shell shards + yolk strand root
    const [ex, ey] = KITCHEN.egg; ctx.save(); ctx.translate(ex, ey); ctx.scale(1.7, 0.85); eggSplat(ctx, 0, 0, 110, 41, 0.4); ctx.restore();
    shell(ctx, ex - 120, ey - 60, 3, 0.6, 3); shell(ctx, ex + 140, ey + 30, 2.6, 2.4, 5); shell(ctx, ex + 60, ey - 90, 2.2, 4, 8);
    speckle(ctx, ex - 220, ey - 120, 440, 240, '#ffb820', 18, 7, 6);
  }
}
function ceilingAnim(ctx, o) {
  const t = o.t || 0;
  emit(ctx, 300, -700, 260, '#fff2c4', 0.35);
  if (!(o.ceilingEgg || (o.mess || 0) > 0.1)) return;
  const [ex, ey] = KITCHEN.egg, per = 2.2, ph = ((t + 0.4) % per) / per;
  // stretchy yolk drip: grows, necks, a drop detaches and falls
  const grow = ph < 0.7 ? ph / 0.7 : 1, L = 50 + 150 * grow * grow, x0 = ex + 30, y0 = ey + 70, neck = ph < 0.7 ? 1 : 1 - (ph - 0.7) / 0.3;
  P(ctx, (c) => { c.moveTo(x0 - 22, y0); c.quadraticCurveTo(x0 - 10 * neck - 4, y0 + L * 0.6, x0 - 4, y0 + L); c.lineTo(x0 + 4, y0 + L); c.quadraticCurveTo(x0 + 10 * neck + 4, y0 + L * 0.6, x0 + 22, y0); c.closePath(); }, '#ffb820', 5);
  if (ph < 0.72) circ(ctx, x0, y0 + L + 8 * grow, 6 + 12 * grow, '#ffb820', 5);
  else { const fy = y0 + L + 20 + Math.pow((ph - 0.72) / 0.28, 2) * 1400; P(ctx, (c) => { c.moveTo(x0, fy - 34); c.quadraticCurveTo(x0 + 16, fy, x0, fy + 14); c.quadraticCurveTo(x0 - 16, fy, x0, fy - 34); }, '#ffb820', 5); }
  circ(ctx, x0 - 6, y0 + L * 0.5, 4, '#ffe39a', 0);
}
function messNear(ctx, o, m) {
  const R = rng(77);
  scorch(ctx, 700, 160, 120 * m, 8, clamp(m * 1.4 - 0.2));
  [[720, 70, 60], [880, 120, 40], [300, 120, 34]].forEach(([x, y, r], i) => { if (i / 3 < m * 1.5) eggSplat(ctx, x, y, r, i + 5, i); });
  if (m > 0.1) { P(ctx, (c) => { c.moveTo(700, 100); c.quadraticCurveTo(704, 150 + 40 * m, 696, 170 + 60 * m); }, null, 10, '#ffb820'); circ(ctx, 696, 176 + 60 * m, 9, '#ffb820', 4); }
  for (let i = 0; i < Math.floor(14 * m); i++) shell(ctx, 260 + R() * 820, i % 2 ? 994 : 1600 + R() * 240, 1.4, R() * 6, i);
  if (m > 0.6) { poly(ctx, [150, 1760, 230, 1740, 250, 1780, 170, 1800], '#9fd3e8', 5); poly(ctx, [270, 1790, 330, 1770, 320, 1820], '#9fd3e8', 5); P(ctx, (c) => blobPath(c, 420, 1700, 70, 61, 10, 0.5), 'rgba(255,184,32,0.85)', 4); }
  if (m > 0.8) { ctx.save(); ctx.translate(420, 140); ctx.rotate(0.35); rect(ctx, -10, 0, 20, 120, '#3a3350', 5, 6); rect(ctx, -30, -60, 60, 70, '#e2463f', 5, 8); ctx.restore(); }
}
function kNearStat(ctx, o) {
  const m = clamp(o.mess || 0), dy = day(o);
  ceiling(ctx, o);
  // pendant lamp
  line(ctx, 260, -260, 260, 60, 4); ell(ctx, 260, -260, 30, 10, '#d1c9b4', 4); poly(ctx, [200, 110, 320, 110, 296, 60, 224, 60], '#f2b33d', 5); P(ctx, (c) => c.arc(260, 112, 22, 0, Math.PI), '#fff6cf', 4);
  rimP(ctx, (c) => { c.moveTo(200, 110); c.lineTo(320, 110); c.lineTo(296, 60); c.lineTo(224, 60); c.closePath(); }, 'rgba(255,250,220,0.8)', -5, -3, 5);
  // counter + lower cabinets
  box(ctx, 230, 1000, W + M - 230, 46, '#c88a52', '#a8693f', { side: 'b', sw: 14 }); line(ctx, 230, 1004, W + M, 1004, 3, 'rgba(255,230,190,0.8)');
  const lc = '#2f5d73';
  [[240, 170], [420, 170]].forEach(([x, w]) => { box(ctx, x, 1060, w, 480, lc, shadeCol(lc, -0.18), { side: 'r', sw: 0.14, r: 6 }); rect(ctx, x + 60, 1090, w - 120, 14, '#c9a24a', 4, 6); rect(ctx, x + 22, 1130, w - 44, 380, null, 3, 6); });
  box(ctx, 940, 1060, 300, 480, lc, shadeCol(lc, -0.18), { side: 'r', sw: 0.14, r: 6 }); rect(ctx, 1000, 1090, 100, 14, '#c9a24a', 4, 6); rect(ctx, 962, 1130, 220, 380, null, 3, 6);
  ao(ctx, 230, 1046, W + M, 80, 't', 0.5); halftone(ctx, 230, 1380, W + M, 160, 'rgba(10,20,30,0.35)', 16, 4, 'down');
  ctx.fillStyle = '#1e3a4a'; ctx.fillRect(230, 1540, W + M, 20);
  // microwave body (window interior animates)
  const [mx, my, mw, mh] = KITCHEN.micro;
  castShadow(ctx, (c) => c.roundRect(mx, my, mw, mh, 14), -14, 8);
  box(ctx, mx, my, mw, mh, '#d7dde3', '#b4bdc6', { side: 'b', sw: 16, r: 14 }); rimP(ctx, (c) => c.roundRect(mx, my, mw, mh, 14), 'rgba(255,255,255,0.9)', 0, -6, 6);
  rect(ctx, mx + 200, my + 26, 54, 30, '#1c2a24', 4, 4);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) rect(ctx, mx + 205 + c * 26, my + 72 + r * 26, 18, 16, '#eef2f5', 3, 3);
  cupTower(ctx, mx + 70, my, 3, 0.62, 2); cupTower(ctx, mx + 170, my, 2, 0.62, 12);
  // stove
  const [sx0, sx1] = KITCHEN.stove;
  box(ctx, sx0, 900, sx1 - sx0, 90, '#f1ede4', '#d6d0c3', { side: 'b', sw: 20, r: 8 });
  for (let i = 0; i < 4; i++) { circ(ctx, sx0 + 50 + i * 74, 945, 18, '#3a3350', 4); line(ctx, sx0 + 50 + i * 74, 945, sx0 + 50 + i * 74, 930, 4, '#f1ede4'); }
  box(ctx, sx0, 990, sx1 - sx0, 560, '#f1ede4', '#d6d0c3', { side: 'r', sw: 0.12 });
  ctx.fillStyle = '#2a2a33'; ctx.fillRect(sx0 + 4, 990, sx1 - sx0 - 8, 16);
  rect(ctx, sx0 + 30, 1060, sx1 - sx0 - 60, 18, '#a6b0bb', 5, 8);
  rect(ctx, sx0 + 40, 1110, sx1 - sx0 - 80, 330, '#2a2f3a', 6, 14); ctx.save(); ctx.globalAlpha = 0.25; line(ctx, sx0 + 80, 1400, sx0 + 170, 1150, 14, '#fff'); ctx.restore();
  ctx.fillStyle = '#d6d0c3'; ctx.fillRect(sx0 + 6, 1480, sx1 - sx0 - 12, 60); rect(ctx, sx0, 1470, sx1 - sx0, 80, null, 5);
  // pot + kettle
  const potDark = m > 0.35, [px, py] = KITCHEN.pot, potPath = (c) => c.roundRect(px - 100, py - 120, 200, 124, [6, 6, 30, 30]);
  P(ctx, potPath, potDark ? '#5a5560' : '#b8c3cc', 0);
  clipTo(ctx, potPath, () => { ctx.fillStyle = potDark ? '#3e3a44' : '#8f9aa5'; ctx.fillRect(px + 50, py - 130, 60, 140); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(px - 76, py - 120, 14, 124); });
  rimP(ctx, potPath, 'rgba(255,240,210,0.85)', 6, -2, 6);
  ell(ctx, px, py - 120, 106, 18, potDark ? '#4a4650' : '#d3dbe2', 6); rect(ctx, px - 150, py - 104, 54, 18, '#3a3350', 5, 8); rect(ctx, px + 96, py - 104, 54, 18, '#3a3350', 5, 8);
  P(ctx, (c) => { c.moveTo(860, 990); c.lineTo(830, 900); c.quadraticCurveTo(860, 860, 890, 900); c.lineTo(880, 990); c.closePath(); }, '#e2463f', 0);
  P(ctx, (c) => c.roundRect(800, 900, 110, 92, 30), '#e2463f', 6); P(ctx, (c) => { c.moveTo(810, 930); c.lineTo(770, 905); }, null, 10); P(ctx, (c) => c.arc(855, 900, 34, Math.PI, 0), null, 7); ctx.fillStyle = '#c2352f'; ctx.fillRect(870, 906, 30, 80); P(ctx, (c) => c.roundRect(800, 900, 110, 92, 30), null, 6);
  circ(ctx, 826, 926, 8, 'rgba(255,255,255,0.8)', 0);
  // sink + dishes + cups + dish soap
  ell(ctx, 1060, 1006, 120, 12, '#8f9aa5', 5);
  const tap = (c) => { c.moveTo(1020, 1002); c.lineTo(1020, 900); c.quadraticCurveTo(1020, 860, 1060, 860); c.lineTo(1100, 860); c.lineTo(1100, 880); };
  P(ctx, tap, null, 14); P(ctx, tap, null, 6, '#c3ccd5');
  for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(1110 + i * 8, 990 - i * 6); ctx.rotate(-0.4 + i * 0.12); ell(ctx, 0, 0, 60, 14, i % 2 ? '#fbf7ee' : '#9fd3e8', 5); ctx.restore(); }
  P(ctx, (c) => c.roundRect(1180, 900, 40, 100, [14, 14, 6, 6]), '#7ee081', 5); rect(ctx, 1192, 880, 16, 22, '#fbf7ee', 4, 3);
  noodleCup(ctx, 960, 1000, 0.55, 0.4, { tab: false }); noodleCup(ctx, 965, 950, 0.55, 0.1, { tab: false, band: '#2f8fd8' });
  // floor (checker, receding) + sun patch + AO
  ctx.fillStyle = '#e8dfcf'; ctx.fillRect(-M, 1560, W + 2 * M, H + M);
  for (let r = 0, y = 1560; y < H + M; r++) { const hgt = 70 + r * 22; for (let x = -M + (r % 2) * 90; x < W + M; x += 180) { ctx.fillStyle = '#c45b4b'; ctx.fillRect(x, y, 90, hgt); } y += hgt; }
  if (dy) shaft(ctx, [700, 1560, 1100, 1560, 900, H + M, 300, H + M], '255,225,150', 0.4, 0.15, 0, 1560, 0, H);
  pool(ctx, 300, 1700, 500, 200, '255,230,170', 0.15);
  ao(ctx, -M, 1560, W + 2 * M, 90, 't', 0.45); line(ctx, -M, 1560, W + M, 1560, 6);
  if (m > 0) messNear(ctx, o, m);
}
function kNearAnim(ctx, o) {
  const t = o.t || 0, [mx, my] = KITCHEN.micro, on = o.micro;
  ceilingAnim(ctx, o);
  emit(ctx, 260, 140, 200, '#fff2b8', 0.4);
  // microwave interior
  rect(ctx, mx + 18, my + 22, 170, 156, on ? '#f6d27a' : '#2a2f3a', 5, 10);
  if (on) { emit(ctx, mx + 103, my + 100, 200, '#ffd27a', 0.55); clipTo(ctx, (c) => c.roundRect(mx + 18, my + 22, 170, 156, 10), () => noodleCup(ctx, mx + 103 + Math.cos(t * 1.4) * 14, my + 160, 0.6, t * 0.25, { tab: false }));
    if (o.sparks) for (let i = 0; i < 4; i++) { const a = t * 30 + i * 1.7; line(ctx, mx + 103, my + 100, mx + 103 + Math.cos(a) * 60, my + 100 + Math.sin(a) * 40, 4, '#fff'); } }
  ctx.save(); ctx.globalAlpha = 0.35; line(ctx, mx + 40, my + 150, mx + 110, my + 40, 8, '#fff'); line(ctx, mx + 80, my + 160, mx + 140, my + 70, 4, '#fff'); ctx.restore();
  txt(ctx, on ? '0:' + String(30 - Math.floor(t) % 30).padStart(2, '0') : (Math.floor(t * 2) % 2 ? '12:47' : '12 47'), mx + 227, my + 42, { font: 'Inter', weight: 700, size: 17, col: '#6cff9a' }); emit(ctx, mx + 227, my + 42, 40, '#6cff9a', 0.3);
  if (o.burner) { const fl = 0.85 + 0.15 * Math.sin(t * 9); emit(ctx, KITCHEN.pot[0], KITCHEN.pot[1], 170, '#ff6a2a', 0.6 * o.burner * fl); }
  if (o.alarm) drawAlarm(ctx, t, true);
  if (day(o) && (o.mess || 0) < 0.3) { const R = rng(5); for (let i = 0; i < 18; i++) { const ph = (t * 0.05 + R()) % 1, x = lerp(1000, 400, R()) + Math.sin(t + i) * 20, y = 1000 + ph * 700; ctx.fillStyle = `rgba(255,245,200,${0.6 * Math.sin(ph * Math.PI)})`; ctx.beginPath(); ctx.arc(x + (y - 1000) * -0.5, y, 2.5 + R() * 2, 0, 7); ctx.fill(); } }
}
function kFgAnim(ctx, o) {
  const m = clamp(o.mess || 0), t = o.t || 0; if (m <= 0.3) return;
  for (let i = 0; i < Math.floor(7 * m); i++) { const x = 60 + i * 160 + Math.sin(t * 0.7 + i) * 40 + ((t * 18) % 160); ctx.save(); ctx.globalAlpha = 0.9; puff(ctx, x, 210 + (i % 2) * 70 + Math.sin(t * 1.1 + i) * 10, 90 + 22 * (i % 3), i % 2 ? '#8d8a99' : '#9a97a6', 5, i + 3); ctx.restore(); }
  screenSpace(ctx, (c) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(120,130,110,${(m - 0.3) * 0.7})`); g.addColorStop(0.6, `rgba(124,130,120,${(m - 0.3) * 0.25})`); g.addColorStop(1, 'rgba(124,118,144,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); });
  if (o.view === 'doorway') for (let i = 0; i < 5; i++) { ctx.save(); ctx.globalAlpha = 0.85; puff(ctx, 820 + Math.sin(t + i) * 40 + i * 30, 300 + i * 150 - (t * 20) % 60, 110, '#9a97a6', 6, i + 20); ctx.restore(); }
}
function kGrade(ctx, o) {
  const m = clamp(o.mess || 0);
  if (m < 0.3) keyGrad(ctx, 'soft-light', [[0, 'rgba(255,220,150,0.6)'], [1, 'rgba(255,150,80,0.45)']], 'v');
  else { keyGrad(ctx, 'multiply', [[0, `rgba(150,170,140,${m * 0.75})`], [1, `rgba(170,180,160,${m * 0.45})`]], 'v'); keyGrad(ctx, 'screen', [[0, `rgba(90,110,80,${m * 0.3})`], [0.5, 'rgba(0,0,0,0)']], 'v'); }
  vignette2(ctx, 0.35 + m * 0.2, m > 0.3 ? '20,26,18' : '40,20,10');
}
const kKey = (o) => `${Math.round(clamp(o.mess || 0) * 20)}|${o.ceilingEgg ? 1 : 0}|${o.time || 'day'}`;
defSet('apt_kitchen', {
  resolve: (o) => o.view === 'doorway' ? 'apt_kitchen_door' : null, skey: kKey,
  layers: [
    { name: 'far', d: 0.15, blur: 2, bounds: [880, 540, 1300, 980], stat: kFarStat, anim: kFarAnim },
    { name: 'mid', d: 0.9, stat: kMidStat, anim: kMidAnim },
    { name: 'near', d: 1, bounds: [-M, -1500, W + M, H + M], stat: kNearStat, anim: kNearAnim },
    { name: 'fg', d: 1, front: true, anim: kFgAnim },
  ],
  grade: kGrade,
});
/* ---- doorway (reverse angle): hallway is the far layer seen through the door ---- */
const DOOR = { x: 270, w: 500, y: 330, h: 1340 };
function doorFarStat(ctx) {
  const { x: dx, w: dw, y: dy, h: dh } = DOOR, X = dx - 200, Wd = dw + 400;
  ctx.fillStyle = '#e9c58a'; ctx.fillRect(X, dy - 200, Wd, dh + 300); ctx.fillStyle = '#d9ad6e'; ctx.fillRect(X, dy - 200, 200 + dw * 0.22, dh + 300);
  stripes(ctx, X, dy - 200, Wd, dh + 300, 'rgba(201,150,90,0.35)', 40, 14);
  glow(ctx, dx + dw * 0.6, dy + 120, 420, '#fff2c4', 0.6);
  ctx.fillStyle = '#9a6440'; ctx.fillRect(X, dy + dh - 260, Wd, 400); poly(ctx, [dx + 120, dy + dh + 60, dx + 380, dy + dh + 60, dx + 330, dy + dh - 250, dx + 170, dy + dh - 250], '#8e2340', 0);
  for (let i = 0; i < 6; i++) rect(ctx, dx + 150 + i * 36, dy + dh - 240 + i * 50, 30, 6, '#e6b84a', 0);
  frame(ctx, dx + 260, dy + 360, 170, 220, '#9fd3e8', (x, y, w, h) => { ctx.fillStyle = '#3aa060'; ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + w * 0.4, y + h * 0.4); ctx.lineTo(x + w, y + h); ctx.fill(); circ(ctx, x + w * 0.72, y + h * 0.28, 20, '#ffd43b', 3); }, 5, '#c9a24a');
  line(ctx, dx + 60, dy + 620, dx + 60, dy + 660, 8); circ(ctx, dx + 60, dy + 600, 14, '#c9a24a', 4); P(ctx, (c) => c.roundRect(dx + 30, dy + 640, 60, 200, 20), '#e2463f', 5);
  ctx.fillStyle = 'rgba(28,21,48,0.15)'; ctx.fillRect(X, dy - 200, Wd, 240);
}
function doorFarAnim(ctx, o) { const t = o.t || 0; emit(ctx, DOOR.x + DOOR.w * 0.6, DOOR.y + 60, 200, '#fff2c4', 0.3 + 0.04 * Math.sin(t * 3)); }
function doorMidStat(ctx, o) {
  const m = clamp(o.mess || 0), { x: dx, w: dw, y: dy, h: dh } = DOOR;
  holed(ctx, B0, [rectHole(dx, dy, dw, dh)], () => { fill(ctx, '#3f7d74'); stripes(ctx, -M, -M, W + 2 * M, 1640 + M, '#3a746c', 64, 26); texture(ctx, -M, -M, W + 2 * M, H, 14, 0.05, 400);
    shaft(ctx, [dx, dy + dh, dx + dw, dy + dh, dx + dw + 300, H + M, dx - 300, H + M], '255,230,170', 0.3, 0, 0, dy + dh, 0, H); ao(ctx, -M, 110, W + 2 * M, 140, 't', 0.45);
    ctx.fillStyle = '#e8e2d2'; ctx.fillRect(-M, -M, W + 2 * M, M + 110); });
  line(ctx, -M, 110, W + M, 110, 6);
  box(ctx, dx - 40, dy - 40, 40, dh + 40, '#efe6d0', '#cfc2a2', { side: 'r', sw: 12 }); box(ctx, dx + dw, dy - 40, 40, dh + 40, '#efe6d0', '#cfc2a2', { side: 'r', sw: 12 }); box(ctx, dx - 40, dy - 40, dw + 80, 40, '#efe6d0', '#cfc2a2', { side: 'b', sw: 12 });
  ao(ctx, dx, dy, dw, 60, 't', 0.3, '14,8,30', 'source-over');
  poly(ctx, [dx + dw + 40, dy - 30, dx + dw + 170, dy + 30, dx + dw + 170, dy + dh - 30, dx + dw + 40, dy + dh], '#b77a4a', 6); circ(ctx, dx + dw + 140, dy + dh * 0.52, 12, '#c9a24a', 4);
  rimP(ctx, (c) => { c.moveTo(dx + dw + 40, dy - 30); c.lineTo(dx + dw + 170, dy + 30); c.lineTo(dx + dw + 170, dy + dh - 30); c.lineTo(dx + dw + 40, dy + dh); c.closePath(); }, 'rgba(255,230,170,0.7)', -8, 0, 6);
  rect(ctx, 160, 860, 50, 80, '#f4f1ea', 4, 6); rect(ctx, 178, 884, 14, 30, '#d6d0c3', 3, 3);
  castShadow(ctx, (c) => c.rect(30, 520, 170, 220), 12, 14);
  rect(ctx, 30, 520, 170, 220, '#fbf7ee', 5, 4); ctx.fillStyle = '#e2463f'; ctx.fillRect(33, 523, 164, 50); txt(ctx, 'CHORES', 115, 548, { font: 'Anton', weight: 400, size: 30, col: '#fff' });
  for (let i = 0; i < 4; i++) { ctx.fillStyle = '#c9c1b0'; ctx.fillRect(50, 600 + i * 32, 100, 9); txt(ctx, '✗', 170, 604 + i * 32, { size: 22, weight: 800, col: '#d6453d' }); }
  box(ctx, -M, 360, M + 30, 1300, '#e9eef0', '#c4ccd3', { side: 'r', sw: 30, r: 10 });
  for (let i = 0; i < 3; i++) { rect(ctx, 900, 400 + i * 40, 26, 8, '#c9a24a', 3, 2); } line(ctx, 913, 408, 913, 470, 3); circ(ctx, 913, 476, 10, '#e6b84a', 3);
  if (m > 0) { eggSplat(ctx, 960, 300, 44, 9, 1); eggSplat(ctx, 120, 300, 34, 4, 2); scorch(ctx, 1000, 140, 140, 6, 0.8); }
}
function doorNearStat(ctx, o) {
  const m = clamp(o.mess || 0);
  box(ctx, 860, 1160, 400, 46, '#c88a52', '#a8693f', { side: 'b', sw: 14 }); box(ctx, 880, 1206, 400, 450, '#2f5d73', '#244a5d', { side: 'r', sw: 0.1 }); ao(ctx, 880, 1206, 400, 60, 't', 0.5);
  cupTower(ctx, 980, 1160, 4, 0.7, 31);
  ctx.fillStyle = '#e8dfcf'; ctx.fillRect(-M, 1660, W + 2 * M, H + M); for (let r = 0, y = 1660; y < H + M; r++) { const hgt = 80 + r * 24; for (let x = -M + (r % 2) * 90; x < W + M; x += 180) { ctx.fillStyle = '#c45b4b'; ctx.fillRect(x, y, 90, hgt); } y += hgt; }
  shaft(ctx, [DOOR.x, 1660, DOOR.x + DOOR.w, 1660, DOOR.x + DOOR.w + 200, H + M, DOOR.x - 200, H + M], '255,230,170', 0.35, 0.05, 0, 1660, 0, H);
  ao(ctx, -M, 1660, W + 2 * M, 70, 't', 0.4); line(ctx, -M, 1660, W + M, 1660, 6);
  if (m > 0) for (let i = 0; i < 6; i++) shell(ctx, 120 + i * 150, 1720 + (i % 3) * 50, 1.6, i, i);
}
defSet('apt_kitchen_door', {
  skey: kKey,
  layers: [
    { name: 'far', d: 0.55, blur: 1.5, bounds: [DOOR.x - 200, DOOR.y - 200, DOOR.x + DOOR.w + 200, DOOR.y + DOOR.h + 100], stat: doorFarStat, anim: doorFarAnim },
    { name: 'mid', d: 0.92, stat: doorMidStat },
    { name: 'near', d: 1, stat: doorNearStat },
    { name: 'fg', d: 1, front: true, anim: (c, o) => kFgAnim(c, { ...o, view: 'doorway' }) },
  ],
  grade: kGrade,
});

/* ======================= close-ups (live single layer + grade) ======================= */
defSet('microwave_cu', { layers: [{ name: 'live', d: 1, anim: (c, o) => { microCU(c, o); const sp = clamp(o.sparks || 0); emit(c, 430, 900, 700, '#ffd27a', 0.25 + 0.3 * sp); } }],
  grade: (c, o) => { keyGrad(c, 'soft-light', [[0, 'rgba(255,220,140,0.5)'], [1, 'rgba(60,40,90,0.5)']]); vignette2(c, 0.45, '20,10,30'); } });
defSet('stove_cu', { layers: [{ name: 'live', d: 1, anim: stoveCU }],
  grade: (c, o) => { const h = clamp(o.hot || 0); keyGrad(c, 'soft-light', [[0, 'rgba(255,230,180,0.3)'], [1, `rgba(255,${120 - h * 60},40,${0.4 + h * 0.3})`]]); vignette2(c, 0.45, '30,10,10'); } });
/* ---- v1 helpers ---- */
function cabinetDoor(ctx, x, y, w, h, col, open = 0, seed = 0) {
  if (open > 0) { // open: dark interior + swung door
    rect(ctx, x, y, w, h, '#3b2f3a', 6); ctx.fillStyle = '#2a2230'; ctx.fillRect(x + 6, y + h * 0.5 - 4, w - 12, 10);
    if (seed % 2) { rect(ctx, x + 30, y + h * 0.5 - 70, 44, 66, '#e2463f', 4, 6); } else noodleCup(ctx, x + w / 2, y + h * 0.5 - 4, 0.5, 0.2, { tab: false });
    const dw = w * 0.35; poly(ctx, [x, y - 10, x - dw, y + 18, x - dw, y + h - 18, x, y + h + 10], col, 6); circ(ctx, x - dw * 0.7, y + h * 0.75, 7, '#c9a24a', 4);
    return;
  }
  box(ctx, x, y, w, h, col, shadeCol(col, -0.14), { side: 'r', sw: 0.16, r: 6 });
  rect(ctx, x + 18, y + 18, w - 36, h - 36, null, 4, 6); circ(ctx, x + w - 34, y + h - 40, 9, '#8a6a2a', 4);
}
function aptFgStat(ctx, o) {
  const t = o.t || 0;
  // coffee table + pizza box + laptop + can
  box(ctx, 110, 1590, 820, 46, '#9a6440', '#7b4a2f', { side: 'b', sw: 14, r: 8 });
  rect(ctx, 150, 1636, 34, 250, '#7b4a2f', 6); rect(ctx, 856, 1636, 34, 250, '#7b4a2f', 6);
  // pizza box (lid up behind)
  poly(ctx, [170, 1600, 470, 1600, 450, 1440, 190, 1440], '#e8d2a6', 6); ctx.fillStyle = '#d4b98a'; ctx.fillRect(195, 1452, 250, 18);
  txt(ctx, 'PIZZA', 320, 1510, { font: 'Anton', weight: 400, size: 40, col: '#d6453d' }); circ(ctx, 320, 1555, 16, null, 4);
  poly(ctx, [150, 1600, 490, 1600, 470, 1576, 170, 1576], '#e8d2a6', 5);
  P(ctx, (c) => { c.moveTo(220, 1592); c.lineTo(330, 1580); c.lineTo(290, 1600); c.closePath(); }, '#f2b33d', 4); circ(ctx, 280, 1590, 6, '#d6453d', 0);
  // laptop
  poly(ctx, [600, 1600, 860, 1600, 840, 1430, 620, 1430], '#3a3350', 6); poly(ctx, [632, 1590, 828, 1590, 812, 1444, 646, 1444], '#6fd0ff', 4);
  glow(ctx, 730, 1510, 200, '#8fe0ff', 0.25); ctx.fillStyle = 'rgba(255,255,255,0.6)'; for (let i = 0; i < 4; i++) ctx.fillRect(668, 1470 + i * 26, 90 + (i % 2) * 40, 10);
  poly(ctx, [580, 1608, 880, 1608, 868, 1590, 592, 1590], '#57506e', 5);
  // soda can + remote
  rect(ctx, 510, 1520, 44, 74, '#d6453d', 5, 8); rect(ctx, 510, 1540, 44, 16, '#fbf3e3', 0); rect(ctx, 510, 1520, 44, 74, null, 5, 8);
  P(ctx, (c) => c.roundRect(560, 1586, 70, 16, 6), '#2a2440', 4);
}
/* ---------------- microwave_cu ---------------- */
function microCU(ctx, o) {
  const t = o.t || 0, sp = clamp(o.sparks || 0);
  fill(ctx, '#efe4cc'); ctx.fillStyle = '#d8c9a8'; for (let y = -M; y < H + M; y += 120) ctx.fillRect(-M, y, W + 2 * M, 8); for (let y = -M, r = 0; y < H + M; y += 120, r++) for (let x = -M + (r % 2) * 80; x < W + M; x += 160) ctx.fillRect(x, y, 8, 120);
  // counter
  box(ctx, -M, 1560, W + 2 * M, 80, '#c88a52', '#a8693f', { side: 'b', sw: 24 }); ctx.fillStyle = '#2f5d73'; ctx.fillRect(-M, 1640, W + 2 * M, H); line(ctx, -M, 1640, W + M, 1640, 6);
  // body
  box(ctx, 20, 300, 1040, 1260, '#d7dde3', '#b4bdc6', { side: 'b', sw: 60, r: 50, lw: 8 });
  rect(ctx, 50, 330, 760, 1170, '#c8cfd6', 7, 34);
  // window
  const wx = 100, wy = 400, ww = 660, wh = 1020;
  clipTo(ctx, (c) => c.roundRect(wx, wy, ww, wh, 26), () => {
    ctx.fillStyle = sp > 0 ? '#f7d886' : '#f3d58a'; ctx.fillRect(wx, wy, ww, wh); ctx.fillStyle = '#e4bf6c'; ctx.fillRect(wx, wy, ww, 120); ctx.fillRect(wx + ww - 90, wy, 90, wh);
    glow(ctx, wx + ww / 2, wy + wh * 0.3, 500, '#fff3c4', 0.6);
    // turntable + cup
    const ty = wy + wh * 0.78; ell(ctx, wx + ww / 2, ty + 30, 290, 64, '#d6b467', 0); ell(ctx, wx + ww / 2, ty, 280, 58, 'rgba(255,255,255,0.45)', 6);
    const rot = t * 1.4; const cx = wx + ww / 2 + Math.cos(rot) * 50, cz = Math.sin(rot);
    noodleCup(ctx, cx, ty + 10 + cz * 12, 2.6, rot / (Math.PI * 2), { tab: true, lid: '#cfd6de' });
    if (sp > 0) { // sparks: jagged bolts from the foil lid
      const R = rng(Math.floor(t * 30) + 3); const lx = cx, ly = ty + 10 + cz * 12 - 92 * 2.6;
      glow(ctx, lx, ly, 420 * sp, '#9fe3ff', 0.7 * sp);
      for (let i = 0; i < Math.round(3 + 6 * sp); i++) { const a = -Math.PI * R(), len = (120 + R() * 260) * (0.5 + sp); let x = lx + (R() - 0.5) * 160, y = ly; ctx.beginPath(); ctx.moveTo(x, y);
        for (let k = 0; k < 6; k++) { x += Math.cos(a) * len / 6 + (R() - 0.5) * 40; y += Math.sin(a) * len / 6 + (R() - 0.5) * 40; ctx.lineTo(x, y); }
        ctx.strokeStyle = '#9fe3ff'; ctx.lineWidth = 16; ctx.lineJoin = 'round'; ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; ctx.stroke(); }
      for (let i = 0; i < 16 * sp; i++) { const a = R() * 7, d = 40 + R() * 200; circ(ctx, lx + Math.cos(a) * d, ly + Math.sin(a) * d * 0.6, 4 + R() * 6, '#fff7c4', 0); }
    }
    halftone(ctx, wx, wy, ww, wh, 'rgba(28,21,48,0.22)', 16, 4, 'none'); // door mesh
    ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(wx + 60, wy + wh); ctx.lineTo(wx + 300, wy); ctx.lineTo(wx + 380, wy); ctx.lineTo(wx + 140, wy + wh); ctx.fill(); ctx.beginPath(); ctx.moveTo(wx + 200, wy + wh); ctx.lineTo(wx + 440, wy); ctx.lineTo(wx + 470, wy); ctx.lineTo(wx + 230, wy + wh); ctx.fill(); ctx.restore();
  });
  rect(ctx, wx, wy, ww, wh, null, 8, 26);
  // panel
  rect(ctx, 840, 380, 190, 120, '#1c2a24', 6, 12); txt(ctx, '0:' + String(Math.max(0, 45 - Math.floor(t))).padStart(2, '0'), 935, 442, { font: 'Inter', weight: 800, size: 56, col: '#6cff9a' }); glow(ctx, 935, 440, 120, '#6cff9a', 0.15);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { box(ctx, 852 + c * 60, 560 + r * 84, 48, 60, '#eef2f5', '#cfd6de', { side: 'b', sw: 10, r: 10, lw: 5 }); txt(ctx, String(r * 3 + c + 1).replace('10', '0').replace('11', '+').replace('12', '−'), 876 + c * 60, 588 + r * 84, { size: 24, weight: 700 }); }
  box(ctx, 852, 920, 168, 90, '#3aa060', '#2c7f4a', { side: 'b', sw: 16, r: 14 }); txt(ctx, 'START', 936, 962, { font: 'Anton', weight: 400, size: 40, col: '#fff' });
  box(ctx, 852, 1030, 168, 70, '#e2463f', '#b8332e', { side: 'b', sw: 14, r: 14 }); txt(ctx, 'STOP', 936, 1064, { font: 'Anton', weight: 400, size: 32, col: '#fff' });
  rect(ctx, 870, 1200, 130, 26, '#a6b0bb', 5, 10);
}

/* ---------------- stove_cu ---------------- */
function stoveCU(ctx, o) {
  const t = o.t || 0, water = o.water !== false, hot = clamp(o.hot || 0), egg = o.egg !== false;
  fill(ctx, '#efe4cc'); ctx.fillStyle = '#d8c9a8'; for (let y = -M; y < 1180; y += 110) ctx.fillRect(-M, y, W + 2 * M, 8); for (let y = -M, r = 0; y < 1180; y += 110, r++) for (let x = -M + (r % 2) * 75; x < W + M; x += 150) ctx.fillRect(x, y, 8, 110);
  halftone(ctx, -M, 400, W + 2 * M, 780, 'rgba(160,130,90,0.4)', 22, 5, 'down');
  if (o.mess) { scorch(ctx, 540, 380, 300 * o.mess, 4, 0.9); eggSplat(ctx, 200, 260, 70, 3, 0.4); eggSplat(ctx, 880, 520, 56, 6, 2); }
  // cooktop
  P(ctx, (c) => { c.moveTo(-M, 1180); c.lineTo(W + M, 1180); c.lineTo(W + M, H + M); c.lineTo(-M, H + M); c.closePath(); }, '#2a2a33', 0); line(ctx, -M, 1180, W + M, 1180, 8);
  ctx.save(); ctx.globalAlpha = 0.12; line(ctx, -100, 1600, 400, 1250, 30, '#fff'); ctx.restore();
  // burner glow + coil
  const bc = hot > 0 ? '#ff5a1f' : '#ff7a2a'; glow(ctx, 540, 1440, 520, bc, 0.45 + 0.35 * hot);
  for (let i = 0; i < 4; i++) ell(ctx, 540, 1440, 160 + i * 70, 38 + i * 16, null, 12, lerp(0.7, 1, hot) > 0.8 ? '#ff6a2a' : '#d6452a');
  // pot
  const px = 540, top = 700, bot = 1380, rx = 380;
  const potCol = water ? '#b8c3cc' : '#7a7480';
  P(ctx, (c) => { c.moveTo(px - rx, top); c.lineTo(px - rx + 20, bot - 40); c.quadraticCurveTo(px, bot + 40, px + rx - 20, bot - 40); c.lineTo(px + rx, top); c.closePath(); }, potCol, 0);
  clipTo(ctx, (c) => { c.moveTo(px - rx, top); c.lineTo(px - rx + 20, bot - 40); c.quadraticCurveTo(px, bot + 40, px + rx - 20, bot - 40); c.lineTo(px + rx, top); c.closePath(); }, () => {
    ctx.fillStyle = water ? '#8f9aa5' : '#5d5664'; ctx.fillRect(px + rx * 0.45, top, rx, bot);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(px - rx * 0.7, top, 36, bot - top); ctx.fillRect(px - rx * 0.55, top, 12, bot - top);
    if (hot > 0) { const g = ctx.createLinearGradient(0, bot, 0, top); g.addColorStop(0, `rgba(255,70,20,${0.95 * hot})`); g.addColorStop(0.45, `rgba(255,140,40,${0.6 * hot})`); g.addColorStop(1, 'rgba(255,140,40,0)'); ctx.fillStyle = g; ctx.fillRect(px - rx, top, rx * 2, bot - top + 60); }
  });
  P(ctx, (c) => { c.moveTo(px - rx, top); c.lineTo(px - rx + 20, bot - 40); c.quadraticCurveTo(px, bot + 40, px + rx - 20, bot - 40); c.lineTo(px + rx, top); }, null, 9);
  // handles
  rect(ctx, px - rx - 150, top + 70, 160, 46, '#3a3350', 8, 20); rect(ctx, px + rx - 10, top + 70, 160, 46, '#3a3350', 8, 20);
  // rim + interior
  ell(ctx, px, top, rx + 14, 96, water ? '#d3dbe2' : '#8a8490', 9);
  P(ctx, (c) => c.ellipse(px, top + 8, rx - 18, 76, 0, 0, 7), water ? '#55b6e8' : (hot > 0.3 ? '#3a2a2a' : '#4a4450'), 6);
  clipTo(ctx, (c) => c.ellipse(px, top + 8, rx - 18, 76, 0, 0, 7), () => {
    if (water) { ctx.fillStyle = '#7fcdf2'; ctx.beginPath(); ctx.ellipse(px - 60, top - 10, rx * 0.7, 40, 0, 0, 7); ctx.fill(); const R = rng(Math.floor(t * 15)); for (let i = 0; i < 18 * (o.boil ?? 1); i++) circ(ctx, px + (R() - 0.5) * 2 * (rx - 60), top + 8 + (R() - 0.5) * 100, 6 + R() * 14, 'rgba(255,255,255,0.85)', 3); }
    else { const g = ctx.createRadialGradient(px, top + 20, 10, px, top + 20, rx); g.addColorStop(0, `rgba(255,90,30,${0.9 * hot})`); g.addColorStop(1, 'rgba(255,90,30,0)'); ctx.fillStyle = g; ctx.fillRect(px - rx, top - 100, rx * 2, 200); speckle(ctx, px - rx, top - 60, rx * 2, 140, 'rgba(20,10,10,0.6)', 60, 3, 6); }
  });
  if (water && egg) { const bob = Math.sin(t * 9) * 8 * (o.rattle || 0.3), wob = Math.sin(t * 23) * 0.18 * (o.rattle || 0.2);
    ctx.save(); ctx.translate(px + 30 + bob, top + 4); ctx.rotate(wob); P(ctx, (c) => c.ellipse(0, 0, 70, 52, 0, Math.PI, 0), '#fbf3e1', 6); ctx.fillStyle = '#e9dcc0'; ctx.beginPath(); ctx.ellipse(24, -14, 30, 22, 0, 0, 7); ctx.fill(); P(ctx, (c) => c.ellipse(0, 0, 70, 52, 0, Math.PI, 0), null, 6);
    if ((o.rattle || 0) > 0.6) { line(ctx, -20, -40, 0, -24, 4); line(ctx, 0, -24, -10, -10, 4); } ctx.restore(); }
  // knobs row at front
  for (let i = 0; i < 4; i++) { circ(ctx, 170 + i * 250, 1800, 50, '#d7dde3', 7); line(ctx, 170 + i * 250, 1800, 170 + i * 250 + (i === 1 ? 40 : 0), 1800 - (i === 1 ? 20 : 44), 8); }
  txt(ctx, 'HI', 450, 1730, { font: 'Anton', weight: 400, size: 30, col: '#ff6a2a' });
}
