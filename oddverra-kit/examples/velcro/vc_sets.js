// vc_sets.js [VC-sets]: sets for "Velcro was invented because burrs kept sticking to a dog" (Oddverra short).
//   meadow : Swiss hill country, 1941: a meadow path through burdock clumps (big leaves, purple-topped burr heads), a split-rail
//            fence, pines and birches, a chalet with a balcony and flower boxes, snowy peaks behind, a trail sign. A pool of flying
//            burrs (setFly) that leap onto the dog. Moods 'meadowDay', 'meadowGold' (hunt walk), 'meadowDawn' (payoff).  origin (-168000,0,0)
//   study  : George's study at night: plank floor, papered walls, a desk with a brass microscope (the hero prop: eyepiece the camera
//            pushes into), a green banker's lamp, books, a dog bed, a pinboard whose sketches appear (setPlan: HOOKS / LOOPS).
//            Moods 'study' (lamp-lit), 'studyNight'.                                                                     (-168000,0,800)
//   micro  : inside the microscope: a giant woven loop field (fabric) or curly red fur (setMicro), and a board of amber J-hooks that
//            presses down and catches the loops (setPress). Mood 'micro' (deep blue "You see").                         (-168000,0,1600)
//   mill   : a Lyon weaving workshop, late 1940s: brick walls, a wooden loom with warp threads, spool racks, COTTON and NYLON crates,
//            a work table under an infrared lamp (setIR), a wall calendar (setYear 1941..1955), fabric bolts VELOURS / CROCHET and a
//            VELCRO banner (setName). Mood 'mill'.                                                                         (-170500,0,0)
//   runway : a 1950s fashion salon: a lit catwalk, gilt chairs, velvet curtains, chandeliers, a FASHION SHOW sign, flash pops
//            (setFlash). Mood 'runway'.                                                                                   (-170500,0,800)
//   capsule: an Apollo-era command module interior (generic, no insignia): cone walls, a switch-and-dial panel, couches, portholes
//            onto the Moon, grey hook-and-loop patches holding tools and snack pouches; loose items float (setFloat). Mood 'capsule'. (-170500,0,1600)
// Each set: local frame, camera side +z. Test flag ?vcview=N (main.js).
import { H, TAU, clamp01, sm, SERIF, SANS, cyl, sph, plane, planeUV, mesh, nond, lumpGeo, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';

export const VC_ORIGIN = { meadow: [-168000, 0, 0], study: [-168000, 0, 800], micro: [-168000, 0, 1600], mill: [-170500, 0, 0], runway: [-170500, 0, 800], capsule: [-170500, 0, 1600] };
const GROUP_OF = { meadowDay: 'meadow', meadowGold: 'meadow', meadowDawn: 'meadow', study: 'study', studyNight: 'study', micro: 'micro', mill: 'mill', runway: 'runway', capsule: 'capsule' };
// microscope eyepiece (study local) and the micro set's hook board travel
export const SCOPE = { EYE: [0.25, 1.33, -2.1], DESK: 0.78 };
let THREE, PT, M;

// ---------------------------------------------------------------- painters
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 6, 2, 3, 7)); g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08);
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : (0.5 - 0.17 * (lines.length - 1)) + i * 0.34), w * 0.86, h * (lines.length === 1 ? 0.5 : 0.28), { col: (o.cols || [])[i] || o.col || '#3a2414', font: o.font || SERIF })); }; }
function mountainTex(o = {}) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.top || '#6a9ae0'); gr.addColorStop(0.75, o.hor || '#e8eef8'); gr.addColorStop(1, o.hor || '#e8eef8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const R = PT.rng(o.seed || 7); const ridge = (y0, amp, col, snow, seed) => { const R2 = PT.rng(seed); g.fillStyle = col; g.beginPath(); g.moveTo(0, h); let y = y0; const pts = []; for (let x = 0; x <= w; x += w / 18) { y = y0 - amp * (0.3 + R2() * 0.7) * (0.6 + 0.4 * Math.sin(x / w * 7 + seed)); pts.push([x, y]); g.lineTo(x, y); } g.lineTo(w, h); g.closePath(); g.fill();
    if (snow) { g.fillStyle = snow; for (let i = 1; i < pts.length - 1; i++) { const [x, y] = pts[i]; if (y < y0 - amp * 0.6) { g.beginPath(); g.moveTo(x - w / 30, y + amp * 0.18); g.lineTo(x, y); g.lineTo(x + w / 30, y + amp * 0.18); g.lineTo(x + w / 60, y + amp * 0.12); g.lineTo(x, y + amp * 0.2); g.closePath(); g.fill(); } } } };
  ridge(h * 0.62, h * 0.4, o.far || '#9aa8d0', o.snow || '#f6f8ff', 3); ridge(h * 0.78, h * 0.26, o.mid || '#6a80a8', o.snow2 || 'rgba(240,244,255,0.9)', 11); ridge(h * 0.92, h * 0.16, o.near || '#4a6a58', null, 19);
  if (o.stars) { g.fillStyle = '#fff'; for (let i = 0; i < 70; i++) g.fillRect(R() * w, R() * h * 0.4, 2, 2); } }; }
function wallpaperTex(o = {}) { return (g, w, h) => { g.fillStyle = o.base || '#6a7a5a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.14 * PT.fbm(u, v, 4, 4, 3, 5));
  g.fillStyle = o.dot || 'rgba(240,220,170,0.4)'; for (let y = 0; y < h; y += 48) for (let x = (y / 48 % 2) * 24; x < w; x += 48) { g.beginPath(); g.moveTo(x, y - 10); g.quadraticCurveTo(x + 9, y, x, y + 10); g.quadraticCurveTo(x - 9, y, x, y - 10); g.fill(); }
  g.fillStyle = 'rgba(40,30,30,0.25)'; for (let x = 0; x < w; x += w / 4) g.fillRect(x, 0, 2, h); }; }
function loopsTex(o = {}) { return (g, w, h) => { g.fillStyle = o.base || '#d8c8b0'; g.fillRect(0, 0, w, h); g.lineWidth = 3; for (let y = 0; y < h; y += 14) for (let x = ((y / 14) % 2) * 7; x < w; x += 14) { g.strokeStyle = o.loop || 'rgba(255,250,235,0.7)'; g.beginPath(); g.arc(x, y, 6, Math.PI, TAU); g.stroke(); g.strokeStyle = 'rgba(80,60,40,0.35)'; g.beginPath(); g.arc(x + 1, y + 2, 6, 0.2, Math.PI - 0.2); g.stroke(); } }; }
function panelTex(g, w, h) { g.fillStyle = '#5a6068'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.1 * PT.fbm(u, v, 6, 6, 3, 9)); const R = PT.rng(1969);
  for (let i = 0; i < 9; i++) { const x = (i % 3) * w / 3 + 12, y = Math.floor(i / 3) * h / 3 + 12, ww = w / 3 - 24, hh = h / 3 - 24; g.fillStyle = '#3a4048'; g.fillRect(x, y, ww, hh); g.strokeStyle = '#8a9098'; g.lineWidth = 2; g.strokeRect(x, y, ww, hh);
    if (i % 4 === 0) { for (let k = 0; k < 2; k++) { const cx = x + ww * (0.3 + 0.4 * k), cy = y + hh * 0.5, r = hh * 0.28; g.fillStyle = '#e8e4d0'; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); g.strokeStyle = '#2a2a30'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(R() * 6) * r * 0.8, cy + Math.sin(R() * 6) * r * 0.8); g.stroke(); } }
    else for (let k = 0; k < 10; k++) { const sx = x + 10 + (k % 5) * (ww - 20) / 4, sy = y + hh * (k < 5 ? 0.32 : 0.7); g.fillStyle = '#c8ccd4'; g.fillRect(sx - 3, sy - 9, 6, 18); g.fillStyle = ['#e04a3a', '#f0c040', '#40c060', '#f2f2f2'][(i + k) % 4]; g.fillRect(sx - 4, sy - 16, 8, 6); } }
  txt(g, 'MAIN DISPLAY', w * 0.5, h * 0.03, w * 0.5, h * 0.025, { col: '#e8e8f0', font: SANS }); }
function spaceTex(o = {}) { return (g, w, h) => { g.fillStyle = '#05060f'; g.fillRect(0, 0, w, h); const R = PT.rng(11); g.fillStyle = '#fff'; for (let i = 0; i < 160; i++) g.fillRect(R() * w, R() * h, 1.5, 1.5);
  const cx = w * (o.x || 0.6), cy = h * (o.y || 0.6), r = w * (o.r || 0.3), gr = g.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r); gr.addColorStop(0, o.c0 || '#f4f2ea'); gr.addColorStop(1, o.c1 || '#8a8a96'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
  if (!o.earth) { g.fillStyle = 'rgba(80,80,100,0.35)'; for (let i = 0; i < 14; i++) { const a = R() * TAU, d = R() * r * 0.8; g.beginPath(); g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r * (0.04 + R() * 0.1), 0, TAU); g.fill(); } }
  else { g.fillStyle = '#4a9a5a'; for (let i = 0; i < 8; i++) { const a = R() * TAU, d = R() * r * 0.7; g.beginPath(); g.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r * 0.2, r * 0.12, R() * 3, 0, TAU); g.fill(); } g.fillStyle = 'rgba(255,255,255,0.6)'; for (let i = 0; i < 10; i++) { const a = R() * TAU, d = R() * r * 0.8; g.beginPath(); g.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r * 0.18, r * 0.05, R() * 3, 0, TAU); g.fill(); } } }; }
function calTex(y) { return (g, w, h) => { g.fillStyle = '#f4eee0'; g.fillRect(0, 0, w, h); g.fillStyle = '#b8322a'; g.fillRect(0, 0, w, h * 0.22); txt(g, 'CALENDRIER', w / 2, h * 0.11, w * 0.8, h * 0.1, { col: '#f4eee0', font: SANS }); txt(g, String(y), w / 2, h * 0.5, w * 0.9, h * 0.34, { col: '#2a2020', font: SERIF });
  g.fillStyle = 'rgba(60,40,40,0.4)'; for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) g.fillRect(w * 0.08 + c * w * 0.122, h * (0.74 + r * 0.075), w * 0.09, h * 0.05); }; }
function curtainTex(g, w, h) { g.fillStyle = '#8a1a2a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u) => 0.72 + 0.4 * (0.5 + 0.5 * Math.sin(u * TAU * 14)) ** 2); g.fillStyle = 'rgba(240,200,90,0.8)'; g.fillRect(0, h * 0.94, w, h * 0.06); }
function warpTex(g, w, h) { g.clearRect(0, 0, w, h); for (let x = 2; x < w; x += 6) { g.fillStyle = ['rgba(240,232,214,0.95)', 'rgba(200,90,70,0.9)', 'rgba(240,232,214,0.95)'][(x / 6 | 0) % 3]; g.fillRect(x, 0, 2.4, h); } }
function stripeTex(o = {}) { return (g, w, h) => { PT.fabric(g, w, h, { base: o.base || '#e8dcc0', stripes: o.stripes, nStripes: 10, seed: o.seed || 5 }); }; }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.grass = toon({ map: T(512, 512, (g, w, h) => PT.grass(g, w, h, { base: '#6a9a4a' }), [1 / 6, 1 / 6]) }); m.path = toon({ map: T(512, 512, (g, w, h) => PT.dirt(g, w, h, { base: '#b89a6a' }), [1 / 4, 1 / 4]) });
  m.leaf = vc(); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a6040', n: 8, seed: 51 })) });
  m.plaster = vc({ map: T(256, 256, (g, w, h) => PT.stone(g, w, h, { base: '#efe6d2' })) }); m.stone = vc({ map: T(256, 256, (g, w, h) => PT.stone(g, w, h, { base: '#b8b0a0' })) });
  m.burr = vc({ emissive: 0x1a1006 }); m.tuft = vc({ emissive: 0x2a0a30 }); m.flower = vc({ emissive: 0x201010 });
  m.mtn = new THREE.MeshBasicMaterial({ map: T(1024, 512, mountainTex({})), fog: false }); m.mtn.color.setScalar(0.92);
  m.mtnG = new THREE.MeshBasicMaterial({ map: T(1024, 512, mountainTex({ top: '#5a5aa8', hor: '#ffc890', far: '#b890b0', mid: '#8a6a90', near: '#4a4a40', snow: '#ffe0c8', snow2: 'rgba(255,220,200,0.9)' })), fog: false }); m.mtnG.color.setScalar(0.92);
  m.mtnD = new THREE.MeshBasicMaterial({ map: T(1024, 512, mountainTex({ top: '#3a4a98', hor: '#ffb8a0', far: '#a890c0', mid: '#706aa0', near: '#3a4a48', snow: '#ffe8f0', snow2: 'rgba(255,230,240,0.9)' })), fog: false }); m.mtnD.color.setScalar(0.92);
  m.trail = em(T(512, 200, signTex(['SENTIER', 'FORÊT  2 km'], { bg: '#f2e2b8', cols: ['#3a2414', '#6a3a1a'] })), 0x302418);
  m.floor = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#7a5638', n: 10, seed: 31 })) }); m.paper = vc({ map: T(512, 512, wallpaperTex({})) });
  m.winNight = new THREE.MeshBasicMaterial({ map: T(512, 512, mountainTex({ top: '#0a1030', hor: '#2a3a7a', far: '#2a3060', mid: '#1a2048', near: '#101828', snow: '#8a9ad8', snow2: 'rgba(140,150,220,0.8)', stars: 1 })), fog: false });
  m.brass = vc({ emissive: 0x1a1004 }); m.black = vc({ emissive: 0x050508 }); m.lampGreen = toon({ color: 0x2a8a4a, emissive: 0x0a3a1a, transparent: true, opacity: 0.92 });
  m.planHook = em(T(400, 400, signTex(['HOOKS', '∩ ∩ ∩'], { bg: '#e8eef8', cols: ['#2a3a8a', '#2a3a8a'], rim: '#2a3a8a', font: SANS })), 0x202838);
  m.planLoop = em(T(400, 400, signTex(['LOOPS', '○ ○ ○'], { bg: '#f8eee8', cols: ['#8a2a3a', '#8a2a3a'], rim: '#8a2a3a', font: SANS })), 0x302020);
  m.planIdea = em(T(400, 400, signTex(['A FAKE', 'BURR?'], { bg: '#fff8d8', cols: ['#3a2414', '#a8322a'] })), 0x302818);
  m.books = vc({ map: T(256, 256, (g, w, h) => { const R = PT.rng(4); let x = 0; while (x < w) { const bw = 10 + R() * 18; g.fillStyle = ['#8a2a2a', '#2a4a7a', '#3a6a3a', '#c89a3a', '#5a3a6a', '#7a5a3a'][(R() * 6) | 0]; g.fillRect(x, h * (0.05 + R() * 0.1), bw - 2, h); g.fillStyle = 'rgba(255,230,160,0.6)'; g.fillRect(x + 2, h * 0.3, bw - 6, 3); x += bw; } }) });
  m.loopField = toon({ map: T(512, 512, loopsTex({}), [1 / 1.2, 1 / 1.2]), emissive: 0x18142a }); m.furField = toon({ map: T(512, 512, (g, w, h) => { g.fillStyle = '#7a3a22'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.7 + 0.5 * PT.fbm(u, v, 24, 6, 3, 9)); }, [1 / 2, 1 / 2]), emissive: 0x1a0a08 });
  m.hook = toon({ color: 0xffc070, emissive: 0x6a3a10 }); m.loop = toon({ color: 0xf6ecd8, emissive: 0x2a2440 }); m.fur = toon({ color: 0xc8643a, emissive: 0x3a1408 }); m.hookBase = toon({ color: 0x8a5a2a, emissive: 0x2a1408 });
  m.brick = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#9a5a3a', rows: 16, cols: 6, seed: 7 })) }); m.warp = new THREE.MeshBasicMaterial({ map: T(256, 256, warpTex), transparent: true, side: THREE.DoubleSide, alphaTest: 0.2 }); m.warp.color.setScalar(0.9);
  m.cloth = vc({ map: T(256, 256, stripeTex({ base: '#e8dcc0', stripes: '#c85a46' })) }); m.velvet = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#6a2a7a', seed: 9 })) });
  m.cottonSign = em(T(512, 256, signTex(['COTTON'], { bg: '#efe2c0', col: '#3a2414' })), 0x302418); m.nylonSign = em(T(512, 256, signTex(['NYLON'], { bg: '#dff0f8', col: '#1a4a7a', rim: '#1a4a7a' })), 0x203040);
  m.atelier = em(T(1024, 200, signTex(['ATELIER DE TISSAGE', 'LYON'], { bg: '#2a3a4a', cols: ['#f0d070', '#e8dcc0'], rim: '#f0d070' })), 0x202020);
  m.velours = em(T(512, 160, signTex(['VELOURS'], { bg: '#5a1a6a', col: '#f8e8ff', rim: '#f0d070' })), 0x2a1030); m.crochet = em(T(512, 160, signTex(['CROCHET'], { bg: '#1a4a6a', col: '#e8f8ff', rim: '#f0d070' })), 0x102a3a);
  m.velcro = em(T(1024, 240, signTex(['VELCRO'], { bg: '#f8f2e0', col: '#c8322a', rim: '#c8322a', font: SANS })), 0x5a4a30); m.velcro.emissiveIntensity = 1.0;
  m.cal = {}; for (let y = 1941; y <= 1955; y++) m.cal[y] = em(T(256, 320, calTex(y)), 0x302820);
  m.irBulb = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff3a20).multiplyScalar(1.8), fog: false }); m.irOff = vc({ emissive: 0x200808 });
  m.curtain = toon({ map: T(512, 512, curtainTex), emissive: 0x200408 }); m.gilt = vc({ emissive: 0x4a3008 }); m.catwalk = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#f4eee8', n: 6, seed: 61 })) });
  m.showSign = em(T(1024, 220, signTex(['FASHION SHOW', 'THE NEW COLLECTION'], { bg: '#1a1a24', cols: ['#f0d070', '#f4eef8'], rim: '#f0d070' })), 0x504020); m.showSign.emissiveIntensity = 1.1;
  m.bulb = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0c0).multiplyScalar(1.6), fog: false }); m.salonFloor = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#4a2a22', n: 12, seed: 71 })) });
  m.panel = em(T(1024, 512, panelTex), 0x1a2030); m.panel.emissiveIntensity = 0.7; m.hull = toon({ map: T(512, 512, (g, w, h) => PT.metal(g, w, h, { base: '#7a808c' })), color: 0x8a909c, emissive: 0x0a0e18, side: THREE.BackSide });
  m.moonWin = new THREE.MeshBasicMaterial({ map: T(512, 512, spaceTex({})), fog: false }); m.earthWin = new THREE.MeshBasicMaterial({ map: T(512, 512, spaceTex({ earth: 1, c0: '#8ac8ff', c1: '#2a5aa8', x: 0.4, y: 0.5, r: 0.36 })), fog: false });
  m.patch = vc({ map: T(128, 128, loopsTex({ base: '#8a8e98', loop: 'rgba(220,224,232,0.6)' })) }); m.couch = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#c8ccd0', seed: 3 })) }); m.metal = C.metal;
  m.pouch = em(T(256, 256, signTex(['SNACK', 'POUCH'], { bg: '#e8e4d8', cols: ['#2a3a6a', '#6a6a6a'], font: SANS })), 0x202020); m.book = em(T(256, 320, signTex(['CHECK', 'LIST'], { bg: '#f2f0e8', cols: ['#2a2a3a', '#2a2a3a'], font: SANS })), 0x202020);
  return m; }

// ---------------------------------------------------------------- shared props
const tintM = (m, hex) => { const c = new THREE.Color(hex), a = m.geometry.attributes.position.count, arr = new Float32Array(a * 3); for (let i = 0; i < a; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; } m.geometry.setAttribute('color', new THREE.Float32BufferAttribute(arr, 3)); return m; };
function tree(K, x, z, s, R, kind = 'pine') {
  if (kind === 'pine') { K.beam(M.bark, [x, -0.1, z], [x, 1.2 * s, z], 0.14 * s, 0x5a4a3a, true, 6); for (let i = 0; i < 4; i++) K.put(M.leaf, new THREE.ConeGeometry((1.5 - i * 0.3) * s, 1.6 * s, 9), x, (1.4 + i * 0.95) * s, z, 0, R() * 6, 0, 1, 1, 1, [0x2f5a3e, 0x3a6a46, 0x2a4e38][i % 3]); return; }
  K.beam(M.bark, [x, -0.1, z], [x, 2.6 * s, z], 0.11 * s, 0xe8e2d8, true, 6); for (let i = 0; i < 5; i++) { const a = R() * TAU, rr = (0.4 + R() * 0.5) * s; K.put(M.leaf, lumpGeo(i + Math.round(x * 3 + z), 1, 0.3), x + Math.cos(a) * rr * 0.8, (2.7 + R() * 1.4) * s, z + Math.sin(a) * rr * 0.8, 0, R() * 6, 0, 1.1 * s, 1.0 * s, 1.1 * s, [0x7aaa4a, 0x5a8a3a, 0x9aba5a][i % 3]); } }
// one burr ball (3D): a core with short spikes; kit-baked
function burr3(K, x, y, z, r, R) { K.put(M.burr, sph(r, 8, 6), x, y, z, 0, 0, 0, 1, 1, 1, 0x8a6a3a); for (let i = 0; i < 8; i++) { const a = R() * TAU, b = (R() - 0.5) * 2.6; const d = [Math.cos(a) * Math.cos(b), Math.sin(b), Math.sin(a) * Math.cos(b)];
  K.beam(M.burr, [x, y, z], [x + d[0] * r * 1.7, y + d[1] * r * 1.7, z + d[2] * r * 1.7], r * 0.14, 0x6a4a28); } K.put(M.tuft, sph(r * 0.5, 6, 4), x, y + r * 0.85, z, 0, 0, 0, 1, 0.6, 1, 0xa85ac0); }
// a burdock clump: rosette of big heart leaves, stalks with burr heads
function burdock(K, x, z, s, R) { for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + R() * 0.4, L = (0.5 + R() * 0.3) * s, tilt = 0.35 + R() * 0.25; K.put(M.leaf, sph(1, 12, 8), x + Math.cos(a) * L * 0.6, 0.22 * s + R() * 0.12 * s, z + Math.sin(a) * L * 0.6, 0, -a, tilt, L * 0.7, 0.07 * s, L * 0.5, [0x4a7a3a, 0x3e6e34, 0x5a8a44, 0x6a9a4a][i % 4]); K.beam(M.leaf, [x, 0.05, z], [x + Math.cos(a) * L * 0.35, 0.22 * s, z + Math.sin(a) * L * 0.35], 0.02 * s, 0x6a8a3a); }
  for (let k = 0; k < 3; k++) { const a = R() * TAU, top = [x + Math.cos(a) * 0.25 * s, (1.0 + R() * 0.5) * s, z + Math.sin(a) * 0.25 * s]; K.beam(M.leaf, [x, 0, z], top, 0.028 * s, 0x6a5a3a);
    for (let j = 0; j < 7; j++) { const b = j / 7 * TAU; burr3(K, top[0] + Math.cos(b) * 0.12 * s * (j % 2 ? 1 : 0.5), top[1] + (j % 3) * 0.05 * s - 0.04 * s, top[2] + Math.sin(b) * 0.12 * s * (j % 2 ? 1 : 0.5), 0.06 * s, R); } } }

// ================================================================= MEADOW
function buildMeadow(root) { const R = PT.rng(1941), K = new Kit();
  const gr = mesh(root, planeUV(600, 600, 600 / 6, 600 / 6), M.grass, 0, 0, -200, -Math.PI / 2, 0, 0, false); gr.receiveShadow = true;
  // path along x with a gentle S, as stepping slabs of dirt
  mesh(root, planeUV(90, 1.8, 90 / 4, 1.8 / 4), M.path, 0, 0.012, 0, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  // burdock clumps flanking the path, three depths
  for (const [x, z, s] of [[-3.2, -1.6, 1.0], [-1.0, -2.2, 1.2], [1.6, -1.4, 1.0], [3.4, -2.0, 1.3], [-5.5, -2.0, 1.1], [5.8, -1.6, 1.0], [-2.2, 1.9, 0.9], [2.6, 2.1, 1.0], [0.2, -3.6, 1.4], [-7.5, -3.4, 1.2], [7.6, -3.0, 1.2], [-9, 1.6, 1.0], [9.5, 1.8, 1.0], [-12, -2.5, 1.3], [12, -2.6, 1.3]]) burdock(K, x, z, s, R);
  // meadow flowers
  for (let i = 0; i < 260; i++) { const x = (R() - 0.5) * 50, z = -2 - R() * 26; K.put(M.flower, sph(0.05, 5, 4), x, 0.08, z, 0, 0, 0, 1, 1, 1, [0xf8f0f8, 0xf0d040, 0xe070a0, 0x9a7ad8][i % 4]); }
  // split-rail fence
  for (let x = -24; x <= 24; x += 2.4) { K.beam(M.wood, [x, 0, -6], [x, 1.1, -6], 0.06, 0x7a5a3a, true, 5); }
  for (const y of [0.5, 0.95]) K.beam(M.wood, [-24, y, -6], [24, y, -6], 0.045, 0x8a6a48, true, 5);
  // trees
  for (let i = 0; i < 26; i++) { const x = (R() - 0.5) * 80, z = -12 - R() * 40; if (Math.abs(x) < 6 && z > -20) continue; tree(K, x, z, 1.4 + R() * 1.4, R, R() < 0.7 ? 'pine' : 'birch'); }
  for (const [x, z] of [[-14, -4], [15, -5], [-18, 2], [19, 1]]) tree(K, x, z, 1.8, R, 'birch');
  // chalet
  K.at(-13, 0, -24, 0.25, () => { K.box(M.stone, -4, 4, 0, 1.4, -3, 3, 0xd8d0c0, 0.04); K.box(M.wood, -4, 4, 1.4, 4.4, -3, 3, 0x9a6a3a, 0.04);
    for (const s of [-1, 1]) K.put(M.wood, new THREE.BoxGeometry(5.4, 0.3, 7.4), s * 2.2, 5.2, 0, 0, 0, -s * 0.62, 1, 1, 1, 0x6a4030);
    K.box(M.wood, -4.6, 4.6, 2.6, 2.75, 3, 4.2, 0x7a4a2a, 0.02); for (let x = -4.4; x <= 4.4; x += 0.4) K.beam(M.wood, [x, 2.75, 4.15], [x, 3.4, 4.15], 0.03, 0x7a4a2a); K.beam(M.wood, [-4.6, 3.4, 4.15], [4.6, 3.4, 4.15], 0.05, 0x7a4a2a);
    for (const x of [-2.4, 0, 2.4]) { K.box(M.wood, x - 0.55, x + 0.55, 1.8, 2.5, 3.0, 3.05, 0x2a3040, 0.01); K.box(M.flower, x - 0.6, x + 0.6, 1.6, 1.8, 3.0, 3.3, 0x7a4a2a, 0.02); for (let k = 0; k < 5; k++) K.put(M.flower, sph(0.1, 5, 4), x - 0.48 + k * 0.24, 1.88, 3.18, 0, 0, 0, 1, 1, 1, k % 2 ? 0xe03a3a : 0xf06a8a); }
    K.box(M.wood, -0.6, 0.6, 0, 1.4, 3.0, 3.05, 0x5a3420, 0.01); });
  // trail sign
  K.beam(M.wood, [4.4, 0, 1.4], [4.4, 1.6, 1.4], 0.05, 0x6a4a2a, true, 6); K.build(root);
  mesh(root, plane(0.9, 0.36), M.trail, 4.4, 1.42, 1.46, 0, -0.25, 0, false);
  // mountains backdrop: a big curved card
  const mtns = []; for (let i = -1; i <= 1; i++) { const a = i * 0.55, m = mesh(root, plane(520, 260), M.mtn, Math.sin(a) * 300, 70, -300 * Math.cos(a), 0, -a, 0, false); mtns.push(m); }
  // flying burrs pool
  const fly = []; for (let i = 0; i < 14; i++) { const g = new THREE.Group(); const KF = new Kit(); burr3(KF, 0, 0, 0, 0.055, PT.rng(100 + i)); KF.build(g); g.visible = false; root.add(g); fly.push(g); }
  const pollen = motes(root, 80, [-8, 8, 0.2, 3, -4, 3], 51, 0.012);
  return { mtns, fly, pollen };
}

// ================================================================= STUDY
function buildStudy(root) { const R = PT.rng(1942), K = new Kit(), X = 4, ZB = -3, HT = 3.0;
  K.box(M.floor, -X, X, -0.1, 0, ZB, 3, 0xffffff, 0.01); K.box(M.plaster, -X, X, HT, HT + 0.1, ZB, 3, 0xe8dcc4, 0.01);
  const wp = mesh(root, planeUV(2 * X, HT, 2 * X / 2, 1), M.paper, 0, HT / 2, ZB + 0.01, 0, 0, 0, false); wp.receiveShadow = true;
  const wl = mesh(root, planeUV(6, HT, 3, 1), M.paper, -X + 0.01, HT / 2, 0, 0, Math.PI / 2, 0, false); wl.receiveShadow = true;
  K.box(M.wood, -X, X, 0, 0.9, ZB, ZB + 0.04, 0x6a4a30, 0.01); K.box(M.wood, -X, X, 0.88, 0.94, ZB, ZB + 0.07, 0x5a3a24, 0.01); K.box(M.wood, -X, -X + 0.04, 0, 0.9, ZB, 3, 0x6a4a30, 0.01);
  // window (night mountains) with frame
  const win = mesh(root, plane(1.4, 1.2), M.winNight, 2.3, 1.75, ZB + 0.02, 0, 0, 0, false);
  K.box(M.wood, 1.5, 3.1, 1.08, 1.16, ZB, ZB + 0.14, 0xf2eee2, 0.02); K.box(M.wood, 1.5, 3.1, 2.34, 2.42, ZB, ZB + 0.1, 0xf2eee2, 0.02); for (const x of [1.55, 2.3, 3.05]) K.box(M.wood, x - 0.04, x + 0.04, 1.12, 2.4, ZB, ZB + 0.08, 0xf2eee2, 0.01); K.box(M.wood, 1.5, 3.1, 1.72, 1.78, ZB, ZB + 0.06, 0xf2eee2, 0.01);
  // desk
  const D = SCOPE.DESK; K.box(M.wood, -1.0, 1.1, D - 0.05, D, -2.6, -1.75, 0x7a5030, 0.02); for (const [x, z] of [[-0.95, -2.55], [1.05, -2.55], [-0.95, -1.8], [1.05, -1.8]]) K.box(M.wood, x - 0.04, x + 0.04, 0, D - 0.05, z - 0.04, z + 0.04, 0x5a3a24, 0.01);
  K.box(M.wood, 0.45, 1.05, 0.35, D - 0.06, -2.55, -1.8, 0x6a4428, 0.02); for (const y of [0.45, 0.62]) K.put(M.brass, sph(0.02, 6, 4), 0.75, y, -1.79, 0, 0, 0, 1, 1, 1, 0xe0b050);
  // microscope (brass + black): base, pillar, arm, stage, tube, eyepiece
  const [ex, ey, ez] = SCOPE.EYE, mx = ex, mz = ez - 0.02;
  K.box(M.black, mx - 0.11, mx + 0.11, D, D + 0.04, mz - 0.15, mz + 0.08, 0x1e1e26, 0.02); K.beam(M.brass, [mx, D + 0.04, mz - 0.1], [mx, D + 0.24, mz - 0.1], 0.025, 0xc89a3a, true, 8);
  K.box(M.black, mx - 0.09, mx + 0.09, D + 0.16, D + 0.18, mz - 0.07, mz + 0.09, 0x1e1e26, 0.01); K.put(M.brass, cyl(0.02, 0.02, 0.012, 10), mx, D + 0.185, mz + 0.01, 0, 0, 0, 1, 1, 1, 0xf2e8c8);
  K.beam(M.brass, [mx, D + 0.24, mz - 0.1], [mx, D + 0.4, mz - 0.13], 0.03, 0xc89a3a, true, 8); K.beam(M.brass, [mx, D + 0.24, mz + 0.01], [ex, ey - 0.04, ez], 0.032, 0xd8a83a, true, 12);
  K.put(M.black, cyl(0.022, 0.016, 0.05, 10), mx, D + 0.215, mz + 0.01, 0, 0, 0, 1, 1, 1, 0x2a2a30); K.put(M.black, cyl(0.03, 0.03, 0.06, 12), ex, ey, ez, -0.17, 0, 0, 1, 1, 1, 0x1a1a22);
  K.put(M.brass, new THREE.TorusGeometry(0.03, 0.006, 6, 16), ex, ey + 0.03, ez + 0.005, Math.PI / 2 - 0.17, 0, 0, 1, 1, 1, 0xe8c050); K.put(M.brass, cyl(0.03, 0.03, 0.03, 12), mx + 0.05, D + 0.3, mz - 0.11, 0, 0, Math.PI / 2, 1, 1, 1, 0xc89a3a);
  // burr on the slide, papers, ink pot, pipe rack, books on the desk
  burr3(K, mx, D + 0.2, mz + 0.01, 0.012, R); K.box(M.plaster, -0.8, -0.35, D, D + 0.008, -2.3, -1.95, 0xf4eee0, 0.002); K.box(M.plaster, -0.7, -0.25, D + 0.008, D + 0.014, -2.25, -1.9, 0xf8f2e6, 0.002);
  K.put(M.black, cyl(0.035, 0.04, 0.06, 10), -0.2, D + 0.03, -2.4, 0, 0, 0, 1, 1, 1, 0x1a2a4a); K.box(M.books, 0.6, 1.0, D, D + 0.28, -2.55, -2.35, 0xffffff, 0.01);
  // banker's lamp
  K.put(M.brass, cyl(0.08, 0.1, 0.03, 14), -0.65, D + 0.015, -2.35, 0, 0, 0, 1, 1, 1, 0xc89a3a); K.beam(M.brass, [-0.65, D, -2.35], [-0.65, D + 0.34, -2.35], 0.012, 0xc89a3a); K.put(M.lampGreen, cyl(0.06, 0.14, 0.1, 14, true), -0.65, D + 0.38, -2.32, 0.2, 0, 0);
  // bookshelf on the left wall, pictures, coat hook with the cap, a dog bed on a rug
  K.box(M.wood, -X + 0.05, -X + 0.45, 0, 2.3, -2.6, -0.6, 0x5a3a24, 0.02); for (const y of [0.1, 0.65, 1.2, 1.75]) { K.box(M.wood, -X + 0.05, -X + 0.45, y, y + 0.04, -2.6, -0.6, 0x4a3020, 0.01); K.put(M.books, new THREE.BoxGeometry(0.3, 0.42, 1.9), -X + 0.26, y + 0.25, -1.6, 0, 0, 0); }
  for (const [x, y, w, h, c] of [[-1.6, 1.9, 0.6, 0.45, 0x8aa8c8], [-0.6, 2.1, 0.4, 0.5, 0xc8a878], [0.9, 1.85, 0.5, 0.38, 0x9ac888]]) { K.box(M.brass, x - w / 2, x + w / 2, y - h / 2, y + h / 2, ZB, ZB + 0.03, 0xb88a3a, 0.01); K.box(M.plaster, x - w / 2 + 0.04, x + w / 2 - 0.04, y - h / 2 + 0.04, y + h / 2 - 0.04, ZB + 0.03, ZB + 0.035, c, 0.003); }
  K.beam(M.brass, [-3.2, 1.7, ZB], [-3.2, 1.7, ZB + 0.12], 0.015, 0xc89a3a); K.put(M.leaf, sph(0.16, 10, 6), -3.2, 1.62, ZB + 0.15, 0, 0, 0, 1, 0.5, 1, 0x6a5a44);
  K.put(M.velvet, cyl(1.3, 1.3, 0.01, 30), 1.4, 0.005, -0.3, 0, 0, 0, 1, 1, 0.7); K.put(M.leaf, new THREE.TorusGeometry(0.42, 0.12, 8, 20), 2.0, 0.1, -0.6, Math.PI / 2, 0, 0, 1, 1, 1, 0x7a5a8a); K.put(M.leaf, cyl(0.42, 0.42, 0.06, 18), 2.0, 0.04, -0.6, 0, 0, 0, 1, 1, 1, 0xa88ab8);
  // pinboard (for the idea)
  K.box(M.wood, -2.3, -1.2, 1.3, 2.0, ZB, ZB + 0.04, 0x8a6a48, 0.01); K.build(root);
  const plans = [M.planIdea, M.planHook, M.planLoop].map((m, i) => { const p = mesh(root, plane(0.3, 0.3), m, -2.1 + i * 0.36, 1.66 + (i === 0 ? 0.08 : -0.06), ZB + 0.05, 0, 0, (i - 1) * 0.06, false); p.visible = false; return p; });
  const lampG = glowAt(root, [-0.65, D + 0.3, -2.25], 1.2, '#ffd890', 0.55); const eyeG = glowAt(root, [ex, ey + 0.06, ez], 0.25, '#fff0c0', 0);
  const winSh = shaftAt(root, [1.6, 1.2, -2.2], 1.2, 3.2, 0.5, 0.6, 0.1, 0xa8b8ff); const dust = motes(root, 50, [-1.5, 1.5, 0.6, 2.4, -2.6, -0.5], 61, 0.009);
  return { win, plans, lampG, eyeG, winSh, dust };
}

// ================================================================= MICRO (inside the lens)
function hookGeo(L = 0.9, r = 0.035) { return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0, 0, 0], [0, -L * 0.75, 0], [0.04, -L * 0.95, 0], [0.16, -L, 0], [0.26, -L * 0.9, 0], [0.27, -L * 0.75, 0]].map((p) => new THREE.Vector3(...p))), 24, r, 8, false); }
function buildMicro(root) { const R = PT.rng(77), X = 5;
  const base = mesh(root, planeUV(30, 30, 30 / 1.2, 30 / 1.2), M.loopField, 0, 0, -6, -Math.PI / 2, 0, 0, false); base.receiveShadow = true;
  const furBase = mesh(root, planeUV(30, 30, 15, 15), M.furField, 0, 0.005, -6, -Math.PI / 2, 0, 0, false); furBase.receiveShadow = true;
  // loops (fabric): half tori standing on the base
  const loops = new THREE.Group(); root.add(loops); { const K = new Kit(); for (let x = -X; x <= X; x += 0.45) for (let z = -8; z <= 2; z += 0.45) { const j = R(); K.put(M.loop, new THREE.TorusGeometry(0.15 + j * 0.04, 0.03, 6, 14, Math.PI), x + (R() - 0.5) * 0.12, 0, z + (R() - 0.5) * 0.12, 0, R() * 3, 0, 1, 1.4 + j * 0.6, 1, [0xf6ecd8, 0xefe2c8, 0xfaf2e2][(j * 3) | 0]); } K.build(loops); }
  // fur: curly red strands
  const fur = new THREE.Group(); root.add(fur); { const K = new Kit(); for (let i = 0; i < 520; i++) { const x = (R() - 0.5) * 2 * X, z = -8 + R() * 10, h = 0.5 + R() * 0.6, a = R() * TAU, lean = (R() - 0.5) * 0.5, pts = []; for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push(new THREE.Vector3(x + Math.cos(a + t * 7) * 0.12 * t + lean * t * t, h * t, z + Math.sin(a + t * 7) * 0.12 * t)); } K.put(M.fur, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.035 * (1 - 0.3 * R()), 5, false), 0, 0, 0, 0, 0, 0, 1, 1, 1, [0xc8643a, 0xb85a30, 0xd8743e][i % 3]); } K.build(fur); }
  // the hook board (a burr's surface / the hook strip): slab + rows of amber J hooks pointing down
  const press = new THREE.Group(); root.add(press); { const K = new Kit(); K.box(M.hookBase, -3.2, 3.2, 0, 0.25, -4.5, 1.2, 0x8a5a2a, 0.08); const hg = hookGeo(); for (let x = -3; x <= 3; x += 0.5) for (let z = -4.2; z <= 1; z += 0.55) K.put(M.hook, hg, x + (R() - 0.5) * 0.1, 0, z, 0, R() * 6, 0, 1, 0.9 + R() * 0.25, 1, 0xffc070); K.build(press); }
  // the microscope view ring (round vignette) is done by the grade; floating motes as "specimen dust"
  const dust = motes(root, 90, [-4, 4, 0.2, 3, -6, 2], 91, 0.02); const glow = glowAt(root, [0, 2.4, -4], 9, '#7aa8ff', 0.25);
  return { loops, fur, furBase, base, press, dust, glow };
}

// ================================================================= MILL (Lyon)
function buildMill(root) { const R = PT.rng(1948), K = new Kit(), X = 6, ZB = -5, HT = 4.2;
  K.box(M.floor, -X, X, -0.1, 0, ZB, 4, 0xc8b8a0, 0.01); K.box(M.wood, -X, X, HT, HT + 0.2, ZB, 4, 0x5a4030, 0.01);
  K.box(M.brick, -X, X, 0, HT, ZB - 0.3, ZB, 0xffffff, 0.02); K.box(M.brick, -X - 0.3, -X, 0, HT, ZB, 4, 0xffffff, 0.02); for (let x = -X + 1; x < X; x += 2.4) K.box(M.wood, x - 0.12, x + 0.12, HT - 0.4, HT, ZB, 4, 0x4a3426, 0.02);
  // tall windows on the back wall
  for (const x of [-3.6, 3.6]) { K.box(M.wood, x - 0.7, x + 0.7, 1.2, 3.4, ZB, ZB + 0.06, 0xbad0e8, 0.01); for (const xx of [x - 0.7, x, x + 0.7]) K.box(M.wood, xx - 0.04, xx + 0.04, 1.2, 3.4, ZB, ZB + 0.1, 0x3a3040, 0.01); for (const y of [1.2, 2.3, 3.4]) K.box(M.wood, x - 0.74, x + 0.74, y - 0.04, y + 0.04, ZB, ZB + 0.1, 0x3a3040, 0.01); }
  // loom (left): frame, beams, heddles, cloth roll
  const L0 = -3.2, LZ = -2.6; for (const [x, z] of [[L0 - 1.2, LZ - 0.7], [L0 + 1.2, LZ - 0.7], [L0 - 1.2, LZ + 0.7], [L0 + 1.2, LZ + 0.7]]) K.box(M.wood, x - 0.07, x + 0.07, 0, 2.1, z - 0.07, z + 0.07, 0x6a4628, 0.02);
  for (const z of [LZ - 0.7, LZ + 0.7]) K.box(M.wood, L0 - 1.3, L0 + 1.3, 2.0, 2.14, z - 0.08, z + 0.08, 0x6a4628, 0.02); for (const [y, z] of [[1.0, LZ - 0.7], [1.0, LZ + 0.7]]) K.put(M.wood, cyl(0.1, 0.1, 2.3, 12), L0, y, z, 0, 0, Math.PI / 2, 1, 1, 1, 0x7a5434);
  K.put(M.cloth, cyl(0.16, 0.16, 2.2, 16), L0, 0.85, LZ + 0.72, 0, 0, Math.PI / 2); K.box(M.wood, L0 - 1.1, L0 + 1.1, 1.55, 1.62, LZ - 0.1, LZ + 0.1, 0x8a6a48, 0.01); K.box(M.wood, L0 - 1.1, L0 + 1.1, 1.0, 1.04, LZ - 0.4, LZ + 0.5, 0x7a5a38, 0.01);
  // spool racks (right back)
  for (let s = 0; s < 4; s++) { const y = 0.4 + s * 0.6; K.box(M.wood, 1.6, 5.4, y, y + 0.05, ZB + 0.05, ZB + 0.45, 0x5a3e28, 0.01); for (let i = 0; i < 12; i++) { const x = 1.75 + i * 0.31, c = [0xf2f2f6, 0xe85a4a, 0x4a8ad8, 0xf0c840, 0x8ad86a, 0xf2f2f6][(i + s) % 6]; K.put(M.wood, cyl(0.08, 0.08, 0.26, 10), x, y + 0.18, ZB + 0.25, 0, 0, 0, 1, 1, 1, c); K.put(M.wood, cyl(0.1, 0.1, 0.02, 10), x, y + 0.06, ZB + 0.25, 0, 0, 0, 1, 1, 1, 0x7a5a3a); } }
  for (const x of [1.6, 5.4]) K.box(M.wood, x - 0.04, x + 0.04, 0, 2.9, ZB + 0.05, ZB + 0.45, 0x4a3020, 0.01);
  // crates: COTTON (left-front), NYLON (right)
  K.box(M.wood, -1.9, -0.9, 0, 0.7, -1.6, -0.9, 0x9a7048, 0.03); K.box(M.wood, 2.2, 3.2, 0, 0.7, -1.9, -1.2, 0x9a7048, 0.03);
  for (let i = 0; i < 6; i++) { K.put(M.wood, lumpGeo(i + 3, 1, 0.3), -1.75 + (i % 3) * 0.3, 0.78, -1.4 + Math.floor(i / 3) * 0.28, 0, i, 0, 0.15, 0.11, 0.15, 0xf8f4ec); K.put(M.wood, cyl(0.09, 0.09, 0.22, 10), 2.4 + (i % 3) * 0.3, 0.82, -1.7 + Math.floor(i / 3) * 0.28, 0, 0, 0, 1, 1, 1, 0xe8f4ff); }
  // work table + strips on it
  K.box(M.wood, -0.6, 1.6, 0.86, 0.92, -0.9, 0.0, 0x8a6040, 0.02); for (const [x, z] of [[-0.5, -0.8], [1.5, -0.8], [-0.5, -0.1], [1.5, -0.1]]) K.box(M.wood, x - 0.05, x + 0.05, 0, 0.86, z - 0.05, z + 0.05, 0x5a3e28, 0.01);
  for (let i = 0; i < 3; i++) { K.box(M.wood, -0.2 + i * 0.5, 0.15 + i * 0.5, 0.92, 0.94, -0.6, -0.2, i % 2 ? 0xe8c8a0 : 0x7a8ab0, 0.004); }
  // bolts rack for the name: VELOURS (velvet, purple) and CROCHET (hooks, blue)
  K.box(M.wood, -2.1, 0.0, 0.0, 1.3, -4.3, -4.25, 0x5a3e28, 0.01); for (const x of [-2.05, -0.05]) K.box(M.wood, x - 0.04, x + 0.04, 0, 1.3, -4.3, -3.7, 0x4a3020, 0.01); for (const [x, c] of [[-1.5, 0xb85ac8], [-0.6, 0x4a8ad8]]) for (let k = 0; k < 3; k++) K.put(M.wood, cyl(0.13, 0.13, 0.8, 14), x, 0.28 + k * 0.36, -3.95, 0, 0, Math.PI / 2, 1, 1, 1, c);
  // infrared lamp over the table
  K.beam(M.metal, [0.5, HT, -0.45], [0.5, 2.5, -0.45], 0.012, 0x2a2a30); K.put(M.metal, cyl(0.06, 0.24, 0.22, 16, true), 0.5, 2.38, -0.45, 0, 0, 0, 1, 1, 1, 0x4a4a52); K.build(root);
  const ir = mesh(root, sph(0.09, 12, 8), M.irOff, 0.5, 2.26, -0.45, 0, 0, 0, false); const irG = glowAt(root, [0.5, 2.1, -0.45], 2.6, '#ff3a20', 0);
  const warp = mesh(root, plane(2.2, 1.3), M.warp, L0, 1.55, LZ - 0.2, -0.55, 0, 0, false); nond(warp);
  mesh(root, plane(0.9, 0.42), M.cottonSign, -1.4, 0.38, -0.89, 0, 0, 0, false); mesh(root, plane(0.9, 0.42), M.nylonSign, 2.7, 0.38, -1.19, 0, 0, 0, false);
  mesh(root, plane(4.2, 0.82), M.atelier, 0, 3.75, ZB + 0.02, 0, 0, 0, false);
  const cal = mesh(root, plane(0.5, 0.62), M.cal[1941], -5.98, 2.2, -1.2, 0, Math.PI / 2, 0, false);
  const bolts = [mesh(root, plane(0.84, 0.26), M.velours, -1.5, 1.5, -3.75, 0, 0, 0, false), mesh(root, plane(0.84, 0.26), M.crochet, -0.6, 1.5, -3.75, 0, 0, 0, false)];
  const banner = mesh(root, plane(2.4, 0.56), M.velcro, -1.05, 2.25, -3.75, 0, 0, 0, false); banner.visible = false;
  const shafts = [shaftAt(root, [-3.2, 2.0, -3.6], 1.4, 4.4, 0.25, 0.55, 0.16, 0xfff0d0), shaftAt(root, [3.8, 2.0, -3.6], 1.4, 4.4, -0.2, 0.5, 0.14, 0xfff0d0)];
  const dust = motes(root, 80, [-4, 4, 0.5, 3.6, -4, 1], 71, 0.011);
  return { ir, irG, cal, bolts, banner, shafts, dust };
}

// ================================================================= RUNWAY (1950s salon)
function buildRunway(root) { const R = PT.rng(1959), K = new Kit(), X = 7, ZB = -10, HT = 5;
  K.box(M.salonFloor, -X, X, -0.1, 0, ZB, 6, 0xffffff, 0.01); K.box(M.gilt, -X, X, HT, HT + 0.2, ZB, 6, 0x3a2028, 0.01);
  for (const s of [-1, 1]) { K.box(M.plaster, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 6, 0xd8c0a8, 0.02); for (let z = ZB + 1; z < 6; z += 2.4) K.box(M.gilt, s * X - 0.25, s * X + 0.25, 0, HT, z - 0.15, z + 0.15, 0xc8a048, 0.03); }
  // catwalk with bulbs along the edge
  K.box(M.catwalk, -0.8, 0.8, 0, 0.5, ZB + 1, 4, 0xffffff, 0.03); K.box(M.gilt, -0.85, 0.85, 0.46, 0.52, ZB + 1, 4.05, 0xc8a048, 0.01);
  for (let z = ZB + 1.3; z < 4; z += 0.6) for (const s of [-1, 1]) K.put(M.bulb, sph(0.035, 6, 4), s * 0.86, 0.42, z, 0, 0, 0);
  // gilt chairs, rows each side
  for (const s of [-1, 1]) for (let r = 0; r < 2; r++) for (let z = ZB + 2; z < 4; z += 1.1) { const x = s * (1.8 + r * 1.0); K.box(M.velvet, x - 0.22, x + 0.22, 0.42, 0.5, z - 0.2, z + 0.2, 0x8a2a3a, 0.03); K.box(M.gilt, s > 0 ? x + 0.18 : x - 0.22, s > 0 ? x + 0.22 : x - 0.18, 0.5, 1.0, z - 0.2, z + 0.2, 0xc8a048, 0.02); for (const [dx, dz] of [[-0.18, -0.16], [0.18, -0.16], [-0.18, 0.16], [0.18, 0.16]]) K.beam(M.gilt, [x + dx, 0, z + dz], [x + dx, 0.42, z + dz], 0.018, 0xc8a048); }
  // curtains + arch + sign
  K.box(M.gilt, -3.2, 3.2, 3.6, 3.9, ZB + 0.2, ZB + 0.5, 0xc8a048, 0.04); for (const s of [-1, 1]) K.box(M.gilt, s * 3.2 - 0.18, s * 3.2 + 0.18, 0, 3.9, ZB + 0.2, ZB + 0.5, 0xc8a048, 0.04);
  // chandeliers
  const chand = []; for (const z of [-6, -1.5, 3]) { K.beam(M.gilt, [0, HT, z], [0, HT - 0.7, z], 0.015, 0xc8a048); K.put(M.gilt, new THREE.TorusGeometry(0.45, 0.03, 6, 20), 0, HT - 0.75, z, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8b050); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; K.put(M.bulb, sph(0.05, 6, 4), Math.cos(a) * 0.45, HT - 0.68, z + Math.sin(a) * 0.45, 0, 0, 0); } chand.push(z); }
  K.build(root);
  mesh(root, planeUV(14, HT, 1, 1), M.curtain, 0, HT / 2, ZB + 0.05, 0, 0, 0, false); mesh(root, plane(4.4, 0.95), M.showSign, 0, 4.4, ZB + 0.6, 0, 0, 0, false);
  const glows = chand.map((z) => glowAt(root, [0, HT - 0.7, z], 2.2, '#ffe0a0', 0.5)); const flashG = glowAt(root, [-2.2, 1.6, 1.5], 3.5, '#ffffff', 0);
  const shafts = [shaftAt(root, [0, 2.6, -2], 1.6, 5.4, 0, 0, 0.18, 0xfff0d0), shaftAt(root, [0, 2.6, 1.5], 1.6, 5.4, 0, 0, 0.16, 0xfff0d0)];
  return { glows, flashG, shafts };
}

// ================================================================= CAPSULE (Apollo-era, generic)
function buildCapsule(root) { const R = PT.rng(1969), K = new Kit();
  // conical hull around the cabin (apex up), floor bulkhead
  mesh(root, new THREE.CylinderGeometry(1.0, 3.6, 3.6, 40, 1, true), M.hull, 0, 1.8, 0, 0, 0, 0, false); K.box(M.metal, -3, 3, -0.1, 0, -3, 3, 0x9a9ea8, 0.01);
  // main panel arching in front (z = -1.7) tilted back
  const pan = mesh(root, new THREE.CylinderGeometry(1.95, 2.1, 1.3, 40, 1, true, Math.PI * 0.72, Math.PI * 0.56), M.panel, 0, 2.0, 0.2, 0, 0, 0, false); pan.material.side = THREE.DoubleSide;
  // couches (three)
  for (const x of [-0.9, 0, 0.9]) { K.box(M.couch, x - 0.32, x + 0.32, 0.6, 0.72, -0.4, 0.9, 0xc8ccd0, 0.06); K.put(M.couch, new THREE.BoxGeometry(0.64, 0.12, 0.8), x, 0.95, -0.75, -1.0, 0, 0, 1, 1, 1, 0xc8ccd0); K.beam(M.metal, [x, 0, 0.2], [x, 0.6, 0.2], 0.04, 0x7a7e88); }
  // hook-and-loop patches on the walls + items stuck on them
  const HR = (y) => 3.6 - 2.6 * y / 3.6 - 0.06, onWall = (a, y) => { const r = HR(y); return [r * Math.sin(a), y, r * Math.cos(a), a + Math.PI]; };
  const PATCH = [[-2.3, 1.3], [2.3, 1.35], [-2.65, 2.2], [2.65, 2.2], [-1.6, 1.0], [1.6, 1.0]].map(([a, y]) => onWall(a, y));
  for (const [x, y, z, ry] of PATCH) K.cb(M.patch, 0.36, 0.26, 0.02, x, y, z, 0xffffff, 0, ry, 0, 0.01); K.build(root);
  const stuck = [mesh(root, new THREE.BoxGeometry(0.2, 0.26, 0.03), M.book, PATCH[0][0] * 0.98, PATCH[0][1], PATCH[0][2] * 0.98, 0, PATCH[0][3], 0, false), mesh(root, new THREE.BoxGeometry(0.2, 0.24, 0.04), M.pouch, PATCH[1][0] * 0.98, PATCH[1][1], PATCH[1][2] * 0.98, 0, PATCH[1][3], 0, false)];
  // floating loose items (setFloat moves them): pen, pouch, checklist, flashlight, spoon
  const items = []; const mk = (geo, mat, c) => { const m = mesh(root, geo, mat, 0, 0, 0, 0, 0, 0, false); if (c != null) tintM(m, c); items.push(m); return m; };
  mk(cyl(0.012, 0.012, 0.16, 8), M.metal, 0x2a3a8a); mk(new THREE.BoxGeometry(0.18, 0.22, 0.04), M.pouch); mk(new THREE.BoxGeometry(0.2, 0.26, 0.03), M.book); mk(cyl(0.03, 0.03, 0.18, 10), M.metal, 0x3a3a40); mk(new THREE.BoxGeometry(0.14, 0.03, 0.03), M.metal, 0xc8ccd4);
  // portholes
  const win = [mesh(root, new THREE.CircleGeometry(0.28, 24), M.moonWin, -1.15, 2.55, -1.3, -0.3, 0.5, 0, false), mesh(root, new THREE.CircleGeometry(0.28, 24), M.earthWin, 1.15, 2.55, -1.3, -0.3, -0.5, 0, false)];
  { const KR = new Kit(); for (const [x, ry] of [[-1.15, 0.5], [1.15, -0.5]]) KR.put(M.metal, new THREE.TorusGeometry(0.3, 0.04, 6, 24), x, 2.55, -1.29, -0.3, ry, 0, 1, 1, 1, 0x5a5e68); KR.build(root); }
  const glows = [glowAt(root, [0, 2.1, -1.6], 3.2, '#a8d8ff', 0.25), glowAt(root, [-1.15, 2.55, -1.2], 0.9, '#ffffff', 0.4)];
  return { items, stuck, win, glows, PATCH };
}

// ================================================================= lights, grades, API
const SET_LIGHT = {
  meadowDay: { top: '#4a86d8', hor: '#cfe2f6', fog: '#d8e8f4', fogN: 40, fogF: 380, sky: '#a8c0f0', ground: '#5a6a48', hemiI: 0.78, fillCol: '#7d93e6', fillI: 0.36, sunCol: '#ffecc8', sunI: 3.8, az: 30, el: 42, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  meadowGold: { top: '#4a5aa8', hor: '#ffc890', fog: '#f0c8a0', fogN: 30, fogF: 320, sky: '#9a90d8', ground: '#5a4a40', hemiI: 0.88, fillCol: '#7078d8', fillI: 0.34, sunCol: '#ffb070', sunI: 3.5, az: 50, el: 16, disc: '#fff0c8', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff0e0', fxTint: '#fff6ea', shafts: 0.5 },
  meadowDawn: { top: '#3a4a98', hor: '#ffb8a0', fog: '#f0b8b0', fogN: 30, fogF: 320, sky: '#8a90d8', ground: '#4a4048', hemiI: 0.86, fillCol: '#7078d8', fillI: 0.38, sunCol: '#ffc090', sunI: 3.2, az: -50, el: 12, disc: '#fff0d8', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff2ec', fxTint: '#ffffff', shafts: 0.4 },
  study: { top: '#000000', hor: '#2a2028', fog: '#2a2028', fogN: 8, fogF: 40, sky: '#ffe0b0', ground: '#4a3a30', hemiI: 0.8, fillCol: '#6a70c0', fillI: 0.36, sunCol: '#ffd8a0', sunI: 1.6, az: -40, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
  studyNight: { top: '#000000', hor: '#101430', fog: '#101430', fogN: 8, fogF: 40, sky: '#7a7ab8', ground: '#2a2030', hemiI: 0.7, fillCol: '#5a68c0', fillI: 0.42, sunCol: '#a8b8ff', sunI: 1.4, az: 30, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ece8f8', fxTint: '#ffffff', shafts: 0 },
  micro: { top: '#000000', hor: '#0a1030', fog: '#0a1030', fogN: 6, fogF: 26, sky: '#7a8ad8', ground: '#2a2040', hemiI: 0.82, fillCol: '#5a78e0', fillI: 0.5, sunCol: '#d8e4ff', sunI: 2.6, az: -30, el: 55, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#eef0ff', fxTint: '#ffffff', shafts: 0 },
  mill: { top: '#000000', hor: '#3a3038', fog: '#3a3038', fogN: 12, fogF: 50, sky: '#fff0d8', ground: '#4a3a30', hemiI: 0.9, fillCol: '#8a90c8', fillI: 0.34, sunCol: '#fff0d0', sunI: 2.8, az: -25, el: 34, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff4e8', fxTint: '#ffffff', shafts: 0 },
  runway: { top: '#000000', hor: '#2a1420', fog: '#2a1420', fogN: 12, fogF: 50, sky: '#ffd8b0', ground: '#3a2028', hemiI: 0.82, fillCol: '#7a6ac8', fillI: 0.36, sunCol: '#fff0d0', sunI: 2.6, az: 10, el: 60, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0ec', fxTint: '#ffffff', shafts: 0 },
  capsule: { top: '#000000', hor: '#101828', fog: '#101828', fogN: 8, fogF: 30, sky: '#a8b8e8', ground: '#2a2a38', hemiI: 0.62, fillCol: '#6a80d0', fillI: 0.36, sunCol: '#e8f0ff', sunI: 1.5, az: 20, el: 50, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#f0f4ff', fxTint: '#ffffff', shafts: 0 },
};
const IN = { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.08, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.42, 0.78], hal: [0.26, '#ff9a50'], vig: [0.34, 0.46, '#2a1420'] } };
const SET_GRADE = {
  meadowDay: { look: 'day', over: { exp: 1.03, con: 1.2, sat: 1.14, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c8', 0.05], bloom: [0.4, 0.84], vig: [0.24, 0.5, '#3a3a5a'] } },
  meadowGold: { look: 'golden', over: { exp: 1.06, con: 1.22, sat: 1.1, tS: ['#3a3a8a', 0.18], tH: ['#ffc890', 0.1], bloom: [0.42, 0.78], hal: [0.24, '#ffa860'], vig: [0.3, 0.48, '#1e1a3a'] } },
  meadowDawn: { look: 'golden', over: { exp: 1.08, con: 1.2, sat: 1.08, tS: ['#2a3a8a', 0.2], tH: ['#ffc0a0', 0.1], bloom: [0.46, 0.74], hal: [0.28, '#ff9a70'], vig: [0.32, 0.46, '#1a1430'] } },
  study: IN,
  studyNight: { look: 'night', over: { exp: 1.16, con: 1.22, sat: 1.04, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#c0d0ff', 0.1], bloom: [0.5, 0.68], hal: [0.3, '#8090ff'], vig: [0.42, 0.42, '#08081a'] } },
  micro: { look: 'night', over: { exp: 1.18, con: 1.24, sat: 1.12, lift: [0.02, 0.026, 0.07], tS: ['#1a2a8a', 0.28], tH: ['#ffd8a0', 0.12], bloom: [0.55, 0.62], hal: [0.34, '#7a90ff'], vig: [0.62, 0.34, '#04040e'] } },
  mill: { look: 'office', over: { exp: 1.1, con: 1.22, sat: 1.08, lift: [0.035, 0.022, 0.04], tS: ['#3a2a6a', 0.18], tH: ['#ffd090', 0.08], bloom: [0.42, 0.78], hal: [0.24, '#ffa050'], vig: [0.32, 0.46, '#2a1420'] } },
  runway: { look: 'office', over: { exp: 1.12, con: 1.26, sat: 1.12, lift: [0.04, 0.02, 0.04], tS: ['#3a1a5a', 0.22], tH: ['#ffd8a0', 0.1], bloom: [0.5, 0.7], hal: [0.32, '#ffb060'], vig: [0.4, 0.44, '#1a0810'] } },
  capsule: { look: 'night', over: { exp: 1.14, con: 1.2, sat: 1.04, lift: [0.03, 0.03, 0.05], tS: ['#1a2a6a', 0.22], tH: ['#e0ecff', 0.08], bloom: [0.46, 0.72], hal: [0.26, '#90b0ff'], vig: [0.38, 0.44, '#06081a'] } },
};

export function buildVC(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'meadowDay', ir: 0, flash: 0, press: 0, fl: 0 };
  let md, sd, mc, ml, rw, cp;
  const API = makeAPI(ctx, { prefix: 'vc_', origin: VC_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { meadowDay: 'day', meadowGold: 'day', meadowDawn: 'day', study: 'office', studyNight: 'office', micro: 'office', mill: 'office', runway: 'office', capsule: 'office' },
    practicals: (name, F, W3) => { const fl = 1 + 0.05 * Math.sin(F * 0.7) + 0.03 * Math.sin(F * 1.9);
      if (name === 'study') return [{ p: W3('study', [-0.65, 1.15, -2.0]), col: '#ffd890', I: 5.5 * fl, d: 6 }, { p: W3('study', [1.6, 2.4, 0.8]), col: '#ffc890', I: 1.8, d: 8 }, { p: W3('study', [2.3, 1.8, -2.4]), col: '#8a9aff', I: 1.6, d: 6 }];
      if (name === 'studyNight') return [{ p: W3('study', [-0.65, 1.15, -2.0]), col: '#ffc070', I: 4.2 * fl, d: 5 }, { p: W3('study', [2.3, 1.8, -2.2]), col: '#7a8aff', I: 3.2, d: 8 }, { p: W3('study', [SCOPE.EYE[0], SCOPE.EYE[1] + 0.1, SCOPE.EYE[2] + 0.2]), col: '#fff0c0', I: 1.4, d: 2 }];
      if (name === 'micro') return [{ p: W3('micro', [0, 3.2, 0.5]), col: '#ffd8a0', I: 5, d: 9 }, { p: W3('micro', [-3, 1.5, -3]), col: '#6a8aff', I: 4, d: 9 }, { p: W3('micro', [3, 1.2, 1]), col: '#ff9ac0', I: 2.2, d: 7 }];
      if (name === 'mill') return [{ p: W3('mill', [0.5, 2.0, -0.45]), col: '#ff4a2a', I: 9 * ST.ir * fl, d: 5 }, { p: W3('mill', [-3, 3, -3]), col: '#fff0d0', I: 2.4, d: 10 }, { p: W3('mill', [2.5, 3, 1.5]), col: '#ffd8a0', I: 2.2, d: 9 }];
      if (name === 'runway') return [{ p: W3('runway', [0, 4.2, -1.5]), col: '#ffe0a0', I: 6, d: 10 }, { p: W3('runway', [0, 4.2, 3]), col: '#ffd8a0', I: 4, d: 9 }, { p: W3('runway', [-2.2, 1.8, 1.5]), col: '#ffffff', I: 30 * ST.flash, d: 8 }];
      if (name === 'capsule') return [{ p: W3('capsule', [0, 2.4, 0.9]), col: '#e8f0ff', I: 2.0, d: 5 }, { p: W3('capsule', [0, 2.0, -1.2]), col: '#8ac0ff', I: 2.2, d: 4 }, { p: W3('capsule', [-1.1, 2.5, -1.0]), col: '#ffffff', I: 1.4, d: 4 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'meadow' && md) { tickMotes(md.pollen, f, 0.5); md.mtns.forEach((m) => (m.material = ST.mood === 'meadowGold' ? M.mtnG : ST.mood === 'meadowDawn' ? M.mtnD : M.mtn)); }
      if (cur === 'study' && sd) { tickMotes(sd.dust, f, 0.3); sd.lampG.material.opacity = (ST.mood === 'studyNight' ? 0.42 : 0.55) * (0.95 + 0.05 * Math.sin(f * 0.8)); sd.winSh.visible = ST.mood === 'studyNight'; }
      if (cur === 'micro' && mc) { tickMotes(mc.dust, f, 0.4); mc.glow.material.opacity = 0.22 + 0.04 * Math.sin(f * 0.1); }
      if (cur === 'mill' && ml) { tickMotes(ml.dust, f, 0.3); const fl = 0.9 + 0.1 * Math.sin(f * 0.9); ml.irG.material.opacity = 0.75 * ST.ir * fl; ml.ir.material = ST.ir > 0.1 ? M.irBulb : M.irOff; }
      if (cur === 'runway' && rw) { rw.flashG.material.opacity = 0.9 * ST.flash; rw.glows.forEach((g, i) => (g.material.opacity = 0.45 + 0.05 * Math.sin(f * 0.3 + i))); }
      if (cur === 'capsule' && cp) { const t = ST.fl; cp.items.forEach((m, i) => { const a = T * (0.4 + i * 0.13) + i; m.position.set(-0.8 + i * 0.4 + 0.15 * Math.sin(a), 1.7 + 0.25 * Math.sin(a * 0.7 + i) + 0.05 * i, -0.1 + 0.2 * Math.cos(a * 0.9)); m.rotation.set(a * 0.6, a * 0.8 + i, a * 0.3);
        if (t > 0) { const P = cp.PATCH[[2, 3, 4, 5, 2][i]], stick = [P[0] * 0.97, P[1] + (i === 4 ? 0.08 : 0), P[2] * 0.97]; const k = sm(i * 0.12, i * 0.12 + 0.4, t); m.position.lerp(new THREE.Vector3(...stick), k); m.rotation.x *= 1 - k; m.rotation.z *= 1 - k; } }); } },
    glows: {},
    mood: (name) => { ST.mood = name; },
    apply: (v) => { if (v.press != null) API.setPress(v.press); if (v.fur != null) API.setMicro(v.fur); if (v.ir != null) API.setIR(v.ir); if (v.year != null) API.setYear(v.year); if (v.name != null) API.setName(v.name); if (v.plan != null) API.setPlan(v.plan); } });
  md = buildMeadow(API.groups.meadow); sd = buildStudy(API.groups.study); mc = buildMicro(API.groups.micro); ml = buildMill(API.groups.mill); rw = buildRunway(API.groups.runway); cp = buildCapsule(API.groups.capsule);
  API.parts = { md, sd, mc, ml, rw, cp };
  // meadow: flying burrs: list of [x, y, z, spin] in meadow-local coords (null hides)
  API.setFly = (L = []) => { md.fly.forEach((g, i) => { const p = L[i]; g.visible = !!p; if (p) { g.position.set(p[0], p[1], p[2]); g.rotation.set(p[3] || 0, (p[3] || 0) * 1.3, 0); g.scale.setScalar(p[4] || 1); } }); };
  // study: pinboard sketches k: 0 none, 1 idea, 2 +hooks, 3 +loops
  API.setPlan = (k) => { sd.plans.forEach((p, i) => (p.visible = k > i)); };
  API.setEye = (k) => { sd.eyeG.material.opacity = k; };
  // micro: fur (1) vs fabric loops (0); hook board press 0 (up) .. 1 (hooks in among the loops); then lift with grab
  API.setMicro = (fur) => { mc.fur.visible = fur > 0.5; mc.furBase.visible = fur > 0.5; mc.loops.visible = fur <= 0.5; mc.base.visible = fur <= 0.5; };
  API.setPress = (t, lift = 0) => { ST.press = t; mc.press.position.set(0, 3.4 - 2.15 * clamp01(t) + 0.35 * lift, 0); const pull = lift * 0.35; mc.loops.position.y = pull; mc.fur.position.y = pull; };
  // mill: infrared lamp 0..1, wall calendar year, the name (0 bolts only, 1 banner)
  API.setIR = (k) => { ST.ir = clamp01(k); };
  API.setYear = (y) => { const yy = Math.max(1941, Math.min(1955, Math.round(y))); ml.cal.material = M.cal[yy]; };
  API.setName = (k) => { ml.banner.visible = k > 0.5; };
  API.setFlash = (k) => { ST.flash = k; };
  API.setFloat = (t) => { ST.fl = t; };
  API.glows = { meadow: [], study: [sd.lampG, sd.eyeG], micro: [mc.glow], mill: [ml.irG], runway: [...rw.glows, rw.flashG], capsule: cp.glows };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  const V = API.V, [ex, ey, ez] = SCOPE.EYE;
  API.views = [
    V('meadowDay', [0.6, 1.2, 6.5], [0, 0.7, -1], 44, 1.2, [0, 0.6, 0]), // 0 meadow path, burdock
    V('meadowGold', [-3, 1.6, 9], [1, 1.2, -4], 46, 0.8, [0, 0.8, 0]), // 1 golden walk wide
    V('meadowDawn', [2, 1.4, 7], [-1, 1.4, -6], 48, 0.8, [0, 0.8, 0]), // 2 dawn
    V('study', [1.6, 1.5, 1.4], [0, 1.0, -2.2], 46, 1.4, [0.2, 1.0, -2.1], { plan: 3 }), // 3 study wide
    V('studyNight', [ex + 0.35, ey + 0.12, ez + 0.6], [ex, ey - 0.15, ez], 40, 2.4, [ex, ey - 0.1, ez]), // 4 microscope close
    V('micro', [0.6, 1.4, 4.2], [0, 0.6, -1], 50, 1.4, [0, 0.6, 0], { press: 0.75 }), // 5 micro hooks + loops
    V('micro', [0.6, 1.2, 3.6], [0, 0.5, -1], 50, 1.4, [0, 0.5, 0], { press: 0.4, fur: 1 }), // 6 micro fur
    V('mill', [1.6, 1.7, 4.6], [0, 1.4, -2], 48, 1.2, [0.4, 1.2, -0.5], { ir: 1, year: 1948 }), // 7 mill wide
    V('mill', [-0.6, 1.8, 2.4], [-1.0, 1.9, -3.6], 44, 1.2, [-1.0, 1.9, -3.6], { name: 1 }), // 8 name bolts + banner
    V('runway', [2.6, 1.7, 6.0], [0, 1.4, -4], 48, 1.0, [0, 1.2, 0]), // 9 runway
    V('capsule', [0, 1.6, 1.8], [0, 1.7, -1], 62, 1.4, [0, 1.7, -0.6]), // 10 capsule
    V('meadowDay', [-12, 3.2, 14], [-13, 3.0, -24], 36, 0.6, [-13, 2, -24]), // 11 chalet + peaks
  ];
  API.setFly([]); API.setPlan(0); API.setEye(0); API.setMicro(0); API.setPress(0); API.setIR(0); API.setYear(1941); API.setName(0); API.setFloat(0); API.tick(0);
  return API;
}
