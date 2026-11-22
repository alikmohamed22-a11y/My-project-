// Ep6 phone screens, registered into phone.js STATES (all app names / usernames invented):
// 'chef6'  thread with the head chef: "Tomorrow, YOU cook family meal." → Sam's brave reply → typing → "P.S. The owner is coming."
// 'vid6'   the invented video app "Loopr": a recipe video by @speedy.spoon, speed menu (2×), playback with a content callback
import { clamp, eOut, eBack, lerp, rrPath } from './util.js';
import { STATES } from './phone.js';

const UI = '"Inter", "Noto Color Emoji", sans-serif';
const BLUE = '#2f7cf6', GREY = '#8a8a96', LINE = '#e7e7ee';
function T(ctx, s, x, y, size, weight = 500, col = '#16161d', align = 'left', base = 'alphabetic') { ctx.font = `${weight} ${size}px ${UI}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y); }
function R(ctx, x, y, w, h, r, fill, stroke, lw = 2) { ctx.beginPath(); rrPath(ctx, x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
function C(ctx, x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); }
function statusBar(ctx, sw, dark, time) {
  const col = dark ? '#fff' : '#111'; T(ctx, time, 70, 82, 30, 700, col);
  for (let i = 0; i < 4; i++) R(ctx, sw - 200 + i * 12, 82 - 8 - i * 5, 8, 8 + i * 5, 2, col);
  R(ctx, sw - 98, 62, 50, 24, 7, null, col, 2.5); R(ctx, sw - 94, 66, 30, 16, 4, col); R(ctx, sw - 45, 69, 4, 10, 2, col);
}
function pop(ctx, k, ax, ay, fn) { if (k <= 0) return; const s = 0.55 + 0.45 * eBack(clamp(k)); ctx.save(); ctx.globalAlpha = clamp(k * 3); ctx.translate(ax, ay); ctx.scale(s, s); ctx.translate(-ax, -ay); fn(); ctx.restore(); }
function wrap(ctx, s, maxW) { const lines = []; let cur = ''; for (const w of s.split(' ')) { const tr = cur ? cur + ' ' + w : w; if (ctx.measureText(tr).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tr; } if (cur) lines.push(cur); return lines; }
function typingDots(ctx, x, y, t) { R(ctx, x, y, 160, 90, 45, '#ececf1'); for (let i = 0; i < 3; i++) { const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 8 - i * 0.9)); C(ctx, x + 44 + i * 36, y + 45, 12, `rgba(120,120,135,${a})`); } }

/* ---------- head chef thread ---------- */
// o.n: incoming bubbles (0..2), o.mine: Sam's reply (0..1), o.typing, o.ps: P.S. bubble (0..1), o.hi: highlight on "YOU"
function chef6(ctx, sw, sh, o) {
  const t = o.t || 0;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, sh);
  ctx.save(); ctx.translate(0, -(o.scroll || 0));
  let y = 300;
  const bub = (s, mine, k, size = 44, weight = 600, hiWord = null, hiK = 0) => {
    ctx.font = `${weight} ${size}px ${UI}`; const lines = wrap(ctx, s, 520);
    const bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 60, bh = lines.length * size * 1.3 + 40, bx = mine ? sw - 30 - bw : 30;
    if (k > 0) pop(ctx, k, mine ? bx + bw : bx, y + bh, () => {
      R(ctx, bx, y, bw, bh, 40, mine ? BLUE : '#ececf1');
      lines.forEach((l, i) => {
        const ly = y + 20 + size * 1.02 + i * size * 1.3;
        if (hiWord && hiK > 0 && l.includes(hiWord)) { ctx.font = `${weight} ${size}px ${UI}`; const x0 = bx + 30 + ctx.measureText(l.slice(0, l.indexOf(hiWord))).width, ww = ctx.measureText(hiWord).width; R(ctx, x0 - 8, ly - size * 0.9, (ww + 16) * eOut(hiK), size * 1.15, 10, 'rgba(255,212,59,0.9)'); }
        T(ctx, l, bx + 30, ly, size, weight, mine ? '#fff' : '#16161d');
      });
    });
    y += bh + 14;
  };
  T(ctx, 'Today 9:41 PM', sw / 2, y, 22, 500, GREY, 'center'); y += 34;
  const n = o.n || 0;
  if (n > 0) bub('Tomorrow, YOU cook family meal.', false, clamp(n), 52, 700, 'YOU', o.hi || 0);
  if (n > 1) bub('Lunch for the whole team. 11:30 sharp. 👨‍🍳', false, clamp(n - 1), 40);
  if (o.mine > 0) { bub('no problem chef 😎', true, clamp(o.mine), 42); if (o.mine >= 1) { T(ctx, 'Read 9:44 PM', sw - 40, y + 4, 20, 500, GREY, 'right'); y += 40; } }
  if (o.ps > 0) bub('P.S. The owner is coming.', false, clamp(o.ps), 60, 800, 'owner', o.hi2 || 0);
  else if (o.typing) typingDots(ctx, 30, y + 6, t);
  ctx.restore();
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, 110); statusBar(ctx, sw, false, o.time || '9:41');
  ctx.fillStyle = '#f7f7fa'; ctx.fillRect(0, 110, sw, 150); ctx.fillStyle = LINE; ctx.fillRect(0, 260, sw, 2);
  T(ctx, '‹', 40, 210, 60, 400, BLUE); C(ctx, 140, 186, 44, '#1d1a2e'); ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(140, 186, 44, 0, 7); ctx.stroke(); T(ctx, '👨‍🍳', 140, 202, 44, 400, '#000', 'center');
  T(ctx, 'Head Chef', 202, 180, 34, 800); T(ctx, 'Lumière', 202, 220, 24, 500, '#b08a2e');
  const ib = sh - 130; ctx.fillStyle = '#fff'; ctx.fillRect(0, ib, sw, 130); R(ctx, 30, ib + 20, sw - 140, 70, 35, null, '#d6d6de', 3); T(ctx, 'Message', 64, ib + 66, 28, 400, GREY);
  C(ctx, sw - 60, ib + 55, 34, '#d6d6de'); T(ctx, '↑', sw - 60, ib + 68, 38, 800, '#fff', 'center');
}

/* ---------- recipe video (Loopr) ---------- */
// o.content(ctx, w, h): draws the video frame; o.prog 0..1 progress; o.speed '1×'|'2×'; o.menu 0..1 speed sheet; o.pick 0..1 (2× chosen);
// o.play 0..1 (play-button overlay alpha); o.badge 0..1 (big "2×" badge)
function vid6(ctx, sw, sh, o) {
  const t = o.t || 0;
  ctx.fillStyle = '#0e0d14'; ctx.fillRect(0, 0, sw, sh);
  const vx = 0, vy = 150, vw = sw, vh = 980;
  ctx.save(); ctx.beginPath(); ctx.rect(vx, vy, vw, vh); ctx.clip(); ctx.translate(vx, vy);
  if (o.content) o.content(ctx, vw, vh); ctx.restore();
  statusBar(ctx, sw, true, o.time || '9:52');
  T(ctx, 'Loopr', 44, 132, 34, 900, '#fff'); T(ctx, '⋯', sw - 50, 128, 40, 800, '#fff', 'right');
  // play overlay
  const pl = clamp(o.play || 0); if (pl > 0) { ctx.save(); ctx.globalAlpha = pl; C(ctx, sw / 2, vy + vh / 2, 90, 'rgba(0,0,0,0.45)'); ctx.beginPath(); ctx.moveTo(sw / 2 - 26, vy + vh / 2 - 44); ctx.lineTo(sw / 2 + 46, vy + vh / 2); ctx.lineTo(sw / 2 - 26, vy + vh / 2 + 44); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore(); }
  // progress bar
  const pr = clamp(o.prog || 0); R(ctx, 0, vy + vh - 8, sw, 8, 0, 'rgba(255,255,255,0.3)'); R(ctx, 0, vy + vh - 8, sw * pr, 8, 0, '#ff3d6e'); C(ctx, sw * pr, vy + vh - 4, 12, '#ff3d6e');
  // info
  let y = vy + vh + 70;
  T(ctx, 'Easy pasta in 60 seconds ⏱️', 40, y, 42, 800, '#fff'); y += 50;
  T(ctx, '2.1M views · 3 days ago', 40, y, 26, 500, '#a8a6b8'); y += 70;
  C(ctx, 80, y - 10, 38, '#ff9a3c'); T(ctx, '🥄', 80, y + 4, 36, 400, '#000', 'center');
  T(ctx, '@speedy.spoon', 136, y + 2, 32, 700, '#fff'); R(ctx, sw - 220, y - 44, 180, 66, 33, '#fff'); T(ctx, 'Follow', sw - 130, y + 0, 28, 800, '#111', 'center');
  // speed pill on the video
  if (o.speed) { R(ctx, sw - 150, vy + 30, 120, 60, 30, o.speed === '2×' ? '#ff3d6e' : 'rgba(0,0,0,0.5)'); T(ctx, `${o.speed} ⏩`, sw - 90, vy + 70, 28, 800, '#fff', 'center'); }
  // speed sheet
  const m = clamp(o.menu || 0);
  if (m > 0) {
    ctx.save(); ctx.globalAlpha = 0.5 * m; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, sw, sh); ctx.restore();
    const top = lerp(sh, sh - 640, eOut(m));
    R(ctx, 0, top, sw, 700, 40, '#1c1b24'); R(ctx, sw / 2 - 50, top + 18, 100, 10, 5, '#4a4858');
    T(ctx, 'Playback speed', 44, top + 100, 34, 800, '#fff');
    ['0.5×', '1×  Normal', '1.5×', '2×'].forEach((s, i) => {
      const ry = top + 160 + i * 100, pick = clamp(o.pick || 0), sel = (i === 3 && pick > 0.5) || (i === 1 && pick <= 0.5);
      if (i === 3 && pick > 0) R(ctx, 24, ry - 10, (sw - 48) * eOut(pick), 90, 20, 'rgba(255,61,110,0.35)');
      T(ctx, s, 60, ry + 50, 38, i === 3 ? 900 : 600, '#fff'); C(ctx, sw - 80, ry + 38, 22, sel ? '#ff3d6e' : 'rgba(255,255,255,0.15)'); if (sel) C(ctx, sw - 80, ry + 38, 9, '#fff');
    });
  }
}
Object.assign(STATES, { chef6, vid6 });
