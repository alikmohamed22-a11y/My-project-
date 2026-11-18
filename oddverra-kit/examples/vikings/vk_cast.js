// [VK-cast] "Vikings never wore horned helmets": outfit table (merged into ODD by main.js), props (into oddverra's HOLD), HELMI (a little
// living Viking-age iron helmet with a spectacle guard: the sidekick; drawHelmi on the 600x1000 card) and a cast lineup (?vkcast=N).
// Hats 'viking' (iron cap; o.guard = spectacle guard; o.horns = 1876 opera horns) and 'beret' live in oddverra_next.js [VK-cast].
// Wagner is our own stylization (velvet beret, chin fringe beard, frock coat); Doepler, the Vikings, archaeologists, the 1943 farmer and
// the 1876 audience are invented generic designs.
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, line, ellP, polyPath, smooth, limb, arcPts, mixc } = OVK;
const TAU = Math.PI * 2;

const VIK = { shirt: '#3a5a8a', pants: '#6a5a44', belt: true, boots: true, shoes: '#4a3424', noButtons: true, hat: 'viking', hatCol: '#7e7c86', build: 'stout', head: 'wide', noChain: true };
export const VK_ODD = {
  VK_OPERA: { ...VIK, shirt: '#a8382e', pants: '#4a3a2a', horns: true, hatCol: '#9a98a6', hair: 'long', hairCol: '#d89a3a', brow: '#c07a28', beard: 'full', beardCol: '#d88a30', skin: '#f2c8a2', cape: true },
  VK_OPERA0: { ...VIK, shirt: '#a8382e', pants: '#4a3a2a', hatCol: '#9a98a6', hair: 'long', hairCol: '#d89a3a', brow: '#c07a28', beard: 'full', beardCol: '#d88a30', skin: '#f2c8a2' },
  VK_RAIDER: { ...VIK, guard: true, hair: 'long', hairCol: '#8a5a2a', brow: '#6a3a1a', beard: 'full', beardCol: '#8a5a2a', skin: '#ecbc96' },
  VK_RAIDER2: { ...VIK, shirt: '#6a7a4a', pants: '#5a4a3a', hat: undefined, hair: 'long', hairCol: '#e0c070', brow: '#c8a050', beard: 'full', beardShort: true, beardK: 0.8, beardCol: '#e0b860', build: 'adult', head: 'egg', skin: '#f2c8a6' },
  VK_SINGER: { ...VIK, shirt: '#8a2a3a', pants: '#3a2a2a', horns: true, hatCol: '#c8c4cc', hair: 'long', hairCol: '#f0d070', brow: '#d8a840', beard: 'full', beardCol: '#f0c860', skin: '#f6cca8', build: 'stout', head: 'round' },
  VK_ARCH: { shirt: '#c8b890', vest: '#6a7a4a', rolled: true, openCollar: true, pants: '#8a7a5a', hat: 'wide', hatCol: '#b8a070', bandCol: '#5a4a30', hair: 'short', hairCol: '#4a3020', brow: '#4a3020', glasses: true, build: 'adult', head: 'egg', skin: '#d8a07a', shoes: '#5a3a24', noButtons: true },
  VK_ARCH2: { lashes: true, shirt: '#e8dcc0', vest: '#c87a3a', rolled: true, openCollar: true, pants: '#5a6a7a', hat: 'cap', hatCol: '#3a6a8a', plainCap: true, hair: 'bun', hairCol: '#2a1a12', brow: '#2a1a12', build: 'thin', head: 'round', skin: '#a86a48', shoes: '#4a3a2a', noButtons: true },
  VK_FARMER: { shirt: '#d8d0c0', rolled: true, pants: '#4a4a5a', suspenders: '#3a2a20', hat: 'cap', hatCol: '#5a5a62', plainCap: true, hair: 'short', hairCol: '#c8a060', brow: '#a88040', build: 'thin', head: 'tall', skin: '#f2c8a6', shoes: '#3a2a20', noButtons: true },
  VK_WAGNER: { frock: true, coat: true, shirt: '#2a2632', pants: '#3a3640', waistcoat: '#5a3a4a', collar: '#f4f1e8', cuff: '#2a2632', neck: 'cravat', neckCol: '#f4f1e8', button: '#c8a050',
    hat: 'beret', hatCol: '#1e1a26', hair: 'side', hairCol: '#6a5a4a', brow: '#5a4a3a', beard: 'chops', beardCol: '#8a7a6a', nose: 'long', build: 'thin', head: 'egg', skin: '#f2c8a8', shoes: '#1a1618', noChain: true },
  VK_DOEPLER: { frock: true, coat: true, shirt: '#5a4636', pants: '#4a4038', waistcoat: '#b89a5a', collar: '#f4f1e8', cuff: '#5a4636', neck: 'bow', neckCol: '#3a2a3a', button: '#3a2a20',
    hair: 'side', hairCol: '#b8b0a8', brow: '#9a928a', beard: 'full', beardShort: true, beardK: 0.75, beardCol: '#b8b0a8', glasses: 'pincenez', build: 'adult', head: 'round', skin: '#f2c8a8', shoes: '#2a1e1e', noChain: true },
  VK_GENT: { frock: true, coat: true, shirt: '#2a2a34', pants: '#3a3a44', waistcoat: '#8a7a5a', collar: '#f4f1e8', cuff: '#2a2a34', neck: 'bow', neckCol: '#14121a', hat: 'top', hatCol: '#1e1c24', hair: 'short', hairCol: '#4a3020', brow: '#4a3020', moustache: '#4a3020', build: 'stout', head: 'wide', skin: '#f2c0a0', shoes: '#1a1618' },
  VK_LADY: { lashes: true, dress: true, bustle: true, shawl: '#5a3a6a', shirt: '#8a3a4a', pants: '#8a3a4a', collar: '#f4eee0', cuff: '#f4eee0', hat: 'ladyhat', hatCol: '#e8dcc0', hair: 'bun', hairCol: '#a8602a', head: 'egg', skin: '#f6d0b0', shoes: '#3a2a22' },
  VK_GENT2: { frock: true, coat: true, shirt: '#3a2a22', pants: '#5a4a3a', waistcoat: '#c8b890', collar: '#f4f1e8', cuff: '#3a2a22', neck: 'cravat', neckCol: '#f4f1e8', hat: 'bowler', hatCol: '#2a2420', hair: 'side', hairCol: '#c0a070', brow: '#a08050', beard: 'chops', beardCol: '#c0a070', build: 'adult', head: 'egg', skin: '#f6d0b0', shoes: '#1a1618' },
  VK_KID: { shirt: '#3a7ac8', pants: '#c8b890', hat: 'viking', horns: true, hatCol: '#c8c8d0', hornK: 0.8, hair: 'short', hairCol: '#e0b060', build: 'kid', head: 'round', skin: '#f2c8a6', shoes: '#5a3a24', noButtons: true },
  VK_KID2: { lashes: true, dress: true, shirt: '#e86a7a', pants: '#e86a7a', hat: 'viking', horns: true, hatCol: '#d8d0b8', hornK: 0.8, hair: 'long', hairCol: '#5a2a14', build: 'kid', head: 'egg', skin: '#c88a62', shoes: '#3a2a2a', noButtons: true },
};
const VK_OPS = ['horns'];
export const vkOpts = (op) => { const r = {}; for (const k of VK_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props
const VK_HOLD = {
  trowel: (g) => { const s = OVH.HSIDE; line(g, [[0, 10], [s * 10, -50]], 12, INK); line(g, [[0, 10], [s * 10, -50]], 8, '#8a5a34'); cel(g, polyPath([[s * 6, -50], [s * 30, -70], [s * 22, -150], [s * -4, -70]]), '#b8bcc6', 3, 6, 4, 2); },
  brush: (g) => { const s = OVH.HSIDE; line(g, [[0, 10], [s * 16, -70]], 10, INK); line(g, [[0, 10], [s * 16, -70]], 6, '#c8903a'); cel(g, polyPath([[s * 8, -66], [s * 28, -70], [s * 34, -120], [s * 6, -114]]), '#e8d8a0', 2.6, 4, 2, 0); },
  ironhelm: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 30, -60); const d = new Path2D(); d.moveTo(-60, 0); d.bezierCurveTo(-62, -86, 62, -86, 60, 0); d.quadraticCurveTo(0, 10, -60, 0); cel(g, d, '#7e7c86', 3.4, 8, 4, 3);
    line(g, [[0, -64], [0, 2]], 7, '#5e5c66'); line(g, [[-58, -6], [58, -6]], 7, '#5e5c66'); for (const x of [-24, 24]) { g.beginPath(); g.ellipse(x, 18, 16, 14, 0, 0, TAU); g.lineWidth = 6; g.strokeStyle = '#6e6c76'; g.stroke(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); } line(g, [[0, 2], [0, 34]], 7, '#6e6c76'); g.restore(); },
  baton: (g) => { const s = OVH.HSIDE; line(g, [[0, 6], [s * 60, -90]], 6, INK); line(g, [[0, 6], [s * 60, -90]], 3.4, '#f2ece0'); },
};
Object.assign(OVH.HOLD, VK_HOLD);

// ---------- HELMI: drawHelmi(g, o, op) on the 600x1000 card (ground y≈965, centre x=300)
// op.expr: 'smile' | 'happy' | 'shock' | 'sad' | 'sly' | 'proud' | 'love' | 'dizzy'; op.pose: 'stand' | 'wave' | 'cheer' | 'point' | 'shrug' | 'hips' | 'shock'; op.horns (fake horns), op.flip, op.look, op.blink, op.t
const hEye = (g, x, y, k, E, blink, look) => {
  if (blink >= 1 || E === 'happy') { taper(g, [[x - 13 * k, y + 5 * k], [x, y - 9 * k], [x + 13 * k, y + 5 * k]], 5.5 * k, INK, 0.35); return; }
  if (E === 'dizzy') { taper(g, arcPts(x, y, 10 * k, 0, TAU * 1.6, 18), 3.6 * k, INK, 0.3); return; }
  if (E === 'love') { const r = 15 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); return; }
  const sh = E === 'shock', rx = (sh ? 12 : 9.5) * k, ry = (sh ? 17 : 14) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k, P = ellP(lx, y, rx, ry);
  g.fillStyle = INK; g.fill(P); g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 6 * k, (sh ? 4 : 3.4) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
  g.save(); g.translate(lx - 3 * k, y - 6 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.8 * k, 2 * k, 0, 0, TAU); g.lineWidth = 1.2 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  const lid = { proud: 0.45, sly: 0.5, sad: 0.25 }[E]; if (lid && blink < 0.5) { const yl = y - ry + 2 * ry * lid; g.save(); g.clip(ellP(lx, y, rx + 3, ry + 3)); g.fillStyle = '#f2d2b4'; g.fillRect(lx - rx - 6, y - ry - 8, 2 * rx + 12, yl - (y - ry - 8)); g.restore(); taper(g, [[lx - rx - 2, yl], [lx + rx + 2, yl]], 3 * k, INK, 0.3); } };
export function drawHelmi(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, blink = op.blink || 0, look = op.look || 0, body = op.col || '#8a8894';
  const pose = op.pose || ({ shock: 'shock', proud: 'hips' }[E]) || 'stand';
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const hopA = pose === 'cheer' ? Math.abs(Math.sin(t * 0.35)) * 16 : 0, bob = Math.sin(t * 0.2) * 4 - hopA, tilt = E === 'sad' ? 0.05 : E === 'shock' ? -0.05 : E === 'sly' ? 0.08 : 0;
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale(flip ? -1 : 1, 1);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 170, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  for (const s of [-1, 1]) { const fx = s * 56; cel(g, limb([[fx, -110 + bob], [fx + s * 6, -26]], [15, 13]), '#4a3a30', 2.6, 3, 2, 1); cel(g, ellP(fx + s * 10, -16, 36, 17), '#5a3a24', 2.8, 5, 3, 2); }
  g.translate(0, bob); g.rotate(tilt);
  const R = 170, rimY = -330, topY = rimY - 300;
  // face plate under the cap (skin-toned) + spectacle guard + cap
  const face = new Path2D(); face.moveTo(-R * 0.86, rimY); face.bezierCurveTo(-R * 0.9, rimY + 150, -R * 0.5, -96, 0, -96); face.bezierCurveTo(R * 0.5, -96, R * 0.9, rimY + 150, R * 0.86, rimY); face.closePath(); cel(g, face, '#f2d2b4', 4, 18, 12, 6);
  const E2 = op.horns ? 1 : 0; const horn = (s) => { const P = [[s * R * 0.82, rimY - 120], [s * R * 1.3, rimY - 150], [s * R * 1.55, rimY - 300], [s * R * 1.42, rimY - 420]]; const L = [], Rt = []; const C = []; for (let i = 0; i <= 12; i++) { const u = i / 12, a = (1 - u) ** 3, b = 3 * u * (1 - u) ** 2, c = 3 * u * u * (1 - u), d = u ** 3; C.push([a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]]); }
    C.forEach(([x, y], i) => { const w = 34 * (1 - i / 12) + 3, n = i < 12 ? [C[i + 1][0] - x, C[i + 1][1] - y] : [x - C[i - 1][0], y - C[i - 1][1]], l = Math.hypot(...n); L.push([x - n[1] / l * w, y + n[0] / l * w]); Rt.push([x + n[1] / l * w, y - n[0] / l * w]); }); cel(g, polyPath([...L, ...Rt.reverse()]), '#f2e6c8', 4, 10, 6, 3); };
  if (E2) { horn(-1); horn(1); }
  const cap = new Path2D(); cap.moveTo(-R, rimY + 10); cap.bezierCurveTo(-R * 1.05, topY, R * 1.05, topY, R, rimY + 10); cap.quadraticCurveTo(0, rimY + 40, -R, rimY + 10); cap.closePath(); cel(g, cap, body, 4.6, 26, 18, 7);
  g.save(); g.clip(cap); g.fillStyle = mixc(body, INK, 0.2); g.fillRect(-18, topY, 36, rimY - topY + 40); g.beginPath(); g.moveTo(-R * 1.1, rimY - 14); g.quadraticCurveTo(0, rimY + 12, R * 1.1, rimY - 14); g.lineTo(R * 1.1, rimY + 40); g.lineTo(-R * 1.1, rimY + 40); g.fill();
  for (let k = -3; k <= 3; k++) { g.beginPath(); g.arc(k * 46, rimY + 6 - Math.abs(k) * 2, 6, 0, TAU); g.fillStyle = '#c8c8d0'; g.fill(); } g.globalAlpha = 0.22; g.fillStyle = '#e0e0ff'; g.beginPath(); g.ellipse(-70, rimY - 170, 34, 70, -0.5, 0, TAU); g.fill(); g.restore();
  cel(g, ellP(0, topY + 56, 14, 11), mixc(body, '#ffffff', 0.15), 3, 2, 2, 0);
  const fy = rimY + 80, ex = 52, k = 1.25;
  for (const s of [-1, 1]) hEye(g, s * ex + look * 6, fy, k, E, blink, look);
  for (const s of [-1, 1]) { const op2 = ellP(s * ex, fy - 2, 40, 36), ip = ellP(s * ex, fy - 2, 29, 26), rg = new Path2D(); rg.addPath(op2); rg.addPath(ip); g.fillStyle = body; g.fill(rg, 'evenodd'); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(op2); g.lineWidth = 2.6; g.stroke(ip);
    taper(g, arcPts(s * ex - 4, fy - 6, 36, Math.PI * 1.15, Math.PI * 1.5, 5, 32), 3, 'rgba(255,255,255,0.5)', 0.2); }
  cel(g, polyPath([[-9, rimY + 20], [9, rimY + 20], [8, fy + 52], [-8, fy + 52]]), body, 3, 4, 3, 0);
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -14, -8], sad: [-10, -2, 8], sly: [8, 2, 0], love: [0, -6, 0], dizzy: [-2, -6, -2] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = fy - 48; taper(g, [[s * (ex - 18), by + BR[0]], [s * ex, by + BR[1]], [s * (ex + 18), by + BR[2]]], 6, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 34), fy + 52, 18, 9, 0, 0, TAU); g.fillStyle = 'rgba(255,120,150,0.75)'; g.fill(); }
  const my = fy + 82, MC = '#7a2238';
  if (E === 'shock') { const p = ellP(0, my + 4, 11, 15); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad') taper(g, arcPts(0, my + 16, 15, Math.PI * 1.2, Math.PI * 1.8, 8), 4.4, INK, 0.3);
  else if (E === 'happy' || E === 'love') { const p = new Path2D(); p.moveTo(-20, my - 4); p.bezierCurveTo(-8, my, 8, my, 20, my - 4); p.bezierCurveTo(16, my + 18, -16, my + 18, -20, my - 4); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'proud' || E === 'sly') taper(g, [[-15, my], [4, my + 7], [19, my - 7]], 4.4, INK, 0.3);
  else taper(g, arcPts(0, my - 10, 18, Math.PI * 0.2, Math.PI * 0.8, 10), 4.4, INK, 0.3);
  if (E === 'shock') { g.beginPath(); g.moveTo(R + 20, topY + 120); g.quadraticCurveTo(R + 34, topY + 144, R + 20, topY + 150); g.quadraticCurveTo(R + 6, topY + 144, R + 20, topY + 120); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); }
  // arms from the sides of the face plate
  for (const s of [-1, 1]) { const S = [s * R * 0.78, rimY + 150]; let E3, Hh;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 16 : Math.sin(t * 0.4 + s) * 6; E3 = [S[0] + s * 50, S[1] - 46]; Hh = [S[0] + s * 56 + w, S[1] - 110]; }
    else if (pose === 'shock') { E3 = [S[0] + s * 54, S[1] - 6]; Hh = [S[0] + s * 60, S[1] - 70]; }
    else if (pose === 'hips') { E3 = [S[0] + s * 52, S[1] + 40]; Hh = [S[0] + s * 6, S[1] + 84]; }
    else if (pose === 'shrug') { E3 = [S[0] + s * 52, S[1] + 26]; Hh = [S[0] + s * 96, S[1] - 14]; }
    else if (pose === 'point' && s > 0) { E3 = [S[0] + 60, S[1] - 10]; Hh = [S[0] + 118, S[1] - 40]; }
    else { E3 = [S[0] + s * 28, S[1] + 60]; Hh = [S[0] + s * 32, S[1] + 116]; }
    cel(g, limb([S, E3, Hh], [14, 13, 12]), '#4a3a30', 2.6, 4, 3, 2); cel(g, ellP(Hh[0], Hh[1], 19, 17), '#f2d2b4', 2.6, 4, 3, 2); }
  g.restore(); }

// ---------- lineup (?vkcast=N)
const KT = [
  { d: 7.0, a: [['VK_OPERA', { expr: 'smug' }], ['VK_RAIDER', { expr: 'smile' }], ['VK_RAIDER2', { expr: 'grin', cross: 1 }], ['VK_SINGER', { expr: 'happy', cheer: 1 }], ['VK_ARCH', { expr: 'smile', prop: 'brush' }], ['VK_ARCH2', { expr: 'excited', prop: 'trowel' }], ['HELMI', { expr: 'happy', pose: 'wave' }]] },
  { d: 7.0, a: [['VK_WAGNER', { expr: 'smug' }], ['VK_DOEPLER', { expr: 'thoughtful', prop: 'sketchbook' }], ['VK_GENT', { expr: 'smile' }], ['VK_LADY', { expr: 'happy' }], ['VK_GENT2', { expr: 'grin' }], ['VK_FARMER', { expr: 'shock', prop: 'shovel' }], ['VK_KID', { expr: 'laugh' }], ['VK_KID2', { expr: 'excited' }]] },
  { d: 4.0, a: [['HELMI', { expr: 'shock' }], ['HELMI', { expr: 'sly', pose: 'shrug' }], ['HELMI', { expr: 'love', pose: 'cheer', horns: 1 }], ['VK_RAIDER', { expr: 'thoughtful', prop: 'ironhelm', view: '34R' }]] },
];
export function vkTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'HELMI' ? 0.42 : o.startsWith('VK_KID') ? 0.9 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
