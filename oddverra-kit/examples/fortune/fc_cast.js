// [FC-cast] "Fortune cookies aren't Chinese": outfit table (merged into ODD by main.js), props (into oddverra's HOLD) and a cast lineup
// (?fccast=N). Every design is our own generic stylization: the 1878 Kyoto senbei baker, today's Kyoto baker, the researcher (a
// stylized stand-in for Yasuko Nakamachi), a stylized Makoto Hagiwara (tea garden host) and Seiichi Kito (LA confectioner), tea guests,
// the 1983 mock-court judge and two lawyers (S.F. / L.A.), and two 1950s Chinese-American bakers. No real likenesses, logos or brands.
import { OVK, OVH, INK } from './oddverra_next.js';
const { cel, line, ellP } = OVK;
const TAU = Math.PI * 2;

export const FC_ODD = {
  FC_BAKER: { shirt: '#2a3a6a', rolled: true, apron: '#e8e0cc', pants: '#2a3a6a', hair: 'short', hairCol: '#1e1612', brow: '#1e1612', build: 'adult', head: 'egg', skin: '#f0c49a', shoes: '#3a2a20', noButtons: true, sandals: true },
  FC_BAKER2: { lashes: true, shirt: '#e8e4d8', apron: '#3a4a7a', pants: '#3a3a4a', hair: 'bun', hairCol: '#2a1e1a', brow: '#2a1e1a', head: 'round', skin: '#f4caa6', shoes: '#2a2a30', noButtons: true, rolled: true },
  FC_YASUKO: { lashes: true, cardigan: '#7a4a5a', shirt: '#f0e8dc', pants: '#3a3a4a', hair: 'long', hairCol: '#1e1612', brow: '#1e1612', glasses: true, head: 'egg', skin: '#f4cca8', shoes: '#2a2228', earring: '#e8dcc0' },
  FC_HAGI: { coat: true, shirt: '#3a3a4a', pants: '#3a3a4a', collar: '#f4f1e8', cuff: '#3a3a4a', neck: 'tie', neckCol: '#7a2a3a', hat: 'bowler', hatCol: '#26222a', hair: 'short', hairCol: '#1e1612', brow: '#1e1612', moustache: '#1e1612', build: 'adult', head: 'wide', skin: '#eec49e', shoes: '#1a1618' },
  FC_KITO: { shirt: '#f0ece0', vest: '#4a3a30', apron: '#f4f0e4', pants: '#3a3a46', collar: '#f4f1e8', neck: 'bow', neckCol: '#2a2a3a', hair: 'side', hairCol: '#1e1612', brow: '#1e1612', glasses: true, build: 'thin', head: 'tall', skin: '#f0c8a0', shoes: '#2a2020' },
  FC_GUEST1: { lashes: true, dress: true, bustle: true, shirt: '#5a8a6a', pants: '#5a8a6a', collar: '#f4eee0', cuff: '#f4eee0', hat: 'ladyhat', hatCol: '#f0d8e0', hair: 'bun', hairCol: '#a86a3a', head: 'egg', skin: '#f6d0b0', shoes: '#3a2a22', earring: true },
  FC_GUEST2: { coat: true, shirt: '#6a5a4a', pants: '#6a5a4a', collar: '#f4f1e8', cuff: '#6a5a4a', neck: 'bow', neckCol: '#2a4a7a', hat: 'straw', hatCol: '#e8d090', hair: 'short', hairCol: '#5a3a24', moustache: '#5a3a24', build: 'stout', head: 'round', skin: '#f2c0a0', shoes: '#1a1618' },
  FC_JUDGE: { dress: true, shirt: '#1e1a26', pants: '#1e1a26', collar: '#f4f1e8', cuff: '#1e1a26', hair: 'receding', hairCol: '#c8c4cc', brow: '#a8a4ae', glasses: true, build: 'stout', head: 'wide', skin: '#f0c4a0', shoes: '#1a1618', age: true },
  FC_LAWSF: { coat: true, shirt: '#3a4a7a', pants: '#3a4a7a', collar: '#f4f1e8', cuff: '#3a4a7a', neck: 'tie', neckCol: '#d8a030', hair: 'curly', hairCol: '#5a3a24', brow: '#5a3a24', build: 'adult', head: 'egg', skin: '#f2c4a2', shoes: '#2a1e18' },
  FC_LAWLA: { lashes: true, coat: true, shirt: '#a84a3a', pants: '#3a3036', collar: '#f4f1e8', cuff: '#a84a3a', hair: 'long', hairCol: '#c88a3a', brow: '#a86a2a', build: 'thin', head: 'tall', skin: '#f4caa8', shoes: '#2a1e18', earring: '#e8c860' },
  FC_CN1: { shirt: '#f4f0e6', rolled: true, apron: '#f4f0e6', pants: '#4a4a56', hat: 'surgcap', hatCol: '#f4f0e6', hair: 'short', hairCol: '#1e1612', brow: '#1e1612', build: 'stout', head: 'round', skin: '#eec49e', shoes: '#2a2020', noButtons: true },
  FC_CN2: { lashes: true, shirt: '#e8a0a8', rolled: true, apron: '#f4f0e6', pants: '#3a3a4a', hair: 'curly', hairCol: '#1e1612', brow: '#1e1612', head: 'egg', skin: '#f4cca8', shoes: '#2a2228', noButtons: true },
};
const FC_OPS = [];
export const fcOpts = (op) => { const r = {}; for (const k of FC_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props (hand-local: hand at 0,0, up = -y; OVH.HSIDE = which side the prop leans)
const ck = (g, x, y, s = 1) => { const p = new Path2D(); p.moveTo(x - 26 * s, y + 6 * s); p.quadraticCurveTo(x - 30 * s, y - 22 * s, x, y - 20 * s); p.quadraticCurveTo(x + 30 * s, y - 22 * s, x + 26 * s, y + 6 * s); p.quadraticCurveTo(x, y - 4 * s, x - 26 * s, y + 6 * s); cel(g, p, '#e8b25a', 2.4, 3, 2, 0); line(g, [[x, y - 18 * s], [x, y - 4 * s]], 2.2 * s, '#a86a2a'); };
const FC_HOLD = {
  // long-handled round iron (kata) for baking senbei: rod + hinged disc pair
  iron: (g) => { const s = OVH.HSIDE; line(g, [[-s * 4, 20], [s * 60, -96]], 11, INK); line(g, [[-s * 4, 20], [s * 60, -96]], 6, '#4a4a54'); line(g, [[-s * 6, 24], [s * 8, -4]], 13, INK); line(g, [[-s * 6, 24], [s * 8, -4]], 8, '#8a5a38');
    cel(g, ellP(s * 70, -114, 34, 22, s * -0.5), '#3a3a44', 3, 4, 3, 2); cel(g, ellP(s * 70, -110, 22, 12, s * -0.5), '#e8b25a', 2, 2, 1, 0); },
  // a tray of folded cookies held flat
  tray: (g) => { const s = OVH.HSIDE, p = new Path2D(); p.roundRect(-s * 10 - 70, -34, 140, 18, 6); cel(g, p, '#8a5a38', 3, 4, 3, 1); for (let i = 0; i < 4; i++) ck(g, -s * 10 - 48 + i * 32, -38, 0.7); },
  // one fortune cookie with the slip poking out
  cookie: (g) => { const s = OVH.HSIDE; ck(g, s * 8, -24, 1.2); const p = new Path2D(); p.rect(s * 8 - 3, -60, 6 + s * 0, 26); cel(g, p, '#fbf6ea', 1.8, 1, 1, 0); },
  // magnifying glass
  magnifier: (g) => { const s = OVH.HSIDE; line(g, [[0, 16], [s * 16, -50]], 13, INK); line(g, [[0, 16], [s * 16, -50]], 8, '#6a3a2a'); cel(g, ellP(s * 26, -88, 34, 34), 'rgba(200,230,255,0.45)', 6, 0, 0, 0); g.lineWidth = 7; g.strokeStyle = '#c8a050'; g.beginPath(); g.arc(s * 26, -88, 32, 0, TAU); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 4; g.beginPath(); g.arc(s * 26, -88, 22, 3.6, 4.4); g.stroke(); },
  // teapot (held by the handle)
  teapot: (g) => { const s = OVH.HSIDE; cel(g, ellP(s * 34, -20, 36, 28), '#3a5a4a', 3.2, 6, 4, 3); line(g, [[s * 68, -24], [s * 92, -46]], 10, INK); line(g, [[s * 68, -24], [s * 92, -46]], 5, '#3a5a4a'); line(g, [[s * 4, -44], [s * 10, -60], [s * 58, -60], [s * 64, -44]], 6, INK); cel(g, ellP(s * 34, -48, 14, 5), '#2a4a3a', 2, 1, 1, 0); },
};
Object.assign(OVH.HOLD, FC_HOLD);

// ---------- lineup (?fccast=N)
const KT = [
  { d: 6.5, a: [['FC_BAKER', { expr: 'smile', prop: 'iron' }], ['FC_BAKER2', { expr: 'happy', prop: 'tray' }], ['FC_YASUKO', { expr: 'surprised', prop: 'magnifier' }], ['FC_HAGI', { expr: 'smile', prop: 'teapot' }], ['FC_KITO', { expr: 'smug', prop: 'cookie' }], ['FC_GUEST1', { expr: 'laugh' }]] },
  { d: 6.5, a: [['FC_GUEST2', { expr: 'grin' }], ['FC_JUDGE', { expr: 'angry', prop: 'mallet' }], ['FC_LAWSF', { expr: 'excited', point: 1 }], ['FC_LAWLA', { expr: 'angry' }], ['FC_CN1', { expr: 'smile', prop: 'tray' }], ['FC_CN2', { expr: 'happy', prop: 'cookie' }]] },
];
export function fcTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
