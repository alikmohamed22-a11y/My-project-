// cl_sets.js [CL-sets]: sets for "The first speeding ticket was for 8 mph" (Oddverra split-screen Short #1, story panel 1080x960).
// All period details are our own stylization (no real photos, no portraits, no real coats of arms). Each set: local frame, floor y = 0,
// camera side +z. Test flag ?clview=N (view index; ?clview=a: view = frame).
//   village  : Paddock Wood, Kent, a frosty January morning 1896: a gravel high street (x -3..3, along z), white weatherboard and brick
//              houses, a pub, two oast houses (round kilns, white cowls), a village sign, a horse trough, and the town notice
//              "LOCOMOTIVES 2 M.P.H." (ST.limit flips the 2 to 14). The horseless carriage (ST.car). Moods 'village' 'villageEve'.
//              origin (-160000,0,0)
//   lane     : a Kentish country lane for the chase: hedgerows, hop gardens (bare poles + wires), fields, an oast house, a milestone.
//              The carriage + (cyclist card from the story). Mood 'lane'.                                            origin (-160000,0,800)
//   court    : a small county courtroom: panelled walls, the magistrates' bench under a generic crest, the dock, the clerk's table,
//              public benches, a tall window (the horse looks in), an easel listing the charges (ST.charges 0..4). Mood 'court'.
//                                                                                                                    origin (-160000,0,1600)
//   brighton : the 14 November 1896 run: a coastal road with bunting, a LONDON -> BRIGHTON banner, a "14 M.P.H." board, a rope line
//              of spectators (story actors) and a convoy of five carriages (ST.convoy). Mood 'brighton'.          origin (-162500,0,0)
import { H, TAU, sm, SERIF, SANS, cyl, sph, plane, planeUV, mesh, nond, lumpGeo, txt, grain, glowAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit, house, storefront, props, instance } from './world.js';

export const CL_ORIGIN = { village: [-160000, 0, 0], lane: [-160000, 0, 800], court: [-160000, 0, 1600], brighton: [-162500, 0, 0] };
const GROUP_OF = { village: 'village', villageEve: 'village', lane: 'lane', court: 'court', brighton: 'brighton' };
let THREE, PT, M;
const BIG = '"Luckiest Guy", "DejaVu Sans", sans-serif';

// ---------------------------------------------------------------- painters
function plainTex(col, k = 0.12, seed = 5) { return (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 1 - k / 2 + k * PT.fbm(u, v, 4, 4, 3, seed)); }; }
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); if (!o.flat) PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * PT.fbm(u, v, 6, 2, 3, 7)); if (o.rim !== false) { g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08); }
  lines.forEach((s, i) => { const big = o.big && i === o.big - 1; txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : (o.ys ? o.ys[i] : 0.3 + i * (0.44 / (lines.length - 1)))), w * 0.84, h * (o.sz ? o.sz[i] : lines.length === 1 ? 0.5 : 0.62 / lines.length), { col: (o.cols && o.cols[i]) || o.col || '#3a2414', font: o.font || SERIF }); }); }; }
function winTex(o) { return (g, w, h) => { g.fillStyle = o.frame || '#f2ece0'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.a); gr.addColorStop(1, o.b); g.fillStyle = gr; g.fillRect(w * 0.08, h * 0.06, w * 0.84, h * 0.88);
  g.fillStyle = o.frame || '#f2ece0'; for (let i = 1; i < 3; i++) g.fillRect(w * 0.08 + i * w * 0.84 / 3 - 3, 0, 6, h); for (let j = 1; j < 4; j++) g.fillRect(0, h * 0.06 + j * h * 0.88 / 4 - 3, w, 6); }; }
function hillsTex(cols) { return (g, w, h) => { g.clearRect(0, 0, w, h); cols.forEach(([y0, c, a], k) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * y0 + Math.sin(x * 0.011 + y0 * 9 + k) * h * a + Math.sin(x * 0.029 + y0) * h * a * 0.4); g.lineTo(w, h); g.fill(); }); }; }
function frostTex(base, seed) { return (g, w, h) => { PT.grass(g, w, h, { base, seed }); const R = PT.rng(seed + 3); for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(235,245,255,${0.12 + R() * 0.3})`; g.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2); } }; }
function bannerTex(g, w, h) { g.fillStyle = '#f4ead2'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * PT.fbm(u, v, 6, 2, 3, 5)); g.strokeStyle = '#b8222a'; g.lineWidth = 14; g.strokeRect(10, 10, w - 20, h - 20);
  txt(g, 'LONDON  →  BRIGHTON', w / 2, h * 0.42, w * 0.86, h * 0.36, { col: '#1e3a7a', font: SERIF }); txt(g, '14 NOVEMBER 1896', w / 2, h * 0.76, w * 0.5, h * 0.18, { col: '#b8222a', font: SERIF }); }
function limitTex(n) { return (g, w, h) => { g.fillStyle = '#f4ecd6'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * PT.fbm(u, v, 5, 5, 3, 9)); g.strokeStyle = '#2a1e1a'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
  txt(g, 'NOTICE', w / 2, h * 0.11, w * 0.6, h * 0.08, { col: '#8a1a22', font: SERIF }); txt(g, 'LOCOMOTIVES', w / 2, h * 0.24, w * 0.84, h * 0.09, { col: '#2a1e1a', font: SERIF }); txt(g, 'NOT TO EXCEED', w / 2, h * 0.35, w * 0.7, h * 0.06, { col: '#2a1e1a', font: SERIF });
  txt(g, String(n), w / 2, h * 0.6, w * 0.8, h * 0.36, { col: n > 9 ? '#1e6a3a' : '#b8222a', font: SERIF }); txt(g, 'MILES AN HOUR', w / 2, h * 0.86, w * 0.84, h * 0.08, { col: '#2a1e1a', font: SERIF }); }; }
function chargeTex(n) { return (g, w, h) => { g.fillStyle = '#efe4c8'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * PT.fbm(u, v, 5, 5, 3, 4)); g.strokeStyle = '#3a2414'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
  txt(g, 'THE CHARGES', w / 2, h * 0.09, w * 0.8, h * 0.07, { col: '#8a1a22', font: SERIF });
  const L = ['1. NO HORSE', '2. FEWER THAN 3 IN CHARGE', '3. OVER 2 M.P.H.', '4. NO NAME & ADDRESS'];
  for (let i = 0; i < n; i++) txt(g, L[i], w / 2, h * (0.26 + i * 0.19), w * 0.86, h * (i === 0 ? 0.1 : 0.075), { col: i === 0 ? '#b8222a' : '#2a1e1a', font: SERIF }); }; }
function crestTex(g, w, h) { g.clearRect(0, 0, w, h); const P = new Path2D(); P.moveTo(w * 0.2, h * 0.22); P.lineTo(w * 0.8, h * 0.22); P.lineTo(w * 0.8, h * 0.55); P.quadraticCurveTo(w * 0.8, h * 0.85, w * 0.5, h * 0.96); P.quadraticCurveTo(w * 0.2, h * 0.85, w * 0.2, h * 0.55); P.closePath();
  g.fillStyle = '#c8a040'; g.fill(P); g.lineWidth = 10; g.strokeStyle = '#5a3a14'; g.stroke(P); g.fillStyle = '#8a1a22'; g.fillRect(w * 0.27, h * 0.3, w * 0.46, h * 0.18); g.fillStyle = '#1e3a7a'; g.fillRect(w * 0.27, h * 0.5, w * 0.46, h * 0.2);
  g.fillStyle = '#e8c860'; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(w * (0.3 + i * 0.1), h * 0.2); g.lineTo(w * (0.35 + i * 0.1), h * 0.04); g.lineTo(w * (0.4 + i * 0.1), h * 0.2); g.fill(); } g.fillRect(w * 0.3, h * 0.14, w * 0.4, h * 0.08); }
function buntingTex(g, w, h) { g.clearRect(0, 0, w, h); const C = ['#c8282e', '#f4f0e6', '#1e3a8a']; for (let i = 0; i < 12; i++) { g.fillStyle = C[i % 3]; g.beginPath(); g.moveTo(i * w / 12 + 2, 0); g.lineTo((i + 1) * w / 12 - 2, 0); g.lineTo((i + 0.5) * w / 12, h * 0.9); g.fill(); } g.fillStyle = '#3a2a22'; g.fillRect(0, 0, w, 4); }
function oastCowlTex(g, w, h) { g.fillStyle = '#f4f2ea'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(60,60,70,0.35)'; g.lineWidth = 3; for (let i = 0; i < 10; i++) { g.beginPath(); g.moveTo(i * w / 10, 0); g.lineTo(i * w / 10, h); g.stroke(); } }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.white = vc(); m.paint = vc();
  m.road = vc({ map: T(512, 512, (g, w, h) => PT.dirt(g, w, h, { base: '#b8a080', ruts: [[0.33, 0.04], [0.67, 0.04]], seed: 18 })) }); m.road.map.wrapS = m.road.map.wrapT = THREE.RepeatWrapping;
  m.frost = vc({ map: T(512, 512, frostTex('#6a8a5a', 31)) }); m.frost.map.wrapS = m.frost.map.wrapT = THREE.RepeatWrapping;
  m.field = vc({ map: T(512, 512, (g, w, h) => PT.grass(g, w, h, { base: '#7aa04a', seed: 41 })) }); m.field.map.wrapS = m.field.map.wrapT = THREE.RepeatWrapping;
  m.brick = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#a04a34', rows: 30, cols: 7, seed: 61 })) }); m.brick.map.wrapS = m.brick.map.wrapT = THREE.RepeatWrapping;
  m.brickD = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#7a3a2c', rows: 30, cols: 7, seed: 62 })) });
  m.tile = vc({ map: T(256, 256, (g, w, h) => PT.shingles(g, w, h, { base: '#9a4a36', n: 14, seed: 51 })) });
  m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 8, seed: 51 })) }); m.panel = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#6a3e26', n: 5, seed: 33 })) }); m.panel.map.wrapS = m.panel.map.wrapT = THREE.RepeatWrapping;
  m.floor = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a6040', n: 10, seed: 71 })) }); m.floor.map.wrapS = m.floor.map.wrapT = THREE.RepeatWrapping;
  m.plaster = vc({ map: T(256, 256, plainTex('#e6d8bc', 0.12, 7)) });
  m.hedge = vc({ map: T(256, 256, (g, w, h) => PT.grass(g, w, h, { base: '#3f6a34', seed: 77 })) });
  m.leaf = vc(); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.metal = vc({ emissive: 0x0c0c12 });
  m.cowl = toon({ map: T(128, 128, oastCowlTex), emissive: 0x1a1a1a });
  m.winLit = new THREE.MeshBasicMaterial({ map: T(128, 192, winTex({ a: '#ffe08a', b: '#ff9a40' })), fog: false }); m.winLit.color.setScalar(1.05);
  m.winDay = toon({ map: T(128, 192, winTex({ a: '#c8dcf0', b: '#7a90b8', frame: '#f2ece0' })), emissive: 0x1a2030 }); m.winDay.emissiveMap = m.winDay.map;
  m.hillsW = new THREE.MeshBasicMaterial({ map: T(1024, 256, hillsTex([[0.42, '#a8b8c8', 0.05], [0.58, '#8aa08a', 0.06], [0.72, '#6a8a5a', 0.05]])), transparent: true, fog: false, depthWrite: false });
  m.sea = toon({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#3a7aa8'; g.fillRect(0, 0, w, h); const R = PT.rng(9); g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 2; for (let i = 0; i < 50; i++) { const x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 8, y - 3, x + 18, y); g.stroke(); } }), emissive: 0x0a1a2a }); m.sea.map.wrapS = m.sea.map.wrapT = THREE.RepeatWrapping;
  const sign = (lines, o, w = 512, h = 160) => em(T(w, h, signTex(lines, o)), 0x201810, { side: THREE.DoubleSide });
  m.signs = { pw: sign(['PADDOCK WOOD'], { bg: '#f4ecd6', col: '#2a1e1a', rim: '#2a1e1a' }, 512, 120), pub: sign(['THE HOP POLE'], { bg: '#2a4a3a', col: '#f2e2b0', rim: '#d8b060' }, 512, 140),
    mile: sign(['PADDOCK', 'WOOD', '5'], { bg: '#e8e4d8', col: '#2a1e1a', rim: false, ys: [0.22, 0.42, 0.75], sz: [0.16, 0.16, 0.34] }, 200, 260), court: sign(['PETTY SESSIONS'], { bg: '#1e2a4a', col: '#f2e2b0', rim: '#d8b060' }, 512, 120),
    fourteen: sign(['14 M.P.H.'], { bg: '#f4ecd6', col: '#1e6a3a', rim: '#1e6a3a' }, 400, 160), smithy: sign(['SMITHY'], { bg: '#4a2a1e', col: '#f2e2b0', rim: '#d8b060' }, 400, 120) };
  m.limit = [2, 14].map((n) => em(T(400, 520, limitTex(n)), 0x201810, { side: THREE.DoubleSide }));
  m.charges = [0, 1, 2, 3, 4].map((n) => em(T(512, 512, chargeTex(n)), 0x201810, { side: THREE.DoubleSide }));
  m.crest = new THREE.MeshBasicMaterial({ map: T(256, 256, crestTex), transparent: true }); m.crest.color.setScalar(0.85);
  m.banner = em(T(1024, 256, bannerTex), 0x201810, { side: THREE.DoubleSide }); m.bunting = toon({ map: T(512, 64, buntingTex), transparent: true, side: THREE.DoubleSide, alphaTest: 0.4, emissive: 0x201010 });
  m.outside = new THREE.MeshBasicMaterial({ map: T(1024, 360, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8ab0e0'); gr.addColorStop(0.6, '#e8eef4'); g.fillStyle = gr; g.fillRect(0, 0, w, h); hillsTex([[0.55, '#9ab890', 0.05], [0.7, '#7a9a6a', 0.04]])(g, w, h); }), fog: false }); m.outside.color.setScalar(0.72);
  m.rope = vc({ emissive: 0x100808 }); m.gold = toon({ color: 0xd8a83a, emissive: 0x4a3008 });
  return m; }

// ---------------------------------------------------------------- pieces
const prism = (w, h, d) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); g.computeVertexNormals(); return g; };
function oast(K, x, z, ry = 0, s = 1) { K.at(x, 0, z, ry, () => { // round kiln + cone roof + white cowl, with a weatherboard barn (stowage) attached
  K.put(M.brick, cyl(2.4 * s, 2.5 * s, 5.2 * s, 20), 0, 2.6 * s, 0, 0, 0, 0, 1, 1, 1, 0xffffff); K.put(M.tile, new THREE.ConeGeometry(2.6 * s, 4.2 * s, 20), 0, 5.2 * s + 2.1 * s, 0, 0, 0, 0, 1, 1, 1, 0xb85a40);
  K.put(M.cowl, cyl(0.45 * s, 0.6 * s, 1.0 * s, 10), 0, 9.6 * s, 0, 0, 0, 0, 1, 1, 1, 0xffffff); K.put(M.cowl, new THREE.BoxGeometry(1.1 * s, 0.9 * s, 0.8 * s), 0.25 * s, 10.2 * s, 0, 0, 0, 0.25, 1, 1, 1, 0xf4f2ea); K.put(M.white, new THREE.BoxGeometry(0.12 * s, 0.6 * s, 0.12 * s), 0.9 * s, 10.3 * s, 0, 0, 0, 0, 1, 1, 1, 0xe8e4dc);
  K.box(M.white, 2.0 * s, 9.5 * s, 0, 5.4 * s, -2.6 * s, 2.6 * s, 0xf2ece0, 0.02); K.put(M.tile, prism(5.8 * s, 2.6 * s, 7.9 * s), 5.75 * s, 5.4 * s, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0xa04a36);
  for (let i = 0; i < 3; i++) K.put(M.winDay, plane(0.7, 0.9), 3.5 * s + i * 2.0 * s, 3.6 * s, 2.62 * s, 0, 0, 0, 1, 1, 1); K.box(M.wood, 5.2 * s, 6.6 * s, 0, 2.4 * s, 2.55 * s, 2.7 * s, 0x6a4a30, 0.01); }); }
function hedge(K, x, z0, z1, h = 1.5, R) { for (let z = z0; z < z1; z += 1.2) K.put(M.hedge, lumpGeo(Math.floor(z * 7) % 9 + 3, 1, 0.3), x + (R() - 0.5) * 0.2, h * 0.5, z, 0, R() * 6, 0, 0.9, h * 0.62, 0.9, [0x5a8a44, 0x6a9a4a, 0x4e7a3e][Math.floor(R() * 3)]); }
function bareTree(K, x, z, s, R) { K.beam(M.bark, [x, 0, z], [x + 0.2 * s, 3.4 * s, z], 0.2 * s, 0x5a4636, true, 7);
  for (let i = 0; i < 7; i++) { const a = R() * TAU, up = 2.0 + R() * 1.6; K.beam(M.bark, [x + 0.1 * s, up * s, z], [x + Math.cos(a) * 1.5 * s, (up + 1.2 + R()) * s, z + Math.sin(a) * 1.5 * s], 0.06 * s, 0x5a4636, true, 5); }
  for (let i = 0; i < 5; i++) K.put(M.leaf, lumpGeo(i + 11, 1, 0.3), x + (R() - 0.5) * 2.2 * s, (4.0 + R() * 1.2) * s, z + (R() - 0.5) * 2 * s, 0, R() * 6, 0, 1.0 * s, 0.7 * s, 1.0 * s, [0x5a6a3a, 0x6a7a44, 0x4a5a32][i % 3]); }
function lampPost(root, K, x, z, h = 2.9) { K.beam(M.metal, [x, 0, z], [x, h, z], 0.05, 0x1e1c24, true, 6); mesh(root, cyl(0.1, 0.12, 0.28, 6), H.M.lampGlass, x, h + 0.18, z, 0, 0, 0, false); K.put(M.metal, new THREE.ConeGeometry(0.18, 0.16, 6), x, h + 0.4, z, 0, 0, 0, 1, 1, 1, 0x1e1c24); }
function signPost(root, K, mat, x, z, ry, w, h, y = 1.6) { K.beam(M.wood, [x - w * 0.53 * Math.cos(ry), 0, z + w * 0.53 * Math.sin(ry)], [x - w * 0.53 * Math.cos(ry), y + h / 2, z + w * 0.53 * Math.sin(ry)], 0.05, 0x5a3a24, true, 5);
  K.beam(M.wood, [x + w * 0.53 * Math.cos(ry), 0, z - w * 0.53 * Math.sin(ry)], [x + w * 0.53 * Math.cos(ry), y + h / 2, z - w * 0.53 * Math.sin(ry)], 0.05, 0x5a3a24, true, 5);
  return mesh(root, plane(w, h), mat, x, y, z, 0, ry, 0, false); }
function cloneCar(src, body, dark) { // clone the engine's horseless carriage (faces +z) and repaint the red panels
  const c = src.clone(true); c.visible = true; const re = new Map();
  c.traverse((o) => { if (o.isMesh && o.material && o.material.color) { const hx = o.material.color.getHex(); if (hx === 0xb8262a || hx === 0x8e1c22) { const k = hx + '|' + body; if (!re.has(k)) { const m2 = o.material.clone(); m2.color.set(hx === 0xb8262a ? body : dark); re.set(k, m2); } o.material = re.get(k); } } });
  c.body = c.children[0]; c.wheels = c.children.slice(1, 5); [0.44, 0.44, 0.5, 0.5].forEach((r, i) => { if (c.wheels[i]) c.wheels[i].r = r; }); const st = c.body.children.find((o) => o.isGroup && o.children.length > 2 && o.children[0].geometry && o.children[0].geometry.type === 'TorusGeometry'); if (st) st.visible = false;
  return c; }
function driveCar(c, s, f) { // s: {x, z, yaw, dist, run, bang}
  if (!c) return; c.visible = s.vis !== false; if (!c.visible) return; const run = s.run ?? 1; c.position.set(s.x, 0.02 * Math.abs(Math.sin(f * 0.9)) * run, s.z); c.rotation.set(0, s.yaw || 0, 0);
  for (const wh of c.wheels) wh.rotation.x = (s.dist || 0) / (wh.r || 0.47);
  c.body.position.y = run * (0.025 * Math.sin(f * 1.7) + 0.035 * Math.max(0, Math.sin(f * 0.37))) + 0.006 * Math.sin(f * 3.1);
  c.body.rotation.z = run * 0.018 * Math.sin(f * 0.53) + (s.lean || 0); c.body.rotation.x = run * 0.012 * Math.sin(f * 0.71) - (s.dip || 0); }
function puffs(root, n, seed) { const R = PT.rng(seed), P = []; for (let i = 0; i < n; i++) { const m = nond(mesh(root, sph(0.5, 8, 6), H.toon({ color: 0xe8e4e0, transparent: true, opacity: 0.7, emissive: 0x404040 }), 0, -10, 0, 0, 0, 0, false)); m.renderOrder = 4; P.push({ m, d: R(), a: R() * TAU }); } return P; }
function tickPuffs(P, src, back, f, on) { if (!P) return; P.forEach((p, i) => { const u = ((f * 0.045 + p.d) % 1); p.m.visible = on && !!src; if (!p.m.visible) return; p.m.position.set(src[0] + back[0] * u * 2.2 + Math.cos(p.a) * 0.2 * u, src[1] + 0.4 * u, src[2] + back[2] * u * 2.2 + Math.sin(p.a) * 0.2 * u); p.m.scale.setScalar(0.12 + u * 0.5); p.m.material.opacity = 0.22 * (1 - u) * Math.min(1, u * 5); }); }

// ================================================================= VILLAGE (Paddock Wood, January 1896)
function buildVillage(root, carSrc) { const R = PT.rng(1896), K = new Kit(), PF = props();
  mesh(root, planeUV(6, 120, 2, 30), M.road, 0, 0.005, -40, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  for (const s of [-1, 1]) mesh(root, planeUV(60, 120, 15, 30), M.frost, s * 33, 0, -40, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  for (const s of [-1, 1]) K.box(M.white, s * 3.0 - 0.06, s * 3.0 + 0.06, 0, 0.08, -100, 20, 0xb8b0a0, 0.01);
  // houses (white weatherboard / brick), both sides, fronts to the road
  const walls = [0xf4f0e6, 0xe8dcc4, 0xf2ece2, 0xd8c8b0]; let z = 8;
  for (let i = 0; z > -64; i++) { const w = 6 + R() * 2, d = 5.5; z -= w / 2;
    for (const s of [-1, 1]) { if (s > 0 && Math.abs(z + 14) < 5) continue; if (s < 0 && Math.abs(z + 30) < 10) continue; const x = s * (8 + d / 2 + R() * 0.6);
      K.at(x, 0, z, -s * Math.PI / 2, () => house(K, { w, d, floors: R() < 0.55 ? 2 : 1, wall: R() < 0.35 ? 0xb06a50 : walls[(i + (s > 0 ? 1 : 0)) % 4], trim: 0xf4efe2, roof: R() < 0.5 ? 0x9a4a36 : 0x5a4a4a, porch: false, rise: 2.4, shutter: R() < 0.4 ? 0x2f4a3a : undefined })); }
    z -= w / 2 + 1.2; }
  // the pub (right, z = -14) and the smithy
  K.at(9.5, 0, -14, -Math.PI / 2, () => storefront(K, { w: 8, d: 7, floors: 2, brick: true, trim: 0xf2ece0, sign: 'THE HOP POLE', door: 0x2a4a3a, curtain: 0xf2eee2, shutter: 0x2f4a3a }));
  // oast houses behind the left row and far right
  oast(K, -14.5, -30, 0.3); oast(K, 22, -52, -2.6, 1.1); oast(K, -26, -78, 0.8, 1.2);
  // village sign, notice post (limit), horse trough, lamps, fences, barrels, trees
  const pw = signPost(root, K, M.signs.pw, -3.9, 4.0, 0.25, 1.9, 0.45, 1.5);
  const limit = signPost(root, K, M.limit[0], 3.85, -4.0, -0.5, 0.95, 1.24, 1.55); limit.castShadow = true;
  K.box(M.wood, -4.6, -3.4, 0, 0.62, -9.2, -8.2, 0x7a5a3e, 0.03); mesh(root, plane(1.0, 0.8), H.toon({ color: 0x5a7a9a, emissive: 0x1a2a3a }), -4.0, 0.6, -8.7, -Math.PI / 2, 0, 0, false);
  for (const [x, z2] of [[-3.5, -2], [3.5, -12], [-3.5, -22], [3.5, -32], [-3.5, -44]]) lampPost(root, K, x, z2);
  instance(root, PF.barrel, [[4.2, 0, -10.5, 0.4, 0.9], [4.6, 0, -11.2, 1.2, 0.85]]);
  instance(root, PF.crate, [[-4.3, 0, -16, 0.3, 1], [-4.5, 0.62, -16.1, 0.9, 0.9]]);
  for (const s of [-1, 1]) for (let zz = 6; zz > -60; zz -= 18) K.at(s * 5.2, 0, zz, s > 0 ? Math.PI / 2 : -Math.PI / 2, () => { for (let k = 0; k < 6; k++) K.box(M.white, -2.4 + k * 0.8 - 0.04, -2.4 + k * 0.8 + 0.04, 0, 0.9, -0.03, 0.03, 0xf2eee4, 0.01); K.box(M.white, -2.4, 2.4, 0.6, 0.66, -0.04, 0.04, 0xf2eee4, 0.01); });
  for (const [x, z2, s] of [[-6.5, 2, 1.0], [7, -24, 1.1], [-7, -40, 1.0], [6.5, -58, 1.2], [-14, -8, 1.3], [16, -6, 1.2]]) bareTree(K, x, z2, s, R);
  K.build(root, 12);
  const hills = mesh(root, plane(420, 70), M.hillsW, 0, 8, -140, 0, 0, 0, false); hills.renderOrder = -2; nond(hills);
  const car = cloneCar(carSrc, 0x2f5a3a, 0x24452e); root.add(car);
  const smoke = puffs(root, 10, 7);
  const frostMotes = motes(root, 70, [-4, 4, 0.3, 4, -12, 4], 96, 0.012);
  return { car, limit, pw, smoke, frostMotes }; }

// ================================================================= LANE (the chase)
function buildLane(root, carSrc) { const R = PT.rng(1897), K = new Kit(), PF = props();
  mesh(root, planeUV(5, 400, 2, 100), M.road, 0, 0.005, -160, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  for (const s of [-1, 1]) mesh(root, planeUV(200, 400, 50, 100), M.frost, s * 102.5, 0, -160, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  hedge(K, -3.6, -330, 30, 1.15, R); hedge(K, 3.6, -330, -120, 1.15, R); hedge(K, 3.6, 8, 30, 1.15, R); /* the chase stretch (z -120..8) has a low rail on the right so side cameras see the road */
  for (let z = 8; z > -120; z -= 2.4) { K.box(M.wood, 3.55, 3.67, 0, 0.9, z - 0.06, z + 0.06, 0x8a7258, 0.01); } K.beam(M.wood, [3.6, 0.7, 8], [3.6, 0.7, -120], 0.05, 0x8a7258); K.beam(M.wood, [3.6, 0.35, 8], [3.6, 0.35, -120], 0.05, 0x8a7258);
  // hop garden (left): rows of tall bare poles with wires; field (right) with an oast house and trees
  const poles = []; for (let z = 10; z > -300; z -= 6) for (let x = -8; x > -40; x -= 4) poles.push([x + (R() - 0.5) * 0.2, 0, z, R(), 1, 0, 1]);
  { const pk = new Kit(); pk.beam(M.bark, [0, 0, 0], [0, 4.6, 0], 0.06, 0x7a6a54, true, 5); instance(root, pk.prefab(), poles, true); }
  for (let x = -8; x > -40; x -= 4) K.beam(M.metal, [x, 4.5, 12], [x, 4.5, -300], 0.012, 0x4a4a4a, false, 3);
  oast(K, 22, -40, -2.2, 1.0); oast(K, 34, -120, -2.6, 1.1); oast(K, -48, -160, 0.5, 1.1);
  for (let z = 0; z > -300; z -= 22 + R() * 14) bareTree(K, 5.5 + R() * 3, z, 0.9 + R() * 0.4, R);
  for (const [x, z2] of [[18, -20], [26, -70], [14, -100], [30, -170]]) bareTree(K, x, z2, 1.2, R);
  // milestone (right verge) + a field gate
  K.box(M.white, 3.9, 4.35, 0, 0.75, -26.2, -25.8, 0xe8e4d8, 0.06); mesh(root, plane(0.4, 0.52), M.signs.mile, 4.12, 0.42, -25.79, 0, 0, 0, false);
  K.at(3.4, 0, -60, -Math.PI / 2, () => { for (let k = 0; k < 5; k++) K.box(M.wood, -1.6, 1.6, 0.2 + k * 0.22, 0.28 + k * 0.22, -0.04, 0.04, 0x8a7258, 0.01); K.beam(M.wood, [-1.6, 0.2, 0], [1.6, 1.1, 0], 0.07, 0x8a7258); });
  K.build(root, 12);
  const hills = mesh(root, plane(900, 120), M.hillsW, 0, 10, -330, 0, 0, 0, false); hills.renderOrder = -2; nond(hills);
  const car = cloneCar(carSrc, 0x2f5a3a, 0x24452e); root.add(car);
  const smoke = puffs(root, 10, 9);
  return { car, smoke }; }

// ================================================================= COURT
function buildCourt(root) { const R = PT.rng(1898), K = new Kit(), X = 5.2, ZB = -4.6, HT = 5.2;
  mesh(root, planeUV(12, 12, 4, 4), M.floor, 0, 0, -0.5, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  K.box(M.plaster, -X, X, 2.2, HT, ZB - 0.2, ZB, 0xffffff, 0.01); K.box(M.plaster, X - 0.1, X + 0.1, 0, HT, ZB, 4, 0xf0e0c8, 0.01);
  /* left wall with a real window opening (z -1.9..0.7, y 1.2..3.9) */ K.box(M.plaster, -X - 0.1, -X + 0.1, 0, HT, ZB, -1.9, 0xf0e0c8, 0.01); K.box(M.plaster, -X - 0.1, -X + 0.1, 0, HT, 0.7, 4, 0xf0e0c8, 0.01); K.box(M.plaster, -X - 0.1, -X + 0.1, 0, 1.2, -1.9, 0.7, 0xf0e0c8, 0.01); K.box(M.plaster, -X - 0.1, -X + 0.1, 3.9, HT, -1.9, 0.7, 0xf0e0c8, 0.01);
  K.box(M.panel, -X, X, 0, 2.2, ZB - 0.15, ZB, 0xffffff, 0.01); K.box(M.panel, X - 0.11, X + 0.01, 0, 2.0, ZB, 4, 0xffffff, 0.01); K.box(M.panel, -X - 0.01, -X + 0.11, 0, 1.15, ZB, 4, 0xffffff, 0.01);
  K.box(M.panel, -X, X, HT - 0.3, HT, ZB, 4, 0x4a2e1e, 0.01);
  // the bench: raised platform + long desk; crest above
  K.box(M.panel, -3.2, 3.2, 0, 0.5, ZB, ZB + 1.8, 0x5a3624, 0.02); K.box(M.panel, -3.0, 3.0, 0.5, 1.55, ZB + 1.6, ZB + 1.85, 0x6a4430, 0.02); K.box(M.wood, -3.1, 3.1, 1.55, 1.63, ZB + 1.5, ZB + 1.95, 0x8a5a38, 0.02);
  for (const x of [-1.2, 1.2]) { K.box(M.panel, x - 0.4, x + 0.4, 0.5, 2.6, ZB + 0.2, ZB + 0.35, 0x8a2a30, 0.04); }
  mesh(root, plane(1.4, 1.4), M.crest, 0, 3.4, ZB + 0.02, 0, 0, 0, false);
  // tall window (left wall) with the day outside; the horse is placed outside by the story
  K.box(M.white, -X + 0.05, -X + 0.2, 1.2, 3.9, -1.9, 0.7, 0xf2ece0, 0.01);   for (let i = 1; i < 3; i++) K.box(M.white, -X + 0.08, -X + 0.18, 1.2, 3.9, -1.9 + i * 0.86 - 0.03, -1.9 + i * 0.86 + 0.03, 0xf2ece0, 0.005); K.box(M.white, -X + 0.08, -X + 0.18, 2.5, 2.56, -1.9, 0.7, 0xf2ece0, 0.005);
  mesh(root, plane(40, 14), M.outside, -X - 14, 4, -0.6, 0, Math.PI / 2, 0, false); mesh(root, planeUV(16, 30, 4, 8), M.frost, -X - 8, 0, -0.6, -Math.PI / 2, 0, 0, false);
  // the dock (right) with a rail; clerk's table; public benches (front)
  K.at(2.6, 0, -0.6, 0, () => { K.box(M.panel, -0.9, 0.9, 0, 1.05, -0.7, -0.62, 0x5a3624, 0.02); K.box(M.panel, -0.9, -0.82, 0, 1.05, -0.7, 0.7, 0x5a3624, 0.02); K.box(M.panel, 0.82, 0.9, 0, 1.05, -0.7, 0.7, 0x5a3624, 0.02); K.box(M.panel, -0.9, 0.9, 0, 1.05, 0.62, 0.7, 0x5a3624, 0.02); K.box(M.gold, -0.95, 0.95, 1.05, 1.1, -0.75, 0.75, 0xc89a3a, 0.02); });
  K.box(M.wood, -1.6, 0.4, 0.75, 0.82, -1.9, -1.1, 0x8a5a38, 0.02); for (const [x, z] of [[-1.5, -1.8], [0.3, -1.8], [-1.5, -1.2], [0.3, -1.2]]) K.box(M.wood, x - 0.04, x + 0.04, 0, 0.75, z - 0.04, z + 0.04, 0x6a4430, 0.01);
  K.box(M.white, -1.3, -0.9, 0.82, 0.86, -1.7, -1.4, 0xf2ece0, 0.005); K.put(M.metal, cyl(0.04, 0.05, 0.12, 8), -0.4, 0.88, -1.5, 0, 0, 0, 1, 1, 1, 0x2a2a30);
  for (const z of [1.6, 2.8]) { K.box(M.wood, -4.2, 1.2, 0.42, 0.5, z - 0.25, z + 0.25, 0x7a4e30, 0.02); K.box(M.wood, -4.2, 1.2, 0.5, 1.0, z + 0.22, z + 0.3, 0x7a4e30, 0.02); }
  // easel with the charge sheet (ST.charges)
  K.beam(M.wood, [3.45, 0, -2.3], [3.5, 2.3, -2.32], 0.04, 0x6a4430); K.beam(M.wood, [4.55, 0, -2.3], [4.5, 2.3, -2.32], 0.04, 0x6a4430); K.beam(M.wood, [4.0, 0, -3.0], [4.0, 2.2, -2.4], 0.04, 0x6a4430); K.box(M.wood, 3.4, 4.6, 1.1, 1.16, -2.3, -2.12, 0x6a4430, 0.01);
  const sheet = mesh(root, plane(1.15, 1.15), M.charges[0], 4.0, 1.75, -2.2, -0.06, 0, 0, false);
  K.build(root, 0);
  const dust = motes(root, 60, [-4, 4, 0.4, 4.2, -4, 3], 82, 0.01);
  return { sheet, dust }; }

// ================================================================= BRIGHTON RUN (14 November 1896)
function buildBrighton(root, carSrc) { const R = PT.rng(1414), K = new Kit(), PF = props();
  mesh(root, planeUV(7, 260, 2, 60), M.road, 0, 0.005, -100, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  for (const s of [-1, 1]) mesh(root, planeUV(80, 260, 20, 60), M.field, s * 43.5, 0, -100, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  mesh(root, planeUV(900, 300, 30, 10), M.sea, -40, -0.3, -340, -Math.PI / 2, 0, 0, false);
  // rope lines (spectators stand behind, story actors), posts
  for (const s of [-1, 1]) { for (let z = 10; z > -80; z -= 2.5) K.beam(M.wood, [s * 4.2, 0, z], [s * 4.2, 1.0, z], 0.035, 0x6a4a30, true, 5); K.beam(M.rope, [s * 4.2, 0.9, 10], [s * 4.2, 0.9, -80], 0.02, 0xc8a070, true, 4); }
  // banner across the road on two poles, bunting lines, "14 M.P.H." board, flags
  for (const s of [-1, 1]) K.beam(M.wood, [s * 4.8, 0, -14], [s * 4.8, 6.0, -14], 0.09, 0x5a3a24, true, 6);
  const ban = mesh(root, plane(8.2, 2.0), M.banner, 0, 4.6, -14, 0, 0, 0, true);
  for (const zz of [-4, -26, -40]) { const b = mesh(root, plane(10, 0.6), M.bunting, 0, 4.4, zz, 0, 0, 0, false); nond(b); for (const s of [-1, 1]) K.beam(M.wood, [s * 5.2, 0, zz], [s * 5.2, 4.8, zz], 0.05, 0x5a3a24, true, 5); }
  signPost(root, K, M.signs.fourteen, 5.4, -6, -0.4, 1.4, 0.56, 1.7);
  // houses + a hotel front far down the road, trees
  let z = -50; for (let i = 0; z > -150; i++) { const w = 7 + R() * 2; for (const s of [-1, 1]) K.at(s * 12, 0, z, -s * Math.PI / 2, () => house(K, { w, d: 6, floors: 2, wall: [0xf4f0e6, 0xe8dcc4, 0xc8d8e0, 0xf2e0d0][(i + (s > 0)) % 4], trim: 0xf4efe2, roof: 0x5a4a5a, porch: false, rise: 2.2 })); z -= w + 2; }
  for (const [x, z2] of [[-8, 4], [9, -8], [-9, -30], [10, -44]]) bareTree(K, x, z2, 1.1, R);
  K.build(root, 12);
  const hills = mesh(root, plane(700, 90), M.hillsW, 0, 6, -260, 0, 0, 0, false); hills.renderOrder = -2; nond(hills);
  const cols = [[0x2f5a3a, 0x24452e], [0xb8262a, 0x8e1c22], [0x1e3a7a, 0x16285a], [0xc89a3a, 0x9a7428], [0x3a2a2a, 0x261c1c]];
  const convoy = cols.map(([a, b]) => { const c = cloneCar(carSrc, a, b); root.add(c); return c; });
  const smoke = puffs(root, 12, 11);
  return { convoy, ban, smoke }; }

// ================================================================= lights / grade
const SET_LIGHT = {
  village: { top: '#6a8ad0', hor: '#ffe0c0', fog: '#e8dcd0', fogN: 30, fogF: 180, sky: '#a8b8e8', ground: '#5a5a58', hemiI: 0.95, fillCol: '#7a8ae0', fillI: 0.38, sunCol: '#ffd8a8', sunI: 3.0, az: -130, el: 16, disc: '#fff0c8', discSize: 0.003, clouds: true, stars: 0, shadow: true, cardTint: '#fff4ea', fxTint: '#fff6ee', shafts: 0.3 },
  villageEve: { top: '#3a4aa0', hor: '#ffa070', fog: '#e89a80', fogN: 26, fogF: 160, sky: '#c0a0d8', ground: '#4a3a40', hemiI: 0.8, fillCol: '#6a6ad0', fillI: 0.4, sunCol: '#ffa060', sunI: 2.8, az: -60, el: 7, disc: '#ffe0b0', discSize: 0.006, clouds: true, stars: 0, shadow: true, cardTint: '#fff0e0', fxTint: '#fff4ea', shafts: 0.5 },
  lane: { top: '#5a8ae0', hor: '#d8ecff', fog: '#d0e0f0', fogN: 40, fogF: 260, sky: '#a0c0f0', ground: '#5a6a4a', hemiI: 1.0, fillCol: '#7a8ae0', fillI: 0.34, sunCol: '#fff0d8', sunI: 3.2, az: -150, el: 24, disc: '#fff6e0', discSize: 0.003, clouds: true, stars: 0, shadow: true, cardTint: '#fff8f0', fxTint: '#fff8f0', shafts: 0 },
  court: { top: '#000000', hor: '#3a2418', fog: '#3a2418', fogN: 12, fogF: 50, sky: '#ffd8b0', ground: '#4a3028', hemiI: 0.78, fillCol: '#7a70d0', fillI: 0.36, sunCol: '#ffe0b8', sunI: 2.4, az: -110, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0.7 },
  brighton: { top: '#4a7ad8', hor: '#ffe0b8', fog: '#f0d8c0', fogN: 40, fogF: 260, sky: '#a8b8f0', ground: '#5a5a48', hemiI: 0.95, fillCol: '#7080e0', fillI: 0.36, sunCol: '#ffd8a0', sunI: 3.1, az: -140, el: 18, disc: '#fff0c8', discSize: 0.003, clouds: true, stars: 0, shadow: true, cardTint: '#fff4ea', fxTint: '#fff6ee', shafts: 0.3 },
};
const SET_GRADE = {
  village: { look: 'golden', over: { exp: 1.06, con: 1.2, sat: 1.12, tS: ['#2a3a8a', 0.18], tH: ['#ffd0a0', 0.1], bloom: [0.42, 0.76], hal: [0.22, '#ffb070'], vig: [0.3, 0.46, '#1e1a3a'] } },
  villageEve: { look: 'golden', over: { exp: 1.06, con: 1.22, sat: 1.16, tS: ['#3a2a8a', 0.2], tH: ['#ffb070', 0.14], bloom: [0.42, 0.74], hal: [0.28, '#ff9050'], vig: [0.34, 0.46, '#1e1a3a'] } },
  lane: { look: 'golden', over: { exp: 1.04, con: 1.18, sat: 1.12, tS: ['#2a3a8a', 0.16], tH: ['#fff0c0', 0.08], bloom: [0.4, 0.78], hal: [0.2, '#ffc080'], vig: [0.3, 0.46, '#1e1a3a'] } },
  court: { look: 'office', over: { exp: 1.12, con: 1.22, sat: 1.12, lift: [0.035, 0.02, 0.04], tS: ['#3a2a6a', 0.2], tH: ['#ffc888', 0.12], bloom: [0.44, 0.72], hal: [0.3, '#ff9a50'], vig: [0.36, 0.44, '#14081a'] } },
  brighton: { look: 'golden', over: { exp: 1.06, con: 1.2, sat: 1.16, tS: ['#2a3a8a', 0.16], tH: ['#ffd0a0', 0.1], bloom: [0.42, 0.76], hal: [0.22, '#ffb070'], vig: [0.3, 0.46, '#1e1a3a'] } },
};

export function buildCL(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'village', limit: 0, charges: 0, car: null, laneCar: null, convoy: [], smoke: 0 };
  let vg, ln, ct, br;
  const API = makeAPI(ctx, { prefix: 'cl_', origin: CL_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { village: 'golden', villageEve: 'golden', lane: 'golden', court: 'office', brighton: 'golden' },
    practicals: (name, F, W3) => { if (name === 'court') return [{ p: W3('court', [-2.2, 2.8, 0.4]), col: '#ffe8c8', I: 2.4, d: 8 }, { p: W3('court', [1.5, 3.6, -2.0]), col: '#ffc888', I: 2.5, d: 7 }];
      if (name === 'villageEve') return [{ p: W3('village', [9.3, 2.0, -12]), col: '#ffb860', I: 3, d: 6 }];
      return []; },
    tick: (f, cur) => {
      if (cur === 'village' && vg) { tickMotes(vg.frostMotes, f, 0.2); vg.limit.material = M.limit[ST.limit >= 0.5 ? 1 : 0]; vg.limit.rotation.y = -0.5 + Math.PI * 2 * (ST.limit < 0.5 ? sm(0, 0.5, ST.limit) : sm(1, 0.5, ST.limit)) * 0.25 * 0 + (ST.limit > 0.02 && ST.limit < 0.98 ? Math.sin(ST.limit * Math.PI) * 1.4 : 0);
        driveCar(vg.car, ST.car || { vis: false }, f); tickPuffs(vg.smoke, ST.car && ST.car.vis !== false ? smokeSrc(vg.car) : null, back(vg.car), f, !!ST.car && ST.car.vis !== false && (ST.car.run ?? 1) > 0.3); }
      if (cur === 'lane' && ln) { driveCar(ln.car, ST.laneCar || { vis: false }, f); tickPuffs(ln.smoke, ST.laneCar && ST.laneCar.vis !== false ? smokeSrc(ln.car) : null, back(ln.car), f, !!ST.laneCar && ST.laneCar.vis !== false && (ST.laneCar.run ?? 1) > 0.3); }
      if (cur === 'court' && ct) { tickMotes(ct.dust, f, 0.2); ct.sheet.material = M.charges[Math.max(0, Math.min(4, ST.charges | 0))]; }
      if (cur === 'brighton' && br) { br.convoy.forEach((c, i) => driveCar(c, ST.convoy[i] || { vis: false }, f + i * 7)); br.ban.rotation.x = 0.04 * Math.sin(f * 0.07); tickPuffs(br.smoke, ST.convoy[0] ? smokeSrc(br.convoy[0]) : null, back(br.convoy[0]), f, !!ST.convoy[0]); } },
    mood: (name) => { ST.mood = name; },
    apply: (v) => { if (v.st) Object.assign(ST, v.st); } });
  const smokeSrc = (c) => { const p = c.position, yaw = c.rotation.y; return [p.x - Math.sin(yaw) * 1.4, 0.55, p.z - Math.cos(yaw) * 1.4]; };
  const back = (c) => { const yaw = c.rotation.y; return [-Math.sin(yaw), 0, -Math.cos(yaw)]; };
  vg = buildVillage(API.groups.village, ctx.car); ln = buildLane(API.groups.lane, ctx.car); ct = buildCourt(API.groups.court); br = buildBrighton(API.groups.brighton, ctx.car);
  API.parts = { vg, ln, ct, br };
  API.set = (o) => { Object.assign(ST, o); };
  const V = API.V;
  API.views = [
    V('village', [1.2, 1.7, 9.5], [0, 1.6, -20], 44, 1.0, [0, 1.2, -4], { st: { car: { x: 1.2, z: -6, yaw: Math.PI, dist: 0, run: 0 } } }),   // 0 high street wide
    V('village', [3.0, 1.6, -1.0], [3.85, 1.55, -4.0], 40, 1.8, [3.85, 1.55, -4]),                                                             // 1 notice 2 MPH
    V('village', [6, 4, 4], [-17, 4, -30], 46, 0.8, [-17, 4, -30]),                                                                             // 2 oast house
    V('lane', [1.8, 1.4, 6], [0, 1.2, -30], 44, 1.0, [0, 1, -8], { st: { laneCar: { x: 0.6, z: -6, yaw: Math.PI, run: 1, dist: 0 } } }),      // 3 lane
    V('court', [0.2, 1.7, 3.9], [0, 1.9, -4], 46, 1.0, [0, 1.6, -3], { st: { charges: 4 } }),                                                  // 4 court
    V('brighton', [1.5, 1.7, 9], [0, 2.6, -20], 46, 1.0, [0, 1.4, -6], { st: { convoy: [0, 1, 2, 3, 4].map((i) => ({ x: i % 2 ? -1.4 : 1.2, z: -4 - i * 7, yaw: 0, run: 1, dist: 0 })) } }), // 5 brighton
  ];
  API.tick(0);
  return API;
}
