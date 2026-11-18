// Burned-in captions from words.json: 1–3 word chunks, Anton uppercase, key words coloured, pop-in.
import { W, H, FPS, INK, clamp, eBack, hash } from './util.js';
import { spring } from './camera.js';

const YELLOW = '#ffd43b', RED = '#ff4d4d';
let KEY_Y = new Set(['LUMIÈRE', "CAN'T", 'COOK', '10', 'YEARS', 'MICROWAVING', 'LID', 'ONE', '30', '29', 'WATER', 'MOM', 'BRO', 'CHEF']);
let KEY_R = new Set(['EXPLODED', 'SMOKE']);
const FIX = { LUMIERE: 'LUMIÈRE', 'LUMIÈRE': 'LUMIÈRE', RESUME: 'RÉSUMÉ', 'RÉSUMÉ': 'RÉSUMÉ' };
// quoted dialogue ranges (frames) — captions get “ ” like the reference
let QUOTES = [[676, 712], [1140, 1178], [1209, 1245]];
export const CAP_Y = Math.round(H * 0.72);
export const SAFE_Y = Math.round(H * 0.78); // bottom ~22% is covered by Instagram UI: keep key action above this
let CHUNKS = [];

function clean(w) { // display form of a word
  let u = w.toUpperCase().replace(/,$/, '');
  const core = u.replace(/[.,?!…]+$/, ''), tail = u.slice(core.length);
  return (FIX[core] || core) + tail;
}
// cfg (optional, from story.CAPCONF): { file:'words_v2.json', keyY:[...], keyR:[...], quotes:[[a,b],...], fix:{RAW:'DISPLAY'} }
export async function loadCaptions(cfg = {}) {
  if (cfg.keyY) KEY_Y = new Set(cfg.keyY); if (cfg.keyR) KEY_R = new Set(cfg.keyR); if (cfg.quotes) QUOTES = cfg.quotes; if (cfg.fix) Object.assign(FIX, cfg.fix);
  const words = await (await fetch(cfg.file || 'words.json')).json();
  const ws = words.map((w) => ({ ...w, d: clean(w.w), raw: w.w }));
  const chunks = []; let cur = [];
  const flush = () => { if (cur.length) chunks.push(cur); cur = []; };
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i], prev = cur[cur.length - 1];
    const len = cur.reduce((n, x) => n + x.d.length + 1, 0) + w.d.length;
    const inQ = (f) => QUOTES.findIndex(([a, b]) => f >= a && f < b);
    if (prev && (cur.length >= 3 || (/^[A-Z]/.test(w.raw) && !/^I'm$/.test(w.raw) && !/^[A-Z]/.test(prev.raw)) || /[.,?!]$/.test(prev.raw) || w.s - prev.e > 0.35 || len > 15 || inQ(prev.s * FPS) !== inQ(w.s * FPS))) flush();
    cur.push(w);
  }
  flush();
  CHUNKS = chunks.map((c, i) => {
    const a = Math.round(c[0].s * FPS); const nx = chunks[i + 1]; const endW = c[c.length - 1].e;
    let b = nx ? Math.round(nx[0].s * FPS) : Math.round(endW * FPS) + 18;
    if (nx && nx[0].s - endW > 0.7) b = Math.round((endW + 0.4) * FPS);
    const words = c.map((w) => ({ d: w.d, key: w.d.replace(/[.,?!…“”"]/g, ''), f: Math.max(a, Math.round(w.s * FPS)) }));
    const q = QUOTES.findIndex(([qa, qb]) => a >= qa && a < qb);
    if (q >= 0) {
      const [qa, qb] = QUOTES[q]; const prevC = chunks[i - 1], nextC = chunks[i + 1];
      if (!prevC || Math.round(prevC[0].s * FPS) < qa) words[0].d = '“' + words[0].d;
      if (!nextC || Math.round(nextC[0].s * FPS) >= qb) words[words.length - 1].d += '”';
    }
    return { a, b, words };
  });
}
export function chunkAt(f) { return CHUNKS.find((c) => f >= c.a && f < c.b); }
export function drawCaptions(ctx, f) {
  const c = chunkAt(f); if (!c || c.a === 0) return; // 'DAY 1' is already the title card
  let size = 112; ctx.font = `${size}px Anton`;
  const gap = size * 0.22; const ws = c.words.map((w) => ctx.measureText(w.d).width);
  let tw = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
  const k = Math.min(1, 930 / tw);
  ctx.save(); ctx.translate(W / 2, CAP_Y); ctx.scale(k, k);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  let x = -tw / 2;
  c.words.forEach((w, i) => {
    const lf = f - w.f, cx = x + ws[i] / 2; x += ws[i] + gap; if (lf < 0) return;   // each word pops when it is spoken
    const red = KEY_R.has(w.key), col = red ? RED : KEY_Y.has(w.key) ? YELLOW : '#ffffff';
    const e = spring(lf / 7, KEY_R.has(w.key) || KEY_Y.has(w.key) ? 0.22 : 0.14), sc = 0.35 + 0.65 * e, dy = (1 - Math.min(1, e)) * 26;
    let jx = 0, jy = 0, rot = 0; if (red) { const d = Math.max(0.15, 1 - lf / 12); jx = (hash(f * 1.7 + i) - 0.5) * 12 * d; jy = (hash(f * 2.3 + i + 5) - 0.5) * 10 * d; rot = (hash(f * 3.1 + i) - 0.5) * 0.08 * d; }
    ctx.save(); ctx.translate(cx + jx, dy + jy); ctx.rotate(rot); ctx.scale(sc, sc);
    ctx.fillStyle = 'rgba(12,6,28,0.55)'; ctx.fillText(w.d, 4, 9); // drop shadow
    ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.strokeText(w.d, 0, 0);
    ctx.fillStyle = col; ctx.fillText(w.d, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}
export function captionList() { return CHUNKS.map((c) => `${c.a}-${c.b} ${c.words.map((w) => w.d).join(' ')}`); }
