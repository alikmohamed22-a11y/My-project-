// Ep7 props (flat style: #1c1530 ink, one hard shadow tone). All brand / user / app names are invented.
// garlic (clove + whole bulb), skillet with chicken (raw → golden → charcoal), digital probe thermometer, the two-setting stove knob,
// pot interiors (garlic mound, cream sauce that splits, thin "Alfredo soup"), soup bowl, the owner (from behind, in his chair), his hand.
import { W, H, INK, clamp, lerp, rect, circ, ell, poly, line, P, clipTo, halftone, txt, glow, hash, castShadow } from './bgkit.js';
import { eBack, eOut } from './util.js';
const TAU = Math.PI * 2;
const mix = (a, b, k) => { const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(k))).toString(16).padStart(2, '0')).join(''); };
const ramp = (stops, k) => { k = clamp(k) * (stops.length - 1); const i = Math.min(stops.length - 2, Math.floor(k)); return mix(stops[i], stops[i + 1], k - i); };

/* ---------------- garlic ---------------- */
const GW = '#f7f0e2', GS = '#dccfb5', GP = '#b98bb0';
// a single clove (crescent). (x,y) centre
export function garlicClove(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  castShadow(ctx, (c) => c.ellipse(10, 46, 46, 12, 0, 0, TAU));
  const sh = (c) => { c.moveTo(-6, -64); c.bezierCurveTo(30, -40, 52, 0, 34, 40); c.quadraticCurveTo(0, 54, -30, 40); c.bezierCurveTo(-40, 6, -30, -36, -6, -64); c.closePath(); };
  P(ctx, sh, GW, 6);
  clipTo(ctx, sh, () => { ctx.fillStyle = GS; ctx.beginPath(); ctx.ellipse(34, 10, 26, 60, 0.2, 0, TAU); ctx.fill(); ctx.strokeStyle = GP; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-8, -50); ctx.quadraticCurveTo(10, 0, 4, 44); ctx.stroke(); });
  P(ctx, sh, null, 6);
  ctx.restore();
}
// a whole bulb: (x,y) centre, s=1 → ~130 px wide
export function garlicBulb(ctx, x, y, s = 1, rot = 0, seed = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const body = (c) => { c.moveTo(0, -78); c.bezierCurveTo(14, -50, 70, -40, 70, 8); c.bezierCurveTo(70, 50, 36, 62, 0, 62); c.bezierCurveTo(-36, 62, -70, 50, -70, 8); c.bezierCurveTo(-70, -40, -14, -50, 0, -78); c.closePath(); };
  P(ctx, body, GW, 6);
  clipTo(ctx, body, () => {
    ctx.fillStyle = GS; ctx.beginPath(); ctx.ellipse(46, 20, 34, 70, 0.1, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(28,21,48,0.55)'; ctx.lineWidth = 4; [-36, 0, 36].forEach((dx) => { ctx.beginPath(); ctx.moveTo(dx * 0.2, -70); ctx.quadraticCurveTo(dx * 1.25, 0, dx * 0.7, 62); ctx.stroke(); });
    ctx.strokeStyle = GP; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { const dx = -52 + i * 34 + (hash(seed + i) - 0.5) * 10; ctx.beginPath(); ctx.moveTo(dx * 0.4, -40); ctx.quadraticCurveTo(dx, 10, dx * 0.8, 50); ctx.stroke(); }
  });
  P(ctx, body, null, 6);
  // stem + roots
  P(ctx, (c) => { c.moveTo(-7, -74); c.lineTo(-4, -104); c.lineTo(6, -104); c.lineTo(8, -74); c.closePath(); }, '#e6dcc4', 5);
  ctx.lineCap = 'round'; for (let i = 0; i < 5; i++) line(ctx, -14 + i * 7, 60, -20 + i * 10, 74 + (i % 2) * 6, 3, '#8a7a5a');
  ctx.restore();
}
// mound of bulbs inside a pot (D.pot inside callback): n bulbs visible, overflow 0..1 piles above the rim
export function garlicPile(ctx, sy, n, t = 0) {
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 5), col = i % 5, x = -112 + col * 56 + (row % 2) * 24 - 12, y = sy + 20 - row * 34 + (hash(i * 2.1) - 0.5) * 10;
    if (Math.abs(x) > 135 - row * 6) continue;
    garlicBulb(ctx, x, y - 20, 0.55, (hash(i * 3.7) - 0.5) * 1.2, i);
  }
}
// stink / fume lines (garlic smell): wavy green-ish lines rising
export function fumes(ctx, x, y, t, { n = 4, h = 360, spread = 360, col = 'rgba(190,230,120,0.85)', lw = 12 } = {}) {
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const ph = (t * 0.5 + i / n) % 1, sx = x - spread / 2 + (i + 0.5) * spread / n; ctx.globalAlpha = Math.sin(ph * Math.PI); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
    for (let k = 0; k <= 12; k++) { const yy = y - ph * 140 - k * h / 12, xx = sx + Math.sin(k * 0.9 + t * 4 + i) * 22; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
  ctx.restore();
}

/* ---------------- chicken in a skillet ---------------- */
const CH_RAMP = ['#f3a9a2', '#f0c27a', '#d98c3a', '#6b3a20', '#2a1c1c'];
// (x,y) = pan centre (3/4 top view). char: 0 raw, 0.4 golden, 1 charcoal
export function skillet(ctx, x, y, s = 1, { char = 0, t = 0, n = 6 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const rx = 300, ry = 120;
  castShadow(ctx, (c) => c.ellipse(16, 40, rx + 10, ry + 20, 0, 0, TAU));
  // handle (to the right)
  P(ctx, (c) => { c.moveTo(rx - 20, -26); c.lineTo(rx + 300, -60); c.quadraticCurveTo(rx + 330, -40, rx + 304, -14); c.lineTo(rx - 10, 26); c.closePath(); }, '#2b2735', 7);
  circ(ctx, rx + 270, -40, 12, '#4a4560', 0);
  // body
  P(ctx, (c) => { c.ellipse(0, 20, rx, ry, 0, 0, TAU); }, '#3a3646', 7);
  P(ctx, (c) => c.ellipse(0, 0, rx, ry, 0, 0, TAU), '#55505f', 7);
  P(ctx, (c) => c.ellipse(0, 6, rx - 34, ry - 22, 0, 0, TAU), '#2c2933', 5);
  // oil sheen
  ctx.save(); ctx.globalAlpha = 0.25; ell(ctx, -90, -20, 90, 22, '#fff', 0); ctx.restore();
  const col = ramp(CH_RAMP, char), sh = mix(col, '#1c1530', 0.25);
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + 0.3, px = Math.cos(a) * 150, py = Math.sin(a) * 46 + 4, r = 1 + (hash(i) - 0.5) * 0.2;
    ctx.save(); ctx.translate(px, py); ctx.rotate(a * 0.3 + hash(i * 2) * 0.8); ctx.scale(r, r);
    const piece = (c) => { c.moveTo(-70, 0); c.bezierCurveTo(-64, -40, 40, -44, 74, -6); c.bezierCurveTo(80, 22, 20, 36, -30, 30); c.quadraticCurveTo(-72, 26, -70, 0); c.closePath(); };
    P(ctx, piece, col, 6);
    clipTo(ctx, piece, () => { ctx.fillStyle = sh; ctx.beginPath(); ctx.ellipse(20, 30, 80, 22, 0, 0, TAU); ctx.fill();
      if (char > 0.25 && char < 0.85) { ctx.strokeStyle = mix(col, '#5a2a10', 0.5); ctx.lineWidth = 7; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-40 + k * 34, -26); ctx.lineTo(-56 + k * 34, 24); ctx.stroke(); } }
      if (char >= 0.85) { ctx.fillStyle = '#ff6a2a'; for (let k = 0; k < 4; k++) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 9 + k + i); circ(ctx, -40 + k * 30, -6 + (k % 2) * 12, 5, '#ff6a2a', 0); } ctx.globalAlpha = 1; } });
    ctx.restore();
  }
  // sizzle dots
  if (char < 0.85) for (let i = 0; i < 10; i++) { const a = hash(i * 7 + Math.floor(t * 12)) * TAU; circ(ctx, Math.cos(a) * 230, Math.sin(a) * 76, 5, 'rgba(255,240,200,0.9)', 0); }
  ctx.restore();
}
// digital probe thermometer: (x,y) = probe tip; body up-right along rot. temp text; hot 0..1 (red display); ok (green tick)
export function probeThermo(ctx, x, y, s = 1, rot = -0.6, { temp = '20', hot = 0, ok = 0, shake = 0, t = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot + shake * Math.sin(t * 60) * 0.05); ctx.scale(s, s);
  // probe needle
  P(ctx, (c) => { c.moveTo(-6, 0); c.lineTo(-8, -330); c.lineTo(8, -330); c.lineTo(6, 0); c.closePath(); }, '#c9d1d9', 5);
  ctx.save(); ctx.translate(0, -470); ctx.rotate(-rot);
  // body
  P(ctx, (c) => c.roundRect(-150, -110, 300, 240, 50), '#ff8a3c', 8);
  clipTo(ctx, (c) => c.roundRect(-150, -110, 300, 240, 50), () => { ctx.fillStyle = '#e46a1e'; ctx.fillRect(70, -120, 100, 260); });
  const lcd = hot > 0.5 ? '#ff4d4d' : ok > 0.5 ? '#7ee081' : '#cfe8c8';
  P(ctx, (c) => c.roundRect(-118, -82, 236, 132, 22), lcd, 6);
  txt(ctx, typeof temp === "number" ? `${temp}°C` : temp, 0, -14, { font: 'Anton', weight: 400, size: 86, col: hot > 0.5 ? '#fff' : INK });
  circ(ctx, -60, 92, 16, '#2b2735', 4); circ(ctx, 0, 92, 16, '#2b2735', 4); circ(ctx, 60, 92, 16, '#2b2735', 4);
  if (hot > 0.5) { const fl = 0.5 + 0.5 * Math.sin(t * 20); ctx.save(); ctx.globalAlpha = fl; glow(ctx, 0, -10, 260, '#ff4d4d', 0.5); ctx.restore(); }
  ctx.restore();
  ctx.restore();
}

/* ---------------- the two-setting stove knob ---------------- */
// big chrome knob on a stove front panel; ang 0 = OFF (pointer up), 1 = MAX (pointer right-down). labels k (0..1) for OFF / MAX labels
export function knobPanel(ctx, cx, cy, { ang = 0, offK = 1, maxK = 1, hot = 0, t = 0 } = {}) {
  // panel strip
  P(ctx, (c) => c.roundRect(-200, cy - 360, W + 400, 720, 0), '#d7dde3', 8);
  clipTo(ctx, (c) => c.rect(-200, cy - 360, W + 400, 720), () => { ctx.fillStyle = '#c3ccd5'; ctx.fillRect(-200, cy + 200, W + 400, 200); halftone(ctx, -200, cy + 120, W + 400, 260, 'rgba(90,100,120,0.25)', 18, 4, 'down');
    ctx.save(); ctx.globalAlpha = 0.5; line(ctx, -50, cy - 300, 300, cy - 360, 40, '#fff'); ctx.restore(); });
  for (const sx of [-1, 1]) { circ(ctx, cx + sx * 430, cy, 70, '#b4bdcc', 7); line(ctx, cx + sx * 430, cy - 50, cx + sx * 430, cy + 50, 10); }
  // labels: only two
  const lab = (s, a, k, col) => { if (k <= 0) return; const r = 290, x = cx + Math.sin(a) * r, y = cy - Math.cos(a) * r; ctx.save(); ctx.translate(x, y); const e = 0.4 + 0.6 * eBack(clamp(k)); ctx.scale(e, e); txt(ctx, s, 0, 0, { font: 'Anton', weight: 400, size: 96, col }); ctx.restore(); };
  const A0 = 0, A1 = 2.35;
  lab('OFF', A0, offK, '#2c2742'); lab('MAX', A1 - 0.25, maxK, '#e8412f');
  // tick dots for the two positions
  [A0, A1].forEach((a) => circ(ctx, cx + Math.sin(a) * 215, cy - Math.cos(a) * 215, 14, INK, 0));
  if (hot > 0) glow(ctx, cx, cy, 380, '#ff6a2a', 0.35 * hot);
  // knob
  castShadow(ctx, (c) => c.arc(cx + 18, cy + 22, 180, 0, TAU));
  circ(ctx, cx, cy, 180, '#eef1f4', 9); circ(ctx, cx, cy, 150, '#d0d6dd', 6);
  const a = lerp(A0, A1, ang);
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
  P(ctx, (c) => c.roundRect(-46, -170, 92, 340, 40), '#f8f9fb', 8);
  clipTo(ctx, (c) => c.roundRect(-46, -170, 92, 340, 40), () => { ctx.fillStyle = '#d6dbe2'; ctx.fillRect(10, -180, 60, 360); });
  P(ctx, (c) => { c.moveTo(0, -158); c.lineTo(-20, -110); c.lineTo(20, -110); c.closePath(); }, '#e8412f', 5);
  ctx.restore();
}

/* ---------------- pot interiors (D.pot inside callbacks) ---------------- */
const CREAM = '#f7ecd0', CREAM_S = '#e2d0a6', OIL = '#f2c84a';
// cream sauce surface; split 0..1 (cracks open: greasy yellow channel + curdled lumps); boil bubbles
export function sauceTop(ctx, sy, { split = 0, t = 0, boil = 0, thin = 0 } = {}) {
  const rx = 142, ry = 40;
  P(ctx, (c) => c.ellipse(0, sy + 18, rx, ry, 0, 0, TAU), thin ? mix(CREAM, '#e8eef2', 0.5) : CREAM, 5);
  clipTo(ctx, (c) => c.ellipse(0, sy + 18, rx, ry, 0, 0, TAU), () => {
    ctx.fillStyle = CREAM_S; ctx.beginPath(); ctx.ellipse(70, sy + 34, 110, 30, 0, 0, TAU); ctx.fill();
    if (split > 0) {
      const w = 34 * eOut(split);
      ctx.fillStyle = OIL; ctx.beginPath(); ctx.moveTo(-10 - w, sy - 30); for (let i = 0; i <= 8; i++) ctx.lineTo(-10 - w + (i % 2 ? 14 : -10), sy - 30 + i * 12); for (let i = 8; i >= 0; i--) ctx.lineTo(-10 + w + (i % 2 ? 10 : -14), sy - 30 + i * 12); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
      for (let i = 0; i < 9; i++) { const lx = -110 + hash(i * 3.3) * 220, ly = sy + 4 + hash(i * 5.1) * 32; if (Math.abs(lx + 10) < w + 14) continue; P(ctx, (c) => c.ellipse(lx, ly, 14 * split, 9 * split, hash(i) * 3, 0, TAU), '#fff8e6', 3); }
      for (let i = 0; i < 6; i++) { const lx = -120 + hash(i * 9.1) * 240, ly = sy + 6 + hash(i * 4.4) * 30; circ(ctx, lx, ly, 9 * split, OIL, 0); }
    }
    if (boil > 0) for (let i = 0; i < 7; i++) { const ph = (t * 2.2 + hash(i * 2.7)) % 1; const bx = -100 + hash(i * 1.3) * 200, by = sy + 6 + hash(i * 6.1) * 28; ctx.globalAlpha = boil * Math.sin(ph * Math.PI); P(ctx, (c) => c.arc(bx, by, 6 + ph * 12, 0, TAU), null, 4); ctx.globalAlpha = 1; }
  });
}
// thin soup surface (Alfredo soup) at level ly with floating fettuccine, a sad chicken cube and one whole garlic bulb
export function soupTop(ctx, sy, { t = 0, slosh = 0 } = {}) {
  const rx = 142, ry = 40, wob = Math.sin(t * 7) * 6 * slosh;
  P(ctx, (c) => c.ellipse(0, sy + 18 + wob, rx, ry, 0, 0, TAU), '#f1ecdc', 5);
  clipTo(ctx, (c) => c.ellipse(0, sy + 18 + wob, rx, ry, 0, 0, TAU), () => {
    ctx.fillStyle = '#ded6bf'; ctx.beginPath(); ctx.ellipse(70, sy + 34, 110, 30, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 4; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, sy + 18 + wob, 40 + i * 34 + (t * 30 % 34), 12 + i * 9, 0, 0, TAU); ctx.stroke(); }
  });
}

/* ---------------- bowls ---------------- */
// fancy soup bowl, side-ish view. (x,y) bottom centre. level 0..1 (0 = empty, licked clean), soup = true (thin) ; spoon
export function soupBowl(ctx, x, y, s = 1, { level = 1, t = 0, spoon = 0, gold = true, garlic = true } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const rx = 230, ry = 60, top = -150;
  castShadow(ctx, (c) => c.ellipse(20, 6, 250, 34, 0, 0, TAU));
  // plate under
  P(ctx, (c) => c.ellipse(0, -6, 300, 62, 0, 0, TAU), '#fbfaf6', 7); if (gold) { ctx.save(); ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, -10, 270, 50, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
  // inner back wall
  ell(ctx, 0, top, rx, ry, '#eef0f3', 7);
  if (level > 0) {
    const ly = lerp(top + 54, top + 8, level), lr = lerp(rx * 0.7, rx * 0.95, level), lry = lerp(ry * 0.6, ry * 0.86, level);
    P(ctx, (c) => c.ellipse(0, ly, lr, lry, 0, 0, TAU), '#f1ecdc', 5);
    clipTo(ctx, (c) => c.ellipse(0, ly, lr, lry, 0, 0, TAU), () => {
      ctx.fillStyle = '#ded6bf'; ctx.beginPath(); ctx.ellipse(90, ly + 20, 160, 40, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 4; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(-20, ly, 50 + i * 46 + (t * 40 % 46), 14 + i * 11, 0, 0, TAU); ctx.stroke(); }
      // fettuccine ribbons floating
      ctx.lineCap = 'round'; for (let i = 0; i < 4; i++) { const fx = -150 + i * 80, fy = ly - 10 + (i % 2) * 18 + Math.sin(t * 3 + i) * 3; ctx.strokeStyle = INK; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.bezierCurveTo(fx + 20, fy - 14, fx + 40, fy + 14, fx + 64, fy); ctx.stroke(); ctx.strokeStyle = '#f3d58a'; ctx.lineWidth = 9; ctx.stroke(); }
      // charcoal chicken cube
      P(ctx, (c) => c.roundRect(60, ly - 22 + Math.sin(t * 2.4) * 4, 50, 36, 8), '#2a1c1c', 5);
      // parsley
      for (let i = 0; i < 5; i++) circ(ctx, -120 + hash(i * 4.1) * 240, ly - 20 + hash(i * 2.9) * 30, 6, '#3aa060', 0);
    });
    if (garlic) garlicBulb(ctx, -40, ly - 14 + Math.sin(t * 2) * 5, 0.42, 0.3 + Math.sin(t * 1.7) * 0.1, 4);
  } else {
    ctx.save(); ctx.globalAlpha = 0.6; ell(ctx, 30, top + 30, 120, 24, '#fff', 0); ctx.restore();
  }
  // front wall
  const fw = (c) => { c.moveTo(-rx, top); c.bezierCurveTo(-rx, -20, -120, -6, 0, -6); c.bezierCurveTo(120, -6, rx, -20, rx, top); c.ellipse(0, top, rx, ry, 0, 0, Math.PI); c.closePath(); };
  P(ctx, fw, '#fbfaf6', 7);
  clipTo(ctx, fw, () => { ctx.fillStyle = '#dcdde3'; ctx.beginPath(); ctx.ellipse(170, -60, 120, 140, 0, 0, TAU); ctx.fill(); if (gold) { ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(0, top + 4, rx, ry, 0, 0.05, Math.PI - 0.05); ctx.stroke(); } });
  P(ctx, fw, null, 7);
  if (spoon > 0) { ctx.save(); ctx.translate(150, top - 10); ctx.rotate(0.5); P(ctx, (c) => c.roundRect(-10, -260, 20, 250, 10), '#e6b84a', 5); P(ctx, (c) => c.ellipse(0, 0, 34, 22, 0, 0, TAU), '#e6b84a', 5); ctx.restore(); }
  ctx.restore();
}
// ladle lifting thin soup: (x,y) = bowl of the ladle; pour 0..1 (stream back down)
export function ladle(ctx, x, y, s = 1, rot = 0, { pour = 0, t = 0, drop = 400 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (pour > 0) { ctx.save(); ctx.globalAlpha = 0.95; const w = 18 * pour; P(ctx, (c) => { c.moveTo(-60 - w, 10); c.quadraticCurveTo(-70 + Math.sin(t * 9) * 4, drop / 2, -70 - w * 0.5, drop); c.lineTo(-70 + w * 0.5, drop); c.quadraticCurveTo(-64, drop / 2, -60 + w, 10); c.closePath(); }, '#f1ecdc', 4); ctx.restore(); }
  ctx.rotate(rot);
  P(ctx, (c) => c.roundRect(40, -440, 26, 430, 13), '#c9d1d9', 6);
  P(ctx, (c) => { c.moveTo(-90, -10); c.quadraticCurveTo(-90, 70, 0, 70); c.quadraticCurveTo(90, 70, 90, -10); c.closePath(); }, '#c9d1d9', 6);
  P(ctx, (c) => c.ellipse(0, -10, 90, 24, 0, 0, TAU), '#f1ecdc', 6);
  ctx.restore();
}

/* ---------------- the owner (always from behind / hands only: his face is saved for Day 8) ---------------- */
const SUIT = '#1f2a4d', SUIT_S = '#151d38', HAIR = '#cfcbd6', HAIR_S = '#a8a3b4';
// high-backed velvet dining chair. (x,y) = bottom centre of the backrest
export function ownerChair(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const back = (c) => { c.moveTo(-200, 0); c.lineTo(-210, -520); c.bezierCurveTo(-210, -640, -80, -660, 0, -700); c.bezierCurveTo(80, -660, 210, -640, 210, -520); c.lineTo(200, 0); c.closePath(); };
  castShadow(ctx, (c) => back(c), 20, 20);
  P(ctx, back, '#e6b84a', 9);
  const inner = (c) => { c.moveTo(-160, -20); c.lineTo(-168, -510); c.bezierCurveTo(-168, -600, -70, -612, 0, -646); c.bezierCurveTo(70, -612, 168, -600, 168, -510); c.lineTo(160, -20); c.closePath(); };
  P(ctx, inner, '#8a2440', 6);
  clipTo(ctx, inner, () => { ctx.fillStyle = '#6e1a32'; ctx.fillRect(40, -700, 200, 720); halftone(ctx, -170, -650, 340, 650, 'rgba(255,200,220,0.12)', 22, 4, 'none');
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) circ(ctx, -90 + i * 90, -520 + j * 130, 9, '#e6b84a', 3); });
  circ(ctx, 0, -690, 26, '#e6b84a', 6);
  ctx.restore();
}
// the owner seated, seen from behind: head + shoulders rise above the chair; arm lifts a gold spoon (spoon 0..1 to the mouth)
export function ownerBack(ctx, x, y, s = 1, { spoon = 0, t = 0, still = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const bob = still ? 0 : Math.sin(t * 2) * 3;
  // shoulders (behind the backrest top, wider)
  P(ctx, (c) => { c.moveTo(-300, -380); c.quadraticCurveTo(-290, -560, -90, -590); c.lineTo(90, -590); c.quadraticCurveTo(290, -560, 300, -380); c.closePath(); }, SUIT, 8);
  clipTo(ctx, (c) => { c.moveTo(-300, -380); c.quadraticCurveTo(-290, -560, -90, -590); c.lineTo(90, -590); c.quadraticCurveTo(290, -560, 300, -380); c.closePath(); }, () => { ctx.fillStyle = SUIT_S; ctx.fillRect(120, -620, 220, 260); ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 3; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(-300 + i * 52, -600); ctx.lineTo(-300 + i * 52, -360); ctx.stroke(); } });
  // collar + neck
  P(ctx, (c) => c.roundRect(-70, -650, 140, 80, 20), '#c98e66', 7);
  P(ctx, (c) => { c.moveTo(-86, -580); c.lineTo(-70, -626); c.lineTo(70, -626); c.lineTo(86, -580); c.closePath(); }, '#fbfaf6', 6);
  // head (back): silver hair, ears
  ctx.save(); ctx.translate(0, bob);
  circ(ctx, -122, -760, 30, '#e7b28c', 6); circ(ctx, 122, -760, 30, '#e7b28c', 6);
  P(ctx, (c) => c.ellipse(0, -780, 128, 150, 0, 0, TAU), HAIR, 8);
  clipTo(ctx, (c) => c.ellipse(0, -780, 128, 150, 0, 0, TAU), () => { ctx.fillStyle = HAIR_S; ctx.beginPath(); ctx.ellipse(70, -740, 90, 170, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#8f8a9c'; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(-100 + i * 32, -900); ctx.quadraticCurveTo(-90 + i * 34, -780, -70 + i * 26, -660); ctx.stroke(); }
    ctx.fillStyle = '#e7b28c'; ctx.beginPath(); ctx.ellipse(0, -870, 44, 30, 0, 0, TAU); ctx.fill(); });
  P(ctx, (c) => c.ellipse(0, -780, 128, 150, 0, 0, TAU), null, 8);
  ctx.restore();
  // right arm lifting the spoon to the (hidden) mouth
  const k = eOut(clamp(spoon));
  const sx = 250, sy = -420, hx = lerp(330, 150, k), hy = lerp(-430, -740, k);
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(lerp(380, 340, k), lerp(-380, -560, k), hx, hy); ctx.lineWidth = 110; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 94; ctx.strokeStyle = SUIT; ctx.stroke();
  P(ctx, (c) => c.ellipse(hx, hy, 50, 46, 0, 0, TAU), '#fbfaf6', 6);
  P(ctx, (c) => c.ellipse(hx - 20 * k, hy - 30, 46, 44, 0, 0, TAU), '#e7b28c', 7);
  circ(ctx, hx - 50, hy - 40, 12, '#ffd43b', 4);
  ctx.save(); ctx.translate(hx - 30, hy - 60); ctx.rotate(lerp(-0.4, -1.3, k)); P(ctx, (c) => c.roundRect(-8, -150, 16, 150, 8), '#e6b84a', 5); P(ctx, (c) => c.ellipse(0, -160, 26, 18, 0, 0, TAU), '#e6b84a', 5); ctx.restore();
  ctx.restore();
}
// the owner's hand from the top edge (navy sleeve, white cuff, gold cufflink + ring), palm down, pushing at (x,y)
export function ownerHand(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(0, -900); ctx.lineWidth = 170; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 154; ctx.strokeStyle = SUIT; ctx.stroke();
  P(ctx, (c) => c.roundRect(-82, -170, 164, 70, 18), '#fbfaf6', 7); circ(ctx, 40, -136, 13, '#ffd43b', 4);
  const hand = (c) => { c.moveTo(-66, -110); c.lineTo(-74, 10); c.quadraticCurveTo(-70, 70, -30, 74); c.lineTo(40, 74); c.quadraticCurveTo(76, 70, 72, 10); c.lineTo(66, -110); c.closePath(); };
  P(ctx, hand, '#e7b28c', 7);
  clipTo(ctx, hand, () => { ctx.fillStyle = '#c98e68'; ctx.fillRect(34, -120, 60, 200); });
  for (let i = 0; i < 3; i++) line(ctx, -36 + i * 34, 30, -36 + i * 34, 72, 5);
  P(ctx, (c) => c.roundRect(-58, 8, 34, 18, 6), '#ffd43b', 4);
  P(ctx, (c) => { c.moveTo(-70, -60); c.quadraticCurveTo(-120, -30, -112, 20); c.quadraticCurveTo(-96, 36, -74, 10); c.closePath(); }, '#e7b28c', 6);
  ctx.restore();
}
// "RESERVED" table card
export function reservedCard(ctx, x, y, s = 1, text = 'THE OWNER') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  castShadow(ctx, (c) => c.roundRect(-150 + 14, -110 + 14, 300, 120, 12));
  P(ctx, (c) => { c.moveTo(-150, 10); c.lineTo(-130, -110); c.lineTo(130, -110); c.lineTo(150, 10); c.closePath(); }, '#fbf7ee', 6);
  ctx.save(); ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 4; ctx.strokeRect(-122, -98, 244, 96); ctx.restore();
  txt(ctx, 'RESERVED', 0, -70, { font: 'Inter', weight: 800, size: 22, col: '#b08a2e' });
  txt(ctx, text, 0, -30, { font: 'Anton', weight: 400, size: 40, col: INK });
  ctx.restore();
}
// white tablecloth table edge across the frame at y (front edge), with drape
export function tableFront(ctx, y, { x0 = -200, x1 = W + 200, col = '#fbfaf6' } = {}) {
  P(ctx, (c) => { c.moveTo(x0, y - 120); c.lineTo(x1, y - 120); c.lineTo(x1, y + 300); c.lineTo(x0, y + 300); c.closePath(); }, col, 8);
  clipTo(ctx, (c) => c.rect(x0, y - 120, x1 - x0, 420), () => { ctx.fillStyle = '#e4e2dc'; ctx.fillRect(x0, y, x1 - x0, 300); for (let i = 0; i < 9; i++) { ctx.fillStyle = 'rgba(28,21,48,0.08)'; ctx.fillRect(x0 + 60 + i * 150, y, 30, 300); } });
  line(ctx, x0, y, x1, y, 6);
}
// top-down-ish saucepan (3/4 view, like the skillet but deeper) holding cream sauce. split 0..1 (grease channel + curds), soup 0..1 (thinned
// to watery soup, level rises), boil, slosh. (x,y) = rim centre
export function saucePan(ctx, x, y, s = 1, { split = 0, soup = 0, t = 0, boil = 0, slosh = 0, rise = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const rx = 300, ry = 120, d = 120;
  castShadow(ctx, (c) => c.ellipse(16, d + 30, rx + 10, ry + 10, 0, 0, TAU));
  P(ctx, (c) => { c.moveTo(rx - 20, -30); c.lineTo(rx + 300, -70); c.quadraticCurveTo(rx + 330, -50, rx + 304, -24); c.lineTo(rx - 10, 24); c.closePath(); }, '#2b2735', 7);
  // body (side wall)
  P(ctx, (c) => { c.moveTo(-rx, 0); c.lineTo(-rx + 6, d); c.ellipse(0, d, rx - 6, ry - 4, 0, Math.PI, 0, true); c.lineTo(rx, 0); c.closePath(); }, '#b4bdcc', 7);
  clipTo(ctx, (c) => { c.moveTo(-rx, 0); c.lineTo(-rx + 6, d); c.ellipse(0, d, rx - 6, ry - 4, 0, Math.PI, 0, true); c.lineTo(rx, 0); c.closePath(); }, () => { ctx.fillStyle = '#8f99ad'; ctx.fillRect(120, -40, 220, 300); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(-220, 30, 20, 120); });
  // rim + inner wall
  P(ctx, (c) => c.ellipse(0, 0, rx, ry, 0, 0, TAU), '#7d879b', 7);
  const lx = 0, ly = 24 - rise * 22, lrx = rx - 26, lry = ry - 22, wob = Math.sin(t * 8) * 8 * slosh;
  const surf = (c) => c.ellipse(lx, ly + wob, lrx, lry, 0, 0, TAU);
  const col = soup > 0 ? mix(CREAM, '#eef3f4', 0.55 * soup) : CREAM;
  P(ctx, surf, col, 6);
  clipTo(ctx, surf, () => {
    ctx.fillStyle = soup > 0 ? mix(CREAM_S, '#d9e2e6', 0.5 * soup) : CREAM_S; ctx.beginPath(); ctx.ellipse(110, ly + 50, 220, 70, 0, 0, TAU); ctx.fill();
    if (split > 0) {
      const w = 60 * eOut(split);
      ctx.fillStyle = OIL; ctx.beginPath(); ctx.moveTo(-30 - w, ly - 120);
      for (let i = 0; i <= 10; i++) ctx.lineTo(-30 - w + (i % 2 ? 26 : -18) + i * 6, ly - 120 + i * 24);
      for (let i = 10; i >= 0; i--) ctx.lineTo(-30 + w + (i % 2 ? 18 : -26) + i * 6, ly - 120 + i * 24);
      ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
      ctx.save(); ctx.globalAlpha = 0.6; ell(ctx, -30, ly - 30, w * 0.4, 14, '#fff6c0', 0); ctx.restore();
      for (let i = 0; i < 14; i++) { const cx = -230 + hash(i * 3.3) * 460, cy = ly - 70 + hash(i * 5.1) * 140; if (Math.abs(cx + 30 - (cy - ly) * 0.25) < w + 30) continue; P(ctx, (c) => c.ellipse(cx, cy, 22 * split, 14 * split, hash(i) * 3, 0, TAU), '#fff8e6', 4); }
      for (let i = 0; i < 9; i++) { const cx = -240 + hash(i * 9.1) * 480, cy = ly - 70 + hash(i * 4.4) * 140; circ(ctx, cx, cy, 13 * split, OIL, 3); }
    }
    if (soup > 0) { ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 5; for (let i = 0; i < 3; i++) { const r = (t * 60 + i * 60) % 180; ctx.beginPath(); ctx.ellipse(-30, ly + wob, 40 + r, 16 + r * 0.38, 0, 0, TAU); ctx.stroke(); }
      ctx.lineCap = 'round'; for (let i = 0; i < 4; i++) { const fx = -200 + i * 110, fy = ly - 30 + (i % 2) * 50 + wob + Math.sin(t * 3 + i) * 4; ctx.strokeStyle = INK; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.bezierCurveTo(fx + 30, fy - 18, fx + 60, fy + 18, fx + 90, fy); ctx.stroke(); ctx.strokeStyle = '#f3d58a'; ctx.lineWidth = 10; ctx.stroke(); } }
    if (boil > 0) for (let i = 0; i < 10; i++) { const ph = (t * 2.2 + hash(i * 2.7)) % 1; const bx = -220 + hash(i * 1.3) * 440, by = ly - 60 + hash(i * 6.1) * 120; ctx.globalAlpha = boil * Math.sin(ph * Math.PI); P(ctx, (c) => c.arc(bx, by, 8 + ph * 16, 0, TAU), null, 5); ctx.globalAlpha = 1; }
  });
  P(ctx, (c) => c.ellipse(0, 0, rx, ry, 0, 0, TAU), null, 8);
  ctx.restore();
}
