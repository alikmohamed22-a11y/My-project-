// Ep6 props (flat style: #1c1530 ink, one hard shadow tone). All brand / device / app names are invented.
// miniChef (crew heads with toques), bloop (the invented "Bloop" smart speaker), pastaBox ("Nonna Pina" spaghetti), spaghetti bundle,
// pasta plate (video thumbnail / demo), noodle brick (pot-shaped cylinder of over-boiled spaghetti), wall clock (time-lapse), crew table.
import { W, H, INK, clamp, lerp, rect, circ, ell, poly, line, P, clipTo, halftone, txt, glow, shadeCol, hash, castShadow } from './bgkit.js';
import { eBack, eOut } from './util.js';
const TAU = Math.PI * 2;

/* ---------------- crew: a little chef head with a toque ---------------- */
const SKINS = [['#f0c8a8', '#d29f80'], ['#c98a5e', '#a56a44'], ['#9a6141', '#7a4a30'], ['#7f5137', '#643d29'], ['#e8b48c', '#c98e66'], ['#5e3a26', '#47291a']];
const HAIRS = ['#241a22', '#5a3a24', '#c9842f', '#1c1530', '#8a4a2a', '#3a2a3a'];
// (x,y) = face centre, r = face radius. o.mouth 0..1 open (hungry), o.look [-1..1], o.bow 0..1 (bows forward), o.happy
export function miniChef(ctx, x, y, r, { seed = 1, mouth = 0, look = 0, bow = 0, happy = 0, t = 0, scarf = null } = {}) {
  const sk = SKINS[Math.floor(hash(seed * 3.3) * SKINS.length)], hc = HAIRS[Math.floor(hash(seed * 5.1) * HAIRS.length)];
  const lw = Math.max(4, r * 0.075);
  ctx.save(); ctx.translate(x, y); ctx.rotate(bow * 0.5);
  // shoulders / jacket
  P(ctx, (c) => { c.moveTo(-r * 1.15, r * 2.2); c.quadraticCurveTo(-r * 1.1, r * 1.05, 0, r * 1.0); c.quadraticCurveTo(r * 1.1, r * 1.05, r * 1.15, r * 2.2); c.closePath(); }, '#fbfaf6', lw);
  clipTo(ctx, (c) => { c.moveTo(-r * 1.15, r * 2.2); c.quadraticCurveTo(-r * 1.1, r * 1.05, 0, r * 1.0); c.quadraticCurveTo(r * 1.1, r * 1.05, r * 1.15, r * 2.2); c.closePath(); }, () => { ctx.fillStyle = '#d8d5cd'; ctx.fillRect(r * 0.45, r * 0.9, r, r * 1.4); });
  P(ctx, (c) => { c.moveTo(-r * 0.4, r * 1.0); c.lineTo(0, r * 1.35); c.lineTo(r * 0.4, r * 1.0); c.closePath(); }, scarf || ['#d8332f', '#2b9c8f', '#f2b52b', '#7457c4'][seed % 4], lw * 0.8);
  circ(ctx, -r * 0.2, r * 1.6, r * 0.08, '#2c2742', 0); circ(ctx, r * 0.2, r * 1.6, r * 0.08, '#2c2742', 0); circ(ctx, -r * 0.2, r * 1.95, r * 0.08, '#2c2742', 0); circ(ctx, r * 0.2, r * 1.95, r * 0.08, '#2c2742', 0);
  // ears + face
  circ(ctx, -r * 0.98, r * 0.1, r * 0.2, sk[0], lw); circ(ctx, r * 0.98, r * 0.1, r * 0.2, sk[0], lw);
  P(ctx, (c) => c.ellipse(0, 0, r, r * 1.04, 0, 0, TAU), sk[0], lw);
  clipTo(ctx, (c) => c.ellipse(0, 0, r, r * 1.04, 0, 0, TAU), () => { ctx.fillStyle = sk[1]; ctx.beginPath(); ctx.ellipse(r * 0.55, r * 0.15, r * 0.6, r * 1.2, 0, 0, TAU); ctx.fill(); ctx.fillStyle = hc; ctx.fillRect(-r, -r * 1.1, 2 * r, r * 0.55); });
  P(ctx, (c) => c.ellipse(0, 0, r, r * 1.04, 0, 0, TAU), null, lw);
  // eyes + brows
  const ey = -r * 0.12, ex = r * 0.36, lx = look * r * 0.08;
  if (happy > 0.5) { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineCap = 'round'; [-1, 1].forEach((s) => { ctx.beginPath(); ctx.arc(s * ex, ey + r * 0.05, r * 0.15, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }); }
  else [-1, 1].forEach((s) => { P(ctx, (c) => c.ellipse(s * ex, ey, r * 0.2, r * 0.25, 0, 0, TAU), '#fff', lw * 0.8); circ(ctx, s * ex + lx, ey + r * 0.03, r * 0.1, INK, 0); circ(ctx, s * ex + lx + r * 0.04, ey - r * 0.03, r * 0.035, '#fff', 0); });
  ctx.lineCap = 'round'; ctx.lineWidth = lw * 1.1; ctx.strokeStyle = INK;
  [-1, 1].forEach((s) => { ctx.beginPath(); ctx.moveTo(s * (ex - r * 0.2), ey - r * 0.36 - mouth * r * 0.08); ctx.lineTo(s * (ex + r * 0.16), ey - r * 0.4 - mouth * r * 0.14 + (happy ? -r * 0.06 : 0)); ctx.stroke(); });
  // mouth
  const my = r * 0.48;
  if (mouth > 0.05) { P(ctx, (c) => c.ellipse(0, my, r * (0.22 + 0.08 * mouth), r * 0.26 * mouth + r * 0.05, 0, 0, TAU), '#7a2a3a', lw * 0.8); clipTo(ctx, (c) => c.ellipse(0, my, r * (0.22 + 0.08 * mouth), r * 0.26 * mouth + r * 0.05, 0, 0, TAU), () => { circ(ctx, 0, my + r * 0.22 * mouth, r * 0.16, '#e86a7a', 0); }); }
  else { ctx.beginPath(); ctx.arc(0, my - r * 0.12, r * 0.24, 0.25 * Math.PI, 0.75 * Math.PI); ctx.lineWidth = lw; ctx.stroke(); }
  // toque
  const ty = -r * 0.82;
  P(ctx, (c) => c.roundRect(-r * 0.78, ty - r * 0.34, r * 1.56, r * 0.42, r * 0.08), '#fbfaf6', lw);
  P(ctx, (c) => { c.moveTo(-r * 0.74, ty - r * 0.3); c.bezierCurveTo(-r * 1.3, ty - r * 0.6, -r * 1.05, ty - r * 1.45, -r * 0.45, ty - r * 1.2); c.bezierCurveTo(-r * 0.3, ty - r * 1.75, r * 0.4, ty - r * 1.75, r * 0.45, ty - r * 1.2); c.bezierCurveTo(r * 1.05, ty - r * 1.45, r * 1.3, ty - r * 0.6, r * 0.74, ty - r * 0.3); c.closePath(); }, '#fbfaf6', lw);
  clipTo(ctx, (c) => { c.moveTo(-r * 0.74, ty - r * 0.3); c.bezierCurveTo(-r * 1.3, ty - r * 0.6, -r * 1.05, ty - r * 1.45, -r * 0.45, ty - r * 1.2); c.bezierCurveTo(-r * 0.3, ty - r * 1.75, r * 0.4, ty - r * 1.75, r * 0.45, ty - r * 1.2); c.bezierCurveTo(r * 1.05, ty - r * 1.45, r * 1.3, ty - r * 0.6, r * 0.74, ty - r * 0.3); c.closePath(); }, () => { ctx.fillStyle = '#d8d5cd'; ctx.beginPath(); ctx.ellipse(r * 0.75, ty - r * 0.7, r * 0.5, r * 0.9, 0, 0, TAU); ctx.fill(); });
  line(ctx, -r * 0.2, ty - r * 0.36, -r * 0.3, ty - r * 0.9, lw * 0.6); line(ctx, r * 0.25, ty - r * 0.36, r * 0.3, ty - r * 0.95, lw * 0.6);
  ctx.restore();
}
// a hungry crew: rows of mini chefs (k 0..1 = how many have popped in), mouths open, staring at camera
export function crew(ctx, { n = 20, k = 1, cols = 5, x0 = 130, y0 = 640, dx = 205, dy = 250, r = 70, mouth = 0, t = 0, look = 0 } = {}) {
  const rows = Math.ceil(n / cols);
  for (let row = rows - 1; row >= 0; row--) for (let c = 0; c < cols; c++) {
    const i = row * cols + c; if (i >= n) continue;
    const ki = clamp(k * n - i); if (ki <= 0) continue;
    const s = eBack(ki), bob = Math.sin(t * 7 + i * 1.7) * r * 0.05;
    const x = x0 + c * dx + (row % 2) * dx * 0.12 - dx * 0.06, y = y0 + row * dy + bob;
    ctx.save(); ctx.translate(x, y + r * 2); ctx.scale(s, s); ctx.translate(-x, -y - r * 2);
    miniChef(ctx, x, y, r * (0.92 + 0.16 * hash(i * 2.2)), { seed: i + 3, mouth: mouth * (0.6 + 0.4 * Math.abs(Math.sin(t * 9 + i))), look: look || (hash(i) - 0.5) });
    ctx.restore();
  }
}

/* ---------------- the "Bloop" smart speaker ---------------- */
// (x,y) = bottom centre. ring 0..1 light ring brightness, col ring colour, talk 0..1 (pulsing), squash for a slap
export function bloop(ctx, x, y, s = 1, { ring = 0, col = '#4fc3f7', t = 0, talk = 0, squash = 0, label = true } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 + squash * 0.25), s * (1 - squash * 0.3));
  const w = 150, h = 210, ry = 34;
  castShadow(ctx, (c) => c.ellipse(16, 0, w + 20, 22, 0, 0, TAU), 0, 0, 'rgba(14,8,30,0.3)');
  if (ring > 0) glow(ctx, 0, -h, 260 + 40 * talk * Math.sin(t * 14), col, 0.5 * ring);
  // body (fabric cylinder)
  P(ctx, (c) => { c.moveTo(-w, -h); c.lineTo(-w, -24); c.quadraticCurveTo(-w, 0, -w + 30, 0); c.lineTo(w - 30, 0); c.quadraticCurveTo(w, 0, w, -24); c.lineTo(w, -h); c.ellipse(0, -h, w, ry, 0, 0, Math.PI); c.closePath(); }, '#ff8a6a', 7);
  clipTo(ctx, (c) => { c.moveTo(-w, -h); c.lineTo(-w, -24); c.quadraticCurveTo(-w, 0, -w + 30, 0); c.lineTo(w - 30, 0); c.quadraticCurveTo(w, 0, w, -24); c.lineTo(w, -h); c.ellipse(0, -h, w, ry, 0, 0, Math.PI); c.closePath(); }, () => {
    ctx.fillStyle = '#e06a4c'; ctx.fillRect(w * 0.35, -h - 40, w, h + 60);
    halftone(ctx, -w, -h, 2 * w, h, 'rgba(120,40,30,0.35)', 16, 3.2, 'down');
    if (label) txt(ctx, 'bloop', 0, -h * 0.42, { font: 'Luckiest', weight: 400, size: 44, col: '#fff3e8' });
  });
  P(ctx, (c) => { c.moveTo(-w, -h); c.lineTo(-w, -24); c.quadraticCurveTo(-w, 0, -w + 30, 0); c.lineTo(w - 30, 0); c.quadraticCurveTo(w, 0, w, -24); c.lineTo(w, -h); }, null, 7);
  // top + light ring
  P(ctx, (c) => c.ellipse(0, -h, w, ry, 0, 0, TAU), '#3a3546', 7);
  const rc = ring > 0 ? col : '#5a5468';
  ctx.save(); ctx.lineWidth = 16; ctx.strokeStyle = rc; ctx.globalAlpha = 0.35 + 0.65 * clamp(ring);
  ctx.beginPath(); ctx.ellipse(0, -h, w - 22, ry - 9, 0, 0, TAU); ctx.stroke(); ctx.restore();
  if (ring > 0) for (let i = 0; i < 6; i++) { const a = t * 6 + i * TAU / 6; const k = 0.5 + 0.5 * Math.sin(a * 2 + t * 10 * talk); circ(ctx, Math.cos(a) * (w - 22), -h + Math.sin(a) * (ry - 9), 7 + 5 * k, '#fff', 0); }
  P(ctx, (c) => c.ellipse(0, -h, w * 0.5, ry * 0.42, 0, 0, TAU), '#2a2533', 4);
  // little face: two dot eyes on the body
  circ(ctx, -38, -h * 0.68, 9, INK, 0); circ(ctx, 38, -h * 0.68, 9, INK, 0);
  ctx.restore();
}
// sound waves coming out of the speaker
export function waves(ctx, x, y, t, { n = 3, r0 = 60, dir = 1, col = '#fff', lw = 9, a = 1 } = {}) {
  ctx.save(); ctx.lineCap = 'round'; ctx.globalAlpha = a;
  for (let i = 0; i < n; i++) { const ph = (t * 1.6 + i / n) % 1, r = r0 + ph * 120; ctx.globalAlpha = a * (1 - ph); ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(x, y, r, dir > 0 ? -0.6 : Math.PI - 0.6, dir > 0 ? 0.6 : Math.PI + 0.6); ctx.stroke(); }
  ctx.restore();
}

/* ---------------- pasta ---------------- */
const NOODLE = '#f3d58a', NOODLE_S = '#d9b25e', NOODLE_D = '#b98f3e';
// box of spaghetti ("Nonna Pina", invented). (x,y) = centre. open 0..1 (top flap), tug 0..1 (crumpled)
export function pastaBox(ctx, x, y, s = 1, rot = 0, { open = 0, tug = 0, empty = false } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const w = 120, h = 330;
  castShadow(ctx, (c) => c.roundRect(-w + 16, -h + 16, 2 * w, 2 * h, 10), 0, 0, 'rgba(14,8,30,0.25)');
  if (open > 0 && !empty) for (let i = 0; i < 9; i++) line(ctx, -w + 30 + i * 22, -h + 10, -w + 28 + i * 22 + (i - 4) * 3, -h - 80 * open, 9, NOODLE_S);
  P(ctx, (c) => c.roundRect(-w, -h, 2 * w, 2 * h, 10), '#2d6fd6', 7);
  clipTo(ctx, (c) => c.roundRect(-w, -h, 2 * w, 2 * h, 10), () => {
    ctx.fillStyle = '#2459b3'; ctx.fillRect(w * 0.45, -h, w, 2 * h);
    ctx.fillStyle = '#fff4dc'; ctx.fillRect(-w, -h + 70, 2 * w, 120);
    txt(ctx, 'Nonna Pina', 0, -h + 104, { font: 'Luckiest', weight: 400, size: 40, col: '#d8332f' });
    txt(ctx, 'SPAGHETTI', 0, -h + 156, { font: 'Anton', weight: 400, size: 46, col: '#2459b3' });
    // window with noodles
    P(ctx, (c) => c.roundRect(-w * 0.6, -h + 230, w * 1.2, 300, 40), empty ? '#cfe2f7' : '#fbe7b0', 6);
    if (!empty) for (let i = 0; i < 7; i++) line(ctx, -w * 0.5 + i * 14, -h + 240, -w * 0.5 + i * 14, -h + 520, 4, NOODLE_D);
    halftone(ctx, -w, h - 120, 2 * w, 120, 'rgba(0,0,0,0.18)', 14, 3, 'down');
    txt(ctx, '500 g · cooks in 9 min', 0, h - 50, { font: 'Inter', weight: 700, size: 20, col: '#fff' });
  });
  // top flap
  if (open > 0) P(ctx, (c) => { c.moveTo(-w, -h); c.lineTo(w, -h); c.lineTo(w - 10, -h - 90 * open); c.lineTo(-w + 20, -h - 60 * open); c.closePath(); }, '#2459b3', 6);
  if (tug > 0) { ctx.strokeStyle = 'rgba(28,21,48,0.6)'; ctx.lineWidth = 5; ctx.beginPath(); for (let i = 0; i < 4; i++) { ctx.moveTo(-w + 10, -h + 60 + i * 140 * tug); ctx.lineTo(-w + 50, -h + 90 + i * 140 * tug); } ctx.stroke(); }
  ctx.restore();
}
// dry spaghetti bundle (x,y) = centre, len, rot
export function spaghetti(ctx, x, y, len = 600, rot = 0, n = 26) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  for (let i = 0; i < n; i++) { const dx = (hash(i * 2.3) - 0.5) * 70, a = (hash(i * 4.1) - 0.5) * 0.12; ctx.save(); ctx.rotate(a); line(ctx, dx, -len / 2, dx, len / 2, 10, INK); line(ctx, dx, -len / 2 + 3, dx, len / 2 - 3, 5, i % 3 ? NOODLE : NOODLE_S); ctx.restore(); }
  ctx.restore();
}
// finished plate of spaghetti with sauce + basil: (x,y) centre
export function pastaPlate(ctx, x, y, s = 1, { t = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  castShadow(ctx, (c) => c.ellipse(18, 22, 300, 110, 0, 0, TAU));
  P(ctx, (c) => c.ellipse(0, 0, 300, 110, 0, 0, TAU), '#fbfaf6', 7); P(ctx, (c) => c.ellipse(0, -4, 210, 72, 0, 0, TAU), '#eef0f3', 4);
  // noodle nest
  P(ctx, (c) => c.ellipse(0, -30, 170, 72, 0, 0, TAU), NOODLE, 7);
  clipTo(ctx, (c) => c.ellipse(0, -30, 170, 72, 0, 0, TAU), () => { ctx.fillStyle = NOODLE_S; ctx.beginPath(); ctx.ellipse(70, -10, 130, 70, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = NOODLE_D; ctx.lineWidth = 4; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(0, -30, 30 + i * 17, 12 + i * 7, 0.1 * i, 0.3, 2.6 + i * 0.3); ctx.stroke(); } });
  P(ctx, (c) => { c.ellipse(-6, -58, 92, 38, 0, 0, TAU); }, '#d8332f', 6);
  clipTo(ctx, (c) => c.ellipse(-6, -58, 92, 38, 0, 0, TAU), () => { ctx.fillStyle = '#a92322'; ctx.beginPath(); ctx.ellipse(40, -44, 70, 30, 0, 0, TAU); ctx.fill(); circ(ctx, -40, -66, 9, '#ff7a6a', 0); circ(ctx, 6, -74, 6, '#ff7a6a', 0); });
  P(ctx, (c) => { c.moveTo(10, -80); c.quadraticCurveTo(60, -130, 90, -96); c.quadraticCurveTo(50, -70, 10, -80); }, '#3aa060', 5);
  P(ctx, (c) => { c.moveTo(10, -80); c.quadraticCurveTo(-30, -136, -66, -104); c.quadraticCurveTo(-24, -74, 10, -80); }, '#4cb873', 5);
  ctx.restore();
}
// the noodle brick: a solid pot-shaped cylinder of over-boiled spaghetti. (x,y) = bottom centre. cracks 0..1, wob (jelly wobble)
export function noodleBrick(ctx, x, y, s = 1, { rot = 0, wob = 0, t = 0, steam = 0, knock = 0, fork = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * (1 + wob * 0.04 * Math.sin(t * 30)), s * (1 - wob * 0.04 * Math.sin(t * 30)));
  const w = 170, h = 230, ry = 46;
  castShadow(ctx, (c) => c.ellipse(24, 4, w + 20, 30, 0, 0, TAU), 0, 0, 'rgba(14,8,30,0.32)');
  const body = (c) => { c.moveTo(-w, -h); c.lineTo(-w + 8, -10); c.quadraticCurveTo(-w + 12, 6, -w + 40, 8); c.lineTo(w - 40, 8); c.quadraticCurveTo(w - 12, 6, w - 8, -10); c.lineTo(w, -h); c.ellipse(0, -h, w, ry, 0, 0, Math.PI); c.closePath(); };
  P(ctx, body, NOODLE, 7);
  clipTo(ctx, body, () => {
    ctx.fillStyle = NOODLE_S; ctx.fillRect(w * 0.4, -h - 60, w, h + 80);
    // squished noodle lines wrapping around
    ctx.strokeStyle = NOODLE_D; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 14; i++) { const yy = -h + 22 + i * 16; ctx.beginPath(); for (let k = 0; k <= 16; k++) { const xx = -w + k * (2 * w / 16), wv = Math.sin(k * 1.3 + i * 2.1) * 5; k ? ctx.lineTo(xx, yy + wv + Math.sin(xx / w * Math.PI / 2) * 8) : ctx.moveTo(xx, yy + wv); } ctx.stroke(); }
    // pot ridges (it took the shape of the pot)
    ctx.strokeStyle = 'rgba(140,100,40,0.55)'; ctx.lineWidth = 9; [0.32, 0.7].forEach((k) => { ctx.beginPath(); ctx.ellipse(0, -h * (1 - k), w, ry * 0.7, 0, 0.05, Math.PI - 0.05); ctx.stroke(); });
    halftone(ctx, -w, -h * 0.5, 2 * w, h * 0.6, 'rgba(150,100,30,0.25)', 16, 3.5, 'down');
  });
  P(ctx, (c) => c.ellipse(0, -h, w, ry, 0, 0, TAU), '#f8e2a4', 7);
  clipTo(ctx, (c) => c.ellipse(0, -h, w, ry, 0, 0, TAU), () => { ctx.strokeStyle = NOODLE_D; ctx.lineWidth = 4; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(0, -h, 20 + i * 22, 6 + i * 6, 0, 0.4 * i, 0.4 * i + 4.6); ctx.stroke(); } });
  // the noodle sticking out of the top (the one that escaped)
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(40, -h - 4); ctx.bezierCurveTo(60, -h - 90, 130, -h - 40, 110, -h - 120); ctx.stroke();
  ctx.strokeStyle = NOODLE; ctx.lineWidth = 8; ctx.stroke(); ctx.restore();
  if (fork > 0) { ctx.save(); ctx.translate(-30, -h - 6); ctx.rotate(-0.25); P(ctx, (c) => c.roundRect(-8, -230, 16, 200, 8), '#c3ccd5', 5); P(ctx, (c) => c.roundRect(-30, -40, 60, 46, 8), '#c3ccd5', 5); ctx.restore(); }
  if (steam > 0) { ctx.save(); ctx.globalAlpha = steam; for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i / 3) % 1; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); const sx = -80 + i * 80; ctx.moveTo(sx, -h - 40 - ph * 200); ctx.bezierCurveTo(sx + 30, -h - 80 - ph * 200, sx - 30, -h - 120 - ph * 200, sx, -h - 160 - ph * 200); ctx.globalAlpha = steam * (1 - ph); ctx.stroke(); } ctx.restore(); }
  ctx.restore();
}
// wall clock with spinning hands; spin = minutes elapsed (minute hand turns 2π per 60)
export function wallClock(ctx, x, y, r, mins = 0) {
  ctx.save(); ctx.translate(x, y);
  castShadow(ctx, (c) => c.arc(14, 14, r, 0, TAU));
  circ(ctx, 0, 0, r, '#ff8a3c', 9); circ(ctx, 0, 0, r * 0.84, '#fffaf0', 6);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(ctx, Math.cos(a) * r * 0.68, Math.sin(a) * r * 0.68, Math.cos(a) * r * 0.76, Math.sin(a) * r * 0.76, i % 3 ? 5 : 9); }
  const am = mins / 60 * TAU - Math.PI / 2, ah = (mins / 720 + 0.35) * TAU - Math.PI / 2;
  line(ctx, 0, 0, Math.cos(ah) * r * 0.42, Math.sin(ah) * r * 0.42, 14); line(ctx, 0, 0, Math.cos(am) * r * 0.66, Math.sin(am) * r * 0.66, 9, '#d8332f');
  circ(ctx, 0, 0, r * 0.07, INK, 0);
  ctx.restore();
}
// boiling spaghetti inside the pot (used as D.pot's inside callback): k = 0 (dry sticks) .. 1 (one swollen mass)
export function potNoodles(ctx, sy, k, t) {
  ctx.save();
  if (k < 0.5) {   // water + sticks standing up
    P(ctx, (c) => c.ellipse(0, sy + 20, 140, 40, 0, 0, TAU), '#9fd3e8', 5);
    for (let i = 0; i < 18; i++) { const dx = -100 + i * 12, a = (hash(i) - 0.5) * 0.5 + (i - 9) * 0.03 * (1 + k * 4); ctx.save(); ctx.translate(dx, sy + 20); ctx.rotate(a); line(ctx, 0, 0, 0, -330, 10); line(ctx, 0, -3, 0, -327, 5, i % 3 ? NOODLE : NOODLE_S); ctx.restore(); }
  } else {           // the swollen mass rising over the rim
    const rise = (k - 0.5) * 2;
    P(ctx, (c) => { c.moveTo(-140, sy + 30); for (let i = 0; i <= 10; i++) { const xx = -140 + i * 28; c.lineTo(xx, sy - 30 - rise * 110 - Math.sin(i * 1.3 + t * 2) * 12 - (i % 2) * 14); } c.lineTo(140, sy + 30); c.closePath(); }, NOODLE, 6);
    ctx.strokeStyle = NOODLE_D; ctx.lineWidth = 4; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(-30 + i * 14, sy - rise * 60, 40 + i * 14, 10 + i * 4, 0.3, 0.3, 2.8); ctx.stroke(); }
  }
  ctx.restore();
}
// a fist + forearm (sleeve) coming in from direction rot (0 = arm goes down from the fist); knuckles toward -y in local space
export function fist(ctx, x, y, s = 1, rot = 0, { sleeve = '#7457c4', skin = '#7f5137', skinS = '#643d29' } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(0, 600); ctx.lineWidth = 120; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 104; ctx.strokeStyle = skin; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 230); ctx.lineTo(0, 700); ctx.lineWidth = 150; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 134; ctx.strokeStyle = sleeve; ctx.stroke();
  P(ctx, (c) => c.roundRect(-74, -70, 148, 150, 46), skin, 7);
  clipTo(ctx, (c) => c.roundRect(-74, -70, 148, 150, 46), () => { ctx.fillStyle = skinS; ctx.fillRect(30, -80, 60, 170); });
  for (let i = 0; i < 3; i++) line(ctx, -40 + i * 34, -66, -40 + i * 34, -30, 5);
  P(ctx, (c) => c.roundRect(-86, -10, 60, 70, 26), skin, 6);
  ctx.restore();
}
