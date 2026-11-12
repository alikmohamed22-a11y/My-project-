// vk_sets.js [VK-sets]: sets for "Vikings never wore horned helmets" (Oddverra short).
//   fjord : Norse fjord at dawn: steep cliffs, calm water, a longship (clinker hull, striped sail, shield row, dragon prow), pebble beach,
//           turf-roof longhouse, fish rack, rocks, pines. Moods 'fjord' (dawn), 'fjordDay'.                                  origin (-58000, 0, 0)
//   dig   : excavation: grass field, open trench with a ship-burial rivet outline + sword, grid stakes + strings, finds tent with a
//           tray holding the Gjermundbu-style iron helmet (3D), a cut burial mound with the helmet in the soil, red Norwegian farm.
//           Moods 'dig' (day), 'dig43' (1943, warm sepia), 'digTent' (tray close).                                       origin (-58000, 0, 800)
//   bog   : Danish peat bog: reeds, pools, peat banks, birches, mist; two bronze horned Veksø-style helmets on a peat ledge (3D).
//           Mood 'bog' (misty morning).                                                                                  origin (-58000, 0, 1600)
//   bay   : Bayreuth 1876: the Festspielhaus (brick + timber frame, portico, stage tower), gas lamps, path, playbill board, an
//           advertising column with horned-Viking posters. Moods 'bayNight', 'bayDay'.                                      origin (-60500, 0, 0)
//   stage : opera house interior: proscenium, red curtains (setCurtain 0..1), footlights, painted fjord backdrop, ship + wave flats,
//           dark audience rows, a pit rail. Moods 'stage', 'stageHouse' (house lights up for the reveal).                   origin (-60500, 0, 800)
//   shop  : 1870s costume workshop: drafting table with sketch, costume dummies (one helmet grows horns: setHorns 0..1), fabric bolts,
//           easel with a Romantic horned-warrior painting, window shaft, oil lamps. Mood 'shop'.                           origin (-60500, 0, 1600)
// Each set: local frame, camera side +z. Test flag ?vkview=N (main.js).
import { H, TAU, clamp01, sm, SERIF, SANS, cyl, sph, plane, planeUV, lathe, mesh, nond, lumpGeo, shapeGeo, txt, grain, scrib, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';

export const VK_ORIGIN = { fjord: [-58000, 0, 0], dig: [-58000, 0, 800], bog: [-58000, 0, 1600], bay: [-60500, 0, 0], stage: [-60500, 0, 800], shop: [-60500, 0, 1600] };
const GROUP_OF = { fjord: 'fjord', fjordDay: 'fjord', dig: 'dig', dig43: 'dig', digTent: 'dig', bog: 'bog', bayNight: 'bay', bayDay: 'bay', stage: 'stage', stageHouse: 'stage', shop: 'shop' };
let THREE, PT, M;

// ---------------------------------------------------------------- ground heights (exported for the timeline)
const wallH = (x, z) => { const b = 10 * Math.sin(z * 0.012) + 4 * Math.sin(z * 0.031 + 1), d = Math.abs(x - b); return sm(24, 70, d) * (60 + 28 * Math.sin(z * 0.02 + x * 0.01) + 14 * Math.sin(x * 0.07 + z * 0.05)) + sm(-260, -420, z) * 95; };
export function ff(x, z) { const beach = z > -14 ? Math.max(-3, Math.min(1.0, (z - 1.5) * 0.12 + 0.08 * Math.sin(x * 0.6) * sm(1, 4, z))) : -3; return Math.max(beach, wallH(x, z) - 4); }
export function df(x, z) { const mound = 1.9 * Math.exp(-(((x - 9) / 4.6) ** 2 + ((z + 5) / 3.8) ** 2)); const cut = (x > 7.2 && x < 10.8 && z > -5.6 && z < 1.5) ? sm(7.2, 7.9, x) * (1 - sm(10.1, 10.8, x)) * sm(-5.6, -4.8, z) : 0;
  const trench = (x > -7 && x < 3 && z > -4 && z < 1) ? -0.55 * sm(-7, -6.4, x) * (1 - sm(2.4, 3, x)) * sm(-4, -3.4, z) * (1 - sm(0.4, 1, z)) : 0;
  return mound * (1 - 0.75 * cut) + trench + sm(-25, -80, z) * (8 + 6 * Math.sin(x * 0.03)) + 0.12 * Math.sin(x * 0.4) * Math.sin(z * 0.3) * sm(-8, -15, z); }
export function bf(x, z) { const bank = 0.35 * Math.exp(-(((x + 0.2) / 2.6) ** 2 + ((z + 1.0) / 1.6) ** 2)); return -0.05 + 0.18 * Math.sin(x * 0.35 + 1) * Math.sin(z * 0.28) + bank + sm(-30, -90, z) * (5 + 3 * Math.sin(x * 0.04)); }
export const bayf = (x, z) => sm(-6, -30, z) * 0.6;

// ---------------------------------------------------------------- painters
const css = (r, g, b, a = 1) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;
function waterTex(g, w, h) { g.fillStyle = '#3a6a82'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.85 + 0.25 * PT.fbm(u, v, 3, 8, 3, 8)); const R = PT.rng(5);
  for (let i = 0; i < 260; i++) { const x = R() * w, y = R() * h, L = 10 + R() * 40; g.strokeStyle = `rgba(230,240,255,${0.12 + R() * 0.2})`; g.lineWidth = 1 + R() * 1.5; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L / 2, y - 2, x + L, y); g.stroke(); } }
function hullTex(g, w, h) { const n = 9, sh = h / n, R = PT.rng(8); g.fillStyle = '#6a4228'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { const y = i * sh, k = 0.85 + R() * 0.3, gr = g.createLinearGradient(0, y, 0, y + sh); gr.addColorStop(0, css(150 * k, 100 * k, 60 * k)); gr.addColorStop(0.7, css(120 * k, 78 * k, 46 * k)); gr.addColorStop(1, css(70 * k, 44 * k, 28 * k)); g.fillStyle = gr; g.fillRect(0, y, w, sh - 2);
    g.fillStyle = 'rgba(40,24,16,0.8)'; g.fillRect(0, y + sh - 3, w, 3); for (let x = 8; x < w; x += 22) { g.fillStyle = 'rgba(40,40,48,0.85)'; g.beginPath(); g.arc(x + (i % 2) * 11, y + sh - 7, 2.2, 0, TAU); g.fill(); } }
  grain(g, w, h, 'rgba(60,36,20,1)', 900, 8, 0.25); }
function sailTex(g, w, h) { const n = 6; for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? '#f0e6d0' : '#b8322e'; g.fillRect(i * w / n, 0, w / n + 1, h); } PT.modulate(g, w, h, (u, v) => 0.9 + 0.08 * Math.sin(u * 40) + 0.08 * (PT.fbm(u, v, 4, 4, 2, 3) - 0.5));
  g.strokeStyle = 'rgba(80,40,30,0.5)'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4); }
function shieldTex(g, w, h) { // 4 shield designs in quadrants of the texture (u,v offsets picked by geometry UV)
  const D = [['#e8c040', '#2a2a3a'], ['#b8322e', '#f0e6d0'], ['#2a5a8a', '#e8c040'], ['#f0e6d0', '#3a6a3a']];
  D.forEach(([a, b], i) => { const cx = (i % 2 + 0.5) * w / 2, cy = ((i >> 1) + 0.5) * h / 2, r = w / 4 - 4; g.save(); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.clip(); g.fillStyle = a; g.fillRect(cx - r, cy - r, 2 * r, 2 * r); g.fillStyle = b;
    if (i % 2) { for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, k * Math.PI / 2, k * Math.PI / 2 + Math.PI / 4); g.fill(); } } else { g.fillRect(cx - r, cy - r * 0.18, 2 * r, r * 0.36); g.fillRect(cx - r * 0.18, cy - r, r * 0.36, 2 * r); }
    g.restore(); g.lineWidth = 6; g.strokeStyle = '#5a4030'; g.beginPath(); g.arc(cx, cy, r - 3, 0, TAU); g.stroke(); g.fillStyle = '#9a9aa4'; g.beginPath(); g.arc(cx, cy, r * 0.22, 0, TAU); g.fill(); g.strokeStyle = '#2b1d4a'; g.lineWidth = 2; g.stroke(); });
  grain(g, w, h, 'rgba(60,40,20,1)', 500, 4, 0.2); }
function turfTex(g, w, h) { PT.grass(g, w, h, { base: '#6a8a40', seed: 4 }); }
function rockTex(g, w, h) { g.fillStyle = '#8a8a90'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.75 + 0.45 * PT.fbm(u, v, 4, 4, 4, 13)); const R = PT.rng(3); for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(40,40,60,0.35)'; g.lineWidth = 1.5; const x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 40, y + R() * 30); g.stroke(); } }
function timberBrick(g, w, h) { PT.brick(g, w, h, { base: '#b25a40', rows: 24, cols: 6, seed: 7 }); const b = '#4a2e1e', t = w * 0.045;
  g.fillStyle = b; for (const x of [0, w / 2]) g.fillRect(x, 0, t, h); for (const y of [0, h / 2]) g.fillRect(0, y, w, t);
  g.strokeStyle = b; g.lineWidth = t; for (const [x0, y0] of [[0, 0], [w / 2, 0], [0, h / 2], [w / 2, h / 2]]) { g.beginPath(); g.moveTo(x0 + t, y0 + t); g.lineTo(x0 + w / 2, y0 + h / 2); g.stroke(); g.beginPath(); g.moveTo(x0 + w / 2, y0 + t); g.lineTo(x0 + t, y0 + h / 2); g.stroke(); } }
function plasterTex(g, w, h) { g.fillStyle = '#e8dcc4'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, 5)); }
// cartoon horned "Viking" head (for posters, book covers, sketches, paintings)
function hornHead(g, x, y, s, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; const ink = o.ink || '#2b1d4a', lw = o.lw || 6;
  const horn = (d) => { g.beginPath(); g.moveTo(d * 40, -40); g.bezierCurveTo(d * 90, -40, d * 110, -80, d * 96, -130); g.bezierCurveTo(d * 80, -95, d * 70, -70, d * 38, -62); g.closePath(); g.fillStyle = o.horn || '#f2e6c8'; g.fill(); g.lineWidth = lw; g.strokeStyle = ink; g.stroke(); };
  horn(-1); horn(1);
  g.beginPath(); g.ellipse(0, 20, 52, 58, 0, 0, TAU); g.fillStyle = o.skin || '#f2c49a'; g.fill(); g.lineWidth = lw; g.strokeStyle = ink; g.stroke();
  g.beginPath(); g.moveTo(-54, 20); g.quadraticCurveTo(-60, 130, 0, 140); g.quadraticCurveTo(60, 130, 54, 20); g.quadraticCurveTo(0, 60, -54, 20); g.fillStyle = o.beard || '#d88a3a'; g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-58, -6); g.bezierCurveTo(-60, -80, 60, -80, 58, -6); g.closePath(); g.fillStyle = o.helm || '#9a9aa6'; g.fill(); g.stroke();
  g.fillStyle = ink; for (const d of [-1, 1]) { g.beginPath(); g.ellipse(d * 20, 18, 6, 9, 0, 0, TAU); g.fill(); }
  g.restore(); }
function posterTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f0e2c0'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, o.seed || 2));
  g.strokeStyle = o.ink || '#6a2a1a'; g.lineWidth = w * 0.025; g.strokeRect(w * 0.04, w * 0.04, w * 0.92, h - w * 0.08);
  txt(g, lines[0], w / 2, h * 0.12, w * 0.84, h * 0.09, { col: o.ink || '#6a2a1a', font: SERIF });
  hornHead(g, w / 2, h * 0.47, w / 330, { helm: o.helm, beard: o.beard });
  lines.slice(1).forEach((s, i) => txt(g, s, w / 2, h * (0.82 + i * 0.09), w * 0.84, h * 0.07, { col: o.ink || '#6a2a1a', font: SERIF })); grain(g, w, h, 'rgba(90,60,30,1)', 400, o.seed || 3, 0.25); }; }
function playbillTex(g, w, h) { g.fillStyle = '#f2e8cc'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 6)); const c = '#3a2418';
  txt(g, 'BAYREUTH', w / 2, h * 0.08, w * 0.8, h * 0.06, { col: c, font: SERIF }); txt(g, '1876', w / 2, h * 0.15, w * 0.4, h * 0.06, { col: '#a8322a', font: SERIF });
  g.fillStyle = c; g.fillRect(w * 0.1, h * 0.2, w * 0.8, 3); txt(g, 'DER RING', w / 2, h * 0.3, w * 0.86, h * 0.1, { col: c, font: SERIF }); txt(g, 'DES', w / 2, h * 0.39, w * 0.3, h * 0.05, { col: c, font: SERIF }); txt(g, 'NIBELUNGEN', w / 2, h * 0.47, w * 0.86, h * 0.09, { col: c, font: SERIF });
  g.fillRect(w * 0.1, h * 0.54, w * 0.8, 3); txt(g, 'RICHARD WAGNER', w / 2, h * 0.62, w * 0.8, h * 0.05, { col: c, font: SERIF }); const R = PT.rng(4); for (let i = 0; i < 4; i++) scrib(g, w * 0.16, h * (0.72 + i * 0.06), w * 0.68, h * 0.03, R); }
function backdropTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a4a8a'); gr.addColorStop(0.45, '#f0a070'); gr.addColorStop(0.62, '#ffd8a0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff2c8'; g.beginPath(); g.arc(w * 0.5, h * 0.6, h * 0.07, 0, TAU); g.fill();
  const ridge = (col, y0, amp, seed) => { const R = PT.rng(seed); g.fillStyle = col; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += w / 40) g.lineTo(x, y0 - amp * Math.abs(Math.sin(x / w * 7 + seed)) - R() * amp * 0.3); g.lineTo(w, h); g.fill(); };
  ridge('#7a6aa0', h * 0.6, h * 0.22, 3); ridge('#4a4a7a', h * 0.66, h * 0.28, 5);
  g.fillStyle = '#5a7aa8'; g.fillRect(0, h * 0.66, w, h * 0.34); g.strokeStyle = 'rgba(255,230,190,0.5)'; g.lineWidth = 3; const R = PT.rng(9); for (let i = 0; i < 60; i++) { const x = R() * w, y = h * (0.68 + R() * 0.3); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 20 + R() * 40, y); g.stroke(); }
  PT.modulate(g, w, h, (u, v) => 0.9 + 0.14 * PT.fbm(u, v, 6, 6, 3, 2)); g.strokeStyle = 'rgba(60,40,60,0.25)'; g.lineWidth = 2; for (let x = 0; x < w; x += w / 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } }
function shipFlatTex(g, w, h) { g.clearRect(0, 0, w, h); g.lineJoin = 'round'; const ink = '#2b1d4a';
  g.beginPath(); g.moveTo(w * 0.04, h * 0.3); g.quadraticCurveTo(w * 0.08, h * 0.85, w * 0.3, h * 0.9); g.lineTo(w * 0.7, h * 0.9); g.quadraticCurveTo(w * 0.92, h * 0.85, w * 0.96, h * 0.3); g.quadraticCurveTo(w * 0.9, h * 0.62, w * 0.8, h * 0.62); g.lineTo(w * 0.2, h * 0.62); g.quadraticCurveTo(w * 0.1, h * 0.62, w * 0.04, h * 0.3);
  g.fillStyle = '#8a5a34'; g.fill(); g.lineWidth = 8; g.strokeStyle = ink; g.stroke(); g.strokeStyle = 'rgba(40,24,16,0.6)'; g.lineWidth = 3; for (const y of [0.7, 0.78, 0.85]) { g.beginPath(); g.moveTo(w * 0.12, h * y); g.lineTo(w * 0.88, h * y); g.stroke(); }
  const C = ['#e8c040', '#b8322e', '#2a5a8a', '#f0e6d0']; for (let i = 0; i < 9; i++) { const x = w * (0.22 + i * 0.07); g.beginPath(); g.arc(x, h * 0.6, h * 0.07, 0, TAU); g.fillStyle = C[i % 4]; g.fill(); g.lineWidth = 4; g.strokeStyle = ink; g.stroke(); g.beginPath(); g.arc(x, h * 0.6, h * 0.018, 0, TAU); g.fillStyle = '#9a9aa4'; g.fill(); }
  g.beginPath(); g.ellipse(w * 0.06, h * 0.22, w * 0.035, h * 0.06, -0.4, 0, TAU); g.fillStyle = '#8a5a34'; g.fill(); g.lineWidth = 6; g.strokeStyle = ink; g.stroke(); g.fillStyle = '#e8c040'; g.beginPath(); g.arc(w * 0.05, h * 0.2, h * 0.012, 0, TAU); g.fill(); }
function waveFlatTex(g, w, h) { g.clearRect(0, 0, w, h); g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += w / 60) g.lineTo(x, h * 0.35 + h * 0.25 * Math.sin(x / w * TAU * 4)); g.lineTo(w, h); g.closePath(); g.fillStyle = '#3a5a9a'; g.fill(); g.lineWidth = 8; g.strokeStyle = '#2b1d4a'; g.stroke();
  g.strokeStyle = '#d8e8ff'; g.lineWidth = 6; g.beginPath(); for (let x = 0; x <= w; x += w / 60) g.lineTo(x, h * 0.42 + h * 0.25 * Math.sin(x / w * TAU * 4)); g.stroke(); }
function curtainTex(g, w, h) { const gr = g.createLinearGradient(0, 0, w, 0); for (let i = 0; i <= 12; i++) { const k = 0.5 + 0.5 * Math.cos(i * Math.PI); gr.addColorStop(i / 12, `rgb(${130 + 70 * k | 0},${22 + 18 * k | 0},${36 + 16 * k | 0})`); } g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8a83a'; g.fillRect(0, h - h * 0.05, w, h * 0.05); g.fillStyle = 'rgba(80,10,20,0.4)'; g.fillRect(0, h - h * 0.065, w, h * 0.015); }
function sketchTex(g, w, h) { PT.paper(g, w, h, { base: '#f2e8d0', seed: 7 }); const ink = 'rgba(60,40,50,0.85)';
  g.save(); g.globalAlpha = 0.9; hornHead(g, w * 0.32, h * 0.42, w / 900, { ink: '#4a3a40', lw: 3, skin: '#f2e8d0', beard: '#f2e8d0', helm: '#e8dcc0', horn: '#f2e8d0' }); g.restore();
  g.strokeStyle = ink; g.lineWidth = 2; g.beginPath(); g.moveTo(w * 0.6, h * 0.3); g.bezierCurveTo(w * 0.62, h * 0.12, w * 0.86, h * 0.12, w * 0.88, h * 0.3); g.closePath(); g.stroke();
  for (const d of [-1, 1]) { g.beginPath(); g.moveTo(w * 0.74 + d * w * 0.13, h * 0.24); g.bezierCurveTo(w * 0.74 + d * w * 0.22, h * 0.22, w * 0.74 + d * w * 0.24, h * 0.12, w * 0.74 + d * w * 0.2, h * 0.04); g.stroke(); }
  txt(g, 'Helm.', w * 0.74, h * 0.4, w * 0.2, h * 0.05, { col: ink, font: SERIF, italic: 1, bold: false }); const R = PT.rng(5); for (let i = 0; i < 6; i++) scrib(g, w * 0.58, h * (0.52 + i * 0.07), w * 0.34, h * 0.03, R, ink);
  txt(g, 'C.E.D. 1876', w * 0.8, h * 0.93, w * 0.3, h * 0.04, { col: ink, font: SERIF, italic: 1, bold: false }); }
function paintingTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a2a4a'); gr.addColorStop(0.6, '#a86a48'); gr.addColorStop(1, '#3a2a2a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a3036'; g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * 0.78); g.quadraticCurveTo(w * 0.4, h * 0.66, w * 0.7, h * 0.74); g.lineTo(w, h * 0.7); g.lineTo(w, h); g.fill();
  g.fillStyle = '#5a3a3a'; g.beginPath(); g.moveTo(w * 0.36, h * 0.74); g.lineTo(w * 0.42, h * 0.5); g.lineTo(w * 0.58, h * 0.5); g.lineTo(w * 0.64, h * 0.74); g.fill(); g.fillStyle = '#8a2a2a'; g.beginPath(); g.moveTo(w * 0.4, h * 0.55); g.lineTo(w * 0.2, h * 0.72); g.lineTo(w * 0.42, h * 0.7); g.fill();
  hornHead(g, w * 0.5, h * 0.36, w / 520, { ink: '#2a1a1a', lw: 4, helm: '#8a8a90', beard: '#c87a3a' }); PT.modulate(g, w, h, (u, v) => 0.85 + 0.25 * PT.fbm(u, v, 8, 8, 3, 4));
  g.strokeStyle = '#c89a3a'; g.lineWidth = w * 0.05; g.strokeRect(0, 0, w, h); g.strokeStyle = '#7a5a20'; g.lineWidth = 3; g.strokeRect(w * 0.05, w * 0.05, w * 0.9, h - w * 0.1); }
function wallpaperTex(g, w, h) { g.fillStyle = '#5a6a5a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(220,200,150,0.18)'; for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 16; x < w; x += 32) { g.beginPath(); g.ellipse(x, y, 5, 9, 0, 0, TAU); g.fill(); } PT.modulate(g, w, h, (u, v) => 0.9 + 0.1 * PT.fbm(u, v, 4, 4, 3, 9)); }
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 6, 2, 3, 7)); g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08);
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : 0.34 + i * 0.36), w * 0.86, h * (lines.length === 1 ? 0.52 : 0.3), { col: o.col || '#3a2414', font: o.font || SERIF })); }; }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.ground = vc(); if (H.MACRO) H.MACRO(m.ground, 0.2, 0.06);
  m.waterTex = T(512, 512, waterTex, [60, 60]); m.water = toon({ map: m.waterTex, color: 0x8aa8c8, emissive: 0x06121e }); if (H.MACRO) H.MACRO(m.water, 0.14, 0.01);
  m.bogWater = toon({ color: 0x2a3a3a, emissive: 0x0a1418 });
  m.hull = vc({ map: T(512, 512, hullTex), side: THREE.DoubleSide }); m.sail = vc({ map: T(512, 512, sailTex), side: THREE.DoubleSide }); m.shield = vc({ map: T(512, 512, shieldTex) });
  m.turf = vc({ map: T(256, 256, turfTex) }); m.rock = vc({ map: T(256, 256, rockTex) }); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.plank = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 8, seed: 51 })) });
  m.leaf = vc(); m.iron = vc({ emissive: 0x0a0a10 }); m.bronze = toon({ color: 0xc8903a, emissive: 0x2a1404 }); m.bronzeV = vc({ emissive: 0x2a1404 }); m.horn = vc({ emissive: 0x141008 });
  m.canvas = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#efe6d0' })), side: THREE.DoubleSide }); m.cloth = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#f2ece0', folds: 3 })) });
  m.brickT = vc({ map: T(512, 512, timberBrick) }); m.plaster = vc({ map: T(256, 256, plasterTex) }); m.slate = vc({ map: T(256, 256, (g, w, h) => PT.shingles(g, w, h, { base: '#5a5a6a', seed: 3 })) });
  m.playbill = em(T(320, 480, playbillTex), 0x201810);
  m.posters = [posterTex(['THE VIKINGS!', 'A PICTURE BOOK'], { bg: '#f2e2b8', seed: 2 }), posterTex(['NORSE ALE', 'BREWED BOLD'], { bg: '#e8d0a0', ink: '#2a4a6a', helm: '#c8c8d0', seed: 5 }), posterTex(['GRAND OPERA', 'TONIGHT!'], { bg: '#f2d8c8', ink: '#8a1a2a', seed: 7 }), posterTex(['SEA KING', 'TOBACCO'], { bg: '#d8e0c8', ink: '#3a3a1a', beard: '#8a5a2a', seed: 9 })]
    .map((p) => em(T(320, 480, p), 0x241c14));
  m.backdrop = toon({ map: T(1024, 512, backdropTex), emissive: 0x3a2a30, emissiveMap: null }); m.backdrop.emissiveMap = m.backdrop.map;
  m.shipFlat = toon({ map: T(1024, 320, shipFlatTex), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }); m.waveFlat = toon({ map: T(1024, 160, waveFlatTex), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, color: 0xe0e8ff });
  m.curtain = vc({ map: T(512, 512, curtainTex), side: THREE.DoubleSide }); m.velvet = vc({ map: T(256, 256, curtainTex) }); m.gold = vc({ emissive: 0x3a2408 });
  m.sketch = em(T(512, 360, sketchTex), 0x302820); m.painting = em(T(400, 520, paintingTex), 0x201410); m.wallpaper = vc({ map: T(256, 256, wallpaperTex) }); m.floor = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#7a5034', n: 10, seed: 61 })) });
  m.peat = vc(); m.reed = vc(); m.soil = vc(); m.string = toon({ color: 0xf2e8c0 }); m.tag = em(T(256, 96, signTex(['FIND No. 1'], { bg: '#f8f4e8' })), 0x202020);
  m.digSign = em(T(512, 200, signTex(['EXCAVATION', 'KEEP OUT'], { bg: '#f2e8cc', col: '#8a2a1a', rim: '#8a2a1a' })), 0x202020); m.farmSign = em(T(512, 160, signTex(['GJERMUNDBU'], { bg: '#f4ecd8' })), 0x202020);
  m.festSign = em(T(1024, 160, signTex(['FESTSPIELHAUS'], { bg: '#e8dcc0', col: '#4a2a1a' })), 0x2a2010); m.museum = em(T(512, 160, signTex(['NATIONAL MUSEUM'], { bg: '#24304a', col: '#f2e8cc', rim: '#c8a040' })), 0x101830);
  m.bogSign = em(T(512, 160, signTex(['DENMARK'], { bg: '#e8dcc0' })), 0x202020);
  m.winWarm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc870).multiplyScalar(1.4), fog: true }); m.winDay = toon({ color: 0x5a6a8a, emissive: 0x101828 });
  m.foot = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe0a0).multiplyScalar(2.0), fog: false }); m.seatDark = toon({ color: 0x3a2030 });
  m.mist = new THREE.MeshBasicMaterial({ map: T(256, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,0.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), color: 0xe8eef8, transparent: true, opacity: 0.35, depthWrite: false, fog: false, side: THREE.DoubleSide });
  m.ember = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff8a30).multiplyScalar(2.2), fog: false });
  return m; }

// ---------------------------------------------------------------- shared pieces
function pine(K, x, y, z, s, R) { K.beam(M.bark, [x, y - 0.3, z], [x, y + 1.2 * s, z], 0.16 * s, 0x5a3a26, true, 6);
  for (let i = 0; i < 4; i++) { const yy = y + (0.9 + i * 1.15) * s, r = (1.6 - i * 0.33) * s; K.put(M.leaf, new THREE.ConeGeometry(1, 1, 9), x, yy + 0.8 * s, z, 0, R() * 6, 0, r, 1.7 * s, r, [0x2f5a3a, 0x355f3a, 0x2a5040][i % 3]); } }
function birch(K, x, y, z, s, R) { K.beam(M.bark, [x, y - 0.2, z], [x + (R() - 0.5) * 0.5, y + 4.2 * s, z], 0.12 * s, 0xe8e4dc, true, 6);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + R(), r = (0.8 + R() * 0.6) * s; K.put(M.leaf, lumpGeo(3 + i, 1, 0.25), x + Math.cos(a) * 0.8 * s, y + (3.4 + R() * 1.4) * s, z + Math.sin(a) * 0.8 * s, 0, R() * 6, 0, r, r * 0.9, r, [0x8aa04a, 0x9ab050, 0x7a9a44][i % 3]); } }
function rock(K, x, y, z, s, seed, c = 0xb8b8c0) { K.put(M.rock, lumpGeo(seed, 2, 0.35), x, y, z, 0, seed, 0, s, s * 0.7, s * 0.9, c); }
function terrain(root, W, D, NX, NZ, zc, fn, colFn, a = 1) { const g = new THREE.PlaneGeometry(W, D, NX, NZ); g.rotateX(-Math.PI / 2); const p = g.attributes.position, c = new Float32Array(p.count * 3), mp = (u) => a * u + (1 - a) * u * u * u;
  for (let i = 0; i < p.count; i++) { const x = W / 2 * mp(p.getX(i) / (W / 2)), z = D / 2 * mp(p.getZ(i) / (D / 2)) + zc, y = fn(x, z); p.setXYZ(i, x, y, z); c.set(colFn(x, y, z), i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.computeVertexNormals(); const t = new THREE.Mesh(g, M.ground); t.receiveShadow = true; root.add(t); return t; }
// iron cap (Gjermundbu style), local: base ring at y=0, radius ~0.13 (s=1 → real size). opts: guard, horns, rust
export function ironHelmet(opts = {}) { const G = new THREE.Group(), r = 0.13, K = new Kit(), ic = opts.col || 0x8a8890;
  K.put(M.iron, new THREE.SphereGeometry(r, 28, 14, 0, TAU, 0, Math.PI / 2), 0, 0, 0, 0, 0, 0, 1, 1.12, 1.06, ic);
  K.put(M.iron, new THREE.TorusGeometry(r * 1.01, 0.008, 6, 32), 0, 0.006, 0, Math.PI / 2, 0, 0, 1, 1, 1.06, ic - 0x101010);
  for (const ry of [0, Math.PI / 2]) K.put(M.iron, new THREE.TorusGeometry(r * 1.02, 0.007, 6, 32, Math.PI), 0, 0, 0, 0, ry, 0, ry ? 1.06 : 1, 1.12, 1, ic - 0x101010);
  K.put(M.iron, sph(0.012, 10, 8), 0, r * 1.14, 0, 0, 0, 0, 1, 1.4, 1, ic); K.put(M.iron, cyl(0.004, 0.009, 0.03, 8), 0, r * 1.16 + 0.012, 0, 0, 0, 0, 1, 1, 1, ic);
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; K.put(M.iron, sph(0.0045, 6, 5), Math.cos(a) * r * 1.02, 0.012, Math.sin(a) * r * 1.08, 0, 0, 0, 1, 1, 1, 0xb0b0b8); }
  if (opts.guard) { for (const s of [-1, 1]) K.put(M.iron, new THREE.TorusGeometry(0.03, 0.006, 6, 20), s * 0.04, -0.045, r * 1.02, 0, 0, 0, 1, 0.9, 1, ic); K.put(M.iron, new THREE.BoxGeometry(0.012, 0.075, 0.008), 0, -0.035, r * 1.04, 0, 0, 0, 1, 1, 1, ic); K.put(M.iron, new THREE.BoxGeometry(0.15, 0.012, 0.01), 0, -0.006, r * 1.01, 0.2, 0, 0, 1, 1, 1, ic); }
  K.build(G); let horns = null;
  if (opts.horns) { horns = new THREE.Group(); for (const s of [-1, 1]) { const hg = hornGeo(0.03, 0.3, s, 'opera'); const hm = new THREE.Mesh(hg, M.horn); hm.position.set(s * r * 0.86, r * 0.45, 0); hm.castShadow = true; hm.userData.s = s; const piv = new THREE.Group(); piv.position.copy(hm.position); hm.position.set(0, 0, 0); piv.add(hm); horns.add(piv); } G.add(horns); }
  G.userData.horns = horns; return G; }
// tapered horn along a curve; kind 'opera' (outward + up, ivory) or 'vekso' (S-curve out, up and forward, bronze)
function hornGeo(r0, L, s, kind) { const P = []; for (let i = 0; i <= 10; i++) { const t = i / 10; P.push(kind === 'vekso' ? new THREE.Vector3(s * 0.5 * Math.sin(t * Math.PI * 0.72) * L, (0.25 * t + 0.85 * t * t) * L, (0.5 * t * t - 0.08 * t) * L) : new THREE.Vector3(s * (0.65 * t + 0.25 * t * t) * L, (0.2 * t + 0.9 * t * t) * L, 0.05 * t * L)); }
  const cur = new THREE.CatmullRomCurve3(P), TS = 24, RS = 10, g = new THREE.TubeGeometry(cur, TS, r0, RS, false), p = g.attributes.position, c = new Float32Array(p.count * 3), v = new THREE.Vector3();
  for (let i = 0; i <= TS; i++) { const t = i / TS, ctr = cur.getPointAt(t), k = kind === 'vekso' ? 1 - 0.45 * t : 1 - 0.92 * t; for (let j = 0; j <= RS; j++) { const idx = i * (RS + 1) + j; v.fromBufferAttribute(p, idx).sub(ctr).multiplyScalar(k).add(ctr); p.setXYZ(idx, v.x, v.y, v.z);
    const col = kind === 'vekso' ? [0.85, 0.6, 0.28] : [0.95 - 0.45 * t * t, 0.9 - 0.5 * t * t, 0.78 - 0.45 * t * t]; c.set(col, idx * 3); } }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.computeVertexNormals(); return g; }
// Veksø-style bronze helmet: cap, crest, bird's beak + eyes, two big S-horns with knobbed tips. local base y=0, r ~0.12
function veksoHelmet() { const G = new THREE.Group(), r = 0.12, K = new Kit(), bc = 0xd8a048;
  K.put(M.bronzeV, new THREE.SphereGeometry(r, 28, 14, 0, TAU, 0, Math.PI / 2), 0, 0, 0, 0, 0, 0, 1, 1.0, 1.1, bc);
  K.put(M.bronzeV, new THREE.TorusGeometry(r * 1.0, 0.009, 6, 32), 0, 0.005, 0, Math.PI / 2, 0, 0, 1, 1.1, 1, 0xb8803a);
  K.put(M.bronzeV, new THREE.TorusGeometry(r * 1.03, 0.012, 6, 32, Math.PI), 0, 0, 0, 0, Math.PI / 2, 0, 1.1, 1, 1, 0xc08a3a);
  K.put(M.bronzeV, new THREE.ConeGeometry(0.03, 0.09, 10), 0, r * 0.45, r * 1.12, Math.PI / 2 + 0.3, 0, 0, 1, 1, 0.6, 0xc89040);
  for (const s of [-1, 1]) { K.put(M.bronzeV, sph(0.022, 12, 10), s * 0.05, r * 0.6, r * 0.93, 0, 0, 0, 1, 1, 0.6, 0xe8b860); K.put(M.iron, sph(0.009, 8, 6), s * 0.05, r * 0.6, r * 0.93 + 0.012, 0, 0, 0, 1, 1, 1, 0x2a2018); }
  for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.18; K.put(M.bronzeV, sph(0.008, 6, 5), Math.sin(a) * 0.004, r * 1.0 + 0.01, Math.cos(a) * r * 0.9, 0, 0, 0, 1, 1, 1, 0xf0c070); }
  K.build(G);
  for (const s of [-1, 1]) { const L = 0.3, hm = new THREE.Mesh(hornGeo(0.022, L, s, 'vekso'), M.bronzeV); hm.position.set(s * r * 0.82, r * 0.4, -0.02); hm.rotation.z = -s * 0.1; hm.castShadow = true; G.add(hm); const tip = new THREE.Mesh(sph(0.02, 12, 10), M.bronze); const e = new THREE.Vector3(s * 0.5 * Math.sin(Math.PI * 0.72) * L, 1.1 * L, 0.42 * L).applyEuler(hm.rotation); tip.position.copy(hm.position).add(e); tip.castShadow = true; G.add(tip); }
  return G; }

// ================================================================= FJORD
function longship(root, R) { const G = new THREE.Group(); root.add(G); const K = new Kit(), L = 17, B = 4.0, NS = 40, NR = 12;
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= NS; i++) { const t = i / NS, x = (t - 0.5) * L, e = Math.abs(2 * t - 1), wdt = B / 2 * Math.pow(Math.max(0, 1 - e ** 2.2), 0.55), sheer = 1.2 + 1.9 * e ** 3.2, keel = -0.7 + 0.5 * e ** 2;
    for (let j = 0; j <= NR; j++) { const u = j / NR, a = (u - 0.5) * Math.PI, z = Math.sin(a) * wdt, yb = keel + (sheer - keel) * (1 - Math.cos(a) ** 1.4); pos.push(x, yb, z); uv.push(t * 6, (1 - Math.abs(2 * u - 1)) * 1.0); } }
  for (let i = 0; i < NS; i++) for (let j = 0; j < NR; j++) { const a = i * (NR + 1) + j, b = a + NR + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); hg.setIndex(idx); hg.computeVertexNormals();
  hg.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(pos.length).fill(1), 3)); const hull = new THREE.Mesh(hg, M.hull); hull.castShadow = hull.receiveShadow = true; G.add(hull);
  // deck, thwarts, mast, yard, sail, shields, oars, prow + stern posts with dragon head
  K.box(M.plank, -L * 0.4, L * 0.4, 0.15, 0.25, -B * 0.42, B * 0.42, 0xa07048, 0.02); for (let i = -5; i <= 5; i++) K.box(M.plank, i * 1.3 - 0.12, i * 1.3 + 0.12, 0.5, 0.6, -B * 0.44, B * 0.44, 0x8a6040, 0.02);
  K.beam(M.bark, [0, 0.2, 0], [0, 9.5, 0], 0.18, 0x7a5232, true, 8); K.beam(M.bark, [0, 8.9, -3.6], [0, 8.9, 3.6], 0.1, 0x7a5232, true, 6);
  for (const s of [-1, 1]) { K.beam(M.paint, [0, 9.4, 0], [s * 7.5, 1.6, 0], 0.025, 0xc8b890, true, 4); K.beam(M.paint, [0, 9.0, s * 3.4], [0, 1.4, s * 1.9], 0.02, 0xc8b890, true, 4); }
  const sg = new THREE.PlaneGeometry(7.0, 6.2, 12, 8), sp = sg.attributes.position; for (let i = 0; i < sp.count; i++) { const u = sp.getX(i) / 3.5, v = (sp.getY(i) + 3.1) / 6.2; sp.setZ(i, 0.9 * (1 - u * u) * Math.sin(Math.PI * Math.min(1, v * 1.05))); } sg.computeVertexNormals();
  const sail = mesh(G, sg, M.sail, 0.25, 5.8, 0, 0, Math.PI / 2, 0, true); sail.userData.base = sg.attributes.position.array.slice();
  for (let i = 0; i < 13; i++) { const t = 0.2 + i * 0.6 / 12, x = (t - 0.5) * L, e = Math.abs(2 * t - 1), wdt = B / 2 * Math.pow(Math.max(0, 1 - e ** 2.2), 0.55), sheer = 1.2 + 1.9 * e ** 3.2;
    for (const s of [-1, 1]) { const sh = new THREE.CircleGeometry(0.42, 20), uvs = sh.attributes.uv, q = (i + (s > 0 ? 1 : 0)) % 4; for (let k = 0; k < uvs.count; k++) uvs.setXY(k, (uvs.getX(k) + q % 2) / 2, (uvs.getY(k) + (q >> 1)) / 2); K.put(M.shield, sh, x, sheer - 0.25, s * (wdt + 0.06), 0, s > 0 ? 0 : Math.PI, 0, 1, 1, 1, 0xffffff); }
    if (i % 2 === 0) for (const s of [-1, 1]) K.beam(M.plank, [x + 0.3, sheer - 0.55, s * wdt * 0.9], [x + 0.9, -0.2, s * (wdt + 3.2)], 0.06, 0xb08a58, true, 5); }
  const post = (s) => { const P = []; for (let i = 0; i <= 12; i++) { const t = i / 12; P.push(new THREE.Vector3(s * (L / 2 - 0.15 + 0.9 * Math.sin(t * 1.3)), 2.9 + 2.6 * t - 0.5 * t * t, 0)); } const cv = new THREE.CatmullRomCurve3(P); const tg = new THREE.TubeGeometry(cv, 20, 0.16, 8, false); tg.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(tg.attributes.position.count * 3).fill(1), 3)); const m = new THREE.Mesh(tg, M.hull); m.castShadow = true; G.add(m); return P[12]; };
  const ph = post(-1); post(1);
  // dragon head on the prow (-x)
  K.at(ph.x - 0.1, ph.y + 0.1, 0, 0, () => { K.put(M.plank, lumpGeo(7, 2, 0.12), -0.35, 0.1, 0, 0, 0, 0.3, 0.75, 0.42, 0.36, 0x9a6a40); K.put(M.plank, lumpGeo(9, 2, 0.12), -0.85, -0.02, 0, 0, 0, 0.15, 0.55, 0.26, 0.28, 0x9a6a40);
    for (const s of [-1, 1]) { K.put(M.paint, sph(0.08, 10, 8), -0.55, 0.32, s * 0.27, 0, 0, 0, 1, 1, 1, 0xf0d050); K.put(M.coal, sph(0.04, 8, 6), -0.59, 0.33, s * 0.33, 0, 0, 0, 1, 1, 1, 0x101010); K.put(M.plank, new THREE.ConeGeometry(0.09, 0.5, 6), 0.0, 0.62, s * 0.18, 0, 0, -0.5, 1, 1, 1, 0x7a5030); }
    K.put(M.paint, new THREE.ConeGeometry(0.05, 0.16, 5), -1.25, -0.1, 0.12, 0, 0, Math.PI / 2, 1, 1, 1, 0xf2ecdc); K.put(M.paint, new THREE.ConeGeometry(0.05, 0.16, 5), -1.25, -0.1, -0.12, 0, 0, Math.PI / 2, 1, 1, 1, 0xf2ecdc); });
  K.build(G); return { G, sail }; }
function longhouse(K, x, y, z, ry, w, d) { K.at(x, y, z, ry, () => { K.box(M.plank, -w / 2, w / 2, -0.5, 1.8, -d / 2, d / 2, 0x8a6040, 0.04);
  for (const s of [-1, 1]) K.put(M.turf, new THREE.BoxGeometry(w + 0.6, 0.45, d / 2 / Math.cos(0.6) + 0.5), 0, 1.8 + d / 4 * Math.tan(0.6), s * d / 4, s * 0.6, 0, 0, 1, 1, 1, 0xffffff);
  const gable = shapeGeo([[-d / 2, 0], [d / 2, 0], [0, -(d / 2) * Math.tan(0.6)]], 0.2, 0); for (const xx of [w / 2, -w / 2 - 0.2]) K.put(M.plank, gable, xx, 1.8, 0, -Math.PI / 2, Math.PI / 2, 0, 1, 1, 1, 0x7a5030);
  K.box(M.plank, w / 2 - 0.05, w / 2 + 0.06, -0.4, 1.5, -0.45, 0.45, 0x4a2a18, 0.02); for (const s of [-1, 1]) K.beam(M.plank, [w / 2 + 0.25, 1.8 + d / 2 * Math.tan(0.6) - 0.2, 0], [w / 2 + 0.55, 1.8 + d / 2 * Math.tan(0.6) + 0.6, s * 0.4], 0.1, 0x7a5030, true, 5); }); }
function buildFjord(root) { const R = PT.rng(793), K = new Kit();
  const water = mesh(root, plane(1400, 1400), M.water, 0, 0, -400, -Math.PI / 2, 0, 0, false); water.receiveShadow = true;
  terrain(root, 900, 900, 220, 200, 0, ff, (x, y, z) => { const n = PT.fbm(x * 0.02 + 3, z * 0.02 + 1, 2, 2, 3, 4), n2 = PT.fbm(x * 0.35 + 7, z * 0.35 + 3, 2, 2, 3, 9); if (y < 0.0 && z > -14) return [0.2, 0.24, 0.26];
    if (z > -14 && y < 1.7) { const wet = 1 - sm(0.0, 0.35, y), k = 0.78 + 0.34 * n2; let c = [0.5 * k, 0.46 * k, 0.42 * k]; if (n2 > 0.62) c = [0.36, 0.42, 0.26]; return c.map((v) => v * (1 - 0.45 * wet)); } const snow = sm(78, 105, y + 12 * n), green = Math.min(1, (1 - sm(10, 45, y)) * 0.85 + 0.35 * sm(0.4, 0.7, n));
    let c = [0.27 + 0.08 * n, 0.27 + 0.06 * n, 0.31 + 0.05 * n]; c = c.map((v, k) => v * (1 - green) + [0.2, 0.32, 0.18][k] * green); return c.map((v) => v * (1 - snow) + 0.95 * snow); }, 0.08);
  const ship = longship(root, R); ship.G.position.set(0.5, -0.1, -9.0); ship.G.rotation.y = 0.12;
  longhouse(K, -15, ff(-15, 6), 6, 0.35, 8, 5); longhouse(K, -24, ff(-24, 2), 2, 0.6, 7, 4.5);
  // fish rack, boat on the beach, rocks, driftwood, pines
  K.at(10, ff(10, 7), 7, -0.4, () => { for (const x of [-1.2, 1.2]) for (const z of [-0.5, 0.5]) K.beam(M.bark, [x, 0, z], [x * 0.9, 1.9, 0], 0.06, 0x6a4a30, true, 5); K.beam(M.bark, [-1.3, 1.8, 0], [1.3, 1.8, 0], 0.05, 0x6a4a30, true, 5);
    for (let i = 0; i < 8; i++) K.put(M.paint, lumpGeo(i + 3, 1, 0.1), -1.0 + i * 0.28, 1.45, 0, 0, 0, 0, 0.06, 0.3, 0.02, 0xc8b8a0); });
  for (let i = 0; i < 70; i++) { const x = (R() - 0.5) * 80, z = 3 + R() * 22; if (Math.abs(x) < 6 && z < 13) continue; rock(K, x, ff(x, z), z, 0.15 + R() * 0.6, i + 3, [0xb8b8c0, 0xa8a4a0, 0xc8c0b8][i % 3]); }
  for (let i = 0; i < 160; i++) { const x = (R() - 0.5) * 16, z = 2.2 + R() * 12; if (Math.abs(x - 0.4) < 1.6 && z > 5.6 && z < 8.2) continue; rock(K, x, ff(x, z) - 0.02, z, 0.04 + R() * 0.1, i + 90, [0x9a9aa4, 0x8a8480, 0xb0a89c, 0x7a7a84][i % 4]); }
  for (const [x, z, s] of [[7, 3.4, 1.1], [-6.5, 3.2, 0.9], [13, 4, 1.4], [-11, 2.6, 1.3], [4.5, 11, 0.7]]) rock(K, x, ff(x, z) - 0.1, z, s, Math.round(x * 3 + 50));
  for (let i = 0; i < 6; i++) { const x = -4 + R() * 14, z = 3 + R() * 6; K.beam(M.bark, [x, ff(x, z) + 0.06, z], [x + 1.2 + R(), ff(x, z) + 0.08, z + (R() - 0.5)], 0.07, 0xb0a090, true, 5); }
  for (let i = 0; i < 80; i++) { const sd = i % 2 ? 1 : -1, x = sd * (26 + R() * 40), z = -20 - R() * 200, y = ff(x, z); if (y > 40) continue; pine(K, x, y, z, 1.2 + R() * 1.4, R); }
  for (const [x, z, s] of [[-20, 12, 1.6], [18, 12, 1.5], [-28, 8, 1.8], [24, 6, 1.7], [16, 16, 1.3]]) pine(K, x, ff(x, z), z, s, R);
  // second, distant ship
  const far = longship(root, R); far.G.position.set(-26, -0.1, -70); far.G.rotation.y = -0.4; far.G.scale.setScalar(0.9);
  K.build(root, 60);
  const mists = []; for (let i = 0; i < 10; i++) { const m = nond(mesh(root, plane(40, 6), M.mist.clone(), (R() - 0.5) * 60, 1.5 + R() * 3, -20 - R() * 120, 0, 0, 0, false)); m.renderOrder = 4; m.userData.x = m.position.x; mists.push(m); }
  const dust = motes(root, 40, [-6, 6, 0.3, 3, 2, 10], 31, 0.02);
  return { ship, far, water, mists, dust };
}

// ================================================================= DIG
function buildDig(root) { const R = PT.rng(1943), K = new Kit();
  terrain(root, 420, 420, 210, 190, 0, df, (x, y, z) => { const n = PT.fbm(x * 0.02 + 5, z * 0.02 + 2, 2, 2, 3, 6); const inT = (x > -6.8 && x < 2.8 && z > -3.8 && z < 0.8), inC = (x > 7.6 && x < 10.4 && z > -5.2 && z < 0.5 && y < 1.2);
    if (inT || inC) return [0.34 + 0.05 * n, 0.24 + 0.04 * n, 0.16]; const path = 1 - sm(0.6, 1.4, Math.abs(x + 9 - 0.2 * z)) * 1; let c = [0.3 + 0.08 * n, 0.46 + 0.06 * n, 0.2]; if (z > -12) c = c.map((v, k) => v * (1 - path * 0.6) + [0.5, 0.42, 0.3][k] * path * 0.6); return c; }, 0.1);
  // trench edges (sod lips), ship rivet outline + faint strakes, sword
  K.at(-2, df(-2, -1.5), -1.5, 0, () => { for (let i = 0; i < 60; i++) { const t = i / 59, x = (t - 0.5) * 8.2, wdt = 1.3 * Math.pow(Math.max(0, 1 - Math.abs(2 * t - 1) ** 2), 0.6); for (const s of [-1, 1]) K.put(M.iron, sph(0.035, 6, 5), x, 0.02, s * wdt, 0, 0, 0, 1, 0.6, 1, 0x5a4a44); }
    for (let k = 1; k < 4; k++) for (const s of [-1, 1]) for (let i = 0; i < 18; i++) { const t = 0.08 + i / 21, x = (t - 0.5) * 8.2, w2 = 1.3 * Math.pow(Math.max(0, 1 - Math.abs(2 * t - 1) ** 2), 0.6) * (1 - k * 0.22); K.put(M.soil, new THREE.BoxGeometry(0.42, 0.02, 0.06), x, 0.01, s * w2, 0, 0, 0, 1, 1, 1, 0x3a2a1e); }
    K.at(1.4, 0.03, 0.2, 0.5, () => { K.put(M.iron, new THREE.BoxGeometry(0.9, 0.025, 0.06), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0x6a6064); K.put(M.iron, new THREE.BoxGeometry(0.05, 0.03, 0.22), 0.47, 0, 0, 0, 0, 0, 1, 1, 1, 0x5a4a3a); K.put(M.bark, cyl(0.02, 0.02, 0.14, 6), 0.56, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x5a3a24); K.put(M.iron, sph(0.03, 8, 6), 0.65, 0, 0, 0, 0, 0, 1, 1, 1, 0x6a6064); });
    for (const [x, z] of [[-2.5, 0.4], [0.2, -0.5], [2.6, 0.5]]) K.put(M.soil, lumpGeo(Math.round(x * 7 + 20), 1, 0.3), x, 0.02, z, 0, 0, 0, 0.18, 0.06, 0.14, 0xc8bca8); });
  for (const z of [-3.75, 0.75]) for (let i = 0; i < 5; i++) K.box(M.plank, -6.6 + i * 1.8, -5.0 + i * 1.8, -0.62, -0.05, z - 0.04, z + 0.04, 0x9a7048, 0.01);
  for (const [x, z] of [[-4.6, -1.9], [0.4, -0.2]]) K.box(M.paint, x - 0.3, x + 0.3, df(x, z) + 0.0, df(x, z) + 0.05, z - 0.2, z + 0.2, 0x3a6aa8, 0.02);
  // grid stakes + strings around the trench, spoil heap, wheelbarrow, buckets, sieve, sign
  const stakes = []; for (let i = 0; i <= 5; i++) for (const z of [-4.1, 1.1]) stakes.push([-7.1 + i * 2.0, z]); for (const z of [-2.4, -0.6]) for (const x of [-7.1, 2.9]) stakes.push([x, z]);
  for (const [x, z] of stakes) K.beam(M.plank, [x, df(x, z) - 0.1, z], [x, df(x, z) + 0.45, z], 0.04, 0xd8c8a0, false);
  for (const z of [-4.1, 1.1]) K.beam(M.string, [-7.1, df(-7, z) + 0.4, z], [2.9, df(3, z) + 0.4, z], 0.008, 0xf2e8c0, true, 3); for (const x of [-7.1, 2.9]) K.beam(M.string, [x, df(x, -4) + 0.4, -4.1], [x, df(x, 1) + 0.4, 1.1], 0.008, 0xf2e8c0, true, 3);
  K.put(M.soil, lumpGeo(4, 2, 0.2), -10, df(-10, -2), -2, 0, 0, 0, 1.6, 0.7, 1.2, 0x8a6a48); K.put(M.soil, lumpGeo(6, 2, 0.2), 4.6, df(4.6, -6.5), -6.5, 0, 0, 0, 1.1, 0.5, 0.9, 0x8a6a48);
  K.at(-8.6, df(-8.6, 2.2), 2.2, 0.6, () => { K.box(M.iron, -0.5, 0.5, 0.35, 0.7, -0.35, 0.35, 0x3a6a4a, 0.04); K.put(M.coal, new THREE.TorusGeometry(0.22, 0.06, 6, 14), 0.75, 0.22, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0x2a2a2a); for (const s of [-1, 1]) K.beam(M.bark, [-0.5, 0.6, s * 0.25], [-1.3, 0.55, s * 0.3], 0.03, 0x7a5a3a, true, 5); });
  for (const [x, z, c] of [[3.6, 1.6, 0xd8a040], [3.9, 2.0, 0x3a6aa8], [-7.6, -4.6, 0xd8a040]]) K.put(M.paint, cyl(0.16, 0.13, 0.3, 12), x, df(x, z) + 0.15, z, 0, 0, 0, 1, 1, 1, c);
  K.at(-5.6, df(-5.6, 2.6), 2.6, 0.2, () => { K.put(M.plank, cyl(0.4, 0.4, 0.12, 16, true), 0, 0.5, 0, 0, 0, 0, 1, 1, 1, 0x9a7048); for (const [x, z] of [[-0.3, -0.3], [0.3, -0.3], [0, 0.35]]) K.beam(M.plank, [x, 0, z], [x * 0.8, 0.5, z * 0.8], 0.03, 0x7a5a3a, true, 5); });
  K.at(-4, df(-4, 4.5), 4.5, -0.2, () => { K.beam(M.plank, [0, 0, 0], [0, 1.2, 0], 0.06, 0x7a5a3a); }); const sign = mesh(root, plane(1.2, 0.47), M.digSign, -4, df(-4, 4.5) + 1.25, 4.56, 0, -0.2, 0, false);
  // finds tent with trestle table + tray (helmet sits on the tray, 3D)
  K.at(-13, df(-13, -1), -1, 0.5, () => { for (const [x, z] of [[-1.5, -1.2], [1.5, -1.2], [-1.5, 1.2], [1.5, 1.2]]) K.beam(M.bark, [x, 0, z], [x, 2.1, z], 0.05, 0x8a8a90, true, 6);
    for (const s of [-1, 1]) K.put(M.canvas, new THREE.BoxGeometry(3.4, 0.03, 1.7), 0, 2.4, s * 0.72, s * 0.4, 0, 0, 1, 1, 1, 0xf2ead8);
    K.box(M.plank, -1.1, 1.1, 0.8, 0.86, -0.5, 0.5, 0xc8a070, 0.02); for (const x of [-0.9, 0.9]) for (const z of [-0.4, 0.4]) K.beam(M.bark, [x, 0, z], [x, 0.8, z], 0.03, 0x6a4a30, true, 5);
    K.box(M.plank, -0.45, 0.45, 0.86, 0.92, -0.3, 0.3, 0x8a6040, 0.01); K.box(M.cloth, -0.4, 0.4, 0.92, 0.93, -0.26, 0.26, 0xffffff, 0.005);
    K.put(M.plank, cyl(0.025, 0.05, 0.16, 10), 0, 1.0, 0, 0, 0, 0, 1, 1, 1, 0x6a4028); K.put(M.cloth, sph(0.07, 12, 8), 0, 1.09, 0, 0, 0, 0, 1, 0.6, 1, 0xd8ccb0); K.put(M.paint, cyl(0.05, 0.05, 0.1, 10), 0.7, 0.91, 0.2, 0, 0, 0, 1, 1, 1, 0xd8d0c0); K.box(M.paint, 0.5, 0.9, 0.86, 0.88, -0.35, -0.05, 0xf2ecdc, 0.003); });
  // the mound (helmet in the cut) + red farmhouse + barn + fences (Norway, 1943)
  const farm = (x, z, w, d, ht, ry, col) => K.at(x, df(x, z), z, ry, () => { K.box(M.plank, -w / 2, w / 2, -0.5, ht, -d / 2, d / 2, col, 0.05);
    for (const s of [-1, 1]) K.put(M.slate, new THREE.BoxGeometry(w + 0.6, 0.14, d / 2 / Math.cos(0.6) + 0.5), 0, ht + d / 4 * Math.tan(0.6), s * d / 4, s * 0.6, 0, 0, 1, 1, 1, 0xd8d0d0);
    const gab = shapeGeo([[-w / 2, 0], [w / 2, 0], [0, -(d / 2) * Math.tan(0.6)]], 0.15, 0); K.put(M.plank, gab, 0, ht, d / 2 - 0.1, -Math.PI / 2, 0, 0, 1, 1, 1, col);
    for (const xx of [-w / 4, w / 4]) { K.box(M.winDay, xx - 0.4, xx + 0.4, ht * 0.4, ht * 0.75, d / 2, d / 2 + 0.04, 0xffffff, 0.01); K.box(M.paint, xx - 0.48, xx + 0.48, ht * 0.38, ht * 0.42, d / 2, d / 2 + 0.08, 0xf4f0e8, 0.01); K.box(M.paint, xx - 0.48, xx + 0.48, ht * 0.75, ht * 0.79, d / 2, d / 2 + 0.08, 0xf4f0e8, 0.01); } });
  farm(15, -16, 8, 6, 3.2, -0.3, 0xa83a2e); farm(25, -12, 10, 7, 4.2, -0.5, 0x9a3428); farm(4, -22, 7, 5.5, 3.0, 0.1, 0xe8dcc0);
  for (let i = 0; i < 16; i++) { const x = -22 + i * 2.6, z = -10.5 + 0.3 * Math.sin(i); for (const h of [0.4, 0.8]) K.beam(M.bark, [x, df(x, z) + h, z], [x + 2.6, df(x + 2.6, z) + h, z], 0.04, 0x8a7a68, true, 4); K.beam(M.bark, [x, df(x, z) - 0.1, z], [x, df(x, z) + 1.0, z], 0.05, 0x7a6a58, true, 5); }
  const farmSign = mesh(root, plane(1.5, 0.47), M.farmSign, 5.2, df(5.2, -1.5) + 1.25, -1.5, 0, -0.3, 0, false); K.beam(M.plank, [5.2, df(5.2, -1.6), -1.6], [5.2, df(5.2, -1.6) + 1.0, -1.6], 0.07, 0x7a5a3a);
  for (let i = 0; i < 50; i++) { const x = (R() - 0.5) * 200, z = -28 - R() * 70; pine(K, x, df(x, z), z, 1.1 + R() * 1.3, R); }
  for (const [x, z] of [[-18, -6], [-21, 3], [20, 2], [13, 8], [-16, 9]]) birch(K, x, df(x, z), z, 1.1, R);
  for (let i = 0; i < 140; i++) { const x = (R() - 0.5) * 50, z = 8 - R() * 24; if ((x > -8 && x < 4 && z > -5 && z < 2) || (x > 4 && x < 14 && z > -8 && z < 3)) continue; K.put(M.leaf, lumpGeo(2 + (i % 5), 1, 0.3), x, df(x, z) + 0.04, z, 0, R() * 6, 0, 0.22 + R() * 0.25, 0.16, 0.22 + R() * 0.25, [0x5a8a3a, 0x6a9a44, 0x7a9a48][i % 3]); }
  K.build(root, 40);
  // helmets: one on the tray (tent), one half-buried in the mound cut
  const tray = ironHelmet({ guard: true }); tray.scale.setScalar(1.25); root.add(tray); { const a = 0.5, cx = -13, cz = -1; tray.position.set(cx, df(cx, cz) + 1.1, cz); tray.rotation.y = 0.5 + 0.6; }
  const soilH = ironHelmet({ guard: true, col: 0x7a6a62 }); soilH.scale.setScalar(1.25); soilH.position.set(9.0, df(9, -4.0) + 0.05, -4.0); soilH.rotation.set(0.18, 0.5, 0.08); root.add(soilH);
  const dust = motes(root, 40, [-8, 12, 0.3, 3, -6, 4], 33, 0.02);
  return { tray, soilH, sign, dust };
}

// ================================================================= BOG (Denmark)
function buildBog(root) { const R = PT.rng(900), K = new Kit();
  terrain(root, 400, 400, 180, 170, 0, bf, (x, y, z) => { const n = PT.fbm(x * 0.03 + 9, z * 0.03 + 3, 2, 2, 3, 8); const peat = sm(0.15, 0.4, y) * (1 - sm(-6, -12, z)); let c = [0.36 + 0.08 * n, 0.4 + 0.06 * n, 0.24]; c = c.map((v, k) => v * (1 - peat * 0.8) + [0.3, 0.2, 0.14][k] * peat * 0.8); return c; }, 0.14);
  const pools = []; for (const [x, z, sx, sz] of [[-3.5, 1.5, 2.6, 1.4], [3.8, 0.6, 2.2, 1.6], [0.5, -5.5, 4, 1.8], [-6, -4, 3, 1.5], [6.5, -7, 3.5, 2]]) { const p = mesh(root, new THREE.CircleGeometry(1, 28), M.bogWater, x, bf(x, z) + 0.05, z, -Math.PI / 2, 0, 0, false); p.scale.set(sx, sz, 1); p.receiveShadow = true; pools.push(p); }
  // peat ledge + offering stones under the helmets
  K.at(-0.2, bf(-0.2, -1.0), -1.0, 0, () => { K.box(M.peat, -1.5, 1.5, -0.2, 0.38, -0.7, 0.7, 0x7a5236, 0.1); for (let i = 0; i < 9; i++) K.box(M.peat, -1.42 + i * 0.32, -1.18 + i * 0.32, 0.36, 0.4, -0.6, 0.6, 0x6a4430, 0.02); for (const [x, z] of [[-1.1, 0.8], [1.2, 0.75], [0, 0.95]]) rock(K, x, 0.05, z, 0.22, Math.round(x * 10 + 30), 0xa8a8a0); });
  // reeds: thin tapered blades in clumps
  const KR = new Kit(); const reedG = new THREE.ConeGeometry(0.03, 1, 5); for (let i = 0; i < 320; i++) { const x = (R() - 0.5) * 34, z = 6 - R() * 26; if (Math.hypot(x + 0.2, (z + 1) * 1.4) < 2.3) continue; const h = 0.8 + R() * 1.1; KR.put(M.reed, reedG, x, bf(x, z) + h / 2, z, (R() - 0.5) * 0.3, 0, (R() - 0.5) * 0.3, 1, h, 1, [0xb8c070, 0xc8c880, 0xd0b870, 0xa8b868][i % 4]); if (i % 9 === 0) KR.put(M.peat, cyl(0.035, 0.035, 0.14, 6), x, bf(x, z) + h + 0.05, z, 0, 0, 0, 1, 1, 1, 0x6a4a2a); }
  { const rg = new THREE.Group(); root.add(rg); KR.build(rg, 0); rg.traverse((o) => { if (o.isMesh) nond(o); }); }
  for (let i = 0; i < 160; i++) { const x = (R() - 0.5) * 30, z = 6 - R() * 22; if (Math.hypot(x + 0.2, (z + 1) * 1.4) < 2.4) continue; K.put(M.leaf, lumpGeo(2 + (i % 6), 1, 0.35), x, bf(x, z) + 0.08, z, 0, R() * 6, 0, 0.3 + R() * 0.35, 0.25 + R() * 0.2, 0.3 + R() * 0.35, [0x8a9a4a, 0x9aa858, 0xa8a050, 0x7a8a44][i % 4]); }
  // peat cuttings (stacked turves) + a spade, birches, distant tree line
  for (const [x, z] of [[-6, 3], [5.5, 3.5]]) K.at(x, bf(x, z), z, R(), () => { for (let i = 0; i < 6; i++) K.box(M.peat, -0.3 + (i % 3) * 0.22, -0.1 + (i % 3) * 0.22, Math.floor(i / 3) * 0.12, Math.floor(i / 3) * 0.12 + 0.11, -0.12, 0.12, 0x4a3022, 0.02); });
  K.at(-4.6, bf(-4.6, 3.6), 3.6, 0.4, () => { K.beam(M.bark, [0, 0, 0], [0.1, 1.1, 0.1], 0.03, 0x7a5a3a, true, 5); K.box(M.iron, -0.1, 0.1, -0.1, 0.18, -0.02, 0.02, 0x7a7a80, 0.01); });
  for (const [x, z, s] of [[-9, -3, 1.2], [-11, 2, 1.0], [9, -2, 1.1], [11.5, 3, 1.3], [-14, -8, 1.2], [14, -9, 1.1], [3, -14, 1.0], [-4, -16, 1.2]]) birch(K, x, bf(x, z), z, s, R);
  for (let i = 0; i < 70; i++) { const x = (R() - 0.5) * 200, z = -30 - R() * 70; birch(K, x, bf(x, z), z, 1.2 + R() * 0.8, R); }
  const sign = mesh(root, plane(1.2, 0.37), M.bogSign, 7.4, bf(7.4, 4.4) + 1.1, 4.4, 0, -0.35, 0, false); K.beam(M.plank, [7.4, bf(7.4, 4.35), 4.35], [7.4, bf(7.4, 4.35) + 0.95, 4.35], 0.06, 0x7a5a3a);
  K.build(root, 40);
  const hA = veksoHelmet(), hB = veksoHelmet(); for (const [h, x, ry] of [[hA, -0.72, 0.2], [hB, 0.72, -0.2]]) { h.scale.setScalar(1.9); h.position.set(x, bf(-0.2, -1.0) + 0.42, -0.95); h.rotation.y = ry; root.add(h); }
  const glow = glowAt(root, [0, bf(-0.2, -1) + 0.9, -0.9], 3.0, '#ffd890', 0.3);
  const mists = []; for (let i = 0; i < 14; i++) { const m = nond(mesh(root, plane(14, 2.2), M.mist.clone(), (R() - 0.5) * 30, 0.4 + R() * 1.0, 3 - R() * 30, 0, 0, 0, false)); m.renderOrder = 4; m.userData.x = m.position.x; m.material.opacity = 0.28; mists.push(m); }
  const dust = motes(root, 60, [-3, 3, 0.3, 2.5, -3, 2], 37, 0.015);
  return { hA, hB, glow, mists, dust, sign };
}

// ================================================================= BAYREUTH exterior
function buildBay(root) { const R = PT.rng(1876), K = new Kit();
  terrain(root, 300, 260, 100, 90, -60, bayf, (x, y, z) => { const n = PT.fbm(x * 0.03 + 1, z * 0.03 + 4, 2, 2, 3, 2), path = 1 - sm(2.5, 3.5, Math.abs(x)) * (z > -14 ? 1 : 1), plaza = (z < -8 && z > -16 && Math.abs(x) < 16) ? 1 : 0; const p = Math.max(path, plaza); let c = [0.3 + 0.06 * n, 0.44 + 0.05 * n, 0.22]; return c.map((v, k) => v * (1 - p) + [0.62, 0.56, 0.46][k] * p * (0.92 + 0.1 * n)); });
  // Festspielhaus: wide front block (two wings), central portico with columns + pediment, auditorium block, tall stage house behind
  const Z = -18; K.at(0, 0.6, Z, 0, () => {
    for (const s of [-1, 1]) K.box(M.brickT, s > 0 ? 3.6 : -15, s > 0 ? 15 : -3.6, -0.6, 7.5, -4, 0, 0xffffff, 0.04);
    K.box(M.brickT, -3.6, 3.6, -0.6, 9.5, -4, 0.4, 0xffffff, 0.04); K.box(M.brickT, -13, 13, -0.6, 12.5, -18, -4, 0xf2e8e0, 0.05); K.box(M.brickT, -10, 10, -0.6, 22, -34, -18, 0xe8dcd4, 0.05);
    for (const s of [-1, 1]) { K.put(M.slate, new THREE.BoxGeometry(11.6, 0.2, 2.6), s * 9.3, 7.9, -1.2, -0.45, 0, 0, 1, 1, 1, 0xffffff); }
    K.put(M.slate, new THREE.BoxGeometry(26.6, 0.25, 15), 0, 12.9, -11, 0, 0, 0, 1, 1, 1, 0xffffff); const gab = shapeGeo([[-10.4, 0], [10.4, 0], [0, -4.5]], 16.4, 0.02); K.put(M.slate, gab, 0, 22, -34.2, -Math.PI / 2, 0, 0, 1, 1, 1, 0xffffff);
    // portico
    K.box(M.plaster, -4.2, 4.2, -0.6, 0.2, 0.4, 3.4, 0xe8dcc8, 0.04); for (let i = 0; i < 4; i++) { const x = -3.0 + i * 2; K.put(M.plaster, cyl(0.28, 0.32, 5.2, 14), x, 2.8, 3.0, 0, 0, 0, 1, 1, 1, 0xf2ead8); K.box(M.plaster, x - 0.4, x + 0.4, 5.3, 5.6, 2.6, 3.4, 0xe8dcc8, 0.02); }
    K.box(M.plaster, -4.4, 4.4, 5.6, 6.3, 0.2, 3.6, 0xeae0cc, 0.03); const ped = shapeGeo([[-4.6, 0], [4.6, 0], [0, -2.0]], 3.6, 0.02); K.put(M.plaster, ped, 0, 6.3, 0.0, -Math.PI / 2, 0, 0, 1, 1, 1, 0xeae0cc);
    for (let i = 0; i < 3; i++) { const x = -2 + i * 2; K.box(M.plank, x - 0.6, x + 0.6, 0.2, 3.0, 0.38, 0.44, 0x4a2a18, 0.02); K.box(M.winWarm, x - 0.5, x + 0.5, 0.3, 2.9, 0.4, 0.46, 0xffffff, 0.01); }
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const x = s * (5.4 + i * 2.4); K.box(M.winWarm, x - 0.5, x + 0.5, 1.6, 4.4, -0.02, 0.05, 0xffffff, 0.01); K.box(M.plaster, x - 0.65, x + 0.65, 1.45, 1.6, -0.02, 0.14, 0xf2ead8, 0.01); const arch = new THREE.CircleGeometry(0.5, 12, 0, Math.PI); K.put(M.winWarm, arch, x, 4.4, 0.06, 0, 0, 0, 1, 1, 1, 0xffffff); }
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) K.box(M.winWarm, s * (4 + i * 3) - 0.5, s * (4 + i * 3) + 0.5, 8.6, 10.8, -3.96, -3.9, 0xffffff, 0.01);
    K.box(M.plaster, -15.2, 15.2, -0.6, 0.0, -4.2, 0.2, 0xd8ccb8, 0.03); for (let i = 0; i < 5; i++) K.box(M.plaster, -4.2, 4.2, -0.6 + i * 0.12 - 0.12, -0.6 + i * 0.12, 3.4 + (5 - i) * 0.35 - 0.35, 3.4 + (5 - i) * 0.35, 0xd8ccb8, 0.01); });
  const fest = mesh(root, plane(6.0, 0.95), M.festSign, 0, 0.6 + 7.0, Z + 0.47, 0, 0, 0, false);
  // gas lamps along the path, playbill A-board, the advertising column, carriage, trees, fence
  const lamps = []; for (const z of [6, 0, -6, -12]) for (const s of [-1, 1]) { const x = s * 4.2; K.beam(M.iron, [x, 0, z], [x, 3.2, z], 0.06, 0x2a2a30, true, 8); K.put(M.iron, cyl(0.12, 0.08, 0.1, 8), x, 3.2, z, 0, 0, 0, 1, 1, 1, 0x2a2a30); K.put(M.iron, new THREE.ConeGeometry(0.28, 0.25, 6), x, 3.85, z, 0, 0, 0, 1, 1, 1, 0x2a2a30); lamps.push([x, 3.55, z]); }
  const lampBulbs = lamps.map((p) => mesh(root, sph(0.17, 10, 8), M.lampGlass, ...p, 0, 0, 0, false));
  K.at(2.4, bayf(2.4, 3), 3, -0.3, () => { for (const s of [-1, 1]) K.beam(M.plank, [-0.5, 0, s * 0.35], [-0.42, 1.6, 0], 0.05, 0x5a3a24); for (const s of [-1, 1]) K.beam(M.plank, [0.5, 0, s * 0.35], [0.42, 1.6, 0], 0.05, 0x5a3a24); });
  const bill = mesh(root, plane(0.9, 1.35), M.playbill, 2.4 + 0.38 * Math.sin(-0.3), bayf(2.4, 3) + 0.85, 3 + 0.36 * Math.cos(-0.3), -0.22, -0.3, 0, false);
  // advertising column (posters around it) at (-9, 4)
  const COL = [-9, 4]; K.at(COL[0], 0, COL[1], 0, () => { K.put(M.plaster, cyl(0.85, 0.85, 3.2, 24), 0, 1.6, 0, 0, 0, 0, 1, 1, 1, 0x2a4a3a); K.put(M.iron, cyl(1.0, 1.0, 0.25, 24), 0, 3.3, 0, 0, 0, 0, 1, 1, 1, 0x2a4a3a); K.put(M.iron, new THREE.ConeGeometry(1.05, 0.7, 24), 0, 3.75, 0, 0, 0, 0, 1, 1, 1, 0x3a5a4a); K.put(M.iron, sph(0.12, 10, 8), 0, 4.2, 0, 0, 0, 0, 1, 1, 1, 0xd8b048); K.put(M.iron, cyl(1.0, 1.0, 0.2, 24), 0, 0.1, 0, 0, 0, 0, 1, 1, 1, 0x2a4a3a); });
  const posters = []; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; const p = mesh(root, new THREE.CylinderGeometry(0.87, 0.87, 1.7, 8, 1, true, a - TAU / 16 + 0.02, TAU / 8 - 0.04), M.posters[i % 4], COL[0], 1.75, COL[1], 0, 0, 0, false); p.material = M.posters[i % 4]; posters.push(p); }
  K.at(9, 0, 1, -0.6, () => { K.box(M.plank, -1.4, 1.4, 0.7, 1.6, -0.7, 0.7, 0x2a2a34, 0.08); K.box(M.plank, -0.9, 0.9, 1.6, 2.4, -0.68, 0.68, 0x2a2a34, 0.06); for (const [x, r] of [[-1.0, 0.55], [1.0, 0.45]]) for (const s of [-1, 1]) K.put(M.plank, new THREE.TorusGeometry(r, 0.05, 6, 18), x, r, s * 0.78, 0, 0, 0, 1, 1, 1, 0x5a3a24); K.box(M.winWarm, -0.8, -0.2, 1.75, 2.2, 0.68, 0.7, 0xffffff, 0.005); });
  for (let i = 0; i < 40; i++) { const x = (R() - 0.5) * 140, z = -10 - R() * 60; if (Math.abs(x) < 20 && z > -50) continue; const s = 1.2 + R(); K.beam(M.bark, [x, bayf(x, z) - 0.2, z], [x, bayf(x, z) + 2.2 * s, z], 0.2 * s, 0x5a3a26, true, 6); for (let k = 0; k < 5; k++) K.put(M.leaf, lumpGeo(k + 3, 1, 0.2), x + (R() - 0.5) * 2 * s, bayf(x, z) + (3 + R() * 1.6) * s, z + (R() - 0.5) * 2 * s, 0, R() * 6, 0, 1.4 * s, 1.2 * s, 1.4 * s, [0x3a6a3a, 0x4a7a3a][k % 2]); }
  for (const [x, z] of [[-14, 8], [14, 7], [-17, -2], [18, -3]]) { K.beam(M.bark, [x, -0.2, z], [x, 3, z], 0.25, 0x5a3a26, true, 6); for (let k = 0; k < 6; k++) K.put(M.leaf, lumpGeo(k + 5, 1, 0.2), x + (R() - 0.5) * 3, 3.8 + R() * 2, z + (R() - 0.5) * 3, 0, R() * 6, 0, 1.8, 1.5, 1.8, [0x3a6a3a, 0x4a7a3a, 0x3e6234][k % 3]); }
  K.build(root, 40);
  const glows = lamps.map((p) => glowAt(root, p, 2.2, '#ffc070', 0.5)).concat([glowAt(root, [0, 2.2, Z + 0.6 + 1.0], 7, '#ffb860', 0.25)]); const dust = motes(root, 50, [-5, 5, 0.3, 4, -8, 8], 41, 0.02);
  return { glows, lampBulbs, fest, posters, bill, dust };
}

// ================================================================= STAGE (opera house interior)
function buildStage(root) { const R = PT.rng(1877), K = new Kit(), PW = 12, PH = 8, SZ = -2; // proscenium opening width/height, stage front z
  mesh(root, planeUV(30, 30, 4, 4), M.floor, 0, 0, 0, -Math.PI / 2, 0, 0, false);
  K.box(M.floor, -9, 9, 0, 1.1, -16, SZ, 0xc8a070, 0.02); // stage deck (raised)
  // proscenium wall + arch frame (gold), house walls, boxes
  for (const s of [-1, 1]) K.box(M.velvet, s > 0 ? PW / 2 : -16, s > 0 ? 16 : -PW / 2, 0, 16, SZ - 0.6, SZ, 0xffffff, 0.02); K.box(M.velvet, -PW / 2, PW / 2, PH + 1.1, 16, SZ - 0.6, SZ, 0xffffff, 0.02);
  for (const s of [-1, 1]) { K.box(M.gold, s * PW / 2 - 0.35, s * PW / 2 + 0.35, 0, PH + 1.6, SZ - 0.1, SZ + 0.25, 0xd8a840, 0.08); for (let i = 0; i < 6; i++) K.put(M.gold, sph(0.16, 10, 8), s * PW / 2, 1.2 + i * 1.5, SZ + 0.28, 0, 0, 0, 1, 1, 1, 0xf0c050); }
  K.box(M.gold, -PW / 2 - 0.35, PW / 2 + 0.35, PH + 1.1, PH + 1.8, SZ - 0.1, SZ + 0.25, 0xd8a840, 0.08); K.put(M.gold, lumpGeo(5, 2, 0.15), 0, PH + 1.6, SZ + 0.3, 0, 0, 0, 0.8, 0.6, 0.3, 0xf0c050);
  for (const s of [-1, 1]) K.box(M.velvet, s > 0 ? 15 : -16, s > 0 ? 16 : -15, 0, 16, SZ, 30, 0x8a6a6a, 0.02);
  for (const s of [-1, 1]) for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) { const z = SZ + 3 + i * 3.4, y = 4.5 + r * 3.2; K.box(M.gold, s > 0 ? 13.6 : -15, s > 0 ? 15 : -13.6, y, y + 0.9, z, z + 3.0, 0xc89838, 0.05); K.box(M.velvet, s > 0 ? 14.6 : -15, s > 0 ? 15 : -14.6, y + 0.9, y + 2.6, z + 0.1, z + 2.9, 0x6a2030, 0.02); }
  // pit rail + footlights, audience rows (dark seats)
  K.box(M.plank, -8, 8, 0, 1.0, SZ + 0.4, SZ + 0.55, 0x4a2a20, 0.02); const foots = []; for (let i = 0; i < 15; i++) { const x = -6.3 + i * 0.9; K.put(M.iron, cyl(0.1, 0.12, 0.14, 8), x, 1.18, SZ + 0.15, 0, 0, 0, 1, 1, 1, 0x3a2a20); foots.push([x, 1.3, SZ + 0.1]); }
  const footM = foots.map((p) => mesh(root, sph(0.08, 8, 6), M.foot, ...p, 0, 0, 0, false));
  const seats = []; for (let r = 0; r < 10; r++) for (let i = 0; i < 18; i++) { const x = -10.2 + i * 1.2 + (r % 2) * 0.3, z = SZ + 3.2 + r * 1.5, y = r * 0.18; K.box(M.velvet, x - 0.45, x + 0.45, y, y + 0.5, z, z + 0.5, 0x8a2a3a, 0.05); K.box(M.velvet, x - 0.45, x + 0.45, y, y + 1.1, z + 0.45, z + 0.62, 0x8a2a3a, 0.05); }
  // stage dressing: painted backdrop, wave flats (animated), ship flat (animated), rocks
  const bd = mesh(root, plane(18, 9), M.backdrop, 0, 1.1 + 4.5, -14, 0, 0, 0, false);
  const waves = []; for (let i = 0; i < 3; i++) { const w = mesh(root, plane(16, 1.6), M.waveFlat, 0, 1.1 + 0.7, -11 + i * 2.6, 0, 0, 0, false); w.userData.y = w.position.y; w.userData.i = i; waves.push(w); }
  const shipF = mesh(root, plane(9, 2.8), M.shipFlat, -0.5, 1.1 + 1.7, -9.6, 0, 0, 0, false); shipF.userData.y = shipF.position.y;
  for (const [x, z, s] of [[-4.5, -5.5, 1.0], [4.8, -6.0, 1.2], [3.6, -4.2, 0.6]]) rock(K, x, 1.1, z, s, Math.round(x * 5 + 40), 0x9a8aa0);
  // fly loft borders
  for (let i = 0; i < 3; i++) K.box(M.velvet, -PW / 2 - 1, PW / 2 + 1, PH + 0.4 - i * 0.3, PH + 1.4, -4 - i * 3.5, -3.7 - i * 3.5, 0xa03040, 0.02);
  K.build(root, 0);
  // curtains: two folded halves, open with setCurtain(t)
  const cg = new THREE.PlaneGeometry(PW / 2 + 0.4, PH + 0.6, 24, 1), cp = cg.attributes.position; for (let i = 0; i < cp.count; i++) cp.setZ(i, 0.12 * Math.sin(cp.getX(i) * 5.2)); cg.computeVertexNormals();
  const curt = [-1, 1].map((s) => { const piv = new THREE.Group(); piv.position.set(s * (PW / 2 + 0.2), 1.1 + (PH + 0.6) / 2 - 0.05, SZ - 0.9); root.add(piv); const m = mesh(piv, cg, M.curtain, -s * (PW / 4 + 0.2), 0, 0, 0, 0, 0, true); return piv; });
  const valance = mesh(root, plane(PW + 1, 1.2), M.curtain, 0, PH + 0.9, SZ - 0.75, 0, 0, 0, false);
  const glows = [glowAt(root, [0, 1.5, SZ + 0.3], 10, '#ffd090', 0.18)]; const dust = motes(root, 80, [-6, 6, 1.2, 8, -8, 1], 43, 0.012);
  const beams = [shaftAt(root, [-5, 5, 3], 2.2, 14, 0.5, 0.5, 0.12, 0xfff0d0), shaftAt(root, [5, 5, 3], 2.2, 14, -0.5, -0.5, 0.12, 0xfff0d0)];
  return { curt, waves, shipF, footM, glows, dust, beams, bd };
}

// ================================================================= SHOP (Doepler's costume workshop)
function buildShop(root) { const R = PT.rng(1875), K = new Kit(), X = 5, ZB = -4, HT = 3.6;
  mesh(root, planeUV(11, 10, 3, 3), M.floor, 0, 0, 0, -Math.PI / 2, 0, 0, false);
  K.box(M.wallpaper, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(M.wallpaper, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 5, 0xffffff, 0.01);
  K.box(M.plank, -X, X, 0, 0.9, ZB, ZB + 0.05, 0x5a3a24, 0.01); mesh(root, plane(2 * X, 10), H.toon({ color: 0x3a2a24, side: THREE.DoubleSide }), 0, HT, 0.5, Math.PI / 2, 0, 0, false);
  // window (left wall) letting in a shaft
  K.box(M.winDay, -X - 0.02, -X + 0.02, 1.0, 2.9, -2.6, -0.6, 0xffffff, 0.01); for (const z of [-2.6, -1.6, -0.6]) K.box(M.plank, -X, -X + 0.08, 1.0, 2.9, z - 0.05, z + 0.05, 0xf2ead8, 0.01); for (const y of [1.0, 1.95, 2.9]) K.box(M.plank, -X, -X + 0.08, y - 0.05, y + 0.05, -2.6, -0.6, 0xf2ead8, 0.01);
  // drafting table (tilted top + sketch), stool, lamp
  K.at(-1.4, 0, -2.0, 0.25, () => { for (const [x, z] of [[-0.7, -0.45], [0.7, -0.45], [-0.7, 0.45], [0.7, 0.45]]) K.beam(M.plank, [x, 0, z], [x, 1.0, z], 0.05, 0x6a4028); K.put(M.plank, new THREE.BoxGeometry(1.7, 0.05, 1.1), 0, 1.12, 0, 0.42, 0, 0, 1, 1, 1, 0xc8a070);
    K.put(M.paint, cyl(0.05, 0.08, 0.04, 10), 0.65, 1.0, 0.45, 0, 0, 0, 1, 1, 1, 0x2a2a30); K.put(M.paint, cyl(0.01, 0.01, 0.4, 6), 0.65, 1.2, 0.45, 0, 0, 0, 1, 1, 1, 0x2a2a30); K.put(M.jar, sph(0.09, 10, 8), 0.65, 1.45, 0.45, 0, 0, 0, 1, 1.2, 1, 0xffffff); K.put(M.paint, cyl(0.03, 0.03, 0.08, 6), -0.6, 1.08, 0.4, 0, 0, 0, 1, 1, 1, 0x2a2a3a); });
  const sketch = mesh(root, plane(1.1, 0.78), M.sketch, 0, 0, 0, 0, 0, 0, false); { const g = new THREE.Group(); g.position.set(-1.4, 1.155, -2.0); g.rotation.set(0, 0.25, 0, 'YXZ'); root.add(g); g.add(sketch); sketch.position.set(0, 0.02, 0); sketch.rotation.set(-Math.PI / 2 + 0.42, 0, 0); }
  // costume dummies: torso lathe on a pole, tunics; dummy A at (1.2,-2.3) wears the 3D helmet that grows horns
  const dummy = (x, z, col, ry) => K.at(x, 0, z, ry, () => { K.put(M.paint, cyl(0.3, 0.34, 0.06, 14), 0, 0.03, 0, 0, 0, 0, 1, 1, 1, 0x3a2a20); K.beam(M.bark, [0, 0, 0], [0, 1.0, 0], 0.035, 0x5a3a24, true, 6);
    K.put(M.cloth, lathe('vkdum', [[0.001, 0], [0.24, 0.02], [0.26, 0.3], [0.22, 0.5], [0.26, 0.68], [0.18, 0.78], [0.07, 0.82], [0.06, 0.95], [0.001, 0.96]], 16), 0, 1.0, 0, 0, 0, 0, 1, 1, 0.8, col);
    K.put(M.cloth, sph(0.12, 12, 10), 0, 2.08, 0, 0, 0, 0, 1, 1.15, 1, 0xe8dcc8); K.put(M.leaf, new THREE.ConeGeometry(0.36, 0.7, 14, 1, true), 0, 1.25, 0, 0, 0, 0, 1, 1, 0.82, col); });
  dummy(1.3, -2.4, 0xb8483a, -0.3); dummy(3.1, -2.8, 0x4a6a9a, -0.5); dummy(-3.6, -2.9, 0x6a8a4a, 0.5);
  // fabric bolts on a shelf, trunk, mirror, easel + painting, pinned sketches
  K.box(M.plank, 2.2, 4.9, 2.2, 2.26, ZB + 0.02, ZB + 0.5, 0x6a4028, 0.01); K.box(M.plank, 2.2, 4.9, 1.2, 1.26, ZB + 0.02, ZB + 0.5, 0x6a4028, 0.01);
  for (let i = 0; i < 8; i++) K.put(M.cloth, cyl(0.12, 0.12, 0.44, 12), 2.45 + (i % 4) * 0.62, 1.4 + Math.floor(i / 4) * 1.0, ZB + 0.26, Math.PI / 2, 0, 0, 1, 1, 1, [0xb8322e, 0x3a5a8a, 0xe8c040, 0x6a8a4a, 0x8a4a8a, 0xf0e6d0, 0x5a3a2a, 0xc87a3a][i]);
  K.at(-3.8, 0, 0.6, 0.9, () => { K.box(M.plank, -0.6, 0.6, 0, 0.6, -0.35, 0.35, 0x6a3a22, 0.05); K.box(M.gold, -0.62, 0.62, 0.26, 0.32, -0.37, 0.37, 0xc8a040, 0.01); for (let i = 0; i < 3; i++) K.put(M.cloth, lumpGeo(i + 3, 1, 0.2), -0.3 + i * 0.3, 0.66, 0, 0, 0, 0, 0.2, 0.1, 0.2, [0xb8322e, 0xe8c040, 0x3a5a8a][i]); });
  K.at(3.6, 0, 0.6, -0.55, () => { K.beam(M.plank, [0, 0, -0.45], [0, 2.3, -0.02], 0.05, 0x7a5030); K.beam(M.plank, [-0.5, 0, 0.12], [0, 2.3, -0.02], 0.05, 0x7a5030); K.beam(M.plank, [0.5, 0, 0.12], [0, 2.3, -0.02], 0.05, 0x7a5030); K.box(M.plank, -0.6, 0.6, 0.8, 0.86, 0.06, 0.26, 0x7a5030, 0.01); });
  const painting = mesh(root, plane(1.1, 1.43), M.painting, 3.6 + 0.2 * Math.sin(-0.55), 1.58, 0.6 + 0.2 * Math.cos(-0.55), -0.08, -0.55, 0, true);
  for (let i = 0; i < 4; i++) mesh(root, plane(0.7, 0.5), M.sketch, -2.6 + i * 0.95, 2.6 + (i % 2) * 0.15, ZB + 0.03, 0, 0, (i % 2 ? 0.05 : -0.04), false);
  K.box(M.gold, -4.95, -4.88, 0.6, 2.6, 1.4, 2.6, 0xc8a040, 0.02); K.box(M.glassW, -4.88, -4.86, 0.7, 2.5, 1.5, 2.5, 0xffffff, 0.005);
  K.build(root, 3);
  const helm = ironHelmet({ horns: true, col: 0x9a98a2 }); helm.scale.setScalar(1.35); helm.position.set(1.3, 2.1, -2.4); helm.rotation.y = 0.2; root.add(helm);
  const lampG = glowAt(root, [-0.95, 1.45, -1.55], 1.4, '#ffc070', 0.6); const shaft = shaftAt(root, [-2.6, 1.6, -1.6], 1.8, 4.2, Math.PI / 2 - 0.4, 0.75, 0.2, 0xffe4b0);
  const dust = motes(root, 60, [-4, 2, 0.4, 3, -3.5, 0], 47, 0.012);
  return { helm, sketch, painting, lampG, shaft, dust };
}

// ================================================================= lights, grades, API
const SET_LIGHT = {
  fjord: { top: '#4a5aa8', hor: '#ffc8a0', fog: '#e8c8b8', fogN: 50, fogF: 700, sky: '#a0a0e0', ground: '#5a5060', hemiI: 0.95, fillCol: '#7a88e0', fillI: 0.35, sunCol: '#ffc890', sunI: 3.2, az: 75, el: 15, disc: '#fff0d0', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff2ea', fxTint: '#fff6f0', shafts: 0.6 },
  fjordDay: { top: '#3f7ad0', hor: '#c8dcee', fog: '#d4e2ec', fogN: 60, fogF: 700, sky: '#a8bcf0', ground: '#6a6a58', hemiI: 0.75, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#fff0d0', sunI: 3.6, az: 40, el: 42, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  dig: { top: '#3f7ad0', hor: '#c0d8f0', fog: '#cfe0ec', fogN: 60, fogF: 600, sky: '#a0b8f0', ground: '#6a6a48', hemiI: 0.72, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#ffe8c0', sunI: 3.7, az: 35, el: 46, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  dig43: { top: '#5a78b8', hor: '#f0d8b0', fog: '#e8d8c0', fogN: 50, fogF: 500, sky: '#b0a8d0', ground: '#6a5a48', hemiI: 0.85, fillCol: '#8088d0', fillI: 0.32, sunCol: '#ffd8a0', sunI: 3.3, az: -40, el: 24, disc: '#fff0c8', discSize: 0.003, clouds: true, stars: 0, cardTint: '#fff0e0', fxTint: '#fff6ea', shafts: 0.3 },
  digTent: { top: '#3f7ad0', hor: '#c0d8f0', fog: '#cfe0ec', fogN: 60, fogF: 600, sky: '#a0b8f0', ground: '#6a6a48', hemiI: 0.8, fillCol: '#8a98e6', fillI: 0.4, sunCol: '#ffe8c0', sunI: 3.0, az: 35, el: 46, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  bog: { top: '#5a7aa8', hor: '#e8e0c8', fog: '#c8d0c8', fogN: 18, fogF: 160, sky: '#a8b0d0', ground: '#4a5040', hemiI: 0.95, fillCol: '#7a88c8', fillI: 0.4, sunCol: '#ffe0a8', sunI: 2.8, az: 120, el: 16, disc: '#fff4d8', discSize: 0.004, clouds: true, stars: 0, cardTint: '#f8f4ec', fxTint: '#fff8f0', shafts: 0.7 },
  bayNight: { top: '#0a1030', hor: '#2a3a70', fog: '#1a2448', fogN: 30, fogF: 300, sky: '#5a6ab8', ground: '#2a2030', hemiI: 0.6, fillCol: '#4a58b8', fillI: 0.45, sunCol: '#a8b8ff', sunI: 1.2, az: -60, el: 35, disc: '#f4f0d8', discSize: 0.003, clouds: false, stars: 1, cardTint: '#e8e4f8', fxTint: '#ffffff', shafts: 0 },
  bayDay: { top: '#3f7ad0', hor: '#c0d8f0', fog: '#cfe0ec', fogN: 60, fogF: 600, sky: '#a0b8f0', ground: '#6a6a48', hemiI: 0.75, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#ffe8c0', sunI: 3.6, az: 25, el: 40, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  stage: { top: '#000000', hor: '#1a0c14', fog: '#1a0c14', fogN: 14, fogF: 70, sky: '#ffd8b0', ground: '#3a1a20', hemiI: 0.7, fillCol: '#6a5ab8', fillI: 0.35, sunCol: '#ffe0b0', sunI: 2.6, az: 10, el: 38, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  stageHouse: { top: '#000000', hor: '#2a1420', fog: '#2a1420', fogN: 18, fogF: 80, sky: '#ffd8b0', ground: '#4a2a28', hemiI: 0.95, fillCol: '#8a78c8', fillI: 0.4, sunCol: '#ffe0b0', sunI: 2.4, az: 10, el: 38, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  shop: { top: '#000000', hor: '#2a1e18', fog: '#2a1e18', fogN: 10, fogF: 50, sky: '#ffe8c8', ground: '#5a3a2a', hemiI: 0.9, fillCol: '#8a90c8', fillI: 0.3, sunCol: '#ffe8c0', sunI: 2.6, az: -100, el: 28, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  fjord: { look: 'golden', over: { exp: 1.06, con: 1.22, sat: 1.06, tS: ['#3a3a8a', 0.18], tH: ['#ffc890', 0.1], bloom: [0.42, 0.78], hal: [0.24, '#ffa860'], vig: [0.3, 0.48, '#1e1a3a'] } },
  fjordDay: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.08, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.36, 0.86], vig: [0.24, 0.5, '#4a3a5a'] } },
  dig: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.08, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.36, 0.86], vig: [0.24, 0.5, '#4a3a5a'] } },
  dig43: { look: 'golden', over: { exp: 1.05, con: 1.2, sat: 0.86, tS: ['#4a3a6a', 0.18], tH: ['#ffd8a0', 0.12], bloom: [0.4, 0.8], hal: [0.14, '#ffb070'], vig: [0.36, 0.46, '#2a1a20'] } },
  digTent: { look: 'day', over: { exp: 1.06, con: 1.22, sat: 1.06, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.38, 0.84], vig: [0.3, 0.5, '#3a2a4a'] } },
  bog: { look: 'golden', over: { exp: 1.06, con: 1.2, sat: 1.0, tS: ['#2a4a6a', 0.2], tH: ['#ffe0a8', 0.1], bloom: [0.44, 0.78], hal: [0.22, '#ffd090'], vig: [0.34, 0.46, '#1a2430'] } },
  bayNight: { look: 'night', over: { exp: 1.14, con: 1.22, sat: 1.04, lift: [0.02, 0.025, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.5, 0.68], hal: [0.32, '#ffa050'], vig: [0.4, 0.42, '#08081a'] } },
  bayDay: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.1, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.36, 0.86], vig: [0.24, 0.5, '#4a3a5a'] } },
  stage: { look: 'office', over: { exp: 1.12, con: 1.26, sat: 1.1, lift: [0.035, 0.018, 0.04], tS: ['#3a1a5a', 0.22], tH: ['#ffc888', 0.12], bloom: [0.46, 0.72], hal: [0.3, '#ff9a50'], vig: [0.4, 0.42, '#14060c'] } },
  stageHouse: { look: 'office', over: { exp: 1.12, con: 1.22, sat: 1.08, lift: [0.04, 0.025, 0.045], tS: ['#3a1a5a', 0.18], tH: ['#ffc888', 0.12], bloom: [0.44, 0.74], hal: [0.28, '#ffa060'], vig: [0.34, 0.46, '#1a0a12'] } },
  shop: { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.06, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.42, 0.78], hal: [0.26, '#ff9a50'], vig: [0.34, 0.46, '#2a1420'] } },
};

export function buildVK(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { curtain: 0, horns: 0, mood: 'fjord' };
  let fj, dg, bg, by, sg, sp;
  const API = makeAPI(ctx, { prefix: 'vk_', origin: VK_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { fjord: 'day', fjordDay: 'day', dig: 'day', dig43: 'day', digTent: 'day', bog: 'day', bayNight: 'office', bayDay: 'day', stage: 'office', stageHouse: 'office', shop: 'office' },
    practicals: (name, F, W3) => { const fl = 1 + 0.06 * Math.sin(F * 0.7) + 0.04 * Math.sin(F * 1.9);
      if (name === 'bayNight') return [{ p: W3('bay', [0, 3.0, -14]), col: '#ffb860', I: 6 * fl, d: 14 }, { p: W3('bay', [-4.2, 3.4, 0]), col: '#ffc070', I: 3.2 * fl, d: 8 }, { p: W3('bay', [4.2, 3.4, 0]), col: '#ffc070', I: 3.2 * fl, d: 8 }, { p: W3('bay', [-4.2, 3.4, 6]), col: '#ffc070', I: 2.6 * fl, d: 8 }];
      if (name === 'stage' || name === 'stageHouse') return [{ p: W3('stage', [0, 1.6, -1.4]), col: '#ffd090', I: 7, d: 12 }, { p: W3('stage', [-4, 7, 2]), col: '#fff0d8', I: 6, d: 16 }, { p: W3('stage', [4, 7, 2]), col: '#fff0d8', I: 6, d: 16 }, { p: W3('stage', [0, 9, 10]), col: '#ffd8b0', I: name === 'stageHouse' ? 8 : 1.5, d: 26 }];
      if (name === 'shop') return [{ p: W3('shop', [-0.95, 1.5, -1.5]), col: '#ffc070', I: 3.4 * fl, d: 6 }, { p: W3('shop', [2.0, 2.8, 0.5]), col: '#ffe0b8', I: 2.6, d: 7 }, { p: W3('shop', [-3.5, 2.0, -1.5]), col: '#b8c8ff', I: 1.6, d: 6 }];
      if (name === 'digTent') return [{ p: W3('dig', [-12.4, 2.0, -0.4]), col: '#fff0d8', I: 2.2, d: 5 }];
      if (name === 'bog') return [{ p: W3('bog', [0, 1.6, 0.2]), col: '#ffd890', I: 2.2, d: 5 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'fjord' && fj) { M.waterTex.offset.set(f * 0.0003, Math.sin(f * 0.02) * 0.003 + f * 0.0002); for (const s of [fj.ship, fj.far]) { s.G.position.y = -0.1 + 0.06 * Math.sin(T * 1.1 + (s === fj.far ? 2 : 0)); s.G.rotation.z = 0.012 * Math.sin(T * 0.9); s.G.rotation.x = 0.01 * Math.sin(T * 0.7); }
        const sa = fj.ship.sail.geometry.attributes.position, b = fj.ship.sail.userData.base; for (let i = 0; i < sa.count; i++) sa.setZ(i, b[i * 3 + 2] * (1 + 0.06 * Math.sin(T * 2.2 + b[i * 3] * 0.8 + b[i * 3 + 1] * 0.5))); sa.needsUpdate = true;
        fj.mists.forEach((m, i) => (m.position.x = m.userData.x + T * 0.6 * (i % 2 ? 1 : -1))); tickMotes(fj.dust, f, 1.0); }
      if (cur === 'bog' && bg) { bg.mists.forEach((m, i) => (m.position.x = m.userData.x + T * 0.25 * (i % 2 ? 1 : -1))); bg.glow.material.opacity = bg.glow.userData.op * (0.85 + 0.15 * Math.sin(T * 2)); for (const [h, k] of [[bg.hA, 0], [bg.hB, 1]]) h.rotation.y = (k ? -0.25 : 0.25) + 0.12 * Math.sin(T * 0.6 + k); tickMotes(bg.dust, f, 0.4); }
      if (cur === 'dig' && dg) { tickMotes(dg.dust, f, 1.0); }
      if (cur === 'bay' && by) { by.glows.forEach((g, i) => (g.material.opacity = g.userData.op * (0.9 + 0.1 * Math.sin(f * 0.7 + i)))); tickMotes(by.dust, f, 0.6); }
      if (cur === 'stage' && sg) { sg.waves.forEach((w) => { w.position.y = w.userData.y + 0.12 * Math.sin(T * 2.4 + w.userData.i * 1.7); w.position.x = 0.25 * Math.sin(T * 1.2 + w.userData.i); }); sg.shipF.position.y = sg.shipF.userData.y + 0.1 * Math.sin(T * 2.0); sg.shipF.rotation.z = 0.025 * Math.sin(T * 2.0 + 1); tickMotes(sg.dust, f, 0.3); }
      if (cur === 'shop' && sp) { sp.lampG.material.opacity = sp.lampG.userData.op * (0.9 + 0.1 * Math.sin(f * 0.8)); tickMotes(sp.dust, f, 0.3); } },
    mood: (name) => { ST.mood = name; if (by) { const n = name === 'bayNight'; by.glows.forEach((g) => (g.visible = n)); by.lampBulbs.forEach((b) => (b.visible = n)); } if (sg) { const h = name === 'stageHouse'; sg.beams.forEach((b) => (b.material.opacity = b.userData.op * (h ? 1.2 : 1))); } },
    apply: (v) => { if (v.curtain != null) API.setCurtain(v.curtain); if (v.horns != null) API.setHorns(v.horns); } });
  fj = buildFjord(API.groups.fjord); dg = buildDig(API.groups.dig); bg = buildBog(API.groups.bog); by = buildBay(API.groups.bay); sg = buildStage(API.groups.stage); sp = buildShop(API.groups.shop);
  API.parts = { fj, dg, bg, by, sg, sp };
  API.setCurtain = (t) => { ST.curtain = t; const k = clamp01(t); sg.curt.forEach((piv, i) => { piv.scale.x = 1 - 0.78 * k; }); };
  API.setHorns = (t) => { ST.horns = t; const h = sp.helm.userData.horns; if (h) h.children.forEach((piv) => { const k = clamp01(t), b = k < 1 ? k * (1 + 0.25 * Math.sin(k * Math.PI)) : 1; piv.scale.setScalar(Math.max(0.001, b)); piv.visible = k > 0.01; }); };
  API.glows = { fjord: [], dig: [], bog: [bg.glow], bay: by.glows, stage: sg.glows, shop: [sp.lampG] };
  const _face = API.face; API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  const V = API.V;
  API.views = [
    V('fjord', [0.5, 1.8, 15], [0, 2.6, -6], 46, 1.0, [0, 1.6, 6.5]), // 0 beach -> ship
    V('fjord', [-14, 6, 26], [0, 3, -10], 40, 0.4), // 1 high wide
    V('fjordDay', [3, 1.7, 13], [-1, 2.2, -4], 46, 0.8, [0, 1.4, 6]), // 2 day
    V('dig', [-1, 3.2, 8], [-2, 0, -1.5], 46, 0.8, [-2, 0.3, -1]), // 3 trench wide
    V('dig43', [6, 1.8, 3.5], [9, 0.8, -4], 46, 1.2, [9, 0.8, -4]), // 4 mound 1943
    V('digTent', [-12.4, 1.35, 0.15], [-13, 0.95, -1], 40, 3, [-13, 0.98, -1]), // 5 helmet on tray
    V('bog', [0.3, 1.5, 6.5], [0, 0.9, -2], 46, 1.0, [0, 0.9, -1]), // 6 bog wide
    V('bog', [0.1, 1.15, 1.6], [0, 0.95, -1], 44, 2.5, [0, 0.95, -1]), // 7 helmets close
    V('bayNight', [1.5, 1.7, 14], [0, 5, -14], 50, 0.6, [0, 1.5, 4]), // 8 festspielhaus night
    V('bayDay', [-6.5, 1.6, 9], [-9, 1.9, 4], 46, 1.2, [-9, 1.8, 4.6]), // 9 column day
    V('stage', [0, 2.6, 14], [0, 3.6, -6], 46, 0.6, [0, 2.4, -4], { curtain: 1 }), // 10 stage from the house
    V('stage', [0.5, 2.2, 1.2], [0, 2.4, -6], 46, 1.2, [0, 2.2, -4], { curtain: 1 }), // 11 on stage close
    V('stageHouse', [0, 4, 20], [0, 3.6, -6], 46, 0.6, null, { curtain: 0.3 }), // 12 house lit
    V('shop', [0.4, 1.7, 3.6], [-0.4, 1.4, -3.0], 54, 1.4, [0, 1.3, -1.5], { horns: 1 }), // 13 workshop wide
    V('shop', [1.0, 2.25, -0.9], [1.3, 2.25, -2.4], 46, 3, [1.3, 2.25, -2.4], { horns: 0.6 }), // 14 dummy helmet close
    V('shop', [2.6, 1.6, 2.2], [3.6, 1.5, 0.5], 46, 2.5, [3.6, 1.55, 0.5]), // 15 painting
  ];
  API.setCurtain(0); API.setHorns(0); API.tick(0);
  return API;
}
