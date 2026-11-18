// [NT-story] "Nintendo started as a playing-card company" timeline (61.85 s voice, 1856 f @ 30 fps).
// Sets: nt_sets.js (shop / street / office / home) through setAt. Pattern: story_lambo.js (slow push per shot, zoom-through whips on
// cuts, screen-pinned boards / bursts / stamps, punch-ins on beats). FUDA (a living flower card) is the sidekick and the motif: it pops
// out beside the console in the hook, watches every venture, asks the doubter's question, and cheers in the same workshop today.
import * as S from './story.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]                                   narration (word frames from work/words_frames.txt)
const SH = [
  [0, 104, 'hook', 'homeNight'],      // Before Nintendo made video games, it made playing cards.  (games 42, playing 69, cards 79)
  [104, 188, 'kyoto', 'kyoto'],       // Back in 1889, in Kyoto, Japan,  (1889 114, Kyoto 157)
  [188, 263, 'fusa', 'kyoto'],        // a craftsman named Fusajiro Yamauchi opened a shop  (Fusajiro 209, opened 242)
  [263, 365, 'cards', 'shopDay'],     // making hanafuda, little flower cards, painted by hand.  (hanafuda 272, flower 300, painted 323)
  [365, 458, 'loved', 'shopLamp'],    // Card players loved them, and the business kept going for decades.  (loved 377, decades 437)
  [458, 608, 'hiro', 'office60'],     // But by the 1960s, his great-grandson Hiroshi wanted more than cards. A lot more.  (1960s 471, Hiroshi 525, more 548, lot 585)
  [608, 774, 'ventures', 'street60'], // So the company tried a taxi service. Instant rice. And, reportedly, even short-stay hotels.  (taxi 643, instant 671, reportedly 708, hotels 752)
  [774, 856, 'flops', 'street60n'],   // The taxis ran into labor trouble. The rice flopped.  (taxis 777, labor 803, rice 829, flopped 837)
  [856, 957, 'how', 'street60n'],     // So how did a card company end up in video games?  (how 874, games 924)
  [957, 1091, 'yokoi', 'officeNight'],// You see, a young engineer named Gunpei Yokoi built an extending grabber arm, just for fun.  (Gunpei 998, extending 1033, fun 1079)
  [1091, 1174, 'boss', 'officeNight'],// The boss saw it and turned it into a hit toy.  (boss 1093, hit 1139)
  [1174, 1319, 'gw', 'deskMacro'],    // Toys led to electronics. In 1980, Yokoi's Game and Watch put a tiny game in your pocket.  (electronics 1185, 1980 1212, Game 1251, pocket 1302)
  [1319, 1412, 'fami', 'home85'],     // Then in 1983, the Famicom launched in Japan,  (1983 1332, Famicom 1368, Japan 1396)
  [1412, 1499, 'nes', 'home85'],      // and in 1985, the NES reached America.  (1985 1419, NES 1451, America 1478)
  [1499, 1632, 'twist', 'shopNow'],   // Here's the twist. Nintendo never stopped making those flower cards. You can still buy them today.  (twist 1508, never 1536, flower 1575, today 1624)
  [1632, 1856, 'payoff', 'streetDawn'], // So the company behind your favorite games is still, quietly, a card maker from 1889.  (still 1712, quietly 1731, card 1753, 1889 1779)
];
export const NF = 1856;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['nt', segAt(f)[3]];

// ---------- places (set-local -> world)
const O = { shop: [-70000, 0, 0], street: [-70000, 0, 800], office: [-70000, 0, 1600], home: [-72500, 0, 0] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const SHa = at(O.shop), STa = at(O.street), OFa = at(O.office), HMa = at(O.home);
const SP = (x, z, h = 0) => SHa(x, h, z), ST = (x, z, h = 0) => STa(x, h, z), OF = (x, z, h = 0) => OFa(x, h, z), HM = (x, z, h = 0) => HMa(x, h, z);
const BX = -2.2, BY = 1.12, BZ = -2.4, TX = 0.9, TZ = 0.2, DX = -0.6, DZ = -1.4; // nt_sets bench / players' table / office desk
const HH = [DX + 0.25, 0.805, DZ + 0.28]; // handheld on the desk

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(HMa(0.7, 1.2, 1.25), HMa(-0.05, 0.75, -2.0), 46, 1.3, HMa(0.0, 0.6, -0.6)),
  kyoto: C(STa(0.6, 1.9, 13), STa(-0.6, 2.4, -12), 44, 0.8, STa(-2.0, 1.4, 1.5)),
  fusa: C(STa(0.4, 1.55, 5.2), STa(-2.6, 1.6, 0.6), 44, 1.3, STa(-2.5, 1.3, 0.8)),
  cards: C(SHa(-1.45, 1.75, -0.45), SHa(-2.2, 1.5, -2.6), 46, 2.2, SHa(-2.2, 1.15, -2.4)),
  loved: C(SHa(3.4, 1.65, 3.8), SHa(0.9, 0.95, -0.1), 44, 1.4, SHa(0.9, 0.8, 0.2)),
  hiro: C(OFa(1.6, 1.55, 3.0), OFa(-0.6, 1.25, -1.8), 44, 1.3, OFa(-0.6, 1.2, -1.9)),
  ventures: C(STa(0.9, 1.6, 6.5), STa(-0.2, 2.0, -8), 44, 0.9, STa(-0.6, 1.2, -4.0)),
  flops: C(STa(1.7, 1.35, 1.4), STa(-0.6, 1.0, -5.2), 44, 1.2, STa(-0.8, 0.9, -5.0)),
  how: C(STa(0.25, 0.62, 1.1), STa(-0.35, 0.42, -0.9), 44, 2.0, STa(-0.35, 0.4, -0.7)),
  yokoi: C(OFa(3.4, 1.4, 0.9), OFa(2.0, 1.15, -2.0), 44, 1.6, OFa(2.1, 1.1, -1.7)),
  boss: C(OFa(1.0, 1.55, 4.0), OFa(1.15, 1.1, -1.6), 46, 1.2, OFa(1.2, 1.0, -1.2)),
  gw: C([HH[0] + 0.02, HH[1] + 0.16, HH[2] + 0.19].map((v, i) => v + O.office[i]), [HH[0], HH[1] + 0.005, HH[2] - 0.01].map((v, i) => v + O.office[i]), 40, 4.5, HH.map((v, i) => v + O.office[i])),
  fami: C(HMa(-1.6, 1.15, 2.2), HMa(0.2, 0.8, -2.2), 44, 1.3, HMa(0.0, 0.6, -1.0)),
  nes: C(HMa(1.4, 1.25, 2.3), HMa(0.3, 0.85, -2.2), 44, 1.3, HMa(0.3, 0.6, -0.8)),
  twist: C(SHa(4.4, 1.55, 5.0), SHa(2.4, 1.1, -0.2), 44, 1.4, SHa(2.6, 1.0, 0.5)),
  payoff: C(STa(-0.4, 1.4, 4.4), STa(-2.3, 1.5, 0.6), 44, 1.3, STa(-2.2, 1.2, 1.2)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.14, kyoto: 0.06, fusa: 0.1, cards: 0.12, loved: 0.1, hiro: 0.1, ventures: 0.06, flops: 0.1, how: 0.12, yokoi: 0.1, boss: 0.08, gw: 0.14, fami: 0.1, nes: 0.1, twist: 0.1, payoff: 0 };
const base = (k) => V[k] || V.hook;
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const look = (d, f0, f1, fd) => { const t = sm(f0, f1, f); c = { ...c, l: add3(c.l, d.map((x) => x * t)), fp: add3(c.fp, (fd || d).map((x) => x * t)) }; };
  const orbit = (a, f0, f1) => { const t = sm(f0, f1, f) - 0.5, an = a * t, dx = c.p[0] - c.l[0], dz = c.p[2] - c.l[2]; c = { ...c, p: [c.l[0] + dx * Math.cos(an) - dz * Math.sin(an), c.p[1], c.l[2] + dx * Math.sin(an) + dz * Math.cos(an)] }; };
  if (k === 'hook') { orbit(0.3, 0, 104); punch(79, 85, 0.12); kick(79, 0.04); shake(80, 92, 0.03); }
  if (k === 'kyoto') { punch(114, 120, 0.06); punch(157, 163, 0.06); }
  if (k === 'fusa') { punch(209, 215, 0.08); }
  if (k === 'cards') { orbit(0.35, 263, 365); punch(300, 306, 0.08); }
  if (k === 'loved') { orbit(0.3, 365, 458); punch(377, 383, 0.08); }
  if (k === 'hiro') { punch(525, 531, 0.08); punch(585, 591, 0.14); kick(585, 0.04); }
  if (k === 'ventures') { look([1.0, 0.2, 0], 655, 690, [1.2, 0, 0.6]); look([0.2, 0.8, -4], 700, 740, [0.6, 0.8, -6]); punch(752, 758, 0.08); }
  if (k === 'flops') { punch(803, 809, 0.08); look([2.8, 0.15, 3.0], 818, 832, [3.2, 0, 3.0]); punch(837, 843, 0.12); shake(838, 850, 0.03); }
  if (k === 'how') { punch(874, 880, 0.1); kick(874, 0.03); }
  if (k === 'yokoi') { orbit(0.3, 957, 1091); punch(998, 1004, 0.06); punch(1033, 1039, 0.08); }
  if (k === 'boss') { punch(1139, 1145, 0.12); kick(1139, 0.04); }
  if (k === 'gw') { punch(1212, 1218, 0.06); punch(1251, 1257, 0.08); }
  if (k === 'fami') { punch(1332, 1338, 0.06); punch(1368, 1374, 0.08); }
  if (k === 'nes') { orbit(0.25, 1412, 1499); punch(1419, 1425, 0.06); punch(1451, 1457, 0.1); kick(1451, 0.04); }
  if (k === 'twist') { punch(1508, 1514, 0.06); punch(1575, 1581, 0.1); kick(1575, 0.04); }
  if (k === 'payoff') { const t = sm(1700, 1856, f); const P0 = STa(-0.4, 1.4, 4.4), P1 = STa(1.6, 6.5, 13.5); c = { ...c, p: P0.map((v, i) => v + (P1[i] - v) * t), l: add3(c.l, [1.8 * t, 1.6 * t, -9.0 * t]), fov: 44 + 2 * t, cInf: 1.3 - 0.6 * t };
    c = push(c, 0.08, 1632, 1700, f); punch(1753, 1759, 0.06); punch(1779, 1785, 0.08); kick(1779, 0.04); }
  return c;
}
const HARD = new Set([1174, 1499]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[79, 0.3, 6], [104, 0.85, 12], [188, 0.2, 6], [263, 0.3, 8], [365, 0.25, 8], [458, 0.7, 12], [585, 0.25, 6], [608, 0.3, 8], [643, 0.2, 6], [679, 0.2, 6], [752, 0.2, 6], [774, 0.3, 8], [837, 0.3, 6], [856, 0.3, 8], [957, 0.4, 10], [1139, 0.35, 6], [1174, 0.7, 12], [1212, 0.3, 6], [1319, 0.4, 10], [1412, 0.5, 10], [1451, 0.3, 6], [1499, 0.6, 12], [1575, 0.3, 6], [1632, 0.4, 10], [1779, 0.35, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state
export function worldAt(f, w) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const N = w.nt; if (!N) return;
  // the cab: drives in during 'ventures' (taxi 643), sits stalled at night with steam
  N.setCab(k === 'ventures' ? -14 + 14 * eo(618, 690, f) : 0, k === 'flops' || k === 'how' ? 1 : 0);
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const FD = (f, pos, opts = {}, extra = {}) => person(f, 'FUDA', 9, pos, { t: f, ...opts }, { s: 0.3, ...extra });
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') { A.push(P(f, 'NT_KID', 21, HM(-0.35, -0.9), { expr: f < 79 ? 'excited' : 'shock', prop: 'pad', view: 'back' }, { s: 0.8 })); A.push(P(f, 'NT_SIS', 22, HM(0.55, -0.6), { expr: f < 79 ? 'laugh' : 'surprised', view: f < 79 ? 'back' : '34L', cheer: f < 70 ? wav(f, 1, 0.3) : undefined }, { s: 0.78 }));
    if (f >= 72) A.push(FD(f, add3(HM(0.08, -1.35), [0, 0.06 * Math.max(0, 1 - (f - 72) / 8), 0]), { expr: f < 86 ? 'shock' : 'sly', pose: f < 86 ? 'shock' : 'shrug' }, { s: 0.28 * back(72, 82, f) + 0.001, blob: false })); }
  if (k === 'kyoto') { const t = sm(110, 186, f); A.push(P(f, 'NT_PASS', 31, ST(1.0 - 0.2 * t, 2.0 - 6 * t), { expr: 'smile', view: 'back' })); A.push(P(f, 'NT_PLAY2', 32, ST(-1.2 + 0.3 * t, -6 + 4 * t), { expr: 'happy', view: 'front' })); A.push(P(f, 'NT_FUSA', 11, ST(-2.3, 1.0), { expr: 'smile', view: '34R', prop: 'deck' })); }
  if (k === 'fusa') { A.push(P(f, 'NT_FUSA', 11, ST(-2.4, 1.1), { expr: f < 209 ? 'smile' : f < 242 ? 'proud' : 'happy', view: '34R', prop: f < 242 ? 'deck' : undefined, wave: f >= 242 ? wav(f, 0, 0.3) : undefined }));
    A.push(P(f, 'NT_PASS', 31, ST(-0.9, -1.2), { expr: f < 242 ? 'smile' : 'excited', view: '34L' })); }
  if (k === 'cards') { A.push(P(f, 'NT_FUSA', 11, SP(BX - 0.15, BZ - 0.75, 0.32), { expr: f < 300 ? 'determined' : 'happy', prop: 'brush', view: 'front' }, { roll: 0.02 * Math.sin(f * 0.5) }));
    if (f > 296) A.push(FD(f, SP(BX + 0.42, BZ + 0.18, BY), { expr: 'love', pose: f < 330 ? 'wave' : 'cheer' }, { s: 0.11 * back(296, 306, f) + 0.001, blob: false })); }
  if (k === 'loved') { const L = f >= 377; A.push(P(f, 'NT_PLAY1', 41, SP(TX - 1.05, TZ, 0.4), { expr: L ? 'laugh' : 'smile', mode: 'sit', prop: 'cards', view: '34R' }, { blob: false })); A.push(P(f, 'NT_PLAY2', 42, SP(TX + 1.05, TZ, 0.4), { expr: L ? 'happy' : 'smile', mode: 'sit', prop: 'card', view: '34L' }, { blob: false }));
    A.push(P(f, 'NT_PLAY3', 43, SP(TX, TZ - 0.85, 0.4), { expr: f < 410 ? 'smug' : 'laugh', mode: 'sit', view: 'front' }, { blob: false })); A.push(P(f, 'NT_FUSA', 11, SP(TX + 1.9, TZ - 1.2), { expr: 'proud', view: '34L', hip: 1 })); }
  if (k === 'hiro') { A.push(P(f, 'NT_HIRO', 51, OF(DX, DZ - 0.75), { expr: f < 525 ? 'thoughtful' : f < 585 ? 'determined' : 'excited', view: 'front', raise: f > 585 ? 1 : undefined, point: f > 548 && f < 585 ? 1 : undefined }));
    if (f > 540) A.push(FD(f, OF(DX + 0.85, DZ + 0.2, 0.8), { expr: f < 585 ? 'smile' : 'shock', pose: f < 585 ? 'stand' : 'shock' }, { s: 0.11 * back(540, 550, f) + 0.001, blob: false })); }
  if (k === 'ventures') { const t = eo(618, 690, f); if (f >= 690) A.push(P(f, 'NT_DRIVER', 61, ST(0.25, -4.4), { expr: 'happy', view: '34L', wave: wav(f, 0, 0.3) }, { s: back(690, 700, f) * 0.999 + 0.001 }));
    A.push(P(f, 'NT_GROCER', 62, ST(2.0, -1.4), { expr: f < 671 ? 'smile' : 'excited', prop: 'ricebox', view: '34L' })); A.push(P(f, 'NT_LADY60', 63, ST(-1.9, 0.6), { expr: f < 708 ? 'smile' : 'surprised', view: '34R' }));
    A.push(P(f, 'NT_HIRO', 51, ST(0.2, 1.6), { expr: f < 700 ? 'proud' : 'smug', view: 'back' })); A.push(FD(f, ST(1.7, -2.5), { expr: f < 708 ? 'happy' : 'sly', pose: f < 708 ? 'wave' : 'shrug' }, { s: 0.26 })); }
  if (k === 'flops') { A.push(P(f, 'NT_DRIVER', 61, ST(0.25, -4.0), { expr: f < 803 ? 'worried' : 'nervous', view: '34R' })); A.push(P(f, 'NT_UNION', 64, ST(0.6, -4.4), { expr: 'angry', prop: 'picket', view: '34L' })); A.push(P(f, 'NT_UNION', 65, ST(1.2, -5.4), { expr: 'determined', prop: 'picket', view: '34L' }));
    A.push(P(f, 'NT_GROCER', 62, ST(2.1, -1.5), { expr: f < 829 ? 'nervous' : 'shock', prop: 'ricebox', view: '34L' })); }
  if (k === 'how') { A.push(FD(f, ST(-0.35, -0.9), { expr: f < 874 ? 'sad' : f < 920 ? 'shock' : 'sly', pose: f < 874 ? 'stand' : f < 920 ? 'shrug' : 'point' }, { s: 0.3 })); }
  if (k === 'yokoi') { const ext = 0.15 + 0.8 * sm(1033, 1060, f) - 0.6 * sm(1065, 1080, f) + 0.6 * sm(1080, 1090, f); A.push(P(f, 'NT_YOKOI', 71, OF(2.2, -1.6), { expr: f < 998 ? 'thoughtful' : f < 1033 ? 'smile' : 'excited', prop: 'grabber', ext, view: '34L' }));
    A.push(FD(f, OF(2.95, -2.25, 0.92), { expr: f < 1040 ? 'smile' : 'love', pose: f < 1040 ? 'stand' : 'cheer' }, { s: 0.1, blob: false })); }
  if (k === 'boss') { const t = sm(1091, 1125, f); A.push(P(f, 'NT_YOKOI', 71, OF(2.2, -1.6), { expr: f < 1110 ? 'nervous' : 'happy', prop: 'grabber', ext: 0.3 + 0.5 * sm(1100, 1120, f), view: '34L' }));
    A.push(P(f, 'NT_HIRO', 51, OF(-0.3 + 1.3 * t, -0.5 - 0.5 * t), { expr: f < 1110 ? 'surprised' : f < 1139 ? 'smile' : 'excited', view: '34R', point: f > 1110 && f < 1139 ? 1 : undefined, raise: f >= 1139 ? 1 : undefined })); }
  if (k === 'fami') { A.push(P(f, 'NT_KID', 21, HM(-0.4, -0.95), { expr: f < 1368 ? 'excited' : 'happy', prop: 'pad', view: '34R' }, { s: 0.8 })); A.push(P(f, 'NT_SIS', 22, HM(0.6, -0.75), { expr: 'laugh', view: '34L', cheer: f > 1368 ? wav(f, 0, 0.3) : undefined }, { s: 0.78 }));
    A.push(FD(f, HM(-1.3, -0.4), { expr: 'happy', pose: 'cheer' }, { s: 0.22 })); }
  if (k === 'nes') { A.push(P(f, 'NT_KID', 21, HM(-0.2, -0.95), { expr: f < 1451 ? 'excited' : 'laugh', prop: 'pad', view: '34R', cheer: f > 1460 ? wav(f, 0, 0.3) : undefined }, { s: 0.8 })); A.push(P(f, 'NT_SIS', 22, HM(0.75, -0.6), { expr: 'excited', prop: 'pad', view: '34L' }, { s: 0.78 }));
    A.push(FD(f, HM(1.15, -1.35), { expr: f < 1451 ? 'smile' : 'love', pose: f < 1451 ? 'wave' : 'cheer', motif: 'pine' }, { s: 0.22 })); }
  if (k === 'twist') { A.push(P(f, 'NT_NOW', 81, SP(3.4, 1.15), { expr: f < 1536 ? 'smile' : f < 1575 ? 'surprised' : 'happy', prop: f > 1590 ? 'deck' : undefined, view: '34R', point: f > 1540 && f < 1590 ? 1 : undefined }));
    A.push(FD(f, SP(2.3, 0.25, 1.35), { expr: f < 1575 ? 'proud' : 'love', pose: f < 1575 ? 'hips' : 'cheer' }, { s: 0.16, blob: false })); }
  if (k === 'payoff') { A.push(P(f, 'NT_NOW', 81, ST(-2.1, 0.5), { expr: f < 1712 ? 'smile' : 'happy', prop: 'deck', view: '34R' }));
    A.push(FD(f, ST(-2.75, 1.0), { expr: f < 1753 ? 'happy' : 'love', pose: f < 1753 ? 'wave' : 'cheer' }, { s: 0.3 })); }
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
const wpuff = (f, f0, pos, size, F2, n = 16, tint) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'puff', t: (f - f0) / n, pos, size, tint }); };
const yearTick = (f, f0, f1, y0, y1) => String(Math.round(y0 + (y1 - y0) * sm(f0, f1, f)));
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { sboard(f, 4, ['VIDEO', 'GAMES'], 'hook', 0.0, 0.66, 3, 0.4, F2, 62); stamp(f, 78, ['PLAYING', 'CARDS?!'], 'hook', 0.0, 0.6, 2.6, 0.44, F2); sburst(f, 79, 'hook', 0.3, -0.25, 2.6, 0.5, F2); }
  if (k === 'kyoto') { sboard(f, 108, ['1889'], 'kyoto', 0.0, 0.68, 4, 0.42, F2, 154); sburst(f, 114, 'kyoto', 0.0, 0.7, 4, 0.45, F2, '#ffe0a0'); sboard(f, 156, ['KYOTO,', 'JAPAN'], 'kyoto', 0.0, 0.66, 4, 0.4, F2); }
  if (k === 'fusa') { sboard(f, 192, ['FUSAJIRO', 'YAMAUCHI'], 'fusa', 0.0, 0.66, 3, 0.46, F2, 240); sboard(f, 242, ['OPENS A', 'CARD SHOP'], 'fusa', 0.0, 0.66, 3, 0.46, F2); sburst(f, 242, 'fusa', 0.0, 0.66, 3, 0.5, F2); }
  if (k === 'cards') { sboard(f, 266, ['HANAFUDA'], 'cards', 0.0, 0.68, 1.2, 0.4, F2, 296); sboard(f, 298, ['FLOWER', 'CARDS'], 'cards', 0.0, 0.66, 1.2, 0.38, F2, 320); sboard(f, 322, ['PAINTED', 'BY HAND'], 'cards', 0.0, 0.66, 1.2, 0.4, F2); stars(f, 300, 'cards', 0.0, 0.3, 1.2, 0.5, F2, 24); }
  if (k === 'loved') { sboard(f, 367, ['PLAYERS', 'LOVED THEM'], 'loved', 0.0, 0.66, 3, 0.46, F2, 428); if (f > 430) F2.push({ fx: 'board', lines: [yearTick(f, 432, 456, 1889, 1950) + 's'.slice(0, f > 452 ? 1 : 0)], pos: SB('loved', 0.0, 0.68, 3), size: SWD('loved', 0.34, 3) * back(430, 440, f) }); }
  if (k === 'hiro') { sboard(f, 462, ['1960s'], 'hiro', 0.0, 0.7, 3, 0.3, F2, 520); sboard(f, 522, ['HIROSHI', 'YAMAUCHI'], 'hiro', 0.0, 0.66, 3, 0.44, F2, 545); bubble(f, 546, ['MORE THAN', 'CARDS!'], 'hiro', 0.1, 0.42, 3, 0.48, -1, F2, 583); stamp(f, 585, ['A LOT', 'MORE!'], 'hiro', 0.0, 0.6, 3, 0.4, F2); }
  if (k === 'ventures') { sboard(f, 640, ['TAXIS'], 'ventures', 0.0, 0.7, 3, 0.3, F2, 668); sboard(f, 670, ['INSTANT', 'RICE'], 'ventures', 0.0, 0.66, 3, 0.36, F2, 700); sboard(f, 704, ['REPORTEDLY...'], 'ventures', 0.0, 0.7, 3, 0.42, F2, 748); sboard(f, 750, ['SHORT-STAY', 'HOTELS'], 'ventures', 0.0, 0.66, 3, 0.44, F2);
    sburst(f, 643, 'ventures', 0.0, 0.7, 3, 0.4, F2); sburst(f, 679, 'ventures', 0.0, 0.66, 3, 0.4, F2, '#ffd8b0'); }
  if (k === 'flops') { stamp(f, 803, ['LABOR', 'TROUBLE'], 'flops', 0.0, 0.62, 3, 0.42, F2, 826); stamp(f, 836, ['FLOP!'], 'flops', 0.0, 0.62, 3, 0.36, F2);
    for (const f0 of [777, 790, 803, 816]) wpuff(f, f0, STa(-1.0, 0.95 + (f - f0) * 0.02, -4.5), 1.2, F2, 18, '#9a9aaa'); }
  if (k === 'how') { sboard(f, 870, ['HOW?!'], 'how', 0.0, 0.68, 2, 0.32, F2, 918); sboard(f, 920, ['CARDS', '→ VIDEO GAMES?'], 'how', 0.0, 0.66, 2, 0.5, F2); qmark(f, 878, 'how', -0.3, 0.3, 2, 0.12, F2); }
  if (k === 'yokoi') { sboard(f, 960, ['YOU SEE...'], 'yokoi', 0.0, 0.7, 3, 0.4, F2, 994); sboard(f, 996, ['GUNPEI', 'YOKOI'], 'yokoi', 0.0, 0.66, 3, 0.4, F2, 1030); sboard(f, 1032, ['EXTENDING', 'GRABBER ARM'], 'yokoi', 0.0, 0.66, 3, 0.48, F2, 1076); sboard(f, 1078, ['JUST', 'FOR FUN'], 'yokoi', 0.0, 0.66, 3, 0.36, F2); }
  if (k === 'boss') { sboard(f, 1093, ['THE BOSS', 'SAW IT'], 'boss', 0.0, 0.66, 3, 0.4, F2, 1136); stamp(f, 1139, ['HIT TOY!'], 'boss', 0.0, 0.62, 3, 0.4, F2); stars(f, 1144, 'boss', 0.0, 0.3, 3, 0.5, F2, 24); }
  if (k === 'gw') { sboard(f, 1176, ['TOYS →', 'ELECTRONICS'], 'gw', 0.0, 0.66, 0.2, 0.46, F2, 1208); sboard(f, 1210, ['1980'], 'gw', 0.0, 0.7, 0.2, 0.3, F2, 1248); sboard(f, 1250, ['GAME & WATCH'], 'gw', 0.0, 0.68, 0.2, 0.5, F2, 1298); sboard(f, 1300, ['A GAME IN', 'YOUR POCKET'], 'gw', 0.0, 0.66, 0.2, 0.46, F2); sburst(f, 1212, 'gw', 0.0, 0.7, 0.2, 0.4, F2); }
  if (k === 'fami') { sboard(f, 1322, ['1983'], 'fami', 0.0, 0.7, 3, 0.3, F2, 1364); sboard(f, 1366, ['FAMICOM', 'JAPAN'], 'fami', 0.0, 0.66, 3, 0.4, F2); sburst(f, 1368, 'fami', 0.0, 0.66, 3, 0.45, F2); }
  if (k === 'nes') { sboard(f, 1414, ['1985'], 'nes', 0.0, 0.7, 3, 0.3, F2, 1448); sboard(f, 1450, ['NES', 'AMERICA'], 'nes', 0.0, 0.66, 3, 0.36, F2); sburst(f, 1451, 'nes', 0.0, 0.66, 3, 0.45, F2, '#ffe0a0'); stars(f, 1460, 'nes', 0.0, 0.3, 3, 0.5, F2, 24); }
  if (k === 'twist') { stamp(f, 1502, ['THE TWIST'], 'twist', 0.0, 0.62, 3, 0.42, F2, 1530); sboard(f, 1534, ['NEVER STOPPED', 'MAKING CARDS'], 'twist', 0.0, 0.66, 3, 0.5, F2, 1598); sboard(f, 1600, ['STILL ON SALE', 'TODAY!'], 'twist', 0.0, 0.66, 3, 0.48, F2); sburst(f, 1575, 'twist', 0.0, 0.0, 3, 0.55, F2, '#fff3b0', 14); }
  if (k === 'payoff') { sboard(f, 1640, ['THE COMPANY', 'BEHIND YOUR GAMES...'], 'payoff', 0.0, 0.66, 3, 0.52, F2, 1748); stamp(f, 1752, ['A CARD MAKER'], 'payoff', 0.0, 0.62, 3, 0.44, F2, 1777); stamp(f, 1779, ['SINCE 1889'], 'payoff', 0.0, 0.62, 3, 0.44, F2); stars(f, 1790, 'payoff', 0.0, 0.25, 3, 0.55, F2, 24); }
  return F2;
}
