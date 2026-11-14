// dc.js: [KITTY-dc] 1960s Washington, D.C. set for "Acoustic Kitty".
// A park with benches, lamps, hedges and an iron fence on the EAST side (x > 0) of a two-lane asphalt street that runs along z;
// across the street (WEST, x < 0) a stone embassy-style compound behind a tall iron fence with a red flag, then 1960s rowhouse shops
// (DRUG STORE, HOTEL, DINER, BARBER ...). Vehicles: a yellow taxi, a surveillance panel van (opening side doors, recorders inside),
// three parked civilian sedans. Everything is procedural and original.
//
// Coordinates: the static set is centred at world (0, 0, DC_OZ = 800). Every position in the API below is in WORLD coordinates.
// Street: road surface x -5..5 (y = 0), centre line x = 0, travel lanes x = -1.5 (northbound, +z) and x = +1.5 (southbound, -z),
// parking lanes x = -3.9 / +3.9. Kerbs at |x| = 5, sidewalks 5..8.5 (top y = 0.15). Park ground top y = 0.15.
import { Kit, rboxGeo, instance, props } from './world.js';
import * as PT from './paint.js';

let THREE, toon, rnd, P, mkTex, macro;
const M = {};
export const DC_OZ = 800;
const OZ = DC_OZ;

// ---------------------------------------------------------------- geometry cache
const GC = new Map();
const cached = (k, mk) => { let g = GC.get(k); if (!g) GC.set(k, (g = mk())); return g; };
const cyl = (rt, rb, h, rs = 10, open = false) => cached(`c${rt}|${rb}|${h}|${rs}|${open}`, () => new THREE.CylinderGeometry(rt, rb, h, rs, 1, open));
const sph = (r, ws = 12, hs = 8) => cached(`s${r}|${ws}|${hs}`, () => new THREE.SphereGeometry(r, ws, hs));
const tor = (r, t, rs = 6, ts = 24, arc = Math.PI * 2) => cached(`t${r}|${t}|${rs}|${ts}|${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));
const cone = (r, h, rs = 8) => cached(`k${r}|${h}|${rs}`, () => new THREE.ConeGeometry(r, h, rs));
const plane = (w, h) => cached(`p${w}|${h}`, () => new THREE.PlaneGeometry(w, h));
const ring = (a, b, n = 24) => cached(`r${a}|${b}|${n}`, () => new THREE.RingGeometry(a, b, n));
// lumpy leaf clump (smoothly displaced sphere)
const lump = (v) => cached('lump' + v, () => {
  const g = new THREE.SphereGeometry(1, 14, 10), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = 1 + 0.13 * Math.sin(x * 3.3 + v * 1.9) * Math.cos(z * 2.9 - v) + 0.08 * Math.sin(y * 4.1 + x * 2.3 + v * 3.1); p.setXYZ(i, x * n, y * n, z * n); }
  g.computeVertexNormals(); return g;
});
// a side profile (points in z,y) extruded across x, centred on x = 0, with rounded (bevelled) edges
function profGeo(key, pts, width, bevel = 0.06) {
  return cached('pf' + key, () => {
    const sh = new THREE.Shape(); pts.forEach(([u, v], i) => (i ? sh.lineTo(u, v) : sh.moveTo(u, v)));
    const d = Math.max(0.01, width - 2 * bevel), g = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 8 });
    g.rotateY(-Math.PI / 2); g.translate(d / 2, 0, 0); return g;
  });
}
// triangular prism (pediment): base w on y = 0, apex h, depth d along +z from 0
const prism = (w, h, d) => cached(`pr${w}|${h}|${d}`, () => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.lineTo(-w / 2, 0); return new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1 }); });
const xs = (sd, a, b) => (sd > 0 ? [a, b] : [-b, -a]); // mirror an x-range to side sd

// ---------------------------------------------------------------- painters (all original; lines are darker indigo-leaning shades)
const { css, shade, tint, vary, rng, fbm, modulate } = PT;
function asphalt(g, w, h) { // tile: u spans the whole road (x -5..5), v = 10 m along it
  const base = [128, 124, 132], R = rng(7);
  g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  modulate(g, w, h, (u, v) => {
    const big = fbm(u, v, 3, 3, 3, 4), mid = fbm(u, v, 12, 12, 2, 9);
    let m = 0.9 + 0.17 * big + 0.05 * (mid - 0.5);
    const lane = Math.exp(-(((u - 0.35) / 0.035) ** 2)) + Math.exp(-(((u - 0.65) / 0.035) ** 2)); m *= 1 - 0.13 * lane * (0.5 + 0.5 * fbm(u, v, 2, 6, 2, 13));
    const track = [0.26, 0.44, 0.56, 0.74].reduce((a, c) => a + Math.exp(-(((u - c) / 0.03) ** 2)), 0); m *= 1 + 0.05 * track;
    m *= 1 - 0.14 * (1 - Math.min(1, Math.min(u, 1 - u) / 0.035));
    return [m, m, m * 1.03];
  });
  // repair patches with a tar outline
  for (const [u0, v0, uw, vh] of [[0.58, 0.12, 0.14, 0.18], [0.22, 0.62, 0.1, 0.1]]) { g.fillStyle = css(shade(base, 0.88)); g.fillRect(u0 * w, v0 * h, uw * w, vh * h); g.strokeStyle = css(shade(base, 0.6), 0.8); g.lineWidth = 3; g.strokeRect(u0 * w, v0 * h, uw * w, vh * h); }
  // sealed cracks: long wobbly tar lines
  g.lineCap = 'round';
  for (let i = 0; i < 7; i++) { let x = R() * w, y = R() * h, a = R() < 0.5 ? Math.PI / 2 + (R() - 0.5) * 0.6 : (R() - 0.5) * 0.8; g.strokeStyle = css(shade(base, 0.55), 0.7); g.lineWidth = 2.5 + R() * 2; g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 18; k++) { a += (R() - 0.5) * 0.7; x += Math.cos(a) * 14; y += Math.sin(a) * 14; g.lineTo(x, y); } g.stroke(); }
  // a few light aggregate flecks (sparse, structured)
  for (let i = 0; i < 260; i++) { g.fillStyle = css(tint(base, 1.35), 0.35); g.beginPath(); g.arc(R() * w, R() * h, 1.2 + R() * 1.4, 0, 7); g.fill(); }
  // worn white markings: centre dashes (3 m on, 2 m off) and parking-lane lines at x = +-2.9
  const paintLine = (u, hw, v0, v1) => { g.fillStyle = 'rgba(238,234,222,0.92)'; g.fillRect((u - hw) * w, v0 * h, hw * 2 * w, (v1 - v0) * h);
    for (let k = 0; k < (v1 - v0) * 160; k++) { g.fillStyle = css(shade(base, 0.95), 0.25 + 0.5 * R()); g.beginPath(); g.ellipse((u + (R() - 0.5) * hw * 2) * w, (v0 + R() * (v1 - v0)) * h, 2 + R() * 5, 1.5 + R() * 4, R() * 3, 0, 7); g.fill(); } };
  paintLine(0.5, 0.0055, 0.05, 0.35); paintLine(0.5, 0.0055, 0.55, 0.85);
  paintLine(0.21, 0.004, 0, 1); paintLine(0.79, 0.004, 0, 1);
}
function concrete(g, w, h, o = {}) { // sidewalk slabs, n x n per tile
  const base = PT.hex(o.base || '#cdc6ba'), R = rng(o.seed || 17), n = o.n || 2, s = w / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = css(vary(base, (R() - 0.5) * 0.08)); g.fillRect(i * s, j * s, s, s); }
  modulate(g, w, h, (u, v) => 0.94 + 0.1 * fbm(u, v, 4, 4, 3, 5));
  for (let i = 0; i < 18; i++) { g.fillStyle = css(shade(base, 0.7), 0.12 + 0.1 * R()); g.beginPath(); g.ellipse(R() * w, R() * h, 3 + R() * 9, 2 + R() * 6, R() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 3; i++) { let x = R() * w, y = R() * h, a = R() * 6; g.strokeStyle = css(shade(base, 0.55), 0.6); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 8; k++) { a += (R() - 0.5) * 0.9; x += Math.cos(a) * 10; y += Math.sin(a) * 10; g.lineTo(x, y); } g.stroke(); }
  g.fillStyle = css(shade(base, 0.55), 0.85); for (let i = 0; i <= n; i++) { g.fillRect(i * s - 2, 0, 4, h); g.fillRect(0, i * s - 2, w, 4); }
  g.fillStyle = css(tint(base, 1.15), 0.5); for (let i = 0; i <= n; i++) { g.fillRect(i * s + 2, 0, 1.5, h); g.fillRect(0, i * s + 2, w, 1.5); }
}
function glassPaint(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2e3550'); gr.addColorStop(0.5, '#4a5878'); gr.addColorStop(1, '#5e6c8c'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(236,240,255,0.22)'; for (const [x, k] of [[0.18, 0.12], [0.36, 0.05], [0.66, 0.09]]) { g.beginPath(); g.moveTo(x * w, h); g.lineTo((x + k) * w, h); g.lineTo((x + k + 0.25) * w, 0); g.lineTo((x + 0.25) * w, 0); g.fill(); }
  g.fillStyle = 'rgba(20,16,40,0.35)'; g.fillRect(0, 0, w, h * 0.12);
}
function plaster(g, w, h, o = {}) { const base = PT.hex(o.base || '#e8dcc4'); g.fillStyle = css(base); g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.93 + 0.12 * fbm(u, v, 4, 4, 3, o.seed || 3)); const R = rng(9); for (let i = 0; i < 30; i++) { g.fillStyle = css(shade(base, 0.8), 0.12); g.fillRect(R() * w, R() * h, 2, 20 + R() * 60); } }
function quilt(g, w, h) { // padded van lining: vertical channels with button tufts
  const base = [214, 196, 160]; g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  for (let i = 0; i < 8; i++) { const x = i * w / 8, gr = g.createLinearGradient(x, 0, x + w / 8, 0); gr.addColorStop(0, css(shade(base, 0.7))); gr.addColorStop(0.25, css(base)); gr.addColorStop(0.6, css(tint(base, 1.1))); gr.addColorStop(1, css(shade(base, 0.75))); g.fillStyle = gr; g.fillRect(x, 0, w / 8, h);
    for (let j = 0; j < 4; j++) { g.fillStyle = css(shade(base, 0.5)); g.beginPath(); g.arc(x, (j + 0.5) * h / 4, 3, 0, 7); g.fill(); } }
}
function flutes(g, w, h) { const base = [222, 214, 196]; for (let i = 0; i < 20; i++) { const x = i * w / 20, gr = g.createLinearGradient(x, 0, x + w / 20, 0); gr.addColorStop(0, css(tint(base, 1.08))); gr.addColorStop(0.45, css(base)); gr.addColorStop(0.85, css(shade(base, 0.72))); gr.addColorStop(1, css(tint(base, 1.05))); g.fillStyle = gr; g.fillRect(x, 0, w / 20, h); } modulate(g, w, h, (u, v) => 0.95 + 0.08 * fbm(u, v, 2, 4, 2, 8)); }
function officeFacade(g, w, h, o = {}) { // far buildings: 4 windows x 2 floors per tile
  const base = PT.hex(o.base || '#c8bca6'); g.fillStyle = css(base); g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.93 + 0.1 * fbm(u, v, 3, 3, 2, o.seed || 2));
  const R = rng(o.seed || 4);
  for (let f = 0; f < 2; f++) for (let i = 0; i < 4; i++) { const x = (i + 0.2) * w / 4, y = (f + 0.22) * h / 2, ww = w / 4 * 0.6, wh = h / 2 * 0.55;
    g.fillStyle = css(shade(base, 0.6)); g.fillRect(x - 3, y - 3, ww + 6, wh + 8);
    g.fillStyle = R() < 0.25 ? '#e8dcb4' : '#4a5470'; g.fillRect(x, y, ww, wh); g.fillStyle = 'rgba(230,236,255,0.18)'; g.fillRect(x, y, ww * 0.3, wh);
    g.fillStyle = css(tint(base, 1.15)); g.fillRect(x - 5, y + wh + 2, ww + 10, 5); }
}
// text: 1960s enamel / painted signs (sans), drop shadow, border
function signTex(text, o = {}) {
  const W = o.pw || 1024, H = Math.round(W * (o.h || 0.2) / (o.w || 1));
  return mkTex(W, H, (g, w, h) => {
    g.fillStyle = o.bg || '#1f3a5a'; g.fillRect(0, 0, w, h);
    modulate(g, w, h, (u, v) => 0.93 + 0.1 * fbm(u, v, 3, 2, 2, text.length));
    if (o.border !== false) { g.strokeStyle = o.edge || o.fg || '#fff'; g.lineWidth = h * 0.05; g.strokeRect(h * 0.07, h * 0.07, w - h * 0.14, h - h * 0.14); }
    const lines = text.split('\n'), fs = (o.fs || 0.62) * h / lines.length;
    lines.forEach((ln, i) => {
      const sz = i === 0 ? fs : fs * (o.sub || 0.62), y = h / 2 + (i - (lines.length - 1) / 2) * fs * 1.05 + (i ? fs * 0.08 : 0);
      g.font = `${o.italic ? 'italic ' : ''}bold ${sz | 0}px ${o.serif ? '"DejaVu Serif", serif' : '"DejaVu Sans", sans-serif'}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      const mw = g.measureText(ln).width, sx = Math.min(1, (w - h * 0.4) / mw); g.save(); g.translate(w / 2, y); g.scale(sx, 1);
      if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = sz * 0.25; }
      g.fillStyle = 'rgba(20,12,40,0.45)'; g.fillText(ln, sz * 0.04, sz * 0.05); g.shadowBlur = 0; g.fillStyle = i ? o.fg2 || o.fg || '#fff' : o.fg || '#fff'; g.fillText(ln, 0, 0); g.restore();
    });
    if (o.draw) o.draw(g, w, h);
  });
}
// vertical blade sign: letters stacked
function bladeTex(text, bg, fg, rim, aspect = 3.8) {
  return mkTex(256, Math.round(256 * aspect), (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = rim; g.lineWidth = 14; g.strokeRect(10, 10, w - 20, h - 20); g.lineWidth = 4; g.strokeRect(26, 26, w - 52, h - 52);
    const fsz = Math.min(170, (h - 80) / text.length * 0.92); g.font = `bold ${fsz | 0}px "DejaVu Sans", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    [...text].forEach((ch, i) => { const y = (i + 0.5) * (h - 80) / text.length + 40; g.fillStyle = 'rgba(20,12,40,0.5)'; g.fillText(ch, w / 2 + 5, y + 6); g.fillStyle = fg; g.fillText(ch, w / 2, y); });
  });
}
const tm = (t, o = {}) => toon({ map: t, ...o });
const vc = (o = {}) => toon({ vertexColors: true, ...o });

function materials() {
  const T = (w, h, fn, rep) => mkTex(w, h, fn, rep);
  M.paint = vc();
  M.chrome = vc({ map: T(256, 256, (g, w, h) => PT.metal(g, w, h, { base: '#d8dce4' })) });
  M.glass = vc({ map: T(128, 256, glassPaint) });
  M.lamp = vc({ emissive: 0x6a6450 });
  M.glow = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true });
  M.asphalt = macro(toon({ map: T(1024, 1024, asphalt) }), 0.1, 0.04);
  M.walk = macro(vc({ map: T(512, 512, (g, w, h) => concrete(g, w, h)) }), 0.08, 0.05);
  M.kerb = vc({ map: T(256, 256, (g, w, h) => PT.stone(g, w, h, { base: '#b4b0aa', n: 3 })) });
  M.path = macro(toon({ map: T(256, 512, (g, w, h) => PT.dirt(g, w, h, { base: '#d9cbaa', ruts: [], seed: 31 })) }), 0.08, 0.05);
  M.pave = vc({ map: T(512, 512, (g, w, h) => concrete(g, w, h, { base: '#d6cdbb', n: 4, seed: 5 })) });
  M.grass = macro(toon({ map: P.grass(4, { base: '#93b45a', seed: 51, flowers: 6 }) }), 0.16, 0.04);
  M.lawn = vc({ map: P.grass(4, { base: '#9cbc5e', seed: 52, flowers: 0 }) });
  M.ashlar = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#ded4c0', rows: 4, cols: 2, mortar: '#c4b8a2', seed: 3 })) });
  M.rust = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#d4c9b2', rows: 3, cols: 2, mortar: '#8f8372', seed: 4 })) });
  M.flute = vc({ map: T(256, 64, flutes) });
  M.brickR = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#ad5640', rows: 24, cols: 6, seed: 8 })) });
  M.brickY = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#d2b486', rows: 24, cols: 6, seed: 9, mortar: '#e2d6c0' })) });
  M.brickD = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#8a4a3e', rows: 24, cols: 6, seed: 10 })) });
  M.plaster = vc({ map: T(256, 256, (g, w, h) => plaster(g, w, h)) });
  M.slat = vc({ map: T(256, 64, (g, w, h) => PT.planks(g, w, h, { base: '#b0773e', n: 1, joints: 0, seed: 12 })) });
  M.oak = vc({ map: T(256, 256, (g, w, h) => PT.planks(g, w, h, { base: '#7a4a2c', n: 4, seed: 13 })) });
  M.bark = vc({ map: P.bark('#6b5040') });
  M.curtain = vc({ map: T(128, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#ffffff', folds: 5, seed: 3 })) });
  M.quilt = vc({ map: T(256, 256, quilt), emissive: 0x5a4630 });
  M.water = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#7aa6c8'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(240,248,255,0.5)'; g.lineWidth = 3; for (let i = 0; i < 30; i++) { const x = rnd(i) * w, y = rnd(i + 9) * h; g.beginPath(); g.arc(x, y, 10 + 30 * rnd(i + 3), 0.3, 1.6); g.stroke(); } }) });
  M.office = [0, 1, 2].map((s) => vc({ map: T(512, 512, (g, w, h) => officeFacade(g, w, h, { base: ['#cfc8b8', '#b8b4aa', '#d8d2c4'][s], seed: s + 2 })) }));
  M.awnG = toon({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#f2ede0', stripes: '#3f7a52', nStripes: 10, hem: true })), side: THREE.DoubleSide });
  M.awnR = toon({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#f2ede0', stripes: '#b8352e', nStripes: 10, hem: true })), side: THREE.DoubleSide });
  M.awnB = toon({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#f2ede0', stripes: '#2f4f86', nStripes: 10, hem: true })), side: THREE.DoubleSide });
  M.pole = toon({ map: T(128, 256, (g, w, h) => { g.fillStyle = '#f4f0e8'; g.fillRect(0, 0, w, h); for (let i = -4; i < 8; i++) for (const [c, o] of [['#c8302c', 0], ['#2f4f96', 0.5]]) { g.fillStyle = c; g.beginPath(); const y = (i + o) * h / 4; g.moveTo(0, y); g.lineTo(w, y + h / 4); g.lineTo(w, y + h / 4 + h / 14); g.lineTo(0, y + h / 14); g.fill(); } }) });
  M.leaf = props().bush[0][0];
}

// ---------------------------------------------------------------- small helpers
function ground(parent, x0, x1, z0, z1, y, mat, tu, tv = tu) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2);
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (x1 - x0) / tu, uv.getY(i) * (z1 - z0) / tv);
  const m = new THREE.Mesh(g, mat); m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.receiveShadow = true; parent.add(m); return m;
}
// a sign face (plane) on a framed backing; local wall frame (faces +z)
function signBoard(K, x, y, z, w, h, mat, frame = 0x2a2830) { K.box(M.paint, x - w / 2 - 0.05, x + w / 2 + 0.05, y - h / 2 - 0.05, y + h / 2 + 0.05, z - 0.04, z + 0.03, frame, 0.015); K.put(mat, plane(w, h), x, y, z + 0.035); }

// ---------------------------------------------------------------- park furniture
// park bench: cast-iron frames + wooden slats. Local: length along x, seat faces +z, seat height 0.45
function bench(K) {
  const iron = 0x263530, wood = 0xffffff;
  for (const x of [-0.88, 0, 0.88]) {
    const end = x !== 0;
    K.beam(M.paint, [x, 0.02, 0.22], [x, 0.24, 0.17], 0.045, iron); K.beam(M.paint, [x, 0.24, 0.17], [x, 0.43, 0.2], 0.045, iron);
    K.beam(M.paint, [x, 0.02, -0.26], [x, 0.43, -0.18], 0.045, iron); K.beam(M.paint, [x, 0.43, -0.18], [x, 0.98, -0.36], 0.04, iron);
    K.beam(M.paint, [x, 0.42, 0.22], [x, 0.42, -0.2], 0.04, iron);
    K.beam(M.paint, [x, 0.12, 0.2], [x, 0.12, -0.24], 0.025, iron);
    for (const z of [0.23, -0.27]) K.cb(M.paint, 0.08, 0.04, 0.1, x, 0.02, z, iron, 0, 0, 0, 0.015); // feet
    if (end) { // armrest with a scroll
      K.beam(M.paint, [x, 0.43, 0.2], [x, 0.66, 0.24], 0.035, iron); K.beam(M.paint, [x, 0.67, 0.27], [x, 0.69, -0.24], 0.045, iron);
      K.put(M.paint, tor(0.05, 0.016, 5, 12, Math.PI * 1.5), x, 0.62, 0.27, 0, Math.PI / 2, 0, 1, 1, 1, iron);
      K.put(M.paint, tor(0.07, 0.016, 5, 12, Math.PI * 1.4), x, 0.22, 0.12, 0, Math.PI / 2, 2.2, 1, 1, 1, iron);
    }
  }
  for (let i = 0; i < 5; i++) { const z = 0.19 - i * 0.095; K.box(M.slat, -0.98, 0.98, 0.43, 0.47, z - 0.04, z + 0.04, wood, 0.012, [1.96, 0.3]); }
  for (let i = 0; i < 3; i++) { const t = 0.3 + i * 0.27, y = 0.45 + t * 0.53, z = -0.18 - t * 0.18; K.put(M.slat, rboxGeo(1.96, 0.09, 0.035, 0.012, [1.96, 0.3]), 0, y, z - 0.03, -0.32, 0, 0, 1, 1, 1, wood); }
}
// Victorian-style cast-iron lamp post with an acorn globe. h = top of post
function lampPost(K, x, z, h = 3.6, twin = false) {
  const iron = 0x22292e;
  K.put(M.paint, cyl(0.2, 0.24, 0.1, 10), x, 0.05, z, 0, 0, 0, 1, 1, 1, iron);
  K.put(M.paint, cyl(0.14, 0.2, 0.55, 10), x, 0.37, z, 0, 0, 0, 1, 1, 1, iron);
  K.put(M.paint, tor(0.14, 0.03, 5, 14), x, 0.66, z, Math.PI / 2, 0, 0, 1, 1, 1, iron);
  K.put(M.paint, cyl(0.06, 0.085, h - 0.7, 12), x, 0.66 + (h - 0.7) / 2, z, 0, 0, 0, 1, 1, 1, iron);
  for (const y of [1.4, h - 0.4]) K.put(M.paint, tor(0.075, 0.022, 5, 12), x, y, z, Math.PI / 2, 0, 0, 1, 1, 1, iron);
  const top = (lx, lz) => {
    K.put(M.paint, cyl(0.1, 0.06, 0.12, 10), lx, h + 0.06, lz, 0, 0, 0, 1, 1, 1, iron);
    K.put(M.lamp, sph(0.21, 14, 10), lx, h + 0.36, lz, 0, 0, 0, 1, 1.25, 1, 0xfbf6e6);
    K.put(M.paint, cone(0.2, 0.16, 10), lx, h + 0.66, lz, 0, 0, 0, 1, 1, 1, iron); K.put(M.paint, sph(0.035, 6, 4), lx, h + 0.76, lz, 0, 0, 0, 1, 1, 1, iron);
  };
  if (twin) { K.beam(M.paint, [x - 0.45, h - 0.05, z], [x + 0.45, h - 0.05, z], 0.03, iron, true, 6); for (const sd of [-1, 1]) { K.put(M.paint, tor(0.12, 0.018, 4, 10, Math.PI), x + sd * 0.2, h - 0.17, z, 0, 0, 0, 1, 1, 1, iron); top(x + sd * 0.45, z); } }
  else top(x, z);
}
// low wrought-iron park fence (hoop-top pickets) along z at x
function parkFence(K, x, z0, z1) {
  const iron = 0x1f2a28, h = 1.05;
  for (let z = z0; z <= z1 + 1e-3; z += 2.5) { K.box(M.paint, x - 0.045, x + 0.045, 0.15, h + 0.1, z - 0.045, z + 0.045, iron, 0.01); K.put(M.paint, sph(0.055, 8, 6), x, h + 0.16, z, 0, 0, 0, 1, 1, 1, iron); }
  for (const y of [0.3, h - 0.08]) K.box(M.paint, x - 0.02, x + 0.02, y - 0.025, y + 0.025, z0, z1, iron, 0.006);
  for (let z = z0 + 0.17; z < z1; z += 0.17) { K.box(M.paint, x - 0.011, x + 0.011, 0.15, h, z - 0.011, z + 0.011, iron, 0.004); K.put(M.paint, cone(0.026, 0.08, 4), x, h + 0.04, z, 0, Math.PI / 4, 0, 1, 1, 1, iron); }
}
// tall embassy fence with stone base wall and piers along z at x (gap = gate opening half width)
function embassyFence(K, x, z0, z1, gap) {
  const iron = 0x1b1f26, stone = 0xe6dcc8, H = 2.7;
  const piers = []; for (let z = gap + 4.85; z <= z1; z += 4.4) { piers.push(z, -z); }
  for (const z of piers) { K.box(M.ashlar, x - 0.45, x + 0.45, 0.15, H + 0.3, z - 0.45, z + 0.45, stone, 0.02, 1.2); K.box(M.paint, x - 0.55, x + 0.55, H + 0.3, H + 0.48, z - 0.55, z + 0.55, stone, 0.03); K.put(M.paint, sph(0.24, 12, 8), x, H + 0.72, z, 0, 0, 0, 1, 1, 1, stone); K.put(M.paint, cyl(0.12, 0.18, 0.12, 10), x, H + 0.52, z, 0, 0, 0, 1, 1, 1, stone); }
  for (const sd of [-1, 1]) {
    const a = gap + 1.0, b = z1; const [za, zb] = sd > 0 ? [a, b] : [-b, -a];
    K.box(M.ashlar, x - 0.3, x + 0.3, 0.15, 0.75, za - 0.45, zb + 0.45, stone, 0.02, 1.2); K.box(M.paint, x - 0.36, x + 0.36, 0.75, 0.84, za - 0.45, zb + 0.45, stone, 0.02);
    for (const y of [1.0, H - 0.25]) K.box(M.paint, x - 0.025, x + 0.025, y - 0.03, y + 0.03, za, zb, iron, 0.008);
    for (let z = za + 0.17; z < zb; z += 0.17) { if (piers.some((p) => Math.abs(p - z) < 0.5)) continue; K.beam(M.paint, [x, 0.84, z], [x, H, z], 0.017, iron, true, 5); K.put(M.paint, cone(0.04, 0.16, 4), x, H + 0.08, z, 0, Math.PI / 4, 0, 1, 1, 1, iron); }
  }
  // grand gate piers with lanterns
  for (const sd of [-1, 1]) { const z = sd * (gap + 0.45); K.box(M.rust, x - 0.6, x + 0.6, 0.15, 3.4, z - 0.55, z + 0.55, stone, 0.02, 1.2); K.box(M.paint, x - 0.72, x + 0.72, 3.4, 3.62, z - 0.67, z + 0.67, stone, 0.03);
    K.put(M.paint, cyl(0.1, 0.16, 0.25, 8), x, 3.75, z, 0, 0, 0, 1, 1, 1, iron); K.box(M.lamp, x - 0.17, x + 0.17, 3.87, 4.3, z - 0.17, z + 0.17, 0xfbf3dc, 0.02); K.put(M.paint, cone(0.28, 0.25, 4), x, 4.42, z, 0, Math.PI / 4, 0, 1, 1, 1, iron); for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) K.box(M.paint, x + a * 0.17 - 0.02, x + a * 0.17 + 0.02, 3.87, 4.3, z + b * 0.17 - 0.02, z + b * 0.17 + 0.02, iron, 0.005); }
}
// one gate leaf: hinge at origin, extends along +z (dir = 1) or -z (dir = -1)
function gateLeaf(K, w, dir) {
  const iron = 0x1b1f26, gold = 0xc8a040;
  const zz = (t) => dir * t;
  for (const y of [0.35, 1.25, 2.55]) K.box(M.paint, -0.03, 0.03, y - 0.035, y + 0.035, Math.min(0, zz(w)), Math.max(0, zz(w)), iron, 0.008);
  K.box(M.paint, -0.04, 0.04, 0.2, 3.0, Math.min(0, zz(0.08)), Math.max(0, zz(0.08)), iron, 0.01);
  for (let t = 0.12; t < w; t += 0.13) { const top = 2.75 + 0.35 * Math.sin((t / w) * Math.PI * 0.5 + (dir > 0 ? 0 : 0)) ; K.beam(M.paint, [0, 0.25, zz(t)], [0, top, zz(t)], 0.017, iron, true, 5); K.put(M.paint, cone(0.04, 0.16, 4), 0, top + 0.08, zz(t), 0, Math.PI / 4, 0, 1, 1, 1, gold); }
  for (let t = 0.3; t < w - 0.1; t += 0.42) K.put(M.paint, tor(0.17, 0.016, 4, 16), 0, 0.8, zz(t + 0.06), 0, Math.PI / 2, 0, 1, 1, 1, iron);
}
// hedge segment (rounded box of leaves) along z
const hedge = (K, x0, x1, z0, z1, h, c = 0x5a8a44) => K.box(M.leaf, x0, x1, 0.12, h, z0, z1, c, 0.3, 1.2, 2);
// topiary: lollipop standard or cone
function topiary(K, x, z, kind, s = 1) {
  if (kind === 'ball') { K.put(M.bark, cyl(0.06, 0.08, 1.4 * s, 6), x, 0.7 * s, z, 0, 0, 0, 1, 1, 1, 0xffffff); K.put(M.leaf, lump(1), x, 1.75 * s, z, 0, 0, 0, 0.62 * s, 0.6 * s, 0.62 * s, 0x5f9446); K.put(M.paint, cyl(0.32, 0.26, 0.4, 10), x, 0.35, z, 0, 0, 0, 1, 1, 1, 0xd8cdb8); }
  else { K.put(M.leaf, cone(0.75 * s, 2.6 * s, 12), x, 1.4 * s, z, 0, 0, 0, 1, 1, 1, 0x4c7d40); K.put(M.leaf, lump(2), x, 0.45 * s, z, 0, 0, 0, 0.7 * s, 0.4 * s, 0.7 * s, 0x4c7d40); }
}
// pigeon (tiny static prop): body faces +z
function pigeonPrefab() {
  const K = new Kit();
  K.put(M.paint, sph(0.1, 10, 7), 0, 0.12, 0, 0, 0, 0, 0.75, 0.75, 1.15, 0x8f93a6);
  K.put(M.paint, sph(0.1, 8, 6), 0, 0.14, -0.05, 0, 0, 0, 0.62, 0.55, 0.95, 0x7b7f94);
  K.put(M.paint, sph(0.05, 8, 6), 0, 0.23, 0.1, 0, 0, 0, 1, 1, 1, 0x6e6f86);
  K.put(M.paint, tor(0.045, 0.018, 4, 10), 0, 0.2, 0.08, 1.2, 0, 0, 1, 1, 1, 0x5f8a7a);
  K.put(M.paint, cone(0.014, 0.045, 4), 0, 0.225, 0.165, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2430);
  K.box(M.paint, -0.04, 0.04, 0.1, 0.12, -0.22, -0.08, 0x4a4c60, 0.01);
  for (const sd of [-1, 1]) { K.beam(M.paint, [sd * 0.03, 0, 0.01], [sd * 0.03, 0.07, 0.01], 0.008, 0xd86a6a, true, 3); K.put(M.paint, sph(0.012, 5, 4), sd * 0.04, 0.23, 0.13, 0, 0, 0, 1, 1, 1, 0x2a1a20); }
  for (const sd of [-1, 1]) K.put(M.paint, sph(0.06, 6, 4), sd * 0.06, 0.13, -0.02, 0, 0, 0, 0.3, 0.5, 1.3, 0x6a6c80);
  return K.prefab();
}

// ---------------------------------------------------------------- street furniture
function hydrant(K, x, z) { const c = 0xc9cbd2, cap = 0xb8302c;
  K.put(M.paint, cyl(0.17, 0.19, 0.08, 10), x, 0.19, z, 0, 0, 0, 1, 1, 1, c); K.put(M.paint, cyl(0.12, 0.13, 0.55, 10), x, 0.5, z, 0, 0, 0, 1, 1, 1, c);
  K.put(M.paint, tor(0.13, 0.025, 5, 12), x, 0.78, z, Math.PI / 2, 0, 0, 1, 1, 1, c); K.put(M.paint, sph(0.135, 10, 6), x, 0.8, z, 0, 0, 0, 1, 0.75, 1, cap); K.put(M.paint, cyl(0.03, 0.04, 0.08, 5), x, 0.93, z, 0, 0, 0, 1, 1, 1, cap);
  for (const a of [0, Math.PI]) K.put(M.paint, cyl(0.05, 0.05, 0.12, 8), x + Math.cos(a) * 0.14, 0.58, z + Math.sin(a) * 0.14, 0, 0, Math.PI / 2, 1, 1, 1, cap);
  K.put(M.paint, cyl(0.07, 0.07, 0.1, 8), x, 0.55, z - 0.15, Math.PI / 2, 0, 0, 1, 1, 1, cap); }
function parkingMeter(K, x, z, ry) { K.at(x, 0, z, ry, () => { K.put(M.paint, cyl(0.03, 0.035, 1.05, 6), 0, 0.67, 0, 0, 0, 0, 1, 1, 1, 0x4a4e56); K.box(M.paint, -0.09, 0.09, 1.18, 1.42, -0.08, 0.08, 0x6a7078, 0.04); K.put(M.chrome, sph(0.085, 10, 6, ), 0, 1.44, 0, 0, 0, 0, 1, 0.8, 1, 0xd8dce4); K.box(M.glow, -0.05, 0.05, 1.3, 1.38, 0.08, 0.085, 0xf2e8c8, 0.005); }); }
function newsBox(K, x, z, ry, mat) { K.at(x, 0.15, z, ry, () => { for (const sd of [-1, 1]) K.box(M.paint, sd * 0.2 - 0.02, sd * 0.2 + 0.02, 0, 0.35, -0.18, 0.18, 0x3a3e46, 0.01); K.box(M.paint, -0.25, 0.25, 0.35, 1.05, -0.2, 0.2, 0x2f6a8a, 0.03); K.box(M.glass, -0.19, 0.19, 0.62, 0.95, 0.2, 0.215, 0xffffff, 0.005); K.box(M.paint, -0.17, 0.17, 0.64, 0.92, 0.215, 0.22, 0xf0e8d4, 0.002); K.put(mat, plane(0.42, 0.13), 0, 0.46, 0.205); K.box(M.chrome, -0.06, 0.06, 1.0, 1.04, 0.2, 0.24, 0xffffff, 0.01); }); }
function trashCan(K, x, z) { const c = 0x3c5a46; K.put(M.paint, cyl(0.25, 0.22, 0.85, 12, true), x, 0.15 + 0.425, z, 0, 0, 0, 1, 1, 1, c); K.put(M.paint, cyl(0.22, 0.22, 0.03, 12), x, 0.2, z, 0, 0, 0, 1, 1, 1, c);
  for (const y of [0.18, 0.55, 0.98]) K.put(M.paint, tor(0.25, 0.018, 4, 16), x, y, z, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a3c30); K.put(M.paint, sph(0.12, 8, 6), x + 0.05, 0.95, z, 0, 0, 0, 1, 0.5, 1, 0xe8e0cc); K.put(M.paint, sph(0.08, 6, 4), x - 0.08, 0.96, z + 0.05, 0, 0, 0, 1, 0.6, 1, 0xc8a46a); }
function mailbox(K, x, z, ry, mat) { K.at(x, 0.15, z, ry, () => { for (const a of [-1, 1]) for (const b of [-1, 1]) K.box(M.paint, a * 0.2 - 0.03, a * 0.2 + 0.03, 0, 0.25, b * 0.18 - 0.03, b * 0.18 + 0.03, 0x24304a, 0.01);
  K.box(M.paint, -0.25, 0.25, 0.25, 1.0, -0.22, 0.22, 0x2a4c8c, 0.03); K.put(M.paint, cyl(0.25, 0.25, 0.44, 14, false), 0, 1.0, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0xb8302c); K.box(M.paint, -0.255, 0.255, 0.98, 1.02, -0.225, 0.225, 0xf2ede4, 0.005);
  K.put(mat, plane(0.34, 0.2), 0, 0.68, 0.225); K.box(M.paint, -0.14, 0.14, 1.02, 1.1, 0.2, 0.24, 0x2a4c8c, 0.01); }); }
function streetSign(K, x, z, mat) { K.put(M.paint, cyl(0.035, 0.04, 3.1, 6), x, 1.7, z, 0, 0, 0, 1, 1, 1, 0x3a3e46); K.box(M.paint, x - 0.02, x + 0.02, 2.95, 3.17, z - 0.55, z + 0.55, 0x2f4f3a, 0.01); K.put(mat, plane(1.04, 0.18), x + 0.025, 3.06, z, 0, Math.PI / 2, 0); K.put(mat, plane(1.04, 0.18), x - 0.025, 3.06, z, 0, -Math.PI / 2, 0); }
function postSign(K, x, z, ry, mat, w = 0.45, h = 0.6) { K.put(M.paint, cyl(0.03, 0.03, 2.4, 6), x, 1.35, z, 0, 0, 0, 1, 1, 1, 0x5a5e66); K.at(x, 0, z, ry, () => { K.box(M.paint, -w / 2 - 0.02, w / 2 + 0.02, 2.2 - h / 2 - 0.02, 2.2 + h / 2 + 0.02, 0.03, 0.05, 0xf4f0e6, 0.01); K.put(mat, plane(w, h), 0, 2.2, 0.055); }); }

// ---------------------------------------------------------------- buildings
// sash window on a wall (local frame: wall at z = 0, facing +z)
function sash(K, x, y, w, h, o, k) {
  const tc = o.trim ?? 0xf0ebe0;
  K.box(M.glass, x - w / 2, x + w / 2, y, y + h, -0.03, 0.012, 0xffffff, 0.004, [w, h]);
  K.box(M.paint, x - w / 2 - 0.07, x - w / 2 + 0.01, y, y + h, -0.02, 0.06, tc, 0.01); K.box(M.paint, x + w / 2 - 0.01, x + w / 2 + 0.07, y, y + h, -0.02, 0.06, tc, 0.01);
  K.box(M.paint, x - w / 2, x + w / 2, y + h - 0.06, y + h, -0.02, 0.05, tc, 0.01); K.box(M.paint, x - w / 2, x + w / 2, y + h / 2 - 0.03, y + h / 2 + 0.03, -0.02, 0.05, tc, 0.01);
  K.box(M.paint, x - w / 2 - 0.14, x + w / 2 + 0.14, y + h, y + h + 0.24, -0.02, 0.09, o.lintel ?? 0xe4dccb, 0.015);
  K.box(M.paint, x - w / 2 - 0.1, x + w / 2 + 0.1, y - 0.09, y, -0.02, 0.13, o.lintel ?? 0xe4dccb, 0.015);
  const r = rnd(k * 3.7 + x);
  if (r < 0.55) K.box(M.paint, x - w / 2 + 0.02, x + w / 2 - 0.02, y + h * (0.45 + 0.4 * rnd(k + x)), y + h - 0.06, 0.012, 0.02, [0xefe2bc, 0xe8d0a0, 0xf2ece0][Math.floor(rnd(k * 2 + x) * 3)], 0.004);
  else if (r < 0.75) for (const sd of [-1, 1]) K.box(M.curtain, x + sd * w * 0.32 - w * 0.17, x + sd * w * 0.32 + w * 0.17, y + 0.1, y + h - 0.06, 0.012, 0.03, [0xc86a5a, 0xe8d6a8, 0x8aa0c0][Math.floor(rnd(k + x * 2) * 3)], 0.01, [0.4, 1]);
  if (o.ac && rnd(k * 5.1 + x) < 0.3) { K.box(M.paint, x - 0.3, x + 0.3, y + 0.02, y + 0.42, -0.02, 0.45, 0xcfcabc, 0.04); K.box(M.paint, x - 0.26, x + 0.26, y + 0.06, y + 0.38, 0.45, 0.47, 0x6a6a70, 0.01); }
}
// 1960s DC rowhouse / shop. Local: facade at z = 0 facing +z, centred on x = 0, depth D behind
function rowhouse(K, o) {
  const W = o.w, F = o.floors ?? 3, H1 = o.shop === false ? 3.4 : 4.2, FH = 3.2, H = H1 + FH * (F - 1), D = 12, wm = o.mat ?? M.brickR, wc = o.wall ?? 0xffffff, tc = o.trim ?? 0xefe8da, sc = o.shopCol ?? 0x2a3a4a;
  K.box(wm, -W / 2, W / 2, 0, H, -D, 0, wc, 0.02, 1.8);
  // cornice: frieze, brackets, cap
  K.box(M.paint, -W / 2, W / 2, H - 0.75, H - 0.05, -0.05, 0.16, tc, 0.02);
  for (let x = -W / 2 + 0.3; x <= W / 2 - 0.25; x += (W - 0.6) / Math.max(1, Math.round((W - 0.6) / 0.7))) K.box(M.paint, x - 0.07, x + 0.07, H - 0.6, H - 0.05, 0.12, 0.5, tc, 0.02);
  K.box(M.paint, -W / 2 - 0.08, W / 2 + 0.08, H - 0.05, H + 0.25, -0.2, 0.6, tc, 0.04);
  K.box(wm, -W / 2, W / 2, H + 0.25, H + 0.6, -0.3, -0.05, wc, 0.02, 1.8);
  K.box(M.paint, -W / 2, W / 2, H + 0.6, H + 0.7, -0.35, 0.0, 0x8a8478, 0.02);
  // upper floors (optional projecting bay)
  const n = o.wins ?? Math.max(2, Math.round(W / 2.3)), bay = o.bay && F > 1;
  for (let f = 1; f < F; f++) {
    const y = H1 + (f - 1) * FH + 0.8;
    if (bay) { const bw = W * 0.55; sash(K, W / 2 - (W - bw - 0.4) / 2, y, 0.85, 1.75, { ...o, trim: tc }, f * 9); }
    else for (let i = 0; i < n; i++) sash(K, -W / 2 + W * (i + 0.5) / n, y, Math.min(1.0, W / n - 0.8), 1.75, { ...o, trim: tc }, f * 11 + i);
    if (f < F - 1 && o.belt) K.box(M.paint, -W / 2, W / 2, y + 2.1, y + 2.22, -0.02, 0.08, tc, 0.01);
  }
  if (bay) { // projecting bay box over the upper floors with its own windows (wall shifted out by 0.9)
    const bw = W * 0.55, bx = -W / 2 + bw / 2 + 0.4, y0 = H1 + 0.2;
    K.box(wm, bx - bw / 2, bx + bw / 2, y0, H - 0.75, 0, 0.9, wc, 0.02, 1.8);
    K.box(M.paint, bx - bw / 2 - 0.05, bx + bw / 2 + 0.05, y0 - 0.2, y0, -0.02, 1.0, tc, 0.02);
    K.at(bx, 0, 0.9, 0, () => { for (let f = 1; f < F; f++) for (let i = 0; i < 2; i++) sash(K, (i - 0.5) * bw / 2, H1 + (f - 1) * FH + 0.8, 0.8, 1.7, { ...o, trim: tc }, f * 13 + i); });
  }
  if (o.shop === false) { // residential: stoop with iron rail and a panelled door
    const dx = o.doorX ?? W / 2 - 1.2;
    K.box(M.paint, -W / 2, W / 2, 0, 0.9, -0.02, 0.04, 0xcfc6b4, 0.01);
    for (let i = 0; i < 4; i++) K.box(M.paint, dx - 0.75, dx + 0.75, 0, 0.22 * (4 - i), 0.04, 0.4 * (i + 1) + 0.04, 0xd8d0c0, 0.02);
    K.box(M.oak, dx - 0.55, dx + 0.55, 0.88, 3.1, -0.02, 0.05, o.door ?? 0x5a2e22, 0.02); K.box(M.glass, dx - 0.55, dx + 0.55, 3.15, 3.45, -0.02, 0.03, 0xffffff, 0.005);
    K.box(M.paint, dx - 0.72, dx + 0.72, 3.45, 3.62, -0.02, 0.14, tc, 0.02); for (const sd of [-1, 1]) K.box(M.paint, dx + sd * 0.63 - 0.07, dx + sd * 0.63 + 0.07, 0.88, 3.45, -0.02, 0.1, tc, 0.01);
    for (const sd of [-1, 1]) { K.beam(M.paint, [dx + sd * 0.78, 0.9, 0.1], [dx + sd * 0.78, 0.92, 1.7], 0.025, 0x1f2224); K.beam(M.paint, [dx + sd * 0.78, 1.82, 0.1], [dx + sd * 0.78, 0.98, 1.7], 0.025, 0x1f2224); for (let t = 0.2; t < 1.6; t += 0.3) K.beam(M.paint, [dx + sd * 0.78, 0.9, t], [dx + sd * 0.78, 1.82 - 0.52 * t, t], 0.014, 0x1f2224); }
    const ww = 1.0; sash(K, dx > 0 ? -W / 2 + 1.3 : W / 2 - 1.3, 1.25, ww, 1.75, { ...o, trim: tc }, 77);
    if (W > 6) sash(K, dx > 0 ? -W / 2 + 2.9 : W / 2 - 2.9, 1.25, ww, 1.75, { ...o, trim: tc }, 78);
    return;
  }
  // shopfront: pilasters, fascia sign, plate glass, recessed door, kickplate
  for (const sd of [-1, 1]) K.box(M.paint, sd * (W / 2 - 0.22) - 0.22, sd * (W / 2 - 0.22) + 0.22, 0, H1 - 0.05, -0.02, 0.18, sc, 0.02);
  K.box(M.paint, -W / 2 + 0.05, W / 2 - 0.05, H1 - 1.0, H1 - 0.05, -0.02, 0.22, sc, 0.03);
  if (o.sign) K.put(o.sign, plane(W - 0.9, 0.78), 0, H1 - 0.53, 0.226);
  const dx = o.doorX ?? 0, dw = 1.1, g0 = -W / 2 + 0.44, g1 = W / 2 - 0.44, gy0 = 0.5, gy1 = H1 - 1.05;
  for (const [a, b] of [[g0, dx - dw / 2 - 0.08], [dx + dw / 2 + 0.08, g1]]) { if (b - a < 0.3) continue;
    K.box(M.paint, a, b, 0, gy0, -0.02, 0.12, sc, 0.01);
    K.box(M.glass, a, b, gy0, gy1, -0.03, 0.03, 0xffffff, 0.004, [b - a, gy1 - gy0]);
    if (o.goods) for (let k = 0; k < 3; k++) { const gx = a + (b - a) * (k + 0.5) / 3; K.box(M.paint, gx - 0.18, gx + 0.18, gy0, gy0 + 0.25 + 0.2 * rnd(gx), 0.03, 0.2, [0xe8d6a8, 0xc84a3a, 0x5a8aba, 0xf2ece0][Math.floor(rnd(gx * 3) * 4)], 0.02); }
    const nm = Math.max(1, Math.round((b - a) / 1.4)); for (let k = 1; k < nm; k++) { const mx = a + (b - a) * k / nm; K.box(M.chrome, mx - 0.03, mx + 0.03, gy0, gy1, -0.02, 0.06, 0xffffff, 0.008); }
    K.box(M.chrome, a, b, gy1 - 0.02, gy1 + 0.06, -0.02, 0.07, 0xffffff, 0.008); K.box(M.chrome, a, b, gy0 - 0.03, gy0 + 0.03, -0.02, 0.07, 0xffffff, 0.008);
  }
  // door with glass and push bar
  K.box(M.paint, dx - dw / 2, dx + dw / 2, 0, gy1 + 0.06, -0.06, -0.02, 0x2a2228, 0.01);
  K.box(M.glass, dx - dw / 2 + 0.12, dx + dw / 2 - 0.12, 0.35, gy1 - 0.15, -0.02, 0.0, 0xffffff, 0.004, [dw, gy1]);
  K.box(M.chrome, dx - dw / 2 + 0.1, dx + dw / 2 - 0.1, 1.05, 1.1, 0.0, 0.05, 0xffffff, 0.01);
  if (o.awning) { const am = o.awning, aw = W - 0.4; K.put(am, plane(aw, 1.75), 0, H1 - 1.45, 0.78, -1.05, 0, 0); K.put(am, plane(aw, 0.3), 0, H1 - 2.06, 1.52, 0, 0, 0); K.box(M.paint, -aw / 2, aw / 2, H1 - 1.12, H1 - 1.04, 0, 0.1, 0x2a2224, 0.02); for (const sd of [-1, 1]) K.beam(M.paint, [sd * (aw / 2 - 0.05), H1 - 1.1, 0.05], [sd * (aw / 2 - 0.05), H1 - 1.92, 1.52], 0.02, 0x2a2224, true, 4); }
  if (o.blade) { const bx = o.bladeX ?? (W / 2 - 0.6), by = H1 + 0.5, bh = o.bladeH ?? 3.4;
    K.box(M.paint, bx - 0.07, bx + 0.07, by - 0.06, by + bh + 0.06, 0.15, 1.35, o.bladeRim ?? 0xd8dce4, 0.03);
    for (const sd of [-1, 1]) K.put(o.blade, plane(1.1, bh), bx + sd * 0.075, by + bh / 2, 0.75, 0, sd * Math.PI / 2, 0);
    for (const y of [by + 0.3, by + bh - 0.3]) K.beam(M.paint, [bx, y, 0], [bx, y, 0.2], 0.04, 0x2a2224);
  }
  if (o.barberPole) { const px = o.barberPole; K.put(M.chrome, sph(0.13, 10, 6), px, 3.0, 0.4, 0, 0, 0, 1, 1, 1, 0xffffff); K.put(M.pole, cyl(0.1, 0.1, 0.9, 14), px, 2.45, 0.4, 0, 0, 0, 1, 1, 1, 0xffffff); K.put(M.chrome, cyl(0.12, 0.12, 0.1, 10), px, 1.95, 0.4, 0, 0, 0, 1, 1, 1, 0xffffff); K.box(M.chrome, px - 0.03, px + 0.03, 2.4, 2.48, 0.05, 0.3, 0xffffff, 0.01); }
  if (o.canopy) { // hotel entrance canopy on poles
    K.box(M.paint, dx - 1.0, dx + 1.0, H1 - 1.15, H1 - 0.95, 0, 3.0, 0x6a1e24, 0.05); K.box(M.chrome, dx - 1.02, dx + 1.02, H1 - 1.2, H1 - 1.1, 2.9, 3.05, 0xffffff, 0.02);
    for (const sd of [-1, 1]) K.put(M.chrome, cyl(0.035, 0.035, H1 - 1.15, 6), dx + sd * 0.95, (H1 - 1.15) / 2, 2.95, 0, 0, 0, 1, 1, 1, 0xffffff);
    if (o.canopySign) for (const sd of [-1, 1]) K.put(o.canopySign, plane(2.9, 0.18), dx + sd * 1.011, H1 - 1.05, 1.5, 0, sd * Math.PI / 2, 0);
  }
  if (o.antenna) { const ax = W * 0.2; K.beam(M.paint, [ax, H + 0.6, -3], [ax, H + 3.2, -3], 0.025, 0x4a4e56, true, 4); for (let i = 0; i < 4; i++) K.beam(M.paint, [ax - 0.6 + i * 0.05, H + 2.4 + i * 0.25, -3], [ax + 0.6 - i * 0.05, H + 2.4 + i * 0.25, -3], 0.012, 0x4a4e56, true, 3); }
  if (o.chimney) K.box(wm, W * 0.25 - 0.35, W * 0.25 + 0.35, H, H + 1.5, -6, -5.3, wc, 0.02, 1.8);
}

// embassy-style stone mansion. Local: facade at z = 0 facing +z, centred on x = 0, depth 18 behind.
const CURT = 0x7a1e26;
function embWindow(K, x, y, w, h, kind, k) {
  const st = 0xece3d0;
  K.box(M.glass, x - w / 2, x + w / 2, y, y + h, -0.02, 0.015, 0xffffff, 0.004, [w, h]);
  // heavy drapes, nearly closed, with folds
  const fw = w / 2 - 0.06;
  for (const sd of [-1, 1]) { const x0 = x + sd * (w / 2 - fw / 2) ; K.box(M.curtain, x0 - fw / 2, x0 + fw / 2, y + 0.04, y + h - 0.18, 0.012, 0.04, CURT, 0.01, [0.35, 1]);
    for (let i = 0; i < 3; i++) K.put(M.curtain, cyl(0.05, 0.06, h - 0.24, 6), x0 - fw / 2 + 0.08 + i * (fw - 0.16) / 2, y + (h - 0.14) / 2, 0.045, 0, 0, 0, 1, 1, 1, CURT); }
  K.box(M.curtain, x - w / 2, x + w / 2, y + h - 0.32, y + h - 0.04, 0.02, 0.09, 0x5a141c, 0.02, [0.5, 1]);
  K.box(M.paint, x - w / 2, x + w / 2, y + h - 0.36, y + h - 0.32, 0.03, 0.095, 0xc8a24a, 0.005);
  // stone surround
  K.box(M.paint, x - w / 2 - 0.2, x - w / 2, y - 0.05, y + h + 0.05, -0.02, 0.14, st, 0.02); K.box(M.paint, x + w / 2, x + w / 2 + 0.2, y - 0.05, y + h + 0.05, -0.02, 0.14, st, 0.02);
  K.box(M.paint, x - w / 2 - 0.2, x + w / 2 + 0.2, y + h, y + h + 0.2, -0.02, 0.14, st, 0.02);
  K.box(M.paint, x - w / 2 - 0.3, x + w / 2 + 0.3, y - 0.16, y - 0.02, -0.02, 0.24, st, 0.02);
  K.box(M.paint, x - 0.16, x + 0.16, y + h - 0.02, y + h + 0.3, 0.02, 0.18, st, 0.02); // keystone
  if (kind === 'ped') { K.box(M.paint, x - w / 2 - 0.4, x + w / 2 + 0.4, y + h + 0.32, y + h + 0.45, -0.02, 0.32, st, 0.02); K.put(M.paint, prism(w + 0.9, 0.6, 0.3), x, y + h + 0.45, 0.0, 0, 0, 0, 1, 1, 1, st);
    for (const sd of [-1, 1]) K.box(M.paint, x + sd * (w / 2 + 0.28) - 0.08, x + sd * (w / 2 + 0.28) + 0.08, y + h - 0.2, y + h + 0.32, 0.0, 0.28, st, 0.02); }
  else if (kind === 'cap') { K.box(M.paint, x - w / 2 - 0.35, x + w / 2 + 0.35, y + h + 0.24, y + h + 0.4, -0.02, 0.3, st, 0.02); }
  else if (kind === 'grille') for (let i = 1; i < 4; i++) { const gx = x - w / 2 + w * i / 4; K.beam(M.paint, [gx, y - 0.02, 0.2], [gx, y + h - 0.02, 0.2], 0.018, 0x1b1f26, true, 4); K.put(M.paint, cone(0.035, 0.1, 4), gx, y + h + 0.03, 0.2, 0, 0, 0, 1, 1, 1, 0x1b1f26); }
  if (kind === 'grille') for (const yy of [y + 0.1, y + h * 0.5, y + h - 0.12]) K.box(M.paint, x - w / 2, x + w / 2, yy - 0.02, yy + 0.02, 0.18, 0.22, 0x1b1f26, 0.005);
}
function embassy(K) {
  const W = 30, D = 18, st = 0xffffff, Y1 = 0.9, Y2 = 5.0, Y3 = 12.3, YC = 13.4, pav = 5.6;
  K.box(M.rust, -W / 2 - 0.1, W / 2 + 0.1, 0, Y1, -D - 0.1, 0.25, st, 0.02, 2.4); // plinth
  K.box(M.rust, -W / 2, W / 2, Y1, Y2, -D, 0, st, 0.02, 2.4);
  K.box(M.ashlar, -W / 2, W / 2, Y2, Y3, -D, 0, st, 0.02, 2.4);
  K.box(M.paint, -W / 2 - 0.12, W / 2 + 0.12, Y2 - 0.1, Y2 + 0.2, -D - 0.1, 0.22, 0xe6ddca, 0.03); // string course
  // central pavilion projects 1.2
  K.box(M.rust, -pav, pav, Y1, Y2, 0, 1.2, st, 0.02, 2.4); K.box(M.ashlar, -pav, pav, Y2, Y3, 0, 1.2, st, 0.02, 2.4);
  K.box(M.paint, -pav - 0.1, pav + 0.1, Y2 - 0.1, Y2 + 0.2, 0, 1.4, 0xe6ddca, 0.03);
  // entablature + cornice + balustrade
  K.box(M.paint, -W / 2 - 0.1, W / 2 + 0.1, Y3, YC - 0.35, -D - 0.1, 0.12, 0xe8dfcc, 0.02);
  K.box(M.paint, -W / 2 - 0.45, W / 2 + 0.45, YC - 0.35, YC, -D - 0.45, 0.5, 0xf0e8d6, 0.05);
  for (let x = -W / 2 + 0.5; x < W / 2; x += 1.15) K.box(M.paint, x - 0.12, x + 0.12, Y3 + 0.1, YC - 0.35, 0.1, 0.38, 0xe2d8c4, 0.02); // dentils/modillions
  const bal = (x0, x1, z) => { K.box(M.paint, x0, x1, YC, YC + 0.18, z - 0.3, z + 0.3, 0xe8dfcc, 0.02); K.box(M.paint, x0, x1, YC + 0.95, YC + 1.1, z - 0.32, z + 0.32, 0xf0e8d6, 0.03);
    for (let x = x0 + 0.25; x < x1 - 0.1; x += 0.46) K.put(M.paint, cyl(0.08, 0.12, 0.77, 8), x, YC + 0.565, z, 0, 0, 0, 1, 1, 1, 0xe8dfcc);
    for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / Math.max(1, Math.round((x1 - x0) / 5))) K.box(M.paint, x - 0.22, x + 0.22, YC, YC + 1.15, z - 0.32, z + 0.32, 0xf0e8d6, 0.02); };
  bal(-W / 2, -pav - 0.2, 0.1); bal(pav + 0.2, W / 2, 0.1);
  // portico: giant-order columns, entablature, pediment, steps
  const pz = 4.2, cols = [-4.4, -1.5, 1.5, 4.4];
  for (const x of cols) { K.box(M.paint, x - 0.6, x + 0.6, Y1, Y1 + 0.35, pz - 0.6, pz + 0.6, 0xe6ddca, 0.03); K.put(M.flute, cyl(0.44, 0.48, Y3 - Y1 - 0.75, 20), x, (Y3 + Y1 - 0.4) / 2 + 0.18, pz, 0, 0, 0, 1, 1, 1, 0xffffff);
    K.put(M.paint, cyl(0.58, 0.46, 0.3, 16), x, Y3 - 0.38, pz, 0, 0, 0, 1, 1, 1, 0xf0e8d6); K.box(M.paint, x - 0.62, x + 0.62, Y3 - 0.24, Y3, pz - 0.62, pz + 0.62, 0xf0e8d6, 0.03); }
  for (const x of [-pav + 0.3, pav - 0.3]) K.box(M.ashlar, x - 0.35, x + 0.35, Y1, Y3, 1.2, 1.5, st, 0.02, 2.4); // pilasters
  K.box(M.paint, -pav, pav, Y3, YC - 0.35, 0, pz + 0.65, 0xe8dfcc, 0.02);
  K.box(M.paint, -pav - 0.3, pav + 0.3, YC - 0.35, YC, 0, pz + 0.9, 0xf0e8d6, 0.04);
  K.put(M.ashlar, prism(2 * pav + 0.4, 2.3, pz + 0.7), 0, YC, 0.0, 0, 0, 0, 1, 1, 1, 0xf4ecda);
  K.box(M.paint, -pav + 1.2, pav - 1.2, YC + 0.05, YC + 0.12, pz + 0.68, pz + 0.72, 0xe8dfcc, 0.01);
  K.put(M.paint, cyl(0.42, 0.42, 0.08, 20), 0, YC + 0.95, pz + 0.72, Math.PI / 2, 0, 0, 1, 1, 1, 0xe2d8c4); // blank roundel (no emblem)
  for (let i = 0; i < 5; i++) K.box(M.paint, -pav - 0.6, pav + 0.6, 0, Y1 - i * 0.18, 0.25, pz + 0.7 + (5 - i) * 0.38, 0xe6ddca, 0.02); // steps
  K.box(M.paint, -pav - 0.6, pav + 0.6, 0, Y1, 0.25, pz + 0.7, 0xe6ddca, 0.02);
  // windows: 3 bays per wing + pavilion
  const bays = [-13.2, -10.4, -7.6, 7.6, 10.4, 13.2];
  for (const x of bays) { embWindow(K, x, Y1 + 0.9, 1.4, 2.5, 'grille', x); embWindow(K, x, Y2 + 0.9, 1.4, 3.0, 'ped', x + 1); embWindow(K, x, Y3 - 2.6, 1.3, 1.9, 'cap', x + 2); }
  K.at(0, 0, 1.2, 0, () => { for (const x of [-3.0, 3.0]) { embWindow(K, x, Y1 + 0.9, 1.3, 2.5, 'grille', x + 9); embWindow(K, x, Y2 + 0.9, 1.3, 3.0, 'cap', x + 7); embWindow(K, x, Y3 - 2.6, 1.2, 1.9, 'cap', x + 5); }
    embWindow(K, 0, Y2 + 0.9, 1.5, 3.0, 'ped', 33); embWindow(K, 0, Y3 - 2.6, 1.3, 1.9, 'cap', 34);
    // grand double door + fanlight + brass plaque
    K.box(M.paint, -1.3, 1.3, Y1, Y1 + 4.0, -0.02, 0.18, 0xece3d0, 0.02); K.box(M.oak, -1.0, 1.0, Y1, Y1 + 3.1, 0.0, 0.2, 0x5a3220, 0.02);
    for (const sd of [-1, 1]) for (const [y0, y1] of [[0.3, 1.3], [1.6, 2.8]]) K.box(M.oak, sd * 0.5 - 0.35, sd * 0.5 + 0.35, Y1 + y0, Y1 + y1, 0.2, 0.25, 0x6a3c26, 0.02);
    K.box(M.paint, -0.02, 0.02, Y1, Y1 + 3.1, 0.2, 0.24, 0x2a1a14, 0.005); for (const sd of [-1, 1]) K.put(M.paint, sph(0.05, 8, 6), sd * 0.12, Y1 + 1.45, 0.28, 0, 0, 0, 1, 1, 1, 0xd8b050);
    K.box(M.glass, -1.0, 1.0, Y1 + 3.15, Y1 + 3.85, 0.0, 0.2, 0xffffff, 0.005); for (let i = -2; i <= 2; i++) K.beam(M.paint, [0, Y1 + 3.15, 0.21], [i * 0.45, Y1 + 3.85, 0.21], 0.02, 0xece3d0);
    K.box(M.paint, 1.45, 1.95, Y1 + 1.4, Y1 + 1.8, 0.0, 0.06, 0xc8a24a, 0.01);
  });
  // side facades (visible in oblique shots): windows on both ends
  for (const sd of [-1, 1]) K.at(sd * W / 2, 0, -D / 2, sd * Math.PI / 2, () => { for (const x of [-5.5, -1.8, 1.8, 5.5]) { embWindow(K, x, Y1 + 0.9, 1.3, 2.4, 'grille', x * sd + 40); embWindow(K, x, Y2 + 0.9, 1.3, 3.0, 'cap', x * sd + 41); embWindow(K, x, Y3 - 2.6, 1.2, 1.9, 'cap', x * sd + 42); } });
  // roof: chimneys and a thicket of antennas
  for (const [x, z] of [[-11, -6], [11, -6], [-5, -14], [6, -13]]) { K.box(M.ashlar, x - 0.6, x + 0.6, YC, YC + 2.4, z - 0.45, z + 0.45, st, 0.02, 2.4); K.box(M.paint, x - 0.7, x + 0.7, YC + 2.4, YC + 2.6, z - 0.55, z + 0.55, 0xe6ddca, 0.02); }
  const ant = (x, z, h, arms) => { K.beam(M.paint, [x, YC, z], [x, YC + h, z], 0.035, 0x3a3e46, true, 5); for (let i = 0; i < arms; i++) { const y = YC + h - 0.3 - i * 0.45, L = 0.9 - i * 0.12; K.beam(M.paint, [x - L, y, z], [x + L, y, z], 0.015, 0x3a3e46, true, 3); }
    for (const [dx, dz] of [[1.5, 1.2], [-1.4, 1.1], [0.2, -1.6]]) K.beam(M.paint, [x, YC + h * 0.7, z], [x + dx, YC, z + dz], 0.006, 0x2a2e36, true, 3); };
  ant(-8, -9, 5.5, 4); ant(-2, -7, 7.5, 5); ant(4, -10, 4.5, 3); ant(9, -12, 6, 4); ant(0.5, -14, 3.5, 0); ant(-12.5, -14, 4.2, 2);
  K.box(M.paint, -14.5, 14.5, YC - 0.05, YC + 0.02, -D + 0.5, -0.4, 0x8a8478, 0.01); // roof deck
}
// red flag (separate mesh so it can wave). Built in the set's local frame.
function makeFlag(S, x, z, H) {
  const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g);
  const K = new Kit(); K.put(M.paint, cyl(0.06, 0.1, H, 10), 0, H / 2, 0, 0, 0, 0, 1, 1, 1, 0xe8e4dc); K.put(M.paint, cyl(0.35, 0.45, 0.4, 10), 0, 0.35, 0, 0, 0, 0, 1, 1, 1, 0xe6ddca);
  K.put(M.paint, sph(0.13, 10, 7), 0, H + 0.1, 0, 0, 0, 0, 1, 1, 1, 0xd8b050); K.build(g);
  const FW = 2.7, FH = 1.8, geo = new THREE.PlaneGeometry(FW, FH, 16, 6); geo.translate(FW / 2 + 0.07, H - FH / 2 - 0.15, 0);
  const base = Float32Array.from(geo.attributes.position.array);
  const mat = toon({ map: mkTex(256, 192, (gg, w, h) => PT.fabric(gg, w, h, { base: '#c8202a', folds: 3, seed: 21 })), side: THREE.DoubleSide });
  const flag = new THREE.Mesh(geo, mat); flag.castShadow = flag.receiveShadow = true; g.add(flag);
  // wave(t): t in seconds. The flag hangs from the pole and ripples along its length.
  g.wave = (t) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const bx = base[i * 3], by = base[i * 3 + 1], u = (bx - 0.07) / FW; p.setZ(i, Math.sin(bx * 2.2 - t * 5.5) * 0.22 * u + Math.sin(bx * 4.1 - t * 8 + by) * 0.05 * u); p.setY(i, by - 0.25 * u * u + 0.04 * Math.sin(bx * 3 - t * 5) * u); } p.needsUpdate = true; geo.computeVertexNormals(); };
  g.wave(0); g.flag = flag; return g;
}

// ---------------------------------------------------------------- vehicles
// wheel: group with axis along x, spin with wheel.rotation.x = distance / wheel.r
function wheel(parent, x, y, z, r, sd, o = {}) {
  const w = new THREE.Group(); w.position.set(x, y, z); w.r = r; parent.add(w);
  const K = new Kit(), tyre = 0x1d1b22;
  K.put(M.paint, tor(r - 0.1, 0.1, 8, 26), 0, 0, 0, 0, Math.PI / 2, 0, 1, 1, 1, tyre);
  K.put(M.paint, cyl(r - 0.12, r - 0.12, 0.16, 18), 0, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x2a2830);
  if (o.whitewall) K.put(M.paint, ring(r * 0.5, r * 0.78, 26), sd * 0.101, 0, 0, 0, sd * Math.PI / 2, 0, 1, 1, 1, 0xf4f0e8);
  const hc = o.hub ?? 0.5;
  K.put(M.chrome, cyl(r * hc, r * hc, 0.04, 18), sd * 0.1, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0xffffff);
  K.put(M.chrome, sph(r * 0.16, 10, 6), sd * 0.12, 0, 0, 0, 0, 0, 0.6, 1, 1, 0xffffff);
  for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3; K.put(M.paint, rboxGeo(0.02, r * hc * 0.85, 0.03, 0.006), sd * 0.123, Math.cos(a) * r * hc * 0.5, Math.sin(a) * r * hc * 0.5, a, 0, 0, 1, 1, 1, 0x6a6e78); }
  K.build(w); w.traverse((m) => { if (m.isMesh) m.castShadow = true; }); return w;
}
// 1960s four-door sedan (original design). Group faces +z, origin on the ground between the axles.
// o: { color, roof (two-tone), taxi, plate }
export function sedan(o = {}) {
  const c = new THREE.Group(), body = new THREE.Group(); c.add(body); c.body = body;
  const K = new Kit(), col = o.color ?? 0x9fbcd8, W = 1.98, r = 0.36, zf = 1.58, zr = -1.48, R = 0.5;
  const pts = [[-2.58, 0.4], [-2.66, 0.66], [-2.62, 0.96], [-2.4, 1.03], [-1.0, 1.03], [1.0, 1.02], [2.25, 0.98], [2.6, 0.92], [2.68, 0.66], [2.62, 0.42], [2.2, 0.36]];
  for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI; pts.push([zf + R * Math.cos(a), 0.36 + R * Math.sin(a) * 0.92]); }
  pts.push([-0.95, 0.34]); for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI; pts.push([zr + R * Math.cos(a), 0.36 + R * Math.sin(a) * 0.92]); }
  pts.push([-2.3, 0.38]);
  K.put(M.paint, profGeo('sedan', pts, W, 0.08), 0, 0, 0, 0, 0, 0, 1, 1, 1, col);
  // tail fins (modest)
  for (const sd of [-1, 1]) K.put(M.paint, profGeo('fin', [[-2.62, 0.9], [-2.6, 1.1], [-1.4, 1.04], [-1.2, 1.0]], 0.2, 0.05), sd * 0.86, 0, 0, 0, 0, 0, 1, 1, 1, col);
  // greenhouse: glass, then roof cap and pillars
  K.put(M.glass, profGeo('cabin', [[-1.85, 1.02], [-1.3, 1.44], [0.12, 1.46], [0.98, 1.02]], 1.66, 0.05), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xffffff);
  const rc = o.roof ?? col;
  K.put(M.paint, profGeo('roofcap', [[-1.4, 1.41], [-1.32, 1.49], [0.12, 1.51], [0.24, 1.41]], 1.72, 0.05), 0, 0, 0, 0, 0, 0, 1, 1, 1, rc);
  for (const sd of [-1, 1]) {
    K.beam(M.paint, [sd * 0.85, 1.02, 0.96], [sd * 0.85, 1.46, 0.16], 0.07, rc); K.beam(M.paint, [sd * 0.86, 1.02, -0.45], [sd * 0.86, 1.49, -0.45], 0.08, rc);
    K.beam(M.paint, [sd * 0.83, 1.02, -1.72], [sd * 0.83, 1.45, -1.25], 0.2, rc);
    K.beam(M.chrome, [sd * 0.93, 1.03, -1.85], [sd * 0.93, 1.03, 0.98], 0.022, 0xffffff, true, 5);
    // chrome side spear, door seams, handles
    K.box(M.chrome, ...xs(sd, 0.985, 1.012), 0.8, 0.83, -2.45, 2.4, 0xffffff, 0.006);
    for (const z of [0.98, -0.42, -1.5]) K.box(M.paint, ...xs(sd, 0.985, 0.996), 0.38, 1.0, z - 0.008, z + 0.008, 0x3a3440, 0.002);
    for (const z of [0.08, -1.3]) K.box(M.chrome, ...xs(sd, 0.99, 1.02), 0.9, 0.93, z - 0.09, z + 0.09, 0xffffff, 0.008);
    // wheelhouse liners
  }
  for (const zc of [zf, zr]) K.box(M.paint, -0.85, 0.85, 0.3, 0.9, zc - 0.48, zc + 0.48, 0x1d1b22, 0.02);
  K.box(M.paint, -0.88, 0.88, 0.2, 0.36, -2.3, 2.3, 0x24222a, 0.02);
  // front: grille, quad headlamps, bumper, plate; rear: lamps, bumper, plate
  K.box(M.paint, -0.62, 0.62, 0.5, 0.8, 2.66, 2.8, 0x2a2a30, 0.03);
  for (const y of [0.56, 0.65, 0.74]) K.box(M.chrome, -0.6, 0.6, y - 0.015, y + 0.015, 2.77, 2.82, 0xffffff, 0.008);
  K.box(M.chrome, -0.64, 0.64, 0.79, 0.83, 2.66, 2.81, 0xffffff, 0.01);
  for (const sd of [-1, 1]) for (const x of [0.88, 0.7]) { K.put(M.chrome, tor(0.075, 0.02, 5, 14), sd * x, 0.7, 2.79, 0, 0, 0, 1, 1, 1, 0xffffff); K.put(M.lamp, cyl(0.07, 0.07, 0.06, 14), sd * x, 0.7, 2.77, Math.PI / 2, 0, 0, 1, 1, 1, 0xfff6dc); }
  K.box(M.chrome, -1.02, 1.02, 0.36, 0.52, 2.72, 2.92, 0xffffff, 0.07);
  K.box(M.chrome, -1.02, 1.02, 0.38, 0.54, -2.92, -2.7, 0xffffff, 0.07);
  for (const sd of [-1, 1]) { K.box(M.lamp, ...xs(sd, 0.62, 0.9), 0.62, 0.86, -2.8, -2.7, 0xd8302c, 0.04); K.box(M.chrome, ...xs(sd, 0.6, 0.92), 0.6, 0.62, -2.79, -2.7, 0xffffff, 0.005); }
  const plate = o.plateMat ?? M.plate;
  K.put(plate, plane(0.46, 0.2), 0, 0.62, 2.925); K.put(plate, plane(0.46, 0.2), 0, 0.68, -2.925, 0, Math.PI, 0);
  K.put(M.chrome, cone(0.03, 0.12, 6), 0, 1.06, 2.35, -1.2, 0, 0, 1, 1, 1, 0xffffff); // hood ornament
  if (o.taxi) {
    for (const sd of [-1, 1]) { K.put(M.check, plane(4.9, 0.12), sd * 1.002, 0.94, 0, 0, sd * Math.PI / 2, 0); K.put(M.taxiDoor, plane(0.62, 0.36), sd * 1.002, 0.62, 0.28, 0, sd * Math.PI / 2, 0); }
    K.box(M.chrome, -0.34, 0.34, 1.5, 1.55, -0.62, -0.28, 0xffffff, 0.015);
    K.box(M.lamp, -0.31, 0.31, 1.55, 1.76, -0.6, -0.3, 0xfff2cc, 0.05);
    K.put(M.taxiSign, plane(0.5, 0.15), 0, 1.655, -0.296); K.put(M.taxiSign, plane(0.5, 0.15), 0, 1.655, -0.604, 0, Math.PI, 0);
    K.beam(M.paint, [0.75, 1.04, -2.3], [0.78, 1.9, -2.45], 0.008, 0x2a2a30, true, 3); // whip aerial
  }
  K.build(body);
  c.wheels = [[-1, zf], [1, zf], [-1, zr], [1, zr]].map(([sd, z]) => wheel(c, sd * 0.84, r, z, r, sd, { whitewall: o.whitewall ?? true, hub: 0.52 }));
  return c;
}
// boxy 1960s panel van with a double side door on its right (curb) side and a listening post inside. Faces +z.
export function panelVan(o = {}) {
  const c = new THREE.Group(), body = new THREE.Group(); c.add(body); c.body = body;
  const K = new Kit(), col = o.color ?? 0x9aa08e, dk = 0x1d1b22, X = 1.0, Y0 = 0.42, YA = 0.92, YR = 2.32, ZF = 2.3, ZB = -2.3, r = 0.38, zf = 1.5, zr = -1.55;
  const D0 = -0.95, D1 = 0.85, DY0 = 0.64, DY1 = 2.05, FL = 0.64;
  K.box(M.paint, -X, X, YR - 0.24, YR, ZB, ZF, col, 0.14, 2, 2); // roof
  for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) K.box(M.paint, a * X - 0.13, a * X + 0.13, Y0, YR - 0.1, b > 0 ? ZF - 0.26 : ZB, b > 0 ? ZF : ZB + 0.26, col, 0.12, 2, 2); // rounded corners
  for (const sd of [-1, 1]) {
    const [xa, xb] = xs(sd, X - 0.06, X), door = sd < 0, lowZ = [[ZB + 0.12, zr - 0.5], [zr + 0.5, zf - 0.5], [zf + 0.5, ZF - 0.12]];
    for (const [z0, z1] of lowZ) { if (door && z0 < D1 && z1 > D0) { K.box(M.paint, xa, xb, Y0, DY0, z0, z1, col, 0.02); K.box(M.paint, xa, xb, DY0, YA, D1, z1, col, 0.02); } else K.box(M.paint, xa, xb, Y0, YA, z0, z1, col, 0.02); }
    if (door) { K.box(M.paint, xa, xb, YA, YR - 0.1, ZB + 0.12, D0, col, 0.02); K.box(M.paint, xa, xb, DY0, YR - 0.1, D1, ZF - 0.12, col, 0.02); K.box(M.paint, xa, xb, DY1, YR - 0.1, D0, D1, col, 0.02); }
    else K.box(M.paint, xa, xb, YA, YR - 0.1, ZB + 0.12, ZF - 0.12, col, 0.02);
    for (const zc of [zf, zr]) { K.box(M.paint, ...xs(sd, X - 0.03, X + 0.04), YA - 0.02, YA + 0.06, zc - 0.56, zc + 0.56, col, 0.03); }
    K.box(M.glass, ...xs(sd, X - 0.02, X + 0.012), 1.4, 1.95, 1.2, 2.08, 0xffffff, 0.02, [0.9, 0.55]); // cab window
    K.box(M.paint, ...xs(sd, X, X + 0.006), Y0 + 0.05, YR - 0.15, 1.08, 1.1, 0x3a3440, 0.002); // cab door seam
    K.box(M.chrome, ...xs(sd, X, X + 0.03), 1.25, 1.29, 1.3, 1.46, 0xffffff, 0.008);
    K.box(M.paint, ...xs(sd, X - 0.02, X + 0.01), 1.05, 1.1, ZB + 0.15, ZF - 0.15, new THREE.Color(col).multiplyScalar(0.82), 0.01); // swage line
  }
  for (const zc of [zf, zr]) K.box(M.paint, -0.94, 0.94, Y0, YA + 0.02, zc - 0.5, zc + 0.5, dk, 0.02);
  K.box(M.paint, -0.94, 0.94, 0.25, Y0, ZB + 0.2, ZF - 0.2, 0x24222a, 0.02);
  // front: flat face, split windshield, headlights, grille, bumper
  K.box(M.paint, -X + 0.1, X - 0.1, Y0, YR - 0.1, ZF - 0.08, ZF, col, 0.04);
  K.box(M.glass, -0.86, -0.02, 1.38, 1.98, ZF - 0.03, ZF + 0.012, 0xffffff, 0.02, [0.84, 0.6]); K.box(M.glass, 0.02, 0.86, 1.38, 1.98, ZF - 0.03, ZF + 0.012, 0xffffff, 0.02, [0.84, 0.6]);
  for (const sd of [-1, 1]) { K.put(M.chrome, tor(0.1, 0.025, 5, 14), sd * 0.7, 0.95, ZF + 0.02, 0, 0, 0, 1, 1, 1, 0xffffff); K.put(M.lamp, cyl(0.09, 0.09, 0.05, 14), sd * 0.7, 0.95, ZF + 0.01, Math.PI / 2, 0, 0, 1, 1, 1, 0xfff6dc); K.beam(M.paint, [sd * 0.45, 1.42, ZF + 0.03], [sd * 0.15, 1.6, ZF + 0.03], 0.012, dk); }
  K.box(M.paint, -0.42, 0.42, 0.78, 1.12, ZF - 0.02, ZF + 0.03, 0x2a2a30, 0.02); for (let y = 0.82; y < 1.1; y += 0.07) K.box(M.chrome, -0.4, 0.4, y, y + 0.025, ZF + 0.02, ZF + 0.05, 0xffffff, 0.006);
  K.box(M.chrome, -1.04, 1.04, 0.38, 0.56, ZF, ZF + 0.16, 0xffffff, 0.06); K.put(M.plate, plane(0.46, 0.2), 0, 0.68, ZF + 0.016);
  // rear: twin doors (painted-over windows), lamps, bumper
  K.box(M.paint, -X + 0.1, X - 0.1, Y0, YR - 0.1, ZB, ZB + 0.08, col, 0.04); K.box(M.paint, -0.008, 0.008, Y0 + 0.08, YR - 0.18, ZB - 0.008, ZB, 0x3a3440, 0.002);
  for (const sd of [-1, 1]) { K.box(M.paint, sd * 0.45 - 0.3, sd * 0.45 + 0.3, 1.45, 1.9, ZB - 0.01, ZB, new THREE.Color(col).multiplyScalar(0.9), 0.02); K.box(M.lamp, sd * 0.9 - 0.06, sd * 0.9 + 0.06, 0.65, 0.95, ZB - 0.03, ZB, 0xd8302c, 0.02); K.box(M.chrome, sd * 0.2 - 0.07, sd * 0.2 + 0.07, 1.2, 1.24, ZB - 0.03, ZB, 0xffffff, 0.01); }
  K.box(M.chrome, -1.04, 1.04, 0.4, 0.56, ZB - 0.14, ZB, 0xffffff, 0.06); K.put(M.plate, plane(0.46, 0.2), 0, 0.72, ZB - 0.005, 0, Math.PI, 0);
  K.put(M.vanBack, plane(1.3, 0.3), 0, 1.25, ZB - 0.012, 0, Math.PI, 0);
  // street-side (+x) lettering, full length
  K.put(M.vanSide, plane(3.3, 0.95), X + 0.006, 1.55, -0.55, 0, Math.PI / 2, 0);
  // roof vent + a whip aerial disguised as a radio aerial
  K.box(M.chrome, -0.25, 0.25, YR - 0.02, YR + 0.08, -1.0, -0.6, 0xffffff, 0.03); K.beam(M.paint, [0.7, YR, -2.0], [0.74, YR + 1.3, -2.1], 0.01, 0x2a2a30, true, 3);
  // ---- interior (seen through the curb-side door): floor, padded walls, partition, desk, recorders, headphones
  K.box(M.paint, -X + 0.06, X - 0.06, Y0, FL, ZB + 0.08, 0.95, 0x3a3634, 0.01);
  for (let z = ZB + 0.2; z < 0.9; z += 0.12) K.box(M.paint, -0.9, 0.9, FL, FL + 0.01, z - 0.02, z + 0.02, 0x2a2624, 0.003);
  K.box(M.quilt, X - 0.1, X - 0.06, FL, YR - 0.24, ZB + 0.1, 0.95, 0xffffff, 0.01, [0.8, 0.8]);
  K.box(M.quilt, -X + 0.06, X - 0.06, YR - 0.3, YR - 0.24, ZB + 0.1, 0.95, 0xe8e0d0, 0.01, [0.8, 0.8]);
  K.box(M.quilt, -X + 0.06, X - 0.06, FL, YR - 0.24, ZB + 0.08, ZB + 0.12, 0xffffff, 0.01, [0.8, 0.8]);
  K.box(M.quilt, -X + 0.06, X - 0.06, FL, YR - 0.24, 0.93, 0.98, 0xf2ece0, 0.01, [0.8, 0.8]);
  K.box(M.quilt, -X + 0.06, -X + 0.1, FL, YR - 0.24, ZB + 0.1, D0, 0xffffff, 0.01, [0.8, 0.8]); K.box(M.quilt, -X + 0.06, -X + 0.1, FL, YR - 0.24, D1, 0.95, 0xffffff, 0.01, [0.8, 0.8]);
  K.box(M.glow, -0.15, 0.15, YR - 0.33, YR - 0.3, -0.7, -0.4, 0xfff0c8, 0.02); // dome light
  // desk along the street-side wall
  const DT = 1.36;
  K.box(M.oak, 0.36, 0.92, DT - 0.05, DT, -2.1, 0.75, 0xe0a870, 0.01, [0.8, 0.8]);
  K.box(M.paint, 0.38, 0.92, FL, DT - 0.05, -2.1, -1.5, 0x5f6e66, 0.02); for (const y of [0.85, 1.1]) K.box(M.chrome, 0.33, 0.39, y, y + 0.03, -1.88, -1.72, 0xffffff, 0.006);
  K.box(M.paint, 0.4, 0.46, FL, DT - 0.05, 0.66, 0.72, 0x5f6e66, 0.01);
  K.box(M.oak, 0.6, 0.94, 1.86, 1.89, -2.1, 0.75, 0xa87448, 0.008, [0.8, 0.8]); // shelf
  for (const z of [-1.9, -0.6, 0.6]) K.box(M.paint, 0.86, 0.92, 1.72, 1.86, z - 0.02, z + 0.02, 0x3a3634, 0.005);
  c.reels = [];
  const recorder = (zc, tint) => {
    K.box(M.paint, 0.58, 0.88, DT, DT + 0.56, zc - 0.25, zc + 0.25, tint, 0.03);
    K.box(M.paint, 0.565, 0.58, DT + 0.03, DT + 0.17, zc - 0.23, zc + 0.23, 0x2a2a30, 0.008);
    for (const dz of [-0.16, -0.08, 0.0]) K.put(M.chrome, cyl(0.022, 0.022, 0.03, 8), 0.55, DT + 0.1, zc + dz, 0, 0, Math.PI / 2, 1, 1, 1, 0xffffff);
    K.box(M.lamp, 0.555, 0.57, DT + 0.06, DT + 0.15, zc + 0.08, zc + 0.2, 0xf2e2b0, 0.005); K.beam(M.paint, [0.55, DT + 0.07, zc + 0.14], [0.55, DT + 0.135, zc + 0.17], 0.004, 0xb8302c);
    K.box(M.chrome, 0.56, 0.58, DT + 0.24, DT + 0.3, zc - 0.08, zc + 0.08, 0xffffff, 0.006); // head block
    K.beam(M.paint, [0.565, DT + 0.36, zc - 0.13], [0.565, DT + 0.28, zc - 0.03], 0.006, 0x5a3a26); K.beam(M.paint, [0.565, DT + 0.36, zc + 0.13], [0.565, DT + 0.28, zc + 0.03], 0.006, 0x5a3a26);
    for (const dz of [-0.125, 0.125]) {
      const g = new THREE.Group(); g.position.set(0.55, DT + 0.4, zc + dz); body.add(g); c.reels.push(g);
      const R2 = new Kit(); R2.put(M.paint, cyl(0.11, 0.11, 0.012, 20), 0, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x5a6070); R2.put(M.paint, cyl(dz < 0 ? 0.085 : 0.05, dz < 0 ? 0.085 : 0.05, 0.016, 18), -0.004, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x5a3a26);
      R2.put(M.chrome, cyl(0.022, 0.022, 0.03, 10), -0.01, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0xffffff);
      for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3; R2.put(M.paint, cyl(0.022, 0.022, 0.02, 8), -0.008, Math.cos(a) * 0.072, Math.sin(a) * 0.072, 0, 0, Math.PI / 2, 1, 1, 1, 0xd8dce4); }
      R2.build(g);
    }
  };
  recorder(-0.5, 0x7a8698); recorder(0.22, 0x8a7a68);
  K.box(M.paint, 0.62, 0.9, 1.89, 2.12, -1.8, -0.9, 0x4a4e3e, 0.02); // receiver on the shelf
  K.box(M.lamp, 0.6, 0.62, 1.97, 2.05, -1.7, -1.2, 0xf2dca0, 0.005); for (const dz of [-1.08, -0.98]) K.put(M.chrome, cyl(0.03, 0.03, 0.03, 8), 0.6, 2.0, dz, 0, 0, Math.PI / 2, 1, 1, 1, 0xffffff);
  K.box(M.paint, 0.66, 0.9, 1.89, 2.0, -0.4, 0.1, 0x8a4a3a, 0.01); K.box(M.paint, 0.66, 0.9, 2.0, 2.06, -0.35, 0.05, 0x3a5a7a, 0.01); // tape boxes
  // headphones hanging on a hook by the partition
  K.beam(M.chrome, [0.92, 1.98, 0.6], [0.8, 1.98, 0.6], 0.012, 0xffffff, true, 4); K.put(M.chrome, sph(0.018, 6, 4), 0.8, 1.99, 0.6, 0, 0, 0, 1, 1, 1, 0xffffff);
  K.put(M.paint, tor(0.1, 0.014, 5, 16, Math.PI), 0.8, 1.86, 0.6, 0, Math.PI / 2, 0, 1, 1, 1, 0x2a2a30);
  for (const dz of [-0.1, 0.1]) { K.put(M.paint, cyl(0.055, 0.055, 0.045, 14), 0.8, 1.84, 0.6 + dz, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2a30); K.put(M.paint, tor(0.045, 0.016, 5, 12), 0.8, 1.84, 0.6 + dz * 0.75, 0, 0, 0, 1, 1, 1, 0x5a3a2a); }
  K.beam(M.paint, [0.8, 1.8, 0.7], [0.84, 1.55, 0.62], 0.007, 0x2a2a30, true, 3); K.beam(M.paint, [0.84, 1.55, 0.62], [0.86, DT + 0.3, 0.3], 0.007, 0x2a2a30, true, 3);
  // desk clutter: notepad + pencil, thermos + cup, ashtray, gooseneck lamp, binoculars, camera with a long lens
  K.box(M.paint, 0.38, 0.54, DT, DT + 0.015, -1.05, -0.8, 0xf4efdc, 0.004); K.beam(M.paint, [0.42, DT + 0.02, -1.0], [0.5, DT + 0.02, -0.84], 0.007, 0xe0b040, true, 4);
  K.put(M.paint, cyl(0.045, 0.045, 0.3, 10), 0.75, DT + 0.15, 0.62, 0, 0, 0, 1, 1, 1, 0xb8302c); K.put(M.chrome, cyl(0.05, 0.05, 0.07, 10), 0.75, DT + 0.33, 0.62, 0, 0, 0, 1, 1, 1, 0xffffff); K.put(M.paint, cyl(0.04, 0.035, 0.08, 10), 0.5, DT + 0.04, 0.6, 0, 0, 0, 1, 1, 1, 0xf2ece0);
  K.put(M.paint, cyl(0.07, 0.06, 0.03, 12), 0.5, DT + 0.015, -1.85, 0, 0, 0, 1, 1, 1, 0x6a8aa0); for (let i = 0; i < 3; i++) K.beam(M.paint, [0.5, DT + 0.035, -1.85], [0.5 + 0.06 * Math.cos(i * 2), DT + 0.04, -1.85 + 0.06 * Math.sin(i * 2)], 0.008, 0xf2ece0, true, 3);
  K.put(M.paint, cyl(0.07, 0.08, 0.02, 10), 0.8, DT + 0.01, -0.95, 0, 0, 0, 1, 1, 1, 0x2a2a30); K.beam(M.paint, [0.8, DT, -0.95], [0.72, DT + 0.35, -0.9], 0.012, 0x2a2a30, true, 4); K.beam(M.paint, [0.72, DT + 0.35, -0.9], [0.6, DT + 0.42, -0.82], 0.012, 0x2a2a30, true, 4);
  K.put(M.paint, cone(0.08, 0.12, 10), 0.58, DT + 0.37, -0.8, 0, 0, 0.8, 1, 1, 1, 0x3f6a5a); K.put(M.glow, sph(0.035, 8, 6), 0.56, DT + 0.33, -0.81, 0, 0, 0, 1, 1, 1, 0xfff0c0);
  for (const dz of [-0.05, 0.05]) K.put(M.paint, cyl(0.035, 0.03, 0.14, 10), 0.46, DT + 0.035, 0.5 + dz, 0, 0, Math.PI / 2, 1, 1, 1, 0x2a2a30);
  K.box(M.paint, 0.66, 0.84, 1.89, 2.02, 0.25, 0.5, 0x2a2a30, 0.02); K.put(M.paint, cyl(0.05, 0.05, 0.3, 10), 0.6, 1.96, 0.38, 0, 0, Math.PI / 2, 1, 1, 1, 0x2a2a30); K.put(M.glass, cyl(0.045, 0.045, 0.01, 10), 0.45, 1.96, 0.38, 0, 0, Math.PI / 2, 1, 1, 1, 0xffffff);
  // stool
  K.put(M.paint, cyl(0.17, 0.17, 0.06, 14), 0.0, 1.12, -0.5, 0, 0, 0, 1, 1, 1, 0xa83a2e); for (let i = 0; i < 3; i++) { const a = i * 2.1; K.beam(M.chrome, [0, 1.09, -0.5], [Math.cos(a) * 0.2, FL, -0.5 + Math.sin(a) * 0.2], 0.014, 0xffffff, true, 4); }
  K.build(body);
  // ---- side door leaves (hinged at the outer edges; open with van.setDoor(0..1))
  c.doors = [];
  for (const [hz, dir] of [[D1, -1], [D0, 1]]) {
    const g = new THREE.Group(); g.position.set(-X, 0, hz); body.add(g); c.doors.push(g);
    const L = new Kit(), w = D1 - D0 - 0.02, z0 = dir > 0 ? 0 : -w / 2, z1 = dir > 0 ? w / 2 : 0;
    L.box(M.paint, 0, 0.06, DY0 + 0.01, DY1 - 0.01, z0, z1, col, 0.015);
    L.box(M.quilt, 0.06, 0.08, DY0 + 0.1, DY1 - 0.1, z0 + 0.05, z1 - 0.05, 0xffffff, 0.005, [0.8, 0.8]);
    L.box(M.paint, -0.012, 0.0, 1.03, 1.08, z0 + 0.02, z1 - 0.02, new THREE.Color(col).multiplyScalar(0.82), 0.004);
    const ez = dir > 0 ? z1 - 0.08 : z0 + 0.08; L.box(M.chrome, -0.03, 0.0, 1.22, 1.26, ez - 0.08, ez + 0.08, 0xffffff, 0.008);
    for (const y of [DY0 + 0.25, DY1 - 0.25]) L.box(M.chrome, -0.02, 0.01, y - 0.06, y + 0.06, dir > 0 ? -0.02 : -0.02, dir > 0 ? 0.04 : 0.02, 0xffffff, 0.006);
    L.put(dir > 0 ? M.vanDoorA : M.vanDoorB, plane(w / 2 - 0.08, 0.72), -0.005, 1.55, (z0 + z1) / 2, 0, -Math.PI / 2, 0);
    L.build(g);
  }
  // front leaf (hinge at D1) swings with +angle, rear leaf (hinge at D0) with -angle; both outward (-x)
  c.setDoor = (t) => { c.doors[0].rotation.y = 1.75 * t; c.doors[1].rotation.y = -1.75 * t; };
  c.wheels = [[-1, zf], [1, zf], [-1, zr], [1, zr]].map(([sd, z]) => wheel(c, sd * 0.86, r, z, r, sd, { hub: 0.42 }));
  return c;
}

// ---------------------------------------------------------------- the set
export function buildDC(ctx) {
  ({ THREE, toon, rnd, P, mkTex, macro } = ctx);
  materials();
  const plateTex = mkTex(256, 112, (g, w, h) => { g.fillStyle = '#f0e2a0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a2a3a'; g.lineWidth = 6; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = '#2a2a3a'; g.font = 'bold 60px "DejaVu Sans"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('D.C. 63', w / 2, h / 2 + 4); });
  M.plate = tm(plateTex);
  M.check = tm(mkTex(512, 16, (g, w, h) => { for (let i = 0; i < 64; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#f4f0e6' : '#1f1d24'; g.fillRect(i * w / 64, j * h / 2, w / 64, h / 2); } }, [1.25, 1]));
  M.taxiSign = tm(signTex('TAXI', { w: 0.5, h: 0.15, pw: 512, bg: '#fff2c8', fg: '#1f1d24', edge: '#1f1d24' }), { emissive: 0x5a4a20 });
  M.taxiDoor = tm(mkTex(512, 300, (g, w, h) => { g.fillStyle = '#f0c22e'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f1d24'; g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.46, h * 0.44, 0, 0, 7); g.fill(); g.fillStyle = '#f0c22e'; g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.42, h * 0.38, 0, 0, 7); g.fill(); g.fillStyle = '#1f1d24'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 74px "DejaVu Sans"'; g.fillText('CITY CAB', w / 2, h * 0.42); g.font = 'bold 54px "DejaVu Sans"'; g.fillText('No. 37', w / 2, h * 0.7); }));
  const vanName = (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#9aa08e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#7a2a28'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'italic bold 150px "DejaVu Serif"'; g.save(); g.translate(w * 0.56, h * 0.32); g.scale(1, 1); g.fillStyle = 'rgba(30,20,40,0.35)'; g.fillText('Potomac', 6, 7); g.fillStyle = '#7a2a28'; g.fillText('Potomac', 0, 0); g.restore();
    g.font = 'bold 92px "DejaVu Sans"'; g.fillStyle = '#23335a'; g.fillText('TV  REPAIR', w * 0.56, h * 0.64); g.font = 'bold 44px "DejaVu Sans"'; g.fillText('SALES & SERVICE  ·  ADAMS 2-4417', w * 0.56, h * 0.87);
    // little TV set emblem
    g.fillStyle = '#23335a'; g.beginPath(); g.roundRect ? g.roundRect(w * 0.03, h * 0.2, w * 0.14, h * 0.55, 18) : g.rect(w * 0.03, h * 0.2, w * 0.14, h * 0.55); g.fill(); g.fillStyle = '#c8d8e0'; g.beginPath(); g.roundRect ? g.roundRect(w * 0.045, h * 0.27, w * 0.085, h * 0.4, 14) : g.rect(w * 0.045, h * 0.27, w * 0.085, h * 0.4); g.fill();
    g.strokeStyle = '#23335a'; g.lineWidth = 8; g.beginPath(); g.moveTo(w * 0.1, h * 0.2); g.lineTo(w * 0.06, h * 0.03); g.moveTo(w * 0.1, h * 0.2); g.lineTo(w * 0.15, h * 0.04); g.stroke(); for (const y of [0.35, 0.5]) { g.fillStyle = '#c8d8e0'; g.beginPath(); g.arc(w * 0.152, h * y, 9, 0, 7); g.fill(); } };
  M.vanSide = tm(mkTex(1400, 400, vanName));
  const half = (off) => { const t = mkTex(1400, 400, vanName); t.repeat.set(0.5, 1); t.offset.set(off, 0); return tm(t); };
  M.vanDoorA = half(0); M.vanDoorB = half(0.5); // rear leaf shows the left half, front leaf the right half
  M.vanBack = tm(signTex('POTOMAC TV REPAIR', { w: 1.3, h: 0.3, pw: 512, bg: '#9aa08e', fg: '#7a2a28', border: false }));

  const G = new THREE.Group(); G.name = 'dc';
  const S = new THREE.Group(); S.position.set(0, 0, OZ); G.add(S); G.set = S; // static set, local coords (world z = local z + 800)
  const K = new Kit(), Kn = new Kit(); // Kn: near detail around the bench / van (not chunked)

  // ---- ground: road, kerbs, sidewalks, park lawn, forecourt, far ground
  ground(S, -5, 5, -140, 140, 0.0, M.asphalt, 10, 10);
  ground(S, -160, 160, -170, 170, -0.03, toon({ color: 0x8a8478 }), 10);
  for (const sd of [-1, 1]) {
    K.box(M.kerb, ...xs(sd, 5.0, 5.3), -0.2, 0.15, -140, 140, 0xffffff, 0.03, 1.2);
    K.box(M.walk, ...xs(sd, 5.3, 8.5), -0.2, 0.15, -140, 140, 0xffffff, 0.01, 3);
  }
  K.box(M.walk, -160, -8.5, -0.2, 0.15, -170, -125, 0xffffff, 0.01, 3); // plazas at the street ends
  ground(S, 8.5, 80, -75, 75, 0.15, M.grass, 4);
  // park paths: long walk at x 10.8..13.2, entrance spur, plaza walk, ring round the fountain, bench pads
  const pathBox = (x0, x1, z0, z1, tu = 2.4) => ground(S, x0, x1, z0, z1, 0.165, M.path, tu, 12.8);
  pathBox(10.8, 13.2, -75, 75); pathBox(8.5, 10.8, -1.6, 1.6, 3.2); pathBox(13.2, 23, -1.6, 1.6, 3.2);
  pathBox(13.2, 14.9, 1.6, 4.8, 3.2); pathBox(13.2, 14.9, -14.8, -11.6, 3.2); pathBox(13.2, 14.9, 13.6, 16.8, 3.2); pathBox(13.2, 14.9, -27.8, -24.6, 3.2);
  { const rg = new THREE.RingGeometry(5.4, 8.6, 48, 1); rg.rotateX(-Math.PI / 2); const uv = rg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 6, uv.getY(i) * 6); const m = new THREE.Mesh(rg, M.path); m.position.set(30, 0.166, 0); m.receiveShadow = true; S.add(m); }
  // embassy forecourt paving + lawns
  K.box(M.pave, -16, -8.5, -0.2, 0.16, -24, 24, 0xffffff, 0.01, 3);
  for (const sd of [-1, 1]) K.box(M.lawn, -14.2, -9.6, 0.16, 0.2, ...xs(sd, 6.8, 22.6), 0x9cbc5e, 0.01, 4);

  // ---- PARK (east): low iron fence, hedges, benches, lamps, trees, topiary, fountain
  parkFence(K, 8.9, -75, -1.8); parkFence(K, 8.9, 1.8, 75);
  for (const sd of [-1, 1]) { const z = sd * 1.85; K.box(M.ashlar, 8.6, 9.2, 0.15, 1.45, z - 0.3, z + 0.3, 0xe8e0cc, 0.02, 1.2); K.box(M.paint, 8.5, 9.3, 1.45, 1.58, z - 0.4, z + 0.4, 0xe8e0cc, 0.02); K.put(M.paint, sph(0.17, 10, 7), 8.9, 1.75, z, 0, 0, 0, 1, 1, 1, 0xe8e0cc); }
  for (const [z0, z1] of [[-74, -2.6], [2.6, 74]]) for (let z = z0; z < z1 - 0.5; z += 6.2) hedge(K, 9.3, 10.4, z, Math.min(z1, z + 5.9), 0.95, 0x55863f);
  // hero bench (its own group, so it can be found / hidden): world centre (14.05, 0.165, 803.2), facing -x toward the street
  const heroBench = new THREE.Group(); heroBench.position.set(14.05, 0.165, 3.2); heroBench.rotation.y = -Math.PI / 2; S.add(heroBench);
  { const Kb = new Kit(); bench(Kb); Kb.build(heroBench); }
  for (const [z0, z1] of [[1.0, 5.0], [-15.2, -11.2], [13.2, 17.2], [-28.2, -24.2]]) hedge(Kn, 15.0, 15.9, z0, z1, 0.9, 0x4f8040);
  for (const z of [-13.2, 15.2, -26.2]) Kn.at(14.05, 0.165, z, -Math.PI / 2, () => bench(Kn));
  for (const a of [0.5, 2.0, 3.6, 5.1]) Kn.at(30 + Math.cos(a) * 9.1, 0.165, Math.sin(a) * 9.1, -a - Math.PI / 2, () => bench(Kn));
  lampPost(Kn, 14.15, 5.3, 3.6); lampPost(Kn, 14.15, -10.6, 3.6); lampPost(K, 14.15, 18.4, 3.6); lampPost(K, 14.15, -23.4, 3.6); lampPost(K, 14.15, 32, 3.6); lampPost(K, 14.15, -38, 3.6); lampPost(K, 14.15, 46, 3.6); lampPost(K, 14.15, -52, 3.6);
  for (const a of [0.0, 1.57, 3.14, 4.71]) lampPost(K, 30 + Math.cos(a + 0.78) * 9.2, Math.sin(a + 0.78) * 9.2, 3.6);
  // fountain
  K.put(M.paint, cyl(3.3, 3.4, 0.55, 40), 30, 0.42, 0, 0, 0, 0, 1, 1, 1, 0xe6ddca); K.put(M.water, cyl(3.0, 3.0, 0.05, 40), 30, 0.62, 0, 0, 0, 0, 1, 1, 1, 0xffffff);
  K.put(M.paint, cyl(0.45, 0.6, 1.3, 16), 30, 1.2, 0, 0, 0, 0, 1, 1, 1, 0xe6ddca); K.put(M.paint, cyl(1.3, 0.4, 0.4, 24), 30, 2.0, 0, 0, 0, 0, 1, 1, 1, 0xe6ddca); K.put(M.water, cyl(1.2, 1.2, 0.04, 24), 30, 2.19, 0, 0, 0, 0, 1, 1, 1, 0xffffff);
  K.put(M.paint, cyl(0.15, 0.25, 0.8, 12), 30, 2.6, 0, 0, 0, 0, 1, 1, 1, 0xe6ddca); K.put(M.paint, sph(0.28, 12, 8), 30, 3.1, 0, 0, 0, 0, 1, 1, 1, 0xe6ddca);
  K.put(M.water, cyl(1.32, 1.5, 0.35, 24, true), 30, 1.93, 0, 0, 0, 0, 1, 1, 1, 0xcfe4f0);
  // topiary at the entrance and along the plaza walk
  for (const sd of [-1, 1]) { topiary(K, 10.0, sd * 2.6, 'ball'); topiary(K, 16.2, sd * 2.3, 'cone', 0.9); topiary(K, 19.6, sd * 2.3, 'cone', 0.9); }
  for (const a of [0.78, 2.35, 3.93, 5.5]) topiary(K, 30 + Math.cos(a) * 4.6, Math.sin(a) * 4.6, 'ball', 0.85);
  // flower bed ring
  const PF = props(); const flowers = [], tufts = [];
  for (let i = 0; i < 70; i++) { const a = i / 70 * Math.PI * 2, rr = 4.3 + 0.5 * rnd(i); flowers.push([30 + Math.cos(a) * rr, 0.15, Math.sin(a) * rr, rnd(i) * 6, 1.1 + 0.3 * rnd(i + 3)]); }
  for (let i = 0; i < 70; i++) { const x = 15 + rnd(i * 3.3) * 50, z = (rnd(i * 7.7) - 0.5) * 140; if (Math.abs(z) < 2.5 && x < 24) continue; if (Math.hypot(x - 30, z) < 9.5) continue; tufts.push([x, 0.15, z, rnd(i) * 6, 1.4 + rnd(i * 2), 0x9cc060]); }
  instance(S, PF.flower, flowers); instance(S, PF.tuft, tufts, false);
  // big clumped trees (world.js prefab) in the park + a row on the park sidewalk; a few street trees further down
  const trees = [];
  const addTree = (x, z, s, k) => trees.push([x, 0.15, z, rnd(k) * 6, s, new THREE.Color().setHSL(0.24 + 0.05 * rnd(k * 3), 0.42, 0.52).multiplyScalar(1.25), 1]);
  for (const z of [-57, -45, -33, -21, -9, 21, 33, 45, 57]) addTree(7.3, z + (rnd(z) - 0.5) * 2, 0.95 + 0.25 * rnd(z * 3), z);
  for (let i = 0; i < 70; i++) { const x = 17 + rnd(i * 5.1) * 62, z = (rnd(i * 9.3) - 0.5) * 140; if (Math.hypot(x - 30, z) < 11) continue; if (Math.abs(z) < 4 && x < 26) continue; addTree(x, z, 1.0 + 0.45 * rnd(i * 2.2), i + 100); }
  for (const z of [-118, -104, -90, -76, 76, 90, 104, 118]) addTree(-6.0, z, 0.85, z + 7);
  for (let z = -66; z <= 66; z += 6.5) addTree(72 + 6 * rnd(z * 1.7), z + 2 * rnd(z), 1.2 + 0.3 * rnd(z * 2.9), z + 300); // far tree belt closes the park
  [0, 1, 2].forEach((v) => instance(S, PF.trees[v], trees.filter((_, i) => i % 3 === v)));

  // ---- STREET furniture: Victorian street lamps, parking meters, hydrant, news box, mailbox, trash can, signs
  for (const z of [-60, -36, -12, 12, 36, 60, -84, 84, -108, 108]) { lampPost(Math.abs(z) < 20 ? Kn : K, 5.75, z + 3, 4.4, true); lampPost(K, -5.75, z, 4.4, true); } // east lamps at z+3: clear of the van door (z -16)
  for (let z = -100; z <= 100; z += 6.5) { if (Math.abs(z) < 26) { if (z > -11 && z < 8) parkingMeter(Kn, 5.55, z, Math.PI / 2); continue; } parkingMeter(K, -5.55, z, -Math.PI / 2); parkingMeter(K, 5.55, z, Math.PI / 2); }
  hydrant(Kn, 5.75, -3.4);
  newsBox(Kn, 7.9, 2.9, -Math.PI / 2, tm(signTex('THE CAPITAL\nDAILY', { w: 0.42, h: 0.13, pw: 512, bg: '#f2ece0', fg: '#1f2a44', border: false, sub: 0.7 })));
  newsBox(Kn, 7.9, 3.6, -Math.PI / 2, tm(signTex('EVENING\nNEWS', { w: 0.42, h: 0.13, pw: 512, bg: '#c8302c', fg: '#f4f0e6', border: false, sub: 0.8 })));
  trashCan(Kn, 14.3, 5.9); trashCan(Kn, 7.9, -2.6);
  mailbox(Kn, 7.0, 9.0, -Math.PI / 2, tm(signTex('U.S.\nMAIL', { w: 0.34, h: 0.2, pw: 256, bg: '#2a4c8c', fg: '#f4f0e6', border: false, sub: 1 })));
  streetSign(K, 6.0, 24.0, tm(signTex('LINDEN ST NW', { w: 1.04, h: 0.18, pw: 512, bg: '#2f4f3a', fg: '#f4f0e6', edge: '#f4f0e6' })));
  const noPark = tm(signTex('NO\nPARKING\nANY TIME', { w: 0.45, h: 0.6, pw: 256, bg: '#f4f0e6', fg: '#b8302c', edge: '#b8302c', sub: 0.8 }));
  for (const z of [-18, 18]) postSign(K, -5.6, z, Math.PI / 2, noPark);
  postSign(Kn, 5.6, 10.4, -Math.PI / 2, tm(signTex('BUS\nSTOP', { w: 0.45, h: 0.6, pw: 256, bg: '#f4f0e6', fg: '#2a4c8c', edge: '#2a4c8c', sub: 1 })));

  // ---- EMBASSY compound (west): tall fence with gate, forecourt, stone mansion, flagpole
  embassyFence(K, -8.8, -24, 24, 2.4);
  const gates = [];
  for (const [hz, dir] of [[-2.4, 1], [2.4, -1]]) { const g = new THREE.Group(); g.position.set(-8.8, 0.15, hz); S.add(g); const Kg = new Kit(); gateLeaf(Kg, 2.38, dir); Kg.build(g); gates.push(g); }
  K.at(-16, 0, 0, Math.PI / 2, () => embassy(K));
  for (const sd of [-1, 1]) { for (const z of [7.5, 12, 16.5, 21]) topiary(K, -11.9, sd * z, 'cone', 0.75); hedge(K, -10.1, -9.3, ...xs(sd, 3.2, 23.4), 0.8, 0x4c7d40); }
  const flag = makeFlag(S, -11.4, -5.6, 10.5);
  // a small sentry box inside the gate
  K.box(M.paint, -10.6, -9.6, 0.16, 2.4, 3.6, 4.6, 0xd8cdb8, 0.03); K.box(M.glass, -9.62, -9.58, 1.3, 2.0, 3.75, 4.45, 0xffffff, 0.01); K.box(M.paint, -10.75, -9.45, 2.4, 2.55, 3.45, 4.75, 0x5a5a62, 0.03);

  // ---- SHOPS and ROWHOUSES
  const sg = (t, bg, fg, o = {}) => tm(signTex(t, { w: o.w ?? 6, h: 0.78, bg, fg, ...o }));
  const west = [ // facades at x = -8.5 facing +x; [zCentre, options]
    [30.6, { w: 6.8, floors: 3, mat: M.brickR, sign: sg('DRUG STORE', '#f2ece0', '#1f5a3a', { w: 5.9, edge: '#1f5a3a' }), shopCol: 0x2f5a42, awning: M.awnG, goods: true, ac: true, antenna: true }],
    [38.6, { w: 8.4, floors: 6, mat: M.brickY, sign: sg('HOTEL', '#5a141c', '#f2dca0', { w: 7.5, serif: true, edge: '#c8a24a' }), shopCol: 0x4a1a20, trim: 0xf2ece0, blade: tm(bladeTex('HOTEL', '#5a141c', '#ffe7a8', '#d8b050', 4.2 / 1.1), { emissive: 0x3a2010 }), bladeX: 3.3, bladeH: 4.2, canopy: true, belt: true, chimney: true }],
    [46.6, { w: 6.8, floors: 2, mat: M.plaster, wall: 0xf0e2c0, sign: sg('DINER', '#c8302c', '#fff6e0', { w: 5.9, italic: true, edge: '#fff6e0' }), shopCol: 0x8a8f9a, awning: M.awnR, blade: tm(bladeTex('EAT', '#1f3a5a', '#ff8a70', '#d8dce4', 2.6 / 1.1), { emissive: 0x401818 }), bladeX: 2.9, bladeH: 2.6, goods: true }],
    [54.0, { w: 6.6, floors: 3, mat: M.brickR, sign: sg('BARBER', '#f2ece0', '#23335a', { w: 5.7, edge: '#b8302c' }), shopCol: 0x23335a, barberPole: 2.7, awning: M.awnB, ac: true, bay: true }],
    [61.6, { w: 7.2, floors: 3, mat: M.brickD, sign: sg('SHOE REPAIR', '#2a2a30', '#f2dca0', { w: 6.3 }), shopCol: 0x2a2a30, ac: true, antenna: true }],
    [69.4, { w: 7.2, floors: 3, mat: M.brickR, shop: false, bay: true, ac: true, door: 0x2a4a3a }],
    [76.8, { w: 6.4, floors: 3, mat: M.brickY, shop: false, bay: true, door: 0x6a1e24 }],
    [84.0, { w: 6.8, floors: 4, mat: M.brickR, sign: sg('CLEANERS', '#1f5a8a', '#f4f0e6', { w: 5.9 }), shopCol: 0x1f3a5a, awning: M.awnB, ac: true }],
    [91.6, { w: 7.2, floors: 3, mat: M.brickD, shop: false, bay: true, antenna: true }],
    [99.0, { w: 6.8, floors: 3, mat: M.plaster, wall: 0xd8e0d0, shop: false, bay: true }],
    [106.4, { w: 7.2, floors: 3, mat: M.brickR, shop: false, ac: true }],
    [114.0, { w: 7.6, floors: 4, mat: M.brickY, sign: sg('HARDWARE', '#3a2a24', '#f2dca0', { w: 6.6 }), shopCol: 0x3a2a24 }],
    [-30.6, { w: 6.8, floors: 3, mat: M.brickD, sign: sg('LAUNDROMAT', '#f2ece0', '#2a4c8c', { w: 5.9 }), shopCol: 0x2a4c8c, ac: true }],
    [-38.2, { w: 7.2, floors: 3, mat: M.brickR, shop: false, bay: true, antenna: true }],
    [-45.8, { w: 6.8, floors: 4, mat: M.brickY, sign: sg('TV  RADIO', '#2a2a30', '#ffcf6a', { w: 5.9 }), shopCol: 0x2a2a30, ac: true }],
    [-53.4, { w: 7.2, floors: 3, mat: M.plaster, wall: 0xe8d4c8, shop: false, bay: true }],
    [-61.0, { w: 7.2, floors: 3, mat: M.brickR, shop: false, bay: true, ac: true }],
    [-68.6, { w: 7.2, floors: 3, mat: M.brickD, sign: sg('BOOKS', '#1f5a3a', '#f2dca0', { w: 6.3, serif: true }), shopCol: 0x1f3a2a, awning: M.awnG }],
    [-76.4, { w: 7.6, floors: 4, mat: M.brickY, shop: false, bay: true, antenna: true }],
    [-84.4, { w: 7.6, floors: 3, mat: M.brickR, shop: false, ac: true }],
    [-92.4, { w: 7.6, floors: 3, mat: M.brickD, shop: false, bay: true }],
    [-100.4, { w: 7.6, floors: 3, mat: M.brickR, sign: sg('FLORIST', '#f2ece0', '#8a2a4a', { w: 6.6, italic: true }), shopCol: 0x5a2a3a, awning: M.awnR }],
    [-108.4, { w: 7.6, floors: 4, mat: M.plaster, wall: 0xd8ccb4, shop: false, bay: true }],
    [-116.4, { w: 7.6, floors: 3, mat: M.brickR, shop: false }],
  ];
  for (const [z, o] of west) K.at(-8.5, 0.15, z, Math.PI / 2, () => rowhouse(K, o));
  const east = [];
  for (let i = 0; i < 6; i++) { const w = 7.2 + (i % 2) * 0.6; east.push([78.6 + i * 7.6, { w, floors: 3 + (i % 3 === 1 ? 1 : 0), mat: [M.brickR, M.brickY, M.brickD, M.plaster][i % 4], wall: i % 4 === 3 ? 0xe2d6bc : 0xffffff, shop: i === 2 ? undefined : false, sign: i === 2 ? sg('LUNCH', '#1f3a5a', '#f2dca0', { w: 6.4 }) : null, shopCol: 0x1f3a5a, bay: i % 2 === 0, ac: true }]); east.push([-78.6 - i * 7.6, { w, floors: 3, mat: [M.brickD, M.brickR, M.plaster, M.brickY][i % 4], wall: i % 4 === 2 ? 0xd8e0d0 : 0xffffff, shop: false, bay: i % 2 === 1 }]); }
  for (const [z, o] of east) K.at(8.5, 0.15, z, -Math.PI / 2, () => rowhouse(K, o));
  // street ends: a row of buildings across the far ends closes the vista
  for (const sd of [-1, 1]) for (let i = -3; i <= 3; i++) { const x = i * 8.4; K.at(x, 0.15, sd * 130, sd > 0 ? Math.PI : 0, () => rowhouse(K, { w: 8.2, floors: 4 + (Math.abs(i) % 2), mat: [M.brickR, M.brickY, M.brickD][(i + 9) % 3], shop: Math.abs(i) <= 1 ? undefined : false, sign: Math.abs(i) <= 1 ? sg(['DEPT. STORE', 'BANK', 'CAFETERIA'][(i + 1 + (sd > 0 ? 0 : 1)) % 3], '#2a2a30', '#f2dca0', { w: 7.3 }) : null, bay: false, ac: true })); }
  // far masses (behind the embassy, behind the park, beyond the rows)
  const mass = (x0, x1, z0, z1, h, k) => { K.box(M.office[k % 3], x0, x1, 0, h, z0, z1, 0xffffff, 0.05, [8, 7]); K.box(M.paint, x0 - 0.3, x1 + 0.3, h, h + 0.6, z0 - 0.3, z1 + 0.3, 0xd8d0c0, 0.05); };
  [[-62, -40, -60, -30, 22], [-66, -42, -26, 2, 30], [-60, -42, 6, 30, 26], [-64, -40, 34, 62, 20], [-40, -24, -40, -22, 16], [-44, -26, 22, 40, 18], [-60, -26, 70, 120, 24], [-60, -26, -120, -70, 22]].forEach((b, k) => mass(...b, k));
  [[130, 150, -80, -40, 13], [134, 156, -30, 10, 16], [130, 150, 16, 52, 14], [128, 152, 60, 100, 12], [28, 60, 84, 122, 18], [28, 60, -122, -84, 20]].forEach((b, k) => mass(...b, k + 1));

  // ---- pigeons (static props: around the bench, the path, the fence and pier caps)
  const pig = pigeonPrefab(), pigs = [];
  for (const [x, y, z, ry] of [[12.6, 0.165, 2.6, 1.2], [12.2, 0.165, 3.4, 2.6], [11.6, 0.165, 2.2, -0.4], [12.9, 0.165, 4.4, 3.5], [11.2, 0.165, 5.5, 1.9], [12.4, 0.165, 7.8, 0.3], [10.4, 0.165, 0.6, 4.4], [9.6, 0.165, -0.9, 2.2], [7.2, 0.15, 1.2, 5.2], [6.6, 0.15, 4.4, 1.0], [8.9, 1.92, -1.85, 0.5], [-8.8, 3.45, 5.3, 2.8], [-8.8, 3.45, -14.1, 1.4], [30.0, 0.67, 3.1, 2.0], [27.4, 0.67, -1.6, 4.2], [-8.0, 0.15, 12, 3.1], [6.2, 0.15, -8.4, 0.2], [12.0, 0.165, -6.2, 5.0]]) pigs.push([x, y, z, ry, 1.0]);
  instance(S, pig, pigs);

  K.build(S, 30); Kn.build(S);

  // ---- VEHICLES (children of G, world coordinates). Wheels spin with wheel.rotation.x = distanceAlongHeading / wheel.r
  const taxi = sedan({ color: 0xf0c22e, taxi: true }); taxi.name = 'taxi';
  taxi.position.set(1.5, 0, OZ + 10); taxi.rotation.y = Math.PI; G.add(taxi);
  const van = panelVan({}); van.name = 'van';
  van.position.set(3.85, 0, OZ - 16.0); van.rotation.y = Math.PI; van.setDoor(0); G.add(van);
  const sedans = [
    sedan({ color: 0xa8d4c0, roof: 0xf2ede2 }), sedan({ color: 0xe8d8b4 }), sedan({ color: 0x9fb4d0, roof: 0xf2ede2, whitewall: false }),
  ];
  const parkSpots = [[-3.85, OZ + 33.0, 0], [-3.85, OZ - 31.5, 0], [3.85, OZ + 21.5, Math.PI]];
  sedans.forEach((s, i) => { s.name = 'sedan' + i; s.position.set(parkSpots[i][0], 0, parkSpots[i][1]); s.rotation.y = parkSpots[i][2]; G.add(s); });
  for (const v of [taxi, van, ...sedans]) v.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });

  // ---- handles + spots (WORLD coordinates)
  Object.assign(G, {
    taxi, van, sedans, bench: heroBench, flag, gates,
    setGate: (t) => { gates[0].rotation.y = -1.6 * t; gates[1].rotation.y = 1.6 * t; },
    spots: {
      origin: [0, 0, OZ],
      bench: [14.05, 0.165, OZ + 3.2], benchFacing: -Math.PI / 2, benchSeats: [[13.95, 0.62, OZ + 2.75], [13.95, 0.62, OZ + 3.65]], // seat surface y ~0.63
      laneSouth: 1.5, laneNorth: -1.5, parkLaneEast: 3.85, parkLaneWest: -3.85, centreLine: 0, kerbEast: 5.0, kerbWest: -5.0, sidewalkY: 0.15,
      parkEntrance: [8.9, 0.165, OZ], parkPathX: 12.0,
      embassyGate: [-8.8, 0.15, OZ], embassyDoor: [-14.8, 0.9, OZ], embassyFacadeX: -16, flagTop: [-11.4, 10.5, OZ - 5.6],
      taxi: [1.5, 0, OZ + 10], van: [3.85, 0, OZ - 16.0], vanDoorCentre: [4.9, 1.3, OZ - 16.05],
      sedans: parkSpots.map(([x, z, ry]) => [x, 0, z, ry]),
    },
  });
  return G;
}

// ---------------------------------------------------------------- test cameras ([KITTY-dc] ?dcview)
const d3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const DC_CAMS = [
  { name: 'establishing: street + embassy', p: [4.4, 6.2, OZ - 44], l: [-6.6, 4.6, OZ - 2], fov: 54, cInf: 2.5 },
  { name: 'bench close-up', p: [10.4, 1.25, OZ + 1.6], l: [14.0, 0.95, OZ + 3.4], fov: 40, cInf: 5.5 },
  { name: 'van interior', p: [6.9, 1.62, OZ - 16.3], l: [3.3, 1.58, OZ - 15.75], fov: 44, cInf: 6, door: 1 },
  { name: 'taxi on the street', p: [-3.4, 1.15, OZ + 0.2], l: [2.7, 0.8, OZ + 9.2], fov: 42, cInf: 5 },
  { name: 'over the bench to the embassy', p: [16.4, 2.2, OZ + 3.5], l: [-12, -1.4, OZ + 1.4], fov: 58, cInf: 3 },
  { name: 'shops down the street', p: [-3.2, 1.7, OZ + 18], l: [-8.5, 4.2, OZ + 46], fov: 44, cInf: 2.5 },
  { name: 'van exterior + door', p: [7.9, 1.5, OZ - 11.6], l: [4.2, 1.3, OZ - 16.8], fov: 46, cInf: 4, door: 0.7 },
  { name: 'embassy gate + flag, low', p: [3.0, 0.9, OZ + 6.5], l: [-11, 6.0, OZ - 2.5], fov: 50, cInf: 3 },
  { name: 'establishing alt: down the street, embassy on the right', p: [3.2, 5.6, OZ - 40], l: [-8.5, 5.2, OZ - 2], fov: 50, cInf: 2.5 },
  { name: 'establishing alt: crane over the park entrance', p: [9.8, 11.5, OZ + 22], l: [-12, 4.5, OZ - 3], fov: 52, cInf: 2.5 },
];
export function dcCam(n, G) { const c = DC_CAMS[((n % DC_CAMS.length) + DC_CAMS.length) % DC_CAMS.length]; if (G) G.van.setDoor(c.door ?? 0); return { ...c, focus: d3(c.p, c.l), shadowAt: c.shadowAt || c.l }; }
