// ng_sets.js [NG-sets]: sets for "The first person over Niagara Falls in a barrel" (Annie Edson Taylor, 24 Oct 1901). Oddverra short.
//   falls  : the Horseshoe Falls as a stylised 3D set. Semicircular crest (radius R) with an animated water curtain (two scrolling
//            layers + a crest foam band), the upper river (y = 0) flowing to the lip, the gorge (water at y = -D) with a churning
//            foam ring, rising mist cards (low churn + tall plume) and a rainbow; rock walls with strata, Canadian bank (x > 0) with a
//            stone parapet, lamp posts, hotel, trees; Goat Island trees on the left; a wooden launch dock upstream on the right bank
//            (x = RW, z = -110); a rocky ledge in the gorge below the right bank (rescue / cat shore). One movable barrel (setBarrel).
//            Moods 'fallsDay', 'fallsCrest', 'fallsGorge', 'fallsDock', 'fallsGold' (golden payoff).          origin (-94000,0,0)
//   home   : Annie's 1901 schoolroom-parlour: chalkboard, desks, globe, late husband's portrait with black ribbon, window, a
//            Niagara poster with the barrel plan sketched on it. Moods 'home', 'homePlan' (night lamp, blueprint idea). (-96500,0,0)
//   shop   : cooperage: plank walls, staves, hoops, finished barrels; the hero barrel assembles itself (setBuild), an anvil is
//            lowered in on a rope (setAnvil), a heart-shaped pillow drops in (setPillow). Mood 'shop'.            (-96500,0,800)
//   street : Niagara Falls street, 1901: storefronts (SOUVENIRS / PHOTOGRAPHS / HOTEL), boardwalk, gas lamps, souvenir stand;
//            a handcart with the barrel (setCart) for the manager's getaway. Moods 'street', 'streetDusk'.        (-96500,0,1600)
// Each set: local frame, camera side +z. Test flag ?ngview=N (main.js).
import { H, TAU, clamp01, sm, SERIF, SANS, cyl, sph, plane, planeUV, mesh, nond, lumpGeo, shapeGeo, heartPts, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';

export const NG_ORIGIN = { falls: [-94000, 0, 0], home: [-96500, 0, 0], shop: [-96500, 0, 800], street: [-96500, 0, 1600] };
const GROUP_OF = { fallsDay: 'falls', fallsCrest: 'falls', fallsGorge: 'falls', fallsDock: 'falls', fallsGold: 'falls', home: 'home', homePlan: 'home', shop: 'shop', street: 'street', streetDusk: 'street' };
export const FALLS = { R: 40, D: 34, RW: 62, LH: 1.2, OFF: 9, DOCK: [62, -110] };
const { R: FR, D: FD, RW: FRW, LH: FLH, OFF: FOFF } = FALLS;
let THREE, PT, M;

// ---------------------------------------------------------------- painters
const nz = (x, y, z) => 0.5 * Math.sin(x * 0.31 + y * 0.53 + 1.7) + 0.32 * Math.sin(z * 0.47 - y * 0.9 + 0.4) + 0.22 * Math.sin(y * 2.1 + x * 0.23 + z * 0.17) + 0.14 * Math.sin(x * 1.3 - z * 1.1 + y * 0.7);
function streakTex(o) { return (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
  PT.modulate(g, w, h, (u, v) => { const a = PT.fbm(u, v, 28, 2, 3, o.seed || 3), b = PT.fbm(u, v, 64, 4, 2, (o.seed || 3) + 9), c = PT.fbm(u, v, 6, 3, 2, (o.seed || 3) + 21); return (o.lo || 0.62) + (o.hi || 0.5) * (0.55 * a + 0.3 * b + 0.15 * c) ** 1.4; });
  if (o.alpha) { const d = g.getImageData(0, 0, w, h); for (let i = 0; i < d.data.length; i += 4) { const k = d.data[i] / 255, a = Math.max(0, Math.min(1, (k - o.alpha) / (1 - o.alpha))); d.data[i + 3] = 255 * a ** 1.3; d.data[i] = d.data[i + 1] = d.data[i + 2] = 255; } g.putImageData(d, 0, 0); } }; }
function foamTex(g, w, h) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => { const a = PT.fbm(u, v, 8, 8, 4, 5), b = PT.fbm(u, v, 24, 24, 2, 9); return 0.66 + 0.4 * (0.7 * a + 0.3 * b) ** 1.2; }); }
function rippleTex(o) { return (g, w, h) => { g.fillStyle = o.base; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => { const a = PT.fbm(u, v, 4, 16, 3, o.seed || 7), b = PT.fbm(u, v, 12, 40, 2, (o.seed || 7) + 5); return 0.78 + 0.5 * (0.65 * a + 0.35 * b) ** 2; });
  const R = PT.rng(o.seed || 7); g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineCap = 'round'; for (let i = 0; i < (o.n || 60); i++) { const x = R() * w, y = R() * h, L = 10 + R() * 40; g.lineWidth = 1.5 + R() * 2.5; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L / 2, y - 3, x + L, y); g.stroke(); } }; }
function mistTex(seed) { return (g, w, h) => { g.clearRect(0, 0, w, h); const d = g.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const u = x / w - 0.5, v = y / h - 0.5, r = Math.hypot(u, v) * 2, n = PT.fbm(x / w, y / h, 4, 4, 3, seed), k = clamp01(1 - r * (0.75 + 0.55 * n)); const i = (y * w + x) * 4; d.data[i] = d.data[i + 1] = d.data[i + 2] = 255; d.data[i + 3] = 255 * k ** 1.6; }
  g.putImageData(d, 0, 0); }; }
function rainbowTex(g, w, h) { g.clearRect(0, 0, w, h); const cx = w / 2, cy = h, cols = ['#ff5a5a', '#ffa040', '#fff060', '#60e070', '#50a0ff', '#8060e0'];
  cols.forEach((c, i) => { g.beginPath(); g.arc(cx, cy, h * (0.92 - i * 0.045), Math.PI, 0); g.lineWidth = h * 0.05; g.strokeStyle = c; g.globalAlpha = 0.85; g.stroke(); }); g.globalAlpha = 1;
  const d = g.getImageData(0, 0, w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, fade = clamp01(y / h * 2.2) * clamp01((1 - Math.abs(x / w - 0.5) * 2) * 3); d.data[i + 3] *= fade; } g.putImageData(d, 0, 0); }
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 6, 2, 3, 7)); g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08);
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : 0.34 + i * 0.36), w * 0.86, h * (lines.length === 1 ? 0.52 : 0.3), { col: o.col || '#3a2414', font: o.font || SERIF })); }; }
function staveTex(g, w, h) { const n = 16, sw = w / n, R = PT.rng(1901); for (let i = 0; i < n; i++) { const c = 0.85 + R() * 0.25; g.fillStyle = `rgb(${128 * c | 0},${88 * c | 0},${58 * c | 0})`; g.fillRect(i * sw, 0, sw, h); g.fillStyle = 'rgba(50,25,15,0.85)'; g.fillRect(i * sw, 0, 2.5, h); g.fillStyle = 'rgba(255,220,170,0.3)'; g.fillRect(i * sw + 3, 0, 2, h); }
  PT.modulate(g, w, h, (u, v) => 0.86 + 0.24 * PT.fbm(u, v, 32, 3, 3, 4)); grain(g, w, h, 'rgba(60,30,15,1)', 900, 3, 0.25); }
function wallpaperTex(g, w, h) { g.fillStyle = '#6a7a5a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? 'rgba(240,220,170,0.18)' : 'rgba(40,50,30,0.12)'; g.fillRect(i * w / 8, 0, w / 16, h); }
  g.fillStyle = 'rgba(240,220,170,0.35)'; for (let y = 20; y < h; y += 64) for (let x = 16; x < w; x += 64) { g.beginPath(); g.ellipse(x + (y / 64 % 2) * 32, y, 5, 9, 0, 0, TAU); g.fill(); } PT.modulate(g, w, h, (u, v) => 0.9 + 0.14 * PT.fbm(u, v, 4, 4, 3, 5)); }
function chalkTex(g, w, h) { g.fillStyle = '#26382e'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.85 + 0.3 * PT.fbm(u, v, 6, 3, 3, 8)); g.globalAlpha = 0.12; g.fillStyle = '#fff'; for (let i = 0; i < 6; i++) g.fillRect(w * (0.05 + i * 0.16), h * 0.1, w * 0.12, h * 0.75); g.globalAlpha = 1;
  txt(g, 'Aa  Bb  Cc', w * 0.3, h * 0.24, w * 0.5, h * 0.16, { col: 'rgba(240,240,230,0.92)', font: SERIF, bold: false, italic: true }); txt(g, '7 x 8 = 56', w * 0.3, h * 0.5, w * 0.4, h * 0.14, { col: 'rgba(240,240,230,0.88)', font: SERIF, bold: false });
  txt(g, 'Oct. 1901', w * 0.78, h * 0.18, w * 0.3, h * 0.12, { col: 'rgba(255,240,200,0.9)', font: SERIF, bold: false, italic: true }); txt(g, 'GEOGRAPHY', w * 0.74, h * 0.52, w * 0.36, h * 0.12, { col: 'rgba(240,240,230,0.85)', font: SERIF, bold: false });
  g.strokeStyle = 'rgba(240,240,230,0.8)'; g.lineWidth = 4; g.beginPath(); g.ellipse(w * 0.74, h * 0.76, w * 0.12, h * 0.12, 0, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(w * 0.62, h * 0.76); g.lineTo(w * 0.86, h * 0.76); g.stroke(); }
function posterTex(plan) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f4d89a'); gr.addColorStop(1, '#e0a868'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  txt(g, 'NIAGARA FALLS', w / 2, h * 0.1, w * 0.86, h * 0.09, { col: '#7a2a2a', font: SERIF }); // painted falls: cliff, curtain, mist
  g.fillStyle = '#4a7a4a'; g.fillRect(w * 0.05, h * 0.3, w * 0.9, h * 0.08); g.fillStyle = '#7a6a5a'; g.fillRect(w * 0.05, h * 0.38, w * 0.9, h * 0.38);
  const cg = g.createLinearGradient(0, h * 0.36, 0, h * 0.78); cg.addColorStop(0, '#3aa898'); cg.addColorStop(0.4, '#c8f0ec'); cg.addColorStop(1, '#ffffff'); g.fillStyle = cg; g.beginPath(); g.moveTo(w * 0.18, h * 0.36); g.quadraticCurveTo(w * 0.5, h * 0.46, w * 0.82, h * 0.36); g.lineTo(w * 0.86, h * 0.78); g.lineTo(w * 0.14, h * 0.78); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 3; for (let i = 0; i < 22; i++) { const x = w * (0.2 + i * 0.03); g.beginPath(); g.moveTo(x, h * 0.42); g.lineTo(x + 4, h * 0.76); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(w * (0.12 + i * 0.1), h * 0.8, w * 0.09, h * 0.05, 0, 0, TAU); g.fill(); } g.fillStyle = '#3a6a8a'; g.fillRect(0, h * 0.84, w, h * 0.16);
  if (plan) { g.setLineDash([10, 8]); g.strokeStyle = '#c82a2a'; g.lineWidth = 6; g.beginPath(); g.moveTo(w * 0.42, h * 0.24); g.quadraticCurveTo(w * 0.56, h * 0.3, w * 0.55, h * 0.58); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#8a5a34'; g.strokeStyle = '#2b1d4a'; g.lineWidth = 4; g.beginPath(); g.ellipse(w * 0.4, h * 0.22, w * 0.05, h * 0.045, 0, 0, TAU); g.fill(); g.stroke(); for (const dy of [-0.025, 0.025]) { g.beginPath(); g.moveTo(w * 0.35, h * (0.22 + dy)); g.lineTo(w * 0.45, h * (0.22 + dy)); g.stroke(); }
    txt(g, '?!', w * 0.66, h * 0.6, w * 0.15, h * 0.08, { col: '#c82a2a', font: SANS }); }
  PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, 2)); g.strokeStyle = '#5a3a24'; g.lineWidth = w * 0.03; g.strokeRect(0, 0, w, h); }; }
function portraitTex(g, w, h) { g.fillStyle = '#d8ccb0'; g.fillRect(0, 0, w, h); const gr = g.createRadialGradient(w / 2, h * 0.45, 4, w / 2, h * 0.5, w * 0.6); gr.addColorStop(0, '#b8a888'); gr.addColorStop(1, '#5a4a3a'); g.fillStyle = gr; g.fillRect(w * 0.1, h * 0.08, w * 0.8, h * 0.84);
  g.fillStyle = '#3a3036'; g.beginPath(); g.ellipse(w / 2, h * 0.86, w * 0.32, h * 0.2, 0, Math.PI, 0); g.fill(); g.fillStyle = '#e8c8a8'; g.beginPath(); g.ellipse(w / 2, h * 0.44, w * 0.17, h * 0.17, 0, 0, TAU); g.fill();
  g.fillStyle = '#2a2018'; g.beginPath(); g.ellipse(w / 2, h * 0.31, w * 0.18, h * 0.07, 0, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(w / 2, h * 0.53, w * 0.09, h * 0.035, 0, 0, TAU); g.fill();
  g.fillStyle = '#2b1d4a'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(w / 2 + s * w * 0.06, h * 0.43, 3, 5, 0, 0, TAU); g.fill(); } PT.modulate(g, w, h, (u, v) => 0.86 + 0.18 * PT.fbm(u, v, 4, 4, 3, 6)); }
function postcardTex(g, w, h) { g.fillStyle = '#f2ead6'; g.fillRect(0, 0, w, h); const n = 4; for (let i = 0; i < n; i++) { const x = w * (0.04 + i * 0.24), cg = g.createLinearGradient(0, h * 0.15, 0, h * 0.85); cg.addColorStop(0, '#5a8aa0'); cg.addColorStop(1, '#e8f4f4'); g.fillStyle = cg; g.fillRect(x, h * 0.12, w * 0.2, h * 0.76); g.fillStyle = '#8a5a34'; g.beginPath(); g.ellipse(x + w * 0.1, h * 0.55, w * 0.04, h * 0.14, 0, 0, TAU); g.fill(); g.strokeStyle = '#3a2a20'; g.lineWidth = 3; g.strokeRect(x, h * 0.12, w * 0.2, h * 0.76); } }
function floorTex(o) { return (g, w, h) => { g.fillStyle = o.base; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.85 + 0.25 * PT.fbm(u, v, 6, 6, 4, o.seed || 3)); }; }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  // water: curtain (streak map scrolled down, vertex-colour teal->white), front veil (alpha streaks), crest foam, upper river, gorge, base foam
  m.curtT = T(512, 512, streakTex({ seed: 3, lo: 0.6, hi: 0.55 }), [1, 1]); m.curtain = toon({ map: m.curtT, vertexColors: true, emissive: 0x6a8a90, side: THREE.DoubleSide }); m.curtain.emissiveMap = m.curtT;
  m.veilT = T(512, 512, streakTex({ seed: 11, lo: 0.2, hi: 1.2, alpha: 0.55 }), [1, 1]); m.veil = new THREE.MeshBasicMaterial({ map: m.veilT, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: true, vertexColors: true });
  m.crestT = T(512, 256, streakTex({ seed: 17, lo: 0.7, hi: 0.4 }), [1, 1]); m.crest = toon({ map: m.crestT, vertexColors: true, emissive: 0x3a5a60 }); m.crest.emissiveMap = m.crestT;
  m.riverT = T(512, 512, rippleTex({ base: '#4a9a9a', seed: 7, n: 70 }), [1 / 14, 1 / 14]); m.river = toon({ map: m.riverT, color: 0xbfe8e4, emissive: 0x0a2a30 });
  m.gorgeT = T(512, 512, rippleTex({ base: '#4aa0a4', seed: 9, n: 160 }), [1 / 16, 1 / 16]); m.gorge = toon({ map: m.gorgeT, color: 0xd8f4f2, emissive: 0x18464c }); m.gorge.emissiveMap = m.gorgeT;
  m.foamT = T(256, 256, foamTex, [1, 1]); m.foam = toon({ map: m.foamT, vertexColors: true, emissive: 0x6a7a80, side: THREE.DoubleSide }); m.foam.emissiveMap = m.foamT;
  m.mists = [1, 2, 3, 4].map((s) => T(128, 128, mistTex(s * 7)));
  m.rainbow = new THREE.MeshBasicMaterial({ map: T(512, 256, rainbowTex), transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  m.rock = vc(); if (H.MACRO) H.MACRO(m.rock, 0.18, 0.05); m.grassT = T(512, 512, (g, w, h) => PT.grass(g, w, h, { base: '#6a9a4a' }), [1 / 6, 1 / 6]); m.grass = toon({ map: m.grassT }); if (H.MACRO) H.MACRO(m.grass, 0.2, 0.03);
  m.leaf = vc(); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.stone = vc({ map: T(256, 256, (g, w, h) => PT.stone(g, w, h, { base: '#a89a88' })) });
  m.plank = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a6040', n: 8, seed: 51 })) }); m.siding = vc({ map: T(512, 512, (g, w, h) => PT.siding(g, w, h, { base: '#c8b89a' })) });
  m.brick = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#a85a3a', rows: 16, cols: 6, seed: 7 })) }); m.shingle = vc({ map: T(256, 256, (g, w, h) => PT.shingles(g, w, h, { base: '#5a4a5a' })) });
  m.stave = vc({ map: T(512, 256, staveTex) }); m.iron = vc({ emissive: 0x0a0a10 }); m.cork = vc();
  m.wallpaper = vc({ map: T(256, 256, wallpaperTex) }); m.chalk = em(T(1024, 512, chalkTex), 0x101810); m.poster = em(T(512, 640, posterTex(false)), 0x302010); m.posterPlan = em(T(512, 640, posterTex(true)), 0x302010);
  m.portrait = em(T(200, 260, portraitTex), 0x201810); m.floor = vc({ map: T(512, 512, floorTex({ base: '#8a6a4a', seed: 5 })) }); m.dirt = toon({ map: T(512, 512, (g, w, h) => PT.dirt(g, w, h, { base: '#a88a62' }), [1 / 5, 1 / 5]) });
  m.postcards = em(T(512, 160, postcardTex), 0x201810); m.cloth = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#c84a4a' })) }); m.pillow = vc({ emissive: 0x200810 });
  m.signCoop = em(T(1024, 180, signTex(['COOPERAGE', ''], { bg: '#e8dcc0', col: '#5a2a1a', rim: '#5a2a1a' })), 0x202020);
  m.signSouv = em(T(1024, 180, signTex(['SOUVENIRS'], { bg: '#2a4a3a', col: '#f0e0a0', rim: '#d8b860' })), 0x202020); m.signPhoto = em(T(1024, 180, signTex(['PHOTOGRAPHS'], { bg: '#f0e8d0', col: '#3a2a5a', rim: '#3a2a5a' })), 0x202020);
  m.signHotel = em(T(1024, 180, signTex(['HOTEL'], { bg: '#7a2a2a', col: '#f4e8c8', rim: '#e8c060' })), 0x202020); m.signBarrel = em(T(512, 200, signTex(['SEE THE', 'BARREL!'], { bg: '#f4ecd0', col: '#a82a2a', rim: '#a82a2a', font: SANS })), 0x202020);
  m.signFalls = em(T(1024, 180, signTex(['HOTEL'], { bg: '#f2e8cc', col: '#2a3a5a', rim: '#2a3a5a' })), 0x202020);
  m.winDay = toon({ color: 0x8ab0d8, emissive: 0x1a2a48 }); m.winLit = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc870).multiplyScalar(1.3), fog: true });
  m.sky = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xd8e8ff).multiplyScalar(1.25), fog: false });
  return m; }

// ---------------------------------------------------------------- shared props
const bR = (y) => 0.4 + 0.07 * Math.sin(Math.PI * clamp01(y / 1.5));
// barrel: 16 lathe staves (outer + inner wall), 4 iron hoops, lid on a hinge, cork. Origin bottom centre, height 1.5.
export function makeBarrel() { const G = new THREE.Group(), staves = [], hoops = []; const prof = []; for (let i = 0; i <= 10; i++) { const y = i * 0.15; prof.push(new THREE.Vector2(bR(y), y)); } for (let i = 10; i >= 0; i--) { const y = Math.max(0.08, i * 0.15); prof.push(new THREE.Vector2(bR(y) - 0.045, y)); }
  for (let i = 0; i < 16; i++) { const gm = new THREE.LatheGeometry(prof, 3, i / 16 * TAU + 0.004, TAU / 16 - 0.008), guv = gm.attributes.uv; for (let q2 = 0; q2 < guv.count; q2++) guv.setX(q2, (i + guv.getX(q2)) / 16); const st = mesh(G, gm, M.stave, 0, 0, 0); st.userData.a = (i + 0.5) / 16 * TAU; staves.push(st); }
  const bot = mesh(G, cyl(0.36, 0.36, 0.06, 20), M.stave, 0, 0.08, 0); staves.push(bot); bot.userData.a = -1;
  for (const y of [0.1, 0.38, 1.12, 1.4]) { const h = tintM(mesh(G, new THREE.TorusGeometry(bR(y) + 0.012, 0.024, 6, 40), M.iron, 0, y, 0, Math.PI / 2, 0, 0), 0x3a3640); h.userData.y = y; hoops.push(h); }
  const lidP = new THREE.Group(); lidP.position.set(0, 1.43, -0.38); G.add(lidP); const lid = mesh(lidP, cyl(0.39, 0.39, 0.06, 24), M.stave, 0, 0, 0.38); tintM(mesh(lidP, cyl(0.06, 0.07, 0.07, 10), M.cork, 0.15, 0.06, 0.38), 0xb88a5a);
  for (const s of [-1, 1]) tintM(mesh(lidP, new THREE.BoxGeometry(0.06, 0.02, 0.5), M.iron, s * 0.18, 0.04, 0.3), 0x3a3640);
  G.userData = { staves, hoops, lidP, lid }; G.traverse((o) => { if (o.isMesh) { const c = o.geometry.attributes.color; if (!c && o.material.vertexColors) o.geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(o.geometry.attributes.position.count * 3).fill(1), 3)); } });
  return G; }
function makeAnvil() { const G = new THREE.Group(), K = new Kit(), c = 0x3a3a46; K.box(M.iron, -0.16, 0.16, 0, 0.08, -0.12, 0.12, c, 0.01); K.box(M.iron, -0.08, 0.08, 0.08, 0.2, -0.07, 0.07, c, 0.01); K.box(M.iron, -0.2, 0.18, 0.2, 0.3, -0.1, 0.1, 0x4a4a58, 0.015);
  K.put(M.iron, new THREE.ConeGeometry(0.07, 0.24, 10), 0.3, 0.25, 0, 0, 0, -Math.PI / 2, 1, 0.8, 1, 0x4a4a58); K.build(G); return G; }
function tree(K, x, y, z, s, R, c = 0x4a7a3a) { K.beam(M.bark, [x, y - 0.2, z], [x, y + 2.2 * s, z], 0.16 * s, 0x5a4a3a, true, 6); for (let i = 0; i < 5; i++) { const a = R() * TAU, rr = (0.5 + R() * 0.5) * s; K.put(M.leaf, lumpGeo(i + Math.round(x * 3), 1, 0.3), x + Math.cos(a) * rr * 0.8, y + (2.6 + R() * 1.6) * s, z + Math.sin(a) * rr * 0.8, 0, R() * 6, 0, 1.3 * s, 1.1 * s, 1.3 * s, [c, 0x3f6e36, 0x5a8a3a][i % 3]); } }
function lamp(K, x, y, z) { K.beam(M.iron, [x, y, z], [x, y + 3.0, z], 0.06, 0x24242c, true, 8); K.put(M.iron, cyl(0.12, 0.16, 0.06, 10), x, y + 0.03, z, 0, 0, 0, 1, 1, 1, 0x24242c); K.box(M.iron, x - 0.16, x + 0.16, y + 3.0, y + 3.36, z - 0.16, z + 0.16, 0x2a2a34, 0.02); K.put(M.iron, new THREE.ConeGeometry(0.24, 0.2, 4), x, y + 3.46, z, 0, Math.PI / 4, 0, 1, 1, 1, 0x24242c); }
// rough vertical rock face along a dense path [[x,z]...], from y0 to y1, displaced toward +side normal
function rockWall(root, path, y0, y1, side, o = {}) { const P = []; for (let i = 0; i < path.length - 1; i++) { const [ax, az] = path[i], [bx, bz] = path[i + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / (o.step || 1.4))); for (let k = 0; k < n; k++) P.push([ax + (bx - ax) * k / n, az + (bz - az) * k / n]); } P.push(path[path.length - 1]);
  const NY = o.ny || Math.ceil((y1 - y0) / 1.3), pos = [], col = [], idx = [], C1 = new THREE.Color(o.c1 || 0xb8a68a), C2 = new THREE.Color(o.c2 || 0x8c8478), C3 = new THREE.Color(o.c3 || 0x50525e), tmp = new THREE.Color();
  P.forEach(([x, z], i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], tx = b[0] - a[0], tz = b[1] - a[1], L = Math.hypot(tx, tz) || 1, nx = -tz / L * side, nzv = tx / L * side;
    for (let j = 0; j <= NY; j++) { const y = y0 + (y1 - y0) * j / NY, edge = j === 0 || j === NY ? 0 : 1, strata = Math.sign(Math.sin(y * 0.55 + 0.3)) * 0.35 + Math.sin(y * 1.7) * 0.15, d = edge * ((o.rough || 1.2) * nz(x, y, z) + strata);
      pos.push(x + nx * d, y, z + nzv * d); const band = 0.5 + 0.5 * Math.sin(y * 0.55 + 0.3), wet = clamp01((y0 + 6 - y) / 6); tmp.copy(C1).lerp(C2, band * 0.8).lerp(C3, wet * 0.85); const v = 0.92 + 0.12 * nz(z * 2, y * 3, x * 2); col.push(tmp.r * v, tmp.g * v, tmp.b * v); } });
  for (let i = 0; i < P.length - 1; i++) for (let j = 0; j < NY; j++) { const a = i * (NY + 1) + j, b = a + NY + 1; if (side > 0) idx.push(a, b, a + 1, b, b + 1, a + 1); else idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); return mesh(root, g, M.rock, 0, 0, 0, 0, 0, 0, false); }
// flat shape in the xz plane at height y (pts [[x,z]...], holes [[[x,z]...]])
function flat(root, pts, holes, y, mat, uvK) { const s = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z))); for (const h of holes || []) s.holes.push(new THREE.Path(h.map(([x, z]) => new THREE.Vector2(x, -z))));
  const g = new THREE.ShapeGeometry(s, 48); g.rotateX(-Math.PI / 2); const m = mesh(root, g, mat, 0, y, 0, 0, 0, 0, false); m.receiveShadow = true; return m; }
const arcP = (r, a) => [r * Math.sin(a), -r * Math.cos(a)];
// strip along the crest arc: radius r(s), height y(s), s 0..1 across, a from -PI/2 to PI/2 along; vertex colours by s
function arcStrip(root, mat, NA, NS, fn, colFn, uK) { const pos = [], col = [], uv = [], idx = [];
  for (let i = 0; i <= NA; i++) { const a = -Math.PI / 2 + Math.PI * i / NA; for (let j = 0; j <= NS; j++) { const s = j / NS, [r, y] = fn(s, a), c = colFn(s, a); pos.push(r * Math.sin(a), y, -r * Math.cos(a)); col.push(...c); uv.push(a * FR / uK[0], s * uK[1]); } }
  for (let i = 0; i < NA; i++) for (let j = 0; j < NS; j++) { const A = i * (NS + 1) + j, B = A + NS + 1; idx.push(A, A + 1, B, B, A + 1, B + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return mesh(root, g, mat, 0, 0, 0, 0, 0, 0, false); }
const tintM = (m, hex) => { const c = new THREE.Color(hex), a = m.geometry.attributes.position.count, arr = new Float32Array(a * 3); for (let i = 0; i < a; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; } m.geometry.setAttribute('color', new THREE.Float32BufferAttribute(arr, 3)); return m; };
const hexC = (h) => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
const mixA = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

// ================================================================= FALLS
function buildFalls(root) { const R = PT.rng(1901), K = new Kit(), Rr = FR, D = FD, RW = FRW, LH = FLH;
  // land (grass) with the river + gorge cut out; upper river; gorge water
  const hole = [[-Rr, 420], [-Rr, 0], [-RW, 0], [-RW, -600], [RW, -600], [RW, 0], [Rr, 0], [Rr, 420]];
  flat(root, [[-700, 440], [700, 440], [700, -620], [-700, -620]], [hole], LH, M.grass);
  const arcPts = []; for (let i = 0; i <= 64; i++) arcPts.push(arcP(Rr, Math.PI / 2 - Math.PI * i / 64));
  const river = flat(root, [[-Rr, 0], [-RW, 0], [-RW, -600], [RW, -600], [RW, 0], ...arcPts.slice(0, -1)], null, 0, M.river);
  const gorge = mesh(root, planeUV(2 * Rr + 6, 480, 2 * Rr + 6, 480), M.gorge, 0, -D, 200, -Math.PI / 2, 0, 0, false); gorge.receiveShadow = true;
  // rock walls: gorge sides + rim face under the crest + river banks
  const W1 = [[-Rr, 420], [-Rr, 0]], W2 = [[Rr, 0], [Rr, 420]];
  rockWall(root, W1, -D - 1, LH, 1, { rough: 1.4 }); rockWall(root, W2, -D - 1, LH, 1, { rough: 1.4 }); rockWall(root, arcPts.slice().reverse(), -D - 1, -0.4, 1, { rough: 0.8, step: 1.6 });
  rockWall(root, [[-RW, -600], [-RW, 0], [-Rr, 0]], -1.2, LH, -1, { rough: 0.25, ny: 2, c3: 0x6a6a5a }); rockWall(root, [[Rr, 0], [RW, 0], [RW, -600]], -1.2, LH, -1, { rough: 0.25, ny: 2, c3: 0x6a6a5a });
  // talus boulders at the gorge foot + the rescue ledge (right wall, z 8..44)
  for (let i = 0; i < 70; i++) { const s = i % 2 ? 1 : -1, z = 4 + R() * 380, x = s * (Rr - 1.5 - R() * 3), sc = 1 + R() * 2.4; K.put(M.rock, lumpGeo(i, 1, 0.35), x, -D - 0.4 + sc * 0.3, z, 0, R() * 6, 0, sc, sc * 0.7, sc, [0x7a7470, 0x8a8278, 0x6a6670][i % 3]); }
  for (let i = 0; i < 24; i++) { const z = 8 + i * 1.6, w = 3.2 + R() * 1.6; K.put(M.rock, lumpGeo(100 + i, 1, 0.25), Rr - w / 2, -D + 0.1, z, 0, R() * 0.4, 0, w / 2 + 0.6, 1.2, 1.2, [0x8a8070, 0x7a7468][i % 2]); }
  K.box(M.stone, Rr - 6.4, Rr - 0.2, -D, -D + 1.0, 7.5, 45, 0x9a9080, 0.2, undefined, 2);
  for (let i = 0; i < 26; i++) { const a = -1.4 + R() * 2.8, r = Rr - FOFF - 2 + R() * 6, [x, z] = arcP(r, a), sc = 0.8 + R() * 2; K.put(M.rock, lumpGeo(200 + i, 1, 0.35), x, -D + 0.2, z, 0, R() * 6, 0, sc, sc * 0.5, sc, 0x6a6670); }
  // rocks in the upper rapids
  for (let i = 0; i < 40; i++) { const a = -1.3 + R() * 2.6, r = Rr + 6 + R() * 80, [x, z] = arcP(r, a); if (Math.abs(x) > RW - 4) continue; const sc = 0.4 + R() * 1.2; K.put(M.rock, lumpGeo(300 + i, 1, 0.3), x, -0.1, z, 0, R() * 6, 0, sc, sc * 0.5, sc, 0x6a6a64); }
  // Canadian bank: stone parapet along the gorge edge, lamp posts, benches, a hotel, trees; Goat Island trees on the left
  for (let z = -1; z < 160; z += 2.5) { K.box(M.stone, Rr + 0.4, Rr + 1.0, LH, LH + 0.7, z, z + 2.45, 0xe8e0d0, 0.06); }
  for (let z = -2; z > -300; z -= 2.5) K.box(M.stone, RW + 0.3, RW + 0.9, LH, LH + 0.7, z - 2.45, z, 0xe8e0d0, 0.06);
  for (let x = Rr + 1; x < RW; x += 2.5) K.box(M.stone, x, x + 2.45, LH, LH + 0.7, 0.3, 0.9, 0xe8e0d0, 0.06);
  for (let z = 4; z < 150; z += 12) lamp(K, Rr + 2.2, LH, z); for (let z = -10; z > -200; z -= 14) lamp(K, RW + 2.0, LH, z);
  K.box(M.dirt, Rr + 1.0, Rr + 5.0, LH, LH + 0.02, -1, 170, 0xb8b0a0, 0.01);
  K.at(Rr + 26, LH, 22, -Math.PI / 2, () => { K.box(M.siding, -12, 12, 0, 9, -5, 5, 0xe8dcc8, 0.05); K.box(M.shingle, -12.6, 12.6, 9, 9.4, -5.6, 5.6, 0x5a4a5a, 0.05); K.put(M.shingle, new THREE.CylinderGeometry(0.01, 7.6, 3.4, 4, 1), 0, 11.1, 0, 0, Math.PI / 4, 0, 2.3, 1, 1.05, 0x5a4a5a);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) K.box(M.winDay, -10.4 + c * 2.8, -9.2 + c * 2.8, 1.4 + r * 2.6, 3.0 + r * 2.6, 5.0, 5.12, 0xffffff, 0.02);
    K.box(M.plank, -12, 12, 0, 0.3, 5, 8, 0x8a6a4a, 0.02); for (let c = 0; c < 9; c++) K.beam(M.plank, [-12 + c * 3, 0.3, 7.8], [-12 + c * 3, 3.6, 7.8], 0.12, 0xe8e0d0); K.box(M.shingle, -12.4, 12.4, 3.6, 3.8, 4.8, 8.4, 0x6a4a4a, 0.03); });
  mesh(root, plane(7, 1.2), M.signFalls, Rr + 20.9, LH + 7.4, 22, 0, -Math.PI / 2, 0, false);
  for (let i = 0; i < 60; i++) { const x = Rr + 8 + R() * 70, z = -280 + R() * 420; if (Math.abs(z - 22) < 9 && x < Rr + 40) continue; if (x < RW + 4 && z < 0) continue; tree(K, x, LH, z, 1.2 + R() * 0.9, R); }
  for (let i = 0; i < 90; i++) { const x = -Rr - 4 - R() * 90, z = -300 + R() * 480; if (x > -RW - 3 && z < 0) continue; tree(K, x, LH, z, 1.3 + R() * 1.0, R, 0x3f6e36); }
  for (let i = 0; i < 40; i++) { const x = (R() - 0.5) * 900, z = -560 - R() * 40; tree(K, x, LH, z, 2.4 + R() * 1.4, R); }
  // the launch dock upstream on the right bank, a rowboat tied to it
  const [DX, DZ] = FALLS.DOCK; K.box(M.plank, DX - 10, DX + 2, 0.62, 0.78, DZ - 1.2, DZ + 1.2, 0x9a7050, 0.02); for (let i = 0; i < 6; i++) for (const s of [-1, 1]) K.beam(M.plank, [DX - 9.6 + i * 2.2, -1.5, DZ + s * 1.1], [DX - 9.6 + i * 2.2, 1.1, DZ + s * 1.1], 0.14, 0x6a4a30, true, 6);
  K.at(DX - 6, 0, DZ + 2.6, 0.06, () => { K.put(M.plank, new THREE.SphereGeometry(1, 20, 10, 0, TAU, Math.PI / 2, Math.PI / 2), 0, 0.42, 0, 0, 0, 0, 0.9, 0.5, 2.4, 0x3a6a5a); K.put(M.plank, new THREE.TorusGeometry(1, 0.05, 6, 30), 0, 0.42, 0, Math.PI / 2, 0, 0, 0.9, 2.4, 1, 0xe8dcc0); K.box(M.plank, -0.85, 0.85, 0.2, 0.28, -0.2, 0.2, 0x8a6a4a, 0.02); K.box(M.plank, -0.85, 0.85, 0.2, 0.28, 1.1, 1.4, 0x8a6a4a, 0.02); });
  for (let i = 0; i < 8; i++) K.put(M.plank, cyl(0.25, 0.25, 0.9, 10), RW + 3 + (i % 3) * 0.6, LH + 0.45, DZ - 4 - Math.floor(i / 3) * 0.6, 0, 0, 0, 1, 1, 1, 0x8a6040);
  K.build(root, 60);
  // ---- water curtain: crest at r = R, falls inward to the base at r = R - OFF; two layers + crest foam band + base foam ring
  const top = hexC('#2e9a8a'), mid = hexC('#a8e4dc'), low = hexC('#ffffff');
  const curtain = arcStrip(root, M.curtain, 140, 44, (s, a) => [Rr - (FOFF * Math.sqrt(s) + 0.4 * Math.sin(a * 9 + 1) * s) - 0.15, 0.15 - (D + 0.3) * s - 0.6 * (1 - (1 - s) ** 6) * 0], (s) => (s < 0.3 ? mixA(top, mid, s / 0.3) : mixA(mid, low, Math.min(1, (s - 0.3) / 0.4))), [20, 3.4]);
  curtain.castShadow = false;
  const veil = nond(arcStrip(root, M.veil, 120, 30, (s, a) => [Rr - (FOFF * Math.sqrt(s) + 0.4 * Math.sin(a * 9 + 1) * s) - 0.7 - 0.6 * s, 0.25 - (D - 1) * s], (s) => [1, 1, 1].map((v) => v * clamp01(s * 6) * clamp01((1 - s) * 4)), [14, 2.4]));
  veil.renderOrder = 4; veil.castShadow = false;
  const crest = arcStrip(root, M.crest, 120, 6, (s, a) => [Rr + 9 * (1 - s), 0.03 + 0.12 * s], (s) => mixA(hexC('#5aaaa4'), hexC('#ffffff'), s ** 1.6), [15, 1]); crest.castShadow = false;
  const base = arcStrip(root, M.foam, 120, 10, (s, a) => [Rr - FOFF - 20 + 25 * s, -D + 0.06 + 0.45 * Math.sin(Math.PI * s ** 1.5)], (s) => (s < 0.55 ? mixA(hexC('#5aa8ac'), hexC('#ffffff'), (s / 0.55) ** 1.5) : mixA(hexC('#ffffff'), hexC('#dff4f4'), (s - 0.55) / 0.45)), [10, 1]); base.castShadow = false;
  // ---- mist: low churn at the base (rises ~22 m) and a tall plume (rises above the crest); billboard cards
  const mist = []; const mk = (n, fam) => { for (let i = 0; i < n; i++) { const mat = new THREE.MeshBasicMaterial({ map: M.mists[i % 4], transparent: true, opacity: 0, depthWrite: false, fog: true, color: 0xffffff }); const c = nond(mesh(root, plane(1, 1), mat, 0, 0, 0, 0, 0, 0, false)); c.renderOrder = 8;
    c.userData = { fam, a: -1.45 + 2.9 * ((i * 0.618) % 1), ph: (i * 0.37) % 1, k: 0.75 + 0.5 * ((i * 0.53) % 1) }; mist.push(c); } }; mk(54, 0); mk(26, 1);
  const rainbow = nond(mesh(root, plane(80, 40), M.rainbow, 0, -26, 6, 0, 0, 0, false)); rainbow.renderOrder = 9;
  // ---- the barrel (story-driven)
  const barrel = makeBarrel(); barrel.scale.setScalar(1); root.add(barrel); barrel.visible = false;
  return { curtain, veil, crest, base, mist, rainbow, barrel, river, gorge };
}
function tickMist(fs, f) { const T = f / 30, cam = H.CAM;
  for (const c of fs.mist) { const u = c.userData, per = u.fam ? 9 : 5.5, t = (T / per + u.ph) % 1, [bx, bz] = arcP(FR - FOFF - 1 + (u.fam ? -6 : 0), u.a);
    const out = [-Math.sin(u.a), Math.cos(u.a)], rise = u.fam ? 58 * t : 24 * t ** 0.8, drift = u.fam ? 18 * t : 9 * t;
    c.position.set(bx + out[0] * drift + Math.sin(T * 0.3 + u.ph * 9) * 1.5, -FD + 1 + rise, bz + out[1] * drift + 6 * t); const s = (u.fam ? 18 + 26 * t : 6 + 12 * t) * u.k; c.scale.set(s, s, 1);
    c.material.opacity = (u.fam ? 0.1 : 0.32) * Math.sin(Math.PI * t) ** 1.2 * (u.fam ? 1 : clamp01(1.2 - t * 0.6)); if (cam) c.quaternion.copy(cam.quaternion); } }

// ================================================================= HOME (1901 schoolroom-parlour)
function buildHome(root) { const R = PT.rng(1838), K = new Kit(), X = 4.5, ZB = -3.2, HT = 3.4;
  K.box(M.floor, -X, X, -0.05, 0, ZB, 4, 0xffffff, 0.01);
  K.box(M.wallpaper, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); K.box(M.wallpaper, -X - 0.2, -X, 0, HT, ZB, 4, 0xffffff, 0.01); K.box(M.wallpaper, X, X + 0.2, 0, HT, ZB, 4, 0xffffff, 0.01);
  for (const [a, b, c, d] of [[-X, X, ZB, ZB + 0.06], [-X, -X + 0.06, ZB, 4], [X - 0.06, X, ZB, 4]]) { K.box(M.plank, a, b, 0, 0.95, c, d, 0x6a4028, 0.01); K.box(M.plank, a - 0.01, b + 0.01, 0.95, 1.02, c - 0.01, d + 0.01, 0x5a3420, 0.01); }
  K.box(M.plank, -X, X, HT - 0.12, HT, ZB, 4, 0x5a3420, 0.01);
  // chalkboard + ledge; teacher's desk; three pupil desks; globe; bookshelf; clock; stove pipe
  mesh(root, plane(3.2, 1.5), M.chalk, -0.6, 1.95, ZB + 0.03, 0, 0, 0, false); K.box(M.plank, -2.3, 1.1, 1.13, 1.2, ZB, ZB + 0.12, 0x6a4028, 0.01); K.box(M.plank, -2.3, 1.1, 2.7, 2.78, ZB, ZB + 0.06, 0x6a4028, 0.01);
  K.at(1.6, 0, -1.2, -0.25, () => { K.box(M.plank, -0.8, 0.8, 0.72, 0.8, -0.45, 0.45, 0x7a4a2a, 0.02); for (const [a, b] of [[-0.72, -0.37], [0.72, -0.37], [-0.72, 0.37], [0.72, 0.37]]) K.box(M.plank, a - 0.05, a + 0.05, 0, 0.72, b - 0.05, b + 0.05, 0x5a3420, 0.01);
    K.box(M.plank, -0.7, -0.1, 0.4, 0.72, -0.4, 0.4, 0x6a3a22, 0.01); for (let i = 0; i < 3; i++) K.box(M.paint, -0.3 + i * 0.12, -0.2 + i * 0.12, 0.8, 0.84 + i * 0.01, -0.2, 0.05, [0xa83a2a, 0x2a5a8a, 0x3a7a3a][i], 0.01);
    K.put(M.brass, cyl(0.07, 0.08, 0.14, 12), 0.5, 0.87, -0.1, 0, 0, 0, 1, 1, 1, 0xc8a050); K.put(M.paint, sph(0.06, 10, 8), 0.34, 0.86, 0.15, 0, 0, 0, 1, 1, 1, 0xd83a2a); });
  for (const [x, z] of [[-2.4, 0.6], [-0.6, 0.9], [-2.8, 2.2]]) K.at(x, 0, z, 0.1, () => { K.box(M.plank, -0.4, 0.4, 0.62, 0.68, -0.3, 0.2, 0x8a5a38, 0.02); K.box(M.iron, -0.36, -0.3, 0, 0.62, -0.05, 0.05, 0x2a2a30, 0.01); K.box(M.iron, 0.3, 0.36, 0, 0.62, -0.05, 0.05, 0x2a2a30, 0.01); K.box(M.plank, -0.36, 0.36, 0.4, 0.45, 0.3, 0.6, 0x8a5a38, 0.02); K.box(M.paint, -0.1, 0.12, 0.68, 0.7, -0.2, 0.0, 0x3a3a40, 0.005); });
  K.at(-3.6, 0, -2.4, 0.4, () => { K.put(M.plank, cyl(0.03, 0.05, 1.0, 8), 0, 0.5, 0, 0, 0, 0, 1, 1, 1, 0x5a3420); K.put(M.paint, sph(0.28, 20, 14), 0, 1.25, 0, 0, 0, 0.4, 1, 1, 1, 0x4a8ac8); K.put(M.brass, new THREE.TorusGeometry(0.31, 0.015, 6, 30, Math.PI), 0, 1.25, 0, 0, Math.PI / 2, 0.4, 1, 1, 1, 0xc8a050); });
  K.at(3.6, 0, -2.6, -0.3, () => { K.box(M.plank, -0.6, 0.6, 0, 2.0, -0.2, 0.2, 0x6a3a22, 0.02); for (let s = 0; s < 4; s++) { K.box(M.plank, -0.56, 0.56, 0.45 * s + 0.05, 0.45 * s + 0.08, -0.18, 0.18, 0x5a3420, 0.01); for (let b = 0; b < 8; b++) K.box(M.paint, -0.5 + b * 0.13, -0.42 + b * 0.13, 0.45 * s + 0.08, 0.45 * s + 0.36 + (b % 3) * 0.03, -0.12, 0.12, [0x8a2a2a, 0x2a4a6a, 0x5a6a3a, 0x8a6a2a][(b + s) % 4], 0.01); } });
  K.at(-X + 0.05, 2.5, 1.0, 0, () => { K.put(M.plank, cyl(0.2, 0.2, 0.06, 20), 0.03, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x5a3420); K.put(M.paint, cyl(0.16, 0.16, 0.02, 20), 0.07, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0xf2ead6); });
  // window on the right wall (daylight), curtains
  K.box(M.plank, X - 0.08, X, 1.0, 2.7, -1.6, 1.6, 0x5a3420, 0.02); const win = mesh(root, plane(2.8, 1.5), M.sky, X - 0.09, 1.85, 0, 0, -Math.PI / 2, 0, false); win.material = M.sky.clone(); win.material.color.set(0xd8ecff).multiplyScalar(1.3);
  for (const s of [-1, 1]) K.box(M.cloth, X - 0.2, X - 0.1, 0.9, 2.9, s * 1.5 - 0.3, s * 1.5 + 0.3, 0x8a3a4a, 0.04); K.beam(M.plank, [X - 0.06, 1.85, -1.4], [X - 0.06, 1.85, 1.4], 0.04, 0x5a3420); K.beam(M.plank, [X - 0.06, 1.0, 0], [X - 0.06, 2.7, 0], 0.04, 0x5a3420);
  // late husband's portrait with black ribbon; the Niagara poster (plain / with the plan); lamp on the desk
  K.box(M.plank, 1.5, 2.2, 1.6, 2.5, ZB, ZB + 0.05, 0x3a2414, 0.02); mesh(root, plane(0.58, 0.78), M.portrait, 1.85, 2.05, ZB + 0.06, 0, 0, 0, false); K.box(M.paint, 1.48, 2.22, 2.42, 2.5, ZB + 0.05, ZB + 0.08, 0x141018, 0.01);
  K.put(M.paint, new THREE.TorusGeometry(0.08, 0.025, 6, 12), 1.85, 2.5, ZB + 0.1, 0, 0, 0, 1.3, 1, 1, 0x141018);
  const poster = mesh(root, plane(1.1, 1.38), M.poster, 3.1, 1.9, ZB + 0.04, 0, 0, 0, false); K.box(M.plank, 2.52, 3.68, 1.18, 2.62, ZB, ZB + 0.03, 0x5a3420, 0.01);
  K.at(1.1, 0.8, -1.25, 0, () => { K.put(M.brass, cyl(0.08, 0.1, 0.05, 12), 0, 0.03, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); K.put(M.brass, cyl(0.015, 0.015, 0.3, 6), 0, 0.2, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); K.put(M.jar, cyl(0.07, 0.1, 0.22, 14), 0, 0.42, 0, 0, 0, 0, 1, 1, 1, 0xfff0d0); });
  K.build(root);
  const lampG = glowAt(root, [1.1 - 0.25 * Math.sin(0.25), 1.22, -1.25], 1.2, '#ffd890', 0.5);
  const shaft = shaftAt(root, [2.8, 1.5, 0.2], 2.6, 4.2, -Math.PI / 2 + 0.5, 0.6, 0.16, 0xfff0d0);
  const dust = motes(root, 50, [-3, 3.5, 0.3, 3, -2.5, 2.5], 41, 0.01);
  return { poster, lampG, shaft, dust, win };
}

// ================================================================= SHOP (cooperage)
function buildShop(root) { const R = PT.rng(1900), K = new Kit(), X = 5, ZB = -3.6, HT = 4;
  K.box(M.floor, -X, X, -0.05, 0, ZB, 5, 0xc8b8a0, 0.01); K.box(M.plank, -X, X, 0, HT, ZB - 0.2, ZB, 0xb88a60, 0.01); K.box(M.plank, -X - 0.2, -X, 0, HT, ZB, 5, 0xb88a60, 0.01); K.box(M.plank, X, X + 0.2, 0, HT, ZB, 5, 0xb88a60, 0.01);
  for (let i = 0; i < 5; i++) K.beam(M.plank, [-X, HT - 0.2, ZB + i * 2], [X, HT - 0.2, ZB + i * 2], 0.22, 0x6a4028);
  mesh(root, plane(3.6, 0.64), M.signCoop, 0, 3.2, ZB + 0.03, 0, 0, 0, false);
  // workbench, tools, stacked staves, hoops on pegs, finished barrels, shavings
  K.at(-2.8, 0, -2.6, 0.15, () => { K.box(M.plank, -1.2, 1.2, 0.85, 0.95, -0.45, 0.45, 0x8a5a38, 0.02); for (const [a, b] of [[-1.1, -0.38], [1.1, -0.38], [-1.1, 0.38], [1.1, 0.38]]) K.box(M.plank, a - 0.06, a + 0.06, 0, 0.85, b - 0.06, b + 0.06, 0x6a4028, 0.01);
    K.put(M.iron, cyl(0.04, 0.04, 0.4, 8), -0.5, 1.0, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x3a3a44); K.box(M.plank, 0.2, 0.7, 0.95, 1.02, -0.1, 0.1, 0x7a4a2a, 0.01); });
  for (let i = 0; i < 14; i++) K.cb(M.stave, 0.1, 1.5, 0.03, 3.4 + (i % 7) * 0.12, 0.75, ZB + 0.25 + Math.floor(i / 7) * 0.12, 0xffffff, 0.12, 0, 0.05 * (i % 3), 0.01);
  for (let i = 0; i < 4; i++) K.put(M.iron, new THREE.TorusGeometry(0.42 + i * 0.03, 0.022, 6, 32), -0.8 + i * 0.5, 2.6, ZB + 0.08, 0, 0, 0, 1, 1, 1, 0x3a3a44);
  for (const [x, z, ry] of [[3.4, -1.0, 0.3], [4.0, 0.2, 0.9], [-4.0, 0.6, 0.2], [-3.4, 1.8, 1.2]]) { const b = makeBarrel(); b.position.set(x, 0, z); b.rotation.y = ry; b.scale.setScalar(0.85); root.add(b); }
  for (let i = 0; i < 40; i++) K.put(M.plank, new THREE.TorusGeometry(0.06, 0.012, 4, 8, Math.PI * 1.4), (R() - 0.5) * 7, 0.01, -2 + R() * 4, Math.PI / 2, R() * 6, 0, 1, 1, 1, 0xe8c890);
  K.build(root);
  // the hero barrel (assembles), the anvil on a rope, the pillow
  const hero = makeBarrel(); hero.position.set(0, 0, -0.6); root.add(hero);
  const anvil = makeAnvil(); root.add(anvil); const rope = tintM(mesh(root, new THREE.CylinderGeometry(0.012, 0.012, 1, 6), M.cork, 0, 0, 0), 0x8a7050);
  const pillow = new THREE.Group(); root.add(pillow); { const hg = shapeGeo(heartPts(0.16), 0.1, 0.03); const pm = tintM(mesh(pillow, hg, M.pillow, 0, 0, 0, Math.PI / 2, 0, 0), 0xd8304a); pm.geometry.center(); }
  const lampG = glowAt(root, [0, 3.1, -0.6], 1.4, '#ffd890', 0.45); const shaft = shaftAt(root, [3.4, 1.8, 1.2], 2.4, 4.6, -Math.PI / 2 + 0.6, 0.5, 0.18, 0xfff0d0);
  const dust = motes(root, 70, [-4, 4, 0.3, 3.4, -3, 3], 51, 0.012);
  return { hero, anvil, rope, pillow, lampG, shaft, dust };
}

// ================================================================= STREET (Niagara Falls, 1901)
function buildStreet(root) { const R = PT.rng(1902), K = new Kit();
  mesh(root, planeUV(80, 40, 16, 8), M.dirt, 0, 0, 0, -Math.PI / 2, 0, 0, false);
  K.box(M.plank, -30, 30, 0, 0.18, -5.4, -2.6, 0xa07a54, 0.02);
  const fronts = [[-13, 7, M.siding, 0xd8c8a8, M.signHotel, 3], [-5.2, 6.6, M.brick, 0xffffff, M.signSouv, 2], [2.2, 6.2, M.siding, 0xb8c8d0, M.signPhoto, 2], [9.4, 6.6, M.brick, 0xe8d0c0, M.signSouv, 2], [16.6, 7, M.siding, 0xd8b8a8, M.signHotel, 3]];
  const signs = []; for (const [x, w, mat, c, sg, fl] of fronts) { const h = 3.4 * fl + 0.8; K.box(mat, x - w / 2, x + w / 2, 0, h, -9, -5.4, c, 0.04); K.box(M.plank, x - w / 2 - 0.1, x + w / 2 + 0.1, h, h + 0.35, -9.1, -5.2, 0x5a3a2a, 0.04);
    for (let f2 = 0; f2 < fl; f2++) for (let k = 0; k < 3; k++) { if (f2 === 0 && k === 1) continue; K.box(M.winDay, x - w / 2 + 0.7 + k * (w - 1.4) / 2 - 0.5, x - w / 2 + 0.7 + k * (w - 1.4) / 2 + 0.5, 0.9 + f2 * 3.4, 2.5 + f2 * 3.4, -5.42, -5.3, 0xffffff, 0.02); }
    K.box(M.plank, x - 0.6, x + 0.6, 0.18, 2.6, -5.42, -5.3, 0x4a2a1e, 0.02); K.box(M.cloth, x - w / 2, x + w / 2, 2.9, 3.05, -5.4, -4.0, 0xd84a4a, 0.03);
    signs.push(mesh(root, plane(w * 0.8, w * 0.14), sg, x, 3.35, -5.36, 0, 0, 0, false)); }
  const lamps = []; for (let x = -24; x <= 24; x += 8) { lamp(K, x, 0.18, -3.0); lamps.push([x, 3.36, -3.0]); }
  for (let x = -27; x <= 27; x += 13) { K.beam(M.bark, [x, 0, -2.7], [x, 7.5, -2.7], 0.1, 0x5a4a3a, true, 6); K.box(M.plank, x - 0.8, x + 0.8, 7.0, 7.1, -2.75, -2.65, 0x5a4a3a, 0.01); }
  // souvenir stand (left): table, postcards, a little sign
  K.at(-6.0, 0.18, -3.6, 0, () => { K.box(M.plank, -1.1, 1.1, 0.8, 0.88, -0.5, 0.5, 0x8a5a38, 0.02); for (const [a, b] of [[-1, -0.4], [1, -0.4], [-1, 0.4], [1, 0.4]]) K.box(M.plank, a - 0.05, a + 0.05, 0, 0.8, b - 0.05, b + 0.05, 0x6a4028, 0.01); K.box(M.cloth, -1.12, 1.12, 0.5, 0.88, 0.48, 0.52, 0xc84a4a, 0.01);
    for (const s of [-1, 1]) K.beam(M.plank, [s * 1.05, 0.88, -0.45], [s * 1.05, 2.4, -0.45], 0.05, 0x6a4028); });
  const cards = mesh(root, plane(1.8, 0.56), M.postcards, -6.0, 1.06 + 0.18, -3.75, -Math.PI / 2 + 0.5, 0, 0, false);
  const barrelSign = mesh(root, plane(1.6, 0.62), M.signBarrel, -6.0, 2.35, -4.0, 0, 0, 0, false);
  // background: hills + trees, a distant mist plume card
  for (let i = 0; i < 20; i++) { const x = -40 + i * 4.2 + R(), z = -16 - R() * 6; tree(K, x, 0, z, 1.6 + R(), R); }
  K.build(root, 30);
  // the handcart (story-driven): two wheels, box bed, handles; the barrel rides on it
  const cart = new THREE.Group(); root.add(cart); { const KC = new Kit(); KC.box(M.plank, -0.7, 0.7, 0.55, 0.65, -0.5, 0.5, 0x8a5a38, 0.02); for (const s of [-1, 1]) { KC.put(M.iron, new THREE.TorusGeometry(0.42, 0.04, 6, 24), 0, 0.42, s * 0.56, 0, 0, 0, 1, 1, 1, 0x3a2a20); for (let k = 0; k < 6; k++) KC.beam(M.plank, [0, 0.42, s * 0.56], [0.4 * Math.cos(k), 0.42 + 0.4 * Math.sin(k), s * 0.56], 0.025, 0x6a4028); }
    for (const s of [-1, 1]) KC.beam(M.plank, [0.7, 0.62, s * 0.4], [1.7, 0.95, s * 0.45], 0.05, 0x6a4028); KC.build(cart); }
  const cb = makeBarrel(); cb.position.set(-0.05, 0.65, 0); cb.scale.setScalar(0.8); cart.add(cb); cb.userData.lidP.rotation.x = 0;
  const glows = lamps.map((p) => glowAt(root, p, 1.6, '#ffc870', 0));
  const flashG = glowAt(root, [-4.6, 2.0, 0.4], 6, '#ffffff', 0);
  const dust = motes(root, 50, [-8, 8, 0.3, 3, -3, 3], 61, 0.012);
  return { cart, cb, glows, flashG, dust, signs };
}

// ================================================================= lights, grades, API
const SET_LIGHT = {
  fallsDay: { top: '#3f7ad8', hor: '#c8dcf4', fog: '#d4e4f0', fogN: 90, fogF: 900, sky: '#a8bcf0', ground: '#6a6448', hemiI: 0.74, fillCol: '#7d93e6', fillI: 0.36, sunCol: '#ffecc8', sunI: 3.7, az: 140, el: 40, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  fallsCrest: { top: '#3f7ad8', hor: '#d0e2f4', fog: '#d8e6f0', fogN: 60, fogF: 700, sky: '#a8bcf0', ground: '#5a6058', hemiI: 0.76, fillCol: '#7d93e6', fillI: 0.36, sunCol: '#fff0d0', sunI: 3.6, az: 150, el: 34, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  fallsGorge: { top: '#4a7ac8', hor: '#d8e4ee', fog: '#dde8ee', fogN: 30, fogF: 420, sky: '#b0c0e8', ground: '#6a7078', hemiI: 0.95, fillCol: '#8a9ae6', fillI: 0.45, sunCol: '#fff0d8', sunI: 3.2, az: -70, el: 50, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  fallsDock: { top: '#3f7ad8', hor: '#c8dcf4', fog: '#d4e4f0', fogN: 80, fogF: 800, sky: '#a8bcf0', ground: '#6a6448', hemiI: 0.74, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#ffe8c0', sunI: 3.8, az: -40, el: 38, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  fallsGold: { top: '#4a5aa8', hor: '#ffc890', fog: '#f0c8a0', fogN: 60, fogF: 650, sky: '#9a90d8', ground: '#5a4a50', hemiI: 0.9, fillCol: '#7078d8', fillI: 0.32, sunCol: '#ffb070', sunI: 3.4, az: 120, el: 12, disc: '#fff0c8', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff2e2', fxTint: '#fff6ea', shafts: 0.6 },
  home: { top: '#000000', hor: '#2a1e18', fog: '#2a1e18', fogN: 10, fogF: 50, sky: '#ffe8c8', ground: '#5a3a2a', hemiI: 0.95, fillCol: '#8a90c8', fillI: 0.3, sunCol: '#ffe8c0', sunI: 2.6, az: -70, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  homePlan: { top: '#000000', hor: '#141a30', fog: '#141a30', fogN: 10, fogF: 50, sky: '#7a7ab8', ground: '#3a2a30', hemiI: 0.72, fillCol: '#5a68c0', fillI: 0.38, sunCol: '#a8b8ff', sunI: 1.2, az: -70, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#f0e8f8', fxTint: '#ffffff', shafts: 0 },
  shop: { top: '#000000', hor: '#2a1e18', fog: '#2a1e18', fogN: 10, fogF: 50, sky: '#ffe8c8', ground: '#5a3a2a', hemiI: 0.95, fillCol: '#8a90c8', fillI: 0.3, sunCol: '#ffe2b8', sunI: 2.8, az: -60, el: 36, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  street: { top: '#3f7ad0', hor: '#c8dcf0', fog: '#d8e4ee', fogN: 40, fogF: 260, sky: '#a8bcf0', ground: '#6a6448', hemiI: 0.74, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#ffe8c0', sunI: 3.7, az: 30, el: 42, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  streetDusk: { top: '#2a2a6a', hor: '#e8907a', fog: '#8a6a8a', fogN: 30, fogF: 200, sky: '#7a6ab8', ground: '#3a2a3a', hemiI: 0.75, fillCol: '#6a6ad0', fillI: 0.4, sunCol: '#ff9a6a', sunI: 1.8, az: 70, el: 6, disc: '#ffd8a0', discSize: 0.003, clouds: true, stars: 0, cardTint: '#f8e4e8', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  fallsDay: { look: 'day', over: { exp: 1.03, con: 1.2, sat: 1.12, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c8', 0.05], bloom: [0.4, 0.84], vig: [0.24, 0.5, '#3a3a5a'] } },
  fallsCrest: { look: 'day', over: { exp: 1.03, con: 1.2, sat: 1.12, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c8', 0.05], bloom: [0.4, 0.84], vig: [0.26, 0.5, '#3a3a5a'] } },
  fallsGorge: { look: 'day', over: { exp: 1.02, con: 1.22, sat: 1.1, tS: ['#3a4a8a', 0.16], tH: ['#f0f4ff', 0.04], bloom: [0.44, 0.82], vig: [0.28, 0.48, '#2a2a4a'] } },
  fallsDock: { look: 'day', over: { exp: 1.04, con: 1.2, sat: 1.12, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.38, 0.86], vig: [0.24, 0.5, '#4a3a5a'] } },
  fallsGold: { look: 'golden', over: { exp: 1.06, con: 1.22, sat: 1.08, tS: ['#3a3a8a', 0.18], tH: ['#ffc890', 0.1], bloom: [0.42, 0.78], hal: [0.24, '#ffa860'], vig: [0.3, 0.48, '#1e1a3a'] } },
  home: { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.08, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.42, 0.78], hal: [0.26, '#ff9a50'], vig: [0.34, 0.46, '#2a1420'] } },
  homePlan: { look: 'night', over: { exp: 1.16, con: 1.22, sat: 1.04, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.5, 0.68], hal: [0.3, '#ffa050'], vig: [0.4, 0.42, '#08081a'] } },
  shop: { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.08, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.42, 0.78], hal: [0.26, '#ff9a50'], vig: [0.34, 0.46, '#2a1420'] } },
  street: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.1, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.36, 0.86], vig: [0.24, 0.5, '#4a3a5a'] } },
  streetDusk: { look: 'golden', over: { exp: 1.08, con: 1.22, sat: 1.04, tS: ['#2a2a7a', 0.24], tH: ['#ffb080', 0.12], bloom: [0.46, 0.72], hal: [0.3, '#ff9050'], vig: [0.4, 0.44, '#140a20'] } },
};

export function buildNG(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'fallsDay', build: 1, anvil: 1, pillow: 1, flash: 0, cart: 0 };
  let fs, hm, sh, st;
  const API = makeAPI(ctx, { prefix: 'ng_', origin: NG_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { fallsDay: 'day', fallsCrest: 'day', fallsGorge: 'day', fallsDock: 'day', fallsGold: 'day', home: 'office', homePlan: 'office', shop: 'office', street: 'day', streetDusk: 'day' },
    practicals: (name, F, W3) => { const fl = 1 + 0.05 * Math.sin(F * 0.7) + 0.03 * Math.sin(F * 1.9);
      if (name === 'home' || name === 'homePlan') return [{ p: W3('home', [1.1, 1.3, -1.0]), col: '#ffc070', I: (name === 'homePlan' ? 7 : 3.2) * fl, d: 7 }, { p: W3('home', [3.2, 2.0, 0]), col: name === 'homePlan' ? '#7a8aff' : '#fff0d8', I: name === 'homePlan' ? 2.2 : 3.0, d: 7 }, { p: W3('home', [-1, 2.6, 2]), col: '#ffe0b8', I: 2.0, d: 8 }];
      if (name === 'shop') return [{ p: W3('shop', [0, 3.0, -0.4]), col: '#ffc070', I: 6 * fl, d: 9 }, { p: W3('shop', [3.5, 2.2, 1.0]), col: '#fff0d8', I: 3.0, d: 8 }, { p: W3('shop', [-3, 2.4, 2]), col: '#ffe0b8', I: 2.0, d: 8 }];
      if (name === 'streetDusk') return [-8, 0, 8].map((x) => ({ p: W3('street', [x, 3.3, -2.8]), col: '#ffb860', I: 5 * fl, d: 9 })).concat([{ p: W3('street', [-4.6, 2.0, 0.4]), col: '#ffffff', I: 20 * ST.flash, d: 10 }]);
      if (name === 'street') return [{ p: W3('street', [-4.6, 2.0, 0.4]), col: '#ffffff', I: 20 * ST.flash, d: 10 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'falls' && fs) { M.curtT.offset.set(0, -T * 0.8); M.veilT.offset.set(0.02 * Math.sin(T * 0.4), -T * 1.1); M.crestT.offset.set(0, -T * 0.5); M.foamT.offset.set(T * 0.02, -T * 0.15);
        M.riverT.offset.set(0, T * 0.16); M.gorgeT.offset.set(0.004 * Math.sin(T * 0.5), T * 0.05); tickMist(fs, f); fs.rainbow.visible = ST.mood !== 'fallsDock'; fs.rainbow.material.opacity = ST.mood === 'fallsGold' ? 0.3 : 0.18; }
      if (cur === 'home' && hm) { hm.lampG.material.opacity = hm.lampG.userData.op * (0.92 + 0.08 * Math.sin(f * 0.8)); tickMotes(hm.dust, f, 0.3); }
      if (cur === 'shop' && sh) { tickMotes(sh.dust, f, 0.4); }
      if (cur === 'street' && st) { tickMotes(st.dust, f, 0.5); st.glows.forEach((g) => (g.material.opacity = ST.mood === 'streetDusk' ? 0.55 * (0.92 + 0.08 * Math.sin(f * 0.6)) : 0)); st.flashG.material.opacity = 0.7 * ST.flash; } },
    mood: (name) => { ST.mood = name; if (hm) { hm.poster.material = name === 'homePlan' ? M.posterPlan : M.poster; hm.shaft.visible = name === 'home'; hm.win.material.color.set(name === 'homePlan' ? 0x2a3a7a : 0xd8ecff).multiplyScalar(name === 'homePlan' ? 1 : 1.3); } },
    apply: (v) => { if (v.build != null) API.setBuild(v.build); if (v.barrel) API.setBarrel(v.barrel); if (v.cart != null) API.setCart(v.cart); } });
  fs = buildFalls(API.groups.falls); hm = buildHome(API.groups.home); sh = buildShop(API.groups.shop); st = buildStreet(API.groups.street);
  API.parts = { fs, hm, sh, st };
  // falls barrel: { p: [x,y,z] set-local, r: [rx,ry,rz], lid: 0..1 open, s: scale, on }
  API.setBarrel = (b) => { const B = fs.barrel; B.visible = b.on !== false; if (!B.visible) return; B.position.set(...b.p); B.rotation.set(...(b.r || [0, 0, 0]), 'YXZ'); B.scale.setScalar(b.s || 1); B.userData.lidP.rotation.x = -(b.lid || 0) * 2.0; };
  // shop: staves fly in (t 0..0.55), hoops drop (0.5..1)
  API.setBuild = (t) => { ST.build = t; const U = sh.hero.userData; U.staves.forEach((s, i) => { const k = clamp01((clamp01(t / 0.55) * 10 - i * 0.5) / 2), e = k < 1 ? 1 - (1 - k) ** 3 : 1; if (s.userData.a < 0) { s.visible = t > 0.001; return; } const a = s.userData.a, d = (1 - e) * 1.8; s.position.set(Math.cos(-a + Math.PI / 2) * 0 + Math.sin(a) * d, (1 - e) * 0.6, Math.cos(a) * d); s.visible = k > 0.001; });
    U.hoops.forEach((h, i) => { const k = clamp01((t - 0.5 - i * 0.1) / 0.14), e = k < 1 ? 1 - (1 - k) ** 2 : 1; h.position.y = h.userData.y + (1 - e) * 3.2; h.visible = k > 0.001; }); U.lidP.visible = t >= 1; };
  API.setAnvil = (t) => { ST.anvil = t; const y = 3.0 - 2.86 * t, A = sh.anvil; A.position.set(0, y, -0.6); A.rotation.y = 0.4 + 0.2 * Math.sin(t * 6); sh.rope.position.set(0, (y + 0.3 + 4.0) / 2, -0.6); sh.rope.scale.set(1, 4.0 - y - 0.3, 1); A.visible = sh.rope.visible = t < 1.001; };
  API.setPillow = (t) => { ST.pillow = t; const P = sh.pillow; P.visible = t > 0.001; const e = clamp01(t); P.position.set(0.05 * Math.sin(e * 9), 2.6 - 2.2 * e * e, -0.6); P.rotation.set(0.3 * Math.sin(e * 7), e * 4, 0.2); };
  API.setCart = (x) => { ST.cart = x; st.cart.position.set(x, 0.18, -1.0); st.cart.rotation.y = Math.PI; };
  API.setFlash = (k) => { ST.flash = k; };
  API.glows = { falls: [], home: [hm.lampG], shop: [sh.lampG], street: [...st.glows, st.flashG] };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); if (API.cur === 'falls') for (const c of fs.mist) c.quaternion.copy(cam.quaternion); };
  const V = API.V, Rr = FR, D = FD;
  API.views = [
    V('fallsDay', [Rr + 6, FLH + 30, 150], [0, -12, -10], 40, 0.6, [0, -10, -10]), // 0 grand view from downstream (high)
    V('fallsGorge', [Rr - 3, -D + 2.6, 44], [-4, -14, -14], 50, 0.8, [0, -14, -20]), // 1 from the rescue ledge
    V('fallsCrest', [20, 1.2, -70], [12, -1, -30], 42, 0.8, [14, 0, -40], { barrel: { p: [14, -0.75, -46], r: [0.05, 0.3, 0.04], lid: 0 } }), // 2 upstream at the crest
    V('fallsDay', [Rr + 4, FLH + 1.7, 14], [26, -6, -22], 46, 0.8, [28, -4, -26]), // 3 Canadian bank looking at the crest
    V('fallsDock', [FALLS.DOCK[0] - 2, 1.9, FALLS.DOCK[1] - 6], [FALLS.DOCK[0] - 6, 0.8, FALLS.DOCK[1] + 2], 44, 1.4, [FALLS.DOCK[0] - 5, 0.8, FALLS.DOCK[1]], { barrel: { p: [FALLS.DOCK[0] - 5, 0.78, FALLS.DOCK[1]], lid: 1 } }), // 4 dock
    V('fallsGold', [Rr + 7, FLH + 2.0, 24], [10, -10, -24], 44, 0.8, [Rr + 1, FLH + 1, 14]), // 5 golden overlook
    V('home', [0.8, 1.6, 4.2], [-0.2, 1.3, -1.6], 46, 1.2, [0, 1.2, -1.2]), // 6 schoolroom
    V('homePlan', [2.6, 1.7, 0.6], [3.1, 1.8, -3.2], 40, 2.0, [3.1, 1.9, -3.1]), // 7 poster plan
    V('shop', [1.8, 2.2, 3.0], [0, 0.8, -0.6], 44, 1.6, [0, 0.8, -0.6], { build: 1 }), // 8 cooperage
    V('shop', [1.4, 2.0, 2.4], [0, 0.8, -0.6], 44, 1.6, [0, 0.8, -0.6], { build: 0.6 }), // 9 cooperage mid-build
    V('street', [0.5, 1.7, 8], [-1.0, 1.6, -3], 46, 1.0, [-2, 1.4, -2], { cart: 2 }), // 10 street
    V('streetDusk', [-3.5, 1.6, 5], [-6, 1.4, -3.6], 44, 1.2, [-6, 1.2, -3.4]), // 11 dusk stand
  ];
  API.setBuild(1); API.setAnvil(1); API.setPillow(1); API.setCart(2); API.setBarrel({ on: false }); API.tick(0);
  return API;
}
