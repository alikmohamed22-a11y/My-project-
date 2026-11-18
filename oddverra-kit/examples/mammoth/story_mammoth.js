// [MM-story] "Woolly mammoths were still alive when the Great Pyramid was built" timeline. Beats are keyed to spoken words through
// mm_words.js (generated from work/words.json by work/mkwords.py), so a new voice take only needs a regenerated word table.
// Sets: mm_sets.js (island / giza / lab / map) through setAt. Pattern: story_bigben.js (slow push per shot, zoom-through whips on cuts,
// screen-pinned boards / stamps / bursts, punch-ins on beats). The motif is TUSKY's trumpet: he trumpets in front of the pyramid works
// (hook), is stranded on the island, trumpets as the herd grows, falls silent when the herd vanishes, and the payoff ends on a
// mammoth constellation over the finished pyramid. Home location: Wrangel Island in day, gold, dusk, dawn and storm night.
import * as S from './story.js';
import { WORDS } from './mm_words.js';
import { MAPT, islH, gzH } from './mm_sets.js';
const { sm, eo, back, add3, dist, q, person } = S;

// ---------- word clock
const wf = (w, k = 0) => { let n = 0; for (const r of WORDS) if (r[0] === w && n++ === k) return r[1]; throw new Error('word ' + w + ' #' + k); };
const we = (w, k = 0) => { let n = 0; for (const r of WORDS) if (r[0] === w && n++ === k) return r[2]; throw new Error('word ' + w + ' #' + k); };
const gap = (w, k = 0) => { let n = 0; for (let i = 0; i < WORDS.length; i++) if (WORDS[i][0] === w && n++ === k) return i ? Math.round((WORDS[i - 1][2] + WORDS[i][1]) / 2) : 0; throw new Error('gap ' + w); };
export const NF = WORDS[WORDS.length - 1][2] + 40;
// cut points sit in the pause before the first word of each shot
const B = { not: gap('not'), on: gap('on'), about: gap('about'), sci: gap('scientists'), mean: gap('meanwhile'), but: gap('but'), andno: gap('and', 2), then: gap('then'), so1: gap('so'), inb: gap('inbreeding'), you: gap('you'), so2: gap('so', 1) };
const SH = [
  [0, B.not, 'hook', 'gizaGold'],          // Woolly mammoths were still alive when the Great Pyramid was being built.
  [B.not, B.on, 'egypt', 'gizaGold'],      // Not in Egypt, obviously.
  [B.on, B.about, 'where', 'map'],         // On a lonely island in the Arctic Ocean: Wrangel Island.
  [B.about, B.sci, 'strand', 'map'],       // About ten thousand years ago, rising seas cut it off from Siberia, and a few mammoths got stranded.
  [B.sci, B.mean, 'eight', 'islandDay'],   // Scientists think the herd started with no more than eight.
  [B.mean, B.but, 'mainland', 'map'],      // Meanwhile, almost everywhere else, mammoths were dying out.
  [B.but, B.andno, 'grow', 'islandGold'],  // But this little herd held on. It grew to a few hundred, and lasted about six thousand years.
  [B.andno, B.then, 'myth', 'islandGold'], // And no, they weren't tiny. That's a myth. They were roughly mainland size.
  [B.then, B.so1, 'vanish', 'islandDusk'], // Then, around four thousand years ago... they vanished. Fast.
  [B.so1, B.inb, 'hunt', 'islandDawn'],    // So what happened? Hunters? Nope. People reportedly showed up a few centuries too late.
  [B.inb, B.you, 'dna', 'lab'],            // Inbreeding? Their DNA was in rough shape, but a 2024 study found the herd was slowly weeding out its worst mutations.
  [B.you, B.so2, 'storm', 'islandNight'],  // You see, a small island has no backup. One sudden disaster, maybe a disease, or rain that froze their food under ice, could take out everyone at once.
  [B.so2, NF, 'payoff', 'gizaNight'],      // So when the last mammoth died, the Great Pyramid was already about five centuries old.
];
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['mm', segAt(f)[3]];
export const SHOTS_MM = SH; export const WORD_AT = { wf, we, B };

// ---------- places (set-local -> world); island and giza actors stand on the terrain
const O = { island: [-174000, 0, 0], giza: [-174000, 0, 800], lab: [-176500, 0, 0], map: [-176500, 0, 800] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const IS = at(O.island), GZ = at(O.giza), LB = at(O.lab), MP = at(O.map);
const ISg = (x, z) => IS(x, islH(x, z), z), GZg = (x, z) => GZ(x, gzH(x, z), z);
const Y = MAPT.Y;
// trumpet beats of Tusky (the motif): exported for the sound cue sheet
let TRUMP = null; export const trumps = () => TRUMP || (TRUMP = { hook: [3], grow: [wf('held')], payoff: [wf('old') + 6] });

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(GZ(1.2, 1.3, 14.5), GZ(0.2, 6.5, -60), 50, 0.6, GZ(0.4, 1.8, 3)),
  egypt: C(GZ(2.4, 1.7, 13.6), GZ(1.0, 2.0, 2), 44, 1.2, GZ(0.8, 1.8, 3)),
  where: C(MP(0.1, Y + 1.7, 1.5), MP(0.2, Y, -0.45), 46, 1.4, MP(0.3, Y, -0.3)),
  strand: C(MP(0.8, Y + 1.05, 0.6), MP(0.72, Y, -0.22), 44, 2.0, MP(0.72, Y, -0.15)),
  eight: C(IS(0.4, 2.3, 19), IS(-0.4, 1.9, -2), 46, 1.0, IS(0, 1.6, 0)),
  mainland: C(MP(-0.15, Y + 1.0, 1.15), MP(-0.05, Y, -0.65), 46, 1.8, MP(-0.2, Y, -0.8)),
  grow: C(IS(0.6, 2.0, 15), IS(-0.6, 2.1, -4), 48, 1.0, IS(0, 1.6, 2)),
  myth: C(IS(-0.4, 1.4, 14), IS(1.3, 1.5, 1), 44, 1.4, IS(1.2, 1.3, 2.6)),
  vanish: C(IS(1.6, 1.9, 15), IS(-3, 2.2, -22), 46, 0.8, IS(0.8, 1.4, 4)),
  hunt: C(IS(11.0, 1.55, 6.0), IS(16.6, 1.1, -3.4), 46, 1.2, IS(15.6, 1.0, -2.6)),
  dna: C(LB(0.2, 1.65, 3.9), LB(0.9, 1.45, -0.8), 48, 1.4, LB(0.1, 1.3, 0.6)),
  storm: C(IS(1.2, 1.55, 13), IS(0.9, 1.4, -3), 48, 1.2, IS(0.9, 1.2, 1.6)),
  payoff: C(GZ(5, 1.5, 19), GZ(0.5, 14, -90), 52, 0.5, GZ(4, 1.4, 10)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.05, egypt: 0.1, where: 0, strand: 0.06, eight: 0.06, mainland: 0.08, grow: 0, myth: 0.08, vanish: 0.05, hunt: 0.08, dna: 0, storm: 0.08, payoff: 0 };
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function cam(k, f) {
  const s = segAt(f), w = wf; let c = push(V[k] || V.hook, PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const move = (P, L2, FP, f0, f1, fov) => { const t = sm(f0, f1, f); c = { ...c, p: lerp3(c.p, P, t), l: lerp3(c.l, L2, t), fp: lerp3(c.fp, FP || L2, t), fov: fov ? c.fov + (fov - c.fov) * t : c.fov }; };
  if (k === 'hook') { shake(1, 14, 0.18); punch(w('mammoths'), w('mammoths') + 6, 0.05); punch(w('alive'), w('alive') + 6, 0.05); move(GZ(2.6, 1.6, 20), GZ(0, 11, -90), GZ(0, 8, -80), w('great') - 8, w('built') + 6, 54); kick(w('built'), 0.3); }
  if (k === 'egypt') { punch(w('not'), w('not') + 5, 0.12); shake(w('not'), w('not') + 12, 0.05); punch(w('obviously'), w('obviously') + 6, 0.05); }
  if (k === 'where') { move(MP(1.05, Y + 0.8, 0.95), MP(0.95, Y, 0.02), MP(0.95, Y + 0.02, 0.05), s[0] + 4, w('wrangel') + 4, 42); punch(w('wrangel'), w('wrangel') + 6, 0.06); }
  if (k === 'strand') { punch(w('stranded'), w('stranded') + 6, 0.08); move(MP(1.2, Y + 0.45, 0.62), MP(0.95, Y + 0.02, 0.02), MP(0.95, Y + 0.02, 0.05), w('few', 0) - 6, w('stranded') + 4, 42); }
  if (k === 'eight') { punch(w('eight'), w('eight') + 6, 0.1); kick(w('eight'), 0.05); }
  if (k === 'mainland') { punch(w('dying'), w('dying') + 6, 0.06); }
  if (k === 'grow') { move(IS(-4, 13, 36), IS(-10, 0.5, -34), IS(-10, 0.5, -30), w('grew') - 6, w('hundred') + 10, 52); punch(w('six'), w('six') + 6, 0.05); }
  if (k === 'myth') { punch(w('tiny'), w('tiny') + 5, 0.08); punch(w('myth'), w('myth') + 5, 0.12); shake(w('myth'), w('myth') + 14, 0.1); }
  if (k === 'vanish') { punch(w('vanished'), w('vanished') + 6, 0.08); punch(w('fast'), w('fast') + 4, 0.1); move(IS(1.8, 1.5, 11.5), IS(1.6, 0.8, -3), IS(2.2, 0.4, -4.2), w('fast') + 6, w('fast') + 40, 40); }
  if (k === 'hunt') { punch(w('hunters'), w('hunters') + 5, 0.06); punch(w('nope'), w('nope') + 5, 0.1); kick(w('nope'), 0.06); punch(w('late'), w('late') + 6, 0.06); }
  if (k === 'dna') { punch(w('twenty'), w('twenty') + 6, 0.05); move(LB(2.0, 1.95, 2.0), LB(2.8, 1.75, -0.6), LB(2.8, 1.7, -0.6), w('found') - 4, w('weeding') + 4, 44); punch(w('worst'), w('worst') + 6, 0.06); }
  if (k === 'storm') { punch(w('backup'), w('backup') + 6, 0.08); punch(w('froze'), w('froze') + 6, 0.06); shake(w('everyone'), w('everyone') + 16, 0.12); punch(w('everyone'), w('everyone') + 6, 0.08); }
  if (k === 'payoff') { punch(w('last'), w('last') + 6, 0.04); move(GZ(5, 1.4, 19.5), GZ(3, 40, -150), GZ(3, 40, -150), w('already') - 4, NF - 16, 56); kick(w('old'), 0.5); }
  return c;
}
let CUTS = null, HARD = null;
export function camAt(f) {
  if (!CUTS) { HARD = new Set([B.on, B.inb]); CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g)); }
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
let FL = null;
export function gradeAt(f) {
  const w = wf;
  if (!FL) FL = [[w('alive'), 0.25, 6], [B.not, 0.5, 10], [B.on, 0.8, 14], [w('wrangel'), 0.3, 6], [B.about, 0.4, 10], [w('stranded'), 0.3, 6], [B.sci, 0.6, 12], [w('eight'), 0.3, 6], [B.mean, 0.5, 10], [B.but, 0.5, 10], [w('held'), 0.3, 8],
    [B.andno, 0.45, 10], [w('myth'), 0.4, 8], [B.then, 0.5, 12], [w('fast'), 0.5, 8], [B.so1, 0.45, 10], [w('nope'), 0.3, 6], [B.inb, 0.7, 12], [w('weeding'), 0.25, 6], [B.you, 0.6, 12], [w('disease'), 0.5, 5], [w('rain'), 0.6, 6], [w('everyone'), 0.5, 8], [B.so2, 0.6, 14], [w('old'), 0.35, 10]];
  let flash = 0; for (const [c, a, n] of FL) if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state
export function worldAt(f, wd) {
  const k = segAt(f)[2], w = wf;
  for (const n of ['road', 'stadium', 'office', 'car']) if (wd[n]) wd[n].visible = false;
  wd.dc.visible = false; wd.curRoom = null; wd.rooms.show(wd, null);
  const M = wd.mm; if (!M) return;
  const relic = M.parts.il.relic;
  M.setGone(0); M.setHerd(0); M.setIce(0); M.setRain(0); M.setRelic(0); M.setBoat(-1); M.setFlash(0); relic.rotation.y = 0; relic.position.set(2.2, islH(2.2, -4.2), -4.2);
  if (k === 'grow') M.setHerd(8 + 292 * sm(w('grew'), w('hundred') + 6, f));
  if (k === 'myth') M.setHerd(300);
  if (k === 'vanish') { M.setHerd(300); M.setGone(sm(w('vanished'), we('fast') + 2, f)); M.setRelic(f >= w('fast') + 8); }
  if (k === 'hunt') { M.setBoat(sm(B.so1 - 30, w('hunters') + 4, f)); M.setRelic(1); relic.position.set(13.2, islH(13.2, -1.4), -1.4); relic.rotation.y = -0.6; }
  if (k === 'storm') { M.setHerd(14); M.setRain(sm(w('rain') - 10, w('rain') + 4, f)); M.setIce(sm(w('froze') - 2, w('ice') + 6, f)); M.setFlash([w('disease'), w('rain'), w('everyone')].some((x) => f >= x && f < x + 4) ? 1 : 0); }
  M.setPyr(k === 'payoff' ? 1 : 0); M.setDrag(k === 'hook' || k === 'egypt' ? sm(0, B.on, f) : 0); M.setConst(k === 'payoff' ? sm(w('already') - 10, w('old') + 4, f) : 0);
  M.setWeed(k === 'dna' ? sm(w('weeding') - 4, we('mutations') + 10, f) : 0);
  M.setSea(k === 'strand' ? sm(w('rising') - 2, w('siberia') + 8, f) : k === 'mainland' ? 1 : 0);
  M.setMainland(k === 'mainland' ? 1 - sm(w('everywhere'), w('out') + 4, f) : 1);
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const TUSK = (f, seed, pos, opts = {}, extra = {}) => person(f, 'TUSKY', seed, pos, { t: f, ...opts }, { s: 2.3, k: 1.5, ...extra });
const tr = (f, k) => { for (const t0 of trumps()[k] || []) if (f >= t0 - 4 && f < t0 + 30) return q(Math.min(1, (f - t0 + 4) / 6) * (f > t0 + 22 ? 1 - (f - t0 - 22) / 8 : 1), 0.1); return 0; };
const walkPh = (f, sp = 0.032) => q((f * sp) % 1, 0.02);
const HERD8 = [[-3.6, -2.4, 1, 1, 0], [3.4, -3.0, 2, 0, 1], [-1.8, -6.5, 3, 1, 0], [2.2, -8.0, 4, 0, 1], [-5.8, -7.6, 5, 0, 0], [5.6, -6.2, 1, 1, 1], [0.4, -11, 2, 1, 0]];
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [], w = wf;
  if (k === 'hook' || k === 'egypt') {
    const x = -0.1 + 0.011 * Math.min(f, B.not), walking = k === 'hook';
    A.push(TUSK(f, 7, GZg(x, 3), { expr: k === 'hook' ? (f < 30 ? 'happy' : 'smile') : f < w('obviously') ? 'shock' : 'worried', walk: walking ? walkPh(f) : undefined, trunk: tr(f, 'hook'), look: k === 'egypt' ? -1 : 0 }, { s: 1.9 }));
    const sh = f >= w('built') - 4;
    A.push(P(f, 'MM_EGW1', 21, GZg(-0.8, -4.6), { expr: sh ? 'shock' : 'determined', view: '34L', prop: sh ? undefined : 'rope' }, { roll: sh ? 0 : -0.07 }));
    A.push(P(f, 'MM_EGW2', 22, GZg(0.6, -5.4), { expr: sh ? 'surprised' : 'determined', view: '34L', prop: sh ? undefined : 'rope' }, { roll: sh ? 0 : -0.07 }));
    A.push(P(f, 'MM_EGW3', 23, GZg(-6.4, -3.0), { expr: sh ? 'shock' : 'smile', view: '34R', point: sh ? 1 : undefined }));
    A.push(P(f, 'MM_BOSS', 24, GZg(5.4, -2.6), { expr: k === 'egypt' ? 'nervous' : sh ? 'shock' : 'proud', view: '34L', prop: 'rod', point: k === 'egypt' && f > w('obviously') ? 1 : undefined }, { s: 1.05 })); }
  if (k === 'eight') { const n = Math.min(8, 1 + Math.floor(Math.max(0, f - w('herd')) / 3));
    A.push(TUSK(f, 7, ISg(0.3, 2.5), { expr: f < w('eight') ? 'smile' : 'proud', chew: f < w('herd') ? 1 : 0 }));
    HERD8.forEach(([x, z, hv, fl, kid], i) => { if (i + 2 > n && f >= w('herd') && f < w('eight')) return; A.push(TUSK(f, 30 + i, ISg(x, z), { herd: hv, flip: !!fl, kid: !!kid, expr: f >= w('eight') && i % 2 ? 'happy' : 'smile', chew: i % 3 === 0 ? 1 : 0 }, { s: 2.2 })); }); }
  if (k === 'grow') { A.push(TUSK(f, 7, ISg(-1.2, 4.5), { expr: f < w('held') ? 'determined' : f < w('grew') ? 'happy' : 'proud', trunk: tr(f, 'grow') }));
    A.push(TUSK(f, 31, ISg(-3.2, 1.2), { herd: 2, kid: true, flip: true, expr: 'happy' }, { s: 2.2 })); }
  if (k === 'myth') { const t0 = w('myth'), grow = back(t0, t0 + 10, f), sz = f < w('tiny') ? 1 : f < t0 ? 0.28 : 0.28 + 0.72 * grow;
    A.push(TUSK(f, 7, ISg(0.6, 2.6), { expr: f < w('tiny') ? 'smile' : f < t0 ? 'shock' : f < w('roughly') ? 'proud' : 'sly' }, { s: 2.3 * sz }));
    A.push(TUSK(f, 32, ISg(-4.5, -3.5), { herd: 1, expr: f < t0 ? 'smile' : 'laugh' }, { s: 2.3 })); }
  if (k === 'vanish') { const g0 = w('fast'), fd = sm(g0 - 4, g0 + 8, f);
    if (fd < 1) A.push(TUSK(f, 7, ISg(0.9, 4.0), { expr: f < w('vanished') ? 'smile' : 'worried', look: f > w('vanished') ? (Math.sin(f * 0.15) > 0 ? 1 : -1) : 0, fade: q(fd, 0.1) })); }
  if (k === 'hunt') { const land = w('hunters') + 4, wk = (i) => sm(land + i * 6, land + 40 + i * 6, f);
    A.push(P(f, 'MM_HUNT1', 41, ISg(18.4 - 2.0 * wk(0), -2.0), { expr: f < w('nope') ? 'surprised' : f < w('late') ? 'thoughtful' : 'sad', view: '34R', prop: 'spear' }));
    A.push(P(f, 'MM_HUNT2', 42, ISg(18.9 - 1.8 * wk(1), -4.0), { expr: f < w('nope') ? 'smile' : 'shock', view: '34R', point: f > w('people') ? 1 : undefined })); }
  if (k === 'dna') A.push(P(f, 'MM_SCI', 51, LB(-0.4, 0, 0.6), { expr: f < w('dna') ? 'thoughtful' : f < w('but', 1) ? 'worried' : f < w('weeding') ? 'smile' : 'excited', view: '34R', prop: f < w('found') ? 'tube' : undefined, point: f >= w('found') ? 1 : undefined }));
  if (k === 'storm') { const cold = f >= w('froze');
    A.push(TUSK(f, 7, ISg(0.3, 1.6), { expr: f < w('backup') ? 'worried' : f < w('rain') ? 'sad' : 'cold', snow: 0.6, ice: cold ? q(sm(w('froze'), w('ice') + 8, f), 0.1) : 0, stomp: cold && f < w('could') ? q(Math.max(0, Math.sin((f - w('froze')) * 0.35)), 0.1) : 0 }));
    A.push(TUSK(f, 33, ISg(-3.8, -2.4), { herd: 3, flip: true, expr: f < w('rain') ? 'worried' : 'cold', snow: 0.8, ice: cold ? 0.7 : 0 }, { s: 2.2 }));
    A.push(TUSK(f, 34, ISg(3.6, -4.4), { herd: 4, kid: true, expr: 'worried', snow: 0.5, ice: cold ? 0.7 : 0 }, { s: 2.2 })); }
  if (k === 'payoff') { A.push(P(f, 'MM_EGW1', 61, GZg(3.3, 10.2), { expr: f < w('already') ? 'smile' : 'excited', view: '34R', point: f >= w('already') ? 1 : undefined, prop: 'lantern' }));
    A.push(P(f, 'MM_EGW3', 62, GZg(4.7, 9.4), { expr: f < w('old') ? 'surprised' : 'laugh', view: '34L' }, { s: 0.85 })); }
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
  const s = segAt(f), k = s[2], F2 = []; CURF = f; const w = wf;
  if (k === 'hook') { sburst(f, 2, 'hook', 0.3, 0.1, 3, 0.5, F2); sboard(f, w('woolly') - 1, ['WOOLLY', 'MAMMOTHS'], 'hook', 0.0, 0.66, 3, 0.42, F2, w('alive') - 2); stamp(f, w('alive'), ['STILL ALIVE'], 'hook', 0.0, 0.62, 3, 0.46, F2, w('great') - 2);
    sboard(f, w('great'), ['WHILE THE GREAT', 'PYRAMID WAS BUILT'], 'hook', 0.0, 0.66, 3, 0.56, F2); }
  if (k === 'egypt') { stamp(f, w('not'), ['NOT IN EGYPT!'], 'egypt', 0.0, 0.62, 2.4, 0.5, F2); sburst(f, w('not'), 'egypt', 0.0, 0.1, 2.4, 0.5, F2); qmark(f, w('not') + 4, 'egypt', 0.35, 0.28, 2.4, 0.1, F2); }
  if (k === 'where') { sboard(f, w('lonely') - 2, ['A LONELY', 'ISLAND...'], 'where', 0.0, 0.66, 2.4, 0.4, F2, w('arctic') - 2); sboard(f, w('arctic'), ['IN THE', 'ARCTIC OCEAN'], 'where', 0.0, 0.66, 2.4, 0.46, F2, w('wrangel') - 2);
    stamp(f, w('wrangel'), ['WRANGEL ISLAND'], 'where', 0.0, 0.62, 2.4, 0.56, F2); sburst(f, w('wrangel'), 'where', 0.2, -0.1, 2.4, 0.5, F2); }
  if (k === 'strand') { sboard(f, w('about') - 2, ['~10,000', 'YEARS AGO'], 'strand', 0.0, 0.66, 2.4, 0.42, F2, w('rising') - 2); sboard(f, w('rising'), ['RISING SEAS'], 'strand', 0.0, 0.68, 2.4, 0.44, F2, w('few') - 2);
    stamp(f, w('stranded'), ['STRANDED!'], 'strand', 0.0, 0.62, 2.4, 0.44, F2); sburst(f, w('stranded'), 'strand', 0.1, -0.1, 2.4, 0.45, F2); }
  if (k === 'eight') { sboard(f, w('scientists') - 2, ['THE WHOLE HERD', 'STARTED WITH...'], 'eight', 0.0, 0.66, 3, 0.52, F2, w('eight') - 2); stamp(f, w('eight'), ['8 OR FEWER'], 'eight', 0.0, 0.62, 3, 0.46, F2); sburst(f, w('eight'), 'eight', 0.0, 0.62, 3, 0.4, F2);
    if (f >= w('herd') && f < w('eight')) { const n = Math.min(8, 1 + Math.floor((f - w('herd')) / 3)); F2.push({ fx: 'rstamp', lines: [String(n)], pos: SB('eight', 0.0, 0.3, 3), size: SWD('eight', 0.3, 3), op: 1 }); } }
  if (k === 'mainland') { sboard(f, s[0] + 2, ['MEANWHILE,', 'EVERYWHERE ELSE...'], 'mainland', 0.0, 0.66, 2.4, 0.5, F2, w('dying') - 2); stamp(f, w('dying'), ['DYING OUT'], 'mainland', 0.0, 0.62, 2.4, 0.42, F2); }
  if (k === 'grow') { sboard(f, s[0] + 2, ['BUT THIS HERD', 'HELD ON'], 'grow', 0.0, 0.66, 3, 0.46, F2, w('grew') - 2); stars(f, w('held'), 'grow', 0.25, 0.25, 3, 0.4, F2, 24);
    if (f >= w('grew') && f < w('six') - 2) { const done = f >= w('hundred') + 6, n = Math.round(8 + 292 * sm(w('grew'), w('hundred') + 6, f)); F2.push({ fx: 'rstamp', lines: [done ? 'A FEW HUNDRED' : String(n)], pos: SB('grow', 0.0, 0.62, 3), size: SWD('grow', done ? 0.56 : 0.34, 3), op: 1 }); }
    stamp(f, w('six'), ['~6,000 YEARS'], 'grow', 0.0, 0.62, 3, 0.46, F2); }
  if (k === 'myth') { sboard(f, w('tiny') - 2, ['TINY?'], 'myth', 0.0, 0.68, 2.4, 0.3, F2, w('myth') - 1); stamp(f, w('myth'), ['MYTH!'], 'myth', 0.0, 0.62, 2.4, 0.36, F2, w('roughly') - 2); wpuff(f, w('myth'), ISg(0.6, 2.6).map((v, i) => v + (i === 1 ? 1.2 : 0)), 3.2, F2, 14, '#e8dcc8');
    sboard(f, w('roughly'), ['ROUGHLY', 'MAINLAND SIZE'], 'myth', 0.0, 0.66, 2.4, 0.48, F2); }
  if (k === 'vanish') { sboard(f, s[0] + 2, ['~4,000', 'YEARS AGO'], 'vanish', 0.0, 0.66, 3, 0.4, F2, w('vanished') - 2); stamp(f, w('vanished'), ['VANISHED'], 'vanish', 0.0, 0.62, 3, 0.44, F2, w('fast') - 1);
    stamp(f, w('fast'), ['FAST.'], 'vanish', 0.0, 0.62, 3, 0.34, F2); for (const [d, x] of [[0, -0.3], [3, 0.2], [6, 0.0]]) wpuff(f, w('fast') - 4 + d, IS(0.9 + x * 4, 1.4, 4.0), 3.6, F2, 18, '#c8b8d8'); }
  if (k === 'hunt') { sboard(f, s[0] + 2, ['WHAT', 'HAPPENED?'], 'hunt', 0.0, 0.66, 3, 0.4, F2, w('hunters') - 2); sboard(f, w('hunters'), ['HUNTERS?'], 'hunt', 0.0, 0.68, 3, 0.36, F2, w('nope') - 1); stamp(f, w('nope'), ['NOPE'], 'hunt', 0.0, 0.62, 3, 0.32, F2, w('people') - 2);
    sboard(f, w('people'), ['PEOPLE ARRIVED', 'CENTURIES LATER'], 'hunt', 0.0, 0.66, 3, 0.52, F2); qmark(f, w('late'), 'hunt', -0.3, 0.2, 3, 0.1, F2); }
  if (k === 'dna') { sboard(f, s[0] + 2, ['INBREEDING?'], 'dna', 0.0, 0.68, 2.4, 0.4, F2, w('dna') - 2); sboard(f, w('dna'), ['DNA IN', 'ROUGH SHAPE'], 'dna', 0.0, 0.66, 2.4, 0.42, F2, w('twenty') - 2);
    stamp(f, w('twenty'), ['2024 STUDY'], 'dna', 0.0, 0.62, 2.4, 0.42, F2, w('weeding') - 2); sboard(f, w('weeding'), ['WEEDING OUT', 'BAD MUTATIONS'], 'dna', 0.0, 0.66, 2.4, 0.5, F2);
    for (const d of [0, 6, 11, 17, 21]) sburst(f, w('weeding') + d, 'dna', 0.35, 0.05 + d * 0.01, 2.4, 0.18, F2, '#ff8a8a', 10); }
  if (k === 'storm') { sboard(f, w('you'), ['YOU SEE...'], 'storm', 0.0, 0.68, 2.4, 0.34, F2, w('backup') - 2); stamp(f, w('backup'), ['NO BACKUP'], 'storm', 0.0, 0.62, 2.4, 0.42, F2, w('disease') - 2);
    sboard(f, w('disease'), ['A DISEASE?'], 'storm', 0.0, 0.68, 2.4, 0.36, F2, w('rain') - 2); sboard(f, w('rain'), ['RAIN FREEZES', 'OVER THE FOOD'], 'storm', 0.0, 0.66, 2.4, 0.5, F2, w('everyone') - 2);
    stamp(f, w('everyone'), ['ALL AT ONCE'], 'storm', 0.0, 0.62, 2.4, 0.46, F2); }
  if (k === 'payoff') { sboard(f, s[0] + 2, ['THE LAST', 'MAMMOTH DIED...'], 'payoff', 0.0, 0.66, 3, 0.5, F2, w('already') - 2); stamp(f, w('already'), ['PYRAMID: ABOUT', '500 YEARS OLD!'], 'payoff', 0.0, 0.6, 3, 0.56, F2);
    sburst(f, w('old'), 'payoff', 0.0, 0.6, 3, 0.5, F2); stars(f, w('old') + 4, 'payoff', 0.0, 0.3, 3, 0.5, F2, 24); }
  return F2;
}
