// havana.js [CASTRO-havana]: 1960-63 Havana sets for "The CIA tried to make Castro's beard fall out".
//   plaza : a 1960 public square at a rally: pastel colonial arcades, wrought-iron balconies, a central speaker's balcony draped with
//           Cuban flags (lectern + period microphones), royal palms, 1950s American sedans, a back-facing crowd at the far end and an
//           open crowd area in front for character cards (spots.crowd). Late-afternoon tropical sun.           origin (3200, 0,   0)
//   radio : a 1960s radio studio: ribbon microphone on the desk, EN EL AIRE sign, control-booth glass (reel-to-reels + console),
//           acoustic panels, ashtray with cigars, a small air vent on the left wall (setSpray: faint mist).      origin (3200, 0, 200)
//   talks : 1963 negotiation room: long table, two chairs facing, ceiling fan, louvred shutters (sun slats), papers,
//           a gift box that opens (setGift) on a folded black diving wetsuit + mask.                             origin (3200, 0, 300)
//   cigar : tabletop close-up: ornate open cedar cigar box (invented label HABANOS ·1960·), cigars, a lighter, setCigarGlow,
//           free space on the right for a NEVER REACHED HIM board (spots.board, actor scale ~0.16).             origin (3200, 0, 400)
// Local frame per set: floor y = 0, camera side +z. Geometry through world.js Kit (merged per material, vertex colours).
// No brand logos anywhere; lettering is invented and period-plausible.
import { Kit, rboxGeo, signMat } from './world.js';
import { LIGHTS_ } from './story.js';
import { oddverra } from './oddverra_next.js';

let THREE, toon, mkTex, PT, M;
export const HAVANA_ORIGIN = { plaza: [3200, 0, 0], radio: [3200, 0, 200], talks: [3200, 0, 300], cigar: [3200, 0, 400] };
const O = HAVANA_ORIGIN, SETS = Object.keys(O);
const W3 = (name, p) => [p[0] + O[name][0], p[1] + O[name][1], p[2] + O[name][2]];
const INK = 0x2b1d4a;

// ---------------------------------------------------------------- geometry helpers
const GC = new Map();
const cached = (k, mk) => { let g = GC.get(k); if (!g) GC.set(k, (g = mk())); return g; };
const cyl = (rt, rb, h, rs = 12, open = false, t0 = 0, tl = Math.PI * 2) => cached(`c${rt}|${rb}|${h}|${rs}|${open}|${t0}|${tl}`, () => new THREE.CylinderGeometry(rt, rb, h, rs, 1, open, t0, tl));
const sph = (r, ws = 14, hs = 10) => cached(`s${r}|${ws}|${hs}`, () => new THREE.SphereGeometry(r, ws, hs));
const tor = (r, t, rs = 6, ts = 24, arc = Math.PI * 2) => cached(`t${r}|${t}|${rs}|${ts}|${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));
const plane = (w, h) => cached(`p${w}|${h}`, () => new THREE.PlaneGeometry(w, h));
const lathe = (key, pts, n = 20) => cached('la' + key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n));
const archPanel = (w, h, d, inset = 0) => cached(`ap${w}|${h}|${d}|${inset}`, () => { const s = new THREE.Shape(), r = w / 2 - inset; s.moveTo(-w / 2, 0); s.lineTo(-r, 0); s.absarc(0, 0, r, Math.PI, 0, true); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.lineTo(-w / 2, 0); return new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 14 }); });
// draped cloth: plane w x h hanging from its top edge, with n soft vertical folds (depth a)
const drape = (w, h, n = 5, a = 0.06) => cached(`dr${w}|${h}|${n}|${a}`, () => { const g = new THREE.PlaneGeometry(w, h, 24, 6); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), t = (h / 2 - y) / h; p.setZ(i, a * Math.sin(x / w * Math.PI * 2 * n) * (0.4 + 0.6 * t)); } g.translate(0, -h / 2, 0); g.computeVertexNormals(); return g; });
// waving flag: plane w x h, hoist edge at x = 0
const waveFlag = (w, h, a = 0.12) => cached(`wf${w}|${h}|${a}`, () => { const g = new THREE.PlaneGeometry(w, h, 20, 4); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + w / 2; p.setZ(i, a * Math.sin(x / w * 7.5) * (x / w)); } g.translate(w / 2, 0, 0); g.computeVertexNormals(); return g; });
const mesh = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz, 'YXZ'); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
const buildK = (K, parent, cast = true) => { const n0 = parent.children.length; K.build(parent, 0); if (!cast) for (let i = n0; i < parent.children.length; i++) parent.children[i].castShadow = false; };
const xcyl = (K, mat, r, x0, x1, y, z, c, rs = 12) => K.put(mat, cyl(r, r, Math.abs(x1 - x0), rs), (x0 + x1) / 2, y, z, 0, 0, Math.PI / 2, 1, 1, 1, c);
const zcyl = (K, mat, r, x, y, z0, z1, c, rs = 12) => K.put(mat, cyl(r, r, Math.abs(z1 - z0), rs), x, y, (z0 + z1) / 2, Math.PI / 2, 0, 0, 1, 1, 1, c);

// ---------------------------------------------------------------- painters
const css = (...a) => PT.css(...a), shade = (...a) => PT.shade(...a), tint = (...a) => PT.tint(...a), vary = (...a) => PT.vary(...a), rng = (s) => PT.rng(s), hex = (c) => PT.hex(c);
const modulate = (...a) => PT.modulate(...a), fbm = (...a) => PT.fbm(...a);
function plasterTex(g, w, h, o = {}) { // near-white weathered stucco (vertex colour tints it)
  g.fillStyle = '#f4efe6'; g.fillRect(0, 0, w, h); const R = rng(o.seed || 11);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(90,70,110,${0.03 + R() * 0.05})`; g.beginPath(); g.ellipse(R() * w, R() * h, 20 + R() * 90, 10 + R() * 50, R() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 18; i++) { const x = R() * w; g.fillStyle = 'rgba(80,60,90,0.07)'; g.fillRect(x, 0, 2 + R() * 6, h * (0.2 + R() * 0.6)); } // rain streaks
  for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(60,40,80,0.25)'; g.lineWidth = 1.2; g.beginPath(); let x = R() * w, y = R() * h; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (R() - 0.5) * 30; y += 8 + R() * 14; g.lineTo(x, y); } g.stroke(); }
  modulate(g, w, h, (u, v) => 0.93 + 0.1 * fbm(u, v, 3, 3, 3, o.seed || 11));
}
function pavingTex(g, w, h) { // big square granite flags with worn joints
  g.fillStyle = '#b8a896'; g.fillRect(0, 0, w, h); const n = 4, s = w / n, R = rng(17);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const c = vary([214, 200, 180], (R() - 0.5) * 0.14); g.fillStyle = css(c); g.fillRect(i * s + 3, j * s + 3, s - 6, s - 6); g.fillStyle = css(tint(c, 1.08), 0.6); g.fillRect(i * s + 4, j * s + 4, s - 8, 3);
    for (let k = 0; k < 30; k++) { g.fillStyle = css(shade(c, 0.85), 0.25); g.fillRect(i * s + R() * s, j * s + R() * s, 2 + R() * 4, 2); } }
  modulate(g, w, h, (u, v) => 0.9 + 0.14 * fbm(u, v, 3, 3, 3, 19));
}
function cementTile(g, w, h, o = {}) { // Cuban cement (mosaico) floor tile: 4x4 quatrefoil pattern
  const n = o.n || 4, s = w / n, a = o.a || '#b8553a', b = o.b || '#f0e2c4', c = o.c || '#3a5a6a'; g.fillStyle = b; g.fillRect(0, 0, w, h);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x = i * s, y = j * s; g.fillStyle = a; for (const [cx, cy] of [[0, 0], [s, 0], [0, s], [s, s]]) { g.beginPath(); g.arc(x + cx, y + cy, s * 0.32, 0, 7); g.fill(); }
    g.fillStyle = c; g.beginPath(); g.moveTo(x + s / 2, y + s * 0.18); g.lineTo(x + s * 0.82, y + s / 2); g.lineTo(x + s / 2, y + s * 0.82); g.lineTo(x + s * 0.18, y + s / 2); g.fill();
    g.fillStyle = b; g.beginPath(); g.arc(x + s / 2, y + s / 2, s * 0.1, 0, 7); g.fill(); g.strokeStyle = 'rgba(43,29,74,0.35)'; g.lineWidth = 2; g.strokeRect(x, y, s, s); }
  modulate(g, w, h, (u, v) => 0.9 + 0.12 * fbm(u, v, 3, 3, 3, 23));
}
function acousticTex(g, w, h) { // perforated acoustic tile panels with battens
  g.fillStyle = '#f0ece2'; g.fillRect(0, 0, w, h); const n = 4, s = w / n;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { g.fillStyle = 'rgba(60,40,90,0.18)'; g.fillRect(i * s, j * s, s, 3); g.fillRect(i * s, j * s, 3, s);
    for (let y = 10; y < s - 6; y += 11) for (let x = 10; x < s - 6; x += 11) { g.fillStyle = 'rgba(43,29,74,0.42)'; g.beginPath(); g.arc(i * s + x, j * s + y, 1.9, 0, 7); g.fill(); } }
  modulate(g, w, h, (u, v) => 0.95 + 0.07 * fbm(u, v, 3, 3, 2, 29));
}
function shopTex(g, w, h, kind = 0) { // shadowed shop doorway under the arcade
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a2c44'); gr.addColorStop(1, '#5a4050'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = rng(kind + 3);
  g.fillStyle = '#6a3a2a'; g.fillRect(0, 0, w * 0.08, h); g.fillRect(w * 0.92, 0, w * 0.08, h); g.fillRect(0, 0, w, h * 0.06);
  if (kind % 3 === 0) { g.fillStyle = 'rgba(255,214,150,0.35)'; g.fillRect(w * 0.15, h * 0.15, w * 0.7, h * 0.5); for (let k = 0; k < 4; k++) { g.fillStyle = css([170 + R() * 60, 90 + R() * 80, 60 + R() * 40]); g.fillRect(w * (0.2 + k * 0.16), h * (0.42 + R() * 0.1), w * 0.1, h * 0.22); } }
  else if (kind % 3 === 1) { g.fillStyle = '#7a4a2e'; for (let x = w * 0.12; x < w * 0.9; x += w * 0.09) g.fillRect(x, h * 0.08, w * 0.06, h * 0.9); }
  else { g.fillStyle = 'rgba(240,230,210,0.4)'; g.fillRect(w * 0.18, h * 0.3, w * 0.64, h * 0.08); g.fillStyle = 'rgba(30,20,40,0.6)'; g.beginPath(); g.ellipse(w * 0.5, h * 0.7, w * 0.15, h * 0.2, 0, 0, 7); g.fill(); }
}
function windowTex(g, w, h, open = 0) { // tall colonial window: louvred shutters (persianas), half-moon fanlight (vitral)
  g.fillStyle = '#2f4a4a'; g.fillRect(0, 0, w, h); const top = w * 0.5;
  const cols = ['#d84a3a', '#3a6ab8', '#e8c040', '#5aa86a', '#f0f0e8']; for (let k = 0; k < 7; k++) { g.fillStyle = cols[k % 5]; g.beginPath(); g.moveTo(w / 2, top); g.arc(w / 2, top, w * 0.46, Math.PI + k * Math.PI / 7, Math.PI + (k + 1) * Math.PI / 7); g.fill(); }
  g.strokeStyle = '#f4ecd8'; g.lineWidth = 4; g.beginPath(); g.arc(w / 2, top, w * 0.46, Math.PI, 0); g.stroke(); for (let k = 1; k < 7; k++) { const a = Math.PI + k * Math.PI / 7; g.beginPath(); g.moveTo(w / 2, top); g.lineTo(w / 2 + Math.cos(a) * w * 0.46, top + Math.sin(a) * w * 0.46); g.stroke(); }
  g.fillRect(0, top - 2, w, 6);
  const sh = open ? '#2a2236' : '#3a7a6a'; g.fillStyle = sh; g.fillRect(w * 0.05, top + 4, w * 0.9, h - top - 8);
  if (!open) for (let y = top + 10; y < h - 8; y += 9) { g.fillStyle = 'rgba(20,40,40,0.55)'; g.fillRect(w * 0.06, y, w * 0.88, 3); g.fillStyle = 'rgba(200,240,220,0.3)'; g.fillRect(w * 0.06, y + 3, w * 0.88, 1.5); }
  else { g.fillStyle = 'rgba(255,220,170,0.25)'; g.fillRect(w * 0.2, top + 20, w * 0.6, h * 0.3); g.fillStyle = '#3a7a6a'; g.fillRect(w * 0.05, top + 4, w * 0.16, h - top - 8); g.fillRect(w * 0.79, top + 4, w * 0.16, h - top - 8); }
  g.fillStyle = '#f4ecd8'; g.fillRect(w / 2 - 2, top, 4, h); g.fillRect(0, 0, w * 0.05, h); g.fillRect(w * 0.95, 0, w * 0.05, h);
}
// Cuban flag. vertical = hanging from a rail (stripes vertical, triangle at top)
function flagTex(g, w, h, vertical = false) {
  g.save(); if (vertical) { g.translate(w, 0); g.rotate(Math.PI / 2); [w, h] = [h, w]; }
  for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#f4f0ea' : '#1f3c9a'; g.fillRect(0, i * h / 5, w, h / 5 + 1); }
  g.fillStyle = '#d8262e'; g.beginPath(); g.moveTo(0, 0); g.lineTo(h * 0.866, h / 2); g.lineTo(0, h); g.fill();
  g.fillStyle = '#f8f4ec'; g.beginPath(); const cx = h * 0.29, cy = h / 2, R = h * 0.13; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? R * 0.4 : R; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.fill();
  g.restore(); modulate(g, vertical ? h : w, vertical ? w : h, (u, v) => 0.94 + 0.08 * fbm(u, v, 3, 3, 2, 37));
}
function frondTex(g, w, h) { // palm frond: rachis down the middle, leaflets (alpha)
  g.clearRect(0, 0, w, h); const R = rng(41);
  for (let y = 4; y < h; y += 7) { const t = y / h, L = w * 0.48 * Math.sin(Math.PI * Math.min(1, t * 1.15 + 0.08)), droop = 18 + t * 10; for (const s of [-1, 1]) { const c = vary([86, 140, 70], (R() - 0.5) * 0.2);
    g.strokeStyle = css(c); g.lineWidth = 5.5 - t * 2; g.beginPath(); g.moveTo(w / 2, y); g.quadraticCurveTo(w / 2 + s * L * 0.5, y + droop * 0.2, w / 2 + s * L, y + droop); g.stroke();
    g.strokeStyle = css(shade(c, 0.6), 0.7); g.lineWidth = 1.2; g.beginPath(); g.moveTo(w / 2, y + 2); g.quadraticCurveTo(w / 2 + s * L * 0.5, y + droop * 0.2 + 2, w / 2 + s * L, y + droop + 2); g.stroke(); } }
  g.strokeStyle = '#a8a058'; g.lineWidth = 6; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
}
function labelTex(g, w, h) { // inner-lid label of the cigar box: invented, ornate lithograph
  const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7); gr.addColorStop(0, '#f8ecc8'); gr.addColorStop(1, '#d8b878'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#b8862a'; g.lineWidth = 14; g.strokeRect(10, 10, w - 20, h - 20); g.strokeStyle = '#8a2a22'; g.lineWidth = 4; g.strokeRect(26, 26, w - 52, h - 52);
  for (let k = 0; k < 40; k++) { const x = 40 + k * (w - 80) / 39; g.fillStyle = '#b8862a'; g.beginPath(); g.arc(x, 36, 4, 0, 7); g.fill(); g.beginPath(); g.arc(x, h - 36, 4, 0, 7); g.fill(); }
  // medallion with palms + sun, ribbon banner
  g.fillStyle = '#e8d098'; g.beginPath(); g.ellipse(w / 2, h * 0.43, w * 0.16, h * 0.27, 0, 0, 7); g.fill(); g.strokeStyle = '#b8862a'; g.lineWidth = 6; g.stroke();
  g.fillStyle = '#f0b040'; g.beginPath(); g.arc(w / 2, h * 0.42, h * 0.08, 0, 7); g.fill(); for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g.strokeStyle = '#e89a30'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * h * 0.1, h * 0.42 + Math.sin(a) * h * 0.1); g.lineTo(w / 2 + Math.cos(a) * h * 0.15, h * 0.42 + Math.sin(a) * h * 0.15); g.stroke(); }
  g.fillStyle = '#3a6a3a'; g.fillRect(w / 2 - 4, h * 0.5, 8, h * 0.16); g.beginPath(); g.ellipse(w / 2, h * 0.5, 30, 10, 0, 0, 7); g.fill();
  for (const s of [-1, 1]) { g.fillStyle = '#c84a2a'; g.beginPath(); g.moveTo(w / 2 + s * w * 0.34, h * 0.2); g.quadraticCurveTo(w / 2 + s * w * 0.2, h * 0.1, w / 2 + s * w * 0.18, h * 0.32); g.quadraticCurveTo(w / 2 + s * w * 0.26, h * 0.36, w / 2 + s * w * 0.34, h * 0.2); g.fill();
    g.fillStyle = '#d8a848'; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(w / 2 + s * (w * 0.24 + k * 14), h * (0.6 + k * 0.04), 7, 0, 7); g.fill(); } }
  g.fillStyle = '#8a2a22'; g.beginPath(); g.moveTo(w * 0.12, h * 0.68); g.lineTo(w * 0.88, h * 0.68); g.lineTo(w * 0.84, h * 0.76); g.lineTo(w * 0.88, h * 0.84); g.lineTo(w * 0.12, h * 0.84); g.lineTo(w * 0.16, h * 0.76); g.fill();
  g.fillStyle = '#f4dc98'; g.font = `bold ${h * 0.11 | 0}px "DejaVu Serif", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HABANOS ·1960·', w / 2, h * 0.765);
  g.fillStyle = '#5a2a1a'; g.font = `italic ${h * 0.05 | 0}px "DejaVu Serif", serif`; g.fillText('hechos a mano', w / 2, h * 0.9);
}
function bandTex(g, w, h) { // cigar band: red + gold, no brand
  g.fillStyle = '#b8262a'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8c060'; g.fillRect(0, 0, w, h * 0.18); g.fillRect(0, h * 0.82, w, h * 0.18);
  for (let x = 0; x < w; x += w / 8) { g.fillStyle = '#f0d078'; g.beginPath(); g.ellipse(x + w / 16, h / 2, w / 26, h * 0.22, 0, 0, 7); g.fill(); g.fillStyle = '#8a1a1a'; g.beginPath(); g.arc(x + w / 16, h / 2, h * 0.08, 0, 7); g.fill(); }
}
function cigarTex(g, w, h) { // wrapper leaf: brown with veins
  g.fillStyle = '#8a5a34'; g.fillRect(0, 0, w, h); const R = rng(53);
  for (let i = 0; i < 26; i++) { g.strokeStyle = `rgba(${60 + R() * 30},${36 + R() * 20},20,0.5)`; g.lineWidth = 1 + R() * 1.5; g.beginPath(); const y = R() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + (R() - 0.5) * 40, w * 0.6, y + (R() - 0.5) * 40, w, y + (R() - 0.5) * 30); g.stroke(); }
  for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(190,140,90,0.35)'; g.lineWidth = 2; g.beginPath(); const y = R() * h; g.moveTo(0, y); g.lineTo(w, y + 20); g.stroke(); }
  modulate(g, w, h, (u, v) => 0.9 + 0.15 * fbm(u, v, 4, 4, 3, 57));
}
function onAirTex(g, w, h, on) {
  g.fillStyle = on ? '#e02a20' : '#4a1a1a'; g.fillRect(0, 0, w, h); 
  g.strokeStyle = on ? '#ffd8c0' : '#7a3a3a'; g.lineWidth = 8; g.strokeRect(14, 14, w - 28, h - 28);
  g.fillStyle = on ? '#fff4e8' : '#8a4a40'; g.font = `bold ${h * 0.5 | 0}px "DejaVu Sans", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; const t = 'EN EL AIRE', mw = g.measureText(t).width; g.save(); g.translate(w / 2, h * 0.53); g.scale(Math.min(1, (w - 70) / mw), 1); g.fillText(t, 0, 0); g.restore();
}
function boothTex(g, w, h) { // backdrop behind the booth: rack of equipment
  g.fillStyle = '#4a5a60'; g.fillRect(0, 0, w, h); const R = rng(61);
  for (let x = 20; x < w - 20; x += 90) { g.fillStyle = '#2a3238'; g.fillRect(x, 30, 80, h - 60); for (let y = 40; y < h - 60; y += 38) { g.fillStyle = '#5a6870'; g.fillRect(x + 5, y, 70, 30); for (let k = 0; k < 4; k++) { g.fillStyle = R() > 0.6 ? '#ffb040' : '#1a1a1a'; g.beginPath(); g.arc(x + 15 + k * 16, y + 15, 4, 0, 7); g.fill(); } } }
}
function consoleTex(g, w, h) { // engineers' console top: knobs, faders, VU meters
  g.fillStyle = '#6a7a70'; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 6; k++) { const x = 20 + k * (w - 40) / 6; g.fillStyle = '#f4e8c0'; g.fillRect(x + 8, 12, (w - 40) / 6 - 16, h * 0.28); g.strokeStyle = '#2b1d4a'; g.lineWidth = 2; g.beginPath(); g.arc(x + (w - 40) / 12, 12 + h * 0.28, h * 0.2, -2.4, -0.7); g.stroke(); g.beginPath(); g.moveTo(x + (w - 40) / 12, 12 + h * 0.28); g.lineTo(x + (w - 40) / 12 + 10 * Math.cos(-1.2 - k * 0.15), 12 + h * 0.28 + 18 * Math.sin(-1.2 - k * 0.15)); g.stroke();
    for (let j = 0; j < 3; j++) { g.fillStyle = '#1e1a20'; g.beginPath(); g.arc(x + 20 + j * 18, h * 0.52, 7, 0, 7); g.fill(); g.fillStyle = '#d8d0c0'; g.fillRect(x + 19 + j * 18, h * 0.52 - 7, 2, 6); }
    g.fillStyle = '#2a2a2a'; g.fillRect(x + 30, h * 0.66, 6, h * 0.28); g.fillStyle = '#d8d0c0'; g.fillRect(x + 24, h * (0.7 + (k % 3) * 0.06), 18, 9); }
}
function paperTex(g, w, h, o = {}) { // typed document page
  g.fillStyle = '#f4eedc'; g.fillRect(0, 0, w, h); const R = rng(o.seed || 71);
  if (o.head) { g.fillStyle = '#2b1d4a'; g.font = `bold ${h * 0.045 | 0}px "DejaVu Serif", serif`; g.textAlign = 'center'; g.fillText(o.head, w / 2, h * 0.09); }
  for (let y = h * 0.16; y < h * 0.9; y += h * 0.032) { if (R() < 0.12) { y += h * 0.02; continue; } g.fillStyle = 'rgba(43,29,74,0.5)'; g.fillRect(w * 0.1, y, w * (0.5 + R() * 0.3), 2.5); }
  modulate(g, w, h, (u, v) => 0.95 + 0.06 * fbm(u, v, 3, 3, 2, o.seed || 71));
}
function paintingTex(g, w, h) { // framed landscape: tobacco valley with royal palms + mogotes (no figures)
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8ab8e0'); gr.addColorStop(0.5, '#f8d8a8'); gr.addColorStop(1, '#6a9a5a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#5a7a6a'; g.beginPath(); g.moveTo(0, h * 0.55); for (let x = 0; x <= w; x += w / 6) g.quadraticCurveTo(x + w / 12, h * (0.3 + (x / w) * 0.1), x + w / 6, h * 0.55); g.fill();
  g.fillStyle = '#4a8a4a'; g.fillRect(0, h * 0.6, w, h * 0.4); for (let y = h * 0.64; y < h; y += 14) { g.fillStyle = 'rgba(40,80,30,0.5)'; g.fillRect(0, y, w, 4); }
  for (const x of [0.2, 0.7, 0.85]) { g.strokeStyle = '#8a8070'; g.lineWidth = 4; g.beginPath(); g.moveTo(w * x, h * 0.75); g.lineTo(w * x, h * 0.4); g.stroke(); g.fillStyle = '#3a6a3a'; for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(w * x + Math.cos(k) * 14, h * 0.4 + Math.sin(k) * 5, 18, 5, k, 0, 7); g.fill(); } }
  g.fillStyle = '#8a5a3a'; g.fillRect(w * 0.4, h * 0.58, w * 0.14, h * 0.08); g.fillStyle = '#6a3a2a'; g.beginPath(); g.moveTo(w * 0.38, h * 0.58); g.lineTo(w * 0.47, h * 0.5); g.lineTo(w * 0.56, h * 0.58); g.fill();
}
function softTex(g, w, h) { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
function skyViewTex(g, w, h) { // bright Havana street seen through the shutters
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fff4dc'); gr.addColorStop(0.55, '#ffe0b0'); gr.addColorStop(1, '#e8b890'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(240,180,150,0.6)'; g.fillRect(0, h * 0.35, w * 0.4, h * 0.65); g.fillStyle = 'rgba(170,210,220,0.6)'; g.fillRect(w * 0.55, h * 0.25, w * 0.45, h * 0.75);
  g.fillStyle = 'rgba(120,170,110,0.6)'; g.beginPath(); g.ellipse(w * 0.45, h * 0.3, w * 0.12, h * 0.05, 0, 0, 7); g.fill();
}
function wallpaperTex(g, w, h) { // dark green damask (cigar set background)
  g.fillStyle = '#3a5a48'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += h / 4) for (let x = 0; x < w; x += w / 4) { const ox = (y / (h / 4)) % 2 ? w / 8 : 0; g.fillStyle = 'rgba(200,220,170,0.16)'; g.beginPath(); g.ellipse(x + ox + w / 8, y + h / 8, w / 18, h / 10, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + ox + w / 8, y + h / 8, w / 10, h / 30, 0, 0, 7); g.fill(); }
  for (let x = 0; x < w; x += w / 8) { g.fillStyle = 'rgba(20,30,30,0.12)'; g.fillRect(x, 0, 3, h); }
}

// ---------------------------------------------------------------- materials
function materials() {
  const vc = (o = {}) => toon({ vertexColors: true, ...o }), T = (w, h, fn, rep) => mkTex(w, h, fn, rep), m = {};
  m.paint = vc(); m.metal = vc(); m.chrome = vc({ emissive: 0x2a2a34 }); m.brass = vc({ emissive: 0x2a1a00 }); m.rubber = vc();
  m.plaster = vc({ map: T(512, 512, (g, w, h) => plasterTex(g, w, h)) });
  m.paving = vc({ map: T(512, 512, pavingTex) });
  m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#b08a62', n: 6, seed: 33 })) });
  m.woodDark = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#6a4434', n: 4, seed: 35, joints: 0 })) });
  m.tileRed = vc({ map: T(512, 512, (g, w, h) => cementTile(g, w, h)) });
  m.tileBlue = vc({ map: T(512, 512, (g, w, h) => cementTile(g, w, h, { a: '#2f5a8a', b: '#f2e8d0', c: '#c88a3a' })) });
  m.acoustic = vc({ map: T(512, 512, acousticTex) });
  m.fabric = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#ffffff' })) });
  m.wallpaper = toon({ map: T(512, 512, wallpaperTex) });
  m.shop = [0, 1, 2].map((k) => toon({ map: T(256, 512, (g, w, h) => shopTex(g, w, h, k)) }));
  m.win = [toon({ map: T(256, 512, (g, w, h) => windowTex(g, w, h, 0)) }), toon({ map: T(256, 512, (g, w, h) => windowTex(g, w, h, 1)) })];
  m.flagV = toon({ map: T(512, 1024, (g, w, h) => flagTex(g, w, h, true)), side: THREE.DoubleSide });
  m.flagH = toon({ map: T(1024, 512, (g, w, h) => flagTex(g, w, h, false)), side: THREE.DoubleSide });
  m.frond = toon({ map: T(256, 512, frondTex), alphaTest: 0.5, side: THREE.DoubleSide });
  m.label = toon({ map: T(512, 320, labelTex), emissive: 0x201810 });
  m.band = toon({ map: T(256, 64, bandTex) });
  m.cigar = toon({ map: T(256, 256, cigarTex), emissive: 0x000000 });
  m.onAir = toon({ map: T(512, 160, (g, w, h) => onAirTex(g, w, h, true)), emissive: 0x9a8a80 }); m.onAir.emissiveMap = m.onAir.map;
  m.onAirOff = toon({ map: T(512, 160, (g, w, h) => onAirTex(g, w, h, false)) });
  m.booth = toon({ map: T(512, 256, boothTex), emissive: 0x203038 });
  m.console = toon({ map: T(512, 256, consoleTex), emissive: 0x302a20 });
  m.paper = toon({ map: T(256, 352, (g, w, h) => paperTex(g, w, h, { seed: 3 })) });
  m.paper2 = toon({ map: T(256, 352, (g, w, h) => paperTex(g, w, h, { seed: 9, head: 'MEMORANDUM' })) });
  m.painting = toon({ map: T(512, 384, paintingTex) });
  m.skyView = new THREE.MeshBasicMaterial({ map: T(256, 512, skyViewTex), fog: false });
  m.glass = new THREE.MeshBasicMaterial({ color: 0xc8dcff, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  m.glowWarm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc477).multiplyScalar(2.6), fog: false });
  m.ember = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff6a30).multiplyScalar(2.5), fog: false });
  m.vu = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd890).multiplyScalar(1.6), fog: false });
  const soft = T(128, 128, softTex);
  m.mist = new THREE.MeshBasicMaterial({ map: soft, color: 0xb8ccb4, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  m.halo = new THREE.MeshBasicMaterial({ map: soft, color: 0x30d050, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  m.beam = new THREE.MeshBasicMaterial({ color: 0xfff0d0, transparent: true, opacity: 0.05, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  m.smoke = new THREE.MeshBasicMaterial({ map: soft, color: 0xe8e4f0, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
  return m;
}
const NOINK = new Set(); // meshes kept out of the normal/depth pass (mist, glass, halos)
const noink = (m) => { NOINK.add(m); m.castShadow = false; m.receiveShadow = false; return m; };
function sign(K, text, bg, fg, w, h, x, y, z, ry = 0, o = {}) { const mt = signMat(text, bg, fg, { w: 1024, h: Math.max(96, Math.round(1024 * h / w)), fs: o.fs || 0.56 });
  K.at(x, y, z, ry, () => { K.box(M.woodDark, -w / 2 - 0.04, w / 2 + 0.04, -h / 2 - 0.04, h / 2 + 0.04, -0.05, -0.005, 0x5a3a2a, 0.01); K.put(mt, plane(w, h), 0, 0, 0.002); }); }

// ================================================================= shared props
// 1950s American sedan (no badges): two-tone, tail fins, chrome, whitewalls. Local: length along x, front at +x.
function car(K, x, z, ry, c1, c2) {
  K.at(x, 0, z, ry, () => { const L = 5.3, W = 1.95, chrome = 0xd8dce8;
    K.put(M.paint, rboxGeo(L, 0.56, W, 0.2, 2, 2), 0, 0.68, 0, 0, 0, 0, 1, 1, 1, c1);                                    // body
    K.put(M.paint, rboxGeo(L * 0.96, 0.08, W + 0.02, 0.03, 2, 1), 0, 0.84, 0, 0, 0, 0, 1, 1, 1, chrome);                    // side chrome strip
    K.put(M.paint, rboxGeo(2.3, 0.46, W * 0.86, 0.16, 2, 2), -0.25, 1.17, 0, 0, 0, 0, 1, 1, 1, c2);                     // cabin roof
    for (const s of [-1, 1]) { K.put(M.paint, rboxGeo(2.0, 0.3, 0.02, 0.01, 2, 1), -0.25, 1.15, s * W * 0.435, 0, 0, 0, 1, 1, 1, 0x4a5a7a); } // side glass
    K.put(M.paint, rboxGeo(0.04, 0.3, W * 0.78, 0.01, 2, 1), 0.94, 1.13, 0, 0, 0, -0.55, 1, 1, 1, 0x6a7a9a);           // windscreen
    K.put(M.paint, rboxGeo(0.04, 0.28, W * 0.78, 0.01, 2, 1), -1.42, 1.12, 0, 0, 0, 0.6, 1, 1, 1, 0x5a6a8a);
    for (const s of [-1, 1]) K.put(M.paint, rboxGeo(1.2, 0.2, 0.08, 0.04, 2, 1), -L / 2 + 0.6, 1.02, s * (W / 2 - 0.08), 0, 0, 0.12, 1, 1, 1, c1); // fins
    for (const s of [-1, 1]) K.put(M.ember, sph(0.06, 8, 6), -L / 2 + 0.02, 1.02, s * (W / 2 - 0.1), 0, 0, 0, 1, 1, 1);  // tail lights
    for (const sx of [-1, 1]) K.put(M.chrome, rboxGeo(0.14, 0.14, W + 0.06, 0.06, 2, 2), sx * (L / 2 + 0.02), 0.5, 0, 0, 0, 0, 1, 1, 1, chrome); // bumpers
    K.put(M.chrome, rboxGeo(0.06, 0.2, W * 0.7, 0.02, 2, 1), L / 2 + 0.01, 0.72, 0, 0, 0, 0, 1, 1, 1, 0xb8bcc8);          // grille
    for (const s of [-1, 1]) { K.put(M.chrome, cyl(0.11, 0.11, 0.06, 14), L / 2 - 0.02, 0.78, s * 0.72, 0, 0, Math.PI / 2, 1, 1, 1, chrome); K.put(M.glowWarm, cyl(0.08, 0.08, 0.02, 12), L / 2 + 0.02, 0.78, s * 0.72, 0, 0, Math.PI / 2); }
    for (const wx of [-1.62, 1.55]) for (const s of [-1, 1]) { K.put(M.rubber, cyl(0.36, 0.36, 0.24, 18), wx, 0.36, s * (W / 2 - 0.1), Math.PI / 2, 0, 0, 1, 1, 1, 0x1e1a22); K.put(M.paint, cyl(0.24, 0.24, 0.25, 18), wx, 0.36, s * (W / 2 - 0.1), Math.PI / 2, 0, 0, 1, 1, 1, 0xf4f0e8); K.put(M.chrome, cyl(0.15, 0.15, 0.26, 14), wx, 0.36, s * (W / 2 - 0.1), Math.PI / 2, 0, 0, 1, 1, 1, chrome);
      K.put(M.paint, cyl(0.46, 0.46, 0.04, 18, false, 0, Math.PI), wx, 0.4, s * (W / 2 + 0.005), Math.PI / 2, 0, 0, 1, 1, 1, c1); } // wheel arch skirt
  });
}
function palm(K, x, z, h = 11, seed = 1) { // royal palm: smooth pale trunk with a mid bulge, green crownshaft, drooping fronds
  const R = rng(seed);
  K.put(M.paint, lathe('palm', [[0.0, 0], [0.34, 0], [0.3, 0.1], [0.27, 0.35], [0.33, 0.55], [0.24, 0.85], [0.2, 1.0], [0, 1.0]], 12), x, 0, z, 0, 0, 0, 1, h - 1.6, 1, 0xb8b0a8);
  for (let y = 0.6; y < h - 2; y += 0.55 + R() * 0.3) K.put(M.paint, tor(0.29 - y / h * 0.1, 0.012, 3, 12), x, y, z, Math.PI / 2, 0, 0, 1, 1, 1, 0x8a8078);
  K.put(M.paint, cyl(0.17, 0.21, 1.7, 10), x, h - 0.8, z, 0, 0, 0, 1, 1, 1, 0x5a8a4a);
  for (let k = 0; k < 13; k++) { const az = k * 2.4 + R() * 0.4, up = k < 3; K.at(x, h, z, az, () => { let py = 0, pz = 0; const segs = 3, L = 1.35, a0 = up ? -0.9 : -0.25 + R() * 0.25;
    for (let s = 0; s < segs; s++) { const a = a0 + s * (up ? 0.45 : 0.42); const cz = pz + Math.cos(a) * L / 2, cy = py - Math.sin(a) * L / 2; K.put(M.frond, plane(1.7 - s * 0.35, L), 0, cy, cz, a + Math.PI / 2, 0, (R() - 0.5) * 0.3); pz += Math.cos(a) * L; py -= Math.sin(a) * L; } }); }
}
// wrought-iron balcony: slab + railing (balusters + scrolls) in front of a facade at z
function ironBalcony(K, x, y, z, w, d = 0.6, slabC = 0xe8e0d0) {
  const iron = 0x22202a; K.box(M.plaster, x - w / 2, x + w / 2, y - 0.14, y, z, z + d, slabC, 0.02); for (const s of [-1, 1]) K.put(M.plaster, cyl(0.03, 0.12, 0.4, 6), x + s * (w / 2 - 0.15), y - 0.32, z + 0.25, Math.PI / 2 - 0.6, 0, 0, 1, 1, 1, slabC);
  const top = y + 0.95; K.box(M.metal, x - w / 2, x + w / 2, top - 0.03, top, z + d - 0.05, z + d, iron, 0.008); K.box(M.metal, x - w / 2, x + w / 2, y + 0.12, y + 0.15, z + d - 0.05, z + d, iron, 0.006);
  for (const s of [-1, 1]) { K.box(M.metal, x + s * w / 2 - 0.03, x + s * w / 2, y, top, z, z + d, iron, 0.006); K.box(M.metal, x + s * w / 2 - 0.02, x + s * w / 2, top - 0.03, top, z, z + d, iron, 0.006); }
  for (let bx = x - w / 2 + 0.1; bx < x + w / 2 - 0.05; bx += 0.12) K.beam(M.metal, [bx, y, z + d - 0.025], [bx, top, z + d - 0.025], 0.012, iron);
  for (let bx = x - w / 2 + 0.25; bx < x + w / 2 - 0.2; bx += 0.48) K.put(M.metal, tor(0.09, 0.01, 3, 10), bx, top - 0.16, z + d - 0.025, 0, 0, 0, 1, 1, 1, iron);
}
// colonial facade along local x (-w/2..w/2) facing +z; front plane at z = 0; arcade portal goes back to z = -dA
function facade(K, w, o) {
  const H0 = 4.6, FH = 3.8, floors = o.floors || 2, H = H0 + FH * (floors - 1) + 0.8, wall = o.wall, trim = o.trim || 0xf4ecdc, bays = o.bays || Math.round(w / 3.6), bw = w / bays, dA = o.arcade ? 3.0 : 0;
  // upper mass
  K.box(M.plaster, -w / 2, w / 2, H0, H, -9, 0, wall, 0.02, 3);
  // ground floor: arcade (piers + arches) or shop fronts
  if (o.arcade) { const spring = 3.0, inset = 0.32;
    for (let i = 0; i <= bays; i++) { const px = -w / 2 + i * bw; K.box(M.plaster, px - inset, px + inset, 0, spring, -0.6, 0, wall, 0.03, 3); K.box(M.plaster, px - inset - 0.06, px + inset + 0.06, 0, 0.45, -0.66, 0.04, shadeC(wall, 0.8), 0.02); K.box(M.plaster, px - inset - 0.06, px + inset + 0.06, spring - 0.15, spring, -0.66, 0.04, trim, 0.02); }
    for (let i = 0; i < bays; i++) { const cx = -w / 2 + (i + 0.5) * bw; K.put(M.plaster, archPanel(bw, H0 - spring, 0.6, inset), cx, spring, -0.6, 0, 0, 0, 1, 1, 1, wall);
      K.put(M.shop[i % 3], plane(bw - 1.4, 3.4), cx, 1.7, -dA + 0.02); K.box(M.plaster, cx - bw / 2, cx + bw / 2, 3.5, H0, -dA - 0.05, -dA + 0.01, shadeC(wall, 0.92), 0.01);
      for (const s of [-1, 1]) K.box(M.plaster, cx + s * (bw / 2 - 0.35) - 0.35, cx + s * (bw / 2 - 0.35) + 0.35, 0, 3.5, -dA - 0.05, -dA + 0.01, shadeC(wall, 0.92), 0.01);
      K.put(M.glowWarm, sph(0.07, 8, 6), cx, H0 - 0.55, -dA * 0.5); K.beam(M.metal, [cx, H0 - 0.48, -dA * 0.5], [cx, H0, -dA * 0.5], 0.01, 0x22202a); }
    K.box(M.plaster, -w / 2, w / 2, H0 - 0.08, H0, -dA, -0.6, shadeC(wall, 0.85), 0.01); K.box(M.paving, -w / 2, w / 2, -0.02, 0.12, -dA, 0, 0xd8c8b0, 0.01);
    K.box(M.plaster, -w / 2, w / 2, 0, H0, -9, -dA, shadeC(wall, 0.9), 0.01, 3);
  } else { K.box(M.plaster, -w / 2, w / 2, 0, H0, -9, 0, wall, 0.02, 3); K.box(M.plaster, -w / 2, w / 2, 0, 0.6, -0.02, 0.06, shadeC(wall, 0.75), 0.01);
    for (let i = 0; i < bays; i++) { const cx = -w / 2 + (i + 0.5) * bw; K.put(M.shop[(i + 1) % 3], plane(1.7, 3.0), cx, 1.55, 0.03); K.box(M.plaster, cx - 1.05, cx + 1.05, 3.05, 3.3, 0, 0.12, trim, 0.02); K.box(M.plaster, cx - 1.05, cx - 0.85, 0, 3.05, 0, 0.1, trim, 0.02); K.box(M.plaster, cx + 0.85, cx + 1.05, 0, 3.05, 0, 0.1, trim, 0.02); } }
  // string course, upper windows + balconies, pilasters, cornice + parapet
  K.box(M.plaster, -w / 2 - 0.05, w / 2 + 0.05, H0 - 0.05, H0 + 0.22, 0, 0.16, trim, 0.02);
  for (let f = 1; f < floors; f++) { const y0 = H0 + FH * (f - 1) + 0.25;
    for (let i = 0; i < bays; i++) { const cx = -w / 2 + (i + 0.5) * bw; if (o.skip && o.skip(i, f)) continue; const ww = Math.min(1.5, bw * 0.42), wh = 2.9;
      K.put(M.win[(i + f + (o.seed || 0)) % 4 === 0 ? 1 : 0], plane(ww, wh), cx, y0 + wh / 2 + 0.05, 0.02);
      K.box(M.plaster, cx - ww / 2 - 0.14, cx - ww / 2, y0, y0 + wh + 0.1, 0, 0.1, trim, 0.015); K.box(M.plaster, cx + ww / 2, cx + ww / 2 + 0.14, y0, y0 + wh + 0.1, 0, 0.1, trim, 0.015);
      K.box(M.plaster, cx - ww / 2 - 0.22, cx + ww / 2 + 0.22, y0 + wh + 0.1, y0 + wh + 0.3, 0, 0.16, trim, 0.02); K.box(M.plaster, cx - 0.16, cx + 0.16, y0 + wh + 0.3, y0 + wh + 0.55, 0, 0.12, trim, 0.02);
      if (o.balc !== false) ironBalcony(K, cx, y0, 0, ww + 0.7, 0.55, trim); }
    }
  for (let i = 0; i <= bays; i++) K.box(M.plaster, -w / 2 + i * bw - 0.18, -w / 2 + i * bw + 0.18, H0 + 0.22, H - 0.7, 0, 0.08, shadeC(wall, 1.06), 0.01);
  K.box(M.plaster, -w / 2 - 0.1, w / 2 + 0.1, H - 0.75, H - 0.45, 0, 0.3, trim, 0.03); K.box(M.plaster, -w / 2 - 0.15, w / 2 + 0.15, H - 0.45, H - 0.3, 0, 0.42, trim, 0.03);
  K.box(M.plaster, -w / 2, w / 2, H - 0.3, H + 0.6, -0.1, 0.2, wall, 0.02); for (let px = -w / 2; px <= w / 2 + 0.01; px += bw) K.box(M.plaster, px - 0.22, px + 0.22, H - 0.3, H + 0.95, -0.12, 0.24, trim, 0.03);
  if (o.tiles) K.box(M.paint, -w / 2, w / 2, H + 0.6, H + 0.7, -9, 0.1, 0xb85a3a, 0.02);
  return H;
}
const shadeC = (c, k) => { const cc = new THREE.Color(c); return cc.multiplyScalar(k); };
// period microphone on a short stand (lectern / rally)
function rallyMic(K, x, y, z, ry = 0) { K.at(x, y, z, ry, () => { const m = 0x2a2830, c = 0xc8ccd8; K.put(M.metal, cyl(0.06, 0.07, 0.03, 12), 0, 0.015, 0, 0, 0, 0, 1, 1, 1, m); K.beam(M.metal, [0, 0.02, 0], [0, 0.32, 0.06], 0.012, m, true);
  K.put(M.chrome, rboxGeo(0.07, 0.11, 0.05, 0.025, 2, 2), 0, 0.38, 0.08, -0.4, 0, 0, 1, 1, 1, c); K.put(M.metal, rboxGeo(0.072, 0.03, 0.052, 0.01, 2, 1), 0, 0.34, 0.07, -0.4, 0, 0, 1, 1, 1, m); }); }
// ribbon microphone (big pill-shaped grille, yoke, desk stand)
function ribbonMic(K, x, y, z, ry = 0, s = 1) { K.at(x, y, z, ry, () => { const m = 0x2a2a32, c = 0xc8ccd6;
  K.put(M.metal, cyl(0.12, 0.14, 0.03, 18), 0, 0.015, 0, 0, 0, 0, 1, 1, 1, m); K.put(M.chrome, cyl(0.012, 0.012, 0.3, 8), 0, 0.17, 0, 0, 0, 0, 1, 1, 1, c);
  K.put(M.metal, tor(0.085, 0.01, 4, 16, Math.PI), 0, 0.42, 0, 0, 0, Math.PI, 1, 1.3, 1, m);
  K.put(M.chrome, cyl(0.07, 0.07, 0.17, 18), 0, 0.49, 0, 0, 0, 0, 1, 1, 0.72, c); for (const sy of [-1, 1]) K.put(M.chrome, sph(0.07, 16, 8), 0, 0.49 + sy * 0.085, 0, 0, 0, 0, 1, 0.6, 0.72, c);
  for (let k = -3; k <= 3; k++) K.put(M.metal, tor(0.071, 0.004, 3, 18), 0, 0.49 + k * 0.022, 0, Math.PI / 2, 0, 0, 1, 0.72, 1, 0x8a8e9a);
  K.put(M.metal, rboxGeo(0.03, 0.05, 0.012, 0.004, 2, 1), 0, 0.49, 0.053, 0, 0, 0, 1, 1, 1, 0x3a3440); }, s); }
function cigarAt(K, x, y, z, ry, len = 0.15, r = 0.009, lit = false) { K.at(x, y, z, ry, () => { K.put(M.cigar, cyl(r, r, len, 12), 0, 0, 0, 0, 0, Math.PI / 2); K.put(M.cigar, sph(r, 12, 8), len / 2, 0, 0, 0, 0, 0, 1.6, 1, 1); K.put(M.band, cyl(r * 1.06, r * 1.06, len * 0.1, 12), len * 0.3, 0, 0, 0, 0, Math.PI / 2);
  if (lit) { K.put(M.paint, cyl(r * 0.98, r * 0.98, r * 1.6, 12), -len / 2 - r * 0.8, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x9a9490); K.put(M.ember, cyl(r * 0.8, r * 0.8, r * 0.3, 10), -len / 2 - r * 1.65, 0, 0, 0, 0, Math.PI / 2); } }); }
function ashtray(K, x, y, z, s = 1) { K.at(x, y, z, 0, () => { K.put(M.glass === 0 ? M.paint : M.paint, lathe('ash', [[0, 0], [0.07, 0], [0.075, 0.01], [0.07, 0.03], [0.055, 0.03], [0.05, 0.012], [0, 0.012]], 18), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0x8aa8b8);
  for (let k = 0; k < 3; k++) K.box(M.paint, -0.008, 0.008, 0.024, 0.032, 0.05, 0.078, 0x6a8898, 0.003, 2), K.at(0, 0, 0, (k + 1) * 2.094, () => K.box(M.paint, -0.008, 0.008, 0.024, 0.032, 0.05, 0.078, 0x6a8898, 0.003, 2));
  K.put(M.paint, cyl(0.035, 0.04, 0.006, 12), 0, 0.014, 0, 0, 0, 0, 1, 1, 1, 0x9a9498); }, s); }
function chair(K, x, z, ry, c = 0x6a4030, seat = 0x8a3a2a) { K.at(x, 0, z, ry, () => { // carved wood chair, leather seat (faces +z)
  for (const [lx, lz] of [[-0.22, -0.2], [0.22, -0.2], [-0.22, 0.2], [0.22, 0.2]]) K.box(M.woodDark, lx - 0.025, lx + 0.025, 0, 0.46, lz - 0.025, lz + 0.025, c, 0.01);
  K.box(M.paint, -0.25, 0.25, 0.44, 0.52, -0.24, 0.24, seat, 0.03, 2, 2); for (const lx of [-0.22, 0.22]) K.box(M.woodDark, lx - 0.028, lx + 0.028, 0.46, 1.05, -0.24, -0.19, c, 0.01);
  K.box(M.woodDark, -0.24, 0.24, 0.92, 1.08, -0.245, -0.2, c, 0.02); K.box(M.paint, -0.18, 0.18, 0.58, 0.88, -0.235, -0.2, seat, 0.02); K.put(M.woodDark, sph(0.035, 8, 6), -0.22, 1.08, -0.22, 0, 0, 0, 1, 1, 1, c); K.put(M.woodDark, sph(0.035, 8, 6), 0.22, 1.08, -0.22, 0, 0, 0, 1, 1, 1, c); }); }

// background rally crowd: two-faced cards (back view toward +z, front view toward -z), merged per texture
let CROWD_MATS = null;
function crowdMats() {
  if (CROWD_MATS) return CROWD_MATS; const sk = ['#f2c9a4', '#d8a47c', '#b87a52', '#8a5a3a', '#f6d0b0'], sh = ['#f4f0e6', '#e8dcc0', '#5a7a9a', '#c84a3a', '#f0e8d0', '#4a6a4a', '#e8c86a', '#7a4a6a'];
  CROWD_MATS = []; for (let i = 0; i < 8; i++) { const fem = i % 4 === 3, o = fem ? { shirt: ['#d84a5a', '#e8c040', '#5aa0c8'][i % 3], pants: '#3a3040', hair: ['curly', 'bun', 'long'][i % 3], hairCol: '#2a1a12', lashes: true, head: 'egg', skin: sk[i % 5], seed: 300 + i }
    : { shirt: sh[i], pants: ['#3a3440', '#6a5a4a', '#2f2f3a'][i % 3], hat: i % 3 === 2 ? 'cap' : 'fedora', hatCol: i % 3 === 2 ? '#4a5a3a' : '#e8d8a8', hair: 'short', hairCol: '#2a1a12', moustache: i % 3 === 0 ? '#2a1a12' : undefined, skin: sk[(i + 2) % 5], head: ['round', 'wide'][i % 2], seed: 300 + i };
    const mk = (view) => { const cv = document.createElement('canvas'); cv.width = 300; cv.height = 500; const g = cv.getContext('2d'); g.scale(0.5, 0.5); oddverra(g, o, { view, expr: ['grin', 'laugh', 'excited', 'happy'][i % 4], cheer: i % 3 !== 2 ? 1 : undefined, wave: i % 3 === 2 ? 0.8 : undefined, t: i * 7, blink: 0, lightDir: 0.6 }); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
      return new THREE.MeshLambertMaterial({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: 0.7, color: new THREE.Color(0xffffff).multiplyScalar(0.45), alphaTest: 0.5 }); };
    CROWD_MATS.push([mk('back'), mk('front')]); }
  return CROWD_MATS;
}
function rallyCrowd(K, list) { // list: [x, z, scale, matIndex]
  const mats = crowdMats(), geo = cached('crowdcard', () => { const g = new THREE.PlaneGeometry(1.35, 2.25); g.translate(0, 1.069, 0); return g; });
  for (const [x, z, s, k] of list) { K.put(mats[k][0], geo, x, 0, z, 0, 0, 0, s, s, s); K.put(mats[k][1], geo, x, 0, z - 0.01, 0, Math.PI, 0, s, s, s); }
}

// ================================================================= PLAZA (1960 rally)
const PZ = { fz: -16, balY: 4.75, balZ: -14.2, podium: [0, 4.75, -15.0] };
function buildPlaza(root) {
  const K = new Kit();
  K.box(M.paving, -70, 70, -0.1, 0, -60, 60, 0xe0d2bc, 0.01, 4);
  // kerbs + roadway strips along the sides, where the cars park
  for (const s of [-1, 1]) { K.box(M.paint, s * 17.6 - 3.6, s * 17.6 + 3.6, -0.08, 0.005, -40, 40, 0x8a8290, 0.01); K.box(M.paving, s * 14.2 - 0.18, s * 14.2 + 0.18, 0, 0.16, -15, 40, 0xd8ccb8, 0.02); }
  // main civic building (back): yellow, arcade, 3 floors, central projecting balcony
  K.at(0, 0, PZ.fz, 0, () => { facade(K, 30, { wall: 0xf0cf7c, trim: 0xf8f0dc, floors: 3, arcade: true, bays: 8, skip: (i, f) => f === 1 && (i === 3 || i === 4), seed: 1 });
    // centre pavilion: taller, pediment, clock
    K.box(M.plaster, -5.2, 5.2, 4.6, 14.6, -1, 0.35, 0xf4d88a, 0.03, 3); K.box(M.plaster, -5.5, 5.5, 14.6, 15.0, -1, 0.6, 0xf8f0dc, 0.03);
    K.put(M.plaster, cached('ped', () => { const s = new THREE.Shape(); s.moveTo(-5.6, 0); s.lineTo(5.6, 0); s.lineTo(0, 2.2); s.lineTo(-5.6, 0); return new THREE.ExtrudeGeometry(s, { depth: 0.7, bevelEnabled: false }); }), 0, 15.0, -0.1, 0, 0, 0, 1, 1, 1, 0xf8f0dc);
    K.put(M.paint, cyl(0.75, 0.75, 0.12, 28), 0, 15.85, 0.62, Math.PI / 2, 0, 0, 1, 1, 1, 0xf4ecd8); K.put(M.paint, tor(0.75, 0.06, 4, 28), 0, 15.85, 0.68, 0, 0, 0, 1, 1, 1, 0xb8862a);
    for (const a of [0.3, 2.1]) K.beam(M.metal, [0, 15.85, 0.7], [Math.cos(a) * 0.55, 15.85 + Math.sin(a) * 0.55, 0.7], 0.03, INK);
    for (const s of [-1, 1]) for (const px of [2.1, 4.6]) K.put(M.plaster, cyl(0.28, 0.32, 9.6, 14), s * px, 9.8, 0.55, 0, 0, 0, 1, 1, 1, 0xf8f0dc);
    for (const px of [-2.6, 0, 2.6]) { K.put(M.win[0], plane(1.4, 2.9), px, 10.2, 0.37); K.box(M.plaster, px - 0.9, px + 0.9, 11.75, 12.0, 0.35, 0.55, 0xf8f0dc, 0.02); ironBalcony(K, px, 8.7, 0.35, 2.0, 0.5, 0xf8f0dc); }
    // balcony doors (open, dark) behind the speaker's balcony
    for (const px of [-1.6, 1.6]) { K.put(M.win[1], plane(1.5, 3.0), px, PZ.balY + 1.5, 0.37); }
    K.put(M.shop[1], plane(1.4, 2.8), 0, PZ.balY + 1.4, 0.37);
    // the speaker's balcony: stone slab on corbels, balustrade, lectern + mics, draped flags
    const by = PZ.balY, bd = 1.9, bw = 7.6; K.box(M.plaster, -bw / 2, bw / 2, by - 0.3, by, 0.35, 0.35 + bd, 0xf8f0dc, 0.04);
    for (let k = -3; k <= 3; k++) K.box(M.plaster, k * 1.1 - 0.14, k * 1.1 + 0.14, by - 1.0, by - 0.3, 0.35, 0.35 + bd * (0.5 + 0.5 * 0.7), 0xe8dcc0, 0.04);
    const rz = 0.35 + bd - 0.12; K.box(M.plaster, -bw / 2, bw / 2, by + 0.8, by + 0.92, 0.35 + bd - 0.25, 0.35 + bd, 0xf8f0dc, 0.03);
    for (let bx = -bw / 2 + 0.2; bx < bw / 2 - 0.1; bx += 0.32) K.put(M.plaster, lathe('bal', [[0, 0], [0.07, 0], [0.05, 0.1], [0.09, 0.35], [0.05, 0.62], [0.07, 0.75], [0.07, 0.8], [0, 0.8]], 10), bx, by, rz, 0, 0, 0, 1, 1, 1, 0xf4ecdc);
    for (const s of [-1, 1]) { K.box(M.plaster, -0.12 + s * (bw / 2 - 0.12), 0.12 + s * (bw / 2 - 0.12), by, by + 0.95, 0.35, 0.35 + bd, 0xf8f0dc, 0.02); K.box(M.plaster, -0.15 + s * 0.9, 0.15 + s * 0.9, by, by + 0.95, rz - 0.13, rz + 0.13, 0xf8f0dc, 0.02); }
    // lectern
    K.box(M.woodDark, -0.36, 0.36, by, by + 0.98, 1.25, 1.62, 0x6a3e2a, 0.02); K.cb(M.woodDark, 0.8, 0.05, 0.48, 0, by + 1.0, 1.44, 0x7a4a32, -0.25, 0, 0, 0.01);
    for (const [mx, ry] of [[-0.16, 0.3], [0, 0], [0.17, -0.3]]) rallyMic(K, mx, by + 1.03, 1.55, ry + Math.PI);
    // flags draped over the balustrade (hanging from the rail top)
    for (const fx of [-2.4, 0, 2.4]) K.put(M.flagV, drape(1.6, 2.6, 4, 0.05), fx, by + 0.93, 0.35 + bd + 0.06);
    // bunting swags under the cornice
    for (let k = -4; k < 4; k++) K.put(M.paint, tor(0.9, 0.05, 4, 16, Math.PI), k * 1.9 + 0.95, 12.95, 0.75, 0, 0, Math.PI, 1, 0.35, 1, [0x1f3c9a, 0xf4f0ea, 0xd8262e][(k + 8) % 3]);
    // roof flags
    for (const fx of [-12, 12, 0]) { const fy = fx === 0 ? 17.2 : 13.6; K.put(M.metal, cyl(0.04, 0.05, 4.2, 8), fx, fy + 2.1, -0.2, 0, 0, 0, 1, 1, 1, 0xe8e4dc); K.put(M.flagH, waveFlag(2.4, 1.2), fx, fy + 3.5, -0.2, 0, 0.4, 0); K.put(M.brass, sph(0.08, 8, 6), fx, fy + 4.25, -0.2, 0, 0, 0, 1, 1, 1, 0xd8a848); }
    // a long horizontal flag hung across the facade
    K.put(M.flagH, drape(6.0, 3.0, 6, 0.04), -10, 12.2, 0.12); K.put(M.flagH, drape(6.0, 3.0, 6, 0.04), 10, 12.2, 0.12);
  });
  // side buildings (pastel blue / pink / green), running from the main building toward camera
  const side = [[0x9ac8d8, 0xf4ecdc, 2, 14], [0xf0a8a0, 0xf8f0e4, 3, 12], [0xa8d0a0, 0xf4ecdc, 2, 13], [0xe8b0c8, 0xf8f0e4, 2, 12]];
  for (const s of [-1, 1]) { let z = PZ.fz + 1.5; side.forEach(([wall, trim, fl, w], i) => { const ii = s > 0 ? (i + 1) % 4 : i, sd = side[ii]; K.at(s * 21.4, 0, z + sd[3] / 2, -s * Math.PI / 2, () => facade(K, sd[3], { wall: sd[0], trim: sd[1], floors: sd[2], arcade: true, bays: Math.round(sd[3] / 3.4), seed: i + (s > 0 ? 3 : 0), tiles: i % 2 === 0 })); z += sd[3]; }); }
  // far end of the square (closes the reverse view): three facades facing the balcony
  for (const [x, w, wall, fl] of [[-13, 12, 0xa8d0c8, 3], [0, 14, 0xf0b8a0, 2], [13.5, 13, 0xd8c0e8, 3]]) K.at(x, 0, 30, Math.PI, () => facade(K, w, { wall, trim: 0xf8f0e4, floors: fl, arcade: true, bays: Math.round(w / 3.4), seed: x | 0, tiles: fl === 2 }));
  // corner tower beyond (left, a church belfry silhouette) and a distant dome (right)
  K.box(M.plaster, -30, -25, 0, 22, -32, -27, 0xe8d8b8, 0.04, 4); K.box(M.plaster, -30.4, -24.6, 22, 22.5, -32.4, -26.6, 0xf8f0dc, 0.04); K.box(M.plaster, -29.4, -25.6, 22.5, 26, -31.4, -27.6, 0xe8d8b8, 0.04); K.put(M.paint, cyl(0.2, 2.2, 3.4, 8), -27.5, 27.7, -29.5, 0, Math.PI / 8, 0, 1, 1, 1, 0xb87a5a);
  K.put(M.shop[2], plane(1.6, 2.4), -27.5, 24.1, -27.55); K.put(M.paint, cyl(4.8, 5.6, 6, 24), 30, 18, -46, 0, 0, 0, 1, 1, 1, 0xe8e0d0); K.put(M.paint, sph(5.0, 24, 12, 0), 30, 21, -46, 0, 0, 0, 1, 0.95, 1, 0xd8e0e8); K.box(M.plaster, 18, 42, 0, 15, -50, -40, 0xe8dcc8, 0.04, 4);
  // palms: along the sides in front of the arcades, and two flanking the balcony
  for (const [x, z, h, sd] of [[-12.6, -12.5, 12.5, 1], [12.6, -12.5, 12, 2], [-13.2, -2, 11, 3], [13.2, -3, 11.5, 4], [-13.2, 8, 10.5, 5], [13.2, 9, 11, 6], [-13.4, 19, 12, 7], [13.4, 20, 10.8, 8], [-6.5, -13.2, 9.5, 9], [6.5, -13.2, 10, 10]]) { palm(K, x, z, h, sd); K.put(M.plaster, cyl(0.7, 0.75, 0.4, 12), x, 0.2, z, 0, 0, 0, 1, 1, 1, 0xe8dcc8); }
  // 1950s cars parked along both sides (two-tone pastels)
  for (const [x, z, ry, c1, c2] of [[-16.5, -6, 0.04, 0x5aa8b0, 0xf4f0e8], [-16.6, 1.0, -0.05, 0xe85a4a, 0xf4f0e8], [-16.4, 9, 0.06, 0x2a3a6a, 0xd8dce8], [16.5, -8, Math.PI - 0.04, 0xf0c860, 0xf4f0e8], [16.6, 0, Math.PI + 0.05, 0x7ac088, 0xf4f0e8], [16.5, 8.5, Math.PI, 0xe8a0b8, 0xf8f4ec], [16.4, 17, Math.PI - 0.08, 0x3a2a30, 0xe8e4dc]]) car(K, x, z, ry + Math.PI / 2, c1, c2);
  // wrought-iron street lamps, benches
  for (const s of [-1, 1]) for (const z of [-9, 3, 15]) { const x = s * 13.0; K.put(M.metal, cyl(0.07, 0.12, 4.2, 8), x, 2.1, z, 0, 0, 0, 1, 1, 1, 0x22202a); K.put(M.metal, tor(0.3, 0.025, 4, 14, Math.PI), x - s * 0.3, 4.1, z, 0, Math.PI / 2 * 0, 0, 1, 1, 1, 0x22202a); for (const dx of [-0.6, 0]) { K.put(M.glowWarm, sph(0.16, 10, 8), x + dx * s + (s < 0 ? 0.3 : -0.3) * 0, 4.0, z); } K.put(M.metal, cyl(0.04, 0.22, 0.2, 8), x, 4.2, z, 0, 0, 0, 1, 1, 1, 0x22202a); }
  // background crowd: dense toward the balcony (z -13.2..-7), thinning toward camera; leaves the front clear for cards
  const R = rng(77), list = []; for (let i = 0; i < 190; i++) { const z = -13.0 + Math.pow(R(), 1.5) * 8.5, x = (R() - 0.5) * 22; if (Math.abs(x) > 11.5) continue; list.push([x, z, 0.92 + R() * 0.16, (R() * 8) | 0]); }
  for (let i = 0; i < 26; i++) { const s = R() > 0.5 ? 1 : -1; list.push([s * (8.5 + R() * 3), -4 + R() * 12, 0.95 + R() * 0.12, (R() * 8) | 0]); }
  list.sort((a, b) => a[1] - b[1]); rallyCrowd(K, list);
  // hand-held placards in the crowd (blank, period colours) + a few small flags on sticks
  for (let i = 0; i < 16; i++) { const x = (R() - 0.5) * 20, z = -12.5 + R() * 6, c = [0xf4f0e6, 0xd8262e, 0x1f3c9a][i % 3]; K.beam(M.wood, [x, 1.6, z], [x, 3.0, z], 0.025, 0xa88a62); if (i % 2) K.put(M.flagH, waveFlag(0.7, 0.35, 0.05), x, 2.85, z, 0, 0.3, 0); else K.box(M.paint, x - 0.4, x + 0.4, 2.6, 3.1, z - 0.02, z + 0.02, c, 0.01); }
  buildK(K, root);
}

// ================================================================= RADIO studio
const RD = { x0: -4, x1: 4, z0: -3.2, z1: 4.2, h: 3.2, desk: 0.76, vent: [-3.97, 2.62, -0.7], mic: [0, 0.76, -0.82] };
let SPRAY = null, ONAIR = null;
function buildRadio(root) {
  const K = new Kit(), { x0, x1, z0, z1, h } = RD, wallC = 0xe8ddc8;
  K.box(M.woodDark, x0, x1, -0.1, 0, z0, z1, 0x7a5a48, 0.01, 1.2); K.box(M.paint, -2.4, 2.4, 0, 0.012, -2.2, 0.8, 0x6a3a3a, 0.005); // floor + rug
  K.box(M.acoustic, x0, x1, h, h + 0.1, z0, z1, 0xf4f0e8, 0.01, 1.2);
  // walls: acoustic panels above a wood wainscot
  for (const [a, b, c, d] of [[x0 - 0.1, x0, z0, z1], [x1, x1 + 0.1, z0, z1], [x0, x1, z1, z1 + 0.1]]) { K.box(M.acoustic, a, b, 0.9, h, c, d, 0xece4d2, 0.01, 1.2); K.box(M.woodDark, a, b, 0, 0.9, c, d, 0x6a4434, 0.01, 1.0); }
  for (const z of [-2.4, -0.8, 0.8, 2.4]) for (const x of [x0 + 0.02, x1 - 0.06]) K.box(M.wood, x, x + 0.04, 0.9, h, z - 0.05, z + 0.05, 0x9a6a48, 0.01);
  // back wall with the booth window (x -2.4..2.4, y 1.05..2.35)
  const wy0 = 1.05, wy1 = 2.35, wx = 2.4; K.box(M.woodDark, x0, x1, 0, wy0, z0 - 0.25, z0, 0x6a4434, 0.01, 1.0);
  K.box(M.acoustic, x0, x1, wy1, h, z0 - 0.25, z0, 0xece4d2, 0.01, 1.2); K.box(M.acoustic, x0, -wx, wy0, wy1, z0 - 0.25, z0, 0xece4d2, 0.01, 1.2); K.box(M.acoustic, wx, x1, wy0, wy1, z0 - 0.25, z0, 0xece4d2, 0.01, 1.2);
  for (const [a, b, c, d] of [[-wx - 0.1, wx + 0.1, wy0 - 0.1, wy0], [-wx - 0.1, wx + 0.1, wy1, wy1 + 0.1], [-wx - 0.1, -wx, wy0, wy1], [wx, wx + 0.1, wy0, wy1], [-0.04, 0.04, wy0, wy1]]) K.box(M.wood, a, b, c, d, z0 - 0.02, z0 + 0.06, 0x8a5a3a, 0.01);
  // control booth (behind the glass): console, two engineers' stools, reel-to-reels, equipment racks
  const bz0 = z0 - 0.25, bz1 = -7.2; K.box(M.paint, x0, x1, -0.1, 0, bz1, bz0, 0x5a5a60, 0.01); K.box(M.paint, x0, x1, h, h + 0.1, bz1, bz0, 0xc8ccc8, 0.01); K.box(M.plaster, x0 - 0.1, x0, 0, h, bz1, bz0, 0xa8c0b8, 0.01); K.box(M.plaster, x1, x1 + 0.1, 0, h, bz1, bz0, 0xa8c0b8, 0.01);
  K.put(M.booth, plane(8, 3.2), 0, 1.6, bz1 + 0.02);
  K.box(M.paint, -2.3, 2.3, 0, 1.12, bz0 - 1.05, bz0 - 0.35, 0x5a6a62, 0.02); K.cb(M.console, 4.6, 0.04, 0.72, 0, 1.22, bz0 - 0.68, 0xffffff, 0.35, 0, 0, 0.01); K.box(M.paint, -2.3, 2.3, 1.12, 1.45, bz0 - 1.05, bz0 - 0.95, 0x4a5a52, 0.02);
  for (const vx of [-1.5, -0.5, 0.5, 1.5]) K.put(M.vu, plane(0.18, 0.08), vx, 1.4, bz0 - 0.93);
  for (const rx of [-3.0, 3.0]) { K.box(M.paint, rx - 0.45, rx + 0.45, 0, 1.75, bz1 + 0.15, bz1 + 0.75, 0x8a8a82, 0.03); K.box(M.paint, rx - 0.42, rx + 0.42, 0.95, 1.7, bz1 + 0.76, bz1 + 0.78, 0x3a3a40, 0.01);
    for (const ry of [1.42, 1.08]) { K.put(M.metal, cyl(0.17, 0.17, 0.02, 24), rx + (ry > 1.2 ? -0.18 : 0.18), ry + 0.1 * 0, bz1 + 0.8, Math.PI / 2, 0, 0, 1, 1, 1, 0xb8bcc4); K.put(M.metal, cyl(0.1, 0.1, 0.03, 18), rx + (ry > 1.2 ? -0.18 : 0.18), ry, bz1 + 0.81, Math.PI / 2, 0, 0, 1, 1, 1, 0x4a3a30); }
    for (const sx of [-0.18, 0.18]) { K.put(M.metal, cyl(0.16, 0.16, 0.02, 24), rx + sx, 1.42, bz1 + 0.8, Math.PI / 2, 0, 0, 1, 1, 1, 0xb8bcc4); K.put(M.metal, cyl(0.1, 0.1, 0.03, 18), rx + sx, 1.42, bz1 + 0.81, Math.PI / 2, 0, 0, 1, 1, 1, 0x4a3a30); }
    K.box(M.paint, rx - 0.3, rx + 0.3, 1.12, 1.24, bz1 + 0.76, bz1 + 0.8, 0x2a2a30, 0.01); }
  for (const sx of [-1.1, 1.0]) { K.put(M.metal, cyl(0.03, 0.03, 0.6, 8), sx, 0.3, bz0 - 1.6, 0, 0, 0, 1, 1, 1, 0x2a2a30); K.put(M.paint, cyl(0.2, 0.2, 0.06, 14), sx, 0.62, bz0 - 1.6, 0, 0, 0, 1, 1, 1, 0x3a4a6a); }
  K.box(M.paint, -0.9, 0.9, 2.7, 2.8, bz0 - 2.0, bz0 - 1.8, 0xf4f0e8, 0.02); K.put(M.glowWarm, plane(1.6, 0.06), 0, 2.69, bz0 - 1.9, Math.PI / 2, 0, 0);
  // glass pane (no ink) + reflection streak
  K.put(M.glass, plane(wx * 2, wy1 - wy0), 0, (wy0 + wy1) / 2, z0 - 0.1);
  // EN EL AIRE sign above the window (separate mesh: on/off)
  K.box(M.metal, -0.7, 0.7, 2.5, 2.92, z0, z0 + 0.12, 0x2a2228, 0.02);
  // desk: heavy wood, modesty panel, the ribbon mic, script, ashtray + cigars, water glass, talkback box
  const dy = RD.desk; K.box(M.woodDark, -1.25, 1.25, dy - 0.05, dy, -1.0, -0.15, 0x7a4a32, 0.02); K.box(M.woodDark, -1.2, 1.2, 0.05, dy - 0.05, -0.25, -0.18, 0x6a3e2a, 0.01);
  for (const s of [-1, 1]) K.box(M.woodDark, s * 1.15 - 0.08, s * 1.15 + 0.08, 0, dy - 0.05, -0.95, -0.2, 0x6a3e2a, 0.02);
  K.box(M.paint, -1.22, 1.22, dy, dy + 0.005, -0.97, -0.18, 0x2f4a3a, 0.002);
  ribbonMic(K, RD.mic[0], dy, RD.mic[2], 0);
  K.put(M.paper, plane(0.21, 0.29), -0.42, dy + 0.008, -0.6, -Math.PI / 2, 0, 0.15); K.put(M.paper, plane(0.21, 0.29), -0.45, dy + 0.011, -0.63, -Math.PI / 2, 0, 0.32);
  ashtray(K, 0.55, dy + 0.005, -0.55); cigarAt(K, 0.52, dy + 0.04, -0.52, 0.5, 0.15, 0.009, true); cigarAt(K, 0.6, dy + 0.03, -0.6, -0.9, 0.13, 0.008);
  K.put(M.paint, lathe('glassw', [[0, 0], [0.035, 0], [0.04, 0.12], [0.036, 0.12], [0.031, 0.006], [0, 0.006]], 14), 0.85, dy, -0.75, 0, 0, 0, 1, 1, 1, 0xc8dce8);
  K.box(M.metal, -0.95, -0.7, dy, dy + 0.09, -0.82, -0.65, 0x5a5a60, 0.01); K.put(M.ember, sph(0.01, 6, 4), -0.9, dy + 0.095, -0.66); K.put(M.vu, sph(0.008, 6, 4), -0.82, dy + 0.095, -0.66);
  K.put(M.metal, cyl(0.06, 0.09, 0.02, 14), 0.95, dy + 0.01, -0.35, 0, 0, 0, 1, 1, 1, 0x2a2a30); // headphones resting
  K.put(M.metal, tor(0.08, 0.012, 4, 16, Math.PI), 0.95, dy + 0.03, -0.35, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2a30);
  // host chair behind the desk + a guest chair
  chair(K, 0, -1.45, 0, 0x5a3426, 0x4a2a2a); chair(K, 2.3, 0.2, -0.9, 0x5a3426, 0x4a2a2a);
  // the air vent on the left wall: frame + louvres, a dark duct behind
  K.at(RD.vent[0], RD.vent[1], RD.vent[2], Math.PI / 2, () => { K.box(M.metal, -0.28, 0.28, -0.17, 0.17, -0.01, 0.03, 0xb8bcc4, 0.01); K.box(M.paint, -0.24, 0.24, -0.13, 0.13, -0.02, 0.031, 0x1e1a24, 0.005);
    for (let k = -3; k <= 3; k++) K.cb(M.metal, 0.46, 0.012, 0.05, 0, k * 0.034, 0.03, 0xd8dce4, -0.6, 0, 0, 0.003); for (const sx of [-0.25, 0.25]) for (const sy of [-0.14, 0.14]) K.put(M.metal, sph(0.008, 6, 4), sx, sy, 0.035, 0, 0, 0, 1, 1, 1, 0x5a5a60); });
  // right wall: door with porthole, wall clock, a curtain on the left corner, studio spotlight, cables
  K.box(M.woodDark, x1 - 0.06, x1, 0, 2.2, 1.6, 2.6, 0x7a4a32, 0.02); K.put(M.paint, tor(0.16, 0.025, 4, 18), x1 - 0.07, 1.55, 2.1, 0, Math.PI / 2, 0, 1, 1, 1, 0xb8bcc4); K.put(M.glass, cached('circ', () => new THREE.CircleGeometry(0.15, 18)), x1 - 0.07, 1.55, 2.1, 0, -Math.PI / 2, 0);
  K.put(M.brass, cyl(0.03, 0.03, 0.06, 8), x1 - 0.12, 1.05, 1.75, 0, 0, Math.PI / 2, 1, 1, 1, 0xd8a848);
  K.put(M.paint, cyl(0.26, 0.26, 0.05, 28), x1 - 0.04, 2.45, -0.6, 0, 0, Math.PI / 2, 1, 1, 1, 0xf4f0e8); K.put(M.paint, tor(0.26, 0.025, 4, 24), x1 - 0.06, 2.45, -0.6, 0, Math.PI / 2, 0, 1, 1, 1, 0x2a2a30);
  K.beam(M.metal, [x1 - 0.08, 2.45, -0.6], [x1 - 0.08, 2.6, -0.6], 0.012, INK); K.beam(M.metal, [x1 - 0.08, 2.45, -0.6], [x1 - 0.08, 2.45, -0.48], 0.01, INK);
  K.put(M.fabric, drape(1.4, 3.1, 4, 0.08), x0 + 0.75, h, z0 + 0.25, 0, 0, 0, 1, 1, 1, 0x8a2a3a);
  sign(K, 'RADIO HABANA · ESTUDIO 2', '#1f2a44', '#f2e2b0', 1.8, 0.28, x1 - 0.12, 2.75, 2.1, -Math.PI / 2, { fs: 0.56 });
  for (const sx of [-1.6, 1.6]) { K.beam(M.metal, [sx, h, -1.2], [sx, h - 0.5, -1.2], 0.015, 0x2a2a30); K.put(M.metal, cyl(0.12, 0.18, 0.3, 12), sx, h - 0.62, -1.2, 0.5, sx < 0 ? -0.4 : 0.4, 0, 1, 1, 1, 0x2a2a30); }
  K.beam(M.rubber, [0.05, dy, -0.9], [0.4, 0.02, -1.6], 0.008, 0x1e1a22); K.beam(M.rubber, [0.4, 0.02, -1.6], [2.0, 0.02, -2.9], 0.008, 0x1e1a22);
  // pinned programme schedule + framed photo of a transmitter tower
  K.put(M.paper2, plane(0.35, 0.48), x0 + 0.03, 1.55, 1.6, 0, Math.PI / 2, 0.03); K.box(M.wood, x0, x0 + 0.04, 1.7, 2.3, 0.2, 0.9, 0x5a3426, 0.01); K.put(M.painting, plane(0.6, 0.5), x0 + 0.045, 2.0, 0.55, 0, Math.PI / 2, 0);
  buildK(K, root, false);
  // on-air sign face (swappable material)
  ONAIR = mesh(root, plane(1.3, 0.36), M.onAir, 0, 2.71, z0 + 0.125, 0, 0, 0, false);
  // spray mist puffs from the vent (no ink, no shadow); positions along a drifting path toward the desk
  SPRAY = []; for (let i = 0; i < 16; i++) { const m = noink(mesh(root, plane(1, 1), M.mist.clone(), 0, 0, 0, 0, 0, 0, false)); m.renderOrder = 5; SPRAY.push(m); }
  // smoke wisp from the lit cigar
  for (let i = 0; i < 3; i++) { const m = noink(mesh(root, plane(0.04 + i * 0.03, 0.08 + i * 0.05), M.smoke, 0.44 - i * 0.015, dy + 0.08 + i * 0.07, -0.5, 0, 0, 0.3 * i, false)); m.renderOrder = 4; }
}
function setSprayT(t) {
  if (!SPRAY) return; t = Math.max(0, t); const R = rng(91), v = RD.vent;
  SPRAY.forEach((m, i) => { const ph = (i / SPRAY.length + t * 0.35) % 1, on = Math.min(1, t * 2.5), age = ph; // puff drifts out from the vent, spreads and fades
    const r1 = R(), r2 = R(); m.position.set(v[0] + 0.12 + age * (1.9 + r1 * 0.9), v[1] - 0.05 - age * (0.7 + r2 * 0.5) + Math.sin(i * 2.1 + t * 3) * 0.05, v[2] + (r1 - 0.5) * 0.4 + age * (r2 - 0.4) * 0.8);
    const s = 0.18 + age * 0.9; m.scale.set(s, s * 0.8, 1); m.rotation.set(0, 0.75, i); m.material.opacity = on * 0.5 * Math.sin(Math.PI * Math.min(1, age * 1.15)) ** 1.2; m.visible = t > 0.001; });
}

// ================================================================= TALKS (1963 negotiation room)
const TK = { x0: -3.6, x1: 3.6, z0: -3.0, z1: 6.8, h: 3.7, top: 0.78, chairX: 1.6, gift: [0, 0.78, 0.05] };
let GIFT = null, FAN = null;
function buildTalks(root) {
  const K = new Kit(), { x0, x1, z0, z1, h } = TK, wall = 0xe8c8a0, trim = 0xf8f0e0;
  K.box(M.tileRed, x0, x1, -0.1, 0, z0, z1, 0xffffff, 0.01, 0.8); K.box(M.plaster, x0, x1, h, h + 0.15, z0, z1, 0xf4ece0, 0.01);
  for (const [a, b, c, d] of [[x0 - 0.15, x0, z0, z1], [x1, x1 + 0.15, z0, z1], [x0, x1, z1, z1 + 0.15]]) { K.box(M.plaster, a, b, 0, h, c, d, wall, 0.01, 3); }
  for (const [a, b, c, d] of [[x0, x0 + 0.04, z0, z1], [x1 - 0.04, x1, z0, z1]]) { K.box(M.paint, a, b, 0, 0.14, c, d, 0x6a4434, 0.01); K.box(M.paint, a, b, 1.0, 1.05, c, d, trim, 0.005); K.box(M.paint, a, b, h - 0.25, h, c, d, trim, 0.02); }
  // back wall with 3 tall windows (louvred shutters: real slats so the sun throws stripes)
  const wins = [-2.2, 0, 2.2], ww = 1.1, wy0 = 0.55, wy1 = 3.05, bz = z0, t = 0.3;
  let xa = x0; for (const wx of wins) { K.box(M.plaster, xa, wx - ww / 2, 0, h, bz - t, bz, wall, 0.01, 3); xa = wx + ww / 2; } K.box(M.plaster, xa, x1, 0, h, bz - t, bz, wall, 0.01, 3);
  for (const wx of wins) { K.box(M.plaster, wx - ww / 2, wx + ww / 2, 0, wy0, bz - t, bz, wall, 0.01); K.box(M.plaster, wx - ww / 2, wx + ww / 2, wy1, h, bz - t, bz, wall, 0.01);
    K.box(M.paint, wx - ww / 2 - 0.12, wx + ww / 2 + 0.12, wy1, wy1 + 0.18, bz - 0.02, bz + 0.08, trim, 0.02); K.box(M.paint, wx - ww / 2 - 0.1, wx + ww / 2 + 0.1, wy0 - 0.08, wy0, bz - 0.02, bz + 0.14, trim, 0.02);
    // shutters: lower two thirds slatted, upper part open; mid rail
    for (let y = wy0 + 0.05; y < 2.3; y += 0.09) K.cb(M.wood, ww - 0.04, 0.012, 0.075, wx, y, bz - 0.15, 0x4a7a6a, -0.55, 0, 0, 0.004);
    K.box(M.wood, wx - ww / 2, wx - ww / 2 + 0.06, wy0, wy1, bz - 0.2, bz - 0.1, 0x3a6a5a, 0.01); K.box(M.wood, wx + ww / 2 - 0.06, wx + ww / 2, wy0, wy1, bz - 0.2, bz - 0.1, 0x3a6a5a, 0.01); K.box(M.wood, wx - 0.03, wx + 0.03, wy0, wy1, bz - 0.2, bz - 0.1, 0x3a6a5a, 0.01); K.box(M.wood, wx - ww / 2, wx + ww / 2, 2.3, 2.36, bz - 0.2, bz - 0.1, 0x3a6a5a, 0.01);
    // open shutter leaves folded against the wall (upper)
    for (const s of [-1, 1]) K.box(M.wood, wx + s * (ww / 2 + 0.05) - 0.03, wx + s * (ww / 2 + 0.05) + 0.03, 2.36, wy1, bz - 0.05, bz + 0.25, 0x3a6a5a, 0.01);
  }
  // ceiling beams + fan
  for (let x = x0 + 1.2; x < x1; x += 1.8) K.box(M.woodDark, x - 0.1, x + 0.1, h - 0.22, h, z0, z1, 0x5a3a2a, 0.02, 2);
  K.put(M.metal, cyl(0.015, 0.015, 0.55, 6), 0, h - 0.27, 0.2, 0, 0, 0, 1, 1, 1, 0x3a3030); K.put(M.brass, cyl(0.12, 0.16, 0.18, 16), 0, h - 0.6, 0.2, 0, 0, 0, 1, 1, 1, 0x8a6a3a);
  // table: long, dark polished wood, turned legs; papers, folders, carafe, glasses, ashtray, pen
  const ty = TK.top, tl = 1.3, td = 0.55; K.box(M.woodDark, -tl, tl, ty - 0.05, ty, -td, td, 0x5a3424, 0.025, 1.5); K.box(M.woodDark, -tl + 0.08, tl - 0.08, ty - 0.14, ty - 0.05, -td + 0.06, td - 0.06, 0x4a2a1e, 0.01);
  for (const lx of [-tl + 0.15, tl - 0.15]) for (const lz of [-td + 0.12, td - 0.12]) K.put(M.woodDark, lathe('tleg', [[0, 0], [0.05, 0], [0.04, 0.1], [0.06, 0.2], [0.035, 0.45], [0.05, 0.62], [0.045, 0.64], [0, 0.64]], 10), lx, 0, lz, 0, 0, 0, 1, 1, 1, 0x4a2a1e);
  K.box(M.paint, -0.55, 0.55, ty, ty + 0.004, -0.22, 0.32, 0x2f4a3a, 0.001); // green blotter under the gift
  for (const s of [-1, 1]) { K.put(M.paper, plane(0.21, 0.29), s * 0.95, ty + 0.006, 0.08, -Math.PI / 2, 0, s * 0.2); K.put(M.paper2, plane(0.21, 0.29), s * 1.02, ty + 0.009, -0.05, -Math.PI / 2, 0, s * 0.45);
    K.box(M.paint, s * 0.7 - 0.12, s * 0.7 + 0.12, ty, ty + 0.025, -0.38, -0.08, s > 0 ? 0xc8a868 : 0x8a4a3a, 0.005); K.beam(M.metal, [s * 0.82, ty + 0.007, 0.3], [s * 0.68, ty + 0.007, 0.35], 0.006, 0x2a2a30, true); }
  K.put(M.paint, lathe('carafe', [[0, 0], [0.06, 0], [0.075, 0.08], [0.05, 0.18], [0.025, 0.24], [0.03, 0.27], [0, 0.27]], 16), -0.25, ty, -0.38, 0, 0, 0, 1, 1, 1, 0xc0d8e8);
  for (const gx of [-0.4, -0.1]) K.put(M.paint, lathe('glassw', [[0, 0], [0.035, 0], [0.04, 0.12], [0.036, 0.12], [0.031, 0.006], [0, 0.006]], 14), gx, ty, -0.3, 0, 0, 0, 0.8, 0.8, 0.8, 0xc8dce8);
  ashtray(K, 0.42, ty, -0.36, 1.2); cigarAt(K, 0.44, ty + 0.035, -0.33, 0.4, 0.14, 0.009, true);
  chair(K, -TK.chairX, 0.0, Math.PI / 2, 0x5a3426, 0x7a3a2a); chair(K, TK.chairX, 0.0, -Math.PI / 2, 0x5a3426, 0x7a3a2a);
  // side: sideboard with a rotary telephone + lamp; the flag on a staff in the corner; landscape painting; wall clock
  K.box(M.woodDark, x0 + 0.05, x0 + 0.55, 0, 0.85, -1.9, -0.3, 0x6a4030, 0.02); K.box(M.woodDark, x0 + 0.03, x0 + 0.58, 0.85, 0.9, -1.95, -0.25, 0x7a4a32, 0.01);
  K.at(x0 + 0.3, 0.9, -0.7, 0.4, () => { K.box(M.paint, -0.1, 0.1, 0, 0.08, -0.11, 0.11, 0x1e1a22, 0.03, 2, 2); K.put(M.paint, cyl(0.06, 0.06, 0.012, 16), 0, 0.083, 0.02, -0.4, 0, 0, 1, 1, 1, 0xe8e0d0); K.put(M.paint, rboxGeo(0.06, 0.04, 0.24, 0.02, 2, 2), 0, 0.12, 0, 0, 0, 0, 1, 1, 1, 0x1e1a22); });
  K.put(M.brass, cyl(0.07, 0.09, 0.05, 12), x0 + 0.3, 0.92, -1.55, 0, 0, 0, 1, 1, 1, 0x8a6a3a); K.put(M.brass, cyl(0.012, 0.012, 0.35, 6), x0 + 0.3, 1.12, -1.55, 0, 0, 0, 1, 1, 1, 0x8a6a3a); K.put(M.fabric, cyl(0.1, 0.17, 0.2, 14, true), x0 + 0.3, 1.32, -1.55, 0, 0, 0, 1, 1, 1, 0xf0dcb0);
  K.put(M.metal, cyl(0.02, 0.02, 2.4, 8), x1 - 0.45, 1.2, -2.5, 0, 0, 0.06, 1, 1, 1, 0xc8a860); K.put(M.brass, sph(0.05, 8, 6), x1 - 0.38, 2.42, -2.5); K.put(M.flagV, drape(0.75, 1.3, 3, 0.05), x1 - 0.42, 2.3, -2.42, 0, -0.5, 0.06);
  K.put(M.paint, cyl(0.2, 0.24, 0.12, 14), x1 - 0.45, 0.06, -2.5, 0, 0, 0, 1, 1, 1, 0x3a2a24);
  K.box(M.wood, x0 + 0.02, x0 + 0.08, 1.55, 2.55, 0.6, 2.0, 0xb8862a, 0.02); K.put(M.painting, plane(1.25, 0.85), x0 + 0.085, 2.05, 1.3, 0, Math.PI / 2, 0);
  K.put(M.paint, cyl(0.2, 0.2, 0.05, 24), x1 - 0.03, 2.6, 1.0, 0, 0, Math.PI / 2, 1, 1, 1, 0xf4f0e8); K.put(M.paint, tor(0.2, 0.02, 4, 20), x1 - 0.05, 2.6, 1.0, 0, Math.PI / 2, 0, 1, 1, 1, 0x6a4030);
  K.beam(M.metal, [x1 - 0.07, 2.6, 1.0], [x1 - 0.07, 2.72, 1.05], 0.01, INK); K.beam(M.metal, [x1 - 0.07, 2.6, 1.0], [x1 - 0.07, 2.56, 1.1], 0.01, INK);
  // potted palm in the far corner
  K.put(M.paint, cyl(0.22, 0.17, 0.4, 14), x0 + 0.45, 0.2, -2.45, 0, 0, 0, 1, 1, 1, 0xb85a3a); K.at(x0 + 0.45, 0, -2.45, 0, () => palm(K, 0, 0, 1.6, 21), 0.6);
  buildK(K, root);
  // outside view behind the shutters (no shadow so the sun gets in)
  for (const wx of wins) { const m = mesh(root, plane(ww + 0.4, wy1 - wy0 + 0.4), M.skyView, wx, (wy0 + wy1) / 2, bz - 1.2, 0, 0, 0, false); m.receiveShadow = false; }
  // fan blades (rotating group)
  FAN = new THREE.Group(); FAN.position.set(0, h - 0.68, 0.2); root.add(FAN); { const FK = new Kit(); for (let k = 0; k < 4; k++) FK.at(0, 0, 0, k * Math.PI / 2, () => { FK.box(M.wood, 0.1, 0.72, -0.01, 0.01, -0.07, 0.07, 0x7a4a30, 0.005); FK.box(M.brass, 0.05, 0.16, -0.015, 0.0, -0.02, 0.02, 0x8a6a3a, 0.005); }); FK.put(M.brass, sph(0.06, 10, 6), 0, -0.04, 0, 0, 0, 0, 1, 0.6, 1, 0x8a6a3a); buildK(FK, FAN); }
  // the gift box: base (with wetsuit + mask inside) and a hinged lid
  GIFT = new THREE.Group(); GIFT.position.set(...TK.gift); root.add(GIFT); const bw = 0.5, bd = 0.36, bh = 0.13, wc = 0xf2ece0;
  { const GK = new Kit(); GK.box(M.paint, -bw / 2, bw / 2, 0, 0.012, -bd / 2, bd / 2, wc, 0.004); for (const [a, b, c, d] of [[-bw / 2, bw / 2, -bd / 2, -bd / 2 + 0.01], [-bw / 2, bw / 2, bd / 2 - 0.01, bd / 2], [-bw / 2, -bw / 2 + 0.01, -bd / 2, bd / 2], [bw / 2 - 0.01, bw / 2, -bd / 2, bd / 2]]) GK.box(M.paint, a, b, 0, bh, c, d, wc, 0.003);
    GK.box(M.paint, -bw / 2 - 0.002, bw / 2 + 0.002, 0.02, bh - 0.02, bd / 2 - 0.004, bd / 2 + 0.002, 0x2a5aa0, 0.002); // blue band on the front
    // tissue paper
    // folded wetsuit: stacked black rubber layers with rolled sleeve + seams
    const rb = 0x1c1a24; GK.box(M.rubber, -0.2, 0.2, 0.012, 0.055, -0.14, 0.14, rb, 0.02, 2, 2); GK.box(M.rubber, -0.19, 0.18, 0.055, 0.09, -0.13, 0.12, 0x24222e, 0.018, 2, 2); GK.box(M.rubber, -0.17, 0.12, 0.09, 0.112, -0.12, 0.1, rb, 0.012, 2, 2);
    GK.put(M.rubber, cyl(0.025, 0.025, 0.26, 12), 0.16, 0.085, -0.0, Math.PI / 2, 0, 0, 1, 1, 1, 0x24222e); for (const sx of [-0.09, 0.05]) GK.box(M.paint, sx - 0.006, sx + 0.006, 0.111, 0.1135, -0.12, 0.1, 0xe8c040, 0.001); GK.box(M.paint, -0.17, 0.12, 0.111, 0.1135, -0.006, 0.006, 0xe8c040, 0.001); GK.box(M.paint, -0.19, 0.18, 0.088, 0.093, 0.117, 0.123, 0xe8c040, 0.001); GK.put(M.paint, tor(0.025, 0.004, 4, 14), 0.16, 0.085, 0.13, 0, 0, 0, 1, 1, 1, 0xe8c040);
    // dive mask on top: oval rubber frame, glass, strap
    GK.at(-0.1, 0.118, 0.045, 0.35, () => { GK.put(M.rubber, tor(0.06, 0.018, 6, 24), 0, 0.012, 0, Math.PI / 2, 0, 0, 1.55, 1, 0.85, 0x101018); GK.put(M.paint, cyl(0.062, 0.062, 0.006, 24), 0, 0.02, 0, 0, 0, 0, 1.55, 1, 0.85, 0x9ac8e0); GK.put(M.chrome, tor(0.063, 0.005, 4, 24), 0, 0.028, 0, Math.PI / 2, 0, 0, 1.55, 1, 0.85, 0xd8dce4); GK.put(M.rubber, cyl(0.02, 0.03, 0.04, 10), 0, 0.012, 0.05, Math.PI / 2 - 0.4, 0, 0, 1, 1, 1, 0x101018);
      GK.put(M.rubber, tor(0.11, 0.007, 4, 24, Math.PI * 1.2), 0, 0.006, 0, Math.PI / 2, 0, -0.3, 1.0, 1.15, 1, 0x101018); GK.box(M.chrome, 0.1, 0.12, 0.0, 0.012, -0.03, -0.01, 0xd8dce4, 0.002); });
    GK.put(M.rubber, cyl(0.011, 0.011, 0.3, 10), 0.03, 0.124, -0.115, 0, 0, Math.PI / 2, 1, 1, 1, 0x1a1a22); GK.put(M.paint, cyl(0.013, 0.013, 0.04, 10), 0.165, 0.124, -0.115, 0, 0, Math.PI / 2, 1, 1, 1, 0xe85a2a); GK.put(M.rubber, tor(0.03, 0.011, 6, 12, Math.PI / 2), -0.12, 0.124, -0.085, -Math.PI / 2, 0, Math.PI, 1, 1, 1, 0x1a1a22);
    buildK(GK, GIFT); }
  const lid = new THREE.Group(); lid.position.set(0, bh, -bd / 2); GIFT.add(lid); GIFT.userData.lid = lid;
  { const LK = new Kit(); LK.box(M.paint, -bw / 2 - 0.01, bw / 2 + 0.01, 0, 0.03, 0, bd + 0.01, wc, 0.006); LK.box(M.paint, -0.03, 0.03, -0.002, 0.034, 0, bd + 0.012, 0x2a5aa0, 0.002); LK.box(M.paint, -bw / 2 - 0.012, bw / 2 + 0.012, -0.002, 0.034, bd / 2 - 0.025, bd / 2 + 0.025, 0x2a5aa0, 0.002);
    for (const s of [-1, 1]) LK.put(M.paint, tor(0.045, 0.012, 5, 14), s * 0.04, 0.05, bd / 2, 0, s * 0.5, s * 0.5, 1, 0.7, 1, 0x2a5aa0); LK.put(M.paint, sph(0.018, 8, 6), 0, 0.045, bd / 2, 0, 0, 0, 1, 0.8, 1, 0x2a5aa0);
    LK.beam(M.paint, [0.01, 0.04, bd / 2 + 0.01], [0.05, 0.035, bd / 2 + 0.09], 0.01, 0x2a5aa0); LK.beam(M.paint, [-0.01, 0.04, bd / 2 + 0.01], [-0.06, 0.035, bd / 2 + 0.08], 0.01, 0x2a5aa0); buildK(LK, lid); }
  // dust in the sun beams (no ink)
  for (const wx of wins) { const m = noink(mesh(root, plane(1.0, 3.4), M.beam, wx, 1.5, -1.2, -1.1, 0, 0, false)); m.renderOrder = 3; }
}

// ================================================================= CIGAR tabletop
const CG = { ty: 0.8, box: [0, 0.8, 0], bw: 0.22, bd: 0.18, bh: 0.055, board: [0.0, 0.8, -0.5] };
let GLOW = null, CIGAR_MAT_BASE = null;
function buildCigar(root) {
  const K = new Kit(), ty = CG.ty, { bw, bd, bh } = CG;
  // table + room behind (soft; damask wall, window with blinds)
  K.box(M.woodDark, -1.0, 1.0, ty - 0.05, ty, -0.7, 0.6, 0x5a3022, 0.01, 0.6); K.box(M.woodDark, -1.0, 1.0, 0, ty - 0.05, 0.58, 0.6, 0x4a2a1e, 0.01);
  K.box(M.paint, -4, 4, -0.1, 0, -3, 3, 0x4a3a36, 0.01); K.put(M.wallpaper, plane(6, 3.4), 0, 1.7, -1.6); K.box(M.woodDark, -3, 3, 0, 0.9, -1.62, -1.55, 0x4a2a1e, 0.01, 1);
  K.box(M.wood, 0.2, 1.4, 1.05, 2.45, -1.6, -1.56, 0xf0e8d8, 0.01); for (let y = 1.1; y < 2.4; y += 0.06) K.box(M.paint, 0.22, 1.38, y, y + 0.035, -1.56, -1.54, 0xfff0d8, 0.003);
  K.put(M.glowWarm, plane(1.1, 1.3), 0.8, 1.75, -1.595);
  // the cigar box: cedar base, gold paper edging, label on the front, open lid tilted back with the inner label
  K.at(CG.box[0], ty, CG.box[2], 0.12, () => { const cedar = 0xb06a3a, gold = 0xe0b050;
    K.box(M.wood, -bw / 2, bw / 2, 0, 0.006, -bd / 2, bd / 2, cedar, 0.002, 0.3);
    for (const [a, b, c, d] of [[-bw / 2, bw / 2, -bd / 2, -bd / 2 + 0.006], [-bw / 2, bw / 2, bd / 2 - 0.006, bd / 2], [-bw / 2, -bw / 2 + 0.006, -bd / 2, bd / 2], [bw / 2 - 0.006, bw / 2, -bd / 2, bd / 2]]) K.box(M.wood, a, b, 0, bh, c, d, cedar, 0.002, 0.3);
    for (const [a, b, c, d] of [[-bw / 2 - 0.001, bw / 2 + 0.001, -bd / 2 - 0.001, -bd / 2 + 0.007], [-bw / 2 - 0.001, bw / 2 + 0.001, bd / 2 - 0.007, bd / 2 + 0.001], [-bw / 2 - 0.001, -bw / 2 + 0.007, -bd / 2, bd / 2], [bw / 2 - 0.007, bw / 2 + 0.001, -bd / 2, bd / 2]]) K.box(M.paint, a, b, bh - 0.008, bh + 0.001, c, d, gold, 0.001); K.box(M.paint, -bw / 2 - 0.001, bw / 2 + 0.001, 0.0, 0.006, -bd / 2 - 0.001, bd / 2 + 0.001, gold, 0.001);
    K.put(M.label, plane(0.11, 0.035), 0, bh * 0.5, bd / 2 + 0.0015);
    // cigars: 10 in a row, length along x, bands toward +x
    for (let k = 0; k < 10; k++) cigarAt(K, -0.005, 0.017 + (k % 2) * 0.0015, -bd / 2 + 0.014 + k * 0.0168, 0, 0.19, 0.0082);
    K.put(M.paper, plane(bw - 0.014, 0.03), 0, 0.02, -bd / 2 + 0.008, -0.2, 0, 0); // tissue at the back
    // lid: hinged at the back edge, open ~ 105 deg; inner label + gold border
    K.at(0, bh, -bd / 2, 0, () => { const a = 1.83; const LG = (fn) => { const o = K.M.clone(); K.M.multiply(new THREE.Matrix4().makeRotationX(-a)); fn(); K.M.copy(o); };
      LG(() => { K.box(M.wood, -bw / 2 - 0.002, bw / 2 + 0.002, 0, 0.006, 0, bd + 0.002, cedar, 0.002, 0.3); K.box(M.paint, -bw / 2 - 0.003, bw / 2 + 0.003, 0.006, 0.008, -0.001, bd + 0.003, gold, 0.001);
        K.put(M.label, plane(bw - 0.02, bd - 0.02), 0, -0.0012, bd / 2, Math.PI / 2, 0, 0); K.box(M.paint, -bw / 2, bw / 2, -0.002, 0.0, 0, 0.006, gold, 0.0005); K.box(M.paint, -bw / 2, bw / 2, -0.002, 0.0, bd - 0.006, bd, gold, 0.0005); }); });
  });
  // lighter (chrome table lighter), matchbook, a glass of rum, ashtray, loose cigar, folded newspaper
  K.at(-0.24, ty, 0.1, 0.4, () => { K.box(M.chrome, -0.019, 0.019, 0, 0.055, -0.007, 0.007, 0xd8dce4, 0.004); K.box(M.chrome, -0.019, 0.019, 0.055, 0.07, -0.007, 0.007, 0xc8ccd8, 0.004); for (let k = 0; k < 4; k++) K.box(M.paint, -0.017, 0.017, 0.008 + k * 0.012, 0.012 + k * 0.012, 0.0068, 0.0074, 0xa8acb8, 0.001);
    K.put(M.metal, cyl(0.006, 0.006, 0.008, 10), 0.008, 0.074, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x8a8e98); });
  K.at(-0.14, ty, 0.17, -0.3, () => { K.box(M.paint, -0.025, 0.025, 0, 0.006, -0.02, 0.02, 0xc8382a, 0.002); K.box(M.paint, -0.024, 0.024, 0.006, 0.007, -0.019, -0.004, 0xf0e0c0, 0.001); });
  K.put(M.paint, lathe('rum', [[0, 0], [0.032, 0], [0.034, 0.075], [0.031, 0.075], [0.028, 0.006], [0, 0.006]], 16), 0.2, ty, -0.18, 0, 0, 0, 1, 1, 1, 0xc8dce8); K.put(M.paint, cyl(0.028, 0.028, 0.03, 14), 0.2, ty + 0.021, -0.18, 0, 0, 0, 1, 1, 1, 0xc87a2a);
  ashtray(K, -0.25, ty, -0.12, 1.0); cigarAt(K, -0.21, ty + 0.03, -0.1, 0.6, 0.16, 0.0085, true);
  K.put(M.paper2, plane(0.28, 0.38), -0.42, ty + 0.002, -0.2, -Math.PI / 2, 0, 0.5); K.put(M.paper, plane(0.28, 0.38), -0.44, ty + 0.004, -0.22, -Math.PI / 2, 0, 0.62);
  buildK(K, root);
  for (let i = 0; i < 3; i++) { const m = noink(mesh(root, plane(0.03 + i * 0.03, 0.08 + i * 0.05), M.smoke, -0.3 - i * 0.01, ty + 0.06 + i * 0.06, -0.12, 0, 0, 0.3 * i, false)); m.renderOrder = 4; }
  // sinister glow halo over the box (setCigarGlow)
  GLOW = []; for (let i = 0; i < 3; i++) { const m = noink(mesh(root, plane(0.2 + i * 0.05, 0.14 + i * 0.04), M.halo.clone(), 0, ty + 0.04 + i * 0.008, 0.01, -Math.PI / 2, 0.12, 0, false)); m.renderOrder = 6; GLOW.push(m); }
  CIGAR_MAT_BASE = M.cigar.color.clone();
}

// ================================================================= lights, grades, views
const SET_LIGHT = {
  plaza: { top: '#3a6ed0', hor: '#ffd8a8', fog: '#f0c8a0', fogN: 45, fogF: 300, sky: '#a8c0f0', ground: '#6a4a5a', hemiI: 0.62, fillCol: '#7a88e0', fillI: 0.3, sunCol: '#ffc888', sunI: 3.6, az: -58, el: 24, disc: '#fff0c8', discSize: 0.003, cloud: '#fff0dc', cardTint: '#fff2e2', fxTint: '#fff6ea', shafts: 0.3 },
  radio: { top: '#000000', hor: '#2a2018', fog: '#2a2018', fogN: 12, fogF: 60, sky: '#f0d8b8', ground: '#3a2a30', hemiI: 0.75, fillCol: '#7a80c8', fillI: 0.25, sunCol: '#ffd8a8', sunI: 0.5, az: 30, el: 50, disc: '#000000', clouds: false, shadow: false, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0, aoK: 0.6 },
  talks: { top: '#000000', hor: '#2a2018', fog: '#3a2a20', fogN: 14, fogF: 70, sky: '#e8ccb0', ground: '#4a3040', hemiI: 0.42, fillCol: '#7a80d0', fillI: 0.18, sunCol: '#ffcf90', sunI: 4.2, az: 172, el: 26, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0, aoK: 0.7 },
  cigar: { top: '#000000', hor: '#2a2018', fog: '#2a2018', fogN: 3, fogF: 20, sky: '#f0d0b0', ground: '#3a2430', hemiI: 0.7, fillCol: '#7080d0', fillI: 0.3, sunCol: '#ffd0a0', sunI: 1.6, az: 25, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0, aoK: 0.6 },
};
const SET_GRADE = {
  plaza: { look: 'golden', over: { exp: 1.28, con: 1.2, lift: [0.06, 0.045, 0.07], tH: ['#ffd8a8', 0.06], bloom: [0.4, 0.8], hal: [0.18, '#ff8a50'], vig: [0.26, 0.5, '#4a3a6a'] } },
  radio: { look: 'office', over: { exp: 1.7, con: 1.22, lift: [0.07, 0.055, 0.07], tH: ['#ffc890', 0.03], bloom: [0.42, 0.8], hal: [0.22, '#ff7a3a'], vig: [0.32, 0.46, '#3a2a4a'] } },
  talks: { look: 'office', over: { exp: 1.55, con: 1.24, lift: [0.065, 0.05, 0.07], tH: ['#ffd0a0', 0.04], bloom: [0.45, 0.78], hal: [0.22, '#ff8a40'], vig: [0.3, 0.46, '#3a2a4a'] } },
  cigar: { look: 'office', over: { exp: 1.6, con: 1.24, lift: [0.06, 0.05, 0.065], tH: ['#ffd0a0', 0.03], bloom: [0.4, 0.8], hal: [0.2, '#ff8a40'], vig: [0.36, 0.42, '#2a2040'] } },
};
const SET_PRACT = {
  plaza: [{ p: [0, 3.6, -17.5], col: '#ffc080', I: 2.0, d: 9 }, { p: [0, PZ.balY + 2.0, -14.8], col: '#ffd8b0', I: 1.4, d: 5 }],
  radio: [{ p: [0, 2.6, -0.4], col: '#ffd0a0', I: 2.2, d: 5 }, { p: [0, 2.5, -2.9], col: '#ff4a30', I: 1.0, d: 2.5, onair: 1 }, { p: [0, 2.3, -4.6], col: '#a8d8c8', I: 2.4, d: 6 }, { p: [1.8, 1.8, 2.4], col: '#ffc888', I: 1.0, d: 6 }],
  talks: [{ p: [0, 2.6, 1.6], col: '#ffd8b0', I: 1.0, d: 6 }, { p: [TK.x0 + 0.3, 1.35, -1.55], col: '#ffc070', I: 1.2, d: 3 }, { p: [0, 1.4, -2.4], col: '#ffd8a8', I: 1.6, d: 4.5 }],
  cigar: [{ p: [0.6, 1.6, -1.2], col: '#ffd0a0', I: 1.4, d: 4 }, { p: [-0.5, 1.1, 0.5], col: '#8a90d8', I: 0.6, d: 3 }, { p: [0, 0.95, 0.0], col: '#60ff80', I: 0, d: 0.9, glow: 1 }],
};

export function buildHavana(ctx) {
  ({ THREE, toon, mkTex, PT } = ctx); M = materials(); NOINK.clear();
  const groups = {};
  for (const name of SETS) { const g = new THREE.Group(); g.name = 'havana_' + name; g.position.set(...O[name]); g.visible = false; ctx.scene.add(g); groups[name] = g; }
  buildPlaza(groups.plaza); buildRadio(groups.radio); buildTalks(groups.talks); buildCigar(groups.cigar);
  if (ctx.NOND) { for (const m of NOINK) ctx.NOND.add(m); for (const k in groups) groups[k].traverse((o) => { if (o.isMesh && (o.material === M.glass)) { ctx.NOND.add(o); o.castShadow = o.receiveShadow = false; } }); }
  let onAir = 1, glow = 0;
  // crowd spots in front of the balcony: rows facing the balcony (cards face the camera by default; use view 'back' / '34B*' if needed)
  const crowd = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) crowd.push(W3('plaza', [-7.0 + c * 2.0 + (r % 2) * 1.0, 0, -5.5 + r * 2.4]));
  const spots = {
    // plaza
    plazaOrigin: W3('plaza', [0, 0, 0]), podium: W3('plaza', PZ.podium), balconyRail: W3('plaza', [0, PZ.balY + 1.0, PZ.balZ + 0.05]), balconyFloor: W3('plaza', [0, PZ.balY, -15.0]),
    besidePodium: [W3('plaza', [-1.2, PZ.balY, -15.0]), W3('plaza', [1.2, PZ.balY, -15.0])], crowd, crowdFront: W3('plaza', [0, 0, -5.5]), crowdBack: W3('plaza', [0, 0, 4.5]),
    plazaCars: [W3('plaza', [-16.5, 0, -6]), W3('plaza', [-16.6, 0, 1]), W3('plaza', [16.6, 0, 0])], plazaSidewalk: W3('plaza', [-12.0, 0.16, 4.0]), arcade: W3('plaza', [0, 0, -17.6]),
    // radio
    radioOrigin: W3('radio', [0, 0, 0]), microphone: W3('radio', [RD.mic[0], RD.desk + 0.49, RD.mic[2]]), micBase: W3('radio', RD.mic), radioDesk: W3('radio', [0, RD.desk, -0.6]),
    hostChair: W3('radio', [0, 0, -1.45]), hostStand: W3('radio', [0, 0, -1.5]), vent: W3('radio', RD.vent), ventMouth: W3('radio', [RD.vent[0] + 0.05, RD.vent[1], RD.vent[2]]), onAirSign: W3('radio', [0, 2.71, RD.z0 + 0.13]),
    boothWindow: W3('radio', [0, 1.7, RD.z0]), engineers: [W3('radio', [-1.1, 0, RD.z0 - 1.85]), W3('radio', [1.0, 0, RD.z0 - 1.85])], radioAshtray: W3('radio', [0.55, RD.desk, -0.55]), radioDoor: W3('radio', [3.6, 0, 2.1]),
    // talks
    talksOrigin: W3('talks', [0, 0, 0]), table: W3('talks', [0, TK.top, 0]), chairs: [W3('talks', [-TK.chairX, 0, 0]), W3('talks', [TK.chairX, 0, 0])], chairL: W3('talks', [-TK.chairX, 0, 0]), chairR: W3('talks', [TK.chairX, 0, 0]),
    standL: W3('talks', [-TK.chairX - 0.05, 0, 0.45]), standR: W3('talks', [TK.chairX + 0.05, 0, 0.45]), giftBox: W3('talks', TK.gift), giftInside: W3('talks', [TK.gift[0], TK.top + 0.12, TK.gift[2]]), talksWindows: W3('talks', [0, 1.8, TK.z0]),
    // cigar
    cigarOrigin: W3('cigar', [0, 0, 0]), cigarBox: W3('cigar', CG.box), cigarBoxInside: W3('cigar', [0, CG.ty + 0.025, 0]), lighter: W3('cigar', [-0.24, CG.ty, 0.1]), board: W3('cigar', CG.board), boardScale: 0.2,
  };
  const V = (set, p, l, fov, cInf, fp, extra = {}) => { const c = { set, p: W3(set, p), l: W3(set, l), fov, cInf, fp: fp ? W3(set, fp) : null, ...extra }; c.focus = Math.hypot(...[0, 1, 2].map((i) => c.p[i] - (c.fp || c.l)[i])); return c; };
  const views = [
    V('plaza', [4.0, 3.2, 26], [0, 6.2, -12], 50, 1.5, [0, 2, -4], { cards: 'crowd' }),                       // 0 plaza wide: square, balcony with flags, palms, cars, crowd
    V('plaza', [2.4, 4.6, -4.0], [0, 6.0, -15], 28, 3, [0, 6.0, -15], { cards: 'podium' }),                    // 1 plaza medium: the speaker at the lectern on the flag-draped balcony
    V('plaza', [2.6, 7.4, -15.6], [-1.0, 1.0, 4], 50, 2.5, [0, 1.2, -2], { cards: 'crowdRev' }),               // 2 plaza reverse: over the lectern, the crowd cheering toward camera
    V('plaza', [-9.5, 1.5, 9.5], [-2.0, 1.5, -2.0], 44, 3, [-5.6, 1.2, 2.5], { cards: 'street' }),             // 3 plaza medium at street level: palms, cars, arcades (two-shot room)
    V('radio', [2.2, 1.55, 4.0], [-0.3, 1.25, -1.6], 50, 2, [0, 1.1, -1.0], { cards: 'host' }),                // 4 radio wide: studio, desk, mic, glass to the booth, EN EL AIRE
    V('radio', [0.8, 1.3, 1.3], [0.05, 1.2, -1.4], 42, 4, [0, 1.2, -1.4], { cards: 'host' }),                  // 5 radio medium: host at the mic, engineers behind the glass
    V('radio', [-1.5, 1.85, 1.3], [-3.6, 2.2, -0.75], 44, 4, [-3.9, 2.5, -0.7], { spray: 1.2 }),                // 6 radio close: the vent puffing a faint mist
    V('talks', [0.9, 1.8, 6.4], [0, 1.25, -0.6], 50, 2, [0, 0.9, 0], { cards: 'talks' }),                      // 7 talks wide: table, two chairs, fan, shutters + slats
    V('talks', [3.0, 1.5, 0.9], [-1.6, 1.05, -0.1], 46, 3, [-1.6, 1.2, 0], { cards: 'talksL', gift: 0.15 }),  // 8 talks medium: along the table at the far chair (gift between)
    V('talks', [0.3, 1.62, 1.0], [0, 0.8, 0.0], 40, 6, [0, 0.85, 0.05], { gift: 1 }),                      // 9 talks close: the gift open, wetsuit + mask
    V('cigar', [0.08, 1.24, 0.78], [0.0, 0.94, -0.2], 38, 5, [0, 0.85, -0.05], { board: 1 }),                  // 10 cigar medium tabletop (board stand-in behind the box)
    V('cigar', [0.03, 1.1, 0.5], [0, 0.83, -0.01], 38, 8, [0, 0.83, 0], {}),                                // 11 cigar close-up: box, label, cigars
    V('cigar', [0.03, 1.1, 0.5], [0, 0.83, -0.01], 38, 8, [0, 0.83, 0], { glow: 1 }),                       // 12 cigar close-up with the sinister green glow
  ];
  const API = {
    groups, origin: O, spots, views, sets: SETS, gift: GIFT, fan: FAN, onAirSign: ONAIR,
    // radio: faint mist puffing from the vent (t = seconds since the spray started; 0 = off). Animate t with the frame (t = (f - f0) / 30).
    setSpray: (t) => setSprayT(t),
    setOnAir(on) { onAir = on ? 1 : 0; ONAIR.material = on ? M.onAir : M.onAirOff; },
    // talks: gift box lid 0 = closed, 1 = fully open (wetsuit + mask visible)
    setGift(t) { t = Math.max(0, Math.min(1, t)); const e = t * t * (3 - 2 * t); GIFT.userData.lid.rotation.x = -e * 1.95; },
    setFan(a) { FAN.rotation.y = a; },
    // cigar: sinister faint green glow 0..1 (cigars tint + halo + a green point light)
    setCigarGlow(t) { glow = Math.max(0, Math.min(1, t)); M.cigar.emissive.setRGB(0.0, 0.07 * glow, 0.02 * glow); M.cigar.color.copy(CIGAR_MAT_BASE).lerp(new THREE.Color(0x7a9a70), 0.3 * glow); GLOW.forEach((m, i) => { m.material.opacity = glow * (0.12 - i * 0.03); m.visible = glow > 0.001; }); },
    lightFor(name) { const base = name === 'plaza' ? 'golden' : 'office'; return { ...LIGHTS_[base], ...SET_LIGHT[name] }; },
    gradeFor: (name) => ({ ...((SET_GRADE[name] || {}).over || {}) }), lookFor: (name) => (SET_GRADE[name] || {}).look || 'office',
    show(world, name) { for (const k in groups) groups[k].visible = k === name;
      if (name) { for (const k of ['road', 'stadium', 'office', 'car', 'dc']) if (world[k]) world[k].visible = false; for (const k of ['rooms', 'louvre', 'paris', 'station', 'theatre']) if (world[k] && world[k].show) world[k].show(world, null); }
      if (SI && !name) SI.g.visible = false; },
    placeLights(PRACT, name, tgt) { const Lp = (SET_PRACT[name] || []).map((c) => (c.onair ? { ...c, I: c.I * onAir } : c.glow ? { ...c, I: 0.18 * glow } : c));
      PRACT.forEach((l, i) => { const c = Lp[i]; l.visible = true; if (!c) { l.intensity = 0; return; } l.position.set(...W3(name, c.p)); l.color.set(c.col); l.intensity = c.I; l.distance = c.d; l.decay = 1.6; }); },
    // test-view helper (main.js ?havanaview=N | a): { i, mod, set, L, look, grade, cam, ... }
    viewFor(i) { const k = ((i % views.length) + views.length) % views.length, c = views[k]; return { i: k, mod: API, set: c.set, cards: c.cards, board: c.board || 0, spray: c.spray || 0, gift: c.gift || 0, glow: c.glow || 0, L: API.lightFor(c.set), look: API.lookFor(c.set), grade: API.gradeFor(c.set), cam: { p: c.p, l: c.l, fov: c.fov, focus: c.focus, cInf: c.cInf, roll: c.roll || 0, shadowAt: c.fp || c.l } }; },
    apply(world, v) { API.show(world, v.set); API.setSpray(v.spray || 0); API.setGift(v.gift || 0); API.setCigarGlow(v.glow || 0); API.setFan(0.4); standIns(API, v); },
  };
  API.view = API.viewFor; API.setSpray(0); API.setGift(0); API.setCigarGlow(0); API.setFan(0.4);
  globalThis.__havana = API;
  return API;
}

// ---------------------------------------------------------------- test stand-ins (Oddverra cards for scale, ?havanaview stills only)
let SI = null;
function standIns(API, v) {
  if (!SI) { SI = { g: new THREE.Group(), cards: [] }; SI.g.name = 'havana_standins'; API.groups.plaza.parent.add(SI.g);
    const geo = new THREE.PlaneGeometry(1.35, 2.25); geo.translate(0, 1.069, 0);
    const mk = (o, op) => { const cv = document.createElement('canvas'); cv.width = 600; cv.height = 1000; oddverra(cv.getContext('2d'), o, op); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: 0.8, color: new THREE.Color(0xffffff).multiplyScalar(0.4), alphaTest: 0.5, side: THREE.DoubleSide })); m.castShadow = true; SI.g.add(m); return m; };
    const sk = ['#f2c9a4', '#d8a47c', '#b87a52', '#f6d0b0'];
    SI.cards.push(mk({ shirt: '#5a6a3a', pants: '#4a5a32', hat: 'cap', hatCol: '#4a5a32', hair: 'short', hairCol: '#1e1612', moustache: '#1e1612', skin: '#e8b890', head: 'wide', seed: 1 }, { expr: 'grin', t: 3, wave: 0.8 })); // speaker / host (fatigues)
    SI.cards.push(mk({ shirt: '#3a3a44', pants: '#2f2f3a', hat: 'fedora', hatCol: '#3a3440', hair: 'short', hairCol: '#8a8a8a', glasses: true, skin: '#f2c9a4', head: 'round', neck: 'tie', seed: 2 }, { expr: 'smile', t: 5 })); // lawyer
    for (let i = 0; i < 14; i++) SI.cards.push(mk({ shirt: ['#f4f0e6', '#e8c86a', '#5a7a9a', '#c84a3a'][i % 4], pants: '#3a3440', hat: i % 2 ? 'fedora' : undefined, hatCol: '#e8d8a8', hair: i % 3 === 1 ? 'curly' : 'short', hairCol: '#2a1a12', skin: sk[i % 4], head: ['round', 'wide', 'egg'][i % 3], lashes: i % 3 === 1, seed: 10 + i }, { expr: ['grin', 'laugh', 'excited', 'happy'][i % 4], cheer: 1, t: i * 5 })); }
  if (!SI.board) { const cv = document.createElement('canvas'); cv.width = 300; cv.height = 400; const g = cv.getContext('2d'); g.fillStyle = '#f4ecd8'; g.fillRect(10, 10, 280, 380); g.strokeStyle = '#c8262a'; g.lineWidth = 12; g.strokeRect(24, 24, 252, 352); g.fillStyle = '#c8262a'; g.font = 'bold 54px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; ['NEVER', 'REACHED', 'HIM'].forEach((t, i) => g.fillText(t, 150, 140 + i * 70, 240));
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; const geo = new THREE.PlaneGeometry(1.35 * 0.2, 1.8 * 0.2); geo.translate(0, 0.9 * 0.2, 0); SI.board = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: 0.6, color: 0x777777 })); API.groups.plaza.parent.add(SI.board); }
  SI.board.visible = !!v.board; if (v.board) { SI.board.position.set(...API.spots.board); SI.board.rotation.set(0, Math.atan2(v.cam.p[0] - API.spots.board[0], v.cam.p[2] - API.spots.board[2]), 0); }
  for (const m of SI.cards) m.visible = false; SI.g.visible = !!v.cards; if (!v.cards) return;
  const cp = v.cam.p, put = (m, p) => { m.position.set(...p); m.rotation.set(0, Math.atan2(cp[0] - p[0], cp[2] - p[2]), 0); m.visible = true; };
  const S = API.spots;
  if (v.cards === 'podium' || v.cards === 'crowd' || v.cards === 'crowdRev') put(SI.cards[0], S.podium);
  if (v.cards === 'crowd') for (let i = 0; i < 12; i++) put(SI.cards[2 + i], S.crowd[[2, 5, 9, 12, 14, 17, 19, 22, 26, 28, 31, 35][i]]);
  if (v.cards === 'crowdRev') for (let i = 0; i < 12; i++) put(SI.cards[2 + i], S.crowd[[1, 3, 5, 8, 10, 12, 14, 17, 19, 21, 24, 27][i]]);
  if (v.cards === 'street') { put(SI.cards[0], W3('plaza', [-6.0, 0, 2.6])); put(SI.cards[1], W3('plaza', [-4.6, 0, 2.2])); }
  if (v.cards === 'host') { put(SI.cards[0], v.spray ? W3('radio', [-0.6, 0, -1.5]) : S.hostStand); put(SI.cards[2], S.engineers[0]); put(SI.cards[3], S.engineers[1]); }
  if (v.cards === 'talks') { put(SI.cards[0], S.standL); put(SI.cards[1], S.standR); }
  if (v.cards === 'talksL') put(SI.cards[0], S.standL);
}
