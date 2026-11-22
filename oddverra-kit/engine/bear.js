// [TEDDY-cast] Oddverra black bear (the 1902 Mississippi bear). drawBear(g, o, op) draws on a 600x1000 card in the same space as
// oddverra(): ground at y≈965, centred on x=300. Same ink / cel / rim helpers as oddverra_next.js (imported), bean eyes with the
// ringed-planet shine (with a pale lid ring so they read on black fur), blush.
// o:  { seed, fur, furHi, muzzle }  (all optional)
// op: { pose: 'sit' (front, sitting up) | 'stand' (side, on all fours) | 'walk' (side, op.phase 0..1),
//       expr: 'neutral' | 'worried' | 'relieved' | 'surprised' | 'happy', blink 0..1, look -1..1, t (frames),
//       flip (bool: stand/walk face screen-left), rope (bool: loose rope loop round the middle),
//       ropeTo [dx, dy] (card px from the bear's card origin (300, 965) to where the rope's free end goes, e.g. a tree; null = short loose end),
//       paws: 'chest' | 'down' (sit; default chest when worried), lightDir/keyCol/rimCol/ambient (as oddverra), x (card x offset), scale }
import { OVK, ovLight, INK } from './oddverra_next.js';
const { cel, line, taper, smooth, ellP, limb, arcPts, mixc, lt, rgba, polyPath } = OVK;
const TAU = Math.PI * 2;

function rope(g, pts, w = 1) { // twisted rope along pts (polyline, smoothed by caller)
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const path = () => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); };
  path(); g.lineWidth = 13 * w; g.strokeStyle = INK; g.stroke(); path(); g.lineWidth = 8.5 * w; g.strokeStyle = '#c8a466'; g.stroke();
  path(); g.setLineDash([4 * w, 6 * w]); g.lineWidth = 3.2 * w; g.strokeStyle = '#8a6a3a'; g.stroke(); g.setLineDash([]);
  g.translate(-1.5, -2); path(); g.lineWidth = 2 * w; g.strokeStyle = 'rgba(255,240,200,0.5)'; g.stroke(); g.restore();
}
const quad = (a, c, b, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; });

function beanEye(g, x, y, k, E, blink, look, s) { // k = scale; E expression
  const closed = blink >= 1 || E === 'relieved' || E === 'happy';
  if (closed) { // relieved: soft closed arcs (lids down); happy: ^ ^
    if (E === 'happy') taper(g, [[x - 11 * k, y + 4 * k], [x, y - 7 * k], [x + 11 * k, y + 4 * k]], 4.6 * k, '#f4ecf8', 0.35);
    else { taper(g, [[x - 12 * k, y - 1 * k], [x, y + 6 * k], [x + 12 * k, y - 1 * k]], 4.8 * k, '#f4ecf8', 0.35); }
    return; }
  const sur = E === 'surprised', rx = (sur ? 11 : 9) * k, ry = (sur ? 15 : 12.5) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 3.5 * k;
  const P = ellP(lx, y, rx, ry); g.lineWidth = 4.2 * k; g.strokeStyle = 'rgba(236,226,250,0.95)'; g.stroke(P); g.fillStyle = INK; g.fill(P);
  g.save(); g.clip(P); g.beginPath(); g.arc(lx - 2.6 * k, y - 4.6 * k, (sur ? 3.4 : 2.8) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
  g.save(); g.translate(lx - 2.6 * k, y - 4.6 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 5.8 * k, 1.7 * k, 0, 0, TAU); g.lineWidth = 1.1 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  g.save(); g.clip(P); g.beginPath(); g.arc(lx + 3 * k, y + 5 * k, (sur ? 2 : 1.3) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.fillStyle = 'rgba(120,100,200,0.45)'; g.beginPath(); g.ellipse(lx + 1 * k, y + ry * 0.7, rx * 0.8, ry * 0.35, 0, 0, TAU); g.fill(); g.restore();
  if (E === 'worried') { const fur = '#2c2532'; g.save(); g.clip(ellP(lx, y, rx + 3, ry + 3)); g.fillStyle = fur; g.beginPath(); g.moveTo(lx - s * (rx + 4), y - ry * 0.85); g.quadraticCurveTo(lx, y - ry * 0.75, lx + s * (rx + 4), y - ry * 0.2); g.lineTo(lx + s * (rx + 4), y - ry - 6); g.lineTo(lx - s * (rx + 4), y - ry - 6); g.fill(); g.restore();
    taper(g, [[lx - s * (rx + 2), y - ry * 0.85], [lx, y - ry * 0.7], [lx + s * (rx + 3), y - ry * 0.2]], 2.4 * k, 'rgba(236,226,250,0.9)', 0.35); }
}
// brows: pale tan tufts (black bears' brow spots), shaped by expression. s = side (-1 left, +1 right; inner end toward the face centre)
function brow(g, x, y, k, E, s) { const c = '#c8a882';
  const B = { worried: [-12, -4, 6], surprised: [-6, -12, -8], relieved: [2, -3, 2], happy: [0, -6, 0], neutral: [2, -2, 2] }[E] || [2, -2, 2];
  taper(g, [[x - s * 11 * k, y + B[0] * k], [x + s * 1 * k, y + B[1] * k], [x + s * 12 * k, y + B[2] * k]], 6.5 * k, c, 0.35); }
function mouth(g, x, y, k, E) { // y = just under the nose
  if (E === 'surprised') { const p = ellP(x, y + 16 * k, 7 * k, 9 * k); g.fillStyle = '#5a1e30'; g.fill(p); g.lineWidth = 2.4 * k; g.strokeStyle = INK; g.stroke(p); return; }
  if (E === 'happy') { const p = new Path2D(); p.moveTo(x - 14 * k, y + 7 * k); p.quadraticCurveTo(x, y + 12 * k, x + 14 * k, y + 7 * k); p.quadraticCurveTo(x + 10 * k, y + 26 * k, x, y + 27 * k); p.quadraticCurveTo(x - 10 * k, y + 26 * k, x - 14 * k, y + 7 * k); g.fillStyle = '#5a1e30'; g.fill(p);
    g.save(); g.clip(p); g.fillStyle = '#e07080'; g.beginPath(); g.ellipse(x, y + 26 * k, 8 * k, 6 * k, 0, 0, TAU); g.fill(); g.restore(); g.lineWidth = 2.4 * k; g.strokeStyle = INK; g.stroke(p); return; }
  taper(g, [[x, y], [x, y + 8 * k]], 2.6 * k, INK, 0.4);
  if (E === 'worried') taper(g, [[x - 14 * k, y + 16 * k], [x - 7 * k, y + 11 * k], [x, y + 14 * k], [x + 7 * k, y + 11 * k], [x + 14 * k, y + 16 * k]], 3 * k, INK, 0.3);
  else if (E === 'relieved') { taper(g, arcPts(x - 7 * k, y + 6 * k, 7 * k, 0.3, Math.PI - 0.3, 6), 3 * k, INK, 0.3); taper(g, arcPts(x + 7 * k, y + 6 * k, 7 * k, 0.3, Math.PI - 0.3, 6), 3 * k, INK, 0.3); }
  else { taper(g, arcPts(x - 7 * k, y + 5 * k, 7 * k, 0.4, Math.PI - 0.2, 6), 3 * k, INK, 0.3); taper(g, arcPts(x + 7 * k, y + 5 * k, 7 * k, 0.2, Math.PI - 0.4, 6), 3 * k, INK, 0.3); }
}
function sweat(g, x, y, k = 1) { g.beginPath(); g.moveTo(x, y - 14 * k); g.quadraticCurveTo(x + 10 * k, y + 4 * k, x, y + 8 * k); g.quadraticCurveTo(x - 10 * k, y + 4 * k, x, y - 14 * k); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(x - 2.5 * k, y + 1 * k, 2 * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); }
function sigh(g, x, y, t) { const d = (t * 0.6) % 30; g.save(); g.globalAlpha = 0.85; for (const [dx, dy, r] of [[0, 0, 11], [16, -6, 14], [34, -2, 10]]) cel(g, ellP(x + dx + d * 0.6, y + dy - d * 0.2, r, r * 0.8), '#f2eefa', 2, 2, 2, 0); g.restore(); }
function pop(g, x, y) { for (const a of [-2.2, -1.6, -1.0]) taper(g, [[x + Math.cos(a) * 16, y + Math.sin(a) * 16], [x + Math.cos(a) * 34, y + Math.sin(a) * 34]], 3.2, INK, 0.3); }

export function drawBear(g, o = {}, op = {}) {
  const pose = op.pose || 'sit', E = op.expr || 'neutral', flip = !!op.flip && pose !== 'sit', t = op.t || 0, blink = op.blink || 0, look = op.look || 0;
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const fur = o.fur || '#2c2532', furHi = o.furHi || '#4c4058', mz = o.muzzle || '#b8916a', pad = '#5e4c58', earIn = '#7a5a5e', sc = op.scale || 1;
  const furTex = (h) => { h.save(); h.strokeStyle = 'rgba(150,130,190,0.16)'; h.lineWidth = 2; h.beginPath(); for (let i = 0; i < 160; i++) { const x = ((i * 73.1) % 760) - 380, y = -((i * 41.7) % 520); h.moveTo(x, y); h.lineTo(x + 4, y + 9); } h.stroke(); h.restore(); };
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale((flip ? -1 : 1) * sc, sc);
  g.save(); g.scale(1, 0.18); g.beginPath(); g.ellipse(pose === 'sit' ? 0 : 60, 0, pose === 'sit' ? 170 : 250, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  const ropeTo = op.ropeTo ? [op.ropeTo[0] / sc * (flip ? -1 : 1), op.ropeTo[1] / sc] : null;
  if (pose === 'sit') {
    const breathe = Math.sin(t * 0.12) * 2, paws = op.paws || (E === 'worried' ? 'chest' : 'down');
    const body = smooth([[0, -330 + breathe], [72, -318], [112, -255], [136, -150], [132, -55], [84, -10], [0, -2], [-84, -10], [-132, -55], [-136, -150], [-112, -255], [-72, -318]], 8);
    cel(g, body, fur, 3.8, 22, 10, 7, furTex);
    cel(g, smooth([[0, -270], [44, -250], [58, -170], [40, -90], [0, -76], [-40, -90], [-58, -170], [-44, -250]], 6), mixc(fur, furHi, 0.28), 0, 6, 4, 0, furTex); // chest / belly sheen
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) taper(g, [[s * (100 - k * 8), -250 + k * 50], [s * (110 - k * 8), -232 + k * 50]], 2.2, furHi, 0.2); // fur tufts at the flanks
    for (const s of [-1, 1]) { cel(g, ellP(s * 76, -70, 66, 58, s * 0.2), fur, 3.4, 12, 8, 5, furTex); taper(g, arcPts(s * 76, -70, 44, s > 0 ? -2.4 : -0.7, s > 0 ? -1.6 : 0.1, 6), 2, furHi, 0.2); }
    for (const s of [-1, 1]) { const fx = s * 84, fy = -26; cel(g, ellP(fx, fy, 40, 30, s * 0.15), fur, 3.2, 8, 6, 4); cel(g, ellP(fx, fy + 6, 22, 15), pad, 2, 3, 2, 0); for (let k = 0; k < 4; k++) cel(g, ellP(fx + (k - 1.5) * 13, fy - 16 - Math.abs(k - 1.5) * -3, 6.5, 5.5), pad, 1.6, 1, 1, 0); }
    if (op.rope) { const yL = -178, front = quad([-136, yL - 6], [0, yL + 64], [136, yL - 14], 20); rope(g, front);
      const kx = 116, ky = yL + 8; cel(g, ellP(kx, ky, 14, 11), '#c8a466', 3, 3, 2, 0); line(g, [[kx - 6, ky - 2], [kx + 6, ky + 3]], 1.6, '#8a6a3a');
      if (ropeTo) rope(g, quad([kx, ky], [(kx + ropeTo[0]) * 0.5, Math.max(ky, ropeTo[1]) + 70], ropeTo, 24)); else rope(g, quad([kx, ky], [kx + 40, ky + 50], [kx + 26, ky + 110], 12)); }
    for (const s of [-1, 1]) { const S = [s * 90, -280], Pw = paws === 'chest' ? [s * 34, -228] : [s * 44, -36], El = paws === 'chest' ? [s * 120, -196] : [s * 112, -160];
      cel(g, limb([S, El, Pw], [40, 32, 26]), fur, 3.4, 10, 6, 5, furTex); taper(g, [[El[0] - s * 8, El[1] - 20], [El[0] + s * 4, El[1] + 10]], 2, furHi, 0.2);
      cel(g, ellP(Pw[0], Pw[1], 29, 21, s * 0.2), fur, 3, 5, 4, 3); for (let k = -1; k <= 1; k++) taper(g, [[Pw[0] + k * 9, Pw[1] + (paws === 'chest' ? -16 : 14)], [Pw[0] + k * 10, Pw[1] + (paws === 'chest' ? -24 : 22)]], 3, '#e8e0d0', 0.4); }
    // head
    const hy = -398 + breathe * 0.6, tilt = (E === 'worried' ? -0.06 : E === 'relieved' ? 0.08 : 0) + Math.sin(t * 0.05) * 0.02; g.save(); g.translate(0, hy); g.rotate(tilt); g.scale(1.2, 1.2);
    for (const s of [-1, 1]) { const ex = s * 70, ey = E === 'surprised' ? -72 : E === 'worried' ? -58 : -64; cel(g, ellP(ex, ey, 31, 30), fur, 3.2, 6, 5, 4); cel(g, ellP(ex + s * 2, ey + 3, 16, 15), earIn, 0, 3, 3, 0); }
    const head = smooth([[0, -86], [56, -80], [90, -48], [100, -4], [92, 34], [60, 62], [0, 74], [-60, 62], [-92, 34], [-100, -4], [-90, -48], [-56, -80]], 8);
    cel(g, head, fur, 3.8, 16, 9, 7, furTex); for (const s of [-1, 1]) { taper(g, [[s * 96, 10], [s * 112, 22], [s * 94, 32]], 4, fur, 0.3); taper(g, [[s * 88, 34], [s * 102, 46], [s * 80, 52]], 4, fur, 0.3); } // cheek ruff
    taper(g, [[-50, -70], [-20, -82], [14, -80]], 5, rgba(lt(furHi, 0.2), 0.6), 0.2); // sheen
    cel(g, ellP(0, 30, 48, 36), mz, 2.6, 6, 5, 2); cel(g, ellP(0, 6, 17, 12), '#1a141e', 2, 2, 2, 0); g.beginPath(); g.ellipse(-5, 2, 5, 3, -0.3, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.75)'; g.fill();
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 56, 32, 14, 8, 0, 0, TAU); g.fillStyle = E === 'relieved' || E === 'happy' ? 'rgba(240,100,130,0.6)' : 'rgba(240,100,130,0.45)'; g.fill(); }
    for (const s of [-1, 1]) { beanEye(g, s * 36, -18, 1, E, blink, look, s); brow(g, s * 38, -46 - (E === 'surprised' ? 6 : 0), 1, E, s); }
    mouth(g, 0, 18, 1, E);
    if (E === 'worried') sweat(g, 92, -54); if (E === 'relieved') sigh(g, 54, 44, t); if (E === 'surprised') pop(g, 0, -96);
    g.restore();
  } else { // side: all fours, facing +x
    g.translate(-80, 0); const walk = pose === 'walk', ph = op.phase || 0, bob = walk ? Math.abs(Math.sin(TAU * ph)) * 6 : Math.sin(t * 0.1) * 1.5;
    const legs = [[-128, 0.5, true], [104, 0, true], [-150, 0, false], [128, 0.5, false]]; // [hip x, phase offset, far]
    const leg = ([x, po, far]) => { const p = ph + po, sw = walk ? Math.sin(TAU * p) * 32 : 0, lift = walk ? Math.max(0, Math.cos(TAU * p)) * 16 : 0, top = [x, -190 + bob], kn = [x + sw * 0.4 + (x > 0 ? 6 : -10), -96 - lift * 0.5], pw = [x + sw, -18 - lift];
      cel(g, limb([top, kn, pw], [48, 36, 31]), far ? mixc(fur, '#3c2e6e', 0.16) : fur, 3.4, 8, 6, 4, furTex); cel(g, ellP(pw[0] + 12, pw[1] + 2, 34, 17), far ? mixc(fur, '#3c2e6e', 0.16) : fur, 3, 5, 4, 2); for (let k = 0; k < 3; k++) taper(g, [[pw[0] + 30 + k * 6, pw[1] + 8], [pw[0] + 38 + k * 6, pw[1] + 16]], 2.6, '#e8e0d0', 0.4); };
    legs.filter((l) => l[2]).forEach(leg);
    cel(g, ellP(-196, -224 + bob, 18, 15), fur, 3, 4, 3, 2); // tail
    const body = smooth([[-196, -168 + bob], [-176, -248 + bob], [-104, -292 + bob], [20, -300 + bob], [96, -322 + bob], [150, -292 + bob], [176, -222 + bob], [160, -150 + bob], [100, -122 + bob], [0, -118 + bob], [-120, -122 + bob], [-184, -140 + bob]], 8);
    cel(g, body, fur, 3.8, 26, 10, 7, furTex); for (let k = 0; k < 5; k++) taper(g, [[-140 + k * 60, -150 + bob], [-128 + k * 60, -132 + bob]], 2.2, furHi, 0.2);
    taper(g, [[-120, -282 + bob], [0, -296 + bob], [90, -316 + bob]], 5, rgba(lt(furHi, 0.2), 0.55), 0.2);
    legs.filter((l) => !l[2]).forEach(leg);
    if (op.rope) { const lp = quad([30, -300 + bob], [62, -200 + bob], [44, -112 + bob], 16); rope(g, lp); const kx = 30, ky = -300 + bob; cel(g, ellP(kx, ky, 14, 11), '#c8a466', 3, 3, 2, 0);
      if (ropeTo) rope(g, quad([kx, ky], [(kx + ropeTo[0] + 70) * 0.5, Math.max(ky, ropeTo[1]) + 60], [ropeTo[0] + 70, ropeTo[1]], 24)); else rope(g, quad([kx, ky], [kx - 40, ky + 20], [kx - 60, ky + 80], 12)); }
    // head (snout to +x)
    const nod = walk ? Math.sin(TAU * 2 * ph) * 4 : 0; g.save(); g.translate(0, bob + nod); g.translate(160, -250); g.scale(1.16, 1.16); g.translate(-160, 250);
    cel(g, ellP(188, -322, 26, 25), fur, 3.2, 5, 4, 3); cel(g, ellP(192, -318, 13, 13), earIn, 0, 3, 3, 0);
    const head = smooth([[150, -316], [206, -338], [250, -318], [284, -288], [322, -272], [342, -254], [336, -234], [296, -222], [252, -206], [196, -204], [156, -232], [144, -282]], 8);
    cel(g, head, fur, 3.8, 14, 8, 6, furTex); taper(g, [[160, -300], [182, -320], [214, -330]], 4.5, rgba(lt(furHi, 0.2), 0.55), 0.2);
    cel(g, smooth([[284, -280], [322, -272], [344, -256], [338, -234], [298, -226], [276, -244]], 6), mz, 2.4, 4, 3, 2);
    cel(g, ellP(340, -260, 11, 9), '#1a141e', 2, 2, 2, 0); g.beginPath(); g.ellipse(337, -263, 3.6, 2.4, -0.3, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.75)'; g.fill();
    g.beginPath(); g.ellipse(270, -244, 12, 7, 0, 0, TAU); g.fillStyle = E === 'relieved' || E === 'happy' ? 'rgba(240,100,130,0.6)' : 'rgba(240,100,130,0.45)'; g.fill();
    beanEye(g, 258, -286, 0.92, E, blink, look * 0.5 + 0.3, 1); brow(g, 254, -312 - (E === 'surprised' ? 5 : 0), 0.9, E, 1);
    if (E === 'surprised') { const p = ellP(316, -226, 7, 8); g.fillStyle = '#5a1e30'; g.fill(p); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke(p); pop(g, 230, -346); }
    else if (E === 'worried') { taper(g, [[334, -238], [320, -232], [308, -236], [296, -230]], 2.8, INK, 0.3); sweat(g, 222, -350); }
    else if (E === 'happy') { const p = new Path2D(); p.moveTo(334, -238); p.quadraticCurveTo(312, -226, 290, -236); p.quadraticCurveTo(300, -212, 318, -216); p.closePath(); g.fillStyle = '#5a1e30'; g.fill(p); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke(p); }
    else { taper(g, [[334, -238], [314, -230], [294, -238]], 2.8, INK, 0.3); if (E === 'relieved') sigh(g, 350, -232, t); }
    g.restore();
  }
  g.restore();
}
