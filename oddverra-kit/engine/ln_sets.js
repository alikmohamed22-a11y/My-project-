// ln_sets.js [LN-sets]: sets for "Abraham Lincoln is in the Wrestling Hall of Fame" (Oddverra short).
//   village : 1831 New Salem style frontier village: dusty street, a log general store with porch + DRY GOODS sign, log cabins with stone
//             chimneys, split-rail fences, oaks, a well, rolling prairie hills. Moods: 'village' (noon), 'villageGold' (fight, golden),
//             'villageSun' (sunset friendship), 'villageDawn' (sunrise, president).                              origin (-46000, 0, 0)
//   store   : the general store inside: log walls, plank floor, counter, shelves of jars / bolts of cloth, barrels, sacks, stove, lantern. origin (-46000, 0, 600)
//   cabin   : log cabin at night: fireplace, candle on a table with a book, bed, a log wall of carved TALLY MARKS (tally(n) 0..300).  origin (-46000, 0, 1200)
//   camp    : 1832 militia camp (non-violent): canvas tents, campfire, supply wagon, barrels, pennant pole, prairie. 'camp' day / 'campDusk'. origin (-48500, 0, 0)
//   hall    : modern wrestling hall of fame room: navy walls, rows of bronze plaques, a featured LINCOLN plaque, round mat, spotlights. origin (-48500, 0, 600)
// Each set: local frame, camera side +z. Test flag ?lnview=N (main.js).
import { H, TAU, clamp01, sm, SERIF, SANS, cyl, sph, plane, planeUV, lathe, mesh, nond, lumpGeo, shapeGeo, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';

export const LN_ORIGIN = { village: [-46000, 0, 0], store: [-46000, 0, 600], cabin: [-46000, 0, 1200], camp: [-48500, 0, 0], hall: [-48500, 0, 600] };
const GROUP_OF = { village: 'village', villageGold: 'village', villageSun: 'village', villageDawn: 'village', store: 'store', cabin: 'cabin', camp: 'camp', campDusk: 'camp', hall: 'hall' };
let THREE, PT, M;
// village ground height: flat street, gentle rise toward the far hills
export function vf(x, z) { const far = sm(-30, -110, z), side = sm(60, 140, Math.abs(x)); return far * (6 + 5 * Math.sin(x * 0.02 + 1)) + side * 4 + 0.35 * Math.sin(x * 0.11) * Math.sin(z * 0.09) * sm(-8, -20, z); }
export function cf(x, z) { return sm(-30, -120, z) * (5 + 4 * Math.sin(x * 0.025)) + 0.25 * Math.sin(x * 0.13 + z * 0.07); }

// ---------------------------------------------------------------- painters
function logTex(g, w, h, o = {}) { const n = o.n || 8, lh = h / n, R = PT.rng(o.seed || 5), base = o.base || [128, 86, 52];
  g.fillStyle = '#d8c8a0'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { const y = i * lh, k = 0.85 + R() * 0.3; const gr = g.createLinearGradient(0, y, 0, y + lh); const c = (m) => `rgb(${base[0] * k * m | 0},${base[1] * k * m | 0},${base[2] * k * m | 0})`;
    gr.addColorStop(0, c(0.7)); gr.addColorStop(0.3, c(1.15)); gr.addColorStop(0.75, c(0.95)); gr.addColorStop(1, c(0.55)); g.fillStyle = gr; g.beginPath(); g.roundRect(-10, y + lh * 0.06, w + 20, lh * 0.88, lh * 0.4); g.fill();
    g.strokeStyle = 'rgba(60,36,20,0.35)'; g.lineWidth = 1.5; for (let k2 = 0; k2 < 6; k2++) { const yy = y + lh * (0.25 + R() * 0.5), x0 = R() * w; g.beginPath(); g.moveTo(x0, yy); g.lineTo(x0 + 40 + R() * 120, yy + (R() - 0.5) * 3); g.stroke(); }
    for (let k2 = 0; k2 < 2; k2++) { const x = R() * w, yy = y + lh * (0.3 + R() * 0.4); g.fillStyle = 'rgba(70,40,20,0.5)'; g.beginPath(); g.ellipse(x, yy, 6, 4, 0, 0, TAU); g.fill(); } }
  grain(g, w, h, 'rgba(60,40,20,1)', 900, o.seed || 5, 0.25); }
function signTex(g, w, h, lines, o = {}) { g.fillStyle = o.bg || '#6a4628'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.85 + 0.25 * PT.fbm(u, v, 8, 2, 3, 7));
  g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.08; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08);
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : 0.36 + i * 0.36), w * 0.86, h * (lines.length === 1 ? 0.56 : 0.32), { col: o.col || '#f4e4b8', font: o.font || SERIF, shadow: 'rgba(0,0,0,0.4)' })); }
function quiltTex(g, w, h) { const C = ['#c0453a', '#e8d8b0', '#3a6a9a', '#d8a040', '#6a8a4a', '#f2ece0']; const n = 6, s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = C[(i * 3 + j * 2) % C.length]; g.fillRect(i * s, j * s, s, s); g.strokeStyle = 'rgba(60,30,30,0.5)'; g.lineWidth = 2; g.strokeRect(i * s + 2, j * s + 2, s - 4, s - 4); } }
function bookTex(g, w, h) { PT.paper(g, w, h, { base: '#f0e4c8', seed: 3 }); g.fillStyle = 'rgba(80,60,50,0.6)'; for (let p = 0; p < 2; p++) for (let i = 0; i < 14; i++) g.fillRect(w * (0.06 + p * 0.5), h * (0.1 + i * 0.058), w * (0.34 - (i % 5 === 4 ? 0.12 : 0)), 3); g.fillStyle = 'rgba(90,60,40,0.4)'; g.fillRect(w / 2 - 2, 0, 4, h); }
function matTex(g, w, h) { g.fillStyle = '#2a4a9a'; g.fillRect(0, 0, w, h); const c = w / 2; g.fillStyle = '#e8c040'; g.beginPath(); g.arc(c, c, w * 0.46, 0, TAU); g.fill(); g.fillStyle = '#c83a32'; g.beginPath(); g.arc(c, c, w * 0.43, 0, TAU); g.fill();
  g.fillStyle = '#e8c040'; g.beginPath(); g.arc(c, c, w * 0.3, 0, TAU); g.fill(); g.fillStyle = '#2a4a9a'; g.beginPath(); g.arc(c, c, w * 0.285, 0, TAU); g.fill(); g.strokeStyle = '#f2f2f2'; g.lineWidth = 6; g.beginPath(); g.arc(c, c, w * 0.05, 0, TAU); g.stroke();
  for (const s of [-1, 1]) { g.fillStyle = s < 0 ? '#c83a32' : '#2a8a4a'; g.fillRect(c + s * w * 0.04 - 4, c - w * 0.03, 8, w * 0.06); } }
function plaqueTex(g, w, h, o = {}) { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#b88a3a'); gr.addColorStop(0.5, '#e8c070'); gr.addColorStop(1, '#a87a30'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#6a4a18'; g.lineWidth = w * 0.03; g.strokeRect(w * 0.04, w * 0.04, w - w * 0.08, h - w * 0.08);
  if (o.big) { // profile silhouette with stovepipe hat + beard, name, honour
    g.save(); g.translate(w / 2, h * 0.3); const k = w / 520; g.scale(k, k); g.fillStyle = '#3a2a14';
    g.beginPath(); g.ellipse(0, 20, 58, 72, 0, 0, TAU); g.fill(); g.fillRect(-48, -150, 96, 110); g.fillRect(-82, -50, 164, 16); g.beginPath(); g.moveTo(-40, 50); g.quadraticCurveTo(-10, 130, 34, 92); g.lineTo(52, 40); g.fill(); g.fillRect(-70, 100, 140, 70); g.restore();
    txt(g, 'ABRAHAM LINCOLN', w / 2, h * 0.62, w * 0.84, h * 0.085, { col: '#3a2a14', font: SERIF }); txt(g, 'OUTSTANDING AMERICAN', w / 2, h * 0.74, w * 0.8, h * 0.06, { col: '#4a3418', font: SERIF }); txt(g, '1992', w / 2, h * 0.85, w * 0.4, h * 0.07, { col: '#4a3418', font: SERIF }); }
  else { g.fillStyle = 'rgba(60,40,16,0.7)'; g.beginPath(); g.ellipse(w / 2, h * 0.32, w * 0.16, h * 0.15, 0, 0, TAU); g.fill(); for (let i = 0; i < 3; i++) g.fillRect(w * 0.2, h * (0.58 + i * 0.1), w * (0.6 - i * 0.12), h * 0.04); }
  grain(g, w, h, 'rgba(90,60,20,1)', 300, o.seed || 3, 0.3); }
function bannerTex(g, w, h) { g.fillStyle = '#14204a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8c060'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.1, h * 0.1, w - h * 0.2, h - h * 0.2);
  txt(g, 'WRESTLING HALL OF FAME', w / 2, h * 0.52, w * 0.86, h * 0.5, { col: '#f6e8c0', font: SERIF, shadow: 'rgba(0,0,0,0.5)' }); }
function prairieView(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7ab0e8'); gr.addColorStop(0.65, '#d8e8f4'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#8aa060'; g.beginPath(); g.moveTo(0, h * 0.6); g.bezierCurveTo(w * 0.3, h * 0.48, w * 0.6, h * 0.56, w, h * 0.5); g.lineTo(w, h); g.lineTo(0, h); g.fill(); g.fillStyle = '#6a8a48'; g.fillRect(0, h * 0.75, w, h * 0.25);
  for (let i = 0; i < 6; i++) { g.fillStyle = '#4a6a3a'; g.beginPath(); g.arc(w * (0.1 + i * 0.17), h * 0.56, 14 + (i % 3) * 6, 0, TAU); g.fill(); } }
function nightView(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a1030'); gr.addColorStop(1, '#2a3870'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = PT.rng(9);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,255,240,${0.4 + R() * 0.6})`; g.fillRect(R() * w, R() * h * 0.7, 2, 2); } g.fillStyle = '#f4f0d8'; g.beginPath(); g.arc(w * 0.7, h * 0.25, 18, 0, TAU); g.fill(); g.fillStyle = '#14183a'; g.fillRect(0, h * 0.8, w, h * 0.2); }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.ground = vc(); if (H.MACRO) H.MACRO(m.ground, 0.22, 0.08);
  m.log = vc({ map: T(512, 512, (g, w, h) => logTex(g, w, h, { n: 8, seed: 5 }), [1, 1]) }); m.logD = vc({ map: T(512, 512, (g, w, h) => logTex(g, w, h, { n: 8, seed: 9, base: [104, 70, 44] })) });
  m.logIn = vc({ map: T(512, 512, (g, w, h) => logTex(g, w, h, { n: 8, seed: 13, base: [150, 100, 60] })) });
  m.plank = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 8, seed: 51 })) }); if (H.MACRO) H.MACRO(m.plank, 0.12, 0.05);
  m.shingle = vc({ map: T(256, 256, (g, w, h) => PT.shingles(g, w, h, { base: '#7a6a5a', seed: 3 })) }); m.stone = vc({ map: T(256, 256, (g, w, h) => PT.stone(g, w, h, { base: '#9a8a7a' })) });
  m.barrel = vc({ map: T(256, 256, (g, w, h) => PT.barrel(g, w, h, {})) }); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.canvas = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#efe6d0' })), side: THREE.DoubleSide });
  m.leaf = vc(); m.storeSign = em(T(1024, 256, (g, w, h) => signTex(g, w, h, ['GENERAL STORE'])), 0x2a2010); m.drySign = em(T(512, 160, (g, w, h) => signTex(g, w, h, ['DRY GOODS', '& GROCERIES'], { bg: '#e8dcc0', col: '#6a2a1a', rim: '#6a2a1a' })), 0x2a2010);
  m.priceSign = em(T(256, 128, (g, w, h) => signTex(g, w, h, ['CANDY 1¢'], { bg: '#f2e8d0', col: '#a8322a', rim: '#a8322a' })), 0x2a2010); m.quilt = vc({ map: T(256, 256, quiltTex) }); m.book = em(T(256, 160, bookTex), 0x302818);
  m.mat = vc({ map: T(512, 512, matTex) }); m.plaque = em(T(128, 160, (g, w, h) => plaqueTex(g, w, h, { seed: 4 })), 0x3a2808); m.bigPlaque = em(T(512, 680, (g, w, h) => plaqueTex(g, w, h, { big: 1 })), 0x4a3410); m.hallBanner = em(T(1024, 160, bannerTex), 0x101830);
  m.navy = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#26345e'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 2)); }) });
  m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#b07a48', n: 10, seed: 61 })) }); m.prairie = C.basic(T(512, 256, prairieView), 1.1); m.nightWin = C.basic(T(256, 256, nightView), 1.0);
  m.char = vc({ emissive: 0x050308 }); m.tally = toon({ color: 0x2a1a10 }); m.ember = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff8a30).multiplyScalar(2.2), fog: false });
  m.cone = new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
  m.winWarm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc870).multiplyScalar(1.3), fog: true }); m.glassD = toon({ color: 0x2a3448, emissive: 0x0a1020 });
  return m; }

// ---------------------------------------------------------------- shared pieces
function tree(K, x, y, z, s, R, col) { K.beam(M.bark, [x, y - 0.3, z], [x + (R() - 0.5) * 0.4 * s, y + 3.2 * s, z], 0.28 * s, 0x6a4a32, true, 7);
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + R(), r = (1.2 + R() * 0.9) * s; K.put(M.leaf, lumpGeo(3 + (i % 4), 1, 0.2), x + Math.cos(a) * 1.3 * s, y + (3.6 + R() * 1.8) * s, z + Math.sin(a) * 1.3 * s, 0, R() * 6, 0, r, r * 0.85, r, col + ((i * 0x030502) & 0x0f0f0f)); }
  K.put(M.leaf, lumpGeo(7, 1, 0.2), x, y + 5.4 * s, z, 0, 0, 0, 1.9 * s, 1.6 * s, 1.9 * s, col); }
function barrel(K, x, y, z, s = 1, c = 0xffffff) { K.put(M.barrel, lathe('lnbar', [[0.001, 0], [0.26, 0], [0.31, 0.22], [0.32, 0.4], [0.31, 0.58], [0.26, 0.8], [0.001, 0.8]], 16), x, y, z, 0, 0, 0, s, s, s, c); }
function crate(K, x, y, z, s = 0.6, ry = 0) { K.at(x, y, z, ry, () => { K.box(M.plank, -s / 2, s / 2, 0, s, -s / 2, s / 2, 0xc89a6a, 0.02); for (const yy of [0.02, s - 0.06]) K.box(M.plank, -s / 2 - 0.01, s / 2 + 0.01, yy, yy + 0.05, -s / 2 - 0.01, s / 2 + 0.01, 0x8a6040, 0.01); }); }
function sack(K, x, y, z, s = 1, c = 0xd8c8a0) { K.put(M.paint, lumpGeo(5, 2, 0.12), x, y + 0.3 * s, z, 0, 0, 0, 0.32 * s, 0.38 * s, 0.28 * s, c); K.put(M.paint, cyl(0.06 * s, 0.1 * s, 0.14 * s, 8), x, y + 0.72 * s, z, 0, 0, 0, 1, 1, 1, c); }
function fence(K, a, b, c = 0x8a6a48) { const L = Math.hypot(b[0] - a[0], b[2] - a[2]), n = Math.max(1, Math.round(L / 2.6)); for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n, z = (i % 2 ? 0.25 : -0.25), p = (t) => [a[0] + (b[0] - a[0]) * t, a[1], a[2] + (b[2] - a[2]) * t];
  const P0 = p(t0), P1 = p(t1); for (const h of [0.35, 0.7, 1.05]) K.beam(M.bark, [P0[0], P0[1] + h, P0[2] + z], [P1[0], P1[1] + h + 0.05, P1[2] - z], 0.07, c, true, 5); K.beam(M.bark, [P0[0], P0[1] - 0.1, P0[2] + z], [P0[0], P0[1] + 1.2, P0[2] + z], 0.08, c - 0x101010, true, 5); } }
function flame(root, p, s, list) { const f = nond(mesh(root, plane(0.5 * s, 0.9 * s), M.flame, p[0], p[1] + 0.4 * s, p[2], 0, 0, 0, false)); f.renderOrder = 6; f.userData.s = s; f.userData.y = p[1] + 0.4 * s; list.push(f); return f; }
function cabinExt(K, x, z, w, d, ht, ry, R) { K.at(x, 0, z, ry, () => { const y0 = -0.4;
  for (const [x0, x1, z0, z1] of [[-w / 2, w / 2, d / 2 - 0.35, d / 2], [-w / 2, w / 2, -d / 2, -d / 2 + 0.35], [-w / 2, -w / 2 + 0.35, -d / 2, d / 2], [w / 2 - 0.35, w / 2, -d / 2, d / 2]]) K.box(M.log, x0, x1, y0, ht, z0, z1, 0xffffff, 0.08);
  for (const s of [-1, 1]) for (let j = 0; j < 8; j++) K.put(M.logD, cyl(0.17, 0.17, 0.5, 8), s * (w / 2 - 0.1), y0 + 0.2 + j * (ht - y0) / 8, d / 2 - 0.05, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8b890);
  const roof = (s) => K.put(M.shingle, new THREE.BoxGeometry(w + 0.8, 0.12, d / 2 / Math.cos(0.62) + 0.5), 0, ht + (d / 4) * Math.tan(0.62), s * d / 4, s * 0.62, 0, 0, 1, 1, 1, 0xffffff); roof(-1); roof(1);
  const gable = shapeGeo([[-w / 2, 0], [w / 2, 0], [0, -(d / 2) * Math.tan(0.62)]], 0.2, 0); for (const zz of [d / 2 - 0.2, -d / 2]) K.put(M.logD, gable, 0, ht, zz, -Math.PI / 2, 0, 0, 1, 1, 1, 0xffffff);
  K.box(M.plank, -0.5, 0.5, y0, 2.0, d / 2, d / 2 + 0.06, 0x7a5030, 0.02); K.box(M.glassD, w / 4 - 0.4, w / 4 + 0.4, 1.0, 1.7, d / 2, d / 2 + 0.05, 0xffffff, 0.01); K.box(M.plank, w / 4 - 0.48, w / 4 + 0.48, 0.92, 1.0, d / 2, d / 2 + 0.12, 0x7a5030, 0.01);
  K.box(M.stone, -w / 2 - 0.9, -w / 2 + 0.1, y0, ht + 2.6, -0.5, 0.5, 0xffffff, 0.05); }); }

// ================================================================= VILLAGE
function buildVillage(root) {
  const R = PT.rng(1831), K = new Kit();
  const W = 420, D = 320, NX = 140, NZ = 110, g = new THREE.PlaneGeometry(W, D, NX, NZ); g.rotateX(-Math.PI / 2); const p = g.attributes.position, c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) - 60, y = vf(x, z); p.setXYZ(i, x, y, z); const n = PT.fbm(x * 0.01 + 3, z * 0.01 + 1, 2, 2, 3, 4), road = 1 - sm(4.5, 7.5, Math.abs(z - 1.5)), ring = 1 - sm(5, 8.5, Math.hypot(x, z - 2)), path = (1 - sm(0.8, 1.6, Math.abs(x - 0))) * sm(-6, -3, z) * 0;
    let col = [0.26 + 0.08 * n, 0.4 + 0.06 * n, 0.16]; const dry = sm(0.45, 0.65, n); col = col.map((v, k) => v * (1 - dry * 0.5) + [0.46, 0.42, 0.22][k] * dry * 0.5);
    const d = Math.max(road, ring, path); col = col.map((v, k) => v * (1 - d) + [0.56, 0.42, 0.28][k] * d * (0.92 + 0.12 * n)); c.set(col, i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.computeVertexNormals(); const terr = new THREE.Mesh(g, M.ground); terr.receiveShadow = true; root.add(terr);
  // the general store (front at z=-6), porch, sign, barrels/crates/sacks
  K.at(0, 0, -10, 0, () => { const w = 9, d = 8, ht = 3.6, y0 = -0.3;
    for (const [x0, x1, z0, z1] of [[-w / 2, w / 2, d / 2 - 0.35, d / 2], [-w / 2, w / 2, -d / 2, -d / 2 + 0.35], [-w / 2, -w / 2 + 0.35, -d / 2, d / 2], [w / 2 - 0.35, w / 2, -d / 2, d / 2]]) K.box(M.log, x0, x1, y0, ht, z0, z1, 0xfff4e8, 0.08);
    const roof = (s) => K.put(M.shingle, new THREE.BoxGeometry(w + 1, 0.14, d / 2 / Math.cos(0.55) + 0.6), 0, ht + (d / 4) * Math.tan(0.55), s * d / 4, s * 0.55, 0, 0, 1, 1, 1, 0xd8c8c0); roof(-1); roof(1);
    const gable = shapeGeo([[-w / 2, 0], [w / 2, 0], [0, -(d / 2) * Math.tan(0.55)]], 0.2, 0); for (const zz of [d / 2 - 0.2, -d / 2]) K.put(M.logD, gable, 0, ht, zz, -Math.PI / 2, 0, 0, 1, 1, 1, 0xffffff);
    // false front board for the sign
    K.box(M.plank, -3.6, 3.6, ht - 0.2, ht + 1.5, d / 2 + 0.02, d / 2 + 0.16, 0x9a6a40, 0.03);
    // porch: deck, posts, roof
    K.box(M.plank, -w / 2 - 0.2, w / 2 + 0.2, y0, 0.32, d / 2, d / 2 + 2.4, 0xb08a60, 0.03); for (const x of [-w / 2, -1.5, 1.5, w / 2]) K.beam(M.bark, [x, 0.3, d / 2 + 2.3], [x, ht - 0.4, d / 2 + 2.3], 0.12, 0x8a6a48, true, 6);
    K.put(M.shingle, new THREE.BoxGeometry(w + 0.8, 0.1, 2.8), 0, ht - 0.25, d / 2 + 1.3, -0.18, 0, 0, 1, 1, 1, 0xc8b8b0);
    for (let s = 0; s < 3; s++) K.box(M.plank, -1.0, 1.0, y0 + s * 0.11, y0 + s * 0.11 + 0.1, d / 2 + 2.4 + (2 - s) * 0.25, d / 2 + 2.4 + (3 - s) * 0.25, 0xa07a50, 0.02);
    K.box(M.plank, -0.6, 0.6, 0.3, 2.4, d / 2, d / 2 + 0.07, 0x6a4028, 0.02); for (const x of [-2.9, 2.9]) { K.box(M.winWarm, x - 0.7, x + 0.7, 1.0, 2.1, d / 2, d / 2 + 0.03, 0xffffff, 0.005); K.box(M.plank, x - 0.78, x + 0.78, 0.92, 1.0, d / 2, d / 2 + 0.14, 0x6a4028, 0.01); for (const xx of [x - 0.75, x, x + 0.75]) K.box(M.plank, xx - 0.04, xx + 0.04, 1.0, 2.1, d / 2, d / 2 + 0.06, 0x6a4028, 0.005); K.box(M.plank, x - 0.75, x + 0.75, 1.52, 1.58, d / 2, d / 2 + 0.06, 0x6a4028, 0.005); }
    K.at(0, 0, d / 2 + 2.3, 0, () => { barrel(K, -3.6, 0.32, -0.6); barrel(K, -3.0, 0.32, -0.9, 0.9); crate(K, 3.4, 0.32, -0.8, 0.6, 0.2); crate(K, 3.4, 0.92, -0.8, 0.5, -0.1); sack(K, 2.6, 0.32, -0.6); sack(K, -2.3, 0.32, -0.7, 0.9, 0xc8b890); }); });
  const sign = mesh(root, plane(6.4, 1.3), M.storeSign, 0, 4.25, -5.82, 0, 0, 0, false);
  // cabins along the street (back side) + a couple on the near side far left/right
  for (const [x, z, w, d, ht, ry] of [[-15, -11, 6.5, 5.5, 2.8, 0.06], [-26, -12, 6, 5, 2.6, -0.05], [-38, -13, 6.5, 5.5, 2.7, 0.1], [14, -11, 6, 5.2, 2.7, -0.08], [25, -12, 6.5, 5.5, 2.8, 0.05], [37, -11, 6, 5, 2.6, -0.1], [-30, 16, 6, 5, 2.6, Math.PI + 0.1], [30, 17, 6.5, 5.5, 2.7, Math.PI - 0.05]]) cabinExt(K, x, z, w, d, ht, ry, R);
  // fences, well, trees, hay, hitching rail
  fence(K, [-48, 0, -5], [-20, 0, -5.5]); fence(K, [19, 0, -5.5], [48, 0, -5]); fence(K, [-48, 0, 9], [-20, 0, 10]); fence(K, [20, 0, 10], [48, 0, 9]);
  K.at(11, 0, -3.5, 0.3, () => { K.put(M.stone, cyl(0.75, 0.8, 0.8, 14), 0, 0.35, 0, 0, 0, 0, 1, 1, 1, 0xffffff); for (const s of [-1, 1]) K.beam(M.bark, [s * 0.7, 0.7, 0], [s * 0.7, 2.2, 0], 0.07, 0x7a5a3a, true, 5); K.beam(M.bark, [-0.8, 2.2, 0], [0.8, 2.2, 0], 0.06, 0x7a5a3a, true, 5);
    K.put(M.shingle, new THREE.BoxGeometry(2.0, 0.08, 1.4), 0, 2.45, 0, 0, 0, 0.0, 1, 1, 1, 0xc8b8b0); K.put(M.barrel, cyl(0.16, 0.14, 0.26, 10), 0.0, 1.6, 0, 0, 0, 0, 1, 1, 1, 0xffffff); });
  K.beam(M.bark, [-7.5, 0.95, -3.0], [-4.8, 0.95, -3.0], 0.07, 0x7a5a3a, true, 5); for (const x of [-7.4, -4.9]) K.beam(M.bark, [x, 0, -3.0], [x, 1.0, -3.0], 0.08, 0x6a4a30, true, 5);
  for (let i = 0; i < 70; i++) { const x = (R() - 0.5) * 220, z = -22 - R() * 70; if (Math.abs(x) < 6 && z > -30) continue; tree(K, x, vf(x, z), z, 0.9 + R() * 0.8, R, [0x4a7a3a, 0x5a8a3a, 0x3e6a34, 0x6a8a3a][i % 4]); }
  for (const [x, z, s] of [[-16, 13, 1.1], [14, 14, 1.0], [-20, 22, 1.2], [21, 24, 1.1], [44, -2, 1.2], [-45, -1, 1.1], [-7, -20, 1.2], [8, -21, 1.0]]) tree(K, x, vf(x, z), z, s, R, 0x4f7f3a);
  K.put(M.paint, lumpGeo(9, 2, 0.15), 18, 0.5, -4.5, 0, 0, 0, 1.0, 0.8, 0.9, 0xd8b860); K.put(M.paint, lumpGeo(11, 2, 0.15), -19, 0.5, 5.8, 0, 0, 0, 0.9, 0.7, 0.8, 0xd0b058);
  // grass tufts / rocks scattered (instanced lumps)
  for (let i = 0; i < 90; i++) { const x = (R() - 0.5) * 90, z = -6 + (R() - 0.5) * 34; if (Math.abs(z - 1.5) < 6 || Math.hypot(x, z - 2) < 9) continue; K.put(M.leaf, lumpGeo(2 + (i % 5), 1, 0.3), x, vf(x, z) + 0.05, z, 0, R() * 6, 0, 0.25 + R() * 0.25, 0.18, 0.25 + R() * 0.25, [0x5a8a3a, 0x6a9a44, 0x7a9a48][i % 3]); }
  K.build(root, 40);
  const glows = [], flames = []; const dust = motes(root, 50, [-8, 8, 0.2, 3, -2, 8], 31, 0.03);
  return { sign, glows, flames, dust, terr };
}

// ================================================================= STORE interior
function buildStore(root) {
  const R = PT.rng(1830), K = new Kit(), X = 4.2, ZB = -3.4, HT = 3.2;
  mesh(root, planeUV(9, 8, 2, 2), M.plank, 0, 0, -0.2, -Math.PI / 2, 0, 0, false);
  K.box(M.logIn, -X, X, 0, HT, ZB - 0.3, ZB, 0xffffff, 0.02); for (const s of [-1, 1]) K.box(M.logIn, s > 0 ? X : -X - 0.3, s > 0 ? X + 0.3 : -X, 0, HT, ZB, 4, 0xffffff, 0.02);
  K.box(M.plank, -X, X, HT, HT + 0.1, ZB, 4, 0x6a4a30, 0.01); for (let i = 0; i < 4; i++) K.box(M.bark, -X, X, HT - 0.22, HT, ZB + 0.5 + i * 1.6, ZB + 0.78 + i * 1.6, 0x6a4a30, 0.04);
  // window on the left wall with daylight
  mesh(root, plane(1.4, 1.1), M.prairie, -X + 0.02, 1.7, -0.6, 0, Math.PI / 2, 0, false); for (const [a, b, y0, y1] of [[-1.35, -1.27, 1.1, 2.3], [0.07, 0.15, 1.1, 2.3]]) K.box(M.plank, -X, -X + 0.1, y0, y1, a - 0.6 + 0.6, b - 0.6 + 0.6, 0x5a3a24, 0.01);
  K.box(M.plank, -X, -X + 0.12, 1.08, 1.16, -1.35, 0.15, 0x5a3a24, 0.01); K.box(M.plank, -X, -X + 0.08, 2.24, 2.32, -1.35, 0.15, 0x5a3a24, 0.01); K.box(M.plank, -X, -X + 0.06, 1.66, 1.72, -1.35, 0.15, 0x5a3a24, 0.01);
  // back shelves full of goods
  for (let r = 0; r < 3; r++) { const y = 0.75 + r * 0.6; K.box(M.plank, -3.6, 3.6, y, y + 0.05, ZB, ZB + 0.45, 0x8a6040, 0.01);
    for (let i = 0; i < 18; i++) { const x = -3.4 + i * 0.4 + (R() - 0.5) * 0.06, k = (i + r) % 4;
      if (k === 0) K.put(M.jar, lathe('lnjar', [[0.001, 0], [0.09, 0], [0.1, 0.05], [0.1, 0.22], [0.07, 0.26], [0.07, 0.3], [0.001, 0.3]], 10), x, y + 0.05, ZB + 0.22, 0, 0, 0, 1, 1, 1, 0xffffff);
      else if (k === 1) K.put(M.paint, cyl(0.09, 0.09, 0.24, 10), x, y + 0.17, ZB + 0.22, 0, 0, 0, 1, 1, 1, [0xc0453a, 0x3a6a9a, 0xd8a040, 0x5a8a4a][i % 4]);
      else if (k === 2) K.box(M.paint, x - 0.16, x + 0.16, y + 0.05, y + 0.42, ZB + 0.05, ZB + 0.4, [0xc8603a, 0x4a6a9a, 0xd8c890, 0x8a4a7a, 0x6a9a6a][i % 5], 0.03);
      else K.put(M.paint, cyl(0.12, 0.12, 0.08, 12), x, y + 0.09, ZB + 0.24, 0, 0, 0, 1, 1, 1, 0xe0d0b0); } }
  mesh(root, plane(2.4, 0.75), M.drySign, 0, 2.95, ZB + 0.04, 0, 0, 0, false);
  // counter with candy jars, scale, ledger
  K.box(M.plank, -2.8, 1.8, 0, 1.0, -1.6, -0.9, 0xa07040, 0.03); K.box(M.plank, -2.9, 1.9, 1.0, 1.07, -1.7, -0.8, 0x6a4028, 0.02);
  for (let i = 0; i < 4; i++) { const x = -2.4 + i * 0.36; K.put(M.jar, lathe('lncandy', [[0.001, 0], [0.11, 0], [0.12, 0.05], [0.12, 0.3], [0.08, 0.34], [0.08, 0.38], [0.001, 0.38]], 12), x, 1.07, -1.25, 0, 0, 0, 1, 1, 1, 0xffffff); K.put(M.paint, sph(0.1, 8, 6), x, 1.2, -1.25, 0, 0, 0, 1, 0.8, 1, [0xe83a5a, 0xf2c040, 0x3ab8a8, 0xe87a3a][i]); }
  K.at(1.2, 1.07, -1.25, 0, () => { K.put(M.brass, cyl(0.12, 0.14, 0.05, 14), 0, 0.02, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); K.beam(M.brass, [0, 0.04, 0], [0, 0.4, 0], 0.02, 0xc8a050, true, 6); K.beam(M.brass, [-0.3, 0.4, 0], [0.3, 0.4, 0], 0.015, 0xc8a050, true, 6); for (const s of [-1, 1]) { K.put(M.brass, cyl(0.11, 0.06, 0.04, 12), s * 0.3, 0.26, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); K.beam(M.metal, [s * 0.3, 0.4, 0], [s * 0.3, 0.28, 0], 0.004, 0x3a3a40, true, 4); } });
  mesh(root, plane(0.24, 0.12), M.priceSign, -1.9, 1.5, -1.25, 0, 0, 0, false);
  // barrels, sacks, crates, stove, broom, hanging lantern
  for (const [x, z, s] of [[3.2, -1.8, 1], [3.6, -0.9, 0.9], [3.1, 0.2, 1]]) barrel(K, x, 0, z, s); for (const [x, z] of [[-3.4, 1.0], [-3.0, 1.6], [2.6, 1.6]]) sack(K, x, 0, z, 1.1, [0xd8c8a0, 0xc8b890, 0xe0d0a8][Math.abs(x | 0) % 3]); crate(K, 2.5, 0, -2.6, 0.7, 0.1); crate(K, 2.5, 0.7, -2.6, 0.55, -0.2);
  K.at(-3.3, 0, -2.0, 0, () => { K.put(M.coal, cyl(0.32, 0.26, 0.8, 14), 0, 0.6, 0, 0, 0, 0, 1, 1, 1, 0x2a2a30); K.put(M.coal, sph(0.36, 14, 10), 0, 1.0, 0, 0, 0, 0, 1, 0.6, 1, 0x2a2a30); K.beam(M.coal, [0, 1.1, 0], [0, HT, 0], 0.07, 0x2a2a30, true, 8); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.beam(M.coal, [a * 0.2, 0, b * 0.2], [a * 0.18, 0.25, b * 0.18], 0.03, 0x2a2a30, true, 4); K.box(M.ember, -0.1, 0.1, 0.5, 0.62, 0.29, 0.31, 0xffffff, 0.005); });
  K.beam(M.bark, [-1.0, 0, 2.2], [-1.4, 1.5, 2.6], 0.025, 0xb8905a, true, 5); K.put(M.hay ? M.hay : M.paint, cyl(0.02, 0.16, 0.3, 8), -1.0, 0.12, 2.2, 0, 0, 0.25, 1, 1, 1, 0xd8b860);
  K.beam(M.metal, [0, HT, 0.4], [0, 2.5, 0.4], 0.01, 0x2a2a30, true, 4); K.put(M.brass, cyl(0.12, 0.1, 0.3, 10), 0, 2.35, 0.4, 0, 0, 0, 1, 1, 1, 0xc8a050); const lamp = mesh(root, sph(0.07, 10, 8), M.lampGlass, 0, 2.33, 0.4, 0, 0, 0, false);
  K.build(root, 3);
  const glows = [glowAt(root, [0, 2.33, 0.45], 0.9, '#ffc070', 0.55), glowAt(root, [-3.3, 0.56, -1.65], 0.5, '#ff8a30', 0.5)];
  const shafts = [shaftAt(root, [-2.6, 1.3, -0.6], 2.0, 3.0, Math.PI / 2 - 0.6, 0.7, 0.16, 0xffe8c0)];
  const dust = motes(root, 50, [-3, 2, 0.5, 2.6, -2.6, 1.5], 31, 0.008);
  return { glows, dust, lamp, ZB };
}

// ================================================================= CABIN (night, candle, tally wall)
function buildCabin(root) {
  const R = PT.rng(1834), K = new Kit(), X = 3.4, ZB = -3.0, HT = 2.8;
  mesh(root, planeUV(8, 8, 2, 2), M.plank, 0, 0, 0, -Math.PI / 2, 0, 0, false);
  K.box(M.logIn, -X, X, 0, HT, ZB - 0.3, ZB, 0xe8d8c8, 0.02); for (const s of [-1, 1]) K.box(M.logIn, s > 0 ? X : -X - 0.3, s > 0 ? X + 0.3 : -X, 0, HT, ZB, 4, 0xe0d0c0, 0.02); K.box(M.plank, -X, X, HT, HT + 0.1, ZB, 4, 0x4a3020, 0.01);
  for (let i = 0; i < 4; i++) K.box(M.bark, -X, X, HT - 0.22, HT, ZB + 0.4 + i * 1.5, ZB + 0.66 + i * 1.5, 0x5a3a24, 0.04);
  // stone fireplace (back wall, left) with fire
  K.box(M.stone, -3.0, -1.4, 0, 1.6, ZB, ZB + 0.6, 0xe0d0c0, 0.04); K.box(M.stone, -2.7, -1.7, 1.6, HT, ZB, ZB + 0.45, 0xe0d0c0, 0.04); K.box(M.coal, -2.6, -1.8, 0.1, 1.0, ZB + 0.3, ZB + 0.62, 0x1a1418, 0.02); K.box(M.plank, -3.1, -1.3, 1.6, 1.7, ZB, ZB + 0.75, 0x5a3a24, 0.02);
  for (let i = 0; i < 3; i++) K.beam(M.bark, [-2.5 + i * 0.12, 0.16, ZB + 0.5], [-1.9 - i * 0.05, 0.22, ZB + 0.35], 0.06, 0x5a3a24, true, 6);
  const flames = []; flame(root, [-2.2, 0.15, ZB + 0.5], 0.9, flames); flame(root, [-2.0, 0.15, ZB + 0.45], 0.7, flames);
  // window with night sky (right wall)
  mesh(root, plane(1.0, 0.9), M.nightWin, X - 0.02, 1.6, -0.6, 0, -Math.PI / 2, 0, false); for (const y of [1.12, 2.06]) K.box(M.plank, X - 0.1, X, y, y + 0.06, -1.15, -0.05, 0x4a3020, 0.01); for (const z of [-1.15, -0.6, -0.05]) K.box(M.plank, X - 0.1, X, 1.12, 2.1, z - 0.03, z + 0.03, 0x4a3020, 0.01);
  // tally wall: carved marks on the back wall, right half (groups of 4 strokes + 1 slash)
  const N = 300, tally = new THREE.InstancedMesh(new THREE.BoxGeometry(0.025, 0.2, 0.012), M.tally, N); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < N; i++) { const grp = Math.floor(i / 5), k = i % 5, col = grp % 12, row = Math.floor(grp / 12), gx = -0.9 + col * 0.33, gy = 2.45 - row * 0.4;
    if (k < 4) { v.set(gx + k * 0.05 + (R() - 0.5) * 0.008, gy + (R() - 0.5) * 0.01, ZB + 0.005); q.setFromEuler(e.set(0, 0, (R() - 0.5) * 0.12)); s.set(1, 1, 1); } else { v.set(gx + 0.075, gy, ZB + 0.01); q.setFromEuler(e.set(0, 0, 1.05)); s.set(1, 1.35, 1); }
    m4.compose(v, q, s); tally.setMatrixAt(i, m4); }
  tally.count = 0; nond(tally); root.add(tally);
  // table with candle + open book, stool, bed with quilt, axe-free woodpile, books on a shelf
  K.at(0.6, 0, -1.2, 0, () => { K.box(M.plank, -0.7, 0.7, 0.72, 0.78, -0.45, 0.45, 0x7a5030, 0.02); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.box(M.plank, a * 0.62 - 0.04, a * 0.62 + 0.04, 0, 0.72, b * 0.38 - 0.04, b * 0.38 + 0.04, 0x5a3a20, 0.01);
    K.put(M.brass, cyl(0.07, 0.08, 0.02, 12), 0.35, 0.79, -0.1, 0, 0, 0, 1, 1, 1, 0xc8a050); K.put(M.paint, cyl(0.025, 0.025, 0.2, 10), 0.35, 0.89, -0.1, 0, 0, 0, 1, 1, 1, 0xf4ecd8);
    K.box(M.plank, -0.35, -0.05, 0.78, 0.82, -0.2, 0.15, 0x6a2a1a, 0.01); K.box(M.plank, -0.05, 0.25, 0.78, 0.82, -0.2, 0.15, 0x6a2a1a, 0.01); });
  const book = mesh(root, plane(0.56, 0.33), M.book, 0.5, 0.83, -1.22, -Math.PI / 2 + 0.05, 0, 0.05, false);
  flame(root, [0.95, 0.99, -1.3], 0.16, flames);
  K.at(0.15, 0, -1.95, 0, () => { K.put(M.plank, cyl(0.2, 0.2, 0.05, 12), 0, 0.45, 0, 0, 0, 0, 1, 1, 1, 0x8a5a38); for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; K.beam(M.plank, [Math.cos(a) * 0.15, 0.43, Math.sin(a) * 0.15], [Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2], 0.03, 0x6a4028, true, 5); } });
  K.at(2.3, 0, -1.6, 0, () => { K.box(M.plank, -0.8, 0.8, 0, 0.45, -1.2, 1.2, 0x6a4028, 0.03); K.put(M.quilt, new THREE.BoxGeometry(1.5, 0.18, 2.2), 0, 0.54, 0, 0, 0, 0, 1, 1, 1, 0xffffff); K.put(M.paint, lumpGeo(4, 2, 0.06), 0, 0.68, -0.8, 0, 0, 0, 0.5, 0.14, 0.28, 0xf2ece0); });
  for (let i = 0; i < 6; i++) K.beam(M.bark, [-3.1 + (i % 3) * 0.02, 0.1 + Math.floor(i / 3) * 0.18 + 0.08, ZB + 0.9 + (i % 3) * 0.2], [-2.0, 0.1 + Math.floor(i / 3) * 0.18 + 0.08, ZB + 0.9 + (i % 3) * 0.2], 0.08, 0x6a4a30, true, 6);
  K.box(M.plank, 1.3, 2.9, 1.9, 1.95, ZB, ZB + 0.3, 0x5a3a24, 0.01); for (let i = 0; i < 7; i++) K.box(M.paint, 1.4 + i * 0.2, 1.55 + i * 0.2, 1.95, 2.2 + (i % 3) * 0.04, ZB + 0.04, ZB + 0.26, [0x8a2a2a, 0x2a4a6a, 0x5a3a24, 0x3a5a3a][i % 4], 0.01);
  K.build(root, 3);
  const glows = [glowAt(root, [-2.1, 0.6, ZB + 0.7], 1.6, '#ff9a40', 0.6), glowAt(root, [0.95, 1.08, -1.25], 0.7, '#ffc070', 0.7)];
  const dust = motes(root, 30, [-2, 2, 0.5, 2.4, -2.4, 0.5], 37, 0.006);
  return { glows, flames, tally, dust, book, ZB };
}

// ================================================================= CAMP (1832 militia, non-violent)
function buildCamp(root) {
  const R = PT.rng(1832), K = new Kit();
  const W = 400, D = 300, g = new THREE.PlaneGeometry(W, D, 120, 100); g.rotateX(-Math.PI / 2); const p = g.attributes.position, c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) - 50, y = cf(x, z); p.setXYZ(i, x, y, z); const n = PT.fbm(x * 0.01 + 7, z * 0.01 + 2, 2, 2, 3, 6), ring = 1 - sm(4, 7, Math.hypot(x, z));
    let col = [0.28 + 0.08 * n, 0.42 + 0.06 * n, 0.17]; col = col.map((v, k) => v * (1 - ring * 0.8) + [0.56, 0.43, 0.29][k] * ring * 0.8); c.set(col, i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.computeVertexNormals(); const terr = new THREE.Mesh(g, M.ground); terr.receiveShadow = true; root.add(terr);
  // A-frame canvas tents in a loose arc behind the ring
  const tent = (x, z, ry, s) => K.at(x, cf(x, z), z, ry, () => { const h = 2.0 * s, w = 1.6 * s, L = 2.6 * s; for (const sd of [-1, 1]) K.put(M.canvas, new THREE.BoxGeometry(Math.hypot(w, h) * 1.02, 0.04, L), sd * w / 2, h / 2, 0, 0, 0, -sd * Math.atan2(h, w), 1, 1, 1, 0xe2d6bc);
    const back = shapeGeo([[-w, 0], [w, 0], [0, -h]], 0.03, 0); K.put(M.canvas, back, 0, 0, -L / 2, -Math.PI / 2, 0, 0, 1, 1, 1, 0xe8dcc4); const fl = shapeGeo([[-w * 0.45, 0], [0, 0], [0, -h * 0.9]], 0.02, 0); K.put(M.canvas, fl, -0.05, 0, L / 2, -Math.PI / 2, 0, 0, 1, 1, 1, 0xe0d4b8); K.put(M.canvas, fl, 0.05, 0, L / 2, -Math.PI / 2, Math.PI, 0, 1, 1, 1, 0xe0d4b8);
    K.beam(M.bark, [0, 0, L / 2 + 0.05], [0, h + 0.3, L / 2 + 0.05], 0.04, 0x6a4a30, true, 5); K.beam(M.paint, [0, h + 0.2, L / 2], [0, 0, L / 2 + 1.4], 0.008, 0xc8b890, true, 4); K.beam(M.paint, [0, h + 0.2, -L / 2], [0, 0, -L / 2 - 1.4], 0.008, 0xc8b890, true, 4); });
  for (const [x, z, ry] of [[-11, -9, 0.4], [-6, -12, 0.15], [0, -13, 0], [6, -12, -0.15], [11.5, -9, -0.4], [-15, -3, 0.9], [15, -2, -0.9], [-20, -14, 0.3], [20, -15, -0.2], [-3, -20, 0.1], [9, -21, -0.1]]) tent(x, z, ry, 1 + R() * 0.15);
  // campfire with stones + logs
  K.at(7.5, cf(7.5, 2), 2, 0, () => { for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; K.put(M.stone, lumpGeo(i + 2, 1, 0.2), Math.cos(a) * 0.55, 0.08, Math.sin(a) * 0.55, 0, 0, 0, 0.16, 0.12, 0.16, 0xd8d0c8); }
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.3; K.beam(M.bark, [Math.cos(a) * 0.45, 0.06, Math.sin(a) * 0.45], [0, 0.45, 0], 0.05, 0x5a3a24, true, 5); } K.put(M.ember, sph(0.2, 8, 6), 0, 0.06, 0, 0, 0, 0, 1, 0.3, 1, 0xffffff);
    for (const s of [-1, 1]) K.beam(M.bark, [s * 0.75, 0, 0], [s * 0.75, 1.1, 0], 0.035, 0x5a3a24, true, 5); K.beam(M.bark, [-0.8, 1.08, 0], [0.8, 1.08, 0], 0.03, 0x5a3a24, true, 5); K.put(M.coal, sph(0.18, 10, 8), 0, 0.82, 0, 0, 0, 0, 1, 0.8, 1, 0x2a2a30); });
  const flames = []; flame(root, [7.5, cf(7.5, 2), 2], 0.9, flames);
  // supply wagon, barrels, crates, pennant pole, logs to sit on
  K.at(-8.5, cf(-8.5, 1), 1, 0.5, () => { K.box(M.plank, -1.2, 1.2, 0.7, 1.2, -0.7, 0.7, 0x9a6a40, 0.03); for (const [x, z] of [[-0.8, -0.75], [0.8, -0.75], [-0.8, 0.75], [0.8, 0.75]]) { K.put(M.plank, new THREE.TorusGeometry(0.5, 0.05, 6, 18), x, 0.52, z, 0, 0, 0, 1, 1, 1, 0x5a3a24); K.beam(M.plank, [x, 0.02, z], [x, 1.02, z], 0.03, 0x5a3a24, true, 4); K.beam(M.plank, [x - 0.5, 0.52, z], [x + 0.5, 0.52, z], 0.03, 0x5a3a24, true, 4); }
    for (let i = 0; i < 4; i++) { const x = -1.0 + i * 0.66; K.put(M.canvas, new THREE.TorusGeometry(0.75, 0.04, 6, 16, Math.PI), x, 1.2, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0xf2ead8); } K.put(M.canvas, new THREE.CylinderGeometry(0.75, 0.75, 2.2, 16, 1, true, 0, Math.PI), 0, 1.2, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0xf2ead8);
    K.beam(M.plank, [1.2, 0.8, 0], [2.6, 0.4, 0], 0.05, 0x6a4a30, true, 5); });
  for (const [x, z] of [[-5.5, -4], [-5.0, -4.5], [5, -6]]) barrel(K, x, cf(x, z), z, 1); crate(K, -4.2, cf(-4.2, -4.2), -4.2, 0.7, 0.3); crate(K, 4.4, cf(4.4, -6.5), -6.5, 0.7, -0.2);
  K.beam(M.bark, [0, 0, -7.5], [0, 7, -7.5], 0.07, 0x7a5a3a, true, 6); const pen = new THREE.Group(); pen.position.set(0, 6.3, -7.5); root.add(pen); mesh(pen, shapeGeo([[0, 0], [1.8, -0.35], [0, -0.7]], 0.01, 0), H.toon({ color: 0xc0453a, side: THREE.DoubleSide }), 0.02, 0.0, 0, Math.PI / 2, 0, 0, false);
  for (const [x, z, ry] of [[4.5, 4.5, 0.6], [-4.5, 5, -0.5]]) K.at(x, cf(x, z), z, ry, () => K.beam(M.bark, [-1, 0.2, 0], [1, 0.22, 0], 0.2, 0x7a5a3a, true, 8));
  for (let i = 0; i < 60; i++) { const x = (R() - 0.5) * 220, z = -26 - R() * 80; tree(K, x, cf(x, z), z, 0.9 + R() * 0.9, R, [0x4a7a3a, 0x5a8a3a, 0x3e6a34][i % 3]); }
  for (const [x, z, s] of [[-24, 4, 1.2], [24, 6, 1.1], [-30, -6, 1.3], [32, -8, 1.2]]) tree(K, x, cf(x, z), z, s, R, 0x4f7f3a);
  for (let i = 0; i < 120; i++) { const x = (R() - 0.5) * 70, z = 10 - R() * 36; if (Math.hypot(x, z) < 8) continue; K.put(M.leaf, lumpGeo(2 + (i % 5), 1, 0.3), x, cf(x, z) + 0.05, z, 0, R() * 6, 0, 0.25 + R() * 0.3, 0.2, 0.25 + R() * 0.3, [0x5a8a3a, 0x6a9a44, 0x7a9a48][i % 3]); }
  K.build(root, 40);
  const glows = [glowAt(root, [7.5, cf(7.5, 2) + 0.6, 2.05], 2.4, '#ff9a40', 0.5)]; const dust = motes(root, 40, [4, 11, 0.3, 4, -1, 5], 41, 0.02);
  return { glows, flames, pen, dust };
}

// ================================================================= HALL (modern)
function buildHall(root) {
  const R = PT.rng(1992), K = new Kit(), X = 5.2, ZB = -4, HT = 4.0;
  mesh(root, planeUV(11, 10, 3, 3), M.wood, 0, 0, 0, -Math.PI / 2, 0, 0, false);
  K.box(M.navy, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(M.navy, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 5, 0xffffff, 0.01);
  K.box(M.wood, -X, X, 0, 0.9, ZB, ZB + 0.05, 0x8a5a38, 0.01); K.box(M.brass, -X, X, 0.9, 0.95, ZB, ZB + 0.07, 0xd8b048, 0.005); mesh(root, plane(2 * X, 10), H.toon({ color: 0x1a2240, side: THREE.DoubleSide }), 0, HT, 0, Math.PI / 2, 0, 0, false).receiveShadow = false;
  // plaque rows (back wall both sides of the featured plaque; side walls)
  const plq = []; for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) { const x = -4.8 + i * 0.8 + (i >= 6 ? 1.6 : 0); if (Math.abs(x) < 1.6) continue; plq.push([x, 1.35 + r * 0.72, ZB + 0.03, 0]); }
  for (const s of [-1, 1]) for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) plq.push([s * (X - 0.03), 1.35 + r * 0.72, ZB + 0.8 + i * 0.75, -s * Math.PI / 2]);
  for (const [x, y, z, ry] of plq) mesh(root, plane(0.46, 0.58), M.plaque, x, y, z, 0, ry, 0, false);
  const big = mesh(root, plane(1.5, 2.0), M.bigPlaque, 0, 2.15, ZB + 0.05, 0, 0, 0, false); K.box(M.wood, -0.85, 0.85, 1.05, 3.25, ZB, ZB + 0.04, 0x4a2a18, 0.01);
  mesh(root, plane(6.0, 0.7), M.hallBanner, 0, 3.55, ZB + 0.04, 0, 0, 0, false);
  // round mat on the floor, ropes-free
  K.put(M.mat, new THREE.CylinderGeometry(2.4, 2.4, 0.08, 40), 0, 0.04, 0.6, 0, 0, 0, 1, 1, 1, 0xffffff);
  // pedestal for the statue (left back), display case (right back), benches
  K.box(M.stone, -3.8, -2.6, 0, 0.9, -3.2, -2.0, 0xe8e4dc, 0.03); K.box(M.stone, -3.9, -2.5, 0.9, 1.0, -3.3, -1.9, 0xf2eee6, 0.02);
  K.at(3.2, 0, -2.6, 0, () => { K.box(M.wood, -0.7, 0.7, 0, 0.9, -0.4, 0.4, 0x4a2a18, 0.02); K.box(M.jar, -0.65, 0.65, 0.9, 1.6, -0.35, 0.35, 0xffffff, 0.01); K.put(M.paint, lumpGeo(6, 2, 0.1), -0.2, 1.05, 0, 0, 0, 0, 0.18, 0.12, 0.3, 0x6a3a20); K.put(M.paint, lumpGeo(8, 2, 0.1), 0.2, 1.05, 0, 0, 0, 0, 0.18, 0.12, 0.3, 0x6a3a20); });
  for (const x of [-3.2, 3.2]) K.box(M.wood, x - 0.9, x + 0.9, 0.42, 0.5, 2.4, 2.8, 0x8a5a38, 0.02);
  K.build(root, 3);
  const cones = []; for (const [x, z, tx, tz] of [[0, -1.5, 0, -3.8], [-3.2, -1.2, -3.2, -2.6], [0, 1.5, 0, 0.6]]) { const cn = nond(mesh(root, coneGeo(), M.cone.clone(), x, HT - 0.05, z, 0, 0, 0, false)); cn.lookAt(new THREE.Vector3(tx, 0.4, tz).add(root.position)); cn.rotateX(Math.PI / 2); cones.push(cn); }
  const glows = [glowAt(root, [0, 2.15, ZB + 0.3], 2.6, '#ffd890', 0.28)]; const dust = motes(root, 50, [-3, 3, 0.5, 3.6, -3, 2], 43, 0.01);
  return { glows, cones, big, dust };
}
let _cone; function coneGeo() { if (!_cone) { _cone = new THREE.ConeGeometry(0.9, 4.0, 20, 1, true); _cone.translate(0, -2.0, 0); } return _cone; }

// ================================================================= lights, grades, API
const SET_LIGHT = {
  village: { top: '#3f7ad0', hor: '#c0d8f0', fog: '#cfe0ec', fogN: 60, fogF: 600, sky: '#a0b8f0', ground: '#6a6a48', hemiI: 0.72, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#ffe8c0', sunI: 3.7, az: 30, el: 46, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  villageGold: { top: '#4a78c8', hor: '#ffd8a8', fog: '#f4dcb8', fogN: 60, fogF: 600, sky: '#98a0dc', ground: '#5a5048', hemiI: 0.9, fillCol: '#7080d8', fillI: 0.32, sunCol: '#ffd09a', sunI: 3.3, az: 50, el: 26, disc: '#fff0c8', discSize: 0.003, clouds: true, stars: 0, cardTint: '#fff2e2', fxTint: '#fff6ea', shafts: 0.4 },
  villageSun: { top: '#3a4aa8', hor: '#ffa070', fog: '#f0a888', fogN: 60, fogF: 600, sky: '#8a88d0', ground: '#5a4060', hemiI: 0.95, fillCol: '#6a70d8', fillI: 0.4, sunCol: '#ffa060', sunI: 3.0, az: -55, el: 9, disc: '#fff0c0', discSize: 0.004, clouds: true, stars: 0, cardTint: '#ffeee0', fxTint: '#fff0e8', shafts: 0.6 },
  villageDawn: { top: '#5a78c8', hor: '#ffd0a8', fog: '#f4d4b8', fogN: 60, fogF: 600, sky: '#a0a0e0', ground: '#5a5050', hemiI: 0.95, fillCol: '#7a88e0', fillI: 0.35, sunCol: '#ffc890', sunI: 3.2, az: -30, el: 14, disc: '#fff4d8', discSize: 0.003, clouds: true, stars: 0, cardTint: '#fff4ea', fxTint: '#fff8f0', shafts: 0.5 },
  store: { top: '#000000', hor: '#3a2a1e', fog: '#3b2a1d', fogN: 10, fogF: 60, sky: '#ffe8c8', ground: '#6a4a32', hemiI: 1.0, fillCol: '#8a90c8', fillI: 0.3, sunCol: '#ffe0b0', sunI: 2.6, az: -110, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  cabin: { top: '#000000', hor: '#140c18', fog: '#1a1018', fogN: 6, fogF: 40, sky: '#7a6ab8', ground: '#3a2420', hemiI: 0.55, fillCol: '#4a50a8', fillI: 0.3, sunCol: '#ffb070', sunI: 1.3, az: -60, el: 25, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ffe0c8', fxTint: '#fff0e0', shafts: 0 },
  camp: { top: '#4a86d6', hor: '#c8dcee', fog: '#d4e2ec', fogN: 60, fogF: 600, sky: '#a8bcf0', ground: '#6a6a48', hemiI: 0.7, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#fff0d0', sunI: 3.6, az: -25, el: 44, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  campDusk: { top: '#2a2a6a', hor: '#e88a70', fog: '#a87888', fogN: 50, fogF: 500, sky: '#7a70c0', ground: '#3a3048', hemiI: 0.9, fillCol: '#5a60c8', fillI: 0.4, sunCol: '#ff9060', sunI: 2.0, az: 60, el: 7, disc: '#ffe0b0', discSize: 0.004, clouds: true, stars: 0.3, cardTint: '#f8e4e0', fxTint: '#fff0e8', shafts: 0.5 },
  hall: { top: '#000000', hor: '#141a30', fog: '#141a30', fogN: 10, fogF: 50, sky: '#c8d0ff', ground: '#3a2a30', hemiI: 0.95, fillCol: '#7a88e8', fillI: 0.4, sunCol: '#ffe0b8', sunI: 2.2, az: 15, el: 50, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff4ec', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  village: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.08, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.36, 0.86], vig: [0.24, 0.5, '#4a3a5a'] } },
  villageGold: { look: 'golden', over: { exp: 1.06, con: 1.22, sat: 1.02, tS: ['#3a3a8a', 0.16], tH: ['#ffd8a0', 0.07], bloom: [0.42, 0.82], hal: [0.12, '#ffb060'], vig: [0.3, 0.5, '#2a2440'] } },
  villageSun: { look: 'golden', over: { exp: 1.08, con: 1.24, sat: 1.08, tS: ['#2a3a8a', 0.2], tH: ['#ffb070', 0.14], bloom: [0.44, 0.75], hal: [0.3, '#ff9a50'], vig: [0.32, 0.48, '#1e1a3a'] } },
  villageDawn: { look: 'golden', over: { exp: 1.08, con: 1.2, sat: 1.04, tS: ['#3a4a9a', 0.16], tH: ['#ffd0a0', 0.1], bloom: [0.42, 0.8], hal: [0.2, '#ffb070'], vig: [0.28, 0.5, '#2a2440'] } },
  store: { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.06, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.42, 0.78], hal: [0.26, '#ff9a50'], vig: [0.34, 0.46, '#2a1420'] } },
  cabin: { look: 'night', over: { exp: 1.12, con: 1.22, sat: 1.0, lift: [0.03, 0.02, 0.05], tS: ['#2a2a6a', 0.24], tH: ['#ffb070', 0.14], bloom: [0.5, 0.7], hal: [0.34, '#ff9040'], vig: [0.42, 0.42, '#140a1a'] } },
  camp: { look: 'day', over: { exp: 1.05, con: 1.22, sat: 1.04, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c0', 0.05], bloom: [0.34, 0.86], vig: [0.24, 0.5, '#4a3a5a'] } },
  campDusk: { look: 'golden', over: { exp: 1.04, con: 1.22, sat: 1.0, tS: ['#2a2a7a', 0.22], tH: ['#ffa070', 0.14], bloom: [0.45, 0.74], hal: [0.3, '#ff8a50'], vig: [0.36, 0.46, '#1a1430'] } },
  hall: { look: 'office', over: { exp: 1.1, con: 1.24, sat: 1.1, tS: ['#1a2a6a', 0.2], tH: ['#ffd8a0', 0.1], bloom: [0.45, 0.76], hal: [0.24, '#ffc070'], vig: [0.34, 0.46, '#0a1028'] } },
};

export function buildLN(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { tally: 0, mood: 'village' };
  let vl, st, cb, cp, hl;
  const API = makeAPI(ctx, { prefix: 'ln_', origin: LN_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { village: 'day', villageGold: 'golden', villageSun: 'golden', villageDawn: 'golden', store: 'office', cabin: 'office', camp: 'day', campDusk: 'golden', hall: 'office' },
    practicals: (name, F, W3) => { const fl = 1 + 0.08 * Math.sin(F * 0.7) + 0.05 * Math.sin(F * 1.9);
      if (name === 'store') return [{ p: W3('store', [0, 2.3, 0.4]), col: '#ffc880', I: 3.2 * fl, d: 6 }, { p: W3('store', [-3.3, 0.7, -1.5]), col: '#ff8a40', I: 1.6 * fl, d: 3 }, { p: W3('store', [-2.6, 1.8, -0.6]), col: '#fff0d0', I: 3.2, d: 6 }];
      if (name === 'cabin') return [{ p: W3('cabin', [-2.1, 0.7, -2.2]), col: '#ff9a40', I: 4.2 * fl, d: 6 }, { p: W3('cabin', [0.95, 1.15, -1.25]), col: '#ffc070', I: 2.4 * fl, d: 4 }, { p: W3('cabin', [3.0, 1.6, -0.6]), col: '#8a98e8', I: 1.2, d: 4 }];
      if (name === 'camp' || name === 'campDusk') return [{ p: W3('camp', [7.5, 1.0, 2]), col: '#ff9a50', I: (name === 'campDusk' ? 6 : 1.5) * fl, d: 8 }];
      if (name === 'hall') return [{ p: W3('hall', [0, 3.6, -2.6]), col: '#ffe0b0', I: 5, d: 6 }, { p: W3('hall', [-3.2, 3.4, -2.0]), col: '#ffe8c8', I: 3, d: 5 }, { p: W3('hall', [0, 3.4, 1.5]), col: '#e0e4ff', I: 4, d: 6 }];
      return []; },
    tick: (f, cur) => { const T = f / 30; const flick = (list) => list.forEach((fl, i) => { const k = 1 + 0.12 * Math.sin(f * 0.9 + i * 2) + 0.08 * Math.sin(f * 2.3 + i); fl.scale.set(1 / k, k, 1); });
      if (cur === 'cabin' && cb) { flick(cb.flames); cb.glows.forEach((g, i) => (g.material.opacity = g.userData.op * (0.85 + 0.15 * Math.sin(f * 0.8 + i)))); tickMotes(cb.dust, f, 0.3); }
      if (cur === 'camp' && cp) { flick(cp.flames); cp.pen.rotation.y = 0.25 * Math.sin(T * 1.6); tickMotes(cp.dust, f, 1.2); }
      if (cur === 'store' && st) tickMotes(st.dust, f, 0.5);
      if (cur === 'hall' && hl) tickMotes(hl.dust, f, 0.4);
      if (cur === 'village' && vl) tickMotes(vl.dust, f, 1.5); },
    mood: (name) => { ST.mood = name; if (cp) cp.glows.forEach((g) => (g.material.opacity = g.userData.op * (name === 'campDusk' ? 1 : 0.35))); },
    apply: (v) => { if (v.tally != null) API.tally(v.tally); } });
  vl = buildVillage(API.groups.village); st = buildStore(API.groups.store); cb = buildCabin(API.groups.cabin); cp = buildCamp(API.groups.camp); hl = buildHall(API.groups.hall);
  API.parts = { vl, st, cb, cp, hl };
  API.tally = (n) => { ST.tally = n; cb.tally.count = Math.max(0, Math.min(300, Math.round(n))); };
  API.glows = { village: vl.glows, store: st.glows, cabin: [...cb.glows, ...cb.flames], camp: [...cp.glows, ...cp.flames], hall: hl.glows };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  const V = API.V;
  API.views = [
    V('village', [0, 1.7, 16], [0, 2.4, -6], 46, 0.6, [0, 1.4, 2]), // 0 street toward the store
    V('village', [-18, 7, 26], [0, 1.2, -4], 40, 0.4, [0, 1, 2]), // 1 high wide
    V('villageGold', [3, 1.4, 9], [-1, 1.6, 0], 50, 1.2, [-0.5, 1.2, 2]), // 2 fight ring golden
    V('villageSun', [5, 1.5, 10], [-2, 2.2, -4], 50, 0.8), // 3 sunset
    V('villageDawn', [-4, 1.6, 10], [2, 2.6, -6], 48, 0.8), // 4 dawn
    V('store', [0.4, 1.6, 2.8], [-0.4, 1.3, -3.0], 56, 1.4, [0, 1.1, -1.2]), // 5 store wide
    V('cabin', [0.8, 1.5, 2.2], [-0.2, 1.4, -3.0], 58, 1.4, [0.5, 1.0, -1.2], { tally: 300 }), // 6 cabin wide
    V('cabin', [0.6, 1.9, -0.8], [0.4, 1.9, -3.0], 52, 3, [0.4, 1.9, -3.0], { tally: 140 }), // 7 tally close
    V('camp', [0, 1.6, 12], [0, 1.6, -6], 48, 0.6, [0, 1.2, 1]), // 8 camp wide
    V('campDusk', [4, 1.4, 9], [1, 1.5, 0], 50, 1.0), // 9 camp dusk
    V('hall', [0.3, 1.6, 4.4], [0, 1.9, -3.8], 56, 1.4, [0, 1.6, -1.5]), // 10 hall wide
    V('hall', [0, 2.1, -1.2], [0, 2.15, -4], 46, 3, [0, 2.15, -4]), // 11 big plaque close
  ];
  API.tally(0); API.tick(0);
  return API;
}
