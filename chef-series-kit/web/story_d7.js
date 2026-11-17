// Ep7 "Day 7 of 30": the owner is coming and Sam must feed 20 → a viewer's (great) Chicken Alfredo recipe for 20 → Sam follows it "his way":
// 30 BULBS of garlic, chicken to 74°C… and past it, max heat (the stove has two settings), the sauce splits, all the pasta water at once →
// Alfredo soup → the owner sips… asks for seconds → "The owner wants to meet you." → 23 days left.
// Select with ?story=d7. 30 fps. Voice: chefd7/audio/voice.wav (44.9 s, Jesse eleven_v4 take 2, gentle silence trim + atempo 1.08); words in words_d7.json.
// All usernames / app / brand names on screen are invented (@alfredo.angel_20, Loopr). The recipe text on screen is the viewer's recipe, verbatim in substance.
import { W, H, FPS, INK, clamp, lerp, lin, eOut, eIn, eInOut, eBack, hash } from './util.js';
import { drawBg, drawFg } from './bg.js';
import { drawPhone } from './phone.js';
import './phone_d2.js';
import './phone_d3.js';
import './phone_d4.js';
import './phone_d5.js';
import './phone_d6.js';
import './phone_d7.js';
import * as FX from './fx.js';
import './d2_art.js';
import * as D from './d3_art.js';
import * as E from './d4_art.js';
import './d5_art.js';
import * as A6 from './d6_art.js';
import * as A from './d7_art.js';
import { flame } from './bgkit.js';
import { drawChar, bounds } from './cast2d.js';

export const LEN = 1395;
export const CAPCONF = {
  file: 'words_d7.json',
  keyY: ['OWNER', '20', 'VIEWER', 'RECIPE', 'CHICKEN', 'ALFREDO', 'GREAT', '30', 'CLOVES', '74', 'LOW', 'TWO', 'OFF', 'SECONDS', '23', 'MEET', 'WORRIED'],
  keyR: ['BULBS', 'KEPT', 'GOING', 'MAX', 'SPLIT', 'ALL', 'SOUP', 'WAY', 'QUIET'],
  quotes: [[174, 262], [414, 460], [521, 588], [660, 714], [851, 941], [1258, 1300]],
};
const sec = (f) => f / FPS;

/* ---------------- acting helpers (as Ep5/6) ---------------- */
const k01 = (f, a, b) => clamp((f - a) / (b - a));
const io = (f, a, b) => eInOut(k01(f, a, b));
const ex = (f, at, from, to) => (f < at ? { expr: from } : { exprPrev: from, expr: to, exprT: f - at });
const ptw = (f, at, dur, from, to) => ({ pose: from, pose2: to, mix: io(f, at, at + dur) });
function take(f, at, amt = 0.16) { const a = f - at; if (a < 0 || a > 12) return 0; return a < 3 ? -amt * (a / 3) : amt * 0.7 * Math.sin((a - 3) / 9 * Math.PI) * (1 - (a - 3) / 9); }
function blinkAt(f, seed) { const per = 96 + (seed % 5) * 9, ph = (f + seed * 37) % per; return ph < 2 ? 1 : ph < 4 ? 0.5 : 0; }
function CH(ctx, name, fn, f) {
  const o = fn(f), seed = o.seed ?? name.length * 7;
  drawChar(ctx, name, { view: 'front', pose: 'stand', expr: 'neutral', look: [0, 0], blink: blinkAt(f, seed), seed, shadow: true, ...o, t: f, track: (t) => fn(t) });
  return o;
}
function B(name, o, f) { try { return bounds(name, { view: 'front', pose: 'stand', ...o, t: f }); } catch (e) { return null; } }
function headOf(name, o, f = 0) { const b = B(name, o, f); if (b && b.head) return b.head; return { x: o.x, y: o.y - o.h * 0.83, r: o.h * 0.16 }; }
function place(name, hx, hy, hr, o = {}) { const ref = headOf(name, { ...o, x: 0, y: 0, h: 1000 }); const h = hr / (ref.r / 1000); return { ...o, h, x: hx - ref.x * h / 1000, y: hy - ref.y * h / 1000 }; }
const DAY = { col: '#ffd9a0', amt: 0.12, dir: [1, -0.5] }, WARM = { col: '#ffcf7a', amt: 0.16, dir: [-1, -0.4] };
const PH = { x: 150, y: 120, w: 780, h: 1180 };
const phoneIn = (lf, d = 9) => lerp(1900, PH.y, eBack(k01(lf, 0, d)));
const KIT = (f, o = {}) => ({ t: sec(f), noPot: true, ...o });
const BANNER = (p, out = 0) => ({ app: 'MESSAGES', title: 'Head Chef 👨‍🍳', body: '11:30. The owner is on his way. 🕦', icon: '💬', iconCol: '#2fa75a', p, out, y: 110 });
const CMT = (p, out = 0) => ({ app: 'LOOPR', title: 'alfredo.angel_20 commented', body: 'Chicken Alfredo for 20 people 🍝 Ingredients…', icon: '💬', iconCol: '#7a3cff', p, out, y: 110 });
const SAM_SLEEVE = '#f2b52b';
const recipeBg = (ctx, lt) => { drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#eab54a', pattern: 'grid', t: lt }); FX.phoneGlow(ctx, 540, 800, 700, '#fff6c4', 0.3); };
// scroll offsets that bring each highlighted recipe line to mid-screen
const SCR = { top: 0, garlic: 200, chicken: 520, butter: 600, water: 900 };
const recipe = (ctx, lt, o) => drawPhone(ctx, { ...PH, state: 'recipe7', t: lt, time: '10:02', ...o });

/* ---------------- shots ---------------- */
export const SHOTS = [
  // ===== 0–32 "Day 7." — title card; the head chef's text drops in at once (hook: the owner)
  { a: 0, b: 32, cam: { s: [1, 1.06], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f6f66', col2: '#237a70', pattern: 'burst', t: lt, cy: H * 0.42 });
    FX.confetti(ctx, lt, { n: 30, seed: 11 });
    FX.titleCard(ctx, lt, { big: 'DAY 7', p: 0.4 + lf / 10, out: lin(27, 32, lf) });
    FX.notifBanner(ctx, BANNER((f - 2) / 7));
  } },
  // ===== 32–66 "The owner is coming," — Lumière: the reserved table and the owner's empty velvet chair
  { a: 32, b: 66, whip: 'r', cam: { s: [1.02, 1.1], f: [540, 1100], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_dining', { t: sec(f) });
    FX.phoneGlow(ctx, 540, 1150, 520, '#ffe7a8', 0.45);
    A.ownerChair(ctx, 540, 1150, 0.82);
    A.tableFront(ctx, 1230);
    A.reservedCard(ctx, 540, 1215, 1.2);
    FX.sparkle(ctx, 300, 1000, 1, lt); FX.sparkle(ctx, 800, 900, 0.8, lt + 1);
    FX.notifBanner(ctx, BANNER(1, lin(40, 48, f)));
    if (f >= 37) FX.tag(ctx, 540, 420, 'THE OWNER 👑', { col: '#ffd43b', tcol: INK, size: 92, rot: -0.04, p: (f - 37) / 5 });
  } },
  // ===== 66–138 "and Sam has to feed twenty people." — the hungry crew pops in, row by row
  { a: 66, b: 138, whip: 'l', cam: { s: [1.0, 1.05], f: [540, 900], drift: 2, snap: [{ at: 29, to: 1.08, dur: 6, f: [540, 900], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f6f66', col2: '#237a70', pattern: 'diag', t: lt }); FX.phoneGlow(ctx, 540, 900, 800, '#7ee0c8', 0.2);
    A6.crew(ctx, { n: 20, k: lin(70, 100, f), x0: 130, y0: 560, dy: 205, r: 60, t: lt, mouth: lin(100, 106, f) * 0.6 });
    FX.tag(ctx, 540, 250, 'FEED 20 🍽️', { col: '#fff', tcol: INK, size: 92, rot: -0.04, p: (f - 90) / 5 });
    if (f >= 112) FX.tag(ctx, 540, 380, '+ THE OWNER 😬', { col: '#ffd43b', tcol: INK, size: 64, rot: 0.04, p: (f - 112) / 5 });
  } },
  // ===== 138–172 "Sam isn't worried." — kitchen: Sam, chest out, very calm
  { a: 138, b: 172, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 800], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    CH(ctx, 'SAM', (t) => ({ x: 540, y: 1900, h: 1300, ...ptw(t, 139, 6, 'stand', 'proudChest'), ...ex(t, 145, 'neutral', 'smug'), look: [0, 0], light: DAY, rig: { squash: take(t, 146, 0.08) } }), f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f >= 152) FX.tag(ctx, 780, 330, 'NOT WORRIED 😎', { col: '#2fa75a', tcol: '#fff', size: 66, rot: 0.06, p: (f - 152) / 5 });
  } },
  // ===== 172–264 "'A viewer sent me a recipe. For twenty people.'" — Sam shows his phone, proud; the comment notification drops in
  { a: 172, b: 264, whip: 'l', cam: { s: [1.0, 1.06], f: [540, 860], drift: 2, snap: [{ at: 52, to: 1.08, dur: 6, f: [540, 820], over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    const o = CH(ctx, 'SAM', (t) => place('SAM', 520, 900, 150, { pose: 'phone', prop: 'phone', phoneGlow: 1, ...ex(t, 208, 'smug', 'proud'), look: [0, 0], light: DAY, rig: { squash: take(t, 224, 0.08), headNod: 0.1 } }), f);
    const hd = headOf('SAM', o, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    FX.notifBanner(ctx, CMT((f - 196) / 7, lin(250, 258, f)));
    FX.speechBubble(ctx, { x: 540, y: 440, text: f < 209 ? 'A viewer sent me a recipe. 📱' : 'A viewer sent me a recipe. For 20 people! 😎', tx: hd.x + 40, ty: hd.y - hd.r * 1.9, p: (lf - 1) / 6, size: 70, maxW: 860, hi: ['RECIPE.', '20'] });
  } },
  // ===== 264–358 "Chicken Alfredo. It's a great recipe." — the full comment; it scrolls; heart (330)
  { a: 264, b: 358, whip: 'r', cam: { s: [1.0, 1.04], f: [540, 800] }, draw(ctx, lf, f, lt) {
    recipeBg(ctx, lt);
    recipe(ctx, lt, { y: phoneIn(lf, 8), rot: (1 - k01(lf, 0, 8)) * 0.08, scroll: lerp(SCR.top, 860, io(f, 300, 352)), heart: lin(330, 336, f) });
    if (f >= 268) FX.tag(ctx, 300, 200, 'CHICKEN ALFREDO 🍝', { col: '#fff', tcol: INK, size: 60, rot: -0.05, p: (f - 268) / 5 });
    if (f >= 318) FX.tag(ctx, 800, 1210, 'GREAT RECIPE ✅', { col: '#2fa75a', tcol: '#fff', size: 58, rot: 0.06, p: (f - 318) / 5 });
  } },
  // ===== 358–405 "Sam followed it… his way." — Sam salutes the recipe; then a very confident smirk
  { a: 358, b: 405, whip: 'l', cam: { s: [1.0, 1.06], f: [540, 800], drift: 2, snap: [{ at: 33, to: 1.1, dur: 5, f: [540, 700], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    CH(ctx, 'SAM', (t) => ({ x: 540, y: 1900, h: 1300, ...ptw(t, 360, 6, 'stand', 'salute'), ...ex(t, 390, 'determined', 'smirk'), look: [0, 0], light: DAY, rig: { squash: take(t, 391, 0.1) } }), f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f >= 392) FX.tag(ctx, 540, 330, 'HIS WAY 😬', { col: '#ff4d4d', tcol: '#fff', size: 96, rot: -0.05, p: (f - 392) / 4 });
  } },
  // ===== 405–460 "'Thirty cloves of garlic.'" — the line highlights (414); one clove, for scale
  { a: 405, b: 460, whip: 'r', cam: { s: [1.0, 1.04], f: [540, 700], snap: [{ at: 12, to: 1.12, dur: 6, f: [540, 560], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    recipeBg(ctx, lt);
    recipe(ctx, lt, { y: phoneIn(lf, 6), scroll: SCR.garlic, hi: { garlic: lin(414, 424, f) }, heart: 1 });
    if (f >= 428) { A.garlicClove(ctx, 850, 1130, 1.3 * eBack(k01(f, 428, 434)), 0.2); FX.tag(ctx, 820, 960, '1 clove 🧄', { col: '#fff', tcol: INK, size: 52, rot: 0.06, p: (f - 430) / 5 }); }
  } },
  // ===== 460–518 "Sam used thirty bulbs." — whole bulbs rain into the pot (466–500); fumes; boom on "bulbs" (491)
  { a: 460, b: 518, whip: 'l', cam: { s: [1.0, 1.06], f: [540, 1000], drift: 2, snap: [{ at: 31, to: 1.12, dur: 6, f: [540, 900], over: 0.1 }], shake: [[31, 10, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'burner_cu', { t: sec(f), on: 0, knob: 0 });
    const N = 30, landed = (i) => f >= 466 + i * 1.1 + 7;
    let n = 0; for (let i = 0; i < N; i++) if (landed(i)) n++;
    D.pot(ctx, 540, 1330, 1.9, { fill: 0, t: lt, inside: (c, sy) => A.garlicPile(c, sy, n, lt) });
    for (let i = 0; i < N; i++) { const t0 = 466 + i * 1.1, k = (f - t0) / 7; if (k < 0 || k >= 1) continue; A.garlicBulb(ctx, 540 + (hash(i * 1.9) - 0.5) * 380, lerp(-200, 900, eIn(k)), 1.0, (hash(i) - 0.5) * 2 + k * 3, i); }
    if (f >= 488) A.fumes(ctx, 540, 820, lt, { n: 5, h: 420, spread: 520 });
    if (f >= 491) FX.boom(ctx, 540, 330, '30 BULBS!', (f - 491) / 4, { size: 130, col: '#ffd43b', burst: '#ff4d4d', rot: -0.05, t: lt });
    if (f >= 502) FX.tag(ctx, 800, 520, '(NOT CLOVES)', { col: '#fff', tcol: INK, size: 50, rot: 0.06, p: (f - 502) / 5 });
  } },
  // ===== 518–588 "'Cook the chicken to seventy-four degrees.'" — skillet; the probe climbs and lands on 74°C ✓ (562)
  { a: 518, b: 588, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 900], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'burner_cu', { t: sec(f), on: 0.6, knob: 0.5 });
    A.skillet(ctx, 520, 1060, 1.25, { char: 0.1 + 0.3 * k01(f, 520, 588), t: lt });
    const tmp = Math.round(lerp(4, 74, eOut(k01(f, 524, 562))));
    A.probeThermo(ctx, 640, 1030, 1.1, 0.35, { temp: tmp, ok: f >= 562 ? 1 : 0, t: lt });
    if (f >= 564) { FX.sparkle(ctx, 880, 520, 1.2, lt); FX.tag(ctx, 280, 480, '74°C ✅', { col: '#2fa75a', tcol: '#fff', size: 80, rot: -0.06, p: (f - 564) / 5 }); }
  } },
  // ===== 588–658 "Sam got there… and kept going." — the number keeps climbing (from 600), chicken goes to charcoal, smoke; ERR
  { a: 588, b: 658, cam: { s: [1.02, 1.08], f: [540, 900], drift: 2, shake: [[45, 25, 4]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'burner_cu', { t: sec(f), on: 1, knob: 1 });
    const k = k01(f, 602, 646);
    A.skillet(ctx, 520, 1060, 1.25, { char: 0.4 + 0.6 * k, t: lt });
    if (k > 0.3) FX.smoke(ctx, 520, 950, lt, { n: 7, spread: 520, rise: 800, size: 120 * k, alpha: k, col: '#5a5566' });
    const tmp = f >= 648 ? 'ERR' : Math.round(lerp(74, 260, eIn(k)));
    A.probeThermo(ctx, 640, 1030, 1.1, 0.35, { temp: tmp, ok: k < 0.05 ? 1 : 0, hot: k > 0.15 ? 1 : 0, shake: k, t: lt });
    if (f >= 630) FX.tag(ctx, 300, 300, 'KEPT GOING 🔥', { col: '#ff4d4d', tcol: '#fff', size: 80, rot: -0.06, p: (f - 630) / 5 });
  } },
  // ===== 658–714 "'Melt the butter on low heat.'" — step 4 highlighted ("low", 683)
  { a: 658, b: 714, whip: 'l', cam: { s: [1.0, 1.04], f: [540, 700], snap: [{ at: 25, to: 1.12, dur: 6, f: [540, 600], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    recipeBg(ctx, lt);
    recipe(ctx, lt, { y: phoneIn(lf, 6), scroll: SCR.butter, hi: { butter: lin(662, 674, f) }, heart: 1 });
    if (f >= 684) FX.tag(ctx, 790, 1180, 'LOW HEAT 🧈', { col: '#4fc3f7', tcol: INK, size: 60, rot: 0.06, p: (f - 684) / 5 });
  } },
  // ===== 714–764 "Sam's stove has two settings:" — Sam presents his stove (shrug)
  { a: 714, b: 764, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 860], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    CH(ctx, 'SAM', (t) => ({ x: 380, y: 1900, h: 1300, ...ptw(t, 716, 7, 'stand', 'point'), ...ex(t, 738, 'smirk', 'smug'), look: [0.6, 0.1], light: DAY, rig: { squash: take(t, 738, 0.06) } }), f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f >= 738) FX.tag(ctx, 760, 420, 'TWO SETTINGS:', { col: '#fff', tcol: INK, size: 70, rot: 0.05, p: (f - 738) / 5 });
  } },
  // ===== 764–820 "off, and max." — the big knob: OFF (775) … MAX (792): Sam's hand cranks it, flames roar
  { a: 764, b: 820, whip: 'l', cam: { s: [1.0, 1.04], f: [540, 900], snap: [{ at: 29, to: 1.14, dur: 5, f: [540, 900], over: 0.12 }], shake: [[30, 16, 9]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#2a2a33', col2: '#33333e', pattern: 'grid', t: lt });
    const hot = lin(796, 802, f), ang = eInOut(k01(f, 792, 798));
    if (hot > 0) for (let i = 0; i < 9; i++) flame(ctx, 60 + i * 120, 600 + Math.sin(i * 1.7) * 20, 3.6 * hot + 0.4 * Math.sin(lt * 9 + i), lt, i + 1, 0.6);
    A.knobPanel(ctx, 540, 950, { ang, offK: lin(774, 780, f), maxK: lin(791, 797, f), hot, t: lt });
    if (f >= 768) { const e = eOut(k01(f, 768, 776)); D.hand(ctx, 500 + ang * 40 - (1 - e) * 200, 1010 + ang * 10 + (1 - e) * 600, 1.4, 0.45 + ang * 0.5, SAM_SLEEVE); }
    if (f >= 797) FX.boom(ctx, 540, 300, 'MAX 🔥', (f - 797) / 4, { size: 150, col: '#ffd43b', burst: '#ff4d4d', rot: -0.05, t: lt });
  } },
  // ===== 820–851 "The sauce split." — on max: the cream cracks open into grease and curds (830–842); SPLIT! (835)
  { a: 820, b: 851, whip: 'r', cam: { s: [1.04, 1.08], f: [540, 1050], snap: [{ at: 15, to: 1.16, dur: 5, f: [540, 1000], over: 0.12 }], shake: [[15, 10, 7]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'burner_cu', { t: sec(f), on: 1, knob: 1 });
    A.saucePan(ctx, 500, 1000, 1.45, { split: lin(828, 840, f), boil: 1, t: lt });
    FX.steam(ctx, 500, 820, lt, { amt: 0.8, w: 420, h: 380 });
    if (f >= 835) FX.boom(ctx, 540, 380, 'SPLIT! 💔', (f - 835) / 4, { size: 140, col: '#ffd43b', burst: '#ff4d4d', rot: 0.05, t: lt });
  } },
  // ===== 851–941 "'Don't add all the pasta water at once.'" — the tip, highlighted in red as it's read; "NOTED" (918)
  { a: 851, b: 941, whip: 'l', cam: { s: [1.0, 1.05], f: [540, 800], snap: [{ at: 26, to: 1.1, dur: 6, f: [540, 640], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    recipeBg(ctx, lt);
    recipe(ctx, lt, { y: phoneIn(lf, 6), scroll: SCR.water, hi: { water: lin(853, 926, f) }, heart: 1 });
    if (f >= 856) FX.tag(ctx, 300, 200, '⚠️ TIP', { col: '#ff4d4d', tcol: '#fff', size: 70, rot: -0.06, p: (f - 856) / 5 });
    if (f >= 920) FX.tag(ctx, 800, 1200, 'NOTED ✅', { col: '#2fa75a', tcol: '#fff', size: 64, rot: 0.06, p: (f - 920) / 5 });
  } },
  // ===== 941–1016 "He added all the pasta water at once." — the big pot tips in from the top; SPLOOSH on "once" (994)
  { a: 941, b: 1016, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 1000], drift: 2, snap: [{ at: 53, to: 1.12, dur: 5, f: [540, 1000], over: 0.12 }], shake: [[53, 14, 8]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'burner_cu', { t: sec(f), on: 1, knob: 1 });
    const tip = eInOut(k01(f, 944, 960)), pour = lin(958, 964, f) * (1 - lin(1000, 1008, f)), rise = lin(965, 1000, f);
    A.saucePan(ctx, 500, 1000, 1.45, { split: 1 - rise, soup: rise, rise, slosh: rise, boil: 1, t: lt });
    if (pour > 0) D.stream(ctx, 800, 470, 520, 1010, lt, 90 * pour, '#e8f2f6');
    ctx.save(); ctx.translate(lerp(1300, 1000, eOut(k01(f, 942, 952))), lerp(-100, 230, eOut(k01(f, 942, 952)))); ctx.rotate(lerp(-3.0, -2.45, tip)); D.pot(ctx, 0, 0, 1.4, { fill: 0, t: lt }); ctx.restore();
    if (f >= 994 && f < 1008) FX.dustPuff(ctx, 500, 980, (f - 994) / 14, { n: 9, spread: 520, size: 70, col: '#e8f2f6' });
    if (f >= 994) FX.boom(ctx, 540, 330, 'SPLOOSH!', (f - 994) / 4, { size: 130, col: '#9fd3e8', burst: '#2f7cf6', rot: -0.05, t: lt });
    if (f >= 1000) FX.tag(ctx, 300, 560, 'ALL AT ONCE 💦', { col: '#ff4d4d', tcol: '#fff', size: 60, rot: -0.06, p: (f - 1000) / 5 });
  } },
  // ===== 1016–1076 "It was Alfredo soup." — the bowl: thin, with fettuccine afloat, a charcoal cube and one whole bulb; the ladle pours
  { a: 1016, b: 1076, whip: 'l', cam: { s: [1.0, 1.05], f: [540, 1000], drift: 2 }, draw(ctx, lf, f, lt) {
    ctx.save(); ctx.translate(0, -250); drawBg(ctx, 'counter_cu', { t: sec(f) });
    A.soupBowl(ctx, 540, 1420, 1.45, { level: 1, t: lt });
    A.ladle(ctx, 700, 900, 1.0, 0.25, { pour: lin(1022, 1028, f), t: lt, drop: 240 });
    ctx.restore();
    if (f >= 1028) FX.boom(ctx, 540, 330, 'ALFREDO SOUP 🥣', (f - 1028) / 4, { size: 110, col: '#fff', burst: '#e0a93b', rot: -0.04, t: lt });
  } },
  // ===== 1076–1124 "The owner took one sip…" — Lumière: the owner from behind in his chair; the crew and Sam watch; sip (1104)
  { a: 1076, b: 1124, whip: 'r', cam: { s: [1.0, 1.06], f: [540, 900], drift: 1 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_dining', { t: sec(f) });
    const xs = [110, 250, 390, 690, 950];
    xs.forEach((x, i) => A6.miniChef(ctx, x, 720 + (i % 2) * 20, 58, { seed: i + 4, look: (540 - x) / 900 }));
    const so = CH(ctx, 'SAM', (t) => place('SAM', 830, 700, 62, { expr: 'nervous', look: [-0.6, 0.3], sweat: 1, light: WARM }), f);
    A.tableFront(ctx, 1000);
    A.soupBowl(ctx, 360, 1080, 0.6, { level: 0.8, t: lt, garlic: false });
    A.ownerBack(ctx, 540, 1950, 1.25, { spoon: io(f, 1084, 1102), t: lt });
    A.ownerChair(ctx, 540, 1950, 0.95);
    if (f >= 1080) FX.tag(ctx, 540, 260, 'THE OWNER 👑', { col: '#ffd43b', tcol: INK, size: 80, rot: -0.04, p: (f - 1080) / 5 });
    if (f >= 1104) FX.boom(ctx, 880, 1120, 'SLURP', (f - 1104) / 3, { size: 90, col: '#fff', burst: null, rot: 0.1, t: lt });
  } },
  // ===== 1124–1155 "went quiet…" — Sam, frozen, sweating; the room goes dark and still
  { a: 1124, b: 1155, whip: 'l', cam: { s: [1.02, 1.1], f: [540, 800] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_dining', { t: sec(f) });
    FX.tint(ctx, '#0d0a20', 0.35);
    const o = CH(ctx, 'SAM', (t) => place('SAM', 540, 860, 230, { expr: 'nervous', look: [0, 0], blink: 0, sweat: 1, light: WARM, rig: { squash: Math.sin(t * 3.1) * 0.004 } }), f);
    const hd = headOf('SAM', o, f);
    FX.sweatDrop(ctx, hd.x + hd.r * 1.05, hd.y - hd.r * 0.6, 1.3, lt, (lf % 13) * 6);
    FX.tag(ctx, 540, 300, '…', { col: '#fff', tcol: INK, size: 110, rot: -0.03, p: (f - 1127) / 5 });
  } },
  // ===== 1155–1188 "and asked for seconds." — his hand pushes the empty bowl forward: "Seconds."
  { a: 1155, b: 1188, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 1000], snap: [{ at: 22, to: 1.1, dur: 5, f: [540, 900], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#8a2440', col2: '#7a1f3a', pattern: 'dots', t: lt });
    A.tableFront(ctx, 760, { col: '#fbfaf6' });
    const push = eOut(k01(f, 1158, 1170)), by = lerp(1060, 1250, push);
    A.soupBowl(ctx, 540, by, 1.25, { level: 0, t: lt, spoon: 1 });
    A.ownerHand(ctx, 540, by - 300, 1.1, 0);
    FX.speechBubble(ctx, { x: 540, y: 300, text: 'Seconds.', tx: 540, ty: -100, p: (f - 1176) / 5, size: 110, maxW: 800, hi: ['SECONDS.'] });
  } },
  // ===== 1188–1205 (reaction) — Sam: it worked?! confetti
  { a: 1188, b: 1205, whip: 'l', cam: { s: [1.0, 1.06], f: [540, 800] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#eab54a', pattern: 'burst', t: lt, cy: 900 });
    CH(ctx, 'SAM', (t) => place('SAM', 540, 820, 210, { pose: 'cheer', expr: 'excited', look: [0, 0], rig: { squash: take(t, 1189, 0.12) } }), f);
    FX.confetti(ctx, lt, { n: 40, seed: 21 });
    FX.tag(ctx, 540, 280, 'HE LIKED IT?! 🎉', { col: '#fff', tcol: INK, size: 80, rot: -0.04, p: (f - 1189) / 4 });
  } },
  // ===== 1205–1296 "Then the head chef texted: 'The owner wants to meet you.'" — thread: typing, then the message; "meet you" highlighted (1282)
  { a: 1205, b: 1296, whip: 'r', cam: { s: [1.0, 1.04], f: [540, 800], snap: [{ at: 77, to: 1.16, dur: 6, f: [460, 740], over: 0.1 }], shake: [[77, 10, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#3b1f5c', col2: '#43246a', pattern: 'dots', t: lt });
    FX.phoneGlow(ctx, 540, 800, 700, f >= 1258 ? '#ff4d4d' : '#e6b84a', 0.25);
    drawPhone(ctx, { ...PH, y: phoneIn(lf, 7), state: 'chef7', t: lt, typing: f >= 1218, n: lin(1258, 1264, f), hi: lin(1282, 1290, f), time: '1:14' });
    if (f >= 1222 && f < 1258) FX.tag(ctx, 300, 1180, 'typing… 😰', { col: '#fff', tcol: INK, size: 60, rot: -0.06, p: (f - 1222) / 5 });
  } },
  // ===== 1296–1314 (reaction) — Sam's panic close: MEET ME?!
  { a: 1296, b: 1314, whip: 'l', cam: { s: [1.0, 1.06], f: [540, 800], snap: [{ at: 1, to: 1.1, dur: 4, f: [540, 760], over: 0.12 }] }, impact: { at: 0, n: 2, type: 'red', col: '#ff4d4d' }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#b8432f', col2: '#c44c37', pattern: 'burst', t: lt * 0.3, cy: 900 });
    const o = CH(ctx, 'SAM', (t) => place('SAM', 540, 900, 240, { expr: 'panic', look: [0, 0], blink: 0, sweat: 1, rig: { squash: take(t, 1297, 0.14) + Math.sin(t * 3.1) * 0.006 } }), f);
    const hd = headOf('SAM', o, f);
    FX.sweatDrop(ctx, hd.x + hd.r * 1.05, hd.y - hd.r * 0.5, 1.3, lt, 0);
    FX.tag(ctx, 540, 300, 'MEET ME?! 😱', { col: '#ffd43b', tcol: INK, size: 96, rot: -0.05, p: (f - 1298) / 4 });
  } },
  // ===== 1314–1395 "Twenty-three days left." — calendar, card (1318), CTA (1352)
  { a: 1314, b: LEN, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 900], shake: [[4, 18, 9]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f2457', col2: '#262c66', pattern: 'grid', t: lt });
    drawPhone(ctx, { ...PH, state: 'calendar', t: lt, p: lin(1315, 1321, f), pill: lin(1317, 1321, f), time: '1:15', day: 7, pillText: '⏳ 23 days left' });
    if (f >= 1318) { FX.tint(ctx, '#0d0a20', 0.5 * lin(1318, 1323, f)); FX.confetti(ctx, lt, { n: 30, seed: 19 }); FX.daysLeftCard(ctx, lt, (f - 1318) / 8, '23'); }
    if (f >= 1352) FX.tag(ctx, 540, 1250, 'WHAT SHOULD SAM COOK FOR THE OWNER? 👇', { col: '#ffd43b', tcol: INK, size: 42, rot: -0.03, p: (f - 1352) / 6 });
  } },
];
