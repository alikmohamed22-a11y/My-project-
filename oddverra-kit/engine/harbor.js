// harbor.js [LIB-harbor]: sets for "The Statue of Liberty was supposed to stand in Egypt" (Oddverra short).
//   studio      : Bartholdi's Paris atelier, 1870s: huge north window + sloped skylight (grey Paris light, dust motes in the shafts),
//                 plaster models, sketches pinned on boards, dusty plan-chest drawers, scaffold round a giant plaster crowned head,
//                 giant plaster hand-with-torch fragment on timber cradles, chisels/mallets on the bench, pot-belly stove.
//                 KEY PROP: two maquettes on modelling stands: 'egypt' (terracotta fellaha: headscarf, peasant robe, lamp held high)
//                 and 'liberty' (white plaster: spiked crown, stola, torch held high, tablet). models('egypt'|'liberty'|'both').
//                 A dusty sketch on the bench can be dusted off: dustOff(f0, dur) -> dust layer fades + a puff of dust in tick(f).
//                                                                                                        origin (-11500, 0, -600)
//   centennial  : festive 1876 "America's 100th birthday" fairground: Liberty's copper arm + torch on a bunting-clad base with the
//                 viewing balcony round the flame (as shown in Philadelphia 1876), "1776–1876" banner, pennant lines, paper
//                 lanterns, gas lamps, an exhibition hall behind, optional gift ribbon + bow (setGift(on)).   origin (-11500, 0, -300)
//   harbor      : New York Harbor, 28 Oct 1886: Bedloe's Island, star fort + pedestal, Liberty in SHINY COPPER-BROWN, steamboats,
//                 tug, schooners, sloops, a saluting warship (salute smoke), low Manhattan skyline with church spires + piers of
//                 masts, Brooklyn Bridge. Day light.                                                     origin (-11500, 0, 1500)
//   harborNight : same island at night: the torch is a working LIGHTHOUSE: bright flame, sweeping beam + radiating rays over the
//                 water, low mist, water glow, lit windows, keeper's lantern on the torch balcony; optional fireworks.
// Each set: local frame, floor / water y = 0, camera side +z. All groups start hidden; show(world, name) displays one.
import { Kit } from './world.js';
import { LIGHTS_ } from './story.js';

let THREE, toon, mkTex, PT, NOND, CAM, MACRO;
export const HARBOR_ORIGIN = { studio: [-11500, 0, -600], centennial: [-11500, 0, -300], harbor: [-11500, 0, 1500] };
const O = HARBOR_ORIGIN, GRP = { studio: 'studio', centennial: 'centennial', harbor: 'harbor', harborNight: 'harbor' }, SETS = Object.keys(GRP);
const W3 = (name, p) => { const o = O[GRP[name] || name]; return [p[0] + o[0], p[1] + o[1], p[2] + o[2]]; };
const INK = '#2b1d4a', TAU = Math.PI * 2;
const clamp01 = (x) => Math.max(0, Math.min(1, x)), smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };

// ---------------------------------------------------------------- geometry helpers
const GC = new Map();
const cached = (k, mk) => { let g = GC.get(k); if (!g) GC.set(k, (g = mk())); return g; };
const cyl = (rt, rb, h, rs = 12, open = false) => cached(`c${rt}|${rb}|${h}|${rs}|${open}`, () => new THREE.CylinderGeometry(rt, rb, h, rs, 1, open));
const sph = (r, ws = 14, hs = 10) => cached(`s${r}|${ws}|${hs}`, () => new THREE.SphereGeometry(r, ws, hs));
const tor = (r, t, rs = 6, ts = 24, arc = TAU) => cached(`t${r}|${t}|${rs}|${ts}|${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));
const cone = (r, h, rs = 8) => cached(`k${r}|${h}|${rs}`, () => new THREE.ConeGeometry(r, h, rs));
const plane = (w, h) => cached(`p${w}|${h}`, () => new THREE.PlaneGeometry(w, h));
const lathe = (key, pts, n = 20) => cached('la' + key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n, Math.PI));
const mesh = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, shadow = true) => { if (mat.vertexColors && !geo.attributes.color && geo.attributes.position) geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(1), 3)); const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz, 'YXZ'); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
const nond = (o) => { if (NOND) NOND.add(o); o.castShadow = false; o.receiveShadow = false; return o; };
const lumpGeo = (seed) => cached('lump' + seed, () => { const g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), h = Math.sin(x * 5.9898 + y * 7.233 + z * 3.719 + seed * 4.1) * 43758.5453, k = 0.86 + 0.22 * (h - Math.floor(h)); p.setXYZ(i, x * k, y * k * 0.85, z * k); }
  g.computeVertexNormals(); return g; });
const prismGeo = (w, h, d) => cached(`pr${w}|${h}|${d}`, () => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g; });
const _q = () => new THREE.Quaternion(), _e = () => new THREE.Euler(), UP = () => new THREE.Vector3(0, 1, 0);
// put a geometry whose +y axis points along dir, centred at pos
function putDir(k, mat, geo, pos, dir, c, sx = 1, sy = 1, sz = 1) { const d = new THREE.Vector3(...dir).normalize(), q = _q().setFromUnitVectors(UP(), d), e = _e().setFromQuaternion(q, 'YXZ'); return k.put(mat, geo, pos[0], pos[1], pos[2], e.x, e.y, e.z, sx, sy, sz, c); }
// tapered limb between two points
function seg(k, mat, a, b, r0, r1, c, rs = 12) { const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d); return putDir(k, mat, cyl(+r1.toFixed(4), +r0.toFixed(4), +L.toFixed(4), rs), [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], d, c); }
// run fn with an extra matrix on the kit's transform stack
function atM(k, m, fn) { const o = k.M.clone(); k.M.multiply(m); fn(); k.M.copy(o); }
const TRS = (p, rot, s) => new THREE.Matrix4().compose(new THREE.Vector3(...p), _q().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2], 'YXZ')), new THREE.Vector3(s, s, s));
// sagging catenary points between a and b
const sagPts = (a, b, sag, n) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t]; });

// ---------------------------------------------------------------- the lady (figure units: feet y=0, top of head ~1.0, faces +z)
// Both maquettes and the big statue share this body so they read as clearly alike; head, left arm, torch and drape differ.
function robeGeo(kind) { return cached('robe' + kind, () => {
  const lib = kind !== 'egypt';
  const pts = lib ? [[0, 0], [0.158, 0], [0.165, 0.025], [0.152, 0.15], [0.138, 0.3], [0.124, 0.43], [0.116, 0.52], [0.121, 0.6], [0.128, 0.66], [0.13, 0.7], [0.112, 0.735], [0.06, 0.76], [0, 0.765]]
    : [[0, 0], [0.19, 0], [0.192, 0.03], [0.176, 0.15], [0.156, 0.3], [0.138, 0.43], [0.128, 0.52], [0.128, 0.6], [0.132, 0.66], [0.134, 0.7], [0.115, 0.735], [0.06, 0.76], [0, 0.765]];
  const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 64, Math.PI), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = Math.hypot(x, z); if (r < 1e-5) continue; const ph = Math.atan2(x, z);
    const amp = (lib ? 0.055 : 0.07) * Math.pow(Math.max(0, 1 - y / 0.72), 1.2) + 0.01, n = lib ? 13 : 9;
    let k = 1 + amp * Math.sin(ph * n + Math.sin(y * 11 + ph) * 0.7);
    if (lib) k += 0.06 * Math.exp(-((ph - 0.5) ** 2) / 0.12) * Math.max(0, 1 - y / 0.35); // right knee/leg striding forward under the robe
    else k += 0.04 * Math.exp(-((ph + 0.4) ** 2) / 0.2) * Math.max(0, 1 - y / 0.5);
    const nr = r * k; p.setXYZ(i, Math.sin(ph) * nr, y, Math.cos(ph) * nr * 0.8); }
  g.computeVertexNormals(); return g; }); }
const cupGeo = (kind) => kind === 'egypt' ? lathe('bowlE', [[0.008, 0], [0.04, 0.012], [0.064, 0.036], [0.07, 0.046], [0.05, 0.048], [0, 0.048]], 20) : lathe('cupL', [[0.012, 0], [0.03, 0.012], [0.045, 0.03], [0.053, 0.046], [0.047, 0.052], [0, 0.052]], 20);
const flameGeo = (kind) => cached('flame' + kind, () => { const h = kind === 'egypt' ? 0.085 : 0.11; const g = new THREE.LatheGeometry([[0, 0], [0.036, 0.008], [0.043, h * 0.3], [0.034, h * 0.58], [0.016, h * 0.84], [0, h]].map(([r, y]) => new THREE.Vector2(r, y)), 24, Math.PI), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), ph = Math.atan2(x, z), k = 1 + 0.3 * Math.max(0, Math.sin(ph * 5 + y * 38)) * Math.pow(y / h, 0.8) - 0.08 * (y / h); p.setXYZ(i, x * k + Math.sin(y * 30) * 0.004, y, z * k); } g.computeVertexNormals(); return g; });
// the raised arm: elbow -> hand -> torch. Returns flame base point + balcony radius (figure units)
const EL = [0.155, 0.93, 0.0], HA = [0.14, 1.12, 0.026];
function torchArm(k, mat, kind, c, o = {}) {
  const lib = kind !== 'egypt', cf = o.cupCol ?? c;
  const WR = [HA[0] + 0.004, HA[1] - 0.04, HA[2] - 0.004];
  seg(k, mat, o.stub ? [EL[0] + 0.004, EL[1] - 0.05, EL[2]] : EL, WR, lib ? 0.033 : 0.041, lib ? 0.022 : 0.03, c, 16);
  if (o.fingers) { // a hand you can read at any size: palm on the back, four curled fingers wrapping the handle, thumb over them
    k.put(mat, sph(0.03, 14, 10), HA[0] + 0.012, HA[1] - 0.012, HA[2] - 0.014, 0, 0.6, 0.15, 1.0, 1.35, 0.75, c);
    for (let i = 0; i < 4; i++) k.put(mat, tor(0.0225, 0.0098, 8, 16, Math.PI * 1.25), HA[0] - 0.002, HA[1] - 0.026 + i * 0.0148, HA[2] + 0.002, Math.PI / 2, -0.35 + i * 0.06, 0, 1, 1, 1, c);
    for (let i = 0; i < 4; i++) k.put(mat, sph(0.0105, 8, 6), HA[0] - 0.002 + Math.sin(-0.35 + i * 0.06 + 1.2) * 0.022, HA[1] - 0.026 + i * 0.0148, HA[2] + 0.002 + Math.cos(-0.35 + i * 0.06 + 1.2) * 0.022, 0, 0, 0, 1, 1, 1, c); // knuckles
    seg(k, mat, [HA[0] + 0.02, HA[1] - 0.02, HA[2] + 0.004], [HA[0] - 0.006, HA[1] + 0.024, HA[2] + 0.026], 0.012, 0.0095, c, 8); // thumb
  } else { k.put(mat, sph(0.032, 14, 10), HA[0], HA[1] + 0.01, HA[2], 0, 0, 0.2, 1, 1.25, 0.95, c); k.put(mat, sph(0.013, 8, 6), HA[0] - 0.026, HA[1] + 0.02, HA[2] + 0.018, 0, 0, 0, 1, 1.6, 1, c); }
  const top = lib ? 1.2 : 1.17; seg(k, mat, [HA[0], HA[1] - 0.04, HA[2]], [HA[0] - 0.002, top, HA[2] + 0.002], 0.017, lib ? 0.02 : 0.015, cf, 12);
  k.put(mat, cupGeo(kind), HA[0] - 0.002, top, HA[2] + 0.002, 0, 0, 0, 1, 1, 1, cf);
  if (lib) { k.put(mat, tor(0.05, 0.004, 6, 28), HA[0] - 0.002, top + 0.03, HA[2] + 0.002, Math.PI / 2, 0, 0, 1, 1, 1, cf); }
  else { k.put(mat, tor(0.067, 0.005, 6, 28), HA[0] - 0.002, top + 0.044, HA[2] + 0.002, Math.PI / 2, 0, 0, 1, 1, 1, cf); }
  const fb = [HA[0] - 0.002, top + (lib ? 0.048 : 0.044), HA[2] + 0.002], br = 0.074;
  if (lib && o.balcony) { // the torch balcony: platform + railing round the flame
    k.put(mat, cyl(br, br * 0.92, 0.006, 32), fb[0], fb[1] - 0.006, fb[2], 0, 0, 0, 1, 1, 1, cf);
    k.put(mat, tor(br, 0.0022, 5, 40), fb[0], fb[1] + 0.02, fb[2], Math.PI / 2, 0, 0, 1, 1, 1, cf);
    k.put(mat, tor(br, 0.0012, 5, 40), fb[0], fb[1] + 0.008, fb[2], Math.PI / 2, 0, 0, 1, 1, 1, cf);
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; k.put(mat, cyl(0.0014, 0.0014, 0.026, 4), fb[0] + Math.sin(a) * br, fb[1] + 0.007, fb[2] + Math.cos(a) * br, 0, 0, 0, 1, 1, 1, cf); } }
  if (o.flame !== false) k.put(o.flameMat || mat, flameGeo(kind), fb[0], fb[1], fb[2], 0, 0, 0, 1, 1, 1, o.flameCol ?? cf);
  return { flame: fb, balcR: br };
}
function ladyHead(k, mat, kind, c, o = {}) {
  const lib = kind !== 'egypt';
  seg(k, mat, [0, 0.735, 0], [0, 0.835, 0.008], 0.043, 0.034, c, 14);
  k.put(mat, sph(0.066, 22, 16), 0, 0.875, 0.01, 0, 0, 0, 0.94, 1.12, 1.0, c);
  k.put(mat, sph(0.012, 8, 6), 0, 0.872, 0.074, 0.25, 0, 0, 0.75, 1.5, 0.9, c); // nose
  k.put(mat, sph(0.03, 10, 8), 0, 0.822, 0.04, 0, 0, 0, 1.1, 0.8, 1, c); // chin
  if (lib) {
    k.put(mat, sph(0.069, 18, 12), 0, 0.888, -0.014, 0, 0, 0, 1.02, 1.0, 0.98, c); // hair
    k.put(mat, sph(0.034, 10, 8), 0, 0.85, -0.072, 0, 0, 0, 1.2, 1, 1, c); // bun
    k.put(mat, cyl(0.07, 0.073, 0.034, 28), 0, 0.928, 0.0, -0.12, 0, 0, 1, 1, 0.98, c); // diadem
    for (let i = 0; i < 7; i++) { const a = (-0.5 + i / 6) * 2.5, e = 0.3, d = [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)];
      putDir(k, mat, cone(0.015, 0.13, 6), [Math.sin(a) * 0.066 + d[0] * 0.065, 0.935 + d[1] * 0.065, Math.cos(a) * 0.062 + d[2] * 0.065], d, c, 1, 1, 0.55); }
  } else {
    const scarf = cached('scarf', () => new THREE.SphereGeometry(0.08, 22, 14, Math.PI / 2 + 0.75, TAU - 1.5, 0, Math.PI * 0.72));
    k.put(mat, scarf, 0, 0.872, 0.0, -0.12, 0, 0, 1.0, 1.1, 1.0, c);
    k.put(mat, sph(0.1, 16, 12), 0, 0.75, -0.035, 0.15, 0, 0, 1.45, 1.55, 0.72, c); // shawl falling to the shoulders
    k.put(mat, tor(0.073, 0.011, 6, 26, Math.PI * 1.05), 0, 0.905, 0.0, Math.PI / 2 - 0.35, 0, -0.05, 1, 1, 1, c); // scarf brow edge
  }
}
function lady(k, mat, kind, c, o = {}) {
  const lib = kind !== 'egypt';
  k.put(mat, robeGeo(kind), 0, 0, 0, 0, 0, 0, 1, 1, 1, c);
  k.put(mat, sph(0.04, 10, 8), lib ? -0.055 : 0.045, 0.018, 0.13, 0, 0, 0, 1, 0.55, 1.5, c); // toe
  ladyHead(k, mat, kind, c, o);
  // right arm, raised
  const SH = [0.118, 0.712, 0];
  k.put(mat, sph(lib ? 0.045 : 0.052, 12, 10), SH[0], SH[1], SH[2], 0, 0, 0, 1, 1, 1, c);
  seg(k, mat, SH, EL, lib ? 0.036 : 0.046, lib ? 0.032 : 0.043, c, 14);
  k.put(mat, sph(lib ? 0.033 : 0.043, 10, 8), ...EL, 0, 0, 0, 1, 1, 1, c);
  if (lib) seg(k, mat, [0.12, 0.73, 0.0], [0.168, 0.875, 0.012], 0.06, 0.03, c, 14); // sleeve fallen to the elbow
  else seg(k, mat, [EL[0] + 0.01, EL[1] - 0.01, EL[2] + 0.01], [0.19, 0.8, 0.03], 0.048, 0.02, c, 12); // loose peasant sleeve hanging
  const t = torchArm(k, mat, kind, c, o);
  if (lib) { // left arm cradles the tablet
    const LS = [-0.118, 0.708, 0], LE = [-0.165, 0.52, 0.02], LH = [-0.13, 0.6, 0.095];
    k.put(mat, sph(0.044, 12, 10), ...LS, 0, 0, 0, 1, 1, 1, c); seg(k, mat, LS, LE, 0.04, 0.034, c); seg(k, mat, LE, LH, 0.032, 0.026, c); k.put(mat, sph(0.03, 10, 8), ...LH, 0, 0, 0, 1, 1, 1, c);
    k.put(o.tabMat || mat, cached('tab', () => new THREE.BoxGeometry(0.105, 0.2, 0.026)), -0.15, 0.6, 0.075, -0.18, 0.2, 0.32, 1, 1, 1, o.tabCol ?? c);
    k.put(mat, tor(0.13, 0.024, 8, 30, Math.PI * 1.1), 0.0, 0.6, 0.012, Math.PI / 2 + 0.05, -0.15, -0.5, 1, 1, 0.85, c); // stola across the chest
    k.put(mat, sph(0.07, 12, 10), -0.105, 0.42, 0.05, 0, 0, 0, 0.8, 1.9, 0.6, c); // drape hanging from the left arm
  } else { // left arm hangs, hand gathering the robe
    const LS = [-0.118, 0.708, 0], LE = [-0.158, 0.52, 0.02], LH = [-0.152, 0.37, 0.05];
    k.put(mat, sph(0.05, 12, 10), ...LS, 0, 0, 0, 1, 1, 1, c); seg(k, mat, LS, LE, 0.046, 0.042, c); seg(k, mat, LE, LH, 0.04, 0.03, c); k.put(mat, sph(0.032, 10, 8), ...LH, 0, 0, 0, 1, 1.15, 1, c);
    k.put(mat, cone(0.045, 0.2, 8), -0.15, 0.25, 0.06, 0, 0, 0.08, 1, 1, 0.7, c); // gathered fold below the hand
    k.put(mat, tor(0.128, 0.014, 6, 30), 0, 0.54, 0, Math.PI / 2, 0, 0, 1, 1, 0.8, c); // waist sash
    k.put(mat, tor(0.05, 0.007, 6, 20), 0, 0.745, 0.02, Math.PI / 2 - 0.5, 0, 0, 1, 1, 1, c); // necklace
  }
  return t;
}

// ---------------------------------------------------------------- painters
const css = (...a) => PT.css(...a), shade = (...a) => PT.shade(...a), tint = (...a) => PT.tint(...a), rng = (...a) => PT.rng(...a), fbm = (...a) => PT.fbm(...a), modulate = (...a) => PT.modulate(...a), hex = (...a) => PT.hex(...a);
const SERIF = '"DejaVu Serif", Georgia, serif';
function txt(g, s, cx, cy, maxW, sz, o = {}) { g.save(); g.font = `${o.italic ? 'italic ' : ''}${o.bold === false ? '' : 'bold '}${sz | 0}px ${o.font || SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const tw = g.measureText(s).width, sx = Math.min(1, maxW / tw); g.translate(cx, cy); g.scale(sx, 1); if (o.stroke) { g.lineWidth = o.stroke; g.strokeStyle = o.strokeCol || INK; g.strokeText(s, 0, 0); } g.fillStyle = o.col || INK; g.fillText(s, 0, 0); g.restore(); }
function grain(g, w, h, col, n, seed, a = 0.5) { const R = rng(seed); g.fillStyle = col; for (let i = 0; i < n; i++) { g.globalAlpha = a * R(); g.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2); } g.globalAlpha = 1; }
function plasterTex(g, w, h, o = {}) { g.fillStyle = o.base || '#d8d0c2'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.9 + 0.14 * fbm(u, v, 5, 5, 4, o.seed || 3)); grain(g, w, h, '#6a5a5a', 1400, 5, 0.18);
  const R = rng((o.seed || 3) + 9); for (let i = 0; i < (o.stains ?? 6); i++) { const x = R() * w, y = R() * h * 0.5; const gr = g.createLinearGradient(x, y, x, y + h * 0.5); gr.addColorStop(0, 'rgba(90,70,60,0.18)'); gr.addColorStop(1, 'rgba(90,70,60,0)'); g.fillStyle = gr; g.fillRect(x, y, 10 + R() * 40, h * 0.5); } }
function floorTex(g, w, h) { PT.planks(g, w, h, { base: '#8a7258', n: 7, seed: 51 }); const R = rng(52);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(240,234,222,${0.15 + R() * 0.35})`; g.beginPath(); g.ellipse(R() * w, R() * h, 2 + R() * 9, 1.5 + R() * 5, R() * 3, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(235,228,215,0.18)'; for (let i = 0; i < 900; i++) g.fillRect(R() * w, R() * h, 2, 2); }
function sky(g, w, h, stops) { const gr = g.createLinearGradient(0, 0, 0, h); stops.forEach(([t, c]) => gr.addColorStop(t, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
function parisView(g, w, h) { sky(g, w, h, [[0, '#c4c8d8'], [0.55, '#e6e8f0'], [1, '#f2f0ee']]); const R = rng(77);
  g.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 26; i++) { g.beginPath(); g.ellipse(R() * w, h * (0.05 + R() * 0.4), 60 + R() * 120, 18 + R() * 26, 0, 0, TAU); g.fill(); }
  // three rows of grey zinc mansard roofs with chimney pots
  for (const [y0, col, sc] of [[0.72, '#a8acc0', 0.7], [0.8, '#8a8ea6', 0.85], [0.9, '#6e7088', 1]]) { let x = -20;
    while (x < w) { const bw = (60 + R() * 90) * sc, bh = (40 + R() * 50) * sc, yb = h * y0 - bh; g.fillStyle = col; g.beginPath(); g.moveTo(x, h); g.lineTo(x, yb + 12 * sc); g.lineTo(x + 10 * sc, yb); g.lineTo(x + bw - 10 * sc, yb); g.lineTo(x + bw, yb + 12 * sc); g.lineTo(x + bw, h); g.fill();
      g.fillStyle = css(shade(hex(col), 0.75)); for (let j = 0; j < 3; j++) if (R() < 0.7) { const cx = x + bw * (0.2 + R() * 0.6); g.fillRect(cx, yb - 18 * sc, 10 * sc, 18 * sc); g.fillStyle = '#b87a5a'; for (let p = 0; p < 3; p++) g.fillRect(cx + p * 3.4 * sc, yb - 24 * sc, 2.6 * sc, 6 * sc); g.fillStyle = css(shade(hex(col), 0.75)); }
      g.fillStyle = css(tint(hex(col), 1.15)); for (let j = 0; j < 4; j++) if (R() < 0.6) g.fillRect(x + bw * (0.15 + j * 0.2), yb + 16 * sc, 9 * sc, 13 * sc);
      x += bw + R() * 6; } }
  modulate(g, w, h, (u, v) => 0.96 + 0.06 * fbm(u, v, 6, 6, 3, 4)); }
// pencil sketch of the lady (robed woman, torch high); o.crown / o.scarf / o.tablet
function ladySketch(g, cx, by, H, o = {}) { const R = rng(o.seed || 5), X = (x) => cx + x * H, Y = (y) => by - y * H;
  const stroke = (pts, a = 0.75, lw = 2) => { for (let p = 0; p < 2; p++) { g.strokeStyle = `rgba(52,46,64,${a * (p ? 0.5 : 1)})`; g.lineWidth = lw * (p ? 0.6 : 1); g.beginPath(); pts.forEach(([x, y], i) => { const jx = (R() - 0.5) * H * 0.006, jy = (R() - 0.5) * H * 0.006; i ? g.lineTo(X(x) + jx, Y(y) + jy) : g.moveTo(X(x) + jx, Y(y) + jy); }); g.stroke(); } };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = 'rgba(80,90,140,0.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(X(0), Y(-0.02)); g.lineTo(X(0), Y(1.4)); for (let i = 0; i <= 7; i++) { g.moveTo(X(-0.25), Y(i * 0.2)); g.lineTo(X(-0.18), Y(i * 0.2)); } g.stroke();
  const w0 = o.scarf ? 0.19 : 0.16;
  stroke([[-w0, 0], [-w0 * 0.92, 0.15], [-0.135, 0.33], [-0.12, 0.5], [-0.125, 0.62], [-0.12, 0.71], [-0.06, 0.76]]);
  stroke([[w0, 0], [w0 * 0.93, 0.15], [0.14, 0.33], [0.122, 0.5], [0.125, 0.64], [0.12, 0.7]]);
  stroke([[-w0, 0], [w0, 0]], 0.6);
  for (let i = 0; i < 7; i++) { const x = -0.12 + i * 0.04 + (R() - 0.5) * 0.01; stroke([[x * 1.2, 0.02], [x * 1.05, 0.25 + R() * 0.1], [x, 0.4 + R() * 0.12]], 0.4, 1.3); }
  stroke([[0.12, 0.7], [0.158, 0.93], [0.142, 1.12]], 0.75, 2.4); stroke([[0.09, 0.72], [0.128, 0.93], [0.122, 1.1]], 0.6);
  stroke([[0.14, 1.1], [0.14, 1.2]], 0.8, 3); stroke([[0.09, 1.2], [0.19, 1.2], [0.17, 1.24], [0.11, 1.24], [0.09, 1.2]], 0.8);
  stroke([[0.11, 1.24], [0.12, 1.29], [0.135, 1.27], [0.14, 1.34], [0.152, 1.28], [0.165, 1.3], [0.17, 1.24]], 0.85, 2.2);
  g.strokeStyle = 'rgba(52,46,64,0.8)'; g.lineWidth = 2; g.beginPath(); g.ellipse(X(0), Y(0.875), H * 0.062, H * 0.074, 0, 0, TAU); g.stroke();
  if (o.crown) for (let i = 0; i < 7; i++) { const a = (-0.5 + i / 6) * 2.3; stroke([[Math.sin(a) * 0.06, 0.93 + Math.cos(a) * 0.035], [Math.sin(a) * 0.16, 0.95 + Math.cos(a) * 0.1]], 0.8); }
  if (o.scarf) { stroke([[-0.085, 0.82], [-0.08, 0.92], [-0.03, 0.965], [0.04, 0.96], [0.085, 0.9], [0.09, 0.8], [0.15, 0.66]], 0.8, 2.2); stroke([[-0.085, 0.82], [-0.16, 0.64]], 0.7); }
  if (o.tablet) { stroke([[-0.21, 0.5], [-0.11, 0.53], [-0.08, 0.72], [-0.18, 0.7], [-0.21, 0.5]], 0.8); }
  else stroke([[-0.12, 0.7], [-0.16, 0.52], [-0.15, 0.37]], 0.7, 2.2);
  // hatching on the shadow side
  g.strokeStyle = 'rgba(52,46,64,0.22)'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 26; i++) { const y = 0.05 + i * 0.026; g.moveTo(X(-w0 * 0.95 + y * 0.03), Y(y)); g.lineTo(X(-w0 * 0.6 + y * 0.03), Y(y + 0.04)); } g.stroke();
  g.restore(); }
function paperBase(g, w, h, seed, base = '#efe6cf') { PT.paper(g, w, h, { base, seed }); g.strokeStyle = 'rgba(120,100,70,0.25)'; g.lineWidth = 3; g.strokeRect(4, 4, w - 8, h - 8); }
function sketchTex(kind) { return (g, w, h) => { paperBase(g, w, h, kind.length * 7 + 3, kind === 'old' ? '#e8dcbc' : '#f0e8d4'); const R = rng(kind.length + 11);
  if (kind === 'egypt' || kind === 'old') { ladySketch(g, w * 0.44, h * 0.92, h * 0.62, { scarf: true, seed: 7 }); g.strokeStyle = 'rgba(52,46,64,0.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(w * 0.05, h * 0.95); g.lineTo(w * 0.95, h * 0.95); g.stroke(); txt(g, '1869', w * 0.82, h * 0.1, w * 0.25, h * 0.06, { col: 'rgba(52,46,64,0.7)', italic: true, bold: false }); }
  else if (kind === 'liberty') { ladySketch(g, w * 0.46, h * 0.92, h * 0.62, { crown: true, tablet: true, seed: 9 }); txt(g, 'LIBERTY', w * 0.5, h * 0.06, w * 0.5, h * 0.05, { col: 'rgba(52,46,64,0.7)', bold: false }); }
  else if (kind === 'colossi') { g.strokeStyle = 'rgba(52,46,64,0.7)'; g.lineWidth = 2; for (const x0 of [0.18, 0.58]) { g.strokeRect(w * x0, h * 0.62, w * 0.24, h * 0.26); g.beginPath(); g.ellipse(w * (x0 + 0.12), h * 0.28, w * 0.06, h * 0.07, 0, 0, TAU); g.stroke(); g.strokeRect(w * (x0 + 0.03), h * 0.35, w * 0.18, h * 0.27); } g.beginPath(); g.moveTo(0, h * 0.88); g.lineTo(w, h * 0.88); g.stroke(); }
  else if (kind === 'pyramid') { g.strokeStyle = 'rgba(52,46,64,0.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(w * 0.1, h * 0.8); g.lineTo(w * 0.42, h * 0.3); g.lineTo(w * 0.75, h * 0.8); g.moveTo(w * 0.55, h * 0.8); g.lineTo(w * 0.72, h * 0.52); g.lineTo(w * 0.92, h * 0.8); g.moveTo(0, h * 0.8); g.lineTo(w, h * 0.8); g.stroke(); for (let i = 0; i < 14; i++) { g.globalAlpha = 0.25; g.beginPath(); g.moveTo(w * (0.42 - i * 0.022), h * (0.3 + i * 0.036)); g.lineTo(w * 0.42, h * (0.3 + i * 0.036)); g.stroke(); } g.globalAlpha = 1; }
  else if (kind === 'arm') { g.strokeStyle = 'rgba(52,46,64,0.75)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w * 0.3, h * 0.95); g.lineTo(w * 0.42, h * 0.35); g.moveTo(w * 0.55, h * 0.95); g.lineTo(w * 0.58, h * 0.36); g.stroke(); g.beginPath(); g.ellipse(w * 0.5, h * 0.3, w * 0.12, h * 0.07, 0, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(w * 0.38, h * 0.24); g.quadraticCurveTo(w * 0.5, h * 0.0, w * 0.62, h * 0.24); g.stroke(); for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(w * 0.62, h * (0.5 + i * 0.07)); g.lineTo(w * 0.9, h * (0.5 + i * 0.07)); g.globalAlpha = 0.35; g.stroke(); g.globalAlpha = 1; } }
  else { g.strokeStyle = 'rgba(52,46,64,0.7)'; g.lineWidth = 2; g.beginPath(); g.ellipse(w * 0.5, h * 0.45, w * 0.22, h * 0.24, 0, 0, TAU); g.stroke(); for (let i = 0; i < 7; i++) { const a = -2.5 + i * 0.42; g.beginPath(); g.moveTo(w * (0.5 + Math.cos(a) * 0.22), h * (0.45 + Math.sin(a) * 0.24)); g.lineTo(w * (0.5 + Math.cos(a) * 0.38), h * (0.45 + Math.sin(a) * 0.4)); g.stroke(); } }
  grain(g, w, h, '#7a6a50', 500, kind.length + 3, 0.15); }; }
function dustTex(g, w, h) { g.clearRect(0, 0, w, h); const R = rng(91); for (let i = 0; i < 9000; i++) { const x = R() * w, y = R() * h; g.fillStyle = `rgba(${200 + R() * 40},${190 + R() * 40},${170 + R() * 40},${0.25 + R() * 0.5})`; g.fillRect(x, y, 1 + R() * 3, 1 + R() * 3); }
  modulate(g, w, h, (u, v) => 0.7 + 0.5 * fbm(u, v, 4, 4, 3, 2)); const id = g.getImageData(0, 0, w, h), d = id.data; for (let i = 3; i < d.length; i += 4) d[i] = Math.min(255, d[i] * 0.95); g.putImageData(id, 0, 0);
  g.fillStyle = 'rgba(214,204,186,0.62)'; g.globalCompositeOperation = 'destination-over'; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over'; }
function puffTex(g, w, h) { g.clearRect(0, 0, w, h); const R = rng(5); for (let i = 0; i < 9; i++) { const x = w * (0.3 + R() * 0.4), y = h * (0.3 + R() * 0.4), r = w * (0.18 + R() * 0.16); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } }
function glowTex(g, w, h) { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
function raysTex(g, w, h) { g.clearRect(0, 0, w, h); g.translate(w / 2, h / 2); const R = rng(13); for (let i = 0; i < 28; i++) { const a = i / 28 * TAU + R() * 0.1, L = w * (0.25 + R() * 0.25), wd = 0.03 + R() * 0.03; const gr = g.createLinearGradient(0, 0, Math.cos(a) * L, Math.sin(a) * L); gr.addColorStop(0, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a - wd) * L, Math.sin(a - wd) * L); g.lineTo(Math.cos(a + wd) * L, Math.sin(a + wd) * L); g.fill(); } g.setTransform(1, 0, 0, 1, 0, 0); }
function beamTex(g, w, h) { for (let y = 0; y < h; y++) { const v = 1 - y / h; /* canvas top = cylinder top = apex */ const a = Math.pow(1 - v, 0) * Math.pow(1 - y / h, 1.6); g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(0, y, w, 1); }
  const R = rng(3); g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(0,0,0,${R() * 0.3})`; g.fillRect(R() * w, 0, 2 + R() * 8, h); } g.globalCompositeOperation = 'source-over'; }
function mistTex(g, w, h) { g.clearRect(0, 0, w, h); const id = g.createImageData(w, h), d = id.data; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const u = x / w, v = y / h, n = fbm(u, v, 4, 4, 4, 17), r = Math.hypot(u - 0.5, v - 0.5) * 2, a = Math.max(0, n - 0.42) * 2.2 * Math.max(0, 1 - r * r); const i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = Math.min(255, a * 255); } g.putImageData(id, 0, 0); }
function dotTex(g, w, h) { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
// cel-banded matcaps: shiny new copper by day, torch-lit copper at night
function capTex(o) { return (g, w, h) => { const id = g.createImageData(w, h), d = id.data, L = new THREE.Vector3(...o.L).normalize(), Hh = L.clone().add(new THREE.Vector3(0, 0, 1)).normalize(), C = Object.fromEntries(Object.entries(o.col).map(([k, v]) => [k, hex(v)]));
  const mix = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t), st = (e0, e1, x) => smooth((x - e0) / (e1 - e0));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const nx = (x + 0.5) / w * 2 - 1, ny = 1 - (y + 0.5) / h * 2, r2 = Math.min(0.999, nx * nx + ny * ny), nz = Math.sqrt(1 - r2);
    const dl = nx * L.x + ny * L.y + nz * L.z, sp = nx * Hh.x + ny * Hh.y + nz * Hh.z, rim = 1 - nz;
    let c = mix(C.deep, C.mid, st(-0.15, -0.05, dl)); c = mix(c, C.lit, st(0.4, 0.48, dl)); c = mix(c, C.hi, st(o.spec - 0.012, o.spec + 0.004, sp));
    if (o.L2) { const d2 = nx * o.L2[0] + ny * o.L2[1] + nz * o.L2[2]; c = mix(c, C.rim2, st(0.55, 0.62, d2) * 0.8); }
    c = mix(c, C.rim, st(0.62, 0.75, rim) * st(-0.3, 0.2, -ny * 0.5 + (o.rimSide || 0) * nx) * 0.75);
    const i = (y * w + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; }
  g.putImageData(id, 0, 0); }; }
function waterTex(night) { return (g, w, h) => { g.fillStyle = night ? '#141a3a' : '#3d6f8e'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.85 + 0.25 * fbm(u, v, 3, 6, 3, 8)); const R = rng(night ? 6 : 5);
  for (let i = 0; i < 420; i++) { const x = R() * w, y = R() * h, l = 10 + R() * 34; g.strokeStyle = night ? `rgba(70,90,160,${0.3 + R() * 0.4})` : `rgba(170,210,226,${0.35 + R() * 0.5})`; g.lineWidth = 1.5 + R() * 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 3, x + l, y); g.stroke(); }
  for (let i = 0; i < 260; i++) { const x = R() * w, y = R() * h, l = 8 + R() * 26; g.strokeStyle = night ? 'rgba(6,8,24,0.5)' : 'rgba(30,58,86,0.45)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y + 3, x + l, y); g.stroke(); } }; }
function facadeTex(base, lit) { return (g, w, h) => { const R = rng(base.length * 13 + (lit ? 1 : 0)); if (lit) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); } else { g.fillStyle = base; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.86 + 0.2 * fbm(u, v, 6, 3, 3, 5)); g.fillStyle = 'rgba(40,30,40,0.25)'; g.fillRect(0, 0, w, 10); }
  for (let i = 0; i < 4; i++) { const x = w * (0.1 + i * 0.22), y = h * 0.28, ww = w * 0.1, hh = h * 0.48; if (lit) { if (R() < 0.45) { g.fillStyle = R() < 0.5 ? '#ffd08a' : '#ffb860'; g.fillRect(x, y, ww, hh); } else R(); } else { g.fillStyle = '#e8dcc8'; g.fillRect(x - 3, y + hh, ww + 6, 5); g.fillStyle = R() < 0.5 ? '#2a2638' : '#3a3448'; g.fillRect(x, y, ww, hh); g.fillStyle = 'rgba(200,210,230,0.2)'; g.fillRect(x + 2, y + 2, ww * 0.4, hh * 0.4); } } }; }
function cabinTex(lit) { return (g, w, h) => { g.fillStyle = lit ? '#000' : '#f2ece0'; g.fillRect(0, 0, w, h); const R = rng(lit ? 3 : 2); for (let i = 0; i < 16; i++) { const x = i * w / 16 + 4; if (lit) { g.fillStyle = R() < 0.7 ? '#ffd090' : '#000'; } else g.fillStyle = '#3a3448'; g.fillRect(x, h * 0.3, w / 16 - 10, h * 0.45); } if (!lit) { g.fillStyle = '#c8b8a0'; g.fillRect(0, h * 0.88, w, h * 0.12); } }; }
function stripesTex(g, w, h) { const c = ['#c8302e', '#f4efe4', '#2a4a8a']; for (let i = 0; i < 3; i++) { g.fillStyle = c[i]; g.fillRect(0, i * h / 3, w, h / 3 + 1); } PT.fabric && modulate(g, w, h, (u, v) => 0.9 + 0.12 * fbm(u, v, 6, 6, 3, 2)); }
function fanTex(g, w, h) { g.clearRect(0, 0, w, h); const cx = w / 2, cy = 0; const bands = [['#2a4a8a', 0.34], ['#f4efe4', 0.56], ['#c8302e', 0.74], ['#f4efe4', 0.86], ['#c8302e', 1]];
  for (let i = bands.length - 1; i >= 0; i--) { g.fillStyle = bands[i][0]; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, w / 2 * bands[i][1], 0, Math.PI); g.fill(); }
  g.fillStyle = '#f4efe4'; for (let i = 0; i < 5; i++) { const a = 0.35 + i * 0.6; g.beginPath(); g.arc(cx + Math.cos(a) * w * 0.1, cy + Math.sin(a) * w * 0.1, w * 0.014, 0, TAU); g.fill(); }
  g.strokeStyle = 'rgba(40,20,40,0.35)'; g.lineWidth = 3; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI; g.beginPath(); g.moveTo(cx + Math.cos(a) * w * 0.17, Math.sin(a) * w * 0.17); g.lineTo(cx + Math.cos(a) * w / 2, Math.sin(a) * w / 2); g.stroke(); } }
function bannerTex(g, w, h) { PT.fabric(g, w, h, { base: '#f2e6c8' }); g.fillStyle = '#b8282a'; g.fillRect(0, 0, w, h * 0.12); g.fillRect(0, h * 0.88, w, h * 0.12); g.fillStyle = '#2a4a8a'; g.fillRect(0, h * 0.12, w, h * 0.04); g.fillRect(0, h * 0.84, w, h * 0.04);
  txt(g, '1776 – 1876', w / 2, h * 0.52, w * 0.86, h * 0.56, { col: '#2a2048', stroke: 3, strokeCol: '#f8f0dc' }); }
function lanternTex(col) { return (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 6; i++) g.fillRect(0, i * h / 6, w, 3); }; }
function ashlarTex(base, seed) { return (g, w, h) => { const b = hex(base), R = rng(seed); g.fillStyle = css(shade(b, 0.7)); g.fillRect(0, 0, w, h); const rows = 8, rh = h / rows;
  for (let r = 0; r < rows; r++) { let x = -(r % 2) * w * 0.12; while (x < w) { const bw = w * (0.18 + R() * 0.14), k = 0.9 + R() * 0.16; g.fillStyle = css(b.map((v) => Math.min(255, v * k))); g.fillRect(x + 2, r * rh + 2, bw - 4, rh - 4); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x + 2, r * rh + 2, bw - 4, 3); g.fillStyle = 'rgba(40,30,50,0.12)'; g.fillRect(x + 2, r * rh + rh - 6, bw - 4, 4); x += bw; } }
  modulate(g, w, h, (u, v) => 0.9 + 0.16 * fbm(u, v, 5, 5, 4, seed)); grain(g, w, h, '#4a4048', 2500, seed, 0.25); }; }
function stoneTex(base, seed) { return (g, w, h) => { PT.stone(g, w, h, { base, seed }); modulate(g, w, h, (u, v) => 0.9 + 0.15 * fbm(u, v, 4, 4, 3, seed || 3)); }; }
function hallTex(g, w, h) { g.fillStyle = '#e8d8b8'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.9 + 0.12 * fbm(u, v, 6, 3, 3, 4)); g.fillStyle = '#5a4a6a'; for (let i = 0; i < 4; i++) { const x = w * (0.06 + i * 0.25); g.fillRect(x, h * 0.25, w * 0.13, h * 0.6); g.beginPath(); g.arc(x + w * 0.065, h * 0.25, w * 0.065, Math.PI, 0); g.fill(); } g.fillStyle = '#b8a888'; g.fillRect(0, h * 0.9, w, h * 0.1); g.fillRect(0, 0, w, h * 0.06); }
function skyNightTex(g, w, h) { sky(g, w, h, [[0, '#0a0c26'], [1, '#283a74']]); }

let M;
function materials() {
  const vc = (o = {}) => toon({ vertexColors: true, ...o }), T = (w, h, fn, rep) => mkTex(w, h, fn, rep), m = {};
  const basic = (map, k = 1.25, o = {}) => { const b = new THREE.MeshBasicMaterial({ map, fog: false, ...o }); b.color.setScalar(k); return b; };
  const add = (map, col, op, o = {}) => new THREE.MeshBasicMaterial({ map, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false, ...o });
  m.paint = vc(); m.metal = vc({ emissive: 0x0c0c12 }); m.brass = vc({ emissive: 0x2a1a06 });
  m.wood = vc({ map: T(256, 256, (g, w, h) => PT.planks(g, w, h, { base: '#9a7a58', n: 4, seed: 23, joints: 0 })) });
  m.floor = vc({ map: T(512, 512, floorTex, [3, 3]) });
  m.wall = vc({ map: T(512, 512, (g, w, h) => plasterTex(g, w, h, { base: '#cfc6b8' }), [3, 2]) });
  m.plaster = vc({ emissive: 0x24202a }); m.clay = vc({ emissive: 0x1a0c08 });
  m.copperCapD = T(256, 256, capTex({ L: [-0.45, 0.55, 0.7], spec: 0.965, col: { deep: '#4a2018', mid: '#9a4a28', lit: '#d0783c', hi: '#ffe0b0', rim: '#8a7ae0', rim2: '#ffb070' }, L2: [0.8, 0.1, 0.3], rimSide: -0.4 }));
  m.copperCapN = T(256, 256, capTex({ L: [0.15, 0.95, 0.3], spec: 0.975, col: { deep: '#1a1634', mid: '#36294e', lit: '#b0603a', hi: '#ffd8a0', rim: '#5a7ae8', rim2: '#6a5ab0' }, L2: [-0.85, 0.0, 0.4], rimSide: 0.5 }));
  m.copperCapS = T(256, 256, capTex({ L: [0.6, 0.45, 0.6], spec: 0.965, col: { deep: '#4a1e22', mid: '#a04a2c', lit: '#e88a44', hi: '#fff0c8', rim: '#9a7ae8', rim2: '#ff9a50' }, L2: [-0.7, 0.2, 0.4], rimSide: 0.3 }));
  m.copper = new THREE.MeshMatcapMaterial({ matcap: m.copperCapD, vertexColors: true }); m.copperC = new THREE.MeshMatcapMaterial({ matcap: m.copperCapS, vertexColors: true });
  m.flameN = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd88a).multiplyScalar(3.2), fog: false });
  m.glass = new THREE.MeshBasicMaterial({ color: 0xdfe6f4, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  m.paris = basic(T(1024, 768, parisView), 0.98); m.parisSky = basic(T(64, 256, (g, w, h) => sky(g, w, h, [[0, '#b8bccc'], [1, '#e6e8f0']])), 1.25);
  m.shaft = new THREE.MeshBasicMaterial({ color: 0xe8eeff, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  m.glow = add(T(128, 128, glowTex), 0xffb060, 0.5); m.glowW = add(T(128, 128, glowTex), 0xfff0d0, 0.7);
  m.rays = add(T(512, 512, raysTex), 0xffe0a0, 0.55);
  m.ember = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff8a30).multiplyScalar(2.4), fog: false });
  for (const k of ['egypt', 'liberty', 'old', 'colossi', 'pyramid', 'arm', 'head']) m['sk_' + k] = toon({ map: T(512, 680, sketchTex(k)), emissive: 0x2a2620, side: THREE.DoubleSide });
  m.sk_old.emissiveMap = m.sk_old.map;
  m.dust = new THREE.MeshBasicMaterial({ map: T(512, 512, dustTex), transparent: true, opacity: 1, depthWrite: false, color: 0xcfc6b4 });
  m.puff = new THREE.MeshBasicMaterial({ map: T(128, 128, puffTex), transparent: true, opacity: 0.6, depthWrite: false, color: 0xe8e0d0, side: THREE.DoubleSide });
  m.smoke = new THREE.MeshBasicMaterial({ map: T(128, 128, puffTex), transparent: true, opacity: 0.8, depthWrite: false, color: 0x8a8494, side: THREE.DoubleSide });
  m.saluteSmoke = new THREE.MeshBasicMaterial({ map: T(128, 128, puffTex), transparent: true, opacity: 0.85, depthWrite: false, color: 0xe8e4ee, side: THREE.DoubleSide });
  m.mote = new THREE.PointsMaterial({ map: T(32, 32, dotTex), color: 0xfff8ea, size: 0.018, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  // harbour
  m.waterD = T(512, 512, waterTex(false), [160, 160]); m.waterN = T(512, 512, waterTex(true), [160, 160]);
  m.water = toon({ map: m.waterD }); if (MACRO) MACRO(m.water, 0.18, 0.01);
  m.granite = vc({ map: T(512, 512, ashlarTex('#c0b4a4', 7)) }); m.fort = vc({ map: T(512, 512, ashlarTex('#a89c8e', 11), [0.16, 0.16]) });
  m.grass = toon({ map: T(256, 256, (g, w, h) => PT.grass(g, w, h, { seed: 61 }), [0.08, 0.08]) });
  m.grassC = toon({ map: T(256, 256, (g, w, h) => PT.grass(g, w, h, { seed: 62 }), [40, 40]) }); if (MACRO) MACRO(m.grassC, 0.2, 0.06);
  m.facadeLit = T(512, 256, facadeTex('#000', true));
  const fac = (base) => { const x = vc({ map: T(512, 256, facadeTex(base, false)), emissiveMap: m.facadeLit, emissive: 0x000000 }); return x; };
  m.brick = fac('#9a5a48'); m.brown = fac('#7a5a4a'); m.greyF = fac('#a8a0a0');
  m.cabin = vc({ map: T(512, 64, cabinTex(false)), emissiveMap: T(512, 64, cabinTex(true)), emissive: 0x000000 });
  m.sail = toon({ color: 0xf2e8d4, side: THREE.DoubleSide, emissive: 0x1a1612 });
  m.beam = add(T(32, 256, beamTex), 0xffe6b0, 0.35); m.beam2 = add(T(32, 256, beamTex), 0xfff4d8, 0.4);
  m.mist = new THREE.MeshBasicMaterial({ map: T(256, 256, mistTex), color: 0x8a9ad8, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  m.mistD = new THREE.MeshBasicMaterial({ map: m.mist.map, color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide, fog: true });
  m.fw = new THREE.PointsMaterial({ map: T(32, 32, dotTex), size: 4, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  m.window = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc870).multiplyScalar(1.8), fog: true });
  // centennial
  m.stripes = vc({ map: T(128, 128, stripesTex), side: THREE.DoubleSide }); m.fan = toon({ map: T(512, 256, fanTex), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, emissive: 0x1a1010 });
  m.banner = toon({ map: T(1024, 256, bannerTex), side: THREE.DoubleSide, emissive: 0x2a2018 }); m.banner.emissiveMap = m.banner.map;
  m.hall = vc({ map: T(512, 256, hallTex) });
  m.lantR = new THREE.MeshBasicMaterial({ map: T(64, 64, lanternTex('#ff9a50')), color: new THREE.Color(1, 1, 1).multiplyScalar(1.7), fog: true });
  m.lantY = new THREE.MeshBasicMaterial({ map: T(64, 64, lanternTex('#ffd070')), color: new THREE.Color(1, 1, 1).multiplyScalar(1.7), fog: true });
  m.lamp = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0c0).multiplyScalar(2.0), fog: true });
  m.ribbon = vc({ emissive: 0x200404 });
  m.gravel = toon({ map: T(256, 256, (g, w, h) => PT.dirt(g, w, h, { base: '#c8b090', seed: 4 }), [12, 12]) });
  return m;
}

// ---------------------------------------------------------------- set: studio (Bartholdi's atelier)
function buildStudio(root) {
  const R = rng(1870), K = new Kit(), X0 = -8, X1 = 8, Z0 = -5, Z1 = 6.5, HC = 10.5;
  mesh(root, plane(X1 - X0, Z1 - Z0 + 2), M.floor, 0, 0, (Z0 + Z1) / 2 + 1, -Math.PI / 2, 0, 0, false);
  // walls: back window wall (glazing x -5..5, y 1..7.6) + side walls; sloped skylight up to the ceiling
  const WX = 5, WY0 = 1.0, WY1 = 7.6;
  K.box(M.wall, X0, -WX, 0, HC, Z0 - 0.3, Z0, 0xd8d0c4, 0.02, 3); K.box(M.wall, WX, X1, 0, HC, Z0 - 0.3, Z0, 0xd8d0c4, 0.02, 3);
  K.box(M.wall, -WX, WX, 0, WY0, Z0 - 0.3, Z0, 0xd0c8bc, 0.02, 3); K.box(M.wall, -WX, WX, WY1, 8.1, Z0 - 0.3, Z0, 0xd0c8bc, 0.02, 3);
  K.box(M.wall, X0 - 0.3, X0, 0, HC, Z0 - 0.3, Z1, 0xcac2b6, 0.02, 3); K.box(M.wall, X1, X1 + 0.3, 0, HC, Z0 - 0.3, Z1, 0xcac2b6, 0.02, 3);
  K.box(M.wood, X0, X1, 0, 0.18, Z0 + 0.0, Z0 + 0.04, 0x6a5040, 0.01); K.box(M.wood, X0, X0 + 0.04, 0, 0.18, Z0, Z1, 0x6a5040, 0.01); K.box(M.wood, X1 - 0.04, X1, 0, 0.18, Z0, Z1, 0x6a5040, 0.01);
  const SKZ = -0.8; // skylight: from the top of the window wall (y 8.1, z Z0) up to the ceiling (y HC, z SKZ)
  K.box(M.wall, X0, X1, HC, HC + 0.3, SKZ, Z1, 0x9a948c, 0.02, 3);
  K.box(M.wall, X0, -WX, 8.1, HC, Z0 - 0.3, SKZ, 0xcac2b6, 0.02, 3); K.box(M.wall, WX, X1, 8.1, HC, Z0 - 0.3, SKZ, 0xcac2b6, 0.02, 3);
  const iron = 0x3a3444;
  for (let i = 0; i <= 10; i++) { const x = -WX + i; K.box(M.metal, x - 0.04, x + 0.04, WY0, WY1, Z0 - 0.12, Z0 - 0.04, iron, 0.01); K.beam(M.metal, [x, 8.1, Z0 - 0.08], [x, HC, SKZ], 0.07, iron); }
  for (let j = 0; j <= 6; j++) { const y = WY0 + j * (WY1 - WY0) / 6; K.box(M.metal, -WX, WX, y - 0.035, y + 0.035, Z0 - 0.12, Z0 - 0.04, iron, 0.01); }
  for (let j = 0; j <= 4; j++) { const t = j / 4, y = 8.1 + (HC - 8.1) * t, z = Z0 + (SKZ - Z0) * t; K.beam(M.metal, [-WX, y, z], [WX, y, z], 0.06, iron); }
  K.box(M.wood, -WX - 0.1, WX + 0.1, WY0 - 0.1, WY0, Z0 - 0.3, Z0 + 0.25, 0xb8aa98, 0.02); // sill
  K.build(root);
  // glass + the grey Paris view beyond
  const gw = mesh(root, plane(2 * WX, WY1 - WY0), M.glass, 0, (WY0 + WY1) / 2, Z0 - 0.08, 0, 0, 0, false); nond(gw);
  { const sl = Math.hypot(HC - 8.1, SKZ - Z0), gs = mesh(root, plane(2 * WX, sl), M.glass, 0, (8.1 + HC) / 2, (Z0 + SKZ) / 2, 0, 0, 0, false); gs.rotation.set(Math.atan2(SKZ - Z0, HC - 8.1), 0, 0); nond(gs); }
  const vw = mesh(root, plane(60, 26), M.paris, 0, 10.3, -24, 0, 0, 0, false); nond(vw);
  const vs = mesh(root, plane(80, 40), M.parisSky, 0, 22, -12, Math.PI / 2 - 0.25, 0, 0, false); vs.rotation.set(Math.PI / 2, 0, 0); vs.position.set(0, 26, -10); nond(vs);
  // light shafts through the window + skylight (sun from behind, falling toward the camera)
  const shafts = [], sd = new THREE.Vector3(0, -Math.sin(0.82), Math.cos(0.82));
  for (let i = 0; i < 5; i++) { const x = -4 + i * 2 + (R() - 0.5), y = 4 + R() * 4.5, L = 11, wd = 1.0 + R() * 0.9; const p = new THREE.Vector3(x, y, Z0 + 0.1).addScaledVector(sd, L / 2);
    const s = mesh(root, plane(wd, L), M.shaft, p.x, p.y, p.z, 0, 0, 0, false); s.quaternion.setFromUnitVectors(UP(), sd.clone().negate()); s.rotateY(0.25 * (R() - 0.5)); nond(s); s.material = M.shaft.clone(); shafts.push(s); }
  // dust motes in the light
  { const n = 500, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = -4 + R() * 8; pos[i * 3 + 1] = 0.5 + R() * 6; pos[i * 3 + 2] = -4.5 + R() * 6; } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); var motes = new THREE.Points(g, M.mote); root.add(motes); motes.userData.base = pos.slice(); }
  // ---- giant plaster hand-with-torch fragment on timber cradles (left back)
  const handG = new THREE.Group(); root.add(handG); handG.position.set(-1.7, 0, -1.3); handG.rotation.y = 2.04;
  { const k = new Kit(), s = 10, pc = 0xf2ece0;
    atM(k, TRS([0, 0.62, 0], [0, 0, -1.1], 1), () => atM(k, TRS([0, 0, 0], [0, 0, 0], s), () => atM(k, new THREE.Matrix4().makeTranslation(-EL[0], -EL[1], -EL[2]), () => torchArm(k, M.plaster, 'liberty', pc, { fingers: true, stub: true, balcony: false }))));
    for (const [x, h] of [[0.15, 0.36], [1.5, 1.04], [2.8, 1.66]]) { k.box(M.wood, x - 0.1, x + 0.1, 0, h, -0.7, -0.5, 0x8a6a48, 0.02); k.box(M.wood, x - 0.1, x + 0.1, 0, h, 0.5, 0.7, 0x8a6a48, 0.02); k.box(M.wood, x - 0.12, x + 0.12, h - 0.14, h, -0.8, 0.8, 0x7a5a40, 0.02); k.beam(M.wood, [x, 0.1, -0.6], [x, h - 0.2, 0.6], 0.06, 0x7a5a40); }
    k.box(M.wood, -0.6, 3.4, 0, 0.12, -0.9, 0.9, 0x6a5038, 0.02); k.build(handG); }
  // ---- scaffold round a giant plaster crowned head (right back)
  const headG = new THREE.Group(); root.add(headG); headG.position.set(2.7, 0, -2.9); headG.rotation.y = -0.35;
  { const k = new Kit(), s = 12, pc = 0xeee8dc;
    k.box(M.wood, -1.2, 1.2, 0, 1.3, -1.2, 1.2, 0x8a6a4a, 0.03); k.box(M.plaster, -1.0, 1.0, 1.3, 1.6, -1.0, 1.0, 0xe0d8cc, 0.04);
    atM(k, TRS([0, 1.6 - 0.735 * s, 0], [0, 0, 0], s), () => ladyHead(k, M.plaster, 'liberty', pc));
    for (const [x, z] of [[-1.7, -1.6], [1.7, -1.6], [-1.7, 1.6], [1.7, 1.6]]) k.beam(M.wood, [x, 0, z], [x, 7.4, z], 0.12, 0x9a7a52, true, 6);
    for (const y of [2.6, 5.0]) { k.box(M.wood, -1.9, 1.9, y, y + 0.06, 1.25, 1.9, 0xa8885a, 0.01); k.box(M.wood, -1.9, 1.9, y, y + 0.06, -1.9, -1.25, 0xa8885a, 0.01); k.box(M.wood, 1.3, 1.9, y, y + 0.06, -1.9, 1.9, 0xa8885a, 0.01);
      for (const z of [-1.6, 1.6]) k.beam(M.wood, [-1.7, y + 1.0, z], [1.7, y + 1.0, z], 0.06, 0x9a7a52, true, 5); }
    for (const z of [-1.6, 1.6]) { k.beam(M.wood, [-1.7, 0.2, z], [1.7, 2.6, z], 0.07, 0x8a6a48, true, 5); k.beam(M.wood, [1.7, 2.7, z], [-1.7, 5.0, z], 0.07, 0x8a6a48, true, 5); }
    for (let i = 0; i < 2; i++) { const x = 2.15 + i * 0.45; k.beam(M.wood, [x, 0, 1.2], [x, 5.4, 1.75], 0.07, 0xa8885a); } for (let j = 1; j < 18; j++) { const t = j / 18; k.beam(M.wood, [2.15, t * 5.4, 1.2 + t * 0.55], [2.6, t * 5.4, 1.2 + t * 0.55], 0.045, 0x9a7a52); }
    k.build(headG); }
  // ---- modelling stands with the two maquettes
  const stand = (k) => { const c = 0x6a5038; for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + 0.3; k.beam(M.wood, [Math.sin(a) * 0.3, 0, Math.cos(a) * 0.38], [0, 0.5, 0], 0.045, c); } k.put(M.wood, cyl(0.045, 0.055, 0.6, 10), 0, 0.62, 0, 0, 0, 0, 1, 1, 1, c); k.put(M.metal, cyl(0.07, 0.07, 0.05, 14), 0, 0.92, 0, 0, 0, 0, 1, 1, 1, 0x3a3440); };
  const mk = (kind) => { const g = new THREE.Group(), top = new THREE.Group(); root.add(g); g.add(top); top.position.y = 0.945; const k = new Kit(); stand(k); k.build(g);
    const k2 = new Kit(), egypt = kind === 'egypt', c = egypt ? 0xc8784e : 0xf4eee2;
    k2.put(M.wood, cyl(0.21, 0.21, 0.05, 28), 0, 0.0, 0, 0, 0, 0, 1, 1, 1, 0x7a5a40);
    if (egypt) { k2.put(M.clay, lumpGeo(3), 0, 0.06, 0, 0, 0.4, 0, 0.21, 0.07, 0.18, 0xa86040); } else k2.box(M.plaster, -0.17, 0.17, 0.025, 0.11, -0.15, 0.15, 0xe8e2d4, 0.01);
    atM(k2, TRS([0, egypt ? 0.09 : 0.11, 0], [0, 0, 0], 0.86), () => lady(k2, egypt ? M.clay : M.plaster, kind, c, { tabCol: 0xece6d8 }));
    k2.build(top); return { g, top }; };
  const egypt = mk('egypt'), libm = mk('liberty');
  // easel with a big sketch beside the models
  { const k = new Kit(), c = 0x7a5a3a; k.beam(M.wood, [-0.45, 0, 0.3], [-0.1, 2.3, 0], 0.05, c); k.beam(M.wood, [0.45, 0, 0.3], [0.1, 2.3, 0], 0.05, c); k.beam(M.wood, [0, 0, -0.55], [0, 2.2, -0.02], 0.05, c); k.box(M.wood, -0.5, 0.5, 0.92, 0.97, 0.12, 0.24, c, 0.01);
    const eg = new THREE.Group(); root.add(eg); eg.position.set(2.2, 0, 0.0); eg.rotation.y = -0.55; k.build(eg); const sk = mesh(eg, plane(0.9, 1.2), M.sk_liberty, 0, 1.58, 0.17, -0.12, 0, 0, false); }
  // pinboards with sketches (back wall left, left wall)
  const pins = [];
  { const k = new Kit(); k.box(M.wood, -7.6, -5.4, 1.4, 4.2, Z0, Z0 + 0.06, 0x8a7258, 0.01); k.box(M.wood, X0, X0 + 0.06, 1.3, 3.6, -3.6, 1.2, 0x8a7258, 0.01); k.build(root);
    const put = (mat, x, y, z, ry, w, rz) => { const p = mesh(root, plane(w, w * 1.33), mat, x, y, z, 0, ry, rz, false); pins.push(p); const pk = mesh(root, sph(0.018, 6, 4), M.paint, x, y + w * 0.6, z + (ry ? 0 : 0.01), 0, 0, 0, false); pk.material = M.brass; };
    put(M.sk_pyramid, -7.0, 3.3, Z0 + 0.08, 0, 0.75, 0.04); put(M.sk_colossi, -6.05, 3.25, Z0 + 0.08, 0, 0.7, -0.05); put(M.sk_egypt, -6.6, 2.15, Z0 + 0.08, 0, 0.8, 0.02);
    put(M.sk_arm, X0 + 0.08, 2.5, -2.8, Math.PI / 2, 0.8, 0.03); put(M.sk_head, X0 + 0.08, 2.6, -1.6, Math.PI / 2, 0.7, -0.04); put(M.sk_liberty, X0 + 0.08, 2.4, -0.4, Math.PI / 2, 0.85, 0.02); put(M.sk_colossi, X0 + 0.08, 2.5, 0.75, Math.PI / 2, 0.7, -0.06); }
  // dusty drawers: plan chest (back right) + a tall cabinet of small drawers (right wall)
  { const k = new Kit(), c = 0x7a5a3e, cd = 0x8a6a4a;
    k.box(M.wood, 5.4, 7.9, 0, 1.15, Z0 + 0.05, Z0 + 1.0, c, 0.02); for (let j = 0; j < 6; j++) { const y = 0.12 + j * 0.17; k.box(M.wood, 5.5, 7.8, y, y + 0.14, Z0 + 1.0, Z0 + 1.03, cd, 0.01); for (const x of [6.0, 7.3]) k.box(M.brass, x - 0.08, x + 0.08, y + 0.05, y + 0.09, Z0 + 1.03, Z0 + 1.06, 0xc8a050, 0.01); }
    k.box(M.paint, 5.6, 7.7, 1.15, 1.17, Z0 + 0.1, Z0 + 0.95, 0xe8e0cc, 0.003);
    for (let i = 0; i < 5; i++) k.put(M.paint, cyl(0.04, 0.04, 0.8, 10), 5.8 + i * 0.36, 1.21, Z0 + 0.55, 0, 0.2 * (R() - 0.5), Math.PI / 2, 1, 1, 1, 0xe8dcc0);
    k.box(M.wood, X1 - 0.65, X1, 0, 2.6, 1.5, 3.5, c, 0.02); for (let j = 0; j < 9; j++) for (let i = 0; i < 6; i++) { const y = 0.12 + j * 0.27, z = 1.58 + i * 0.32; k.box(M.wood, X1 - 0.68, X1 - 0.65, y, y + 0.23, z, z + 0.28, R() < 0.2 ? 0x9a7a58 : cd, 0.005); k.put(M.brass, sph(0.02, 6, 4), X1 - 0.7, y + 0.12, z + 0.14, 0, 0, 0, 1, 1, 1, 0xc8a050); }
    // shelf of small plaster studies above
    k.box(M.wood, X1 - 0.5, X1, 3.2, 3.26, -3.5, 1.2, c, 0.01); for (let i = 0; i < 7; i++) { const z = -3.2 + i * 0.62; k.put(M.plaster, lumpGeo(i), X1 - 0.25, 3.26 + 0.18, z, 0, R() * 3, 0, 0.14, 0.2 + R() * 0.12, 0.14, 0xeee6d8); }
    k.build(root); }
  // worktable: chisels, mallet, calipers, bowl, rolled papers, the dusty sketch
  const sketch = new THREE.Group(); root.add(sketch);
  { const k = new Kit(), c = 0x8a6a4a, tx = -2.3, tz = 1.7, ty = 0.9;
    k.box(M.wood, tx - 1.1, tx + 1.1, ty - 0.07, ty, tz - 0.5, tz + 0.5, 0x9a7a58, 0.02); for (const [x, z] of [[-1, -0.42], [1, -0.42], [-1, 0.42], [1, 0.42]]) k.box(M.wood, tx + x - 0.05, tx + x + 0.05, 0, ty - 0.07, tz + z - 0.05, tz + z + 0.05, c, 0.01); k.box(M.wood, tx - 1.0, tx + 1.0, 0.2, 0.24, tz - 0.4, tz + 0.4, c, 0.01);
    for (let i = 0; i < 6; i++) { const x = tx + 0.35 + i * 0.07, z = tz - 0.3 + (R() - 0.5) * 0.05; k.put(M.wood, cyl(0.012, 0.014, 0.13, 6), x, ty + 0.014, z, Math.PI / 2, 0.1 * (R() - 0.5), 0, 1, 1, 1, 0xa87a48); k.box(M.metal, x - 0.007, x + 0.007, ty, ty + 0.01, z + 0.065, z + 0.15, 0x9a9aa8, 0.002); }
    k.put(M.wood, cyl(0.06, 0.06, 0.16, 10), tx + 0.75, ty + 0.06, tz + 0.15, 0, 0, Math.PI / 2, 1, 1, 1, 0x8a5a3a); k.put(M.wood, cyl(0.014, 0.014, 0.3, 6), tx + 0.75, ty + 0.02, tz + 0.32, Math.PI / 2, 0, 0, 1, 1, 1, 0xa87a48);
    k.put(M.paint, lathe('bowl', [[0.0, 0], [0.1, 0.0], [0.14, 0.06], [0.15, 0.1], [0.14, 0.1], [0.12, 0.05], [0, 0.03]], 18), tx - 0.75, ty, tz - 0.2, 0, 0, 0, 1, 1, 1, 0xe8e2d4);
    k.beam(M.metal, [tx + 0.1, ty + 0.01, tz - 0.35], [tx + 0.35, ty + 0.01, tz - 0.2], 0.008, 0x8a8a98); k.beam(M.metal, [tx + 0.1, ty + 0.01, tz - 0.35], [tx + 0.32, ty + 0.01, tz - 0.42], 0.008, 0x8a8a98);
    for (let i = 0; i < 3; i++) k.put(M.paint, cyl(0.035, 0.035, 0.6, 10), tx - 0.75 + i * 0.05, ty + 0.035 + (i === 2 ? 0.06 : 0), tz + 0.25 + i * 0.06, 0, 0.2 + i * 0.1, Math.PI / 2, 1, 1, 1, 0xe8dcc0);
    k.build(root);
    sketch.position.set(tx - 0.05, ty + 0.002, tz + 0.08); sketch.rotation.y = 0.12;
    mesh(sketch, plane(0.5, 0.66), M.sk_old, 0, 0, 0, -Math.PI / 2, 0, 0, false); }
  const dust = mesh(sketch, plane(0.52, 0.68), M.dust, 0, 0.004, 0, -Math.PI / 2, 0, 0, false); nond(dust);
  const puffs = []; for (let i = 0; i < 16; i++) { const p = mesh(sketch, plane(0.3, 0.3), M.puff.clone(), 0, 0, 0, 0, 0, 0, false); nond(p); p.visible = false; p.userData = { a: R() * TAU, s: 0.6 + R() * 0.8, up: 0.3 + R() * 0.5, r: R() }; puffs.push(p); }
  // pot-belly stove + pipe, coal scuttle (front right)
  const stoveG = new THREE.Group(); root.add(stoveG); stoveG.position.set(5.3, 0, 2.0);
  { const k = new Kit(), c = 0x24202a; k.put(M.metal, lathe('stove', [[0, 0.15], [0.26, 0.15], [0.3, 0.3], [0.34, 0.55], [0.32, 0.8], [0.24, 0.95], [0.2, 1.05], [0, 1.05]], 20), 0, 0, 0, 0, 0, 0, 1, 1, 1, c);
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; k.beam(M.metal, [Math.sin(a) * 0.22, 0.17, Math.cos(a) * 0.22], [Math.sin(a) * 0.3, 0, Math.cos(a) * 0.3], 0.04, c); }
    k.put(M.metal, tor(0.33, 0.02, 6, 24), 0, 0.55, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a3440); k.put(M.metal, cyl(0.1, 0.1, HC - 1.05 - 1.4, 10), 0, 1.05 + (HC - 2.45) / 2, 0, 0, 0, 0, 1, 1, 1, c);
    k.put(M.metal, cyl(0.1, 0.1, 1.4, 10), 0, HC - 0.7, 0, 0, 0, 0, 1, 1, 1, c);
    k.put(M.metal, cyl(0.2, 0.16, 0.3, 10), -0.7, 0.15, 0.3, 0, 0, 0, 1, 1, 1, 0x2a2630); k.put(M.paint, lumpGeo(2), -0.7, 0.3, 0.3, 0, 0, 0, 0.16, 0.07, 0.16, 0x1a1820);
    k.build(stoveG);
    const door = mesh(stoveG, plane(0.2, 0.16), M.ember, -0.1, 0.48, 0.3, 0, -0.35, 0, false); nond(door);
    var stoveGlow = mesh(stoveG, plane(1.6, 1.6), M.glow, -0.15, 0.5, 0.5, 0, 0, 0, false); nond(stoveGlow); }
  // floor clutter: plaster sacks, buckets, armature rods, plaster chunks, a giant plaster foot, crates
  { const k = new Kit();
    for (const [x, z] of [[-6.8, 3.6], [-6.2, 4.1], [-6.9, 4.6], [6.6, 4.4]]) k.put(M.paint, lumpGeo(Math.round(x * 3)), x, 0.3, z, 0, R() * 3, 0, 0.32, 0.4, 0.26, 0xd8ccb4);
    for (const [x, z] of [[-1.0, 2.9], [3.0, 1.4], [-3.6, -0.4]]) { k.put(M.paint, cyl(0.17, 0.14, 0.32, 14, true), x, 0.16, z, 0, 0, 0, 1, 1, 1, 0x8a8a96); k.put(M.paint, cyl(0.155, 0.155, 0.02, 14), x, 0.27, z, 0, 0, 0, 1, 1, 1, 0xf0ece4); }
    for (let i = 0; i < 5; i++) k.beam(M.metal, [-7.7 + i * 0.12, 0, 2.2 + i * 0.05], [-7.85 + i * 0.1, 3.2 + R() * 0.6, 2.0 + i * 0.07], 0.025, 0x4a4450, true, 5);
    for (let i = 0; i < 14; i++) k.put(M.plaster, lumpGeo(i + 5), -4 + R() * 9, 0.05, -3.5 + R() * 7.5, 0, R() * 3, 0, 0.08 + R() * 0.12, 0.05 + R() * 0.06, 0.08 + R() * 0.1, 0xeee8dc);
    k.put(M.plaster, sph(0.5, 14, 10), -1.6, 0.25, -3.7, 0, 0.3, 0, 1.6, 0.5, 0.8, 0xece6d8); for (let i = 0; i < 5; i++) k.put(M.plaster, sph(0.13, 10, 8), -1.6 + 0.62 + (i - 2) * 0.05, 0.2, -3.7 + (i - 2) * 0.17, 0, 0.3, 0, 1.4, 1, 1, 0xece6d8);
    k.box(M.wood, 6.0, 7.2, 0, 0.7, 3.2, 4.0, 0x9a7a52, 0.02); k.box(M.wood, 6.2, 7.0, 0.7, 1.2, 3.3, 3.9, 0x8a6a48, 0.02);
    k.box(M.wood, -7.9, -6.6, 0, 0.06, -4.9, 4.5, 0x6a5040, 0.01);
    k.build(root); }
  return { egypt, libm, dust, puffs, shafts, motes, sketch, stoveGlow, pins, handG };
}

// ---------------------------------------------------------------- set: centennial (1876 fairground, the arm on show)
function buildCentennial(root) {
  const R = rng(1876), K = new Kit();
  mesh(root, plane(900, 900), M.grassC, 0, 0, -200, -Math.PI / 2, 0, 0, false);
  mesh(root, cached('plaza', () => new THREE.CircleGeometry(22, 48)), M.gravel, 0, 0.02, -6, -Math.PI / 2, 0, 0, false);
  // the display base: plank-clad, bunting skirt, banner on the front
  const BX = 0, BZ = -6, BH = 2.6, BW = 4.6;
  K.box(M.wood, BX - BW / 2, BX + BW / 2, 0, BH, BZ - BW / 2, BZ + BW / 2, 0x9a7a58, 0.03, 1.5); K.box(M.wood, BX - BW / 2 - 0.15, BX + BW / 2 + 0.15, BH, BH + 0.18, BZ - BW / 2 - 0.15, BZ + BW / 2 + 0.15, 0x7a5a40, 0.02);
  K.box(M.wood, BX - BW / 2 - 0.25, BX + BW / 2 + 0.25, 0, 0.3, BZ - BW / 2 - 0.25, BZ + BW / 2 + 0.25, 0x7a6048, 0.02);
  // steps + railing up to a small door in the base (visitors climbed inside to the balcony)
  K.box(M.paint, BX + BW / 2 + 0.01, BX + BW / 2 + 0.05, 0.3, 2.0, BZ - 1.4, BZ - 0.5, 0x3a2a30, 0.01); // side door (visitors climbed inside to the balcony)
  // the copper arm + torch (scale 30, elbow at the base top)
  const s = 30, armG = new THREE.Group(); root.add(armG);
  let fl; { const k = new Kit(); atM(k, TRS([BX, BH + 0.1, BZ], [0, 0, 0], s), () => atM(k, new THREE.Matrix4().makeTranslation(-EL[0], -EL[1], -EL[2]), () => { fl = torchArm(k, M.copperC, 'liberty', 0xffffff, { fingers: true, stub: true, balcony: true }); })); k.build(armG); }
  const flameW = [BX + (fl.flame[0] - EL[0]) * s, BH + 0.1 + (fl.flame[1] - EL[1]) * s, BZ + (fl.flame[2] - EL[2]) * s];
  // bunting fans on the base faces, swags along the top edge
  for (const [x, z, ry, w] of [[BX, BZ + BW / 2 + 0.06, 0, 2.0], [BX - BW / 2 - 0.06, BZ + 0.6, -Math.PI / 2, 2.6], [BX + BW / 2 + 0.06, BZ + 0.6, Math.PI / 2, 2.6]]) mesh(root, plane(w, w / 2), M.fan, x, BH - w / 4 - 0.05, z, 0, ry, 0, false);
  const banner = mesh(root, plane(4.2, 1.05), M.banner, BX, 1.0, BZ + BW / 2 + 0.12, 0, 0, 0, false);
  const swag = (a, b, sag, n, k = K) => { const P = sagPts(a, b, sag, n); for (let i = 0; i < n; i++) { const p = P[i], q = P[i + 1], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2 - 0.2, (p[2] + q[2]) / 2], d = Math.hypot(q[0] - p[0], q[2] - p[2]); k.put(M.stripes, plane(+d.toFixed(3), 0.5), m[0], m[1], m[2], 0, Math.atan2(-(q[2] - p[2]), q[0] - p[0]), 0, 1, 1, 1, 0xffffff); } };
  for (const [a, b] of [[[-2.3, 2.6, -3.62], [2.3, 2.6, -3.62]], [[-2.38, 2.6, -8.3], [-2.38, 2.6, -3.7]], [[2.38, 2.6, -3.7], [2.38, 2.6, -8.3]]]) { const P = sagPts(a, b, 0.55, 2); swag(P[0], P[1], 0.4, 5); swag(P[1], P[2], 0.4, 5); }
  // poles with pennant lines radiating from the balcony height down to the plaza poles; lantern strings across the plaza
  const poles = [[-11, -1], [11, -1], [-13, -12], [13, -12], [-6, 8], [6, 8], [0, -19]];
  for (const [x, z] of poles) { K.put(M.paint, cyl(0.09, 0.12, 9, 8), x, 4.5, z, 0, 0, 0, 1, 1, 1, 0xf2ece0); K.put(M.brass, sph(0.2, 8, 6), x, 9.1, z, 0, 0, 0, 1, 1, 1, 0xd8b050); K.put(M.paint, prismGeo(0.7, 2.4, 0.03), x, 8.6, z, 0, 0, -Math.PI / 2, 1, 1, 1, 0xc8302e); }
  const pc = [0xc8302e, 0xf4efe4, 0x2a4a8a];
  const pennants = (a, b, sag, n) => { const P = sagPts(a, b, sag, n); for (let i = 0; i < n; i++) { const p = P[i], q = P[i + 1]; K.beam(M.paint, p, q, 0.015, 0x3a3440); const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2]; K.put(M.paint, prismGeo(0.4, 0.55, 0.01), m[0], m[1] - 0.02, m[2], 0, Math.atan2(-(q[2] - p[2]), q[0] - p[0]), Math.PI, 1, 1, 1, pc[i % 3]); } };
  for (const [x, z] of poles) pennants([x, 8.6, z], [flameW[0], flameW[1] - 3.5, flameW[2]], 1.4, 18);
  const lanterns = [];
  const lanternLine = (a, b, sag, n) => { const P = sagPts(a, b, sag, n); for (let i = 0; i < n; i++) K.beam(M.paint, P[i], P[i + 1], 0.012, 0x3a3440); for (let i = 1; i < n; i += 2) { const p = P[i]; lanterns.push([p[0], p[1] - 0.35, p[2], (i / 2) % 2]); } };
  lanternLine([-11, 6.5, -1], [-6, 6.5, 8], 0.9, 10); lanternLine([11, 6.5, -1], [6, 6.5, 8], 0.9, 10); lanternLine([-6, 6.5, 8], [6, 6.5, 8], 1.1, 12); lanternLine([-11, 6.5, -1], [-13, 6.5, -12], 0.9, 10); lanternLine([11, 6.5, -1], [13, 6.5, -12], 0.9, 10); lanternLine([-13, 6.5, -12], [0, 6.5, -19], 1.0, 12); lanternLine([13, 6.5, -12], [0, 6.5, -19], 1.0, 12);
  for (const [x, y, z, t] of lanterns) { mesh(root, sph(0.24, 12, 8), t ? M.lantY : M.lantR, x, y, z, 0, 0, 0, false).scale.set(1, 1.15, 1); K.put(M.metal, cyl(0.12, 0.12, 0.06, 8), x, y + 0.29, z, 0, 0, 0, 1, 1, 1, 0x2a2430); }
  const glows = []; for (const [x, y, z] of lanterns) { const gl = mesh(root, plane(1.6, 1.6), M.glow, x, y, z, 0, 0, 0, false); nond(gl); glows.push(gl); }
  // gas lamps around the plaza
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.2, x = Math.sin(a) * 17, z = -6 + Math.cos(a) * 17; K.put(M.metal, cyl(0.07, 0.11, 3.4, 8), x, 1.7, z, 0, 0, 0, 1, 1, 1, 0x2a3a34); K.put(M.metal, cone(0.32, 0.3, 6), x, 3.95, z, 0, 0, 0, 1, 1, 1, 0x2a3a34); mesh(root, sph(0.22, 10, 8), M.lamp, x, 3.65, z, 0, 0, 0, false); const gl = mesh(root, plane(1.8, 1.8), M.glowW, x, 3.65, z, 0, 0, 0, false); nond(gl); glows.push(gl); }
  // gift ribbon + bow (optional accent)
  const gift = new THREE.Group(); root.add(gift);
  { const k = new Kit(), c = 0xc8202a; k.box(M.ribbon, BX - 0.25, BX + 0.25, 0, BH + 0.2, BZ + BW / 2 + 0.02, BZ + BW / 2 + 0.1, c, 0.01); k.box(M.ribbon, BX - BW / 2 - 0.09, BX - BW / 2 - 0.01, 0, BH + 0.2, BZ - 0.25, BZ + 0.25, c, 0.01); k.box(M.ribbon, BX + BW / 2 + 0.01, BX + BW / 2 + 0.09, 0, BH + 0.2, BZ - 0.25, BZ + 0.25, c, 0.01);
    const bx = BX + 1.3, by = BH + 0.45, bz = BZ + BW / 2 - 0.1; for (const sx of [-1, 1]) { k.put(M.ribbon, tor(0.34, 0.1, 8, 20), bx + sx * 0.34, by + 0.05, bz, 0, 0, sx * 0.35, 1, 0.7, 0.5, c); k.put(M.ribbon, cached('tail', () => new THREE.BoxGeometry(0.22, 0.75, 0.04)), bx + sx * 0.2, by - 0.42, bz + 0.05, 0, 0, sx * 0.35, 1, 1, 1, 0xb01822); } k.put(M.ribbon, sph(0.14, 10, 8), bx, by, bz + 0.03, 0, 0, 0, 1, 1, 0.8, 0xd02830); k.build(gift); }
  // exhibition hall behind (long, corner towers, arched windows), pavilions, trees
  { const hz = -95; K.box(M.hall, -120, 120, 0, 16, hz - 20, hz, 0xffffff, 0.2, [8, 16]); K.box(M.paint, -121, 121, 16, 17.5, hz - 21, hz + 1, 0x7a6a7a, 0.2);
    for (const x of [-120, -40, 40, 120]) { K.box(M.hall, x - 7, x + 7, 0, 28, hz - 7, hz + 4, 0xfff4e0, 0.2, [7, 14]); K.put(M.paint, cyl(0.1, 7.5, 9, 4), x, 32.5, hz - 1.5, 0, Math.PI / 4, 0, 1, 1, 1, 0x5a5a7a); K.put(M.paint, cyl(0.1, 0.1, 6, 6), x, 39, hz - 1.5, 0, 0, 0, 1, 1, 1, 0x3a3440); K.put(M.paint, prismGeo(1.4, 5, 0.05), x, 41, hz - 1.5, 0, 0, -Math.PI / 2, 1, 1, 1, 0xc8302e); }
    K.box(M.hall, -16, 16, 0, 24, hz - 10, hz + 6, 0xfff8ea, 0.2, [8, 12]); K.put(M.paint, prismGeo(34, 8, 18), 0, 24, hz - 2, 0, 0, 0, 1, 1, 1, 0x6a6a8a);
    for (const [x, z, c] of [[-38, -42, 0xe8c8a0], [40, -48, 0xc8d0e0], [-58, -30, 0xd8b0a0]]) { K.box(M.hall, x - 6, x + 6, 0, 7, z - 5, z + 5, c, 0.1, [6, 7]); K.put(M.paint, prismGeo(13, 5, 11), x, 7, z, 0, Math.PI / 2, 0, 1, 1, 1, 0x7a4a5a); K.put(M.paint, cyl(0.05, 1.2, 5, 4), x, 10.5, z, 0, Math.PI / 4, 0, 1, 1, 1, 0x5a4a6a); } }
  const tree = (x, z, s) => { K.put(M.paint, cyl(0.2 * s, 0.3 * s, 4 * s, 7), x, 2 * s, z, 0, 0, 0, 1, 1, 1, 0x5a4440); for (let i = 0; i < 7; i++) K.put(M.paint, lumpGeo(i), x + (R() - 0.5) * 3 * s, (4.5 + R() * 3) * s, z + (R() - 0.5) * 3 * s, 0, R() * 3, 0, 2 * s, 1.8 * s, 2 * s, [0x5a7a3a, 0x6a8a3a, 0x8a9a3a, 0xa88a3a][i % 4]); };
  for (let i = 0; i < 26; i++) { const a = R() * TAU, r = 26 + R() * 50; if (Math.cos(a) > 0.2 && Math.abs(Math.sin(a) * r) < 30) continue; tree(Math.sin(a) * r, -10 + Math.cos(a) * r * 0.8 - 10, 0.9 + R() * 0.6); }
  // benches + flower beds
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + 0.5, x = Math.sin(a) * 13, z = -6 + Math.cos(a) * 13; K.at(x, 0, z, a + Math.PI, () => { K.box(M.wood, -0.9, 0.9, 0.42, 0.48, -0.22, 0.22, 0x7a5a3a, 0.01); K.box(M.wood, -0.9, 0.9, 0.5, 0.85, -0.24, -0.2, 0x7a5a3a, 0.01); for (const sx of [-0.8, 0.8]) K.box(M.metal, sx - 0.03, sx + 0.03, 0, 0.45, -0.2, 0.2, 0x2a2a30, 0.005); }); }
  for (const [x, z] of [[-6, -1], [6, -1]]) { K.put(M.paint, cyl(1.4, 1.5, 0.35, 18), x, 0.17, z, 0, 0, 0, 1, 1, 1, 0x8a7a6a); for (let i = 0; i < 16; i++) { const a = R() * TAU, r = R() * 1.2; K.put(M.paint, sph(0.15, 6, 5), x + Math.sin(a) * r, 0.45, z + Math.cos(a) * r, 0, 0, 0, 1, 1, 1, [0xd83040, 0xf0e0e0, 0x4060c0, 0xf0b040][i % 4]); } }
  K.build(root, 40);
  const torchGlow = mesh(root, plane(5, 5), M.glow, ...flameW, 0, 0, 0, false); nond(torchGlow); torchGlow.visible = false;
  return { gift, glows, flameW, torchGlow, banner, armG };
}

// ---------------------------------------------------------------- set: harbor (New York Harbor, Oct 1886)
function starShape(n, ro, ri) { const s = new THREE.Shape(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU, r = i % 2 ? ri : ro; const x = Math.sin(a) * r, y = Math.cos(a) * r; i ? s.lineTo(x, y) : s.moveTo(x, y); } s.closePath(); return s; }
function blobShape(rx, rz, seed, n = 40) { const R = rng(seed), s = new THREE.Shape(); for (let i = 0; i < n; i++) { const a = i / n * TAU, k = 0.88 + 0.2 * R(); const x = Math.sin(a) * rx * k, y = Math.cos(a) * rz * k; i ? s.lineTo(x, y) : s.moveTo(x, y); } s.closePath(); return s; }
const extrudeUp = (shape, h, key) => cached('ex' + key, () => { const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 4 }); g.rotateX(-Math.PI / 2); return g; });
// boats (local: bow toward +x, waterline y=0)
function steamer(k, c = 0xf2ece0) { const hull = 0x2a2a3a;
  k.box(M.paint, -22, 22, -1.2, 1.4, -4, 4, hull, 0.8); k.put(M.paint, prismGeo(8, 6, 2.6), 22, 0.1, 0, -Math.PI / 2, -Math.PI / 2, 0, 1, 1, 1, hull);
  k.box(M.paint, -21, 21, 1.4, 1.8, -4.6, 4.6, 0x7a5a4a, 0.1);
  k.box(M.cabin, -18, 16, 1.8, 4.6, -3.6, 3.6, 0xffffff, 0.1, [34, 2.8]); k.box(M.paint, -19, 17, 4.6, 4.9, -4.2, 4.2, c, 0.1); k.box(M.cabin, -14, 10, 4.9, 7.3, -3, 3, 0xffffff, 0.1, [24, 2.4]); k.box(M.paint, -15, 11, 7.3, 7.6, -3.5, 3.5, c, 0.1); k.box(M.paint, 8, 12, 7.6, 9.4, -2, 2, c, 0.1);
  for (const sz of [-1, 1]) { k.put(M.paint, cyl(5, 5, 1.6, 20), 0, 2.6, sz * 5, Math.PI / 2, 0, 0, 1, 1, 1, 0x6a3a3a); k.put(M.paint, tor(4.6, 0.25, 6, 24, Math.PI), 0, 2.6, sz * 5.85, 0, 0, 0, 1, 1, 1, 0xd8b050); for (let i = 0; i < 7; i++) { const a = (i + 0.5) / 7 * Math.PI; k.beam(M.paint, [0, 2.6, sz * 5.85], [Math.cos(a) * 4.5, 2.6 + Math.sin(a) * 4.5, sz * 5.85], 0.22, 0xd8b050); } }
  for (const x of [-4, 3]) { k.put(M.paint, cyl(1.0, 1.1, 12, 12), x, 13, 0, 0, 0, 0, 1, 1, 1, 0x1a1820); k.put(M.paint, cyl(1.12, 1.12, 1.2, 12), x, 17.4, 0, 0, 0, 0, 1, 1, 1, 0xc8302e); }
  k.beam(M.paint, [-6, 7.6, 0], [0, 13.5, 0], 0.35, 0x3a3440); k.beam(M.paint, [6, 7.6, 0], [0, 13.5, 0], 0.35, 0x3a3440); k.beam(M.paint, [-5, 13.6, 0], [5, 13.4, 0], 0.4, 0x2a2430);
  k.put(M.paint, cyl(0.2, 0.25, 14, 6), 16, 11, 0, 0, 0, 0.1, 1, 1, 1, 0x7a5a40); k.put(M.paint, cyl(0.2, 0.25, 12, 6), -17, 10, 0, 0, 0, -0.08, 1, 1, 1, 0x7a5a40);
  for (const [x, y] of [[16.6, 17], [-17.4, 15.5]]) k.put(M.paint, prismGeo(1.0, 4.0, 0.05), x, y, 0, 0, 0, -Math.PI / 2 - 0.1, 1, 1, 1, 0xc8302e); }
function tug(k) { k.box(M.paint, -8, 8, -1, 1.6, -2.8, 2.8, 0x5a2a28, 0.8); k.put(M.paint, prismGeo(5.6, 3, 2.6), 8, 0.3, 0, -Math.PI / 2, -Math.PI / 2, 0, 1, 1, 1, 0x5a2a28); k.box(M.cabin, -4, 3, 1.6, 4.0, -2, 2, 0xffffff, 0.1, [7, 2.4]); k.box(M.paint, -1, 3, 4, 5.8, -1.6, 1.6, 0xf2ece0, 0.1); k.box(M.paint, -5, 4, 4.0, 4.2, -2.3, 2.3, 0x3a3440, 0.05);
  k.put(M.paint, cyl(0.7, 0.8, 6, 10), -2.2, 7, 0, 0, 0, 0, 1, 1, 1, 0x1a1820); k.put(M.paint, cyl(0.82, 0.82, 0.8, 10), -2.2, 9.4, 0, 0, 0, 0, 1, 1, 1, 0xd8b040); }
function schooner(k, masts = 2) { const hc = masts > 2 ? 0x2a3a4a : 0xf2ece0; k.box(M.paint, -11, 11, -0.8, 1.4, -2.4, 2.4, hc, 0.7); k.put(M.paint, prismGeo(4.8, 4, 2.2), 11, 0.3, 0, -Math.PI / 2, -Math.PI / 2, 0, 1, 1, 1, hc); k.box(M.wood, -10, 10, 1.4, 1.6, -2.2, 2.2, 0x9a7a58, 0.05);
  k.beam(M.paint, [14, 1.6, 0], [21, 4.5, 0], 0.18, 0x7a5a40);
  for (let i = 0; i < masts; i++) { const x = masts > 1 ? 6 - i * (14 / (masts - 1)) : 2, h = 20 - i * 1.5; k.put(M.paint, cyl(0.16, 0.25, h, 6), x, 1.4 + h / 2, 0, 0, 0, 0, 1, 1, 1, 0x7a5a40);
    k.put(M.sail, cached('gaff' + h, () => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(-9, 0); s.lineTo(-7.5, h * 0.72); s.lineTo(0, h * 0.85); s.closePath(); return new THREE.ShapeGeometry(s); }), x - 0.3, 3, 0.05, 0, 0.12, 0, 1, 1, 1, 0xf2ead8); }
  k.put(M.sail, cached('jib' + masts, () => { const s = new THREE.Shape(), mx = masts > 1 ? 6 : 2; s.moveTo(20, 4.4); s.lineTo(mx + 1.5, 2.6); s.lineTo(mx + 0.3, 18); s.closePath(); return new THREE.ShapeGeometry(s); }), 0, 0, 0.3, 0, 0, 0, 1, 1, 1, 0xf6eee0); }
function warship(k) { const c = 0x2a2a34; k.box(M.paint, -30, 30, -2, 4, -6, 6, c, 1); k.put(M.paint, prismGeo(12, 8, 6), 30, 1, 0, -Math.PI / 2, -Math.PI / 2, 0, 1, 1, 1, c); k.box(M.paint, -30, 30, 2.4, 2.9, -6.1, 6.1, 0xe8e0d0, 0.05);
  for (let i = 0; i < 9; i++) k.box(M.paint, -22 + i * 5.5 - 0.6, -22 + i * 5.5 + 0.6, 0.8, 1.8, 6.0, 6.2, 0x101018, 0.05);
  k.box(M.paint, -8, 6, 4, 6.5, -4, 4, 0xe8e0d0, 0.1); k.put(M.paint, cyl(1.3, 1.4, 9, 12), -1, 10.5, 0, 0, 0, 0, 1, 1, 1, 0xd8c8a0);
  for (const x of [20, 0 - 12, -24]) { k.put(M.paint, cyl(0.3, 0.45, 30, 6), x, 19, 0, 0, 0, 0, 1, 1, 1, 0x5a4a3a); for (const y of [12, 20, 27]) k.beam(M.paint, [x, y, -5 + y * 0.1], [x, y, 5 - y * 0.1], 0.25, 0x5a4a3a); } }
function buildHarborSet(root) {
  const R = rng(1886), K = new Kit(), Kd = new Kit();
  const water = mesh(root, plane(6000, 6000), M.water, 0, 0, -800, -Math.PI / 2, 0, 0, false); water.receiveShadow = true;
  // ---- Bedloe's Island: low grassy island, rock shore, seawall, Fort Wood star, foundation, pedestal
  mesh(root, extrudeUp(blobShape(175, 135, 3), 3.2, 'isl'), M.grass, 0, -0.5, 10, 0, 0, 0, false).receiveShadow = true;
  for (let i = 0; i < 90; i++) { const a = i / 90 * TAU, r = 1.0 + 0.05 * R(); K.put(M.paint, lumpGeo(i % 7), Math.sin(a) * 172 * r, 0.6, 10 + Math.cos(a) * 132 * r, 0, R() * 3, 0, 4 + R() * 4, 2 + R() * 1.5, 4 + R() * 4, [0x7a7488, 0x8a8298, 0x6a6478][i % 3]); }
  mesh(root, extrudeUp(starShape(11, 64, 46), 9, 'fort'), M.fort, 0, 2.6, 0, 0, 0, 0).receiveShadow = true;
  mesh(root, extrudeUp(starShape(11, 61, 43.5), 0.5, 'fortTop'), M.grass, 0, 11.4, 0, 0, 0, 0, false);
  K.put(M.paint, extrudeUp(starShape(11, 64.6, 46.4), 0.8, 'fortCap'), 0, 11.1, 0, 0, 0, 0, 1, 1, 1, 0xc8bcaa);
  // foundation (truncated pyramid) + steps
  K.put(M.granite, cyl(15.5, 22, 13, 4), 0, 11.9 + 6.5, 0, 0, Math.PI / 4, 0, 1, 1, 1, 0xd8d0c4);
  K.box(M.granite, -11.5, 11.5, 25, 26.2, -11.5, 11.5, 0xc8beb0, 0.2, 4);
  // pedestal (granite: base, die with portico, loggia band with columns, cornice, parapet with discs)
  const Pg = 0xc4b8a8, Pd = 0xb0a494;
  K.box(M.granite, -10, 10, 26.2, 30, -10, 10, Pg, 0.2, 4); K.box(M.granite, -8.6, 8.6, 30, 40, -8.6, 8.6, Pg, 0.15, 4);
  for (const [sx, sz, ry] of [[0, 1, 0], [0, -1, Math.PI], [1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2]]) K.at(sx * 8.6, 0, sz * 8.6, ry, () => {
    K.box(M.granite, -4.2, 4.2, 30, 40.5, -0.2, 0.9, Pd, 0.12, 4); K.box(M.paint, -1.6, 1.6, 31.5, 37.5, 0.85, 0.95, 0x3a3450, 0.05); K.put(M.paint, cyl(1.6, 1.6, 0.1, 16, false), 0, 37.5, 0.9, Math.PI / 2, 0, 0, 1, 1, 0.5, 0x3a3450);
    K.box(M.granite, -7.8, 7.8, 40.5, 46.5, -0.6, 0.1, Pg, 0.1, 4); K.box(M.paint, -6.6, 6.6, 41.5, 45.5, 0.0, 0.15, 0x46405a, 0.02);
    for (let i = 0; i < 4; i++) { const x = -5.4 + i * 3.6; K.put(M.granite, cyl(0.42, 0.46, 4, 10), x, 43.5, 0.35, 0, 0, 0, 1, 1, 1, 0xd8ccbc); K.box(M.granite, x - 0.6, x + 0.6, 41.3, 41.6, -0.1, 0.9, 0xd8ccbc, 0.05); K.box(M.granite, x - 0.6, x + 0.6, 45.4, 45.7, -0.1, 0.9, 0xd8ccbc, 0.05); }
    K.box(M.granite, -8.6, 8.6, 46.5, 48.2, -0.4, 1.0, 0xd0c4b4, 0.15, 4);
    for (let i = 0; i < 5; i++) K.put(M.granite, cyl(0.85, 0.85, 0.3, 14), -5.6 + i * 2.8, 50.2, 0.05, Math.PI / 2, 0, 0, 1, 1, 1, 0xb8ac9c); });
  K.box(M.granite, -8.0, 8.0, 40.5, 46.5, -8.0, 8.0, Pg, 0.1, 4); K.box(M.granite, -7.8, 7.8, 46.5, 48.2, -7.8, 7.8, 0xd0c4b4, 0.1, 4); K.box(M.granite, -7.2, 7.2, 48.2, 52.4, -7.2, 7.2, Pg, 0.1, 4); K.box(M.granite, -7.6, 7.6, 52.4, 53.2, -7.6, 7.6, 0xd8ccbc, 0.1, 4);
  // the statue: copper, scale 34, feet on the pedestal top
  const S = 34, SY = 53.2, statueG = new THREE.Group(); root.add(statueG); statueG.rotation.y = -0.25;
  let tinfo; { const k = new Kit(); k.box(M.copper, -0.11 * S, 0.11 * S, SY, SY + 1.4, -0.09 * S, 0.09 * S, 0xffffff, 0.3, 4); atM(k, TRS([0, SY + 1.4, 0], [0, 0, 0], S), () => { tinfo = lady(k, M.copper, 'liberty', 0xffffff, { balcony: true, flame: false, fingers: true }); }); k.build(statueG); }
  const fb = new THREE.Vector3(tinfo.flame[0] * S, SY + 1.4 + tinfo.flame[1] * S, tinfo.flame[2] * S);
  const torchG = new THREE.Group(); statueG.add(torchG); torchG.position.copy(fb);
  const flameD = mesh(torchG, flameGeo('liberty'), M.copper, 0, 0, 0, 0, 0, 0); flameD.scale.setScalar(S);
  const flameN = mesh(torchG, flameGeo('liberty'), M.flameN, 0, 0, 0, 0, 0, 0, false); flameN.scale.setScalar(S); flameN.visible = false;
  const kLant = mesh(torchG, sph(0.25, 8, 6), M.lamp, 0.4, 0.6, tinfo.balcR * S - 0.3, 0, 0, 0, false); kLant.visible = false;
  // ---- island dressing: buildings, trees, dock, flagpole
  for (const [x, z, w, d, ry] of [[-120, 40, 30, 12, 0.3], [110, 55, 26, 12, -0.4], [-95, -70, 22, 10, -0.2], [90, -80, 20, 10, 0.5]]) K.at(x, 2.6, z, ry, () => { K.box(M.brick, -w / 2, w / 2, 0, 8, -d / 2, d / 2, 0xffffff, 0.1, [8, 4]); K.put(M.paint, prismGeo(d + 1, 4, w + 1), 0, 8, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0x5a5468); K.box(M.paint, -w / 2, -w / 2 + 2, 8, 13, -1, 1, 0x7a4a3a, 0.05); });
  for (let i = 0; i < 24; i++) { const a = R() * TAU, r = 80 + R() * 60, x = Math.sin(a) * r * 1.1, z = 10 + Math.cos(a) * r * 0.8; if (Math.hypot(x, z - 10) < 75) continue; K.put(M.paint, cyl(0.4, 0.6, 6, 6), x, 5.6, z, 0, 0, 0, 1, 1, 1, 0x5a4440); for (let j = 0; j < 4; j++) K.put(M.paint, lumpGeo(j + i), x + (R() - 0.5) * 5, 10 + R() * 4, z + (R() - 0.5) * 5, 0, R() * 3, 0, 4, 3.5, 4, [0x8a7a3a, 0xa8823a, 0x6a7a3a, 0xb8683a][j % 4]); }
  K.box(M.wood, -6, 6, 1.6, 2.4, 140, 190, 0x8a7258, 0.05); for (let i = 0; i < 7; i++) for (const sx of [-5.5, 5.5]) K.put(M.wood, cyl(0.35, 0.35, 4, 6), sx, 0.4, 142 + i * 8, 0, 0, 0, 1, 1, 1, 0x5a4a3a);
  K.put(M.paint, cyl(0.25, 0.4, 30, 6), 30, 17, 95, 0, 0, 0, 1, 1, 1, 0xf2ece0); for (let i = 0; i < 3; i++) K.put(M.paint, prismGeo(1.2, 9, 0.1), 30, 31 - i * 1.25, 95, 0, 0, -Math.PI / 2 - 0.05 * i, 1, 1, 1, [0xc8302e, 0xf4efe4, 0x2a4a8a][i]);
  // ---- boats
  const boats = []; const B = (fn, x, z, ry, s = 1, stack = null) => { Kd.at(x, 0, z, ry, () => fn(Kd), s); boats.push({ x, z, ry, s, stack }); };
  B(steamer, -20, 235, 0.12, 1, [[-4, 19], [3, 19]]); B(steamer, -330, 220, 0.6, 1, [[-4, 19], [3, 19]]); B(steamer, 520, -260, 2.2, 1, [[-4, 19], [3, 19]]);
  B(tug, 62, 300, 0.9, 1, [[-2.2, 10]]); B(tug, -160, 470, -0.3, 1, [[-2.2, 10]]); B(tug, -560, -120, 1.2, 1, [[-2.2, 10]]);
  B((k) => schooner(k, 2), 330, 520, -0.2); B((k) => schooner(k, 2), -420, 420, 0.3); B((k) => schooner(k, 1), 112, 175, 0.5, 0.8); B((k) => schooner(k, 1), -40, 560, 2.6, 0.7); B((k) => schooner(k, 3), -620, 120, 1.4); B((k) => schooner(k, 1), 640, 240, -2.2, 0.8);
  const WS = [-200, 180, 0.3]; B(warship, WS[0], WS[1], WS[2]);
  // ---- Manhattan 1886: low brick/brownstone blocks, church spires, piers with masts; Brooklyn Bridge; far shores
  const MZ = -1100;
  for (let i = 0; i < 160; i++) { const x = -900 + i * 9 + (R() - 0.5) * 4, zz = MZ - R() * 120 - Math.abs(x + 200) * 0.12, w = 8 + R() * 14, d = 10 + R() * 14, h = 12 + R() * 16 + (Math.abs(x + 250) < 200 ? 6 : 0), mt = [M.brick, M.brown, M.greyF][(R() * 3) | 0];
    Kd.box(mt, x - w / 2, x + w / 2, 0, h, zz - d, zz, [0xffffff, 0xf0e0d8, 0xe0e0f0][i % 3], 0.2, [8, 4]); if (R() < 0.5) Kd.box(M.paint, x - 1, x + 1, h, h + 3, zz - 3, zz - 1, 0x6a4a40, 0.1); }
  for (let i = 0; i < 70; i++) { const x = -1000 + R() * 1500, zz = MZ - 130 - R() * 300, w = 10 + R() * 18, h = 10 + R() * 14; Kd.box([M.brick, M.brown, M.greyF][i % 3], x - w / 2, x + w / 2, 0, h, zz - 14, zz, 0xffffff, 0.2, [8, 4]); }
  for (const [x, h] of [[-330, 86], [-120, 70], [-560, 60], [80, 64], [-760, 55], [250, 52]]) { const zz = MZ - 40; Kd.box(M.greyF, x - 5, x + 5, 0, h * 0.5, zz - 10, zz, 0xd8d0d0, 0.2, [8, 4]); Kd.put(M.paint, cyl(0.2, 5.5, h * 0.5, 8), x, h * 0.75, zz - 5, 0, Math.PI / 8, 0, 1, 1, 1, 0x5a5a72); Kd.box(M.brown, x - 9, x + 9, 0, h * 0.28, zz - 40, zz - 10, 0xffffff, 0.2, [8, 4]); }
  for (let i = 0; i < 18; i++) { const x = -880 + i * 62; Kd.box(M.wood, x - 4, x + 4, 0, 2, MZ, MZ + 60, 0x7a6450, 0.05); for (let j = 0; j < 4; j++) { const mx = x + (j % 2 ? 7 : -7), mz = MZ + 12 + j * 12, mh = 18 + R() * 10; Kd.put(M.paint, cyl(0.2, 0.3, mh, 4), mx, mh / 2, mz, 0, 0, 0, 1, 1, 1, 0x4a3a34); Kd.box(M.paint, mx - 5, mx + 5, 0, 2, mz - 2, mz + 2, 0x2a2430, 0.2); } }
  // Brooklyn Bridge (1883): two masonry towers with pointed double arches, cables, deck
  { const bx = 60, bz = -1180, ry = -0.5, L = 420; Kd.at(bx, 0, bz, ry, () => {
    for (const x of [-L / 2, L / 2]) { Kd.box(M.granite, x - 6, x + 6, 0, 84, -14, 14, 0xc8b8a0, 0.5, 6); Kd.box(M.granite, x - 7, x + 7, 80, 86, -15, 15, 0xd8c8b0, 0.3, 6); for (const s of [-1, 1]) { Kd.box(M.paint, x - 6.3, x + 6.3, 34, 62, s * 6 - 3, s * 6 + 3, 0x3a3448, 0.1); Kd.put(M.paint, cone(4.2, 6, 4), x, 64, s * 6, 0, Math.PI / 4, 0, 1.6, 1, 0.75, 0x3a3448); } }
    Kd.box(M.paint, -L / 2 - 300, L / 2 + 200, 36, 39, -9, 9, 0x5a5060, 0.2);
    for (const side of [-6, 6]) { const P = sagPts([-L / 2, 84, side], [L / 2, 84, side], 48, 16); for (let i = 0; i < 16; i++) Kd.beam(M.paint, P[i], P[i + 1], 1.0, 0x3a3448); const Q = sagPts([L / 2, 84, side], [L / 2 + 260, 40, side], 10, 6); for (let i = 0; i < 6; i++) Kd.beam(M.paint, Q[i], Q[i + 1], 1.0, 0x3a3448); const Q2 = sagPts([-L / 2, 84, side], [-L / 2 - 300, 40, side], 10, 6); for (let i = 0; i < 6; i++) Kd.beam(M.paint, Q2[i], Q2[i + 1], 1.0, 0x3a3448); } }); }
  // Brooklyn + New Jersey + Staten shores: low, hazy
  for (let i = 0; i < 60; i++) { const t = i / 60, x = 650 + t * 500, zz = -1100 - t * 300; Kd.box([M.brick, M.brown][i % 2], x - 8, x + 8, 0, 8 + R() * 10, zz - 20, zz, 0xffffff, 0.2, [8, 4]); }
  for (const [x, z, rx, rz] of [[-1600, -400, 400, 1600], [1500, 300, 400, 900], [0, 2100, 1400, 300]]) mesh(root, extrudeUp(blobShape(rx, rz, x | 0, 24), 6, 'shore' + x), M.grass, x, -2, z, 0, 0, 0, false).material = M.grass;
  for (let i = 0; i < 40; i++) { const z = -1200 + i * 40, x = -1300 - R() * 80; Kd.put(M.paint, lumpGeo(i % 5), x, 5, z, 0, 0, 0, 30 + R() * 30, 10 + R() * 8, 25, 0x6a7a5a); }
  K.build(root, 120); Kd.build(root, 300);
  // ---- FX: smoke emitters (stacks + salute), night beam, rays, glow, mist, water glow, fireworks
  const smokes = [];
  const emitter = (pos, n, o) => { const parts = []; for (let i = 0; i < n; i++) { const p = mesh(root, plane(1, 1), (o.mat || M.smoke).clone(), 0, 0, 0, 0, 0, 0, false); nond(p); p.renderOrder = 2; parts.push(p); } smokes.push({ pos, parts, ...o }); };
  for (const b of boats) if (b.stack) for (const [sx, sy] of b.stack) { const c = Math.cos(b.ry), s = Math.sin(b.ry); emitter([b.x + sx * c, sy * b.s, b.z - sx * s], 7, { rise: 30, drift: [12, 0, -6], s0: 3, s1: 14, rate: 0.006 }); }
  const salute = []; for (let i = 0; i < 5; i++) { const lx = -18 + i * 9, x = WS[0] + lx * Math.cos(WS[2]) + 8 * Math.sin(WS[2]), z = WS[1] - lx * Math.sin(WS[2]) + 8 * Math.cos(WS[2]); const e = { pos: [x, 3, z], parts: [], rise: 10, drift: [10, 0, 14], s0: 9, s1: 34, rate: 0.008, salute: true, mat: M.saluteSmoke }; for (let j = 0; j < 5; j++) { const p = mesh(root, plane(1, 1), M.saluteSmoke.clone(), 0, 0, 0, 0, 0, 0, false); nond(p); p.renderOrder = 2; e.parts.push(p); } smokes.push(e); salute.push(e); }
  const fbW = fb.clone().applyAxisAngle(UP(), statueG.rotation.y);
  const beamPivot = new THREE.Group(); root.add(beamPivot); beamPivot.position.copy(fbW).add(new THREE.Vector3(0, 2.5, 0));
  const beamGeo = cached('beamGeo', () => { const g = new THREE.CylinderGeometry(0.8, 70, 900, 32, 1, true); g.translate(0, -450, 0); return g; }), beam2Geo = cached('beam2Geo', () => { const g = new THREE.CylinderGeometry(0.5, 26, 700, 24, 1, true); g.translate(0, -350, 0); return g; });
  const beams = [];
  for (const a of [0, Math.PI]) { const arm = new THREE.Group(); arm.rotation.y = a; beamPivot.add(arm); const b1 = mesh(arm, beamGeo, M.beam, 0, 0, 0, -Math.PI / 2 + 0.07, 0, 0, false), b2 = mesh(arm, beam2Geo, M.beam2, 0, 0, 0, -Math.PI / 2 + 0.07, 0, 0, false); b1.rotation.set(-Math.PI / 2 + 0.07, 0, 0); b2.rotation.set(-Math.PI / 2 + 0.07, 0, 0); nond(b1); nond(b2); beams.push(b1, b2); }
  const halo = mesh(root, plane(60, 60), M.glowW, fbW.x, fbW.y + 3, fbW.z, 0, 0, 0, false); nond(halo); const rays = mesh(root, plane(110, 110), M.rays, fbW.x, fbW.y + 3, fbW.z, 0, 0, 0, false); nond(rays);
  const waterGlow = mesh(root, plane(1, 1), M.glow.clone(), 0, 0.3, 0, -Math.PI / 2, 0, 0, false); nond(waterGlow);
  const mists = []; for (let i = 0; i < 14; i++) { const a = R() * TAU, r = 120 + R() * 600; const m = mesh(root, plane(500 + R() * 400, 300 + R() * 200), M.mist, Math.sin(a) * r, 4 + R() * 18, Math.cos(a) * r * 0.8 + 150, -Math.PI / 2, R() * 3, 0, false); m.rotation.set(-Math.PI / 2, 0, R() * 3); nond(m); mists.push(m); }
  const fwN = 6 * 90, fwPos = new Float32Array(fwN * 3), fwCol = new Float32Array(fwN * 3), fwDir = [];
  for (let i = 0; i < fwN; i++) { const u = R() * 2 - 1, a = R() * TAU, s = Math.sqrt(1 - u * u); fwDir.push([s * Math.cos(a), u, s * Math.sin(a), 0.8 + R() * 0.3]); }
  const fwGeo = new THREE.BufferGeometry(); fwGeo.setAttribute('position', new THREE.BufferAttribute(fwPos, 3)); fwGeo.setAttribute('color', new THREE.BufferAttribute(fwCol, 3));
  const fireworks = new THREE.Points(fwGeo, M.fw); fireworks.frustumCulled = false; root.add(fireworks);
  // night windows on the island buildings (practical glow)
  const winGlows = []; for (const [x, z] of [[-120, 40], [110, 55], [-95, -70], [90, -80]]) { const gl = mesh(root, plane(40, 20), M.glow, x, 8, z + 8, 0, 0, 0, false); nond(gl); winGlows.push(gl); }
  return { statueG, torchG, flameD, flameN, kLant, beamPivot, beams, halo, rays, waterGlow, mists, fireworks, fwDir, smokes, salute, fbW, tinfo, S, SY, water, winGlows };
}

// ---------------------------------------------------------------- per-set light / grade / practicals
const SET_LIGHT = {
  studio: { top: '#000000', hor: '#2a2a34', fog: '#2c2c38', fogN: 14, fogF: 60, sky: '#d4dcf0', ground: '#6a5a4c', hemiI: 1.15, fillCol: '#ffb070', fillI: 0.3, sunCol: '#e6ecf8', sunI: 2.2, az: 180, el: 47, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#f4f0ec', fxTint: '#ffffff', shafts: 0 },
  centennial: { top: '#4a4aa0', hor: '#ffb48a', fog: '#e8a890', fogN: 40, fogF: 260, sky: '#9a8ad8', ground: '#4a3a50', hemiI: 0.95, fillCol: '#6a6ad8', fillI: 0.35, sunCol: '#ffa868', sunI: 2.8, az: -130, el: 12, disc: '#fff0c8', discSize: 0.003, cloud: '#ffc8a8', clouds: true, stars: 0, cardTint: '#fff0e2', fxTint: '#fff4e8', shafts: 0.5 },
  harbor: { top: '#6a8ad0', hor: '#f4d4b4', fog: '#e8d0c0', fogN: 260, fogF: 2300, sky: '#a8b4e8', ground: '#4a4a62', hemiI: 0.85, fillCol: '#7a88e0', fillI: 0.35, sunCol: '#ffd09a', sunI: 3.2, az: -70, el: 24, disc: '#fff4d8', discSize: 0.002, cloud: '#fff0e0', clouds: true, stars: 0, cardTint: '#fff4ea', fxTint: '#ffffff', shafts: 0.3 },
  harborNight: { top: '#070a22', hor: '#2a3468', fog: '#1c2450', fogN: 200, fogF: 1900, sky: '#3a4aa0', ground: '#10142c', hemiI: 0.62, fillCol: '#4a5ac8', fillI: 0.3, sunCol: '#8a9ae8', sunI: 0.7, az: 130, el: 30, disc: '#e8ecff', discSize: 0.0012, cloud: '#2a3466', clouds: false, stars: 1, cardTint: '#d8e0ff', fxTint: '#e8ecff', shafts: 0 },
};
const SET_GRADE = {
  studio: { look: 'office', over: { exp: 1.2, con: 1.28, sat: 0.94, lift: [0.035, 0.035, 0.055], tS: ['#3a3a7a', 0.18], tH: ['#eef0ff', 0.08], bloom: [0.5, 0.74], hal: [0.22, '#c8d0ff'], vig: [0.34, 0.46, '#1e1a2a'] } },
  centennial: { look: 'golden', over: { exp: 1.06, con: 1.26, sat: 1.06, tS: ['#4a3a8a', 0.18], tH: ['#ffb070', 0.14], bloom: [0.45, 0.76], hal: [0.3, '#ff9a50'], vig: [0.3, 0.5, '#2a2040'] } },
  harbor: { look: 'golden', over: { exp: 1.06, con: 1.24, sat: 1.04, tS: ['#3a4a8a', 0.16], tH: ['#ffd090', 0.1], bloom: [0.45, 0.8], hal: [0.24, '#ffb060'], vig: [0.28, 0.52, '#24284a'] } },
  harborNight: { look: 'night', over: { exp: 1.15, con: 1.26, sat: 1.08, lift: [0.025, 0.02, 0.05], tS: ['#2a2a7a', 0.22], tH: ['#ffd8a0', 0.12], bloom: [0.5, 0.64], hal: [0.4, '#ffb060'], vig: [0.36, 0.44, '#080a20'] } },
};
const SET_PRACT = {
  studio: [{ p: [5.1, 0.6, 2.4], col: '#ff9a48', I: 2.4, d: 5 }, { p: [0, 5, -3.6], col: '#d8e0ff', I: 3.0, d: 12 }, { p: [-2.3, 2.2, 1.8], col: '#e8ecff', I: 1.2, d: 4 }, { p: [0, 2.4, 2.4], col: '#f0f0ff', I: 1.4, d: 5 }],
  centennial: [{ p: [0, 5.8, 8.5], col: '#ffb060', I: 3.0, d: 14 }, { p: [-9, 5.8, 3], col: '#ffa050', I: 2.6, d: 12 }, { p: [9, 5.8, 3], col: '#ffa050', I: 2.6, d: 12 }, { p: [0, 2.5, -1], col: '#ffc890', I: 1.6, d: 8 }],
  harbor: [],
  harborNight: [{ at: 'torch', col: '#ffc070', I: 60, d: 140, decay: 1.2 }, { p: [0, 30, 40], col: '#ffb060', I: 18, d: 70, decay: 1.4 }, { p: [-120, 10, 55], col: '#ffa850', I: 8, d: 40 }, { p: [110, 10, 70], col: '#ffa850', I: 8, d: 40 }],
};

export function buildHarbor(ctx) {
  ({ THREE, toon, mkTex, PT } = ctx); NOND = ctx.NOND || null; CAM = ctx.camera || null; MACRO = ctx.macro || null;
  M = materials();
  const groups = {};
  for (const name of Object.keys(O)) { const g = new THREE.Group(); g.name = 'lib_' + name; g.position.set(...O[name]); g.visible = false; ctx.scene.add(g); groups[name] = g; }
  const st = buildStudio(groups.studio), ce = buildCentennial(groups.centennial), hb = buildHarborSet(groups.harbor);
  const HS = hb.S, HSY = hb.SY, balc = hb.fbW.clone().add(new THREE.Vector3(0, -0.2, hb.tinfo.balcR * HS - 0.6));
  const spots = {
    // studio (floor 0): maquettes on stands at x -0.6 / +0.6 (both) or x 0 (single), sculptor beside them
    sculptor: W3('studio', [1.55, 0, 1.4]), modelsFront: W3('studio', [0, 0, 2.6]), egyptModel: W3('studio', [-0.42, 0.945, 0.6]), libertyModel: W3('studio', [0.42, 0.945, 0.6]),
    bench: W3('studio', [-2.3, 0, 2.55]), sketch: W3('studio', [-2.35, 0.9, 1.78]), stove: W3('studio', [4.6, 0, 2.7]), window: W3('studio', [-1.5, 0, -3.8]), pinboard: W3('studio', [-6.6, 0, -3.9]),
    scaffoldPlank: W3('studio', [2.7 - 1.5, 2.66, -2.9 + 1.55]), handFragment: W3('studio', [-2.6, 0, -0.6]),
    // centennial (ground 0): the arm base at (0,0,-6), balcony round the flame
    armBase: W3('centennial', [0, 0, -3.0]), crowdL: W3('centennial', [-2.6, 0, 1.2]), crowdR: W3('centennial', [2.8, 0, 1.4]), crowdBack: W3('centennial', [-0.4, 0, 4.2]), steps: W3('centennial', [0, 0.95, -2.6]),
    balcony: W3('centennial', [ce.flameW[0], ce.flameW[1] - 0.18, ce.flameW[2] + 1.9]), banner: W3('centennial', [0, 1.3, -3.6]),
    // harbor (water 0): island fort top ~11.9, pedestal top 53.2, torch balcony ~(flame) - see keeper
    keeper: W3('harbor', balc.toArray()), torch: W3('harbor', hb.fbW.toArray()), pedestalTop: W3('harbor', [0, HSY, 7.8]), fortLawn: W3('harbor', [0, 11.9, 40]), islandLawn: W3('harbor', [18, 2.7, 80]), dock: W3('harbor', [0, 2.4, 165]), steamerDeck: W3('harbor', [-20, 7.6, 235]),
  };
  const V = (set, p, l, fov, cInf, fp, extra = {}) => { const c = { set, p: W3(set, p), l: W3(set, l), fov, cInf, fp: fp ? W3(set, fp) : null, ...extra }; c.focus = Math.hypot(...[0, 1, 2].map((i) => c.p[i] - (c.fp || c.l)[i])); return c; };
  const tw = hb.fbW;
  const views = [
    V('studio', [0.3, 1.7, 6.3], [0, 2.7, -4], 60, 2.2, [0, 1.6, 0.6], { models: 'both' }), // 0 studio wide: skylight, models, hand fragment, scaffold, stove
    V('studio', [0.0, 1.65, 3.95], [0, 1.6, 0.6], 38, 5, [0, 1.55, 0.6], { models: 'both' }), // 1 the two maquettes side by side (close)
    V('studio', [-0.2, 1.6, 3.0], [0, 1.62, 0.6], 36, 6, [0, 1.6, 0.6], { models: 'egypt' }), // 2 Egypt maquette alone
    V('studio', [0.2, 1.6, 3.0], [0, 1.62, 0.6], 36, 6, [0, 1.6, 0.6], { models: 'liberty' }), // 3 Liberty maquette alone
    V('studio', [-2.15, 1.75, 2.45], [-2.35, 0.9, 1.78], 38, 7, [-2.35, 0.9, 1.78], { models: 'both', puff: -1 }), // 4 dusty sketch insert (puff: frame offset of dust-off, -1 = dusty)
    V('studio', [-4.7, 1.55, 2.4], [-2.6, 1.6, -3.0], 46, 4, [-2.6, 1.6, -3.0], { models: 'liberty' }), // 5 giant plaster hand-with-torch + pinboard sketches
    V('centennial', [3.5, 1.6, 20], [0, 6.5, -6], 50, 2.2, [0, 4, -4]), // 6 centennial wide: arm, bunting, lanterns, hall
    V('centennial', [2.2, 0.9, 3.4], [0.3, 11.5, -6], 54, 3, [0, 8, -6]), // 7 low up at the arm + torch balcony
    V('centennial', [0.5, 1.7, 4.6], [0, 1.9, -3.6], 50, 4, [0, 1.4, -3.6]), // 8 banner "1776–1876" + gift bow medium
    V('centennial', [-6, 13.2, 6.5], [ce.flameW[0], ce.flameW[1], ce.flameW[2]], 36, 4, [ce.flameW[0], ce.flameW[1] - 1, ce.flameW[2] + 1]), // 9 balcony close (visitors up at the flame)
    V('harbor', [70, 16, 400], [-6, 50, 0], 36, 1.2, [0, 50, 0]), // 10 wide harbor day: island, statue, steamers, sails, skyline
    V('harbor', [18, 4.5, 78], [0, 76, 0], 34, 2.0, [0, 70, 0]), // 11 low hero angle up at Liberty from the fort lawn
    V('harbor', [tw.x + 27, tw.y - 2, tw.z + 12], [tw.x, tw.y - 3.5, tw.z], 40, 4, [tw.x, tw.y - 2, tw.z]), // 12 torch close-up (day)
    V('harbor', [-34, 11, 330], [0, 52, 0], 44, 1.5, [-20, 8, 235]), // 13 steamboat foreground, Liberty behind
    V('harborNight', [70, 16, 400], [-6, 56, 0], 38, 1.2, [0, 50, 0], { night: true }), // 14 night wide: lighthouse beam over the water, mist
    V('harborNight', [18, 4.5, 78], [0, 78, 0], 36, 2.0, [0, 70, 0], { night: true }), // 15 night low hero: flame + beam above her
    V('harborNight', [tw.x + 25, tw.y + 1, tw.z + 15], [tw.x, tw.y - 2.5, tw.z + 1], 40, 4, [balc.x, balc.y, balc.z], { night: true }), // 16 night torch close: keeper's balcony spot
    V('harbor', [-330, 6, 400], [-95, 32, 60], 40, 1.5, [-200, 10, 180], { salute: 1 }), // 17 warship salute smoke + Liberty (day)
    V('studio', [-2.15, 1.75, 2.45], [-2.35, 0.9, 1.78], 38, 7, [-2.35, 0.9, 1.78], { models: 'both', puff: 10 }), // 18 = view 4 mid dust-off (10 frames after dustOff)
  ];
  let FRAME = 0, CUR = null, MODELS = 'both', DUST0 = null, DUSTDUR = 24, SALUTE = 0, FW = 0, NIGHT = false;
  const camq = new THREE.Quaternion();
  const API = {
    groups, origin: O, spots, views,
    // maquettes: 'egypt' | 'liberty' | 'both' (singles move to centre stage); turn(a, b) spins the turntables (radians)
    models(mode = 'both') { MODELS = mode; const e = st.egypt.g, l = st.libm.g; e.visible = mode !== 'liberty'; l.visible = mode !== 'egypt';
      e.position.set(mode === 'both' ? -0.42 : 0, 0, 0.6); l.position.set(mode === 'both' ? 0.42 : 0, 0, 0.6); e.rotation.y = mode === 'both' ? 0.18 : 0.1; l.rotation.y = mode === 'both' ? -0.18 : -0.1; },
    turn(a = 0, b = 0) { st.egypt.top.rotation.y = a; st.libm.top.rotation.y = b; },
    // dust: dustOff(f0, dur) -> from frame f0 the dust layer clears over dur frames with a puff; dustOff(null) = dusty; setDust(t) direct (0 dusty..1 clean)
    dustOff(f0, dur = 24) { DUST0 = f0; DUSTDUR = dur; },
    setDust(t) { st.dust.material.opacity = 1 - clamp01(t); st.dust.visible = t < 0.999; },
    setGift(on) { ce.gift.visible = !!on; },
    setSalute(on) { SALUTE = on ? 1 : 0; }, setFireworks(on) { FW = on ? 1 : 0; },
    tick(f) { FRAME = f;
      if (CUR === 'studio' || CUR == null) {
        st.shafts.forEach((s, i) => { s.material.opacity = 0.06 + 0.02 * Math.sin(f * 0.025 + i * 1.7); });
        { const p = st.motes.geometry.attributes.position, b = st.motes.userData.base; for (let i = 0; i < p.count; i++) { p.setXYZ(i, b[i * 3] + Math.sin(f * 0.01 + i) * 0.15, b[i * 3 + 1] + ((f * 0.0015 + i * 0.37) % 1) * 0.4 - 0.2, b[i * 3 + 2] + Math.cos(f * 0.008 + i * 1.3) * 0.15); } p.needsUpdate = true; }
        st.stoveGlow.material.opacity = 0.42 + 0.08 * Math.sin(f * 0.21) + 0.04 * Math.sin(f * 0.53);
        const t = DUST0 == null ? 0 : (f - DUST0) / DUSTDUR; API.setDust(smooth(t));
        st.puffs.forEach((p) => { const u = DUST0 == null ? -1 : (f - DUST0) / (DUSTDUR * 2.2) - p.userData.r * 0.25; p.visible = u > 0 && u < 1; if (!p.visible) return; const d = p.userData, r = 0.08 + u * 0.45 * d.s;
          p.position.set(Math.cos(d.a) * r, 0.03 + u * d.up, Math.sin(d.a) * r * 0.8); p.scale.setScalar(0.4 + u * 1.6 * d.s); p.material.opacity = 0.75 * Math.sin(Math.PI * Math.min(1, u * 1.3)) * (1 - u * 0.5); });
      }
      if (CUR === 'centennial' || CUR == null) ce.glows.forEach((g, i) => { g.material.opacity = 0.5 + 0.06 * Math.sin(f * 0.13 + i); });
      if (CUR === 'harbor' || CUR === 'harborNight' || CUR == null) {
        for (const t of [M.waterD, M.waterN]) { t.offset.set(f * 0.00035, Math.sin(f * 0.02) * 0.004 + f * 0.0002); }
        for (const e of hb.smokes) { const on = e.salute ? SALUTE : 1; e.parts.forEach((p, i) => { if (!on) { p.visible = false; return; } const u = ((f * e.rate + i / e.parts.length) % 1); p.visible = true;
          p.position.set(e.pos[0] + e.drift[0] * u * (e.salute ? 1 : 3) + (e.salute ? (i - 2) * 4 : 0), e.pos[1] + e.rise * u + (e.salute ? 2 : 0), e.pos[2] + e.drift[2] * u * (e.salute ? 1 : 3)); p.scale.setScalar(e.s0 + e.s1 * u); p.material.opacity = (e.salute ? 0.9 : 0.7) * (1 - u) * Math.min(1, u * 6); }); }
        const night = CUR === 'harborNight' || NIGHT; const sw = f * 0.012; hb.beamPivot.rotation.y = sw + 0.9;
        hb.beams.forEach((b, i) => { b.material.opacity = (i % 2 ? 0.34 : 0.24) * (0.88 + 0.12 * Math.sin(f * 0.11)); });
        hb.halo.material.opacity = 0.65 + 0.08 * Math.sin(f * 0.17); hb.rays.material.opacity = 0.45 + 0.1 * Math.sin(f * 0.07);
        hb.mists.forEach((m, i) => { m.position.x += 0; m.material.opacity = 0.22; m.rotation.z = i + f * 0.0006 * (i % 2 ? 1 : -1); });
        // fireworks: 6 bursts, staggered, each 75 frames
        const fp = hb.fireworks.geometry.attributes.position, fc = hb.fireworks.geometry.attributes.color, cols = [[1, 0.5, 0.3], [1, 0.9, 0.5], [0.6, 0.7, 1], [1, 0.4, 0.7], [0.7, 1, 0.6], [1, 0.75, 0.3]];
        for (let b = 0; b < 6; b++) { const per = 75, ph = ((f + b * 37) % per) / per, cyc = Math.floor((f + b * 37) / per), cx = -220 + ((b * 97 + cyc * 61) % 440), cy = 120 + ((b * 31 + cyc * 17) % 60), cz = -200 + ((b * 53 + cyc * 29) % 200), rr = 38 * Math.sqrt(ph), fade = FW ? Math.max(0, 1 - ph) ** 1.5 * (ph > 0.04 ? 1 : 0) : 0;
          for (let j = 0; j < 90; j++) { const i = b * 90 + j, d = hb.fwDir[i]; fp.setXYZ(i, cx + d[0] * rr * d[3], cy + d[1] * rr * d[3] - 30 * ph * ph, cz + d[2] * rr * d[3]); const c = cols[(b + cyc) % 6]; fc.setXYZ(i, c[0] * fade, c[1] * fade, c[2] * fade); } }
        fp.needsUpdate = true; fc.needsUpdate = true; hb.fireworks.visible = !!FW;
      }
    },
    setNight(on) { NIGHT = !!on; M.water.map = on ? M.waterN : M.waterD; M.copper.matcap = on ? M.copperCapN : M.copperCapD; hb.flameD.visible = !on; hb.flameN.visible = on; hb.kLant.visible = on;
      for (const x of [hb.halo, hb.rays, hb.waterGlow, ...hb.beams, ...hb.mists, ...hb.winGlows]) x.visible = on;
      for (const mt of [M.brick, M.brown, M.greyF, M.cabin]) mt.emissive.set(on ? 0xffc070 : 0x000000); },
    lightFor(name) { return { ...LIGHTS_[name === 'harborNight' ? 'explain' : name === 'studio' ? 'office' : 'golden'], ...SET_LIGHT[name] }; },
    gradeFor: (name) => ({ ...((SET_GRADE[name] || {}).over || {}) }),
    lookFor: (name) => (SET_GRADE[name] || {}).look || 'office',
    show(world, name) { const g = GRP[name]; for (const k in groups) groups[k].visible = k === g; CUR = name || null;
      if (name) { for (const k of ['road', 'stadium', 'office', 'car', 'dc']) if (world[k]) world[k].visible = false; if (world.rooms) world.rooms.show(world, null); if (g === 'harbor') API.setNight(name === 'harborNight'); API.tick(FRAME); } },
    placeLights(PRACT, name) { PRACT.forEach((l, i) => { const c = (SET_PRACT[name] || [])[i]; l.visible = true; if (!c) { l.intensity = 0; return; } l.position.set(...(c.at === 'torch' ? W3('harbor', hb.fbW.clone().add(new THREE.Vector3(0, 4, 3)).toArray()) : W3(name, c.p))); l.color.set(c.col); l.intensity = c.I; l.distance = c.d; l.decay = c.decay ?? 1.6; }); API.face(name); },
    // billboards (smoke, puffs, glows, halo) face the camera; the water glow streaks from the statue toward the camera
    face(name = CUR) { const cam = CAM; if (!cam) return; camq.copy(cam.quaternion);
      if (name === 'studio') { st.puffs.forEach((p) => p.quaternion.copy(camq)); st.stoveGlow.quaternion.copy(camq); }
      if (name === 'centennial') ce.glows.forEach((g) => g.quaternion.copy(camq));
      if (name === 'harbor' || name === 'harborNight') { for (const e of hb.smokes) e.parts.forEach((p) => p.quaternion.copy(camq)); hb.halo.quaternion.copy(camq); hb.rays.quaternion.copy(camq); { const o = groups.harbor.position, dd = Math.hypot(cam.position.x - o.x - hb.fbW.x, cam.position.y - o.y - hb.fbW.y, cam.position.z - o.z - hb.fbW.z), k = Math.min(1, Math.max(0.12, dd / 380)); hb.halo.scale.setScalar(k); hb.rays.scale.setScalar(k); hb.rays.material.opacity *= 0.5 + 0.5 * k; } hb.winGlows.forEach((g) => g.quaternion.copy(camq));
        const o = groups.harbor.position, cx = cam.position.x - o.x, cz = cam.position.z - o.z, d = Math.hypot(cx - hb.fbW.x, cz - hb.fbW.z), L = Math.min(d * 0.9, 700); const wg = hb.waterGlow;
        wg.position.set(hb.fbW.x + (cx - hb.fbW.x) / d * L * 0.5, 0.4, hb.fbW.z + (cz - hb.fbW.z) / d * L * 0.5); wg.rotation.set(-Math.PI / 2, 0, Math.atan2(cx - hb.fbW.x, cz - hb.fbW.z)); wg.scale.set(9, L, 1); wg.material.opacity = 0.26; } },
    // test-view helper (main.js ?hbview=N; a: view = frame)
    viewFor(i, f = 0) { const k = ((i % views.length) + views.length) % views.length, c = views[k];
      return { i: k, mod: API, set: c.set, f, models: c.models || 'both', puff: c.puff, salute: c.salute ?? 0, fw: c.fw ?? (c.set === 'harborNight' ? 1 : 0), L: API.lightFor(c.set), look: API.lookFor(c.set), grade: API.gradeFor(c.set), cam: { p: c.p, l: c.l, fov: c.fov, focus: c.focus, cInf: c.cInf, roll: c.roll || 0, shadowAt: c.fp || c.l } }; },
    apply(world, v) { API.show(world, v.set); API.models(v.models || 'both'); API.dustOff(v.puff == null || v.puff < 0 ? null : (v.f ?? FRAME) - v.puff, 24); API.setSalute(v.salute); API.setFireworks(v.fw); API.setGift(v.gift ?? true); API.tick(v.f ?? FRAME); },
  };
  API.view = API.viewFor; API.models('both'); API.setGift(true); API.setNight(false); API.tick(0);
  return API;
}
