// Test timeline for the v2 engine/backgrounds: every upgraded set with a camera move + ambient animation + FX.
// Select with ?story=bgtest  (e.g. Q="?story=bgtest" node tools/render.mjs out "0-689")
import { W, H, FPS, clamp, lerp, lin, eOut, eInOut, hash } from './util.js';
import { drawBg, drawFg, KITCHEN, OFFICE, LUMEXT, MONTAGE } from './bg.js';
import * as FX from './fx.js';
let cast; try { cast = await import('./cast2d.js'); } catch (e) { cast = await import('./cast2d_stub.js'); }
const { drawChar, bounds } = cast;

export const CAPTIONS = false;
const sec = (f) => f / FPS;
function C(ctx, name, o, f) { const seed = o.seed ?? name.length * 7; try { drawChar(ctx, name, { view: 'front', pose: 'stand', expr: 'neutral', t: f, look: [0, 0], blink: 0, prop: null, seed, ...o }); } catch (e) { console.warn('cast', e.message); } }
function headOf(name, o) { try { const b = bounds(name, { view: 'front', pose: 'stand', ...o }); if (b && b.head) return b.head; } catch (e) { } return { x: o.x, y: o.y - o.h * 0.83, r: o.h * 0.16 }; }
function place(name, hx, hy, hr, o = {}) { const ref = headOf(name, { ...o, x: 0, y: 0, h: 1000 }); const h = hr / (ref.r / 1000); return { ...o, h, x: hx - ref.x * h / 1000, y: hy - ref.y * h / 1000 }; }
const NIGHT = { col: '#7f9cff', amt: 0.25, dir: [1, -0.4] };
const label = (ctx, s) => { const rs = ctx.canvas.width / W; ctx.save(); ctx.setTransform(rs, 0, 0, rs, 0, 0); FX.tag(ctx, 540, 1840, s, { col: '#1c1530', tcol: '#fff', size: 36, rot: 0 }); ctx.restore(); };

export const SHOTS = [
  // 1 apt_night: slow dolly-in with parallax + handheld drift
  { a: 0, b: 60, cam: { s: [1, 1.2], f: [560, 860], drift: 5 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_night', { t: sec(f) });
    C(ctx, 'SAM', { x: 460, y: 1500, h: 1150, pose: 'phone', prop: 'phone', phoneGlow: 1, expr: 'neutral', look: [0.2, 0.7], light: NIGHT }, f);
    drawFg(ctx, 'apt_night', { t: sec(f) }); label(ctx, 'DOLLY + PARALLAX + DRIFT');
  } },
  // 2 apt_night: truck right (near moves more than the city) + thought bubble
  { a: 60, b: 110, cam: { s: [1.15, 1.15], pan: [-150, 0, 150, 0], ease: 'lin', f: [540, 900] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_night', { t: sec(f) });
    const o = { x: 460, y: 1500, h: 1150, pose: 'stand', expr: 'happy', look: [0.5, -0.4], light: NIGHT }; C(ctx, 'SAM', o, f); const hd = headOf('SAM', o);
    drawFg(ctx, 'apt_night', { t: sec(f) });
    FX.thoughtBubble(ctx, { x: 740, y: 430, w: 520, h: 320, tx: hd.x + hd.r, ty: hd.y - hd.r, p: (lf - 4) / 10, t: lt, text: 'CHEF?!', size: 90 });
    label(ctx, 'TRUCK RIGHT');
  } },
  // 3 lumiere_ext: whip in, truck left along the queue
  { a: 110, b: 170, whip: 'r', cam: { s: [1.08, 1.08], pan: [140, 60, -140, 60], f: [540, 1200], drift: 3 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_ext', { t: sec(f) });
    C(ctx, 'SAM', { x: 640, y: 1760, h: 900, pose: 'stand', view: '34R', expr: 'nervous', look: [0.6, 0] }, f);
    drawFg(ctx, 'lumiere_ext', { t: sec(f) }); label(ctx, 'WHIP + TRUCK LEFT');
  } },
  // 4 lumiere_dining: dolly + rack focus (char sharp → bg sharp)
  { a: 170, b: 230, cam: { s: [1.0, 1.1], f: [540, 900], focus0: 'char', rack: [{ at: 26, dur: 14, to: 'bg', amt: 10 }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'lumiere_dining', { t: sec(f) });
    FX.charFocus(ctx, (g) => C(g, 'SAM_CHEF', { x: 300, y: 2000, h: 1500, pose: 'armsCrossed', expr: 'proud', light: { col: '#ffcf6b', amt: 0.3, dir: [0, -1] } }, f));
    drawFg(ctx, 'lumiere_dining', { t: sec(f) }); label(ctx, 'RACK FOCUS');
  } },
  // 5 chef_office: snap-zoom with overshoot onto the 4:00 stopwatch
  { a: 230, b: 280, cam: { s: [1, 1.02], drift: 2, snap: [{ at: 18, to: 2.0, dur: 8, over: 0.15, f: [560, 1170] }] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'chef_office', { t: sec(f) });
    C(ctx, 'HEADCHEF', { x: 760, y: 1640, h: 1380, pose: 'armsCrossed', expr: 'stern', look: [-0.6, 0.1] }, f);
    drawFg(ctx, 'chef_office', { t: sec(f), timer: lf < 30 ? 240 : 240 - (lf - 30) / 6, ring: lf > 26 ? 1 : 0 });
    label(ctx, 'SNAP ZOOM (OVERSHOOT)');
  } },
  // 6 apt_kitchen day: Sam looks up → tilt up to the egg on the ceiling
  { a: 280, b: 350, cam: { moves: [{ at: 16, dur: 26, dy: -1150, ease: 'io' }], drift: 2 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), ceilingEgg: true, micro: true });
    C(ctx, 'SAM', { x: 540, y: 1850, h: 1330, pose: 'stand', expr: lf < 10 ? 'neutral' : 'shock', look: [0, -1] }, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f) }); label(ctx, 'TILT UP');
  } },
  // 7 apt_kitchen disaster: crash zoom + BOOM
  { a: 350, b: 395, cam: { s: [1, 1.03], crash: [{ at: 12, to: 1.55, dur: 3, f: [540, 760] }], shake: [[15, 22, 12]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), mess: 1, burner: 1, alarm: true });
    FX.smoke(ctx, KITCHEN.pot[0], KITCHEN.pot[1] - 120, lt, { n: 8, spread: 300, rise: 800, size: 120, seed: 4 });
    C(ctx, 'SAM_SOOT', { x: 420, y: 1830, h: 1150, pose: 'shrug', expr: 'nervous' }, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f), mess: 1 });
    if (lf >= 15) FX.boom(ctx, 640, 520, 'BOOM!', (lf - 15) / 10, { t: lt });
    label(ctx, 'CRASH ZOOM + HAZE');
  } },
  // 8 smash cut → stove close-up egg burst with impact frame + drips
  { a: 395, b: 440, smash: true, impact: { at: 8, n: 2, type: 'invert' }, cam: { shake: [[8, 30, 14]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'stove_cu', { t: sec(f), water: true, egg: lf < 8, rattle: 1, mess: lf >= 12 ? 0.3 : 0 });
    FX.eggBurst(ctx, 570, 690, (lf - 8) / FPS, { seed: 5, scale: 1.2, targets: [[200, 260, 70], [880, 420, 60], [520, 140, 80]] });
    if (lf >= 8) FX.boom(ctx, 760, 1120, 'POP!', (lf - 8) / 8, { col: '#fff', burst: '#ffd43b', rot: 0.1, t: lt, size: 150 });
    label(ctx, 'SMASH + IMPACT FRAME');
  } },
  // 9–11 montage: vintage photos 2015 / 2018 / 2021
  ...[2015, 2018, 2021].map((year, i) => ({ a: 440 + i * 30, b: 470 + i * 30, smash: i > 0, impact: i > 0 ? { n: 1, type: 'flat', col: '#ffd43b' } : undefined, cam: { s: [1.02, 1.08], f: [540, 800], drift: 3 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'montage', { t: sec(f), year });
    const { x, y, hr } = MONTAGE.sam; MONTAGE.clip(ctx, () => C(ctx, 'SAM', place('SAM', x, y, hr, { pose: 'sit', expr: ['happy', 'grin', 'excited'][i], look: [0, 0.2] }), f));
    drawFg(ctx, 'montage', { t: sec(f), year });
  } })),
  // 12 oui card + stamp
  { a: 530, b: 580, cam: { s: [1, 1.05], shake: [[24, 14, 8]] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'oui_card', { t: sec(f) });
    FX.ouiCard(ctx, lt, { p: lf / 8, sub: '(that was the whole interview)' });
    FX.stamp(ctx, 540, 1180, '', (lf - 22) / 20, { lines: ['SAM DOES NOT', 'SPEAK FRENCH'], size: 78, t: lt });
    if (lf > 24) FX.dustPuff(ctx, 540, 1300, (lf - 24) / 16, { col: '#f6efe0', spread: 380 });
  } },
  // 13 FX: speed lines bg, smear + motion lines + dust, notification banner
  { a: 580, b: 630, cam: { s: [1, 1.04], drift: 4 }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'solid', { col: '#2a7d84', col2: 'rgba(255,255,255,0.35)', pattern: 'speed', t: lt, cy: 800 });
    const run = Math.sin(lf * 0.9); const o = { x: 540, y: 1520, h: 1000, pose: 'walk', view: 'sideR', expr: 'excited' };
    FX.smear(ctx, 120, 1000, 380, 1060, 70, '#f2b33d', { seed: lf });
    FX.motionLines(ctx, 420, 1000, 1, 0, { n: 6, len: 220, spread: 500, t: lt, col: '#fff' });
    C(ctx, 'SAM', o, f);
    FX.dustPuff(ctx, 520, 1520, (lf % 16) / 16, { seed: Math.floor(lf / 16) });
    FX.notifBanner(ctx, { app: 'Smoke Alarm', title: 'SMOKE DETECTED 🔥', body: 'Notifying emergency contact: Mom', p: (lf - 6) / 8, out: lin(42, 50, lf) });
    FX.sparkle(ctx, 860, 560, 1.2, lt); FX.glint(ctx, 0, 0, W, H, lin(20, 34, lf), { a: 0.18 });
  } },
  // 14 kitchen doorway (reverse) — far hallway layer parallax on a slow truck
  { a: 630, b: 670, whip: 'l', cam: { s: [1.08, 1.12], pan: [80, 0, -80, 0], f: [520, 900] }, draw(ctx, lf, f, lt) {
    drawBg(ctx, 'apt_kitchen', { t: sec(f), view: 'doorway', mess: 1 });
    C(ctx, 'ROOMMATE', { x: 520, y: 1700, h: 1300, pose: 'hold', prop: 'grocerybag', expr: 'confused', look: [0.6, 0] }, f);
    drawFg(ctx, 'apt_kitchen', { t: sec(f), view: 'doorway', mess: 1 });
  } },
  // 15 microwave sparks
  { a: 670, b: 700, cam: { s: [1.05, 1.15], f: [430, 1000], shake: [[16, 14, 8]] }, flashes: [[16, 4, 0.7]], draw(ctx, lf, f, lt) {
    drawBg(ctx, 'microwave_cu', { t: sec(f), sparks: lin(4, 16, lf) }); drawFg(ctx, 'microwave_cu', { t: sec(f), sparks: lin(4, 16, lf) });
  } },
];
export const LEN = 700;
