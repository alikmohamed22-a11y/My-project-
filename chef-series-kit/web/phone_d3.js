// Ep3 phone screens, registered into phone.js STATES:
// 'chef3'   thread with the head chef: risotto request, then Sam's photo + the chef's reply
// 'spell'   web search with Sam's misspelled attempts → "Did you mean: risotto"
// 'recipe'  recipe app card (step highlights)
// 'forkd'   invented food delivery app: order risotto, rider on the way
// 'camera'  camera viewfinder with a content callback, shutter flash and "Sent" toast
import { clamp, eOut, eBack, lerp, rrPath } from './util.js';
import { STATES } from './phone.js';
import { fancyPlate, pot } from './d3_art.js';

const UI = '"Inter", "Noto Color Emoji", sans-serif';
const BLUE = '#2f7cf6', GREY = '#8a8a96', LINE = '#e7e7ee';
function T(ctx, s, x, y, size, weight = 500, col = '#16161d', align = 'left', base = 'alphabetic') { ctx.font = `${weight} ${size}px ${UI}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y); }
function R(ctx, x, y, w, h, r, fill, stroke, lw = 2) { ctx.beginPath(); rrPath(ctx, x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
function C(ctx, x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); }
function statusBar(ctx, sw, dark, time) {
  const col = dark ? '#fff' : '#111'; T(ctx, time, 70, 82, 30, 700, col);
  for (let i = 0; i < 4; i++) R(ctx, sw - 200 + i * 12, 82 - 8 - i * 5, 8, 8 + i * 5, 2, col);
  ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(sw - 128, 84, 6 + i * 8, -Math.PI * 0.75, -Math.PI * 0.25); ctx.stroke(); }
  R(ctx, sw - 98, 62, 50, 24, 7, null, col, 2.5); R(ctx, sw - 94, 66, 30, 16, 4, col); R(ctx, sw - 45, 69, 4, 10, 2, col);
}
function pop(ctx, k, ax, ay, fn) { if (k <= 0) return; const s = 0.55 + 0.45 * eBack(clamp(k)); ctx.save(); ctx.globalAlpha = clamp(k * 3); ctx.translate(ax, ay); ctx.scale(s, s); ctx.translate(-ax, -ay); fn(); ctx.restore(); }
function wrap(ctx, s, maxW) { const lines = []; let cur = ''; for (const w of s.split(' ')) { const tr = cur ? cur + ' ' + w : w; if (ctx.measureText(tr).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tr; } lines.push(cur); return lines; }
function typingDots(ctx, x, y, t) { R(ctx, x, y, 160, 90, 45, '#ececf1'); for (let i = 0; i < 3; i++) { const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 8 - i * 0.9)); C(ctx, x + 44 + i * 36, y + 45 - a * 8, 13, `rgba(110,110,125,${a})`); } }

/* ---------- thread with the head chef ---------- */
function chef3(ctx, sw, sh, o) {
  const t = o.t || 0;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, sh);
  ctx.save(); ctx.translate(0, -(o.scroll || 0));
  let y = 300;
  const bub = (s, mine, k, size = 44, weight = 600) => {
    ctx.font = `${weight} ${size}px ${UI}`; const lines = wrap(ctx, s, 500);
    const bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 60, bh = lines.length * size * 1.3 + 40, bx = mine ? sw - 30 - bw : 30;
    if (k > 0) pop(ctx, k, mine ? bx + bw : bx, y + bh, () => { R(ctx, bx, y, bw, bh, 40, mine ? BLUE : '#ececf1'); lines.forEach((l, i) => T(ctx, l, bx + 30, y + 20 + size * 1.02 + i * size * 1.3, size, weight, mine ? '#fff' : '#16161d')); });
    y += bh + 14;
  };
  if (o.mode !== 'reply') {
    T(ctx, 'Yesterday 9:03 PM', sw / 2, y, 22, 500, GREY, 'center'); y += 34;
    bub("Can't wait to see what you can do.", false, 1, 38); bub('Same.', true, 1, 40); T(ctx, 'Read 9:04 PM', sw - 40, y + 4, 20, 500, GREY, 'right'); y += 56;
    T(ctx, 'Today 6:12 PM', sw / 2, y, 22, 500, GREY, 'center'); y += 34;
    const n = o.n || 0;
    if (n > 0) bub('Send me a photo of your risotto.', false, clamp(n), 50);
    if (n > 1) bub('Tonight.', false, clamp(n - 1), 66, 800);
    if (o.typing) typingDots(ctx, 30, y + 6, t);
  } else {
    T(ctx, 'Today 6:12 PM', sw / 2, y, 22, 500, GREY, 'center'); y += 34;
    bub('Send me a photo of your risotto.', false, 1, 40); bub('Tonight.', false, 1, 46, 800);
    T(ctx, 'Today 8:47 PM', sw / 2, y + 20, 22, 500, GREY, 'center'); y += 54;
    // Sam's photo bubble
    const pw = 420, ph = 330, px = sw - 30 - pw, py = y;
    pop(ctx, 1, px + pw, py + ph, () => { ctx.save(); ctx.beginPath(); rrPath(ctx, px, py, pw, ph, 36); ctx.clip(); ctx.fillStyle = '#2b3a4a'; ctx.fillRect(px, py, pw, ph);
      const g = ctx.createLinearGradient(px, py, px, py + ph); g.addColorStop(0, '#3d566b'); g.addColorStop(1, '#22303d'); ctx.fillStyle = g; ctx.fillRect(px, py, pw, ph);
      fancyPlate(ctx, px + pw / 2, py + ph * 0.58, 0.62, { leaf: 1 }); ctx.restore(); });
    y += ph + 10; T(ctx, 'Delivered', sw - 40, y + 14, 22, 600, GREY, 'right'); y += 44;
    const r = o.r || 0;
    if (r > 0) bub('Beautiful.', false, clamp(r), 58, 800);
    if (r > 1) bub('Bring it tomorrow.', false, clamp(r - 1), 50);
    if (r > 2) bub('I want to taste it. 👨‍🍳', false, clamp(r - 2), 50);
    if (o.typing) typingDots(ctx, 30, y + 6, t);
  }
  ctx.restore();
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, 110); statusBar(ctx, sw, false, o.time || '6:12');
  ctx.fillStyle = '#f7f7fa'; ctx.fillRect(0, 110, sw, 150); ctx.fillStyle = LINE; ctx.fillRect(0, 260, sw, 2);
  T(ctx, '‹', 40, 210, 60, 400, BLUE); C(ctx, 140, 186, 44, '#1d1a2e'); ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(140, 186, 44, 0, 7); ctx.stroke(); T(ctx, '👨‍🍳', 140, 202, 44, 400, '#000', 'center');
  T(ctx, 'Head Chef', 202, 180, 34, 800); T(ctx, 'Lumière', 202, 220, 24, 500, '#b08a2e');
  const ib = sh - 130; ctx.fillStyle = '#fff'; ctx.fillRect(0, ib, sw, 130); R(ctx, 30, ib + 20, sw - 140, 70, 35, null, '#d6d6de', 3); T(ctx, 'Message', 64, ib + 66, 28, 400, GREY);
  C(ctx, sw - 60, ib + 55, 34, '#d6d6de'); T(ctx, '↑', sw - 60, ib + 68, 38, 800, '#fff', 'center');
}

/* ---------- misspelled search ---------- */
const TRIES = ['rizoto', 'risoto', 'reezotto', 'rice auto'];
function spell(ctx, sw, sh, o) {
  const t = o.t || 0, k = o.k || 0, res = clamp(o.res || 0);   // k: 0..4 attempts typed (fractional = typing current)
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, sh); statusBar(ctx, sw, false, o.time || '6:14');
  const i = Math.min(TRIES.length - 1, Math.floor(k)), part = k >= TRIES.length ? 1 : k - Math.floor(k);
  const q = TRIES[i], qs = q.slice(0, Math.max(1, Math.round(q.length * Math.min(1, part * 1.25))));
  R(ctx, 30, 130, sw - 60, 92, 46, '#f1f1f5'); T(ctx, '🔍', 76, 192, 34, 400, '#000', 'center');
  T(ctx, qs, 112, 190, 38, 500, '#16161d'); ctx.font = `500 38px ${UI}`; if (Math.floor(t * 2.5) % 2) { ctx.fillStyle = BLUE; ctx.fillRect(116 + ctx.measureText(qs).width, 156, 4, 46); }
  // recent (failed) searches list
  T(ctx, 'Recent', 40, 290, 28, 700, '#5a5a66');
  for (let j = 0; j < i; j++) { const yy = 350 + (i - 1 - j) * 84; T(ctx, '🕘', 54, yy, 30, 400, GREY, 'center'); T(ctx, TRIES[j], 100, yy, 36, 500, '#2a2a34'); T(ctx, '0 results', sw - 40, yy, 24, 600, '#e2463f', 'right'); ctx.fillStyle = LINE; ctx.fillRect(40, yy + 26, sw - 80, 2); }
  if (res <= 0) return;
  pop(ctx, res, sw / 2, 720, () => {
    R(ctx, 30, 640, sw - 60, 300, 32, '#fff6c4', '#ffb820', 5);
    T(ctx, 'Did you mean:', 70, 710, 34, 500, '#5a5a66'); T(ctx, 'risotto', 70, 800, 76, 800, '#c2185b');
    T(ctx, '/ ri-ZOT-oh /  · Italian', 70, 856, 28, 500, GREY); T(ctx, '(you tried 4 times)', 70, 904, 26, 600, '#e2463f');
  });
}

/* ---------- recipe app ---------- */
function recipe(ctx, sw, sh, o) {
  const t = o.t || 0, h1 = clamp(o.h1 || 0), stop = clamp(o.stop || 0), h2 = clamp(o.h2 || 0);
  ctx.fillStyle = '#fffaf2'; ctx.fillRect(0, 0, sw, sh);
  // hero image
  const g = ctx.createLinearGradient(0, 0, 0, 470); g.addColorStop(0, '#e9b872'); g.addColorStop(1, '#c97d3c'); ctx.fillStyle = g; ctx.fillRect(0, 0, sw, 470);
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(80 + i * 130, 120 + (i % 2) * 90, 50, 0, 7); ctx.fill(); }
  pot(ctx, sw / 2 + 30, 430, 0.95, { fill: 0.92, t, spoon: 0.35 });
  statusBar(ctx, sw, true, o.time || '6:15');
  R(ctx, 0, 440, sw, sh, 44, '#fffaf2');
  T(ctx, 'Classic Risotto', 44, 540, 58, 800); T(ctx, '★★★★★  4.9  ·  ⏱ 45 min  ·  Hard', 44, 594, 26, 600, '#b8641f');
  ctx.fillStyle = LINE; ctx.fillRect(44, 624, sw - 88, 2); T(ctx, 'STEPS', 44, 684, 26, 800, GREY);
  const step = (n, y, l1, l2, hl, col) => {
    C(ctx, 74, y - 12, 26, '#16161d'); T(ctx, String(n), 74, y, 30, 800, '#fff', 'center');
    ctx.font = `700 38px ${UI}`; const w1 = ctx.measureText(l1).width, w2 = l2 ? ctx.measureText(l2).width : 0;
    if (hl > 0) { ctx.fillStyle = col; ctx.fillRect(116, y - 40, (Math.max(w1, w2) + 20) * eOut(hl), l2 ? 108 : 56); }
    T(ctx, l1, 124, y, 38, 700); if (l2) T(ctx, l2, 124, y + 52, 38, 700);
  };
  step(1, 760, 'Stir for 30 minutes.', null, h1, 'rgba(255,212,59,0.95)');
  // "Don't stop." with red underline
  T(ctx, "Don't stop.", 124, 816, 40, 900, stop > 0 ? '#d6243b' : '#16161d'); if (stop > 0) { ctx.fillStyle = '#d6243b'; ctx.font = `900 40px ${UI}`; ctx.fillRect(124, 828, ctx.measureText("Don't stop.").width * eOut(stop), 7); }
  step(2, 912, 'Add 1 cup white wine.', null, h2, 'rgba(255,212,59,0.95)');
  step(3, 1000, 'Season to taste.', null, 0);
  ctx.save(); ctx.globalAlpha = 0.5; step(4, 1088, 'Plate with love ♡', null, 0); ctx.restore();
  R(ctx, sw / 2 - 120, sh - 40, 240, 10, 5, 'rgba(0,0,0,0.3)');
}

/* ---------- delivery app (invented: "Forkd") ---------- */
function forkd(ctx, sw, sh, o) {
  const t = o.t || 0, press = clamp(o.press || 0), ok = clamp(o.ok || 0);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, sh);
  ctx.fillStyle = '#ff5a36'; ctx.fillRect(0, 0, sw, 300); statusBar(ctx, sw, true, o.time || '8:21');
  T(ctx, 'forkd', 44, 220, 72, 900, '#fff'); T(ctx, '🛵', sw - 70, 214, 64, 400, '#000', 'right');
  R(ctx, 30, 330, sw - 60, 380, 32, '#fff7f0', '#ffd8c8', 3);
  ctx.save(); ctx.beginPath(); rrPath(ctx, 30, 330, sw - 60, 200, 32); ctx.clip(); ctx.fillStyle = '#2a7a3a'; ctx.fillRect(30, 330, sw - 60, 200); ctx.fillStyle = '#fff'; ctx.fillRect(30 + (sw - 60) / 3, 330, (sw - 60) / 3, 200); ctx.fillStyle = '#c0392b'; ctx.fillRect(30 + 2 * (sw - 60) / 3, 330, (sw - 60) / 3, 200); ctx.restore();
  R(ctx, sw / 2 - 160, 380, 320, 100, 50, '#fff', '#16161d', 4); T(ctx, "Nonna Lucia's", sw / 2, 446, 40, 800, '#c0392b', 'center');
  T(ctx, '★ 4.9 · Italian · 18 min', 60, 584, 28, 600, '#5a5a66');
  T(ctx, 'Risotto ai funghi', 60, 650, 44, 800); T(ctx, '$24.50', sw - 60, 650, 40, 800, '#16161d', 'right');
  T(ctx, 'Note to rider:', 60, 790, 28, 700, '#5a5a66'); R(ctx, 50, 810, sw - 100, 90, 20, '#f4f4f7'); T(ctx, '“please be discreet 🤫”', 74, 868, 32, 600, '#16161d');
  if (ok <= 0) { const s = 1 - 0.06 * Math.sin(press * Math.PI); ctx.save(); ctx.translate(sw / 2, 1010); ctx.scale(s, s); R(ctx, -300, -60, 600, 120, 60, press > 0.5 ? '#d9411f' : '#ff5a36'); T(ctx, 'Place order · $24.50', 0, 14, 40, 800, '#fff', 'center'); ctx.restore(); }
  else pop(ctx, ok, sw / 2, 1010, () => { R(ctx, 40, 940, sw - 80, 150, 36, '#2fa75a'); T(ctx, '✓ Order placed!', sw / 2, 1006, 44, 800, '#fff', 'center'); T(ctx, `🛵  Arriving in ${18 - Math.floor(ok * 0)} min`, sw / 2, 1060, 32, 600, '#eafff0', 'center'); });
  R(ctx, sw / 2 - 120, sh - 40, 240, 10, 5, 'rgba(0,0,0,0.3)');
}

/* ---------- camera viewfinder ---------- */
function camera(ctx, sw, sh, o) {
  const t = o.t || 0, flash = clamp(o.flash || 0), sent = clamp(o.sent || 0);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, sw, sh);
  const vy = 170, vh = sh - 470;
  ctx.save(); ctx.beginPath(); ctx.rect(0, vy, sw, vh); ctx.clip(); if (o.content) o.content(ctx, 0, vy, sw, vh);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(sw * i / 3, vy); ctx.lineTo(sw * i / 3, vy + vh); ctx.moveTo(0, vy + vh * i / 3); ctx.lineTo(sw, vy + vh * i / 3); ctx.stroke(); }
  // focus square
  ctx.strokeStyle = '#ffd43b'; ctx.lineWidth = 4; const fs = 150 + 20 * Math.max(0, 1 - (o.lf || 99) / 8); ctx.strokeRect(sw / 2 - fs / 2, vy + vh * 0.5 - fs / 2, fs, fs);
  ctx.restore();
  T(ctx, '✦ PORTRAIT', sw / 2, 130, 26, 800, '#ffd43b', 'center');
  T(ctx, 'PHOTO', sw / 2, sh - 250, 26, 800, '#ffd43b', 'center');
  C(ctx, sw / 2, sh - 140, 70, '#fff'); C(ctx, sw / 2, sh - 140, 58, '#000'); C(ctx, sw / 2, sh - 140, 52 * (1 - 0.15 * Math.sin(clamp(o.press || 0) * Math.PI)), '#fff');
  R(ctx, 60, sh - 186, 92, 92, 18, '#333');
  if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash})`; ctx.fillRect(0, 0, sw, sh); }
  if (sent > 0) pop(ctx, sent, sw / 2, 300, () => { R(ctx, sw / 2 - 240, 240, 480, 110, 55, 'rgba(30,30,36,0.92)'); T(ctx, '✓ Sent to Head Chef', sw / 2, 312, 36, 800, '#7ee081', 'center'); });
}

Object.assign(STATES, { chef3, spell, recipe, forkd, camera });
