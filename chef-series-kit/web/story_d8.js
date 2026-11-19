// Ep8 "Day 8 of 30": a viewer's 3 tips for meeting the owner → Sam follows all three, his way: a rented suit three sizes too big
// (+ rain boots, Mom texts), pasta / garlic bread (Day 7's leftover bulbs) / one-leaf salad, the pasta joins the pizza on the ceiling fan,
// "be polite" → a bow so deep he headbutts the table, "Your Majesty!" → the owner (first face reveal) laughs: Alfredo soup goes on the menu,
// and tomorrow Sam cooks it for the city's toughest critic → "Bro…" → 22 days left.
// Select with ?story=d8. 30 fps. Voice: chefd8/audio/voice.wav (31.2 s, Jesse eleven_v4 take 1, silenceremove + atempo 1.08); words in words_d8.json.
// All usernames / app / brand names on screen are invented (@pastel.spatula_tips, @ironpalate_nofivestars, Loopr). The viewer's tips are shown
// close to how they were posted (the episode answers that comment).
import { W, H, FPS, INK, clamp, lerp, lin, eOut, eIn, eInOut, eBack, hash } from './util.js';
import { drawBg, drawFg } from './bg.js';
import { drawPhone } from './phone.js';
import './phone_d2.js';
import './phone_d7.js';
import './phone_d8.js';
import * as FX from './fx.js';
import * as A2 from './d2_art.js';
import * as D from './d3_art.js';
import './d4_art.js';
import './d5_art.js';
import * as A6 from './d6_art.js';
import * as A7 from './d7_art.js';
import * as A from './d8_art.js';
import { drawChar, bounds } from './cast2d.js';

export const LEN = 970;
export const CAPCONF = {
  file: 'words_d8.json',
  keyY: ['8', 'TIPS', 'OWNER', 'PROFESSIONAL', 'SUIT', 'PASTA', 'GARLIC', 'SALAD', 'PIZZA', 'POLITE', 'MAJESTY', '22', 'MENU', 'ALFREDO', 'TOMORROW', 'SERVE'],
  keyR: ['THREE', 'BIG', 'FAN', 'HEADBUTTED', 'TABLE', 'TOUGHEST', 'CRITIC', 'SOUP', 'BRO'],
  quotes: [[615, 650], [688, 822], [822, 852]],
};
const sec = (f) => f / FPS;

/* ---------------- acting helpers (as Ep5–7) ---------------- */
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
const tipsBg = (ctx, lt, col = '#c2457a', col2 = '#cc5085') => { drawBg(ctx, 'solid', { col, col2, pattern: 'grid', t: lt }); FX.phoneGlow(ctx, 540, 800, 700, '#ffd6ea', 0.3); };
const tips = (ctx, lt, o) => drawPhone(ctx, { ...PH, state: 'tips8', t: lt, time: '9:41', ...o });
const MOM = (p, out = 0) => ({ app: 'MESSAGES', title: 'Mom 💐', body: 'Is that a suit or a TENT?? 😭', icon: '💬', iconCol: '#2fa75a', p, out, y: 110 });
// the owner seated at his table at Lumière (face reveal); hx/hy/hr = head
function ownerAtTable(ctx, f, hx, hy, hr, o = {}) {
  const oo = place('OWNER', hx, hy, hr, { look: [-0.4, 0.1], light: WARM, ...o });
  A7.ownerChair(ctx, hx, hy + hr * 6.2, hr / 140);
  CH(ctx, 'OWNER', () => oo, f);
  return oo;
}

/* ---------------- shots ---------------- */
export const SHOTS = [
  // ===== 0–35 "Day 8." — HOOK, full from frame 0: DAY 8 badge + "MEETING THE OWNER… IN THIS 😱" + Sam in the giant suit and rain boots
  { a: 0, b: 35, cam: { s: [1.0, 1.05], f: [540, 900], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#b8432f', col2: '#c44c37', pattern: 'burst', t: lt * 0.3, cy: 1050 });
    FX.phoneGlow(ctx, 540, 1150, 700, '#ffd27a', 0.35);
    const o = CH(ctx, 'SAM_SUIT', (t) => place('SAM_SUIT', 540, 850, 128, { ...ptw(t, 14, 6, 'stand', 'shrug'), expr: 'nervous', look: [0, 0.1], sweat: 1, rig: { squash: take(t, 15, 0.08) + Math.sin(t * 0.5) * 0.006 } }), f);
    const hd = headOf('SAM_SUIT', o, f);
    FX.sweatDrop(ctx, hd.x + hd.r * 1.05, hd.y - hd.r * 0.5, 1.1, lt, 0);
    ctx.save(); ctx.translate(540, 215); ctx.scale(0.5, 0.5); ctx.translate(-540, -H * 0.42); FX.titleCard(ctx, lt, { big: 'DAY 8', p: 1 }); ctx.restore();
    FX.tag(ctx, 540, 455, 'MEETING THE OWNER', { col: '#ffd43b', tcol: INK, size: 92, rot: -0.04, p: 1 });
    FX.tag(ctx, 700, 585, '…IN THIS 😱', { col: '#fff', tcol: INK, size: 70, rot: 0.05, p: 1 });
    if (f >= 18) FX.tag(ctx, 250, 1560, 'RAIN BOOTS 🥾', { col: '#2f7cf6', tcol: '#fff', size: 46, rot: -0.08, p: (f - 18) / 5 });
  } },
  // ===== 35–80 "A viewer sent Sam three tips" — the comment pops up; heart (62)
  { a: 35, b: 80, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 800], snap: [{ at: 29, to: 1.08, dur: 6, f: [540, 720], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    tipsBg(ctx, lt);
    tips(ctx, lt, { y: phoneIn(lf, 8), rot: (1 - k01(lf, 0, 8)) * 0.08, p: lin(42, 50, f), heart: lin(62, 68, f) });
    if (f >= 64) FX.tag(ctx, 800, 1220, '3 TIPS 📝', { col: '#ffd43b', tcol: INK, size: 80, rot: 0.06, p: (f - 64) / 5 });
  } },
  // ===== 80–130 "for meeting the owner." — Sam on the couch, phone in hand, very determined; THE OWNER 👑
  { a: 80, b: 130, whip: 'l', cam: { s: [1.0, 1.06], f: [500, 850], drift: 2, snap: [{ at: 22, to: 1.1, dur: 5, f: [500, 760], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_night', { t: sec(f) });
    const o = CH(ctx, 'SAM', (t) => place('SAM', 500, 880, 150, { pose: 'phone', prop: 'phone', phoneGlow: 1, ...ex(t, 100, 'nervous', 'determined'), look: [0, 0.2], rim: 'cool', rig: { squash: take(t, 101, 0.08) } }), f);
    drawFg(ctx, 'apt_night', { t: sec(f) });
    if (f >= 102) FX.tag(ctx, 540, 330, 'MEET THE OWNER 👑', { col: '#ffd43b', tcol: INK, size: 84, rot: -0.04, p: (f - 102) / 5 });
    if (f >= 110) FX.tag(ctx, 800, 470, 'TOMORROW 😬', { col: '#ff4d4d', tcol: '#fff', size: 56, rot: 0.06, p: (f - 110) / 5 });
    void o;
  } },
  // ===== 130–183 "One: look professional." — tip 1 highlighted (145)
  { a: 130, b: 183, whip: 'r', cam: { s: [1.0, 1.04], f: [540, 700], snap: [{ at: 16, to: 1.14, dur: 6, f: [540, 600], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    tipsBg(ctx, lt, '#2b6fb8', '#3279c4');
    tips(ctx, lt, { y: phoneIn(lf, 6), heart: 1, hi: { tip1: lin(140, 152, f) }, dim: 1 });
    if (f >= 150) FX.tag(ctx, 380, 210, '1️⃣ LOOK PRO', { col: '#fff', tcol: INK, size: 70, rot: -0.06, p: (f - 150) / 5 });
    if (f >= 162) FX.tag(ctx, 640, 1080, 'SUIT 👔 BOOTS 👢 RED TIE', { col: '#ffd43b', tcol: INK, size: 44, rot: 0.05, p: (f - 162) / 5 });
  } },
  // ===== 183–232 "Sam rented a suit" — kitchen: Sam struts in, chest out; Bloop confirms the rental
  { a: 183, b: 232, whip: 'l', cam: { s: [1.0, 1.05], f: [480, 900], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    CH(ctx, 'SAM_SUIT', (t) => ({ x: lerp(160, 400, eOut(k01(t, 183, 200))), y: 1900, h: 1320, ...ptw(t, 198, 6, 'walk', 'proudChest'), ...ex(t, 200, 'smirk', 'proud'), look: [0.3, 0], light: DAY, rig: { squash: take(t, 200, 0.08) } }), f);
    A6.bloop(ctx, 860, 1250, 0.75, { ring: lin(204, 208, f), t: lt, talk: f >= 206 && f < 228 ? 1 : 0 });
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f >= 206) FX.speechBubble(ctx, { x: 720, y: 520, text: 'Suit rental confirmed. Size: XXXL 👔', tx: 860, ty: 1030, p: (f - 206) / 6, size: 50, maxW: 560, font: 'Inter', hi: ['XXXL'] });
  } },
  // ===== 232–277 "three sizes too big." — the shrug: sleeves flop way past the hands; Mom texts
  { a: 232, b: 277, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 1000], snap: [{ at: 9, to: 1.08, dur: 5, f: [540, 900], over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f6f66', col2: '#237a70', pattern: 'diag', t: lt });
    FX.phoneGlow(ctx, 540, 1100, 800, '#7ee0c8', 0.25);
    CH(ctx, 'SAM_SUIT', (t) => place('SAM_SUIT', 540, 840, 120, { ...ptw(t, 236, 6, 'stand', 'shrug'), ...ex(t, 240, 'proud', 'nervous'), look: [0, 0.1], sweat: 1, rig: { squash: take(t, 241, 0.12) } }), f);
    if (f >= 242) FX.boom(ctx, 540, 520, '3 SIZES TOO BIG!', (f - 242) / 4, { size: 96, col: '#ffd43b', burst: '#ff4d4d', rot: -0.05, t: lt });
    if (f >= 256) FX.boom(ctx, 790, 1700, 'SQUEAK', (f - 256) / 3, { size: 66, col: '#fff', burst: null, rot: 0.1, t: lt });
    FX.notifBanner(ctx, MOM((f - 252) / 6, lin(272, 277, f)));
  } },
  // ===== 277–316 "Two: pasta, garlic bread" — tip 2 highlighted (290)
  { a: 277, b: 316, whip: 'l', cam: { s: [1.0, 1.04], f: [540, 760], snap: [{ at: 12, to: 1.14, dur: 6, f: [540, 700], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    tipsBg(ctx, lt, '#e0a93b', '#eab54a');
    tips(ctx, lt, { y: phoneIn(lf, 6), heart: 1, hi: { tip2: lin(286, 298, f) }, dim: 1 });
    if (f >= 292) FX.tag(ctx, 470, 210, '2️⃣ PASTA + BREAD + SALAD', { col: '#fff', tcol: INK, size: 50, rot: -0.05, p: (f - 292) / 5 });
  } },
  // ===== 316–361 "…garlic bread and salad." — the counter: garlic bread (30 leftover bulbs), the salad (one leaf)
  { a: 316, b: 361, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 900], drift: 2 }, draw(ctx, lf, f, lt) {
    ctx.save(); ctx.translate(0, -250); drawBg(ctx, 'counter_cu', { t: sec(f) }); ctx.restore();
    const kb = eBack(k01(f, 317, 324)), ks = eBack(k01(f, 338, 345));
    if (kb > 0) { ctx.save(); ctx.translate(540, 860); ctx.scale(kb, kb); A.garlicBread(ctx, 0, 0, 1.25, { t: lt }); ctx.restore(); A7.fumes(ctx, 540, 640, lt, { n: 4, h: 260, spread: 520 }); }
    if (ks > 0) { ctx.save(); ctx.translate(540, 1420); ctx.scale(ks, ks); A.saladBowl(ctx, 0, 0, 1.05, { t: lt }); ctx.restore(); }
    if (f >= 324) FX.tag(ctx, 330, 420, 'GARLIC BREAD 🧄 (30 BULBS)', { col: '#fff', tcol: INK, size: 46, rot: -0.05, p: (f - 324) / 5 });
    if (f >= 346) FX.tag(ctx, 780, 1010, 'SALAD: 1 LEAF 🥬', { col: '#2fa75a', tcol: '#fff', size: 56, rot: 0.06, p: (f - 346) / 5 });
  } },
  // ===== 361–392 "The pasta hit…" — Sam yanks the pot up to drain it… the whole clump launches (378)
  { a: 361, b: 392, whip: 'l', cam: { s: [1.0, 1.06], f: [540, 900], drift: 2, shake: [[17, 8, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    const o = CH(ctx, 'SAM_SUIT', (t) => ({ x: 540, y: 1950, h: 1300, ...ptw(t, 363, 8, 'stand', 'holdUp'), ...ex(t, 378, 'determined', 'shock'), look: [0, -0.8], light: DAY, rig: { squash: take(t, 378, 0.12) } }), f);
    const hd = headOf('SAM_SUIT', o, f), up = io(f, 363, 371), py = lerp(1300, hd.y - hd.r * 2.2, up);
    ctx.save(); ctx.translate(560, py); ctx.rotate(lerp(0, Math.PI * 0.85, io(f, 372, 380))); D.pot(ctx, 0, 0, 1.0, { fill: 0, t: lt }); ctx.restore();
    if (f >= 377) { const k = k01(f, 377, 390), cy = lerp(py - 60, -300, eIn(k)); A.pastaClump(ctx, 560, cy, 1.2, { rot: k * 3, t: lt }); FX.motionLines(ctx, 560, cy + 220, 0, 1, { n: 6, len: 300, spread: 260, t: lt, col: '#fff' }); }
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (f >= 378) FX.boom(ctx, 800, 420, 'YEET', (f - 378) / 4, { size: 110, col: '#fff', burst: '#ff4d4d', rot: 0.1, t: lt });
  } },
  // ===== 392–420 "…the ceiling fan." — up shot: the clump hits a blade, SPLAT (399); the pizza is already up there
  { a: 392, b: 420, cam: { s: [1.0, 1.06], f: [540, 860], shake: [[7, 14, 10]] }, impact: { at: 7, n: 2, type: 'invert' }, flashes: [[8, 4, 0.4]], draw(ctx, lf, f, lt) {
    drawBg(ctx, 'fan_cu', { t: sec(f) });
    const ang = lt * 7, stuck = f >= 399;
    if (!stuck) { const y = lerp(2200, 900, eOut(k01(f, 392, 399))); A.pastaClump(ctx, 540, y, 1.3, { rot: 0.4, t: lt }); FX.motionLines(ctx, 540, y + 260, 0, 1, { n: 6, len: 300, spread: 300, t: lt, col: '#fff' }); }
    A2.ceilingFan(ctx, 540, 860, 470, ang, { t: lt, dough: 1, wobble: stuck ? 1 : 0 });
    if (stuck) { const a = ang + Math.PI, bx = 540 + Math.cos(a) * 470 * 0.62, by = 890 + Math.sin(a) * 470 * 0.62 * 0.32; A.pastaClump(ctx, bx, by + 30, 1.0, { rot: a * 0.2, hang: 1, t: lt });
      FX.dustPuff(ctx, bx, by, (f - 399) / 10, { col: '#f4d27a', spread: 380, size: 46, n: 6 }); }
    drawFg(ctx, 'fan_cu', { t: sec(f) });
    if (stuck) FX.boom(ctx, 540, 330, 'SPLAT!', (f - 399) / 4, { size: 150, col: '#fff', burst: '#ff4d4d', rot: -0.06, t: lt });
  } },
  // ===== 420–468 "It lives with the pizza now." — the fan turns slowly: pizza dough + pasta, googly-eyed roommates, a little heart
  { a: 420, b: 468, whip: 'r', cam: { s: [1.04, 1.12], f: [540, 900] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'fan_cu', { t: sec(f) });
    const ang = 1.9 + lt * 0.7;
    A2.ceilingFan(ctx, 540, 860, 470, ang, { t: lt, dough: 1 });
    const pos = (i, r = 0.66) => { const a = ang + i * Math.PI / 2; return [540 + Math.cos(a) * 470 * r, 890 + Math.sin(a) * 470 * r * 0.32]; };
    const [dx, dy] = pos(0), [px, py] = pos(2, 0.62);
    A.pastaClump(ctx, px, py + 30, 1.0, { rot: 0.1, hang: 1, t: lt });
    if (f >= 432) { A.googly(ctx, dx, dy + 55, 26, lt, [(px - dx) / 900, 0.2]); A.googly(ctx, px, py + 20, 22, lt + 1, [(dx - px) / 900, 0.2]); }
    if (f >= 440) { const hy = lerp(dy, py, 0.5) - 120 - Math.sin(lt * 3) * 12; A.heart(ctx, (dx + px) / 2, hy, 0.9 + 0.1 * Math.sin(lt * 8)); }
    drawFg(ctx, 'fan_cu', { t: sec(f) });
    if (f >= 446) FX.tag(ctx, 540, 330, 'ROOMMATES NOW 🍕🍝', { col: '#ffd43b', tcol: INK, size: 72, rot: -0.04, p: (f - 446) / 5 });
  } },
  // ===== 468–528 "Three: be polite." — tip 3 highlighted (490), 🤍🦋 flutter
  { a: 468, b: 528, whip: 'l', cam: { s: [1.0, 1.04], f: [540, 800], snap: [{ at: 24, to: 1.14, dur: 6, f: [540, 760], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    tipsBg(ctx, lt, '#7a3cff', '#8446ff');
    tips(ctx, lt, { y: phoneIn(lf, 6), heart: 1, hi: { tip3: lin(488, 500, f) }, dim: 1 });
    if (f >= 498) { FX.sparkle(ctx, 300, 300, 1.2, lt); FX.sparkle(ctx, 820, 1240, 1.0, lt + 1); FX.tag(ctx, 420, 210, '3️⃣ BE POLITE 🤍🦋', { col: '#fff', tcol: INK, size: 62, rot: -0.05, p: (f - 498) / 5 }); }
  } },
  // ===== 528–576 "Sam bowed so deep" — Lumière: THE OWNER (face reveal) at his table; Sam, tiny in his tent, starts the bow
  { a: 528, b: 576, whip: 'r', cam: { s: [1.0, 1.06], f: [620, 900], drift: 1, snap: [{ at: 2, to: 1.06, dur: 6, f: [620, 800], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_dining', { t: sec(f) });
    FX.phoneGlow(ctx, 640, 900, 600, '#ffe7a8', 0.45);
    ownerAtTable(ctx, f, 680, 760, 120, { ...ex(f, 548, 'neutral', 'stern'), look: [-0.5, 0.2] });
    A7.tableFront(ctx, 1250, { x0: 300 });
    A7.reservedCard(ctx, 820, 1210, 0.8);
    CH(ctx, 'SAM_SUIT', (t) => ({ x: 210, y: 1900, h: 900, view: '34R', ...ptw(t, 548, 14, 'stand', 'bow'), ...ex(t, 548, 'nervous', 'determined'), look: [0.4, 0], light: WARM, rig: { squash: take(t, 548, 0.06) } }), f);
    FX.tag(ctx, 640, 300, 'THE OWNER 👑', { col: '#ffd43b', tcol: INK, size: 96, rot: -0.04, p: (f - 530) / 5 });
    FX.sparkle(ctx, 880, 520, 1, lt);
  } },
  // ===== 576–616 "he headbutted the table." — closer: deeper… deeper… BONK (592); plates jump
  { a: 576, b: 616, cam: { s: [1.0, 1.05], f: [540, 1000], shake: [[16, 14, 12]] }, impact: { at: 16, n: 2, type: 'red', col: '#ff4d4d' }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_dining', { t: sec(f) });
    const so = (t) => ({ x: 300, y: 2000, h: 1350, view: '34R', ...ptw(t, 577, 15, 'stand', 'bow'), expr: t < 592 ? 'determined' : 'shock', look: [0.4, 0.3], light: WARM, rig: { squash: take(t, 592, 0.12) } });
    const hb = headOf('SAM_SUIT', so(600), 600);
    const oo = so(f);
    const owy = 640; ownerAtTable(ctx, f, 900, owy, 95, { ...ex(f, 593, 'stern', 'shock'), look: [-0.6, 0.4] });
    const ty = hb.y + hb.r * 0.95 + 120, jump = f >= 592 ? Math.max(0, Math.sin((f - 592) / 8 * Math.PI)) * 60 * (f < 600 ? 1 : 0) : 0;
    A7.tableFront(ctx, ty, { x0: hb.x - hb.r * 0.6 });
    A7.soupBowl(ctx, 880, ty - 120 - jump, 0.55, { level: 0.6, t: lt, garlic: false });
    CH(ctx, 'SAM_SUIT', () => oo, f);
    if (f >= 592) { FX.impactLines(ctx, hb.x + hb.r * 0.4, ty - 120, 120, lt, { n: 12, col: '#ffd43b', lw: 10 }); FX.boom(ctx, 600, 420, 'BONK!', (f - 592) / 3, { size: 160, col: '#ffd43b', burst: '#ff4d4d', rot: -0.06, t: lt }); }
  } },
  // ===== 616–656 "'Your Majesty!'" — Sam pops up: bump, dizzy stars, a huge grin; paper crown on the bubble
  { a: 616, b: 656, whip: 'l', cam: { s: [1.0, 1.06], f: [540, 800], snap: [{ at: 4, to: 1.1, dur: 5, f: [540, 760], over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#3b1f5c', col2: '#43246a', pattern: 'burst', t: lt * 0.3, cy: 900 });
    FX.phoneGlow(ctx, 540, 900, 600, '#ffd27a', 0.4);
    const o = CH(ctx, 'SAM_SUIT', (t) => place('SAM_SUIT', 540, 900, 210, { ...ptw(t, 618, 6, 'stand', 'cheer'), expr: 'dazed', look: [0, 0], rig: { squash: take(t, 619, 0.12), headTilt: Math.sin(t * 0.4) * 6 } }), f);
    const hd = headOf('SAM_SUIT', o, f);
    A.bump(ctx, hd.x + hd.r * 0.1, hd.y - hd.r * 0.82, hd.r * 0.32);
    A.dizzy(ctx, hd.x, hd.y - hd.r * 1.25, hd.r * 1.2, lt);
    FX.speechBubble(ctx, { x: 540, y: 330, text: 'Your Majesty! 👑', tx: hd.x, ty: hd.y - hd.r * 1.6, p: (lf - 2) / 5, size: 104, maxW: 900, hi: ['MAJESTY!'] });
  } },
  // ===== 656–691 "The owner laughed." — the owner, close: belly laugh, moustache bouncing; HO HO HO
  { a: 656, b: 691, whip: 'r', cam: { s: [1.0, 1.06], f: [540, 860], shake: [[8, 20, 4]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f2457', col2: '#262c66', pattern: 'burst', t: lt * 0.3, cy: 900 });
    FX.phoneGlow(ctx, 540, 900, 700, '#ffe7a8', 0.4);
    CH(ctx, 'OWNER', (t) => place('OWNER', 540, 820, 230, { ...ptw(t, 660, 6, 'stand', 'cheer'), ...ex(t, 662, 'stern', 'laugh'), look: [0, 0], rig: { squash: t >= 664 ? Math.sin(t * 1.4) * 0.03 : take(t, 662, 0.1) } }), f);
    if (f >= 664) FX.boom(ctx, 540, 280, 'HO HO HO!', (f - 664) / 4, { size: 130, col: '#ffd43b', burst: '#ff4d4d', rot: -0.05, t: lt });
  } },
  // ===== 691–752 "'Alfredo soup goes on the menu.'" — Lumière's menu: ALFREDO SOUP stamps in (712)
  { a: 691, b: 752, whip: 'l', cam: { s: [1.0, 1.05], f: [540, 960], snap: [{ at: 21, to: 1.1, dur: 6, f: [540, 1100], over: 0.12 }], shake: [[21, 10, 7]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#8a2440', col2: '#7a1f3a', pattern: 'dots', t: lt });
    FX.phoneGlow(ctx, 540, 900, 700, '#ffd27a', 0.3);
    A.menuCard(ctx, 540, lerp(1700, 920, eBack(k01(f, 691, 700))), 1.15, { newK: (f - 710) / 8, t: lt });
    if (f >= 724) { FX.confetti(ctx, lt, { n: 30, seed: 8 }); FX.tag(ctx, 540, 230, 'ON THE MENU?! 😳', { col: '#ffd43b', tcol: INK, size: 88, rot: -0.04, p: (f - 724) / 5 }); }
  } },
  // ===== 752–790 "'Tomorrow, cook it for…'" — the owner points straight at Sam
  { a: 752, b: 790, whip: 'r', cam: { s: [1.0, 1.04], f: [540, 860], snap: [{ at: 1, to: 1.1, dur: 5, f: [540, 800], over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_dining', { t: sec(f) }); FX.tint(ctx, '#0d0a20', 0.25);
    const o = CH(ctx, 'OWNER', (t) => place('OWNER', 540, 900, 200, { ...ptw(t, 752, 6, 'stand', 'point'), view: '34L', ...ex(t, 754, 'laugh', 'smirk'), look: [-0.3, 0.1], light: WARM, rig: { squash: take(t, 754, 0.08) } }), f);
    const hd = headOf('OWNER', o, f);
    FX.speechBubble(ctx, { x: 540, y: 330, text: f < 772 ? 'Tomorrow…' : "Tomorrow, cook it for the city's toughest critic.", tx: hd.x - 40, ty: hd.y - hd.r * 1.9, p: (lf - 1) / 5, size: 70, maxW: 900, hi: ['TOMORROW…', 'TOMORROW,', 'TOUGHEST', 'CRITIC.'] });
  } },
  // ===== 790–822 "…the city's toughest critic." — the critic's profile; TOUGHEST highlighted (797); one-star cards drop
  { a: 790, b: 822, whip: 'l', cam: { s: [1.0, 1.05], f: [540, 760], snap: [{ at: 17, to: 1.1, dur: 5, f: [540, 600], over: 0.12 }], shake: [[17, 8, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#2a0f18', col2: '#331420', pattern: 'diag', t: lt }); FX.phoneGlow(ctx, 540, 800, 700, '#ff4d4d', 0.3);
    drawPhone(ctx, { ...PH, y: phoneIn(lf, 6), state: 'critic8', t: lt, hi: lin(797, 805, f), stars: lin(800, 816, f), time: '9:58' });
    if (f >= 807) FX.boom(ctx, 760, 250, 'CRITIC 😱', (f - 807) / 3, { size: 100, col: '#ff4d4d', burst: '#ffd43b', rot: -0.05, t: lt });
  } },
  // ===== 822–858 "Bro…" — the roommate in the kitchen, deadpan, looking at Sam (suit, bump, rain boots)
  { a: 822, b: 858, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 860], snap: [{ at: 14, to: 1.08, dur: 6, f: [620, 820], over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    CH(ctx, 'SAM_SUIT', (t) => ({ x: 250, y: 1960, h: 1250, view: '34R', expr: 'nervous', look: [0.6, 0], sweat: 1, light: DAY }), f);
    const o = CH(ctx, 'ROOMMATE', (t) => ({ x: 790, y: 1880, h: 1330, view: '34L', pose: 'armsCrossed', expr: 'deadpan', look: [-0.6, 0.1], light: DAY, rig: { headTilt: 4 * io(t, 830, 840) } }), f);
    const hd = headOf('ROOMMATE', o, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    FX.speechBubble(ctx, { x: 640, y: 290, text: 'Bro…', tx: hd.x - 30, ty: hd.y - hd.r * 1.8, p: (lf - 2) / 5, size: 120, maxW: 700, hi: ['BRO…'] });
  } },
  // ===== 858–905 "22 days left." — calendar, card (862)
  { a: 858, b: 905, whip: 'l', cam: { s: [1.0, 1.05], f: [540, 900], shake: [[4, 18, 9]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f2457', col2: '#262c66', pattern: 'grid', t: lt });
    drawPhone(ctx, { ...PH, state: 'calendar', t: lt, p: lin(859, 865, f), pill: lin(861, 865, f), time: '9:59', day: 8, pillText: '⏳ 22 days left' });
    if (f >= 862) { FX.tint(ctx, '#0d0a20', 0.5 * lin(862, 867, f)); FX.confetti(ctx, lt, { n: 30, seed: 19 }); FX.daysLeftCard(ctx, lt, (f - 862) / 8, '22'); }
  } },
  // ===== 905–970 "What should he serve?" — Sam (suit, bump) clutching a bowl of Alfredo soup, question marks; CTA
  { a: 905, b: LEN, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 900], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#eab54a', pattern: 'burst', t: lt * 0.3, cy: 900 });
    const o = CH(ctx, 'SAM_SUIT', (t) => place('SAM_SUIT', 540, 700, 170, { pose: 'shrug', expr: 'nervous', look: [0, 0], sweat: 1, rig: { squash: take(t, 906, 0.1) + Math.sin(t * 0.6) * 0.008 } }), f);
    const hd = headOf('SAM_SUIT', o, f);
    A.bump(ctx, hd.x + hd.r * 0.1, hd.y - hd.r * 0.82, hd.r * 0.3);
    A7.soupBowl(ctx, 540, 1480, 0.8, { level: 1, t: lt });
    FX.questionMarks(ctx, hd.x, hd.y - hd.r * 1.9, 1.2, lt);
    FX.tag(ctx, 540, 230, 'WHAT SHOULD SAM SERVE THE CRITIC? 👇', { col: '#fff', tcol: INK, size: 52, rot: -0.03, p: (f - 910) / 6 });
  } },
];
