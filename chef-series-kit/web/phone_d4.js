// Ep4 phone screens, registered into phone.js STATES (all app names / usernames invented):
// 'loopr'   comments sheet under Sam's Day 3 post in the invented video app "Loopr"; rows pop in, two get highlighted
// 'simmer'  invented cooking-class app "SimmerU": class page, Join press → "You're in!"
// 'call'    SimmerU live video class: host tile + 3x2 student grid (Sam's tile), toolbar, rename modal, leave → "You left"
import { clamp, eOut, eBack, lerp, rrPath } from './util.js';
import { STATES } from './phone.js';
import { drawChar, bounds } from './cast2d.js';
function placeC(name, hx, hy, hr, o = {}) { let ref; try { ref = bounds(name, { view: 'front', pose: 'stand', ...o, x: 0, y: 0, h: 1000 }).head; } catch (e) { ref = null; } if (!ref) ref = { x: 0, y: -830, r: 160 }; const h = hr / (ref.r / 1000); return { ...o, h, x: hx - ref.x * h / 1000, y: hy - ref.y * h / 1000 }; }
import { student, board, cubePile, onion } from './d4_art.js';

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

/* ---------- Loopr comments ---------- */
const COMMENTS = [
  ['crayon_fan22', '#ff8a3c', 'take a cooking class please 🙏', '2,341'],
  ['tulip.lover', '#e85a9a', "tell the truth before it's too late 😭", '1,982'],
  ['noodle.mom_', '#3aa060', 'the grape juice JAM 💀💀', '1,204'],
  ['pixel.pancake', '#4a7de0', 'bro thinks delivery is a cooking method', '876'],
  ['wafflecat.9', '#9b59d0', 'day 4 when?? 👀', '412'],
];
function loopr(ctx, sw, sh, o) {
  const t = o.t || 0, n = o.n ?? 5, h1 = clamp(o.h1 || 0), h2 = clamp(o.h2 || 0);
  // the paused video behind the sheet
  const g = ctx.createLinearGradient(0, 0, 0, 420); g.addColorStop(0, '#2a2350'); g.addColorStop(1, '#5a3a8a'); ctx.fillStyle = g; ctx.fillRect(0, 0, sw, 420);
  ctx.fillStyle = 'rgba(255,212,59,0.9)'; ctx.save(); ctx.translate(sw / 2, 250); ctx.rotate(-0.05); R(ctx, -150, -60, 300, 120, 24, '#ffd43b'); T(ctx, 'DAY 3', 0, 34, 80, 900, '#1c1530', 'center'); ctx.restore();
  statusBar(ctx, sw, true, o.time || '9:41');
  T(ctx, '@sam.cooks.fr  ·  Day 3 of 30', 40, 390, 26, 700, '#fff');
  // sheet
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 30; R(ctx, 0, 420, sw, sh, 40, '#fff'); ctx.restore();
  R(ctx, sw / 2 - 50, 438, 100, 10, 5, '#d6d6de');
  T(ctx, 'Comments', sw / 2, 512, 36, 800, '#16161d', 'center'); T(ctx, '4.8K', sw / 2 + 110, 512, 28, 600, GREY, 'left');
  ctx.fillStyle = LINE; ctx.fillRect(0, 540, sw, 2);
  let y = 560;
  COMMENTS.forEach(([user, col, text, likes], i) => {
    if (i >= n + 0.001) return; const k = clamp(n - i);
    ctx.font = `500 32px ${UI}`; const lines = wrap(ctx, text, sw - 240); const rh = 92 + lines.length * 42;
    const hl = i === 0 ? h1 : i === 1 ? h2 : 0;
    pop(ctx, k, 40, y + 40, () => {
      if (hl > 0) { R(ctx, 14, y - 6, (sw - 28) * eOut(hl), rh, 22, 'rgba(255,212,59,0.55)'); }
      C(ctx, 78, y + 50, 38, col); T(ctx, user[0].toUpperCase(), 78, y + 64, 38, 800, '#fff', 'center');
      T(ctx, user, 134, y + 40, 28, 700, '#16161d'); T(ctx, `${i + 1}h`, 134 + ctx.measureText(user).width + 16, y + 40, 24, 500, GREY);
      lines.forEach((l, j) => T(ctx, l, 134, y + 86 + j * 42, 32, 500, '#16161d'));
      T(ctx, '♡', sw - 56, y + 56, 38, 400, hl > 0 ? '#e2463f' : GREY, 'center'); T(ctx, likes, sw - 56, y + 92, 20, 600, GREY, 'center');
      T(ctx, 'Reply', 134, y + 86 + lines.length * 42 + 2, 22, 700, GREY);
    });
    y += rh + 12;
  });
  // comment box
  const ib = sh - 120; ctx.fillStyle = '#fff'; ctx.fillRect(0, ib, sw, 120); ctx.fillStyle = LINE; ctx.fillRect(0, ib, sw, 2);
  C(ctx, 70, ib + 58, 32, '#f2b52b'); T(ctx, 'S', 70, ib + 70, 32, 800, '#fff', 'center'); R(ctx, 120, ib + 24, sw - 160, 68, 34, '#f4f4f7'); T(ctx, 'Add a comment…', 150, ib + 68, 28, 400, GREY);
}

/* ---------- SimmerU class page ---------- */
function simmer(ctx, sw, sh, o) {
  const t = o.t || 0, press = clamp(o.press || 0), ok = clamp(o.ok || 0);
  ctx.fillStyle = '#fffaf2'; ctx.fillRect(0, 0, sw, sh);
  const g = ctx.createLinearGradient(0, 0, 0, 520); g.addColorStop(0, '#ff7a45'); g.addColorStop(1, '#e8452c'); ctx.fillStyle = g; ctx.fillRect(0, 0, sw, 520);
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 7; i++) C(ctx, 60 + i * 110, 200 + (i % 2) * 120, 44, 'rgba(255,255,255,0.12)');
  statusBar(ctx, sw, true, o.time || '9:44');
  T(ctx, 'SimmerU', 44, 196, 56, 900, '#fff'); T(ctx, '🍳', sw - 60, 196, 52, 400, '#000', 'right');
  onion(ctx, sw / 2 + 170, 420, 0.7, 0.15); T(ctx, '🔪', sw / 2 - 170, 440, 120, 400, '#000', 'center');
  R(ctx, 0, 490, sw, sh, 40, '#fffaf2');
  R(ctx, 44, 530, 210, 54, 27, '#ffe1e1'); C(ctx, 76, 557, 10, '#e2263b'); T(ctx, 'LIVE TONIGHT', 94, 567, 24, 800, '#e2263b');
  T(ctx, 'Cooking for', 44, 670, 64, 900); T(ctx, 'Total Beginners', 44, 744, 64, 900, '#e8452c');
  T(ctx, '★★★★★ 4.8  ·  Online  ·  7:00 PM', 44, 804, 28, 600, '#b8641f');
  ctx.fillStyle = LINE; ctx.fillRect(44, 836, sw - 88, 2);
  C(ctx, 86, 900, 36, '#1d1a2e'); T(ctx, '❓', 86, 914, 36, 400, '#000', 'center');
  T(ctx, 'Instructor: Surprise guest chef ⭐', 140, 894, 28, 700); T(ctx, '"from a very fancy restaurant"', 140, 932, 24, 500, GREY);
  T(ctx, 'Lesson 1 · Knife skills 🧅', 44, 1000, 30, 700, '#5a5a66');
  if (ok <= 0) { const s = 1 - 0.06 * Math.sin(press * Math.PI); ctx.save(); ctx.translate(sw / 2, sh - 100); ctx.scale(s, s); R(ctx, -310, -60, 620, 120, 60, press > 0.5 ? '#c7371f' : '#e8452c'); T(ctx, 'Join class · Free', 0, 14, 42, 800, '#fff', 'center'); ctx.restore(); }
  else pop(ctx, ok, sw / 2, sh - 110, () => { R(ctx, 40, sh - 190, sw - 80, 150, 36, '#2fa75a'); T(ctx, "✓ You're in!", sw / 2, sh - 124, 46, 800, '#fff', 'center'); T(ctx, 'Camera on · see you live 👋', sw / 2, sh - 72, 28, 600, '#eafff0', 'center'); });
}

/* ---------- SimmerU live call ---------- */
const STUD = [{ seed: 3, bg: '#f3e2c4' }, { seed: 11, bg: '#cfe6dc' }, { seed: 7, bg: '#e7d3ef' }, { seed: 19, bg: '#d9e4f5' }, { seed: 5, bg: '#f6d9cf' }];
const NAMES = ['dana_bakes', 'mo.k', 'grandma_rita', 'jules88', 'pete.p'];
function label(ctx, x, y, s, muted = true, size = 20) { ctx.font = `700 ${size}px ${UI}`; const w = ctx.measureText(s).width; R(ctx, x, y - size - 8, w + size * 2.2, size + 16, 10, 'rgba(12,10,20,0.7)'); T(ctx, muted ? '🔇' : '🎤', x + 8, y, size * 0.85, 400, '#fff'); T(ctx, s, x + size * 1.6, y - 1, size, 700, '#fff'); }
function hostChef(ctx, x, y, w, h, o) {   // the head chef inside his tile
  const t = o.t || 0, hc = o.hc || {};
  ctx.save(); ctx.beginPath(); rrPath(ctx, x, y, w, h, 22); ctx.clip();
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2b2a3a'); g.addColorStop(1, '#3e3350'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  // posh backdrop: gold frame + shelf of copper pots
  ctx.fillStyle = 'rgba(201,162,74,0.35)'; ctx.fillRect(x + 30, y + 40, 120, 160); ctx.fillStyle = '#c9a24a'; for (let i = 0; i < 3; i++) C(ctx, x + w - 200 + i * 70, y + 110, 26, '#c9824a');
  ctx.fillStyle = '#5a4630'; ctx.fillRect(x + w - 250, y + 136, 220, 12);
  const hr = hc.r || h * 0.2, hx = x + w / 2 + (hc.dx || 0), hy = y + h * (hc.fy ?? 0.5);
  const po = placeC('HEADCHEF', hx, hy, hr, { pose: hc.pose || 'stand', expr: hc.expr || 'stern', look: hc.look || [0, 0], rig: hc.rig || {}, t: t * 30 });
  drawChar(ctx, 'HEADCHEF', { view: 'front', ...po, say: hc.say, blink: 0, seed: 4, t: t * 30 });
  if (hc.onion) onion(ctx, hx + hr * 2.2, hy + hr * 2.4, hr / 120, 0.2);
  ctx.restore();
}
function samTile(ctx, x, y, w, h, o) {
  const t = o.t || 0;
  ctx.save(); ctx.beginPath(); rrPath(ctx, x, y, w, h, 18); ctx.clip();
  if (o.samOff) { ctx.fillStyle = '#17151f'; ctx.fillRect(x, y, w, h); C(ctx, x + w / 2, y + h * 0.45, 40, o.samName === 'Not Sam' ? '#3a3846' : '#f2b52b'); T(ctx, o.samName === 'Not Sam' ? 'NS' : 'S', x + w / 2, y + h * 0.45 + 13, 34, 800, '#fff', 'center'); }
  else { ctx.fillStyle = '#f0d8a8'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#e6b84a'; ctx.fillRect(x, y, w, h * 0.35);
    const po = placeC('SAM_CHEF', x + w / 2, y + h * 0.5, h * 0.2, { pose: o.samPose || 'cheer', expr: o.samExpr || 'grin', t: t * 30 }); drawChar(ctx, 'SAM_CHEF', { view: 'front', ...po, blink: 0, seed: 2, t: t * 30 }); }
  ctx.restore();
  if ((o.speak || 0) > 0) { ctx.strokeStyle = `rgba(60,220,110,${0.5 + 0.5 * Math.abs(Math.sin(t * 9))})`; ctx.lineWidth = 9; ctx.beginPath(); rrPath(ctx, x, y, w, h, 18); ctx.stroke();
    for (let i = 0; i < 5; i++) { const bh = 10 + 40 * Math.abs(Math.sin(t * 14 + i * 1.7)) * o.speak; R(ctx, x + w - 70 + i * 12, y + 26 + 40 - bh / 2, 8, bh, 4, '#3cdc6e'); } }
  label(ctx, x + 10, y + h - 12, o.samName || 'Sam (You)', o.mic !== 'on');
}
function call(ctx, sw, sh, o) {
  const t = o.t || 0, host = clamp(o.host ?? 1), stud = o.stud ?? 5, cubes = clamp(o.cubes || 0);
  ctx.fillStyle = '#121019'; ctx.fillRect(0, 0, sw, sh); statusBar(ctx, sw, true, o.time || '7:01');
  // header
  T(ctx, 'SimmerU', 40, 160, 26, 900, '#ff7a45');
  R(ctx, sw - 170, 128, 130, 44, 22, '#e2263b'); C(ctx, sw - 146, 150, 8, '#fff'); T(ctx, 'LIVE', sw - 126, 160, 24, 800, '#fff');
  if ((o.hiTitle || 0) > 0) R(ctx, 30, 176, (sw - 60) * eOut(clamp(o.hiTitle)), 56, 12, 'rgba(255,212,59,0.9)');
  T(ctx, 'Cooking for Total Beginners', 40, 218, 34, 800, (o.hiTitle || 0) > 0.5 ? '#16161d' : '#fff');
  // host tile
  const hx = 20, hy = 248, hw = sw - 40, hh = 420;
  if (host <= 0.001 || o.hostWait) { R(ctx, hx, hy, hw, hh, 22, '#1f1d2a'); const a = t * 6; for (let i = 0; i < 8; i++) C(ctx, sw / 2 + Math.cos(a + i * 0.785) * 40, hy + hh / 2 - 20 + Math.sin(a + i * 0.785) * 40, 6 + i, `rgba(255,255,255,${0.15 + i * 0.1})`); T(ctx, 'Waiting for host…', sw / 2, hy + hh / 2 + 80, 28, 600, '#9a98a8', 'center'); }
  if (host > 0.001 && !o.hostWait) pop(ctx, host, sw / 2, hy + hh / 2, () => { hostChef(ctx, hx, hy, hw, hh, o); label(ctx, hx + 14, hy + hh - 16, o.hostName || 'Host', false, 24); R(ctx, hx + hw - 120, hy + 16, 104, 38, 12, '#ffd43b'); T(ctx, 'HOST', hx + hw - 68, hy + 44, 22, 900, '#16161d', 'center'); });
  // student grid 3x2 (index 4 = Sam)
  const gw = (sw - 40 - 2 * 12) / 3, gh = 200, gy = hy + hh + 14;
  const order = [0, 1, 2, 3, 'S', 4];
  order.forEach((s, i) => {
    const x = 20 + (i % 3) * (gw + 12), y = gy + Math.floor(i / 3) * (gh + 12);
    if (s === 'S') { samTile(ctx, x, y, gw, gh, o); return; }
    if (s >= stud) { R(ctx, x, y, gw, gh, 18, '#1f1d2a'); return; }
    const st = STUD[s];
    pop(ctx, clamp(stud - s), x + gw / 2, y + gh / 2, () => {
      ctx.save(); ctx.beginPath(); rrPath(ctx, x, y, gw, gh, 18); ctx.clip(); ctx.fillStyle = st.bg; ctx.fillRect(x, y, gw, gh);
      ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(x, y + gh * 0.62, gw, gh);
      student(ctx, x + gw / 2, y + gh * 0.42, 34, st.seed, { t: t + s, wave: o.wave ? 1 : 0, look: o.shock ? 0 : 0 });
      if (cubes > 0) { ctx.save(); ctx.translate(x + gw / 2, y + gh * 0.88); ctx.scale(0.22, 0.22); board(ctx, 0, 0, 1, {}); cubePile(ctx, -10, 10, 18, 4, cubes); ctx.restore(); }
      if (o.shock) { T(ctx, '😳', x + gw - 30, y + 44, 34, 400, '#000', 'center'); }
      ctx.restore();
      label(ctx, x + 8, y + gh - 10, NAMES[s], true, 16);
    });
  });
  // toolbar
  const ty = sh - 150; ctx.fillStyle = '#1b1925'; ctx.fillRect(0, ty, sw, 150);
  const mic = o.mic === 'on', btn = (x, fill, icon, ring = 0) => { C(ctx, x, ty + 70, 46, fill); if (ring > 0) { ctx.strokeStyle = `rgba(255,212,59,${ring})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(x, ty + 70, 58 + 6 * Math.sin(t * 10), 0, 7); ctx.stroke(); } T(ctx, icon, x, ty + 84, 38, 400, '#fff', 'center'); };
  btn(110, mic ? '#2fa75a' : '#3a3846', mic ? '🎤' : '🔇', o.micRing || 0);
  btn(250, o.samOff ? '#e2263b' : '#3a3846', o.samOff ? '🚫' : '📷');
  btn(390, '#3a3846', '💬');
  const lp = clamp(o.leave || 0), ls = 1 - 0.1 * Math.sin(lp * Math.PI); ctx.save(); ctx.translate(590, ty + 70); ctx.scale(ls, ls); R(ctx, -100, -42, 200, 84, 42, lp > 0.5 ? '#b51d2f' : '#e2263b'); T(ctx, 'Leave', 0, 12, 34, 800, '#fff', 'center'); ctx.restore();
  // rename modal
  const rn = clamp(o.rename || 0);
  if (rn > 0) { ctx.fillStyle = `rgba(0,0,0,${0.55 * rn})`; ctx.fillRect(0, 0, sw, sh);
    pop(ctx, rn, sw / 2, 560, () => { R(ctx, 50, 400, sw - 100, 340, 32, '#fff'); T(ctx, 'Rename', sw / 2, 470, 38, 800, '#16161d', 'center');
      R(ctx, 90, 510, sw - 180, 96, 20, '#f4f4f7', BLUE, 4); const s = o.typed || ''; T(ctx, s, 120, 574, 44, 700, '#16161d'); ctx.font = `700 44px ${UI}`; if (Math.floor(t * 2.5) % 2) { ctx.fillStyle = BLUE; ctx.fillRect(124 + ctx.measureText(s).width, 532, 4, 54); }
      const sv = clamp(o.save || 0); R(ctx, sw / 2 - 130, 636, 260, 76, 38, sv > 0.5 ? '#1f5fc8' : BLUE); T(ctx, 'Save', sw / 2, 686, 34, 800, '#fff', 'center'); }); }
  // left screen
  const lf = clamp(o.left || 0);
  if (lf > 0) { ctx.fillStyle = `rgba(18,16,25,${lf})`; ctx.fillRect(0, 0, sw, sh);
    pop(ctx, lf, sw / 2, sh / 2, () => { T(ctx, '👋', sw / 2, sh / 2 - 60, 140, 400, '#000', 'center'); T(ctx, 'You left the meeting.', sw / 2, sh / 2 + 70, 42, 800, '#fff', 'center'); T(ctx, 'Rate this class: ☆☆☆☆☆', sw / 2, sh / 2 + 130, 28, 600, '#9a98a8', 'center'); }); }
}

Object.assign(STATES, { loopr, simmer, call });
