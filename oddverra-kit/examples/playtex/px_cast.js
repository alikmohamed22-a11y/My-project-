// [PX-cast] "The Moon spacesuits were sewn by a bra company" (ILC, Dover, Delaware; Apollo A7L, 1965-69): outfit table (merged into ODD by
// main.js), props (into oddverra's HOLD) and a cast lineup (?pxcast=N). All designs are invented generic Oddverra characters; the
// astronaut is a stylized moonwalker (white suit, chest box, bubble helmet: o.astro / hat 'helmet', see oddverra_next.js [PX-cast]).
// No logos or brand marks anywhere: the company is named only in the narration.
import { OVK, OVH, INK } from './oddverra_next.js';
const { cel, line, ellP } = OVK;

const ASTRO = { astro: true, shirt: '#f4f4f0', pants: '#f4f4f0', collar: '#f4f4f0', cuff: '#c8ccd6', belt: '#b8bcc8', boots: true, shoes: '#e8e8e4', hair: 'short', hairCol: '#c89a5a', brow: '#a87a4a',
  build: 'adult', head: 'egg', skin: '#f2c8a6', noButtons: true };
export const PX_ODD = {
  PX_ASTRO: { ...ASTRO, hat: 'helmet' },                                              // the moonwalker, helmet on
  PX_ASTROH: { ...ASTRO },                                                            // suit on, helmet off (test hall)
  PX_DOT: { lashes: true, dress: true, shirt: '#e8789a', pants: '#e8789a', collar: '#fff4ea', cuff: '#fff4ea', apron: '#f6eedc', hair: 'bun', hairCol: '#6a3a24', brow: '#5a2a1a',
    glasses: 'horn', head: 'round', skin: '#f4c8a8', shoes: '#4a2a2a', earring: '#f4e8d0' },                             // lead seamstress (the sidekick)
  PX_SEAM2: { lashes: true, dress: true, shirt: '#6ab0c8', pants: '#6ab0c8', collar: '#fff4ea', apron: '#f6eedc', hair: 'curly', hairCol: '#2a1a14', brow: '#2a1a14', head: 'egg', skin: '#b8805a', shoes: '#3a2a22' },
  PX_SEAM3: { lashes: true, dress: true, shirt: '#f0c050', pants: '#f0c050', collar: '#fff4ea', apron: '#f6eedc', hair: 'bun', hairCol: '#d8a050', brow: '#b88040', head: 'wide', skin: '#f6d0b0', shoes: '#4a3424', build: 'stout' },
  PX_SEAM4: { lashes: true, dress: true, shirt: '#9a7ad8', pants: '#9a7ad8', collar: '#fff4ea', apron: '#f6eedc', hair: 'long', hairCol: '#3a2420', brow: '#3a2420', head: 'round', skin: '#e8b08a', shoes: '#3a2a22', build: 'thin' },
  PX_BOSS: { shirt: '#f4f1e8', pants: '#4a4a5a', collar: '#f4f1e8', cuff: '#f4f1e8', neck: 'tie', neckCol: '#c84a3a', hair: 'side', hairCol: '#3a2a20', brow: '#3a2a20', glasses: 'horn',
    build: 'stout', head: 'wide', skin: '#f0c4a0', shoes: '#2a2020' },                                                 // the suit project's manager
  PX_NASA: { shirt: '#f6f6f2', pants: '#3a4050', collar: '#f6f6f2', cuff: '#f6f6f2', neck: 'tie', neckCol: '#1e2a4a', hair: 'crew', hairCol: '#7a5a3a', brow: '#6a4a2a',
    build: 'thin', head: 'tall', skin: '#f2c8a6', shoes: '#1e1a1e', pressCard: true },                                 // the doubting engineer
  PX_NASA2: { shirt: '#dfe8f2', pants: '#4a4a52', collar: '#dfe8f2', cuff: '#dfe8f2', neck: 'tie', neckCol: '#3a2a2a', hair: 'receding', hairCol: '#4a4a4a', brow: '#3a3a3a', moustache: '#4a4a4a', glasses: 'horn',
    build: 'stout', head: 'round', skin: '#c88a62', shoes: '#1e1a1e' },
  PX_RIVAL: { coat: true, shirt: '#5a6070', pants: '#5a6070', collar: '#f4f1e8', cuff: '#5a6070', neck: 'tie', neckCol: '#8a2a3a', hair: 'side', hairCol: '#1e1612', brow: '#1e1612',
    build: 'adult', head: 'egg', skin: '#f2c0a0', shoes: '#1a1618' },
  PX_RIVAL2: { coat: true, shirt: '#3a3a4a', pants: '#3a3a4a', collar: '#f4f1e8', cuff: '#3a3a4a', neck: 'bow', neckCol: '#2a4a8a', hair: 'bald', brow: '#5a3a24', moustache: '#5a3a24', glasses: 'horn',
    build: 'stout', head: 'wide', skin: '#e0a882', shoes: '#1a1618' },
};
const PX_OPS = [];
export const pxOpts = (op) => { const r = {}; for (const k of PX_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props (hand-local: hand at 0,0, up = -y; OVH.HSIDE = which side the prop leans)
const PX_HOLD = {
  // tape measure: round case + ribbon of yellow tape
  tape: (g) => { const s = OVH.HSIDE; cel(g, ellP(s * 4, -6, 18, 18), '#d84a5a', 2.4, 3, 2, 0); cel(g, ellP(s * 4, -6, 6, 6), '#f4eee0', 1.4, 0, 0, 0);
    line(g, [[s * 20, -2], [s * 46, 14], [s * 70, 10], [s * 92, 26]], 9, INK); line(g, [[s * 20, -2], [s * 46, 14], [s * 70, 10], [s * 92, 26]], 6, '#f2d050'); },
  // clipboard with a checklist
  clip: (g) => { const s = OVH.HSIDE; cel(g, OVK.polyPath ? OVK.polyPath([[s * -26, -60], [s * 30, -60], [s * 30, 14], [s * -26, 14]]) : ellP(0, -20, 28, 36), '#a8784a', 2.6, 3, 2, 0);
    cel(g, OVK.polyPath ? OVK.polyPath([[s * -20, -52], [s * 24, -52], [s * 24, 8], [s * -20, 8]]) : ellP(0, -20, 22, 30), '#f6f2e6', 1.6, 0, 0, 0);
    for (let i = 0; i < 4; i++) line(g, [[s * -10, -42 + i * 13], [s * 18, -42 + i * 13]], 2.4, 'rgba(60,50,80,0.6)'); line(g, [[s * -6, -64], [s * 10, -64]], 7, '#8a8a92'); },
};
Object.assign(OVH.HOLD, PX_HOLD);

// ---------- lineup (?pxcast=N)
const KT = [
  { d: 6.5, a: [['PX_ASTRO', { expr: 'smile' }], ['PX_ASTROH', { expr: 'excited', wave: 0.8 }], ['PX_DOT', { expr: 'happy', prop: 'needle' }], ['PX_SEAM2', { expr: 'grin' }], ['PX_SEAM3', { expr: 'laugh' }], ['PX_SEAM4', { expr: 'smile', prop: 'tape' }]] },
  { d: 6.5, a: [['PX_BOSS', { expr: 'worried' }], ['PX_NASA', { expr: 'sly', prop: 'clip' }], ['PX_NASA2', { expr: 'thoughtful', prop: 'clip' }], ['PX_RIVAL', { expr: 'smug' }], ['PX_RIVAL2', { expr: 'shock' }], ['PX_ASTRO', { expr: 'excited', view: '34L', cheer: 0.6 }]] },
];
export function pxTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
