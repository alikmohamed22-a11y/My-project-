// [MM-cast] "Woolly mammoths were alive when the Great Pyramid was built": outfit table (merged into ODD by main.js), props
// (into oddverra's HOLD), TUSKY (a side-view woolly mammoth on the wide 1000x880 card, drawTusky: the hero and the motif; the same
// card draws the rest of the Wrangel herd with op.herd colour variants) and a cast lineup (?mmcast=N). Everyone is an invented generic
// design: Old Kingdom pyramid workers, an overseer, a modern ancient-DNA scientist and two Arctic hunters. No logos.
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, line, ellP, limb, arcPts, mixc } = OVK;
const TAU = Math.PI * 2;

const KILT = { noButtons: true, noChain: true, sandals: true };
export const MM_ODD = {
  MM_EGW1: { ...KILT, galabiya: true, shirt: '#f2ead6', pants: '#f2ead6', sash: '#c89a3a', hat: 'turban', hatCol: '#efe4cc', hair: 'short', hairCol: '#14100e', brow: '#14100e', build: 'stout', head: 'wide', skin: '#a8683e' },
  MM_EGW2: { ...KILT, shirt: '#f2ead6', pants: '#e8dcc0', rolled: true, belt: true, hair: 'short', hairCol: '#14100e', brow: '#14100e', build: 'thin', head: 'tall', skin: '#b87448' },
  MM_EGW3: { ...KILT, galabiya: true, shirt: '#e8dcc4', pants: '#e8dcc4', sash: '#3a7a9a', hair: 'curly', hairCol: '#1a1410', brow: '#1a1410', build: 'adult', head: 'round', skin: '#9a5e38', earring: true },
  MM_BOSS: { ...KILT, galabiya: true, shirt: '#f6f0e0', pants: '#f6f0e0', sash: '#2a6ab0', collar: '#e8b830', hat: 'wide', hatCol: '#e8d8a8', hair: 'short', hairCol: '#14100e', brow: '#14100e', build: 'stout', head: 'egg', skin: '#b07450' },   // overseer
  MM_SCI: { coat: true, shirt: '#f4f4f8', pants: '#3a4258', collar: '#8ab0e8', cuff: '#f4f4f8', hair: 'bun', hairCol: '#3a2418', brow: '#3a2418', lashes: true, glasses: true, head: 'egg', skin: '#e8b890', shoes: '#2a2a34', noButtons: true, earring: true },
  MM_HUNT1: { hoodie: true, shirt: '#8a6440', pants: '#5a4430', trim: '#efe4d0', belt: true, hair: 'short', hairCol: '#14100e', brow: '#14100e', build: 'stout', head: 'round', skin: '#c88a5a', boots: true, shoes: '#4a3424', noButtons: true },
  MM_HUNT2: { hoodie: true, shirt: '#a87a4a', pants: '#5a4430', trim: '#efe4d0', hair: 'long', hairCol: '#14100e', brow: '#14100e', lashes: true, head: 'egg', skin: '#d0946a', boots: true, shoes: '#4a3424', noButtons: true },
};
const MM_OPS = [];
export const mmOpts = (op) => { const r = {}; for (const k of MM_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props (hand-local: hand at 0,0, up = -y)
const MM_HOLD = {
  // a long stone-age harpoon / spear with a bone point
  spear: (g) => { const s = OVH.HSIDE; line(g, [[-s * 6, 70], [s * 16, -190]], 10, INK); line(g, [[-s * 6, 70], [s * 16, -190]], 6, '#8a6a40'); g.save(); g.translate(s * 17, -196); g.rotate(s * 0.09); const P = new Path2D(); P.moveTo(0, -40); P.lineTo(9, 0); P.lineTo(-9, 0); P.closePath(); cel(g, P, '#efe6d2', 2.4, 2, 1, 0); g.restore(); },
  // a sample tube with a little bone chip inside
  tube: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 14, -40); g.rotate(s * 0.25); const P = new Path2D(); P.roundRect(-11, -48, 22, 80, 10); cel(g, P, '#d8f0f4', 2.6, 2, 1, 1); g.fillStyle = '#e04a5a'; g.fillRect(-12, -54, 24, 12); cel(g, ellP(0, 14, 7, 9), '#efe2c4', 1.6, 0, 0, 0); g.restore(); },
  // overseer's measuring rod
  rod: (g) => { const s = OVH.HSIDE; line(g, [[0, 40], [s * 10, -170]], 10, INK); line(g, [[0, 40], [s * 10, -170]], 6, '#c89a50'); for (let i = 0; i < 6; i++) { const y = 20 - i * 32; line(g, [[s * (y < 0 ? -y * 0.05 : 0) - 5, y], [s * (y < 0 ? -y * 0.05 : 0) + 5, y]], 2, '#5a3a1a'); } },
};
Object.assign(OVH.HOLD, MM_HOLD);

// ---------- face bits (bean eye with the orbit shine, mouth, brows)
const bean = (g, x, y, k, E, blink, look = 0) => {
  if (blink >= 1 || E === 'happy' || E === 'laugh') { taper(g, [[x - 13 * k, y + 5 * k], [x, y - 9 * k], [x + 13 * k, y + 5 * k]], 5.5 * k, INK, 0.35); return; }
  if (E === 'dazed') { taper(g, arcPts(x, y, 10 * k, 0, TAU * 1.6, 18), 3.6 * k, INK, 0.3); return; }
  if (E === 'love') { const r = 15 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(hp); return; }
  const sh = E === 'shock', rx = (sh ? 12 : 9.5) * k, ry = (sh ? 17 : 14) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k, P = ellP(lx, y, rx, ry);
  g.fillStyle = INK; g.fill(P); g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 6 * k, (sh ? 4 : 3.4) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
  g.save(); g.translate(lx - 3 * k, y - 6 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.8 * k, 2 * k, 0, 0, TAU); g.lineWidth = 1.2 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore(); };
const mouth = (g, x, my, E, k = 1) => { const MC = '#7a2238';
  if (E === 'shock') { const p = ellP(x, my + 4 * k, 11 * k, 15 * k); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4 * k; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad' || E === 'worried' || E === 'cold') taper(g, arcPts(x, my + 16 * k, 15 * k, Math.PI * 1.2, Math.PI * 1.8, 8), 4.4 * k, INK, 0.3);
  else if (E === 'happy' || E === 'love' || E === 'laugh') { const p = new Path2D(); p.moveTo(x - 20 * k, my - 4 * k); p.bezierCurveTo(x - 8 * k, my, x + 8 * k, my, x + 20 * k, my - 4 * k); p.bezierCurveTo(x + 16 * k, my + 18 * k, x - 16 * k, my + 18 * k, x - 20 * k, my - 4 * k); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4 * k; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'proud' || E === 'sly' || E === 'determined') taper(g, [[x - 15 * k, my], [x + 4 * k, my + 7 * k], [x + 19 * k, my - 7 * k]], 4.4 * k, INK, 0.3);
  else taper(g, arcPts(x, my - 10 * k, 18 * k, Math.PI * 0.2, Math.PI * 0.8, 10), 4.4 * k, INK, 0.3); };
const BRW = { smile: [2, -3, 2], happy: [0, -6, 0], laugh: [0, -6, 0], proud: [6, 0, -4], determined: [8, 4, -2], shock: [-4, -14, -8], sad: [-10, -2, 8], worried: [-10, -2, 8], cold: [-10, -2, 8], sly: [8, 2, 0], love: [0, -6, 0], dazed: [-2, -6, -2] };

// ---------- TUSKY: drawTusky(g, o, op) on the 1000x880 card (ground y = 850, centre x = 500), facing +x (op.flip faces -x).
// op.expr: smile | happy | laugh | shock | sad | worried | cold | sly | proud | love | dazed | determined
// op.walk = gait phase 0..1 (undefined = standing); op.trunk 0..1 raises the trunk (trumpeting); op.herd 0..5 = fur variant for herd
// members (0 = Tusky: a ginger tuft and the longest tusks); op.kid = calf; op.snow 0..1 snow on the back; op.ice 0..1 icicles + frost;
// op.chew 0..1 a tuft of grass in the trunk; op.stomp 0..1 front foot raised; op.fade 0..1 ghost fade (drawn with lowered alpha).
const FURS = [['#7a5a3e', '#c8925a'], ['#64482e', '#9a7044'], ['#705440', '#b08a5a'], ['#56402c', '#8a6a46'], ['#806448', '#c0a070'], ['#5e4632', '#a0804e']];
export function drawTusky(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, blink = op.blink || 0, kid = !!op.kid, walk = op.walk, tr = op.trunk || 0, hv = FURS[(op.herd || 0) % FURS.length];
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const FUR = hv[0], FUR2 = mixc(FUR, '#2a1a34', 0.4), FURL = mixc(hv[1], '#f6d8a8', 0.25);
  g.save(); if (op.fade) g.globalAlpha = Math.max(0, 1 - op.fade);
  g.translate(flip ? 535 : 465, 850); const S = kid ? 0.66 : 1.0; g.scale((flip ? -1 : 1) * S, S);
  g.save(); g.scale(1, 0.18); g.beginPath(); g.ellipse(10, 0, 280, 70, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.26)'; g.fill(); g.restore();
  const ph = walk == null ? 0 : walk * TAU, br = Math.sin(t * 0.09) * 3, bob = walk == null ? br : -Math.abs(Math.sin(ph)) * 9;
  const st = op.stomp || 0;
  // legs: pillar legs with shaggy trousers and round toenails
  const leg = (x, a, far, lift = 0) => { const sw = walk == null ? 0 : Math.sin(ph + a) * 30, up = (walk == null ? 0 : Math.max(0, Math.sin(ph + a + 1.6)) * 16) + lift * 70, top = [x, -250 + bob], ft = [x + sw + lift * 18, -16 - up];
    cel(g, limb([top, [x + sw * 0.5 + lift * 10, -130 + bob * 0.5 - lift * 30], ft], [50, 44, 42]), far ? FUR2 : FUR, 3.6, 5, 3, 2);
    for (let i = 0; i < 4; i++) taper(g, [[ft[0] - 30 + i * 18, ft[1] - 60], [ft[0] - 28 + i * 18, ft[1] - 26]], 6, far ? mixc(FUR2, '#000', 0.2) : FUR2, 0.4);
    cel(g, ellP(ft[0], ft[1] - 2, 44, 17), far ? '#4a3a40' : '#6a5458', 3, 4, 2, 1); for (let i = -1; i <= 1; i++) cel(g, ellP(ft[0] + 18 + i * 13, ft[1] + 4, 7, 5), '#efe4d0', 1.4, 0, 0, 0); };
  leg(-150, Math.PI, true); leg(105, 0, true);
  // body: sloping back, tall shoulder hump, fat-hump on the head
  const body = new Path2D(); body.moveTo(-235, -225 + bob); body.bezierCurveTo(-262, -360 + bob, -150, -440 + bob, -10, -458 + bob); body.bezierCurveTo(100, -500 + bob, 186, -486 + bob, 205, -400 + bob);
  body.bezierCurveTo(226, -322 + bob, 196, -205 + bob, 132, -168 + bob); body.lineTo(-172, -156 + bob); body.bezierCurveTo(-232, -166 + bob, -246, -196 + bob, -235, -225 + bob); body.closePath();
  cel(g, body, FUR, 4.6, 16, 9, 6);
  g.save(); g.clip(body);
  // soft belly shade + a lighter back ridge, then fur strokes
  const sh = g.createLinearGradient(0, -480 + bob, 0, -160 + bob); sh.addColorStop(0, 'rgba(255,230,190,0.18)'); sh.addColorStop(0.55, 'rgba(255,230,190,0)'); sh.addColorStop(1, 'rgba(40,20,70,0.28)'); g.fillStyle = sh; g.fillRect(-280, -520 + bob, 520, 380);
  for (let i = 0; i < 64; i++) { const x = -240 + (i * 37) % 450, y = -470 + ((i * 71) % 300) + bob, w = Math.sin(i * 1.7 + t * 0.05) * 3; taper(g, [[x, y], [x + 4 + w, y + 30], [x - 2 + w, y + 56]], 3.2, i % 3 ? FUR2 : FURL, 0.4); }
  g.restore();
  // snow on the back
  if (op.snow) { g.save(); g.globalAlpha *= op.snow; g.fillStyle = '#f6f8ff'; for (let i = 0; i < 10; i++) { g.beginPath(); g.ellipse(-190 + i * 40, -446 + bob - Math.sin(i / 9 * Math.PI) * 30, 24, 9, -0.1 + i * 0.03, 0, TAU); g.fill(); } g.restore(); }
  // long shaggy skirt along the belly + flank
  for (let i = 0; i < 15; i++) { const x = -206 + i * 25, y = -168 + bob, sw = Math.sin(t * 0.08 + i) * 4; taper(g, [[x, y - 14], [x + 4 + sw, y + 30 + (i % 3) * 9], [x - 3 + sw * 1.4, y + 52 + (i % 2) * 12]], 8, FUR2, 0.5); }
  taper(g, [[-238, -300 + bob], [-268, -250 + bob + Math.sin(t * 0.3) * 7], [-272, -206 + bob]], 10, FUR2, 0.5); cel(g, ellP(-272, -200 + bob, 12, 16), FUR2, 2, 0, 0, 0);
  leg(-118, 0, false); leg(140, Math.PI, false, st);
  // head: domed skull with a fat knob, in front of the shoulder hump
  const hx = 214, hy = -378 + bob, nod = Math.sin(t * 0.07) * 3, head = new Path2D(); head.moveTo(hx - 64, hy + 92); head.bezierCurveTo(hx - 96, hy - 20, hx - 52, hy - 150 + nod, hx + 22, hy - 140 + nod); head.bezierCurveTo(hx + 92, hy - 126, hx + 104, hy - 36, hx + 84, hy + 40); head.bezierCurveTo(hx + 64, hy + 92, hx, hy + 112, hx - 64, hy + 92); head.closePath();
  cel(g, head, FUR, 4.2, 12, 7, 4); g.save(); g.clip(head); for (let i = 0; i < 16; i++) { const x = hx - 56 + (i * 23) % 140, y = hy - 130 + (i * 37) % 130; taper(g, [[x, y], [x + 3, y + 26]], 3, FUR2, 0.4); } g.restore();
  if (!op.herd) { for (let i = 0; i < 6; i++) { const a = -0.9 + i * 0.32; taper(g, [[hx + 6 + Math.cos(a) * 30, hy - 132 + nod], [hx + 4 + Math.cos(a) * 44 + Math.sin(t * 0.1 + i) * 4, hy - 172 + nod - Math.abs(Math.sin(a + 1)) * 12]], 7, hv[1], 0.4); } }
  // little furry ear
  cel(g, ellP(hx - 44, hy - 18, 26, 32, 0.2), FUR2, 3, 3, 2, 1);
  // tusks: long ivory spirals (behind the trunk)
  const TL = kid ? 0.5 : op.herd ? 0.85 : 1;
  for (const [dx, far] of [[-16, 1], [0, 0]]) { const tu = [[hx + 52 + dx, hy + 62], [hx + 60 + dx + 70 * TL, hy + 150 * TL + 60], [hx + 60 + dx + 170 * TL, hy + 130 * TL + 50], [hx + 64 + dx + 190 * TL, hy + 50]]; taper(g, tu, far ? 22 : 28, INK, 0.25); taper(g, tu, far ? 15 : 21, far ? '#d8ccb0' : '#f6eedc', 0.25); if (!far) taper(g, tu.slice(0, 3).map(([x, y]) => [x - 3, y - 4]), 5, 'rgba(255,255,255,0.7)', 0.2); }
  // trunk: hangs and curls; tr raises it into a trumpet; chew holds a grass tuft
  const sw = Math.sin(t * 0.11) * 8 * (1 - tr), tp = [[hx + 72, hy + 30], [hx + 98 + sw * 0.3, hy + 112 - 70 * tr], [hx + 92 + sw + 50 * tr, hy + 196 - 230 * tr], [hx + 60 + sw * 1.4 + 110 * tr, hy + 222 - 330 * tr]];
  cel(g, limb(tp, [36, 30, 23, 17]), FUR, 3.6, 5, 3, 2); for (let i = 1; i < 7; i++) { const a = tp[Math.min(3, Math.floor(i / 2))]; line(g, [[a[0] - 14, a[1] + i * 3], [a[0] + 10, a[1] + i * 3 + 2]], 2, 'rgba(43,29,74,0.35)'); }
  const tip = tp[3]; cel(g, ellP(tip[0], tip[1], 14, 10), mixc(FUR, '#f0b0a0', 0.25), 2.4, 0, 0, 0);
  if (tr > 0.5) { g.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(tip[0] + 20 + i * 14, tip[1] - 24 - i * 18, 10 - i * 2, 6 - i, 0.6, 0, TAU); g.fill(); } }
  if (op.chew) { for (let i = 0; i < 6; i++) taper(g, [[tip[0], tip[1] + 6], [tip[0] - 20 + i * 8, tip[1] + 40 + (i % 2) * 8]], 4, i % 2 ? '#6a9a3a' : '#8ab84a', 0.4); }
  // face: bean eye with the orbit shine, brow, blush, mouth under the trunk
  const ex = hx + 30, ey = hy - 32 + nod * 0.5; bean(g, ex, ey, 1.3, E, blink, op.look || 0);
  const BR = BRW[E] || BRW.smile; taper(g, [[ex - 22, ey - 40 + BR[0]], [ex, ey - 44 + BR[1]], [ex + 22, ey - 40 + BR[2]]], 6, INK, 0.35);
  g.beginPath(); g.ellipse(ex + 12, ey + 38, 22, 11, 0, 0, TAU); g.fillStyle = 'rgba(255,120,150,0.72)'; g.fill();
  if (E === 'happy' || E === 'laugh' || E === 'love') for (let i = 0; i < 3; i++) line(g, [[ex + 2 + i * 9, ey + 32], [ex - 4 + i * 9, ey + 44]], 2.2, 'rgba(200,60,90,0.7)');
  mouth(g, hx + 38, hy + 70, E, 0.82);
  if (E === 'shock' || E === 'worried' || E === 'cold') { g.beginPath(); const sx = hx + 74, sy = hy - 112; g.moveTo(sx, sy); g.quadraticCurveTo(sx + 14, sy + 24, sx, sy + 30); g.quadraticCurveTo(sx - 14, sy + 24, sx, sy); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); }
  if (op.ice) { g.save(); g.globalAlpha *= op.ice; for (let i = 0; i < 9; i++) { const x = -190 + i * 44, y = -160 + bob; const P = new Path2D(); P.moveTo(x - 7, y); P.lineTo(x + 7, y); P.lineTo(x, y + 26 + (i % 3) * 10); P.closePath(); g.fillStyle = '#d8f0ff'; g.fill(P); g.lineWidth = 2; g.strokeStyle = '#6a8ad8'; g.stroke(P); }
    g.fillStyle = 'rgba(220,240,255,0.16)'; g.fill(body); g.restore(); }
  g.restore(); }

// ---------- lineup (?mmcast=N)
const KT = [
  { d: 7.0, a: [['MM_EGW1', { expr: 'smile', prop: 'rope' }], ['MM_EGW2', { expr: 'shock' }], ['MM_EGW3', { expr: 'happy' }], ['MM_BOSS', { expr: 'proud', prop: 'rod' }], ['MM_SCI', { expr: 'excited', prop: 'tube' }], ['MM_HUNT1', { expr: 'surprised', prop: 'spear' }], ['MM_HUNT2', { expr: 'worried' }]] },
  { d: 12.0, a: [['TUSKY', { expr: 'happy', walk: 0.3 }], ['TUSKY', { expr: 'shock', trunk: 1, herd: 2 }], ['TUSKY', { expr: 'cold', ice: 1, snow: 1 }], ['TUSKY', { expr: 'love', kid: true, herd: 4 }]] },
];
export function mmTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'TUSKY' ? 1.6 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
