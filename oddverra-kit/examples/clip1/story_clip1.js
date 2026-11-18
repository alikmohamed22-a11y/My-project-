// [CL-story] "The first speeding ticket was for 8 mph" timeline: the STORY panel of the Oddverra split-screen Short #1 (rendered at
// 1080x960 with ?ph=960; the stunt footage library fills the lower half). Cuts are keyed to the narration (web/cl_words.js, made by
// tools/mkwords.py from work/words.json), so the edit re-times itself to the voice. Fast split-screen pacing: a new angle every ~1.5-2.5 s.
// Sets: cl_sets.js (village / villageEve / lane / court / brighton) through setAt. The motif is the horseless carriage; the sidekick is a
// carriage horse (RVRIDE, no rider) who side-eyes the car; the constable rides CLBIKE (cl_cast.js).
import * as S from './story.js';
import { WORDS, NF_VOICE } from './cl_words.js';
const { sm, eo, back, add3, dist, q, person } = S;

// ---------- word cues
const W = (w, k = 0) => { const h = WORDS.filter((x) => x[2] === w); return (h[Math.min(k, h.length - 1)] || [0])[0]; };
export const NF = NF_VOICE;
const C0 = (w, k = 0, d = 3) => Math.max(0, W(w, k) - d); // cut a little before the word
const SH = [
  [0, 'hook', 'village'],                       // The first speeding ticket ever was for going eight miles an hour.
  [C0('january'), 'date', 'village'],           // January 1896.
  [C0('kent'), 'kent', 'village'],              // Kent, England.
  [C0('walter'), 'arnold', 'village'],          // Walter Arnold roars through the village of
  [C0('paddock'), 'pass', 'village'],           // Paddock Wood in his
  [C0('brandnew'), 'carriage', 'village'],      // brand-new horseless carriage.
  [C0('his', 1), 'speed', 'village'],           // His speed? Eight miles an hour.
  [C0('the', 2), 'limit', 'village'],           // The limit in town? Two.
  [C0('so'), 'bobby', 'village'],               // So a police constable hops
  [C0('on', 0), 'mount', 'village'],            // on his bicycle
  [C0('and', 0), 'chase', 'lane'],              // and gives chase,
  [C0('reportedly'), 'chase2', 'lane'],         // reportedly for five miles.
  [C0('and', 1), 'catch', 'lane'],              // And he catches him!
  [C0('in', 2), 'court', 'court'],              // In court, Arnold faces four charges,
  [C0('including'), 'nohorse', 'court'],        // including driving without a
  [C0('horse', 0, 6), 'window', 'court'],       // horse.
  [C0('the', 3), 'fine', 'court'],              // The fine for speeding? One shilling, plus costs.
  [C0('but'), 'law', 'villageEve'],             // But that same year, the law changed.
  [C0('the', 5), 'fourteen', 'villageEve'],     // The limit jumped to fourteen miles an hour,
  [C0('and', 2), 'run', 'brighton'],            // and drivers celebrated with a run from London to Brighton.
  [C0('you'), 'november', 'brighton'],          // You see, they still drive that run every November.
  [C0('all'), 'payoff', 'lane'],                // All because a cop on a bicycle caught a car doing eight.
].map((s, i, A) => [s[0], i + 1 < A.length ? A[i + 1][0] : NF, s[1], s[2]]);
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'golden', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.golden;
export const TALKER = {};
export const setAt = (f) => ['cl', segAt(f)[3]];

// ---------- places (set-local -> world)
const O = { village: [-160000, 0, 0], lane: [-160000, 0, 800], court: [-160000, 0, 1600], brighton: [-162500, 0, 0] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const VGa = at(O.village), LNa = at(O.lane), CTa = at(O.court), BRa = at(O.brighton);
const VG = (x, z, h = 0) => VGa(x, h, z), LN = (x, z, h = 0) => LNa(x, h, z), CT = (x, z, h = 0) => CTa(x, h, z), BR = (x, z, h = 0) => BRa(x, h, z);
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lin = (a, b, f) => clamp((f - a) / Math.max(1, b - a), 0, 1);

// ---------- vehicles (set-local). Car faces +z at yaw 0. seat offsets in car-local
const SEAT_D = [-0.32, 1.0, -0.62];
const seatW = (c, base) => { const y = c.yaw || 0, [x, h, z] = SEAT_D; return add3(base(c.x + x * Math.cos(y) + z * Math.sin(y), c.z - x * Math.sin(y) + z * Math.cos(y)), [0, h + 0.02 * Math.sin((c.dist || 0) * 3), 0]); };
function carV(f) { // village car per shot: {x, z, yaw, dist, run}
  const s = segAt(f), k = s[2], u = lin(s[0], s[1], f), mk = (x, z, yaw, run = 1) => ({ x, z, yaw, dist: Math.abs(z) + Math.abs(x), run });
  if (k === 'hook') return mk(1.0, -9.5 + 11 * eo(s[0] - 12, s[1] + 4, f), 0);
  if (k === 'date') return mk(1.0, -60 + 14 * u, 0);
  if (k === 'arnold') return mk(1.0, -16 + 11 * u, 0);
  if (k === 'pass') return mk(1.0, -3 + 12 * u, 0);
  if (k === 'carriage') return mk(1.0, -22 + 12 * u, 0);
  if (k === 'speed') return mk(1.0, -12 + 6 * u, 0);
  if (k === 'limit') { const v = lin(s[0] + 6, s[1], f); return mk(1.0, -14 + 22 * v, 0); }
  if (k === 'bobby' || k === 'mount') return mk(1.0, 6 + 14 * u, 0);
  if (k === 'fourteen') return mk(-1.0, -26 + 18 * u, 0);
  return null; }
const chaseZ = (f) => -10 - 4.2 * (f - SH.find((s) => s[2] === 'chase')[0]) / 30 * 2.2; // lane: the car heads -z (screen right from a camera at +x)
function carL(f) { const s = segAt(f), k = s[2];
  if (k === 'chase' || k === 'chase2') return { x: -0.6, z: chaseZ(f), yaw: Math.PI, dist: -chaseZ(f), run: 1 };
  if (k === 'catch') { const f0 = s[0], z0 = chaseZ(f0), u = eo(f0, f0 + 40, f); return { x: -0.6, z: z0 - 9 * u, yaw: Math.PI, dist: -(z0 - 9 * u), run: 1 - u, dip: 0.03 * Math.sin(Math.PI * lin(f0 + 20, f0 + 44, f)) }; }
  if (k === 'payoff') { const z = -6 - 7 * lin(s[0], s[1], f); return { x: -0.6, z, yaw: Math.PI, dist: -z, run: 1 }; }
  return null; }
function bikeL(f) { const s = segAt(f), k = s[2];
  if (k === 'chase') return { x: 1.2, z: chaseZ(f) + 5 - 1.5 * lin(s[0], s[1], f), sp: 1 };
  if (k === 'chase2') return { x: 1.2, z: chaseZ(f) + 3.5 - 2 * lin(s[0], s[1], f), sp: 1 };
  if (k === 'catch') { const c = carL(f), u = eo(s[0], s[0] + 30, f); return { x: 1.25, z: c.z + 4 - 2.4 * u, sp: 1 - 0.8 * eo(s[0] + 26, s[0] + 46, f) }; }
  if (k === 'payoff') { const c = carL(f); return { x: 1.25, z: c.z + 2.3, sp: 1 }; }
  return null; }
function convoy(f) { const s = segAt(f), u = (f - s[0]) / 30; if (s[3] !== 'brighton') return [];
  return [0, 1, 2, 3, 4].map((i) => { const z = -34 - i * 9 + u * 5.2 + (s[2] === 'november' ? 10 : 0); return { x: i % 2 ? -1.5 : 1.3, z, yaw: 0, dist: z, run: 1 }; }); }

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const mix = (a, b, t) => ({ p: lerp3(a.p, b.p, t), l: lerp3(a.l, b.l, t), fp: lerp3(a.fp, b.fp, t), fov: a.fov + (b.fov - a.fov) * t, cInf: a.cInf + (b.cInf - a.cInf) * t });
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
function cam(k, f) {
  const s = segAt(f); let c; const cv = carV(f), cl = carL(f), bk = bikeL(f);
  if (k === 'hook') { const cz = cv.z; c = C(VG(2.9, 7.5, 0.75), VG(0.7, Math.min(cz, 2), 1.1), 42, 1.4, VG(1.0, cz, 1.0)); }
  else if (k === 'date') c = C(VG(2.2, 16, 5.2 - 1.6 * sm(s[0], s[1], f)), VG(-0.5, -24, 2.4), 44, 0.8, VG(0, -12, 1));
  else if (k === 'kent') c = C(VG(-6.5, -17.5, 2.0 + 1.4 * sm(s[0], s[1], f)), VG(-16, -29, 6.5), 44, 1.0, VG(-17, -30, 5));
  else if (k === 'arnold') { const sp = seatW(cv, VG); c = C(VG(-1.6, cv.z + 4.2, 1.55), add3(sp, [0.3, 0.25, 0]), 40, 2.0, sp); }
  else if (k === 'pass') c = C(VG(-7.2, 9.5, 1.5), VG(-1.5, cv.z, 1.2), 44, 1.2, VG(-2.5, 3, 1));
  else if (k === 'carriage') { const z = cv.z; c = C(VG(7.6, z + 1.2, 1.5), VG(0.5, z, 1.05), 42, 1.6, VG(1, z, 1)); }
  else if (k === 'speed') { const sp = seatW(cv, VG); c = C(add3(sp, [0.3, 0.85, 2.5]), add3(sp, [0, 0.5, 0]), 38, 2.4, add3(sp, [0, 0.45, 0])); }
  else if (k === 'limit') c = C(VG(2.6, -1.4, 1.62), VG(3.85, -4.0, 1.6), 38, 1.8, VG(3.85, -4.0, 1.55));
  else if (k === 'bobby') c = C(VG(1.4, 0.8, 1.6), VG(3.6, -3.2, 1.7), 40, 1.6, VG(3.6, -3.0, 1.5));
  else if (k === 'mount') { const bz = 3.6 - 4 * eo(s[0] + 4, s[1] + 20, f); c = C(VG(8.5, bz - 1.0, 1.4), VG(2.6, bz - 0.8, 1.0), 44, 1.2, VG(3, bz, 1)); }
  else if (k === 'chase') { const mz = (cl.z + bk.z) / 2; c = C(LN(9.4, mz + 0.8, 1.95), LN(0, mz, 1.0), 46, 1.0, LN(0.3, mz, 1)); }
  else if (k === 'chase2') { const mz = (cl.z + bk.z) / 2; c = C(LN(15, mz + 4, 6.0), LN(0, mz - 1, 0.8), 42, 0.8, LN(0, mz, 1)); }
  else if (k === 'catch') { const mz = (cl.z + bk.z) / 2; c = C(LN(7.4, mz + 0.6, 2.2), LN(0.2, mz, 1.1), 44, 1.4, LN(0.5, mz, 1)); }
  else if (k === 'court') c = C(CT(0.6, 4.4, 2.7), CT(0.3, -4, 1.55), 50, 1.0, CT(0.5, -2.5, 1.5));
  else if (k === 'nohorse') c = C(CT(2.9, -0.4, 1.75), CT(4.0, -2.2, 1.72), 40, 2.0, CT(4.0, -2.18, 1.75));
  else if (k === 'window') c = C(CT(-0.6, 4.2, 1.7), CT(-3.4, 1.2, 1.3), 44, 1.6, CT(-3.4, 1.2, 1.2));
  else if (k === 'fine') c = C(CT(-0.2, -0.2, 2.25), CT(-0.9, -3.4, 1.95), 42, 1.8, CT(-0.9, -3.4, 2.0));
  else if (k === 'law') c = C(VG(2.5, -1.6, 1.6), VG(3.85, -4.0, 1.6), 40, 1.8, VG(3.85, -4.0, 1.55));
  else if (k === 'fourteen') { c = C(VG(2.3, 1.0, 1.4), VG(2.4, -8, 1.6), 44, 1.2, VG(3.6, -4, 1.5)); }
  else if (k === 'run') c = C(BR(2.6, 8, 1.6), BR(-0.2, -14, 2.4), 46, 1.0, BR(0, -6, 1.4));
  else if (k === 'november') c = C(BR(-7.5, 12, 7.5 + 2 * sm(s[0], s[1], f)), BR(0, -12, 1.6), 46, 0.8, BR(0, -10, 1));
  else if (k === 'payoff') { const mz = (cl.z + bk.z) / 2; c = C(LN(7.6, mz + 0.4, 2.2), LN(0.2, mz, 1.1), 44, 1.4, LN(0.4, mz, 1)); }
  else c = C(VG(0, 8, 2), VG(0, -10, 1.5), 44, 1);
  const PUSH = { date: 0.05, kent: 0.06, court: 0.08, limit: 0.1, law: 0.1, fine: 0.1, nohorse: 0.12, window: 0.1, run: 0.08, bobby: 0.1 };
  c = push(c, PUSH[k] ?? 0.0, s[0], s[1], f);
  const punch = (f0, a) => { const t = eo(f0, f0 + 6, f) * (1 - sm(f0 + 10, f0 + 40, f) * 0.5); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  if (k === 'hook') { punch(W('eight', 0), 0.14); kick(W('eight', 0), 0.05); shake(W('eight', 0), W('eight', 0) + 18, 0.03); shake(0, 20, 0.02); }
  if (k === 'speed') { punch(W('eight', 1), 0.12); kick(W('eight', 1), 0.04); }
  if (k === 'limit') { punch(W('two'), 0.16); shake(W('two'), W('two') + 16, 0.02); }
  if (k === 'mount') punch(W('bicycle'), 0.08);
  if (k === 'chase2') punch(W('five'), 0.1);
  if (k === 'catch') { punch(W('catches'), 0.14); kick(W('catches'), 0.05); shake(W('catches'), W('catches') + 14, 0.025); }
  if (k === 'court') punch(W('four'), 0.1);
  if (k === 'window') { punch(W('horse', 0), 0.14); kick(W('horse', 0), 0.04); }
  if (k === 'fine') { punch(W('shilling'), 0.12); punch(W('costs'), 0.05); }
  if (k === 'law') punch(W('changed'), 0.1);
  if (k === 'fourteen') { punch(W('fourteen'), 0.14); kick(W('fourteen'), 0.04); }
  if (k === 'run') punch(W('brighton'), 0.1);
  if (k === 'november') punch(W('november'), 0.08);
  if (k === 'payoff') { punch(W('caught'), 0.08); punch(W('eight', 2), 0.14); kick(W('eight', 2), 0.05); }
  return c;
}
const CUTS = SH.slice(1).map((s) => s[0]);
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -4 && d < 4) { const k = d < 0 ? (d + 5) / 5 : (4 - d) / 5; c.fov *= d < 0 ? 1 - 0.22 * k * k : 1 + 0.2 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0; const F = [[W('eight', 0), 0.4, 8], [W('eight', 1), 0.3, 6], [W('two'), 0.35, 8], [W('catches'), 0.4, 8], [W('horse', 0), 0.3, 6], [W('shilling'), 0.3, 6], [W('changed'), 0.6, 12], [W('fourteen'), 0.35, 8], [W('brighton'), 0.3, 8], [W('eight', 2), 0.45, 10]];
  for (const g of CUTS) F.push([g, 0.22, 5]);
  for (const [c, a, n] of F) if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'golden' };
}

// ---------- world state
export function worldAt(f, w) {
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const N = w.cl; if (!N) return; const s = segAt(f), k = s[2];
  const cv = carV(f), cl = carL(f);
  N.set({ car: cv ? cv : { vis: false }, laneCar: cl ? { ...cl } : { vis: false }, convoy: convoy(f),
    limit: k === 'law' ? sm(W('changed') - 2, W('changed') + 10, f) : k === 'fourteen' ? 1 : 0,
    charges: k === 'court' ? clamp(Math.floor((f - W('four') + 2) / 4) + 1, 0, 4) * (f >= W('four') - 2 ? 1 : 0) : (k === 'nohorse' || k === 'window' || k === 'fine') ? 4 : 0 });
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const seat = (f, o, seed, pos, expr, extra = {}) => ({ ...person(f, o, seed, pos, { mode: 'sit', expr, ...extra }, { blob: false }), drive: true });
const HORSE = (f, pos, opts = {}, s = 1.15) => person(f, 'RVRIDE', 41, pos, { t: f, speed: 0, ph: f * 0.02, coat: 'chestnut', blaze: 1, ...opts }, { s, blob: false });
const BIKE = (f, pos, sp, opts = {}) => person(f, 'CLBIKE', 5, pos, { t: f, speed: sp, rider: 'CL_BOBBY', riderExpr: 'determined', dust: '#c8b090', ...opts }, { s: 1.22, blob: false });
const sway = (f, a = 0.4) => q(0.5 + 0.5 * Math.sin(f * a), 0.1);
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = []; const cv = carV(f), cl = carL(f), bk = bikeL(f);
  const arnold = (expr, c = cv, base = VG, extra = {}) => A.push(seat(f, 'CL_ARNOLD', 7, seatW(c, base), expr, extra));
  if (['hook', 'date', 'arnold', 'pass', 'carriage', 'speed', 'limit', 'bobby', 'mount', 'fourteen'].includes(k) && cv) {
    const E = { hook: f < W('eight', 0) ? 'grin' : 'excited', date: 'grin', arnold: f < W('roars') ? 'smile' : 'excited', pass: 'grin', carriage: 'smug', speed: f < W('eight', 1) ? 'smug' : 'excited', limit: 'grin', bobby: 'whistle', mount: 'grin', fourteen: 'excited' }[k];
    arnold(E, cv, VG, k === 'fourteen' ? { cheer: sway(f, 0.45) } : {}); }
  if (k === 'hook') { const sc = f > 30;
    A.push(P(f, 'CL_VIL2', 21, VG(-4.2, -5.5), { expr: sc ? 'shock' : 'surprised', view: '34R', cheer: sc ? 1 : undefined }));
    A.push(P(f, 'CL_VIL1', 22, VG(4.3, -9), { expr: sc ? 'shock' : 'surprised', view: '34L', point: f > 50 ? 1 : undefined }));
    A.push(P(f, 'CL_VIL3', 23, VG(-4.6, -14), { expr: 'excited', view: '34R', cheer: sway(f, 0.5) }, { s: 0.8 }));
    A.push(HORSE(f, VG(-6.0, -10.5), { horseExpr: f > 40 ? 'shock' : undefined, flip: false })); }
  if (k === 'date') { A.push(P(f, 'CL_VIL4', 24, VG(-4.4, 2), { expr: 'smile', view: '34R' })); A.push(P(f, 'CL_VIL2', 21, VG(4.3, -3), { expr: 'happy', view: '34L' })); A.push(HORSE(f, VG(-5.8, -8.6), {}, 1.1)); }
  if (k === 'arnold' || k === 'pass') { A.push(P(f, 'CL_VIL1', 22, VG(-4.4, k === 'pass' ? 6 : -9), { expr: 'shock', view: '34R', point: 1 })); }
  if (k === 'carriage') { A.push(HORSE(f, VG(-5.4, cv.z - 4.6), { horseExpr: 'shock', flip: true }, 1.15)); A.push(P(f, 'CL_VIL2', 21, VG(-4.0, cv.z + 3.5), { expr: 'surprised', view: '34R' })); }
  if (k === 'limit') { A.push(P(f, 'CL_VIL4', 24, VG(4.6, -2.5), { expr: f < W('two') ? 'thoughtful' : 'shock', view: '34L', point: f > W('two') ? 1 : undefined })); }
  if (k === 'bobby') { A.push(P(f, 'CL_BOBBY', 5, VG(3.5, -3.0), { expr: f < W('police') + 6 ? 'surprised' : 'whistle', view: 'front', raise: f > W('police') ? 1 : undefined })); }
  if (k === 'mount') { const bz = 3.6 - 4 * eo(s[0] + 4, s[1] + 20, f); A.push(BIKE(f, VG(3.0, bz), clamp((f - s[0]) / 14, 0.2, 1), { riderExpr: 'determined', flip: false, bell: f > W('bicycle') ? 1 : 0 })); }
  if (k === 'chase' || k === 'chase2' || k === 'catch' || k === 'payoff') {
    const E = { chase: 'excited', chase2: 'nervous', catch: f < W('catches') + 6 ? 'nervous' : 'shock', payoff: f < W('caught') ? 'grin' : 'laugh' }[k];
    A.push(seat(f, 'CL_ARNOLD', 7, seatW(cl, LN), E));
    const RE = { chase: 'determined', chase2: 'determined', catch: f < W('catches') ? 'determined' : 'smug', payoff: f < W('caught') ? 'happy' : 'smug' }[k];
    A.push(BIKE(f, LN(bk.x, bk.z), bk.sp, { riderExpr: RE, hands: k === 'catch' && f > W('catches') - 4 ? 'up' : 'bars' }));
    if (k === 'payoff') A.push(HORSE(f, LN(-4.6, cl.z - 3.5), { horseExpr: f > W('caught') ? 'shock' : undefined, flip: true }, 1.1)); }
  if (k === 'court' || k === 'fine' || k === 'nohorse') {
    A.push(P(f, 'CL_MAG1', 31, CT(-0.9, -3.75, 0.95), { mode: 'sit', expr: k === 'fine' ? (f < W('shilling') ? 'thoughtful' : 'smug') : 'thoughtful', view: 'front', point: k === 'fine' && f > W('shilling') - 4 ? 1 : undefined }, { blob: false }));
    A.push(P(f, 'CL_MAG2', 32, CT(0.9, -3.75, 0.95), { mode: 'sit', expr: k === 'fine' ? 'smile' : 'thoughtful', view: 'front' }, { blob: false }));
    A.push(P(f, 'CL_ARNOLD', 7, CT(2.6, -0.6), { expr: k === 'court' ? (f < W('four') ? 'nervous' : 'shock') : k === 'fine' ? (f < W('shilling') ? 'worried' : 'relieved') : 'shock', view: '34L' }));
    A.push(P(f, 'CL_BOBBY', 5, CT(-2.2, -0.6), { expr: 'smug', view: '34R', point: k === 'court' && f > W('four') ? 1 : undefined }));
    A.push(P(f, 'CL_CLERK', 33, CT(-0.6, -1.4), { mode: 'sit', expr: 'thoughtful', view: 'front', prop: 'quill' }, { blob: false }));
    for (const [o, sd, x, z] of [['CL_VIL1', 22, -2.6, 1.9], ['CL_VIL2', 21, -0.9, 1.9], ['CL_VIL4', 24, 0.6, 2.95], ['CL_VIL3', 23, -3.4, 2.95]]) A.push(P(f, o, sd, CT(x, z, 0.05), { mode: 'sit', expr: k === 'fine' && f > W('shilling') ? 'laugh' : 'surprised', view: 'front' }, { blob: false, s: o === 'CL_VIL3' ? 0.8 : 1 })); }
  if (k === 'window') { A.push(HORSE(f, CT(-3.3, 1.15), { horseExpr: 'shock', flip: true }, 1.1)); A.push(P(f, 'CL_VIL2', 21, CT(-1.4, 1.9, 0.05), { mode: 'sit', expr: 'laugh', view: 'front' }, { blob: false })); A.push(P(f, 'CL_VIL1', 22, CT(-1.9, 2.95, 0.05), { mode: 'sit', expr: 'surprised', view: 'front' }, { blob: false })); }
  if (k === 'law') { A.push(P(f, 'CL_VIL4', 24, VG(4.8, -2.6), { expr: f < W('changed') ? 'thoughtful' : 'excited', view: '34L', cheer: f > W('changed') + 4 ? sway(f) : undefined })); }
  if (k === 'fourteen') { A.push(P(f, 'CL_BOBBY', 5, VG(4.4, -3.0), { expr: 'surprised', view: '34L' })); A.push(HORSE(f, VG(-5.6, -9.5), { horseExpr: 'shock' }, 1.1)); }
  if (k === 'run' || k === 'november') { convoy(f).forEach((c, i) => A.push(seat(f, i === 0 ? 'CL_ARNOLD' : i % 2 ? 'CL_DRIVER2' : 'CL_GENT', 60 + i, seatW(c, BR), i === 0 ? 'excited' : 'grin', { cheer: i === 0 ? sway(f + i * 5, 0.4) : undefined })));
    const CR = ['CL_GENT', 'CL_LADY', 'CL_VIL1', 'CL_VIL2', 'CL_VIL4', 'CL_VIL3', 'CL_GENT', 'CL_LADY'];
    for (let i = 0; i < 16; i++) { const side = i % 2 ? 1 : -1, z = 6 - Math.floor(i / 2) * 3.4 + (i % 4 < 2 ? 0 : 1.1), o = CR[i % 8];
      A.push(P(f, o, 70 + i, BR(side * (4.9 + (i % 3) * 0.6), z), { expr: i % 3 ? 'happy' : 'excited', view: side > 0 ? '34L' : '34R', cheer: sway(f + i * 7, 0.42), wave: i % 4 === 1 ? sway(f + i * 5, 0.4) : undefined }, { s: o === 'CL_VIL3' ? 0.8 : 1 })); } }
  return A;
}

// ---------- effects (screen-pinned boards / stamps for the 1080x960 panel)
const ASP = 1080 / 960; let CURF = 0;
function SB(k, x, y, z) { const c = cam(k, CURF), n = (v) => { const l = Math.hypot(...v); return v.map((u) => u / l); }, fw = n([c.l[0] - c.p[0], c.l[1] - c.p[1], c.l[2] - c.p[2]]), r = n([-fw[2], 0, fw[0]]), u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]], t = Math.tan(c.fov * Math.PI / 360);
  return [0, 1, 2].map((i) => c.p[i] + fw[i] * z + r[i] * x * t * ASP * z + u[i] * y * t * z); }
const SWD = (k, w, z) => 2 * w * z * Math.tan(cam(k, CURF).fov * Math.PI / 360) * ASP;
const board = (f, f0, lines, pos, size, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'board', lines, pos, size: size * back(f0, f0 + 10, f) }); };
const sboard = (f, f0, lines, k, x, y, z, w, F2, f1) => board(f, f0, lines, SB(k, x, y, z), SWD(k, w, z), F2, f1);
const sburst = (f, f0, k, x, y, z, w, F2, col = '#fff3b0', n = 12) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'burst', t: (f - f0) / n, pos: SB(k, x, y, z * 1.1), size: SWD(k, w, z * 1.1), col, rays: 10 }); };
const stamp = (f, f0, lines, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) { const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos: SB(k, x, y, z), size: SWD(k, w, z) * (1.6 - 0.6 * t * t), op: Math.min(1, t * 2) }); } };
const bubble = (f, f0, lines, k, x, y, z, w, tail, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'bubble', lines, tail, pos: SB(k, x, y, z), size: SWD(k, w, z) * back(f0, f0 + 8, f) }); };
const stars = (f, f0, k, x, y, z, w, F2, per = 30) => { if (f >= f0) F2.push({ fx: 'stars', t: ((f - f0) / per) % 1, pos: SB(k, x, y, z), size: SWD(k, w, z) * back(f0, f0 + 10, f) }); };
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f; const Y = 0.58; // boards sit in the upper part of the panel (the captions own the seam below)
  if (k === 'hook') { sboard(f, 2, ['THE FIRST', 'SPEEDING TICKET'], k, 0, Y, 3, 0.5, F2, W('eight', 0) - 1); stamp(f, W('eight', 0) - 1, ['8 M.P.H.!'], k, 0, Y, 3, 0.42, F2); sburst(f, W('eight', 0), k, 0.55, 0.45, 3, 0.3, F2); }
  if (k === 'date') sboard(f, s[0] + 2, ['JANUARY', '1896'], k, 0, Y, 3, 0.36, F2);
  if (k === 'kent') sboard(f, s[0] + 2, ['KENT,', 'ENGLAND'], k, 0, Y, 3, 0.36, F2);
  if (k === 'arnold') sboard(f, s[0] + 2, ['WALTER', 'ARNOLD'], k, 0, Y, 3, 0.36, F2);
  if (k === 'pass') sboard(f, s[0] + 2, ['PADDOCK WOOD'], k, 0, Y, 3, 0.44, F2);
  if (k === 'carriage') { sboard(f, s[0] + 2, ['HORSELESS', 'CARRIAGE'], k, 0, Y, 3, 0.44, F2); bubble(f, W('carriage') - 2, ['HEY!'], k, -0.5, 0.05, 3, 0.18, 1, F2); }
  if (k === 'speed') { sboard(f, s[0] + 2, ['HIS SPEED?'], k, 0, Y, 3, 0.4, F2, W('eight', 1) - 1); stamp(f, W('eight', 1) - 1, ['8 M.P.H.'], k, 0, Y, 3, 0.4, F2); sburst(f, W('eight', 1), k, 0.55, 0.45, 3, 0.3, F2); }
  if (k === 'limit') { sboard(f, s[0] + 2, ['THE LIMIT', 'IN TOWN?'], k, -0.45, Y, 3, 0.36, F2, W('two') - 1); stamp(f, W('two') - 1, ['2 M.P.H.!'], k, -0.45, Y, 3, 0.4, F2); }
  if (k === 'bobby') sboard(f, s[0] + 2, ['POLICE', 'CONSTABLE'], k, 0, Y, 3, 0.4, F2);
  if (k === 'mount') { bubble(f, s[0] + 4, ['STOP!'], k, 0.3, 0.3, 3, 0.2, 0, F2); }
  if (k === 'chase') sboard(f, s[0] + 2, ['THE CHASE'], k, 0, Y, 3, 0.36, F2);
  if (k === 'chase2') { const n = clamp(1 + Math.floor((f - s[0]) / Math.max(4, (W('five') - s[0]) / 4)), 1, 5); sboard(f, s[0] + 2, ['MILE ' + n], k, 0, Y, 3, 0.3, F2, W('five') - 1); stamp(f, W('five') - 1, ['5 MILES!'], k, 0, Y, 3, 0.38, F2); }
  if (k === 'catch') { stamp(f, W('catches') - 1, ['CAUGHT!'], k, 0, Y, 3, 0.4, F2); }
  if (k === 'court') { sboard(f, s[0] + 2, ['IN COURT'], k, 0, Y, 3, 0.32, F2, W('four') - 1); stamp(f, W('four') - 1, ['4 CHARGES'], k, 0, Y, 3, 0.42, F2); }
  if (k === 'nohorse') sboard(f, s[0] + 2, ['CHARGE #1'], k, 0, Y, 3, 0.32, F2);
  if (k === 'window') { stamp(f, W('horse', 0) - 1, ['NO HORSE?!'], k, 0, Y, 3, 0.44, F2); sburst(f, W('horse', 0), k, 0.55, 0.45, 3, 0.3, F2); }
  if (k === 'fine') { sboard(f, s[0] + 2, ['THE FINE?'], k, 0, Y, 3, 0.32, F2, W('shilling') - 1); stamp(f, W('shilling') - 1, ['1 SHILLING'], k, 0, Y, 3, 0.42, F2, W('costs') - 1); stamp(f, W('costs') - 1, ['+ COSTS'], k, 0, Y, 3, 0.34, F2); }
  if (k === 'law') { sboard(f, s[0] + 2, ['SAME YEAR...'], k, -0.45, Y, 3, 0.36, F2, W('changed') - 1); stamp(f, W('changed') - 1, ['NEW LAW!'], k, -0.45, Y, 3, 0.38, F2); sburst(f, W('changed'), k, 0.55, 0.45, 3, 0.3, F2); }
  if (k === 'fourteen') { stamp(f, W('fourteen') - 1, ['14 M.P.H.!'], k, 0, Y, 3, 0.42, F2); sburst(f, W('fourteen'), k, 0.55, 0.45, 3, 0.3, F2); }
  if (k === 'run') { sboard(f, s[0] + 2, ['14 NOV', '1896'], k, 0, Y, 3, 0.3, F2, W('london') - 1); stamp(f, W('london') - 1, ['LONDON → BRIGHTON'], k, 0, Y, 3, 0.6, F2); }
  if (k === 'november') { sboard(f, s[0] + 2, ['YOU SEE...'], k, 0, Y, 3, 0.32, F2, W('every') - 1); stamp(f, W('every') - 1, ['EVERY NOVEMBER'], k, 0, Y, 3, 0.56, F2); stars(f, W('november'), k, 0, 0.1, 3, 0.5, F2, 24); }
  if (k === 'payoff') { stamp(f, W('caught') - 1, ['CAUGHT AT'], k, 0, Y, 3, 0.4, F2, W('eight', 2) - 1); stamp(f, W('eight', 2) - 1, ['8 M.P.H.!'], k, 0, Y, 3, 0.44, F2); sburst(f, W('eight', 2), k, 0.55, 0.45, 3, 0.3, F2); }
  return F2;
}
export const SHOT_STARTS = SH.map((s) => s[0]); // [CL] used by finish_chain QA (boundary stills)
