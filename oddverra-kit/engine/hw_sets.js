// hw_sets.js [HW-sets]: sets for "The Hollywood sign was an ad that said HOLLYWOODLAND" (Oddverra short).
//   hill   : Mount Lee style chaparral ridge above a canyon of 1920s Spanish-revival houses, with the 13 sheet-metal letters
//            H O L L Y W O O D L A N D (~15 m tall, ~10.5 m pitch) on telephone-pole frames, bulbs outlining each letter in three
//            flash segments HOLLY / WOOD / LAND, a mule trail, scaffolding, the far city on the plain. One location, many moods:
//            'hill23' (1923 build, noon), 'hill23n' (1923 night, bulbs), 'hill44' (storm, weathered, H falls: fallH(t)),
//            'hill49' (1949 crew day: landOff(t) topples L A N D), 'hill70' (1970s decay, dusk), 'hill78' (new steel letters, sunset),
//            'hillNow' (today, golden, viewpoint rail + tourist spot).                                     origin (-34000, 0, 0)
//   office : 1923 HOLLYWOODLAND tract sales office: big lot map with SOLD flags (sold(t)), banner, window onto the hills, desk with
//            blueprint of the sign, phone, typewriter, wall calendar (calendar(i)); 'officeBust' = closed, dusty, cobwebs.  origin (-36500, 0, 0)
//   gala   : 1978 save-the-sign fundraiser: stage, curtains, disco ball, string lights, round tables, SPONSOR A LETTER board with 9 tiles
//            and SOLD stamps (gsold(t) 0..9).                                                                    origin (-36500, 0, 600)
// Each set: local frame, camera side +z. Test flag ?hwview=N (main.js).
import { Kit } from './world.js';
import { Font } from './fontload.js';
import { H, TAU, clamp01, sm, backOut, SERIF, SANS, cyl, sph, tor, plane, planeUV, lathe, mesh, nond, lumpGeo, shapeGeo, starPts,
  txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';

const FONT = new Font(await (await fetch('./helv_bold.json')).json());
export const HW_ORIGIN = { hill: [-34000, 0, 0], office: [-36500, 0, 0], gala: [-36500, 0, 600] };
const GROUP_OF = { hill30: 'hill', hill23: 'hill', hill23n: 'hill', hill44: 'hill', hill49: 'hill', hill70: 'hill', hill78: 'hill', hillNow: 'hill', office: 'office', officeBust: 'office', gala: 'gala' };
let THREE, PT, M;
export const WORD = 'HOLLYWOODLAND', SEG = [0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2];
export const CLEAR = []; // [x, z, r] local spots kept free of bushes (camera positions pushed by the story)
export const LH = 15, LW = 9.0, PITCH = 10.6;
// terrain: ridge rises toward -z, canyon / plain toward +z
export function hf(x, z) { const s = -z; let y = s >= 0 ? (s < 40 ? 0.62 * s : 24.8 + 9 * (1 - Math.exp(-(s - 40) / 14))) : -95 * (1 - Math.exp(0.62 * s / 95));
  y += 3.5 * Math.sin(x * 0.021 + 1.3) * sm(-5, -45, z) + 1.6 * Math.sin(x * 0.07 + z * 0.05) + 0.9 * Math.sin(x * 0.17 - z * 0.11);
  y -= 6 * Math.exp(-((x - 95) ** 2) / 900) * sm(-20, 30, z); return y; }
export const LX = (i) => (i - 6) * PITCH + (i === 5 || i === 6 ? 0.4 : 0), LZ = (i) => 1.4 * Math.sin(i * 1.7) - 0.02 * (i - 6) ** 2, LY = (i) => hf(LX(i), LZ(i)) - 0.7;
// mule trail (local): switchback polyline up to the letters
const TRAIL = [[-64, 58], [-40, 50], [-14, 40], [8, 33], [-10, 24], [-34, 18], [-20, 10], [-4, 6]];
export function trailAt(t) { const n = TRAIL.length - 1, u = clamp01(t) * n, i = Math.min(n - 1, Math.floor(u)), k = u - i, a = TRAIL[i], b = TRAIL[i + 1];
  const x = a[0] + (b[0] - a[0]) * k, z = a[1] + (b[1] - a[1]) * k; return { p: [x, hf(x, z), z], dir: [b[0] - a[0], b[1] - a[1]] }; }
const nearTrail = (x, z) => { let d = 1e9; for (let i = 0; i < TRAIL.length - 1; i++) { const [ax, az] = TRAIL[i], [bx, bz] = TRAIL[i + 1], vx = bx - ax, vz = bz - az, t = clamp01(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)); d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t)); } return d; };

// ---------------------------------------------------------------- painters
function sheetTex(g, w, h) { g.fillStyle = '#f2eee4'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.93 + 0.08 * PT.fbm(u, v, 4, 4, 3, 5));
  g.strokeStyle = 'rgba(90,80,90,0.55)'; g.lineWidth = 3; for (let i = 0; i <= 3; i++) { g.beginPath(); g.moveTo(i * w / 3, 0); g.lineTo(i * w / 3, h); g.stroke(); } g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
  g.fillStyle = 'rgba(70,60,70,0.55)'; for (let i = 0; i <= 3; i++) for (let j = 0; j < 12; j++) { g.beginPath(); g.arc(i * w / 3 + 5, j * h / 12 + 10, 2.2, 0, TAU); g.fill(); } grain(g, w, h, 'rgba(120,110,100,1)', 600, 3, 0.25); }
function oldTex(g, w, h, seed = 7) { g.fillStyle = '#c8bca4'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.78 + 0.3 * PT.fbm(u, v, 5, 5, 4, seed)); const R = PT.rng(seed);
  for (let i = 0; i < 40; i++) { const x = R() * w, y = R() * h * 0.6, L = 40 + R() * 160; const gr = g.createLinearGradient(x, y, x, y + L); gr.addColorStop(0, 'rgba(140,70,30,0.55)'); gr.addColorStop(1, 'rgba(140,70,30,0)'); g.fillStyle = gr; g.fillRect(x, y, 3 + R() * 6, L); }
  g.strokeStyle = 'rgba(80,60,60,0.5)'; g.lineWidth = 3; for (let i = 0; i <= 3; i++) { g.beginPath(); g.moveTo(i * w / 3, 0); g.lineTo(i * w / 3, h); g.stroke(); }
  g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 4; i++) { const pw = w / 3, ph = h / 5, cx = Math.floor(R() * 3) * pw, cy = Math.floor(R() * 4) * ph; g.fillStyle = '#000'; if (R() < 0.6) g.fillRect(cx + 2, cy + 2, pw - 4, ph * (0.3 + R() * 0.4)); else { g.beginPath(); g.ellipse(cx + pw / 2, cy + ph / 2, pw * 0.3, ph * 0.4, R(), 0, TAU); g.fill(); } }
  g.globalCompositeOperation = 'source-over'; grain(g, w, h, 'rgba(90,70,60,1)', 900, seed, 0.35); }
function newTex(g, w, h) { g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { const gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, 'rgba(160,170,200,0.28)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(160,170,200,0.12)'); g.fillStyle = gr; g.fillRect(x, 0, 16, h); }
  g.fillStyle = 'rgba(120,120,140,0.35)'; g.fillRect(0, h / 2 - 1, w, 2); }
function tileTex(g, w, h) { g.fillStyle = '#c0583a'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 * 8; x < w; x += 16) { const gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, '#a84a30'); gr.addColorStop(0.5, '#d86a48'); gr.addColorStop(1, '#a84a30'); g.fillStyle = gr; g.fillRect(x, y, 15, 14); } }
function stuccoTex(g, w, h) { g.fillStyle = '#f2e8d8'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 6, 6, 4, 9)); }
function lotMap(g, w, h) { PT.paper(g, w, h, { base: '#efe4c8', seed: 21 }); const R = PT.rng(5);
  txt(g, 'HOLLYWOODLAND', w / 2, h * 0.08, w * 0.8, h * 0.08, { col: '#2a3a5a', font: SERIF }); txt(g, 'LOTS FOR SALE', w / 2, h * 0.15, w * 0.5, h * 0.045, { col: '#a8322a', font: SERIF });
  g.strokeStyle = '#b89a6a'; g.lineWidth = 14; g.lineCap = 'round'; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(w * 0.05, h * (0.3 + k * 0.17)); g.bezierCurveTo(w * 0.35, h * (0.22 + k * 0.17), w * 0.6, h * (0.4 + k * 0.17), w * 0.95, h * (0.28 + k * 0.17)); g.stroke(); }
  g.strokeStyle = '#4a5a7a'; g.lineWidth = 2; for (let i = 0; i < 70; i++) { const x = w * (0.07 + (i % 10) * 0.088), y = h * (0.24 + Math.floor(i / 10) * 0.1); g.strokeRect(x, y, w * 0.07, h * 0.06); }
  g.fillStyle = 'rgba(80,140,80,0.35)'; for (let i = 0; i < 18; i++) { g.beginPath(); g.arc(R() * w, h * (0.2 + R() * 0.75), 10 + R() * 16, 0, TAU); g.fill(); } }
function bannerTex(g, w, h) { g.fillStyle = '#2a3a5a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8c060'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16);
  txt(g, 'HOLLYWOODLAND', w / 2, h * 0.42, w * 0.86, h * 0.5, { col: '#f6e8c0', shadow: 'rgba(0,0,0,0.5)', font: SERIF }); txt(g, 'HOMES IN THE HILLS', w / 2, h * 0.8, w * 0.5, h * 0.16, { col: '#e8c060', font: SERIF }); }
function hillsView(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6aa0e8'); gr.addColorStop(0.7, '#cfe2f6'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#9a9a6a'; g.beginPath(); g.moveTo(0, h * 0.55); g.bezierCurveTo(w * 0.3, h * 0.3, w * 0.6, h * 0.32, w, h * 0.5); g.lineTo(w, h); g.lineTo(0, h); g.fill();
  g.fillStyle = '#7a8a5a'; g.beginPath(); g.moveTo(0, h * 0.75); g.bezierCurveTo(w * 0.3, h * 0.6, w * 0.7, h * 0.7, w, h * 0.68); g.lineTo(w, h); g.lineTo(0, h); g.fill();
  g.save(); g.translate(w * 0.5, h * 0.4); g.rotate(-0.08); txt(g, 'HOLLYWOODLAND', 0, 0, w * 0.5, h * 0.06, { col: '#ffffff', font: SANS }); g.restore();
  for (let i = 0; i < 9; i++) { const x = w * (0.1 + i * 0.1), y = h * (0.8 + 0.05 * Math.sin(i)); g.fillStyle = '#f4ece0'; g.fillRect(x, y, 26, 16); g.fillStyle = '#c0583a'; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 13, y - 10); g.lineTo(x + 30, y); g.fill(); } }
function calTex(g, w, h, mon, yr) { g.fillStyle = '#f8f4ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#a8322a'; g.fillRect(0, 0, w, h * 0.3); txt(g, mon, w / 2, h * 0.12, w * 0.8, h * 0.13, { col: '#fff4e0', font: SERIF }); txt(g, yr, w / 2, h * 0.24, w * 0.5, h * 0.08, { col: '#fff4e0', font: SERIF });
  g.fillStyle = '#3a3a4a'; for (let i = 0; i < 30; i++) { g.font = `bold ${h * 0.05}px ${SANS}`; g.textAlign = 'center'; g.fillText(String(i + 1), w * (0.12 + (i % 7) * 0.127), h * (0.4 + Math.floor(i / 7) * 0.12)); } }
function blueprint(g, w, h) { g.fillStyle = '#1f4a8a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(200,220,255,0.25)'; g.lineWidth = 1; for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  txt(g, 'HOLLYWOODLAND', w / 2, h * 0.45, w * 0.9, h * 0.3, { col: 'rgba(0,0,0,0)', stroke: '#e8f0ff', sw: 3, font: SANS }); txt(g, 'SIGN PLAN · LETTERS 50 FT', w / 2, h * 0.82, w * 0.6, h * 0.08, { col: '#e8f0ff', font: SANS });
  g.strokeStyle = '#e8f0ff'; g.lineWidth = 2; g.beginPath(); g.moveTo(w * 0.04, h * 0.22); g.lineTo(w * 0.04, h * 0.68); g.stroke(); }
function closedTex(g, w, h) { g.fillStyle = '#f2ead6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a1a14'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); txt(g, 'CLOSED', w / 2, h * 0.5, w * 0.8, h * 0.5, { col: '#a8221a', font: SERIF }); }
function curtainTex(g, w, h) { for (let x = 0; x < w; x += 4) { const k = 0.6 + 0.4 * Math.sin(x / w * TAU * 7); g.fillStyle = `rgb(${150 * k + 40 | 0},${20 * k | 0},${40 * k + 10 | 0})`; g.fillRect(x, 0, 4, h); } }
function sponsorTex(g, w, h) { g.fillStyle = '#1c1a3a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f0c040'; g.lineWidth = 10; g.strokeRect(14, 14, w - 28, h - 28);
  txt(g, 'SAVE THE SIGN!', w / 2, h * 0.12, w * 0.8, h * 0.11, { col: '#ffe8a0', font: SERIF }); txt(g, 'SPONSOR A LETTER', w / 2, h * 0.24, w * 0.7, h * 0.07, { col: '#ffffff', font: SANS });
  for (let i = 0; i < 9; i++) { const x = w * (0.06 + i * 0.1); g.fillStyle = '#f8f4ea'; g.fillRect(x, h * 0.36, w * 0.08, h * 0.32); txt(g, 'HOLLYWOOD'[i], x + w * 0.04, h * 0.53, w * 0.07, h * 0.24, { col: '#1c1a3a', font: SANS }); }
  txt(g, '$27,700 EACH', w / 2, h * 0.84, w * 0.6, h * 0.11, { col: '#7ae0a0', font: SANS }); }
function soldTex(g, w, h) { g.clearRect(0, 0, w, h); g.save(); g.translate(w / 2, h / 2); g.rotate(-0.4); g.strokeStyle = '#e8302a'; g.lineWidth = 8; g.strokeRect(-w * 0.42, -h * 0.17, w * 0.84, h * 0.34); txt(g, 'SOLD', 0, 0, w * 0.75, h * 0.28, { col: '#e8302a', font: SANS }); g.restore(); }
function saveBanner(g, w, h) { g.fillStyle = '#f0c040'; g.fillRect(0, 0, w, h); txt(g, '1978 · HOLLYWOOD SIGN GALA', w / 2, h / 2, w * 0.9, h * 0.6, { col: '#2a1a3a', font: SANS }); }
function mirrorTex(g, w, h) { for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 8) { const v = 140 + 115 * Math.random(); g.fillStyle = `rgb(${v | 0},${v | 0},${v + 10 | 0})`; g.fillRect(x, y, 7, 7); } }
function vpSign(g, w, h) { PT.planks(g, w, h, { base: '#6a4a30', n: 2, seed: 4, joints: 0 }); txt(g, 'SIGN VIEWPOINT', w / 2, h * 0.5, w * 0.86, h * 0.5, { col: '#f4e8c8', font: SANS }); }

// ---------------------------------------------------------------- materials
function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.ground = vc(); if (H.MACRO) H.MACRO(m.ground, 0.22, 0.08);
  const face = (map, o = {}) => { const x = toon({ map, emissive: 0x000000, ...o }); x.emissiveMap = map; return x; };
  const sheet = T(256, 256, sheetTex, [1 / 3, 1 / 3]); m.face = [0, 1, 2].map(() => face(sheet)); m.faceRep = face(sheet);
  m.faceOld = [0, 1, 2].map((s) => { const x = face(T(256, 512, (g, w, h) => oldTex(g, w, h, 7 + s), [1 / 9, 1 / 15]), { transparent: false, alphaTest: 0.5, side: THREE.DoubleSide }); return x; });
  m.faceNew = face(T(256, 256, newTex, [1 / 4, 1 / 14])); m.faceNew.emissive.set(0x1a1a20);
  m.pole = vc({ map: T(128, 256, (g, w, h) => PT.bark ? PT.bark(g, w, h, { base: '#6a4a30' }) : (g.fillStyle = '#6a4a30', g.fillRect(0, 0, w, h))) });
  m.steel = vc({ emissive: 0x101018 }); m.wood = vc({ map: T(256, 256, (g, w, h) => PT.planks(g, w, h, { base: '#9a6a40', n: 4, seed: 33, joints: 0 })) });
  m.bush = toon({ color: 0xffffff }); m.stucco = vc({ map: T(256, 256, stuccoTex) }); m.tile = vc({ map: T(128, 128, tileTex, [3, 2]) });
  m.bulbOn = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe0a0).multiplyScalar(2.6), fog: false });
  m.bulbSeg = [0, 1, 2].map(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(0x8a8070), fog: false }));
  m.lotMap = em(T(1024, 768, lotMap), 0x2a2620); m.banner = em(T(1024, 256, bannerTex), 0x2a2a3a); m.hillsView = C.basic(T(1024, 512, hillsView), 1.15);
  m.cal = [['JULY', '1923'], ['JAN', '1925'], ['JAN', '1932']].map(([a, b]) => em(T(256, 320, (g, w, h) => calTex(g, w, h, a, b)), 0x2a2620));
  m.blueprint = em(T(512, 320, blueprint), 0x182848); m.closed = em(T(256, 128, closedTex), 0x2a2420);
  m.floorW = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 7, seed: 51 })) }); if (H.MACRO) H.MACRO(m.floorW, 0.12, 0.05);
  m.wallP = vc({ map: T(512, 512, (g, w, h) => { g.fillStyle = '#efe0c0'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 5, 5, 4, 3)); }) });
  m.curtain = vc({ map: T(512, 256, curtainTex) }); m.sponsor = em(T(1536, 768, sponsorTex), 0x302a40); m.sold = new THREE.MeshBasicMaterial({ map: T(256, 128, soldTex), transparent: true, depthWrite: false, fog: false });
  m.saveBanner = em(T(1024, 128, saveBanner), 0x3a3020); m.mirror = toon({ map: T(256, 128, mirrorTex), emissive: 0x404048 }); m.mirror.emissiveMap = m.mirror.map;
  m.ghost = new THREE.MeshBasicMaterial({ color: 0xfff4d8, transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }); m.vpSign = em(T(512, 128, vpSign), 0x1a1410);
  m.bulb = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd890).multiplyScalar(2.2), fog: false });
  m.cone = new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
  m.cityWin = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd890).multiplyScalar(1.4), fog: true });
  return m; }

// ---------------------------------------------------------------- letters
function glyph(ch) { const shapes = FONT.generateShapes(ch, 20); const g = new THREE.ExtrudeGeometry(shapes, { depth: 0.35, bevelEnabled: false, curveSegments: 8 }); g.computeBoundingBox(); const b = g.boundingBox;
  const sx = (ch === 'W' ? LW * 1.18 : ch === 'I' ? 3 : LW) / (b.max.x - b.min.x), sy = LH / (b.max.y - b.min.y); g.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -0.35); g.scale(sx, sy, 1);
  // bulb points: inset along the outline
  const pts = []; for (const s of shapes) { const ex = s.extractPoints(10), loops = [ex.shape, ...ex.holes];
    const inside = (x, y) => { const pin = (poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], bb = poly[j]; if ((a.y > y) !== (bb.y > y) && x < (bb.x - a.x) * (y - a.y) / (bb.y - a.y) + a.x) c = !c; } return c; }; return pin(ex.shape) && !ex.holes.some(pin); };
    for (const L of loops) { let per = 0; for (let i = 0; i < L.length; i++) per += L[i].distanceTo(L[(i + 1) % L.length]); const step = per / Math.max(16, Math.round(per / 0.62));
      let acc = 0; for (let i = 0; i < L.length; i++) { const a = L[i], bb = L[(i + 1) % L.length], d = a.distanceTo(bb); if (d < 1e-6) continue; const tx = (bb.x - a.x) / d, ty = (bb.y - a.y) / d;
        while (acc <= d) { const x = a.x + tx * acc, y = a.y + ty * acc; let nx = ty, ny = -tx; if (!inside(x + nx * 0.9, y + ny * 0.9)) { nx = -nx; ny = -ny; } pts.push([x + nx * 0.9, y + ny * 0.9]); acc += step; } acc -= d; } } }
  const B = pts.map(([x, y]) => [(x - (b.min.x + b.max.x) / 2) * sx, (y - b.min.y) * sy]); return { geo: g, bulbs: B, w: (b.max.x - b.min.x) * sx }; }
function buildLetters(root, era) { const L = []; const cache = {};
  for (let i = 0; i < 13; i++) { const ch = WORD[i], gl = cache[ch] || (cache[ch] = glyph(ch)), grp = new THREE.Group(); grp.position.set(LX(i), LY(i), LZ(i)); grp.rotation.y = -0.06 * (i - 6) * 0.15; root.add(grp);
    const K = new Kit(); const w = gl.w, n = Math.max(3, Math.round(w / 2.6));
    // telephone-pole frame behind + braces down the slope
    for (let k = 0; k < n; k++) { const x = -w / 2 + 0.6 + k * (w - 1.2) / (n - 1); K.beam(M.pole, [x, -1.5, -0.6], [x, LH - 0.6, -0.6], 0.18, 0x7a5a3a, true, 7); K.beam(M.pole, [x, LH * 0.62, -0.7], [x, -1.2, -7.5], 0.13, 0x6a4a30, true, 6); }
    for (const y of [2.2, 7.5, 12.8]) K.beam(M.steel, [-w / 2 + 0.3, y, -0.45], [w / 2 - 0.3, y, -0.45], 0.06, 0x5a5a60, true, 6);
    const frame = new THREE.Group(); grp.add(frame); K.build(frame);
    const faceM = mesh(grp, gl.geo, M.face[SEG[i]], 0, 0, 0, 0, 0, 0, true);
    const newFace = mesh(grp, gl.geo, M.faceNew, 0, 0, 0, 0, 0, 0, true); newFace.visible = false; newFace.scale.set(1, 13.4 / 15, 1);
    // bulbs
    const im = new THREE.InstancedMesh(sph(0.15, 6, 5), M.bulbSeg[SEG[i]], gl.bulbs.length); const m4 = new THREE.Matrix4(); gl.bulbs.forEach(([x, y], k) => { m4.makeTranslation(x, y, 0.12); im.setMatrixAt(k, m4); }); im.castShadow = false; nond(im); grp.add(im);
    const glow = glowAt(grp, [0, LH * 0.5, 1.2], 18, '#ffc870', 0); glow.scale.set(1, 1.3, 1);
    // scaffolding (1923 build) in front of some letters
    const scaff = new THREE.Group(); grp.add(scaff); if (i < 4 || i === 6) { const S = new Kit(); for (let k = 0; k < 4; k++) { const x = -w / 2 + k * w / 3; S.beam(M.wood, [x, -1, 1.4], [x, 13, 1.4], 0.08, 0xb8905a, true, 5); S.beam(M.wood, [x, -1, 0.3], [x, 13, 0.3], 0.08, 0xb8905a, true, 5); }
      for (const y of [4, 8.5, 12.5]) { S.box(M.wood, -w / 2 - 0.2, w / 2 + 0.2, y - 0.08, y, 0.3, 1.5, 0xc8a070, 0.02); S.beam(M.wood, [-w / 2, y + 1, 1.45], [w / 2, y + 1, 1.45], 0.04, 0xb8905a, true, 4); }
      for (let k = 0; k < 3; k++) S.beam(M.wood, [-w / 2 + k * w / 3, 0, 1.45], [-w / 2 + (k + 1) * w / 3, 4, 1.45], 0.05, 0xa8804a, true, 4); S.build(scaff); }
    L.push({ grp, frame, face: faceM, newFace, im, glow, scaff, w, ch, seg: SEG[i], bulbs: gl.bulbs }); }
  return L; }

// ================================================================= HILL
function bushGeo() { return lumpGeo(11, 2, 0.16); }
function buildHill(root) {
  const R = PT.rng(1923), K = new Kit();
  // terrain mesh with vertex colours (dry chaparral, sage patches, dirt trail, city plain)
  const W = 900, D = 760, NX = 260, NZ = 220, CZ = 230; const g = new THREE.PlaneGeometry(W, D, NX, NZ); g.rotateX(-Math.PI / 2); const p = g.attributes.position, c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) + CZ, y = hf(x, z); p.setXYZ(i, x, y, z); const n = PT.fbm(x * 0.004 + 3, z * 0.004 + 1, 2, 2, 3, 4), city = sm(200, 260, z), tr = 1 - sm(1.2, 3.2, nearTrail(x, z)) * 1;
    let col = [0.68 + 0.1 * n, 0.56 + 0.08 * n, 0.38]; const sage = sm(0.4, 0.62, n); col = col.map((v, k) => v * (1 - sage * 0.75) + [0.4, 0.46, 0.26][k] * sage * 0.75);
    if (z > -10 && z < 200) col = col.map((v, k) => v * (1 - tr * 0.6) + [0.86, 0.72, 0.52][k] * tr * 0.6); col = col.map((v, k) => v * (1 - city) + [0.72, 0.7, 0.66][k] * city); c.set(col, i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.computeVertexNormals(); const terr = new THREE.Mesh(g, M.ground); terr.receiveShadow = true; terr.castShadow = true; root.add(terr);
  // chaparral bushes (instanced, coloured)
  const BN = 3600, bush = new THREE.InstancedMesh(bushGeo(), M.bush, BN); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3(), col = new THREE.Color(); let bi = 0;
  while (bi < BN) { const x = (R() - 0.5) * 420, z = -70 + R() * 240; if (Math.abs(z - 0.5) < 5.5 && Math.abs(x) < 72) continue; if (nearTrail(x, z) < 3.5) continue; if (CLEAR.some(([cx, cz, cr]) => Math.hypot(x - cx, z - cz) < cr)) continue; if (z > 55 && z < 160 && Math.abs(x) < 140 && R() < 0.6) continue; if (Math.hypot(x - 36, z - 44) < 9 || Math.hypot(x - 14, z - 46) < 10 || Math.hypot(x + 24, z - 36) < 7) continue;
    const r = 0.7 + R() * 1.5 * (z < 30 ? 1 : 1.7); v.set(x, hf(x, z) + r * 0.2, z); q.setFromEuler(e.set(0, R() * TAU, 0)); s.set(r * (1 + R() * 0.4), r * (0.6 + R() * 0.3), r); m4.compose(v, q, s); bush.setMatrixAt(bi, m4);
    col.setHSL(0.2 + R() * 0.1, 0.32 + R() * 0.22, 0.2 + R() * 0.12); bush.setColorAt(bi, col); bi++; }
  bush.castShadow = true; bush.receiveShadow = true; root.add(bush);
  // Spanish-revival houses on the lower slopes (first 8 exist in 1923)
  const VPX = 36, VPZ = 44; const houses = []; const HP = []; for (let k = 0; k < 400 && HP.length < 46; k++) { const x = (R() - 0.5) * 260, z = 62 + R() * 110; if (HP.some(([a, b]) => Math.hypot(a - x, b - z) < 13) || Math.hypot(x - VPX, z - VPZ) < 26) continue; HP.push([x, z]); }
  HP.sort((a, b) => Math.hypot(a[0], a[1] - 60) - Math.hypot(b[0], b[1] - 60));
  HP.forEach(([x, z], k) => { const hk = new Kit(), w = 7 + R() * 4, d = 6 + R() * 3, ht = 3 + (R() < 0.4 ? 3 : 0), y0 = Math.min(hf(x - w / 2, z), hf(x + w / 2, z), hf(x, z - d / 2), hf(x, z + d / 2)) - 0.3;
    hk.box(M.stucco, -w / 2, w / 2, 0, ht + 1.0, -d / 2, d / 2, [0xf6eee0, 0xf2e2c8, 0xfaf2e6, 0xf0dcc0][k % 4], 0.08); hk.put(M.tile, new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.6, 2.2, 4, 1), 0, ht + 2.1, 0, 0, Math.PI / 4, 0, w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414, 0xffffff);
    for (let j = 0; j < 3; j++) hk.box(M.paint, -w / 2 + 1.2 + j * (w - 2.4) / 2 - 0.5, -w / 2 + 1.2 + j * (w - 2.4) / 2 + 0.5, ht - 1.6, ht - 0.2, d / 2, d / 2 + 0.05, 0x3a3448, 0.02); hk.box(M.paint, -0.6, 0.6, 1, 3.2, d / 2, d / 2 + 0.06, 0x6a3a2a, 0.02);
    if (k % 3 === 0) hk.box(M.stucco, w / 4, w / 4 + 0.8, ht, ht + 3.4, -d / 4, -d / 4 + 0.8, 0xe8dcc8, 0.03);
    const hg = new THREE.Group(); hg.position.set(x, y0, z); hg.rotation.y = (R() - 0.5) * 0.5; root.add(hg); hk.build(hg); houses.push(hg); });
  // palms + eucalyptus near houses
  const palms = new Kit(); for (let k = 0; k < 16; k++) { const [hx, hz] = HP[(k * 3) % HP.length], x = hx + 7 + R() * 3, z = hz + 3; if (Math.hypot(x - VPX, z - VPZ) < 30) continue; const y = hf(x, z), t = 11 + R() * 7, cx = x + 0.6, cy = y + t;
    palms.beam(M.pole, [x, y, z], [cx, cy, z], 0.3, 0x8a6a4a, true, 6); palms.put(M.pole, sph(0.55, 8, 6), cx, cy, z, 0, 0, 0, 1, 1, 1, 0x6a5a3a);
    for (let j = 0; j < 9; j++) { const a = j / 9 * TAU + R() * 0.3, dx = Math.cos(a), dz = Math.sin(a), P0 = [cx, cy, z], P1 = [cx + dx * 1.8, cy + 0.7, z + dz * 1.8], P2 = [cx + dx * 3.4, cy - 0.4, z + dz * 3.4], P3 = [cx + dx * 4.2, cy - 1.6, z + dz * 4.2];
      palms.beam(M.paint, P0, P1, 0.2, 0x4a8a3a, true, 5); palms.beam(M.paint, P1, P2, 0.16, 0x4a8a3a, true, 5); palms.beam(M.paint, P2, P3, 0.1, 0x5a9a44, true, 5); } }
  const palmG = new THREE.Group(); root.add(palmG); palms.build(palmG);
  // far city on the plain (grid of low blocks; towers for 1978+)
  const city = new Kit(), towers = new Kit(); for (let k = 0; k < 900; k++) { const x = (R() - 0.5) * 900, z = 270 + R() * 230, w = 6 + R() * 14, h = 4 + R() * 10; city.box(M.paint, x - w / 2, x + w / 2, -96, -96 + h, z - w / 2, z + w / 2, [0xd8c8b0, 0xc8b8a8, 0xe0d4c0, 0xb8a898][k % 4], 0.2); }
  for (let k = 0; k < 40; k++) { const x = -150 + (R() - 0.5) * 260, z = 330 + R() * 150, w = 10 + R() * 12, h = 30 + R() * 90; towers.box(M.paint, x - w / 2, x + w / 2, -96, -96 + h, z - w / 2, z + w / 2, [0xa8b4c8, 0xc8c0b0, 0x8a98b0][k % 3], 0.2); }
  city.build(root, 4); const towerG = new THREE.Group(); root.add(towerG); towers.build(towerG, 4);
  // letters
  const L = buildLetters(root);
  // mule sled with telephone poles (moved by story via API.sled(t))
  const sled = new THREE.Group(); root.add(sled); { const sk = new Kit(); sk.box(M.wood, -0.6, 0.6, 0, 0.18, -1.8, 1.8, 0xa8804a, 0.03); for (let j = 0; j < 3; j++) sk.beam(M.pole, [-0.35 + j * 0.35, 0.35, -4.5], [-0.35 + j * 0.35, 0.35, 2.2], 0.17, 0x7a5a3a, true, 7);
    for (let j = 0; j < 3; j++) sk.box(M.steel, -0.55, 0.55, 0.62 + j * 0.05, 0.66 + j * 0.05, -1.2, 0.6, 0xb8bcc4, 0.005); sk.beam(M.paint, [0, 0.4, 2.2], [0, 1.0, 4.6], 0.03, 0x4a3020, true, 4); sk.build(sled); }
  // viewpoint (modern): rail fence, sign on posts, coin binoculars, bench
  const VP = [VPX, 0, VPZ]; const vp = new THREE.Group(); vp.position.set(VP[0], hf(VP[0], VP[2]), VP[2]); root.add(vp); { const vk = new Kit(); for (let k = 0; k < 7; k++) vk.beam(M.wood, [-4.5 + k * 1.5, 0, -1.2], [-4.5 + k * 1.5, 1.05, -1.2], 0.06, 0x7a5a3a, false); for (const y of [0.55, 1.0]) vk.beam(M.wood, [-4.6, y, -1.2], [4.6, y, -1.2], 0.04, 0x8a6a48, false);
    vk.box(M.paint, -6, 6, -0.4, 0.02, -1.4, 3, 0xb8a888, 0.04); vk.put(M.steel, cyl(0.06, 0.08, 1.1, 8), 2.4, 0.55, -0.8, 0, 0, 0, 1, 1, 1, 0x3a5a7a); vk.put(M.steel, cyl(0.16, 0.16, 0.42, 12), 2.4, 1.25, -0.8, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a5a7a); for (const dx of [-0.08, 0.08]) vk.put(M.steel, cyl(0.06, 0.07, 0.2, 10), 2.4 + dx, 1.28, -1.05, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2a30);
    vk.box(M.wood, -3.8, -2.2, 0.4, 0.48, 0.6, 1.0, 0x8a6a48, 0.02); for (const x of [-3.6, -2.4]) vk.box(M.wood, x - 0.05, x + 0.05, 0, 0.4, 0.65, 0.95, 0x6a4a30, 0.01);
    vk.build(vp); }
  const glows = L.map((l) => l.glow), dust = motes(root, 40, [-30, 30, 0, 18, 2, 10], 23, 0.05);
  return { L, houses, towerG, palmG, sled, vp, VP, glows, dust, terr, bush };
}

// ================================================================= OFFICE (1923)
function buildOffice(root) {
  const R = PT.rng(1922), K = new Kit(), X = 3.6, ZB = -3.2, HT = 3.4;
  mesh(root, planeUV(8, 8, 1, 1), M.floorW, 0, 0, -0.5, -Math.PI / 2, 0, 0, false);
  const WX0 = 0.6, WX1 = 3.2, WY0 = 0.95, WY1 = 2.75; for (const [x0, x1, y0, y1] of [[-X, WX0, 0, HT], [WX1, X, 0, HT], [WX0, WX1, 0, WY0], [WX0, WX1, WY1, HT]]) K.box(M.wallP, x0, x1, y0, y1, ZB - 0.2, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(M.wallP, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 3, 0xffffff, 0.01);
  K.box(M.wood, -X, X, 0, 0.9, ZB, ZB + 0.04, 0x6a4028, 0.01); K.box(M.wood, -X, WX0, 0.9, 0.95, ZB, ZB + 0.07, 0x5a3420, 0.01);
  mesh(root, plane(2 * X + 0.4, 7), H.toon({ color: 0xe8d8b8, side: THREE.DoubleSide }), 0, HT, ZB + 3.3, Math.PI / 2, 0, 0, false).receiveShadow = false;
  // big lot map (back wall, left) + banner + window (right) onto the hills
  const map = mesh(root, plane(2.6, 1.95), M.lotMap, -1.55, 1.95, ZB + 0.03, 0, 0, 0, false); K.box(M.wood, -2.9, -0.2, 0.92, 0.98, ZB, ZB + 0.06, 0x5a3420, 0.01);
  const flags = []; for (let i = 0; i < 18; i++) { const fx = -2.6 + (i % 6) * 0.42 + (R() - 0.5) * 0.1, fy = 1.35 + Math.floor(i / 6) * 0.42 + (R() - 0.5) * 0.08; const fg = new THREE.Group(); fg.position.set(fx, fy, ZB + 0.05); root.add(fg); mesh(fg, cyl(0.006, 0.006, 0.12, 4), M.metal, 0, 0.06, 0, 0, 0, 0, false); mesh(fg, plane(0.08, 0.05), H.toon({ color: 0xe83a2a, side: THREE.DoubleSide }), 0.04, 0.1, 0, 0, 0, 0, false); fg.visible = false; flags.push(fg); }
  mesh(root, plane(WX1 - WX0 + 1, WY1 - WY0 + 0.8), M.hillsView, (WX0 + WX1) / 2, (WY0 + WY1) / 2, ZB - 0.6, 0, 0, 0, false);
  // wall around window opening (cut): rebuild back wall right part as frame
  K.box(M.wood, WX0 - 0.06, WX1 + 0.06, WY0 - 0.08, WY0, ZB - 0.05, ZB + 0.12, 0x5a3420, 0.01); for (let k = 0; k <= 3; k++) K.box(M.wood, WX0 + k * (WX1 - WX0) / 3 - 0.03, WX0 + k * (WX1 - WX0) / 3 + 0.03, WY0, WY1, ZB + 0.01, ZB + 0.06, 0xf2ead6, 0.005); K.box(M.wood, WX0, WX1, (WY0 + WY1) / 2 - 0.02, (WY0 + WY1) / 2 + 0.02, ZB + 0.01, ZB + 0.06, 0xf2ead6, 0.005);
  mesh(root, plane(2.6, 0.5), M.banner, 0.2, 3.05, ZB + 0.04, 0, 0, 0, false);
  // calendar (left wall)
  const cal = M.cal.map((mm) => { const c = mesh(root, plane(0.42, 0.52), mm, -X + 0.02, 1.85, -1.2, 0, Math.PI / 2, 0, false); c.visible = false; return c; }); cal[0].visible = true;
  // desk with blueprint, phone, typewriter, lamp; chairs; filing cabinet; palm; ceiling fan; hanging lamps
  const DX = 0.6, DZ = -1.3; K.at(DX, 0, DZ, 0, () => { K.box(M.wood, -0.9, 0.9, 0.74, 0.8, -0.45, 0.45, 0x5a3420, 0.02); K.box(M.wood, -0.86, -0.4, 0, 0.74, -0.42, 0.42, 0x4a2a18, 0.01); K.box(M.wood, 0.4, 0.86, 0, 0.74, -0.42, 0.42, 0x4a2a18, 0.01);
    K.box(M.paint, -0.7, -0.45, 0.8, 0.95, -0.15, 0.1, 0x2a2a30, 0.03); K.box(M.paint, -0.68, -0.47, 0.95, 1.02, -0.05, 0.02, 0x1a1a22, 0.01); // typewriter
    K.box(M.paint, 0.55, 0.7, 0.8, 0.84, 0.0, 0.15, 0x1a1a22, 0.01); K.beam(M.paint, [0.62, 0.84, 0.07], [0.62, 1.06, 0.07], 0.012, 0x1a1a22, true, 6); K.cb(M.paint, 0.05, 0.08, 0.05, 0.62, 1.1, 0.07, 0x1a1a22, 0, 0, 0, 0.02); // candlestick phone
    K.put(M.brass, lathe('olamp', [[0.07, 0], [0.02, 0.02], [0.014, 0.4]], 10), 0.75, 0.8, -0.3, 0, 0, 0, 1, 1, 1, 0xc8a050); K.put(M.paint, lathe('olsh', [[0.02, 0.07], [0.14, -0.04], [0.15, -0.05]], 14), 0.75, 1.24, -0.3, 0, 0, 0, 1, 1, 1, 0x2a6a4a); });
  const bp = mesh(root, plane(0.9, 0.56), M.blueprint, DX - 0.05, 0.805, DZ + 0.05, -Math.PI / 2, 0, 0, false);
  for (const [x, z, ry] of [[-0.9, 0.2, 0.3], [0.2, 0.4, -0.2], [1.3, 0.3, -0.5]]) K.at(x, 0, z, ry, () => { K.box(M.wood, -0.22, 0.22, 0.44, 0.48, -0.22, 0.22, 0x6a4028, 0.02); K.box(M.wood, -0.22, 0.22, 0.48, 0.95, -0.24, -0.2, 0x6a4028, 0.02); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.box(M.wood, sx * 0.19 - 0.02, sx * 0.19 + 0.02, 0, 0.44, sz * 0.19 - 0.02, sz * 0.19 + 0.02, 0x4a2a18, 0.005); });
  K.at(-3.1, 0, 1.6, 0, () => { K.box(M.wood, -0.3, 0.3, 0, 1.3, -0.3, 0.3, 0x6a4a30, 0.02); for (let i = 0; i < 3; i++) K.box(M.brass, -0.06, 0.06, 0.3 + i * 0.4, 0.33 + i * 0.4, 0.3, 0.33, 0xc8a050, 0.005); });
  K.at(3.0, 0, 0.6, 0, () => { K.put(M.paint, cyl(0.25, 0.2, 0.45, 14), 0, 0.22, 0, 0, 0, 0, 1, 1, 1, 0xb8603a); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, L = 0.6 + R() * 0.3; K.cb(M.paint, 0.2, 0.015, L, Math.cos(a) * L * 0.4, 0.95 + R() * 0.3, Math.sin(a) * L * 0.4, i % 2 ? 0x4aa04a : 0x3a8a3a, 0.7, -a + Math.PI / 2, 0, 0.005); } });
  const fan = new THREE.Group(); fan.position.set(-0.4, HT - 0.35, -0.6); root.add(fan); { const fk = new Kit(); fk.put(M.brass, cyl(0.1, 0.12, 0.14, 12), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); for (let i = 0; i < 4; i++) fk.cb(M.wood, 0.7, 0.012, 0.14, Math.cos(i * Math.PI / 2) * 0.4, -0.04, Math.sin(i * Math.PI / 2) * 0.4, 0x6a4028, 0, -i * Math.PI / 2, 0, 0.004); fk.build(fan); }
  K.beam(M.metal, [-0.4, HT, -0.6], [-0.4, HT - 0.3, -0.6], 0.015, 0x2a2a30, true, 4);
  const lamps = []; for (const x of [-2.0, 1.8]) { K.beam(M.metal, [x, HT, -0.8], [x, 2.55, -0.8], 0.008, 0x2a2a30, true, 4); K.put(M.brass, lathe('plamp', [[0.02, 0.1], [0.2, -0.06], [0.21, -0.08]], 16), x, 2.5, -0.8, 0, 0, 0, 1, 1, 1, 0xd8b060); lamps.push(mesh(root, sph(0.06, 10, 8), M.lampGlass, x, 2.45, -0.8, 0, 0, 0, false)); }
  // door with CLOSED card (bust), cobwebs + dust sheets
  K.box(M.wood, -X + 0.01, -X + 0.06, 0, 2.2, 0.6, 1.5, 0x6a4028, 0.01); const closed = mesh(root, plane(0.5, 0.25), M.closed, -X + 0.08, 1.5, 1.05, 0, Math.PI / 2, 0, false); closed.visible = false;
  const bust = new THREE.Group(); root.add(bust); for (const [x, y, z, ry, sc] of [[-X + 0.05, HT - 0.6, ZB + 0.05, 0, 1.0], [X - 0.05, HT - 0.5, ZB + 0.05, -Math.PI / 2, 0.9], [DX + 0.7, 0.85, DZ - 0.3, 0, 0.4], [-3.1, 1.32, 1.9, 0, 0.5]]) { const w = nond(mesh(bust, plane(sc, sc), M.web, x, y, z, 0, ry, 0, false)); w.renderOrder = 6; }
  bust.add(mesh(bust, lumpGeo(4, 2, 0.1), H.toon({ color: 0xd8d0c0 }), 0.2, 0.25, 0.4, 0, 0, 0, true)); bust.children[bust.children.length - 1].scale.set(0.5, 0.25, 0.45);
  K.build(root, 3);
  const glows = [...lamps.map((l) => glowAt(root, [l.position.x, l.position.y, l.position.z + 0.05], 0.7, '#ffc070', 0.55))];
  const shafts = [shaftAt(root, [1.9, 1.4, ZB + 1.4], 2.2, 3.2, 0.1, 0.6, 0.2, 0xffe0b0)];
  const dust = motes(root, 50, [-2, 3, 0.5, 2.6, -2.6, 0.6], 31, 0.008);
  return { flags, cal, closed, bust, fan, glows, shafts, dust, map, bp, DX, DZ, ZB };
}

// ================================================================= GALA (1978)
function buildGala(root) {
  const R = PT.rng(1978), K = new Kit(), X = 5, ZB = -4, HT = 4.2;
  mesh(root, planeUV(12, 10, 1, 1), H.M.vc({ map: H.mkTex(256, 256, (g, w, h) => { g.fillStyle = '#3a2a3a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(240,200,120,0.25)'; g.lineWidth = 3; for (let i = 0; i < 8; i++) { g.strokeRect(i * 32, i * 32, w - i * 64, h - i * 64); } }, [4, 4]) }), 0, 0, -0.5, -Math.PI / 2, 0, 0, false);
  K.box(M.paint, -X, X, 0, HT, ZB - 0.2, ZB, 0x2a2440, 0.01); for (const s of [-1, 1]) K.box(M.paint, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 4, 0x2a2440, 0.01);
  // stage + curtains + sponsor board
  K.box(M.wood, -3.8, 3.8, 0, 0.5, ZB, ZB + 1.8, 0x5a3424, 0.03); K.box(M.brass, -3.8, 3.8, 0.46, 0.52, ZB + 1.78, ZB + 1.84, 0xd8b048, 0.01);
  for (const s of [-1, 1]) { mesh(root, plane(1.6, HT), M.curtain, s * 3.3, HT / 2, ZB + 0.25, 0, 0, 0, false); }
  mesh(root, plane(7.6, 0.7), M.curtain, 0, HT - 0.35, ZB + 0.3, 0, 0, 0, false);
  const board = mesh(root, plane(4.2, 2.1), M.sponsor, 0, 1.75, ZB + 0.12, 0, 0, 0, false); K.box(M.brass, -2.15, 2.15, 0.66, 0.72, ZB + 0.08, ZB + 0.2, 0xd8b048, 0.01);
  const solds = []; for (let i = 0; i < 9; i++) { const x = -2.1 + 4.2 * (0.1 + i * 0.1), s = nond(mesh(root, plane(0.5, 0.25), M.sold, x, 1.75 + 2.1 * (0.5 - 0.52), ZB + 0.16, 0, 0, 0, false)); s.renderOrder = 6; s.visible = false; solds.push(s); }
  mesh(root, plane(4.0, 0.36), M.saveBanner, 0, 3.15, ZB + 0.14, 0, 0, 0, false);
  // disco ball, spotlights, string lights
  const ball = mesh(root, sph(0.32, 18, 12), M.mirror, 0, HT - 0.7, -0.6, 0, 0, 0, true); K.beam(M.metal, [0, HT, -0.6], [0, HT - 0.4, -0.6], 0.01, 0x2a2a30, true, 4);
  const cones = []; for (const [x, c] of [[-3.5, 0xff9ad8], [3.5, 0x9ad8ff]]) { const cn = nond(mesh(root, cached_cone(), M.cone.clone(), x, HT - 0.2, 0.5, 0, 0, 0, false)); cn.material.color.set(c); cn.lookAt(new THREE.Vector3(x * 0.15, 0.6, ZB + 1.2).add(root.position)); cn.rotateX(Math.PI / 2); cones.push(cn); }
  const bulbs = []; for (let r = 0; r < 3; r++) for (let i = 0; i <= 18; i++) { const t = i / 18, x = -X + 0.3 + t * (2 * X - 0.6), y = HT - 0.15 - Math.sin(t * Math.PI) * 0.4, z = ZB + 1.5 + r * 2.0; bulbs.push(mesh(root, sph(0.035, 8, 6), M.bulb, x, y, z, 0, 0, 0, false)); }
  // round tables + glasses + candles; palms in pots
  for (const [x, z] of [[-3.0, 0.8], [3.0, 0.9], [-1.4, 2.2], [1.6, 2.4], [-3.6, 2.8], [3.7, 2.9]]) K.at(x, 0, z, 0, () => { K.put(M.paint, cyl(0.6, 0.6, 0.04, 20), 0, 0.74, 0, 0, 0, 0, 1, 1, 1, 0xf4ece0); K.put(M.paint, cyl(0.62, 0.62, 0.7, 20, true), 0, 0.39, 0, 0, 0, 0, 1, 1, 1, 0xe8dcd0); for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.4; K.put(M.jar, lathe('flute', [[0.001, 0], [0.03, 0], [0.006, 0.01], [0.006, 0.09], [0.022, 0.12], [0.026, 0.2]], 10), Math.cos(a) * 0.35, 0.76, Math.sin(a) * 0.35, 0, 0, 0, 1, 1, 1, 0xffffff); } K.put(M.brass, cyl(0.02, 0.02, 0.12, 8), 0, 0.82, 0, 0, 0, 0, 1, 1, 1, 0xf4ece0); });
  for (const x of [-4.4, 4.4]) K.at(x, 0, -1.5, 0, () => { K.put(M.brass, cyl(0.3, 0.24, 0.5, 14), 0, 0.25, 0, 0, 0, 0, 1, 1, 1, 0xd8b048); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, L = 0.8 + R() * 0.4; K.cb(M.paint, 0.22, 0.015, L, Math.cos(a) * L * 0.4, 1.2 + R() * 0.4, Math.sin(a) * L * 0.4, i % 2 ? 0x3a8a4a : 0x2a7a3a, 0.7, -a + Math.PI / 2, 0, 0.005); } });
  K.build(root, 3);
  const glows = [...bulbs.filter((_, i) => i % 2 === 0).map((b, i) => glowAt(root, [b.position.x, b.position.y, b.position.z + 0.02], 0.35, ['#ffd890', '#ff9ad8', '#9ad8ff'][i % 3], 0.5))];
  const dust = motes(root, 60, [-3, 3, 0.5, 3.6, -3, 2], 41, 0.01);
  return { solds, ball, cones, glows, dust, board, ZB };
}
let _cone; function cached_cone() { if (!_cone) { _cone = new THREE.ConeGeometry(1.1, 4.5, 20, 1, true); _cone.translate(0, -2.25, 0); } return _cone; }

// ================================================================= lights, grades, API
const SET_LIGHT = {
  hill23: { top: '#3f7ad0', hor: '#b8d2f0', fog: '#c8dcec', fogN: 90, fogF: 900, sky: '#a0b8f0', ground: '#6a5a48', hemiI: 0.7, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#ffe8c0', sunI: 3.8, az: 25, el: 48, disc: '#fffbe8', discSize: 0.002, clouds: false, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  hill30: { top: '#4a86d6', hor: '#c8d8ee', fog: '#d8e0e8', fogN: 90, fogF: 900, sky: '#a8bcf0', ground: '#6a5a48', hemiI: 0.7, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#ffe0b0', sunI: 3.6, az: -35, el: 32, disc: '#fffbe8', discSize: 0.002, clouds: false, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  hill23n: { top: '#050a22', hor: '#1c2858', fog: '#141c40', fogN: 80, fogF: 700, sky: '#4a5cc8', ground: '#1a2040', hemiI: 0.85, fillCol: '#3a4cb0', fillI: 0.35, sunCol: '#aab8ff', sunI: 1.3, az: -30, el: 34, disc: '#f2f4ff', discSize: 0.0012, clouds: false, stars: 1, cardTint: '#d8e2ff', fxTint: '#eef2ff', shafts: 0 },
  hill44: { top: '#2a3040', hor: '#6a7080', fog: '#5a6070', fogN: 40, fogF: 420, sky: '#7a8098', ground: '#3a3640', hemiI: 0.8, fillCol: '#6a78b0', fillI: 0.3, sunCol: '#b8c0d8', sunI: 1.4, az: 40, el: 40, disc: '#000000', clouds: false, stars: 0, cardTint: '#e4e8f4', fxTint: '#eef0f6', shafts: 0 },
  hill49: { top: '#4a86d6', hor: '#bcd4ee', fog: '#d0e0ee', fogN: 90, fogF: 900, sky: '#a4bcf0', ground: '#6a5a48', hemiI: 0.68, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#fff0d0', sunI: 3.7, az: -20, el: 50, disc: '#fffbe8', discSize: 0.002, clouds: false, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  hill70: { top: '#4a5a98', hor: '#d8a888', fog: '#b8988a', fogN: 60, fogF: 600, sky: '#8a88c0', ground: '#4a3e48', hemiI: 0.8, fillCol: '#6a70c8', fillI: 0.35, sunCol: '#ffb888', sunI: 2.2, az: -70, el: 14, disc: '#fff0c8', discSize: 0.003, clouds: false, stars: 0, cardTint: '#f8e8e0', fxTint: '#fff0e8', shafts: 0.3 },
  hill78: { top: '#3a4aa8', hor: '#ffa070', fog: '#f0a888', fogN: 90, fogF: 900, sky: '#8a88d0', ground: '#5a4060', hemiI: 0.95, fillCol: '#6a70d8', fillI: 0.4, sunCol: '#ffa060', sunI: 3.2, az: -62, el: 9, disc: '#fff0c0', discSize: 0.004, clouds: false, stars: 0, cardTint: '#ffeee0', fxTint: '#fff0e8', shafts: 0.6 },
  hillNow: { top: '#4a68c0', hor: '#ffc890', fog: '#f8c89a', fogN: 90, fogF: 900, sky: '#8f90d8', ground: '#5a3e58', hemiI: 0.95, fillCol: '#6f7ad8', fillI: 0.3, sunCol: '#ffb070', sunI: 3.3, az: 62, el: 14, disc: '#fff0c8', discSize: 0.003, clouds: false, stars: 0, cardTint: '#fff2e2', fxTint: '#fff6ea', shafts: 0.5 },
  office: { top: '#000000', hor: '#3a2a1e', fog: '#3b2a1d', fogN: 10, fogF: 60, sky: '#ffe8c8', ground: '#6a4a32', hemiI: 1.0, fillCol: '#8a90c8', fillI: 0.3, sunCol: '#ffe0b0', sunI: 2.6, az: 160, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  officeBust: { top: '#000000', hor: '#1a1c28', fog: '#22242e', fogN: 6, fogF: 40, sky: '#9aa8d8', ground: '#3a3640', hemiI: 0.7, fillCol: '#5a68c8', fillI: 0.3, sunCol: '#b8c4ec', sunI: 1.3, az: 160, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#e4e8f4', fxTint: '#eef0f6', shafts: 0 },
  gala: { top: '#000000', hor: '#1a1028', fog: '#1a1028', fogN: 10, fogF: 50, sky: '#c8a8ff', ground: '#3a2040', hemiI: 0.9, fillCol: '#8a70e8', fillI: 0.4, sunCol: '#ffd0a0', sunI: 1.6, az: 10, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0f0', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  hill23: { look: 'day', over: { exp: 1.04, con: 1.24, sat: 1.06, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.36, 0.86], vig: [0.24, 0.5, '#4a3a5a'] } },
  hill30: { look: 'day', over: { exp: 1.04, con: 1.24, sat: 1.02, tS: ['#3a4a8a', 0.14], tH: ['#ffd8a0', 0.08], bloom: [0.36, 0.86], vig: [0.26, 0.5, '#4a3a5a'] } },
  hill23n: { look: 'night', over: { exp: 1.1, con: 1.22, sat: 1.0, bloom: [0.55, 0.68], hal: [0.34, '#ffa040'], vig: [0.38, 0.42, '#14183a'] } },
  hill44: { look: 'night', over: { exp: 1.04, con: 1.2, sat: 0.62, lift: [0.03, 0.035, 0.055], tS: ['#2a3a6a', 0.24], tH: ['#c8d4ec', 0.12], bloom: [0.4, 0.75], hal: [0.1, '#8090c0'], vig: [0.42, 0.42, '#141826'] } },
  hill49: { look: 'day', over: { exp: 1.05, con: 1.22, sat: 1.0, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c0', 0.05], bloom: [0.34, 0.86], vig: [0.24, 0.5, '#4a3a5a'] } },
  hill70: { look: 'golden', over: { exp: 1.0, con: 1.2, sat: 0.8, tS: ['#4a3a7a', 0.2], tH: ['#ffb090', 0.1], bloom: [0.4, 0.8], vig: [0.34, 0.46, '#2a1a3a'] } },
  hill78: { look: 'golden', over: { exp: 1.08, con: 1.24, sat: 1.06, tS: ['#2a3a8a', 0.2], tH: ['#ffb070', 0.14], bloom: [0.44, 0.75], hal: [0.3, '#ff9a50'], vig: [0.32, 0.48, '#1e1a3a'] } },
  hillNow: { look: 'golden', over: { exp: 1.08, con: 1.24, sat: 1.08, tS: ['#3a3a8a', 0.18], tH: ['#ffc080', 0.12], bloom: [0.45, 0.8], hal: [0.24, '#ffa040'], vig: [0.3, 0.5, '#2a2440'] } },
  office: { look: 'office', over: { exp: 1.14, con: 1.24, sat: 1.04, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.42, 0.78], hal: [0.26, '#ff9a50'], vig: [0.34, 0.46, '#2a1420'] } },
  officeBust: { look: 'night', over: { exp: 1.02, con: 1.2, sat: 0.66, lift: [0.03, 0.035, 0.055], tS: ['#2a3a6a', 0.26], tH: ['#c8d4ec', 0.12], bloom: [0.45, 0.72], hal: [0.1, '#8090c0'], vig: [0.4, 0.42, '#141826'] } },
  gala: { look: 'night', over: { exp: 1.12, con: 1.24, sat: 1.14, tS: ['#4a2a8a', 0.2], tH: ['#ffb0c0', 0.1], bloom: [0.5, 0.72], hal: [0.32, '#ff7ac0'], vig: [0.36, 0.44, '#1a0a2a'] } },
};
const ERA = { hill30: '23', hill23: '23', hill23n: '23', hill44: '44', hill49: '49', hill70: '70', hill78: '78', hillNow: 'now' };

export function buildHW(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  let hl, of, ga, MOOD = 'hill23'; const ST = { ghost: 0, fallH: 0, land: 0, bulbs: [0, 0, 0], sold: 0, rise: 1, sled: -1, cal: 0, flags: 0 };
  const API = makeAPI(ctx, { prefix: 'hw_', origin: HW_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { hill30: 'day', hill23: 'day', hill23n: 'explain', hill44: 'day', hill49: 'day', hill70: 'golden', hill78: 'golden', hillNow: 'golden', office: 'office', officeBust: 'office', gala: 'office' },
    practicals: (name, F, W3) => { const fl = 1 + 0.06 * Math.sin(F * 0.7);
      if (name === 'hill23n') { const b = ST.bulbs; return [{ p: W3('hill', [-38, 12, 14]), col: '#ffc870', I: 110 * b[0], d: 45 }, { p: W3('hill', [10, 12, 14]), col: '#ffc870', I: 100 * b[1], d: 45 }, { p: W3('hill', [52, 12, 14]), col: '#ffc870', I: 100 * b[2], d: 45 }]; }
      if (name === 'office') return [{ p: W3('office', [-2.0, 2.3, -0.8]), col: '#ffd090', I: 2.6, d: 5 }, { p: W3('office', [1.8, 2.3, -0.8]), col: '#ffd090', I: 2.6, d: 5 }, { p: W3('office', [0.6, 1.6, 1.8]), col: '#ffe0c0', I: 4, d: 6 }];
      if (name === 'officeBust') return [{ p: W3('office', [1.4, 1.2, -1.2]), col: '#ffb860', I: 2.2 * fl, d: 4 }, { p: W3('office', [0, 2.0, 2.0]), col: '#8a98d8', I: 2.5, d: 7 }];
      if (name === 'gala') return [{ p: W3('gala', [0, 2.4, -2.4]), col: '#ffd8a0', I: 6, d: 6 }, { p: W3('gala', [-3, 2.5, 1.5]), col: '#ff8ad8', I: 4, d: 6 }, { p: W3('gala', [3, 2.5, 1.5]), col: '#8ad8ff', I: 4, d: 6 }, { p: W3('gala', [0, 1.8, 3.2]), col: '#ffe8d0', I: 5, d: 7 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'office' && of) { of.fan.rotation.y = MOOD === 'officeBust' ? 0 : T * 4; tickMotes(of.dust, f, 0.5); }
      if (cur === 'gala' && ga) { ga.ball.rotation.y = T * 0.8; ga.glows.forEach((g, i) => (g.material.opacity = g.userData.op * (0.7 + 0.3 * Math.sin(f * 0.2 + i * 1.7)))); tickMotes(ga.dust, f, 0.6); }
      if (cur === 'hill' && hl) tickMotes(hl.dust, f, MOOD === 'hill44' ? 3 : 0.5); },
    mood: (name) => { if (GROUP_OF[name] === 'hill') API.era(name); if (GROUP_OF[name] === 'office') API.officeMood(name); },
    apply: (v) => { if (v.bulbs) API.bulbs(...v.bulbs); if (v.fallH != null) API.fallH(v.fallH); if (v.land != null) API.landOff(v.land); if (v.sold != null) API.gsold(v.sold); if (v.sled != null) API.sled(v.sled); if (v.flags != null) API.flags(v.flags); if (v.cal != null) API.calendar(v.cal); if (v.ghost != null) API.ghost(v.ghost); } });
  hl = buildHill(API.groups.hill); of = buildOffice(API.groups.office); ga = buildGala(API.groups.gala);
  API.parts = { hl, of, ga };
  // [HW-sets] state setters
  API.era = (name) => { MOOD = name; const e = ERA[name]; const old = e === '44' || e === '70', neu = e === '78' || e === 'now';
    hl.L.forEach((l, i) => { const land = i >= 9; l.grp.visible = !(land && (e === '70' || neu)); l.grp.rotation.set(0, l.grp.rotation.y, 0); l.grp.position.y = LY(i); l.grp.scale.set(1, 1, 1);
      l.face.visible = !neu; l.newFace.visible = neu; l.frame.visible = !neu; l.im.visible = e === '23'; l.scaff.visible = name === 'hill23'; l.glow.visible = name === 'hill23n';
      l.face.material = old ? M.faceOld[i % 3] : e === '49' ? M.faceRep : M.face[l.seg];
      if (e === '70') { const T = { 1: [0.0, 0.16, 0.72], 3: [0.1, -0.12, 1], 6: [-0.18, 0.0, 0.8], 8: [0.0, 0.22, 1] }[i]; if (T) { l.grp.rotation.x = T[0]; l.grp.rotation.z = T[1]; l.grp.scale.y = T[2]; } } });
    hl.houses.forEach((h, k) => (h.visible = name === 'hill30' ? k < 20 : e === '23' ? k < 8 : e === '44' || e === '49' ? k < 30 : true)); hl.towerG.visible = neu; hl.palmG.visible = e !== '23'; hl.vp.visible = e === 'now'; hl.sled.visible = name === 'hill23' && ST.sled >= 0;
    API.fallH(ST.fallH); API.landOff(ST.land); API.bulbs(...ST.bulbs); API.ghost(ST.ghost); };
  API.ghost = (t) => { ST.ghost = t; if (ERA[MOOD] !== 'now') return; M.ghost.opacity = 0.62 * clamp01(t); for (let i = 9; i < 13; i++) { const l = hl.L[i]; l.grp.visible = t > 0.01; l.face.visible = true; l.face.material = M.ghost; l.newFace.visible = false; l.frame.visible = false; l.im.visible = false; } };
  API.bulbs = (a = 0, b = 0, c = 0) => { ST.bulbs = [a, b, c]; [a, b, c].forEach((k, s) => { M.bulbSeg[s].color.set(0x6a6258).lerp(new THREE.Color(0xffe0a0).multiplyScalar(3.0), clamp01(k)); M.face[s].emissive.setRGB(0.5 * k, 0.36 * k, 0.16 * k); });
    hl.L.forEach((l) => { l.glow.material.opacity = 0.22 * clamp01([a, b, c][l.seg]); }); };
  API.fallH = (t) => { ST.fallH = t; if (!ERA[MOOD] || ERA[MOOD] !== '44') return; const k = clamp01(t); const h = hl.L[0].grp; h.rotation.z = 1.42 * k * k; h.rotation.x = 0.25 * k; h.position.x = LX(0) - 3.5 * k; h.position.y = LY(0) + 2.2 * Math.sin(Math.PI * k) * 0; };
  API.landOff = (t) => { ST.land = t; if (ERA[MOOD] !== '49') { if (ERA[MOOD] === '23' || ERA[MOOD] === '44') for (let i = 9; i < 13; i++) hl.L[i].grp.visible = true; return; }
    for (let i = 9; i < 13; i++) { const k = clamp01(t * 4 - (i - 9) * 0.85), l = hl.L[i]; l.grp.rotation.x = -1.15 * k * k; l.grp.visible = t < 1.2; } };
  API.sled = (t) => { ST.sled = t; hl.sled.visible = t >= 0 && MOOD === 'hill23'; if (t < 0) return; const a = trailAt(t), b = trailAt(Math.min(1, t + 0.01)); hl.sled.position.set(...a.p); hl.sled.rotation.y = Math.atan2(b.p[0] - a.p[0], b.p[2] - a.p[2]); };
  API.officeMood = (name) => { MOOD = name; const b = name === 'officeBust'; of.bust.visible = b; of.closed.visible = b; of.glows.forEach((g) => (g.material.opacity = g.userData.op * (b ? 0.0 : 1))); API.flags(b ? 1 : ST.flags); };
  API.flags = (t) => { ST.flags = t; of.flags.forEach((fg, i) => (fg.visible = MOOD === 'officeBust' ? i % 3 === 0 : clamp01(t) * of.flags.length > i)); };
  API.calendar = (i) => { ST.cal = i; of.cal.forEach((c, k) => (c.visible = k === (i | 0))); };
  API.gsold = (t) => { ST.sold = t; ga.solds.forEach((s, i) => { const k = clamp01(t - i); s.visible = k > 0; s.scale.setScalar(k > 0 ? backOut(Math.min(1, k * 2)) : 0.001); }); };
  API.glows = { hill: hl.glows, office: of.glows, gala: ga.glows };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  API.spots = { letter: (i) => API.W3('hill', [LX(i), LY(i), LZ(i)]), vp: API.W3('hill', [hl.VP[0], hf(hl.VP[0], hl.VP[2]), hl.VP[2]]) };
  const V = API.V, ly = (i) => LY(i);
  API.views = [
    V('hill23', [-22, ly(3) + 5, 46], [6, ly(6) + 9, 0], 50, 0.6, null, { sled: 0.6 }), // 0 1923 build: letters + scaffolding, trail
    V('hill23n', [-92, ly(0) + 2, 34], [10, ly(6) + 6, 0], 38, 0.4, null, { bulbs: [1, 1, 1] }), // 1 night oblique along the row, all lit
    V('hill23n', [-92, ly(0) + 2, 34], [10, ly(6) + 6, 0], 38, 0.4, null, { bulbs: [1, 0, 0] }), // 2 HOLLY only
    V('hill44', [-6, ly(1) + 4, 34], [-50, ly(1) + 4, 0], 46, 0.6, null, { fallH: 1 }), // 3 1944 fallen H, weathered
    V('hill49', [-38, ly(10) + 6, 52], [40, ly(10) + 7, 0], 44, 0.6, null, { land: 0.5 }), // 4 1949 LAND toppling
    V('hill70', [-80, ly(0) + 3, 60], [0, ly(5) + 8, 0], 40, 0.5, null, {}), // 5 1970s decay
    V('hill78', [30, ly(6) - 12, 120], [0, ly(6) + 6, 0], 30, 0.4, null, {}), // 6 1978 new letters at sunset from below
    V('hillNow', [37, hf(36, 44) + 1.7, 49], [-6, ly(6) + 6, 0], 40, 1.2, [36, hf(36, 44) + 1.2, 43], {}), // 7 viewpoint long lens
    V('hill23', [-10, ly(0) - 1, 14], [-63, ly(0) + 8, 0], 52, 1.0, null, {}), // 8 low angle 50 ft letter
    V('office', [0.6, 1.6, 2.6], [-0.2, 1.5, -3.0], 54, 1.4, [0.2, 1.2, -1.2], { flags: 0.5, cal: 0 }), // 9 office wide
    V('officeBust', [0.6, 1.6, 2.6], [-0.2, 1.5, -3.0], 54, 1.4, [0.2, 1.2, -1.2], { cal: 2 }), // 10 office bust
    V('gala', [0.3, 1.6, 4.2], [0, 1.6, -3.5], 52, 1.4, [0, 1.6, -2.6], { sold: 4.5 }), // 11 gala wide
    V('office', [0.7, 1.45, -0.4], [0.55, 0.8, -1.3], 46, 4, [0.55, 0.8, -1.3], {}), // 12 blueprint close
  ];
  API.era('hill23'); API.bulbs(0, 0, 0); API.gsold(0); API.flags(0); API.calendar(0); API.sled(-1); API.tick(0);
  return API;
}
