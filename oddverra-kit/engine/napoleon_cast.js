// [NAP-cast] "Napoleon wasn't short": outfit table (merged into ODD by main.js), props (into oddverra's HOLD), cast test (?npcast=N).
// Napoleon is our own stylization (grey open coat over a white waistcoat, sideways black bicorne with a tricolour cockade, boots);
// LITTLE BONEY is the cartoon version (kid build, giant hat) that hops off the caricature sheets. The cartoonist, doctor,
// grenadiers, Londoners and the modern kid are invented generic designs. Hats 'bicorne' / 'bearskin' live in oddverra_next.js [NAP-cast].
import { OVK, OVH, INK } from './oddverra_next.js';
const { cel, taper, line, ellP, polyPath, smooth, mixc } = OVK;
const TAU = Math.PI * 2;

const NAP = { frock: true, coat: true, shirt: '#7c7f88', pants: '#efeadc', waistcoat: '#f2eee2', collar: '#f4f1e8', cuff: '#7c7f88', neck: 'cravat', neckCol: '#f4f1e8', button: '#d8b048',
  boots: true, shoes: '#18161c', hat: 'bicorne', hatCol: '#1c1a22', hair: 'side', hairCol: '#3a2a1c', brow: '#3a2a1c', build: 'adult', head: 'round', skin: '#f2cfae', nose: 'long', noChain: true };
const GREN = { dbl: true, coat: true, shirt: '#1f2c66', pants: '#efeadc', collar: '#1f2c66', cuff: '#c0302c', button: '#e0b84a', belt: '#f2eee4', boots: true, shoes: '#18161c',
  hat: 'bearskin', hair: 'short', hairCol: '#4a2e1c', moustache: '#3a2418', stache: 'bushy', brow: '#3a2418', build: 'thin', head: 'egg', skin: '#ecbc96', noChain: true };
export const NAP_ODD = {
  NAPOLEON: NAP,
  NAP_SHEET: { ...NAP }, // (unused: the 1821 measuring scene shows only a sheet-covered shape)
  BONEY: { ...NAP, build: 'kid', head: 'wide', hatK: 1.55, skin: '#f6c8a8', nose: 'round', shirt: '#6e7280' },
  GREN1: GREN,
  GREN2: { ...GREN, hairCol: '#1e1612', moustache: '#1e1612', brow: '#1e1612', skin: '#d8a07a', head: 'round' },
  GREN3: { ...GREN, hairCol: '#8a5a30', moustache: '#7a4a28', brow: '#7a4a28', skin: '#f2c8a6', head: 'tall' },
  SOLDIER1: { coat: true, shirt: '#24306a', pants: '#efeadc', collar: '#c0302c', cuff: '#c0302c', button: '#e0b84a', belt: '#f2eee4', boots: true, shoes: '#18161c', hat: 'bicorne', hatK: 0.85, hatCol: '#22202a',
    hair: 'short', hairCol: '#6a3a1e', brow: '#6a3a1e', build: 'adult', head: 'round', skin: '#f0c4a0', noChain: true },
  SOLDIER2: { coat: true, shirt: '#24306a', pants: '#efeadc', collar: '#c0302c', cuff: '#c0302c', button: '#e0b84a', belt: '#f2eee4', boots: true, shoes: '#18161c', hat: 'bicorne', hatK: 0.85, hatCol: '#22202a',
    hair: 'short', hairCol: '#2a1c14', moustache: '#2a1c14', brow: '#2a1c14', build: 'stout', head: 'wide', skin: '#d8a07a', noChain: true },
  CARTOONIST: { frock: true, coat: true, shirt: '#5a3448', pants: '#6a5a4a', waistcoat: '#d8b060', collar: '#f4f1e8', cuff: '#5a3448', neck: 'cravat', neckCol: '#f4f1e8', button: '#3a2232',
    hair: 'side', hairCol: '#c8beb4', brow: '#8a7a6e', build: 'thin', head: 'egg', skin: '#f2c8a8', nose: 'long', shoes: '#2a1e1e', noChain: true },
  DOCTOR: { frock: true, coat: true, shirt: '#2a2a36', pants: '#3a3640', waistcoat: '#6a5a44', collar: '#f4f1e8', cuff: '#2a2a36', neck: 'cravat', neckCol: '#f4f1e8', button: '#c8a050',
    hair: 'short', hairCol: '#2a1c14', brow: '#2a1c14', beard: 'full', beardShort: true, beardK: 0.4, beardCol: '#2a1c14', build: 'adult', head: 'egg', skin: '#e8b890', shoes: '#1a1618', glasses: 'pincenez', noChain: true },
  LONDON1: { coat: true, shirt: '#3a4a3a', pants: '#c8b890', collar: '#f4f1e8', cuff: '#3a4a3a', neck: 'cravat', neckCol: '#f4f1e8', hat: 'top', hatCol: '#2a2420', hair: 'side', hairCol: '#7a4a2a',
    build: 'stout', head: 'wide', skin: '#f2c0a0', nose: 'round', shoes: '#1e1a1e' },
  LONDON2: { lashes: true, dress: true, shawl: '#8a3a4a', shirt: '#d8c8a0', pants: '#d8c8a0', collar: '#f4eee0', cuff: '#f4eee0', hat: 'ladyhat', hatCol: '#e8dcc0', hair: 'bun', hairCol: '#a8602a', head: 'egg', skin: '#f6d0b0', shoes: '#3a2a22' },
  LONDON3: { shirt: '#6a4a3a', pants: '#4a4a4a', vest: '#8a7a5a', rolled: true, hat: 'cap', hatCol: '#4a4038', plainCap: true, hair: 'short', hairCol: '#c08a40', build: 'kid', head: 'round', skin: '#ffe0c4', shoes: '#2a2020' },
  KID: { hoodie: true, shirt: '#e8673a', pants: '#3a5a8a', hair: 'short', hairCol: '#2a1c14', build: 'kid', head: 'round', skin: '#c8906a', shoes: '#f2f2f2', noButtons: true },
  GUIDE: { shirt: '#f2efe6', pants: '#2e3240', vest: '#2e3240', neck: 'tie', neckCol: '#a83a3a', tieK: 0.6, collar: '#ffffff', hair: 'bun', hairCol: '#4a2a1a', lashes: true, head: 'egg', skin: '#f0c8a6', shoes: '#1e1a1e', glasses: true },
};
const NAP_OPS = ['raise', 'palm', 'handsUp', 'clasp', 'slump', 'shake', 'headYaw', 'look'];
export const napOpts = (op) => { const r = {}; for (const k of NAP_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props ----------
export const NAP_HOLD = {
  quill: (g) => { const s = OVH.HSIDE, a = [-s * 2, 18], b = [s * 34, -120]; line(g, [a, b], 6, INK); line(g, [a, b], 3, '#3a2a2a');
    const v = smooth([[s * 6, -30], [s * 2, -80], [s * 22, -150], [s * 44, -176], [s * 40, -120], [s * 30, -60]], 5); cel(g, v, '#f4f0e6', 3, 6, 4, 2);
    for (let i = 0; i < 6; i++) taper(g, [[s * (12 + i * 4), -60 - i * 16], [s * (26 + i * 3), -70 - i * 16]], 1.4, 'rgba(120,110,130,0.6)', 0.2); },
  tape: (g, op = {}) => { const s = OVH.HSIDE; cel(g, ellP(0, -20, 30, 30), '#c89a3a', 3.4, 6, 4, 2); cel(g, ellP(0, -20, 12, 12), '#8a6a2a', 2, 0, 0, 0);
    const tp = polyPath([[s * 20, -36], [s * 150, -60], [s * 152, -40], [s * 22, -10]]); cel(g, tp, '#f2d860', 2.6, 3, 2, 0); g.save(); g.clip(tp); for (let i = 0; i < 14; i++) line(g, [[s * (30 + i * 9), -24 - i * 1.7], [s * (30 + i * 9), -34 - i * 1.7]], 1.6, INK); g.restore(); },
  cartoon: (g, op = {}) => { const s = OVH.HSIDE; g.save(); g.translate(s * 16, -120); g.rotate(-s * 0.08); const p = new Path2D(); p.rect(-70, -90, 140, 180); cel(g, p, '#f6eedc', 3.4, 6, 4, 2);
    // tiny furious hat-man doodle
    line(g, [[-6, 40], [-14, 66]], 4, INK); line(g, [[6, 40], [14, 66]], 4, INK); cel(g, polyPath([[-16, -2], [16, -2], [12, 42], [-12, 42]]), '#8a8c94', 2.4, 0, 0, 0);
    cel(g, ellP(0, -18, 16, 15), '#f6c8a8', 2.4, 0, 0, 0); const h = new Path2D(); h.moveTo(-46, -26); h.quadraticCurveTo(0, -84, 46, -26); h.quadraticCurveTo(0, -36, -46, -26); cel(g, h, '#1c1a22', 2.4, 0, 0, 0);
    line(g, [[-8, -14], [8, -14]], 2.4, INK); line(g, [[-6, -6], [6, -6]], 2.4, '#c0302c'); line(g, [[-50, -70], [-60, -84]], 3, '#c0302c'); line(g, [[50, -70], [60, -84]], 3, '#c0302c'); g.restore(); },
  telescope: (g) => { const s = OVH.HSIDE, a = [-s * 30, 10], b = [s * 90, -70]; line(g, [a, b], 22, INK); line(g, [a, b], 16, '#8a5a34'); line(g, [[a[0] + s * 50, a[1] - 33], b], 20, '#c89a3a');
    cel(g, ellP(b[0], b[1], 8, 12, 0.6 * s), '#e8d8a0', 2, 0, 0, 0); },
  musket: (g) => { const s = OVH.HSIDE, a = [s * 4, 120], b = [s * 14, -330]; line(g, [a, b], 14, INK); line(g, [a, b], 9, '#7a4a28'); line(g, [[s * 9, -100], [s * 15, -330]], 5, '#9aa0ac'); line(g, [[s * 15, -330], [s * 17, -420]], 3, '#c8ccd6'); },
  map: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 20, -90); g.rotate(-s * 0.1); const p = new Path2D(); p.rect(-80, -60, 160, 120); cel(g, p, '#efe2c0', 3, 6, 4, 2);
    g.strokeStyle = 'rgba(60,90,140,0.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-70, -10); g.bezierCurveTo(-30, -40, 10, 20, 70, -20); g.stroke(); g.strokeStyle = '#c0302c'; g.lineWidth = 4; g.beginPath(); g.moveTo(-50, 30); g.lineTo(40, 0); g.stroke(); g.restore(); },
};
Object.assign(OVH.HOLD, NAP_HOLD);

// ---------- cast test (?npcast=N with any set view flag) ----------
const KT = [
  { d: 6.0, a: [['NAPOLEON', { expr: 'determined', view: 'front' }], ['NAPOLEON', { expr: 'smug', view: '34R', point: 1 }], ['BONEY', { expr: 'angry', shake: 1 }], ['GREN1', { expr: 'determined', prop: 'musket', reach: 0.4 }], ['GREN2', { expr: 'smile' }], ['SOLDIER1', { expr: 'excited', cheer: 1 }]] },
  { d: 6.0, a: [['CARTOONIST', { expr: 'sly', prop: 'quill', reach: 0.8 }], ['DOCTOR', { expr: 'thoughtful', prop: 'tape', reach: 0.8 }], ['LONDON1', { expr: 'laugh' }], ['LONDON2', { expr: 'laugh' }], ['LONDON3', { expr: 'grin' }], ['KID', { expr: 'surprised' }], ['GUIDE', { expr: 'smile' }]] },
  { d: 3.6, a: [['NAPOLEON', { expr: 'shock', view: 'front' }], ['BONEY', { expr: 'angry', view: '34L' }], ['GREN3', { expr: 'smile' }], ['CARTOONIST', { expr: 'grin', prop: 'cartoon', raise: 1, reach: 0.9 }]] },
];
export function napTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
