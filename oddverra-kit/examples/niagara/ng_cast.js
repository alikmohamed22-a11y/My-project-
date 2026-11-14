// [NG-cast] "First person over Niagara Falls in a barrel" (Annie Edson Taylor, 24 Oct 1901): outfit table (merged into ODD by main.js),
// props (into oddverra's HOLD) and a cast lineup (?ngcast=N). Annie is our own stylization (black widow's dress, grey bun, lady's hat,
// age lines; o.bandage draws the small plaster after the falls, see oddverra_next.js [NG-cast]). The manager, helpers, cooper,
// reporters and crowd are invented generic designs. The sidekick is the test-run cat (CAT card, cat.js) in a ginger coat.
import { OVK, OVH, INK } from './oddverra_next.js';
const { cel, line, ellP } = OVK;
const TAU = Math.PI * 2;

const ANNIE = { lashes: true, dress: true, shirt: '#2c2634', pants: '#2c2634', collar: '#f4eee0', cuff: '#f4eee0', button: '#e8dcc0', hair: 'bun', hairCol: '#a8a4ae', brow: '#8a8690',
  head: 'round', skin: '#f4c8a8', shoes: '#1e1a22', age: true, earring: '#e8dcc0' };
export const NG_ODD = {
  NG_ANNIE: { ...ANNIE, hat: 'ladyhat', hatCol: '#3a2a44' },                       // 1901 Annie, hat on
  NG_ANNIEH: { ...ANNIE },                                                          // hat off (in the barrel, at the desk)
  NG_ANNIEB: { ...ANNIE, bandage: true },                                           // after the falls: plaster on the forehead
  NG_ANNIEG: { ...ANNIE, hat: 'ladyhat', hatCol: '#3a2a44', shawl: '#6a4a5a' },     // later years, souvenir stand / payoff
  NG_HELP1: { shirt: '#e8e0cc', rolled: true, vest: '#4a3a2e', pants: '#3a3a46', hat: 'cap', hatCol: '#4a4a52', plainCap: true, hair: 'short', hairCol: '#4a3020', brow: '#4a3020', moustache: '#4a3020', build: 'stout', head: 'wide', skin: '#e0a882', shoes: '#2a2020', noButtons: true },
  NG_HELP2: { shirt: '#7a8aa0', rolled: true, suspenders: '#4a3020', pants: '#4a4036', hat: 'cap', hatCol: '#6a5a44', plainCap: true, hair: 'short', hairCol: '#a86a3a', brow: '#a86a3a', build: 'thin', head: 'egg', skin: '#f0c4a0', shoes: '#2a2020', noButtons: true },
  NG_COOPER: { shirt: '#d8c8a8', rolled: true, apron: '#7a5a3a', pants: '#3e3a44', hair: 'bald', brow: '#3a2a20', moustache: '#3a2a20', build: 'stout', head: 'wide', skin: '#d8a07a', shoes: '#2a2020', noButtons: true },
  NG_RUSS: { coat: true, shirt: '#8a6a3a', pattern: 'plaid', plaidLine: 'rgba(60,30,20,0.45)', pants: '#7a5a34', collar: '#f4f1e8', cuff: '#8a6a3a', neck: 'bow', neckCol: '#b82a2a', hat: 'bowler', hatCol: '#2a2228',
    hair: 'side', hairCol: '#1e1612', brow: '#1e1612', moustache: '#1e1612', build: 'thin', head: 'tall', skin: '#f0c8a6', shoes: '#3a2418' },
  NG_REP: { coat: true, shirt: '#5a5a66', pants: '#5a5a66', collar: '#f4f1e8', cuff: '#5a5a66', neck: 'tie', neckCol: '#3a5a8a', hat: 'straw', hatCol: '#e8d090', pressCard: true, hair: 'short', hairCol: '#3a2a20', brow: '#3a2a20', build: 'adult', head: 'egg', skin: '#f2c4a2', shoes: '#1e1a1e' },
  NG_PHOTO: { shirt: '#6a4a3a', vest: '#3a3036', pants: '#3a3036', hat: 'bowler', hatCol: '#4a3a30', hair: 'short', hairCol: '#2a1a12', moustache: '#2a1a12', build: 'thin', head: 'tall', skin: '#d8a07a', shoes: '#2a2020' },
  NG_GENT: { coat: true, shirt: '#3a3a4a', pants: '#3a3a4a', collar: '#f4f1e8', cuff: '#3a3a4a', neck: 'tie', neckCol: '#8a2a3a', hat: 'top', hatCol: '#26222a', hair: 'short', hairCol: '#5a3a24', moustache: '#5a3a24', build: 'stout', head: 'wide', skin: '#f2c0a0', shoes: '#1a1618' },
  NG_LADY: { lashes: true, dress: true, bustle: true, shirt: '#3a7a8a', pants: '#3a7a8a', collar: '#f4eee0', cuff: '#f4eee0', hat: 'ladyhat', hatCol: '#e8c8d0', hair: 'bun', hairCol: '#c88a3a', head: 'egg', skin: '#f6d0b0', shoes: '#3a2a22', earring: true },
  NG_LADY2: { lashes: true, dress: true, shirt: '#a84a5a', pants: '#a84a5a', collar: '#f4eee0', hat: 'ladyhat', hatCol: '#f0e4c8', hair: 'bun', hairCol: '#2a1a12', head: 'round', skin: '#c88a62', shoes: '#2a2022' },
  NG_BOY: { shirt: '#e8e0cc', suspenders: '#3a3a5a', pants: '#5a4a3a', hat: 'cap', hatCol: '#3a4a6a', plainCap: true, hair: 'short', hairCol: '#c88a3a', build: 'kid', head: 'round', skin: '#f2c4a0', shoes: '#4a3424', noButtons: true },
};
const NG_OPS = [];
export const ngOpts = (op) => { const r = {}; for (const k of NG_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props (hand-local: hand at 0,0, up = -y; OVH.HSIDE = which side the prop leans)
const NG_HOLD = {
  // bicycle pump: barrel, T-handle, hose
  pump: (g) => { const s = OVH.HSIDE; line(g, [[s * 8, 10], [s * 8, -90]], 22, INK); line(g, [[s * 8, 10], [s * 8, -90]], 16, '#3a5a8a'); line(g, [[-s * 22, -96], [s * 38, -96]], 12, INK); line(g, [[-s * 22, -96], [s * 38, -96]], 7, '#2a2a30');
    line(g, [[s * 8, 12], [s * 30, 40], [s * 70, 44]], 7, INK); line(g, [[s * 8, 12], [s * 30, 40], [s * 70, 44]], 4, '#3a3a40'); cel(g, ellP(s * 8, 14, 16, 7), '#2a2a30', 2, 2, 1, 0); },
  // little coin purse (open, almost empty)
  purse: (g) => { const s = OVH.HSIDE, p = new Path2D(); p.moveTo(s * -20, -20); p.quadraticCurveTo(s * -28, 30, 0, 32); p.quadraticCurveTo(s * 28, 30, s * 20, -20); p.closePath(); cel(g, p, '#6a3a4a', 2.6, 4, 3, 0);
    line(g, [[s * -22, -22], [s * 22, -22]], 6, '#c8a050'); g.beginPath(); g.arc(s * 2, -26, 7, 0, TAU); g.fillStyle = '#e8c860'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); },
};
Object.assign(OVH.HOLD, NG_HOLD);

// ---------- lineup (?ngcast=N)
const KT = [
  { d: 6.5, a: [['NG_ANNIE', { expr: 'smile' }], ['NG_ANNIEH', { expr: 'determined' }], ['NG_ANNIEB', { expr: 'dazed' }], ['NG_ANNIEG', { expr: 'happy', point: 1 }], ['NG_RUSS', { expr: 'sly' }], ['CAT', { pose: 'sit', expr: 'smug' }]] },
  { d: 7.0, a: [['NG_HELP1', { expr: 'smile', prop: 'pump' }], ['NG_HELP2', { expr: 'grin' }], ['NG_COOPER', { expr: 'happy', prop: 'mallet' }], ['NG_REP', { expr: 'surprised', prop: 'notepad' }], ['NG_PHOTO', { expr: 'smile', prop: 'flashcam' }], ['NG_GENT', { expr: 'shock' }], ['NG_LADY', { expr: 'love' }], ['NG_LADY2', { expr: 'laugh' }], ['NG_BOY', { expr: 'excited' }]] },
  { d: 4.0, a: [['NG_ANNIEB', { expr: 'angry', point: 1 }], ['NG_ANNIE', { expr: 'worried', prop: 'purse' }], ['CAT', { pose: 'startled', expr: 'surprised' }], ['CAT', { pose: 'sit', expr: 'happy' }]] },
];
const CATFUR = { fur: '#d88a44', furDark: '#a85a2a', stripe: '#9a4a1e', furLight: '#f6e2c8' };
export function ngTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'CAT' ? 0.5 : o === 'NG_BOY' ? 0.85 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...(o === 'CAT' ? CATFUR : {}), ...op } }; }); }
export const NG_CATFUR = CATFUR;
