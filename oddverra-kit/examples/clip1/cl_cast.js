// [CL-cast] "The first speeding ticket was for 8 mph" (Walter Arnold, Paddock Wood, Kent, 28 Jan 1896): outfit table (merged into ODD by
// main.js) and CLBIKE (a county constable pedalling a black safety bicycle, drawn on the 1000x880 card like RVRIDE; drawCyclist).
// Everyone is our own stylization (no portraits). The constable's custodian helmet is o.hat = 'bobby' (oddverra_next.js [CL-cast]).
// The sidekick is a carriage horse (RVRIDE with no rider, rv_cast.js) that side-eyes the horseless carriage.
import { OVK, ovLight, INK, oddverra } from './oddverra_next.js';
const { cel, taper, ellP, limb, mixc, polyPath } = OVK;
const TAU = Math.PI * 2;

export const CL_ODD = {
  CL_ARNOLD: { coat: true, shirt: '#6a5038', pattern: 'plaid', plaidLine: 'rgba(40,24,16,0.4)', pants: '#4a3a30', collar: '#f4f1e8', cuff: '#6a5038', neck: 'tie', neckCol: '#2f5a3a', hat: 'cap', hatCol: '#5a4a3a', plainCap: true,
    goggles: true, gogglesCol: '#c89a3a', hair: 'short', hairCol: '#4a3020', brow: '#4a3020', moustache: '#4a3020', build: 'adult', head: 'wide', skin: '#f0c4a0', shoes: '#2a2020' },   // the motorist, 1896
  CL_BOBBY: { coat: true, shirt: '#1e2442', pants: '#1e2442', collar: '#1e2442', cuff: '#1e2442', button: '#dfe3ea', belt: '#141218', hat: 'bobby', hatCol: '#1e2442',
    hair: 'short', hairCol: '#5a3a24', brow: '#5a3a24', moustache: '#5a3a24', build: 'stout', head: 'round', skin: '#f2c0a0', shoes: '#141218' },                                              // county constable
  CL_MAG1: { coat: true, shirt: '#2a2630', pants: '#2a2630', collar: '#f4f1e8', cuff: '#2a2630', neck: 'bow', neckCol: '#141218', glasses: true, hair: 'bald', hairCol: '#e8e4dc', brow: '#d8d4cc', beard: 'chops', beardCol: '#e8e4dc',
    build: 'old', head: 'egg', skin: '#f0c4a0', shoes: '#16141a' },                                                                                                                           // chairman of the bench
  CL_MAG2: { coat: true, shirt: '#4a4a56', pants: '#4a4a56', collar: '#f4f1e8', cuff: '#4a4a56', neck: 'tie', neckCol: '#6a2a3a', hair: 'side', hairCol: '#b8b4ae', brow: '#8a8680', moustache: '#b8b4ae', build: 'stout', head: 'wide', skin: '#e8b48c', shoes: '#16141a' },
  CL_CLERK: { shirt: '#f2ece0', waistcoat: '#3a3a46', pants: '#3a3a46', neck: 'bow', neckCol: '#2a2630', glasses: true, hair: 'side', hairCol: '#3a2a20', brow: '#3a2a20', build: 'thin', head: 'tall', skin: '#f2c8a6', shoes: '#16141a' },
  CL_VIL1: { shirt: '#d8c8a8', rolled: true, vest: '#5a4a3a', pants: '#5a4a3a', hat: 'cap', hatCol: '#4a4a52', plainCap: true, hair: 'short', hairCol: '#8a5a32', brow: '#8a5a32', beard: 'chops', beardCol: '#8a5a32', build: 'stout', head: 'wide', skin: '#e0a882', shoes: '#3a2a22', noButtons: true }, // farmer
  CL_VIL2: { lashes: true, dress: true, shirt: '#7a3a4a', pants: '#7a3a4a', collar: '#f4eee0', cuff: '#f4eee0', shawl: '#c8b8a0', hat: 'ladyhat', hatCol: '#3a2a3a', hair: 'bun', hairCol: '#6a3a22', head: 'egg', skin: '#f6d0b0', shoes: '#2a2022', earring: true },
  CL_VIL3: { shirt: '#e8e0cc', suspenders: '#3a3a5a', pants: '#5a4a3a', hat: 'cap', hatCol: '#3a4a6a', plainCap: true, hair: 'short', hairCol: '#c88a3a', build: 'kid', head: 'round', skin: '#f2c4a0', shoes: '#4a3424', noButtons: true },
  CL_VIL4: { coat: true, shirt: '#3a3a4a', pants: '#3a3a4a', collar: '#f4f1e8', cuff: '#3a3a4a', neck: 'tie', neckCol: '#8a2a3a', hat: 'bowler', hatCol: '#26222a', hair: 'short', hairCol: '#2a1a12', moustache: '#2a1a12', build: 'thin', head: 'tall', skin: '#c88a62', shoes: '#1a1618' },
  CL_GENT: { coat: true, shirt: '#2a2630', pants: '#3a3a46', collar: '#f4f1e8', cuff: '#2a2630', neck: 'bow', neckCol: '#b8222a', hat: 'top', hatCol: '#26222a', hair: 'side', hairCol: '#8a6a4a', moustache: '#8a6a4a', build: 'stout', head: 'round', skin: '#f2c0a0', shoes: '#1a1618' },
  CL_LADY: { lashes: true, dress: true, bustle: true, shirt: '#3a6a8a', pants: '#3a6a8a', collar: '#f4eee0', cuff: '#f4eee0', hat: 'ladyhat', hatCol: '#e8c8d0', hair: 'bun', hairCol: '#c88a3a', head: 'egg', skin: '#f6d0b0', shoes: '#3a2a22', earring: true },
  CL_DRIVER2: { coat: true, shirt: '#3a4a5a', pants: '#3a3a46', collar: '#f4f1e8', cuff: '#3a4a5a', hat: 'cap', hatCol: '#3a3a46', plainCap: true, goggles: true, gogglesCol: '#a8acb8', hair: 'short', hairCol: '#8a5a32', brow: '#8a5a32', beard: 'full', beardCol: '#8a5a32', build: 'stout', head: 'round', skin: '#e8b08a', shoes: '#2a2020' },
};
const CL_OPS = [];
export const clOpts = (op) => { const r = {}; for (const k of CL_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- CLBIKE: drawCyclist(g, o, op) on the 1000x880 card (ground y = 850). op: t, speed 0..1 (pedalling + spokes), rider (ODD key),
// odd (ODD table), riderExpr, riderView, flip (faces left), blink, bell (0..1 ring wobble), lean, dust (colour), hands ('bars' | 'up' = one arm raised)
const rc0 = (() => { let c = null; return () => { if (!c) { c = document.createElement('canvas'); c.width = 600; c.height = 1000; } return c; }; })();
export function drawCyclist(g, o = {}, op = {}) {
  const t = op.t || 0, sp = op.speed ?? 1, flip = !!op.flip, ODDT = op.odd || {}, K = 0.8;
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  g.save(); g.translate(500, 850); g.scale(flip ? -1 : 1, 1);
  g.save(); g.scale(1, 0.12); g.beginPath(); g.ellipse(0, 0, 330, 80, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.24)'; g.fill(); g.restore();
  const r = 124, RH = [-230, -r], FH = [230, -r], BB = [-30, -110], STp = [-80, -360], SAD = [-92, -382], HT = [180, -350], HB = [200, -270], BAR = [150, -405];
  const bob = sp * 3 * Math.sin(t * 0.9), wa = t * sp * 0.42, ca = t * sp * 0.21;
  const tube = (a, b, w, col) => { taper(g, [a, b], w + 6, INK, 0.05); taper(g, [a, b], w, col, 0.05); };
  const wheel = (C, far) => { const col = far ? '#2a2630' : '#1e1a22';
    g.beginPath(); g.arc(C[0], C[1], r, 0, TAU); g.lineWidth = 22; g.strokeStyle = INK; g.stroke(); g.lineWidth = 15; g.strokeStyle = col; g.stroke(); g.lineWidth = 4; g.strokeStyle = mixc('#c8ccd4', col, far ? 0.5 : 0); g.beginPath(); g.arc(C[0], C[1], r - 12, 0, TAU); g.stroke();
    g.lineWidth = 2; g.strokeStyle = far ? 'rgba(190,195,205,0.5)' : 'rgba(210,214,222,0.85)'; for (let i = 0; i < 16; i++) { const a = wa + i * TAU / 16; g.beginPath(); g.moveTo(C[0] + Math.cos(a) * 10, C[1] + Math.sin(a) * 10); g.lineTo(C[0] + Math.cos(a + 0.3) * (r - 14), C[1] + Math.sin(a + 0.3) * (r - 14)); g.stroke(); }
    if (sp > 0.5) { g.globalAlpha = 0.25 * sp; g.fillStyle = '#c8ccd4'; g.beginPath(); g.arc(C[0], C[1], r - 16, 0, TAU); g.fill(); g.globalAlpha = 1; }
    cel(g, ellP(C[0], C[1], 14, 14), '#c8ccd4', 2.4, 1, 1, 0); };
  const pedal = (a) => [BB[0] + Math.cos(a) * 52, BB[1] + Math.sin(a) * 52];
  const ik = (Hp, P, L1, L2) => { const dx = P[0] - Hp[0], dy = P[1] - Hp[1], d = Math.min(Math.hypot(dx, dy), L1 + L2 - 1), a0 = Math.atan2(dy, dx), c = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), a1 = a0 - Math.acos(Math.max(-1, Math.min(1, c))); return [Hp[0] + Math.cos(a1) * L1, Hp[1] + Math.sin(a1) * L1]; };
  const RO = ODDT[op.rider || 'CL_BOBBY'] || {}, pc = RO.pants || '#1e2442', bc = RO.shoes || '#141218';
  const hip = [SAD[0] + 6, SAD[1] - 8 + bob];
  const leg = (a, far) => { const P = pedal(a), Kn = ik(hip, [P[0] + 6, P[1] - 18], 170, 168), col = far ? mixc(pc, '#3a2a7a', 0.3) : pc;
    cel(g, limb([hip, Kn, [P[0] + 6, P[1] - 18]], [46, 36, 28]), col, 3.4, far ? 2 : 6, 4, far ? 0 : 2); cel(g, ellP(P[0] + 16, P[1] - 6, 36, 15), bc, 3, 2, 2, 0); };
  // far side: far leg + far crank, rear and front wheels
  { const P = pedal(ca + Math.PI); tube(BB, P, 7, '#3a3a44'); } leg(ca + Math.PI, true);
  wheel(RH, false); wheel(FH, false);
  // frame (black), mudguards, chainring, saddle, handlebars, lamp, bell
  for (const C of [RH, FH]) { g.beginPath(); g.arc(C[0], C[1], r + 16, Math.PI * (C === RH ? 1.05 : 1.15), Math.PI * (C === RH ? 1.85 : 1.95)); g.lineWidth = 12; g.strokeStyle = INK; g.stroke(); g.lineWidth = 7; g.strokeStyle = '#1e1a22'; g.stroke(); }
  tube(RH, BB, 9, '#1e1a22'); tube(RH, STp, 8, '#1e1a22'); tube(BB, STp, 11, '#1e1a22'); tube(STp, HT, 11, '#1e1a22'); tube(BB, HB, 12, '#1e1a22'); tube(HT, HB, 14, '#1e1a22'); tube(HB, FH, 9, '#1e1a22');
  tube([HT[0], HT[1]], [HT[0] - 4, BAR[1] + 12], 8, '#c8ccd4'); tube([HT[0] - 4, BAR[1] + 12], BAR, 8, '#c8ccd4'); cel(g, ellP(BAR[0] - 4, BAR[1], 16, 10), '#3a2a22', 2.4, 1, 1, 0);
  g.beginPath(); g.arc(BB[0], BB[1], 40, 0, TAU); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); g.lineWidth = 5; g.strokeStyle = '#a8acb8'; g.stroke(); taper(g, [[BB[0], BB[1] - 40], [RH[0], RH[1] - 18]], 3, '#5a5a64', 0.1); taper(g, [[BB[0], BB[1] + 40], [RH[0], RH[1] + 18]], 3, '#5a5a64', 0.1);
  cel(g, polyPath([[SAD[0] - 50, SAD[1] - 4], [SAD[0] + 40, SAD[1] - 10], [SAD[0] + 48, SAD[1] + 4], [SAD[0] - 46, SAD[1] + 12]]), '#3a2418', 3, 3, 2, 1);
  cel(g, ellP(HT[0] + 30, HT[1] + 10, 22, 26), '#c8a040', 3, 3, 2, 1); g.beginPath(); g.arc(HT[0] + 48, HT[1] + 10, 8, 0, TAU); g.fillStyle = '#fff4c8'; g.fill();
  { const bw = (op.bell || 0) * 4 * Math.sin(t * 3); cel(g, ellP(BAR[0] + 26 + bw, BAR[1] + 8, 12, 9), '#d8dce4', 2.2, 1, 1, 0); }
  // rider: Oddverra figure clipped at the hip, leaning forward to the bars
  { const rc = rc0(), rg = rc.getContext('2d'); rg.setTransform(1, 0, 0, 1, 0, 0); rg.clearRect(0, 0, 600, 1000);
    oddverra(rg, { seed: op.seed || 0, ...RO }, { t, expr: op.riderExpr || 'determined', view: op.riderView || '34R', blink: op.blink || 0, drive: op.hands !== 'up', point: op.hands === 'up' ? 1 : undefined, headTilt: 0, lightDir: op.lightDir });
    const lean = (op.lean ?? 0.16) + sp * 0.04 * Math.sin(t * 0.45); g.save(); g.translate(hip[0], hip[1]); g.rotate(lean); const hy = 640;
    g.save(); g.beginPath(); g.rect(-400, -1000, 800, 1000 - 6); g.clip(); g.drawImage(rc, -300 * K, -hy * K, 600 * K, 1000 * K); g.restore(); g.restore(); }
  leg(ca, false); { const P = pedal(ca); tube(BB, P, 8, '#a8acb8'); cel(g, ellP(P[0], P[1], 18, 7), '#3a3a44', 2, 1, 1, 0); }
  cel(g, ellP(BB[0], BB[1], 12, 12), '#c8ccd4', 2.4, 1, 1, 0);
  if (op.dust && sp > 0.3) { g.globalAlpha = 0.45 * sp; for (let i = 0; i < 5; i++) { const p2 = (t * 0.06 + i / 5) % 1; g.beginPath(); g.ellipse(RH[0] - 60 - p2 * 260, -14 - p2 * 60, 24 + p2 * 50, 14 + p2 * 30, 0, 0, TAU); g.fillStyle = op.dust; g.fill(); } g.globalAlpha = 1; }
  if (sp > 0.6) { g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 5; g.lineCap = 'round'; for (let i = 0; i < 4; i++) { const y = -560 + i * 120, x0 = -420 - ((t * 9 + i * 37) % 60); g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 - 90, y); g.stroke(); } }
  g.restore(); }
