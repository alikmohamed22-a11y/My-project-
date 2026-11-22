// [VC-cast] "Velcro was invented because burrs kept sticking to a dog": outfit table (merged into ODD by main.js), props (into
// oddverra's HOLD), two drawn cards and a cast lineup (?vccast=N).
//   VCDOG : George's hunting dog (a red-and-white pointer type; the breed is only shown, never named): drawVCDog on the 600x1000 card,
//           side view facing +x (op.flip faces left). op.pose 'stand'|'walk'|'sit'|'sniff'|'shake'|'jump', op.expr 'happy'|'smile'|'sad'|
//           'shock'|'smug'|'love'|'dazed'|'sleepy', op.burrs 0..18 (burrs stuck in the coat), op.tail wag speed, op.t frame.
//   BURRY : a living burdock burr, the sidekick (spiky ball whose every spine ends in a tiny hook): drawBurry. op.expr like BONGO's,
//           op.pose 'stand'|'wave'|'cheer'|'grab'|'point'|'shrug'|'hold' (arms out holding a loop), op.spin.
// George de Mestral is our own stylization (Norfolk hunting jacket, tweed cap); the weaver, models, critics and astronaut are invented
// generic designs. No logos or brand marks anywhere: VELCRO appears only as the word itself.
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, line, ellP, limb, arcPts, polyPath } = OVK;
const TAU = Math.PI * 2;

export const VC_ODD = {
  VC_GEORGE: { hunt: true, shirt: '#6a7a52', pants: '#5a5040', pattern: 'tweed', belt: '#4a3a28', hat: 'cap', hatCol: '#6a5a44', plainCap: true, neck: 'tie', neckCol: '#8a3a2a', collar: '#efe8d6',
    boots: 'leggings', leggCol: '#7a5a3a', shoes: '#3a2618', hair: 'side', hairCol: '#4a3020', brow: '#3a2418', build: 'thin', head: 'egg', skin: '#f2c8a4', nose: 'round', button: '#3a2a1e', cuff: '#6a7a52' },   // George de Mestral, outdoors
  VC_GEORGEIN: { shirt: '#f2eee2', pants: '#4a4a52', collar: '#f6f3ea', cuff: '#f2eee2', neck: 'tie', neckCol: '#8a3a2a', cardigan: true, vest: '#7a6a4a', hair: 'side', hairCol: '#4a3020', brow: '#3a2418',
    build: 'thin', head: 'egg', skin: '#f2c8a4', nose: 'round', shoes: '#2a2020', noButtons: true },                                     // George at home / at the mill (cardigan, sleeves)
  VC_WEAVER: { shirt: '#5a7ab0', rolled: true, apron: '#8a6a4a', pants: '#3a3a46', hat: 'beret', hatCol: '#2a2a3a', hair: 'short', hairCol: '#2a1e18', brow: '#2a1e18', moustache: '#2a1e18', stache: 'bushy',
    build: 'stout', head: 'wide', skin: '#e8b48a', shoes: '#2a2020', noButtons: true },                                                  // a Lyon weaver
  VC_MODEL: { lashes: true, dress: true, shirt: '#e05a7a', pants: '#e05a7a', collar: '#fff0f4', cuff: '#fff0f4', hair: 'bun', hairCol: '#2a1a14', brow: '#2a1a14', head: 'egg', skin: '#f4cdb0', shoes: '#2a1a24', earring: true, build: 'thin' },
  VC_CRITIC: { coat: true, shirt: '#3a3048', pants: '#3a3048', collar: '#f4f1e8', cuff: '#3a3048', neck: 'bow', neckCol: '#c83a5a', hair: 'side', hairCol: '#8a8a90', brow: '#6a6a70', moustache: '#8a8a90', glasses: 'pincenez',
    build: 'thin', head: 'tall', skin: '#f2c4a8', shoes: '#1a1618' },                                                                   // a snooty fashion critic
  VC_CRITIC2: { lashes: true, dress: true, shirt: '#2a2a3a', pants: '#2a2a3a', collar: '#f4eee0', hat: 'ladyhat', hatCol: '#c8a8d8', hair: 'bun', hairCol: '#5a3a2a', brow: '#4a2a1a', glasses: 'horn',
    head: 'round', skin: '#e8b898', shoes: '#2a1a24', earring: true, build: 'stout' },
  VC_ASTRO: { astro: true, hat: 'helmet', shirt: '#f4f4f0', pants: '#f4f4f0', collar: '#f4f4f0', cuff: '#c8ccd6', belt: '#b8bcc8', boots: true, shoes: '#e8e8e4', hair: 'short', hairCol: '#7a5a3a', brow: '#6a4a2a',
    build: 'adult', head: 'round', skin: '#e8b48a', noButtons: true },                                                                  // an Apollo-era astronaut (generic)
  VC_KID: { shirt: '#f0c840', pants: '#3a5a8a', hair: 'curly', hairCol: '#3a2214', build: 'kid', head: 'round', skin: '#c88a62', shoes: '#e8e8f0', noButtons: true },                                // payoff: a kid with a velcro shoe
};
const VC_OPS = ['strip', 'stripCol'];
export const vcOpts = (op) => { const r = {}; for (const k of VC_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- shared little drawings
const BURRC = '#9a7a3a', BURRD = '#3a2814', BURRL = '#d8b070';
// one small burr at (x, y), radius r: spiky ball, spines end in hooks
function burrDot(g, x, y, r, seed = 0) {
  g.save(); g.translate(x, y); const n = 14;
  for (let i = 0; i < n; i++) { const a = i / n * TAU + seed, c = Math.cos(a), s = Math.sin(a), r1 = r * 1.55;
    g.beginPath(); g.moveTo(c * r * 0.6, s * r * 0.6); g.lineTo(c * r1, s * r1); g.lineWidth = Math.max(1.2, r * 0.18); g.strokeStyle = BURRD; g.lineCap = 'round'; g.stroke();
    g.beginPath(); g.arc(c * r1 - s * r * 0.16, s * r1 + c * r * 0.16, r * 0.16, a - Math.PI / 2, a + Math.PI * 0.6); g.lineWidth = Math.max(1, r * 0.13); g.stroke(); }
  cel(g, ellP(0, 0, r, r * 0.92), BURRC, Math.max(1.6, r * 0.14), r * 0.3, r * 0.25, 0);
  g.fillStyle = 'rgba(255,230,170,0.5)'; g.beginPath(); g.ellipse(-r * 0.3, -r * 0.35, r * 0.28, r * 0.16, -0.5, 0, TAU); g.fill();
  g.fillStyle = 'rgba(150,90,170,0.55)'; g.beginPath(); g.ellipse(r * 0.05, -r * 0.7, r * 0.3, r * 0.18, 0, 0, TAU); g.fill(); // the purple burdock tuft
  g.restore(); }
// a short hook-and-loop strip (pair) held in the hand: hook side grey-blue with tiny hooks, loop side soft and fuzzy
function stripDraw(g, w, h, col, kind) {
  const p = new Path2D(); p.roundRect(-w / 2, -h / 2, w, h, h * 0.25); cel(g, p, col, 3, 4, 3, 1);
  g.save(); g.clip(p);
  if (kind === 'hook') { g.strokeStyle = 'rgba(30,30,60,0.6)'; g.lineWidth = 1.6; for (let x = -w / 2 + 5; x < w / 2; x += 7) for (let y = -h / 2 + 5; y < h / 2; y += 7) { g.beginPath(); g.arc(x, y, 2.2, Math.PI, Math.PI * 2.2); g.stroke(); } }
  else { g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 1.4; for (let x = -w / 2 + 3; x < w / 2; x += 5) for (let y = -h / 2 + 4; y < h / 2; y += 6) { g.beginPath(); g.arc(x + ((y | 0) % 3), y, 2.6, 0, TAU); g.stroke(); } }
  g.restore(); }

// ---------- props (hand-local: hand at 0,0, up = -y)
const VC_HOLD = {
  burr: (g) => { const s = OVH.HSIDE; burrDot(g, s * 8, -24, 16, 0.3); },
  burrpinch: (g) => { const s = OVH.HSIDE; line(g, [[0, 0], [s * 18, -40]], 7, INK); line(g, [[0, 0], [s * 18, -40]], 3.5, '#c8ccd6'); burrDot(g, s * 22, -50, 13, 1.1); }, // tweezers + burr
  strip: (g, op = {}) => { const s = OVH.HSIDE; g.save(); g.translate(s * 10, -40); g.rotate(-s * 0.25); stripDraw(g, 34, 110, op.stripCol || '#7a8ab0', 'hook'); g.restore(); },
  loops: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 10, -40); g.rotate(-s * 0.25); stripDraw(g, 34, 110, '#e8c8a0', 'loop'); g.restore(); },
  spool: (g, op = {}) => { const s = OVH.HSIDE; g.save(); g.translate(s * 6, -34); const c = op.spoolCol || '#f2f2f6'; const b = new Path2D(); b.roundRect(-26, -40, 52, 80, 6); cel(g, b, '#8a6a4a', 3, 4, 3, 1);
    const t = new Path2D(); t.roundRect(-20, -32, 40, 64, 4); cel(g, t, c, 2, 3, 2, 0); g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 1.5; for (let y = -28; y < 30; y += 5) { g.beginPath(); g.moveTo(-20, y); g.lineTo(20, y + 2); g.stroke(); } g.restore(); },
  scissors: (g, op = {}) => { const s = OVH.HSIDE, k = 0.22 * Math.abs(Math.sin((op.t || 0) * 0.6)); g.save(); g.translate(s * 4, -10); g.scale(s, 1);
    for (const d of [-1, 1]) { g.save(); g.rotate(d * k - 0.9); line(g, [[0, 0], [0, -86]], 9, INK); line(g, [[0, 0], [0, -86]], 5, '#d8dce6'); cel(g, ellP(-d * 10, 16, 12, 9), '#c83a3a', 2.4, 2, 1, 0); g.restore(); } g.restore(); },
  shoe: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 10, -30); g.scale(s, 1); const sp = new Path2D(); sp.moveTo(-40, 0); sp.lineTo(-40, -36); sp.quadraticCurveTo(-30, -48, 0, -46); sp.quadraticCurveTo(40, -40, 54, -14); sp.lineTo(56, 0); sp.closePath(); cel(g, sp, '#3a8ad8', 3, 5, 4, 2);
    for (const y of [-34, -20]) { const st = new Path2D(); st.roundRect(-14, y - 5, 44, 10, 3); cel(g, st, '#f2f2f6', 2, 1, 1, 0); } g.fillStyle = '#f2f2f6'; g.fillRect(-42, -6, 100, 6); g.restore(); },
};
Object.assign(OVH.HOLD, VC_HOLD);

// ---------- face bits (shared by the dog and Burry)
const bean = (g, x, y, k, E, blink, look, lidCol) => {
  if (blink >= 1 || E === 'happy' || E === 'laugh') { taper(g, [[x - 12 * k, y + 5 * k], [x, y - 8 * k], [x + 12 * k, y + 5 * k]], 5 * k, INK, 0.35); return; }
  if (E === 'sleepy') { taper(g, [[x - 12 * k, y], [x, y + 6 * k], [x + 12 * k, y]], 5 * k, INK, 0.35); return; }
  if (E === 'dazed') { g.beginPath(); for (let i = 0; i < 24; i++) { const a = i * 0.55, r = 1.2 * k + i * 0.5 * k; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.lineWidth = 2.8 * k; g.strokeStyle = INK; g.stroke(); return; }
  if (E === 'love') { const r = 14 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(hp); return; }
  const sh = E === 'shock', rx = (sh ? 11 : 8.5) * k, ry = (sh ? 16 : 12.5) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k, P = ellP(lx, y, rx, ry);
  g.fillStyle = INK; g.fill(P); g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 5 * k, (sh ? 3.8 : 3.1) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
  g.save(); g.translate(lx - 3 * k, y - 5 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.2 * k, 1.8 * k, 0, 0, TAU); g.lineWidth = 1.1 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  const lid = { smug: 0.45, sly: 0.5, sad: 0.25, proud: 0.45, worried: 0.2 }[E]; if (lid && blink < 0.5) { const yl = y - ry + 2 * ry * lid; g.save(); g.clip(ellP(lx, y, rx + 3, ry + 3)); g.fillStyle = lidCol; g.fillRect(lx - rx - 6, y - ry - 8, 2 * rx + 12, yl - (y - ry - 8)); g.restore(); taper(g, [[lx - rx - 2, yl], [lx + rx + 2, yl]], 3 * k, INK, 0.3); } };
const sweat = (g, sx, sy, k = 1) => { g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + 12 * k, sy + 22 * k, sx, sy + 28 * k); g.quadraticCurveTo(sx - 12 * k, sy + 22 * k, sx, sy); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke(); };

// ---------- the dog (local frame: x forward, y up negative, ground 0)
const DOGC = { coat: '#a8502c', dark: '#6a2a18', far: '#8a3e24', white: '#f4ece0', nose: '#2a1a1e', tongue: '#f07a8a', ear: '#7a321c' };
// burr anchor spots on the coat (body, chest, legs, ears, tail), in pose-independent body coords (dog stand pose)
export const BURR_SPOTS = [[-40, -282, 13], [40, -300, 12], [-110, -250, 12], [96, -238, 13], [10, -220, 11], [-150, -300, 11], [150, -270, 12], [-60, -200, 10], [70, -315, 10],
  [-130, -140, 10], [128, -130, 10], ['ear', 0.5, 12], ['tail', 0.6, 11], [-20, -330, 10], ['ear', 0.85, 10], [118, -330, 11], ['tail', 0.3, 10], [-90, -320, 11]];
export function drawVCDog(g, o = {}, op = {}) {
  const t = op.t || 0, E = op.expr || 'happy', pose = op.pose || 'stand', flip = !!op.flip, blink = op.blink || 0, look = op.look || 0, nb = Math.max(0, Math.min(BURR_SPOTS.length, Math.round(op.burrs || 0)));
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const C = DOGC, sit = pose === 'sit', walk = pose === 'walk', sniff = pose === 'sniff', shake = pose === 'shake', jump = pose === 'jump';
  const ph = (t * (op.speed || 0.22)) % TAU, wagS = op.wag ?? (E === 'sad' || E === 'shock' ? 0.15 : 1), wag = Math.sin(t * 0.9) * 0.35 * wagS;
  const shk = shake ? Math.sin(t * 2.6) : 0, hop = jump ? -60 * Math.abs(Math.sin(Math.min(1, ((t % 24) / 24)) * Math.PI)) : walk ? -6 * Math.abs(Math.sin(ph)) : 0;
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale(flip ? -1 : 1, 1);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 230 - (jump ? 40 : 0), 50, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  g.translate(0, hop);
  if (shake) g.rotate(0.05 * shk);
  // legs: shoulder / hip anchors, jointed (front: elbow, wrist; hind: stifle, hock), stride
  const SHO = [112, -262], HIP = sit ? [-60, -120] : [-112, -262];
  const leg = (A, k, far, front) => { const sw = walk ? Math.sin(ph + k) * 30 : jump ? (front ? -36 : 36) : 0, lift = walk ? Math.max(0, Math.sin(ph + k + Math.PI / 2)) * 26 : 0;
    let pts, rs; if (front) { pts = [A, [A[0] - 8 + sw * 0.3, -160], [A[0] + 2 + sw * 0.8, -58 - lift * 0.8], [A[0] + 10 + sw, -18 - lift]]; rs = [36, 19, 15, 15]; }
    else if (sit) { pts = [[A[0] + 20, A[1] - 30], [A[0] + 90, -70], [A[0] + 10, -30], [A[0] + 60, -16]]; rs = [58, 30, 17, 15]; }
    else { pts = [A, [A[0] + 26 + sw * 0.3, -168 - lift * 0.3], [A[0] - 22 + sw * 0.7, -88 - lift * 0.6], [A[0] - 8 + sw, -18 - lift]]; rs = [50, 25, 16, 15]; }
    const col = far ? C.far : C.coat; cel(g, limb(pts, rs), col, 3.2, 6, 5, 2);
    const pw = pts[3]; cel(g, ellP(pw[0] + 12, pw[1] + 2, 25, 13), far ? '#d8ccc0' : C.white, 2.8, 4, 3, 1); return pts; };
  // far legs
  leg([SHO[0] - 22, SHO[1]], Math.PI, true, true); leg([HIP[0] + 22, HIP[1]], 0, true, false);
  // tail (behind body): thin, tapering, carried level and wagging
  const tb = sit ? [-120, -140] : [-178, -300], ta = (sit ? -2.4 : -0.35) + wag * (shake ? 2 : 1), tailPts = [tb, [tb[0] + Math.cos(Math.PI + ta) * 70, tb[1] + Math.sin(Math.PI + ta) * 70 - 8], [tb[0] + Math.cos(Math.PI + ta * 1.25) * 140, tb[1] + Math.sin(Math.PI + ta * 1.25) * 140 - 14]];
  cel(g, limb(tailPts, [15, 10, 4]), C.coat, 3, 4, 3, 1);
  // body: deep chest in front, tucked waist, rounded rump
  const B = new Path2D(); if (sit) { B.moveTo(150, -330); B.bezierCurveTo(175, -250, 140, -170, 80, -140); B.bezierCurveTo(10, -40, -150, -30, -150, -110); B.bezierCurveTo(-150, -200, -40, -270, 60, -350); B.closePath(); }
  else { B.moveTo(165, -335); B.bezierCurveTo(190, -270, 170, -205, 100, -190); B.bezierCurveTo(30, -180, -20, -232, -90, -232); B.bezierCurveTo(-160, -232, -205, -255, -195, -300); B.bezierCurveTo(-185, -340, -120, -345, -40, -338); B.bezierCurveTo(40, -345, 120, -350, 165, -335); B.closePath(); }
  cel(g, B, C.coat, 4, 14, 10, 5, (h) => { h.fillStyle = C.white; h.beginPath(); h.ellipse(sit ? 125 : 150, sit ? -250 : -255, 34, 66, 0.25, 0, TAU); h.fill();
    h.fillStyle = 'rgba(255,220,180,0.22)'; h.beginPath(); h.ellipse(-20, -334, 130, 10, 0, 0, TAU); h.fill(); h.fillStyle = C.dark; h.globalAlpha = 0.35; for (const [x, y, rx, ry] of [[-70, -300, 34, 22], [30, -315, 22, 14], [-140, -290, 20, 16]]) { h.beginPath(); h.ellipse(x, y, rx, ry, 0.2, 0, TAU); h.fill(); } h.globalAlpha = 1; });
  // near legs
  leg(SHO, 0, false, true); leg(HIP, Math.PI, false, false);
  // head + neck
  const hx = sniff ? 230 : 190 + (jump ? 10 : 0), hy = sniff ? -170 : sit ? -420 : -390, hr = (sniff ? 0.5 : -0.08) + 0.06 * shk + (E === 'sad' ? 0.15 : 0);
  cel(g, limb([[110, sit ? -300 : -305], [hx - 26, hy + 24]], [62, 46]), C.coat, 3.6, 8, 6, 3);
  g.save(); g.translate(hx, hy); g.rotate(hr);
  const ear = (far) => { const sw = 0.25 * shk + (walk ? 0.08 * Math.sin(ph * 2) : 0) + (E === 'shock' ? -0.5 : 0) + (jump ? -0.6 : 0); g.save(); g.translate(far ? 10 : -26, -36); g.rotate(sw + (far ? -0.15 : 0));
    const P = new Path2D(); P.moveTo(-16, 0); P.bezierCurveTo(-52, 30, -50, 130, -12, 150); P.bezierCurveTo(26, 156, 36, 70, 26, 0); P.closePath(); cel(g, P, far ? C.dark : C.ear, 3, 5, 4, 2); g.restore(); };
  ear(true);
  const HD = new Path2D(); HD.moveTo(-56, -6); HD.bezierCurveTo(-60, -84, 34, -96, 62, -46); HD.bezierCurveTo(84, -30, 124, -30, 136, -4); HD.bezierCurveTo(144, 24, 112, 44, 72, 42); HD.bezierCurveTo(20, 50, -54, 46, -56, -6); HD.closePath();
  cel(g, HD, C.coat, 4, 9, 7, 3, (h) => { h.fillStyle = C.white; h.beginPath(); h.moveTo(64, -40); h.quadraticCurveTo(100, -32, 138, -6); h.quadraticCurveTo(130, 40, 76, 44); h.quadraticCurveTo(56, 10, 64, -40); h.closePath(); h.fill(); h.fillStyle = C.dark; h.globalAlpha = 0.3; h.beginPath(); h.ellipse(-10, -40, 40, 30, 0, 0, TAU); h.fill(); h.globalAlpha = 1; });
  cel(g, ellP(134, -6, 16, 12), C.nose, 2.4, 2, 2, 0); g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(124, -6, 5, 3, 0, 0, TAU); g.fill();
  // mouth
  const op2 = E === 'happy' || E === 'love' || (walk && E !== 'sad' && E !== 'smug');
  if (E === 'shock' || E === 'dazed') { const p = ellP(96, 28, 10, 13); g.fillStyle = '#7a2238'; g.fill(p); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(p); }
  else if (op2) { const p = new Path2D(); p.moveTo(70, 18); p.bezierCurveTo(90, 24, 112, 22, 122, 14); p.bezierCurveTo(118, 46, 80, 50, 70, 18); g.fillStyle = '#7a2238'; g.fill(p); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(p);
    const tg = new Path2D(); tg.moveTo(86, 34); tg.bezierCurveTo(84, 66 + 4 * Math.sin(t * 0.7), 112, 66 + 4 * Math.sin(t * 0.7), 108, 32); cel(g, tg, C.tongue, 2.4, 2, 2, 0); }
  else if (E === 'sad') taper(g, arcPts(100, 36, 16, Math.PI * 1.2, Math.PI * 1.8, 8), 4.2, INK, 0.3);
  else if (E === 'smug') taper(g, [[76, 18], [98, 26], [118, 12]], 4.2, INK, 0.3);
  else taper(g, arcPts(100, 6, 18, Math.PI * 0.2, Math.PI * 0.8, 10), 4.2, INK, 0.3);
  bean(g, 40, -28, 1.25, E, blink, look, C.coat);
  const BR = { happy: [-6, -10], smile: [-2, -6], sad: [6, -14], shock: [-14, -18], smug: [4, 2], love: [-6, -10], dazed: [-8, -12], sleepy: [2, 0] }[E] || [-2, -6];
  taper(g, [[22, -58 + BR[0]], [40, -62 + BR[1] * 0.5], [58, -56 + BR[1]]], 6, INK, 0.35);
  g.beginPath(); g.ellipse(64, 10, 15, 8, 0, 0, TAU); g.fillStyle = 'rgba(255,120,150,0.6)'; g.fill();
  if (E === 'shock' || E === 'sad') sweat(g, -20, -70);
  ear(false);
  g.restore();
  // burrs (drawn last, on top of the coat)
  for (let i = 0; i < nb; i++) { const sp = BURR_SPOTS[i]; let x, y; const r = sp[2];
    if (sp[0] === 'ear') { const a = hr; x = hx - 30 + Math.cos(a) * 0 - Math.sin(a) * (sp[1] * 110 - 36); y = hy + Math.cos(a) * (sp[1] * 110 - 36) - 30; }
    else if (sp[0] === 'tail') { const k = sp[1], a = Math.floor(k * 2), u = k * 2 - a; x = tailPts[a][0] + (tailPts[a + 1][0] - tailPts[a][0]) * u; y = tailPts[a][1] + (tailPts[a + 1][1] - tailPts[a][1]) * u; }
    else { x = sp[0]; y = sp[1] * (sit ? 0.9 : 1) + (sit && sp[0] < -60 ? 60 : 0); if (!sit && y > -200 && Math.abs(x) > 100) { x = x > 0 ? SHO[0] + 10 : HIP[0] - 10; } }
    burrDot(g, x, y, r * 1.45, i * 0.7); }
  if (shake) { g.lineCap = 'round'; g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 6; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(0, -280, 240 + i * 26, s > 0 ? -0.4 + i * 0.05 : Math.PI - 0.4, s > 0 ? 0.3 : Math.PI + 0.3); g.stroke(); } }
  g.restore(); }

// ---------- BURRY (the living burr)
export function drawBurry(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, blink = op.blink || 0, look = op.look || 0, pose = op.pose || 'stand';
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const hopA = pose === 'cheer' ? Math.abs(Math.sin(t * 0.35)) * 40 : 0, bob = Math.sin(t * 0.2) * 5 - hopA, R = 170, cy = -330 + bob;
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale(flip ? -1 : 1, 1);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 150, 50, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  for (const s of [-1, 1]) { cel(g, limb([[s * 50, cy + R - 30], [s * 58, -24]], [14, 12]), '#5a4a30', 2.6, 3, 2, 1); cel(g, ellP(s * 66, -14, 36, 16), '#3a2e22', 2.6, 4, 3, 2); }
  // spines with hooks, rotating slowly
  const spin = (op.spin || 0) + Math.sin(t * 0.1) * 0.05, n = 26;
  for (let i = 0; i < n; i++) { const a = i / n * TAU + spin, c = Math.cos(a), s = Math.sin(a), r0 = R * 0.8, r1 = R * 1.36 + 8 * Math.sin(i * 1.7), wob = Math.sin(t * 0.3 + i) * 0.03;
    const tip = [c * r1, cy + s * r1], hk = [tip[0] + Math.cos(a + Math.PI / 2 + wob) * 18, tip[1] + Math.sin(a + Math.PI / 2 + wob) * 18];
    line(g, [[c * r0, cy + s * r0], tip], 11, INK); line(g, [[c * r0, cy + s * r0], tip], 6, BURRL);
    g.beginPath(); g.arc((tip[0] + hk[0]) / 2, (tip[1] + hk[1]) / 2, 10, a - Math.PI * 0.1, a + Math.PI * 1.05); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); g.lineWidth = 4.5; g.strokeStyle = BURRL; g.stroke(); }
  const body = ellP(0, cy, R, R * 0.94);
  cel(g, body, '#9a7238', 5, 18, 12, 6, (h) => { for (let i = 0; i < 40; i++) { const a = i * 2.39996, r = R * Math.sqrt((i + 0.5) / 40) * 0.95; h.fillStyle = i % 2 ? 'rgba(90,60,30,0.35)' : 'rgba(255,220,160,0.25)'; h.beginPath(); h.arc(Math.cos(a) * r, cy + Math.sin(a) * r, 7, 0, TAU); h.fill(); } });
  // purple burdock tuft on top
  for (let i = -3; i <= 3; i++) taper(g, [[i * 12, cy - R * 0.86], [i * 18, cy - R * 1.12 - (3 - Math.abs(i)) * 8]], 12, '#a85ac0', 0.4);
  const ex = 52, ey = cy - 18, k = 1.5;
  for (const s of [-1, 1]) bean(g, s * ex + look * 6, ey, k, E, blink, look, '#9a7238');
  const BRW = { smile: [2, -3, 2], happy: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -14, -8], sad: [-10, -2, 8], sly: [8, 2, 0], smug: [8, 2, 0], love: [0, -6, 0], angry: [-10, 4, 12], worried: [-8, -10, 6], dazed: [-6, -8, -2] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = ey - 44; taper(g, [[s * (ex - 20), by + BRW[0]], [s * ex, by + BRW[1]], [s * (ex + 20), by + BRW[2]]], 7, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 32), ey + 38, 18, 10, 0, 0, TAU); g.fillStyle = 'rgba(255,120,150,0.7)'; g.fill(); }
  const my = ey + 60, MC = '#7a2238';
  if (E === 'shock' || E === 'dazed') { const p = ellP(0, my + 4, 12, 16); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad' || E === 'angry' || E === 'worried') taper(g, arcPts(0, my + 16, 16, Math.PI * 1.2, Math.PI * 1.8, 8), 4.6, INK, 0.3);
  else if (E === 'happy' || E === 'love') { const p = new Path2D(); p.moveTo(-24, my - 4); p.bezierCurveTo(-8, my, 8, my, 24, my - 4); p.bezierCurveTo(18, my + 22, -18, my + 22, -24, my - 4); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'proud' || E === 'sly' || E === 'smug') taper(g, [[-18, my], [4, my + 7], [22, my - 8]], 4.6, INK, 0.3);
  else taper(g, arcPts(0, my - 10, 20, Math.PI * 0.2, Math.PI * 0.8, 10), 4.6, INK, 0.3);
  if (E === 'shock' || E === 'worried') sweat(g, R * 0.7, cy - R * 0.5, 1.2);
  // stubby arms with hook hands
  for (const s of [-1, 1]) { const S = [s * R * 0.92, cy + 20]; let E3, Hd;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 16 : Math.sin(t * 0.4 + s) * 6; E3 = [S[0] + s * 46, S[1] - 50]; Hd = [S[0] + s * 52 + w, S[1] - 112]; }
    else if (pose === 'grab' || pose === 'hold') { E3 = [S[0] + s * 50, S[1] - 6]; Hd = [S[0] + s * 96, S[1] - 26]; }
    else if (pose === 'shrug') { E3 = [S[0] + s * 50, S[1] + 22]; Hd = [S[0] + s * 92, S[1] - 18]; }
    else if (pose === 'point' && s > 0) { E3 = [S[0] + 58, S[1] - 12]; Hd = [S[0] + 114, S[1] - 44]; }
    else { E3 = [S[0] + s * 26, S[1] + 56]; Hd = [S[0] + s * 30, S[1] + 104]; }
    cel(g, limb([S, E3, Hd], [13, 12, 11]), '#6a5230', 2.6, 4, 3, 2);
    g.beginPath(); g.arc(Hd[0] + s * 6, Hd[1] - 6, 16, Math.PI * (s > 0 ? 0.9 : -0.1), Math.PI * (s > 0 ? 2.4 : 1.4)); g.lineWidth = 12; g.strokeStyle = INK; g.stroke(); g.lineWidth = 6; g.strokeStyle = BURRL; g.stroke(); }
  if (pose === 'hold') { g.beginPath(); g.ellipse(0, cy + 30, R * 1.1, 34, 0, 0, TAU); g.lineWidth = 12; g.strokeStyle = INK; g.stroke(); g.lineWidth = 7; g.strokeStyle = '#f2e6d0'; g.stroke(); }
  g.restore(); }

// ---------- lineup (?vccast=N)
const KT = [
  { d: 7.0, a: [['VC_GEORGE', { expr: 'smile', prop: 'stick' }], ['VC_GEORGEIN', { expr: 'thoughtful', prop: 'burrpinch' }], ['VC_WEAVER', { expr: 'determined', prop: 'scissors' }], ['VC_MODEL', { expr: 'smile' }], ['VC_CRITIC', { expr: 'smug' }], ['VC_ASTRO', { expr: 'happy' }]] },
  { d: 5.4, a: [['VCDOG', { expr: 'happy', pose: 'stand', burrs: 0 }], ['VCDOG', { expr: 'sad', pose: 'sit', burrs: 18 }], ['VCDOG', { expr: 'happy', pose: 'walk', burrs: 6 }]] },
  { d: 5.0, a: [['BURRY', { expr: 'happy', pose: 'wave' }], ['BURRY', { expr: 'shock', pose: 'grab' }], ['BURRY', { expr: 'smug', pose: 'hold' }], ['VCDOG', { expr: 'shock', pose: 'shake', burrs: 10 }], ['VC_KID', { expr: 'laugh', prop: 'shoe' }], ['VC_CRITIC2', { expr: 'mean' }]] },
];
export function vcTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'VCDOG' ? 0.62 : o === 'BURRY' ? 0.32 : o === 'VC_KID' ? 0.8 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
