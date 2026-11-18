// [AL-story] "The first American alarm clock could only ring at 4 AM" timeline. Word timings come from al_words.js (generated from
// work/words.json), so every beat is anchored on the word that triggers it. Sets: al_sets.js (town / bedroom / shop / works / paris)
// through setAt. Pattern: story_bigben.js (slow push per shot, zoom-through whips on cuts, screen-pinned boards / bursts / stamps,
// punch-ins on beats). The motif is the 4 AM bell: the hook rings it on the dial, the cutaway pin trips it, it ruins ROOSTY's
// sleep-in, Redier's red setting hand finally moves it, and the payoff rings it once more over Concord at sunrise. Sidekick: ROOSTY,
// a rooster who is out of a job because the clock beats the sun by hours.
import * as S from './story.js';
import { CAB } from './al_sets.js';
import { WF, NF as NFW } from './al_words.js';
const { sm, eo, back, add3, dist, q, person } = S;

// ---------- word anchors: w('four', 0) = first frame of the first word starting with 'four'
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, '');
const w = (k, n = 0, end = false) => { const hits = WF.filter((x) => norm(x[0]).startsWith(k)); const h = n < 0 ? hits[hits.length + n] : hits[Math.min(n, hits.length - 1)]; if (!h) throw new Error('word ' + k); return end ? h[2] : h[1]; };
export const NF = NFW;
const B = {
  one: w('one', 0), four: w('four', 0), it: w('it', 0), seventeen: w('seventeen', 0), concord: w('concord', 0), young: w('young', 0), levi: w('levi', 0), sun: w('sun', 0), every: w('every', 0), day: w('day', 0),
  so: w('so', 0), pine: w('pine', 0), mirror: w('mirror', 0), inside: w('inside', 0), extra: w('extra', 0), four2: w('four', 1), morning: w('morning', 0),
  want: w('want', 1), toobad: w('too', 0), want2: w('want', 2), five: w('five', 0), impossible: w('impossible', 0),
  yousee: w('you', 1), patented: w('patented', 0), mass: w('mass', 0), himself: w('himself', 1),
  took: w('took', 0) - 4, sixty: w('sixty', 0), french: w('french', 0), redier: w('redier', 0), patented2: w('patented', 1), set: w('set', 0), eighteen: w('eighteen', 0),
  finally: w('finally', 0), pick: w('pick', 0), wake: w('wake', 1),
  so2: w('so', 1), snooze: w('snooze', 0), settings: w('settings', 0), opinion: w('opinion', 0), get: w('get', 0), up: w('up', -1),
};
// [f0, f1, id, set]
const SH = [
  [0, B.four - 2, 'hook', 'bedNight'],          // The first American alarm clock could only ring at one time.
  [B.four - 2, B.it - 3, 'wake', 'bedNight'],    // Four A.M.
  [B.it - 3, B.young - 3, 'town', 'townNight'],  // It was seventeen eighty-seven, in Concord, New Hampshire.
  [B.young - 3, B.so - 3, 'levi', 'townNight'],  // A young clockmaker named Levi Hutchins wanted to be up and working before the sun. Every single day.
  [B.so - 3, B.inside - 3, 'build', 'shop'],     // So he built himself a clock, in a pine cabinet, with a mirror on the door.
  [B.inside - 3, B.want - 3, 'gear', 'works'],   // Inside, one extra gear rang a bell at four o'clock. Every morning.
  [B.want - 3, B.yousee - 3, 'toobad', 'bedNight'], // Want to sleep in? Too bad. Want to wake up at five? Impossible.
  [B.yousee - 3, B.took - 3, 'yousee', 'shopNight'], // You see, Levi never patented it, and never tried to mass-produce it. He built it just for himself.
  [B.took - 3, B.patented2 - 3, 'redier', 'paris'],  // It took about sixty years before a French clockmaker, Antoine Redier,
  [B.patented2 - 3, B.finally - 3, 'patent', 'paris'], // patented an alarm you could actually set, in eighteen forty-seven.
  [B.finally - 3, B.so2 - 3, 'finally', 'paris'],   // Finally, you could pick your own wake-up time.
  [B.so2 - 3, NF, 'payoff', 'townDawn'],            // So America's first alarm clock had no snooze, no settings... and just one opinion about when you should get up.
];
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['al', segAt(f)[3]];
export const SHOTS_AL = SH;

// ---------- places (set-local -> world)
const O = { town: [-180000, 0, 0], bedroom: [-180000, 0, 800], shop: [-182500, 0, 0], works: [-182500, 0, 800], paris: [-182500, 0, 1600] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const TNa = at(O.town), BDa = at(O.bedroom), SPa = at(O.shop), WKa = at(O.works), PRa = at(O.paris);
const CX = CAB.x, CY = CAB.y + 0.6, CZ = CAB.z + 0.12;  // bedroom clock dial centre
const RINGS = { hook: [], wake: [B.four], gear: [B.four2, B.morning + 30], toobad: [B.toobad, B.impossible], finally: [B.wake + 4], payoff: [B.up] };
const lastRing = (f, k) => (RINGS[k] || []).filter((s) => s <= f).pop() ?? -1;
const rng = (f, s0, n = 26) => (s0 >= 0 && f >= s0 && f < s0 + n ? 1 - (f - s0) / n : 0);
const chatter = (f, r0) => (r0 >= 0 && f >= r0 && f < r0 + 24 ? 0.5 + 0.5 * Math.sin((f - r0) * 2.2) : 0);

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(BDa(CX + 0.05, CY + 0.02, CZ + 0.62), BDa(CX, CY, CZ), 40, 2.6, BDa(CX, CY, CZ + 0.02)),
  wake: C(BDa(0.0, 1.5, 2.4), BDa(-1.9, 1.0, -1.7), 50, 1.2, BDa(-2.3, 1.0, -1.9)),
  town: C(TNa(-0.6, 5.5, 12), TNa(0.6, 3.6, -12), 50, 0.6, TNa(1, 2.5, -4)),
  levi: C(TNa(0.9, 1.35, 4.0), TNa(3.7, 1.8, -2.4), 48, 1.2, TNa(3.6, 1.5, -2.6)),
  build: C(SPa(-0.2, 1.55, 3.0), SPa(-0.2, 1.3, -2.4), 46, 1.4, SPa(-0.2, 1.3, -2.0)),
  gear: C(WKa(0.6, 3.4, 10.5), WKa(0.4, 3.6, 0), 50, 1.2, WKa(0, 3.2, 0)),
  toobad: C(BDa(-0.4, 1.45, 2.2), BDa(-2.1, 1.05, -1.8), 50, 1.4, BDa(-2.3, 0.95, -1.9)),
  yousee: C(SPa(-0.1, 1.6, 3.0), SPa(-0.05, 1.35, -2.4), 48, 1.4, SPa(-0.3, 1.35, -2.0)),
  redier: C(PRa(0.3, 1.5, 2.6), PRa(-0.1, 1.3, -1.6), 50, 1.4, PRa(-0.2, 1.3, -1.4)),
  patent: C(PRa(1.2, 2.1, 0.2), PRa(0.95, 2.25, -3.1), 44, 1.6, PRa(0.95, 2.3, -3.1)),
  finally: C(PRa(0.17, 1.13, -0.42), PRa(0.1, 1.08, -0.85), 38, 3.0, PRa(0.1, 1.08, -0.82)),
  payoff: C(TNa(-1.6, 1.5, 7.6), TNa(0.4, 2.4, -10), 50, 0.8, TNa(-1.6, 1.4, 2.4)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.0, wake: 0.08, town: 0.1, levi: 0.1, build: 0.1, gear: 0.08, toobad: 0.08, yousee: 0.12, redier: 0.1, patent: 0.12, finally: 0.0, payoff: 0.06 };
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function cam(k, f) {
  const s = segAt(f); let c = push(V[k] || V.hook, PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const to = (p, l, fp, f0, f1, fov) => { const t = sm(f0, f1, f); c = { ...c, p: lerp3(c.p, p, t), l: lerp3(c.l, l, t), fp: lerp3(c.fp, fp || l, t), fov: fov ? c.fov + (fov - c.fov) * t : c.fov }; };
  if (k === 'hook') { const t = sm(0, B.four - 2, f); c = { ...c, p: lerp3(c.p, BDa(CX + 0.35, CY - 0.05, CZ + 1.7), t * t), l: lerp3(c.l, BDa(CX, CY - 0.12, CZ), t), fp: lerp3(c.fp, BDa(CX, CY - 0.1, CZ + 0.05), t), cInf: c.cInf - 0.8 * t };
    punch(B.one, B.one + 6, 0.06); }
  if (k === 'wake') { shake(B.four, B.four + 18, 0.08); punch(B.four, B.four + 6, 0.1); kick(B.four, 0.08); }
  if (k === 'town') { const t = sm(s[0], B.concord, f); c = { ...c, p: lerp3(c.p, TNa(-0.6, 1.8, 10), t), l: lerp3(c.l, TNa(0.6, 3.0, -12), t) }; punch(B.seventeen, B.seventeen + 6, 0.06); punch(B.concord, B.concord + 6, 0.05); }
  if (k === 'levi') { punch(B.levi, B.levi + 6, 0.08); to(TNa(1.2, 0.9, 3.4), TNa(3.6, 2.6, -2.6), TNa(3.6, 1.5, -2.6), B.sun - 30, B.sun - 4); punch(B.every, B.every + 5, 0.05); punch(B.day, B.day + 6, 0.08); kick(B.day, 0.05); }
  if (k === 'build') { punch(B.pine, B.pine + 6, 0.06); to(SPa(0.35, 1.45, 0.6), SPa(0.2, 1.35, -2.6), SPa(0.2, 1.35, -2.6), B.mirror - 14, B.mirror + 4); punch(B.mirror, B.mirror + 6, 0.05); }
  if (k === 'gear') { to(WKa(0.3, 4.5, 4.6), WKa(0.2, 4.6, 0), WKa(0, 4.8, 0.3), B.extra - 4, B.four2 - 6, 46); punch(B.four2, B.four2 + 6, 0.1); shake(B.four2, B.four2 + 16, 0.06); to(WKa(0.6, 3.6, 9.5), WKa(0.4, 3.6, 0), WKa(0, 3.2, 0), B.morning - 6, B.morning + 14, 50); }
  if (k === 'toobad') { punch(B.toobad, B.toobad + 6, 0.1); shake(B.toobad, B.toobad + 16, 0.08); c = { ...c, roll: 0.12 * sm(B.want2, B.five, f) - 0.2 * sm(B.impossible, B.impossible + 6, f) }; punch(B.impossible, B.impossible + 6, 0.12); shake(B.impossible, B.impossible + 14, 0.06); }
  if (k === 'yousee') { punch(B.patented, B.patented + 6, 0.06); punch(B.mass, B.mass + 6, 0.06); to(SPa(-0.3, 1.5, 1.4), SPa(-0.25, 1.35, -2.4), SPa(-0.3, 1.35, -2.0), B.himself - 20, B.himself + 6); }
  if (k === 'redier') { punch(B.sixty, B.sixty + 6, 0.05); punch(B.french, B.french + 6, 0.05); punch(B.redier, B.redier + 6, 0.08); }
  if (k === 'patent') { punch(B.patented2, B.patented2 + 6, 0.08); kick(B.patented2, 0.05); to(PRa(0.5, 1.25, 0.1), PRa(0.1, 1.1, -0.85), PRa(0.1, 1.1, -0.85), B.set - 16, B.set + 4, 42); punch(B.eighteen, B.eighteen + 6, 0.06); }
  if (k === 'finally') { punch(B.pick, B.pick + 6, 0.04); punch(B.wake + 4, B.wake + 10, 0.08); shake(B.wake + 4, B.wake + 16, 0.01); }
  if (k === 'payoff') { punch(B.snooze, B.snooze + 6, 0.05); punch(B.settings, B.settings + 6, 0.05); punch(B.opinion, B.opinion + 6, 0.08); to(TNa(-0.7, 1.8, 9.2), TNa(0.2, 3.0, -12), TNa(0.3, 1.5, -1.0), B.get - 6, NF - 4, 50); kick(B.up, 0.1); shake(B.up, B.up + 14, 0.08); }
  return c;
}
const HARD = new Set([SH[2][0], SH[8][0], SH[11][0]]);  // time jumps: 1787 town, 1847 Paris, back to Concord at dawn (white flashes)
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0; const F = [[B.four, 0.5, 10], [SH[2][0], 0.85, 14], [B.seventeen, 0.25, 6], [SH[3][0], 0.35, 8], [B.day, 0.25, 6], [SH[4][0], 0.4, 10], [SH[5][0], 0.45, 10], [B.four2, 0.4, 8],
    [SH[6][0], 0.4, 10], [B.toobad, 0.35, 8], [B.impossible, 0.3, 6], [SH[7][0], 0.45, 12], [SH[8][0], 0.85, 14], [B.patented2, 0.3, 8], [SH[10][0], 0.35, 8], [B.wake + 4, 0.3, 8], [SH[11][0], 0.8, 14], [B.opinion, 0.25, 6], [B.up, 0.4, 10]];
  for (const [c, a, n] of F) if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state
export function worldAt(f, wo) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (wo[n]) wo[n].visible = false;
  wo.dc.visible = false; wo.curRoom = null; wo.rooms.show(wo, null);
  const A = wo.al; if (!A) return;
  const r0 = lastRing(f, k), ch = chatter(f, r0), sk = r0 >= 0 ? Math.max(0, 1 - (f - r0) / 22) : 0;
  A.setRing(r0, sk);
  // bedroom clock: 3:59 ticking to 4:00 on 'four'; rings; in 'toobad' the minute hand is pushed toward five and snaps back
  if (k === 'hook' || k === 'wake' || k === 'toobad') { let min = k === 'hook' ? 239 + 0.9 * sm(0, B.four - 6, f) : 240 + Math.max(0, f - B.four) / 1800;
    if (k === 'toobad') { const p5 = sm(B.five - 14, B.five + 6, f) * (1 - sm(B.impossible, B.impossible + 4, f)); min = 241 + 58 * p5; }
    A.setBedCab({ min, door: 0, strike: ch, shake: sk, f }); }
  if (k === 'town') A.setWindow(f > B.concord ? sm(B.concord, B.concord + 4, f) : 0, 0);
  if (k === 'levi') A.setWindow(1, f > B.levi ? 1 : 0);
  if (k === 'payoff') A.setWindow(1, 1);
  if (k === 'build') { A.setShopCab({ min: 600 + (f - SH[4][0]) / 30, door: 0.75 * (1 - sm(B.mirror - 8, B.mirror + 4, f)), strike: 0 }); A.setLabels(f >= B.mirror ? 2 : f >= B.pine ? 1 : 0); }
  if (k === 'yousee') { A.setShopCab({ min: 1200 + (f - SH[7][0]) / 30, door: 0, strike: 0 }); A.setLabels(0); }
  if (k === 'gear') { const h = 3.4 + 0.6 * sm(SH[5][0], B.four2, f) + 12 * sm(B.morning - 4, B.morning + 30, f); const dd = Math.abs((((h - 4) % 12) + 18) % 12 - 6); const pinNear = Math.max(0, 1 - dd * 4);
    A.setWorks({ hour: h, trip: Math.min(1, pinNear * 1.2), strike: ch, shake: sk, f, labels: f >= B.four2 ? 3 : f >= B.extra ? 2 : 0 }); }
  if (k === 'redier' || k === 'patent') A.setBedside({ alarm: 5 + 1.5 * sm(B.set - 10, B.set + 10, f), min: 300 + (f - SH[8][0]) / 30, shake: 0 });
  if (k === 'finally') { const a = 5 + sm(B.finally, B.finally + 8, f) + sm(B.pick - 4, B.pick + 4, f) + sm(B.pick + 10, B.pick + 18, f) + 0.5 * sm(B.wake - 8, B.wake, f); A.setBedside({ alarm: a, min: 300, knob: a * 2.2, shake: sk, f }); }
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const ROO = (f, pos, opts = {}, extra = {}) => person(f, 'ROOSTY', 9, pos, { t: f, pose: 'stand', ...opts }, { s: 0.36, ...extra });
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = []; const r0 = lastRing(f, k);
  if (k === 'wake') { const up = f >= B.four + 2;
    A.push(P(f, 'AL_LEVIN', 11, BDa(-2.4, 0.42, -2.0), { mode: 'sit', expr: up ? (f < B.four + 20 ? 'excited' : 'happy') : 'happy', sleep: !up, cheer: up && f > B.four + 10 ? wav(f, 0) : undefined, view: '34L' }, { blob: false }));
    A.push(ROO(f, BDa(-1.6, 0.74, -0.2), { expr: f < B.four ? 'sleep' : 'shock', pose: f < B.four ? 'stand' : 'ears', ring: rng(f, r0) }, { s: 0.22 })); }
  if (k === 'levi') { A.push(P(f, 'AL_LEVIC', 21, TNa(3.6, 0, -3.2), { expr: f < B.levi ? 'smile' : f < B.sun ? 'happy' : f < B.every ? 'determined' : 'excited', prop: 'lantern', view: '34L', point: f > B.sun - 6 && f < B.every ? 1 : undefined }));
    A.push(ROO(f, TNa(3.9, 0.62, -1.0), { expr: f < B.every ? 'sleep' : f < B.day ? 'sly' : 'shock', zz: f < B.every ? 1 : 0, flip: true }, { s: 0.3 })); }
  if (k === 'build') { A.push(P(f, 'AL_LEVI', 31, SPa(-0.75, 0, -1.9), { expr: f < B.pine ? 'determined' : f < B.mirror ? 'smile' : 'proud', prop: f < B.mirror - 10 ? 'mallet' : undefined, view: '34R', point: f >= B.mirror ? 1 : undefined }));
    A.push(ROO(f, SPa(0.75, 1.0, -2.5), { expr: f < B.mirror ? 'smile' : 'love', pose: f < B.mirror ? 'stand' : 'flap', flip: true }, { s: 0.22 })); }
  if (k === 'toobad') A.push(ROO(f, BDa(-2.4, 0.74, -1.9), { expr: f < B.toobad ? 'sleep' : f < B.want2 ? 'dazed' : f < B.impossible ? 'sly' : 'shock', pose: f < B.toobad ? 'stand' : f < B.want2 ? 'ears' : f < B.impossible ? 'point' : 'flap', ring: rng(f, r0), zz: f < B.toobad ? 1 : 0, flip: f >= B.want2 && f < B.impossible }, { s: 0.3 }));
  if (k === 'yousee') { A.push(P(f, 'AL_LEVI', 31, SPa(-0.75, 0, -1.9), { expr: f < B.patented ? 'smile' : f < B.himself ? 'calm' : 'love', view: '34R', prop: f < B.himself - 4 ? 'candle' : undefined, hip: f >= B.himself ? 1 : undefined }));
    A.push(ROO(f, SPa(0.5, 1.0, -2.5), { expr: f < B.mass ? 'smile' : f < B.himself ? 'sly' : 'love', flip: true }, { s: 0.22 })); }
  if (k === 'redier') { A.push(P(f, 'AL_REDIER', 41, PRa(-0.55, 0, -1.9), { expr: f < B.french ? 'smile' : f < B.redier ? 'proud' : 'smug', view: '34R', prop: f >= B.redier ? 'bclock' : undefined, point: f < B.redier && f > B.french ? 1 : undefined }));
    A.push(ROO(f, PRa(0.5, 0.94, -0.75), { expr: f < B.redier ? 'smile' : 'love', pose: f < B.redier ? 'stand' : 'flap', flip: true }, { s: 0.2 })); }
  if (k === 'payoff') { const up = f >= B.up;
    A.push(P(f, 'AL_LEVIC', 21, TNa(0.45, 0, -1.0), { expr: f < B.opinion ? 'happy' : up ? 'laugh' : 'smug', view: '34L', prop: 'lantern', cheer: up ? wav(f, 1) : undefined }));
    A.push(ROO(f, TNa(-1.6, 1.0, 2.2), { expr: f < B.snooze ? 'dazed' : f < B.opinion ? 'sad' : f < B.up ? 'crow' : 'dazed', pose: f < B.opinion ? 'stand' : f < B.up ? 'flap' : 'ears', ring: rng(f, r0) }, { s: 0.3 })); }
  return A;
}

// ---------- effects
const ASP = 1080 / 1920; let CURF = 0;
function SB(k, x, y, z) { const c = cam(k, CURF), n = (v) => { const l = Math.hypot(...v); return v.map((u) => u / l); }, fw = n([c.l[0] - c.p[0], c.l[1] - c.p[1], c.l[2] - c.p[2]]), r = n([-fw[2], 0, fw[0]]), u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]], t = Math.tan(c.fov * Math.PI / 360);
  return [0, 1, 2].map((i) => c.p[i] + fw[i] * z + r[i] * x * t * ASP * z + u[i] * y * t * z); }
const SWD = (k, wd, z) => 2 * wd * z * Math.tan(cam(k, CURF).fov * Math.PI / 360) * ASP;
const board = (f, f0, lines, pos, size, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'board', lines, pos, size: size * back(f0, f0 + 12, f) }); };
const sboard = (f, f0, lines, k, x, y, z, wd, F2, f1) => board(f, f0, lines, SB(k, x, y, z), SWD(k, wd, z), F2, f1);
const sburst = (f, f0, k, x, y, z, wd, F2, col = '#fff3b0', n = 12) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'burst', t: (f - f0) / n, pos: SB(k, x, y, z * 1.1), size: SWD(k, wd, z * 1.1), col, rays: 10 }); };
const stars = (f, f0, k, x, y, z, wd, F2, per = 30) => { if (f >= f0) F2.push({ fx: 'stars', t: ((f - f0) / per) % 1, pos: SB(k, x, y, z), size: SWD(k, wd, z) * back(f0, f0 + 10, f) }); };
const qmark = (f, f0, k, x, y, z, wd, F2) => { if (f >= f0) F2.push({ fx: 'qmark', pos: SB(k, x, y, z), size: SWD(k, wd, z) * back(f0, f0 + 8, f) }); };
const stamp = (f, f0, lines, k, x, y, z, wd, F2, f1 = 1e9) => { if (f > f0 && f < f1) { const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos: SB(k, x, y, z), size: SWD(k, wd, z) * (1.6 - 0.6 * t * t), op: Math.min(1, t * 2) }); } };
const bubble = (f, f0, lines, k, x, y, z, wd, tail, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'bubble', lines, tail, pos: SB(k, x, y, z), size: SWD(k, wd, z) * back(f0, f0 + 8, f) }); };
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  const Z = { hook: 0.36, wake: 2.0, levi: 2.2, build: 1.4, toobad: 2.0, yousee: 1.8, redier: 1.8, patent: 1.4, finally: 0.3 }[k] || 2.4;
  if (k === 'hook') { sboard(f, -14, ["AMERICA'S FIRST", 'ALARM CLOCK'], 'hook', 0.0, 0.66, Z, 0.52, F2, B.one - 2); stamp(f, B.one, ['ONE TIME ONLY'], 'hook', 0.0, 0.64, Z, 0.5, F2); qmark(f, B.one + 4, 'hook', 0.55, 0.42, Z, 0.1, F2); }
  if (k === 'wake') { stamp(f, B.four, ['4:00 A.M.!'], 'wake', 0.0, 0.64, Z, 0.46, F2); sburst(f, B.four, 'wake', 0.25, 0.25, Z, 0.5, F2); sboard(f, B.four + 14, ['DING-DING-', 'DING!'], 'wake', 0.0, -0.4, Z, 0.36, F2); }
  if (k === 'town') { stamp(f, B.seventeen, ['1787'], 'town', 0.0, 0.64, 3, 0.34, F2, B.concord - 2); sboard(f, B.concord, ['CONCORD,', 'NEW HAMPSHIRE'], 'town', 0.0, 0.66, 3, 0.5, F2); }
  if (k === 'levi') { sboard(f, B.levi - 2, ['LEVI HUTCHINS', 'CLOCKMAKER'], 'levi', 0.0, 0.66, Z, 0.5, F2, B.sun - 6); stamp(f, B.sun - 4, ['BEFORE THE SUN'], 'levi', 0.0, 0.64, Z, 0.52, F2, B.every); sboard(f, B.every, ['EVERY.', 'SINGLE. DAY.'], 'levi', 0.0, 0.66, Z, 0.44, F2); sburst(f, B.day, 'levi', 0.0, 0.62, Z, 0.5, F2); }
  if (k === 'build') { sboard(f, s[0] + 4, ['HE BUILT', 'HIS OWN'], 'build', 0.0, 0.66, Z, 0.4, F2, B.pine - 2); stamp(f, B.pine, ['PINE CABINET'], 'build', 0.0, 0.64, Z, 0.5, F2, B.mirror - 2); stamp(f, B.mirror, ['+ A MIRROR'], 'build', 0.0, 0.64, Z, 0.44, F2); stars(f, B.mirror + 2, 'build', 0.18, 0.08, Z, 0.25, F2, 24); }
  if (k === 'gear') { sboard(f, s[0] + 3, ['INSIDE...'], 'gear', 0.0, 0.68, 3, 0.3, F2, B.four2 - 2); stamp(f, B.four2, ['RING AT 4!'], 'gear', 0.0, 0.64, 3, 0.4, F2, B.morning - 2); sburst(f, B.four2, 'gear', 0.3, 0.3, 3, 0.5, F2); sboard(f, B.morning, ['EVERY', 'MORNING'], 'gear', 0.0, 0.66, 3, 0.4, F2); sburst(f, B.morning + 30, 'gear', 0.0, 0.3, 3, 0.4, F2); }
  if (k === 'toobad') { sboard(f, s[0] + 2, ['SLEEP IN?'], 'toobad', 0.0, 0.68, Z, 0.36, F2, B.toobad - 1); stamp(f, B.toobad, ['TOO BAD!'], 'toobad', 0.0, 0.64, Z, 0.42, F2, B.want2 - 1); sburst(f, B.toobad, 'toobad', 0.3, 0.2, Z, 0.5, F2);
    sboard(f, B.want2, ['WAKE AT 5?'], 'toobad', 0.0, 0.68, Z, 0.38, F2, B.impossible - 1); stamp(f, B.impossible, ['IMPOSSIBLE'], 'toobad', 0.0, 0.64, Z, 0.46, F2); }
  if (k === 'yousee') { sboard(f, s[0] + 3, ['YOU SEE...'], 'yousee', 0.0, 0.68, Z, 0.32, F2, B.patented - 2); stamp(f, B.patented, ['NO PATENT'], 'yousee', 0.0, 0.64, Z, 0.4, F2, B.mass - 2); stamp(f, B.mass, ['NO FACTORY'], 'yousee', 0.0, 0.64, Z, 0.42, F2, B.himself - 6);
    sboard(f, B.himself - 4, ['JUST FOR', 'LEVI'], 'yousee', 0.0, 0.66, Z, 0.38, F2); stars(f, B.himself, 'yousee', 0.0, 0.1, Z, 0.4, F2, 24); }
  if (k === 'redier') { sboard(f, s[0] + 4, ['~60 YEARS', 'LATER...'], 'redier', 0.0, 0.66, Z, 0.42, F2, B.french - 2); sboard(f, B.french, ['PARIS'], 'redier', 0.0, 0.68, Z, 0.3, F2, B.redier - 2); sboard(f, B.redier, ['ANTOINE', 'REDIER'], 'redier', 0.0, 0.66, Z, 0.42, F2); }
  if (k === 'patent') { stamp(f, B.patented2, ['PATENTED!'], 'patent', 0.0, 0.64, Z, 0.42, F2, B.set - 4); sburst(f, B.patented2, 'patent', 0.0, 0.1, Z, 0.5, F2); sboard(f, B.set - 2, ['AN ALARM', 'YOU CAN SET'], 'patent', 0.0, 0.66, Z, 0.46, F2, B.eighteen - 2); stamp(f, B.eighteen, ['1847'], 'patent', 0.0, 0.64, Z, 0.32, F2); }
  if (k === 'finally') { sboard(f, s[0] + 3, ['FINALLY!'], 'finally', 0.0, 0.68, Z, 0.34, F2, B.pick - 2); sboard(f, B.pick, ['5? 6? 7?', 'YOU PICK!'], 'finally', 0.0, 0.66, Z, 0.42, F2); sburst(f, B.wake + 4, 'finally', 0.0, 0.0, Z, 0.5, F2); }
  if (k === 'payoff') { stamp(f, B.snooze, ['NO SNOOZE'], 'payoff', 0.0, 0.64, 3, 0.42, F2, B.settings - 1); stamp(f, B.settings, ['NO SETTINGS'], 'payoff', 0.0, 0.64, 3, 0.44, F2, B.opinion - 2);
    stamp(f, B.opinion, ['GET UP:', '4 A.M.'], 'payoff', 0.0, 0.62, 3, 0.4, F2); sburst(f, B.up, 'payoff', 0.0, 0.62, 3, 0.5, F2); stars(f, B.up + 4, 'payoff', -0.3, 0.1, 3, 0.4, F2, 24); }
  return F2;
}
