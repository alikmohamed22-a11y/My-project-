// [MW-cast] "The microwave oven was invented after a candy bar melted" (Percy Spencer, Raytheon, 1945): outfit table (merged into ODD by
// main.js), props (into oddverra's HOLD) and a cast lineup (?mwcast=N). Percy is our own stylization (51 in 1945: greying side parting,
// round glasses, white shirt with a breast pocket, navy tie, rolled sleeves). The coworker, the boss, the 1947 chef, the 1967 family and
// the modern kid are invented generic designs. The sidekick CHOCO (the living candy bar) is a 3D prop in mw_sets.js.
import { OVK, OVH, INK } from './oddverra_next.js';
const { cel, line, ellP } = OVK;
const TAU = Math.PI * 2;

const PERCY = { shirt: '#f2efe6', pants: '#5a5a66', collar: '#f2efe6', cuff: '#f2efe6', neck: 'tie', neckCol: '#2a4a8a', rolled: true, pocket: true, glasses: true, hair: 'side', hairCol: '#8a8078', brow: '#7a7068',
  head: 'egg', build: 'thin', skin: '#f2c4a2', shoes: '#2a2020', age: true, noButtons: true };
export const MW_ODD = {
  MW_PERCY: { ...PERCY },                                                                          // 1945 lab
  MW_PERCYS: { ...PERCY, coat: true, rolled: false, shirt: '#4a4e5a', pants: '#4a4e5a', cuff: '#4a4e5a', collar: '#f4f1e8', suitCol: '#4a4e5a', noChain: true }, // in a suit (1947 / bonus)
  MW_COWORK: { coat: true, shirt: '#f4f2ec', pants: '#3a4a5a', collar: '#cfdcea', cuff: '#f4f2ec', neck: 'bow', neckCol: '#8a2a3a', button: '#c8c8d0', pencil: true, noChain: true, hair: 'receding', hairCol: '#3a2a20', brow: '#3a2a20', bushyBrow: true, moustache: '#3a2a20', build: 'stout', head: 'wide', skin: '#e8b48c', shoes: '#2a2020' },
  MW_TECH: { lashes: true, shirt: '#3a7a6a', pants: '#3a4a5a', collar: '#f4eee0', cuff: '#3a7a6a', dress: true, hair: 'curly', hairCol: '#6a3a1e', head: 'round', skin: '#c88a62', shoes: '#3a2a22', earring: true },
  MW_BOSS: { coat: true, shirt: '#2e2a36', pants: '#2e2a36', collar: '#f4f1e8', cuff: '#2e2a36', suitCol: '#2e2a36', neck: 'bow', neckCol: '#b82a2a', vest: '#4a3a40', hair: 'bald', brow: '#5a4a40', moustache: '#6a5a50', build: 'stout', head: 'round', skin: '#f0c0a0', shoes: '#16141a' },
  MW_CHEF: { shirt: '#f6f4ee', apron: '#f6f4ee', pants: '#3a3a46', collar: '#f6f4ee', hat: 'surgcap', hatCol: '#ffffff', neck: 'tie', neckCol: '#c83a3a', hair: 'short', hairCol: '#2a1a12', moustache: '#2a1a12', build: 'stout', head: 'wide', skin: '#d8a07a', shoes: '#2a2020', noButtons: true },
  MW_KID: { pj: true, shirt: '#5a8ae8', pattern: 'stripe', stripe: true, stripeCol: '#f2e870', pants: '#5a8ae8', hair: 'spiky', hairCol: '#3a2418', brow: '#3a2418', build: 'kid', head: 'round', skin: '#e8b48c', shoes: '#e84a5a', noButtons: true },
  MW_MOM67: { lashes: true, dress: true, shirt: '#e8702a', pants: '#e8702a', collar: '#fff6e0', cuff: '#e8702a', pattern: 'dots', dotCol: '#fff0c0', apron: '#f6f0e0', hair: 'bun', hairCol: '#c8902a', head: 'egg', skin: '#f6d0b0', shoes: '#3a2a22', earring: true },
  MW_KID67: { shirt: '#3aa8c8', pattern: 'stripe', stripe: true, stripeCol: '#f8f0e0', pants: '#8a5a30', short: true, hair: 'short', hairCol: '#e0b050', brow: '#c89040', build: 'kid', head: 'round', skin: '#f2c4a0', shoes: '#2a2a36', noButtons: true },
};
const MW_OPS = ['melt'];
export const mwOpts = (op) => { const r = {}; for (const k of MW_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props (hand-local: hand at 0,0, up = -y; OVH.HSIDE = which side the prop leans)
const MW_HOLD = {
  // brown paper bag of corn kernels, top rolled open
  popbag: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 26, -40); g.rotate(s * 0.15); const P = new Path2D(); P.moveTo(-32, -50); P.lineTo(32, -50); P.lineTo(38, 52); P.lineTo(-38, 52); P.closePath(); cel(g, P, '#c8a070', 3, 4, 3, 1);
    g.fillStyle = 'rgba(90,60,30,0.35)'; for (const x of [-14, 10]) g.fillRect(x, -44, 3, 92); const T = new Path2D(); T.ellipse(0, -52, 34, 10, 0, 0, TAU); cel(g, T, '#a8804a', 2.6, 2, 1, 0);
    g.fillStyle = '#f2c040'; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(-20 + i * 7, -56 + (i % 2) * 3, 5, 4, 0, 0, TAU); g.fill(); } g.restore(); },
  // a crisp napkin
  napkin: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 20, -36); g.rotate(s * 0.2); const P = new Path2D(); P.moveTo(-30, -30); P.lineTo(30, -34); P.lineTo(34, 30); P.lineTo(-28, 34); P.closePath(); cel(g, P, '#fbfaf4', 3, 3, 2, 0);
    g.strokeStyle = 'rgba(120,140,200,0.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-22, -22); g.lineTo(26, 26); g.stroke(); g.restore(); },
  // two one-dollar bills, fanned
  bills: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 30, -46); for (const [a, dx] of [[-0.25, -6], [0.12, 6]]) { g.save(); g.translate(dx, 0); g.rotate(s * a); const P = new Path2D(); P.rect(-46, -22, 92, 44); cel(g, P, '#bfe0b0', 2.6, 3, 2, 0);
      g.strokeStyle = '#3a7a4a'; g.lineWidth = 2.5; g.strokeRect(-40, -16, 80, 32); g.beginPath(); g.ellipse(0, 0, 12, 13, 0, 0, TAU); g.stroke(); g.fillStyle = '#2a6a3a'; g.font = 'bold 18px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('1', -30, -8); g.fillText('1', 30, 8); g.restore(); } g.restore(); },
  // modern bowl of popcorn (held at chest height)
  popbowl: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 14, -30); for (let i = 0; i < 11; i++) { const x = -40 + (i % 6) * 16 + (i > 5 ? 8 : 0), y = -18 - (i > 5 ? 12 : 0); const P = new Path2D(); P.arc(x, y, 11, 0, TAU); cel(g, P, i % 3 ? '#fff6dc' : '#f8e6a8', 2, 2, 1, 0); }
    const B = new Path2D(); B.moveTo(-54, -14); B.lineTo(54, -14); B.quadraticCurveTo(50, 34, 0, 36); B.quadraticCurveTo(-50, 34, -54, -14); B.closePath(); cel(g, B, '#e83a4a', 3.2, 4, 3, 1); g.fillStyle = '#fff'; for (let i = 0; i < 4; i++) g.fillRect(-40 + i * 24, -8, 10, 36); g.restore(); },
};
Object.assign(OVH.HOLD, MW_HOLD);

// ---------- lineup (?mwcast=N)
const KT = [
  { d: 6.0, a: [['MW_PERCY', { expr: 'smile', prop: 'popbag' }], ['MW_PERCYS', { expr: 'proud', prop: 'bills' }], ['MW_COWORK', { expr: 'shock' }], ['MW_BOSS', { expr: 'smug', point: 1 }], ['MW_TECH', { expr: 'surprised', prop: 'napkin' }]] },
  { d: 6.0, a: [['MW_CHEF', { expr: 'happy' }], ['MW_KID', { expr: 'excited', prop: 'popbowl' }], ['MW_MOM67', { expr: 'laugh', cheer: 0.6 }], ['MW_KID67', { expr: 'grin', wave: 0.6 }], ['MW_PERCY', { expr: 'shock', handsUp: 1 }]] },
];
export function mwTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: /KID/.test(o) ? 0.8 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
