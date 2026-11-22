// Ep8 phone screens, registered into phone.js STATES (all usernames / app names invented):
// 'tips8'    Loopr comments under Sam's Day 7 post: a viewer's "Tips for meeting owner" (3 tips, line highlights)
// 'critic8'  the city's toughest food critic's profile (invented: "The Iron Palate", @ironpalate_nofivestars)
import { clamp, eOut, eBack, lerp, rrPath } from './util.js';
import { STATES } from './phone.js';

const UI = '"Inter", "Noto Color Emoji", sans-serif';
const GREY = '#8a8a96', LINE = '#e7e7ee', PURP = '#7a3cff';
export const TIPS_USER = 'pastel.spatula_tips';
export const CRITIC_USER = 'ironpalate_nofivestars';
function T(ctx, s, x, y, size, weight = 500, col = '#16161d', align = 'left') { ctx.font = `${weight} ${size}px ${UI}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); }
function R(ctx, x, y, w, h, r, fill, stroke, lw = 2) { ctx.beginPath(); rrPath(ctx, x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
function C(ctx, x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); }
function statusBar(ctx, sw, dark, time) {
  const col = dark ? '#fff' : '#111'; T(ctx, time, 70, 82, 30, 700, col);
  for (let i = 0; i < 4; i++) R(ctx, sw - 200 + i * 12, 82 - 8 - i * 5, 8, 8 + i * 5, 2, col);
  R(ctx, sw - 98, 62, 50, 24, 7, null, col, 2.5); R(ctx, sw - 94, 66, 30, 16, 4, col); R(ctx, sw - 45, 69, 4, 10, 2, col);
}
function pop(ctx, k, ax, ay, fn) { if (k <= 0) return; const s = 0.55 + 0.45 * eBack(clamp(k)); ctx.save(); ctx.globalAlpha = clamp(k * 3); ctx.translate(ax, ay); ctx.scale(s, s); ctx.translate(-ax, -ay); fn(); ctx.restore(); }
function wrap(ctx, s, maxW) { const lines = []; let cur = ''; for (const w of s.split(' ')) { const tr = cur ? cur + ' ' + w : w; if (ctx.measureText(tr).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tr; } if (cur) lines.push(cur); return lines; }

/* ---------- the viewer's tips (as posted, invented handle) ---------- */
const TIPS = [
  ['Tips for meeting owner', 't'],
  ['1. Look professional { Suit, good boots, a red tie }', 'l', 'tip1'],
  ['2. Cook some pasta with garlic bread and salad', 'l', 'tip2'],
  ['3. Be polite 🤍🦋', 'l', 'tip3'],
  ['Hope this help..', 'l'],
];
// o.p (pop-in), o.hi {tip1,tip2,tip3: 0..1}, o.heart 0..1, o.dim (fade non-highlighted lines)
function tips8(ctx, sw, sh, o) {
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, sh);
  const hi = o.hi || {}, k = clamp(o.p ?? 1);
  let y = 380; const bx = 150, maxW = sw - bx - 50;
  pop(ctx, k, 40, 380, () => {
    C(ctx, 84, y + 6, 46, '#ffc6e0'); T(ctx, '🦋', 84, y + 22, 46, 400, '#000', 'center');
    T(ctx, TIPS_USER, bx, y, 30, 800); const uw = (ctx.font = `800 30px ${UI}`, ctx.measureText(TIPS_USER).width); T(ctx, '3h', bx + uw + 14, y, 26, 500, GREY);
    T(ctx, 'replying to @sam.cooks.fr', bx, y + 40, 24, 600, PURP);
    y += 120;
    for (const [s, st, id] of TIPS) {
      const size = st === 't' ? 44 : 40, weight = st === 't' ? 800 : 600, lh = size * 1.32;
      ctx.font = `${weight} ${size}px ${UI}`; const lines = wrap(ctx, s, maxW);
      const h = id ? clamp(hi[id] || 0) : 0;
      if (h > 0) { const ww = Math.max(...lines.map((l) => ctx.measureText(l).width)); R(ctx, bx - 12, y - size - 6, (ww + 24) * eOut(h), lines.length * lh + 10, 12, 'rgba(255,212,59,0.9)'); }
      const anyHi = Object.values(hi).some((v) => v > 0.5), dim = o.dim && anyHi && h < 0.5 ? 0.35 : 1;
      ctx.save(); ctx.globalAlpha = dim; lines.forEach((l, i) => T(ctx, l, bx, y + i * lh, size, h > 0.5 ? 800 : weight, '#16161d')); ctx.restore();
      y += lines.length * lh + (st === 't' ? 26 : 22);
    }
    y += 10; T(ctx, 'Reply', bx, y, 26, 700, GREY); T(ctx, 'See translation', bx + 110, y, 26, 700, GREY);
    const hk = clamp(o.heart || 0), hs = 1 + 0.4 * Math.sin(Math.min(1, hk) * Math.PI);
    ctx.save(); ctx.translate(sw - 50, 400); ctx.scale(hs, hs); T(ctx, hk > 0.3 ? '❤️' : '♡', 0, 0, 44, 400, hk > 0.3 ? '#e2463f' : GREY, 'center'); ctx.restore();
    T(ctx, hk > 0.3 ? '5,031' : '5,030', sw - 50, 442, 20, 700, GREY, 'center');
  });
  // header (fixed)
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, 290); statusBar(ctx, sw, false, o.time || '9:41');
  T(ctx, 'Comments', sw / 2, 168, 34, 800, '#16161d', 'center'); T(ctx, '✕', sw - 50, 168, 32, 600, GREY, 'right');
  R(ctx, 30, 196, sw - 60, 78, 20, '#f4f4f7'); R(ctx, 42, 206, 58, 58, 12, '#e8d9a8'); T(ctx, '🥣', 71, 248, 34, 400, '#000', 'center');
  T(ctx, 'sam.cooks.fr · Day 7 of 30', 116, 230, 22, 800); T(ctx, 'Alfredo soup… the owner wants seconds', 116, 260, 20, 500, GREY);
  ctx.fillStyle = LINE; ctx.fillRect(0, 288, sw, 2);
  const ib = sh - 120; ctx.fillStyle = '#fff'; ctx.fillRect(0, ib, sw, 120); ctx.fillStyle = LINE; ctx.fillRect(0, ib, sw, 2);
  C(ctx, 70, ib + 58, 32, '#f2b52b'); T(ctx, 'S', 70, ib + 70, 32, 800, '#fff', 'center');
  R(ctx, 120, ib + 24, sw - 160, 68, 34, null, '#d6d6de', 3); T(ctx, 'Add a comment…', 150, ib + 68, 26, 400, GREY);
}

/* ---------- the critic's profile ---------- */
// o.p (cards pop), o.hi (highlight "toughest"), o.stars 0..1 (one-star reviews drop in)
function critic8(ctx, sw, sh, o) {
  const t = o.t || 0;
  ctx.fillStyle = '#16131f'; ctx.fillRect(0, 0, sw, sh);
  statusBar(ctx, sw, true, o.time || '9:58');
  // banner + avatar
  const g = ctx.createLinearGradient(0, 110, sw, 400); g.addColorStop(0, '#3a1020'); g.addColorStop(1, '#7a1f2a'); ctx.fillStyle = g; ctx.fillRect(0, 110, sw, 220);
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 12; i++) ctx.fillRect(i * 70, 110, 30, 220);
  C(ctx, sw / 2, 330, 100, '#16131f'); C(ctx, sw / 2, 330, 90, '#2b2735'); T(ctx, '🧐', sw / 2, 362, 92, 400, '#000', 'center');
  T(ctx, 'The Iron Palate', sw / 2, 480, 52, 900, '#fff', 'center');
  T(ctx, '@' + CRITIC_USER, sw / 2, 522, 26, 600, '#c9c3d8', 'center');
  // bio with highlight
  const h = clamp(o.hi || 0); ctx.font = `800 36px ${UI}`; const bio = "City's toughest food critic.", bw = ctx.measureText(bio).width;
  const tw0 = ctx.measureText("City's ").width, tw1 = ctx.measureText('toughest').width;
  if (h > 0) R(ctx, sw / 2 - bw / 2 + tw0 - 8, 552, (tw1 + 16) * eOut(h), 50, 10, 'rgba(255,77,77,0.85)');
  T(ctx, bio, sw / 2, 590, 36, 800, '#fff', 'center');
  T(ctx, 'Never given 5 stars. Never will.', sw / 2, 636, 28, 500, '#c9c3d8', 'center');
  // stats
  const st = [['1,204', 'reviews'], ['2.1M', 'followers'], ['★ 1.3', 'avg rating']];
  st.forEach(([a, b], i) => { const x = sw / 2 + (i - 1) * 230; T(ctx, a, x, 712, 40, 900, i === 2 ? '#ffd43b' : '#fff', 'center'); T(ctx, b, x, 748, 22, 600, '#8f88a6', 'center'); });
  // recent reviews
  const rv = [['Bistro Nove', '"The soup was… wet."'], ['Casa Sol', '"Bread? Bold claim."'], ['Le Petit Four', '"I have notes. 40 pages."']];
  rv.forEach(([n, q], i) => { const k = clamp((o.stars ?? 1) * 3 - i); if (k <= 0) return; const y = 790 + i * 112;
    pop(ctx, k, sw / 2, y + 50, () => { R(ctx, 40, y, sw - 80, 100, 22, '#241f30', '#3a3448', 2); T(ctx, n, 70, y + 42, 28, 800, '#fff'); T(ctx, '★☆☆☆☆', sw - 70, y + 42, 28, 700, '#ffd43b', 'right'); T(ctx, q, 70, y + 80, 24, 500, '#c9c3d8'); }); });
  void t;
}
Object.assign(STATES, { tips8, critic8 });
