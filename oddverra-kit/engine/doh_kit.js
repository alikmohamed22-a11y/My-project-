// doh_kit.js [PD-sets]: shared helpers for the Play-Doh sets (doh_homes.js, doh_works.js). Geometry cache, canvas painters,
// common materials, glow cards, dust motes and a generic set API (show / tick / lightFor / lookFor / gradeFor / placeLights / viewFor / apply).
import { LIGHTS_ } from './story.js';
export const H = {}; // filled by initDoh(ctx): THREE, toon, mkTex, PT, NOND, CAM, MACRO, M (common materials)
export const INK = '#2b1d4a', TAU = Math.PI * 2;
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const sm = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const backOut = (t) => { const s = 1.9; t -= 1; return t * t * ((s + 1) * t + s) + 1; };
export const SERIF = '"DejaVu Serif", Georgia, serif', SANS = '"DejaVu Sans", Arial, sans-serif';

const GC = new Map();
export const cached = (k, mk) => { let g = GC.get(k); if (!g) GC.set(k, (g = mk())); return g; };
export const cyl = (rt, rb, h, rs = 12, open = false) => cached(`c${rt}|${rb}|${h}|${rs}|${open}`, () => new H.THREE.CylinderGeometry(rt, rb, h, rs, 1, open));
export const sph = (r, ws = 14, hs = 10) => cached(`s${r}|${ws}|${hs}`, () => new H.THREE.SphereGeometry(r, ws, hs));
export const tor = (r, t, rs = 6, ts = 24, arc = TAU) => cached(`t${r}|${t}|${rs}|${ts}|${arc}`, () => new H.THREE.TorusGeometry(r, t, rs, ts, arc));
export const plane = (w, h) => cached(`p${w}|${h}`, () => new H.THREE.PlaneGeometry(w, h));
export const planeUV = (w, h, su, sv) => { const g = new H.THREE.PlaneGeometry(w, h), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); return g; };
export const lathe = (key, pts, n = 20) => cached('la' + key, () => new H.THREE.LatheGeometry(pts.map(([r, y]) => new H.THREE.Vector2(r, y)), n));
export const mesh = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, shadow = true) => { const THREE = H.THREE; if (mat.vertexColors && !geo.attributes.color && geo.attributes.position) geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(1), 3)); const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz, 'YXZ'); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
export const nond = (o) => { if (H.NOND) H.NOND.add(o); o.castShadow = false; return o; };
// lumpy blob (dough, coal): icosahedron with hashed radial noise
export const lumpGeo = (seed, det = 2, rough = 0.22) => cached(`lump${seed}|${det}|${rough}`, () => { const g = new H.THREE.IcosahedronGeometry(1, det), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), h = Math.sin(x * 5.9898 + y * 7.233 + z * 3.719 + seed * 4.1) * 43758.5453, k = 1 - rough / 2 + rough * (h - Math.floor(h)); p.setXYZ(i, x * k, y * k, z * k); }
  g.computeVertexNormals(); return g; });
// soft dough lump: smooth low-frequency wobble instead of hashed facets
export const doughGeo = (seed, w = 0.12) => cached(`dough${seed}|${w}`, () => { const g = new H.THREE.SphereGeometry(1, 22, 16), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + w * (Math.sin(x * 2.3 + seed) * Math.cos(z * 2.1 + seed * 1.7) + 0.6 * Math.sin(y * 3.1 + seed * 2.3)); p.setXYZ(i, x * k, y * k * (y < -0.6 ? 0.85 : 1), z * k); }
  g.computeVertexNormals(); return g; });
// dough snake: tube along a wiggly curve in the xz plane
export const snakeGeo = (seed, L = 0.3, r = 0.016) => cached(`snake${seed}|${L}|${r}`, () => { const P = []; for (let i = 0; i <= 12; i++) { const t = i / 12; P.push(new H.THREE.Vector3((t - 0.5) * L, r * 0.8, Math.sin(t * 7 + seed) * L * 0.12)); } return new H.THREE.TubeGeometry(new H.THREE.CatmullRomCurve3(P), 40, r, 8); });
export const shapeGeo = (pts, depth, bevel = 0.004) => { const THREE = H.THREE, s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2 }); g.rotateX(-Math.PI / 2); return g; };
export const starPts = (r0, r1, n = 5) => Array.from({ length: n * 2 }, (_, i) => { const a = Math.PI / 2 + i * Math.PI / n, r = i % 2 ? r1 : r0; return [Math.cos(a) * r, Math.sin(a) * r]; });
export const heartPts = (r) => Array.from({ length: 28 }, (_, i) => { const t = i / 28 * TAU; return [r * 0.06 * 16 * Math.sin(t) ** 3, r * 0.06 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]; });

// ---------------------------------------------------------------- painters
export function txt(g, s, cx, cy, maxW, sz, o = {}) { g.save(); g.font = `${o.italic ? 'italic ' : ''}${o.bold === false ? '' : 'bold '}${sz | 0}px ${o.font || SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const tw = g.measureText(s).width, sx = Math.min(1, maxW / tw); g.translate(cx, cy); if (o.rot) g.rotate(o.rot); g.scale(sx, 1); if (o.shadow) { g.fillStyle = o.shadow; g.fillText(s, sz * 0.05, sz * 0.05); } if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = o.sw || sz * 0.08; g.lineJoin = 'round'; g.strokeText(s, 0, 0); } g.fillStyle = o.col || INK; g.fillText(s, 0, 0); g.restore(); }
export function grain(g, w, h, col, n, seed, a = 0.5) { const R = H.PT.rng(seed); g.fillStyle = col; for (let i = 0; i < n; i++) { g.globalAlpha = a * R(); g.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2); } g.globalAlpha = 1; }
// invented scribble "print" (no real words)
export function scrib(g, x, y, w, sz, R, col = 'rgba(50,30,40,0.85)') { g.save(); g.strokeStyle = col; g.lineWidth = Math.max(1.2, sz * 0.08); g.lineCap = 'round'; g.beginPath(); let cx = x; g.moveTo(cx, y);
  while (cx < x + w) { const lw = sz * (0.22 + R() * 0.2), hg = sz * (R() < 0.18 ? 0.95 : R() < 0.12 ? -0.5 : 0.42); g.bezierCurveTo(cx + lw * 0.1, y - hg, cx + lw * 0.9, y - hg, cx + lw * 0.55, y); cx += lw * 0.62; if (R() < 0.13) { cx += sz * 0.4; g.moveTo(cx, y); } }
  g.stroke(); g.restore(); }
// faux newsprint lines (grey bars of varying length)
export function printLines(g, x, y, w, n, lh, R, col = 'rgba(60,50,50,0.55)') { g.fillStyle = col; for (let i = 0; i < n; i++) { const L = i % 6 === 5 ? w * (0.3 + R() * 0.4) : w; let cx = x; while (cx < x + L - 6) { const ww = Math.min(x + L - cx, 6 + R() * 26); g.fillRect(cx, y + i * lh, ww, lh * 0.42); cx += ww + 4; } } }
export function glowTex(g, w, h) { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
export function shaftTex(g, w, h) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); const d = g.getImageData(0, 0, w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const u = x / w, v = 1 - y / h, k = Math.pow(Math.sin(Math.PI * u), 2) * Math.pow(1 - v, 1.4) * Math.min(1, v * 12) * (0.8 + 0.2 * Math.sin(u * 37 + Math.sin(u * 11) * 3)); const i = (y * w + x) * 4; d.data[i] = d.data[i + 1] = d.data[i + 2] = 255 * k; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0); }
export function flameTex(g, w, h, o = {}) { g.clearRect(0, 0, w, h); const gr = g.createRadialGradient(w / 2, h * 0.7, 0, w / 2, h * 0.6, w * 0.5); (o.blue ? [[0, 'rgba(230,250,255,1)'], [0.35, 'rgba(120,180,255,1)'], [0.7, 'rgba(60,90,255,0.8)'], [1, 'rgba(40,40,255,0)']] : [[0, 'rgba(255,255,230,1)'], [0.35, 'rgba(255,200,90,1)'], [0.7, 'rgba(255,110,40,0.8)'], [1, 'rgba(255,80,20,0)']]).forEach(([a, c]) => gr.addColorStop(a, c));
  g.fillStyle = gr; g.beginPath(); g.moveTo(w / 2, 0); g.bezierCurveTo(w * 0.85, h * 0.4, w * 0.95, h * 0.75, w / 2, h * 0.98); g.bezierCurveTo(w * 0.05, h * 0.75, w * 0.15, h * 0.4, w / 2, 0); g.fill(); }
export function glassTex(g, w, h, o = {}) { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, o.a || '#3a4a78'); gr.addColorStop(0.5, o.b || '#24305a'); gr.addColorStop(1, o.a || '#3a4a78'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(220,230,255,0.35)'; for (const [x, k] of [[0.2, 0.12], [0.36, 0.05], [0.7, 0.08]]) { g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * (x + k), 0); g.lineTo(w * (x + k - 0.3), h); g.lineTo(w * (x - 0.3), h); g.fill(); } }
// cobweb (transparent card)
export function webTex(g, w, h) { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(235,235,245,0.75)'; g.lineWidth = 1.6; const cx = 0, cy = 0, n = 7;
  for (let i = 0; i <= n; i++) { const a = i / n * Math.PI / 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * w, cy + Math.sin(a) * h); g.stroke(); }
  for (let r = 0.15; r < 1; r += 0.14) { g.beginPath(); for (let i = 0; i <= n; i++) { const a = i / n * Math.PI / 2, rr = r * (i % 2 ? 0.94 : 1); const x = Math.cos(a) * w * rr, y = Math.sin(a) * h * rr; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } }
// paper can label: band of colour, title lines; used for WALLPAPER CLEANER (1930s) and PLAY-DOH (1956) cans
export function canLabel(g, w, h, o) { g.fillStyle = o.base; g.fillRect(0, 0, w, h); const R = H.PT.rng(o.seed || 3);
  g.fillStyle = o.band; g.fillRect(0, h * 0.08, w, h * 0.1); g.fillRect(0, h * 0.82, w, h * 0.1);
  for (let k = 0; k < 2; k++) { const cx = w * (0.25 + k * 0.5); // label repeats twice around the can
    o.lines.forEach(([s, y, sz, col], i) => txt(g, s, cx, h * y, w * 0.42, h * sz, { col: col || o.ink, font: o.font || SERIF }));
    if (o.deco === 'roller') { g.save(); g.translate(cx, h * 0.66); g.fillStyle = '#f2ead6'; g.strokeStyle = o.ink; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, h * 0.09, h * 0.08, 0, 0, TAU); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-w * 0.12, h * 0.02); g.lineTo(-h * 0.09, h * 0.02); g.stroke(); g.restore(); }
    if (o.deco === 'star') { g.save(); g.translate(cx, h * 0.68); g.fillStyle = o.band; g.beginPath(); starPts(h * 0.09, h * 0.04).forEach(([x, y], i) => (i ? g.lineTo(x, -y) : g.moveTo(x, -y))); g.closePath(); g.fill(); g.restore(); } }
  H.PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * H.PT.fbm(u, v, 4, 2, 3, o.seed || 3)); grain(g, w, h, 'rgba(90,60,40,1)', 400, 5, 0.2); }

// ---------------------------------------------------------------- materials shared by both modules
export function commonMats() { const { THREE, toon, mkTex: T } = H, m = {};
  const vc = (o = {}) => toon({ vertexColors: true, ...o });
  m.vc = vc; m.em = (map, e = 0x241c14, o = {}) => { const x = toon({ map, emissive: e, ...o }); x.emissiveMap = map; return x; };
  m.basic = (map, k = 1.2) => { const b = new THREE.MeshBasicMaterial({ map, fog: false }); b.color.setScalar(k); return b; };
  m.paint = vc(); m.metal = vc({ emissive: 0x0c0c12 }); m.brass = vc({ emissive: 0x3a2408 }); m.chrome = vc({ emissive: 0x202028 });
  m.dough = toon({ vertexColors: true, emissive: 0x1a1612 }); m.coal = vc({ emissive: 0x050308 });
  m.glow = new THREE.MeshBasicMaterial({ map: T(128, 128, glowTex), color: 0xffc070, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  m.shaft = new THREE.MeshBasicMaterial({ map: T(128, 256, shaftTex), color: 0xffdca8, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  m.dust = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0d0).multiplyScalar(1.3), transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  m.flame = new THREE.MeshBasicMaterial({ map: T(128, 256, flameTex), transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide }); m.flame.color.setScalar(1.8);
  m.blueFlame = new THREE.MeshBasicMaterial({ map: T(128, 256, (g, w, h) => flameTex(g, w, h, { blue: 1 })), transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }); m.blueFlame.color.setScalar(1.6);
  m.lampGlass = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd890).multiplyScalar(2.0), fog: false });
  m.hi = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, fog: false });
  m.jar = toon({ color: 0xcfe8e0, transparent: true, opacity: 0.38, depthWrite: false, emissive: 0x18302a });
  m.web = new THREE.MeshBasicMaterial({ map: T(256, 256, webTex), transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false });
  m.glassW = toon({ map: T(256, 256, glassTex), emissive: 0x101830 });
  return m; }
export function glowAt(root, p, size, col, op = 0.5) { const m = H.M.glow.clone(); m.color.set(col); m.opacity = op; const g = nond(mesh(root, plane(size, size), m, ...p, 0, 0, 0, false)); g.renderOrder = 6; g.userData.op = op; return g; }
// light shaft card from a window: centre p, size [w, h], tilt rx, yaw ry
export function shaftAt(root, p, w, h, ry, rz = 0, op = 0.22, col = 0xffdca8) { const m = H.M.shaft.clone(); m.color.set(col); m.opacity = op; const s = nond(mesh(root, plane(w, h), m, ...p, 0, ry, rz, false)); s.renderOrder = 5; s.userData.op = op; return s; }
// floating dust motes in a box: returns { im, P, box }
export function motes(root, n, box, seed = 3, size = 0.012) { const THREE = H.THREE, R = H.PT.rng(seed), im = nond(new THREE.InstancedMesh(sph(size, 5, 4), H.M.dust, n)); im.renderOrder = 7; root.add(im);
  const P = Array.from({ length: n }, () => [R(), R(), R(), R() * TAU]); return { im, P, box }; }
const _m4 = () => new H.THREE.Matrix4();
export function tickMotes(d, f, drift = 1) { if (!d) return; const THREE = H.THREE, m4 = d.m4 || (d.m4 = new THREE.Matrix4()), v = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(), [x0, x1, y0, y1, z0, z1] = d.box, T = f / 30;
  d.P.forEach((p, i) => { const u = (p[0] + T * 0.01 * drift) % 1, w = (p[1] + Math.sin(T * 0.3 + p[3]) * 0.03 + T * 0.006 * drift) % 1; v.set(x0 + (x1 - x0) * u, y0 + (y1 - y0) * w, z0 + (z1 - z0) * p[2] + Math.sin(T * 0.4 + p[3]) * 0.05);
    m4.compose(v, q, s.setScalar(0.4 + 0.6 * Math.abs(Math.sin(T * 1.3 + p[3])))); d.im.setMatrixAt(i, m4); }); d.im.instanceMatrix.needsUpdate = true; }

// ---------------------------------------------------------------- generic set API
// cfg: { origin, groupOf, light: {name: preset over LIGHTS_[base]}, base: {name: 'day'|'office'}, grade: {name: {look, over}}, views, practicals(name), tick(f, cur), face(q, cur), glows: {group: [cards]}, apply(v) }
export function makeAPI(ctx, cfg) {
  const THREE = H.THREE, O = cfg.origin, GOF = cfg.groupOf, groups = {};
  for (const name of Object.keys(O)) { const g = new THREE.Group(); g.name = cfg.prefix + name; g.position.set(...O[name]); g.visible = false; ctx.scene.add(g); groups[name] = g; }
  let FRAME = 0, CUR = null;
  const W3 = (name, p) => { const o = O[GOF[name] || name]; return [p[0] + o[0], p[1] + o[1], p[2] + o[2]]; };
  const API = {
    groups, origin: O, W3, get cur() { return CUR; }, get frame() { return FRAME; },
    tick(f) { FRAME = f; cfg.tick && cfg.tick(f, CUR); API.face(); },
    lightFor(name) { return { ...LIGHTS_[(cfg.base || {})[name] || 'office'], ...((cfg.light || {})[name] || {}) }; },
    gradeFor: (name) => ({ ...(((cfg.grade || {})[name] || {}).over || {}) }),
    lookFor: (name) => ((cfg.grade || {})[name] || {}).look || 'office',
    show(world, name) { const gname = name ? GOF[name] || name : null; for (const k in groups) groups[k].visible = k === gname; CUR = gname;
      if (name) { cfg.mood && cfg.mood(name); for (const k of ['road', 'stadium', 'office', 'car', 'dc']) if (world[k]) world[k].visible = false; if (world.rooms) world.rooms.show(world, null); API.tick(FRAME); } },
    placeLights(PRACT, name) { const L = cfg.practicals(name, FRAME, W3) || []; PRACT.forEach((l, i) => { const c = L[i]; l.visible = true; if (!c) { l.intensity = 0; return; } l.position.set(...c.p); l.color.set(c.col); l.intensity = c.I; l.distance = c.d; l.decay = 1.6; }); API.face(); },
    face() { const cam = H.CAM; if (!cam || !CUR) return; for (const g of (cfg.glows && cfg.glows[CUR]) || []) g.quaternion.copy(cam.quaternion); },
    views: [],
    viewFor(i, f = 0) { const V = API.views, k = ((i % V.length) + V.length) % V.length, c = V[k];
      return { ...c, i: k, mod: API, set: c.set, f, L: API.lightFor(c.set), look: API.lookFor(c.set), grade: API.gradeFor(c.set), cam: { p: c.p, l: c.l, fov: c.fov, focus: c.focus, cInf: c.cInf, roll: c.roll || 0, shadowAt: c.fp || c.l } }; },
    apply(world, v) { API.show(world, v.set); cfg.apply && cfg.apply(v); API.tick(v.f ?? FRAME); },
  };
  API.view = API.viewFor;
  // view helper: V(set, p, l, fov, cInf, fp, extra)
  API.V = (set, p, l, fov, cInf, fp, extra = {}) => { const c = { set, p: W3(set, p), l: W3(set, l), fov, cInf, fp: fp ? W3(set, fp) : null, ...extra }; c.focus = Math.hypot(...[0, 1, 2].map((i) => c.p[i] - (c.fp || c.l)[i])); return c; };
  return API;
}
export function initDoh(ctx) { if (H.THREE) return; Object.assign(H, { THREE: ctx.THREE, toon: ctx.toon, mkTex: ctx.mkTex, PT: ctx.PT, NOND: ctx.NOND || null, CAM: ctx.camera || null, MACRO: ctx.macro || null }); H.M = commonMats(); }
