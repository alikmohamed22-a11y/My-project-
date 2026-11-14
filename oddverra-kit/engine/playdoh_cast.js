// [PD-cast] "Play-Doh was invented to clean your walls": outfit table (merged into ODD by main.js), props (into oddverra's HOLD),
// DOUGHY the dough-ball mascot (drawDoughy) and a cast test lineup (?pdcast=N with any set view flag, e.g. ?dhview=0&pdcast=0).
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, line, taper, smooth, ellP, limb, arcPts, mixc, lt, dk, rgba, polyPath, clamp, hsh } = OVK;
const TAU = Math.PI * 2;

// ---------- outfits (period-correct, invented people except Kay Zufall and Joe McVicker, drawn generically) ----------
export const PD_ODD = {
  PD_HOMEMAKER: { lashes: true, dress: true, pattern: 'dots', shirt: '#6a86b8', pants: '#6a86b8', collar: '#f4eee0', cuff: '#f4eee0', apron: '#f4ecd8', hair: 'curly', hairCol: '#5a3220',
    head: 'round', skin: '#f2c8a6', shoes: '#4a2a2a', earring: '#f2e6c8' },
  PD_COALMAN: { shirt: '#4a4448', pants: '#3a3640', vest: '#2a2a30', rolled: true, hat: 'cap', hatCol: '#2a2830', plainCap: true, hair: 'short', hairCol: '#2a1c16', moustache: '#2a1c16', brow: '#2a1c16',
    build: 'stout', head: 'wide', skin: '#c8a08a', nose: 'round', shoes: '#1a1418', noButtons: true, inky: true },
  PD_WORKER1: { shirt: '#e8e0cc', pants: '#3a5a8a', suspenders: '#3a5a8a', rolled: true, apron: '#d8ccb0', hat: 'cap', hatCol: '#4a5a6a', plainCap: true, hair: 'short', hairCol: '#8a5a30',
    build: 'adult', head: 'round', skin: '#f2c8a6', shoes: '#3a2a20', noButtons: true },
  PD_WORKER2: { shirt: '#b8c8d8', pants: '#4a4a52', vest: '#5a4a3a', rolled: true, hat: 'cap', hatCol: '#3a3a44', plainCap: true, hair: 'short', hairCol: '#1e1612', moustache: '#1e1612', brow: '#1e1612',
    build: 'stout', head: 'wide', skin: '#c88a62', nose: 'round', shoes: '#2a2020', noButtons: true },
  PD_OWNER: { coat: true, shirt: '#4a4e5e', pants: '#4a4e5e', collar: '#ffffff', cuff: '#4a4e5e', neck: 'tie', neckCol: '#8a2a2e', tieK: 0.8, button: '#2a2a34',
    hair: 'side', hairCol: '#4a3020', brow: '#4a3020', build: 'thin', head: 'egg', skin: '#f2c8a4', shoes: '#1e1a1e' },
  PD_KAY: { lashes: true, dress: true, cardigan: true, shirt: '#d86a6a', pants: '#d86a6a', collar: '#f8f2e4', cuff: '#e88a7a', button: '#f8f2e4', hair: 'curly', hairCol: '#7a4a2a',
    head: 'egg', skin: '#f6d0b0', shoes: '#5a2a2a', earring: '#f8f2e8' },
  PD_MOM50: { lashes: true, dress: true, pattern: 'dots', shirt: '#4ab0a8', pants: '#4ab0a8', collar: '#ffffff', cuff: '#ffffff', apron: '#f8e8f0', hair: 'curly', hairCol: '#d8a040',
    head: 'round', skin: '#f6d0b0', shoes: '#c83a3a', earring: '#f8f2e8' },
  PD_KID1: { lashes: true, dress: true, short: true, shirt: '#e86a8a', pants: '#e86a8a', collar: '#ffffff', hair: 'bun', hairCol: '#c88a40', build: 'kid', head: 'round', skin: '#ffe0c4', shoes: '#7a2a3a' },
  PD_KID2: { pattern: 'plaid', shirt: '#3a7ad8', pants: '#5a4a3a', hair: 'short', hairCol: '#2a1a12', build: 'kid', head: 'round', skin: '#c98a5e', shoes: '#3a2a20', noButtons: true },
  PD_KID3: { shirt: '#f0c040', pants: '#3a5a8a', suspenders: '#3a5a8a', hair: 'curly', hairCol: '#5a2a18', build: 'kid', head: 'round', skin: '#f6d0b0', shoes: '#3a2a20', noButtons: true },
  PD_KID4: { lashes: true, dress: true, short: true, shirt: '#6ac07a', pants: '#6ac07a', collar: '#ffffff', hair: 'long', hairCol: '#1a1210', build: 'kid', head: 'round', skin: '#8a5a3e', shoes: '#2a2a4a' },
  PD_MODERN_KID: { hoodie: true, shirt: '#f08a3a', pants: '#3a4a7a', cuff: '#f08a3a', hair: 'curly', hairCol: '#2a1a14', build: 'kid', head: 'round', skin: '#e8b48a', shoes: '#f2f2f2', noButtons: true, sneakers: true },
};
// per-actor options main.js passes to oddverra (c2opts, on top of libOpts + kchOpts)
const PD_OPS = ['sooty', 'dcol', 'suds', 'shapeK', 'big', 'spin'];
export const pdOpts = (op) => { const r = {}; for (const k of PD_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props ----------
export const DCOL = { white: '#f0e8d4', red: '#e8402e', yellow: '#f6c624', blue: '#3a72e0', green: '#4ab05a' };
const dc = (c) => DCOL[c] || c || DCOL.white;
function sootUnused(g, P, k, seed = 3) { if (!k) return; g.save(); g.clip(P); const b = P; for (let i = 0; i < 9; i++) { const a = hsh(i, seed) * TAU, d = 0.2 + hsh(i, seed + 1) * 0.7; g.beginPath(); g.globalAlpha = k * (0.35 + 0.4 * hsh(i, seed + 2)); g.fillStyle = '#2a2430'; g.arc(Math.cos(a) * 60 * d, Math.sin(a) * 60 * d, 12 + 26 * hsh(i, seed + 3), 0, TAU); g.fill(); } g.globalAlpha = 1; g.restore(); }
// a dough ball: centre (x, y) radius r; o.col, o.sooty 0..1, o.squash 0..1
export function doughAt(g, x, y, r, o = {}) { g.save(); g.translate(x, y); const sq = o.squash || 0; g.scale(1 + sq * 0.5, 1 - sq * 0.45);
  const pts = []; for (let i = 0; i < 26; i++) { const a = TAU * i / 26, w = 1 + 0.05 * Math.sin(a * 3 + 1) + 0.03 * Math.cos(a * 5); pts.push([Math.cos(a) * r * w, Math.sin(a) * r * 0.92 * w]); } const P = smooth(pts, 4);
  cel(g, P, dc(o.col), Math.max(2, r * 0.08), r * 0.26, r * 0.2, r * 0.1);
  if (o.sooty) { g.save(); g.clip(P); for (let i = 0; i < 9; i++) { const a = hsh(i, 5) * TAU, d = 0.15 + hsh(i, 6) * 0.8; g.globalAlpha = o.sooty * (0.4 + 0.45 * hsh(i, 7)); g.fillStyle = '#26222c'; g.beginPath(); g.ellipse(Math.cos(a) * r * d, Math.sin(a) * r * d, r * (0.18 + 0.3 * hsh(i, 8)), r * (0.12 + 0.2 * hsh(i, 9)), a, 0, TAU); g.fill(); } g.globalAlpha = 1; g.restore(); }
  for (const [a, rr] of [[0.6, 0.45], [2.4, 0.5], [4.2, 0.4]]) taper(g, arcPts(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4, r * rr * 0.4, a, a + 1.6, 6), Math.max(1, r * 0.035), rgba(mixc(dc(o.col), INK, 0.5), 0.35), 0.3); // fingerprint dents
  g.beginPath(); g.ellipse(-r * 0.38, -r * 0.4, r * 0.18, r * 0.1, -0.6, 0, TAU); g.fillStyle = 'rgba(255,252,244,0.7)'; g.fill(); g.restore(); }
function canAt(g, x, y, W, H, lines, band, lidC, o = {}) { const body = new Path2D(); body.moveTo(x - W, y - H); body.lineTo(x - W, y); body.ellipse(x, y, W, W * 0.28, 0, Math.PI, 0, true); body.lineTo(x + W, y - H); body.closePath();
  cel(g, body, o.base || '#e8dcc0', 3.4, 8, 5, 3); g.save(); g.clip(body); g.fillStyle = band; g.fillRect(x - W, y - H + H * 0.08, 2 * W, H * 0.12); g.fillRect(x - W, y - H * 0.22, 2 * W, H * 0.1);
  g.fillStyle = o.ink || '#1e3a5a'; g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach(([s, yy, sz, c], i) => { let fs = sz; g.font = `bold ${fs}px "DejaVu Serif", serif`; while (g.measureText(s).width > 2 * W - 10 && fs > 6) { fs -= 1; g.font = `bold ${fs}px "DejaVu Serif", serif`; } g.fillStyle = c || o.ink || '#1e3a5a'; g.fillText(s, x, y - H + H * yy); }); g.restore();
  taper(g, [[x - W * 0.7, y - H * 0.85], [x - W * 0.72, y - H * 0.1]], W * 0.12, 'rgba(255,255,255,0.45)', 0.4);
  if (!o.open) { cel(g, ellP(x, y - H, W * 1.04, W * 0.3), lidC, 3, 3, 2, 0); cel(g, ((p) => { p.moveTo(x - W * 1.04, y - H); p.lineTo(x - W * 1.04, y - H - W * 0.18); p.ellipse(x, y - H - W * 0.18, W * 1.04, W * 0.3, 0, Math.PI, 0, false); p.lineTo(x + W * 1.04, y - H); p.ellipse(x, y - H, W * 1.04, W * 0.3, 0, 0, Math.PI, false); return p; })(new Path2D()), lidC, 3, 3, 2, 0); }
  else { cel(g, ellP(x, y - H, W, W * 0.28), '#c8c0b0', 2.6, 0, 0, 0); doughAt(g, x, y - H - W * 0.05, W * 0.8, { col: o.dcol, squash: 0.45 }); } }
export const PD_HOLD = {
  doughball: (g, op = {}) => doughAt(g, OVH.HSIDE * 6, -40, op.big ? 56 : 40, { col: op.dcol, sooty: op.sooty, squash: op.squish }),
  dshape: (g, op = {}) => { const s = OVH.HSIDE, P = new Path2D(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 18 : 42; P[i ? 'lineTo' : 'moveTo'](s * 8 + Math.cos(a) * r, -46 + Math.sin(a) * r); } P.closePath(); cel(g, P, dc(op.dcol), 3, 6, 4, 2); },
  sponge: (g, op = {}) => { const s = OVH.HSIDE, sp = new Path2D(); sp.roundRect(s * 8 - 46, -86, 92, 64, 16); cel(g, sp, '#f6d040', 3.4, 8, 5, 3, (h) => { h.fillStyle = 'rgba(180,130,20,0.5)'; for (let i = 0; i < 22; i++) { h.beginPath(); h.arc(s * 8 - 40 + hsh(i, 2) * 80, -80 + hsh(i, 3) * 54, 2 + hsh(i, 4) * 4, 0, TAU); h.fill(); } });
    const n = op.suds == null ? 1 : op.suds; for (let i = 0; i < 9; i++) { const x = s * 8 - 50 + hsh(i, 7) * 100, y = -92 - hsh(i, 8) * 30, r = (6 + hsh(i, 9) * 12) * n; if (r < 1) continue; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = 'rgba(250,252,255,0.92)'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = 'rgba(80,100,160,0.5)'; g.stroke(); } },
  wpcan: (g, op = {}) => canAt(g, OVH.HSIDE * 6, 10, 46, 96, [['WALLPAPER', 0.42, 15], ['CLEANER', 0.6, 15, '#a8322a']], '#3a6a9a', '#7a7a80', { open: op.open, dcol: op.dcol }),
  pdcan: (g, op = {}) => { const c = op.dcol || 'white', band = { white: '#c8b890', red: '#d8302a', yellow: '#f0c020', blue: '#2a6ad8' }[c] || '#c8b890'; canAt(g, OVH.HSIDE * 6, 10, 46, 96, [['PLAY-DOH', 0.5, 19]], band, c === 'white' ? '#e8e0cc' : band, { base: '#f2ecdc', ink: '#5a4a3a', open: op.open, dcol: c }); },
  coalsack: (g, op = {}) => { const s = OVH.HSIDE; g.save(); g.translate(s * 14, -20); const P = smooth([[-50, -110], [-20, -126], [20, -122], [52, -106], [62, -30], [50, 30], [0, 44], [-50, 30], [-62, -30]], 6);
    cel(g, P, '#7a6a58', 3.6, 10, 6, 3, (h) => { h.strokeStyle = 'rgba(40,30,20,0.3)'; h.lineWidth = 1.4; for (let y = -120; y < 50; y += 8) { h.beginPath(); h.moveTo(-70, y); h.lineTo(70, y + 3); h.stroke(); } });
    for (let i = 0; i < 7; i++) cel(g, ellP(-34 + i * 11, -114 - (i % 2) * 8, 11, 9, i), '#24222a', 2, 2, 2, 0); g.fillStyle = 'rgba(30,26,34,0.5)'; g.font = 'bold 30px "DejaVu Serif", serif'; g.textAlign = 'center'; g.fillText('COAL', 0, -30); g.restore(); },
  clipping: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 22, -96); g.rotate(-s * 0.08); const P = new Path2D(); P.rect(-70, -84, 140, 168); cel(g, P, '#efe6cc', 3.2, 6, 4, 2);
    g.fillStyle = '#1e1a22'; g.textAlign = 'center'; g.textBaseline = 'middle'; [['KIDS MAKE ART', 18], ['WITH WALLPAPER', 16], ['CLEANER!', 20]].forEach(([t, z], i) => { g.font = `bold ${z}px "DejaVu Serif", serif`; g.fillText(t, 0, -60 + i * 22); });
    g.fillStyle = '#8a8070'; g.fillRect(-56, 0, 50, 60); g.fillStyle = 'rgba(60,50,50,0.45)'; for (let i = 0; i < 6; i++) g.fillRect(4, 4 + i * 10, 52 - (i % 3) * 8, 4); for (let i = 0; i < 2; i++) g.fillRect(-56, 68 + i * 8, 112, 4);
    g.strokeStyle = '#d02a2a'; g.lineWidth = 4; g.beginPath(); g.ellipse(0, -38, 70, 34, 0, 0, TAU); g.stroke(); g.restore(); },
  detergent: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 12, -10); const P = new Path2D(); P.rect(-48, -112, 96, 112); cel(g, P, '#e8e0f0', 3.4, 8, 5, 3); g.fillStyle = '#2a3a8a'; g.fillRect(-48, -96, 96, 22);
    g.fillStyle = '#f4f0ff'; g.font = 'bold 15px "DejaVu Serif", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('DETERGENT', 0, -85); for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-26 + i * 17, -44 + (i % 2) * 10, 7, 0, TAU); g.strokeStyle = '#6a8ad8'; g.lineWidth = 2.4; g.stroke(); } g.restore(); },
  scent: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 10, -10); const P = new Path2D(); P.moveTo(-10, -120); P.lineTo(10, -120); P.lineTo(10, -96); P.quadraticCurveTo(36, -90, 36, -60); P.lineTo(36, 0); P.quadraticCurveTo(0, 8, -36, 0); P.lineTo(-36, -60); P.quadraticCurveTo(-36, -90, -10, -96); P.closePath();
    cel(g, P, '#e890b8', 3.4, 8, 5, 3); g.fillStyle = '#f8f0e0'; g.fillRect(-28, -62, 56, 30); g.fillStyle = '#7a2a4a'; g.font = 'bold 13px "DejaVu Serif", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SCENT', 0, -47); cel(g, ellP(0, -126, 12, 8), '#d8b048', 2.4, 2, 2, 0); g.restore(); },
};
Object.assign(OVH.HOLD, PD_HOLD);

// ---------- DOUGHY: the dough-ball mascot. drawDoughy(g, o, op) on the oddverra 600x1000 card (ground y≈965, centre x=300).
// op.expr: 'smile' | 'happy' (^ ^) | 'proud' | 'shock' | 'sad' | 'triumph' | 'sly' | 'love' | 'eww' (sooty disgust) | 'dizzy'
// op.pose: 'stand' | 'cheer' | 'wave' | 'point' | 'hips' | 'shrug' | 'curl' (rolled into a ball: no limbs, for rolling across the wall) | 'hold' (op.prop)
// op.sooty 0..1 (soot smudges), op.dcol body colour ('white' | 'red' | 'yellow' | 'blue' | 'rainbow' | css), op.squash 0..1, op.flip, op.scale, op.blink, op.look, op.t
const dEye = (g, x, y, k, E, blink, look, s, body) => {
  if (blink >= 1 || E === 'happy' || E === 'triumph') { taper(g, [[x - 11 * k, y + 4 * k], [x, y - 8 * k], [x + 11 * k, y + 4 * k]], 5 * k, INK, 0.35); return; }
  if (E === 'dizzy') { taper(g, arcPts(x, y, 9 * k, 0, TAU * 1.6, 18), 3.4 * k, INK, 0.3); return; }
  if (E === 'eww') { taper(g, [[x - 10 * k, y - 6 * k * s], [x + 10 * k, y], [x - 10 * k, y + 6 * k * s]].map(([a, b]) => [x + (a - x) * s, b]), 4.4 * k, INK, 0.35); return; }
  if (E === 'love') { const r = 13 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2.6 * k; g.strokeStyle = INK; g.stroke(hp); return; }
  const sh = E === 'shock', rx = (sh ? 12 : 9.5) * k, ry = (sh ? 16 : 13.5) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k;
  const P = ellP(lx, y, rx, ry); g.lineWidth = 3.6 * k; g.strokeStyle = 'rgba(255,250,240,0.95)'; g.stroke(P); g.fillStyle = INK; g.fill(P);
  g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 5 * k, (sh ? 3.6 : 3) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(lx + 3 * k, y + 5 * k, 1.4 * k, 0, TAU); g.fill(); g.fillStyle = 'rgba(120,100,200,0.45)'; g.beginPath(); g.ellipse(lx + k, y + ry * 0.7, rx * 0.8, ry * 0.35, 0, 0, TAU); g.fill(); g.restore();
  g.save(); g.translate(lx - 3 * k, y - 5 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.2 * k, 1.8 * k, 0, 0, TAU); g.lineWidth = 1.2 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore(); // ringed-planet shine
  const lid = { proud: 0.45, sly: 0.5, sad: 0.25 }[E]; if (lid && blink < 0.5) { g.save(); g.clip(ellP(lx, y, rx + 3, ry + 3)); g.fillStyle = body; const yl = y - ry + 2 * ry * lid; g.beginPath(); g.moveTo(lx - rx - 4, E === 'sad' ? yl - s * 4 * k : yl); g.lineTo(lx + rx + 4, E === 'sad' ? yl + s * 4 * k : yl); g.lineTo(lx + rx + 4, y - ry - 6); g.lineTo(lx - rx - 4, y - ry - 6); g.fill(); g.restore(); taper(g, [[lx - rx - 2, yl], [lx + rx + 2, yl]], 3 * k, INK, 0.3); }
};
const dSweat = (g, x, y, k = 1) => { g.beginPath(); g.moveTo(x, y - 14 * k); g.quadraticCurveTo(x + 10 * k, y + 4 * k, x, y + 8 * k); g.quadraticCurveTo(x - 10 * k, y + 4 * k, x, y - 14 * k); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); };
const sparkle = (g, x, y, sz, col) => { g.beginPath(); for (let j = 0; j < 8; j++) { const rr = j % 2 ? sz * 0.3 : sz, an = j * Math.PI / 4; g.lineTo(x + rr * Math.cos(an), y + rr * Math.sin(an)); } g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 1.6; g.strokeStyle = INK; g.stroke(); };
export function drawDoughy(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, sc = op.scale || 1, blink = op.blink || 0, look = op.look || 0, curl = op.pose === 'curl';
  const pose = op.pose || ({ proud: 'hips', shock: 'shock', triumph: 'cheer' }[E]) || (op.prop ? 'hold' : 'stand');
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const rainbow = op.dcol === 'rainbow', body = rainbow ? DCOL.red : dc(op.dcol), sad = E === 'sad', sqz = clamp(op.squash || 0, 0, 1);
  const bob = curl ? 0 : Math.sin(t * 0.2) * 4 + (pose === 'cheer' ? -Math.abs(Math.sin(t * 0.35)) * 10 : 0);
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale((flip ? -1 : 1) * sc, sc);
  if (!curl) { g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 130, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore(); }
  const R = 118, sy = (1 - 0.35 * sqz) * (sad ? 0.92 : 1), sx = 1 + 0.3 * sqz, cy = curl ? -R : -150 - R * 0.7 * sy + bob, limbW = 17;
  const limbDraw = (pts, w = limbW) => cel(g, limb(pts, pts.map((_, i) => w * (1 - i * 0.08))), body, 2.6, 4, 3, 2);
  // dough feet (stubby), not when curled
  if (!curl) for (const s of [-1, 1]) { const fx = s * 46, fy = -20; limbDraw([[s * 40, cy + R * 0.7 * sy], [fx, fy - 10]], 18); cel(g, ellP(fx + s * 6, fy - 4, 30, 17), body, 2.8, 5, 3, 2); taper(g, [[fx + s * 6 - 14, fy - 12], [fx + s * 6 + 6, fy - 16]], 3, 'rgba(255,255,255,0.55)', 0.3); }
  // arms [shoulder, elbow, hand]
  const SH = (s) => [s * R * 0.92 * sx, cy + 18], A = {};
  if (!curl) for (const s of [-1, 1]) { const S = SH(s); let E2, H;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 14 : Math.sin(t * 0.4 + s) * 6; E2 = [S[0] + s * 40, S[1] - 48]; H = [S[0] + s * 44 + w, S[1] - 106]; }
    else if (pose === 'shock') { E2 = [S[0] + s * 44, S[1] - 18]; H = [S[0] + s * 50, S[1] - 72]; }
    else if (pose === 'hips') { E2 = [S[0] + s * 44, S[1] + 32]; H = [S[0] + s * 6, S[1] + 66]; }
    else if (pose === 'shrug') { E2 = [S[0] + s * 46, S[1] + 22]; H = [S[0] + s * 86, S[1] - 14]; }
    else if (pose === 'point' && s > 0) { E2 = [S[0] + 50, S[1] - 12]; H = [S[0] + 104, S[1] - 40]; }
    else if (pose === 'hold' && s > 0) { E2 = [S[0] + 34, S[1] + 38]; H = [S[0] + 58, S[1] + 8]; }
    else { E2 = [S[0] + s * 24, S[1] + 46 + (sad ? 12 : 0)]; H = [S[0] + s * 28, S[1] + 92 + (sad ? 12 : 0)]; }
    A[s] = [S, E2, H]; }
  const hand = (H) => cel(g, ellP(H[0], H[1], 16, 15), body, 2.6, 4, 3, 2);
  if (pose === 'hips') for (const s of [-1, 1]) limbDraw(A[s]);
  if (curl && op.spin) { g.translate(0, cy); g.rotate(op.spin); g.translate(0, -cy); } // rolling: spin the curled ball about its centre
  // body: soft dough blob (pear-ish, lumpy), fingerprint dents, sheen
  const bp = []; for (let i = 0; i < 40; i++) { const a = TAU * i / 40, lump = 1 + 0.035 * Math.sin(a * 3 + 0.7) + 0.025 * Math.cos(a * 5 + 1.3) + (curl ? 0 : 0.07 * Math.max(0, Math.sin(a)) ** 2); bp.push([Math.cos(a) * R * 1.04 * lump * sx, cy + Math.sin(a) * R * 0.95 * lump * sy]); }
  if (op.loaf) { bp.length = 0; for (let i = 0; i < 40; i++) { const a = TAU * i / 40, c = Math.cos(a), sn = Math.sin(a), w = 1 + 0.03 * Math.sin(a * 7); bp.push([Math.sign(c) * Math.abs(c) ** 0.55 * R * 1.3 * w * sx, cy + R * 0.1 + (sn > 0 ? Math.abs(sn) ** 0.45 * R * 0.72 : -(Math.abs(sn) ** 0.85) * R * 0.95) * w * sy]); } } /* [JG-cast] LOAFY: bread-loaf body */
  const P = smooth(bp, 4); cel(g, P, body, 4, 24, 18, 7);
  if (op.loaf) { g.save(); g.clip(P); const tg = g.createLinearGradient(0, cy - R, 0, cy + R * 0.8); tg.addColorStop(0, 'rgba(120,60,20,0.35)'); tg.addColorStop(0.5, 'rgba(255,220,150,0)'); tg.addColorStop(1, 'rgba(255,236,190,0.25)'); g.fillStyle = tg; g.fillRect(-300, cy - R * 1.2, 600, R * 2.4);
    for (const x of [-0.75, 0.75]) taper(g, [[R * (x - 0.16), cy - R * 0.62], [R * (x + 0.12), cy - R * 0.94]], 13, '#f6dca0', 0.5); taper(g, [[-R * 0.2, cy - R * 0.84], [R * 0.2, cy - R * 0.98]], 13, '#f6dca0', 0.5); g.globalAlpha = 0.5; for (let i = 0; i < 30; i++) { g.fillStyle = '#f8e8c0'; g.beginPath(); g.ellipse((hsh(i, 21) - 0.5) * R * 2.2, cy - R * (0.3 + 0.6 * hsh(i, 22)), 4, 2, hsh(i, 23) * 3, 0, TAU); g.fill(); } g.globalAlpha = 1; g.restore(); }
  if (rainbow) { g.save(); g.clip(P); for (const [c, a0] of [[DCOL.yellow, 0.4], [DCOL.blue, 2.4], [DCOL.green, 4.3]]) { taper(g, arcPts(0, cy, R * 0.62, a0, a0 + 1.9, 12), 46, c, 0.6); } g.restore(); }
  if (!op.loaf) { g.save(); g.clip(P); for (const [a, rr, x0, y0] of [[0.3, 0.3, 0.38, 0.35], [2.6, 0.24, -0.45, 0.45], [4.6, 0.2, 0.1, -0.55]]) for (let k = 0; k < 3; k++) taper(g, arcPts(R * x0, cy + R * y0, R * (rr - k * 0.06), a, a + 1.8, 8), 2.2, rgba(mixc(body, INK, 0.5), 0.28), 0.3); g.restore(); }
  if (op.sooty) { g.save(); g.clip(P); for (let i = 0; i < 12; i++) { const a = hsh(i, 11) * TAU, d = 0.15 + hsh(i, 12) * 0.85; g.filter = 'blur(7px)'; g.globalAlpha = op.sooty * (0.45 + 0.4 * hsh(i, 13)); g.fillStyle = '#26222c'; g.beginPath(); g.ellipse(Math.cos(a) * R * d, cy + Math.sin(a) * R * d * 0.9, 16 + 34 * hsh(i, 14), 12 + 22 * hsh(i, 15), a, 0, TAU); g.fill(); } g.globalAlpha = 1; g.filter = 'none'; g.restore(); }
  g.beginPath(); g.ellipse(-R * 0.48, cy - R * 0.5 * sy, R * 0.22, R * 0.12, -0.6, 0, TAU); g.fillStyle = 'rgba(255,252,246,0.85)'; g.fill(); g.beginPath(); g.arc(-R * 0.18, cy - R * 0.68 * sy, R * 0.05, 0, TAU); g.fill();
  // face
  const fy = cy - R * 0.06 * sy, k = 1.25, ex = 38;
  for (const s of [-1, 1]) dEye(g, s * ex + look * 6, fy, k, E, blink, look, s, body);
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -12, -8], sad: [-10, -2, 8], triumph: [-2, -8, -2], sly: [8, 2, 0], love: [0, -6, 0], eww: [6, -2, -8], dizzy: [-2, -6, -2] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = fy - 26, b = E === 'sly' && s > 0 ? [-6, -12, -8] : BR; taper(g, [[s * (ex - 12), by + b[0]], [s * ex, by + b[1]], [s * (ex + 13), by + b[2]]], 5, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 26), fy + 26, 16, 9, 0, 0, TAU); g.fillStyle = 'rgba(255,130,160,0.72)'; g.fill(); if (['happy', 'triumph', 'love', 'proud'].includes(E)) for (let i = 0; i < 3; i++) taper(g, [[s * (ex + 16 + i * 8), fy + 22], [s * (ex + 12 + i * 8), fy + 30]], 2, 'rgba(160,30,60,0.7)', 0.3); }
  const my = fy + 34, MC = '#5a1e30';
  const openM = (w, h, up) => { const p = new Path2D(); p.moveTo(-w, my - 4 * up); p.bezierCurveTo(-w * 0.4, my, w * 0.4, my, w, my - 4 * up); p.bezierCurveTo(w * 0.85, my + h, w * 0.4, my + h + 2, 0, my + h + 2); p.bezierCurveTo(-w * 0.4, my + h + 2, -w * 0.85, my + h, -w, my - 4 * up); p.closePath(); g.fillStyle = MC; g.fill(p); g.save(); g.clip(p); g.fillStyle = '#e07080'; g.beginPath(); g.ellipse(0, my + h + 2, w * 0.6, h * 0.45 + 2, 0, 0, TAU); g.fill(); g.restore(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(p); };
  if (E === 'shock') { const p = ellP(0, my + 10, 11, 15); g.fillStyle = MC; g.fill(p); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(p); dSweat(g, R * 0.8, cy - R * 0.5, 1.3); for (const a of [-2.3, -1.6, -0.9]) taper(g, [[Math.cos(a) * (R + 14), cy - R * 0.2 + Math.sin(a) * (R + 14)], [Math.cos(a) * (R + 36), cy - R * 0.2 + Math.sin(a) * (R + 36)]], 4, INK, 0.3); }
  else if (E === 'sad') { taper(g, arcPts(0, my + 18, 14, Math.PI * 1.2, Math.PI * 1.8, 8), 3.6, INK, 0.3); const ty = fy + 18 + ((t * 0.8) % 30); g.beginPath(); g.moveTo(-ex - 6, ty - 10); g.quadraticCurveTo(-ex + 2, ty + 3, -ex - 6, ty + 6); g.quadraticCurveTo(-ex - 14, ty + 3, -ex - 6, ty - 10); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = INK; g.stroke(); }
  else if (E === 'eww') { taper(g, [[-16, my + 6], [-6, my], [4, my + 8], [14, my + 2]], 3.6, INK, 0.3); const tg = ellP(8, my + 12, 7, 9); g.fillStyle = '#e07080'; g.fill(tg); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(tg); for (let i = 0; i < 3; i++) taper(g, [[R * (0.55 + i * 0.12), cy - R * (0.9 + i * 0.05)], [R * (0.6 + i * 0.12), cy - R * (1.05 + i * 0.05)]], 3.4, '#4a8a3a', 0.3); }
  else if (E === 'dizzy') { taper(g, arcPts(0, my + 4, 12, 0.2, Math.PI - 0.2, 8), 3.4, INK, 0.3); for (let i = 0; i < 3; i++) { const a = t * 0.15 + i * TAU / 3; sparkle(g, Math.cos(a) * R * 0.7, cy - R * 1.05 + Math.sin(a) * 14, 10, '#fff3b0'); } }
  else if (E === 'triumph' || E === 'happy' || E === 'love') openM(E === 'triumph' ? 20 : 16, E === 'triumph' ? 20 : 14, 1.2);
  else if (E === 'proud' || E === 'sly') { taper(g, [[-14, my + 2], [4, my + 8], [18, my - 6]], 3.6, INK, 0.3); taper(g, arcPts(22, my - 7, 5, -0.7, 1.3, 5), 1.8, INK, 0.3); }
  else taper(g, arcPts(0, my - 6, 16, Math.PI * 0.2, Math.PI * 0.8, 10), 3.6, INK, 0.3);
  if (E === 'triumph' || E === 'love') for (let i = 0; i < 4; i++) { const p = (t * 0.03 + i / 4) % 1, a = -Math.PI / 2 + (i - 1.5) * 0.7, d = R + 30 + p * 40, sz = 12 * Math.sin(Math.PI * p); if (sz >= 1) sparkle(g, Math.cos(a) * d, cy - 20 + Math.sin(a) * d, sz, E === 'love' ? '#ff8aa8' : '#fff3b0'); }
  if (op.sooty > 0.5 && !curl) for (let i = 0; i < 3; i++) { const p = (t * 0.02 + i / 3) % 1; g.globalAlpha = 0.6 * (1 - p); g.fillStyle = '#4a4450'; g.beginPath(); g.arc(-R * 0.6 + i * R * 0.6, cy - R - p * 50, 8 + p * 12, 0, TAU); g.fill(); g.globalAlpha = 1; } // soot puffs
  if (pose !== 'hips' && !curl) for (const s of [-1, 1]) limbDraw(A[s]);
  if (!curl) for (const s of [-1, 1]) { const H = A[s][2]; if (op.prop && OVH.HOLD[op.prop] && s > 0) { g.save(); g.translate(H[0] + 4, H[1] - 6); g.scale(0.8, 0.8); OVH.HOLD[op.prop](g, op); g.restore(); } hand(H); }
  g.restore(); }

// ---------- [PD-cast] cast test (?pdcast=N): actors laid out in front of the camera on ground height gy ----------
const KT = [
  { d: 7.0, a: [['PD_HOMEMAKER', { expr: 'happy', prop: 'doughball', raise: 1, reach: 0.9 }], ['PD_COALMAN', { expr: 'grin', prop: 'coalsack', reach: 0.5 }], ['PD_WORKER1', { expr: 'smile', prop: 'wpcan', reach: 0.6 }], ['PD_WORKER2', { expr: 'excited', cheer: 1 }], ['PD_OWNER', { expr: 'worried' }], ['DOUGHY', { expr: 'happy' }]] },
  { d: 7.0, a: [['PD_KAY', { expr: 'smile', prop: 'clipping', reach: 0.8 }], ['PD_MOM50', { expr: 'happy', prop: 'sponge', reach: 0.9, raise: 1 }], ['PD_KID1', { expr: 'laugh', prop: 'dshape', reach: 0.8 }], ['PD_KID2', { expr: 'excited', cheer: 1 }], ['PD_KID3', { expr: 'happy', prop: 'doughball', reach: 0.8 }], ['PD_KID4', { expr: 'smile' }], ['PD_MODERN_KID', { expr: 'excited', prop: 'doughball', dcol: 'red', reach: 0.8 }]] },
  { d: 4.0, a: [['DOUGHY', { expr: 'eww', sooty: 1 }], ['DOUGHY', { expr: 'sad' }], ['DOUGHY', { expr: 'shock', dcol: 'red' }], ['DOUGHY', { expr: 'triumph', dcol: 'rainbow' }]] },
  { d: 3.4, a: [['PD_KAY', { expr: 'excited', prop: 'pdcan', dcol: 'white', reach: 0.9, raise: 1, view: '34R' }], ['PD_OWNER', { expr: 'shock', prop: 'phone', reach: 0.5, view: '34L' }]] },
  { d: 4.0, a: [['DOUGHY', { expr: 'love', pose: 'hold', prop: 'scent' }], ['DOUGHY', { expr: 'sly', pose: 'shrug' }], ['DOUGHY', { expr: 'smile', pose: 'curl' }], ['DOUGHY', { expr: 'dizzy', dcol: 'blue' }]] },
];
export function pdTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
