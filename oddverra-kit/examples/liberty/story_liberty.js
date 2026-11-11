// [LIB-story] "The Statue of Liberty was supposed to stand in Egypt" timeline (59.76 s voice, 1793 f @ 30 fps).
// Sets: egypt.js (colossi / canal / palace) and harbor.js (studio / centennial / harbor / harborNight), driven through setAt.
// Pattern: story_einstein.js / story_teddy.js (slow push per shot, zoom-through whips on every cut, boards for facts, bursts on SFX hits).
import * as S from './story.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, module, set]                                   narration (word frames from work/words_frames.txt)
const SH = [
  [0, 34, 'hook', 'harbor', 'harbor'],          // The Statue of Liberty
  [34, 63, 'hook2', 'harbor', 'harbor'],        // was supposed to stand in
  [63, 91, 'egypt', 'egypt', 'canal'],          // Egypt.  (boom 2.1 s)
  [91, 139, 'sixties', 'egypt', 'colossi'],     // You see, in the 1860s,
  [139, 180, 'sculptor', 'egypt', 'colossi'],   // a French sculptor named Frederic Bartholdi
  [180, 270, 'giants', 'egypt', 'colossi'],     // fell in love with Egypt's giant ancient statues.  (desert 6-9 s)
  [270, 300, 'sketch', 'egypt', 'colossi'],     // (sketch insert)
  [300, 345, 'huge', 'egypt', 'canal'],         // And Egypt was building something huge,
  [345, 414, 'suez', 'egypt', 'canal'],         // the Suez Canal.  (11.5-13.8 s)
  [414, 467, 'pitch', 'egypt', 'palace'],       // So Bartholdi pitched its ruler,
  [467, 538, 'khedive', 'egypt', 'palace'],     // the Khedive Isma'il Pasha, a dream.
  [538, 588, 'colossal', 'egypt', 'canal'],     // A colossal woman in robes,
  [588, 612, 'raise', 'egypt', 'palace'],       // holding a torch high,  (torch 20.0 s: Bartholdi acts it out)
  [612, 678, 'torch', 'egypt', 'canal'],        // guarding the canal's entrance
  [678, 720, 'lighthouse', 'egypt', 'canal'],   // as a lighthouse.  (22.6 s)
  [720, 780, 'title', 'egypt', 'palace'],       // He called it, "Egypt Carrying the Light to Asia."
  [780, 822, 'price', 'egypt', 'palace'],       // The Khedive looked at the price
  [822, 858, 'mono', 'egypt', 'palace'],        // and said  (coins 27.4 s, monocle pop)
  [858, 879, 'no', 'egypt', 'palace'],          // no.  (music stop + thud 28.6 s)
  [879, 939, 'plain', 'egypt', 'canal'],        // A plain lighthouse got built instead.  (29.3-31 s)
  [939, 989, 'crushed', 'egypt', 'canal'],      // Bartholdi was crushed.  (tuba 31.3-33 s)
  [989, 1029, 'kept', 'egypt', 'canal'],        // But he kept the idea.  (ting 33.6 s)
  [1029, 1063, 'later', 'harbor', 'studio'],    // A few years later,  (whoosh 34.3 s)
  [1063, 1100, 'gift', 'harbor', 'centennial'], // France wanted to give America a gift
  [1100, 1146, 'birthday', 'harbor', 'centennial'], // for its hundredth birthday.
  [1146, 1182, 'dust', 'harbor', 'studio'],     // Bartholdi dusted off  (38.2 s)
  [1182, 1209, 'sketches', 'harbor', 'studio'], // his sketches.
  [1209, 1252, 'robed', 'harbor', 'studio'],    // A woman in robes,
  [1252, 1290, 'torch2', 'harbor', 'studio'],   // a torch held high.
  [1290, 1314, 'familiar', 'harbor', 'studio'], // Sound familiar?  (brass stab 43.0 s)
  [1314, 1392, 'insist', 'harbor', 'studio'],   // He always insisted they weren't the same statue,
  [1392, 1425, 'models', 'harbor', 'studio'],   // but put the models
  [1425, 1496, 'side', 'harbor', 'studio'],     // side by side and they look a lot alike.  (47.5 s, ting 49.1 s)
  [1496, 1521, 'twist', 'harbor', 'studio'],    // And the twist?  (hush)
  [1521, 1548, 'opened', 'harbor', 'harbor'],   // When Lady Liberty opened  (timpani 50.7 s)
  [1548, 1587, 'crowd', 'harbor', 'harbor'],    // in 1886,  (applause 51.6 s)
  [1587, 1626, 'became', 'harbor', 'harbor'],   // she actually became a
  [1626, 1686, 'night', 'harbor', 'harborNight'], // lighthouse, officially,  (54.2 s, stamp 54.9 s)
  [1686, 1708, 'years', 'harbor', 'harborNight'], // for about fifteen years.  (56.2 s)
  [1708, 1765, 'keeper', 'harbor', 'harborNight'], // She got her lighthouse job after all,
  [1765, 1793, 'end', 'harbor', 'harborNight'], // just in New York.  (glock 59.3 s)
];
export const NF = 1793;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
const LIGHT = { colossi: 'day', canal: 'day', palace: 'office', studio: 'office', centennial: 'day', harbor: 'day', harborNight: 'night' };
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: LIGHT[s[4]], kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {}; // narrator not lip-synced; characters don't talk
export const setAt = (f) => { const s = segAt(f); return [s[3], s[4]]; };

// ---------- places (world coords; from egypt.spots / harbor.spots) ----------
const at = (o) => (p) => [p[0] + o[0], p[1] + o[1], p[2] + o[2]];
const CO = at([-9000, 0, 0]), CA = at([-9000, 0, 600]), PA = at([-9000, 0, 1200]);
const ST = at([-11500, 0, -600]), CE = at([-11500, 0, -300]), HB = at([-11500, 0, 1500]);
const BART_CAMP = CO([9.3, 0.22, 6.4]);          // beside the easel
const BART_PLAZA = CO([4.3, 0.05, -3.0]);         // at the feet of the giants
const KH_STAND = PA([-0.4, 0, -4.25]), BART_PAL = PA([-1.1, 0, -2.1]), ADV = PA([1.9, 0, -3.6]);
const BART_QUAY = CA([-26.0, 1.6, 11.0]);         // west quay (in front of the PORT SAID building), looking at the canal mouth
const BART_DECK = CA([-1.0, 2.55, -9.0]);         // steamer deck at the canal mouth
const SCULPT = ST([1.55, 0, 1.4]), BENCH = ST([-1.6, 0, 2.7]), HANDF = ST([-4.2, 0, -0.2]);
const KEEPER = HB([4.31, 96.83, 4.0]);            // torch balcony
const TORCH = HB([4.31, 97.03, 2.08]), DTORCH = CA([-36.6, 44.25, -2.82]);

// ---------- cameras ----------
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp });
const V = {
  hook: C(HB([18, 4.5, 78]), HB([0, 74, 0]), 36, 2.0, HB([0, 70, 0])),
  hook2: C(HB([31.3, 95.0, 14.1]), HB([4.3, 93.5, 2.1]), 40, 4, HB([4.3, 95, 2.1])),
  egypt: C(CA([-8, 3.2, 26]), CA([-34, 26, -6]), 58, 1.6, CA([-34, 20, -4])),
  sixties: C(CO([4, 2.4, 80]), CO([0, 9, -20]), 33, 1.2, CO([-1, 6, -20])),
  sculptor: C(CO([11.8, 1.55, 10.6]), CO([9.0, 1.9, 4.5]), 46, 4, CO([9.3, 1.4, 6.4])),
  giants: C(CO([4.6, 1.0, 3.5]), CO([5.2, 8.5, -21]), 56, 2.5, CO([4.3, 1.3, -3.0])),
  sketch: C(CO([9.15, 1.75, 7.3]), CO([8.62, 1.45, 5.25]), 42, 6, CO([8.62, 1.3, 5.25])),
  huge: C(CA([30, 3.4, 40]), CA([10, 6, 58]), 44, 4, CA([24.45, 2.5, 45.0])),
  suez: C(CA([62, 30, 100]), CA([-14, 2, -6]), 44, 1.5, CA([-3, 5, -22])),
  pitch: C(PA([1.1, 1.55, 2.4]), PA([-0.3, 1.4, -4]), 50, 3, PA([-0.6, 1.2, -3.0])),
  khedive: C(PA([0.4, 1.5, 1.9]), PA([-0.75, 1.3, -3.4]), 50, 5, PA([-0.4, 1.3, -4.2])),
  colossal: C(CA([45, 12, -95]), CA([-32, 22, -4]), 38, 1.5, CA([-30, 10, -4])),
  raise: C(PA([0.8, 1.45, 1.6]), PA([-1.0, 1.6, -2.8]), 46, 5, PA([-1.1, 1.4, -2.1])),
  torch: C(CA([-14, 3.0, 30]), CA([-34, 24, -4]), 56, 1.6, CA([-34, 20, -4])),
  lighthouse: C(CA([-8, 3.2, 26]), CA([-34, 26, -6]), 58, 1.6, CA([-34, 20, -4])),
  title: C(PA([-0.05, 1.28, -2.25]), PA([-0.55, 1.2, -3.25]), 40, 5, PA([-0.55, 1.2, -3.25])),
  price: C(PA([1.5, 0.45, 2.6]), PA([0.4, 0.55, -2.6]), 46, 6, PA([0.5, 0.2, 0.2])),
  mono: C(PA([0.2, 1.5, -1.3]), PA([-0.4, 1.4, -4.25]), 40, 7, PA([-0.4, 1.45, -4.25])),
  no: C(PA([0.1, 1.5, -1.5]), PA([-0.4, 1.4, -4.25]), 40, 7, PA([-0.4, 1.45, -4.25])),
  plain: C(CA([-8, 3.2, 26]), CA([-34, 26, -6]), 58, 1.6, CA([-34, 20, -4])),
  crushed: C(CA([-24.2, 2.0, 15.5]), CA([-31, 13, -4]), 60, 3, CA([-26.0, 2.4, 11.0])),
  kept: C(CA([-24.7, 2.9, 14.1]), CA([-26.3, 2.75, 10.5]), 44, 6, CA([-26.0, 2.9, 11.0])),
  later: C(ST([0.3, 1.7, 6.3]), ST([0.8, 2.5, -4]), 60, 2.2, ST([1.55, 1.4, 1.4])),
  gift: C(CE([1.5, 1.6, 9.0]), CE([0, 5.5, -6]), 54, 2.5, CE([0, 1.5, 1.2])),
  birthday: C(CE([0.5, 1.7, 4.6]), CE([0, 1.9, -3.6]), 50, 4, CE([0, 1.4, -3.6])),
  dust: C(ST([-2.15, 1.75, 2.45]), ST([-2.35, 0.9, 1.78]), 38, 7, ST([-2.35, 0.9, 1.78])),
  sketches: C(ST([-0.6, 1.5, 5.3]), ST([-1.7, 1.3, 2.7]), 44, 5, ST([-1.6, 1.4, 2.7])),
  robed: C(ST([0.2, 1.6, 3.0]), ST([0, 1.62, 0.6]), 36, 6, ST([0, 1.6, 0.6])),
  torch2: C(ST([-5.0, 1.6, 3.6]), ST([-3.0, 1.7, -2.4]), 50, 4, ST([-4.2, 1.5, -0.2])),
  familiar: C(ST([2.3, 1.5, 4.4]), ST([1.45, 1.35, 1.4]), 40, 7, ST([1.55, 1.5, 1.4])),
  insist: C(ST([2.2, 1.5, 4.9]), ST([1.2, 1.3, 1.0]), 46, 5, ST([1.55, 1.3, 1.4])),
  models: C(ST([-0.2, 1.6, 3.0]), ST([0, 1.62, 0.6]), 36, 6, ST([0, 1.6, 0.6])),
  side: C(ST([0.0, 1.65, 4.3]), ST([0, 1.6, 0.6]), 38, 5, ST([0, 1.55, 0.6])),
  twist: C(ST([2.9, 1.55, 4.6]), ST([1.3, 1.4, 1.2]), 40, 6, ST([1.55, 1.5, 1.4])),
  opened: C(HB([70, 16, 400]), HB([-6, 50, 0]), 36, 1.2, HB([0, 50, 0])),
  crowd: C(HB([0.3, 3.6, 177]), HB([0, 40, 0]), 50, 2.5, HB([0, 3.4, 170])),
  became: C(HB([31.3, 95.0, 14.1]), HB([4.3, 93.5, 2.1]), 40, 4, HB([4.3, 95, 2.1])),
  night: C(HB([70, 16, 400]), HB([-6, 56, 0]), 38, 1.2, HB([0, 50, 0])),
  years: C(HB([18, 4.5, 78]), HB([0, 78, 0]), 36, 2.0, HB([0, 70, 0])),
  keeper: C(HB([6.5, 98.5, 8.0]), HB([4.1, 97.8, 3.4]), 50, 5, add3(KEEPER, [0, 1.2, 0])),
  end: C(HB([62, 14, 330]), HB([-4, 58, 0]), 38, 1.2, HB([0, 50, 0])),
};
// push toward the look target by k x (distance to the focus point), so far look targets don't fly the camera past near actors
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], n = Math.hypot(...d), r = Math.min(n, dist(v.p, v.fp || v.l)) / n; return { ...v, p: add3(v.p, d.map((x) => x * k * t * r)) }; };
const PUSH = { hook: 0.18, hook2: 0.12, egypt: 0.14, sixties: 0.08, sculptor: 0.1, giants: 0.1, sketch: 0.14, huge: 0.08, suez: 0.1, pitch: 0.08, khedive: 0.1,
  colossal: 0.12, raise: 0.08, torch: 0.08, lighthouse: 0.1, title: 0.14, price: 0.1, mono: 0.1, no: 0.0, plain: 0.06, crushed: 0.06, kept: 0.12, later: 0.08, gift: 0.08,
  birthday: 0.1, dust: 0.12, sketches: 0.1, robed: 0.12, torch2: 0.1, familiar: 0.1, insist: 0.06, models: 0.12, side: 0.14, twist: 0.12, opened: 0.1,
  crowd: 0.06, became: 0.1, night: 0.08, years: 0.1, keeper: 0.12, end: -0.12 };
const base = (k) => V[k] || V.hook;
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  if (k === 'hook') punch(18, 26, 0.1);
  if (k === 'egypt') { punch(63, 70, 0.14); kick(63, 0.4); }
  if (k === 'torch') punch(612, 620, 0.08);
  if (k === 'mono') { punch(822, 828, 0.1); kick(822, 0.02); }
  if (k === 'no') { punch(858, 863, 0.2); kick(858, 0.03); }
  if (k === 'familiar') punch(1290, 1296, 0.14);
  if (k === 'side') punch(1473, 1480, 0.06);
  if (k === 'opened') kick(1521, 0.8);
  if (k === 'night') kick(1647, 0.6);
  return c;
}
const CUTS = SH.slice(1).map((s) => s[0]);
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0; // white flashes on place jumps and big hits
  for (const [c, a, n] of [[63, 0.9, 12], [91, 0.5, 8], [300, 0.5, 8], [414, 0.6, 8], [538, 0.6, 10], [612, 0.5, 8], [858, 0.6, 8], [879, 0.5, 8], [1029, 0.8, 10], [1063, 0.6, 8], [1425, 0.5, 8], [1521, 0.9, 12], [1626, 0.8, 10], [1779, 0.4, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state ----------
export function worldAt(f, w) {
  const s = segAt(f), k = s[2], E = w.egypt, H = w.harbor;
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  if (E) {
    // canal: the dream vision vs. the plain lighthouse (never both)
    E.dream(k === 'egypt' ? 1 : k === 'colossal' ? sm(540, 578, f) : k === 'torch' || k === 'lighthouse' ? 1 : 0);
    const built = ['crushed', 'kept'].includes(k);
    E.setLighthouse(k === 'plain' ? 0.38 + 0.62 * sm(879, 918, f) : built ? 1 : 0, built || (k === 'plain' && f > 918) ? 1 : 0);
    E.setScroll(k === 'price' ? sm(784, 820, f) : ['mono', 'no'].includes(k) ? 1 : 0);
  }
  if (H) {
    if (s[4] === 'studio') H.models(['robed', 'familiar', 'insist', 'twist', 'torch2'].includes(k) ? 'liberty' : ['models', 'later', 'dust', 'sketches'].includes(k) ? 'egypt' : 'both');
    const sp = k === 'robed' ? -0.6 + 0.6 * sm(1209, 1252, f) : 0;
    H.turn(k === 'models' ? 0.15 * Math.sin(f * 0.03) : sp, sp);
    if (k === 'dust' || k === 'sketches') H.dustOff(1160, 24); else H.dustOff(k === 'later' ? null : 0, 24);
    H.setGift(s[4] === 'centennial');
    H.setSalute(k === 'opened' || k === 'crowd');
    H.setFireworks(k === 'end' || k === 'keeper');
  }
}

// ---------- actors ----------
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const BY = (f, pos, opts = {}, extra = {}) => person(f, 'BARTHOLDI_YOUNG', 11, pos, opts, extra);
const BO = (f, pos, opts = {}, extra = {}) => person(f, 'BARTHOLDI_OLD', 12, pos, opts, extra);
const KH = (f, pos, opts = {}, extra = {}) => person(f, 'KHEDIVE', 13, pos, opts, extra);
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);

export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'sculptor') A.push(BY(f, BART_CAMP, { expr: f < 158 ? 'smile' : 'happy', prop: 'sketchbook', sketch: 'colossus', reach: 0.6, view: '34L' }));
  if (k === 'giants') A.push(BY(f, BART_PLAZA, { expr: f < 205 ? 'surprised' : 'love', clasp: f >= 205 ? 1 : undefined, view: 'front' }));
  if (k === 'huge') { A.push(P(f, 'WORKER1', 21, CA([24.45, 1.6, 45.0]), { expr: 'smile', prop: 'shovel', view: '34R' })); A.push(P(f, 'WORKER2', 22, CA([23.3, 1.6, 47.2]), { expr: 'happy', prop: 'basket', view: '34R' })); }
  if (k === 'pitch') {
    A.push(KH(f, KH_STAND, { expr: 'thoughtful', view: 'front' }));
    A.push(BY(f, BART_PAL, { expr: 'excited', cheer: 0, prop: 'rolls', reach: 0.6, view: '34R' }));
    A.push(P(f, 'ADVISER', 14, ADV, { expr: 'smile', prop: 'ledger', reach: 0.5, view: '34L' }));
  }
  if (k === 'khedive') {
    A.push(KH(f, KH_STAND, { expr: f < 500 ? 'thoughtful' : 'surprised', view: 'front' }));
    A.push(BY(f, PA([-1.0, 0, -1.9]), { expr: f < 510 ? 'smile' : 'dreamy', prop: 'sketchbook', sketch: 'fellaha', reach: f < 510 ? 0.4 : 0.7, view: '34R' }));
  }
  if (k === 'raise') { A.push(KH(f, KH_STAND, { expr: f < 600 ? 'thoughtful' : 'surprised', view: 'front' })); A.push(BY(f, BART_PAL, { expr: f < 598 ? 'happy' : 'excited', cheer: 0, raise: f >= 596 ? 1 : undefined, view: '34R' })); }
  if (k === 'price') A.push(person(f, 'KHEDIVE_MONO', 13, KH_STAND, { expr: 'thoughtful', view: 'front' }));
  if (k === 'mono') A.push(person(f, 'KHEDIVE_MONO', 13, KH_STAND, { expr: f < 822 ? 'thoughtful' : 'surprised', monoclePop: f >= 822 ? 1 : undefined, prop: 'scroll', scrollLen: 1, reach: 1, view: 'front' }));
  if (k === 'no') A.push(KH(f, KH_STAND, { expr: 'determined', palm: 1, view: 'front', headTilt: f < 876 ? q(6 * Math.sin((f - 858) * 0.55), 1) : 0 }));
  if (k === 'crushed') A.push(BY(f, BART_QUAY, { expr: 'sad', slump: 1, view: 'front' }));
  if (k === 'kept') A.push(BY(f, BART_QUAY, { expr: f < 1006 ? 'thoughtful' : 'dreamy', prop: 'sketchbook', sketch: 'fellaha', reach: f < 1006 ? 0.4 : 0.7, view: 'front' }));
  if (k === 'later') A.push(BO(f, SCULPT, { expr: 'thoughtful', prop: 'mallet', reach: 0.5, view: '34L' }));
  if (k === 'gift' || k === 'birthday') {
    const g = k === 'gift';
    A.push(P(f, 'PARISIAN', 31, g ? CE([-1.4, 0, 0.6]) : CE([-1.2, 0, 0.2]), { expr: 'grin', view: '34R', wave: f > 1075 ? 0.85 : undefined }));
    A.push(P(f, 'NY_MAN', 32, g ? CE([1.6, 0, 1.0]) : CE([1.5, 0, 0.0]), { expr: 'excited', cheer: wav(f, 0) }));
    A.push(P(f, 'NY_WOMAN', 33, g ? CE([2.6, 0, -0.4]) : CE([1.9, 0, -0.9]), { expr: 'laugh', wave: wav(f, 1), view: '34L' }));
    A.push(P(f, 'NY_KID', 34, g ? CE([0.6, 0, 1.8]) : CE([-0.6, 0, 1.3]), { expr: 'excited', cheer: 0, prop: 'pennant', raise: 1, reach: 0.8 }));
  }
  if (k === 'sketches') A.push(BO(f, BENCH, { expr: 'dreamy', prop: 'sketchbook', sketch: 'fellaha', reach: 0.7, view: '34R' }));
  if (k === 'torch2') A.push(BO(f, HANDF, { expr: 'excited', cheer: 0, raise: 1, view: '34R' }));
  if (k === 'familiar') A.push(BO(f, SCULPT, { expr: 'sly', view: '34L' }));
  if (k === 'insist') A.push(BO(f, SCULPT, { expr: f < 1340 ? 'determined' : 'worried', cheer: 0, handsUp: 1, shake: 1, view: 'front' }));
  if (k === 'twist') A.push(person(f, 'BARTHOLDI_OLD_HAT', 12, SCULPT, { expr: 'sly', view: '34L' }));
  if (k === 'crowd') {
    const CR = [['NY_MAN', -0.6, 0.0], ['NY_WOMAN', 0.7, -0.6], ['NY_KID', 0.0, 1.2], ['WORKER1', -1.8, -1.0], ['PARISIAN', 1.9, 0.4]];
    CR.forEach(([o, x, z], i) => A.push(P(f, o, 40 + i, HB([x, 2.4, 170 + z]), o === 'NY_KID' ? { expr: 'excited', cheer: 0, prop: 'pennant', raise: 1 } : { expr: i % 2 ? 'laugh' : 'excited', cheer: i % 2 ? undefined : wav(f, i), wave: i % 2 ? wav(f, i) : undefined })));
  }
  if (k === 'keeper') A.push(person(f, 'KEEPER', 15, KEEPER, { expr: f < 1735 ? 'smile' : 'happy', prop: 'lantern', lit: sm(1712, 1730, f), reach: f < 1735 ? 0.5 : 0.85, view: 'front' }));
  return A;
}

// ---------- effects ----------
// screen-anchored placement from a shot's base (unpushed) camera: ndc (x, y), depth z -> world point; w = ndc half-width -> world size
const ASP = 1080 / 1920; let CURF = 0; // fx are screen-anchored to the shot's pushed camera at the current frame (no whip zoom)
function SB(k, x, y, z) { const c = cam(k, CURF), n = (v) => { const l = Math.hypot(...v); return v.map((u) => u / l); }, fw = n([c.l[0] - c.p[0], c.l[1] - c.p[1], c.l[2] - c.p[2]]), r = n([-fw[2], 0, fw[0]]), u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]], t = Math.tan(c.fov * Math.PI / 360);
  return [0, 1, 2].map((i) => c.p[i] + fw[i] * z + r[i] * x * t * ASP * z + u[i] * y * t * z); }
const SW = (k, w, z) => 2 * w * z * Math.tan(cam(k, CURF).fov * Math.PI / 360) * ASP;
const board = (f, f0, lines, pos, size, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'board', lines, pos, size: size * back(f0, f0 + 12, f) }); };
const sboard = (f, f0, lines, k, x, y, z, w, F2, f1) => board(f, f0, lines, SB(k, x, y, z), SW(k, w, z), F2, f1);
const burst = (f, f0, pos, size, F2, col = '#fff3b0', n = 12) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'burst', t: (f - f0) / n, pos, size, col, rays: 10 }); };
const sburst = (f, f0, k, x, y, z, w, F2, col, n) => burst(f, f0, SB(k, x, y, z), SW(k, w, z), F2, col, n);
const stars = (f, f0, k, x, y, z, w, F2, per = 30) => { if (f >= f0) F2.push({ fx: 'stars', t: ((f - f0) / per) % 1, pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 10, f) }); };
const stamp = (f, f0, lines, pos, size, F2) => { if (f < f0) return; const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos, size: size * (1.6 - 0.6 * t), op: Math.min(1, t * 2), roll: 0.0, blob: false }); if (f < f0 + 12) F2.push({ fx: 'burst', t: (f - f0) / 12, pos: add3(pos, [0, 0, -0.02]), size: size * 1.3, col: '#ffe6c8', rays: 12 }); };
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook2') sboard(f, 40, ['STATUE OF', 'LIBERTY'], 'hook2', 0.42, -0.5, 14, 0.4, F2);
  if (k === 'egypt') { sburst(f, 63, 'egypt', 0.0, 0.55, 6, 0.9, F2, '#fff3b0', 14); sboard(f, 66, ['MEANT FOR', 'EGYPT?!'], 'egypt', 0.5, 0.05, 3.0, 0.42, F2); }
  if (k === 'sixties') sboard(f, 100, ['EGYPT', '1860s'], 'sixties', 0.0, 0.5, 6, 0.4, F2);
  if (k === 'sculptor') sboard(f, 166, ['FRÉDÉRIC', 'BARTHOLDI'], 'sculptor', -0.35, 0.55, 3.0, 0.42, F2);
  if (k === 'giants' && f >= 210) for (let i = 0; i < 3; i++) { const u = ((f - 210) / 26 + i / 3) % 1; F2.push({ fx: 'note', kind: i % 2, pos: SB('giants', -0.4 + 0.25 * i, 0.0 + u * 0.4, 4.5), size: SW('giants', 0.12, 4.5), op: 0.9 * (1 - u), col: '#c0453a' }); }
  if (k === 'suez') { sburst(f, 345, 'suez', 0.0, 0.4, 20, 0.8, F2, '#ffffff', 10); sboard(f, 348, ['SUEZ CANAL', 'OPENS 1869'], 'suez', 0.0, 0.52, 20, 0.45, F2); }
  if (k === 'khedive') { sboard(f, 472, ['KHEDIVE', "ISMA'IL PASHA"], 'khedive', 0.0, 0.62, 2.6, 0.45, F2); if (f >= 513) F2.push({ fx: 'bulb', t: ((f - 513) / 30) % 1, pos: SB('khedive', -0.55, 0.38, 2.3), size: SW('khedive', 0.16, 2.3) * back(513, 522, f) }); }
  if (k === 'colossal') stars(f, 560, 'colossal', 0.15, 0.25, 40, 0.3, F2);
  if (k === 'raise') sburst(f, 598, 'raise', -0.2, 0.55, 2.5, 0.4, F2, '#fff3b0', 12);
  if (k === 'torch') burst(f, 612, DTORCH, 16, F2, '#fff3b0', 14);
  if (k === 'lighthouse') { burst(f, 678, DTORCH, 22, F2, '#fff3b0', 16); sboard(f, 684, ['A LIGHTHOUSE', 'STATUE'], 'lighthouse', 0.5, 0.05, 4, 0.42, F2); }
  if (k === 'title') { sboard(f, 726, ['EGYPT CARRYING', 'THE LIGHT TO ASIA'], 'title', 0.0, 0.7, 1.0, 0.55, F2); stars(f, 726, 'title', -0.05, 0.38, 1.0, 0.22, F2); }
  if (k === 'price') sboard(f, 790, ['THE PRICE:', 'ENORMOUS'], 'price', 0.0, 0.6, 2.0, 0.42, F2);
  if (k === 'mono') { sburst(f, 822, 'mono', 0.0, 0.25, 2.2, 0.75, F2, '#ffd84a', 12); stars(f, 824, 'mono', 0.0, 0.42, 2.2, 0.3, F2, 20); }
  if (k === 'no') stamp(f, 858, ['NO!'], SB('no', 0.0, 0.5, 2.5), SW('no', 0.6, 2.5), F2);
  if (k === 'plain') sboard(f, 900, ['PORT SAID', 'LIGHTHOUSE 1869'], 'plain', 0.2, -0.5, 5, 0.42, F2);
  if (k === 'kept') { sburst(f, 1008, 'kept', -0.3, 0.42, 2.0, 0.45, F2); if (f >= 1008) F2.push({ fx: 'bulb', t: ((f - 1008) / 30) % 1, pos: SB('kept', -0.3, 0.42, 2.0), size: SW('kept', 0.18, 2.0) * back(1008, 1016, f) }); }
  if (k === 'later') sboard(f, 1032, ['PARIS,', 'YEARS LATER'], 'later', 0.0, 0.55, 3, 0.42, F2);
  if (k === 'gift') { sboard(f, 1070, ['A GIFT FROM', 'FRANCE'], 'gift', 0.0, 0.62, 5, 0.42, F2); sburst(f, 1097, 'gift', 0.0, 0.05, 6, 0.5, F2, '#ffffff', 10); }
  if (k === 'birthday') { sboard(f, 1110, ['AMERICA', 'TURNS 100'], 'birthday', 0.0, 0.6, 2.5, 0.45, F2); stars(f, 1114, 'birthday', 0.0, 0.3, 2.5, 0.35, F2); }
  if (k === 'robed') sburst(f, 1225, 'robed', 0.05, 0.55, 2.0, 0.5, F2, '#ffffff', 10);
  if (k === 'torch2') sburst(f, 1262, 'torch2', 0.25, 0.35, 3.0, 0.6, F2);
  if (k === 'familiar') { sburst(f, 1290, 'familiar', 0.0, 0.3, 2.0, 0.6, F2, '#ffffff', 8); if (f >= 1292) F2.push({ fx: 'qmark', pos: SB('familiar', 0.5, 0.45, 2.0), size: SW('familiar', 0.14, 2.0) * back(1292, 1300, f) }); }
  if (k === 'insist') sboard(f, 1330, ['NOT THE SAME', 'STATUE!'], 'insist', 0.0, 0.62, 3.0, 0.45, F2);
  if (k === 'side') { sburst(f, 1427, 'side', 0.0, 0.0, 3.0, 0.7, F2, '#ffffff', 10); sburst(f, 1473, 'side', 0.0, 0.35, 3.0, 0.6, F2); stars(f, 1474, 'side', 0.0, 0.45, 3.0, 0.4, F2); }
  if (k === 'twist' && f >= 1500) F2.push({ fx: 'qmark', pos: SB('twist', 0.5, 0.45, 2.2), size: SW('twist', 0.14, 2.2) * back(1500, 1508, f) });
  if (k === 'opened') sburst(f, 1521, 'opened', 0.0, 0.4, 60, 0.8, F2, '#fff3b0', 14);
  if (k === 'crowd') { sboard(f, 1552, ['OPENING DAY', 'OCT. 28, 1886'], 'crowd', 0.0, 0.62, 4, 0.45, F2); stars(f, 1550, 'crowd', 0.0, 0.3, 4, 0.45, F2); }
  if (k === 'night') stamp(f, 1647, ['OFFICIAL', 'LIGHTHOUSE'], SB('night', 0.0, -0.45, 40), SW('night', 0.5, 40), F2);
  if (k === 'years') sboard(f, 1688, ['LIGHTHOUSE', '1886–1902'], 'years', 0.0, -0.45, 6, 0.45, F2);
  if (k === 'keeper') sburst(f, 1712, 'keeper', 0.2, -0.05, 4, 0.4, F2, '#fff3b0', 12);
  if (k === 'end') { sboard(f, 1770, ['NEW YORK', 'LIGHTHOUSE'], 'end', 0.0, -0.5, 30, 0.45, F2); burst(f, 1779, TORCH, 30, F2, '#fff3b0', 14); stars(f, 1779, 'end', 0.0, 0.3, 30, 0.4, F2, 20); }
  return F2;
}
