// Ep7 phone screens, registered into phone.js STATES (all usernames / app names invented):
// 'recipe7'  Loopr comments under Sam's Day 6 post: @alfredo.angel_20's full "Chicken Alfredo for 20 people" recipe (scroll + line highlights)
// 'chef7'    the head chef thread: yesterday's "P.S. The owner is coming." → typing → "The owner wants to meet you."
import { clamp, eOut, eBack, lerp, rrPath } from './util.js';
import { STATES } from './phone.js';

const UI = '"Inter", "Noto Color Emoji", sans-serif';
const BLUE = '#2f7cf6', GREY = '#8a8a96', LINE = '#e7e7ee', PURP = '#7a3cff';
export const RECIPE_USER = 'alfredo.angel_20';
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
function typingDots(ctx, x, y, t) { R(ctx, x, y, 160, 90, 45, '#ececf1'); for (let i = 0; i < 3; i++) { const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 8 - i * 0.9)); C(ctx, x + 44 + i * 36, y + 45, 12, `rgba(120,120,135,${a})`); } }

/* ---------- the recipe comment (text exactly as the viewer posted it) ---------- */
// [text, style, id]   styles: t title, h heading, l line, i indented line
const RECIPE = [
  ['Chicken Alfredo for 20 people 🍝', 't'],
  ['🛒 INGREDIENTS', 'h'],
  ['Chicken: 3 kg chicken breast, paprika, garlic powder, salt and pepper, olive oil', 'l'],
  ['Pasta: 2 kg fettuccine', 'l'],
  ['Alfredo sauce:', 'l'],
  ['• 500 g butter', 'i'],
  ['• 30 garlic cloves', 'i', 'garlic'],
  ['• 2 L heavy cream', 'i'],
  ['• 600 g parmesan', 'i'],
  ['• pasta water', 'i'],
  ['Garnish: parsley', 'l'],
  ['👩‍🍳 STEPS', 'h'],
  ['1. Season the chicken.', 'l'],
  ['2. Cook it in batches to 74°C, then let it rest.', 'l', 'chicken'],
  ['3. Boil the pasta 10–12 min. Save some pasta water.', 'l'],
  ['4. Melt the butter on low heat.', 'l', 'butter'],
  ['Add garlic for 30–45 s, then the cream, then the parmesan gradually.', 'i'],
  ['5. Combine.', 'l'],
  ['💡 TIPS', 'h'],
  ['• Cook chicken in batches', 'i'],
  ['• Keep sauce on low heat', 'i'],
  ["• Don't add all the pasta water at once", 'i', 'water'],
  ['• Keep hot food at 60°C or above', 'i'],
];
// o.scroll (px), o.hi {id: 0..1}, o.heart 0..1, o.p (comment pop-in)
function recipe7(ctx, sw, sh, o) {
  const t = o.t || 0, hi = o.hi || {};
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, sh);
  ctx.save(); ctx.translate(0, -(o.scroll || 0));
  let y = 330;
  const bx = 132, maxW = sw - bx - 40;
  const k = clamp(o.p ?? 1);
  pop(ctx, k, 40, 330, () => {
    // avatar + name
    C(ctx, 76, y + 10, 40, '#ffb84a'); T(ctx, '🍝', 76, y + 24, 40, 400, '#000', 'center');
    T(ctx, RECIPE_USER, bx, y, 28, 800); const uw = (ctx.font = `800 28px ${UI}`, ctx.measureText(RECIPE_USER).width); T(ctx, '1h', bx + uw + 14, y, 24, 500, GREY);
    T(ctx, 'replying to @sam.cooks.fr', bx, y + 36, 22, 600, PURP);
    y += 92;
    for (const [s, st, id] of RECIPE) {
      const size = st === 't' ? 32 : st === 'h' ? 24 : 26, weight = st === 't' ? 800 : st === 'h' ? 800 : 500, lh = st === 't' ? 44 : 38;
      if (st === 'h') y += 16;
      const ix = st === 'i' ? 22 : 0;
      ctx.font = `${weight} ${size}px ${UI}`; const lines = wrap(ctx, s, maxW - ix);
      const h = id ? clamp(hi[id] || 0) : 0;
      if (h > 0) { const ww = Math.max(...lines.map((l) => ctx.measureText(l).width)); R(ctx, bx + ix - 10, y - size - 4, (ww + 20) * eOut(h), lines.length * lh + 6, 10, id === 'water' ? 'rgba(255,77,77,0.4)' : 'rgba(255,212,59,0.85)'); }
      lines.forEach((l, i) => T(ctx, l, bx + ix, y + i * lh, size, h > 0.5 ? 800 : weight, st === 'h' ? '#b8641f' : '#16161d'));
      y += lines.length * lh + (st === 't' ? 8 : 0);
    }
    y += 20; T(ctx, 'Reply', bx, y, 24, 700, GREY); T(ctx, 'See translation', bx + 100, y, 24, 700, GREY);
    // heart
    const hk = clamp(o.heart || 0), hs = 1 + 0.4 * Math.sin(Math.min(1, hk) * Math.PI);
    ctx.save(); ctx.translate(sw - 46, 360); ctx.scale(hs, hs); T(ctx, hk > 0.3 ? '❤️' : '♡', 0, 0, 40, 400, hk > 0.3 ? '#e2463f' : GREY, 'center'); ctx.restore();
    T(ctx, hk > 0.3 ? '8,214' : '8,213', sw - 46, 400, 18, 700, GREY, 'center');
  });
  ctx.restore();
  // header (fixed)
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, 290); statusBar(ctx, sw, false, o.time || '10:02');
  T(ctx, 'Comments', sw / 2, 168, 34, 800, '#16161d', 'center'); T(ctx, '✕', sw - 50, 168, 32, 600, GREY, 'right');
  R(ctx, 30, 196, sw - 60, 78, 20, '#f4f4f7'); R(ctx, 42, 206, 58, 58, 12, '#e2a648'); T(ctx, '🧱', 71, 248, 34, 400, '#000', 'center');
  T(ctx, 'sam.cooks.fr · Day 6 of 30', 116, 230, 22, 800); T(ctx, 'the noodle brick… it\'s rustic', 116, 260, 20, 500, GREY);
  ctx.fillStyle = LINE; ctx.fillRect(0, 288, sw, 2);
  // input bar
  const ib = sh - 120; ctx.fillStyle = '#fff'; ctx.fillRect(0, ib, sw, 120); ctx.fillStyle = LINE; ctx.fillRect(0, ib, sw, 2);
  C(ctx, 70, ib + 58, 32, '#f2b52b'); T(ctx, 'S', 70, ib + 70, 32, 800, '#fff', 'center');
  R(ctx, 120, ib + 24, sw - 160, 68, 34, null, '#d6d6de', 3); T(ctx, 'Add a comment…', 150, ib + 68, 26, 400, GREY);
}

/* ---------- head chef thread ---------- */
// o.mine (Sam's yesterday reply), o.typing, o.n (new message 0..1), o.hi (highlight on "meet you")
function chef7(ctx, sw, sh, o) {
  const t = o.t || 0;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, sh);
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
  T(ctx, 'Yesterday 9:58 PM', sw / 2, y, 22, 500, GREY, 'center'); y += 34;
  bub('P.S. The owner is coming.', false, 1, 40, 700);
  bub('no problem chef 😎', true, 1, 40);
  y += 20; T(ctx, 'Today 1:14 PM', sw / 2, y, 22, 500, GREY, 'center'); y += 34;
  if (o.n > 0) bub('The owner wants to meet you.', false, clamp(o.n), 60, 800, 'meet you.', o.hi || 0);
  else if (o.typing) typingDots(ctx, 30, y + 6, t);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, 110); statusBar(ctx, sw, false, o.time || '1:14');
  ctx.fillStyle = '#f7f7fa'; ctx.fillRect(0, 110, sw, 150); ctx.fillStyle = LINE; ctx.fillRect(0, 260, sw, 2);
  T(ctx, '‹', 40, 210, 60, 400, BLUE); C(ctx, 140, 186, 44, '#1d1a2e'); ctx.strokeStyle = '#e6b84a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(140, 186, 44, 0, 7); ctx.stroke(); T(ctx, '👨‍🍳', 140, 202, 44, 400, '#000', 'center');
  T(ctx, 'Head Chef', 202, 180, 34, 800); T(ctx, 'Lumière', 202, 220, 24, 500, '#b08a2e');
  const ib = sh - 130; ctx.fillStyle = '#fff'; ctx.fillRect(0, ib, sw, 130); R(ctx, 30, ib + 20, sw - 140, 70, 35, null, '#d6d6de', 3); T(ctx, 'Message', 64, ib + 66, 28, 400, GREY);
  C(ctx, sw - 60, ib + 55, 34, '#d6d6de'); T(ctx, '↑', sw - 60, ib + 68, 38, 800, '#fff', 'center');
}
Object.assign(STATES, { recipe7, chef7 });
