// titanic_sets.js [JG-sets]: sets for "The Titanic's baker" (Charles Joughin, night of 14-15 April 1912). Oddverra short.
//   galley : the ship's bakery: white-tiled walls, two big brick bread ovens (glowing mouths), bread racks full of loaves, long floury work
//            table with dough + loaves, hanging copper pans, pendant lamps, flour sacks, porthole.              origin (-24000, 0, 0)
//   deck   : boat deck at night: planked deck, white railing, lifeboats on curved davits (boat 'lower' setter), deck chairs, deckhouse
//            wall with lit windows (reverse angles), lifebuoy, dark ocean far below, stars, iceberg(k) drifting past.   origin (-24000, 0, 800)
//   cabin  : his small crew cabin: bunk, panelled walls, porthole onto the night, little table with a bottle + glass, wall lamp,
//            cork lifebelt on the wardrobe.                                                                     origin (-24000, 0, 1600)
//   stern  : the poop deck rising out of the sea: planked deck with railings, flagstaff, lamps, capstan, bollards; the whole deck
//            pivots (tilt(a)) and sinks (sink(d)) into the dark water.                                         origin (-26000, 0, 0)
//   ocean  : the icy Atlantic at night: dark water to the horizon, stars, mist, ice chunks, floating deck chairs + debris,
//            overturned collapsible boat, a lifeboat with a lantern (boatAt(x, z)).                            origin (-28000, 0, 0)
//   home   : 1950s cozy living room (old Joughin, years later): armchair, lamp, radio, ship painting, window, loaf on the table.  origin (-24000, 0, 2400)
// Each set: local frame, ground (or water) y = 0, camera side +z. All groups start hidden; show(world, name) displays one.
import { Kit } from './world.js';
import { H, INK, TAU, clamp01, sm, backOut, SERIF, SANS, cyl, sph, tor, plane, planeUV, lathe, mesh, nond, lumpGeo, shapeGeo,
  txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';

export const TI_ORIGIN = { galley: [-24000, 0, 0], deck: [-24000, 0, 800], cabin: [-24000, 0, 1600], home: [-24000, 0, 2400], stern: [-26000, 0, 0], ocean: [-28000, 0, 0] };
let THREE, PT, M;

// ---------------------------------------------------------------- painters
function tileTex(g, w, h, o = {}) { const n = o.n || 8, s = w / n; g.fillStyle = o.grout || '#c8c4b8'; g.fillRect(0, 0, w, h); const R = PT.rng(o.seed || 5);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const c = o.check && (i + j) % 2 ? o.b : o.a, k = 0.94 + R() * 0.08; g.fillStyle = c; g.globalAlpha = 1; g.fillRect(i * s + 2, j * s + 2, s - 4, s - 4); g.fillStyle = `rgba(255,255,255,${0.1 * k})`; g.fillRect(i * s + 4, j * s + 4, s * 0.5, s * 0.12); }
  PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, o.seed || 5)); }
function seaTex(g, w, h) { g.fillStyle = '#0c1430'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.8 + 0.4 * PT.fbm(u, v, 3, 8, 4, 11)); const R = PT.rng(12);
  for (let i = 0; i < 260; i++) { const x = R() * w, y = R() * h, l = 6 + R() * 30; g.strokeStyle = `rgba(${120 + R() * 60},${150 + R() * 60},${220},${0.12 + R() * 0.2})`; g.lineWidth = 1 + R() * 1.6; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 3, x + l, y); g.stroke(); } }
function hullTex(g, w, h) { g.fillStyle = '#f4f0e6'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8b898'; g.fillRect(0, h * 0.82, w, h * 0.18); for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(120,110,90,0.25)'; g.fillRect(0, i * h / 14, w, 2); } grain(g, w, h, 'rgba(90,80,60,1)', 500, 7, 0.15); }
function wallpaperHome(g, w, h) { g.fillStyle = '#c8b88a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { g.fillStyle = '#b4a476'; g.fillRect(i * w / 6, 0, w / 24, h); }
  const R = PT.rng(5); for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) { const x = (i + 0.5) * w / 6, y = (j + 0.5) * h / 6 + (i % 2) * h / 12; g.fillStyle = '#8a9a6a'; g.beginPath(); g.ellipse(x, y, 7, 12, 0.5, 0, TAU); g.fill(); g.fillStyle = '#c86a4a'; g.beginPath(); g.arc(x + 4, y - 12, 5, 0, TAU); g.fill(); }
  PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, 7)); }
function shipPainting(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f0c890'); gr.addColorStop(0.55, '#f8dcb0'); gr.addColorStop(0.56, '#3a5a8a'); gr.addColorStop(1, '#22365a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e1a1e'; g.beginPath(); g.moveTo(w * 0.1, h * 0.5); g.lineTo(w * 0.9, h * 0.5); g.lineTo(w * 0.86, h * 0.62); g.lineTo(w * 0.14, h * 0.62); g.closePath(); g.fill();
  g.fillStyle = '#f2ece0'; g.fillRect(w * 0.2, h * 0.42, w * 0.6, h * 0.08); for (let i = 0; i < 4; i++) { const x = w * (0.28 + i * 0.13); g.fillStyle = '#d8a050'; g.fillRect(x, h * 0.24, w * 0.06, h * 0.18); g.fillStyle = '#1a1414'; g.fillRect(x, h * 0.24, w * 0.06, h * 0.05); }
  for (let i = 0; i < 24; i++) { g.fillStyle = '#ffe8a0'; g.fillRect(w * (0.16 + i * 0.03), h * 0.53, 3, 3); } PT.modulate(g, w, h, (u, v) => 0.85 + 0.2 * PT.fbm(u, v, 8, 8, 3, 4)); }
function nightPort(g, w, h) { const gr = g.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.6); gr.addColorStop(0, '#22305e'); gr.addColorStop(1, '#0a1028'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = PT.rng(9); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${0.4 + R() * 0.6})`; g.fillRect(R() * w, R() * h * 0.6, 2, 2); } g.fillStyle = '#060a1c'; g.fillRect(0, h * 0.66, w, h); }
function winGlowTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffe4a8'); gr.addColorStop(1, '#ffb860'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(120,70,30,0.35)'; g.fillRect(w * 0.48, 0, w * 0.04, h); g.fillRect(0, h * 0.48, w, h * 0.04); }
function signTex(g, w, h, s) { g.fillStyle = '#f2ead6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a1e1e'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12); txt(g, s, w / 2, h / 2 + 2, w * 0.86, h * 0.5, { col: '#7a1e1e', font: SERIF }); }

// ---------------------------------------------------------------- materials
function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.floor = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#c8a070', n: 10, seed: 41 }), [3, 3]) }); if (H.MACRO) H.MACRO(m.floor, 0.12, 0.05);
  m.deckW = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#b89068', n: 12, seed: 17, joints: 2 }), [3, 3]) }); if (H.MACRO) H.MACRO(m.deckW, 0.12, 0.05);
  m.wood = vc({ map: T(256, 256, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a34', n: 4, seed: 33, joints: 0 })) });
  m.tileW = vc({ map: T(512, 512, (g, w, h) => tileTex(g, w, h, { a: '#f2f0ea', grout: '#bcb8ac', n: 10, seed: 3 }), [4, 2]) });
  m.tileF = vc({ map: T(512, 512, (g, w, h) => tileTex(g, w, h, { a: '#e8dcc4', b: '#a8503a', check: 1, grout: '#8a7a6a', n: 8, seed: 8 }), [4, 4]) });
  m.brick = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#8a4a3a', rows: 14, cols: 5 })) });
  m.plaster = vc({ map: T(512, 512, (g, w, h) => { g.fillStyle = '#ece4d2'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.14 * PT.fbm(u, v, 5, 5, 4, 3)); grain(g, w, h, '#6a5040', 900, 4, 0.15); }) });
  m.panel = vc({ map: T(512, 512, (g, w, h) => { g.fillStyle = '#ddd0b8'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,100,80,0.45)'; g.lineWidth = 4; for (let i = 0; i < 3; i++) g.strokeRect(i * w / 3 + 14, 24, w / 3 - 28, h * 0.55); g.strokeRect(14, h * 0.66, w - 28, h * 0.3); PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 5)); }, [2, 1]) });
  m.sea = toon({ map: T(512, 512, seaTex, [500, 500]), emissive: 0x060a1a }); m.sea.emissiveMap = m.sea.map; if (H.MACRO) H.MACRO(m.sea, 0.2, 0.01);
  m.seaNear = toon({ map: T(512, 512, seaTex, [16, 16]), emissive: 0x08102a }); m.seaNear.emissiveMap = m.seaNear.map;
  m.hull = toon({ map: T(256, 128, hullTex), emissive: 0x5a5a66, side: THREE.DoubleSide });
  m.ice = vc({ emissive: 0x5a6a88 }); m.iceChunk = vc({ emissive: 0x1a2a4a });
  m.blanket = vc({ map: T(256, 256, (g, w, h) => { PT.fabric(g, w, h, { base: '#3a4a7a' }); g.fillStyle = 'rgba(240,230,210,0.5)'; g.fillRect(0, h * 0.1, w, h * 0.05); g.fillRect(0, h * 0.85, w, h * 0.05); }) });
  m.wpHome = toon({ map: T(512, 512, wallpaperHome, [4, 2]), emissive: 0x1a140c }); m.wpHome.emissiveMap = m.wpHome.map;
  m.rug = vc({ map: T(512, 384, (g, w, h) => { g.fillStyle = '#7a3a2e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d8b070'; g.lineWidth = 14; g.strokeRect(24, 24, w - 48, h - 48); g.fillStyle = '#2a3a5a'; g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.28, h * 0.25, 0, 0, TAU); g.fill(); PT.modulate(g, w, h, (u, v) => 0.85 + 0.2 * PT.fbm(u, v, 6, 6, 3, 2)); }) });
  m.fabric = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#6a8a6a' })) });
  m.painting = em(T(512, 320, shipPainting), 0x2a2018); m.port = C.basic(T(256, 256, nightPort), 1.1);
  m.winGlow = C.basic(T(128, 128, winGlowTex), 1.25); m.winHome = C.basic(T(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a3a6a'); gr.addColorStop(1, '#6a5a8a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = PT.rng(4); for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.arc(R() * w, R() * h, 1.5 + R() * 2, 0, TAU); g.fill(); } g.fillStyle = '#1a1a2e'; g.fillRect(0, h * 0.75, w, h); g.fillStyle = '#f0f0f8'; g.fillRect(0, h * 0.75, w, h * 0.05); }), 1.0);
  m.buoy = em(T(512, 128, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#f2ece0' : '#c83a2e'; g.fillRect(i * w / 8, 0, w / 8, h); } txt(g, 'TITANIC', w * 0.25, h / 2, w * 0.4, h * 0.55, { col: '#1a1a2a', font: SERIF }); txt(g, 'TITANIC', w * 0.75, h / 2, w * 0.4, h * 0.55, { col: '#1a1a2a', font: SERIF }); }), 0x2a1a14);
  m.sign = em(T(512, 128, (g, w, h) => signTex(g, w, h, 'BAKERY')), 0x2a2018);
  m.ovenGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff7a20).multiplyScalar(1.8), fog: false });
  m.loaf = vc({ emissive: 0x2a1408 }); m.copper = vc({ emissive: 0x3a1a08 });
  m.lampOn = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe0a0).multiplyScalar(2.2), fog: false });
  m.starBulb = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0c8).multiplyScalar(2.0), fog: false });
  m.mist = new THREE.MeshBasicMaterial({ map: T(256, 128, (g, w, h) => { g.clearRect(0, 0, w, h); const R = PT.rng(3); for (let i = 0; i < 40; i++) { const x = R() * w, y = h * (0.3 + R() * 0.4), r = 20 + R() * 40, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(200,215,255,0.22)'); gr.addColorStop(1, 'rgba(200,215,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } }), transparent: true, opacity: 0.16, depthWrite: false, fog: false, side: THREE.DoubleSide });
  return m; }

// ---------------------------------------------------------------- props
const LOAFC = [0xd8904a, 0xc87e3a, 0xe09a52, 0xcc8640, 0xb87034];
function loaf(K, x, y, z, s, R, ry = 0) { K.put(M.loaf, sph(1, 14, 10), x, y + s * 0.42, z, 0, ry + (R() - 0.5) * 0.3, 0, s * 1.15, s * 0.5, s * 0.62, LOAFC[(R() * 5) | 0]); }
function roundLoaf(K, x, y, z, s, R) { K.put(M.loaf, sph(1, 14, 10), x, y + s * 0.5, z, 0, R() * TAU, 0, s, s * 0.62, s, LOAFC[(R() * 5) | 0]); }
function deckChair(K, x, z, ry, flat = false) { K.at(x, flat ? 0.04 : 0, z, ry, () => { const c = 0xa8723e, d = 0x6a4424;
  if (flat) { K.cb(M.wood, 0.55, 0.05, 1.5, 0, 0, 0, c); for (const s of [-1, 1]) K.cb(M.wood, 0.05, 0.06, 1.5, s * 0.28, 0.03, 0, d); return; }
  K.cb(M.wood, 0.56, 0.05, 0.95, 0, 0.36, 0.15, c, -0.12); K.cb(M.wood, 0.56, 0.05, 0.75, 0, 0.7, -0.45, c, 0.95);
  for (const s of [-1, 1]) { K.beam(M.wood, [s * 0.3, 0, 0.55], [s * 0.3, 0.38, 0.5], 0.04, d); K.beam(M.wood, [s * 0.3, 0, -0.3], [s * 0.3, 0.42, -0.25], 0.04, d); K.beam(M.wood, [s * 0.3, 0.55, 0.3], [s * 0.3, 0.55, -0.35], 0.04, d); K.beam(M.wood, [s * 0.3, 0.42, 0.3], [s * 0.3, 0.55, 0.3], 0.035, d); } }); }
function railing(K, x0, x1, z, y = 0, h = 1.05, col = 0xf2ece0) { const n = Math.max(2, Math.round((x1 - x0) / 0.9)); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; K.beam(M.paint, [x, y, z], [x, y + h, z], 0.05, col, true, 8); }
  for (const yy of [h, h * 0.62, h * 0.3]) K.beam(M.paint, [x0, y + yy, z], [x1, y + yy, z], yy === h ? 0.07 : 0.035, yy === h ? 0x8a5a34 : col, true, 8); }
function railingZ(K, z0, z1, x, y = 0, h = 1.05, col = 0xf2ece0) { const n = Math.max(2, Math.round(Math.abs(z1 - z0) / 0.9)); for (let i = 0; i <= n; i++) { const z = z0 + (z1 - z0) * i / n; K.beam(M.paint, [x, y, z], [x, y + h, z], 0.05, col, true, 8); }
  for (const yy of [h, h * 0.62, h * 0.3]) K.beam(M.paint, [x, y + yy, z0], [x, y + yy, z1], yy === h ? 0.07 : 0.035, yy === h ? 0x8a5a34 : col, true, 8); }
// lifeboat hull (local: long axis x, keel down at y=0, gunwale at y=hh); returns a Group so it can be moved / flipped
const boatPts = (L, W) => Array.from({ length: 32 }, (_, i) => { const a = i / 32 * TAU, c = Math.cos(a), s = Math.sin(a); return [c * L / 2, Math.sign(s) * Math.abs(s) ** 0.7 * W / 2 * (1 - 0.25 * c * c)]; });
function boat(parent, L = 5.2, W = 1.6, hh = 0.7, o = {}) { const g = new THREE.Group(); parent.add(g); const K = new Kit();
  const sh = (L2, W2) => shapeGeo(boatPts(L2, W2), 1, 0.02);
  const ring = (L1, W1, L2, W2) => { const S2 = new THREE.Shape(); boatPts(L1, W1).forEach(([x, y], i) => (i ? S2.lineTo(x, y) : S2.moveTo(x, y))); S2.closePath(); const h2 = new THREE.Path(); boatPts(L2, W2).reverse().forEach(([x, y], i) => (i ? h2.lineTo(x, y) : h2.moveTo(x, y))); h2.closePath(); S2.holes.push(h2);
    const geo = new THREE.ExtrudeGeometry(S2, { depth: 1, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); return geo; };
  const hull = mesh(g, ring(L, W, L - 0.14, W - 0.12), M.hull, 0, 0, 0, 0, 0, 0); hull.scale.set(1, hh, 1); /* hollow hull walls */
  const bottom = mesh(g, sh(L * 0.97, W * 0.93), M.hull, 0, 0, 0, 0, 0, 0); bottom.scale.set(1, hh * 0.3, 1);
  const keel = mesh(g, sh(L * 0.92, W * 0.82), M.paint, 0, -0.08, 0, 0, 0, 0); keel.scale.set(1, 0.12, 1); keel.material = M.vc({ color: 0x8a6a4a });
  const inner = mesh(g, sh(L * 0.95, W * 0.9), M.wood, 0, hh * 0.3, 0, 0, 0, 0, false); inner.scale.set(1, 0.02, 1);
  const rim = mesh(g, ring(L * 1.02, W * 1.06, L - 0.16, W - 0.14), M.wood, 0, hh * 0.98, 0, 0, 0, 0); rim.scale.set(1, 0.06, 1);
  for (const x of [-1.6, -0.6, 0.4, 1.4].map((k) => k * L / 5.2)) K.cb(M.wood, 0.22, 0.05, W * 0.86, x, hh * 0.72, 0, 0x9a6a3a);
  if (o.oars) for (const s of [-1, 1]) for (const x of [-0.8, 0.6]) K.beam(M.wood, [x, hh + 0.05, s * W * 0.3], [x - 0.5, hh - 0.2, s * (W / 2 + 1.0)], 0.035, 0xc89a5a, true, 6);
  K.build(g); return g; }
function iceberg(root, x, y, z, s, seed) { const g = new THREE.Group(); g.position.set(x, y, z); root.add(g); const R = PT.rng(seed);
  for (let i = 0; i < 6; i++) { const m = mesh(g, lumpGeo(seed + i, 2, 0.4), M.ice, (R() - 0.5) * s * 0.9, s * (0.2 + R() * 0.35) * (i === 0 ? 1.8 : 1), (R() - 0.5) * s * 0.5, R(), R() * TAU, R() * 0.3);
    const k = i === 0 ? 1 : 0.5 + R() * 0.4; m.scale.set(s * 0.5 * k, s * (i === 0 ? 0.95 : 0.55) * k, s * 0.4 * k); m.material = M.ice; const c = new THREE.Color(0xe8f2ff); const p = m.geometry.attributes.position.count; m.geometry = m.geometry.clone(); m.geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(p * 3).map((_, j) => [c.r, c.g, c.b][j % 3]), 3)); }
  return g; }
function lamp(K, root, x, y, z, glows, size = 0.5, op = 0.55) { K.put(M.lampOn, sph(0.06, 10, 8), x, y, z); K.put(M.brass, cyl(0.07, 0.05, 0.05, 10), x, y + 0.07, z, 0, 0, 0, 1, 1, 1, 0xc8a050); glows.push(glowAt(root, [x, y, z], size, '#ffc878', op)); }

// ================================================================= GALLEY (bakery)
function buildGalley(root) { const R = PT.rng(1912), K = new Kit(), X = 3.4, ZB = -2.6, HT = 2.7, glows = [];
  mesh(root, planeUV(9, 8, 1, 1), M.tileF, 0, 0, -0.6, -Math.PI / 2, 0, 0, false);
  mesh(root, plane(2 * X, HT), M.tileW, 0, HT / 2, ZB, 0, 0, 0, false);
  for (const s of [-1, 1]) mesh(root, plane(5, HT), M.tileW, s * X, HT / 2, ZB + 2.5, 0, -s * Math.PI / 2, 0, false);
  mesh(root, plane(2 * X, 5.2), H.toon({ color: 0xd8d0c0, side: THREE.DoubleSide }), 0, HT, ZB + 2.5, Math.PI / 2, 0, 0, false);
  for (let x = -X; x <= X; x += 1.1) K.box(M.paint, x - 0.08, x + 0.08, HT - 0.18, HT, ZB, ZB + 5, 0xe8e2d4, 0.01); // ceiling beams
  K.box(M.paint, -X, X, 0, 0.14, ZB, ZB + 0.03, 0x5a6a7a, 0.005); // tile skirting
  // two brick ovens on the back wall with arched glowing mouths + iron doors
  const ovens = [];
  for (const ox of [-1.6, 0.9]) { K.box(M.brick, ox - 0.95, ox + 0.95, 0, 1.95, ZB, ZB + 0.9, 0xffffff, 0.02); K.box(M.metal, ox - 1.0, ox + 1.0, 1.95, 2.05, ZB, ZB + 0.95, 0x3a3a40, 0.01);
    K.box(M.metal, ox - 0.55, ox + 0.55, 0.62, 1.32, ZB + 0.9, ZB + 0.93, 0x2a2a30, 0.01);
    const mouth = mesh(root, plane(0.86, 0.5), M.ovenGlow, ox, 0.97, ZB + 0.94, 0, 0, 0, false); nond(mouth); ovens.push(mouth);
    K.put(M.metal, tor(0.43, 0.04, 6, 20, Math.PI), ox, 1.22, ZB + 0.95, 0, 0, 0, 1, 0.5, 1, 0x2a2a30);
    for (const s of [-1, 1]) K.put(M.brass, sph(0.035, 8, 6), ox + s * 0.5, 0.95, ZB + 0.96, 0, 0, 0, 1, 1, 1, 0xc8a050);
    K.box(M.metal, ox - 0.5, ox + 0.5, 0.55, 0.6, ZB + 0.9, ZB + 1.15, 0x4a4a52, 0.005);
    glows.push(glowAt(root, [ox, 0.97, ZB + 1.05], 1.5, '#ff8a3a', 0.6)); }
  // bread racks (left wall) full of loaves
  for (const z of [-1.4, -0.1]) { K.at(-X + 0.35, 0, z, Math.PI / 2, () => { for (const s of [-1, 1]) for (const d of [-1, 1]) K.beam(M.wood, [s * 0.55, 0, d * 0.22], [s * 0.55, 2.0, d * 0.22], 0.05, 0x7a5030);
      for (let j = 0; j < 5; j++) { const y = 0.25 + j * 0.42; K.box(M.wood, -0.6, 0.6, y, y + 0.03, -0.25, 0.25, 0x9a6a40, 0.005); for (let i = 0; i < 5; i++) loaf(K, -0.45 + i * 0.22, y + 0.03, (R() - 0.5) * 0.12, 0.1, R, Math.PI / 2); } }); }
  // long work table (centre) with flour, dough, loaves, rolling pin, scale
  const TX = 0.3, TZ = -0.5, TY = 0.88; K.box(M.wood, TX - 1.4, TX + 1.4, TY - 0.07, TY, TZ - 0.45, TZ + 0.45, 0xd8b88a, 0.01);
  for (const [x, z] of [[-1.3, -0.4], [1.3, -0.4], [-1.3, 0.4], [1.3, 0.4]]) K.box(M.wood, TX + x - 0.05, TX + x + 0.05, 0, TY - 0.07, TZ + z - 0.05, TZ + z + 0.05, 0x7a5030, 0.01);
  K.box(M.wood, TX - 1.3, TX + 1.3, 0.22, 0.25, TZ - 0.38, TZ + 0.38, 0x8a6040, 0.005);
  mesh(root, plane(1.1, 0.5), M.vc({ color: 0xfaf6ee }), TX - 0.6, TY + 0.002, TZ + 0.05, -Math.PI / 2, 0, 0.2, false); // flour dusting
  for (let i = 0; i < 3; i++) K.put(M.dough, sph(1, 16, 12), TX - 0.9 + i * 0.33, TY + 0.05, TZ + 0.1, 0, 0, 0, 0.13, 0.07, 0.11, 0xf2e6d0);
  for (let i = 0; i < 7; i++) loaf(K, TX + 0.25 + (i % 4) * 0.26, TY, TZ - 0.2 + ((i / 4) | 0) * 0.3, 0.11, R);
  K.beam(M.wood, [TX - 0.3, TY + 0.04, TZ + 0.3], [TX + 0.15, TY + 0.04, TZ + 0.22], 0.035, 0xc8a070, true, 10);
  // flour sacks (right) + bins
  for (let i = 0; i < 4; i++) K.put(M.paint, sph(1, 12, 10), X - 0.5 - (i % 2) * 0.45, 0.3 + ((i / 2) | 0) * 0.48, -1.9 + (i % 2) * 0.1, 0, R(), 0, 0.26, 0.32, 0.22, 0xe8dcc0);
  for (let i = 0; i < 2; i++) K.box(M.wood, X - 0.6 - i * 0.7, X - 0.05 - i * 0.7, 0, 0.7, -0.6, -0.1, 0x8a5a34, 0.02);
  // hanging copper pans + utensil rail
  // (no hanging pans: they blocked the boards)
  // pendant lamps
  for (const x of [-1.4, 1.4]) { K.beam(M.metal, [x, HT, -0.6], [x, 2.25, -0.6], 0.012, 0x2a2a30); K.put(M.paint, cyl(0.06, 0.22, 0.14, 16, true), x, 2.2, -0.6, 0, 0, 0, 1, 1, 1, 0x2a5a4a); lamp(K, root, x, 2.12, -0.6, glows, 0.9, 0.5); }
  // porthole on the right wall + BAKERY sign above the ovens
  K.put(M.brass, tor(0.24, 0.05, 8, 24), X - 0.02, 1.6, 0.6, 0, Math.PI / 2, 0, 1, 1, 1, 0xc8a050); mesh(root, plane(0.44, 0.44), M.port, X - 0.03, 1.6, 0.6, 0, -Math.PI / 2, 0, false);
  mesh(root, plane(1.2, 0.3), M.sign, -0.35, 2.32, ZB + 0.02, 0, 0, 0, false);
  K.build(root, 3);
  const dust = motes(root, 120, [-2.5, 2.5, 0.4, 2.4, -2.2, 0.6], 7, 0.01);
  return { glows, ovens, dust, TX, TZ, TY, ZB }; }

// ================================================================= DECK (boat deck, night)
function buildDeck(root) { const R = PT.rng(1414), K = new Kit(), glows = [], ZR = -2.2;
  mesh(root, planeUV(16, 8.4, 1, 0.56), M.deckW, 0, 0, ZR + 4.0, -Math.PI / 2, 0, 0, false);
  K.box(M.paint, -8, 8, -0.2, 0.06, ZR - 0.3, ZR, 0xf0ead8, 0.01); railing(K, -8, 8, ZR - 0.12, 0.06);
  // hull side dropping to the sea (dark) + sea far below
  K.box(M.paint, -8, 8, -6, -0.2, ZR - 0.4, ZR - 0.25, 0x1a1a22, 0.02);
  const sea = mesh(root, plane(3000, 3000), M.sea, 0, -18, -1400, -Math.PI / 2, 0, 0, false); sea.receiveShadow = false;
  // lifeboats on davits: two boats, the left one is the 'loading' boat (lower(k): 0 = stowed high, 1 = at the rail)
  const boats = [];
  for (const [bx, k] of [[-2.4, 0], [4.2, 1]]) { const davG = new THREE.Group(); root.add(davG);
    for (const s of [-1, 1]) { K.beam(M.paint, [bx + s * 2.2, 0, ZR + 0.2], [bx + s * 2.2, 2.1, ZR + 0.1], 0.09, 0xf2ece0, true, 10); K.put(M.paint, tor(0.55, 0.08, 8, 14, Math.PI / 2), bx + s * 2.2, 2.1, ZR - 0.45, 0, Math.PI / 2, 0, 1, 1, 1, 0xf2ece0); K.beam(M.metal, [bx + s * 2.2, 2.55, ZR - 1.0], [bx + s * 2.2, 1.3, ZR - 1.0], 0.012, 0x2a2a30); }
    const b = boat(root, 4.6, 1.5, 0.66); b.position.set(bx, 1.4, ZR - 1.0); boats.push(b); }
  // deck chairs scattered + stacked
  for (const [x, z, ry] of [[-5.6, 0.4, 0.3], [-4.8, 1.1, -0.2], [-1.8, 1.0, 0.5], [-2.9, 1.5, -0.4], [6.0, 0.5, 0.2], [-0.4, 1.8, 1.4]]) deckChair(K, x, z, ry);
  // lifebuoy on the rail, bench, ventilator cowls
  const buoy = mesh(root, tor(0.3, 0.08, 10, 28), M.buoy, 0.9, 0.62, ZR - 0.02, 0, 0, 0); buoy.rotation.set(0, 0, 0);
  K.box(M.wood, -7.6, -6.2, 0.42, 0.48, 1.6, 2.0, 0x8a5a34, 0.01); for (const x of [-7.4, -6.4]) K.box(M.metal, x - 0.03, x + 0.03, 0, 0.42, 1.65, 1.95, 0x2a2a30, 0.005);
  for (const [x, z] of [[-1.0, 2.5], [7.2, 2.2]]) { K.put(M.paint, cyl(0.2, 0.2, 1.8, 14), x, 0.9, z, 0, 0, 0, 1, 1, 1, 0xf2ece0); K.put(M.paint, tor(0.3, 0.14, 8, 16, Math.PI), x, 1.85, z - 0.15, 0, 0, Math.PI / 2, 1, 1, 1, 0xf2ece0); K.put(M.paint, cyl(0.26, 0.26, 0.02, 16), x, 1.85, z - 0.44, Math.PI / 2, 0, 0, 1, 1, 1, 0xc83a2e); }
  // deckhouse wall behind (reverse angles) with lit windows + wall lamps
  K.box(M.paint, -8, 8, 0, 2.6, 5.6, 5.9, 0xf2ece0, 0.01); K.box(M.paint, -8, 8, 2.6, 2.75, 5.4, 6.0, 0xd8d0c0, 0.01);
  for (let i = 0; i < 8; i++) { const x = -7 + i * 2; mesh(root, plane(0.7, 0.8), M.winGlow, x, 1.45, 5.59, 0, Math.PI, 0, false); K.box(M.wood, x - 0.42, x + 0.42, 1.0, 1.05, 5.5, 5.6, 0x8a5a34, 0.01); glows.push(glowAt(root, [x, 1.45, 5.4], 1.4, '#ffc070', 0.35)); }
  for (const x of [-6, -2, 2, 6]) lamp(K, root, x, 2.35, 5.45, glows, 0.9, 0.5);
  // rail lamps on short posts
  for (const x of [-6.8, -0.4, 5.6]) { K.beam(M.metal, [x, 1.1, ZR - 0.05], [x, 1.55, ZR - 0.05], 0.025, 0x2a2a30); lamp(K, root, x, 1.6, ZR - 0.05, glows, 0.8, 0.55); }
  // a funnel-like stack + mast silhouette far right (generic, buff with black top)
  K.put(M.paint, cyl(1.4, 1.5, 9, 24), 10, 5.5, 6, 0, 0, 0, 1.25, 1, 1, 0xd89a48); K.put(M.paint, cyl(1.42, 1.42, 1.8, 24), 10, 10.3, 6, 0, 0, 0, 1.25, 1, 1, 0x141416);
  K.build(root, 4);
  const berg = iceberg(root, -40, -18, -150, 22, 31); berg.visible = false;
  const mist = nond(mesh(root, plane(400, 40), M.mist, 0, -14, -260, 0, 0, 0, false)); mist.renderOrder = 4;
  const flyers = [0, 1, 2].map(() => { const g = new THREE.Group(); root.add(g); const k = new Kit(); deckChair(k, 0, 0, 0); k.build(g); g.visible = false; return g; });
  return { glows, boats, berg, buoy, ZR, flyers }; }

// ================================================================= CABIN
function buildCabin(root) { const R = PT.rng(1500), K = new Kit(), glows = [], X = 1.4, ZB = -1.4, HT = 2.3;
  mesh(root, planeUV(4, 4, 1, 1), M.floor, 0, 0, 0, -Math.PI / 2, 0, 0, false);
  mesh(root, plane(2 * X, HT), M.panel, 0, HT / 2, ZB, 0, 0, 0, false);
  for (const s of [-1, 1]) mesh(root, plane(3.4, HT), M.panel, s * X, HT / 2, ZB + 1.7, 0, -s * Math.PI / 2, 0, false);
  mesh(root, plane(2 * X, 3.4), H.toon({ color: 0xe8e0d0, side: THREE.DoubleSide }), 0, HT, ZB + 1.7, Math.PI / 2, 0, 0, false);
  K.box(M.wood, -X, X, 0, 0.12, ZB, ZB + 0.03, 0x6a4024, 0.005); K.box(M.wood, -X, X, HT - 0.1, HT, ZB, ZB + 0.05, 0x6a4024, 0.005);
  // bunk (left) with blanket + pillow
  K.box(M.wood, -X, -X + 0.85, 0, 0.5, ZB, ZB + 1.95, 0x7a4a2a, 0.02); K.put(M.blanket, sph(1, 12, 8), -X + 0.42, 0.56, ZB + 1.05, 0, 0, 0, 0.4, 0.09, 0.85, 0xffffff);
  K.put(M.paint, sph(1, 12, 8), -X + 0.42, 0.6, ZB + 0.22, 0, 0, 0, 0.3, 0.08, 0.16, 0xf8f4ea); K.box(M.wood, -X + 0.78, -X + 0.86, 0.5, 0.75, ZB, ZB + 1.95, 0x7a4a2a, 0.01);
  // porthole (back wall) + curtain rod
  K.put(M.brass, tor(0.22, 0.045, 8, 24), 0.25, 1.55, ZB + 0.02, 0, 0, 0, 1, 1, 1, 0xc8a050); mesh(root, plane(0.42, 0.42), M.port, 0.25, 1.55, ZB + 0.01, 0, 0, 0, false);
  // small table (right) with the bottle + a little glass
  const TX = 0.75, TZ = ZB + 0.55, TY = 0.72; K.box(M.wood, TX - 0.4, TX + 0.4, TY - 0.05, TY, TZ - 0.3, TZ + 0.3, 0x8a5a34, 0.01); for (const [x, z] of [[-0.34, -0.24], [0.34, -0.24], [-0.34, 0.24], [0.34, 0.24]]) K.box(M.wood, TX + x - 0.025, TX + x + 0.025, 0, TY - 0.05, TZ + z - 0.025, TZ + z + 0.025, 0x6a4024, 0.005);
  K.put(M.paint, lathe('bottle', [[0.001, 0], [0.045, 0], [0.047, 0.16], [0.02, 0.21], [0.016, 0.27], [0.001, 0.28]], 14), TX + 0.1, TY, TZ - 0.05, 0, 0, 0, 1, 1, 1, 0x2a4a2e);
  K.put(M.paint, cyl(0.048, 0.048, 0.06, 14), TX + 0.1, TY + 0.09, TZ - 0.05, 0, 0, 0, 1, 1, 1, 0xefe2c0);
  K.put(M.jar, lathe('glass', [[0.001, 0], [0.025, 0], [0.004, 0.01], [0.004, 0.04], [0.03, 0.06], [0.035, 0.1]], 12), TX - 0.12, TY, TZ + 0.06);
  K.put(M.paint, cyl(0.026, 0.012, 0.03, 12), TX - 0.12, TY + 0.075, TZ + 0.06, 0, 0, 0, 1, 1, 1, 0xc8782a);
  // wardrobe (right wall) with cork lifebelt on top, coat on a hook
  K.box(M.wood, X - 0.5, X, 0, 1.9, ZB + 1.1, ZB + 1.9, 0x7a4a2a, 0.02); K.box(M.wood, X - 0.52, X - 0.49, 0.1, 1.8, ZB + 1.15, ZB + 1.85, 0x6a4024, 0.01);
  for (let i = 0; i < 6; i++) K.cb(M.paint, 0.16, 0.08, 0.1, X - 0.25, 1.95 + (i % 2) * 0.08, ZB + 1.25 + ((i / 2) | 0) * 0.15, 0xf2ece0);
  // wall lamp + framed photo
  K.box(M.brass, -0.4, -0.3, 1.7, 1.78, ZB, ZB + 0.12, 0xc8a050, 0.005); K.put(M.paint, cyl(0.05, 0.1, 0.1, 12, true), -0.35, 1.82, ZB + 0.15, 0, 0, 0, 1, 1, 1, 0xf2e2b8); lamp(K, root, -0.35, 1.8, ZB + 0.15, glows, 0.9, 0.55);
  K.build(root, 3);
  return { glows, TX, TZ, TY, ZB }; }

// ================================================================= STERN (poop deck that tilts + sinks)
function buildStern(root) { const R = PT.rng(1912), glows = [];
  const sea = mesh(root, plane(3000, 3000), M.sea, 0, 0, -800, -Math.PI / 2, 0, 0, false); sea.receiveShadow = false;
  const near = null;
  const pivot = new THREE.Group(); pivot.position.set(0, 6, 0); root.add(pivot); const K = new Kit();
  // deck: x -3.5..3.5, z -6 (stern rail) .. +6 ; hull below the deck down to y -14 (so it reads as the hull out of the water)
  const deck = mesh(pivot, planeUV(7, 12, 1.2, 2), M.deckW, 0, 0, 0, -Math.PI / 2, 0, 0, false);
  K.box(M.paint, -3.6, 3.6, -14, -0.02, -6.1, 6, 0x15151c, 0.02); K.box(M.paint, -3.62, 3.62, -14, -9, -6.12, 6, 0xa82a22, 0.02); K.box(M.paint, -3.62, 3.62, -0.6, -0.02, -6.12, 6.02, 0xf2ece0, 0.01);
  railing(K, -3.5, 3.5, -5.95, 0); railingZ(K, -5.95, 5.8, -3.45, 0); railingZ(K, -5.95, 5.8, 3.45, 0);
  K.beam(M.wood, [0, 0, -5.6], [0, 5.5, -5.6], 0.08, 0xc8a070, true, 8); // flagstaff
  K.put(M.metal, cyl(0.45, 0.5, 0.6, 18), 0, 0.3, -2.0, 0, 0, 0, 1, 1, 1, 0x3a3a42); K.put(M.metal, cyl(0.3, 0.3, 0.3, 18), 0, 0.75, -2.0, 0, 0, 0, 1, 1, 1, 0x4a4a52); // capstan
  for (const [x, z] of [[-2.6, -4.6], [2.6, -4.6], [-2.6, 1.0], [2.6, 1.0]]) for (const d of [-0.2, 0.2]) K.put(M.metal, cyl(0.12, 0.13, 0.4, 12), x, 0.2, z + d, 0, 0, 0, 1, 1, 1, 0x2a2a30); // bollards
  K.box(M.paint, -2.2, 2.2, 0, 2.2, 3.5, 6.0, 0xf2ece0, 0.02); for (const x of [-1.5, -0.5, 0.5, 1.5]) { const w = mesh(pivot, plane(0.5, 0.6), M.winGlow, x, 1.3, 3.49, 0, Math.PI, 0, false); } // docking bridge house
  for (const x of [-1.5, -0.5, 0.5, 1.5]) mesh(pivot, plane(0.5, 0.6), M.winGlow, x, 1.3, 3.49 - 0.001, 0, 0, 0, false);
  for (const [x, z] of [[-3.3, -5.0], [3.3, -5.0], [-3.3, 0.0], [3.3, 0.0], [-3.3, 4.0], [3.3, 4.0]]) { K.beam(M.metal, [x, 1.05, z], [x, 1.5, z], 0.025, 0x2a2a30); lamp(K, pivot, x, 1.55, z, glows, 0.9, 0.6); }
  for (const [x, z, ry] of [[1.4, -3.2, 0.4], [-1.6, 0.6, -0.3]]) deckChair(K, x, z, ry);
  K.build(pivot, 4);
  const buoy = mesh(pivot, tor(0.3, 0.08, 10, 28), M.buoy, 1.6, 0.6, -5.9, 0, 0, 0);
  const mist = nond(mesh(root, plane(300, 30), M.mist, 0, 2, -160, 0, 0, 0, false)); mist.renderOrder = 4;
  return { glows, pivot, sea, near }; }

// ================================================================= OCEAN (icy water, night)
function buildOcean(root) { const R = PT.rng(1515), K = new Kit(), glows = [];
  const sea = mesh(root, plane(3000, 3000), M.sea, 0, 0, -800, -Math.PI / 2, 0, 0, false); sea.receiveShadow = false;
  const near = null;
  // floating debris: deck chairs flat, planks, crates, ice chunks (bobbing in tick)
  const bob = [];
  const fl = (x, z, ry, kind) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); const k = new Kit();
    if (kind === 'chair') deckChair(k, 0, 0, 0, true); else if (kind === 'plank') k.cb(M.wood, 0.25, 0.06, 1.6, 0, 0.02, 0, 0x9a6a40); else if (kind === 'crate') k.cb(M.wood, 0.5, 0.3, 0.5, 0, 0.05, 0, 0x8a5a34, 0.3, 0.2);
    else if (kind === 'ice') { const s = 0.3 + R() * 0.5; k.put(M.iceChunk, lumpGeo((R() * 9) | 0, 1, 0.4), 0, 0.02, 0, 0, R() * TAU, 0, s, s * 0.35, s * 0.8, 0xdceaf8); }
    else if (kind === 'chair2') { deckChair(k, 0, 0, 0, true); } k.build(g); bob.push([g, R() * TAU]); return g; };
  for (let i = 0; i < 22; i++) { const a = R() * TAU, d = 2.5 + R() * 18; fl(Math.cos(a) * d, -Math.abs(Math.sin(a)) * d - 1, R() * TAU, ['chair', 'plank', 'ice', 'chair', 'crate', 'ice'][i % 6]); }
  // far icebergs on the horizon
  iceberg(root, -120, -2, -420, 40, 51); iceberg(root, 160, -2, -600, 55, 61);
  // overturned collapsible (bottom up), near-left; lifeboat with lantern (moves via boatAt)
  const coll = new THREE.Group(); root.add(coll); { const b = boat(coll, 4.6, 1.5, 0.5); b.rotation.set(Math.PI, 0, 0.08); b.position.y = 0.32; } coll.position.set(-1.8, 0, -4.2); coll.rotation.y = 0.35;
  const life = new THREE.Group(); root.add(life); { const b = boat(life, 5.0, 1.6, 0.7, { oars: true }); b.position.y = -0.25; const k2 = new Kit(); k2.beam(M.wood, [2.0, 0.3, 0], [2.0, 1.7, 0], 0.04, 0x8a5a34); k2.build(life); lamp(k2, life, 2.0, 1.75, 0, glows, 1.6, 0.7); k2.build(life); } life.position.set(3.5, 0, -6); life.rotation.y = -0.4;
  const mists = []; for (let i = 0; i < 0; i++) { const m = nond(mesh(root, plane(60, 4), M.mist, (i - 1) * 20, 0.6 + i * 0.3, -24 - i * 14, 0, 0, 0, false)); m.renderOrder = 4; mists.push(m); }
  return { glows, bob, coll, life, sea, near, mists }; }

// ================================================================= HOME (1950s, years later)
function buildHome(root) { const R = PT.rng(1956), K = new Kit(), glows = [], X = 2.8, ZB = -2.2, HT = 2.6;
  mesh(root, planeUV(8, 7, 2, 2), M.floor, 0, 0, -0.5, -Math.PI / 2, 0, 0, false); mesh(root, plane(3.2, 2.2), M.rug, 0, 0.005, -0.7, -Math.PI / 2, 0, 0, false);
  mesh(root, plane(2 * X, HT), M.wpHome, 0, HT / 2, ZB, 0, 0, 0, false); for (const s of [-1, 1]) mesh(root, plane(4, HT), M.wpHome, s * X, HT / 2, ZB + 2, 0, -s * Math.PI / 2, 0, false);
  mesh(root, plane(2 * X, 4.4), H.toon({ color: 0xe8dcc0, side: THREE.DoubleSide }), 0, HT, ZB + 2, Math.PI / 2, 0, 0, false);
  for (const [y0, y1, c] of [[0, 0.14, 0x5a3a24], [0.86, 0.9, 0x6a4a2c]]) K.box(M.wood, -X, X, y0, y1, ZB, ZB + 0.03, c, 0.005);
  // window (left of the back wall) onto a snowy night street
  K.box(M.paint, -2.15, -0.95, 0.95, 2.15, ZB - 0.02, ZB + 0.06, 0xf2ece0, 0.01); mesh(root, plane(1.05, 1.05), M.winHome, -1.55, 1.55, ZB + 0.065, 0, 0, 0, false); K.box(M.paint, -1.58, -1.52, 1.0, 2.1, ZB + 0.06, ZB + 0.09, 0xf2ece0, 0.005); K.box(M.paint, -2.1, -1.0, 1.52, 1.58, ZB + 0.06, ZB + 0.09, 0xf2ece0, 0.005);
  for (const s of [-1, 1]) K.box(M.fabric, -1.55 + s * 0.68 - 0.12, -1.55 + s * 0.68 + 0.12, 0.9, 2.25, ZB + 0.06, ZB + 0.14, 0xffffff, 0.04);
  // ship painting (generic four-funnel liner at dusk) above the side table
  K.box(M.wood, 0.55, 1.75, 1.4, 2.2, ZB, ZB + 0.04, 0x8a6a30, 0.01); mesh(root, plane(1.08, 0.68), M.painting, 1.15, 1.8, ZB + 0.045, 0, 0, 0, false);
  // armchair (right), side table + lamp, radio, loaf on a plate
  K.at(1.6, 0, -1.1, -0.4, () => { K.box(M.fabric, -0.45, 0.45, 0.2, 0.45, -0.4, 0.4, 0xffffff, 0.06); K.box(M.fabric, -0.45, 0.45, 0.45, 1.15, -0.45, -0.25, 0xffffff, 0.08); for (const s of [-1, 1]) K.box(M.fabric, s * 0.45 - 0.1, s * 0.45 + 0.1, 0.2, 0.7, -0.4, 0.4, 0xffffff, 0.06); for (const [x, z] of [[-0.38, -0.33], [0.38, -0.33], [-0.38, 0.33], [0.38, 0.33]]) K.box(M.wood, x - 0.03, x + 0.03, 0, 0.2, z - 0.03, z + 0.03, 0x4a2a18, 0.005); });
  K.box(M.wood, 0.45, 0.95, 0.6, 0.65, ZB + 0.3, ZB + 0.8, 0x6a4024, 0.01); for (const [x, z] of [[0.5, 0.35], [0.9, 0.35], [0.5, 0.75], [0.9, 0.75]]) K.box(M.wood, x - 0.02, x + 0.02, 0, 0.6, ZB + z - 0.02, ZB + z + 0.02, 0x4a2a18, 0.005);
  K.put(M.brass, cyl(0.02, 0.02, 0.45, 8), 0.6, 0.88, ZB + 0.5, 0, 0, 0, 1, 1, 1, 0xc8a050); K.put(M.paint, cyl(0.1, 0.2, 0.24, 16, true), 0.6, 1.14, ZB + 0.5, 0, 0, 0, 1, 1, 1, 0xf2dca8); lamp(K, root, 0.6, 1.08, ZB + 0.5, glows, 1.1, 0.55);
  K.box(M.wood, 0.72, 0.94, 0.65, 0.82, ZB + 0.38, ZB + 0.6, 0x7a4a2a, 0.03); K.put(M.paint, cyl(0.05, 0.05, 0.01, 14), 0.83, 0.74, ZB + 0.605, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8c890);
  K.box(M.wood, -0.9, 0.2, 0.68, 0.72, -1.2, -0.6, 0x7a4a2a, 0.01); for (const [x, z] of [[-0.85, -1.15], [0.15, -1.15], [-0.85, -0.65], [0.15, -0.65]]) K.box(M.wood, x - 0.025, x + 0.025, 0, 0.68, z - 0.025, z + 0.025, 0x4a2a18, 0.005);
  K.put(M.paint, cyl(0.2, 0.18, 0.02, 20), -0.35, 0.73, -0.9, 0, 0, 0, 1, 1, 1, 0xf4f0e8); loaf(K, -0.35, 0.74, -0.9, 0.13, R); K.put(M.paint, cyl(0.04, 0.035, 0.1, 12), 0.0, 0.77, -0.8, 0, 0, 0, 1, 1, 1, 0xf2ece0);
  K.build(root, 3);
  return { glows, ZB }; }

// ================================================================= lights, grades, API
const NIGHT = { top: '#04071a', hor: '#141c40', fog: '#0c1230', fogN: 40, fogF: 600, sky: '#4a5ab0', ground: '#0a0e22', hemiI: 0.7, fillCol: '#3a4cb0', fillI: 0.28, sunCol: '#8a9ae8', sunI: 0.75, az: 140, el: 40, disc: '#000000', discSize: 0.0001, stars: 1, clouds: false, cardTint: '#d0dcff', fxTint: '#e8ecff', shafts: 0 };
const SET_LIGHT = {
  galley: { top: '#000000', hor: '#3a2a1e', fog: '#3a2a1e', fogN: 10, fogF: 50, sky: '#ffe8d0', ground: '#6a4a32', hemiI: 0.85, fillCol: '#8a90c8', fillI: 0.24, sunCol: '#ffd8a8', sunI: 1.1, az: 20, el: 60, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
  deck: { ...NIGHT },
  deckBerg: { ...NIGHT, sunI: 1.0, hemiI: 0.8 },
  cabin: { top: '#000000', hor: '#2a1c14', fog: '#2a1c14', fogN: 6, fogF: 30, sky: '#ffd8b0', ground: '#4a3020', hemiI: 0.6, fillCol: '#6a70c0', fillI: 0.24, sunCol: '#ffc890', sunI: 0.8, az: -40, el: 50, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ffe8d8', fxTint: '#ffffff', shafts: 0 },
  stern: { ...NIGHT, fogF: 500 },
  ocean: { ...NIGHT, top: '#02040f', hor: '#0e1636', fog: '#0a1028', fogN: 30, fogF: 420, hemiI: 0.75, sunCol: '#9aaaf0', sunI: 0.7, cardTint: '#c8d8ff' },
  oceanDawn: { ...NIGHT, top: '#0a1030', hor: '#5a5a90', fog: '#2a3060', fogN: 30, fogF: 420, hemiI: 0.9, sunCol: '#c8b8f0', sunI: 0.9, cardTint: '#e0e4ff', stars: 0.5 },
  home: { top: '#000000', hor: '#3a2a1e', fog: '#3a2a1e', fogN: 10, fogF: 40, sky: '#ffe0c0', ground: '#6a4a32', hemiI: 1.15, fillCol: '#8a90c8', fillI: 0.24, sunCol: '#ffd8a8', sunI: 0.9, az: -30, el: 50, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  galley: { look: 'office', over: { exp: 0.92, con: 1.2, sat: 0.92, lift: [0.035, 0.022, 0.03], tS: ['#4a2a5a', 0.14], tH: ['#ffc888', 0.14], bloom: [0.45, 0.72], hal: [0.32, '#ff8a40'], vig: [0.3, 0.46, '#2a1410'] } },
  cabin: { look: 'office', over: { exp: 0.9, con: 1.24, sat: 1.0, lift: [0.03, 0.02, 0.04], tS: ['#2a2a6a', 0.2], tH: ['#ffc080', 0.14], bloom: [0.45, 0.7], hal: [0.34, '#ff9a50'], vig: [0.4, 0.42, '#1a1018'] } },
  deck: { look: 'night', over: { exp: 1.16, con: 1.24, sat: 1.06, lift: [0.02, 0.026, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffd090', 0.14], bloom: [0.5, 0.62], hal: [0.42, '#ffb060'], vig: [0.38, 0.42, '#040818'] } },
  deckBerg: { look: 'night', over: { exp: 1.2, con: 1.24, sat: 1.0, lift: [0.025, 0.03, 0.07], tS: ['#1a2a7a', 0.3], tH: ['#e8f0ff', 0.12], bloom: [0.5, 0.62], hal: [0.36, '#a0c0ff'], vig: [0.38, 0.42, '#040818'] } },
  stern: { look: 'night', over: { exp: 1.14, con: 1.26, sat: 1.04, lift: [0.02, 0.026, 0.06], tS: ['#1a2a7a', 0.28], tH: ['#ffd090', 0.14], bloom: [0.5, 0.6], hal: [0.42, '#ffb060'], vig: [0.4, 0.4, '#040818'] } },
  ocean: { look: 'night', over: { exp: 1.18, con: 1.22, sat: 0.86, lift: [0.02, 0.03, 0.075], tS: ['#14267a', 0.34], tH: ['#c8dcff', 0.12], bloom: [0.5, 0.62], hal: [0.3, '#8ab0ff'], vig: [0.42, 0.4, '#020616'] } },
  oceanDawn: { look: 'night', over: { exp: 1.2, con: 1.2, sat: 0.92, lift: [0.03, 0.03, 0.07], tS: ['#2a2a7a', 0.26], tH: ['#ffd8c8', 0.14], bloom: [0.5, 0.62], hal: [0.3, '#ffb0a0'], vig: [0.4, 0.42, '#0a0a20'] } },
  home: { look: 'office', over: { exp: 1.1, con: 1.22, sat: 1.06, lift: [0.035, 0.024, 0.03], tS: ['#3a2a6a', 0.14], tH: ['#ffd098', 0.12], bloom: [0.45, 0.72], hal: [0.3, '#ff9a50'], vig: [0.3, 0.46, '#2a1410'] } },
};
const GROUP_OF = { galley: 'galley', deck: 'deck', deckBerg: 'deck', cabin: 'cabin', stern: 'stern', ocean: 'ocean', oceanDawn: 'ocean', home: 'home' };

export function buildTitanic(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  let ga, dk, cb, st, oc, hm;
  const API = makeAPI(ctx, { prefix: 'ti_', origin: TI_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE, base: { galley: 'office', cabin: 'office', home: 'office', deck: 'explain', deckBerg: 'explain', stern: 'explain', ocean: 'explain', oceanDawn: 'explain' },
    practicals: (name, F, W3) => { const fl = 1 + 0.1 * Math.sin(F * 0.9) * Math.sin(F * 0.37);
      if (name === 'galley') return [{ p: W3('galley', [-1.6, 0.9, -1.2]), col: '#ff8a3a', I: 2.6 * fl, d: 4 }, { p: W3('galley', [0.9, 0.9, -1.2]), col: '#ff8a3a', I: 2.6 * fl, d: 4 }, { p: W3('galley', [-1.4, 2.0, -0.6]), col: '#fff0d8', I: 2, d: 6 }, { p: W3('galley', [1.4, 2.0, -0.6]), col: '#fff0d8', I: 2, d: 6 }];
      if (name === 'cabin') return [{ p: W3('cabin', [-0.35, 1.75, -1.1]), col: '#ffc070', I: 2.4, d: 4 }, { p: W3('cabin', [0.4, 1.4, 1.2]), col: '#ffd0a0', I: 1.0, d: 5 }];
      if (name === 'home') return [{ p: W3('home', [0.6, 1.1, -1.6]), col: '#ffc070', I: 4.5, d: 6 }, { p: W3('home', [0, 2.0, 1.0]), col: '#ffd8b0', I: 2.2, d: 7 }];
      if (name === 'deck' || name === 'deckBerg') return [{ p: W3('deck', [4.2, 2.0, -2.4]), col: '#ffc890', I: 4, d: 7 }, { p: W3('deck', [5.6, 1.6, -2.0]), col: '#ffc070', I: 3.5, d: 7 }, { p: W3('deck', [-6.8, 1.6, -2.0]), col: '#ffc070', I: 3.5, d: 7 }, { p: W3('deck', [0, 2.2, 5.0]), col: '#ffc890', I: 3, d: 8 }];
      if (name === 'stern') { const P = st.pivot; const w = (p) => { const v = new THREE.Vector3(...p); P.updateMatrixWorld(); return P.localToWorld(v).toArray(); }; return [{ p: w([-3.3, 1.6, -5.0]), col: '#ffc070', I: 4, d: 8 }, { p: w([3.3, 1.6, -5.0]), col: '#ffc070', I: 4, d: 8 }, { p: w([0, 1.6, 0]), col: '#ffc070', I: 3, d: 8 }]; }
      if (name === 'ocean' || name === 'oceanDawn') { oc.life.updateMatrixWorld(); const lp = oc.life.localToWorld(new THREE.Vector3(2.0, 1.75, 0)).toArray(); return [{ p: lp, col: '#ffc070', I: 4 * fl, d: 9 }]; }
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'galley' && ga) { ga.ovens.forEach((m, i) => m.material.color.setRGB(1.8 * (0.9 + 0.1 * Math.sin(f * 0.5 + i)), 0.85 * (0.9 + 0.1 * Math.sin(f * 0.5 + i)), 0.2)); tickMotes(ga.dust, f, 0.4); }
      if (cur === 'ocean' && oc) { oc.bob.forEach(([g, ph]) => { g.position.y = 0.04 * Math.sin(T * 1.3 + ph); g.rotation.z = 0.05 * Math.sin(T * 1.1 + ph); }); for (const m of [M.sea.map, M.seaNear.map]) m.offset.set(f * 0.0004, f * 0.00025); oc.mists.forEach((m, i) => (m.position.x = (i - 1) * 20 + Math.sin(T * 0.2 + i) * 3)); }
      if (cur === 'stern' && st) { for (const m of [M.sea.map, M.seaNear.map]) m.offset.set(f * 0.0004, f * 0.00025); }
      if (cur === 'deck' && dk) { M.sea.map.offset.set(f * 0.0003, f * 0.0002); } },
    apply: (v) => { if (v.lower != null) API.lower(v.lower); if (v.berg != null) API.berg(v.berg); if (v.tilt != null || v.sink != null) API.stern(v.tilt ?? 0, v.sink ?? 0); if (v.boat != null) API.boatAt(...v.boat); if (v.fly != null) API.fly(0, v.fly); } });
  ga = buildGalley(API.groups.galley); dk = buildDeck(API.groups.deck); cb = buildCabin(API.groups.cabin); st = buildStern(API.groups.stern); oc = buildOcean(API.groups.ocean); hm = buildHome(API.groups.home);
  for (const g of Object.values(API.groups)) g.traverse((o) => { if (o.isMesh && [M.tileW, M.panel, M.wpHome].includes(o.material)) o.receiveShadow = false; });
  API.parts = { ga, dk, cb, st, oc, hm };
  // [JG-sets] state setters
  API.lower = (k) => { const b = dk.boats[1]; b.position.y = 1.4 - 0.85 * clamp01(k); };
  API.fly = (i, t, x0 = 0.9) => { const g = dk.flyers[i]; g.visible = t > 0 && t < 1; if (!g.visible) return; const u = clamp01(t); g.position.set(x0 + 0.5 * u + i * 0.3, 1.7 + 2.2 * u - 9 * u * u, -1.5 - 3.5 * u); g.rotation.set(1.2 * u + i, 0.5 + 2 * u, 0.8 * u); };
  API.berg = (k) => { dk.berg.visible = k > 0.001; dk.berg.position.set(-70 + 85 * k, -18, -150); };
  API.stern = (tilt, sink) => { st.pivot.rotation.x = tilt; st.pivot.position.y = 6 - sink; st.pivot.updateMatrixWorld(true); };
  API.sternW = (p) => { st.pivot.updateMatrixWorld(true); const v = st.pivot.localToWorld(new THREE.Vector3(...p)); return v.toArray(); };
  API.boatAt = (x, z, ry = -0.4) => { oc.life.position.set(x, 0, z); oc.life.rotation.y = ry; };
  API.glows = { galley: ga.glows, deck: dk.glows, cabin: cb.glows, stern: st.glows, ocean: oc.glows, home: hm.glows };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  const V = API.V;
  API.views = [
    V('galley', [0.4, 1.55, 2.4], [-0.2, 1.1, -2.6], 56, 1.6, [0, 1.0, -0.8]),                 // 0 galley wide
    V('galley', [-0.6, 1.25, 0.3], [-1.6, 1.0, -1.7], 48, 3, [-1.6, 0.95, -1.6]),               // 1 oven close
    V('galley', [-1.6, 1.4, 1.2], [-3.2, 1.1, -0.8], 50, 3, [-3.0, 1.1, -0.8]),                 // 2 bread racks
    V('deck', [1.2, 1.7, 5.5], [0.0, 1.2, -3.0], 54, 1.6, [0.4, 1.0, -1.0], { lower: 0 }),     // 3 deck wide
    V('deck', [4.6, 1.5, 2.6], [4.2, 1.0, -3.2], 50, 2, [4.2, 0.9, -2.6], { lower: 1 }),       // 4 loading boat
    V('deckBerg', [-1.0, 1.6, 1.0], [-20, -2, -70], 50, 1.2, [-1.0, 1.0, -2.2], { lower: 0, berg: 0.5 }), // 5 iceberg past the rail
    V('deck', [0.5, 1.5, -0.5], [0.0, 1.6, 3.2], 54, 2, [0.0, 1.4, 2.6], { lower: 0 }),        // 6 reverse: lit deckhouse
    V('cabin', [0.1, 1.45, 1.6], [0.0, 1.0, -1.4], 56, 1.6, [0.2, 0.9, -0.6]),                 // 7 cabin wide
    V('cabin', [0.55, 1.05, -0.2], [0.7, 0.78, -0.9], 44, 4, [0.68, 0.78, -0.88]),            // 8 table: bottle + glass
    V('stern', [9, 6.5, 8], [0, 6, -1], 46, 1.4, [0, 6.5, -2], { tilt: 0.1, sink: 0 }),       // 9 stern side, slight tilt
    V('stern', [10, 4, 9], [0, 9, -2], 50, 1.2, [0, 8, -3], { tilt: 0.7, sink: 0 }),          // 10 stern steep
    V('stern', [8, 1.5, 6], [0, 3, -3], 50, 1.2, [0, 3, -4], { tilt: 1.2, sink: 8 }),        // 11 stern going under
    V('ocean', [0.6, 1.2, 4.0], [0, 0.5, -6], 54, 1.4, [0, 0.4, -2]),                          // 12 ocean wide: debris, collapsible, lifeboat
    V('ocean', [0.2, 0.7, 1.8], [-0.4, 0.4, -2], 46, 3, [-0.2, 0.3, -0.5]),                    // 13 ocean low close
    V('oceanDawn', [-0.4, 1.1, 1.5], [-1.8, 0.4, -4.2], 50, 2, [-1.8, 0.5, -4.0]),            // 14 collapsible close, dawn
    V('home', [0.3, 1.45, 2.4], [-0.1, 1.1, -2.2], 54, 1.6, [0, 1.0, -0.8]),                  // 15 home wide
  ];
  API.lower(0); API.berg(0); for (let i = 0; i < 3; i++) API.fly(i, 0); API.stern(0, 0); API.tick(0);
  return API;
}
