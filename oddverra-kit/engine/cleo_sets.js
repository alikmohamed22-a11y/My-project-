// cleo_sets.js [CLEO-sets]: sets for "Cleopatra lived closer to the Moon landing than to the pyramids" (Oddverra short). All original, no logos.
//   giza      : Giza construction site c. 2560 BC: half-built Great Pyramid (stepped core, white casing on the lowest courses), a mud-brick
//               ramp with block sledges, a block on a wooden sledge in front (sledge(t) drags it), block piles, tents, palms, Nile strip.
//               'gizaLow' = low angle variant (same group).                                                    origin (-52000, 0, 0)
//   terrace   : Cleopatra's palace terrace in Alexandria c. 40 BC at dusk: marble floor, lotus columns, balustrade, couch, brazier
//               (practical), Greek marble bust, scroll table; harbour, city roofs and a tall lighthouse with a fire; a big full Moon.
//                                                                                                               origin (-52000, 0, 800)
//   ruins     : the same Giza plateau ~2,500 years later: three finished, weathered pyramids, a lion-bodied sphinx, palms, sand.
//                                                                                                               origin (-52000, 0, 1600)
//   road      : the TIMELINE ROAD: an 8 m cream road along -z, one century every 6 m (z = -(year + 2600) / 100 * 6), a sign post per
//               century, gold arches every millennium, landmarks (pyramid 2560 BC, Cleopatra medallion 69 BC, rocket 1969 (launch(t)),
//               YOU ARE HERE 2026), big ground medallions + span brackets (span(a, b)) for the aerial shots.  origin (-54500, 0, 0)
//   moon      : 1969 Moon surface: grey cratered regolith, generic lander (gold-foil descent stage, legs, ladder, grey cabin), a plain
//               striped flag on a pole (plant(t)), bootprints, rocks, black starry sky with the Earth.          origin (-54500, 0, 800)
//   classroom : modern classroom: whiteboard with the timeline drawn on it, desks, window, pyramid + Moon posters, globe, plant.
//                                                                                                               origin (-54500, 0, 1600)
import { H, INK, TAU, clamp01, sm, SERIF, SANS, cyl, sph, plane, planeUV, mesh, nond, txt, grain, glowAt, motes, tickMotes, makeAPI, initDoh, cached } from './doh_kit.js';
import { Kit } from './world.js';
import { oddverra } from './oddverra_next.js';
import { CL_ODD, drawPip } from './cleo_cast.js';

export const CL_ORIGIN = { giza: [-52000, 0, 0], terrace: [-52000, 0, 800], ruins: [-52000, 0, 1600], road: [-54500, 0, 0], moon: [-54500, 0, 800], classroom: [-54500, 0, 1600] };
let THREE, PT, M;
export const ROADZ = (year) => -(year + 2600) / 100 * 6; // BC years negative
const css = (...a) => PT.css(...a), shade = (...a) => PT.shade(...a), tint = (...a) => PT.tint(...a), vary = (...a) => PT.vary(...a), rng = (...a) => PT.rng(...a), fbm = (...a) => PT.fbm(...a), modulate = (...a) => PT.modulate(...a), hex = (...a) => PT.hex(...a);

// ---------------------------------------------------------------- painters
const ODD = (g, who, op, x, y, k) => { g.save(); g.translate(x, y); g.scale(k, k); g.translate(-300, -500); try { oddverra(g, { seed: 3, ...CL_ODD[who] }, { t: 0, blink: 0, ...op }); } catch (e) { /* decoration only */ } g.restore(); };
const PIPD = (g, op, x, y, k) => { g.save(); g.translate(x, y); g.scale(k, k); g.translate(-300, -965); try { drawPip(g, {}, { t: 0, blink: 0, ...op }); } catch (e) { /* decoration only */ } g.restore(); };
function sandTex(g, w, h, o = {}) { g.fillStyle = o.base || '#f0c890'; g.fillRect(0, 0, w, h); const R = rng(o.seed || 5), b = hex(o.base || '#f0c890');
  for (let i = 0; i < 70; i++) { const y = R() * h, x0 = R() * w, L = 60 + R() * 160; g.strokeStyle = css(shade(b, 0.8), 0.35); g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= L; x += 6) g.lineTo((x0 + x) % w, y + Math.sin((x0 + x) * 0.05) * 4); g.stroke(); g.strokeStyle = css(tint(b, 1.25), 0.4); g.lineWidth = 1.5; g.beginPath(); for (let x = 0; x <= L; x += 6) g.lineTo((x0 + x) % w, y - 3 + Math.sin((x0 + x) * 0.05) * 4); g.stroke(); }
  grain(g, w, h, css(shade(b, 0.6)), 2400, 3, 0.35); grain(g, w, h, '#fff4e0', 1200, 4, 0.4); modulate(g, w, h, (u, v) => 0.9 + 0.16 * fbm(u, v, 4, 4, 3, 11)); }
function stoneTex(g, w, h, o = {}) { const b = hex(o.base || '#e2c08e'), R = rng(o.seed || 9), n = o.rows || 4, m = o.cols || 3; g.fillStyle = css(b); g.fillRect(0, 0, w, h);
  for (let j = 0; j < n; j++) for (let i = 0; i < m + 1; i++) { const x = (i - (j % 2) * 0.5) * w / m, y = j * h / n; g.fillStyle = css(vary(b, (R() - 0.5) * 0.18)); g.fillRect(x + 2, y + 2, w / m - 4, h / n - 4); }
  g.fillStyle = css(shade(b, 0.62), 0.8); for (let j = 0; j <= n; j++) g.fillRect(0, j * h / n - 2, w, 4); for (let j = 0; j < n; j++) for (let i = 0; i <= m; i++) g.fillRect((i - (j % 2) * 0.5) * w / m - 2, j * h / n, 4, h / n);
  grain(g, w, h, css(shade(b, 0.55)), 2200, 7, 0.3); grain(g, w, h, '#fff0d8', 900, 8, 0.3); modulate(g, w, h, (u, v) => 0.86 + 0.22 * fbm(u, v, 3, 3, 4, o.seed || 9)); }
function casingTex(g, w, h, o = {}) { const b = hex(o.base || '#f2e6cc'); g.fillStyle = css(b); g.fillRect(0, 0, w, h); const R = rng(o.seed || 4);
  g.strokeStyle = css(shade(b, 0.82), 0.5); g.lineWidth = 2; for (let j = 1; j < 8; j++) { g.beginPath(); g.moveTo(0, j * h / 8); g.lineTo(w, j * h / 8); g.stroke(); }
  for (let i = 0; i < (o.worn ? 260 : 60); i++) { g.fillStyle = css(shade(b, 0.7 + R() * 0.2), 0.25 + R() * 0.3); g.beginPath(); g.ellipse(R() * w, R() * h, 2 + R() * (o.worn ? 16 : 6), 1 + R() * 5, R() * 3, 0, TAU); g.fill(); }
  grain(g, w, h, css(shade(b, 0.6)), 1800, 5, 0.25); modulate(g, w, h, (u, v) => 0.88 + 0.18 * fbm(u, v, 3, 3, 4, o.seed || 4) - (o.worn ? 0.08 * v : 0)); }
function waterTex(g, w, h, o = {}) { const b = hex(o.base || '#38b8b0'); g.fillStyle = css(b); g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => { const n = fbm(u, v, 3, 6, 4, o.seed || 3); return [0.8 + 0.35 * n, 0.85 + 0.25 * n, 0.9 + 0.2 * n]; });
  const R = rng(o.seed || 3); for (let i = 0; i < 420; i++) { const x = R() * w, y = R() * h, L = 10 + R() * 34, lt = R() < 0.55; g.strokeStyle = lt ? css(tint(b, 1.5), 0.55 + R() * 0.35) : css(shade(b, 0.62), 0.5); g.lineWidth = lt ? 1.8 : 2.4; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L / 2, y - 4, x + L, y); g.stroke(); } }
function frondTex(g, w, h, o = {}) { g.clearRect(0, 0, w, h); const R = rng(o.seed || 4); g.strokeStyle = o.rib || '#6a7a30'; g.lineWidth = 5; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, 0); g.stroke();
  for (let y = h * 0.02; y < h * 0.97; y += 7) { const t = y / h, L = w * 0.48 * Math.sin(Math.min(1, (1 - t) * 1.25) * Math.PI * 0.5 + 0.25) * (0.85 + R() * 0.2); for (const s of [-1, 1]) { g.strokeStyle = o.dry ? ['#b88a4a', '#a8783a', '#c89a58'][(R() * 3) | 0] : ['#4a7a2a', '#5a8a30', '#3e6a28', '#6a9638', '#7a9a3a'][(R() * 5) | 0]; g.lineWidth = 4.5; g.beginPath(); g.moveTo(w / 2, y); g.quadraticCurveTo(w / 2 + s * L * 0.6, y + 6, w / 2 + s * L, y + 22 + R() * 10); g.stroke(); } } }
function barkTex(g, w, h) { g.fillStyle = '#8a6a4a'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { g.fillStyle = '#6a4a34'; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + 8 + Math.sin(x * 0.3 + y) * 3); g.lineTo(w, y + 13); g.lineTo(0, y + 13); g.fill(); g.fillStyle = '#a88a64'; g.fillRect(0, y + 1, w, 2); } modulate(g, w, h, (u, v) => 0.85 + 0.25 * fbm(u, v, 3, 6, 3, 2)); }
function marbleTex(g, w, h, o = {}) { const n = o.n || 4, s = w / n; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { g.fillStyle = (i + j) % 2 ? (o.a || '#efe6d6') : (o.b || '#d8c8b0'); g.fillRect(i * s, j * s, s, s); }
  const R = rng(o.seed || 2); g.strokeStyle = 'rgba(150,130,120,0.3)'; g.lineWidth = 1.5; for (let i = 0; i < 30; i++) { g.beginPath(); let x = R() * w, y = R() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (R() - 0.5) * 50; y += (R() - 0.5) * 50; g.lineTo(x, y); } g.stroke(); }
  g.strokeStyle = 'rgba(90,70,60,0.5)'; g.lineWidth = 3; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); } modulate(g, w, h, (u, v) => 0.92 + 0.1 * fbm(u, v, 4, 4, 3, 5)); }
function stripeCloth(g, w, h, a, b, n = 8) { for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * w / n, 0, w / n, h); } modulate(g, w, h, (u, v) => 0.9 + 0.12 * fbm(u, v, 4, 4, 3, 9)); }
function foilTex(g, w, h) { g.fillStyle = '#d8a838'; g.fillRect(0, 0, w, h); const R = rng(69); for (let i = 0; i < 160; i++) { const x = R() * w, y = R() * h, s = 10 + R() * 40; g.fillStyle = R() < 0.5 ? `rgba(255,236,150,${0.3 + R() * 0.4})` : `rgba(120,70,10,${0.2 + R() * 0.3})`; g.beginPath(); g.moveTo(x, y); g.lineTo(x + s, y + R() * 10); g.lineTo(x + s * 0.6, y + s * 0.7); g.closePath(); g.fill(); }
  g.strokeStyle = 'rgba(90,50,10,0.5)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { g.beginPath(); g.moveTo(R() * w, R() * h); g.lineTo(R() * w, R() * h); g.stroke(); } }
function regolithTex(g, w, h, o = {}) { g.fillStyle = o.base || '#9a9a9c'; g.fillRect(0, 0, w, h); const R = rng(o.seed || 12); modulate(g, w, h, (u, v) => 0.82 + 0.3 * fbm(u, v, 6, 6, 4, 3));
  for (let i = 0; i < 120; i++) { const x = R() * w, y = R() * h, r = 2 + R() * 14; g.strokeStyle = 'rgba(60,60,64,0.45)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y, r, r * 0.8, 0, 0, TAU); g.stroke(); g.strokeStyle = 'rgba(220,220,224,0.35)'; g.beginPath(); g.ellipse(x - 1, y - 1, r, r * 0.8, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
  grain(g, w, h, 'rgba(40,40,44,1)', 3000, 5, 0.3); grain(g, w, h, '#f0f0f0', 1500, 6, 0.3); }
function earthTex(g, w, h) { g.clearRect(0, 0, w, h); const c = w / 2, r = w * 0.46; g.save(); g.beginPath(); g.arc(c, c, r, 0, TAU); g.clip(); g.fillStyle = '#2a6ad0'; g.fillRect(0, 0, w, h);
  const R = rng(19); g.fillStyle = '#4a9a4a'; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(c + (R() - 0.5) * r * 1.4, c + (R() - 0.5) * r * 1.4, r * (0.15 + R() * 0.25), r * (0.1 + R() * 0.2), R() * 3, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 12; i++) { g.beginPath(); g.ellipse(c + (R() - 0.5) * r * 1.6, c + (R() - 0.5) * r * 1.6, r * (0.1 + R() * 0.3), r * 0.05, R() * 3, 0, TAU); g.fill(); }
  const sh = g.createLinearGradient(0, 0, w, 0); sh.addColorStop(0, 'rgba(0,0,10,0.85)'); sh.addColorStop(0.45, 'rgba(0,0,10,0.2)'); sh.addColorStop(0.6, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fillRect(0, 0, w, h); g.restore();
  g.lineWidth = w * 0.02; g.strokeStyle = 'rgba(140,190,255,0.6)'; g.beginPath(); g.arc(c, c, r, -1.2, 1.2); g.stroke(); }
function moonDiskTex(g, w, h) { g.clearRect(0, 0, w, h); const c = w / 2, r = w * 0.4; const gl = g.createRadialGradient(c, c, r * 0.9, c, c, w / 2); gl.addColorStop(0, 'rgba(255,248,220,0.5)'); gl.addColorStop(1, 'rgba(255,248,220,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
  g.save(); g.beginPath(); g.arc(c, c, r, 0, TAU); g.clip(); g.fillStyle = '#fbf2d8'; g.fillRect(0, 0, w, h); const R = rng(7); g.fillStyle = 'rgba(190,176,150,0.55)';
  for (const [x, y, rr] of [[0.38, 0.4, 0.16], [0.58, 0.34, 0.12], [0.62, 0.6, 0.18], [0.4, 0.66, 0.08]]) { g.beginPath(); g.ellipse(x * w, y * h, rr * w, rr * w * 0.8, R(), 0, TAU); g.fill(); }
  for (let i = 0; i < 18; i++) { g.strokeStyle = 'rgba(170,156,130,0.5)'; g.lineWidth = 2; g.beginPath(); g.arc(c + (R() - 0.5) * r * 1.6, c + (R() - 0.5) * r * 1.6, 3 + R() * 10, 0, TAU); g.stroke(); } g.restore(); }
function signTex(g, w, h, s, o = {}) { const big = o.big; g.fillStyle = o.bg || (big ? '#c0302c' : '#2f4fa8'); g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(0, 0, w, h * 0.22);
  g.strokeStyle = o.rim || '#f2e6c0'; g.lineWidth = h * 0.08; g.strokeRect(h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12); txt(g, s, w / 2, h * 0.54, w * 0.86, h * 0.56, { col: o.fg || '#ffffff', font: SANS }); }
function roadTex(g, w, h) { g.fillStyle = '#f2e8d0'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.94 + 0.08 * fbm(u, v, 4, 4, 3, 6));
  g.fillStyle = '#d8b048'; g.fillRect(0, 0, w * 0.06, h); g.fillRect(w * 0.94, 0, w * 0.06, h); g.fillStyle = '#2b1d4a'; g.fillRect(0, h - 10, w, 10); // century line
  for (let k = 1; k < 10; k++) { const y = h - k * h / 10; g.fillStyle = 'rgba(43,29,74,0.45)'; g.fillRect(0, y - 2, w * 0.16, 4); g.fillRect(w * 0.84, y - 2, w * 0.16, 4); }
  g.fillStyle = 'rgba(216,176,72,0.7)'; g.fillRect(w * 0.48, h * 0.2, w * 0.04, h * 0.5); grain(g, w, h, 'rgba(120,90,60,1)', 600, 3, 0.15); }
function medalTex(g, w, h, o) { g.clearRect(0, 0, w, h); const c = w / 2, r = w * 0.48; g.beginPath(); g.arc(c, c, r, 0, TAU); g.fillStyle = o.bg; g.fill(); g.lineWidth = w * 0.035; g.strokeStyle = '#2b1d4a'; g.stroke(); g.lineWidth = w * 0.02; g.strokeStyle = '#f2d870'; g.beginPath(); g.arc(c, c, r * 0.92, 0, TAU); g.stroke();
  o.icon(g, c, c * 0.86, r * 0.6); txt(g, o.a, c, c + r * 0.52, r * 1.4, r * 0.2, { col: '#2b1d4a', font: SANS }); txt(g, o.b, c, c + r * 0.74, r * 1.0, r * 0.15, { col: '#7a2238', font: SANS }); }
const iconPyr = (g, x, y, s) => { g.fillStyle = '#e8c88a'; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x - s * 1.1, y + s * 0.6); g.lineTo(x + s * 1.1, y + s * 0.6); g.closePath(); g.fill(); g.fillStyle = '#c49a5a'; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.2, y + s * 0.6); g.lineTo(x + s * 1.1, y + s * 0.6); g.closePath(); g.fill(); g.lineWidth = s * 0.06; g.strokeStyle = '#2b1d4a'; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x - s * 1.1, y + s * 0.6); g.lineTo(x + s * 1.1, y + s * 0.6); g.closePath(); g.stroke(); };
const iconCleo = (g, x, y, s) => ODD(g, 'CLEO', { expr: 'smug', view: 'front' }, x, y + s * 1.6, s / 210);
const iconMoon = (g, x, y, s) => { g.fillStyle = '#e8e8ec'; g.beginPath(); g.arc(x, y, s * 0.9, 0, TAU); g.fill(); g.lineWidth = s * 0.06; g.strokeStyle = '#2b1d4a'; g.stroke(); g.fillStyle = '#b8b8c0'; for (const [dx, dy, r] of [[-0.3, -0.2, 0.2], [0.3, 0.1, 0.25], [-0.1, 0.4, 0.14]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, TAU); g.fill(); }
  g.save(); g.translate(x + s * 0.55, y - s * 0.75); g.rotate(0.6); g.fillStyle = '#f4f4f0'; g.beginPath(); g.moveTo(0, -s * 0.5); g.quadraticCurveTo(s * 0.18, -s * 0.2, s * 0.15, s * 0.3); g.lineTo(-s * 0.15, s * 0.3); g.quadraticCurveTo(-s * 0.18, -s * 0.2, 0, -s * 0.5); g.fill(); g.lineWidth = s * 0.04; g.stroke(); g.fillStyle = '#ff9a3a'; g.beginPath(); g.moveTo(-s * 0.1, s * 0.32); g.lineTo(0, s * 0.6); g.lineTo(s * 0.1, s * 0.32); g.fill(); g.restore(); };
function boardTex(g, w, h) { g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#9aa0ac'; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14);
  const Y = h * 0.6, x0 = w * 0.08, x1 = w * 0.92, xC = x0 + (x1 - x0) * (2491 / (2491 + 2038)); // pyramid 2560 BC .. Cleopatra 69 BC .. 1969
  g.strokeStyle = '#2a2a40'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, Y); g.lineTo(x1, Y); g.stroke(); for (let i = 0; i <= 45; i++) { const x = x0 + (x1 - x0) * i / 45; g.beginPath(); g.moveTo(x, Y - (i % 10 === 0 ? 18 : 8)); g.lineTo(x, Y + (i % 10 === 0 ? 18 : 8)); g.stroke(); }
  iconPyr(g, x0, Y - 70, 36); iconMoon(g, x1, Y - 70, 34); g.save(); iconCleo(g, xC, Y - 120, 50); g.restore();
  txt(g, '2560 BC', x0, Y + 52, 160, 34, { col: '#c0302c', font: SANS }); txt(g, '69 BC', xC, Y + 52, 140, 34, { col: '#c0302c', font: SANS }); txt(g, '1969', x1, Y + 52, 120, 34, { col: '#c0302c', font: SANS });
  g.strokeStyle = '#2f6ad0'; g.lineWidth = 5; for (const [a, b, s] of [[x0, xC, '2,500 yrs'], [xC, x1, '2,000 yrs']]) { g.beginPath(); g.moveTo(a + 8, Y + 92); g.quadraticCurveTo((a + b) / 2, Y + 150, b - 8, Y + 92); g.stroke(); txt(g, s, (a + b) / 2, Y + 160, 220, 36, { col: '#2f6ad0', font: SANS }); }
  txt(g, 'TIME!', w * 0.5, h * 0.12, w * 0.4, 56, { col: '#2a2a40', font: SANS }); }
function posterTex(g, w, h, kind) { g.fillStyle = kind === 'moon' ? '#1a1e3a' : '#f4d890'; g.fillRect(0, 0, w, h);
  if (kind === 'moon') { const R = rng(3); g.fillStyle = '#fff'; for (let i = 0; i < 60; i++) g.fillRect(R() * w, R() * h * 0.6, 2, 2); iconMoon(g, w * 0.5, h * 0.42, w * 0.28); txt(g, 'THE MOON', w / 2, h * 0.86, w * 0.8, h * 0.08, { col: '#f2e6c0', font: SANS }); }
  else { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7ab8e8'); gr.addColorStop(0.6, '#f4d890'); g.fillStyle = gr; g.fillRect(0, 0, w, h); iconPyr(g, w * 0.5, h * 0.48, w * 0.3); txt(g, 'ANCIENT EGYPT', w / 2, h * 0.86, w * 0.84, h * 0.07, { col: '#7a2238', font: SANS }); }
  g.strokeStyle = '#ffffff'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }
function bustTex(g, w, h) { g.clearRect(0, 0, w, h); ODD(g, 'HERODOTUS', { expr: 'calm', view: 'front' }, w / 2, h * 0.98, h / 760); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(236,232,224,0.82)'; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over'; }

// ---------------------------------------------------------------- materials
function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.sand = vc({ map: T(512, 512, sandTex, [60, 60]) }); if (H.MACRO) H.MACRO(m.sand, 0.16, 0.03);
  m.sandR = vc({ map: T(512, 512, (g, w, h) => sandTex(g, w, h, { base: '#ecc490', seed: 9 }), [60, 60]) }); if (H.MACRO) H.MACRO(m.sandR, 0.16, 0.03);
  m.stone = vc({ map: T(512, 512, stoneTex, [1, 1]) }); m.stoneBig = vc({ map: T(512, 512, (g, w, h) => stoneTex(g, w, h, { rows: 3, cols: 3, seed: 17 }), [12, 1]) }); if (H.MACRO) H.MACRO(m.stoneBig, 0.2, 0.05);
  m.block = vc({ map: T(256, 256, (g, w, h) => stoneTex(g, w, h, { rows: 1, cols: 1, seed: 23, base: '#e8cc9c' })) });
  m.casing = vc({ map: T(512, 512, (g, w, h) => casingTex(g, w, h, {}), [6, 3]) }); m.casingW = vc({ map: T(512, 512, (g, w, h) => casingTex(g, w, h, { worn: 1, base: '#ead8b4', seed: 7 }), [5, 3]) });
  m.mud = vc({ map: T(256, 256, (g, w, h) => stoneTex(g, w, h, { rows: 8, cols: 4, base: '#a87a50', seed: 31 }), [10, 4]) });
  m.nile = toon({ map: T(512, 512, waterTex, [40, 40]), emissive: 0x0a3434 }); m.sea = toon({ map: T(512, 512, (g, w, h) => waterTex(g, w, h, { base: '#4a6aa8', seed: 8 }), [60, 60]), emissive: 0x141a3a });
  m.frond = toon({ map: T(128, 512, frondTex), alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true }); m.bark = vc({ map: T(128, 256, barkTex, [2, 6]) });
  m.cloth = toon({ map: T(256, 256, (g, w, h) => stripeCloth(g, w, h, '#f2e8d0', '#c0603a', 8), [2, 1]), side: THREE.DoubleSide, emissive: 0x1a120a }); m.cloth.emissiveMap = m.cloth.map;
  m.clothB = toon({ map: T(256, 256, (g, w, h) => stripeCloth(g, w, h, '#f4ecd8', '#2f4fa8', 6), [1, 1]), side: THREE.DoubleSide, emissive: 0x14141a }); m.clothB.emissiveMap = m.clothB.map;
  m.marble = vc({ map: T(512, 512, (g, w, h) => marbleTex(g, w, h, {}), [4, 3]) }); m.marbleW = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#f2ece2'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.92 + 0.1 * fbm(u, v, 4, 4, 3, 2)); }) });
  m.moonDisk = new THREE.MeshBasicMaterial({ map: T(512, 512, moonDiskTex), transparent: true, depthWrite: false, fog: false }); m.moonDisk.color.setScalar(1.25);
  m.earth = new THREE.MeshBasicMaterial({ map: T(512, 512, earthTex), transparent: true, depthWrite: false, fog: false });
  m.road = vc({ map: T(256, 256, roadTex, [1, 1]) }); m.grassR = vc({ map: T(512, 512, (g, w, h) => PT.grass(g, w, h, { base: '#9ab85a', seed: 8 }), [50, 50]) });
  m.reg = vc({ map: T(512, 512, regolithTex, [40, 40]) }); if (H.MACRO) H.MACRO(m.reg, 0.2, 0.04);
  m.foil = toon({ map: T(256, 256, foilTex, [2, 1]), emissive: 0x3a2808 }); m.foil.emissiveMap = m.foil.map;
  m.flagUS = toon({ map: T(256, 160, (g, w, h) => { for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#f4f2ee' : '#c0302c'; g.fillRect(0, i * h / 7, w, h / 7 + 1); } g.fillStyle = '#2a3a8a'; g.fillRect(0, 0, w * 0.42, h * 4 / 7); g.fillStyle = '#ffffff'; for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(w * 0.05 + i * w * 0.08, h * 0.07 + j * h * 0.13, 3, 0, TAU); g.fill(); } }), side: THREE.DoubleSide, emissive: 0x1a1a1a }); m.flagUS.emissiveMap = m.flagUS.map;
  m.board = em(T(1024, 512, boardTex), 0x3a3a3a); m.posterP = em(T(256, 360, (g, w, h) => posterTex(g, w, h, 'pyr')), 0x2a2a2a); m.posterM = em(T(256, 360, (g, w, h) => posterTex(g, w, h, 'moon')), 0x2a2a2a);
  m.wallC = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#f2ead8'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.94 + 0.08 * fbm(u, v, 4, 4, 3, 2)); }) });
  m.floorC = vc({ map: T(512, 512, (g, w, h) => marbleTex(g, w, h, { a: '#d8dce4', b: '#c4cad6', n: 8, seed: 4 }), [5, 5]) });
  m.winDay = C.basic(T(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8ac0f0'); gr.addColorStop(1, '#e8f4ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#7ab05a'; g.beginPath(); g.moveTo(0, h * 0.75); g.quadraticCurveTo(w * 0.5, h * 0.62, w, h * 0.72); g.lineTo(w, h); g.lineTo(0, h); g.fill(); g.fillStyle = '#5a9a4a'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(w * (0.1 + i * 0.2), h * 0.7, w * 0.08, 0, TAU); g.fill(); } }), 1.15);
  m.bust = toon({ map: T(256, 384, bustTex), alphaTest: 0.5, side: THREE.DoubleSide, emissive: 0x2a2a2a }); m.bust.emissiveMap = m.bust.map;
  m.leaf = vc({ emissive: 0x0c1a08 }); m.lampOn = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe0a0).multiplyScalar(2.2), fog: false });
  m.fire = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb050).multiplyScalar(2.4), fog: false });
  return m; }

// ---------------------------------------------------------------- props
const PYR = (K, mat, x, y, z, half, h, c, top = 0) => K.put(mat, cyl(top * Math.SQRT2, half * Math.SQRT2, h, 4), x, y + h / 2, z, 0, Math.PI / 4, 0, 1, 1, 1, c);
const frondGeo = (len, v) => cached(`clfrond${len.toFixed(1)}|${v}`, () => { const g = new THREE.PlaneGeometry(1.5, len, 2, 10); g.translate(0, len / 2, 0); const p = g.attributes.position, droop = 0.18 + v * 0.06;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), t = y / len; p.setZ(i, -droop * len * t * t * 1.4 + Math.abs(x) * 0.35); p.setX(i, x * (1 - t * 0.5)); } g.computeVertexNormals(); return g; });
function palm(K, x, z, h, R, lean = 0.2, y0 = 0) { const ry = R() * TAU, dir = [Math.cos(ry) * lean, 0, Math.sin(ry) * lean]; let px = x, py = y0, pz = z; const n = 7;
  for (let i = 0; i < n; i++) { const t = (i + 1) / n, nx = x + dir[0] * h * t * t, ny = y0 + h * t, nz = z + dir[2] * h * t * t, r = 0.24 - 0.08 * t; K.beam(M.bark, [px, py, pz], [nx, ny, nz], r, 0xffffff, true, 8); px = nx; py = ny; pz = nz; }
  K.put(M.bark, sph(0.3, 10, 8), px, py, pz, 0, 0, 0, 1, 0.8, 1, 0xa08060);
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU + R() * 0.3, tilt = 0.35 + R() * 0.9, len = 3.4 + R() * 1.4; K.put(M.frond, frondGeo(len, k % 3), px, py, pz, -Math.PI / 2 + tilt, a, 0, 1, 1, 1, [0xffffff, 0xe8f0c8, 0xd0e0b0][k % 3]); } }
function tent(K, x, z, ry, mat, w = 3, d = 2.4, h = 2) { K.at(x, 0, z, ry, () => { for (const s of [-1, 1]) K.put(mat, plane(w, Math.hypot(d / 2, h)), 0, h / 2, s * d / 4, s * (Math.PI / 2 - Math.atan2(h, d / 2)), 0, 0); K.beam(M.paint, [-w / 2, h, 0], [w / 2, h, 0], 0.04, 0x8a5a30, true, 6); for (const s of [-1, 1]) K.beam(M.paint, [s * w / 2, 0, 0], [s * w / 2, h, 0], 0.05, 0x8a5a30, true, 6); }); }
function blockOn(K, x, y, z, ry = 0, s = 1) { K.put(M.block, cached('blk', () => new THREE.BoxGeometry(1.5, 0.9, 0.9)), x, y + 0.45 * s, z, 0, ry, 0, s, s, s, 0xffffff); }
function sledgeK(K, x, z, ry = 0) { K.at(x, 0, z, ry, () => { for (const s of [-1, 1]) K.box(M.paint, -1.0, 1.0, 0, 0.12, s * 0.38 - 0.07, s * 0.38 + 0.07, 0x8a5a30, 0.03); for (const xx of [-0.7, 0, 0.7]) K.box(M.paint, xx - 0.06, xx + 0.06, 0.12, 0.2, -0.5, 0.5, 0x7a4a24, 0.01); blockOn(K, 0, 0.2, 0); }); }
function jar(K, x, z, s = 1, c = 0xb8643a) { K.put(M.paint, sph(0.22, 12, 10), x, 0.24 * s, z, 0, 0, 0, s, 1.25 * s, s, c); K.put(M.paint, cyl(0.08, 0.1, 0.12, 10), x, 0.52 * s, z, 0, 0, 0, s, s, s, c); }
function column(K, x, z, h, r = 0.26, c = 0xf2ece2, cap = 0x3a8a8a) { K.put(M.marbleW, cyl(r * 1.25, r * 1.3, 0.2, 16), x, 0.1, z, 0, 0, 0, 1, 1, 1, c); K.put(M.marbleW, cyl(r * 0.92, r, h - 0.6, 16), x, 0.2 + (h - 0.6) / 2, z, 0, 0, 0, 1, 1, 1, c);
  for (let k = 0; k < 3; k++) K.put(M.paint, cyl(r * 0.95, r * 0.95, 0.05, 16), x, h - 0.6 + k * 0.07, z, 0, 0, 0, 1, 1, 1, [0xd8b048, cap, 0xd8b048][k]);
  K.put(M.paint, cyl(r * 1.6, r * 0.95, 0.4, 12), x, h - 0.2, z, 0, 0, 0, 1, 1, 1, cap); K.box(M.marbleW, x - r * 1.7, x + r * 1.7, h, h + 0.12, z - r * 1.7, z + r * 1.7, c, 0.01); }

// ================================================================= GIZA (construction site c. 2560 BC)
const GP = { z: -90, half: 22, h: 28, built: 15 };
function buildGiza(root) { const K = new Kit(), R = rng(2560), glows = [];
  mesh(root, planeUV(700, 700, 1, 1), M.sand, 0, 0, -200, -Math.PI / 2, 0, 0, false);
  // half-built Great Pyramid: smooth white casing on the lowest 5 m, stepped core above
  const hw = (y) => GP.half * (1 - y / GP.h); PYR(K, M.casing, 0, 0, GP.z, GP.half, 5, 0xffffff, hw(5));
  for (let y = 5; y < GP.built; y += 1) { const a = hw(y) - 0.35; K.box(M.stoneBig, -a, a, y, y + 1, GP.z - a, GP.z + a, 0xffffff, 0.04); }
  // workers on top (tiny figures) + a few blocks waiting there
  const tf = hw(GP.built) - 1; for (let i = 0; i < 14; i++) { const x = (R() - 0.5) * tf * 1.8, z = GP.z + (R() - 0.5) * tf * 1.8; K.put(M.paint, cyl(0.22, 0.26, 1.1, 6), x, GP.built + 0.55, z, 0, 0, 0, 1, 1, 1, R() < 0.5 ? 0xf2ead4 : 0x9a6040); K.put(M.paint, sph(0.17, 6, 5), x, GP.built + 1.3, z, 0, 0, 0, 1, 1, 1, 0x8a5434); }
  for (let i = 0; i < 6; i++) blockOn(K, (R() - 0.5) * tf * 1.4, GP.built, GP.z + (R() - 0.5) * tf * 1.4, R() * 3, 1.3);
  // mud-brick ramp along the front, rising right -> left to the working level
  { const hb = GP.half * (1 - GP.built / GP.h), sl = GP.built / (GP.half + 36 - hb - 1), x0 = GP.half + 36; const sh = new THREE.Shape(); sh.moveTo(x0, 0); sh.lineTo(hb + 1, GP.built); sh.lineTo(4, GP.built); sh.lineTo(4, 0); sh.closePath(); const g = new THREE.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: false }); g.translate(0, 0, -4);
    g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 3).fill(1), 3)); const rm = new THREE.Mesh(g, M.mud); rm.position.set(0, 0, GP.z); rm.castShadow = rm.receiveShadow = true; root.add(rm);
    for (let i = 0; i < 4; i++) { const t = 0.15 + i * 0.22, x = x0 - (x0 - hb - 1) * t, y = GP.built * t, z = GP.z + 1.2; K.at(x, y, z, 0, () => { sledgeK(K, 0, 0, 0); }, 1); for (let k = 0; k < 4; k++) { const d = 1.6 + k * 0.8; K.put(M.paint, cyl(0.2, 0.24, 1.0, 6), x - d, y + 0.5 + d * sl, z + (k % 2) * 0.5, 0, 0, 0, 1, 1, 1, k % 2 ? 0xf2ead4 : 0x9a6040); K.put(M.paint, sph(0.16, 6, 5), x - d, y + 1.15 + d * sl, z + (k % 2) * 0.5, 0, 0, 0, 1, 1, 1, 0x8a5434); } } }
  // foreground working area
  const sledge = new THREE.Group(); root.add(sledge); { const k = new Kit(); sledgeK(k, 0, 0, 0); k.beam(M.paint, [-1.0, 0.5, 0], [-3.8, 0.9, 0.3], 0.025, 0xc8a070); k.beam(M.paint, [-1.0, 0.5, 0.3], [-3.8, 0.9, -0.3], 0.025, 0xc8a070); k.build(sledge); } sledge.position.set(1.4, 0, -3.0);
  for (const [x, z] of [[-1.2, -2.6], [-1.9, -3.1], [-2.6, -2.7]]) K.beam(M.paint, [x, 0.02, z], [x + 0.2, 0.02, z - 0.9], 0.09, 0x9a6a3a, true, 8); // rollers / levers
  // block pile left, quarried blocks right
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3 - j; i++) blockOn(K, -5.2 + i * 1.6 + j * 0.8, j * 0.9, -6.5, 0.05 * (i - 1));
  for (let i = 0; i < 4; i++) blockOn(K, 5.5 + (i % 2) * 1.7, 0, -8 - (i >> 1) * 1.2, 0.2 * i);
  // overseer's table with a plan + jars
  K.box(M.paint, -3.6, -2.2, 0.72, 0.78, -1.9, -1.1, 0x8a5a34, 0.01); for (const [x, z] of [[-3.5, -1.8], [-2.3, -1.8], [-3.5, -1.2], [-2.3, -1.2]]) K.box(M.paint, x - 0.03, x + 0.03, 0, 0.72, z - 0.03, z + 0.03, 0x5a3a20, 0.005);
  K.put(M.paint, plane(0.7, 0.5), -2.9, 0.785, -1.5, -Math.PI / 2, 0.1, 0, 1, 1, 1, 0xefe2bc); jar(K, -4.1, -1.2); jar(K, -4.5, -1.6, 0.8, 0xa85a30); jar(K, 3.4, -1.4, 0.9);
  // tents, palms, sunshade
  tent(K, 9, -12, -0.4, M.cloth, 4, 3, 2.4); tent(K, -10, -14, 0.5, M.cloth, 4, 3, 2.4); tent(K, 15, -24, 0.2, M.clothB, 5, 3.4, 2.8);
  for (const [x, z, h] of [[-13, -6, 8], [-16, -10, 9.5], [12, -4, 7.5], [17, -9, 9], [-24, -30, 10], [28, -40, 9]]) palm(K, x, z, h, R, 0.2);
  // Nile strip + far green bank (left) and distant quarry cliff (right)
  mesh(root, planeUV(80, 600, 1, 1), M.nile, -130, 0.05, -150, -Math.PI / 2, 0, 0, false); mesh(root, plane(60, 600), M.leaf, -195, 0.08, -150, -Math.PI / 2, 0, 0, false);
  for (let i = 0; i < 10; i++) palm(K, -100 - R() * 8, -40 - i * 22, 9 + R() * 3, R, 0.15);
  K.box(M.stoneBig, 60, 140, 0, 14, -260, -120, 0xe8cfa0, 0.5);
  K.build(root, 4); const dust = motes(root, 40, [-5, 5, 0.3, 2.2, -6, 1], 7, 0.01);
  return { glows, sledge, dust }; }

// ================================================================= TERRACE (Alexandria, c. 40 BC, dusk)
function buildTerrace(root) { const K = new Kit(), R = rng(40), glows = [];
  mesh(root, planeUV(14, 10, 1, 1), M.marble, 0, 0, 0.5, -Math.PI / 2, 0, 0, false);
  K.box(M.marbleW, -7, 7, -0.6, 0, -4.5, 5.5, 0xe8e0d0, 0.02); // terrace slab edge
  // balustrade at the back with short balusters
  K.box(M.marbleW, -7, 7, 0, 0.18, -3.4, -3.0, 0xf2ece2, 0.02); K.box(M.marbleW, -7, 7, 0.86, 1.0, -3.45, -2.95, 0xf2ece2, 0.02);
  for (let x = -6.8; x <= 6.8; x += 0.32) K.put(M.marbleW, cyl(0.06, 0.09, 0.68, 10), x, 0.52, -3.2, 0, 0, 0, 1, 1, 1, 0xeee6d8);
  for (const x of [-5.4, -2.7, 2.7, 5.4]) column(K, x, -3.2, 4.0, 0.26); K.box(M.marbleW, -6, -2, 4.12, 4.5, -3.6, -2.8, 0xf2ece2, 0.02); K.box(M.marbleW, 2, 6, 4.12, 4.5, -3.6, -2.8, 0xf2ece2, 0.02);
  for (const x of [-4.05, 4.05]) K.box(M.paint, x - 1.3, x + 1.3, 4.3, 4.38, -2.82, -2.78, 0x2fa8a0, 0.003);
  // curtains on the side columns
  for (const s of [-1, 1]) mesh(root, plane(1.0, 3.6), M.clothB, s * 5.95, 2.1, -2.9, 0, 0, 0, false);
  // couch (kline) with cushions, small table with scrolls, brazier, potted palms, Greek bust on a pedestal
  K.at(2.4, 0, -1.4, -0.25, () => { K.box(M.paint, -1.1, 1.1, 0.3, 0.48, -0.42, 0.42, 0x6a3a5a, 0.06); K.box(M.paint, -1.1, -0.9, 0.3, 0.9, -0.42, 0.42, 0xc8a050, 0.03); for (const [x, z] of [[-1, -0.35], [1, -0.35], [-1, 0.35], [1, 0.35]]) K.box(M.paint, x - 0.05, x + 0.05, 0, 0.32, z - 0.05, z + 0.05, 0xc8a050, 0.01);
    K.put(M.paint, sph(0.22, 12, 8), -0.7, 0.6, 0, 0, 0, 0, 1.2, 0.8, 1, 0xd8b048); K.put(M.paint, sph(0.2, 12, 8), 0.6, 0.56, 0.1, 0, 0, 0, 1.2, 0.7, 1, 0x2fa8a0); });
  K.box(M.paint, 0.6, 1.3, 0.55, 0.6, -2.4, -1.9, 0xc8a050, 0.01); K.put(M.paint, cyl(0.05, 0.08, 0.55, 8), 0.95, 0.27, -2.15, 0, 0, 0, 1, 1, 1, 0xc8a050);
  for (let i = 0; i < 3; i++) K.put(M.paint, cyl(0.05, 0.05, 0.4, 10), 0.8 + i * 0.12, 0.65, -2.15, 0, 0.3 * i, Math.PI / 2, 1, 1, 1, 0xefe2bc);
  K.at(-2.3, 0, -1.6, 0, () => { for (let k = 0; k < 3; k++) { const a = k * TAU / 3; K.beam(M.brass, [Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3], [Math.cos(a) * 0.12, 0.9, Math.sin(a) * 0.12], 0.025, 0xc8a050, true, 6); } K.put(M.brass, cyl(0.32, 0.18, 0.2, 16), 0, 0.98, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); });
  const fire = []; for (let k = 0; k < 3; k++) { const fl = nond(mesh(root, plane(0.34, 0.5), M.flame, -2.3 + (k - 1) * 0.08, 1.3, -1.6, 0, k * 1.0, 0, false)); fl.renderOrder = 7; fire.push(fl); } glows.push(...fire); glows.push(glowAt(root, [-2.3, 1.3, -1.6], 1.6, '#ffb050', 0.55));
  for (const [x, z] of [[-4.6, -2.2], [4.6, -2.4]]) { K.put(M.paint, cyl(0.32, 0.24, 0.6, 14), x, 0.3, z, 0, 0, 0, 1, 1, 1, 0xb8643a); palm(K, x, z, 2.2, R, 0.08, 0.5); }
  K.box(M.marbleW, -3.75, -3.15, 0, 1.2, -2.75, -2.15, 0xf2ece2, 0.02); const bust = mesh(root, plane(0.7, 1.05), M.bust, -3.45, 1.7, -2.45, 0, 0.25, 0, true);
  // the view: sea far below, city roofs on the left, lighthouse right, harbour mole
  mesh(root, planeUV(1200, 1200, 1, 1), M.sea, 0, -14, -500, -Math.PI / 2, 0, 0, false);
  for (let i = 0; i < 46; i++) { const x = -150 + R() * 120, z = -40 - R() * 140, w = 6 + R() * 10, h = 4 + R() * 12, c = [0xf2e6cc, 0xe8d4b0, 0xf4ecd8, 0xd8c098][i % 4]; K.box(M.paint, x - w / 2, x + w / 2, -14, -14 + h, z - w / 2, z + w / 2, c, 0.2); if (i % 7 === 0) K.put(M.paint, sph(w * 0.35, 12, 8), x, -14 + h, z, 0, 0, 0, 1, 0.7, 1, 0xe8c070); }
  K.box(M.paint, -20, 200, -14, -12.6, -150, -142, 0xd8c8a8, 0.2);
  K.at(70, -14, -160, 0, () => { K.box(M.paint, -14, 14, 0, 6, -14, 14, 0xe8dcc0, 0.3); K.box(M.paint, -7, 7, 6, 42, -7, 7, 0xf2ead8, 0.2); K.put(M.paint, cyl(4.2, 5.2, 18, 8), 0, 51, 0, 0, 0, 0, 1, 1, 1, 0xf2ead8); K.put(M.paint, cyl(2.8, 3.2, 10, 16), 0, 65, 0, 0, 0, 0, 1, 1, 1, 0xf4ecdc);
    for (let y = 10; y < 40; y += 6) for (const s of [-1, 1]) K.box(M.paint, s * 2 - 0.6, s * 2 + 0.6, y, y + 1.6, 6.95, 7.1, 0x3a3a50, 0.05); });
  const beacon = nond(mesh(root, plane(10, 12), M.flame, 70, -14 + 74, -160, 0, 0, 0, false)); beacon.renderOrder = 7; glows.push(beacon); glows.push(glowAt(root, [70, -14 + 74, -160], 40, '#ffb050', 0.6));
  // ships
  for (const [x, z] of [[-30, -90], [10, -120], [40, -70]]) K.at(x, -14, z, 0.4, () => { K.box(M.paint, -4, 4, 0, 1.2, -1.2, 1.2, 0x6a4024, 0.3); K.beam(M.paint, [0, 1, 0], [0, 9, 0], 0.15, 0x6a4024, true, 6); K.put(M.paint, plane(5, 5), 0, 6, 0.2, 0, 0, 0, 1, 1, 1, 0xf2e8d0); });
  // the Moon (big, low over the sea)
  const moon = nond(mesh(root, plane(60, 60), M.moonDisk, 25, 75, -380, 0, 0, 0, false)); moon.renderOrder = 2;
  K.build(root, 4); const dust = motes(root, 40, [-5, 5, 0.4, 2.4, -3, 2], 9, 0.01);
  return { glows, fire, moon, dust, beacon }; }

// ================================================================= RUINS (Giza plateau c. 450-40 BC: finished, weathered)
function buildRuins(root) { const K = new Kit(), R = rng(69), glows = [];
  mesh(root, planeUV(800, 800, 1, 1), M.sandR, 0, 0, -250, -Math.PI / 2, 0, 0, false);
  PYR(K, M.casingW, 4, 0, -80, 22, 28, 0xffffff); PYR(K, M.casingW, -42, 0, -128, 21, 27.5, 0xf6eee0); PYR(K, M.casingW, -76, 0, -168, 10, 13, 0xf2e8d4);
  for (const [x, z] of [[-22, -60], [26, -64], [-60, -95]]) PYR(K, M.stone, x, 0, z, 3, 3.6, 0xe8cc9c); // small queens' pyramids
  // the sphinx (lion body + head in a striped headcloth)
  K.at(-16, 0, -36, 0.25, () => { const c = 0xd8b07a; K.box(M.stone, -1.6, 1.6, 0, 2.0, -7, 3, c, 0.6); K.box(M.stone, -1.3, 1.3, 0, 0.9, 3, 6.2, c, 0.3); K.box(M.stone, -1.9, 1.9, 0, 0.5, -7.5, 6.4, 0xc8a06a, 0.2);
    K.box(M.stone, -1.5, 1.5, 2.0, 4.2, 0.6, 3.4, c, 0.5); K.put(M.paint, sph(1.25, 14, 10), 0, 4.6, 2.4, 0, 0, 0, 1.1, 1.15, 1, 0xd8b07a); K.box(M.paint, -1.9, 1.9, 3.3, 5.6, 1.2, 2.2, 0xc8a06a, 0.5); K.box(M.paint, -0.55, 0.55, 3.0, 3.6, 3.3, 3.6, 0xb89060, 0.1); });
  // fallen blocks, palms, a stone marker for visitors
  for (let i = 0; i < 10; i++) blockOn(K, (R() - 0.5) * 14, 0, -6 - R() * 10, R() * 3, 0.8 + R() * 0.5);
  for (const [x, z, h] of [[-9, -4, 7], [10, -7, 8.5], [13, -14, 9.5], [-14, -12, 8]]) palm(K, x, z, h, R, 0.22);
  K.build(root, 4); const dust = motes(root, 30, [-5, 5, 0.3, 2.2, -5, 1], 11, 0.01);
  return { glows, dust }; }

// ================================================================= ROAD (the timeline)
const YEARS = []; for (let y = -2600; y <= 2000; y += 100) YEARS.push(y);
const ylab = (y) => y < 0 ? `${-y} BC` : y === 0 ? 'AD 1' : `${y}`;
function buildRoad(root) { const K = new Kit(), R = rng(1969), glows = [], L = 310;
  // ground: sand near the start, greener toward the modern end (vertex colours)
  { const g = new THREE.PlaneGeometry(900, 1100, 60, 80); g.rotateX(-Math.PI / 2); const p = g.attributes.position, c = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) { const z = p.getZ(i) - 280, t = clamp01((-z - 30) / 220); c.set([1.0 - 0.18 * t, 0.94 + 0.04 * t, 0.78 - 0.08 * t], i * 3); } g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    const m = new THREE.Mesh(g, M.grassR); m.position.set(0, -0.02, -280); m.receiveShadow = true; root.add(m); }
  // road: one textured segment per century (texture = one century)
  for (const y of YEARS) { if (y >= 2000) break; const z0 = ROADZ(y), z1 = ROADZ(y + 100); const seg = mesh(root, plane(8, 6), M.road, 0, 0.12, (z0 + z1) / 2, -Math.PI / 2, 0, 0, false); seg.receiveShadow = true; }
  mesh(root, plane(8, 6), M.road, 0, 0.12, ROADZ(2050), -Math.PI / 2, 0, 0, false); mesh(root, plane(8, 20), M.road, 0, 0.12, 10, -Math.PI / 2, 0, 0, false);
  K.box(M.paint, -4.4, -4.0, 0, 0.3, ROADZ(2100), 20, 0xd8b048, 0.05); K.box(M.paint, 4.0, 4.4, 0, 0.3, ROADZ(2100), 20, 0xd8b048, 0.05);
  // century sign posts (right) + millennium arches
  const signs = []; for (const y of YEARS) { const z = ROADZ(y), big = y % 1000 === 0, mat = H.M.em(H.mkTex(256, 96, (g, w, h) => signTex(g, w, h, ylab(y), { big })), 0x2a2a2a);
    K.beam(M.paint, [5.2, 0, z], [5.2, 2.6, z], 0.07, 0x5a3a24, true, 8); const s = mesh(root, plane(2.2, 0.82), mat, 5.2, 2.5, z + 0.02, 0, 0, 0, false); signs.push(s);
    if (big) { for (const s2 of [-1, 1]) K.put(M.paint, cyl(0.35, 0.42, 7, 12), s2 * 5.0, 3.5, z, 0, 0, 0, 1, 1, 1, 0xd8b048); K.box(M.paint, -5.6, 5.6, 7.0, 7.8, z - 0.4, z + 0.4, 0xd8b048, 0.1);
      const bm = H.M.em(H.mkTex(512, 96, (g, w, h) => signTex(g, w, h, ylab(y), { big: 1, bg: '#7a2238' })), 0x3a2a2a); mesh(root, plane(6.0, 1.1), bm, 0, 7.4, z + 0.42, 0, 0, 0, false); } }
  // landmarks: pyramid (2560 BC, left), Cleopatra medallion (69 BC, left), rocket (1969, left), YOU ARE HERE (2026)
  const zP = ROADZ(-2560), zC = ROADZ(-69), zM = ROADZ(1969), zY = ROADZ(2026);
  PYR(K, M.casing, -14, 0, zP - 4, 7, 9, 0xffffff); PYR(K, M.stone, -24, 0, zP + 6, 4, 5, 0xffffff);
  K.beam(M.paint, [-7.5, 0, zC], [-7.5, 5.2, zC], 0.12, 0xd8b048, true, 10); const cm = H.M.em(H.mkTex(512, 512, (g, w, h) => medalTex(g, w, h, { bg: '#f2e6c0', icon: iconCleo, a: 'CLEOPATRA', b: '69 BC' })), 0x3a3a3a); cm.transparent = false; cm.alphaTest = 0.5;
  const med = mesh(root, plane(4.2, 4.2), cm, -7.5, 6.6, zC + 0.15, 0, 0.2, 0, false);
  const rocket = new THREE.Group(); root.add(rocket); { const k = new Kit(); k.put(M.paint, cyl(1.3, 1.3, 14, 20), 0, 7, 0, 0, 0, 0, 1, 1, 1, 0xf4f4f0); for (const y of [3, 9.5]) k.put(M.paint, cyl(1.32, 1.32, 1.2, 20), 0, y, 0, 0, 0, 0, 1, 1, 1, 0x2a2a30);
    k.put(M.paint, cyl(0.9, 1.3, 2.4, 20), 0, 15.2, 0, 0, 0, 0, 1, 1, 1, 0xf4f4f0); k.put(M.paint, cyl(0.2, 0.9, 3, 20), 0, 17.9, 0, 0, 0, 0, 1, 1, 1, 0xe8e8e4); k.beam(M.paint, [0, 19.4, 0], [0, 21.2, 0], 0.08, 0xc0302c, true, 6);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; k.put(M.paint, cached('fin', () => new THREE.BoxGeometry(0.15, 2.4, 1.2)), Math.cos(a) * 1.5, 1.4, Math.sin(a) * 1.5, 0, -a, 0, 1, 1, 1, 0x2a2a30); } k.build(rocket); }
  rocket.position.set(-12, 0, zM); const flame = nond(mesh(rocket, plane(3, 6), M.flame, 0, -2.6, 0, Math.PI, 0, 0, false)); flame.renderOrder = 7; flame.visible = false; glows.push(flame);
  K.at(-12, 0, zM, 0, () => { K.box(M.paint, -3.5, 3.5, 0, 0.5, -3.5, 3.5, 0x8a8a90, 0.05); for (const [x, z] of [[2.4, -2.4], [2.4, 2.4]]) K.beam(M.metal, [x, 0.5, z], [x, 18, z], 0.18, 0xc0302c, true, 6); for (let y = 2; y < 18; y += 2.5) K.beam(M.metal, [2.4, y, -2.4], [2.4, y, 2.4], 0.08, 0xc0302c, true, 6); });
  K.beam(M.paint, [6.4, 0, zY], [6.4, 3.4, zY], 0.09, 0x2a2a30, true, 8); const ym = H.M.em(H.mkTex(384, 160, (g, w, h) => signTex(g, w, h, 'YOU ARE HERE', { bg: '#2fa8a0' })), 0x2a2a2a); mesh(root, plane(2.6, 1.08), ym, 6.4, 3.3, zY + 0.04, 0, -0.2, 0, false);
  // ground medallions for the aerial shots (left of the road) + span brackets (right)
  const medal = (z, o) => { const mm = H.M.em(H.mkTex(1024, 1024, (g, w, h) => medalTex(g, w, h, o)), 0x5a5a5a); mm.transparent = true; mm.depthWrite = false; mm.alphaTest = 0.1; const m = mesh(root, plane(46, 46), mm, -36, 0.18, z, -Math.PI / 2, 0, 0, false); m.receiveShadow = false; return m; };
  medal(zP, { bg: '#f8e8c0', icon: iconPyr, a: 'GREAT PYRAMID', b: 'c. 2560 BC' }); medal(zC, { bg: '#f8e0e0', icon: iconCleo, a: 'CLEOPATRA', b: 'born 69 BC' }); medal(zM, { bg: '#dce4f8', icon: iconMoon, a: 'MOON LANDING', b: '1969' });
  const span = (z0, z1, lab, col) => { const g = new THREE.Group(); root.add(g); const k = new Kit(); const len = Math.abs(z1 - z0); k.box(M.paint, 0, 2.2, 0, 0.3, -len / 2, len / 2, col, 0.1); for (const s of [-1, 1]) k.box(M.paint, -6, 2.2, 0, 0.3, s * len / 2 - 1.1, s * len / 2 + 1.1, col, 0.1); k.build(g);
    const lm = H.M.em(H.mkTex(1024, 256, (gg, w, h) => { gg.clearRect(0, 0, w, h); gg.fillStyle = col === 0xc0302c ? '#c0302c' : '#2f6ad0'; gg.beginPath(); gg.roundRect(8, 8, w - 16, h - 16, 60); gg.fill(); txt(gg, lab, w / 2, h / 2 + 6, w * 0.88, h * 0.6, { col: '#ffffff', font: SANS }); }), 0x4a4a4a); lm.transparent = true; lm.depthWrite = false;
    const lb = mesh(g, plane(66, 16.5), lm, 40, 0.3, 0, -Math.PI / 2, 0, 0, false); g.position.set(10, 0.05, (z0 + z1) / 2); g.userData.len = len; return g; };
  const spans = [span(zP, zC, '≈ 2,500 YEARS', 0xc0302c), span(zC, zM, '≈ 2,000 YEARS', 0x2f6ad0)];
  // dressing: trees, rocks, era props (palms early, cypress mid, round trees late)
  for (let i = 0; i < 70; i++) { const z = 10 - R() * 300, s = R() < 0.5 ? -1 : 1, x = s * (12 + R() * 60); if (Math.abs(x + 36) < 26 && [zP, zC, zM].some((q) => Math.abs(q - z) < 20)) continue; if (s > 0 && x < 78) continue;
    if (z > -120) palm(K, x, z, 6 + R() * 4, R, 0.2); else { K.beam(M.bark, [x, 0, z], [x, 2.4, z], 0.2, 0xffffff, true, 6); K.put(M.leaf, sph(1.8, 10, 8), x, 4, z, 0, 0, 0, 1, 1.2, 1, [0x5a8a3a, 0x4a7a32, 0x6a9a42][i % 3]); } }
  K.build(root, 6); return { glows, signs, rocket, flame, spans, zP, zC, zM }; }

// ================================================================= MOON (1969)
function buildMoon(root) { const K = new Kit(), R = rng(1969), glows = [];
  const cr = [[-6, -14, 3.5], [8, -22, 5], [-14, -30, 6], [3, -9, 1.6], [-3, 4, 1.2], [12, -6, 2.5], [-20, -12, 4], [20, -40, 9]];
  const hf = (x, z) => { let y = 0.12 * Math.sin(x * 0.3) * Math.cos(z * 0.25) + 0.06 * Math.sin(x * 1.1 + z * 0.7); for (const [cx, cz, r] of cr) { const d = Math.hypot(x - cx, z - cz) / r; if (d < 1.4) y += d < 1 ? -0.35 * r * 0.25 * (1 - d * d) : 0.12 * r * 0.25 * Math.sin((d - 1) / 0.4 * Math.PI); } return y + (z < -60 ? 2 * sm(-60, -120, z) * (1 + Math.sin(x * 0.05)) : 0); };
  { const g = new THREE.PlaneGeometry(260, 220, 130, 110); g.rotateX(-Math.PI / 2); const p = g.attributes.position, c = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) - 60, y = hf(x, z); p.setY(i, y); const v = 0.86 + 0.1 * Math.sin(x * 0.2 + z * 0.13); c.set([v, v, v * 1.02], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.computeVertexNormals(); const m = new THREE.Mesh(g, M.reg); m.position.set(0, 0, -60); m.receiveShadow = true; root.add(m); }
  for (let i = 0; i < 40; i++) { const x = (R() - 0.5) * 40, z = 4 - R() * 40, s = 0.1 + R() * 0.4; K.put(M.paint, sph(1, 7, 5), x, hf(x, z) + s * 0.3, z, R(), R(), R(), s * 1.3, s, s, 0x8a8a8c); }
  // lander (descent stage + legs + ascent stage), at (3, 0, -6)
  K.at(3.2, hf(3.2, -6.5), -6.5, -0.5, () => { K.put(M.foil, cyl(1.8, 1.8, 1.5, 8), 0, 1.75, 0, 0, Math.PI / 8, 0, 1, 1, 1, 0xffffff);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, cx = Math.cos(a), sz = Math.sin(a); K.beam(M.chrome, [cx * 1.5, 2.2, sz * 1.5], [cx * 3.0, 0.25, sz * 3.0], 0.07, 0xd8d8dc, true, 6); K.beam(M.chrome, [cx * 1.6, 1.1, sz * 1.6], [cx * 2.9, 0.4, sz * 2.9], 0.05, 0xd8d8dc, true, 6); K.put(M.chrome, cyl(0.45, 0.5, 0.12, 14), cx * 3.05, 0.1, sz * 3.05, 0, 0, 0, 1, 1, 1, 0xd8d8dc); }
    K.box(M.paint, -1.2, 1.2, 2.5, 4.3, -1.0, 1.1, 0xc8ccd2, 0.15); K.box(M.paint, -0.9, 0.9, 4.3, 4.9, -0.8, 0.6, 0xb8bcc4, 0.1); K.put(M.paint, cyl(0.45, 0.45, 0.2, 12), 0, 5.0, -0.1, 0, 0, 0, 1, 1, 1, 0x9aa0a8); K.box(M.paint, -0.35, 0.35, 3.3, 3.9, 1.08, 1.14, 0x1a1e2a, 0.02);
    K.beam(M.chrome, [0, 4.9, 0.3], [0.3, 5.9, 0.3], 0.03, 0xe8e8ec, true, 6); K.put(M.chrome, sph(0.25, 10, 6), 0.32, 6.0, 0.3, 0, 0, 0, 1, 0.3, 1, 0xe8e8ec);
    for (const s of [-1, 1]) K.beam(M.chrome, [s * 0.35, 0.4, 2.45], [s * 0.35, 2.4, 1.5], 0.04, 0xd8d8dc, true, 6); for (let k = 0; k < 7; k++) K.beam(M.chrome, [-0.35, 0.6 + k * 0.28, 2.33 - k * 0.13], [0.35, 0.6 + k * 0.28, 2.33 - k * 0.13], 0.025, 0xd8d8dc, true, 6); });
  // flag (plant(t) raises it)
  const flag = new THREE.Group(); root.add(flag); { const k = new Kit(); k.beam(M.chrome, [0, -0.5, 0], [0, 2.3, 0], 0.025, 0xe8e8ec, true, 8); k.beam(M.chrome, [0, 2.25, 0], [1.25, 2.25, 0], 0.018, 0xe8e8ec, true, 6); k.build(flag); const fm = mesh(flag, plane(1.25, 0.8), M.flagUS, 0.625, 1.84, 0, 0, 0, 0, true); flag.userData.fm = fm; }
  flag.position.set(-1.8, hf(-1.8, -3.6), -3.6); flag.rotation.y = 0.25;
  // bootprints
  for (let i = 0; i < 18; i++) { const x = -1.2 + i * 0.3 + (i % 2) * 0.12, z = -1.5 - i * 0.22; K.put(M.paint, cached('boot', () => new THREE.BoxGeometry(0.14, 0.02, 0.3)), x, hf(x, z) + 0.005, z, 0, 0.7, 0, 1, 1, 1, 0x707074); }
  // Earth + far hills
  const earth = nond(mesh(root, plane(26, 26), M.earth, 60, 70, -300, 0, 0, 0, false)); earth.renderOrder = 2;
  K.build(root, 4); return { glows, flag, earth }; }

// ================================================================= CLASSROOM (today)
function buildClass(root) { const K = new Kit(), R = rng(2026), glows = [], X = 4.2, ZB = -3.0, HT = 3.0;
  mesh(root, planeUV(9, 8, 1, 1), M.floorC, 0, 0, 0.5, -Math.PI / 2, 0, 0, false);
  mesh(root, plane(2 * X, HT), M.wallC, 0, HT / 2, ZB, 0, 0, 0, false); for (const s of [-1, 1]) mesh(root, plane(8, HT), M.wallC, s * X, HT / 2, ZB + 4, 0, -s * Math.PI / 2, 0, false);
  mesh(root, plane(2 * X, 8), H.toon({ color: 0xf6f4ee, side: THREE.DoubleSide }), 0, HT, ZB + 4, Math.PI / 2, 0, 0, false); K.box(M.paint, -X, X, 0, 0.12, ZB, ZB + 0.03, 0x5a6a8a, 0.003);
  // whiteboard with the timeline
  K.box(M.paint, -1.9, 1.9, 0.95, 2.55, ZB, ZB + 0.04, 0xb8bcc8, 0.01); mesh(root, plane(3.6, 1.5), M.board, 0, 1.75, ZB + 0.045, 0, 0, 0, false); K.box(M.paint, -1.9, 1.9, 0.92, 0.97, ZB, ZB + 0.12, 0xa8acb8, 0.005);
  for (const [x, c] of [[-0.6, 0xc0302c], [-0.45, 0x2f6ad0], [-0.3, 0x2a2a40]]) K.put(M.paint, cyl(0.015, 0.015, 0.12, 8), x, 0.985, ZB + 0.08, 0, 0, Math.PI / 2, 1, 1, 1, c);
  // posters, window (left wall), shelf + globe + plant (right)
  mesh(root, plane(0.7, 1.0), M.posterP, -3.0, 1.75, ZB + 0.02, 0, 0, 0, false); mesh(root, plane(0.7, 1.0), M.posterM, 3.0, 1.75, ZB + 0.02, 0, 0, 0, false);
  mesh(root, plane(2.4, 1.5), M.winDay, -X + 0.02, 1.7, -0.8, 0, Math.PI / 2, 0, false); for (const [y0, y1, z0, z1] of [[0.9, 0.98, -2.05, 0.45], [2.42, 2.5, -2.05, 0.45], [0.9, 2.5, -2.07, -1.97], [0.9, 2.5, 0.37, 0.45], [0.9, 2.5, -0.84, -0.76]]) K.box(M.paint, -X + 0.01, -X + 0.08, y0, y1, z0, z1, 0xf4f4f0, 0.005);
  K.box(M.paint, 3.2, 4.15, 0, 1.0, -2.6, -1.4, 0xc8a070, 0.02); for (let i = 0; i < 8; i++) K.box(M.paint, 3.3 + i * 0.1, 3.38 + i * 0.1, 0.55, 0.85 + (i % 3) * 0.04, -2.5, -2.3, [0xc0302c, 0x2f6ad0, 0xe8b838, 0x2fa8a0][i % 4], 0.005);
  K.put(M.paint, cyl(0.03, 0.08, 0.1, 10), 3.6, 1.05, -1.8, 0, 0, 0, 1, 1, 1, 0x2a2a30); K.put(M.paint, sph(0.2, 18, 12), 3.6, 1.32, -1.8, 0, 0, 0.4, 1, 1, 1, 0x2f7ad0); K.put(M.leaf, sph(0.12, 10, 8), 3.55, 1.38, -1.72, 0, 0, 0, 1.2, 0.8, 0.6, 0x4a9a4a);
  K.put(M.paint, cyl(0.2, 0.15, 0.4, 12), -3.5, 0.2, -2.4, 0, 0, 0, 1, 1, 1, 0xd86a3a); for (let i = 0; i < 5; i++) K.put(M.leaf, sph(0.2, 10, 8), -3.5 + Math.cos(i * 1.3) * 0.12, 0.55 + i * 0.07, -2.4 + Math.sin(i * 1.3) * 0.12, 0, 0, 0, 1, 1.3, 1, 0x4a8a3a);
  // desks
  for (const [x, z] of [[-1.6, 0.6], [1.6, 0.6], [-1.6, 2.2], [1.6, 2.2]]) { K.box(M.paint, x - 0.6, x + 0.6, 0.7, 0.76, z - 0.35, z + 0.35, 0xd8b888, 0.01); for (const [dx, dz] of [[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]]) K.box(M.metal, x + dx - 0.02, x + dx + 0.02, 0, 0.7, z + dz - 0.02, z + dz + 0.02, 0x5a6070, 0.005);
    K.box(M.paint, x - 0.22, x + 0.22, 0.44, 0.48, z + 0.45, z + 0.85, 0x2f6ad0, 0.01); K.box(M.paint, x - 0.22, x + 0.22, 0.48, 0.9, z + 0.83, z + 0.87, 0x2f6ad0, 0.01); }
  // ceiling lights
  for (const x of [-1.8, 1.8]) { K.box(M.paint, x - 0.6, x + 0.6, HT - 0.06, HT, -0.2, 0.2, 0xe8e8e8, 0.01); mesh(root, plane(1.1, 0.3), M.lampOn, x, HT - 0.065, 0, Math.PI / 2, 0, 0, false); }
  K.build(root, 3); return { glows }; }

// ================================================================= lights, grades, API
const DAY = (o = {}) => ({ top: '#4f8ad8', hor: '#c8dcf0', fog: '#e8e0d0', fogN: 120, fogF: 900, sky: '#a8c0f0', ground: '#8a6a4a', hemiI: 0.7, fillCol: '#8a9ae6', fillI: 0.35, sunCol: '#ffe6bc', sunI: 3.6, az: 40, el: 42, disc: '#fffbe8', cloud: '#ffffff', clouds: true, cardTint: '#ffffff', fxTint: '#ffffff', shadow: true, shafts: 0.3, ...o });
const SET_LIGHT = {
  giza: DAY({ hor: '#f0dcc0', fog: '#f2dcb8', fogN: 150, fogF: 1000, sunCol: '#ffe2b0', sunI: 3.8, az: 50, el: 40 }),
  gizaLow: DAY({ hor: '#f0dcc0', fog: '#f2dcb8', fogN: 150, fogF: 1000, sunCol: '#ffe2b0', sunI: 3.8, az: 130, el: 34, shafts: 0.5 }),
  terrace: { top: '#2a3a80', hor: '#f0a878', fog: '#c89a90', fogN: 120, fogF: 900, sky: '#a8a0d8', ground: '#6a4a5a', hemiI: 0.9, fillCol: '#8a90e0', fillI: 0.45, sunCol: '#ffb070', sunI: 2.6, az: -70, el: 12, disc: '#ffe0b0', cloud: '#f8c8b0', clouds: true, cardTint: '#fff2e4', fxTint: '#ffffff', shadow: true, shafts: 0.2 },
  ruins: DAY({ hor: '#f2e2c8', fog: '#f4e4c8', fogN: 150, fogF: 1100, sunCol: '#fff0c8', sunI: 3.8, az: -40, el: 44 }),
  road: DAY({ fogN: 600, fogF: 2600, az: 30, el: 46, sunI: 3.4, hemiI: 0.8 }),
  roadHigh: DAY({ fogN: 900, fogF: 3000, az: 30, el: 52, sunI: 3.2, hemiI: 0.9, clouds: false, shafts: 0 }),
  moon: { top: '#000000', hor: '#05060c', fog: '#05060c', fogN: 400, fogF: 2000, sky: '#8a90a8', ground: '#3a3a40', hemiI: 0.55, fillCol: '#6a7090', fillI: 0.3, sunCol: '#fffaf0', sunI: 4.2, az: 100, el: 22, disc: '#000000', clouds: false, stars: 1, cardTint: '#ffffff', fxTint: '#ffffff', shadow: true, shafts: 0 },
  classroom: { top: '#000000', hor: '#e8e4dc', fog: '#e8e4dc', fogN: 20, fogF: 80, sky: '#ffffff', ground: '#9a8a7a', hemiI: 1.3, fillCol: '#a0a8d8', fillI: 0.3, sunCol: '#fff2dc', sunI: 1.5, az: -60, el: 40, disc: '#000000', clouds: false, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shadow: false, shafts: 0 },
};
const SET_GRADE = {
  giza: { look: 'day', over: { exp: 1.0, con: 1.12, sat: 1.08, lift: [0.025, 0.02, 0.03], tS: ['#4a3a8a', 0.12], tH: ['#ffe0b0', 0.12], bloom: [0.5, 0.75], vig: [0.22, 0.5, '#2a1a20'] } },
  gizaLow: { look: 'day', over: { exp: 1.0, con: 1.14, sat: 1.08, lift: [0.025, 0.02, 0.03], tS: ['#4a3a8a', 0.12], tH: ['#ffe0b0', 0.14], bloom: [0.5, 0.72], vig: [0.24, 0.5, '#2a1a20'] } },
  terrace: { look: 'day', over: { exp: 1.02, con: 1.14, sat: 1.06, lift: [0.035, 0.025, 0.045], tS: ['#3a2a7a', 0.16], tH: ['#ffc890', 0.16], bloom: [0.45, 0.7], hal: [0.25, '#ff9a60'], vig: [0.28, 0.48, '#1a1028'] } },
  ruins: { look: 'day', over: { exp: 1.0, con: 1.12, sat: 1.06, lift: [0.025, 0.02, 0.03], tS: ['#4a3a8a', 0.12], tH: ['#fff0c8', 0.1], bloom: [0.5, 0.75], vig: [0.22, 0.5, '#2a1a20'] } },
  road: { look: 'day', over: { exp: 1.0, con: 1.1, sat: 1.1, lift: [0.02, 0.02, 0.03], tS: ['#3a4a8a', 0.12], tH: ['#ffe8c0', 0.1], bloom: [0.5, 0.75], vig: [0.2, 0.5, '#1a2040'] } },
  roadHigh: { look: 'day', over: { exp: 1.0, con: 1.1, sat: 1.1, lift: [0.02, 0.02, 0.03], tS: ['#3a4a8a', 0.12], tH: ['#ffe8c0', 0.1], bloom: [0.5, 0.75], vig: [0.18, 0.55, '#1a2040'] } },
  moon: { look: 'day', over: { exp: 1.0, con: 1.16, sat: 1.0, lift: [0.02, 0.02, 0.035], tS: ['#2a3a7a', 0.14], tH: ['#fff6e8', 0.08], bloom: [0.5, 0.7], vig: [0.3, 0.46, '#000008'] } },
  classroom: { look: 'office', over: { exp: 1.06, con: 1.1, sat: 1.06, lift: [0.03, 0.03, 0.035], tS: ['#3a3a7a', 0.1], tH: ['#fff0d8', 0.1], bloom: [0.45, 0.74], hal: [0.2, '#ffe0b0'], vig: [0.24, 0.5, '#2a2430'] } },
};
const GROUP_OF = { giza: 'giza', gizaLow: 'giza', terrace: 'terrace', ruins: 'ruins', road: 'road', roadHigh: 'road', moon: 'moon', classroom: 'classroom' };

export function buildCleo(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  let gz, te, ru, rd, mo, cl;
  const API = makeAPI(ctx, { prefix: 'cl_', origin: CL_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { giza: 'day', gizaLow: 'day', terrace: 'day', ruins: 'day', road: 'day', roadHigh: 'day', moon: 'day', classroom: 'office' },
    practicals: (name, F, W3) => { const fl = 1 + 0.1 * Math.sin(F * 0.9) * Math.sin(F * 0.37);
      if (name === 'terrace') return [{ p: W3('terrace', [-2.3, 1.5, -1.5]), col: '#ffa850', I: 3.0 * fl, d: 6 }, { p: W3('terrace', [1.5, 2.6, 1.5]), col: '#ffd8b0', I: 1.2, d: 7 }];
      if (name === 'classroom') return [{ p: W3('classroom', [-1.8, 2.8, 0.2]), col: '#fff6e8', I: 2.4, d: 7 }, { p: W3('classroom', [1.8, 2.8, 0.2]), col: '#fff6e8', I: 2.4, d: 7 }, { p: W3('classroom', [-3.6, 1.7, -0.8]), col: '#e8f0ff', I: 1.8, d: 6 }];
      if (name === 'moon') return [{ p: W3('moon', [0, 2.5, 4]), col: '#c8d0ff', I: 0.8, d: 9 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'giza' && gz) tickMotes(gz.dust, f, 0.5);
      if (cur === 'ruins' && ru) tickMotes(ru.dust, f, 0.5);
      if (cur === 'terrace' && te) { tickMotes(te.dust, f, 0.3); te.fire.forEach((m, i) => { m.scale.set(1 + 0.12 * Math.sin(f * 0.7 + i), 1 + 0.18 * Math.sin(f * 0.9 + i * 2), 1); }); }
      if (cur === 'moon' && mo) { const fm = mo.flag.userData.fm; fm.rotation.y = 0.04 * Math.sin(T * 1.3); }
      if (cur === 'road' && rd) { rd.flame.scale.set(1 + 0.1 * Math.sin(f * 1.3), 1 + 0.2 * Math.sin(f * 1.7), 1); } },
    apply: (v) => { if (v.sledge != null) API.sledge(v.sledge); if (v.launch != null) API.launch(v.launch); if (v.span != null) API.span(...v.span); if (v.plant != null) API.plant(v.plant); } });
  gz = buildGiza(API.groups.giza); te = buildTerrace(API.groups.terrace); ru = buildRuins(API.groups.ruins); rd = buildRoad(API.groups.road); mo = buildMoon(API.groups.moon); cl = buildClass(API.groups.classroom);
  API.parts = { gz, te, ru, rd, mo, cl }; API.ROADZ = ROADZ;
  // [CLEO-sets] state setters
  API.sledge = (k) => { gz.sledge.position.x = 1.4 - 2.2 * clamp01(k); };
  API.launch = (k) => { const t = clamp01(k); rd.rocket.position.y = 30 * t * t; rd.flame.visible = t > 0.001; };
  API.span = (a, b = a) => { rd.spans.forEach((g, i) => { const t = clamp01(i ? b : a); g.visible = t > 0.001; g.scale.set(1, 1, Math.max(0.001, t)); }); };
  API.plant = (k) => { const t = clamp01(k); mo.flag.position.y = -2.0 * (1 - t) + 0; mo.flag.visible = t > 0.001; };
  API.glows = { giza: gz.glows, terrace: te.glows, ruins: ru.glows, road: rd.glows, moon: mo.glows, classroom: cl.glows };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); if (API.cur === 'terrace') te.moon.quaternion.copy(cam.quaternion); if (API.cur === 'moon') mo.earth.quaternion.copy(cam.quaternion); };
  const V = API.V, zC = ROADZ(-69);
  API.views = [
    V('giza', [0.4, 1.7, 5.0], [0, 6, -60], 52, 1.2, [0, 1.0, -3]),                         // 0 giza wide
    V('gizaLow', [2.5, 0.5, 1.2], [0.5, 1.4, -3.0], 50, 2, [1.4, 0.7, -3.0], { sledge: 0.3 }), // 1 sledge low
    V('terrace', [0.3, 1.6, 4.2], [0, 2.2, -6], 52, 1.4, [0, 1.2, -1.5]),                   // 2 terrace wide (moon)
    V('terrace', [-2.0, 1.6, 1.6], [-3.4, 1.6, -2.4], 46, 2.4, [-3.4, 1.6, -2.4]),           // 3 bust + brazier
    V('ruins', [0.3, 1.6, 6.0], [0, 8, -60], 52, 1.2, [0, 1.0, -3]),                         // 4 ruins wide
    V('road', [0, 2.2, 12], [0, 1.5, -30], 54, 1.0, [0, 1, 0]),                               // 5 road start
    V('road', [2, 2.2, zC + 14], [-2, 3, zC - 10], 52, 1.2, [-4, 2, zC]),                    // 6 road @ Cleopatra
    V('road', [6, 3, ROADZ(1969) + 20], [-8, 8, ROADZ(1969) - 10], 52, 1.0, [-12, 6, ROADZ(1969)], { launch: 0 }), // 7 road @ rocket
    V('roadHigh', [0, 560, -138 + 95], [0, 0, -138], 32, 0, null, { span: [1, 1] }),          // 8 aerial
    V('moon', [0.5, 1.6, 5.0], [1, 2, -10], 52, 1.4, [1, 1.0, -3]),                           // 9 moon wide
    V('moon', [-0.5, 1.4, 1.2], [-1.6, 1.6, -3.6], 46, 2.4, [-1.6, 1.4, -3.6]),               // 10 flag close
    V('classroom', [0.3, 1.5, 4.4], [0, 1.4, -3], 52, 1.4, [0, 1.3, -1.0]),                  // 11 classroom wide
    V('classroom', [0.2, 1.75, 0.9], [0, 1.72, -3], 46, 3, [0, 1.75, -2.9]),                 // 12 whiteboard close
  ];
  API.sledge(0); API.launch(0); API.span(0, 0); API.plant(1); API.tick(0);
  return API;
}
