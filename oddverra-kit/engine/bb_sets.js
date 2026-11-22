// bb_sets.js [BB-sets]: sets for "Big Ben isn't the tower, it's the bell" (Oddverra short).
//   tower  : Westminster today, stylised: the Elizabeth Tower (gothic panelled shaft, four opal clock dials with gilded frames and
//            moving hands, the Latin dial inscription strip, open belfry arcade, slate-and-gold spire with an orb finial), a long
//            gothic palace wing with pinnacles, a plaza with plane trees and lamps, the green bridge over the river, far buildings.
//            A swappable name plaque at the tower base (CLOCK TOWER -> ELIZABETH TOWER), jubilee bunting, and bong rings that can
//            pulse out of the belfry. Moods 'towerDay', 'towerGold' (jubilee), 'towerDusk' (payoff, dials lit).   origin (-136000,0,0)
//   belfry : inside the belfry: Big Ben (lathe bell with the inscription band) on an iron frame, the outside hammer (setHammer),
//            the crack (setCrack, rotates with the bell), quarter bells, lancet openings onto a painted London skyline, sun shafts,
//            bong rings (setRing). Moods 'belfry', 'belfryNight' ("You see"), 'belfryGold'.                        (-136000,0,800)
//   yard   : New Palace Yard, 1857: cobbles, the timber test frame with the first great bell and its hammer, the unfinished tower in
//            scaffolding, hoardings with a boxing bill. Moods 'yard', 'yardDusk'.                                   (-138500,0,0)
//   foundry: Whitechapel, 1858: brick walls, a glowing furnace, the bell mould in the casting pit, a tilting crucible with a molten
//            pour (setPour), a pile of broken bell pieces. Mood 'foundry'.                                          (-138500,0,800)
//   clock  : the Great Clock room: green iron frame, gear trains (spinning), the pendulum (swings, 2 s beat) with its tray of old
//            pennies (setPennies), a back-lit dial seen from inside. Mood 'clock'.                                  (-138500,0,1600)
// Each set: local frame, camera side +z. Test flag ?bbview=N (main.js).
import { H, TAU, clamp01, sm, SERIF, SANS, cyl, sph, plane, planeUV, mesh, nond, lumpGeo, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';

export const BB_ORIGIN = { tower: [-136000, 0, 0], belfry: [-136000, 0, 800], yard: [-138500, 0, 0], foundry: [-138500, 0, 800], clock: [-138500, 0, 1600] };
const GROUP_OF = { towerDay: 'tower', towerGold: 'tower', towerDusk: 'tower', belfry: 'belfry', belfryNight: 'belfry', belfryGold: 'belfry', yard: 'yard', yardDusk: 'yard', foundry: 'foundry', clock: 'clock' };
// tower dims: half width TW, dial centre DY, dial radius DR, belfry stage BY0..BY1; belfry bell: mouth y BM, mouth radius 1.36
export const TOWER = { TW: 6, DY: 60, DR: 3.6, BY0: 68, BY1: 77, TOP: 97 };
export const BELL = { BM: 3.0, HX: 1.55 };
let THREE, PT, M;

// ---------------------------------------------------------------- painters
function panelTex(o = {}) { return (g, w, h) => { g.fillStyle = o.base || '#d6bf8c'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.16 * PT.fbm(u, v, 8, 16, 3, o.seed || 3));
  const n = o.n || 4, pw = w / n; for (let i = 0; i < n; i++) { const x0 = i * pw + pw * 0.16, x1 = (i + 1) * pw - pw * 0.16, y0 = h * 0.1, y1 = h * 0.94, mx = (x0 + x1) / 2;
    g.fillStyle = o.deep || 'rgba(70,50,40,0.42)'; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0 + pw * 0.4); g.quadraticCurveTo(x0, y0, mx, y0 - pw * 0.08); g.quadraticCurveTo(x1, y0, x1, y0 + pw * 0.4); g.lineTo(x1, y1); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,240,200,0.5)'; g.lineWidth = 2; g.stroke(); g.strokeStyle = 'rgba(60,40,30,0.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(mx, y0 + pw * 0.1); g.lineTo(mx, y1); g.stroke();
    if (o.win) { g.fillStyle = o.win; g.fillRect(x0 + pw * 0.08, h * 0.32, (x1 - x0) * 0.36, h * 0.22); g.fillRect(mx + pw * 0.04, h * 0.32, (x1 - x0) * 0.36, h * 0.22); }
    g.fillStyle = 'rgba(60,40,30,0.35)'; for (const y of [0.3, 0.62]) g.fillRect(x0, h * y, x1 - x0, 4); }
  g.fillStyle = 'rgba(255,240,200,0.4)'; g.fillRect(0, 0, w, 5); g.fillStyle = 'rgba(60,40,30,0.4)'; g.fillRect(0, h - 6, w, 6); grain(g, w, h, 'rgba(80,60,40,1)', 1400, o.seed || 4, 0.18); }; }
function dialTex(o = {}) { return (g, w, h) => { const cx = w / 2, cy = h / 2, R = w * 0.46; g.fillStyle = o.frame || '#c8a048'; g.fillRect(0, 0, w, h);
  PT.modulate(g, w, h, (u, v) => 0.85 + 0.25 * PT.fbm(u, v, 8, 8, 3, 7)); g.strokeStyle = '#6a4a1a'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16);
  for (const [x, y] of [[0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]]) { g.fillStyle = '#2a3a5a'; g.beginPath(); g.arc(w * x, h * y, w * 0.05, 0, TAU); g.fill(); g.strokeStyle = '#f0d070'; g.lineWidth = 3; g.stroke(); }
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, R); gr.addColorStop(0, o.lit ? '#fffbe8' : '#f4f0e4'); gr.addColorStop(1, o.lit ? '#ffe8b0' : '#d8d4c8'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(40,40,50,0.55)'; g.lineWidth = 2.5; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; g.beginPath(); g.moveTo(cx + Math.cos(a) * R * 0.18, cy + Math.sin(a) * R * 0.18); g.lineTo(cx + Math.cos(a) * R * 0.66, cy + Math.sin(a) * R * 0.66); g.stroke(); }
  for (const r of [0.18, 0.4, 0.66]) { g.beginPath(); g.arc(cx, cy, R * r, 0, TAU); g.stroke(); }
  g.fillStyle = '#1e1a22'; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.arc(cx, cy, R * 0.72, 0, TAU, true); g.fill('evenodd');
  const RN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU - Math.PI / 2; g.save(); g.translate(cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86); g.rotate(a + Math.PI / 2); if (o.mirror) g.scale(-1, 1); txt(g, RN[i], 0, 0, R * 0.26, R * 0.13, { col: '#f0d070', font: SERIF }); g.restore(); }
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU; g.fillStyle = '#f0d070'; g.beginPath(); g.arc(cx + Math.cos(a) * R * 0.75, cy + Math.sin(a) * R * 0.75, i % 5 ? 2 : 4, 0, TAU); g.fill(); }
  g.strokeStyle = '#f0d070'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke(); }; }
function stripTex(text, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#2a3a5a'; g.fillRect(0, 0, w, h); txt(g, text, w / 2, h * 0.55, w * 0.94, h * 0.62, { col: o.col || '#f0d070', font: SERIF }); g.strokeStyle = o.col || '#f0d070'; g.lineWidth = 3; g.strokeRect(4, 4, w - 8, h - 8); }; }
function slateTex(g, w, h) { g.fillStyle = '#4a5468'; g.fillRect(0, 0, w, h); const R = PT.rng(77); for (let y = 0; y < h; y += 16) for (let x = (y / 16 % 2) * 12; x < w; x += 24) { const c = 0.85 + R() * 0.25; g.fillStyle = `rgb(${74 * c | 0},${84 * c | 0},${104 * c | 0})`; g.fillRect(x + 1, y + 1, 22, 14); }
  g.fillStyle = '#d8b048'; for (let x = 0; x < w; x += w / 4) g.fillRect(x, 0, 5, h); g.fillStyle = 'rgba(216,176,72,0.85)'; for (let y = h * 0.25; y < h; y += h * 0.25) g.fillRect(0, y, w, 4); }
function cobbleTex(o = {}) { return (g, w, h) => { g.fillStyle = o.grout || '#5a5048'; g.fillRect(0, 0, w, h); const R = PT.rng(o.seed || 9), s = o.s || 32;
  for (let y = 0; y < h; y += s * 0.8) for (let x = ((y / (s * 0.8)) % 2) * s / 2 - s; x < w + s; x += s) { const c = 0.8 + R() * 0.35, b = PT.hex(o.base || 0x8a8278); g.fillStyle = `rgb(${b[0] * c | 0},${b[1] * c | 0},${b[2] * c | 0})`; g.beginPath(); g.ellipse(x + s / 2 + (R() - 0.5) * 4, y + s * 0.4, s * 0.44, s * 0.34, R() * 0.4, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,250,240,0.18)'; g.beginPath(); g.ellipse(x + s * 0.42, y + s * 0.3, s * 0.2, s * 0.12, 0, 0, TAU); g.fill(); } }; }
function paveTex(g, w, h) { g.fillStyle = '#b8b0a4'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.14 * PT.fbm(u, v, 8, 8, 3, 21)); g.strokeStyle = 'rgba(80,70,70,0.35)'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * w / 8, 0); g.lineTo(i * w / 8, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 8); g.lineTo(w, i * h / 8); g.stroke(); } }
function waterTex(g, w, h) { g.fillStyle = '#4a7a8a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => { const a = PT.fbm(u, v, 4, 16, 3, 5), b = PT.fbm(u, v, 12, 40, 2, 9); return 0.8 + 0.45 * (0.65 * a + 0.35 * b) ** 2; });
  const R = PT.rng(5); g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineCap = 'round'; for (let i = 0; i < 90; i++) { const x = R() * w, y = R() * h, L = 10 + R() * 40; g.lineWidth = 1.5 + R() * 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L / 2, y - 3, x + L, y); g.stroke(); } }
// bell bronze with ribs + the inscription band (lathe uv: u around, v up the profile)
function bellTex(o = {}) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.lip || '#8a6a40'); gr.addColorStop(1, o.top || '#6a5a3e'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  PT.modulate(g, w, h, (u, v) => 0.84 + 0.3 * PT.fbm(u, v, 12, 6, 3, o.seed || 11)); g.fillStyle = 'rgba(90,140,120,0.16)'; for (let i = 0; i < 40; i++) { const R = Math.sin(i * 91.7) * 0.5 + 0.5, S = Math.sin(i * 37.1) * 0.5 + 0.5; g.fillRect(R * w, S * h, 20 + R * 40, 4 + S * 10); }
  for (const v of [0.08, 0.12, 0.42, 0.66, 0.7, 0.9]) { g.fillStyle = 'rgba(255,220,150,0.35)'; g.fillRect(0, h * (1 - v), w, 3); g.fillStyle = 'rgba(40,24,10,0.45)'; g.fillRect(0, h * (1 - v) + 3, w, 3); }
  if (o.text) { g.save(); g.translate(0, h * (1 - 0.56)); for (let k = 0; k < 2; k++) { txt(g, o.text, w * (0.25 + 0.5 * k), 0, w * 0.48, h * 0.05, { col: 'rgba(255,224,160,0.85)', font: SERIF }); } g.restore(); } }; }
function skylineTex(o = {}) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.top || '#7aa8e8'); gr.addColorStop(0.7, o.hor || '#f0e0c8'); gr.addColorStop(1, o.hor || '#f0e0c8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const R = PT.rng(o.seed || 3); g.fillStyle = o.city || '#7a7a9a'; for (let x = 0; x < w; x += 10 + R() * 26) { const bh = h * (0.08 + R() * 0.12); g.fillRect(x, h - bh, 14 + R() * 22, bh); }
  g.beginPath(); g.arc(w * 0.62, h * 0.8, h * 0.09, Math.PI, 0); g.fill(); g.fillRect(w * 0.62 - 3, h * 0.66, 6, h * 0.06); g.fillRect(w * 0.55, h * 0.8, w * 0.14, h * 0.2);
  g.fillStyle = o.city2 || '#5a5a7a'; for (let x = 0; x < w; x += 8 + R() * 18) { const bh = h * (0.03 + R() * 0.07); g.fillRect(x, h - bh, 12 + R() * 16, bh); }
  if (o.stars) { g.fillStyle = '#fff'; for (let i = 0; i < 60; i++) g.fillRect(R() * w, R() * h * 0.6, 2, 2); g.fillStyle = 'rgba(255,220,140,0.9)'; for (let i = 0; i < 90; i++) g.fillRect(R() * w, h * (0.86 + R() * 0.12), 2, 3); } }; }
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 6, 2, 3, 7)); g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08);
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : (0.5 - 0.17 * (lines.length - 1)) + i * 0.34), w * 0.86, h * (lines.length === 1 ? 0.5 : 0.28), { col: (o.cols || [])[i] || o.col || '#3a2414', font: o.font || SERIF })); }; }
function boxingTex(g, w, h) { g.fillStyle = '#efe2c0'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.18 * PT.fbm(u, v, 4, 6, 3, 13));
  txt(g, 'GRAND', w / 2, h * 0.09, w * 0.8, h * 0.07, { col: '#2a2020', font: SERIF }); txt(g, 'PRIZE FIGHT', w / 2, h * 0.19, w * 0.9, h * 0.09, { col: '#a82a2a', font: SERIF });
  g.fillStyle = '#2a2020'; for (const s of [-1, 1]) { const x = w / 2 + s * w * 0.22; g.beginPath(); g.arc(x, h * 0.36, w * 0.08, 0, TAU); g.fill(); g.fillRect(x - w * 0.09, h * 0.44, w * 0.18, h * 0.18); g.beginPath(); g.arc(x + s * -w * 0.12, h * 0.44, w * 0.05, 0, TAU); g.fill(); }
  txt(g, 'BEN CAUNT', w / 2, h * 0.72, w * 0.86, h * 0.09, { col: '#2a2020', font: SERIF }); txt(g, '"BIG BEN"', w / 2, h * 0.83, w * 0.7, h * 0.07, { col: '#a82a2a', font: SERIF }); txt(g, 'CHAMPION OF ENGLAND', w / 2, h * 0.92, w * 0.86, h * 0.045, { col: '#2a2020', font: SERIF }); }
function bunting(g, w, h) { g.clearRect(0, 0, w, h); const cols = ['#c8202c', '#f4f2ee', '#1a3a8a']; g.strokeStyle = '#3a3040'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 6); g.quadraticCurveTo(w / 2, 30, w, 6); g.stroke();
  for (let i = 0; i < 12; i++) { const x = (i + 0.5) * w / 12, y = 6 + 24 * (1 - ((x / w - 0.5) * 2) ** 2) * 1; g.fillStyle = cols[i % 3]; g.beginPath(); g.moveTo(x - w / 30, y); g.lineTo(x + w / 30, y); g.lineTo(x, y + h * 0.7); g.closePath(); g.fill(); g.strokeStyle = '#2b1d4a'; g.lineWidth = 2; g.stroke(); } }
function ringTex(g, w, h) { g.clearRect(0, 0, w, h); const cx = w / 2; for (const [r, a] of [[0.46, 1], [0.4, 0.45]]) { const gr = g.createRadialGradient(cx, cx, w * (r - 0.06), cx, cx, w * (r + 0.04)); gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(0.6, `rgba(255,236,190,${a})`); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.panel = vc({ map: T(256, 512, panelTex({ seed: 3 })) }); m.panelW = vc({ map: T(512, 256, panelTex({ seed: 5, n: 6, win: 'rgba(40,50,80,0.75)' })) }); m.panelN = em(T(512, 256, panelTex({ seed: 5, n: 6, win: 'rgba(255,200,110,0.95)' })), 0x3a2814);
  m.stone = vc({ map: T(256, 256, (g, w, h) => PT.stone(g, w, h, { base: '#d0b888' })) }); m.dial = em(T(512, 512, dialTex()), 0x6a5a40); m.dialLit = em(T(512, 512, dialTex({ lit: true })), 0xffe8b0); m.dialLit.emissiveIntensity = 1.1;
  m.dialBack = new THREE.MeshBasicMaterial({ map: T(512, 512, dialTex({ lit: true, frame: '#3a3a30' })), fog: false }); m.dialBack.color.setScalar(1.05);
  m.motto = em(T(1024, 64, stripTex('DOMINE SALVAM FAC REGINAM NOSTRAM VICTORIAM PRIMAM')), 0x302410); m.slate = vc({ map: T(256, 256, slateTex) }); m.gold = vc({ emissive: 0x5a3a08 });
  m.pave = toon({ map: T(512, 512, paveTex, [1 / 4, 1 / 4]) }); m.water = toon({ map: T(512, 512, waterTex, [1 / 20, 1 / 20]), color: 0xd8f0f0, emissive: 0x0a2a34 }); m.waterT = m.water.map;
  m.cobble = toon({ map: T(512, 512, cobbleTex({}), [1 / 3, 1 / 3]) }); m.grass = toon({ map: T(512, 512, (g, w, h) => PT.grass(g, w, h, { base: '#5a8a4a' }), [1 / 6, 1 / 6]) });
  m.leaf = vc(); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.plank = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a6040', n: 8, seed: 51 })) });
  m.brick = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#8a4a32', rows: 16, cols: 6, seed: 7 })) }); m.iron = vc({ emissive: 0x0a0a10 }); m.green = vc({ emissive: 0x041008 });
  m.bell = toon({ map: T(1024, 512, bellTex({ text: 'CAST BY GEORGE MEARS OF WHITECHAPEL  -  SIR BENJAMIN HALL, CHIEF COMMISSIONER OF WORKS' })), emissive: 0x2a1a08, side: THREE.DoubleSide }); m.bell.emissiveMap = m.bell.map;
  m.bell1 = toon({ map: T(1024, 512, bellTex({ seed: 19, lip: '#9a7a48', top: '#7a6a48' })), emissive: 0x2a1a08, side: THREE.DoubleSide }); m.bell1.emissiveMap = m.bell1.map;
  m.qbell = toon({ map: T(512, 256, bellTex({ seed: 23 })), emissive: 0x1a1006, side: THREE.DoubleSide });
  m.crack = new THREE.MeshBasicMaterial({ color: 0x120a10 }); m.crackHot = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd890).multiplyScalar(1.6) });
  m.plaqueOld = em(T(1024, 200, signTex(['CLOCK TOWER'], { bg: '#e8dcc0', col: '#4a3418', rim: '#8a6a30' })), 0x403020); m.plaqueNew = em(T(1024, 200, signTex(['ELIZABETH TOWER'], { bg: '#2a3a6a', col: '#f0d070', rim: '#f0d070' })), 0x2a2a40);
  m.bunting = new THREE.MeshBasicMaterial({ map: T(1024, 128, bunting), transparent: true, side: THREE.DoubleSide, fog: true, alphaTest: 0.3 }); m.bunting.color.setScalar(1.05);
  m.sky = new THREE.MeshBasicMaterial({ map: T(1024, 512, skylineTex({})), fog: false }); m.sky.color.setScalar(0.78); m.skyN = new THREE.MeshBasicMaterial({ map: T(1024, 512, skylineTex({ top: '#0a1030', hor: '#3a3a7a', city: '#1a1a3a', city2: '#14142a', stars: 1 })), fog: false });
  m.skyG = new THREE.MeshBasicMaterial({ map: T(1024, 512, skylineTex({ top: '#5a5aa8', hor: '#ffb070', city: '#6a4a6a', city2: '#4a3050' })), fog: false }); m.skyG.color.setScalar(0.8);
  m.ring = new THREE.MeshBasicMaterial({ map: T(256, 256, ringTex), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
  m.boxing = em(T(400, 600, boxingTex), 0x302418); m.signTrials = em(T(800, 200, signTex(['GREAT BELL TRIALS', 'NO ADMITTANCE'], { cols: ['#2a2a5a', '#a82a2a'] })), 0x302418);
  m.signFoundry = em(T(1024, 200, signTex(['WHITECHAPEL FOUNDRY', 'EST. 1570'], { bg: '#2a3a2a', cols: ['#f0d070', '#e8dcc0'], rim: '#f0d070' })), 0x202020);
  m.signWorks = em(T(800, 200, signTex(['OFFICE OF WORKS', 'WESTMINSTER, 1857'], { cols: ['#3a2414', '#6a4a2a'] })), 0x302418);
  m.molten = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffa040).multiplyScalar(2.2), fog: false }); m.ember = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff7020).multiplyScalar(1.6), fog: false });
  m.sand = vc({ map: T(256, 256, (g, w, h) => PT.dirt(g, w, h, { base: '#6a5444' })) }); m.floor = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#6a5440', n: 10, seed: 31 })) });
  m.wallG = vc({ map: T(512, 512, (g, w, h) => PT.stone(g, w, h, { base: '#b8a888' })) }); m.penny = vc({ emissive: 0x3a1a08 });
  m.winLit = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc870).multiplyScalar(1.3), fog: true });
  return m; }

// ---------------------------------------------------------------- shared props
const tintM = (m, hex) => { const c = new THREE.Color(hex), a = m.geometry.attributes.position.count, arr = new Float32Array(a * 3); for (let i = 0; i < a; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; } m.geometry.setAttribute('color', new THREE.Float32BufferAttribute(arr, 3)); return m; };
// bell outer profile (r, y), mouth at y = 0 (radius 1.36), crown at 2.24
const BP = [[1.36, 0], [1.4, 0.06], [1.36, 0.16], [1.2, 0.42], [1.06, 0.78], [0.97, 1.16], [0.92, 1.52], [0.88, 1.8], [0.78, 2.0], [0.56, 2.15], [0.28, 2.22], [0.001, 2.24]];
export const bellR = (y) => { for (let i = 0; i < BP.length - 1; i++) { const [r0, y0] = BP[i], [r1, y1] = BP[i + 1]; if (y >= y0 && y <= y1) return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return 0; };
// Big Ben: lathe body (+ darker inner), crown, headstock; the crack is a jagged ribbon on the surface at angle 0 (+x), grown by drawRange
function makeBell(mat, crack = true) { const G = new THREE.Group(); const pts = BP.map(([r, y]) => new THREE.Vector2(r, y)); const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), mat); body.castShadow = true; G.add(body);
  const inner = new THREE.Mesh(new THREE.LatheGeometry(BP.map(([r, y]) => new THREE.Vector2(Math.max(0.001, r - 0.09), Math.max(0.02, y - 0.05))), 48), M.iron); tintM(inner, 0x2a1e18); inner.material = inner.material.clone(); inner.material.side = THREE.BackSide; G.add(inner);
  const K = new Kit(); K.put(M.iron, cyl(0.34, 0.4, 0.3, 16), 0, 2.36, 0, 0, 0, 0, 1, 1, 1, 0x4a3a2a); K.box(M.iron, -0.9, 0.9, 2.5, 2.78, -0.3, 0.3, 0x3a3440, 0.04); K.box(M.plank, -1.1, 1.1, 2.78, 3.1, -0.36, 0.36, 0x6a4a30, 0.04); K.build(G);
  let crackM = null, sq = null; if (crack) { const P = []; let a = 0; const R = PT.rng(1859); for (let i = 0; i <= 14; i++) { const y = 0.01 + i * 0.07; a += (R() - 0.5) * 0.05; P.push(new THREE.Vector3(Math.cos(a) * (bellR(y) + 0.012), y, -Math.sin(a) * (bellR(y) + 0.012))); }
    const curve = new THREE.CatmullRomCurve3(P); const tg = new THREE.TubeGeometry(curve, 40, 0.022, 4, false); crackM = new THREE.Mesh(tg, M.crack); crackM.userData.n = tg.index.count; G.add(crackM);
    const top = P[P.length - 1]; sq = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.04), M.crack); sq.position.copy(top).multiplyScalar(1.0); sq.lookAt(top.x * 2, top.y, top.z * 2); sq.visible = false; G.add(sq); }
  G.userData = { body, crackM, sq }; return G; }
// outside hammer: pivot group (rotation.z lifts the head away from the bell at +x)
function makeHammer(root, px, py) { const P = new THREE.Group(); P.position.set(px, py, 0); root.add(P); const K = new Kit(), hx = BELL.HX + 0.2 - px, hy = BELL.BM + 0.16 - py;
  K.beam(M.iron, [0, 0, 0], [hx, hy, 0], 0.07, 0x2a2a34, true, 8); K.put(M.iron, cyl(0.1, 0.1, 0.22, 12), 0, 0, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a3a44); K.build(P);
  const head = new THREE.Group(); head.position.set(hx, hy, 0); P.add(head); const KH = new Kit(); KH.put(M.iron, cyl(0.16, 0.16, 0.42, 16), 0, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x4a4a56); KH.put(M.iron, cyl(0.12, 0.16, 0.06, 16), -0.24, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x6a6a76); KH.build(head);
  P.userData.head = head; return P; }
function tree(K, x, y, z, s, R, c = 0x4a7a3a) { K.beam(M.bark, [x, y - 0.2, z], [x, y + 2.6 * s, z], 0.16 * s, 0x6a5a4a, true, 6); for (let i = 0; i < 6; i++) { const a = R() * TAU, rr = (0.5 + R() * 0.6) * s; K.put(M.leaf, lumpGeo(i + Math.round(x * 3 + z), 1, 0.3), x + Math.cos(a) * rr * 0.8, y + (3.0 + R() * 1.8) * s, z + Math.sin(a) * rr * 0.8, 0, R() * 6, 0, 1.4 * s, 1.15 * s, 1.4 * s, [c, 0x3f6e36, 0x5a8a44][i % 3]); } }
function lamp(K, x, y, z, c = 0x24242c) { K.beam(M.iron, [x, y, z], [x, y + 3.4, z], 0.07, c, true, 8); K.put(M.iron, cyl(0.14, 0.2, 0.3, 10), x, y + 0.15, z, 0, 0, 0, 1, 1, 1, c); for (const s of [-1, 1]) { K.beam(M.iron, [x, y + 3.2, z], [x + s * 0.5, y + 3.4, z], 0.04, c); K.put(M.winLit, sph(0.14, 10, 8), x + s * 0.5, y + 3.25, z, 0, 0, 0, 1, 1.2, 1); } K.put(M.iron, new THREE.ConeGeometry(0.12, 0.3, 8), x, y + 3.55, z, 0, 0, 0, 1, 1, 1, c); }
function pinnacle(K, x, y, z, s, c = 0xd6bf8c) { K.box(M.stone, x - 0.3 * s, x + 0.3 * s, y, y + 1.4 * s, z - 0.3 * s, z + 0.3 * s, c, 0.04); K.put(M.stone, new THREE.ConeGeometry(0.34 * s, 1.8 * s, 4), x, y + 2.3 * s, z, 0, Math.PI / 4, 0, 1, 1, 1, c); K.put(M.gold, sph(0.08 * s, 8, 6), x, y + 3.25 * s, z, 0, 0, 0, 1, 1, 1, 0xe8c050); }

// ================================================================= TOWER (Westminster today)
function buildTower(root) { const R = PT.rng(2012), K = new Kit(), { TW, DY, DR, BY0, BY1 } = TOWER;
  // ground: plaza paving (x < 16), river (x > 16), embankment wall; far bank grass
  mesh(root, planeUV(600, 600, 600, 600), M.pave, -284, 0, 0, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  const water = mesh(root, planeUV(400, 600, 400, 600), M.water, 216, -3.2, 0, -Math.PI / 2, 0, 0, false); water.receiveShadow = true;
  K.box(M.stone, 15.4, 16.2, -3.4, 0.6, -300, 300, 0xb8aa90, 0.05); mesh(root, planeUV(200, 600, 200, 600), M.grass, 516, 0.4, 0, -Math.PI / 2, 0, 0, false);
  // tower shaft: core box + panel faces + corner buttresses with string courses
  K.box(M.stone, -TW, TW, 0, 52, -TW, TW, 0xd0b888, 0.05);
  const panelFace = (y0, y1, half, rep) => { for (let i = 0; i < 4; i++) { const ry = i * Math.PI / 2; const pm = mesh(root, planeUV(2 * half - 1.2, y1 - y0, 1, rep), M.panel, Math.sin(ry) * (half + 0.03), (y0 + y1) / 2, Math.cos(ry) * (half + 0.03), 0, ry, 0, false); pm.receiveShadow = true; } };
  panelFace(0.8, 52, TW, 6);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { K.box(M.stone, sx * TW - 0.7, sx * TW + 0.7, 0, 52, sz * TW - 0.7, sz * TW + 0.7, 0xdcc698, 0.06); for (let y = 6; y < 52; y += 6.4) K.box(M.stone, sx * TW - 0.85, sx * TW + 0.85, y, y + 0.3, sz * TW - 0.85, sz * TW + 0.85, 0xe8d4a8, 0.04); }
  for (const y of [0, 17, 34, 51.6]) K.box(M.stone, -TW - 0.5, TW + 0.5, y, y + 0.5, -TW - 0.5, TW + 0.5, 0xe8d4a8, 0.06);
  // clock stage: slightly wider, four dials with frames + motto strip, gables over each dial
  const CW = TW + 0.6; K.box(M.stone, -CW, CW, 52, BY0, -CW, CW, 0xd8c090, 0.06); K.box(M.stone, -CW - 0.4, CW + 0.4, BY0 - 0.6, BY0, -CW - 0.4, CW + 0.4, 0xe8d4a8, 0.06);
  const dials = [], hands = []; for (let i = 0; i < 4; i++) { const ry = i * Math.PI / 2, nx = Math.sin(ry), nz = Math.cos(ry);
    const d = mesh(root, plane(2 * DR + 1.6, 2 * DR + 1.6), M.dial, nx * (CW + 0.05), DY, nz * (CW + 0.05), 0, ry, 0, false); dials.push(d);
    mesh(root, plane(2 * DR + 1.6, 0.6), M.motto, nx * (CW + 0.06), DY - DR - 1.35, nz * (CW + 0.06), 0, ry, 0, false);
    const hg = new THREE.Group(); hg.position.set(nx * (CW + 0.2), DY, nz * (CW + 0.2)); hg.rotation.y = ry; root.add(hg); const KH = new Kit();
    const hh = new THREE.Group(), mh = new THREE.Group(); hg.add(hh); hg.add(mh); KH.box(M.gold, -0.12, 0.12, -0.3, 2.0, -0.04, 0.04, 0x2a2420, 0.03); KH.put(M.gold, new THREE.ConeGeometry(0.22, 0.5, 4), 0, 2.0, 0, 0, 0, 0, 1, 1, 0.3, 0x2a2420); KH.build(hh);
    const KM = new Kit(); KM.box(M.gold, -0.08, 0.08, -0.4, 3.0, 0.05, 0.11, 0x2a2420, 0.03); KM.put(M.gold, new THREE.ConeGeometry(0.16, 0.4, 4), 0, 3.0, 0.08, 0, 0, 0, 1, 1, 0.3, 0x2a2420); KM.build(mh);
    const KC = new Kit(); KC.put(M.gold, cyl(0.24, 0.24, 0.1, 16), 0, 0, 0.14, Math.PI / 2, 0, 0, 1, 1, 1, 0xe8c050); KC.build(hg); hands.push({ hh, mh });
    K.at(nx * (CW + 0.1), 0, nz * (CW + 0.1), ry, () => { pinnacle(K, -CW + 0.5, BY0, 0.3, 1.2); pinnacle(K, CW - 0.5, BY0, 0.3, 1.2); pinnacle(K, 0, BY0, 0.3, 0.9); }); }
  // belfry stage: open arcade (3 lancets per side, dark inside), corner pinnacles
  K.box(M.stone, -TW + 0.2, TW - 0.2, BY0, BY1, -TW + 0.2, TW - 0.2, 0x2a2232, 0.02);
  for (let i = 0; i < 4; i++) { const ry = i * Math.PI / 2; K.at(0, 0, 0, ry, () => { for (let k = 0; k <= 3; k++) { const x = -TW + 0.6 + k * (2 * TW - 1.2) / 3; K.box(M.stone, x - 0.4, x + 0.4, BY0, BY1 - 1.2, TW - 0.2, TW + 0.5, 0xdcc698, 0.04); }
    K.box(M.stone, -TW, TW, BY1 - 1.4, BY1, TW - 0.3, TW + 0.55, 0xd8c090, 0.05); for (let k = 0; k < 3; k++) { const x = -TW + 0.6 + (k + 0.5) * (2 * TW - 1.2) / 3; K.put(M.stone, new THREE.ConeGeometry(1.4, 1.6, 3), x, BY1 - 1.9, TW + 0.2, Math.PI, 0, 0, 1, 1, 0.25, 0xdcc698); } }); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) pinnacle(K, sx * (TW + 0.2), BY1, sz * (TW + 0.2), 1.5);
  // spire: slate pyramid with gold ribs, two tiers of dormers, lantern, iron crown, orb + cross
  K.put(M.slate, new THREE.CylinderGeometry(1.2, TW * 1.2, 14, 4, 1), 0, BY1 + 7, 0, 0, Math.PI / 4, 0, 1, 1, 1, 0xffffff);
  for (let i = 0; i < 4; i++) { const ry = i * Math.PI / 2; K.at(0, 0, 0, ry, () => { for (const [y, d, s] of [[BY1 + 2.2, TW * 0.9, 1], [BY1 + 7.2, TW * 0.55, 0.65]]) { K.box(M.slate, -0.6 * s, 0.6 * s, y, y + 1.4 * s, d - 0.4, d + 0.4, 0x4a5468, 0.04); K.put(M.slate, new THREE.ConeGeometry(0.9 * s, 1.2 * s, 4), 0, y + 2.0 * s, d, 0, Math.PI / 4, 0, 1, 1, 1, 0x4a5468); K.put(M.gold, sph(0.08, 8, 6), 0, y + 2.7 * s, d, 0, 0, 0, 1, 1, 1, 0xe8c050); } }); }
  K.box(M.slate, -1.3, 1.3, BY1 + 14, BY1 + 16.4, -1.3, 1.3, 0x3a4458, 0.06); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; K.beam(M.gold, [Math.cos(a) * 1.3, BY1 + 14, Math.sin(a) * 1.3], [Math.cos(a) * 1.3, BY1 + 16.4, Math.sin(a) * 1.3], 0.08, 0xe8c050, true, 6); }
  K.put(M.slate, new THREE.ConeGeometry(1.0, 2.6, 8), 0, BY1 + 17.7, 0, 0, 0, 0, 1, 1, 1, 0x3a4458); K.beam(M.gold, [0, BY1 + 18.8, 0], [0, BY1 + 20.6, 0], 0.08, 0xe8c050, true, 6); K.put(M.gold, sph(0.34, 14, 10), 0, BY1 + 20, 0, 0, 0, 0, 1, 1, 1, 0xe8c050); K.box(M.gold, -0.5, 0.5, BY1 + 20.7, BY1 + 20.85, -0.06, 0.06, 0xe8c050, 0.02);
  // palace wing (left), with windows, crenellation, pinnacles, and the far Victoria-like tower block
  K.at(-6, 0, -2, 0, () => { K.box(M.stone, -140, 0, 0, 20, -16, 0, 0xccb486, 0.05); for (let x = -138; x < 0; x += 4) pinnacle(K, x, 20, -0.4, 1.1); for (let x = -136; x < 0; x += 8) K.box(M.stone, x - 0.6, x + 0.6, 0, 22, -0.3, 0.6, 0xdcc698, 0.05); });
  const wing = mesh(root, planeUV(132, 18, 132 / 12, 1), M.panelW, -74, 9.8, -1.95, 0, 0, 0, false); wing.receiveShadow = true;
  K.box(M.stone, -150, -132, 0, 64, -40, -18, 0xccb486, 0.05); K.put(M.slate, new THREE.CylinderGeometry(0.5, 10, 10, 4, 1), -141, 69, -29, 0, Math.PI / 4, 0, 1, 1, 1, 0x4a5468);
  // plaza: plane trees, lamps, railings along the embankment, benches; far city blocks
  for (let z = -14; z < 30; z += 14) { tree(K, 11.5, 0, z + R() * 3, 1.6 + R() * 0.5, R); lamp(K, 14.6, 0, z + 7, 0x2a4a3a); }
  for (let z = -40; z < 140; z += 2.5) K.beam(M.iron, [15.8, 0.6, z], [15.8, 1.6, z], 0.04, 0x2a4a3a);
  K.box(M.iron, 15.7, 15.9, 1.55, 1.65, -40, 140, 0x2a4a3a, 0.01);
  for (let i = 0; i < 12; i++) tree(K, -10 - R() * 30, 0, 18 + R() * 70, 1.8 + R() * 0.8, R);
  // the green bridge: deck at y = 3.2 from the embankment over the river, arches, green parapet + lamps
  K.box(M.green, 16, 260, 2.6, 3.2, 20, 34, 0x3a6a4a, 0.05); K.box(M.stone, 16, 260, 3.2, 3.24, 21, 33, 0x8a8a8a, 0.01);
  for (let x = 20; x < 260; x += 2) for (const z of [20.2, 33.8]) K.beam(M.green, [x, 3.2, z], [x, 4.3, z], 0.05, 0x2a5a3a);
  for (const z of [20.2, 33.8]) K.box(M.green, 16, 260, 4.25, 4.45, z - 0.15, z + 0.15, 0x2a5a3a, 0.03);
  for (let x = 30; x < 260; x += 24) { K.box(M.stone, x - 2, x + 2, -3.4, 2.6, 21, 33, 0xb8aa90, 0.1); for (const z of [20.4, 33.6]) lamp(K, x, 3.2, z, 0x2a5a3a); }
  for (let x = 30; x < 260; x += 24) K.put(M.green, new THREE.TorusGeometry(10, 0.6, 6, 24, Math.PI), x + 12, -3.2, 33.2, 0, 0, 0, 1, 0.55, 1, 0x3a6a4a);
  for (let i = 0; i < 30; i++) { const x = -200 + R() * 180, z = -90 - R() * 60, w = 10 + R() * 14, h = 14 + R() * 26; K.box(M.stone, x, x + w, 0, h, z, z + 10, [0xb8a890, 0xc8b8a0, 0xa89880][i % 3], 0.1); }
  for (let i = 0; i < 26; i++) { const x = 300 + R() * 200, z = -200 + R() * 400, w = 10 + R() * 20, h = 12 + R() * 30; K.box(M.stone, x, x + w, 0.4, h, z, z + 12, [0xb8b0a0, 0xa8a090, 0xc8c0b0][i % 3], 0.1); }
  K.build(root, 40);
  // story parts: the base name plaque (two materials), jubilee bunting, bong rings at the belfry, lit dial glows
  const plaque = mesh(root, plane(3.6, 0.7), M.plaqueOld, 0, 2.7, TW + 0.06, 0, 0, 0, false); const pFrame = new Kit(); pFrame.box(M.gold, -1.95, 1.95, 2.28, 3.12, TW - 0.02, TW + 0.04, 0xc8a048, 0.03); pFrame.build(root);
  const bunts = []; for (const [x, y, z, w, ry] of [[0, 24, TW + 0.8, 11, 0], [-30, 16, -1.2, 48, 0], [-80, 16, -1.2, 48, 0], [30, 7.5, 20.4, 26, 0], [60, 7.5, 20.4, 26, 0], [6, 9, 18, 14, Math.PI / 2]]) { const b = mesh(root, plane(w, w * 0.12), M.bunting, x, y, z, 0, ry, 0, false); b.castShadow = false; b.visible = false; bunts.push(b); }
  const rings = []; for (let i = 0; i < 3; i++) { const r = nond(mesh(root, plane(1, 1), M.ring.clone(), 0, (BY0 + BY1) / 2, 0, 0, 0, 0, false)); r.material.depthTest = false; r.renderOrder = 9; rings.push(r); }
  const glows = [0, 1].map((i) => glowAt(root, [Math.sin(i * Math.PI / 2) * (CW + 0.6), DY, Math.cos(i * Math.PI / 2) * (CW + 0.6)], 11, '#ffe0a0', 0));
  return { dials, hands, plaque, bunts, rings, glows, water };
}

// ================================================================= BELFRY (inside, Big Ben + quarter bells)
function buildBelfry(root) { const K = new Kit(), X = 6, HT = 8.4;
  K.box(M.floor, -X, X, -0.1, 0, -X, X, 0xffffff, 0.01); K.box(M.plank, -X, X, HT, HT + 0.2, -X, X, 0x4a3a30, 0.01);
  // walls with 3 lancet openings each (sky behind), iron bell frame, ladder, railings
  const walls = (fn) => { for (let i = 0; i < 4; i++) K.at(0, 0, 0, i * Math.PI / 2, fn); };
  walls(() => { for (let k = 0; k <= 3; k++) { const x = -X + k * (2 * X) / 3; K.box(M.wallG, x - 0.55, x + 0.55, 0, HT, -X - 0.4, -X + 0.1, 0xd0c0a0, 0.04); }
    K.box(M.wallG, -X, X, 0, 1.4, -X - 0.4, -X + 0.1, 0xc8b898, 0.04); K.box(M.wallG, -X, X, 6.4, HT, -X - 0.4, -X + 0.1, 0xc8b898, 0.04);
    for (let k = 0; k < 3; k++) { const x = -X + (k + 0.5) * (2 * X) / 3; K.put(M.wallG, new THREE.ConeGeometry(1.5, 1.6, 3), x, 5.6, -X - 0.15, Math.PI, 0, 0, 1, 1, 0.25, 0xc8b898); K.beam(M.wallG, [x, 1.4, -X - 0.1], [x, 5.4, -X - 0.1], 0.08, 0xc8b898); } });
  const skies = []; for (let i = 0; i < 4; i++) { const ry = i * Math.PI / 2; const s = mesh(root, plane(40, 20), M.sky, -Math.sin(ry) * 14, 3.8, -Math.cos(ry) * 14, 0, ry, 0, false); skies.push(s); }
  // bell frame: two portal frames + headstock beam
  for (const z of [-1.3, 1.3]) { K.beam(M.iron, [-2.6, 0, z], [-2.0, 6.4, z], 0.16, 0x2a3040, false); K.beam(M.iron, [2.6, 0, z], [2.0, 6.4, z], 0.16, 0x2a3040, false); K.box(M.iron, -2.4, 2.4, 6.2, 6.6, z - 0.16, z + 0.16, 0x2a3040, 0.03); K.box(M.iron, -2.4, 2.4, 1.0, 1.2, z - 0.1, z + 0.1, 0x2a3040, 0.02); }
  K.box(M.iron, -0.4, 0.4, 6.1, 6.7, -1.5, 1.5, 0x2a3040, 0.03); for (let k = -2; k <= 2; k++) K.put(M.gold, sph(0.05, 6, 4), k, 6.4, 1.48, 0, 0, 0, 1, 1, 1, 0xc8a048);
  // quarter bells (4) in the corners on their own beams
  const qb = []; for (const [x, z, s] of [[-4.4, -4.2, 0.55], [4.4, -4.2, 0.48], [-4.4, 3.6, 0.42], [4.6, 3.4, 0.36]]) { K.box(M.iron, x - 1, x + 1, 5.9, 6.1, z - 0.1, z + 0.1, 0x2a3040, 0.02); K.beam(M.iron, [x - 0.9, 0, z], [x - 0.9, 6, z], 0.08, 0x2a3040); K.beam(M.iron, [x + 0.9, 0, z], [x + 0.9, 6, z], 0.08, 0x2a3040);
    const b = makeBell(M.qbell, false); b.scale.setScalar(s); b.position.set(x, 5.9 - 3.1 * s, z); root.add(b); qb.push(b); }
  // stair hatch + rail, lamp
  K.box(M.plank, 3.2, 5.2, 0.0, 0.06, 0.6, 2.4, 0x3a2a20, 0.01); for (let x = 3.2; x <= 5.2; x += 0.5) K.beam(M.iron, [x, 0, 0.55], [x, 1.0, 0.55], 0.025, 0x2a2a30); K.box(M.iron, 3.2, 5.2, 0.98, 1.04, 0.52, 0.58, 0x2a2a30, 0.01);
  K.build(root);
  const bell = makeBell(M.bell, true); bell.position.set(0, BELL.BM, 0); root.add(bell);
  const hammer = makeHammer(root, 2.25, 4.55);
  const rings = []; for (let i = 0; i < 3; i++) { const r = nond(mesh(root, plane(1, 1), M.ring.clone(), 0, BELL.BM + 0.8, 0, 0, 0, 0, false)); r.renderOrder = 9; rings.push(r); }
  const shafts = [shaftAt(root, [-1.5, 3.5, -3], 1.6, 7, 0.2, 0.55, 0.16, 0xfff0d0), shaftAt(root, [2.5, 3.6, -3.5], 1.6, 7, -0.3, 0.5, 0.14, 0xfff0d0)];
  const dust = motes(root, 70, [-4, 4, 0.5, 6, -4, 4], 41, 0.012);
  const lampG = glowAt(root, [0, 7.6, 0], 2.4, '#ffd890', 0);
  return { bell, hammer, rings, shafts, dust, skies, qb, lampG };
}

// ================================================================= YARD (New Palace Yard, 1857)
function buildYard(root) { const R = PT.rng(1857), K = new Kit();
  mesh(root, planeUV(120, 80, 180, 120), M.cobble, 0, 0, -10, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  // timber test frame (A-frames + beam), stays, the first bell hung low with a hammer
  for (const s of [-1, 1]) { K.beam(M.plank, [s * 2.6, 0, -2.0 - 0.9], [s * 2.2, 4.6, -2.0], 0.16, 0x7a5a3a); K.beam(M.plank, [s * 2.6, 0, -2.0 + 0.9], [s * 2.2, 4.6, -2.0], 0.16, 0x7a5a3a); K.beam(M.plank, [s * 2.55, 1.0, -2.8], [s * 2.55, 1.0, -1.2], 0.08, 0x6a4a30); }
  K.box(M.plank, -2.6, 2.6, 4.5, 4.9, -2.2, -1.8, 0x6a4a30, 0.04); K.beam(M.iron, [0, 4.5, -2.0], [0, 3.3, -2.0], 0.05, 0x2a2a30);
  for (let i = 0; i < 6; i++) K.put(M.plank, cyl(0.08, 0.08, 1.4, 6), -1 + i * 0.4, 0.08, 1.2, 0, 0, Math.PI / 2, 1, 1, 1, 0x8a6a4a);
  // unfinished tower in scaffolding behind, palace wall, hoardings with bills, gas lamps, crates
  K.at(4, 0, -26, 0, () => { K.box(M.stone, -6, 6, 0, 30, -6, 6, 0xd0b888, 0.05); for (let y = 0; y <= 34; y += 3) { K.box(M.plank, -7.4, 7.4, y, y + 0.14, 6.4, 7.0, 0x8a6a4a, 0.02); K.box(M.plank, -7.4, -6.8, y, y + 0.14, -7, 7, 0x8a6a4a, 0.02); }
    for (let x = -7.2; x <= 7.2; x += 2.4) K.beam(M.plank, [x, 0, 6.8], [x, 35, 6.8], 0.08, 0x7a5a3a); for (let z = -7; z <= 7; z += 2.8) K.beam(M.plank, [-7.1, 0, z], [-7.1, 35, z], 0.08, 0x7a5a3a);
    K.beam(M.plank, [0, 30, 0], [0, 40, 0], 0.18, 0x6a4a30); K.beam(M.plank, [0, 40, 0], [9, 38, 0], 0.12, 0x6a4a30); K.beam(M.iron, [9, 38, 0], [9, 31, 0], 0.03, 0x2a2a30); });
  const wing = mesh(root, planeUV(60, 14, 60 / 10, 1), M.panelW, -30, 7, -18, 0, 0, 0, false); K.box(M.stone, -60, 0, 0, 14, -22, -18.05, 0xccb486, 0.05); for (let x = -58; x < 0; x += 4) pinnacle(K, x, 14, -18.4, 0.9);
  K.box(M.plank, -14, -4, 0, 3.2, -9, -8.8, 0x6a4a30, 0.03); K.box(M.plank, 6, 16, 0, 3.2, -9, -8.8, 0x6a4a30, 0.03);
  const boxing = mesh(root, plane(1.6, 2.4), M.boxing, -7.0, 1.7, -8.76, 0, 0, 0, false); const trials = mesh(root, plane(3.2, 0.8), M.signTrials, 9.5, 2.2, -8.76, 0, 0, 0, false); mesh(root, plane(3.0, 0.75), M.signWorks, -11.0, 2.4, -8.76, 0, 0, 0, false);
  for (const x of [-12, -4.6, 5, 13]) lamp(K, x, 0, -7.6);
  for (const [x, z, ry] of [[6.6, -5.0, 0.3], [7.4, -4.0, 0.9], [5.8, -6.0, 0.1]]) K.at(x, 0, z, ry, () => { K.box(M.plank, -0.45, 0.45, 0, 0.8, -0.4, 0.4, 0x9a7a50, 0.03); K.box(M.plank, -0.47, 0.47, 0.35, 0.42, -0.42, 0.42, 0x6a4a30, 0.01); });
  for (let i = 0; i < 10; i++) { const x = -40 + i * 9 + R() * 3; K.box(M.brick, x, x + 7, 0, 10 + R() * 8, -40 - R() * 8, -32, 0xffffff, 0.05); }
  K.build(root, 30);
  const bell = makeBell(M.bell1, true); bell.position.set(0, 0.95, -2.0); bell.scale.setScalar(0.92); root.add(bell);
  const hammer = new THREE.Group(); hammer.position.set(2.25, 3.4, -2.0); root.add(hammer); { const KH = new Kit(); KH.beam(M.plank, [0, 0, 0], [-0.62, -2.1, 0], 0.06, 0x6a4a30, true, 6); KH.put(M.iron, cyl(0.2, 0.2, 0.5, 14), -0.66, -2.2, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x3a3a44); KH.put(M.iron, cyl(0.08, 0.08, 0.3, 8), 0, 0, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a3a44); KH.build(hammer); }
  const flashG = glowAt(root, [0.9, 1.4, -1.0], 4, '#fff4d0', 0); const glows = [-12, -4.6, 5, 13].map((x) => glowAt(root, [x, 3.3, -7.6], 1.4, '#ffc870', 0));
  const dust = motes(root, 60, [-6, 6, 0.3, 4, -4, 3], 61, 0.012);
  return { bell, hammer, flashG, glows, dust };
}

// ================================================================= FOUNDRY (Whitechapel, 1858)
function buildFoundry(root) { const R = PT.rng(1858), K = new Kit(), X = 7, ZB = -4.5, HT = 6;
  K.box(M.sand, -X, X, -0.05, 0, ZB, 6, 0xffffff, 0.01); K.box(M.brick, -X, X, 0, HT, ZB - 0.3, ZB, 0xffffff, 0.02); K.box(M.brick, -X - 0.3, -X, 0, HT, ZB, 6, 0xffffff, 0.02); K.box(M.brick, X, X + 0.3, 0, HT, ZB, 6, 0xffffff, 0.02);
  for (let i = 0; i < 5; i++) K.beam(M.plank, [-X, HT - 0.3, ZB + i * 2.2], [X, HT - 0.3, ZB + i * 2.2], 0.22, 0x3a2a20);
  mesh(root, plane(4.4, 0.86), M.signFoundry, 0.6, 4.6, ZB + 0.05, 0, 0, 0, false);
  // furnace (left back), chimney hood, coal heap; pit with the mould; crucible on a chain hoist
  K.at(-4.4, 0, -3.2, 0.3, () => { K.box(M.brick, -1.4, 1.4, 0, 2.4, -1.0, 1.0, 0xc89878, 0.08); K.box(M.brick, -1.0, 1.0, 2.4, HT, -0.7, 0.7, 0xb08868, 0.06); K.box(M.iron, -0.7, 0.7, 0.5, 1.5, 0.98, 1.06, 0x2a2228, 0.03); });
  const mouth = mesh(root, plane(1.2, 0.85), M.ember, -4.4 + Math.sin(0.3) * 1.04, 1.0, -3.2 + Math.cos(0.3) * 1.04, 0, 0.3, 0, false);
  for (let i = 0; i < 26; i++) K.put(M.coal, lumpGeo(i, 1, 0.3), -5.6 + R() * 1.6, 0.1, -0.8 + R() * 1.2, 0, R() * 6, 0, 0.25, 0.18, 0.25, 0x1a1418);
  K.put(M.sand, cyl(1.9, 1.9, 0.2, 32), 0.6, 0.02, -0.4, 0, 0, 0, 1, 1, 1, 0x4a3a30); const mould = new THREE.Mesh(new THREE.LatheGeometry(BP.map(([r, y]) => new THREE.Vector2(r + 0.18, y * 0.6 + 0.05)), 40), M.sand); tintM(mould, 0x8a6a50); mould.position.set(0.6, 0, -0.4); mould.scale.setScalar(0.85); root.add(mould);
  K.put(M.sand, cyl(0.1, 0.14, 0.3, 10), 0.6, 1.3, -0.4, 0, 0, 0, 1, 1, 1, 0x3a2a22);
  K.beam(M.iron, [-1.0, HT - 0.3, -0.4], [-1.0, 3.4, -0.4], 0.03, 0x2a2a30); K.box(M.plank, -X, X, HT - 0.5, HT - 0.3, -0.5, -0.3, 0x3a2a20, 0.02);
  // broken bell pieces (right), tools on the wall, sacks
  for (let i = 0; i < 22; i++) { const a = R() * TAU, r = R() * 1.1; K.put(M.iron, lumpGeo(40 + i, 0, 0.45), 4.4 + Math.cos(a) * r, 0.12 + R() * 0.3, 1.4 + Math.sin(a) * r * 0.7, R() * 3, R() * 6, R() * 3, 0.32 + R() * 0.3, 0.06 + R() * 0.05, 0.24 + R() * 0.2, [0x8a6a40, 0x7a5a38, 0x9a7a48][i % 3]); }
  for (let i = 0; i < 5; i++) K.beam(M.iron, [X - 0.1, 2.2, -3 + i * 0.6], [X - 0.1, 3.4, -3 + i * 0.6 + 0.1], 0.04, 0x3a3a44);
  for (let i = 0; i < 4; i++) K.put(M.paint, lumpGeo(70 + i, 1, 0.15), -6 + i * 0.7, 0.35, 3.8, 0, R() * 6, 0, 0.4, 0.45, 0.32, 0xb8a078);
  K.build(root);
  const cruc = new THREE.Group(); cruc.position.set(-1.0, 3.1, -0.4); root.add(cruc); { const KC = new Kit(); KC.put(M.iron, cyl(0.42, 0.3, 0.7, 18, true), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0x3a3236); KC.put(M.iron, new THREE.TorusGeometry(0.44, 0.05, 6, 18), 0, 0.33, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2228); KC.beam(M.iron, [-0.44, 0.3, 0], [0, 0.9, 0], 0.03, 0x2a2a30); KC.beam(M.iron, [0.44, 0.3, 0], [0, 0.9, 0], 0.03, 0x2a2a30); KC.build(cruc);
    const top = mesh(cruc, cyl(0.3, 0.3, 0.04, 18), M.molten, 0, 0.2, 0, 0, 0, 0, false); }
  const stream = mesh(root, cyl(0.07, 0.05, 1, 10), M.molten, 0.4, 2, -0.4, 0, 0, 0, false); stream.visible = false;
  const pool = mesh(root, cyl(0.14, 0.14, 0.03, 12), M.molten, 0.6, 1.47, -0.4, 0, 0, 0, false); pool.visible = false;
  const fireG = glowAt(root, [-4.0, 1.1, -2.0], 4.5, '#ff8a3a', 0.6); const potG = glowAt(root, [0.5, 1.6, -0.2], 3.2, '#ffa040', 0);
  const sparks = motes(root, 90, [-1, 2, 1.4, 4, -1.2, 0.6], 71, 0.016); sparks.im.material = sparks.im.material.clone(); sparks.im.material.color.set(new THREE.Color(0xffa040).multiplyScalar(1.6));
  const smoke = motes(root, 40, [-5.5, -3.5, 2.5, 5.5, -3.5, -2.5], 73, 0.04);
  return { cruc, stream, pool, fireG, potG, sparks, smoke, mouth };
}

// ================================================================= CLOCK ROOM (the Great Clock)
function buildClock(root) { const K = new Kit(), X = 6, ZB = -3.6, HT = 5.6;
  K.box(M.floor, -X, X, -0.1, 0, ZB, 5, 0xffffff, 0.01); K.box(M.wallG, -X, X, 0, HT, ZB - 0.3, ZB, 0xe0d4bc, 0.02); K.box(M.wallG, -X - 0.3, -X, 0, HT, ZB, 5, 0xe0d4bc, 0.02); K.box(M.wallG, X, X + 0.3, 0, HT, ZB, 5, 0xe0d4bc, 0.02);
  K.box(M.plank, -X, X, HT, HT + 0.2, ZB, 5, 0x5a4a3a, 0.01);
  // back wall: the dial from inside (round opening, back-lit)
  const dialB = mesh(root, new THREE.CircleGeometry(2.1, 48), M.dialBack, -2.8, 3.0, ZB + 0.02, 0, 0, 0, false); K.put(M.iron, new THREE.TorusGeometry(2.12, 0.08, 8, 48), -2.8, 3.0, ZB + 0.05, 0, 0, 0, 1, 1, 1, 0x2a2a30);
  K.beam(M.iron, [-2.8, 3.0, ZB + 0.1], [-2.8, 3.0, -1.6], 0.06, 0x2a2a30, true, 8);
  // the clock frame: long green iron bed on legs, three trains of wheels (going, quarter, hour), a big escape wheel
  K.box(M.green, -4.6, 3.6, 1.0, 1.24, -1.9, -1.3, 0x2a5a42, 0.04); K.box(M.green, -4.6, 3.6, 1.0, 1.24, 0.1, 0.7, 0x2a5a42, 0.04);
  for (const x of [-4.4, -1.6, 1.2, 3.4]) for (const z of [-1.6, 0.4]) K.box(M.green, x - 0.1, x + 0.1, 0, 1.0, z - 0.1, z + 0.1, 0x2a5a42, 0.02);
  for (const x of [-4.2, -2.4, -0.6, 1.2, 3.0]) K.box(M.green, x - 0.08, x + 0.08, 1.24, 2.6, -1.9, 0.7, 0x2a5a42, 0.02);
  const wheels = []; const wheel = (x, y, z, r, n, c = 0xc8a048) => { const g = new THREE.Group(); g.position.set(x, y, z); root.add(g); const KW = new Kit(); KW.put(M.brass, new THREE.TorusGeometry(r, 0.05, 6, 40), 0, 0, 0, 0, 0, 0, 1, 1, 1, c);
    for (let i = 0; i < n; i++) { const a = i / n * TAU; KW.cb(M.brass, 0.06, 0.08, 0.06, Math.cos(a) * (r + 0.06), Math.sin(a) * (r + 0.06), 0, c, 0, 0, a); } for (let i = 0; i < 4; i++) { const a = i / 4 * TAU; KW.beam(M.brass, [0, 0, 0], [Math.cos(a) * r, Math.sin(a) * r, 0], 0.03, c); }
    KW.put(M.iron, cyl(0.06, 0.06, 0.5, 10), 0, 0, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2a30); KW.build(g); wheels.push(g); return g; };
  for (const [x, y, r, n, sp] of [[-3.3, 1.9, 0.55, 40, 0.3], [-1.5, 1.8, 0.42, 32, -0.5], [0.3, 2.0, 0.6, 44, 0.2], [2.1, 1.85, 0.4, 30, -0.6], [-2.4, 2.3, 0.28, 20, 0.9], [1.2, 2.4, 0.3, 22, -0.8]]) { const w = wheel(x, y, -0.6, r, n); w.userData.sp = sp; }
  K.put(M.iron, cyl(0.5, 0.5, 0.7, 16), -4.0, 2.6, -0.6, 0, 0, Math.PI / 2, 1, 1, 1, 0x3a3a44); K.beam(M.iron, [-4.0, 2.6, -0.6], [-4.0, 0.2, -0.6], 0.02, 0x8a8a90);
  // pendulum: pivot on a beam at y = 5.2 in front of the frame (z = 1.6); rod 4.2 m, bob, the penny tray
  K.box(M.green, -0.5, 1.5, 5.0, 5.3, 1.3, 1.9, 0x2a5a42, 0.04); K.beam(M.green, [-0.3, 5.0, 1.6], [-0.3, 1.24, 0.6], 0.06, 0x2a5a42); K.beam(M.green, [1.3, 5.0, 1.6], [1.3, 1.24, 0.6], 0.06, 0x2a5a42);
  K.box(M.plank, -0.9, 1.9, -0.1, 0.02, 0.9, 2.3, 0x1a1418, 0.01);
  K.box(M.plank, 1.0, 2.5, 1.08, 1.2, 1.9, 2.9, 0x6a4a30, 0.02); for (const [x, z] of [[1.06, 1.96], [2.44, 1.96], [1.06, 2.84], [2.44, 2.84]]) K.box(M.green, x - 0.04, x + 0.04, 0, 1.08, z - 0.04, z + 0.04, 0x2a5a42, 0.01);
  for (const z of [1.92, 2.88]) K.box(M.green, 2.44, 2.5, 1.2, 2.2, z - 0.03, z + 0.03, 0x2a5a42, 0.01); K.box(M.green, 2.44, 2.5, 2.16, 2.22, 1.9, 2.9, 0x2a5a42, 0.01); for (let i = 0; i < 4; i++) K.box(M.plank, 2.5, 2.9, 0.27 * i + 0.25, 0.27 * i + 0.3, 2.0, 2.8, 0x6a4a30, 0.01);
  K.build(root);
  const pend = new THREE.Group(); pend.position.set(0.5, 5.15, 1.6); root.add(pend); const KP = new Kit(); KP.beam(M.iron, [0, 0, 0], [0, -4.2, 0], 0.035, 0x3a3a44, true, 8); KP.put(M.iron, cyl(0.32, 0.32, 0.5, 24), 0, -4.3, 0, 0, 0, 0, 1, 1, 1, 0x4a4a56); KP.put(M.iron, new THREE.ConeGeometry(0.32, 0.18, 24), 0, -4.0, 0, 0, 0, 0, 1, 1, 1, 0x4a4a56);
  KP.put(M.brass, cyl(0.2, 0.2, 0.025, 20), 0, -2.0, 0, 0, 0, 0, 1, 1, 1, 0xc8a048); KP.put(M.brass, new THREE.TorusGeometry(0.2, 0.012, 6, 24), 0, -1.99, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0xa88038); KP.build(pend);
  const pennies = []; for (let i = 0; i < 10; i++) { const p = mesh(pend, cyl(0.062, 0.062, 0.014, 18), M.penny, -0.06 + (i % 2) * 0.12, -1.98 + 0.015 * (Math.floor(i / 2) + 0.5), (i % 2) * 0.02, 0, 0, 0, false); tintM(p, 0xb06a3a); pennies.push(p); }
  const drop = mesh(pend, cyl(0.062, 0.062, 0.014, 18), M.penny, 0, 0, 0, 0, 0, 0, false); tintM(drop, 0xc8783a); drop.visible = false;
  const dialG = glowAt(root, [-2.8, 3.0, ZB + 0.3], 5.6, '#fff0c8', 0.35); const lampG = glowAt(root, [2.6, 4.6, 0], 1.6, '#ffd890', 0.45);
  const dust = motes(root, 60, [-4, 4, 0.5, 5, -3, 3], 81, 0.011);
  return { pend, pennies, drop, wheels, dialG, lampG, dust };
}

// ================================================================= lights, grades, API
const SET_LIGHT = {
  towerDay: { top: '#7898c4', hor: '#c8dcf4', fog: '#d4e4f0', fogN: 120, fogF: 900, sky: '#a8bcf0', ground: '#6a6448', hemiI: 0.78, fillCol: '#7d93e6', fillI: 0.36, sunCol: '#ffecc8', sunI: 3.7, az: 28, el: 40, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  towerGold: { top: '#4a5aa8', hor: '#ffc890', fog: '#f0c8a0', fogN: 100, fogF: 800, sky: '#9a90d8', ground: '#5a4a50', hemiI: 0.9, fillCol: '#7078d8', fillI: 0.34, sunCol: '#ffb878', sunI: 3.5, az: 40, el: 20, disc: '#fff0c8', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff2e2', fxTint: '#fff6ea', shafts: 0.5 },
  towerDusk: { top: '#1e2258', hor: '#e8907a', fog: '#7a5a80', fogN: 80, fogF: 700, sky: '#6a5ab0', ground: '#3a2a3a', hemiI: 0.8, fillCol: '#6a6ad0', fillI: 0.42, sunCol: '#ff9a6a', sunI: 1.9, az: 70, el: 7, disc: '#ffd8a0', discSize: 0.003, clouds: true, stars: 0, cardTint: '#f8e4e8', fxTint: '#ffffff', shafts: 0 },
  belfry: { top: '#000000', hor: '#3a3040', fog: '#3a3040', fogN: 12, fogF: 60, sky: '#fff0d8', ground: '#4a3a3a', hemiI: 0.9, fillCol: '#8a90c8', fillI: 0.34, sunCol: '#ffe8c0', sunI: 2.9, az: -30, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  belfryGold: { top: '#000000', hor: '#4a3030', fog: '#4a3030', fogN: 12, fogF: 60, sky: '#ffd8a8', ground: '#4a3030', hemiI: 0.88, fillCol: '#7a78c8', fillI: 0.32, sunCol: '#ffb070', sunI: 3.0, az: -40, el: 16, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
  belfryNight: { top: '#000000', hor: '#101430', fog: '#101430', fogN: 12, fogF: 60, sky: '#7a7ab8', ground: '#2a2030', hemiI: 0.7, fillCol: '#5a68c0', fillI: 0.42, sunCol: '#a8b8ff', sunI: 1.5, az: -30, el: 36, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#e8e8f8', fxTint: '#ffffff', shafts: 0 },
  yard: { top: '#4a7ad0', hor: '#d8dcec', fog: '#d8dce8', fogN: 40, fogF: 260, sky: '#a8bcf0', ground: '#6a6058', hemiI: 0.78, fillCol: '#7d93e6', fillI: 0.36, sunCol: '#ffe6c0', sunI: 3.4, az: 40, el: 38, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  yardDusk: { top: '#2a2a6a', hor: '#e8a07a', fog: '#9a7a8a', fogN: 30, fogF: 220, sky: '#7a6ab8', ground: '#3a2a3a', hemiI: 0.78, fillCol: '#6a6ad0', fillI: 0.4, sunCol: '#ffa070', sunI: 2.4, az: 60, el: 10, disc: '#ffd8a0', discSize: 0.003, clouds: true, stars: 0, cardTint: '#f8e8e8', fxTint: '#ffffff', shafts: 0 },
  foundry: { top: '#000000', hor: '#1a1014', fog: '#1a1014', fogN: 10, fogF: 40, sky: '#ffa060', ground: '#3a2018', hemiI: 0.7, fillCol: '#6a60b0', fillI: 0.34, sunCol: '#ffb070', sunI: 1.6, az: -60, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ffe4d0', fxTint: '#ffffff', shafts: 0 },
  clock: { top: '#000000', hor: '#2a2420', fog: '#2a2420', fogN: 10, fogF: 50, sky: '#fff0d8', ground: '#4a3a30', hemiI: 0.92, fillCol: '#8a90c8', fillI: 0.32, sunCol: '#ffe8c8', sunI: 2.2, az: -50, el: 34, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
};
const IN = { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.08, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.42, 0.78], hal: [0.26, '#ff9a50'], vig: [0.34, 0.46, '#2a1420'] } };
const SET_GRADE = {
  towerDay: { look: 'day', over: { exp: 1.03, con: 1.2, sat: 1.12, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c8', 0.05], bloom: [0.4, 0.84], vig: [0.24, 0.5, '#3a3a5a'] } },
  towerGold: { look: 'golden', over: { exp: 1.06, con: 1.22, sat: 1.08, tS: ['#3a3a8a', 0.18], tH: ['#ffc890', 0.1], bloom: [0.42, 0.78], hal: [0.24, '#ffa860'], vig: [0.3, 0.48, '#1e1a3a'] } },
  towerDusk: { look: 'golden', over: { exp: 1.08, con: 1.22, sat: 1.06, tS: ['#2a2a7a', 0.24], tH: ['#ffb080', 0.12], bloom: [0.5, 0.7], hal: [0.32, '#ff9050'], vig: [0.4, 0.44, '#140a20'] } },
  belfry: IN, belfryGold: { look: 'golden', over: { exp: 1.1, con: 1.24, sat: 1.08, lift: [0.035, 0.022, 0.04], tS: ['#3a2a6a', 0.2], tH: ['#ffb070', 0.12], bloom: [0.44, 0.74], hal: [0.3, '#ff9050'], vig: [0.36, 0.46, '#2a1420'] } },
  belfryNight: { look: 'night', over: { exp: 1.16, con: 1.22, sat: 1.04, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#c0d0ff', 0.1], bloom: [0.5, 0.68], hal: [0.3, '#8090ff'], vig: [0.42, 0.42, '#08081a'] } },
  yard: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.08, tS: ['#3a4a8a', 0.15], tH: ['#ffe0b0', 0.06], bloom: [0.36, 0.86], vig: [0.26, 0.5, '#4a3a5a'] } },
  yardDusk: { look: 'golden', over: { exp: 1.08, con: 1.22, sat: 1.04, tS: ['#2a2a7a', 0.22], tH: ['#ffb080', 0.12], bloom: [0.46, 0.72], hal: [0.3, '#ff9050'], vig: [0.38, 0.44, '#140a20'] } },
  foundry: { look: 'office', over: { exp: 1.14, con: 1.26, sat: 1.1, lift: [0.04, 0.02, 0.04], tS: ['#3a1a5a', 0.22], tH: ['#ffa860', 0.16], bloom: [0.5, 0.66], hal: [0.36, '#ff7a30'], vig: [0.42, 0.42, '#1a0810'] } },
  clock: IN,
};

export function buildBB(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'towerDay', ring: -1, ringT: -1, flash: 0, pour: 0, pen: 0, time: 0, swing: 1 };
  let tw, bf, yd, fd, ck;
  const API = makeAPI(ctx, { prefix: 'bb_', origin: BB_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { towerDay: 'day', towerGold: 'day', towerDusk: 'day', belfry: 'office', belfryNight: 'office', belfryGold: 'office', yard: 'day', yardDusk: 'day', foundry: 'office', clock: 'office' },
    practicals: (name, F, W3) => { const fl = 1 + 0.05 * Math.sin(F * 0.7) + 0.03 * Math.sin(F * 1.9);
      if (name === 'belfry' || name === 'belfryGold') return [{ p: W3('belfry', [-2, 4, 4]), col: name === 'belfryGold' ? '#ffb070' : '#fff0d8', I: 2.6, d: 10 }, { p: W3('belfry', [2.6, 3.4, 2.4]), col: '#ffd8a0', I: 2.2 + 6 * ST.flash, d: 8 }, { p: W3('belfry', [0, 7.2, 0]), col: '#ffd890', I: 1.6, d: 8 }];
      if (name === 'belfryNight') return [{ p: W3('belfry', [-3, 4, -4]), col: '#8a9aff', I: 3.0, d: 12 }, { p: W3('belfry', [0, 7.4, 0.5]), col: '#ffc070', I: 4.5 * fl, d: 9 }, { p: W3('belfry', [2.6, 3.4, 2.4]), col: '#fff0d0', I: 6 * ST.flash, d: 8 }];
      if (name === 'foundry') return [{ p: W3('foundry', [-4.0, 1.2, -2.0]), col: '#ff8a3a', I: 9 * fl, d: 10 }, { p: W3('foundry', [0.5, 1.8, 0.2]), col: '#ffa040', I: 9 * ST.pour * fl, d: 8 }, { p: W3('foundry', [3, 4, 3]), col: '#ffd8b0', I: 1.6, d: 10 }];
      if (name === 'clock') return [{ p: W3('clock', [-2.8, 3.0, -2.6]), col: '#fff0c8', I: 4.0, d: 9 }, { p: W3('clock', [2.6, 4.4, 0.2]), col: '#ffc070', I: 3.4 * fl, d: 8 }, { p: W3('clock', [0.5, 2.6, 3.4]), col: '#ffe8c8', I: 1.6, d: 7 }];
      if (name === 'yard' || name === 'yardDusk') return [{ p: W3('yard', [0.9, 1.4, -0.6]), col: '#fff4d0', I: 24 * ST.flash, d: 9 }].concat(name === 'yardDusk' ? [-4.6, 5].map((x) => ({ p: W3('yard', [x, 3.3, -7.2]), col: '#ffb860', I: 5 * fl, d: 9 })) : []);
      if (name === 'towerDusk') return [{ p: W3('tower', [0, TOWER.DY, TOWER.TW + 3]), col: '#ffe0a0', I: 30, d: 16 }, { p: W3('tower', [TOWER.TW + 3, TOWER.DY, 0]), col: '#ffe0a0', I: 30, d: 16 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'tower' && tw) { M.waterT.offset.set(T * 0.004, T * 0.01); tickRings(tw.rings, f, 9); tw.glows.forEach((g) => (g.material.opacity = ST.mood === 'towerDusk' ? 0.42 : 0));
        const tm = ST.time; tw.hands.forEach(({ hh, mh }) => { mh.rotation.z = -(tm % 60) / 60 * TAU; hh.rotation.z = -(tm / 720) * TAU; }); }
      if (cur === 'belfry' && bf) { tickRings(bf.rings, f, 3.4); tickMotes(bf.dust, f, 0.3); bf.shafts.forEach((s) => (s.visible = ST.mood !== 'belfryNight')); bf.lampG.material.opacity = ST.mood === 'belfryNight' ? 0.5 * (0.92 + 0.08 * Math.sin(f * 0.8)) : 0;
        bf.skies.forEach((s) => (s.material = ST.mood === 'belfryNight' ? M.skyN : ST.mood === 'belfryGold' ? M.skyG : M.sky)); }
      if (cur === 'yard' && yd) { tickMotes(yd.dust, f, 0.4); yd.flashG.material.opacity = 0.8 * ST.flash; yd.glows.forEach((g) => (g.material.opacity = ST.mood === 'yardDusk' ? 0.5 : 0)); }
      if (cur === 'foundry' && fd) { const fl = 0.85 + 0.1 * Math.sin(f * 0.9) + 0.05 * Math.sin(f * 2.3); fd.fireG.material.opacity = 0.62 * fl; fd.potG.material.opacity = 0.7 * ST.pour * fl; tickMotes(fd.sparks, f, 1.2); tickMotes(fd.smoke, f, 0.25); fd.sparks.im.visible = ST.pour > 0.05; }
      if (cur === 'clock' && ck) { tickMotes(ck.dust, f, 0.3); ck.wheels.forEach((w) => (w.rotation.z = Math.floor(T) * w.userData.sp * 0.2 + w.userData.sp * 0.2 * (1 - Math.exp(-(T % 1) * 12)))); ck.pend.rotation.z = 0.075 * ST.swing * Math.sin(Math.PI * T); } },
    glows: {},
    mood: (name) => { ST.mood = name; },
    apply: (v) => { if (v.crack != null) API.setCrack(v.crack); if (v.turn != null) API.setTurn(v.turn); if (v.pour != null) API.setPour(v.pour); if (v.time != null) API.setTime(v.time); if (v.plaque != null) API.setPlaque(v.plaque); if (v.bunt != null) API.setBunting(v.bunt); if (v.pen != null) API.setPennies(v.pen); } });
  tw = buildTower(API.groups.tower); bf = buildBelfry(API.groups.belfry); yd = buildYard(API.groups.yard); fd = buildFoundry(API.groups.foundry); ck = buildClock(API.groups.clock);
  API.parts = { tw, bf, yd, fd, ck };
  // bong rings: ring(f0) starts a burst at frame f0 (3 staggered rings), expanding out of the bell / belfry, facing the camera
  function tickRings(rs, f, R0) { rs.forEach((r, i) => { const t = (f - ST.ring - i * 5) / 26; r.visible = ST.ring >= 0 && t > 0 && t < 1; if (!r.visible) return; const s = R0 * (1 + 3.2 * t); r.scale.set(s, s, 1); r.material.opacity = (R0 > 5 ? 0.75 : 0.32) * (1 - t) ** 1.4; if (H.CAM) r.quaternion.copy(H.CAM.quaternion); }); }
  API.setRing = (f0) => { ST.ring = f0; };
  // belfry: hammer lift a (0 rest .. 1 raised, <0 = striking past rest), lighter hammer k (1 full .. 0.68), crack growth 0..1, quarter turn 0..1
  API.setHammer = (a, k = 1) => { bf.hammer.rotation.z = 0.06 + 0.5 * a; bf.hammer.userData.head.scale.set(k, k, k); };
  API.setCrack = (t, sq = false) => { const c = bf.bell.userData.crackM; c.visible = t > 0.001; c.geometry.setDrawRange(0, Math.floor(c.userData.n * clamp01(t) / 6) * 6); bf.bell.userData.sq.visible = sq; };
  API.setTurn = (t) => { bf.bell.rotation.y = -Math.PI / 2 * clamp01(t); };
  API.setShake = (k, f) => { bf.bell.position.x = 0.03 * k * Math.sin(f * 2.7); bf.bell.rotation.z = 0.012 * k * Math.sin(f * 1.9); };
  API.setFlash = (k) => { ST.flash = k; };
  // yard: first bell crack + hammer + shake
  API.setYard = (o) => { const U = yd.bell.userData; U.crackM.visible = o.crack > 0.001; U.crackM.geometry.setDrawRange(0, Math.floor(U.crackM.userData.n * clamp01(o.crack || 0) / 6) * 6); yd.bell.rotation.y = -1.2; yd.hammer.rotation.z = 0.08 + 0.55 * (o.lift || 0); yd.bell.position.x = 0.03 * (o.shake || 0) * Math.sin((o.f || 0) * 2.7); };
  // foundry: crucible tilt + pour 0..1, molten level in the mould
  API.setPour = (t) => { ST.pour = clamp01(t); fd.cruc.rotation.z = -1.05 * sm(0, 0.25, t); const on = t > 0.2 && t < 0.98; fd.stream.visible = on; fd.pool.visible = t > 0.25; if (on) { const y0 = 2.95, y1 = 1.45; fd.stream.position.set(0.55, (y0 + y1) / 2, -0.4); fd.stream.scale.set(1, y0 - y1, 1); } };
  // clock: time in minutes (tower hands), pennies on the tray (0..10 visible + a falling one: d 0..1), pendulum swing amplitude
  API.setTime = (m) => { ST.time = m; };
  API.setPennies = (n, d = -1) => { ST.pen = n; ck.pennies.forEach((p, i) => (p.visible = i < n)); const D = ck.drop; D.visible = d >= 0 && d < 1; if (D.visible) { const e = d * d; D.position.set(-0.06 + (n % 2) * 0.12 + 0.05 * (1 - d), -1.98 + 0.015 * (Math.floor(n / 2) + 0.5) + 0.9 * (1 - e), (n % 2) * 0.02 + 0.25 * (1 - d)); D.rotation.set(2.4 * (1 - d), 0, 1.1 * (1 - d)); } };
  API.setSwing = (a) => { ST.swing = a; };
  API.setPlaque = (k) => { tw.plaque.material = k ? M.plaqueNew : M.plaqueOld; };
  API.setBunting = (on) => { tw.bunts.forEach((b) => (b.visible = !!on)); };
  API.glows = { tower: tw.glows, belfry: [bf.lampG], yard: [yd.flashG, ...yd.glows], foundry: [fd.fireG, fd.potG], clock: [ck.dialG, ck.lampG] };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  const V = API.V, { TW, DY, BY1 } = TOWER;
  API.views = [
    V('towerDay', [6, 1.7, 46], [0, 56, 0], 46, 0.5, [0, 60, 0]), // 0 hook: low up-angle at the tower
    V('towerDay', [40, 6, 70], [-6, 30, -6], 40, 0.5, [0, 30, 0]), // 1 grand view from the bridge end
    V('towerGold', [-3, 1.6, 20], [0, 3.6, TW], 44, 1.0, [0, 3.4, TW], { plaque: 1, bunt: 1 }), // 2 plaque, jubilee
    V('towerDusk', [30, 4.8, 42], [0, 42, -4], 50, 0.6, [0, 40, 0], { time: 1080 }), // 3 dusk from the bridge
    V('belfry', [3.2, 2.0, 6.6], [0, 4.0, 0], 50, 1.4, [0, 4, 0], { crack: 1 }), // 4 belfry wide
    V('belfryNight', [2.2, 2.6, 4.2], [0.8, 3.6, 0], 44, 1.6, [1, 3.6, 0], { crack: 1, turn: 0.5 }), // 5 belfry night
    V('belfry', [1.0, 3.0, 2.9], [0.6, 3.3, 0.9], 40, 2.2, [0.6, 3.3, 1.0], { crack: 1, turn: 1 }), // 6 crack close-up
    V('yard', [1.5, 1.7, 8], [0, 2.0, -2], 46, 1.2, [0, 1.6, -2]), // 7 yard test frame
    V('yardDusk', [-1.5, 1.6, 7], [0, 3.6, -8], 46, 1.2, [0, 2, -3]), // 8 yard dusk
    V('foundry', [2.4, 2.2, 5.4], [0, 1.5, -0.6], 48, 1.4, [0.4, 1.4, -0.4], { pour: 0.6 }), // 9 foundry pour
    V('clock', [2.6, 2.2, 5.0], [0, 2.6, 0], 50, 1.4, [0.5, 2.6, 1.6], { pen: 6 }), // 10 clock room
    V('clock', [1.0, 3.3, 3.0], [0.5, 3.1, 1.6], 38, 2.4, [0.5, 3.15, 1.6], { pen: 7 }), // 11 penny tray close-up
  ];
  API.setCrack(1); API.setTurn(0); API.setHammer(0); API.setPour(0); API.setPennies(6); API.setPlaque(0); API.setBunting(0); API.setTime(600); API.setYard({ crack: 0, lift: 0 }); API.tick(0);
  return API;
}
