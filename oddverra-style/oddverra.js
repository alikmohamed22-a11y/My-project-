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
  const armFor = (s) => mode === 'fall' ? [sh(s), [cx + s * (TW + 70), topY - 10], [cx + s * (TW + 110), topY - 90]] : (op.prop === 'stick' && s === 1) ? [sh(s), [cx + s * (TW + 70), topY + 10], [cx + s * (TW + 64), topY - 90]] : mode === 'run' ? runArm(s) : null;
  const arms = [-1, 1].map((s) => [s, armFor(s) || ((op.hip && s === -1) ? [sh(s), [cx + s * (TW + 70), topY + 120], [cx + s * (TW + 4), topY + 200]] : pose(s))]);
  const drawArm = ([s, P]) => { tube(g, P, 34, o.shirt); const h = P[2]; const c = P[1]; const ang = Math.atan2(h[1] - c[1], h[0] - c[0]);
    cel(g, ellPath(h[0] - Math.cos(ang) * 6, h[1] - Math.sin(ang) * 6, 22, 14, ang + Math.PI / 2), o.cuff || '#ffffff', 7, 4, 3, false);
    cel(g, ellPath(h[0] + Math.cos(ang) * 14, h[1] + Math.sin(ang) * 14, 26, 24), skin, 8, 6, 5, false);
    cel(g, ellPath(h[0] + Math.cos(ang) * 10 - s * 20, h[1] + Math.sin(ang) * 10 - 8, 10, 14, -s * 0.5), skin, 6, 3, 2, false); };
  for (const a of arms) if (a[1][2][1] > topY + 100) drawArm(a);
  // torso
  const torso = (g) => { g.beginPath(); g.moveTo(cx - TW * 0.82, topY); g.bezierCurveTo(cx - TW * 1.35, topY + torsoH * 0.45, cx - TW * 1.4, hipY + 30, cx - TW * 0.4, hipY + 30); g.lineTo(cx + TW * 0.4, hipY + 30); g.bezierCurveTo(cx + TW * 1.4, hipY + 30, cx + TW * 1.35, topY + torsoH * 0.45, cx + TW * 0.82, topY); g.quadraticCurveTo(cx, topY - 26, cx - TW * 0.82, topY); g.closePath(); };
  cel(g, torso, o.shirt, 11, 22, 10);
  g.save(); torso(g); g.clip();
  if (o.stripe) { g.fillStyle = o.stripe; for (let y = topY + 80; y < hipY + 40; y += 64) g.fillRect(0, y, 600, 22); }
  if (o.belt) { g.fillStyle = o.belt; g.fillRect(0, hipY - 30, 600, 26); g.fillStyle = '#e8c45a'; g.fillRect(cx - 16, hipY - 32, 32, 30); }
  if (o.vest) { g.fillStyle = o.vest; g.beginPath(); g.moveTo(cx - TW * 1.4, topY); g.lineTo(cx - 26, topY + 40); g.lineTo(cx - 20, hipY + 40); g.lineTo(cx - TW * 1.5, hipY + 40); g.fill(); g.beginPath(); g.moveTo(cx + TW * 1.4, topY); g.lineTo(cx + 26, topY + 40); g.lineTo(cx + 20, hipY + 40); g.lineTo(cx + TW * 1.5, hipY + 40); g.fill(); }
  g.restore(); torso(g); g.lineWidth = 11; g.strokeStyle = INK; g.stroke();
  if (!o.bib && !o.noButtons) for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(cx, topY + 90 + i * 60, 8, 0, TAU); g.fillStyle = o.button || dk(o.shirt, 0.6); g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); }
  if (o.bib) { g.beginPath(); g.roundRect(cx - 54, topY + 110, 108, 82, 10); g.fillStyle = '#fffdf6'; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.fillStyle = INK; g.font = 'bold 58px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.bib, cx, topY + 153); }
  g.beginPath(); g.moveTo(cx - 58, topY + 2); g.lineTo(cx, topY + 56); g.lineTo(cx + 58, topY + 2); g.fillStyle = o.collar || '#ffffff'; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke();
  if (o.neck === 'tie') cel(g, (h) => { h.beginPath(); h.moveTo(cx - 14, topY + 40); h.lineTo(cx + 14, topY + 40); h.lineTo(cx + 22, topY + 150); h.lineTo(cx, topY + 176); h.lineTo(cx - 22, topY + 150); h.closePath(); }, o.neckCol || '#c0453a', 7, 6, 4, false);
  if (o.neck === 'bow') { for (const s of [-1, 1]) cel(g, (h) => { h.beginPath(); h.moveTo(cx, topY + 40); h.lineTo(cx + s * 44, topY + 20); h.lineTo(cx + s * 44, topY + 66); h.closePath(); }, o.neckCol || '#c0453a', 7, 4, 3, false); cel(g, ellPath(cx, topY + 43, 12, 14), dk(o.neckCol || '#c0453a', 0.85), 6, 2, 2, false); }
  if (o.neck === 'scarf') { cel(g, ellPath(cx, topY + 22, TW * 0.95, 34), o.neckCol || '#d9a441', 9, 8, 6, false); cel(g, (h) => { h.beginPath(); h.roundRect(cx + 30, topY + 30, 40, 120, 12); }, o.neckCol || '#d9a441', 8, 6, 4, false); }
  if (o.pocket) { g.beginPath(); g.roundRect(cx + TW * 0.35, topY + 70, 46, 40, 6); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.fillStyle = o.pocket; g.fillRect(cx + TW * 0.35 + 8, topY + 62, 12, 14); }
  for (const a of arms) if (a[1][2][1] <= topY + 100) drawArm(a);
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
    g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,0.16)'; g.beginPath(); g.ellipse(cx - HW * 0.35, hy - HH * 0.82, HW * 0.35, 16, -0.3, 0, TAU); g.fill(); g.restore();
    head(g); g.lineWidth = 12; g.strokeStyle = INK; g.stroke();
  }
  if (o.hair === 'bald') { g.save(); head(g); g.clip(); g.fillStyle = o.hairCol; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * HW * 0.95, hy - 10, 40, 60, 0, 0, TAU); g.fill(); } g.restore(); head(g); g.lineWidth = 12; g.strokeStyle = INK; g.stroke(); }
  if (o.hat === 'top') { cel(g, (h) => { h.beginPath(); h.roundRect(cx - 82, hy - HH - 170, 164, 190, 12); }, o.hatCol || '#2a2630', 10); g.fillStyle = '#c0453a'; g.fillRect(cx - 78, hy - HH - 18, 156, 28); cel(g, ellPath(cx, hy - HH + 14, HW + 8, 24), o.hatCol || '#2a2630', 10, 6, 4, false); }
  if (o.hat === 'cap') { cel(g, (h) => { h.beginPath(); h.ellipse(cx, hy - HH * 0.62, HW + 6, 74, 0, Math.PI, TAU); h.closePath(); }, o.hatCol, 10); cel(g, ellPath(cx + 78, hy - HH * 0.6, 100, 22), dk(o.hatCol, 0.8), 9, 4, 3, false); }
  if (o.hat === 'bowler') { cel(g, (h) => { h.beginPath(); h.ellipse(cx, hy - HH * 0.66, HW * 0.78, 100, 0, Math.PI, TAU); h.closePath(); }, '#2a2630', 10); cel(g, ellPath(cx, hy - HH * 0.66, HW + 20, 20), '#2a2630', 9, 4, 3, false); }
  // face
  const ey = hy + 2, shock = expr === 'shock';
  const FACE = op.face || 'bean';
  if (FACE) {
    for (const s of [-1, 1]) {
      const ex = cx + s * (FACE === 'chibi' ? 58 : 50), ey2 = hy + (FACE === 'chibi' ? 8 : 4);
      const closed = (blink >= 1 && expr !== 'dazed') || expr === 'happy' || expr === 'laugh';
      if (expr === 'pained') { line(g, [[ex - s * 20, ey2 - 12], [ex + s * 14, ey2], [ex - s * 20, ey2 + 12]], 9); }
      else if (expr === 'dazed') { g.beginPath(); for (let a = 0; a < 15; a += 0.3) { const r = a * 1.6; g.lineTo(ex + r * Math.cos(a * s), ey2 + r * Math.sin(a * s)); } g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
      else if (closed) { line(g, [[ex - 20, ey2 + 4], [ex, ey2 - 10], [ex + 20, ey2 + 4]], 10); }
      else if (FACE === 'bean') { const ry = shock ? 32 : 26; g.beginPath(); g.ellipse(ex, ey2, 17, ry, 0, 0, TAU); g.fillStyle = INK; g.fill();
        g.beginPath(); g.arc(ex - 5, ey2 - 9, 5.5, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.save(); g.translate(ex - 5, ey2 - 9); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 11, 3.2, 0, 0, TAU); g.lineWidth = 2.2; g.strokeStyle = '#fff'; g.stroke(); g.restore(); }
      else if (FACE === 'chibi') { const ry = shock ? 38 : 32; g.beginPath(); g.ellipse(ex, ey2, 24, ry, 0, 0, TAU); g.fillStyle = INK; g.fill();
        const gr = g.createLinearGradient(0, ey2, 0, ey2 + ry); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, o.eye || '#3a6ad0'); g.beginPath(); g.ellipse(ex, ey2 + 6, 18, ry - 8, 0, 0, TAU); g.fillStyle = gr; g.fill();
        g.beginPath(); g.arc(ex - 7, ey2 - 12, 8, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(ex + 7, ey2 + 12, 4, 0, TAU); g.fill(); g.save(); g.translate(ex - 7, ey2 - 12); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 15, 4, 0, 0, TAU); g.lineWidth = 2.6; g.strokeStyle = '#fff'; g.stroke(); g.restore(); }
      else if (FACE === 'soft') { g.save(); g.beginPath(); g.ellipse(ex, ey2, 26, 22, 0, 0, TAU); g.clip(); g.fillStyle = '#fff'; g.fillRect(ex - 30, ey2 - 30, 60, 60); g.beginPath(); g.arc(ex + 2, ey2 + 4, 17, 0, TAU); g.fillStyle = INK; g.fill(); g.beginPath(); g.arc(ex - 4, ey2 - 2, 5, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
        g.beginPath(); g.ellipse(ex, ey2, 26, 22, 0, Math.PI, TAU); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.ellipse(ex, ey2, 26, 22, 0, 0, Math.PI); g.lineWidth = 4; g.stroke(); }
      else if (FACE === 'dot') { g.beginPath(); g.arc(ex, ey2, shock ? 15 : 12, 0, TAU); g.fillStyle = INK; g.fill(); g.beginPath(); g.arc(ex - 3, ey2 - 4, 3.5, 0, TAU); g.fillStyle = '#fff'; g.fill(); }
      const by = ey2 - (FACE === 'chibi' ? 50 : 44) - (shock ? 10 : 0), inner = expr === 'angry' ? 12 : expr === 'worried' ? -10 : 0;
      line(g, [[ex - s * 18, by + inner], [ex + s * 18, by - inner * 0.3]], 10, o.hairCol && o.hair !== 'bald' ? dk(o.hairCol, 0.8) : INK);
    }
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 96, hy + 50, 24, 13, 0, 0, TAU); g.fillStyle = 'rgba(240,100,130,0.38)'; g.fill(); }
    if (o.glasses) for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * 52, hy + 4, 40, 0, TAU); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); if (s < 0) line(g, [[cx - 12, hy], [cx + 12, hy]], 7); }
    if (o.moustache) for (const s of [-1, 1]) cel(g, ellPath(cx + s * 26, hy + 56, 28, 12, s * 0.25), o.moustache, 6, 3, 2, false);
    const my2 = hy + 66;
    if (expr === 'worried' || expr === 'nervous' || expr === 'shock') { g.beginPath(); g.moveTo(cx + HW * 0.78, hy - 70); g.quadraticCurveTo(cx + HW * 0.78 + 20, hy - 34, cx + HW * 0.78, hy - 28); g.quadraticCurveTo(cx + HW * 0.78 - 20, hy - 34, cx + HW * 0.78, hy - 70); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); }
    g.beginPath(); g.ellipse(cx + 3, hy + 30, 10, 7, 0, 0.2, Math.PI - 0.2); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
    if (expr === 'laugh' || expr === 'grin') { g.beginPath(); g.moveTo(cx - 24, my2); g.quadraticCurveTo(cx, my2 + 6, cx + 24, my2); g.quadraticCurveTo(cx + 20, my2 + 30, cx, my2 + 30); g.quadraticCurveTo(cx - 20, my2 + 30, cx - 24, my2); g.closePath(); g.fillStyle = '#5a1e30'; g.fill(); g.save(); g.clip(); g.fillStyle = '#e86e78'; g.beginPath(); g.ellipse(cx, my2 + 28, 14, 9, 0, 0, TAU); g.fill(); g.restore(); g.beginPath(); g.moveTo(cx - 24, my2); g.quadraticCurveTo(cx, my2 + 6, cx + 24, my2); g.quadraticCurveTo(cx + 20, my2 + 30, cx, my2 + 30); g.quadraticCurveTo(cx - 20, my2 + 30, cx - 24, my2); g.closePath(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
    else if (expr === 'whistle') { g.beginPath(); g.ellipse(cx + 4, my2 + 6, 9, 10, 0, 0, TAU); g.fillStyle = '#5a1e30'; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
    else if (expr === 'pained') { g.beginPath(); g.roundRect(cx - 26, my2 - 2, 52, 20, 7); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); line(g, [[cx - 26, my2 + 8], [cx + 26, my2 + 8]], 3); }
    else if (expr === 'dazed') { line(g, [[cx - 22, my2 + 4], [cx - 8, my2 - 4], [cx + 6, my2 + 4], [cx + 20, my2 - 4]], 6); }
    else if (shock) { g.beginPath(); g.ellipse(cx, my2 + 8, 13, 17, 0, 0, TAU); g.fillStyle = '#5a1e30'; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
    else if (expr === 'worried' || expr === 'angry' || expr === 'nervous') { g.beginPath(); g.arc(cx, my2 + 22, 18, Math.PI * 1.2, Math.PI * 1.8); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); }
    else { g.beginPath(); g.arc(cx, my2 - 8, 20, Math.PI * 0.25, Math.PI * 0.75); g.lineWidth = 7; g.strokeStyle = INK; g.lineCap = 'round'; g.stroke(); }
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
