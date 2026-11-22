// rooms.js [KITTY-rooms]: three 1960s Washington D.C. interiors for the "Acoustic Kitty" short.
//   lab    : CIA technical lab (1960s)      group origin (-800, 0,   0)
//   office : CIA office (1967)              group origin (-800, 0, 100)
//   home   : cosy 1960s living room (payoff) group origin (-800, 0, 200)
// Every room is built in a local frame: floor y = 0, back wall at z = -3, camera side is +z (open, walls run to z = +7).
// Geometry goes through world.js Kit (rounded / chamfered boxes merged per material). Textures are painted here (new painters)
// or via paint.js. Groups start hidden; the timeline toggles them (see show()). Original designs, no seals or emblems.
import { Kit, rboxGeo, instance, signMat } from './world.js';
import { LIGHTS_ } from './story.js';

let THREE, toon, mkTex, PT;
const ORIGIN = { lab: [-800, 0, 0], office: [-800, 0, 100], home: [-800, 0, 200] };
const INK = '#2b1d4a';

// ---------------------------------------------------------------- small geometry cache
const GEO = new Map();
const cached = (k, mk) => { let g = GEO.get(k); if (!g) { g = mk(); GEO.set(k, g); } return g; };
const cyl = (rt, rb, h, rs = 12, open = false, t0 = 0, tl = Math.PI * 2) => cached(`c${rt}|${rb}|${h}|${rs}|${open}|${t0}|${tl}`, () => new THREE.CylinderGeometry(rt, rb, h, rs, 1, open, t0, tl));
const sph = (r, ws = 12, hs = 8, p0 = 0, pl = Math.PI) => cached(`s${r}|${ws}|${hs}|${p0}|${pl}`, () => new THREE.SphereGeometry(r, ws, hs, 0, Math.PI * 2, p0, pl));
const tor = (r, t, rs = 6, ts = 24, arc = Math.PI * 2) => cached(`t${r}|${t}|${rs}|${ts}|${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));
const plane = (w, h) => cached(`p${w}|${h}`, () => new THREE.PlaneGeometry(w, h));
const circle = (r, n = 40) => cached(`ci${r}|${n}`, () => new THREE.CircleGeometry(r, n));
// lathe from [r, y] pairs (closed bottom when first r is 0)
const lathe = (key, pts, n = 20) => cached('la' + key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n));
const tex = (w, h, draw) => mkTex(w, h, draw);
// transform helper: like Kit.at but with full rotation
const atM = (K, x, y, z, rx, ry, rz, fn, s = 1) => { const o = K.M.clone(); K.M.multiply(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), new THREE.Vector3(s, s, s))); fn(); K.M.copy(o); };
const mesh = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz, 'YXZ'); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
const R = (seed) => PT.rng(seed);

// ---------------------------------------------------------------- new painters (calm fills + drawn darker-shade marks, no pixel noise)
const css = (c, a) => PT.css(c, a), shade = (c, k) => PT.shade(c, k), tint = (c, k) => PT.tint(c, k);
// vinyl floor tiles: checker of two colours, grout, bevel lines, a few structured flecks and scuffs
function tiles(g, w, h, o = {}) {
  const n = o.n || 4, s = w / n, r = R(o.seed || 3), A = o.a || '#d9dccb', B = o.b || A;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const base = (i + j) % 2 ? B : A, c = PT.vary(base, (r() - 0.5) * 0.08), x = i * s, y = j * s;
    g.fillStyle = css(c); g.fillRect(x, y, s, s);
    for (let k = 0; k < (o.fleck ?? 26); k++) { g.fillStyle = css(r() < 0.6 ? shade(c, 0.78) : tint(c, 1.12), 0.55); const fx = x + 4 + r() * (s - 8), fy = y + 4 + r() * (s - 8); g.beginPath(); g.ellipse(fx, fy, 1 + r() * 2.2, 0.8 + r() * 1.2, r() * 3, 0, 7); g.fill(); }
    g.fillStyle = css(tint(c, 1.12), 0.6); g.fillRect(x + 2, y + 2, s - 4, 2); g.fillRect(x + 2, y + 2, 2, s - 4);
    g.fillStyle = css(shade(c, 0.8), 0.6); g.fillRect(x + 2, y + s - 4, s - 4, 2); g.fillRect(x + s - 4, y + 2, 2, s - 4);
  }
  g.fillStyle = css(o.grout || shade(A, 0.55), 0.9); for (let i = 0; i <= n; i++) { g.fillRect(i * s - 1, 0, 2, h); g.fillRect(0, i * s - 1, w, 2); }
  for (let k = 0; k < (o.scuff ?? 6); k++) { g.strokeStyle = css(shade(A, 0.6), 0.18); g.lineWidth = 2; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 20, y - 8, x + 30 + r() * 30, y + (r() - 0.5) * 10); g.stroke(); }
  PT.modulate(g, w, h, (u, v) => 0.96 + 0.08 * PT.fbm(u, v, 3, 3, 2, o.seed || 3));
}
// painted plaster wall: flat with soft mottling and faint vertical roller laps
function wallPaint(g, w, h, o = {}) {
  const base = o.base || '#ececec', r = R(o.seed || 5); g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) { const x = r() * w; g.fillStyle = css(shade(base, 0.9), 0.06); g.fillRect(x, 0, 10 + r() * 30, h); }
  PT.modulate(g, w, h, (u, v) => 0.95 + 0.1 * PT.fbm(u, v, 3, 3, 3, o.seed || 5));
}
// vertical wood panelling: planks rotated 90 degrees, with V-groove seams
function panel(g, w, h, o = {}) {
  g.save(); g.translate(w, 0); g.rotate(Math.PI / 2); PT.planks(g, h, w, { base: o.base || '#7a4a30', n: o.n || 4, joints: 0, nails: false, knots: true, seed: o.seed || 17, scratches: 4 }); g.restore();
  const n = o.n || 4; for (let i = 0; i <= n; i++) { const x = i * w / n; g.fillStyle = css(shade(o.base || '#7a4a30', 0.35), 0.95); g.fillRect(x - 2, 0, 4, h); g.fillStyle = css(tint(o.base || '#7a4a30', 1.2), 0.4); g.fillRect(x + 2, 0, 2, h); }
}
// floral wallpaper: cream ground, faint stripes, dusty-rose roses with sage leaves and tiny blue florets, half-drop repeat
function floral(g, w, h, o = {}) {
  const r = R(o.seed || 21), bg = o.bg || '#efe0c2'; g.fillStyle = bg; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += w / 8) { g.fillStyle = css(shade(bg, 0.94), 0.5); g.fillRect(x + w / 16 - 3, 0, 6, h); }
  const rose = (cx, cy, s, k) => {
    for (const [a, d] of [[-0.9, 1], [0.9, 1], [2.6, 0.9], [-2.4, 0.95]]) { // leaves
      g.save(); g.translate(cx + Math.cos(a) * s * 1.25, cy + Math.sin(a) * s * 1.25); g.rotate(a); g.fillStyle = css(k % 2 ? '#8ea47a' : '#7c9670'); g.beginPath(); g.ellipse(0, 0, s * 0.9 * d, s * 0.38, 0, 0, 7); g.fill();
      g.strokeStyle = css(shade('#7c9670', 0.6), 0.8); g.lineWidth = 1.5; g.beginPath(); g.moveTo(-s * 0.8, 0); g.lineTo(s * 0.8, 0); g.stroke(); g.restore(); }
    const pc = k % 3 === 2 ? '#d98f6a' : '#cf7c84';
    g.fillStyle = css(pc); g.beginPath(); g.arc(cx, cy, s, 0, 7); g.fill();
    g.strokeStyle = css(shade(pc, 0.62), 0.9); g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const rr = s * (0.85 - i * 0.26); for (let q = 0; q < 4; q++) { const a0 = q * 1.57 + i * 0.7; g.beginPath(); g.arc(cx, cy, rr, a0, a0 + 1.2); g.stroke(); } }
    g.fillStyle = css(tint(pc, 1.25), 0.7); g.beginPath(); g.arc(cx - s * 0.3, cy - s * 0.3, s * 0.22, 0, 7); g.fill();
    g.fillStyle = css(shade(pc, 0.55)); g.beginPath(); g.arc(cx, cy, s * 0.14, 0, 7); g.fill();
  };
  const floret = (cx, cy, s) => { g.fillStyle = css('#8aa0c8'); for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(cx + Math.cos(i * 1.256) * s, cy + Math.sin(i * 1.256) * s, s * 0.7, 0, 7); g.fill(); } g.fillStyle = '#e8c860'; g.beginPath(); g.arc(cx, cy, s * 0.5, 0, 7); g.fill(); };
  const nx = 3, ny = 3, cw = w / nx, ch = h / ny;
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) {
    const cx = (i + 0.5) * cw + dx, cy = (j + 0.5 + (i % 2) * 0.5) * ch + dy; if (cx < -60 || cx > w + 60 || cy < -60 || cy > h + 60) continue;
    rose(cx, cy, cw * 0.15, i + j); floret(cx + cw * 0.5, cy + ch * 0.05, cw * 0.035); floret(cx - cw * 0.15, cy + ch * 0.42, cw * 0.03);
    g.strokeStyle = css('#7c9670', 0.7); g.lineWidth = 2; g.beginPath(); g.moveTo(cx + cw * 0.12, cy + cw * 0.12); g.quadraticCurveTo(cx + cw * 0.35, cy + ch * 0.3, cx + cw * 0.5, cy + ch * 0.05); g.stroke();
  }
  PT.modulate(g, w, h, (u, v) => 0.97 + 0.06 * PT.fbm(u, v, 3, 3, 2, 27));
}
// oval braided rug (drawn round; the mesh is scaled to an oval): concentric braided rings
function braided(g, w, h, o = {}) {
  const C = o.cols || ['#7a3a30', '#c08a4a', '#5f6a48', '#d8c49a', '#8a4a3a', '#a86a3a', '#4f5a6a', '#c9a86a'], cx = w / 2, cy = h / 2, n = 13;
  g.clearRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { const r0 = (w / 2) * (1 - i / n), c = C[i % C.length]; g.fillStyle = css(c); g.beginPath(); g.arc(cx, cy, r0, 0, 7); g.fill();
    const rr = r0 - (w / 2 / n) / 2, m = Math.max(8, Math.floor(rr * 0.35)); g.lineWidth = 2.4;
    for (let k = 0; k < m; k++) { const a = (k / m) * Math.PI * 2; g.strokeStyle = css(k % 2 ? shade(c, 0.66) : tint(c, 1.18), 0.7); const t = (w / 2 / n) * 0.42;
      g.beginPath(); g.moveTo(cx + Math.cos(a) * (rr - t), cy + Math.sin(a) * (rr - t)); g.lineTo(cx + Math.cos(a + 0.12) * (rr + t), cy + Math.sin(a + 0.12) * (rr + t)); g.stroke(); }
    g.strokeStyle = css(shade(c, 0.5), 0.6); g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, r0, 0, 7); g.stroke(); }
}
// chalkboard slate with eraser swipes, circuit doodles and a little cat-and-antenna schematic
function chalk(g, w, h) {
  const r = R(44); g.fillStyle = '#2f3d35'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 10; i++) { g.strokeStyle = 'rgba(220,235,225,0.05)'; g.lineWidth = 30 + r() * 30; g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); g.quadraticCurveTo(x + 80, y - 30, x + 200, y + (r() - 0.5) * 50); g.stroke(); }
  PT.modulate(g, w, h, (u, v) => 0.92 + 0.16 * PT.fbm(u, v, 3, 2, 3, 9));
  const ch = '#e6ece2'; g.strokeStyle = ch; g.fillStyle = ch; g.lineCap = 'round'; g.lineJoin = 'round';
  const L = (pts, lw = 3) => { g.lineWidth = lw; g.beginPath(); pts.forEach(([x, y], i) => { const jx = x + (r() - 0.5) * 1.5, jy = y + (r() - 0.5) * 1.5; i ? g.lineTo(jx, jy) : g.moveTo(jx, jy); }); g.stroke(); };
  const T = (s, x, y, sz = 26) => { g.font = `bold ${sz}px "DejaVu Sans", sans-serif`; g.globalAlpha = 0.85; g.fillText(s, x, y); g.globalAlpha = 1; };
  // battery -> resistor -> capacitor -> transistor -> antenna
  L([[40, 300], [40, 200], [90, 200]]); L([[60, 290], [80, 290]], 5); L([[52, 305], [88, 305]], 3); L([[40, 300], [40, 360], [70, 360]]);
  L([[90, 200], [105, 185], [120, 215], [135, 185], [150, 215], [165, 185], [180, 200], [230, 200]]); T('R1', 115, 175, 22);
  L([[230, 170], [230, 230]], 4); L([[245, 170], [245, 230]], 4); L([[245, 200], [300, 200]]); T('C', 228, 160, 22);
  g.lineWidth = 3; g.beginPath(); g.arc(335, 200, 35, 0, 7); g.stroke(); L([[318, 180], [318, 220]], 4); L([[300, 200], [318, 200]]); L([[318, 190], [350, 168], [350, 140]]); L([[318, 210], [350, 232], [350, 260]]);
  L([[350, 140], [350, 90]]); L([[330, 60], [350, 90], [370, 60]]); L([[350, 60], [350, 90]]); T('ANT', 380, 75, 24);
  L([[350, 260], [350, 300]]); L([[330, 300], [370, 300]]); L([[337, 310], [363, 310]]); L([[344, 320], [356, 320]]);
  T('XMTR', 290, 285, 24); T('f = 1 / 2π√LC', 40, 430, 28); L([[40, 445], [260, 445]], 2);
  // cat schematic (side view): head, ear with MIC arrow, antenna along the back to the tail
  const cx = 620, cy = 250;
  L([[cx, cy], [cx + 30, cy - 50], [cx + 50, cy - 10]], 3); L([[cx + 50, cy - 10], [cx + 75, cy - 55], [cx + 85, cy - 5]], 3);
  g.lineWidth = 3; g.beginPath(); g.ellipse(cx + 45, cy + 25, 55, 45, 0, 0, 7); g.stroke();
  g.beginPath(); g.ellipse(cx + 190, cy + 70, 120, 55, 0.08, 0, 7); g.stroke(); L([[cx + 300, cy + 60], [cx + 350, cy], [cx + 345, cy - 50]], 3);
  for (const lx of [cx + 120, cx + 160, cx + 230, cx + 270]) L([[lx, cy + 115], [lx, cy + 175]], 3);
  L([[cx + 30, cy + 25], [cx + 31, cy + 26]], 7); L([[cx + 5, cy + 45], [cx - 30, cy + 40]], 2); L([[cx + 5, cy + 50], [cx - 28, cy + 58]], 2);
  g.setLineDash([10, 8]); L([[cx + 70, cy - 20], [cx + 140, cy + 20], [cx + 300, cy + 30], [cx + 345, cy - 40]], 3); g.setLineDash([]);
  L([[cx + 70, cy - 30], [cx + 40, cy - 110]], 2); L([[cx + 70, cy - 30], [cx + 55, cy - 50]], 2); L([[cx + 70, cy - 30], [cx + 80, cy - 52]], 2); T('MIC', cx + 10, cy - 120, 26);
  T('ANT.', cx + 180, cy - 10, 24); T('XMTR', cx + 110, cy + 160 + 50, 24); L([[cx + 140, cy + 180], [cx + 125, cy + 60]], 2);
  T('?', cx + 380, cy - 60, 60); T('IT GETS HUNGRY', 560, 470, 30); L([[560, 480], [820, 480]], 2);
  g.globalAlpha = 0.5; T('TEST 3 — FAIL', 60, 40, 22); g.globalAlpha = 1;
}
// oscilloscope screen: dark phosphor-green glass, graticule, bright trace (rendered unlit and over-bright so the trace blooms)
function scope(g, w, h) {
  const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7); gr.addColorStop(0, '#103a24'); gr.addColorStop(1, '#03140b'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(90,170,120,0.35)'; g.lineWidth = 1.5; for (let i = 1; i < 10; i++) { g.beginPath(); g.moveTo(i * w / 10, 0); g.lineTo(i * w / 10, h); g.stroke(); } for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(0, i * h / 8); g.lineTo(w, i * h / 8); g.stroke(); }
  g.strokeStyle = 'rgba(120,200,150,0.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
  const tr = () => { g.beginPath(); for (let x = 0; x <= w; x += 2) { const u = x / w, y = h / 2 - h * 0.28 * Math.sin(u * Math.PI * 6) * (0.6 + 0.4 * Math.sin(u * Math.PI * 1.3)) - h * 0.05 * Math.sin(u * Math.PI * 23); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); };
  g.strokeStyle = 'rgba(120,255,160,0.35)'; g.lineWidth = 12; tr(); g.strokeStyle = '#c8ffd4'; g.lineWidth = 4; tr();
}
// equipment rack front: grey crackle panels with screws, painted meters, labels and knob skirts. Layout shared with the geometry.
const RACK = [
  { meters: [0.28], knobs: [0.62, 0.84], toggles: [], lamps: [0.47], lab: ['SIGNAL', 'TUNE', 'GAIN'] },
  { meters: [], knobs: [0.18, 0.4, 0.62, 0.84], toggles: [], lamps: [], lab: ['BAND', 'FREQ', 'BFO', 'RF'] },
  { meters: [0.3, 0.7], knobs: [], toggles: [], lamps: [0.5], lab: ['PLATE', 'GRID'] },
  { meters: [], knobs: [0.75], toggles: [0.15, 0.27, 0.39, 0.51], lamps: [0.9], lab: ['PWR', 'XMIT', 'REC', 'MON', 'LEVEL'] },
  { meters: [], knobs: [0.25, 0.75], toggles: [], lamps: [], lab: ['AUDIO', 'TONE'] },
];
function rackFace(g, w, h, o = {}) {
  const base = o.base || '#6d7774', n = RACK.length, ph = h / n, r = R(o.seed || 61);
  g.fillStyle = base; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.94 + 0.12 * PT.fbm(u, v, 6, 12, 3, 12));
  RACK.forEach((p, i) => { const y0 = i * ph;
    g.fillStyle = css(shade(base, 0.45)); g.fillRect(0, y0, w, 3); g.fillStyle = css(tint(base, 1.2), 0.6); g.fillRect(0, y0 + 3, w, 2);
    for (const x of [12, w - 12]) for (const fy of [0.2, 0.8]) { g.fillStyle = '#c9cdd0'; g.beginPath(); g.arc(x, y0 + ph * fy, 5, 0, 7); g.fill(); g.strokeStyle = '#4a4e52'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 4, y0 + ph * fy); g.lineTo(x + 4, y0 + ph * fy); g.stroke(); }
    for (const u of p.meters) { const mx = u * w, my = y0 + ph * 0.45, mw = w * 0.3, mh = ph * 0.5;
      g.fillStyle = '#1d1b22'; g.fillRect(mx - mw / 2 - 5, my - mh / 2 - 5, mw + 10, mh + 10); g.fillStyle = '#efe6c8'; g.fillRect(mx - mw / 2, my - mh / 2, mw, mh);
      g.strokeStyle = '#2b1d4a'; g.lineWidth = 2; g.beginPath(); g.arc(mx, my + mh * 0.45, mh * 0.7, -2.4, -0.74); g.stroke();
      for (let k = 0; k <= 10; k++) { const a = -2.4 + k * 0.166; g.lineWidth = k % 5 ? 1.5 : 3; g.beginPath(); g.moveTo(mx + Math.cos(a) * mh * 0.7, my + mh * 0.45 + Math.sin(a) * mh * 0.7); g.lineTo(mx + Math.cos(a) * mh * 0.6, my + mh * 0.45 + Math.sin(a) * mh * 0.6); g.stroke(); }
      g.strokeStyle = '#c8302c'; g.lineWidth = 2; g.beginPath(); g.arc(mx, my + mh * 0.45, mh * 0.7, -1.05, -0.74); g.stroke();
      const na = -2.4 + (0.3 + 0.5 * r()) * 1.66; g.strokeStyle = '#1d1b22'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(mx, my + mh * 0.45); g.lineTo(mx + Math.cos(na) * mh * 0.72, my + mh * 0.45 + Math.sin(na) * mh * 0.72); g.stroke(); }
    for (const u of p.knobs) { const kx = u * w, ky = y0 + ph * 0.45; g.strokeStyle = '#e8e4d8'; g.lineWidth = 2; for (let k = 0; k <= 8; k++) { const a = 2.4 + k * 0.58; g.beginPath(); g.moveTo(kx + Math.cos(a) * w * 0.07, ky + Math.sin(a) * w * 0.07); g.lineTo(kx + Math.cos(a) * w * 0.085, ky + Math.sin(a) * w * 0.085); g.stroke(); } g.fillStyle = '#3a3e42'; g.beginPath(); g.arc(kx, ky, w * 0.06, 0, 7); g.fill(); }
    for (const u of p.toggles) { g.fillStyle = '#3a3e42'; g.beginPath(); g.arc(u * w, y0 + ph * 0.45, 9, 0, 7); g.fill(); }
    g.fillStyle = '#e8e4d8'; g.font = `bold ${Math.round(ph * 0.09)}px "DejaVu Sans", sans-serif`; g.textAlign = 'center';
    const pos = [...p.meters, ...p.knobs, ...p.toggles, ...p.lamps]; p.lab.forEach((t, k) => { if (pos[k] !== undefined) g.fillText(t, pos[k] * w, y0 + ph * 0.86); });
  });
}
// crate front with stencilled TOP SECRET
function crateFront(g, w, h) {
  PT.planks(g, w, h, { base: '#b08a5a', n: 4, joints: 0, seed: 77, nails: true });
  g.fillStyle = css(shade('#b08a5a', 0.8)); g.fillRect(0, 0, w, 26); g.fillRect(0, h - 26, w, 26); g.fillRect(0, 0, 26, h); g.fillRect(w - 26, 0, 26, h);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const s = c.getContext('2d');
  s.fillStyle = '#2a2230'; s.font = `bold ${h * 0.2 | 0}px "DejaVu Sans", sans-serif`; s.textAlign = 'center'; s.textBaseline = 'middle';
  s.save(); s.translate(w / 2, h * 0.42); s.scale(Math.min(1, (w * 0.86) / s.measureText('TOP SECRET').width), 1); s.fillText('TOP SECRET', 0, 0); s.restore();
  s.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 26; i++) s.fillRect(w * 0.08 + i * w * 0.033, h * 0.42 - 2, 3, 4); s.globalCompositeOperation = 'source-over';
  s.fillStyle = '#8a2a26'; s.font = `bold ${h * 0.08 | 0}px "DejaVu Sans", sans-serif`; s.fillText('HANDLE WITH CARE  •  NO. 67-14', w / 2, h * 0.68);
  PT.inkWear(s, 0, 0, w, h, 13, 2.2); g.globalAlpha = 0.9; g.drawImage(c, 0, 0); g.globalAlpha = 1;
}
// the 1967 memo ("VIEWS ON TRAINED CATS"), optional red NOT PRACTICAL stamp. Same pattern as main.js P.doc.
export function paintMemo(g, w, h, stamped) {
  PT.paper(g, w, h, { seed: 11, base: '#f4efe0' }); const ink = '#211a2a', mono = '"DejaVu Sans Mono", "Courier New", monospace';
  g.fillStyle = ink; g.textAlign = 'center'; g.font = `bold 26px ${mono}`; g.fillText('S E C R E T', w / 2, 44); g.fillText('S E C R E T', w / 2, h - 22);
  g.font = `bold 28px ${mono}`; g.fillText('MEMORANDUM FOR THE RECORD', w / 2, 104);
  g.textAlign = 'left'; g.font = `24px ${mono}`; g.fillText('DATE:    1967', 44, 150); g.fillText('SUBJECT:', 44, 192);
  g.font = `bold 52px ${mono}`; g.textAlign = 'center'; g.fillText('VIEWS ON', w / 2, 262); g.fillText('TRAINED CATS', w / 2, 318);
  g.strokeStyle = ink; g.lineWidth = 3; g.beginPath(); g.moveTo(60, 334); g.lineTo(w - 60, 334); g.stroke();
  const r = R(12); g.textAlign = 'left';
  for (let i = 0; i < 9; i++) { const y = 376 + i * 30, x0 = 44 + (i === 0 ? 40 : 0), x1 = w - 44 - (i === 8 ? 160 : r() * 30); let x = x0;
    while (x < x1) { const ww = 22 + r() * 70; if (r() < 0.18) { g.fillStyle = '#141018'; g.fillRect(x, y - 16, Math.min(ww * 1.6, x1 - x), 20); } else { g.fillStyle = 'rgba(33,26,42,0.55)'; g.fillRect(x, y - 9, Math.min(ww, x1 - x), 7); } x += ww + 12; } }
  g.fillStyle = 'rgba(120,100,80,0.16)'; g.fillRect(0, h / 3, w, 2); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(0, h / 3 + 2, w, 2);
  if (stamped) { const c = document.createElement('canvas'); c.width = w; c.height = h; const s = c.getContext('2d');
    s.translate(w / 2, h * 0.7); s.rotate(-0.16); s.strokeStyle = '#c8302c'; s.lineWidth = 11; s.strokeRect(-215, -78, 430, 156); s.lineWidth = 3; s.strokeRect(-200, -63, 400, 126);
    s.fillStyle = '#c8302c'; s.font = 'bold 66px "DejaVu Sans", sans-serif'; s.textAlign = 'center'; s.textBaseline = 'middle'; s.fillText('NOT', 0, -26); s.fillText('PRACTICAL', 0, 34);
    s.setTransform(1, 0, 0, 1, 0, 0); PT.inkWear(s, 20, h * 0.5, w - 40, h * 0.4, 9, 1.4); g.globalAlpha = 0.9; g.globalCompositeOperation = 'multiply'; g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
}
// generic banknote face (stylised, not a real design) and stacked-paper edges
function billFace(g, w, h) {
  g.fillStyle = '#9fb88a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2f5236'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); g.lineWidth = 2; g.strokeRect(20, 20, w - 40, h - 40);
  g.fillStyle = '#7f9c70'; g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.16, h * 0.32, 0, 0, 7); g.fill(); g.strokeStyle = '#46664a'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#46664a'; g.font = 'bold 34px "DejaVu Serif", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; for (const [x, y] of [[50, 46], [w - 50, 46], [50, h - 44], [w - 50, h - 44]]) g.fillText('100', x, y);
  g.font = 'bold 22px "DejaVu Serif", serif'; g.fillText('$', w / 2, h / 2);
  // paper band across the middle
  g.fillStyle = '#e6d6a8'; g.fillRect(w * 0.36, 0, w * 0.1, h); g.fillStyle = '#7a5a2a'; g.font = 'bold 15px "DejaVu Sans", sans-serif'; g.save(); g.translate(w * 0.41, h / 2); g.rotate(-Math.PI / 2); g.fillText('$10,000', 0, 0); g.restore();
}
function billEdge(g, w, h) { g.fillStyle = '#b8c8a4'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 3) { g.fillStyle = `rgba(70,102,74,${0.12 + 0.15 * ((y * 7) % 5) / 5})`; g.fillRect(0, y, w, 1); } g.fillStyle = '#e6d6a8'; g.fillRect(w * 0.36, 0, w * 0.1, h); }
// plain flag, no seal or emblem
function flag(g, w, h) {
  for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#f2ede2' : '#b3283a'; g.fillRect(0, i * h / 13, w, h / 13 + 1); }
  const cw = w * 0.4, chh = h * 7 / 13; g.fillStyle = '#2f3468'; g.fillRect(0, 0, cw, chh); g.fillStyle = '#f2ede2';
  const star = (x, y, r) => { g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.42 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); };
  for (let j = 0; j < 9; j++) for (let i = 0; i < (j % 2 ? 5 : 6); i++) star((i + (j % 2 ? 1 : 0.5)) * cw / 6, (j + 0.6) * chh / 9.2, chh / 30);
  PT.modulate(g, w, h, (u) => 0.9 + 0.12 * Math.sin(u * Math.PI * 7));
}
// crocheted doily (alpha cut-out)
function doily(g, w, h) {
  const cx = w / 2, cy = h / 2; g.clearRect(0, 0, w, h); g.fillStyle = '#f6f1e6';
  for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12; g.beginPath(); g.arc(cx + Math.cos(a) * w * 0.42, cy + Math.sin(a) * w * 0.42, w * 0.07, 0, 7); g.fill(); }
  g.beginPath(); g.arc(cx, cy, w * 0.42, 0, 7); g.fill();
  g.globalCompositeOperation = 'destination-out';
  for (const [rr, n, s] of [[0.36, 24, 0.028], [0.27, 18, 0.03], [0.18, 12, 0.026], [0.09, 6, 0.022]]) for (let k = 0; k < n; k++) { const a = (k + 0.5) * Math.PI * 2 / n; g.beginPath(); g.arc(cx + Math.cos(a) * w * rr, cy + Math.sin(a) * w * rr, w * s, 0, 7); g.fill(); }
  g.globalCompositeOperation = 'source-over'; g.strokeStyle = 'rgba(160,140,120,0.5)'; g.lineWidth = 2; for (const rr of [0.31, 0.22, 0.13]) { g.beginPath(); g.arc(cx, cy, w * rr, 0, 7); g.stroke(); }
}
// TV picture: soft glowing grey-blue screen with scanlines and a gentle station card (a plain circle-and-bars test card)
function tvScreen(g, w, h) {
  const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7); gr.addColorStop(0, '#d6e2e4'); gr.addColorStop(1, '#5a6a78'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(40,50,70,0.5)'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, h * 0.32, 0, 7); g.stroke();
  for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(30,40,60,${0.1 + i * 0.08})`; g.fillRect(w * 0.2 + i * w * 0.1, h * 0.42, w * 0.09, h * 0.16); }
  for (let y = 0; y < h; y += 4) { g.fillStyle = 'rgba(20,30,50,0.12)'; g.fillRect(0, y, w, 1.5); }
}
// window views: lab daylight (pale sky, a hint of the building opposite) and home dusk (warm sky, roofline)
function skyLab(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#cfe2f4'); gr.addColorStop(1, '#f4f2e6'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(160,150,140,0.45)'; g.fillRect(w * 0.55, h * 0.35, w * 0.45, h); for (let y = h * 0.42; y < h; y += h * 0.14) for (let x = w * 0.6; x < w; x += w * 0.12) { g.fillStyle = 'rgba(110,110,130,0.4)'; g.fillRect(x, y, w * 0.06, h * 0.07); } }
function skyHome(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f2b98a'); gr.addColorStop(0.6, '#ffe2b4'); gr.addColorStop(1, '#fff2d8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,80,90,0.55)'; g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * 0.72); g.lineTo(w * 0.18, h * 0.6); g.lineTo(w * 0.36, h * 0.72); g.lineTo(w * 0.5, h * 0.7); g.lineTo(w * 0.5, h * 0.62); g.lineTo(w * 0.56, h * 0.62); g.lineTo(w * 0.56, h * 0.7); g.lineTo(w * 0.7, h * 0.66); g.lineTo(w, h * 0.78); g.lineTo(w, h); g.fill();
  g.fillStyle = 'rgba(90,110,80,0.6)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(w * (0.1 + i * 0.17), h * 0.86, w * 0.1, 0, 7); g.fill(); } }
// wall clock face
function clockFace(g, w, h, o = {}) { g.fillStyle = o.bg || '#f4efe2'; g.fillRect(0, 0, w, h); const cx = w / 2, cy = h / 2; g.fillStyle = INK; g.font = `bold ${w * 0.1 | 0}px "DejaVu Sans", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let k = 1; k <= 12; k++) { const a = k * Math.PI / 6 - Math.PI / 2; if (o.ticks) { g.fillRect(cx + Math.cos(a) * w * 0.38 - 4, cy + Math.sin(a) * w * 0.38 - 4, 8, 8); } else g.fillText(String(k), cx + Math.cos(a) * w * 0.38, cy + Math.sin(a) * w * 0.38); }
  g.strokeStyle = INK; g.lineCap = 'round'; g.lineWidth = w * 0.035; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + w * 0.17, cy - w * 0.12); g.stroke(); g.lineWidth = w * 0.022; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx - w * 0.05, cy - w * 0.33); g.stroke();
  g.strokeStyle = '#c8302c'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + w * 0.3, cy + w * 0.14); g.stroke(); }
// rotary dial: cream disc with finger holes
function dialFace(g, w, h) { g.fillStyle = '#1d1b22'; g.fillRect(0, 0, w, h); const cx = w / 2, cy = h / 2; g.fillStyle = '#efe8d6'; g.beginPath(); g.arc(cx, cy, w * 0.47, 0, 7); g.fill();
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 3 - k * (Math.PI * 1.55 / 9); g.fillStyle = '#1d1b22'; g.beginPath(); g.arc(cx + Math.cos(a) * w * 0.34, cy + Math.sin(a) * w * 0.34, w * 0.075, 0, 7); g.fill(); g.fillStyle = '#efe8d6'; g.font = `bold ${w * 0.07 | 0}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String((k + 1) % 10), cx + Math.cos(a) * w * 0.34, cy + Math.sin(a) * w * 0.34); }
  g.fillStyle = '#d8d0bc'; g.beginPath(); g.arc(cx, cy, w * 0.18, 0, 7); g.fill(); g.fillStyle = INK; g.font = `bold ${w * 0.05 | 0}px sans-serif`; g.fillText('EX 3-1967', cx, cy); }
// framed pictures: simple painted landscapes / a portrait silhouette
function picture(g, w, h, o = {}) { const r = R(o.seed || 1), gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.sky || '#a8c0d8'); gr.addColorStop(1, o.low || '#e8d8b0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  if (o.portrait) { g.fillStyle = o.fig || '#5a4a6a'; g.beginPath(); g.ellipse(w / 2, h * 0.42, w * 0.18, h * 0.2, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(w / 2, h, w * 0.36, h * 0.38, 0, 0, 7); g.fill(); return; }
  for (let k = 0; k < 3; k++) { g.fillStyle = css(PT.mixc(o.hill || '#6a8a5a', '#2b1d4a', k * 0.18)); g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * (0.5 + k * 0.14) - Math.sin(x / w * 5 + k * 2 + r()) * h * 0.06); g.lineTo(w, h); g.fill(); }
  if (o.boat) { g.fillStyle = '#f4efe2'; g.beginPath(); g.moveTo(w * 0.6, h * 0.62); g.lineTo(w * 0.6, h * 0.35); g.lineTo(w * 0.75, h * 0.62); g.fill(); } }
// light shafts: soft bands (blind slats) with a fade along v
function shaftTex(g, w, h, o = {}) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); const n = o.n || 16;
  for (let i = 0; i < n; i++) { const y = (i + 0.5) * h / n; const gr = g.createLinearGradient(0, y - h / n / 2, 0, y + h / n / 2); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.3, 'rgba(255,255,255,1)'); gr.addColorStop(0.62, 'rgba(255,255,255,1)'); gr.addColorStop(0.8, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, y - h / n / 2, w, h / n); }
  PT.modulate(g, w, h, (u, v) => { const e = Math.min(1, u * 6, (1 - u) * 6); return e * (o.fade ? 0.25 + 0.75 * (1 - v) : 1); }); }
function books(g, w, h) { let x = 0, i = 0; const C = ['#7a2430', '#24406a', '#2f5a3a', '#8a5a2a', '#4a2f5a', '#6a6a3a', '#9a3a2a', '#1f2a3a', '#c8a050']; const r = R(5); g.fillStyle = '#2a1a14'; g.fillRect(0, 0, w, h);
  while (x < w) { const bw = 12 + 18 * r(), bh = h * (0.7 + 0.28 * r()); g.fillStyle = C[i % 9]; g.fillRect(x, h - bh, bw - 1.5, bh); g.fillStyle = '#d9b25a'; g.fillRect(x + 2, h - bh + 8, bw - 6, 3); g.fillRect(x + 2, h - 16, bw - 6, 3); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(x + 1, h - bh, 2, bh); x += bw; i++; } }
function notice(g, w, h, o = {}) { PT.paper(g, w, h, { seed: o.seed || 3 }); const r = R(o.seed || 3); g.fillStyle = INK; g.font = `bold ${w * 0.12 | 0}px "DejaVu Sans Mono", monospace`; g.textAlign = 'center'; g.fillText(o.t || 'NOTICE', w / 2, h * 0.16);
  for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(33,26,42,0.5)'; g.fillRect(w * 0.1, h * 0.28 + i * h * 0.075, w * (0.5 + 0.3 * r()), h * 0.022); } }

// ---------------------------------------------------------------- materials
let Mx;
function materials() {
  const vc = (o = {}) => toon({ vertexColors: true, ...o });
  const T = {
    tileLab: tex(512, 512, (g, w, h) => tiles(g, w, h, { a: '#d6d6c2', b: '#86a890', n: 4, seed: 3 })),
    ceil: tex(256, 256, (g, w, h) => { tiles(g, w, h, { a: '#f0eee6', n: 2, fleck: 0, scuff: 0, seed: 8 }); const r = R(9); for (let i = 0; i < 500; i++) { g.fillStyle = 'rgba(120,120,130,0.35)'; g.beginPath(); g.arc(r() * w, r() * h, 0.6 + r() * 0.9, 0, 7); g.fill(); } }),
    wall: tex(256, 256, (g, w, h) => wallPaint(g, w, h, { base: '#efefef' })),
    steel: tex(256, 256, (g, w, h) => PT.metal(g, w, h, { base: '#c4cace' })),
    oak: tex(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#c4925e', n: 6, seed: 31 })),
    panel: tex(512, 512, (g, w, h) => panel(g, w, h, { base: '#7a4a2e', n: 4 })),
    carpet: tex(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#5f6c57', folds: 0, seed: 4 })),
    floral: tex(512, 512, (g, w, h) => floral(g, w, h)),
    homeFloor: tex(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#b47c48', n: 8, joints: 2, seed: 19, knots: false })),
    weave: tex(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#ece6dc', folds: 2, seed: 6 })),
    books: tex(512, 128, books),
  };
  const glow = (k, c = 0xffffff) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), vertexColors: true, fog: false });
  return { T,
    paint: vc(), tileLab: vc({ map: T.tileLab }), ceil: vc({ map: T.ceil }), wall: vc({ map: T.wall }), steel: vc({ map: T.steel }), oak: vc({ map: T.oak }),
    panel: vc({ map: T.panel }), carpet: vc({ map: T.carpet }), floral: vc({ map: T.floral }), homeFloor: vc({ map: T.homeFloor }), weave: vc({ map: T.weave }),
    cloth: vc({ map: T.weave, side: THREE.DoubleSide }), books: vc({ map: T.books }),
    glow: glow(1.9), glowHi: glow(3.2), glowLo: glow(1.25),
    greenGlass: vc({ emissive: new THREE.Color('#1f6a3a'), emissiveIntensity: 0.55 }),
  };
}
const single = (draw, w = 512, h = 512, o = {}) => toon({ map: tex(w, h, draw), ...o });
const unlit = (draw, w, h, k = 1.6, o = {}) => new THREE.MeshBasicMaterial({ map: tex(w, h, draw), color: new THREE.Color(1, 1, 1).multiplyScalar(k), fog: false, ...o });

// ---------------------------------------------------------------- shared set pieces
// a wall with a rectangular window hole (back wall at z0..z1); returns nothing, builds into K
function wallWithHole(K, mat, c, x0, x1, y0, y1, z0, z1, hole, r = 0.004, s = 1.2) {
  if (!hole) { K.box(mat, x0, x1, y0, y1, z0, z1, c, r, s); return; }
  const [hx0, hx1, hy0, hy1] = hole;
  K.box(mat, x0, hx0, y0, y1, z0, z1, c, r, s); K.box(mat, hx1, x1, y0, y1, z0, z1, c, r, s);
  K.box(mat, hx0, hx1, y0, hy0, z0, z1, c, r, s); K.box(mat, hx0, hx1, hy1, y1, z0, z1, c, r, s);
}
// window with venetian blinds (slats tilted open), frame, sill, glowing view behind, plus striped light shafts + floor stripes
function blindWindow(K, g, o) {
  const { x0, x1, y0, y1, z } = o, frame = o.frame ?? 0xe8e4d8, slatC = o.slat ?? 0xf0ece0;
  const sky = new THREE.MeshBasicMaterial({ map: tex(256, 256, o.view || skyLab), color: new THREE.Color(1, 1, 1).multiplyScalar(o.skyK ?? 1.7), fog: false });
  mesh(g, plane(x1 - x0 + 0.2, y1 - y0 + 0.2), sky, (x0 + x1) / 2, (y0 + y1) / 2, z - 0.3);
  K.box(Mx.paint, x0 - 0.08, x1 + 0.08, y1, y1 + 0.08, z - 0.25, z + 0.05, frame, 0.01); K.box(Mx.paint, x0 - 0.1, x1 + 0.1, y0 - 0.06, y0, z - 0.25, z + 0.12, frame, 0.015);
  for (const x of [x0 - 0.08, x1]) K.box(Mx.paint, x, x + 0.08, y0, y1, z - 0.25, z + 0.05, frame, 0.01);
  K.box(Mx.paint, x0, x1, (y0 + y1) / 2 - 0.025, (y0 + y1) / 2 + 0.025, z - 0.2, z - 0.15, frame, 0.008); K.box(Mx.paint, (x0 + x1) / 2 - 0.02, (x0 + x1) / 2 + 0.02, y0, y1, z - 0.2, z - 0.15, frame, 0.008);
  // blinds
  K.box(Mx.paint, x0 - 0.03, x1 + 0.03, y1 - 0.08, y1 - 0.01, z + 0.02, z + 0.1, slatC, 0.012);
  const bot = o.blindBottom ?? y0 + 0.02;
  for (let y = y1 - 0.12; y > bot; y -= 0.05) K.put(Mx.paint, rboxGeo(x1 - x0 - 0.02, 0.006, 0.05, 0.002), (x0 + x1) / 2, y, z + 0.06, o.tilt ?? 0.55, 0, 0, 1, 1, 1, slatC);
  K.box(Mx.paint, x0, x1, bot - 0.03, bot, z + 0.03, z + 0.09, slatC, 0.008);
  for (const x of [x0 + 0.25, x1 - 0.25]) K.beam(Mx.paint, [x, y1 - 0.05, z + 0.06], [x, bot, z + 0.06], 0.003, 0xd8d0c0, true, 3);
  K.beam(Mx.paint, [x1 - 0.06, y1 - 0.05, z + 0.11], [x1 - 0.06, bot + 0.35, z + 0.11], 0.004, 0xd8d0c0, true, 3); K.put(Mx.paint, cyl(0.012, 0.012, 0.04, 8), x1 - 0.06, bot + 0.33, z + 0.11, 0, 0, 0, 1, 1, 1, 0xd8d0c0);
  // light: two shaft sheets (top/bottom of the beam volume) and a striped floor patch
  if (!o.shaft) return;
  const d = new THREE.Vector3(...o.shaft.dir).normalize(), op = o.shaft.op ?? 0.1, colr = new THREE.Color(o.shaft.col || '#fff1d6');
  const land = (p) => { const t = -p.y / d.y; return p.clone().addScaledVector(d, t); };
  const W0 = new THREE.Vector3(x0, y0 + 0.05, z + 0.08), W1 = new THREE.Vector3(x1, y0 + 0.05, z + 0.08), T0 = new THREE.Vector3(x0, bot > y0 + 0.1 ? bot : y1 - 0.12, z + 0.08), T1 = T0.clone().setX(x1);
  const quad = (a, b, c2, d2, map, opa) => { const gq = new THREE.BufferGeometry(); gq.setAttribute('position', new THREE.Float32BufferAttribute([...a.toArray(), ...b.toArray(), ...c2.toArray(), ...d2.toArray()], 3)); gq.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2)); gq.setIndex([0, 1, 2, 0, 2, 3]);
    const m = new THREE.Mesh(gq, new THREE.MeshBasicMaterial({ map, color: colr, transparent: true, opacity: opa, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })); m.renderOrder = 5; g.add(m); SHAFTS.push(m); return m; };
  const sheet = tex(64, 512, (gg, w, h) => shaftTex(gg, w, h, { n: 14, fade: true })), stripes = tex(64, 512, (gg, w, h) => shaftTex(gg, w, h, { n: 22 }));
  // sheets: from the window opening down to the floor (v=1 at the window)
  const L0 = land(W0), L1 = land(W1), U0 = land(T0), U1 = land(T1);
  const mid0 = W0.clone().lerp(T0, 0.5), mid1 = W1.clone().lerp(T1, 0.5), M0 = land(mid0), M1 = land(mid1);
  quad(mid0, mid1, M1, M0, sheet, op); quad(T0, T1, U1, U0, sheet, op * 0.6);
  const fl = quad(L0.clone().setY(0.006), L1.clone().setY(0.006), U1.clone().setY(0.006), U0.clone().setY(0.006), stripes, o.shaft.floorOp ?? 0.32); fl.renderOrder = 4;
  return { L0, L1, U0, U1 };
}
const SHAFTS = [];
function clock(K, g, x, y, z, ry, r = 0.18, o = {}) {
  K.at(x, y, z, ry, () => { K.put(Mx.paint, cyl(r + 0.03, r + 0.03, 0.05, 28), 0, 0, 0, Math.PI / 2, 0, 0, 1, 1, 1, o.rim ?? 0x2a2420); });
  if (o.burst) K.at(x, y, z, ry, () => { for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; K.put(Mx.paint, rboxGeo(0.012, k % 2 ? 0.14 : 0.22, 0.012, 0.004), Math.cos(a) * (r + 0.03 + (k % 2 ? 0.07 : 0.11)), Math.sin(a) * (r + 0.03 + (k % 2 ? 0.07 : 0.11)), -0.01, 0, 0, a - Math.PI / 2, 1, 1, 1, 0xc8a050); } });
  const face = mesh(g, circle(r, 32), single((gg, w, h) => clockFace(gg, w, h, o), 256, 256), x, y, z, 0, ry, 0); face.position.add(new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry)).multiplyScalar(0.03));
}
function framed(K, g, x, y, z, ry, w, h, draw, fc = 0xc8a050) {
  K.at(x, y, z, ry, () => { K.box(Mx.paint, -w / 2 - 0.05, w / 2 + 0.05, -h / 2 - 0.05, h / 2 + 0.05, 0, 0.035, fc, 0.012); });
  const m = mesh(g, plane(w, h), single(draw, 256, Math.round(256 * h / w)), x, y, z, 0, ry, 0); m.position.add(new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry)).multiplyScalar(0.037));
}
// generic 4-drawer steel filing cabinet (front faces +z in local frame)
function filingCabinet(K, x, z, ry, c = 0x7d8a78, n = 4) {
  K.at(x, 0, z, ry, () => { const h = n * 0.33 + 0.04; K.box(Mx.paint, -0.24, 0.24, 0.02, h, -0.33, 0.3, c, 0.02);
    for (let k = 0; k < n; k++) { const y0 = 0.06 + k * 0.33; K.box(Mx.paint, -0.22, 0.22, y0, y0 + 0.3, 0.29, 0.32, PT.vary ? c : c, 0.012);
      K.box(Mx.steel, -0.08, 0.08, y0 + 0.16, y0 + 0.19, 0.32, 0.35, 0xe0e0e0, 0.01); K.box(Mx.paint, -0.05, 0.05, y0 + 0.21, y0 + 0.25, 0.32, 0.33, 0xf2ecd8, 0.004); K.box(Mx.steel, -0.06, 0.06, y0 + 0.205, y0 + 0.255, 0.322, 0.328, 0xb0b4b8, 0.003); } });
}

// ================================================================ LAB
function buildLab(g) {
  const K = new Kit(), wallC = 0xc3dcc0, lowC = 0x86a98e;
  // shell: tiles, pale green walls with darker lower band, black base, acoustic ceiling, two fluorescent fixtures
  K.box(Mx.tileLab, -3.4, 3.4, -0.1, 0, -3.1, 7.5, 0xffffff, 0.002, 0.92);
  const hole = [-2.35, -1.1, 1.15, 2.6];
  wallWithHole(K, Mx.wall, wallC, -3.4, 3.4, 1.05, 3.25, -3.25, -3.0, [hole[0], hole[1], 1.05, hole[3]]);
  K.box(Mx.wall, -3.4, 3.4, 0, 1.05, -3.25, -2.98, lowC, 0.004);
  K.box(Mx.paint, -3.4, 3.4, 1.03, 1.08, -3.0, -2.96, 0x5f7f68, 0.008); K.box(Mx.paint, -3.4, 3.4, 0, 0.1, -3.0, -2.96, 0x24222a, 0.006);
  for (const sd of [-1, 1]) { const x = sd * 3.3; K.box(Mx.wall, x - 0.1, x + 0.1, 1.05, 3.25, -3.0, 7.5, wallC, 0.004); K.box(Mx.wall, x - 0.12, x + 0.12, 0, 1.05, -3.0, 7.5, lowC, 0.004);
    K.box(Mx.paint, x - 0.14, x + 0.14, 1.03, 1.08, -3.0, 7.5, 0x5f7f68, 0.008); K.box(Mx.paint, x - 0.14, x + 0.14, 0, 0.1, -3.0, 7.5, 0x24222a, 0.006); }
  K.box(Mx.ceil, -3.4, 3.4, 3.25, 3.35, -3.25, 7.5, 0xc8ccc4, 0.002, 1.2);
  for (const z of [-0.5, 2.6]) { K.box(Mx.paint, -0.75, 0.75, 3.12, 3.25, z - 0.2, z + 0.2, 0xe8e6de, 0.02); K.box(Mx.paint, -0.72, 0.72, 3.1, 3.13, z - 0.17, z + 0.17, 0x9a9a98, 0.005);
    for (const dz of [-0.08, 0.08]) K.put(Mx.glowHi, cyl(0.022, 0.022, 1.36, 8), 0, 3.09, z + dz, 0, 0, Math.PI / 2, 1, 1, 1, 0xeef6ff);
    for (let k = -3; k <= 3; k++) K.box(Mx.paint, k * 0.19 - 0.006, k * 0.19 + 0.006, 3.03, 3.12, z - 0.17, z + 0.17, 0xd8d6ce, 0.002); }
  // window + blinds + striped daylight
  const sh = blindWindow(K, g, { x0: hole[0], x1: hole[1], y0: hole[2], y1: hole[3], z: -3.0, view: skyLab, skyK: 1.9, tilt: 0.6, shaft: { dir: [0.42, -0.62, 1], op: 0.13, floorOp: 0.36 } });
  // radiator under the window
  for (let k = 0; k < 11; k++) K.box(Mx.paint, -2.3 + k * 0.105, -2.23 + k * 0.105, 0.15, 0.85, -2.95, -2.82, 0xd8d4c4, 0.03);
  K.put(Mx.steel, cyl(0.025, 0.025, 1.25, 8), -1.72, 0.17, -2.88, 0, 0, Math.PI / 2, 1, 1, 1, 0xbcbcb8);
  // ---- operating table (long along x), stainless top with rim, pedestal, pump pedal, drape, head rest, small straps
  const TZ = -0.5;
  K.box(Mx.steel, -0.4, 0.4, 0, 0.07, TZ - 0.28, TZ + 0.28, 0xe0e4e8, 0.03); K.put(Mx.steel, cyl(0.1, 0.13, 0.62, 16), 0, 0.38, TZ, 0, 0, 0, 1, 1, 1, 0xd8dce0);
  K.put(Mx.steel, cyl(0.15, 0.15, 0.05, 16), 0, 0.71, TZ, 0, 0, 0, 1, 1, 1, 0xb8bcc0); K.box(Mx.steel, -0.8, 0.8, 0.73, 0.8, TZ - 0.24, TZ + 0.24, 0x9aa0a6, 0.02);
  K.box(Mx.steel, -0.95, 0.95, 0.8, 0.86, TZ - 0.32, TZ + 0.32, 0xeef2f6, 0.025, 1.2, 2);
  for (const sd of [-1, 1]) { K.box(Mx.steel, -0.95, 0.95, 0.86, 0.885, TZ + sd * 0.32 - 0.02, TZ + sd * 0.32 + 0.02, 0xdfe4ea, 0.008); K.box(Mx.steel, sd * 0.95 - 0.02, sd * 0.95 + 0.02, 0.86, 0.885, TZ - 0.32, TZ + 0.32, 0xdfe4ea, 0.008); }
  K.put(Mx.steel, cyl(0.03, 0.03, 0.06, 10), 0.75, 0.86, TZ, 0, 0, 0, 1, 1, 1, 0x6a7078);
  K.box(Mx.paint, 0.3, 0.42, 0.04, 0.07, TZ + 0.22, TZ + 0.46, 0x2a2830, 0.01); K.beam(Mx.steel, [0.36, 0.07, TZ + 0.3], [0.2, 0.4, TZ + 0.12], 0.012, 0xc0c4c8, true, 6);
  K.box(Mx.cloth, -0.92, -0.35, 0.885, 0.9, TZ - 0.3, TZ + 0.3, 0xdfe8ee, 0.006); K.box(Mx.cloth, -0.93, -0.36, 0.6, 0.9, TZ + 0.3, TZ + 0.33, 0xdfe8ee, 0.006);
  K.box(Mx.weave, -0.86, -0.62, 0.9, 0.96, TZ - 0.12, TZ + 0.12, 0xd8e4ec, 0.025);
  for (const x of [-0.1, 0.35]) { K.box(Mx.paint, x - 0.03, x + 0.03, 0.885, 0.893, TZ - 0.31, TZ + 0.31, 0x5a3a2a, 0.003); K.box(Mx.steel, x - 0.035, x + 0.035, 0.885, 0.9, TZ + 0.12, TZ + 0.17, 0xc8ccd0, 0.003); }
  // the "implant" parts laid out on a little steel dish on the table: mic capsule, coil of fine wire, battery, transmitter can
  K.put(Mx.steel, cyl(0.12, 0.1, 0.02, 20), 0.55, 0.895, TZ - 0.08, 0, 0, 0, 1, 1, 1, 0xd0d4d8);
  K.put(Mx.paint, cyl(0.014, 0.014, 0.03, 10), 0.5, 0.92, TZ - 0.11, Math.PI / 2, 0.4, 0, 1, 1, 1, 0x3a3e46); K.put(Mx.paint, tor(0.035, 0.004, 4, 16), 0.6, 0.91, TZ - 0.04, Math.PI / 2, 0, 0, 1, 1, 1, 0xc87a3a);
  K.put(Mx.steel, cyl(0.02, 0.02, 0.05, 10), 0.6, 0.915, TZ - 0.13, 0, 0, Math.PI / 2, 1, 1, 1, 0x8a8f96); K.box(Mx.paint, 0.47, 0.53, 0.905, 0.93, TZ - 0.02, TZ + 0.02, 0x2f6a4a, 0.004);
  K.beam(Mx.paint, [0.5, 0.915, TZ - 0.1], [0.58, 0.912, TZ - 0.05], 0.0025, 0xc87a3a, true, 3);
  // ---- surgical lamp: ceiling mount, arm, big round head tilted toward the room; emissive lenses bloom
  K.put(Mx.paint, cyl(0.12, 0.12, 0.06, 16), 0, 3.22, TZ, 0, 0, 0, 1, 1, 1, 0xe8e6e0); K.beam(Mx.steel, [0, 3.2, TZ], [0, 2.75, TZ], 0.03, 0xdcdcd8, true, 10);
  K.beam(Mx.steel, [0, 2.75, TZ], [0.05, 2.62, TZ + 0.12], 0.025, 0xdcdcd8, true, 10); K.put(Mx.paint, sph(0.05), 0, 2.75, TZ, 0, 0, 0, 1, 1, 1, 0xb8b8b4);
  atM(K, 0.05, 2.48, TZ + 0.16, -0.5, 0, 0, () => {
    K.put(Mx.paint, sph(0.48, 28, 10, 0, Math.PI / 2), 0, 0.02, 0, 0, 0, 0, 1, 0.42, 1, 0xf0eee8); K.put(Mx.paint, tor(0.475, 0.035, 8, 40), 0, 0.02, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8d6d0);
    K.put(Mx.steel, cyl(0.46, 0.46, 0.02, 40), 0, 0.01, 0, 0, 0, 0, 1, 1, 1, 0x5a6068);
    K.put(Mx.glowHi, cyl(0.1, 0.1, 0.03, 20), 0, -0.01, 0, 0, 0, 0, 1, 1, 1, 0xfff0d0);
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; K.put(Mx.steel, cyl(0.12, 0.12, 0.012, 20), Math.cos(a) * 0.29, 0.0, Math.sin(a) * 0.29, 0, 0, 0, 1, 1, 1, 0xd8dce0); K.put(Mx.glowHi, cyl(0.095, 0.095, 0.03, 20), Math.cos(a) * 0.29, -0.012, Math.sin(a) * 0.29, 0, 0, 0, 1, 1, 1, 0xfff0d0); }
    K.put(Mx.steel, cyl(0.035, 0.035, 0.18, 10), 0, -0.1, 0, 0, 0, 0, 1, 1, 1, 0xb0b4b8); K.put(Mx.paint, sph(0.04), 0, -0.2, 0, 0, 0, 0, 1, 1, 1, 0x2a2830);
  });
  // ---- rolling instrument trays (Mayo stands)
  const tray = (x, z, ry, h, items) => K.at(x, 0, z, ry, () => {
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; K.beam(Mx.steel, [0, 0.08, 0], [Math.cos(a) * 0.26, 0.06, Math.sin(a) * 0.26], 0.016, 0xc8ccd0, true, 6); K.put(Mx.paint, sph(0.032), Math.cos(a) * 0.26, 0.032, Math.sin(a) * 0.26, 0, 0, 0, 1, 1, 1, 0x2a2830); }
    K.put(Mx.steel, cyl(0.018, 0.018, h, 8), 0, h / 2 + 0.06, 0, 0, 0, 0, 1, 1, 1, 0xd0d4d8); K.box(Mx.steel, -0.3, 0.3, h + 0.04, h + 0.06, -0.21, 0.21, 0xe6eaee, 0.012);
    for (const sd of [-1, 1]) { K.box(Mx.steel, -0.3, 0.3, h + 0.06, h + 0.09, sd * 0.21 - 0.012, sd * 0.21 + 0.012, 0xdfe4ea, 0.006); K.box(Mx.steel, sd * 0.3 - 0.012, sd * 0.3 + 0.012, h + 0.06, h + 0.09, -0.21, 0.21, 0xdfe4ea, 0.006); }
    items(h + 0.06); });
  tray(0.95, 0.35, -0.3, 0.9, (y) => {
    K.box(Mx.cloth, -0.26, 0.2, y, y + 0.006, -0.17, 0.17, 0x9ec4c8, 0.002);
    for (let k = 0; k < 5; k++) { K.beam(Mx.steel, [-0.2, y + 0.012, -0.12 + k * 0.05], [0.02, y + 0.012, -0.11 + k * 0.05], 0.006, 0xe8ecf0, true, 5); K.box(Mx.steel, 0.02, 0.07, y + 0.006, y + 0.016, -0.115 + k * 0.05, -0.105 + k * 0.05, 0xd0d4d8, 0.003); }
    K.put(Mx.steel, cyl(0.07, 0.05, 0.05, 16), 0.15, y + 0.03, -0.06, 0, 0, 0, 1.5, 1, 1, 0xd8dce0); K.box(Mx.cloth, 0.06, 0.22, y + 0.006, y + 0.04, 0.05, 0.16, 0xf4f4f0, 0.015);
    K.put(Mx.paint, cyl(0.04, 0.04, 0.12, 12), -0.2, y + 0.065, 0.12, 0, 0, 0, 1, 1, 1, 0xd8e8ee); K.put(Mx.paint, cyl(0.042, 0.042, 0.02, 12), -0.2, y + 0.135, 0.12, 0, 0, 0, 1, 1, 1, 0x3a3e46);
    K.put(Mx.paint, cyl(0.009, 0.009, 0.14, 8), -0.05, y + 0.015, 0.1, 0, 0.3, Math.PI / 2, 1, 1, 1, 0xe0ecf4); K.put(Mx.steel, cyl(0.002, 0.002, 0.06, 4), 0.04, y + 0.015, 0.128, 0, 0.3, Math.PI / 2, 1, 1, 1, 0xf0f0f0);
  });
  tray(-1.2, -1.1, 0.5, 0.75, (y) => {
    K.put(Mx.steel, cyl(0.1, 0.08, 0.06, 18), -0.1, y + 0.03, 0, 0, 0, 0, 1, 1, 1, 0xd8dce0); K.put(Mx.paint, cyl(0.06, 0.06, 0.14, 12), 0.15, y + 0.07, -0.05, 0, 0, 0, 1, 1, 1, 0x8a5a3a); K.put(Mx.paint, cyl(0.03, 0.03, 0.03, 10), 0.15, y + 0.15, -0.05, 0, 0, 0, 1, 1, 1, 0x2a2830);
    K.put(Mx.paint, tor(0.07, 0.01, 6, 20), 0.12, y + 0.012, 0.12, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2830); K.box(Mx.paint, -0.25, -0.05, y, y + 0.03, 0.06, 0.18, 0x6a7078, 0.006);
  });
  // ---- equipment racks against the back wall (painted fronts + knob / toggle / lamp geometry)
  const rackMat = single((gg, w, h) => rackFace(gg, w, h, {}), 256, 864);
  const rack = (x0) => { const x1 = x0 + 0.62, xm = (x0 + x1) / 2, w = 0.54, H = 1.9, y0 = 0.12;
    K.box(Mx.paint, x0, x1, 0, 2.15, -2.98, -2.52, 0x4a5250, 0.025); K.box(Mx.paint, x0 + 0.02, x1 - 0.02, 2.15, 2.2, -2.96, -2.54, 0x3a403e, 0.01);
    K.box(Mx.paint, x0, x1, 0, 0.08, -2.98, -2.5, 0x2a2e2c, 0.01);
    mesh(g, plane(w, H), rackMat, xm, y0 + H / 2, -2.515); const ph = H / RACK.length;
    RACK.forEach((p, i) => { const yc = y0 + H - (i + 0.45) * ph;
      for (const u of p.knobs) { const kx = x0 + 0.04 + u * w; K.put(Mx.paint, cyl(0.026, 0.03, 0.03, 14), kx, yc, -2.5, Math.PI / 2, 0, 0, 1, 1, 1, 0x1d1b22); K.put(Mx.paint, rboxGeo(0.006, 0.022, 0.006, 0.002), kx, yc + 0.012, -2.484, 0, 0, (i + u) * 2, 1, 1, 1, 0xf2eee2); }
      for (const u of p.toggles) { const tx = x0 + 0.04 + u * w; K.put(Mx.steel, cyl(0.012, 0.012, 0.012, 8), tx, yc, -2.508, Math.PI / 2, 0, 0, 1, 1, 1, 0xd0d4d8); K.beam(Mx.steel, [tx, yc, -2.5], [tx, yc + (i % 2 ? 0.035 : -0.03), -2.47], 0.0045, 0xe8ecf0, true, 5); }
      for (const u of p.lamps) K.put(Mx.glowHi, sph(0.014, 10, 6), x0 + 0.04 + u * w, yc, -2.506, 0, 0, 0, 1, 1, 1, i % 2 ? 0xff6a3a : 0xffc070); }); };
  rack(-0.95); rack(-0.3);
  // patch cables looping between the rack fronts, and bundles running up and over to the bench
  const wire = (a, b, sag, c, t = 0.007) => { const n = 10; let prev = a; for (let i = 1; i <= n; i++) { const s = i / n, p = [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s - sag * 4 * s * (1 - s), a[2] + (b[2] - a[2]) * s]; K.beam(Mx.paint, prev, p, t, c, true, 4); prev = p; } };
  wire([-0.7, 1.55, -2.48], [0.0, 1.2, -2.48], 0.25, 0xc8302c); wire([-0.55, 0.9, -2.48], [0.1, 0.55, -2.48], 0.18, 0x2a2830); wire([-0.8, 1.2, -2.48], [-0.15, 1.6, -2.48], 0.3, 0xe8c050, 0.006);
  wire([0.25, 2.1, -2.75], [0.9, 1.4, -2.6], 0.2, 0x2a2830, 0.012); wire([0.25, 2.05, -2.7], [1.6, 1.3, -2.6], 0.32, 0x3a3e46, 0.01); wire([-0.05, 0.12, -2.48], [0.0, 0.02, TZ - 0.1], 0.0, 0x2a2830, 0.012);
  wire([0.0, 0.02, TZ - 0.1], [0.05, 0.6, TZ - 0.2], 0.0, 0x2a2830, 0.01);
  // ---- workbench (right half of the back wall) with oscilloscope, reel-to-reel, receiver, soldering kit, headphones
  K.box(Mx.oak, 0.4, 2.95, 0.86, 0.92, -2.98, -2.28, 0xffffff, 0.015, 1.2); for (const x of [0.47, 2.88]) for (const z of [-2.92, -2.36]) K.box(Mx.steel, x - 0.025, x + 0.025, 0, 0.86, z - 0.025, z + 0.025, 0x8a9096, 0.01);
  K.box(Mx.steel, 0.45, 2.9, 0.18, 0.21, -2.95, -2.3, 0x9aa0a6, 0.008); for (let k = 0; k < 4; k++) K.box(Mx.paint, 0.55 + k * 0.57, 0.95 + k * 0.57, 0.21, 0.36 + (k % 2) * 0.08, -2.85, -2.45, [0x6a5a4a, 0x7d8a78, 0x5a4a6a, 0x8a6a3a][k], 0.02);
  // oscilloscope
  K.box(Mx.paint, 1.42, 1.86, 0.92, 1.28, -2.92, -2.4, 0x5d6f80, 0.03); K.box(Mx.paint, 1.44, 1.84, 0.94, 1.26, -2.41, -2.38, 0x3a4450, 0.01);
  K.box(Mx.paint, 1.47, 1.7, 1.0, 1.21, -2.385, -2.37, 0x1d1b22, 0.015); mesh(g, plane(0.19, 0.17), unlit(scope, 256, 224, 2.3), 1.585, 1.105, -2.365);
  for (const [x, y] of [[1.76, 1.19], [1.76, 1.11], [1.76, 1.03], [1.52, 0.96], [1.62, 0.96]]) K.put(Mx.paint, cyl(0.016, 0.019, 0.02, 12), x, y, -2.37, Math.PI / 2, 0, 0, 1, 1, 1, 0x1d1b22);
  K.put(Mx.glowHi, sph(0.008, 8, 6), 1.81, 1.22, -2.375, 0, 0, 0, 1, 1, 1, 0xff4a2a); K.beam(Mx.paint, [1.52, 0.97, -2.36], [1.3, 0.93, -2.0], 0.006, 0x2a2830, true, 4);
  // reel-to-reel deck (upright), two reels, tape path, VU meter glow
  K.box(Mx.paint, 0.55, 1.15, 0.92, 1.56, -2.8, -2.52, 0x8a8478, 0.03); K.box(Mx.paint, 0.58, 1.12, 0.95, 1.53, -2.53, -2.51, 0xd8d0bc, 0.01); K.box(Mx.paint, 0.58, 1.12, 0.95, 1.08, -2.515, -2.5, 0x2a2830, 0.01);
  for (const x of [0.7, 1.0]) { K.put(Mx.paint, cyl(0.12, 0.12, 0.012, 28), x, 1.33, -2.49, Math.PI / 2, 0, 0, 1, 1, 1, 0xc8ccd0); K.put(Mx.paint, cyl(x < 0.8 ? 0.085 : 0.055, x < 0.8 ? 0.085 : 0.055, 0.016, 24), x, 1.33, -2.484, Math.PI / 2, 0, 0, 1, 1, 1, 0x4a3426);
    K.put(Mx.paint, cyl(0.022, 0.022, 0.03, 10), x, 1.33, -2.48, Math.PI / 2, 0, 0, 1, 1, 1, 0x1d1b22); for (let k = 0; k < 3; k++) { const a = k * 2.094 + x * 3; K.put(Mx.paint, cyl(0.025, 0.025, 0.004, 10), x + Math.cos(a) * 0.065, 1.33 + Math.sin(a) * 0.065, -2.475, Math.PI / 2, 0, 0, 1, 1, 1, 0x8a8f96); } }
  K.box(Mx.paint, 0.78, 0.92, 1.14, 1.2, -2.5, -2.47, 0x4a4e52, 0.008); K.beam(Mx.paint, [0.62, 1.29, -2.479], [0.79, 1.17, -2.479], 0.003, 0x4a3426, false); K.beam(Mx.paint, [0.91, 1.17, -2.479], [1.06, 1.29, -2.479], 0.003, 0x4a3426, false);
  for (const x of [0.66, 0.8]) { K.box(Mx.glowLo, x, x + 0.1, 0.99, 1.05, -2.5, -2.495, 0xffd890, 0.004); } for (const x of [0.95, 1.02, 1.09]) K.put(Mx.paint, cyl(0.016, 0.016, 0.02, 10), x, 1.02, -2.5, Math.PI / 2, 0, 0, 1, 1, 1, 0x1d1b22);
  // radio receiver box, soldering iron stand, spools, headphones, notebook
  K.box(Mx.paint, 2.0, 2.6, 0.92, 1.18, -2.9, -2.5, 0x6a5848, 0.025); K.box(Mx.paint, 2.04, 2.4, 0.97, 1.13, -2.505, -2.49, 0xe8dcc0, 0.01); K.box(Mx.glowLo, 2.08, 2.36, 1.02, 1.08, -2.49, -2.485, 0xffcf80, 0.004); K.put(Mx.paint, cyl(0.035, 0.035, 0.03, 16), 2.5, 1.05, -2.49, Math.PI / 2, 0, 0, 1, 1, 1, 0x1d1b22);
  K.put(Mx.paint, tor(0.08, 0.016, 8, 20, Math.PI), 2.3, 1.18, -2.7, 0, 0.2, 0, 1, 1, 1, 0x2a2830); for (const sd of [-1, 1]) K.put(Mx.paint, cyl(0.04, 0.04, 0.03, 14), 2.3 + sd * 0.08, 1.16, -2.7, 0, 0.2, Math.PI / 2, 1, 1, 1, 0x3a2a2a);
  K.put(Mx.paint, cyl(0.05, 0.05, 0.06, 14), 2.75, 0.95, -2.45, Math.PI / 2, 0, 0, 1, 1, 1, 0xc87a3a); K.put(Mx.paint, cyl(0.045, 0.045, 0.06, 14), 2.62, 0.95, -2.4, Math.PI / 2, 0, 0, 1, 1, 1, 0xc8302c);
  K.put(Mx.steel, tor(0.03, 0.004, 4, 12), 1.3, 0.95, -2.6, 0, 0, 0, 1, 1, 1, 0xc0c4c8); K.beam(Mx.paint, [1.2, 0.93, -2.55], [1.35, 1.02, -2.62], 0.01, 0x8a3a2a, true, 6); K.beam(Mx.steel, [1.35, 1.02, -2.62], [1.42, 1.07, -2.66], 0.003, 0xc0c4c8, true, 4);
  K.put(Mx.paint, rboxGeo(0.22, 0.015, 0.3, 0.004), 1.95, 0.928, -2.42, 0, 0.3, 0, 1, 1, 1, 0xf2ecd8); K.beam(Mx.paint, [1.88, 0.94, -2.4], [2.02, 0.94, -2.45], 0.004, 0x2a2830, true, 4);
  // chalkboard over the bench
  K.box(Mx.oak, 0.45, 2.95, 1.38, 2.62, -3.0, -2.95, 0x8a6a4a, 0.012); mesh(g, plane(2.4, 1.14), single(chalk, 1024, 486), 1.7, 2.0, -2.945);
  K.box(Mx.oak, 0.48, 2.92, 1.36, 1.4, -2.95, -2.88, 0x8a6a4a, 0.008); K.box(Mx.paint, 0.9, 0.98, 1.4, 1.42, -2.93, -2.9, 0xf4f4ec, 0.004); K.box(Mx.paint, 1.2, 1.33, 1.4, 1.44, -2.93, -2.89, 0x6a4a3a, 0.008);
  // filing cabinet against the right wall + coffee mug + folders, NO SMOKING sign, clock, notice board
  filingCabinet(K, 2.86, -1.6, -Math.PI / 2, 0x7d8a78); K.put(Mx.paint, cyl(0.045, 0.04, 0.1, 12), 2.86, 1.42, -1.5, 0, 0, 0, 1, 1, 1, 0xf2eee2);
  for (let k = 0; k < 4; k++) K.put(Mx.paint, rboxGeo(0.24, 0.012, 0.32, 0.003), 2.85, 1.38 + k * 0.014, -1.82, 0, 0.1 * (k % 2 ? 1 : -1), 0, 1, 1, 1, [0xd8b878, 0xe0c488, 0xc8a868, 0xd8b878][k]);
  mesh(g, plane(0.6, 0.22), signMat('NO SMOKING', '#c8302c', '#f4efe6', { h: 220 }), 0.0, 2.6, -2.995);
  clock(K, g, 3.19, 2.55, 0.6, -Math.PI / 2, 0.17);
  K.box(Mx.paint, 3.17, 3.2, 1.4, 2.2, 1.4, 2.4, 0xa88a5a, 0.01); [[1.55, 1.95, 1.62, 3], [1.78, 2.2, 1.7, 4], [2.02, 1.7, 1.66, 5]].forEach(([z, y, , s], i) => mesh(g, plane(0.24, 0.32), single((gg, w, h) => notice(gg, w, h, { seed: s, t: ['MEMO', 'TEST LOG', 'ROSTER'][i] }), 128, 170), 3.165, y, z, 0, -Math.PI / 2, (i - 1) * 0.06));
  // stool + a stack of cable spools + a lab coat on a hook (left wall)
  K.at(-0.6, 0, 0.7, 0, () => { K.put(Mx.paint, cyl(0.19, 0.19, 0.06, 20), 0, 0.66, 0, 0, 0, 0, 1, 1, 1, 0x2f3a46); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4; K.beam(Mx.steel, [Math.cos(a) * 0.12, 0.64, Math.sin(a) * 0.12], [Math.cos(a) * 0.22, 0, Math.sin(a) * 0.22], 0.014, 0xc8ccd0, true, 6); } K.put(Mx.steel, tor(0.17, 0.008, 4, 20), 0, 0.25, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0xc8ccd0); });
  K.put(Mx.oak, cyl(0.25, 0.25, 0.05, 20), 2.4, 0.025, 0.4, 0, 0, 0, 1, 1, 1, 0xa8844a); K.put(Mx.paint, cyl(0.17, 0.17, 0.2, 20), 2.4, 0.15, 0.4, 0, 0, 0, 1, 1, 1, 0x2a2830); K.put(Mx.oak, cyl(0.25, 0.25, 0.05, 20), 2.4, 0.275, 0.4, 0, 0, 0, 1, 1, 1, 0xa8844a);
  K.beam(Mx.paint, [2.3, 0.2, 0.55], [1.8, 0.01, 1.1], 0.01, 0x2a2830, true, 4);
  K.box(Mx.steel, -3.2, -3.17, 1.9, 1.94, -0.4, 0.6, 0xc0c4c8, 0.008); for (const z of [-0.2, 0.35]) K.box(Mx.steel, -3.2, -3.1, 1.86, 1.94, z - 0.015, z + 0.015, 0xc0c4c8, 0.005);
  K.at(-3.08, 0, 0.35, Math.PI / 2, () => { K.box(Mx.cloth, -0.24, 0.24, 0.85, 1.85, -0.05, 0.05, 0xf2f2ee, 0.04); K.box(Mx.cloth, -0.28, -0.18, 1.2, 1.82, -0.06, 0.06, 0xeaeae6, 0.04); K.box(Mx.cloth, 0.18, 0.28, 1.2, 1.82, -0.06, 0.06, 0xeaeae6, 0.04); K.box(Mx.paint, -0.05, 0.05, 1.5, 1.6, 0.05, 0.06, 0x24406a, 0.003); });
  // TOP SECRET crate (front left) + a second smaller crate on it
  const crateM = single(crateFront, 512, 384);
  K.at(-0.3, 0, 2.4, 0.3, () => { K.box(Mx.oak, -0.42, 0.42, 0, 0.6, -0.3, 0.3, 0xd8b890, 0.02, 0.6); K.box(Mx.oak, -0.44, 0.44, 0.6, 0.63, -0.32, 0.32, 0xc8a070, 0.01, 0.6);
    K.box(Mx.oak, -0.25, 0.15, 0.63, 0.88, -0.2, 0.15, 0xc8a070, 0.015, 0.6); });
  { const m = mesh(g, plane(0.84, 0.6), crateM, 0, 0, 0); m.position.set(-0.3 + Math.sin(0.3) * 0.302, 0.3, 2.4 + Math.cos(0.3) * 0.302); m.rotation.y = 0.3; }
  // cat corner (front right): plaid cushion bed, enamel food bowl with kibble, a tin of cat food
  const bedM = toon({ map: mkTex(256, 256, (gg, w, h) => PT.fabric(gg, w, h, { base: '#b5423a', stripes: '#e8d8b0', nStripes: 10, folds: 2 }), [3, 1]) });
  mesh(g, tor(0.26, 0.1, 10, 28), bedM, 0.95, 0.08, 1.75, Math.PI / 2, 0, 0).scale.set(1, 1, 0.75);
  K.put(Mx.weave, cyl(0.27, 0.28, 0.07, 24), 0.95, 0.035, 1.75, 0, 0, 0, 1, 1, 1, 0xd8c8a8);
  catBowl(K, 0.45, 2.05, 0x2f5a8a, 1.0);
  K.put(Mx.paint, cyl(0.04, 0.04, 0.07, 14), 1.35, 0.035, 1.6, 0, 0, 0, 1, 1, 1, 0xc8302c); K.put(Mx.steel, cyl(0.041, 0.041, 0.012, 14), 1.35, 0.072, 1.6, 0, 0, 0, 1, 1, 1, 0xd0d4d8);
  K.build(g);
  return { TZ, shafts: sh };
}
// enamel bowl with a heap of kibble
function catBowl(K, x, z, rim, full = 1) {
  K.put(Mx.paint, lathe('bowl', [[0, 0], [0.07, 0], [0.085, 0.012], [0.1, 0.05], [0.11, 0.055], [0.1, 0.058], [0.088, 0.02], [0, 0.015]], 24), x, 0, z, 0, 0, 0, 1, 1, 1, 0xf2eee2);
  K.put(Mx.paint, tor(0.105, 0.007, 5, 24), x, 0.056, z, Math.PI / 2, 0, 0, 1, 1, 1, rim);
  if (full) for (let k = 0; k < 16; k++) { const a = k * 2.4, rr = 0.065 * Math.sqrt((k + 0.5) / 16); K.put(Mx.paint, sph(0.016, 6, 4), x + Math.cos(a) * rr, 0.035 + 0.02 * (1 - rr / 0.065), z + Math.sin(a) * rr, 0, k, 0, 1, 0.7, 1, k % 3 ? 0x8a5a34 : 0x6a4026); }
}

// ================================================================ OFFICE (1967)
function buildOffice(g, ctx) {
  const K = new Kit();
  K.box(Mx.carpet, -3.4, 3.4, -0.1, 0, -3.1, 7.5, 0xffffff, 0.002, 1.0);
  const hole = [-2.55, -1.35, 1.0, 2.35];
  wallWithHole(K, Mx.panel, 0xffffff, -3.4, 3.4, 0, 2.95, -3.25, -3.0, hole, 0.004, 1.4);
  for (const sd of [-1, 1]) K.box(Mx.panel, sd * 3.3 - 0.1, sd * 3.3 + 0.1, 0, 2.95, -3.0, 7.5, 0xf0e8e0, 0.004, 1.4);
  K.box(Mx.wall, -3.4, 3.4, 2.95, 3.05, -3.25, 7.5, 0xf2eee4, 0.002, 1.2);
  for (const z of [-3.0]) { K.box(Mx.paint, -3.4, 3.4, 2.82, 2.95, z, z + 0.06, 0x4a2a1a, 0.02); K.box(Mx.paint, -3.4, 3.4, 0, 0.12, z, z + 0.04, 0x3a2216, 0.01); }
  for (const sd of [-1, 1]) { K.box(Mx.paint, sd * 3.2 - 0.06, sd * 3.2 + 0.06, 2.82, 2.95, -3.0, 7.5, 0x4a2a1a, 0.02); K.box(Mx.paint, sd * 3.2 - 0.04, sd * 3.2 + 0.04, 0, 0.12, -3.0, 7.5, 0x3a2216, 0.01); }
  // ceiling fixture (glass drum)
  K.put(Mx.glow, cyl(0.32, 0.36, 0.12, 24), 0, 2.88, -0.4, 0, 0, 0, 1, 1, 1, 0xfff0d8); K.put(Mx.steel, cyl(0.05, 0.05, 0.03, 10), 0, 2.81, -0.4, 0, 0, 0, 1, 1, 1, 0xc8a050);
  blindWindow(K, g, { x0: hole[0], x1: hole[1], y0: hole[2], y1: hole[3], z: -3.0, view: skyLab, skyK: 1.6, slat: 0xe8e2d0, frame: 0x5a3420, tilt: 0.7, shaft: { dir: [0.5, -0.55, 1], op: 0.09, floorOp: 0.22, col: '#fff0d0' } });
  // credenza against the back wall + things on it
  K.box(Mx.panel, -1.2, 1.2, 0.08, 0.72, -2.95, -2.45, 0xb08a70, 0.02, 1.4); K.box(Mx.panel, -1.24, 1.24, 0.72, 0.76, -2.97, -2.42, 0x9a7058, 0.015, 1.4); K.box(Mx.paint, -1.15, 1.15, 0, 0.08, -2.9, -2.5, 0x2a1a14, 0.01);
  for (const x of [-0.6, 0.6]) { K.box(Mx.paint, x - 0.57, x + 0.57, 0.12, 0.68, -2.45, -2.44, 0x5a3420, 0.008); K.box(Mx.steel, x - 0.03, x + 0.03, 0.36, 0.46, -2.44, -2.42, 0xc8a050, 0.005); }
  for (let k = 0; k < 6; k++) K.put(Mx.paint, rboxGeo(0.26, 0.018, 0.33, 0.004), -0.85, 0.77 + k * 0.02, -2.7, 0, (k % 3 - 1) * 0.08, 0, 1, 1, 1, [0xd8b878, 0xe2c88a, 0xc8a868][k % 3]);
  K.put(Mx.paint, cyl(0.17, 0.17, 0.03, 20), 0.6, 0.775, -2.7, 0, 0, 0, 1, 1, 1, 0x3a2a20); K.put(Mx.paint, sph(0.17, 18, 12), 0.6, 1.07, -2.7, 0, 0, 0, 1, 1, 1, 0x6a90a8); K.put(Mx.paint, tor(0.19, 0.008, 4, 30, Math.PI), 0.6, 1.07, -2.7, 0, 0.5, Math.PI / 2, 1, 1, 1, 0xc8a050); K.put(Mx.paint, cyl(0.012, 0.012, 0.12, 6), 0.6, 0.84, -2.7, 0, 0, 0, 1, 1, 1, 0xc8a050);
  K.box(Mx.paint, 0.05, 0.27, 0.76, 1.0, -2.75, -2.73, 0xc8a050, 0.008);
  // flag stand (back right): weighted base, brass pole with ball finial, draped plain flag
  const FX = 1.5, FZ = -2.5;
  K.put(Mx.steel, cyl(0.2, 0.24, 0.06, 20), FX, 0.03, FZ, 0, 0, 0, 1, 1, 1, 0xc8a050); K.put(Mx.steel, cyl(0.016, 0.02, 2.35, 10), FX, 1.2, FZ, 0, 0, 0, 1, 1, 1, 0xd8b060); K.put(Mx.steel, sph(0.045), FX, 2.42, FZ, 0, 0, 0, 1, 1, 1, 0xe8c070);
  { const fg = new THREE.PlaneGeometry(1, 1, 14, 6), p = fg.attributes.position, uvA = fg.attributes.uv; for (let i = 0; i < p.count; i++) { const u = uvA.getX(i), v = uvA.getY(i); const y = 2.32 - (1 - v) * 0.85 - u * u * 0.95, x = u * 0.42, z = 0.08 * Math.sin(u * Math.PI * 4.5) * u; p.setXYZ(i, x, y, z); } fg.computeVertexNormals();
    mesh(g, fg, toon({ map: tex(512, 320, flag), side: THREE.DoubleSide }), FX + 0.015, 0, FZ, 0, -2.1, 0); }
  // framed pictures, clock, bookshelf (left wall), coat rack with trench coat and fedora
  framed(K, g, 0.75, 1.75, -3.0, 0, 0.9, 0.6, (gg, w, h) => picture(gg, w, h, { seed: 3, sky: '#b8c8d8', low: '#e8d8b0', hill: '#5a7a5a', boat: true }));
  framed(K, g, -0.4, 1.85, -3.0, 0, 0.36, 0.46, (gg, w, h) => picture(gg, w, h, { portrait: true, sky: '#d8ccb0', low: '#b8a888', fig: '#4a3a4a' }), 0x2a1a14);
  clock(K, g, -0.4, 2.45, -3.0, 0, 0.16, { ticks: true, rim: 0x2a1a14 });
  K.box(Mx.panel, -3.2, -2.75, 0, 2.2, -1.2, 0.3, 0x8a6a58, 0.02, 1.4); for (let r = 0; r < 4; r++) { const y = 0.3 + r * 0.5; K.box(Mx.panel, -3.18, -2.77, y - 0.03, y, -1.15, 0.25, 0xa07a60, 0.008, 1.4); K.put(Mx.books, rboxGeo(0.32, 0.4, 1.36, 0.004, [1.36, 0.4]), -2.98, y + 0.2, -0.45, 0, Math.PI / 2, 0, 1, 1, 1, 0xffffff); }
  K.at(-2.4, 0, 0.9, 0, () => { K.put(Mx.paint, cyl(0.025, 0.03, 1.85, 8), 0, 0.93, 0, 0, 0, 0, 1, 1, 1, 0x3a2216); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.3; K.beam(Mx.paint, [0, 0.12, 0], [Math.cos(a) * 0.28, 0.0, Math.sin(a) * 0.28], 0.02, 0x3a2216, true, 5); K.beam(Mx.paint, [0, 1.72, 0], [Math.cos(a) * 0.17, 1.83, Math.sin(a) * 0.17], 0.012, 0x3a2216, true, 4); }
    K.box(Mx.cloth, -0.2, 0.2, 0.75, 1.72, 0.04, 0.2, 0xb89a6a, 0.06); K.box(Mx.cloth, -0.22, -0.12, 1.25, 1.7, 0.05, 0.22, 0xa88a5a, 0.05); K.box(Mx.paint, -0.18, 0.18, 1.1, 1.14, 0.18, 0.22, 0x8a6a3a, 0.01);
    K.put(Mx.paint, cyl(0.13, 0.12, 0.1, 18), 0.05, 1.93, 0.05, 0.1, 0, 0.15, 1, 1, 1, 0x4a4a52); K.put(Mx.paint, cyl(0.2, 0.2, 0.012, 22), 0.05, 1.88, 0.05, 0.1, 0, 0.15, 1, 1, 1, 0x4a4a52); K.put(Mx.paint, cyl(0.131, 0.131, 0.025, 18), 0.05, 1.9, 0.05, 0.1, 0, 0.15, 1, 1, 1, 0x2a2420); });
  filingCabinet(K, 2.95, -1.4, -Math.PI / 2, 0x8a9488); filingCabinet(K, 2.95, -0.85, -Math.PI / 2, 0x8a9488); K.put(Mx.leaf || Mx.paint, cyl(0.12, 0.09, 0.2, 12), 2.95, 1.47, -1.1, 0, 0, 0, 1, 1, 1, 0x8a5a3a);
  for (let k = 0; k < 5; k++) K.put(Mx.paint, sph(0.1, 8, 6), 2.95 + Math.cos(k * 1.3) * 0.09, 1.66 + (k % 2) * 0.06, -1.1 + Math.sin(k * 1.3) * 0.09, 0, k, 0, 1, 0.75, 1, 0x3f7a42);
  // ---- desk: big walnut executive desk; top centre z = -0.5, surface y = 0.77
  const DY = 0.77, dk = 0x5e3a24;
  K.box(Mx.panel, -1.2, 1.2, DY - 0.05, DY, -1.05, 0.0, 0xc89a80, 0.03, 1.4, 2); K.box(Mx.paint, -1.17, 1.17, DY - 0.08, DY - 0.05, -1.02, -0.03, dk, 0.01);
  for (const sd of [-1, 1]) { K.box(Mx.panel, sd * 0.85 - 0.3, sd * 0.85 + 0.3, 0.04, DY - 0.08, -1.0, -0.06, 0xb08a70, 0.025, 1.4); K.box(Mx.paint, sd * 0.85 - 0.3, sd * 0.85 + 0.3, 0, 0.04, -0.98, -0.08, 0x2a1a14, 0.01);
    for (let k = 0; k < 3; k++) { const y0 = 0.08 + k * 0.2; K.box(Mx.panel, sd * 0.85 - 0.27, sd * 0.85 + 0.27, y0, y0 + 0.18, -0.065, -0.04, 0xd0a888, 0.012, 1.4); K.box(Mx.steel, sd * 0.85 - 0.07, sd * 0.85 + 0.07, y0 + 0.08, y0 + 0.1, -0.04, -0.02, 0xc8a050, 0.006); } }
  K.box(Mx.panel, -0.55, 0.55, 0.3, DY - 0.08, -0.95, -0.9, 0xa07a60, 0.01, 1.4);
  // blotter + memo spot
  K.box(Mx.paint, -0.42, 0.42, DY, DY + 0.006, -0.82, -0.18, 0x2f5a3e, 0.003); for (const sd of [-1, 1]) K.box(Mx.paint, sd * 0.42 - 0.05, sd * 0.42 + 0.05, DY, DY + 0.009, -0.83, -0.17, 0x3a2216, 0.003);
  const memoTex = [mkTex(512, 680, (gg, w, h) => paintMemo(gg, w, h, false)), mkTex(512, 680, (gg, w, h) => paintMemo(gg, w, h, true))];
  const doc = mesh(g, new THREE.PlaneGeometry(0.3, 0.4), toon({ map: memoTex[0] }), 0.0, DY + 0.009, -0.48, -Math.PI / 2, 0, 0); doc.rotation.set(-Math.PI / 2, 0, 0.06); doc.castShadow = false;
  // green banker's lamp (left)
  const LX = -0.74, LZ = -0.78;
  K.put(Mx.steel, cyl(0.1, 0.12, 0.03, 18), LX, DY + 0.015, LZ, 0, 0, 0, 1.4, 1, 1, 0xc8a050); K.put(Mx.steel, cyl(0.012, 0.012, 0.3, 8), LX, DY + 0.18, LZ, 0, 0, 0, 1, 1, 1, 0xc8a050);
  K.beam(Mx.steel, [LX, DY + 0.33, LZ], [LX, DY + 0.36, LZ + 0.05], 0.01, 0xc8a050, true, 6); K.beam(Mx.steel, [LX + 0.03, DY + 0.03, LZ + 0.06], [LX + 0.03, DY + 0.14, LZ + 0.06], 0.004, 0xc8a050, true, 4);
  K.put(Mx.greenGlass, cyl(0.11, 0.11, 0.42, 20, true, 0, Math.PI), LX, DY + 0.36, LZ + 0.05, 0, 0, Math.PI / 2, 1, 1, 1, 0xffffff); for (const sd of [-1, 1]) K.put(Mx.steel, cyl(0.112, 0.112, 0.012, 20, false, 0, Math.PI), LX + sd * 0.21, DY + 0.36, LZ + 0.05, 0, 0, Math.PI / 2, 1, 1, 1, 0xc8a050);
  K.put(Mx.glowHi, cyl(0.016, 0.016, 0.34, 8), LX, DY + 0.33, LZ + 0.05, 0, 0, Math.PI / 2, 1, 1, 1, 0xfff0c8); K.box(Mx.glow, LX - 0.17, LX + 0.17, DY + 0.27, DY + 0.275, LZ + 0.0, LZ + 0.1, 0xffe8b0, 0.002);
  // typewriter (right), with a sheet in the platen
  K.at(0.68, DY, -0.5, -0.32, () => { K.box(Mx.paint, -0.22, 0.22, 0, 0.1, -0.18, 0.16, 0x4a5a52, 0.035); K.box(Mx.paint, -0.2, 0.2, 0.1, 0.16, -0.18, -0.02, 0x4a5a52, 0.03);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 11; c++) K.put(Mx.paint, cyl(0.011, 0.011, 0.012, 10), -0.15 + c * 0.03 + r * 0.008, 0.105 + (3 - r) * 0.012, 0.13 - r * 0.032, -0.25, 0, 0, 1, 1, 1, 0x1d1b22);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 11; c++) K.put(Mx.paint, cyl(0.0085, 0.0085, 0.004, 10), -0.15 + c * 0.03 + r * 0.008, 0.113 + (3 - r) * 0.012, 0.132 - r * 0.032, -0.25, 0, 0, 1, 1, 1, 0xf2eee2);
    K.box(Mx.paint, -0.09, 0.09, 0.075, 0.09, 0.15, 0.17, 0x1d1b22, 0.006);
    K.put(Mx.paint, cyl(0.03, 0.03, 0.5, 14), 0, 0.17, -0.12, 0, 0, Math.PI / 2, 1, 1, 1, 0x1d1b22); for (const sd of [-1, 1]) K.put(Mx.paint, cyl(0.035, 0.035, 0.03, 12), sd * 0.27, 0.17, -0.12, 0, 0, Math.PI / 2, 1, 1, 1, 0x3a3e42);
    K.beam(Mx.steel, [-0.27, 0.19, -0.1], [-0.33, 0.22, -0.02], 0.007, 0xd0d4d8, true, 5);
    K.put(Mx.paint, rboxGeo(0.21, 0.26, 0.003, 0.001), 0, 0.3, -0.155, -0.18, 0, 0, 1, 1, 1, 0xf4efe0); });
  // rotary phone (back right of the desk)
  K.at(0.82, DY, -0.9, -0.5, () => { K.put(Mx.paint, lathe('phone', [[0, 0], [0.11, 0], [0.11, 0.02], [0.095, 0.08], [0.07, 0.1], [0, 0.105]], 20), 0, 0, 0, 0, 0, 0, 1.2, 1, 1, 0x1d1b22);
    K.put(Mx.paint, cyl(0.06, 0.06, 0.012, 24), 0, 0.085, 0.07, 0.5, 0, 0, 1, 1, 1, 0x1d1b22);
    for (const sd of [-1, 1]) K.box(Mx.paint, sd * 0.09 - 0.015, sd * 0.09 + 0.015, 0.09, 0.13, -0.03, 0.01, 0x1d1b22, 0.008);
    K.beam(Mx.paint, [-0.11, 0.14, -0.01], [0.11, 0.14, -0.01], 0.022, 0x1d1b22, false); for (const sd of [-1, 1]) K.put(Mx.paint, sph(0.042, 12, 8), sd * 0.13, 0.135, -0.01, 0, 0, 0, 1.1, 0.8, 1.2, 0x1d1b22);
    let prev = [0.11, 0.03, -0.05]; for (let k = 1; k <= 24; k++) { const t = k / 24, p = [0.11 + t * 0.12 + 0.012 * Math.cos(k * 2.2), 0.02 + 0.012 * Math.sin(k * 2.2), -0.05 + t * 0.08]; K.beam(Mx.paint, prev, p, 0.004, 0x1d1b22, true, 3); prev = p; } });
  { const dm = mesh(g, circle(0.055, 28), single(dialFace, 256, 256), 0, 0, 0); const m = new THREE.Object3D(); m.position.set(0.82, DY, -0.9); m.rotation.y = -0.5; m.updateMatrix(); const p = new THREE.Vector3(0, 0.0925, 0.073).applyMatrix4(m.matrix); dm.position.copy(p); dm.rotation.set(-Math.PI / 2 + 0.5, -0.5, 0, 'YXZ'); dm.castShadow = false; }
  // folder stacks, in/out trays, pen set, a coffee cup, a pencil cup
  for (let k = 0; k < 7; k++) K.put(Mx.paint, rboxGeo(0.25, 0.016, 0.32, 0.004), -0.75 + (k % 2) * 0.01, DY + 0.008 + k * 0.017, -0.28 - (k % 3) * 0.006, 0, 0.12 + (k % 3 - 1) * 0.06, 0, 1, 1, 1, [0xd8b878, 0xe2c88a, 0xc8a868, 0xb8c8d8][k % 4]);
  K.put(Mx.paint, rboxGeo(0.2, 0.006, 0.07, 0.002), -0.74, DY + 0.13, -0.3, 0, 0.18, 0, 1, 1, 1, 0xc8302c);
  for (let t = 0; t < 2; t++) { const y = DY + t * 0.09; K.box(Mx.steel, 0.25, 0.55, y, y + 0.012, -1.0, -0.72, 0x9aa0a6, 0.004); for (const [a, b] of [[0.25, 0.262], [0.538, 0.55]]) K.box(Mx.steel, a, b, y, y + 0.07, -1.0, -0.72, 0x9aa0a6, 0.003); if (t === 0) for (const z of [-0.99, -0.73]) K.box(Mx.steel, 0.25, 0.55, y, y + 0.03, z - 0.006, z + 0.006, 0x9aa0a6, 0.003); }
  for (let k = 0; k < 3; k++) K.put(Mx.paint, rboxGeo(0.22, 0.004, 0.27, 0.001), 0.4, DY + 0.015 + k * 0.006, -0.86, 0, (k - 1) * 0.05, 0, 1, 1, 1, 0xf2ecd8);
  K.box(Mx.paint, -0.25, 0.05, DY, DY + 0.03, -0.98, -0.88, 0x2a2420, 0.01); for (const sd of [-1, 1]) K.beam(Mx.paint, [-0.1 + sd * 0.07, DY + 0.03, -0.93], [-0.1 + sd * 0.1, DY + 0.18, -0.88], 0.006, 0x1d1b22, true, 5);
  K.put(Mx.paint, cyl(0.04, 0.035, 0.1, 12), -0.45, DY + 0.05, -0.95, 0, 0, 0, 1, 1, 1, 0x3a2a20); for (let k = 0; k < 4; k++) K.beam(Mx.paint, [-0.45, DY + 0.05, -0.95], [-0.45 + Math.cos(k * 1.7) * 0.03, DY + 0.18, -0.95 + Math.sin(k * 1.7) * 0.03], 0.004, [0xe8c050, 0xc8302c, 0x24406a, 0xe8c050][k], true, 5);
  K.put(Mx.paint, lathe('cup', [[0, 0], [0.035, 0], [0.04, 0.08], [0.036, 0.082], [0, 0.07]], 16), 0.38, DY, -0.25, 0, 0, 0, 1, 1, 1, 0xf2eee2); K.put(Mx.paint, tor(0.022, 0.006, 4, 12, Math.PI), 0.418, DY + 0.045, -0.25, 0, 0, -Math.PI / 2, 1, 1, 1, 0xf2eee2);
  // chairs: high-back leather swivel behind, a guest chair in the foreground
  K.at(0, 0, -1.55, 0, () => { for (let k = 0; k < 5; k++) { const a = k * 1.2566; K.beam(Mx.steel, [0, 0.08, 0], [Math.cos(a) * 0.3, 0.04, Math.sin(a) * 0.3], 0.02, 0x9aa0a6, false); K.put(Mx.paint, sph(0.03), Math.cos(a) * 0.3, 0.03, Math.sin(a) * 0.3, 0, 0, 0, 1, 1, 1, 0x1d1b22); }
    K.put(Mx.steel, cyl(0.03, 0.03, 0.36, 8), 0, 0.26, 0, 0, 0, 0, 1, 1, 1, 0xb0b4b8); K.box(Mx.paint, -0.3, 0.3, 0.44, 0.56, -0.28, 0.28, 0x5a2420, 0.06, 2, 2); K.box(Mx.paint, -0.3, 0.3, 0.56, 1.35, -0.34, -0.2, 0x5a2420, 0.08, 2, 2);
    for (let k = 0; k < 4; k++) K.put(Mx.paint, sph(0.012, 6, 4), -0.2 + k * 0.13, 1.1, -0.195, 0, 0, 0, 1, 1, 1, 0xc8a050); for (const sd of [-1, 1]) K.box(Mx.paint, sd * 0.31 - 0.04, sd * 0.31 + 0.04, 0.6, 0.66, -0.24, 0.2, 0x3a1a18, 0.03); });
  K.at(-1.05, 0, 1.15, 0.7, () => { K.box(Mx.paint, -0.27, 0.27, 0.42, 0.5, -0.25, 0.25, 0x4a5a6a, 0.04, 2, 2); K.box(Mx.paint, -0.27, 0.27, 0.5, 0.95, -0.27, -0.18, 0x4a5a6a, 0.05, 2, 2); for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.beam(Mx.steel, [a * 0.22, 0.42, b * 0.2], [a * 0.25, 0, b * 0.24], 0.014, 0xc8ccd0, true, 6); });
  K.put(Mx.paint, cyl(0.15, 0.13, 0.36, 14, true), 1.45, 0.18, -0.6, 0, 0, 0, 1, 1, 1, 0x5a6a5a); for (let k = 0; k < 3; k++) K.put(Mx.paint, sph(0.05, 6, 5), 1.45 + (k - 1) * 0.05, 0.33, -0.6 + (k % 2) * 0.04, 0, 0, 0, 1, 0.8, 1, 0xf2ecd8);
  // ---- cash stack ("millions of dollars"): instanced banded bricks in a pyramid, as its own group (hidden by default)
  const cash = new THREE.Group(); cash.name = 'cash';
  { const BK = new Kit(), face = toon({ map: tex(256, 128, billFace) }), edge = toon({ map: tex(128, 64, billEdge) });
    BK.put(edge, rboxGeo(0.156, 0.03, 0.066, 0.004, [0.156, 0.03]), 0, 0.015, 0, 0, 0, 0, 1, 1, 1, 0xffffff); BK.put(face, plane(0.15, 0.062), 0, 0.0305, 0, -Math.PI / 2, 0, 0, 1, 1, 1, 0xffffff);
    const pf = BK.prefab(), list = []; let i = 0;
    for (let lay = 0; lay < 6; lay++) for (let a = 0; a < 6 - lay; a++) for (let b = 0; b < 8 - lay; b++) { const x = (a - (5 - lay) / 2) * 0.165, z = (b - (7 - lay) / 2) * 0.07; list.push([x + (PT.rng(i)() - 0.5) * 0.01, lay * 0.03, z, (PT.rng(i + 7)() - 0.5) * 0.06, 1]); i++; }
    instance(cash, pf, list); }
  cash.position.set(-0.45, DY, -0.55); cash.rotation.y = 0.15; cash.visible = false; g.add(cash);
  K.build(g);
  return { doc, memoTex, cash, DY };
}

// ================================================================ HOME (cosy 1960s living room)
function buildHome(g) {
  const K = new Kit();
  K.box(Mx.homeFloor, -3.4, 3.4, -0.1, 0, -3.1, 7.5, 0xffffff, 0.002, 1.2);
  const hole = [0.25, 1.65, 0.9, 2.2];
  wallWithHole(K, Mx.floral, 0xffffff, -3.4, 3.4, 0.14, 2.75, -3.25, -3.0, hole, 0.003, 0.45);
  for (const sd of [-1, 1]) K.box(Mx.floral, sd * 3.3 - 0.1, sd * 3.3 + 0.1, 0.14, 2.75, -3.0, 7.5, 0xffffff, 0.003, 0.45);
  K.box(Mx.wall, -3.4, 3.4, 2.75, 2.85, -3.25, 7.5, 0xf6f0e2, 0.002, 1.2);
  K.box(Mx.paint, -3.4, 3.4, 0, 0.14, -3.0, -2.96, 0xf2ecdc, 0.01); K.box(Mx.paint, -3.4, 3.4, 2.65, 2.75, -3.0, -2.93, 0xf2ecdc, 0.02);
  for (const sd of [-1, 1]) { K.box(Mx.paint, sd * 3.2 - 0.04, sd * 3.2 + 0.04, 0, 0.14, -3.0, 7.5, 0xf2ecdc, 0.01); K.box(Mx.paint, sd * 3.2 - 0.07, sd * 3.2 + 0.07, 2.65, 2.75, -3.0, 7.5, 0xf2ecdc, 0.02); }
  K.box(Mx.wall, -3.4, -1.0, 0, 0.14, -3.25, -3.0, 0xf2ecdc, 0.004); K.box(Mx.wall, -1.0, 3.4, 0, 0.14, -3.25, -3.0, 0xf2ecdc, 0.004);
  K.put(Mx.glow, sph(0.26, 20, 8, 0, Math.PI / 2), 0.2, 2.75, -0.6, Math.PI, 0, 0, 1, 0.45, 1, 0xffe2b8); K.put(Mx.steel, tor(0.26, 0.015, 5, 28), 0.2, 2.75, -0.6, Math.PI / 2, 0, 0, 1, 1, 1, 0xc8a050); K.put(Mx.steel, sph(0.03), 0.2, 2.62, -0.6, 0, 0, 0, 1, 1, 1, 0xc8a050);
  // window: white sash, warm dusk outside, sheer + drapes on a rod, plant on the sill, radiator below
  const sky = new THREE.MeshBasicMaterial({ map: tex(256, 256, skyHome), color: new THREE.Color(1, 1, 1).multiplyScalar(0.72), fog: false }); mesh(g, plane(1.6, 1.5), sky, 0.95, 1.55, -3.3);
  K.box(Mx.paint, hole[0] - 0.08, hole[1] + 0.08, hole[3], hole[3] + 0.08, -3.25, -2.96, 0xf6f2e8, 0.01); K.box(Mx.paint, hole[0] - 0.12, hole[1] + 0.12, hole[2] - 0.05, hole[2], -3.25, -2.85, 0xf6f2e8, 0.015);
  for (const x of [hole[0] - 0.08, hole[1]]) K.box(Mx.paint, x, x + 0.08, hole[2], hole[3], -3.25, -2.96, 0xf6f2e8, 0.01);
  K.box(Mx.paint, hole[0], hole[1], 1.53, 1.58, -3.16, -3.1, 0xf6f2e8, 0.008); for (const x of [0.72, 1.18]) K.box(Mx.paint, x - 0.02, x + 0.02, hole[2], hole[3], -3.16, -3.12, 0xf6f2e8, 0.006); K.box(Mx.paint, hole[0], hole[1], 1.86, 1.89, -3.16, -3.12, 0xf6f2e8, 0.006);
  K.put(Mx.steel, cyl(0.016, 0.016, 2.3, 8), 0.95, 2.4, -2.88, 0, 0, Math.PI / 2, 1, 1, 1, 0xc8a050); for (const sd of [-1, 1]) K.put(Mx.steel, sph(0.035), 0.95 + sd * 1.17, 2.4, -2.88, 0, 0, 0, 1, 1, 1, 0xc8a050);
  for (const sd of [-1, 1]) { const x0 = sd < 0 ? hole[0] - 0.42 : hole[1] - 0.05; for (let k = 0; k < 4; k++) K.put(Mx.cloth, cyl(0.07, 0.085, 2.32, 10, true), x0 + 0.06 + k * 0.11, 1.22, -2.86 + (k % 2) * 0.03, 0, 0, 0, 1, 1, 1, 0x8a5a3a); }
  K.box(Mx.cloth, hole[0] - 0.05, hole[1] + 0.05, 1.0, 2.38, -2.95, -2.93, 0xfff6e6, 0.004);
  K.put(Mx.paint, cyl(0.07, 0.055, 0.12, 12), 1.35, hole[2] + 0.06, -3.05, 0, 0, 0, 1, 1, 1, 0xc0603a); for (let k = 0; k < 7; k++) K.put(Mx.paint, sph(0.06, 8, 6), 1.35 + Math.cos(k) * 0.06, hole[2] + 0.16 + (k % 3) * 0.04, -3.05 + Math.sin(k) * 0.04, 0, k, 0, 1, 0.7, 1, 0x4f8a4a);
  for (let k = 0; k < 10; k++) K.box(Mx.paint, 0.35 + k * 0.12, 0.43 + k * 0.12, 0.15, 0.78, -2.95, -2.82, 0xece6d8, 0.03);
  // oval braided rug
  mesh(g, circle(1.0, 48), toon({ map: tex(512, 512, braided), transparent: false }), 0.15, 0.008, -0.6, -Math.PI / 2, 0, 0).scale.set(1.55, 1.1, 1);
  // ---- armchair (wingback, rust upholstery) with doilies; seat centre (-0.85, 0.45, -1.25), faces toward the TV / camera
  const AX = -0.95, AZ = -1.3, ary = 0.4, up = 0xb5523f;
  K.at(AX, 0, AZ, ary, () => {
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.put(Mx.oak, cyl(0.025, 0.018, 0.14, 8), a * 0.34, 0.07, b * 0.32, 0, 0, 0, 1, 1, 1, 0x5a3420);
    K.box(Mx.weave, -0.42, 0.42, 0.13, 0.42, -0.4, 0.38, up, 0.07, 1.2, 2); K.box(Mx.weave, -0.33, 0.33, 0.42, 0.53, -0.3, 0.4, 0xc25c48, 0.06, 1.2, 2);
    K.box(Mx.weave, -0.4, 0.4, 0.42, 1.3, -0.44, -0.24, up, 0.1, 1.2, 2); K.box(Mx.weave, -0.3, 0.3, 0.55, 1.18, -0.26, -0.18, 0xc25c48, 0.06, 1.2, 2);
    for (const sd of [-1, 1]) { K.box(Mx.weave, sd * 0.4 - 0.08, sd * 0.4 + 0.06 * sd, 0.42, 0.66, -0.36, 0.36, up, 0.06, 1.2, 2); K.put(Mx.weave, cyl(0.07, 0.07, 0.78, 14), sd * 0.4, 0.66, 0.0, Math.PI / 2, 0, 0, 1, 1, 1, 0xc25c48);
      K.put(Mx.weave, rboxGeo(0.07, 0.62, 0.32, 0.03, 1.2, 2), sd * 0.43, 1.0, -0.26, 0, -sd * 0.35, 0, 1, 1, 1, up); }
    K.box(Mx.weave, -0.4, 0.4, 0.13, 0.17, 0.38, 0.4, 0xd8b088, 0.01);
  });
  const doilyM = toon({ map: tex(256, 256, doily), alphaTest: 0.5, side: THREE.DoubleSide });
  { const o = new THREE.Object3D(); o.position.set(AX, 0, AZ); o.rotation.y = ary; o.updateMatrix();
    const put = (geo, x, y, z, rx, ry, rz, s = 1) => { const m = mesh(g, geo, doilyM, 0, 0, 0); m.position.copy(new THREE.Vector3(x, y, z).applyMatrix4(o.matrix)); m.rotation.set(rx, ary + ry, rz, 'YXZ'); m.scale.setScalar(s); m.castShadow = false; return m; };
    put(circle(0.17, 28), 0, 1.2, -0.17, -0.12, 0, 0); for (const sd of [-1, 1]) put(circle(0.1, 24), sd * 0.4, 0.735, 0.22, -Math.PI / 2, 0, 0); }
  // side table with teacup + saucer + spoon, a small book
  const SX = -0.1, SZ = -1.5, ST = 0.6;
  K.put(Mx.oak, cyl(0.3, 0.3, 0.035, 28), SX, ST, SZ, 0, 0, 0, 1, 1, 1, 0x9a6a40); K.put(Mx.oak, cyl(0.29, 0.29, 0.02, 28), SX, ST - 0.025, SZ, 0, 0, 0, 1, 1, 1, 0x7a4a2a);
  for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.3; K.beam(Mx.oak, [SX + Math.cos(a) * 0.15, ST - 0.03, SZ + Math.sin(a) * 0.15], [SX + Math.cos(a) * 0.24, 0, SZ + Math.sin(a) * 0.24], 0.02, 0x6a3e22, true, 8); }
  K.put(Mx.oak, cyl(0.2, 0.2, 0.02, 24), SX, 0.25, SZ, 0, 0, 0, 1, 1, 1, 0x8a5a34); for (let k = 0; k < 3; k++) K.put(Mx.paint, rboxGeo(0.2, 0.012, 0.27, 0.003), SX + 0.02, 0.267 + k * 0.012, SZ, 0, 0.4 + k * 0.2, 0, 1, 1, 1, [0xc8302c, 0x24406a, 0xe8d8b0][k]);
  const tx = SX + 0.08, tz = SZ + 0.1;
  K.put(Mx.paint, lathe('saucer', [[0, 0], [0.06, 0], [0.075, 0.012], [0.08, 0.016], [0.06, 0.008], [0, 0.008]], 24), tx, ST + 0.018, tz, 0, 0, 0, 1, 1, 1, 0xf6f2ea);
  K.put(Mx.paint, lathe('teacup', [[0, 0], [0.025, 0], [0.042, 0.03], [0.05, 0.06], [0.047, 0.062], [0.04, 0.035], [0, 0.03]], 22), tx, ST + 0.026, tz, 0, 0, 0, 1, 1, 1, 0xf6f2ea);
  K.put(Mx.paint, tor(0.048, 0.004, 4, 22), tx, ST + 0.085, tz, Math.PI / 2, 0, 0, 1, 1, 1, 0xc8a050); K.put(Mx.paint, cyl(0.043, 0.043, 0.004, 20), tx, ST + 0.075, tz, 0, 0, 0, 1, 1, 1, 0x8a4a22);
  K.put(Mx.paint, tor(0.018, 0.005, 5, 14, Math.PI * 1.2), tx + 0.052, ST + 0.06, tz, 0, 0, -Math.PI * 0.6, 1, 1, 1, 0xf6f2ea); K.beam(Mx.steel, [tx - 0.02, ST + 0.035, tz + 0.06], [tx - 0.08, ST + 0.034, tz + 0.03], 0.005, 0xd0d4d8, false);
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; K.put(Mx.paint, sph(0.008, 6, 4), tx + Math.cos(a) * 0.046, ST + 0.075, tz + Math.sin(a) * 0.046, 0, 0, 0, 1, 1, 1, 0x4f8a6a); }
  // floor lamp behind the chair (glowing drum shade) and a table lamp on the sideboard
  const FLX = -1.75, FLZ = -2.1;
  K.put(Mx.steel, cyl(0.16, 0.18, 0.03, 20), FLX, 0.015, FLZ, 0, 0, 0, 1, 1, 1, 0xc8a050); K.put(Mx.steel, cyl(0.014, 0.014, 1.5, 8), FLX, 0.78, FLZ, 0, 0, 0, 1, 1, 1, 0xc8a050);
  K.put(Mx.glow, cyl(0.2, 0.26, 0.34, 24, true), FLX, 1.62, FLZ, 0, 0, 0, 1, 1, 1, 0xffd8a0); K.put(Mx.paint, tor(0.26, 0.008, 4, 28), FLX, 1.45, FLZ, Math.PI / 2, 0, 0, 1, 1, 1, 0xc8a050); K.put(Mx.paint, tor(0.2, 0.008, 4, 24), FLX, 1.79, FLZ, Math.PI / 2, 0, 0, 1, 1, 1, 0xc8a050);
  K.put(Mx.glowHi, sph(0.05), FLX, 1.55, FLZ, 0, 0, 0, 1, 1, 1, 0xfff0d0);
  // sideboard (right wall) with a table lamp, a radio and photo frames
  K.box(Mx.oak, 2.55, 3.15, 0.12, 0.78, -2.6, -0.9, 0xb07850, 0.03, 1.2); K.box(Mx.oak, 2.52, 3.18, 0.78, 0.82, -2.63, -0.87, 0x9a6440, 0.02, 1.2);
  for (const z of [-2.2, -1.3]) { K.box(Mx.oak, 2.54, 2.56, 0.18, 0.72, z - 0.38, z + 0.38, 0xc8885a, 0.01, 1.2); K.put(Mx.steel, sph(0.02), 2.53, 0.5, z + (z < -2 ? 0.3 : -0.3), 0, 0, 0, 1, 1, 1, 0xc8a050); }
  for (const z of [-2.55, -0.95]) for (const x of [2.6, 3.1]) K.beam(Mx.oak, [x, 0.12, z], [x + (x < 3 ? -0.04 : 0.04), 0, z + (z < -2 ? -0.04 : 0.04)], 0.02, 0x6a3e22, true, 6);
  K.put(Mx.paint, lathe('lampbase', [[0, 0], [0.08, 0], [0.09, 0.05], [0.11, 0.16], [0.08, 0.28], [0.03, 0.32], [0, 0.32]], 18), 2.85, 0.82, -2.3, 0, 0, 0, 1, 1, 1, 0x4f8a7a);
  K.put(Mx.glow, cyl(0.12, 0.17, 0.22, 20, true), 2.85, 1.27, -2.3, 0, 0, 0, 1, 1, 1, 0xffe0b0); K.put(Mx.glowHi, sph(0.035), 2.85, 1.2, -2.3, 0, 0, 0, 1, 1, 1, 0xfff0d0);
  K.box(Mx.paint, 2.7, 3.08, 0.82, 1.04, -1.55, -1.25, 0x8a5a3a, 0.04); K.box(Mx.weave, 2.69, 2.71, 0.86, 1.0, -1.5, -1.38, 0xd8c8a0, 0.005); K.box(Mx.glowLo, 2.69, 2.7, 0.94, 0.98, -1.36, -1.27, 0xffd080, 0.004);
  for (const z of [-1.0, -1.85]) K.box(Mx.paint, 2.95, 3.0, 0.82, 1.06, z - 0.08, z + 0.08, 0xc8a050, 0.008);
  // TV on legs (walnut cabinet, rounded screen, speaker grille, knobs, rabbit ears) facing the chair
  const TVX = 1.45, TVZ = -1.25, TVY = 0.42, tvr = -0.55;
  K.at(TVX, 0, TVZ, tvr, () => {
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.beam(Mx.oak, [a * 0.3, TVY, b * 0.18], [a * 0.36, 0, b * 0.24], 0.02, 0x4a2a1a, true, 8);
    K.box(Mx.oak, -0.4, 0.4, TVY, TVY + 0.58, -0.26, 0.24, 0xa06a40, 0.05, 1.2, 2); K.box(Mx.paint, -0.35, 0.18, TVY + 0.06, TVY + 0.52, 0.23, 0.25, 0x2a2420, 0.05);
    K.box(Mx.weave, 0.21, 0.36, TVY + 0.07, TVY + 0.51, 0.235, 0.25, 0xc8b088, 0.01); for (let k = 0; k < 2; k++) K.put(Mx.paint, cyl(0.032, 0.035, 0.03, 14), 0.285, TVY + 0.38 - k * 0.12, 0.26, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2420);
    K.put(Mx.paint, cyl(0.04, 0.05, 0.03, 14), 0, TVY + 0.6, -0.05, 0, 0, 0, 1, 1, 1, 0x2a2420); for (const sd of [-1, 1]) { K.beam(Mx.steel, [0, TVY + 0.6, -0.05], [sd * 0.3, TVY + 1.05, -0.1], 0.004, 0xd0d4d8, true, 4); K.put(Mx.steel, sph(0.012), sd * 0.3, TVY + 1.05, -0.1, 0, 0, 0, 1, 1, 1, 0xd0d4d8); }
    K.put(Mx.paint, lathe('vase', [[0, 0], [0.04, 0], [0.06, 0.06], [0.03, 0.16], [0.035, 0.2], [0, 0.2]], 14), -0.22, TVY + 0.58, -0.05, 0, 0, 0, 1, 1, 1, 0xd8c040);
    for (let k = 0; k < 3; k++) K.put(Mx.paint, sph(0.03, 8, 6), -0.22 + (k - 1) * 0.03, TVY + 0.82 + (k % 2) * 0.04, -0.05, 0, 0, 0, 1, 1, 1, [0xd85a6a, 0xf2e2b0, 0xd85a6a][k]);
  });
  { const o = new THREE.Object3D(); o.position.set(TVX, 0, TVZ); o.rotation.y = tvr; o.updateMatrix(); const s = mesh(g, new THREE.PlaneGeometry(0.46, 0.38), unlit(tvScreen, 256, 212, 1.35), 0, 0, 0); s.position.copy(new THREE.Vector3(-0.085, TVY + 0.29, 0.252).applyMatrix4(o.matrix)); s.rotation.y = tvr; s.castShadow = false;
    const dm = mesh(g, circle(0.13, 28), doilyM, 0, 0, 0); dm.position.copy(new THREE.Vector3(0.12, TVY + 0.585, -0.02).applyMatrix4(o.matrix)); dm.rotation.set(-Math.PI / 2, 0, 0); dm.castShadow = false; }
  // pictures above the chair, starburst clock, knitting basket with yarn, footstool, slippers, plant stand
  framed(K, g, -1.1, 1.85, -3.0, 0, 0.5, 0.4, (gg, w, h) => picture(gg, w, h, { seed: 7, sky: '#f0c8a0', low: '#e8d8b0', hill: '#7a8a5a' }), 0xc8a050);
  framed(K, g, -0.45, 1.95, -3.0, 0, 0.26, 0.34, (gg, w, h) => picture(gg, w, h, { portrait: true, sky: '#e8d8c0', low: '#c8b8a0', fig: '#7a5a6a' }), 0x6a3e22);
  framed(K, g, -1.7, 2.05, -3.0, 0, 0.26, 0.34, (gg, w, h) => picture(gg, w, h, { portrait: true, sky: '#d8e0e0', low: '#b8c0c0', fig: '#5a6a7a' }), 0x6a3e22);
  clock(K, g, 2.2, 2.2, -3.0, 0, 0.12, { burst: true, ticks: true, rim: 0xc8a050 });
  K.put(Mx.paint, cyl(0.2, 0.17, 0.22, 16, true), -0.15, 0.11, -0.75, 0, 0, 0, 1, 1, 1, 0xb08850); K.put(Mx.paint, tor(0.2, 0.015, 5, 20), -0.15, 0.22, -0.75, Math.PI / 2, 0, 0, 1, 1, 1, 0x9a7440);
  for (const [dx, dz, c] of [[-0.06, 0.03, 0x6a8ac8], [0.07, -0.02, 0xe8c050], [0.0, 0.08, 0xd85a6a]]) K.put(Mx.weave, sph(0.08, 12, 8), -0.15 + dx, 0.22, -0.75 + dz, 0, dx * 30, 0, 1, 1, 1, c);
  K.beam(Mx.steel, [-0.12, 0.25, -0.73], [-0.02, 0.42, -0.8], 0.004, 0xd0d4d8, true, 4); K.beam(Mx.steel, [-0.18, 0.25, -0.72], [-0.05, 0.43, -0.7], 0.004, 0xd0d4d8, true, 4);
  K.at(-0.5, 0, 0.85, 0.3, () => { K.box(Mx.weave, -0.25, 0.25, 0.12, 0.36, -0.2, 0.2, 0xb5523f, 0.07, 1.2, 2); for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.put(Mx.oak, cyl(0.02, 0.015, 0.12, 8), a * 0.19, 0.06, b * 0.14, 0, 0, 0, 1, 1, 1, 0x5a3420); K.put(Mx.paint, rboxGeo(0.3, 0.012, 0.22, 0.004), 0.02, 0.366, 0.0, 0, 0.3, 0.04, 1, 1, 1, 0xe8e2d4); });
  for (const sd of [-1, 1]) K.put(Mx.weave, rboxGeo(0.1, 0.05, 0.25, 0.025, 1, 2), -0.25 + sd * 0.07, 0.025, 1.6, 0, 0.2 + sd * 0.1, 0, 1, 1, 1, 0x8a6a9a);
  K.put(Mx.oak, cyl(0.14, 0.14, 0.02, 16), -2.7, 0.7, -2.5, 0, 0, 0, 1, 1, 1, 0x6a3e22); for (let k = 0; k < 3; k++) { const a = k * 2.094; K.beam(Mx.oak, [-2.7 + Math.cos(a) * 0.08, 0.7, -2.5 + Math.sin(a) * 0.08], [-2.7 + Math.cos(a) * 0.15, 0, -2.5 + Math.sin(a) * 0.15], 0.012, 0x6a3e22, true, 6); }
  K.put(Mx.paint, cyl(0.1, 0.08, 0.16, 12), -2.7, 0.79, -2.5, 0, 0, 0, 1, 1, 1, 0xc0603a); for (let k = 0; k < 9; k++) { const a = k * 0.7; K.beam(Mx.paint, [-2.7, 0.86, -2.5], [-2.7 + Math.cos(a) * 0.32, 0.86 + 0.15 + 0.12 * Math.sin(k * 1.7), -2.5 + Math.sin(a) * 0.32], 0.018, 0x4f8a4a, false); }
  // cat food bowl on a little mat, front centre, plus a tiny cushion bed by the radiator
  K.box(Mx.weave, 0.3, 0.75, 0, 0.008, 1.15, 1.47, 0x6a9a8a, 0.003); catBowl(K, 0.52, 1.31, 0xc8302c, 1);
  K.put(Mx.paint, cyl(0.07, 0.07, 0.035, 18), 0.66, 0.017, 1.39, 0, 0, 0, 1, 1, 1, 0xf2eee2); K.put(Mx.paint, cyl(0.06, 0.06, 0.004, 18), 0.66, 0.035, 1.39, 0, 0, 0, 1, 1, 1, 0xf6f4ff);
  K.put(Mx.weave, cyl(0.3, 0.32, 0.1, 22), 0.95, 0.05, -2.45, 0, 0, 0, 1, 1, 1, 0x8a6a9a); K.put(Mx.weave, tor(0.29, 0.07, 8, 24), 0.95, 0.1, -2.45, Math.PI / 2, 0, 0, 1, 1, 0.8, 0x7a5a8a);
  K.build(g);
  return { armchair: [AX, 0.53, AZ], bowl: [0.52, 0.06, 1.31], teacup: [tx, ST + 0.07, tz], tv: [TVX, TVY + 0.29, TVZ] };
}

// ---------------------------------------------------------------- lights / grades / views
// Light presets built on the 'office' preset (story.js LIGHTS). Merge into LIGHTS as 'lab' / 'cia' / 'home' if the timeline wants named shots.
const ROOM_LIGHT = {
  lab: { hemiI: 0.85, sky: '#e2f0e8', ground: '#4e5a5c', sunCol: '#f2f6ff', sunI: 0.55, az: -30, el: 55, fillCol: '#8aa0d8', fillI: 0.3, fog: '#c8d4cc', fogN: 14, fogF: 70, hor: '#c8d4cc', cardTint: '#f2f6ff', shafts: 0 },
  office: { hemiI: 0.85, sky: '#ffe2c0', ground: '#4a2e22', sunCol: '#ffe2b0', sunI: 0.5, az: -40, el: 55, fillCol: '#8a90c8', fillI: 0.22, fog: '#3b2a1d', fogN: 12, fogF: 60, shafts: 0 },
  home: { hemiI: 0.85, sky: '#ffe0bc', ground: '#5a3a2e', sunCol: '#ffd6a0', sunI: 0.5, az: 30, el: 50, fillCol: '#9a8ad0', fillI: 0.22, fog: '#4a3020', fogN: 12, fogF: 60, cardTint: '#fff0e0', shafts: 0 },
};
const ROOM_GRADE = { lab: { tS: ['#3a5a7a', 0.14], tH: ['#fff0d0', 0.04], vig: [0.32, 0.45, '#4a5a6a'], hal: [0.18, '#ffb070'], bloom: [0.42, 0.85] }, office: { bloom: [0.4, 0.85] }, home: { tH: ['#ffb070', 0.1], bloom: [0.45, 0.82], hal: [0.3, '#ff7a40'] } };
// practical point lights per room (local coords): { p, col, I, d } — max 4 (main.js PRACT pool)
const ROOM_PRACT = {
  lab: [{ p: [0.05, 1.7, 0.0], col: '#fff4e0', I: 3.5, d: 4 }, { p: [-1.7, 1.9, -2.3], col: '#e8f2ff', I: 3, d: 5 }, { p: [1.6, 1.3, -2.0], col: '#b8ffcc', I: 1.2, d: 2 }, { p: [0.5, 2.3, 2.6], col: '#eef6ff', I: 2.5, d: 6 }],
  office: [{ p: [-0.74, 1.0, -0.6], col: '#ffd890', I: 2.2, d: 2.2 }, { p: [0, 2.4, -0.4], col: '#ffe8c8', I: 2.5, d: 6 }, { p: [-1.9, 1.7, -2.5], col: '#e0e8ff', I: 2, d: 4 }, { p: [1.8, 1.8, 1.5], col: '#ffd8a8', I: 1.5, d: 5 }],
  home: [{ p: [-1.75, 1.6, -2.0], col: '#ffb060', I: 5, d: 4.5 }, { p: [2.85, 1.25, -2.2], col: '#ffc070', I: 3, d: 3.5 }, { p: [0.95, 1.6, -2.6], col: '#ffd0a0', I: 2, d: 4 }, { p: [1.2, 0.8, -0.8], col: '#a8c0ff', I: 1, d: 2 }],
};

export function buildRooms(ctx) {
  ({ THREE, toon, mkTex, PT } = ctx);
  Mx = materials();
  const groups = {}, info = {};
  for (const name of ['lab', 'office', 'home']) { const g = new THREE.Group(); g.name = 'room_' + name; g.position.set(...ORIGIN[name]); g.visible = false; ctx.scene.add(g); groups[name] = g; }
  info.lab = buildLab(groups.lab); info.office = buildOffice(groups.office, ctx); info.home = buildHome(groups.home);
  if (ctx.NOND) for (const m of SHAFTS) ctx.NOND.add(m);
  const W = (name, p) => [p[0] + ORIGIN[name][0], p[1] + ORIGIN[name][1], p[2] + ORIGIN[name][2]];
  const DY = info.office.DY;
  // key spots (world coords)
  const spots = {
    labTable: W('lab', [0, 0.89, info.lab.TZ]), labLamp: W('lab', [0.05, 2.48, info.lab.TZ + 0.16]), labCatBed: W('lab', [0.95, 0.1, 1.75]), labBowl: W('lab', [0.45, 0.06, 2.05]), labCrate: W('lab', [-0.3, 0.6, 2.4]),
    labScope: W('lab', [1.585, 1.105, -2.36]), labReel: W('lab', [0.85, 1.33, -2.48]), labChalk: W('lab', [1.6, 2.0, -2.94]),
    officeDesk: W('office', [0, DY, -0.5]), officeDoc: W('office', [0, DY + 0.009, -0.48]), officeLamp: W('office', [-0.74, DY + 0.36, -0.73]), officeCash: W('office', [-0.45, DY, -0.55]), officeFlag: W('office', [1.5, 1.6, -2.5]), officeChair: W('office', [0, 0.56, -1.55]),
    homeArmchair: W('home', info.home.armchair), homeBowl: W('home', info.home.bowl), homeTeacup: W('home', info.home.teacup), homeTV: W('home', info.home.tv),
  };
  const v = (room, p, l, fov, cInf, fp) => ({ room, p: W(room, p), l: W(room, l), fov, cInf, fp: fp ? W(room, fp) : null });
  const views = [
    v('lab', [0.35, 1.85, 5.4], [0.05, 1.12, -1.5], 50, 3, [0, 0.9, -0.5]),                 // 0 lab wide
    v('lab', [1.35, 1.55, 1.45], [-0.05, 1.3, -0.6], 55, 6, [0.2, 0.9, -0.4]),             // 1 operating table close-up
    v('office', [0.04, 1.42, -0.05], [0.0, DY, -0.5], 40, 8, [0, DY, -0.48]),                // 2 office desk, memo insert (top-down-ish)
    v('home', [0.6, 1.35, 4.6], [0.05, 0.85, -1.3], 53, 3, [-0.6, 0.8, -1.3]),             // 3 living room wide
    v('office', [0.75, 1.6, 4.2], [0.15, 0.92, -1.2], 50, 3, [0, 1.0, -0.6]),              // 4 office wide
    v('office', [0.35, 1.25, 0.65], [-0.4, DY + 0.1, -0.55], 44, 7, [-0.45, DY + 0.1, -0.55]), // 5 cash hook insert
  ];
  views.push({ ...views[2] }); views[2].memo = 1; views[5].cash = true;                       // 6 = memo before the stamp
  for (const c of views) { c.focus = Math.hypot(...[0, 1, 2].map((i) => c.p[i] - (c.fp || c.l)[i])); }
  const R0 = {
    lab: groups.lab, office: groups.office, home: groups.home, groups, origin: ORIGIN, spots, views,
    doc: info.office.doc, memoTex: info.office.memoTex, cash: info.office.cash, shafts: SHAFTS,
    setMemo(stamped) { R0.doc.material.map = R0.memoTex[stamped ? 1 : 0]; R0.doc.material.needsUpdate = true; },
    paintMemo: (stamped) => mkTex(512, 680, (gg, w, h) => paintMemo(gg, w, h, stamped)),
    lightFor: (name) => ({ ...LIGHTS_.office, ...ROOM_LIGHT[name] }), gradeFor: (name) => ROOM_GRADE[name] || {}, practicals: ROOM_PRACT, LIGHTS: ROOM_LIGHT, GRADES: ROOM_GRADE,
    // show one room (or none): hides the 1904 sets + car when a room is shown
    show(world, name) { for (const k in groups) groups[k].visible = k === name; if (name) for (const k of ['road', 'stadium', 'office', 'car']) if (world[k]) world[k].visible = false; },
    // drive main.js' fixed pool of practical PointLights from this room's lamp list
    placeLights(PRACT, name) { const L = ROOM_PRACT[name] || []; PRACT.forEach((l, i) => { const c = L[i]; l.visible = true; if (!c) { l.intensity = 0; return; } l.position.set(...W(name, c.p)); l.color.set(c.col); l.intensity = c.I; l.distance = c.d; l.decay = 1.6; }); },
    // test-view helper used by main.js ?roomview: shows the room, sets props + lamps, returns { L, grade, cam }
    applyView(world, PRACT, i) { const c = views[i % views.length]; R0.show(world, c.room); R0.cash.visible = !!c.cash; R0.setMemo(!!c.memo); R0.placeLights(PRACT, c.room);
      return { L: R0.lightFor(c.room), grade: R0.gradeFor(c.room), cam: R0.camFor(i) }; },
    camFor: (i) => { const c = views[i % views.length]; return { p: c.p, l: c.l, fov: c.fov, focus: c.focus, cInf: c.cInf }; },
  };
  return R0;
}
