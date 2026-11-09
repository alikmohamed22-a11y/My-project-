// Realistic modern phone with our own invented app UIs. drawPhone(ctx, {x,y,w,h,state,t,...})
// x,y = top-left of phone body. Design space is 780 px wide; w scales it.
import { INK, clamp, eOut, eBack, lerp, rrPath, txt, glow, rng } from './util.js';

const UI = '"Inter", "Noto Color Emoji", sans-serif';
const BLUE = '#2f7cf6', GREY = '#8a8a96', LINE = '#e7e7ee';
function T(ctx, s, x, y, size, weight = 500, col = '#16161d', align = 'left', base = 'alphabetic') { ctx.font = `${weight} ${size}px ${UI}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y); }
function R(ctx, x, y, w, h, r, fill, stroke, lw = 2) { ctx.beginPath(); rrPath(ctx, x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
function C(ctx, x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); }
function wrap(ctx, s, maxW, size, weight = 500) { ctx.font = `${weight} ${size}px ${UI}`; const out = []; let cur = ''; for (const w of s.split(' ')) { const tr = cur ? cur + ' ' + w : w; if (ctx.measureText(tr).width > maxW && cur) { out.push(cur); cur = w; } else cur = tr; } if (cur) out.push(cur); return out; }

function statusBar(ctx, sw, dark, time = '11:46') {
  const col = dark ? '#fff' : '#111';
  T(ctx, time, 70, 82, 30, 700, col);
  for (let i = 0; i < 4; i++) R(ctx, sw - 200 + i * 12, 82 - 8 - i * 5, 8, 8 + i * 5, 2, col);
  ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(sw - 128, 84, 6 + i * 8, -Math.PI * 0.75, -Math.PI * 0.25); ctx.stroke(); }
  R(ctx, sw - 98, 62, 50, 24, 7, null, col, 2.5); R(ctx, sw - 94, 66, 30, 16, 4, col); R(ctx, sw - 45, 69, 4, 10, 2, col);
}
function avatar(ctx, x, y, r, col, letter, tcol = '#fff') { C(ctx, x, y, r, col); T(ctx, letter, x, y + r * 0.36, r * 1.0, 800, tcol, 'center'); }

/* ---------- email ---------- */
function email(ctx, sw, sh, o) {
  const open = clamp(o.open || 0), t = o.t || 0;
  // inbox
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, sh); statusBar(ctx, sw, false, o.time);
  T(ctx, '‹ Mailboxes', 40, 160, 30, 500, BLUE); T(ctx, 'Edit', sw - 40, 160, 30, 500, BLUE, 'right');
  T(ctx, 'Inbox', 40, 236, 64, 800); R(ctx, 40, 266, sw - 80, 60, 18, '#efeff4'); T(ctx, '🔍  Search', 64, 306, 28, 400, GREY);
  const rows = [['Lumière', "You're hired!", 'Dear Sam, we are delighted to offer…', '11:46 PM', '#c9a24a', 'L', true], ['PizzaNow', 'Your pizza is on the way!', 'Driver Max is 4 min away. Track…', '9:12 PM', '#e2463f', 'P'], ['Mom', 'did you eat today', 'call me back pls. also are you…', '6:30 PM', '#d96aa0', 'M'], ['NoodleMart', '🍜 40% off cup noodles', 'Stock up! Your favourite flavours…', 'Tue', '#f08a3c', 'N'], ['FlexGym', 'We miss you, Sam', "It's been 214 days since your…", 'Mon', '#3aa060', 'F'], ['CityBank', 'Low balance alert', 'Your checking account balance is…', 'Sun', '#2f7cf6', 'C']];
  rows.forEach(([from, subj, prev, time, col, l, unread], i) => {
    const y = 350 + i * 160; if (i === 0 && o.tap) { ctx.fillStyle = `rgba(47,124,246,${0.14 * Math.sin(clamp(o.tap) * Math.PI)})`; ctx.fillRect(0, y, sw, 160); }
    if (unread) C(ctx, 24, y + 46, 9, BLUE); avatar(ctx, 88, y + 70, 42, col, l);
    T(ctx, from, 150, y + 50, 31, unread ? 800 : 600); T(ctx, time, sw - 40, y + 50, 24, 400, GREY, 'right');
    T(ctx, subj, 150, y + 90, 28, unread ? 700 : 500); T(ctx, prev, 150, y + 128, 25, 400, GREY);
    ctx.fillStyle = LINE; ctx.fillRect(150, y + 158, sw - 150, 2);
  });
  if (open <= 0) return;
  // opened message slides in
  const ox = (1 - eOut(open)) * sw; ctx.save(); ctx.translate(ox, 0);
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(-20, 0, 20, sh); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, sh); statusBar(ctx, sw, false, o.time);
  T(ctx, '‹ Inbox', 40, 160, 30, 500, BLUE); ctx.fillStyle = LINE; ctx.fillRect(0, 190, sw, 2);
  const k = clamp(o.pop ?? 1); const s = 0.6 + 0.4 * eBack(k);
  ctx.save(); ctx.translate(40, 270); ctx.scale(s, s); T(ctx, "You're hired! 🎉", 0, 0, 64, 800); ctx.restore();
  avatar(ctx, 82, 360, 40, '#1d1a2e', 'L', '#e6b84a'); ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(82, 360, 40, 0, 7); ctx.stroke();
  T(ctx, 'Lumière', 140, 350, 31, 800); T(ctx, 'to me  ·  11:46 PM', 140, 388, 25, 400, GREY);
  ctx.fillStyle = LINE; ctx.fillRect(40, 430, sw - 80, 2);
  let y = 500; const body = (s, size = 34, w = 400, col = '#2a2a34') => { T(ctx, s, 40, y, size, w, col); y += size * 1.55; };
  body('Dear Sam,'); y += 10; body('We are delighted to offer you the'); body('position of'); ctx.save(); T(ctx, 'Assistant Chef', 40, y, 40, 800, '#16161d'); y += 58; ctx.restore(); body('at Lumière.'); y += 24;
  const hl = clamp(o.hl ?? 1); R(ctx, 30, y - 50, (sw - 60) * eOut(hl), 76, 14, '#fff1a8'); R(ctx, 30, y - 50, sw - 60, 76, 14, null, hl > 0.5 ? '#ffd43b' : null, 3);
  T(ctx, '📅  Start date: in 30 days', 52, y, 36, 800, '#16161d'); y += 80;
  body('Welcome to the family.'); body('— Chef Moreau, Lumière', 28, 500, GREY);
  y += 30; R(ctx, 40, y, sw - 80, 86, 43, BLUE); T(ctx, 'Accept offer', sw / 2, y + 56, 32, 700, '#fff', 'center');
  // tiny confetti
  const rr = rng(5); for (let i = 0; i < 18; i++) { const cx = rr() * sw, cy = 200 + ((rr() * 800 + t * 160 * (0.5 + rr())) % 900); ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 3 + i); ctx.fillStyle = ['#ffd43b', '#ff4d4d', '#2f7cf6', '#3aa060'][i % 4]; ctx.globalAlpha = 0.5 * clamp(o.confetti || 0); ctx.fillRect(-6, -10, 12, 20); ctx.restore(); }
  ctx.restore();
}

/* ---------- resume ---------- */
function resume(ctx, sw, sh, o) {
  const hl = clamp(o.hl || 0);
  ctx.fillStyle = '#e9e9ef'; ctx.fillRect(0, 0, sw, sh); statusBar(ctx, sw, false, o.time || '9:12');
  ctx.fillStyle = '#f7f7fa'; ctx.fillRect(0, 110, sw, 90); ctx.fillStyle = LINE; ctx.fillRect(0, 200, sw, 2);
  T(ctx, 'Done', 40, 168, 30, 600, BLUE); T(ctx, 'Sam_Resume_FINAL_v7.pdf', sw / 2 + 20, 168, 26, 600, '#16161d', 'center');
  ctx.save(); ctx.translate(0, -(o.scroll || 0));
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(34, 240, sw - 60, sh); ctx.fillStyle = '#fff'; ctx.fillRect(28, 232, sw - 60, sh);
  const x = 66; let y = 330;
  T(ctx, 'SAM', x, y, 84, 900, '#16161d'); ctx.font = `900 84px ${UI}`; const sx = x + ctx.measureText('SAM').width;
  T(ctx, '— Assistant Chef', sx + 16, y, 34, 600, '#8e2340'); y += 50;
  T(ctx, 'sam.cooks@mail.com  ·  (555) 013-2047', x, y, 22, 400, GREY); y += 34; ctx.fillStyle = '#16161d'; ctx.fillRect(x, y, sw - 140, 4); y += 70;
  T(ctx, 'EXPERIENCE', x, y, 26, 800, '#8e2340'); y += 64;
  const L1 = '10 YEARS OF FINE DINING', L2 = 'EXPERIENCE';
  ctx.font = `900 40px ${UI}`; const w1 = ctx.measureText(L1).width, w2 = ctx.measureText(L2).width; const tot = w1 + w2;
  const h1 = clamp(hl * tot / w1), h2 = clamp((hl * tot - w1) / w2);
  const marker = (mx, my, mw) => { if (mw <= 0) return; ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = '#ffe14a'; ctx.beginPath(); ctx.moveTo(mx - 10, my - 38); ctx.lineTo(mx + mw + 8, my - 42); ctx.lineTo(mx + mw + 12, my + 12); ctx.lineTo(mx - 6, my + 14); ctx.closePath(); ctx.fill(); ctx.restore(); };
  marker(x, y, w1 * h1); T(ctx, L1, x, y, 40, 900); y += 58; marker(x, y, w2 * h2); T(ctx, L2, x, y, 40, 900);
  if (h2 >= 1) { ctx.save(); ctx.strokeStyle = '#ff4d4d'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + w2 + 30, y - 20); ctx.lineTo(x + w2 + 70, y - 34); ctx.stroke(); ctx.restore(); }
  y += 70;
  for (const s of ['• Head of plating, sauces & flambé', '• Trained under “very famous chefs”', '• Michelin-level knife skills']) { T(ctx, s, x, y, 27, 400, '#2a2a34'); y += 46; }
  y += 30; T(ctx, 'SKILLS', x, y, 26, 800, '#8e2340'); y += 30;
  let cx = x; for (const s of ['Sauté', 'Flambé', 'Sous-vide', 'Microwave']) { ctx.font = `600 24px ${UI}`; const w = ctx.measureText(s).width + 36; R(ctx, cx, y, w, 46, 23, s === 'Microwave' ? '#ffe3e3' : '#f0f0f5'); T(ctx, s, cx + 18, y + 31, 24, 600, s === 'Microwave' ? '#c22' : '#2a2a34'); cx += w + 12; }
  y += 110; T(ctx, 'REFERENCES', x, y, 26, 800, '#8e2340'); y += 46; T(ctx, 'Mom (very reliable)', x, y, 27, 400, '#2a2a34');
  ctx.restore();
}

/* ---------- alarm (lock screen + smart-home alert) ---------- */
function alarm(ctx, sw, sh, o) {
  const t = o.t || 0, p = clamp(o.p ?? 1);
  const bands = ['#2b1d55', '#4a2366', '#7a2a6e', '#b7406a', '#e86a4f']; bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, (sh * i) / 5 - 2, sw, sh / 5 + 4); });
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(sw * 0.8, sh * 0.85, 120 + i * 130, 0, 7); ctx.lineWidth = 30; ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.stroke(); }
  statusBar(ctx, sw, true, ''); T(ctx, '🔒', sw / 2, 150, 34, 400, '#fff', 'center');
  T(ctx, 'Wednesday, June 1', sw / 2, 230, 32, 600, 'rgba(255,255,255,0.85)', 'center'); T(ctx, '11:52', sw / 2, 400, 170, 700, '#fff', 'center');
  // red pulse
  const pulse = (t * 1.6) % 1; ctx.save(); ctx.globalAlpha = (1 - pulse) * 0.5 * p; ctx.strokeStyle = '#ff4d4d'; ctx.lineWidth = 10; R(ctx, 30 - pulse * 20, 520 - pulse * 20, sw - 60 + pulse * 40, 230 + pulse * 40, 44 + pulse * 10, null, '#ff4d4d', 8); ctx.restore();
  const y0 = lerp(380, 520, eBack(p)); ctx.save(); ctx.globalAlpha = clamp(p * 3);
  R(ctx, 30, y0, sw - 60, 230, 40, 'rgba(250,246,250,0.94)');
  R(ctx, 58, y0 + 28, 64, 64, 16, '#ff3b30'); // app icon: house + flame
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(90, y0 + 40); ctx.lineTo(112, y0 + 60); ctx.lineTo(106, y0 + 60); ctx.lineTo(106, y0 + 82); ctx.lineTo(74, y0 + 82); ctx.lineTo(74, y0 + 60); ctx.lineTo(68, y0 + 60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff3b30'; ctx.beginPath(); ctx.moveTo(90, y0 + 58); ctx.quadraticCurveTo(102, y0 + 70, 96, y0 + 80); ctx.lineTo(84, y0 + 80); ctx.quadraticCurveTo(78, y0 + 70, 90, y0 + 58); ctx.fill();
  T(ctx, 'HOMEGUARD', 140, y0 + 56, 24, 700, '#6a6a76'); T(ctx, 'now', sw - 64, y0 + 56, 24, 500, '#6a6a76', 'right');
  T(ctx, '⚠️ Smoke detected — Kitchen', 58, y0 + 136, 33, 800, '#16161d');
  T(ctx, 'Alarm sounding. Notifying your', 58, y0 + 180, 27, 400, '#2a2a34'); T(ctx, 'emergency contact: Mom', 58, y0 + 214, 27, 600, '#2a2a34');
  ctx.restore();
  if (o.p2) { const y1 = lerp(700, 790, eBack(clamp(o.p2))); ctx.save(); ctx.globalAlpha = clamp(o.p2 * 3); R(ctx, 30, y1, sw - 60, 150, 40, 'rgba(250,246,250,0.9)'); R(ctx, 58, y1 + 28, 64, 64, 16, '#3aa060'); T(ctx, '💬', 90, y1 + 74, 32, 400, '#fff', 'center'); T(ctx, 'MESSAGES', 140, y1 + 56, 24, 700, '#6a6a76'); T(ctx, 'now', sw - 64, y1 + 56, 24, 500, '#6a6a76', 'right'); T(ctx, 'Mom: why is your SMOKE ALARM…', 58, y1 + 118, 28, 600, '#16161d'); ctx.restore(); }
  R(ctx, sw / 2 - 120, sh - 40, 240, 10, 5, 'rgba(255,255,255,0.8)');
}

/* ---------- texts (thread with Mom) ---------- */
export const MOM_MSGS = ['why is your SMOKE ALARM texting me??', 'SAM.', 'are you cooking?? 😳'];
function texts(ctx, sw, sh, o) {
  const n = o.n || 0, t = o.t || 0;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, sh); statusBar(ctx, sw, false, o.time || '11:53');
  ctx.fillStyle = '#f7f7fa'; ctx.fillRect(0, 110, sw, 150); ctx.fillStyle = LINE; ctx.fillRect(0, 260, sw, 2);
  T(ctx, '‹', 40, 210, 60, 400, BLUE); avatar(ctx, 140, 186, 44, '#d96aa0', 'M'); T(ctx, 'Mom ❤️', 202, 180, 34, 800); T(ctx, 'Active now', 202, 220, 24, 500, '#2fa75a');
  T(ctx, '📞', sw - 60, 200, 40, 400, BLUE, 'right');
  let y = 316; T(ctx, 'Today 11:53 PM', sw / 2, y, 22, 500, GREY, 'center'); y += 34;
  // earlier outgoing bubble (context)
  const bub = (s, mine, k, big) => {
    const size = big ? 58 : 41, lines = wrap(ctx, s, 520, size, big ? 800 : 500); ctx.font = `${big ? 800 : 500} ${size}px ${UI}`;
    const bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 56, bh = lines.length * size * 1.3 + 36;
    const bx = mine ? sw - 30 - bw : 30; const sc = 0.4 + 0.6 * eBack(k);
    ctx.save(); ctx.translate(mine ? bx + bw : bx, y + bh); ctx.scale(sc, sc); ctx.globalAlpha = clamp(k * 4); ctx.translate(-(mine ? bx + bw : bx), -(y + bh));
    R(ctx, bx, y, bw, bh, 40, mine ? BLUE : '#ececf1');
    lines.forEach((l, i) => T(ctx, l, bx + 28, y + 18 + size * 1.02 + i * size * 1.3, size, big ? 800 : 500, mine ? '#fff' : '#16161d'));
    ctx.restore(); y += bh + 14;
  };
  bub('big news tmrw 👀', true, 1); T(ctx, 'Read 7:02 PM', sw - 40, y + 4, 20, 500, GREY, 'right'); y += 30;
  MOM_MSGS.forEach((m, i) => { const k = clamp(n - i); if (k > 0) bub(m, false, k, i === 1); });
  if (o.typing) { const bx = 30, by = y; R(ctx, bx, by, 160, 90, 45, '#ececf1'); for (let i = 0; i < 3; i++) { const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 8 - i * 0.9)); C(ctx, bx + 44 + i * 36, by + 45 - a * 8, 13, `rgba(110,110,125,${a})`); } }
  ctx.fillStyle = '#fff'; ctx.fillRect(0, sh - 130, sw, 130); R(ctx, 30, sh - 110, sw - 140, 70, 35, null, '#d6d6de', 3); T(ctx, 'Message', 64, sh - 64, 28, 400, GREY); C(ctx, sw - 60, sh - 75, 34, '#d6d6de'); T(ctx, '↑', sw - 60, sh - 62, 38, 800, '#fff', 'center');
}

/* ---------- calendar ---------- */
function calendar(ctx, sw, sh, o) {
  const p = clamp(o.p ?? 1), t = o.t || 0;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, sh); statusBar(ctx, sw, false, o.time || '8:00');
  T(ctx, '‹ 2027', 40, 165, 30, 500, '#ff3b30'); T(ctx, 'June', 40, 250, 70, 800);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'], cw = (sw - 60) / 7, x0 = 30, y0 = 320;
  days.forEach((d, i) => T(ctx, d, x0 + cw * i + cw / 2, y0, 24, 600, GREY, 'center')); ctx.fillStyle = LINE; ctx.fillRect(30, y0 + 20, sw - 60, 2);
  const off = 2; // June 1 is a Wednesday
  for (let d = 1; d <= 30; d++) { const k = d - 1 + off, cx = x0 + cw * (k % 7) + cw / 2, cy = y0 + 90 + Math.floor(k / 7) * 110;
    if (d === 30) { C(ctx, cx, cy - 10, 38, '#16161d'); T(ctx, '30', cx, cy + 2, 32, 800, '#ffd43b', 'center'); T(ctx, '👨‍🍳', cx, cy + 62, 26, 400, '#000', 'center'); continue; }
    T(ctx, String(d), cx, cy + 2, 32, d === 1 ? 800 : 500, d === 1 ? '#ff3b30' : '#16161d', 'center');
    if (d === 1) { ctx.save(); ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); const a0 = -2.2; ctx.ellipse(cx, cy - 10, 46, 40, -0.2, a0, a0 + Math.PI * 2.15 * eOut(p)); ctx.stroke(); ctx.restore(); }
  }
  const y1 = y0 + 90 + 5 * 110 + 30; ctx.fillStyle = LINE; ctx.fillRect(30, y1 - 40, sw - 60, 2);
  R(ctx, 30, y1, sw - 60, 110, 22, '#fff4e0'); R(ctx, 30, y1, 12, 110, 6, '#ff8a3c'); T(ctx, 'Jun 30 · 6:00 AM', 64, y1 + 44, 24, 600, '#b8641f'); T(ctx, 'First shift at Lumière 😬', 64, y1 + 86, 30, 800, '#16161d');
  const k2 = clamp(o.pill ?? 1); if (k2 > 0) { const s = 0.5 + 0.5 * eBack(k2); ctx.save(); ctx.translate(sw / 2, y1 + 220); ctx.scale(s, s); R(ctx, -230, -50, 460, 100, 50, '#ff3b30'); T(ctx, '⏳ 29 days left', 0, 16, 44, 800, '#fff', 'center'); ctx.restore(); }
}

const STATES = { email, resume, alarm, texts, calendar };
// phone: {x,y,w,h,state,t, rot, glow, ...state params}
export function drawPhone(ctx, o) {
  const w = o.w || 780, k = w / 780, hh = (o.h || 1240) / k;
  ctx.save(); ctx.translate(o.x, o.y); if (o.rot) { ctx.translate(w / 2, o.h / 2); ctx.rotate(o.rot); ctx.translate(-w / 2, -o.h / 2); } ctx.scale(k, k);
  // shadow + body + side buttons
  ctx.fillStyle = 'rgba(10,6,25,0.35)'; ctx.beginPath(); rrPath(ctx, 18, 26, 780, hh, 112); ctx.fill();
  ctx.fillStyle = '#2a2836'; ctx.fillRect(-8, 230, 12, 90); ctx.fillRect(-8, 340, 12, 90); ctx.fillRect(776, 280, 12, 140);
  ctx.beginPath(); rrPath(ctx, 0, 0, 780, hh, 112); ctx.fillStyle = '#121118'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); rrPath(ctx, 6, 6, 768, hh - 12, 106); ctx.strokeStyle = '#3a3846'; ctx.lineWidth = 3; ctx.stroke();
  const sx = 22, sy = 22, sw = 736, sh = hh - 44;
  ctx.save(); ctx.translate(sx, sy); ctx.beginPath(); rrPath(ctx, 0, 0, sw, sh, 92); ctx.clip();
  (STATES[o.state] || email)(ctx, sw, sh, o);
  // glass sheen
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.moveTo(sw * 0.55, 0); ctx.lineTo(sw, 0); ctx.lineTo(sw, sh * 0.3); ctx.closePath(); ctx.fill();
  ctx.restore();
  // dynamic island
  ctx.beginPath(); rrPath(ctx, 390 - 105, 44, 210, 60, 30); ctx.fillStyle = '#050508'; ctx.fill(); C(ctx, 390 + 70, 74, 10, '#1a1a2a');
  if (o.thumb) drawThumb(ctx, o.thumb[0] / k, o.thumb[1] / k, o.thumbPress || 0);
  ctx.restore();
}
export function drawThumb(ctx, x, y, press = 0) { // cartoon thumb pointing up-left at (x,y) in phone space
  ctx.save(); ctx.translate(x, y + press * 10); ctx.rotate(-0.35);
  ctx.beginPath(); ctx.moveTo(-50, 30); ctx.quadraticCurveTo(-56, -40, 0, -46); ctx.quadraticCurveTo(56, -40, 52, 30); ctx.lineTo(70, 700); ctx.lineTo(-90, 700); ctx.closePath();
  ctx.fillStyle = '#f2b48a'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.beginPath(); rrPath(ctx, -26, -34, 52, 50, 18); ctx.fillStyle = '#fbe1cf'; ctx.fill(); ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#dc946a'; ctx.fillRect(20, 60, 24, 600);
  ctx.restore();
}
