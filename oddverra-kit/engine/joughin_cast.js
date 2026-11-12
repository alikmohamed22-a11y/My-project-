// [JG-cast] "The Titanic's baker" (Charles Joughin, April 1912): outfit table (merged into ODD by main.js), props (into oddverra's HOLD)
// and a cast test lineup (?jgcast=N with any set view flag, e.g. ?tiview=0&jgcast=0). LOAFY the bread-loaf mascot is DOUGHY with { loaf: 1 }.
import { OVK, OVH, INK } from './oddverra_next.js';
const { cel, taper, smooth, ellP, arcPts, mixc, lt, dk, rgba, polyPath, hsh } = OVK;
const TAU = Math.PI * 2;

// ---------- outfits (Joughin drawn generically: stocky, baker whites + toque, moustache; everyone else invented) ----------
const WHITE = '#f6f2ea';
export const JG_ODD = {
  JOUGHIN: { shirt: WHITE, pants: '#ece6da', apron: '#fbf8f2', collar: WHITE, cuff: WHITE, button: '#e8e0d0', rolled: true, hat: 'toque', hatCol: '#fbf8f2', hair: 'short', hairCol: '#4a2e1c',
    moustache: '#4a2e1c', stache: 'bushy', brow: '#4a2e1c', build: 'stout', head: 'wide', skin: '#f0c0a0', nose: 'round', shoes: '#2a2224', noButtons: true },
  JOUGHIN_WET: { shirt: '#dce4ea', pants: '#c8d0d8', collar: '#dce4ea', cuff: '#dce4ea', rolled: true, hair: 'short', hairCol: '#3a2618', moustache: '#3a2618', stache: 'bushy', brow: '#3a2618',
    build: 'stout', head: 'wide', skin: '#e8b8a8', nose: 'round', shoes: '#2a2224', noButtons: true },
  JOUGHIN_OLD: { cardigan: true, shirt: '#8a6a4a', pants: '#5a5048', collar: '#f2ece0', cuff: '#8a6a4a', button: '#d8c8a8', hair: 'receding', hairCol: '#e8e4dc', moustache: '#ece8e0', stache: 'bushy', brow: '#d8d4cc',
    build: 'old', head: 'wide', skin: '#f0c4a8', nose: 'round', shoes: '#3a2a22', glasses: true },
  BAKER1: { shirt: WHITE, pants: '#e6e0d4', apron: '#fbf8f2', rolled: true, hat: 'toque', hatCol: '#fbf8f2', hair: 'short', hairCol: '#c08a40', build: 'adult', head: 'round', skin: '#f6d0b0', shoes: '#2a2224', noButtons: true },
  BAKER2: { shirt: WHITE, pants: '#e6e0d4', apron: '#fbf8f2', rolled: true, hat: 'cap', hatCol: '#f4f0e6', plainCap: true, hair: 'short', hairCol: '#1e1612', moustache: '#1e1612', brow: '#1e1612',
    build: 'thin', head: 'egg', skin: '#d8a07a', shoes: '#2a2224', noButtons: true },
  COOK: { shirt: WHITE, pants: '#3a3a44', rolled: true, hat: 'cap', hatCol: '#f4f0e6', plainCap: true, hair: 'short', hairCol: '#2a1c14', build: 'adult', head: 'round', skin: '#e8b090', shoes: '#2a2224', noButtons: true },
  OFFICER: { coat: true, shirt: '#1c2238', pants: '#1c2238', collar: '#ffffff', cuff: '#1c2238', neck: 'tie', neckCol: '#141420', tieK: 0.7, button: '#d8b048', hat: 'cap', hatCol: '#1c2238',
    hair: 'short', hairCol: '#5a3a24', beard: 'full', beardShort: true, beardK: 0.5, beardCol: '#5a3a24', brow: '#5a3a24', build: 'tall', head: 'egg', skin: '#f0c4a0', shoes: '#141218' },
  SAILOR: { shirt: '#2a3048', pants: '#2a2a34', rolled: true, hat: 'beanie', hatCol: '#3a3a4a', hair: 'short', hairCol: '#8a5a30', build: 'adult', head: 'round', skin: '#e8a880', nose: 'round', shoes: '#1a1418', noButtons: true },
  LADY1: { lashes: true, dress: true, coat: true, shirt: '#6a2a3a', pants: '#6a2a3a', collar: '#f4eee0', cuff: '#6a2a3a', button: '#d8b048', hat: 'ladyhat', hatCol: '#3a2a3a', hair: 'bun', hairCol: '#6a3a22',
    head: 'egg', skin: '#f6d0b0', shoes: '#2a1a1a', earring: '#f2e6c8' },
  LADY2: { lashes: true, dress: true, shawl: '#4a5a7a', shirt: '#8a8a6a', pants: '#8a8a6a', collar: '#f4eee0', cuff: '#f4eee0', hair: 'bun', hairCol: '#2a1a12', head: 'round', skin: '#e8b48a', shoes: '#3a2a22' },
  GIRL: { lashes: true, dress: true, short: true, shirt: '#c8506a', pants: '#c8506a', collar: '#ffffff', hair: 'long', hairCol: '#c88a40', build: 'kid', head: 'round', skin: '#ffe0c4', shoes: '#3a2a3a' },
  BOY: { coat: true, shirt: '#4a5a3a', pants: '#3a3a3a', collar: '#ffffff', hat: 'cap', hatCol: '#3a3a4a', plainCap: true, hair: 'short', hairCol: '#5a3a1a', build: 'kid', head: 'round', skin: '#f6d0b0', shoes: '#2a2020' },
};
// per-actor options main.js passes to oddverra (c2opts)
const JG_OPS = ['wet', 'shiver', 'bcol'];
export const jgOpts = (op) => { const r = {}; for (const k of JG_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props ----------
export function loafAt(g, x, y, w, rot = 0, col = '#d8904a') { g.save(); g.translate(x, y); g.rotate(rot);
  const pts = []; for (let i = 0; i < 28; i++) { const a = TAU * i / 28, c = Math.cos(a), s = Math.sin(a); pts.push([Math.sign(c) * Math.abs(c) ** 0.6 * w, (s > 0 ? Math.abs(s) ** 0.5 * w * 0.32 : -(Math.abs(s) ** 0.9) * w * 0.48)]); }
  const P = smooth(pts, 3); cel(g, P, col, 2.8, 6, 4, 3); g.save(); g.clip(P); for (const k of [-0.5, 0, 0.5]) taper(g, [[w * (k - 0.12), -w * 0.18], [w * (k + 0.12), -w * 0.38]], w * 0.08, '#f6dca0', 0.5); g.restore(); g.restore(); }
function chairAt(g, x, y, s, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); const wd = '#a8723e', dkw = '#6a4424';
  const seat = polyPath([[-80, 10], [70, 10], [78, 22], [-74, 22]]); const back = polyPath([[-84, 14], [-70, 14], [-104, -76], [-118, -76]]);
  for (let i = 0; i < 5; i++) cel(g, polyPath([[-112 + i * 3, -66 + i * 16], [-96 + i * 3, -66 + i * 16], [-92 + i * 3, -56 + i * 16], [-108 + i * 3, -56 + i * 16]]), '#c89058', 1.6, 2, 1, 0);
  cel(g, back, wd, 2.6, 3, 2, 1); cel(g, seat, wd, 2.6, 3, 2, 1);
  for (let i = 0; i < 6; i++) taper(g, [[-60 + i * 24, 12], [-60 + i * 24, 20]], 2, dkw, 0.2);
  for (const [a, b] of [[[-66, 22], [-80, 70]], [[60, 22], [74, 70]], [[-20, 22], [30, 70]]]) taper(g, [a, b], 7, dkw, 0.3);
  taper(g, [[-80, -10], [40, -10], [56, 10]], 6, wd, 0.3); g.restore(); }
export const JG_HOLD = {
  loaves: (g, op = {}) => { const s = OVH.HSIDE; for (let i = 0; i < 4; i++) loafAt(g, s * (-30 + (i % 2) * 18), -10 - i * 34, 58, (i % 2 ? 0.12 : -0.1), ['#d8904a', '#c87e3a', '#e09a52', '#cc8640'][i]); },
  loaf: (g, op = {}) => loafAt(g, OVH.HSIDE * 10, -30, 62, -0.15),
  glass: (g, op = {}) => { const x = OVH.HSIDE * 6, y = -46; const bowl = new Path2D(); bowl.moveTo(x - 22, y - 34); bowl.lineTo(x + 22, y - 34); bowl.quadraticCurveTo(x + 18, y + 2, x, y + 4); bowl.quadraticCurveTo(x - 18, y + 2, x - 22, y - 34); bowl.closePath();
    g.save(); g.clip(bowl); g.fillStyle = '#c8782a'; g.fillRect(x - 30, y - 18, 60, 30); g.restore(); g.fillStyle = 'rgba(220,235,255,0.35)'; g.fill(bowl); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(bowl);
    taper(g, [[x, y + 4], [x, y + 30]], 4, INK, 0.2); cel(g, ellP(x, y + 32, 15, 5), '#e8f0f8', 2.4, 0, 0, 0); taper(g, [[x - 14, y - 28], [x - 10, y - 10]], 3, 'rgba(255,255,255,0.8)', 0.3); },
  bottle: (g, op = {}) => { const x = OVH.HSIDE * 8, y = -40; const b = polyPath([[x - 20, y + 30], [x - 20, y - 40], [x - 8, y - 60], [x - 7, y - 92], [x + 7, y - 92], [x + 8, y - 60], [x + 20, y - 40], [x + 20, y + 30]]);
    cel(g, b, '#3a5a3a', 2.8, 5, 3, 3); cel(g, polyPath([[x - 17, y - 26], [x + 17, y - 26], [x + 17, y + 6], [x - 17, y + 6]]), '#efe2c0', 1.8, 0, 0, 0); taper(g, [[x - 10, y - 14], [x + 10, y - 14]], 2.4, '#8a3a2a', 0.2); cel(g, polyPath([[x - 8, y - 104], [x + 8, y - 104], [x + 7, y - 92], [x - 7, y - 92]]), '#a87a4a', 2, 0, 0, 0); taper(g, [[x - 13, y - 34], [x - 13, y + 22]], 4, 'rgba(255,255,255,0.45)', 0.4); },
  chair: (g, op = {}) => chairAt(g, OVH.HSIDE * 20, -90, 0.9, OVH.HSIDE * -0.25),
  lantern: (g, op = {}) => { const x = OVH.HSIDE * 6, y = -20; taper(g, arcPts(x, y - 70, 16, Math.PI, TAU, 8), 3.4, INK, 0.2); cel(g, polyPath([[x - 20, y - 66], [x + 20, y - 66], [x + 24, y - 54], [x - 24, y - 54]]), '#2a2a30', 2, 2, 1, 0);
    const gl = polyPath([[x - 18, y - 54], [x + 18, y - 54], [x + 20, y], [x - 20, y]]); const gr = g.createRadialGradient(x, y - 26, 2, x, y - 26, 30); gr.addColorStop(0, '#fff8d0'); gr.addColorStop(1, '#ffb040'); g.fillStyle = gr; g.fill(gl); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(gl);
    cel(g, polyPath([[x - 24, y], [x + 24, y], [x + 22, y + 12], [x - 22, y + 12]]), '#2a2a30', 2, 2, 1, 0); },
  oar: (g, op = {}) => { const x = OVH.HSIDE * 4; taper(g, [[x - OVH.HSIDE * 30, -220], [x + OVH.HSIDE * 40, 160]], 11, '#b88a50', 0.1); cel(g, ellP(x + OVH.HSIDE * 46, 190, 18, 52), '#c89a5a', 2.4, 3, 2, 1); },
};
Object.assign(OVH.HOLD, JG_HOLD);

// ---------- cast test (?jgcast=N): actors laid out in front of the camera on ground height gy ----------
const KT = [
  { d: 7.0, a: [['JOUGHIN', { expr: 'happy', prop: 'loaves', reach: 0.8 }], ['BAKER1', { expr: 'smile', prop: 'loaves', reach: 0.8 }], ['BAKER2', { expr: 'excited', cheer: 1 }], ['COOK', { expr: 'worried' }], ['OFFICER', { expr: 'determined', prop: 'lantern', reach: 0.6 }], ['DOUGHY', { expr: 'happy', loaf: 1, dcol: '#d8904a' }]] },
  { d: 7.0, a: [['LADY1', { expr: 'worried' }], ['LADY2', { expr: 'nervous' }], ['GIRL', { expr: 'surprised' }], ['BOY', { expr: 'smile' }], ['SAILOR', { expr: 'determined', prop: 'oar', reach: 0.6 }], ['JOUGHIN_OLD', { expr: 'happy', prop: 'loaf', reach: 0.8 }]] },
  { d: 4.0, a: [['JOUGHIN', { expr: 'sly', prop: 'glass', reach: 0.9, raise: 1 }], ['JOUGHIN', { expr: 'determined', prop: 'chair', raise: 1, reach: 1 }], ['JOUGHIN_WET', { expr: 'nervous' }], ['DOUGHY', { expr: 'shock', loaf: 1, dcol: '#d8904a' }]] },
];
export function jgTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
