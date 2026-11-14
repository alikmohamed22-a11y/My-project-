// Ep2 phone screens, registered into phone.js STATES: 'notifs' (lock screen with comment notifications),
// 'search' (confused web search), 'chef' (text thread with the head chef, Sam types + sends "Same.").
import { clamp, eOut, eBack, lerp, rrPath } from './util.js';
import { STATES } from './phone.js';

const UI = '"Inter", "Noto Color Emoji", sans-serif';
const BLUE = '#2f7cf6', GREY = '#8a8a96', LINE = '#e7e7ee';
function T(ctx, s, x, y, size, weight = 500, col = '#16161d', align = 'left', base = 'alphabetic') { ctx.font = `${weight} ${size}px ${UI}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y); }
function R(ctx, x, y, w, h, r, fill, stroke, lw = 2) { ctx.beginPath(); rrPath(ctx, x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
function C(ctx, x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); }
function avatar(ctx, x, y, r, col, letter, tcol = '#fff') { C(ctx, x, y, r, col); T(ctx, letter, x, y + r * 0.36, r * 1.0, 800, tcol, 'center'); }
function statusBar(ctx, sw, dark, time) {
  const col = dark ? '#fff' : '#111'; T(ctx, time, 70, 82, 30, 700, col);
  for (let i = 0; i < 4; i++) R(ctx, sw - 200 + i * 12, 82 - 8 - i * 5, 8, 8 + i * 5, 2, col);
  ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(sw - 128, 84, 6 + i * 8, -Math.PI * 0.75, -Math.PI * 0.25); ctx.stroke(); }
  R(ctx, sw - 98, 62, 50, 24, 7, null, col, 2.5); R(ctx, sw - 94, 66, 30, 16, 4, col); R(ctx, sw - 45, 69, 4, 10, 2, col);
}
function pop(ctx, k, ax, ay, fn) { if (k <= 0) return; const s = 0.55 + 0.45 * eBack(clamp(k)); ctx.save(); ctx.globalAlpha = clamp(k * 3); ctx.translate(ax, ay); ctx.scale(s, s); ctx.translate(-ax, -ay); fn(); ctx.restore(); }

/* ---------- lock screen + comment notifications ---------- */
export const REQUESTS = [
  { user: 'crunchy.mornings', text: 'Cereal 🥣', col: '#f2b33d', l: 'C', likes: '2.1K' },
  { user: 'grill_dad_77', text: 'sous vide chicken', col: '#3aa060', l: 'G', likes: '1.4K' },
  { user: 'slice.of.life_22', text: 'Should make pizza', col: '#e2463f', l: 'S', likes: '3.8K' },
];
function notifs(ctx, sw, sh, o) {
  const n = o.n || 0, t = o.t || 0, hl = o.hl ?? -1;
  const g = ctx.createLinearGradient(0, 0, sw, sh); g.addColorStop(0, '#ff8a3c'); g.addColorStop(0.5, '#d9467a'); g.addColorStop(1, '#5a2fb0'); ctx.fillStyle = g; ctx.fillRect(0, 0, sw, sh);
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(sw * (0.1 + 0.15 * i), sh * (0.2 + 0.11 * (i % 3)), 90 + 30 * (i % 2), 0, 7); ctx.fill(); }
  statusBar(ctx, sw, true, o.time || '7:58');
  T(ctx, '🔒', sw / 2, 168, 34, 400, '#fff', 'center'); T(ctx, 'Tuesday, June 2', sw / 2, 236, 32, 600, 'rgba(255,255,255,0.9)', 'center');
  T(ctx, o.clock || '7:58', sw / 2, 400, 168, 700, '#fff', 'center');
  REQUESTS.forEach((q, i) => {
    const k = clamp(n - i); if (k <= 0) return;
    const y = 470 + i * 196, x = 28, w = sw - 56, h = 176;
    pop(ctx, k, sw / 2, y, () => {
      ctx.fillStyle = 'rgba(12,6,28,0.25)'; ctx.beginPath(); rrPath(ctx, x + 6, y + 10, w, h, 40); ctx.fill();
      R(ctx, x, y, w, h, 40, hl === i ? '#fff6c4' : 'rgba(250,248,252,0.96)');
      if (hl === i) { ctx.lineWidth = 6; ctx.strokeStyle = '#ffb820'; ctx.beginPath(); rrPath(ctx, x, y, w, h, 40); ctx.stroke(); }
      // app icon (invented "Reelz" app)
      const ig = ctx.createLinearGradient(x + 30, y + 30, x + 100, y + 100); ig.addColorStop(0, '#ffb13b'); ig.addColorStop(1, '#e0306f'); R(ctx, x + 30, y + 34, 76, 76, 20, ig);
      T(ctx, '▶', x + 70, y + 86, 36, 800, '#fff', 'center');
      T(ctx, 'REELZ', x + 128, y + 60, 23, 700, '#6a6a76'); T(ctx, i === n - 1 && k < 1 ? 'now' : `${(2 - i) * 3 + 1}m ago`, x + w - 30, y + 60, 23, 500, '#6a6a76', 'right');
      T(ctx, `${q.user} commented:`, x + 128, y + 102, 28, 600, '#16161d');
      T(ctx, `“${q.text}”`, x + 128, y + 146, 38, 800, '#16161d');
      avatar(ctx, x + w - 62, y + 120, 30, q.col, q.l);
    });
  });
  // "+ 312 more" pill
  const km = clamp(n - 3); if (km > 0) pop(ctx, km, sw / 2, 1100, () => { R(ctx, sw / 2 - 230, 1068, 460, 64, 32, 'rgba(255,255,255,0.3)'); T(ctx, '+ 1,204 more comments', sw / 2, 1110, 28, 700, '#fff', 'center'); });
  R(ctx, sw / 2 - 120, sh - 40, 240, 10, 5, 'rgba(255,255,255,0.8)');
}

/* ---------- web search ---------- */
function search(ctx, sw, sh, o) {
  const ty = clamp(o.typed || 0), res = clamp(o.res || 0), hl = clamp(o.hl || 0), t = o.t || 0;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, sh); statusBar(ctx, sw, false, o.time || '10:12');
  const q = 'what is soo veed', qs = q.slice(0, Math.round(q.length * ty));
  R(ctx, 30, 130, sw - 60, 92, 46, '#f1f1f5'); T(ctx, '🔍', 76, 192, 34, 400, '#000', 'center');
  T(ctx, qs, 112, 190, 38, 500, '#16161d'); ctx.font = `500 38px ${UI}`; if (ty < 1 || Math.floor(t * 2.5) % 2) { ctx.fillStyle = BLUE; ctx.fillRect(116 + ctx.measureText(qs).width, 156, 4, 46); }
  if (res <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(res * 2);
  T(ctx, 'Did you mean: ', 40, 290, 30, 500, '#5a5a66'); ctx.font = `500 30px ${UI}`; const dx = ctx.measureText('Did you mean: ').width; T(ctx, 'sous vide', 40 + dx, 290, 30, 800, '#c2185b');
  ctx.fillStyle = LINE; ctx.fillRect(30, 320, sw - 60, 2);
  const y0 = lerp(380, 350, eOut(res));
  R(ctx, 30, y0, sw - 60, 560, 32, '#fff', '#e0e0e8', 3);
  T(ctx, 'sous vide', 64, y0 + 82, 56, 800); T(ctx, '/ soo-VEED /  · French', 64, y0 + 132, 28, 500, GREY);
  T(ctx, 'Cooking food sealed in a', 64, y0 + 210, 38, 500); T(ctx, 'plastic bag in a', 64, y0 + 262, 38, 500);
  // highlighted phrase
  ctx.font = `800 40px ${UI}`; const pw = ctx.measureText('warm water bath.').width;
  ctx.fillStyle = 'rgba(255,212,59,0.95)'; ctx.fillRect(58, y0 + 284, (pw + 14) * eOut(hl), 58);
  T(ctx, 'warm water bath.', 64, y0 + 326, 40, 800);
  ctx.fillStyle = LINE; ctx.fillRect(64, y0 + 380, sw - 128, 2);
  T(ctx, 'People also ask', 64, y0 + 440, 28, 700, '#5a5a66'); T(ctx, 'Can I sous vide in a bathtub?  ⌄', 64, y0 + 500, 30, 500, BLUE);
  ctx.restore();
}

/* ---------- text thread with the head chef ---------- */
function chef(ctx, sw, sh, o) {
  const n = clamp(o.n || 0), typed = clamp(o.typed || 0), sent = clamp(o.sent || 0), t = o.t || 0;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, sh);
  const kb = clamp(o.kb || 0), kbH = 340 * eOut(kb), ib = sh - 130 - kbH;
  ctx.save(); ctx.translate(0, -(o.scroll || 0) * eOut(kb));
  let y = 316; T(ctx, 'Today 9:03 PM', sw / 2, y, 22, 500, GREY, 'center'); y += 34;
  const bub = (s, mine, k, size = 44) => {
    const lines = []; ctx.font = `600 ${size}px ${UI}`; let cur = ''; for (const w of s.split(' ')) { const tr = cur ? cur + ' ' + w : w; if (ctx.measureText(tr).width > 500 && cur) { lines.push(cur); cur = w; } else cur = tr; } lines.push(cur);
    const bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 60, bh = lines.length * size * 1.3 + 40, bx = mine ? sw - 30 - bw : 30;
    if (k > 0) pop(ctx, k, mine ? bx + bw : bx, y + bh, () => { R(ctx, bx, y, bw, bh, 40, mine ? BLUE : '#ececf1'); lines.forEach((l, i) => T(ctx, l, bx + 30, y + 20 + size * 1.02 + i * size * 1.3, size, 600, mine ? '#fff' : '#16161d')); });
    y += bh + 14;
  };
  if (!o.compact) { bub("Welcome to the team, Sam.", false, 1, 38); bub('Thank you chef!! 🙏', true, 1, 38); T(ctx, 'Read 6:15 PM', sw - 40, y + 4, 20, 500, GREY, 'right'); y += 40; }
  if (n > 0) bub("Can't wait to see what you can do.", false, n, 50);
  if (sent > 0) { bub('Same.', true, sent, 58); if (sent >= 1) T(ctx, o.read ? 'Read 9:04 PM' : 'Delivered', sw - 40, y + 4, 22, 600, GREY, 'right'); }
  if (o.typing) { const bx = 30, by = y + 40; R(ctx, bx, by, 160, 90, 45, '#ececf1'); for (let i = 0; i < 3; i++) { const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 8 - i * 0.9)); C(ctx, bx + 44 + i * 36, by + 45 - a * 8, 13, `rgba(110,110,125,${a})`); } }
  ctx.restore();
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, 110); statusBar(ctx, sw, false, o.time || '9:03');
  ctx.fillStyle = '#f7f7fa'; ctx.fillRect(0, 110, sw, 150); ctx.fillStyle = LINE; ctx.fillRect(0, 260, sw, 2);
  T(ctx, '‹', 40, 210, 60, 400, BLUE); C(ctx, 140, 186, 44, '#1d1a2e'); ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(140, 186, 44, 0, 7); ctx.stroke(); T(ctx, '👨‍🍳', 140, 202, 44, 400, '#000', 'center');
  T(ctx, 'Head Chef', 202, 180, 34, 800); T(ctx, 'Lumière', 202, 220, 24, 500, '#b08a2e');
  // input bar + keyboard
  ctx.fillStyle = '#fff'; ctx.fillRect(0, ib, sw, 130); R(ctx, 30, ib + 20, sw - 140, 70, 35, null, '#d6d6de', 3);
  const msg = 'Same.'.slice(0, Math.round(5 * typed));
  if (sent > 0 || !msg) T(ctx, 'Message', 64, ib + 66, 28, 400, GREY); else { T(ctx, msg, 64, ib + 68, 34, 500, '#16161d'); ctx.font = `500 34px ${UI}`; if (Math.floor(t * 2.5) % 2) { ctx.fillStyle = BLUE; ctx.fillRect(68 + ctx.measureText(msg).width, ib + 36, 4, 40); } }
  C(ctx, sw - 60, ib + 55, 34, msg && !sent ? BLUE : '#d6d6de'); T(ctx, '↑', sw - 60, ib + 68, 38, 800, '#fff', 'center');
  if (kbH > 1) { ctx.fillStyle = '#d4d6dd'; ctx.fillRect(0, sh - kbH, sw, kbH); const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
    rows.forEach((r, ri) => { const kw = 64, gap = 8, tw = r.length * (kw + gap) - gap, x0 = (sw - tw) / 2; [...r].forEach((ch, ci) => { const x = x0 + ci * (kw + gap), yy = sh - kbH + 24 + ri * 100;
      const hit = o.key && o.key === ch; R(ctx, x, yy, kw, 84, 12, hit ? '#a9adb8' : '#fff'); T(ctx, ch, x + kw / 2, yy + 56, 34, 500, '#16161d', 'center'); }); }); }
}

Object.assign(STATES, { notifs, search, chef });
