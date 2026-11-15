// [RV-story] "Paul Revere never shouted 'The British are coming!'" timeline (58.3 s voice, 1749 f @ 30 fps).
// Sets: rv_sets.js (town / river / road / study / park) through setAt. Pattern: story_pringles.js (slow push per shot, zoom-through
// whips on cuts, screen-pinned boards / stamps / bubbles, punch-ins on beats). LANTY (a living tin lantern) is the sidekick and the
// motif: the hook, the "shh", the two steeple lanterns, the farmer's lantern, the poet's lamp, and the overlooked marker at the end.
// Riders are RVRIDE cards (galloping horse + Oddverra rider); facing comes from the travel direction projected on the camera's right.
import * as S from './story.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]                                         narration (word frames from work/words_frames.txt)
const SH = [
  [0, 170, 'hook', 'townNight'],     // Paul Revere never shouted, "The British are coming!" In fact, he never even made it to Concord.  (never 21, shouted 31, British 55, coming 72, fact 91, never 112, Concord 136)
  [170, 247, 'date', 'townNight'],   // April 18th, 1775,  (April 170, 1775 198)
  [247, 372, 'troops', 'townNight'], // British troops are about to march out of Boston to seize the colonists' weapons.  (march 278, Boston 296, seize 312, weapons 344)
  [372, 510, 'job', 'townNight'],    // Revere's job? Warn the countryside. But quietly, the ride was meant to be secret,  (job 381, warn 400, countryside 408, quietly 436, secret 491)
  [510, 600, 'brit', 'townNight'],   // and most colonists still considered themselves British.  (colonists 521, considered 544, British 569)
  [600, 700, 'door', 'roadNight'],   // So, he reportedly warned, "The Regulars are coming out."  (reportedly 613, warned 627, Regulars 650, coming 669, out 675)
  [700, 798, 'lantA', 'townNight'],  // Even the two lanterns in the Old North Church weren't for Revere.  (two 711, lanterns 718, Old 738, Church 752, weren't 762, Revere 780)
  [798, 897, 'lantB', 'riverNight'], // They signaled patriots across the river, in Charlestown.  (signaled 804, patriots 814, river 848, Charlestown 865)
  [897, 993, 'dawes', 'roadNight'],  // And he wasn't alone. William Dawes rode out by another route,  (alone 911, William 921, Dawes 938, another 968, route 976)
  [993, 1069, 'pres', 'roadNight'],  // and Samuel Prescott joined them on the road.  (Samuel 995, Prescott 1005, joined 1016, road 1041)
  [1069, 1195, 'patrol', 'roadNight'], // Then, near Lincoln, a British patrol caught them. Revere was captured.  (Lincoln 1083, British 1105, patrol 1113, caught 1126, Revere 1153, captured 1165)
  [1195, 1267, 'escape', 'roadNight'], // Prescott escaped and reached Concord.  (Prescott 1195, escaped 1201, reached 1227, Concord 1233)
  [1267, 1419, 'poem', 'study'],     // You see, Revere became famous mostly because of a poem. In 1861,  (see 1269, famous 1302, mostly 1317, poem 1349, 1861 1376)
  [1419, 1511, 'page', 'study'],     // Longfellow's "Paul Revere's Ride" got a lot wrong.  (Longfellow 1419, Paul 1434, Ride 1457, wrong 1487)
  [1511, 1599, 'wrong', 'study'],    // No Dawes, no Prescott, no capture.  (Dawes 1516, Prescott 1539, capture 1566)
  [1599, 1749, 'payoff', 'park'],    // The rider who actually made it? Almost nobody remembers his name.  (rider 1602, actually 1615, made 1627, it 1636, nobody 1661, remembers 1676, name 1694)
];
export const NF = 1749;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'night', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.explain;
export const TALKER = {};
export const setAt = (f) => ['rv', segAt(f)[3]];

// ---------- places (set-local -> world)
const O = { town: [-112000, 0, 0], river: [-112000, 0, 800], road: [-112000, 0, 1600], study: [-114500, 0, 0], park: [-114500, 0, 800] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const TWa = at(O.town), RVa = at(O.river), RDa = at(O.road), SDa = at(O.study), PKa = at(O.park);
const TW = (x, z, h = 0) => TWa(x, h, z), RV = (x, z, h = 0) => RVa(x, h, z), RD = (x, z, h = 0) => RDa(x, h, z), SD = (x, z, h = 0) => SDa(x, h, z), PK = (x, z, h = 0) => PKa(x, h, z);
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// ---------- rider tracks (road x as a function of frame; constant speeds keep the gallop planted and smooth)
const VR = 0.14;                                                       // m / frame at full gallop (4.2 m/s), stride 1.87 m
const dawesX = (f) => -36 + VR * (f - 897);                           // passes the BOSTON NECK fingerpost (-24) around f 983
const revP = (f) => -7.5 + VR * (f - 993);                            // 'pres': Revere -7.5 -> 3.1
const dawX2 = (f) => -9.3 + VR * (f - 993);                           // Dawes alongside
const presX = (f) => revP(f) - 3.4 + 5.0 * sm(993, 1055, f);          // catches up from behind, then rides level
const revStop = (f) => 9.4 + 4.6 * eo(1069, 1116, f);                 // patrol: Revere rides in and pulls up at x = 14
const presEsc = (f) => 33 + 0.21 * (f - 1195);                       // escape: x 33 -> 48 (Concord)

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(TWa(1.0, 1.15, 4.6), TWa(0.0, 1.75, -1.5), 46, 1.4, TWa(0.0, 1.5, -1.4)),
  date: C(TWa(0.4, 13, 12), TWa(0.0, 9, -34), 44, 0.8, TWa(0, 8, -20)),
  troops: C(TWa(1.7, 1.0, 0.5), TWa(-0.3, 1.5, -9), 44, 1.2, TWa(0, 1.2, -7)),
  job: C(TWa(1.2, 1.35, 2.6), TWa(-0.3, 1.3, -2.4), 44, 1.6, TWa(-0.1, 1.2, -2.2)),
  brit: C(TWa(1.8, 1.6, -1.4), TWa(-2.5, 1.9, -7.9), 44, 1.5, TWa(-2.5, 1.6, -7.7)),
  door: C(RDa(-3.5, 1.45, 3.4), RDa(-5.6, 1.45, -3.0), 44, 1.6, RDa(-5.4, 1.3, -2.8)),
  lantA: C(TWa(0.9, 10.8, -24.5), TWa(0.0, 12.6, -34.5), 42, 1.4, TWa(0, 12.6, -33.3)),
  lantB: C(RVa(2.2, 1.9, 9.0), RVa(-5.5, 5.0, -50), 40, 1.0, RVa(-0.2, 1.3, 1.6)),
  study: C(SDa(0.9, 1.65, 2.5), SDa(0.0, 1.15, -1.8), 44, 1.4, SDa(0, 1.0, -1.6)),
  page: C(SDa(0.05, 1.42, -0.62), SDa(-0.05, 0.8, -1.38), 40, 3.0, SDa(-0.05, 0.8, -1.38)),
  payoff: C(PKa(0.6, 1.5, 7.2), PKa(0.0, 3.4, -2.5), 46, 1.0, PKa(0, 3, -2.5)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.08, date: 0, troops: 0.08, job: 0.1, brit: 0.1, door: 0.1, lantA: 0.12, lantB: 0.08, poem: 0.1, page: 0.1, wrong: 0.06, payoff: 0 };
// tracking camera beside the road (z = +7) following x
const track = (x, y = 1.5, z = 8.4, lx = 0.1, fov = 42) => C(RDa(x - 0.3, y, z), RDa(x + lx, 1.2, 0), fov, 1.2, RDa(x, 1.0, 0));
function cam(k, f) {
  const s = segAt(f); let c;
  if (k === 'dawes') c = track(dawesX(f) + 0.15);
  else if (k === 'pres') c = track(revP(f) + 0.4, 1.6, 9.0, 0.3, 46);
  else if (k === 'patrol') { const x = 11.4 + 3.2 * sm(1069, 1118, f); c = C(RDa(x - 0.3, 1.65, 9.3), RDa(x + 0.2, 1.3, 0), 48, 1.2, RDa(x, 1.0, 0)); }
  else if (k === 'escape') { const u = sm(1215, 1255, f), x = presEsc(f); const a0 = C(RDa(x - 1.0, 1.6, 8.0), RDa(x + 1.2, 1.3, -1), 44, 1.0, RDa(x + 0.5, 1.0, 0)), a1 = C(RDa(43.2, 2.0, 9.0), RDa(48.0, 3.2, -5), 46, 1.0, RDa(46.5, 1.5, 0)); c = { p: lerp3(a0.p, a1.p, u), l: lerp3(a0.l, a1.l, u), fp: lerp3(a0.fp, a1.fp, u), fov: 44 + 2 * u, cInf: 1.0 }; }
  else if (k === 'poem') c = V.study;
  else if (k === 'wrong') c = { ...V.page, p: add3(V.page.p, [0.0, 0.06, 0.12]) };
  else c = V[k] || V.hook;
  c = push(c, PUSH[k] ?? 0.0, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const look = (d, f0, f1, fd) => { const t = sm(f0, f1, f); c = { ...c, l: add3(c.l, d.map((x) => x * t)), fp: add3(c.fp, (fd || d).map((x) => x * t)) }; };
  const orbit = (a, f0, f1) => { const t = sm(f0, f1, f) - 0.5, an = a * t, dx = c.p[0] - c.l[0], dz = c.p[2] - c.l[2]; c = { ...c, p: [c.l[0] + dx * Math.cos(an) - dz * Math.sin(an), c.p[1], c.l[2] + dx * Math.sin(an) + dz * Math.cos(an)] }; };
  if (k === 'hook') { orbit(0.2, 0, 170); punch(31, 37, 0.06); punch(72, 78, 0.1); kick(72, 0.04); punch(136, 142, 0.1); shake(137, 150, 0.015); }
  if (k === 'date') { const t = sm(170, 247, f); c = { ...c, p: lerp3(TWa(0.4, 13, 12), TWa(0.2, 10.5, 2), t) }; punch(198, 204, 0.05); }
  if (k === 'troops') { orbit(-0.18, 247, 372); punch(278, 284, 0.05); punch(312, 318, 0.08); punch(344, 350, 0.1); kick(344, 0.03); }
  if (k === 'job') { orbit(0.2, 372, 510); punch(400, 406, 0.06); punch(436, 442, 0.08); punch(491, 497, 0.12); kick(491, 0.03); }
  if (k === 'brit') { punch(521, 527, 0.05); punch(569, 575, 0.12); kick(569, 0.04); }
  if (k === 'door') { orbit(0.16, 600, 700); punch(613, 619, 0.05); punch(650, 656, 0.12); kick(650, 0.03); }
  if (k === 'lantA') { punch(711, 717, 0.08); punch(738, 744, 0.05); punch(780, 786, 0.1); kick(780, 0.04); }
  if (k === 'lantB') { punch(814, 820, 0.04); punch(865, 871, 0.1); }
  if (k === 'dawes') { punch(921, 927, 0.06); punch(968, 974, 0.06); }
  if (k === 'pres') { punch(1005, 1011, 0.08); kick(1005, 0.03); }
  if (k === 'patrol') { punch(1083, 1089, 0.05); punch(1113, 1119, 0.12); shake(1114, 1130, 0.02); punch(1165, 1171, 0.12); kick(1165, 0.04); }
  if (k === 'escape') { punch(1201, 1207, 0.06); punch(1233, 1239, 0.06); }
  if (k === 'poem') { orbit(0.22, 1267, 1419); punch(1302, 1308, 0.05); punch(1349, 1355, 0.08); punch(1376, 1382, 0.08); }
  if (k === 'page') { punch(1434, 1440, 0.05); punch(1487, 1493, 0.12); shake(1488, 1500, 0.01); }
  if (k === 'wrong') { punch(1516, 1522, 0.06); punch(1539, 1545, 0.06); punch(1566, 1572, 0.08); kick(1566, 0.02); }
  if (k === 'payoff') { const t = sm(1640, 1705, f); c = { ...c, p: lerp3(PKa(0.6, 1.5, 7.2), PKa(3.3, 0.75, 1.6), t), l: lerp3(PKa(0.0, 3.4, -2.5), PKa(2.3, 0.35, -0.6), t), fp: lerp3(PKa(0, 3, -2.5), PKa(2.25, 0.25, -0.55), t), fov: 46 - 6 * t, cInf: 1.0 + 1.6 * t };
    c = push(c, 0.06 * (1 - t), 1599, 1640, f); punch(1694, 1700, 0.06); }
  return c;
}
const HARD = new Set([1511]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g) && g !== 993);
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[72, 0.3, 6], [136, 0.25, 6], [170, 0.6, 12], [247, 0.4, 10], [344, 0.25, 6], [372, 0.4, 10], [491, 0.25, 6], [510, 0.4, 10], [569, 0.25, 6], [600, 0.5, 10], [650, 0.25, 6], [700, 0.5, 10], [711, 0.35, 8], [780, 0.25, 6], [798, 0.5, 10], [865, 0.3, 6], [897, 0.5, 10], [1069, 0.4, 10], [1113, 0.3, 6], [1165, 0.4, 8], [1195, 0.4, 10], [1233, 0.3, 6], [1267, 0.85, 14], [1419, 0.4, 10], [1487, 0.3, 6], [1511, 0.35, 8], [1599, 0.8, 14], [1694, 0.3, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'night' };
}

// ---------- world state
export function worldAt(f, w) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const N = w.rv; if (!N) return;
  N.set({ lanterns: k === 'lantA' ? 0.3 * sm(708, 716, f) + 0.7 * sm(716, 726, f) : 0, lanterns2: k === 'lantB' ? 1 : 0, bell: k === 'escape' ? sm(1228, 1240, f) : 0, write: k === 'poem' ? 1 - sm(1395, 1418, f) : 0 });
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const LT = (f, pos, opts = {}, extra = {}) => person(f, 'LANTY', 9, pos, { t: f, ...opts }, { s: 0.5, blob: false, ...extra });
// camera right vector at frame f (for facing): flip = the travel direction points to screen left
const camRight = (f) => { const c = cam(segAt(f)[2], f), fw = [c.l[0] - c.p[0], c.l[2] - c.p[2]], L = Math.hypot(...fw); return [-fw[1] / L, fw[0] / L]; };
const faceFlip = (f, dx, dz = 0) => dx * camRight(f)[0] + dz * camRight(f)[1] < 0;
const RIDE = (f, seed, pos, opts = {}, s = 1.45) => ({ o: 'RVRIDE', k: 2, pos, roll: 0, s, blob: false, opts: { seed, t: f, ph: f * 0.075 + seed * 0.31, speed: 1, dust: 'rgba(150,140,175,1)', ...opts } });
// a moving rider: facing from the travel direction vs the camera; gallop amount from the track's own pace
const rider = (f, seed, xf, z, o, extra = {}) => { const x = xf(f), v = (xf(f + 1) - xf(f - 1)) / 2; return RIDE(f, seed, RD(x, z), { rider: o, flip: faceFlip(f, Math.abs(v) < 1e-4 ? 1 : v), speed: clamp(Math.abs(v) / VR, 0, 1), ...extra }); };
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') { A.push(RIDE(f, 1, TW(0, -1.6), { rider: 'RV_REVERE', speed: 0, flip: faceFlip(f, 1, 0.3), riderExpr: f < 55 ? 'determined' : f < 88 ? 'shock' : f < 136 ? 'nervous' : 'sad', horseExpr: f >= 72 && f < 100 ? 'shock' : undefined }));
    if (f >= 96) A.push(LT(f, TW(0.45, 0.2), { expr: f < 136 ? 'shock' : 'sad', pose: f < 136 ? 'shock' : 'shrug', lit: 1 }, { s: 0.5 * back(96, 106, f) + 0.001 })); }
  if (k === 'date') { A.push(RIDE(f, 1, TW(0, -1.6), { rider: 'RV_REVERE', speed: 0, flip: faceFlip(f, 1, 0.3), riderExpr: 'thoughtful' })); }
  if (k === 'troops') { const t = f - 247; for (let i = 0; i < 6; i++) { const col = i % 2, row = (i / 2) | 0, z = -15 + 0.042 * t - row * 1.2; A.push(P(f, i % 3 === 2 ? 'RV_REDCOAT2' : 'RV_REDCOAT', 60 + i, TW(col ? 0.65 : -0.65, z), { expr: f < 312 ? 'determined' : 'angry', prop: 'musket' })); }
    A.push(P(f, 'RV_OFFICER', 70, TW(-0.1, -13.4 + 0.042 * t), { expr: f < 312 ? 'smug' : 'determined', point: f > 312 && f < 350 ? 1 : undefined }));
    A.push(P(f, 'RV_TOWNKID', 71, TW(2.3, -3.2), { expr: f < 300 ? 'surprised' : 'worried', view: '34L' }, { s: 0.8 })); }
  if (k === 'job') { A.push(P(f, 'RV_REVERE', 2, TW(0.05, -2.1), { expr: f < 400 ? 'thoughtful' : f < 436 ? 'determined' : f < 491 ? 'sly' : 'smug', view: '34L', point: f > 400 && f < 430 ? 1 : undefined }));
    A.push(RIDE(f, 1, TW(-1.6, -3.9), { speed: 0, flip: faceFlip(f, -1, 0) }));
    A.push(LT(f, TW(0.3, -0.9), { expr: f < 434 ? 'smile' : 'shh', pose: f < 434 ? 'wave' : 'shh', lit: 1 })); }
  if (k === 'brit') { const h = f >= 560; A.push(P(f, 'RV_TOWN1', 21, TW(-2.45, -6.9), { expr: h ? 'smug' : 'smile', view: '34R', hip: 1 })); A.push(P(f, 'RV_TOWN2', 22, TW(-2.5, -8.3), { expr: h ? 'happy' : 'smile', view: '34R', wave: h ? q(0.5 + 0.5 * Math.sin(f * 0.4), 0.1) : undefined }));
    A.push(P(f, 'RV_TOWNKID', 23, TW(-1.9, -7.6), { expr: 'excited', view: 'front', cheer: h ? q(0.5 + 0.5 * Math.sin(f * 0.45), 0.1) : undefined }, { s: 0.8 })); }
  if (k === 'door') { const op = f > 612; A.push(P(f, 'RV_FARMER', 31, RD(-6.0, -3.15), { expr: !op ? 'dazed' : f < 650 ? 'surprised' : 'shock', view: '34R', prop: 'lantern', lit: 1 }));
    if (op) A.push(P(f, 'RV_WIFE', 32, RD(-6.85, -3.35), { expr: f < 650 ? 'worried' : 'shock', view: '34R' }, { s: back(612, 622, f) + 0.001 }));
    A.push(P(f, 'RV_REVERE', 2, RD(-4.75, -2.55), { expr: f < 640 ? 'determined' : 'worried', view: '34L', point: f > 648 && f < 690 ? 1 : undefined }));
    A.push(RIDE(f, 1, RD(-2.7, -0.4), { speed: 0, flip: faceFlip(f, -1, 0) })); }
  if (k === 'lantA') { A.push(LT(f, TW(0.95, -32.95, 11.3), { expr: f < 762 ? 'happy' : 'sly', pose: f < 762 ? 'cheer' : 'point', lit: 1 }, { s: 0.5 * back(722, 732, f) + 0.001 })); }
  if (k === 'lantB') { A.push(P(f, 'RV_PATRIOT', 41, RV(0.9, 3.2), { expr: f < 865 ? 'surprised' : 'excited', view: '34BL', prop: 'spyglass' })); A.push(P(f, 'RV_TOWN1', 42, RV(2.0, 3.9), { expr: 'excited', view: '34BL', point: f > 862 ? 1 : undefined }));
    A.push(P(f, 'RV_TOWN2', 43, RV(-0.2, 4.2), { expr: 'surprised', view: '34BL' })); }
  if (k === 'dawes') { A.push(rider(f, 3, dawesX, 0.1, 'RV_DAWES', { riderExpr: f < 921 ? 'determined' : 'happy', coat: 'chestnut' })); }
  if (k === 'pres') { A.push(rider(f, 1, revP, 1.0, 'RV_REVERE', { riderExpr: 'determined' })); A.push(rider(f, 3, dawX2, -0.1, 'RV_DAWES', { riderExpr: 'determined', coat: 'chestnut' }));
    A.push(rider(f, 5, presX, -1.2, 'RV_PRESCOTT', { riderExpr: f < 1016 ? 'excited' : 'happy', coat: 'grey', blaze: 1 })); }
  if (k === 'patrol') { const cap = f >= 1150; A.push(rider(f, 1, revStop, 0.3, 'RV_REVERE', { riderExpr: f < 1105 ? 'determined' : f < 1150 ? 'shock' : 'pained', rear: 0.45 * Math.sin(Math.PI * clamp((f - 1108) / 26, 0, 1)), hands: cap ? 'up' : undefined, horseExpr: f > 1108 && f < 1140 ? 'shock' : undefined }));
    A.push(rider(f, 3, (g) => revStop(g) - 3.0, -2.2, 'RV_DAWES', { riderExpr: f < 1105 ? 'determined' : 'shock', coat: 'chestnut' })); A.push(rider(f, 5, (g) => revStop(g) - 1.6, -1.3, 'RV_PRESCOTT', { riderExpr: f < 1105 ? 'determined' : 'worried', coat: 'grey', blaze: 1 }));
    for (const [i, x, z] of [[0, 17.4, -0.4], [1, 18.9, 0.6]]) A.push(RIDE(f, 80 + i, RD(x, z), { rider: i ? 'RV_REDCOAT2' : 'RV_REDCOAT', speed: 0, flip: faceFlip(f, -1, 0), riderExpr: f < 1126 ? 'smug' : 'angry', coat: i ? 'black' : 'bay' }));
    A.push(P(f, 'RV_OFFICER', 70, RD(16.2, -1.7), { expr: f < 1126 ? 'smug' : 'angry', view: '34L', point: f > 1110 ? 1 : undefined })); }
  if (k === 'escape') { A.push(rider(f, 5, presEsc, 0.2, 'RV_PRESCOTT', { riderExpr: f < 1227 ? 'determined' : 'excited', coat: 'grey', blaze: 1 })); }
  if (k === 'poem') { A.push(P(f, 'RV_LONGF', 51, SD(0.05, -2.3), { expr: f < 1302 ? 'thoughtful' : f < 1349 ? 'smile' : 'smug', view: 'front', prop: 'quill' })); A.push(LT(f, SD(0.85, -1.2, 0.8), { expr: f < 1349 ? 'smile' : 'happy', pose: f < 1349 ? 'stand' : 'cheer', lit: 1 }, { s: 0.16 })); }
  if (k === 'page' || k === 'wrong') { A.push(LT(f, SD(0.13, -1.14, 0.8), { expr: k === 'page' ? (f < 1487 ? 'smile' : 'shock') : f < 1566 ? 'shock' : 'sad', pose: k === 'page' ? (f < 1487 ? 'point' : 'shock') : f < 1566 ? 'shock' : 'shrug', lit: 1, look: -0.6 }, { s: 0.11 })); }
  if (k === 'payoff') { A.push(RIDE(f, 7, PK(0, -2.5, 2.85), { rider: 'RV_REVERE', speed: 0, t: 0, ph: 0.15, rear: 0.38, bronze: 1, flip: false, riderExpr: 'determined', hands: 'up', blink: 0 }, 2.0));
    A.push(P(f, 'RV_TOUR1', 91, PK(-1.25, 1.4), { expr: f < 1661 ? 'happy' : 'surprised', view: '34R', prop: 'flashcam', raise: 1 })); A.push(P(f, 'RV_TOUR2', 92, PK(-0.4, 1.0), { expr: 'excited', view: '34L', point: f < 1640 ? 1 : undefined }));
    A.push(P(f, 'RV_TOURKID', 93, PK(0.9, 0.7), { expr: f < 1661 ? 'excited' : 'thoughtful', view: '34L', cheer: f < 1640 ? q(0.5 + 0.5 * Math.sin(f * 0.4), 0.1) : undefined }, { s: 0.8 }));
    A.push(LT(f, PK(2.7, -0.35), { expr: f < 1676 ? 'sad' : 'love', pose: f < 1676 ? 'stand' : 'cheer', lit: 0.6 + 0.4 * sm(1676, 1700, f) }, { s: 0.42 })); }
  return A;
}

// ---------- effects
const ASP = 1080 / 1920; let CURF = 0;
function SB(k, x, y, z) { const c = cam(k, CURF), n = (v) => { const l = Math.hypot(...v); return v.map((u) => u / l); }, fw = n([c.l[0] - c.p[0], c.l[1] - c.p[1], c.l[2] - c.p[2]]), r = n([-fw[2], 0, fw[0]]), u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]], t = Math.tan(c.fov * Math.PI / 360);
  return [0, 1, 2].map((i) => c.p[i] + fw[i] * z + r[i] * x * t * ASP * z + u[i] * y * t * z); }
const SWD = (k, w, z) => 2 * w * z * Math.tan(cam(k, CURF).fov * Math.PI / 360) * ASP;
const board = (f, f0, lines, pos, size, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'board', lines, pos, size: size * back(f0, f0 + 12, f) }); };
const sboard = (f, f0, lines, k, x, y, z, w, F2, f1) => board(f, f0, lines, SB(k, x, y, z), SWD(k, w, z), F2, f1);
const sburst = (f, f0, k, x, y, z, w, F2, col = '#fff3b0', n = 12) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'burst', t: (f - f0) / n, pos: SB(k, x, y, z * 1.1), size: SWD(k, w, z * 1.1), col, rays: 10 }); };
const stars = (f, f0, k, x, y, z, w, F2, per = 30) => { if (f >= f0) F2.push({ fx: 'stars', t: ((f - f0) / per) % 1, pos: SB(k, x, y, z), size: SWD(k, w, z) * back(f0, f0 + 10, f) }); };
const qmark = (f, f0, k, x, y, z, w, F2) => { if (f >= f0) F2.push({ fx: 'qmark', pos: SB(k, x, y, z), size: SWD(k, w, z) * back(f0, f0 + 8, f) }); };
const stamp = (f, f0, lines, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) { const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos: SB(k, x, y, z), size: SWD(k, w, z) * (1.6 - 0.6 * t * t), op: Math.min(1, t * 2) }); } };
const bubble = (f, f0, lines, k, x, y, z, w, tail, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'bubble', lines, tail, pos: SB(k, x, y, z), size: SWD(k, w, z) * back(f0, f0 + 8, f) }); };
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { bubble(f, 50, ['THE BRITISH', 'ARE COMING!'], 'hook', 0.05, 0.55, 3, 0.5, -1, F2, 104); stamp(f, 74, ['NEVER', 'SAID IT'], 'hook', 0.0, 0.6, 3, 0.42, F2, 106); sburst(f, 74, 'hook', 0.0, 0.58, 3, 0.5, F2);
    sboard(f, 108, ['CONCORD →'], 'hook', 0.0, 0.66, 3, 0.4, F2, 134); stamp(f, 135, ['NEVER', 'GOT THERE'], 'hook', 0.0, 0.62, 3, 0.44, F2); }
  if (k === 'date') { sboard(f, 172, ['APRIL 18'], 'date', 0.0, 0.66, 3, 0.36, F2, 196); stamp(f, 197, ['1775'], 'date', 0.0, 0.64, 3, 0.32, F2); sboard(f, 210, ['BOSTON'], 'date', 0.0, -0.05, 3, 0.3, F2); }
  if (k === 'troops') { sboard(f, 249, ['BRITISH', 'TROOPS'], 'troops', 0.0, 0.66, 3, 0.36, F2, 292); sboard(f, 294, ['MARCHING', 'TO CONCORD'], 'troops', 0.0, 0.66, 3, 0.44, F2, 340); stamp(f, 342, ['SEIZE THE', 'WEAPONS!'], 'troops', 0.0, 0.62, 3, 0.46, F2); }
  if (k === 'job') { sboard(f, 375, ["REVERE'S JOB:"], 'job', 0.0, 0.7, 3, 0.46, F2, 398); sboard(f, 399, ['WARN THE', 'COUNTRYSIDE'], 'job', 0.0, 0.66, 3, 0.46, F2, 432); sboard(f, 433, ['BUT QUIETLY...'], 'job', 0.0, 0.7, 3, 0.46, F2, 488); stamp(f, 489, ['TOP SECRET'], 'job', 0.0, 0.62, 3, 0.46, F2); }
  if (k === 'brit') { sboard(f, 514, ['MOST COLONISTS', 'STILL FELT...'], 'brit', 0.0, 0.66, 3, 0.5, F2, 566); stamp(f, 567, ['BRITISH!'], 'brit', 0.1, 0.12, 3, 0.42, F2); sburst(f, 569, 'brit', 0.1, 0.12, 3, 0.5, F2); }
  if (k === 'door') { sboard(f, 604, ['REPORTEDLY...'], 'door', 0.0, 0.72, 3, 0.44, F2, 644); bubble(f, 646, ['THE REGULARS ARE', 'COMING OUT!'], 'door', 0.1, 0.66, 3, 0.6, -1, F2); }
  if (k === 'lantA') { sboard(f, 706, ['TWO LANTERNS'], 'lantA', 0.0, -0.55, 3, 0.48, F2, 760); sboard(f, 735, ['OLD NORTH', 'CHURCH'], 'lantA', 0.0, 0.66, 3, 0.4, F2, 776); stamp(f, 778, ['NOT FOR', 'REVERE'], 'lantA', 0.0, 0.62, 3, 0.4, F2); }
  if (k === 'lantB') { sboard(f, 802, ['A SIGNAL FOR', 'PATRIOTS...'], 'lantB', 0.0, 0.66, 3, 0.46, F2, 860); stamp(f, 862, ['IN', 'CHARLESTOWN'], 'lantB', 0.0, 0.62, 3, 0.48, F2); }
  if (k === 'dawes') { sboard(f, 899, ['NOT ALONE!'], 'dawes', 0.0, 0.7, 3, 0.4, F2, 918); sboard(f, 919, ['WILLIAM', 'DAWES'], 'dawes', 0.0, 0.66, 3, 0.38, F2, 964); sboard(f, 965, ['ANOTHER', 'ROUTE'], 'dawes', 0.0, 0.66, 3, 0.36, F2); }
  if (k === 'pres') { sboard(f, 1000, ['SAMUEL', 'PRESCOTT'], 'pres', 0.0, 0.66, 3, 0.4, F2, 1040); sboard(f, 1041, ['THREE RIDERS'], 'pres', 0.0, 0.7, 3, 0.44, F2); }
  if (k === 'patrol') { sboard(f, 1078, ['NEAR', 'LINCOLN'], 'patrol', 0.0, 0.66, 3, 0.32, F2, 1108); stamp(f, 1111, ['PATROL!'], 'patrol', 0.0, 0.64, 3, 0.36, F2, 1150); stamp(f, 1162, ['CAPTURED!'], 'patrol', 0.0, 0.62, 3, 0.42, F2); sburst(f, 1165, 'patrol', -0.05, 0.25, 3, 0.45, F2, '#ffd0c0'); }
  if (k === 'escape') { sboard(f, 1197, ['PRESCOTT', 'ESCAPED'], 'escape', 0.0, 0.66, 3, 0.4, F2, 1229); stamp(f, 1231, ['REACHED', 'CONCORD!'], 'escape', 0.0, 0.62, 3, 0.44, F2); }
  if (k === 'poem') { sboard(f, 1269, ['YOU SEE...'], 'poem', 0.0, 0.7, 3, 0.36, F2, 1298); sboard(f, 1300, ['FAMOUS', 'BECAUSE OF...'], 'poem', 0.0, 0.66, 3, 0.44, F2, 1346); stamp(f, 1347, ['A POEM'], 'poem', 0.0, 0.64, 3, 0.36, F2, 1372); sboard(f, 1374, ['1861'], 'poem', 0.0, 0.7, 3, 0.28, F2); }
  if (k === 'page') { sboard(f, 1421, ["LONGFELLOW'S", 'POEM'], 'page', 0.0, 0.66, 0.42, 0.46, F2, 1484); stamp(f, 1485, ['GOT A LOT', 'WRONG'], 'page', 0.0, 0.5, 0.42, 0.44, F2); }
  if (k === 'wrong') { stamp(f, 1513, ['NO DAWES'], 'wrong', -0.1, 0.66, 0.42, 0.36, F2); stamp(f, 1536, ['NO PRESCOTT'], 'wrong', 0.08, 0.34, 0.42, 0.4, F2); stamp(f, 1563, ['NO CAPTURE'], 'wrong', -0.05, 0.02, 0.42, 0.38, F2); }
  if (k === 'payoff') { sboard(f, 1601, ['THE RIDER WHO', 'MADE IT?'], 'payoff', 0.0, 0.66, 3, 0.48, F2, 1652); bubble(f, 1652, ['WHO?'], 'payoff', -0.35, 0.3, 3, 0.26, 1, F2, 1700); sboard(f, 1688, ['SAMUEL', 'PRESCOTT'], 'payoff', 0.0, 0.66, 3, 0.36, F2); stars(f, 1700, 'payoff', 0.0, 0.25, 3, 0.5, F2, 24); }
  return F2;
}
