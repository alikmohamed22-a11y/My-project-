// mt_sets.js [MT-sets]: sets for "The first computer bug was a real moth" (Harvard Mark II, 9 Sept 1947). Oddverra short.
//   lab    : the Mark II room at Harvard, 1947. A long back row of 14 steel relay panels (A..N, Panel F hero with a hinged door) and a
//            side row along the left wall, ~2,600 instanced relays whose armatures flicker as they click, amber indicator lamps, cable
//            trays, clerestory windows with sun shafts, an operator console (typewriter, paper-tape reader with moving tape, the
//            logbook, desk lamp), wall clock at 3:45, a wall calendar (SEPT 1947, the 9th circled), a crimson HARVARD pennant and a
//            red trouble lamp (setAlarm). Torch pools on the panels for the hunt (setSpots). Moods 'lab', 'labCal', 'labAlarm',
//            'labHunt', 'labJoke'.                                                                               origin (-142000,0,0)
//   relay  : macro set inside Panel F: Relay #70 the size of a room (1 unit ~ 1 cm): bakelite base, copper coil, iron yoke, a
//            pivoting armature (setClick) and brass contact springs where the moth is wedged; neighbouring relays recede in rows,
//            wire looms, a torch beam (setTorch). Mood 'relay'.                                                    (-142000,0,800)
//   desk   : macro logbook on the console: two ruled pages; the 1545 entry writes itself in (setWrite) as a pencil moves; the flat
//            moth drops onto the page (setMothDrop) and a strip of tape slaps over it (setTape); 'actual' circled (setCircle);
//            the taped moth's face (setMothFace). Moods 'desk', 'deskQ'.                                         (-144500,0,0)
//   edison : an 1870s inventor's workshop at night: benches, battery jars, telegraph sounder, bottles, gas lamp, a letter on the
//            desk with "Bugs". Mood 'edison' (night blue + gas light).                                           (-144500,0,800)
//   museum : a history-museum gallery: a lit glass case holding the logbook page with the moth (same page texture), a placard,
//            other exhibits (a relay panel, a console), wall lettering. Moods 'museum', 'museumGold'.            (-144500,0,1600)
// Each set: local frame, camera side +z. Test flag ?mtview=N (main.js).
import { H, TAU, clamp01, sm, SERIF, SANS, cyl, sph, plane, planeUV, mesh, nond, lumpGeo, txt, grain, scrib, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';

export const MT_ORIGIN = { lab: [-142000, 0, 0], relay: [-142000, 0, 800], desk: [-144500, 0, 0], edison: [-144500, 0, 800], museum: [-144500, 0, 1600] };
const GROUP_OF = { lab: 'lab', labCal: 'lab', labAlarm: 'lab', labHunt: 'lab', labJoke: 'lab', relay: 'relay', desk: 'desk', deskQ: 'desk', edison: 'edison', museum: 'museum', museumGold: 'museum' };
// lab layout: back row of panels along z = ZP, x from PX0, panel width PW; Panel F is index 5
export const LAB = { ZP: -5.0, PX0: -9.4, PW: 1.2, PH: 2.45, PD: 0.7, NP: 14, F: 5, CON: [3.6, 0, 1.2], SIDEX: -9.0 };
LAB.FX = LAB.PX0 + (LAB.F + 0.5) * LAB.PW; // Panel F centre x (-2.8)
export const RELAY = { CX: 8.4, CY: 2.3, CZ: 0.0 }; // moth wedge point in the relay set (between the contact springs)
export const DESK = { MOTH: [1.66, 0.0, -0.12] }; // flat moth spot on the page (set-local, page plane y = 0.0)
let THREE, PT, M;
const vcol = (g) => { g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 3).fill(1), 3)); return g; };
const tintM = (m, hex) => { const c = new THREE.Color(hex), a = m.geometry.attributes.position.count, arr = new Float32Array(a * 3); for (let i = 0; i < a; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; } m.geometry.setAttribute('color', new THREE.Float32BufferAttribute(arr, 3)); return m; };
const HAND = '"DejaVu Serif", Georgia, serif';

// ---------------------------------------------------------------- painters
function plasterTex(o) { return (g, w, h) => { g.fillStyle = o.base; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.88 + 0.16 * PT.fbm(u, v, 5, 5, 4, o.seed || 4)); grain(g, w, h, 'rgba(80,60,40,1)', 500, 3, 0.12); }; }
function linoTex(g, w, h) { const n = 8, s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? '#3a5a4a' : '#d8ccb0'; g.fillRect(i * s, j * s, s, s); }
  PT.modulate(g, w, h, (u, v) => 0.84 + 0.22 * PT.fbm(u, v, 6, 6, 4, 9)); g.strokeStyle = 'rgba(30,24,20,0.35)'; g.lineWidth = 2; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); } }
function steelTex(g, w, h) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.14 * PT.fbm(u, v, 3, 12, 3, 5)); g.strokeStyle = 'rgba(40,40,50,0.25)'; g.lineWidth = 2; for (let y = 0; y < h; y += h / 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = 'rgba(30,30,40,0.5)'; for (let y = h / 12; y < h; y += h / 6) for (const x of [w * 0.06, w * 0.94]) { g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill(); } }
function loomTex(g, w, h) { g.fillStyle = '#1a1a22'; g.fillRect(0, 0, w, h); const R = PT.rng(70), cols = ['#c83a2a', '#e8d8b0', '#3a6ab0', '#2a8a4a', '#e8b040', '#6a6a74'];
  for (let i = 0; i < 70; i++) { const x = R() * w; g.strokeStyle = cols[i % cols.length]; g.globalAlpha = 0.6 + R() * 0.4; g.lineWidth = 2 + R() * 3; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + (R() - 0.5) * 40, h * 0.3, x + (R() - 0.5) * 40, h * 0.7, x + (R() - 0.5) * 30, h); g.stroke(); } g.globalAlpha = 1; }
function plateTex(s, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#ece6d4'; g.fillRect(0, 0, w, h); g.strokeStyle = o.rim || '#2a2a34'; g.lineWidth = h * 0.08; g.strokeRect(h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12);
  txt(g, s, w / 2, h * 0.55, w * 0.84, h * (o.sz || 0.62), { col: o.col || '#1e1e28', font: o.font || SANS }); }; }
function calTex(g, w, h) { g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, w, h); g.fillStyle = '#a82a2a'; g.fillRect(0, 0, w, h * 0.2); txt(g, 'SEPTEMBER', w / 2, h * 0.08, w * 0.8, h * 0.09, { col: '#fff4e0', font: SANS }); txt(g, '1947', w / 2, h * 0.16, w * 0.5, h * 0.06, { col: '#fff4e0', font: SANS });
  const days = 'SMTWTFS'; for (let i = 0; i < 7; i++) txt(g, days[i], w * (0.1 + i * 0.133), h * 0.25, w * 0.1, h * 0.04, { col: '#5a3a3a', font: SANS });
  for (let d = 1; d <= 30; d++) { const k = d, c = k % 7, r = Math.floor(k / 7), x = w * (0.1 + c * 0.133), y = h * (0.33 + r * 0.12); txt(g, String(d), x, y, w * 0.1, h * 0.06, { col: c === 0 ? '#a82a2a' : '#2a2a34', font: SANS });
    if (d === 9) { g.strokeStyle = '#d82a2a'; g.lineWidth = 6; g.beginPath(); g.ellipse(x, y, w * 0.07, h * 0.045, -0.1, 0, TAU); g.stroke(); } }
  PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 2)); }
function pennantTex(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = '#a51c30'; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h / 2); g.lineTo(0, h); g.closePath(); g.fill(); g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, w * 0.06, h);
  txt(g, 'HARVARD', w * 0.4, h * 0.5, w * 0.58, h * 0.3, { col: '#f8f0e0', font: SERIF }); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 6, 2, 3, 4)); }
function clockTex(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = '#f6f0e2'; g.beginPath(); g.arc(w / 2, h / 2, w * 0.48, 0, TAU); g.fill(); g.lineWidth = w * 0.04; g.strokeStyle = '#2a2a34'; g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r0 = w * 0.36, r1 = w * 0.43; g.lineWidth = i % 3 ? 3 : 7; g.beginPath(); g.moveTo(w / 2 + Math.sin(a) * r0, h / 2 - Math.cos(a) * r0); g.lineTo(w / 2 + Math.sin(a) * r1, h / 2 - Math.cos(a) * r1); g.stroke(); } }
function wiresTex(g, w, h) { g.fillStyle = '#c87a3a'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 4) { g.fillStyle = y % 8 ? 'rgba(255,220,160,0.5)' : 'rgba(90,40,10,0.5)'; g.fillRect(0, y, w, 2); } PT.modulate(g, w, h, (u, v) => 0.85 + 0.2 * PT.fbm(u, v, 2, 8, 3, 6)); }
function bakeliteTex(g, w, h) { g.fillStyle = '#3a2418'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.8 + 0.4 * PT.fbm(u, v, 6, 3, 4, 3)); txt(g, 'RELAY  #70', w / 2, h * 0.5, w * 0.8, h * 0.36, { col: 'rgba(240,220,170,0.85)', font: SANS }); }
function letterTex(g, w, h) { g.fillStyle = '#efe2c0'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.18 * PT.fbm(u, v, 4, 4, 3, 8)); const R = PT.rng(1878);
  txt(g, 'Menlo Park, 1878', w * 0.62, h * 0.08, w * 0.6, h * 0.045, { col: 'rgba(40,30,60,0.85)', font: HAND, italic: true, bold: false });
  for (let i = 0; i < 9; i++) scrib(g, w * 0.08, h * (0.18 + i * 0.07), w * (i === 8 ? 0.5 : 0.84), h * 0.04, R, 'rgba(40,30,60,0.8)');
  txt(g, '"Bugs"', w * 0.42, h * 0.84, w * 0.5, h * 0.11, { col: 'rgba(30,20,60,0.95)', font: HAND, italic: true });
  g.strokeStyle = 'rgba(200,40,40,0.0)'; scrib(g, w * 0.1, h * 0.93, w * 0.3, h * 0.04, R, 'rgba(40,30,60,0.8)'); }
function shelfTex(g, w, h) { g.fillStyle = '#2a1e18'; g.fillRect(0, 0, w, h); const R = PT.rng(9); for (let s = 0; s < 4; s++) { const y = h * (0.25 + s * 0.25); g.fillStyle = '#6a4a2a'; g.fillRect(0, y - 8, w, 10);
  for (let x = 6; x < w - 20; x += 14 + R() * 18) { const bh = 30 + R() * 60, bw = 10 + R() * 14; g.fillStyle = ['#3a6a5a', '#8a5a2a', '#c8b890', '#5a3a6a', '#2a4a7a'][Math.floor(R() * 5)]; g.fillRect(x, y - 8 - bh, bw, bh); g.fillStyle = 'rgba(255,240,200,0.3)'; g.fillRect(x + 2, y - 6 - bh, 2, bh - 4); } } }
function museumWallTex(g, w, h) { g.fillStyle = '#24305a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.85 + 0.2 * PT.fbm(u, v, 4, 4, 3, 12)); }
function museumSignTex(g, w, h) { g.clearRect(0, 0, w, h); txt(g, 'NATIONAL MUSEUM OF', w / 2, h * 0.3, w * 0.9, h * 0.26, { col: '#e8d8a8', font: SERIF }); txt(g, 'AMERICAN HISTORY', w / 2, h * 0.72, w * 0.96, h * 0.36, { col: '#f4e8c0', font: SERIF }); }
function placardTex(g, w, h) { g.fillStyle = '#f2ece0'; g.fillRect(0, 0, w, h); txt(g, 'LOG BOOK WITH', w / 2, h * 0.2, w * 0.9, h * 0.14, { col: '#1e1e28', font: SANS }); txt(g, 'COMPUTER BUG', w / 2, h * 0.38, w * 0.9, h * 0.16, { col: '#a82a2a', font: SANS });
  txt(g, 'Harvard Mark II, Sept. 9, 1947', w / 2, h * 0.58, w * 0.9, h * 0.09, { col: '#3a3a44', font: SERIF, bold: false }); const R = PT.rng(4); for (let i = 0; i < 3; i++) g.fillRect(w * 0.1, h * (0.72 + i * 0.08), w * (i === 2 ? 0.5 : 0.8), h * 0.025); }
function frameArtTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#d8c090'); gr.addColorStop(1, '#a88050'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#4a3a2a'; g.fillRect(w * 0.2, h * 0.3, w * 0.6, h * 0.5);
  g.fillStyle = '#e8b040'; for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(w * (0.28 + (i % 4) * 0.15), h * (0.4 + Math.floor(i / 4) * 0.14), 6, 0, TAU); g.fill(); } }

// the logbook page (dynamic): ruled lines, scribbled earlier entries, the 1545 entry written up to `wr` (0..1), 'actual' circled (circ)
const ENTRY = [['1545', 'Relay #70 Panel F'], ['', '(moth) in relay.'], ['', 'First actual case of bug being found.']];
export function drawPage(g, w, h, st) { g.fillStyle = '#f2ead2'; g.fillRect(0, 0, w, h); const R = PT.rng(1947);
  if (!drawPage.noise) { const c = document.createElement('canvas'); c.width = w; c.height = h; const cg = c.getContext('2d'); cg.fillStyle = '#ffffff'; cg.fillRect(0, 0, w, h); PT.modulate(cg, w, h, (u, v) => 0.9 + 0.1 * PT.fbm(u, v, 5, 5, 3, 3) - 0.06 * Math.max(0, Math.abs(u - 0.5) * 2 - 0.7) * 3); drawPage.noise = c; }
  g.globalCompositeOperation = 'multiply'; g.drawImage(drawPage.noise, 0, 0); g.globalCompositeOperation = 'source-over';
  g.strokeStyle = 'rgba(90,120,170,0.5)'; g.lineWidth = 2; const LH = h / 22; for (let i = 2; i < 22; i++) { g.beginPath(); g.moveTo(0, i * LH); g.lineTo(w, i * LH); g.stroke(); }
  g.strokeStyle = 'rgba(200,60,60,0.55)'; g.beginPath(); g.moveTo(w * 0.17, 0); g.lineTo(w * 0.17, h); g.stroke();
  txt(g, '9/9', w * 0.5, LH * 1.1, w * 0.2, LH * 0.9, { col: 'rgba(30,30,60,0.9)', font: HAND, italic: true, bold: false });
  const ink = 'rgba(30,30,70,0.88)';
  for (let i = 2; i < 9; i++) { scrib(g, w * 0.03, LH * (i + 0.8), w * 0.1, LH * 0.5, R, ink); scrib(g, w * 0.2, LH * (i + 0.8), w * (0.35 + R() * 0.4), LH * 0.55, R, ink); }
  // the moth entry, rows 10-12, written left to right by wr
  const total = ENTRY.reduce((n, [a, b]) => n + a.length + b.length, 0); let left = Math.round(clamp01(st.wr) * total);
  g.save(); g.fillStyle = ink; g.textBaseline = 'alphabetic'; const fs = LH * 0.72;
  ENTRY.forEach(([t, s], r) => { const y = LH * (11 + r) - LH * 0.18;
    for (const [str, x0, size] of [[t, w * 0.03, fs], [s, w * 0.2, fs]]) { if (!str) continue; const n = Math.min(str.length, Math.max(0, left)); left -= str.length; if (n <= 0) continue; g.font = `italic ${size | 0}px ${HAND}`; const full = g.measureText(str).width, maxW = w * 0.78, sx = Math.min(1, maxW / full);
      g.save(); g.translate(x0, y); g.scale(sx, 1); g.fillText(str.slice(0, n), 0, 0); g.restore();
      if (r === 2 && str.startsWith('First') && st.circ > 0) { const pre = g.measureText('First ').width * sx, aw = g.measureText('actual').width * sx, cx = x0 + pre + aw / 2, cy = y - fs * 0.32;
        g.strokeStyle = 'rgba(220,40,40,0.95)'; g.lineWidth = 6; g.beginPath(); g.ellipse(cx, cy, aw * 0.62, fs * 0.72, -0.06, -Math.PI / 2, -Math.PI / 2 + TAU * clamp01(st.circ)); g.stroke(); }
      st.pen = [x0 + g.measureText(str.slice(0, n)).width * sx, y]; } });
  g.restore();
  for (let i = 14; i < 20; i++) if (st.later) scrib(g, w * 0.2, LH * (i + 0.8), w * (0.3 + R() * 0.3), LH * 0.55, R, ink);
}
// flat moth decal (top view), face: 'daze' | 'smile' | 'wink' | 'none'
export function drawMothFlat(g, w, h, face = 'daze') { g.clearRect(0, 0, w, h); g.save(); g.translate(w / 2, h / 2); const S = w / 600, INK = '#2b1d4a';
  const wing = (s, up) => { const p = new Path2D(); if (up) { p.moveTo(s * 20, -30); p.bezierCurveTo(s * 120, -170, s * 290, -150, s * 270, -40); p.bezierCurveTo(s * 250, 10, s * 120, 20, s * 20, 10); }
    else { p.moveTo(s * 20, 10); p.bezierCurveTo(s * 150, 30, s * 220, 120, s * 170, 170); p.bezierCurveTo(s * 110, 200, s * 40, 120, s * 14, 60); } p.closePath(); return p; };
  g.scale(S, S); for (const s of [-1, 1]) for (const up of [false, true]) { const p = wing(s, up), gr = g.createLinearGradient(0, -150, s * 260, 100); gr.addColorStop(0, up ? '#8a6e56' : '#7a604a'); gr.addColorStop(1, up ? '#5e4636' : '#4e3a2c'); g.fillStyle = gr; g.fill(p);
    g.save(); g.clip(p); g.fillStyle = 'rgba(30,20,16,0.45)'; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(s * (70 + i * 40), up ? -60 + i * 6 : 80, 14, 8, 0, 0, TAU); g.fill(); } g.fillStyle = 'rgba(58,42,122,0.22)'; g.fillRect(s > 0 ? 0 : -300, 20, 300, 200); g.restore();
    g.lineWidth = 6; g.strokeStyle = INK; g.stroke(p); }
  const b = new Path2D(); b.ellipse(0, 20, 34, 110, 0, 0, TAU); g.fillStyle = '#5e4a3c'; g.fill(b); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(b);
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-28, 50 + i * 22); g.quadraticCurveTo(0, 58 + i * 22, 28, 50 + i * 22); g.lineWidth = 3; g.stroke(); }
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 10, -84); g.quadraticCurveTo(s * 50, -170, s * 90, -190); g.lineWidth = 5; g.stroke(); for (let i = 0; i < 6; i++) { const t = 0.3 + i * 0.12, x = s * (10 + 80 * t), y = -84 - 106 * t; g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * 14, y + 6); g.lineWidth = 3; g.stroke(); } }
  const hd = new Path2D(); hd.ellipse(0, -70, 46, 40, 0, 0, TAU); g.fillStyle = '#b89e86'; g.fill(hd); g.lineWidth = 6; g.stroke(hd);
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 30, -54, 10, 5, 0, 0, TAU); g.fillStyle = 'rgba(255,110,140,0.7)'; g.fill(); }
  for (const s of [-1, 1]) { const x = s * 18, y = -76;
    if (face === 'daze') { g.beginPath(); for (let a = 0; a < 10; a += 0.3) g.lineTo(x + Math.cos(a) * a * 0.9, y + Math.sin(a) * a * 0.9); g.lineWidth = 3; g.stroke(); }
    else if (face === 'wink' && s > 0) { g.beginPath(); g.moveTo(x - 9, y + 2); g.quadraticCurveTo(x, y - 8, x + 9, y + 2); g.lineWidth = 4; g.stroke(); }
    else if (face !== 'none') { g.beginPath(); g.ellipse(x, y, 7, 10, 0, 0, TAU); g.fillStyle = INK; g.fill(); g.beginPath(); g.arc(x - 2, y - 4, 2.4, 0, TAU); g.fillStyle = '#fff'; g.fill(); } }
  if (face === 'daze') { g.beginPath(); g.ellipse(0, -52, 7, 5, 0, 0, TAU); g.fillStyle = '#7a2238'; g.fill(); } else if (face !== 'none') { g.beginPath(); g.moveTo(-12, -56); g.quadraticCurveTo(0, -46, 12, -56); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); }
  g.restore(); }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.plaster = vc({ map: T(512, 512, plasterTex({ base: '#e6dcc4', seed: 4 })) }); m.wains = vc({ map: T(512, 512, plasterTex({ base: '#4a6a5a', seed: 6 })) });
  m.lino = toon({ map: T(512, 512, linoTex, [1 / 2.4, 1 / 2.4]) }); m.steel = vc({ map: T(256, 512, steelTex) }); m.loom = em(T(256, 512, loomTex), 0x101014);
  m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 6, seed: 47 })) }); m.floorWood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#6a4a30', n: 8, seed: 49 })) });
  m.relay = vc({ emissive: 0x08060a }); m.copper = vc({ map: T(128, 512, wiresTex), emissive: 0x2a1406 }); m.bake = vc({ map: T(512, 128, bakeliteTex), emissive: 0x0a0604 });
  m.lampOn = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb040).multiplyScalar(1.6), fog: true }); m.lampOff = toon({ color: 0x5a3a20 });
  m.red = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff3020), fog: true });
  m.cal = em(T(512, 640, calTex), 0x302820); m.pennant = new THREE.MeshLambertMaterial({ map: T(512, 200, pennantTex), transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, emissive: 0x401010 });
  m.clock = new THREE.MeshBasicMaterial({ map: T(256, 256, clockTex), transparent: true, alphaTest: 0.3, fog: true }); m.clock.color.setScalar(0.95);
  m.sky = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xdcecff).multiplyScalar(1.3), fog: false });
  m.plates = 'ABCDEFGHIJKLMNOPQRSTU'.split('').map((L) => em(T(128, 96, plateTex(L, { sz: 0.7 })), 0x303030));
  m.plateF = em(T(256, 96, plateTex('PANEL F', { sz: 0.56, bg: '#f6f0d8' })), 0x404030); m.plate70 = em(T(256, 96, plateTex('#70', { sz: 0.66, bg: '#f6f0d8', col: '#a82a2a' })), 0x404030);
  m.tape = new THREE.MeshLambertMaterial({ color: 0xfff2c8, transparent: true, opacity: 0.32, emissive: 0x5a5040, depthWrite: false, side: THREE.DoubleSide });
  m.paperTape = em(T(64, 512, (g, w, h) => { g.fillStyle = '#efe6cc'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2420'; const R = PT.rng(5); for (let y = 6; y < h; y += 10) for (let k = 0; k < 6; k++) if (R() < 0.45) { g.beginPath(); g.arc(8 + k * 9, y, 3, 0, TAU); g.fill(); } }, [1, 3]), 0x302a20);
  m.letter = em(T(512, 680, letterTex), 0x302818); m.shelf = em(T(512, 512, shelfTex), 0x100a08);
  m.museumWall = vc({ map: T(256, 256, museumWallTex) }); m.museumSign = new THREE.MeshBasicMaterial({ map: T(1024, 200, museumSignTex), transparent: true, fog: true }); m.museumSign.color.setScalar(1.05);
  m.placard = em(T(512, 300, placardTex), 0x303030); m.frameArt = em(T(256, 320, frameArtTex), 0x201810);
  m.glass = new THREE.MeshLambertMaterial({ color: 0x8aa8b8, transparent: true, opacity: 0.12, emissive: 0x101820, depthWrite: false, side: THREE.DoubleSide });
  return m; }

// one relay panel at (x, z) facing +z (rotY) with letter L: steel cabinet, dark interior, wire loom, relay grid (instances), lamp column
function panelShell(K, root, x, z, ry, L, inst) { const { PW, PH, PD } = LAB, w = PW - 0.04;
  K.at(x, 0, z, ry, () => { K.box(M.steel, -w / 2, w / 2, 0, 0.12, -PD / 2, PD / 2, 0x3a4a44, 0.01); K.box(M.steel, -w / 2, w / 2, PH - 0.1, PH, -PD / 2, PD / 2, 0x6a7a72, 0.012);
    for (const s of [-1, 1]) K.box(M.steel, s * w / 2 - 0.05, s * w / 2 + 0.05, 0.12, PH - 0.1, -PD / 2, PD / 2, 0x7a8a80, 0.012);
    K.box(M.steel, -w / 2, w / 2, 0.12, PH - 0.1, -PD / 2, -PD / 2 + 0.04, 0x2a2e30, 0.005);
    for (let r = 0; r < 4; r++) K.box(M.steel, -w / 2 + 0.05, w / 2 - 0.05, 0.42 + r * 0.5, 0.45 + r * 0.5, -PD / 2 + 0.04, PD / 2 - 0.12, 0x5a6a62, 0.005); });
  const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry), v = new THREE.Vector3();
  const lp = (lx, ly, lz) => v.set(lx, ly, lz).applyQuaternion(q).add(new THREE.Vector3(x, 0, z)).clone();
  const loom = mesh(root, plane(w - 0.12, PH - 0.3), M.loom, ...lp(0, PH / 2, -PD / 2 + 0.05).toArray(), 0, ry, 0, false);
  for (let r = 0; r < 15; r++) for (let c = 0; c < 9; c++) inst.push({ p: lp(-w / 2 + 0.13 + c * (w - 0.26) / 8, 0.28 + r * 0.14, -PD / 2 + 0.14), ry });
  const plate = mesh(root, plane(0.26, 0.2), M.plates[L] || M.plates[0], ...lp(0, PH + 0.13, PD / 2 - 0.02).toArray(), 0, ry, 0, false); K.at(x, 0, z, ry, () => K.box(M.steel, -0.16, 0.16, PH, PH + 0.25, PD / 2 - 0.06, PD / 2 - 0.03, 0x2a2a30, 0.005));
  const lamps = []; for (let i = 0; i < 6; i++) lamps.push(lp(w / 2 - 0.1, 0.5 + i * 0.32, PD / 2 - 0.08));
  return { loom, lamps }; }

// ================================================================= LAB
function buildLab(root) { const R = PT.rng(1947), K = new Kit(), X0 = -10.5, X1 = 10, ZB = -6.0, HT = 3.9, { ZP, PX0, PW, PH, PD, NP, F, CON, SIDEX } = LAB;
  mesh(root, planeUV(X1 - X0, 16, (X1 - X0) / 2.4, 16 / 2.4), M.lino, (X0 + X1) / 2, 0, 2, -Math.PI / 2, 0, 0, false);
  K.box(M.plaster, X0, X1, 1.1, HT, ZB - 0.2, ZB, 0xffffff, 0.01); K.box(M.wains, X0, X1, 0, 1.1, ZB - 0.2, ZB + 0.02, 0xffffff, 0.01);
  K.box(M.plaster, X0 - 0.2, X0, 0, HT, ZB, 10, 0xf0e8d8, 0.01); K.box(M.plaster, X1, X1 + 0.2, 1.1, HT, ZB, 10, 0xf0e8d8, 0.01); K.box(M.wains, X1 - 0.02, X1 + 0.2, 0, 1.1, ZB, 10, 0xffffff, 0.01);
  K.box(M.paint, X0, X1 + 0.2, HT, HT + 0.2, ZB, 10, 0xe2dccc, 0.01); for (let i = 0; i < 6; i++) K.box(M.paint, X0, X1, HT - 0.24, HT, ZB + 0.6 + i * 2.6, ZB + 0.9 + i * 2.6, 0x8a7a68, 0.01);
  // clerestory windows in the back wall (above the panels)
  const wins = []; for (let i = 0; i < 6; i++) { const x = X0 + 1.8 + i * 3.4; K.box(M.wood, x - 1.0, x + 1.0, 2.75, 3.65, ZB + 0.02, ZB + 0.08, 0x5a3a24, 0.01); wins.push(mesh(root, plane(1.84, 0.76), M.sky, x, 3.2, ZB + 0.09, 0, 0, 0, false)); K.beam(M.wood, [x, 2.82, ZB + 0.1], [x, 3.58, ZB + 0.1], 0.025, 0x5a3a24); K.beam(M.wood, [x - 0.92, 3.2, ZB + 0.1], [x + 0.92, 3.2, ZB + 0.1], 0.025, 0x5a3a24); }
  // the back row of panels A..N and the side row O..U
  const inst = [], lamps = [], plates = []; let fP = null;
  for (let i = 0; i < NP; i++) { const p = panelShell(K, root, PX0 + (i + 0.5) * PW, ZP, 0, i, inst); lamps.push(...p.lamps); }
  for (let i = 0; i < 7; i++) { const p = panelShell(K, root, SIDEX, ZP + 1.4 + (i + 0.5) * PW, Math.PI / 2, NP + i, inst); lamps.push(...p.lamps); }
  // Panel F: brighter plate + a hinged glass-and-steel door (opens to the left, hinge at its left edge)
  const FX = LAB.FX, door = new THREE.Group(); door.position.set(FX - PW / 2 + 0.04, 0, ZP + PD / 2 + 0.01); root.add(door);
  { const KD = new Kit(), w = PW - 0.08; KD.box(M.steel, 0, w, 0.14, 0.24, -0.02, 0.02, 0x8a9a90, 0.01); KD.box(M.steel, 0, w, PH - 0.22, PH - 0.12, -0.02, 0.02, 0x8a9a90, 0.01); KD.box(M.steel, 0, 0.08, 0.14, PH - 0.12, -0.02, 0.02, 0x8a9a90, 0.01); KD.box(M.steel, w - 0.08, w, 0.14, PH - 0.12, -0.02, 0.02, 0x8a9a90, 0.01);
    KD.box(M.brass, w - 0.14, w - 0.1, 1.1, 1.3, 0.02, 0.06, 0xc8a050, 0.01); KD.build(door); const gl = mesh(door, plane(w - 0.16, PH - 0.46), M.glass, w / 2, PH / 2, 0.0, 0, 0, 0, false); gl.renderOrder = 4; }
  const plateF = mesh(root, plane(0.5, 0.19), M.plateF, FX, PH + 0.13, ZP + PD / 2 - 0.015, 0, 0, 0, false);
  const relay70 = new THREE.Group(); root.add(relay70); relay70.position.set(FX + 0.16, 1.26, ZP - PD / 2 + 0.2); { mesh(relay70, plane(0.2, 0.075), M.plate70, 0, -0.1, 0.02, 0, 0, 0, false); }
  const r70glow = glowAt(root, [FX + 0.16, 1.26, ZP - PD / 2 + 0.3], 0.5, '#ffe080', 0);
  // relays: instanced bakelite bodies + copper coil caps + armature tabs (the tabs flicker = clicking)
  const N = inst.length, body = new THREE.InstancedMesh(vcol(new THREE.BoxGeometry(0.075, 0.1, 0.07)), M.relay, N), cap = new THREE.InstancedMesh(vcol(new THREE.CylinderGeometry(0.022, 0.022, 0.05, 8)), M.copper, N), tab = new THREE.InstancedMesh(vcol(new THREE.BoxGeometry(0.06, 0.012, 0.05)), M.chrome, N);
  const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1), c1 = new THREE.Color(0x2a1a14), tmp = new THREE.Vector3();
  inst.forEach((it, i) => { qq.setFromEuler(e.set(0, it.ry, 0)); m4.compose(it.p, qq, one); body.setMatrixAt(i, m4); body.setColorAt(i, c1.setHex(R() < 0.15 ? 0x4a3020 : 0x24160e)); tmp.set(0, 0.06, 0.02).applyQuaternion(qq).add(it.p); m4.compose(tmp, qq.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))), one); cap.setMatrixAt(i, m4); cap.setColorAt(i, c1.setHex(0xffffff)); });
  for (const im of [body, cap, tab]) { im.castShadow = false; im.receiveShadow = true; root.add(im); }
  const tabState = inst.map(() => [R() * 100, 0.3 + R() * 2.2]);
  const lampIM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: true }), lamps.length); lamps.forEach((p, i) => { m4.compose(p, new THREE.Quaternion(), one); lampIM.setMatrixAt(i, m4); lampIM.setColorAt(i, new THREE.Color(0x3a2010)); }); root.add(lampIM);
  // cable trays from the panel tops up to the ceiling
  for (let i = 0; i < NP; i += 2) { const x = PX0 + (i + 1) * PW; K.box(M.steel, x - 0.25, x + 0.25, HT - 0.5, HT - 0.42, ZP - 0.3, ZP + 1.6, 0x4a4a52, 0.01); for (let k = 0; k < 5; k++) K.beam(M.relay, [x - 0.18 + k * 0.09, PH, ZP - 0.1], [x - 0.18 + k * 0.09, HT - 0.45, ZP + 0.1], 0.025, [0x2a2a30, 0x6a2a2a, 0x2a3a5a][k % 3], true, 5); }
  K.box(M.steel, PX0, PX0 + NP * PW, HT - 0.5, HT - 0.42, ZP + 1.4, ZP + 1.7, 0x4a4a52, 0.01);
  // pendant lamps
  const pend = []; for (const [x, z] of [[-6, -2.4], [-1.5, -2.4], [3, -2.4], [-4, 1.5], [3.4, 1.4]]) { K.beam(M.iron || M.metal, [x, HT, z], [x, HT - 0.7, z], 0.012, 0x2a2a30); K.put(M.metal, new THREE.ConeGeometry(0.28, 0.2, 18, 1, true), x, HT - 0.78, z, 0, 0, 0, 1, 1, 1, 0x3a5a4a); K.put(M.lampGlass, sph(0.08, 10, 8), x, HT - 0.86, z); pend.push([x, HT - 0.95, z]); }
  // operator console at CON: desk, typewriter, paper-tape reader, logbook, desk lamp, chair
  const [cx, , cz] = CON; K.at(cx, 0, cz, -0.35, () => { K.box(M.wood, -1.0, 1.0, 0.74, 0.8, -0.45, 0.45, 0x8a5a38, 0.02); for (const [a, b] of [[-0.92, -0.38], [0.92, -0.38], [-0.92, 0.38], [0.92, 0.38]]) K.box(M.wood, a - 0.04, a + 0.04, 0, 0.74, b - 0.04, b + 0.04, 0x5a3420, 0.01); K.box(M.wood, -0.95, -0.4, 0.3, 0.74, -0.42, 0.42, 0x6a4028, 0.01);
    K.box(M.metal, -0.75, -0.25, 0.8, 0.92, -0.32, 0.0, 0x2a2a30, 0.03); for (let r = 0; r < 3; r++) for (let k = 0; k < 8; k++) K.put(M.paint, cyl(0.016, 0.016, 0.02, 8), -0.7 + k * 0.06, 0.93 + r * 0.012, -0.05 - r * 0.07, 0, 0, 0, 1, 1, 1, 0xe8e0d0);
    K.box(M.metal, -0.72, -0.28, 0.92, 1.02, -0.36, -0.26, 0x3a3a44, 0.02); K.box(M.paint, -0.62, -0.38, 0.98, 1.16, -0.34, -0.32, 0xf4f0e4, 0.002);
    K.box(M.steel, 0.25, 0.85, 0.8, 1.08, -0.38, -0.08, 0x5a6a62, 0.02); K.put(M.metal, cyl(0.07, 0.07, 0.3, 14), 0.4, 1.14, -0.22, 0, 0, Math.PI / 2, 1, 1, 1, 0x2a2a30); K.put(M.metal, cyl(0.07, 0.07, 0.3, 14), 0.72, 1.14, -0.22, 0, 0, Math.PI / 2, 1, 1, 1, 0x2a2a30);
    K.box(M.paint, -0.15, 0.25, 0.8, 0.83, 0.02, 0.32, 0x2a3a6a, 0.005); K.box(M.paint, -0.13, 0.23, 0.83, 0.84, 0.04, 0.3, 0xf2ead2, 0.002); K.put(M.paint, cyl(0.006, 0.006, 0.18, 6), 0.3, 0.84, 0.15, Math.PI / 2, 0.6, 0, 1, 1, 1, 0xe8b040);
    K.put(M.brass, cyl(0.08, 0.1, 0.03, 14), 0.75, 0.82, 0.25, 0, 0, 0, 1, 1, 1, 0x2a5a3a); K.beam(M.brass, [0.75, 0.82, 0.25], [0.68, 1.22, 0.2], 0.012, 0xc8a050); K.put(M.paint, new THREE.ConeGeometry(0.13, 0.14, 16, 1, true), 0.62, 1.22, 0.16, 0.5, 0, 0.4, 1, 1, 1, 0x2a6a4a); });
  const tape = mesh(root, plane(0.06, 0.6), M.paperTape, cx + 0.45 * Math.cos(-0.35) + 0.2, 1.06, cz - 0.35, -1.2, -0.35, 0, false);
  K.at(cx + 0.35, 0, cz - 0.95, -0.35, () => { K.box(M.wood, -0.24, 0.24, 0.45, 0.5, -0.22, 0.22, 0x6a4028, 0.02); K.box(M.wood, -0.24, 0.24, 0.5, 0.95, 0.18, 0.22, 0x6a4028, 0.02); for (const [a, b] of [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]]) K.box(M.metal, a - 0.02, a + 0.02, 0, 0.45, b - 0.02, b + 0.02, 0x2a2a30, 0.005); });
  // right wall: calendar, pennant, clock; filing cabinet; coat rack
  const cal = mesh(root, plane(0.62, 0.78), M.cal, X1 - 0.02, 1.75, 0.4, 0, -Math.PI / 2, 0, false);
  const pen = mesh(root, plane(1.3, 0.5), M.pennant, X1 - 0.03, 2.3, -0.8, 0, -Math.PI / 2, -0.05, false);
  const clock = mesh(root, plane(0.56, 0.56), M.clock, X1 - 0.05, 2.85, 0.45, 0, -Math.PI / 2, 0, false); K.put(M.wood, cyl(0.3, 0.3, 0.04, 28), X1 - 0.02, 2.85, 0.45, 0, 0, Math.PI / 2, 1, 1, 1, 0x4a2a1a);
  const hands = []; for (const [L, wd] of [[0.15, 0.025], [0.22, 0.016]]) { const g = new THREE.Group(); g.position.set(X1 - 0.07, 2.85, 0.45); g.rotation.y = -Math.PI / 2; root.add(g); const hm = mesh(g, new THREE.BoxGeometry(wd, L, 0.01), M.paint, 0, L / 2, 0, 0, 0, 0, false); tintM(hm, 0x1e1e28); hands.push(g); }
  K.at(X1 - 0.4, 0, 3.4, -Math.PI / 2, () => { K.box(M.steel, -0.35, 0.35, 0, 1.35, -0.3, 0.3, 0x6a7a72, 0.02); for (let i = 0; i < 4; i++) K.box(M.brass, -0.08, 0.08, 0.25 + i * 0.32, 0.29 + i * 0.32, 0.3, 0.33, 0xc8a050, 0.005); });
  K.at(X1 - 0.5, 0, -3.6, 0, () => { K.beam(M.wood, [0, 0, 0], [0, 1.8, 0], 0.025, 0x4a2a1a); K.put(M.paint, sph(0.2, 10, 8), 0, 1.6, 0.05, 0, 0, 0, 1, 1.4, 0.6, 0x5a5a6a); K.put(M.paint, cyl(0.16, 0.2, 0.08, 12), 0.05, 1.86, 0, 0, 0, 0.2, 1, 1, 1, 0x3a3a44); });
  // red trouble lamp on a small post near Panel F
  K.at(LAB.FX + 1.6, 0, ZP + PD / 2 + 0.2, 0, () => { K.beam(M.metal, [0, PH, 0], [0, PH + 0.3, 0], 0.02, 0x2a2a30); K.put(M.metal, cyl(0.07, 0.07, 0.05, 12), 0, PH + 0.3, 0, 0, 0, 0, 1, 1, 1, 0x2a2a30); });
  const alarm = mesh(root, sph(0.075, 14, 10), M.red, LAB.FX + 1.6, PH + 0.39, ZP + PD / 2 + 0.2, 0, 0, 0, false); alarm.material = M.red.clone();
  const alarmG = glowAt(root, [LAB.FX + 1.6, PH + 0.39, ZP + PD / 2 + 0.3], 1.4, '#ff3020', 0);
  // torch pools (the hunt): 3 glow cards on the panel faces
  const spots = [0, 1, 2].map(() => glowAt(root, [0, 1.2, ZP + PD / 2 + 0.06], 0.9, '#fff0c8', 0));
  // foreground clutter: a stool and a box of spare relays
  K.at(-6.4, 0, 1.8, 0.4, () => { K.box(M.wood, -0.3, 0.3, 0, 0.36, -0.22, 0.22, 0x8a6a40, 0.02); for (let i = 0; i < 6; i++) K.box(M.relay, -0.24 + i * 0.09, -0.18 + i * 0.09, 0.36, 0.46, -0.08, 0.02, 0x2a1a12, 0.01); });
  K.build(root, 30);
  const shafts = [0, 1, 2, 3].map((i) => shaftAt(root, [X0 + 3.5 + i * 4.6, 2.0, ZB + 1.6], 1.8, 4.2, 0, 0.42, 0.14, 0xfff0d0));
  shafts.forEach((s) => { s.rotation.set(-0.7, 0, 0.0, 'YXZ'); });
  const pendG = pend.map((p) => glowAt(root, p, 0.7, '#ffd890', 0.4));
  const dust = motes(root, 90, [-8, 6, 0.4, 3.4, -4.5, 3], 47, 0.011);
  return { body, cap, tab, inst, tabState, lampIM, lamps, door, relay70, r70glow, alarm, alarmG, spots, shafts, pendG, dust, tape, hands, wins, cal, plateF };
}

// ================================================================= RELAY (macro, inside Panel F)
function buildRelay(root) { const R = PT.rng(70), K = new Kit();
  // back plate + wire looms, floor-ish mounting rail
  mesh(root, plane(60, 30), M.loom, 0, 6, -9, 0, 0, 0, false); K.box(M.steel, -30, 30, -1.2, 0, -10, 10, 0x3a4440, 0.05);
  // the hero relay: base, coil, yoke, contacts
  K.box(M.bake, -4.5, 5.5, 0, 1.0, -2.0, 2.0, 0xffffff, 0.12); // base with the RELAY #70 stamp (texture)
  K.box(M.metal, -3.6, -3.0, 1.0, 4.2, -1.3, 1.3, 0x4a4a56, 0.08); K.box(M.metal, -3.6, 2.6, 3.7, 4.2, -1.3, 1.3, 0x4a4a56, 0.08); // L yoke
  K.put(M.copper, cyl(1.1, 1.1, 4.6, 28), -0.5, 2.3, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0xffffff); for (const x of [-2.9, 1.9]) K.put(M.bake, cyl(1.35, 1.35, 0.25, 28), x, 2.3, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0xffffff);
  K.put(M.metal, cyl(0.35, 0.35, 0.4, 16), 2.2, 2.3, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x5a5a66);
  // fixed contact springs (lower), stack of insulators
  K.box(M.bake, 3.6, 4.6, 1.0, 2.2, -1.2, 1.2, 0xffffff, 0.06);
  { const y = 1.9; K.box(M.brass, 4.0, 10.5, y - 0.06, y + 0.06, -0.55, 0.55, 0xd8b050, 0.02); K.put(M.chrome, sph(0.24, 12, 8), 9.8, y + 0.12, 0, 0, 0, 0, 1, 0.5, 1, 0xe8e8f0); }
  // background relays in rows (instanced), receding into the dark
  const bg = []; for (let r = 0; r < 3; r++) for (let c = -3; c <= 3; c++) { if (r === 0 && c === 0) continue; bg.push([c * 13 + (r % 2) * 4, 0, -r * 7 - (r ? 2 : 0) + (c === 0 ? -6 : 0)]); }
  for (const [x, , z] of bg) { K.box(M.bake, x - 4.5, x + 5.5, 0, 1.0, z - 2, z + 2, 0xffffff, 0.12); K.put(M.copper, cyl(1.1, 1.1, 4.6, 20), x - 0.5, 2.3, z, 0, 0, Math.PI / 2, 1, 1, 1, 0xffffff); K.box(M.metal, x - 3.6, x + 2.6, 3.7, 4.2, z - 1.3, z + 1.3, 0x4a4a56, 0.08); K.box(M.brass, x + 4, x + 10, 1.6, 1.72, z - 0.5, z + 0.5, 0xd8b050, 0.02); }
  // big wires snaking from the relay base
  for (let i = 0; i < 6; i++) { const P = []; for (let k = 0; k <= 8; k++) P.push(new THREE.Vector3(-6 - k * 2.4, 0.3 + Math.sin(k + i) * 0.4, 1.4 - i * 0.5 + Math.sin(k * 0.7 + i) * 1.2)); mesh(root, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 40, 0.22, 8), M.paint, 0, 0, 0, 0, 0, 0, true).geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(41 * 9 * 3).fill(1), 3)); }
  K.build(root, 20);
  root.children.forEach((c, i) => { if (c.geometry && c.geometry.type === 'TubeGeometry') { const col = new THREE.Color([0xc83a2a, 0x3a6ab0, 0xe8d8b0, 0x2a8a4a, 0xe8b040, 0x6a6a74][i % 6]); const a = c.geometry.attributes.color; for (let k = 0; k < a.count; k++) a.setXYZ(k, col.r, col.g, col.b); } });
  // the armature (pivots at the yoke corner) carrying the moving contact spring
  const arm = new THREE.Group(); arm.position.set(2.6, 3.95, 0); root.add(arm); { const KA = new Kit(); KA.box(M.metal, -0.1, 1.3, -1.6, -0.8, -1.2, 1.2, 0x5a5a68, 0.06); KA.box(M.brass, 1.0, 7.4, -1.3, -1.18, -0.5, 0.5, 0xe0b850, 0.02); KA.put(M.chrome, sph(0.24, 12, 8), 6.8, -1.36, 0, 0, 0, 0, 1, 0.5, 1, 0xe8e8f0); KA.build(arm); }
  const spark = glowAt(root, [9.8, 2.3, 0.3], 3, '#bfe0ff', 0);
  const torch = glowAt(root, [3, 3, 0.5], 18, '#fff0c0', 0.0);
  const dust = motes(root, 80, [-12, 14, 0.5, 10, -6, 6], 71, 0.05);
  return { arm, spark, torch, dust };
}

// ================================================================= DESK (macro logbook)
function buildDesk(root) { const K = new Kit();
  K.box(M.wood, -6, 6, -0.5, -0.12, -4, 4, 0x8a5a38, 0.02);
  // logbook: hard cover + two pages (page canvas is dynamic), spine shadow
  K.box(M.paint, -2.25, 2.25, -0.12, -0.06, -1.6, 1.6, 0x2a3a6a, 0.03); K.box(M.paint, -2.12, 2.12, -0.06, -0.01, -1.5, 1.5, 0xe8dcc0, 0.01);
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 1400; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const pageM = H.toon({ map: tex, emissive: 0x2a2620 }); pageM.emissiveMap = tex;
  const page = mesh(root, plane(2.05, 2.8), pageM, 1.04, 0.0, 0, -Math.PI / 2, 0, 0, false);
  const lv = document.createElement('canvas'); lv.width = 512; lv.height = 700; { const g = lv.getContext('2d'); drawPage(g, 512, 700, { wr: 0, circ: 0 }); g.fillStyle = 'rgba(242,234,210,0.0)'; }
  const ltex = new THREE.CanvasTexture(lv); ltex.colorSpace = THREE.SRGBColorSpace; const leftM = H.toon({ map: ltex, emissive: 0x2a2620 }); leftM.emissiveMap = ltex;
  mesh(root, plane(2.05, 2.8), leftM, -1.04, -0.002, 0, -Math.PI / 2, 0, 0, false);
  const spine = mesh(root, plane(0.3, 2.8), new THREE.MeshBasicMaterial({ color: 0x3a2a1a, transparent: true, opacity: 0.3, depthWrite: false }), 0, 0.003, 0, -Math.PI / 2, 0, 0, false); spine.renderOrder = 3;
  // flat moth decal + tape strip; pencil; desk lamp; coffee cup; spare relay
  const mv = document.createElement('canvas'); mv.width = 512; mv.height = 512; const mtex = new THREE.CanvasTexture(mv); mtex.colorSpace = THREE.SRGBColorSpace;
  const mothM = new THREE.MeshLambertMaterial({ map: mtex, color: 0xb0a090, transparent: true, alphaTest: 0.3, emissive: 0x1a140e, emissiveMap: mtex, side: THREE.DoubleSide });
  const moth = mesh(root, plane(0.46, 0.46), mothM, DESK.MOTH[0], 0.02, DESK.MOTH[2], -Math.PI / 2, 0, 0, false);
  const tape = mesh(root, plane(0.66, 0.22), M.tape, DESK.MOTH[0], 0.03, DESK.MOTH[2] + 0.02, -Math.PI / 2, 0, 0.12, false); tape.renderOrder = 4;
  const pencil = new THREE.Group(); root.add(pencil); { const KP = new Kit(); KP.put(M.paint, cyl(0.04, 0.04, 1.1, 6), 0, 0.62, 0, 0, 0, 0, 1, 1, 1, 0xe8b830); KP.put(M.paint, new THREE.ConeGeometry(0.04, 0.12, 6), 0, 0.03, 0, Math.PI, 0, 0, 1, 1, 1, 0xe8c8a0); KP.put(M.paint, cyl(0.041, 0.041, 0.08, 6), 0, 1.2, 0, 0, 0, 0, 1, 1, 1, 0xd88a9a); KP.build(pencil); }
  K.at(3.6, -0.12, -2.2, 0, () => { K.put(M.paint, cyl(0.32, 0.26, 0.6, 18), 0, 0.3, 0, 0, 0, 0, 1, 1, 1, 0xf2ece0); K.put(M.paint, new THREE.TorusGeometry(0.16, 0.04, 6, 14), 0.34, 0.32, 0, 0, 0, 0, 1, 1, 1, 0xf2ece0); K.put(M.paint, cyl(0.29, 0.29, 0.02, 18), 0, 0.56, 0, 0, 0, 0, 1, 1, 1, 0x3a2414); });
  K.at(-3.6, -0.12, -2.0, 0.4, () => { K.box(M.relay, -0.4, 0.4, 0, 0.5, -0.3, 0.3, 0x2a1a12, 0.04); K.put(M.copper, cyl(0.2, 0.2, 0.5, 14), 0, 0.7, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0xffffff); });
  K.at(-3.2, -0.12, 2.6, -0.3, () => { K.box(M.paint, -0.8, 0.8, 0, 0.06, -0.5, 0.5, 0xf4f0e4, 0.01); });
  K.build(root);
  const lampG = glowAt(root, [3.0, 2.2, -2.4], 4, '#ffd890', 0.35);
  return { cv, tex, page, moth, mv, mtex, tape, pencil, lampG, lastKey: '' };
}

// ================================================================= EDISON (1870s workshop, night)
function buildEdison(root) { const R = PT.rng(1878), K = new Kit(), X = 6, ZB = -3.6, HT = 4;
  K.box(M.floorWood, -X, X, -0.05, 0, ZB, 5, 0xffffff, 0.01); K.box(M.wood, -X, X, 0, HT, ZB - 0.2, ZB, 0x8a6a4a, 0.01); K.box(M.wood, -X - 0.2, -X, 0, HT, ZB, 5, 0x8a6a4a, 0.01); K.box(M.wood, X, X + 0.2, 0, HT, ZB, 5, 0x8a6a4a, 0.01);
  mesh(root, plane(4.2, 2.4), M.shelf, -2.6, 2.3, ZB + 0.05, 0, 0, 0, false); for (const y of [1.2, 1.8, 2.4, 3.0]) K.box(M.wood, -4.7, -0.5, y - 0.05, y, ZB, ZB + 0.3, 0x5a3a22, 0.01);
  // window with moonlight
  K.box(M.wood, 1.6, 3.8, 1.3, 3.2, ZB + 0.02, ZB + 0.08, 0x4a2a1a, 0.01); const win = mesh(root, plane(2.0, 1.7), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x3a4aa0).multiplyScalar(1.1), fog: false }), 2.7, 2.25, ZB + 0.09, 0, 0, 0, false);
  K.beam(M.wood, [2.7, 1.4, ZB + 0.1], [2.7, 3.1, ZB + 0.1], 0.03, 0x4a2a1a); K.beam(M.wood, [1.7, 2.25, ZB + 0.1], [3.7, 2.25, ZB + 0.1], 0.03, 0x4a2a1a);
  // long bench: battery jars, a telegraph sounder, a key, coils of wire, tools
  K.at(0, 0, -2.4, 0, () => { K.box(M.wood, -3.5, 3.5, 0.86, 0.96, -0.5, 0.5, 0x7a4a2a, 0.02); for (const x of [-3.3, 3.3]) for (const z of [-0.4, 0.4]) K.box(M.wood, x - 0.06, x + 0.06, 0, 0.86, z - 0.06, z + 0.06, 0x5a3420, 0.01);
    for (let i = 0; i < 5; i++) { K.put(M.jar, cyl(0.14, 0.14, 0.34, 14), -3.0 + i * 0.34, 1.13, -0.2, 0, 0, 0, 1, 1, 1, 0xd0e8e0); K.put(M.metal, cyl(0.05, 0.05, 0.36, 8), -3.0 + i * 0.34, 1.16, -0.2, 0, 0, 0, 1, 1, 1, 0x3a3a44); K.put(M.brass, cyl(0.02, 0.02, 0.1, 6), -3.0 + i * 0.34, 1.37, -0.2, 0, 0, 0, 1, 1, 1, 0xc8a050); }
    K.box(M.wood, 0.0, 0.6, 0.96, 1.02, -0.2, 0.2, 0x5a3420, 0.01); for (const x of [0.15, 0.45]) K.put(M.copper, cyl(0.06, 0.06, 0.18, 12), x, 1.11, 0, 0, 0, 0, 1, 1, 1, 0xffffff); K.box(M.brass, 0.05, 0.55, 1.2, 1.23, -0.03, 0.03, 0xc8a050, 0.005);
    K.box(M.wood, 1.0, 1.4, 0.96, 1.0, -0.1, 0.1, 0x5a3420, 0.01); K.box(M.brass, 1.05, 1.38, 1.02, 1.04, -0.02, 0.02, 0xc8a050, 0.005);
    for (let i = 0; i < 3; i++) K.put(M.copper, new THREE.TorusGeometry(0.12, 0.04, 6, 16), 2.0 + i * 0.36, 1.0, 0.2, Math.PI / 2, 0, 0, 1, 1, 1, 0xffffff); });
  // writing desk front-right with the letter and an inkwell, a chair
  K.at(1.6, 0, 0.6, -0.3, () => { K.box(M.wood, -0.8, 0.8, 0.74, 0.8, -0.45, 0.45, 0x6a3a22, 0.02); for (const [a, b] of [[-0.72, -0.37], [0.72, -0.37], [-0.72, 0.37], [0.72, 0.37]]) K.box(M.wood, a - 0.04, a + 0.04, 0, 0.74, b - 0.04, b + 0.04, 0x4a2a18, 0.01);
    K.put(M.paint, cyl(0.06, 0.07, 0.08, 10), 0.5, 0.84, -0.2, 0, 0, 0, 1, 1, 1, 0x1e1a28); K.put(M.paint, cyl(0.004, 0.004, 0.24, 4), 0.52, 0.94, -0.18, 0.4, 0, 0.3, 1, 1, 1, 0xf2ece0); });
  const letter = mesh(root, plane(0.48, 0.64), M.letter, 1.6 - 0.05, 0.81, 0.62, -Math.PI / 2, -0.3, 0, false);
  // gas lamp on the wall (practical) + a hanging lamp
  K.beam(M.brass, [-X + 0.05, 2.3, -1.0], [-X + 0.4, 2.3, -1.0], 0.03, 0xc8a050); K.put(M.jar, sph(0.13, 12, 10), -X + 0.4, 2.42, -1.0, 0, 0, 0, 1, 1.3, 1, 0xfff0d0);
  K.beam(M.metal, [0.2, HT, -1.0], [0.2, HT - 0.9, -1.0], 0.012, 0x2a2a30); K.put(M.metal, new THREE.ConeGeometry(0.3, 0.2, 16, 1, true), 0.2, HT - 1.0, -1.0, 0, 0, 0, 1, 1, 1, 0x2a3a2a);
  for (let i = 0; i < 30; i++) K.put(M.paper || M.paint, new THREE.BoxGeometry(0.2, 0.004, 0.28), (R() - 0.5) * 8, 0.004, 1 + R() * 3, 0, R() * 6, 0, 1, 1, 1, 0xefe2c0);
  K.build(root);
  const gasG = glowAt(root, [-X + 0.42, 2.42, -0.95], 1.6, '#ffc060', 0.6), hangG = glowAt(root, [0.2, HT - 1.1, -1.0], 1.4, '#ffc870', 0.45);
  const shaft = shaftAt(root, [2.2, 1.6, -1.8], 2.2, 3.6, 0.3, 0.5, 0.12, 0x9ab0ff);
  const dust = motes(root, 50, [-4, 4, 0.3, 3, -3, 2], 81, 0.01);
  return { letter, gasG, hangG, shaft, dust, win };
}

// ================================================================= MUSEUM
function buildMuseum(root, pageTex) { const K = new Kit(), X = 8, ZB = -4.5, HT = 5;
  K.box(M.floorWood, -X, X, -0.05, 0, ZB, 8, 0x8a6a50, 0.01); K.box(M.museumWall, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); K.box(M.museumWall, -X - 0.2, -X, 0, HT, ZB, 8, 0xffffff, 0.01); K.box(M.museumWall, X, X + 0.2, 0, HT, ZB, 8, 0xffffff, 0.01);
  K.box(M.paint, -X, X, HT - 0.1, HT, ZB, 8, 0x1a1e30, 0.01);
  mesh(root, plane(6.4, 1.25), M.museumSign, 0, 3.85, ZB + 0.03, 0, 0, 0, false);
  // the hero case: plinth + glass box, the page inside (tilted), small spotlight above
  K.box(M.paint, -0.75, 0.75, 0, 0.95, -0.55, 0.55, 0x2a2a3a, 0.03); K.box(M.brass, -0.78, 0.78, 0.95, 1.0, -0.58, 0.58, 0xc8a050, 0.01);
  const pm = H.toon({ map: pageTex, emissive: 0x3a3428 }); pm.emissiveMap = pageTex; const pg = mesh(root, plane(0.78, 1.06), pm, 0, 1.24, -0.08, -0.62, 0, 0, false);
  const mv2 = document.createElement('canvas'); mv2.width = 256; mv2.height = 256; drawMothFlat(mv2.getContext('2d'), 256, 256, 'none'); const mt2 = new THREE.CanvasTexture(mv2); mt2.colorSpace = THREE.SRGBColorSpace;
  const onPage = (u, vt, lift) => { const a = 0.62, dy = (0.5 - vt) * 1.06; return [(u - 0.5) * 0.78, 1.24 + dy * Math.cos(a) + lift * Math.sin(a), -0.08 - dy * Math.sin(a) + lift * Math.cos(a)]; };
  const pmoth = mesh(root, plane(0.16, 0.16), new THREE.MeshLambertMaterial({ map: mt2, transparent: true, alphaTest: 0.3, emissive: 0x303030, emissiveMap: mt2 }), ...onPage(0.79, 0.457, 0.004), -0.62, 0, 0, false);
  const tp = mesh(root, plane(0.25, 0.085), M.tape, ...onPage(0.79, 0.45, 0.007), -0.62, 0, 0.12, false); tp.renderOrder = 4;
  for (const [w, h, d, x, y, z] of [[1.5, 0.02, 1.1, 0, 1.0, 0], [1.5, 0.9, 0.02, 0, 1.45, -0.55], [1.5, 0.9, 0.02, 0, 1.45, 0.55], [0.02, 0.9, 1.1, -0.75, 1.45, 0], [0.02, 0.9, 1.1, 0.75, 1.45, 0], [1.5, 0.02, 1.1, 0, 1.9, 0]]) { const gm = mesh(root, new THREE.BoxGeometry(w, h, d), M.glass, x, y, z, 0, 0, 0, false); gm.renderOrder = 5; }
  for (const [x0, x1, y0, y1, z0, z1] of [[-0.77, 0.77, 1.89, 1.92, -0.57, -0.53], [-0.77, 0.77, 1.89, 1.92, 0.53, 0.57], [-0.77, -0.73, 1.89, 1.92, -0.57, 0.57], [0.73, 0.77, 1.89, 1.92, -0.57, 0.57]]) K.box(M.brass, x0, x1, y0, y1, z0, z1, 0xc8a050, 0.005);
  const plac = mesh(root, plane(0.56, 0.33), M.placard, 0, 0.62, 0.56, -0.2, 0, 0, false);
  // other exhibits: an old relay panel (left), a console (right), framed pictures, stanchions with rope
  K.at(-4.6, 0, -3.2, 0.25, () => { K.box(M.steel, -0.6, 0.6, 0, 2.45, -0.35, 0.35, 0x6a7a72, 0.02); K.box(M.relay, -0.5, 0.5, 0.3, 2.2, 0.3, 0.36, 0x24160e, 0.01); for (let r = 0; r < 12; r++) for (let c = 0; c < 7; c++) K.box(M.copper, -0.42 + c * 0.13, -0.36 + c * 0.13, 0.36 + r * 0.15, 0.42 + r * 0.15, 0.36, 0.4, 0xffffff, 0.005); });
  K.at(4.6, 0, -3.0, -0.3, () => { K.box(M.steel, -1.0, 1.0, 0, 1.0, -0.4, 0.4, 0x5a6a62, 0.02); K.box(M.steel, -1.0, 1.0, 1.0, 1.9, -0.4, -0.25, 0x5a6a62, 0.02); for (let k = 0; k < 10; k++) K.put(M.lampOff, sph(0.04, 8, 6), -0.8 + k * 0.18, 1.6, -0.24, 0, 0, 0, 1, 1, 1, 0xffb040); });
  const art = [[-2.4, 2.3], [2.4, 2.3]].map(([x, y]) => { K.box(M.brass, x - 0.6, x + 0.6, y - 0.75, y + 0.75, ZB, ZB + 0.06, 0xa88040, 0.01); return mesh(root, plane(1.0, 1.3), M.frameArt, x, y, ZB + 0.07, 0, 0, 0, false); });
  for (const [x, z] of [[-1.6, 1.4], [1.6, 1.4], [-1.6, -1.2], [1.6, -1.2]]) { K.beam(M.brass, [x, 0, z], [x, 0.95, z], 0.03, 0xc8a050); K.put(M.brass, sph(0.05, 8, 6), x, 0.97, z, 0, 0, 0, 1, 1, 1, 0xc8a050); K.put(M.brass, cyl(0.15, 0.18, 0.04, 14), x, 0.02, z, 0, 0, 0, 1, 1, 1, 0xc8a050); }
  for (const [a, b] of [[[-1.6, 0.86, 1.4], [1.6, 0.86, 1.4]], [[-1.6, 0.86, -1.2], [-1.6, 0.86, 1.4]], [[1.6, 0.86, -1.2], [1.6, 0.86, 1.4]]]) { const P = [new THREE.Vector3(...a), new THREE.Vector3((a[0] + b[0]) / 2, 0.66, (a[2] + b[2]) / 2), new THREE.Vector3(...b)]; tintM(mesh(root, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 20, 0.022, 6), M.paint, 0, 0, 0), 0xa82a3a); }
  K.build(root);
  const spot = shaftAt(root, [0, 3.2, 0], 1.6, 3.4, 0, 0, 0.12, 0xfff0d0); spot.rotation.set(0, 0, 0); const caseG = glowAt(root, [0, 1.3, 0.1], 1.6, '#fff0c8', 0.18);
  const dust = motes(root, 60, [-2, 2, 0.5, 3.6, -1.5, 1.5], 91, 0.012);
  return { pg, spot, caseG, dust, art };
}

// ================================================================= lights, grades, API
const IN = { top: '#000000', clouds: false, shadow: true, stars: 0, disc: '#000000', fxTint: '#ffffff', shafts: 0 };
const SET_LIGHT = {
  lab: { ...IN, hor: '#2a2420', fog: '#2a2420', fogN: 12, fogF: 60, sky: '#fff0d8', ground: '#4a4030', hemiI: 1.0, fillCol: '#8a98d0', fillI: 0.32, sunCol: '#ffe6c0', sunI: 2.6, az: 160, el: 38, cardTint: '#fff2e4' },
  labCal: { ...IN, hor: '#2a2420', fog: '#2a2420', fogN: 12, fogF: 60, sky: '#fff0d8', ground: '#4a4030', hemiI: 1.0, fillCol: '#8a98d0', fillI: 0.32, sunCol: '#ffe0b0', sunI: 2.8, az: 120, el: 34, cardTint: '#fff2e4' },
  labAlarm: { ...IN, hor: '#2a1418', fog: '#2a1418', fogN: 10, fogF: 50, sky: '#ffd8c8', ground: '#4a2a2a', hemiI: 0.78, fillCol: '#c86a7a', fillI: 0.4, sunCol: '#ffd0b0', sunI: 2.0, az: 160, el: 38, cardTint: '#ffe8e4' },
  labHunt: { ...IN, hor: '#141a2a', fog: '#141a2a', fogN: 8, fogF: 40, sky: '#8a9ac8', ground: '#2a2a3a', hemiI: 0.6, fillCol: '#5a6ac8', fillI: 0.42, sunCol: '#a8b8ff', sunI: 1.0, az: 160, el: 40, cardTint: '#e8ecff' },
  labJoke: { ...IN, hor: '#2a2018', fog: '#2a2018', fogN: 12, fogF: 60, sky: '#ffe8c0', ground: '#4a3a28', hemiI: 1.0, fillCol: '#8a90d0', fillI: 0.3, sunCol: '#ffcf90', sunI: 2.9, az: 130, el: 24, cardTint: '#fff0e0' },
  relay: { ...IN, hor: '#10141e', fog: '#10141e', fogN: 20, fogF: 90, sky: '#7a8ab8', ground: '#2a2a34', hemiI: 0.7, fillCol: '#6a8ae0', fillI: 0.55, sunCol: '#ffe8c0', sunI: 2.4, az: 40, el: 50, cardTint: '#f4f0ff' },
  desk: { ...IN, hor: '#2a2018', fog: '#2a2018', fogN: 14, fogF: 60, sky: '#ffe8c8', ground: '#5a3a2a', hemiI: 0.95, fillCol: '#8a90c8', fillI: 0.3, sunCol: '#ffe0b0', sunI: 2.5, az: 30, el: 55, cardTint: '#fff0e2' },
  deskQ: { ...IN, hor: '#1e1a2a', fog: '#1e1a2a', fogN: 14, fogF: 60, sky: '#d8d0f0', ground: '#3a2a3a', hemiI: 0.85, fillCol: '#7a80d8', fillI: 0.4, sunCol: '#ffe0b8', sunI: 2.2, az: 30, el: 55, cardTint: '#f8f0ff' },
  edison: { ...IN, hor: '#141a30', fog: '#141a30', fogN: 10, fogF: 50, sky: '#7a7ab8', ground: '#3a2a30', hemiI: 0.72, fillCol: '#5a68c0', fillI: 0.42, sunCol: '#a8b8ff', sunI: 1.3, az: -60, el: 40, cardTint: '#f0e8f8' },
  museum: { ...IN, hor: '#141830', fog: '#141830', fogN: 12, fogF: 60, sky: '#c8d0f0', ground: '#2a2a3a', hemiI: 0.8, fillCol: '#6a7ad8', fillI: 0.42, sunCol: '#fff0d8', sunI: 2.4, az: 10, el: 70, cardTint: '#f4f0ff' },
  museumGold: { ...IN, hor: '#2a1e20', fog: '#2a1e20', fogN: 12, fogF: 60, sky: '#ffe0c0', ground: '#3a2a2a', hemiI: 0.9, fillCol: '#8a80d0', fillI: 0.36, sunCol: '#ffd8a0', sunI: 2.8, az: 20, el: 60, cardTint: '#fff2e4' },
};
const WARM = { exp: 1.12, con: 1.24, sat: 1.1, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.42, 0.78], hal: [0.26, '#ff9a50'], vig: [0.34, 0.46, '#2a1420'] };
const SET_GRADE = {
  lab: { look: 'office', over: WARM }, labCal: { look: 'office', over: { ...WARM, hal: [0.3, '#ffa860'] } }, labJoke: { look: 'golden', over: { ...WARM, exp: 1.14, hal: [0.3, '#ffa050'] } },
  labAlarm: { look: 'office', over: { exp: 1.1, con: 1.26, sat: 1.12, lift: [0.04, 0.015, 0.03], tS: ['#4a1a4a', 0.22], tH: ['#ff9a80', 0.12], bloom: [0.48, 0.7], hal: [0.3, '#ff4030'], vig: [0.4, 0.44, '#2a0a14'] } },
  labHunt: { look: 'night', over: { exp: 1.16, con: 1.22, sat: 1.06, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffe0a0', 0.12], bloom: [0.5, 0.68], hal: [0.28, '#ffd080'], vig: [0.42, 0.42, '#08081a'] } },
  relay: { look: 'night', over: { exp: 1.14, con: 1.22, sat: 1.12, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.24], tH: ['#ffe0a0', 0.1], bloom: [0.5, 0.68], hal: [0.3, '#ffd080'], vig: [0.44, 0.42, '#08081a'] } },
  desk: { look: 'office', over: WARM }, deskQ: { look: 'office', over: { ...WARM, tS: ['#2a2a7a', 0.24], vig: [0.42, 0.44, '#140a24'] } },
  edison: { look: 'night', over: { exp: 1.16, con: 1.22, sat: 1.04, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.5, 0.68], hal: [0.3, '#ffa050'], vig: [0.4, 0.42, '#08081a'] } },
  museum: { look: 'night', over: { exp: 1.14, con: 1.22, sat: 1.1, lift: [0.03, 0.028, 0.06], tS: ['#1a2a7a', 0.22], tH: ['#fff0d0', 0.08], bloom: [0.46, 0.72], hal: [0.24, '#ffe0a0'], vig: [0.38, 0.44, '#0a0a1e'] } },
  museumGold: { look: 'golden', over: { exp: 1.12, con: 1.22, sat: 1.1, lift: [0.035, 0.024, 0.045], tS: ['#2a2a7a', 0.2], tH: ['#ffc890', 0.12], bloom: [0.44, 0.74], hal: [0.3, '#ffa860'], vig: [0.36, 0.46, '#1a0e20'] } },
};

export function buildMT(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'lab', alarm: 0, spots: [], door: 0, click: 0, torch: 0, wr: 0, circ: 0, tape: 0, drop: 1, face: 'daze', later: false, spark: 0, lampsOn: 1, r70: 0 };
  let lb, ry, dk, ed, mu;
  const API = makeAPI(ctx, { prefix: 'mt_', origin: MT_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: Object.fromEntries(Object.keys(GROUP_OF).map((k) => [k, 'office'])),
    practicals: (name, F, W3) => { const fl = 1 + 0.04 * Math.sin(F * 0.7) + 0.03 * Math.sin(F * 1.9);
      if (name === 'lab' || name === 'labCal' || name === 'labJoke') return [{ p: W3('lab', [-1.5, 2.9, -2.4]), col: '#ffd8a0', I: 4.2, d: 9 }, { p: W3('lab', [3.4, 2.9, 1.4]), col: '#ffd8a0', I: 4.0, d: 9 }, { p: W3('lab', [LAB.CON[0] + 0.5, 1.3, LAB.CON[2]]), col: '#ffc070', I: 2.4 * fl, d: 4 }, { p: W3('lab', [8.5, 2.4, 0.4]), col: '#fff0d8', I: name === 'labCal' ? 3.4 : 1.6, d: 7 }];
      if (name === 'labAlarm') return [{ p: W3('lab', [LAB.FX + 1.6, LAB.PH + 0.5, LAB.ZP + 0.8]), col: '#ff3020', I: 9 * ST.alarm, d: 7 }, { p: W3('lab', [-1.5, 2.9, -2.4]), col: '#ffd8a0', I: 2.6, d: 9 }, { p: W3('lab', [3.4, 2.9, 1.4]), col: '#ffd8a0', I: 2.4, d: 9 }, { p: W3('lab', [LAB.CON[0] + 0.5, 1.3, LAB.CON[2]]), col: '#ffc070', I: 2.0 * fl, d: 4 }];
      if (name === 'labHunt') return [0, 1, 2].map((i) => { const s = ST.spots[i]; return s ? { p: W3('lab', [s[0], s[1], LAB.ZP + LAB.PD / 2 + 0.7]), col: '#fff0c8', I: 3 * (s[2] ?? 1), d: 3.0 } : { p: W3('lab', [0, -50, 0]), col: '#000000', I: 0, d: 1 }; }).concat([{ p: W3('lab', [LAB.FX + 1.6, LAB.PH + 0.5, LAB.ZP + 0.8]), col: '#ff3020', I: 3 * ST.alarm, d: 6 }]);
      if (name === 'relay') return [{ p: W3('relay', [6, 6, 6]), col: '#fff0c8', I: 30 * ST.torch * fl, d: 26 }, { p: W3('relay', [9.8, 2.4, 1]), col: '#bfe0ff', I: 40 * ST.spark, d: 10 }, { p: W3('relay', [-8, 8, 4]), col: '#8a9aff', I: 10, d: 30 }];
      if (name === 'desk' || name === 'deskQ') return [{ p: W3('desk', [3.0, 3.0, -2.0]), col: '#ffd090', I: 9 * fl, d: 12 }, { p: W3('desk', [-3, 3, 3]), col: '#c8d0ff', I: 3, d: 12 }];
      if (name === 'edison') return [{ p: W3('edison', [-5.4, 2.42, -0.9]), col: '#ffb050', I: 6 * fl, d: 9 }, { p: W3('edison', [0.2, 2.8, -1.0]), col: '#ffc870', I: 5 * fl, d: 8 }, { p: W3('edison', [1.6, 1.6, 1.4]), col: '#ffd090', I: 2.4, d: 4 }];
      if (name === 'museum' || name === 'museumGold') return [{ p: W3('museum', [0, 3.4, 0.6]), col: '#fff0d8', I: 9, d: 7 }, { p: W3('museum', [-4.6, 3.2, -1.6]), col: '#d8e0ff', I: 4, d: 7 }, { p: W3('museum', [4.6, 3.2, -1.6]), col: '#ffe0c0', I: 4, d: 7 }, { p: W3('museum', [0, 2.4, 4]), col: name === 'museumGold' ? '#ffc890' : '#b8c0ff', I: 3, d: 9 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'lab' && lb) { tickMotes(lb.dust, f, 0.3);
        // relay tabs: each relay ticks between two heights at its own rate (a click), more busy when lampsOn
        const m4 = lb.m4 || (lb.m4 = new THREE.Matrix4()), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
        lb.inst.forEach((it, i) => { const [ph, rate] = lb.tabState[i], on = ST.lampsOn > 0.5 ? Math.sin(T * rate * 6 + ph) > 0.2 : (i % 7 === 0); q.setFromEuler(e.set(on ? -0.25 : 0.0, it.ry, 0, 'YXZ')); v.set(0, 0.06 + (on ? 0 : 0.012), 0.045).applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, it.ry, 0))).add(it.p); m4.compose(v, q, one); lb.tab.setMatrixAt(i, m4); });
        lb.tab.instanceMatrix.needsUpdate = true;
        const c = new THREE.Color(); lb.lamps.forEach((p, i) => { const on = ST.lampsOn * (Math.sin(T * (1.3 + (i % 5) * 0.7) * 4 + i * 1.7) > 0.3 ? 1 : 0); lb.lampIM.setColorAt(i, c.setHex(on ? 0xffc050 : 0x3a2010).multiplyScalar(on ? 1.6 : 1)); }); lb.lampIM.instanceColor.needsUpdate = true;
        M.paperTape.map.offset.set(0, (T * 0.5 * ST.lampsOn) % 1);
        lb.alarm.material.color.setRGB(0.3 + 1.4 * ST.alarm, 0.08 + 0.1 * ST.alarm, 0.06); lb.alarmG.material.opacity = 0.75 * ST.alarm;
        lb.spots.forEach((g, i) => { const s = ST.spots[i]; g.visible = !!s; if (s) { g.position.set(s[0], s[1], LAB.ZP + LAB.PD / 2 + 0.08); g.material.opacity = 0.55 * (s[2] ?? 1); } });
        lb.door.rotation.y = -ST.door * 1.9; lb.r70glow.material.opacity = 0.8 * ST.r70;
        const hunt = ST.mood === 'labHunt'; lb.shafts.forEach((s) => (s.material.opacity = hunt || ST.mood === 'labAlarm' ? 0.03 : ST.mood === 'labJoke' ? 0.2 : 0.14)); lb.pendG.forEach((g) => (g.material.opacity = hunt ? 0.08 : 0.4));
        lb.wins.forEach((w) => w.material.color.set(hunt ? 0x3a4a8a : ST.mood === 'labJoke' ? 0xffd8a0 : 0xdcecff).multiplyScalar(hunt ? 1 : 1.3));
        const mins = 45 + T / 60 * 1; lb.hands[0].rotation.set(0, -Math.PI / 2, 0); lb.hands[0].rotateZ(-(3 + mins / 60) / 12 * TAU); lb.hands[1].rotation.set(0, -Math.PI / 2, 0); lb.hands[1].rotateZ(-(mins / 60) * TAU); }
      if (cur === 'relay' && ry) { tickMotes(ry.dust, f, 0.6); ry.arm.rotation.z = -0.1 * ST.click; ry.spark.material.opacity = 0.9 * ST.spark; ry.torch.material.opacity = 0.18 * ST.torch; }
      if (cur === 'desk' && dk) { const key = [Math.round(ST.wr * 200), Math.round(ST.circ * 40), ST.later].join('|'); if (key !== dk.lastKey) { dk.lastKey = key; const g = dk.cv.getContext('2d'); const st = { wr: ST.wr, circ: ST.circ, later: ST.later }; drawPage(g, 1024, 1400, st); dk.pen = st.pen; dk.tex.needsUpdate = true; }
        if (dk.faceKey !== ST.face) { dk.faceKey = ST.face; drawMothFlat(dk.mv.getContext('2d'), 512, 512, ST.face); dk.mtex.needsUpdate = true; }
        const d = ST.drop, mx = DESK.MOTH[0], mz = DESK.MOTH[2]; dk.moth.visible = d > 0.001; dk.moth.position.set(mx + 0.3 * (1 - d), 0.012 + 2.4 * (1 - d) ** 2, mz - 0.4 * (1 - d)); dk.moth.rotation.set(-Math.PI / 2 + 0.6 * (1 - d), 0, 2.4 * (1 - d), 'YXZ');
        const t = ST.tape; dk.tape.visible = t > 0.001; dk.tape.position.set(mx, 0.03 + 0.9 * (1 - t), DESK.MOTH[2] + 0.02); dk.tape.rotation.set(-Math.PI / 2 + 0.5 * (1 - t), 0, 0.12, 'YXZ'); dk.tape.scale.set(0.4 + 0.6 * t, 1, 1);
        // pencil follows the writing head (page canvas 1024x1400 maps to 2.05 x 2.8 at x = 1.04)
        const p = dk.pen || [180, 820], px = 1.04 - 1.025 + p[0] / 1024 * 2.05, pz = -1.4 + p[1] / 1400 * 2.8, writing = ST.wr > 0 && ST.wr < 1; dk.pencil.visible = ST.wr > 0 || ST.circ > 0;
        dk.pencil.position.set(px + (writing ? 0.01 * Math.sin(T * 40) : 0.25), writing ? 0.0 : 0.25, pz - (writing ? 0.02 * Math.abs(Math.sin(T * 23)) : 0)); dk.pencil.rotation.set(-0.5, 0.6, -0.35, 'YXZ'); }
      if (cur === 'edison' && ed) { tickMotes(ed.dust, f, 0.3); ed.gasG.material.opacity = 0.6 * (0.9 + 0.1 * Math.sin(f * 0.9)); }
      if (cur === 'museum' && mu) { tickMotes(mu.dust, f, 0.3); } },
    mood: (name) => { ST.mood = name; },
    apply: (v) => { for (const k of ['alarm', 'door', 'click', 'torch', 'wr', 'circ', 'tape', 'drop', 'spark', 'lampsOn', 'r70']) if (v[k] != null) ST[k] = v[k]; if (v.spots) ST.spots = v.spots; if (v.face) ST.face = v.face; } });
  lb = buildLab(API.groups.lab); ry = buildRelay(API.groups.relay); dk = buildDesk(API.groups.desk); ed = buildEdison(API.groups.edison);
  // museum page = a finished copy of the logbook page
  const mc = document.createElement('canvas'); mc.width = 1024; mc.height = 1400; drawPage(mc.getContext('2d'), 1024, 1400, { wr: 1, circ: 0, later: true }); const mtx = new THREE.CanvasTexture(mc); mtx.colorSpace = THREE.SRGBColorSpace; mtx.anisotropy = 8;
  mu = buildMuseum(API.groups.museum, mtx);
  API.parts = { lb, ry, dk, ed, mu };
  API.set = (o) => { for (const k in o) { if (k === 'spots') ST.spots = o.spots; else ST[k] = o[k]; } };
  API.glows = { lab: [lb.alarmG, lb.r70glow, ...lb.spots, ...lb.pendG], relay: [ry.spark, ry.torch], desk: [dk.lampG], edison: [ed.gasG, ed.hangG], museum: [mu.caseG] };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  const V = API.V, { ZP, FX, PH, CON } = LAB;
  API.views = [
    V('lab', [2.0, 1.7, 7.0], [-1.5, 1.4, -4.0], 50, 1.2, [-1.5, 1.3, -4.4]), // 0 wide of the Mark II room
    V('labCal', [6.6, 1.7, 0.6], [10, 1.9, 0.0], 44, 1.4, [10, 1.8, 0.4]), // 1 calendar / pennant / clock wall
    V('labAlarm', [FX + 2.6, 1.6, ZP + 4.4], [FX + 0.6, 1.8, ZP], 46, 1.3, [FX + 1.6, 2.6, ZP]), // 2 alarm
    V('labHunt', [FX + 4.5, 1.5, ZP + 3.4], [FX - 1.5, 1.3, ZP], 48, 1.3, [FX, 1.3, ZP], { spots: [[FX, 1.4, 1], [FX + 2.4, 1.0, 0.8]], alarm: 0.5, lampsOn: 0 }), // 3 hunt
    V('lab', [FX + 0.3, 1.35, ZP + 1.7], [FX + 0.1, 1.25, ZP], 40, 1.6, [FX + 0.16, 1.26, ZP - 0.15], { door: 1, r70: 1 }), // 4 Panel F door open, relay 70
    V('relay', [8, 4.2, 9], [3.4, 2.6, 0], 44, 1.2, [RELAY.CX, RELAY.CY, 0], { torch: 1 }), // 5 macro relay
    V('desk', [1.2, 2.6, 2.2], [0.8, 0, 0.0], 40, 1.0, [0.8, 0, 0], { wr: 1, tape: 1, drop: 1, face: 'daze' }), // 6 logbook
    V('deskQ', [0.9, 1.6, 1.1], [0.6, 0, 0.2], 36, 1.2, [0.6, 0, 0.2], { wr: 1, tape: 1, drop: 1, circ: 1, face: 'smile' }), // 7 'actual' circled
    V('edison', [0.2, 1.6, 4.4], [0.2, 1.3, -2.0], 48, 1.2, [0.6, 1.2, 0]), // 8 Edison's workshop
    V('edison', [1.9, 1.4, 1.6], [1.55, 0.8, 0.6], 40, 1.6, [1.55, 0.8, 0.6]), // 9 the letter
    V('museum', [0.4, 1.6, 4.2], [0, 1.3, 0], 44, 1.2, [0, 1.2, 0]), // 10 museum case
    V('museumGold', [0.25, 1.45, 1.4], [0, 1.24, -0.08], 36, 1.6, [0, 1.24, -0.08]), // 11 case close
    V('lab', [CON[0] + 1.6, 1.6, CON[2] + 2.4], [CON[0], 0.9, CON[2]], 44, 1.4, [CON[0], 0.9, CON[2]]), // 12 console
  ];
  API.setAll = API.set; API.set({}); API.tick(0);
  return API;
}
