// Ep3 props (flat style: #1c1530 ink, one hard shadow tone). Risotto pot, rice grains + spray, drill-with-taped-spoon,
// grape juice jug, pour stream, delivery bag + takeout tub, fancy plate, tweezers, stirring arm (with a limp "quit" drop).
import { W, H, INK, rng, clamp, lerp, rect, circ, ell, poly, line, P, clipTo, halftone, txt, glow, shadeCol, hash, castShadow } from './bgkit.js';
const TAU = Math.PI * 2;
const mix = (a, b, k) => { const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(k))).toString(16).padStart(2, '0')).join(''); };
export const RICE = '#f4ead0', PURP = '#8e3fa0';
export const riceCol = (pu) => mix(RICE, PURP, pu);

// single grain (outlined)
export function grain(ctx, x, y, rot = 0, s = 1, col = '#fffaf0', lw = 2.6) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); P(ctx, (c) => c.ellipse(0, 0, 9 * s, 4.2 * s, 0, 0, TAU), col, lw * s); ctx.restore(); }

// rice surface inside an ellipse (cx,cy,rx,ry): fill + grains + bubbles
function riceSurface(ctx, cx, cy, rx, ry, { pu = 0, boil = 0, t = 0, seed = 3, n = 60 } = {}) {
  const base = riceCol(pu), hi = mix('#fffaf0', '#c27ad6', pu), sh = shadeCol(base, -0.18);
  ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.clip();
  ctx.fillStyle = base; ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
  ctx.fillStyle = sh; ctx.beginPath(); ctx.ellipse(cx, cy + ry * 0.55, rx * 1.05, ry * 0.6, 0, 0, TAU); ctx.fill();
  const R = rng(seed);
  for (let i = 0; i < n; i++) { const a = R() * TAU, d = Math.sqrt(R()), gx = cx + Math.cos(a) * rx * d, gy = cy + Math.sin(a) * ry * d + Math.sin(t * 6 + i) * 2 * boil; grain(ctx, gx, gy, R() * 3, 1.1, hi, 2.2); }
  if (boil > 0) for (let i = 0; i < 5; i++) { const ph = (t * (0.9 + hash(i) * 0.6) + hash(i * 3.7)) % 1, bx = cx + (hash(i * 1.9 + seed) - 0.5) * rx * 1.4, by = cy + (hash(i * 2.3) - 0.5) * ry * 1.2, r = 14 * Math.sin(ph * Math.PI) * boil;
    if (r > 1) { circ(ctx, bx, by, r, mix('#fff8e6', '#d9a0e6', pu), 3); } }
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(28,21,48,0.5)'; ctx.stroke(); ctx.restore();
}

// steel saucepan: (x,y) = bottom centre; s=1 → 300 px wide (same footprint as Ep2's bowl). fill 0..1, pu 0..1 purple.
// spoon: angle (rad) of a wooden spoon standing in the rice, or null. back(ctx) optional: drawn inside (behind the front wall).
export function pot(ctx, x, y, s = 1, { fill = 0.7, pu = 0, boil = 0, t = 0, seed = 3, spoon = null, handle = -1, inside = null } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const rw = 150, top = -175, ry = 48;
  castShadow(ctx, (c) => c.ellipse(0, 6, 160, 20, 0, 0, TAU), 0, 0, 'rgba(14,8,30,0.3)');
  // handle
  ctx.save(); ctx.scale(handle, 1); P(ctx, (c) => { c.moveTo(130, top + 40); c.lineTo(330, top + 10); c.quadraticCurveTo(352, top + 22, 336, top + 44); c.lineTo(134, top + 74); c.closePath(); }, '#2b2735', 7);
  ctx.fillStyle = '#4a4560'; ctx.beginPath(); ctx.ellipse(300, top + 26, 12, 7, -0.15, 0, TAU); ctx.fill(); ctx.restore();
  // back rim (inner wall)
  ell(ctx, 0, top, rw, ry, '#7d879b', 7);
  const lv = clamp(fill), sy = lerp(top + 70, top + 8, lv), srx = rw * 0.95, sry = ry * 0.86;
  if (lv > 0) riceSurface(ctx, 0, sy, srx, sry, { pu, boil, t, seed });
  if (inside) inside(ctx, sy);
  if (spoon !== null) { ctx.save(); ctx.translate(10, sy); ctx.rotate(spoon); P(ctx, (c) => c.roundRect(-9, -330, 18, 330, 9), '#c88a52', 6); ctx.restore(); }
  // front wall
  P(ctx, (c) => { c.moveTo(-rw, top); c.lineTo(-rw, -22); c.quadraticCurveTo(-rw, 0, -rw + 26, 0); c.lineTo(rw - 26, 0); c.quadraticCurveTo(rw, 0, rw, -22); c.lineTo(rw, top); c.ellipse(0, top, rw, ry, 0, 0, Math.PI); c.closePath(); }, '#b4bdcc', 7);
  ctx.save(); ctx.beginPath(); ctx.moveTo(-rw, top); ctx.lineTo(-rw, -22); ctx.quadraticCurveTo(-rw, 0, -rw + 26, 0); ctx.lineTo(rw - 26, 0); ctx.quadraticCurveTo(rw, 0, rw, -22); ctx.lineTo(rw, top); ctx.ellipse(0, top, rw, ry, 0, 0, Math.PI); ctx.clip();
  ctx.fillStyle = '#8f99ad'; ctx.fillRect(60, top - 60, 120, 260); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(-110, top + 30, 18, 120); ctx.fillRect(-82, top + 40, 8, 100); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, top, rw, ry, 0, 0, Math.PI); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
  ctx.restore();
}

// flying rice: radial spray from (cx,cy), p = 0..1 progress, gravity pulls down
export function riceSpray(ctx, cx, cy, p, { n = 40, spread = 900, up = 1, seed = 1, col = '#fffaf0', size = 1.6, grav = 900 } = {}) {
  if (p <= 0) return;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (0.05 + 0.9 * hash(i + seed)) * up + (up < 0 ? Math.PI : 0), v = 0.4 + hash(i * 3.1 + seed) * 0.8, pp = clamp(p * (0.7 + hash(i * 1.7) * 0.6));
    const x = cx + Math.cos(a) * spread * v * pp, y = cy + Math.sin(a) * spread * v * pp + grav * pp * pp;
    grain(ctx, x, y, hash(i * 5.5) * 6 + p * 20 * (hash(i) - 0.5), size * (0.8 + hash(i * 7.3) * 0.5), col, 2.4);
  }
}
// grains stuck flat on the "lens"/walls: n deterministic grains in box
export function riceStuck(ctx, x, y, w, h, n, k = 1, { seed = 9, col = '#fffaf0', size = 2.2 } = {}) {
  const R = rng(seed); for (let i = 0; i < n; i++) { const gx = x + R() * w, gy = y + R() * h, r = R() * 3, s = size * (0.7 + R() * 0.6), at = R(); if (at > k) continue; grain(ctx, gx, gy, r, s, col, 2.6); }
}

// power drill with a wooden spoon duct-taped into the chuck. (x,y) = grip centre. spin: angle; rev 0..1 (blur)
export function drill(ctx, x, y, s = 1, rot = 0, { spin = 0, rev = 0, t = 0, tape = 1, flip = 1, spoonCol = '#c88a52', rice = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * flip, s);
  // spoon (behind chuck)
  if (tape > 0) {
    P(ctx, (c) => c.roundRect(120, -48, 260, 22, 11), spoonCol, 6);
    const sq = rev > 0.2 ? 1 : Math.abs(Math.cos(spin));
    if (rev > 0.2) { ctx.save(); ctx.globalAlpha = 0.45 * rev; P(ctx, (c) => c.ellipse(405, -37, 46, 46, 0, 0, TAU), shadeCol(spoonCol, 0.2), 0); ctx.restore(); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(405, -37, 62 + i * 10, 62 + i * 10, 0, spin + i * 2, spin + i * 2 + 1.2); ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.stroke(); } }
    P(ctx, (c) => c.ellipse(405, -37, 44, Math.max(8, 32 * sq), 0, 0, TAU), spoonCol, 6);
    if (rice > 0) for (let i = 0; i < 5; i++) grain(ctx, 395 + (hash(i) - 0.5) * 50, -37 + (hash(i * 3) - 0.5) * 30 * sq, hash(i * 7) * 3, 1.2);
  }
  // body
  P(ctx, (c) => c.roundRect(-150, -90, 250, 104, 40), '#ffc21a', 7);
  ctx.save(); ctx.beginPath(); ctx.roundRect(-150, -90, 250, 104, 40); ctx.clip(); ctx.fillStyle = '#e0a20e'; ctx.fillRect(-150, -20, 260, 40); ctx.restore();
  P(ctx, (c) => c.roundRect(-150, -90, 250, 104, 40), null, 7);
  P(ctx, (c) => c.roundRect(-130, -70, 70, 50, 14), '#2b2735', 5); for (let i = 0; i < 3; i++) line(ctx, -120 + i * 18, -60, -120 + i * 18, -30, 4, '#4a4560');
  // grip + trigger + battery
  P(ctx, (c) => { c.moveTo(-70, 10); c.lineTo(-10, 10); c.lineTo(10, 160); c.lineTo(-55, 160); c.closePath(); }, '#2b2735', 7);
  P(ctx, (c) => c.roundRect(-2, 16, 26, 44, 10), '#e2463f', 5);
  P(ctx, (c) => c.roundRect(-95, 150, 130, 62, 14), '#2b2735', 7); ctx.fillStyle = '#ffc21a'; ctx.fillRect(-80, 168, 100, 10);
  // chuck
  P(ctx, (c) => { c.moveTo(100, -72); c.lineTo(150, -60); c.lineTo(150, -16); c.lineTo(100, -4); c.closePath(); }, '#4a4560', 7);
  for (let i = 0; i < 4; i++) { const xx = 110 + i * 10 + ((spin * 30) % 10); if (xx < 148) line(ctx, xx, -66, xx, -10, 3, '#2b2735'); }
  // duct tape wraps around chuck + spoon
  if (tape > 0) { ctx.save(); ctx.globalAlpha = clamp(tape * 2);
    for (let k = 0; k < 3; k++) { const tx = 136 + k * 30; P(ctx, (c) => c.roundRect(tx, -70 + k * 4, 26, 66 - k * 8, 6), k % 2 ? '#b9bec7' : '#a7adb8', 5); }
    P(ctx, (c) => { c.moveTo(200, -14); c.quadraticCurveTo(214 + Math.sin(t * 9) * 8, 20, 196, 50); c.lineTo(178, 46); c.quadraticCurveTo(196, 18, 180, -12); c.closePath(); }, '#a7adb8', 5);
    ctx.restore(); }
  ctx.restore();
}

// grape juice jug: (x,y) = bottom centre
export function grapeJuice(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  P(ctx, (c) => { c.moveTo(-90, 0); c.lineTo(-90, -230); c.quadraticCurveTo(-90, -280, -40, -300); c.lineTo(-30, -340); c.lineTo(30, -340); c.lineTo(40, -300); c.quadraticCurveTo(90, -280, 90, -230); c.lineTo(90, 0); c.closePath(); }, '#6d2a86', 7);
  ctx.save(); ctx.beginPath(); ctx.rect(30, -300, 80, 300); ctx.clip(); P(ctx, (c) => { c.moveTo(-90, 0); c.lineTo(-90, -230); c.quadraticCurveTo(-90, -280, -40, -300); c.lineTo(40, -300); c.quadraticCurveTo(90, -280, 90, -230); c.lineTo(90, 0); c.closePath(); }, '#55206a', 0); ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-70, -230, 14, 180);
  P(ctx, (c) => c.roundRect(-36, -372, 72, 40, 10), '#7ee081', 6);
  P(ctx, (c) => c.roundRect(-80, -200, 160, 140, 16), '#fbf7ee', 6);
  txt(ctx, 'GRAPE', 0, -166, { font: 'Anton', weight: 400, size: 40, col: '#6d2a86' }); txt(ctx, 'JUICE', 0, -126, { font: 'Anton', weight: 400, size: 40, col: '#6d2a86' });
  [[-24, -84], [0, -84], [24, -84], [-12, -70], [12, -70], [0, -58]].forEach(([gx, gy]) => circ(ctx, gx, gy, 10, '#9b4fc2', 3));
  ctx.restore();
}
// liquid stream from (x0,y0) to (x1,y1)
export function stream(ctx, x0, y0, x1, y1, t, w = 26, col = '#7a2d96') {
  const mx = (x0 + x1) / 2 + Math.sin(t * 9) * 6, my = (y0 + y1) / 2;
  P(ctx, (c) => { c.moveTo(x0 - w / 2, y0); c.quadraticCurveTo(mx - w * 0.35, my, x1 - w * 0.3, y1); c.lineTo(x1 + w * 0.3, y1); c.quadraticCurveTo(mx + w * 0.35, my, x0 + w / 2, y0); c.closePath(); }, col, 5);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x0 - 3, y0 + 10, 5, (y1 - y0) * 0.5);
}

// brown paper delivery bag with an invented trattoria stamp; (x,y) bottom centre
export function deliveryBag(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  P(ctx, (c) => { c.moveTo(-150, 0); c.lineTo(-140, -330); c.lineTo(140, -330); c.lineTo(150, 0); c.closePath(); }, '#c9925a', 7);
  ctx.save(); ctx.beginPath(); ctx.rect(70, -340, 100, 340); ctx.clip(); P(ctx, (c) => { c.moveTo(-150, 0); c.lineTo(-140, -330); c.lineTo(140, -330); c.lineTo(150, 0); c.closePath(); }, '#a8743f', 0); ctx.restore();
  for (let i = 0; i < 7; i++) line(ctx, -140 + i * 46, -330, -150 + i * 48, -300, 4, '#8e5e30');
  P(ctx, (c) => c.ellipse(0, -190, 92, 70, 0, 0, TAU), '#fbf7ee', 6);
  txt(ctx, "NONNA", 0, -212, { font: 'Anton', weight: 400, size: 40, col: '#c0392b' }); txt(ctx, "LUCIA'S", 0, -170, { font: 'Anton', weight: 400, size: 34, col: '#2a7a3a' });
  txt(ctx, '♥', 0, -138, { size: 26, weight: 800, col: '#c0392b' });
  // stapled receipt
  ctx.save(); ctx.translate(70, -340); ctx.rotate(0.12); P(ctx, (c) => c.rect(0, -10, 90, 150), '#fff', 4);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = '#b9b9c2'; ctx.fillRect(12, 12 + i * 20, 50 + (i % 3) * 10, 6); } txt(ctx, '1x RISOTTO', 45, 140 - 16, { size: 14, weight: 800, col: INK }); line(ctx, 30, 2, 60, 2, 4, '#8a8a96'); ctx.restore();
  ctx.restore();
}
// black takeout tub with risotto; (x,y) bottom centre; tilt opens
export function takeoutTub(ctx, x, y, s = 1, rot = 0, { pu = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  P(ctx, (c) => { c.moveTo(-130, -110); c.lineTo(-110, 0); c.lineTo(110, 0); c.lineTo(130, -110); c.closePath(); }, '#2b2735', 7);
  ell(ctx, 0, -110, 130, 30, '#4a4560', 6); riceSurface(ctx, 0, -106, 118, 24, { pu, seed: 5, n: 26 });
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-96, -96, 10, 80);
  ctx.restore();
}
// fancy wide plate seen at 3/4: (x,y) centre; risotto 0..1 (mound scale), leaf 0..1 (placed), drops of sauce
export function fancyPlate(ctx, x, y, s = 1, { risotto = 1, leaf = 0, sauce = 1, t = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  castShadow(ctx, (c) => c.ellipse(0, 26, 330, 112, 0, 0, TAU), 0, 0, 'rgba(14,8,30,0.28)');
  ell(ctx, 0, 12, 320, 104, '#d9d6e0', 7); ell(ctx, 0, 0, 320, 104, '#ffffff', 7); ell(ctx, 0, 6, 190, 58, '#f1eff5', 4);
  ctx.save(); ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, 0, 296, 94, 0, 0, TAU); ctx.stroke(); ctx.restore();
  if (sauce > 0) for (let i = 0; i < 6; i++) { const a = Math.PI * (0.15 + i * 0.12); circ(ctx, Math.cos(a) * 150, Math.sin(a) * 46 + 6, (12 - i * 1.3) * sauce, '#5a2a1e', 2.5); }
  if (risotto > 0) { const k = risotto; ctx.save(); ctx.translate(-10, 0); ctx.scale(k, k);
    P(ctx, (c) => { c.moveTo(-82, 10); c.quadraticCurveTo(-70, -46, 0, -52); c.quadraticCurveTo(70, -46, 82, 10); c.quadraticCurveTo(0, 34, -82, 10); c.closePath(); }, RICE, 6);
    const R = rng(4); for (let i = 0; i < 22; i++) grain(ctx, -60 + R() * 120, -36 + R() * 50, R() * 3, 0.9, '#fffaf0', 2);
    ctx.fillStyle = 'rgba(28,21,48,0.12)'; ctx.beginPath(); ctx.ellipse(10, 6, 70, 16, 0, 0, TAU); ctx.fill();
    ctx.restore(); }
  if (leaf > 0) { const ly = lerp(-260, -52, clamp(leaf)); ctx.save(); ctx.translate(-6, ly); ctx.rotate(-0.4 + 0.1 * Math.sin(t * 4) * (1 - clamp(leaf)));
    P(ctx, (c) => { c.moveTo(-20, 0); c.quadraticCurveTo(0, -18, 20, 0); c.quadraticCurveTo(0, 14, -20, 0); c.closePath(); }, '#3aa060', 3.5); line(ctx, -16, 0, 18, 0, 2, '#1f6a3a'); ctx.restore(); }
  ctx.restore();
}
// tweezers: (x,y) = tip; points down-left from the upper right
export function tweezers(ctx, x, y, s = 1, rot = -0.6, open = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const o = 10 + open * 14;
  P(ctx, (c) => { c.moveTo(-4, 0); c.lineTo(-o, -260); c.lineTo(-o + 16, -480); c.lineTo(-o + 30, -480); c.lineTo(-o + 12, -260); c.lineTo(4, 0); c.closePath(); }, '#c8d0dd', 4);
  P(ctx, (c) => { c.moveTo(4, 0); c.lineTo(o, -260); c.lineTo(o - 16, -480); c.lineTo(o - 30, -480); c.lineTo(o - 12, -260); c.lineTo(8, 0); c.closePath(); }, '#a3adbf', 4);
  ctx.restore();
}
// pinching hand (simple flat hand + cuff), at (x,y), coming from direction ang
export function hand(ctx, x, y, s = 1, rot = 0, sleeve = '#f2b52b') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 400); ctx.lineWidth = 136; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 120; ctx.strokeStyle = sleeve; ctx.stroke();
  P(ctx, (c) => c.roundRect(-58, -20, 116, 50, 16), '#f6f1e6', 6);
  P(ctx, (c) => c.ellipse(0, -60, 56, 62, 0, 0, TAU), '#c98a5e', 7); P(ctx, (c) => c.arc(-14, -84, 20, 3.4, 5.6), null, 5, '#a56a44');
  ctx.restore();
}

// Sam's arm from the top-right with a wooden spoon at angle `ang` around (cx,cy). drop 0..1: the arm gives up (sags out of frame)
export function armStir(ctx, cx, cy, ang, { from = [1250, 300], r = 60, drop = 0, leaveSpoon = false } = {}) {
  const d = clamp(drop), hx0 = cx + Math.cos(ang) * r, hy0 = cy - 40 + Math.sin(ang) * r * 0.3;
  const hx = lerp(hx0, 1180, d * d), hy = lerp(hy0, 1500, d), f0 = [from[0], lerp(from[1], 700, d)];
  const ex = lerp(f0[0], hx, 0.55) + 60 + d * 80, ey = lerp(f0[1], hy, 0.5) - 40 + d * 260;
  if (!leaveSpoon) { ctx.save(); ctx.translate(hx, hy); ctx.rotate(Math.atan2(cy + 60 - hy, cx - 10 - hx) - Math.PI / 2 + 0.2 + d * 1.2);
    P(ctx, (c) => c.roundRect(-9, 0, 18, 210, 9), '#c88a52', 6); P(ctx, (c) => c.ellipse(0, 230, 30, 44, 0, 0, TAU), '#c88a52', 6); ctx.restore(); }
  const limb = (x0, y0, x1, y1, w, col) => { ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineWidth = w + 16; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); };
  limb(f0[0], f0[1], ex, ey, 120, '#f2b52b'); limb(ex, ey, hx + 30, hy - 30, 100, '#f2b52b');
  P(ctx, (c) => c.roundRect(hx - 10, hy - 70, 90, 60, 20), '#f6f1e6', 7);
  P(ctx, (c) => c.ellipse(hx, hy, 52, 44, 0.4 + d, 0, TAU), '#c98a5e', 7); P(ctx, (c) => c.arc(hx - 20, hy + 10, 22, 0.5, 3), null, 5, '#a56a44');
}
// kitchen stopwatch-style timer bubble
export function timerBadge(ctx, x, y, text, p = 1, col = '#fff', tcol = INK) {
  if (p <= 0) return; const k = 0.5 + 0.5 * clamp(p); ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  circ(ctx, 0, 0, 110, col, 9); circ(ctx, 0, 0, 86, null, 4); rect(ctx, -20, -146, 40, 30, '#e2463f', 6, 6); line(ctx, 0, -116, 0, -110, 6);
  txt(ctx, text, 0, 8, { font: 'Anton', weight: 400, size: 64, col: tcol }); ctx.restore();
}
// bag of arborio rice; (x,y) bottom centre
export function riceBag(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  P(ctx, (c) => { c.moveTo(-110, 0); c.quadraticCurveTo(-124, -150, -100, -300); c.lineTo(-80, -330); c.lineTo(80, -330); c.lineTo(100, -300); c.quadraticCurveTo(124, -150, 110, 0); c.closePath(); }, '#fbf7ee', 7);
  ctx.save(); ctx.beginPath(); ctx.rect(50, -340, 80, 340); ctx.clip(); P(ctx, (c) => { c.moveTo(-110, 0); c.quadraticCurveTo(-124, -150, -100, -300); c.lineTo(100, -300); c.quadraticCurveTo(124, -150, 110, 0); c.closePath(); }, '#e2dccb', 0); ctx.restore();
  P(ctx, (c) => c.rect(-104, -300, 208, 40), '#2a7a3a', 5); P(ctx, (c) => c.rect(-108, -60, 216, 34), '#c0392b', 5);
  txt(ctx, 'ARBORIO', 0, -210, { font: 'Anton', weight: 400, size: 50, col: '#2a7a3a' }); txt(ctx, 'RICE', 0, -158, { font: 'Anton', weight: 400, size: 50, col: '#c0392b' });
  const R = rng(2); for (let i = 0; i < 9; i++) grain(ctx, -50 + R() * 100, -120 + R() * 40, R() * 3, 1);
  P(ctx, (c) => { c.moveTo(-80, -330); c.lineTo(-60, -356); c.lineTo(60, -356); c.lineTo(80, -330); c.closePath(); }, '#e2dccb', 5);
  ctx.restore();
}
