// [CASTRO-story] "The CIA tried to make Castro's beard fall out" timeline (58.6 s, 1758 f @ 30 fps).
// Sets: havana.js (plaza / radio / talks / cigar) and reef.js (beach / underwater / senate / shoes = the 1960s Washington office).
// Wry, no violence: every failed plot ends on a red rubber stamp ('rstamp' fx) or the set's own TOO IMPRACTICAL board; nothing explodes.
import * as S from './story.js';
const { sm, eo, ei, back, lerp, L3, add3, dist, q, person } = S;

// [f0, f1, id, module, set]
const SH = [
  [0, 103, 'hook', 'havana', 'plaza'],        // The CIA once tried to make Fidel Castro's beard fall out.
  [103, 160, 'rally', 'havana', 'plaza'],     // You see, in the 1960s,
  [160, 246, 'ran', 'havana', 'plaza'],       // Castro ran Cuba, just 90 miles from Florida,
  [246, 303, 'wash', 'reef', 'shoes'],        // and Washington wanted him gone.
  [303, 372, 'embar', 'reef', 'shoes'],       // But first, they wanted him embarrassed.
  [372, 401, 'folder', 'reef', 'shoes'],      // The plan?
  [401, 436, 'lab', 'reef', 'shoes'],         // Sneak thallium salts
  [436, 467, 'dust', 'reef', 'shoes'],        // into his shoes.
  [467, 541, 'imagine', 'havana', 'plaza'],   // The chemical would make his famous beard fall out.
  [541, 610, 'nobeard', 'havana', 'plaza'],   // No beard, they figured? No hero.
  [610, 642, 'never1', 'havana', 'plaza'],    // It never happened.
  [642, 685, 'creative', 'reef', 'shoes'],    // So they got creative.
  [685, 783, 'cigars', 'havana', 'cigar'],    // A box of his favorite cigars laced with poison.
  [783, 807, 'never2', 'havana', 'cigar'],    // It never reached him.
  [807, 838, 'radio', 'havana', 'radio'],     // A chemical sprayed
  [838, 873, 'vent', 'havana', 'radio'],      // in his radio studio
  [873, 952, 'ramble', 'havana', 'radio'],    // to make him ramble nonsense on live air.
  [952, 983, 'never3', 'havana', 'radio'],    // Never used.
  [983, 1006, 'beach', 'reef', 'beach'],      // Then they learned he loved
  [1006, 1062, 'dive', 'reef', 'underwater'], // scuba diving. So they planned
  [1062, 1179, 'shell', 'reef', 'underwater'],// a giant, brightly painted seashell rigged to explode.
  [1179, 1212, 'never4', 'reef', 'underwater'], // Too impractical.
  [1212, 1292, 'suit', 'havana', 'talks'],    // Next, a diving suit coated with a skin fungus,
  [1292, 1340, 'hand', 'havana', 'talks'],    // handed to him as a gift.
  [1340, 1395, 'lawyer', 'havana', 'talks'],  // But the American lawyer delivering it
  [1395, 1457, 'clean', 'havana', 'talks'],   // gave Castro a clean suit instead.
  [1457, 1500, 'senate', 'reef', 'senate'],   // Years later, Congress counted
  [1500, 1564, 'chart', 'reef', 'senate'],    // at least eight plots against him.
  [1564, 1616, 'survived', 'havana', 'plaza'],// Castro survived every single one.
  [1616, 1758, 'old', 'reef', 'beach'],       // He died in 2016, at ninety... of old age.
];
export const NF = 1758;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: s[4] === 'plaza' || s[4] === 'beach' ? 'day' : 'office', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {}; // no narrator lip-sync; no dialogue in this one

// ---------- places (world coords from the set modules' local frames) ----------
const at = (o) => (p) => [p[0] + o[0], p[1] + o[1], p[2] + o[2]];
const PZ = at([3200, 0, 0]), RA = at([3200, 0, 200]), TK = at([3200, 0, 300]), CG = at([3200, 0, 400]);
const BE = at([0, 0, 3200]), UW = at([600, 0, 3200]), SE = at([1000, 0, 3200]), SO = at([1400, 0, 3200]);
const BALY = 4.75, POD = PZ([0, BALY + 0.22, -15.0]) /* on a low step so the lectern mics sit below the beard */, BT = 0.76;

export const setAt = (f) => { const s = segAt(f); return [s[3], s[4]]; };

// ---------- cameras ----------
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp });
const V = {
  hook: C(PZ([0.4, 7.15, -9.4]), PZ([0.0, 6.45, -15.0]), 26, 6, PZ([0, 6.3, -15.0])),
  rally: C(PZ([4.0, 3.2, 26]), PZ([0, 6.0, -12]), 50, 1.5, PZ([0, 2, -4])),
  ran: C(PZ([-9.5, 1.5, 9.5]), PZ([-3.0, 1.6, -1.5]), 44, 4, PZ([-5.4, 1.4, 2.8])),
  wash: C(SO([0.7, 1.6, 4.0]), SO([0.15, 1.3, -0.6]), 48, 4, SO([0, 1.4, 0.65])),
  embar: C(SO([-0.3, 1.5, 3.5]), SO([0.2, 1.3, 0.3]), 44, 5, SO([0, 1.45, 0.65])),
  folder: C(SO([0.62, 1.12, 0.52]), SO([0.42, 0.77, 0.06]), 38, 6, SO([0.44, 0.77, 0.1])),
  lab: C(SO([0.45, 1.35, 2.3]), SO([0.1, 1.05, -0.5]), 44, 5, SO([0.15, 1.35, -0.78])),
  dust: C(SO([0.06, 1.02, 0.6]), SO([-0.03, 0.8, 0.04]), 38, 5, SO([-0.02, BT + 0.06, 0.06])),
  imagine: C(PZ([-7.4, 1.75, 6.6]), PZ([-5.5, 1.55, 2.8]), 34, 6, PZ([-5.5, 1.6, 2.8])),
  nobeard: C(PZ([0.4, 7.15, -9.6]), PZ([0.0, 6.6, -15.0]), 22, 6, PZ([0, 6.2, -15.0])),
  nohero: C(PZ([2.6, 7.4, -15.6]), PZ([-1.0, 1.0, 4]), 50, 2.5, PZ([0, 1.2, -2])),
  never1: C(PZ([2.0, 5.8, -7.4]), PZ([0.0, 6.1, -15.0]), 30, 5, PZ([0, 6.2, -15.0])),
  creative: C(SO([-0.9, 1.55, 3.7]), SO([0.25, 1.3, 0.2]), 44, 5, SO([0, 1.45, 0.65])),
  cigars: C(CG([0.03, 1.16, 0.62]), CG([0, 0.83, -0.01]), 40, 8, CG([0, 0.83, 0])),
  never2: C(CG([0.08, 1.24, 0.78]), CG([0.0, 0.94, -0.2]), 38, 5, CG([0, 0.85, -0.05])),
  radio: C(RA([2.2, 1.55, 4.0]), RA([-0.3, 1.25, -1.6]), 50, 3, RA([0, 1.4, -1.5])),
  vent: C(RA([-1.5, 1.85, 1.3]), RA([-3.6, 2.2, -0.75]), 44, 4, RA([-3.9, 2.5, -0.7])),
  ramble: C(RA([0.8, 1.45, 1.6]), RA([0.0, 1.35, -1.5]), 42, 4, RA([0, 1.45, -1.5])),
  never3: C(RA([1.6, 1.5, 3.2]), RA([-0.2, 1.3, -1.5]), 46, 3, RA([0, 1.4, -1.5])),
  beach: C(BE([3.6, 1.6, 7.4]), BE([-0.2, 0.9, -1.0]), 44, 4, BE([0.9, 1.2, 3.0])),
  dive: C(UW([0.6, 2.4, 11]), UW([0, 4.2, -6]), 56, 2, UW([-1.0, 3.0, 2.0])),
  shell: C(UW([1.8, 1.9, 6.5]), UW([-0.2, 1.4, 0]), 46, 4, UW([0, 1, 0])),
  never4: C(UW([1.6, 2.6, 4.6]), UW([-0.2, 1.9, -0.4]), 52, 5, UW([0, 1.5, 0])),
  suit: C(TK([0.9, 1.8, 6.4]), TK([0, 1.25, -0.6]), 50, 3, TK([0, 1.2, 0.3])),
  hand: C(TK([0.3, 1.6, 4.7]), TK([0.0, 1.25, 0.3]), 44, 4, TK([0, 1.4, 0.45])),
  lawyer: C(TK([3.4, 1.55, 2.9]), TK([1.5, 1.4, 0.45]), 40, 6, TK([1.65, 1.5, 0.45])),
  clean: C(TK([0.3, 1.62, 1.0]), TK([0, 0.8, 0.0]), 40, 6, TK([0, 0.85, 0.05])),
  senate: C(SE([0.9, 2.1, 1.2]), SE([0, 2.15, -7]), 26, 4, SE([0, 2.2, -7.0])),
  chart: C(SE([1.3, 1.6, 1.6]), SE([3.2, 1.55, -0.6]), 44, 5, SE([3.2, 1.5, -0.6])),
  survived: C(PZ([2.6, 3.2, 12.0]), PZ([0, 5.6, -14.0]), 23, 3, PZ([0, 6.2, -15])),
  old: C(BE([-3.4, 1.4, 9.8]), BE([-5.2, 1.15, 4.4]), 40, 5, BE([-5.2, 1.3, 4.4])),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]]; return { ...v, p: add3(v.p, d.map((x) => x * k * t)) }; };
const PUSH = { hook: 0.3, rally: 0.05, ran: 0.06, wash: 0.08, embar: 0.1, folder: 0.12, lab: 0.1, dust: 0.12, imagine: 0.12, nobeard: 0.16, nohero: 0.06, never1: 0.1, creative: 0.1,
  cigars: 0.14, never2: 0.08, radio: 0.08, vent: 0.1, ramble: 0.12, never3: 0.08, beach: 0.06, dive: 0.06, shell: 0.12, never4: 0.08, suit: 0.08, hand: 0.1, lawyer: 0.12, clean: 0.14,
  senate: 0.08, chart: 0.1, survived: 0.08, old: 0.14 };
function cam(k, f) {
  const s = segAt(f); let c = push(V[k], PUSH[k] || 0.08, s[0], s[1], f);
  if (k === 'hook') { const t = eo(64, 74, f); c = { ...c, fov: c.fov * (1 - 0.3 * t) }; } // punch-in on "beard"
  if (k === 'never1' || k === 'never3') { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - (k === 'never1' ? 615 : 954)) / 6))) * 0.012; c = { ...c, l: add3(c.l, [0, t, 0]) }; } // stamp kick
  return c;
}
const CUTS = SH.slice(1).map((s) => s[0]);
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[1457, 0.9, 10], [1616, 0.9, 12], [983, 0.45, 6], [1212, 0.5, 8]]) if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state (set animations; main shows the set after worldAt) ----------
export function worldAt(f, w) {
  const s = segAt(f), k = s[2], H = w.havana, R = w.reef;
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  if (H) {
    H.setSpray(k === 'vent' || k === 'ramble' ? (f - 840) / 30 : 0); H.setOnAir(true);
    H.setGift(k === 'clean' ? sm(1398, 1420, f) : 0); H.gift.visible = k !== 'hand';
    H.setCigarGlow(k === 'cigars' ? sm(726, 757, f) : k === 'never2' ? 1 - sm(783, 800, f) * 0.6 : 0);
    H.setFan(f * 0.06);
  }
  if (R) {
    R.setShellGlow(k === 'shell' ? sm(1092, 1112, f) : k === 'never4' ? 0.8 : 0); R.setBoard(k === 'never4' && f >= 1179);
    R.setChart(k === 'chart' ? sm(1506, 1533, f) : k === 'senate' ? 0 : 1);
    R.setDust(k === 'dust' ? sm(438, 462, f) : k === 'lab' ? 0.15 * sm(420, 436, f) : 0);
  }
}

// ---------- actors ----------
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const walk = (f, o, seed, a, b, f0, f1, opts = {}, extra = {}) => person(f, o, seed, L3(a, b, sm(f0, f1, f)), opts, extra);
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
const CASTRO = (f, pos, opts = {}, extra = {}) => person(f, 'CASTRO', 21, pos, opts, extra);
// plaza crowd (1960 Havana only): world-anchored grid in front of the balcony, rows 0..4 x cols 0..7 (havana spots.crowd)
const CUB = (i) => 'CUBA' + (i % 12);
const CROWD = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) CROWD.push([-7.0 + c * 2.0 + (r % 2) * 1.0, -5.5 + r * 2.4]);
function rallyCrowd(f, pick, view, mood) {
  return pick.map((j, i) => { const [x, z] = CROWD[j], up = mood === 'cheer' ? 0.05 * Math.abs(Math.sin(f * 0.33 + i * 1.3)) : 0;
    return P(f, CUB(i), 700 + j, PZ([x + 0.25 * Math.sin(j * 2.3), up, z + 0.3 * Math.cos(j * 1.7)]), mood === 'cheer'
      ? { expr: ['grin', 'laugh', 'excited', 'happy'][i % 4], cheer: i % 3 ? wav(f, i, 0.45) : undefined, wave: i % 3 ? undefined : wav(f, i + 2), view }
      : { expr: ['sad', 'worried', 'bored', 'sad'][i % 4], cheer: 0, view, headTilt: 6 * Math.sin(i * 1.9) }, { blob: true }); });
}

export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') { // the gag: the beard drops out on "fall out" (69..86), snaps back at the ting (87)
    const loss = f < 69 ? 0 : f < 87 ? 0.9 * eo(69, 84, f) : 0;
    A.push(CASTRO(f, POD, { expr: f < 69 ? 'grin' : f < 87 ? 'shock' : 'surprised', beardLoss: loss, wave: f < 60 ? wav(f) : undefined, view: 'front' }));
  }
  if (k === 'rally' || k === 'survived') {
    A.push(CASTRO(f, POD, { expr: 'grin', wave: wav(f), view: 'front' }));
    const pick = k === 'rally' ? [1, 2, 4, 5, 6, 9, 10, 12, 13, 15, 17, 18, 20, 21, 23, 26, 28, 30, 33, 35, 37] : [2, 3, 4, 5, 9, 10, 11, 12, 13, 18, 19, 20, 21, 26, 27];
    A.push(...rallyCrowd(f, pick, 'back', 'cheer'));
  }
  if (k === 'ran') {
    A.push(walk(f, 'CASTRO', 21, PZ([-5.6, 0, 0.6]), PZ([-5.2, 0, 2.6]), 162, 232, { expr: 'grin', wave: f > 236 ? wav(f) : undefined }));
    A.push(P(f, 'CUBA0', 710, PZ([-3.6, 0, 1.0]), { expr: 'excited', wave: wav(f, 1), view: '34L' }));
    A.push(P(f, 'CUBA1', 711, PZ([-2.6, 0, -0.6]), { expr: 'happy', cheer: wav(f, 2), view: '34L' }));
    A.push(P(f, 'CUBA4', 712, PZ([-4.4, 0, 4.2]), { expr: 'grin', wave: wav(f, 3), view: '34L' }));
  }
  if (k === 'wash') {
    A.push(P(f, 'CIA1', 31, SO([-0.15, 0, 0.7]), { expr: 'angry', view: '34R' }));
    A.push(P(f, 'CIA2', 32, SO([0.62, 0, 0.62]), { expr: f < 275 ? 'angry' : 'mean', view: '34L' }));
  }
  if (k === 'embar' || k === 'creative') {
    const idea = k === 'creative' && f >= 660;
    A.push(P(f, 'CIA1', 31, SO([-0.15, 0, 0.7]), { expr: k === 'embar' ? (f < 340 ? 'smile' : 'smug') : idea ? 'excited' : 'worried', view: '34R', wave: idea ? 0.9 : undefined }));
    A.push(P(f, 'CIA2', 32, SO([0.62, 0, 0.62]), { expr: k === 'embar' ? (f < 346 ? 'smug' : 'laugh') : idea ? 'grin' : 'worried', view: '34L' }));
  }
  if (k === 'lab') A.push(P(f, 'CIA_LAB', 33, SO([0.12, 0, -0.78]), { expr: f < 418 ? 'smug' : 'grin', prop: 'spoon', reach: q(0.55 + 0.15 * Math.sin(f * 0.3), 0.05), view: 'front' }));
  if (k === 'imagine') { // "what if": beard falls on "beard fall out" (507..526)
    A.push(CASTRO(f, PZ([-5.5, 0, 2.8]), { expr: f < 507 ? 'smile' : f < 520 ? 'surprised' : 'shock', beardLoss: eo(507, 526, f), view: '34R', look: f > 512 ? 1 : 0 }));
  }
  if (k === 'nobeard') A.push(person(f, 'CASTRO_SHAVED', 22, POD, { expr: f < 560 ? 'nervous' : f < 584 ? 'worried' : 'sad', view: 'front', wave: f < 556 ? wav(f) : undefined, look: f > 590 ? -1 : 0 }));
  if (k === 'nohero') { A.push(person(f, 'CASTRO_SHAVED', 22, POD, { expr: 'nervous', view: 'back' })); A.push(...rallyCrowd(f, [1, 3, 5, 8, 10, 12, 14, 17, 19, 21, 24, 27], 'front', 'bored')); }
  if (k === 'never1') A.push(CASTRO(f, POD, { expr: 'laugh', wave: wav(f), view: '34R' }));
  if (k === 'radio' || k === 'never3') {
    A.push(CASTRO(f, RA([0, 0, -1.5]), { expr: k === 'never3' ? 'grin' : 'smile', wave: wav(f, 0, 0.35), view: '34R' }));
    A.push(P(f, 'ENGINEER', 41, RA([-1.1, 0, -5.05]), { expr: 'smile', view: 'front' }));
  }
  if (k === 'ramble') {
    const dz = f > 900;
    A.push(CASTRO(f, RA([0, 0, -1.5]), { expr: dz ? 'dazed' : 'excited', wave: wav(f, 0, 0.4), cheer: dz && f % 40 < 20 ? 0.6 : undefined, headTilt: dz ? 8 * Math.sin(f * 0.2) : 0, view: '34R' }));
    A.push(P(f, 'ENGINEER', 41, RA([-1.1, 0, -5.05]), { expr: dz ? 'shock' : 'smile', view: 'front' }));
  }
  if (k === 'beach') A.push(person(f, 'CASTRO_DIVER', 23, BE([0.8, 0, 3.1]), { expr: 'excited', mask: 'forehead', wave: wav(f), view: '34L' }));
  if (k === 'dive') A.push(walk(f, 'CASTRO_DIVER', 23, UW([-3.6, 3.6, 1.6]), UW([-0.6, 2.6, 1.4]), 1006, 1062, { expr: 'happy', mask: 'face' }, { roll: -0.35 }));
  if (k === 'shell' || k === 'never4') {
    const sur = k === 'shell' && f >= 1149;
    A.push(person(f, 'CASTRO_DIVER', 23, (k === 'shell' ? UW([1.35, 0.75 + 0.08 * Math.sin(f * 0.08), 2.5]) : UW([1.2, 0.55 + 0.08 * Math.sin(f * 0.08), 2.1])), { expr: k === 'never4' ? 'laugh' : sur ? 'surprised' : 'happy', mask: 'face', view: '34L', wave: k === 'never4' ? wav(f) : undefined }, { roll: 0.12 * Math.sin(f * 0.06) }));
  }
  if (k === 'suit') {
    A.push(P(f, 'DONOVAN', 51, TK([0.95, 0, 0.95]), { expr: f < 1270 ? 'smile' : 'calm', view: '34L' }));
    A.push(CASTRO(f, TK([-0.95, 0, 0.95]), { expr: 'smile', view: '34R' }));
  }
  if (k === 'hand') {
    A.push(walk(f, 'DONOVAN', 51, TK([1.05, 0, 0.6]), TK([0.62, 0, 0.6]), 1292, 1316, { expr: 'smile', prop: 'giftbox', giftCol: '#4aa8a4', ribbonCol: '#c8302c', reach: 0.7, cheer: 0 }));
    A.push(CASTRO(f, TK([-0.62, 0, 0.6]), { expr: f < 1318 ? 'smile' : 'excited', view: '34R', wave: f > 1320 ? 0.8 : undefined }));
  }
  if (k === 'lawyer') A.push(P(f, 'DONOVAN', 51, TK([1.65, 0, 0.45]), { expr: f < 1366 ? 'smile' : 'smug', view: '34R', look: f > 1372 ? 1 : 0 }));
  if (k === 'senate') A.push(P(f, 'SENATOR', 61, SE([0, 0.75, -7.0]), { expr: 'angry', view: 'front', wave: f >= 1472 && f < 1492 ? (f % 12 < 4 ? 0.95 : 0.55) : undefined }));
  if (k === 'old') A.push(person(f, 'CASTRO_OLD_GLASSES', 24, BE([-5.2, 0, 4.4]), { expr: f < 1690 ? 'happy' : 'smile', view: f < 1660 ? '34R' : 'front', wave: f > 1712 ? wav(f, 0, 0.3) : undefined }));
  return A;
}

// ---------- effects ----------
const stamp = (f, f0, lines, pos, size, F2) => { if (f < f0) return; const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos, size: size * (1.6 - 0.6 * t), op: Math.min(1, t * 2), roll: 0.0, blob: false }); if (f < f0 + 12) F2.push({ fx: 'burst', t: (f - f0) / 12, pos: add3(pos, [0, 0, -0.02]), size: size * 1.3, col: '#ffe6c8', rays: 12 }); };
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = [];
  if (k === 'hook' && f >= 87 && f < 99) F2.push({ fx: 'burst', t: (f - 87) / 12, pos: PZ([0, 6.25, -14.6]), size: 1.2, col: '#fff3b0', rays: 10 });
  if (false) F2.push({ fx: 'board', lines: ['CIA', 'vs. THE BEARD'], pos: PZ([0.0, 7.55, -14.4]), size: 0.85 * back(6, 18, f) });
  if (k === 'rally' && f > 124) F2.push({ fx: 'board', lines: ['HAVANA', '1960'], pos: PZ([-3.4, 7.8, -2.0]), size: 3.2 * back(124, 136, f) });
  if (k === 'ran' && f > 200) F2.push({ fx: 'board', lines: ['90 MILES', 'TO FLORIDA'], pos: PZ([-3.0, 3.0, -1.0]), size: 1.7 * back(200, 212, f) });
  if (k === 'wash' && f > 252) F2.push({ fx: 'board', lines: ['WASHINGTON', '1960s'], pos: SO([0.6, 2.2, -0.75]), size: 0.95 * back(252, 264, f) });
  if (k === 'lab' && f > 408) F2.push({ fx: 'board', lines: ['THALLIUM', 'SALTS'], pos: SO([0.5, 1.6, -0.5]), size: 0.5 * back(408, 420, f) });
  if (k === 'imagine') for (let i = 0; i < 6; i++) { const t0 = 507 + i * 3; if (f >= t0 && f < t0 + 30) { const u = (f - t0) / 30; F2.push({ fx: 'puff', t: u, pos: PZ([-5.5 + (i - 2.5) * 0.08, 1.45 - u * 1.2, 2.85]), size: 0.18, tint: '#3a2a26', op: 0.9 * (1 - u) }); } } // tufts drifting down
  if (k === 'nobeard' && f > 584) F2.push({ fx: 'board', lines: ['NO BEARD =', 'NO HERO?'], pos: PZ([0.0, 6.0, -14.3]), size: 0.5 * back(584, 596, f) });
  if (k === 'never1') stamp(f, 615, ['NEVER', 'HAPPENED'], PZ([0.45, 5.35, -12.6]), 1.0, F2);
  if (k === 'creative' && f >= 660 && f < 674) F2.push({ fx: 'burst', t: (f - 660) / 14, pos: SO([-0.15, 2.05, 0.72]), size: 0.45, col: '#fff3b0', rays: 10 });
  if (k === 'creative' && f >= 666) F2.push({ fx: 'stars', t: ((f - 666) / 30) % 1, pos: SO([-0.15, 2.15, 0.7]), size: 0.4 });
  if (k === 'cigars' && f >= 702 && f < 714) F2.push({ fx: 'burst', t: (f - 702) / 12, pos: CG([0.08, 0.9, 0.04]), size: 0.12, col: '#fff3b0', rays: 8 });
  if (k === 'cigars' && f > 740) F2.push({ fx: 'board', lines: ['LACED WITH', 'POISON'], pos: CG([0.0, 0.99, 0.07]), size: 0.095 * back(740, 752, f) });
  if (k === 'never2') stamp(f, 798, ['NEVER', 'REACHED HIM'], CG([0.0, 0.98, -0.12]), 0.24, F2);
  if (k === 'ramble' && f > 900) for (let i = 0; i < 3; i++) { const u = ((f - 900) / 24 + i / 3) % 1; F2.push({ fx: 'note', kind: i % 2, pos: RA([0.25 + Math.sin(u * 6 + i) * 0.25, 2.0 + u * 0.6, -1.3]), size: 0.16, op: 1 - u }); }
  if (k === 'ramble' && f > 914) F2.push({ fx: 'qmark', pos: RA([-0.35, 2.15, -1.35]), size: 0.22 * back(914, 924, f) });
  if (k === 'never3') stamp(f, 954, ['NEVER', 'USED'], RA([-0.6, 1.75, -0.9]), 1.0, F2);
  if (k === 'dive' || k === 'shell') for (let i = 0; i < 3; i++) F2.push({ fx: 'bubbles', t: ((f - 1006) / 50 + i / 3) % 1, seed: i * 7, pos: k === 'dive' ? UW([-3.6 + 3.0 * sm(1006, 1062, f) - 0.3, 3.9 + i * 0.5, 1.5]) : UW([1.25, 2.6 + i * 0.4, 2.5]), size: 0.5, op: 0.9 });
  if (k === 'shell' && f >= 1149 && f < 1163) F2.push({ fx: 'burst', t: (f - 1149) / 14, pos: UW([0, 2.2, 0.3]), size: 1.2, col: '#ffe0f0', rays: 10 });
  if (k === 'shell' && f >= 1151) F2.push({ fx: 'qmark', pos: UW([1.35, 2.75, 2.5]), size: 0.35 * back(1151, 1161, f) });
  if (k === 'never4' && f >= 1179 && f < 1191) F2.push({ fx: 'burst', t: (f - 1179) / 12, pos: UW([-0.4, 3.4, -1.4]), size: 1.6, col: '#fff3b0', rays: 12 });
  if (k === 'suit' && f > 1218) F2.push({ fx: 'board', lines: ['HAVANA', '1963'], pos: TK([0, 2.55, -1.6]), size: 1.0 * back(1218, 1230, f) });
  if (k === 'suit' && f > 1276) for (let i = 0; i < 4; i++) { const u = ((f - 1276) / 20 + i / 4) % 1; F2.push({ fx: 'puff', t: u, pos: TK([(i - 1.5) * 0.12, 0.95 + u * 0.35, 0.1]), size: 0.25 + u * 0.2, tint: '#7ad06a', op: 0.85 * (1 - u) }); }
  if (k === 'hand' && f >= 1320 && f < 1334) F2.push({ fx: 'burst', t: (f - 1320) / 14, pos: TK([0.3, 1.25, 0.65]), size: 0.5, col: '#fff3b0', rays: 10 });
  if (k === 'lawyer' && f > 1350) F2.push({ fx: 'board', lines: ['JAMES', 'DONOVAN'], pos: TK([0.75, 2.2, 0.0]), size: 0.85 * back(1350, 1362, f) });
  if (k === 'clean' && f >= 1428) { F2.push({ fx: 'stars', t: ((f - 1428) / 24) % 1, pos: TK([0.0, 0.98, 0.05]), size: 0.35 }); if (f < 1442) F2.push({ fx: 'burst', t: (f - 1428) / 14, pos: TK([0.02, 0.95, 0.06]), size: 0.4, col: '#ffffff', rays: 10 }); }
  if (k === 'clean' && f > 1432) F2.push({ fx: 'board', lines: ['CLEAN', 'SUIT'], pos: TK([0.2, 1.08, -0.25]), size: 0.28 * back(1432, 1442, f) });
  if (k === 'senate' && f > 1462) F2.push({ fx: 'board', lines: ['U.S. SENATE', '1975'], pos: SE([0, 3.25, -6.4]), size: 0.95 * back(1462, 1474, f) });
  if (k === 'senate') for (const c of [1476, 1488]) if (f >= c && f < c + 8) F2.push({ fx: 'burst', t: (f - c) / 8, pos: SE([0.45, 1.25, -6.6]), size: 0.5, col: '#ffffff', rays: 8 });
  if (k === 'survived' && f > 1580) F2.push({ fx: 'board', lines: ['CASTRO 8', 'CIA 0'], pos: PZ([1.6, 7.9, -13.2]), size: 1.25 * back(1580, 1592, f) });
  if (k === 'survived') for (const c of [1564, 1584, 1600]) if (f >= c && f < c + 10) F2.push({ fx: 'burst', t: (f - c) / 10, pos: PZ([-1.6 + (c % 7) * 0.5, 6.4, -12.0]), size: 0.9, col: '#ffffff', rays: 8 });
  if (k === 'old' && f > 1642 && f < 1698) F2.push({ fx: 'board', lines: ['FIDEL CASTRO', '1926 – 2016'], pos: BE([-4.95, 2.45, 4.0]), size: 0.92 * back(1642, 1654, f) });
  if (k === 'old' && f >= 1698) F2.push({ fx: 'board', lines: ['CAUSE:', 'OLD AGE'], pos: BE([-5.2, 2.45, 4.0]), size: 1.0 * back(1698, 1710, f) });
  return F2;
}
