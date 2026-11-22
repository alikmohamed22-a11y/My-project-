// napoleon_sets.js [NAP-sets]: sets for "Napoleon wasn't short" (Oddverra short). All original designs, no real logos.
//   tent    : Napoleon's campaign tent / war room: striped canvas walls + sloped roof, poles, big map table (invented parchment map with
//             arrows + little troop blocks), candles, camp chest, folding stool, tricolour flag, rug.          origin (-34000, 0, 0)
//   helena  : the 1821 measuring scene (St Helena bedroom): green-papered walls, bright window, camp bed with a SHEET-COVERED shape
//             (nothing shown), side table with candle + note, a yellow measuring tape that unrolls along the sheet (tape(k)). origin (-34000, 0, 800)
//   chart   : explainer room: giant height chart (metres + feet), sliding red marker (mark(y, k)), two inch bars on a plinth
//             (bars(k): French pouce 2.71 cm vs British inch 2.54 cm), tiled floor.                          origin (-34000, 0, 1600)
//   shop    : London print shop / cartoonist's studio: panelled walls, caricatures pinned up + strung on lines, slanted drawing desk
//             with a Little Boney drawing, inkwell, candle, wooden press, window onto foggy rooftops.       origin (-34000, 0, 2400)
//   parade  : sunny parade ground: gravel, long generic palace facade, trees, flagpoles with tricolours, low railings. origin (-36000, 0, 0)
//   museum  : modern gallery: portrait of Napoleon + the Little Boney caricature framed, placards, rope barrier, bench, spots. origin (-34000, 0, 3200)
import { H, INK, TAU, clamp01, SERIF, SANS, cyl, sph, tor, plane, planeUV, lathe, mesh, nond, lumpGeo, txt, grain, glowAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';
import { oddverra } from './oddverra_next.js';
import { NAP_ODD } from './napoleon_cast.js';

export const NP_ORIGIN = { tent: [-34000, 0, 0], helena: [-34000, 0, 800], chart: [-34000, 0, 1600], shop: [-34000, 0, 2400], museum: [-34000, 0, 3200], parade: [-36000, 0, 0] };
let THREE, PT, M;

// ---------------------------------------------------------------- painters
const ODD = (g, who, op, x, y, k) => { g.save(); g.translate(x, y); g.scale(k, k); g.translate(-300, -500); try { oddverra(g, { seed: 3, ...NAP_ODD[who] }, { t: 0, blink: 0, ...op }); } catch (e) { /* drawing is decoration only */ } g.restore(); };
function stripeTex(g, w, h, a, b, n = 8) { for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * w / n, 0, w / n, h); } PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, 9)); grain(g, w, h, 'rgba(90,70,50,1)', 600, 3, 0.12); }
function mapTex(g, w, h) { PT.paper(g, w, h, { base: '#ecdcb4', seed: 7 }); const R = PT.rng(1805);
  g.fillStyle = '#a8c0c8'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 3, 3, 3, 4));
  const land = (pts, col) => { g.fillStyle = col; g.strokeStyle = '#6a5a3a'; g.lineWidth = 3; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x * w, y * h) : g.moveTo(x * w, y * h))); g.closePath(); g.fill(); g.stroke(); };
  land([[0.05, 0.95], [0.08, 0.55], [0.18, 0.42], [0.3, 0.35], [0.36, 0.2], [0.5, 0.12], [0.7, 0.08], [0.95, 0.1], [0.98, 0.95]], '#e6d4a4');
  land([[0.12, 0.3], [0.2, 0.12], [0.26, 0.18], [0.22, 0.34]], '#e0cc98'); land([[0.4, 0.95], [0.46, 0.7], [0.52, 0.72], [0.5, 0.95]], '#e6d4a4');
  g.strokeStyle = 'rgba(120,90,60,0.5)'; g.lineWidth = 2; g.setLineDash([8, 6]); for (const pts of [[[0.3, 0.4], [0.4, 0.55], [0.38, 0.9]], [[0.5, 0.15], [0.55, 0.5], [0.7, 0.7]], [[0.7, 0.1], [0.75, 0.5], [0.9, 0.6]]]) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x * w, y * h) : g.moveTo(x * w, y * h))); g.stroke(); } g.setLineDash([]);
  g.strokeStyle = '#3a6aa0'; g.lineWidth = 4; for (const k of [0.2, 0.6]) { g.beginPath(); g.moveTo(w * 0.4, h * (0.2 + k * 0.5)); g.bezierCurveTo(w * 0.55, h * (0.3 + k * 0.4), w * 0.6, h * (0.4 + k * 0.4), w * 0.85, h * (0.35 + k * 0.5)); g.stroke(); }
  const arrow = (x0, y0, x1, y1, col) => { g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0 * w, y0 * h); g.quadraticCurveTo((x0 + x1) / 2 * w, (y0 + y1) / 2 * h - 60, x1 * w, y1 * h); g.stroke(); const a = Math.atan2(y1 - y0 + 0.1, x1 - x0); g.beginPath(); g.moveTo(x1 * w + Math.cos(a) * 30, y1 * h + Math.sin(a) * 30); g.lineTo(x1 * w + Math.cos(a + 2.4) * 34, y1 * h + Math.sin(a + 2.4) * 34); g.lineTo(x1 * w + Math.cos(a - 2.4) * 34, y1 * h + Math.sin(a - 2.4) * 34); g.closePath(); g.fill(); };
  arrow(0.3, 0.6, 0.55, 0.45, '#2a4ab0'); arrow(0.32, 0.7, 0.62, 0.78, '#2a4ab0'); arrow(0.4, 0.4, 0.78, 0.3, '#2a4ab0'); arrow(0.85, 0.45, 0.68, 0.55, '#b02a2a');
  g.save(); g.translate(w * 0.88, h * 0.82); g.strokeStyle = '#6a5a3a'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 50, 0, TAU); g.stroke(); g.fillStyle = '#b02a2a'; g.beginPath(); g.moveTo(0, -60); g.lineTo(10, 0); g.lineTo(-10, 0); g.fill(); g.fillStyle = '#6a5a3a'; g.beginPath(); g.moveTo(0, 60); g.lineTo(10, 0); g.lineTo(-10, 0); g.fill(); g.restore();
  txt(g, 'EUROPE', w * 0.62, h * 0.06, w * 0.4, h * 0.06, { col: '#5a4028', font: SERIF });
  PT.modulate(g, w, h, (u, v) => { const e = Math.min(u, 1 - u, v, 1 - v); return 0.86 + 0.14 * Math.min(1, e * 10); }); grain(g, w, h, 'rgba(90,60,30,1)', 900, 5, 0.18); }
function boneyDrawing(g, w, h, o = {}) { PT.paper(g, w, h, { base: '#f4ead2', seed: o.seed || 11 });
  g.strokeStyle = 'rgba(80,60,40,0.25)'; g.lineWidth = 2; g.strokeRect(w * 0.05, h * 0.04, w * 0.9, h * 0.92);
  if (o.giant) { ODD(g, 'LONDON1', { expr: 'laugh', raise: 1, reach: 1 }, w * 0.36, h * 0.6, h / 1150); ODD(g, 'BONEY', { expr: 'angry', shake: 1 }, w * 0.7, h * 0.36, h / 3800); }
  else ODD(g, 'BONEY', { expr: 'angry', shake: 1, handsUp: 1 }, w * 0.5, h * 0.52, h / 1250);
  // hand-colouring wash + caption
  g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(255,236,200,0.25)'; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over';
  txt(g, o.cap || 'LITTLE BONEY', w * 0.5, h * 0.92, w * 0.8, h * 0.055, { col: '#3a2a20', font: SERIF, italic: true }); }
function portraitTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#4a3a2e'); gr.addColorStop(1, '#2a1e18'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(200,120,60,0.18)'; g.beginPath(); g.ellipse(w * 0.5, h * 0.35, w * 0.45, h * 0.3, 0, 0, TAU); g.fill();
  ODD(g, 'NAPOLEON', { expr: 'smug', view: '34R', clasp: 1 }, w * 0.5, h * 0.58, h / 820); PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * PT.fbm(u, v, 8, 8, 3, 2)); grain(g, w, h, 'rgba(255,230,190,1)', 600, 9, 0.08); }
function heightChart(g, w, h) { g.fillStyle = '#fbf4e2'; g.fillRect(0, 0, w, h); const ppm = h / 2.2; // 0..2.2 m tall
  for (let cm = 0; cm <= 220; cm++) { const y = h - cm * ppm / 100, L = cm % 10 === 0 ? 60 : cm % 5 === 0 ? 36 : 18; g.fillStyle = '#2b1d4a'; g.fillRect(0, y - 1, L, 2); if (cm % 10 === 0 && cm > 0) { g.font = 'bold 30px ' + SANS; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText((cm / 100).toFixed(1) + ' m', 70, y); } }
  for (let inch = 0; inch <= 86; inch++) { const y = h - inch * 2.54 * ppm / 100, L = inch % 12 === 0 ? 70 : inch % 6 === 0 ? 40 : 20; g.fillStyle = '#a8302c'; g.fillRect(w - L, y - 1, L, 2); if (inch % 12 === 0 && inch > 0) { g.font = 'bold 34px ' + SANS; g.textAlign = 'right'; g.fillText(inch / 12 + ' ft', w - 80, y); } }
  for (const [ft, inch] of [[5, 6], [5, 7]]) { const y = h - (ft * 12 + inch) * 2.54 * ppm / 100; g.font = 'bold 22px ' + SANS; g.textAlign = 'right'; g.fillStyle = '#a8302c'; g.fillText(`${ft}'${inch}"`, w - 46, y); }
  g.fillStyle = 'rgba(80,140,200,0.12)'; g.fillRect(w * 0.32, 0, w * 0.36, h); PT.modulate(g, w, h, (u, v) => 0.95 + 0.06 * PT.fbm(u, v, 4, 4, 3, 3)); }
function barLabel(g, w, h, a, b, bg, fg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, 0, w, h * 0.25); txt(g, a, w * 0.5, h * 0.36, w * 0.9, h * 0.38, { col: fg, font: SANS }); txt(g, b, w * 0.5, h * 0.74, w * 0.9, h * 0.32, { col: fg, font: SANS }); }
function wallpaperGreen(g, w, h) { g.fillStyle = '#8aa486'; g.fillRect(0, 0, w, h); const R = PT.rng(3); for (let j = 0; j < 8; j++) for (let i = 0; i < 6; i++) { const x = (i + 0.5 + (j % 2) * 0.5) * w / 6, y = (j + 0.5) * h / 8; g.fillStyle = 'rgba(240,236,210,0.35)'; g.beginPath(); g.moveTo(x, y - 12); g.lineTo(x + 7, y); g.lineTo(x, y + 12); g.lineTo(x - 7, y); g.closePath(); g.fill(); }
  PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, 7)); }
function skyWin(g, w, h, fog) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, fog ? '#b8b0a8' : '#9ac8f0'); gr.addColorStop(1, fog ? '#e8dcc8' : '#f4ecd8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  if (fog) { g.fillStyle = 'rgba(80,72,80,0.5)'; for (let i = 0; i < 11; i++) { const x = i * w / 10 - 14, bw = w / 10 + 4, hh = h * (0.16 + 0.07 * Math.sin(i * 2.1)); g.fillRect(x, h - hh, bw, hh); g.beginPath(); g.moveTo(x - 3, h - hh); g.lineTo(x + bw / 2, h - hh - 22); g.lineTo(x + bw + 3, h - hh); g.fill(); g.fillRect(x + 8, h - hh - 30, 8, 22); g.fillRect(x + bw - 18, h - hh - 26, 7, 18); }
    g.fillStyle = 'rgba(90,82,92,0.45)'; g.beginPath(); g.arc(w * 0.62, h * 0.58, w * 0.12, Math.PI, 0); g.fill(); g.fillRect(w * 0.6, h * 0.36, w * 0.04, h * 0.1); g.fillRect(w * 0.5, h * 0.58, w * 0.24, h * 0.42); }
  else { g.fillStyle = '#5a8a5a'; g.beginPath(); g.moveTo(0, h * 0.8); g.quadraticCurveTo(w * 0.4, h * 0.6, w, h * 0.75); g.lineTo(w, h); g.lineTo(0, h); g.fill(); g.fillStyle = '#7ab0d8'; g.fillRect(0, h * 0.9, w, h * 0.1); } }
function placard(g, w, h, lines) { g.fillStyle = '#f6f2ea'; g.fillRect(0, 0, w, h); lines.forEach(([s, y, sz, col], i) => txt(g, s, w / 2, h * y, w * 0.88, h * sz, { col: col || '#2a2a34', font: SANS, bold: i === 0 })); }
function facadeTex(g, w, h) { g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h); for (let j = 0; j < 3; j++) for (let i = 0; i < 16; i++) { const x = (i + 0.5) * w / 16, y = h * (0.2 + j * 0.27); g.fillStyle = '#5a6a8a'; g.fillRect(x - w / 60, y, w / 30, h * 0.16); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x - w / 60, y, w / 30, h * 0.03); g.fillStyle = '#d0c0a0'; g.fillRect(x - w / 50, y - h * 0.025, w / 25, h * 0.02); }
  g.fillStyle = '#c8b898'; g.fillRect(0, h * 0.14, w, h * 0.02); g.fillRect(0, h * 0.95, w, h * 0.05); PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 6, 3, 3, 5)); }

// ---------------------------------------------------------------- materials
function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.floor = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#b8875a', n: 9, seed: 61 }), [3, 3]) }); if (H.MACRO) H.MACRO(m.floor, 0.12, 0.05);
  m.floorM = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#c89a68', n: 12, seed: 71, joints: 2 }), [4, 4]) }); if (H.MACRO) H.MACRO(m.floorM, 0.1, 0.05);
  m.wood = vc({ map: T(256, 256, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a34', n: 4, seed: 33, joints: 0 })) });
  m.canvas = toon({ map: T(512, 512, (g, w, h) => stripeTex(g, w, h, '#f2e8d0', '#e2d0a8', 10), [3, 1]), emissive: 0x2a2014, side: THREE.DoubleSide }); m.canvas.emissiveMap = m.canvas.map;
  m.canvasB = toon({ map: T(512, 512, (g, w, h) => stripeTex(g, w, h, '#f2e8d0', '#8a4a44', 12), [3, 1]), emissive: 0x1a1810, side: THREE.DoubleSide }); m.canvasB.emissiveMap = m.canvasB.map;
  m.map = em(T(1024, 768, mapTex), 0x3a2e1e); m.rug = vc({ map: T(512, 384, (g, w, h) => { g.fillStyle = '#7a2a2e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d8b060'; g.lineWidth = 16; g.strokeRect(22, 22, w - 44, h - 44); g.fillStyle = '#2a3a6a'; g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.26, h * 0.22, 0, 0, TAU); g.fill(); g.fillStyle = '#d8b060'; txt(g, 'N', w / 2, h / 2, w * 0.2, h * 0.3, { col: '#d8b060', font: SERIF }); PT.modulate(g, w, h, (u, v) => 0.85 + 0.2 * PT.fbm(u, v, 6, 6, 3, 2)); }) });
  m.flag = toon({ map: T(256, 160, (g, w, h) => { for (const [i, c] of [[0, '#2a4ab0'], [1, '#f4f2ea'], [2, '#d0302c']]) { g.fillStyle = c; g.fillRect(i * w / 3, 0, w / 3 + 1, h); } PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * Math.sin(u * 12)); }), emissive: 0x201818, side: THREE.DoubleSide }); m.flag.emissiveMap = m.flag.map;
  m.wpGreen = toon({ map: T(512, 512, wallpaperGreen, [4, 2]), emissive: 0x141a12 }); m.wpGreen.emissiveMap = m.wpGreen.map;
  m.sheet = vc({ emissive: 0x2a2a30 }); m.tape = vc({ emissive: 0x4a3a08 });
  m.winDay = C.basic(T(256, 256, (g, w, h) => skyWin(g, w, h, false)), 1.15); m.winFog = C.basic(T(512, 256, (g, w, h) => skyWin(g, w, h, true)), 1.05);
  m.note = em(T(256, 192, (g, w, h) => { PT.paper(g, w, h, { base: '#f2e8d0', seed: 3 }); txt(g, '5 pieds', w / 2, h * 0.36, w * 0.8, h * 0.22, { col: '#2a2440', font: SERIF, italic: true, bold: false }); txt(g, '2 pouces', w / 2, h * 0.66, w * 0.8, h * 0.22, { col: '#2a2440', font: SERIF, italic: true, bold: false }); }), 0x3a3020);
  m.chart = em(T(512, 1024, heightChart), 0x3a3428); m.plaster = vc({ map: T(512, 512, (g, w, h) => { g.fillStyle = '#e8eef4'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 5, 5, 4, 3)); }) });
  m.tile = vc({ map: T(512, 512, (g, w, h) => { const n = 8, s = w / n; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { g.fillStyle = (i + j) % 2 ? '#d8c8a8' : '#f2ead8'; g.fillRect(i * s, j * s, s, s); } PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 8)); }, [3, 3]) });
  m.barFR = em(T(512, 160, (g, w, h) => barLabel(g, w, h, 'FRENCH INCH', '2.71 cm', '#2a4ab0', '#ffffff')), 0x18284a); m.barUK = em(T(512, 160, (g, w, h) => barLabel(g, w, h, 'BRITISH INCH', '2.54 cm', '#c0302c', '#ffffff')), 0x4a1818);
  m.panelW = vc({ map: T(512, 512, (g, w, h) => { g.fillStyle = '#6a4228'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(30,16,8,0.55)'; g.lineWidth = 6; for (let i = 0; i < 3; i++) g.strokeRect(i * w / 3 + 14, 20, w / 3 - 28, h * 0.5); g.strokeRect(14, h * 0.6, w - 28, h * 0.36); PT.modulate(g, w, h, (u, v) => 0.88 + 0.16 * PT.fbm(u, v, 3, 8, 3, 4)); }, [2, 1]) });
  m.plasterW = vc({ map: T(512, 512, (g, w, h) => { g.fillStyle = '#e4d4b4'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.14 * PT.fbm(u, v, 5, 5, 4, 6)); grain(g, w, h, '#6a5040', 900, 4, 0.15); }) });
  m.boney = em(T(384, 512, (g, w, h) => boneyDrawing(g, w, h, {})), 0x2a2418);
  m.giant = em(T(384, 512, (g, w, h) => boneyDrawing(g, w, h, { giant: 1, seed: 13, cap: 'THE GIANT & LITTLE BONEY' })), 0x2a2418);
  m.boney2 = em(T(384, 512, (g, w, h) => boneyDrawing(g, w, h, { seed: 17, cap: 'BONEY IN A STROP' })), 0x2a2418);
  m.print = (i) => em(T(256, 320, (g, w, h) => { PT.paper(g, w, h, { base: ['#f2e6cc', '#efe2c2', '#f4ead6'][i % 3], seed: 20 + i }); const R = PT.rng(40 + i); for (let k = 0; k < 4; k++) { g.fillStyle = ['rgba(200,80,70,0.35)', 'rgba(70,100,170,0.35)', 'rgba(220,180,80,0.35)'][k % 3]; g.beginPath(); g.ellipse(w * (0.2 + R() * 0.6), h * (0.2 + R() * 0.5), w * (0.08 + R() * 0.12), h * (0.08 + R() * 0.12), R() * 3, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(50,30,40,0.8)'; g.lineWidth = 2.5; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(w * (0.2 + R() * 0.6), h * (0.2 + R() * 0.5), 8 + R() * 18, 0, TAU); g.stroke(); } txt(g, ['JOHN BULL', 'THE DINNER', 'A STORM', 'POLITE TEA'][i % 4], w / 2, h * 0.9, w * 0.8, h * 0.07, { col: '#3a2a20', font: SERIF, italic: true }); }), 0x2a2418);
  m.portrait = em(T(512, 640, portraitTex), 0x2a2018); m.gold = vc({ emissive: 0x3a2808 });
  m.wallM = vc({ map: T(512, 512, (g, w, h) => { g.fillStyle = '#efe8dc'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.94 + 0.08 * PT.fbm(u, v, 4, 4, 3, 2)); }) });
  m.plac1 = em(T(512, 256, (g, w, h) => placard(g, w, h, [['NAPOLEON BONAPARTE', 0.22, 0.17], ['1769 – 1821', 0.44, 0.12, '#6a6a74'], ['Height: about 1.69 m', 0.68, 0.14], ['(5 ft 6–7 in). Average!', 0.86, 0.12, '#a8302c']])), 0x3a3a3a);
  m.plac2 = em(T(512, 256, (g, w, h) => placard(g, w, h, [['"LITTLE BONEY"', 0.24, 0.18], ['British caricature, 1800s', 0.48, 0.12, '#6a6a74'], ['The joke that', 0.7, 0.13], ['outlived the emperor', 0.88, 0.13, '#a8302c']])), 0x3a3a3a);
  m.gravel = vc({ map: T(512, 512, (g, w, h) => PT.dirt(g, w, h, { base: '#d8c8a0', seed: 5 }), [40, 40]) }); if (H.MACRO) H.MACRO(m.gravel, 0.18, 0.01);
  m.grass = vc({ map: T(512, 512, (g, w, h) => PT.grass(g, w, h, { base: '#7aa84a', seed: 8 }), [30, 30]) });
  m.facade = em(T(1024, 256, facadeTex), 0x2a2418, { side: THREE.DoubleSide }); m.leaf = vc({ emissive: 0x0c1a08 });
  m.lampOn = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe0a0).multiplyScalar(2.2), fog: false });
  m.flame = C.flame;
  return m; }

// ---------------------------------------------------------------- props
function candle(K, root, x, y, z, glows, size = 0.7) { K.put(M.brass, cyl(0.05, 0.07, 0.03, 12), x, y + 0.015, z, 0, 0, 0, 1, 1, 1, 0xc8a050); K.put(M.paint, cyl(0.022, 0.022, 0.16, 10), x, y + 0.11, z, 0, 0, 0, 1, 1, 1, 0xf6f0e0);
  const fl = nond(mesh(root, plane(0.04, 0.07), M.flame, x, y + 0.225, z, 0, 0, 0, false)); fl.renderOrder = 7; glows.push(fl); glows.push(glowAt(root, [x, y + 0.23, z], size, '#ffc070', 0.6)); }
function frame(K, x, y, z, w, h, col = 0xc89a3a, d = 0.06) { const t = 0.07; K.box(M.gold, x - w / 2 - t, x + w / 2 + t, y + h / 2, y + h / 2 + t, z, z + d, col, 0.01); K.box(M.gold, x - w / 2 - t, x + w / 2 + t, y - h / 2 - t, y - h / 2, z, z + d, col, 0.01);
  K.box(M.gold, x - w / 2 - t, x - w / 2, y - h / 2, y + h / 2, z, z + d, col, 0.01); K.box(M.gold, x + w / 2, x + w / 2 + t, y - h / 2, y + h / 2, z, z + d, col, 0.01); }
function tree(K, x, z, s, R) { K.beam(M.wood, [x, 0, z], [x, 2.2 * s, z], 0.12 * s, 0x6a4a2a, true, 7); for (let i = 0; i < 5; i++) K.put(M.leaf, sph(1, 12, 9), x + (R() - 0.5) * 1.2 * s, (2.4 + R() * 1.4) * s, z + (R() - 0.5) * 1.2 * s, 0, 0, 0, 1.1 * s, 0.95 * s, 1.1 * s, [0x5a8a3a, 0x4a7a32, 0x6a9a42][i % 3]); }

// ================================================================= TENT (campaign war room)
function buildTent(root) { const K = new Kit(), glows = [], X = 3.2, ZB = -2.8, HW = 2.2, HR = 3.4;
  mesh(root, planeUV(8, 7, 2, 2), M.floor, 0, 0, -0.6, -Math.PI / 2, 0, 0, false); mesh(root, plane(3.6, 2.4), M.rug, 0, 0.005, -0.7, -Math.PI / 2, 0, 0, false);
  mesh(root, plane(2 * X, HW), M.canvasB, 0, HW / 2, ZB, 0, 0, 0, false);
  for (const s of [-1, 1]) mesh(root, plane(6, HW), M.canvas, s * X, HW / 2, ZB + 3, 0, -s * Math.PI / 2, 0, false);
  const sl = Math.hypot(X, HR - HW); for (const s of [-1, 1]) { const r = mesh(root, plane(sl, 6), M.canvas, s * X / 2, (HW + HR) / 2, ZB + 3, 0, 0, 0, false); r.rotation.set(-Math.PI / 2, 0, -s * Math.atan2(HR - HW, X), 'ZYX'); }
  // back gable fill
  { const sh = new THREE.Shape(); sh.moveTo(-X, HW); sh.lineTo(X, HW); sh.lineTo(0, HR); sh.closePath(); const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), M.canvasB); m.position.set(0, 0, ZB); root.add(m); }
  K.beam(M.wood, [0, 0, ZB + 0.15], [0, HR, ZB + 0.15], 0.06, 0x7a5030, true, 8); K.beam(M.wood, [0, HR - 0.04, ZB + 0.1], [0, HR - 0.04, ZB + 6], 0.05, 0x7a5030, true, 8);
  for (const s of [-1, 1]) K.beam(M.wood, [s * 2.4, 0, -0.2], [s * 2.4, HW + 0.3, -0.2], 0.045, 0x7a5030, true, 8);
  // map table
  const TY = 0.86; K.box(M.wood, -1.15, 1.15, TY - 0.06, TY, -1.35, -0.15, 0x8a5a34, 0.01); for (const [x, z] of [[-1.05, -1.25], [1.05, -1.25], [-1.05, -0.25], [1.05, -0.25]]) K.box(M.wood, x - 0.04, x + 0.04, 0, TY - 0.06, z - 0.04, z + 0.04, 0x5a3a20, 0.01);
  mesh(root, plane(2.1, 1.1), M.map, 0, TY + 0.003, -0.75, -Math.PI / 2, 0, 0, false);
  for (const [x, z, c] of [[-0.3, -0.6, 0x2a4ab0], [0.1, -0.85, 0x2a4ab0], [0.45, -0.5, 0xb02a2a], [0.6, -0.95, 0xb02a2a], [-0.6, -0.95, 0x2a4ab0]]) K.cb(M.paint, 0.08, 0.05, 0.05, x, TY + 0.025, z, c, 0, 0.3);
  K.put(M.paint, cyl(0.035, 0.035, 0.03, 12), 0.85, TY + 0.015, -0.4, 0, 0, 0, 1, 1, 1, 0x2a2a30); K.beam(M.brass, [0.7, TY + 0.02, -1.1], [0.95, TY + 0.02, -1.0], 0.02, 0xc8a050, true, 8); // inkwell, dividers
  candle(K, root, -0.95, TY, -1.2, glows); candle(K, root, 0.95, TY, -1.25, glows);
  // camp chest + stool + flag + lantern on the pole
  K.box(M.wood, 1.8, 2.7, 0, 0.55, ZB + 0.4, ZB + 1.0, 0x6a3a22, 0.03); K.box(M.brass, 1.78, 2.72, 0.42, 0.46, ZB + 0.38, ZB + 1.02, 0xc8a050, 0.005);
  K.at(-1.7, 0, 0.2, 0.4, () => { K.box(M.wood, -0.25, 0.25, 0.45, 0.5, -0.2, 0.2, 0x8a5a34, 0.01); for (const s of [-1, 1]) { K.beam(M.wood, [s * 0.2, 0, -0.18], [-s * 0.2, 0.45, 0.18], 0.025, 0x5a3a20); } });
  K.beam(M.wood, [-2.6, 0, ZB + 0.6], [-2.6, 2.1, ZB + 0.6], 0.025, 0xc8a070, true, 8); K.put(M.brass, sph(0.05, 8, 6), -2.6, 2.13, ZB + 0.6, 0, 0, 0, 1, 1, 1, 0xd8b048);
  const fl = mesh(root, plane(0.8, 0.52), M.flag, -2.2, 1.78, ZB + 0.6, 0, 0, 0, false);
  K.beam(M.metal, [0, HR - 0.05, -0.7], [0, 2.45, -0.7], 0.01, 0x2a2a30); K.put(M.paint, cyl(0.1, 0.13, 0.22, 10), 0, 2.36, -0.7, 0, 0, 0, 1, 1, 1, 0x3a3a40); K.put(M.lampOn, sph(0.07, 10, 8), 0, 2.3, -0.7); glows.push(glowAt(root, [0, 2.3, -0.7], 1.2, '#ffc070', 0.5));
  // tent opening (front-right) bright daylight sliver on the right wall
  mesh(root, plane(1.2, 1.9), M.winDay, X - 0.01, 0.95, ZB + 4.2, 0, -Math.PI / 2, 0, false);
  K.build(root, 3); const dust = motes(root, 90, [-2.5, 2.5, 0.4, 2.4, -2.4, 0.8], 5, 0.01);
  return { glows, dust, flag: fl, TY }; }

// ================================================================= HELENA (1821 measuring room)
function buildHelena(root) { const K = new Kit(), glows = [], X = 2.4, ZB = -2.2, HT = 2.6;
  mesh(root, planeUV(6, 6, 2, 2), M.floor, 0, 0, 0, -Math.PI / 2, 0, 0, false);
  mesh(root, plane(2 * X, HT), M.wpGreen, 0, HT / 2, ZB, 0, 0, 0, false); for (const s of [-1, 1]) mesh(root, plane(5, HT), M.wpGreen, s * X, HT / 2, ZB + 2.5, 0, -s * Math.PI / 2, 0, false);
  mesh(root, plane(2 * X, 5), H.toon({ color: 0xece4d0, side: THREE.DoubleSide }), 0, HT, ZB + 2.5, Math.PI / 2, 0, 0, false);
  K.box(M.wood, -X, X, 0, 0.14, ZB, ZB + 0.03, 0x4a3020, 0.005); K.box(M.wood, -X, X, 0.9, 0.95, ZB, ZB + 0.04, 0x5a3a24, 0.005);
  // window (back wall, left) with bright island sky + curtains
  K.box(M.paint, -1.9, -0.7, 0.9, 2.2, ZB - 0.02, ZB + 0.06, 0xf2ece0, 0.01); mesh(root, plane(1.08, 1.18), M.winDay, -1.3, 1.55, ZB + 0.065, 0, 0, 0, false); K.box(M.paint, -1.33, -1.27, 0.95, 2.15, ZB + 0.06, ZB + 0.09, 0xf2ece0, 0.005);
  for (const s of [-1, 1]) K.box(M.paint, -1.3 + s * 0.68 - 0.12, -1.3 + s * 0.68 + 0.12, 0.85, 2.3, ZB + 0.06, ZB + 0.16, 0xd8c8a0, 0.04);
  // camp bed: frame, mattress, white sheet over a long body-shaped lump (head end left)
  const BZ = -1.0, BY = 0.55; K.box(M.wood, -1.15, 1.15, 0.3, BY - 0.05, BZ - 0.45, BZ + 0.45, 0x6a4024, 0.02); for (const x of [-1.1, 1.1]) for (const z of [-0.4, 0.4]) K.box(M.wood, x - 0.04, x + 0.04, 0, 0.32, BZ + z - 0.04, BZ + z + 0.04, 0x4a2a18, 0.01);
  K.beam(M.brass, [-1.15, 0.3, BZ - 0.45], [-1.15, 1.05, BZ - 0.45], 0.025, 0xc8a050, true, 8); K.beam(M.brass, [-1.15, 0.3, BZ + 0.45], [-1.15, 1.05, BZ + 0.45], 0.025, 0xc8a050, true, 8); K.beam(M.brass, [-1.15, 1.02, BZ - 0.45], [-1.15, 1.02, BZ + 0.45], 0.025, 0xc8a050, true, 8);
  K.box(M.paint, -1.1, 1.1, BY - 0.06, BY + 0.02, BZ - 0.42, BZ + 0.42, 0xf2ece0, 0.04);
  for (const [x, y, sx, sy, sz] of [[-0.82, 0.08, 0.14, 0.1, 0.14], [-0.2, 0.06, 0.62, 0.11, 0.26], [0.55, 0.05, 0.45, 0.08, 0.22], [0.95, 0.1, 0.06, 0.09, 0.16]]) K.put(M.sheet, sph(1, 20, 14), x, BY + y, BZ, 0, 0, 0, sx, sy, sz, 0xf6f4ee);
  K.box(M.sheet, -1.12, 1.12, BY - 0.02, BY + 0.05, BZ - 0.44, BZ + 0.44, 0xf2f0ea, 0.03); K.box(M.sheet, -1.12, 1.12, 0.3, BY, BZ + 0.43, BZ + 0.46, 0xeceae2, 0.01);
  const tape = new THREE.Group(); root.add(tape); { const k = new Kit(); k.box(M.tape, 0, 1, -0.012, 0.004, -0.03, 0.03, 0xf2d038, 0.002); k.build(tape); } tape.position.set(-0.98, BY + 0.24, BZ - 0.02);
  const tcase = new THREE.Group(); root.add(tcase); { const k = new Kit(); k.put(M.brass, cyl(0.07, 0.07, 0.04, 16), 0, 0, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0xc89a3a); k.build(tcase); }
  // side table with candle + the note, chair, washstand
  K.box(M.wood, 1.35, 1.95, 0.66, 0.7, BZ - 0.3, BZ + 0.3, 0x7a4a2a, 0.01); for (const [x, z] of [[1.4, -0.25], [1.9, -0.25], [1.4, 0.25], [1.9, 0.25]]) K.box(M.wood, x - 0.025, x + 0.025, 0, 0.66, BZ + z - 0.025, BZ + z + 0.025, 0x4a2a18, 0.005);
  candle(K, root, 1.8, 0.7, BZ - 0.15, glows); mesh(root, plane(0.3, 0.22), M.note, 1.55, 0.705, BZ + 0.1, -Math.PI / 2, 0, 0.2, false);
  K.at(-1.9, 0, 0.4, 0.6, () => { K.box(M.wood, -0.22, 0.22, 0.44, 0.48, -0.22, 0.22, 0x6a4024, 0.01); K.box(M.wood, -0.22, 0.22, 0.48, 1.0, -0.24, -0.2, 0x6a4024, 0.01); for (const [x, z] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) K.box(M.wood, x - 0.02, x + 0.02, 0, 0.44, z - 0.02, z + 0.02, 0x4a2a18, 0.005); });
  K.build(root, 3); const shaft = H.M.shaft.clone(); shaft.opacity = 0.18; const sh = nond(mesh(root, plane(1.2, 2.6), shaft, -1.1, 1.2, ZB + 0.9, 0.5, 0.2, 0.25, false)); sh.renderOrder = 5;
  const dust = motes(root, 80, [-2, 0.5, 0.4, 2.2, -2, 0], 4, 0.01);
  return { glows, tape, tcase, BY, BZ, dust }; }

// ================================================================= CHART (explainer room)
function buildChart(root) { const K = new Kit(), glows = [], ZB = -2.0;
  mesh(root, planeUV(10, 7, 1, 1), M.tile, 0, 0, 0, -Math.PI / 2, 0, 0, false); mesh(root, plane(10, 4), M.plaster, 0, 2, ZB, 0, 0, 0, false);
  for (const s of [-1, 1]) mesh(root, plane(6, 4), M.plaster, s * 5, 2, ZB + 3, 0, -s * Math.PI / 2, 0, false);
  // chart board: 1.2 m wide x 2.2 m tall, bottom at the floor
  K.box(M.wood, -0.66, 0.66, 0, 2.3, ZB, ZB + 0.04, 0x8a5a34, 0.01); mesh(root, plane(1.2, 2.2), M.chart, 0, 1.1, ZB + 0.045, 0, 0, 0, false);
  const marker = new THREE.Group(); root.add(marker); { const k = new Kit(); k.box(M.paint, -0.7, 0.7, -0.012, 0.012, 0, 0.04, 0xd0302c, 0.004); k.put(M.paint, cyl(0, 0.07, 0.12, 3), 0.78, 0, 0.02, 0, 0, Math.PI / 2, 1, 1, 1, 0xd0302c); k.build(marker); } marker.position.set(0, 0.5, ZB + 0.05);
  // plinth with the two inch bars (scaled x by bars(k))
  K.box(M.paint, 1.4, 2.8, 0, 0.9, -1.2, -0.6, 0xf2ece0, 0.02); K.box(M.paint, 1.36, 2.84, 0.9, 0.95, -1.24, -0.56, 0xd8d0c0, 0.01);
  const bars = []; for (const [i, mat, L, col] of [[0, M.barFR, 2.71, 0x2a4ab0], [1, M.barUK, 2.54, 0xc0302c]]) { const g = new THREE.Group(); g.position.set(1.5, 1.03 + (1 - i) * 0.22, -0.85); root.add(g);
    const b = mesh(g, plane(1, 1), mat, 0, 0, 0.0, 0, 0, 0, false); b.userData.L = L * 0.42; const box = new Kit(); box.box(M.paint, 0, 1, -0.07, 0.07, -0.08, 0, col, 0.01); box.build(g); bars.push({ g, b, L: L * 0.42 }); }
  // little potted plant + lamp on the left for coziness
  K.put(M.paint, cyl(0.16, 0.12, 0.3, 14), -2.0, 0.15, -1.5, 0, 0, 0, 1, 1, 1, 0xc86a3a); for (let i = 0; i < 4; i++) K.put(M.leaf, sph(0.18, 10, 8), -2.0 + Math.cos(i * 1.6) * 0.1, 0.42 + i * 0.06, -1.5 + Math.sin(i * 1.6) * 0.1, 0, 0, 0, 1, 1.2, 1, 0x4a8a3a);
  K.build(root, 3); return { glows, marker, bars, ZB }; }

// ================================================================= SHOP (London print shop / cartoonist studio)
function buildShop(root) { const K = new Kit(), glows = [], X = 3.0, ZB = -2.6, HT = 2.8, R = PT.rng(1803);
  mesh(root, planeUV(8, 7, 2, 2), M.floor, 0, 0, -0.5, -Math.PI / 2, 0, 0, false);
  mesh(root, plane(2 * X, HT - 1.0), M.plasterW, 0, 1.0 + (HT - 1.0) / 2, ZB, 0, 0, 0, false); mesh(root, plane(2 * X, 1.0), M.panelW, 0, 0.5, ZB + 0.01, 0, 0, 0, false);
  for (const s of [-1, 1]) { mesh(root, plane(6, HT - 1.0), M.plasterW, s * X, 1.0 + (HT - 1.0) / 2, ZB + 3, 0, -s * Math.PI / 2, 0, false); mesh(root, plane(6, 1.0), M.panelW, s * (X - 0.01), 0.5, ZB + 3, 0, -s * Math.PI / 2, 0, false); }
  mesh(root, plane(2 * X, 6), H.toon({ color: 0xd8c8a8, side: THREE.DoubleSide }), 0, HT, ZB + 3, Math.PI / 2, 0, 0, false); for (let x = -X; x <= X; x += 1.2) K.box(M.wood, x - 0.07, x + 0.07, HT - 0.16, HT, ZB, ZB + 6, 0x5a3a24, 0.01);
  // prints pinned on the back wall (the Boney ones in the middle, big)
  const P = []; mesh(root, plane(0.66, 0.88), M.giant, 0.1, 1.85, ZB + 0.02, 0, 0, 0.02, false); mesh(root, plane(0.5, 0.66), M.boney, -0.62, 1.78, ZB + 0.02, 0, 0, -0.04, false); mesh(root, plane(0.5, 0.66), M.boney2, 0.85, 1.8, ZB + 0.02, 0, 0, 0.05, false);
  for (let i = 0; i < 6; i++) { const x = [-2.4, -1.7, 1.6, 2.35, -2.05, 2.0][i], y = [1.9, 1.6, 1.95, 1.62, 1.25, 1.28][i]; mesh(root, plane(0.42, 0.52), M.print(i), x, y, ZB + 0.02, 0, 0, (R() - 0.5) * 0.12, false); }
  for (const [x, y] of [[0.1, 2.28], [-0.62, 2.1], [0.85, 2.13]]) K.put(M.paint, sph(0.02, 8, 6), x, y, ZB + 0.03, 0, 0, 0, 1, 1, 1, 0xc0302c);
  // prints strung on lines across the room (overhead)
  for (const [z, n] of [[-1.6, 5], [-0.6, 4]]) { K.beam(M.paint, [-X, 2.45, z], [X, 2.45, z], 0.006, 0x8a7a6a, true, 4); for (let i = 0; i < n; i++) { const x = -2.2 + i * 4.4 / (n - 1); mesh(root, plane(0.34, 0.44), i === 1 ? M.boney : M.print(i + 3), x, 2.2, z, 0, (R() - 0.5) * 0.3, (R() - 0.5) * 0.08, false); } }
  // window on the left wall: foggy London rooftops
  for (const [y0, y1, z0, z1] of [[0.88, 0.96, -1.6, 0.2], [2.24, 2.32, -1.6, 0.2], [0.88, 2.32, -1.62, -1.54], [0.88, 2.32, 0.14, 0.22]]) K.box(M.wood, -X + 0.02, -X + 0.12, y0, y1, z0, z1, 0x4a2a18, 0.01); mesh(root, plane(1.7, 1.3), M.winFog, -X + 0.03, 1.6, -0.7, 0, Math.PI / 2, 0, false);
  for (const z of [-1.15, -0.25]) K.box(M.wood, -X + 0.02, -X + 0.12, 0.95, 2.25, z - 0.025, z + 0.025, 0x4a2a18, 0.005); K.box(M.wood, -X + 0.02, -X + 0.12, 1.58, 1.62, -1.55, 0.15, 0x4a2a18, 0.005);
  // slanted drawing desk (centre-right): top tilted toward the camera, paper with Little Boney on it
  const DX = 0.9, DZ = -1.0, DY = 0.95; K.at(DX, 0, DZ, 0, () => { for (const [x, z, h] of [[-0.55, -0.3, 1.08], [0.55, -0.3, 1.08], [-0.55, 0.3, 0.86], [0.55, 0.3, 0.86]]) K.box(M.wood, x - 0.035, x + 0.035, 0, h, z - 0.035, z + 0.035, 0x5a3a20, 0.01);
    K.cb(M.wood, 1.25, 0.04, 0.72, 0, DY + 0.02, 0, 0x9a6a3a, 0.32); K.box(M.wood, -0.62, 0.62, DY - 0.18, DY - 0.15, -0.32, 0.32, 0x6a4024, 0.01); });
  const paper = mesh(root, plane(0.46, 0.6), M.boney, DX - 0.1, DY + 0.05, DZ + 0.02, -Math.PI / 2 + 0.32, 0, 0.06, false);
  K.put(M.paint, cyl(0.04, 0.045, 0.06, 12), DX + 0.45, DY + 0.18, DZ - 0.28, 0, 0, 0, 1, 1, 1, 0x1a1a24);
  candle(K, root, DX + 0.5, DY + 0.16, DZ - 0.1, glows, 0.8);
  // wooden press (back left) + paper stacks + counter (front left)
  K.at(-1.7, 0, -1.9, 0.15, () => { for (const s of [-1, 1]) K.box(M.wood, s * 0.45 - 0.07, s * 0.45 + 0.07, 0, 1.9, -0.3, 0.3, 0x5a3a20, 0.01); K.box(M.wood, -0.52, 0.52, 1.75, 1.9, -0.3, 0.3, 0x5a3a20, 0.01); K.box(M.wood, -0.45, 0.45, 0.8, 0.9, -0.35, 0.45, 0x7a4a2a, 0.01);
    K.beam(M.metal, [0, 1.75, 0], [0, 1.2, 0], 0.05, 0x3a3a42, true, 8); K.beam(M.metal, [-0.5, 1.45, 0.05], [0.5, 1.45, 0.05], 0.025, 0x3a3a42, true, 8); K.box(M.metal, -0.35, 0.35, 1.1, 1.2, -0.25, 0.25, 0x4a4a52, 0.01); });
  for (let i = 0; i < 6; i++) K.box(M.paint, -2.6, -2.1, 0.9 + i * 0.02, 0.91 + i * 0.02, -0.6 + (i % 2) * 0.02, -0.25, 0xf2ead6, 0.002);
  K.box(M.wood, -2.75, -1.95, 0, 0.9, -0.8, -0.05, 0x6a4024, 0.02);
  // pendant lamp
  K.beam(M.metal, [0, HT, -0.8], [0, 2.3, -0.8], 0.01, 0x2a2a30); K.put(M.paint, cyl(0.08, 0.24, 0.16, 16, true), 0, 2.24, -0.8, 0, 0, 0, 1, 1, 1, 0x2a4a3a); K.put(M.lampOn, sph(0.06, 10, 8), 0, 2.17, -0.8); glows.push(glowAt(root, [0, 2.17, -0.8], 1.0, '#ffc878', 0.45));
  K.build(root, 3); const dust = motes(root, 100, [-2.5, 2.5, 0.4, 2.4, -2.4, 0.6], 6, 0.01);
  return { glows, paper, dust, DX, DY, DZ, ZB }; }

// ================================================================= PARADE (sunny parade ground)
function buildParade(root) { const K = new Kit(), R = PT.rng(1804), glows = [];
  mesh(root, planeUV(400, 400, 1, 1), M.grass, 0, -0.01, -150, -Math.PI / 2, 0, 0, false); mesh(root, planeUV(80, 60, 1, 1), M.gravel, 0, 0, -20, -Math.PI / 2, 0, 0, false);
  // long palace facade far back
  K.box(M.paint, -48, 48, 0, 13, -58, -52, 0xe8dcc0, 0.05); mesh(root, plane(96, 12), M.facade, 0, 6.2, -51.95, 0, 0, 0, false); K.box(M.paint, -50, 50, 13, 14.2, -59, -51.4, 0xd8c8a8, 0.05);
  K.box(M.paint, -50, 50, 14.2, 17, -58, -53, 0x6a7a9a, 0.05); K.at(0, 14, -52, 0, () => { K.box(M.paint, -8, 8, 0, 6, -6, 0.2, 0xe8dcc0, 0.05); K.put(M.paint, cyl(0.01, 9, 4.5, 3), 0, 8.2, -1.2, 0, 0, 0, 1, 1, 0.12, 0xd8c8a8); });
  for (let i = -6; i <= 6; i++) K.put(M.paint, cyl(0.5, 0.55, 10, 12), i * 1.3, 5, -51.2, 0, 0, 0, 1, 1, 1, 0xf2ead6);
  // trees + flagpoles + low railings + stacked drums (cozy props)
  for (let i = 0; i < 14; i++) { const s = i < 7 ? -1 : 1, k = i % 7; tree(K, s * (14 + k * 4.5), -30 - k * 3 + R() * 2, 1.4 + R() * 0.4, R); }
  const flags = []; for (const x of [-10, 10]) { K.beam(M.paint, [x, 0, -22], [x, 9, -22], 0.08, 0xf2ece0, true, 8); K.put(M.gold, sph(0.18, 10, 8), x, 9.1, -22, 0, 0, 0, 1, 1, 1, 0xd8b048); flags.push(mesh(root, plane(2.6, 1.7), M.flag, x + 1.35, 8.0, -22, 0, 0, 0, false)); }
  for (const s of [-1, 1]) for (let i = 0; i < 12; i++) { const x = s * (6 + i * 1.2); K.beam(M.metal, [x, 0, -14], [x, 0.9, -14], 0.025, 0x2a2a30); } for (const s of [-1, 1]) K.beam(M.metal, [s * 6, 0.85, -14], [s * 19.2, 0.85, -14], 0.025, 0x2a2a30);
  for (let i = 0; i < 3; i++) { const x = 4.5 + (i % 2) * 0.55, y = (i > 1 ? 0.45 : 0) + 0.22; K.put(M.paint, cyl(0.26, 0.26, 0.42, 16), x + (i > 1 ? 0.27 : 0), y, -3.5, 0, 0, 0, 1, 1, 1, 0x2a4ab0); K.put(M.paint, cyl(0.27, 0.27, 0.05, 16), x + (i > 1 ? 0.27 : 0), y + 0.2, -3.5, 0, 0, 0, 1, 1, 1, 0xd0302c); }
  K.build(root, 4); return { glows, flags }; }

// ================================================================= MUSEUM (modern gallery)
function buildMuseum(root) { const K = new Kit(), glows = [], X = 3.0, ZB = -2.4, HT = 3.2;
  mesh(root, planeUV(8, 7, 2, 2), M.floorM, 0, 0, -0.5, -Math.PI / 2, 0, 0, false);
  mesh(root, plane(2 * X, HT), M.wallM, 0, HT / 2, ZB, 0, 0, 0, false); for (const s of [-1, 1]) mesh(root, plane(6, HT), M.wallM, s * X, HT / 2, ZB + 3, 0, -s * Math.PI / 2, 0, false);
  mesh(root, plane(2 * X, 6), H.toon({ color: 0xf4f0ea, side: THREE.DoubleSide }), 0, HT, ZB + 3, Math.PI / 2, 0, 0, false); K.box(M.paint, -X, X, 0, 0.1, ZB, ZB + 0.02, 0x2e3240, 0.003);
  // portrait (left) + caricature (right), picture lights, placards
  mesh(root, plane(0.9, 1.12), M.portrait, -1.0, 1.65, ZB + 0.05, 0, 0, 0, false); frame(K, -1.0, 1.65, ZB, 0.9, 1.12);
  mesh(root, plane(0.66, 0.88), M.giant, 1.0, 1.6, ZB + 0.05, 0, 0, 0, false); frame(K, 1.0, 1.6, ZB, 0.66, 0.88, 0x2a2a30);
  mesh(root, plane(0.44, 0.22), M.plac1, -1.0, 0.86, ZB + 0.02, 0, 0, 0, false); mesh(root, plane(0.44, 0.22), M.plac2, 1.0, 0.92, ZB + 0.02, 0, 0, 0, false);
  for (const [x, y] of [[-1.0, 2.4], [1.0, 2.25]]) { K.beam(M.chrome, [x, y, ZB + 0.02], [x, y + 0.04, ZB + 0.22], 0.012, 0x3a3a42, true, 6); K.put(M.paint, cyl(0.03, 0.05, 0.14, 10), x, y + 0.04, ZB + 0.24, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2a30); }
  const spot = H.M.shaft.clone(); spot.opacity = 0.16; for (const x of [-1.0, 1.0]) { const s = nond(mesh(root, plane(1.4, 1.6), spot, x, 1.75, ZB + 0.12, Math.PI, 0, 0, false)); s.renderOrder = 5; }
  // rope barrier + bench
  for (const x of [-2.0, 0, 2.0]) { K.put(M.chrome, cyl(0.15, 0.17, 0.04, 16), x, 0.02, -1.4, 0, 0, 0, 1, 1, 1, 0xc8a050); K.beam(M.chrome, [x, 0, -1.4], [x, 0.9, -1.4], 0.025, 0xc8a050, true, 8); K.put(M.chrome, sph(0.04, 8, 6), x, 0.92, -1.4, 0, 0, 0, 1, 1, 1, 0xc8a050); }
  for (const s of [-1, 1]) { const P = []; for (let i = 0; i <= 8; i++) { const t = i / 8; P.push(new THREE.Vector3(s * 2.0 * t, 0.86 - 0.12 * Math.sin(Math.PI * t), -1.4)); } const tb = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 20, 0.018, 6), M.vc({ color: 0xa8282c })); root.add(tb); }
  K.box(M.wood, -0.9, 0.9, 0.42, 0.48, 0.6, 1.0, 0xa8784a, 0.02); for (const x of [-0.8, 0.8]) K.box(M.chrome, x - 0.03, x + 0.03, 0, 0.42, 0.62, 0.98, 0x3a3a42, 0.005);
  K.build(root, 3); return { glows }; }

// ================================================================= lights, grades, API
const WARM = (o = {}) => ({ top: '#000000', hor: '#3a2a1e', fog: '#3a2a1e', fogN: 12, fogF: 60, sky: '#ffe8d0', ground: '#6a4a32', hemiI: 1.05, fillCol: '#8a90c8', fillI: 0.26, sunCol: '#ffd8a8', sunI: 1.0, az: 20, el: 60, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0, ...o });
const SET_LIGHT = {
  tent: WARM({ hemiI: 1.0, sunCol: '#ffd8a0', sunI: 1.0, az: -30 }),
  tentMap: WARM({ hemiI: 1.05, sunI: 1.1 }),
  helena: WARM({ hor: '#2a3a30', fog: '#2a3028', sky: '#e8f0ff', ground: '#4a4a3a', hemiI: 1.1, sunCol: '#fff0d8', sunI: 1.4, az: -120, el: 40, cardTint: '#f4f0ea' }),
  chart: WARM({ hor: '#e8e0d0', fog: '#e8e0d0', fogN: 20, fogF: 90, sky: '#ffffff', ground: '#9a8a70', hemiI: 1.3, sunCol: '#fff4e0', sunI: 1.6, az: 30, el: 50, cardTint: '#ffffff' }),
  shop: WARM({ hemiI: 0.95, sunCol: '#ffd8a8', sunI: 1.0, az: 60 }),
  shopFog: WARM({ hemiI: 1.0, sunCol: '#e0e4f0', sunI: 1.1, az: -90, el: 35 }),
  parade: { top: '#4f8ad8', hor: '#b8d0ee', fog: '#d8e8f8', fogN: 60, fogF: 420, sky: '#9fb8f0', ground: '#6a5a4a', hemiI: 0.75, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#ffe6bc', sunI: 3.4, az: 40, el: 40, disc: '#fffbe8', cloud: '#ffffff', clouds: true, cardTint: '#ffffff', fxTint: '#ffffff', shadow: true, shafts: 0.3 },
  paradeLow: { top: '#4f8ad8', hor: '#b8d0ee', fog: '#d8e8f8', fogN: 60, fogF: 420, sky: '#9fb8f0', ground: '#6a5a4a', hemiI: 0.8, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#ffe6bc', sunI: 3.4, az: 140, el: 34, disc: '#fffbe8', cloud: '#ffffff', clouds: true, cardTint: '#ffffff', fxTint: '#ffffff', shadow: true, shafts: 0.5 },
  museum: WARM({ hor: '#e8e4dc', fog: '#e8e4dc', fogN: 20, fogF: 80, sky: '#ffffff', ground: '#9a8a7a', hemiI: 1.25, fillCol: '#a0a8d8', sunCol: '#fff2dc', sunI: 1.4, az: 10, el: 60, cardTint: '#ffffff' }),
};
const G = (o) => ({ look: 'office', over: o });
const SET_GRADE = {
  tent: G({ exp: 1.0, con: 1.18, sat: 1.0, lift: [0.035, 0.024, 0.03], tS: ['#3a2a6a', 0.14], tH: ['#ffc888', 0.14], bloom: [0.45, 0.72], hal: [0.3, '#ff9a50'], vig: [0.3, 0.46, '#2a1410'] }),
  tentMap: G({ exp: 1.02, con: 1.18, sat: 1.02, lift: [0.035, 0.024, 0.03], tS: ['#3a2a6a', 0.14], tH: ['#ffc888', 0.14], bloom: [0.45, 0.72], hal: [0.3, '#ff9a50'], vig: [0.3, 0.46, '#2a1410'] }),
  helena: G({ exp: 1.04, con: 1.16, sat: 0.95, lift: [0.03, 0.03, 0.035], tS: ['#2a3a5a', 0.14], tH: ['#fff0d0', 0.12], bloom: [0.45, 0.7], hal: [0.25, '#ffe0b0'], vig: [0.3, 0.46, '#141a18'] }),
  chart: G({ exp: 1.06, con: 1.12, sat: 1.06, lift: [0.03, 0.03, 0.035], tS: ['#3a3a7a', 0.1], tH: ['#fff0d8', 0.1], bloom: [0.45, 0.74], hal: [0.2, '#ffe0b0'], vig: [0.24, 0.5, '#2a2430'] }),
  shop: G({ exp: 1.0, con: 1.2, sat: 1.0, lift: [0.035, 0.024, 0.03], tS: ['#3a2a6a', 0.14], tH: ['#ffc888', 0.14], bloom: [0.45, 0.72], hal: [0.3, '#ff9a50'], vig: [0.32, 0.46, '#2a1410'] }),
  shopFog: G({ exp: 1.02, con: 1.16, sat: 0.94, lift: [0.035, 0.03, 0.035], tS: ['#3a3a6a', 0.14], tH: ['#ffe0b8', 0.12], bloom: [0.45, 0.72], hal: [0.24, '#ffd0a0'], vig: [0.32, 0.46, '#1a1418'] }),
  parade: { look: 'day', over: { exp: 1.0, con: 1.12, sat: 1.08, lift: [0.02, 0.02, 0.03], tS: ['#3a4a8a', 0.12], tH: ['#ffe0b0', 0.1], bloom: [0.5, 0.75], vig: [0.22, 0.5, '#1a2040'] } },
  paradeLow: { look: 'day', over: { exp: 1.0, con: 1.14, sat: 1.08, lift: [0.02, 0.02, 0.03], tS: ['#3a4a8a', 0.12], tH: ['#ffe0b0', 0.12], bloom: [0.5, 0.72], vig: [0.24, 0.5, '#1a2040'] } },
  museum: G({ exp: 1.06, con: 1.12, sat: 1.04, lift: [0.03, 0.03, 0.035], tS: ['#3a3a7a', 0.1], tH: ['#fff0d8', 0.1], bloom: [0.45, 0.74], hal: [0.2, '#ffe0b0'], vig: [0.26, 0.48, '#2a2430'] }),
};
const GROUP_OF = { tent: 'tent', tentMap: 'tent', helena: 'helena', chart: 'chart', shop: 'shop', shopFog: 'shop', parade: 'parade', paradeLow: 'parade', museum: 'museum' };

export function buildNapoleon(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  let tn, he, ch, sh, pa, mu;
  const API = makeAPI(ctx, { prefix: 'np_', origin: NP_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { tent: 'office', tentMap: 'office', helena: 'office', chart: 'office', shop: 'office', shopFog: 'office', museum: 'office', parade: 'day', paradeLow: 'day' },
    practicals: (name, F, W3) => { const fl = 1 + 0.08 * Math.sin(F * 0.9) * Math.sin(F * 0.37);
      if (name === 'tent' || name === 'tentMap') return [{ p: W3('tent', [-0.95, 1.15, -1.2]), col: '#ffb060', I: 2.6 * fl, d: 4 }, { p: W3('tent', [0.95, 1.15, -1.25]), col: '#ffb060', I: 2.6 * fl, d: 4 }, { p: W3('tent', [0, 2.2, -0.7]), col: '#ffd8a0', I: 2.4, d: 6 }, { p: W3('tent', [0, 1.8, 1.8]), col: '#ffe8c8', I: 1.6, d: 7 }];
      if (name === 'helena') return [{ p: W3('helena', [-1.3, 1.6, -1.6]), col: '#e8f0ff', I: 3.2, d: 6 }, { p: W3('helena', [1.8, 1.0, -1.15]), col: '#ffc070', I: 1.6 * fl, d: 3 }, { p: W3('helena', [0, 2.0, 1.4]), col: '#fff0e0', I: 1.4, d: 6 }];
      if (name === 'chart') return [{ p: W3('chart', [0, 2.6, 0.6]), col: '#fff4e0', I: 3, d: 7 }, { p: W3('chart', [2, 2.2, 0.4]), col: '#fff4e0', I: 2, d: 6 }];
      if (name === 'shop' || name === 'shopFog') return [{ p: W3('shop', [1.4, 1.3, -1.1]), col: '#ffb860', I: 2.2 * fl, d: 3.5 }, { p: W3('shop', [0, 2.15, -0.8]), col: '#ffd8a0', I: 2.4, d: 6 }, { p: W3('shop', [-2.6, 1.6, -0.7]), col: '#d8e0f0', I: 2.2, d: 5 }, { p: W3('shop', [0, 1.8, 1.4]), col: '#ffe8c8', I: 1.4, d: 6 }];
      if (name === 'museum') return [{ p: W3('museum', [-1.0, 2.5, -1.9]), col: '#fff0d8', I: 2.6, d: 4 }, { p: W3('museum', [1.0, 2.4, -1.9]), col: '#fff0d8', I: 2.6, d: 4 }, { p: W3('museum', [0, 2.8, 0.8]), col: '#ffffff', I: 2.2, d: 7 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'tent' && tn) { tickMotes(tn.dust, f, 0.4); tn.flag.rotation.y = 0.12 * Math.sin(T * 1.7); }
      if (cur === 'helena' && he) tickMotes(he.dust, f, 0.3);
      if (cur === 'shop' && sh) tickMotes(sh.dust, f, 0.4);
      if (cur === 'parade' && pa) pa.flags.forEach((g, i) => { g.rotation.y = 0.18 * Math.sin(T * 2.1 + i); }); },
    apply: (v) => { if (v.tape != null) API.tape(v.tape); if (v.mark != null) API.mark(...v.mark); if (v.bars != null) API.bars(v.bars); } });
  tn = buildTent(API.groups.tent); he = buildHelena(API.groups.helena); ch = buildChart(API.groups.chart); sh = buildShop(API.groups.shop); pa = buildParade(API.groups.parade); mu = buildMuseum(API.groups.museum);
  API.parts = { tn, he, ch, sh, pa, mu };
  // [NAP-sets] state setters
  API.tape = (k) => { const L = 1.92 * clamp01(k); he.tape.visible = k > 0.001; he.tape.scale.x = Math.max(0.001, L); he.tcase.visible = k > 0.001; he.tcase.position.set(-0.98 + L + 0.06, he.BY + 0.26, he.BZ - 0.02); };
  API.mark = (y, k = 1) => { ch.marker.visible = k > 0.001; ch.marker.position.y = y; };
  API.bars = (k) => { ch.bars.forEach(({ g, L }, i) => { const t = clamp01(k * 1.4 - i * 0.4); g.visible = t > 0.001; g.scale.set(Math.max(0.001, L * t), 1, 1); g.children[0].scale.set(1, 0.14 / 1, 1); g.children[0].position.set(0.5, 0, 0.005); }); };
  API.glows = { tent: tn.glows, helena: he.glows, chart: ch.glows, shop: sh.glows, parade: pa.glows, museum: mu.glows };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  const V = API.V;
  API.views = [
    V('tent', [0.3, 1.6, 2.6], [0, 1.1, -2.4], 54, 1.6, [0, 1.0, -0.8]),                     // 0 tent wide
    V('tentMap', [0.2, 2.0, 0.6], [0, 0.85, -0.8], 50, 3, [0, 0.86, -0.75]),                  // 1 map table close
    V('helena', [0.4, 1.5, 2.2], [-0.1, 0.9, -1.6], 54, 1.6, [0, 0.7, -1.0], { tape: 0.6 }),  // 2 helena wide
    V('helena', [0.3, 1.0, 0.4], [-0.1, 0.7, -1.0], 48, 3, [0, 0.7, -1.0], { tape: 1 }),      // 3 tape close
    V('chart', [0.6, 1.3, 3.2], [0.4, 1.1, -2.0], 50, 1.6, [0, 1.0, -1.6], { mark: [1.69, 1], bars: 1 }), // 4 chart wide
    V('chart', [1.9, 1.3, 0.6], [2.1, 1.0, -0.8], 44, 3, [2.1, 1.0, -0.8], { bars: 1 }),      // 5 inch bars close
    V('shop', [0.3, 1.6, 2.6], [0, 1.3, -2.6], 56, 1.6, [0, 1.2, -1.0]),                      // 6 shop wide
    V('shop', [0.9, 1.6, 0.0], [0.85, 1.0, -1.0], 46, 3, [0.85, 1.0, -0.95]),                 // 7 desk close (Boney paper)
    V('shop', [0.2, 1.7, 0.6], [0.1, 1.8, -2.6], 48, 3, [0.1, 1.8, -2.5]),                    // 8 prints wall
    V('shopFog', [0.5, 1.5, 1.0], [-3, 1.5, -0.7], 54, 2, [-2.9, 1.5, -0.7]),                // 9 window onto London
    V('parade', [0, 1.6, 9], [0, 3, -50], 54, 1.0, [0, 1.5, -4]),                             // 10 parade wide
    V('paradeLow', [0.6, 0.5, 3.0], [0, 2.6, -2], 50, 1.6, [0, 2.0, -1.5]),                   // 11 parade low angle
    V('museum', [0.2, 1.5, 2.8], [0, 1.4, -2.4], 54, 1.6, [0, 1.3, -1.2]),                    // 12 museum wide
    V('museum', [0.9, 1.6, 0.0], [1.0, 1.55, -2.4], 46, 3, [1.0, 1.6, -2.35]),                // 13 caricature close
  ];
  API.tape(0); API.mark(1, 0); API.bars(0); API.tick(0);
  return API;
}
