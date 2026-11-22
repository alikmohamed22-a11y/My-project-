// Ep9 phone screen, registered into phone.js STATES (all usernames / app names invented):
// 'comment9'  Loopr comments under Sam's Day 8 post: a viewer's "Serve Alfredo soup with baked bread / Best of luck Sam 🦋🌷 :)"
//             (invented handle @tulip.breadcrumbs). o.hi 0..1 highlights "baked bread", o.heart 0..1, o.p pop-in.
import { clamp, eOut, eBack, rrPath } from './util.js';
import { STATES } from './phone.js';

const UI = '"Inter", "Noto Color Emoji", sans-serif';
const GREY = '#8a8a96', LINE = '#e7e7ee', PURP = '#7a3cff';
export const VIEWER = 'tulip.breadcrumbs';
function T(ctx, s, x, y, size, weight = 500, col = '#16161d', align = 'left') { ctx.font = `${weight} ${size}px ${UI}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); }
function R(ctx, x, y, w, h, r, fill, stroke, lw = 2) { ctx.beginPath(); rrPath(ctx, x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
function C(ctx, x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); }
function statusBar(ctx, sw, time) {
  const col = '#111'; T(ctx, time, 70, 82, 30, 700, col);
  for (let i = 0; i < 4; i++) R(ctx, sw - 200 + i * 12, 82 - 8 - i * 5, 8, 8 + i * 5, 2, col);
  R(ctx, sw - 98, 62, 50, 24, 7, null, col, 2.5); R(ctx, sw - 94, 66, 30, 16, 4, col); R(ctx, sw - 45, 69, 4, 10, 2, col);
}
function pop(ctx, k, ax, ay, fn) { if (k <= 0) return; const s = 0.55 + 0.45 * eBack(clamp(k)); ctx.save(); ctx.globalAlpha = clamp(k * 3); ctx.translate(ax, ay); ctx.scale(s, s); ctx.translate(-ax, -ay); fn(); ctx.restore(); }

function comment9(ctx, sw, sh, o) {
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, sh);
  const k = clamp(o.p ?? 1), hi = clamp(o.hi || 0);
  // an older comment (dimmed) for context
  const y0 = 360;
  T(ctx, 'pastel.spatula_tips', 150, y0, 26, 800, '#b0b0bb'); T(ctx, 'Tips for meeting owner…', 150, y0 + 40, 30, 500, '#c4c4cc');
  C(ctx, 84, y0 + 6, 38, '#f4e3ee'); T(ctx, '🦋', 84, y0 + 20, 36, 400, '#000', 'center');
  ctx.fillStyle = LINE; ctx.fillRect(40, y0 + 80, sw - 80, 2);
  pop(ctx, k, 60, 540, () => {
    let y = 540; const bx = 160;
    R(ctx, 24, y - 70, sw - 48, 520, 28, 'rgba(255,212,59,0.12)');
    C(ctx, 88, y + 6, 52, '#ffd1dc'); T(ctx, '🌷', 88, y + 24, 52, 400, '#000', 'center');
    T(ctx, VIEWER, bx, y, 32, 800); const uw = (ctx.font = `800 32px ${UI}`, ctx.measureText(VIEWER).width); T(ctx, '13h', bx + uw + 14, y, 28, 500, GREY);
    T(ctx, 'replying to @sam.cooks.fr', bx, y + 42, 24, 600, PURP);
    y += 130;
    // line 1 with highlight on "baked bread"
    const size = 44; ctx.font = `600 ${size}px ${UI}`;
    const l1a = 'Serve Alfredo soup with', l1b = 'baked bread';
    T(ctx, l1a, bx, y, size, 600);
    const y2 = y + 66, bw = (ctx.font = `800 ${size}px ${UI}`, ctx.measureText(l1b).width);
    if (hi > 0) R(ctx, bx - 12, y2 - size - 4, (bw + 24) * eOut(hi), size + 24, 12, 'rgba(255,212,59,0.95)');
    T(ctx, l1b, bx, y2, size, hi > 0.5 ? 800 : 600);
    T(ctx, 'Best of luck Sam 🦋🌷', bx, y2 + 76, size, 600);
    T(ctx, ':)', bx, y2 + 146, size, 600);
    T(ctx, 'Reply', bx, y2 + 220, 28, 700, GREY); T(ctx, 'Hide', bx + 110, y2 + 220, 28, 700, GREY);
    const hk = clamp(o.heart || 0), hs = 1 + 0.4 * Math.sin(Math.min(1, hk) * Math.PI);
    ctx.save(); ctx.translate(sw - 60, 560); ctx.scale(hs, hs); T(ctx, hk > 0.3 ? '❤️' : '♡', 0, 0, 50, 400, hk > 0.3 ? '#e2463f' : GREY, 'center'); ctx.restore();
    T(ctx, hk > 0.3 ? '2' : '1', sw - 60, 606, 24, 700, GREY, 'center');
    if (hk > 0.3) T(ctx, '❤️ by creator', bx + 200, y2 + 220, 26, 700, '#e2463f');
  });
  // header (fixed)
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, 290); statusBar(ctx, sw, o.time || '8:00');
  T(ctx, 'Comments', sw / 2, 168, 34, 800, '#16161d', 'center'); T(ctx, '✕', sw - 50, 168, 32, 600, GREY, 'right');
  R(ctx, 30, 196, sw - 60, 78, 20, '#f4f4f7'); R(ctx, 42, 206, 58, 58, 12, '#e8d9a8'); T(ctx, '👔', 71, 248, 34, 400, '#000', 'center');
  T(ctx, 'sam.cooks.fr · Day 8 of 30', 116, 230, 22, 800); T(ctx, 'the critic is coming tomorrow 😰', 116, 260, 20, 500, GREY);
  ctx.fillStyle = LINE; ctx.fillRect(0, 288, sw, 2);
  const ib = sh - 120; ctx.fillStyle = '#fff'; ctx.fillRect(0, ib, sw, 120); ctx.fillStyle = LINE; ctx.fillRect(0, ib, sw, 2);
  C(ctx, 70, ib + 58, 32, '#f2b52b'); T(ctx, 'S', 70, ib + 70, 32, 800, '#fff', 'center');
  R(ctx, 120, ib + 24, sw - 160, 68, 34, null, '#d6d6de', 3); T(ctx, 'Add a comment…', 150, ib + 68, 26, 400, GREY);
}
Object.assign(STATES, { comment9 });
