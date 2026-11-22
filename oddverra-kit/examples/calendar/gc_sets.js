// gc_sets.js [GC-sets]: sets for "In October 1582, ten days vanished from the calendar" (Oddverra short). All period details are our
// own stylization (no real map art, no logos, no portraits). Each set: local frame, floor y = 0, camera side +z. Test flag ?gcview=N.
//   bed    : a Roman bedroom, October 1582: terracotta floor, ochre plaster, beamed ceiling, a curtained bed, a nightstand where PAGEY
//            stands, a shuttered window (night moon / morning sun), ten numbered pages that fly out (ST.fly). Moods 'bedNight' 'bedDay'.
//            origin (-154000,0,0)
//   cosmos : a blueprint "theory" space: grid floor, the Sun and an orbiting Earth, the Julian stone tablet, a big clock (+11 min),
//            a March day-strip with the equinox marker sliding ten days (ST.drift), a year counter (ST.year), and five century
//            plinths for the leap rule (ST.leap). Mood 'cosmos'.                                                origin (-154000,0,800)
//   hall   : a papal study, 1582: marble checker floor, red damask walls, arched windows with light shafts, a desk with the bull,
//            an armillary sphere, a globe, candelabra, a tall parchment "INTER GRAVISSIMAS" on a stand, pages fly (ST.fly2).
//            Mood 'hall'.                                                                                        origin (-154000,0,1600)
//   map    : a cartographer's room: a big table map of Europe (our own rough painting) with flag pins that rise (ST.pins), a wall
//            calendar of October 1582 (5-14 missing). Mood 'map'.                                                 origin (-156500,0,0)
//   london : a London street at sunset, September 1752: brick terraces, an almanack shop with the September 1752 calendar,
//            the 1707 Union flag, a dome on the skyline, a "GIVE US OUR ELEVEN DAYS" banner (ST.banner). Mood 'london'. origin (-156500,0,800)
//   petro  : Petrograd, a snowy night in 1917: a long palace facade, a column, red banners, braziers, a kiosk with a big flip
//            calendar 25 OCTOBER -> 7 NOVEMBER (ST.nov). Mood 'petro'.                                            origin (-156500,0,1600)
import { H, TAU, sm, SERIF, SANS, cyl, sph, tor, plane, planeUV, mesh, nond, lumpGeo, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';

export const GC_ORIGIN = { bed: [-154000, 0, 0], cosmos: [-154000, 0, 800], hall: [-154000, 0, 1600], map: [-156500, 0, 0], london: [-156500, 0, 800], petro: [-156500, 0, 1600] };
const GROUP_OF = { bedNight: 'bed', bedDay: 'bed', cosmos: 'cosmos', hall: 'hall', map: 'map', london: 'london', petro: 'petro' };
let THREE, PT, M;
const BIG = '"Luckiest Guy", "DejaVu Sans", sans-serif';

// ---------------------------------------------------------------- painters
function plainTex(col, k = 0.12, seed = 5) { return (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 1 - k / 2 + k * PT.fbm(u, v, 4, 4, 3, seed)); }; }
function tileTex(g, w, h) { const n = 6, c = w / n; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { g.fillStyle = ['#b0603a', '#a4563a', '#ba6a44', '#9a5034'][(i * 3 + j * 5) % 4]; g.fillRect(i * c, j * c, c, c); } g.strokeStyle = 'rgba(60,30,20,0.6)'; g.lineWidth = 3; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * c, 0); g.lineTo(i * c, h); g.moveTo(0, i * c); g.lineTo(w, i * c); g.stroke(); } PT.modulate(g, w, h, (u, v) => 0.86 + 0.18 * PT.fbm(u, v, 6, 6, 3, 4)); }
function checkerTex(g, w, h) { const n = 4, c = w / n; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { g.fillStyle = (i + j) % 2 ? '#e8e0d4' : '#5a4a5a'; g.fillRect(i * c, j * c, c, c); } grain(g, w, h, 'rgba(120,110,130,1)', 900, 3, 0.25); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, 8)); }
function damaskTex(g, w, h) { g.fillStyle = '#8a2a2e'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,200,140,0.16)'; for (let j = 0; j < 6; j++) for (let i = 0; i < 4; i++) { const x = (i + (j % 2) * 0.5) * w / 4, y = j * h / 6; g.beginPath(); g.moveTo(x, y - 18); g.quadraticCurveTo(x + 16, y, x, y + 18); g.quadraticCurveTo(x - 16, y, x, y - 18); g.fill(); g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill(); } PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, 2)); }
function gridTex(g, w, h) { g.fillStyle = '#12285a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(140,190,255,0.35)'; g.lineWidth = 1.5; for (let i = 0; i <= 16; i++) { g.beginPath(); g.moveTo(i * w / 16, 0); g.lineTo(i * w / 16, h); g.moveTo(0, i * h / 16); g.lineTo(w, i * h / 16); g.stroke(); } g.strokeStyle = 'rgba(170,215,255,0.6)'; g.lineWidth = 3; g.strokeRect(1, 1, w - 2, h - 2); }
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); if (!o.flat) PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * PT.fbm(u, v, 6, 2, 3, 7)); if (o.rim !== false) { g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08); }
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : 0.3 + i * (0.44 / (lines.length - 1))), w * 0.84, h * (lines.length === 1 ? 0.5 : 0.62 / lines.length), { col: o.col || '#3a2414', font: o.font || SERIF })); }; }
// a month grid: o.title, o.first (weekday index of day 1, 0 = Sunday), o.days (list of day numbers in order, gap days skipped), o.mark (set of days in red)
function monthTex(o) { return (g, w, h) => { g.fillStyle = '#f6eedc'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 5, 5, 3, 3));
  g.fillStyle = '#b8323a'; g.fillRect(0, 0, w, h * 0.17); txt(g, o.title, w / 2, h * 0.09, w * 0.9, h * 0.1, { col: '#fff4e0', font: BIG });
  const D = ['S', 'M', 'T', 'W', 'T', 'F', 'S'], cw = w / 7, top = h * 0.2, rh = (h * 0.78) / 6.2; D.forEach((d, i) => txt(g, d, cw * (i + 0.5), top + rh * 0.35, cw, rh * 0.4, { col: '#6a4a5a', font: BIG }));
  let c = o.first, r = 0; for (const d of o.days) { const x = cw * (c + 0.5), y = top + rh * (r + 1.1); if (o.mark && o.mark.has(d)) { g.fillStyle = 'rgba(255,216,56,0.6)'; g.beginPath(); g.arc(x, y, rh * 0.42, 0, TAU); g.fill(); } txt(g, String(d), x, y, cw * 0.86, rh * 0.5, { col: c === 0 ? '#b8323a' : '#2b1d4a', font: BIG }); c++; if (c > 6) { c = 0; r++; } }
  if (o.gap) { const [gc, gr] = o.gap; const x = cw * (gc + 0.5), y = top + rh * (gr + 1.1); g.strokeStyle = '#b8323a'; g.lineWidth = 6; g.beginPath(); g.moveTo(x - cw * 0.55, y); g.lineTo(x + cw * 0.55, y); g.stroke(); txt(g, o.gapLabel || '', x, y - rh * 0.42, cw * 1.4, rh * 0.26, { col: '#b8323a', font: BIG }); }
  g.strokeStyle = 'rgba(43,29,74,0.5)'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4); }; }
function pageTex(n) { return (g, w, h) => { g.fillStyle = '#f8f2e2'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8323a'; g.fillRect(0, 0, w, h * 0.2); txt(g, 'OCTOBER', w / 2, h * 0.1, w * 0.8, h * 0.12, { col: '#fff4e0', font: BIG }); txt(g, String(n), w / 2, h * 0.6, w * 0.8, h * 0.5, { col: '#2b1d4a', font: BIG }); g.strokeStyle = 'rgba(43,29,74,0.6)'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); }; }
function clockTex(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = '#f6eedc'; g.beginPath(); g.arc(w / 2, h / 2, w * 0.48, 0, TAU); g.fill(); g.lineWidth = w * 0.03; g.strokeStyle = '#2b1d4a'; g.stroke();
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, r0 = w * (i % 5 ? 0.43 : 0.4), r1 = w * 0.46; g.lineWidth = i % 5 ? 2 : 5; g.beginPath(); g.moveTo(w / 2 + Math.sin(a) * r0, h / 2 - Math.cos(a) * r0); g.lineTo(w / 2 + Math.sin(a) * r1, h / 2 - Math.cos(a) * r1); g.stroke(); }
  // the 11-minute wedge past twelve (red)
  g.fillStyle = 'rgba(200,40,50,0.35)'; g.beginPath(); g.moveTo(w / 2, h / 2); g.arc(w / 2, h / 2, w * 0.38, -Math.PI / 2, -Math.PI / 2 + 11 / 60 * TAU); g.closePath(); g.fill();
  ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].forEach((s, i) => { const a = i / 12 * TAU; txt(g, s, w / 2 + Math.sin(a) * w * 0.33, h / 2 - Math.cos(a) * w * 0.33, w * 0.12, w * 0.07, { col: '#2b1d4a', font: SERIF }); }); }
function tabletTex(g, w, h) { g.fillStyle = '#b8b0a4'; g.fillRect(0, 0, w, h); grain(g, w, h, 'rgba(60,50,50,1)', 2400, 9, 0.3); PT.modulate(g, w, h, (u, v) => 0.82 + 0.24 * PT.fbm(u, v, 5, 5, 3, 11));
  const cut = (s, y, sz) => { txt(g, s, w / 2 + 2, y + 2, w * 0.86, sz, { col: 'rgba(255,255,255,0.5)', font: SERIF }); txt(g, s, w / 2, y, w * 0.86, sz, { col: '#3a3038', font: SERIF }); };
  cut('CALENDARIVM', h * 0.16, h * 0.1); cut('IVLIANVM', h * 0.29, h * 0.1); cut('365 ¼', h * 0.55, h * 0.2); cut('DIES', h * 0.74, h * 0.1); g.strokeStyle = 'rgba(60,50,60,0.6)'; g.lineWidth = 8; g.strokeRect(14, 14, w - 28, h - 28); }
function stripTex(g, w, h) { const n = 17; g.fillStyle = '#f6eedc'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a6ab0'; g.fillRect(0, 0, w, h * 0.3); txt(g, 'MARCH', w / 2, h * 0.15, w * 0.3, h * 0.2, { col: '#ffffff', font: BIG });
  for (let i = 0; i < n; i++) { const x = (i + 0.5) * w / n, d = 8 + i; txt(g, String(d), x, h * 0.66, w / n * 0.8, h * 0.4, { col: d === 21 ? '#b8323a' : '#2b1d4a', font: BIG }); g.strokeStyle = 'rgba(43,29,74,0.4)'; g.lineWidth = 3; g.beginPath(); g.moveTo(i * w / n, h * 0.3); g.lineTo(i * w / n, h); g.stroke(); }
  g.strokeStyle = '#2b1d4a'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); }
function yearTex(y, ok) { return (g, w, h) => { g.fillStyle = ok ? '#2a8a4a' : '#9a3a3a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.14 * PT.fbm(u, v, 4, 4, 3, y)); txt(g, String(y), w / 2, h * 0.36, w * 0.86, h * 0.36, { col: '#fff4e0', font: BIG }); txt(g, ok ? 'LEAP ✓' : 'NO LEAP ✗', w / 2, h * 0.76, w * 0.86, h * 0.2, { col: '#fff4e0', font: BIG }); g.strokeStyle = 'rgba(20,10,30,0.6)'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }; }
// rough hand-painted Europe (our own coarse outlines from lon/lat; not a real map). lon -12..45, lat 34..70
const MAPX = (lon) => (lon + 12) / 57, MAPY = (lat) => (70 - lat) / 36;
const LAND = {
  iberia: [[-9.3, 43], [-8, 43.7], [-1.8, 43.4], [3.2, 42.3], [0.5, 40.5], [-0.3, 39], [-2, 36.7], [-5.6, 36], [-7.5, 37.2], [-8.9, 38], [-9.5, 39.5], [-8.8, 41.5]],
  france: [[-1.8, 43.4], [3.2, 42.3], [7.5, 43.7], [6.8, 46.3], [8, 48.9], [4.5, 50], [2.5, 51.1], [-1.5, 49.7], [-4.7, 48.4], [-1.2, 46.2]],
  italy: [[7.5, 43.7], [6.8, 46.3], [10.5, 46.8], [13.7, 46.5], [12.3, 45.3], [13.5, 43.6], [16, 41.9], [18.5, 40.1], [17, 39], [16.5, 38], [15.6, 38], [16, 40], [14.3, 41], [12.4, 41.8], [10.3, 43.5], [8.8, 44.4]],
  sicily: [[12.4, 38.1], [15.6, 38.3], [15.1, 36.7]],
  britain: [[-5.7, 50], [1.4, 51.2], [1.7, 52.7], [0, 53.5], [-1.5, 55.5], [-2, 57.6], [-4, 58.6], [-5, 58.6], [-6.2, 56.6], [-4.8, 55], [-3, 54], [-4.5, 53.3], [-4.3, 52], [-5.3, 51.7], [-3.5, 51.4]],
  ireland: [[-10, 51.6], [-6, 52.2], [-6, 54], [-7.5, 55.3], [-10, 54.2]],
  main: [[8, 48.9], [4.5, 50], [2.5, 51.1], [4, 51.6], [5, 53.3], [8.5, 53.7], [8.6, 57], [10.5, 57.7], [10.6, 54.5], [14, 54], [18.5, 54.7], [21, 55.5], [21, 57.5], [24, 57.2], [23.5, 59.2], [28.5, 59.9], [30, 61], [33, 66], [41, 67], [45, 68.5], [46, 70.5], [46, 40], [41.5, 41.5], [36, 41.5], [29, 41.2], [26, 40.6], [23.6, 40.2], [24, 38], [23, 36.5], [22, 36.5], [21, 37.8], [21, 39], [19.4, 40.4], [19.5, 41.8], [16.5, 43.5], [13.7, 45.6], [13.7, 46.5], [10.5, 46.8], [6.8, 46.3]],
  scand: [[5, 58.2], [7, 58], [10.5, 59.2], [12.5, 56], [14.3, 55.5], [16.5, 56.2], [18.8, 59.5], [17, 61.5], [21.5, 64.5], [24.5, 65.8], [28, 66], [30, 69.8], [25, 71.2], [15, 69], [12, 66], [5, 62]],
  black: [[28, 41.3], [33, 41.9], [41.5, 41.5], [41.6, 42.7], [37, 45], [35, 46.2], [33, 46], [30.5, 46.5], [28.6, 44.2]],
};
const REG = { // tinted regions for the pins (also rough)
  it: { pts: LAND.italy, col: '#3a9a5a', pin: [12.5, 41.9], name: 'ITALY' }, es: { pts: [[-7, 43.7], [-1.8, 43.4], [3.2, 42.3], [0.5, 40.5], [-0.3, 39], [-2, 36.7], [-5.6, 36], [-7.4, 37.2], [-7, 39], [-6.8, 42]], col: '#d8a030', pin: [-3.7, 40.4], name: 'SPAIN' },
  pt: { pts: [[-8.9, 42], [-6.8, 42], [-7, 39], [-7.4, 37.2], [-8.9, 37], [-9.5, 39.5]], col: '#3a7a3a', pin: [-9.1, 38.7], name: 'PORTUGAL' },
  pl: { pts: [[14.2, 53.9], [18.5, 54.7], [23.5, 54.2], [24, 52], [23.5, 50.4], [22.5, 49.1], [19, 49.4], [14.8, 50.9]], col: '#c84a5a', pin: [19.9, 52.2], name: 'POLAND' },
  gb: { pts: LAND.britain, col: '#3a5aa8', pin: [-1.5, 52.3], name: 'BRITAIN' },
  ru: { pts: [[28, 56], [28.5, 59.9], [30, 61], [33, 66], [41, 67], [45, 68.5], [46, 70.5], [46, 46], [40, 47], [36, 49.5], [32, 52], [30, 54]], col: '#b84a3a', pin: [37.6, 55.8], name: 'RUSSIA' },
  gr: { pts: [[20.2, 39.6], [23.6, 40.2], [24, 38], [23, 36.5], [22, 36.5], [21, 37.8], [21, 39]], col: '#3a8ac8', pin: [22.2, 38.6], name: 'GREECE' },
};
function mapTex(g, w, h) { g.fillStyle = '#7aa8b8'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.18 * PT.fbm(u, v, 5, 5, 3, 21));
  g.strokeStyle = 'rgba(255,255,255,0.2)'; g.lineWidth = 2; for (let i = 0; i < 26; i++) { const y = (i + 0.5) * h / 26; g.beginPath(); for (let x = 0; x <= w; x += 12) g.lineTo(x, y + Math.sin(x * 0.03 + i) * 3); g.stroke(); }
  const poly = (pts, fill, stroke = '#5a4030', lw = 4) => { g.beginPath(); pts.forEach(([lo, la], i) => (i ? g.lineTo(MAPX(lo) * w, MAPY(la) * h) : g.moveTo(MAPX(lo) * w, MAPY(la) * h))); g.closePath(); g.fillStyle = fill; g.fill(); if (stroke) { g.lineWidth = lw; g.strokeStyle = stroke; g.stroke(); } };
  for (const k of ['main', 'iberia', 'france', 'italy', 'sicily', 'britain', 'ireland', 'scand']) poly(LAND[k], '#cdb88c');
  poly(LAND.black, '#7aa8b8');
  for (const r of Object.values(REG)) poly(r.pts, r.col + '55', r.col, 3);
  grain(g, w, h, 'rgba(90,60,40,1)', 3000, 13, 0.25);
  g.strokeStyle = 'rgba(90,60,40,0.7)'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); g.lineWidth = 3; g.strokeRect(22, 22, w - 44, h - 44);
  // compass rose
  g.save(); g.translate(w * 0.08, h * 0.88); g.fillStyle = '#5a4030'; for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(0, -48); g.lineTo(9, 0); g.lineTo(-9, 0); g.fill(); } g.restore(); txt(g, 'N', w * 0.08, h * 0.88 - 62, 40, 30, { col: '#5a4030', font: SERIF });
  txt(g, 'EVROPA', w * 0.62, h * 0.32, w * 0.3, h * 0.05, { col: 'rgba(90,60,40,0.75)', font: SERIF, italic: true }); txt(g, 'MARE MEDITERRANEVM', w * 0.42, h * 0.93, w * 0.4, h * 0.03, { col: 'rgba(40,60,90,0.7)', font: SERIF, italic: true }); }
function skylineTex(g, w, h) { g.clearRect(0, 0, w, h); const R = PT.rng(1752); g.fillStyle = '#6a3a4a'; g.beginPath(); g.moveTo(0, h); let x = 0; while (x < w) { const bw = 20 + R() * 50, bh = h * (0.16 + R() * 0.2); g.lineTo(x, h - bh); g.lineTo(x + bw, h - bh); x += bw; } g.lineTo(w, h); g.fill();
  // a great dome + lantern, a few spires (generic)
  g.beginPath(); g.ellipse(w * 0.62, h * 0.5, w * 0.06, h * 0.28, 0, Math.PI, 0); g.fill(); g.fillRect(w * 0.55, h * 0.5, w * 0.14, h * 0.5); g.fillRect(w * 0.615, h * 0.12, w * 0.01, h * 0.12);
  for (const sx of [0.2, 0.33, 0.8, 0.9]) { g.beginPath(); g.moveTo(w * sx - 8, h * 0.62); g.lineTo(w * sx, h * (0.18 + R() * 0.15)); g.lineTo(w * sx + 8, h * 0.62); g.fill(); g.fillRect(w * sx - 12, h * 0.6, 24, h * 0.4); } }
function hillsTex(cols) { return (g, w, h) => { g.clearRect(0, 0, w, h); cols.forEach(([y0, c, a], k) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * y0 + Math.sin(x * 0.011 + y0 * 9 + k) * h * a + Math.sin(x * 0.029 + y0) * h * a * 0.4); g.lineTo(w, h); g.fill(); }); }; }
function winTex(o) { return (g, w, h) => { g.fillStyle = o.frame || '#f2ece0'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.a); gr.addColorStop(1, o.b); g.fillStyle = gr; g.fillRect(w * 0.08, h * 0.06, w * 0.84, h * 0.88);
  if (o.lit) { g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(w * 0.12, h * 0.1, w * 0.2, h * 0.8); }
  g.fillStyle = o.frame || '#f2ece0'; for (let i = 1; i < 3; i++) g.fillRect(w * 0.08 + i * w * 0.84 / 3 - 3, 0, 6, h); for (let j = 1; j < 4; j++) g.fillRect(0, h * 0.06 + j * h * 0.88 / 4 - 3, w, 6); }; }
function unionTex(g, w, h) { g.fillStyle = '#1e3a8a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f4f2ee'; g.lineWidth = h * 0.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke(); // 1707 Union flag (no St Patrick's saltire)
  g.fillStyle = '#f4f2ee'; g.fillRect(w * 0.42, 0, w * 0.16, h); g.fillRect(0, h * 0.37, w, h * 0.26); g.fillStyle = '#c8202a'; g.fillRect(w * 0.45, 0, w * 0.1, h); g.fillRect(0, h * 0.41, w, h * 0.18); PT.modulate(g, w, h, (u, v) => 0.86 + 0.16 * PT.fbm(u, v, 4, 2, 3, 3)); }
function bannerTex(g, w, h) { g.fillStyle = '#efe4c8'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.18 * PT.fbm(u, v, 6, 2, 3, 5)); txt(g, 'GIVE US OUR', w / 2, h * 0.32, w * 0.86, h * 0.34, { col: '#2b1d4a', font: BIG }); txt(g, 'ELEVEN DAYS', w / 2, h * 0.72, w * 0.9, h * 0.38, { col: '#b8323a', font: BIG }); }
function redTex(g, w, h) { g.fillStyle = '#b8222a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.84 + 0.2 * PT.fbm(u, v, 3, 6, 3, 9)); g.fillStyle = 'rgba(255,220,120,0.5)'; g.fillRect(0, h * 0.06, w, h * 0.025); g.fillRect(0, h * 0.91, w, h * 0.025); }
function facadeTex(g, w, h) { g.fillStyle = '#8a4a40'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.88 + 0.16 * PT.fbm(u, v, 6, 3, 3, 4));
  const cols = 12; for (let r = 0; r < 3; r++) for (let c = 0; c < cols; c++) { const x = (c + 0.5) * w / cols, y = h * (0.22 + r * 0.27); g.fillStyle = '#e8dcc8'; g.fillRect(x - w / cols * 0.42, y - h * 0.11, w / cols * 0.84, h * 0.22); const lit = ((c * 7 + r * 3) % 5) < 2; g.fillStyle = lit ? '#ffd27a' : '#1e2440'; g.beginPath(); g.moveTo(x - w / cols * 0.26, y + h * 0.08); g.lineTo(x - w / cols * 0.26, y - h * 0.05); g.arc(x, y - h * 0.05, w / cols * 0.26, Math.PI, 0); g.lineTo(x + w / cols * 0.26, y + h * 0.08); g.fill(); }
  for (let c = 0; c <= cols; c++) { g.fillStyle = '#f2ead8'; g.fillRect(c * w / cols - 4, 0, 8, h); } g.fillStyle = '#f2ead8'; g.fillRect(0, 0, w, h * 0.05); g.fillRect(0, h * 0.94, w, h * 0.06); }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.white = vc(); m.paint = vc(); m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 8, seed: 51 })) }); m.dark = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#4a2e1e', n: 6, seed: 33 })) });
  m.tile = vc({ map: T(512, 512, tileTex) }); m.tile.map.wrapS = m.tile.map.wrapT = THREE.RepeatWrapping;
  m.plaster = vc({ map: T(512, 512, plainTex('#d8b078', 0.16, 7)) }); m.plasterN = vc({ map: T(512, 512, plainTex('#c8b8a0', 0.14, 8)) });
  m.checker = vc({ map: T(512, 512, checkerTex) }); m.checker.map.wrapS = m.checker.map.wrapT = THREE.RepeatWrapping;
  m.damask = vc({ map: T(256, 256, damaskTex) }); m.damask.map.wrapS = m.damask.map.wrapT = THREE.RepeatWrapping;
  m.marble = vc({ map: T(256, 256, plainTex('#ece4d8', 0.12, 12)) }); m.stoneW = vc({ map: T(256, 256, (g, w, h) => PT.stone(g, w, h, { base: '#8a8a90', n: 5, seed: 71 })) });
  m.grid = toon({ map: T(512, 512, gridTex), emissive: 0x0a1a40 }); m.grid.emissiveMap = m.grid.map; m.grid.map.wrapS = m.grid.map.wrapT = THREE.RepeatWrapping;
  m.brickA = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#9a4434', rows: 30, cols: 7, seed: 61 })) }); m.brickB = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#7a4a3a', rows: 30, cols: 7, seed: 62 })) }); m.brickC = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#a86a4a', rows: 30, cols: 7, seed: 63 })) });
  m.cobble = vc({ map: T(512, 512, (g, w, h) => PT.stone(g, w, h, { base: '#7a7480', n: 9, seed: 17 })) }); m.cobble.map.wrapS = m.cobble.map.wrapT = THREE.RepeatWrapping;
  m.snow = vc({ map: T(256, 256, plainTex('#e8eef8', 0.1, 4)), emissive: 0x1a2030 }); m.snow.map.wrapS = m.snow.map.wrapT = THREE.RepeatWrapping;
  m.shing = vc({ map: T(256, 256, (g, w, h) => PT.shingles(g, w, h, { base: '#4a3a4a', n: 12, seed: 51 })) });
  m.winLit = new THREE.MeshBasicMaterial({ map: T(128, 192, winTex({ a: '#ffe08a', b: '#ff9a40', lit: 1 })), fog: false }); m.winLit.color.setScalar(1.12);
  m.winDark = toon({ map: T(128, 192, winTex({ a: '#2a3a6a', b: '#141c3a' })), emissive: 0x0a0e20 }); m.winDark.emissiveMap = m.winDark.map;
  m.winSun = toon({ map: T(128, 192, winTex({ a: '#ffe8c0', b: '#f0a860', frame: '#e8dcc8' })), emissive: 0x6a4020 }); m.winSun.emissiveMap = m.winSun.map;
  m.nightSky = new THREE.MeshBasicMaterial({ map: T(256, 384, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a1030'); gr.addColorStop(1, '#2a3a7a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = PT.rng(4); for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,255,240,${0.4 + R() * 0.6})`; g.fillRect(R() * w, R() * h * 0.7, 2, 2); } g.fillStyle = '#fff4d0'; g.beginPath(); g.arc(w * 0.65, h * 0.3, 26, 0, TAU); g.fill(); g.fillStyle = '#1a2450'; g.beginPath(); g.arc(w * 0.69, h * 0.27, 24, 0, TAU); g.fill(); }), fog: false });
  m.daySky = new THREE.MeshBasicMaterial({ map: T(256, 384, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7ab0e8'); gr.addColorStop(1, '#ffe0b0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.8)'; for (const [x, y, r] of [[0.3, 0.3, 30], [0.42, 0.28, 24], [0.7, 0.5, 26]]) { g.beginPath(); g.arc(w * x, h * y, r, 0, TAU); g.fill(); } g.fillStyle = '#d8a070'; g.fillRect(0, h * 0.75, w, h * 0.25); for (let i = 0; i < 6; i++) { g.fillStyle = ['#c87a5a', '#e0b080', '#b86a4a'][i % 3]; g.fillRect(i * w / 6, h * (0.62 + (i % 3) * 0.04), w / 6 - 4, h); } }), fog: false });
  m.leaf = vc(); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.metal = vc({ emissive: 0x0c0c12 }); m.brass = vc({ emissive: 0x3a2408 });
  m.gold = toon({ color: 0xd8a83a, emissive: 0x4a3008 }); m.red = toon({ color: 0xb02a30, emissive: 0x200408 }); m.cream = toon({ color: 0xf2e8d0, emissive: 0x2a2418, side: THREE.DoubleSide });
  m.sunBall = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc040).multiplyScalar(1.4), fog: false }); m.earth = toon({ map: T(256, 128, (g, w, h) => { g.fillStyle = '#2a6ab0'; g.fillRect(0, 0, w, h); const R = PT.rng(3); g.fillStyle = '#4a9a4a'; for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(R() * w, h * (0.2 + R() * 0.6), 10 + R() * 30, 6 + R() * 16, R(), 0, TAU); g.fill(); } g.fillStyle = '#f2f2f6'; g.fillRect(0, 0, w, h * 0.08); g.fillRect(0, h * 0.92, w, h * 0.08); }), emissive: 0x0a1a30 });
  m.orbit = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x9ac8ff), transparent: true, opacity: 0.7, fog: false });
  m.tablet = em(T(384, 512, tabletTex), 0x141010); m.clock = new THREE.MeshBasicMaterial({ map: T(512, 512, clockTex), transparent: true, fog: false }); m.clock.color.setScalar(0.95);
  m.strip = em(T(1024, 160, stripTex), 0x1a1a24, { side: THREE.DoubleSide }); m.map = em(T(1024, 680, mapTex), 0x0c0a08);
  m.oct = em(T(512, 600, monthTex({ title: 'OCTOBER 1582', first: 1, days: [1, 2, 3, 4, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31], mark: new Set([4, 15]), gap: [4.5, 0], gapLabel: '5–14' })), 0x18140e, { side: THREE.DoubleSide });
  m.sep = em(T(512, 600, monthTex({ title: 'SEPTEMBER 1752', first: 2, days: [1, 2, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30], mark: new Set([2, 14]), gap: [3.5, 0], gapLabel: '3–13' })), 0x18140e, { side: THREE.DoubleSide });
  m.pages = Array.from({ length: 10 }, (_, i) => { const x = em(T(160, 220, pageTex(5 + i)), 0x2a2418, { side: THREE.DoubleSide }); return x; });
  m.years = [[1600, 1], [1700, 0], [1800, 0], [1900, 0], [2000, 1]].map(([y, ok]) => em(T(256, 200, yearTex(y, ok)), 0x1a1010));
  m.union = em(T(256, 160, unionTex), 0x101828, { side: THREE.DoubleSide }); m.banner = em(T(1024, 256, bannerTex), 0x201810, { side: THREE.DoubleSide }); m.redCloth = em(T(128, 512, redTex), 0x200608, { side: THREE.DoubleSide });
  m.facade = vc({ map: T(1024, 256, facadeTex) });
  m.skyline = new THREE.MeshBasicMaterial({ map: T(1024, 256, skylineTex), transparent: true, depthWrite: false, fog: false });
  m.hillsW = new THREE.MeshBasicMaterial({ map: T(1024, 256, hillsTex([[0.5, '#c88a7a', 0.05], [0.66, '#a86a6a', 0.06]])), transparent: true, fog: false, depthWrite: false });
  m.parch = em(T(400, 760, (g, w, h) => { g.fillStyle = '#efe2c0'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * PT.fbm(u, v, 5, 5, 3, 6)); txt(g, 'INTER', w / 2, h * 0.08, w * 0.8, h * 0.06, { col: '#8a1a22', font: SERIF }); txt(g, 'GRAVISSIMAS', w / 2, h * 0.15, w * 0.86, h * 0.06, { col: '#8a1a22', font: SERIF });
    const R = PT.rng(5); g.strokeStyle = 'rgba(40,30,50,0.75)'; g.lineWidth = 3; for (let i = 0; i < 22; i++) { const y = h * (0.24 + i * 0.03); let x = w * 0.1; g.beginPath(); g.moveTo(x, y); while (x < w * (0.82 + R() * 0.08)) { const s = 6 + R() * 10; g.quadraticCurveTo(x + s / 2, y - 5 - R() * 6, x + s, y); x += s + (R() < 0.15 ? 9 : 0); if (R() < 0.15) g.moveTo(x, y); } g.stroke(); }
    txt(g, 'ANNO MDLXXXII', w / 2, h * 0.94, w * 0.6, h * 0.035, { col: '#3a2a3a', font: SERIF }); g.fillStyle = '#b8222a'; g.beginPath(); g.arc(w * 0.78, h * 0.93, 26, 0, TAU); g.fill(); }), 0x1c1408, { side: THREE.DoubleSide });
  const sign = (lines, o, w = 512, h = 160) => em(T(w, h, signTex(lines, o)), 0x201810, { side: THREE.DoubleSide });
  m.signs = { almanack: sign(['ALMANACKS', '& PRINTS'], { bg: '#2a4a3a', col: '#f2e8c0', rim: '#d8b060' }, 512, 200), inn: sign(['THE BELL INN'], { bg: '#5a2a2a', col: '#f2e0b0', rim: '#d8b060' }, 512, 180), year: sign(['1752'], { bg: '#f2e8cc' }, 256, 140),
    kioskOct: sign(['25', 'OCTOBER'], { bg: '#f6eedc', col: '#2b1d4a', rim: '#b8323a' }, 360, 400), kioskNov: sign(['7', 'NOVEMBER'], { bg: '#f6eedc', col: '#b8323a', rim: '#b8323a' }, 360, 400),
    yearCnt: null };
  m.lampPost = vc({ emissive: 0x08080c });
  m.lampGlass = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe0a0).multiplyScalar(1.8), fog: false });
  m.coal = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff7a30).multiplyScalar(1.3), fog: false });
  return m; }

// ---------------------------------------------------------------- shared pieces
const prism = (w, h, d) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); g.computeVertexNormals(); return g; };
function candle(root, K, x, y, z, s = 1) { K.put(M.brass, cyl(0.06 * s, 0.08 * s, 0.03 * s, 12), x, y + 0.015 * s, z, 0, 0, 0, 1, 1, 1, 0xc89a3a); K.put(M.white, cyl(0.022 * s, 0.022 * s, 0.16 * s, 8), x, y + 0.11 * s, z, 0, 0, 0, 1, 1, 1, 0xd8ccb0);
  const fl = nond(mesh(root, plane(0.05 * s, 0.09 * s), H.M.flame, x, y + 0.23 * s, z, 0, 0, 0, false)); return { fl, gl: glowAt(root, [x, y + 0.23 * s, z], 0.36 * s, '#ffc870', 0.38) }; }
// numbered pages that fly out of a point (p0) when tick sets u: 0..1
function flyPages(root, p0, spread = 1) { const R = PT.rng(1582), P = []; for (let i = 0; i < 10; i++) { const m = mesh(root, plane(0.16, 0.22), M.pages[i], ...p0, 0, 0, 0, false); m.visible = false; nond(m); m.renderOrder = 3; P.push({ m, a: R() * TAU, r: (0.6 + R() * 0.9) * spread, up: (0.7 + R() * 0.9) * spread, sp: (R() - 0.5) * 9, d: i * 0.055, z: (0.3 + R() * 0.8) * spread }); } return { P, p0 }; }
function tickPages(fp, u) { if (!fp) return; fp.P.forEach((p) => { const t = Math.max(0, Math.min(1, (u - p.d) / 0.45)); p.m.visible = t > 0.001 && t < 0.999; if (!p.m.visible) return; const e = 1 - (1 - t) * (1 - t);
  p.m.position.set(fp.p0[0] + Math.cos(p.a) * p.r * e, fp.p0[1] + p.up * e + 0.25 * Math.sin(t * Math.PI), fp.p0[2] + p.z * e); p.m.rotation.set(t * p.sp * 0.5, t * p.sp, t * p.sp * 0.3); p.m.scale.setScalar(1 - 0.3 * Math.max(0, (t - 0.7) / 0.3)); }); }
function house(root, K, o) { const { x, z, w, d, h, wall, face = 'front', R, lit = 0.5, door = true } = o; K.at(x, 0, z, face === 'front' ? 0 : face * Math.PI / 2, () => {
  K.box(wall, -w / 2, w / 2, 0, h, -d / 2, d / 2, 0xffffff, 0.02); K.box(M.white, -w / 2 - 0.05, w / 2 + 0.05, h - 0.12, h + 0.06, -d / 2 - 0.05, d / 2 + 0.08, 0xf2ece0, 0.02); K.box(M.stoneW, -w / 2 - 0.02, w / 2 + 0.02, 0, 0.35, -d / 2 - 0.02, d / 2 + 0.03, 0x8a8a90, 0.02);
  K.put(M.shing, prism(w + 0.3, h * 0.3, d + 0.3), 0, h + 0.05, 0, 0, Math.PI / 2 * 0, 0, 1, 1, 1, 0x5a4a5a); K.box(M.brickB, w * 0.25, w * 0.25 + 0.4, h, h + h * 0.4, -0.2, 0.2, 0x8a4a3a, 0.02);
  const rows = Math.max(1, Math.round((h - 0.4) / 1.25)), cols = Math.max(2, Math.round(w / 1.1));
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const wx = -w / 2 + (c + 0.5) * w / cols, wy = 1.0 + r * 1.2; if (door && r === 0 && Math.abs(wx) < w / cols * 0.6) continue; if (wy + 0.5 > h - 0.1) continue;
    K.put(R() < lit ? M.winLit : M.winDark, plane(0.5, 0.8), wx, wy, d / 2 + 0.012, 0, 0, 0, 1, 1, 1); K.box(M.white, wx - 0.3, wx + 0.3, wy - 0.46, wy - 0.4, d / 2, d / 2 + 0.06, 0xf2ece0, 0.01); }
  if (door) { K.box(M.paint, -0.36, 0.36, 0.3, 2.1, d / 2, d / 2 + 0.05, [0x2a2a3a, 0x2a4a3a, 0x5a2a2a][(R() * 3) | 0], 0.01); K.box(M.white, -0.5, 0.5, 2.1, 2.26, d / 2, d / 2 + 0.09, 0xf2ece0, 0.01); K.box(M.stoneW, -0.6, 0.6, 0, 0.3, d / 2, d / 2 + 0.4, 0x9a9690, 0.02); } }); }
function tree(K, x, z, s, R, col = 0x3f6a34) { K.beam(M.bark, [x, 0, z], [x + 0.2 * s, 2.6 * s, z], 0.22 * s, 0x4a3a34, true, 7); for (let i = 0; i < 7; i++) K.put(M.leaf, lumpGeo(i + 7, 1, 0.25), x + (R() - 0.5) * 2.6 * s, (2.9 + R() * 1.3) * s, z + (R() - 0.5) * 2 * s, 0, R() * 6, 0, (1.0 + R() * 0.4) * s, (0.8 + R() * 0.3) * s, (0.9 + R() * 0.4) * s, [col, 0x4a8a3a, 0x356a2e][i % 3]); }
function lampPost(root, K, x, z, h = 2.8) { K.beam(M.lampPost, [x, 0, z], [x, h, z], 0.05, 0x1e1c24, true, 6); mesh(root, cyl(0.1, 0.12, 0.28, 6), M.lampGlass, x, h + 0.18, z, 0, 0, 0, false); K.put(M.lampPost, new THREE.ConeGeometry(0.18, 0.16, 6), x, h + 0.4, z, 0, 0, 0, 1, 1, 1, 0x1e1c24); return glowAt(root, [x, h + 0.2, z], 1.4, '#ffc870', 0.5); }

// ================================================================= BEDROOM (Rome, October 1582)
function buildBed(root) { const R = PT.rng(1582), K = new Kit(), X = 3.4, ZB = -3.4, HT = 3.2;
  mesh(root, planeUV(8, 8, 4, 4), M.tile, 0, 0, -0.5, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  K.box(M.plaster, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(M.plaster, s * X - 0.1, s * X + 0.1, 0, HT, ZB, 3, 0xf0e0c8, 0.01);
  K.box(M.dark, -X, X, HT, HT + 0.12, ZB, 3, 0x4a2e1e, 0.01); for (let i = 0; i < 6; i++) K.box(M.dark, -X, X, HT - 0.22, HT, ZB + 0.4 + i * 1.1, ZB + 0.62 + i * 1.1, 0x5a3624, 0.02);
  K.box(M.dark, -X, X, 0, 0.14, ZB, ZB + 0.05, 0x4a2e1e, 0.01);
  // window in the back wall (x = 1.7): shutters open, sky plane behind (night or day material swapped by the mood)
  const sky = mesh(root, plane(1.3, 1.7), M.nightSky, 1.7, 1.75, ZB - 0.15, 0, 0, 0, false); nond(sky);
  K.box(M.dark, 0.98, 2.42, 0.85, 0.95, ZB, ZB + 0.18, 0x5a3624, 0.01); K.box(M.dark, 0.98, 2.42, 2.55, 2.65, ZB, ZB + 0.12, 0x5a3624, 0.01); for (const s of [-1, 1]) K.box(M.dark, 1.7 + s * 0.72 - 0.05, 1.7 + s * 0.72 + 0.05, 0.9, 2.6, ZB, ZB + 0.12, 0x5a3624, 0.01); K.box(M.dark, 1.66, 1.74, 0.9, 2.6, ZB - 0.02, ZB + 0.06, 0x5a3624, 0.01);
  for (const s of [-1, 1]) K.at(1.7 + s * 1.05, 1.75, ZB + 0.25, s * 0.6, () => K.box(M.paint, -0.32, 0.32, -0.8, 0.8, -0.03, 0.03, 0x3a6a4a, 0.01));
  // the bed (four-poster with a red canopy), headboard against the back wall at x = -1.3
  K.at(-1.35, 0, -2.2, 0, () => { K.box(M.dark, -0.95, 0.95, 0.3, 0.55, -1.1, 1.1, 0x5a3624, 0.03); K.box(M.white, -0.9, 0.9, 0.55, 0.78, -1.05, 1.05, 0xf2ece0, 0.08);
    K.box(M.paint, -0.94, 0.94, 0.62, 0.82, -0.2, 1.12, 0xa8323a, 0.08); K.box(M.paint, -0.94, 0.94, 0.72, 0.84, -0.25, -0.05, 0xc8424a, 0.06);
    K.put(M.white, sph(1, 14, 10), -0.38, 0.9, -0.78, 0, 0, 0, 0.32, 0.12, 0.2, 0xf6f2ea); K.put(M.white, sph(1, 14, 10), 0.38, 0.9, -0.78, 0, 0, 0, 0.32, 0.12, 0.2, 0xf6f2ea);
    K.box(M.dark, -0.95, 0.95, 0.55, 1.7, -1.15, -1.05, 0x4a2e1e, 0.03); for (const [x, z] of [[-0.95, -1.1], [0.95, -1.1], [-0.95, 1.1], [0.95, 1.1]]) K.put(M.dark, cyl(0.05, 0.06, 2.6, 8), x, 1.3, z, 0, 0, 0, 1, 1, 1, 0x5a3624);
    K.box(M.paint, -1.02, 1.02, 2.55, 2.75, -1.17, 1.17, 0x8a2a30, 0.03); for (const s of [-1, 1]) K.box(M.paint, s * 1.0 - 0.04, s * 1.0 + 0.04, 1.5, 2.6, -1.15, -0.5, 0x9a2a34, 0.03); });
  // nightstand (PAGEY stands on it), a candle; a chest at the foot; a chair with clothes; a wash basin; a painting; a rug
  K.box(M.dark, 0.15, 0.85, 0, 0.66, -3.15, -2.55, 0x5a3624, 0.03); K.box(M.dark, 0.1, 0.9, 0.66, 0.72, -3.2, -2.5, 0x6a4430, 0.02);
  const cn = candle(root, K, 0.78, 0.72, -3.0, 1.0);
  K.box(M.dark, -2.1, -0.6, 0, 0.5, -0.65, -0.2, 0x6a4430, 0.04); K.box(M.brass, -1.45, -1.25, 0.25, 0.4, -0.2, -0.18, 0xc89a3a, 0.01);
  K.at(2.4, 0, -1.4, -0.6, () => { K.box(M.dark, -0.25, 0.25, 0.44, 0.5, -0.25, 0.25, 0x5a3624, 0.02); K.box(M.dark, -0.25, 0.25, 0.5, 1.1, -0.27, -0.21, 0x5a3624, 0.02); for (const [x, z] of [[-0.21, -0.21], [0.21, -0.21], [-0.21, 0.21], [0.21, 0.21]]) K.box(M.dark, x - 0.03, x + 0.03, 0, 0.44, z - 0.03, z + 0.03, 0x4a2e1e, 0.01); K.box(M.paint, -0.26, 0.26, 0.5, 0.98, -0.2, -0.16, 0x3a4a7a, 0.04); });
  K.put(M.paint, cyl(0.2, 0.12, 0.12, 16), 2.9, 0.9, -2.9, 0, 0, 0, 1, 1, 1, 0xc8c0b0); K.box(M.dark, 2.65, 3.15, 0, 0.84, -3.15, -2.65, 0x5a3624, 0.02); K.put(M.paint, cyl(0.07, 0.09, 0.26, 12), 2.95, 1.0, -2.75, 0, 0, 0, 1, 1, 1, 0xb07a4a);
  K.box(M.brass, -0.55, 0.05, 1.55, 2.25, ZB, ZB + 0.04, 0xb08a3a, 0.01); K.put(M.paint, plane(0.5, 0.6), -0.25, 1.9, ZB + 0.045, 0, 0, 0, 1, 1, 1, 0x5a7a9a);
  mesh(root, plane(2.4, 1.6), H.toon({ color: 0x8a3a4a, emissive: 0x1a0810 }), -0.4, 0.012, -0.3, -Math.PI / 2, 0, 0, false);
  K.build(root, 0);
  const shaft = shaftAt(root, [1.4, 1.3, -1.6], 1.6, 3.6, -0.5, 0.5, 0.0, 0xffe0b0);
  const pages = flyPages(root, [0.55, 1.15, -2.75], 1.1);
  const dust = motes(root, 60, [-2, 2.5, 0.3, 2.6, -3, 0.5], 82, 0.01);
  return { sky, cn, shaft, pages, dust }; }

// ================================================================= COSMOS (blueprint theory space)
function counterTex() { const c = document.createElement('canvas'); c.width = 512; c.height = 200; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; let last = null;
  return { t, draw(v) { if (v === last) return; last = v; const g = c.getContext('2d'); g.fillStyle = '#1a1424'; g.fillRect(0, 0, 512, 200); g.strokeStyle = '#d8b048'; g.lineWidth = 10; g.strokeRect(5, 5, 502, 190);
    txt(g, 'YEAR', 256, 38, 300, 34, { col: '#d8b048', font: BIG }); const s = String(v); for (let i = 0; i < s.length; i++) { const x = 256 + (i - (s.length - 1) / 2) * 92; g.fillStyle = '#f6eedc'; g.fillRect(x - 40, 66, 80, 118); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x - 40, 124, 80, 4); txt(g, s[i], x, 128, 70, 96, { col: '#2b1d4a', font: BIG }); }
    t.needsUpdate = true; } }; }
function buildCosmos(root) { const R = PT.rng(325), K = new Kit();
  const fl = mesh(root, planeUV(60, 60, 12, 12), M.grid, 0, 0, -10, -Math.PI / 2, 0, 0, false); fl.receiveShadow = true;
  // the Sun + orbit + Earth (orbit flat at y = 2.3, centre (0, 2.3, -7))
  const SC = [0, 2.6, -8]; const sun = nond(mesh(root, sph(0.9, 28, 20), M.sunBall, ...SC, 0, 0, 0, false)); const sgl = glowAt(root, SC, 5.5, '#ffb040', 0.8);
  const ring = nond(mesh(root, tor(3.2, 0.018, 4, 120), M.orbit, SC[0], SC[1], SC[2], Math.PI / 2, 0, 0, false));
  const earthG = new THREE.Group(); root.add(earthG); const earth = mesh(earthG, sph(0.32, 24, 18), M.earth, 0, 0, 0, 0, 0, 0.4, false); const egl = glowAt(earthG, [0, 0, 0], 1.0, '#8ac8ff', 0.35);
  // the Julian tablet (left) and a big clock (right): sub-group gT (shown for 'culprit'); the strip + counter: gS (shown for 'drift')
  const gT = new THREE.Group(), gS = new THREE.Group(), gL = new THREE.Group(); root.add(gT, gS, gL); const KT = new Kit(), KS = new Kit(), KL = new Kit();
  KT.box(M.stoneW, -4.1, -2.3, 0, 0.3, -3.4, -2.6, 0x8a8a94, 0.04); mesh(gT, plane(1.5, 2.0), M.tablet, -3.2, 1.35, -2.92, 0, 0.25, 0, true); KT.at(-3.2, 0, -3.05, 0.25, () => KT.box(M.stoneW, -0.82, 0.82, 0.3, 2.42, -0.12, 0.08, 0x9a9488, 0.06));
  KT.beam(M.metal, [3.0, 0, -3.0], [3.0, 1.6, -3.0], 0.06, 0x3a3a4a, true, 8); KT.at(3.0, 2.35, -3.0, -0.25, () => { KT.put(M.brass, cyl(0.86, 0.86, 0.14, 40), 0, 0, -0.08, Math.PI / 2, 0, 0, 1, 1, 1, 0xc89a3a); });
  const clk = new THREE.Group(); clk.position.set(3.0, 2.35, -3.0); clk.rotation.y = -0.25; gT.add(clk); nond(mesh(clk, plane(1.56, 1.56), M.clock, 0, 0, 0.002, 0, 0, 0, false));
  const handMat = H.toon({ color: 0x2b1d4a, emissive: 0x100818 }); const hMin = new THREE.Group(); clk.add(hMin); mesh(hMin, new THREE.BoxGeometry(0.04, 0.62, 0.02), handMat, 0, 0.28, 0.03, 0, 0, 0, false); const hHr = new THREE.Group(); clk.add(hHr); mesh(hHr, new THREE.BoxGeometry(0.06, 0.4, 0.02), handMat, 0, 0.17, 0.04, 0, 0, 0, false); mesh(clk, cyl(0.05, 0.05, 0.04, 12), M.gold, 0, 0, 0.05, Math.PI / 2, 0, 0, false);
  // March strip (z = -1.2, y 1.0..1.5) with the fixed MARCH 21 pin and the sliding equinox sun + Easter egg
  const strip = mesh(gS, plane(6.8, 1.06), M.strip, 0, 1.1, -1.4, 0, 0, 0, false); KS.box(M.metal, -3.5, 3.5, 0.5, 0.58, -1.46, -1.36, 0x3a3a4a, 0.02); for (const x of [-3.3, 3.3]) KS.beam(M.metal, [x, 0, -1.42], [x, 0.58, -1.42], 0.04, 0x3a3a4a, true, 6);
  const cellX = (d) => -3.4 + (d - 8 + 0.5) * 6.8 / 17;
  const pin = new THREE.Group(); pin.position.set(cellX(21), 1.72, -1.36); gS.add(pin); mesh(pin, new THREE.ConeGeometry(0.1, 0.22, 12), M.red, 0, 0, 0, Math.PI, 0, 0, false);
  const mark = new THREE.Group(); mark.position.set(cellX(21), 2.05, -1.3); gS.add(mark); nond(mesh(mark, sph(0.14, 18, 12), M.sunBall, 0, 0.12, 0, 0, 0, 0, false)); const mgl = glowAt(mark, [0, 0.12, 0], 0.9, '#ffc040', 0.6);
  const egg = mesh(mark, sph(0.1, 20, 14), H.toon({ map: H.mkTex(128, 128, (g, w, h) => { g.fillStyle = '#f2b0d8'; g.fillRect(0, 0, w, h); g.fillStyle = '#7ac8f0'; g.fillRect(0, h * 0.4, w, h * 0.16); g.fillStyle = '#ffe070'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc((i + 0.5) * w / 6, h * 0.25, 6, 0, TAU); g.fill(); g.beginPath(); g.arc((i + 0.5) * w / 6, h * 0.72, 6, 0, TAU); g.fill(); } }), emissive: 0x2a1020 }), 0.3, 0.1, 0.05, 0, 0, 0, true); egg.scale.set(1, 1.3, 1);
  // year counter board above the strip
  const cnt = counterTex(); const cm = H.toon({ map: cnt.t, emissive: 0x2a2018 }); cm.emissiveMap = cnt.t; const cboard = mesh(gS, plane(1.9, 0.74), cm, 0, 3.0, -1.6, 0, 0, 0, false); KS.box(M.brass, -1.0, 1.0, 2.6, 3.4, -1.66, -1.62, 0xb08a3a, 0.02); cnt.draw(325);
  // five century plinths (z = +3.5, x -3.2..3.2) for the leap rule
  const blocks = []; for (let i = 0; i < 5; i++) { const x = -3.0 + i * 1.5; KL.box(M.marble, x - 0.45, x + 0.45, 0, 0.42, 2.95, 3.55, 0xd8d0c4, 0.04); KL.box(M.gold, x - 0.5, x + 0.5, 0.42, 0.47, 2.9, 3.6, 0xc89a3a, 0.02); const b = new THREE.Group(); b.position.set(x, 0.47, 3.25); gL.add(b); mesh(b, new THREE.BoxGeometry(1.3, 1.0, 0.3), [M.marble, M.marble, M.marble, M.marble, M.years[i], M.marble].map((m) => m === M.marble ? H.toon({ color: 0xe8e0d4, emissive: 0x2a2620 }) : m), 0, 0.5, 0, 0, 0, 0, true); b.scale.setScalar(0.001); blocks.push(b); }
  // decorative far rings + stars (motes) and a few floating 'gear' rings
  for (let i = 0; i < 3; i++) nond(mesh(root, tor(9 + i * 5, 0.03, 4, 160), M.orbit, 0, 0.05, -8, Math.PI / 2, 0, 0, false)).material = M.orbit;
  K.build(root, 0); KT.build(gT, 0); KS.build(gS, 0); KL.build(gL, 0);
  const dust = motes(root, 120, [-8, 8, 0.3, 7, -16, 4], 83, 0.018);
  return { gT, gS, gL, sun, sgl, ring, earthG, SC, clk, hMin, hHr, pin, mark, mgl, cellX, cnt, blocks, dust }; }

// ================================================================= HALL (papal study, 1582)
function buildHall(root) { const R = PT.rng(1572), K = new Kit(), X = 5, ZB = -4.2, HT = 5;
  mesh(root, planeUV(12, 10, 6, 5), M.checker, 0, 0, -0.5, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  K.box(M.damask, -X, X, 1.0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); K.box(M.marble, -X, X, 0, 1.0, ZB, ZB + 0.08, 0xe8e0d4, 0.01); K.box(M.gold, -X, X, 0.98, 1.08, ZB, ZB + 0.12, 0xc89a3a, 0.01);
  for (const s of [-1, 1]) K.box(M.damask, s * X - 0.1, s * X + 0.1, 0, HT, ZB, 3, 0xffffff, 0.01); K.box(M.marble, -X, X, HT, HT + 0.3, ZB, 3, 0xe8e0d4, 0.01);
  // two arched windows in the back wall with sky + light shafts
  const winA = []; for (const x of [-2.6, 2.6]) { mesh(root, plane(1.3, 2.4), M.daySky, x, 2.9, ZB - 0.1, 0, 0, 0, false); K.box(M.marble, x - 0.8, x + 0.8, 1.6, 1.72, ZB, ZB + 0.25, 0xe8e0d4, 0.02); for (const s of [-1, 1]) K.box(M.marble, x + s * 0.7 - 0.1, x + s * 0.7 + 0.1, 1.6, 4.2, ZB, ZB + 0.2, 0xe8e0d4, 0.02); K.put(M.marble, tor(0.7, 0.1, 6, 20, Math.PI), x, 4.1, ZB + 0.1, 0, 0, 0, 1, 1, 1, 0xe8e0d4); winA.push(x); }
  // a tall tapestry/parchment on a stand (centre back): INTER GRAVISSIMAS
  K.box(M.dark, -0.95, 0.95, 0, 0.12, -3.6, -3.3, 0x4a2e1e, 0.02); for (const s of [-1, 1]) K.beam(M.gold, [s * 0.85, 0, -3.45], [s * 0.85, 3.6, -3.45], 0.04, 0xc89a3a, true, 8); K.beam(M.gold, [-0.95, 3.55, -3.42], [0.95, 3.55, -3.42], 0.05, 0xc89a3a, true, 8);
  const parch = mesh(root, plane(1.5, 2.85), M.parch, 0, 2.08, -3.4, 0, 0, 0, true);
  // the desk with the bull (scroll), an inkwell, a quill, books; papal chair behind
  K.box(M.dark, -1.4, 1.4, 0.76, 0.84, -1.8, -0.8, 0x5a2e1e, 0.03); K.box(M.dark, -1.35, 1.35, 0.1, 0.76, -1.75, -0.85, 0x4a2618, 0.03); K.box(M.gold, -1.42, 1.42, 0.82, 0.86, -0.82, -0.78, 0xc89a3a, 0.01);
  K.box(M.paint, -1.2, -0.7, 0.84, 1.0, -1.7, -1.3, 0x7a2a2a, 0.01); K.box(M.paint, -1.15, -0.75, 1.0, 1.1, -1.65, -1.35, 0x2a4a6a, 0.01); K.put(M.paint, cyl(0.05, 0.06, 0.08, 12), 0.95, 0.88, -1.35, 0, 0, 0, 1, 1, 1, 0x1a1a2a);
  mesh(root, plane(0.7, 0.5), M.parch, 0.0, 0.845, -1.25, -Math.PI / 2, 0, 0.06, false); K.put(M.cream, cyl(0.035, 0.035, 0.74, 10), 0.0, 0.88, -1.52, 0, 0, Math.PI / 2, 1, 1, 1, 0xf2e8d0);
  K.at(0, 0, -2.4, 0, () => { K.box(M.paint, -0.5, 0.5, 0.45, 0.55, -0.35, 0.35, 0x9a2a30, 0.04); K.box(M.gold, -0.5, 0.5, 0.55, 1.9, -0.4, -0.3, 0xc89a3a, 0.04); K.box(M.paint, -0.42, 0.42, 0.6, 1.8, -0.3, -0.26, 0x9a2a30, 0.03); for (const s of [-1, 1]) K.box(M.gold, s * 0.5 - 0.05, s * 0.5 + 0.05, 0, 0.8, -0.35, 0.35, 0xc89a3a, 0.02); });
  // armillary sphere (right), globe (left), candelabra, bookshelves at the sides, a dog-ear pile of charts
  const arm = new THREE.Group(); arm.position.set(2.6, 1.55, -1.6); root.add(arm); K.beam(M.gold, [2.6, 0, -1.6], [2.6, 1.0, -1.6], 0.05, 0xc89a3a, true, 8); K.put(M.gold, cyl(0.3, 0.36, 0.06, 16), 2.6, 0.03, -1.6, 0, 0, 0, 1, 1, 1, 0xc89a3a);
  for (const [rx, ry] of [[0, 0], [Math.PI / 2, 0], [Math.PI / 2, Math.PI / 2], [0.41, 0]]) mesh(arm, tor(0.48, 0.02, 6, 48), M.gold, 0, 0, 0, rx, ry, 0, true); mesh(arm, sph(0.09, 14, 10), M.earth, 0, 0, 0, 0, 0, 0, true);
  K.put(M.paint, sph(0.36, 20, 14), -2.6, 1.3, -1.8, 0, 0, 0, 1, 1, 1, 0x5a8ab0); K.put(M.gold, tor(0.42, 0.02, 6, 40, Math.PI * 1.5), -2.6, 1.3, -1.8, 0, Math.PI / 2, 0, 1, 1, 1, 0xc89a3a); K.beam(M.dark, [-2.6, 0, -1.8], [-2.6, 0.92, -1.8], 0.05, 0x4a2e1e, true, 8);
  const cands = []; for (const [x, z] of [[-1.15, -0.95], [1.2, -1.05]]) { K.beam(M.gold, [x, 0.84, z], [x, 1.2, z], 0.025, 0xc89a3a, true, 6); for (const dx of [-0.14, 0, 0.14]) cands.push(candle(root, K, x + dx, 1.2 + (dx ? 0 : 0.06), z, 0.9)); }
  for (const s of [-1, 1]) { K.box(M.dark, s * 4.2 - 0.6, s * 4.2 + 0.6, 0, 3.4, -3.9, -3.4, 0x4a2e1e, 0.02); for (let r = 0; r < 5; r++) for (let i = 0; i < 9; i++) K.box(M.paint, s * 4.2 - 0.55 + i * 0.12, s * 4.2 - 0.45 + i * 0.12, 0.2 + r * 0.66, 0.66 + r * 0.66 - R() * 0.12, -3.85, -3.45, [0x7a2a2a, 0x2a4a6a, 0x5a6a2a, 0x8a6a2a, 0x4a2a5a][(i + r) % 5], 0.01); }
  K.build(root, 0);
  const shafts = winA.map((x) => shaftAt(root, [x * 0.8, 2.0, -2.2], 1.4, 4.4, 0, x > 0 ? 0.42 : -0.42, 0.2, 0xffe0b0));
  const pages = flyPages(root, [0.0, 1.0, -1.25], 1.4);
  const dust = motes(root, 90, [-3, 3, 0.4, 4, -3.5, 0.5], 84, 0.012);
  return { parch, arm, cands, shafts, pages, dust }; }

// ================================================================= MAP ROOM
function buildMap(root) { const R = PT.rng(1600), K = new Kit(), X = 4.5, ZB = -3.6, HT = 3.6;
  mesh(root, planeUV(10, 8, 5, 4), M.dark, 0, 0, -0.5, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  K.box(M.plasterN, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(M.plasterN, s * X - 0.1, s * X + 0.1, 0, HT, ZB, 3, 0xffffff, 0.01); K.box(M.dark, -X, X, 0, 0.9, ZB, ZB + 0.06, 0x5a3624, 0.01);
  // the map table (map top at y = 0.9, 3.0 x 2.0, centre z = -1.2)
  K.box(M.dark, -1.65, 1.65, 0.78, 0.88, -2.35, -0.05, 0x5a3624, 0.03); for (const [x, z] of [[-1.5, -2.2], [1.5, -2.2], [-1.5, -0.2], [1.5, -0.2]]) K.put(M.dark, cyl(0.07, 0.06, 0.78, 10), x, 0.39, z, 0, 0, 0, 1, 1, 1, 0x4a2e1e);
  const MW = 3.0, MD = 2.0, MZ = -1.2; mesh(root, plane(MW, MD), M.map, 0, 0.885, MZ, -Math.PI / 2, 0, 0, false);
  const toW = (lon, lat) => [(MAPX(lon) - 0.5) * MW, 0.89, MZ + (MAPY(lat) - 0.5) * MD];
  const pins = {}; for (const [k, r] of Object.entries(REG)) { const g = new THREE.Group(); g.position.set(...toW(...r.pin)); root.add(g); mesh(g, cyl(0.008, 0.008, 0.34, 6), M.metal, 0, 0.17, 0, 0, 0, 0, true).material = H.toon({ color: 0x3a3440 }); mesh(g, sph(0.022, 10, 8), M.gold, 0, 0.34, 0, 0, 0, 0, false);
    const fm = H.M.em(H.mkTex(256, 128, (gg, w, h) => { gg.fillStyle = r.col; gg.fillRect(0, 0, w, h); gg.fillStyle = 'rgba(255,255,255,0.18)'; gg.fillRect(0, 0, w, h * 0.2); txt(gg, r.name, w / 2, h * 0.56, w * 0.86, h * 0.5, { col: '#fff8e8', font: BIG, stroke: 'rgba(30,20,40,0.6)', sw: 6 }); }), 0x1a1418, { side: THREE.DoubleSide });
    mesh(g, plane(0.3, 0.15), fm, 0.15, 0.25, 0, 0, 0, 0, true); g.scale.setScalar(0.001); g.userData.k = 1.5; pins[k] = g; }
  // the wall calendar (October 1582) + a second on the right (September 1752 hidden until 'gb')
  K.box(M.dark, -0.95, 0.95, 1.25, 3.4, ZB, ZB + 0.06, 0x4a2e1e, 0.02); mesh(root, plane(1.7, 1.99), M.oct, 0, 2.32, ZB + 0.07, 0, 0, 0, false);
  // clutter: compasses, rolled charts, an hourglass, a lamp, a shelf of rolled maps, a candle
  for (let i = 0; i < 6; i++) K.put(M.cream, cyl(0.05, 0.05, 0.7, 10), -3.4 + R() * 0.3, 0.92 + i * 0.1, -3.2 + R() * 0.2, 0, R(), Math.PI / 2, 1, 1, 1, [0xf2e8d0, 0xe8d8b0][i % 2]); K.box(M.dark, -4.1, -2.6, 0, 0.9, -3.5, -2.9, 0x5a3624, 0.02);
  K.box(M.dark, 2.7, 4.3, 0, 1.6, -3.5, -2.9, 0x5a3624, 0.02); for (let i = 0; i < 9; i++) K.put(M.cream, cyl(0.06, 0.06, 0.5, 10), 2.9 + (i % 3) * 0.5, 0.35 + ((i / 3) | 0) * 0.45, -3.2, Math.PI / 2, 0, 0, 1, 1, 1, [0xf2e8d0, 0xe0d0a8, 0xead8b8][i % 3]);
  K.at(1.25, 0.88, -0.45, 0, () => { K.put(M.gold, cyl(0.07, 0.07, 0.02, 12), 0, 0.01, 0, 0, 0, 0, 1, 1, 1, 0xc89a3a); K.put(M.gold, cyl(0.07, 0.07, 0.02, 12), 0, 0.3, 0, 0, 0, 0, 1, 1, 1, 0xc89a3a); K.put(M.paint, new THREE.ConeGeometry(0.06, 0.14, 12), 0, 0.09, 0, Math.PI, 0, 0, 1, 1, 1, 0xd8c8a0); K.put(M.paint, new THREE.ConeGeometry(0.06, 0.14, 12), 0, 0.22, 0, 0, 0, 0, 1, 1, 1, 0xd8c8a0); });
  const cn = candle(root, K, -1.35, 0.88, -0.4, 1.3);
  K.build(root, 0);
  const shaft = shaftAt(root, [0, 2.6, -2.6], 2.4, 3.2, 0, 0.0, 0.12, 0x9ab0ff);
  const dust = motes(root, 70, [-2, 2, 0.9, 3, -3, 0.5], 85, 0.01);
  return { pins, cn, toW, dust }; }

// ================================================================= LONDON (September 1752, sunset)
function buildLondon(root) { const R = PT.rng(1752), K = new Kit();
  mesh(root, planeUV(16, 70, 4, 18), M.cobble, 0, 0, -24, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  for (const s of [-1, 1]) K.box(M.stoneW, s * 3.0 - 0.7, s * 3.0 + 0.7, 0, 0.1, -40, 6, 0x8a8690, 0.01);
  const walls = [M.brickA, M.brickB, M.brickC, M.brickA, M.brickC, M.brickB]; let z = 4;
  for (let i = 0; z > -32; i++) { const w = 3.4 + R() * 1.2, h = 6 + (i % 3) * 1.2 + R() * 0.6; z -= w / 2; for (const s of [-1, 1]) house(root, K, { x: s * 6.2, z, w, d: 5, h, wall: walls[(i * 2 + (s > 0)) % walls.length], face: -s, R, lit: 0.35 }); z -= w / 2 + 0.05; }
  // the almanack shop (left, z = -2): bay window with the September 1752 calendar, a hanging sign
  K.at(-3.68, 0, -2.2, Math.PI / 2, () => { K.box(M.paint, -1.2, 1.2, 0.4, 2.4, 0, 0.5, 0x2a4a3a, 0.03); K.put(M.winSun, plane(2.1, 1.6), 0, 1.45, 0.51, 0, 0, 0, 1, 1, 1); K.box(M.white, -1.25, 1.25, 2.4, 2.55, -0.05, 0.6, 0xf2ece0, 0.02); });
  mesh(root, plane(0.95, 1.1), M.sep, -3.12, 1.5, -2.6, 0, Math.PI / 2, 0, false); mesh(root, plane(0.55, 0.3), M.signs.year, -3.12, 1.5, -1.6, 0, Math.PI / 2, 0, false);
  K.beam(M.lampPost, [-3.7, 3.1, -0.4], [-2.7, 3.1, -0.4], 0.03, 0x1e1c24, true, 5); mesh(root, plane(1.0, 0.4), M.signs.almanack, -3.2, 2.76, -0.4, 0, Math.PI / 2, 0, false);
  K.beam(M.lampPost, [3.7, 3.2, -6.5], [2.7, 3.2, -6.5], 0.03, 0x1e1c24, true, 5); mesh(root, plane(1.0, 0.36), M.signs.inn, 3.2, 2.86, -6.5, 0, Math.PI / 2, 0, false);
  const flag = mesh(root, plane(1.1, 0.68), M.union, 2.9, 3.6, -3.4, 0, Math.PI / 2, 0, false); K.beam(M.wood, [3.7, 3.1, -3.4], [2.5, 3.9, -3.4], 0.03, 0x6a4a30, true, 5);
  // the banner across the street (hidden until ST.banner)
  const banner = new THREE.Group(); banner.position.set(0, 3.7, -7.2); root.add(banner); mesh(banner, plane(4.6, 1.15), M.banner, 0, 0, 0, 0, 0, 0, true); for (const s of [-1, 1]) K.beam(M.wood, [s * 3.7, 4.3, -7.2], [s * 2.3, 4.25, -7.2], 0.02, 0x4a3a2a, true, 4);
  const lamps = []; for (const [x, z2] of [[-2.4, 1.6], [2.4, -4.5], [-2.4, -10.5], [2.4, -16.5]]) lamps.push(lampPost(root, K, x, z2));
  for (const [x, z2] of [[2.0, 1.8], [2.2, 1.3], [-2.1, -5.2], [2.0, -9.2]]) K.put(M.wood, cyl(0.26, 0.24, 0.62, 12), x, 0.31, z2, 0, R() * 6, 0, 1, 1, 1, 0x8a5a38);
  K.at(1.9, 0, -12, -0.3, () => { K.box(M.wood, -0.7, 0.7, 0.45, 0.62, -0.4, 0.4, 0x6a4a30, 0.02); for (const s of [-1, 1]) K.put(M.wood, cyl(0.32, 0.32, 0.06, 14), s * 0.72, 0.32, -0.1, 0, 0, Math.PI / 2, 1, 1, 1, 0x5a3a24); });
  K.build(root, 12);
  const sky = mesh(root, plane(160, 34), M.skyline, 0, 9, -70, 0, 0, 0, false); sky.renderOrder = -1; nond(sky);
  const hills = mesh(root, plane(300, 50), M.hillsW, 0, 4, -110, 0, 0, 0, false); hills.renderOrder = -2; nond(hills);
  const dust = motes(root, 60, [-3, 3, 0.2, 3.5, -12, 3], 86, 0.014);
  return { flag, banner, lamps, dust }; }

// ================================================================= PETROGRAD (1917, snowy night)
function buildPetro(root) { const R = PT.rng(1917), K = new Kit();
  const gr = mesh(root, planeUV(80, 80, 10, 10), M.snow, 0, 0, -20, -Math.PI / 2, 0, 0, false); gr.receiveShadow = true;
  // the long palace facade (z = -26), a column with an angel-less plain top (generic), red banners
  K.box(M.facade, -30, 30, 0, 9, -30, -26, 0xffffff, 0.04); K.box(M.white, -30.4, 30.4, 9, 9.6, -30.4, -25.6, 0xe8dcc8, 0.04); for (let i = 0; i < 24; i++) K.put(M.white, sph(0.3, 10, 8), -28.8 + i * 2.5, 10.0, -25.9, 0, 0, 0, 1, 1.2, 1, 0xe8dcc8);
  K.box(M.facade, -4, 4, 0, 11, -26.2, -25.4, 0xffffff, 0.04); K.put(M.white, prism(8.4, 2.2, 1.2), 0, 11, -25.8, 0, 0, 0, 1, 1, 1, 0xe8dcc8);
  K.box(M.stoneW, -1.4, 1.4, 0, 1.6, -15.4, -12.6, 0x8a8a94, 0.06); K.put(M.marble, cyl(0.55, 0.65, 13, 20), 0, 8.1, -14, 0, 0, 0, 1, 1, 1, 0xc8b8b0); K.put(M.marble, cyl(0.9, 0.6, 0.6, 16), 0, 14.9, -14, 0, 0, 0, 1, 1, 1, 0xc8b8b0); K.put(M.gold, sph(0.5, 14, 10), 0, 15.6, -14, 0, 0, 0, 1, 1, 1, 0xd8a83a); K.beam(M.gold, [0, 15.6, -14], [0, 17.2, -14], 0.08, 0xd8a83a, true, 6); K.box(M.gold, -0.5, 0.5, 16.6, 16.75, -14.05, -13.95, 0xd8a83a, 0.0);
  const banners = []; for (const x of [-16, -9, 9, 16]) { const b = mesh(root, plane(1.6, 6), M.redCloth, x, 5.2, -25.3, 0, 0, 0, true); banners.push(b); }
  // the kiosk with the flip calendar (left foreground, x = -2.2, z = -1.8)
  K.at(-2.3, 0, -2.2, 0.35, () => { K.put(M.paint, cyl(0.85, 0.85, 2.6, 16), 0, 1.3, 0, 0, 0, 0, 1, 1, 1, 0x3a5a4a); K.put(M.paint, new THREE.ConeGeometry(1.05, 0.7, 16), 0, 2.95, 0, 0, 0, 0, 1, 1, 1, 0x2a3a3a); K.put(M.gold, sph(0.1, 10, 8), 0, 3.35, 0, 0, 0, 0, 1, 1, 1, 0xd8a83a); for (let i = 0; i < 6; i++) K.box(M.paint, -0.35 + (i % 3) * 0.24, -0.15 + (i % 3) * 0.24, 0.6 + ((i / 3) | 0) * 0.7, 1.15 + ((i / 3) | 0) * 0.7, 0.83, 0.86, [0xe8dcc8, 0xd8c8b0, 0xc8b8a0][i % 3], 0.0); });
  const cal = new THREE.Group(); cal.position.set(-2.3 + Math.sin(0.35) * 0.9, 2.15, -2.2 + Math.cos(0.35) * 0.9); cal.rotation.y = 0.35; root.add(cal);
  const calOct = mesh(cal, plane(0.75, 0.84), M.signs.kioskOct, 0, 0, 0.002, 0, 0, 0, false), calNov = mesh(cal, plane(0.75, 0.84), M.signs.kioskNov, 0, 0, 0.001, 0, 0, 0, false);
  const flipG = new THREE.Group(); flipG.position.set(0, 0.42, 0.004); cal.add(flipG); const flipP = mesh(flipG, plane(0.75, 0.84), M.signs.kioskOct, 0, -0.42, 0, 0, 0, 0, false); flipP.material = M.signs.kioskOct;
  // braziers with fire, a tram-stop sign post, snowbanks, barrels, crates
  const fires = []; for (const [x, z] of [[2.6, -3.0], [-4.5, -9], [5.5, -12]]) { K.put(M.metal, cyl(0.38, 0.28, 0.7, 12), x, 0.35, z, 0, 0, 0, 1, 1, 1, 0x2a2a30); mesh(root, cyl(0.34, 0.34, 0.04, 12), M.coal, x, 0.7, z, 0, 0, 0, false); const fl = nond(mesh(root, plane(0.7, 0.9), H.M.flame, x, 1.1, z, 0, 0, 0, false)); fires.push({ fl, gl: glowAt(root, [x, 1.1, z], 2.6, '#ff9a40', 0.6) }); }
  for (let i = 0; i < 14; i++) K.put(M.snow, lumpGeo(i + 3, 1, 0.3), (R() - 0.5) * 18, 0.05, -2 - R() * 20, 0, R() * 6, 0, 0.6 + R() * 0.8, 0.25 + R() * 0.2, 0.5 + R() * 0.6, 0xe8eef8);
  for (const [x, z] of [[3.6, -1.4], [3.9, -1.9], [-5.2, -6]]) K.put(M.wood, cyl(0.26, 0.24, 0.62, 12), x, 0.31, z, 0, R() * 6, 0, 1, 1, 1, 0x7a5a38);
  for (const x of [-7, 7]) { K.beam(M.lampPost, [x, 0, -4], [x, 4, -4], 0.07, 0x1e1c24, true, 6); }
  const lamps = [-7, 7].map((x) => { mesh(root, cyl(0.16, 0.2, 0.4, 6), M.lampGlass, x, 4.2, -4, 0, 0, 0, false); return glowAt(root, [x, 4.2, -4], 2.0, '#ffd890', 0.55); });
  K.build(root, 12);
  const snow = motes(root, 260, [-8, 8, 0.1, 9, -16, 4], 87, 0.03);
  return { banners, cal, calOct, calNov, flipG, flipP, fires, lamps, snow }; }

// ---------------------------------------------------------------- lights / grades
const SET_LIGHT = {
  bedNight: { top: '#04081c', hor: '#1a2250', fog: '#10163a', fogN: 10, fogF: 40, sky: '#4a5ab8', ground: '#1a1428', hemiI: 0.62, fillCol: '#4a5ad0', fillI: 0.42, sunCol: '#90a8ff', sunI: 0.9, az: 200, el: 30, disc: '#000000', stars: 0, clouds: false, shadow: true, cardTint: '#e4e4ff', fxTint: '#eef2ff', shafts: 0 },
  bedDay: { top: '#4a7ad0', hor: '#ffd8a8', fog: '#f0d0b0', fogN: 14, fogF: 60, sky: '#b0b8f0', ground: '#7a5040', hemiI: 0.9, fillCol: '#7080e0', fillI: 0.38, sunCol: '#ffd8a0', sunI: 3.0, az: 200, el: 28, disc: '#000000', clouds: false, stars: 0, shadow: true, cardTint: '#fff6ec', fxTint: '#fff8ee', shafts: 0.6 },
  cosmos: { top: '#040a24', hor: '#12285a', fog: '#0c1840', fogN: 14, fogF: 70, sky: '#5a7ad8', ground: '#0c1430', hemiI: 0.8, fillCol: '#5a7ae0', fillI: 0.5, sunCol: '#ffd8a0', sunI: 1.5, az: 170, el: 34, disc: '#000000', stars: 1, clouds: false, shadow: true, cardTint: '#e8ecff', fxTint: '#eef2ff', shafts: 0 },
  hall: { top: '#000000', hor: '#3a1a14', fog: '#3a2018', fogN: 12, fogF: 50, sky: '#ffd8b0', ground: '#4a3028', hemiI: 0.78, fillCol: '#7a70d0', fillI: 0.36, sunCol: '#ffd8a8', sunI: 2.2, az: 160, el: 34, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0.6 },
  map: { top: '#000000', hor: '#2a1a14', fog: '#2a1a14', fogN: 10, fogF: 40, sky: '#ffd8b0', ground: '#4a3028', hemiI: 0.62, fillCol: '#6a70d0', fillI: 0.38, sunCol: '#ffd0a0', sunI: 1.2, az: -150, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  london: { top: '#3a4aa0', hor: '#ffb070', fog: '#e8a080', fogN: 18, fogF: 120, sky: '#c0a0d8', ground: '#5a3a3a', hemiI: 0.8, fillCol: '#6a6ad0', fillI: 0.4, sunCol: '#ffb070', sunI: 3.0, az: 30, el: 10, disc: '#ffe0b0', discSize: 0.006, clouds: true, stars: 0, shadow: true, cardTint: '#fff0e0', fxTint: '#fff4ea', shafts: 0.5 },
  petro: { top: '#040820', hor: '#2a3470', fog: '#1e2650', fogN: 18, fogF: 90, sky: '#6a7ad8', ground: '#2a3050', hemiI: 0.85, fillCol: '#5a6ad8', fillI: 0.5, sunCol: '#b8c8ff', sunI: 1.3, az: 150, el: 34, disc: '#000000', stars: 1, clouds: false, shadow: true, cardTint: '#e8ecff', fxTint: '#eef2ff', shafts: 0 },
};
const SET_GRADE = {
  bedNight: { look: 'night', over: { exp: 1.16, con: 1.22, sat: 1.08, lift: [0.02, 0.024, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.5, 0.66], hal: [0.32, '#ffa050'], vig: [0.42, 0.42, '#04061a'] } },
  bedDay: { look: 'golden', over: { exp: 1.06, con: 1.2, sat: 1.12, tS: ['#3a2a8a', 0.16], tH: ['#ffc890', 0.1], bloom: [0.42, 0.76], hal: [0.24, '#ffa060'], vig: [0.32, 0.46, '#1e1a3a'] } },
  cosmos: { look: 'night', over: { exp: 1.2, con: 1.2, sat: 1.1, lift: [0.02, 0.03, 0.07], tS: ['#1a2a8a', 0.24], tH: ['#ffd090', 0.12], bloom: [0.5, 0.62], hal: [0.34, '#ffb060'], vig: [0.4, 0.42, '#04061a'] } },
  hall: { look: 'office', over: { exp: 1.1, con: 1.22, sat: 1.12, lift: [0.035, 0.02, 0.04], tS: ['#3a2a6a', 0.2], tH: ['#ffc888', 0.12], bloom: [0.44, 0.72], hal: [0.3, '#ff9a50'], vig: [0.36, 0.44, '#14081a'] } },
  map: { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.1, lift: [0.035, 0.02, 0.045], tS: ['#3a2a6a', 0.2], tH: ['#ffc888', 0.12], bloom: [0.46, 0.72], hal: [0.3, '#ff9a50'], vig: [0.38, 0.44, '#14081a'] } },
  london: { look: 'golden', over: { exp: 1.06, con: 1.2, sat: 1.14, tS: ['#3a2a8a', 0.18], tH: ['#ffb070', 0.14], bloom: [0.42, 0.74], hal: [0.26, '#ff9050'], vig: [0.34, 0.46, '#1e1a3a'] } },
  petro: { look: 'night', over: { exp: 1.2, con: 1.2, sat: 1.08, lift: [0.02, 0.028, 0.065], tS: ['#1a2a7a', 0.26], tH: ['#ffc080', 0.14], bloom: [0.52, 0.64], hal: [0.32, '#ffa050'], vig: [0.4, 0.42, '#04061a'] } },
};

export function buildGC(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'bedNight', fly: 0, fly2: 0, candle: 1, orbit: 0, clock: 0, drift: 0, year: 325, leap: 0, pins: {}, banner: 0, nov: 0, parch: 1, part: 'all' };
  let bd, cs, hl, mp, ld, pt;
  const API = makeAPI(ctx, { prefix: 'gc_', origin: GC_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { bedNight: 'explain', bedDay: 'golden', cosmos: 'explain', hall: 'office', map: 'office', london: 'golden', petro: 'explain' },
    practicals: (name, F, W3) => { const fl = 1 + 0.05 * Math.sin(F * 0.7) + 0.03 * Math.sin(F * 1.9);
      if (name === 'bedNight') return [{ p: W3('bed', [0.38, 1.1, -2.5]), col: '#ffb860', I: 5 * fl * ST.candle, d: 5 }, { p: W3('bed', [1.7, 1.9, -2.8]), col: '#7a90ff', I: 1.6, d: 5 }];
      if (name === 'bedDay') return [{ p: W3('bed', [1.4, 2.0, -2.4]), col: '#ffd8a0', I: 4, d: 7 }];
      if (name === 'cosmos') return [{ p: W3('cosmos', [0, 2.6, -6.8]), col: '#ffc060', I: 9, d: 12 }, { p: W3('cosmos', [0, 2.4, -0.4]), col: '#9ac0ff', I: 2.4, d: 6 }, { p: W3('cosmos', [0, 2.2, 5.2]), col: '#ffe0b0', I: 1.8 * Math.min(1, ST.leap), d: 7 }];
      if (name === 'hall') return [{ p: W3('hall', [-1.15, 1.5, -0.8]), col: '#ffc070', I: 3 * fl, d: 4 }, { p: W3('hall', [1.2, 1.5, -0.9]), col: '#ffc070', I: 3 * fl, d: 4 }, { p: W3('hall', [0, 3.0, -2.6]), col: '#ffe0b0', I: 2.5, d: 6 }];
      if (name === 'map') return [{ p: W3('map', [-2.2, 1.8, -0.2]), col: '#ffc070', I: 2.2 * fl, d: 5 }, { p: W3('map', [0.6, 2.6, -1.0]), col: '#ffd8a0', I: 2.0, d: 5 }];
      if (name === 'london') return [{ p: W3('london', [-1.4, 2.6, -1.2]), col: '#ffc070', I: 1.0, d: 4 }];
      if (name === 'petro') return [{ p: W3('petro', [2.6, 1.3, -3.0]), col: '#ff9a40', I: 6 * fl, d: 7 }, { p: W3('petro', [-4.5, 1.3, -9]), col: '#ff9a40', I: 5 * fl, d: 7 }, { p: W3('petro', [-1.8, 2.6, -0.6]), col: '#ffe0b0', I: 2.2, d: 4 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'bed' && bd) { tickMotes(bd.dust, f, 0.2); const day = ST.mood === 'bedDay'; bd.sky.material = day ? M.daySky : M.nightSky; bd.shaft.material.opacity = day ? 0.28 : 0; const c = day ? 0 : ST.candle;
        bd.cn.fl.visible = c > 0.02; bd.cn.fl.scale.set(c * (1 + 0.1 * Math.sin(f * 0.8)), c * (1 + 0.15 * Math.sin(f * 1.1)), 1); bd.cn.gl.material.opacity = 0.38 * c; tickPages(bd.pages, ST.fly); }
      if (cur === 'cosmos' && cs) { tickMotes(cs.dust, f, 0.15); const a = ST.orbit * TAU; cs.earthG.position.set(cs.SC[0] + Math.sin(a) * 3.2, cs.SC[1], cs.SC[2] + Math.cos(a) * 3.2); cs.earthG.children[0].rotation.y = T * 2; cs.gT.visible = ST.part !== 'drift' && ST.part !== 'leap'; cs.gS.visible = ST.part !== 'culprit' && ST.part !== 'leap'; cs.gL.visible = ST.part !== 'culprit' && ST.part !== 'drift';
        cs.sgl.material.opacity = 0.75 + 0.08 * Math.sin(T * 2); cs.hMin.rotation.z = -ST.clock * TAU; cs.hHr.rotation.z = -ST.clock * TAU / 12;
        cs.mark.position.x = cs.cellX(21 - 10 * ST.drift); cs.mark.position.y = 2.05 + 0.04 * Math.sin(T * 3); cs.cnt.draw(Math.round(ST.year));
        cs.blocks.forEach((b, i) => { const t = Math.max(0, Math.min(1, ST.leap - i)); const s = t <= 0 ? 0.001 : (() => { const u = t - 1; return u * u * (2.9 * u + 1.9) + 1; })(); b.scale.setScalar(Math.max(0.001, s)); b.rotation.y = 0.15 * Math.sin(T * 1.2 + i); }); }
      if (cur === 'hall' && hl) { tickMotes(hl.dust, f, 0.2); hl.arm.rotation.y = T * 0.3; hl.cands.forEach((c, i) => { c.fl.scale.set(1 + 0.1 * Math.sin(f * 0.8 + i), 1 + 0.15 * Math.sin(f * 1.1 + i), 1); }); tickPages(hl.pages, ST.fly2); hl.parch.scale.y = 0.05 + 0.95 * ST.parch; hl.parch.position.y = 3.5 - 1.42 * ST.parch; }
      if (cur === 'map' && mp) { tickMotes(mp.dust, f, 0.2); mp.cn.fl.scale.set(1 + 0.1 * Math.sin(f * 0.8), 1 + 0.15 * Math.sin(f * 1.1), 1); for (const [k, g] of Object.entries(mp.pins)) { const t = Math.max(0, Math.min(1, ST.pins[k] || 0)); const u = t - 1; g.scale.setScalar((g.userData.k || 1) * (t <= 0 ? 0.001 : Math.max(0.001, u * u * (2.9 * u + 1.9) + 1))); g.children[2].rotation.y = 0.2 * Math.sin(T * 3 + g.position.x * 9); } }
      if (cur === 'london' && ld) { tickMotes(ld.dust, f, 0.3); ld.flag.rotation.z = 0.04 * Math.sin(T * 2.2); ld.flag.scale.x = 0.96 + 0.04 * Math.sin(T * 3.1); const b = ST.banner; ld.banner.visible = b > 0.01; ld.banner.scale.set(1, Math.max(0.01, b), 1); ld.banner.rotation.x = 0.06 * Math.sin(T * 1.7); }
      if (cur === 'petro' && pt) { tickMotes(pt.snow, f, 2.5); pt.fires.forEach((c, i) => { c.fl.scale.set(1 + 0.12 * Math.sin(f * 0.9 + i), 1 + 0.2 * Math.sin(f * 1.3 + i), 1); c.gl.material.opacity = 0.55 + 0.1 * Math.sin(f * 0.7 + i); }); pt.banners.forEach((b, i) => { b.rotation.y = 0.05 * Math.sin(T * 1.3 + i); });
        const n = ST.nov; pt.calOct.visible = n < 0.5; pt.calNov.visible = n >= 0.5; pt.flipG.visible = n > 0.01 && n < 0.99; pt.flipG.rotation.x = -Math.PI * n; pt.flipP.material = n < 0.5 ? M.signs.kioskOct : M.signs.kioskNov; pt.flipP.rotation.y = n < 0.5 ? 0 : Math.PI; } },
    mood: (name) => { ST.mood = name; },
    apply: (v) => { if (v.st) Object.assign(ST, v.st); } });
  bd = buildBed(API.groups.bed); cs = buildCosmos(API.groups.cosmos); hl = buildHall(API.groups.hall); mp = buildMap(API.groups.map); ld = buildLondon(API.groups.london); pt = buildPetro(API.groups.petro);
  API.parts = { bd, cs, hl, mp, ld, pt };
  API.set = (o) => { const p = o.pins; Object.assign(ST, o); if (p) ST.pins = p; };
  const glows = { bed: [bd.cn.gl], cosmos: [cs.sgl, cs.mgl, cs.earthG.children[1]], hall: hl.cands.map((c) => c.gl), map: [mp.cn.gl], london: ld.lamps, petro: [...pt.fires.map((c) => c.gl), ...pt.lamps] };
  const flames = { bed: [bd.cn.fl], hall: hl.cands.map((c) => c.fl), map: [mp.cn.fl], petro: pt.fires.map((c) => c.fl) };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of glows[API.cur] || []) g.quaternion.copy(cam.quaternion); for (const g of flames[API.cur] || []) { const p = g.getWorldPosition(new THREE.Vector3()); g.rotation.set(0, Math.atan2(cam.position.x - p.x, cam.position.z - p.z), 0); } };
  const V = API.V;
  API.views = [
    V('bedNight', [0.9, 1.5, 2.6], [-0.3, 1.0, -2.2], 46, 1.2, [0, 1.0, -2], { st: { candle: 1 } }),               // 0 bedroom wide night
    V('bedDay', [0.9, 1.5, 2.6], [-0.3, 1.0, -2.2], 46, 1.2, [0, 1.0, -2]),                                          // 1 bedroom morning
    V('bedNight', [0.9, 1.2, -1.2], [0.5, 1.2, -2.8], 44, 2.4, [0.55, 1.1, -2.75], { st: { fly: 0.5 } }),           // 2 nightstand + flying pages
    V('cosmos', [0.4, 2.6, 6.5], [0, 2.2, -5], 46, 0.8, [0, 2, -3]),                                                   // 3 cosmos wide
    V('cosmos', [0.2, 1.6, 2.2], [0, 1.6, -1.4], 44, 1.6, [0, 1.4, -1.4], { st: { drift: 1, year: 1582 } }),        // 4 March strip
    V('cosmos', [0, 1.4, 8.5], [0, 1.0, 3.2], 46, 1.0, [0, 1, 3.2], { st: { leap: 5 } }),                             // 5 leap plinths
    V('hall', [0.6, 1.7, 3.6], [0, 1.6, -2.5], 46, 1.0, [0, 1.2, -1.5], { st: { fly2: 0.5 } }),                      // 6 hall wide
    V('map', [0.0, 2.4, 1.4], [0, 0.9, -1.2], 46, 1.4, [0, 0.9, -1.2], { st: { pins: { it: 1, es: 1, pt: 1, pl: 1, gb: 1, ru: 1, gr: 1 } } }), // 7 map table
    V('map', [0.0, 1.7, 1.2], [0, 2.2, -3.6], 44, 1.4, [0, 2.2, -3.5]),                                               // 8 Oct 1582 wall calendar
    V('london', [0.4, 1.6, 6.0], [0, 2.4, -12], 46, 1.0, [0, 1.4, -2], { st: { banner: 1 } }),                        // 9 London street
    V('london', [-1.3, 1.5, -0.4], [-3.1, 1.5, -2.4], 44, 1.6, [-3.1, 1.5, -2.5]),                                    // 10 almanack window
    V('petro', [0.5, 1.7, 6.5], [0, 4, -24], 46, 1.0, [0, 1.4, -2], { st: { nov: 0 } }),                              // 11 Petrograd square
    V('petro', [-1.2, 2.0, 0.9], [-1.95, 2.15, -1.35], 40, 2.0, [-1.95, 2.15, -1.35], { st: { nov: 1 } }),            // 12 kiosk calendar
  ];
  API.tick(0);
  return API;
}
