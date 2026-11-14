// ox_sets.js [OX-sets]: sets for "Oxford University is older than the Aztec Empire" (Oddverra short). All original, generic architecture:
// no university crests, coats of arms, college logos or real signage anywhere.
//   town  : a medieval Oxford-style street: cobbles, jettied timber-frame houses, a honey-limestone teaching hall with lancet windows,
//           a stone town gate, distant towers and hills. Moods 'town1096' (morning), 'town1167' (noon: pennants, market),
//           'townDawn' (payoff sunrise). grow(t) raises new halls + scaffolding (Oxford grows fast).          origin (-100000,0,0)
//   hall  : a candle-lit 12th-century teaching hall at night: flagstones, benches, a lectern on a dais, a candle wheel, tall lancet
//           windows with moonlight. Mood 'hallCandle'.                                                       origin (-100000,0,800)
//   lake  : Lake Texcoco: water, a reedy island, a rock with a prickly-pear cactus and an eagle, volcano skyline. Moods 'lakeEmpty'
//           (misty dawn, nothing built), 'lake1325' (reed huts, a small shrine platform, canoes, chinampa gardens; rise(t) builds them),
//           'lake1428' (a stepped twin-shrine temple, white houses, causeway, three banners).                origin (-100000,0,1600)
//   study : a modern study at night: desk with a parchment TIMELINE (1000..1500), year pins, a model teaching hall (1096) and a model
//           temple (1428), span(t) = gold bracket 1096 -> 1428, a filing cabinet whose 'ANCIENT' drawer opens (drawer(t)) and spits
//           out picture cards (cards(t)), bookshelves, a window. Moods 'studyNight', 'studyDesk', 'studyBlue', 'studyDawn'.
//                                                                                                            origin (-102500,0,0)
//   split : the "same moment" world: desert on the left (x < 0) with the Great Pyramid being built (stepped core, ramp, sledge
//           block), snowy Arctic tundra on the right (x > 0) for the mammoths; a signpost on the seam. Moods 'splitDay' (pyramid
//           unfinished), 'splitDone' (finished, smooth casing).                                               origin (-102500,0,800)
// Each set: local frame, floor y = 0, camera side +z. Test flag ?oxview=N (main.js).
import { H, TAU, clamp01, sm, SERIF, SANS, cyl, sph, plane, planeUV, mesh, nond, lumpGeo, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh, cached } from './doh_kit.js';
import { Kit } from './world.js';

export const OX_ORIGIN = { town: [-100000, 0, 0], hall: [-100000, 0, 800], lake: [-100000, 0, 1600], study: [-102500, 0, 0], split: [-102500, 0, 800] };
const GROUP_OF = { town1096: 'town', town1167: 'town', townDawn: 'town', hallCandle: 'hall', lakeEmpty: 'lake', lake1325: 'lake', lake1428: 'lake', studyNight: 'study', studyDesk: 'study', studyBlue: 'study', studyDawn: 'study', splitDay: 'split', splitDone: 'split' };
export const TLX = (year) => -0.6 + (year - 1000) / 500 * 1.2; // study desk timeline: year -> local x
let THREE, PT, M;

// ---------------------------------------------------------------- painters
const css = (...a) => PT.css(...a);
function ashlarTex(base, seed) { return (g, w, h) => PT.brick(g, w, h, { base, rows: 8, cols: 3, mortar: '#e8dcc0', seed }); }
function plasterTex(g, w, h) { g.fillStyle = '#efe2c4'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.88 + 0.16 * PT.fbm(u, v, 4, 4, 4, 11)); grain(g, w, h, 'rgba(140,110,70,1)', 500, 7, 0.18); }
function flagTex(g, w, h) { PT.brick(g, w, h, { base: '#8a8478', rows: 4, cols: 2, mortar: '#4a4440', seed: 23 }); }
function cobbleTex(g, w, h) { PT.stone(g, w, h, { base: '#9a8c78', n: 9, seed: 31 }); }
function textTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e6c4'; g.fillRect(0, 0, w, h); if (!o.flat) PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 6, 2, 3, 7)); if (o.rim !== false) { g.strokeStyle = o.rim || '#5a3a22'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08); }
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : 0.32 + i * 0.38), w * 0.84, h * (lines.length === 1 ? 0.5 : 0.3), { col: o.col || '#3a2414', font: o.font || SERIF })); }; }
function lancetPath(g, x, y, w, h) { g.beginPath(); g.moveTo(x - w / 2, y + h); g.lineTo(x - w / 2, y + w * 0.7); g.quadraticCurveTo(x - w / 2, y, x, y - w * 0.15); g.quadraticCurveTo(x + w / 2, y, x + w / 2, y + w * 0.7); g.lineTo(x + w / 2, y + h); g.closePath(); }
function glassTex(night) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); if (night) { gr.addColorStop(0, '#1a2a6a'); gr.addColorStop(1, '#3a4a9a'); } else { gr.addColorStop(0, '#3a4a6a'); gr.addColorStop(1, '#8a9ab8'); } g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = night ? 'rgba(10,10,30,0.9)' : 'rgba(30,30,40,0.85)'; g.lineWidth = 3; for (let i = -h; i < w + h; i += 22) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); g.beginPath(); g.moveTo(i + h, 0); g.lineTo(i, h); g.stroke(); }
  if (night) { g.fillStyle = 'rgba(200,215,255,0.25)'; g.fillRect(w * 0.15, 0, w * 0.2, h); } else { g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(w * 0.2, 0); g.lineTo(w * 0.45, 0); g.lineTo(w * 0.1, h); g.lineTo(0, h); g.fill(); } }; }
function skyTex(a, b, c) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, a); gr.addColorStop(0.65, b); gr.addColorStop(1, c); g.fillStyle = gr; g.fillRect(0, 0, w, h); }; }
function skylineTex(g, w, h) { g.clearRect(0, 0, w, h); const R = PT.rng(1167); g.fillStyle = '#6a7898';
  for (let i = 0; i < 14; i++) { const x = R() * w, bw = 20 + R() * 60, bh = h * (0.15 + R() * 0.25); g.fillRect(x, h - bh, bw, bh); if (R() < 0.45) { const tw = 14 + R() * 10, th = h * (0.3 + R() * 0.25); g.fillRect(x + bw / 2 - tw / 2, h - bh - th * 0.6, tw, th * 0.6); g.beginPath(); g.moveTo(x + bw / 2 - tw * 0.7, h - bh - th * 0.6); g.lineTo(x + bw / 2, h - bh - th * 1.25); g.lineTo(x + bw / 2 + tw * 0.7, h - bh - th * 0.6); g.fill(); } }
  g.fillStyle = '#7a88a8'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * 0.72 + Math.sin(x * 0.01) * h * 0.08 + Math.sin(x * 0.03) * h * 0.03); g.lineTo(w, h); g.globalCompositeOperation = 'destination-over'; g.fill(); g.globalCompositeOperation = 'source-over'; }
function hillsTex(cols) { return (g, w, h) => { g.clearRect(0, 0, w, h); cols.forEach(([y0, c, a], k) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * y0 + Math.sin(x * 0.012 + k * 9) * h * a + Math.sin(x * 0.031 + k) * h * a * 0.4); g.lineTo(w, h); g.fill(); }); }; }
function waterTex(g, w, h) { g.fillStyle = '#3a8a9a'; g.fillRect(0, 0, w, h); const R = PT.rng(1325); for (let i = 0; i < 260; i++) { const x = R() * w, y = R() * h, l = 10 + R() * 30; g.strokeStyle = `rgba(${200 + R() * 55 | 0},240,255,${0.15 + R() * 0.25})`; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 3, x + l, y); g.stroke(); } PT.modulate(g, w, h, (u, v) => 0.88 + 0.18 * PT.fbm(u, v, 4, 4, 3, 5)); }
function marshTex(g, w, h) { g.fillStyle = '#6a7a3a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.8 + 0.3 * PT.fbm(u, v, 5, 5, 4, 9)); grain(g, w, h, 'rgba(60,50,20,1)', 900, 3, 0.3); }
function gardenTex(g, w, h) { g.fillStyle = '#5a4a2a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#4a8a3a' : '#6aa040'; g.fillRect(i * w / 8 + 4, 0, w / 8 - 8, h); } for (let i = 0; i < 120; i++) { g.fillStyle = ['#e8c040', '#e86a3a', '#c8302a'][i % 3]; g.beginPath(); g.arc((i * 37) % w, (i * 53) % h, 3, 0, TAU); g.fill(); } }
function stuccoTex(g, w, h) { g.fillStyle = '#f2ead8'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, 13)); }
function sandTex(g, w, h) { g.fillStyle = '#e8c088'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.18 * PT.fbm(u, v, 3, 6, 4, 17)); grain(g, w, h, 'rgba(150,100,50,1)', 800, 5, 0.25); }
function snowTex(g, w, h) { g.fillStyle = '#eef2fa'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 3, 3, 4, 19)); g.fillStyle = 'rgba(150,170,220,0.25)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse((i * 97) % w, (i * 61) % h, 30, 8, 0.2, 0, TAU); g.fill(); } }
function timelineTex(g, w, h) { g.fillStyle = '#f2e4bc'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * PT.fbm(u, v, 8, 2, 3, 3)); const x = (y) => w * 0.03 + (y - 1000) / 500 * w * 0.94;
  g.strokeStyle = '#3a2414'; g.lineWidth = 6; g.beginPath(); g.moveTo(x(1000), h * 0.42); g.lineTo(x(1500), h * 0.42); g.stroke();
  for (let y = 1000; y <= 1500; y += 10) { const big = y % 100 === 0, mid = y % 50 === 0; g.lineWidth = big ? 5 : 2; g.beginPath(); g.moveTo(x(y), h * 0.42 - (big ? 26 : mid ? 16 : 9)); g.lineTo(x(y), h * 0.42 + (big ? 26 : mid ? 16 : 9)); g.stroke(); if (big) txt(g, String(y), x(y), h * 0.78, 120, h * 0.26, { col: '#3a2414' }); }
  g.fillStyle = 'rgba(120,80,40,0.25)'; g.fillRect(0, 0, w, 6); g.fillRect(0, h - 6, w, 6); }
function pictureCard(kind) { return (g, w, h) => { g.fillStyle = '#f4ead2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#5a3a22'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); const cx = w / 2, cy = h * 0.42;
  const sky = { pyr: '#9ac0f0', mam: '#c8d8f0', hall: '#a8c0e8', temple: '#f0c890' }[kind]; g.fillStyle = sky; g.fillRect(18, 18, w - 36, h * 0.62);
  if (kind === 'pyr') { g.fillStyle = '#e8c088'; g.fillRect(18, h * 0.6, w - 36, h * 0.2); g.fillStyle = '#d8a860'; g.beginPath(); g.moveTo(cx - w * 0.34, h * 0.62); g.lineTo(cx, h * 0.2); g.lineTo(cx + w * 0.34, h * 0.62); g.fill(); g.fillStyle = '#b88848'; g.beginPath(); g.moveTo(cx, h * 0.2); g.lineTo(cx + w * 0.34, h * 0.62); g.lineTo(cx + w * 0.08, h * 0.62); g.fill(); }
  if (kind === 'mam') { g.fillStyle = '#f4f6fa'; g.fillRect(18, h * 0.6, w - 36, h * 0.2); g.fillStyle = '#7a4a2a'; g.beginPath(); g.ellipse(cx - 10, cy + 10, w * 0.28, h * 0.14, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(cx + w * 0.22, cy - 6, w * 0.12, h * 0.1, 0, 0, TAU); g.fill(); for (const lx of [-0.2, -0.08, 0.06, 0.16]) g.fillRect(cx + lx * w, cy + 20, 16, h * 0.14); g.strokeStyle = '#f4ecd8'; g.lineWidth = 8; g.beginPath(); g.arc(cx + w * 0.32, cy + 20, 26, Math.PI * 0.6, Math.PI * 1.6, true); g.stroke(); }
  if (kind === 'hall') { g.fillStyle = '#6a8a4a'; g.fillRect(18, h * 0.6, w - 36, h * 0.2); g.fillStyle = '#d8b878'; g.fillRect(cx - w * 0.3, cy - 20, w * 0.6, h * 0.24); g.fillStyle = '#5a4a5a'; g.beginPath(); g.moveTo(cx - w * 0.33, cy - 20); g.lineTo(cx, cy - h * 0.16); g.lineTo(cx + w * 0.33, cy - 20); g.fill(); g.fillStyle = '#d8b878'; g.fillRect(cx + w * 0.16, cy - h * 0.26, 26, h * 0.2); g.fillStyle = '#3a3a5a'; for (const lx of [-0.18, 0, 0.18]) { lancetPath(g, cx + lx * w, cy + 2, 22, 50); g.fill(); } }
  if (kind === 'temple') { g.fillStyle = '#3a8a9a'; g.fillRect(18, h * 0.6, w - 36, h * 0.2); g.fillStyle = '#e8dcc0'; for (let i = 0; i < 4; i++) g.fillRect(cx - w * (0.34 - i * 0.07), h * (0.6 - (i + 1) * 0.08), w * (0.68 - i * 0.14), h * 0.08); g.fillStyle = '#c8302a'; g.fillRect(cx - w * 0.17, h * 0.2, w * 0.12, h * 0.08); g.fillStyle = '#2a5ad8'; g.fillRect(cx + w * 0.05, h * 0.2, w * 0.12, h * 0.08); }
  txt(g, { pyr: 'PYRAMIDS', mam: 'MAMMOTHS', hall: 'OXFORD', temple: 'AZTECS' }[kind], cx, h * 0.88, w * 0.8, h * 0.1, { col: '#3a2414' }); }; }
function booksTex(g, w, h) { g.fillStyle = '#2a1a14'; g.fillRect(0, 0, w, h); const R = PT.rng(77); for (let r = 0; r < 4; r++) { let x = 4; while (x < w - 10) { const bw = 10 + R() * 18, bh = h / 4 * (0.6 + R() * 0.35), c = ['#8a2a2a', '#2a4a7a', '#3a6a3a', '#c8a050', '#5a3a6a', '#d8c8a0'][(R() * 6) | 0]; g.fillStyle = c; g.fillRect(x, (r + 1) * h / 4 - bh - 6, bw - 2, bh); g.fillStyle = 'rgba(255,230,160,0.4)'; g.fillRect(x + 2, (r + 1) * h / 4 - bh * 0.7, bw - 6, 3); x += bw; } g.fillStyle = '#5a3420'; g.fillRect(0, (r + 1) * h / 4 - 6, w, 6); } }
function winTex(o) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.a); gr.addColorStop(1, o.b); g.fillStyle = gr; g.fillRect(0, 0, w, h); if (o.moon) { g.fillStyle = '#fff6d8'; g.beginPath(); g.arc(w * 0.7, h * 0.25, h * 0.08, 0, TAU); g.fill(); g.fillStyle = '#fff'; for (let i = 0; i < 30; i++) g.fillRect((i * 97) % w, (i * 53) % (h * 0.6), 2, 2); }
  g.fillStyle = o.c; for (let i = 0; i < 9; i++) { const x = i * w / 8 - 20, bh = h * (0.12 + 0.12 * ((i * 37) % 7) / 7); g.fillRect(x, h - bh, w / 9, bh); } }; }
function signTex(lines, o) { return textTex(lines, { bg: o.bg || '#e8d8b0', col: o.col || '#3a2414', rim: o.rim || '#4a2a14', font: o.font }); }

// ---------------------------------------------------------------- materials
function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.ashlar = vc({ map: T(512, 512, ashlarTex('#d8b880', 41)) }); m.ashlarD = vc({ map: T(512, 512, ashlarTex('#b89a70', 43)) }); m.plaster = vc({ map: T(256, 256, plasterTex) });
  m.flag = vc({ map: T(512, 512, flagTex) }); m.cobble = vc({ map: T(512, 512, cobbleTex) }); m.plank = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 8, seed: 51 })) }); m.darkwood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#4a2e1e', n: 6, seed: 33 })) });
  m.tiles = vc({ map: T(512, 512, (g, w, h) => PT.shingles(g, w, h, { base: '#8a4a34', n: 12, seed: 5 })) }); m.slate = vc({ map: T(512, 512, (g, w, h) => PT.shingles(g, w, h, { base: '#4a4a5a', n: 14, seed: 6 })) });
  m.thatch = vc({ map: T(256, 256, (g, w, h) => PT.hay(g, w, h, {})) });
  m.glassDay = new THREE.MeshBasicMaterial({ map: T(128, 256, glassTex(false)), fog: true }); m.glassNight = new THREE.MeshBasicMaterial({ map: T(128, 256, glassTex(true)), fog: false }); m.glassNight.color.setScalar(1.3);
  m.glassWarm = new THREE.MeshBasicMaterial({ map: T(128, 256, (g, w, h) => { glassTex(false)(g, w, h); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#ffb860'; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over'; }), fog: true }); m.glassWarm.color.setScalar(1.6);
  m.sky = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }); m.skyline = new THREE.MeshBasicMaterial({ map: T(1024, 256, skylineTex), transparent: true, fog: false, depthWrite: false });
  m.hillsG = new THREE.MeshBasicMaterial({ map: T(1024, 256, hillsTex([[0.45, '#8aa0b8', 0.05], [0.6, '#6a8a6a', 0.08], [0.75, '#4a6a48', 0.1]])), transparent: true, fog: false, depthWrite: false });
  m.hillsL = new THREE.MeshBasicMaterial({ map: T(1024, 256, hillsTex([[0.55, '#7a8ab0', 0.06], [0.7, '#5a7a6a', 0.08]])), transparent: true, fog: false, depthWrite: false });
  m.water = toon({ map: T(512, 512, waterTex), emissive: 0x0a2a34 }); m.water.map.repeat.set(30, 30); m.marsh = vc({ map: T(256, 256, marshTex) }); m.garden = vc({ map: T(256, 256, gardenTex) }); m.stucco = vc({ map: T(256, 256, stuccoTex) });
  m.sand = vc({ map: T(512, 512, sandTex) }); m.snow = vc({ map: T(512, 512, snowTex) }); m.limestone = vc({ map: T(512, 512, ashlarTex('#e0c490', 47)) }); m.casing = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#f0e2c0'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 3, 3, 3, 21)); }), emissive: 0x241c10 });
  m.skyDesert = new THREE.MeshBasicMaterial({ map: T(256, 512, skyTex('#4a7ad0', '#a8c8f0', '#f8e0b8')), fog: false }); m.skyArctic = new THREE.MeshBasicMaterial({ map: T(256, 512, (g, w, h) => { skyTex('#6a7ab8', '#c8d4ec', '#f0f4fa')(g, w, h); g.globalCompositeOperation = 'destination-in'; const gr = g.createLinearGradient(0, 0, w * 0.25, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over'; }), fog: false, transparent: true, depthWrite: false });
  m.dunes = new THREE.MeshBasicMaterial({ map: T(1024, 256, hillsTex([[0.6, '#e0b880', 0.05], [0.75, '#d8a868', 0.06]])), transparent: true, fog: false, depthWrite: false }); m.iceHills = new THREE.MeshBasicMaterial({ map: T(1024, 256, hillsTex([[0.4, '#b8c4e0', 0.12], [0.62, '#d8e0f0', 0.08], [0.78, '#eef2fa', 0.05]])), transparent: true, fog: false, depthWrite: false });
  m.timeline = toon({ map: T(1024, 160, timelineTex), emissive: 0x141008 }); m.timeline.emissiveMap = m.timeline.map;
  m.pics = ['pyr', 'mam', 'hall', 'temple'].map((k) => { const x = toon({ map: T(200, 280, pictureCard(k)), emissive: 0x2a2010, side: THREE.DoubleSide }); x.emissiveMap = x.map; return x; });
  m.books = vc({ map: T(512, 512, booksTex) }); m.wallp = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#4a5a4a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? 'rgba(220,200,140,0.14)' : 'rgba(0,0,0,0.06)'; g.fillRect(i * w / 12, 0, w / 24, h); } PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 5)); }) });
  m.winNight = new THREE.MeshBasicMaterial({ map: T(512, 320, winTex({ a: '#0a1030', b: '#2a3a7a', c: '#141a3a', moon: 1 })), fog: false }); m.winDawn = new THREE.MeshBasicMaterial({ map: T(512, 320, winTex({ a: '#6a7ad8', b: '#ffc890', c: '#5a4a6a' })), fog: false });
  const lab = (lines, o = {}) => em(T(o.w || 512, o.h || 160, signTex(lines, o)), o.e || 0x2a2010);
  m.labOx = lab(['OXFORD', 'c. 1096'], { w: 384, h: 192 }); m.labAz = lab(['AZTEC EMPIRE', '1428'], { w: 384, h: 192 }); m.labAncient = lab(['ANCIENT'], { w: 384, h: 128, bg: '#f2ead6', col: '#8a1a1a' });
  m.pins = ['1096', '1167', '1325', '1428'].map((y, i) => lab([y], { w: 256, h: 112, bg: ['#f2ead6', '#f2ead6', '#f8e0c0', '#f8e0c0'][i], col: i < 2 ? '#2a3a7a' : '#8a1a1a' }));
  m.lessons = lab(['LESSONS'], { w: 384, h: 128 }); m.signEgypt = lab(['← EGYPT'], { w: 384, h: 112, bg: '#f0d8a8' }); m.signArctic = lab(['WRANGEL ISLAND →'], { w: 512, h: 112, bg: '#e0e8f4', col: '#2a3a6a' }); m.signTime = lab(['c. 2560 BC'], { w: 384, h: 112, bg: '#fff0c8', col: '#8a1a1a' });
  m.leaf = vc(); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.cloth = vc(); m.ivory = vc({ emissive: 0x2a2418 });
  m.gold = toon({ color: 0xe8b830, emissive: 0x5a3a08 }); m.flameC = C.flame;
  return m; }

// ---------------------------------------------------------------- shared pieces
const lancetGeo = (w, h) => cached(`lancet${w}|${h}`, () => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w * 0.7); s.quadraticCurveTo(w / 2, h - w * 0.15, 0, h); s.quadraticCurveTo(-w / 2, h - w * 0.15, -w / 2, h - w * 0.7); s.closePath();
  const g = new THREE.ShapeGeometry(s, 10), uv = g.attributes.uv, p = g.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, p.getY(i) / h); return g; });
// triangular gable prism: base w (x), height h (y), depth d (z), base at y = 0, centred
const gableGeo = (w, h, d) => cached(`gable${w}|${h}|${d}`, () => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g; });
// lancet window: glass + dark stone surround, facing local +z after ry
function lancet(K, root, x, y, z, ry, w, h, mat) { const g = mesh(root, lancetGeo(w, h), mat, x, y, z, 0, ry, 0, false); g.castShadow = false; const fr = mesh(root, lancetGeo(w + 0.16, h + 0.1), H.toon({ color: 0x8a7458 }), x - Math.sin(ry) * 0.01, y - 0.05, z - Math.cos(ry) * 0.01, 0, ry, 0, false); fr.castShadow = false; return g; }
// teaching hall: honey stone box, buttresses, lancets, steep slate roof, small tower with a spire. Facade faces +x when s = -1 (built toward +x side of road)
function stoneHall(K, root, x0, z0, len, dep, ht, side, glass, o = {}) { const X1 = x0 + side * dep, xa = Math.min(x0, X1), xb = Math.max(x0, X1);
  K.box(M.ashlar, xa, xb, 0, ht, z0 - len, z0, 0xffffff, 0.03);
  K.put(M.slate, new THREE.BoxGeometry(dep * 0.62, 0.12, len + 0.4), (xa + xb) / 2 - dep * 0.25, ht + dep * 0.22, z0 - len / 2, 0, 0, 0.78, 1, 1, 1, 0xffffff);
  K.put(M.slate, new THREE.BoxGeometry(dep * 0.62, 0.12, len + 0.4), (xa + xb) / 2 + dep * 0.25, ht + dep * 0.22, z0 - len / 2, 0, 0, -0.78, 1, 1, 1, 0xffffff);
  for (const zz of [z0 - 0.15, z0 - len + 0.15]) K.put(M.ashlar, gableGeo(dep, dep * 0.95, 0.3), (xa + xb) / 2, ht, zz, 0, 0, 0, 1, 1, 1, 0xe8d0a0);
  const fx = side < 0 ? xb : xa, n = Math.max(2, Math.floor(len / 2.2));
  for (let i = 0; i <= n; i++) { const zz = z0 - 0.2 - i * (len - 0.4) / n; K.box(M.ashlarD, fx - 0.18, fx + 0.18, 0, ht * 0.85, zz - 0.18, zz + 0.18, 0xffffff, 0.03); K.box(M.ashlarD, fx - 0.12, fx + 0.12, ht * 0.85, ht + 0.25, zz - 0.12, zz + 0.12, 0xffffff, 0.02); }
  const ry = side < 0 ? Math.PI / 2 : -Math.PI / 2; for (let i = 0; i < n; i++) { const zz = z0 - 0.2 - (i + 0.5) * (len - 0.4) / n; if (o.door != null && i === o.door) continue; lancet(K, root, fx - side * 0.02, ht * 0.38, zz, ry, 0.55, ht * 0.46, glass); }
  if (o.door != null) { const zz = z0 - 0.2 - (o.door + 0.5) * (len - 0.4) / n; mesh(root, lancetGeo(1.0, 2.0), H.toon({ color: 0x4a2e1e }), fx - side * 0.03, 0, zz, 0, ry, 0, false); }
  if (o.tower) { const tz = z0 - len + 1.2, tx = (xa + xb) / 2; K.box(M.ashlar, tx - 0.9, tx + 0.9, 0, ht + 3.4, tz - 0.9, tz + 0.9, 0xf0dcb0, 0.03); for (const s of [-1, 1]) for (const s2 of [-1, 1]) K.box(M.ashlarD, tx + s * 0.9 - 0.15, tx + s * 0.9 + 0.15, ht + 3.4, ht + 3.9, tz + s2 * 0.9 - 0.15, tz + s2 * 0.9 + 0.15, 0xffffff, 0.02);
    K.put(M.slate, new THREE.ConeGeometry(0.95, 3.2, 8), tx, ht + 3.4 + 1.6, tz, 0, Math.PI / 8, 0, 1, 1, 1, 0x8a8aa0); lancet(K, root, tx + 0.91 * (side < 0 ? 1 : -1), ht + 1.6, tz, ry, 0.4, 1.2, glass); }
}
// jettied timber-frame house, facade toward +x (s = 1) or -x (s = -1); local x across, z along the road
function ttHouse(K, root, x, z0, len, s, R, o = {}) { const H1 = 2.5, H2 = 4.8, D = 5, X0 = x, X1 = x - s * D, JX = X0 + s * 0.45, WOOD = 0x3a2418;
  K.box(M.plaster, Math.min(X0, X1), Math.max(X0, X1), 0, H1, z0 - len, z0, o.col || 0xffffff, 0.02);
  K.box(M.plaster, Math.min(JX, X1), Math.max(JX, X1), H1, H2, z0 - len, z0, o.col || 0xffffff, 0.02);
  K.box(M.darkwood, Math.min(JX, X1) - 0.02, Math.max(JX, X1) + 0.02, H1 - 0.12, H1 + 0.06, z0 - len - 0.04, z0 + 0.04, WOOD, 0.01);
  for (let i = 0; i <= 4; i++) { const zz = z0 - 0.08 - i * (len - 0.16) / 4; K.box(M.darkwood, X0 - 0.06, X0 + 0.06, 0, H1, zz - 0.07, zz + 0.07, WOOD, 0.01); K.box(M.darkwood, JX - 0.06, JX + 0.06, H1, H2, zz - 0.07, zz + 0.07, WOOD, 0.01); }
  for (let i = 0; i < 4; i++) { const za = z0 - 0.08 - i * (len - 0.16) / 4, zb = za - (len - 0.16) / 4; K.beam(M.darkwood, [JX, H1 + 0.1, i % 2 ? za : zb], [JX, H2 - 0.15, i % 2 ? zb : za], 0.05, WOOD); }
  K.box(M.darkwood, JX - 0.06, JX + 0.06, H2 - 0.14, H2, z0 - len, z0, WOOD, 0.01); K.box(M.darkwood, JX - 0.06, JX + 0.06, (H1 + H2) / 2 - 0.05, (H1 + H2) / 2 + 0.05, z0 - len, z0, WOOD, 0.01);
  // roof: steep, ridge along z
  const rm = o.thatch ? M.thatch : M.tiles, rc = o.thatch ? 0xd8b070 : 0xffffff, mid = (JX + X1) / 2, half = Math.abs(JX - X1) / 2 + 0.3;
  for (const sg of [-1, 1]) K.put(rm, new THREE.BoxGeometry(half * 1.45, 0.14, len + 0.3), mid + sg * half * 0.5, H2 + half * 0.5, z0 - len / 2, 0, 0, -sg * 0.82, 1, 1, 1, rc);
  K.box(M.plaster, Math.min(JX, X1), Math.max(JX, X1), H2, H2 + 0.6, z0 - len + 0.05, z0 - 0.05, o.col || 0xffffff, 0.02);
  // chimney, windows (small leaded panes), door
  K.box(M.ashlarD, mid - 0.25, mid + 0.25, H2, H2 + half * 1.3, z0 - len * 0.3 - 0.25, z0 - len * 0.3 + 0.25, 0xc8a888, 0.02);
  const ry = s > 0 ? Math.PI / 2 : -Math.PI / 2; for (const zz of [z0 - len * 0.25, z0 - len * 0.72]) { const w = mesh(root, plane(0.7, 0.8), o.lit ? M.glassWarm : M.glassDay, JX + s * 0.07, H1 + 1.15, zz, 0, ry, 0, false); w.castShadow = false; K.box(M.darkwood, JX + s * 0.04 - 0.04, JX + s * 0.04 + 0.04, H1 + 0.7, H1 + 0.78, zz - 0.42, zz + 0.42, WOOD, 0.01); }
  if (o.shop) { const w = mesh(root, plane(1.1, 0.9), o.lit ? M.glassWarm : M.glassDay, X0 + s * 0.07, 1.35, z0 - len * 0.7, 0, ry, 0, false); w.castShadow = false; K.box(M.plank, X0 + s * 0.05, X0 + s * 0.6, 0.85, 0.92, z0 - len * 0.7 - 0.6, z0 - len * 0.7 + 0.6, 0x8a5a38, 0.02); }
  K.box(M.darkwood, X0 - 0.05, X0 + s * 0.08, 0, 1.9, z0 - len * 0.32 - 0.45, z0 - len * 0.32 + 0.45, 0x5a3a24, 0.02);
}
function tree(K, x, z, s, R, col = [0x3a6a3a, 0x4a7a3a]) { K.beam(M.bark, [x, 0, z], [x + 0.1 * s, 2.0 * s, z], 0.14 * s, 0x5a4030, true, 6); for (let i = 0; i < 5; i++) K.put(M.leaf, lumpGeo(i + 7, 1, 0.25), x + (R() - 0.5) * 1.2 * s, (2.1 + R() * 1.0) * s, z + (R() - 0.5) * 1.0 * s, 0, R() * 6, 0, 0.9 * s, 0.75 * s, 0.9 * s, col[i % 2]); }
function candle(K, root, x, y, z, s = 1, flames) { K.put(M.paint, cyl(0.025 * s, 0.028 * s, 0.16 * s, 10), x, y + 0.08 * s, z, 0, 0, 0, 1, 1, 1, 0xf2ead0); K.put(M.brass, cyl(0.05 * s, 0.06 * s, 0.02 * s, 12), x, y + 0.01, z, 0, 0, 0, 1, 1, 1, 0xc8a050);
  const fl = nond(mesh(root, plane(0.05 * s, 0.1 * s), M.flame, x, y + 0.2 * s, z, 0, 0, 0, false)); fl.renderOrder = 6; flames.push(fl); }
function reeds(K, x, z, n, R, s = 1) { for (let i = 0; i < n; i++) { const a = R() * TAU, r = R() * 0.5 * s, h = (0.8 + R() * 0.9) * s; K.put(M.leaf, new THREE.ConeGeometry(0.025, h, 4), x + Math.cos(a) * r, h / 2, z + Math.sin(a) * r, (R() - 0.5) * 0.3, 0, (R() - 0.5) * 0.3, 1, 1, 1, [0x5a7a3a, 0x7a8a4a, 0x4a6a32][i % 3]); } }
function hut(K, x, y, z, s, R) { K.put(M.thatch, cyl(0.7 * s, 0.75 * s, 1.0 * s, 12), x, y + 0.5 * s, z, 0, 0, 0, 1, 1, 1, 0xc8a870); K.put(M.thatch, new THREE.ConeGeometry(1.0 * s, 1.0 * s, 12), x, y + 1.5 * s, z, 0, R() * 3, 0, 1, 1, 1, 0xb89860); K.box(M.darkwood, x - 0.2 * s, x + 0.2 * s, y, y + 0.7 * s, z + 0.68 * s, z + 0.76 * s, 0x2a1a10, 0.01); }
function canoe(K, x, z, ry, s = 1) { K.at(x, 0, z, ry, () => { K.put(M.plank, new THREE.CylinderGeometry(0.28, 0.28, 3.0, 10, 1, false, 0, Math.PI), 0, 0.12, 0, 0, 0, Math.PI / 2, 1, 1, 0.55, 0x7a4a2a); K.box(M.plank, -1.2, 1.2, 0.08, 0.12, -0.12, 0.12, 0x5a3420, 0.01); }, s); }
// stepped temple: n tiers, base w, total height ht, stair on +z, twin shrines
function temple(K, x, y, z, w, ht, n, scale = 1, shrines = true) { K.at(x, y, z, 0, () => { const th = ht / n;
  for (let i = 0; i < n; i++) { const ww = w * (1 - i * 0.16); K.box(M.stucco, -ww / 2, ww / 2, i * th, (i + 1) * th, -ww / 2, ww / 2, 0xf2ead8, 0.03); K.box(M.paint, -ww / 2 - 0.01, ww / 2 + 0.01, (i + 1) * th - 0.12, (i + 1) * th - 0.04, -ww / 2 - 0.01, ww / 2 + 0.01, 0xc8302a, 0.01); }
  const top = w * (1 - (n - 1) * 0.16); K.put(M.stucco, new THREE.BoxGeometry(w * 0.34, w * 0.01, w * 0.9), 0, ht / 2, w * 0.36, Math.atan2(ht, w * 0.5), 0, 0, 1, 1, 1, 0xe8dcc0);
  for (const sx of [-1, 1]) K.put(M.stucco, new THREE.BoxGeometry(w * 0.0125, w * 0.022, w * 0.92), sx * w * 0.18, ht / 2 + 0.06, w * 0.36, Math.atan2(ht, w * 0.5), 0, 0, 1, 1, 1, 0xd8ccb0);
  if (shrines) for (const sx of [-1, 1]) { const cx = sx * top * 0.24, c = sx < 0 ? 0xc8302a : 0x2a5ad8; K.box(M.stucco, cx - top * 0.17, cx + top * 0.17, ht, ht + top * 0.32, -top * 0.17, top * 0.17, 0xf2ead8, 0.02); K.box(M.paint, cx - top * 0.19, cx + top * 0.19, ht + top * 0.32, ht + top * 0.44, -top * 0.19, top * 0.19, c, 0.02); K.box(M.darkwood, cx - top * 0.06, cx + top * 0.06, ht, ht + top * 0.2, top * 0.17, top * 0.18, 0x1a1010, 0.005); } }, scale); }

// ================================================================= TOWN (medieval Oxford street)
function buildTown(root) { const R = PT.rng(1096), K = new Kit();
  mesh(root, planeUV(5.4, 80, 2, 30), M.cobble, 0, 0.005, -30, -Math.PI / 2, 0, 0, false);
  mesh(root, planeUV(80, 160, 10, 20), H.toon({ color: 0x7a7a52 }), 0, -0.01, -50, -Math.PI / 2, 0, 0, false);
  for (const s of [-1, 1]) K.box(M.ashlarD, s * 2.7 - 0.15, s * 2.7 + 0.15, 0, 0.1, -60, 12, 0xb8a888, 0.01);
  // left: timber houses; right: the teaching hall (z 3..-9) then houses
  const COL = [0xffffff, 0xf0d8b0, 0xe8e0d0, 0xf2c8a8, 0xffffff, 0xe0d0b0, 0xf8e8c8];
  let z = 7; for (let i = 0; i < 5; i++) { const L = 4.2 + R() * 1.6; ttHouse(K, root, -2.8, z, L, 1, R, { col: COL[i % 7], shop: i % 3 === 1, thatch: i % 4 === 3 }); z -= L + 0.05; }
  stoneHall(K, root, 2.8, 3, 12, 6, 4.4, 1, M.glassDay, { door: 2, tower: true });
  z = -9.3; for (let i = 0; i < 4; i++) { const L = 4.0 + R() * 1.8; ttHouse(K, root, 2.8, z, L, -1, R, { col: COL[(i + 3) % 7], shop: i % 2 === 0, thatch: i % 3 === 2 }); z -= L + 0.05; }
  // hanging LESSONS sign on the hall (an open book painted on a board)
  K.beam(M.darkwood, [2.8, 3.1, -1.8], [1.9, 3.1, -1.8], 0.04, 0x2a1a10); mesh(root, plane(0.95, 0.32), M.lessons, 2.15, 2.78, -1.8, 0, -Math.PI / 2, 0, false).castShadow = true;
  // stone town gate across the street (z -46)
  K.at(0, 0, -46, 0, () => { for (const s of [-1, 1]) K.box(M.ashlar, s * 1.6, s * 4.2, 0, 6.4, -1.2, 1.2, 0xe8d0a0, 0.04); K.box(M.ashlar, -1.6, 1.6, 4.0, 6.4, -1.2, 1.2, 0xe8d0a0, 0.04);
    for (let i = 0; i < 7; i++) K.box(M.ashlar, -4.2 + i * 1.4, -3.7 + i * 1.4, 6.4, 7.0, -1.2, 1.2, 0xe8d0a0, 0.02); });
  mesh(root, lancetGeo(3.2, 4.4), H.toon({ color: 0x2a1e1a }), 0, 0, -44.79, 0, 0, 0, false);
  // well, barrels, sacks, cart, trees
  K.at(1.5, 0, -3.2, 0, () => { K.put(M.ashlarD, cyl(0.55, 0.6, 0.7, 16), 0, 0.35, 0, 0, 0, 0, 1, 1, 1, 0xc8b090); for (const s of [-1, 1]) K.box(M.darkwood, s * 0.5 - 0.05, s * 0.5 + 0.05, 0.6, 1.7, -0.05, 0.05, 0x4a2e1e, 0.01); K.put(M.tiles, new THREE.ConeGeometry(0.8, 0.5, 4), 0, 1.95, 0, 0, Math.PI / 4, 0, 1, 1, 1, 0xffffff); K.beam(M.darkwood, [-0.5, 1.5, 0], [0.5, 1.5, 0], 0.04, 0x3a2418, true, 6); K.put(M.plank, cyl(0.12, 0.1, 0.2, 10), 0.1, 1.1, 0, 0, 0, 0, 1, 1, 1, 0x7a5030); });
  for (const [x, zz] of [[-2.3, 1.2], [-2.3, 0.6], [2.3, -10.4], [-2.2, -6.8]]) K.put(M.plank, cyl(0.24, 0.2, 0.55, 14), x, 0.275, zz, 0, 0, 0, 1, 1, 1, 0x8a5a38);
  for (const [x, zz] of [[-2.0, 1.6], [2.1, -11.0]]) K.put(M.cloth, lumpGeo(Math.round(zz * 7), 1, 0.2), x, 0.25, zz, 0, 0, 0, 0.3, 0.3, 0.25, 0xd8c8a0);
  K.at(-1.4, 0, -12, 0.25, () => { K.box(M.plank, -0.7, 0.7, 0.55, 0.62, -0.45, 0.45, 0x8a6040, 0.02); for (const s of [-1, 1]) K.put(M.plank, new THREE.TorusGeometry(0.38, 0.05, 6, 16), 0, 0.42, s * 0.5, 0, 0, 0, 1, 1, 1, 0x5a3a24); K.beam(M.plank, [0.7, 0.6, -0.25], [1.9, 0.3, -0.25], 0.04, 0x7a5030); K.beam(M.plank, [0.7, 0.6, 0.25], [1.9, 0.3, 0.25], 0.04, 0x7a5030); for (let i = 0; i < 4; i++) K.put(M.leaf, sph(0.12, 10, 8), -0.4 + i * 0.25, 0.72, (i % 2) * 0.2 - 0.1, 0, 0, 0, 1, 1, 1, [0x6aa040, 0xe86a3a][i % 2]); });
  tree(K, 3.6, -41, 1.4, R); tree(K, -3.6, -42, 1.6, R); tree(K, 4.0, 9, 1.3, R);
  K.build(root, 30);
  // pennants on poles (1167: market day) + market stall
  const flags = new THREE.Group(); root.add(flags); { const KF = new Kit(); const pc = [0xc8302a, 0x2a4a9a, 0xe8b830, 0x2f6a3a];
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { const zz = 1 - i * 5 - (s > 0 ? 2.5 : 0), x = s * 2.4; KF.beam(M.plank, [x, 0, zz], [x, 4.2, zz], 0.05, 0x6a4a2a, true, 6); KF.put(M.cloth, new THREE.ConeGeometry(0.35, 1.3, 3), x - s * 0.02, 3.6, zz + 0.4, Math.PI / 2, 0, 0, 1, 0.08, 1, pc[(i + (s > 0 ? 1 : 0)) % 4]); }
    KF.at(-1.6, 0, -7.5, 0.1, () => { for (const a of [-0.8, 0.8]) for (const b of [-0.4, 0.4]) KF.beam(M.plank, [a, 0, b], [a, 2.0, b], 0.04, 0x6a4a2a, true, 6); KF.box(M.plank, -0.9, 0.9, 0.8, 0.88, -0.5, 0.5, 0x8a6040, 0.02); KF.put(M.cloth, new THREE.BoxGeometry(2.0, 0.06, 1.3), 0, 2.05, 0, 0.12, 0, 0, 1, 1, 1, 0xd8483a);
      for (let i = 0; i < 6; i++) KF.put(M.leaf, sph(0.1, 10, 8), -0.6 + i * 0.24, 0.98, 0.1 * (i % 2), 0, 0, 0, 1, 1, 1, [0xe8c040, 0xc8302a, 0x6aa040][i % 3]); }); KF.build(flags); }
  // growth: new stone halls + scaffolding that rise (grow(t))
  const grow = []; for (const [x0, z0, len, side] of [[-2.9, -20.5, 9, -1], [2.9, -31.5, 8, 1], [-2.9, -30.5, 8, -1]]) { const g = new THREE.Group(); root.add(g); const KG = new Kit(); stoneHall(KG, g, x0, z0, len, 6, 5.2, side, M.glassDay, { tower: x0 > 0 }); KG.build(g); g.userData.base = 0; grow.push(g); }
  const scaff = new THREE.Group(); root.add(scaff); { const KS = new Kit(); for (let i = 0; i < 5; i++) for (const s of [0, 1]) KS.beam(M.plank, [-2.7 + s * 0.8, 0, -20.8 - i * 2.1], [-2.7 + s * 0.8, 6.6, -20.8 - i * 2.1], 0.05, 0x9a7a50, true, 5); for (let j = 1; j < 4; j++) KS.box(M.plank, -2.8, -1.8, j * 1.7, j * 1.7 + 0.06, -29.4, -20.6, 0x9a7a50, 0.01); KS.build(scaff); }
  const skyline = nond(mesh(root, plane(240, 50), M.skyline, 0, 14, -100, 0, 0, 0, false)); skyline.renderOrder = -1; skyline.castShadow = false;
  const hills = nond(mesh(root, plane(300, 70), M.hillsG, 0, 12, -120, 0, 0, 0, false)); hills.renderOrder = -2; hills.castShadow = false;
  const sky = nond(mesh(root, plane(500, 200), M.sky, 0, 50, -150, 0, 0, 0, false)); sky.castShadow = false;
  const dust = motes(root, 60, [-2.5, 2.5, 0.3, 4, -12, 6], 51, 0.013);
  return { flags, grow, scaff, sky, dust };
}

// ================================================================= HALL (candle-lit teaching hall at night)
function buildHall(root) { const R = PT.rng(1167), K = new Kit(), X = 4.2, ZB = -9, HT = 6.2, flames = [];
  mesh(root, planeUV(9, 14, 4, 6), M.flag, 0, 0, -2.5, -Math.PI / 2, 0, 0, false);
  K.box(M.ashlar, -X, X, 0, HT, ZB - 0.4, ZB, 0xd8c8a0, 0.02); for (const s of [-1, 1]) K.box(M.ashlar, s > 0 ? X : -X - 0.4, s > 0 ? X + 0.4 : -X, 0, HT, ZB, 4, 0xd8c8a0, 0.02);
  // timber roof: tie beams + rafters, dark boards above
  for (let i = 0; i < 6; i++) { const zz = ZB + 0.8 + i * 2.2; K.box(M.darkwood, -X, X, HT - 0.3, HT, zz - 0.15, zz + 0.15, 0x5a3a24, 0.02); for (const s of [-1, 1]) K.beam(M.darkwood, [s * X, HT, zz], [0, HT + 2.6, zz], 0.13, 0x4a2e1e); K.beam(M.darkwood, [0, HT, zz], [0, HT + 2.6, zz], 0.1, 0x4a2e1e); }
  for (const s of [-1, 1]) K.put(M.darkwood, new THREE.BoxGeometry(5.4, 0.08, 14), s * 2.1, HT + 1.35, -2.5, 0, 0, -s * 0.555, 1, 1, 1, 0x2a1a14);
  // windows: three tall lancets at the back, four per side; moonlight shafts
  const wins = []; for (const x of [-1.5, 0, 1.5]) wins.push(lancet(K, root, x, 1.6, ZB + 0.02, 0, 0.9, 3.6, M.glassNight));
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) wins.push(lancet(K, root, s * (X - 0.02), 2.0, ZB + 1.8 + i * 2.8, -s * Math.PI / 2, 0.7, 2.8, M.glassNight));
  const shafts = [shaftAt(root, [-2.2, 2.4, -3.4], 2.2, 5.5, Math.PI / 2, 0.55, 0.1, 0x8aa0ff), shaftAt(root, [2.2, 2.4, -0.6], 2.2, 5.5, -Math.PI / 2, -0.55, 0.08, 0x8aa0ff)];
  // dais + lectern at the back, master's chair
  K.box(M.darkwood, -2.6, 2.6, 0, 0.35, ZB, ZB + 2.6, 0x6a4028, 0.03);
  K.at(0, 0.35, ZB + 1.4, 0, () => { K.box(M.darkwood, -0.22, 0.22, 0, 0.82, -0.2, 0.2, 0x5a3420, 0.03); K.put(M.darkwood, new THREE.BoxGeometry(0.62, 0.05, 0.46), 0, 0.9, 0.05, 0.45, 0, 0, 1, 1, 1, 0x6a4028); K.box(M.paint, -0.24, 0.24, 0.92, 0.95, -0.1, 0.2, 0xf2e6c4, 0.01); });
  K.at(-1.5, 0.35, ZB + 0.8, 0.3, () => { K.box(M.darkwood, -0.4, 0.4, 0.45, 0.52, -0.35, 0.35, 0x4a2e1e, 0.02); K.box(M.darkwood, -0.4, 0.4, 0.52, 1.7, -0.38, -0.3, 0x4a2e1e, 0.02); for (const a of [-1, 1]) for (const b of [-1, 1]) K.box(M.darkwood, a * 0.35 - 0.04, a * 0.35 + 0.04, 0, 0.45, b * 0.3 - 0.04, b * 0.3 + 0.04, 0x3a2418, 0.01); });
  // benches + desks in two blocks; books, scrolls, candles
  for (let r = 0; r < 4; r++) for (const s of [-1, 1]) { const zz = -4.6 + r * 1.6, x0 = s * 0.6, x1 = s * 3.6; K.box(M.plank, Math.min(x0, x1), Math.max(x0, x1), 0.42, 0.48, zz - 0.18, zz + 0.18, 0x7a5030, 0.02); K.box(M.plank, Math.min(x0, x1), Math.max(x0, x1), 0.74, 0.8, zz - 0.85, zz - 0.45, 0x6a4028, 0.02);
    for (const xx of [x0 + s * 0.2, x1 - s * 0.2]) { K.box(M.plank, xx - 0.05, xx + 0.05, 0, 0.42, zz - 0.15, zz + 0.15, 0x5a3420, 0.01); K.box(M.plank, xx - 0.05, xx + 0.05, 0, 0.74, zz - 0.8, zz - 0.5, 0x5a3420, 0.01); }
    for (let i = 0; i < 3; i++) { const bx = x0 + s * (0.6 + i * 1.0); if (R() < 0.7) K.box(M.paint, bx - 0.14, bx + 0.14, 0.8, 0.86, zz - 0.78, zz - 0.56, [0x6a2a24, 0x2a3a6a, 0x3a5a2a][i], 0.01); else K.put(M.paint, cyl(0.03, 0.03, 0.3, 8), bx, 0.83, zz - 0.66, 0, 0, Math.PI / 2, 1, 1, 1, 0xefe2c0); }
    candle(K, root, x0 + s * 1.5, 0.8, zz - 0.62, 1, flames); }
  // candle wheel chandelier
  const wheel = new THREE.Group(); wheel.position.set(0, 3.9, -3.2); root.add(wheel); { const KW = new Kit(); KW.put(M.metal, new THREE.TorusGeometry(0.9, 0.035, 6, 32), 0, 0, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2a30); for (let i = 0; i < 4; i++) KW.beam(M.metal, [0, 2.6, 0], [Math.cos(i * TAU / 4) * 0.9, 0, Math.sin(i * TAU / 4) * 0.9], 0.012, 0x2a2a30);
    const wf = []; for (let i = 0; i < 10; i++) candle(KW, wheel, Math.cos(i * TAU / 10) * 0.9, 0.02, Math.sin(i * TAU / 10) * 0.9, 1.1, wf); KW.build(wheel); flames.push(...wf); }
  const glows = [glowAt(wheel, [0, 0.2, 0], 3.2, '#ffb860', 0.35)]; for (const fl of flames.slice(0, 8)) glows.push(glowAt(root, [fl.position.x + (fl.parent === wheel ? 0 : 0), fl.position.y, fl.position.z], 0.7, '#ffc070', 0.5));
  // wall torches near the dais
  for (const s of [-1, 1]) { K.box(M.metal, s * (X - 0.12) - 0.04, s * (X - 0.12) + 0.04, 2.2, 2.5, ZB + 1.5 - 0.04, ZB + 1.5 + 0.04, 0x2a2a30, 0.01); const fl = nond(mesh(root, plane(0.22, 0.4), M.flame, s * (X - 0.25), 2.75, ZB + 1.5, 0, 0, 0, false)); fl.renderOrder = 6; flames.push(fl); glows.push(glowAt(root, [s * (X - 0.3), 2.75, ZB + 1.6], 2.0, '#ff9a40', 0.45)); }
  K.build(root, 0);
  const dust = motes(root, 70, [-3.5, 3.5, 0.5, 5, -8, 2], 61, 0.011);
  return { flames, glows, wheel, dust, shafts, wins, ZB };
}

// ================================================================= LAKE (Texcoco)
function buildLake(root) { const R = PT.rng(1325), K = new Kit();
  const water = mesh(root, plane(400, 400), M.water, 0, 0, -60, -Math.PI / 2, 0, 0, false); water.castShadow = false;
  // island (small in 1325, a big platform island in 1428)
  K.put(M.marsh, lumpGeo(11, 2, 0.12), 0, -0.25, -6, 0, 0, 0, 6.5, 0.5, 4.5, 0xffffff); K.put(M.marsh, lumpGeo(12, 2, 0.12), -4, -0.3, -9, 0, 0.6, 0, 3.5, 0.45, 3.0, 0xe8f0d0);
  for (const [x, z, n] of [[-4.5, -3.5, 14], [4.8, -4.5, 12], [-1.5, -1.9, 8], [2.4, -2.3, 9], [-6.2, -7.5, 12], [5.6, -8.5, 10], [0.6, -10, 8]]) reeds(K, x, z, n, R, 1.1);
  // rock + prickly pear + eagle (founding sign); everything generic and stylised
  K.at(-0.7, 0.15, -4.0, 0.3, () => { K.put(M.ashlarD, lumpGeo(3, 1, 0.3), 0, 0.2, 0, 0, 0, 0, 0.7, 0.45, 0.6, 0x9a8a7a);
    const pad = (x, y, z, rz, s = 1) => K.put(M.leaf, sph(0.22, 12, 8), x, y, z, 0, 0, rz, 1.0 * s, 1.35 * s, 0.32 * s, 0x4a8a3a);
    pad(0, 0.75, 0, 0); pad(-0.25, 1.15, 0.02, 0.5); pad(0.27, 1.12, -0.02, -0.45); pad(-0.38, 1.55, 0.03, 0.2, 0.8); pad(0.05, 1.5, 0.0, -0.1, 0.85); pad(0.4, 1.5, 0.02, -0.6, 0.75);
    for (const [x, y] of [[-0.38, 1.85], [0.05, 1.82], [0.42, 1.78], [-0.25, 1.4]]) K.put(M.paint, sph(0.05, 8, 6), x, y, 0.05, 0, 0, 0, 1, 1, 1, 0xc8306a); });
  const eagle = new THREE.Group(); eagle.position.set(-0.68, 2.2, -4.0); root.add(eagle); { const KE = new Kit(); KE.put(M.paint, sph(0.16, 14, 10), 0, 0.12, 0, 0.2, 0, 0, 1, 1.35, 0.9, 0x6a4024); KE.put(M.paint, sph(0.09, 12, 8), 0.02, 0.36, 0.06, 0, 0, 0, 1, 1, 1, 0x8a5a2a); KE.put(M.paint, new THREE.ConeGeometry(0.035, 0.1, 8), 0.03, 0.34, 0.15, Math.PI / 2, 0, 0, 1, 1, 1, 0xe8b830);
    for (const s of [-1, 1]) { KE.put(M.paint, sph(0.2, 14, 8), s * 0.3, 0.32, -0.02, 0, 0, s * 0.6, 1.5, 0.18, 0.75, 0x5a3420); KE.put(M.paint, sph(0.12, 10, 6), s * 0.5, 0.5, -0.02, 0, 0, s * 0.9, 1.5, 0.16, 0.6, 0x3a2414); } KE.put(M.paint, new THREE.BoxGeometry(0.14, 0.03, 0.16), 0, -0.08, -0.12, 0.6, 0, 0, 1, 1, 1, 0x4a2e1e);
    for (const s of [-1, 1]) KE.put(M.paint, sph(0.012, 6, 4), 0.02 + s * 0.05, 0.38, 0.13, 0, 0, 0, 1, 1, 1, 0x14101a); KE.build(eagle); }
  // volcano skyline + hills
  K.build(root, 40);
  for (const [x, z, r, h] of [[-60, -170, 34, 30], [-20, -190, 30, 24], [70, -180, 40, 34]]) { const v = mesh(root, new THREE.ConeGeometry(r, h, 24, 1, true), H.toon({ color: 0x6a7aa0, fog: true }), x, h / 2 - 2, z, 0, 0, 0, false); v.castShadow = false; const c = mesh(root, new THREE.ConeGeometry(r * 0.28, h * 0.28, 24), H.toon({ color: 0xf0f4fa, emissive: 0x30344a }), x, h - 2 - h * 0.14 + 0.2, z, 0, 0, 0, false); c.castShadow = false; }
  const hills = nond(mesh(root, plane(400, 60), M.hillsL, 0, 8, -150, 0, 0, 0, false)); hills.renderOrder = -2; hills.castShadow = false;
  const sky = nond(mesh(root, plane(600, 240), M.sky, 0, 60, -220, 0, 0, 0, false)); sky.castShadow = false;
  // mist cards (dawn)
  const mist = []; for (let i = 0; i < 5; i++) { const mm = M.glow.clone(); mm.color.set('#e8eef8'); mm.opacity = 0.25; const ms = nond(mesh(root, plane(30, 3), mm, (i - 2) * 9, 0.8 + i * 0.2, -12 - i * 8, 0, 0, 0, false)); ms.renderOrder = 4; ms.userData.op = 0.25; mist.push(ms); }
  // 1325: reed huts, small shrine platform, chinampas, canoes
  const g25 = new THREE.Group(); root.add(g25); const p25 = []; { for (const [x, z, s] of [[2.2, -7.2, 0.9], [3.6, -9.4, 0.8], [-3.2, -8.0, 0.85], [-1.9, -10.2, 0.75], [4.4, -6.2, 0.7]]) { const g = new THREE.Group(); g.position.set(x, 0.18, z); g25.add(g); const KH = new Kit(); hut(KH, 0, 0, 0, s, R); KH.build(g); p25.push(g); }
    const sh = new THREE.Group(); sh.position.set(0.7, 0.18, -8.6); g25.add(sh); { const KS = new Kit(); temple(KS, 0, 0, 0, 2.2, 1.0, 2, 1, false); hut(KS, 0, 1.0, 0, 0.55, R); KS.build(sh); } p25.push(sh);
    const KC = new Kit(); for (let i = 0; i < 4; i++) KC.box(M.garden, 6.5 + (i % 2) * 2.6, 8.8 + (i % 2) * 2.6, -0.05, 0.12, -5 - Math.floor(i / 2) * 3.4, -2.6 - Math.floor(i / 2) * 3.4, 0xffffff, 0.04); KC.build(g25); }
  const canoes = []; for (const [x, z, ry] of [[1.5, -0.8, 0.3], [-3.0, 0.6, -0.4], [5.5, -1.6, 0.9]]) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); const KC = new Kit(); canoe(KC, 0, 0, 0); KC.build(g); canoes.push(g); }
  // 1428: big temple, white houses, causeway, banners
  const g28 = new THREE.Group(); root.add(g28); { const KT = new Kit(); KT.put(M.stucco, new THREE.BoxGeometry(34, 0.4, 22), 0, 0.0, -18, 0, 0, 0, 1, 1, 1, 0xe8dcc0); temple(KT, 0, 0.2, -18, 8, 5.2, 4);
    for (let i = 0; i < 26; i++) { const x = (R() - 0.5) * 30, z = -9 - R() * 18; if (Math.abs(x) < 5.5 && z < -13) continue; const w = 1.2 + R() * 1.4, h = 1.0 + R() * 1.2; KT.box(M.stucco, x - w / 2, x + w / 2, 0.2, 0.2 + h, z - w / 2, z + w / 2, 0xf6eee0, 0.03); KT.box(M.paint, x - w / 2 - 0.02, x + w / 2 + 0.02, 0.2 + h - 0.12, 0.2 + h, z - w / 2 - 0.02, z + w / 2 + 0.02, [0xc8302a, 0x2a7a8a, 0xe8a030][i % 3], 0.01); }
    KT.box(M.stucco, 14, 120, -0.1, 0.3, -12, -10.6, 0xe0d4b8, 0.02); for (let i = 0; i < 6; i++) for (const s of [-1, 1]) KT.beam(M.plank, [-14 + i * 5.6, 0.2, -8.5 + s * 0.0], [-14 + i * 5.6, 4.2, -8.5], 0.05, 0x6a4a2a, true, 6);
    for (let i = 0; i < 6; i++) KT.put(M.cloth, new THREE.BoxGeometry(0.8, 1.0, 0.03), -13.6 + i * 5.6, 3.6, -8.5, 0, 0, 0, 1, 1, 1, [0xc8302a, 0x2a5ad8, 0xe8a030][i % 3]); KT.build(g28); }
  const dust = motes(root, 40, [-4, 4, 0.3, 3, -9, 1], 71, 0.012);
  return { water, eagle, mist, g25, p25, canoes, g28, sky, dust };
}

// ================================================================= STUDY (modern, the timeline desk)
function buildStudy(root) { const R = PT.rng(2026), K = new Kit(), X = 3.2, ZB = -3.4, HT = 2.9, DY = 0.76, DZ = -0.95;
  mesh(root, planeUV(7, 7, 3, 3), M.plank, 0, 0, -0.5, -Math.PI / 2, 0, 0, false);
  K.box(M.wallp, -X, X, 0, HT, ZB - 0.15, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(M.wallp, s > 0 ? X : -X - 0.15, s > 0 ? X + 0.15 : -X, 0, HT, ZB, 3, 0xffffff, 0.01);
  K.box(M.darkwood, -X, X, 0, 0.9, ZB, ZB + 0.03, 0x5a3420, 0.01); mesh(root, plane(2 * X, 7), H.toon({ color: 0x2a2018, side: THREE.DoubleSide }), 0, HT, -0.5, Math.PI / 2, 0, 0, false);
  // bookshelves on the back wall
  for (const x0 of [-2.9, 0.9]) { K.box(M.darkwood, x0, x0 + 2.0, 0, 2.5, ZB, ZB + 0.38, 0x4a2a18, 0.02); K.box(M.books, x0 + 0.08, x0 + 1.92, 0.1, 2.4, ZB + 0.1, ZB + 0.4, 0xffffff, 0.005); }
  // window on the left wall
  const win = mesh(root, plane(1.4, 1.3), M.winNight, -X + 0.02, 1.6, -0.6, 0, Math.PI / 2, 0, false); win.castShadow = false; K.box(M.plank, -X, -X + 0.1, 0.92, 0.98, -1.4, 0.2, 0xe8e0d0, 0.01); for (const zz of [-1.32, -0.6, 0.12]) K.box(M.plank, -X, -X + 0.08, 0.95, 2.28, zz - 0.04, zz + 0.04, 0xe8e0d0, 0.005); K.box(M.plank, -X, -X + 0.08, 2.25, 2.31, -1.4, 0.2, 0xe8e0d0, 0.005);
  // desk
  K.box(M.plank, -1.75, 1.75, DY - 0.06, DY, -1.5, -0.35, 0x6a3a22, 0.03); for (const s of [-1, 1]) K.box(M.plank, s * 1.3 - 0.4, s * 1.3 + 0.4, 0, DY - 0.06, -1.45, -0.42, 0x5a3020, 0.02);
  mesh(root, plane(1.3, 0.16), M.timeline, 0, DY + 0.003, -0.6, -Math.PI / 2, 0, 0, false).castShadow = false;
  // models: teaching hall (1096, left) and twin temple (1428, right) on little plinths, with tags
  const mHall = new THREE.Group(); mHall.position.set(TLX(1096), DY, DZ); mHall.scale.setScalar(1.25); root.add(mHall); { const KM = new Kit(); KM.box(M.darkwood, -0.2, 0.2, 0, 0.04, -0.16, 0.16, 0x3a2418, 0.01); KM.at(0, 0.04, 0, 0, () => { KM.box(M.ashlar, -0.15, 0.15, 0, 0.14, -0.08, 0.06, 0xf0d8a8, 0.005); for (const s of [-1, 1]) KM.put(M.slate, new THREE.BoxGeometry(0.12, 0.012, 0.16), s * 0.055, 0.17, -0.01, 0, 0, -s * 0.8, 1, 1, 1, 0xffffff); KM.box(M.ashlar, 0.06, 0.12, 0, 0.28, -0.07, -0.01, 0xf0d8a8, 0.004); KM.put(M.slate, new THREE.ConeGeometry(0.045, 0.1, 8), 0.09, 0.33, -0.04, 0, 0, 0, 1, 1, 1, 0x8a8aa0); for (let i = 0; i < 3; i++) KM.box(M.paint, -0.11 + i * 0.07, -0.08 + i * 0.07, 0.03, 0.1, 0.06, 0.065, 0x3a3a5a, 0.002); }); KM.build(mHall); }
  const mTemple = new THREE.Group(); mTemple.position.set(TLX(1428), DY, DZ); mTemple.scale.setScalar(1.25); root.add(mTemple); { const KM = new Kit(); KM.box(M.darkwood, -0.2, 0.2, 0, 0.04, -0.16, 0.16, 0x3a2418, 0.01); temple(KM, 0, 0.04, -0.01, 0.26, 0.2, 4); KM.build(mTemple); }
  const tagO = mesh(root, plane(0.24, 0.12), M.labOx, TLX(1096), DY + 0.07, DZ + 0.22, -0.35, 0, 0, false), tagA = mesh(root, plane(0.24, 0.12), M.labAz, TLX(1428), DY + 0.07, DZ + 0.22, -0.35, 0, 0, false); tagO.castShadow = tagA.castShadow = false;
  // year pins on the timeline
  const pins = ['1096', '1167', '1325', '1428'].map((y, i) => { const g = new THREE.Group(); g.position.set(TLX(+y), DY, -0.6 + 0.04); root.add(g); const KP = new Kit(); KP.beam(M.metal, [0, 0, 0], [0, 0.11, 0], 0.003, 0x3a3a44); KP.put(M.paint, sph(0.008, 8, 6), 0, 0.112, 0, 0, 0, 0, 1, 1, 1, i < 2 ? 0x2a4ad8 : 0xd8302a); KP.build(g); const lab = mesh(g, plane(0.09, 0.04), M.pins[i], 0.0, 0.085, 0.004, 0, 0, 0, false); lab.castShadow = false; return g; });
  // the span bracket 1096 -> 1428 (span(t))
  const span = new THREE.Group(); span.position.set(TLX(1096), DY + 0.005, -0.66); root.add(span); const spanW = TLX(1428) - TLX(1096); { const bar = mesh(span, new THREE.BoxGeometry(1, 0.012, 0.03), M.gold, 0.5, 0, 0, 0, 0, 0, false); bar.castShadow = false; span.userData.bar = bar; }
  // desk lamp, mug, books, globe, paper stack
  K.at(1.45, DY, -1.35, -0.5, () => { K.put(M.brass, cyl(0.09, 0.11, 0.03, 14), 0, 0.015, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); K.beam(M.brass, [0, 0, 0], [0.06, 0.45, 0], 0.012, 0xc8a050, true, 6); K.put(M.paint, new THREE.ConeGeometry(0.13, 0.15, 16, 1, true), 0.12, 0.46, 0, 0, 0, 0.5, 1, 1, 1, 0x2a5a3a); });
  K.put(M.paint, cyl(0.045, 0.04, 0.1, 14), -1.45, DY + 0.05, -0.8, 0, 0, 0, 1, 1, 1, 0xd8483a); for (let i = 0; i < 3; i++) K.box(M.paint, -1.6, -1.2, DY + i * 0.05, DY + 0.045 + i * 0.05, -1.35, -1.05, [0x2a3a6a, 0x8a2a2a, 0xc8a050][i], 0.008);
  K.at(-2.6, 0, -2.6, 0, () => { K.put(M.darkwood, cyl(0.12, 0.2, 0.9, 10), 0, 0.45, 0, 0, 0, 0, 1, 1, 1, 0x4a2a18); K.put(M.paint, sph(0.32, 20, 14), 0, 1.25, 0, 0, 0, 0.4, 1, 1, 1, 0x3a7ac8); K.put(M.brass, new THREE.TorusGeometry(0.36, 0.015, 6, 28), 0, 1.25, 0, 0, 0, 0.4, 1, 1, 1, 0xc8a050); });
  K.put(M.cloth, new THREE.BoxGeometry(3.4, 0.01, 2.4), 0, 0.005, 0.4, 0, 0, 0, 1, 1, 1, 0x7a2a3a);
  // chair
  K.at(-1.15, 0, 0.15, 0.5, () => { K.box(M.plank, -0.25, 0.25, 0.45, 0.5, -0.22, 0.22, 0x5a3020, 0.02); K.box(M.plank, -0.25, 0.25, 0.5, 1.05, 0.18, 0.22, 0x5a3020, 0.02); for (const a of [-1, 1]) for (const b of [-1, 1]) K.box(M.plank, a * 0.21 - 0.025, a * 0.21 + 0.025, 0, 0.45, b * 0.18 - 0.025, b * 0.18 + 0.025, 0x4a2818, 0.01); });
  // filing cabinet (right) with the ANCIENT drawer
  const CX = 2.35, CZ = -1.2; K.box(M.metal, CX - 0.32, CX + 0.32, 0, 1.32, CZ - 0.35, CZ + 0.3, 0x5a6a5a, 0.02); for (let i = 0; i < 2; i++) { K.box(M.metal, CX - 0.29, CX + 0.29, 0.06 + i * 0.42, 0.44 + i * 0.42, CZ + 0.3, CZ + 0.33, 0x6a7a6a, 0.01); K.box(M.brass, CX - 0.08, CX + 0.08, 0.36 + i * 0.42, 0.38 + i * 0.42, CZ + 0.33, CZ + 0.37, 0xc8a050, 0.005); }
  const drawer = new THREE.Group(); drawer.position.set(CX, 0.9, CZ); root.add(drawer); { const KD = new Kit(); KD.box(M.metal, -0.29, 0.29, 0, 0.4, 0.29, 0.33, 0x6a7a6a, 0.01); KD.box(M.metal, -0.27, 0.27, 0.02, 0.05, -0.32, 0.29, 0x4a5a4a, 0.01); for (const s of [-1, 1]) KD.box(M.metal, s * 0.27 - 0.015, s * 0.27 + 0.015, 0.02, 0.3, -0.32, 0.29, 0x4a5a4a, 0.005); KD.box(M.brass, -0.1, 0.1, 0.07, 0.1, 0.33, 0.37, 0xc8a050, 0.005);
    KD.build(drawer); const lab = mesh(drawer, plane(0.34, 0.12), M.labAncient, 0, 0.24, 0.335, 0, 0, 0, false); lab.castShadow = false; }
  const cards = M.pics.map((mt, i) => { const c = mesh(drawer, plane(0.2, 0.28), mt, -0.18 + i * 0.12, 0.2, -0.2 + i * 0.1, 0, 0, 0, false); c.castShadow = true; c.userData.home = [-0.18 + i * 0.12, 0.2, -0.2 + i * 0.1]; return c; });
  K.build(root, 0);
  const lampG = glowAt(root, [1.53, DY + 0.38, -1.3], 1.0, '#ffc070', 0.45);
  const dust = motes(root, 40, [-1.6, 1.6, 0.8, 2.2, -1.6, 0.4], 81, 0.008);
  return { win, span, spanW, drawer, cards, pins, mHall, mTemple, lampG, dust, CX, CZ, DY, DZ };
}

// ================================================================= SPLIT (desert | Arctic, the same moment)
function buildSplit(root) { const R = PT.rng(2560), K = new Kit();
  mesh(root, planeUV(80, 120, 10, 15), M.sand, -40, 0, -40, -Math.PI / 2, 0, 0, false); { const sg = mesh(root, planeUV(80, 120, 10, 15), M.snow, 40, 0.002, -40, -Math.PI / 2, 0, 0, false); sg.material = M.snow.clone(); sg.material.color.set(0xd0d8e8); }
  // desert: unfinished stepped pyramid (core courses + casing on the lower part), construction ramp, block piles, palms
  const pyrA = new THREE.Group(); pyrA.position.set(-8, 0, -30); root.add(pyrA); { const KP = new Kit(); const B = 16, n = 9, th = 1.05; for (let i = 0; i < n; i++) { const w = B * (1 - i / 11); KP.box(M.limestone, -w / 2, w / 2, i * th, (i + 1) * th, -w / 2, w / 2, 0xffffff, 0.06); }
    for (let i = 0; i < 3; i++) { const w0 = B * (1 - i / 11) + 0.6; KP.put(M.casing, new THREE.CylinderGeometry(w0 * 0.707 - 0.65, w0 * 0.707, th, 4, 1), 0, (i + 0.5) * th, 0, 0, Math.PI / 4, 0, 1, 1, 1, 0xffffff); }
    KP.put(M.sand, new THREE.BoxGeometry(2.6, 0.5, 13), 5.0, 2.6, 6.0, 0.45, 0, 0, 1, 1, 1, 0xe8c890); for (let i = 0; i < 5; i++) KP.box(M.limestone, 3 + i * 1.2, 3.9 + i * 1.2, 0, 0.8, 9 + (i % 2) * 1.5, 9.9 + (i % 2) * 1.5, 0xffffff, 0.05); KP.build(pyrA); }
  const pyrB = new THREE.Group(); pyrB.position.set(-8, 0, -30); root.add(pyrB); { const KP = new Kit(); KP.put(M.casing, new THREE.ConeGeometry(16 * 0.707 + 0.4, 10.6, 4, 1), 0, 5.3, 0, 0, Math.PI / 4, 0, 1, 1, 1, 0xffffff); KP.put(M.gold, new THREE.ConeGeometry(0.75, 0.75, 4, 1), 0, 10.45, 0, 0, Math.PI / 4, 0, 1, 1, 1, 0xffffff); KP.build(pyrB); } pyrB.visible = false;
  // a block on a sledge near the camera (drag(t) moves it)
  const sledge = new THREE.Group(); sledge.position.set(-3.2, 0, -8); sledge.rotation.y = 0.5; root.add(sledge); { const KS = new Kit(); for (const s of [-1, 1]) KS.box(M.plank, -1.1, 1.1, 0, 0.12, s * 0.45 - 0.07, s * 0.45 + 0.07, 0x8a6040, 0.04); KS.box(M.limestone, -0.75, 0.75, 0.12, 1.1, -0.6, 0.6, 0xffffff, 0.05); KS.beam(M.cloth, [1.1, 0.1, 0.3], [2.6, 0.9, 0.3], 0.025, 0xc8a870); KS.beam(M.cloth, [1.1, 0.1, -0.3], [2.6, 0.9, -0.3], 0.025, 0xc8a870); KS.build(sledge); }
  for (const [x, z, s] of [[-12, -6, 1.3], [-17, -14, 1.5], [-6.5, -2, 1.0]]) { K.beam(M.bark, [x, 0, z], [x + 0.6 * s, 4.2 * s, z], 0.14 * s, 0x8a6a40, true, 6); for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; K.put(M.leaf, new THREE.BoxGeometry(1.8 * s, 0.04, 0.32 * s), x + 0.6 * s + Math.cos(a) * 0.8 * s, 4.1 * s - 0.25 * s, z + Math.sin(a) * 0.8 * s, 0, -a, -0.35, 1, 1, 1, [0x4a8a3a, 0x3a7a32][i % 2]); } }
  for (let i = 0; i < 10; i++) K.box(M.limestone, -1.8 - R() * 7, -0.9 - R() * 7, 0, 0.6 + R() * 0.4, -4 - R() * 12, -3.2 - R() * 12, 0xffffff, 0.05);
  // arctic: drifts, rocks, tundra tufts
  for (let i = 0; i < 26; i++) { const x = 1.2 + R() * 22, z = -1 - R() * 40; if (z > -11 && x < 9) continue; K.put(M.snow, lumpGeo(i, 1, 0.2), x, 0, z, 0, R() * 3, 0, 1.2 + R() * 2.5, 0.3 + R() * 0.5, 1 + R() * 1.6, 0xd8e0ee); }
  for (const [x, z, sx] of [[1.8, -12, 2], [6.5, -12.5, 2.4], [10.5, -9, 2.2]]) K.put(M.snow, lumpGeo(x * 3 | 0, 1, 0.2), x, 0, z, 0, 0.4, 0, sx, 0.45, 1.3, 0xd8e0ee);
  for (let i = 0; i < 14; i++) { const x = 1.5 + R() * 16, z = -2 - R() * 30; K.put(M.ashlarD, lumpGeo(i + 40, 1, 0.3), x, 0.1, z, 0, R() * 3, 0, 0.4 + R() * 0.8, 0.3 + R() * 0.4, 0.4 + R() * 0.7, 0x6a6a78); }
  for (let i = 0; i < 40; i++) { const x = 0.8 + R() * 12, z = 1 - R() * 20; for (let k = 0; k < 4; k++) K.put(M.leaf, new THREE.ConeGeometry(0.02, 0.25, 3), x + (R() - 0.5) * 0.2, 0.12, z + (R() - 0.5) * 0.2, (R() - 0.5) * 0.4, 0, (R() - 0.5) * 0.4, 1, 1, 1, [0x9a8a5a, 0x7a7a4a][k % 2]); }
  // signpost on the seam
  K.at(0, 0, -1.2, 0, () => { K.beam(M.plank, [0, 0, 0], [0, 2.6, 0], 0.06, 0x6a4a2a, true, 8); }); K.build(root, 30);
  const sgE = mesh(root, plane(0.95, 0.28), M.signEgypt, -0.5, 2.0, -1.12, 0, 0, 0.05, false), sgA = mesh(root, plane(1.25, 0.28), M.signArctic, 0.65, 1.6, -1.12, 0, 0, -0.05, false), sgT = mesh(root, plane(0.95, 0.28), M.signTime, 0, 2.45, -1.12, 0, 0, 0, false);
  // backdrops: desert sky + dunes (left), arctic sky + icy hills (right)
  for (const [x, sk, hl] of [[-60, M.skyDesert, M.dunes], [60, M.skyArctic, M.iceHills]]) { const s = nond(mesh(root, plane(x > 0 ? 150 : 120, 120), sk, x > 0 ? x - 15 : x, 40, x > 0 ? -89.9 : -90, 0, 0, 0, false)); s.renderOrder = x > 0 ? -2 : -3; const h = nond(mesh(root, plane(120, 26), hl, x, 8, -80, 0, 0, 0, false)); h.renderOrder = -1; h.castShadow = false; }
  const snow = motes(root, 120, [0.5, 12, 0.2, 7, -16, 4], 91, 0.02), heat = motes(root, 30, [-10, -0.5, 0.3, 4, -14, 2], 93, 0.008);
  return { pyrA, pyrB, sledge, snow, heat, signs: [sgE, sgA, sgT] };
}

// ================================================================= lights, grades, API
const SET_LIGHT = {
  town1096: { top: '#4a7ad0', hor: '#d8e4f0', fog: '#d8e0ea', fogN: 40, fogF: 260, sky: '#a8bcf0', ground: '#6a6050', hemiI: 0.74, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#fff0d0', sunI: 3.6, az: 60, el: 32, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0.3 },
  town1167: { top: '#3a72d8', hor: '#c8dcf4', fog: '#d0dcea', fogN: 40, fogF: 280, sky: '#a0b8f0', ground: '#6a6050', hemiI: 0.76, fillCol: '#7d93e6', fillI: 0.33, sunCol: '#fff4dc', sunI: 3.9, az: 30, el: 48, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0.2 },
  townDawn: { top: '#4a5aa8', hor: '#ffc890', fog: '#f0c8a0', fogN: 40, fogF: 240, sky: '#9a90d8', ground: '#5a4a50', hemiI: 0.9, fillCol: '#7078d8', fillI: 0.32, sunCol: '#ffb070', sunI: 3.2, az: 25, el: 10, disc: '#fff0c8', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff2e2', fxTint: '#fff6ea', shafts: 0.6 },
  hallCandle: { top: '#000000', hor: '#140e18', fog: '#140e18', fogN: 12, fogF: 50, sky: '#ffc890', ground: '#3a2420', hemiI: 0.55, fillCol: '#4a50c0', fillI: 0.45, sunCol: '#8aa0ff', sunI: 1.1, az: 70, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
  lakeEmpty: { top: '#5a6ab0', hor: '#f0d0b8', fog: '#d8d0d8', fogN: 25, fogF: 200, sky: '#a8a8d8', ground: '#4a4a50', hemiI: 0.85, fillCol: '#7880d8', fillI: 0.34, sunCol: '#ffc890', sunI: 2.8, az: 75, el: 12, disc: '#fff0d0', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff4ea', fxTint: '#ffffff', shafts: 0.5 },
  lake1325: { top: '#3a7ad8', hor: '#d0e4f0', fog: '#d8e4ee', fogN: 50, fogF: 320, sky: '#a8c0f0', ground: '#5a6050', hemiI: 0.75, fillCol: '#7d93e6', fillI: 0.34, sunCol: '#fff0d0', sunI: 3.7, az: 55, el: 40, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0.3 },
  lake1428: { top: '#5a78c8', hor: '#ffc890', fog: '#f8c89a', fogN: 50, fogF: 300, sky: '#8f90d8', ground: '#5a3e58', hemiI: 0.95, fillCol: '#6f7ad8', fillI: 0.3, sunCol: '#ffb070', sunI: 3.2, az: -60, el: 14, disc: '#fff0c8', discSize: 0.003, clouds: true, stars: 0, cardTint: '#fff2e2', fxTint: '#fff6ea', shafts: 0.5 },
  studyNight: { top: '#000000', hor: '#120e18', fog: '#120e18', fogN: 8, fogF: 40, sky: '#ffc890', ground: '#4a3028', hemiI: 0.85, fillCol: '#5a68d8', fillI: 0.5, sunCol: '#9ab0ff', sunI: 1.6, az: -80, el: 35, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
  studyDesk: { top: '#000000', hor: '#2a1e18', fog: '#2a1e18', fogN: 8, fogF: 40, sky: '#ffe8c8', ground: '#5a3a2a', hemiI: 0.9, fillCol: '#8a90c8', fillI: 0.3, sunCol: '#ffe0b0', sunI: 2.0, az: 140, el: 50, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  studyBlue: { top: '#000000', hor: '#0a0e24', fog: '#0a0e24', fogN: 8, fogF: 36, sky: '#7a8ae0', ground: '#3a3040', hemiI: 0.8, fillCol: '#4a68e8', fillI: 0.5, sunCol: '#90b0ff', sunI: 1.2, az: -70, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#e0e8ff', fxTint: '#ffffff', shafts: 0 },
  studyDawn: { top: '#000000', hor: '#2a1e20', fog: '#2a1e20', fogN: 8, fogF: 40, sky: '#ffd8b0', ground: '#5a3a2a', hemiI: 0.9, fillCol: '#7a80d8', fillI: 0.32, sunCol: '#ffb878', sunI: 2.6, az: -80, el: 14, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  splitDay: { top: '#4a7ad0', hor: '#e0e8f0', fog: '#e0e4ea', fogN: 60, fogF: 300, sky: '#a8bcf0', ground: '#6a6050', hemiI: 0.78, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#fff0d0', sunI: 3.6, az: -40, el: 34, disc: '#fffbe8', discSize: 0.002, clouds: false, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0.2 },
  splitDone: { top: '#5a78c8', hor: '#ffd0a0', fog: '#f0d0b0', fogN: 60, fogF: 300, sky: '#9a98d8', ground: '#5a4a58', hemiI: 0.9, fillCol: '#6f7ad8', fillI: 0.32, sunCol: '#ffc080', sunI: 3.3, az: -50, el: 18, disc: '#fff0c8', discSize: 0.003, clouds: false, stars: 0, cardTint: '#fff4e8', fxTint: '#fff6ea', shafts: 0.4 },
};
const SET_GRADE = {
  town1096: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.1, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.36, 0.86], vig: [0.26, 0.5, '#4a3a5a'] } },
  town1167: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.12, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c0', 0.06], bloom: [0.36, 0.86], vig: [0.26, 0.5, '#4a3a5a'] } },
  townDawn: { look: 'golden', over: { exp: 1.06, con: 1.22, sat: 1.08, tS: ['#3a3a8a', 0.18], tH: ['#ffc890', 0.1], bloom: [0.42, 0.78], hal: [0.24, '#ffa860'], vig: [0.3, 0.48, '#1e1a3a'] } },
  hallCandle: { look: 'office', over: { exp: 1.16, con: 1.24, sat: 1.08, lift: [0.035, 0.02, 0.05], tS: ['#2a1a6a', 0.22], tH: ['#ffc070', 0.14], bloom: [0.5, 0.68], hal: [0.32, '#ff9a50'], vig: [0.42, 0.4, '#0c0614'] } },
  lakeEmpty: { look: 'golden', over: { exp: 1.06, con: 1.18, sat: 1.06, tS: ['#3a3a8a', 0.18], tH: ['#ffd0a0', 0.1], bloom: [0.44, 0.76], hal: [0.24, '#ffb070'], vig: [0.3, 0.48, '#1e1a3a'] } },
  lake1325: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.12, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.36, 0.86], vig: [0.26, 0.5, '#2a3a5a'] } },
  lake1428: { look: 'golden', over: { exp: 1.06, con: 1.24, sat: 1.12, tS: ['#3a2a8a', 0.2], tH: ['#ffb080', 0.1], bloom: [0.46, 0.74], hal: [0.28, '#ff9060'], vig: [0.34, 0.46, '#1e1a3a'] } },
  studyNight: { look: 'night', over: { exp: 1.16, con: 1.24, sat: 1.08, lift: [0.025, 0.022, 0.055], tS: ['#1a2a7a', 0.24], tH: ['#ffc070', 0.14], bloom: [0.5, 0.68], hal: [0.3, '#ffa050'], vig: [0.42, 0.4, '#08081a'] } },
  studyDesk: { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.08, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.42, 0.78], hal: [0.26, '#ff9a50'], vig: [0.38, 0.44, '#2a1420'] } },
  studyBlue: { look: 'night', over: { exp: 1.16, con: 1.24, sat: 1.06, lift: [0.02, 0.025, 0.06], tS: ['#1a2a7a', 0.28], tH: ['#a8c8ff', 0.1], bloom: [0.5, 0.66], hal: [0.3, '#80a0ff'], vig: [0.42, 0.4, '#04061a'] } },
  studyDawn: { look: 'office', over: { exp: 1.1, con: 1.22, sat: 1.1, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.16], tH: ['#ffc890', 0.12], bloom: [0.44, 0.76], hal: [0.26, '#ffa860'], vig: [0.34, 0.46, '#2a1420'] } },
  splitDay: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.1, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.38, 0.84], vig: [0.26, 0.5, '#3a3a5a'] } },
  splitDone: { look: 'golden', over: { exp: 1.06, con: 1.22, sat: 1.1, tS: ['#3a3a8a', 0.18], tH: ['#ffc890', 0.1], bloom: [0.42, 0.78], hal: [0.24, '#ffa860'], vig: [0.3, 0.48, '#1e1a3a'] } },
};

export function buildOX(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'town1096', grow: 1, rise: 1, span: 0, drawer: 0, cards: 0, drag: 0 };
  let tw, hl, lk, sd, sp;
  const API = makeAPI(ctx, { prefix: 'ox_', origin: OX_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { town1096: 'day', town1167: 'day', townDawn: 'day', lakeEmpty: 'day', lake1325: 'day', lake1428: 'day', splitDay: 'day', splitDone: 'day' },
    practicals: (name, F, W3) => { const fl = 1 + 0.06 * Math.sin(F * 0.7) + 0.04 * Math.sin(F * 1.9);
      if (name === 'hallCandle') return [{ p: W3('hall', [0, 3.6, -3.2]), col: '#ffb060', I: 9 * fl, d: 10 }, { p: W3('hall', [-1.8, 1.4, -2.6]), col: '#ffc070', I: 4 * fl, d: 6 }, { p: W3('hall', [1.8, 1.4, -1.0]), col: '#ffc070', I: 4 * fl, d: 6 }, { p: W3('hall', [0, 2.8, -7.4]), col: '#ff9a40', I: 6 * fl, d: 7 }];
      if (name.startsWith('study')) { const k = name === 'studyBlue' ? 0.7 : name === 'studyDawn' ? 0.6 : 1; return [{ p: W3('study', [1.2, 1.6, -0.6]), col: '#ffc070', I: 7 * k * fl, d: 5 }, { p: W3('study', [-2.6, 1.7, -0.6]), col: name === 'studyDawn' ? '#ffb070' : '#7a8aff', I: name === 'studyDawn' ? 6 : 4, d: 6 }, { p: W3('study', [0, 2.2, 1.4]), col: '#ffe0b8', I: name === 'studyDesk' ? 4 : 2.5, d: 6 }, { p: W3('study', [2.3, 1.6, -0.4]), col: name === 'studyBlue' ? '#8aa0ff' : '#ffd0a0', I: 2, d: 4 }]; }
      if (name === 'townDawn') return [{ p: W3('town', [-2.0, 3.6, 0.5]), col: '#ffa860', I: 2, d: 6 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'town' && tw) { tickMotes(tw.dust, f, 0.4); tw.grow.forEach((g, i) => { const k = clamp01(ST.grow * 1.25 - i * 0.12); g.scale.y = 0.001 + 0.999 * (k * k * (3 - 2 * k)); g.visible = k > 0.01; }); tw.scaff.visible = ST.grow > 0.02 && ST.grow < 0.999 && ST.mood !== 'townDawn'; }
      if (cur === 'hall' && hl) { hl.flames.forEach((fl, i) => { fl.scale.set(1 + 0.12 * Math.sin(f * 0.9 + i * 1.7), 1 + 0.2 * Math.sin(f * 1.3 + i * 2.3), 1); }); hl.glows.forEach((g, i) => (g.material.opacity = g.userData.op * (0.88 + 0.12 * Math.sin(f * 0.8 + i)))); hl.wheel.rotation.y = Math.sin(T * 0.3) * 0.04; tickMotes(hl.dust, f, 0.25); }
      if (cur === 'lake' && lk) { lk.water.material.map.offset.set(T * 0.004, T * 0.006); lk.canoes.forEach((c, i) => { c.position.y = 0.03 * Math.sin(f * 0.12 + i); c.rotation.z = 0.03 * Math.sin(f * 0.1 + i * 2); }); lk.mist.forEach((m, i) => { m.position.x = (i - 2) * 9 + Math.sin(T * 0.2 + i) * 2; }); lk.eagle.rotation.y = 0.2 * Math.sin(T * 0.5);
        lk.p25.forEach((g, i) => { const k = clamp01(ST.rise * 1.4 - i * 0.08); const e = k * k * (3 - 2 * k); g.scale.set(0.001 + e, 0.001 + e, 0.001 + e); g.visible = k > 0.01; }); tickMotes(lk.dust, f, 0.4); }
      if (cur === 'study' && sd) { tickMotes(sd.dust, f, 0.2); sd.lampG.material.opacity = sd.lampG.userData.op * (0.92 + 0.08 * Math.sin(f * 0.8)); const s = Math.max(0.001, ST.span); sd.span.userData.bar.scale.x = sd.spanW * s; sd.span.userData.bar.position.x = sd.spanW * s / 2; sd.span.visible = ST.span > 0.002;
        sd.drawer.position.z = sd.CZ + 0.42 * ST.drawer; sd.cards.forEach((c, i) => { const k = clamp01(ST.cards * 1.5 - i * 0.15), e = k * k * (3 - 2 * k), h = c.userData.home; const tx = -0.42 + (i - 1.5) * 0.2 * 0.9, ty = 0.5 + (i % 2) * 0.16, tz = 0.62 + (i - 1.5) * 0.2 * 0.43; c.position.set(h[0] + e * (tx - h[0]), h[1] + e * (ty - h[1]) + 0.015 * Math.sin(f * 0.15 + i) * e, h[2] + e * (tz - h[2])); c.rotation.set(-0.12 * e, e * (-0.45 + (i - 1.5) * 0.08), e * (0.2 - i * 0.12)); }); }
      if (cur === 'split' && sp) { tickMotes(sp.snow, f, -3); tickMotes(sp.heat, f, 0.6); sp.sledge.position.set(-3.2 - ST.drag * 1.6, 0, -8 - ST.drag * 2.6); } },
    mood: (name) => { ST.mood = name;
      if (tw) { tw.flags.visible = name === 'town1167'; tw.sky.material.color.set(name === 'townDawn' ? 0xffb88a : name === 'town1167' ? 0x98c0f8 : 0xa8c8f8); if (name === 'townDawn') ST.grow = 1; }
      if (lk) { const e = name === 'lakeEmpty'; lk.g25.visible = name === 'lake1325'; lk.g28.visible = name === 'lake1428'; lk.mist.forEach((m) => (m.visible = e)); lk.canoes.forEach((c) => (c.visible = !e)); lk.sky.material.color.set(e ? 0xf0c8b0 : name === 'lake1428' ? 0xffa88a : 0xa8c8f8); }
      if (sd) { sd.win.material = name === 'studyDawn' ? M.winDawn : M.winNight; }
      if (sp) { sp.pyrA.visible = name !== 'splitDone'; sp.pyrB.visible = name === 'splitDone'; sp.sledge.visible = name !== 'splitDone'; } },
    apply: (v) => { for (const k of ['grow', 'rise', 'span', 'drawer', 'cards', 'drag']) if (v[k] != null) ST[k] = v[k]; } });
  tw = buildTown(API.groups.town); hl = buildHall(API.groups.hall); lk = buildLake(API.groups.lake); sd = buildStudy(API.groups.study); sp = buildSplit(API.groups.split);
  API.parts = { tw, hl, lk, sd, sp };
  API.set = (o) => { for (const k in o) ST[k] = o[k]; };
  API.glows = { town: [], hall: hl.glows, lake: [], study: [sd.lampG], split: [] };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); if (API.cur === 'hall') for (const fl of hl.flames) { const p = fl.getWorldPosition(new THREE.Vector3()); fl.rotation.y = Math.atan2(cam.position.x - p.x, cam.position.z - p.z) - (fl.parent === hl.wheel ? hl.wheel.rotation.y : 0); } };
  const V = API.V;
  API.views = [
    V('town1096', [0.6, 1.8, 10], [-0.4, 2.6, -14], 44, 0.8, [-1, 1.5, 0]), // 0 street wide
    V('town1167', [-0.6, 1.6, 4.5], [1.6, 2.2, -2.0], 44, 1.2, [1.6, 1.2, -1.8]), // 1 hall facade
    V('townDawn', [0.3, 2.4, 13], [-0.3, 3.2, -14], 46, 0.8, [0, 1.5, 0], { grow: 1 }), // 2 dawn
    V('town1167', [0.2, 1.7, 6], [0, 2.6, -20], 44, 0.8, [0, 1.4, -4], { grow: 0.6 }), // 3 growing
    V('hallCandle', [0.5, 1.6, 2.6], [0, 1.7, -8], 46, 1.2, [0, 1.2, -4]), // 4 hall wide
    V('hallCandle', [-1.6, 1.2, -2.0], [-1.6, 0.9, -5.2], 44, 1.6, [-1.6, 0.9, -4.2]), // 5 benches close
    V('lakeEmpty', [1.2, 1.4, 6], [-0.6, 1.6, -6], 44, 1.0, [-0.6, 1.6, -4]), // 6 empty island + eagle
    V('lake1325', [3.2, 1.8, 7], [0.2, 1.0, -8], 44, 1.0, [0.6, 1.0, -7], { rise: 1 }), // 7 founding
    V('lake1428', [2.0, 2.6, 8], [0, 3.4, -18], 44, 0.9, [0, 2, -10]), // 8 the city 1428
    V('studyNight', [0.05, 1.22, 1.15], [0.05, 0.86, -1.0], 44, 2.0, [0.05, 0.8, -0.9]), // 9 desk hook
    V('studyDesk', [0.0, 1.05, 0.2], [0.0, 0.76, -0.75], 44, 3.0, [0.0, 0.76, -0.62], { span: 1 }), // 10 timeline span
    V('studyBlue', [1.4, 1.3, 1.0], [2.35, 1.0, -1.0], 44, 2.0, [2.35, 1.0, -0.8], { drawer: 1, cards: 1 }), // 11 drawer
    V('studyDawn', [0.6, 1.3, 1.6], [0.0, 0.9, -1.2], 44, 1.8, [0, 0.9, -1.0]), // 12 dawn
    V('splitDay', [-3.5, 1.8, 6], [-6, 4, -28], 44, 0.8, [-4, 1.5, -6]), // 13 pyramid side
    V('splitDay', [2.0, 1.6, 6], [3.5, 1.4, -6], 44, 1.0, [3.5, 1.2, -5]), // 14 arctic side
    V('splitDone', [0.0, 7.0, 26], [-1.5, 3.2, -16], 46, 0.6, [0, 1.5, -8]), // 15 both, wide
  ];
  API.tick(0);
  return API;
}
