// sk_sets.js [SK-sets]: sets for "The Super Soaker was invented by a NASA engineer" (Oddverra short). NO real toy logos or brand art:
// every blaster / toy box is the invented generic design from sk_cast.js (no wordmark); the brand names are only spoken in narration.
//   bath  : a 1982 home bathroom at night: mint tile, vanity + mirror, a home-made water heat-pump rig (coil, gauge, hoses) hooked to the
//           sink faucet with a brass test nozzle, a tub with a shower curtain and a rubber duck. The jet blasts across into the tub.
//           Mood 'bathNight'.                                                                                      origin (-106000,0,0)
//   shop  : a home garage workshop at night: pegboard, workbench, PVC pipe, a Plexiglas sheet and a soda bottle that fly together into
//           the prototype; a small desk where rejection letters pile up under a wall calendar. Mood 'shopLate'.    origin (-106000,0,800)
//   yard  : a sunny 1990 backyard: siding house + back steps, fence, kiddie pool, sprinkler, picnic table with toy boxes, maple, the
//           neighbours' roofs; water fights (jets). Moods 'yardSun', 'yardGold' (sunset payoff).                   origin (-106000,0,1600)
//   jpl   : a spacecraft assembly clean room: a Jupiter-probe model (umbrella antenna, glowing nuclear power booms) on a stand,
//           stanchions, a whiteboard with orbits, a terminal desk. Mood 'jplDay'.                                 origin (-108500,0,0)
//   court : an arbitration room: wood panels, long table, binders, a water pitcher, city window. Mood 'courtDay'.  origin (-108500,0,800)
//   space : deep space: Jupiter (bands + red spot), the probe flying by with glowing power booms, Saturn far off. Moods 'space',
//           'spaceGold' (payoff).                                                                                  origin (-108500,0,1600)
// Each set: local frame, floor y = 0, camera side +z. Test flag ?skview=N (main.js). Water jets: API.set({ jets: [...] }) (current set).
import { H, TAU, sm, SERIF, SANS, cyl, sph, plane, planeUV, lathe, mesh, nond, lumpGeo, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';
import { toyBox, BL } from './sk_cast.js';

export const SK_ORIGIN = { bath: [-106000, 0, 0], shop: [-106000, 0, 800], yard: [-106000, 0, 1600], jpl: [-108500, 0, 0], court: [-108500, 0, 800], space: [-108500, 0, 1600] };
const GROUP_OF = { bathNight: 'bath', shopLate: 'shop', yardSun: 'yard', yardGold: 'yard', jplDay: 'jpl', courtDay: 'court', space: 'space', spaceGold: 'space' };
let THREE, PT, M;

// ---------------------------------------------------------------- painters
function plainTex(col, k = 0.1) { return (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 1 - k / 2 + k * PT.fbm(u, v, 4, 4, 3, 5)); }; }
function tileTex(a, b, n = 8, grout = '#e8f0ec') { return (g, w, h) => { g.fillStyle = grout; g.fillRect(0, 0, w, h); const s = w / n; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { g.fillStyle = (i + j) % 5 === 0 ? b : a; g.fillRect(i * s + 2, j * s + 2, s - 4, s - 4); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(i * s + 4, j * s + 4, s * 0.5, 3); }
  PT.modulate(g, w, h, (u, v) => 0.93 + 0.08 * PT.fbm(u, v, 4, 4, 3, 5)); }; }
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); if (!o.flat) PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 6, 2, 3, 7)); g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08);
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : 0.34 + i * 0.36), w * 0.86, h * (lines.length === 1 ? 0.52 : 0.3), { col: o.col || '#3a2414', font: o.font || SANS })); }; }
function windowTex(o) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.a); gr.addColorStop(1, o.b); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = o.c; for (let i = 0; i < 9; i++) { const x = i * w / 8 - 20, bh = h * (0.16 + 0.2 * ((i * 37) % 7) / 7); g.fillRect(x, h - bh, w / 9, bh); if (o.lit) { g.fillStyle = o.lit; for (let k = 0; k < 6; k++) g.fillRect(x + 6 + (k % 2) * 16, h - bh + 8 + Math.floor(k / 2) * 18, 8, 8); g.fillStyle = o.c; } }
  if (o.moon) { g.fillStyle = '#f4f0d8'; g.beginPath(); g.arc(w * 0.75, h * 0.22, h * 0.07, 0, TAU); g.fill(); } if (o.stars) { g.fillStyle = '#fff'; const R = PT.rng(5); for (let i = 0; i < 30; i++) g.fillRect(R() * w, R() * h * 0.6, 2, 2); } }; }
function grassTex(g, w, h) { g.fillStyle = '#5aa03a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.82 + 0.3 * PT.fbm(u, v, 6, 6, 4, 17)); grain(g, w, h, 'rgba(40,80,20,1)', 1500, 8, 0.35); grain(g, w, h, 'rgba(170,220,90,1)', 700, 9, 0.3); }
function pegTex(g, w, h) { g.fillStyle = '#9a7448'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 5, 5, 3, 9)); g.fillStyle = 'rgba(50,30,20,0.55)'; for (let y = 8; y < h; y += 16) for (let x = 8; x < w; x += 16) { g.beginPath(); g.arc(x, y, 2.4, 0, TAU); g.fill(); } }
function sidingTex(g, w, h) { g.fillStyle = '#e8dcb8'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) { g.fillStyle = 'rgba(120,90,60,0.35)'; g.fillRect(0, y + 26, w, 6); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, y, w, 4); } PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 5)); }
function fenceTex(g, w, h) { g.fillStyle = '#a8784a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { const x = i * w / 16; g.fillStyle = i % 2 ? 'rgba(90,50,30,0.25)' : 'rgba(255,230,190,0.12)'; g.fillRect(x, 0, w / 16, h); g.fillStyle = 'rgba(50,30,20,0.6)'; g.fillRect(x, 0, 3, h); } PT.modulate(g, w, h, (u, v) => 0.86 + 0.2 * PT.fbm(u, v, 8, 3, 4, 11)); }
function panelTex(g, w, h) { g.fillStyle = '#6a3e24'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { g.strokeStyle = 'rgba(30,14,8,0.6)'; g.lineWidth = 8; g.strokeRect(i * w / 4 + 14, 18, w / 4 - 28, h - 36); g.strokeStyle = 'rgba(255,200,140,0.15)'; g.lineWidth = 3; g.strokeRect(i * w / 4 + 22, 26, w / 4 - 44, h - 52); } PT.modulate(g, w, h, (u, v) => 0.85 + 0.25 * PT.fbm(u, v, 12, 2, 4, 21)); }
function boardTex(g, w, h) { g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a4a9a'; g.lineWidth = 5; g.beginPath(); g.arc(w * 0.3, h * 0.5, h * 0.12, 0, TAU); g.stroke(); g.fillStyle = '#d89a50'; g.beginPath(); g.arc(w * 0.3, h * 0.5, h * 0.1, 0, TAU); g.fill();
  g.setLineDash([12, 10]); g.strokeStyle = '#2a4a9a'; for (const r of [0.22, 0.32, 0.4]) { g.beginPath(); g.ellipse(w * 0.3, h * 0.5, w * r, h * r * 0.9, 0.2, 0, TAU); g.stroke(); } g.setLineDash([]);
  txt(g, 'JUPITER', w * 0.3, h * 0.82, w * 0.3, h * 0.1, { col: '#c8302a', font: SANS }); txt(g, 'POWER: RTG ×2', w * 0.76, h * 0.3, w * 0.4, h * 0.09, { col: '#2a2a3a', font: SANS }); txt(g, 'ORBIT 1995', w * 0.76, h * 0.5, w * 0.36, h * 0.09, { col: '#2a2a3a', font: SANS });
  g.strokeStyle = '#c8302a'; g.lineWidth = 6; g.beginPath(); g.moveTo(w * 0.6, h * 0.72); g.lineTo(w * 0.9, h * 0.66); g.stroke(); }
function jupTex(g, w, h) { const B = [['#e8d8b8', 0], ['#c89a6a', 0.12], ['#f2e4c8', 0.2], ['#a8724a', 0.3], ['#ead6b0', 0.38], ['#b8845a', 0.47], ['#f4e8d0', 0.53], ['#c08a5a', 0.62], ['#e8d4b0', 0.7], ['#9a6a48', 0.8], ['#e0c8a0', 0.88], ['#b89070', 1]];
  for (let i = 0; i < B.length - 1; i++) { g.fillStyle = B[i][0]; g.fillRect(0, B[i][1] * h, w, (B[i + 1][1] - B[i][1]) * h + 1); }
  const img = g.getImageData(0, 0, w, h), d = img.data, src = new Uint8ClampedArray(d); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const off = Math.round(5 * Math.sin(x * 0.03 + y * 0.09) + 22 * (PT.fbm(x / w, y / h, 10, 6, 4, 2) - 0.5) + 6 * Math.sin(x * 0.11 + y * 0.02)), yy = Math.min(h - 1, Math.max(0, y + off)), i = (y * w + x) * 4, j = (yy * w + x) * 4; d[i] = src[j]; d[i + 1] = src[j + 1]; d[i + 2] = src[j + 2]; } g.putImageData(img, 0, 0);
  g.fillStyle = 'rgba(255,250,240,0.55)'; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(w * ((i * 0.137) % 1), h * (0.25 + (i % 4) * 0.17), w * 0.018, h * 0.012, 0, 0, TAU); g.fill(); } g.strokeStyle = 'rgba(120,70,40,0.35)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { const y = h * ((i * 0.0731) % 1); g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + 4 * Math.sin(x * 0.02 + i)); g.stroke(); }
  g.fillStyle = '#c8583a'; g.beginPath(); g.ellipse(w * 0.62, h * 0.64, w * 0.045, h * 0.05, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,220,190,0.5)'; g.beginPath(); g.ellipse(w * 0.62, h * 0.64, w * 0.03, h * 0.028, 0, 0, TAU); g.fill(); }
function satTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); [['#f2e2b8', 0], ['#d8b880', 0.3], ['#f4e6c4', 0.5], ['#c8a070', 0.75], ['#e8d4a8', 1]].forEach(([c, t]) => gr.addColorStop(t, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
function ringTex(g, w, h) { g.clearRect(0, 0, w, h); for (let x = 0; x < w; x++) { const t = x / w, a = t < 0.05 ? 0 : (0.35 + 0.5 * Math.abs(Math.sin(t * 40) * Math.sin(t * 7))) * (t > 0.62 && t < 0.68 ? 0.1 : 1); g.fillStyle = `rgba(${230 - t * 60 | 0},${210 - t * 70 | 0},${170 - t * 60 | 0},${a})`; g.fillRect(x, 0, 1, h); } }
function starTex(g, w, h) { g.fillStyle = '#04051a'; g.fillRect(0, 0, w, h); const gr = g.createRadialGradient(w * 0.3, h * 0.6, 0, w * 0.3, h * 0.6, w * 0.5); gr.addColorStop(0, 'rgba(90,50,140,0.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const R = PT.rng(77); for (let i = 0; i < 900; i++) { const s = R() < 0.06 ? 2.4 : 1.2; g.fillStyle = `rgba(255,${235 + R() * 20 | 0},${220 + R() * 35 | 0},${0.4 + R() * 0.6})`; g.fillRect(R() * w, R() * h, s, s); } }
function calTex(g, w, h) { g.fillStyle = '#f6f2e6'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8302a'; g.fillRect(0, 0, w, h * 0.22); txt(g, 'MONTHS...', w / 2, h * 0.11, w * 0.6, h * 0.14, { col: '#fff', font: SANS }); g.strokeStyle = '#8a8a96'; g.lineWidth = 2; for (let i = 0; i <= 7; i++) { g.beginPath(); g.moveTo(i * w / 7, h * 0.26); g.lineTo(i * w / 7, h); g.stroke(); } for (let j = 0; j <= 5; j++) { g.beginPath(); g.moveTo(0, h * 0.26 + j * h * 0.148); g.lineTo(w, h * 0.26 + j * h * 0.148); g.stroke(); }
  g.strokeStyle = '#c8302a'; g.lineWidth = 4; for (let k = 0; k < 24; k++) { const i = k % 7, j = Math.floor(k / 7), x = i * w / 7 + 6, y = h * 0.26 + j * h * 0.148 + 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w / 7 - 12, y + h * 0.148 - 12); g.moveTo(x + w / 7 - 12, y); g.lineTo(x, y + h * 0.148 - 12); g.stroke(); } }
function letterTex(g, w, h) { g.fillStyle = '#f8f4ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a4a8a'; g.fillRect(w * 0.1, h * 0.06, w * 0.35, h * 0.05); g.fillStyle = 'rgba(60,50,60,0.55)'; for (let i = 0; i < 9; i++) g.fillRect(w * 0.1, h * (0.2 + i * 0.05), i % 4 === 3 ? w * 0.4 : w * 0.8, h * 0.015);
  g.save(); g.translate(w * 0.55, h * 0.78); g.rotate(-0.25); g.strokeStyle = '#d0262c'; g.lineWidth = w * 0.03; g.strokeRect(-w * 0.3, -h * 0.08, w * 0.6, h * 0.16); txt(g, 'NO THANKS', 0, 0, w * 0.54, h * 0.11, { col: '#d0262c', font: SANS }); g.restore(); }
function freonTex(g, w, h) { g.fillStyle = '#e8e8ee'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a6ac8'; g.fillRect(0, h * 0.25, w, h * 0.5); for (let k = 0; k < 2; k++) txt(g, 'COOLANT', w * (0.25 + k * 0.5), h * 0.5, w * 0.4, h * 0.26, { col: '#ffffff', font: SANS }); }
function skyline(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7ab0f0'); gr.addColorStop(1, '#e0ecf8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = PT.rng(13);
  for (let i = 0; i < 14; i++) { const bw = 30 + R() * 50, bh = h * (0.3 + R() * 0.6), x = i * w / 13 - 10; g.fillStyle = ['#8a98b8', '#a0aac4', '#7a88a8'][i % 3]; g.fillRect(x, h - bh, bw, bh); g.fillStyle = 'rgba(255,255,255,0.5)'; for (let y = h - bh + 8; y < h - 6; y += 14) for (let xx = x + 5; xx < x + bw - 6; xx += 10) g.fillRect(xx, y, 5, 7); } }
function roofsTex(g, w, h) { g.clearRect(0, 0, w, h); const R = PT.rng(4); for (let i = 0; i < 7; i++) { const x = i * w / 6 - 40 + R() * 30, rw = 160 + R() * 60, y = h * (0.35 + R() * 0.2); g.fillStyle = ['#e8d8b8', '#c8d8e8', '#f0e0c8', '#d8c8b0'][i % 4]; g.fillRect(x + 10, y, rw - 20, h - y); g.fillStyle = ['#8a4a3a', '#5a5a6a', '#6a4a3a'][i % 3]; g.beginPath(); g.moveTo(x - 10, y + 4); g.lineTo(x + rw / 2, y - 60); g.lineTo(x + rw + 10, y + 4); g.closePath(); g.fill();
  g.fillStyle = '#ffe8a0'; g.fillRect(x + 30, y + 30, 28, 24); g.fillRect(x + rw - 60, y + 30, 28, 24); }
  g.fillStyle = '#3f7a34'; for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(R() * w, h * (0.6 + R() * 0.2), 30 + R() * 40, 0, TAU); g.fill(); } }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.water = toon({ color: 0x8ad8ff, emissive: 0x2a74c8 }); m.waterHi = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xe8f8ff).multiplyScalar(1.3), fog: false });
  m.waterPool = toon({ color: 0x4ab0f0, emissive: 0x1a5aa8 });
  m.tile = vc({ map: T(512, 512, tileTex('#9ad8c0', '#f0a8b8', 8)) }); m.tile.map.wrapS = m.tile.map.wrapT = THREE.RepeatWrapping;
  m.floorTile = vc({ map: T(512, 512, tileTex('#f2f0ea', '#5aa890', 10, '#c8c8c0')) }); m.floorTile.map.wrapS = m.floorTile.map.wrapT = THREE.RepeatWrapping;
  m.wallPaper = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#d8c0a0'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = 'rgba(220,120,140,0.35)'; g.beginPath(); g.arc(i * 32 + (j % 2) * 16, j * 32, 4, 0, TAU); g.fill(); } }) });
  m.porc = toon({ color: 0xf6f4ee, emissive: 0x1a1a20 }); m.mirror = toon({ color: 0x6a88a8, emissive: 0x101828 });
  m.curtain = vc({ side: THREE.DoubleSide }); m.copper = vc({ emissive: 0x3a1408 });
  m.winNight = new THREE.MeshBasicMaterial({ map: T(512, 320, windowTex({ a: '#0a1030', b: '#2a3a7a', c: '#141a3a', lit: '#ffd890', moon: 1, stars: 1 })), fog: false });
  m.freon = em(T(256, 128, freonTex), 0x101018);
  m.concrete = vc({ map: T(512, 512, plainTex('#8a8a90', 0.25)) }); m.concrete.map.wrapS = m.concrete.map.wrapT = THREE.RepeatWrapping;
  m.peg = vc({ map: T(512, 512, pegTex) }); m.wallShop = vc({ map: T(256, 256, plainTex('#8a8478')) }); m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#9a6a40', n: 8, seed: 51 })) });
  m.pvc = toon({ color: 0xf2f0ea, emissive: 0x18181c }); m.plexi = toon({ color: 0xc8e8f4, transparent: true, opacity: 0.45, depthWrite: false, emissive: 0x18303a }); m.bottle = toon({ color: 0xd8f0f8, transparent: true, opacity: 0.5, depthWrite: false, emissive: 0x1a3040 });
  m.bottleW = toon({ color: 0x5ab0f0, emissive: 0x1a4a90 }); m.label = vc({ emissive: 0x1a0808 });
  m.tagPVC = em(T(256, 96, signTex(['PVC PIPE'], { bg: '#fff6c8', col: '#2a2a3a', rim: '#2a2a3a' })), 0x302810, { side: THREE.DoubleSide });
  m.tagPlex = em(T(256, 96, signTex(['PLEXIGLAS'], { bg: '#fff6c8', col: '#2a2a3a', rim: '#2a2a3a' })), 0x302810, { side: THREE.DoubleSide });
  m.tagSoda = em(T(256, 96, signTex(['SODA BOTTLE'], { bg: '#fff6c8', col: '#2a2a3a', rim: '#2a2a3a' })), 0x302810, { side: THREE.DoubleSide });
  m.tagPump = em(T(320, 110, signTex(['HEAT PUMP'], { bg: '#fff6c8', col: '#2a2a3a', rim: '#2a2a3a' })), 0x302810, { side: THREE.DoubleSide });
  m.letter = em(T(256, 320, letterTex), 0x302820, { side: THREE.DoubleSide }); m.cal = em(T(320, 300, calTex), 0x302820);
  m.garage = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#e8e4dc'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 42) { g.fillStyle = 'rgba(90,80,70,0.4)'; g.fillRect(0, y + 36, w, 6); } PT.modulate(g, w, h, (u, v) => 0.9 + 0.1 * PT.fbm(u, v, 4, 4, 3, 5)); }) });
  m.grass = vc({ map: T(512, 512, grassTex) }); m.grass.map.wrapS = m.grass.map.wrapT = THREE.RepeatWrapping;
  m.siding = vc({ map: T(256, 256, sidingTex) }); m.fence = vc({ map: T(512, 256, fenceTex) }); m.fence.map.wrapS = THREE.RepeatWrapping;
  m.roofs = new THREE.MeshBasicMaterial({ map: T(1024, 256, roofsTex), transparent: true, fog: true, depthWrite: false }); m.sky = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  m.boxes = Object.keys(BL).filter((k) => k !== 'proto').map((k) => em(T(256, 240, (g, w, h) => toyBox(g, w, h, k)), 0x201010));
  m.leaf = vc(); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.cloth = vc(); m.plastic = vc({ emissive: 0x0c0c10 });
  m.clean = vc({ map: T(256, 256, plainTex('#eef0f4', 0.06)) }); m.cleanFloor = vc({ map: T(512, 512, tileTex('#d8dce4', '#c8ccd8', 6, '#a8acb8')) }); m.cleanFloor.map.wrapS = m.cleanFloor.map.wrapT = THREE.RepeatWrapping;
  m.foil = toon({ color: 0xe0b048, emissive: 0x3a2808 }); m.black = toon({ color: 0x2a2a34, emissive: 0x08080c }); m.white = toon({ color: 0xc8ccd8, emissive: 0x08080c, side: THREE.DoubleSide });
  m.rtg = toon({ color: 0x8a8a96, emissive: 0x401808 }); m.rtgHot = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff9a40).multiplyScalar(1.6), fog: false });
  m.wboard = em(T(640, 400, boardTex), 0x303030); m.terminal = new THREE.MeshBasicMaterial({ map: T(256, 192, (g, w, h) => { g.fillStyle = '#0a2a14'; g.fillRect(0, 0, w, h); g.fillStyle = '#5aff8a'; g.font = 'bold 16px monospace'; ['> TRAJ JUPITER', '> RTG OUT 570W', '> CHECK OK', '> _'].forEach((s, i) => g.fillText(s, 12, 34 + i * 30)); }), fog: false });
  m.signJPL = em(T(640, 128, signTex(['SPACECRAFT ASSEMBLY'], { bg: '#2a4a8a', col: '#ffffff', rim: '#ffffff', flat: 1 })), 0x0a1430, { side: THREE.DoubleSide });
  m.panel = vc({ map: T(512, 256, panelTex) }); m.carpet = vc({ map: T(256, 256, plainTex('#3a3a5a', 0.15)) }); m.city = new THREE.MeshBasicMaterial({ map: T(512, 256, skyline), fog: false });
  m.plate = em(T(256, 64, signTex(['ARBITRATOR'], { bg: '#c8a050', col: '#2a1a0a', rim: '#2a1a0a', flat: 1 })), 0x201408);
  m.binder = vc(); m.glassC = toon({ color: 0xcfe8f0, transparent: true, opacity: 0.35, depthWrite: false, emissive: 0x18303a });
  m.stars = new THREE.MeshBasicMaterial({ map: T(2048, 1024, starTex), side: THREE.BackSide, fog: false });
  m.jup = toon({ map: T(1024, 512, jupTex), emissive: 0x2a1a10 }); m.jup.emissiveMap = m.jup.map; m.sat = toon({ map: T(256, 256, satTex), emissive: 0x2a2010 }); m.sat.emissiveMap = m.sat.map;
  m.ring = new THREE.MeshBasicMaterial({ map: T(512, 16, ringTex), transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false });
  return m; }

// ---------------------------------------------------------------- water jets (pooled; geometry rebuilt only when the arc changes)
const JN = 40, JR = 8;
function jetGeo(a, b, arc, r) { const P = []; for (let i = 0; i <= JN; i++) { const t = i / JN; P.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + 4 * arc * t * (1 - t), a[2] + (b[2] - a[2]) * t)); }
  const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), JN, r, JR, false); g.userData.P = P; return g; }
function makeJet() { const o = new THREE.Group(), m = new THREE.Mesh(new THREE.BufferGeometry(), M.water); m.castShadow = true; o.add(m); const core = new THREE.Mesh(new THREE.BufferGeometry(), M.waterHi); nond(core); o.add(core);
  const drops = new THREE.InstancedMesh(sph(1, 8, 6), M.water, 26); drops.castShadow = false; o.add(drops); o.userData = { m, core, drops, key: '' }; o.visible = false; return o; }
const _m4 = () => new THREE.Matrix4();
function tickJet(o, J, f, i) { const u = o.userData, r = J.r || 0.016, key = [...J.a, ...J.b, J.arc, r].map((v) => v.toFixed(3)).join(',');
  if (key !== u.key) { u.m.geometry.dispose(); u.core.geometry.dispose(); u.m.geometry = jetGeo(J.a, J.b, J.arc, r); u.core.geometry = jetGeo(J.a.map((v, k) => v + (k === 1 ? r * 0.45 : 0)), J.b, J.arc, r * 0.35); u.key = key; }
  const g0 = Math.max(0, Math.min(1, J.tail || 0)), g1 = Math.max(0, Math.min(1, J.grow == null ? 1 : J.grow)), per = JR * 6;
  const s = Math.floor(g0 * JN), e = Math.max(s, Math.floor(g1 * JN)); u.m.geometry.setDrawRange(s * per, (e - s) * per); u.core.geometry.setDrawRange(s * per, Math.max(0, e - s - 1) * per); o.visible = e > s || g1 > 0.02;
  // droplets: a few riding the stream (wobble) + a spray burst at the head (falling)
  const P = u.m.geometry.userData.P, M4 = u.M4 || (u.M4 = _m4()), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(), R = (k) => Math.abs(Math.sin(k * 12.9898 + i * 7.1) * 43758.5453) % 1;
  for (let k = 0; k < 26; k++) { let x, y, z, sz;
    if (k < 12) { const t = g0 + (g1 - g0) * (((f * 0.045 + R(k)) % 1)), p = P[Math.min(JN, Math.round(t * JN))]; x = p.x + (R(k + 3) - 0.5) * r * 5; y = p.y + (R(k + 5) - 0.5) * r * 5; z = p.z + (R(k + 7) - 0.5) * r * 5; sz = r * (0.5 + R(k + 1) * 0.6) * (e > s ? 1 : 0); }
    else { const p = P[Math.max(0, e)], ph = ((f * 0.06 + R(k)) % 1), sp = 0.25 + R(k + 2) * 0.5, an = R(k + 4) * TAU; x = p.x + Math.cos(an) * sp * ph * 0.6; z = p.z + Math.sin(an) * sp * ph * 0.6; y = p.y + ph * 0.5 * sp - 1.6 * ph * ph * 0.5; sz = r * (0.7 + R(k + 9)) * (1 - ph) * (J.spray === false || g1 < 0.98 ? (g1 > 0.05 ? 0.7 : 0) : 1.2); }
    M4.compose(v.set(x, y, z), q, sc.setScalar(Math.max(sz, 1e-5))); u.drops.setMatrixAt(k, M4); }
  u.drops.instanceMatrix.needsUpdate = true; }

// ---------------------------------------------------------------- shared pieces
function tree(K, x, z, s, R) { K.beam(M.bark, [x, 0, z], [x + 0.2 * s, 2.6 * s, z], 0.24 * s, 0x6a4a34, true, 8); for (const [a, b] of [[-1, 2.1], [1, 2.4], [0.3, 2.9]]) K.beam(M.bark, [x + 0.1 * s, 2.0 * s, z], [x + a * 1.2 * s, b * s + 0.4, z + (R() - 0.5)], 0.1 * s, 0x6a4a34, true, 6);
  for (let i = 0; i < 10; i++) K.put(M.leaf, lumpGeo(i + 7, 1, 0.25), x + (R() - 0.5) * 3.4 * s, (2.9 + R() * 1.5) * s, z + (R() - 0.5) * 2.2 * s, 0, R() * 6, 0, (1.1 + R() * 0.5) * s, (0.8 + R() * 0.3) * s, (1.0 + R() * 0.4) * s, [0x3f8a34, 0x4a9a3a, 0x357a2e][i % 3]); }
function lampShade(K, x, y, z, col = 0x2a5a4a) { K.beam(M.paint, [x, y + 0.9, z], [x, y + 0.12, z], 0.006, 0x1a1a20, true, 4); K.put(M.paint, new THREE.ConeGeometry(0.2, 0.16, 20, 1, true), x, y, z, 0, 0, 0, 1, 1, 1, col); K.put(M.lampGlass, sph(0.05, 10, 8), x, y - 0.05, z, 0, 0, 0, 1, 1, 1); }
// the Jupiter probe (stylized after Galileo): bus, umbrella antenna, two nuclear power booms (glow), science boom. Built facing +z.
function probe(parent, s = 1) { const g = new THREE.Group(); g.scale.setScalar(s); parent.add(g); const K = new Kit();
  K.put(M.foil, new THREE.CylinderGeometry(0.42, 0.42, 0.34, 10), 0, 0, 0, 0, 0, 0, 1, 1, 1); K.put(M.black, new THREE.CylinderGeometry(0.44, 0.44, 0.06, 10), 0, 0.2, 0, 0, 0, 0, 1, 1, 1); K.put(M.foil, new THREE.CylinderGeometry(0.3, 0.38, 0.4, 10), 0, -0.36, 0, 0, 0, 0, 1, 1, 1);
  K.put(M.metal, new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), 0, 0.45, 0, 0, 0, 0, 1, 1, 1, 0xb8bcc6);
  for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; K.beam(M.metal, [0, 0.62, 0], [Math.cos(a) * 1.0, 0.92, Math.sin(a) * 1.0], 0.012, 0xd8d8e0, true, 4); }
  K.build(g); const dish = mesh(g, new THREE.ConeGeometry(1.0, 0.32, 18, 1, true), M.white, 0, 0.78, 0, Math.PI, 0, 0, true);
  const booms = []; for (const sd of [-1, 1]) { const b = new THREE.Group(); b.position.set(sd * 0.42, -0.05, 0); b.rotation.z = sd * -0.25; g.add(b); const KB = new Kit(); KB.beam(M.metal, [0, 0, 0], [sd * 1.0, 0, 0], 0.025, 0x8a8a96, true, 6);
    KB.put(M.rtg, cyl(0.11, 0.11, 0.62, 12), sd * 1.35, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1); for (let k = 0; k < 6; k++) { const an = k / 6 * TAU; KB.put(M.rtg, new THREE.BoxGeometry(0.58, 0.012, 0.09), sd * 1.35, Math.cos(an) * 0.15, Math.sin(an) * 0.15, an, 0, 0, 1, 1, 1); } KB.build(b);
    const hot = nond(mesh(b, cyl(0.075, 0.075, 0.64, 12), M.rtgHot, sd * 1.35, 0, 0, 0, 0, Math.PI / 2, false)); booms.push({ b, hot }); }
  const KS = new Kit(); KS.beam(M.metal, [0, -0.1, 0.3], [0.1, -0.2, 2.6], 0.012, 0xc8c8d0, true, 4); KS.put(M.foil, new THREE.BoxGeometry(0.1, 0.1, 0.1), 0.1, -0.2, 2.62, 0, 0, 0, 1, 1, 1); KS.build(g);
  return { g, dish, booms }; }

// ================================================================= BATH (1982 home)
function buildBath(root) { const R = PT.rng(1982), K = new Kit(), X = 2.6, ZB = -2.2, HT = 2.6;
  const fl = mesh(root, planeUV(5.4, 6, 3, 3.4), M.floorTile, 0, 0, 0.6, -Math.PI / 2, 0, 0, false); fl.receiveShadow = true;
  // walls: tile to 1.25 m, wallpaper above, a ceiling
  for (const [x0, x1, z0, z1] of [[-X, X, ZB - 0.2, ZB], [-X - 0.2, -X, ZB, 3.5], [X, X + 0.2, ZB, 3.5]]) { K.box(M.tile, x0, x1, 0, 1.25, z0, z1, 0xffffff, 0.005); K.box(M.wallPaper, x0, x1, 1.25, HT, z0, z1, 0xffffff, 0.005); }
  K.box(M.paint, -X, X, 1.22, 1.29, ZB, ZB + 0.04, 0x5aa890, 0.01); for (const s of [-1, 1]) K.box(M.paint, s > 0 ? X - 0.04 : -X, s > 0 ? X : -X + 0.04, 1.22, 1.29, ZB, 3.5, 0x5aa890, 0.01);
  mesh(root, plane(2 * X, 6), H.toon({ color: 0xf0ece0, side: THREE.DoubleSide }), 0, HT, 0.6, Math.PI / 2, 0, 0, false);
  // window (back centre-right) over the tub
  const win = mesh(root, plane(0.8, 0.7), M.winNight, 1.1, 1.8, ZB + 0.02, 0, 0, 0, false); K.box(M.paint, 0.66, 1.54, 1.42, 1.46, ZB, ZB + 0.1, 0xf2f0ea, 0.01); K.box(M.paint, 0.66, 1.54, 2.14, 2.18, ZB, ZB + 0.06, 0xf2f0ea, 0.005); K.box(M.paint, 1.08, 1.12, 1.45, 2.15, ZB, ZB + 0.05, 0xf2f0ea, 0.005);
  // vanity + sink + mirror cabinet + lights (back left)
  const SX = -1.45, SY = 0.86, SZ = ZB + 0.32; K.box(M.wood, SX - 0.55, SX + 0.55, 0, SY - 0.04, ZB, ZB + 0.6, 0xc8a070, 0.02); K.box(M.porc, SX - 0.6, SX + 0.6, SY - 0.04, SY, ZB, ZB + 0.64, 0xf6f4ee, 0.02);
  for (const s of [-1, 1]) { K.box(M.wood, SX + s * 0.27 - 0.24, SX + s * 0.27 + 0.24, 0.08, SY - 0.1, ZB + 0.6, ZB + 0.62, 0xb08a5a, 0.01); K.put(M.brass, sph(0.018, 8, 6), SX + s * 0.08, 0.6, ZB + 0.63, 0, 0, 0, 1, 1, 1, 0xc8a050); }
  K.put(M.porc, new THREE.TorusGeometry(0.2, 0.025, 8, 28), SX, SY + 0.01, SZ, Math.PI / 2, 0, 0, 1, 0.75, 1, 0xf6f4ee); K.put(M.paint, cyl(0.19, 0.19, 0.006, 24), SX, SY + 0.004, SZ, 0, 0, 0, 1, 1, 0.75, 0xa8bccc); K.put(M.chrome, cyl(0.02, 0.02, 0.008, 10), SX, SY + 0.008, SZ, 0, 0, 0, 1, 1, 1, 0x5a5a66);
  K.box(M.wood, SX - 0.45, SX + 0.45, 1.3, 2.15, ZB, ZB + 0.12, 0xe8e0d0, 0.02); mesh(root, plane(0.78, 0.74), M.mirror, SX, 1.72, ZB + 0.125, 0, 0, 0, false);
  for (let i = 0; i < 4; i++) K.put(M.lampGlass, sph(0.045, 10, 8), SX - 0.36 + i * 0.24, 2.24, ZB + 0.1, 0, 0, 0, 1, 1, 1);
  // faucet (the rig is hooked here) + toothbrush cup + soap
  K.beam(M.chrome, [SX, SY, ZB + 0.08], [SX, SY + 0.16, ZB + 0.08], 0.022, 0xd8d8e0, true, 10); K.beam(M.chrome, [SX, SY + 0.16, ZB + 0.08], [SX, SY + 0.16, ZB + 0.2], 0.018, 0xd8d8e0, true, 10);
  for (const s of [-1, 1]) K.put(M.chrome, cyl(0.025, 0.03, 0.05, 10), SX + s * 0.15, SY + 0.025, ZB + 0.08, 0, 0, 0, 1, 1, 1, 0xd8d8e0);
  K.put(M.glassC, cyl(0.035, 0.03, 0.1, 12), SX - 0.42, SY + 0.05, ZB + 0.15, 0, 0, 0, 1, 1, 1); for (const c of [0xe83a3a, 0x3a8ae8]) K.beam(M.plastic, [SX - 0.42, SY + 0.02, ZB + 0.15], [SX - 0.42 + (c & 1 ? 0.02 : -0.02), SY + 0.17, ZB + 0.15], 0.006, c, true, 4);
  K.box(M.paint, SX + 0.35, SX + 0.48, SY, SY + 0.035, ZB + 0.1, ZB + 0.18, 0xf0a8b8, 0.015);
  // the brass test nozzle on the faucet (points +x across the room)
  const NZ = [SX + 0.02, SY + 0.155, ZB + 0.22]; K.beam(M.brass, [SX, SY + 0.16, ZB + 0.2], NZ, 0.022, 0xd8a840, true, 10); K.put(M.brass, new THREE.ConeGeometry(0.022, 0.06, 10), NZ[0] + 0.03, NZ[1], NZ[2], 0, 0, -Math.PI / 2, 1, 1, 1, 0xd8a840);
  // the home-made heat pump rig on the floor: a metal box, copper coil, a gauge, hoses up to the faucet; the old coolant can, crossed out
  const PX = -0.55, PZ = ZB + 0.55; K.at(PX, 0, PZ, 0.2, () => { K.box(M.metal, -0.32, 0.32, 0, 0.42, -0.22, 0.22, 0x8a9aa8, 0.03); K.box(M.metal, -0.33, 0.33, 0.42, 0.46, -0.23, 0.23, 0x5a6a78, 0.02);
    for (let i = 0; i < 7; i++) K.put(M.copper, new THREE.TorusGeometry(0.11, 0.014, 6, 20), 0.12, 0.5 + i * 0.035, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0xd87a3a);
    K.put(M.chrome, cyl(0.07, 0.07, 0.03, 18), -0.15, 0.26, 0.23, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8d8e0); K.put(M.paint, cyl(0.058, 0.058, 0.005, 18), -0.15, 0.26, 0.247, Math.PI / 2, 0, 0, 1, 1, 1, 0xf6f2e6);
    K.box(M.paint, -0.155, -0.145, 0.26, 0.31, 0.25, 0.255, 0xd0262c, 0.001); for (let i = 0; i < 3; i++) K.put(M.paint, sph(0.02, 8, 6), 0.0 + i * 0.07, 0.12, 0.225, 0, 0, 0, 1, 1, 0.5, [0x3ad04a, 0xf8c030, 0xe83a3a][i]); });
  const tag = mesh(root, plane(0.36, 0.12), M.tagPump, PX - 0.03, 0.33, PZ + 0.235, 0, 0.2, 0, false);
  { const c = new THREE.CatmullRomCurve3([[PX + 0.12, 0.74, PZ], [PX + 0.1, 1.05, PZ - 0.1], [SX + 0.35, 1.1, ZB + 0.2], [SX + 0.06, SY + 0.17, ZB + 0.12]].map((p) => new THREE.Vector3(...p))); mesh(root, new THREE.TubeGeometry(c, 40, 0.014, 8), H.toon({ color: 0x2a2a34 }), 0, 0, 0); }
  { const c = new THREE.CatmullRomCurve3([[PX - 0.25, 0.3, PZ], [PX - 0.45, 0.1, PZ + 0.1], [SX + 0.2, 0.02, ZB + 0.5], [SX + 0.1, 0.4, ZB + 0.6]].map((p) => new THREE.Vector3(...p))); mesh(root, new THREE.TubeGeometry(c, 40, 0.012, 8), H.toon({ color: 0x3a6a9a }), 0, 0, 0); }
  K.put(M.freon, cyl(0.07, 0.07, 0.24, 18), PX + 0.55, 0.12, PZ + 0.25, 0, 0.6, 0, 1, 1, 1); K.put(M.paint, cyl(0.02, 0.03, 0.04, 10), PX + 0.55, 0.26, PZ + 0.25, 0, 0, 0, 1, 1, 1, 0x2a2a34);
  K.at(PX + 0.18, 0, PZ + 0.45, 0.4, () => { K.box(M.paint, -0.18, 0.18, 0, 0.12, -0.1, 0.1, 0xc8302a, 0.02); K.box(M.metal, -0.14, 0.14, 0.12, 0.13, -0.06, 0.06, 0xb8bcc6, 0.01); }); // toolbox
  // the tub (right) + shower curtain + rod, towel rail, bath mat, duck
  const TX0 = 0.75, TX1 = X, TZ0 = ZB, TZ1 = ZB + 0.82, TH = 0.56; K.box(M.porc, TX0, TX1, 0, TH, TZ0, TZ1, 0xf6f4ee, 0.08); K.box(M.paint, TX0 + 0.08, TX1 - 0.08, TH - 0.2, TH + 0.002, TZ0 + 0.08, TZ1 - 0.08, 0xd8e8ee, 0.04);
  const tubW = mesh(root, plane(TX1 - TX0 - 0.2, TZ1 - TZ0 - 0.2), M.waterPool, (TX0 + TX1) / 2, TH - 0.12, (TZ0 + TZ1) / 2, -Math.PI / 2, 0, 0, false);
  K.beam(M.chrome, [TX0 - 0.02, 2.0, TZ1 + 0.02], [TX1, 2.0, TZ1 + 0.02], 0.012, 0xd8d8e0, true, 8);
  const cg = new THREE.PlaneGeometry(0.9, 1.5, 24, 1), cp = cg.attributes.position; for (let i = 0; i < cp.count; i++) cp.setZ(i, 0.05 * Math.sin(cp.getX(i) * 22)); cg.computeVertexNormals(); const curtain = mesh(root, cg, H.toon({ map: H.mkTex(256, 256, (g, w, h) => { g.fillStyle = '#f2f6f8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { g.fillStyle = (i + j) % 2 ? '#7ad0f0' : '#f0a8b8'; g.beginPath(); g.arc(i * 44 + 20 + (j % 2) * 20, j * 44 + 20, 10, 0, TAU); g.fill(); } }), side: THREE.DoubleSide, emissive: 0x181820 }), TX1 - 0.48, 1.25, TZ1 + 0.03, 0, 0, 0, true);
  const duck = new THREE.Group(); duck.position.set(TX0 + 0.25, TH, TZ1 - 0.08); root.add(duck); { const KD = new Kit(); KD.put(M.paint, sph(0.06, 12, 8), 0, 0.05, 0, 0, 0, 0, 1.2, 0.8, 1, 0xffd23a); KD.put(M.paint, sph(0.04, 12, 8), 0.04, 0.11, 0, 0, 0, 0, 1, 1, 1, 0xffd23a); KD.put(M.paint, new THREE.ConeGeometry(0.018, 0.04, 8), 0.085, 0.105, 0, 0, 0, -Math.PI / 2, 1, 1, 1, 0xf87a2a); KD.put(M.paint, sph(0.008, 6, 4), 0.06, 0.125, 0.025, 0, 0, 0, 1, 1, 1, 0x1a1a20); KD.build(duck); }
  K.beam(M.chrome, [-X + 0.04, 1.05, 0.4], [-X + 0.04, 1.05, 1.3], 0.012, 0xd8d8e0, true, 6); K.box(M.cloth, -X + 0.02, -X + 0.08, 0.55, 1.07, 0.5, 1.2, 0xe86a8a, 0.03);
  K.box(M.cloth, 0.5, 1.4, 0.0, 0.015, -0.9, -0.3, 0x5aa890, 0.01);
  // toilet (left front, partly in frame), plant on the sill, a radio
  K.at(-2.1, 0, 0.7, Math.PI / 2, () => { K.box(M.porc, -0.2, 0.2, 0, 0.4, -0.25, 0.15, 0xf6f4ee, 0.08); K.box(M.porc, -0.22, 0.22, 0.4, 0.45, -0.28, 0.2, 0xf6f4ee, 0.05); K.box(M.porc, -0.22, 0.22, 0.45, 0.85, -0.42, -0.25, 0xf6f4ee, 0.04); });
  K.at(0.85, 1.48, ZB + 0.06, 0, () => { K.put(M.paint, cyl(0.06, 0.05, 0.1, 10), 0, 0.05, 0, 0, 0, 0, 1, 1, 1, 0xc8603a); for (let i = 0; i < 5; i++) K.put(M.leaf, lumpGeo(i + 3, 1, 0.3), (R() - 0.5) * 0.1, 0.16 + R() * 0.1, 0, 0, R() * 6, 0, 0.07, 0.08, 0.07, 0x3a8a3a); });
  K.build(root, 0);
  const lamps = [glowAt(root, [SX, 2.24, ZB + 0.2], 1.1, '#ffe0a0', 0.35)]; const winG = glowAt(root, [1.1, 1.8, ZB + 0.1], 1.2, '#7a9aff', 0.25);
  const dust = motes(root, 40, [-2, 2, 0.3, 2.3, -2, 1], 61, 0.009);
  const pool = []; for (let i = 0; i < 3; i++) { const j = makeJet(); root.add(j); pool.push(j); }
  return { win, lamps, winG, dust, pool, duck, tubW, curtain, NZ, SX, SY, TH, tag };
}

// ================================================================= SHOP (garage workshop) + rejection desk
function buildShop(root) { const R = PT.rng(1989), K = new Kit(), X = 3.6, ZB = -2.4, HT = 2.7;
  mesh(root, planeUV(8, 7, 3, 3), M.concrete, 0, 0, 0.5, -Math.PI / 2, 0, 0, false);
  K.box(M.wallShop, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(M.wallShop, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 4, 0xffffff, 0.01);
  mesh(root, plane(2 * X, 7), H.toon({ color: 0xd8d0c0, side: THREE.DoubleSide }), 0, HT, 0.5, Math.PI / 2, 0, 0, false);
  for (let i = 0; i < 6; i++) K.box(M.wood, -X, X, HT - 0.12, HT - 0.02, -2.2 + i * 1.1, -2.1 + i * 1.1, 0x8a6a48, 0.01); // rafters
  mesh(root, plane(2.6, 1.2), M.peg, -0.3, 1.6, ZB + 0.02, 0, 0, 0, false);
  // tools on the pegboard
  K.at(-1.2, 1.7, ZB + 0.05, 0, () => { K.beam(M.metal, [0, 0.3, 0], [0, -0.1, 0], 0.012, 0xb8bcc6, true, 6); K.box(M.paint, -0.03, 0.03, -0.32, -0.1, -0.02, 0.02, 0xd0262c, 0.01); });
  K.at(-0.8, 1.8, ZB + 0.05, 0, () => { K.box(M.paint, -0.04, 0.04, -0.3, 0.0, -0.02, 0.02, 0x2a6ae0, 0.02); K.box(M.metal, -0.12, 0.12, 0.0, 0.05, -0.02, 0.02, 0x8a8a96, 0.01); });
  K.at(-0.3, 1.75, ZB + 0.05, 0, () => { K.box(M.metal, -0.25, 0.25, -0.05, 0.05, -0.01, 0.01, 0xc8ccd4, 0.002); K.box(M.wood, 0.25, 0.4, -0.06, 0.06, -0.025, 0.025, 0x8a5a38, 0.01); });
  K.at(0.3, 1.7, ZB + 0.05, 0, () => { K.put(M.metal, new THREE.TorusGeometry(0.12, 0.02, 6, 20), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xd8a840); });
  K.at(0.75, 1.75, ZB + 0.05, 0, () => { K.beam(M.metal, [0, 0.2, 0], [0, -0.2, 0], 0.014, 0xb8bcc6, true, 6); K.put(M.metal, sph(0.04, 8, 6), 0, 0.22, 0, 0, 0, 0, 1, 1, 1, 0xb8bcc6); });
  // workbench + vise + scattered parts
  const BY = 0.9, BZ = -1.65; K.box(M.wood, -1.8, 1.2, BY - 0.06, BY, BZ - 0.45, BZ + 0.45, 0xb08050, 0.02); for (const a of [-1.7, 1.1]) for (const b of [-0.38, 0.38]) K.box(M.wood, a - 0.05, a + 0.05, 0, BY - 0.06, BZ + b - 0.05, BZ + b + 0.05, 0x8a5a38, 0.01); K.box(M.wood, -1.7, 1.1, 0.25, 0.29, BZ - 0.4, BZ + 0.4, 0x8a5a38, 0.01);
  K.at(-1.5, BY, BZ + 0.2, 0, () => { K.box(M.metal, -0.1, 0.1, 0, 0.12, -0.06, 0.06, 0x3a5a8a, 0.02); K.box(M.metal, -0.1, 0.1, 0.12, 0.2, -0.08, 0.08, 0x3a5a8a, 0.02); K.beam(M.metal, [0, 0.1, 0.08], [0, 0.1, 0.25], 0.012, 0xc8ccd4, true, 6); });
  for (let i = 0; i < 3; i++) K.put(M.pvc, cyl(0.025, 0.025, 0.9, 12), -1.0 + i * 0.06, 0.03 + i * 0.0, -0.6 - i * 0.05, 0, 0.1 * i, Math.PI / 2, 1, 1, 1); // spare pipe on the floor
  K.at(-2.6, 0, -1.6, 0.4, () => { for (let j = 0; j < 3; j++) K.box(M.wood, -0.45, 0.45, 0.4 + j * 0.5, 0.43 + j * 0.5, -0.2, 0.2, 0x8a5a38, 0.01); for (const a of [-0.43, 0.43]) K.box(M.wood, a - 0.02, a + 0.02, 0, 1.5, -0.2, 0.2, 0x6a4028, 0.005);
    for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) K.put(M.paint, cyl(0.07, 0.07, 0.16, 12), -0.3 + i * 0.2, 0.51 + j * 0.5, 0, 0, 0, 0, 1, 1, 1, [0xc8302a, 0x2a6ae0, 0xe8c040, 0x3a8a4a][(i + j) % 4]); });
  // garage door (left wall)
  mesh(root, plane(2.4, 2.1), M.garage, -X + 0.02, 1.05, 0.6, 0, Math.PI / 2, 0, false);
  // the prototype parts: each has a scattered pose and an assembled pose (assembled = barrel along x at the bench centre)
  const AX = -0.2, AY = BY + 0.12, AZ = BZ;
  const parts = []; const part = (geo, mat, from, to) => { const m = mesh(root, geo, mat, ...from.slice(0, 3), ...from.slice(3)); m.userData = { from, to }; parts.push(m); return m; };
  part(cyl(0.03, 0.03, 0.62, 14), M.pvc, [0.6, BY + 0.03, BZ + 0.25, 0, 0.3, Math.PI / 2], [AX, AY, AZ, 0, 0, Math.PI / 2]); // barrel
  part(cyl(0.03, 0.03, 0.26, 14), M.pvc, [0.85, BY + 0.03, BZ - 0.2, 0, -0.5, Math.PI / 2], [AX - 0.24, AY - 0.14, AZ, 0, 0, -0.25]); // grip
  part(new THREE.TorusGeometry(0.03, 0.034, 8, 12, Math.PI / 2), M.pvc, [0.35, BY + 0.03, BZ - 0.3, Math.PI / 2, 0, 0], [AX - 0.27, AY - 0.02, AZ, 0, 0, Math.PI]); // elbow
  part(cyl(0.022, 0.022, 0.3, 12), M.pvc, [1.0, BY + 0.025, BZ + 0.05, 0, 0.8, Math.PI / 2], [AX + 0.02, AY - 0.07, AZ, 0, 0, Math.PI / 2]); // pump tube
  const plex = part(new THREE.BoxGeometry(0.2, 0.012, 0.1), M.plexi, [-0.7, BY + 0.01, BZ + 0.2, 0, 0.4, 0], [AX + 0.02, AY - 0.11, AZ, 0, 0, 0]); // plexi pump plate
  const bot = new THREE.Group(); { mesh(bot, lathe('soda', [[0.001, 0], [0.05, 0], [0.055, 0.02], [0.055, 0.18], [0.04, 0.24], [0.015, 0.27], [0.015, 0.3], [0.001, 0.3]], 20), M.bottle, 0, 0, 0, 0, 0, 0, false); mesh(bot, cyl(0.048, 0.048, 0.12, 18), M.bottleW, 0, 0.07, 0, 0, 0, 0, false); mesh(bot, cyl(0.057, 0.057, 0.05, 18), M.label, 0, 0.12, 0, 0, 0, 0, false).material = H.toon({ color: 0xd8303a, emissive: 0x3a0808 }); mesh(bot, cyl(0.017, 0.017, 0.02, 10), H.toon({ color: 0xd8303a }), 0, 0.3, 0); }
  root.add(bot); bot.userData = { from: [-0.45, BY, BZ - 0.15, 0, 0, 0], to: [AX - 0.02, AY + 0.33, AZ, Math.PI, 0, 0] }; parts.push(bot);
  part(new THREE.ConeGeometry(0.03, 0.08, 10), M.brass, [-0.95, BY + 0.03, BZ + 0.05, 0, 0, Math.PI / 2], [AX + 0.35, AY, AZ, 0, 0, -Math.PI / 2]); // nozzle
  const tags = [mesh(root, plane(0.2, 0.075), M.tagPVC, 0.62, BY + 0.003, BZ + 0.37, -Math.PI / 2 + 0.25, 0, 0.1, false), mesh(root, plane(0.2, 0.075), M.tagPlex, -0.7, BY + 0.003, BZ + 0.33, -Math.PI / 2 + 0.25, 0, -0.05, false), mesh(root, plane(0.22, 0.08), M.tagSoda, -0.45, BY + 0.003, BZ + 0.0, -Math.PI / 2 + 0.25, 0, 0.0, false)];
  // the desk (right): lamp, mail tray, the growing pile of rejection letters, the wall calendar, a phone
  const DX = 2.5, DZ = -1.6, DY = 0.76; K.box(M.wood, DX - 0.7, DX + 0.7, DY - 0.05, DY, DZ - 0.4, DZ + 0.4, 0x6a4028, 0.02); for (const s of [-1, 1]) K.box(M.wood, DX + s * 0.55 - 0.15, DX + s * 0.55 + 0.15, 0, DY - 0.05, DZ - 0.35, DZ + 0.35, 0x5a3420, 0.01);
  K.at(DX + 0.5, DY, DZ - 0.2, 0, () => { K.put(M.brass, cyl(0.07, 0.09, 0.03, 12), 0, 0.015, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); K.beam(M.brass, [0, 0, 0], [-0.06, 0.4, 0], 0.012, 0xc8a050, true, 6); K.put(M.paint, new THREE.ConeGeometry(0.11, 0.13, 14, 1, true), -0.1, 0.42, 0, 0, 0, 0.5, 1, 1, 1, 0x2a5a3a); });
  K.at(DX - 0.45, DY, DZ - 0.15, 0.3, () => { K.box(M.plastic, -0.12, 0.12, 0, 0.08, -0.08, 0.08, 0x2a2a30, 0.02); K.box(M.plastic, -0.13, 0.13, 0.08, 0.11, -0.03, 0.03, 0x2a2a30, 0.02); });
  const cal = mesh(root, plane(0.6, 0.56), M.cal, DX, 1.55, ZB + 0.02, 0, 0, 0, false);
  const letters = []; for (let i = 0; i < 14; i++) { const l = mesh(root, plane(0.21, 0.27), M.letter, DX - 0.05 + (R() - 0.5) * 0.08, DY + 0.004 + i * 0.004, DZ + 0.12 + (R() - 0.5) * 0.06, -Math.PI / 2, 0, (R() - 0.5) * 0.6, false); l.userData.base = [l.position.x, l.position.y, l.position.z, l.rotation.z]; letters.push(l); }
  K.at(DX - 0.3, 0, DZ + 0.75, 2.6, () => { K.box(M.cloth, -0.22, 0.22, 0.42, 0.5, -0.22, 0.22, 0x2a4a6a, 0.04); K.box(M.cloth, -0.22, 0.22, 0.5, 0.95, -0.24, -0.18, 0x2a4a6a, 0.05); K.beam(M.metal, [0, 0.05, 0], [0, 0.42, 0], 0.025, 0x2a2a30, true, 6); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; K.beam(M.metal, [0, 0.05, 0], [Math.cos(a) * 0.25, 0.03, Math.sin(a) * 0.25], 0.015, 0x2a2a30, true, 4); } });
  lampShade(K, -0.3, 2.2, -1.5, 0x3a6a4a);
  K.build(root, 0);
  const lamps = [glowAt(root, [-0.3, 2.14, -1.5], 1.0, '#ffe0a0', 0.4), glowAt(root, [DX + 0.42, DY + 0.38, DZ - 0.2], 0.5, '#ffe0a0', 0.25)];
  const dust = motes(root, 50, [-2, 3, 0.4, 2.4, -2.2, 0.5], 63, 0.01);
  return { lamps, dust, parts, tags, letters, cal, BY, BZ, DX, DY, DZ, AX, AY, AZ };
}

// ================================================================= YARD (1990 backyard)
function buildYard(root) { const R = PT.rng(1990), K = new Kit();
  mesh(root, planeUV(70, 60, 18, 15), M.grass, 0, 0, -10, -Math.PI / 2, 0, 0, false);
  // house wall (left) with siding, window, back door + steps + porch light
  K.box(M.siding, -4.6, -3.4, 0, 3.4, -6, 4, 0xffffff, 0.01); K.box(M.paint, -3.42, -3.35, 2.95, 3.05, -6, 4, 0xf2f0ea, 0.01);
  mesh(root, plane(1.0, 0.9), H.M.basic(H.mkTex(256, 230, windowTex({ a: '#9ac8f0', b: '#e8f0f8', c: '#b8c0d0' })), 1.0), -3.39, 1.7, -2.6, 0, Math.PI / 2, 0, false); K.box(M.paint, -3.4, -3.3, 1.2, 1.25, -3.15, -2.05, 0xf2f0ea, 0.01);
  K.box(M.paint, -3.42, -3.36, 0.3, 2.3, -0.2, 0.75, 0x3a6a9a, 0.02); K.put(M.brass, sph(0.03, 8, 6), -3.33, 1.25, 0.6, 0, 0, 0, 1, 1, 1, 0xc8a050);
  for (let i = 0; i < 3; i++) K.box(M.wood, -3.4, -2.9 + i * 0.0 - i * 0.3 + 0.6, 0, 0.3 - i * 0.1, -0.35, 0.9, 0xb89070, 0.02);
  K.put(M.lampGlass, sph(0.06, 10, 8), -3.3, 2.5, 1.0, 0, 0, 0, 1, 1, 1);
  // back fence + neighbours' roofs + trees behind
  for (const [x0, x1, z] of [[-3.4, 9, -6]]) { const fg = planeUV(x1 - x0, 1.8, (x1 - x0) / 3, 1); mesh(root, fg, M.fence, (x0 + x1) / 2, 0.9, z, 0, 0, 0, true); K.box(M.wood, x0, x1, 1.78, 1.84, z - 0.05, z + 0.03, 0x8a5a38, 0.01); }
  { const fg = planeUV(10, 1.8, 3.3, 1); mesh(root, fg, M.fence, 5, 0.9, -1, 0, -Math.PI / 2, 0, true); }
  const roofs = mesh(root, plane(60, 9), M.roofs, 2, 4.0, -18, 0, 0, 0, false); roofs.renderOrder = -1; const sky = mesh(root, plane(400, 160), M.sky, 0, 40, -140, 0, 0, 0, false);
  tree(K, 5.2, -7.5, 1.2, R); tree(K, -1.8, -9, 1.3, R); tree(K, 8, -12, 1.4, R);
  // kiddie pool (right), sprinkler, garden hose, lawn chairs, picnic table with toy boxes
  K.put(M.paint, new THREE.TorusGeometry(0.85, 0.14, 10, 32), 2.2, 0.14, -2.4, Math.PI / 2, 0, 0, 1, 1, 1, 0x3ab0e8); K.put(M.paint, new THREE.TorusGeometry(0.85, 0.12, 10, 32), 2.2, 0.36, -2.4, Math.PI / 2, 0, 0, 1, 1, 1, 0xf8d040); K.put(M.paint, cyl(0.85, 0.85, 0.02, 32), 2.2, 0.01, -2.4, 0, 0, 0, 1, 1, 1, 0x7ad0f0);
  const poolW = mesh(root, new THREE.CircleGeometry(0.78, 32), M.waterPool, 2.2, 0.32, -2.4, -Math.PI / 2, 0, 0, false);
  K.put(M.paint, sph(0.2, 14, 10), 2.0, 0.42, -2.5, 0, 0, 0, 1, 1, 1, 0xf04a8a); // beach ball
  K.at(0.6, 0, -3.6, 0, () => { K.put(M.metal, cyl(0.08, 0.1, 0.06, 12), 0, 0.03, 0, 0, 0, 0, 1, 1, 1, 0x3a8a4a); K.beam(M.metal, [0, 0.06, 0], [0, 0.18, 0], 0.012, 0xc8ccd4, true, 6); });
  { const c = new THREE.CatmullRomCurve3([[-3.35, 0.6, -1.5], [-3.0, 0.02, -1.6], [-2.0, 0.02, -2.6], [-0.6, 0.02, -3.2], [0.55, 0.03, -3.6]].map((p) => new THREE.Vector3(...p))); mesh(root, new THREE.TubeGeometry(c, 40, 0.016, 6), H.toon({ color: 0x3aa84a }), 0, 0, 0); }
  for (const [x, z, ry] of [[3.2, 0.4, -0.9], [-2.4, -4.2, 0.4]]) K.at(x, 0, z, ry, () => { K.box(M.cloth, -0.25, 0.25, 0.3, 0.33, -0.25, 0.2, 0x5ac8e8, 0.01); K.box(M.cloth, -0.25, 0.25, 0.33, 0.8, -0.3, -0.25, 0x5ac8e8, 0.01); for (const a of [-0.25, 0.25]) K.beam(M.chrome, [a, 0, 0.2], [a, 0.8, -0.28], 0.012, 0xd8d8e0, true, 4); });
  const PTX = -1.4, PTZ = -4.4; K.box(M.wood, PTX - 0.8, PTX + 0.8, 0.7, 0.75, PTZ - 0.4, PTZ + 0.4, 0xb8784a, 0.02); for (const s of [-1, 1]) { K.box(M.wood, PTX - 0.8, PTX + 0.8, 0.4, 0.44, PTZ + s * 0.6 - 0.12, PTZ + s * 0.6 + 0.12, 0xb8784a, 0.02); for (const a of [-0.65, 0.65]) K.beam(M.wood, [PTX + a, 0, PTZ + s * 0.7], [PTX + a, 0.72, PTZ - s * 0.1], 0.035, 0x8a5a38, true, 4); }
  M.boxes.forEach((mt, i) => K.put(mt, new THREE.BoxGeometry(0.34, 0.32, 0.09), PTX - 0.5 + i * 0.36, 0.91, PTZ - 0.1 + (i % 2) * 0.12, 0, (i - 1.5) * 0.15, 0, 1, 1, 1));
  K.put(M.paint, cyl(0.1, 0.1, 0.02, 12), PTX + 0.55, 0.76, PTZ + 0.2, 0, 0, 0, 1, 1, 1, 0xf2f0ea);
  // flower bed along the fence, foreground grass tufts
  for (let i = 0; i < 40; i++) { const x = -3 + i * 0.28 + (R() - 0.5) * 0.1, z = -5.75 + R() * 0.3, h = 0.2 + R() * 0.25; K.beam(M.leaf, [x, 0, z], [x, h, z], 0.01, 0x3a8a2a, true, 4); K.put(M.paint, sph(0.05, 8, 6), x, h, z, 0, 0, 0, 1, 0.8, 1, [0xf8d040, 0xf04a6a, 0xffffff, 0xc87ae8][i % 4]); }
  for (let i = 0; i < 40; i++) { const x = (R() - 0.5) * 6, z = 1.2 + R() * 1.5; K.put(M.leaf, new THREE.ConeGeometry(0.025, 0.12 + R() * 0.1, 4), x, 0.06, z, (R() - 0.5) * 0.4, R() * 3, (R() - 0.5) * 0.4, 1, 1, 1, [0x4a9a32, 0x5aaa3a][i % 2]); }
  K.build(root, 0);
  const porch = glowAt(root, [-3.25, 2.5, 1.0], 0.8, '#ffe0a0', 0.0);
  const dust = motes(root, 40, [-2, 2, 0.3, 2.5, -3, 1], 71, 0.01);
  const pool = []; for (let i = 0; i < 6; i++) { const j = makeJet(); root.add(j); pool.push(j); }
  return { roofs, sky, porch, dust, pool, poolW };
}

// ================================================================= JPL clean room
function buildJPL(root) { const R = PT.rng(1979), K = new Kit(), X = 5, ZB = -4, HT = 4.2;
  mesh(root, planeUV(10, 9, 5, 4.5), M.cleanFloor, 0, 0, 0.5, -Math.PI / 2, 0, 0, false);
  K.box(M.clean, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(M.clean, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 5, 0xffffff, 0.01);
  for (let i = 0; i < 9; i++) K.box(M.paint, -X + 0.6 + i * 1.1, -X + 1.0 + i * 1.1, 0.4, HT - 0.4, ZB, ZB + 0.03, 0xdde2ea, 0.01); // wall filter panels
  mesh(root, plane(2 * X, 9), H.toon({ color: 0xf0f2f6, side: THREE.DoubleSide }), 0, HT, 0.5, Math.PI / 2, 0, 0, false);
  const fl = []; for (let i = 0; i < 3; i++) for (const x of [-2, 0, 2]) fl.push(mesh(root, new THREE.BoxGeometry(1.2, 0.04, 0.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xf4f8ff).multiplyScalar(1.5), fog: false }), x, HT - 0.03, -2.6 + i * 1.6));
  const sign = mesh(root, plane(2.4, 0.48), M.signJPL, 0, 3.6, ZB + 0.04, 0, 0, 0, false);
  // the stand + the probe model
  K.box(M.metal, -0.9, 0.9, 0, 0.12, -2.3, -0.9, 0x5a6a8a, 0.03); K.put(M.metal, cyl(0.18, 0.28, 0.9, 16), 0, 0.57, -1.6, 0, 0, 0, 1, 1, 1, 0x8a96aa);
  const pr = probe(root, 0.95); pr.g.position.set(0, 1.55, -1.6); pr.g.rotation.y = 0.5;
  // stanchions + rope, whiteboard, terminal desk, a gas cylinder, a ladder
  for (const [x, z] of [[-1.6, -0.3], [0, 0.0], [1.6, -0.3]]) { K.put(M.chrome, cyl(0.12, 0.14, 0.04, 14), x, 0.02, z, 0, 0, 0, 1, 1, 1, 0xd8d8e0); K.beam(M.chrome, [x, 0.04, z], [x, 0.95, z], 0.025, 0xd8d8e0, true, 8); K.put(M.chrome, sph(0.04, 10, 8), x, 0.97, z, 0, 0, 0, 1, 1, 1, 0xd8d8e0); }
  for (const [a, b] of [[[-1.6, 0.92, -0.3], [0, 0.92, 0.0]], [[0, 0.92, 0.0], [1.6, 0.92, -0.3]]]) { const c = new THREE.CatmullRomCurve3([new THREE.Vector3(...a), new THREE.Vector3((a[0] + b[0]) / 2, 0.75, (a[2] + b[2]) / 2), new THREE.Vector3(...b)]); mesh(root, new THREE.TubeGeometry(c, 20, 0.018, 6), H.toon({ color: 0xc8303a }), 0, 0, 0); }
  mesh(root, plane(2.0, 1.25), M.wboard, -3.0, 1.8, ZB + 0.04, 0, 0, 0, false); K.box(M.metal, -4.05, -1.95, 1.12, 1.16, ZB, ZB + 0.12, 0xb8bcc6, 0.01);
  K.at(3.0, 0, -2.6, -0.4, () => { K.box(M.paint, -0.7, 0.7, 0.72, 0.76, -0.35, 0.35, 0xc8ccd4, 0.01); for (const a of [-0.65, 0.65]) K.box(M.metal, a - 0.03, a + 0.03, 0, 0.72, -0.3, 0.3, 0x5a5a66, 0.01); K.box(M.plastic, -0.3, 0.3, 0.76, 1.22, -0.25, 0.15, 0xe8e0c8, 0.04); K.box(M.plastic, -0.35, 0.35, 0.76, 0.8, 0.12, 0.32, 0xe8e0c8, 0.01); });
  const term = mesh(root, plane(0.42, 0.32), M.terminal, 3.0 + 0.2 * Math.sin(-0.4) * 0 + 0.062, 1.0, -2.6 + 0.152, 0, -0.4, 0, false); term.position.set(3.0 + 0.155 * Math.sin(-0.4), 1.0, -2.6 + 0.155 * Math.cos(-0.4));
  K.at(-3.6, 0, -2.6, 0, () => { K.put(M.paint, cyl(0.12, 0.12, 1.2, 14), 0, 0.6, 0, 0, 0, 0, 1, 1, 1, 0x3a8a4a); K.put(M.chrome, cyl(0.03, 0.05, 0.12, 10), 0, 1.25, 0, 0, 0, 0, 1, 1, 1, 0xd8d8e0); });
  K.at(2.3, 0, -3.6, 0.2, () => { for (const a of [-0.25, 0.25]) K.beam(M.metal, [a, 0, 0.3], [a, 2.4, -0.1], 0.025, 0xd8c040, true, 4); for (let i = 0; i < 7; i++) K.beam(M.metal, [-0.25, 0.3 + i * 0.3, 0.26 - i * 0.05], [0.25, 0.3 + i * 0.3, 0.26 - i * 0.05], 0.015, 0xd8c040, true, 4); });
  K.build(root, 0);
  const glows = [glowAt(root, [0, 3.9, -1.6], 2.4, '#e8f0ff', 0.3)]; const hot = pr.booms.map((b) => glowAt(root, [0, 0, 0], 0.7, '#ff9a40', 0.5));
  const dust = motes(root, 60, [-3, 3, 0.4, 3.5, -3.6, 0.5], 79, 0.01);
  return { pr, glows, hot, dust, fl };
}

// ================================================================= COURT (arbitration room)
function buildCourt(root) { const R = PT.rng(2013), K = new Kit(), X = 4, ZB = -3.2, HT = 2.9;
  mesh(root, planeUV(8, 7, 2, 2), M.carpet, 0, 0, 0.3, -Math.PI / 2, 0, 0, false);
  K.box(M.panel, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(M.panel, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 4, 0xffffff, 0.01);
  mesh(root, plane(2 * X, 7), H.toon({ color: 0xe8e0d0, side: THREE.DoubleSide }), 0, HT, 0.3, Math.PI / 2, 0, 0, false);
  const win = mesh(root, plane(2.6, 1.4), M.city, 1.4, 1.75, ZB + 0.02, 0, 0, 0, false); for (const x of [0.1, 0.97, 1.83, 2.7]) K.box(M.paint, x - 0.03, x + 0.03, 1.02, 2.48, ZB, ZB + 0.08, 0x3a2418, 0.005); K.box(M.paint, 0.08, 2.72, 1.0, 1.05, ZB, ZB + 0.14, 0x3a2418, 0.01); K.box(M.paint, 0.08, 2.72, 2.45, 2.5, ZB, ZB + 0.08, 0x3a2418, 0.01);
  // bookcase (back left), flag-free plain wall clock, framed certificates
  K.box(M.wood, -3.6, -1.6, 0, 2.3, ZB, ZB + 0.38, 0x5a3420, 0.02); for (let j = 0; j < 5; j++) { K.box(M.wood, -3.58, -1.62, 0.3 + j * 0.42, 0.33 + j * 0.42, ZB, ZB + 0.37, 0x4a2a18, 0.005); for (let i = 0; i < 12; i++) { const h = 0.28 + R() * 0.08; K.box(M.paint, -3.5 + i * 0.155, -3.38 + i * 0.155, 0.33 + j * 0.42, 0.33 + j * 0.42 + h, ZB + 0.05, ZB + 0.3, [0x6a1a1a, 0x1a3a5a, 0x2a4a2a, 0x5a4a1a][(i + j) % 4], 0.005); } }
  K.at(-0.8, 2.25, ZB + 0.03, 0, () => { K.put(M.wood, cyl(0.2, 0.2, 0.05, 24), 0, 0, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a2418); K.put(M.paint, cyl(0.17, 0.17, 0.01, 24), 0, 0, 0.03, Math.PI / 2, 0, 0, 1, 1, 1, 0xf6f2e6); K.box(M.paint, -0.008, 0.008, 0, 0.13, 0.035, 0.04, 0x1a1a20, 0.001); K.box(M.paint, 0, 0.1, -0.008, 0.008, 0.035, 0.04, 0x1a1a20, 0.001); });
  // the long table + chairs + binders + water pitcher + glasses + nameplate
  const TY = 0.76; K.box(M.wood, -1.8, 1.8, TY - 0.06, TY, -1.9, -0.9, 0x4a2a18, 0.03); for (const a of [-1.6, 1.6]) K.box(M.wood, a - 0.1, a + 0.1, 0, TY - 0.06, -1.6, -1.2, 0x3a2010, 0.02);
  for (const [x, z, ry] of [[-1.1, -2.3, 0], [0.0, -2.35, 0], [1.1, -2.3, 0], [-1.1, -0.45, Math.PI], [1.1, -0.45, Math.PI]]) K.at(x, 0, z, ry, () => { K.box(M.cloth, -0.24, 0.24, 0.42, 0.5, -0.22, 0.22, 0x2a1a20, 0.04); K.box(M.cloth, -0.24, 0.24, 0.5, 1.1, -0.26, -0.18, 0x2a1a20, 0.05); K.beam(M.metal, [0, 0.05, 0], [0, 0.42, 0], 0.025, 0x2a2a30, true, 6); });
  for (const [x, z, c] of [[-1.2, -1.5, 0x2a4a8a], [-1.05, -1.45, 0xc8302a], [0.9, -1.5, 0x2a2a30], [1.3, -1.35, 0x3a6a3a]]) K.box(M.binder, x - 0.16, x + 0.16, TY, TY + 0.07, z - 0.12, z + 0.12, c, 0.01);
  mesh(root, lathe('pitcher', [[0.001, 0], [0.07, 0], [0.08, 0.05], [0.08, 0.2], [0.06, 0.24], [0.07, 0.26]], 18), M.glassC, -0.3, TY, -1.3, 0, 0, 0, false); K.put(M.waterPool, cyl(0.068, 0.072, 0.14, 16), -0.3, TY + 0.075, -1.3, 0, 0, 0, 1, 1, 1);
  for (const x of [-0.05, 0.25]) { mesh(root, cyl(0.035, 0.03, 0.1, 12), M.glassC, x, TY + 0.05, -1.25); K.put(M.waterPool, cyl(0.03, 0.027, 0.06, 12), x, TY + 0.03, -1.25, 0, 0, 0, 1, 1, 1); }
  K.put(M.wood, new THREE.BoxGeometry(0.4, 0.09, 0.05), 0, TY + 0.05, -1.75, -0.3, 0, 0, 1, 1, 1, 0x3a2418); const plate = mesh(root, plane(0.38, 0.09), M.plate, 0, TY + 0.055, -1.72, -0.3, 0, 0, false);
  for (let i = 0; i < 3; i++) lampShade(K, -1.2 + i * 1.2, 2.3, -1.4, 0x8a6a3a);
  K.put(M.paint, cyl(0.22, 0.18, 0.4, 12), 3.4, 0.2, -2.6, 0, 0, 0, 1, 1, 1, 0x8a4a2a); for (let i = 0; i < 9; i++) K.put(M.leaf, lumpGeo(i + 2, 1, 0.3), 3.4 + (R() - 0.5) * 0.5, 0.7 + R() * 0.9, -2.6 + (R() - 0.5) * 0.5, 0, R() * 6, 0, 0.3, 0.34, 0.3, 0x3a7a3a);
  K.build(root, 0);
  const lamps = [-1.2, 0, 1.2].map((x) => glowAt(root, [x, 2.22, -1.4], 0.9, '#ffe0a0', 0.35)); const shaft = shaftAt(root, [1.4, 1.2, ZB + 1.6], 2.6, 2.8, 0.0, 0.3, 0.16, 0xfff0d0);
  const dust = motes(root, 50, [-2, 2, 0.4, 2.6, -3, 0.5], 83, 0.01);
  return { lamps, shaft, dust, win };
}

// ================================================================= SPACE
function buildSpace(root) { const R = PT.rng(1989), K = new Kit();
  const sky = nond(mesh(root, new THREE.SphereGeometry(400, 32, 16), M.stars, 0, 0, 0, 0, 0, 0, false)); sky.renderOrder = -2;
  const jup = new THREE.Group(); jup.position.set(-9, 2, -38); root.add(jup); const jm = mesh(jup, new THREE.SphereGeometry(16, 64, 40), M.jup, 0, 0, 0, 0.12, 0, 0, false);
  const glowJ = glowAt(jup, [0, 0, 0.5], 46, '#ffd8a8', 0.25); glowJ.renderOrder = -1;
  const sat = new THREE.Group(); sat.position.set(60, 22, -160); sat.rotation.z = -0.35; sat.rotation.x = 0.35; root.add(sat); mesh(sat, new THREE.SphereGeometry(6, 40, 24), M.sat, 0, 0, 0, 0, 0, 0, false);
  const rg = new THREE.RingGeometry(7.5, 15, 96, 1), rp = rg.attributes.position, ru = rg.attributes.uv; for (let i = 0; i < rp.count; i++) { const r = Math.hypot(rp.getX(i), rp.getY(i)); ru.setXY(i, (r - 7.5) / 7.5, 0.5); } const ring = nond(mesh(sat, rg, M.ring, 0, 0, 0, -Math.PI / 2 + 0.2, 0, 0, false));
  // a few moons of Jupiter
  const moons = [[-15, 9, -24, 0.9, 0xd8c8a0], [-22, -3, -26, 0.7, 0xc8b090], [4, -8, -24, 0.6, 0xe8d0b8]].map(([x, y, z, r, c]) => mesh(root, sph(r, 20, 14), H.toon({ color: c, emissive: 0x201810 }), x, y, z, 0, 0, 0, false));
  const pr = probe(root, 1); pr.g.position.set(0, 0, 0);
  const hot = pr.booms.map(() => glowAt(root, [0, 0, 0], 1.1, '#ff9a40', 0.55));
  const sun = glowAt(root, [30, 14, 40], 30, '#fff4d0', 0.0);
  const dust = motes(root, 60, [-4, 4, -3, 3, -6, 2], 89, 0.01);
  return { sky, jup, jm, sat, ring, moons, pr, hot, dust };
}

// ================================================================= lights, grades, API
const SET_LIGHT = {
  bathNight: { top: '#000000', hor: '#2a2030', fog: '#2a2030', fogN: 10, fogF: 40, sky: '#ffe0c0', ground: '#4a3a40', hemiI: 0.85, fillCol: '#6a78e0', fillI: 0.4, sunCol: '#ffe0b0', sunI: 2.2, az: -150, el: 50, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff4ec', fxTint: '#ffffff', shafts: 0 },
  shopLate: { top: '#000000', hor: '#1a1420', fog: '#1a1420', fogN: 10, fogF: 40, sky: '#ffd8a8', ground: '#3a3030', hemiI: 0.75, fillCol: '#5a68d8', fillI: 0.42, sunCol: '#ffd8a0', sunI: 2.2, az: 160, el: 55, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
  yardSun: { top: '#3a7ae0', hor: '#d0e4f8', fog: '#d4e4f4', fogN: 30, fogF: 200, sky: '#a8c4f4', ground: '#5a7a40', hemiI: 0.85, fillCol: '#7d93e6', fillI: 0.34, sunCol: '#fff2d8', sunI: 3.4, az: 35, el: 48, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0.3 },
  yardGold: { top: '#4a4aa0', hor: '#ffb070', fog: '#e8a080', fogN: 30, fogF: 180, sky: '#9a88d0', ground: '#5a4a40', hemiI: 0.85, fillCol: '#6a6ad8', fillI: 0.38, sunCol: '#ffa060', sunI: 2.8, az: 20, el: 9, disc: '#fff0c8', discSize: 0.005, clouds: true, stars: 0, cardTint: '#fff0e2', fxTint: '#fff6ea', shafts: 0.6 },
  jplDay: { top: '#000000', hor: '#c8ccd8', fog: '#c8ccd8', fogN: 14, fogF: 60, sky: '#f4f8ff', ground: '#7a7a88', hemiI: 0.95, fillCol: '#8a98e8', fillI: 0.36, sunCol: '#f4f8ff', sunI: 2.6, az: 150, el: 60, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  courtDay: { top: '#000000', hor: '#3a2a20', fog: '#3a2a20', fogN: 12, fogF: 50, sky: '#ffe8c8', ground: '#4a3a30', hemiI: 0.85, fillCol: '#7a78d0', fillI: 0.36, sunCol: '#fff0d8', sunI: 2.5, az: 170, el: 35, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff6ee', fxTint: '#ffffff', shafts: 0 },
  space: { top: '#000000', hor: '#04051a', fog: '#04051a', fogN: 200, fogF: 900, sky: '#8aa0ff', ground: '#1a1030', hemiI: 0.5, fillCol: '#5a68ff', fillI: 0.5, sunCol: '#fff4e0', sunI: 3.0, az: 60, el: 20, disc: '#000000', clouds: false, shadow: false, stars: 0, cardTint: '#f0f0ff', fxTint: '#ffffff', shafts: 0 },
  spaceGold: { top: '#000000', hor: '#04051a', fog: '#04051a', fogN: 200, fogF: 900, sky: '#ffc890', ground: '#1a1030', hemiI: 0.5, fillCol: '#6a58e8', fillI: 0.5, sunCol: '#ffd8a0', sunI: 3.0, az: 50, el: 12, disc: '#000000', clouds: false, shadow: false, stars: 0, cardTint: '#fff0e8', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  bathNight: { look: 'office', over: { exp: 0.98, con: 1.22, sat: 1.1, lift: [0.03, 0.022, 0.05], tS: ['#2a2a7a', 0.2], tH: ['#ffe0b8', 0.1], bloom: [0.44, 0.76], hal: [0.24, '#ffb070'], vig: [0.36, 0.44, '#14081a'] } },
  shopLate: { look: 'office', over: { exp: 0.98, con: 1.24, sat: 1.08, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.2], tH: ['#ffc888', 0.12], bloom: [0.44, 0.74], hal: [0.28, '#ff9a50'], vig: [0.38, 0.42, '#14081a'] } },
  yardSun: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.14, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c0', 0.06], bloom: [0.36, 0.86], vig: [0.26, 0.5, '#4a3a5a'] } },
  yardGold: { look: 'golden', over: { exp: 1.06, con: 1.22, sat: 1.12, tS: ['#3a2a8a', 0.18], tH: ['#ffb880', 0.1], bloom: [0.44, 0.76], hal: [0.26, '#ff9a60'], vig: [0.32, 0.46, '#1e1a3a'] } },
  jplDay: { look: 'day', over: { exp: 1.02, con: 1.2, sat: 1.06, tS: ['#3a4a8a', 0.16], tH: ['#f0f4ff', 0.06], bloom: [0.4, 0.82], vig: [0.28, 0.48, '#2a2a4a'] } },
  courtDay: { look: 'office', over: { exp: 1.1, con: 1.22, sat: 1.08, lift: [0.03, 0.02, 0.04], tS: ['#3a2a6a', 0.16], tH: ['#ffe0b8', 0.1], bloom: [0.42, 0.78], hal: [0.22, '#ffb070'], vig: [0.34, 0.44, '#1a0c14'] } },
  space: { look: 'night', over: { exp: 1.12, con: 1.24, sat: 1.12, lift: [0.015, 0.015, 0.05], tS: ['#1a1a6a', 0.24], tH: ['#ffe8c8', 0.08], bloom: [0.5, 0.66], hal: [0.3, '#ffb070'], vig: [0.4, 0.42, '#02021a'] } },
  spaceGold: { look: 'night', over: { exp: 1.14, con: 1.24, sat: 1.14, lift: [0.02, 0.012, 0.04], tS: ['#2a1a6a', 0.24], tH: ['#ffc888', 0.14], bloom: [0.5, 0.66], hal: [0.32, '#ff9a50'], vig: [0.4, 0.42, '#08021a'] } },
};

export function buildSK(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'bathNight', jets: [], build: 0, letters: 0, duck: 0, tubFill: 0, probeT: 0, probeP: null, probeRY: 0.5, satVis: 1, porch: 0 };
  let ba, sh, yd, jp, ct, sp;
  const API = makeAPI(ctx, { prefix: 'sk_', origin: SK_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { yardSun: 'day', yardGold: 'day' },
    practicals: (name, F, W3) => { const fl = 1 + 0.04 * Math.sin(F * 0.7) + 0.02 * Math.sin(F * 1.9);
      if (name === 'bathNight') return [{ p: W3('bath', [-1.45, 2.2, -1.8]), col: '#ffe0b0', I: 3 * fl, d: 5 }, { p: W3('bath', [1.1, 1.8, -1.6]), col: '#7a9aff', I: 2.0, d: 5 }, { p: W3('bath', [0.2, 2.4, 0.6]), col: '#ffe8c8', I: 1.4, d: 6 }, { p: W3('bath', [1.6, 0.9, -1.5]), col: '#8ad8ff', I: 1.5 * ST.tubFill, d: 2.5 }];
      if (name === 'shopLate') return [{ p: W3('shop', [-0.3, 2.1, -1.5]), col: '#ffe0a8', I: 3.6 * fl, d: 5 }, { p: W3('shop', [2.4, 1.2, -1.8]), col: '#ffd8a0', I: 1.8 * fl, d: 3 }, { p: W3('shop', [-3.2, 1.6, 0.6]), col: '#6a80ff', I: 2.0, d: 6 }];
      if (name === 'jplDay') return [{ p: W3('jpl', [0, 3.6, -1.0]), col: '#f4f8ff', I: 5, d: 9 }, { p: W3('jpl', [-1.4, 1.6, -1.3]), col: '#ffa050', I: 1.8, d: 2.2 }, { p: W3('jpl', [1.4, 1.6, -1.9]), col: '#ffa050', I: 1.8, d: 2.2 }];
      if (name === 'courtDay') return [{ p: W3('court', [-1.2, 2.2, -1.4]), col: '#ffe0b0', I: 3.5, d: 5 }, { p: W3('court', [1.2, 2.2, -1.4]), col: '#ffe0b0', I: 3.5, d: 5 }, { p: W3('court', [1.4, 1.8, -2.6]), col: '#fff4e0', I: 4, d: 7 }];
      if (name.startsWith('space')) { const p = sp ? sp.pr.g.position : { x: 0, y: 0, z: 0 }; return [{ p: W3('space', [p.x, p.y + 0.2, p.z + 0.4]), col: '#ffa050', I: 3, d: 4 }, { p: W3('space', [-6, 4, -14]), col: '#ffd8a8', I: 2, d: 30 }]; }
      if (name === 'yardGold') return [{ p: W3('yard', [-3.2, 2.4, 1.0]), col: '#ffd890', I: 3 * ST.porch, d: 5 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      const jets = (cur === 'bath' && ba) ? ba.pool : (cur === 'yard' && yd) ? yd.pool : null; if (jets) jets.forEach((j, i) => { const J = ST.jets[i]; if (J) tickJet(j, J, f, i); else j.visible = false; });
      if (cur === 'bath' && ba) { tickMotes(ba.dust, f, 0.25); ba.lamps[0].material.opacity = 0.5 * (0.94 + 0.06 * Math.sin(f * 0.6)); const d = ST.duck; ba.duck.position.set(0.75 + 0.25 + d * 0.5, ba.TH + 0.6 * d * (1 - d) * 2.2, -2.2 + 0.82 - 0.08 - d * 0.3); ba.duck.rotation.z = -d * 5;
        ba.tubW.position.y = ba.TH - 0.12 + 0.07 * ST.tubFill + 0.006 * Math.sin(T * 9) * ST.tubFill; ba.curtain.rotation.y = 0.04 * Math.sin(T * 3) * ST.tubFill; }
      if (cur === 'shop' && sh) { tickMotes(sh.dust, f, 0.3); const N = sh.parts.length; sh.parts.forEach((p, i) => { const k = Math.max(0, Math.min(1, ST.build * N - i)), e = k * k * (3 - 2 * k), a = p.userData.from, b = p.userData.to; p.position.set(a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e + 0.35 * Math.sin(Math.PI * e), a[2] + (b[2] - a[2]) * e); p.rotation.set(a[3] + (b[3] - a[3]) * e, a[4] + (b[4] - a[4]) * e + 2 * Math.PI * e, a[5] + (b[5] - a[5]) * e); });
        sh.tags.forEach((t) => (t.visible = ST.build < 0.98)); sh.letters.forEach((l, i) => { const k = Math.max(0, Math.min(1, ST.letters * sh.letters.length - i)), [x, y, z, rz] = l.userData.base; l.visible = k > 0; l.position.set(x, y + (1 - k) * (1 - k) * 0.9, z + (1 - k) * 0.4); l.rotation.z = rz + (1 - k) * 3; }); }
      if (cur === 'yard' && yd) { tickMotes(yd.dust, f, 0.3); yd.poolW.position.y = 0.32 + 0.005 * Math.sin(T * 5); yd.porch.material.opacity = 0.6 * ST.porch; }
      if (cur === 'jpl' && jp) { tickMotes(jp.dust, f, 0.25); jp.pr.g.rotation.y = 0.5 + T * 0.12; jp.pr.g.updateMatrixWorld(true); const v = new THREE.Vector3(); jp.pr.booms.forEach((b, i) => { b.hot.getWorldPosition(v); jp.groups.jpl.worldToLocal(v); jp.hot[i].position.copy(v); jp.hot[i].material.opacity = 0.45 * (0.85 + 0.15 * Math.sin(f * 0.4 + i)); b.hot.material.color.setScalar(1).multiply(new THREE.Color(0xff9a40)).multiplyScalar(1.4 + 0.3 * Math.sin(f * 0.4 + i)); }); }
      if (cur === 'space' && sp) { tickMotes(sp.dust, f, 0.15); sp.jm.rotation.y = T * 0.02; const P = ST.probeP || [0, 0, 0]; sp.pr.g.position.set(...P); sp.pr.g.rotation.set(0.25, ST.probeRY + T * 0.08, 0.1); sp.pr.g.updateMatrixWorld(true); const v = new THREE.Vector3();
        sp.pr.booms.forEach((b, i) => { b.hot.getWorldPosition(v); API.groups.space.worldToLocal(v); sp.hot[i].position.copy(v); sp.hot[i].material.opacity = 0.5 * (0.85 + 0.15 * Math.sin(f * 0.4 + i)); }); sp.sat.visible = !!ST.satVis; sp.ring.rotation.z = T * 0.01; } },
    mood: (name) => { ST.mood = name; if (yd) { yd.sky.material.color.set(name === 'yardGold' ? 0xffa880 : 0xa8c8f8); yd.roofs.material.color.set(name === 'yardGold' ? 0xffc8a8 : 0xffffff); } },
    apply: (v) => { if (v.st) Object.assign(ST, v.st); } });
  ba = buildBath(API.groups.bath); sh = buildShop(API.groups.shop); yd = buildYard(API.groups.yard); jp = buildJPL(API.groups.jpl); jp.groups = API.groups; ct = buildCourt(API.groups.court); sp = buildSpace(API.groups.space);
  API.parts = { ba, sh, yd, jp, ct, sp };
  API.set = (o) => Object.assign(ST, o);
  API.glows = { bath: [...ba.lamps, ba.winG], shop: sh.lamps, yard: [yd.porch], jpl: [...jp.glows, ...jp.hot], court: ct.lamps, space: [...sp.hot] };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  const V = API.V, NZ = ba.NZ;
  const bathJet = { a: [NZ[0] + 0.06, NZ[1], NZ[2]], b: [1.75, 0.5, -1.75], arc: 0.18, r: 0.02, grow: 1 };
  API.bathJet = bathJet;
  API.views = [
    V('bathNight', [0.2, 1.5, 2.2], [-0.2, 0.95, -1.6], 46, 1.2, [-0.3, 0.9, -1.6], { st: { jets: [bathJet], tubFill: 1 } }), // 0 bathroom wide + jet
    V('bathNight', [-0.9, 1.15, -0.6], [-1.4, 0.98, -1.95], 42, 3.0, [-1.4, 0.98, -1.95]), // 1 faucet + nozzle close
    V('bathNight', [-0.2, 0.7, 0.4], [-0.55, 0.35, -1.65], 42, 2.4, [-0.55, 0.35, -1.65]), // 2 heat pump rig
    V('shopLate', [0.3, 1.5, 1.4], [-0.1, 0.95, -1.65], 44, 1.6, [-0.1, 0.95, -1.65], { st: { build: 0.5 } }), // 3 bench mid build
    V('shopLate', [-0.1, 1.25, -0.75], [-0.2, 1.0, -1.65], 40, 3.0, [-0.2, 1.0, -1.65], { st: { build: 1 } }), // 4 prototype done close
    V('shopLate', [2.2, 1.4, 0.4], [2.5, 1.0, -1.8], 44, 2.0, [2.5, 0.9, -1.6], { st: { letters: 1 } }), // 5 desk letters
    V('yardSun', [0.4, 1.4, 4.2], [0, 1.0, -2], 46, 1.0, [0, 0.9, -1], { st: { jets: [{ a: [-1.4, 0.95, -0.6], b: [1.6, 0.4, -1.4], arc: 0.6, grow: 1 }] } }), // 6 yard wide
    V('yardGold', [0.4, 1.4, 4.2], [0, 1.0, -2], 46, 1.0, [0, 0.9, -1], { st: { porch: 1 } }), // 7 yard gold
    V('jplDay', [1.0, 1.7, 3.2], [0, 1.5, -1.6], 46, 1.0, [0, 1.4, -1.6]), // 8 clean room
    V('courtDay', [0.4, 1.5, 2.4], [0, 1.0, -1.6], 46, 1.2, [0, 0.9, -1.4]), // 9 arbitration room
    V('space', [1.5, 0.6, 5.0], [-1.5, 0.5, -10], 46, 0.6, [0, 0, 0], { st: { probeP: [0, 0, 0] } }), // 10 space
    V('spaceGold', [3, 1.2, 9], [-4, 1.5, -20], 46, 0.6, [0, 0, 0], { st: { probeP: [0, 0, 0] } }), // 11 space gold
  ];
  API.tick(0);
  return API;
}
