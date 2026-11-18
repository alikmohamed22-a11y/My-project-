// fc_sets.js [FC-sets]: sets for "Fortune cookies aren't Chinese" (tsujiura senbei, Japanese-American bakers, the 1983 mock trial). Oddverra short.
//   kyoto  : a Meiji-era senbei shop open to a Kyoto street: noren, paper lanterns, lattice fronts, a charcoal grill with long-handled
//            round irons, trays of folded crackers, a TSUJIURA SENBEI sign, a torii up the street. The hero cookie (face, slip) sits on
//            the counter. Moods 'kyotoNight' (hook, lanterns), 'kyoto' (1878 warm day), 'kyotoToday' (present day), 'kyotoDawn' (payoff).
//                                                                                                                   origin (-130000,0,0)
//   garden : a Japanese tea garden (San Francisco, early 1900s): pond, arched drum bridge, tea house with tables, stone lanterns,
//            maples, a pagoda; gate sign JAPANESE TEA GARDEN. Mood 'garden'.                                         (-130000,0,800)
//   court  : the 1983 mock Court of Historical Review: wood panels, judge's bench, S.F. and L.A. tables, the cookie on an evidence
//            stand, a TV camera on a tripod. Mood 'court'.                                                            (-130000,0,1600)
//   study  : a researcher's study at night: desk with the open 1878 book (woodblock illustration), bookshelves, a big Pacific wall map
//            (JAPAN / CHINA / CALIFORNIA) with a toy steamship and a crate that comes back stamped. Moods 'study', 'studyMap'. (-132500,0,0)
//   bakery : a California bakery in three eras: 'bakeryJP' (Japanese-American, 1910s), 'bakeryClosed' (1942: shutters, CLOSED sign),
//            'bakeryCN' (1950s Chinese-American: FORTUNE COOKIES window, a conveyor of cookies).                     (-132500,0,800)
// Each set: local frame, camera side +z. Test flag ?fcview=N (main.js).
import { H, TAU, clamp01, sm, SERIF, SANS, cyl, sph, plane, planeUV, mesh, nond, lumpGeo, txt, grain, scrib, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';

export const FC_ORIGIN = { kyoto: [-130000, 0, 0], garden: [-130000, 0, 800], court: [-130000, 0, 1600], study: [-132500, 0, 0], bakery: [-132500, 0, 800] };
const GROUP_OF = { kyotoNight: 'kyoto', kyoto: 'kyoto', kyotoToday: 'kyoto', kyotoDawn: 'kyoto', garden: 'garden', court: 'court', study: 'study', studyMap: 'study', bakeryJP: 'bakery', bakeryClosed: 'bakery', bakeryCN: 'bakery' };
let THREE, PT, M;
const INK = '#2b1d4a';

// ---------------------------------------------------------------- painters
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 6, 2, 3, 7)); g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08);
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : 0.32 + i * 0.38), w * 0.86, h * (lines.length === 1 ? 0.5 : 0.3), { col: o.col || '#3a2414', font: o.font || SERIF })); }; }
function norenTex(col, crest) { return (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.18 * PT.fbm(u, v, 3, 8, 3, 5));
  g.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 1; i < 3; i++) g.fillRect(w * i / 3 - 2, h * 0.18, 4, h); // panel slits drawn as shade
  g.strokeStyle = '#f4ecd8'; g.lineWidth = w * 0.02; g.beginPath(); g.arc(w / 2, h * 0.45, h * 0.2, 0, TAU); g.stroke(); // plain circle crest (no real mark)
  if (crest) { g.fillStyle = '#f4ecd8'; g.beginPath(); g.ellipse(w / 2, h * 0.45, h * 0.1, h * 0.06, 0.3, 0, TAU); g.fill(); } }; }
function lanternTex(g, w, h) { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#c83a2a'); gr.addColorStop(0.5, '#ff6a4a'); gr.addColorStop(1, '#c83a2a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(80,20,10,0.5)'; g.lineWidth = 2; for (let y = 8; y < h; y += 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.fillStyle = '#2a1a14'; g.fillRect(0, 0, w, h * 0.08); g.fillRect(0, h * 0.92, w, h * 0.08); }
// the 1878 woodblock illustration: a baker at a grill with long-handled irons, crackers on a tray, columns of (illegible) script
function bookTex(g, w, h) { g.fillStyle = '#ead8b0'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.84 + 0.2 * PT.fbm(u, v, 5, 5, 3, 11));
  const ink = 'rgba(40,30,30,0.9)', R = PT.rng(1878); g.strokeStyle = ink; g.fillStyle = ink; g.lineCap = 'round';
  g.fillStyle = 'rgba(120,40,30,0.18)'; g.fillRect(w * 0.52, 0, w * 0.48, h); g.fillStyle = ink; // right page tint
  g.fillStyle = 'rgba(60,40,30,0.5)'; g.fillRect(w * 0.495, 0, w * 0.01, h); g.fillStyle = ink;
  // left page: vertical script columns (scribbles)
  for (let c = 0; c < 6; c++) { const x = w * (0.44 - c * 0.07); for (let y = h * 0.08; y < h * 0.9; y += h * 0.05) { g.lineWidth = 3; g.beginPath(); g.moveTo(x - 8 + R() * 6, y); g.lineTo(x + 8 - R() * 6, y + h * 0.015); g.moveTo(x, y + h * 0.005); g.lineTo(x + (R() - 0.5) * 10, y + h * 0.035); g.stroke(); } }
  // right page: the picture in a frame
  const X = w * 0.55, Y = h * 0.08, W = w * 0.4, Hh = h * 0.84; g.lineWidth = 5; g.strokeRect(X, Y, W, Hh); g.save(); g.beginPath(); g.rect(X, Y, W, Hh); g.clip();
  g.lineWidth = 4; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(X, Y + Hh * (0.12 + i * 0.03)); g.lineTo(X + W, Y + Hh * (0.1 + i * 0.03)); g.stroke(); } // roof lines
  g.fillStyle = 'rgba(30,40,80,0.55)'; g.fillRect(X + W * 0.05, Y + Hh * 0.3, W * 0.25, Hh * 0.25); g.fillStyle = ink; // noren
  // baker: kneeling figure (head, body, arm to the iron)
  g.beginPath(); g.arc(X + W * 0.5, Y + Hh * 0.45, W * 0.06, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(X + W * 0.5, Y + Hh * 0.5); g.quadraticCurveTo(X + W * 0.36, Y + Hh * 0.62, X + W * 0.42, Y + Hh * 0.8); g.lineTo(X + W * 0.66, Y + Hh * 0.8); g.quadraticCurveTo(X + W * 0.64, Y + Hh * 0.6, X + W * 0.5, Y + Hh * 0.5); g.stroke();
  g.fillStyle = 'rgba(30,40,80,0.55)'; g.fill(); g.fillStyle = ink; g.beginPath(); g.moveTo(X + W * 0.55, Y + Hh * 0.58); g.lineTo(X + W * 0.78, Y + Hh * 0.66); g.stroke();
  // grill + two long irons with round plates
  g.strokeRect(X + W * 0.68, Y + Hh * 0.7, W * 0.26, Hh * 0.1); for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(X + W * (0.71 + i * 0.03), Y + Hh * 0.74, 3, 0, TAU); g.fillStyle = 'rgba(200,60,30,0.7)'; g.fill(); } g.fillStyle = ink;
  for (const dx of [0, 0.08]) { g.beginPath(); g.moveTo(X + W * (0.5 + dx), Y + Hh * 0.64); g.lineTo(X + W * (0.8 + dx), Y + Hh * 0.69); g.stroke(); g.beginPath(); g.ellipse(X + W * (0.82 + dx), Y + Hh * 0.69, W * 0.04, Hh * 0.012, 0, 0, TAU); g.stroke(); }
  // tray of folded crackers
  g.strokeRect(X + W * 0.12, Y + Hh * 0.82, W * 0.3, Hh * 0.05); for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(X + W * (0.16 + i * 0.07), Y + Hh * 0.82, W * 0.025, Math.PI, 0); g.stroke(); }
  g.restore(); txt(g, '1878', X + W * 0.8, Y + Hh * 0.06, W * 0.3, h * 0.045, { col: 'rgba(150,40,30,0.9)', font: SERIF });
  g.fillStyle = 'rgba(160,40,30,0.85)'; g.fillRect(X + W * 0.86, Y + Hh * 0.88, W * 0.08, W * 0.08); // seal
  grain(g, w, h, 'rgba(90,60,30,1)', 1600, 7, 0.25); }
function mapTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8ac8d0'); gr.addColorStop(1, '#5aa0b8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.88 + 0.16 * PT.fbm(u, v, 5, 3, 3, 4));
  g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 2; for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(w * i / 8, 0); g.lineTo(w * i / 8, h); g.stroke(); } for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(0, h * i / 5); g.lineTo(w, h * i / 5); g.stroke(); }
  const land = (pts, col) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x * w, y * h) : g.moveTo(x * w, y * h))); g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 5; g.strokeStyle = '#3a2a3a'; g.stroke(); };
  land([[0, 0.05], [0.2, 0.08], [0.24, 0.22], [0.22, 0.4], [0.19, 0.55], [0.13, 0.7], [0.06, 0.78], [0, 0.82]], '#e8c890'); // China / mainland Asia
  land([[0.27, 0.2], [0.3, 0.24], [0.31, 0.34], [0.29, 0.44], [0.26, 0.48], [0.255, 0.42], [0.28, 0.33], [0.265, 0.25]], '#f0a890'); // Japan
  land([[1, 0.02], [0.82, 0.06], [0.8, 0.2], [0.83, 0.36], [0.86, 0.48], [0.9, 0.58], [0.96, 0.64], [1, 0.66]], '#c8d890'); // North America
  txt(g, 'CHINA', w * 0.1, h * 0.36, w * 0.16, h * 0.06, { col: '#5a3a2a', font: SERIF }); txt(g, 'JAPAN', w * 0.33, h * 0.16, w * 0.12, h * 0.05, { col: '#7a2a2a', font: SERIF });
  txt(g, 'CALIFORNIA', w * 0.88, h * 0.44, w * 0.14, h * 0.045, { col: '#3a5a2a', font: SERIF }); txt(g, 'PACIFIC OCEAN', w * 0.56, h * 0.62, w * 0.3, h * 0.06, { col: 'rgba(255,255,255,0.75)', font: SERIF, italic: true });
  g.setLineDash([16, 12]); g.strokeStyle = '#c82a2a'; g.lineWidth = 6; g.beginPath(); g.moveTo(w * 0.31, h * 0.36); g.bezierCurveTo(w * 0.45, h * 0.24, w * 0.7, h * 0.24, w * 0.84, h * 0.4); g.stroke(); g.setLineDash([]);
  g.strokeStyle = '#5a3a24'; g.lineWidth = w * 0.012; g.strokeRect(0, 0, w, h); }
function woodPanelTex(base) { return (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const n = 4; for (let i = 0; i < n; i++) { const x = w * i / n; g.strokeStyle = 'rgba(30,15,10,0.5)'; g.lineWidth = 6; g.strokeRect(x + 14, 14, w / n - 28, h - 28); g.strokeStyle = 'rgba(255,220,180,0.18)'; g.lineWidth = 3; g.strokeRect(x + 22, 22, w / n - 44, h - 44); }
  PT.modulate(g, w, h, (u, v) => 0.85 + 0.25 * PT.fbm(u, v, 3, 16, 3, 13)); }; }
function shojiTex(g, w, h) { g.fillStyle = '#f4ead4'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 6, 6, 3, 3)); g.strokeStyle = '#6a4a30'; g.lineWidth = 6; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(w * i / 4, 0); g.lineTo(w * i / 4, h); g.stroke(); } for (let i = 0; i <= 6; i++) { g.beginPath(); g.moveTo(0, h * i / 6); g.lineTo(w, h * i / 6); g.stroke(); } }
function latticeTex(g, w, h) { g.fillStyle = '#3a2418'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a4a2a'; for (let x = 0; x < w; x += 14) g.fillRect(x, 0, 8, h); PT.modulate(g, w, h, (u, v) => 0.85 + 0.2 * PT.fbm(u, v, 4, 12, 3, 9)); }
function tatamiTex(g, w, h) { g.fillStyle = '#c8b878'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(90,80,40,0.25)'; g.lineWidth = 1.5; for (let y = 0; y < h; y += 5) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.fillStyle = '#3a4a3a'; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 10, w, 10); PT.modulate(g, w, h, (u, v) => 0.9 + 0.14 * PT.fbm(u, v, 4, 4, 3, 2)); }
function slipTex(lines) { return (g, w, h) => { g.fillStyle = '#fbf6ea'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c84a4a'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12);
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : 0.36 + i * 0.32), w * 0.88, h * (lines.length === 1 ? 0.52 : 0.3), { col: '#3a2a4a', font: SANS })); }; }
function boxLabelTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#c89a5a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.18 * PT.fbm(u, v, 6, 6, 3, 21));
  lines.forEach((s, i) => txt(g, s, w / 2, h * (0.3 + i * 0.36), w * 0.84, h * 0.26, { col: o.col || '#3a2414', font: SANS })); }; }
function plaqueTex(g, w, h) { g.fillStyle = '#4a2a1a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.85 + 0.2 * PT.fbm(u, v, 3, 12, 3, 5)); g.strokeStyle = '#d8b060'; g.lineWidth = h * 0.05; g.strokeRect(h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12);
  txt(g, 'COURT OF HISTORICAL REVIEW', w / 2, h * 0.38, w * 0.86, h * 0.26, { col: '#f0d890', font: SERIF }); txt(g, 'SAN FRANCISCO  ·  1983', w / 2, h * 0.7, w * 0.6, h * 0.2, { col: '#f0d890', font: SERIF, bold: false }); }
// hero cookie face (bean eyes with the ringed-planet shine, blush, small mouth): expressions
function faceTex(expr) { return (g, w, h) => { g.clearRect(0, 0, w, h); const cx = w / 2, cy = h * 0.52, ink = INK;
  const eye = (x, closed) => { if (closed) { g.strokeStyle = ink; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.arc(x, cy, 16, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); return; }
    const big = expr === 'shock'; g.fillStyle = ink; g.beginPath(); g.ellipse(x, cy, big ? 17 : 13, big ? 24 : 21, 0, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x + 4, cy - 8, 4.5, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x + 4, cy - 8, 8, 2.4, -0.4, 0, TAU); g.stroke();
    if (expr === 'smug') { g.fillStyle = '#e0a050'; g.fillRect(x - 18, cy - 28, 36, 16); g.strokeStyle = ink; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 16, cy - 12); g.lineTo(x + 16, cy - 12); g.stroke(); } };
  const closed = expr === 'happy'; eye(cx - 46, closed); eye(cx + 46, closed);
  g.fillStyle = 'rgba(255,120,140,0.55)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 80, cy + 26, 20, 11, 0, 0, TAU); g.fill(); }
  g.strokeStyle = ink; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath();
  if (expr === 'shock') { g.fillStyle = '#7a2a3a'; g.ellipse(cx, cy + 44, 12, 15, 0, 0, TAU); g.fill(); g.stroke(); }
  else if (expr === 'sad' || expr === 'worried') { g.arc(cx, cy + 56, 14, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); if (expr === 'worried') { g.fillStyle = '#9ad8ff'; g.beginPath(); g.moveTo(cx + 92, cy - 40); g.quadraticCurveTo(cx + 104, cy - 18, cx + 92, cy - 14); g.quadraticCurveTo(cx + 80, cy - 18, cx + 92, cy - 40); g.fill(); } }
  else if (expr === 'smug') { g.moveTo(cx - 14, cy + 38); g.quadraticCurveTo(cx + 4, cy + 46, cx + 18, cy + 32); g.stroke(); }
  else { g.arc(cx, cy + 30, 16, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke(); } }; }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a6040', n: 8, seed: 51 })) }); m.darkwood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#5a3a28', n: 6, seed: 23 })) });
  m.plaster = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.88 + 0.16 * PT.fbm(u, v, 4, 4, 3, 6)); }) });
  m.tile = vc({ map: T(256, 256, (g, w, h) => PT.shingles(g, w, h, { base: '#4a4a5a' })) }); m.stone = vc({ map: T(256, 256, (g, w, h) => PT.stone(g, w, h, { base: '#a89a88' })) });
  m.dirt = toon({ map: T(512, 512, (g, w, h) => PT.dirt(g, w, h, { base: '#a88a62' }), [1 / 5, 1 / 5]) }); m.grassT = T(512, 512, (g, w, h) => PT.grass(g, w, h, { base: '#6a9a4a' }), [1 / 6, 1 / 6]); m.grass = toon({ map: m.grassT });
  m.leaf = vc(); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.cloth = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#c84a4a' })) });
  m.brick = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#a85a3a', rows: 16, cols: 6, seed: 7 })) });
  m.noren = em(T(256, 256, norenTex('#2a3a6a', true)), 0x101020, { side: THREE.DoubleSide }); m.lantern = new THREE.MeshBasicMaterial({ map: T(128, 256, lanternTex), fog: true }); m.lantern.color.setScalar(1.25);
  m.lattice = vc({ map: T(256, 256, latticeTex) }); m.shoji = em(T(256, 256, shojiTex), 0x2a2010); m.tatami = vc({ map: T(256, 256, tatamiTex) });
  m.signKY = em(T(1024, 200, signTex(['TSUJIURA SENBEI'], { bg: '#3a2418', col: '#f4e2b0', rim: '#c8a060' })), 0x202020);
  m.signTG = em(T(1024, 200, signTex(['JAPANESE TEA GARDEN'], { bg: '#f2e8cc', col: '#7a2a2a', rim: '#7a2a2a' })), 0x202020);
  m.book = em(T(1024, 640, bookTex), 0x302418); m.map = em(T(1024, 640, mapTex), 0x182028); m.plaque = em(T(1024, 220, plaqueTex), 0x201810);
  m.panel = vc({ map: T(512, 256, woodPanelTex('#7a4a2e')) });
  m.cardSF = em(T(256, 128, signTex(['S.F.'], { bg: '#f4ecd8', col: '#2a3a7a', rim: '#2a3a7a', font: SANS })), 0x202020); m.cardLA = em(T(256, 128, signTex(['L.A.'], { bg: '#f4ecd8', col: '#a82a2a', rim: '#a82a2a', font: SANS })), 0x202020);
  m.signBakJP = em(T(1024, 200, signTex(['BAKERY  ·  CONFECTIONS'], { bg: '#f4ecd0', col: '#3a4a7a', rim: '#3a4a7a' })), 0x202020);
  m.signBakCN = em(T(1024, 200, signTex(['FORTUNE COOKIES'], { bg: '#c82a2a', col: '#ffe8a0', rim: '#ffd060', font: SANS })), 0x302010);
  m.signClosed = em(T(512, 220, signTex(['CLOSED'], { bg: '#f4ecd8', col: '#2a2a3a', rim: '#2a2a3a', font: SANS })), 0x202020);
  m.boxFC = em(T(256, 160, boxLabelTex(['FORTUNE', 'COOKIES'], { bg: '#f4ecd8', col: '#a82a2a' })), 0x202020);
  m.crate = em(T(256, 200, boxLabelTex(['FORTUNE COOKIES', '→ CHINA 1992'])), 0x201810);
  m.slips = { japan: ['MADE IN', 'JAPAN?'], future: ['GREAT FORTUNE', 'AWAITS YOU'], past: ['MADE IN JAPAN', '(PROBABLY)'], blank: ['', ''] };
  for (const k in m.slips) m.slips[k] = em(T(256, 72, slipTex(m.slips[k])), 0x404040);
  m.faces = {}; for (const e of ['smile', 'happy', 'shock', 'smug', 'sad', 'worried']) { m.faces[e] = new THREE.MeshBasicMaterial({ map: T(256, 160, faceTex(e)), transparent: true, depthWrite: false, fog: true }); }
  m.cookie = toon({ vertexColors: true, emissive: 0x2a1404, side: THREE.DoubleSide }); if (H.MACRO) H.MACRO(m.cookie, 0.14, 0.04);
  m.coal = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff6a20).multiplyScalar(1.4), fog: true });
  m.water = toon({ map: T(512, 512, (g, w, h) => { g.fillStyle = '#3a7a7a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.8 + 0.4 * PT.fbm(u, v, 6, 6, 3, 8) ** 2); g.strokeStyle = 'rgba(255,255,255,0.4)'; const R = PT.rng(3); for (let i = 0; i < 50; i++) { const x = R() * w, y = R() * h; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 12, y - 3, x + 26, y); g.stroke(); } }, [1 / 6, 1 / 6]), color: 0xc8f0e8, emissive: 0x0a2a2a });
  m.winNight = toon({ color: 0x2a3a7a, emissive: 0x101a40 }); m.winDay = toon({ color: 0x9ac0e0, emissive: 0x2a3a58 }); m.winLit = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc870).multiplyScalar(1.3), fog: true });
  m.sky = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xd8e8ff).multiplyScalar(1.25), fog: false });
  return m; }

// ---------------------------------------------------------------- shared props
const tintM = (m, hex) => { const c = new THREE.Color(hex), a = m.geometry.attributes.position.count, arr = new Float32Array(a * 3); for (let i = 0; i < a; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; } m.geometry.setAttribute('color', new THREE.Float32BufferAttribute(arr, 3)); return m; };
// fortune-cookie surface: unit disc (rho, th) rolled into a taco around x, then the spine bent upward so the corners meet. side: -1 / +1 half (x < 0 / x > 0)
function cookieGeo(side) { const NR = 16, NT = 28, pos = [], col = [], idx = [], A = 2.4, rc = 0.32, Rb = 0.75, C0 = new THREE.Color(0xf4c870), C1 = new THREE.Color(0xd0903a), tmp = new THREE.Color();
  for (let i = 0; i <= NR; i++) for (let j = 0; j <= NT; j++) { const rho = 0.03 + 0.97 * i / NR, th = -Math.PI / 2 + Math.PI * j / NT, x0 = side * rho * Math.cos(th), z0 = rho * Math.sin(th);
    const ph = z0 * A, y1 = rc * (1 - Math.cos(ph)) * (1 + 0.15 * (1 - Math.abs(x0))), z1 = rc * Math.sin(ph), ps = x0 * 1.5, r = Rb + z1;
    pos.push(-r * Math.sin(ps), y1, Rb - r * Math.cos(ps)); /* turned 180 deg: the crescent + crease side faces +z */ tmp.copy(C0).lerp(C1, clamp01((rho - 0.6) / 0.4) ** 1.3 * 0.85 + 0.12 * Math.sin(th * 5 + rho * 7) ** 2); col.push(tmp.r, tmp.g, tmp.b); }
  for (let i = 0; i < NR; i++) for (let j = 0; j < NT; j++) { const a = i * (NT + 1) + j, b = a + NT + 1; if (side > 0) idx.push(a, b, a + 1, b, b + 1, a + 1); else idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
let COOKIE_G = null;
// a cookie: two halves on pivots (crack), slip (slide out), optional face card. Origin at the spine's lowest point. ~0.11 m wide at s = 0.06
export function makeCookie(o = {}) { if (!COOKIE_G) COOKIE_G = [cookieGeo(-1), cookieGeo(1)]; const G = new THREE.Group(), halves = [];
  for (const [k, s] of [[0, -1], [1, 1]]) { const p = new THREE.Group(); G.add(p); const m = new THREE.Mesh(COOKIE_G[k], M.cookie); m.castShadow = true; m.receiveShadow = true; p.add(m); p.userData.s = s; halves.push(p); }
  let slip = null, face = null;
  if (o.slip) { slip = new THREE.Group(); G.add(slip); const sm2 = mesh(slip, plane(1.5, 0.42), M.slips[o.slip], 0, 0.21, 0, -0.2, 0, 0, false); sm2.material = M.slips[o.slip]; slip.userData.m = sm2; slip.position.set(0, 0.62, 0); slip.scale.setScalar(0.001); }
  if (o.face) { face = nond(new THREE.Mesh(plane(0.9, 0.56), M.faces.smile)); face.position.set(0, 0.36, 0.42); face.renderOrder = 3; G.add(face); }
  G.userData = { halves, slip, face }; return G; }
// cookie state: { p, ry, rx, s, crack 0..1, slip 0..1, msg, expr, on, bob }
export function setCookie(C, st) { C.visible = st.on !== false; if (!C.visible) return; C.position.set(...st.p); C.rotation.set(st.rx || 0, st.ry || 0, st.rz || 0, 'YXZ'); C.scale.setScalar(st.s || 1);
  const U = C.userData, k = st.crack || 0; U.halves.forEach((h) => { const s = h.userData.s; h.position.set(s * 0.18 * k, 0.1 * k, 0); h.rotation.set(0, -s * 0.35 * k, s * 0.5 * k); });
  if (U.slip) { const t = st.slip || 0; U.slip.visible = t > 0.001; U.slip.scale.setScalar(Math.max(0.001, t)); U.slip.position.set(0, 0.22 + 0.32 * t, 0.02); U.slip.rotation.set(-0.2 * t, 0, 0.05 * Math.sin(t * 6)); if (st.msg && M.slips[st.msg]) U.slip.userData.m.material = M.slips[st.msg]; }
  if (U.face) { U.face.visible = !!st.expr && k < 0.4; if (st.expr && M.faces[st.expr]) U.face.material = M.faces[st.expr]; } }
function tree(K, x, y, z, s, R, cols) { K.beam(M.bark, [x, y - 0.2, z], [x, y + 1.6 * s, z], 0.12 * s, 0x5a4a3a, true, 6); for (let i = 0; i < 6; i++) { const a = R() * TAU, rr = (0.5 + R() * 0.6) * s; K.put(M.leaf, lumpGeo(i + Math.round(x * 3 + z), 1, 0.3), x + Math.cos(a) * rr * 0.9, y + (1.9 + R() * 1.0) * s, z + Math.sin(a) * rr * 0.9, 0, R() * 6, 0, 1.0 * s, 0.7 * s, 1.0 * s, cols[i % cols.length]); } }
function stoneLantern(K, x, z, s = 1) { K.put(M.stone, cyl(0.22 * s, 0.3 * s, 0.12 * s, 8), x, 0.06 * s, z, 0, 0, 0, 1, 1, 1, 0x9a948a); K.put(M.stone, cyl(0.08 * s, 0.1 * s, 0.6 * s, 8), x, 0.42 * s, z, 0, 0, 0, 1, 1, 1, 0x9a948a);
  K.box(M.stone, x - 0.2 * s, x + 0.2 * s, 0.72 * s, 1.0 * s, z - 0.2 * s, z + 0.2 * s, 0xa8a296, 0.03); K.put(M.stone, new THREE.ConeGeometry(0.4 * s, 0.25 * s, 6), x, 1.13 * s, z, 0, 0, 0, 1, 1, 1, 0x8a847a); K.put(M.stone, sph(0.06 * s, 8, 6), x, 1.3 * s, z, 0, 0, 0, 1, 1, 1, 0x8a847a); }
function pendLantern(root, K, x, y, z, s = 1) { K.beam(M.darkwood, [x, y + 0.36 * s, z], [x, y + 0.6 * s, z], 0.012, 0x2a1a14); const l = mesh(root, cyl(0.17 * s, 0.17 * s, 0.4 * s, 14), M.lantern, x, y, z, 0, 0, 0, false); return [x, y, z]; }
function tray(K, x, y, z, w = 0.6, d = 0.4, c = 0x6a4028) { K.box(M.darkwood, x - w / 2, x + w / 2, y, y + 0.03, z - d / 2, z + d / 2, c, 0.01); for (const [a, b, e, f] of [[-w / 2, w / 2, -d / 2, -d / 2 + 0.02], [-w / 2, w / 2, d / 2 - 0.02, d / 2], [-w / 2, -w / 2 + 0.02, -d / 2, d / 2], [w / 2 - 0.02, w / 2, -d / 2, d / 2]]) K.box(M.darkwood, x + a, x + b, y, y + 0.06, z + e, z + f, c, 0.005); }
function cookiesOn(root, x, y, z, w, d, n, R, s = 0.06, list) { const out = []; for (let i = 0; i < n; i++) { const c = makeCookie(); c.position.set(x + (R() - 0.5) * w, y, z + (R() - 0.5) * d); c.rotation.y = R() * TAU; c.scale.setScalar(s * (0.9 + R() * 0.2)); root.add(c); out.push(c); if (list) list.push(c); } return out; }

// ================================================================= KYOTO (senbei shop + street)
function buildKyoto(root) { const R = PT.rng(1878), K = new Kit();
  mesh(root, planeUV(60, 30, 12, 6), M.dirt, 0, 0, 6, -Math.PI / 2, 0, 0, false);
  // shop: raised wood floor, back wall with shelves, side walls, roof with tiles and deep eaves, open front with noren
  K.box(M.wood, -3, 3, 0, 0.3, -4, 0, 0x9a7050, 0.02); K.box(M.tatami, -3, -0.6, 0.3, 0.33, -3.9, -1.2, 0xffffff, 0.005);
  K.box(M.plaster, -3, 3, 0, 3.4, -4.2, -4, 0xf0e4c8, 0.02); for (const s of [-1, 1]) K.box(M.plaster, s * 3, s * 3 + s * 0.2, 0, 3.4, -4.2, 0, 0xf0e4c8, 0.02);
  for (const x of [-3, -1, 1, 3]) K.box(M.darkwood, x - 0.1, x + 0.1, 0, 3.4, -0.12, 0.08, 0x3a2418, 0.02); K.box(M.darkwood, -3.2, 3.2, 2.9, 3.1, -0.15, 0.1, 0x3a2418, 0.02);
  K.box(M.darkwood, -3.4, 3.4, 3.4, 3.55, -4.3, 1.2, 0x3a2418, 0.02); K.at(0, 3.55, -1.6, 0, () => { K.put(M.tile, new THREE.CylinderGeometry(0.01, 4.6, 1.1, 4, 1), 0, 0.55, 0, 0, Math.PI / 4, 0, 1.0, 1, 0.9, 0x4a4a5a); });
  K.box(M.tile, -3.6, 3.6, 2.85, 2.95, 0.1, 1.5, 0x4a4a5a, 0.02); for (let x = -3.5; x < 3.6; x += 0.25) K.beam(M.tile, [x, 2.96, 0.1], [x, 2.96, 1.5], 0.05, 0x3a3a48, true, 5);
  // back shelves: tins, jars, stacked crackers
  for (let s = 0; s < 3; s++) { K.box(M.wood, -2.8, 2.8, 1.0 + s * 0.6, 1.04 + s * 0.6, -4.0, -3.6, 0x7a5030, 0.01); for (let i = 0; i < 9; i++) { const x = -2.5 + i * 0.62, c = [0xc84a3a, 0x3a5a8a, 0xd8a840, 0x4a7a5a][(i + s) % 4]; if ((i + s) % 3 === 0) K.put(M.paint, cyl(0.12, 0.12, 0.26, 12), x, 1.17 + s * 0.6, -3.8, 0, 0, 0, 1, 1, 1, c); else K.put(M.jar, cyl(0.1, 0.11, 0.3, 12), x, 1.19 + s * 0.6, -3.8, 0, 0, 0, 1, 1, 1, 0xfff0d0); } }
  // counter at the front, trays of crackers
  K.box(M.darkwood, -2.6, 0.2, 0.3, 0.95, -0.7, -0.2, 0x5a3420, 0.02); K.box(M.wood, -2.7, 0.3, 0.95, 1.0, -0.75, -0.15, 0x8a6040, 0.015);
  tray(K, -2.0, 1.0, -0.45, 0.6, 0.4); tray(K, -1.3, 1.0, -0.45, 0.5, 0.36);
  // the charcoal grill (hibachi box) with glowing coals and long-handled round irons (kata) resting over it
  K.box(M.darkwood, 0.4, 1.8, 0.3, 0.75, -1.9, -1.3, 0x4a2a1a, 0.03); K.box(M.iron || M.metal, 0.5, 1.7, 0.75, 0.78, -1.8, -1.4, 0x2a2a30, 0.01);
  const coals = []; for (let i = 0; i < 14; i++) { const c = mesh(root, lumpGeo(i, 1, 0.3), M.coal, 0.55 + R() * 1.1, 0.79, -1.75 + R() * 0.3, 0, R() * 6, 0, false); c.scale.set(0.07, 0.04, 0.07); coals.push(c); }
  for (let i = 0; i < 4; i++) { const x = 0.7 + i * 0.3; K.beam(M.metal, [x, 0.86, -1.6], [x - 0.15, 1.05, -0.6], 0.015, 0x2a2a30, true, 5); K.put(M.metal, cyl(0.1, 0.1, 0.03, 16), x, 0.84, -1.6, 0, 0, 0, 1, 1, 1, 0x3a3a44); K.put(M.wood, cyl(0.025, 0.025, 0.2, 6), x - 0.17, 1.08, -0.52, Math.PI / 2 - 0.2, 0, 0, 1, 1, 1, 0x8a5a38); }
  K.build(root);
  // noren (3 panels) + lanterns + shop sign; neighbours with lattice fronts and second floors; torii up the street; trees
  const noren = []; for (let i = 0; i < 3; i++) { const n = mesh(root, plane(0.95, 0.9), M.noren, -0.95 + i * 0.97, 2.4, 0.15, 0, 0, 0, false); n.userData.x = n.position.x; noren.push(n); }
  const K2 = new Kit(); const lamps = [pendLantern(root, K2, -2.6, 2.45, 0.6), pendLantern(root, K2, 2.6, 2.45, 0.6)];
  mesh(root, plane(3.0, 0.58), M.signKY, 0, 3.75, 0.95, -0.25, 0, 0, false);
  for (const s of [-1, 1]) K2.at(s * 7.3, 0, -0.5, 0, () => { K2.box(M.plaster, -4, 4, 0, 5.8, -4, 0, 0xe8dcc0, 0.03); K2.box(M.lattice, -3.8, 3.8, 0.2, 2.6, 0.0, 0.12, 0xffffff, 0.02); K2.box(M.darkwood, -4.1, 4.1, 2.7, 2.85, -0.1, 0.9, 0x3a2418, 0.02); K2.box(M.tile, -4.2, 4.2, 2.85, 2.95, 0.1, 1.2, 0x4a4a5a, 0.02);
    K2.box(M.lattice, -3.4, 3.4, 3.4, 4.8, 0.0, 0.12, 0xffffff, 0.02); K2.box(M.tile, -4.3, 4.3, 5.8, 6.0, -4.2, 0.8, 0x4a4a5a, 0.03); });
  K2.at(16, 0, 9, -0.9, () => { const c = 0xd8402a; for (const s of [-1.4, 1.4]) K2.put(M.paint, cyl(0.18, 0.2, 4.2, 12), s, 2.1, 0, 0, 0, 0, 1, 1, 1, c); K2.box(M.paint, -2.2, 2.2, 3.6, 3.85, -0.2, 0.2, c, 0.04); K2.box(M.paint, -2.6, 2.6, 4.1, 4.35, -0.25, 0.25, 0x2a2a30, 0.06); K2.box(M.paint, -0.15, 0.15, 3.85, 4.1, -0.15, 0.15, c, 0.02); });
  for (let i = 0; i < 14; i++) { const x = (R() - 0.5) * 50, z = 14 + R() * 10; tree(K2, x, 0, z, 1.2 + R(), R, [0x4a7a3a, 0x3f6e36, 0x5a8a3a]); }
  for (let i = 0; i < 6; i++) { const x = -16 + i * 6.4; K2.box(M.plaster, x - 2.8, x + 2.8, 0, 4.4, 20, 23, 0xe0d4b8, 0.03); K2.box(M.tile, x - 3, x + 3, 4.4, 4.6, 19.6, 23.4, 0x4a4a5a, 0.03); }
  K2.build(root, 30);
  // the hero cookie on the counter + extra crackers being made on the grill
  const hero = makeCookie({ slip: 'japan', face: true }); root.add(hero);
  const trayCookies = []; cookiesOn(root, -2.0, 1.03, -0.45, 0.45, 0.28, 7, R, 0.07, trayCookies); cookiesOn(root, -1.3, 1.03, -0.45, 0.35, 0.24, 5, R, 0.07, trayCookies);
  const glows = lamps.map((p) => glowAt(root, p, 1.4, '#ff8a50', 0.5)); const coalG = glowAt(root, [1.1, 0.95, -1.5], 1.6, '#ff7030', 0.4);
  const shaft = shaftAt(root, [0, 1.6, -1.0], 3.4, 4.0, 0.2, 0.5, 0.14, 0xfff0d0);
  const smoke = motes(root, 40, [0.5, 1.7, 0.9, 2.6, -1.8, -1.3], 71, 0.02); const dust = motes(root, 40, [-2.5, 2.5, 0.4, 2.8, -3, 0], 72, 0.012);
  return { hero, noren, glows, coalG, coals, shaft, smoke, dust };
}

// ================================================================= GARDEN (Japanese tea garden, San Francisco)
function buildGarden(root) { const R = PT.rng(1894), K = new Kit();
  mesh(root, planeUV(80, 60, 13, 10), M.grass, 0, 0, 0, -Math.PI / 2, 0, 0, false);
  const pond = mesh(root, new THREE.CircleGeometry(1, 40), M.water, -1.0, 0.02, -5, -Math.PI / 2, 0, 0, false); pond.scale.set(7, 3.4, 1);
  for (let i = 0; i < 40; i++) { const a = i / 40 * TAU, x = -1 + Math.cos(a) * 7.1, z = -5 + Math.sin(a) * 3.5, sc = 0.3 + R() * 0.4; K.put(M.stone, lumpGeo(i, 1, 0.3), x, 0.05, z, 0, R() * 6, 0, sc, sc * 0.5, sc, 0x8a8478); }
  // drum bridge across the pond: arched deck (torus segment) + rails
  K.at(-1.0, 0, -5, 0.15, () => { K.put(M.paint, new THREE.TorusGeometry(2.6, 0.08, 6, 40, Math.PI), 0, -1.3, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0xc8402a);
    for (let i = 0; i <= 16; i++) { const a = Math.PI * i / 16, y = -1.3 + Math.sin(a) * 2.6, z = Math.cos(a) * 2.6; if (y < 0) continue; K.box(M.wood, -0.6, 0.6, y - 0.05, y + 0.02, z - 0.16, z + 0.16, 0x8a5a38, 0.01); for (const s of [-1, 1]) K.beam(M.paint, [s * 0.6, y, z], [s * 0.6, y + 0.55, z], 0.03, 0xc8402a); }
    for (const s of [-1, 1]) { const P = []; for (let i = 0; i <= 16; i++) { const a = Math.PI * i / 16; P.push([s * 0.6, -1.3 + Math.sin(a) * 2.6 + 0.55, Math.cos(a) * 2.6]); } for (let i = 0; i < 16; i++) if (P[i][1] > 0.5 && P[i + 1][1] > 0.5) K.beam(M.paint, P[i], P[i + 1], 0.035, 0xc8402a); } });
  // tea house (right): raised platform, posts, low tables, shoji back, curved tile roof
  K.at(3.6, 0, -0.8, -0.35, () => { K.box(M.wood, -2.4, 2.4, 0, 0.4, -2, 1.2, 0x9a7050, 0.02); for (const [x, z] of [[-2.3, -1.9], [2.3, -1.9], [-2.3, 1.1], [2.3, 1.1]]) K.box(M.darkwood, x - 0.08, x + 0.08, 0.4, 2.8, z - 0.08, z + 0.08, 0x3a2418, 0.01);
    K.box(M.shoji, -2.3, 2.3, 0.4, 2.6, -2.0, -1.9, 0xffffff, 0.01); K.box(M.darkwood, -2.7, 2.7, 2.8, 2.95, -2.3, 1.5, 0x3a2418, 0.02); K.put(M.tile, new THREE.CylinderGeometry(0.01, 3.9, 1.0, 4, 1), 0, 3.45, -0.4, 0, Math.PI / 4, 0, 1, 1, 0.75, 0x4a4a5a);
    for (const x of [-1.2, 1.0]) { K.box(M.darkwood, x - 0.5, x + 0.5, 0.75, 0.8, -0.3, 0.4, 0x5a3420, 0.01); for (const [a, b] of [[-0.42, -0.24], [0.42, -0.24], [-0.42, 0.32], [0.42, 0.32]]) K.box(M.darkwood, x + a - 0.03, x + a + 0.03, 0.4, 0.75, b - 0.03, b + 0.03, 0x4a2a1a, 0.005);
      for (const dx of [-0.25, 0.25]) K.put(M.paint, cyl(0.04, 0.03, 0.06, 10), x + dx, 0.83, 0.1, 0, 0, 0, 1, 1, 1, 0xe8e4d8); K.put(M.paint, sph(0.09, 12, 8), x, 0.88, -0.1, 0, 0, 0, 1, 0.8, 1, 0x3a5a4a); } });
  // pagoda (back left), gate with sign (left front), stone lanterns, maples and pines
  K.at(-9, 0, -14, 0.3, () => { for (let i = 0; i < 4; i++) { const w = 2.4 - i * 0.4, y = i * 1.5; K.box(M.paint, -w / 2, w / 2, y, y + 1.2, -w / 2, w / 2, 0xc8402a, 0.03); K.put(M.tile, new THREE.CylinderGeometry(0.3, w * 0.95, 0.4, 4, 1), 0, y + 1.4, 0, 0, Math.PI / 4, 0, 1, 1, 1, 0x3a3a48); } K.put(M.brass, cyl(0.04, 0.04, 1.4, 6), 0, 6.6, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); });
  K.at(-4.6, 0, 2.2, 0.4, () => { for (const s of [-1, 1]) K.put(M.darkwood, cyl(0.12, 0.14, 3.0, 10), s * 1.3, 1.5, 0, 0, 0, 0, 1, 1, 1, 0x3a2418); K.box(M.darkwood, -1.8, 1.8, 2.9, 3.1, -0.2, 0.2, 0x3a2418, 0.03); K.box(M.tile, -2.0, 2.0, 3.1, 3.3, -0.5, 0.5, 0x4a4a5a, 0.04); });
  for (const [x, z, s] of [[1.6, -3.0, 0.9], [-6.5, -2.0, 1.1], [6.6, -4.4, 1.0], [-2.6, 1.0, 0.7]]) stoneLantern(K, x, z, s);
  for (let i = 0; i < 26; i++) { const a = R() * TAU, r = 9 + R() * 14, x = Math.cos(a) * r, z = -6 + Math.sin(a) * r * 0.6; if (z > -2.5 && Math.abs(x) < 9) continue; tree(K, x, 0, z, 1.0 + R() * 0.9, R, i % 3 ? [0xd8502a, 0xe86a3a, 0xc83a2a] : [0x3a6a3a, 0x4a7a3a, 0x2f5a30]); }
  for (let i = 0; i < 30; i++) { const x = -7 + R() * 5, z = -2 + R() * 3; const sc = 0.25 + R() * 0.3; K.put(M.leaf, lumpGeo(300 + i, 1, 0.3), x, sc * 0.5, z, 0, R() * 6, 0, sc * 1.4, sc, sc * 1.4, [0x3a6a3a, 0x4a7a3a, 0x5a8a4a][i % 3]); }
  K.box(M.stone, -1.6, 1.6, 0.0, 0.03, 0.6, 3.6, 0xb8b0a0, 0.01);
  K.build(root, 40);
  const sign = mesh(root, plane(3.2, 0.6), M.signTG, -4.6, 2.65, 2.42, 0, 0.4, 0, false);
  const cups = []; cookiesOn(root, 3.6 - 1.2 * Math.cos(0.35) - 0.12, 0.83, -0.8 + 1.2 * Math.sin(0.35), 0.15, 0.1, 2, R, 0.06, cups); cookiesOn(root, 3.6 + 1.0 * Math.cos(0.35), 0.83, -0.8 - 1.0 * Math.sin(0.35), 0.15, 0.1, 2, R, 0.06, cups);
  const leaves = motes(root, 40, [-6, 6, 0.2, 4, -6, 3], 81, 0.03); leaves.im.material = leaves.im.material.clone(); leaves.im.material.color.set(0xff8a40);
  return { pond, sign, leaves };
}

// ================================================================= COURT (1983 mock trial)
function buildCourt(root) { const R = PT.rng(1983), K = new Kit(), X = 6, ZB = -4.4, HT = 4.2;
  K.box(M.wood, -X, X, -0.05, 0, ZB, 6, 0xa07a54, 0.01); K.box(M.panel, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); K.box(M.panel, -X - 0.2, -X, 0, HT, ZB, 6, 0xffffff, 0.01); K.box(M.panel, X, X + 0.2, 0, HT, ZB, 6, 0xffffff, 0.01);
  K.box(M.darkwood, -X, X, HT - 0.2, HT, ZB, 6, 0x4a2a1a, 0.01);
  // judge's bench (raised) + chair back, flags as plain drapes, plaque
  K.box(M.darkwood, -2.2, 2.2, 0, 1.25, -3.4, -2.4, 0x5a3420, 0.03); K.box(M.wood, -2.3, 2.3, 1.25, 1.32, -3.5, -2.3, 0x7a4a2e, 0.02); K.box(M.darkwood, -2.2, 2.2, 0, 0.45, -4.2, -3.4, 0x5a3420, 0.02);
  K.box(M.cloth, -0.45, 0.45, 1.3, 3.0, -4.15, -3.95, 0x3a2a5a, 0.06);
  for (const [x, c] of [[-3.2, 0x2a4a8a], [3.2, 0xa82a2a]]) { K.beam(M.brass, [x, 0, -3.8], [x, 2.8, -3.8], 0.03, 0xc8a050, true, 6); K.box(M.cloth, x - 0.02, x + 0.7 * Math.sign(x), 1.6, 2.7, -3.82, -3.78, c, 0.02); }
  // two tables (S.F. left, L.A. right), chairs, evidence stand in the middle, audience benches, TV camera on a tripod, window
  for (const s of [-1, 1]) { K.box(M.darkwood, s * 1.4, s * 3.6, 0.72, 0.8, -0.6, 0.4, 0x5a3420, 0.02); for (const [a, b] of [[1.5, -0.5], [3.5, -0.5], [1.5, 0.3], [3.5, 0.3]]) K.box(M.darkwood, s * a - 0.05, s * a + 0.05, 0, 0.72, b - 0.05, b + 0.05, 0x4a2a1a, 0.01);
    for (let i = 0; i < 3; i++) K.box(M.paint, s * (1.8 + i * 0.5) - 0.15, s * (1.8 + i * 0.5) + 0.15, 0.8, 0.84 + i * 0.01, -0.3, -0.05, [0xf4ecd8, 0xe8e0c8, 0x3a3a40][i], 0.005); }
  K.box(M.darkwood, -0.3, 0.3, 0, 1.0, -1.4, -0.9, 0x5a3420, 0.02); K.box(M.wood, -0.38, 0.38, 1.0, 1.05, -1.48, -0.82, 0x7a4a2e, 0.01);
  for (let r = 0; r < 3; r++) for (const s of [-1, 1]) { const z = 2.0 + r * 1.2; K.box(M.darkwood, s * 0.6, s * 5.4, 0.42, 0.5, z - 0.25, z + 0.25, 0x5a3420, 0.02); K.box(M.darkwood, s * 0.6, s * 5.4, 0.5, 1.0, z + 0.2, z + 0.28, 0x5a3420, 0.02); }
  K.box(M.darkwood, -X, X, 0, 0.9, 1.1, 1.2, 0x4a2a1a, 0.02); // bar rail
  K.at(-4.6, 0, 0.9, 0.5, () => { for (let i = 0; i < 3; i++) { const a = i * TAU / 3; K.beam(M.metal, [0, 1.4, 0], [Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5], 0.025, 0x2a2a30); } K.box(M.metal, -0.25, 0.25, 1.4, 1.75, -0.4, 0.3, 0x3a3a44, 0.04); K.put(M.metal, cyl(0.11, 0.13, 0.3, 14), 0, 1.58, 0.42, Math.PI / 2, 0, 0, 1, 1, 1, 0x1a1a22); });
  K.box(M.darkwood, X - 0.1, X, 1.0, 3.4, -2, 0.6, 0x3a2418, 0.02);
  K.build(root);
  const win = mesh(root, plane(2.4, 2.2), M.winDay, X - 0.11, 2.2, -0.7, 0, -Math.PI / 2, 0, false);
  mesh(root, plane(3.4, 0.73), M.plaque, 0, 3.55, ZB + 0.03, 0, 0, 0, false);
  for (const [x, m] of [[-2.5, M.cardSF], [2.5, M.cardLA]]) mesh(root, plane(0.6, 0.3), m, x, 0.95, 0.42, -0.3, 0, 0, false);
  const hero = makeCookie({ slip: 'japan', face: true }); root.add(hero);
  const shaft = shaftAt(root, [X - 1.5, 2.0, -0.7], 2.8, 4.0, -Math.PI / 2 + 0.5, 0.6, 0.16, 0xfff0d0); const dust = motes(root, 50, [-4, 4, 0.4, 3.6, -3, 3], 91, 0.012);
  return { hero, shaft, dust };
}

// ================================================================= STUDY (researcher's desk, the 1878 book, the Pacific map)
function buildStudy(root) { const R = PT.rng(2008), K = new Kit(), X = 4.2, ZB = -3.0, HT = 3.2;
  K.box(M.wood, -X, X, -0.05, 0, ZB, 4, 0x8a6a4a, 0.01); K.box(M.plaster, -X, X, 0, HT, ZB - 0.2, ZB, 0xe0d8c8, 0.01); K.box(M.plaster, -X - 0.2, -X, 0, HT, ZB, 4, 0xe0d8c8, 0.01); K.box(M.plaster, X, X + 0.2, 0, HT, ZB, 4, 0xe0d8c8, 0.01);
  // desk + chair + lamp + papers + mug; bookshelves left and right of the map; window (night) at the right
  K.box(M.darkwood, -1.4, 1.4, 0.74, 0.8, -1.2, -0.1, 0x5a3420, 0.02); for (const [a, b] of [[-1.3, -1.1], [1.3, -1.1], [-1.3, -0.2], [1.3, -0.2]]) K.box(M.darkwood, a - 0.05, a + 0.05, 0, 0.74, b - 0.05, b + 0.05, 0x4a2a1a, 0.01);
  K.box(M.darkwood, 0.7, 1.3, 0.0, 0.74, -1.15, -0.6, 0x4a2a1a, 0.01);
  for (let i = 0; i < 5; i++) K.cb(M.paint, 0.21, 0.004, 0.3, -1.0 + R() * 0.3, 0.802 + i * 0.002, -0.5 + R() * 0.2, 0xf4f0e4, 0, R() - 0.5, 0, 0.002);
  K.put(M.paint, cyl(0.045, 0.04, 0.1, 12), 1.1, 0.85, -0.4, 0, 0, 0, 1, 1, 1, 0x3a6a8a);
  K.at(-1.1, 0.8, -0.95, 0.5, () => { K.put(M.metal, cyl(0.08, 0.1, 0.03, 12), 0, 0.015, 0, 0, 0, 0, 1, 1, 1, 0x2a5a4a); K.beam(M.metal, [0, 0.03, 0], [0.05, 0.42, 0.08], 0.012, 0x2a5a4a); K.put(M.metal, new THREE.ConeGeometry(0.11, 0.14, 14, 1, true), 0.1, 0.42, 0.14, 0.7, 0, 0, 1, 1, 1, 0x2a5a4a); });
  for (const s of [-1, 1]) K.at(s * 3.2, 0, ZB + 0.2, 0, () => { K.box(M.darkwood, -0.8, 0.8, 0, 2.6, 0, 0.36, 0x4a2a1a, 0.02); for (let sh = 0; sh < 5; sh++) { K.box(M.darkwood, -0.76, 0.76, 0.1 + sh * 0.5, 0.13 + sh * 0.5, 0.02, 0.34, 0x3a2418, 0.01); for (let b = 0; b < 10; b++) K.box(M.paint, -0.7 + b * 0.14, -0.6 + b * 0.14, 0.13 + sh * 0.5, 0.45 + sh * 0.5 - (b % 3) * 0.04, 0.06, 0.32, [0x8a2a2a, 0x2a4a6a, 0x5a6a3a, 0x8a6a2a, 0xd8c8a0][(b + sh + (s > 0 ? 2 : 0)) % 5], 0.01); } });
  K.box(M.darkwood, -2.0, 2.0, 0.85, 2.95, ZB, ZB + 0.04, 0x5a3420, 0.01);
  // the open book on the desk (two page planes angled, cover)
  K.at(0, 0.8, -0.65, 0, () => { K.box(M.paint, -0.36, 0.36, 0, 0.02, -0.24, 0.24, 0x5a2a2a, 0.005); });
  K.build(root);
  const map = mesh(root, plane(3.9, 2.0), M.map, 0, 1.9, ZB + 0.05, 0, 0, 0, false);
  const book = new THREE.Group(); book.position.set(0, 0.825, -0.65); root.add(book);
  for (const s of [-1, 1]) { const pg = new THREE.Mesh(plane(0.34, 0.44), M.book.clone()); pg.material.map = M.book.map.clone(); pg.material.map.needsUpdate = true; pg.material.map.repeat.set(0.5, 1); pg.material.map.offset.set(s < 0 ? 0 : 0.5, 0); pg.material.emissiveMap = pg.material.map;
    pg.rotation.set(-Math.PI / 2, s * 0.12, 0); pg.position.set(s * 0.17, 0.012 + 0.01, 0); book.add(pg); }
  const win = mesh(root, plane(1.6, 1.4), M.winNight, X - 0.01, 1.8, 1.0, 0, -Math.PI / 2, 0, false);
  // toy steamship on the map (slides along the route) and the crate for 1992
  const ship = new THREE.Group(); root.add(ship); { const KS = new Kit(); KS.box(M.paint, -0.09, 0.09, -0.025, 0.0, -0.01, 0.03, 0x2a2a30, 0.008); KS.box(M.paint, -0.06, 0.05, 0.0, 0.025, -0.008, 0.028, 0xf4ecd8, 0.005); KS.put(M.paint, cyl(0.012, 0.012, 0.04, 8), 0.0, 0.045, 0.01, 0, 0, 0, 1, 1, 1, 0xc83a2a); KS.build(ship); }
  const crate = new THREE.Group(); root.add(crate); { const KC = new Kit(); KC.box(M.wood, -0.22, 0.22, 0, 0.3, -0.16, 0.16, 0xb88a5a, 0.01); for (const y of [0.02, 0.28]) KC.box(M.wood, -0.23, 0.23, y - 0.02, y + 0.02, -0.17, 0.17, 0x8a5a38, 0.005); KC.build(crate); mesh(crate, plane(0.4, 0.26), M.crate, 0, 0.15, 0.171, 0, 0, 0, false); }
  const hero = makeCookie({ slip: 'japan', face: true }); root.add(hero);
  const lampG = glowAt(root, [-0.98, 1.2, -0.8], 1.2, '#ffd890', 0.55); const dust = motes(root, 40, [-2.5, 2.5, 0.4, 2.8, -2.5, 1.5], 101, 0.01);
  return { map, book, win, ship, crate, hero, lampG, dust };
}

// ================================================================= BAKERY (California, three eras)
function buildBakery(root) { const R = PT.rng(1912), K = new Kit(), X = 5, ZB = -3.6, HT = 3.6;
  K.box(M.wood, -X, X, -0.05, 0, ZB, 5, 0xb89a78, 0.01); K.box(M.brick, -X, X, 0, HT, ZB - 0.2, ZB, 0xe8d0c0, 0.01); K.box(M.plaster, -X - 0.2, -X, 0, HT, ZB, 5, 0xe8dcc8, 0.01); K.box(M.plaster, X, X + 0.2, 0, HT, ZB, 5, 0xe8dcc8, 0.01);
  for (let i = 0; i < 4; i++) K.beam(M.darkwood, [-X, HT - 0.15, ZB + i * 2.2], [X, HT - 0.15, ZB + i * 2.2], 0.16, 0x5a3420);
  // back: brick oven with iron door, shelves of tins, worktable with cookie griddles (two irons) and a conveyor table (1950s)
  K.box(M.brick, -4.6, -2.2, 0, 2.4, -3.6, -2.6, 0xc87a5a, 0.04); K.box(M.metal, -3.9, -2.9, 0.7, 1.4, -2.62, -2.56, 0x2a2a30, 0.02);
  for (let s = 0; s < 3; s++) { K.box(M.wood, 1.2, 4.6, 1.2 + s * 0.55, 1.24 + s * 0.55, -3.6, -3.2, 0x8a6040, 0.01); for (let i = 0; i < 7; i++) K.put(M.paint, cyl(0.12, 0.12, 0.24, 12), 1.5 + i * 0.45, 1.36 + s * 0.55, -3.4, 0, 0, 0, 1, 1, 1, [0xc8b08a, 0xd8c8a8, 0xa8885a][(i + s) % 3]); }
  K.box(M.darkwood, -1.8, 1.8, 0.85, 0.92, -2.4, -1.4, 0x6a4028, 0.02); for (const [a, b] of [[-1.7, -2.3], [1.7, -2.3], [-1.7, -1.5], [1.7, -1.5]]) K.box(M.darkwood, a - 0.05, a + 0.05, 0, 0.85, b - 0.05, b + 0.05, 0x4a2a1a, 0.01);
  for (const x of [-1.2, -0.4]) { K.box(M.metal, x - 0.3, x + 0.3, 0.92, 0.97, -2.1, -1.7, 0x3a3a44, 0.01); K.put(M.metal, cyl(0.1, 0.1, 0.02, 14), x, 0.99, -1.9, 0, 0, 0, 1, 1, 1, 0x5a5a64); }
  tray(K, 0.8, 0.92, -1.9, 0.9, 0.5);
  // front: display counter with glass top, register, door + front window at the right (shop sign above), bentwood chairs and a table
  K.box(M.darkwood, -2.8, 1.6, 0, 0.95, -0.4, 0.2, 0x5a3420, 0.02); K.box(M.wood, -2.9, 1.7, 0.95, 1.0, -0.45, 0.25, 0x8a6040, 0.01);
  tray(K, -2.0, 0.55, -0.1, 0.8, 0.4); tray(K, -0.9, 0.55, -0.1, 0.8, 0.4);
  K.box(M.metal, 0.9, 1.4, 1.0, 1.3, -0.3, 0.1, 0x3a3a44, 0.03); K.box(M.brass, 0.95, 1.35, 1.3, 1.36, -0.2, 0.05, 0xc8a050, 0.01);
  for (let i = 0; i < 4; i++) K.put(M.paint, cyl(0.05, 0.05, 0.3, 10), -2.8 + i * 0.12, 1.15, 0.1, 0, 0, 0, 1, 1, 1, 0xf4ecd8);
  K.at(3.4, 0, 1.6, 0, () => { K.put(M.darkwood, cyl(0.45, 0.45, 0.04, 20), 0, 0.75, 0, 0, 0, 0, 1, 1, 1, 0x6a4028); K.put(M.darkwood, cyl(0.04, 0.06, 0.75, 8), 0, 0.37, 0, 0, 0, 0, 1, 1, 1, 0x4a2a1a); for (const a of [0.5, 3.4]) K.at(Math.cos(a) * 0.7, 0, Math.sin(a) * 0.7, -a, () => { K.put(M.darkwood, cyl(0.2, 0.2, 0.03, 14), 0, 0.46, 0, 0, 0, 0, 1, 1, 1, 0x4a2a1a); for (const [a2, b2] of [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]]) K.beam(M.darkwood, [a2, 0, b2], [a2 * 0.8, 0.46, b2 * 0.8], 0.015, 0x3a2418); K.beam(M.darkwood, [-0.15, 0.46, -0.17], [-0.15, 0.95, -0.2], 0.015, 0x3a2418); K.beam(M.darkwood, [0.15, 0.46, -0.17], [0.15, 0.95, -0.2], 0.015, 0x3a2418); K.box(M.darkwood, -0.16, 0.16, 0.8, 0.92, -0.22, -0.18, 0x3a2418, 0.01); }); });
  K.box(M.plaster, X - 0.12, X, 0, HT, 3.0, 5, 0xe8dcc8, 0.01);
  K.build(root);
  const winM = M.winDay.clone(); const win = mesh(root, plane(2.8, 1.8), winM, X - 0.13, 1.6, 1.4, 0, -Math.PI / 2, 0, false);
  const sign = mesh(root, plane(3.0, 0.58), M.signBakJP, 0, 2.95, ZB + 0.03, 0, 0, 0, false);
  const shut = new THREE.Group(); root.add(shut); { const KS = new Kit(); for (let i = 0; i < 14; i++) KS.box(M.wood, X - 0.2, X - 0.15, 0.7 + i * 0.13, 0.82 + i * 0.13, 0.0, 2.8, 0x6a5a48, 0.005); KS.box(M.wood, X - 0.25, X - 0.15, 0.6, 2.6, 1.3, 1.5, 0x5a4a38, 0.005); KS.build(shut); }
  const closed = new THREE.Group(); root.add(closed); mesh(closed, plane(0.7, 0.3), M.signClosed, 0, 0, 0, 0, 0, 0, false); closed.position.set(-0.4, 1.75, ZB + 0.04);
  { const KC = new Kit(); KC.beam(M.wood, [-0.3, 0.12, 0], [0, 0.35, -0.01], 0.006, 0x3a2a20); KC.beam(M.wood, [0.3, 0.12, 0], [0, 0.35, -0.01], 0.006, 0x3a2a20); KC.build(closed); }
  const suitcase = new THREE.Group(); root.add(suitcase); { const KC = new Kit(); KC.box(M.cloth, -0.3, 0.3, 0, 0.42, -0.1, 0.1, 0x6a4a3a, 0.03); KC.box(M.brass, -0.08, 0.08, 0.42, 0.47, -0.02, 0.02, 0x3a2a20, 0.01); KC.box(M.paint, 0.12, 0.24, 0.2, 0.34, 0.1, 0.105, 0xf4ecd8, 0.002); KC.build(suitcase); } suitcase.position.set(-1.1, 0, 1.0); suitcase.rotation.y = 0.3;
  const sheet = new THREE.Group(); root.add(sheet); { const KC = new Kit(); KC.box(M.cloth, -2.95, 1.75, 0.98, 1.04, -0.5, 0.3, 0xe8e0d0, 0.04); KC.box(M.cloth, -2.95, 1.75, 0.3, 1.0, 0.26, 0.32, 0xe8e0d0, 0.03); KC.build(sheet); }
  // counter cookies (era-specific): JP trays, CN trays + boxes; the conveyor belt with moving cookies (1950s)
  const jp = [], cn = []; cookiesOn(root, -2.0, 0.58, -0.1, 0.6, 0.28, 9, R, 0.07, jp); cookiesOn(root, -0.9, 0.58, -0.1, 0.6, 0.28, 9, R, 0.07, jp); cookiesOn(root, 0.8, 0.95, -1.9, 0.7, 0.36, 10, R, 0.07, jp);
  const boxes = new THREE.Group(); root.add(boxes); for (let i = 0; i < 6; i++) { const b = new THREE.Group(); const KB = new Kit(); KB.box(M.paint, -0.17, 0.17, 0, 0.22, -0.12, 0.12, 0xf4ecd8, 0.01); KB.build(b); mesh(b, plane(0.32, 0.2), M.boxFC, 0, 0.11, 0.121, 0, 0, 0, false); b.position.set(-2.6 + (i % 3) * 0.4, 1.0 + Math.floor(i / 3) * 0.22, -0.15); b.rotation.y = (R() - 0.5) * 0.3; boxes.add(b); }
  const belt = new THREE.Group(); root.add(belt); { const KB = new Kit(); KB.box(M.metal, -4.6, 0.0, 0.8, 0.86, 1.2, 1.7, 0x5a5a64, 0.01); KB.box(M.paint, -4.6, 0.0, 0.86, 0.87, 1.25, 1.65, 0x2a2a30, 0.002); for (const x of [-4.4, -2.3, -0.2]) for (const z of [1.25, 1.65]) KB.box(M.metal, x - 0.04, x + 0.04, 0, 0.8, z - 0.04, z + 0.04, 0x3a3a44, 0.005); KB.build(belt); }
  const beltC = []; for (let i = 0; i < 14; i++) { const c = makeCookie(); c.scale.setScalar(0.07); belt.add(c); beltC.push(c); }
  const flourG = glowAt(root, [0, 3.2, -1], 1.6, '#ffd890', 0.4); const shaft = shaftAt(root, [X - 1.4, 1.6, 1.4], 2.6, 4.0, -Math.PI / 2 + 0.6, 0.55, 0.18, 0xfff0d0);
  const dust = motes(root, 60, [-4, 4, 0.3, 3, -3, 3], 111, 0.012);
  return { win, sign, shut, closed, suitcase, sheet, jp, boxes, belt, beltC, flourG, shaft, dust };
}

// ================================================================= lights, grades, API
const SET_LIGHT = {
  kyotoNight: { top: '#0a0a2a', hor: '#2a2a5a', fog: '#1a1a3a', fogN: 12, fogF: 70, sky: '#3a3a7a', ground: '#2a2028', hemiI: 0.6, fillCol: '#5a68c0', fillI: 0.4, sunCol: '#8a9aff', sunI: 0.9, az: 40, el: 40, disc: '#000000', clouds: false, stars: 0.6, cardTint: '#ffe8e0', fxTint: '#ffffff', shafts: 0, shadow: true },
  kyoto: { top: '#3f7ad8', hor: '#f0dcb8', fog: '#e8d8c0', fogN: 20, fogF: 120, sky: '#a8bcf0', ground: '#6a5448', hemiI: 0.8, fillCol: '#7d93e6', fillI: 0.36, sunCol: '#ffe0b0', sunI: 3.4, az: 150, el: 34, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#fff4e8', fxTint: '#ffffff', shafts: 0.4 },
  kyotoToday: { top: '#3f7ad8', hor: '#c8dcf4', fog: '#d4e4f0', fogN: 24, fogF: 140, sky: '#a8bcf0', ground: '#6a6448', hemiI: 0.78, fillCol: '#7d93e6', fillI: 0.36, sunCol: '#fff0d8', sunI: 3.7, az: 130, el: 46, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  kyotoDawn: { top: '#4a5aa8', hor: '#ffc890', fog: '#f0c8a0', fogN: 40, fogF: 140, sky: '#9a90d8', ground: '#5a4a50', hemiI: 0.9, fillCol: '#7078d8', fillI: 0.32, sunCol: '#ffb070', sunI: 3.2, az: 120, el: 12, disc: '#fff0c8', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff2e2', fxTint: '#fff6ea', shafts: 0.6 },
  garden: { top: '#3f7ad8', hor: '#c8dcf4', fog: '#d4e4f0', fogN: 30, fogF: 160, sky: '#a8bcf0', ground: '#5a6448', hemiI: 0.78, fillCol: '#7d93e6', fillI: 0.36, sunCol: '#ffecc8', sunI: 3.6, az: 140, el: 40, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  court: { top: '#000000', hor: '#2a1e18', fog: '#2a1e18', fogN: 12, fogF: 60, sky: '#ffe8c8', ground: '#5a3a2a', hemiI: 1.15, fillCol: '#8a90c8', fillI: 0.3, sunCol: '#ffe8c0', sunI: 2.7, az: -70, el: 32, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  study: { top: '#000000', hor: '#2a1e18', fog: '#2a1e18', fogN: 10, fogF: 50, sky: '#ffe8c8', ground: '#4a3a2a', hemiI: 0.85, fillCol: '#8a90c8', fillI: 0.34, sunCol: '#ffe0b8', sunI: 1.8, az: -60, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  studyMap: { top: '#000000', hor: '#141a30', fog: '#141a30', fogN: 10, fogF: 50, sky: '#7a7ab8', ground: '#3a2a30', hemiI: 0.72, fillCol: '#5a68c0', fillI: 0.4, sunCol: '#a8b8ff', sunI: 1.2, az: -60, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#f0e8f8', fxTint: '#ffffff', shafts: 0 },
  bakeryJP: { top: '#000000', hor: '#2a1e18', fog: '#2a1e18', fogN: 12, fogF: 60, sky: '#ffe8c8', ground: '#5a3a2a', hemiI: 0.95, fillCol: '#8a90c8', fillI: 0.3, sunCol: '#ffe2b8', sunI: 2.9, az: -60, el: 36, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  bakeryClosed: { top: '#000000', hor: '#0e1228', fog: '#0e1228', fogN: 10, fogF: 40, sky: '#4a5a9a', ground: '#2a2a34', hemiI: 0.8, fillCol: '#4a58b0', fillI: 0.48, sunCol: '#8aa0e8', sunI: 1.3, az: -60, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#d8dcf0', fxTint: '#ffffff', shafts: 0 },
  bakeryCN: { top: '#000000', hor: '#2a1e18', fog: '#2a1e18', fogN: 12, fogF: 60, sky: '#fff0d8', ground: '#5a3a2a', hemiI: 1.0, fillCol: '#8a90c8', fillI: 0.3, sunCol: '#fff0d0', sunI: 3.2, az: -50, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff4ea', fxTint: '#ffffff', shafts: 0 },
};
const IN_GRADE = { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.08, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.42, 0.78], hal: [0.26, '#ff9a50'], vig: [0.34, 0.46, '#2a1420'] } };
const SET_GRADE = {
  kyotoNight: { look: 'night', over: { exp: 1.18, con: 1.22, sat: 1.1, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffb070', 0.16], bloom: [0.5, 0.66], hal: [0.32, '#ff8a50'], vig: [0.4, 0.42, '#08081a'] } },
  kyoto: { look: 'golden', over: { exp: 1.06, con: 1.2, sat: 1.1, tS: ['#3a3a8a', 0.16], tH: ['#ffd8a0', 0.1], bloom: [0.42, 0.8], hal: [0.22, '#ffa860'], vig: [0.3, 0.48, '#2a1a3a'] } },
  kyotoToday: { look: 'day', over: { exp: 1.04, con: 1.2, sat: 1.12, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c8', 0.05], bloom: [0.4, 0.84], vig: [0.24, 0.5, '#3a3a5a'] } },
  kyotoDawn: { look: 'golden', over: { exp: 1.08, con: 1.22, sat: 1.08, tS: ['#3a3a8a', 0.18], tH: ['#ffc890', 0.12], bloom: [0.44, 0.76], hal: [0.26, '#ffa860'], vig: [0.3, 0.48, '#1e1a3a'] } },
  garden: { look: 'day', over: { exp: 1.04, con: 1.2, sat: 1.14, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c8', 0.05], bloom: [0.4, 0.84], vig: [0.24, 0.5, '#3a3a5a'] } },
  court: IN_GRADE, study: IN_GRADE, bakeryJP: IN_GRADE,
  studyMap: { look: 'night', over: { exp: 1.16, con: 1.22, sat: 1.04, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.5, 0.68], hal: [0.3, '#ffa050'], vig: [0.4, 0.42, '#08081a'] } },
  bakeryClosed: { look: 'night', over: { exp: 1.14, con: 1.2, sat: 0.86, lift: [0.025, 0.028, 0.06], tS: ['#1a2a6a', 0.28], tH: ['#c8d0ff', 0.08], bloom: [0.46, 0.7], vig: [0.42, 0.42, '#06081a'] } },
  bakeryCN: { look: 'office', over: { exp: 1.14, con: 1.22, sat: 1.12, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.16], tH: ['#ffd8a0', 0.1], bloom: [0.42, 0.78], hal: [0.24, '#ffb060'], vig: [0.3, 0.48, '#2a1420'] } },
};

export function buildFC(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'kyoto', gavel: 0 };
  let ky, gd, ct, sd, bk;
  const API = makeAPI(ctx, { prefix: 'fc_', origin: FC_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { kyotoNight: 'office', kyoto: 'day', kyotoToday: 'day', kyotoDawn: 'day', garden: 'day', court: 'office', study: 'office', studyMap: 'office', bakeryJP: 'office', bakeryClosed: 'office', bakeryCN: 'office' },
    practicals: (name, F, W3) => { const fl = 1 + 0.05 * Math.sin(F * 0.7) + 0.03 * Math.sin(F * 1.9);
      if (name === 'kyotoNight') return [{ p: W3('kyoto', [-2.6, 2.3, 0.9]), col: '#ff8a50', I: 6 * fl, d: 8 }, { p: W3('kyoto', [2.6, 2.3, 0.9]), col: '#ff8a50', I: 6 * fl, d: 8 }, { p: W3('kyoto', [1.1, 1.1, -1.4]), col: '#ff7030', I: 3 * fl, d: 4 }, { p: W3('kyoto', [-0.7, 1.9, 0.5]), col: '#ffe0b0', I: 5.5, d: 5 }];
      if (name.startsWith('kyoto')) return [{ p: W3('kyoto', [1.1, 1.1, -1.4]), col: '#ff8040', I: 1.6 * fl, d: 4 }, { p: W3('kyoto', [-1, 2.6, -2]), col: '#ffe8c8', I: 3.0, d: 7 }, { p: W3('kyoto', [-1.0, 2.0, 1.2]), col: '#fff4e0', I: 4.5, d: 7 }];
      if (name === 'court') return [{ p: W3('court', [0, 3.0, -0.6]), col: '#ffe0b0', I: 5, d: 9 }, { p: W3('court', [4.6, 2.2, -0.7]), col: '#fff0d8', I: 3.0, d: 8 }, { p: W3('court', [-3, 2.6, 2]), col: '#ffd8a8', I: 2.2, d: 8 }];
      if (name === 'study' || name === 'studyMap') return [{ p: W3('study', [-1.0, 1.2, -0.9]), col: '#ffc070', I: (name === 'studyMap' ? 4 : 2.6) * fl, d: 5 }, { p: W3('study', [0, 2.6, -1.6]), col: name === 'studyMap' ? '#7a8aff' : '#ffe0c0', I: 2.4, d: 6 }, { p: W3('study', [3.6, 1.8, 1]), col: '#7a8aff', I: 1.8, d: 6 }];
      if (name === 'bakeryClosed') return [{ p: W3('bakery', [3.8, 1.8, 1.4]), col: '#8aa0ff', I: 4.5, d: 9 }, { p: W3('bakery', [-0.5, 2.4, 1.2]), col: '#6a7ad0', I: 2.6, d: 7 }];
      if (name.startsWith('bakery')) return [{ p: W3('bakery', [0, 3.0, -1]), col: '#ffc878', I: (name === 'bakeryCN' ? 6 : 5) * fl, d: 9 }, { p: W3('bakery', [3.8, 2.0, 1.4]), col: '#fff0d8', I: 3.0, d: 8 }, { p: W3('bakery', [-3.4, 1.0, -2.4]), col: '#ff8a40', I: 2.4 * fl, d: 5 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'kyoto' && ky) { ky.noren.forEach((n, i) => { n.rotation.x = 0.05 * Math.sin(T * 1.3 + i) + 0.03 * Math.sin(T * 2.9 + i * 2); });
        const night = ST.mood === 'kyotoNight'; ky.glows.forEach((g) => (g.material.opacity = (night ? 0.75 : 0.25) * (0.92 + 0.08 * Math.sin(f * 0.6)))); ky.coalG.material.opacity = (night ? 0.6 : 0.35) * (0.85 + 0.15 * Math.sin(f * 0.9));
        ky.coals.forEach((c, i) => c.material.color.setRGB(1.4, 0.42 + 0.1 * Math.sin(f * 0.3 + i), 0.12)); ky.shaft.visible = ST.mood === 'kyoto' || ST.mood === 'kyotoDawn'; tickMotes(ky.smoke, f, 2.5); tickMotes(ky.dust, f, 0.3); }
      if (cur === 'garden' && gd) { M.water.map.offset.set(T * 0.01, T * 0.006); tickMotes(gd.leaves, f, 1.2); }
      if (cur === 'court' && ct) tickMotes(ct.dust, f, 0.3);
      if (cur === 'study' && sd) { sd.lampG.material.opacity = sd.lampG.userData.op * (0.92 + 0.08 * Math.sin(f * 0.8)); tickMotes(sd.dust, f, 0.3); }
      if (cur === 'bakery' && bk) { tickMotes(bk.dust, f, 0.4); const on = ST.mood === 'bakeryCN'; bk.beltC.forEach((c, i) => { const u = ((T * 0.18 + i / 14) % 1); c.position.set(-4.5 + 4.4 * u, 0.87, 1.45); c.rotation.y = i * 1.3; c.visible = on; }); } },
    mood: (name) => { ST.mood = name;
      if (bk) { const jp = name === 'bakeryJP', cl = name === 'bakeryClosed', cn = name === 'bakeryCN'; bk.sign.material = cn ? M.signBakCN : M.signBakJP; bk.sign.visible = !cl; bk.shut.visible = cl; bk.closed.visible = cl; bk.suitcase.visible = cl; bk.sheet.visible = cl;
        bk.jp.forEach((c) => (c.visible = !cl)); bk.boxes.visible = cn; bk.belt.visible = cn; bk.flourG.visible = !cl; bk.shaft.visible = !cl; bk.win.material.color.set(cl ? 0x1a2450 : 0x9ac0e0); bk.win.material.emissive.set(cl ? 0x0a1030 : 0x2a3a58); }
      if (sd) { sd.win.material = name === 'studyMap' ? M.winNight : M.winNight; } },
    apply: (v) => { if (v.cookie) API.setCookie(v.set, v.cookie); } });
  ky = buildKyoto(API.groups.kyoto); gd = buildGarden(API.groups.garden); ct = buildCourt(API.groups.court); sd = buildStudy(API.groups.study); bk = buildBakery(API.groups.bakery);
  API.parts = { ky, gd, ct, sd, bk };
  const heroOf = (set) => ({ kyoto: ky.hero, court: ct.hero, study: sd.hero }[GROUP_OF[set] || set]);
  API.setCookie = (set, st) => { const C = heroOf(set); if (C) setCookie(C, st); };
  API.hideCookies = () => { for (const C of [ky.hero, ct.hero, sd.hero]) C.visible = false; };
  // ship on the map: u 0..1 along the dashed route (map plane 3.9 x 2.0 at y 1.9, z ZB + 0.05)
  API.setShip = (u, on = true) => { const s = sd.ship; s.visible = on; const bz = (t, a, b, c, d) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d;
    const mx = bz(u, 0.31, 0.45, 0.7, 0.84), my = bz(u, 0.36, 0.24, 0.24, 0.4); s.position.set((mx - 0.5) * 3.9, 1.9 + (0.5 - my) * 2.0, -3.0 + 0.09); s.scale.setScalar(2.6); s.rotation.set(0, 0, 0); };
  API.setCrate = (st) => { const c = sd.crate; c.visible = st.on !== false; if (!c.visible) return; c.position.set(...st.p); c.rotation.set(0, st.ry || 0, st.rz || 0); };
  API.glows = { kyoto: [...ky.glows, ky.coalG], study: [sd.lampG], bakery: [bk.flourG] };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  const V = API.V;
  API.views = [
    V('kyotoNight', [-0.6, 1.25, 1.2], [-0.6, 1.0, -0.4], 40, 1.4, [-0.6, 1.0, -0.4], { cookie: { p: [-0.6, 1.0, -0.4], s: 0.12, expr: 'smile', slip: 0.6, msg: 'japan' } }), // 0 hook counter
    V('kyoto', [0.2, 1.6, 5.2], [0.2, 1.3, -1.4], 46, 1.0, [0.6, 1.1, -1.6]), // 1 shop front 1878
    V('kyotoToday', [-3.5, 1.7, 7.5], [0, 1.6, -1], 46, 0.8, [0, 1.4, -1]), // 2 street today
    V('garden', [1.5, 1.7, 7.0], [1.2, 1.2, -2.0], 46, 1.0, [2.6, 1.0, -0.8]), // 3 tea garden
    V('court', [0, 1.7, 5.4], [0, 1.5, -2.6], 48, 1.2, [0, 1.2, -1.2], { cookie: { p: [0, 1.06, -1.15], s: 0.14, expr: 'worried' } }), // 4 court
    V('study', [0.3, 1.45, 1.2], [0, 0.85, -0.65], 44, 1.6, [0, 0.82, -0.65]), // 5 book on desk
    V('studyMap', [0, 1.6, 2.8], [0, 1.8, -3.0], 44, 1.2, [0, 1.8, -3.0], { cookie: { p: [0.3, 0.8, -0.6], s: 0.14, expr: 'shock' } }), // 6 map
    V('bakeryJP', [1.0, 1.7, 4.4], [-0.6, 1.0, -1.4], 48, 1.2, [-0.6, 1.0, -1.2]), // 7 bakery 1910s
    V('bakeryClosed', [1.0, 1.7, 4.4], [-0.6, 1.0, -1.4], 48, 1.2, [-0.6, 1.0, -1.2]), // 8 closed 1942
    V('bakeryCN', [-1.4, 1.6, 4.6], [-1.8, 0.9, 0.6], 46, 1.2, [-2, 0.9, 1.4]), // 9 1950s conveyor
    V('kyotoDawn', [-0.6, 1.3, 1.5], [-0.6, 1.05, -0.4], 42, 1.4, [-0.6, 1.0, -0.4], { cookie: { p: [-0.6, 1.0, -0.4], s: 0.12, expr: 'smug', slip: 1, msg: 'past', crack: 0.6 } }), // 10 payoff
  ];
  API.hideCookies(); API.setShip(0, false); API.setCrate({ on: false }); API.tick(0);
  return API;
}
