// Oddverra cast v2: varied heads/builds/hair, cel shading + blue-violet rim light, orbit eyes, lids/lashes, thumbs, cuffs.
export const INK = '#2b1d4a', RIM = 'rgba(150,170,255,0.75)';
const TAU = Math.PI * 2;
const dk0 = (c, k = 0.74) => { const n = parseInt(c.slice(1), 16); const ch = (v) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, '0'); return '#' + ch(n >> 16 & 255) + ch(n >> 8 & 255) + ch(n & 255); };
const mixc = (a, b, t) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const ch = (s) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t).toString(16).padStart(2, '0'); return '#' + ch(16) + ch(8) + ch(0); };
const dk = (c, k = 0.74) => mixc(dk0(c, k), '#3a2a7a', 0.22);
const supPath = (cx, cy, a, b, n, top = 1, bot = 1) => (g) => { g.beginPath(); for (let i = 0; i <= 72; i++) { const t = i / 72 * TAU, c = Math.cos(t), s = Math.sin(t); const yy = b * Math.sign(s) * Math.abs(s) ** (2 / n) * (s < 0 ? top : bot); const X = cx + a * Math.sign(c) * Math.abs(c) ** (2 / n), Y = cy + yy; i ? g.lineTo(X, Y) : g.moveTo(X, Y); } g.closePath(); };
const ellPath = (cx, cy, a, b, rot = 0) => (g) => { g.beginPath(); g.ellipse(cx, cy, a, b, rot, 0, TAU); };
// cel shaded fill: dark base, lit area = shape shifted up-left, rim light along the shadow edge, thick outline
function cel(g, path, base, ow = 11, dx = 16, dy = 12, rim = true) {
  if (ow) { g.save(); g.translate(3, 4); path(g); g.lineWidth = ow * 1.15; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); g.restore(); }
  path(g); g.fillStyle = dk(base); g.fill();
  g.save(); path(g); g.clip(); g.translate(-dx, -dy); path(g); g.fillStyle = base; g.fill(); g.restore();
  if (rim) { g.save(); path(g); g.clip(); g.translate(6, 5); path(g); g.lineWidth = 12; g.strokeStyle = RIM; g.stroke(); g.restore(); }
  if (ow) { path(g); g.lineWidth = ow * 0.8; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); }
}
function line(g, pts, w, col = INK) { g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.lineWidth = w; g.strokeStyle = col; g.stroke(); }
function tube(g, pts, w, col) { line(g, pts, w + 18, INK); line(g, pts, w, dk(col, 0.82)); line(g, pts.map(([x, y]) => [x - w * 0.18, y - 2]), w * 0.55, col); }
const HEADS = { round: [165, 148, 2.5, 1, 1], egg: [152, 160, 2.3, 0.92, 1.06], wide: [180, 134, 2.9, 1, 0.96], tall: [141, 167, 2.6, 1, 1] };
const BUILD = { adult: { w: 1, h: 1, leg: 1 }, thin: { w: 0.8, h: 1.1, leg: 1.1 }, stout: { w: 1.28, h: 0.95, leg: 0.9 }, kid: { w: 0.85, h: 0.75, leg: 0.7 }, old: { w: 1.05, h: 0.95, leg: 0.9 } };

const HOLD = {
  bottle: (g) => { const b = (h) => { h.beginPath(); h.moveTo(-10, -150); h.lineTo(10, -150); h.lineTo(10, -100); h.quadraticCurveTo(34, -84, 34, -54); h.lineTo(34, 40); h.quadraticCurveTo(0, 52, -34, 40); h.lineTo(-34, -54); h.quadraticCurveTo(-34, -84, -10, -100); h.closePath(); };
    b(g); g.fillStyle = '#7a4a22'; g.fill(); g.save(); b(g); g.clip(); g.fillStyle = 'rgba(40,20,60,0.35)'; g.fillRect(8, -160, 40, 220); g.fillStyle = 'rgba(255,240,210,0.5)'; g.fillRect(-26, -80, 8, 110); g.restore(); b(g); g.lineWidth = 7; g.strokeStyle = '#2b1d4a'; g.stroke();
    g.fillStyle = '#f2e6c0'; g.fillRect(-30, -40, 60, 46); g.lineWidth = 4; g.strokeRect(-30, -40, 60, 46); g.fillStyle = '#2b1d4a'; g.font = 'bold 15px serif'; g.textAlign = 'center'; g.fillText('BRANDY', 0, -12); g.fillStyle = '#c8302c'; g.fillRect(-12, -164, 24, 18); g.strokeRect(-12, -164, 24, 18); },
  spoon: (g) => { g.lineCap = 'round'; g.strokeStyle = '#2b1d4a'; g.lineWidth = 16; g.beginPath(); g.moveTo(0, 20); g.lineTo(30, -110); g.stroke(); g.strokeStyle = '#d8dce6'; g.lineWidth = 8; g.stroke();
    g.beginPath(); g.ellipse(34, -128, 22, 30, 0.23, 0, Math.PI * 2); g.fillStyle = '#d8dce6'; g.fill(); g.lineWidth = 6; g.strokeStyle = '#2b1d4a'; g.stroke(); g.beginPath(); g.ellipse(34, -130, 13, 18, 0.23, 0, Math.PI * 2); g.fillStyle = '#e8f0ff'; g.fill(); g.beginPath(); g.arc(36, -132, 6, 0, 7); g.fillStyle = '#ffffff'; g.fill(); },
  medal: (g) => { g.lineWidth = 6; g.strokeStyle = '#2b1d4a'; g.fillStyle = '#3f6fb5'; g.beginPath(); g.moveTo(-14, -10); g.lineTo(-30, -120); g.lineTo(-6, -120); g.lineTo(4, -10); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#c0453a'; g.beginPath(); g.moveTo(14, -10); g.lineTo(30, -120); g.lineTo(6, -120); g.lineTo(-4, -10); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.arc(0, 30, 46, 0, 7); g.fillStyle = '#e8b830'; g.fill(); g.lineWidth = 8; g.stroke(); g.beginPath(); g.arc(0, 30, 30, 0, 7); g.fillStyle = '#f6d460'; g.fill(); g.beginPath(); g.arc(-12, 18, 8, 0, 7); g.fillStyle = '#fffbe0'; g.fill(); },
  megaphone: (g) => { g.lineWidth = 7; g.strokeStyle = '#2b1d4a'; g.fillStyle = '#e8e4dc'; g.beginPath(); g.moveTo(-10, -20); g.lineTo(-40, -150); g.lineTo(60, -150); g.lineTo(20, -20); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#c0453a'; g.fillRect(-46, -160, 112, 16); g.strokeRect(-46, -160, 112, 16); },
};
export function oddverra(g, o, op = {}) {
  const { expr = 'smile', look = 0, blink = 0, wave, cheer } = op;
  const B = BUILD[o.build || 'adult'], [HW, HH, HN, ht, hb] = HEADS[o.head || 'round'];
  const skin = o.skin || '#f6c9a4', cx = 300, sole = 965;
  const legL = 175 * B.leg, hipY = sole - 30 - legL * (op.mode === 'sit' ? 0.38 : 1), torsoH = 300 * B.h, topY = hipY - torsoH + 30, TW = 105 * B.w;
  const hy = topY - HH * 0.78 + (o.build === 'old' ? 18 : 0);
  // back hair
  if (o.hair === 'bun') cel(g, ellPath(cx, hy - HH - 18, 56, 46), o.hairCol, 10);
  if (o.hair === 'long') cel(g, (h) => { h.beginPath(); h.moveTo(cx - HW - 14, hy - 20); h.quadraticCurveTo(cx - HW - 40, hy + HH + 160, cx - HW + 30, hy + HH + 200); h.lineTo(cx + HW - 30, hy + HH + 200); h.quadraticCurveTo(cx + HW + 40, hy + HH + 160, cx + HW + 14, hy - 20); h.quadraticCurveTo(cx, hy - HH - 60, cx - HW - 14, hy - 20); h.closePath(); }, o.hairCol, 11);
  if (o.hair === 'curly') { const curls = (h) => { h.beginPath(); h.ellipse(cx, hy - 10, HW * 1.05, HH * 1.02, 0, 0, TAU); for (let i = 0; i < 16; i++) { const an = Math.PI * (0.9 + i / 15 * 1.2), x = cx + Math.cos(an) * HW * 1.02, y = hy - 10 + Math.sin(an) * HH * 0.98; h.moveTo(x + 44, y); h.arc(x, y, 44, 0, TAU); } };
    curls(g); g.lineWidth = 24; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); curls(g); g.fillStyle = dk(o.hairCol, 0.85); g.fill();
    g.save(); curls(g); g.clip(); g.translate(-12, -10); curls(g); g.fillStyle = o.hairCol; g.fill(); g.restore(); }
  // legs + shoes
  const hs = op.stance === 'relaxed' ? 14 : 0, mode = op.mode || 'stand', ph = op.phase || 0;
  const lift = (s) => mode === 'run' ? Math.max(0, Math.sin(TAU * (ph + (s > 0 ? 0.5 : 0)))) : 0;
  for (const s of [-1, 1]) {
    const hx = cx + s * 40 * B.w + hs, bent = hs && s === -1 && mode === 'stand', Ls = lift(s);
    let P, fx, fy = sole - 30;
    if (mode === 'sit') { P = [[hx, hipY], [cx + s * 72 * B.w, hipY + 24], [cx + s * 80 * B.w, sole - 30]]; fx = cx + s * 90 * B.w; }
    else if (mode === 'fall') { P = [[hx, hipY], [cx + s * 84 * B.w, hipY + legL * 0.42], [cx + s * 124 * B.w, sole - 70]]; fx = cx + s * 132 * B.w; fy = sole - 70; }
    else if (mode === 'run') { fy = sole - 30 - Ls * 110; P = [[hx, hipY], [cx + s * 38 * B.w, hipY + legL * 0.5 - Ls * 46], [cx + s * 46 * B.w, fy]]; fx = cx + s * 52 * B.w + s * 10; }
    else { P = bent ? [[hx, hipY], [cx + s * 34 * B.w, hipY + legL * 0.55], [cx + s * 56 * B.w, sole - 30]] : [[hx, hipY], [cx + s * 46 * B.w + hs * 0.5, sole - 30]]; fx = cx + s * 52 * B.w + s * 10 + (bent ? s * 12 : hs * 0.5); }
    tube(g, P, 40, o.pants);
    const last = P[P.length - 1]; g.beginPath(); g.roundRect(last[0] - 26, last[1] - 22, 52, 14, 6); g.fillStyle = dk(o.pants, 0.9); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    cel(g, (h) => { h.beginPath(); h.ellipse(fx, fy + 16, 50, 26, s * 0.18, 0, TAU); }, o.shoes || '#3a2a2a', 9, 8, 6, false);
    line(g, [[fx - 30, fy + 36], [fx + 34, fy + 36]], 6, 'rgba(255,255,255,0.22)'); for (let k = 0; k < 2; k++) line(g, [[fx - 10 + k * 12, fy - 4], [fx - 2 + k * 12, fy + 6]], 4, '#e8e4dc');
  }
  // arms
  const sh = (s) => [cx + s * TW * 0.86, topY + 40];
  const pose = (s) => (cheer || (s === 1 && wave !== undefined)) ? (cheer ? [sh(s), [cx + s * (TW + 60), topY - 30], [cx + s * (TW + 70), topY - 140]] : [sh(s), [cx + s * (TW + 70), topY], [cx + s * (TW + 60), topY - 100 - 30 * (wave || 0)]]) : [sh(s), [cx + s * (TW + 36), topY + 140], [cx + s * (TW + 40), topY + 245]];
  const runArm = (s) => { const sw = mode === 'run' ? Math.sin(TAU * (ph + (s > 0 ? 0 : 0.5))) : 0; return [sh(s), [cx + s * (TW + 46), topY + 120 - sw * 30], [cx + s * (TW + 20 - Math.max(0, sw) * 30), topY + 205 - sw * 60]]; };
  const SA = op.steer || 0, WC = [cx, topY + 178], rimP = (s) => [WC[0] + Math.cos(SA) * s * 92 - Math.sin(SA) * -6, WC[1] + Math.sin(SA) * s * 92 * 0.4 + Math.cos(SA) * -6];
  const armFor = (s) => op.drive ? [sh(s), [cx + s * (TW + 36), topY + 120], rimP(s)] : mode === 'fall' ? [sh(s), [cx + s * (TW + 70), topY - 10], [cx + s * (TW + 110), topY - 90]] : (op.prop === 'stick' && s === 1) ? [sh(s), [cx + s * (TW + 70), topY + 10], [cx + s * (TW + 64), topY - 90]] : (HOLD[op.prop] && s === 1) ? [sh(s), [cx + s * (TW + 66), topY + 100 - 40 * (op.reach || 0)], [cx + s * (TW + 96 + 30 * (op.reach || 0)), topY + 60 - 70 * (op.reach || 0)]] : mode === 'run' ? runArm(s) : null;
  const arms = [-1, 1].map((s) => [s, armFor(s) || ((op.hip && s === -1) ? [sh(s), [cx + s * (TW + 70), topY + 120], [cx + s * (TW + 4), topY + 200]] : pose(s))]);
  const drawArm = ([s, P]) => { tube(g, P, 34, o.shirt); const h = P[2]; const c = P[1]; const ang = Math.atan2(h[1] - c[1], h[0] - c[0]);
    cel(g, ellPath(h[0] - Math.cos(ang) * 6, h[1] - Math.sin(ang) * 6, 22, 14, ang + Math.PI / 2), o.cuff || '#ffffff', 7, 4, 3, false);
    cel(g, ellPath(h[0] + Math.cos(ang) * 14, h[1] + Math.sin(ang) * 14, 26, 24), skin, 8, 6, 5, false);
    cel(g, ellPath(h[0] + Math.cos(ang) * 10 - s * 20, h[1] + Math.sin(ang) * 10 - 8, 10, 14, -s * 0.5), skin, 6, 3, 2, false); };
  for (const a of arms) if (!op.drive && a[1][2][1] > topY + 100) drawArm(a);
  // torso
  const TT = op.t || 0, MV = mode === 'run' ? 1 : (op.drive || mode === 'sit') ? 0.6 : 0.3, HEM = 2 + 6 * MV;
  const torso = (g) => { g.beginPath(); g.moveTo(cx - TW * 0.82, topY); g.bezierCurveTo(cx - TW * 1.35, topY + torsoH * 0.45, cx - TW * 1.4, hipY + 30, cx - TW * 0.4, hipY + 30); for (let k = 1; k <= 8; k++) { const xx = cx - TW * 0.4 + k * TW * 0.1; g.lineTo(xx, hipY + 30 + HEM * Math.sin(k * 1.3 + TT * 0.55)); } g.bezierCurveTo(cx + TW * 1.4, hipY + 30, cx + TW * 1.35, topY + torsoH * 0.45, cx + TW * 0.82, topY); g.quadraticCurveTo(cx, topY - 26, cx - TW * 0.82, topY); g.closePath(); };
  cel(g, torso, o.shirt, 11, 22, 10);
  g.save(); torso(g); g.clip();
  if (o.stripe) { g.fillStyle = o.stripe; for (let y = topY + 80; y < hipY + 40; y += 64) g.fillRect(0, y, 600, 22); }
  const P = o.pattern;
  if (P === 'plaid') { g.fillStyle = 'rgba(20,10,40,0.18)'; for (let y = topY; y < hipY + 40; y += 64) g.fillRect(0, y, 600, 24); for (let x = cx - 300; x < 600; x += 64) g.fillRect(x, topY - 20, 24, hipY - topY + 80); g.fillStyle = o.plaidLine || 'rgba(255,240,200,0.45)'; for (let y = topY + 40; y < hipY + 40; y += 64) g.fillRect(0, y, 600, 4); for (let x = cx - 260; x < 600; x += 64) g.fillRect(x, topY - 20, 4, hipY - topY + 80); }
  if (P === 'pinstripe') { g.fillStyle = 'rgba(255,255,255,0.2)'; for (let x = cx - 300; x < 600; x += 20) g.fillRect(x, topY - 20, 3, hipY - topY + 80); }
  if (P === 'dots') { g.fillStyle = o.dotCol || 'rgba(255,255,255,0.75)'; for (let y = topY + 20, r = 0; y < hipY + 40; y += 38, r++) for (let x = cx - 300 + (r % 2) * 19; x < 600; x += 38) { g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill(); } }
  if (P === 'tweed') { g.strokeStyle = 'rgba(30,20,10,0.16)'; g.lineWidth = 2; for (let y = topY; y < hipY + 40; y += 14) { g.beginPath(); g.moveTo(0, y); g.lineTo(600, y + 6); g.stroke(); } for (let x = cx - 300; x < 600; x += 14) { g.beginPath(); g.moveTo(x, topY - 20); g.lineTo(x + 6, hipY + 60); g.stroke(); } }
  if (o.sash) { g.fillStyle = o.sash; g.beginPath(); g.moveTo(cx - TW * 0.9, topY - 10); g.lineTo(cx - TW * 0.5, topY - 10); g.lineTo(cx + TW * 1.1, hipY + 10); g.lineTo(cx + TW * 0.7, hipY + 30); g.closePath(); g.fill(); }
  if (o.trim) { g.strokeStyle = o.trim; g.lineWidth = 10; g.beginPath(); g.moveTo(cx - TW * 0.82, topY + 6); g.quadraticCurveTo(cx, topY + 70, cx + TW * 0.82, topY + 6); g.stroke(); g.beginPath(); for (let k = 0; k <= 8; k++) { const xx = cx - TW * 0.4 + k * TW * 0.1; g[k ? 'lineTo' : 'moveTo'](xx, hipY + 22 + HEM * Math.sin(k * 1.3 + TT * 0.55)); } g.stroke(); }
  // seams + folds that move with the body
  g.strokeStyle = 'rgba(30,15,60,0.35)'; g.lineWidth = 4; g.lineCap = 'round';
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * TW * 0.92, topY + 50); g.quadraticCurveTo(cx + s * TW * 1.12, topY + torsoH * 0.55, cx + s * TW * 0.95, hipY + 20); g.stroke(); }
  for (let k = 0; k < 3; k++) { const sw = Math.sin(TT * (0.35 + 0.1 * k) + k * 2) * MV; const y0 = topY + torsoH * (0.45 + 0.13 * k); g.beginPath(); g.moveTo(cx - TW * (0.7 - 0.1 * k) + sw * 14, y0); g.quadraticCurveTo(cx + sw * 22, y0 + 16 + sw * 8, cx + TW * (0.25 + 0.1 * k) + sw * 10, y0 - 6); g.stroke(); }
  { const sh2 = g.createLinearGradient(cx - TW * 1.2, 0, cx - TW * 0.2, 0); sh2.addColorStop(0, 'rgba(255,255,255,0)'); sh2.addColorStop(0.5, 'rgba(255,255,255,0.13)'); sh2.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sh2; g.fillRect(cx - TW * 1.2 + Math.sin(TT * 0.3) * 6 * MV, topY, TW, torsoH); }
  if (o.belt) { g.fillStyle = o.belt; g.fillRect(0, hipY - 30, 600, 26); g.fillStyle = '#e8c45a'; g.fillRect(cx - 16, hipY - 32, 32, 30); }
  if (o.vest) { g.fillStyle = o.vest; g.beginPath(); g.moveTo(cx - TW * 1.4, topY); g.lineTo(cx - 26, topY + 40); g.lineTo(cx - 20, hipY + 40); g.lineTo(cx - TW * 1.5, hipY + 40); g.fill(); g.beginPath(); g.moveTo(cx + TW * 1.4, topY); g.lineTo(cx + 26, topY + 40); g.lineTo(cx + 20, hipY + 40); g.lineTo(cx + TW * 1.5, hipY + 40); g.fill(); }
  g.restore(); torso(g); g.lineWidth = 11; g.strokeStyle = INK; g.stroke();
  if (!o.bib && !o.noButtons) for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(cx, topY + 90 + i * 60, 8, 0, TAU); g.fillStyle = o.button || dk(o.shirt, 0.6); g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); }
  if (o.bib) { g.beginPath(); g.roundRect(cx - 54, topY + 110, 108, 82, 10); g.fillStyle = '#fffdf6'; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.fillStyle = INK; g.font = 'bold 58px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.bib, cx, topY + 153); }
  g.beginPath(); g.moveTo(cx - 58, topY + 2); g.lineTo(cx, topY + 56); g.lineTo(cx + 58, topY + 2); g.fillStyle = o.collar || '#ffffff'; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke();
  const swing = Math.sin(TT * 0.45) * 0.22 * MV; g.save(); g.translate(cx, topY + 40); g.rotate(swing); g.translate(-cx, -(topY + 40));
  if (o.neck === 'tie') cel(g, (h) => { h.beginPath(); h.moveTo(cx - 14, topY + 40); h.lineTo(cx + 14, topY + 40); h.lineTo(cx + 22, topY + 150); h.lineTo(cx, topY + 176); h.lineTo(cx - 22, topY + 150); h.closePath(); }, o.neckCol || '#c0453a', 7, 6, 4, false);
  if (o.neck === 'bow') { for (const s of [-1, 1]) cel(g, (h) => { h.beginPath(); h.moveTo(cx, topY + 40); h.lineTo(cx + s * 44, topY + 20); h.lineTo(cx + s * 44, topY + 66); h.closePath(); }, o.neckCol || '#c0453a', 7, 4, 3, false); cel(g, ellPath(cx, topY + 43, 12, 14), dk(o.neckCol || '#c0453a', 0.85), 6, 2, 2, false); }
  g.restore();
  if (o.neck === 'scarf') { cel(g, ellPath(cx, topY + 22, TW * 0.95, 34), o.neckCol || '#d9a441', 9, 8, 6, false); g.save(); g.translate(cx + 50, topY + 34); g.rotate(swing * 2 + 0.1 * Math.sin(TT * 0.9) * MV); cel(g, (h) => { h.beginPath(); h.moveTo(-20, 0); h.lineTo(20, 0); h.lineTo(24 + 6 * Math.sin(TT * 0.8), 120); h.lineTo(-16 + 6 * Math.sin(TT * 0.8), 116); h.closePath(); }, o.neckCol || '#d9a441', 8, 6, 4, false); for (let k = 0; k < 4; k++) line(g, [[-14 + k * 10 + 6 * Math.sin(TT * 0.8), 116], [-16 + k * 10 + 8 * Math.sin(TT * 0.8 + k), 134]], 5, dk(o.neckCol || '#d9a441', 0.8)); g.restore(); }
  if (o.pocket) { g.beginPath(); g.roundRect(cx + TW * 0.35, topY + 70, 46, 40, 6); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.fillStyle = o.pocket; g.fillRect(cx + TW * 0.35 + 8, topY + 62, 12, 14); }
  for (const a of arms) if (!op.drive && a[1][2][1] <= topY + 100) drawArm(a);
  if (op.drive) {
    // column + wheel in front of the chest (seen from slightly above), then hands gripping the rim
    line(g, [[WC[0] + 6, WC[1] + 30], [WC[0] + 30, WC[1] + 190]], 26, INK); line(g, [[WC[0] + 6, WC[1] + 30], [WC[0] + 30, WC[1] + 190]], 14, '#2a2630');
    const rim = (h) => { h.beginPath(); h.ellipse(WC[0], WC[1], 100, 40, SA * 0.4, 0, TAU); };
    rim(g); g.lineWidth = 34; g.strokeStyle = INK; g.stroke(); rim(g); g.lineWidth = 20; g.strokeStyle = '#c89a5a'; g.stroke(); rim(g); g.lineWidth = 6; g.strokeStyle = 'rgba(255,240,200,0.6)'; g.stroke();
    for (let k = 0; k < 3; k++) { const an = SA + k * Math.PI * 2 / 3 + 0.5; line(g, [[WC[0], WC[1]], [WC[0] + Math.cos(an) * 92, WC[1] + Math.sin(an) * 36]], 9, '#2a2630'); }
    cel(g, ellPath(WC[0], WC[1], 18, 12), '#e0b450', 6, 3, 2, false);
    for (const a of arms) drawArm(a);
  }
  if (HOLD[op.prop]) { const h = arms[1][1][2]; g.save(); g.translate(h[0] + 10, h[1] - 6); HOLD[op.prop](g); g.restore(); cel(g, ellPath(h[0] + 6, h[1] + 8, 26, 22), skin, 8, 6, 5, false); cel(g, ellPath(h[0] - 14, h[1] - 6, 10, 14, 0.5), skin, 6, 3, 2, false); }
  if (op.prop === 'stick') { const h = arms[1][1][2]; line(g, [[h[0] - 8, h[1] + 26], [h[0] + 70, h[1] - 120]], 18, INK); line(g, [[h[0] - 8, h[1] + 26], [h[0] + 70, h[1] - 120]], 10, '#8a5a34'); cel(g, ellPath(h[0] + 14, h[1] + 14, 26, 24), skin, 8, 6, 5, false); }
  // chin shadow on the collar
  g.beginPath(); g.ellipse(cx, topY + 14, HW * 0.62, 26, 0, 0, TAU); g.fillStyle = 'rgba(30,15,60,0.28)'; g.fill();
  // clothing folds
  for (const s of [-1, 1]) line(g, [[cx + s * TW * 0.95, topY + torsoH * 0.55], [cx + s * TW * 0.75, topY + torsoH * 0.62]], 5, 'rgba(30,15,60,0.45)');
  g.save(); const tilt = (op.tilt ?? ((o.seed || 0) % 3 - 1) * 3) * Math.PI / 180; g.translate(cx, topY); g.rotate(tilt); g.translate(-cx, -topY);
  // ears + head
  for (const s of [-1, 1]) { cel(g, ellPath(cx + s * (HW - 8), hy + 16, 24, 32), skin, 9, 4, 3, false); if (o.earring) { g.beginPath(); g.arc(cx + s * (HW - 6), hy + 52, 9, 0, TAU); g.fillStyle = o.earring; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); } }
  const head = supPath(cx, hy, HW, HH, HN, ht, hb);
  cel(g, head, skin, 12, 20, 14);
  // front hair
  if (o.hair && o.hair !== 'bald') {
    g.save(); head(g); g.clip(); g.fillStyle = o.hairCol; g.beginPath();
    const top = hy - HH - 20, fr = hy - HH * 0.35;
    if (o.hair === 'spiky') { g.moveTo(cx - HW - 10, fr); for (let i = 0; i <= 8; i++) g.lineTo(cx - HW + i * HW / 4, fr - (i % 2 ? 60 : 0) + 10); g.lineTo(cx + HW + 10, top); g.lineTo(cx - HW - 10, top); }
    else if (o.hair === 'side') { g.moveTo(cx - HW - 10, fr + 10); g.quadraticCurveTo(cx - 30, fr - 40, cx + 40, fr - 50); g.quadraticCurveTo(cx + 110, fr - 20, cx + HW + 10, fr + 20); g.lineTo(cx + HW + 10, top); g.lineTo(cx - HW - 10, top); }
    else if (o.hair === 'curly') { for (let i = 0; i < 9; i++) { g.moveTo(cx - HW + i * HW / 4 + 30, fr - 6); g.arc(cx - HW + i * HW / 4, fr - 6, 30, 0, TAU); } g.rect(cx - HW - 20, top, 2 * HW + 40, fr - top - 6); }
    else { g.moveTo(cx - HW - 10, fr); for (let i = 0; i <= 6; i++) g.quadraticCurveTo(cx - HW + i * HW / 3 + HW / 6, fr - 36 + (i % 2) * 26, cx - HW + (i + 1) * HW / 3, fr - 10); g.lineTo(cx + HW + 10, top); g.lineTo(cx - HW - 10, top); }
    g.closePath(); g.fill();
    g.strokeStyle = dk(o.hairCol, 0.7); g.lineWidth = 4; g.lineCap = 'round';
    for (let k = 0; k < 7; k++) { const x0 = cx - HW * 0.8 + k * HW * 0.27, bend = Math.sin(TT * 0.4 + k) * 3 * MV; g.beginPath(); g.moveTo(x0 + 10, top + 30); g.quadraticCurveTo(x0 - 6 + bend, (top + fr) / 2, x0 - 14 + bend, fr - 8); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 9; g.beginPath(); g.arc(cx - HW * 0.1, hy - HH * 0.2, HW * 0.75, Math.PI * 1.18, Math.PI * 1.45); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 5; g.beginPath(); g.arc(cx - HW * 0.1, hy - HH * 0.2, HW * 0.75, Math.PI * 1.5, Math.PI * 1.58); g.stroke();
    g.restore();
    head(g); g.lineWidth = 12; g.strokeStyle = INK; g.stroke();
    if (o.hair !== 'curly') for (let k = 0; k < 3; k++) { const ax = cx - 30 + k * 26, ay = hy - HH - 4 + Math.abs(k - 1) * 8, wv = Math.sin(TT * 0.5 + k * 1.7) * (4 + 8 * MV); g.beginPath(); g.moveTo(ax - 10, ay + 10); g.quadraticCurveTo(ax + wv * 0.5, ay - 24, ax + 14 + wv, ay - 30 + Math.abs(wv) * 0.3); g.quadraticCurveTo(ax + 6, ay - 10, ax + 10, ay + 10); g.closePath(); g.fillStyle = o.hairCol; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
  }
  if (o.hair && o.hair !== 'bald' && o.chunky !== false) {
    const hc = o.hairCol, hd = dk(hc, 0.72), TT2 = op.t || 0;
    const clump = (x0, y0, x1, y1, w, curl) => { // pointed lock from root (x0,y0) to tip (x1,y1)
      const mx = (x0 + x1) / 2 + curl, my = (y0 + y1) / 2 - Math.abs(curl) * 0.4, nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny) || 1;
      const ox = nx / l * w, oy = ny / l * w;
      const P = (h) => { h.beginPath(); h.moveTo(x0 - ox, y0 - oy); h.quadraticCurveTo(mx - ox * 0.8, my - oy * 0.8, x1, y1); h.quadraticCurveTo(mx + ox * 0.8, my + oy * 0.8, x0 + ox, y0 + oy); h.closePath(); };
      cel(g, P, hc, 9, 6, 5, false); };
    const sway = (k) => Math.sin(TT2 * 0.45 + k * 1.3) * 4;
    const top = hy - HH, br = hy - HH * 0.35;
    if (o.hair === 'side') { // big swoop across the forehead + crown locks
      for (let k = 0; k < 4; k++) clump(cx - HW * 0.5 + k * 34, top + 10 + k * 6, cx + HW * 0.55 + k * 10 + sway(k), br + 12 + k * 4, 22, 26);
      for (let k = 0; k < 3; k++) clump(cx - 40 + k * 40, top + 26, cx - 30 + k * 46 + sway(k + 4), top - 34 - (k % 2) * 12, 18, 10);
      clump(cx - HW * 0.7, br - 30, cx - HW * 1.02, br + 34, 16, -8); }
    else if (o.hair === 'spiky') { for (let k = 0; k < 7; k++) { const a = Math.PI * (1.12 + k * 0.127), x0 = cx + Math.cos(a) * HW * 0.7, y0 = hy + Math.sin(a) * HH * 0.7; clump(x0, y0, cx + Math.cos(a) * (HW + 46) + sway(k), hy + Math.sin(a) * (HH + 46), 22, 0); } }
    else if (o.hair === 'short') { for (let k = 0; k < 6; k++) clump(cx - HW * 0.75 + k * HW * 0.3, top + 30, cx - HW * 0.8 + k * HW * 0.3 + 18 + sway(k), br - 2 + (k % 2) * 12, 20, 14); for (let k = 0; k < 2; k++) clump(cx - 20 + k * 40, top + 20, cx - 10 + k * 46 + sway(k), top - 24, 16, 8); }
    else if (o.hair === 'bun') { for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) clump(cx + sd * 10, top + 18, cx + sd * (HW * 0.55 + k * 26), br + 6 + k * 10, 22, sd * 16); }
    else if (o.hair === 'long') { for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) clump(cx + sd * (HW * 0.7 + k * 8), hy - HH * 0.6, cx + sd * (HW * 0.95 + k * 10) + sway(k), hy + HH * 1.4 + k * 18, 20, sd * 10); for (let k = 0; k < 4; k++) clump(cx - 50 + k * 34, top + 20, cx - 56 + k * 38 + 10, br + 4, 18, 10); }
  }
  if (o.hair === 'bald') { g.save(); head(g); g.clip(); g.fillStyle = o.hairCol; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * HW * 0.95, hy - 10, 40, 60, 0, 0, TAU); g.fill(); } g.restore(); head(g); g.lineWidth = 12; g.strokeStyle = INK; g.stroke(); }
  if (o.hat === 'top') { cel(g, (h) => { h.beginPath(); h.roundRect(cx - 82, hy - HH - 170, 164, 190, 12); }, o.hatCol || '#2a2630', 10); g.fillStyle = '#c0453a'; g.fillRect(cx - 78, hy - HH - 18, 156, 28); cel(g, ellPath(cx, hy - HH + 14, HW + 8, 24), o.hatCol || '#2a2630', 10, 6, 4, false); }
  if (o.hat === 'cap') { cel(g, (h) => { h.beginPath(); h.ellipse(cx, hy - HH * 0.62, HW + 6, 74, 0, Math.PI, TAU); h.closePath(); }, o.hatCol, 10); cel(g, ellPath(cx + 78, hy - HH * 0.6, 100, 22), dk(o.hatCol, 0.8), 9, 4, 3, false); }
  if (o.hat === 'bowler') { cel(g, (h) => { h.beginPath(); h.ellipse(cx, hy - HH * 0.66, HW * 0.78, 100, 0, Math.PI, TAU); h.closePath(); }, '#2a2630', 10); cel(g, ellPath(cx, hy - HH * 0.66, HW + 20, 20), '#2a2630', 9, 4, 3, false); }
  // face
  const ey = hy + 2, shock = expr === 'shock';
  const FACE = op.face || 'bean';
  if (FACE) {
    const E = expr, red = '#e0303a';
    const exciteE = E === 'excited', angryE = E === 'angry', meanE = E === 'mean' || E === 'smug', sadE = E === 'sad', shockE = E === 'shock' || E === 'surprised';
    // face tint overlays (inside head)
    g.save(); head(g); g.clip();
    if (angryE) { const gr = g.createLinearGradient(0, hy - HH, 0, hy); gr.addColorStop(0, 'rgba(230,50,60,0.38)'); gr.addColorStop(1, 'rgba(230,50,60,0)'); g.fillStyle = gr; g.fillRect(cx - HW, hy - HH, 2 * HW, HH); }
    if (sadE || E === 'shock') { g.strokeStyle = 'rgba(70,90,200,0.55)'; g.lineWidth = 7; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(cx + k * 34, hy - HH * 0.55); g.lineTo(cx + k * 34, hy - HH * 0.25); g.stroke(); } }
    g.restore();
    for (const s of [-1, 1]) {
      const ex = cx + s * 50, ey2 = hy + 4, lx = ex + look * 7;
      const closed = (blink >= 1 && E !== 'dazed') || E === 'happy' || E === 'laugh';
      if (E === 'pained') { line(g, [[ex - s * 22, ey2 - 14], [ex + s * 16, ey2], [ex - s * 22, ey2 + 14]], 10); }
      else if (E === 'dazed') { g.beginPath(); for (let a = 0; a < 15; a += 0.3) { const r = a * 1.6; g.lineTo(ex + r * Math.cos(a * s), ey2 + r * Math.sin(a * s)); } g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
      else if (closed) { line(g, [[ex - 22, ey2 + 6], [ex, ey2 - 12], [ex + 22, ey2 + 6]], 11); }
      else {
        const ry = exciteE ? 32 : shockE ? 34 : 26, rx = exciteE ? 20 : shockE ? 21 : 17;
        if (shockE) { g.beginPath(); g.ellipse(lx, ey2, rx + 10, ry + 8, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.ellipse(lx, ey2 + 2, 11, 14, 0, 0, TAU); g.fillStyle = INK; g.fill(); }
        else { g.beginPath(); g.ellipse(lx, ey2 + (blink > 0 ? 8 : 0), rx, blink > 0 ? ry * 0.45 : ry, 0, 0, TAU); g.fillStyle = INK; g.fill(); }
        if (exciteE) { for (const [sx, sy, r] of [[-6, -10, 11], [7, 10, 5]]) { g.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? r * 0.35 : r, an = k * Math.PI / 4; g.lineTo(lx + sx + rr * Math.cos(an), ey2 + sy + rr * Math.sin(an)); } g.closePath(); g.fillStyle = '#fff'; g.fill(); } }
        else if (!shockE) { g.beginPath(); g.arc(lx - 5, ey2 - 9, 5.5, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.save(); g.translate(lx - 5, ey2 - 9); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 11, 3.2, 0, 0, TAU); g.lineWidth = 2.2; g.strokeStyle = '#fff'; g.stroke(); g.restore(); }
        // lids: angry glare (inner low), sad droop (outer low), mean half-lid
        const lid = (o1, i1) => { g.beginPath(); g.moveTo(ex + s * 26, ey2 - 40); g.lineTo(ex - s * 26, ey2 - 40); g.lineTo(ex - s * 26, ey2 + i1); g.lineTo(ex + s * 26, ey2 + o1); g.closePath(); g.fillStyle = skin; g.fill(); line(g, [[ex + s * 24, ey2 + o1], [ex - s * 24, ey2 + i1]], 9); };
        if (angryE) lid(-18, 2); else if (sadE) lid(4, -16); else if (meanE) lid(-4, -2);
      }
      // brows
      const bc = o.hairCol && o.hair !== 'bald' ? dk(o.hairCol, 0.8) : INK, by = ey2 - 46 - (exciteE || shockE ? 16 : 0) - (op.browPop ? 6 : 0);
      if (angryE || (meanE && s < 0)) line(g, [[ex - s * 6, by + 26], [ex + s * 28, by + 2]], 16, bc);
      else if (meanE && s > 0) { g.beginPath(); g.moveTo(ex - s * 22, by + 2); g.quadraticCurveTo(ex, by - 18, ex + s * 26, by - 2); g.lineWidth = 13; g.strokeStyle = bc; g.lineCap = 'round'; g.stroke(); }
      else if (sadE || E === 'worried' || E === 'nervous') line(g, [[ex - s * 6, by - 8], [ex + s * 26, by + 12]], 13, bc);
      else { g.beginPath(); g.moveTo(ex - s * 22, by + 4); g.quadraticCurveTo(ex, by - 10, ex + s * 22, by + 4); g.lineWidth = 12; g.strokeStyle = bc; g.lineCap = 'round'; g.stroke(); }
      if (sadE) { g.beginPath(); g.moveTo(ex + s * 18, ey2 + 26); g.quadraticCurveTo(ex + s * 30, ey2 + 50, ex + s * 20, ey2 + 58); g.quadraticCurveTo(ex + s * 8, ey2 + 50, ex + s * 18, ey2 + 26); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); }
    }
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 96, hy + 50, exciteE ? 30 : 24, exciteE ? 16 : 13, 0, 0, TAU); g.fillStyle = angryE ? 'rgba(230,60,70,0.5)' : 'rgba(240,100,130,0.4)'; g.fill(); }
    if (o.glasses) for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * 52, hy + 4, 40, 0, TAU); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); if (s < 0) line(g, [[cx - 12, hy], [cx + 12, hy]], 7); }
    if (o.moustache) for (const s of [-1, 1]) cel(g, ellPath(cx + s * 26, hy + 56, 28, 12, s * (angryE ? 0.5 : 0.25)), o.moustache, 6, 3, 2, false);
    g.beginPath(); g.ellipse(cx + 3, hy + 30, 10, 7, 0, 0.2, Math.PI - 0.2); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
    const my2 = hy + 70;
    const mouthPath = (w, h, top = 0) => (k) => { k.beginPath(); k.moveTo(cx - w, my2 - 10 + top); k.quadraticCurveTo(cx, my2 - 4, cx + w, my2 - 10 - top); k.quadraticCurveTo(cx + w * 0.8, my2 + h, cx, my2 + h + 2); k.quadraticCurveTo(cx - w * 0.8, my2 + h, cx - w, my2 - 10 + top); k.closePath(); };
    const openMouth = (w, h, teethTop, teethBot, tongue) => { const mp = mouthPath(w, h); mp(g); g.fillStyle = '#5a1e30'; g.fill(); g.save(); mp(g); g.clip(); if (teethTop) { g.fillStyle = '#fff'; g.fillRect(cx - w - 4, my2 - 20, 2 * w + 8, 18); } if (teethBot) { g.fillStyle = '#fff'; g.fillRect(cx - w, my2 + h - 12, 2 * w, 16); } if (tongue) { g.fillStyle = '#e86e78'; g.beginPath(); g.ellipse(cx, my2 + h, w * 0.55, 14, 0, 0, TAU); g.fill(); } g.restore(); mp(g); g.lineWidth = 7; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); };
    if (op.talk != null && E !== 'angry') { const k = op.talk; if (k < 0.08) { g.beginPath(); g.arc(cx, my2 - 10, 20, Math.PI * 0.25, Math.PI * 0.75); g.lineWidth = 8; g.strokeStyle = INK; g.lineCap = 'round'; g.stroke(); }
      else { const w = 18 + 22 * k, h = 6 + 30 * k; g.beginPath(); g.ellipse(cx, my2 + 4, w, h, 0, 0, TAU); g.fillStyle = '#5a1e30'; g.fill(); g.save(); g.clip(); if (k > 0.3) { g.fillStyle = '#fff'; g.fillRect(cx - w, my2 + 4 - h, 2 * w, h * 0.35); } g.fillStyle = '#e86e78'; g.beginPath(); g.ellipse(cx, my2 + 4 + h * 0.75, w * 0.6, h * 0.5, 0, 0, TAU); g.fill(); g.restore(); g.beginPath(); g.ellipse(cx, my2 + 4, w, h, 0, 0, TAU); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); } }
    else if (exciteE) openMouth(48, 44, true, false, true);
    else if (E === 'laugh') openMouth(44, 38, true, false, true);
    else if (E === 'grin') openMouth(40, 24, true, false, true);
    else if (angryE) { g.beginPath(); g.roundRect(cx - 40, my2 - 8, 80, 40, 12); g.fillStyle = '#5a1e30'; g.fill(); g.save(); g.clip(); g.fillStyle = '#fff'; g.fillRect(cx - 42, my2 - 10, 84, 14); g.fillRect(cx - 42, my2 + 20, 84, 14); g.restore(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); line(g, [[cx - 40, my2 + 12], [cx + 40, my2 + 12]], 3, '#5a1e30'); }
    else if (meanE) { g.beginPath(); g.moveTo(cx - 26, my2 + 4); g.quadraticCurveTo(cx + 6, my2 + 14, cx + 30, my2 - 10); g.lineWidth = 8; g.strokeStyle = INK; g.lineCap = 'round'; g.stroke(); line(g, [[cx + 26, my2 - 14], [cx + 34, my2 - 4]], 6); }
    else if (sadE) { line(g, [[cx - 34, my2 + 14], [cx - 18, my2 + 2], [cx - 2, my2 + 8], [cx + 14, my2 + 0], [cx + 32, my2 + 14]], 8); }
    else if (shockE) { g.beginPath(); g.ellipse(cx, my2 + 10, E === 'shock' ? 22 : 12, E === 'shock' ? 30 : 14, 0, 0, TAU); g.fillStyle = '#5a1e30'; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); }
    else if (E === 'whistle') { g.beginPath(); g.ellipse(cx + 4, my2 + 6, 9, 10, 0, 0, TAU); g.fillStyle = '#5a1e30'; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
    else if (E === 'pained') { g.beginPath(); g.roundRect(cx - 30, my2 - 2, 60, 22, 7); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); line(g, [[cx - 30, my2 + 9], [cx + 30, my2 + 9]], 3); }
    else if (E === 'dazed') line(g, [[cx - 22, my2 + 4], [cx - 8, my2 - 4], [cx + 6, my2 + 4], [cx + 20, my2 - 4]], 6);
    else if (E === 'worried' || E === 'nervous') { g.beginPath(); g.arc(cx, my2 + 24, 20, Math.PI * 1.2, Math.PI * 1.8); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); }
    else if (E === 'happy') { g.beginPath(); g.arc(cx, my2 - 22, 34, Math.PI * 0.2, Math.PI * 0.8); g.lineWidth = 9; g.strokeStyle = INK; g.lineCap = 'round'; g.stroke(); }
    else { g.beginPath(); g.arc(cx, my2 - 10, 22, Math.PI * 0.25, Math.PI * 0.75); g.lineWidth = 8; g.strokeStyle = INK; g.lineCap = 'round'; g.stroke(); }
    // emotion marks
    if (angryE) { const vx = cx + HW * 0.55, vy = hy - HH * 0.62; g.lineWidth = 8; g.strokeStyle = red; g.lineCap = 'round'; for (const [a1, a2, dx, dy] of [[0, 1.6, -10, -10], [1.6, 3.2, 10, -10], [3.2, 4.8, 10, 10], [4.8, 6.3, -10, 10]]) { g.beginPath(); g.arc(vx + dx, vy + dy, 9, a1, a2); g.stroke(); } }
    if (E === 'nervous' || E === 'shock' || E === 'worried') { g.beginPath(); g.moveTo(cx + HW * 0.78, hy - 70); g.quadraticCurveTo(cx + HW * 0.78 + 22, hy - 32, cx + HW * 0.78, hy - 24); g.quadraticCurveTo(cx + HW * 0.78 - 22, hy - 32, cx + HW * 0.78, hy - 70); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); }
    if (exciteE) for (const [sx, sy, r] of [[-HW - 20, -HH * 0.7, 18], [HW + 16, -HH * 0.9, 14], [HW + 30, -HH * 0.2, 10]]) { g.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? r * 0.32 : r, an = k * Math.PI / 4; g.lineTo(cx + sx + rr * Math.cos(an), hy + sy + rr * Math.sin(an)); } g.closePath(); g.fillStyle = '#ffe14a'; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); }
    g.restore(); return;
  }
  for (const s of [-1, 1]) {
    const ex = cx + s * 54;
    if (blink >= 1 || expr === 'happy' || expr === 'laugh') { line(g, [[ex - 24, ey + 6], [ex, ey - 10], [ex + 24, ey + 6]], 10); continue; }
    const rx = shock ? 34 : 29, ry = shock ? 41 : 35;
    g.beginPath(); g.ellipse(ex, ey, rx, ry, 0, 0, TAU); g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
    const ix = ex + look * 8 + 2, iy = ey + 4, ir = shock ? 14 : 21;
    const gr = g.createRadialGradient(ix, iy + 8, 2, ix, iy, ir + 4); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, o.eye || '#3a6ad0'); gr.addColorStop(1, dk(o.eye || '#3a6ad0', 0.55));
    g.beginPath(); g.ellipse(ix, iy, ir, ir * 1.15, 0, 0, TAU); g.fillStyle = gr; g.fill();
    g.beginPath(); g.arc(ix, iy + 2, ir * 0.48, 0, TAU); g.fillStyle = INK; g.fill();
    g.beginPath(); g.arc(ix + 8, iy + 10, 3.5, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.85)'; g.fill(); g.beginPath(); g.arc(ix - 4, iy - 7, 6, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.save(); g.translate(ix - 4, iy - 7); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 12, 3.6, 0, 0, TAU); g.lineWidth = 2.4; g.strokeStyle = '#fff'; g.stroke(); g.restore();
    const lid = expr === 'smug' || blink > 0 ? 0.55 : expr === 'angry' ? 0.32 : shock ? 0.03 : 0.1;
    if (lid) { g.save(); g.beginPath(); g.ellipse(ex, ey, rx + 1, ry + 1, 0, 0, TAU); g.clip(); g.fillStyle = skin; g.fillRect(ex - rx - 2, ey - ry - 2, 2 * rx + 4, 2 * ry * lid); g.restore(); line(g, [[ex - rx, ey - ry + 2 * ry * lid], [ex + rx, ey - ry + 2 * ry * lid]], 8); }
    g.beginPath(); g.ellipse(ex, ey, rx, ry, 0, Math.PI * 1.08, Math.PI * 1.92); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
    if (o.lashes) for (let k = 0; k < 2; k++) line(g, [[ex + s * (rx * 0.7 + k * 7), ey - ry * 0.62 + k * 9], [ex + s * (rx * 0.7 + k * 7 + 10), ey - ry * 0.62 + k * 9 - 8]], 5);
    const by = ey - ry - 22 - (shock ? 14 : 0), inner = expr === 'angry' ? 14 : expr === 'worried' ? -12 : expr === 'smile' || expr === 'laugh' ? -4 : 0;
    { const bc = o.brow || (o.hairCol && o.hair !== 'bald' ? dk(o.hairCol, 0.8) : INK); const P0 = [ex - s * 30, by + inner], P1 = [ex, by - 12], P2 = [ex + s * 30, by - inner * 0.3];
      for (let k = 0; k < 8; k++) { const t0 = k / 8, t1 = (k + 1) / 8, q = (t) => [(1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0], (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1]]; line(g, [q(t0), q(t1)], 15 - 9 * t0, bc); } }
  }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 98, hy + 54, 27, 15, 0, 0, TAU); g.fillStyle = 'rgba(240,100,130,0.42)'; g.fill();
    if (expr === 'happy' || expr === 'laugh' || expr === 'grin') for (let k = -1; k <= 1; k++) line(g, [[cx + s * 98 + k * 12 - 4, hy + 60], [cx + s * 98 + k * 12 + 4, hy + 48]], 4, 'rgba(200,60,90,0.7)'); }
  if (o.glasses) for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * 54, hy - 6, 46, 0, TAU); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(cx + s * 54 - 14, hy - 22, 14, Math.PI, Math.PI * 1.5); g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,0.8)'; g.stroke(); if (s < 0) line(g, [[cx - 8, hy - 10], [cx + 8, hy - 10]], 7); }
  const nose = o.nose || 'button';
  if (nose === 'long') { g.beginPath(); g.moveTo(cx + 2, hy + 8); g.quadraticCurveTo(cx + 30, hy + 44, cx + 18, hy + 56); g.quadraticCurveTo(cx + 4, hy + 60, cx - 6, hy + 52); g.lineWidth = 7; g.strokeStyle = INK; g.lineCap = 'round'; g.stroke(); }
  else if (nose === 'round') cel(g, ellPath(cx + 4, hy + 38, 24, 20), dk(skin, 0.95), 7, 4, 4, false);
  else { g.beginPath(); g.ellipse(cx + 4, hy + 36, 15, 11, 0, 0.1, Math.PI - 0.1); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); }
  const my = hy + 84;
  if (o.moustache) for (const s of [-1, 1]) cel(g, ellPath(cx + s * 28, hy + 62, 32, 14, s * 0.25), o.moustache, 6, 3, 2, false);
  if (expr === 'laugh' || expr === 'grin') {
    const mw = expr === 'laugh' ? 46 : 44, mh = expr === 'laugh' ? 36 : 26;
    const mp = (h) => { h.beginPath(); h.moveTo(cx - mw, my - 18); h.quadraticCurveTo(cx, my - 2, cx + mw, my - 18); h.quadraticCurveTo(cx + mw * 0.8, my + mh, cx, my + mh + 2); h.quadraticCurveTo(cx - mw * 0.8, my + mh, cx - mw, my - 18); h.closePath(); };
    mp(g); g.fillStyle = '#5a1e30'; g.fill();
    g.save(); mp(g); g.clip(); g.fillStyle = '#ffffff'; g.fillRect(cx - 60, my - 30, 120, 22); g.fillStyle = '#e86e78'; g.beginPath(); g.ellipse(cx, my + mh, 26, 14, 0, 0, TAU); g.fill(); g.restore();
    mp(g); g.lineWidth = 7; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke();
    for (const s of [-1, 1]) line(g, [[cx + s * (mw - 4), my - 22], [cx + s * (mw + 6), my - 26]], 6); }
  else if (shock) { g.beginPath(); g.ellipse(cx, my + 4, 22, 28, 0, 0, TAU); g.fillStyle = '#5a1e30'; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.ellipse(cx, my + 18, 13, 8, 0, 0, TAU); g.fillStyle = '#e86e78'; g.fill(); }
  else if (expr === 'worried') line(g, [[cx - 32, my + 6], [cx - 14, my - 4], [cx + 4, my + 6], [cx + 22, my - 4], [cx + 34, my + 4]], 8);
  else if (expr === 'angry') { g.beginPath(); g.roundRect(cx - 36, my - 6, 72, 26, 8); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); line(g, [[cx - 36, my + 7], [cx + 36, my + 7]], 4); }
  else { g.beginPath(); g.arc(cx, my - 22, 30, Math.PI * 0.24, Math.PI * 0.76); g.lineWidth = 9; g.strokeStyle = INK; g.lineCap = 'round'; g.stroke(); }
  g.restore();
}
