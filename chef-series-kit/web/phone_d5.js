// Ep5 phone screen, registered into phone.js STATES (all app / school names invented):
// 'class5'  the invented class app "SimmerU": an IN-PERSON class page (Whisk & Co. Cooking School), Book press → "Booked!"
import { clamp, eOut, eBack, lerp, rrPath } from './util.js';
import { STATES } from './phone.js';
import { bread } from './d5_art.js';

const UI = '"Inter", "Noto Color Emoji", sans-serif';
const GREY = '#8a8a96', LINE = '#e7e7ee';
function T(ctx, s, x, y, size, weight = 500, col = '#16161d', align = 'left') { ctx.font = `${weight} ${size}px ${UI}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); }
function R(ctx, x, y, w, h, r, fill) { ctx.beginPath(); rrPath(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); }
function C(ctx, x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); }
function statusBar(ctx, sw, time) {
  T(ctx, time, 70, 82, 30, 700, '#fff');
  for (let i = 0; i < 4; i++) R(ctx, sw - 200 + i * 12, 82 - 8 - i * 5, 8, 8 + i * 5, 2, '#fff');
  R(ctx, sw - 98, 62, 50, 24, 7, 'rgba(255,255,255,0.4)'); R(ctx, sw - 94, 66, 30, 16, 4, '#fff');
}
function pop(ctx, k, ax, ay, fn) { if (k <= 0) return; const s = 0.55 + 0.45 * eBack(clamp(k)); ctx.save(); ctx.globalAlpha = clamp(k * 3); ctx.translate(ax, ay); ctx.scale(s, s); ctx.translate(-ax, -ay); fn(); ctx.restore(); }

function class5(ctx, sw, sh, o) {
  const press = clamp(o.press || 0), ok = clamp(o.ok || 0), hiBg = clamp(o.hiBg || 0);
  ctx.fillStyle = '#fffaf2'; ctx.fillRect(0, 0, sw, sh);
  const g = ctx.createLinearGradient(0, 0, 0, 520); g.addColorStop(0, '#2b9c8f'); g.addColorStop(1, '#1f7469'); ctx.fillStyle = g; ctx.fillRect(0, 0, sw, 520);
  for (let i = 0; i < 7; i++) C(ctx, 60 + i * 110, 200 + (i % 2) * 120, 44, 'rgba(255,255,255,0.1)');
  statusBar(ctx, sw, o.time || '8:02');
  T(ctx, 'SimmerU', 44, 196, 56, 900, '#fff'); T(ctx, '🍳', sw - 60, 196, 52, 400, '#000', 'right');
  bread(ctx, sw / 2 - 150, 400, 0.55, -0.15); bread(ctx, sw / 2 + 150, 400, 0.55, 0.15); T(ctx, '🥪', sw / 2, 440, 130, 400, '#000', 'center');
  R(ctx, 0, 490, sw, sh, 40, '#fffaf2');
  R(ctx, 44, 530, 250, 54, 27, '#dff5ef'); C(ctx, 76, 557, 10, '#2b9c8f'); T(ctx, 'IN PERSON 📍', 94, 567, 24, 800, '#1f7469');
  T(ctx, 'Sandwich Basics', 44, 670, 64, 900); T(ctx, 'for Beginners', 44, 744, 64, 900, '#2b9c8f');
  T(ctx, '★★★★★ 4.9  ·  Sat 10:00 AM', 44, 804, 28, 600, '#b8641f');
  ctx.fillStyle = LINE; ctx.fillRect(44, 836, sw - 88, 2);
  T(ctx, '📍 Whisk & Co. Cooking School', 44, 900, 30, 700);
  if (hiBg > 0) R(ctx, 34, 930, (sw - 68) * eOut(hiBg), 60, 12, 'rgba(255,77,77,0.35)');
  T(ctx, '🔍 Background check at the door', 44, 972, 30, 700, '#c4222f');
  T(ctx, '"it is easy" — 9 out of 10 students', 44, 1030, 24, 500, GREY);
  if (ok <= 0) { const s = 1 - 0.06 * Math.sin(press * Math.PI); ctx.save(); ctx.translate(sw / 2, sh - 100); ctx.scale(s, s); R(ctx, -310, -60, 620, 120, 60, press > 0.5 ? '#16695f' : '#2b9c8f'); T(ctx, 'Book my spot', 0, 14, 42, 800, '#fff', 'center'); ctx.restore(); }
  else pop(ctx, ok, sw / 2, sh - 110, () => { R(ctx, 40, sh - 190, sw - 80, 150, 36, '#2fa75a'); T(ctx, '✓ Booked!', sw / 2, sh - 124, 46, 800, '#fff', 'center'); T(ctx, 'Bring an apron · and your ID 👀', sw / 2, sh - 72, 28, 600, '#eafff0', 'center'); });
}
Object.assign(STATES, { class5 });
