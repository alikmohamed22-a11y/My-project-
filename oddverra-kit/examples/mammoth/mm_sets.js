// mm_sets.js [MM-sets]: sets for "Woolly mammoths were alive when the Great Pyramid was built" (Oddverra short).
//   island : Wrangel Island, the home location, revisited in every mood: rolling Arctic tundra (sedge, moss, cotton-grass, Arctic
//            poppies, snow patches, boulders) climbing to snowy mountains, a shingle shore on the right onto a dark Arctic sea with
//            drifting ice floes. A 3D distant herd (instanced low-poly mammoths, setHerd(n) / setGone(t)), a tusk-and-skull relic
//            (setRelic), a skin boat that beaches (setBoat), a rain-on-snow ice crust that seals the tundra (setIce) with falling rain
//            (setRain). Moods 'islandDay', 'islandGold', 'islandDusk', 'islandNight' (the "You see" storm), 'islandDawn'.  (-174000,0,0)
//   giza   : Giza, about 2560 BC: sand, the Great Pyramid under construction (stepped core, the casing creeping up from the base,
//            a mud-brick ramp, block piles, a sledge, palms, tents and the Nile's green strip far off); setPyr(1) shows it finished
//            with a gilded cap. A night sky with a mammoth constellation (setConst). Moods 'gizaGold', 'gizaDay', 'gizaNight'. (-174000,0,800)
//   lab    : an ancient-DNA lab today: bench, microscope, sample rack, a tusk sample, a big DNA helix model whose red "bad" rungs
//            pop out one by one (setWeed), a genome-chart screen, shelves, window. Moods 'lab', 'labNight'.           (-176500,0,0)
//   map    : a lamp-lit map table: an old painted relief map of Siberia and Wrangel Island, a sea that rises and drowns the land
//            bridge (setSea), tiny mammoth figures on both sides (setMainland fades the mainland herd), paper flags, compass,
//            dividers, candle. Mood 'map'.                                                                            (-176500,0,800)
// Each set: local frame, camera side +z. Test flag ?mmview=N (main.js).
import { H, TAU, clamp01, sm, SERIF, SANS, cyl, sph, plane, planeUV, mesh, nond, lumpGeo, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';

export const MM_ORIGIN = { island: [-174000, 0, 0], giza: [-174000, 0, 800], lab: [-176500, 0, 0], map: [-176500, 0, 800] };
const GROUP_OF = { islandDay: 'island', islandGold: 'island', islandDusk: 'island', islandNight: 'island', islandDawn: 'island', gizaGold: 'giza', gizaDay: 'giza', gizaNight: 'giza', lab: 'lab', labNight: 'lab', map: 'map' };
export const ISL = { SHORE: 17.5, SEA: -0.42 };
export const MAPT = { Y: 0.92 };
export const PYR = { Z: -90, B: 44, HT: 27 };
let THREE, PT, M;

// ---------------------------------------------------------------- painters
function snowTex(g, w, h) { g.fillStyle = '#eef2fa'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 3, 3, 4, 19)); g.fillStyle = 'rgba(150,170,220,0.22)'; for (let i = 0; i < 50; i++) { g.beginPath(); g.ellipse((i * 97) % w, (i * 61) % h, 26, 7, 0.2, 0, TAU); g.fill(); } }
function tundraTex(g, w, h) { g.fillStyle = '#ece6d6'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.82 + 0.3 * PT.fbm(u, v, 6, 6, 4, 23)); const R = PT.rng(31);
  for (let i = 0; i < 900; i++) { const x = R() * w, y = R() * h, L = 4 + R() * 9; g.strokeStyle = ['rgba(90,110,50,0.55)', 'rgba(140,120,60,0.5)', 'rgba(70,80,40,0.5)', 'rgba(170,150,90,0.4)'][i % 4]; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 4, y - L); g.stroke(); }
  for (let i = 0; i < 70; i++) { g.fillStyle = i % 3 ? 'rgba(255,255,255,0.75)' : 'rgba(255,220,60,0.8)'; g.beginPath(); g.arc(R() * w, R() * h, 1.6 + R() * 1.4, 0, TAU); g.fill(); } }
function seaTex(g, w, h) { g.fillStyle = '#2a4a66'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => { const a = PT.fbm(u, v, 4, 16, 3, 5), b = PT.fbm(u, v, 12, 40, 2, 9); return 0.78 + 0.5 * (0.65 * a + 0.35 * b) ** 2; });
  const R = PT.rng(7); g.strokeStyle = 'rgba(220,240,255,0.42)'; g.lineCap = 'round'; for (let i = 0; i < 110; i++) { const x = R() * w, y = R() * h, L = 10 + R() * 40; g.lineWidth = 1.4 + R() * 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L / 2, y - 3, x + L, y); g.stroke(); } }
function sandTex(g, w, h) { g.fillStyle = '#f4ece0'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.22 * PT.fbm(u, v, 5, 5, 4, 41)); const R = PT.rng(43); g.strokeStyle = 'rgba(160,110,60,0.22)'; g.lineWidth = 2;
  for (let i = 0; i < 40; i++) { const y = R() * h, x = R() * w; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 40, y - 8, x + 90, y + 2); g.stroke(); } grain(g, w, h, 'rgba(120,80,40,1)', 1600, 44, 0.25); }
function ashlarTex(base, seed) { return (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.22 * PT.fbm(u, v, 6, 6, 3, seed)); const R = PT.rng(seed), rows = 6;
  for (let r = 0; r < rows; r++) { const y = r * h / rows; g.fillStyle = 'rgba(90,60,30,0.45)'; g.fillRect(0, y, w, 3); let x = (r % 2) * 30 - 30; while (x < w) { const bw = 50 + R() * 50; g.fillRect(x, y, 3, h / rows); g.fillStyle = `rgba(255,240,210,${0.06 + R() * 0.12})`; g.fillRect(x + 4, y + 4, bw - 8, h / rows - 8); g.fillStyle = 'rgba(90,60,30,0.45)'; x += bw; } }
  grain(g, w, h, 'rgba(90,60,30,1)', 900, seed + 1, 0.2); }; }
function parchTex(g, w, h) { PT.paper(g, w, h, {}); g.strokeStyle = 'rgba(120,80,40,0.25)'; g.lineWidth = 1; for (let i = 1; i < 12; i++) { g.beginPath(); g.moveTo(i * w / 12, 0); g.lineTo(i * w / 12, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 12); g.lineTo(w, i * h / 12); g.stroke(); } }
function mapSeaTex(g, w, h) { g.fillStyle = '#6a9ab0'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.2 * PT.fbm(u, v, 4, 4, 3, 61)); g.strokeStyle = 'rgba(30,50,90,0.35)'; g.lineWidth = 2;
  for (let y = 10; y < h; y += 22) for (let x = (y % 44) - 10; x < w; x += 44) { g.beginPath(); g.arc(x, y, 9, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } }
function labelTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 6, 2, 3, 7)); g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.05; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08);
  const n = lines.length; lines.forEach((s, i) => txt(g, s, w / 2, h * (i + 0.55) / n, w * 0.88, h * (n > 1 ? 0.36 : 0.56), { col: (o.cols || [])[i] || o.col || '#3a2414', font: o.font || SERIF })); }; }
function screenTex(g, w, h) { g.fillStyle = '#0e1a2a'; g.fillRect(0, 0, w, h); g.fillStyle = '#18324a'; g.fillRect(0, 0, w, h * 0.14); txt(g, 'WRANGEL ISLAND GENOMES', w / 2, h * 0.07, w * 0.9, h * 0.08, { col: '#8ad8ff', font: SANS });
  const R = PT.rng(2024); for (let r = 0; r < 14; r++) { const y = h * 0.2 + r * h * 0.052; g.fillStyle = r % 2 ? '#14263a' : '#102030'; g.fillRect(w * 0.05, y, w * 0.9, h * 0.046); for (let k = 0; k < 40; k++) { const c = R(); g.fillStyle = c > 0.93 ? '#ff4a5a' : ['#4ad88a', '#4aa8ff', '#ffd84a', '#c88aff'][(c * 4) | 0]; g.fillRect(w * 0.06 + k * w * 0.0218, y + 3, w * 0.018, h * 0.046 - 6); } }
  g.strokeStyle = '#ffd84a'; g.lineWidth = 3; g.beginPath(); for (let i = 0; i <= 40; i++) { const x = w * 0.06 + i * w * 0.022, y = h * 0.95 - h * 0.12 * (0.5 + 0.4 * Math.sin(i * 0.4) * Math.exp(-i * 0.03)); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
function posterTex(g, w, h) { g.fillStyle = '#f2ecdc'; g.fillRect(0, 0, w, h); txt(g, 'MAMMUTHUS PRIMIGENIUS', w / 2, h * 0.09, w * 0.86, h * 0.06, { col: '#2a2440', font: SERIF });
  g.fillStyle = '#6a4a30'; g.beginPath(); g.ellipse(w * 0.46, h * 0.5, w * 0.3, h * 0.18, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(w * 0.72, h * 0.4, w * 0.12, h * 0.12, 0, 0, TAU); g.fill();
  for (const x of [0.25, 0.38, 0.55, 0.66]) g.fillRect(w * x, h * 0.6, w * 0.07, h * 0.24); g.strokeStyle = '#f2ecdc'; g.lineWidth = 10; g.beginPath(); g.moveTo(w * 0.78, h * 0.48); g.quadraticCurveTo(w * 0.92, h * 0.66, w * 0.86, h * 0.4); g.stroke();
  txt(g, 'WRANGEL ISLAND  ~10,000 - ~4,000 YEARS AGO', w / 2, h * 0.93, w * 0.9, h * 0.04, { col: '#5a3a24', font: SANS }); }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.tundra = vc({ map: T(512, 512, tundraTex, [1 / 9, 1 / 9]) }); m.snow = vc({ map: T(512, 512, snowTex) }); m.rock = vc({ map: T(256, 256, (g, w, h) => PT.stone(g, w, h, { base: '#8a8a94' })) });
  m.sea = toon({ map: T(512, 512, seaTex, [1 / 24, 1 / 24]), color: 0xd0e4f0, emissive: 0x0a1a2c }); m.seaT = m.sea.map;
  m.floe = toon({ color: 0xeef6ff, emissive: 0x2a3a5a }); m.iceCrust = toon({ color: 0xa8d0ff, emissive: 0x24406a, transparent: true, opacity: 0, depthWrite: false });
  m.fur = vc(); m.ivory = vc({ emissive: 0x2a2418 }); m.leaf = vc(); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) });
  m.sand = vc({ map: T(512, 512, sandTex, [1 / 8, 1 / 8]) }); m.lime = vc({ map: T(512, 512, ashlarTex('#dcc08a', 47)) }); m.casing = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#f2e6c8'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.93 + 0.09 * PT.fbm(u, v, 4, 4, 3, 51)); }) });
  m.brick = vc({ map: T(256, 256, (g, w, h) => PT.brick(g, w, h, { base: '#8a6a48', rows: 10, cols: 5, seed: 9 })) }); m.plank = vc({ map: T(256, 256, (g, w, h) => PT.planks(g, w, h, { base: '#8a6040', n: 6, seed: 52 })) });
  m.cloth = vc(); m.gold = vc({ emissive: 0x5a3a08 }); m.hide = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#c8a070'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.82 + 0.3 * PT.fbm(u, v, 3, 3, 4, 71)); }) });
  m.parch = vc({ map: T(1024, 1024, parchTex) }); m.mapSea = toon({ map: T(512, 512, mapSeaTex, [1 / 0.8, 1 / 0.8]), transparent: true, opacity: 0.92, emissive: 0x0a1a24 }); m.mapSea.map.repeat.set(3, 3);
  m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#6a4430', n: 5, seed: 33 })) }); m.wall = vc({ map: T(256, 256, (g, w, h) => PT.stone(g, w, h, { base: '#6a5a6a' })) });
  m.labWall = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#d8e0e4'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.95 + 0.06 * PT.fbm(u, v, 4, 4, 2, 81)); }) }); m.labFloor = vc({ map: T(512, 512, (g, w, h) => { g.fillStyle = '#9aa8b0'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(40,50,60,0.3)'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * w / 8, 0); g.lineTo(i * w / 8, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 8); g.lineTo(w, i * h / 8); g.stroke(); } }, [1 / 2, 1 / 2]) });
  m.steel = vc({ emissive: 0x101820 }); m.screen = new THREE.MeshBasicMaterial({ map: T(1024, 640, screenTex), fog: false }); m.screen.color.setScalar(1.05); m.poster = em(T(512, 640, posterTex), 0x30302a);
  m.rungR = vc({ emissive: 0x5a0a10 }); m.glassJ = toon({ color: 0xcfe8f0, transparent: true, opacity: 0.4, depthWrite: false, emissive: 0x18303a });
  m.winSky = new THREE.MeshBasicMaterial({ color: 0x9ac0f0, fog: false }); m.flagW = em(T(512, 128, labelTex(['WRANGEL ISLAND'], { bg: '#fff4d8', col: '#a02a2a' })), 0x302418); m.flagS = em(T(512, 128, labelTex(['SIBERIA'], { bg: '#fff4d8', col: '#2a3a6a' })), 0x302418);
  m.flagO = em(T(512, 128, labelTex(['ARCTIC OCEAN'], { bg: '#e8f0f4', col: '#1a3a6a', rim: '#1a3a6a' })), 0x202838); m.flagN = em(T(256, 128, labelTex(['N'], { bg: '#fff4d8', col: '#3a2414' })), 0x302418);
  m.signLab = em(T(1024, 160, labelTex(['ANCIENT DNA LAB'], { bg: '#2a3a5a', col: '#f0f4ff', rim: '#8ab0e8', font: SANS })), 0x202838);
  m.star = new THREE.MeshBasicMaterial({ map: T(128, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(255,250,220,0.9)'); gr.addColorStop(0.45, 'rgba(180,200,255,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0 });
  m.constLine = new THREE.MeshBasicMaterial({ color: 0xbcd0ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0 });
  m.rain = new THREE.MeshBasicMaterial({ color: 0xc8d8ff, transparent: true, opacity: 0.5, depthWrite: false, fog: true });
  m.candle = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd890).multiplyScalar(2.0), fog: false });
  return m; }

// ---------------------------------------------------------------- shared props
function terrain(root, mat, W, D, NX, NZ, zc, fn, colFn, a = 1, xc = 0) { const g = new THREE.PlaneGeometry(W, D, NX, NZ); g.rotateX(-Math.PI / 2); const p = g.attributes.position, c = new Float32Array(p.count * 3), uv = g.attributes.uv, mp = (u) => a * u + (1 - a) * u * u * u;
  for (let i = 0; i < p.count; i++) { const x = W / 2 * mp(p.getX(i) / (W / 2)) + xc, z = D / 2 * mp(p.getZ(i) / (D / 2)) + zc, y = fn(x, z); p.setXYZ(i, x, y, z); uv.setXY(i, x, z); c.set(colFn(x, y, z), i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.computeVertexNormals(); const t = new THREE.Mesh(g, mat); t.receiveShadow = true; root.add(t); return t; }
const hexc = (h) => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
const mixa = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
// a low-poly woolly mammoth (facing +x, ~3.4 m tall) as a prefab for the instanced herd
function mammothPrefab(K, furC = 0x7a4a2a) { const lump = (s) => lumpGeo(s, 1, 0.12);
  K.put(M.fur, lump(1), 0, 2.05, 0, 0, 0, 0, 1.75, 1.25, 1.05, furC); K.put(M.fur, lump(2), 0.75, 2.75, 0, 0, 0, 0.3, 0.95, 0.85, 0.85, furC); K.put(M.fur, lump(3), 1.65, 2.55, 0, 0, 0, 0, 0.62, 0.78, 0.6, furC);
  K.put(M.fur, lump(4), 1.55, 3.15, 0, 0, 0, 0, 0.34, 0.3, 0.3, furC);
  for (const [x, z] of [[-0.95, 0.42], [-0.95, -0.42], [0.85, 0.45], [0.85, -0.45]]) K.put(M.fur, cyl(0.34, 0.3, 1.5, 7), x, 0.75, z, 0, 0, 0, 1, 1, 1, furC);
  const trunk = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[2.05, 2.35, 0], [2.35, 1.6, 0], [2.3, 0.8, 0], [2.5, 0.5, 0]].map((p) => new THREE.Vector3(...p))), 10, 0.16, 6); K.put(M.fur, trunk, 0, 0, 0, 0, 0, 0, 1, 1, 1, furC);
  for (const s of [-1, 1]) { const tusk = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[1.95, 2.05, 0.22 * s], [2.5, 1.3, 0.42 * s], [3.2, 1.45, 0.5 * s], [3.25, 2.0, 0.32 * s]].map((p) => new THREE.Vector3(...p))), 12, 0.08, 6); K.put(M.ivory, tusk, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xf0e6d0); }
  K.beam(M.fur, [-1.7, 2.3, 0], [-1.95, 1.4, 0], 0.08, furC); }
function makeHerd(root, n, seed) { const K = new Kit(); mammothPrefab(K); const pf = K.prefab(), R = PT.rng(seed), list = [], ims = [];
  for (const [mat, geo] of pf) { const im = new THREE.InstancedMesh(geo, mat, n); im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; root.add(im); ims.push(im); }
  const tints = [0xffffff, 0xd8ccc0, 0xfff0dc, 0xc4b8ac, 0xf0dcc8].map((h) => new THREE.Color(h));
  ims.forEach((im) => { if (im.material === M.fur) for (let i = 0; i < n; i++) im.setColorAt(i, tints[i % tints.length]); else for (let i = 0; i < n; i++) im.setColorAt(i, new THREE.Color(0xf0e6d0)); if (im.instanceColor) im.instanceColor.needsUpdate = true; });
  return { ims, list, n, R }; }
// herd layout: list of [x, z, ry, s, rank] ; layoutHerd fills matrices with grow/vanish factors
function setHerdMats(H2, fy, show, gone, f) { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3(); let k = 0;
  H2.list.forEach((t, i) => { const [x, z, ry, sc, rank] = t; let a = show(i, rank); a *= 1 - clamp01((gone - rank * 0.9) / 0.1); if (a <= 0.001) return;
    const bob = Math.sin(f * 0.08 + i) * 0.03; m4.compose(v.set(x, fy(x, z) + bob, z), q.setFromEuler(e.set(0, ry + 0.06 * Math.sin(f * 0.03 + i * 1.3), 0)), s.set(sc * a, sc * a, sc * a));
    H2.ims.forEach((im) => im.setMatrixAt(k, m4)); k++; });
  H2.ims.forEach((im) => { im.count = k; im.instanceMatrix.needsUpdate = true; }); }

// ================================================================= ISLAND (Wrangel Island)
export const islH = (x, z) => { let y = 0.22 * Math.sin(x * 0.17) * Math.cos(z * 0.13) + 0.12 * Math.sin(x * 0.43 + z * 0.31) + 0.05 * Math.sin(x * 1.3 + z * 0.9);
  const near = sm(-6, -22, z) * 0.6 + 0.4; y *= near;
  y += sm(-22, -70, z) * (2.4 + 1.8 * Math.sin(x * 0.07 + 0.5)) + sm(-70, -150, z) * (14 + 9 * Math.sin(x * 0.045 + 1.2) + 4 * Math.sin(x * 0.13));
  const sh = ISL.SHORE - 2.5 * Math.sin(z * 0.06) - 0.03 * z; if (x > sh) y -= (x - sh) * 0.32 + (x - sh) ** 2 * 0.01;
  return y; };
function buildIsland(root) { const R = PT.rng(4000), K = new Kit(), TUFT = new THREE.ConeGeometry(0.5, 1, 5);
  const cT = [hexc('#7a7a46'), hexc('#6e5e3a'), hexc('#5e6e3e'), hexc('#8a7a4e')], cS = hexc('#eef2fa'), cR = hexc('#8a8478'), cSh = hexc('#8a8070');
  terrain(root, M.tundra, 340, 300, 170, 150, -110, islH, (x, y, z) => { const n = Math.sin(x * 0.21 + z * 0.17) * 0.5 + 0.5, n2 = Math.sin(x * 0.53 - z * 0.37) * 0.5 + 0.5; let c = mixa(cT[(n * 3.99) | 0], cT[(n2 * 3.99) | 0], 0.5);
    const sh = ISL.SHORE - 2.5 * Math.sin(z * 0.06) - 0.03 * z; if (x > sh - 1.2) c = mixa(c, cSh, clamp01((x - sh + 1.2) / 1.6));
    const snowy = clamp01((y - 5) / 3) + clamp01((n2 * n - 0.55) * 4) * (z < -14 ? 1 : 0.25); return mixa(c, cS, clamp01(snowy)); }, 0.55, 0);
  const sea = mesh(root, planeUV(420, 360, 1, 1), M.sea, 200, ISL.SEA, -100, -Math.PI / 2, 0, 0, false); sea.receiveShadow = true; { const uv = sea.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 420, uv.getY(i) * 360); }
  // shingle shore stones, boulders, snow patches, tundra tufts, arctic poppies, cotton grass
  for (let i = 0; i < 140; i++) { const z = 8 - R() * 70, x = ISL.SHORE - 2.5 * Math.sin(z * 0.06) - 0.03 * z - 1.5 + R() * 3; K.put(M.rock, lumpGeo(i % 9, 1, 0.3), x, islH(x, z) + 0.02, z, 0, R() * 6, 0, 0.14 + R() * 0.22, 0.08 + R() * 0.1, 0.14 + R() * 0.2, [0x8a8a94, 0x6a6a74, 0x9a948a][i % 3]); }
  for (let i = 0; i < 46; i++) { const x = -40 + R() * 56, z = 4 - R() * 70; if (Math.abs(x + 1) < 7 && z > -16) continue; const s = 0.4 + R() * 1.6; K.put(M.rock, lumpGeo(20 + (i % 9), 1, 0.3), x, islH(x, z) + 0.1 * s, z, 0, R() * 6, 0, s, s * 0.7, s * 0.9, [0x8a8a94, 0x7a7a84, 0x9a9488][i % 3]); }
  for (const [x, z, s] of [[-7.5, -3, 1.3], [8.5, -6, 1.1], [-10, -14, 2.0], [12, -16, 1.6], [5.5, 3.5, 0.6]]) K.put(M.rock, lumpGeo(Math.round(x * 7 + z), 1, 0.32), x, islH(x, z) + 0.2 * s, z, 0, s, 0, s * 1.1, s * 0.8, s, 0x8a8a94);
  for (let i = 0; i < 60; i++) { const x = -60 + R() * 76, z = -8 - R() * 90; const s = 1 + R() * 3; K.put(M.snow, lumpGeo(40 + (i % 9), 1, 0.2), x, islH(x, z) - 0.05, z, 0, R() * 3, 0, s * 1.4, 0.18 + R() * 0.2, s, 0xe8eef8); }
  for (let i = 0; i < 520; i++) { const x = -30 + R() * 46, z = 9 - R() * 46; if (x > ISL.SHORE - 2) continue; const s = 0.12 + R() * 0.2;
    K.put(M.leaf, TUFT, x, islH(x, z) + s * 0.4, z, (R() - 0.5) * 0.3, R() * 6, (R() - 0.5) * 0.3, s * 0.9, s * 1.4, s * 0.9, [0x8a9a4a, 0x6a7a3a, 0xa89a5a, 0x7a8a42][i % 4]);
    if (i % 4 === 0) K.put(M.leaf, sph(0.05, 6, 4), x + 0.08, islH(x, z) + s * 1.1, z, 0, 0, 0, 1, 0.6, 1, i % 8 === 0 ? 0xffe040 : 0xffffff); }
  K.build(root, 30);
  // ice floes on the sea (bob in tick)
  const floes = []; for (let i = 0; i < 26; i++) { const x = ISL.SHORE + 4 + R() * 70, z = 6 - R() * 90, s = 0.8 + R() * 3.2; const fl = mesh(root, lumpGeo(60 + (i % 9), 1, 0.25), M.floe, x, ISL.SEA + 0.05, z, 0, R() * 6, 0); fl.scale.set(s * 1.4, 0.2 + R() * 0.25, s); fl.userData = { x, z, p: R() * 6 }; floes.push(fl); }
  // distant herd (instanced), placed on the tundra behind the actors
  const herd = makeHerd(root, 300, 77); { const Rh = PT.rng(91); let i = 0; while (herd.list.length < 300 && i < 5000) { i++; const r = Math.sqrt(Rh()) * 50, a = Rh() * Math.PI, x = -14 + Math.cos(a) * r * 0.9, z = -24 - Math.sin(a) * r * 0.8 - Rh() * 8; if (x > ISL.SHORE - 3 || islH(x, z) > 4) continue;
    herd.list.push([x, z, (Rh() < 0.5 ? 0 : Math.PI) + (Rh() - 0.5) * 0.9, 0.82 + Rh() * 0.3, herd.list.length / 300]); } }
  // relic: a tusk and skull half sunk in the tundra
  const relic = new THREE.Group(); relic.position.set(2.2, islH(2.2, -4.2), -4.2); root.add(relic); { const KR = new Kit(); const tusk = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-1.2, 0.05, 0], [-0.3, 0.32, 0.2], [0.7, 0.3, 0.3], [1.3, 0.05, 0.1]].map((p) => new THREE.Vector3(...p))), 20, 0.1, 8); KR.put(M.ivory, tusk, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xe8dcc0);
    KR.put(M.ivory, lumpGeo(88, 1, 0.25), -1.5, 0.15, -0.3, 0, 0.4, 0, 0.55, 0.38, 0.5, 0xd8ccb0); KR.put(M.leaf, new THREE.ConeGeometry(0.4, 0.6, 5), -1.0, 0.1, 0.35, 0, 0, 0, 0.5, 0.6, 0.5, 0x8a9a4a); KR.build(relic); } relic.visible = false;
  // skin boat (umiak-style): hide hull on a wooden frame, two paddles; setBoat slides it to the shore
  const boat = new THREE.Group(); root.add(boat); { const KB = new Kit(); const hull = new THREE.LatheGeometry([[0.001, -2.6], [0.45, -2.0], [0.7, -0.8], [0.75, 0], [0.7, 0.8], [0.45, 2.0], [0.001, 2.6]].map(([r, y]) => new THREE.Vector2(r, y)), 14);
    KB.put(M.hide, hull, 0, 0.35, 0, 0, 0, Math.PI / 2, 1, 1, 0.55, 0xa89c8c); for (let i = -2; i <= 2; i++) KB.beam(M.plank, [i * 0.9, 0.62, -0.42], [i * 0.9, 0.62, 0.42], 0.05, 0x6a4a30); KB.beam(M.plank, [-2.5, 0.66, 0], [2.5, 0.66, 0], 0.05, 0x6a4a30);
    for (const s of [-1, 1]) KB.beam(M.plank, [s * 0.6, 0.6, 0.5], [s * 1.3, 0.1, 1.3], 0.04, 0x8a6a40); KB.build(boat); } boat.visible = false;
  // icing: a thin glossy ice crust following the terrain near the camera, plus rain streaks
  const crustG = new THREE.Group(); root.add(crustG); const crust = terrain(crustG, M.iceCrust, 60, 46, 60, 46, -14, (x, z) => islH(x, z) + 0.07, () => [1, 1, 1], 1, -6); crust.renderOrder = 3; crustG.visible = false;
  const glints = []; for (let i = 0; i < 18; i++) { const x = -16 + R() * 28, z = 4 - R() * 26; glints.push(glowAt(root, [x, islH(x, z) + 0.15, z], 0.5, '#e8f4ff', 0)); }
  const rainIM = nond(new THREE.InstancedMesh(new THREE.BoxGeometry(0.012, 0.5, 0.012), M.rain, 500)); rainIM.frustumCulled = false; root.add(rainIM); const rainP = []; for (let i = 0; i < 500; i++) rainP.push([-12 + R() * 24, R() * 14, 8 - R() * 22, R()]);
  const snow = motes(root, 160, [-14, 14, 0.2, 9, -20, 8], 93, 0.022);
  return { floes, herd, relic, boat, crustG, crust, glints, rainIM, rainP, snow };
}

// ================================================================= GIZA (c. 2560 BC)
export const gzH = (x, z) => 0.18 * Math.sin(x * 0.11) * Math.cos(z * 0.09) + sm(-90, -180, z) * (2 + 2 * Math.sin(x * 0.05));
function buildGiza(root) { const R = PT.rng(2560), K = new Kit(), { Z, B, HT } = PYR;
  terrain(root, M.sand, 360, 300, 120, 100, -110, gzH, (x, y, z) => { const n = Math.sin(x * 0.07 + z * 0.05) * 0.5 + 0.5; let c = mixa(hexc('#f6e8cc'), hexc('#eed8b0'), n); const nile = clamp01(1 - Math.abs(x + 95 + z * 0.1) / 14) * (z < -40 ? 1 : 0); return mixa(c, hexc('#5a8a3a'), nile * 0.9); }, 0.5, 0);
  // the Nile (a dark strip far left) + palms along it
  mesh(root, planeUV(14, 220, 1, 1), M.sea, -100, 0.06, -150, -Math.PI / 2, 0, 0.1, false);
  const palm = (x, z, s) => { K.beam(M.bark, [x, gzH(x, z), z], [x + 0.6 * s, gzH(x, z) + 5.2 * s, z], 0.16 * s, 0x8a6a40, true, 6); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; K.put(M.leaf, new THREE.BoxGeometry(2.2 * s, 0.05, 0.36 * s), x + 0.6 * s + Math.cos(a) * 1.0 * s, gzH(x, z) + 5.0 * s - 0.3 * s, z + Math.sin(a) * 1.0 * s, 0, -a, -0.38, 1, 1, 1, [0x4a8a3a, 0x3a7a32][i % 2]); } };
  for (let i = 0; i < 26; i++) palm(-86 - R() * 24, -40 - R() * 150, 1 + R() * 0.6);
  for (const [x, z, s] of [[-16, -8, 1.2], [-22, -18, 1.5], [17, -12, 1.3], [24, -26, 1.1]]) palm(x, z, s);
  // pyramid A (under construction): stepped core courses, casing on the lower courses, top missing; mud-brick ramp up the front-right
  const pyrA = new THREE.Group(); pyrA.position.set(0, 0, Z); root.add(pyrA); { const KP = new Kit(), n = 18, th = HT / 26;
    for (let i = 0; i < n; i++) { const w = B * (1 - i / 26); KP.box(M.lime, -w / 2, w / 2, i * th, (i + 1) * th, -w / 2, w / 2, 0xffffff, 0.08); }
    for (let i = 0; i < 6; i++) { const w0 = B * (1 - i / 26) + 0.9, w1 = B * (1 - (i + 1) / 26) + 0.9; KP.put(M.casing, new THREE.CylinderGeometry(w1 * 0.7071, w0 * 0.7071, th, 4, 1), 0, (i + 0.5) * th, 0, 0, Math.PI / 4, 0, 1, 1, 1, 0xffffff); }
    const top = 18 * th; KP.put(M.brick, new THREE.BoxGeometry(3.4, 0.7, Math.hypot(30, top)), 5, top / 2 - 0.3, 21.8, Math.atan2(top, 30), 0, 0, 1, 1, 1, 0xe0c498); for (let i = 0; i < 5; i++) KP.beam(M.plank, [2.4, 0, 9 + i * 6], [2.4, top * (1 - (2.2 + i * 6) / 30), 9 + i * 6], 0.18, 0x7a5a3a);
    for (let i = 0; i < 6; i++) { const x = -6 + i * 2.2; KP.box(M.lime, x - 0.8, x + 0.8, top, top + 0.9, -2 + (i % 2) * 2, -0.6 + (i % 2) * 2, 0xffffff, 0.05); }
    KP.build(pyrA); }
  const pyrB = new THREE.Group(); pyrB.position.set(0, 0, Z); root.add(pyrB); { const KP = new Kit(); KP.put(M.casing, new THREE.ConeGeometry(B * 0.7071 + 0.6, HT, 4, 1), 0, HT / 2, 0, 0, Math.PI / 4, 0, 1, 1, 1, 0xffffff); KP.put(M.gold, new THREE.ConeGeometry(1.4, 1.4, 4, 1), 0, HT - 0.1, 0, 0, Math.PI / 4, 0, 1, 1, 1, 0xffd060); KP.build(pyrB); } pyrB.visible = false;
  // block piles, workers' tents, ropes, a quarry face on the left, jars
  for (let i = 0; i < 26; i++) { const x = -14 + R() * 10 + (i % 2) * 22, z = -12 - R() * 16; K.box(M.lime, x - 0.7, x + 0.7, gzH(x, z), gzH(x, z) + 0.8 + (i % 3) * 0.05, z - 0.6, z + 0.6, 0xffffff, 0.06); if (i % 3 === 0) K.box(M.lime, x - 0.6, x + 0.6, gzH(x, z) + 0.8, gzH(x, z) + 1.55, z - 0.5, z + 0.5, 0xffffff, 0.06); }
  for (const [x, z, c] of [[-30, -22, 0xe8dcc0], [-36, -30, 0xd8c8a0], [30, -30, 0xe0d0b0], [36, -18, 0xd8c098]]) { K.put(M.cloth, new THREE.ConeGeometry(2.6, 2.4, 4), x, gzH(x, z) + 1.2, z, 0, Math.PI / 4, 0, 1, 1, 1.3, c); K.beam(M.plank, [x, 0, z], [x, 2.7, z], 0.06, 0x6a4a30); }
  for (let i = 0; i < 10; i++) { const x = 6 + R() * 6, z = -3 - R() * 6; K.put(M.brick, cyl(0.18, 0.12, 0.5, 8), x, gzH(x, z) + 0.25, z, 0, 0, 0, 1, 1, 1, [0xb86a3a, 0xa85a30][i % 2]); }
  K.at(-40, 0, -60, 0.4, () => { for (let i = 0; i < 6; i++) K.box(M.lime, -8 + i * 2.6, -5.6 + i * 2.6, 0, 4 + (i % 3) * 1.4, -2, 2, 0xe8d0a0, 0.1); });
  K.build(root, 30);
  // sledge with a block (drag in tick)
  const sledge = new THREE.Group(); sledge.position.set(-3, 0, -6); sledge.rotation.y = 0.25; root.add(sledge); { const KS = new Kit(); for (const s of [-1, 1]) KS.box(M.plank, -1.3, 1.3, 0, 0.14, s * 0.5 - 0.08, s * 0.5 + 0.08, 0x8a6040, 0.04); KS.box(M.lime, -0.85, 0.85, 0.14, 1.2, -0.7, 0.7, 0xffffff, 0.06);
    KS.beam(M.cloth, [1.3, 0.1, 0.3], [3.2, 1.0, 0.45], 0.03, 0xc8a870); KS.beam(M.cloth, [1.3, 0.1, -0.3], [3.2, 1.0, -0.45], 0.03, 0xc8a870); KS.build(sledge); }
  // a mammoth-shaped constellation in the night sky (stars + faint lines), facing the camera axis (+z)
  const cons = new THREE.Group(); cons.position.set(4, 52, -150); root.add(cons); const CP = [[-18, 0], [-14, 9], [-4, 13], [4, 15], [11, 11], [15, 4], [17, -6], [15, -14], [10, -16], [-12, -6], [-12, -14], [4, -8], [4, -15], [21, -10], [23, -2]];
  const stars = CP.map(([x, y], i) => { const s = nond(mesh(cons, plane(i < 5 ? 3.6 : 3, i < 5 ? 3.6 : 3), M.star.clone(), x, y, 0, 0, 0, 0, false)); s.renderOrder = 8; return s; });
  const LN = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [5, 13], [13, 14], [0, 9], [9, 10], [9, 11], [11, 12]];
  const lines = LN.map(([a, b]) => { const [x0, y0] = CP[a], [x1, y1] = CP[b], L = Math.hypot(x1 - x0, y1 - y0); const l = nond(mesh(cons, plane(L, 0.28), M.constLine, (x0 + x1) / 2, (y0 + y1) / 2, -0.5, 0, 0, Math.atan2(y1 - y0, x1 - x0), false)); l.renderOrder = 7; return l; });
  const heat = motes(root, 40, [-10, 10, 0.3, 4, -16, 4], 95, 0.01);
  const fires = [glowAt(root, [-7, 0.9, -8], 2.4, '#ffa040', 0), glowAt(root, [12, 0.9, -16], 2.4, '#ffa040', 0)]; for (const [x, z] of [[-7, -8], [12, -16]]) { const KF = new Kit(); for (let i = 0; i < 5; i++) KF.beam(M.bark, [x + Math.cos(i * 1.3) * 0.5, 0, z + Math.sin(i * 1.3) * 0.5], [x, 0.5, z], 0.05, 0x4a3020); KF.build(root); }
  return { pyrA, pyrB, sledge, cons, stars, lines, heat, fires };
}

// ================================================================= LAB (ancient DNA, today)
function buildLab(root) { const R = PT.rng(2024), K = new Kit(), X = 6, ZB = -4, HT = 4.2;
  K.box(M.labFloor, -X, X, -0.1, 0, ZB, 6, 0xffffff, 0.01); K.box(M.labWall, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.02); K.box(M.labWall, -X - 0.2, -X, 0, HT, ZB, 6, 0xe8eef0, 0.02); K.box(M.labWall, X, X + 0.2, 0, HT, ZB, 6, 0xe8eef0, 0.02); K.box(M.labWall, -X, X, HT, HT + 0.2, ZB, 6, 0xf0f4f4, 0.02);
  // window (night/day sky card behind), sign, poster, shelves with jars, ceiling lights
  K.box(M.steel, 1.4, 4.6, 1.3, 1.4, ZB + 0.02, ZB + 0.12, 0xc8d0d8, 0.01); K.box(M.steel, 1.4, 4.6, 3.3, 3.4, ZB + 0.02, ZB + 0.12, 0xc8d0d8, 0.01); for (const x of [1.4, 3.0, 4.6]) K.box(M.steel, x - 0.05, x + 0.05, 1.3, 3.4, ZB + 0.02, ZB + 0.12, 0xc8d0d8, 0.01);
  const win = mesh(root, plane(3.2, 2.0), M.winSky, 3.0, 2.35, ZB + 0.01, 0, 0, 0, false);
  mesh(root, plane(3.4, 0.53), M.signLab, -2.6, 3.65, ZB + 0.02, 0, 0, 0, false); mesh(root, plane(1.3, 1.62), M.poster, -4.4, 2.2, ZB + 0.02, 0, 0, 0, false);
  for (const y of [1.6, 2.4]) { K.box(M.steel, -3.4, -0.6, y, y + 0.05, ZB, ZB + 0.4, 0xb8c0c8, 0.01); for (let i = 0; i < 7; i++) { const x = -3.2 + i * 0.4; K.put(M.glassJ, cyl(0.1, 0.1, 0.3 + (i % 3) * 0.08, 10), x, y + 0.2, ZB + 0.2, 0, 0, 0, 1, 1, 1, 0xffffff); K.put(M.paint, cyl(0.105, 0.105, 0.05, 10), x, y + 0.38 + (i % 3) * 0.04, ZB + 0.2, 0, 0, 0, 1, 1, 1, [0xe04a5a, 0x4a8ad8, 0x4ac88a][i % 3]); } }
  for (const x of [-3, 0, 3]) K.box(M.steel, x - 0.9, x + 0.9, HT - 0.08, HT, -0.6, -0.2, 0xffffff, 0.01);
  // bench with microscope, sample rack, the tusk sample on a tray, monitor
  K.box(M.steel, -3.2, 1.2, 0.86, 0.94, -1.4, -0.2, 0xd8dce0, 0.02); for (const x of [-3.0, 1.0]) for (const z of [-1.3, -0.3]) K.box(M.steel, x - 0.04, x + 0.04, 0, 0.86, z - 0.04, z + 0.04, 0x8a929a, 0.01); K.box(M.steel, -3.1, 1.1, 0.0, 0.7, -1.38, -1.3, 0xe8ecf0, 0.01);
  K.box(M.steel, -2.7, -2.2, 0.94, 0.98, -1.0, -0.6, 0x2a2a34, 0.01); K.beam(M.steel, [-2.45, 0.98, -0.95], [-2.45, 1.5, -0.95], 0.06, 0x2a2a34); K.beam(M.steel, [-2.45, 1.5, -0.95], [-2.4, 1.4, -0.7], 0.05, 0x2a2a34); K.put(M.steel, cyl(0.05, 0.03, 0.28, 10), -2.4, 1.25, -0.7, 0.2, 0, 0, 1, 1, 1, 0xd8dce0);
  K.box(M.steel, -1.6, -0.8, 0.94, 1.02, -1.0, -0.7, 0x4a8ad8, 0.01); for (let i = 0; i < 8; i++) K.put(M.glassJ, cyl(0.03, 0.03, 0.18, 8), -1.52 + i * 0.1, 1.08, -0.85, 0, 0, 0, 1, 1, 1, 0xffffff);
  K.box(M.steel, -0.6, 0.7, 0.94, 0.97, -0.9, -0.4, 0xe8ecf0, 0.01); { const tusk = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-0.55, 0.0, 0], [-0.15, 0.1, 0.04], [0.3, 0.12, 0.06], [0.55, 0.02, 0.02]].map((p) => new THREE.Vector3(...p))), 16, 0.06, 8); K.put(M.ivory, tusk, 0.05, 1.02, -0.65, 0, 0, 0, 1, 1, 1, 0xe8dcc0); }
  K.box(M.steel, 0.95, 1.05, 0.94, 1.3, -1.25, -1.15, 0x2a2a34, 0.01); K.box(M.steel, 0.2, 1.8, 1.25, 2.25, -1.3, -1.22, 0x1a1a22, 0.02); const scr = mesh(root, plane(1.5, 0.92), M.screen, 1.0, 1.75, -1.215, 0, 0, 0, false);
  // DNA helix model on a stand (right): two spiralling backbones + rungs; red "bad" rungs pop out with setWeed
  const helix = new THREE.Group(); helix.position.set(2.8, 0, -0.6); root.add(helix); const KH = new Kit(); KH.put(M.steel, cyl(0.45, 0.55, 0.12, 20), 0, 0.06, 0, 0, 0, 0, 1, 1, 1, 0x3a3a48); KH.beam(M.steel, [0, 0.1, 0], [0, 3.3, 0], 0.03, 0x8a929a, true, 8);
  const NR = 22, hy = (i) => 0.35 + i * 0.13, ang = (i) => i * 0.55, rr = 0.42; const bb = (s) => new THREE.CatmullRomCurve3(Array.from({ length: 60 }, (_, k) => { const t = k / 59 * (NR - 1); return new THREE.Vector3(Math.cos(ang(t) + s) * rr, hy(t), Math.sin(ang(t) + s) * rr); }));
  KH.put(M.paint, new THREE.TubeGeometry(bb(0), 160, 0.05, 8), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0x4a7ad8); KH.put(M.paint, new THREE.TubeGeometry(bb(Math.PI), 160, 0.05, 8), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xe8b830); KH.build(helix);
  const BAD = new Set([3, 8, 12, 17, 20]), rungs = [];
  for (let i = 0; i < NR; i++) { const a = ang(i), g = new THREE.Group(); g.position.set(0, hy(i), 0); g.rotation.y = -a; helix.add(g); const bad = BAD.has(i);
    const KR = new Kit(); KR.put(bad ? M.rungR : M.paint, cyl(0.035, 0.035, rr * 2, 8), 0, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, bad ? 0xff3a4a : [0x4ad88a, 0x8ad84a, 0xc88aff, 0x4ac8d8][i % 4]); for (const s of [-1, 1]) KR.put(bad ? M.rungR : M.paint, sph(0.07, 10, 8), s * rr * 0.5, 0, 0, 0, 0, 0, 1, 1, 1, bad ? 0xff3a4a : 0xf4f4f8); KR.build(g); g.userData = { bad, i }; rungs.push(g); }
  K.build(root);
  const glow = glowAt(root, [1.0, 1.75, -1.0], 2.2, '#8ad8ff', 0.25), dust = motes(root, 40, [-4, 4, 0.5, 3.6, -3, 3], 99, 0.008);
  return { win, scr, helix, rungs, glow, dust };
}

// ================================================================= MAP TABLE (Siberia + Wrangel Island relief)
// map coords (table local): table top y = MAPT.Y; land relief on a 3.4 x 2.2 sheet centred at (0, Y, -0.3)
const mapLand = (x, z) => { const zz = z + 0.3; const main = clamp01((-zz - 0.05 + 0.18 * Math.sin(x * 3.1) + 0.08 * Math.sin(x * 7.3)) * 6); const isl = clamp01(1.0 - Math.hypot((x - 0.95) / 0.5, (zz - 0.35) / 0.3));
  const bridge = clamp01(1 - Math.abs(zz + 0.08 - (x - 0.5) * 0.95) / 0.07) * clamp01((x - 0.42) * 8) * clamp01((1.0 - x) * 8);
  const hi = main * (0.035 + 0.06 * Math.max(0, Math.sin(x * 2.3 + 0.4)) * clamp01(-zz * 2) + 0.012 * Math.sin(x * 13 + zz * 9)) + isl * (0.045 + 0.05 * clamp01(1 - Math.hypot((x - 1.0) / 0.2, (zz - 0.3) / 0.12))) + bridge * 0.022;
  return hi - 0.01 + 0.006 * Math.sin(x * 21 + zz * 17); };
function buildMap(root) { const R = PT.rng(1823), K = new Kit(), Y = MAPT.Y;
  // room: dark panelled walls, floor, a bookcase, a window with moonlight; table with legs
  K.box(M.wood, -7, 7, -0.1, 0, -5, 5, 0x5a3a2a, 0.01); K.box(M.wall, -7, 7, 0, 5, -5.2, -5, 0x5a4a5a, 0.02); K.box(M.wall, -7.2, -7, 0, 5, -5, 5, 0x5a4a5a, 0.02); K.box(M.wall, 7, 7.2, 0, 5, -5, 5, 0x5a4a5a, 0.02);
  for (let i = 0; i < 5; i++) { const y = 0.4 + i * 0.75; K.box(M.wood, -6.4, -3.2, y, y + 0.06, -5, -4.6, 0x4a2e20, 0.01); for (let k = 0; k < 14; k++) { const x = -6.3 + k * 0.22, hh = 0.42 + R() * 0.2; K.box(M.paint, x, x + 0.18, y + 0.06, y + 0.06 + hh, -4.95, -4.65, [0x8a2a2a, 0x2a4a7a, 0x3a6a3a, 0x8a6a2a, 0x5a3a6a][(k + i) % 5], 0.01); } }
  K.box(M.wood, -1.95, 1.95, Y - 0.08, Y, -1.6, 1.0, 0x6a4430, 0.02); for (const x of [-1.8, 1.8]) for (const z of [-1.45, 0.85]) K.box(M.wood, x - 0.07, x + 0.07, 0, Y - 0.08, z - 0.07, z + 0.07, 0x4a2e20, 0.02);
  // relief map (parchment terrain) + edge frame
  const land = terrain(root, M.parch, 3.5, 2.4, 140, 100, -0.3, (x, z) => Y + 0.004 + Math.max(0, mapLand(x, z)), (x, y, z) => { const h = y - Y; return h < 0.008 ? hexc('#e4dcc0') : mixa(hexc('#a8b078'), hexc('#7a8a56'), clamp01(h / 0.08)).map((v, i) => h > 0.07 ? v + (1 - v) * 0.6 : v); }, 1, 0);
  { const uv = land.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + 1.75) / 3.5, (uv.getY(i) + 1.5) / 2.4); }
  for (const [x0, x1, z0, z1] of [[-1.8, 1.8, -1.55, -1.48], [-1.8, 1.8, 0.88, 0.95], [-1.8, -1.73, -1.55, 0.95], [1.73, 1.8, -1.55, 0.95]]) K.box(M.wood, x0, x1, Y, Y + 0.05, z0, z1, 0x8a5a30, 0.01);
  const sea = mesh(root, plane(3.46, 2.36), M.mapSea, 0, Y + 0.007, -0.3, -Math.PI / 2, 0, 0, false); sea.renderOrder = 2;
  // paper flags on pins, compass rose, dividers, inkpot + quill, candle
  const flag = (x, z, mat, w, h2 = 0.26) => { K.beam(M.steel, [x, Y, z], [x, Y + 0.34, z], 0.006, 0x2a2a30, true, 6); const f = mesh(root, plane(w, w * 0.25), mat, x + w / 2, Y + 0.34 - w * 0.125, z, 0, 0, 0, false); return f; };
  const fW = flag(0.62, -0.02, M.flagW, 0.3), fS = flag(-0.8, -0.95, M.flagS, 0.4), fO = mesh(root, plane(0.6, 0.15), M.flagO, -0.4, Y + 0.03, 0.45, -Math.PI / 2, 0, 0, false);
  mesh(root, plane(0.16, 0.08), M.flagN, 1.45, Y + 0.012, -1.2, -Math.PI / 2, 0, 0, false); K.put(M.paint, new THREE.ConeGeometry(0.06, 0.24, 4), 1.45, Y + 0.008, -1.06, -Math.PI / 2, 0, 0, 1, 1, 0.1, 0x8a2a2a);
  K.beam(M.steel, [-1.3, Y + 0.01, 0.6], [-1.0, Y + 0.12, 0.45], 0.008, 0x8a8a94); K.beam(M.steel, [-1.0, Y + 0.12, 0.45], [-0.9, Y + 0.01, 0.75], 0.008, 0x8a8a94);
  K.put(M.paint, cyl(0.07, 0.08, 0.1, 12), 1.55, Y + 0.05, 0.6, 0, 0, 0, 1, 1, 1, 0x1a1a2a); K.beam(M.paint, [1.55, Y + 0.08, 0.6], [1.7, Y + 0.4, 0.5], 0.01, 0xf4f0e8);
  K.put(M.paint, cyl(0.05, 0.05, 0.22, 12), -1.55, Y + 0.11, -1.2, 0, 0, 0, 1, 1, 1, 0xf2ead0); const flame = mesh(root, plane(0.06, 0.12), M.flame, -1.55, Y + 0.29, -1.2, 0, 0, 0, false);
  K.build(root);
  // tiny mammoth figures (instanced prefab): 8 on the island, 16 on the mainland
  const mini = new THREE.Group(); root.add(mini); const herdI = makeHerd(mini, 8, 5), herdM = makeHerd(mini, 16, 6);
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, x = 0.95 + Math.cos(a) * 0.1, z = 0.05 + Math.sin(a) * 0.05; herdI.list.push([x, z, R() * 6, 0.022, i / 8]); }
  for (let i = 0; i < 16; i++) { const x = -1.3 + R() * 1.9, z = -0.75 - R() * 0.55; herdM.list.push([x, z, R() * 6, 0.022, i / 16]); }
  const candleG = glowAt(root, [-1.55, Y + 0.29, -1.2], 1.4, '#ffc070', 0.5), dust = motes(root, 40, [-1.6, 1.6, Y + 0.1, Y + 1.6, -1.4, 0.8], 101, 0.006);
  return { sea, herdI, herdM, flags: [fW, fS, fO], candleG, flame, dust };
}

// ================================================================= lights, grades, API
const SET_LIGHT = {
  islandDay: { top: '#5a86d0', hor: '#d8e4f4', fog: '#d4e0ee', fogN: 60, fogF: 420, sky: '#a8c0f0', ground: '#6a6a50', hemiI: 0.8, fillCol: '#7d93e6', fillI: 0.38, sunCol: '#fff0d8', sunI: 3.5, az: 34, el: 30, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  islandGold: { top: '#4a5aa8', hor: '#ffc890', fog: '#f0c8a8', fogN: 60, fogF: 380, sky: '#9a90d8', ground: '#5a4a50', hemiI: 0.86, fillCol: '#7078d8', fillI: 0.34, sunCol: '#ffb070', sunI: 3.4, az: 64, el: 10, disc: '#fff0c8', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff0e0', fxTint: '#fff6ea', shafts: 0.5 },
  islandDusk: { top: '#1e2258', hor: '#c87a8a', fog: '#6a5a88', fogN: 40, fogF: 300, sky: '#6a5ab0', ground: '#3a2a3a', hemiI: 0.82, fillCol: '#6a6ad0', fillI: 0.44, sunCol: '#ff9a7a', sunI: 1.9, az: 78, el: 5, disc: '#ffd8b0', discSize: 0.003, clouds: true, stars: 0.3, cardTint: '#f0e0ec', fxTint: '#ffffff', shafts: 0 },
  islandNight: { top: '#060a24', hor: '#2a3460', fog: '#1a2244', fogN: 20, fogF: 160, sky: '#4a5aa0', ground: '#1a1a2a', hemiI: 0.72, fillCol: '#5a68c0', fillI: 0.5, sunCol: '#a8b8ff', sunI: 1.6, az: -40, el: 34, disc: '#000000', discSize: 0.002, clouds: true, stars: 0.6, cardTint: '#dfe4f8', fxTint: '#ffffff', shafts: 0 },
  islandDawn: { top: '#5a6ab8', hor: '#ffd0a0', fog: '#f0d0c0', fogN: 60, fogF: 400, sky: '#a8a0e0', ground: '#5a5050', hemiI: 0.85, fillCol: '#7a80e0', fillI: 0.36, sunCol: '#ffc890', sunI: 3.0, az: -60, el: 12, disc: '#fff0d0', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff4ea', fxTint: '#ffffff', shafts: 0.4 },
  gizaGold: { top: '#4a62b8', hor: '#ffd8a0', fog: '#f0d8b0', fogN: 80, fogF: 520, sky: '#a8a0d8', ground: '#6a5848', hemiI: 0.86, fillCol: '#7078d8', fillI: 0.36, sunCol: '#ffd8a8', sunI: 3.6, az: 52, el: 16, disc: '#fff0c8', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff2e2', fxTint: '#fff6ea', shafts: 0.6 },
  gizaDay: { top: '#3a7ad8', hor: '#f0e4c8', fog: '#f0e0c0', fogN: 80, fogF: 520, sky: '#a8c0f0', ground: '#8a7050', hemiI: 0.8, fillCol: '#7d93e6', fillI: 0.34, sunCol: '#fff0d0', sunI: 3.8, az: 30, el: 46, disc: '#fffbe8', discSize: 0.002, clouds: false, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  gizaNight: { top: '#08082a', hor: '#3a2a5a', fog: '#2a2244', fogN: 60, fogF: 420, sky: '#4a4aa0', ground: '#2a2030', hemiI: 0.58, fillCol: '#5a68c8', fillI: 0.44, sunCol: '#b0b8ff', sunI: 1.0, az: -30, el: 30, disc: '#000000', discSize: 0.002, clouds: false, stars: 1, cardTint: '#e4e4f8', fxTint: '#ffffff', shafts: 0 },
  lab: { top: '#000000', hor: '#2a3040', fog: '#2a3040', fogN: 12, fogF: 60, sky: '#f0f4ff', ground: '#4a4a58', hemiI: 0.9, fillCol: '#8a98d8', fillI: 0.36, sunCol: '#e8f0ff', sunI: 2.2, az: -30, el: 50, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#f4f6ff', fxTint: '#ffffff', shafts: 0 },
  labNight: { top: '#000000', hor: '#101430', fog: '#101430', fogN: 12, fogF: 60, sky: '#7a7ab8', ground: '#2a2030', hemiI: 0.74, fillCol: '#5a68c0', fillI: 0.44, sunCol: '#a8c0ff', sunI: 1.5, az: -30, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#e8ecf8', fxTint: '#ffffff', shafts: 0 },
  map: { top: '#000000', hor: '#2a2028', fog: '#2a2028', fogN: 8, fogF: 40, sky: '#fff0d8', ground: '#4a3a30', hemiI: 0.86, fillCol: '#7a80c8', fillI: 0.36, sunCol: '#fff0dc', sunI: 2.0, az: -50, el: 48, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  islandDay: { look: 'day', over: { exp: 1.03, con: 1.2, sat: 1.12, tS: ['#3a4a8a', 0.15], tH: ['#ffe8c8', 0.05], bloom: [0.4, 0.84], vig: [0.24, 0.5, '#3a3a5a'] } },
  islandGold: { look: 'golden', over: { exp: 1.06, con: 1.22, sat: 1.08, tS: ['#3a3a8a', 0.18], tH: ['#ffc890', 0.1], bloom: [0.42, 0.78], hal: [0.24, '#ffa860'], vig: [0.3, 0.48, '#1e1a3a'] } },
  islandDusk: { look: 'golden', over: { exp: 1.08, con: 1.22, sat: 1.04, tS: ['#2a2a7a', 0.24], tH: ['#ffb090', 0.12], bloom: [0.5, 0.7], hal: [0.3, '#ff9070'], vig: [0.4, 0.44, '#140a20'] } },
  islandNight: { look: 'night', over: { exp: 1.16, con: 1.22, sat: 1.04, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#c0d0ff', 0.1], bloom: [0.5, 0.68], hal: [0.3, '#8090ff'], vig: [0.42, 0.42, '#08081a'] } },
  islandDawn: { look: 'golden', over: { exp: 1.06, con: 1.2, sat: 1.08, tS: ['#3a3a8a', 0.16], tH: ['#ffd0a0', 0.1], bloom: [0.42, 0.78], hal: [0.22, '#ffb070'], vig: [0.3, 0.48, '#2a1a3a'] } },
  gizaGold: { look: 'golden', over: { exp: 1.04, con: 1.2, sat: 1.0, tS: ['#3a3a8a', 0.18], tH: ['#ffc890', 0.1], bloom: [0.42, 0.78], hal: [0.26, '#ffa860'], vig: [0.3, 0.48, '#1e1a3a'] } },
  gizaDay: { look: 'day', over: { exp: 1.02, con: 1.2, sat: 1.1, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c8', 0.06], bloom: [0.4, 0.84], vig: [0.24, 0.5, '#4a3a5a'] } },
  gizaNight: { look: 'night', over: { exp: 1.18, con: 1.22, sat: 1.06, lift: [0.025, 0.026, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#c8d0ff', 0.1], bloom: [0.55, 0.64], hal: [0.32, '#8090ff'], vig: [0.42, 0.42, '#08081a'] } },
  lab: { look: 'office', over: { exp: 1.1, con: 1.22, sat: 1.06, lift: [0.03, 0.03, 0.05], tS: ['#2a3a7a', 0.18], tH: ['#e0ecff', 0.08], bloom: [0.44, 0.76], hal: [0.24, '#80c0ff'], vig: [0.34, 0.46, '#10142a'] } },
  labNight: { look: 'night', over: { exp: 1.16, con: 1.22, sat: 1.04, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#c0d0ff', 0.1], bloom: [0.5, 0.68], hal: [0.3, '#8090ff'], vig: [0.42, 0.42, '#08081a'] } },
  map: { look: 'office', over: { exp: 1.1, con: 1.22, sat: 1.0, lift: [0.03, 0.024, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffd8a8', 0.06], bloom: [0.42, 0.78], hal: [0.26, '#ff9a50'], vig: [0.38, 0.44, '#2a1420'] } },
};

export function buildMM(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'islandDay', herd: 0, herdGrow: null, gone: 0, ice: 0, rain: 0, sea: 0, mainland: 1, weed: 0, cons: 0, drag: 0, boat: -1, pyr: 0 };
  let il, gz, lb, mp;
  const API = makeAPI(ctx, { prefix: 'mm_', origin: MM_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { islandDay: 'day', islandGold: 'day', islandDusk: 'day', islandNight: 'day', islandDawn: 'day', gizaGold: 'day', gizaDay: 'day', gizaNight: 'day', lab: 'office', labNight: 'office', map: 'office' },
    practicals: (name, F, W3) => { const fl = 1 + 0.06 * Math.sin(F * 0.7) + 0.04 * Math.sin(F * 1.9);
      if (name === 'map') return [{ p: W3('map', [-1.55, MAPT.Y + 0.5, -1.1]), col: '#ffb860', I: 5.5 * fl, d: 6 }, { p: W3('map', [0.4, MAPT.Y + 2.2, 0.6]), col: '#ffe0b0', I: 3.2, d: 7 }, { p: W3('map', [3, 3, -3]), col: '#8a9aff', I: 2.0, d: 9 }];
      if (name === 'lab') return [{ p: W3('lab', [0, 3.8, 0.2]), col: '#f0f6ff', I: 3.2, d: 10 }, { p: W3('lab', [1.0, 1.8, -0.6]), col: '#8ad8ff', I: 2.0, d: 4 }, { p: W3('lab', [3.0, 2.4, -3.0]), col: '#c8d8ff', I: 1.6, d: 6 }];
      if (name === 'labNight') return [{ p: W3('lab', [1.0, 1.8, -0.4]), col: '#8ad8ff', I: 3.4, d: 5 }, { p: W3('lab', [2.8, 3.6, 0.6]), col: '#ffd8a0', I: 2.6, d: 5 }, { p: W3('lab', [3.0, 2.4, -3.0]), col: '#6a7aff', I: 2.4, d: 7 }];
      if (name === 'gizaNight') return [{ p: W3('giza', [-7, 1.5, -7]), col: '#ffa040', I: 9 * fl, d: 16 }, { p: W3('giza', [12, 1.5, -15]), col: '#ffa040', I: 9 * fl, d: 16 }, { p: W3('giza', [3.6, 2.2, 11]), col: '#ffb860', I: 3.5 * fl, d: 6 }];
      if (name === 'islandNight') return [{ p: W3('island', [-2, 6, 4]), col: '#b8c8ff', I: 2.0 + 16 * ST.flash, d: 30 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'island' && il) { M.seaT.offset.set(T * 0.002, T * 0.006); il.floes.forEach((fl, i) => { const u = fl.userData; fl.position.set(u.x + Math.sin(T * 0.2 + u.p) * 0.3 - T * 0.05, ISL.SEA + 0.04 + 0.04 * Math.sin(T * 1.1 + u.p), u.z); fl.rotation.y = u.p + T * 0.01; });
        setHerdMats(il.herd, islH, (i, rank) => (ST.herdGrow ? ST.herdGrow(i, rank) : rank * 300 < ST.herd ? 1 : 0), ST.gone, f);
        const n = ['islandNight'].includes(ST.mood) ? 1 : 0; tickMotes(il.snow, f, -2.2); il.snow.im.visible = ST.mood !== 'islandGold';
        il.crustG.visible = ST.ice > 0.01; M.iceCrust.opacity = 0.55 * ST.ice; il.glints.forEach((g2, i) => (g2.material.opacity = ST.ice > 0.5 ? (0.5 + 0.5 * Math.sin(f * 0.3 + i * 2)) * 0.6 * (ST.ice - 0.5) * 2 : 0));
        il.rainIM.visible = ST.rain > 0.01; if (il.rainIM.visible) { const m4 = new THREE.Matrix4(); il.rainP.forEach(([x, y0, z, p], i) => { const y = ((y0 - T * 14 * (0.8 + p * 0.4)) % 14 + 14) % 14; m4.makeTranslation(x, y, z); m4.multiply(new THREE.Matrix4().makeRotationZ(0.15)); il.rainIM.setMatrixAt(i, m4); }); il.rainIM.count = Math.round(500 * ST.rain); il.rainIM.instanceMatrix.needsUpdate = true; }
        il.boat.visible = ST.boat >= 0; if (il.boat.visible) { const t = clamp01(ST.boat), x = ISL.SHORE + 1.5 + 22 * (1 - sm(0, 1, t)), z = -3.2; il.boat.position.set(x, t < 0.95 ? ISL.SEA + 0.05 * Math.sin(T * 2.2) : islH(x, z) - 0.05, z); il.boat.rotation.set(0, 0.25, 0.04 * Math.sin(T * 1.7) * (1 - t)); } }
      if (cur === 'giza' && gz) { tickMotes(gz.heat, f, 0.5); gz.pyrA.visible = ST.pyr < 0.5; gz.pyrB.visible = ST.pyr >= 0.5; gz.sledge.position.set(-3 + ST.drag * 2.4, gzH(-3, -6), -6 - ST.drag * 1.0);
        const c = ST.cons; gz.stars.forEach((s, i) => { s.material.opacity = clamp01(c * 15 - i * 0.6) * (0.85 + 0.15 * Math.sin(f * 0.2 + i)); }); M.constLine.opacity = 0.45 * clamp01((c - 0.6) / 0.3);
        gz.fires.forEach((g2) => (g2.material.opacity = ST.mood === 'gizaNight' ? 0.55 * (0.9 + 0.1 * Math.sin(f * 0.9)) : 0)); }
      if (cur === 'lab' && lb) { tickMotes(lb.dust, f, 0.25); lb.helix.rotation.y = T * 0.25; lb.win.material.color.set(ST.mood === 'labNight' ? 0x1a2250 : 0x9ac0f0);
        lb.rungs.forEach((r) => { if (!r.userData.bad) return; const k = [3, 8, 12, 17, 20].indexOf(r.userData.i), t0 = k * 0.18, u = clamp01((ST.weed - t0) / 0.14); r.visible = u < 1; r.position.x = 0.35 * u; r.position.y = 0.35 + r.userData.i * 0.13 + 0.7 * u * u; r.scale.setScalar(1 - 0.85 * u); r.rotation.z = u * 3; }); lb.glow.material.opacity = 0.22 + 0.04 * Math.sin(f * 0.5); }
      if (cur === 'map' && mp) { tickMotes(mp.dust, f, 0.2); mp.sea.position.y = MAPT.Y + 0.007 + 0.017 * sm(0, 1, ST.sea); M.mapSea.map.offset.set(T * 0.01, T * 0.004);
        setHerdMats(mp.herdI, (x, z) => MAPT.Y + 0.004 + Math.max(0, mapLand(x, z)), () => 1, 0, f); setHerdMats(mp.herdM, (x, z) => MAPT.Y + 0.004 + Math.max(0, mapLand(x, z)), (i, rank) => clamp01((ST.mainland - rank * 0.9) / 0.1), 0, f);
        mp.flame.scale.set(1 + 0.08 * Math.sin(f * 1.3), 1 + 0.12 * Math.sin(f * 0.9), 1); mp.candleG.material.opacity = 0.45 + 0.06 * Math.sin(f * 0.8); } },
    glows: {},
    mood: (name) => { ST.mood = name; },
    apply: (v) => { for (const k of ['herd', 'gone', 'ice', 'rain', 'sea', 'mainland', 'weed', 'cons', 'drag', 'boat', 'pyr']) if (v[k] != null) ST[k] = v[k]; if (v.relic != null) API.setRelic(v.relic); } });
  il = buildIsland(API.groups.island); gz = buildGiza(API.groups.giza); lb = buildLab(API.groups.lab); mp = buildMap(API.groups.map);
  API.parts = { il, gz, lb, mp }; API.islH = islH; API.gzH = gzH; API.mapLand = mapLand;
  ST.flash = 0;
  API.setHerd = (n, grow = null) => { ST.herd = n; ST.herdGrow = grow; };
  API.setGone = (t) => { ST.gone = t; };
  API.setIce = (t) => { ST.ice = clamp01(t); }; API.setRain = (t) => { ST.rain = clamp01(t); }; API.setFlash = (k) => { ST.flash = k; };
  API.setRelic = (on) => { il.relic.visible = !!on; }; API.setBoat = (t) => { ST.boat = t; };
  API.setPyr = (t) => { ST.pyr = t; }; API.setDrag = (t) => { ST.drag = t; }; API.setConst = (t) => { ST.cons = clamp01(t); };
  API.setWeed = (t) => { ST.weed = t; }; API.setSea = (t) => { ST.sea = clamp01(t); }; API.setMainland = (t) => { ST.mainland = t; };
  API.glows = { island: il.glints, giza: gz.fires, lab: [lb.glow], map: [mp.candleG] };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  const V = API.V, Y = MAPT.Y;
  API.views = [
    V('islandDay', [0.5, 1.7, 12], [0, 1.6, -6], 46, 1.0, [0, 1.4, -4], { herd: 300 }), // 0 tundra wide with herd
    V('islandGold', [-4, 2.4, 14], [6, 1.4, -10], 46, 0.8, [4, 1.2, -8], { herd: 60 }), // 1 gold, toward the shore
    V('islandNight', [0, 1.5, 9], [0, 1.0, -4], 48, 1.2, [0, 0.8, -2], { ice: 1, rain: 1 }), // 2 storm night icing
    V('islandDusk', [2, 1.3, 5.5], [2, 0.5, -4], 42, 1.6, [2.2, 0.3, -4], { relic: 1, herd: 0 }), // 3 relic close
    V('islandDay', [10, 1.8, 6], [20, 0.6, -4], 46, 1.0, [19, 0.6, -3], { boat: 1 }), // 4 boat on shore
    V('islandDay', [-20, 30, 50], [5, 2, -30], 50, 0.4, [0, 0, -20], { herd: 300 }), // 5 aerial
    V('gizaGold', [6, 1.7, 14], [0, 9, PYR.Z], 50, 0.6, [0, 6, -60]), // 6 giza construction
    V('gizaNight', [4, 1.6, 16], [0, 30, PYR.Z - 40], 56, 0.4, [0, 10, PYR.Z], { pyr: 1, cons: 1 }), // 7 giza night, finished + constellation
    V('lab', [0.2, 1.7, 3.8], [0.6, 1.4, -1], 48, 1.4, [1.0, 1.3, -0.8], { weed: 0 }), // 8 lab wide
    V('labNight', [2.2, 1.9, 1.6], [2.8, 1.7, -0.6], 44, 2.0, [2.8, 1.7, -0.6], { weed: 0.5 }), // 9 helix close
    V('map', [0.4, Y + 1.1, 1.6], [0.3, Y, -0.3], 46, 1.6, [0.4, Y, -0.2], { sea: 0, mainland: 1 }), // 10 map wide
    V('map', [1.1, Y + 0.42, 0.75], [0.9, Y, 0.05], 42, 2.4, [0.95, Y, 0.06], { sea: 1, mainland: 0.3 }), // 11 map close on the island
  ];
  API.setHerd(0); API.setGone(0); API.setIce(0); API.setRain(0); API.setRelic(0); API.setBoat(-1); API.setPyr(0); API.setConst(0); API.setWeed(0); API.setSea(0); API.setMainland(1); API.tick(0);
  return API;
}
