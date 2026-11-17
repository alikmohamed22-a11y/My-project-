// mw_sets.js [MW-sets]: sets for "The microwave oven was invented after a candy bar melted" (Percy Spencer, Raytheon, 1945). Oddverra short.
//   kitchen : a modern kitchen at night. Countertop microwave (door on a hinge, glowing window, turntable, popcorn bag that puffs up,
//             live display 0:03 / 0:02 / 0:01 / END), tiled backsplash, cabinets, fridge, night window, pendant lamps, clutter, an island in the
//             foreground. CHOCO (the living candy bar, the sidekick) stands on the counter. Moods 'kitchenNight', 'kitchenEnd'.  (-148000,0,0)
//   lab     : a 1945 radar lab. The magnetron rig (copper finned anode between magnet blocks, waveguide and horn), racks with dials, an
//             oscilloscope, a rotating radar dish, blackboard, crates, ceiling lamps, a desk with the patent papers and a rubber stamp.
//             Story parts: a shirt-front insert with CHOCO melting in the pocket (labPocket), popcorn bursting out of a paper bag (instanced,
//             ballistic, settles on the bench and floor), an egg in a pot that bursts, and a yolk splat. Moods 'lab', 'labPocket',
//             'labWarm'.                                                                                                   (-148000,0,800)
//   inside  : "You see" void: a giant cut-open popcorn kernel full of water molecules that jiggle harder and glow hotter, wavy microwave
//             ribbons from an emitter horn, a thermometer that rises to HEAT. Mood 'inside'.                              (-148000,0,1600)
//   show    : a 1947 restaurant kitchen with the first microwave oven: a fridge-sized cabinet on a platform scale, a height post with a
//             sliding 6 FT marker, a dial needle that swings to 750 LB, a hanging price tag that counts up to $5,000, and a wall year counter
//             for the 20-year shrink (the cabinet shrinks). Moods 'show', 'showShrink'.                                     (-150500,0,0)
//   k67     : a sunny 1967 kitchen (avocado + harvest gold); a wood-grain countertop microwave drops onto the counter. Mood 'k67'.
//                                                                                                                     (-150500,0,800)
// No real logos or brand art anywhere: the ovens carry only generic plates. Each set: local frame, camera side +z. Test flag ?mwview=N.
import { H, TAU, clamp01, sm, SERIF, SANS, cyl, sph, plane, mesh, nond, lumpGeo, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit, rboxGeo } from './world.js';

export const MW_ORIGIN = { kitchen: [-148000, 0, 0], lab: [-148000, 0, 800], inside: [-148000, 0, 1600], show: [-150500, 0, 0], k67: [-150500, 0, 800] };
const GROUP_OF = { kitchenNight: 'kitchen', kitchenEnd: 'kitchen', lab: 'lab', labPocket: 'lab', labWarm: 'lab', inside: 'inside', show: 'show', showShrink: 'show', k67: 'k67' };
// story anchors (set-local)
export const MWP = { micro: [0, 0.92, -2.2], candyK: [0.52, 0.92, -2.02], horn: [0.36, 1.2, -1.4], bag: [1.24, 1.12, -0.98], egg: [0.6, 0.9, -1.42], torso: [-0.1, 0, -0.55], desk: [3.0, 0, 0.6], oven: [0, 0, -2.0], micro67: [0.1, 0.92, -2.2] };
let THREE, PT, M;
const INK = '#2b1d4a';

// ---------------------------------------------------------------- painters
function tileTex(o) { return (g, w, h) => { g.fillStyle = o.grout; g.fillRect(0, 0, w, h); const nx = o.nx, ny = o.ny, tw = w / nx, th = h / ny, R = PT.rng(o.seed || 5);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx + 1; i++) { const x = i * tw - (o.brick && j % 2 ? tw / 2 : 0), c = o.cols ? o.cols[(i + j * (o.chk ? 1 : 0)) % o.cols.length] : o.base, k = 0.92 + R() * 0.12;
    g.fillStyle = c; g.globalAlpha = 1; g.fillRect(x + 2, j * th + 2, tw - 4, th - 4); g.fillStyle = `rgba(255,255,255,${0.12 * k})`; g.fillRect(x + 4, j * th + 4, tw - 8, (th - 8) * 0.35); }
  PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, o.seed || 5)); }; }
function nightTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a1030'); gr.addColorStop(0.7, '#2a3070'); gr.addColorStop(1, '#4a3a6a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const R = PT.rng(11); g.fillStyle = '#fff'; for (let i = 0; i < 60; i++) { g.globalAlpha = 0.4 + R() * 0.6; g.fillRect(R() * w, R() * h * 0.6, 2, 2); } g.globalAlpha = 1;
  g.fillStyle = '#fff4d8'; g.beginPath(); g.arc(w * 0.72, h * 0.22, w * 0.07, 0, TAU); g.fill(); g.fillStyle = '#2a3070'; g.beginPath(); g.arc(w * 0.75, h * 0.2, w * 0.06, 0, TAU); g.fill();
  for (let i = 0; i < 14; i++) { const x = i * w / 14, bh = h * (0.12 + R() * 0.22); g.fillStyle = '#141838'; g.fillRect(x, h - bh, w / 14 - 3, bh); g.fillStyle = '#ffd070'; for (let k = 0; k < 6; k++) if (R() > 0.45) g.fillRect(x + 4 + (k % 2) * 10, h - bh + 8 + Math.floor(k / 2) * 14, 5, 6); } }
function dayTex(o = {}) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.top || '#6aa0e8'); gr.addColorStop(1, o.bot || '#d8ecff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,0.85)'; for (const [x, y, s] of [[0.25, 0.3, 1], [0.7, 0.2, 0.8], [0.55, 0.5, 0.6]]) for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(w * (x + k * 0.05 * s), h * (y - (k % 2) * 0.03), w * 0.07 * s, h * 0.05 * s, 0, 0, TAU); g.fill(); }
  if (o.trees) { g.fillStyle = o.trees; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(w * (i / 8), h * 0.95, w * 0.1, h * 0.2, 0, 0, TAU); g.fill(); } } }; }
function panelTex(g, w, h) { g.fillStyle = '#4a5450'; g.fillRect(0, 0, w, h); const R = PT.rng(45);
  for (let r = 0; r < 4; r++) { const y = h * (0.08 + r * 0.23); g.fillStyle = '#3a4240'; g.fillRect(8, y - 6, w - 16, h * 0.2); g.strokeStyle = '#2a302e'; g.lineWidth = 3; g.strokeRect(8, y - 6, w - 16, h * 0.2);
    for (let c = 0; c < 3; c++) { const cx = w * (0.2 + c * 0.3), cy = y + h * 0.08; if ((r + c) % 2 === 0) { g.fillStyle = '#f2ead6'; g.beginPath(); g.arc(cx, cy, h * 0.06, Math.PI, 0); g.lineTo(cx + h * 0.06, cy + 6); g.lineTo(cx - h * 0.06, cy + 6); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
        g.strokeStyle = '#c0302a'; g.lineWidth = 3; const a = Math.PI + 0.4 + R() * 2.2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * h * 0.05, cy + Math.sin(a) * h * 0.05); g.stroke(); }
      else { g.fillStyle = '#1a1a1e'; g.beginPath(); g.arc(cx, cy, h * 0.035, 0, TAU); g.fill(); g.fillStyle = '#c8c8d0'; g.fillRect(cx - 2, cy - h * 0.035, 4, h * 0.03); } }
    for (let k = 0; k < 5; k++) { g.fillStyle = R() > 0.5 ? '#ff5a3a' : '#7aff7a'; g.beginPath(); g.arc(w * (0.12 + k * 0.18), y + h * 0.17, 4, 0, TAU); g.fill(); } }
  PT.modulate(g, w, h, (u, v) => 0.88 + 0.16 * PT.fbm(u, v, 4, 4, 3, 7)); }
function scopeTex(g, w, h) { g.fillStyle = '#0a2a14'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(80,200,120,0.35)'; g.lineWidth = 1; for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(i * w / 8, 0); g.lineTo(i * w / 8, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 8); g.lineTo(w, i * h / 8); g.stroke(); }
  g.strokeStyle = '#9aff9a'; g.lineWidth = 4; g.shadowColor = '#5aff7a'; g.shadowBlur = 10; g.beginPath(); for (let x = 0; x <= w; x += 2) { const y = h / 2 + Math.sin(x / w * TAU * 4) * h * 0.28; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.shadowBlur = 0; }
function boardTex(g, w, h) { g.fillStyle = '#26382e'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.85 + 0.3 * PT.fbm(u, v, 6, 3, 3, 8)); g.strokeStyle = 'rgba(240,240,230,0.85)'; g.lineWidth = 4; g.lineCap = 'round';
  for (const [y, k, a] of [[0.3, 3, 0.1], [0.55, 6, 0.07]]) { g.beginPath(); for (let x = w * 0.06; x <= w * 0.62; x += 3) { const yy = h * y + Math.sin((x - w * 0.06) / (w * 0.56) * TAU * k) * h * a; x > w * 0.06 ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }
  txt(g, 'RADAR', w * 0.8, h * 0.22, w * 0.3, h * 0.13, { col: 'rgba(240,240,230,0.9)', font: SERIF, bold: false }); g.beginPath(); g.moveTo(w * 0.68, h * 0.5); g.lineTo(w * 0.9, h * 0.5); g.lineTo(w * 0.86, h * 0.45); g.moveTo(w * 0.9, h * 0.5); g.lineTo(w * 0.86, h * 0.55); g.stroke();
  txt(g, 'f = c / λ', w * 0.3, h * 0.82, w * 0.4, h * 0.12, { col: 'rgba(240,240,230,0.85)', font: SERIF, bold: false, italic: true }); txt(g, 'MAGNETRON', w * 0.78, h * 0.78, w * 0.36, h * 0.1, { col: 'rgba(255,240,180,0.85)', font: SERIF, bold: false }); }
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); if (o.hazard) { g.save(); g.beginPath(); g.rect(0, 0, w, h * 0.22); g.rect(0, h * 0.78, w, h * 0.22); g.clip(); for (let x = -h; x < w + h; x += h * 0.4) { g.fillStyle = '#1a1a1e'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h * 0.2, 0); g.lineTo(x + h * 0.2 - h, h); g.lineTo(x - h, h); g.fill(); } g.restore(); }
  PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 6, 2, 3, 7)); g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.05; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08);
  const y0 = o.hazard ? 0.5 : lines.length === 1 ? 0.54 : 0.34; lines.forEach((s, i) => txt(g, s, w / 2, h * (y0 + (o.hazard ? (i - (lines.length - 1) / 2) * 0.24 : i * 0.36)), w * 0.86, h * (lines.length === 1 ? 0.5 : o.hazard ? 0.2 : 0.3), { col: o.col || '#3a2414', font: o.font || SANS })); }; }
function calTex(year, o = {}) { return (g, w, h) => { g.fillStyle = '#fbf6e8'; g.fillRect(0, 0, w, h); g.fillStyle = o.top || '#c0453a'; g.fillRect(0, 0, w, h * 0.3); txt(g, year, w / 2, h * 0.16, w * 0.8, h * 0.2, { col: '#fff', font: SANS });
  g.fillStyle = 'rgba(60,40,40,0.6)'; for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) g.fillRect(w * (0.08 + c * 0.125), h * (0.38 + r * 0.12), w * 0.08, h * 0.07); }; }
function docTex(filed) { return (g, w, h) => { g.fillStyle = '#f6f0de'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 3));
  txt(g, 'PATENT APPLICATION', w / 2, h * 0.09, w * 0.84, h * 0.06, { col: '#2a2440', font: SERIF }); txt(g, 'Method of Treating Foodstuffs', w / 2, h * 0.17, w * 0.84, h * 0.05, { col: '#2a2440', font: SERIF, bold: false, italic: true });
  g.fillStyle = 'rgba(50,40,60,0.5)'; for (let i = 0; i < 9; i++) g.fillRect(w * 0.1, h * (0.27 + i * 0.045), w * (i % 4 === 3 ? 0.5 : 0.8), 4);
  g.strokeStyle = '#2a2440'; g.lineWidth = 3; g.strokeRect(w * 0.2, h * 0.7, w * 0.6, h * 0.2); g.beginPath(); g.moveTo(w * 0.3, h * 0.86); g.lineTo(w * 0.3, h * 0.74); g.lineTo(w * 0.62, h * 0.74); g.lineTo(w * 0.62, h * 0.86); g.stroke();
  for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(w * (0.4 + i * 0.04), h * 0.8, 6, 5, 0, 0, TAU); g.stroke(); }
  txt(g, 'Oct. 8, 1945', w * 0.75, h * 0.95, w * 0.3, h * 0.035, { col: '#2a2440', font: SERIF, bold: false, italic: true });
  if (filed) { g.save(); g.translate(w * 0.62, h * 0.52); g.rotate(-0.25); g.strokeStyle = 'rgba(200,30,40,0.92)'; g.lineWidth = 8; g.strokeRect(-w * 0.3, -h * 0.07, w * 0.6, h * 0.14); txt(g, 'FILED 1945', 0, 2, w * 0.54, h * 0.09, { col: 'rgba(200,30,40,0.92)', font: SANS }); g.restore(); } }; }
function rulerTex(g, w, h) { g.fillStyle = '#e8c890'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.88 + 0.16 * PT.fbm(u, v, 2, 12, 3, 9)); g.fillStyle = INK; const ft = h / 6.5;
  for (let i = 0; i <= 78; i++) { const y = h - i * ft / 12, L = i % 12 === 0 ? 0.6 : i % 6 === 0 ? 0.35 : 0.18; g.fillRect(0, y - 1.5, w * L, 3); }
  for (let k = 1; k <= 6; k++) txt(g, String(k), w * 0.72, h - k * ft + ft * 0.08, w * 0.5, ft * 0.32, { col: INK, font: SANS }); txt(g, 'FT', w * 0.72, h - 6.3 * ft, w * 0.5, ft * 0.2, { col: '#a02a2a', font: SANS }); }
function dialTex(g, w, h) { g.fillStyle = '#f6f0e0'; g.beginPath(); g.arc(w / 2, h / 2, w * 0.48, 0, TAU); g.fill(); g.lineWidth = w * 0.03; g.strokeStyle = '#3a3a44'; g.stroke();
  for (let i = 0; i <= 40; i++) { const a = -Math.PI * 0.75 + i / 40 * Math.PI * 1.5 - Math.PI / 2, r0 = w * (i % 5 ? 0.4 : 0.36); g.strokeStyle = INK; g.lineWidth = i % 5 ? 2 : 4; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * r0, h / 2 + Math.sin(a) * r0); g.lineTo(w / 2 + Math.cos(a) * w * 0.44, h / 2 + Math.sin(a) * w * 0.44); g.stroke();
    if (i % 10 === 0) txt(g, String(i * 20), w / 2 + Math.cos(a) * w * 0.28, h / 2 + Math.sin(a) * w * 0.28, w * 0.16, w * 0.07, { col: INK, font: SANS }); }
  g.fillStyle = 'rgba(200,40,40,0.25)'; g.beginPath(); g.moveTo(w / 2, h / 2); g.arc(w / 2, h / 2, w * 0.44, -Math.PI * 0.75 - Math.PI / 2 + 37 / 40 * Math.PI * 1.5, -Math.PI * 0.75 - Math.PI / 2 + Math.PI * 1.5); g.fill();
  txt(g, 'LB', w / 2, h * 0.72, w * 0.2, w * 0.08, { col: '#a02a2a', font: SANS }); }
function menuTex(g, w, h) { g.fillStyle = '#1e2a26'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.85 + 0.25 * PT.fbm(u, v, 4, 4, 3, 2)); txt(g, 'MENU', w / 2, h * 0.12, w * 0.6, h * 0.1, { col: '#f6e8c0', font: SERIF });
  const items = ['HOT DOG', 'SOUP', 'PIE', 'COFFEE', 'SANDWICH']; items.forEach((s, i) => { txt(g, s, w * 0.38, h * (0.3 + i * 0.14), w * 0.5, h * 0.07, { col: '#f6e8c0', font: SERIF, bold: false }); txt(g, (5 + i * 5) + '¢', w * 0.82, h * (0.3 + i * 0.14), w * 0.2, h * 0.07, { col: '#ffd070', font: SERIF, bold: false }); }); }
function adTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f8e0a0'); gr.addColorStop(1, '#e89a5a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  txt(g, 'COOKS IN', w / 2, h * 0.12, w * 0.8, h * 0.08, { col: '#8a2a2a', font: SANS }); txt(g, 'SECONDS!', w / 2, h * 0.22, w * 0.84, h * 0.1, { col: '#8a2a2a', font: SANS });
  g.fillStyle = '#e8e2d0'; g.strokeStyle = INK; g.lineWidth = 6; g.fillRect(w * 0.3, h * 0.32, w * 0.4, h * 0.56); g.strokeRect(w * 0.3, h * 0.32, w * 0.4, h * 0.56); g.fillStyle = '#3a3040'; g.fillRect(w * 0.37, h * 0.48, w * 0.26, h * 0.12);
  for (let i = 0; i < 3; i++) { g.fillStyle = '#3a3a44'; g.beginPath(); g.arc(w * (0.4 + i * 0.1), h * 0.4, 8, 0, TAU); g.fill(); } txt(g, 'THE FUTURE OF COOKING', w / 2, h * 0.94, w * 0.86, h * 0.05, { col: '#5a1a1a', font: SANS }); PT.modulate(g, w, h, (u, v) => 0.9 + 0.14 * PT.fbm(u, v, 4, 4, 3, 4)); }
function wallpaper67(g, w, h) { g.fillStyle = '#e8a040'; g.fillRect(0, 0, w, h); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const cx = (x + (y % 2) * 0.5) * w / 4 + w / 8, cy = y * h / 4 + h / 8;
  for (const [r, c] of [[w * 0.11, '#c8582a'], [w * 0.075, '#f4d070'], [w * 0.04, '#8a9a3a']]) { g.fillStyle = c; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); } } PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, 6)); }
function woodTex(g, w, h) { g.fillStyle = '#8a5a30'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => { const f = Math.sin(v * 40 + Math.sin(u * 6) * 2 + PT.fbm(u, v, 3, 8, 2, 4) * 6); return 0.8 + 0.18 * f * f; }); }
function gingham(g, w, h) { g.fillStyle = '#fff6ea'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(210,60,60,0.45)'; for (let i = 0; i < 8; i++) { g.fillRect(i * w / 8, 0, w / 16, h); g.fillRect(0, i * h / 8, w, h / 16); } }
function bgTex(g, w, h) { const gr = g.createRadialGradient(w / 2, h * 0.45, 10, w / 2, h / 2, w * 0.7); gr.addColorStop(0, '#2a3a8a'); gr.addColorStop(0.5, '#141c4a'); gr.addColorStop(1, '#060820'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(120,150,255,0.12)'; g.lineWidth = 2; for (let i = 0; i < 24; i++) { g.beginPath(); g.moveTo(i * w / 24, 0); g.lineTo(i * w / 24, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 24); g.lineTo(w, i * h / 24); g.stroke(); }
  const R = PT.rng(9); g.fillStyle = '#fff'; for (let i = 0; i < 120; i++) { g.globalAlpha = 0.2 + R() * 0.5; g.beginPath(); g.arc(R() * w, R() * h, 1 + R() * 2, 0, TAU); g.fill(); } g.globalAlpha = 1; }
function thermoTex(g, w, h) { g.fillStyle = '#f6f0e4'; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 3; for (let i = 0; i <= 10; i++) { const y = h * (0.9 - i * 0.075); g.beginPath(); g.moveTo(w * 0.62, y); g.lineTo(w * (i % 5 ? 0.78 : 0.9), y); g.stroke(); }
  txt(g, 'HEAT', w / 2, h * 0.06, w * 0.9, h * 0.05, { col: '#c0302a', font: SANS }); }
// CHOCO's face (bean eyes with the ringed-planet shine, blush, small mouth); expr: happy | nervous | shock | melty | wink | proud
function faceTex(expr) { return (g, w, h) => { g.clearRect(0, 0, w, h); const ey = h * 0.42, ex = w * 0.2;
  const bean = (x, s = 1, sy = 1) => { g.fillStyle = INK; g.beginPath(); g.ellipse(x, ey, w * 0.075 * s, h * 0.12 * s * sy, 0, 0, TAU); g.fill(); if (sy > 0.4) { g.fillStyle = '#fff'; g.beginPath(); g.arc(x - w * 0.025 * s, ey - h * 0.05 * s, w * 0.022 * s, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = w * 0.008; g.beginPath(); g.ellipse(x - w * 0.025 * s, ey - h * 0.05 * s, w * 0.04 * s, w * 0.012 * s, -0.4, 0, TAU); g.stroke(); } };
  const arcEye = (x) => { g.strokeStyle = INK; g.lineWidth = w * 0.03; g.lineCap = 'round'; g.beginPath(); g.arc(x, ey + h * 0.03, w * 0.06, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); };
  if (expr === 'wink') { bean(-ex + w / 2); arcEye(ex + w / 2); } else if (expr === 'melty') { for (const s of [-1, 1]) { bean(w / 2 + s * ex, 0.9, 0.55); g.fillStyle = '#7a4a2a'; g.fillRect(w / 2 + s * ex - w * 0.08, ey - h * 0.14, w * 0.16, h * 0.1); } }
  else if (expr === 'shock') { for (const s of [-1, 1]) bean(w / 2 + s * ex, 1.15, 1.1); } else { for (const s of [-1, 1]) bean(w / 2 + s * ex); }
  g.fillStyle = 'rgba(255,120,150,0.55)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(w / 2 + s * w * 0.3, h * 0.6, w * 0.07, h * 0.045, 0, 0, TAU); g.fill(); }
  g.strokeStyle = INK; g.fillStyle = '#7a2a3a'; g.lineWidth = w * 0.025; g.lineCap = 'round'; g.beginPath();
  if (expr === 'shock') { g.ellipse(w / 2, h * 0.7, w * 0.045, h * 0.06, 0, 0, TAU); g.fill(); g.stroke(); }
  else if (expr === 'nervous' || expr === 'melty') { g.moveTo(w * 0.4, h * 0.68); for (let i = 1; i <= 4; i++) g.lineTo(w * (0.4 + i * 0.05), h * (0.68 + (i % 2 ? 0.03 : 0))); g.stroke(); }
  else { g.arc(w / 2, h * 0.62, w * (expr === 'proud' ? 0.08 : 0.06), 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
  if (expr === 'nervous' || expr === 'melty' || expr === 'shock') { g.fillStyle = '#9ad8ff'; g.strokeStyle = INK; g.lineWidth = w * 0.012; g.beginPath(); const sx = w * 0.84, sy = h * 0.3; g.moveTo(sx, sy - h * 0.08); g.quadraticCurveTo(sx + w * 0.05, sy + h * 0.02, sx, sy + h * 0.03); g.quadraticCurveTo(sx - w * 0.05, sy + h * 0.02, sx, sy - h * 0.08); g.fill(); g.stroke(); } }; }
function wrapTex(g, w, h) { g.fillStyle = '#d8283a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4c430'; g.fillRect(0, h * 0.08, w, h * 0.05); g.fillRect(0, h * 0.87, w, h * 0.05); PT.modulate(g, w, h, (u, v) => 0.9 + 0.14 * PT.fbm(u, v, 3, 6, 3, 5));
  g.save(); g.translate(w / 2, h * 0.5); g.rotate(-Math.PI / 2); txt(g, 'CANDY', 0, 0, h * 0.6, w * 0.22, { col: '#fff4d8', font: SANS, stroke: '#7a1020', sw: 6 }); g.restore(); }
function bagTex(g, w, h) { g.fillStyle = '#f2ead6'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8283a'; for (let i = 0; i < 6; i++) g.fillRect(i * w / 6, 0, w / 12, h); g.fillStyle = '#fff6e0'; g.fillRect(w * 0.12, h * 0.3, w * 0.76, h * 0.4); txt(g, 'POPCORN', w / 2, h * 0.5, w * 0.7, h * 0.18, { col: '#c0202a', font: SANS }); }
function dispTex(s) { return (g, w, h) => { g.fillStyle = '#0a0c10'; g.fillRect(0, 0, w, h); txt(g, s, w / 2, h * 0.55, w * 0.9, h * 0.7, { col: '#7affa8', font: SANS, bold: true }); }; }
function priceTex(g, w, h) { g.fillStyle = '#f6eed6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#a02a2a'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = '#5a4030'; g.beginPath(); g.arc(w * 0.12, h / 2, 12, 0, TAU); g.fill(); }
function yearTex(g, w, h) { g.fillStyle = '#1a1a22'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { g.fillStyle = '#2e2e38'; g.fillRect(w * (0.03 + i * 0.24), h * 0.08, w * 0.22, h * 0.84); } }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.wall = vc(); m.floorK = vc({ map: T(512, 512, tileTex({ grout: '#8a8a94', nx: 6, ny: 6, cols: ['#d8d4cc', '#c8c4bc'], chk: 1, seed: 3 }), [1 / 1.2, 1 / 1.2]) });
  m.splash = vc({ map: T(512, 256, tileTex({ grout: '#c8ccd4', nx: 8, ny: 8, base: '#eef2f6', brick: 1, seed: 4 }), [1 / 1.4, 1 / 0.7]) });
  m.floorL = vc({ map: T(512, 512, tileTex({ grout: '#3a3a30', nx: 4, ny: 4, cols: ['#2e4a3a', '#d8d0b8'], chk: 1, seed: 6 }), [1 / 1.2, 1 / 1.2]) });
  m.floorS = vc({ map: T(512, 512, tileTex({ grout: '#5a4a4a', nx: 4, ny: 4, cols: ['#b8302a', '#f2ead8'], chk: 1, seed: 8 }), [1 / 1.0, 1 / 1.0]) });
  m.tileS = vc({ map: T(512, 256, tileTex({ grout: '#9a9a92', nx: 8, ny: 4, base: '#d8dcd4', seed: 9 }), [1 / 1.6, 1 / 0.8]) });
  m.floor67 = vc({ map: T(512, 512, tileTex({ grout: '#6a5a3a', nx: 3, ny: 3, cols: ['#d8b860', '#c8a050'], chk: 1, seed: 10 }), [1 / 1.0, 1 / 1.0]) });
  m.paper67 = vc({ map: T(512, 512, wallpaper67, [1 / 1.6, 1 / 1.6]) }); m.wood = vc({ map: T(256, 512, woodTex) }); m.gingham = vc({ map: T(256, 256, gingham, [2, 2]) });
  m.plank = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a6040', n: 8, seed: 51 })) }); m.steel = vc({ emissive: 0x101014 }); m.copper = vc({ emissive: 0x2a1006 });
  m.night = new THREE.MeshBasicMaterial({ map: T(512, 512, nightTex), fog: false }); m.day = new THREE.MeshBasicMaterial({ map: T(512, 512, dayTex({ trees: '#4a8a4a' })), fog: false }); m.day.color.setScalar(1.15);
  m.day67 = new THREE.MeshBasicMaterial({ map: T(512, 512, dayTex({ top: '#5ab0f0', bot: '#fff0c8', trees: '#5a9a3a' })), fog: false }); m.day67.color.setScalar(1.15);
  m.panel = em(T(256, 512, panelTex), 0x141414); m.scope = new THREE.MeshBasicMaterial({ map: T(256, 192, scopeTex), fog: false }); m.scope.color.setScalar(1.2);
  m.board = em(T(1024, 512, boardTex), 0x101810); m.cal45 = em(T(200, 260, calTex('1945')), 0x302820); m.cal67 = em(T(200, 260, calTex('1967', { top: '#e8702a' })), 0x302820);
  m.danger = em(T(512, 256, signTex(['DANGER', 'HIGH VOLTAGE'], { bg: '#f4d030', col: '#1a1a1e', rim: '#1a1a1e', hazard: 1 })), 0x202010);
  m.crate = vc({ map: T(512, 512, (g, w, h) => { PT.planks(g, w, h, { base: '#b08a5a', n: 5, seed: 7 }); txt(g, 'MAGNETRON', w / 2, h * 0.42, w * 0.8, h * 0.12, { col: 'rgba(40,30,30,0.8)', font: SANS }); txt(g, 'TUBES · FRAGILE', w / 2, h * 0.6, w * 0.8, h * 0.08, { col: 'rgba(160,30,30,0.85)', font: SANS }); }) });
  m.lab = em(T(1024, 180, signTex(['RADAR LAB'], { bg: '#e8e2d0', col: '#2a3a5a', rim: '#2a3a5a' })), 0x202020);
  m.doc = em(T(512, 700, docTex(false)), 0x0c0a08); m.docF = em(T(512, 700, docTex(true)), 0x0c0a08);
  m.ruler = em(T(128, 1024, rulerTex), 0x302010); m.dial = em(T(512, 512, dialTex), 0x303030); m.menu = em(T(400, 520, menuTex), 0x101010); m.ad = em(T(400, 560, adTex), 0x302010);
  m.plate47 = em(T(512, 128, signTex(['MICROWAVE OVEN'], { bg: '#c8ccd4', col: '#2a2a36', rim: '#2a2a36' })), 0x202020);
  m.bg = new THREE.MeshBasicMaterial({ map: T(1024, 1024, bgTex), side: THREE.BackSide, fog: false });
  m.thermo = em(T(128, 1024, thermoTex), 0x302820); m.emit = em(T(1024, 180, signTex(['MICROWAVES'], { bg: '#2a1a4a', col: '#e8c8ff', rim: '#c8a0ff' })), 0x6040a0);
  m.wrap = em(T(256, 512, wrapTex), 0x3a0a10); m.choc = toon({ color: 0x6a3a1e, emissive: 0x1a0804 }); m.bagT = em(T(256, 256, bagTex), 0x302020);
  m.faces = {}; for (const e of ['happy', 'nervous', 'shock', 'melty', 'wink', 'proud']) m.faces[e] = new THREE.MeshBasicMaterial({ map: T(256, 256, faceTex(e)), transparent: true, depthWrite: false, fog: false });
  m.glass = toon({ color: 0x2a2a38, emissive: 0x0a0a14 }); m.glassOn = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc860).multiplyScalar(1.15), fog: false });
  m.yolk = new THREE.MeshBasicMaterial({ map: T(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#fff8e8'; const R = PT.rng(5); g.beginPath(); for (let i = 0; i <= 18; i++) { const a = i / 18 * TAU, r = w * (0.3 + 0.14 * R()); i ? g.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r) : g.moveTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); g.fillStyle = '#ffb820'; g.beginPath(); g.arc(w * 0.48, h * 0.52, w * 0.15, 0, TAU); g.fill(); g.stroke(); for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(w * (0.1 + R() * 0.8), h * (0.1 + R() * 0.8), 6 + R() * 8, 0, TAU); g.fillStyle = '#fff8e8'; g.fill(); } }), transparent: true, depthWrite: false, fog: false });
  return m; }

// ---------------------------------------------------------------- props
const tintM = (m, hex) => { const c = new THREE.Color(hex), a = m.geometry.attributes.position.count, arr = new Float32Array(a * 3); for (let i = 0; i < a; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; } m.geometry = m.geometry.clone(); m.geometry.setAttribute('color', new THREE.Float32BufferAttribute(arr, 3)); return m; };
const rb = (w, h, d, r = 0.02) => rboxGeo(w, h, d, r);
const cmesh = (p, geo, hex, x, y, z, rx = 0, ry = 0, rz = 0, mat) => tintM(mesh(p, geo, mat || M.paint, x, y, z, rx, ry, rz), hex);
// CHOCO: a standing candy bar (origin at its feet), wrapper below, chocolate top, a face, drips and a puddle; setCandy drives melt/expr
function makeCandy() { const G = new THREE.Group(), body = new THREE.Group(); G.add(body);
  const wrap = mesh(body, rb(0.12, 0.17, 0.05, 0.012), M.wrap, 0, 0.085, 0); const choc = mesh(body, rb(0.112, 0.13, 0.044, 0.02), M.choc, 0, 0.23, 0);
  for (let i = 0; i < 2; i++) tintM(mesh(choc, rb(0.1, 0.008, 0.046, 0.003), M.paint, 0, -0.03 + i * 0.04, 0), 0x4a2410);
  const ends = []; for (const s of [-1, 1]) ends.push(cmesh(body, rb(0.13, 0.012, 0.056, 0.004), 0xf4c430, 0, 0.17 + 0 * s, 0)); ends[0].position.y = 0.168; ends[1].visible = false;
  const face = nond(mesh(body, plane(0.11, 0.11), M.faces.happy, 0, 0.1, 0.0265, 0, 0, 0, false)); face.renderOrder = 8;
  const drips = []; for (let i = 0; i < 3; i++) { const d = mesh(body, sph(0.014, 10, 8), M.choc, [-0.062, 0.062, 0.03][i], 0.17, [0.0, 0.0, -0.024][i]); drips.push(d); }
  const puddle = mesh(G, cyl(0.1, 0.1, 0.006, 24), M.choc, 0, 0.003, 0.02, 0, 0, 0, false); puddle.scale.set(0.01, 1, 0.01);
  G.userData = { body, choc, face, drips, puddle, wrap }; return G; }
function setCandyG(G, c) { if (!c || c.on === false) { G.visible = false; return; } G.visible = true; const U = G.userData, m = clamp01(c.melt || 0), t = c.t || 0;
  G.position.set(...c.p); G.rotation.set(0, c.ry || 0, 0); G.scale.setScalar(c.s || 1);
  const bo = c.bounce || 0; U.body.position.y = Math.abs(Math.sin(t * 0.25)) * 0.02 * bo; U.body.rotation.z = (c.lean || 0) + 0.06 * Math.sin(t * 0.13) * (1 - m) + 0.18 * m * Math.sin(t * 0.05);
  U.body.scale.set(1 + 0.08 * m + 0.05 * bo * Math.sin(t * 0.5), 1 - 0.16 * m - 0.04 * bo * Math.sin(t * 0.5), 1);
  U.choc.scale.set(1 + 0.25 * m, 1 - 0.45 * m, 1 + 0.2 * m); U.choc.position.y = 0.23 - 0.03 * m; U.choc.rotation.z = 0.25 * m;
  U.drips.forEach((d, i) => { const k = clamp01(m * 1.6 - i * 0.2); d.visible = k > 0.02; d.scale.set(0.75, 1 + 6 * k, 0.75); d.position.y = 0.15 - 0.06 * k - i * 0.01; });
  U.puddle.visible = !!c.puddle && m > 0.05; U.puddle.scale.set(0.2 + 1.3 * m, 1, 0.2 + 0.8 * m);
  U.face.material = M.faces[c.expr || 'happy'] || M.faces.happy; U.face.position.y = 0.1 + (c.peek || 0); }
// modern microwave (origin bottom centre, front at +z): body, door on a left hinge with window, keypad + live display, cavity, turntable, bag
function makeMicro(o = {}) { const G = new THREE.Group(), W = o.w || 0.56, Ht = o.h || 0.33, D = o.d || 0.42;
  const bc = o.body || 0x2a2a32, cx0 = -W / 2 + 0.03, cx1 = W / 2 - W * 0.27, ccx = (cx0 + cx1) / 2, cw = cx1 - cx0;
  for (const [w, h, d, x, y, z] of [[W, 0.035, D, 0, 0.0175, 0], [W, 0.035, D, 0, Ht - 0.0175, 0], [W, Ht, 0.03, 0, Ht / 2, -D / 2 + 0.015], [0.03, Ht, D, -W / 2 + 0.015, Ht / 2, 0], [W / 2 - cx1, Ht, D, (W / 2 + cx1) / 2, Ht / 2, 0]]) tintM(mesh(G, rb(w, h, d, 0.012), M.steel, x, y, z), bc);
  const lc = o.cav || 0xc8c8c0; for (const [w, h, x, y, z, rx, ry] of [[cw, Ht - 0.07, ccx, Ht / 2, -D / 2 + 0.032, 0, 0], [cw, D - 0.06, ccx, 0.036, 0, -Math.PI / 2, 0], [cw, D - 0.06, ccx, Ht - 0.036, 0, Math.PI / 2, 0], [D - 0.06, Ht - 0.07, cx0 + 0.001, Ht / 2, 0, 0, Math.PI / 2], [D - 0.06, Ht - 0.07, cx1 - 0.001, Ht / 2, 0, 0, -Math.PI / 2]]) tintM(mesh(G, plane(w, h), M.paint, x, y, z, rx, ry, 0, false), lc);
  const lit = nond(mesh(G, plane(cw * 0.96, (Ht - 0.07) * 0.96), M.glassOn.clone(), ccx, Ht / 2, -D / 2 + 0.034, 0, 0, 0, false)); lit.material.transparent = true;
  const tt = cmesh(G, cyl(0.13, 0.13, 0.012, 24), 0xd8e0e8, ccx, 0.045, 0.0);
  const bag = new THREE.Group(); bag.position.set(ccx, 0.052, 0.0); G.add(bag); const bagM = mesh(bag, rb(0.16, 0.03, 0.1, 0.012), M.bagT, 0, 0.015, 0);
  const hinge = new THREE.Group(); hinge.position.set(-W / 2, Ht / 2, D / 2 + 0.006); G.add(hinge);
  tintM(mesh(hinge, rb(W * 0.76, Ht * 0.94, 0.03, 0.012), M.steel, W * 0.38, 0, 0.0), o.door || 0x1e1e24); const win = mesh(hinge, plane(W * 0.56, Ht * 0.62), M.glass, W * 0.36, 0, 0.017, 0, 0, 0, false);
  const winOn = nond(mesh(hinge, plane(W * 0.56, Ht * 0.62), M.glassOn.clone(), W * 0.36, 0, 0.0175, 0, 0, 0, false)); winOn.material.transparent = true; winOn.renderOrder = 3;
  cmesh(hinge, rb(0.02, Ht * 0.6, 0.03, 0.008), o.handle || 0xb8bcc8, W * 0.71, 0, 0.03);
  const pad = cmesh(G, rb(W * 0.2, Ht * 0.9, 0.02, 0.006), o.pad || 0x1a1a20, W * 0.39, Ht / 2, D / 2 + 0.006);
  const dispC = document.createElement('canvas'); dispC.width = 256; dispC.height = 96; const dispT = new THREE.CanvasTexture(dispC); dispT.colorSpace = THREE.SRGBColorSpace;
  const disp = nond(mesh(G, plane(W * 0.16, Ht * 0.16), new THREE.MeshBasicMaterial({ map: dispT, fog: false }), W * 0.39, Ht * 0.78, D / 2 + 0.018, 0, 0, 0, false));
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) cmesh(G, rb(0.022, 0.016, 0.008, 0.003), 0x5a5a66, W * 0.39 + (c - 1) * 0.03, Ht * (0.55 - r * 0.1), D / 2 + 0.018);
  G.userData = { hinge, lit, winOn, tt, bag, bagM, disp, dispC, dispT, last: '' }; return G; }
function setMicroG(G, s, f) { const U = G.userData; U.hinge.rotation.y = -(s.open || 0) * 1.9; const on = s.on || 0; U.lit.visible = U.winOn.visible = on > 0.01; U.lit.material.opacity = 0.55 * on; U.winOn.material.opacity = 0.42 * on * (0.94 + 0.06 * Math.sin(f * 0.9));
  U.tt.rotation.y = (s.spin || 0); U.bag.rotation.y = (s.spin || 0); const b = s.bag ?? 0; U.bag.visible = b >= 0; U.bag.scale.set(1 + 0.12 * b, 1 + 2.6 * b, 1 + 0.25 * b);
  const str = s.disp || ''; if (str !== U.last) { U.last = str; const g = U.dispC.getContext('2d'); dispTex(str)(g, 256, 96); U.dispT.needsUpdate = true; } }
function tree(K, x, y, z, s) { K.put(M.paint, cyl(0.12 * s, 0.16 * s, 0.28 * s, 12), x, y + 0.14 * s, z, 0, 0, 0, 1, 1, 1, 0xc8643a); for (let i = 0; i < 5; i++) K.put(M.paint, lumpGeo(i + 3, 1, 0.3), x + Math.cos(i * 1.3) * 0.08 * s, y + 0.36 * s + (i % 2) * 0.08 * s, z + Math.sin(i * 1.3) * 0.08 * s, 0, i, 0, 0.13 * s, 0.13 * s, 0.13 * s, [0x3a8a4a, 0x4a9a52][i % 2]); }
function lampShade(K, root, x, y, z, col = 0x2a5a4a) { K.beam(M.steel, [x, y + 0.6, z], [x, y + 0.15, z], 0.01, 0x2a2a30, true, 6); K.put(M.paint, new THREE.ConeGeometry(0.22, 0.2, 20, 1, true), x, y + 0.08, z, 0, 0, 0, 1, 1, 1, col);
  K.put(M.paint, sph(0.05, 10, 8), x, y, z, 0, 0, 0, 1, 1, 1, 0xfff0c0); return glowAt(root, [x, y - 0.02, z], 0.9, '#ffd890', 0.5); }

// ================================================================= KITCHEN (modern, night)
function buildKitchen(root) { const K = new Kit(), X = 4, ZB = -2.6, HT = 2.7;
  K.box(M.floorK, -X, X, -0.05, 0, ZB, 4.5, 0xffffff, 0.01);
  K.box(M.wall, -X, X, 0, HT, ZB - 0.2, ZB, 0x3a4468, 0.01); K.box(M.wall, -X - 0.2, -X, 0, HT, ZB, 4.5, 0x3a4468, 0.01); K.box(M.wall, X, X + 0.2, 0, HT, ZB, 4.5, 0x3a4468, 0.01);
  K.box(M.splash, -X, X, 0.92, 1.52, ZB, ZB + 0.02, 0xffffff, 0.005);
  // base cabinets + counter, upper cabinets, fridge, window
  K.box(M.paint, -3.6, 2.5, 0.08, 0.88, ZB, ZB + 0.62, 0xb8bcc8, 0.02); K.box(M.paint, -3.6, 2.5, 0, 0.08, ZB, ZB + 0.56, 0x3a3a44, 0.01);
  for (let i = 0; i < 10; i++) { const x = -3.55 + i * 0.6; K.box(M.paint, x, x + 0.57, 0.12, 0.85, ZB + 0.62, ZB + 0.64, 0x5a6a8a, 0.01); K.box(M.steel, x + 0.2, x + 0.37, 0.76, 0.785, ZB + 0.64, ZB + 0.665, 0xb8bcc8, 0.005); }
  K.box(M.paint, -3.65, 2.55, 0.88, 0.92, ZB, ZB + 0.68, 0x34343e, 0.01);
  for (const [a, b] of [[-3.6, -2.6], [-0.9, 2.5]]) { K.box(M.paint, a, b, 1.55, 2.3, ZB, ZB + 0.36, 0xb8bcc8, 0.02); for (let x = a; x < b - 0.1; x += 0.5) { K.box(M.paint, x + 0.02, x + 0.48, 1.58, 2.27, ZB + 0.36, ZB + 0.38, 0x6a7a98, 0.01); K.box(M.steel, x + 0.4, x + 0.42, 1.62, 1.78, ZB + 0.38, ZB + 0.4, 0xb8bcc8, 0.004); } }
  K.box(M.steel, 2.6, 3.5, 0, 2.05, ZB, ZB + 0.72, 0xc8ccd6, 0.03); K.box(M.steel, 2.63, 3.47, 1.25, 1.27, ZB + 0.72, ZB + 0.74, 0x8a8e98, 0.004); for (const y of [0.6, 1.6]) K.box(M.steel, 2.68, 2.71, y, y + 0.4, ZB + 0.72, ZB + 0.78, 0xe8ecf4, 0.01);
  K.box(M.paint, -2.55, -1.0, 1.0, 1.0 + 0.04, ZB, ZB + 0.08, 0xffffff, 0.005);
  mesh(root, plane(1.4, 0.48), M.night, -1.8, 1.24, ZB + 0.025, 0, 0, 0, false); K.box(M.paint, -2.55, -1.05, 0.98, 1.02, ZB, ZB + 0.05, 0xf2ece2, 0.005); K.box(M.paint, -1.82, -1.78, 1.0, 1.48, ZB, ZB + 0.04, 0xf2ece2, 0.005); K.box(M.paint, -2.55, -1.05, 1.47, 1.5, ZB, ZB + 0.04, 0xf2ece2, 0.005);
  // clutter on the counter: kettle, toaster, fruit bowl, knife block, plant, cereal boxes, mugs, cutting board, paper towels
  const cy = 0.92; K.put(M.steel, cyl(0.08, 0.1, 0.2, 16), -2.9, cy + 0.1, -2.25, 0, 0, 0, 1, 1, 1, 0xd84a3a); K.put(M.steel, sph(0.05, 10, 8), -2.9, cy + 0.22, -2.25, 0, 0, 0, 1, 0.5, 1, 0x2a2a30);
  K.box(M.steel, -2.25, -1.95, cy, cy + 0.18, -2.42, -2.22, 0xc8ccd6, 0.03); K.box(M.paint, -2.2, -2.0, cy + 0.18, cy + 0.19, -2.38, -2.34, 0x2a2a30, 0.003);
  K.put(M.paint, cyl(0.16, 0.1, 0.08, 20), 1.1, cy + 0.04, -2.1, 0, 0, 0, 1, 1, 1, 0x3a5a8a); for (let i = 0; i < 5; i++) K.put(M.paint, sph(0.05, 10, 8), 1.05 + (i % 3) * 0.06, cy + 0.1 + Math.floor(i / 3) * 0.05, -2.1 + (i % 2) * 0.05, 0, 0, 0, 1, 1, 1, [0xe83a2a, 0xf0c030, 0x6ac83a, 0xe8702a, 0xe83a2a][i]);
  K.cb(M.wood, 0.14, 0.24, 0.12, 1.6, cy + 0.12, -2.4, 0x8a5a30, 0.25, 0, 0, 0.01); for (let i = 0; i < 3; i++) K.beam(M.paint, [1.58 + i * 0.03, cy + 0.24, -2.4], [1.58 + i * 0.03, cy + 0.34, -2.43], 0.012, 0x1a1a20);
  tree(K, 2.25, cy, -2.3, 0.9); K.box(M.paint, -3.4, -3.15, cy, cy + 0.36, -2.5, -2.36, 0xe8b030, 0.01); K.box(M.paint, -3.12, -2.92, cy, cy + 0.3, -2.5, -2.38, 0x3a8ac8, 0.01);
  for (let i = 0; i < 3; i++) K.put(M.paint, cyl(0.04, 0.035, 0.09, 12), 0.95 + i * 0.1, cy + 0.045, -2.42, 0, 0, 0, 1, 1, 1, [0xf2ead6, 0xe86a8a, 0x5ab0c8][i]);
  K.box(M.wood, -1.3, -0.85, cy, cy + 0.02, -2.4, -2.12, 0xb07a40, 0.006); K.put(M.paint, cyl(0.06, 0.06, 0.26, 16), -0.62, cy + 0.13, -2.45, 0, 0, 0, 1, 1, 1, 0xfafaf4);
  // island in the foreground (blurred edge for depth), stools, rug
  K.box(M.paint, -2.2, 2.2, 0.08, 0.88, 1.7, 2.5, 0x3a4a6a, 0.03); K.box(M.paint, -2.3, 2.3, 0.88, 0.94, 1.6, 2.6, 0xe8e4dc, 0.02); K.put(M.paint, cyl(0.18, 0.12, 0.1, 20), -0.8, 0.99, 1.95, 0, 0, 0, 1, 1, 1, 0xe8e0d0);
  for (const x of [-1.4, 0, 1.4]) { K.put(M.paint, cyl(0.2, 0.2, 0.06, 18), x, 0.66, 1.3, 0, 0, 0, 1, 1, 1, 0x8a5a3a); K.beam(M.steel, [x, 0, 1.3], [x, 0.64, 1.3], 0.03, 0x2a2a30, true, 8); }
  const lamps = [-1.2, 1.2].map((x) => lampShade(K, root, x, 2.0, 0.6, 0x3a3a4a));
  K.build(root);
  const under = [-2.2, 0, 1.6].map((x) => { const g = glowAt(root, [x, 1.48, -2.25], 1.1, '#ffd090', 0.16); return g; });
  const micro = makeMicro(); micro.position.set(...MWP.micro); root.add(micro);
  const candy = makeCandy(); root.add(candy); candy.visible = false;
  const mglow = glowAt(root, [MWP.micro[0] - 0.06, MWP.micro[1] + 0.17, MWP.micro[2] + 0.4], 1.0, '#ffb050', 0);
  const steam = []; for (let i = 0; i < 8; i++) { const s = nond(mesh(root, plane(0.3, 0.3), new THREE.MeshBasicMaterial({ map: H.M.glow.map, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, fog: false }), 0, 0, 0, 0, 0, 0, false)); steam.push(s); }
  const dust = motes(root, 30, [-3, 3, 0.5, 2.4, -2.2, 1.0], 13, 0.008);
  return { micro, candy, lamps, under, mglow, steam, dust };
}
// ================================================================= LAB (1945)
const POPN = 150;
function buildLab(root) { const K = new Kit(), X = 5, ZB = -3.4, HT = 3.6, R = PT.rng(1945);
  K.box(M.floorL, -X, X, -0.05, 0, ZB, 5, 0xffffff, 0.01);
  K.box(M.wall, -X, X, 0, 1.2, ZB - 0.2, ZB, 0x4a6a5a, 0.01); K.box(M.wall, -X, X, 1.2, HT, ZB - 0.2, ZB, 0xe0d6be, 0.01);
  for (const s of [-1, 1]) { K.box(M.wall, s * X - (s > 0 ? 0 : 0.2), s * X + (s > 0 ? 0.2 : 0), 0, 1.2, ZB, 5, 0x4a6a5a, 0.01); K.box(M.wall, s * X - (s > 0 ? 0 : 0.2), s * X + (s > 0 ? 0.2 : 0), 1.2, HT, ZB, 5, 0xe0d6be, 0.01); }
  K.box(M.wall, -X, X, 1.18, 1.24, ZB, ZB + 0.04, 0x3a4a40, 0.01); K.box(M.wall, -X, X, HT - 0.1, HT, ZB, 5, 0xc8bea8, 0.01);
  // windows (back wall, daylight) with mullions
  const wins = []; for (const x of [-3.2, 2.0]) { const w = mesh(root, plane(1.6, 1.3), M.day, x, 2.2, ZB + 0.01, 0, 0, 0, false); wins.push(w); K.box(M.paint, x - 0.84, x + 0.84, 1.5, 1.56, ZB, ZB + 0.12, 0xe8e2d0, 0.01);
    for (const dx of [-0.8, 0, 0.8]) K.box(M.paint, x + dx - 0.03, x + dx + 0.03, 1.52, 2.88, ZB, ZB + 0.05, 0xe8e2d0, 0.005); for (const y of [2.2, 2.86]) K.box(M.paint, x - 0.82, x + 0.82, y - 0.03, y + 0.03, ZB, ZB + 0.05, 0xe8e2d0, 0.005); }
  mesh(root, plane(2.6, 0.46), M.lab, -0.4, 3.15, ZB + 0.03, 0, 0, 0, false);
  // main bench + the magnetron rig + waveguide + horn
  K.box(M.wood, -1.6, 1.2, 0.86, 0.92, -1.9, -0.95, 0x7a5030, 0.01); for (const [x, z] of [[-1.5, -1.8], [1.1, -1.8], [-1.5, -1.05], [1.1, -1.05]]) K.box(M.steel, x - 0.04, x + 0.04, 0, 0.86, z - 0.04, z + 0.04, 0x3a3a44, 0.005);
  K.box(M.steel, -1.5, 1.1, 0.25, 0.29, -1.85, -1.0, 0x3a3a44, 0.005);
  const mx = -0.35, my = 0.92, mz = -1.4;
  K.box(M.steel, mx - 0.32, mx + 0.32, my, my + 0.08, mz - 0.25, mz + 0.25, 0x5a6066, 0.01);
  for (const s of [-1, 1]) { K.box(M.paint, mx - 0.2, mx + 0.2, my + 0.08 + (s > 0 ? 0.26 : 0), my + 0.08 + (s > 0 ? 0.36 : 0.1), mz - 0.18, mz + 0.18, 0x8a2a30, 0.02); }
  K.box(M.paint, mx - 0.26, mx - 0.18, my + 0.08, my + 0.36, mz - 0.18, mz + 0.18, 0x6a2028, 0.02);
  K.put(M.copper, cyl(0.11, 0.11, 0.16, 24), mx + 0.02, my + 0.26, mz, 0, 0, 0, 1, 1, 1, 0xd8804a); for (let i = 0; i < 6; i++) K.put(M.copper, cyl(0.15, 0.15, 0.008, 24), mx + 0.02, my + 0.19 + i * 0.028, mz, 0, 0, 0, 1, 1, 1, 0xe8986a);
  K.put(M.paint, cyl(0.03, 0.04, 0.14, 12), mx + 0.02, my + 0.44, mz, 0, 0, 0, 1, 1, 1, 0xf2ead6); K.put(M.steel, cyl(0.012, 0.012, 0.3, 6), mx + 0.02, my + 0.56, mz, 0, 0, 0, 1, 1, 1, 0x2a2a30);
  const wy = 1.2; K.box(M.copper, mx + 0.12, MWP.horn[0] - 0.12, wy - 0.05, wy + 0.05, mz - 0.08, mz + 0.08, 0xc87a4a, 0.008);
  K.put(M.copper, new THREE.CylinderGeometry(0.15, 0.06, 0.24, 20, 1, true), MWP.horn[0] - 0.02, wy, mz, 0, 0, -Math.PI / 2, 1, 1, 1, 0xa8603a); K.put(M.steel, new THREE.TorusGeometry(0.15, 0.012, 6, 28), MWP.horn[0] + 0.1, wy, mz, 0, Math.PI / 2, 0, 1, 1, 1, 0x6a4a3a);
  K.box(M.steel, mx + 0.1, mx + 0.16, my, wy, mz - 0.04, mz + 0.04, 0x3a3a44, 0.005);
  // cables to the rack
  for (let i = 0; i < 3; i++) K.beam(M.paint, [mx - 0.3, my + 0.05 + i * 0.03, mz - 0.1], [-2.6, 0.02, -1.6 + i * 0.15], 0.018, [0x1a1a20, 0x8a2a2a, 0x2a2a6a][i], true, 6);
  // oscilloscope + power supply on the bench
  K.box(M.steel, -1.45, -0.95, 0.92, 1.3, -1.8, -1.4, 0x6a7068, 0.02); K.box(M.steel, 0.7, 1.1, 0.92, 1.12, -1.85, -1.55, 0x4a5050, 0.015);
  for (let i = 0; i < 3; i++) K.put(M.paint, cyl(0.025, 0.025, 0.02, 12), 0.78 + i * 0.12, 1.02, -1.54, Math.PI / 2, 0, 0, 1, 1, 1, 0x1a1a20);
  const scope = mesh(root, plane(0.34, 0.24), M.scope, -1.2, 1.12, -1.395, 0, 0, 0, false);
  // racks on the left wall, sign, crates, radar dish, blackboard, calendar, clock, stool, lamps
  for (let i = 0; i < 3; i++) { const z = -2.6 + i * 1.0; K.box(M.steel, -X, -X + 0.6, 0, 2.3, z - 0.45, z + 0.45, 0x3a4240, 0.02); mesh(root, plane(0.86, 2.0), M.panel, -X + 0.61, 1.15, z, 0, Math.PI / 2, 0, false); }
  mesh(root, plane(0.7, 0.35), M.danger, -X + 0.62, 2.55, -1.6, 0, Math.PI / 2, 0, false);
  for (const [x, y, z, ry] of [[3.9, 0, -2.6, 0.1], [3.9, 0.6, -2.55, -0.05], [3.2, 0, -2.75, 0.2], [4.3, 0, -1.7, -0.3]]) K.cb(M.crate, 0.62, 0.6, 0.62, x, y + 0.3, z, 0xffffff, 0, ry, 0, 0.01);
  K.box(M.wood, -1.0, 1.4, 1.4, 2.6, ZB, ZB + 0.06, 0x5a3420, 0.01); mesh(root, plane(2.3, 1.12), M.board, 0.2, 2.0, ZB + 0.07, 0, 0, 0, false); K.box(M.wood, -1.0, 1.4, 1.36, 1.42, ZB, ZB + 0.16, 0x5a3420, 0.01);
  mesh(root, plane(0.4, 0.52), M.cal45, 3.4, 2.1, ZB + 0.02, 0, 0, 0, false);
  K.put(M.paint, cyl(0.22, 0.22, 0.05, 24), -2.2, 2.9, ZB + 0.03, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a3a44); K.put(M.paint, cyl(0.19, 0.19, 0.02, 24), -2.2, 2.9, ZB + 0.06, Math.PI / 2, 0, 0, 1, 1, 1, 0xf6f0e0);
  const DP = [-3.1, 0, -2.3]; const dish = new THREE.Group(); dish.position.set(...DP); root.add(dish); K.put(M.steel, cyl(0.25, 0.35, 0.2, 16), DP[0], 0.1, DP[2], 0, 0, 0, 1, 1, 1, 0x4a5050); K.beam(M.steel, [DP[0], 0.2, DP[2]], [DP[0], 1.5, DP[2]], 0.05, 0x4a5050, true, 10);
  const dg = new THREE.Group(); dg.position.set(0, 1.6, 0); dish.add(dg); const bowl = tintM(mesh(dg, new THREE.SphereGeometry(0.75, 28, 10, 0, TAU, 0, 0.75), M.steel.clone(), 0, 0, 0, -Math.PI / 2 - 0.3, 0, 0), 0xc8ccd4); bowl.material.side = THREE.DoubleSide;
  tintM(mesh(dg, cyl(0.015, 0.015, 0.7, 6), M.steel, 0, 0.1, 0.3, Math.PI / 2 - 0.3, 0, 0), 0x3a3a44);
  K.put(M.wood, cyl(0.18, 0.18, 0.04, 16), 1.6, 0.62, -0.4, 0, 0, 0, 1, 1, 1, 0x6a4028); for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; K.beam(M.steel, [1.6 + Math.cos(a) * 0.14, 0, -0.4 + Math.sin(a) * 0.14], [1.6 + Math.cos(a) * 0.1, 0.6, -0.4 + Math.sin(a) * 0.1], 0.015, 0x3a3a44, true, 6); }
  const lamps = [-1.6, 1.6].map((x) => lampShade(K, root, x, 2.7, -0.6));
  // desk for the patent / bonus beats
  const [dx, , dz] = MWP.desk; K.box(M.wood, dx - 0.8, dx + 0.8, 0.72, 0.78, dz - 0.45, dz + 0.45, 0x6a4028, 0.01); for (const [a, b] of [[-0.72, -0.37], [0.72, -0.37], [-0.72, 0.37], [0.72, 0.37]]) K.box(M.wood, dx + a - 0.04, dx + a + 0.04, 0, 0.72, dz + b - 0.04, dz + b + 0.04, 0x5a3420, 0.005);
  K.box(M.wood, dx + 0.2, dx + 0.75, 0.3, 0.72, dz - 0.42, dz + 0.3, 0x5a3420, 0.01); K.put(M.brass, cyl(0.08, 0.1, 0.04, 12), dx - 0.6, 0.8, dz - 0.25, 0, 0, 0, 1, 1, 1, 0x2a5a3a); K.beam(M.brass, [dx - 0.6, 0.8, dz - 0.25], [dx - 0.55, 1.15, dz - 0.15], 0.015, 0xc8a050);
  K.put(M.paint, new THREE.ConeGeometry(0.12, 0.12, 16, 1, true), dx - 0.52, 1.16, dz - 0.08, 0.5, 0, 0, 1, 1, 1, 0x2a5a3a); K.box(M.paint, dx + 0.35, dx + 0.65, 0.78, 0.84, dz - 0.3, dz - 0.05, 0x3a3a44, 0.01); K.put(M.paint, cyl(0.04, 0.035, 0.09, 12), dx + 0.55, 0.825, dz + 0.2, 0, 0, 0, 1, 1, 1, 0xf2ead6);
  K.build(root);
  const doc = mesh(root, plane(0.36, 0.49), M.doc, dx - 0.05, 0.785, dz + 0.02, -Math.PI / 2, 0.08, 0, false);
  const stamp = new THREE.Group(); root.add(stamp); cmesh(stamp, cyl(0.035, 0.045, 0.12, 12), 0x8a5a30, 0, 0.08, 0, 0, 0, 0, M.wood); cmesh(stamp, sph(0.05, 12, 10), 0x6a3a20, 0, 0.16, 0, 0, 0, 0, M.wood); cmesh(stamp, rb(0.13, 0.03, 0.08, 0.008), 0x2a2a30, 0, 0.015, 0);
  const lampG = glowAt(root, [dx - 0.52, 1.1, dz - 0.05], 0.8, '#ffd890', 0.0);
  const hornG = glowAt(root, [MWP.horn[0] + 0.12, MWP.horn[1], MWP.horn[2] + 0.05], 0.6, '#c070ff', 0); const coreG = glowAt(root, [mx + 0.02, my + 0.28, mz + 0.18], 0.7, '#ff9050', 0);
  const rings = []; for (let i = 0; i < 4; i++) { const r = nond(mesh(root, new THREE.TorusGeometry(0.16, 0.006, 6, 40), new THREE.MeshBasicMaterial({ color: 0xd8a0ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), 0, 0, 0, 0, Math.PI / 2, 0, false)); rings.push(r); }
  // shirt-front insert (Percy's chest, pocket, tie) for the candy close-up; the pocket candy
  const torso = new THREE.Group(); torso.position.set(...MWP.torso); root.add(torso); const shirt = 0xe4e8f2;
  cmesh(torso, rb(0.9, 1.3, 0.3, 0.14), shirt, 0, 0.95, 0); cmesh(torso, rb(0.09, 0.62, 0.02, 0.02), 0x2a4a8a, 0.02, 1.22, 0.155); cmesh(torso, rb(0.11, 0.08, 0.03, 0.02), 0x2a4a8a, 0.02, 1.56, 0.158);
  for (let i = 0; i < 2; i++) cmesh(torso, rb(0.2, 0.09, 0.06, 0.02), 0xf8f6f0, -0.09 + i * 0.22, 1.58, 0.13, 0, 0, (i ? -1 : 1) * 0.45); cmesh(torso, rb(0.012, 0.9, 0.012, 0.004), 0xd8d4c8, 0.12, 1.0, 0.152);
  cmesh(torso, rb(0.21, 0.2, 0.06, 0.012), 0xe2ddd0, -0.2, 1.18, 0.18); cmesh(torso, rb(0.21, 0.025, 0.065, 0.006), 0xd4cfc2, -0.2, 1.28, 0.18); 
  
  const stain = cmesh(torso, cyl(0.1, 0.1, 0.004, 20), 0x8a4a24, -0.2, 1.2, 0.212, Math.PI / 2); stain.scale.set(0.01, 1, 0.01);
  torso.userData = { stain }; torso.visible = false;
  const candy = makeCandy(); root.add(candy); candy.visible = false;
  // egg in a pot, the yolk splat card
  const eggG = new THREE.Group(); eggG.position.set(...MWP.egg); root.add(eggG); cmesh(eggG, cyl(0.1, 0.08, 0.1, 20, true), 0x8a8e98, 0, 0.05, 0, 0, 0, 0, M.steel); cmesh(eggG, cyl(0.08, 0.08, 0.01, 20), 0x6a6e78, 0, 0.005, 0, 0, 0, 0, M.steel);
  const egg = cmesh(eggG, sph(0.045, 16, 12), 0xfaf4e8, 0, 0.1, 0); egg.scale.set(1, 1.3, 1);
  const splat = nond(mesh(root, plane(0.34, 0.34), M.yolk, 0, 0, 0, 0, 0, 0, false)); splat.renderOrder = 9; splat.visible = false;
  // popcorn: instanced puffs + a pile on the bench
  const popM = toonPop(); const pops = new THREE.InstancedMesh(lumpGeo(77, 1, 0.45), popM, POPN); pops.castShadow = true; root.add(pops); pops.frustumCulled = false;
  const PP = Array.from({ length: POPN }, (_, i) => { const a = R() * TAU, sp = 1.2 + R() * 2.6; return { t0: i * 0.33 + R() * 2, vx: Math.cos(a) * sp * 0.55, vy: 2.0 + R() * 2.2, vz: -0.15 - Math.abs(Math.sin(a)) * sp * 0.4, s: 0.028 + R() * 0.014, rx: R() * 6, ry: R() * 6 }; });
  const dust = motes(root, 50, [-4, 4, 0.4, 3.2, -3, 2], 21, 0.01); const shaft = shaftAt(root, [2.0, 1.6, -1.6], 1.8, 4.0, 0.2, 0.55, 0.14, 0xfff0d0); const shaft2 = shaftAt(root, [-3.2, 1.6, -1.6], 1.8, 4.0, 0.2, 0.55, 0.12, 0xfff0d0);
  return { dish: dg, scope, lamps, doc, stamp, lampG, hornG, coreG, rings, torso, candy, eggG, egg, splat, pops, PP, dust, shaft, shaft2, wins };
}
function toonPop() { const m = H.toon({ color: 0xeedcb0, emissive: 0x0a0804 }); return m; }
// ================================================================= INSIDE (the explanation void)
function buildInside(root) { const R = PT.rng(77);
  nond(mesh(root, new THREE.SphereGeometry(40, 32, 20), M.bg, 0, 0, 0, 0, 0, 0, false));
  const C = [0, 1.55, -2.4], HR = 1.3;
  const hull = mesh(root, new THREE.SphereGeometry(HR, 40, 24, Math.PI, Math.PI), H.toon({ color: 0xf6d890, emissive: 0x2a1a08, side: THREE.DoubleSide }), C[0], C[1], C[2], 0, 0, 0); hull.scale.set(1, 0.92, 1);
  const rim = mesh(root, new THREE.TorusGeometry(HR, 0.07, 10, 64), H.toon({ color: 0xe89a30, emissive: 0x2a1004 }), C[0], C[1], C[2], 0, 0, 0); rim.scale.set(1, 0.92, 1);
    const tip = mesh(root, new THREE.ConeGeometry(0.4, 0.5, 20), H.toon({ color: 0xc88a30, emissive: 0x1a0a02 }), C[0], C[1] - HR * 0.95, C[2], Math.PI, 0, 0);
  const mols = []; const oM = H.toon({ color: 0xe84a4a, emissive: 0x200000 }), hM = H.toon({ color: 0xf6f6ff, emissive: 0x101020 });
  for (let i = 0; i < 26; i++) { let p; do { p = [(R() - 0.5) * 2.2, (R() - 0.5) * 2.0, (R() - 0.5) * 1.6]; } while (Math.hypot(p[0], p[1] / 0.92, p[2] * 1.3) > 0.98);
    const g = new THREE.Group(); g.position.set(C[0] + p[0], C[1] + p[1], C[2] + p[2]); root.add(g); const o = mesh(g, sph(0.12, 16, 12), oM.clone(), 0, 0, 0);
    for (const s of [-1, 1]) mesh(g, sph(0.075, 12, 10), hM, Math.sin(s * 0.91) * 0.16, -Math.cos(0.91) * 0.16, 0);
    g.userData = { p: [C[0] + p[0], C[1] + p[1], C[2] + p[2]], ph: R() * TAU, ax: [R() - 0.5, R() - 0.5, R() - 0.5], o, base: g.rotation.clone() }; g.rotation.set(R() * 6, R() * 6, R() * 6); g.userData.r0 = [g.rotation.x, g.rotation.y, g.rotation.z]; mols.push(g); }
  // emitter horn on the left, wave ribbons, thermometer on the right, floor grid disc
  const EY = 4.3; const K = new Kit(); K.put(M.steel, new THREE.CylinderGeometry(0.18, 0.55, 0.7, 4, 1, true), 0, EY, -2.4, 0, Math.PI / 4, 0, 1, 1, 1, 0x8a8ea0); K.box(M.steel, -0.3, 0.3, EY + 0.35, EY + 1.2, -2.7, -2.1, 0x5a5e70, 0.03);
  K.build(root);
  mesh(root, plane(1.3, 0.24), M.emit, 0, EY + 0.75, -2.08, 0, 0, 0, false);
  const waves = []; for (let i = 0; i < 5; i++) { const pts = []; for (let k = 0; k <= 80; k++) pts.push(new THREE.Vector3(k / 80 * 6, 0, 0)); const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.025, 6, false);
    const pos = geo.attributes.position; geo.userData.x0 = Float32Array.from({ length: pos.count }, (_, j) => pos.getX(j)); geo.userData.y0 = Float32Array.from({ length: pos.count }, (_, j) => pos.getY(j));
    const w = nond(mesh(root, geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(0xc890ff).multiplyScalar(1.4), transparent: true, opacity: 0.85, fog: false, depthWrite: false }), (i - 2) * 0.2, EY - 0.3, -2.4 + ((i % 2) - 0.5) * 0.3, 0, 0, -Math.PI / 2, false)); w.renderOrder = 4; w.scale.x = 0.62; waves.push(w); }
  const thermo = new THREE.Group(); thermo.position.set(1.0, 0.1, -1.0); thermo.scale.setScalar(0.62); root.add(thermo); mesh(thermo, plane(0.36, 2.9), M.thermo, 0, 1.5, 0.08, 0, 0, 0, false);
  mesh(thermo, cyl(0.1, 0.1, 2.6, 16, true), H.M.jar, 0, 1.45, 0.14, 0, 0, 0, false); const bulb = mesh(thermo, sph(0.18, 16, 12), H.toon({ color: 0xe8302a, emissive: 0x400000 }), 0, 0.12, 0.14); const col = mesh(thermo, cyl(0.055, 0.055, 1, 12), H.toon({ color: 0xe8302a, emissive: 0x400000 }), 0, 0.6, 0.14); col.scale.y = 0.4;
  const heatG = glowAt(root, [C[0], C[1], C[2] - 0.6], 3.2, '#ff7a30', 0); const coolG = glowAt(root, [C[0], C[1], C[2] - 0.6], 3.2, '#5a7aff', 0.2);
  const steam = []; for (let i = 0; i < 10; i++) { const s = nond(mesh(root, plane(0.8, 0.8), new THREE.MeshBasicMaterial({ map: H.M.glow.map, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, fog: false }), 0, 0, 0, 0, 0, 0, false)); steam.push(s); }
  const dust = motes(root, 60, [-4, 4, 0, 4, -4, 1], 31, 0.012);
  return { mols, waves, col, heatG, coolG, steam, dust, hull, C };
}
// ================================================================= SHOW (1947 restaurant kitchen)
function makeRadarange() { const G = new THREE.Group(), K = new Kit(), W = 0.82, Ht = 1.8, D = 0.76, cream = 0xe6e0cc, trim = 0x9aa0aa;
  K.box(M.paint, -W / 2, W / 2, 0.08, Ht, -D / 2, D / 2, cream, 0.04); K.box(M.steel, -W / 2 - 0.01, W / 2 + 0.01, 0, 0.1, -D / 2 - 0.01, D / 2 + 0.01, 0x3a3a44, 0.01);
  K.box(M.steel, -W / 2 + 0.06, W / 2 - 0.06, 0.95, 1.42, D / 2, D / 2 + 0.03, trim, 0.02); K.box(M.paint, -0.24, 0.24, 1.02, 1.34, D / 2 + 0.03, D / 2 + 0.04, 0x2a2834, 0.01); K.box(M.steel, 0.27, 0.32, 1.1, 1.26, D / 2 + 0.03, D / 2 + 0.07, 0xc8ccd6, 0.01);
  K.box(M.steel, -W / 2 + 0.06, W / 2 - 0.06, 1.5, 1.72, D / 2, D / 2 + 0.02, 0x4a4e58, 0.01); for (let i = 0; i < 3; i++) { K.put(M.paint, cyl(0.045, 0.045, 0.03, 16), -0.22 + i * 0.22, 1.6, D / 2 + 0.035, Math.PI / 2, 0, 0, 1, 1, 1, 0x1a1a20); K.put(M.paint, sph(0.018, 8, 6), -0.22 + i * 0.22 + 0.05, 1.67, D / 2 + 0.03, 0, 0, 0, 1, 1, 1, [0xff5a3a, 0x7aff7a, 0xffd040][i]); }
  for (let i = 0; i < 6; i++) K.box(M.steel, -W / 2 + 0.1, W / 2 - 0.1, 0.3 + i * 0.07, 0.32 + i * 0.07, D / 2, D / 2 + 0.015, 0x8a8e98, 0.004);
  for (const y of [0.5, 1.2]) K.beam(M.copper, [W / 2, y, -0.1], [W / 2 + 0.12, y, -0.1], 0.03, 0xc87a4a, true, 8); K.beam(M.copper, [W / 2 + 0.12, 0.5, -0.1], [W / 2 + 0.12, 1.2, -0.1], 0.03, 0xc87a4a, true, 8); K.beam(M.copper, [W / 2 + 0.12, 1.2, -0.1], [W / 2 + 0.12, 2.3, -0.6], 0.03, 0xc87a4a, true, 8);
  K.box(M.steel, -W / 2, W / 2, Ht, Ht + 0.04, -D / 2, D / 2, trim, 0.01); K.build(G);
  mesh(G, plane(0.44, 0.11), M.plate47, 0, 0.86, D / 2 + 0.005, 0, 0, 0, false); const win = mesh(G, plane(0.42, 0.26), M.glassOn.clone(), 0, 1.18, D / 2 + 0.045, 0, 0, 0, false); win.material.transparent = true; win.material.opacity = 0.0;
  G.userData = { win }; return G; }
function buildShow(root) { const K = new Kit(), X = 5, ZB = -3.2, HT = 3.4, R = PT.rng(1947);
  K.box(M.floorS, -X, X, -0.05, 0, ZB, 5, 0xffffff, 0.01); K.box(M.tileS, -X, X, 0, 1.4, ZB - 0.2, ZB, 0xffffff, 0.005); K.box(M.wall, -X, X, 1.4, HT, ZB - 0.2, ZB, 0xc8b484, 0.01);
  for (const s of [-1, 1]) { K.box(M.tileS, s * X - (s > 0 ? 0 : 0.2), s * X + (s > 0 ? 0.2 : 0), 0, 1.4, ZB, 5, 0xffffff, 0.005); K.box(M.wall, s * X - (s > 0 ? 0 : 0.2), s * X + (s > 0 ? 0.2 : 0), 1.4, HT, ZB, 5, 0xc8b484, 0.01); }
  K.box(M.paint, -X, X, 1.38, 1.44, ZB, ZB + 0.04, 0x2a6a6a, 0.005);
  // platform scale under the oven + its dial post
  K.box(M.steel, -0.55, 0.55, 0, 0.1, -2.5, -1.5, 0x5a6066, 0.02); K.box(M.steel, -0.5, 0.5, 0.1, 0.12, -2.45, -1.55, 0x8a8e98, 0.005);
  K.beam(M.steel, [0.85, 0, -1.7], [0.85, 1.1, -1.7], 0.05, 0x4a4e58, true, 10); K.put(M.steel, cyl(0.24, 0.24, 0.08, 28), 0.85, 1.35, -1.7, Math.PI / 2, 0, 0, 1, 1, 1, 0x4a4e58);
  // height post
  K.box(M.wood, -0.86, -0.78, 0, 2.05, -1.75, -1.67, 0x8a5a30, 0.005);
  // restaurant clutter: range with pots, prep tables, shelves with cans, hanging pots, sink, menu, ad poster, clock, window
  K.box(M.steel, -4.2, -2.6, 0, 0.9, ZB, ZB + 0.8, 0x3a3a44, 0.02); K.box(M.steel, -4.2, -2.6, 0.9, 0.95, ZB, ZB + 0.82, 0x1a1a20, 0.01); for (let i = 0; i < 2; i++) { K.put(M.steel, cyl(0.2, 0.18, 0.28, 18), -3.8 + i * 0.75, 1.09, ZB + 0.4, 0, 0, 0, 1, 1, 1, 0xb8bcc8); }
  K.box(M.steel, 2.0, 3.8, 0.85, 0.9, ZB + 0.05, ZB + 0.75, 0xc8ccd6, 0.01); for (const x of [2.1, 3.7]) K.box(M.steel, x - 0.03, x + 0.03, 0, 0.85, ZB + 0.1, ZB + 0.7, 0x8a8e98, 0.005);
  for (let i = 0; i < 6; i++) K.put(M.paint, cyl(0.06, 0.06, 0.14, 12), 2.2 + i * 0.25, 0.97, ZB + 0.35, 0, 0, 0, 1, 1, 1, [0xd8402a, 0xe8c040, 0x3a8a4a, 0xd8402a, 0xf2ead6, 0x3a6ac8][i]);
  for (const y of [1.9, 2.4]) { K.box(M.wood, 1.9, 3.9, y, y + 0.04, ZB, ZB + 0.3, 0x6a4028, 0.005); for (let i = 0; i < 7; i++) K.put(M.paint, cyl(0.07, 0.07, 0.18, 12), 2.05 + i * 0.27, y + 0.13, ZB + 0.15, 0, 0, 0, 1, 1, 1, [0xd8402a, 0xe8c040, 0x3a8a4a, 0x3a6ac8, 0xf2ead6, 0xe8702a, 0x8a3a8a][(i + (y > 2 ? 3 : 0)) % 7]); }
  K.beam(M.steel, [-4.4, 2.6, -2.2], [-2.4, 2.6, -2.2], 0.02, 0x3a3a44, true, 6); for (let i = 0; i < 4; i++) { K.beam(M.steel, [-4.2 + i * 0.5, 2.6, -2.2], [-4.2 + i * 0.5, 2.38, -2.2], 0.008, 0x3a3a44); K.put(M.copper, cyl(0.13 - i * 0.015, 0.11 - i * 0.015, 0.1, 16), -4.2 + i * 0.5, 2.26, -2.2, 0, 0, 0.2, 1, 1, 1, 0xd8884a); }
  K.box(M.steel, -X + 0.02, -X + 0.6, 0.85, 0.9, -1.2, 0.4, 0xc8ccd6, 0.01); K.box(M.steel, -X + 0.02, -X + 0.6, 0, 0.85, -1.2, 0.4, 0x8a8e98, 0.01);
  K.box(M.wood, -2.0, -1.0, 1.75, 3.05, ZB, ZB + 0.04, 0x3a2414, 0.005);
  K.put(M.paint, cyl(0.2, 0.2, 0.05, 24), 1.4, 2.8, ZB + 0.03, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a6a6a); K.put(M.paint, cyl(0.17, 0.17, 0.02, 24), 1.4, 2.8, ZB + 0.06, Math.PI / 2, 0, 0, 1, 1, 1, 0xf6f0e0);
  // a little 1947 chef's table in the foreground (blurred depth), lamps
  K.box(M.wood, -2.6, -1.2, 0.8, 0.86, 1.2, 1.9, 0x8a5a30, 0.01); for (const [a, b] of [[-2.5, 1.3], [-1.3, 1.3], [-2.5, 1.8], [-1.3, 1.8]]) K.box(M.wood, a - 0.03, a + 0.03, 0, 0.8, b - 0.03, b + 0.03, 0x6a4028, 0.005);
  K.put(M.paint, cyl(0.15, 0.12, 0.04, 20), -1.9, 0.88, 1.5, 0, 0, 0, 1, 1, 1, 0xf6f0e4);
  const lamps = [-1.4, 1.4].map((x) => lampShade(K, root, x, 2.8, -1.4, 0x2a6a6a));
  K.build(root);
  mesh(root, plane(0.96, 1.25), M.menu, -1.5, 2.4, ZB + 0.06, 0, 0, 0, false); mesh(root, plane(0.86, 1.2), M.ad, 4.2, 2.2, ZB + 0.03, 0, 0, 0, false);
  const ruler = mesh(root, plane(0.16, 2.0 * 6.5 / 6.5), M.ruler, -0.82, 1.0, -1.665, 0, 0, 0, false); ruler.scale.y = 1.0;
  const marker = new THREE.Group(); root.add(marker); const tri = new THREE.Shape(); tri.moveTo(0, 0); tri.lineTo(0.14, 0.07); tri.lineTo(0.14, -0.07); tri.closePath(); cmesh(marker, new THREE.ExtrudeGeometry(tri, { depth: 0.03, bevelEnabled: false }), 0xd8302a, -0.76, 0, -1.68);
  const dial = mesh(root, plane(0.44, 0.44), M.dial, 0.85, 1.35, -1.655, 0, 0, 0, false); const needle = new THREE.Group(); needle.position.set(0.85, 1.35, -1.645); root.add(needle); cmesh(needle, rb(0.012, 0.19, 0.006, 0.003), 0xc8202a, 0, 0.085, 0); cmesh(needle, cyl(0.02, 0.02, 0.012, 12), 0x2a2a30, 0, 0, 0, Math.PI / 2);
  const oven = makeRadarange(); oven.position.set(MWP.oven[0], 0.12, MWP.oven[2]); root.add(oven);
  const tagC = document.createElement('canvas'); tagC.width = 512; tagC.height = 256; const tagT = new THREE.CanvasTexture(tagC); tagT.colorSpace = THREE.SRGBColorSpace;
  const tagP = new THREE.Group(); tagP.position.set(0.36, 1.96, -1.62); root.add(tagP); const tag = mesh(tagP, plane(0.5, 0.25), H.M.em(tagT, 0x303020), 0.1, -0.28, 0, 0, 0, 0, false); tag.material.side = THREE.DoubleSide; tintM(mesh(tagP, cyl(0.004, 0.004, 0.18, 4), M.paint, 0, -0.08, 0), 0x3a2a20);
  const yearC = document.createElement('canvas'); yearC.width = 512; yearC.height = 192; const yearT = new THREE.CanvasTexture(yearC); yearT.colorSpace = THREE.SRGBColorSpace;
  const yearB = mesh(root, plane(1.2, 0.45), new THREE.MeshBasicMaterial({ map: yearT, fog: false }), 0.0, 2.85, ZB + 0.04, 0, 0, 0, false);
  const spot = glowAt(root, [0, 1.3, -1.4], 3.0, '#fff0c8', 0.0); const dust = motes(root, 50, [-3, 3, 0.3, 3, -3, 1.5], 17, 0.01); const shaft = shaftAt(root, [-2.2, 1.8, -1.0], 1.6, 4.2, 0.6, 0.5, 0.12, 0xfff0d0);
  return { oven, marker, needle, tagP, tag, tagC, tagT, yearC, yearT, yearB, lamps, spot, dust, last: {} };
}
// ================================================================= K67 (1967 kitchen)
function makeMicro67() { const G = makeMicro({ w: 0.6, h: 0.36, d: 0.44, body: 0x8a5a30, door: 0xc8ccd4, pad: 0x9aa0aa, handle: 0xe8ecf4, cav: 0x8a8e98 }); const U = G.userData; U.disp.visible = false;
  for (let i = 0; i < 2; i++) cmesh(G, cyl(0.035, 0.035, 0.025, 16), 0x2a2a30, 0.6 * 0.39, 0.36 * (0.7 - i * 0.35), 0.24, Math.PI / 2); const side = mesh(G, rb(0.605, 0.04, 0.445, 0.01), M.wood, 0, 0.36, 0); return G; }
function buildK67(root) { const K = new Kit(), X = 4, ZB = -2.6, HT = 2.7;
  K.box(M.floor67, -X, X, -0.05, 0, ZB, 4.5, 0xffffff, 0.01); K.box(M.paper67, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); K.box(M.paper67, -X - 0.2, -X, 0, HT, ZB, 4.5, 0xffffff, 0.01); K.box(M.paper67, X, X + 0.2, 0, HT, ZB, 4.5, 0xffffff, 0.01);
  K.box(M.paint, -3.6, 2.5, 0.08, 0.88, ZB, ZB + 0.62, 0xd8a838, 0.02); for (let i = 0; i < 10; i++) { const x = -3.55 + i * 0.6; K.box(M.paint, x, x + 0.57, 0.12, 0.85, ZB + 0.62, ZB + 0.64, 0xe8b848, 0.01); K.box(M.steel, x + 0.25, x + 0.32, 0.74, 0.77, ZB + 0.64, ZB + 0.67, 0xd8dce4, 0.005); }
  K.box(M.paint, -3.65, 2.55, 0.88, 0.92, ZB, ZB + 0.68, 0xe8e0c8, 0.01); K.box(M.steel, -3.65, 2.55, 0.9, 0.925, ZB + 0.66, ZB + 0.69, 0xd8dce4, 0.003);
  for (const [a, b] of [[-3.6, -2.6], [-0.7, 2.5]]) K.box(M.paint, a, b, 1.6, 2.3, ZB, ZB + 0.36, 0xd8a838, 0.02);
  K.box(M.paint, 2.6, 3.5, 0, 1.85, ZB, ZB + 0.72, 0x8a9a3a, 0.04); K.box(M.steel, 2.66, 2.7, 0.7, 1.2, ZB + 0.72, ZB + 0.78, 0xd8dce4, 0.01);
  mesh(root, plane(1.3, 0.62), M.day67, -1.65, 1.26, ZB + 0.025, 0, 0, 0, false); K.box(M.paint, -2.36, -0.94, 0.92, 0.96, ZB, ZB + 0.1, 0xf6f0e0, 0.005); K.box(M.paint, -1.68, -1.62, 0.95, 1.58, ZB, ZB + 0.04, 0xf6f0e0, 0.005); K.box(M.paint, -2.36, -0.94, 1.56, 1.6, ZB, ZB + 0.06, 0xf6f0e0, 0.005);
  for (const s of [-1, 1]) K.box(M.gingham, -1.65 + s * 0.62 - 0.14, -1.65 + s * 0.62 + 0.14, 1.0, 1.66, ZB + 0.06, ZB + 0.1, 0xffffff, 0.02); K.box(M.gingham, -2.4, -0.9, 1.5, 1.66, ZB + 0.08, ZB + 0.12, 0xffffff, 0.02);
  const cy = 0.92; K.box(M.steel, -2.85, -2.55, cy, cy + 0.18, -2.42, -2.22, 0xd8dce4, 0.03); K.put(M.steel, cyl(0.07, 0.09, 0.3, 16), -3.2, cy + 0.15, -2.3, 0, 0, 0, 1, 1, 1, 0xd8dce4);
  K.put(M.paint, cyl(0.11, 0.13, 0.22, 16), 1.2, cy + 0.11, -2.3, 0, 0, 0, 1, 1, 1, 0xf0e0c0); K.put(M.paint, sph(0.08, 12, 8), 1.2, cy + 0.24, -2.3, 0, 0, 0, 1, 0.5, 1, 0xd8582a);
  K.put(M.paint, cyl(0.06, 0.08, 0.2, 12), 1.75, cy + 0.1, -2.35, 0, 0, 0, 1, 1, 1, 0x3a8ac8); for (let i = 0; i < 5; i++) K.put(M.paint, sph(0.05, 8, 6), 1.72 + (i % 3) * 0.04, cy + 0.26 + Math.floor(i / 3) * 0.05, -2.35 + (i % 2) * 0.03, 0, 0, 0, 1, 1, 1, [0xffe040, 0xff6a8a, 0xffffff, 0xff8a3a, 0xffe040][i]);
  K.box(M.paint, 2.0, 2.2, 1.25, 1.55, ZB, ZB + 0.08, 0xf0d040, 0.02); K.beam(M.paint, [2.1, 1.3, ZB + 0.1], [2.15, 0.95, ZB + 0.25], 0.008, 0x2a2a30);
  K.put(M.paint, cyl(0.24, 0.24, 0.04, 24), 0.8, 2.0, ZB + 0.03, Math.PI / 2, 0, 0, 1, 1, 1, 0xe8702a); K.put(M.paint, cyl(0.2, 0.2, 0.02, 24), 0.8, 2.0, ZB + 0.06, Math.PI / 2, 0, 0, 1, 1, 1, 0xfff6e0);
  K.box(M.paint, -2.0, 2.0, 0.7, 0.76, 1.3, 2.3, 0xf0f0e8, 0.04); for (const [a, b] of [[-1.9, 1.4], [1.9, 1.4], [-1.9, 2.2], [1.9, 2.2]]) K.beam(M.steel, [a, 0, b], [a, 0.7, b], 0.025, 0xd8dce4, true, 8);
  K.put(M.paint, cyl(0.16, 0.12, 0.08, 18), 0.6, 0.8, 1.7, 0, 0, 0, 1, 1, 1, 0xd8582a);
  const lamps = [lampShade(K, root, 0, 2.1, 0.4, 0xe8702a)];
  K.build(root); mesh(root, plane(0.4, 0.52), M.cal67, -3.2, 1.9, ZB + 0.02, 0, 0, 0, false);
  const micro = makeMicro67(); micro.position.set(...MWP.micro67); root.add(micro);
  const shaft = shaftAt(root, [-1.4, 1.2, -1.4], 1.4, 3.2, 0.3, 0.6, 0.18, 0xfff0c8); const dust = motes(root, 40, [-3, 3, 0.4, 2.4, -2.2, 1], 19, 0.01);
  return { micro, lamps, shaft, dust };
}

// ---------------------------------------------------------------- lights / grades
const SET_LIGHT = {
  kitchenNight: { top: '#04061a', hor: '#121834', fog: '#0e1228', fogN: 9, fogF: 40, sky: '#3a48a0', ground: '#1a1226', hemiI: 0.42, fillCol: '#4a5ad0', fillI: 0.3, sunCol: '#8a98ff', sunI: 0.8, az: -50, el: 32, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ece8ff', fxTint: '#ffffff', shafts: 0 },
  kitchenEnd: { top: '#04061a', hor: '#1a1a34', fog: '#141228', fogN: 9, fogF: 40, sky: '#4a48a0', ground: '#22162a', hemiI: 0.48, fillCol: '#5a5ad0', fillI: 0.32, sunCol: '#9a98ff', sunI: 0.85, az: -50, el: 32, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#f4ecff', fxTint: '#ffffff', shafts: 0 },
  lab: { top: '#000000', hor: '#2a2420', fog: '#2a2420', fogN: 12, fogF: 50, sky: '#c8d0f0', ground: '#3a3028', hemiI: 0.68, fillCol: '#8a98d8', fillI: 0.34, sunCol: '#fff0d8', sunI: 2.3, az: -30, el: 38, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff4ea', fxTint: '#ffffff', shafts: 0 },
  labPocket: { top: '#000000', hor: '#1e1428', fog: '#1e1428', fogN: 6, fogF: 30, sky: '#a8a0e0', ground: '#2a1e26', hemiI: 0.55, fillCol: '#6a6ae0', fillI: 0.4, sunCol: '#ffe8d0', sunI: 2.2, az: 30, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0f4', fxTint: '#ffffff', shafts: 0 },
  labWarm: { top: '#000000', hor: '#2a1a14', fog: '#2a1a14', fogN: 10, fogF: 45, sky: '#e8b890', ground: '#3a2420', hemiI: 0.6, fillCol: '#6a70d0', fillI: 0.36, sunCol: '#ffb070', sunI: 2.4, az: -40, el: 16, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  inside: { top: '#060c26', hor: '#1a2854', fog: '#141d40', fogN: 20, fogF: 90, sky: '#3c4fa8', ground: '#121730', hemiI: 0.8, fillCol: '#3a4cb0', fillI: 0.4, sunCol: '#b0b8ff', sunI: 1.6, az: 30, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#d8e2ff', fxTint: '#eef2ff', shafts: 0 },
  show: { top: '#000000', hor: '#2a2420', fog: '#2e2620', fogN: 12, fogF: 50, sky: '#e8dcc8', ground: '#4a3428', hemiI: 0.7, fillCol: '#8a90d0', fillI: 0.32, sunCol: '#fff0d0', sunI: 2.8, az: 35, el: 42, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff4ea', fxTint: '#ffffff', shafts: 0 },
  showShrink: { top: '#000000', hor: '#2a2420', fog: '#2e2620', fogN: 12, fogF: 50, sky: '#e8dcc8', ground: '#4a3428', hemiI: 0.7, fillCol: '#8a90d0', fillI: 0.32, sunCol: '#fff0d0', sunI: 2.8, az: 35, el: 42, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff4ea', fxTint: '#ffffff', shafts: 0 },
  k67: { top: '#000000', hor: '#3a2a1a', fog: '#3a2a1a', fogN: 12, fogF: 45, sky: '#f0dcb8', ground: '#5a4028', hemiI: 0.78, fillCol: '#8a90d0', fillI: 0.3, sunCol: '#ffe0a8', sunI: 3.0, az: -60, el: 34, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff6ea', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  kitchenNight: { look: 'night', over: { exp: 1.0, con: 1.24, sat: 1.1, lift: [0.015, 0.02, 0.05], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.5, 0.66], hal: [0.32, '#ffa050'], vig: [0.42, 0.42, '#04061a'] } },
  kitchenEnd: { look: 'night', over: { exp: 1.02, con: 1.22, sat: 1.12, lift: [0.02, 0.02, 0.05], tS: ['#2a2a7a', 0.24], tH: ['#ffc070', 0.16], bloom: [0.5, 0.66], hal: [0.34, '#ffa050'], vig: [0.4, 0.42, '#06041a'] } },
  lab: { look: 'office', over: { exp: 1.0, con: 1.22, sat: 1.08, lift: [0.03, 0.026, 0.045], tS: ['#2a3a6a', 0.18], tH: ['#ffe0b8', 0.08], bloom: [0.42, 0.8], hal: [0.22, '#ffb070'], vig: [0.32, 0.46, '#1a1424'] } },
  labPocket: { look: 'night', over: { exp: 1.0, con: 1.24, sat: 1.06, lift: [0.03, 0.02, 0.05], tS: ['#2a1a6a', 0.22], tH: ['#ffe0c0', 0.1], bloom: [0.5, 0.66], hal: [0.26, '#a080ff'], vig: [0.42, 0.42, '#0a0418'] } },
  labWarm: { look: 'golden', over: { exp: 1.0, con: 1.22, sat: 1.08, lift: [0.035, 0.02, 0.045], tS: ['#3a2a6a', 0.2], tH: ['#ffc888', 0.12], bloom: [0.46, 0.72], hal: [0.3, '#ff9a50'], vig: [0.38, 0.44, '#14081a'] } },
  inside: { look: 'night', over: { exp: 1.04, con: 1.2, sat: 1.12, lift: [0.02, 0.026, 0.065], tS: ['#1a2a7a', 0.26], tH: ['#ffd090', 0.12], bloom: [0.54, 0.62], hal: [0.34, '#a070ff'], vig: [0.4, 0.42, '#04061a'] } },
  show: { look: 'office', over: { exp: 1.0, con: 1.2, sat: 1.12, lift: [0.03, 0.024, 0.04], tS: ['#3a3a7a', 0.16], tH: ['#ffe8c0', 0.08], bloom: [0.42, 0.8], hal: [0.22, '#ffb070'], vig: [0.3, 0.48, '#1a1424'] } },
  showShrink: { look: 'office', over: { exp: 1.0, con: 1.2, sat: 1.12, lift: [0.03, 0.024, 0.04], tS: ['#3a3a7a', 0.16], tH: ['#ffe8c0', 0.08], bloom: [0.42, 0.8], hal: [0.22, '#ffb070'], vig: [0.3, 0.48, '#1a1424'] } },
  k67: { look: 'golden', over: { exp: 0.98, con: 1.2, sat: 1.14, lift: [0.035, 0.024, 0.03], tS: ['#3a2a7a', 0.16], tH: ['#ffd8a0', 0.1], bloom: [0.42, 0.78], hal: [0.24, '#ffa060'], vig: [0.3, 0.48, '#1e1a3a'] } },
};

export function buildMW(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'lab', micro: { on: 0, open: 0, bag: 0, disp: '' }, mag: 0, ins: { jig: 0.1, heat: 0, wave: 0 }, show: {}, m67: { drop: 1, on: 0 }, pop: -1, steamK: -1, steamI: -1 };
  let kt, lb, ins, sh, k6;
  const API = makeAPI(ctx, { prefix: 'mw_', origin: MW_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { kitchenNight: 'office', kitchenEnd: 'office', lab: 'office', labPocket: 'office', labWarm: 'office', inside: 'explain', show: 'office', showShrink: 'office', k67: 'office' },
    practicals: (name, F, W3) => { const fl = 1 + 0.05 * Math.sin(F * 0.7) + 0.03 * Math.sin(F * 1.9);
      if (name === 'kitchenNight' || name === 'kitchenEnd') return [{ p: W3('kitchen', [0, 1.2, -1.5]), col: '#ffb850', I: (0.8 + 4.5 * ST.micro.on) * fl, d: 4 }, { p: W3('kitchen', [-1.2, 1.9, 0.6]), col: '#ffc880', I: 1.4, d: 5 }, { p: W3('kitchen', [1.2, 1.9, 0.6]), col: '#ffc880', I: 1.4, d: 5 }, { p: W3('kitchen', [-1.8, 1.3, -2.0]), col: '#7a8aff', I: 2.0, d: 5 }];
      if (name === 'lab' || name === 'labPocket') return [{ p: W3('lab', [MWP.horn[0] + 0.7, 1.0, -0.6]), col: name === 'labPocket' ? '#c0a8ff' : '#a070ff', I: (name === 'labPocket' ? 0.8 : 0.3) + (name === 'labPocket' ? 1.6 : 3) * ST.mag * fl, d: 4 }, { p: W3('lab', [-1.6, 2.5, -0.6]), col: '#ffe0b0', I: name === 'labPocket' ? 2.5 : 3, d: 7 }, { p: W3('lab', [1.6, 2.5, -0.6]), col: '#ffe0b0', I: name === 'labPocket' ? 2.5 : 3, d: 7 }, { p: W3('lab', [-0.35, 1.3, -1.0]), col: '#ff9050', I: 2.5 * ST.mag, d: 3 }];
      if (name === 'labWarm') return [{ p: W3('lab', [MWP.desk[0] - 0.5, 1.3, MWP.desk[2] - 0.2]), col: '#ffc070', I: 1.8 * fl, d: 5 }, { p: W3('lab', [1.6, 2.5, -0.6]), col: '#ffc890', I: 3, d: 7 }, { p: W3('lab', [-1.6, 2.5, -0.6]), col: '#ffc890', I: 2.5, d: 7 }];
      if (name === 'inside') return [{ p: W3('inside', [-2.6, 1.8, -1.4]), col: '#b070ff', I: 6, d: 7 }, { p: W3('inside', [0, 1.8, -0.4]), col: ST.ins.heat > 0.3 ? '#ff7a30' : '#7a8aff', I: 3 + 7 * ST.ins.heat, d: 6 }, { p: W3('inside', [2.8, 2.4, -1.2]), col: '#ffd0a0', I: 2.5, d: 6 }];
      if (name === 'show' || name === 'showShrink') return [{ p: W3('show', [-1.4, 2.6, -1.2]), col: '#ffe8c0', I: 4.5, d: 7 }, { p: W3('show', [1.4, 2.6, -1.2]), col: '#ffe8c0', I: 4.5, d: 7 }, { p: W3('show', [0, 1.6, -0.6]), col: '#fff0d0', I: 3, d: 5 }];
      if (name === 'k67') return [{ p: W3('k67', [0, 1.9, 0.4]), col: '#ffd090', I: 4, d: 7 }, { p: W3('k67', [-1.6, 1.4, -1.6]), col: '#fff0c8', I: 3.5, d: 6 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'kitchen' && kt) { tickMotes(kt.dust, f, 0.2); setMicroG(kt.micro, { ...ST.micro, spin: T * 1.2 }, f); kt.mglow.material.opacity = 0.35 * ST.micro.on * (0.94 + 0.06 * Math.sin(f * 0.9));
        kt.steam.forEach((s, i) => { const k = ST.steamK; if (k < 0) { s.material.opacity = 0; return; } const t = ((f - k) / 40 + i / kt.steam.length) % 1, age = (f - k) / 30; const [x, y, z] = MWP.micro; s.position.set(x - 0.05 + Math.sin(i * 2.1 + T) * 0.1, y + 0.3 + t * 0.6, z + 0.25 + 0.05 * i % 0.2); s.scale.setScalar(0.4 + 0.8 * t); s.material.opacity = 0.25 * Math.sin(Math.PI * t) * clamp01(age * 2) * clamp01(3 - age); }); }
      if (cur === 'lab' && lb) { tickMotes(lb.dust, f, 0.3); lb.dish.rotation.y = T * 0.6; M.scope.map.offset.x = T * 0.5; lb.hornG.material.opacity = 0.4 * ST.mag * (0.9 + 0.1 * Math.sin(f * 1.3)); lb.coreG.material.opacity = 0.5 * ST.mag;
        lb.rings.forEach((r, i) => { const t = (T * 0.8 + i / lb.rings.length) % 1; r.position.set(MWP.horn[0] + 0.1 + t * 0.85, MWP.horn[1] - t * 0.1, MWP.horn[2] + t * 0.4); r.scale.setScalar(0.8 + t * 2.0); r.material.opacity = 0.35 * ST.mag * Math.sin(Math.PI * t); });
        const sh2 = ST.mood === 'lab'; lb.shaft.visible = lb.shaft2.visible = sh2; lb.lampG.material.opacity = ST.mood === 'labWarm' ? 0.6 : 0; lb.lamps.forEach((g) => (g.material.opacity = ST.mood === 'labPocket' ? 0.2 : 0.5)); setPops(f); }
      if (cur === 'inside' && ins) { tickMotes(ins.dust, f, 0.4); const j = ST.ins.jig, h = ST.ins.heat;
        ins.mols.forEach((g, i) => { const u = g.userData, a = j * 0.9, fq = 0.4 + 1.6 * j; g.rotation.set(u.r0[0] + a * Math.sin(f * fq + u.ph), u.r0[1] + a * Math.sin(f * fq * 1.3 + u.ph * 2), u.r0[2] + a * Math.cos(f * fq * 0.9 + u.ph)); const d = 0.05 * j; g.position.set(u.p[0] + d * Math.sin(f * fq * 1.7 + u.ph), u.p[1] + d * Math.cos(f * fq * 1.5 + u.ph), u.p[2] + d * Math.sin(f * fq * 1.1 + u.ph * 3)); u.o.material.emissive.setRGB(0.12 + 0.75 * h, 0.02 + 0.22 * h, 0); });
        ins.waves.forEach((w, i) => { const P = w.geometry.attributes.position, X0 = w.geometry.userData.x0, Y0 = w.geometry.userData.y0; for (let k = 0; k < P.count; k++) { const x = X0[k]; P.setY(k, Y0[k] + 0.22 * Math.sin(x * 4.2 - T * 9 + i * 1.3) * clamp01(x * 2)); } P.needsUpdate = true; w.material.opacity = 0.75 * ST.ins.wave; });
        ins.col.scale.y = 0.35 + 2.1 * h; ins.col.position.y = 0.2 + ins.col.scale.y / 2; ins.heatG.material.opacity = 0.4 * h; ins.coolG.material.opacity = 0.2 * (1 - h);
        ins.steam.forEach((s, i) => { const t = (T * 0.35 + i / ins.steam.length) % 1; s.position.set(ins.C[0] + Math.sin(i * 2.4) * 0.9, ins.C[1] + 0.9 + t * 1.6, ins.C[2] + 0.6 + Math.cos(i * 1.7) * 0.3); s.scale.setScalar(0.6 + t * 1.4); s.material.opacity = 0.35 * h * Math.sin(Math.PI * t); }); }
      if (cur === 'show' && sh) { tickMotes(sh.dust, f, 0.25); }
      if (cur === 'k67' && k6) { tickMotes(k6.dust, f, 0.25); setMicroG(k6.micro, { open: 0, on: ST.m67.on, bag: -1, spin: T, disp: '' }, f); } },
    mood: (name) => { ST.mood = name; if (lb) { lb.torso.visible = name === 'labPocket'; } },
    apply: (v) => { if (v.micro) API.setMicro(v.micro); if (v.mag != null) API.setMag(v.mag); if (v.ins) API.setInside(v.ins); if (v.show) API.setShow(v.show); if (v.m67) API.setK67(v.m67); if (v.candy) API.setCandy(v.candy); if (v.pop != null) API.setPop(v.pop); if (v.egg) API.setEgg(v.egg); if (v.stamp) API.setStamp(v.stamp); } });
  kt = buildKitchen(API.groups.kitchen); lb = buildLab(API.groups.lab); ins = buildInside(API.groups.inside); sh = buildShow(API.groups.show); k6 = buildK67(API.groups.k67);
  API.parts = { kt, lb, ins, sh, k6 };
  function setPops(f) { const t0 = ST.pop; if (t0 < 0) { lb.pops.visible = false; return; } lb.pops.visible = true; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3(), [bx, by, bz] = MWP.bag;
    lb.PP.forEach((p, i) => { const tf = f - t0 - p.t0; if (tf < 0) { m4.makeScale(0, 0, 0); lb.pops.setMatrixAt(i, m4); return; } let t = tf / 30, x = bx + p.vx * t, z = bz + p.vz * t, y = by + p.vy * t - 4.9 * t * t; const onBench = x > -1.6 && x < 1.2 && z > -1.9 && z < -0.95, fl = onBench && y > 0.5 ? 0.94 : 0.03;
      let rot = t * 8; if (y < fl) { const tl = (p.vy + Math.sqrt(p.vy * p.vy + 2 * 4.9 * (by - fl))) / 9.8, sl = Math.min(t, tl); x = bx + p.vx * sl; z = bz + p.vz * sl; y = fl; rot = sl * 8; const x2 = x + p.vx * 0.06 * clamp01((t - sl) * 4), z2 = z + p.vz * 0.06 * clamp01((t - sl) * 4); x = x2; z = z2; }
      const k = Math.min(1, tf / 3); e.set(p.rx + rot, p.ry + rot * 0.7, 0); q.setFromEuler(e); m4.compose(v.set(x, y, z), q, s.setScalar(p.s * (0.4 + 0.6 * k))); lb.pops.setMatrixAt(i, m4); }); lb.pops.instanceMatrix.needsUpdate = true; }
  // kitchen microwave { on, open, bag (-1 hidden, 0..1 puffed), disp } ; steam start frame
  API.setMicro = (s) => { Object.assign(ST.micro, s); if (s.steam !== undefined) ST.steamK = s.steam; };
  API.setMag = (k) => { ST.mag = k; };
  // CHOCO: { where: 'kitchen'|'lab', p (set-local), melt, expr, t, bounce, s, ry, lean, puddle, peek, stain }
  API.setCandy = (c) => { setCandyG(kt.candy, c && c.where === 'kitchen' ? c : null); setCandyG(lb.candy, c && c.where === 'lab' ? c : null); const st = c && c.where === 'lab' ? (c.stain || 0) : 0; lb.torso.userData.stain.scale.set(0.01 + 0.45 * st, 1, 0.01 + 0.85 * st); };
  API.setPop = (f0) => { ST.pop = f0; };
  // egg: { on, burst (0..1), splat: [x,y,z] set-local or null, s }
  API.setEgg = (e) => { lb.eggG.visible = !!e.on; lb.egg.visible = (e.burst || 0) < 0.01; lb.egg.scale.set(1 + 0.3 * (e.swell || 0), 1.3 + 0.3 * (e.swell || 0), 1 + 0.3 * (e.swell || 0)); lb.splat.visible = !!e.splat; if (e.splat) { lb.splat.position.set(...e.splat); lb.splat.scale.setScalar(e.s || 1); if (H.CAM) lb.splat.quaternion.copy(H.CAM.quaternion); } };
  // stamp: { y (lift 0..1), filed (bool), on }
  API.setStamp = (s) => { const [dx, , dz] = MWP.desk; lb.stamp.visible = s.on !== false; lb.stamp.position.set(dx + 0.05, 0.79 + 0.3 * (s.y ?? 1), dz + 0.05); lb.doc.material = s.filed ? M.docF : M.doc; lb.doc.visible = s.on !== false; };
  API.setInside = (s) => { Object.assign(ST.ins, s); };
  // show: { rul 0..1 (marker to 6 ft), w lb, price $, tag 0..1, shrink 0..1, year, on }
  API.setShow = (s) => { const L = sh.last; sh.marker.position.y = 0.12 + 1.83 * (s.rul || 0); sh.marker.visible = (s.rul || 0) > 0.001;
    const a = -(Math.PI * 0.75) + (Math.min(800, s.w || 0) / 800) * Math.PI * 1.5; sh.needle.rotation.z = -a;
    const p = Math.round((s.price || 0) / 50) * 50, ps = '$' + p.toLocaleString('en-US'); if (L.ps !== ps) { L.ps = ps; const g = sh.tagC.getContext('2d'); priceTex(g, 512, 256); txt(g, ps, 280, 132, 400, 130, { col: '#a02020', font: SANS }); sh.tagT.needsUpdate = true; }
    sh.tagP.visible = (s.tag || 0) > 0.01; sh.tagP.rotation.set(0, (1 - (s.tag || 0)) * Math.PI * 0.9 + 0.08 * Math.sin((s.t || 0) * 0.15), 0.06 * Math.sin((s.t || 0) * 0.11));
    const k = 1 - 0.78 * (s.shrink || 0); sh.oven.scale.setScalar(k); sh.oven.position.y = 0.12; sh.oven.userData.win.material.opacity = s.on || 0;
    const ys = String(Math.round(s.year || 1947)); if (L.ys !== ys) { L.ys = ys; const g = sh.yearC.getContext('2d'); yearTex(g, 512, 192); for (let i = 0; i < 4; i++) txt(g, ys[i], 512 * (0.14 + i * 0.24), 100, 100, 140, { col: '#f6f0e0', font: SANS }); sh.yearT.needsUpdate = true; } };
  API.setK67 = (s) => { Object.assign(ST.m67, s); const d = clamp01(s.drop ?? 1), bo = s.squash || 0; k6.micro.position.set(MWP.micro67[0], MWP.micro67[1] + (1 - d) * (1 - d) * 1.6, MWP.micro67[2]); k6.micro.scale.set(1 + 0.12 * bo, 1 - 0.18 * bo, 1 + 0.12 * bo); k6.micro.rotation.z = (1 - d) * 0.3; };
  API.glows = { kitchen: [...kt.lamps, ...kt.under, kt.mglow, ...kt.steam], lab: [...lb.lamps, lb.lampG, lb.hornG, lb.coreG], inside: [ins.heatG, ins.coolG, ...ins.steam], show: [...sh.lamps, sh.spot], k67: [...k6.lamps] };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); if (API.cur === 'lab') lb.splat.quaternion.copy(cam.quaternion); };
  const V = API.V;
  API.views = [
    V('kitchenNight', [0.3, 1.35, 0.6], [0, 1.08, -2.1], 40, 1.4, [0, 1.1, -2.0], { micro: { on: 1, open: 0, bag: 0.6, disp: '0:02' }, candy: { where: 'kitchen', p: MWP.candyK, expr: 'happy' } }), // 0 kitchen hero
    V('kitchenNight', [1.6, 1.7, 3.2], [-0.2, 1.1, -2.0], 46, 0.8, [0, 1.1, -2.0], { micro: { on: 1, open: 0.6, bag: 1, disp: 'END' } }), // 1 kitchen wide
    V('lab', [1.2, 1.6, 2.6], [-0.2, 1.15, -1.4], 46, 1.0, [0, 1.1, -1.3], { mag: 1, pop: -1 }), // 2 lab wide
    V('labPocket', [0.0, 1.22, 0.25], [-0.25, 1.18, -0.55], 40, 2.0, [-0.2, 1.2, -0.4], { mag: 1, candy: { where: 'lab', p: [MWP.torso[0] - 0.2, 1.14, MWP.torso[2] + 0.16], melt: 0.5, expr: 'nervous', stain: 0.5 } }), // 3 pocket insert
    V('inside', [0, 1.9, 4.2], [0, 1.6, -2.4], 46, 0.6, [0, 1.6, -2.4], { ins: { jig: 0.8, heat: 0.6, wave: 1 } }), // 4 inside
    V('show', [0.6, 1.5, 3.4], [0, 1.1, -2.0], 44, 1.0, [0, 1.0, -2.0], { show: { rul: 1, w: 750, price: 5000, tag: 1, year: 1947, on: 0.6 } }), // 5 showroom
    V('k67', [0.6, 1.45, 1.4], [0.1, 1.1, -2.2], 44, 1.2, [0.1, 1.1, -2.2], { m67: { drop: 1, on: 1 } }), // 6 1967 kitchen
    V('labWarm', [MWP.desk[0] - 0.3, 1.5, MWP.desk[2] + 1.6], [MWP.desk[0], 0.85, MWP.desk[2]], 42, 1.2, [MWP.desk[0], 0.8, MWP.desk[2]], { stamp: { y: 0.4, filed: true } }), // 7 desk
  ];
  API.setMicro({ on: 0, open: 0, bag: 0, disp: '' }); API.setShow({ rul: 0, w: 0, price: 0, tag: 0, year: 1947 }); API.setK67({ drop: 1, on: 0 }); API.setCandy(null); API.setEgg({ on: false }); API.setStamp({ y: 1, filed: false, on: true }); API.tick(0);
  return API;
}
