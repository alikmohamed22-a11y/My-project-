// [OX-cast] "Oxford University is older than the Aztec Empire": outfit table (merged into ODD by main.js), props (into oddverra's HOLD),
// SANDY (a little living hourglass, the sidekick and the motif; drawSandy on the 600x1000 card), MAMMO (a side-view woolly mammoth card,
// drawMammo) and a cast lineup (?oxcast=N). Henry II is our own stylization; everyone else is an invented generic design.
// No university crests, coats of arms or logos anywhere: banners and robes are plain colours.
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, line, ellP, polyPath, limb, arcPts, mixc } = OVK;
const TAU = Math.PI * 2;

const ROBE = { galabiya: true, noButtons: true, noChain: true };
export const OX_ODD = {
  OX_MASTER: { ...ROBE, shirt: '#2a2436', pants: '#2a2436', sash: '#6a2a3a', hat: 'beret', hatCol: '#1a1622', hair: 'short', hairCol: '#b8b0a8', brow: '#a8a098', beard: true, beardCol: '#c8c0b8', build: 'old', head: 'egg', skin: '#e8b890', shoes: '#2a2020' }, // a 12th-century master
  OX_SCH1: { ...ROBE, shirt: '#3a3a6a', pants: '#3a3a6a', sash: '#2a2a3a', hair: 'side', hairCol: '#5a3a22', brow: '#4a2a18', build: 'thin', head: 'tall', skin: '#f0c098', shoes: '#3a2a20', satchel: '#6a4a2a' },
  OX_SCH2: { ...ROBE, shirt: '#5a3a28', pants: '#5a3a28', sash: '#2a1a14', hair: 'curly', hairCol: '#2a1a12', brow: '#2a1a12', build: 'adult', head: 'round', skin: '#e0a880', shoes: '#2a2020' },
  OX_SCH3: { ...ROBE, shirt: '#2f4a3a', pants: '#2f4a3a', sash: '#1a2a20', hat: 'beret', hatCol: '#3a2a4a', hair: 'short', hairCol: '#c87a3a', brow: '#a85a2a', build: 'adult', head: 'egg', skin: '#f2c8a0', shoes: '#3a2a20' },
  OX_SCH4: { ...ROBE, shirt: '#4a2a3a', pants: '#4a2a3a', sash: '#2a1a24', hair: 'spiky', hairCol: '#1a1410', brow: '#1a1410', build: 'kid', head: 'round', skin: '#e8b48a', shoes: '#2a2020' },
  OX_KING: { ...ROBE, shirt: '#8a1e2e', pants: '#8a1e2e', sash: '#e8b830', hat: 'crown', hair: 'short', hairCol: '#b0582a', brow: '#9a4a22', beard: true, beardShort: true, beardCol: '#a8502a', build: 'stout', head: 'wide', skin: '#f0c098', shoes: '#3a2418' }, // Henry II (red-haired, stout)
  OX_TOWN1: { lashes: true, dress: true, shirt: '#6a7a3a', pants: '#6a7a3a', apron: '#e8dcc0', hair: 'bun', hairCol: '#6a4024', head: 'egg', skin: '#f0c8a0', shoes: '#3a2a20', noButtons: true },
  OX_TOWN2: { shirt: '#8a5a2a', pants: '#4a3a2a', belt: true, hat: 'cap', hatCol: '#5a3a24', plainCap: true, hair: 'short', hairCol: '#3a2214', build: 'stout', head: 'wide', skin: '#dca07a', shoes: '#2a2020', noButtons: true },
  MX_LEAD: { ...ROBE, shirt: '#f0e6d0', pants: '#f0e6d0', sash: '#c8302a', hat: 'plume', hatCol: '#c8302a', featherCol: '#2fb87a', hair: 'short', hairCol: '#14100e', brow: '#14100e', build: 'adult', head: 'egg', skin: '#b8784e', sandals: true, earring: true },
  MX_ROW: { shirt: '#ece2cc', pants: '#ece2cc', sash: '#2a7a8a', noButtons: true, hair: 'short', hairCol: '#14100e', brow: '#14100e', build: 'thin', head: 'round', skin: '#b07048', sandals: true },
  MX_WOM: { lashes: true, dress: true, shirt: '#f2ead8', pants: '#f2ead8', collar: '#c8302a', hair: 'long', hairCol: '#14100e', head: 'egg', skin: '#c08458', sandals: true, noButtons: true, earring: true },
  TX_LEAD: { ...ROBE, shirt: '#f0e6d0', pants: '#f0e6d0', sash: '#2a5ad8', hat: 'plume', hatCol: '#2a5ad8', featherCol: '#e8c040', hair: 'short', hairCol: '#14100e', brow: '#14100e', build: 'stout', head: 'wide', skin: '#b07450', sandals: true },
  TL_LEAD: { ...ROBE, shirt: '#f0e6d0', pants: '#f0e6d0', sash: '#e8a030', hat: 'plume', hatCol: '#e8a030', featherCol: '#d8406a', hair: 'short', hairCol: '#14100e', brow: '#14100e', build: 'thin', head: 'tall', skin: '#c08258', sandals: true },
  EG_WORK: { shirt: '#f2ead6', pants: '#f2ead6', noButtons: true, rolled: true, hair: 'short', hairCol: '#14100e', brow: '#14100e', build: 'adult', head: 'round', skin: '#a8683e', sandals: true },
  OX_NOW: { hoodie: true, shirt: '#c85a3a', pants: '#3a3a4a', hair: 'curly', hairCol: '#2a1a12', brow: '#2a1a12', build: 'adult', head: 'egg', skin: '#d89a6a', shoes: '#f0f0f4', noButtons: true, glasses: true },
};
const OX_OPS = ['banner', 'bannerCol', 'card'];
export const oxOpts = (op) => { const r = {}; for (const k of OX_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props
const OX_HOLD = {
  // royal decree: an unrolled parchment with a red seal (no words, just scribble lines)
  decree: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 30, -70); const P = new Path2D(); P.rect(-40, -70, 80, 120); cel(g, P, '#f2e6c4', 3, 4, 3, 2); for (const y of [-70, 50]) cel(g, ellP(0, y, 46, 10), '#d8c8a0', 2.4, 0, 0, 0);
    for (let i = 0; i < 6; i++) line(g, [[-28, -46 + i * 14], [i % 3 === 2 ? 8 : 28, -46 + i * 14]], 2.2, 'rgba(60,40,30,0.6)'); cel(g, ellP(16, 34, 11, 11), '#c8202a', 2, 0, 0, 0); g.restore(); },
  book: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 24, -46); const P = new Path2D(); P.rect(-34, -44, 68, 88); cel(g, P, '#6a2a24', 3, 4, 3, 2); g.fillStyle = '#f2e6c4'; g.fillRect(s > 0 ? 28 : -34, -40, 6, 80); cel(g, ellP(0, 0, 12, 12), '#e8b830', 1.6, 0, 0, 0); g.restore(); },
  scroll: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 20, -40); g.rotate(s * 0.4); const P = new Path2D(); P.roundRect(-14, -60, 28, 120, 10); cel(g, P, '#efe2c0', 3, 3, 2, 2); line(g, [[-14, -20], [14, -20]], 4, '#c8302a'); g.restore(); },
  paddle: (g) => { const s = OVH.HSIDE; line(g, [[-s * 10, 60], [s * 20, -150]], 10, INK); line(g, [[-s * 10, 60], [s * 20, -150]], 6, '#a8784a'); g.save(); g.translate(-s * 14, 90); g.rotate(-s * 0.14); cel(g, ellP(0, 0, 16, 44), '#b8884e', 2.6, 2, 2, 0); g.restore(); },
  banner: (g, op = {}) => { const s = OVH.HSIDE; line(g, [[0, 30], [s * 4, -200]], 10, INK); line(g, [[0, 30], [s * 4, -200]], 6, '#8a5a30'); g.save(); g.translate(s * 4, -200); const c = op.bannerCol || '#c8302a', P = new Path2D(); P.moveTo(0, 0); P.lineTo(s * 90, 0); P.lineTo(s * 90, 110); P.lineTo(s * 45, 90); P.lineTo(0, 110); P.closePath(); cel(g, P, c, 3, 4, 3, 2);
    g.fillStyle = '#f6eed8'; g.beginPath(); g.arc(s * 45, 44, 22, 0, TAU); g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke(); g.restore(); },
  datecard: (g, op = {}) => { const s = OVH.HSIDE; g.save(); g.translate(s * 26, -70); g.rotate(s * 0.06); const P = new Path2D(); P.roundRect(-60, -44, 120, 88, 8); cel(g, P, '#f6eed8', 3, 4, 3, 2); g.fillStyle = '#c8302a'; g.fillRect(-60, -44, 120, 22);
    g.fillStyle = INK; g.font = 'bold 34px "DejaVu Serif", Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(op.card || '1096', 0, 14); g.restore(); },
  block: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 30, -50); const P = new Path2D(); P.rect(-40, -30, 80, 60); cel(g, P, '#e8cc98', 3, 5, 4, 2); g.restore(); },
};
Object.assign(OVH.HOLD, OX_HOLD);

// ---------- shared face bits
const bean = (g, x, y, k, E, blink, look = 0) => {
  if (blink >= 1 || E === 'happy' || E === 'laugh') { taper(g, [[x - 13 * k, y + 5 * k], [x, y - 9 * k], [x + 13 * k, y + 5 * k]], 5.5 * k, INK, 0.35); return; }
  if (E === 'dizzy') { taper(g, arcPts(x, y, 10 * k, 0, TAU * 1.6, 18), 3.6 * k, INK, 0.3); return; }
  if (E === 'love') { const r = 15 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(hp); return; }
  const sh = E === 'shock', rx = (sh ? 12 : 9.5) * k, ry = (sh ? 17 : 14) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k, P = ellP(lx, y, rx, ry);
  g.fillStyle = INK; g.fill(P); g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 6 * k, (sh ? 4 : 3.4) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
  g.save(); g.translate(lx - 3 * k, y - 6 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.8 * k, 2 * k, 0, 0, TAU); g.lineWidth = 1.2 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore(); };
const mouth = (g, x, my, E, k = 1) => { const MC = '#7a2238';
  if (E === 'shock') { const p = ellP(x, my + 4 * k, 11 * k, 15 * k); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4 * k; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad' || E === 'worried') taper(g, arcPts(x, my + 16 * k, 15 * k, Math.PI * 1.2, Math.PI * 1.8, 8), 4.4 * k, INK, 0.3);
  else if (E === 'happy' || E === 'love' || E === 'laugh') { const p = new Path2D(); p.moveTo(x - 20 * k, my - 4 * k); p.bezierCurveTo(x - 8 * k, my, x + 8 * k, my, x + 20 * k, my - 4 * k); p.bezierCurveTo(x + 16 * k, my + 18 * k, x - 16 * k, my + 18 * k, x - 20 * k, my - 4 * k); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4 * k; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'proud' || E === 'sly') taper(g, [[x - 15 * k, my], [x + 4 * k, my + 7 * k], [x + 19 * k, my - 7 * k]], 4.4 * k, INK, 0.3);
  else taper(g, arcPts(x, my - 10 * k, 18 * k, Math.PI * 0.2, Math.PI * 0.8, 10), 4.4 * k, INK, 0.3); };
const BRW = { smile: [2, -3, 2], happy: [0, -6, 0], laugh: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -14, -8], sad: [-10, -2, 8], worried: [-10, -2, 8], sly: [8, 2, 0], love: [0, -6, 0], dizzy: [-2, -6, -2] };

// ---------- SANDY: drawSandy(g, o, op) on the 600x1000 card (ground y≈965, centre x=300). A standing hourglass with a face.
// op.expr: smile | happy | shock | sad | sly | proud | love | dizzy | worried; op.pose: stand | wave | cheer | point | shrug | hips | shock;
// op.sand 0..1 = share of sand still in the top bulb; op.spin 0..1 = mid-flip (squash + tilt)
export function drawSandy(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, blink = op.blink || 0, look = op.look || 0, sand = op.sand == null ? 0.55 : op.sand, spin = op.spin || 0;
  const pose = op.pose || ({ shock: 'shock', proud: 'hips' }[E]) || 'stand';
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const hopA = pose === 'cheer' ? Math.abs(Math.sin(t * 0.35)) * 22 : 0, bob = Math.sin(t * 0.2) * 4 - hopA, tilt = (E === 'sad' ? 0.05 : E === 'shock' ? -0.05 : E === 'sly' ? 0.07 : Math.sin(t * 0.13) * 0.025) + Math.sin(spin * Math.PI) * 0.5;
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale(flip ? -1 : 1, 1);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 150, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  for (const s of [-1, 1]) { const fx = s * 50; cel(g, limb([[fx, -100 + bob], [fx + s * 6, -26]], [14, 12]), '#4a2e22', 2.6, 3, 2, 1); cel(g, ellP(fx + s * 10, -16, 34, 16), '#2a1a24', 2.8, 5, 3, 2); }
  g.translate(0, bob - 330); g.rotate(tilt); g.scale(1, 1 - 0.12 * Math.sin(spin * Math.PI));
  const W = 150, HB = 200, CAP = 34, WOOD = '#9a5a2e';
  // glass bulbs (top: y -HB..0, bottom: 0..HB) as one hourglass outline
  const glass = new Path2D(); glass.moveTo(-W, -HB); glass.bezierCurveTo(-W, -HB * 0.35, -22, -40, -14, 0); glass.bezierCurveTo(-22, 40, -W, HB * 0.35, -W, HB); glass.lineTo(W, HB); glass.bezierCurveTo(W, HB * 0.35, 22, 40, 14, 0); glass.bezierCurveTo(22, -40, W, -HB * 0.35, W, -HB); glass.closePath();
  g.fillStyle = 'rgba(200,225,245,0.55)'; g.fill(glass);
  // sand: top heap shrinks with sand, bottom heap grows, a falling stream
  g.save(); g.clip(glass); const SC = '#f0c060', SD = '#d89a3a';
  const topY = -14 - (HB - 30) * sand; g.fillStyle = SC; g.fillRect(-W, topY, 2 * W, -topY); g.fillStyle = SD; g.fillRect(-W, topY, 2 * W, 8);
  const bh = (HB - 20) * (1 - sand) * 0.85 + 10; const pile = new Path2D(); pile.moveTo(-W, HB); pile.lineTo(-W, HB - bh * 0.55); pile.quadraticCurveTo(0, HB - bh * 1.35, W, HB - bh * 0.55); pile.lineTo(W, HB); pile.closePath(); g.fillStyle = SC; g.fill(pile);
  if (sand > 0.02 && spin < 0.05) { g.fillStyle = SD; g.fillRect(-4, -4, 8, HB - bh * 0.9); for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(Math.sin(t * 0.9 + i * 2) * 3, ((t * 9 + i * 37) % (HB - bh)), 3.5, 0, TAU); g.fill(); } }
  g.fillStyle = 'rgba(58,42,122,0.18)'; g.fillRect(W * 0.3, -HB, W, 2 * HB); g.restore();
  g.lineWidth = 5; g.strokeStyle = INK; g.stroke(glass);
  taper(g, [[-W * 0.7, -HB * 0.85], [-W * 0.62, -HB * 0.45]], 9, 'rgba(255,255,255,0.75)', 0.3); taper(g, [[-W * 0.7, HB * 0.5], [-W * 0.62, HB * 0.8]], 7, 'rgba(255,255,255,0.55)', 0.3);
  // wooden caps + four posts
  for (const y of [-HB - CAP / 2, HB + CAP / 2]) { const P = new Path2D(); P.roundRect(-W - 26, y - CAP / 2, 2 * W + 52, CAP, 10); cel(g, P, WOOD, 4, 6, 4, 3); taper(g, [[-W - 14, y - 6], [W - 10, y - 6]], 4, 'rgba(255,230,190,0.35)', 0.3); }
  for (const s of [-1, 1]) { const x = s * (W + 12); cel(g, limb([[x, -HB], [x, HB]], [9, 9]), mixc(WOOD, '#3a1a10', 0.25), 3, 3, 2, 1); for (const y of [-HB * 0.5, 0, HB * 0.5]) cel(g, ellP(x, y, 13, 10), WOOD, 2.4, 2, 1, 0); }
  // face on the top bulb (over the sand)
  const ex = 46, k = 1.25, ey = -HB * 0.52;
  const fp = new Path2D(); fp.roundRect(-104, ey - 62, 208, 140, 46); g.fillStyle = 'rgba(250,244,228,0.88)'; g.fill(fp);
  for (const s of [-1, 1]) bean(g, s * ex + look * 6, ey, k, E, blink, look);
  const BR = BRW[E] || BRW.smile; for (const s of [-1, 1]) { const by = ey - 40; taper(g, [[s * (ex - 18), by + BR[0]], [s * ex, by + BR[1]], [s * (ex + 18), by + BR[2]]], 6, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 28), ey + 34, 16, 8, 0, 0, TAU); g.fillStyle = 'rgba(255,120,150,0.75)'; g.fill(); }
  mouth(g, 0, ey + 54, E);
  if (E === 'shock' || E === 'worried') { g.beginPath(); const sx = W - 30, sy = -HB + 40; g.moveTo(sx, sy); g.quadraticCurveTo(sx + 14, sy + 24, sx, sy + 30); g.quadraticCurveTo(sx - 14, sy + 24, sx, sy); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); }
  // arms from the posts
  for (const s of [-1, 1]) { const S = [s * (W + 18), -30]; let E3, Hd;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 16 : Math.sin(t * 0.4 + s) * 6; E3 = [S[0] + s * 50, S[1] - 50]; Hd = [S[0] + s * 56 + w, S[1] - 116]; }
    else if (pose === 'shock') { E3 = [S[0] + s * 54, S[1] - 6]; Hd = [S[0] + s * 60, S[1] - 72]; }
    else if (pose === 'hips') { E3 = [S[0] + s * 52, S[1] + 44]; Hd = [S[0] + s * 4, S[1] + 90]; }
    else if (pose === 'shrug') { E3 = [S[0] + s * 52, S[1] + 26]; Hd = [S[0] + s * 96, S[1] - 14]; }
    else if (pose === 'point' && s > 0) { E3 = [S[0] + 60, S[1] - 10]; Hd = [S[0] + 120, S[1] - 44]; }
    else { E3 = [S[0] + s * 26, S[1] + 64]; Hd = [S[0] + s * 30, S[1] + 122]; }
    cel(g, limb([S, E3, Hd], [14, 13, 12]), '#4a2e22', 2.6, 4, 3, 2); cel(g, ellP(Hd[0], Hd[1], 19, 17), '#f2f2f6', 2.6, 4, 3, 2); }
  g.restore(); }

// ---------- MAMMO: drawMammo(g, o, op), a side-view woolly mammoth on the 600x1000 card, facing +x (op.flip faces -x).
// op.walk = gait phase (undefined = standing), op.expr (smile | happy | shock | sad | sly | love), op.kid = calf colouring, op.trunk 0..1 = trunk raised
export function drawMammo(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, blink = op.blink || 0, kid = !!op.kid, walk = op.walk, tr = op.trunk || 0;
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const FUR = kid ? '#a8683a' : '#7a4a2a', FUR2 = mixc(FUR, '#2a1a24', 0.35), FURL = mixc(FUR, '#f0c890', 0.3);
  g.save(); g.translate(300, 965); g.scale((flip ? -1 : 1) * 0.62, 0.62); /* fits the 600-wide card: x -165..+265 */
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 250, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.24)'; g.fill(); g.restore();
  const ph = walk == null ? 0 : walk * TAU, bob = walk == null ? Math.sin(t * 0.12) * 3 : -Math.abs(Math.sin(ph)) * 8;
  // legs (far pair darker, drawn first)
  const leg = (x, a, far) => { const sw = walk == null ? 0 : Math.sin(ph + a) * 34, top = [x, -250 + bob], ft = [x + sw, -18 + (walk == null ? 0 : Math.max(0, Math.sin(ph + a + 1.6)) * -16)];
    cel(g, limb([top, [x + sw * 0.5, -130 + bob * 0.5], ft], [46, 40, 40]), far ? FUR2 : FUR, 3.4, 5, 3, 2); cel(g, ellP(ft[0], ft[1] - 4, 42, 18), far ? '#4a3a3a' : '#6a5654', 3, 4, 2, 1);
    for (let i = -1; i <= 1; i++) cel(g, ellP(ft[0] + 22 + i * 11, ft[1] + 2, 6, 5), '#e8dcc8', 1.4, 0, 0, 0); };
  leg(-140, Math.PI, true); leg(110, 0, true);
  // body: big shaggy hump, shoulder hump high at the front
  const body = new Path2D(); body.moveTo(-230, -230 + bob); body.bezierCurveTo(-250, -380 + bob, -120, -470 + bob, 20, -470 + bob); body.bezierCurveTo(120, -500 + bob, 190, -470 + bob, 200, -390 + bob);
  body.bezierCurveTo(220, -320 + bob, 190, -200 + bob, 130, -170 + bob); body.lineTo(-170, -160 + bob); body.bezierCurveTo(-230, -170 + bob, -240, -200 + bob, -230, -230 + bob); body.closePath();
  cel(g, body, FUR, 4.4, 14, 8, 5);
  g.save(); g.clip(body); for (let i = 0; i < 46; i++) { const x = -230 + (i * 37) % 430, y = -460 + ((i * 71) % 290) + bob; taper(g, [[x, y], [x + 4, y + 30], [x - 2, y + 54]], 3, i % 3 ? FUR2 : FURL, 0.4); } g.restore();
  // shaggy skirt fringe along the belly
  for (let i = 0; i < 14; i++) { const x = -200 + i * 26, y = -168 + bob; taper(g, [[x, y - 10], [x + 4, y + 26 + (i % 3) * 8], [x - 3, y + 44 + (i % 2) * 10]], 7, FUR2, 0.5); }
  // tail
  taper(g, [[-232, -300 + bob], [-262, -250 + bob + Math.sin(t * 0.3) * 6], [-266, -210 + bob]], 9, FUR2, 0.5);
  leg(-110, 0, false); leg(140, Math.PI, false);
  // head: domed skull in front of the shoulder hump
  const hx = 210, hy = -380 + bob, head = new Path2D(); head.moveTo(hx - 60, hy + 90); head.bezierCurveTo(hx - 90, hy - 20, hx - 40, hy - 130, hx + 30, hy - 120); head.bezierCurveTo(hx + 90, hy - 110, hx + 100, hy - 30, hx + 80, hy + 40); head.bezierCurveTo(hx + 60, hy + 90, hx, hy + 110, hx - 60, hy + 90); head.closePath();
  cel(g, head, FUR, 4, 10, 6, 4); g.save(); g.clip(head); for (let i = 0; i < 12; i++) { const x = hx - 50 + (i * 23) % 130, y = hy - 110 + (i * 37) % 120; taper(g, [[x, y], [x + 3, y + 24]], 3, FUR2, 0.4); } g.restore();
  // little ear
  cel(g, ellP(hx - 40, hy - 20, 24, 30, 0.2), FUR2, 3, 3, 2, 1);
  // trunk: hangs and curls; tr raises it
  const tp = [[hx + 70, hy + 30], [hx + 96, hy + 110 - 60 * tr], [hx + 92 + 40 * tr, hy + 190 - 210 * tr], [hx + 64 + 90 * tr, hy + 210 - 300 * tr]];
  cel(g, limb(tp, [34, 28, 22, 16]), FUR, 3.6, 5, 3, 2); for (let i = 1; i < 6; i++) { const a = tp[Math.min(3, Math.floor(i / 2))]; line(g, [[a[0] - 14, a[1] + i * 3], [a[0] + 10, a[1] + i * 3 + 2]], 2, 'rgba(43,29,74,0.35)'); }
  // tusks: long ivory curves
  for (const [dx, far] of [[-14, 1], [0, 0]]) { const tu = [[hx + 52 + dx, hy + 60], [hx + 110 + dx, hy + 140], [hx + 200 + dx, hy + 110], [hx + 210 + dx, hy + 40]]; taper(g, tu, far ? 20 : 26, INK, 0.25); taper(g, tu, far ? 14 : 19, far ? '#d8ccb0' : '#f4ecd8', 0.25); }
  // face: bean eye with orbit shine, brow, blush, smile at the trunk base
  const ex = hx + 30, ey = hy - 30; bean(g, ex, ey, 1.25, E, blink, 0);
  const BR = BRW[E] || BRW.smile; taper(g, [[ex - 20, ey - 38 + BR[0]], [ex, ey - 42 + BR[1]], [ex + 20, ey - 38 + BR[2]]], 6, INK, 0.35);
  g.beginPath(); g.ellipse(ex + 10, ey + 36, 20, 10, 0, 0, TAU); g.fillStyle = 'rgba(255,120,150,0.7)'; g.fill();
  mouth(g, hx + 40, hy + 64, E, 0.8);
  if (E === 'shock') { g.beginPath(); const sx = hx + 70, sy = hy - 110; g.moveTo(sx, sy); g.quadraticCurveTo(sx + 14, sy + 24, sx, sy + 30); g.quadraticCurveTo(sx - 14, sy + 24, sx, sy); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); }
  if (op.snow) { g.fillStyle = 'rgba(255,255,255,0.9)'; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(-180 + i * 44, -462 + bob + Math.sin(i * 1.7) * 14 + (i > 4 ? 10 : 0), 18, 7, 0, 0, TAU); g.fill(); } }
  g.restore(); }

// ---------- lineup (?oxcast=N)
const KT = [
  { d: 7.0, a: [['OX_MASTER', { expr: 'smile', prop: 'book' }], ['OX_SCH1', { expr: 'happy', prop: 'scroll' }], ['OX_SCH2', { expr: 'laugh' }], ['OX_SCH3', { expr: 'smug' }], ['OX_SCH4', { expr: 'excited' }], ['OX_KING', { expr: 'angry', prop: 'decree' }]] },
  { d: 7.0, a: [['MX_LEAD', { expr: 'proud', prop: 'banner', bannerCol: '#c8302a' }], ['TX_LEAD', { expr: 'happy', prop: 'banner', bannerCol: '#2a5ad8' }], ['TL_LEAD', { expr: 'smile', prop: 'banner', bannerCol: '#e8a030' }], ['MX_ROW', { expr: 'smile', prop: 'paddle' }], ['MX_WOM', { expr: 'happy' }], ['EG_WORK', { expr: 'determined', prop: 'block' }]] },
  { d: 9.0, a: [['OX_TOWN1', { expr: 'smile' }], ['OX_TOWN2', { expr: 'surprised' }], ['OX_NOW', { expr: 'happy', prop: 'datecard', card: '1428' }], ['SANDY', { expr: 'happy', pose: 'wave', sand: 0.7 }], ['SANDY', { expr: 'shock', sand: 0.3 }], ['MAMMO', { expr: 'happy', walk: 0.3 }]] },
];
export function oxTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'SANDY' ? 0.42 : o === 'MAMMO' ? 1.4 : o === 'OX_SCH4' ? 0.85 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
