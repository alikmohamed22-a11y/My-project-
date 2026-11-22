// [SK-cast] "The Super Soaker was invented by a NASA engineer": outfit table (merged into ODD by main.js), props (into oddverra's HOLD),
// DRIPPY (a little living water drop, the sidekick; drawDrippy on the 600x1000 card) and a cast lineup (?skcast=N).
// Lonnie Johnson is our own stylization; everyone else is an invented generic design. NO real toy logos or brand art anywhere: every
// blaster is the invented chunky "tank-on-top" design with plain colour panels and no wordmark; the brand names are only spoken.
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, ellP, limb, arcPts, mixc } = OVK;
const TAU = Math.PI * 2;

const LJ = { skin: '#7a4a30', hair: 'short', hairCol: '#1a1210', brow: '#1a1210', moustache: '#1a1210', glasses: true, head: 'egg', build: 'adult' };
export const SK_ODD = {
  SK_LJLAB: { ...LJ, coat: true, shirt: '#f2f0ea', pants: '#4a4a56', collar: '#cfdcea', cuff: '#f2f0ea', neck: 'tie', neckCol: '#2a4a8a', button: '#c8c8d0', pencil: true, pocket: true, noChain: true, shoes: '#2a2020' }, // JPL engineer (lab coat)
  SK_LJ: { ...LJ, shirt: '#e8d8a8', pants: '#5a4030', collar: '#e8d8a8', rolled: true, noButtons: true, shoes: '#3a2a22' },                       // at home, 1982, sleeves rolled
  SK_LJ13: { ...LJ, hairCol: '#a8a8b0', brow: '#9a9aa2', moustache: '#b0b0b8', beard: true, beardShort: true, beardCol: '#b0b0b8', build: 'stout', shirt: '#2a2e3e', pants: '#2a2e3e', suitCol: '#2a2e3e', coat: true, cuff: '#2a2e3e', collar: '#f4f2ee', neck: 'tie', neckCol: '#8a2a3a', button: '#1a1a20', noChain: true, shoes: '#16141a' }, // 2013
  SK_ARB: { coat: true, shirt: '#3a3a48', pants: '#3a3a48', collar: '#f2efe8', cuff: '#3a3a48', neck: 'bow', neckCol: '#5a2a3a', button: '#1a1a20', noChain: true, glasses: true, hair: 'side', hairCol: '#c8c8d0', brow: '#b0b0b8', build: 'old', head: 'wide', skin: '#ecb890', shoes: '#16141a' },
  SK_LAW: { lashes: true, coat: true, shirt: '#5a3a5a', pants: '#2a2a36', collar: '#f2efe8', cuff: '#5a3a5a', button: '#1a1a20', noChain: true, earring: true, hair: 'bun', hairCol: '#3a2418', head: 'egg', skin: '#c88a60', shoes: '#16141a' },
  SK_ENG: { coat: true, lashes: true, shirt: '#f2f0ea', pants: '#3a5a7a', collar: '#e8c8d0', cuff: '#f2f0ea', noChain: true, glasses: true, hair: 'curly', hairCol: '#6a3a22', head: 'round', skin: '#f2c8a0', shoes: '#3a2a22' }, // JPL colleague
  SK_KIDA: { shirt: '#30c8a0', pattern: 'stripe', stripe: true, stripeCol: '#f8f040', pants: '#e83a8a', short: true, hair: 'spiky', hairCol: '#2a1a12', brow: '#2a1a12', build: 'kid', head: 'round', skin: '#e0a070', shoes: '#f0f0f6', noButtons: true }, // big brother (neon 90s)
  SK_KIDB: { shirt: '#f8a030', pants: '#3a6ad8', short: true, hair: 'curly', hairCol: '#4a2a18', brow: '#4a2a18', build: 'kid', head: 'round', skin: '#f0c098', shoes: '#e83a3a', noButtons: true },                     // little brother
  SK_KIDC: { lashes: true, shirt: '#a05ae8', pants: '#30c8a0', short: true, hair: 'bun', hairCol: '#1a1210', build: 'kid', head: 'egg', skin: '#8a5a3a', shoes: '#f8f040', earring: true, noButtons: true },          // neighbour girl
  SK_KIDD: { shirt: '#e8e030', pattern: 'stripe', stripe: true, stripeCol: '#3a8ae8', pants: '#2a2a36', short: true, hat: 'cap', hatCol: '#e83a3a', plainCap: true, hair: 'short', hairCol: '#c89040', build: 'kid', head: 'wide', skin: '#f6d0b0', shoes: '#f0f0f6', noButtons: true },
  SK_DAD90: { shirt: '#5ac8e8', pattern: 'stripe', stripe: true, stripeCol: '#f8f0e0', pants: '#c8b080', short: true, hair: 'short', hairCol: '#3a2418', brow: '#3a2418', moustache: '#3a2418', build: 'stout', head: 'wide', skin: '#e4aa82', shoes: '#f0f0f6', noButtons: true },
};
const SK_OPS = ['blCol', 'wet', 'boxCol'];
export const skOpts = (op) => { const r = {}; for (const k of SK_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- the invented water blaster (side view, nozzle pointing +x; centre at the grip). col key -> [body, tank, trim]
export const BL = { lime: ['#7ad83a', '#ffd23a', '#2a6ae0'], orange: ['#ff8a2a', '#3ad0f0', '#7a3ad8'], pink: ['#ff4aa8', '#7ad83a', '#ffd23a'], blue: ['#3a8aff', '#ff8a2a', '#ffd23a'], proto: ['#f2f0ea', '#cfe8f0', '#9aa0aa'] };
export function blaster(g, w, col = 'lime', o = {}) { const [body, tank, trim] = BL[col] || BL.lime, k = w / 200;
  g.save(); g.scale(k, k); g.lineJoin = 'round';
  // pump handle under the barrel (slides back with o.pump 0..1)
  const pu = (o.pump || 0) * 26; const PH = new Path2D(); PH.roundRect(10 - pu, 18, 66, 20, 9); cel(g, PH, trim, 3, 3, 2, 1);
  // barrel + nozzle
  const BA = new Path2D(); BA.roundRect(-30, -6, 150, 24, 10); cel(g, BA, body, 3.4, 4, 3, 2); const NZ = new Path2D(); NZ.roundRect(116, -2, 20, 16, 4); cel(g, NZ, trim, 3, 2, 1, 0);
  // grip + trigger
  const GR = new Path2D(); GR.moveTo(-34, 10); GR.lineTo(-6, 10); GR.lineTo(-14, 64); GR.quadraticCurveTo(-16, 72, -26, 72); GR.lineTo(-40, 72); GR.quadraticCurveTo(-48, 70, -46, 60); GR.closePath(); cel(g, GR, body, 3.4, 4, 3, 2);
  g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.moveTo(-4, 18); g.quadraticCurveTo(4, 30, -2, 40); g.stroke();
  // the tank on top (translucent, water level)
  const TK = new Path2D(); TK.roundRect(-20, -52, 96, 46, 20); g.fillStyle = tank; g.fill(TK); g.save(); g.clip(TK); g.fillStyle = 'rgba(80,170,255,0.55)'; g.fillRect(-22, -30 + (o.empty || 0) * 22, 100, 40); g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(-10, -48, 10, 38); g.restore();
  g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(TK); const CP = new Path2D(); CP.roundRect(54, -60, 18, 10, 3); cel(g, CP, trim, 2.6, 2, 1, 0);
  // stripes + bolts (no wordmark)
  g.fillStyle = trim; g.fillRect(30, -2, 40, 6); for (const x of [-18, 96]) { g.beginPath(); g.arc(x, 6, 4, 0, TAU); g.fillStyle = '#f2f2f6'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); }
  g.restore(); }
// the 1982 home-made prototype: white PVC tubes + elbow, a clear soda bottle as the tank, a Plexiglas pump plate
export function proto(g, w) { const k = w / 200; g.save(); g.scale(k, k); g.lineJoin = 'round';
  const pipe = (x0, y0, x1, y1, r) => { const L = new Path2D(); const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a) * r, ny = Math.cos(a) * r; L.moveTo(x0 + nx, y0 + ny); L.lineTo(x1 + nx, y1 + ny); L.lineTo(x1 - nx, y1 - ny); L.lineTo(x0 - nx, y0 - ny); L.closePath(); cel(g, L, '#f2f0ea', 3, 3, 2, 1); };
  pipe(-40, 8, 130, 8, 10); pipe(-30, 14, -40, 70, 10); pipe(0, 24, 70, 24, 7); const NZ = new Path2D(); NZ.roundRect(128, 0, 14, 16, 3); cel(g, NZ, '#c8a050', 2.6, 2, 1, 0);
  for (const x of [-40, 60]) { const J = new Path2D(); J.roundRect(x - 8, -6, 16, 28, 4); cel(g, J, '#e2e0da', 2.6, 2, 1, 0); }
  // soda bottle (upside down on top, clear with water)
  const B = new Path2D(); B.moveTo(10, -6); B.lineTo(10, -16); B.quadraticCurveTo(-6, -24, -6, -40); B.lineTo(-6, -96); B.quadraticCurveTo(-6, -106, 4, -106); B.lineTo(56, -106); B.quadraticCurveTo(66, -106, 66, -96); B.lineTo(66, -40); B.quadraticCurveTo(66, -24, 50, -16); B.lineTo(50, -6); B.closePath();
  g.fillStyle = 'rgba(210,240,250,0.85)'; g.fill(B); g.save(); g.clip(B); g.fillStyle = 'rgba(80,170,255,0.6)'; g.fillRect(-10, -70, 80, 70); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(4, -100, 8, 80); g.fillStyle = '#e83a3a'; g.fillRect(-10, -82, 80, 14); g.restore(); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(B);
  g.restore(); }
// a water drop icon
export function dropIcon(g, r, col = '#5ab8ff') { const P = new Path2D(); P.moveTo(0, -r * 1.5); P.bezierCurveTo(r * 0.4, -r * 0.8, r, -r * 0.3, r, r * 0.25); P.arc(0, r * 0.25, r, 0, Math.PI); P.bezierCurveTo(-r, -r * 0.3, -r * 0.4, -r * 0.8, 0, -r * 1.5); g.fillStyle = col; g.fill(P); g.lineWidth = Math.max(1.5, r * 0.1); g.strokeStyle = INK; g.stroke(P); g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(-r * 0.35, -r * 0.05, r * 0.16, r * 0.32, 0.3, 0, TAU); g.fill(); }
// the toy box (generic): bright card box with a window showing the blaster, "NEW! WATER BLASTER" only
export function toyBox(g, w, h, col = 'lime', o = {}) { const [body, tank, trim] = BL[col] || BL.lime; g.fillStyle = trim; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 10; i++) g.fillRect(i * w / 10, 0, w / 20, h);
  g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(w * 0.08, h * 0.28, w * 0.84, h * 0.5, w * 0.05); g.fill(); g.lineWidth = w * 0.015; g.strokeStyle = INK; g.stroke();
  g.save(); g.translate(w * 0.36, h * 0.52); blaster(g, w * 0.55, col); g.restore();
  g.fillStyle = '#ffe23a'; g.save(); g.translate(w * 0.8, h * 0.14); g.rotate(0.2); g.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = i % 2 ? w * 0.08 : w * 0.13; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
  g.fillStyle = '#e8203a'; g.font = `bold ${w * 0.06 | 0}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NEW!', 0, 0); g.restore();
  g.fillStyle = '#ffffff'; g.font = `bold ${w * 0.085 | 0}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.word || 'WATER BLASTER', w / 2, h * 0.88);
  g.fillStyle = body; g.fillRect(0, 0, w * 0.6, h * 0.06); g.fillStyle = tank; g.fillRect(w * 0.6, 0, w * 0.4, h * 0.06); }

// ---------- props
const SK_HOLD = {
  blaster: (g, op = {}) => { const s = OVH.HSIDE; g.save(); g.translate(s * 30, -40); g.scale(s, 1); blaster(g, 190, op.blCol || 'lime', { pump: op.pump || 0.5 + 0.5 * Math.sin((op.t || 0) * 0.5) }); g.restore(); },
  proto: (g, op = {}) => { const s = OVH.HSIDE; g.save(); g.translate(s * 28, -36); g.scale(s, 1); proto(g, 150); g.restore(); },
  nozzle: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 22, -44); g.rotate(s * -0.4); const P = new Path2D(); P.roundRect(-10, -36, 20, 60, 6); cel(g, P, '#d8a840', 3, 3, 2, 1); const T = new Path2D(); T.moveTo(-6, -36); T.lineTo(6, -36); T.lineTo(3, -52); T.lineTo(-3, -52); T.closePath(); cel(g, T, '#c89030', 2.6, 2, 1, 0); g.restore(); },
  wrench: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 24, -50); g.rotate(s * 0.5); const P = new Path2D(); P.roundRect(-7, -10, 14, 90, 6); cel(g, P, '#b8bcc6', 3, 3, 2, 1); const Hd = new Path2D(); Hd.arc(0, -18, 20, 0.6, Math.PI * 2 - 0.6 + Math.PI, false); Hd.closePath(); cel(g, ellP(0, -20, 20, 18), '#b8bcc6', 3, 3, 2, 1); g.fillStyle = '#4a4a56'; g.fillRect(-6, -40, 12, 18); g.restore(); },
  toybox: (g, op = {}) => { const s = OVH.HSIDE; g.save(); g.translate(s * 14, -96); g.rotate(s * 0.06); g.save(); g.translate(-60, -56); const P = new Path2D(); P.rect(0, 0, 120, 112); g.save(); g.clip(P); toyBox(g, 120, 112, op.blCol || 'lime', { word: op.boxWord }); g.restore(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(P); g.restore(); g.restore(); },
  letter: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 24, -56); g.rotate(s * 0.12); const P = new Path2D(); P.rect(-40, -52, 80, 104); cel(g, P, '#f6f2e6', 3, 2, 1, 0); g.fillStyle = 'rgba(60,50,60,0.6)'; for (let i = 0; i < 6; i++) g.fillRect(-30, -36 + i * 11, i % 3 === 2 ? 34 : 60, 4); g.strokeStyle = '#d0262c'; g.lineWidth = 6; g.beginPath(); g.moveTo(-26, 30); g.lineTo(26, 46); g.moveTo(26, 30); g.lineTo(-26, 46); g.stroke(); g.restore(); },
  folder: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 22, -56); g.rotate(s * 0.08); const P = new Path2D(); P.roundRect(-46, -40, 92, 74, 5); cel(g, P, '#d8b060', 3, 3, 2, 1); g.fillStyle = '#f6f2e6'; g.fillRect(-38, -46, 70, 10); g.restore(); },
};
Object.assign(OVH.HOLD, SK_HOLD);

// ---------- DRIPPY: drawDrippy(g, o, op) on the 600x1000 card (ground y=965, centre x=300). A standing water drop with a face.
// op.expr: 'smile' | 'happy' | 'shock' | 'sad' | 'sly' | 'proud' | 'love' | 'dazed' ; op.pose: 'stand' | 'wave' | 'cheer' | 'point' | 'shrug' | 'hips' | 'shock' | 'soso'
const dEye = (g, x, y, k, E, blink, look) => {
  if (blink >= 1 || E === 'happy') { taper(g, [[x - 13 * k, y + 5 * k], [x, y - 9 * k], [x + 13 * k, y + 5 * k]], 5.5 * k, INK, 0.35); return; }
  if (E === 'love') { const r = 15 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(hp); return; }
  if (E === 'dazed') { g.lineWidth = 3.4 * k; g.strokeStyle = INK; g.beginPath(); for (let i = 0; i < 30; i++) { const a = i * 0.55, r = i * 0.5 * k; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.stroke(); return; }
  const sh = E === 'shock', rx = (sh ? 12 : 9.5) * k, ry = (sh ? 17 : 14) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k, P = ellP(lx, y, rx, ry);
  g.fillStyle = INK; g.fill(P); g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 6 * k, (sh ? 4 : 3.4) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
  g.save(); g.translate(lx - 3 * k, y - 6 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.8 * k, 2 * k, 0, 0, TAU); g.lineWidth = 1.2 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  const lid = { proud: 0.45, sly: 0.5, sad: 0.25 }[E]; if (lid && blink < 0.5) { const yl = y - ry + 2 * ry * lid; g.save(); g.clip(ellP(lx, y, rx + 3, ry + 3)); g.fillStyle = '#7ac8ff'; g.fillRect(lx - rx - 6, y - ry - 8, 2 * rx + 12, yl - (y - ry - 8)); g.restore(); taper(g, [[lx - rx - 2, yl], [lx + rx + 2, yl]], 3 * k, INK, 0.3); } };
export function drawDrippy(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, blink = op.blink || 0, look = op.look || 0;
  const pose = op.pose || ({ shock: 'shock', proud: 'hips' }[E]) || 'stand';
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const hopA = pose === 'cheer' ? Math.abs(Math.sin(t * 0.35)) * 22 : 0, wob = Math.sin(t * 0.3) * 0.03, bob = Math.sin(t * 0.2) * 4 - hopA, tilt = E === 'sad' ? 0.05 : E === 'shock' ? -0.05 : E === 'sly' ? 0.07 : pose === 'soso' ? 0.12 * Math.sin(t * 0.5) : Math.sin(t * 0.13) * 0.03;
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale(flip ? -1 : 1, 1);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 150, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  // a little puddle under the feet
  g.save(); g.scale(1, 0.18); g.beginPath(); g.ellipse(0, -20, 120, 50, 0, 0, TAU); g.fillStyle = 'rgba(120,200,255,0.55)'; g.fill(); g.lineWidth = 8; g.strokeStyle = 'rgba(43,29,74,0.5)'; g.stroke(); g.restore();
  for (const s of [-1, 1]) { const fx = s * 50; cel(g, limb([[fx, -120 + bob], [fx + s * 6, -26]], [14, 12]), '#2a5aa8', 2.6, 3, 2, 1); cel(g, ellP(fx + s * 10, -16, 34, 16), '#ffd23a', 2.8, 5, 3, 2); }
  g.translate(0, bob); g.scale(1 + wob, 1 - wob); g.rotate(tilt);
  // the drop body: round bottom, pointed curling tip
  const R = 175, CY = -300, P = new Path2D(); const tipX = 18 * Math.sin(t * 0.15);
  P.moveTo(tipX, CY - R * 2.05); P.bezierCurveTo(R * 0.35, CY - R * 1.3, R * 1.0, CY - R * 0.55, R, CY + R * 0.05); P.arc(0, CY + R * 0.05, R, 0, Math.PI); P.bezierCurveTo(-R, CY - R * 0.55, -R * 0.35, CY - R * 1.3, tipX, CY - R * 2.05); P.closePath();
  g.save(); g.translate(12, 12); g.fillStyle = mixc('#2a7ad8', '#3a2a7a', 0.3); g.fill(P); g.restore();
  g.fillStyle = '#5ab8ff'; g.fill(P); g.save(); g.clip(P);
  const gr = g.createLinearGradient(-R, CY - R, R, CY + R); gr.addColorStop(0, 'rgba(220,245,255,0.7)'); gr.addColorStop(0.45, 'rgba(160,220,255,0.1)'); gr.addColorStop(1, 'rgba(30,90,200,0.35)'); g.fillStyle = gr; g.fillRect(-2 * R, CY - 2.2 * R, 4 * R, 4 * R);
  g.fillStyle = 'rgba(58,42,122,0.25)'; g.beginPath(); g.ellipse(R * 0.55, CY + R * 0.4, R * 0.5, R * 0.7, -0.4, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.ellipse(-R * 0.55, CY - R * 0.35, 22, 56, 0.35, 0, TAU); g.fill(); g.beginPath(); g.arc(-R * 0.42, CY - R * 0.85, 12, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(Math.sin(i * 2.1 + t * 0.05) * R * 0.5, CY + R * 0.3 - ((t * 2 + i * 40) % 160), 6 + i % 3 * 3, 0, TAU); g.fill(); }
  g.restore(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(P);
  // face
  const ex = 56, k = 1.3, ey = CY + 6;
  for (const s of [-1, 1]) dEye(g, s * ex + look * 6, ey, k, E, blink, look);
  const BRW = { smile: [2, -3, 2], happy: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -14, -8], sad: [-10, -2, 8], sly: [8, 2, 0], love: [0, -6, 0], dazed: [-4, -8, -4] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = ey - 44; taper(g, [[s * (ex - 18), by + BRW[0]], [s * ex, by + BRW[1]], [s * (ex + 18), by + BRW[2]]], 6, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 34), ey + 38, 18, 9, 0, 0, TAU); g.fillStyle = 'rgba(255,110,140,0.7)'; g.fill(); }
  const my = ey + 58, MC = '#7a2238';
  if (E === 'shock' || E === 'dazed') { const p = ellP(0, my + 4, 11, 15); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad') taper(g, arcPts(0, my + 16, 15, Math.PI * 1.2, Math.PI * 1.8, 8), 4.4, INK, 0.3);
  else if (E === 'happy' || E === 'love') { const p = new Path2D(); p.moveTo(-20, my - 4); p.bezierCurveTo(-8, my, 8, my, 20, my - 4); p.bezierCurveTo(16, my + 18, -16, my + 18, -20, my - 4); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'proud' || E === 'sly') taper(g, [[-15, my], [4, my + 7], [19, my - 7]], 4.4, INK, 0.3);
  else taper(g, arcPts(0, my - 10, 18, Math.PI * 0.2, Math.PI * 0.8, 10), 4.4, INK, 0.3);
  // arms
  for (const s of [-1, 1]) { const S = [s * R * 0.92, CY + 40]; let E3, Hd;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 16 : Math.sin(t * 0.4 + s) * 6; E3 = [S[0] + s * 50, S[1] - 46]; Hd = [S[0] + s * 56 + w, S[1] - 110]; }
    else if (pose === 'shock') { E3 = [S[0] + s * 54, S[1] - 6]; Hd = [S[0] + s * 60, S[1] - 70]; }
    else if (pose === 'hips') { E3 = [S[0] + s * 52, S[1] + 40]; Hd = [S[0] + s * 6, S[1] + 84]; }
    else if (pose === 'shrug' || pose === 'soso') { const w = pose === 'soso' ? s * Math.sin(t * 0.5) * 18 : 0; E3 = [S[0] + s * 52, S[1] + 26]; Hd = [S[0] + s * 96, S[1] - 14 + w]; }
    else if (pose === 'point' && s > 0) { E3 = [S[0] + 60, S[1] - 10]; Hd = [S[0] + 118, S[1] - 40]; }
    else { E3 = [S[0] + s * 28, S[1] + 60]; Hd = [S[0] + s * 32, S[1] + 116]; }
    cel(g, limb([S, E3, Hd], [14, 13, 12]), '#2a5aa8', 2.6, 4, 3, 2); cel(g, ellP(Hd[0], Hd[1], 19, 17), '#f2f2f6', 2.6, 4, 3, 2); }
  g.restore(); }

// ---------- lineup (?skcast=N)
const KT = [
  { d: 7.0, a: [['SK_LJLAB', { expr: 'smile' }], ['SK_LJ', { expr: 'surprised', prop: 'nozzle' }], ['SK_LJ', { expr: 'excited', prop: 'proto' }], ['SK_LJ13', { expr: 'smug' }], ['SK_ENG', { expr: 'happy' }], ['DRIPPY', { expr: 'happy', pose: 'wave' }]] },
  { d: 6.5, a: [['SK_KIDA', { expr: 'excited', prop: 'blaster', blCol: 'lime', view: '34R' }], ['SK_KIDB', { expr: 'shock', prop: 'blaster', blCol: 'orange', view: '34L' }], ['SK_KIDC', { expr: 'laugh', prop: 'blaster', blCol: 'pink', view: 'side' }], ['SK_KIDD', { expr: 'excited', prop: 'toybox', blCol: 'blue' }], ['SK_DAD90', { expr: 'laugh' }], ['DRIPPY', { expr: 'shock' }]] },
  { d: 7.0, a: [['SK_ARB', { expr: 'thoughtful', prop: 'folder' }], ['SK_LAW', { expr: 'determined', prop: 'folder' }], ['SK_LJ13', { expr: 'happy', raise: 1 }], ['SK_LJ', { expr: 'sad', prop: 'letter' }], ['DRIPPY', { expr: 'dazed' }], ['DRIPPY', { expr: 'sly', pose: 'soso' }]] },
];
export function skTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'DRIPPY' ? 0.42 : /KID/.test(o) ? 0.8 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
