// [EF-story] "The Eiffel Tower was only meant to stand for 20 years" timeline (63.06 s voice, 1892 f @ 30 fps).
// Sets: ef_sets.js (fair / office / studio / radio) through setAt. Pattern: story_nintendo.js (slow push per shot, zoom-through whips on
// cuts, screen-pinned boards / bursts / stamps, punch-ins on beats). TOURI (a little living iron tower) is the sidekick and the motif:
// shocked by the demolition sign in the hook, sad at "how do you save it?", proud as "the perfect antenna", cheering at the payoff.
import * as S from './story.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]                                   narration (word frames from work/words_frames.txt)
const SH = [
  [0, 110, 'hook', 'fairDusk'],       // The Eiffel Tower was supposed to be torn down. In 1909.  (torn 51, down 57, 1909 76)
  [110, 214, 'fair', 'fair89'],       // Gustave Eiffel built it for the 1889 World's Fair in Paris,  (Eiffel 117, 1889 148, World's 166, Paris 196)
  [214, 313, 'tall', 'fair89'],       // 300 meters of iron, the tallest structure on Earth.  (300 214, iron 248, tallest 267, Earth 296)
  [313, 423, 'permit', 'office89'],   // But his permit only ran for 20 years. After that, the city could pull it down,  (permit 320, 20 349, city 393, pull 403)
  [423, 478, 'crowd', 'fairDusk'],    // and plenty of Parisians wanted that.  (plenty 429, Parisians 445)
  [478, 610, 'artists', 'studio87'],  // In 1887, famous artists signed a protest calling it useless and monstrous,  (1887 481, artists 519, protest 544, useless 571, monstrous 592)
  [610, 674, 'chimney', 'chimney'],   // a giant black factory chimney.  (giant 618, black 628, factory 638, chimney 654)
  [674, 744, 'how', 'fairNight'],     // So how do you save a tower everyone hates?  (save 694, hates 725)
  [744, 801, 'yousee', 'topNight'],   // You see, Eiffel made it useful.  (Eiffel 761, useful 778)
  [801, 924, 'science', 'topDay'],    // He put a weather station at the top and dropped objects down a cable to study air resistance.  (weather 809, dropped 846, cable 876, air 895)
  [924, 1065, 'wireless', 'fairNight'], // Then came radio. In 1898, a wireless signal flew from the tower to the Pantheon.  (radio 937, 1898 959, wireless 991, flew 1010, Pantheon 1045)
  [1065, 1157, 'army', 'fairDusk'],   // Eiffel even paid for the army's radio experiments himself.  (paid 1079, army's 1089, experiments 1104, himself 1126)
  [1157, 1240, 'antenna', 'fairNight'], // Suddenly, the ugly tower was the perfect antenna.  (ugly 1167, perfect 1198, antenna 1208)
  [1240, 1336, 'renew', 'office10'],  // So in 1910, Paris renewed his permit instead of tearing it down.  (1910 1240, renewed 1271, instead 1296, tearing 1314)
  [1336, 1491, 'marne', 'radio14'],   // And in 1914, its antenna caught German radio messages that helped France at the Battle of the Marne.  (1914 1342, caught 1383, German 1392, helped 1432, Battle 1457, Marne 1470)
  [1491, 1630, 'twist', 'fairToday'], // Here's the twist. The tower that was meant to last 20 years still carries antennas today.  (twist 1500, 20 1549, still 1570, antennas 1595, today 1606)
  [1630, 1721, 'heli', 'fairToday'],  // In 2022, a new one made it 6 meters taller.  (2022 1630, new 1661, 6 1680, taller 1696)
  [1721, 1892, 'payoff', 'fairDawn'], // The tower Paris wanted gone was saved by something nobody can see. Radio waves.  (gone 1750, saved 1759, nobody 1791, see 1803, Radio 1836)
];
export const NF = 1892;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['ef', segAt(f)[3]];

// ---------- places (set-local -> world)
const O = { fair: [-76000, 0, 0], office: [-78500, 0, 0], studio: [-78500, 0, 800], radio: [-78500, 0, 1600] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const FAa = at(O.fair), OFa = at(O.office), SUa = at(O.studio), RAa = at(O.radio);
const FA = (x, z, h = 0) => FAa(x, h, z), OF = (x, z, h = 0) => OFa(x, h, z), SU = (x, z, h = 0) => SUa(x, h, z), RA = (x, z, h = 0) => RAa(x, h, z);
const TZ = -90, TOP = 277.5, Z0 = 330; // tower centre z, summit floor, the promenade spot ~420 m in front of the tower
const DX = -0.4, DZ = -1.2, TX = -0.6, TZ2 = 0.2, BZ = -1.9; // office desk / studio table / radio bench

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(FAa(-19.6, 1.35, 0.2), FAa(-23.2, 2.0, -8.6), 48, 1.0, FAa(-22.6, 1.2, -7.0)),
  fair: C(FAa(0.9, 1.0, Z0 + 4.6), FAa(-0.5, 96, TZ), 48, 1.2, FAa(-0.4, 1.2, Z0 + 0.3)),
  tall: C(FAa(34, 2.0, 70), FAa(0, 22, TZ), 46, 0.3, FAa(0, 40, TZ)),
  permit: C(OFa(1.4, 1.5, 2.3), OFa(-0.3, 1.1, -1.4), 46, 1.3, OFa(-0.3, 1.1, -1.7)),
  crowd: C(FAa(0.4, 1.05, Z0 + 6.8), FAa(-0.4, 96, TZ), 48, 1.0, FAa(0, 1.3, Z0 + 1.4)),
  artists: C(SUa(1.5, 1.6, 3.3), SUa(-0.5, 0.95, -0.4), 48, 1.3, SUa(-0.6, 0.9, 0.0)),
  chimney: C(SUa(1.05, 1.45, 0.35), SUa(1.47, 1.36, -1.1), 40, 2.4, SUa(1.47, 1.36, -1.1)),
  how: C(FAa(0.6, 0.8, Z0 + 3.6), FAa(0.2, 90, TZ), 48, 1.5, FAa(0.4, 0.6, Z0 - 2.4)),
  yousee: C(FAa(-1.5, TOP + 1.7, TZ + 13.5), FAa(0.2, TOP + 2.2, TZ + 5), 46, 1.0, FAa(0, TOP + 1.2, TZ + 7.2)),
  science: C(FAa(0.6, TOP + 2.0, TZ + 12.6), FAa(-3.0, TOP + 1.8, TZ + 7), 46, 1.0, FAa(-2.0, TOP + 1.2, TZ + 7.4)),
  wireless: C(FAa(70, 150, 540), FAa(20, 240, 0), 44, 0.3, FAa(0, 260, TZ)),
  army: C(FAa(34.4, 1.5, -12.2), FAa(30.9, 1.9, -20.5), 46, 1.2, FAa(31.4, 1.2, -18.0)),
  antenna: C(FAa(0.8, 0.8, Z0 + 3.7), FAa(0.2, 92, TZ), 48, 1.4, FAa(0.5, 0.6, Z0 - 2.4)),
  renew: C(OFa(1.0, 1.45, 1.7), OFa(-0.3, 1.0, -1.3), 44, 1.4, OFa(-0.2, 0.95, -1.2)),
  marne: C(RAa(2.0, 1.5, 0.6), RAa(-0.7, 1.6, -2.5), 46, 1.4, RAa(0.5, 1.1, -1.2)),
  twist: C(FAa(1.0, 1.0, Z0 + 6.2), FAa(-0.4, 96, TZ), 48, 1.1, FAa(0.4, 1.2, Z0 + 1.2)),
  heli: C(FAa(19, 324, TZ + 34), FAa(0, 330, TZ), 44, 0.5, FAa(0, 330, TZ)),
  payoff: C(FAa(0.8, 0.8, Z0 + 3.5), FAa(0.2, 90, TZ), 48, 1.4, FAa(0.5, 0.6, Z0 - 2.4)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.08, fair: 0.08, tall: 0, permit: 0.1, crowd: 0.06, artists: 0.1, chimney: 0.14, how: 0.08, yousee: 0.1, science: 0.08, wireless: 0, army: 0.1, antenna: 0.06, renew: 0.1, marne: 0.1, twist: 0.06, heli: 0.08, payoff: 0 };
const base = (k) => V[k] || V.hook;
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const look = (d, f0, f1, fd) => { const t = sm(f0, f1, f); c = { ...c, l: add3(c.l, d.map((x) => x * t)), fp: add3(c.fp, (fd || d).map((x) => x * t)) }; };
  const orbit = (a, f0, f1) => { const t = sm(f0, f1, f) - 0.5, an = a * t, dx = c.p[0] - c.l[0], dz = c.p[2] - c.l[2]; c = { ...c, p: [c.l[0] + dx * Math.cos(an) - dz * Math.sin(an), c.p[1], c.l[2] + dx * Math.sin(an) + dz * Math.cos(an)] }; };
  if (k === 'hook') { const tu = 1 - sm(18, 50, f); c = { ...c, l: lerp3(c.l, FAa(-30, 70, -60), tu), fp: lerp3(c.fp, FAa(-30, 40, -40), tu), cInf: 1.0 - 0.6 * tu }; orbit(0.12, 0, 110); punch(51, 57, 0.08); punch(76, 82, 0.14); kick(76, 0.6); shake(77, 92, 0.25); }
  if (k === 'fair') { punch(148, 154, 0.06); punch(166, 172, 0.06); }
  if (k === 'tall') { const t = sm(214, 300, f); c = { ...c, p: lerp3(FAa(34, 2.0, 70), FAa(150, 150, 300), t), l: lerp3(FAa(0, 22, TZ), FAa(0, 200, TZ), sm(214, 290, f)), fp: FAa(0, 40 + 200 * t, TZ), cInf: 0.3 }; punch(267, 273, 0.08); kick(296, 3); }
  if (k === 'permit') { punch(349, 355, 0.08); punch(403, 409, 0.1); }
  if (k === 'crowd') { punch(445, 451, 0.06); }
  if (k === 'artists') { orbit(0.25, 478, 610); punch(481, 487, 0.06); punch(571, 577, 0.08); punch(592, 598, 0.1); kick(592, 0.03); }
  if (k === 'chimney') { punch(654, 660, 0.12); shake(655, 668, 0.006); }
  if (k === 'how') { punch(694, 700, 0.06); punch(725, 731, 0.08); }
  if (k === 'yousee') { punch(778, 784, 0.1); }
  if (k === 'science') { punch(809, 815, 0.06); look([-1.6, -0.8, 0.6], 846, 880, [-2, -0.8, 0.6]); look([1.6, 0.8, -0.6], 896, 920, [2, 0.8, -0.6]); }
  if (k === 'wireless') { const t = sm(990, 1050, f); c = { ...c, l: lerp3(FAa(20, 240, 0), FAa(175, 75, 280), t), fp: lerp3(FAa(0, 260, TZ), FAa(220, 50, 250), t) }; punch(959, 965, 0.05); punch(1045, 1051, 0.08); }
  if (k === 'army') { punch(1079, 1085, 0.08); punch(1126, 1132, 0.08); }
  if (k === 'antenna') { punch(1198, 1204, 0.08); kick(1208, 0.5); }
  if (k === 'renew') { punch(1240, 1246, 0.06); punch(1282, 1288, 0.12); kick(1282, 0.03); shake(1283, 1294, 0.012); }
  if (k === 'marne') { orbit(0.25, 1336, 1491); punch(1342, 1348, 0.06); punch(1392, 1398, 0.08); punch(1470, 1476, 0.1); }
  if (k === 'twist') { punch(1497, 1503, 0.08); const t = sm(1560, 1625, f); c = { ...c, p: lerp3(c.p, FAa(70, 250, 160), t), l: lerp3(c.l, FAa(0, 305, TZ), t), fp: lerp3(c.fp, FAa(0, 305, TZ), t), cInf: 1.1 - 0.7 * t }; }
  if (k === 'heli') { orbit(0.3, 1630, 1721); punch(1680, 1686, 0.08); kick(1696, 1.5); }
  if (k === 'payoff') { const t = sm(1765, 1892, f); c = { ...c, p: lerp3(FAa(0.8, 0.8, Z0 + 3.5), FAa(90, 70, Z0 + 260), t), l: lerp3(FAa(0.2, 90, TZ), FAa(0, 150, TZ), t), fp: lerp3(FAa(0.5, 0.6, Z0 - 2.4), FAa(0, 150, TZ), t), cInf: 1.4 - 1.1 * t };
    c = push(c, 0.08, 1721, 1765, f); punch(1759, 1765, 0.06); punch(1836, 1842, 0.06); }
  return c;
}
const HARD = new Set([]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[51, 0.25, 6], [76, 0.4, 8], [110, 0.85, 12], [214, 0.3, 8], [267, 0.3, 6], [313, 0.4, 10], [403, 0.25, 6], [423, 0.3, 8], [478, 0.85, 12], [571, 0.25, 6], [592, 0.3, 6], [610, 0.3, 8], [654, 0.3, 6], [674, 0.4, 10], [744, 0.5, 12], [801, 0.3, 8], [924, 0.5, 10], [1045, 0.4, 8], [1065, 0.3, 8], [1157, 0.4, 10], [1240, 0.6, 12], [1282, 0.35, 6], [1336, 0.85, 12], [1470, 0.3, 6], [1491, 0.85, 12], [1630, 0.4, 10], [1696, 0.3, 6], [1721, 0.4, 10], [1836, 0.4, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state
export function worldAt(f, w) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const E = w.ef; if (!E) return;
  const o = { demo: k === 'hook' ? 1 : 0 };
  if (k === 'science') o.slide = (f - 846) / 80;
  if (k === 'wireless') { o.waves = sm(930, 950, f); o.pulse = f < 995 ? 0 : 1.0 * sm(995, 1045, f) + (f >= 1045 ? (f - 1045) / 30 : 0); o.radioOn = 1; }
  if (k === 'army') o.radioOn = 1;
  if (k === 'antenna') { o.waves = 0.6 + 0.4 * sm(1190, 1210, f); o.radioOn = 1; }
  if (k === 'twist') o.waves = 0.4 * sm(1595, 1610, f);
  if (k === 'heli') { o.heli = sm(1630, 1700, f) * 1.0; o.newTop = sm(1675, 1700, f); }
  if (k === 'payoff') { o.waves = 0.5 + 0.5 * sm(1830, 1845, f); }
  if (k === 'renew') o.renew = f >= 1282 ? 1 : 0;
  E.setFx(o);
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const TU = (f, pos, opts = {}, extra = {}) => person(f, 'TOURI', 9, pos, { t: f, ...opts }, { s: 0.75, ...extra });
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') { A.push(P(f, 'EF_WORKER', 21, FA(-21.8, -7.0), { expr: f < 51 ? 'determined' : f < 76 ? 'grin' : 'smug', prop: 'sledge', view: '34R', raise: f > 50 && f < 70 ? 1 : undefined }));
    if (f >= 38) A.push(TU(f, FA(-22.6, -4.6), { expr: f < 76 ? 'worried' : 'shock', pose: f < 76 ? 'shrug' : 'shock' }, { s: 0.8 * back(38, 48, f) + 0.001, blob: false })); }
  if (k === 'fair') { A.push(P(f, 'EF_EIFFEL', 11, FA(0.6, Z0 + 0.4), { expr: f < 148 ? 'smile' : 'proud', view: '34R', point: f > 150 && f < 190 ? 1 : undefined, hip: f >= 190 ? 1 : undefined }));
    A.push(P(f, 'EF_LADY', 31, FA(2.0, Z0 - 2.8), { expr: f < 166 ? 'smile' : 'excited', view: '34L' })); A.push(P(f, 'EF_GRUMP', 32, FA(-0.5, Z0 - 4.8), { expr: 'surprised', view: 'back' }));
    const t = sm(110, 214, f); A.push(P(f, 'EF_KID', 33, FA(2.6 - 1.0 * t, Z0 - 8 + 3 * t), { expr: 'excited', view: 'front', cheer: wav(f, 2, 0.3) }, { s: 0.8 })); }
  if (k === 'tall') { if (f < 240) A.push(P(f, 'EF_EIFFEL', 11, FA(12, 40), { expr: 'proud', view: 'back', raise: 1 })); }
  if (k === 'permit') { A.push(P(f, 'EF_CLERK', 41, OF(DX - 0.1, DZ - 0.75), { expr: f < 349 ? 'smug' : f < 403 ? 'thoughtful' : 'sly', view: 'front', prop: 'document', docText: ['PERMIT', '1889-1909'] }));
    A.push(P(f, 'EF_EIFFEL', 11, OF(DX + 1.0, DZ + 0.6), { expr: f < 349 ? 'smile' : f < 403 ? 'worried' : 'nervous', view: '34L' })); }
  if (k === 'crowd') { A.push(P(f, 'EF_GRUMP', 32, FA(-0.5, Z0 + 2.0), { expr: 'angry', view: 'back', raise: 1 })); A.push(P(f, 'EF_LADY', 31, FA(0.9, Z0 + 2.6), { expr: 'angry', view: 'back', raise: f > 445 ? 1 : undefined })); A.push(P(f, 'EF_WRITER', 52, FA(1.7, Z0 + 0.4), { expr: 'mean', view: 'back', point: 1 }));
    A.push(P(f, 'EF_WORKER', 21, FA(-0.8, Z0 - 0.6), { expr: 'smug', view: '34R', prop: 'sledge' })); }
  if (k === 'artists') { const L = f >= 571; A.push(P(f, 'EF_WRITER', 52, SU(TX - 0.9, TZ2 - 0.55), { expr: L ? 'angry' : 'determined', mode: 'sit', prop: 'quill', view: '34R' }, { blob: false }));
    A.push(P(f, 'EF_COMPOSER', 53, SU(TX + 0.85, TZ2 - 0.45), { expr: f < 592 ? 'smug' : 'angry', mode: 'sit', view: '34L' }, { blob: false })); A.push(P(f, 'EF_PAINTER', 54, SU(TX + 0.2, TZ2 - 1.25), { expr: f < 544 ? 'mean' : 'angry', prop: 'palette', view: 'front', raise: f > 592 ? 1 : undefined })); }
  if (k === 'chimney') { A.push(P(f, 'EF_PAINTER', 54, SU(0.55, -1.0), { expr: f < 654 ? 'mean' : 'smug', prop: 'palette', view: '34R', point: f > 640 ? 1 : undefined })); }
  if (k === 'how') { A.push(TU(f, FA(0.4, Z0 - 2.4), { expr: f < 694 ? 'sad' : f < 725 ? 'worried' : 'sad', pose: f < 694 ? 'stand' : 'shrug' })); }
  if (k === 'yousee') { A.push(P(f, 'EF_EIFFEL', 11, FA(0.2, TZ + 7.3, TOP), { expr: f < 778 ? 'thoughtful' : 'excited', view: 'front', prop: 'lantern', lit: 1, raise: f > 778 ? 1 : undefined }, { blob: false })); }
  if (k === 'science') { A.push(P(f, 'EF_EIFFEL', 11, FA(-1.8, TZ + 7.4, TOP), { expr: f < 846 ? 'happy' : 'excited', view: '34R', point: 1 }, { blob: false })); }
  if (k === 'army') { const pay = sm(1079, 1095, f); A.push(P(f, 'EF_EIFFEL', 11, FA(33.0, -16.4), { expr: f < 1079 ? 'smile' : 'proud', view: '34L', prop: f < 1104 ? 'moneybag' : undefined, coins: pay }));
    A.push(P(f, 'EF_SOLDIER', 61, FA(30.9, -18.9), { expr: f < 1079 ? 'surprised' : f < 1104 ? 'excited' : 'happy', view: '34R', prop: f >= 1104 ? 'moneybag' : undefined, coins: 1, cheer: f > 1126 ? wav(f, 0, 0.3) : undefined })); }
  if (k === 'antenna') { A.push(TU(f, FA(0.5, Z0 - 2.4), { expr: f < 1198 ? 'proud' : 'love', pose: f < 1198 ? 'hips' : 'cheer', waves: f > 1190 ? 1 : 0.5 })); }
  if (k === 'renew') { A.push(P(f, 'EF_CLERK', 41, OF(DX - 0.1, DZ - 0.75), { expr: f < 1271 ? 'smile' : 'happy', view: 'front', prop: 'stamp', raise: f > 1262 && f < 1282 ? 1 : undefined }));
    A.push(P(f, 'EF_EIFFEL', 11, OF(DX + 0.95, DZ + 0.55), { expr: f < 1282 ? 'nervous' : 'laugh', view: '34L', cheer: f > 1290 ? wav(f, 0, 0.3) : undefined })); }
  if (k === 'marne') { A.push(P(f, 'EF_OPER', 71, RA(0.5, BZ + 0.7), { expr: f < 1383 ? 'thoughtful' : f < 1432 ? 'surprised' : 'determined', mode: 'sit', prop: 'pen', view: '34L' }, { blob: false }));
    if (f > 1420) A.push(P(f, 'EF_SOLDIER', 61, RA(-0.9, BZ + 0.9), { expr: f < 1457 ? 'surprised' : 'excited', view: '34L', raise: f > 1470 ? 1 : undefined }, { s: back(1420, 1430, f) * 0.999 + 0.001 })); }
  if (k === 'twist') { A.push(P(f, 'EF_TOUR1', 81, FA(0.5, Z0 + 2.4), { expr: f < 1549 ? 'smile' : 'surprised', prop: 'snap', view: 'back' })); A.push(P(f, 'EF_TOUR2', 82, FA(1.6, Z0 + 0.4), { expr: 'happy', view: '34L', point: f > 1570 ? 1 : undefined }));
    A.push(P(f, 'EF_KID', 83, FA(-0.3, Z0 + 0.6), { expr: 'excited', view: '34R', cheer: f > 1595 ? wav(f, 1, 0.3) : undefined }, { s: 0.8 })); }
  if (k === 'payoff') { A.push(TU(f, FA(0.5, Z0 - 2.4), { expr: f < 1759 ? 'happy' : 'love', pose: f < 1759 ? 'wave' : 'cheer', waves: 1, today: 1 })); }
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
const wpuff = (f, f0, pos, size, F2, n = 16, tint) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'puff', t: (f - f0) / n, pos, size, tint }); };
const tick = (f, f0, f1, y0, y1) => String(Math.round(y0 + (y1 - y0) * sm(f0, f1, f)));
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { sboard(f, 6, ['TORN DOWN?!'], 'hook', 0.0, 0.68, 3, 0.42, F2, 72); stamp(f, 76, ['IN 1909'], 'hook', 0.0, 0.62, 2.6, 0.42, F2); sburst(f, 76, 'hook', 0.0, 0.62, 2.6, 0.5, F2); }
  if (k === 'fair') { sboard(f, 114, ['GUSTAVE', 'EIFFEL'], 'fair', 0.0, 0.66, 3, 0.42, F2, 146); sboard(f, 146, ['1889', "WORLD'S FAIR"], 'fair', 0.0, 0.66, 3, 0.46, F2, 194); sboard(f, 194, ['PARIS'], 'fair', 0.0, 0.7, 3, 0.32, F2); sburst(f, 148, 'fair', 0.0, 0.66, 3, 0.45, F2, '#ffe0a0'); }
  if (k === 'tall') { if (f > 216) F2.push({ fx: 'board', lines: [tick(f, 218, 262, 0, 300) + ' m'], pos: SB('tall', 0.0, 0.7, 4), size: SWD('tall', 0.36, 4) * back(216, 226, f) }); stamp(f, 266, ['TALLEST', 'ON EARTH'], 'tall', 0.0, 0.5, 4, 0.46, F2); sburst(f, 262, 'tall', 0.0, 0.7, 4, 0.45, F2); }
  if (k === 'permit') { sboard(f, 316, ['PERMIT'], 'permit', 0.0, 0.7, 2.5, 0.36, F2, 346); sboard(f, 347, ['ONLY', '20 YEARS'], 'permit', 0.0, 0.66, 2.5, 0.4, F2, 400); stamp(f, 403, ['PULL IT', 'DOWN!'], 'permit', 0.0, 0.62, 2.5, 0.42, F2); }
  if (k === 'crowd') { sboard(f, 427, ['PARISIANS', 'WANTED IT GONE'], 'crowd', 0.0, 0.66, 3, 0.5, F2); for (const f0 of [440, 452, 464]) wpuff(f, f0, FAa(-1.0 + (f0 - 440) * 0.06, 2.6, Z0 + 1.6), 1.4, F2, 12, '#ffffff'); }
  if (k === 'artists') { sboard(f, 480, ['1887'], 'artists', 0.0, 0.7, 2.5, 0.3, F2, 516); sboard(f, 517, ['FAMOUS', 'ARTISTS'], 'artists', 0.0, 0.66, 2.5, 0.4, F2, 542); sboard(f, 542, ['PROTEST!'], 'artists', 0.0, 0.7, 2.5, 0.38, F2, 569);
    stamp(f, 571, ['USELESS'], 'artists', -0.1, 0.62, 2.5, 0.42, F2, 590); stamp(f, 592, ['MONSTROUS'], 'artists', 0.0, 0.62, 2.5, 0.46, F2); sburst(f, 571, 'artists', 0.0, 0.62, 2.5, 0.45, F2, '#ffd0c0'); }
  if (k === 'chimney') { sboard(f, 612, ['A GIANT BLACK', 'FACTORY CHIMNEY'], 'chimney', 0.0, 0.66, 1.2, 0.5, F2); for (const f0 of [612, 626, 640, 654, 664]) wpuff(f, f0, SUa(1.47, 2.0 + (f - f0) * 0.006, -1.05), 0.35, F2, 16, '#5a5060'); stamp(f, 654, ['CHIMNEY?!'], 'chimney', 0.0, -0.1, 1.2, 0.42, F2); }
  if (k === 'how') { sboard(f, 678, ['HOW DO YOU', 'SAVE IT?'], 'how', 0.0, 0.66, 2, 0.46, F2); qmark(f, 696, 'how', 0.32, 0.25, 2, 0.12, F2); }
  if (k === 'yousee') { sboard(f, 746, ['YOU SEE...'], 'yousee', 0.0, 0.7, 3, 0.4, F2, 776); sboard(f, 777, ['MAKE IT', 'USEFUL!'], 'yousee', 0.0, 0.66, 3, 0.4, F2); sburst(f, 778, 'yousee', 0.0, 0.66, 3, 0.45, F2); }
  if (k === 'science') { sboard(f, 805, ['WEATHER', 'STATION'], 'science', 0.0, 0.66, 3, 0.42, F2, 844); sboard(f, 846, ['DROP TESTS', 'ON A CABLE'], 'science', 0.0, 0.66, 3, 0.46, F2, 886); sboard(f, 888, ['AIR', 'RESISTANCE'], 'science', 0.0, 0.66, 3, 0.42, F2); stars(f, 892, 'science', 0.0, 0.3, 3, 0.5, F2, 24); }
  if (k === 'wireless') { sboard(f, 930, ['RADIO!'], 'wireless', 0.0, 0.7, 4, 0.34, F2, 956); sboard(f, 957, ['1898'], 'wireless', 0.0, 0.7, 4, 0.3, F2, 988); sburst(f, 959, 'wireless', 0.0, 0.7, 4, 0.4, F2, '#9af0ff'); sboard(f, 990, ['WIRELESS', 'SIGNAL'], 'wireless', 0.0, 0.66, 4, 0.42, F2, 1040);
    sboard(f, 1042, ['TOWER →', 'PANTHÉON'], 'wireless', 0.0, 0.66, 4, 0.44, F2); sburst(f, 1045, 'wireless', 0.25, -0.1, 4, 0.5, F2, '#9af0ff', 14); }
  if (k === 'army') { sboard(f, 1068, ['EIFFEL', 'PAID'], 'army', 0.0, 0.68, 3, 0.36, F2, 1100); sboard(f, 1101, ['ARMY RADIO', 'EXPERIMENTS'], 'army', 0.0, 0.66, 3, 0.46, F2); stars(f, 1126, 'army', 0.0, 0.25, 3, 0.5, F2, 24); }
  if (k === 'antenna') { sboard(f, 1160, ['THE "UGLY"', 'TOWER...'], 'antenna', 0.0, 0.66, 2.5, 0.44, F2, 1196); stamp(f, 1198, ['PERFECT', 'ANTENNA!'], 'antenna', 0.0, 0.62, 2.5, 0.46, F2); sburst(f, 1208, 'antenna', 0.0, 0.62, 2.5, 0.5, F2, '#9af0ff', 14); }
  if (k === 'renew') { sboard(f, 1242, ['1910'], 'renew', 0.0, 0.7, 2.5, 0.3, F2, 1280); stamp(f, 1282, ['RENEWED!'], 'renew', 0.0, 0.62, 2.5, 0.42, F2, 1312); sboard(f, 1313, ['NOT TORN', 'DOWN'], 'renew', 0.0, 0.66, 2.5, 0.4, F2); sburst(f, 1282, 'renew', 0.0, 0.62, 2.5, 0.5, F2, '#c8ffb0'); }
  if (k === 'marne') { sboard(f, 1340, ['1914'], 'marne', 0.0, 0.7, 2.5, 0.3, F2, 1380); sboard(f, 1382, ['GERMAN', 'MESSAGES CAUGHT'], 'marne', 0.0, 0.66, 2.5, 0.5, F2, 1454); sboard(f, 1455, ['BATTLE OF', 'THE MARNE'], 'marne', 0.0, 0.66, 2.5, 0.44, F2); sburst(f, 1470, 'marne', 0.0, 0.66, 2.5, 0.45, F2); }
  if (k === 'twist') { stamp(f, 1495, ['THE TWIST'], 'twist', 0.0, 0.62, 3, 0.42, F2, 1545); sboard(f, 1546, ['MEANT FOR', '20 YEARS'], 'twist', 0.0, 0.66, 3, 0.44, F2, 1590); sboard(f, 1592, ['STILL FULL OF', 'ANTENNAS TODAY'], 'twist', 0.0, 0.66, 3, 0.5, F2); }
  if (k === 'heli') { sboard(f, 1632, ['2022'], 'heli', 0.0, 0.7, 4, 0.3, F2, 1676); if (f > 1677) F2.push({ fx: 'board', lines: ['+' + tick(f, 1680, 1700, 0, 6) + ' METRES'], pos: SB('heli', 0.0, 0.68, 4), size: SWD('heli', 0.42, 4) * back(1677, 1687, f) }); sburst(f, 1696, 'heli', 0.0, 0.68, 4, 0.45, F2); }
  if (k === 'payoff') { sboard(f, 1724, ['THE TOWER PARIS', 'WANTED GONE...'], 'payoff', 0.0, 0.66, 3, 0.52, F2, 1790); sboard(f, 1791, ['SAVED BY', 'THE INVISIBLE'], 'payoff', 0.0, 0.66, 3, 0.46, F2, 1834); stamp(f, 1836, ['RADIO WAVES'], 'payoff', 0.0, 0.62, 3, 0.46, F2); stars(f, 1846, 'payoff', 0.0, 0.25, 3, 0.55, F2, 24); }
  return F2;
}
