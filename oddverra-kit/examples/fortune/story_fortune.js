// [FC-story] "Fortune cookies aren't Chinese" timeline (59.2 s voice, 1777 f @ 30 fps).
// Sets: fc_sets.js (kyoto / garden / court / study / bakery) through setAt. Pattern: story_niagara.js (slow push per shot, zoom-through
// whips on cuts, screen-pinned boards / bursts / stamps, punch-ins on beats, white flashes for time jumps). The motif is the hero
// fortune cookie with a face: it opens the video on a Kyoto counter, is the evidence in the 1983 mock court, frets on the study desk in
// front of the Pacific map, and pays off back on the Kyoto counter at dawn. The 1942 shot is kept quiet: no characters, no gags.
import * as S from './story.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]                                  narration (word frames from work/words_frames.txt)
const SH = [
  [0, 116, 'hook', 'kyotoNight'],     // Fortune cookies aren't Chinese. They most likely came from Japan.  (aren't 22, Chinese 33, Japan 88)
  [116, 250, 'book', 'study'],        // Researcher Yasuko Nakamachi found an 1878 Japanese book showing a baker  (Yasuko 128, found 158, 1878 174, book 213, baker 241)
  [250, 372, 'kyoto', 'kyoto'],       // making tsujiura senbei: fortune crackers, with the fortune tucked in the fold.  (tsujiura 258, crackers 301, tucked 338, fold 352)
  [372, 466, 'today', 'kyotoToday'],  // And family bakeries near Kyoto still bake them by hand today.  (Kyoto 401, still 411, hand 443, today 450)
  [466, 618, 'america', 'study'],  // So how did they end up in America? You see, Japanese immigrants likely brought them to California.  (America 507, Japanese 558, California 600)
  [618, 748, 'garden', 'garden'],     // In San Francisco, Makoto Hagiwara reportedly served them at the Japanese Tea Garden.  (San 626, Makoto 660, reportedly 678, Garden 738)
  [748, 822, 'la', 'bakeryJP'],       // But in Los Angeles, Seiichi Kito claimed them too.  (Los 758, Seiichi 789, claimed 804, too 817)
  [822, 1036, 'court', 'court'],      // In 1983, a mock court in San Francisco "ruled" for San Francisco. Los Angeles was not impressed.  (1983 840, mock 876, ruled 916, S.F. 942, L.A. 970, impressed 1006)
  [1036, 1214, 'war', 'bakeryClosed'], // Then came World War Two. Japanese Americans were forced into internment camps, and their bakeries closed.  (World 1057, forced 1118, camps 1150, closed 1185)
  [1214, 1366, 'cn', 'bakeryCN'],     // Chinese American bakeries took over making the cookies, and that's reportedly why we link them to China.  (took 1250, reportedly 1305, China 1346)
  [1366, 1605, 'twist', 'studyMap'],  // Here's the twist. In China itself, fortune cookies are barely known. A company that tried selling them there in 1992 reportedly gave up. Too American.  (twist 1379, China 1399, barely 1454, 1992 1527, gave up 1569, Too American 1593)
  [1605, 1777, 'payoff', 'kyotoDawn'], // So the cookie that predicts your future... got its own past wrong.  (cookie 1646, predicts 1658, future 1671, past 1708, wrong 1719)
];
export const NF = 1777;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['fc', segAt(f)[3]];

// ---------- places (set-local -> world)
const O = { kyoto: [-130000, 0, 0], garden: [-130000, 0, 800], court: [-130000, 0, 1600], study: [-132500, 0, 0], bakery: [-132500, 0, 800] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const KY = at(O.kyoto), GD = at(O.garden), CT = at(O.court), SD = at(O.study), BK = at(O.bakery);
const CK = [-0.6, 1.0, -0.45]; // the hero cookie's spot on the Kyoto counter
const TH = (x, z) => [3.6 + 0.939 * x - 0.343 * z, 0.343 * x + 0.939 * z - 0.8]; // tea-house local -> garden local

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(KY(-0.62, 1.34, 0.62), KY(-0.6, 1.1, -0.45), 40, 1.6, KY(...CK)),
  book: C(SD(0.9, 1.55, 1.7), SD(0.15, 1.15, -1.0), 44, 1.2, SD(0.2, 1.1, -1.2)),
  kyoto: C(KY(0.1, 1.6, 3.0), KY(0.5, 1.2, -1.6), 44, 1.2, KY(1.0, 1.2, -2.0)),
  today: C(KY(-1.6, 1.65, 4.6), KY(0.5, 1.6, -1.4), 46, 1.0, KY(1.0, 1.2, -2.0)),
  america: C(SD(0.9, 1.25, 1.0), SD(0.3, 1.45, -3.0), 48, 1.6, SD(0.55, 0.9, -0.38)),
  garden: C(GD(0.4, 1.7, 5.4), GD(3.2, 1.25, -0.8), 46, 1.0, GD(3.4, 1.1, -1.0)), gardenW: C(GD(-2.0, 2.6, 9.5), GD(0.6, 1.3, -4.5), 50, 0.6, GD(0, 1, -4)),
  la: C(BK(0.2, 1.55, 2.5), BK(-0.7, 1.3, -1.0), 46, 1.4, BK(-0.7, 1.2, -1.0)),
  court: C(CT(0, 1.75, 4.4), CT(0, 1.45, -2.6), 54, 1.2, CT(0, 1.2, -1.2)),
  war: C(BK(0.9, 1.35, 3.9), BK(-0.4, 1.05, -1.6), 46, 0.9, BK(-0.3, 1.0, -0.4)),
  cn: C(BK(-1.2, 1.65, 4.6), BK(-2.0, 1.05, 0.6), 48, 1.2, BK(-2.2, 1.0, 1.2)),
  twist: C(SD(0.9, 1.2, 0.9), SD(-0.3, 1.3, -3.0), 48, 1.6, SD(0.55, 0.9, -0.38)),
  payoff: C(KY(-0.62, 1.32, 0.6), KY(-0.6, 1.1, -0.45), 40, 1.6, KY(...CK)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.18, book: 0.1, kyoto: 0.06, today: 0.12, america: 0.08, garden: 0.1, la: 0.12, court: 0.06, war: 0.14, cn: 0.1, twist: 0.08, payoff: 0 };
const lerpC = (a, b, t) => ({ p: a.p.map((v, i) => v + (b.p[i] - v) * t), l: a.l.map((v, i) => v + (b.l[i] - v) * t), fp: a.fp.map((v, i) => v + (b.fp[i] - v) * t), fov: a.fov + (b.fov - a.fov) * t, cInf: a.cInf + (b.cInf - a.cInf) * t });
function cam(k, f) {
  const s = segAt(f); let c = push(V[k] || V.hook, PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const look = (d, f0, f1, fd) => { const t = sm(f0, f1, f); c = { ...c, l: add3(c.l, d.map((x) => x * t)), fp: add3(c.fp, (fd || d).map((x) => x * t)) }; };
  if (k === 'hook') { punch(33, 39, 0.1); kick(33, 0.02); shake(34, 46, 0.01); punch(88, 94, 0.12); kick(88, 0.02); }
  if (k === 'book') { punch(174, 180, 0.1); kick(174, 0.03); const t = sm(214, 250, f); c = lerpC(c, C(SD(0.02, 1.2, -0.42), SD(0.04, 0.82, -0.66), 40, 2.0, SD(0.04, 0.83, -0.65)), t ** 1.4); }
  if (k === 'kyoto') { punch(258, 264, 0.06); punch(301, 307, 0.06); const t = sm(316, 340, f); c = lerpC(c, C(KY(-0.55, 1.3, 0.35), KY(-0.6, 1.06, -0.45), 38, 2.2, KY(...CK)), t); punch(352, 358, 0.08); }
  if (k === 'today') { punch(401, 407, 0.06); punch(443, 449, 0.06); look([0.5, -0.15, 0], 430, 466, [0.4, -0.1, 0]); }
  if (k === 'america') { punch(507, 513, 0.08); kick(507, 0.03); look([0.3, -0.12, 0], 556, 612, [0.0, 0, 0]); punch(600, 606, 0.08); }
  if (k === 'garden') { c = lerpC(V.gardenW, c, sm(630, 668, f)); punch(660, 666, 0.06); look([0.3, 0, 0.2], 690, 740, [0.3, 0, 0.2]); punch(738, 744, 0.05); }
  if (k === 'la') { punch(789, 795, 0.06); punch(804, 810, 0.1); kick(804, 0.03); }
  if (k === 'court') { punch(876, 882, 0.06); punch(916, 921, 0.12); kick(916, 0.05); shake(916, 930, 0.04); look([-0.7, -0.2, 0.3], 928, 948, [-0.9, 0, 0.9]); const t2 = sm(964, 986, f); c = { ...c, l: add3(c.l, [1.4 * t2, 0, 0]), fp: add3(c.fp, [1.8 * t2, 0, 0]) }; punch(997, 1003, 0.08); kick(997, 0.03); }
  if (k === 'war') { look([0, 0.15, 0], 1150, 1214); }
  if (k === 'cn') { punch(1250, 1256, 0.06); look([0.5, 0, -0.6], 1290, 1360, [0.6, 0, -0.8]); punch(1346, 1352, 0.08); }
  if (k === 'twist') { punch(1379, 1385, 0.08); kick(1379, 0.03); look([-0.8, 0.4, 0], 1392, 1420, [0, 0, 0]); look([0.3, -0.45, 0], 1470, 1500, [0, 0, 0]); punch(1593, 1599, 0.1); kick(1593, 0.04); }
  if (k === 'payoff') { punch(1658, 1664, 0.06); punch(1708, 1716, 0.1); kick(1708, 0.03); const t = sm(1728, 1777, f); const P1 = C(KY(-0.1, 2.1, 6.6), KY(0, 2.45, -1.0), 50, 0.9, KY(0, 2, -1)); c = lerpC(c, P1, t * t * (3 - 2 * t)); }
  return c;
}
const HARD = new Set([1036]); // into the quiet 1942 shot: a plain cut, no whip
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[33, 0.3, 6], [88, 0.4, 8], [116, 0.4, 10], [174, 0.3, 6], [250, 0.5, 10], [372, 0.75, 12], [466, 0.35, 8], [600, 0.3, 6], [618, 0.4, 10], [748, 0.35, 8], [822, 0.45, 10], [916, 0.22, 6], [1214, 0.75, 12], [1366, 0.45, 10], [1379, 0.3, 6], [1593, 0.35, 6], [1605, 0.6, 12], [1708, 0.35, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- cookie / map props through the story (set-local)
function cookieAt(f) { const k = segAt(f)[2];
  const bob = (a = 0.004) => a * Math.sin(f * 0.25);
  if (k === 'hook') { const hop = back(88, 98, f); return { set: 'kyoto', p: [CK[0], CK[1] + 0.03 * Math.sin(Math.PI * sm(86, 96, f)) + bob(), CK[2]], s: 0.12, ry: 0.15 * Math.sin(f * 0.05), expr: f < 33 ? 'smile' : f < 88 ? 'shock' : 'happy', slip: f < 86 ? 0 : Math.min(1, hop), msg: 'japan' }; }
  if (k === 'kyoto') return { set: 'kyoto', p: CK, s: 0.11, ry: 0.4, expr: null, slip: f < 334 ? 0 : sm(334, 350, f) * 0.55, msg: 'blank' };
  if (k === 'today') return { set: 'kyoto', p: CK, s: 0.1, ry: -0.3, expr: null, slip: 0.45, msg: 'blank' };
  if (k === 'america') return { set: 'study', p: [0.55, 0.8, -0.38], s: 0.13, ry: -0.3 + 0.2 * sm(556, 600, f), expr: f < 507 ? 'smile' : f < 556 ? 'shock' : 'happy', slip: 0 };
  if (k === 'court') { const j = f >= 916 && f < 930 ? 0.02 * Math.abs(Math.sin((f - 916) * 0.9)) : 0; return { set: 'court', p: [0, 1.05 + j, -1.15], s: 0.13, ry: 0, expr: f < 916 ? 'worried' : f < 964 ? 'happy' : f < 997 ? 'smile' : 'smug', slip: 0 }; }
  if (k === 'twist') return { set: 'study', p: [0.55, 0.8, -0.38], s: 0.13, ry: -0.2, expr: f < 1395 ? 'shock' : f < 1593 ? 'worried' : 'sad', slip: 0 };
  if (k === 'payoff') return { set: 'kyoto', p: [CK[0], CK[1] + bob(), CK[2]], s: 0.12, ry: 0.1 * Math.sin(f * 0.04), expr: f < 1680 ? 'smug' : f < 1719 ? 'shock' : 'worried', slip: f < 1650 ? 0 : back(1650, 1662, f), msg: f < 1700 ? 'future' : 'past', crack: f < 1696 ? 0 : 0.5 * eo(1696, 1708, f) };
  return null;
}

// ---------- world state
export function worldAt(f, w) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const F = w.fc; if (!F) return;
  F.hideCookies(); const ck = cookieAt(f); if (ck) F.setCookie(ck.set, ck);
  F.setShip(k === 'america' ? sm(556, 610, f) : k === 'twist' ? 0 : 1, k === 'america');
  if (k === 'twist') { const out = sm(1481, 1530, f), bk2 = sm(1569, 1595, f); F.setCrate({ p: [0.45 - 1.5 * out + 1.5 * bk2, 0.8, -0.98], ry: 0.15, rz: bk2 > 0 && bk2 < 1 ? 0.04 * Math.sin(f * 1.6) : 0, on: f >= 1474 }); } else F.setCrate({ on: false });
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'book') { A.push(P(f, 'FC_YASUKO', 1, SD(0.35, 0, -1.6), { expr: f < 158 ? 'smile' : f < 174 ? 'surprised' : f < 213 ? 'excited' : 'happy', prop: 'magnifier', view: '34L', point: f > 200 && f < 236 ? 1 : undefined })); }
  if (k === 'kyoto') { const flip = Math.sin(f * 0.18) > 0.6; A.push(P(f, 'FC_BAKER', 11, KY(1.1, 0.3, -2.3), { expr: f < 294 ? 'smile' : f < 322 ? 'happy' : 'grin', prop: 'iron', view: '34L' }, { roll: flip ? 0.03 : 0 }));
    A.push(P(f, 'FC_BAKER2', 12, KY(-1.6, 0.3, -2.6), { expr: 'smile', prop: 'tray', view: '34R' }, { s: 0.92 })); }
  if (k === 'today') { A.push(P(f, 'FC_BAKER2', 21, KY(1.1, 0.3, -2.3), { expr: f < 443 ? 'smile' : 'happy', prop: 'iron', view: '34L' }));
    A.push(P(f, 'FC_GUEST2', 22, KY(-1.9, 0, 1.6), { expr: f < 411 ? 'surprised' : 'happy', view: '34R', point: f > 405 && f < 440 ? 1 : undefined }, { s: 0.97 })); }
  if (k === 'garden') { const [hx, hz] = TH(-0.1, -0.9), [g1x, g1z] = TH(-1.6, 0.6), [g2x, g2z] = TH(1.5, 0.6);
    A.push(P(f, 'FC_HAGI', 31, GD(hx, 0.4, hz), { expr: f < 660 ? 'smile' : f < 694 ? 'happy' : 'grin', prop: 'teapot', view: 'front' }));
    A.push(P(f, 'FC_GUEST1', 32, GD(g1x, 0.4, g1z), { expr: f < 700 ? 'smile' : 'laugh', prop: f > 690 ? 'cookie' : undefined, view: '34R' }));
    A.push(P(f, 'FC_GUEST2', 33, GD(g2x, 0.4, g2z), { expr: f < 694 ? 'surprised' : 'happy', view: '34L', wave: f > 720 ? wav(f, 1, 0.3) : undefined })); }
  if (k === 'la') { A.push(P(f, 'FC_KITO', 41, BK(-0.7, 0, -1.0), { expr: f < 789 ? 'smile' : f < 804 ? 'happy' : 'smug', prop: 'tray', view: '34R', hip: f > 806 ? 1 : undefined }, { roll: f >= 804 && f < 814 ? 0.04 * Math.sin((f - 804) * 0.6) : 0 })); }
  if (k === 'court') { const bang = f >= 912 && f < 922;
    A.push(P(f, 'FC_JUDGE', 51, CT(0, 0.45, -3.75), { expr: f < 900 ? 'bored' : f < 916 ? 'smile' : f < 940 ? 'angry' : 'smug', prop: 'mallet', view: 'front' }, { roll: bang ? 0.06 : 0 }));
    A.push(P(f, 'FC_LAWSF', 52, CT(-0.95, 0, -0.35), { expr: f < 931 ? 'nervous' : 'excited', view: '34R', cheer: f > 934 && f < 1000 ? wav(f, 0) : undefined }));
    A.push(P(f, 'FC_LAWLA', 53, CT(0.95, 0, -0.35), { expr: f < 931 ? 'smile' : f < 990 ? 'shock' : 'angry', view: '34L', hip: f > 995 ? 1 : undefined })); }
  if (k === 'cn') { A.push(P(f, 'FC_CN1', 61, BK(-3.3, 0, 0.8), { expr: f < 1250 ? 'smile' : 'happy', prop: 'tray', view: '34R' }));
    A.push(P(f, 'FC_CN2', 62, BK(-1.5, 0, 0.8), { expr: f < 1297 ? 'smile' : f < 1332 ? 'grin' : 'laugh', prop: f > 1240 ? 'cookie' : undefined, view: '34L' })); }
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
const qmark = (f, f0, k, x, y, z, w, F2, f1 = 1e9) => { if (f >= f0 && f < f1) F2.push({ fx: 'qmark', pos: SB(k, x, y, z), size: SWD(k, w, z) * back(f0, f0 + 8, f) }); };
const stamp = (f, f0, lines, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) { const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos: SB(k, x, y, z), size: SWD(k, w, z) * (1.6 - 0.6 * t * t), op: Math.min(1, t * 2) }); } };
const wpuff = (f, f0, pos, size, F2, n = 16, tint) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'puff', t: (f - f0) / n, pos, size, tint }); };
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { sboard(f, 2, ['FORTUNE', 'COOKIES...'], 'hook', 0.0, 0.66, 1.0, 0.48, F2, 30); stamp(f, 33, ['NOT CHINESE?!'], 'hook', 0.0, 0.62, 1.0, 0.5, F2, 64); sburst(f, 33, 'hook', 0.0, 0.0, 1.0, 0.5, F2);
    sboard(f, 64, ['MOST LIKELY', 'FROM JAPAN'], 'hook', 0.0, 0.66, 1.0, 0.5, F2); sburst(f, 88, 'hook', 0.0, 0.1, 1.0, 0.5, F2, '#fff3b0', 14); }
  if (k === 'book') { sboard(f, 122, ['RESEARCHER', 'YASUKO NAKAMACHI'], 'book', 0.0, 0.66, 3, 0.56, F2, 170); stamp(f, 174, ['1878'], 'book', 0.0, 0.62, 3, 0.32, F2, 208); sburst(f, 174, 'book', 0.0, 0.62, 3, 0.4, F2);
    sboard(f, 210, ['A JAPANESE BOOK', 'SHOWING A BAKER'], 'book', 0.0, 0.66, 3, 0.56, F2); }
  if (k === 'kyoto') { sboard(f, 256, ['"TSUJIURA SENBEI"'], 'kyoto', 0.0, 0.68, 3, 0.56, F2, 290); sboard(f, 292, ['= FORTUNE', 'CRACKERS'], 'kyoto', 0.0, 0.66, 3, 0.46, F2, 318);
    sboard(f, 330, ['THE FORTUNE,', 'TUCKED IN THE FOLD'], 'kyoto', 0.0, 0.66, 1.0, 0.56, F2); sburst(f, 352, 'kyoto', 0.0, 0.05, 1.0, 0.4, F2); for (const f0 of [262, 284, 306]) wpuff(f, f0, KY(1.0, 1.0, -1.6), 0.6, F2, 22, '#d8d0c8'); }
  if (k === 'today') { sboard(f, 380, ['STILL MADE', 'NEAR KYOTO'], 'today', 0.0, 0.66, 3, 0.46, F2, 436); sboard(f, 438, ['BY HAND,', 'TODAY'], 'today', 0.0, 0.66, 3, 0.4, F2); stars(f, 444, 'today', 0.0, 0.25, 3, 0.5, F2, 24); }
  if (k === 'america') { sboard(f, 472, ['SO HOW DID THEY', 'GET TO AMERICA?'], 'america', 0.0, 0.68, 3, 0.56, F2, 530); qmark(f, 507, 'america', 0.32, -0.38, 3, 0.1, F2, 556);
    sboard(f, 554, ['JAPANESE IMMIGRANTS', '(LIKELY)'], 'america', 0.0, 0.68, 3, 0.56, F2, 598); stamp(f, 600, ['CALIFORNIA'], 'america', 0.0, 0.64, 3, 0.44, F2); sburst(f, 600, 'america', 0.0, 0.64, 3, 0.5, F2); }
  if (k === 'garden') { sboard(f, 622, ['SAN FRANCISCO'], 'garden', 0.0, 0.7, 3, 0.48, F2, 656); sboard(f, 658, ['MAKOTO HAGIWARA'], 'garden', 0.0, 0.7, 3, 0.5, F2, 690);
    sboard(f, 692, ['REPORTEDLY SERVED THEM', 'AT THE TEA GARDEN'], 'garden', 0.0, 0.66, 3, 0.58, F2); }
  if (k === 'la') { sboard(f, 750, ['LOS ANGELES'], 'la', 0.0, 0.7, 3, 0.44, F2, 786); sboard(f, 787, ['SEIICHI KITO'], 'la', 0.0, 0.7, 3, 0.42, F2, 803); stamp(f, 804, ['CLAIMED', 'THEM TOO!'], 'la', 0.0, 0.62, 3, 0.42, F2); sburst(f, 804, 'la', 0.0, 0.62, 3, 0.45, F2); }
  if (k === 'court') { sboard(f, 830, ['1983'], 'court', 0.0, 0.7, 3, 0.3, F2, 872); sboard(f, 874, ['A MOCK COURT', '(JUST FOR FUN)'], 'court', 0.0, 0.66, 3, 0.5, F2, 912);
    sburst(f, 916, 'court', 0.0, 0.2, 3, 0.5, F2); stamp(f, 930, ['"RULED":', 'SAN FRANCISCO'], 'court', 0.0, 0.62, 3, 0.5, F2, 966); sboard(f, 968, ['LOS ANGELES:', 'NOT IMPRESSED'], 'court', 0.0, 0.66, 3, 0.52, F2); }
  if (k === 'war') { sboard(f, 1044, ['WORLD WAR II'], 'war', 0.0, 0.7, 3, 0.44, F2, 1084); sboard(f, 1088, ['JAPANESE AMERICANS', 'FORCED INTO CAMPS'], 'war', 0.0, 0.66, 3, 0.58, F2, 1166);
    sboard(f, 1170, ['THEIR BAKERIES', 'CLOSED'], 'war', 0.0, 0.66, 3, 0.46, F2); }
  if (k === 'cn') { sboard(f, 1218, ['CHINESE AMERICAN', 'BAKERIES TOOK OVER'], 'cn', 0.0, 0.66, 3, 0.58, F2, 1294); sboard(f, 1297, ['REPORTEDLY WHY', 'WE LINK THEM TO CHINA'], 'cn', 0.0, 0.66, 3, 0.58, F2); stars(f, 1250, 'cn', 0.0, 0.0, 3, 0.5, F2, 26); }
  if (k === 'twist') { stamp(f, 1370, ['THE TWIST'], 'twist', 0.0, 0.62, 3, 0.4, F2, 1392); sboard(f, 1395, ['IN CHINA?', 'BARELY KNOWN'], 'twist', 0.0, 0.66, 3, 0.46, F2, 1476); qmark(f, 1412, 'twist', -0.05, 0.1, 3, 0.12, F2, 1476);
    sboard(f, 1480, ['1992: A COMPANY', 'TRIED SELLING THEM'], 'twist', 0.0, 0.66, 3, 0.56, F2, 1548); sboard(f, 1550, ['REPORTEDLY', 'GAVE UP...'], 'twist', 0.0, 0.66, 3, 0.4, F2, 1590); stamp(f, 1593, ['"TOO AMERICAN"'], 'twist', 0.0, 0.62, 3, 0.52, F2); sburst(f, 1593, 'twist', 0.0, 0.62, 3, 0.5, F2); }
  if (k === 'payoff') { sboard(f, 1612, ['THE COOKIE THAT', 'PREDICTS YOUR FUTURE...'], 'payoff', 0.0, 0.66, 1.0, 0.6, F2, 1696); stamp(f, 1700, ['...GOT ITS OWN', 'PAST WRONG'], 'payoff', 0.0, 0.62, 1.0, 0.56, F2); sburst(f, 1708, 'payoff', 0.0, 0.1, 1.0, 0.5, F2); stars(f, 1730, 'payoff', 0.0, 0.3, 3, 0.55, F2, 24); }
  return F2;
}
