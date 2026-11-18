// world.js: set dressing for the 1904 Missouri road + town, the stadium, the 1908 office and the town around the stadium.
// Everything is procedural. Repeated parts are merged per material (Kit) or instanced (prefabs) so the CPU renderer stays fast.
let THREE, toon, rnd, M, TX;
const NB = {};
export function setStadiumName(boston) { if (NB.mat) { NB.mat.map = boston ? NB.boston : NB.olympic; NB.mat.needsUpdate = true; } }
const S = 2; // metres per texture tile (default)

export function initWorld(ctx) { ({ THREE, toon, rnd } = ctx); TX = paintAll(); M = materials(); return { M, TX }; }

// ---------------------------------------------------------------- painters
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
}
const grey = (v, a = 1) => `rgba(${v | 0},${v | 0},${v | 0},${a})`;
function paintAll() {
  const T = {};
  // horizontal clapboard siding: light top edge, shadow line under every board, butt joints, grain specks
  T.siding = canvasTex(256, 256, (g, w, h) => {
    const n = 12, bh = h / n;
    for (let i = 0; i < n; i++) {
      const y = i * bh, t = 0.92 + 0.08 * rnd(i * 3.1), gr = g.createLinearGradient(0, y, 0, y + bh);
      gr.addColorStop(0, grey(255 * t)); gr.addColorStop(1, grey(214 * t)); g.fillStyle = gr; g.fillRect(0, y, w, bh);
      g.fillStyle = grey(70, 0.75); g.fillRect(0, y + bh - 3, w, 3); g.fillStyle = grey(255, 0.7); g.fillRect(0, y, w, 1);
      for (let k = 0; k < 2; k++) { g.fillStyle = grey(70, 0.4); g.fillRect((rnd(i * 7 + k) * w) | 0, y, 2, bh - 3); }
    }
    for (let i = 0; i < 300; i++) { g.fillStyle = grey(0, 0.04 + 0.05 * rnd(i)); g.fillRect(rnd(i * 1.3) * w, rnd(i * 2.7) * h, 6 + 18 * rnd(i * 5), 1); }
  });
  // vertical board-and-batten (barns, sheds, crates)
  T.vboards = canvasTex(256, 256, (g, w, h) => {
    const n = 8, bw = w / n;
    for (let i = 0; i < n; i++) {
      const x = i * bw; g.fillStyle = grey(222 + 30 * rnd(i * 1.7)); g.fillRect(x, 0, bw, h);
      for (let k = 0; k < 7; k++) { g.fillStyle = grey(120, 0.12); g.fillRect(x + 3 + rnd(i * 9 + k) * (bw - 6), 0, 1, h); }
      g.fillStyle = grey(60, 0.8); g.fillRect(x, 0, 3, h); g.fillStyle = grey(255, 0.5); g.fillRect(x + 3, 0, 2, h);
      if (rnd(i * 5) > 0.5) { g.fillStyle = grey(90, 0.5); g.beginPath(); g.ellipse(x + bw / 2, rnd(i * 11) * h, 3, 6, 0, 0, 7); g.fill(); }
    }
  });
  // weathered wood: mottled with a few knots and checks
  T.weather = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = grey(232); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { g.fillStyle = grey(rnd(i) > 0.5 ? 255 : 170, 0.12); g.beginPath(); g.ellipse(rnd(i * 2.1) * w, rnd(i * 3.3) * h, 3 + 9 * rnd(i * 4.4), 2 + 5 * rnd(i * 5.5), 0, 0, 7); g.fill(); }
    for (let i = 0; i < 14; i++) { g.fillStyle = grey(70, 0.35); g.fillRect(rnd(i * 7.7) * w, rnd(i * 8.8) * h, 1, 6 + 14 * rnd(i)); }
  });
  // wooden shingles in staggered courses
  T.shingle = canvasTex(256, 256, (g, w, h) => {
    const n = 10, rh = h / n;
    for (let r = 0; r < n; r++) {
      let x = -rnd(r * 3) * 20; const y = r * rh;
      while (x < w) { const sw = 14 + 16 * rnd(x * 0.37 + r * 13); g.fillStyle = grey(190 + 60 * rnd(x * 0.11 + r * 7)); g.fillRect(x, y, sw, rh); g.fillStyle = grey(50, 0.7); g.fillRect(x, y, 2, rh); x += sw; }
      g.fillStyle = grey(40, 0.85); g.fillRect(0, y + rh - 4, w, 4); g.fillStyle = grey(255, 0.25); g.fillRect(0, y, w, 2);
    }
  });
  T.brick = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#d6c6ae'; g.fillRect(0, 0, w, h); const n = 13, rh = h / n;
    for (let r = 0; r < n; r++) for (let k = -1; k < 5; k++) {
      const x = k * 64 + (r % 2) * 32, c = rnd(r * 17 + k * 3); g.fillStyle = `rgb(${150 + 50 * c | 0},${66 + 26 * c | 0},${48 + 16 * c | 0})`; g.fillRect(x + 2, r * rh + 2, 60, rh - 3);
      g.fillStyle = 'rgba(255,220,190,0.25)'; g.fillRect(x + 2, r * rh + 2, 60, 2);
    }
  });
  T.stone = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#6a6460'; g.fillRect(0, 0, w, h);
    for (let r = 0; r < 6; r++) { let x = -rnd(r) * 30; while (x < w) { const sw = 28 + 30 * rnd(x + r * 5), c = 150 + 60 * rnd(x * 0.3 + r); g.fillStyle = `rgb(${c},${c * 0.96 | 0},${c * 0.9 | 0})`; g.beginPath(); g.roundRect(x + 2, r * 43 + 2, sw - 4, 39, 9); g.fill(); x += sw; } }
  });
  T.glass = canvasTex(128, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6f8db0'); gr.addColorStop(0.55, '#33476a'); gr.addColorStop(1, '#222c48'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.28)'; g.beginPath(); g.moveTo(20, 0); g.lineTo(58, 0); g.lineTo(18, h); g.lineTo(-20, h); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(70, 0); g.lineTo(80, 0); g.lineTo(40, h); g.lineTo(30, h); g.fill();
  });
  T.leaf = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = grey(205); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 420; i++) { g.fillStyle = grey(rnd(i * 1.9) > 0.45 ? 250 : 140, 0.5); g.beginPath(); g.ellipse(rnd(i * 2.3) * w, rnd(i * 3.7) * h, 5 + 5 * rnd(i), 2.5 + 2 * rnd(i * 3), rnd(i * 5) * 3, 0, 7); g.fill(); }
  });
  T.straw = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#d7b463'; g.fillRect(0, 0, w, h); g.lineCap = 'round';
    for (let i = 0; i < 700; i++) { const x = rnd(i * 1.1) * w, y = rnd(i * 2.2) * h, a = (rnd(i * 3.3) - 0.5) * 0.9, l = 8 + 22 * rnd(i * 4.4); g.strokeStyle = ['#f0d483', '#b98f3e', '#e6c46f', '#a57a34'][i % 4]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  });
  const stripes = (a, b) => canvasTex(256, 64, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * 32, 0, 32, h); } g.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 8; i++) g.fillRect(i * 32, 0, 2, h); });
  T.awnR = stripes('#b5323a', '#f1e8d6'); T.awnG = stripes('#2f6a4e', '#f1e8d6'); T.awnB = stripes('#2f4f86', '#f1e8d6');
  T.paper = canvasTex(256, 64, (g, w, h) => { g.fillStyle = '#4a6a4a'; g.fillRect(0, 0, w, h); g.fillStyle = '#6a8a5a'; for (let i = 0; i < 8; i++) g.fillRect(i * 32 + 4, 0, 6, h); g.fillStyle = '#c9a85a'; for (let i = 0; i < 8; i++) for (let k = 0; k < 2; k++) { g.beginPath(); g.ellipse(i * 32 + 22, 16 + k * 32, 4, 6, 0, 0, 7); g.fill(); } });
  T.rug = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#7a1f28'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f2d4a'; g.fillRect(24, 24, w - 48, h - 48); g.fillStyle = '#8c2a32'; g.fillRect(56, 56, w - 112, h - 112);
    g.strokeStyle = '#d9b25a'; g.lineWidth = 6; g.strokeRect(40, 40, w - 80, h - 80); g.strokeRect(70, 70, w - 140, h - 140);
    for (let i = 0; i < 16; i++) { g.fillStyle = '#d9b25a'; const t = 56 + i * 25; for (const [x, y] of [[t, 32], [t, h - 32], [32, t], [w - 32, t]]) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); } }
    g.save(); g.translate(w / 2, h / 2); for (let k = 0; k < 3; k++) { g.fillStyle = ['#d9b25a', '#1f2d4a', '#c8503a'][k]; const s = 120 - k * 36; g.beginPath(); g.moveTo(0, -s); g.lineTo(s * 0.7, 0); g.lineTo(0, s); g.lineTo(-s * 0.7, 0); g.fill(); } g.restore();
    for (let i = 0; i < 4; i++) { g.save(); g.translate(i % 2 ? w - 120 : 120, i < 2 ? 120 : h - 120); g.fillStyle = '#d9b25a'; g.beginPath(); g.moveTo(0, -26); g.lineTo(18, 0); g.lineTo(0, 26); g.lineTo(-18, 0); g.fill(); g.restore(); }
  });
  T.books = canvasTex(512, 128, (g, w, h) => {
    let x = 0, i = 0; const C = ['#7a2430', '#24406a', '#2f5a3a', '#8a5a2a', '#4a2f5a', '#6a6a3a', '#9a3a2a', '#1f2a3a'];
    while (x < w) { const bw = 12 + 16 * rnd(i * 3.3), bh = h * (0.72 + 0.26 * rnd(i * 5.1)); g.fillStyle = C[i % 8]; g.fillRect(x, h - bh, bw - 1, bh); g.fillStyle = '#d9b25a'; g.fillRect(x + 2, h - bh + 8, bw - 5, 3); g.fillRect(x + 2, h - 14, bw - 5, 3); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(x + 1, h - bh, 2, bh); x += bw; i++; }
  });
  return T;
}
// period painted signboard: plank ground, double border, wood-type serif lettering squeezed to fit, drop shadow
const SIGNS = new Map();
export function signMat(text, bg = '#2f4a3a', fg = '#f2e2b0', o = {}) {
  const key = text + bg + fg + JSON.stringify(o); if (SIGNS.has(key)) return SIGNS.get(key);
  const W = o.w || 1024, H = o.h || 220;
  const t = canvasTex(W, H, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.13)'; for (let y = h / 4; y < h; y += h / 4) g.fillRect(0, y, w, 3);
    for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,255,255,${0.03 + 0.04 * rnd(i)})`; g.fillRect(rnd(i * 2) * w, rnd(i * 3) * h, 20 + 60 * rnd(i * 4), 2); }
    g.strokeStyle = fg; g.lineWidth = h * 0.035; g.strokeRect(h * 0.07, h * 0.07, w - h * 0.14, h - h * 0.14); g.lineWidth = h * 0.012; g.strokeRect(h * 0.13, h * 0.13, w - h * 0.26, h - h * 0.26);
    const lines = text.split('\n'), fs = (o.fs || 0.56) * h / lines.length;
    lines.forEach((ln, i) => {
      const y = h / 2 + (i - (lines.length - 1) / 2) * fs * 1.08 + fs * 0.05, sz = i === 0 ? fs : fs * (o.sub || 0.8);
      g.font = `bold ${sz | 0}px "DejaVu Serif", serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      const mw = g.measureText(ln).width, sx = Math.min(1, (w - h * 0.5) / mw);
      g.save(); g.translate(w / 2, y); g.scale(sx, 1);
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillText(ln, sz * 0.05, sz * 0.06); g.fillStyle = fg; g.fillText(ln, 0, 0); g.restore();
    });
    if (o.dots !== false) for (const x of [h * 0.3, w - h * 0.3]) { g.fillStyle = fg; g.beginPath(); g.arc(x, h / 2, h * 0.05, 0, 7); g.fill(); }
  });
  const m = toon({ map: t }); SIGNS.set(key, m); return m;
}

// ---------------------------------------------------------------- materials
function materials() {
  const vc = (o = {}) => toon({ vertexColors: true, ...o });
  const m = {
    paint: vc(), wood: vc({ map: TX.weather }), siding: vc({ map: TX.siding }), vb: vc({ map: TX.vboards }), shingle: vc({ map: TX.shingle }),
    brick: vc({ map: TX.brick }), stone: vc({ map: TX.stone }), glass: vc({ map: TX.glass }), leaf: vc({ map: TX.leaf }), straw: vc({ map: TX.straw }),
    awnR: vc({ map: TX.awnR, side: THREE.DoubleSide }), awnG: vc({ map: TX.awnG, side: THREE.DoubleSide }), awnB: vc({ map: TX.awnB, side: THREE.DoubleSide }),
    cloth: vc({ side: THREE.DoubleSide }), glow: new THREE.MeshBasicMaterial({ color: 0xffd98a, vertexColors: true }),
    paper: vc({ map: TX.paper }), rug: vc({ map: TX.rug }), books: vc({ map: TX.books }),
  };
  m.leaf.userData.tint = true; m.straw.userData.tint = true;
  return m;
}

// ---------------------------------------------------------------- geometry
const GEO = new Map();
const cached = (k, mk) => { let g = GEO.get(k); if (!g) { g = mk(); GEO.set(k, g); } return g; };
// rounded box: corners pushed onto a sphere of radius r around an inner box. seg 1 = soft chamfer, 2 = round.
export function rboxGeo(w, h, d, r = 0.025, s = S, seg = 1) {
  r = Math.max(0.001, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4));
  const su = Array.isArray(s) ? s : [s, s];
  return cached(`rb${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}|${r.toFixed(4)}|${su}|${seg}`, () => {
    const n = 2 * seg + 1, g = new THREE.BoxGeometry(1, 1, 1, n, n, n), p = g.attributes.position, nr = g.attributes.normal, uv = g.attributes.uv;
    const half = [w / 2, h / 2, d / 2], v = new THREE.Vector3(), out = [0, 0, 0], dir = [0, 0, 0];
    for (let i = 0; i < p.count; i++) {
      for (let a = 0; a < 3; a++) { const k = Math.round((p.getComponent(i, a) + 0.5) * n), c = half[a] - r; out[a] = k <= seg ? -c : c; dir[a] = k <= seg ? -(1 - k / seg) : (k - seg - 1) / seg; }
      v.set(dir[0], dir[1], dir[2]).normalize(); p.setXYZ(i, out[0] + v.x * r, out[1] + v.y * r, out[2] + v.z * r); nr.setXYZ(i, v.x, v.y, v.z);
    }
    const dimsF = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]], per = (n + 1) * (n + 1);
    for (let f = 0; f < 6; f++) for (let i = 0; i < per; i++) { const k = f * per + i; uv.setXY(k, uv.getX(k) * dimsF[f][0] / su[0], uv.getY(k) * dimsF[f][1] / su[1]); }
    return g;
  });
}
const cyl = (rt, rb, h, rs = 8, open = false) => cached(`cy${rt}|${rb}|${h}|${rs}|${open}`, () => new THREE.CylinderGeometry(rt, rb, h, rs, 1, open));
const sph = (r, ws = 10, hs = 7) => cached(`sp${r}|${ws}|${hs}`, () => new THREE.SphereGeometry(r, ws, hs));
const tor = (r, t, rs = 5, ts = 20, arc = Math.PI * 2) => cached(`to${r}|${t}|${rs}|${ts}|${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));
const cone = (r, h, rs = 4) => cached(`co${r}|${h}|${rs}`, () => new THREE.ConeGeometry(r, h, rs));
const plane = (w, h) => cached(`pl${w}|${h}`, () => new THREE.PlaneGeometry(w, h));
// triangular prism: base w (x) at y=0, apex at y=h, depth d along z (centred). Flat normals, siding-friendly uvs.
function prismGeo(w, h, d, s = S) {
  return cached(`pr${w}|${h}|${d}|${s}`, () => {
    const A = [-w / 2, 0], B = [w / 2, 0], C = [0, h], z0 = -d / 2, z1 = d / 2, P = [], U = [];
    const tri = (a, b, c, ua, ub, uc) => { P.push(...a, ...b, ...c); U.push(...ua, ...ub, ...uc); };
    const uvc = (p) => [(p[0] + w / 2) / s, p[1] / s];
    tri([...A, z1], [...B, z1], [...C, z1], uvc(A), uvc(B), uvc(C)); tri([...B, z0], [...A, z0], [...C, z0], uvc(B), uvc(A), uvc(C));
    const quad = (p, q) => { const L = Math.hypot(q[0] - p[0], q[1] - p[1]) / s; tri([...p, z1], [...p, z0], [...q, z0], [0, 0], [d / s, 0], [d / s, L]); tri([...p, z1], [...q, z0], [...q, z1], [0, 0], [d / s, L], [0, L]); };
    quad(B, A); quad(C, B); quad(A, C);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.computeVertexNormals(); return g;
  });
}
// lumpy leaf clump: a sphere displaced by smooth position noise (same noise on seam duplicates so it stays closed)
const clumpGeo = (v) => cached('clump' + v, () => {
  const g = new THREE.SphereGeometry(1, 16, 11), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const n = 1 + 0.16 * Math.sin(x * 3.1 + v * 1.7) * Math.cos(z * 2.7 - v) + 0.1 * Math.sin(y * 4.3 + x * 2.1 + v * 3.3); p.setXYZ(i, x * n, y * n * (y < 0 ? 0.7 : 1), z * n); }
  g.computeVertexNormals(); return g;
});
// barrel: lathe with a bulge
const barrelGeo = () => cached('barrel', () => { const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push(new THREE.Vector2(0.27 + 0.06 * Math.sin(t * Math.PI), t * 0.9)); } pts.unshift(new THREE.Vector2(0, 0)); pts.push(new THREE.Vector2(0, 0.9)); return new THREE.LatheGeometry(pts, 14); });

function mergeGeos(list) {
  let nv = 0, ni = 0;
  for (const [g] of list) { nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
  const P = new Float32Array(nv * 3), N = new Float32Array(nv * 3), U = new Float32Array(nv * 2), C = new Float32Array(nv * 3), I = new Uint32Array(ni);
  let ov = 0, oi = 0; const v = new THREE.Vector3(), nm = new THREE.Matrix3();
  for (const [g, m, c] of list) {
    nm.getNormalMatrix(m); const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const j = ov + i; v.fromBufferAttribute(p, i).applyMatrix4(m); P[j * 3] = v.x; P[j * 3 + 1] = v.y; P[j * 3 + 2] = v.z;
      v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize(); N[j * 3] = v.x; N[j * 3 + 1] = v.y; N[j * 3 + 2] = v.z;
      if (u) { U[j * 2] = u.getX(i); U[j * 2 + 1] = u.getY(i); } C[j * 3] = c.r; C[j * 3 + 1] = c.g; C[j * 3 + 2] = c.b;
    }
    const cnt = g.index ? g.index.count : p.count, flip = m.determinant() < 0, ix = (i) => (g.index ? g.index.getX(i) : i) + ov;
    for (let i = 0; i < cnt; i += 3) { I[oi + i] = ix(i); I[oi + i + 1] = ix(flip ? i + 2 : i + 1); I[oi + i + 2] = ix(flip ? i + 1 : i + 2); }
    ov += p.count; oi += cnt;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.BufferAttribute(N, 3)); out.setAttribute('uv', new THREE.BufferAttribute(U, 2)); out.setAttribute('color', new THREE.BufferAttribute(C, 3));
  out.setIndex(new THREE.BufferAttribute(I, 1)); out.computeBoundingSphere(); return out;
}
const _v = () => new THREE.Vector3(), _q = () => new THREE.Quaternion(), _e = () => new THREE.Euler();
const col = (c) => (c instanceof THREE.Color ? c : new THREE.Color(c ?? 0xffffff));
// Kit: collects parts with a transform stack, then merges per material (optionally chunked along z for culling)
export class Kit {
  constructor() { this.items = new Map(); this.M = new THREE.Matrix4(); this.v = _v(); this.q = _q(); this.e = _e(); this.s = _v(); this.tris = 0; }
  put(mat, geo, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, c) {
    const m = new THREE.Matrix4().compose(this.v.set(x, y, z), this.q.setFromEuler(this.e.set(rx, ry, rz, 'YXZ')), this.s.set(sx, sy, sz)).premultiply(this.M);
    let a = this.items.get(mat); if (!a) this.items.set(mat, (a = []));
    a.push([geo, m, col(c)]); this.tris += (geo.index ? geo.index.count : geo.attributes.position.count) / 3; return m;
  }
  box(mat, x0, x1, y0, y1, z0, z1, c, r = 0.025, s = S, seg = 1) { return this.put(mat, rboxGeo(x1 - x0, y1 - y0, z1 - z0, r, s, seg), (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, 0, 0, 0, 1, 1, 1, c); }
  // centred box with rotation (YXZ euler)
  cb(mat, w, h, d, x, y, z, c, rx = 0, ry = 0, rz = 0, r = 0.02, s = S) { return this.put(mat, rboxGeo(w, h, d, r, s), x, y, z, rx, ry, rz, 1, 1, 1, c); }
  // a straight member (post/rail/wire) between two points
  beam(mat, a, b, t, c, round = false, rs = 5) {
    const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length(), mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    const g = round ? cyl(t, t, 1, rs) : rboxGeo(t, 1, t, Math.min(0.01, t * 0.3));
    const m = new THREE.Matrix4().compose(this.v.set(...mid), q, this.s.set(1, L, 1)).premultiply(this.M);
    let arr = this.items.get(mat); if (!arr) this.items.set(mat, (arr = [])); arr.push([g, m, col(c)]); return m;
  }
  at(x, y, z, ry, fn, sc = 1) { const o = this.M.clone(); this.M.multiply(new THREE.Matrix4().compose(this.v.set(x, y, z), this.q.setFromEuler(this.e.set(0, ry, 0)), this.s.set(sc, sc, sc))); fn(); this.M.copy(o); }
  build(parent, chunk = 0) {
    for (const [mat, list] of this.items) {
      const groups = new Map();
      for (const it of list) { const k = chunk ? Math.floor(it[1].elements[14] / chunk) * 1000 + Math.floor(it[1].elements[12] / chunk) : 0; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(it); }
      for (const l of groups.values()) { const m = new THREE.Mesh(mergeGeos(l), mat); m.castShadow = m.receiveShadow = true; parent.add(m); }
    }
    this.items.clear();
  }
  prefab() { const pf = [...this.items].map(([mat, l]) => [mat, mergeGeos(l)]); this.items.clear(); return pf; }
}
// instance a prefab: list of [x, y, z, ry, scale, tint?, sy?]
export function instance(parent, pf, list, shadow = true) {
  if (!list.length) return;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3(), white = new THREE.Color(1, 1, 1);
  for (const [mat, geo] of pf) {
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((t, i) => { m4.compose(v.set(t[0], t[1], t[2]), q.setFromEuler(e.set(t[7] || 0, t[3] || 0, t[8] || 0, 'YXZ')), s.set(t[4] || 1, (t[4] || 1) * (t[6] || 1), t[4] || 1)); im.setMatrixAt(i, m4); if (mat.userData.tint) im.setColorAt(i, t[5] ? col(t[5]) : white); });
    im.castShadow = shadow; im.receiveShadow = true; parent.add(im);
  }
}

// ---------------------------------------------------------------- palette
const PAL = {
  walls: [0xefe2c2, 0xa8463a, 0x8ea27a, 0xd9a848, 0x9fb4c4, 0xf2eee4, 0x9a6a48, 0xd88a6a, 0x5f8f8a, 0xc9b28a, 0x7a8f6a, 0xb8a4c0],
  trims: [0xf4efe2, 0x2f4a3a, 0x6a2a2a, 0xf0e2c0, 0x3a3a52, 0xf4efe2],
  roofs: [0x6a5a52, 0x4a4a5a, 0x8a3b3a, 0x4f6a52, 0x7a5a3e],
};
const pick = (a, k) => a[Math.floor(rnd(k) * a.length) % a.length];

// ---------------------------------------------------------------- building parts (local frame: wall surface at z=0 facing +z)
function win(K, x, y, w, h, o = {}) {
  const f = o.frame ?? 0xf4efe2, t = 0.075;
  if (!o.noGlass) K.box(M.glass, x - w / 2, x + w / 2, y, y + h, -0.04, 0.012, 0xffffff, 0.004, [w, h]);
  K.box(M.paint, x - w / 2 - t, x - w / 2 + 0.012, y - 0.01, y + h + 0.01, -0.02, 0.06, f, 0.012);
  K.box(M.paint, x + w / 2 - 0.012, x + w / 2 + t, y - 0.01, y + h + 0.01, -0.02, 0.06, f, 0.012);
  K.box(M.paint, x - w / 2 - t - 0.05, x + w / 2 + t + 0.05, y + h, y + h + 0.13, -0.02, 0.08, f, 0.015);
  K.box(M.paint, x - w / 2 - t - 0.09, x + w / 2 + t + 0.09, y + h + 0.13, y + h + 0.18, -0.02, 0.12, f, 0.015);
  K.box(M.paint, x - w / 2 - t - 0.06, x + w / 2 + t + 0.06, y - 0.08, y, -0.02, 0.13, f, 0.015);
  if (!o.shop) K.box(M.paint, x - w / 2, x + w / 2, y + h * 0.5 - 0.025, y + h * 0.5 + 0.025, -0.02, 0.035, f, 0.008);
  const cols = o.cols ?? 2; for (let i = 1; i < cols; i++) { const xx = x - w / 2 + (w * i) / cols; K.box(M.paint, xx - 0.016, xx + 0.016, y, y + h, -0.02, 0.03, f, 0.006); }
  if (o.rows) for (let i = 1; i < o.rows; i++) { const yy = y + (h * i) / o.rows; K.box(M.paint, x - w / 2, x + w / 2, yy - 0.016, yy + 0.016, -0.02, 0.03, f, 0.006); }
  if (o.curtain) for (const sd of [-1, 1]) { const cx = x + sd * (w / 2 - w * 0.13); K.box(M.paint, cx - w * 0.12, cx + w * 0.12, y + h * 0.35, y + h - 0.03, 0.012, 0.022, o.curtain, 0.01); }
  if (o.shade) K.box(M.paint, x - w / 2 + 0.01, x + w / 2 - 0.01, y + h * 0.72, y + h - 0.02, 0.012, 0.02, o.shade, 0.005);
  if (o.shutter) for (const sd of [-1, 1]) {
    const sx = x + sd * (w / 2 + t + 0.03 + w * 0.26);
    K.box(M.paint, sx - w * 0.25, sx + w * 0.25, y - 0.02, y + h + 0.02, -0.01, 0.045, o.shutter, 0.012);
    for (let k = 1; k < 9; k++) K.box(M.paint, sx - w * 0.2, sx + w * 0.2, y + (h * k) / 9 - 0.012, y + (h * k) / 9 + 0.012, 0.04, 0.06, new THREE.Color(o.shutter).multiplyScalar(0.8), 0.005);
  }
}
function door(K, x, y, w, h, c, o = {}) {
  const f = o.frame ?? 0xf4efe2;
  K.box(M.paint, x - w / 2, x + w / 2, y, y + h, -0.03, 0.035, c, 0.012);
  K.box(M.glass, x - w / 2 + 0.12, x + w / 2 - 0.12, y + h * 0.52, y + h - 0.12, 0.03, 0.045, 0xffffff, 0.004, [w, h * 0.5]);
  for (const sd of [-1, 1]) K.box(M.paint, x + sd * w * 0.22 - w * 0.17, x + sd * w * 0.22 + w * 0.17, y + 0.15, y + h * 0.44, 0.03, 0.055, new THREE.Color(c).multiplyScalar(0.85), 0.01);
  K.put(M.paint, sph(0.045, 8, 6), x + w * 0.36, y + h * 0.47, 0.08, 0, 0, 0, 1, 1, 1, 0xe0b450);
  K.box(M.paint, x - w / 2 - 0.1, x - w / 2, y, y + h + 0.05, -0.02, 0.07, f, 0.012); K.box(M.paint, x + w / 2, x + w / 2 + 0.1, y, y + h + 0.05, -0.02, 0.07, f, 0.012);
  K.box(M.paint, x - w / 2 - 0.16, x + w / 2 + 0.16, y + h + 0.05, y + h + 0.2, -0.02, 0.1, f, 0.015);
  if (o.transom) { K.box(M.glass, x - w / 2, x + w / 2, y + h + 0.2, y + h + 0.55, -0.03, 0.01, 0xffffff, 0.004, [w, 0.35]); K.box(M.paint, x - w / 2 - 0.16, x + w / 2 + 0.16, y + h + 0.55, y + h + 0.68, -0.02, 0.1, f, 0.015); }
}
// a sign board with a painted face (PlaneGeometry for 0..1 uvs) on a framed backing
function signBoard(K, x, y, z, w, h, mat, frame = 0x3a2a1e) {
  K.box(M.paint, x - w / 2 - 0.08, x + w / 2 + 0.08, y - h / 2 - 0.08, y + h / 2 + 0.08, z - 0.05, z + 0.05, frame, 0.02);
  K.put(mat, plane(w, h), x, y, z + 0.055);
}
function chimney(K, x, y0, y1, z, w = 0.55) {
  K.box(M.brick, x - w / 2, x + w / 2, y0, y1, z - w / 2, z + w / 2, 0xffffff, 0.01, 1);
  K.box(M.brick, x - w / 2 - 0.06, x + w / 2 + 0.06, y1, y1 + 0.16, z - w / 2 - 0.06, z + w / 2 + 0.06, 0xd8d0c8, 0.015, 1);
  K.box(M.paint, x - w / 2 + 0.08, x + w / 2 - 0.08, y1 + 0.16, y1 + 0.22, z - w / 2 + 0.08, z + w / 2 - 0.08, 0x2a2224, 0.01);
}
// gable roof over a box w (x) by d (z) from height y, ridge along x
function gableRoof(K, w, d, y, rise, mat, c, over = 0.35, trim = 0xf4efe2, gableWall = 0xffffff, gableMat = M.siding) {
  K.at(0, y, 0, Math.PI / 2, () => K.put(gableMat, prismGeo(d, rise, w), 0, 0, 0, 0, 0, 0, 1, 1, 1, gableWall));
  const half = d / 2 + over, L = Math.hypot(half, rise * (half / (d / 2))), a = Math.atan2(rise, d / 2);
  for (const sd of [-1, 1]) {
    const cz = sd * (half / 2), cy = y + rise - rise * (half / (d / 2)) / 2;
    K.put(mat, rboxGeo(w + 2 * over, 0.12, L, 0.03, [S, S * 0.7]), 0, cy + 0.07 * Math.cos(a), cz + 0.07 * Math.sin(a) * sd, sd * a, 0, 0, 1, 1, 1, c);
    // rake boards at the gable ends
    for (const ex of [-1, 1]) K.put(M.paint, rboxGeo(0.08, 0.2, L, 0.02), ex * (w / 2 + over - 0.04), cy - 0.02, cz, sd * a, 0, 0, 1, 1, 1, trim);
    K.box(M.paint, -w / 2 - over, w / 2 + over, y - rise * (over / (d / 2)) - 0.18, y - rise * (over / (d / 2)) + 0.02, sd * (d / 2 + over) - 0.05, sd * (d / 2 + over) + 0.05, trim, 0.02);
  }
  K.box(M.paint, -w / 2 - over, w / 2 + over, y + rise + 0.02, y + rise + 0.16, -0.09, 0.09, new THREE.Color(c).multiplyScalar(0.7), 0.04);
}

// storefront on a false-front building, facade at z=0, building behind. o: {w, floors, sign, wall, trim, porch|awning, brick}
export function storefront(K, o) {
  const W = o.w, D = o.d ?? 9, F = o.floors ?? 1, H1 = 3.7, H = H1 + 3.1 * (F - 1), Hp = H + (o.parapet ?? 1.5), wallM = o.brick ? M.brick : M.siding, wc = o.brick ? 0xffffff : o.wall, tc = o.trim;
  K.box(wallM, -W / 2, W / 2, 0, H, -D, 0, wc, 0.02, o.brick ? 1 : S);
  K.box(wallM, -W / 2, W / 2, H, Hp, -0.3, 0, wc, 0.02, o.brick ? 1 : S);
  if (o.peak) { K.at(0, Hp, -0.15, 0, () => K.put(wallM, prismGeo(W * 0.5, 0.7, 0.3, o.brick ? 1 : S), 0, 0, 0, 0, 0, 0, 1, 1, 1, wc)); K.box(M.paint, -0.25, 0.25, Hp + 0.62, Hp + 0.85, -0.22, 0.12, tc, 0.04); }
  K.box(M.stone, -W / 2 - 0.04, W / 2 + 0.04, -0.02, 0.35, -D, 0.06, 0xffffff, 0.02, 1.4);
  K.box(M.paint, -W / 2 - 0.2, W / 2 + 0.2, Hp - 0.04, Hp + 0.16, -0.32, 0.3, tc, 0.03);
  K.box(M.paint, -W / 2 - 0.12, W / 2 + 0.12, Hp - 0.55, Hp - 0.04, -0.3, 0.16, tc, 0.02);
  for (let x = -W / 2 + 0.25; x <= W / 2 - 0.2; x += (W - 0.5) / Math.round((W - 0.5) / 0.8)) K.box(M.paint, x - 0.07, x + 0.07, Hp - 0.75, Hp - 0.55, 0, 0.2, tc, 0.02);
  for (const sd of [-1, 1]) K.box(M.paint, sd * W / 2 - 0.17, sd * W / 2 + 0.03 * sd, 0.3, Hp - 0.5, -0.02, 0.07, tc, 0.015);
  if (F > 1) K.box(M.paint, -W / 2 - 0.06, W / 2 + 0.06, H1 - 0.1, H1 + 0.08, -0.02, 0.12, tc, 0.02);
  // ground floor: two display windows with transoms and panelled kickplates around a central door
  const dw = 1.15, side = (W - dw - 0.9) / 2;
  for (const sd of [-1, 1]) {
    const cx = sd * (dw / 2 + 0.2 + side / 2);
    K.box(M.paint, cx - side / 2, cx + side / 2, 0.35, 0.85, -0.02, 0.07, tc, 0.015);
    K.box(M.paint, cx - side / 2 + 0.1, cx + side / 2 - 0.1, 0.45, 0.75, 0.06, 0.09, new THREE.Color(tc).multiplyScalar(0.85), 0.01);
    win(K, cx, 0.92, side - 0.16, 1.85, { frame: tc, shop: true, cols: side > 2 ? 3 : 2, shade: o.shade });
    win(K, cx, 2.98, side - 0.16, 0.45, { frame: tc, shop: true, cols: side > 2 ? 6 : 4 });
    if (o.goods) for (let k = 0; k < 4; k++) { const gx = cx - side / 2 + 0.35 + k * (side - 0.6) / 3; K.put(M.paint, k % 2 ? cyl(0.1, 0.12, 0.3, 8) : rboxGeo(0.25, 0.22, 0.2, 0.02), gx, 1.04, 0.13, 0, 0, 0, 1, 1, 1, pick([0xc0453a, 0xe0b450, 0x3f6fb5, 0xf2eee2, 0x5a8a4a], gx * 3 + W)); }
  }
  door(K, 0, 0.35, dw, 2.35, o.door ?? 0x5a3626, { frame: tc, transom: true });
  for (const sd of [-1, 1]) K.box(M.paint, sd * (dw / 2 + 0.12) - 0.1, sd * (dw / 2 + 0.12) + 0.1, 0.35, H1 - 0.1, -0.02, 0.1, tc, 0.015);
  // sign
  if (o.sign) { const sy = H + 0.68, sw = Math.min(W - 0.8, 6.2), sh = 0.95; signBoard(K, 0, sy, 0.12, sw, sh, o.sign, tc); }
  // upper floors
  for (let f = 1; f < F; f++) { const n = Math.max(2, Math.round(W / 2.3)); for (let i = 0; i < n; i++) { const x = -W / 2 + (W * (i + 0.5)) / n; win(K, x, H1 + 0.75 + 3.1 * (f - 1), 0.85, 1.55, { frame: tc, shutter: o.shutter, curtain: o.curtain ?? 0xf2eee2, cols: 2 }); } }
  if (o.balcony && F > 1) { K.box(M.wood, -W / 2, W / 2, H1 + 0.1, H1 + 0.2, 0, 1.2, 0xb08a60, 0.02); K.box(M.paint, -W / 2, W / 2, H1 + 1.05, H1 + 1.12, 1.12, 1.2, tc, 0.015); for (let x = -W / 2 + 0.1; x < W / 2; x += 0.22) K.box(M.paint, x - 0.025, x + 0.025, H1 + 0.2, H1 + 1.05, 1.13, 1.18, tc, 0.006); }
  // porch roof over the boardwalk on posts, or striped awning
  if (o.porch) {
    const y0 = H1 - 0.05, zx = 3.1;
    K.put(M.shingle, rboxGeo(W + 0.2, 0.1, zx + 0.2, 0.02), 0, y0 - 0.2, zx / 2, -0.1, 0, 0, 1, 1, 1, o.roof ?? 0x6a5a52);
    K.box(M.paint, -W / 2 - 0.1, W / 2 + 0.1, y0 - 0.65, y0 - 0.4, zx - 0.02, zx + 0.08, tc, 0.02);
    const np = W > 7 ? 3 : 2; for (let i = 0; i < np; i++) { const px = -W / 2 + 0.2 + ((W - 0.4) * i) / (np - 1);
      K.box(M.paint, px - 0.08, px + 0.08, 0.3, y0 - 0.4, zx - 0.12, zx + 0.04, tc, 0.02); K.box(M.paint, px - 0.12, px + 0.12, 0.3, 0.42, zx - 0.16, zx + 0.08, tc, 0.02);
      for (const sd of [-1, 1]) if ((i > 0 || sd > 0) && (i < np - 1 || sd < 0)) K.put(M.paint, rboxGeo(0.06, 0.7, 0.06, 0.01), px + sd * 0.3, y0 - 0.62, zx - 0.05, 0, 0, sd * 0.9, 1, 1, 1, tc); }
  } else if (o.awning) {
    const am = o.awning; K.put(am, plane(W - 0.3, 1.9), 0, H1 - 0.4, 0.82, -1.1, 0, 0);
    K.put(am, plane(W - 0.3, 0.28), 0, H1 - 1.28, 1.62, 0, 0, 0);
    K.box(M.paint, -W / 2 + 0.1, W / 2 - 0.1, H1 + 0.32, H1 + 0.42, 0, 0.12, 0x2a2224, 0.02);
    for (const sd of [-1, 1]) K.beam(M.paint, [sd * (W / 2 - 0.2), H1 + 0.4, 0.05], [sd * (W / 2 - 0.2), H1 - 1.12, 1.62], 0.025, 0x2a2224, true, 4);
  }
  K.box(M.paint, -W / 2, W / 2, H, H + 0.12, -D, -0.3, 0x4a4446, 0.02);
  if (o.chimney !== false) chimney(K, W * 0.28 * (rnd(W) > 0.5 ? 1 : -1), H - 0.2, H + 1.8, -D * 0.65);
  // painted wall ad on the side facing the camera
  if (o.ad) K.at(o.adSide * (W / 2 + 0.01), 0, -D / 2, o.adSide * Math.PI / 2, () => K.put(o.ad, plane(D * 0.7, 2.2), 0, H - 1.5, 0));
  if (o.sideWin) K.at(o.adSide * (W / 2), 0, -D * 0.25, o.adSide * Math.PI / 2, () => { win(K, 0, H1 + 0.7, 0.8, 1.4, { frame: tc }); if (!o.ad) win(K, -D * 0.4, 1.1, 0.8, 1.4, { frame: tc }); });
}

// house with gable roof, porch, windows, chimney. Front faces +z.
export function house(K, o) {
  const W = o.w ?? 7, D = o.d ?? 6, F = o.floors ?? 1, H = 0.5 + 2.9 * F, wc = o.wall, tc = o.trim ?? 0xf4efe2, rc = o.roof ?? 0x6a5a52;
  K.box(M.stone, -W / 2 - 0.05, W / 2 + 0.05, 0, 0.5, -D / 2 - 0.05, D / 2 + 0.05, 0xffffff, 0.02, 1.4);
  K.box(M.siding, -W / 2, W / 2, 0.5, H, -D / 2, D / 2, wc, 0.02);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) K.box(M.paint, sx * W / 2 - 0.08, sx * W / 2 + 0.08, 0.5, H, sz * D / 2 - 0.08, sz * D / 2 + 0.08, tc, 0.015);
  K.box(M.paint, -W / 2 - 0.08, W / 2 + 0.08, H - 0.22, H, -D / 2 - 0.08, D / 2 + 0.08, tc, 0.015);
  gableRoof(K, W, D, H, o.rise ?? 2.0, M.shingle, rc, 0.4, tc, wc);
  K.at(0, 0, D / 2, 0, () => {
    const n = o.frontWin ?? 2; door(K, o.doorX ?? 0, 0.5, 1.0, 2.2, o.door ?? 0x6a2a2a, { frame: tc });
    for (let i = 0; i < n; i++) { const x = (i < n / 2 ? -1 : 1) * (W * 0.3); win(K, x, 1.3, 0.85, 1.4, { frame: tc, shutter: o.shutter, curtain: 0xf2eee2 }); }
    for (let f = 1; f < F; f++) for (const x of [-W * 0.3, 0, W * 0.3]) win(K, x, 1.3 + 2.9 * f, 0.8, 1.3, { frame: tc, shutter: o.shutter, curtain: 0xf2eee2 });
    if (o.porch !== false) {
      const pd = 1.9, py = 0.5, ph = 2.65, pw = W * 0.8;
      K.box(M.wood, -pw / 2, pw / 2, py - 0.1, py, 0, pd, 0xb89a74, 0.02);
      K.box(M.paint, -pw / 2, pw / 2, 0, py - 0.1, pd - 0.08, pd, tc, 0.01);
      for (let k = 0; k < 3; k++) K.box(M.wood, -0.6, 0.6, py - 0.17 * (k + 1), py - 0.17 * (k + 1) + 0.06, pd + 0.3 * k, pd + 0.3 * (k + 1), 0xa88a64, 0.015);
      K.put(M.shingle, rboxGeo(pw + 0.3, 0.09, pd + 0.4, 0.02), 0, py + ph + 0.15, pd / 2 + 0.1, 0.2, 0, 0, 1, 1, 1, rc);
      K.box(M.paint, -pw / 2 - 0.15, pw / 2 + 0.15, py + ph - 0.25, py + ph - 0.02, pd + 0.1, pd + 0.2, tc, 0.02);
      for (const x of [-pw / 2 + 0.1, -0.75, 0.75, pw / 2 - 0.1]) { K.box(M.paint, x - 0.07, x + 0.07, py, py + ph - 0.05, pd - 0.14, pd, tc, 0.02); K.put(M.paint, rboxGeo(0.05, 0.5, 0.05, 0.01), x + (x < 0 ? 0.25 : -0.25), py + ph - 0.32, pd - 0.07, 0, 0, x < 0 ? 0.8 : -0.8, 1, 1, 1, tc); }
      for (const [a, b] of [[-pw / 2 + 0.1, -0.75], [0.75, pw / 2 - 0.1]]) { K.box(M.paint, a, b, py + 0.82, py + 0.9, pd - 0.11, pd - 0.03, tc, 0.01); K.box(M.paint, a, b, py + 0.1, py + 0.16, pd - 0.11, pd - 0.03, tc, 0.01); for (let x = a + 0.12; x < b - 0.05; x += 0.16) K.box(M.paint, x - 0.02, x + 0.02, py + 0.16, py + 0.82, pd - 0.09, pd - 0.05, tc, 0.005); }
      if (o.chair) { const cx = -pw / 4; K.box(M.wood, cx - 0.28, cx + 0.28, py + 0.42, py + 0.48, 0.5, 1.0, 0x8a5a3a, 0.015); K.box(M.wood, cx - 0.28, cx + 0.28, py + 0.48, py + 1.1, 0.45, 0.52, 0x8a5a3a, 0.015); for (const lx of [-0.24, 0.24]) K.put(M.wood, tor(0.45, 0.02, 3, 10, 1.2), cx + lx, py + 0.4, 0.75, 0, Math.PI / 2, -2.2, 1, 0.3, 1, 0x6a4a2e); }
    }
  });
  for (const sd of [-1, 1]) K.at(sd * W / 2, 0, 0, sd * Math.PI / 2, () => { win(K, 0, 1.3, 0.8, 1.4, { frame: tc, curtain: 0xf2eee2 }); for (let f = 1; f < F; f++) win(K, 0, 1.3 + 2.9 * f, 0.8, 1.3, { frame: tc }); });
  chimney(K, W * 0.25, H + 0.5, H + (o.rise ?? 2.0) + 0.9, -0.4);
}

// red barn with gambrel roof, X-braced doors, hayloft, cupola. Front (gable) faces +z.
function barn(K, o) {
  const W = o.w ?? 9, D = o.d ?? 12, H = 4.2, c = o.wall ?? 0xa8382e, tc = 0xf2eee4, rc = o.roof ?? 0x5a4a4a;
  const sh = new THREE.Shape(); const pts = [[-W / 2, 0], [W / 2, 0], [W / 2, H], [W * 0.32, H + 2.3], [0, H + 3.2], [-W * 0.32, H + 2.3], [-W / 2, H]]; pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));
  const eg = cached('barn' + W + D, () => { const g = new THREE.ExtrudeGeometry(sh, { depth: D, bevelEnabled: false }); g.translate(0, 0, -D / 2); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / S, uv.getY(i) / S); return g; });
  K.put(M.vb, eg, 0, 0, 0, 0, 0, 0, 1, 1, 1, c);
  const seg = [[[W / 2 + 0.25, H - 0.15], [W * 0.32, H + 2.3]], [[W * 0.32, H + 2.3], [0, H + 3.2]]];
  for (const sd of [-1, 1]) for (const [a, b] of seg) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) + 0.12, ang = Math.atan2(b[1] - a[1], b[0] - a[0]); K.put(M.shingle, rboxGeo(L, 0.12, D + 0.6, 0.03), sd * (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.08, 0, 0, 0, sd * ang, sd, 1, 1, rc); }
  K.at(0, 0, D / 2, 0, () => {
    for (const sd of [-1, 1]) { const x0 = sd > 0 ? 0.02 : -1.5, x1 = x0 + 1.48;
      K.box(M.vb, x0, x1, 0, 3.0, 0, 0.06, c, 0.01); K.box(M.paint, x0, x1, 0, 0.14, 0.06, 0.1, tc, 0.01); K.box(M.paint, x0, x1, 2.86, 3.0, 0.06, 0.1, tc, 0.01);
      K.box(M.paint, x0, x0 + 0.14, 0, 3.0, 0.06, 0.1, tc, 0.01); K.box(M.paint, x1 - 0.14, x1, 0, 3.0, 0.06, 0.1, tc, 0.01);
      K.beam(M.paint, [x0 + 0.1, 0.12, 0.09], [x1 - 0.1, 2.88, 0.09], 0.11, tc); K.beam(M.paint, [x1 - 0.1, 0.12, 0.09], [x0 + 0.1, 2.88, 0.09], 0.11, tc); }
    K.box(M.paint, -1.7, 1.7, 3.05, 3.2, 0, 0.18, 0x3a3a3a, 0.02);
    K.box(M.vb, -0.75, 0.75, H + 0.3, H + 1.8, 0, 0.06, c, 0.01); K.box(M.paint, -0.85, 0.85, H + 0.2, H + 0.32, 0, 0.1, tc, 0.01); K.box(M.paint, -0.85, 0.85, H + 1.8, H + 1.92, 0, 0.1, tc, 0.01);
    for (const sd of [-1, 1]) K.box(M.paint, sd * 0.8 - 0.06, sd * 0.8 + 0.06, H + 0.2, H + 1.92, 0, 0.1, tc, 0.01);
    K.beam(M.paint, [-0.7, H + 0.35, 0.08], [0.7, H + 1.75, 0.08], 0.09, tc); K.beam(M.paint, [0.7, H + 0.35, 0.08], [-0.7, H + 1.75, 0.08], 0.09, tc);
    K.box(M.paint, -0.1, 0.1, H + 2.0, H + 2.9, 0, 1.0, 0x4a3a32, 0.02);
    for (const sd of [-1, 1]) win(K, sd * 3.1, 1.6, 0.7, 0.7, { frame: tc, cols: 2, rows: 2 });
  });
  K.box(M.vb, -0.6, 0.6, H + 3.1, H + 4.0, -0.6, 0.6, tc, 0.02); K.at(0, H + 4.0, 0, Math.PI / 4, () => K.put(M.shingle, cone(1.0, 0.8, 4), 0, 0.4, 0, 0, 0, 0, 1, 1, 1, rc));
  K.beam(M.paint, [0, H + 4.6, 0], [0, H + 5.6, 0], 0.025, 0x2a2224, true, 4); K.box(M.paint, -0.35, 0.35, H + 5.3, H + 5.38, -0.02, 0.02, 0x2a2224, 0.005);
  K.put(M.paint, cone(0.08, 0.35, 4), 0, H + 5.6, 0, 0, 0, 0, 1, 1, 1, 0xd9b04a);
}

// lattice windmill (farm water pump)
function windmill(K) {
  const h = 9, c = 0x8a8f96, leg = (sx, sz) => [sx * 1.1, 0, sz * 1.1];
  const top = (sx, sz) => [sx * 0.25, h, sz * 0.25];
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.beam(M.paint, leg(sx, sz), top(sx, sz), 0.06, c);
  for (let k = 0; k < 4; k++) { const t0 = k / 4, t1 = (k + 1) / 4, P = (s, t) => [s[0] * (1.1 - 0.85 * t), h * t, s[1] * (1.1 - 0.85 * t)];
    const C = [[-1, -1], [1, -1], [1, 1], [-1, 1]]; for (let i = 0; i < 4; i++) { const a = C[i], b = C[(i + 1) % 4]; K.beam(M.paint, P(a, t0), P(b, t1), 0.025, c); K.beam(M.paint, P(b, t0), P(a, t1), 0.025, c); K.beam(M.paint, P(a, t1), P(b, t1), 0.03, c); } }
  K.box(M.paint, -0.45, 0.45, h, h + 0.12, -0.45, 0.45, 0x6a6a72, 0.02);
  K.at(0, h + 0.6, 0.35, 0, () => {
    for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; K.put(M.paint, rboxGeo(0.22, 1.25, 0.02, 0.005), Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0, 0, 0.35, a - Math.PI / 2, 1, 1, 1, i % 2 ? 0xe6e2d8 : 0xc8c4ba); }
    K.put(M.paint, tor(1.55, 0.03, 4, 28), 0, 0, 0, 0, 0, 0, 1, 1, 1, c); K.put(M.paint, tor(0.4, 0.03, 4, 16), 0, 0, 0, 0, 0, 0, 1, 1, 1, c);
    K.put(M.paint, cyl(0.12, 0.12, 0.35, 8), 0, 0, -0.1, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a3a42);
  });
  K.beam(M.paint, [0, h + 0.6, 0.2], [0, h + 0.6, -2.0], 0.04, c); K.put(M.paint, rboxGeo(0.02, 1.0, 1.4, 0.005), 0, h + 0.75, -2.3, 0, 0, 0, 1, 1, 1, 0xc0453a);
}

// ---------------------------------------------------------------- props (prefabs)
const PF = {};
function prefabs() {
  if (PF.done) return PF; PF.done = true;
  let K = new Kit();
  // barrel: bulged staves + iron hoops + lid
  K.put(M.vb, barrelGeo(), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xb07a4a);
  for (const y of [0.1, 0.32, 0.58, 0.8]) K.put(M.paint, tor(0.3 + 0.05 * Math.sin((y / 0.9) * Math.PI), 0.016, 3, 16), 0, y, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x34303a);
  PF.barrel = K.prefab();
  K = new Kit(); // crate with framed edges
  K.box(M.vb, -0.4, 0.4, 0, 0.62, -0.32, 0.32, 0xc89a64, 0.015, 1);
  for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.box(M.wood, x * 0.4 - 0.05, x * 0.4 + 0.05, 0, 0.62, z * 0.32 - 0.05, z * 0.32 + 0.05, 0x9a6a3e, 0.012);
  for (const y of [0.03, 0.59]) for (const z of [-1, 1]) K.box(M.wood, -0.4, 0.4, y - 0.04, y + 0.04, z * 0.32 - 0.05, z * 0.32 + 0.05, 0x9a6a3e, 0.012);
  K.beam(M.wood, [-0.36, 0.06, 0.35], [0.36, 0.56, 0.35], 0.07, 0x9a6a3e);
  PF.crate = K.prefab();
  K = new Kit(); // square hay bale with twine
  K.box(M.straw, -0.45, 0.45, 0, 0.42, -0.25, 0.25, 0xffffff, 0.06, 1, 2);
  for (const x of [-0.2, 0.2]) K.box(M.paint, x - 0.012, x + 0.012, -0.005, 0.425, -0.255, 0.255, 0x7a5a32, 0.01);
  PF.bale = K.prefab();
  K = new Kit(); // haystack with a pole
  K.put(M.straw, clumpGeo(1), 0, 0.6, 0, 0, 0, 0, 1.7, 1.9, 1.7, 0xffffff); K.put(M.straw, clumpGeo(2), 0.2, 2.1, 0.1, 0, 0, 0, 0.9, 0.9, 0.9, 0xf0e0c0);
  K.beam(M.wood, [0, 0, 0], [0.05, 3.5, 0], 0.05, 0x7a5a3a, true, 5);
  PF.stack = K.prefab();
  K = new Kit(); // grass tuft: 7 blades
  for (let i = 0; i < 7; i++) { const a = i * 2.4, l = 0.32 + 0.3 * rnd(i * 3.3); K.put(M.paint, cone(0.03, l, 3), Math.cos(a) * 0.05, l / 2, Math.sin(a) * 0.05, Math.sin(a) * 0.35, 0, Math.cos(a) * 0.35, 1, 1, 1, i % 3 ? 0xa8a048 : 0x8a9a3e); }
  PF.tuft = K.prefab(); PF.tuft.forEach(([m]) => (m.userData.tint = true));
  K = new Kit(); // wildflower tuft
  for (let i = 0; i < 4; i++) { const a = i * 1.9, l = 0.4 + 0.25 * rnd(i * 5); K.beam(M.paint, [0, 0, 0], [Math.cos(a) * 0.12, l, Math.sin(a) * 0.12], 0.012, 0x6a8a3a, true, 3); K.put(M.paint, sph(0.045, 5, 4), Math.cos(a) * 0.12, l, Math.sin(a) * 0.12, 0, 0, 0, 1, 0.7, 1, [0xf2f0ea, 0xf2c030, 0xb87ad0, 0xe86a5a][i]); }
  PF.flower = K.prefab();
  // wagon: green box bed, red running gear, spoked wheels, tongue
  K = new Kit();
  const wheel = (x, z, r) => { K.put(M.paint, tor(r - 0.03, 0.035, 4, 22), x, r, z, 0, Math.PI / 2, 0, 1, 1, 1, 0x2a2830); K.put(M.paint, tor(r - 0.08, 0.03, 4, 22), x, r, z, 0, Math.PI / 2, 0, 1, 1, 1, 0xa83a2e);
    K.put(M.paint, cyl(0.08, 0.1, 0.22, 8), x, r, z, 0, 0, Math.PI / 2, 1, 1, 1, 0x7a2a22); for (let k = 0; k < 6; k++) K.put(M.paint, cyl(0.018, 0.022, 2 * r - 0.14, 4), x, r, z, (k * Math.PI) / 6, 0, 0, 1, 1, 1, 0xa83a2e); };
  for (const sd of [-1, 1]) { wheel(sd * 0.72, 1.05, 0.48); wheel(sd * 0.72, -1.1, 0.62); }
  K.box(M.paint, -0.72, 0.72, 0.42, 0.52, 1.0, 1.12, 0x7a2a22, 0.02); K.box(M.paint, -0.72, 0.72, 0.56, 0.66, -1.16, -1.04, 0x7a2a22, 0.02); K.box(M.paint, -0.07, 0.07, 0.5, 0.6, -1.1, 1.1, 0x7a2a22, 0.02);
  K.box(M.vb, -0.55, 0.55, 0.66, 0.74, -1.5, 1.4, 0x4a7a4a, 0.015, 1); for (const sd of [-1, 1]) K.box(M.vb, sd * 0.55 - 0.04, sd * 0.55 + 0.04, 0.74, 1.15, -1.5, 1.4, 0x4a7a4a, 0.015, 1);
  K.box(M.vb, -0.55, 0.55, 0.74, 1.15, 1.36, 1.44, 0x4a7a4a, 0.015, 1); K.box(M.vb, -0.55, 0.55, 0.74, 1.15, -1.54, -1.46, 0x4a7a4a, 0.015, 1);
  for (const sd of [-1, 1]) K.box(M.paint, sd * 0.6 - 0.02, sd * 0.6 + 0.02, 0.98, 1.06, -1.5, 1.4, 0xd9b04a, 0.008);
  K.box(M.wood, -0.5, 0.5, 1.32, 1.38, 0.6, 0.95, 0x9a6a3e, 0.015); for (const sd of [-1, 1]) K.box(M.paint, sd * 0.42 - 0.02, sd * 0.42 + 0.02, 1.1, 1.32, 0.7, 0.75, 0x2a2830, 0.005);
  K.beam(M.wood, [0, 0.5, 1.1], [0, 0.06, 3.3], 0.07, 0x9a6a3e); K.box(M.wood, -0.45, 0.45, 0.45, 0.52, 1.6, 1.68, 0x9a6a3e, 0.015);
  PF.wagon = K.prefab();
  K = new Kit(); // telegraph pole
  K.put(M.wood, cyl(0.1, 0.15, 9, 7), 0, 4.5, 0, 0, 0, 0, 1, 1, 1, 0x7a6450);
  for (const y of [8.4, 7.7]) { K.box(M.wood, -1.15, 1.15, y - 0.06, y + 0.06, -0.06, 0.06, 0x8a7258, 0.015); for (const sd of [-1, 1]) K.beam(M.paint, [sd * 0.7, y - 0.05, 0.08], [0, y - 0.6, 0.12], 0.025, 0x3a3434);
    for (const x of [-1.0, -0.6, 0.6, 1.0]) { K.put(M.paint, cyl(0.015, 0.015, 0.14, 4), x, y + 0.12, 0, 0, 0, 0, 1, 1, 1, 0x5a4a3a); K.put(M.glow, cyl(0.035, 0.05, 0.1, 7), x, y + 0.2, 0, 0, 0, 0, 1, 1, 1, 0x8ec8b0); } }
  K.put(M.paint, cone(0.13, 0.15, 7), 0, 9.07, 0, 0, 0, 0, 1, 1, 1, 0x5a4a3a);
  PF.pole = K.prefab();
  K = new Kit(); // street lamp: iron post + glass lantern
  K.put(M.paint, cyl(0.16, 0.22, 0.35, 8), 0, 0.17, 0, 0, 0, 0, 1, 1, 1, 0x2a2e36); K.put(M.paint, cyl(0.05, 0.07, 2.9, 8), 0, 1.75, 0, 0, 0, 0, 1, 1, 1, 0x2a2e36);
  K.put(M.paint, cyl(0.12, 0.06, 0.12, 8), 0, 3.2, 0, 0, 0, 0, 1, 1, 1, 0x2a2e36); K.box(M.paint, -0.3, 0.3, 3.0, 3.04, -0.04, 0.04, 0x2a2e36, 0.01);
  K.put(M.glow, cyl(0.2, 0.14, 0.5, 4), 0, 3.52, 0, 0, Math.PI / 4, 0, 1, 1, 1, 0xffffff); for (let k = 0; k < 4; k++) { const a = (k * Math.PI) / 2 + Math.PI / 4; K.beam(M.paint, [Math.cos(a) * 0.14, 3.27, Math.sin(a) * 0.14], [Math.cos(a) * 0.2, 3.77, Math.sin(a) * 0.2], 0.018, 0x2a2e36); }
  K.put(M.paint, cone(0.3, 0.28, 4), 0, 3.92, 0, 0, Math.PI / 4, 0, 1, 1, 1, 0x2a2e36); K.put(M.paint, sph(0.05, 6, 4), 0, 4.1, 0, 0, 0, 0, 1, 1, 1, 0x2a2e36);
  PF.lamp = K.prefab();
  K = new Kit(); // water trough + hand pump
  K.box(M.wood, -1.0, 1.0, 0.0, 0.1, -0.35, 0.35, 0x8a6a4a, 0.015); for (const sd of [-1, 1]) { K.box(M.wood, -1.0, 1.0, 0.1, 0.65, sd * 0.35 - 0.05, sd * 0.35 + 0.05, 0x9a7854, 0.015); K.box(M.wood, sd * 1.0 - 0.05, sd * 1.0 + 0.05, 0.1, 0.65, -0.3, 0.3, 0x9a7854, 0.015); }
  for (const x of [-0.6, 0.6]) K.box(M.paint, x - 0.03, x + 0.03, 0.0, 0.67, -0.42, 0.42, 0x3a3434, 0.01);
  K.box(M.paint, -0.95, 0.95, 0.5, 0.52, -0.3, 0.3, 0x4f86a8, 0.005);
  K.put(M.paint, cyl(0.09, 0.11, 1.0, 8), 1.3, 0.5, 0, 0, 0, 0, 1, 1, 1, 0x3a4048); K.put(M.paint, cyl(0.12, 0.09, 0.12, 8), 1.3, 1.05, 0, 0, 0, 0, 1, 1, 1, 0x3a4048);
  K.beam(M.paint, [1.3, 0.85, 0], [1.0, 0.75, 0], 0.035, 0x3a4048, true, 6); K.beam(M.paint, [1.3, 1.12, 0], [1.75, 1.45, 0], 0.025, 0x3a4048, true, 5);
  K.box(M.wood, 1.05, 1.55, 0, 0.05, -0.25, 0.25, 0x8a6a4a, 0.01);
  PF.trough = K.prefab();
  K = new Kit(); // bench
  K.box(M.wood, -0.8, 0.8, 0.42, 0.47, -0.2, 0.2, 0xa07850, 0.015); K.box(M.wood, -0.8, 0.8, 0.6, 0.9, -0.24, -0.2, 0xa07850, 0.015);
  for (const x of [-0.7, 0.7]) { K.box(M.wood, x - 0.04, x + 0.04, 0, 0.42, -0.18, 0.18, 0x7a5a3a, 0.01); K.box(M.wood, x - 0.03, x + 0.03, 0.42, 0.9, -0.26, -0.2, 0x7a5a3a, 0.01); }
  PF.bench = K.prefab();
  K = new Kit(); // hitching rail
  for (const x of [-1.2, 1.2]) K.box(M.wood, x - 0.07, x + 0.07, 0, 1.0, -0.07, 0.07, 0x8a6a4a, 0.02); K.box(M.wood, -1.35, 1.35, 0.92, 1.02, -0.05, 0.05, 0x9a7854, 0.02);
  PF.hitch = K.prefab();
  K = new Kit(); // milk cans
  for (const [x, z] of [[0, 0], [0.32, 0.1], [0.12, 0.33]]) { K.put(M.paint, cyl(0.15, 0.15, 0.45, 10), x, 0.225, z, 0, 0, 0, 1, 1, 1, 0xb8bcc4); K.put(M.paint, cyl(0.07, 0.15, 0.14, 10), x, 0.52, z, 0, 0, 0, 1, 1, 1, 0xb8bcc4); K.put(M.paint, cyl(0.08, 0.08, 0.08, 10), x, 0.62, z, 0, 0, 0, 1, 1, 1, 0x9a9ea6); }
  PF.cans = K.prefab();
  K = new Kit(); // mailbox on a post
  K.box(M.wood, -0.05, 0.05, 0, 1.05, -0.05, 0.05, 0x8a6a4a, 0.015); K.box(M.paint, -0.13, 0.13, 1.05, 1.25, -0.25, 0.25, 0x8a9096, 0.06); K.box(M.paint, 0.13, 0.15, 1.2, 1.4, 0.05, 0.1, 0xc0453a, 0.01);
  PF.mail = K.prefab();
  // trees
  PF.trees = [0, 1, 2].map((v) => treePrefab(v)); PF.bush = bushPrefab();
  return PF;
}
// broadleaf tree: bent trunk, branches, ~18 lumpy leaf clumps shaded darker underneath
function treePrefab(v) {
  const K = new Kit(), bark = 0x6b4e38, tall = v === 1, H = tall ? 5.4 : 3.6, rad = tall ? 1.9 : 2.8;
  let p = [0, 0, 0];
  for (let i = 0; i < 3; i++) { const q = [p[0] + (rnd(v * 7 + i) - 0.5) * 0.4, p[1] + H / 3 + 0.2, p[2] + (rnd(v * 9 + i) - 0.5) * 0.4]; K.beam(M.wood, p, q, 0.28 - i * 0.06, bark, true, 7); p = q; }
  K.put(M.wood, cone(0.5, 0.5, 7), 0, 0.2, 0, 0, 0, 0, 1, 1, 1, bark);
  const tips = [];
  for (let i = 0; i < 6; i++) { const a = i * 2.1 + v, y0 = H * (0.55 + 0.08 * (i % 3)), L = rad * (0.6 + 0.3 * rnd(v * 3 + i)), tip = [Math.cos(a) * L, y0 + L * 0.7, Math.sin(a) * L]; K.beam(M.wood, [0, y0, 0], tip, 0.09, bark, true, 5); tips.push(tip); }
  const C = new THREE.Color(), dark = new THREE.Color(0x35603a), light = new THREE.Color(0x9cbc5a), cy = H + rad * 0.55;
  const blobs = [...tips.map((t) => [t[0], t[1] + 0.3, t[2], 0.95 + 0.3 * rnd(t[0])])];
  for (let i = 0; i < 24; i++) { const a = i * 2.39 + v, e = (rnd(v * 31 + i) - 0.35) * 1.4, r = rad * (0.6 + 0.4 * rnd(i * 5 + v)); blobs.push([Math.cos(a) * Math.cos(e) * r, cy + Math.sin(e) * rad * 0.75, Math.sin(a) * Math.cos(e) * r, 0.7 + 0.4 * rnd(i * 13 + v)]); }
  blobs.push([0, cy + rad * 0.55, 0, 1.3]);
  const ys = blobs.map((b) => b[1]), y0 = Math.min(...ys), y1 = Math.max(...ys);
  blobs.forEach((b, i) => { C.copy(dark).lerp(light, Math.min(1, Math.max(0, (b[1] - y0) / (y1 - y0 + 0.01) * 0.85 + 0.15 * rnd(i * 3 + v)))); const s = b[3] * (tall ? 0.9 : 1); K.put(M.leaf, clumpGeo(i % 3), b[0], b[1], b[2], 0, i, 0, s * 1.15, s * 0.85, s * 1.15, C.clone()); });
  return K.prefab();
}
function bushPrefab() {
  const K = new Kit(), C = new THREE.Color();
  for (let i = 0; i < 6; i++) { const a = i * 2.1, r = i ? 0.55 : 0; C.set(0x4a7a3a).lerp(new THREE.Color(0x8aa84a), i ? 0.3 + 0.4 * rnd(i) : 0.9); K.put(M.leaf, clumpGeo(i % 3), Math.cos(a) * r, 0.45 + (i ? 0 : 0.35), Math.sin(a) * r, 0, i, 0, 0.6, 0.5, 0.6, C.clone()); }
  return K.prefab();
}
export const props = () => prefabs();

// ---------------------------------------------------------------- fences
// post-and-rail fence from z0 to z1 at x; wear = random lean, sag, missing rails
function railFence(K, x, z0, z1, o = {}) {
  const step = o.step ?? 2.4, rails = o.rails ?? [0.45, 0.85], c = o.col ?? 0x8a7258; let prev = null, i = 0;
  for (let z = z0; z <= z1 + 1e-3; z += step, i++) {
    const k = z * 3.7 + x, lean = (rnd(k) - 0.5) * 0.12, h = (o.h ?? 1.15) + (rnd(k + 1) - 0.5) * 0.12, cc = new THREE.Color(c).multiplyScalar(0.82 + 0.3 * rnd(k + 2));
    K.cb(M.wood, 0.14, h, 0.14, x + Math.sin(lean) * h / 2, h / 2, z, cc, 0, rnd(k + 3) * 0.5, lean, 0.02);
    K.cb(M.wood, 0.17, 0.05, 0.17, x + Math.sin(lean) * h, h, z, cc.clone().multiplyScalar(0.8), 0, 0, lean, 0.02);
    if (prev) rails.forEach((ry, j) => { if (rnd(k * 1.3 + j) < 0.06) return; const sag = rnd(k + j * 5) < 0.08 ? -0.35 : (rnd(k + j) - 0.5) * 0.06; K.beam(M.wood, [x + 0.08, ry + (rnd(k + j * 2) - 0.5) * 0.04, prev], [x + 0.08, ry + sag, z], 0.075, new THREE.Color(o.rail ?? c).multiplyScalar(0.85 + 0.3 * rnd(k + j * 7))); });
    prev = z;
  }
}
// zig-zag split-rail (worm) fence along z at x
function wormFence(K, x, z0, z1, c = 0x8a7a64) {
  const L = 3.0, n = Math.floor((z1 - z0) / (L * 0.9));
  for (let i = 0; i < n; i++) { const za = z0 + i * L * 0.9, zb = za + L * 0.9, xa = x + (i % 2 ? 0.35 : -0.35), xb = x + (i % 2 ? -0.35 : 0.35);
    for (let k = 0; k < 4; k++) { const y = 0.18 + k * 0.26 + (i % 2) * 0.13; K.beam(M.wood, [xa, y, za - 0.2], [xb, y + (rnd(i * 4 + k) - 0.5) * 0.05, zb + 0.2], 0.085, new THREE.Color(c).multiplyScalar(0.8 + 0.35 * rnd(i * 7 + k))); }
    if (i % 2 === 0) { K.beam(M.wood, [xb - 0.18, 0, zb], [xb + 0.1, 1.35, zb], 0.07, c); K.beam(M.wood, [xb + 0.18, 0, zb], [xb - 0.1, 1.35, zb], 0.07, c); }
  }
}
function picketFence(K, x0, x1, z, c = 0xf2eee4) {
  K.box(M.paint, x0, x1, 0.25, 0.32, z - 0.03, z + 0.03, c, 0.01); K.box(M.paint, x0, x1, 0.75, 0.82, z - 0.03, z + 0.03, c, 0.01);
  for (let x = x0 + 0.06; x < x1; x += 0.16) { K.box(M.paint, x - 0.04, x + 0.04, 0.05, 1.0, z + 0.03, z + 0.06, c, 0.01); K.cb(M.paint, 0.056, 0.056, 0.03, x, 1.0, z + 0.045, c, 0, 0, Math.PI / 4, 0.005); }
  for (let x = x0; x <= x1 + 1e-3; x += 2.4) K.box(M.paint, x - 0.06, x + 0.06, 0, 1.1, z - 0.06, z + 0.06, c, 0.015);
}
// pennant bunting string between two points
function bunting(K, a, b, sag = 0.6, n = 14) {
  const cols = [0xc0453a, 0xf2f0ea, 0x3f6fb5, 0xe0b450]; let prev = a;
  for (let i = 1; i <= n; i++) { const t = i / n, p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t]; K.beam(M.paint, prev, p, 0.012, 0x3a3434, true, 3);
    const m = [(prev[0] + p[0]) / 2, (prev[1] + p[1]) / 2, (prev[2] + p[2]) / 2], ang = Math.atan2(b[2] - a[2], b[0] - a[0]);
    K.put(M.cloth, cached('pen', () => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-0.22, 0, 0, 0.22, 0, 0, 0, -0.42, 0], 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 0.5, 0], 2)); return g; }), m[0], m[1], m[2], 0, -ang, 0, 1, 1, 1, cols[i % 4]); prev = p; }
}
// catenary wire made of short segments
function wire(K, a, b, sag, c = 0x2a2626, t = 0.011) { const n = 8; let prev = a; for (let i = 1; i <= n; i++) { const s = i / n, p = [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s - sag * 4 * s * (1 - s), a[2] + (b[2] - a[2]) * s]; K.beam(M.paint, prev, p, t, c, true, 3); prev = p; } }

// ---------------------------------------------------------------- ROAD SET
// road along z (x = 0). Farms near the action (z -40..40), a small Missouri town along the road beyond (z -48..-215), fields after.
export function dressRoad(g) {
  const P = prefabs(), K = new Kit(), Kfar = new Kit();
  const at = (k, x, z, ry, fn) => k.at(x, 0, z, ry, fn);
  // --- fences along the farm stretch
  railFence(K, 4.25, -44, 40, { col: 0x8a7258 });
  wormFence(K, -5.0, -44, 40);
  railFence(Kfar, 4.25, -400, -222, { step: 3, col: 0x8a7a68 }); railFence(Kfar, -4.4, -400, -222, { step: 3, col: 0x8a7a68 });
  // --- left farm: farmhouse with picket yard, barn, windmill, haystacks
  at(K, -17, -14, Math.PI / 2, () => house(K, { w: 8, d: 6.5, floors: 2, wall: 0xf2eee4, trim: 0x2f4a3a, roof: 0x5a4a4a, shutter: 0x2f4a3a, chair: true }));
  at(K, -17, -14, Math.PI / 2, () => { picketFence(K, -6.5, -1.0, 7.0); picketFence(K, 1.0, 6.5, 7.0); });
  at(K, -36, -44, Math.PI / 2 + 0.2, () => barn(K, { w: 10, d: 14 }));
  at(K, -24, 2, 0.3, () => windmill(K));
  at(K, -30, 14, Math.PI / 2, () => house(K, { w: 6, d: 5, floors: 1, wall: 0xc9b28a, trim: 0xf4efe2, roof: 0x7a5a3e, porch: false }));
  // --- right side: white clapboard church/schoolhouse with bell tower behind the fence
  at(K, 22, -22, -Math.PI / 2, () => { house(K, { w: 7, d: 11, floors: 1, wall: 0xf2eee4, trim: 0xf4efe2, roof: 0x4a4a5a, porch: false, frontWin: 2, rise: 3.2 });
    K.box(M.siding, -1.2, 1.2, 0.5, 8.2, 4.6, 6.6, 0xf2eee4, 0.02); K.box(M.paint, -1.35, 1.35, 8.2, 8.4, 4.45, 6.75, 0xf4efe2, 0.02);
    for (const [cx, cz] of [[-1.1, 4.7], [1.1, 4.7], [-1.1, 6.5], [1.1, 6.5]]) K.box(M.paint, cx - 0.1, cx + 0.1, 8.4, 9.6, cz - 0.1, cz + 0.1, 0xf4efe2, 0.02);
    K.put(M.paint, cyl(0.35, 0.45, 0.6, 10), 0, 9.0, 5.6, 0, 0, 0, 1, 1, 1, 0xc8a040); K.at(0, 9.6, 5.6, Math.PI / 4, () => K.put(M.shingle, cone(1.9, 3.6, 4), 0, 1.8, 0, 0, 0, 0, 1, 1, 1, 0x4a4a5a));
    K.put(M.paint, rboxGeo(0.06, 0.8, 0.06, 0.01), 0, 13.6, 5.6, 0, 0, 0, 1, 1, 1, 0xd9b04a); K.put(M.paint, rboxGeo(0.45, 0.06, 0.06, 0.01), 0, 13.7, 5.6, 0, 0, 0, 1, 1, 1, 0xd9b04a);
    door(K, 0, 0.5, 1.1, 2.3, 0x6a2a2a); K.at(0, 0, 6.6, 0, () => { door(K, 0, 0.5, 1.0, 2.4, 0x6a2a2a, { transom: true }); win(K, 0, 4.0, 0.7, 1.2, { cols: 2, rows: 3 }); });
    K.box(M.wood, -1.3, 1.3, 0, 0.5, 6.6, 7.6, 0xb89a74, 0.02); });
  at(K, 14, 6, -Math.PI / 2, () => barn(K, { w: 7, d: 9, wall: 0x8a6a4a, roof: 0x6a5a52 }));
  // --- haystacks, bales, wagons, troughs, cans, mailboxes near the road
  instance(g, P.stack, [[-11, 0, -30, 0, 1], [-14.5, 0, -33, 1, 0.9], [-12, 0, -2, 2, 0.95], [11, 0, -6, 0.5, 1], [13.5, 0, -10, 2, 0.85], [10, 0, 20, 1, 1.05], [-40, 0, -16, 0, 1], [-44, 0, -10, 1, 1.1]]);
  const bales = []; for (const [x, z, n] of [[-6.2, -9, 3], [5.6, -18, 4], [-6.3, 14, 2], [5.8, 26, 3], [-6.1, -34, 3]]) for (let i = 0; i < n; i++) bales.push([x + (i % 2) * 0.1, Math.floor(i / 3) * 0.42, z + (i % 3) * 0.95 - 0.9, Math.PI / 2 + (rnd(i + z) - 0.5) * 0.2, 1]);
  bales.push([-6.0, 0.42, -9.4, 1.6, 1], [5.8, 0.42, -17.6, 1.5, 1]); instance(g, P.bale, bales);
  instance(g, P.wagon, [[-9.0, 0, -22, 0.4, 1], [8.5, 0, 12, 2.6, 1], [-8.5, 0, 24, -0.3, 1], [6.0, 0, -100, 3.1, 1], [-5.8, 0, -150, 0.1, 1]]);
  instance(g, P.trough, [[-3.9, 0, -6.5, Math.PI / 2, 1], [-4.6, 0, -88, Math.PI / 2, 1], [4.6, 0, -132, -Math.PI / 2, 1]]);
  instance(g, P.cans, [[-4.0, 0, -12.5, 0, 1], [3.8, 0, -27, 1, 1], [-3.9, 0, 18.5, 2, 1]]);
  instance(g, P.mail, [[-4.0, 0, -17.5, Math.PI / 2, 1], [3.9, 0, 6.3, -Math.PI / 2, 1]]);
  instance(g, P.barrel, [[-4.4, 0, -5.0, 0, 1], [-4.1, 0, -4.3, 1, 0.95], [5.4, 0, -21, 0, 1], [-5.6, 0, -24.8, 0, 1], [-5.0, 0, 9.5, 0, 1]]);
  instance(g, P.crate, [[-4.5, 0, -7.9, 0.2, 1], [-4.6, 0.62, -7.8, 0.6, 0.85], [5.3, 0, -19.5, 1.3, 1], [-5.9, 0, -26, 0.3, 1]]);
  // --- MAIN STREET: storefronts both sides with boardwalks, porches, awnings, signs
  const L = [
    ['GENERAL STORE', 8.5, 1, { wall: 0xefe2c2, trim: 0x6a2a2a, porch: true, goods: true, sign: signMat('GENERAL STORE', '#6a2a2a', '#f2e2b0') }],
    ['FEED & SEED', 7.5, 1, { wall: 0xa8463a, trim: 0xf0e2c0, awning: M.awnG, sign: signMat('FEED & SEED', '#f0e2c0', '#6a2a2a'), peak: true }],
    ['HOTEL', 10, 3, { wall: 0x8ea27a, trim: 0xf4efe2, porch: true, balcony: true, shutter: 0x2f4a3a, sign: signMat('HOTEL', '#2f4a3a', '#f2e2b0') }],
    ['BARBER', 6, 1, { wall: 0x9fb4c4, trim: 0xf4efe2, awning: M.awnR, sign: signMat('BARBER', '#f4efe2', '#2a3a5a') }],
    ['DRY GOODS', 8, 2, { wall: 0xd9a848, trim: 0x3a3a52, porch: true, goods: true, sign: signMat('DRY GOODS', '#3a3a52', '#f2e2b0') }],
    ['BANK', 7.5, 2, { brick: true, trim: 0xf0e2c0, sign: signMat('FARMERS BANK', '#1f2d4a', '#e8c868'), peak: true, parapet: 1.8 }],
    ['POST OFFICE', 6.5, 1, { wall: 0xf2eee4, trim: 0x2f4a3a, awning: M.awnB, sign: signMat('POST OFFICE', '#2f4a3a', '#f2eee4') }],
    ['MILLINERY', 7, 2, { wall: 0xb8a4c0, trim: 0xf4efe2, porch: true, sign: signMat('MILLINERY', '#f4efe2', '#5a2a4a') }],
  ];
  const R = [
    ['HARDWARE', 8, 2, { wall: 0x5f8f8a, trim: 0xf0e2c0, porch: true, goods: true, sign: signMat('HARDWARE', '#f0e2c0', '#2a3a3a') }],
    ['DRUGS', 6.5, 1, { wall: 0xf2eee4, trim: 0x6a2a2a, awning: M.awnR, sign: signMat('DRUGS', '#6a2a2a', '#f2e2b0'), peak: true }],
    ['MEALS', 7, 1, { wall: 0xd88a6a, trim: 0xf4efe2, porch: true, sign: signMat('MEALS · 25¢', '#f4efe2', '#6a2a2a') }],
    ['SADDLERY', 8, 2, { brick: true, trim: 0x2f4a3a, sign: signMat('HARNESS & SADDLES', '#2f4a3a', '#f2e2b0'), porch: true }],
    ['BAKERY', 6.5, 1, { wall: 0xefe2c2, trim: 0x3a3a52, awning: M.awnB, sign: signMat('BAKERY', '#3a3a52', '#f2e2b0') }],
    ['LAND OFFICE', 7.5, 2, { wall: 0x9a6a48, trim: 0xf0e2c0, porch: true, shutter: 0x3a2a1e, sign: signMat('LAND OFFICE', '#f0e2c0', '#3a2a1e') }],
    ['TELEGRAPH', 6, 1, { wall: 0xc9b28a, trim: 0x6a2a2a, awning: M.awnG, sign: signMat('TELEGRAPH', '#6a2a2a', '#f2e2b0') }],
    ['OPERA HOUSE', 10, 2, { brick: true, trim: 0xf0e2c0, sign: signMat('OPERA HOUSE', '#7a1f2a', '#e8c868'), peak: true, parapet: 2.2 }],
  ];
  const ads = [signMat('OZARK FLOUR\nBest in Missouri', '#7a2a22', '#f2e6c8', { w: 1024, h: 330, dots: false, fs: 0.62 }), signMat('DR. HALE’S TONIC\nfor what ails you', '#24405a', '#f2e6c8', { w: 1024, h: 330, dots: false, fs: 0.6 }), signMat('LIVERY & FEED\nHorses to let', '#3a2a1e', '#f2e6c8', { w: 1024, h: 330, dots: false, fs: 0.6 })];
  const street = (list, sd, z0, kit, cut) => { let z = z0, i = 0; const Kk = kit;
    for (const [, w, f, o] of list.concat(list.map(([n, w2, f2, o2]) => [n, w2, f2, { ...o2, sign: o2.sign }]))) {
      if (z < cut) break; const gap = i % 3 === 2 ? 2.2 : 0.15, zc = z - w / 2, k = i >= list.length ? Kfar : Kk;
      k.at(sd * 7.2, 0, zc, sd > 0 ? -Math.PI / 2 : Math.PI / 2, () => storefront(k, { w, floors: f, ...o, d: 9 + (i % 3), ad: gap > 1 && i % 2 === 0 ? ads[i % 3] : null, adSide: sd > 0 ? 1 : -1, sideWin: gap > 1, chimney: i % 2 === 0, shade: i % 3 === 1 ? 0x3a6a4a : null, curtain: 0xf2eee4 }));
      z -= w + gap; i++; }
    return z; };
  street(L, -1, -48, K, -225); street(R, 1, -50, K, -225);
  // boardwalks along both sides through town with a step edge
  for (const sd of [-1, 1]) { const x0 = sd * 4.0, x1 = sd * 7.25; K.box(M.wood, Math.min(x0, x1), Math.max(x0, x1), 0.0, 0.3, -222, -46, 0xb08a60, 0.02, 1.4);
    for (let z = -222; z < -46; z += 1.2) K.box(M.paint, Math.min(x0, x1), Math.max(x0, x1), 0.3, 0.305, z, z + 0.02, 0x6a4a30, 0.002);
    K.box(M.wood, sd * 3.92 - 0.08, sd * 3.92 + 0.08, 0, 0.31, -222, -46, 0x8a6a48, 0.02); }
  const lamps = [], hitch = [], benches = [], barrels = [], crates = [];
  for (let z = -56; z > -220; z -= 17) for (const sd of [-1, 1]) lamps.push([sd * 4.25, 0.3, z + sd * 4, 0, 1]);
  for (let z = -62; z > -215; z -= 23) for (const sd of [-1, 1]) hitch.push([sd * 3.55, 0, z + sd * 7, Math.PI / 2, 1]);
  for (let z = -58; z > -215; z -= 19) { const sd = (z | 0) % 2 ? 1 : -1; benches.push([sd * 6.6, 0.3, z, sd > 0 ? -Math.PI / 2 : Math.PI / 2, 1]); barrels.push([sd * -6.7, 0.3, z - 4, z, 1], [sd * -6.75, 0.3, z - 4.65, z + 1, 0.95]); crates.push([sd * 6.6, 0.3, z - 8, 0.2, 1], [sd * 6.6, 0.92, z - 8.05, 0.9, 0.8], [sd * -6.5, 0.3, z - 10, 1.2, 1]); }
  instance(g, P.lamp, lamps); instance(g, P.hitch, hitch); instance(g, P.bench, benches); instance(g, P.barrel, barrels); instance(g, P.crate, crates);
  // bunting across the street, street sign
  for (const z of [-60, -105, -150, -195]) bunting(K, [-7.2, 5.6, z], [7.2, 5.6, z + 2], 0.7, 16);
  bunting(K, [-5.4, 4.6, -30], [5.0, 4.6, -30], 0.6, 12);
  for (const sd of [-1, 1]) K.box(M.wood, sd * 5.2 - 0.08, sd * 5.2 + 0.08, 0, 4.9, -30.08, -29.92, 0x8a7258, 0.02);
  K.at(-4.8, 0, -44, Math.PI / 2, () => { K.box(M.wood, -0.06, 0.06, 0, 2.4, -0.06, 0.06, 0x8a7258, 0.02); signBoard(K, 0, 2.15, 0.07, 1.5, 0.32, signMat('ST. LOUIS  12 MI', '#efe2c2', '#3a2a1e', { h: 160, dots: false }), 0x5a4030); signBoard(K, 0.1, 1.72, 0.07, 1.3, 0.3, signMat('CLAYTON  4 MI', '#efe2c2', '#3a2a1e', { h: 160, dots: false }), 0x5a4030); });
  // --- church at the end of town
  K.at(-17, 0, -232, Math.PI / 2, () => { house(K, { w: 8, d: 13, floors: 1, wall: 0xf2eee4, trim: 0xf4efe2, roof: 0x4a4a5a, porch: false, rise: 3.6 });
    K.box(M.siding, -1.4, 1.4, 0.5, 9.0, 6.5, 8.8, 0xf2eee4, 0.02); K.at(0, 9.0, 7.65, Math.PI / 4, () => K.put(M.shingle, cone(2.1, 6, 4), 0, 3, 0, 0, 0, 0, 1, 1, 1, 0x4a4a5a)); K.at(0, 0, 8.8, 0, () => { door(K, 0, 0.5, 1.2, 2.5, 0x6a2a2a, { transom: true }); win(K, 0, 4.4, 0.8, 1.5, { cols: 2, rows: 3 }); win(K, 0, 7.0, 0.6, 0.9, {}); }); });
  // --- telegraph line on the right with sagging wires
  const poles = []; for (let z = 30; z > -400; z -= 28) poles.push([z < -46 && z > -222 ? 3.6 : 6.2, z]);
  instance(g, P.pole, poles.map(([x, z]) => [x, 0, z, 0, 1, null, 1, 0, (rnd(z) - 0.5) * 0.04]));
  for (let i = 0; i < poles.length - 1; i++) { const [xa, za] = poles[i], [xb, zb] = poles[i + 1], kk = za > -120 ? K : Kfar; for (const y of [8.6, 7.9]) for (const dx of [-1.0, -0.6, 0.6, 1.0]) if (y > 8 || Math.abs(dx) > 0.7) wire(kk, [xa + dx, y, za], [xb + dx, y, zb], 0.45); }
  // --- trees: big shade trees on the farms, a row of elms along the road, bushes along fences
  const trees = [], bushes = [];
  const T = [[-9, 3], [-10.5, -19], [-26, -24], [-21, -2.5], [-12, 22], [-28, -8], [-45, -30], [-48, 6], [-58, -40], [9.5, -1], [12, -30], [26, -6], [30, -36], [18, 24], [34, 12], [-20, 34], [40, -12],
    [-14, -70], [14, -90], [-14, -125], [13, -170], [-15, -195], [-30, -110], [30, -140], [-30, -170], [28, -200], [-12, -250], [12, -270], [-20, -300], [18, -330], [-30, -360], [26, -380], [-50, -260], [50, -300]];
  T.forEach(([x, z], i) => trees.push([x, 0, z, rnd(i * 3) * 6, 0.85 + 0.45 * rnd(i * 7), new THREE.Color().setHSL(0.2 + 0.07 * rnd(i * 11), 0.3, 0.55 + 0.1 * rnd(i * 13)).multiplyScalar(1.45), 0.9 + 0.25 * rnd(i * 5)]));
  for (let z = -42; z < 40; z += 3.1 + rnd(z) * 2) { if (Math.abs(z + 6.5) < 3) continue; bushes.push([-5.9 - rnd(z * 3) * 0.8, 0, z, rnd(z) * 6, 0.7 + 0.6 * rnd(z * 2)]); if (rnd(z * 5) > 0.45) bushes.push([5.0 + rnd(z * 7) * 0.8, 0, z + 1.2, rnd(z) * 6, 0.6 + 0.5 * rnd(z * 9)]); }
  for (let z = -400; z < -225; z += 9) bushes.push([(rnd(z) > 0.5 ? 1 : -1) * (5.2 + rnd(z * 3)), 0, z, rnd(z) * 6, 0.8]);
  [0, 1, 2].forEach((v) => instance(g, P.trees[v], trees.filter((_, i) => i % 3 === v)));
  instance(g, P.bush, bushes);
  // --- verge grass tufts and wildflowers
  const tufts = [], flowers = [];
  for (let i = 0; i < 1400; i++) { const sd = i % 2 ? 1 : -1, z = -260 + rnd(i * 7) * 300; if (z < -45 && z > -222 && i % 5) continue; const x = sd * (3.25 + Math.pow(rnd(i * 3), 1.5) * 9); tufts.push([x, 0, z, rnd(i) * 6, 0.7 + rnd(i * 5) * 0.9, new THREE.Color().setHSL(0.17 + 0.05 * rnd(i * 2), 0.45, 0.5 + 0.15 * rnd(i * 4)).multiplyScalar(1.9), 0.8 + 0.6 * rnd(i * 9)]); }
  for (let i = 0; i < 260; i++) { const sd = i % 2 ? 1 : -1, z = -44 + rnd(i * 11) * 84; flowers.push([sd * (3.4 + rnd(i * 13) * 3), 0, z, rnd(i) * 6, 0.8 + rnd(i * 3) * 0.5]); }
  instance(g, P.tuft, tufts, false); instance(g, P.flower, flowers, false);
  // --- distant hills + far tree line
  const hill = new THREE.MeshToonMaterial ? toon({ color: 0x7a9a5a }) : null;
  for (const [x, z, sx, sy] of [[-160, -560, 220, 45], [60, -620, 260, 60], [260, -540, 200, 40], [-330, -480, 180, 35], [330, -300, 140, 30], [-320, -250, 150, 28]]) { const m = new THREE.Mesh(sph(1, 24, 12), hill); m.scale.set(sx, sy, sx * 0.5); m.position.set(x, -sy * 0.35, z); g.add(m); }
  const far = []; for (let i = 0; i < 90; i++) { const a = rnd(i * 3) > 0.5 ? 1 : -1, x = a * (25 + rnd(i * 5) * 140), z = -420 - rnd(i * 7) * 90; far.push([x, 0, z, rnd(i) * 6, 1.4 + rnd(i * 9) * 0.8, new THREE.Color().setHSL(0.25, 0.25, 0.55).multiplyScalar(1.3), 1]); }
  instance(g, P.trees[0], far, false);
  K.build(g, 40); Kfar.build(g, 60);
}

// ---------------------------------------------------------------- STADIUM
// grandstand dressing for the stands at x = ±(6 .. 22), z -30 .. 12. Rows: x from 6 + 1.2r, top y = 0.6 + 0.6r (crowd stands there).
export function dressStadium(g) {
  const K = new Kit(), wood = 0xe8dcc0, dark = 0x8a3b3a, white = 0xf4efe2, P = prefabs();
  for (const sd of [-1, 1]) {
    const X = (x) => sd * x, box = (m, xa, xb, y0, y1, z0, z1, c, r, s) => K.box(m, Math.min(X(xa), X(xb)), Math.max(X(xa), X(xb)), y0, y1, z0, z1, c, r, s);
    // stepped tiers with seat planks and risers
    for (let r = 0; r < 6; r++) { const x0 = 6 + r * 1.2, y = 0.6 + 0.6 * r; box(M.vb, x0, 22.4, 0, y, -30, 12, 0xd8c8a8, 0.02, 1.2);
      box(M.wood, x0 + 0.05, x0 + 0.5, y, y + 0.07, -29.9, 11.9, 0xb8946a, 0.02); box(M.paint, x0 - 0.02, x0 + 0.02, y - 0.6, y, -30, 12, 0x6a4a3a, 0.005); }
    // front railing with balusters in front of row 0
    box(M.paint, 5.75, 5.95, 0.6, 1.6, -30, -29.8, white, 0.02); box(M.paint, 5.74, 5.96, 1.5, 1.62, -30, 12, white, 0.02); box(M.paint, 5.78, 5.92, 0.66, 0.74, -30, 12, white, 0.01);
    for (let z = -29.8; z < 12; z += 0.32) box(M.paint, 5.81, 5.89, 0.74, 1.5, z - 0.03, z + 0.03, white, 0.006);
    box(M.vb, 5.6, 6.0, 0, 0.6, -30, 12, 0x2f4a3a, 0.02, 1);
    // back wall + end walls
    box(M.vb, 22.4, 22.8, 0, 10.2, -30.4, 12.4, 0xd8c8a8, 0.02); for (const z of [-30.4, 12]) box(M.vb, 5.6, 22.8, 0, 4.4, z, z + 0.4, 0xd8c8a8, 0.02);
    // roof on posts with trusses
    const yF = 8.4, yB = 10.3, slope = (x) => yF + ((yB - yF) * (x - 5.4)) / (23.2 - 5.4);
    for (let z = -30; z <= 12.01; z += 6) {
      box(M.paint, 5.78, 5.98, 0.6, yF, z - 0.1, z + 0.1, white, 0.02); box(M.paint, 22.3, 22.5, 0, yB, z - 0.12, z + 0.12, white, 0.02);
      box(M.paint, 5.72, 6.04, 0.6, 0.75, z - 0.16, z + 0.16, white, 0.02);
      const a = [X(5.9), yF - 0.75, z], b = [X(22.4), yB - 0.75, z]; K.beam(M.paint, a, b, 0.12, white);
      for (let k = 0; k < 6; k++) { const t0 = k / 6, t1 = (k + 1) / 6, p0 = [X(5.9 + 16.5 * t0), yF - 0.75 + (yB - yF) * t0, z], p1 = [X(5.9 + 16.5 * t1), slope(5.9 + 16.5 * t1) - 0.1, z], p2 = [X(5.9 + 16.5 * t1), yF - 0.75 + (yB - yF) * t1, z]; K.beam(M.paint, p0, p1, 0.08, white); K.beam(M.paint, p2, p1, 0.07, white); }
      K.beam(M.paint, [X(5.9), yF - 1.6, z], [X(6.9), yF - 0.75, z], 0.08, white);
    }
    const L = Math.hypot(23.2 - 5.4, yB - yF);
    K.put(M.shingle, rboxGeo(L, 0.14, 43, 0.03), X((5.4 + 23.2) / 2), (yF + yB) / 2 + 0.05, -9, 0, 0, sd * Math.atan2(yB - yF, 23.2 - 5.4), 1, 1, 1, dark);
    box(M.paint, 5.25, 5.45, yF - 0.6, yF + 0.2, -30.6, 12.6, white, 0.02); box(M.paint, 5.2, 5.5, yF - 0.75, yF - 0.6, -30.6, 12.6, dark, 0.02);
    // scalloped valance in red/white along the fascia
    for (let z = -30.3; z < 12.4; z += 0.9) K.put(M.cloth, cached('scal', () => new THREE.CircleGeometry(0.45, 10, Math.PI, Math.PI)), X(5.22), yF - 0.75, z + 0.45, 0, sd > 0 ? -Math.PI / 2 : Math.PI / 2, 0, 1, 0.7, 1, Math.round(z / 0.9) % 2 ? 0xc0453a : white);
    bunting(K, [X(5.6), yF - 1.4, -30], [X(5.6), yF - 1.4, -18], 0.5, 14); bunting(K, [X(5.6), yF - 1.4, -18], [X(5.6), yF - 1.4, -6], 0.5, 14); bunting(K, [X(5.6), yF - 1.4, -6], [X(5.6), yF - 1.4, 6], 0.5, 14); bunting(K, [X(5.6), yF - 1.4, 6], [X(5.6), yF - 1.4, 12], 0.4, 8);
    // flag poles on the roof front with flags
    for (let z = -27; z < 12; z += 9) { K.beam(M.paint, [X(5.6), yF + 0.1, z], [X(5.6), yF + 3.2, z], 0.04, white, true, 6); K.put(M.paint, sph(0.08, 6, 4), X(5.6), yF + 3.25, z, 0, 0, 0, 1, 1, 1, 0xd9b04a);
      K.put(M.cloth, plane(1.3, 0.8), X(5.6), yF + 2.75, z + 0.68, 0, Math.PI / 2, 0.05, 1, 1, 1, [0xc0453a, 0x3f6fb5, 0xf2f0ea, 0xe0b450][Math.abs(Math.round(z / 9)) % 4]); }
    // stairs at the stand ends + name board on the roof
    for (let r = 0; r < 7; r++) box(M.wood, 5.6 + r * 0.6, 6.2 + r * 0.6, 0, 0.3 + r * 0.6, 12.4, 13.6, 0xb8946a, 0.02);
    for (const sx of [5.6, 10.2]) box(M.paint, sx, sx + 0.08, 0, 5, 13.55, 13.65, white, 0.01);
  }
  // name boards on the roof ridge, facing the track
  const nb = signMat('OLYMPIC STADIUM', '#1f3a6a', '#f2e2b0', { w: 1400, h: 220 }); NB.mat = nb; NB.olympic = nb.map; NB.boston = signMat('BOSTON ATHLETIC ASSOCIATION', '#7a1f2a', '#f2e2b0', { w: 1400, h: 220 }).map;
  for (const sd of [-1, 1]) K.at(sd * 5.35, 0, -9, sd > 0 ? -Math.PI / 2 : Math.PI / 2, () => signBoard(K, 0, 9.35, 0.05, 13, 1.25, nb, 0xf4efe2));
  // perimeter board fence behind the stands, lamp standards, crates and barrels by the track
  for (const sd of [-1, 1]) { K.box(M.vb, sd * 30 - 0.1, sd * 30 + 0.1, 0, 2.4, -78, 58, 0xc8b898, 0.02); for (let z = -78; z < 58; z += 3) K.box(M.wood, sd * 30 - 0.15, sd * 30 + 0.15, 0, 2.5, z - 0.08, z + 0.08, 0x8a7258, 0.02); }
  K.box(M.vb, -30, 30, 0, 2.4, -78.1, -77.9, 0xc8b898, 0.02);
  const fa = [signMat('OZARK FLOUR', '#7a2a22', '#f2e6c8'), signMat('ST. LOUIS STAR', '#1f3a6a', '#f2e6c8'), signMat('MISSOURI PACIFIC R.R.', '#2f4a3a', '#f2e2b0'), signMat('HALE’S TONIC', '#f2e6c8', '#6a2a2a'), signMat('FAIRGROUNDS 1904', '#c0453a', '#fff6e0')];
  for (let i = 0; i < 5; i++) { const x = -24 + i * 12; for (const px of [x - 4.6, x + 4.6]) K.box(M.wood, px - 0.1, px + 0.1, 0, 4.3, -77.85, -77.65, 0x8a7258, 0.02); signBoard(K, x, 3.2, -77.7, 9, 1.6, fa[i], 0xf4efe2); }
  instance(g, P.barrel, [[5.0, 0, 8.4, 0, 1], [5.3, 0, 9.0, 1, 0.95], [-5.1, 0, -14, 0, 1], [-5.2, 0, 3.8, 0, 1]]);
  instance(g, P.crate, [[-5.2, 0, 9.4, 0.3, 1], [-5.2, 0.62, 9.4, 0.8, 0.8], [5.2, 0, -20, 0.2, 1]]);
  instance(g, P.bench, [[-4.95, 0, -4, Math.PI / 2, 1], [5.0, 0, -9, -Math.PI / 2, 1]]);
  // trees + bushes around the field
  const tr = []; for (let i = 0; i < 26; i++) { const z = -76 + i * 5.4; tr.push([(i % 2 ? 1 : -1) * (33 + rnd(i) * 4), 0, z, rnd(i * 3) * 6, 0.9 + 0.4 * rnd(i * 5), new THREE.Color().setHSL(0.23, 0.3, 0.56).multiplyScalar(1.45), 1]); }
  for (let i = 0; i < 10; i++) tr.push([-26 + i * 5.8, 0, -84 - rnd(i) * 4, rnd(i) * 6, 0.9 + 0.3 * rnd(i * 2), null, 1]);
  [0, 1, 2].forEach((v) => instance(g, P.trees[v], tr.filter((_, i) => i % 3 === v)));
  K.build(g, 30);
}
// gate columns for the stadium arch at z = -34 (posts at x = ±7)
export function dressGate(g) {
  const K = new Kit(), w = 0xf4efe2, c = 0x8a3b3a;
  for (const x of [-7, 7]) {
    K.box(M.stone, x - 0.75, x + 0.75, 0, 1.0, -34.75, -33.25, 0xffffff, 0.04, 1.4); K.box(M.paint, x - 0.6, x + 0.6, 1.0, 1.2, -34.6, -33.4, w, 0.04);
    K.put(M.paint, cyl(0.42, 0.48, 7.6, 14), x, 4.95, -34, 0, 0, 0, 1, 1, 1, w);
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; K.put(M.paint, rboxGeo(0.05, 7.2, 0.05, 0.01), x + Math.cos(a) * 0.44, 4.95, -34 + Math.sin(a) * 0.44, 0, 0, 0, 1, 1, 1, 0xdcd4c4); }
    K.box(M.paint, x - 0.62, x + 0.62, 8.75, 8.95, -34.62, -33.38, w, 0.04); K.box(M.paint, x - 0.7, x + 0.7, 8.95, 9.1, -34.7, -33.3, c, 0.03);
    K.put(M.paint, cyl(0.28, 0.4, 0.5, 12), x, 10.85, -34, 0, 0, 0, 1, 1, 1, w); K.put(M.paint, sph(0.32, 12, 8), x, 11.35, -34, 0, 0, 0, 1, 1, 1, 0xd9b04a);
    K.beam(M.paint, [x, 11.5, -34], [x, 13.4, -34], 0.04, w, true, 6); K.put(M.cloth, plane(1.6, 1.0), x + 0.82, 12.85, -34, 0, 0, -0.04, 1, 1, 1, x < 0 ? 0xc0453a : 0x3f6fb5);
    for (let k = 0; k < 3; k++) K.put(M.paint, tor(0.47, 0.035, 4, 18), x, 1.6 + k * 0.12, -34, Math.PI / 2, 0, 0, 1, 1, 1, c);
  }
  bunting(K, [-7, 8.4, -33.6], [7, 8.4, -33.6], 1.2, 20);
  K.build(g);
}

// ---------------------------------------------------------------- OFFICE (1908), room centred at the group origin
export function dressOffice(g, docMesh) {
  const K = new Kit();
  const wallC = 0xffffff;
  // floor boards, wainscot + wallpaper on the back and side walls, picture rail, crown
  K.box(M.wood, -8, 8, -0.2, 0, -8, 8, 0x8a5a3a, 0.002, 1.2);
  for (let x = -8; x < 8; x += 0.18) K.box(M.paint, x, x + 0.012, 0, 0.003, -3, 8, 0x4a2e1e, 0.001);
  const wall = (fn) => { fn(); };
  wall(() => {
    K.box(M.paper, -8, 8, 1.2, 4, -3.25, -3.05, wallC, 0.002, 0.5);
    K.box(M.wood, -8, 8, 0, 1.2, -3.25, -3.0, 0x6a3e26, 0.01, 1); for (let x = -7.6; x < 8; x += 0.9) K.box(M.wood, x, x + 0.72, 0.18, 1.0, -3.0, -2.97, 0x7a4a2e, 0.01, 1);
    K.box(M.wood, -8, 8, 1.15, 1.25, -3.0, -2.92, 0x4a2a1a, 0.01); K.box(M.wood, -8, 8, 0, 0.16, -3.0, -2.94, 0x3a2216, 0.01); K.box(M.wood, -8, 8, 3.0, 3.06, -3.05, -3.0, 0x4a2a1a, 0.01); K.box(M.wood, -8, 8, 3.8, 4, -3.05, -2.88, 0x4a2a1a, 0.02);
  });
  for (const sd of [-1, 1]) { K.box(M.paper, sd * 7.8 - 0.1, sd * 7.8 + 0.1, 1.2, 4, -3, 8, wallC, 0.002, 0.5); K.box(M.wood, sd * 7.7 - 0.1, sd * 7.7 + 0.1, 0, 1.2, -3, 8, 0x6a3e26, 0.01); }
  // tall window with mullions, sill, curtains and a roller shade
  K.at(0, 0, -3.02, 0, () => { K.box(M.paint, -1.55, 1.55, 1.4, 3.35, -0.02, 0.02, 0x4a2a1a, 0.02); K.box(M.glow, -1.35, 1.35, 1.52, 3.2, -0.05, 0.005, 0xfff4d8, 0.005);
    win(K, 0, 1.52, 2.7, 1.68, { frame: 0x4a2a1a, cols: 3, rows: 2, noGlass: true }); K.box(M.paint, -1.4, 1.4, 2.95, 3.2, 0.03, 0.06, 0xe8d8b0, 0.01);
    for (const sd of [-1, 1]) { K.box(M.cloth, sd * 1.55 - 0.35, sd * 1.55 + 0.25 * sd, 0.9, 3.5, 0.08, 0.16, 0x7a1f28, 0.06); K.box(M.paint, sd * 1.4 - 0.12, sd * 1.4 + 0.12, 1.9, 1.98, 0.14, 0.2, 0xd9b25a, 0.02); }
    K.put(M.paint, cyl(0.03, 0.03, 4.0, 6), 0, 3.55, 0.14, 0, 0, Math.PI / 2, 1, 1, 1, 0xd9b25a); });
  // bookshelves with books, framed pictures, wall clock, coat rack, filing cabinet
  for (const sx of [-4.6, 2.9]) { K.box(M.wood, sx, sx + 1.8, 0, 3.3, -2.95, -2.5, 0x5a3420, 0.02); K.box(M.wood, sx - 0.05, sx + 1.85, 3.3, 3.42, -3.0, -2.42, 0x4a2a1a, 0.02);
    for (let r = 0; r < 4; r++) { const y = 0.35 + r * 0.76; K.box(M.wood, sx + 0.06, sx + 1.74, y - 0.05, y, -2.9, -2.52, 0x6a3e26, 0.01); K.put(M.books, rboxGeo(1.66, 0.6, 0.3, 0.005, [1.66, 0.6]), sx + 0.9, y + 0.3, -2.7, 0, 0, 0, 1, 1, 1, 0xffffff); } }
  const frame = (x, y, w, h, c) => { K.box(M.paint, x - w / 2, x + w / 2, y - h / 2, y + h / 2, -3.04, -2.98, 0xc8a050, 0.015); K.box(M.paint, x - w / 2 + 0.07, x + w / 2 - 0.07, y - h / 2 + 0.07, y + h / 2 - 0.07, -2.98, -2.96, c, 0.005); };
  frame(-2.15, 2.5, 0.8, 0.62, 0x7a9ab8); frame(2.2, 2.45, 0.66, 0.84, 0xd8b070); frame(-6.2, 2.2, 1.0, 0.7, 0x8a9a6a); frame(5.8, 2.4, 0.9, 1.1, 0xefe2c2);
  K.box(M.wood, -6.3, -5.7, 2.6, 3.4, -2.98, -2.82, 0x4a2a1a, 0.03); K.put(M.paint, cyl(0.22, 0.22, 0.04, 16), -6.0, 3.1, -2.8, Math.PI / 2, 0, 0, 1, 1, 1, 0xf2eee2); K.put(M.paint, sph(0.05, 6, 4), -6.0, 2.75, -2.8, 0, 0, 0, 1, 1, 1, 0xd9b25a);
  K.box(M.wood, 5.2, 6.1, 0, 1.4, -2.9, -2.2, 0x5a3420, 0.03); for (let k = 0; k < 3; k++) { K.box(M.wood, 5.27, 6.03, 0.1 + k * 0.44, 0.48 + k * 0.44, -2.2, -2.17, 0x6a3e26, 0.01); K.box(M.paint, 5.55, 5.75, 0.33 + k * 0.44, 0.36 + k * 0.44, -2.17, -2.13, 0xd9b25a, 0.01); }
  K.put(M.wood, cyl(0.04, 0.05, 1.9, 6), -3.2, 0.95, -2.3, 0, 0, 0, 1, 1, 1, 0x4a2a1a); for (let k = 0; k < 4; k++) K.beam(M.wood, [-3.2, 1.75, -2.3], [-3.2 + Math.cos(k * 1.57) * 0.25, 1.9, -2.3 + Math.sin(k * 1.57) * 0.25], 0.02, 0x4a2a1a, true, 4);
  K.put(M.paint, cyl(0.17, 0.2, 0.18, 12), -3.2, 1.95, -2.08, 0, 0, 0, 1, 1, 1, 0x2a2420); K.put(M.paint, cyl(0.3, 0.3, 0.02, 14), -3.2, 1.86, -2.08, 0, 0, 0, 1, 1, 1, 0x2a2420);
  // rug under the desk
  K.put(M.rug, plane(4.6, 3.2), 0, 0.006, -0.6, -Math.PI / 2, 0, 0);
  // desk: rounded top with moulded edge, pedestals with drawers and brass pulls, leather blotter
  const dk = 0x5e3822;
  K.box(M.wood, -1.7, 1.7, 0.82, 0.92, -1.3, 0.3, dk, 0.035, 1.5, 2); K.box(M.wood, -1.65, 1.65, 0.77, 0.83, -1.25, 0.25, 0x4a2a18, 0.02);
  for (const sd of [-1, 1]) { K.box(M.wood, sd * 1.05 - 0.55, sd * 1.05 + 0.55, 0, 0.77, -1.2, 0.2, dk, 0.03, 1.5);
    for (let k = 0; k < 3; k++) { const y0 = 0.08 + k * 0.23; K.box(M.wood, sd * 1.05 - 0.48, sd * 1.05 + 0.48, y0, y0 + 0.2, 0.2, 0.23, 0x6a4028, 0.015); K.box(M.paint, sd * 1.05 - 0.1, sd * 1.05 + 0.1, y0 + 0.08, y0 + 0.12, 0.23, 0.26, 0xd9b25a, 0.01); } }
  K.box(M.wood, -0.5, 0.5, 0.6, 0.77, 0.2, 0.23, 0x6a4028, 0.015); K.box(M.paint, -0.1, 0.1, 0.67, 0.7, 0.23, 0.26, 0xd9b25a, 0.01);
  K.box(M.paint, -0.62, 0.82, 0.915, 0.926, -0.98, 0.25, 0x2f5a3e, 0.004); for (const sd of [-1, 1]) K.box(M.paint, sd > 0 ? 0.68 : -0.62, sd > 0 ? 0.84 : -0.46, 0.915, 0.928, -0.99, 0.26, 0x3a2216, 0.004);
  // desk clutter: inkwell, pen, telephone, lamp, books, papers, letter tray, spectacles, bell
  K.box(M.glass, -1.05, -0.83, 0.92, 1.06, -0.72, -0.5, 0xffffff, 0.02, 0.22); K.put(M.paint, cyl(0.07, 0.08, 0.04, 10), -0.94, 1.08, -0.61, 0, 0, 0, 1, 1, 1, 0xd9b25a);
  K.box(M.wood, -1.2, -0.7, 0.92, 0.95, -0.85, -0.38, 0x3a2216, 0.01); K.beam(M.paint, [-0.82, 0.96, -0.42], [-1.15, 0.97, -0.25], 0.008, 0x1d1b22, true, 5);
  K.put(M.paint, cyl(0.1, 0.12, 0.03, 12), -1.35, 0.935, -0.95, 0, 0, 0, 1, 1, 1, 0x1d1b22); K.put(M.paint, cyl(0.022, 0.03, 0.38, 8), -1.35, 1.13, -0.95, 0, 0, 0, 1, 1, 1, 0x1d1b22); K.put(M.paint, cyl(0.05, 0.035, 0.1, 10), -1.35, 1.36, -0.95, 0, 0, 0, 1, 1, 1, 0x1d1b22);
  K.put(M.paint, cyl(0.04, 0.03, 0.14, 8), -1.2, 1.12, -0.9, 0, 0, 1.3, 1, 1, 1, 0x1d1b22); K.beam(M.paint, [-1.16, 1.06, -0.9], [-1.32, 0.94, -0.7], 0.008, 0x1d1b22, true, 4);
  K.put(M.paint, cyl(0.1, 0.13, 0.05, 12), 1.2, 0.945, -0.85, 0, 0, 0, 1, 1, 1, 0xd9b25a); K.put(M.paint, cyl(0.02, 0.02, 0.36, 6), 1.2, 1.15, -0.85, 0, 0, 0, 1, 1, 1, 0xd9b25a);
  K.put(M.glow, sph(0.1, 10, 8), 1.2, 1.36, -0.85, 0, 0, 0, 1, 1.15, 1, 0xfff0c8); K.put(M.paint, cyl(0.06, 0.24, 0.16, 14, true), 1.2, 1.46, -0.85, 0, 0, 0, 1, 1, 1, 0x2f6a4a);
  for (let k = 0; k < 4; k++) K.box(M.paint, 1.0 - k * 0.01, 1.5 - k * 0.01, 0.92 + k * 0.07, 0.99 + k * 0.07, -0.55 + k * 0.01, -0.2 - k * 0.02, [0x7a2430, 0x24406a, 0x2f5a3a, 0x8a5a2a][k], 0.01);
  for (let k = 0; k < 5; k++) K.put(M.paint, rboxGeo(0.42, 0.006, 0.56, 0.002), -0.55 + rnd(k) * 0.05, 0.935 + k * 0.007, 0.06 - rnd(k * 3) * 0.04, 0, 0.3 + (rnd(k * 2) - 0.5) * 0.3, 0, 1, 1, 1, k % 2 ? 0xf3ecdc : 0xe8dcc4);
  K.box(M.wood, 0.55, 1.05, 0.935, 0.99, -0.05, 0.25, 0x4a2a18, 0.01); K.put(M.paint, rboxGeo(0.44, 0.012, 0.26, 0.002), 0.8, 0.98, 0.1, 0, 0.05, 0, 1, 1, 1, 0xf3ecdc);
  K.put(M.paint, tor(0.045, 0.006, 4, 12), 0.35, 0.94, 0.12, Math.PI / 2, 0, 0, 1, 1, 1, 0xd9b25a); K.put(M.paint, tor(0.045, 0.006, 4, 12), 0.46, 0.94, 0.12, Math.PI / 2, 0, 0, 1, 1, 1, 0xd9b25a);
  K.put(M.paint, sph(0.055, 10, 6, 0), -0.25, 0.95, -1.08, 0, 0, 0, 1, 0.8, 1, 0xd9b25a); K.put(M.paint, cyl(0.07, 0.07, 0.02, 10), -0.25, 0.93, -1.08, 0, 0, 0, 1, 1, 1, 0x3a2216);
  K.box(M.wood, -0.25, 0.4, 0.92, 1.0, -1.22, -1.14, 0x4a2a18, 0.01); K.put(signMat('A.A.U. OFFICIAL', '#3a2216', '#e8c868', { h: 120, dots: false }), plane(0.6, 0.07), 0.075, 0.96, -1.135);
  // chair behind the desk and a side chair
  const chair = (x, z, ry) => K.at(x, 0, z, ry, () => { K.box(M.wood, -0.3, 0.3, 0.45, 0.52, -0.3, 0.3, 0x4a2a18, 0.03); K.box(M.paint, -0.26, 0.26, 0.52, 0.57, -0.26, 0.26, 0x6a1f24, 0.03); for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.box(M.wood, a * 0.26 - 0.03, a * 0.26 + 0.03, 0, 0.45, b * 0.26 - 0.03, b * 0.26 + 0.03, 0x4a2a18, 0.01); K.box(M.wood, -0.3, 0.3, 0.57, 1.15, -0.32, -0.26, 0x4a2a18, 0.03); K.box(M.paint, -0.24, 0.24, 0.65, 1.07, -0.26, -0.24, 0x6a1f24, 0.02); });
  chair(0, -1.9, 0); chair(-2.3, 0.6, 2.4);
  // spittoon + waste basket + plant
  K.put(M.paint, cyl(0.16, 0.12, 0.28, 12), 2.1, 0.14, -0.9, 0, 0, 0, 1, 1, 1, 0x6a5a3a); K.put(M.paint, cyl(0.14, 0.1, 0.4, 10), 3.6, 0.2, -2.5, 0, 0, 0, 1, 1, 1, 0x8a3a2a);
  for (let k = 0; k < 5; k++) K.put(M.leaf, clumpGeo(k % 3), 3.6 + Math.cos(k * 1.3) * 0.18, 0.6 + (k % 2) * 0.2, -2.5 + Math.sin(k * 1.3) * 0.18, 0, k, 0, 0.22, 0.16, 0.22, 0x3a7a3a);
  K.build(g);
}

// ---------------------------------------------------------------- CAR extra detail (1904 curved-dash runabout, faces +z)
export function dressCar(body) {
  const K = new Kit(), brass = 0xe8b84a, blk = 0x1d1b22, red = 0x8e1c22;
  // chassis rails and dash panel trim
  for (const sd of [-1, 1]) { K.box(M.paint, sd * 0.46 - 0.04, sd * 0.46 + 0.04, 0.5, 0.58, -1.25, 1.2, blk, 0.015); K.box(M.paint, sd * 0.63 - 0.012, sd * 0.63 + 0.012, 0.6, 1.0, -1.2, 0.5, brass, 0.005); }
  K.box(M.paint, -0.6, 0.6, 0.95, 0.99, -1.24, -1.18, brass, 0.008);
  // tufted seat buttons + armrest rolls
  for (const sd of [-1, 1]) K.put(M.paint, cyl(0.07, 0.07, 0.86, 10), sd * 0.6, 1.25, -0.62, Math.PI / 2, 0, 0, 1, 1, 1, 0x4a2a22);
  // side oil lamps on the dash with red/clear lenses
  for (const sd of [-1, 1]) { const lx = sd * 0.76; K.box(M.paint, lx - 0.06, lx + 0.06, 0.92, 1.1, 0.62, 0.74, blk, 0.02); K.put(M.paint, cone(0.06, 0.08, 4), lx, 1.14, 0.68, 0, Math.PI / 4, 0, 1, 1, 1, blk); K.put(M.glow, plane(0.08, 0.1), lx, 1.01, 0.745, 0, 0, 0, 1, 1, 1, sd > 0 ? 0xff9a7a : 0xfff0c8); K.put(M.paint, sph(0.022, 6, 4), lx, 1.18, 0.68, 0, 0, 0, 1, 1, 1, brass); K.box(M.paint, sd * 0.66, lx, 0.98, 1.02, 0.66, 0.7, brass, 0.005); }
  // lamp bezels
  for (const x of [-0.5, 0.5]) K.put(M.paint, tor(0.11, 0.018, 4, 18), x, 1.18, 1.35, 0, 0, 0, 1, 1, 1, brass);
  // rear deck lid + toolbox + spare can, step plates, hand brake lever, chain guard
  K.box(M.paint, -0.55, 0.55, 1.0, 1.06, -1.25, -1.12, red, 0.02); K.box(M.paint, -0.3, 0.3, 0.6, 0.85, -1.4, -1.22, blk, 0.02); K.put(M.paint, rboxGeo(0.2, 0.3, 0.12, 0.02), 0.42, 0.75, -1.32, 0, 0, 0, 1, 1, 1, 0xa82a22);
  for (const sd of [-1, 1]) K.box(M.paint, sd * 0.72 - 0.12, sd * 0.72 + 0.12, 0.5, 0.52, -0.5, -0.1, 0xb8bcc4, 0.005);
  K.beam(M.paint, [0.7, 0.6, -0.3], [0.74, 1.15, -0.2], 0.02, blk, true, 5); K.put(M.paint, sph(0.035, 6, 4), 0.74, 1.16, -0.2, 0, 0, 0, 1, 1, 1, brass);
  K.box(M.paint, 0.5, 0.56, 0.55, 0.75, -1.0, 0.0, blk, 0.02);
  // brass dash rail + bulb horn tube
  K.beam(M.paint, [-0.55, 1.42, 1.28], [0.55, 1.42, 1.28], 0.016, brass, true, 6);
  K.build(body);
}

// ---------------------------------------------------------------- town around the stadium (aerial shot)
export function dressStadiumTown(G, avoid) {
  const P = prefabs(), K = new Kit(), trees = [], bushes = [];
  for (let i = 0; i < 140; i++) {
    const a = rnd(i * 3.1) * Math.PI * 2, rad = 36 + rnd(i * 5.3) * 30, x = Math.cos(a) * rad, z = -10 + Math.sin(a) * rad * 1.1;
    if (avoid(x, z)) continue;
    if (i % 3 === 0) { trees.push([x, 0, z, rnd(i) * 6, 0.85 + 0.4 * rnd(i * 7), new THREE.Color().setHSL(0.2 + 0.07 * rnd(i), 0.3, 0.56).multiplyScalar(1.45), 1]); continue; }
    if (i % 7 === 1) { bushes.push([x, 0, z, rnd(i) * 6, 1.2]); continue; }
    const ry = Math.round(Math.atan2(-x, -z - 10) / (Math.PI / 2)) * (Math.PI / 2);
    K.at(x, 0, z, ry, () => house(K, { w: 6 + rnd(i + 1) * 2.5, d: 5 + rnd(i + 2) * 1.5, floors: rnd(i + 3) > 0.55 ? 2 : 1, wall: pick(PAL.walls, i * 1.7), trim: pick(PAL.trims, i * 2.3), roof: pick(PAL.roofs, i * 3.9), shutter: rnd(i * 4) > 0.5 ? pick([0x2f4a3a, 0x6a2a2a, 0x3a3a52], i) : null, porch: rnd(i * 6) > 0.35 }));
    if (rnd(i * 8) > 0.5) K.at(x, 0, z, ry, () => picketFence(K, -4, 4, 4.6));
  }
  // church with steeple
  K.at(-38, 0, -56, 0, () => { house(K, { w: 6, d: 10, floors: 1, wall: 0xf2eee4, trim: 0xf4efe2, roof: 0x5a4a6a, porch: false, rise: 3 });
    K.box(M.siding, -1.3, 1.3, 0.5, 10, 4.9, 7.3, 0xf2eee4, 0.02); K.at(0, 10, 6.1, Math.PI / 4, () => K.put(M.shingle, cone(2.0, 6, 4), 0, 3, 0, 0, 0, 0, 1, 1, 1, 0x5a4a6a)); K.at(0, 0, 7.3, 0, () => { door(K, 0, 0.5, 1.2, 2.5, 0x6a2a2a, { transom: true }); win(K, 0, 4.4, 0.8, 1.5, { cols: 2, rows: 3 }); win(K, 0, 7.4, 0.6, 0.9, {}); }); });
  [0, 1, 2].forEach((v) => instance(G, P.trees[v], trees.filter((_, i) => i % 3 === v))); instance(G, P.bush, bushes);
  K.build(G, 40);
}
