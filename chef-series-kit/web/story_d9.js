// Ep9 "Day 9 of 30" (NO VOICEOVER: told with word-pop captions, tags, acting, music + SFX). A viewer says "serve the Alfredo soup with
// baked bread" → Sam bakes bread for the first time: the oven smokes, the loaf comes out harder than a brick (CLONK, the counter dents) →
// the city's toughest critic, The Iron Palate, walks in (slow-mo, spotlight) → Sam panics and drops the bread in the soup: SPLASH →
// the critic stares, dips, soaks, bites… silence (the band cuts out) → he writes ONE word (unreadable, then his hand covers it) →
// Sam can't read it (the notebook slams shut) → "Bro…" → 21 days left → "What did he write?"
// Select with ?story=d9. 30 fps. Timing lives in beats_d9.js (captions → words_d9.json via work/mkwords.mjs).
// All usernames / names on screen are invented (@tulip.breadcrumbs, The Iron Palate, Loopr).
import { W, H, FPS, INK, clamp, lerp, lin, eOut, eIn, eInOut, eBack, hash } from './util.js';
import { drawBg, drawFg } from './bg.js';
import { drawPhone } from './phone.js';
import './phone_d2.js';
import './phone_d7.js';
import './phone_d8.js';
import './phone_d9.js';
import * as FX from './fx.js';
import * as A2 from './d2_art.js';
import './d3_art.js';
import './d4_art.js';
import * as A5 from './d5_art.js';
import './d6_art.js';
import * as A7 from './d7_art.js';
import './d8_art.js';
import * as A from './d9_art.js';
import { clockFace } from './bgkit.js';
import { drawChar, bounds } from './cast2d.js';
import { S, E, TOTAL } from './beats_d9.js';

export const LEN = TOTAL;
export const CAPCONF = {
  file: 'words_d9.json', maxLen: 20, maxWords: 4, hold: true,
  keyY: ['9', 'VIEWER', 'ALFREDO', 'BAKED', 'BREAD', 'BREAD.', 'FIRST', 'EVER', 'IRON', 'PALATE', 'ONE', 'WORD', '21', 'WRITE', 'BITE', 'SPOON', 'STARES'],
  keyR: ['HARDER', 'BRICK', 'TOUGHEST', 'CRITIC', 'PANICS', 'SPLASH', 'SILENCE', 'BRO', "CAN'T"],
  quotes: [[S.bro, E.bro]],
};
const sec = (f) => f / FPS;

/* ---------------- acting helpers (as Ep5–8) ---------------- */
const k01 = (f, a, b) => clamp((f - a) / (b - a));
const io = (f, a, b) => eInOut(k01(f, a, b));
const ex = (f, at, from, to) => (f < at ? { expr: from } : { exprPrev: from, expr: to, exprT: f - at });
const ptw = (f, at, dur, from, to) => ({ pose: from, pose2: to, mix: io(f, at, at + dur) });
function take(f, at, amt = 0.16) { const a = f - at; if (a < 0 || a > 12) return 0; return a < 3 ? -amt * (a / 3) : amt * 0.7 * Math.sin((a - 3) / 9 * Math.PI) * (1 - (a - 3) / 9); }
function blinkAt(f, seed) { const per = 96 + (seed % 5) * 9, ph = (f + seed * 37) % per; return ph < 2 ? 1 : ph < 4 ? 0.5 : 0; }
function CH(ctx, name, fn, f, tt = f) {
  const o = fn(f), seed = o.seed ?? name.length * 7;
  drawChar(ctx, name, { view: 'front', pose: 'stand', expr: 'neutral', look: [0, 0], blink: blinkAt(f, seed), seed, shadow: true, ...o, t: tt, track: (t) => fn(t) });
  return o;
}
function B(name, o, f) { try { return bounds(name, { view: 'front', pose: 'stand', ...o, t: f }); } catch (e) { return null; } }
function headOf(name, o, f = 0) { const b = B(name, o, f); if (b && b.head) return b.head; return { x: o.x, y: o.y - o.h * 0.83, r: o.h * 0.16 }; }
function place(name, hx, hy, hr, o = {}) { const ref = headOf(name, { ...o, x: 0, y: 0, h: 1000 }); const h = hr / (ref.r / 1000); return { ...o, h, x: hx - ref.x * h / 1000, y: hy - ref.y * h / 1000 }; }
const DAY = { col: '#ffd9a0', amt: 0.12, dir: [1, -0.5] }, WARM = { col: '#ffcf7a', amt: 0.16, dir: [-1, -0.4] }, COLD = { col: '#9fc4ff', amt: 0.2, dir: [0, -1] };
const PH = { x: 150, y: 120, w: 780, h: 1180 };
const phoneIn = (lf, d = 9) => lerp(1900, PH.y, eBack(k01(lf, 0, d)));
const KIT = (f, o = {}) => ({ t: sec(f), noPot: true, ...o });
const SAMARM = { sleeve: '#f2b52b', cuff: '#f6f1e6', skin: '#c98a5e', skinS: '#a56a44' };
const CHEFARM = { sleeve: '#fbfaf7', cuff: '#d6d3cb', skin: '#c98a5e', skinS: '#a56a44' };
const CHEF = { soot: -0.7 };   // Sam in his Lumière whites, cleaned up
// the critic seated behind a table; hx/hy/hr = head
function criticAtTable(ctx, f, hx, hy, hr, o = {}) {
  const oo = place('CRITIC', hx, hy, hr, { look: [0, 0.1], light: WARM, ...o });
  A7.ownerChair(ctx, hx, hy + hr * 6.6, hr / 125);
  CH(ctx, 'CRITIC', () => oo, f);
  return oo;
}
const dark = (ctx, a) => FX.tint(ctx, '#0d0a20', a);

/* ---------------- shots ---------------- */
export const SHOTS = [
  // ===== HOOK (frame 0 already full): DAY 9 badge, Sam sweating, holding up the rock-hard loaf; KNOCK KNOCK
  { a: S.hook, b: E.hook, cam: { s: [1.0, 1.05], f: [540, 900], drift: 2, shake: [[18, 6, 5], [26, 6, 5]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#b8432f', col2: '#c44c37', pattern: 'burst', t: lt * 0.3, cy: 1050 });
    FX.phoneGlow(ctx, 540, 1150, 700, '#ffd27a', 0.35);
    const o = CH(ctx, 'SAM', (t) => place('SAM', 540, 900, 122, { pose: 'holdUp', expr: 'nervous', look: [0.3, -0.5], sweat: 1, rig: { squash: take(t, 18, 0.05) + take(t, 26, 0.05) + Math.sin(t * 0.5) * 0.006 } }), f);
    const b = B('SAM', o, f), hd = headOf('SAM', o, f);
    const kn = (f >= 18 && f < 22) || (f >= 26 && f < 30) ? 8 : 0;
    A.loaf(ctx, b.hand.x + 30, b.hand.y - 115 + kn, 0.8, { rot: -0.1, t: lt });
    FX.sweatDrop(ctx, hd.x + hd.r * 1.05, hd.y - hd.r * 0.5, 1.1, lt, 0);
    if (f >= 18) FX.boom(ctx, 830, 560, 'KNOCK', (f - 18) / 3, { size: 70, col: '#fff', burst: null, rot: 0.12, t: lt });
    if (f >= 26) FX.boom(ctx, 860, 660, 'KNOCK', (f - 26) / 3, { size: 70, col: '#fff', burst: null, rot: -0.08, t: lt });
    ctx.save(); ctx.translate(540, 190); ctx.scale(0.45, 0.45); ctx.translate(-540, -H * 0.42); FX.titleCard(ctx, lt, { big: 'DAY 9', p: 1 }); ctx.restore();
    FX.tag(ctx, 540, 1400, 'BREAD… OR A BRICK? 🧱', { col: '#ffd43b', tcol: INK, size: 76, rot: -0.04, p: 1 });
    void b;
  } },
  // ===== "A viewer said: serve the Alfredo soup with baked bread." — the comment pops; "baked bread" highlighted; heart
  { a: S.phone, b: E.phone, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 800], snap: [{ at: 62, to: 1.1, dur: 6, f: [540, 760], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#c2457a', col2: '#cc5085', pattern: 'grid', t: lt }); FX.phoneGlow(ctx, 540, 800, 700, '#ffd6ea', 0.3);
    drawPhone(ctx, { ...PH, state: 'comment9', t: lt, time: '8:00', y: phoneIn(lf, 8), rot: (1 - k01(lf, 0, 8)) * 0.08, p: lin(S.phone + 6, S.phone + 14, f), hi: lin(S.phone + 62, S.phone + 72, f), heart: lin(S.phone + 78, S.phone + 84, f) });
    if (lf >= 66) FX.tag(ctx, 760, 1210, '🍞 BAKED BREAD?!', { col: '#ffd43b', tcol: INK, size: 66, rot: 0.06, p: (lf - 66) / 5 });
  } },
  // ===== "So Sam baked bread. For the first time ever." — Sam proud at the oven → it smokes, the alarm beeps, Sam fans the smoke
  { a: S.oven, b: E.oven, whip: 'l', cam: { s: [1.0, 1.06], f: [560, 900], drift: 2, shake: [[40, 30, 4]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    const sm = k01(lf, 26, 50);
    A.oven(ctx, 780, 1860, 0.82, { smoke: sm, glow: 0.5 + 0.5 * sm, t: lt, shake: lf > 40 ? 0.6 : 0 });
    if (sm > 0) FX.smoke(ctx, 780, 1300, lt, { n: 7, spread: 380, rise: 900, size: 130 * (0.5 + sm), col: '#5a5462', alpha: sm, seed: 3 });
    CH(ctx, 'SAM', (t) => ({ x: 280, y: 1940, h: 1260, view: '34R', ...ptw(t - S.oven, 34, 6, 'proudChest', 'fanSmoke'), ...ex(t - S.oven, 34, 'proud', 'panic'), look: [0.6, -0.1], light: DAY, rig: { squash: take(t - S.oven, 35, 0.1) } }), f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    if (lf >= 4 && lf < 34) FX.tag(ctx, 330, 330, 'FIRST BREAD EVER 🍞', { col: '#fff', tcol: INK, size: 64, rot: -0.05, p: (lf - 4) / 5 });
    if (lf >= 40) FX.boom(ctx, 760, 330, 'BEEP! BEEP!', (lf - 40) / 4, { size: 100, col: '#ff4d4d', burst: '#ffd43b', rot: 0.06, t: lt });
    if (lf >= 40) FX.lightFlicker(ctx, '#ff3020', 0.18 * (Math.floor(lf / 4) % 2));
  } },
  // ===== "It came out harder than a brick." — Sam's hand slams the loaf: CLONK (16), CLONK!! (44), the counter dents; a brick slides in
  { a: S.counter, b: E.counter, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 900], shake: [[16, 12, 9], [44, 14, 14]] }, impact: { at: 44, n: 2, type: 'flat', col: '#ffd43b' }, draw(ctx, lf, f, lt) {
    ctx.save(); ctx.translate(0, -250); drawBg(ctx, 'counter_cu', { t: sec(f) }); ctx.restore();
    const top = 1000;
    A.dent(ctx, 470, top + 40, lf >= 16 ? 0.55 + (lf >= 44 ? 0.45 : 0) : 0, 2);
    const lift = (a, b, c) => (lf < a ? 0 : lf < b ? eOut(k01(lf, a, b)) : 1 - eIn(k01(lf, b, c)));
    const up = lf < 16 ? 1 - eIn(k01(lf, 0, 16)) * 1 + 0 : lf < 44 ? lift(20, 34, 44) : 0;
    const ly = top - 60 - up * 420;
    A.arm(ctx, 470, ly - 90, 1.0, Math.PI + 0.1, { ...SAMARM, fist: false });
    A.loaf(ctx, 470, ly, 1.25, { rot: Math.sin(lf * 0.3) * 0.04 * up, crack: lf >= 44 ? 1 : 0, t: lt });
    if (lf >= 16) { FX.impactLines(ctx, 470, top - 40, 260, lt, { n: 12, col: '#ffd43b', lw: 10 }); FX.boom(ctx, 300, 360, 'CLONK!', (lf - 16) / 3, { size: 120, col: '#fff', burst: '#ff4d4d', rot: -0.08, t: lt }); }
    if (lf >= 44) FX.boom(ctx, 740, 250, 'CLONK!!', (lf - 44) / 3, { size: 140, col: '#ffd43b', burst: '#ff4d4d', rot: 0.08, t: lt, seed: 4 });
    if (lf >= 46) FX.dustPuff(ctx, 470, top + 20, (lf - 46) / 14, { col: '#e8dcc4', spread: 420, size: 50, n: 8 });
    if (lf >= 54) { const bx = lerp(1300, 860, eOut(k01(lf, 54, 62))); A.brick(ctx, bx, top - 10, 0.85, 0); FX.tag(ctx, bx, top - 230, 'BRICK', { col: '#ff4d4d', tcol: '#fff', size: 54, rot: 0.05, p: (lf - 58) / 4 }); FX.tag(ctx, 200, top - 300, 'BREAD', { col: '#ffd43b', tcol: INK, size: 54, rot: -0.05, p: (lf - 60) / 4 }); }
  } },
  // ===== "Then the city's toughest critic walks in." — Lumière goes dark, a spotlight; THE IRON PALATE walks in, slow-mo
  { a: S.walk, b: E.walk, whip: 'l', cam: { s: [1.0, 1.1], f: [540, 900] }, draw(ctx, lf, f, lt, len) {
    drawBg(ctx, 'lumiere_dining', { t: sec(f) }); dark(ctx, 0.62);
    const u = lf / len, h = lerp(900, 1500, eInOut(u)), y = lerp(1560, 2080, eInOut(u));
    A.spotlight(ctx, 540, y, h * 0.62, clamp(lf / 6));
    A.motes(ctx, 540, 0, y, h * 0.5, lt);
    CH(ctx, 'CRITIC', () => ({ x: 540, y, h, pose: 'walk', expr: 'stern', look: [0, 0.05], light: { col: '#fff1c4', amt: 0.25, dir: [0, -1] }, rig: { headTilt: -3 } }), f, S.walk + lf * 0.4);
    // Sam peeks from the kitchen door, in his whites
    CH(ctx, 'SAM_CHEF', (t) => ({ ...CHEF, x: 60, y: 2020, h: 1150, view: '34R', expr: t - S.walk < 30 ? 'nervous' : 'panic', look: [0.6, -0.1], sweat: 1, light: WARM }), f);
    if (lf >= 30) FX.tag(ctx, 760, 300, '★☆☆☆☆', { col: '#16131f', tcol: '#ffd43b', size: 70, rot: 0.05, p: (lf - 30) / 5 });
  } },
  // ===== "The Iron Palate." — snap close-up, monocle glint, name plate
  { a: S.name, b: E.name, cam: { s: [1.0, 1.06], f: [540, 860], snap: [{ at: 1, to: 1.08, dur: 4, f: [540, 800], over: 0.12 }], shake: [[1, 10, 8]] }, flashes: [[0, 4, 0.5]], draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#2a0f18', col2: '#331420', pattern: 'burst', t: lt * 0.3, cy: 860 }); FX.phoneGlow(ctx, 540, 860, 700, '#ff4d4d', 0.3);
    const o = CH(ctx, 'CRITIC', (t) => place('CRITIC', 540, 800, 220, { pose: 'armsCrossed', ...ex(t - S.name, 6, 'stern', 'smug'), look: [0, 0.05], light: COLD, rig: { squash: take(t - S.name, 2, 0.06) } }), f);
    const hd = headOf('CRITIC', o, f);
    if (lf >= 8) FX.sparkle(ctx, hd.x + hd.r * 0.42, hd.y - hd.r * 0.05, 1.6, lt);
    FX.tag(ctx, 540, 260, 'THE IRON PALATE', { col: '#ffd43b', tcol: INK, size: 104, rot: -0.04, p: lf / 4 });
    if (lf >= 10) FX.tag(ctx, 540, 400, "NEVER GIVEN 5 STARS ★", { col: '#fff', tcol: INK, size: 50, rot: 0.04, p: (lf - 10) / 4 });
  } },
  // ===== "Sam panics and drops the bread" — Sam presents the loaf, shaking; the critic glares; the loaf slips (40)
  { a: S.panic, b: E.panic, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 900], drift: 1, shake: [[0, 56, 3]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_dining', { t: sec(f) }); dark(ctx, 0.2);
    criticAtTable(ctx, f, 800, 720, 100, { ...ex(lf, 10, 'stern', 'stern'), look: [-0.6, 0.15] });
    A7.tableFront(ctx, 1250, { x0: 380 });
    A7.soupBowl(ctx, 760, 1210, 0.6, { level: 1, t: lt, garlic: false });
    const jit = (hash(f * 1.3) - 0.5) * 12;
    const so = (t) => ({ ...CHEF, x: 300 + jit, y: 1960, h: 1300, view: '34R', ...ptw(t - S.panic, 38, 4, 'hold', 'cheer'), ...ex(t - S.panic, 4, 'nervous', 'panic'), look: [0.6, 0], sweat: 1, light: WARM, rig: { squash: Math.sin(t * 2.2) * 0.012 } });
    const o = CH(ctx, 'SAM_CHEF', so, f);
    const b = B('SAM_CHEF', so(Math.min(f, S.panic + 37)), Math.min(f, S.panic + 37)), hd = headOf('SAM_CHEF', o, f);
    if (lf < 40) A.loaf(ctx, b.hand.x + 60, b.hand.y - 40, 0.62, { rot: 0.1 + Math.sin(lf * 1.7) * 0.06, t: lt });
    else { const k = k01(lf, 40, 56); A.loaf(ctx, lerp(b.hand.x + 60, 760, k), lerp(b.hand.y - 40, 1080, eIn(k)) - Math.sin(k * Math.PI) * 120, 0.62, { rot: 0.1 + k * 3, t: lt }); }
    FX.sweatDrop(ctx, hd.x - hd.r * 1.0, hd.y - hd.r * 0.4, 1.0, lt, 0); FX.sweatDrop(ctx, hd.x + hd.r * 1.1, hd.y - hd.r * 0.2, 0.8, lt + 0.5, 0);
    if (lf >= 40) FX.bang(ctx, hd.x + hd.r * 0.4, hd.y - hd.r * 2.2, 1.0, 0.12, '!!', '#ff4d4d', (lf - 40) / 4);
    if (lf >= 6 && lf < 40) FX.tag(ctx, 800, 360, 'THE CRITIC 🧐', { col: '#16131f', tcol: '#ffd43b', size: 56, rot: 0.05, p: (lf - 6) / 5 });
  } },
  // ===== "in the soup. SPLASH." — close on the bowl: the loaf tumbles in slow-mo… SPLASH (24), soup everywhere
  { a: S.splash, b: E.splash, cam: { s: [1.0, 1.06], f: [540, 1000], shake: [[24, 16, 18]] }, impact: { at: 24, n: 2, type: 'invert' }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_dining', { t: sec(f) }); dark(ctx, 0.3);
    A7.tableFront(ctx, 1440, {});
    const bx = 540, by = 1420, bs = 1.55, rimY = by - 150 * bs;
    A7.soupBowl(ctx, bx, by, bs, { level: 1, t: lt, garlic: false });
    if (lf < 24) { const k = lf / 24, y = lerp(-200, rimY - 20, eIn(k)); A.loaf(ctx, bx, y, 1.2, { rot: k * 2.2, t: lt }); FX.motionLines(ctx, bx, y - 220, 0, -1, { n: 5, len: 260, spread: 300, t: lt, col: '#fff' }); }
    else { ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, rimY + 10 + 300); ctx.clip(); A.loaf(ctx, bx + 10, rimY + 40 + Math.sin((lf - 24) * 0.5) * 8 * Math.exp(-(lf - 24) / 10), 1.2, { rot: 0.3, soggy: 0.15, t: lt }); ctx.restore(); }
    if (lf >= 24) { A.splash(ctx, bx, rimY, (lf - 24) / 22, { spread: 1100, n: 30 }); FX.boom(ctx, 540, 420, 'SPLASH!', (lf - 24) / 3, { size: 170, col: '#fff', burst: '#4fc3f7', rot: -0.06, t: lt }); }
    if (lf < 24) FX.tag(ctx, 540, 330, 'NOOOO 😱', { col: '#ff4d4d', tcol: '#fff', size: 80, rot: -0.05, p: (lf - 2) / 4 });
  } },
  // ===== "The critic stares. Dips his spoon." — soup on his face and monocle; dead stare; dips the spoon
  { a: S.stare, b: E.stare, whip: 'r', cam: { s: [1.0, 1.06], f: [540, 800], snap: [{ at: 2, to: 1.06, dur: 5, f: [540, 700], over: 0.1 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_dining', { t: sec(f) }); dark(ctx, 0.25);
    const o = criticAtTable(ctx, f, 540, 680, 150, { expr: 'deadpan', look: [0, 0.05], blink: lf > 18 && lf < 24 ? 1 : 0 });
    const hd = headOf('CRITIC', o, f);
    A.soupSpots(ctx, hd.x, hd.y + hd.r * 0.1, hd.r, 7, 4);
    A7.tableFront(ctx, 1360, {});
    A7.soupBowl(ctx, 540, 1320, 0.95, { level: 1, t: lt, garlic: false });
    ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, 1320 - 150 * 0.95 + 300); ctx.clip(); A.loaf(ctx, 560, 1320 - 150 * 0.95 + 20, 0.75, { rot: 0.3, soggy: 0.2, t: lt }); ctx.restore();
    // the spoon hand dips (32→50) and lifts back
    const d = lf < 32 ? 0 : lf < 44 ? eInOut(k01(lf, 32, 44)) : 1 - eInOut(k01(lf, 48, 58)) * 0.6;
    const sx = lerp(900, 700, d), sy = lerp(1500, 1170, d);
    A.spoon(ctx, sx, sy, 1.1, -0.7, { soup: d > 0.8 ? 1 : 0 }); A.arm(ctx, sx + 120, sy + 110, 0.85, -0.6, {});
    if (lf < 32 && lf >= 6) FX.tag(ctx, 800, 300, '👁️ 👁️', { col: '#fff', tcol: INK, size: 60, rot: 0.06, p: (lf - 6) / 4 });
    if (lf >= 44 && lf < 50) FX.boom(ctx, 760, 1000, 'plip', (lf - 44) / 2, { size: 60, col: '#fff', burst: null, t: lt });
  } },
  // ===== "Soaks the bread." — close on the bowl: the spoon presses, the brick drinks the soup (soggy), glug
  { a: S.soak, b: E.soak, whip: 'l', cam: { s: [1.02, 1.1], f: [540, 1000] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_dining', { t: sec(f) }); dark(ctx, 0.3);
    A7.tableFront(ctx, 1500, {});
    const bx = 540, by = 1480, bs = 1.6, rimY = by - 150 * bs, sk = io(lf, 2, 26), push = Math.sin(lf * 0.6) * 10;
    A7.soupBowl(ctx, bx, by, bs, { level: 1, t: lt, garlic: false });
    ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, rimY + 20 + 300); ctx.clip(); A.loaf(ctx, bx + 10, rimY + 60 + sk * 40 + push, 1.2, { rot: 0.3, soggy: sk, t: lt }); ctx.restore();
    A2.bubbles(ctx, bx, rimY + 20, lt, { n: 10, spread: 380, rise: 260, size: 22 });
    A.spoon(ctx, bx + 120, rimY - 40 + push, 1.6, -0.5, {}); A.arm(ctx, bx + 330, rimY + 200 + push, 1.1, -0.7, {});
    if (lf >= 6) FX.boom(ctx, 300, 520, 'GLUG GLUG', (lf - 6) / 3, { size: 80, col: '#fff', burst: null, rot: -0.08, t: lt });
    if (sk > 0.5) FX.tag(ctx, 760, 360, 'SOFT?! 😳', { col: '#ffd43b', tcol: INK, size: 64, rot: 0.06, p: (sk - 0.5) * 6 });
  } },
  // ===== "Takes one bite." — close-up: the soggy chunk rises, mouth opens… CHOMP (20), chewing
  { a: S.bite, b: E.bite, whip: 'r', cam: { s: [1.0, 1.06], f: [540, 760], snap: [{ at: 20, to: 1.1, dur: 4, f: [540, 700], over: 0.1 }], shake: [[20, 8, 8]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#3b1f5c', col2: '#43246a', pattern: 'burst', t: lt * 0.3, cy: 800 }); FX.phoneGlow(ctx, 540, 800, 600, '#ffd27a', 0.35);
    const o = CH(ctx, 'CRITIC', (t) => { const l = t - S.bite; return place('CRITIC', 540, 760, 210, { pose: 'stand', ...(l < 12 ? { expr: 'deadpan' } : l < 20 ? { exprPrev: 'deadpan', expr: 'shock', exprT: l - 12 } : { exprPrev: 'shock', expr: 'neutral', exprT: l - 20 }), talk: l > 22 && l < 40 ? 1 : 0, look: [0, 0.3], rig: { squash: take(l, 20, 0.08) } }); }, f);
    const hd = headOf('CRITIC', o, f);
    A.soupSpots(ctx, hd.x, hd.y + hd.r * 0.1, hd.r, 7, 4);
    const k = eOut(k01(lf, 0, 18)), my = hd.y + hd.r * 0.75;
    if (lf < 22) { A.spoon(ctx, lerp(700, hd.x + 20, k), lerp(1700, my + 30, k), 1.3, -0.35, { bread: 1.2 }); A.arm(ctx, lerp(840, hd.x + 170, k), lerp(1880, my + 200, k), 1.0, -0.6, {}); }
    else { A.spoon(ctx, lerp(hd.x + 20, 760, k01(lf, 22, 34)), lerp(my + 40, 1600, k01(lf, 22, 34)), 1.3, -0.35, {}); }
    if (lf >= 20) FX.boom(ctx, 800, 380, 'CHOMP', (lf - 20) / 3, { size: 110, col: '#fff', burst: '#ff4d4d', rot: 0.08, t: lt });
    if (lf >= 26 && lf < 40) FX.tag(ctx, 280, 1150, 'chew… chew…', { col: '#fff', tcol: INK, size: 50, rot: -0.06, p: (lf - 26) / 4 });
  } },
  // ===== "Silence." — the band cuts out: frozen mid-chew, dead eyes; the clock ticks; a cricket; Sam sweating at the edge
  { a: S.silence, b: E.silence, cam: { s: [1.06, 1.16], f: [540, 860] }, mblur: false, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1b1830', col2: '#201c38', pattern: 'diag', t: 0 });
    clockFace(ctx, 860, 300, 120, 12 + lf / 30, { hour: 9.6 });
    const o = CH(ctx, 'CRITIC', () => place('CRITIC', 540, 860, 260, { expr: 'blank', look: [0, 0], blink: 0, rig: { squash: 0 } }), f, S.silence);
    const hd = headOf('CRITIC', o, f);
    A.soupSpots(ctx, hd.x, hd.y + hd.r * 0.1, hd.r, 7, 4);
    CH(ctx, 'SAM_CHEF', () => ({ ...CHEF, x: 40, y: 2120, h: 1250, view: '34R', expr: 'mortified', look: [0.7, -0.1], sweat: 1 }), f);
    FX.sweatDrop(ctx, 250, 1010, 1.2, lt, k01(lf, 4, 34));
    if (lf >= 10) FX.tag(ctx, 250, 300, '🦗 chirp…', { col: '#fff', tcol: INK, size: 46, rot: -0.06, p: (lf - 10) / 5 });
  } },
  // ===== "Then he writes ONE word." — the notebook: the pen scrawls one (unreadable) word, underlines it, the hand covers it
  { a: S.write, b: E.write, whip: 'l', cam: { s: [1.0, 1.08], f: [540, 900], shake: [[40, 6, 6]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e9e2d2', col2: '#e2dac8', pattern: 'dots', t: 0 });
    const wk = k01(lf, 6, 38);
    A.notebook(ctx, 540, 880, 1.15, { write: wk, rot: -0.05, t: lt });
    // nib position (same transform as the notebook's right page)
    const c = Math.cos(-0.05), s = Math.sin(-0.05), tip = penTip(wk);
    let px = 540 + (tip[0] * c - tip[1] * s) * 1.15, py = 880 + (tip[0] * s + tip[1] * c) * 1.15;
    const cover = io(lf, 42, 52); px = lerp(px, 760, cover); py = lerp(py, 870, cover);
    A.pen(ctx, px, py, 1.1, 0.55 + Math.sin(lf * 2.1) * 0.08 * (wk > 0 && wk < 1 ? 1 : 0));
    A.arm(ctx, px + 70 + cover * 0, py + 60, 1.05, -0.55, {});
    if (lf >= 40) FX.boom(ctx, 540, 300, '✍️ ONE WORD', (lf - 40) / 3, { size: 100, col: '#ff4d4d', burst: '#ffd43b', rot: -0.05, t: lt });
  } },
  // ===== "Sam can't read it." — Sam leans in with a magnifier, squinting… the notebook SLAMS shut (28)
  { a: S.cantread, b: E.cantread, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 800], shake: [[28, 10, 12]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_dining', { t: sec(f) }); dark(ctx, 0.35);
    const cl = k01(lf, 28, 31);
    A.notebook(ctx, 540, 560, 0.85, { write: 1, rot: 0.03, close: cl, t: lt });
    if (cl < 1) A.arm(ctx, 700, 600, 0.8, -0.5, {});
    const o = CH(ctx, 'SAM_CHEF', (t) => place('SAM_CHEF', 520, 1080, 150, { ...CHEF, pose: 'stand', ...ex(t - S.cantread, 28, 'confused', 'shock'), look: [0.1, -0.8], sweat: 1, light: WARM, rig: { squash: take(t - S.cantread, 29, 0.12) } }), f);
    const hd = headOf('SAM_CHEF', o, f);
    if (cl < 1) A5.magnifier(ctx, lerp(560, 600, Math.sin(lf * 0.3) * 0.5 + 0.5), 640, 1.0, 0.6);
    if (lf >= 28) { FX.boom(ctx, 540, 260, 'SLAM!', (lf - 28) / 3, { size: 140, col: '#fff', burst: '#ff4d4d', rot: -0.06, t: lt }); FX.bang(ctx, hd.x + hd.r * 1.5, hd.y - hd.r * 1.4, 0.8, 0.2, '!', '#ffd43b', (lf - 29) / 3); }
  } },
  // ===== "Bro…" — the apartment kitchen: Sam (soup-splashed whites) slumped; the roommate, deadpan
  { a: S.bro, b: E.bro, whip: 'l', cam: { s: [1.0, 1.05], f: [540, 860], snap: [{ at: 14, to: 1.08, dur: 6, f: [620, 820], over: 0.12 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', KIT(f));
    const so = CH(ctx, 'SAM_CHEF', () => ({ ...CHEF, x: 250, y: 1960, h: 1250, view: '34R', expr: 'mortified', look: [0.6, 0], sweat: 1, light: DAY }), f);
    const sh = headOf('SAM_CHEF', so, f); A.soupSpots(ctx, sh.x, sh.y + sh.r * 2.6, sh.r * 1.6, 6, 7);
    const o = CH(ctx, 'ROOMMATE', (t) => ({ x: 790, y: 1880, h: 1330, view: '34L', pose: 'armsCrossed', expr: 'deadpan', look: [-0.6, 0.1], light: DAY, rig: { headTilt: 4 * io(t, S.bro + 8, S.bro + 18) } }), f);
    const hd = headOf('ROOMMATE', o, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) });
    FX.speechBubble(ctx, { x: 640, y: 290, text: 'Bro…', tx: hd.x - 30, ty: hd.y - hd.r * 1.8, p: (lf - 2) / 5, size: 120, maxW: 700, hi: ['BRO…'] });
  } },
  // ===== "21 days left." — calendar + card
  { a: S.days, b: E.days, whip: 'r', cam: { s: [1.0, 1.05], f: [540, 900], shake: [[4, 18, 9]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#1f2457', col2: '#262c66', pattern: 'grid', t: lt });
    drawPhone(ctx, { ...PH, state: 'calendar', t: lt, p: lin(S.days + 1, S.days + 7, f), pill: lin(S.days + 3, S.days + 7, f), time: '9:59', day: 9, pillText: '⏳ 21 days left' });
    if (lf >= 4) { dark(ctx, 0.5 * lin(S.days + 4, S.days + 9, f)); FX.confetti(ctx, lt, { n: 30, seed: 21 }); FX.daysLeftCard(ctx, lt, (lf - 4) / 8, '21'); }
  } },
  // ===== "What did he write?" — the closed notebook, Sam shrugging with question marks; CTA
  { a: S.end, b: LEN, whip: 'l', cam: { s: [1.0, 1.05], f: [540, 900], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#e0a93b', col2: '#eab54a', pattern: 'burst', t: lt * 0.3, cy: 900 });
    const o = CH(ctx, 'SAM_CHEF', (t) => place('SAM_CHEF', 540, 640, 150, { ...CHEF, pose: 'shrug', expr: 'nervous', look: [0, 0.3], sweat: 1, rig: { squash: take(t - S.end, 1, 0.1) + Math.sin(t * 0.6) * 0.008 } }), f);
    const hd = headOf('SAM_CHEF', o, f);
    A.notebook(ctx, 540, 1080, 0.62, { write: 1, close: 1, rot: -0.06, t: lt });
    FX.bang(ctx, 540 + 130, 1080, 1.1, 0.1, '?', '#ffd43b', lf / 5);
    FX.questionMarks(ctx, hd.x, hd.y - hd.r * 2.4, 1.2, lt);
    FX.tag(ctx, 540, 230, 'WHAT DID HE WRITE? 🤔', { col: '#fff', tcol: INK, size: 74, rot: -0.03, p: (lf - 2) / 6 });
    FX.tag(ctx, 540, 370, 'GUESS IN THE COMMENTS 👇', { col: '#ff4d4d', tcol: '#fff', size: 56, rot: 0.03, p: (lf - 10) / 6 });
  } },
];
// the scribble's nib position (notebook-local), mirrors d9_art.scribble()
function penTip(k) {
  const N = 120, m = Math.max(2, Math.floor((N + 1) * clamp(k))), i = m - 1, u = i / N, a = u * Math.PI * 2 * 5.5, x = 210, y = -20;
  return [x - 160 + u * 320 + Math.cos(a) * 34, y + Math.sin(a) * 52 * (0.7 + 0.5 * hash(Math.floor(u * 9))) - (Math.floor(u * 6) % 2) * 20];
}
