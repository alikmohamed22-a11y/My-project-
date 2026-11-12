// doh_homes.js [PD-sets1]: sets for "Play-Doh was invented to clean your walls" (Oddverra short).
//   parlor    : 1930s coal-heated living room, winter afternoon: pot-belly coal stove (glowing grate, stovepipe), coal scuttle, rose-stripe
//               wallpaper with a SOOT overlay (soot(k)), a CLEAN STRIPE rolled across it (stripe(t)), lace-curtain window onto a smoky
//               brick street, cathedral radio, floral armchair, fringed floor lamp, 1934 calendar, rug, fern.        origin (-19000, 0, 0)
//   home50    : post-war 1950s kitchen, bright morning: glossy vinyl wallpaper (atomic stars), wall GAS HEATER with blue flames,
//               starburst clock, rounded fridge, chrome dinette, window over the sink, crayon smudge wiped by a sponge (wipe(t)),
//               a forgotten wall-cleaner can gathering dust on the shelf.                                          origin (-19000, 0, 600)
//   classroom : 1950s nursery-school classroom, sunny: chalkboard (chalk PLAY-DOH written by title(t)), alphabet frieze, kids' paintings,
//               low round tables with tiny chairs, off-white dough shapes (shapes(k)), teacher's desk + newspaper clipping, radiator,
//               big windows with sun shafts + dust, paper chains.                                                  origin (-19000, 0, 1200)
// Each set: local frame, ground y = 0, camera side +z. All groups start hidden; show(world, name) displays one.
import { Kit } from './world.js';
import { H, INK, TAU, clamp01, sm, backOut, SERIF, SANS, cyl, sph, tor, plane, planeUV, lathe, mesh, nond, lumpGeo, doughGeo, snakeGeo, shapeGeo, starPts, heartPts,
  txt, grain, scrib, printLines, glowAt, shaftAt, motes, tickMotes, canLabel, makeAPI, initDoh } from './doh_kit.js';

export const HOMES_ORIGIN = { parlor: [-19000, 0, 0], home50: [-19000, 0, 600], classroom: [-19000, 0, 1200] };
let THREE, PT, M;

// ---------------------------------------------------------------- painters
function wallpaper30(g, w, h) { // 1930s dusty-rose stripe with cream floral sprigs
  g.fillStyle = '#d6aa98'; g.fillRect(0, 0, w, h); const R = PT.rng(1934);
  for (let i = 0; i < 4; i++) { const x = (i + 0.5) * w / 4; g.fillStyle = '#ead2bc'; g.fillRect(x - w * 0.05, 0, w * 0.1, h); g.fillStyle = '#b8806e'; g.fillRect(x - w * 0.056, 0, w * 0.006, h); g.fillRect(x + w * 0.05, 0, w * 0.006, h); }
  const sprig = (x, y, s) => { g.save(); g.translate(x, y); g.strokeStyle = '#6a7a52'; g.lineWidth = 2.4 * s; g.beginPath(); g.moveTo(0, 18 * s); g.quadraticCurveTo(4 * s, 0, 0, -16 * s); g.stroke();
    for (const k of [-1, 1]) { g.fillStyle = '#7a8a5e'; g.beginPath(); g.ellipse(k * 7 * s, 6 * s, 7 * s, 3 * s, k * 0.6, 0, TAU); g.fill(); }
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; g.fillStyle = '#c45a5a'; g.beginPath(); g.ellipse(Math.cos(a) * 6 * s, -18 * s + Math.sin(a) * 6 * s, 5 * s, 5 * s, 0, 0, TAU); g.fill(); } g.fillStyle = '#f0d070'; g.beginPath(); g.arc(0, -18 * s, 3.4 * s, 0, TAU); g.fill(); g.restore(); };
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { sprig((i + 0.5) * w / 4, (j + 0.5) * h / 4 + (i % 2) * h / 8, 1.5); sprig(i * w / 4, (j + 0.25) * h / 4, 0.8); }
  PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, 7)); grain(g, w, h, 'rgba(90,50,40,1)', 900, 3, 0.15); }
function sootTex(g, w, h) { // transparent soot: grimy everywhere, heavy along the ceiling, plume above the stove (u≈0.64), drips + streaks
  const d = g.createImageData(w, h), R = PT.rng(77);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const u = x / w, v = y / h, top = Math.pow(1 - v, 1.3), plume = Math.exp(-((u - 0.64) ** 2) / 0.008) * Math.pow(1 - v, 0.5), n = PT.fbm(u, v, 8, 6, 4, 9), n2 = PT.fbm(u, v, 24, 4, 3, 4), streak = 0.3 * Math.max(0, Math.sin(u * 140 + n * 8)) * (0.3 + top);
    const a = clamp01(0.6 + 0.35 * top + 0.5 * plume + streak + (n - 0.5) * 0.6 + (n2 - 0.5) * 0.25), i = (y * w + x) * 4; d.data[i] = 46 + 16 * n; d.data[i + 1] = 38 + 12 * n; d.data[i + 2] = 36 + 10 * n; d.data[i + 3] = 255 * Math.min(0.9, a); }
  g.putImageData(d, 0, 0); g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(0,0,0,${0.04 + R() * 0.1})`; g.beginPath(); g.arc(R() * w, h * (0.45 + R() * 0.55), 4 + R() * 12, 0, TAU); g.fill(); } g.globalCompositeOperation = 'source-over';
  g.strokeStyle = 'rgba(20,16,18,0.55)'; g.lineCap = 'round'; for (let i = 0; i < 70; i++) { const x = R() * w, y0 = R() * h * 0.5; g.lineWidth = 1 + R() * 3; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (R() - 0.5) * 6, y0 + 20 + R() * 90); g.stroke(); } }
function rugTex(g, w, h) { g.fillStyle = '#7a2a2e'; g.fillRect(0, 0, w, h); const B = (i, c) => { g.strokeStyle = c; g.lineWidth = w * 0.02; g.strokeRect(i, i, w - 2 * i, h - 2 * i); };
  B(w * 0.03, '#2a2a4a'); B(w * 0.07, '#d8b070'); B(w * 0.1, '#2a3a5a');
  g.save(); g.translate(w / 2, h / 2); for (let k = 0; k < 3; k++) { g.fillStyle = ['#2a3a5a', '#d8b070', '#a84a3a'][k]; g.beginPath(); const r = w * (0.24 - k * 0.07); g.moveTo(0, -r * 0.8); g.lineTo(r, 0); g.lineTo(0, r * 0.8); g.lineTo(-r, 0); g.closePath(); g.fill(); } g.restore();
  const R = PT.rng(4); for (let i = 0; i < 40; i++) { g.fillStyle = ['#d8b070', '#2a3a5a', '#e8dcc0'][i % 3]; const x = w * (0.15 + 0.7 * R()), y = h * (0.15 + 0.7 * R()); g.beginPath(); g.arc(x, y, 3 + R() * 4, 0, TAU); g.fill(); }
  PT.modulate(g, w, h, (u, v) => 0.85 + 0.2 * PT.fbm(u, v, 6, 6, 3, 2)); }
function winterOut(g, w, h) { // smoky 1930s brick rowhouses, chimneys belching coal smoke, grey winter sky
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8a8aa0'); gr.addColorStop(0.6, '#c8c0bc'); gr.addColorStop(1, '#e4dcd4'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = PT.rng(31);
  for (let i = 0; i < 7; i++) { const x = i * w / 6 - 20, bw = w / 6 + 10, top = h * (0.34 + R() * 0.12); g.fillStyle = ['#8a4a3e', '#7a4238', '#94523e'][i % 3]; g.fillRect(x, top, bw, h); g.fillStyle = '#4a3a3e'; g.fillRect(x - 4, top - 8, bw + 8, 10);
    for (let k = 0; k < 2; k++) { const cx = x + bw * (0.25 + k * 0.5); g.fillStyle = '#6a3a32'; g.fillRect(cx - 8, top - 40, 16, 34); // chimney + smoke
      for (let s = 0; s < 7; s++) { g.fillStyle = `rgba(${70 + s * 12},${66 + s * 12},${74 + s * 12},${0.55 - s * 0.06})`; g.beginPath(); g.arc(cx + s * 9 + Math.sin(s) * 6, top - 50 - s * 22, 12 + s * 6, 0, TAU); g.fill(); } }
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { g.fillStyle = R() < 0.4 ? '#f0c070' : '#3a3a52'; g.fillRect(x + bw * (0.2 + c * 0.42), top + 30 + r * 60, bw * 0.2, 34); } }
  g.fillStyle = '#d8d4d8'; g.fillRect(0, h * 0.88, w, h); g.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 90; i++) { g.beginPath(); g.arc(R() * w, R() * h, 1 + R() * 2.5, 0, TAU); g.fill(); } }
function calendarTex(g, w, h, year, mon, col) { PT.paper(g, w, h, { base: '#f4ecd8', seed: 5 }); g.fillStyle = col; g.fillRect(0, 0, w, h * 0.42);
  // picture: a coal truck / delivery cart silhouette (no brand)
  g.fillStyle = '#f4ecd8'; g.fillRect(w * 0.08, h * 0.05, w * 0.84, h * 0.32); g.fillStyle = '#4a4a5a'; g.fillRect(w * 0.2, h * 0.16, w * 0.4, h * 0.12); g.fillRect(w * 0.6, h * 0.19, w * 0.18, h * 0.09); g.fillStyle = '#222'; for (const x of [0.3, 0.68]) { g.beginPath(); g.arc(w * x, h * 0.29, w * 0.05, 0, TAU); g.fill(); }
  g.fillStyle = '#1a1a1a'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(w * (0.25 + i * 0.06), h * 0.155, w * 0.035, 0, TAU); g.fill(); }
  txt(g, mon, w / 2, h * 0.5, w * 0.8, h * 0.08, { col }); txt(g, year, w / 2, h * 0.6, w * 0.8, h * 0.09, { col: INK });
  g.strokeStyle = 'rgba(60,40,40,0.5)'; g.lineWidth = 1.5; for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) { g.strokeRect(w * (0.08 + c * 0.12), h * (0.68 + r * 0.06), w * 0.12, h * 0.06); g.fillStyle = 'rgba(60,40,40,0.7)'; g.font = `${h * 0.03}px ${SANS}`; g.fillText(String(r * 7 + c + 1).slice(0, 2), w * (0.09 + c * 0.12), h * (0.705 + r * 0.06)); } }
function vinylTex(g, w, h) { // 1950s glossy vinyl: cream with teal/coral atomic starbursts and little teapots
  g.fillStyle = '#f4ecd2'; g.fillRect(0, 0, w, h); const R = PT.rng(1953);
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(120,200,190,0.22)'; g.fillRect(i * w / 6, 0, w / 12, h); }
  const star = (x, y, r, c) => { g.strokeStyle = c; g.lineWidth = 2.4; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke(); g.fillStyle = c; g.beginPath(); g.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 3.2, 0, TAU); g.fill(); } };
  const pot = (x, y, s, c) => { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = c; g.beginPath(); g.ellipse(0, 0, 18, 14, 0, 0, TAU); g.fill(); g.fillRect(-10, -18, 20, 6); g.beginPath(); g.moveTo(16, -2); g.lineTo(30, -12); g.lineTo(28, -6); g.lineTo(16, 6); g.fill(); g.strokeStyle = c; g.lineWidth = 3; g.beginPath(); g.arc(-20, 0, 8, Math.PI * 0.5, Math.PI * 1.5); g.stroke(); g.restore(); };
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const x = (i + 0.5) * w / 4 + (j % 2) * w / 8, y = (j + 0.5) * h / 4; if ((i + j) % 2) star(x, y, 22, '#e06a50'); else pot(x, y, 1, '#3aa0a0'); star(x + w / 8, y + h / 8, 9, '#d8a030'); }
  PT.modulate(g, w, h, (u, v) => 0.97 + 0.05 * PT.fbm(u, v, 4, 4, 2, 3)); }
function smudgeTex(g, w, h) { g.clearRect(0, 0, w, h); const R = PT.rng(8); // crayon scribbles + greasy fingerprints (to be wiped off)
  for (const [c, n] of [['rgba(210,40,60,0.9)', 5], ['rgba(40,90,200,0.85)', 4], ['rgba(70,50,40,0.45)', 6]]) { g.strokeStyle = c; g.lineWidth = 7; g.lineCap = 'round'; for (let k = 0; k < n; k++) { g.beginPath(); let x = w * (0.15 + R() * 0.6), y = h * (0.2 + R() * 0.6); g.moveTo(x, y); for (let s = 0; s < 6; s++) { x += (R() - 0.5) * w * 0.3; y += (R() - 0.5) * h * 0.3; g.lineTo(x, y); } g.stroke(); } }
  // a crayon stick-figure sun
  g.strokeStyle = 'rgba(240,170,30,0.95)'; g.lineWidth = 6; g.beginPath(); g.arc(w * 0.75, h * 0.3, h * 0.12, 0, TAU); g.stroke(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; g.beginPath(); g.moveTo(w * 0.75 + Math.cos(a) * h * 0.16, h * 0.3 + Math.sin(a) * h * 0.16); g.lineTo(w * 0.75 + Math.cos(a) * h * 0.24, h * 0.3 + Math.sin(a) * h * 0.24); g.stroke(); } }
function suburbTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6aa8f0'); gr.addColorStop(0.7, '#cfe8ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = PT.rng(55);
  for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(255,255,255,0.9)'; const x = R() * w, y = h * (0.1 + R() * 0.25); for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x + k * 22, y + Math.sin(k) * 6, 18 + R() * 10, 0, TAU); g.fill(); } }
  g.fillStyle = '#7ac060'; g.fillRect(0, h * 0.62, w, h); for (let i = 0; i < 3; i++) { const x = w * (0.08 + i * 0.33), c = ['#f2c8d0', '#c8e0f0', '#f4e4a8'][i]; g.fillStyle = c; g.fillRect(x, h * 0.45, w * 0.24, h * 0.2); g.fillStyle = '#5a5a7a'; g.beginPath(); g.moveTo(x - 10, h * 0.45); g.lineTo(x + w * 0.12, h * 0.36); g.lineTo(x + w * 0.24 + 10, h * 0.45); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(x + w * 0.04, h * 0.5, w * 0.05, h * 0.06); g.fillRect(x + w * 0.15, h * 0.5, w * 0.05, h * 0.06); }
  g.fillStyle = '#ffffff'; for (let x = 0; x < w; x += 14) { g.fillRect(x, h * 0.66, 8, h * 0.08); g.beginPath(); g.moveTo(x, h * 0.66); g.lineTo(x + 4, h * 0.645); g.lineTo(x + 8, h * 0.66); g.fill(); } g.fillRect(0, h * 0.68, w, 4);
  for (let i = 0; i < 6; i++) { g.fillStyle = '#4a9a48'; g.beginPath(); g.arc(R() * w, h * 0.6, 22 + R() * 18, 0, TAU); g.fill(); } }
function checkTex(g, w, h, a, b) { const n = 8, s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s); } PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 2)); }
function chalkBase(g, w, h) { g.fillStyle = '#2a4a3a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.85 + 0.3 * PT.fbm(u, v, 4, 2, 4, 12)); const R = PT.rng(44);
  g.fillStyle = 'rgba(220,230,220,0.07)'; for (let i = 0; i < 26; i++) { g.beginPath(); g.ellipse(R() * w, R() * h, 40 + R() * 120, 12 + R() * 30, R() * 3, 0, TAU); g.fill(); }
  const ch = 'rgba(244,240,226,0.9)'; g.strokeStyle = ch; g.lineWidth = 5; g.lineCap = 'round';
  // left: sun + house doodle; right: 1 2 3 and A B C
  g.strokeStyle = 'rgba(255,220,120,0.9)'; g.beginPath(); g.arc(w * 0.1, h * 0.25, h * 0.08, 0, TAU); g.stroke(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; g.beginPath(); g.moveTo(w * 0.1 + Math.cos(a) * h * 0.11, h * 0.25 + Math.sin(a) * h * 0.11); g.lineTo(w * 0.1 + Math.cos(a) * h * 0.16, h * 0.25 + Math.sin(a) * h * 0.16); g.stroke(); }
  g.strokeStyle = ch; g.beginPath(); g.moveTo(w * 0.05, h * 0.85); g.lineTo(w * 0.05, h * 0.62); g.lineTo(w * 0.1, h * 0.5); g.lineTo(w * 0.15, h * 0.62); g.lineTo(w * 0.15, h * 0.85); g.closePath(); g.stroke(); g.strokeRect(w * 0.085, h * 0.72, w * 0.03, h * 0.13);
  txt(g, '1 2 3', w * 0.88, h * 0.3, w * 0.2, h * 0.16, { col: 'rgba(244,240,226,0.85)', font: SANS }); txt(g, 'A B C', w * 0.88, h * 0.62, w * 0.2, h * 0.16, { col: 'rgba(255,200,200,0.85)', font: SANS });
  grain(g, w, h, 'rgba(240,240,230,1)', 900, 3, 0.12); }
function chalkTitle(g, w, h) { g.clearRect(0, 0, w, h); const R = PT.rng(9); // chalk "PLAY-DOH" (plain text, period-friendly round letters) + underline
  for (let k = 0; k < 4; k++) txt(g, 'PLAY-DOH', w / 2 + (R() - 0.5) * 3, h * 0.46 + (R() - 0.5) * 3, w * 0.94, h * 0.62, { col: k ? 'rgba(250,246,232,0.25)' : 'rgba(250,246,232,0.95)', font: SERIF });
  g.strokeStyle = 'rgba(255,220,120,0.9)'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(w * 0.06, h * 0.86); g.quadraticCurveTo(w * 0.5, h * 0.94, w * 0.94, h * 0.84); g.stroke();
  g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 700; i++) { g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(R() * w, R() * h, 2, 2); } g.globalCompositeOperation = 'source-over'; }
function alphaTex(g, w, h) { const L = 'ABCDEFGHIJKLM', C = ['#e05050', '#f0a030', '#e8d040', '#60b050', '#40a0d0', '#7060c0', '#d060a0']; g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < L.length; i++) { const x = i * w / L.length; g.fillStyle = C[i % C.length]; g.fillRect(x + 4, 4, w / L.length - 8, h - 8); g.fillStyle = '#fffaf0'; g.fillRect(x + 10, 10, w / L.length - 20, h - 20); txt(g, L[i] + L[i].toLowerCase(), x + w / L.length / 2, h * 0.52, w / L.length - 24, h * 0.62, { col: C[i % C.length], font: SANS }); } }
function kidArt(g, w, h, k) { PT.paper(g, w, h, { base: '#fbf6ea', seed: k }); const R = PT.rng(k * 13 + 1), C = ['#e05050', '#f0a030', '#3a90d0', '#50a050', '#a050c0'];
  g.lineCap = 'round'; g.lineWidth = 8; if (k % 3 === 0) { g.fillStyle = '#f0c030'; g.beginPath(); g.arc(w * 0.7, h * 0.25, h * 0.12, 0, TAU); g.fill(); g.fillStyle = '#e05050'; g.fillRect(w * 0.2, h * 0.5, w * 0.4, h * 0.3); g.fillStyle = '#3a6ad0'; g.beginPath(); g.moveTo(w * 0.15, h * 0.5); g.lineTo(w * 0.4, h * 0.3); g.lineTo(w * 0.65, h * 0.5); g.fill(); }
  else if (k % 3 === 1) { for (let i = 0; i < 4; i++) { g.strokeStyle = C[i]; g.beginPath(); g.arc(w * 0.5, h * 0.9, h * (0.6 - i * 0.1), Math.PI, TAU); g.stroke(); } }
  else { g.strokeStyle = '#3a3a52'; g.beginPath(); g.arc(w * 0.5, h * 0.3, h * 0.12, 0, TAU); g.moveTo(w * 0.5, h * 0.42); g.lineTo(w * 0.5, h * 0.7); g.moveTo(w * 0.3, h * 0.52); g.lineTo(w * 0.7, h * 0.52); g.moveTo(w * 0.5, h * 0.7); g.lineTo(w * 0.35, h * 0.9); g.moveTo(w * 0.5, h * 0.7); g.lineTo(w * 0.65, h * 0.9); g.stroke(); g.fillStyle = '#e05050'; g.fillRect(w * 0.42, h * 0.45, w * 0.16, h * 0.2); }
  for (let i = 0; i < 6; i++) { g.fillStyle = C[(R() * 5) | 0]; g.beginPath(); g.arc(R() * w, R() * h, 4 + R() * 6, 0, TAU); g.fill(); } }
function newsTex(g, w, h) { PT.paper(g, w, h, { base: '#ece4cc', seed: 19 }); const R = PT.rng(1955);
  txt(g, 'THE MORNING STAR', w / 2, h * 0.07, w * 0.86, h * 0.07, { col: '#1e1a22', font: SERIF }); g.fillStyle = '#1e1a22'; g.fillRect(w * 0.05, h * 0.115, w * 0.9, 3); g.fillRect(w * 0.05, h * 0.125, w * 0.9, 1);
  // the clipping (circled): invented headline about kids' art with wallpaper cleaner
  const cx = w * 0.05, cy = h * 0.16, cw = w * 0.56, chh = h * 0.5; g.fillStyle = '#f6efd8'; g.fillRect(cx, cy, cw, chh);
  ['KIDS MAKE ART', 'WITH WALLPAPER', 'CLEANER!'].forEach((s, i) => txt(g, s, cx + cw / 2, cy + h * (0.05 + i * 0.07), cw * 0.94, h * 0.062, { col: '#1e1a22', font: SERIF }));
  // a little photo: child holding a dough figure
  g.fillStyle = '#8a8070'; g.fillRect(cx + cw * 0.08, cy + h * 0.25, cw * 0.4, h * 0.2); g.fillStyle = '#d8d0c0'; g.beginPath(); g.arc(cx + cw * 0.28, cy + h * 0.31, h * 0.035, 0, TAU); g.fill(); g.fillRect(cx + cw * 0.22, cy + h * 0.345, cw * 0.12, h * 0.1); g.fillStyle = '#f4f0e4'; g.beginPath(); g.ellipse(cx + cw * 0.38, cy + h * 0.39, cw * 0.05, h * 0.03, 0, 0, TAU); g.fill();
  printLines(g, cx + cw * 0.54, cy + h * 0.25, cw * 0.4, 10, h * 0.02, R);
  g.strokeStyle = '#d02a2a'; g.lineWidth = 6; g.beginPath(); g.ellipse(cx + cw / 2, cy + chh / 2 - h * 0.02, cw * 0.56, chh * 0.6, -0.04, 0, TAU); g.stroke(); // red pencil circle
  printLines(g, w * 0.66, h * 0.16, w * 0.29, 30, h * 0.026, R); printLines(g, w * 0.05, h * 0.7, w * 0.9, 10, h * 0.026, R); }
function frameArt(g, w, h, k) { g.fillStyle = ['#5a6a8a', '#8a6a4a'][k]; g.fillRect(0, 0, w, h); if (k === 0) { g.fillStyle = '#e8c8a0'; g.beginPath(); g.ellipse(w / 2, h * 0.45, w * 0.22, h * 0.26, 0, 0, TAU); g.fill(); g.fillStyle = '#3a2a2a'; g.beginPath(); g.ellipse(w / 2, h * 0.3, w * 0.24, h * 0.14, 0, Math.PI, TAU); g.fill(); g.fillStyle = '#4a4a6a'; g.fillRect(w * 0.2, h * 0.72, w * 0.6, h * 0.3); }
  else { g.fillStyle = '#a8c0d8'; g.fillRect(0, 0, w, h * 0.55); g.fillStyle = '#6a8a50'; g.beginPath(); g.moveTo(0, h * 0.7); g.lineTo(w * 0.3, h * 0.4); g.lineTo(w * 0.6, h * 0.62); g.lineTo(w, h * 0.45); g.lineTo(w, h); g.lineTo(0, h); g.fill(); }
  PT.modulate(g, w, h, (u, v) => 0.85 + 0.2 * PT.fbm(u, v, 3, 3, 3, k + 4)); }

// ---------------------------------------------------------------- materials
function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.floor = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a3a', n: 7, seed: 21 })) }); if (H.MACRO) H.MACRO(m.floor, 0.12, 0.05);
  m.wood = vc({ map: T(256, 256, (g, w, h) => PT.planks(g, w, h, { base: '#7a4a30', n: 4, seed: 33, joints: 0 })) });
  m.plaster = vc({ map: T(512, 512, (g, w, h) => { g.fillStyle = '#ece0c8'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.88 + 0.16 * PT.fbm(u, v, 5, 5, 4, 3)); grain(g, w, h, '#6a5040', 1200, 4, 0.2); }) });
  m.wp30 = toon({ map: T(512, 512, wallpaper30, [5, 2.2]), emissive: 0x1a0e0c }); m.wp30.emissiveMap = m.wp30.map;
  m.soot = new THREE.MeshBasicMaterial({ map: T(512, 256, sootTex), transparent: true, depthWrite: false, fog: false }); m.soot.polygonOffset = true; m.soot.polygonOffsetFactor = -1;
  m.rug = vc({ map: T(512, 384, rugTex) }); m.out30 = C.basic(T(1024, 512, winterOut), 1.05);
  m.cal34 = em(T(256, 384, (g, w, h) => calendarTex(g, w, h, '1934', 'JANUARY', '#8a2a2a')), 0x2a2018);
  m.fabric = vc({ map: T(256, 256, (g, w, h) => { PT.fabric(g, w, h, { base: '#8a6a5a' }); const R = PT.rng(3); for (let i = 0; i < 40; i++) { g.fillStyle = ['#c06a5a', '#e0b070', '#6a8a5a'][i % 3]; g.beginPath(); g.arc(R() * w, R() * h, 6 + R() * 6, 0, TAU); g.fill(); } }) });
  m.lace = toon({ map: T(128, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(250,246,236,0.55)'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 3; for (let y = 10; y < h; y += 26) for (let x = 10; x < w; x += 26) { g.beginPath(); g.arc(x + ((y / 26) % 2) * 13, y, 8, 0, TAU); g.stroke(); } g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillRect(0, h - 24, w, 24); }), transparent: true, depthWrite: false, emissive: 0x2a2620, side: THREE.DoubleSide });
  m.frames = [0, 1].map((k) => em(T(256, 320, (g, w, h) => frameArt(g, w, h, k)), 0x1a1410));
  m.iron = vc({ emissive: 0x08060c }); m.grate = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff7a20).multiplyScalar(1.9), fog: false });
  // home50
  m.vinyl = toon({ map: T(512, 512, vinylTex, [4.5, 2.2]), emissive: 0x141210 }); m.vinyl.emissiveMap = m.vinyl.map;
  m.smudge = toon({ map: T(512, 384, smudgeTex), transparent: true, depthWrite: false }); m.smudge.polygonOffset = true; m.smudge.polygonOffsetFactor = -1;
  m.tile50 = vc({ map: T(256, 256, (g, w, h) => checkTex(g, w, h, '#f2ead8', '#3aa0a0'), [6, 6]) });
  m.out50 = C.basic(T(512, 512, suburbTex), 1.15); m.enamel = vc({ emissive: 0x101010 }); m.vinylRed = vc({ emissive: 0x2a0606 });
  m.curtain50 = vc({ map: T(128, 128, (g, w, h) => { g.fillStyle = '#f8f0d8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 9; i++) { g.fillStyle = '#d83a3a'; g.beginPath(); g.arc((i % 3 + 0.5) * w / 3, ((i / 3 | 0) + 0.5) * h / 3, 7, 0, TAU); g.fill(); } }), side: THREE.DoubleSide });
  m.canWP = toon({ map: T(512, 256, (g, w, h) => canLabel(g, w, h, { base: '#e8dcc0', band: '#3a6a9a', ink: '#1e3a5a', deco: 'roller', lines: [['WALLPAPER', 0.3, 0.13], ['CLEANER', 0.45, 0.13, '#a8322a']] })), emissive: 0x1a1612 }); m.canWP.emissiveMap = m.canWP.map;
  // classroom
  m.wallY = vc({ map: T(512, 512, (g, w, h) => { g.fillStyle = '#f2dca0'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.14 * PT.fbm(u, v, 5, 5, 4, 8)); grain(g, w, h, '#8a6a40', 900, 4, 0.15); }) });
  m.lino = vc({ map: T(256, 256, (g, w, h) => { checkTex(g, w, h, '#d8c8a8', '#c8b48e'); grain(g, w, h, '#6a5a4a', 900, 7, 0.4); }, [8, 8]) });
  m.chalk = em(T(1024, 440, chalkBase), 0x101c14); m.chalkTitle = new THREE.MeshBasicMaterial({ map: T(1024, 300, chalkTitle), transparent: true, depthWrite: false, fog: false }); m.chalkTitle.color.setScalar(1.05);
  m.alpha = em(T(1536, 128, alphaTex), 0x2a2418); m.arts = [0, 1, 2, 3, 4, 5].map((k) => em(T(256, 320, (g, w, h) => kidArt(g, w, h, k)), 0x2a2420, { side: THREE.DoubleSide }));
  m.news = em(T(512, 640, newsTex), 0x2a2620, { side: THREE.DoubleSide }); m.out55 = C.basic(T(512, 512, suburbTex), 1.25);
  return m; }

// ---------------------------------------------------------------- props
function ceil(root, w, d, y, z, col) { const m = mesh(root, plane(w, d), H.toon({ color: col, side: THREE.DoubleSide }), 0, y, z, Math.PI / 2, 0, 0, false); m.receiveShadow = false; return m; }
function dough(K, x, y, z, s, R, col = 0xf2ead6) { K.put(M.dough, doughGeo((R() * 50) | 0, 0.1), x, y + s * 0.8, z, 0, R() * TAU, 0, s, s * 0.8, s, col); }
function coalLumps(K, x, y, z, n, r, R, spread = 0.12) { for (let i = 0; i < n; i++) { const a = R() * TAU, d = Math.sqrt(R()) * spread; K.put(M.coal, lumpGeo((R() * 9) | 0, 1, 0.35), x + Math.cos(a) * d, y + r * 0.6 + R() * r, z + Math.sin(a) * d, R(), R() * TAU, R(), r, r * 0.8, r, [0x1a1820, 0x24222a, 0x14121a][i % 3]); } }
function frame(K, root, x, y, z, w, h, mat, col = 0x6a4a2a) { mesh(root, plane(w, h), mat, x, y, z + 0.02, 0, 0, 0, false); const t = 0.05; K.box(M.wood, x - w / 2 - t, x + w / 2 + t, y - h / 2 - t, y - h / 2, z, z + 0.04, col, 0.01); K.box(M.wood, x - w / 2 - t, x + w / 2 + t, y + h / 2, y + h / 2 + t, z, z + 0.04, col, 0.01); K.box(M.wood, x - w / 2 - t, x - w / 2, y - h / 2, y + h / 2, z, z + 0.04, col, 0.01); K.box(M.wood, x + w / 2, x + w / 2 + t, y - h / 2, y + h / 2, z, z + 0.04, col, 0.01); }

// ================================================================= PARLOR (1930s)
function buildParlor(root) {
  const R = PT.rng(1930), K = new Kit(), X = 3.2, ZB = -2.6, HT = 2.9;
  mesh(root, planeUV(9, 8, 3, 2.6), M.floor, 0, 0, -0.6, -Math.PI / 2, 0, 0, false); mesh(root, plane(3.4, 2.4), M.rug, 0.1, 0.006, -0.7, -Math.PI / 2, 0, 0, false);
  // back wall (wallpaper plane, soot overlay, dynamic clean stripe) + side walls + ceiling
  K.box(M.plaster, -X - 0.3, X + 0.3, 0, HT, ZB - 0.25, ZB, 0xd8c8b0, 0.01);
  const wall = mesh(root, plane(2 * X, HT), M.wp30, 0, HT / 2, ZB + 0.005, 0, 0, 0, false);
  const soot = mesh(root, plane(2 * X, HT), M.soot, 0, HT / 2, ZB + 0.012, 0, 0, 0, false); soot.renderOrder = 2;
  const SY0 = 1.16, SY1 = 1.46, SX0 = -2.1, SX1 = 0.3;
  const sg = new THREE.PlaneGeometry(1, 1); const stripe = mesh(root, sg, M.wp30, 0, 0, ZB + 0.02, 0, 0, 0, false); stripe.renderOrder = 3;
  const setStripe = (t) => { const x1 = SX0 + (SX1 - SX0) * clamp01(t), p = sg.attributes.position, uv = sg.attributes.uv; stripe.visible = t > 0.003; const xs = [SX0, x1, SX0, x1], ys = [SY1, SY1, SY0, SY0];
    for (let i = 0; i < 4; i++) { const wob = (i % 2 ? 0.012 : 0); p.setXYZ(i, xs[i], ys[i] + (ys[i] > 1.3 ? wob : -wob), 0); uv.setXY(i, (xs[i] + X) / (2 * X), ys[i] / HT); } p.needsUpdate = true; uv.needsUpdate = true; sg.computeBoundingSphere(); return x1; };
  for (const s of [-1, 1]) { K.box(M.plaster, s * X - 0.2 * (s > 0 ? 0 : 1), s * X + 0.2 * (s > 0 ? 1 : 0), 0, HT, ZB, 1.6, 0xd8c8b0, 0.01); }
  mesh(root, plane(4.2, HT), M.wp30, X - 0.005, HT / 2, ZB + 2.1, 0, -Math.PI / 2, 0, false); mesh(root, plane(4.2, HT), M.wp30, -X + 0.005, HT / 2, ZB + 2.1, 0, Math.PI / 2, 0, false);
  mesh(root, plane(4.2, HT), M.soot, X - 0.012, HT / 2, ZB + 2.1, 0, -Math.PI / 2, 0, false).renderOrder = 2; mesh(root, plane(4.2, HT), M.soot, -X + 0.012, HT / 2, ZB + 2.1, 0, Math.PI / 2, 0, false).renderOrder = 2;
  ceil(root, 2 * X + 0.6, 4.6, HT, ZB + 2.0, 0xa89880);
  // trims: baseboard, chair rail, picture rail, crown
  for (const [y0, y1, d, c] of [[0, 0.16, 0.04, 0x4a2e1e], [0.86, 0.92, 0.035, 0x5a3a24], [2.34, 2.38, 0.03, 0x5a3a24], [HT - 0.12, HT, 0.08, 0x4a2e1e]]) { K.box(M.wood, -X, X, y0, y1, ZB, ZB + d, c, 0.008); K.box(M.wood, -X, -X + d, y0, y1, ZB, 1.6, c, 0.008); K.box(M.wood, X - d, X, y0, y1, ZB, 1.6, c, 0.008); }
  // left window with lace curtains onto the smoky street
  const WZ = -1.0, WW = 1.2, W0 = 0.95, W1 = 2.2; K.box(M.paint, -X - 0.05, -X + 0.06, W0 - 0.06, W0, WZ - WW / 2 - 0.1, WZ + WW / 2 + 0.1, 0xf0e8d8, 0.01);
  for (const dz of [-WW / 2, 0, WW / 2]) K.box(M.paint, -X - 0.04, -X + 0.04, W0, W1, WZ + dz - 0.03, WZ + dz + 0.03, 0xf0e8d8, 0.005); K.box(M.paint, -X - 0.04, -X + 0.04, (W0 + W1) / 2 - 0.03, (W0 + W1) / 2 + 0.03, WZ - WW / 2, WZ + WW / 2, 0xf0e8d8, 0.005);
  K.box(M.paint, -X - 0.04, -X + 0.06, W1, W1 + 0.1, WZ - WW / 2 - 0.12, WZ + WW / 2 + 0.12, 0xf0e8d8, 0.01);
  for (const s of [-1, 1]) { const lc = mesh(root, plane(0.34, W1 - W0 + 0.25), M.lace, -X + 0.1, (W0 + W1) / 2 + 0.05, WZ + s * (WW / 2 - 0.05), 0, Math.PI / 2, 0, false); lc.renderOrder = 4; }
  K.beam(M.brass, [-X + 0.12, W1 + 0.14, WZ - WW / 2 - 0.25], [-X + 0.12, W1 + 0.14, WZ + WW / 2 + 0.25], 0.015, 0xb88a40, true, 6);
  // wall cut-out behind the window plane so the outside reads: punch the side wall with four boxes around the opening
  // (side wall is a full box; we paint the opening with the outside plane slightly in front of it instead)
  mesh(root, plane(WW, W1 - W0), M.out30, -X + 0.014, (W0 + W1) / 2, WZ, 0, Math.PI / 2, 0, false);
  // right wall: panelled door + calendar on the back wall
  K.box(M.wood, X - 0.06, X, 0, 2.15, -1.3, -0.35, 0x5a3420, 0.01); for (const [y0, y1] of [[0.15, 0.95], [1.1, 2.0]]) K.box(M.wood, X - 0.09, X - 0.05, y0, y1, -1.2, -0.45, 0x6a4028, 0.01); K.put(M.brass, sph(0.035, 10, 8), X - 0.1, 1.0, -0.48, 0, 0, 0, 1, 1, 1, 0xd8b048);
  mesh(root, plane(0.36, 0.54), M.cal34, 2.45, 1.6, ZB + 0.03, 0, 0, 0, false); K.put(M.metal, sph(0.012, 6, 5), 2.45, 1.88, ZB + 0.04, 0, 0, 0, 1, 1, 1, 0x8a8a90);
  // picture frames + oval mirror-ish portrait + wall clock (above the stripe band)
  frame(K, root, -1.55, 1.98, ZB + 0.02, 0.42, 0.52, M.frames[0], 0x5a3a20); frame(K, root, -0.45, 2.0, ZB + 0.02, 0.62, 0.42, M.frames[1], 0x6a4a28);
  K.at(1.75, 1.95, ZB + 0.03, 0, () => { K.put(M.wood, cyl(0.17, 0.17, 0.05, 20), 0, 0, 0.02, Math.PI / 2, 0, 0, 1, 1, 1, 0x4a2a18); K.put(M.paint, cyl(0.14, 0.14, 0.01, 20), 0, 0, 0.05, Math.PI / 2, 0, 0, 1, 1, 1, 0xf4ecd8);
    K.cb(M.paint, 0.012, 0.1, 0.006, 0, 0.04, 0.058, 0x1a1420, 0, 0, 0.3); K.cb(M.paint, 0.01, 0.07, 0.006, 0.02, 0.02, 0.06, 0x1a1420, 0, 0, -1.3); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; K.cb(M.paint, 0.008, 0.02, 0.004, Math.sin(a) * 0.115, Math.cos(a) * 0.115, 0.058, 0x3a2a2a, 0, 0, -a); } });
  // the coal stove (pot-belly) + stovepipe + coal scuttle, shovel, poker; tin floor plate
  const SX = 0.95, SZ = ZB + 0.72; K.put(M.metal, cyl(0.55, 0.55, 0.01, 6), SX, 0.005, SZ, 0, 0.3, 0, 1, 1, 1, 0x8a8a90);
  K.at(SX, 0, SZ, 0, () => { for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.78; K.beam(M.iron, [Math.cos(a) * 0.2, 0.2, Math.sin(a) * 0.2], [Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3], 0.035, 0x2a2830, false); }
    K.put(M.iron, lathe('belly', [[0.001, 0.18], [0.24, 0.18], [0.27, 0.24], [0.25, 0.3], [0.33, 0.48], [0.36, 0.68], [0.32, 0.9], [0.24, 1.0], [0.26, 1.04], [0.2, 1.1], [0.001, 1.12]], 22), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0x2e2c36);
    for (const y of [0.3, 1.02]) K.put(M.brass, tor(y > 1 ? 0.26 : 0.27, 0.015, 6, 22), 0, y, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x8a8a96);
    K.cb(M.iron, 0.26, 0.2, 0.04, 0, 0.55, 0.33, 0x24222c, 0, 0, 0, 0.02); K.put(M.brass, sph(0.022, 8, 6), 0.1, 0.55, 0.36, 0, 0, 0, 1, 1, 1, 0xc8a050);
    K.cb(M.iron, 0.3, 0.05, 0.12, 0, 0.27, 0.28, 0x2a2830, 0, 0, 0, 0.01); K.beam(M.iron, [0, 1.1, -0.05], [0, 2.18, -0.05], 0.075, 0x2a2830, true, 14);
    K.put(M.iron, tor(0.12, 0.075, 8, 14, Math.PI / 2), 0, 2.18, -0.17, 0, Math.PI / 2, Math.PI, 1, 1, 1, 0x2a2830); K.beam(M.iron, [0, 2.3, -0.17], [0, 2.3, -0.76], 0.075, 0x2a2830, true, 14);
    K.put(M.iron, cyl(0.12, 0.12, 0.03, 14), 0, 2.3, -0.73, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a3842); for (const y of [1.45, 1.85]) K.put(M.iron, tor(0.078, 0.01, 5, 14), 0, y, -0.05, Math.PI / 2, 0, 0, 1, 1, 1, 0x4a4852); });
  const grate = mesh(root, plane(0.2, 0.12), M.grate, SX, 0.55, SZ + 0.355, 0, 0, 0, false); nond(grate); for (let i = 0; i < 4; i++) K.cb(M.iron, 0.012, 0.13, 0.01, SX - 0.075 + i * 0.05, 0.55, SZ + 0.358, 0x1a1820, 0, 0, 0, 0.003);
  const flames = [0, 1, 2].map((i) => { const f = nond(mesh(root, plane(0.08, 0.12), M.flame, SX - 0.06 + i * 0.06, 0.56, SZ + 0.35, 0, 0, 0, false)); f.renderOrder = 6; return f; });
  K.at(SX + 0.62, 0, SZ + 0.25, -0.3, () => { K.put(M.iron, lathe('scut', [[0.001, 0], [0.16, 0], [0.19, 0.05], [0.2, 0.32], [0.17, 0.38], [0.001, 0.36]], 16), 0, 0, 0, 0.25, 0, 0, 1, 1, 1, 0x3a3a46); K.put(M.brass, tor(0.13, 0.012, 6, 16, Math.PI), 0, 0.38, -0.02, 0.2, 0, 0, 1, 1, 1, 0x8a8a96); coalLumps(K, 0.0, 0.26, 0.05, 14, 0.055, R, 0.12); });
  coalLumps(K, SX + 0.35, 0, SZ + 0.55, 5, 0.04, R, 0.15);
  K.beam(M.iron, [SX - 0.5, 0, SZ + 0.1], [SX - 0.42, 0.75, SZ - 0.15], 0.018, 0x2a2830, true, 6); K.cb(M.iron, 0.12, 0.14, 0.02, SX - 0.5, 0.06, SZ + 0.12, 0x2a2830, 0.2, 0, 0.1, 0.01);
  // armchair (front left) + cathedral radio on a side table + fringed floor lamp
  K.at(-1.35, 0, -0.35, 0.75, () => { K.box(M.fabric, -0.42, 0.42, 0.18, 0.48, -0.4, 0.4, 0xffffff, 0.08); K.box(M.fabric, -0.42, 0.42, 0.45, 1.05, -0.42, -0.24, 0xffffff, 0.1); for (const s of [-1, 1]) K.box(M.fabric, s * 0.42 - 0.1, s * 0.42 + 0.1, 0.18, 0.7, -0.4, 0.38, 0xffffff, 0.08);
    K.box(M.fabric, -0.34, 0.34, 0.48, 0.58, -0.26, 0.34, 0xf0e0d0, 0.06); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.box(M.wood, sx * 0.38 - 0.03, sx * 0.38 + 0.03, 0, 0.18, sz * 0.34 - 0.03, sz * 0.34 + 0.03, 0x3a2418, 0.01); K.box(M.paint, -0.25, 0.25, 0.9, 1.0, -0.245, -0.235, 0xf8f4ea, 0.005); });
  K.at(-2.55, 0, -2.2, 0.5, () => { K.put(M.wood, cyl(0.24, 0.24, 0.03, 16), 0, 0.68, 0, 0, 0, 0, 1, 1, 1, 0x5a3420); K.put(M.wood, cyl(0.03, 0.04, 0.66, 8), 0, 0.34, 0, 0, 0, 0, 1, 1, 1, 0x4a2a18); K.put(M.wood, cyl(0.16, 0.18, 0.03, 12), 0, 0.02, 0, 0, 0, 0, 1, 1, 1, 0x4a2a18);
    K.box(M.wood, -0.16, 0.16, 0.69, 0.98, -0.1, 0.1, 0x6a3a20, 0.02); K.put(M.wood, cyl(0.16, 0.16, 0.2, 16, false), 0, 0.98, 0, Math.PI / 2, 0, 0, 1, 1, 0.5, 0x6a3a20); K.box(M.paint, -0.1, 0.1, 0.78, 1.02, 0.1, 0.105, 0xc8a070, 0.005);
    for (let i = -2; i <= 2; i++) K.cb(M.wood, 0.012, 0.24, 0.01, i * 0.035, 0.9, 0.11, 0x3a2010, 0, 0, i * 0.12, 0.004); for (const x of [-0.06, 0.06]) K.put(M.wood, cyl(0.018, 0.018, 0.02, 10), x, 0.74, 0.11, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a1810); });
  const dial = glowAt(root, [-2.55 + 0.08, 0.92, -2.1], 0.25, '#ffb050', 0.4);
  K.at(-1.95, 0, -1.25, 0, () => { K.put(M.brass, cyl(0.15, 0.18, 0.03, 14), 0, 0.015, 0, 0, 0, 0, 1, 1, 1, 0x6a5a3a); K.put(M.brass, cyl(0.015, 0.015, 1.5, 8), 0, 0.76, 0, 0, 0, 0, 1, 1, 1, 0x8a7040);
    K.put(M.paint, lathe('fshade', [[0.12, 0.25], [0.18, 0.2], [0.3, 0.0], [0.31, -0.02]], 18), 0, 1.5, 0, 0, 0, 0, 1, 1, 1, 0xd89a6a); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; K.cb(M.paint, 0.01, 0.07, 0.008, Math.cos(a) * 0.31, 1.45, Math.sin(a) * 0.31, 0xa86a3a, 0, -a, 0, 0.002); } K.put(M.lampGlass, sph(0.06, 10, 8), 0, 1.53, 0, 0, 0, 0, 1, 1, 1, 0xffffff); });
  const lampG = glowAt(root, [-1.95, 1.58, -1.25], 1.0, '#ffc070', 0.45);
  // ceiling bowl light
  K.beam(M.brass, [0.2, HT, -0.8], [0.2, HT - 0.35, -0.8], 0.01, 0x6a5a3a, true, 4); K.put(M.lampGlass, lathe('bowl', [[0.001, -0.08], [0.18, -0.02], [0.22, 0.03], [0.001, 0.03]], 18), 0.2, HT - 0.4, -0.8, 0, 0, 0, 1, 1, 1, 0xffffff);
  // foreground fern on a plant stand (right) + footstool
  K.at(2.75, 0, 0.55, 0, () => { K.put(M.wood, cyl(0.15, 0.12, 0.7, 10), 0, 0.35, 0, 0, 0, 0, 1, 1, 1, 0x5a3420); K.put(M.paint, lathe('pot', [[0.001, 0], [0.12, 0], [0.16, 0.18], [0.17, 0.2]], 14), 0, 0.7, 0, 0, 0, 0, 1, 1, 1, 0xa8583a);
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, L = 0.35 + R() * 0.2; K.cb(M.paint, 0.08, 0.012, L, Math.cos(a) * L * 0.45, 0.95 + R() * 0.08, Math.sin(a) * L * 0.45, i % 2 ? 0x4a8a3a : 0x3a7a32, 0.5, -a + Math.PI / 2, 0, 0.005); } });
  K.at(-0.9, 0, -0.1, 0.3, () => { K.box(M.fabric, -0.22, 0.22, 0.12, 0.3, -0.16, 0.16, 0xffffff, 0.06); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.box(M.wood, sx * 0.18 - 0.02, sx * 0.18 + 0.02, 0, 0.12, sz * 0.12 - 0.02, sz * 0.12 + 0.02, 0x3a2418, 0.005); });
  K.build(root, 3);
  const shafts = [shaftAt(root, [-X + 0.9, 1.25, WZ + 0.2], 1.2, 2.6, Math.PI / 2 - 0.15, -0.8, 0.12, 0xc8d4ff)];
  const stoveG = glowAt(root, [SX, 0.56, SZ + 0.42], 0.9, '#ff8a30', 0.55);
  const dust = motes(root, 70, [-X + 0.3, -0.5, 0.6, 2.4, -2.2, 0.2], 11, 0.008);
  return { setStripe, soot, stripe, flames, grate, glows: [stoveG, lampG, dial], stoveG, shafts, dust, SX, SZ, SY0, SY1, SX0, SX1, ZB, WZ };
}

// ================================================================= HOME50 (post-war kitchen)
function buildHome50(root) {
  const R = PT.rng(1950), K = new Kit(), X = 3.0, ZB = -2.4, HT = 2.7;
  mesh(root, planeUV(8, 7, 1, 1), M.tile50, 0, 0, -0.4, -Math.PI / 2, 0, 0, false);
  K.box(M.plaster, -X - 0.3, X + 0.3, 0, HT, ZB - 0.25, ZB, 0xf0e8d8, 0.01); mesh(root, plane(2 * X, HT), M.vinyl, 0, HT / 2, ZB + 0.005, 0, 0, 0, false);
  for (const s of [-1, 1]) K.box(M.plaster, s > 0 ? X : -X - 0.25, s > 0 ? X + 0.25 : -X, 0, HT, ZB, 1.8, 0xf0e8d8, 0.01);
  mesh(root, plane(4.2, HT), M.vinyl, X - 0.005, HT / 2, ZB + 2.1, 0, -Math.PI / 2, 0, false); ceil(root, 2 * X + 0.6, 4.6, HT, ZB + 2.0, 0xf4f0e8);
  for (const [y0, y1, c] of [[0, 0.1, 0x2a6a6a], [HT - 0.08, HT, 0xf4f0e8]]) { K.box(M.paint, -X, X, y0, y1, ZB, ZB + 0.03, c, 0.006); K.box(M.paint, X - 0.03, X, y0, y1, ZB, 1.8, c, 0.006); }
  // the smudge to wipe (crayon + grease) + suds
  const SM = [-0.4, 1.3]; const smudge = mesh(root, plane(0.9, 0.62), M.smudge, SM[0], SM[1], ZB + 0.015, 0, 0, 0, false); smudge.renderOrder = 3;
  const suds = new THREE.Group(); root.add(suds); for (let i = 0; i < 26; i++) { const a = R() * TAU, d = Math.sqrt(R()); const b = mesh(suds, sph(0.012 + R() * 0.025, 10, 8), M.paint, SM[0] + Math.cos(a) * 0.4 * d, SM[1] + Math.sin(a) * 0.28 * d, ZB + 0.03, 0, 0, 0, false); b.material = M.sud || (M.sud = H.toon({ color: 0xf8fcff, emissive: 0x5a6a7a, transparent: true, opacity: 0.9 })); b.userData.k = R(); }
  // starburst wall clock above
  K.at(-0.4, 2.2, ZB + 0.03, 0, () => { K.put(M.brass, cyl(0.1, 0.1, 0.04, 20), 0, 0, 0.02, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8b048); K.put(M.paint, cyl(0.075, 0.075, 0.01, 18), 0, 0, 0.045, Math.PI / 2, 0, 0, 1, 1, 1, 0xf8f4ea);
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, L = i % 2 ? 0.2 : 0.3; K.cb(M.brass, 0.012, L - 0.1, 0.008, Math.sin(a) * (0.1 + (L - 0.1) / 2), Math.cos(a) * (0.1 + (L - 0.1) / 2), 0.02, 0xd8b048, 0, 0, -a, 0.003); K.put(M.brass, sph(0.012, 6, 5), Math.sin(a) * L, Math.cos(a) * L, 0.02, 0, 0, 0, 1, 1, 1, 0xd8b048); }
    K.cb(M.paint, 0.008, 0.055, 0.004, 0.01, 0.02, 0.055, 0x1a1a2a, 0, 0, -0.6); K.cb(M.paint, 0.008, 0.04, 0.004, -0.01, 0.015, 0.056, 0x1a1a2a, 0, 0, 0.9); });
  // fridge (left back), counter + sink under the left window, toaster, radio, canisters
  K.at(-1.75, 0, ZB + 0.42, 0, () => { K.box(M.enamel, -0.38, 0.38, 0.05, 1.75, -0.36, 0.36, 0xf2f0e8, 0.12); K.box(M.chrome, -0.36, 0.36, 0, 0.08, -0.34, 0.34, 0xa8a8b0, 0.01); K.box(M.chrome, 0.2, 0.26, 0.95, 1.4, 0.36, 0.42, 0xd8d8e0, 0.02); K.box(M.enamel, -0.38, 0.38, 1.18, 1.2, 0.34, 0.37, 0xd8d4cc, 0.003);
    K.put(M.paint, cyl(0.04, 0.04, 0.12, 10), -0.2, 1.81, 0, 0, 0, 0, 1, 1, 1, 0x4aa0a0); K.put(M.paint, sph(0.07, 10, 8), 0.12, 1.83, -0.05, 0, 0, 0, 1, 1, 1, 0xe86a50); });
  K.box(M.enamel, -X, -X + 0.62, 0, 0.9, ZB + 0.9, ZB + 3.0, 0xf6e8a8, 0.02); K.box(M.paint, -X, -X + 0.66, 0.9, 0.95, ZB + 0.86, ZB + 3.04, 0xe86a50, 0.01); K.box(M.chrome, -X + 0.6, -X + 0.67, 0.9, 0.95, ZB + 0.86, ZB + 3.04, 0xd8d8e0, 0.004);
  for (let i = 0; i < 3; i++) { const z = ZB + 1.25 + i * 0.6; K.box(M.enamel, -X + 0.62, -X + 0.64, 0.12, 0.82, z - 0.27, z + 0.27, 0xf8ecb8, 0.01); K.box(M.chrome, -X + 0.64, -X + 0.67, 0.68, 0.71, z - 0.08, z + 0.08, 0xd8d8e0, 0.005); }
  K.at(-X + 0.32, 0.95, ZB + 2.0, 0, () => { K.box(M.chrome, -0.22, 0.22, -0.12, 0, -0.3, 0.3, 0xc8c8d0, 0.02); K.beam(M.chrome, [-0.24, 0, 0], [-0.24, 0.3, 0], 0.02, 0xd8d8e0, true, 8); K.beam(M.chrome, [-0.24, 0.3, 0], [-0.1, 0.32, 0], 0.018, 0xd8d8e0, true, 8); });
  const WZ = ZB + 2.0; mesh(root, plane(1.2, 0.9), M.out50, -X + 0.004, 1.65, WZ, 0, Math.PI / 2, 0, false); for (const dz of [-0.6, 0, 0.6]) K.box(M.paint, -X, -X + 0.05, 1.2, 2.1, WZ + dz - 0.03, WZ + dz + 0.03, 0xffffff, 0.005); for (const y of [1.2, 1.65, 2.1]) K.box(M.paint, -X, -X + 0.05, y - 0.03, y + 0.03, WZ - 0.62, WZ + 0.62, 0xffffff, 0.005);
  for (const s of [-1, 1]) K.cb(M.curtain50, 0.03, 0.75, 0.4, -X + 0.08, 1.75, WZ + s * 0.62, 0xffffff, 0, 0, 0, 0.03); K.cb(M.curtain50, 0.04, 0.2, 1.6, -X + 0.08, 2.15, WZ, 0xffffff, 0, 0, 0, 0.03);
  K.at(-X + 0.32, 0.95, ZB + 1.15, 0.3, () => { K.box(M.chrome, -0.12, 0.12, 0, 0.18, -0.07, 0.07, 0xd8d8e0, 0.05); K.box(M.paint, -0.05, 0.05, 0.18, 0.2, -0.05, 0.05, 0x2a2a30, 0.004); }); // toaster
  for (let i = 0; i < 4; i++) K.put(M.enamel, cyl(0.07 - i * 0.01, 0.07 - i * 0.01, 0.22 - i * 0.03, 14), -X + 0.18, 0.95 + (0.22 - i * 0.03) / 2, ZB + 2.75 - i * 0.16 + 0.3, 0, 0, 0, 1, 1, 1, [0xe86a50, 0xe86a50, 0x3aa0a0, 0x3aa0a0][i]);
  K.at(-X + 0.3, 0.95, ZB + 2.9, -Math.PI / 2 + 0.4, () => { K.box(M.paint, -0.17, 0.17, 0, 0.18, -0.08, 0.08, 0xf2d0c0, 0.06); K.put(M.paint, cyl(0.06, 0.06, 0.01, 16), -0.06, 0.09, 0.081, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8b048); K.box(M.paint, 0.02, 0.14, 0.04, 0.14, 0.08, 0.085, 0x8a6a5a, 0.005); }); // radio
  // wall GAS HEATER (right): enamel cabinet, chrome grille, window with a row of blue flames
  const GX = 1.05; K.at(GX, 0, ZB + 0.16, 0, () => { K.box(M.enamel, -0.42, 0.42, 0.12, 1.05, -0.15, 0.15, 0x9ec8b4, 0.04); K.box(M.chrome, -0.42, 0.42, 0.06, 0.12, -0.14, 0.15, 0xc8c8d0, 0.01); K.box(M.chrome, -0.42, 0.42, 1.05, 1.1, -0.15, 0.17, 0xd8d8e0, 0.01);
    for (let i = 0; i < 9; i++) K.box(M.chrome, -0.36, 0.36, 0.86 + i * 0.018, 0.87 + i * 0.018, 0.15, 0.16, 0xa8a8b0, 0.002);
    K.box(M.iron || M.metal, -0.3, 0.3, 0.28, 0.6, 0.145, 0.15, 0x1a1a2a, 0.01); K.box(M.chrome, -0.32, 0.32, 0.26, 0.28, 0.14, 0.17, 0xd8d8e0, 0.004); K.box(M.chrome, -0.32, 0.32, 0.6, 0.62, 0.14, 0.17, 0xd8d8e0, 0.004);
    K.put(M.chrome, cyl(0.035, 0.035, 0.03, 12), 0.3, 0.72, 0.16, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8d8e0); K.beam(M.chrome, [0.38, 0.06, -0.1], [0.6, 0.06, -0.14], 0.02, 0x8a8a90, true, 6); });
  const blues = []; for (let i = 0; i < 7; i++) { const b = nond(mesh(root, plane(0.07, 0.16), M.blueFlame, GX - 0.24 + i * 0.08, 0.38, ZB + 0.33, 0, 0, 0, false)); b.renderOrder = 6; blues.push(b); }
  const heatG = glowAt(root, [GX, 0.42, ZB + 0.42], 0.9, '#5a8aff', 0.22);
  K.at(0.35, 1.45, ZB + 0.02, 0, () => { K.put(M.enamel, cyl(0.06, 0.06, 0.03, 18), 0, 0, 0.015, Math.PI / 2, 0, 0, 1, 1, 1, 0xf0e8d8); K.put(M.brass, cyl(0.035, 0.035, 0.01, 14), 0, 0, 0.032, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8b048); }); // thermostat
  // shelf above the heater with the forgotten WALLPAPER CLEANER can (dust + cobweb) and a cake tin
  K.box(M.wood, 0.55, 1.95, 1.72, 1.76, ZB, ZB + 0.26, 0xf4f0e8, 0.01); for (const x of [0.7, 1.8]) K.cb(M.chrome, 0.02, 0.12, 0.18, x, 1.66, ZB + 0.12, 0xc8c8d0, 0, 0, 0, 0.005);
  K.put(M.canWP, cyl(0.1, 0.1, 0.2, 20), 0.95, 1.86, ZB + 0.14, 0, 0.4, 0, 1, 1, 1, 0xa8a090); K.put(M.metal, cyl(0.102, 0.102, 0.02, 20), 0.95, 1.97, ZB + 0.14, 0, 0, 0, 1, 1, 1, 0x7a7a70);
  K.put(M.enamel, cyl(0.14, 0.14, 0.14, 20), 1.5, 1.83, ZB + 0.14, 0, 0, 0, 1, 1, 1, 0x3aa0a0); K.put(M.enamel, cyl(0.06, 0.06, 0.12, 12), 1.8, 1.82, ZB + 0.12, 0, 0, 0, 1, 1, 1, 0xe86a50);
  const web = nond(mesh(root, plane(0.35, 0.35), M.web, 0.75, 2.02, ZB + 0.06, 0, 0, Math.PI / 2, false)); web.renderOrder = 6; web.rotation.set(0, 0, 0); web.scale.set(1, -1, 1);
  // dinette: chrome-edge table + red vinyl chairs (front)
  K.at(0.4, 0, -0.55, 0, () => { K.box(M.enamel, -0.55, 0.55, 0.74, 0.78, -0.38, 0.38, 0xf2c8c8, 0.02); K.box(M.chrome, -0.56, 0.56, 0.73, 0.75, -0.39, 0.39, 0xd8d8e0, 0.01); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.beam(M.chrome, [sx * 0.45, 0.73, sz * 0.3], [sx * 0.48, 0, sz * 0.32], 0.018, 0xd8d8e0, true, 8);
    K.put(M.paint, lathe('bowl50', [[0.001, 0], [0.08, 0], [0.13, 0.08], [0.14, 0.09]], 16), 0.1, 0.78, 0, 0, 0, 0, 1, 1, 1, 0x3aa0a0); for (let i = 0; i < 4; i++) K.put(M.paint, sph(0.04, 10, 8), 0.06 + (i % 2) * 0.07, 0.86, -0.03 + (i > 1 ? 0.06 : 0), 0, 0, 0, 1, 1, 1, [0xe8402a, 0xf0c030, 0xe8402a, 0x8ac040][i]); });
  for (const [x, z, ry] of [[-0.45, -0.5, 1.4], [1.25, -0.55, -1.5]]) K.at(x, 0, z, ry, () => { K.box(M.vinylRed, -0.2, 0.2, 0.42, 0.5, -0.2, 0.2, 0xd83a3a, 0.04); K.box(M.vinylRed, -0.19, 0.19, 0.62, 0.92, -0.22, -0.16, 0xd83a3a, 0.05); for (const s of [-1, 1]) { K.beam(M.chrome, [s * 0.18, 0, -0.18], [s * 0.18, 0.92, -0.2], 0.012, 0xd8d8e0, true, 6); K.beam(M.chrome, [s * 0.18, 0, 0.18], [s * 0.18, 0.44, 0.18], 0.012, 0xd8d8e0, true, 6); } });
  // pendant dome lamp
  K.beam(M.chrome, [0.4, HT, -0.55], [0.4, 2.05, -0.55], 0.006, 0x3a3a40, true, 4); K.put(M.enamel, lathe('dome', [[0.02, 0.12], [0.08, 0.1], [0.22, -0.02], [0.23, -0.04]], 20), 0.4, 1.95, -0.55, 0, 0, 0, 1, 1, 1, 0xe86a50); K.put(M.lampGlass, sph(0.05, 10, 8), 0.4, 1.92, -0.55, 0, 0, 0, 1, 1, 1, 0xffffff);
  K.build(root, 3);
  const lampG = glowAt(root, [0.4, 1.88, -0.55], 0.8, '#ffd090', 0.35);
  const shafts = [shaftAt(root, [-X + 1.1, 1.3, WZ - 0.1], 1.1, 2.2, Math.PI / 2 - 0.25, -0.75, 0.14, 0xfff0c8)];
  return { smudge, suds, blues, heatG, glows: [heatG, lampG], shafts, web, SM, ZB, GX };
}

// ================================================================= CLASSROOM (1950s nursery school)
function buildClassroom(root) {
  const R = PT.rng(1955), K = new Kit(), X = 4.2, ZB = -3.0, HT = 3.1;
  mesh(root, planeUV(10, 8, 1, 1), M.lino, 0, 0, -0.8, -Math.PI / 2, 0, 0, false);
  K.box(M.wallY, -X - 0.3, X + 0.3, 0, HT, ZB - 0.25, ZB, 0xffffff, 0.01); K.box(M.wallY, X, X + 0.3, 0, HT, ZB, 2, 0xffffff, 0.01); ceil(root, 2 * X + 0.6, 5.4, HT, ZB + 2.5, 0xf4ecd8);
  K.box(M.wood, -X, X, 0, 0.9, ZB, ZB + 0.04, 0x9a6a40, 0.008); K.box(M.wood, -X, X, 0.88, 0.94, ZB, ZB + 0.06, 0x7a4a2a, 0.008); K.box(M.wood, X - 0.04, X, 0, 0.9, ZB, 2, 0x9a6a40, 0.008);
  // chalkboard + title layer (PLAY-DOH)
  const BX = -0.2, BW = 2.9, B0 = 1.05, B1 = 2.25; K.box(M.wood, BX - BW / 2 - 0.1, BX + BW / 2 + 0.1, B0 - 0.1, B1 + 0.1, ZB, ZB + 0.06, 0x6a4028, 0.01); mesh(root, plane(BW, B1 - B0), M.chalk, BX, (B0 + B1) / 2, ZB + 0.065, 0, 0, 0, false);
  K.box(M.wood, BX - BW / 2, BX + BW / 2, B0 - 0.12, B0 - 0.08, ZB, ZB + 0.16, 0x6a4028, 0.008); for (let i = 0; i < 4; i++) K.cb(M.paint, 0.07, 0.022, 0.022, BX - 1 + i * 0.25, B0 - 0.065, ZB + 0.1, [0xf4f0e4, 0xf0c0c0, 0xf4f0e4, 0xf8e8a0][i], 0, R(), 0, 0.005); K.cb(M.wood, 0.12, 0.04, 0.06, BX + 1.1, B0 - 0.06, ZB + 0.1, 0xc8a070, 0, 0.3, 0, 0.01);
  const tg = new THREE.PlaneGeometry(1, 1); tg.translate(0.5, 0, 0); const title = mesh(root, tg, M.chalkTitle, BX - 0.78, 1.62, ZB + 0.07, 0, 0, 0, false); title.renderOrder = 4; nond(title);
  const TW = 1.56, TH2 = 0.46; const setTitle = (t) => { const k = clamp01(t); title.visible = k > 0.01; title.scale.set(TW * k, TH2, 1); const uv = tg.attributes.uv; uv.setXY(0, 0, 1); uv.setXY(1, k, 1); uv.setXY(2, 0, 0); uv.setXY(3, k, 0); uv.needsUpdate = true; };
  // alphabet frieze + kids' paintings + clock
  mesh(root, plane(7.6, 0.4), M.alpha, 0, 2.62, ZB + 0.02, 0, 0, 0, false);
  [[-3.4, 1.75, 0], [-2.55, 1.85, 1], [-2.4, 1.15, 2], [2.0, 1.85, 3], [2.85, 1.7, 4], [3.6, 1.85, 5]].forEach(([x, y, k], i) => { const p = mesh(root, plane(0.55, 0.68), M.arts[k], x, y, ZB + 0.02, 0, 0, (R() - 0.5) * 0.1, false); K.put(M.paint, sph(0.018, 6, 5), x, y + 0.3, ZB + 0.03, 0, 0, 0, 1, 1, 1, [0xd83a3a, 0x3a6ad8, 0xe8c040][i % 3]); });
  K.at(1.9, 2.35, ZB + 0.03, 0, () => { K.put(M.paint, cyl(0.17, 0.17, 0.05, 22), 0, 0, 0.02, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2a30); K.put(M.paint, cyl(0.15, 0.15, 0.01, 22), 0, 0, 0.05, Math.PI / 2, 0, 0, 1, 1, 1, 0xf8f4ea); K.cb(M.paint, 0.012, 0.1, 0.005, 0, 0.04, 0.058, 0x1a1420, 0, 0, 0.5); K.cb(M.paint, 0.012, 0.07, 0.005, 0.01, -0.02, 0.06, 0x1a1420, 0, 0, 2.4); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; K.cb(M.paint, 0.01, 0.025, 0.004, Math.sin(a) * 0.125, Math.cos(a) * 0.125, 0.058, 0x2a2a30, 0, 0, -a); } });
  // left wall: two big windows (outside: sunny suburb), radiators under them
  const WZS = [-1.8, 0.3]; let zc = ZB; for (const wz of WZS) { K.box(M.wallY, -X - 0.3, -X, 0, HT, zc, wz - 0.75, 0xffffff, 0.01); zc = wz + 0.75; } K.box(M.wallY, -X - 0.3, -X, 0, HT, zc, 2, 0xffffff, 0.01);
  for (const wz of WZS) { K.box(M.wallY, -X - 0.3, -X, 0, 0.95, wz - 0.75, wz + 0.75, 0xffffff, 0.01); K.box(M.wallY, -X - 0.3, -X, 2.55, HT, wz - 0.75, wz + 0.75, 0xffffff, 0.01);
    mesh(root, plane(1.5, 1.6), M.out55, -X - 0.4, 1.75, wz, 0, Math.PI / 2, 0, false); for (const dz of [-0.75, -0.25, 0.25, 0.75]) K.box(M.paint, -X - 0.12, -X - 0.04, 0.95, 2.55, wz + dz - 0.03, wz + dz + 0.03, 0xf4f0e8, 0.005); for (const y of [1.48, 2.02]) K.box(M.paint, -X - 0.12, -X - 0.04, y - 0.025, y + 0.025, wz - 0.75, wz + 0.75, 0xf4f0e8, 0.005);
    K.box(M.paint, -X - 0.05, -X + 0.12, 0.9, 0.95, wz - 0.85, wz + 0.85, 0xf4f0e8, 0.01);
    K.at(-X + 0.18, 0, wz, Math.PI / 2, () => { for (let i = 0; i < 12; i++) K.box(M.metal, -0.6 + i * 0.1, -0.56 + i * 0.1, 0.12, 0.72, -0.06, 0.06, 0xd8d4c8, 0.02); K.box(M.metal, -0.62, 0.62, 0.08, 0.14, -0.05, 0.05, 0xc8c4b8, 0.01); });
    K.put(M.paint, lathe('pot2', [[0.001, 0], [0.06, 0], [0.08, 0.1]], 10), -X + 0.05, 0.95, wz + 0.5, 0, 0, 0, 1, 1, 1, 0xc8583a); for (let i = 0; i < 6; i++) K.put(M.paint, sph(0.04, 8, 6), -X + 0.05 + (R() - 0.5) * 0.08, 1.08 + R() * 0.08, wz + 0.5 + (R() - 0.5) * 0.08, 0, 0, 0, 1, 1, 1, 0x4a9a3a); }
  // right wall: coat hooks + little coats, cubbies with lunch pails
  for (let i = 0; i < 5; i++) { const z = -2.4 + i * 0.45; K.put(M.brass, sph(0.025, 8, 6), X - 0.06, 1.45, z, 0, 0, 0, 1, 1, 1, 0xb88a40); if (i % 2 === 0) K.cb(M.paint, 0.08, 0.5, 0.32, X - 0.1, 1.2, z, [0xd8483a, 0x3a7ad8, 0xe8b830][i / 2], 0, 0, 0, 0.06); }
  K.box(M.wood, X - 0.42, X - 0.04, 0, 0.9, -0.6, 1.6, 0xb88a5a, 0.01); for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { K.box(M.wood, X - 0.4, X - 0.37, 0.08 + j * 0.42, 0.46 + j * 0.42, -0.5 + i * 0.52, -0.06 + i * 0.52, 0x5a3a24, 0.005); if ((i + j) % 2 === 0) K.box(M.metal, X - 0.36, X - 0.16, 0.1 + j * 0.42, 0.3 + j * 0.42, -0.4 + i * 0.52, -0.16 + i * 0.52, [0xd83a3a, 0x3a8ad8, 0xe8c040, 0x5ab050][(i + j) % 4], 0.02); }
  // toy shelf (back left corner): blocks, drum, teddy, tin truck
  K.at(-3.2, 0, ZB + 0.3, 0, () => { K.box(M.wood, -0.7, 0.7, 0, 1.0, -0.22, 0.22, 0xb88a5a, 0.01); for (const y of [0.34, 0.68]) K.box(M.wood, -0.68, 0.68, y, y + 0.03, -0.2, 0.22, 0xa87a4a, 0.005);
    for (let i = 0; i < 8; i++) K.cb(M.paint, 0.1, 0.1, 0.1, -0.55 + (i % 4) * 0.12, 0.08 + (i > 3 ? 0.1 : 0), 0.05, [0xd83a3a, 0x3a7ad8, 0xe8c040, 0x5ab050][i % 4], 0, R() * 0.5, 0, 0.01);
    K.put(M.paint, cyl(0.12, 0.12, 0.16, 16), 0.4, 0.45, 0.02, 0, 0, 0, 1, 1, 1, 0xd83a3a); K.put(M.paint, cyl(0.125, 0.125, 0.02, 16), 0.4, 0.53, 0.02, 0, 0, 0, 1, 1, 1, 0xf4f0e4);
    K.put(M.paint, sph(0.1, 10, 8), -0.35, 0.82, 0.02, 0, 0, 0, 1, 1, 1, 0xa86a3a); K.put(M.paint, sph(0.07, 10, 8), -0.35, 0.95, 0.04, 0, 0, 0, 1, 1, 1, 0xa86a3a); for (const s of [-1, 1]) K.put(M.paint, sph(0.03, 8, 6), -0.35 + s * 0.05, 1.01, 0.04, 0, 0, 0, 1, 1, 1, 0x8a5a2a);
    K.box(M.metal, 0.1, 0.5, 0.72, 0.84, -0.08, 0.1, 0x3a7ad8, 0.02); for (const x of [0.18, 0.42]) K.put(M.paint, cyl(0.04, 0.04, 0.03, 12), x, 0.72, 0.11, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2a30); });
  // two low round tables with tiny chairs (local spots), dough shapes (off-white) appear with shapes(k)
  const TABLES = [[-1.3, -1.1], [1.25, -0.75]], TY = 0.5, shapes = [];
  TABLES.forEach(([tx, tz], ti) => { K.at(tx, 0, tz, 0, () => { K.put(M.paint, cyl(0.62, 0.62, 0.04, 28), 0, TY - 0.02, 0, 0, 0, 0, 1, 1, 1, ti ? 0xf0c040 : 0x6ac8b8); K.put(M.paint, cyl(0.6, 0.6, 0.04, 28), 0, TY - 0.06, 0, 0, 0, 0, 1, 1, 1, 0xd8a870); for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.78; K.beam(M.wood, [Math.cos(a) * 0.45, TY - 0.06, Math.sin(a) * 0.45], [Math.cos(a) * 0.48, 0, Math.sin(a) * 0.48], 0.035, 0xa87a4a, true, 8); } });
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.3 + ti * 0.4, cx = tx + Math.cos(a) * 0.9, cz = tz + Math.sin(a) * 0.9; if (Math.sin(a) > 0.55) continue; K.at(cx, 0, cz, -a + Math.PI / 2, () => { K.box(M.wood, -0.17, 0.17, 0.28, 0.32, -0.17, 0.17, [0xd83a3a, 0x3a7ad8, 0xe8c040, 0x5ab050][(i + ti) % 4], 0.02); K.box(M.wood, -0.16, 0.16, 0.32, 0.6, 0.15, 0.18, [0xd83a3a, 0x3a7ad8, 0xe8c040, 0x5ab050][(i + ti) % 4], 0.02); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.box(M.wood, sx * 0.14 - 0.015, sx * 0.14 + 0.015, 0, 0.28, sz * 0.14 - 0.015, sz * 0.14 + 0.015, 0x8a6a4a, 0.005); }); } });
  K.build(root, 3);
  // dough shapes: separate meshes (toggled by shapes(k)); off-white
  const DC = 0xf2ead6, SK = new Kit(); const shGroup = new THREE.Group(); root.add(shGroup);
  const addShape = (fn) => { const g = new THREE.Group(); shGroup.add(g); const k = new Kit(); fn(k); k.build(g); const bb = new THREE.Box3(); g.children.forEach((c) => { c.geometry.computeBoundingBox(); bb.union(c.geometry.boundingBox); }); const c = bb.getCenter(new THREE.Vector3()); c.y = bb.min.y;
    g.children.forEach((ch) => ch.position.sub(c)); g.position.copy(c); g.userData.p = c.clone(); shapes.push(g); };
  TABLES.forEach(([tx, tz], ti) => {
    addShape((k) => { k.put(M.dough, snakeGeo(ti * 3 + 1, 0.34, 0.02), tx - 0.18, TY, tz + 0.2, 0, 0.4, 0, 1, 1, 1, DC); });
    addShape((k) => { k.put(M.dough, doughGeo(ti + 2, 0.08), tx + 0.22, TY + 0.05, tz + 0.15, 0, 0, 0, 0.07, 0.055, 0.07, DC); k.put(M.dough, doughGeo(ti + 5, 0.08), tx + 0.3, TY + 0.04, tz + 0.02, 0, 0, 0, 0.05, 0.04, 0.05, DC); });
    addShape((k) => { k.put(M.dough, shapeGeo(starPts(0.09, 0.04), 0.022), tx - 0.05, TY, tz - 0.2, 0, 0.3, 0, 1, 1, 1, DC); });
    addShape((k) => { k.put(M.dough, cyl(0.12, 0.13, 0.02, 20), tx + 0.05, TY + 0.01, tz - 0.05, 0, 0, 0, 1, 1, 1, DC); k.put(M.metal, tor(0.06, 0.006, 4, 5), tx + 0.05, TY + 0.03, tz - 0.05, Math.PI / 2, 0, 0, 1, 1, 1, 0xc8c8d0); }); // pancake + cutter
    addShape((k) => { k.put(M.dough, heartPts ? shapeGeo(heartPts(0.07), 0.02) : sph(0.05), tx - 0.3, TY, tz - 0.05, 0, 0.2, 0, 1, 1, 1, DC); k.put(M.wood, cyl(0.022, 0.022, 0.26, 10), tx + 0.25, TY + 0.025, tz - 0.28, 0, 0.5, Math.PI / 2, 1, 1, 1, 0xd8b088); }); // heart + rolling pin
    addShape((k) => { // little dough figure (snowman-ish)
      k.put(M.dough, doughGeo(ti + 9, 0.05), tx - 0.2, TY + 0.045, tz - 0.32, 0, 0, 0, 0.05, 0.045, 0.05, DC); k.put(M.dough, doughGeo(ti + 11, 0.05), tx - 0.2, TY + 0.12, tz - 0.32, 0, 0, 0, 0.035, 0.035, 0.035, DC); });
  });
  // teacher's desk (right front) with apple, books, the newspaper with the clipping, a bell
  const DX = 2.65, DZ = -1.9, DY = 0.76; K.at(DX, 0, DZ, -0.25, () => { K.box(M.wood, -0.75, 0.75, DY - 0.05, DY, -0.4, 0.4, 0x6a4028, 0.02); K.box(M.wood, -0.72, -0.3, 0, DY - 0.05, -0.36, 0.36, 0x5a3420, 0.01); K.box(M.wood, 0.3, 0.72, 0, DY - 0.05, -0.36, 0.36, 0x5a3420, 0.01);
    for (const x of [-0.51, 0.51]) for (const y of [0.2, 0.45]) K.put(M.brass, sph(0.018, 6, 5), x, y, 0.37, 0, 0, 0, 1, 1, 1, 0xc8a050);
    K.put(M.paint, sph(0.05, 12, 10), -0.55, DY + 0.05, 0.1, 0, 0, 0, 1, 0.92, 1, 0xd8261c); K.beam(M.wood, [-0.55, DY + 0.09, 0.1], [-0.54, DY + 0.12, 0.1], 0.005, 0x4a2a18, true, 4);
    for (let i = 0; i < 3; i++) K.box(M.paint, -0.6, -0.3, DY + i * 0.045, DY + 0.04 + i * 0.045, -0.3, -0.08, [0x3a5a8a, 0x8a2a2a, 0x3a6a3a][i], 0.01);
    K.put(M.brass, lathe('bell', [[0.001, 0], [0.05, 0], [0.04, 0.03], [0.02, 0.06], [0.006, 0.08], [0.001, 0.08]], 14), 0.55, DY, -0.2, 0, 0, 0, 1, 1, 1, 0xd8b048); });
  const news = mesh(root, plane(0.48, 0.6), M.news, DX - 0.02, DY + 0.006, DZ + 0.06, -Math.PI / 2, -0.25 + 0.15, 0, false);
  K.build(root, 3);
  // paper chains hanging from the ceiling (foreground depth)
  const chainK = new Kit(); for (const [x0, x1, z] of [[-3.5, 0, 0.6], [0.5, 3.8, 0.9]]) for (let i = 0; i <= 18; i++) { const t = i / 18, x = x0 + (x1 - x0) * t, y = HT - 0.15 - Math.sin(t * Math.PI) * 0.55; chainK.put(M.paint, tor(0.05, 0.012, 4, 10), x, y, z, i % 2 ? Math.PI / 2 : 0, 0.3, 0, 1, 1, 1, [0xd83a3a, 0x3a7ad8, 0xe8c040, 0x5ab050][i % 4]); } chainK.build(root);
  const shafts = WZS.map((wz) => shaftAt(root, [-X + 1.5, 1.2, wz + 0.4], 1.6, 3.2, Math.PI / 2 - 0.3, -0.85, 0.2, 0xffe0a8));
  const dust = motes(root, 90, [-X + 0.4, -0.5, 0.5, 2.6, -2.6, 1.0], 21, 0.009);
  return { setTitle, shapes, shafts, dust, news, TABLES, TY, DX, DZ, DY, BX, ZB };
}

// ================================================================= lights, grades, API
const SET_LIGHT = {
  parlor: { top: '#000000', hor: '#2a1c1c', fog: '#2a1e20', fogN: 8, fogF: 40, sky: '#c8d0ff', ground: '#5a3a40', hemiI: 0.62, fillCol: '#7a7ad8', fillI: 0.34, sunCol: '#d8dcff', sunI: 1.5, az: -100, el: 24, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  parlorSoot: { top: '#000000', hor: '#1e1618', fog: '#1e1618', fogN: 6, fogF: 30, sky: '#a8a8d8', ground: '#4a3434', hemiI: 0.75, fillCol: '#6a6ad0', fillI: 0.3, sunCol: '#c8ccf0', sunI: 1.1, az: -100, el: 24, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#f2e4dc', fxTint: '#ffffff', shafts: 0 },
  home50: { top: '#000000', hor: '#f0e8d8', fog: '#f4ecdc', fogN: 10, fogF: 50, sky: '#cfe4ff', ground: '#7a6a70', hemiI: 0.8, fillCol: '#8aa0f0', fillI: 0.36, sunCol: '#fff0d0', sunI: 2.6, az: -110, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  classroom: { top: '#000000', hor: '#f0dcb0', fog: '#f0e0c0', fogN: 10, fogF: 60, sky: '#d8e0ff', ground: '#8a7058', hemiI: 1.3, fillCol: '#8a90e8', fillI: 0.34, sunCol: '#ffe2b0', sunI: 3.0, az: -112, el: 28, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff6ea', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  parlor: { look: 'office', over: { exp: 1.1, con: 1.26, sat: 1.0, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.2], tH: ['#ffc890', 0.1], bloom: [0.45, 0.75], hal: [0.3, '#ff8a40'], vig: [0.36, 0.44, '#2a1420'] } },
  parlorSoot: { look: 'office', over: { exp: 1.02, con: 1.24, sat: 0.82, lift: [0.03, 0.025, 0.05], tS: ['#2a2a5a', 0.24], tH: ['#ffb070', 0.1], bloom: [0.45, 0.75], hal: [0.3, '#ff7a30'], vig: [0.42, 0.4, '#1a1020'] } },
  home50: { look: 'day', over: { exp: 0.96, con: 1.24, sat: 1.12, tS: ['#3a3a8a', 0.12], tH: ['#fff0c8', 0.06], bloom: [0.4, 0.85], hal: [0.16, '#ff9a60'], vig: [0.24, 0.5, '#4a3a5a'] } },
  classroom: { look: 'day', over: { exp: 1.06, con: 1.22, sat: 1.1, tS: ['#3a3a8a', 0.14], tH: ['#ffe0a8', 0.08], bloom: [0.4, 0.82], hal: [0.2, '#ff9a50'], vig: [0.26, 0.48, '#4a3050'] } },
};
const GROUP_OF = { parlor: 'parlor', parlorSoot: 'parlor', home50: 'home50', classroom: 'classroom' };

export function buildHomes(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  let pa, h5, cl, SOOT = 1, STRIPE = 0, WIPE = 0, TITLE = 0, SHAPES = 0;
  const API = makeAPI(ctx, { prefix: 'doh_', origin: HOMES_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE, base: { parlor: 'office', parlorSoot: 'office', home50: 'day', classroom: 'day' },
    glows: {}, practicals: (name, F, W3) => { const fl = 1 + 0.12 * Math.sin(F * 0.9) * Math.sin(F * 0.37);
      if (name === 'parlor' || name === 'parlorSoot') return [{ p: W3('parlor', [pa.SX, 0.6, pa.SZ + 0.6]), col: '#ff8a3a', I: 4.5 * fl, d: 5 }, { p: W3('parlor', [-1.95, 1.45, -1.1]), col: '#ffc070', I: 2.6, d: 4.5 }, { p: W3('parlor', [0.2, 2.3, -0.8]), col: '#ffd8a0', I: 1.6, d: 5 }, { p: W3('parlor', [0, 1.6, 1.2]), col: '#ffd0a0', I: 3.5, d: 7 }];
      if (name === 'home50') return [{ p: W3('home50', [h5.GX, 0.45, h5.ZB + 0.7]), col: '#6a90ff', I: 1.3 * fl, d: 3 }, { p: W3('home50', [0.4, 1.8, -0.55]), col: '#ffd8a0', I: 2.0, d: 4.5 }, { p: W3('home50', [0, 1.6, 1.4]), col: '#fff0e0', I: 4, d: 8 }];
      if (name === 'classroom') return [{ p: W3('classroom', [0, 2.6, 0.5]), col: '#fff0d8', I: 7, d: 9 }, { p: W3('classroom', [2.4, 1.8, -1.5]), col: '#ffd8a0', I: 2.2, d: 4 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'parlor' && pa) { pa.flames.forEach((m, i) => { m.scale.set(1 + 0.15 * Math.sin(f * 0.7 + i * 2), 1 + 0.25 * Math.sin(f * 0.53 + i), 1); }); pa.stoveG.material.opacity = pa.stoveG.userData.op * (0.85 + 0.15 * Math.sin(f * 0.6)); pa.shafts.forEach((s) => (s.material.opacity = s.userData.op * (0.85 + 0.15 * Math.sin(f * 0.03)))); tickMotes(pa.dust, f, 0.5); }
      if (cur === 'home50' && h5) { h5.blues.forEach((m, i) => { m.scale.set(1, 0.85 + 0.2 * Math.sin(f * 0.9 + i * 1.7), 1); }); }
      if (cur === 'classroom' && cl) { cl.shafts.forEach((s, i) => (s.material.opacity = s.userData.op * (0.85 + 0.15 * Math.sin(f * 0.025 + i)))); tickMotes(cl.dust, f); } },
    apply: (v) => { if (v.soot != null) API.soot(v.soot); if (v.stripe != null) API.stripe(v.stripe); if (v.wipe != null) API.wipe(v.wipe); if (v.title != null) API.title(v.title); if (v.shapes != null) API.shapes(v.shapes); } });
  pa = buildParlor(API.groups.parlor); h5 = buildHome50(API.groups.home50); cl = buildClassroom(API.groups.classroom);
  for (const g of Object.values(API.groups)) g.traverse((o) => { if (o.isMesh && [M.wp30, M.vinyl, M.soot, M.smudge].includes(o.material)) o.receiveShadow = false; }); // no grazing shadow acne on the big wallpaper planes
  API.parts = { pa, h5, cl };
  // [PD-sets1] state setters
  API.soot = (k) => { SOOT = clamp01(k); pa.soot.material.opacity = SOOT; pa.soot.visible = SOOT > 0.01; };
  API.stripe = (t) => { STRIPE = clamp01(t); const x1 = pa.setStripe(STRIPE); API.spots.stripeHead = API.W3('parlor', [x1, (pa.SY0 + pa.SY1) / 2, pa.ZB + 0.06]); return x1; };
  API.wipe = (t) => { WIPE = clamp01(t); h5.smudge.material.opacity = 1 - sm(0.15, 0.95, WIPE); h5.smudge.visible = WIPE < 0.97; const sud = Math.sin(Math.PI * clamp01(WIPE * 1.1)); h5.suds.children.forEach((b) => { const s = Math.max(0.001, sud * (0.6 + 0.6 * b.userData.k)); b.scale.setScalar(s); b.visible = s > 0.05; }); };
  API.title = (t) => { TITLE = clamp01(t); cl.setTitle(TITLE); };
  API.shapes = (k) => { SHAPES = clamp01(k); const N = cl.shapes.length; cl.shapes.forEach((g, i) => { const e = clamp01(SHAPES * N - i * 0.85), s = e <= 0 ? 0.0001 : backOut(e); g.visible = e > 0; g.scale.setScalar(s); }); };
  API.glows = { parlor: pa.glows, home50: h5.glows };
  API.spots = {
    stripeHead: null, stove: API.W3('parlor', [pa.SX, 0, pa.SZ]), wallFront: API.W3('parlor', [-0.6, 0, pa.ZB + 0.55]), scuttle: API.W3('parlor', [pa.SX + 0.62, 0, pa.SZ + 0.25]),
    smudge: API.W3('home50', [h5.SM[0], h5.SM[1], h5.ZB]), heater: API.W3('home50', [h5.GX, 0, h5.ZB + 0.16]),
    tables: cl.TABLES.map(([x, z]) => API.W3('classroom', [x, cl.TY, z])), desk: API.W3('classroom', [cl.DX, cl.DY, cl.DZ]), board: API.W3('classroom', [cl.BX, 1.6, cl.ZB]),
  };
  // the generic API faces glows from cfg.glows; hook ours in
  const face0 = API.face; API.face = () => { const cam = H.CAM; if (!cam) return; const G = API.glows[API.cur] || []; for (const g of G) g.quaternion.copy(cam.quaternion); };
  const V = API.V;
  API.views = [
    V('parlor', [0.45, 1.55, 2.3], [-0.25, 1.15, -2.6], 58, 1.6, [-0.6, 1.2, -2.0], { soot: 1, stripe: 0.55 }), // 0 parlor wide: sooty wall, stove, window, stripe half done
    V('parlor', [-0.7, 1.38, -0.9], [-0.7, 1.32, -2.6], 44, 4, [-0.7, 1.31, -2.55], { soot: 1, stripe: 0.7 }), // 1 stripe close: clean band through the soot
    V('parlor', [0.4, 1.0, 0.2], [0.95, 0.7, -1.88], 46, 3, [0.95, 0.6, -1.88], { soot: 1, stripe: 0 }), // 2 coal stove close: glowing grate, scuttle
    V('parlor', [-1.6, 1.5, 1.0], [-3.2, 1.55, -1.0], 48, 3, [-3.1, 1.5, -1.0], { soot: 1, stripe: 0 }), // 3 window: lace + smoky chimneys outside
    V('parlor', [0.45, 1.55, 2.3], [-0.25, 1.15, -2.6], 58, 1.6, [-0.6, 1.2, -2.0], { soot: 0, stripe: 0 }), // 4 parlor wide, clean wallpaper (before soot)
    V('home50', [0.35, 1.5, 2.4], [-0.1, 1.15, -2.4], 58, 1.6, [0, 1.0, -1.4], { wipe: 0 }), // 5 kitchen wide
    V('home50', [-0.2, 1.38, -1.0], [-0.4, 1.3, -2.4], 46, 4, [-0.4, 1.3, -2.38], { wipe: 0.5 }), // 6 wipe close: vinyl + smudge + suds
    V('home50', [0.6, 0.9, -0.8], [1.05, 0.55, -2.2], 46, 4, [1.05, 0.45, -2.1], { wipe: 0 }), // 7 gas heater close: blue flames
    V('home50', [0.85, 1.75, -1.0], [1.05, 1.85, -2.4], 42, 4, [0.95, 1.86, -2.26], { wipe: 0 }), // 8 shelf: dusty WALLPAPER CLEANER can + cobweb
    V('classroom', [0.4, 1.7, 3.4], [-0.2, 1.1, -3.0], 54, 1.4, [0, 0.8, -1.0], { title: 0, shapes: 1 }), // 9 classroom wide
    V('classroom', [-0.2, 1.62, -0.6], [-0.2, 1.62, -3.0], 50, 3, [-0.2, 1.62, -2.95], { title: 1, shapes: 0 }), // 10 chalkboard PLAY-DOH
    V('classroom', [-1.3, 0.95, -0.2], [-1.3, 0.5, -1.1], 46, 4, [-1.3, 0.5, -1.05], { title: 0, shapes: 1 }), // 11 table close: dough shapes
    V('classroom', [2.45, 1.25, -1.35], [2.63, 0.76, -1.85], 40, 5, [2.63, 0.76, -1.84], { title: 0, shapes: 0 }), // 12 desk: newspaper clipping
  ];
  API.soot(1); API.stripe(0); API.wipe(0); API.title(0); API.shapes(0); API.tick(0);
  return API;
}
