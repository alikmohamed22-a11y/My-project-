// princeton.js [EIN-sets]: sets for "Einstein was offered the presidency of Israel" (Oddverra short), all 1952.
//   study     : Einstein's study, 112 Mercer Street: walnut panelling, floor-to-ceiling books, paper piles, big desk (letters, pipe +
//               tobacco pouch, lamp), cathedral radio, violin case in the corner, chalkboard on an easel (setChalk(t)), window onto
//               autumn maples; envelope that opens + handwritten reply sheet (setLetter({open, reply})).        origin (-6400, 0, 0)
//   house     : exterior, white clapboard Greek-revival house: portico + columns, black shutters, picket fence, maples with falling
//               leaves (tick), 1950s curbside mailbox "112"; late-afternoon gold.                                 origin (-6700, 0, 0)
//   embassy   : 1952 Washington diplomatic office: mahogany panelling, tall draped windows (morning), desk w/ fountain pens +
//               "AMBASSADOR" nameplate, typing table + typewriter (setTyping(t)), blue-and-white flag on a staff, framed map.  origin (-7000, 0, 0)
//   jerusalem : Prime Minister's office: whitewash + painted dado, patterned cement tiles, books stacked high, plain desk + black
//               phone, window onto Jerusalem-stone town + hills, portrait with black mourning ribbon (setMourning(on)), fan.  origin (-7300, 0, 0)
//   cosmos    : dream space "light, gravity, time": violet starfield, warped spacetime grid with a ringed planet in its well, a light
//               beam bending past it, floating clocks ticking at different rates (slower near the planet), floating equations. origin (-7600, 0, 0)
// Each set: local frame, floor y = 0, camera side +z. All groups start hidden; show(world, name) displays one.
import { Kit } from './world.js';
import { LIGHTS_ } from './story.js';

let THREE, toon, mkTex, PT, NOND, CAM, MACRO;
export const PRINCETON_ORIGIN = { study: [-6400, 0, 0], house: [-6700, 0, 0], embassy: [-7000, 0, 0], jerusalem: [-7300, 0, 0], cosmos: [-7600, 0, 0] };
const O = PRINCETON_ORIGIN, SETS = Object.keys(O);
const W3 = (name, p) => [p[0] + O[name][0], p[1] + O[name][1], p[2] + O[name][2]];
const INK = '#2b1d4a', TAU = Math.PI * 2;

// ---------------------------------------------------------------- geometry helpers
const GC = new Map();
const cached = (k, mk) => { let g = GC.get(k); if (!g) GC.set(k, (g = mk())); return g; };
const cyl = (rt, rb, h, rs = 12, open = false) => cached(`c${rt}|${rb}|${h}|${rs}|${open}`, () => new THREE.CylinderGeometry(rt, rb, h, rs, 1, open));
const sph = (r, ws = 14, hs = 10) => cached(`s${r}|${ws}|${hs}`, () => new THREE.SphereGeometry(r, ws, hs));
const tor = (r, t, rs = 6, ts = 24, arc = TAU) => cached(`t${r}|${t}|${rs}|${ts}|${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));
const plane = (w, h) => cached(`p${w}|${h}`, () => new THREE.PlaneGeometry(w, h));
const BOX = () => cached('box1', () => new THREE.BoxGeometry(1, 1, 1));
const lathe = (key, pts, n = 20) => cached('la' + key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n));
const mesh = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, shadow = true) => { if (mat.vertexColors && !geo.attributes.color && geo.attributes.position) geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(1), 3)); const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz, 'YXZ'); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
const nond = (o) => { if (NOND) NOND.add(o); o.castShadow = false; return o; };
const lumpGeo = (seed) => cached('lump' + seed, () => { const g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), h = Math.sin(x * 5.9898 + y * 7.233 + z * 3.719 + seed * 4.1) * 43758.5453, k = 0.86 + 0.22 * (h - Math.floor(h)); p.setXYZ(i, x * k, y * k * 0.85, z * k); }
  g.computeVertexNormals(); return g; });
const prismGeo = (w, h, d) => cached(`pr${w}|${h}|${d}`, () => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g; });
// hanging cloth: a plane with vertical folds (drapes / flags), top edge at y=0
const foldGeo = (w, h, n, amp, key) => cached('fold' + key, () => { const g = new THREE.PlaneGeometry(w, h, 48, 8); g.translate(0, -h / 2, 0); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, amp * Math.sin((x / w + 0.5) * n * TAU) * (0.55 + 0.45 * (-y / h))); } g.computeVertexNormals(); return g; });

// ---------------------------------------------------------------- painters
const css = (...a) => PT.css(...a), shade = (...a) => PT.shade(...a), tint = (...a) => PT.tint(...a), vary = (...a) => PT.vary(...a), rng = (...a) => PT.rng(...a), fbm = (...a) => PT.fbm(...a), modulate = (...a) => PT.modulate(...a), hex = (...a) => PT.hex(...a);
const SERIF = '"DejaVu Serif", Georgia, serif', HANDF = '"FreeSerif", "DejaVu Serif", serif', MONO = '"Courier 10 Pitch", "FreeMono", monospace';
function txt(g, s, cx, cy, maxW, sz, o = {}) {
  g.save(); g.font = `${o.italic ? 'italic ' : ''}${o.bold === false ? '' : 'bold '}${sz | 0}px ${o.font || SERIF}`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
  const tw = g.measureText(s).width, sx = Math.min(1, maxW / tw); g.translate(cx, cy); g.scale(sx, 1); g.fillStyle = o.col || INK; g.fillText(s, 0, 0); g.restore();
}
// handwriting: per-glyph jitter, _{sub} ^{sup}; draws at most o.n glyphs; returns { x, y, drawn, total }
function tokens(s) { const out = []; for (let i = 0; i < s.length; i++) { const ch = s[i];
    if ((ch === '_' || ch === '^') && i + 1 < s.length) { let grp; if (s[i + 1] === '{') { const j = s.indexOf('}', i); grp = s.slice(i + 2, j); i = j; } else { grp = s[i + 1]; i++; } for (const c of grp) out.push({ c, m: ch }); }
    else out.push({ c: ch, m: '' }); } return out; }
function hand(g, s, x, y, sz, o = {}) {
  const R = rng(o.seed || 7), tk = tokens(s), n = o.n ?? 1e9; let drawn = 0, cx = x, last = [x, y];
  g.save(); g.textBaseline = 'alphabetic'; g.fillStyle = o.col || '#1c2a6a';
  for (const t of tk) { const s2 = t.m ? sz * 0.6 : sz, dy = t.m === '_' ? sz * 0.28 : t.m === '^' ? -sz * 0.45 : 0;
    g.font = `${o.upright ? '' : 'italic '}${o.weight || 400} ${s2 | 0}px ${o.font || HANDF}`; const w = g.measureText(t.c).width, jr = (R() - 0.5) * (o.wob ?? 0.14), jy = (R() - 0.5) * sz * 0.07, jx = (R() - 0.5) * sz * 0.04;
    if (t.c !== ' ') { if (drawn >= n) { R(); continue; } drawn++; g.save(); g.translate(cx + jx, y + dy + jy + Math.sin(cx * 0.013 + (o.seed || 0)) * sz * 0.04); g.rotate(jr - 0.05); g.fillText(t.c, 0, 0);
      if (o.chalk) { g.globalAlpha = 0.35; g.fillText(t.c, 1.2, 0.8); } g.restore(); last = [cx + w, y + dy]; }
    cx += w * (o.track ?? 1) + (R() - 0.5) * sz * 0.03; }
  g.restore(); return { x: cx, y, drawn, total: tk.filter((t) => t.c !== ' ').length, tip: last };
}
const glyphCount = (s) => tokens(s).filter((t) => t.c !== ' ').length;
function grain(g, w, h, col, n, seed, a = 0.5) { const R = rng(seed); g.fillStyle = col; for (let i = 0; i < n; i++) { g.globalAlpha = a * R(); g.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2); } g.globalAlpha = 1; }
const LEAFC = ['#d8642a', '#e8962e', '#c8402a', '#f0b83a', '#b8502a', '#e07a30', '#a8322a', '#d8a040'];
function mapleLeaf(g, x, y, s, a, col) { g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s); g.fillStyle = col; g.beginPath();
  const P = [[0, -1], [0.22, -0.55], [0.6, -0.75], [0.48, -0.32], [0.95, -0.15], [0.55, 0.1], [0.7, 0.45], [0.2, 0.3], [0.05, 0.75], [-0.05, 0.75], [-0.2, 0.3], [-0.7, 0.45], [-0.55, 0.1], [-0.95, -0.15], [-0.48, -0.32], [-0.6, -0.75], [-0.22, -0.55]];
  P.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.fill(); g.restore(); }

function panelTex(g, w, h, o = {}) { // raised-panel wainscot / full panelling (2 x 2 panels per tile)
  PT.planks(g, w, h, { base: o.base || '#6a4028', n: 1, seed: o.seed || 61, joints: 0, varyAmt: 0.05 });
  const base = hex(o.base || '#6a4028'), nx = 2, ny = o.ny || 2, pw = w / nx, ph = h / ny, m = pw * 0.14;
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const x0 = i * pw + m, y0 = j * ph + m, x1 = (i + 1) * pw - m, y1 = (j + 1) * ph - m;
    g.fillStyle = css(shade(base, 0.62)); g.fillRect(x0 - 4, y0 - 4, x1 - x0 + 8, y1 - y0 + 8);
    g.fillStyle = css(tint(base, 1.12)); g.fillRect(x0 - 4, y0 - 4, x1 - x0 + 8, 4); g.fillRect(x0 - 4, y0 - 4, 4, y1 - y0 + 8);
    g.fillStyle = css(vary(base, 0.04)); g.fillRect(x0 + 10, y0 + 10, x1 - x0 - 20, y1 - y0 - 20);
    g.strokeStyle = css(shade(base, 0.55), 0.8); g.lineWidth = 2; g.strokeRect(x0 + 10, y0 + 10, x1 - x0 - 20, y1 - y0 - 20);
    g.strokeStyle = css(tint(base, 1.2), 0.5); g.beginPath(); g.moveTo(x0 + 12, y1 - 12); g.lineTo(x1 - 12, y1 - 12); g.lineTo(x1 - 12, y0 + 12); g.stroke(); }
  modulate(g, w, h, (u, v) => 0.92 + 0.14 * fbm(u, v, 3, 12, 3, 9));
}
function plasterTex(g, w, h, o = {}) { g.fillStyle = o.base || '#ece2cc'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.93 + 0.1 * fbm(u, v, 6, 6, 4, o.seed || 3)); grain(g, w, h, '#8a7a6a', 900, 5, 0.15); }
function rugTex(g, w, h, o = {}) { const c = o.cols || ['#7a2a2a', '#2a2a4a', '#c8a060', '#e8d8b0', '#4a5a3a']; g.fillStyle = c[0]; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 4; k++) { g.strokeStyle = c[(k + 1) % c.length]; g.lineWidth = w * 0.018; const m = w * (0.04 + k * 0.035); g.strokeRect(m, m, w - 2 * m, h - 2 * m); }
  const R = rng(4); for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) { const x = w * (0.2 + i * 0.075), y = h * (0.2 + j * 0.075); g.fillStyle = c[(i + j) % 2 ? 3 : 1]; g.beginPath(); g.moveTo(x, y - 12); g.lineTo(x + 12, y); g.lineTo(x, y + 12); g.lineTo(x - 12, y); g.fill(); g.fillStyle = c[2]; g.fillRect(x - 3, y - 3, 6, 6); }
  g.fillStyle = c[1]; g.beginPath(); g.moveTo(w / 2, h * 0.36); g.lineTo(w * 0.62, h / 2); g.lineTo(w / 2, h * 0.64); g.lineTo(w * 0.38, h / 2); g.fill(); g.fillStyle = c[2]; g.beginPath(); g.moveTo(w / 2, h * 0.42); g.lineTo(w * 0.56, h / 2); g.lineTo(w / 2, h * 0.58); g.lineTo(w * 0.44, h / 2); g.fill();
  for (let i = 0; i < 400; i++) { g.fillStyle = c[(R() * c.length) | 0]; g.globalAlpha = 0.5; g.fillRect(R() * w, R() * h, 3, 3); } g.globalAlpha = 1;
  modulate(g, w, h, (u, v) => 0.85 + 0.2 * fbm(u, v, 8, 8, 3, 2)); }
// painted window backdrops
function sky(g, w, h, a, b, c) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, a); gr.addColorStop(0.6, b); gr.addColorStop(1, c); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
function autumnView(g, w, h) { sky(g, w, h, '#f0c890', '#ffe0b0', '#ffd8a0'); const R = rng(17);
  g.fillStyle = '#b8a0c0'; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(R() * w, h * 0.55 + R() * 30, 30 + R() * 40, 0, TAU); g.fill(); }
  g.fillStyle = '#f4ece0'; g.fillRect(w * 0.62, h * 0.42, w * 0.3, h * 0.4); g.fillStyle = '#5a5060'; g.beginPath(); g.moveTo(w * 0.58, h * 0.43); g.lineTo(w * 0.77, h * 0.3); g.lineTo(w * 0.96, h * 0.43); g.fill();
  g.fillStyle = '#2a2230'; for (const x of [0.66, 0.84]) g.fillRect(w * x, h * 0.52, w * 0.05, h * 0.09);
  g.fillStyle = '#6a7a4a'; g.fillRect(0, h * 0.8, w, h * 0.2);
  for (const [cx, cy, r] of [[0.2, 0.42, 0.26], [0.5, 0.3, 0.2], [0.95, 0.25, 0.2]]) { g.fillStyle = '#3a2a2a'; g.fillRect(w * cx - 6, h * cy, 12, h); for (let i = 0; i < 260; i++) { const a = R() * TAU, d = Math.sqrt(R()) * r * w; mapleLeaf(g, w * cx + Math.cos(a) * d, h * cy + Math.sin(a) * d * 0.8, 8 + R() * 10, R() * 6, LEAFC[(R() * LEAFC.length) | 0]); } }
  for (let i = 0; i < 160; i++) mapleLeaf(g, R() * w, h * (0.82 + R() * 0.18), 5 + R() * 5, R() * 6, LEAFC[(R() * LEAFC.length) | 0]); }
function dcView(g, w, h) { sky(g, w, h, '#a8c4ec', '#e4ecf4', '#fff0d8'); const R = rng(23);
  g.fillStyle = '#c4c8d8'; g.fillRect(0, h * 0.55, w, h * 0.12); // far street haze
  g.fillStyle = '#f2eee4'; g.fillRect(w * 0.12, h * 0.36, w * 0.7, h * 0.26); g.fillStyle = '#e4ded0'; g.fillRect(w * 0.1, h * 0.33, w * 0.74, h * 0.04); // a white classical building
  g.beginPath(); g.moveTo(w * 0.3, h * 0.33); g.lineTo(w * 0.47, h * 0.24); g.lineTo(w * 0.64, h * 0.33); g.fill();
  g.fillStyle = '#b8b4c4'; for (let i = 0; i < 12; i++) g.fillRect(w * (0.15 + i * 0.056), h * 0.38, w * 0.022, h * 0.22);
  g.fillStyle = '#5a7a4a'; for (let i = 0; i < 60; i++) { g.beginPath(); g.arc(R() * w, h * (0.6 + R() * 0.1), 18 + R() * 30, 0, TAU); g.fill(); }
  g.fillStyle = '#7a9a5a'; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(R() * w, h * (0.62 + R() * 0.1), 12 + R() * 20, 0, TAU); g.fill(); }
  g.fillStyle = '#8a8a92'; g.fillRect(0, h * 0.78, w, h * 0.22); }
function jerusalemView(g, w, h) { sky(g, w, h, '#8ec4ee', '#d8ecf8', '#fff2d8'); const R = rng(29);
  for (const [y, c] of [[0.36, '#c8b8b0'], [0.42, '#b8a890'], [0.5, '#a89a78']]) { g.fillStyle = c; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 16) g.lineTo(x, h * y + Math.sin(x * 0.01 + y * 9) * 22 + Math.sin(x * 0.031) * 9); g.lineTo(w, h); g.fill(); }
  for (let row = 0; row < 4; row++) for (let i = 0; i < 14; i++) { const bw = w * (0.06 + R() * 0.08), bh = h * (0.06 + R() * 0.08), x = R() * w, y = h * (0.5 + row * 0.1) - bh, c = ['#ead8a8', '#e4cc98', '#f0e0b8', '#dcc490'][(R() * 4) | 0];
    g.fillStyle = c; g.fillRect(x, y, bw, bh + h * 0.2); g.fillStyle = css(shade(c, 0.78)); g.fillRect(x + bw * 0.8, y, bw * 0.2, bh + h * 0.2);
    g.fillStyle = '#5a4a5a'; for (let k = 0; k < 3; k++) if (R() < 0.7) { const wx = x + bw * (0.15 + k * 0.25), wy = y + bh * 0.3; g.fillRect(wx, wy, bw * 0.1, bh * 0.25); g.beginPath(); g.arc(wx + bw * 0.05, wy, bw * 0.05, Math.PI, 0); g.fill(); }
    if (R() < 0.18) { g.fillStyle = c; g.beginPath(); g.arc(x + bw / 2, y, bw * 0.3, Math.PI, 0); g.fill(); g.strokeStyle = css(shade(c, 0.7)); g.lineWidth = 2; g.stroke(); } }
  for (let i = 0; i < 9; i++) { const x = R() * w, y = h * (0.6 + R() * 0.3), ch = h * (0.12 + R() * 0.08); g.fillStyle = '#2a4a32'; g.beginPath(); g.ellipse(x, y - ch / 2, w * 0.012, ch / 2, 0, 0, TAU); g.fill(); } // cypresses
  for (let i = 0; i < 12; i++) { g.fillStyle = '#8a9a70'; g.beginPath(); g.arc(R() * w, h * (0.85 + R() * 0.1), 14 + R() * 16, 0, TAU); g.fill(); } // olives
}
// ---------------------------------------------------------------- paper props
const EBAN = ['EMBASSY OF ISRAEL', 'WASHINGTON, D.C.', '', '                         November 17, 1952', '', 'Professor Albert Einstein', '112 Mercer Street', 'Princeton, New Jersey', '', 'Dear Professor Einstein,', '',
  'The Prime Minister, Mr. Ben-Gurion, has asked me', 'to put to you the question whether you would', 'accept the Presidency of Israel if it were', 'offered to you by a vote of the Knesset.', 'Acceptance would mean moving to Israel and', 'taking its citizenship ...', '', '              With deep respect,', '              Abba Eban'];
const REPLY = ['Nov. 18, 1952', 'Dear Mr. Ambassador,', 'I am deeply moved by the offer', 'from our State of Israel, and at', 'once saddened and ashamed that', 'I cannot accept it. All my life I', 'have dealt with objective matters,', 'hence I lack both the natural', 'aptitude and the experience to', 'deal properly with people and to', 'exercise official functions.', '                 A. Einstein'];
const TOTAL = (L) => L.reduce((a, s) => a + s.length, 0);
function typedPage(g, w, h, t, o = {}) { // typewriter letter, t 0..1 reveals characters; returns [u,v] of the next character
  PT.paper(g, w, h, { base: '#f6f1e4', seed: 11 }); const lines = EBAN, N = TOTAL(lines), n = Math.round(t * N), lh = h * 0.042, x0 = w * 0.08; let k = 0, tip = [x0 / w, 0.1];
  g.textBaseline = 'alphabetic';
  lines.forEach((s, i) => { const y = h * 0.09 + i * lh; const head = i < 2; g.font = `${head ? 'bold ' : ''}${(head ? lh * 0.8 : lh * 0.56) | 0}px ${head ? SERIF : MONO}`;
    if (head) { if (k < n) { g.fillStyle = '#1e2448'; g.textAlign = 'center'; g.fillText(s.slice(0, Math.max(0, n - k)), w / 2, y); } k += s.length; tip = [0.5, y / h]; return; }
    g.textAlign = 'left'; const cw = g.measureText('M').width; for (let c = 0; c < s.length; c++, k++) { if (k >= n) { if (k === n) tip = [(x0 + c * cw) / w, y / h]; continue; } const R = Math.sin(k * 12.9898) * 43758.5453 % 1; g.fillStyle = `rgba(24,22,40,${0.78 + 0.22 * Math.abs(R)})`; g.fillText(s[c], x0 + c * cw, y + (Math.abs(R) - 0.5) * 1.2); }
    if (k <= n) tip = [(x0 + s.length * cw) / w, y / h]; });
  return tip;
}
function replyPage(g, w, h, t) { PT.paper(g, w, h, { base: '#f4eedd', seed: 13 }); const L = REPLY, N = L.reduce((a, s) => a + glyphCount(s), 0); let left = Math.round(t * N), tip = null;
  g.strokeStyle = 'rgba(120,140,190,0.18)'; g.lineWidth = 1; for (let i = 0; i < 16; i++) { g.beginPath(); g.moveTo(w * 0.06, h * (0.12 + i * 0.056)); g.lineTo(w * 0.94, h * (0.12 + i * 0.056)); g.stroke(); }
  L.forEach((s, i) => { if (left <= 0) return; const r = hand(g, s, w * (i === 0 ? 0.6 : 0.08), h * (0.1 + i * 0.07), h * 0.05, { n: left, seed: 30 + i, col: '#1a2468', wob: 0.1 }); left -= r.drawn; tip = r.tip; });
  return tip ? [tip[0] / w, tip[1] / h] : [0.1, 0.1];
}
function envelopeTex(g, w, h) { PT.paper(g, w, h, { base: '#eee4cc', seed: 17 });
  g.fillStyle = '#c8b48a'; g.fillRect(w * 0.82, h * 0.08, w * 0.12, h * 0.22); g.strokeStyle = '#8a3a3a'; g.lineWidth = 3; g.strokeRect(w * 0.83, h * 0.1, w * 0.1, h * 0.18); // plain stamp
  g.strokeStyle = 'rgba(60,40,60,0.6)'; g.lineWidth = 2; for (let i = 0; i < 4; i++) { g.beginPath(); for (let x = 0; x < w * 0.16; x += 4) g.lineTo(w * 0.66 + x, h * (0.12 + i * 0.05) + Math.sin(x * 0.2) * 2); g.stroke(); }
  g.font = `${(h * 0.075) | 0}px ${MONO}`; g.fillStyle = '#20203a'; g.textAlign = 'left'; ['Professor Albert Einstein', '112 Mercer Street', 'Princeton, New Jersey'].forEach((s, i) => g.fillText(s, w * 0.3, h * (0.55 + i * 0.1)));
  g.font = `bold ${(h * 0.05) | 0}px ${SERIF}`; g.fillText('EMBASSY OF ISRAEL', w * 0.05, h * 0.1); g.font = `${(h * 0.045) | 0}px ${SERIF}`; g.fillText('Washington, D.C.', w * 0.05, h * 0.17); }
// chalkboard: prewritten field-equation scribbles + a line written by setChalk(t)
const CHALK_LINE = 'g_{ik} = g_{(ik)} + g_{[ik]}  →  ?';
function boardBase(g, w, h) { g.fillStyle = '#26302c'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.85 + 0.3 * fbm(u, v, 5, 4, 4, 7));
  g.globalAlpha = 0.1; g.fillStyle = '#d8e0dc'; const R = rng(5); for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(R() * w, R() * h, 40 + R() * 120, 12 + R() * 30, R() * 3, 0, TAU); g.fill(); } g.globalAlpha = 1; // old erasures
  const C = { chalk: true, col: 'rgba(244,244,236,0.92)', wob: 0.16 }, s = h * 0.075;
  hand(g, 'R_{μν} − ½ g_{μν} R = 8πG T_{μν}', w * 0.05, h * 0.14, s, { ...C, seed: 1 });
  hand(g, 'Γ^{λ}_{μν} = ½ g^{λσ}(∂_{μ}g_{σν} + ∂_{ν}g_{σμ} − ∂_{σ}g_{μν})', w * 0.05, h * 0.29, s * 0.82, { ...C, seed: 2 });
  hand(g, 'ds² = g_{μν} dx^{μ} dx^{ν}', w * 0.05, h * 0.43, s, { ...C, seed: 3 });
  hand(g, 'δ ∫ √−g  R d⁴x = 0', w * 0.52, h * 0.43, s, { ...C, seed: 4 });
  hand(g, 'Γ^{i}_{kl} ≠ Γ^{i}_{lk}  ?', w * 0.05, h * 0.58, s * 0.9, { ...C, seed: 5 });
  g.strokeStyle = 'rgba(244,244,236,0.85)'; g.lineWidth = 3; g.beginPath(); g.arc(w * 0.72, h * 0.62, h * 0.08, 0, TAU); g.stroke(); // little curved-space doodle
  g.beginPath(); g.moveTo(w * 0.6, h * 0.5); g.quadraticCurveTo(w * 0.72, h * 0.7, w * 0.86, h * 0.52); g.stroke(); g.beginPath(); g.moveTo(w * 0.86, h * 0.52); g.lineTo(w * 0.84, h * 0.56); g.moveTo(w * 0.86, h * 0.52); g.lineTo(w * 0.82, h * 0.52); g.stroke();
  g.lineWidth = 2; g.beginPath(); g.moveTo(w * 0.04, h * 0.66); g.lineTo(w * 0.5, h * 0.66); g.stroke();
  hand(g, 'E=mc²', w * 0.85, h * 0.93, s * 0.55, { ...C, seed: 9 }); g.lineWidth = 1.5; g.strokeRect(w * 0.84, h * 0.88, w * 0.12, h * 0.075); // the corner gag
  grain(g, w, h, '#26302c', 5000, 8, 0.5);
}
function clockFace(g, w, h, o = {}) { g.fillStyle = o.face || '#f4ecd8'; g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, TAU); g.fill();
  g.strokeStyle = INK; g.lineWidth = w * 0.02; g.beginPath(); g.arc(w / 2, h / 2, w * 0.47, 0, TAU); g.stroke();
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, r0 = i % 5 ? 0.42 : 0.37; g.lineWidth = i % 5 ? w * 0.006 : w * 0.018; g.beginPath(); g.moveTo(w / 2 + Math.sin(a) * w * r0, h / 2 - Math.cos(a) * w * r0); g.lineTo(w / 2 + Math.sin(a) * w * 0.45, h / 2 - Math.cos(a) * w * 0.45); g.stroke(); }
  for (let i = 1; i <= 12; i++) { const a = i / 12 * TAU; txt(g, String(i), w / 2 + Math.sin(a) * w * 0.3, h / 2 - Math.cos(a) * w * 0.3, w * 0.12, w * 0.09, { col: INK }); } }
function flagTex(g, w, h) { g.fillStyle = '#f6f6f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f4aa8'; g.fillRect(0, h * 0.1, w, h * 0.15); g.fillRect(0, h * 0.75, w, h * 0.15);
  g.strokeStyle = '#1f4aa8'; g.lineWidth = h * 0.035; const cx = w / 2, cy = h / 2, r = h * 0.2; for (const k of [0, 1]) { g.beginPath(); for (let i = 0; i < 3; i++) { const a = (i / 3 + k / 6) * TAU - Math.PI / 2; i ? g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); g.stroke(); }
  modulate(g, w, h, (u, v) => 0.95 + 0.06 * fbm(u, v, 6, 4, 3, 2)); }
function mapTex(g, w, h) { g.fillStyle = '#e8d8b0'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.86 + 0.18 * fbm(u, v, 4, 4, 4, 3)); const R = rng(8);
  g.fillStyle = '#b8c8b8'; g.fillRect(w * 0.04, h * 0.05, w * 0.92, h * 0.9);
  g.fillStyle = '#d8c490'; for (const [cx, cy, rx, ry] of [[0.2, 0.3, 0.12, 0.16], [0.28, 0.65, 0.06, 0.18], [0.52, 0.3, 0.1, 0.1], [0.55, 0.6, 0.08, 0.2], [0.75, 0.3, 0.17, 0.14], [0.85, 0.72, 0.07, 0.06]]) { g.beginPath(); for (let a = 0; a < TAU; a += 0.2) { const k = 0.75 + 0.35 * R(); g.lineTo(w * (cx + Math.cos(a) * rx * k), h * (cy + Math.sin(a) * ry * k)); } g.closePath(); g.fill(); g.strokeStyle = '#6a5a3a'; g.lineWidth = 2; g.stroke(); }
  g.strokeStyle = 'rgba(80,70,60,0.35)'; g.lineWidth = 1; for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(w * i / 8, h * 0.05); g.lineTo(w * i / 8, h * 0.95); g.stroke(); g.beginPath(); g.moveTo(w * 0.04, h * i / 8); g.lineTo(w * 0.96, h * i / 8); g.stroke(); }
  g.strokeStyle = '#6a3a2a'; g.lineWidth = 3; g.beginPath(); g.arc(w * 0.12, h * 0.82, h * 0.06, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(w * 0.12, h * 0.72); g.lineTo(w * 0.12, h * 0.92); g.moveTo(w * 0.06, h * 0.82); g.lineTo(w * 0.18, h * 0.82); g.stroke(); }
function tileTex(g, w, h) { const n = 4, s = w / n, c = ['#c8b898', '#9a8e9a', '#b8806a', '#e8dcc0', '#5a6a5a'];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = i * s, y = j * s; g.fillStyle = c[3]; g.fillRect(x, y, s, s); g.fillStyle = c[1]; g.beginPath(); g.moveTo(x + s / 2, y + s * 0.1); g.lineTo(x + s * 0.9, y + s / 2); g.lineTo(x + s / 2, y + s * 0.9); g.lineTo(x + s * 0.1, y + s / 2); g.fill();
    g.fillStyle = c[2]; g.beginPath(); g.arc(x + s / 2, y + s / 2, s * 0.17, 0, TAU); g.fill(); g.fillStyle = c[0]; for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { g.beginPath(); g.arc(x + a * s, y + b * s, s * 0.2, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(60,40,50,0.5)'; g.lineWidth = 2; g.strokeRect(x, y, s, s); }
  modulate(g, w, h, (u, v) => 0.86 + 0.18 * fbm(u, v, 4, 4, 3, 5)); }
function portraitTex(g, w, h) { const gr = g.createRadialGradient(w / 2, h * 0.4, 10, w / 2, h / 2, w * 0.7); gr.addColorStop(0, '#e8dcc0'); gr.addColorStop(1, '#a8987a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a3040'; g.beginPath(); g.ellipse(w * 0.5, h * 0.38, w * 0.2, h * 0.17, 0, 0, TAU); g.fill(); // head (stylized silhouette, 3/4)
  g.beginPath(); g.moveTo(w * 0.1, h); g.quadraticCurveTo(w * 0.14, h * 0.6, w * 0.5, h * 0.58); g.quadraticCurveTo(w * 0.86, h * 0.6, w * 0.9, h); g.fill();
  g.fillStyle = '#f0ece0'; g.beginPath(); g.moveTo(w * 0.42, h * 0.6); g.lineTo(w * 0.5, h * 0.75); g.lineTo(w * 0.58, h * 0.6); g.fill(); // collar
  modulate(g, w, h, (u, v) => 0.9 + 0.12 * fbm(u, v, 5, 5, 3, 4)); }
function glowTex(g, w, h) { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
function leafTex(g, w, h) { g.clearRect(0, 0, w, h); mapleLeaf(g, w / 2, h / 2, w * 0.46, 0, '#ffffff'); g.strokeStyle = 'rgba(80,60,60,0.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2, h * 0.9); g.lineTo(w / 2, h * 0.15); g.stroke(); }
function crownTex(g, w, h) { g.fillStyle = '#c8a070'; g.fillRect(0, 0, w, h); const R = rng(41); for (let i = 0; i < 700; i++) { const v = 0.75 + R() * 0.4, c = Math.round(255 * Math.min(1, v)); mapleLeaf(g, R() * w, R() * h, 7 + R() * 9, R() * 6, `rgb(${c},${Math.round(c * (0.82 + R() * 0.18))},${Math.round(c * 0.8)})`); } }
function lawnTex(g, w, h) { PT.grass(g, w, h, { seed: 61 }); const R = rng(62); for (let i = 0; i < 260; i++) mapleLeaf(g, R() * w, R() * h, 4 + R() * 5, R() * 6, LEAFC[(R() * LEAFC.length) | 0]); }
function concreteTex(g, w, h, o = {}) { g.fillStyle = o.base || '#c8c0b4'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.86 + 0.2 * fbm(u, v, 6, 6, 4, o.seed || 3)); grain(g, w, h, '#5a5050', 1500, 4, 0.2);
  if (o.joints) { g.strokeStyle = 'rgba(60,50,60,0.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 1); g.lineTo(w, 1); g.moveTo(1, 0); g.lineTo(1, h); g.stroke(); } }
function asphaltTex(g, w, h) { g.fillStyle = '#5a5660'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.85 + 0.25 * fbm(u, v, 8, 8, 4, 9)); grain(g, w, h, '#8a8690', 3000, 2, 0.4); grain(g, w, h, '#2a2630', 2000, 3, 0.4); }
function starTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0c0620'); gr.addColorStop(0.5, '#2a1450'); gr.addColorStop(1, '#0e0824'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  modulate(g, w, h, (u, v) => { const n = fbm(u, v, 4, 2, 5, 3); return [0.7 + 0.9 * n * n, 0.6 + 0.5 * n, 0.8 + 1.1 * n * n]; });
  const R = rng(77); for (let i = 0; i < 2600; i++) { const x = R() * w, y = R() * h, s = R() < 0.02 ? 2.6 : R() < 0.2 ? 1.5 : 0.8; g.fillStyle = `rgba(${220 + R() * 35},${210 + R() * 45},255,${0.4 + R() * 0.6})`; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill(); }
  for (let i = 0; i < 26; i++) { const x = R() * w, y = R() * h, s = 6 + R() * 6; g.strokeStyle = 'rgba(255,240,255,0.8)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - s, y); g.lineTo(x + s, y); g.moveTo(x, y - s); g.lineTo(x, y + s); g.stroke(); } }
function gridTex(g, w, h) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); const n = 8; for (let i = 0; i <= n; i++) { for (const [lw, a] of [[10, 0.12], [4, 0.35], [1.6, 1]]) { g.strokeStyle = `rgba(150,190,255,${a})`; g.lineWidth = lw; g.beginPath(); g.moveTo(i * w / n, 0); g.lineTo(i * w / n, h); g.moveTo(0, i * h / n); g.lineTo(w, i * h / n); g.stroke(); } } }
function planetTex(g, w, h) { const R = rng(91); for (let y = 0; y < h; y += 2) { const v = y / h, b = Math.sin(v * 26 + Math.sin(v * 9) * 2.5) * 0.5 + 0.5; g.fillStyle = b > 0.72 ? '#f0c8e8' : b > 0.4 ? '#9a7ae8' : b > 0.15 ? '#5a6ad8' : '#3a4ab0'; g.fillRect(0, y, w, 2); }
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(255,240,255,${0.15 + R() * 0.2})`; g.beginPath(); g.ellipse(R() * w, R() * h, 20 + R() * 60, 4 + R() * 6, 0, 0, TAU); g.fill(); } }
function ringTex(g, w, h) { g.clearRect(0, 0, w, h); for (let x = 0; x < w; x++) { const u = x / w, a = (Math.sin(u * 60) * 0.3 + 0.6) * Math.sin(Math.PI * u); g.fillStyle = `rgba(${230 - u * 40},${210 + u * 30},255,${Math.max(0, a)})`; g.fillRect(x, 0, 1, h); } }
const BOOKC = [0x7a2a24, 0x2a3a5a, 0x3a5a3a, 0x8a6a3a, 0x5a2a3a, 0xa88a5a, 0x2a2a30, 0x6a4a2a, 0x9a3a2a, 0x3a4a6a, 0xc8b890, 0x4a3a2a, 0xd8cca8, 0x5a6a7a];

// ---------------------------------------------------------------- materials
let M;
function materials() {
  const vc = (o = {}) => toon({ vertexColors: true, ...o }), T = (w, h, fn, rep) => mkTex(w, h, fn, rep), m = {}, basic = (map, k = 1.25) => { const b = new THREE.MeshBasicMaterial({ map, fog: false }); b.color.setScalar(k); return b; };
  m.paint = vc(); m.metal = vc({ emissive: 0x0c0c12 }); m.brass = vc({ emissive: 0x2a1a06 });
  m.walnut = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 6, seed: 33, joints: 0 })) });
  m.panelS = vc({ map: T(512, 512, (g, w, h) => panelTex(g, w, h, { base: '#7a4a2c' }), [4, 1]) });
  m.panelE = vc({ map: T(512, 512, (g, w, h) => panelTex(g, w, h, { base: '#5a2a1c', seed: 71, ny: 3 }), [5, 1]) });
  m.floor = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#7a5236', n: 8, seed: 41 }), [4, 4]) });
  m.plaster = vc({ map: T(512, 512, plasterTex, [3, 2]) }); m.ceil = vc({ map: T(512, 512, (g, w, h) => plasterTex(g, w, h, { base: '#b8a894' }), [3, 2]) }); m.ceil.color.setScalar(0.55); m.whitewash = vc({ map: T(512, 512, (g, w, h) => plasterTex(g, w, h, { base: '#f2ead8', seed: 9 }), [3, 2]) });
  m.rugS = vc({ map: T(512, 512, rugTex) }); m.rugE = vc({ map: T(512, 512, (g, w, h) => rugTex(g, w, h, { cols: ['#2a3a5a', '#7a2a2a', '#d8c090', '#ece0c0', '#3a4a3a'] })) });
  m.paper = vc({ map: T(256, 256, (g, w, h) => PT.paper(g, w, h, {})) }); m.leather = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#7a3a2a' })) });
  m.fabric = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#e8e0d0' })) });
  m.glass = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0d0).multiplyScalar(1.9), fog: false }); m.amber = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb050).multiplyScalar(1.7), fog: false });
  m.shaft = new THREE.MeshBasicMaterial({ color: 0xfff0c8, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  m.glow = new THREE.MeshBasicMaterial({ map: T(128, 128, glowTex), color: 0xffc070, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  m.autumn = basic(T(1024, 768, autumnView), 1.3); m.dc = basic(T(1024, 768, dcView), 1.3); m.jlm = basic(T(1024, 768, jerusalemView), 1.12);
  const dyn = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const em = (map, e = 0x241c14, o = {}) => { const x = toon({ map, emissive: e, ...o }); x.emissiveMap = map; return x; };
  m.board = em(dyn(1400, 900), 0x303030); m.reply = em(dyn(700, 900), 0x2a2418, { side: THREE.DoubleSide }); m.typed = em(dyn(700, 900), 0x2a2418, { side: THREE.DoubleSide });
  m.ebanLetter = em(T(700, 900, (g, w, h) => typedPage(g, w, h, 1)), 0x2a2418, { side: THREE.DoubleSide });
  m.envelope = em(T(800, 440, envelopeTex), 0x241c14); m.envIn = toon({ color: 0xd8ccb0, side: THREE.DoubleSide });
  m.siding = vc({ map: T(512, 512, (g, w, h) => PT.siding(g, w, h, { base: '#f4f0e6', n: 14, seed: 5 }), [4, 4]) });
  m.sidingY = vc({ map: T(512, 512, (g, w, h) => PT.siding(g, w, h, { base: '#e8d8a8', n: 14, seed: 6 }), [4, 4]) }); m.sidingB = vc({ map: T(512, 512, (g, w, h) => PT.siding(g, w, h, { base: '#b8c4cc', n: 14, seed: 7 }), [4, 4]) });
  m.shingle = vc({ map: T(512, 512, (g, w, h) => PT.shingles(g, w, h, { base: '#5a5462' }), [4, 4]) }); m.brick = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#9a4a3a' }), [2, 2]) });
  m.stone = vc({ map: T(512, 512, (g, w, h) => PT.stone(g, w, h, { base: '#a89a88' }), [2, 1]) });
  m.lawn = toon({ map: T(512, 512, lawnTex, [14, 14]) }); if (MACRO) MACRO(m.lawn, 0.22, 0.06);
  m.walk = toon({ map: T(256, 256, (g, w, h) => concreteTex(g, w, h, { joints: true }), [12, 1]) }); m.asphalt = toon({ map: T(512, 512, asphaltTex, [8, 2]) }); if (MACRO) MACRO(m.asphalt, 0.15, 0.08);
  m.crown = vc({ map: T(512, 512, crownTex, [2, 2]), emissive: 0x7a3810 }); m.bark = vc({ map: T(256, 256, (g, w, h) => PT.bark(g, w, h, { base: '#6a5048' }), [2, 3]) });
  m.leaf = toon({ map: T(64, 64, leafTex), alphaTest: 0.5, side: THREE.DoubleSide });
  m.winGlow = basic(T(256, 256, (g, w, h) => sky(g, w, h, '#ffe4b0', '#d8a888', '#6a5a7a')), 1.05);
  m.drape = vc({ map: T(256, 512, (g, w, h) => { PT.fabric(g, w, h, { base: '#2a4a48' }); modulate(g, w, h, (u) => 0.75 + 0.35 * Math.abs(Math.sin(u * 30))); }), side: THREE.DoubleSide });
  m.sheer = toon({ color: 0xf4ecd8, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
  m.flag = toon({ map: T(660, 480, flagTex), side: THREE.DoubleSide }); m.map = em(T(1024, 720, mapTex), 0x1a140a);
  m.nameplate = em(T(512, 96, (g, w, h) => { g.fillStyle = '#d8b060'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a5a20'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12); txt(g, 'AMBASSADOR', w / 2, h / 2 + 2, w * 0.86, h * 0.56, { col: '#2a1a10' }); }), 0x3a2a10);
  m.tiles = vc({ map: T(512, 512, tileTex, [9, 9]) }); m.dado = vc({ map: T(256, 256, (g, w, h) => plasterTex(g, w, h, { base: '#9aa88e', seed: 4 }), [4, 1]) });
  m.portrait = em(T(400, 500, portraitTex), 0x1a140c); m.shutter = vc({ map: T(128, 256, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,0.35)'; for (let y = 0; y < h; y += 12) g.fillRect(0, y, w, 4); }) });
  m.mailNum = em(T(256, 128, (g, w, h) => { g.fillStyle = '#2a3a2a'; g.fillRect(0, 0, w, h); txt(g, '112', w / 2, h / 2 + 4, w * 0.8, h * 0.72, { col: '#f0e8d0' }); }), 0x101010);
  m.clock = em(T(512, 512, clockFace), 0x2a2418); m.clockV = em(T(512, 512, (g, w, h) => clockFace(g, w, h, { face: '#ece4ff' })), 0x2a2440);
  m.stars = new THREE.MeshBasicMaterial({ map: T(2048, 1024, starTex), side: THREE.BackSide, fog: false, depthWrite: false }); m.stars.color.setScalar(1.45);
  m.grid = new THREE.MeshBasicMaterial({ map: T(512, 512, gridTex, [10, 10]), color: 0xb8a0ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  m.gridFloor = new THREE.MeshBasicMaterial({ color: 0x1a0c36, fog: false, side: THREE.DoubleSide });
  m.planet = toon({ map: T(512, 256, planetTex), emissive: 0x1a1240 }); m.ring = new THREE.MeshBasicMaterial({ map: T(512, 16, ringTex), transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, color: 0xe8dcff });
  m.beam = new THREE.MeshBasicMaterial({ color: 0xfff2c8, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  m.beamCore = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfffaf0).multiplyScalar(2.2), fog: false });
  m.chalkStick = toon({ color: 0xf4f4ec, emissive: 0x404040 });
  return m;
}
const eqMat = (s, col = '#e8d8ff') => { const t = mkTex(1024, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.shadowColor = col; g.shadowBlur = 24; hand(g, s, 40, h * 0.66, h * 0.42, { col, seed: s.length, wob: 0.06, upright: true }); g.shadowBlur = 0; hand(g, s, 40, h * 0.66, h * 0.42, { col: '#ffffff', seed: s.length, wob: 0.06, upright: true }); });
  return new THREE.MeshBasicMaterial({ map: t, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false, opacity: 0.9 }); };

// ---------------------------------------------------------------- kit pieces
function books(K, x0, x1, y, zf, depth, R, o = {}) { // a row of books standing on a shelf, spines toward +z at zf
  let x = x0 + 0.01; const hmax = o.hmax || 0.3;
  while (x < x1 - 0.04) { const r = R();
    if (r > 0.93) { x += 0.04 + R() * 0.12; continue; }
    if (r > 0.86) { const n = 2 + ((R() * 4) | 0), w = 0.18 + R() * 0.07; if (x + w > x1) break; let yy = y; for (let k = 0; k < n; k++) { const h = 0.03 + R() * 0.03; K.put(M.paint, BOX(), x + w / 2 + (R() - 0.5) * 0.02, yy + h / 2, zf - depth / 2, 0, (R() - 0.5) * 0.12, 0, w - R() * 0.03, h, depth * (0.8 + R() * 0.2), BOOKC[(R() * BOOKC.length) | 0]); yy += h; } x += w + 0.01; continue; }
    const w = 0.025 + R() * 0.045, h = hmax * (0.62 + R() * 0.38), d = depth * (0.72 + R() * 0.26), c = BOOKC[(R() * BOOKC.length) | 0], lean = R() < 0.05 ? 0.18 : 0;
    K.put(M.paint, BOX(), x + w / 2 + lean * h * 0.5, y + h / 2, zf - d / 2, 0, 0, -lean, w, h, d, c);
    if (R() < 0.4) for (const f of [0.82, 0.16]) K.put(M.paint, BOX(), x + w / 2, y + h * f, zf - d + d + 0.002, 0, 0, 0, w * 1.01, 0.01, 0.004, 0xd8b060);
    x += w + 0.002 + lean * h * 0.6; }
}
function bookcase(K, w, h, d, rows, R, col, o = {}) { // local: x -w/2..w/2, back z=-d, front z=0
  K.box(M.walnut, -w / 2, -w / 2 + 0.04, 0, h, -d, 0, col, 0.008); K.box(M.walnut, w / 2 - 0.04, w / 2, 0, h, -d, 0, col, 0.008); K.box(M.walnut, -w / 2, w / 2, h - 0.05, h, -d, 0.02, col, 0.008);
  K.box(M.walnut, -w / 2, w / 2, 0, 0.1, -d, 0.01, col, 0.008); K.box(M.walnut, -w / 2, w / 2, 0, h, -d - 0.02, -d, col, 0.004);
  const rh = (h - 0.15) / rows; for (let i = 0; i < rows; i++) { const y = 0.1 + i * rh; if (i) K.box(M.walnut, -w / 2 + 0.04, w / 2 - 0.04, y - 0.025, y, -d, 0, col, 0.006); if (!(o.skip && o.skip(i))) books(K, -w / 2 + 0.04, w / 2 - 0.04, y, -0.02, d - 0.04, R, { hmax: Math.min(0.32, rh - 0.05) }); }
}
function pile(K, x, y, z, n, R, w = 0.3, d = 0.22, ry = 0) { for (let k = 0; k < n; k++) { const t = 0.004 + R() * 0.004; K.put(M.paper, BOX(), x + (R() - 0.5) * 0.03, y + t / 2, z + (R() - 0.5) * 0.03, 0, ry + (R() - 0.5) * 0.25, 0, w, t, d, [0xf4eedc, 0xece4cc, 0xf8f4e8, 0xe4dcc4][(R() * 4) | 0]); y += t; } return y; }
function bookStack(K, x, y, z, n, R, ry = 0) { for (let k = 0; k < n; k++) { const t = 0.035 + R() * 0.035, w = 0.2 + R() * 0.1; K.put(M.paint, BOX(), x + (R() - 0.5) * 0.03, y + t / 2, z + (R() - 0.5) * 0.03, 0, ry + (R() - 0.5) * 0.3, 0, w, t, w * 0.72, BOOKC[(R() * BOOKC.length) | 0]); y += t; } return y; }
function deskBody(K, w, d, h, col, mat = M.walnut) { // pedestal desk, local front edge toward +z
  K.box(mat, -w / 2 - 0.03, w / 2 + 0.03, h - 0.04, h, -d / 2 - 0.03, d / 2 + 0.03, col, 0.012);
  for (const s of [-1, 1]) { K.box(mat, s * w / 2 - (s > 0 ? 0.48 : 0), s * w / 2 + (s < 0 ? 0.48 : 0), 0.04, h - 0.04, -d / 2 + 0.02, d / 2 - 0.02, col, 0.01);
    for (let i = 0; i < 3; i++) { const y0 = 0.08 + i * (h - 0.16) / 3, cx = s * (w / 2 - 0.24); K.box(mat, cx - 0.2, cx + 0.2, y0 + 0.02, y0 + (h - 0.16) / 3 - 0.02, d / 2 - 0.02, d / 2 + 0.005, col, 0.008); K.put(M.brass, cyl(0.012, 0.012, 0.04, 8), cx, y0 + (h - 0.16) / 6, d / 2 + 0.02, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8b060); } }
  K.box(mat, -w / 2 + 0.48, w / 2 - 0.48, h - 0.16, h - 0.04, d / 2 - 0.04, d / 2, col, 0.008); K.box(mat, -w / 2 + 0.5, w / 2 - 0.5, 0.1, h - 0.16, -d / 2 + 0.02, -d / 2 + 0.05, col, 0.006);
  for (const s of [-1, 1]) K.box(mat, s * w / 2 - 0.5, s * w / 2 + 0.5, 0, 0.05, -d / 2, d / 2, col, 0.01);
}
function chair(K, x, z, ry, col, o = {}) { K.at(x, 0, z, ry, () => { const sh = o.seat || 0.46, mat = o.leather ? M.leather : M.walnut;
  for (const [a, b] of [[-0.22, -0.2], [0.22, -0.2], [-0.22, 0.2], [0.22, 0.2]]) K.beam(M.walnut, [a, 0, b], [a, sh, b], 0.04, col);
  K.box(mat, -0.26, 0.26, sh, sh + 0.08, -0.24, 0.24, o.seatCol || col, 0.03); K.box(mat, -0.26, 0.26, sh + 0.08, sh + (o.back || 0.55), -0.26, -0.2, o.seatCol || col, 0.03);
  if (o.arms) for (const s of [-1, 1]) { K.box(M.walnut, s * 0.26 - 0.03, s * 0.26 + 0.03, sh + 0.25, sh + 0.29, -0.24, 0.22, col, 0.01); K.beam(M.walnut, [s * 0.26, sh, 0.18], [s * 0.26, sh + 0.25, 0.18], 0.03, col); } }); }
function phone(K, x, y, z, ry) { K.at(x, y, z, ry, () => { const c = 0x18161e; K.box(M.paint, -0.1, 0.1, 0, 0.07, -0.11, 0.1, c, 0.03); K.put(M.paint, cyl(0.06, 0.06, 0.012, 20), 0, 0.075, 0.02, 0.35, 0, 0, 1, 1, 1, 0xe8e4dc); K.put(M.paint, tor(0.05, 0.008, 6, 20), 0, 0.083, 0.023, Math.PI / 2 + 0.35, 0, 0, 1, 1, 1, c);
  K.box(M.paint, -0.12, 0.12, 0.1, 0.13, -0.1, -0.05, c, 0.015); for (const s of [-1, 1]) K.put(M.paint, sph(0.035, 10, 8), s * 0.11, 0.1, -0.075, 0, 0, 0, 1, 0.8, 1.2, c); }); }
function lampDesk(K, x, y, z, glassMat, o = {}) { K.at(x, y, z, 0, () => { K.put(M.brass, cyl(0.08, 0.1, 0.03, 18), 0, 0.015, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); K.beam(M.brass, [0, 0.03, 0], [0, 0.38, 0], 0.012, 0xc8a050, true, 8);
  K.put(o.shadeMat || M.paint, lathe('lshade' + (o.k || ''), [[0.05, 0.16], [0.08, 0.14], [0.15, 0], [0.155, -0.01]], 18), 0, 0.36, 0, 0, 0, 0, 1, 1, 1, o.shade || 0xe8d4a8); }); }
function maple(K, x, z, s, R, pal, KC = K) { const ry = R() * 6; K.at(x, 0, z, ry, () => { K.put(M.bark, cyl(0.16, 0.26, 3.4, 10), 0, 1.7, 0, 0, 0, 0, s, s, s, 0x8a7068);
  for (let i = 0; i < 5; i++) { const a = i * 1.26 + R(), e = [Math.cos(a) * 1.5 * s, (2.7 + R() * 1.6) * s, Math.sin(a) * 1.5 * s]; K.beam(M.bark, [0, 2.4 * s, 0], e, 0.08 * s, 0x7a6058, true, 6); } });
  KC.at(x, 0, z, ry, () => { for (let i = 0; i < 34; i++) { const a = R() * TAU, r = Math.sqrt(R()) * 2.2 * s, y = (3.4 + R() * 2.4) * s - r * 0.35, k = (0.7 + R() * 0.6) * s; KC.put(M.crown, lumpGeo(i % 5), Math.cos(a) * r, y, Math.sin(a) * r, R(), R(), 0, k, k, k, pal[(R() * pal.length) | 0]); } }); }

// ================================================================= STUDY
function buildStudy(root) {
  const R = rng(112), K = new Kit(), X0 = -4, X1 = 4, Z0 = -3.6, Z1 = 5, H = 3.1;
  mesh(root, plane(X1 - X0, Z1 - Z0), M.floor, 0, 0, (Z0 + Z1) / 2, -Math.PI / 2, 0, 0, false); mesh(root, plane(X1 - X0, Z1 - Z0), M.ceil, 0, H, (Z0 + Z1) / 2, Math.PI / 2, 0, 0, false);
  const WX0 = -2.9, WX1 = -1.1, WY0 = 0.85, WY1 = 2.55;
  const wall = (x0, x1, y0, y1, z, mat) => mesh(root, plane(x1 - x0, y1 - y0), mat, (x0 + x1) / 2, (y0 + y1) / 2, z, 0, 0, 0, false);
  wall(X0, WX0, 0, H, Z0, M.panelS); wall(WX1, X1, 0, H, Z0, M.panelS); wall(WX0, WX1, 0, WY0, Z0, M.panelS); wall(WX0, WX1, WY1, H, Z0, M.panelS);
  for (const s of [-1, 1]) mesh(root, plane(Z1 - Z0, H), M.panelS, s * X1, H / 2, (Z0 + Z1) / 2, 0, -s * Math.PI / 2, 0, false);
  mesh(root, plane(X1 - X0, H), M.panelS, 0, H / 2, Z1, 0, Math.PI, 0, false);
  K.box(M.walnut, X0, X1, H - 0.16, H, Z0, Z0 + 0.1, 0x5a3420, 0.01); K.box(M.walnut, X0, X1, 0, 0.14, Z0, Z0 + 0.04, 0x4a2a18, 0.01);
  // window: autumn backdrop (parallax), 6-over-6 sash, sill, sheer curtains, shaft
  mesh(root, plane(9, 6), M.autumn, (WX0 + WX1) / 2 - 0.4, 1.9, Z0 - 3.5, 0, 0, 0, false);
  for (let i = 0; i <= 3; i++) K.box(M.paint, WX0 + i * (WX1 - WX0) / 3 - 0.025, WX0 + i * (WX1 - WX0) / 3 + 0.025, WY0, WY1, Z0 - 0.05, Z0 + 0.03, 0xf0e8d8, 0.006);
  for (let i = 0; i <= 4; i++) { const y = WY0 + i * (WY1 - WY0) / 4, t = i === 2 ? 0.05 : 0.025; K.box(M.paint, WX0, WX1, y - t, y + t, Z0 - 0.05, Z0 + 0.03, 0xf0e8d8, 0.006); }
  K.box(M.paint, WX0 - 0.12, WX1 + 0.12, WY0 - 0.07, WY0, Z0, Z0 + 0.2, 0xf0e8d8, 0.01); for (const x of [WX0 - 0.1, WX1 + 0.1]) K.box(M.paint, x - 0.06, x + 0.06, WY0, WY1 + 0.1, Z0, Z0 + 0.06, 0xf0e8d8, 0.006); K.box(M.paint, WX0 - 0.16, WX1 + 0.16, WY1, WY1 + 0.12, Z0, Z0 + 0.07, 0xf0e8d8, 0.006);
  K.put(M.paint, cyl(0.08, 0.06, 0.12, 12), WX0 + 0.3, WY0 + 0.06, Z0 + 0.1, 0, 0, 0, 1, 1, 1, 0xa8583a); for (let k = 0; k < 7; k++) K.put(M.paint, sph(0.05, 8, 6), WX0 + 0.3 + (R() - 0.5) * 0.12, WY0 + 0.16 + R() * 0.12, Z0 + 0.1 + (R() - 0.5) * 0.1, 0, 0, 0, 1, 1, 1, 0x4a6a3a); // plant
  for (const s of [-1, 1]) { const c = mesh(root, foldGeo(0.55, WY1 - WY0 + 0.4, 4, 0.04, 'sheer'), M.sheer, s < 0 ? WX0 + 0.05 : WX1 - 0.05, WY1 + 0.25, Z0 + 0.14, 0, 0, 0, false); c.renderOrder = 2; nond(c); }
  K.beam(M.brass, [WX0 - 0.4, WY1 + 0.26, Z0 + 0.15], [WX1 + 0.4, WY1 + 0.26, Z0 + 0.15], 0.012, 0xc8a050, true, 6);
  const shafts = []; for (let i = 0; i < 3; i++) { const s = nond(mesh(root, plane(0.55, 4.5), M.shaft, WX0 + 0.35 + i * 0.58, 1.3, Z0 + 1.6, -1.0, -0.15, 0, false)); s.renderOrder = 3; shafts.push(s); }
  // bookcases: back wall right, left wall, narrow one left of the window
  K.at(1.95, 0, Z0 + 0.02 + 0.36, 0, () => bookcase(K, 2.7, 2.75, 0.36, 7, R, 0x5a3420));
  K.at(X0 + 0.38, 0, -1.6, Math.PI / 2, () => bookcase(K, 3.6, 2.75, 0.36, 7, R, 0x5a3420));
  K.at(X0 + 0.38, 0, 2.2, Math.PI / 2, () => bookcase(K, 1.8, 1.6, 0.36, 4, R, 0x5a3420));
  // violin case leaning in the back-right corner
  K.at(0.42, 0, Z0 + 0.2, 0.15, () => { const c = 0x2a1e1a; K.put(M.leather, lathe('vcase', [[0, 0], [0.14, 0.02], [0.17, 0.12], [0.13, 0.3], [0.09, 0.42], [0.1, 0.55], [0.13, 0.66], [0.08, 0.78], [0, 0.8]], 16), 0, 0, 0, -0.18, 0, 0, 1, 1, 0.55, c);
    K.put(M.brass, sph(0.02, 8, 6), 0, 0.42, 0.06, 0, 0, 0, 1, 1, 1, 0xd8b060); K.beam(M.paint, [0, 0.6, 0.06], [0, 0.7, 0.07], 0.02, 0x1a1418); });
  // the big desk (faces +z), chair behind
  const DX = -0.3, DZ = -1.25, DH = 0.76; K.at(DX, 0, DZ, 0, () => deskBody(K, 1.9, 0.95, DH, 0x6a3e24));
  chair(K, DX, DZ - 0.85, 0, 0x4a2a18, { leather: true, seatCol: 0x6a2e22, back: 0.62, arms: true });
  K.at(DX, DH, DZ, 0, () => { // desk top clutter
    K.box(M.leather, -0.42, 0.32, 0, 0.006, -0.3, 0.3, 0x5a7a5a, 0.003); // blotter
    pile(K, -0.52, 0, -0.3, 22, R, 0.3, 0.22, 0.2); pile(K, 0.66, 0, -0.26, 34, R, 0.3, 0.24, -0.15); pile(K, -0.12, 0, -0.38, 9, R, 0.32, 0.22, 0.1); pile(K, 0.28, 0, -0.32, 6, R, 0.26, 0.2, -0.5);
    bookStack(K, 0.74, 0.17, -0.26, 3, R); bookStack(K, -0.82, 0, 0.06, 4, R, 0.4);
    K.put(M.paint, cyl(0.07, 0.07, 0.015, 18), -0.6, 0.008, 0.33, 0, 0, 0, 1, 1, 1, 0x3a3a44); K.put(M.paint, cyl(0.065, 0.05, 0.012, 18), -0.6, 0.016, 0.33, 0, 0, 0, 1, 1, 1, 0x5a5a66); // ashtray
    K.at(-0.6, 0.03, 0.33, 2.4, () => { K.put(M.walnut, cyl(0.024, 0.018, 0.05, 12), 0.06, 0.01, 0, 0, 0, 0, 1, 1, 1, 0x5a2e1a); K.beam(M.paint, [0.06, 0.0, 0], [-0.11, 0.03, 0], 0.008, 0x1a1418, true, 6); }); // pipe resting in the tray
    K.put(M.leather, sph(0.07, 12, 8), -0.4, 0.02, 0.38, 0, 0.5, 0, 1.3, 0.35, 0.9, 0x6a4a2a); // tobacco pouch
    K.put(M.paint, cyl(0.03, 0.035, 0.05, 12), -0.56, 0.025, 0.12, 0, 0, 0, 1, 1, 1, 0x1a1a2a); // inkwell
    K.put(M.metal, tor(0.025, 0.004, 6, 16), 0.12, 0.01, 0.38, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2a30); K.put(M.metal, tor(0.025, 0.004, 6, 16), 0.18, 0.01, 0.38, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2a30); // spectacles
    for (let k = 0; k < 4; k++) K.put(M.paper, BOX(), 0.36 + k * 0.04, 0.008 + k * 0.002, -0.08 + k * 0.025, 0, 0.3 * k - 0.4, 0, 0.18, 0.003, 0.1, 0xe8dcc0); // a few letters
  });
  lampDesk(K, DX - 0.8, DH, DZ - 0.25, M.glass, { shade: 0xf0dca8 }); const lampGlow = nond(mesh(root, plane(0.9, 0.9), M.glow, DX - 0.8, DH + 0.33, DZ - 0.25, 0, 0, 0, false)); lampGlow.renderOrder = 4;
  mesh(root, sph(0.04, 10, 8), M.glass, DX - 0.8, DH + 0.36, DZ - 0.25, 0, 0, 0, false);
  // the envelope (opens) + Eban's letter inside + the reply sheet on the blotter
  const env = new THREE.Group(); env.position.set(DX + 0.5, DH + 0.012, DZ + 0.22); env.rotation.y = -0.22; root.add(env);
  const eW = 0.24, eH = 0.13; mesh(env, plane(eW, eH), M.envelope, 0, 0.002, 0, -Math.PI / 2, 0, 0, false); mesh(env, plane(eW, eH), M.envIn, 0, 0.0005, 0, Math.PI / 2, 0, 0, false);
  const flapG = new THREE.Group(); flapG.position.set(0, 0.004, -eH / 2); env.add(flapG); // hinge at the far edge
  const fs = new THREE.Shape(); fs.moveTo(-eW / 2, 0); fs.lineTo(eW / 2, 0); fs.lineTo(0, eH * 0.6); fs.closePath(); const flap = mesh(flapG, new THREE.ShapeGeometry(fs), M.envIn, 0, 0, 0, Math.PI / 2, 0, 0, false);
  const inner = mesh(env, plane(eW * 0.92, eH * 1.6), M.ebanLetter, 0, 0.0012, 0, -Math.PI / 2, 0, 0, false); inner.visible = false;
  const reply = mesh(root, plane(0.21, 0.27), M.reply, DX - 0.06, DH + 0.016, DZ + 0.03, -Math.PI / 2, 0, 0, false); reply.rotation.set(-Math.PI / 2, 0, 0.06);
  const pen = new THREE.Group(); root.add(pen); { const pk = new Kit(); pk.beam(M.brass, [0, 0, 0], [0, 0.02, 0], 0.003, 0xd8b060, true, 4); pk.beam(M.paint, [0, 0.02, 0], [0, 0.14, 0], 0.007, 0x1a1418, true, 8); pk.build(pen); }
  // cathedral radio on a small side table (front left)
  K.at(-3.1, 0, 0.9, 0.7, () => { K.box(M.walnut, -0.3, 0.3, 0.62, 0.66, -0.25, 0.25, 0x6a3e24, 0.01); for (const [a, b] of [[-0.26, -0.21], [0.26, -0.21], [-0.26, 0.21], [0.26, 0.21]]) K.beam(M.walnut, [a, 0, b], [a, 0.62, b], 0.035, 0x5a3420);
    K.box(M.walnut, -0.18, 0.18, 0.66, 0.92, -0.11, 0.11, 0x7a4426, 0.02); K.put(M.walnut, cyl(0.18, 0.18, 0.22, 20, false), 0, 0.92, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x7a4426);
    K.put(M.fabric, cyl(0.12, 0.12, 0.01, 18), 0, 0.88, 0.11, Math.PI / 2, 0, 0, 1, 1, 1, 0x8a7458); for (let k = -2; k <= 2; k++) K.box(M.walnut, k * 0.045 - 0.008, k * 0.045 + 0.008, 0.78, 1.0 - Math.abs(k) * 0.02, 0.11, 0.125, 0x5a3018, 0.003);
    for (const x of [-0.11, 0, 0.11]) K.put(M.paint, cyl(0.02, 0.02, 0.03, 10), x, 0.71, 0.12, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a1a14); });
  const dial = mesh(root, cyl(0.03, 0.03, 0.005, 14), M.amber, 0, 0, 0, Math.PI / 2, 0, 0, false); { const g = new THREE.Group(); g.position.set(-3.1, 0, 0.9); g.rotation.y = 0.7; root.add(g); g.add(dial); dial.position.set(0, 0.76, 0.125); }
  // worn leather armchair + floor piles + rug + wall frames
  K.at(-2.2, 0, 2.4, 0.9, () => { const c = 0x6a2e22; K.box(M.leather, -0.45, 0.45, 0.1, 0.45, -0.4, 0.4, c, 0.08); K.box(M.leather, -0.45, 0.45, 0.45, 1.05, -0.45, -0.25, c, 0.08); for (const s of [-1, 1]) K.box(M.leather, s * 0.45 - 0.12, s * 0.45 + 0.03, 0.1, 0.68, -0.42, 0.4, c, 0.06); K.box(M.fabric, -0.32, 0.32, 0.45, 0.55, -0.25, 0.35, 0x7a3a2a, 0.04); });
  for (const [x, z, n] of [[0.9, -0.6, 40], [1.15, -0.35, 26], [-1.5, -0.4, 30], [1.7, 1.6, 18], [-1.2, 1.2, 14]]) pile(K, x, 0, z, n, R, 0.32, 0.24, R() * 3);
  bookStack(K, 1.0, 0, -0.95, 7, R); bookStack(K, -1.25, 0, -2.9, 11, R, 0.3); bookStack(K, -0.95, 0, -3.05, 8, R, 1.1); bookStack(K, -1.7, 0, 0.1, 5, R, 0.5); bookStack(K, 3.3, 0, -1.2, 9, R, 0.2);
  mesh(root, plane(3.6, 2.6), M.rugS, -0.2, 0.004, -0.4, -Math.PI / 2, 0, 0, false);
  for (const [x, y, w, h] of [[-3.42, 2.4, 0.5, 0.4], [-0.55, 1.95, 0.42, 0.52]]) { const zz = x < -3 ? Z0 + 0.02 : Z0 + 0.02; if (x < -3) continue; K.box(M.walnut, x - w / 2, x + w / 2, y - h / 2, y + h / 2, zz, zz + 0.03, 0x2a1a14, 0.01); K.box(M.paper, x - w / 2 + 0.05, x + w / 2 - 0.05, y - h / 2 + 0.05, y + h / 2 - 0.05, zz + 0.03, zz + 0.035, 0xd8ccb0, 0.002); }
    // chalkboard on an easel (setChalk) + chalk tray
  const CB = [1.75, 0, 0.05], CRY = -0.5, bw = 1.5, bh = 0.98, by = 1.5;
  K.at(CB[0], 0, CB[2], CRY, () => { for (const s of [-1, 1]) K.beam(M.walnut, [s * 0.62, 0, 0.18], [s * 0.5, 2.2, -0.02], 0.045, 0x7a5232); K.beam(M.walnut, [0, 0, -0.65], [0, 2.1, -0.05], 0.045, 0x7a5232);
    K.box(M.walnut, -bw / 2 - 0.05, bw / 2 + 0.05, by - bh / 2 - 0.05, by + bh / 2 + 0.05, -0.04, 0, 0x8a5a36, 0.01);
    K.box(M.walnut, -bw / 2, bw / 2, by - bh / 2 - 0.09, by - bh / 2 - 0.05, -0.02, 0.07, 0x8a5a36, 0.006); for (let k = 0; k < 3; k++) K.put(M.paint, cyl(0.007, 0.007, 0.06, 6), -0.4 + k * 0.1, by - bh / 2 - 0.042, 0.03, 0, 0, Math.PI / 2, 1, 1, 1, 0xf0f0e8);
    K.box(M.fabric, 0.35, 0.5, by - bh / 2 - 0.05, by - bh / 2 - 0.02, 0, 0.06, 0x8a7a6a, 0.01); }); // eraser
  const cbg = new THREE.Group(); cbg.position.set(CB[0], 0, CB[2]); cbg.rotation.y = CRY; root.add(cbg);
  const board = mesh(cbg, plane(bw, bh), M.board, 0, by, 0.003, 0, 0, 0, false);
  const chalk = mesh(cbg, cyl(0.007, 0.007, 0.06, 6), M.chalkStick, 0, 0, 0, 0, 0, 0.8, false); chalk.visible = false;
  K.build(root);
  return { shafts, env, flapG, inner, reply, pen, board, cbg, chalk, bw, bh, by, lampGlow, dial };
}

// ================================================================= HOUSE (exterior)
function buildHouse(root, leavesOut) {
  const R = rng(1952), K = new Kit(), KC = new Kit();
  mesh(root, plane(80, 50), M.lawn, 0, 0, -18, -Math.PI / 2, 0, 0, false);
  mesh(root, plane(80, 1.6), M.walk, 0, 0.03, 4.1, -Math.PI / 2, 0, 0, false); K.box(M.paint, -40, 40, 0, 0.15, 4.9, 5.1, 0xb8b0a4, 0.02); // sidewalk + curb
  mesh(root, plane(80, 9), M.asphalt, 0, -0.02, 9.6, -Math.PI / 2, 0, 0, false); mesh(root, plane(80, 12), M.lawn, 0, 0, 20, -Math.PI / 2, 0, 0, false); K.box(M.paint, -40, 40, 0, 0.15, 14.0, 14.2, 0xb8b0a4, 0.02);
  mesh(root, plane(1.1, 5.4), M.walk, 0, 0.025, 0.4, -Math.PI / 2, 0, 0, false); // front path
  // house body: front facade z=-6, x -4.5..4.5, depth to -15, eaves y=6.6 (foundation 0.6)
  const FZ = -6, BZ = -15, HW = 4.5, EY = 6.6, RY = 9.1;
  mesh(root, plane(HW * 2, EY - 0.6), M.siding, 0, (EY + 0.6) / 2, FZ, 0, 0, 0, true); for (const s of [-1, 1]) mesh(root, plane(BZ - FZ < 0 ? FZ - BZ : 9, EY - 0.6), M.siding, s * HW, (EY + 0.6) / 2, (FZ + BZ) / 2, 0, s * Math.PI / 2, 0, true);
  K.box(M.paint, -HW, HW, 0.6, EY, BZ, FZ - 0.02, 0xf0ece4, 0.01); // core (fills behind the siding planes)
  K.box(M.stone, -HW - 0.05, HW + 0.05, 0, 0.62, BZ, FZ + 0.06, 0x9a8a80, 0.02); // foundation
  const ped = K.put(M.paint, prismGeo(HW * 2 + 0.6, RY - EY, 0.3), 0, EY, FZ + 0.05, 0, 0, 0, 1, 1, 1, 0xf4f0e8); K.put(M.paint, prismGeo(HW * 2 + 0.6, RY - EY, 0.3), 0, EY, BZ, 0, 0, 0, 1, 1, 1, 0xf4f0e8);
  const ang = Math.atan2(RY - EY, HW + 0.4), sl = Math.hypot(RY - EY, HW + 0.4) + 0.25;
  for (const s of [-1, 1]) { K.cb(M.shingle, sl, 0.14, BZ - FZ < 0 ? 9.8 : 9.8, s * (HW + 0.4) / 2, (EY + RY) / 2 + 0.08, (FZ + BZ) / 2, 0x6a6474, 0, 0, -s * ang, 0.02); K.cb(M.paint, sl, 0.18, 0.12, s * (HW + 0.4) / 2, (EY + RY) / 2 + 0.02, FZ + 0.32, 0xf4f0e8, 0, 0, -s * ang, 0.02); }
  K.box(M.paint, -HW - 0.4, HW + 0.4, EY - 0.45, EY + 0.05, FZ + 0.02, FZ + 0.32, 0xf4f0e8, 0.02); // Greek-revival frieze / entablature
  for (const s of [-1, 1]) { K.box(M.paint, s * HW - 0.25, s * HW + 0.25, 0.6, EY - 0.45, FZ - 0.02, FZ + 0.12, 0xf4f0e8, 0.02); K.box(M.paint, -HW - 0.4, HW + 0.4, EY - 0.45, EY + 0.05, BZ, FZ, 0xf4f0e8, 0.02); } // corner pilasters + side frieze
  K.box(M.paint, -0.45, 0.45, EY + 0.6, EY + 1.25, FZ + 0.1, FZ + 0.2, 0x2a2430, 0.02); for (let k = 0; k < 5; k++) K.box(M.paint, -0.42, 0.42, EY + 0.66 + k * 0.12, EY + 0.7 + k * 0.12, FZ + 0.18, FZ + 0.24, 0xf0ece4, 0.005); // attic louver
  K.box(M.brick, 2.3, 3.1, 4, RY + 1.2, -11.4, -10.6, 0xb05a44, 0.02); K.box(M.paint, 2.2, 3.2, RY + 1.2, RY + 1.35, -11.5, -10.5, 0x5a4a4a, 0.02); // chimney
  // windows + black shutters + door
  const win = (x, y0, y1, w = 1.0) => { const z = FZ + 0.03; mesh(root, plane(w, y1 - y0), M.winGlow, x, (y0 + y1) / 2, z, 0, 0, 0, false);
    for (let i = 0; i <= 2; i++) K.box(M.paint, x - w / 2 + i * w / 2 - 0.025, x - w / 2 + i * w / 2 + 0.025, y0, y1, z, z + 0.05, 0xf8f4ec, 0.005); for (let i = 0; i <= 4; i++) { const y = y0 + i * (y1 - y0) / 4; K.box(M.paint, x - w / 2, x + w / 2, y - 0.025, y + 0.025, z, z + 0.05, 0xf8f4ec, 0.005); }
    K.box(M.paint, x - w / 2 - 0.12, x + w / 2 + 0.12, y1, y1 + 0.2, z, z + 0.1, 0xf8f4ec, 0.01); K.box(M.paint, x - w / 2 - 0.1, x + w / 2 + 0.1, y0 - 0.08, y0, z, z + 0.14, 0xf8f4ec, 0.01);
    for (const s of [-1, 1]) K.box(M.shutter, x + s * (w / 2 + 0.1) - 0.27, x + s * (w / 2 + 0.1) + 0.27, y0 - 0.02, y1 + 0.02, z, z + 0.06, 0x1e1a26, 0.01); };
  for (const x of [-2.75, 2.75]) win(x, 1.4, 3.3); for (const x of [-2.75, 0, 2.75]) win(x, 4.1, 5.8);
  for (const zz of [-8.5, -12.5]) for (const s of [-1, 1]) { const g = mesh(root, plane(1.0, 1.9), M.winGlow, s * (HW + 0.02), 2.35, zz, 0, s * Math.PI / 2, 0, false); for (const dz of [-0.75, 0.75]) K.box(M.shutter, s * HW - 0.03, s * HW + 0.05, 1.38, 3.32, zz + dz - 0.26, zz + dz + 0.26, 0x1e1a26, 0.01); }
  K.box(M.paint, -0.5, 0.5, 0.62, 2.85, FZ, FZ + 0.06, 0x2a2232, 0.02); for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) K.box(M.paint, -0.4 + i * 0.43, -0.03 + i * 0.43, 0.8 + j * 0.65, 1.35 + j * 0.65, FZ + 0.06, FZ + 0.08, 0x3a3044, 0.01); // panelled black door
  for (const s of [-1, 1]) { mesh(root, plane(0.32, 2.0), M.winGlow, s * 0.75, 1.75, FZ + 0.03, 0, 0, 0, false); K.box(M.paint, s * 0.75 - 0.2, s * 0.75 + 0.2, 0.62, 2.9, FZ, FZ + 0.02, 0xf8f4ec, 0.005); }
  mesh(root, plane(1.8, 0.4), M.winGlow, 0, 3.1, FZ + 0.03, 0, 0, 0, false); K.box(M.paint, -1.1, 1.1, 2.85, 2.92, FZ, FZ + 0.08, 0xf8f4ec, 0.005); K.box(M.paint, -1.1, 1.1, 3.3, 3.45, FZ, FZ + 0.12, 0xf8f4ec, 0.005);
  K.put(M.brass, sph(0.035, 8, 6), 0.35, 1.7, FZ + 0.1, 0, 0, 0, 1, 1, 1, 0xd8b060);
  // portico: deck, 4 Doric columns, entablature + low pediment, balustrade, steps
  const PZ = FZ + 2.4; K.box(M.walnut, -3.8, 3.8, 0.5, 0.62, FZ, PZ, 0xb8b0a8, 0.01); K.box(M.stone, -3.8, 3.8, 0, 0.5, FZ, PZ, 0x8a8088, 0.02);
  for (const x of [-3.3, -1.15, 1.15, 3.3]) { K.put(M.paint, cyl(0.17, 0.21, 2.9, 16), x, 0.62 + 1.45, PZ - 0.25, 0, 0, 0, 1, 1, 1, 0xf6f2ea); K.box(M.paint, x - 0.26, x + 0.26, 0.62, 0.74, PZ - 0.51, PZ + 0.01, 0xf0ece4, 0.01); K.box(M.paint, x - 0.26, x + 0.26, 3.52, 3.64, PZ - 0.51, PZ + 0.01, 0xf0ece4, 0.01); }
  K.box(M.paint, -3.9, 3.9, 3.64, 4.05, FZ, PZ + 0.08, 0xf4f0e8, 0.02); K.put(M.paint, prismGeo(7.9, 0.9, 0.25), 0, 4.05, PZ - 0.05, 0, 0, 0, 1, 1, 1, 0xf4f0e8);
  for (const s of [-1, 1]) K.cb(M.shingle, 4.2, 0.1, 2.6, s * 1.95, 4.5, PZ - 1.2, 0x6a6474, 0, 0, -s * 0.22, 0.02);
  for (const [a, b] of [[-3.3, -1.15], [1.15, 3.3]]) { K.box(M.paint, a, b, 1.42, 1.5, PZ - 0.3, PZ - 0.2, 0xf6f2ea, 0.01); K.box(M.paint, a, b, 0.7, 0.78, PZ - 0.3, PZ - 0.2, 0xf6f2ea, 0.01); for (let x = a + 0.15; x < b - 0.05; x += 0.16) K.put(M.paint, lathe('bal', [[0.02, 0], [0.035, 0.08], [0.025, 0.3], [0.04, 0.5], [0.02, 0.64]], 8), x, 0.78, PZ - 0.25, 0, 0, 0, 1, 1, 1, 0xf6f2ea); }
  for (let i = 0; i < 3; i++) K.box(M.stone, -1.0, 1.0, 0, 0.5 - i * 0.17, PZ + i * 0.32, PZ + (i + 1) * 0.32, 0xa8a0a0, 0.02);
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) K.put(M.paint, lumpGeo(k), s * (2.2 + k * 0.45), 0.35, FZ + 2.65 + (k % 2) * 0.1, 0, R(), 0, 0.42, 0.4, 0.38, 0x4a6a3a); // foundation shrubs
  // picket fence + gate
  for (let x = -14; x <= 14; x += 0.15) { if (Math.abs(x) < 0.6) continue; K.box(M.paint, x - 0.04, x + 0.04, 0, 0.95, 2.97, 3.03, 0xf6f2ea, 0.008); K.put(M.paint, prismGeo(0.08, 0.08, 0.06), x, 0.95, 3.0, 0, 0, 0, 1, 1, 1, 0xf6f2ea); }
  for (const y of [0.3, 0.75]) for (const s of [-1, 1]) K.box(M.paint, s * 0.6, s * 14, y - 0.04, y + 0.04, 2.9, 2.96, 0xf0ece4, 0.01);
  for (const s of [-1, 1]) { K.box(M.paint, s * 0.6 - 0.07, s * 0.6 + 0.07, 0, 1.2, 2.93, 3.07, 0xf6f2ea, 0.01); K.put(M.paint, sph(0.08, 10, 8), s * 0.6, 1.26, 3.0, 0, 0, 0, 1, 1, 1, 0xf6f2ea); }
  K.at(-0.53, 0, 3.0, 0.9, () => { for (let x = 0.07; x < 1.05; x += 0.15) { K.box(M.paint, x - 0.04, x + 0.04, 0.05, 0.92, -0.03, 0.03, 0xf6f2ea, 0.008); K.put(M.paint, prismGeo(0.08, 0.08, 0.06), x, 0.92, 0, 0, 0, 0, 1, 1, 1, 0xf6f2ea); } for (const y of [0.3, 0.72]) K.box(M.paint, 0, 1.08, y - 0.04, y + 0.04, -0.07, -0.03, 0xf0ece4, 0.01); }); // gate, ajar
  // the 1950s curbside mailbox "112"
  const MB = [2.5, 0, 4.72]; K.at(MB[0], 0, MB[2], 0, () => { K.box(M.walnut, -0.05, 0.05, 0, 1.0, -0.05, 0.05, 0x5a4a3a, 0.01); K.box(M.walnut, -0.14, 0.14, 0.98, 1.03, -0.28, 0.24, 0x5a4a3a, 0.01);
    K.box(M.metal, -0.11, 0.11, 1.03, 1.17, -0.27, 0.25, 0x7a8a84, 0.01); K.put(M.metal, cyl(0.11, 0.11, 0.52, 18, false), 0, 1.17, -0.01, Math.PI / 2, 0, 0, 1, 1, 1, 0x7a8a84); // rounded-top box
    K.box(M.metal, -0.115, 0.115, 1.03, 1.27, 0.25, 0.27, 0x6a7a74, 0.01); K.put(M.metal, sph(0.02, 8, 6), 0, 1.24, 0.28, 0, 0, 0, 1, 1, 1, 0xc8c8d0); // door + latch
    K.box(M.paint, 0.115, 0.13, 1.1, 1.14, -0.26, -0.08, 0xc8302a, 0.004); K.box(M.paint, 0.115, 0.13, 1.1, 1.32, -0.12, -0.08, 0xc8302a, 0.004); }); // red flag (up)
  mesh(root, plane(0.2, 0.09), M.mailNum, MB[0] + 0.113, 1.12, MB[2] + 0.11, 0, Math.PI / 2, 0, false);
  // maples (yard, street strip, behind) + neighbours + far tree band
  const PAL = [[0xf89a40, 0xe8702e, 0xffc050], [0xe85a32, 0xf08a3a, 0xd84a2e], [0xffd050, 0xf8b040, 0xf09a34]];
  for (const [x, z, s, p] of [[-6.0, -1.0, 1.05, 0], [6.6, -2.2, 0.95, 2], [-9.5, 6.3, 1.0, 2], [10.5, 6.3, 0.9, 0], [-12.5, -15, 1.2, 1], [12, -18, 1.2, 2], [-3, -22, 1.3, 0], [5, -24, 1.2, 1]]) maple(K, x, z, s, R, PAL[p], KC);
  for (const [x, mat, c] of [[-17, M.sidingY, 0xe8d8a8], [17.5, M.sidingB, 0xb8c4cc]]) { const z0 = -7, z1 = -16, w = 3.8; mesh(root, plane(w * 2, 5.4), mat, x, 2.7, z0 + 0.01, 0, 0, 0, true); K.box(M.paint, x - w, x + w, 0, 5.4, z1, z0, c, 0.01);
    for (const s of [-1, 1]) K.cb(M.shingle, w + 0.6, 0.12, 9.4, x + s * w / 2, 6.3, (z0 + z1) / 2, 0x5a5462, 0, 0, -s * 0.5, 0.02); K.put(M.paint, prismGeo(w * 2, 1.9, 0.2), x, 5.4, z0 + 0.05, 0, 0, 0, 1, 1, 1, c);
    for (const dx of [-2, 2]) for (const y of [1.4, 3.8]) { mesh(root, plane(0.9, 1.4), M.winGlow, x + dx, y + 0.7, z0 + 0.03, 0, 0, 0, false); for (const s of [-1, 1]) K.box(M.paint, x + dx + s * 0.6 - 0.2, x + dx + s * 0.6 + 0.2, y, y + 1.4, z0, z0 + 0.05, 0x3a3a4a, 0.01); } }
  for (let i = 0; i < 30; i++) { const x = -40 + i * 2.8 + R() * 1.5, z = -36 - R() * 6, k = 2.5 + R() * 2; K.put(M.crown, lumpGeo(i % 5), x, 4 + R() * 3, z, R(), R(), 0, k, k * 1.1, k, PAL[i % 3][(R() * 3) | 0]); }
  // a lamppost on the planting strip
  K.at(-4.5, 0, 5.6, 0, () => { K.put(M.metal, cyl(0.05, 0.08, 3.6, 10), 0, 1.8, 0, 0, 0, 0, 1, 1, 1, 0x2a2a34); K.put(M.metal, lathe('lamph', [[0.02, 0.32], [0.08, 0.3], [0.22, 0.05], [0.24, 0]], 14), 0, 3.6, 0, 0, 0, 0, 1, 1, 1, 0x2a2a34); K.put(M.paint, sph(0.1, 10, 8), 0, 3.6, 0, 0, 0, 0, 1, 1, 1, 0xf8ecc8); });
  // ground leaf litter (static) + falling leaves (instanced, moved in tick)
  const litter = new THREE.InstancedMesh(plane(0.12, 0.12), M.leaf, 520), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s3 = new THREE.Vector3(1, 1, 1), c = new THREE.Color();
  for (let i = 0; i < 520; i++) { const near = i < 300, x = near ? (R() - 0.5) * 24 : (R() - 0.5) * 40, z = near ? -4 + R() * 9.6 : -6 + R() * 26; v.set(x, z > 4.9 && z < 14 ? -0.005 : 0.02 + R() * 0.01 + (z > 3.3 && z < 4.9 ? 0.02 : 0), z); q.setFromEuler(e.set(-Math.PI / 2 + (R() - 0.5) * 0.4, 0, R() * 6)); s3.setScalar(0.8 + R() * 0.6); m4.compose(v, q, s3); litter.setMatrixAt(i, m4); litter.setColorAt(i, c.set(LEAFC[(R() * LEAFC.length) | 0])); }
  litter.receiveShadow = true; root.add(litter);
  const N = 140, fall = new THREE.InstancedMesh(plane(0.11, 0.11), M.leaf, N); fall.castShadow = false; for (let i = 0; i < N; i++) { leavesOut.push([(R() - 0.5) * 22, R() * 8, -4 + R() * 14, R(), R() * 10]); fall.setColorAt(i, c.set(LEAFC[(R() * LEAFC.length) | 0])); } fall.frustumCulled = false; root.add(fall);
  K.build(root, 8); const cg = new THREE.Group(); root.add(cg); KC.build(cg, 8); cg.traverse((o) => { if (o.isMesh) o.receiveShadow = false; });
  return { fall, mailbox: MB };
}

// ================================================================= EMBASSY (Washington, 1952)
function buildEmbassy(root) {
  const R = rng(1117), K = new Kit(), X0 = -5, X1 = 5, Z0 = -4.5, Z1 = 5, H = 4.0;
  mesh(root, plane(X1 - X0, Z1 - Z0), M.floor, 0, 0, (Z0 + Z1) / 2, -Math.PI / 2, 0, 0, false); mesh(root, plane(X1 - X0, Z1 - Z0), M.ceil, 0, H, (Z0 + Z1) / 2, Math.PI / 2, 0, 0, false);
  const WINS = [-2.9, 2.9], ww = 1.5, WY0 = 0.75, WY1 = 3.35, wall = (x0, x1, y0, y1, z, mat) => mesh(root, plane(x1 - x0, y1 - y0), mat, (x0 + x1) / 2, (y0 + y1) / 2, z, 0, 0, 0, false);
  wall(X0, WINS[0] - ww / 2, 0, H, Z0, M.panelE); wall(WINS[0] + ww / 2, WINS[1] - ww / 2, 0, H, Z0, M.panelE); wall(WINS[1] + ww / 2, X1, 0, H, Z0, M.panelE);
  for (const x of WINS) { wall(x - ww / 2, x + ww / 2, 0, WY0, Z0, M.panelE); wall(x - ww / 2, x + ww / 2, WY1, H, Z0, M.panelE); }
  for (const s of [-1, 1]) mesh(root, plane(Z1 - Z0, H), M.panelE, s * X1, H / 2, (Z0 + Z1) / 2, 0, -s * Math.PI / 2, 0, false); mesh(root, plane(X1 - X0, H), M.panelE, 0, H / 2, Z1, 0, Math.PI, 0, false);
  K.box(M.walnut, X0, X1, H - 0.25, H, Z0, Z0 + 0.14, 0x3a1a10, 0.01); for (const s of [-1, 1]) K.box(M.walnut, s * X1 - 0.14, s * X1 + 0.14, H - 0.25, H, Z0, Z1, 0x3a1a10, 0.01); K.box(M.walnut, X0, X1, 0, 0.16, Z0, Z0 + 0.04, 0x2a120a, 0.01);
  mesh(root, plane(14, 8), M.dc, 0, 2.2, Z0 - 4.5, 0, 0, 0, false);
  const shafts = [];
  for (const x of WINS) { const x0 = x - ww / 2, x1 = x + ww / 2;
    for (let i = 0; i <= 2; i++) K.box(M.paint, x0 + i * ww / 2 - 0.03, x0 + i * ww / 2 + 0.03, WY0, WY1, Z0 - 0.05, Z0 + 0.03, 0xf0ece4, 0.006); for (let i = 0; i <= 5; i++) { const y = WY0 + i * (WY1 - WY0) / 5; K.box(M.paint, x0, x1, y - 0.025, y + 0.025, Z0 - 0.05, Z0 + 0.03, 0xf0ece4, 0.006); }
    K.box(M.walnut, x0 - 0.12, x1 + 0.12, WY0 - 0.08, WY0, Z0, Z0 + 0.22, 0x3a1a10, 0.01);
    for (const s of [-1, 1]) { const d = mesh(root, foldGeo(0.75, 3.75, 4, 0.07, 'drape'), M.drape, x + s * (ww / 2 + 0.22), 3.85, Z0 + 0.22, 0, 0, 0, true); d.scale.set(1, 1, 1); K.put(M.brass, tor(0.06, 0.012, 6, 14), x + s * (ww / 2 + 0.2), 1.25, Z0 + 0.3, Math.PI / 2, 0, 0, 1.8, 1, 1, 0xd8b060); }
    K.box(M.drape, x0 - 0.65, x1 + 0.65, 3.55, 3.95, Z0 + 0.12, Z0 + 0.34, 0x2a4a48, 0.04); K.box(M.brass, x0 - 0.65, x1 + 0.65, 3.53, 3.57, Z0 + 0.3, Z0 + 0.36, 0xd8b060, 0.01);
    K.box(M.metal, x0 + 0.1, x1 - 0.1, 0.15, 0.62, Z0 + 0.05, Z0 + 0.22, 0xc8c4bc, 0.02); for (let k = 0; k < 9; k++) K.box(M.metal, x0 + 0.15 + k * 0.14, x0 + 0.2 + k * 0.14, 0.15, 0.66, Z0 + 0.06, Z0 + 0.22, 0xb8b4ac, 0.01); // radiators
    for (let i = 0; i < 2; i++) { const s = nond(mesh(root, plane(0.6, 5.5), M.shaft, x - 0.35 + i * 0.7, 1.6, Z0 + 2.2, -1.05, 0.1, 0, false)); s.renderOrder = 3; shafts.push(s); } }
  // framed map (back wall, centre) + flag on a staff
  K.box(M.walnut, -0.95, 0.95, 1.6, 3.0, Z0 + 0.02, Z0 + 0.08, 0x2a140a, 0.01); K.box(M.brass, -0.88, 0.88, 1.67, 2.93, Z0 + 0.08, Z0 + 0.09, 0xc8a050, 0.004); mesh(root, plane(1.7, 1.18), M.map, 0, 2.3, Z0 + 0.1, 0, 0, 0, false);
  const FX = -1.55, FZ = Z0 + 0.55; K.at(FX, 0, FZ, 0, () => { K.put(M.brass, cyl(0.2, 0.24, 0.08, 18), 0, 0.04, 0, 0, 0, 0, 1, 1, 1, 0xb89040); K.put(M.walnut, cyl(0.022, 0.022, 2.55, 10), 0, 1.3, 0, 0, 0, 0, 1, 1, 1, 0x3a2418); K.put(M.brass, sph(0.045, 10, 8), 0, 2.6, 0, 0, 0, 0, 1, 1, 1, 0xd8b060); K.put(M.brass, cyl(0.0, 0.035, 0.12, 8), 0, 2.69, 0, 0, 0, 0, 1, 1, 1, 0xd8b060); });
  const flag = mesh(root, foldGeo(0.95, 0.7, 2.5, 0.05, 'flag'), M.flag, FX + 0.5, 2.5, FZ, 0, -0.25, 0.04, true);
  { const g = flag.geometry.clone(), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + 0.475; p.setY(i, p.getY(i) - 0.32 * x * x); } g.computeVertexNormals(); flag.geometry = g; } // droop away from the staff
  // the desk + chair + clutter
  const DZ = -1.7, DH = 0.78; K.at(0, 0, DZ, 0, () => deskBody(K, 2.2, 1.05, DH, 0x4a2214)); chair(K, 0, DZ - 0.9, 0, 0x2a140a, { leather: true, seatCol: 0x5a1e18, back: 0.8, arms: true });
  K.at(0, DH, DZ, 0, () => { K.box(M.leather, -0.5, 0.5, 0, 0.006, -0.32, 0.3, 0x2a4a38, 0.003); K.box(M.walnut, -0.52, 0.52, 0, 0.012, -0.32, -0.28, 0x2a140a, 0.003);
    K.at(0.05, 0, 0.2, 0, () => { K.box(M.paint, -0.18, 0.18, 0, 0.04, -0.07, 0.07, 0x1a1a22, 0.012); for (const s of [-1, 1]) { K.put(M.brass, cyl(0.016, 0.022, 0.04, 10), s * 0.1, 0.06, -0.01, 0, 0, 0, 1, 1, 1, 0xd8b060); K.beam(M.paint, [s * 0.1, 0.07, -0.01], [s * 0.1 + s * 0.04, 0.22, -0.06], 0.007, 0x1a1418, true, 8); K.beam(M.brass, [s * 0.1 + s * 0.04, 0.22, -0.06], [s * 0.1 + s * 0.045, 0.235, -0.065], 0.004, 0xd8b060, true, 6); } K.put(M.paint, cyl(0.03, 0.035, 0.04, 12), 0, 0.06, 0, 0, 0, 0, 1, 1, 1, 0x2a3a6a); }); // desk set: two fountain pens + inkwell
    pile(K, 0.72, 0, -0.1, 14, R, 0.3, 0.22, 0.1); K.box(M.walnut, -0.86, -0.5, 0, 0.07, -0.3, -0.02, 0x3a1a10, 0.01); pile(K, -0.68, 0.02, -0.16, 10, R, 0.3, 0.22, 0); // letter tray
    phone(K, 0.85, 0, 0.28, -0.4); bookStack(K, -0.85, 0, 0.25, 3, R, 0.2); K.box(M.paper, -0.2, 0.15, 0.007, 0.01, -0.12, 0.1, 0xf6f2e6, 0.001); });
  const plate = mesh(root, plane(0.46, 0.086), M.nameplate, 0, DH + 0.062, DZ + 0.423, -0.35, 0, 0, false); K.cb(M.walnut, 0.5, 0.1, 0.06, 0, DH + 0.05, DZ + 0.39, 0x2a140a, -0.35, 0, 0, 0.01);
  lampDesk(K, -0.75, DH, DZ - 0.3, M.glass, { shade: 0x2a5a3a, k: 'e' }); const lampGlow = nond(mesh(root, plane(0.8, 0.8), M.glow, -0.75, DH + 0.33, DZ - 0.3, 0, 0, 0, false)); lampGlow.renderOrder = 4; mesh(root, sph(0.035, 10, 8), M.glass, -0.75, DH + 0.34, DZ - 0.3, 0, 0, 0, false);
  // guest leather armchairs + rug + bookcase + globe + clock + sconces
  for (const [x, ry] of [[-1.3, 0.35], [1.3, -0.35]]) K.at(x, 0, 0.7, ry + Math.PI, () => { const c = 0x5a1e18; K.box(M.leather, -0.42, 0.42, 0.1, 0.45, -0.4, 0.4, c, 0.08); K.box(M.leather, -0.42, 0.42, 0.45, 1.0, -0.42, -0.24, c, 0.08); for (const s of [-1, 1]) K.box(M.leather, s * 0.42 - 0.12, s * 0.42 + 0.02, 0.1, 0.66, -0.42, 0.4, c, 0.06); for (const [a, b] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) K.put(M.brass, sph(0.03, 8, 6), a, 0.05, b, 0, 0, 0, 1, 1, 1, 0x2a140a); });
  mesh(root, plane(4.4, 3.4), M.rugE, 0, 0.004, -0.6, -Math.PI / 2, 0, 0, false);
  K.at(X1 - 0.4, 0, -1.2, -Math.PI / 2, () => bookcase(K, 2.6, 2.6, 0.4, 6, R, 0x3a1a10));
  K.at(3.6, 0, 2.4, 0, () => { for (let k = 0; k < 3; k++) { const a = k * 2.09; K.beam(M.walnut, [Math.cos(a) * 0.25, 0, Math.sin(a) * 0.25], [0, 0.65, 0], 0.03, 0x3a1a10); } K.put(M.paint, sph(0.28, 20, 14), 0, 0.98, 0, 0, 0, 0.4, 1, 1, 1, 0xc8b47a); K.put(M.brass, tor(0.31, 0.012, 6, 28, Math.PI * 1.4), 0, 0.98, 0, 0, Math.PI / 2, 0.4, 1, 1, 1, 0xc8a050); });
  for (const x of [-4.2, 4.2]) { K.put(M.brass, cyl(0.03, 0.05, 0.25, 10), x, 2.55, Z0 + 0.06, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8b060); K.put(M.paint, lathe('sconce', [[0, 0], [0.07, 0.02], [0.09, 0.14], [0.08, 0.16]], 12), x, 2.62, Z0 + 0.18, 0, 0, 0, 1, 1, 1, 0xf8f0d8); }
  K.put(M.walnut, cyl(0.22, 0.22, 0.05, 24), 0, 3.4, Z1 - 0.04, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a1a10);
  // the typing table + typewriter (keyboard faces +x; typist sits at +x looking -x)
  const TT = [-3.6, 0, 0.5], TH = 0.68; K.at(TT[0], 0, TT[2], 0, () => { K.box(M.walnut, -0.4, 0.4, TH - 0.04, TH, -0.55, 0.55, 0x4a2214, 0.01); for (const [a, b] of [[-0.36, -0.5], [0.36, -0.5], [-0.36, 0.5], [0.36, 0.5]]) K.beam(M.walnut, [a, 0, b], [a, TH - 0.04, b], 0.04, 0x3a1a10); pile(K, -0.1, TH, -0.38, 18, R, 0.22, 0.28, 0.05); pile(K, 0.0, TH, 0.4, 6, R, 0.22, 0.28, 0.2); });
  chair(K, TT[0] + 0.8, TT[2], -Math.PI / 2, 0x3a1a10, { back: 0.5 });
  K.at(X0 + 0.4, 0, -2.4, Math.PI / 2, () => bookcase(K, 2.2, 2.6, 0.4, 6, R, 0x3a1a10));
  K.box(M.walnut, X0 + 0.02, X0 + 0.06, 1.55, 2.35, 0.05, 0.95, 0x2a140a, 0.01); K.box(M.paper, X0 + 0.06, X0 + 0.07, 1.62, 2.28, 0.12, 0.88, 0xd8ccb0, 0.002); // framed print
  K.put(M.walnut, cyl(0.2, 0.2, 0.05, 24), X0 + 0.04, 2.75, 2.0, 0, 0, Math.PI / 2, 1, 1, 1, 0x3a1a10); K.put(M.paper, cyl(0.17, 0.17, 0.01, 24), X0 + 0.07, 2.75, 2.0, 0, 0, Math.PI / 2, 1, 1, 1, 0xf4ecd6); // wall clock
  const tw = new THREE.Group(); tw.position.set(TT[0], TH, TT[2]); tw.rotation.y = Math.PI / 2; root.add(tw); // local +z = toward the typist
  { const k = new Kit(), c = 0x1a1820; k.box(M.metal, -0.17, 0.17, 0, 0.08, -0.14, 0.12, c, 0.03); k.cb(M.metal, 0.34, 0.03, 0.16, 0, 0.08, 0.06, c, -0.35, 0, 0, 0.01); k.box(M.metal, -0.15, 0.15, 0.08, 0.14, -0.14, -0.04, c, 0.03);
    for (let r = 0; r < 4; r++) for (let i = 0; i < 10 - (r === 3 ? 3 : 0); i++) { const x = -0.13 + i * 0.029 + r * 0.008, z = 0.13 - r * 0.028, y = 0.07 + r * 0.012; k.beam(M.metal, [x, y - 0.03, z], [x, y, z], 0.003, 0x3a3a40); k.put(M.paint, cyl(0.011, 0.011, 0.006, 10), x, y, z, 0, 0, 0, 1, 1, 1, 0xe8e4dc); k.put(M.metal, tor(0.011, 0.002, 4, 10), x, y + 0.002, z, Math.PI / 2, 0, 0, 1, 1, 1, 0x8a8a92); }
    k.box(M.paint, -0.07, 0.07, 0.065, 0.075, 0.155, 0.17, 0xe8e4dc, 0.004); k.build(tw); }
  const carriage = new THREE.Group(); tw.add(carriage); { const k = new Kit(), c = 0x1a1820; k.put(M.paint, cyl(0.03, 0.03, 0.44, 16), 0, 0.17, -0.09, 0, 0, Math.PI / 2, 1, 1, 1, 0x101014); k.box(M.metal, -0.23, 0.23, 0.13, 0.15, -0.14, -0.05, c, 0.01); for (const s of [-1, 1]) k.put(M.paint, cyl(0.022, 0.022, 0.03, 14), s * 0.235, 0.17, -0.09, 0, 0, Math.PI / 2, 1, 1, 1, 0x2a2a30); k.beam(M.metal, [-0.24, 0.18, -0.09], [-0.29, 0.22, -0.02], 0.008, 0xb8b8c0); k.build(carriage); }
  const pageG = new THREE.Group(); pageG.position.set(0, 0.2, -0.11); pageG.rotation.x = -0.22; carriage.add(pageG); const page = mesh(pageG, new THREE.PlaneGeometry(0.216, 0.28), M.typed, 0, 0, 0, 0, 0, 0, false); // bottom edge at the strike line (geometry rebuilt in setTyping)
  K.build(root);
  return { shafts, flag, page, carriage, tw, plate, lampGlow, typist: [TT[0] + 0.8, 0, TT[2]] };
}

// ================================================================= JERUSALEM (Prime Minister's office)
function buildJerusalem(root) {
  const R = rng(5712), K = new Kit(), X0 = -4, X1 = 4, Z0 = -3.5, Z1 = 5, H = 3.3;
  mesh(root, plane(X1 - X0, Z1 - Z0), M.tiles, 0, 0, (Z0 + Z1) / 2, -Math.PI / 2, 0, 0, false); mesh(root, plane(X1 - X0, Z1 - Z0), M.whitewash, 0, H, (Z0 + Z1) / 2, Math.PI / 2, 0, 0, false);
  const WX0 = -2.7, WX1 = -0.9, WY0 = 0.9, WY1 = 2.75, DY = 1.15, wall = (x0, x1, y0, y1, z, mat) => mesh(root, plane(x1 - x0, y1 - y0), mat, (x0 + x1) / 2, (y0 + y1) / 2, z, 0, 0, 0, false);
  const wallSeg = (x0, x1, y0, y1) => { if (y0 < DY) wall(x0, x1, y0, Math.min(y1, DY), Z0, M.dado); if (y1 > DY) wall(x0, x1, Math.max(y0, DY), y1, Z0, M.whitewash); };
  wallSeg(X0, WX0, 0, H); wallSeg(WX1, X1, 0, H); wallSeg(WX0, WX1, 0, WY0); wallSeg(WX0, WX1, WY1, H);
  for (const s of [-1, 1]) { mesh(root, plane(Z1 - Z0, DY), M.dado, s * X1, DY / 2, (Z0 + Z1) / 2, 0, -s * Math.PI / 2, 0, false); mesh(root, plane(Z1 - Z0, H - DY), M.whitewash, s * X1, (H + DY) / 2, (Z0 + Z1) / 2, 0, -s * Math.PI / 2, 0, false); }
  mesh(root, plane(X1 - X0, H), M.whitewash, 0, H / 2, Z1, 0, Math.PI, 0, false);
  K.box(M.paint, X0, X1, DY - 0.02, DY + 0.02, Z0, Z0 + 0.012, 0x4a5a48, 0.002); for (const s of [-1, 1]) K.box(M.paint, s * X1 - 0.012, s * X1 + 0.012, DY - 0.02, DY + 0.02, Z0, Z1, 0x4a5a48, 0.002);
  mesh(root, plane(12, 7), M.jlm, -1.6, 1.8, Z0 - 5, 0, 0, 0, false);
  // deep window reveal, casement frames, green louvred shutters folded open outside
  for (const s of [-1, 1]) K.box(M.whitewash, s < 0 ? WX0 - 0.02 : WX1, s < 0 ? WX0 : WX1 + 0.02, WY0, WY1, Z0 - 0.35, Z0, 0xf0e8d8, 0.004);
  K.box(M.whitewash, WX0, WX1, WY1, WY1 + 0.02, Z0 - 0.35, Z0, 0xf0e8d8, 0.004); K.box(M.stone, WX0 - 0.08, WX1 + 0.08, WY0 - 0.06, WY0, Z0 - 0.35, Z0 + 0.12, 0xd8c8a8, 0.01);
  for (const s of [-1, 1]) { const x = s < 0 ? WX0 + 0.25 : WX1 - 0.25; K.at(x, 0, Z0 + 0.02, -s * 1.2, () => { K.box(M.paint, -0.22, 0.22, WY0, WY1, -0.02, 0.02, 0xece6d8, 0.006); K.box(M.paint, -0.18, 0.18, WY0 + 0.05, WY1 - 0.05, -0.01, 0.01, 0xb8d0d8, 0.002); K.box(M.paint, -0.22, 0.22, (WY0 + WY1) / 2 - 0.02, (WY0 + WY1) / 2 + 0.02, -0.02, 0.025, 0xece6d8, 0.004); });
    K.at(s < 0 ? WX0 - 0.15 : WX1 + 0.15, 0, Z0 - 0.4, s * 0.25, () => K.box(M.shutter, s < 0 ? -0.5 : 0, s < 0 ? 0 : 0.5, WY0 - 0.05, WY1 + 0.05, -0.02, 0.02, 0x3a6a4a, 0.006)); }
  const shafts = []; for (let i = 0; i < 3; i++) { const s = nond(mesh(root, plane(0.6, 4.6), M.shaft, WX0 + 0.3 + i * 0.6, 1.25, Z0 + 1.7, -1.0, -0.2, 0, false)); s.renderOrder = 3; shafts.push(s); }
  // portrait with mourning ribbon (above/behind the desk)
  const PX = 0.0, PY = 2.15, pw = 0.5, ph = 0.62; K.box(M.walnut, PX - pw / 2 - 0.06, PX + pw / 2 + 0.06, PY - ph / 2 - 0.06, PY + ph / 2 + 0.06, Z0 + 0.01, Z0 + 0.05, 0x4a3a28, 0.012); mesh(root, plane(pw, ph), M.portrait, PX, PY, Z0 + 0.052, 0, 0, 0, false);
  K.beam(M.paint, [PX - 0.2, PY + ph / 2 + 0.06, Z0 + 0.02], [PX, PY + ph / 2 + 0.3, Z0 + 0.012], 0.006, 0x3a2a20); K.beam(M.paint, [PX + 0.2, PY + ph / 2 + 0.06, Z0 + 0.02], [PX, PY + ph / 2 + 0.3, Z0 + 0.012], 0.006, 0x3a2a20);
  const ribbon = new THREE.Group(); root.add(ribbon); { const k = new Kit(), c = 0x121016; k.cb(M.fabric, 0.07, 0.42, 0.006, PX + pw / 2 - 0.08, PY + ph / 2 - 0.08, Z0 + 0.065, c, 0, 0, Math.PI / 4, 0.002);
    const bx = PX + pw / 2 - 0.02, byy = PY + ph / 2 + 0.0; for (const s of [-1, 1]) { k.put(M.fabric, sph(0.05, 10, 8), bx + s * 0.05, byy, Z0 + 0.08, 0, 0, s * 0.5, 1.2, 0.6, 0.35, c); k.cb(M.fabric, 0.035, 0.16, 0.006, bx + s * 0.03, byy - 0.1, Z0 + 0.075, c, 0, 0, s * 0.35, 0.002); } k.put(M.fabric, sph(0.022, 8, 6), bx, byy, Z0 + 0.085, 0, 0, 0, 1, 1, 0.6, c); k.build(ribbon); }
  // bookcases (back right + left wall) + stacks rising from the floor
  K.at(2.4, 0, Z0 + 0.36, 0, () => bookcase(K, 3.0, 2.9, 0.34, 8, R, 0x7a5a3a));
  K.at(X0 + 0.36, 0, -0.9, Math.PI / 2, () => bookcase(K, 3.2, 2.9, 0.34, 8, R, 0x7a5a3a));
  for (const [x, z, n] of [[1.4, -1.9, 22], [1.75, -1.6, 17], [-0.9, -2.6, 14], [3.4, -1.2, 26], [3.5, -0.6, 19], [-3.2, 1.6, 15], [-3.0, 2.1, 21], [2.9, 1.8, 12]]) bookStack(K, x, 0, z, n, R, R() * 3);
  // the plain desk: phone, books, papers, glasses, tea glass, lamp
  const DX = 0.3, DZ = -1.35, DH = 0.76; K.at(DX, 0, DZ, 0, () => { K.box(M.walnut, -0.85, 0.85, DH - 0.035, DH, -0.45, 0.45, 0x9a7048, 0.008); for (const [a, b] of [[-0.8, -0.4], [0.8, -0.4], [-0.8, 0.4], [0.8, 0.4]]) K.box(M.walnut, a - 0.03, a + 0.03, 0, DH - 0.035, b - 0.03, b + 0.03, 0x8a6040, 0.008); K.box(M.walnut, -0.8, 0.8, DH - 0.14, DH - 0.035, 0.38, 0.42, 0x8a6040, 0.006); K.box(M.walnut, 0.3, 0.8, 0.05, DH - 0.035, -0.4, 0.4, 0x8a6040, 0.008); });
  chair(K, DX, DZ - 0.75, 0, 0x6a4a2a, { back: 0.5 }); chair(K, DX - 0.6, DZ + 1.1, Math.PI - 0.3, 0x6a4a2a, { back: 0.45 });
  K.at(DX, DH, DZ, 0, () => { phone(K, 0.58, 0, 0.18, -0.3); bookStack(K, -0.68, 0, -0.25, 9, R, 0.3); bookStack(K, -0.66, 0, 0.18, 6, R, -0.2); bookStack(K, 0.7, 0, -0.28, 5, R); pile(K, -0.1, 0, 0.05, 12, R, 0.3, 0.22, 0.15); pile(K, 0.25, 0, -0.25, 8, R, 0.3, 0.22, -0.3);
    K.put(M.paint, cyl(0.028, 0.024, 0.08, 12), 0.3, 0.04, 0.22, 0, 0, 0, 1, 1, 1, 0xb8783a); K.put(M.metal, tor(0.022, 0.004, 6, 14), 0.08, 0.008, 0.3, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2a30); K.put(M.metal, tor(0.022, 0.004, 6, 14), 0.135, 0.008, 0.3, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2a30); });
  lampDesk(K, DX - 0.35, DH, DZ - 0.3, M.glass, { shade: 0xe8dcc0, k: 'j' }); mesh(root, sph(0.035, 10, 8), M.glass, DX - 0.35, DH + 0.34, DZ - 0.3, 0, 0, 0, false);
  // filing cabinet, coat stand + hat, water jug on a stool, ceiling fan (rotor animated)
  K.box(M.metal, X1 - 0.6, X1 - 0.05, 0, 1.3, 1.0, 1.55, 0x7a7e72, 0.02); for (let k = 0; k < 3; k++) { K.box(M.metal, X1 - 0.62, X1 - 0.6, 0.1 + k * 0.42, 0.45 + k * 0.42, 1.05, 1.5, 0x8a8e82, 0.01); K.box(M.brass, X1 - 0.64, X1 - 0.62, 0.32 + k * 0.42, 0.34 + k * 0.42, 1.2, 1.35, 0xb8b0a0, 0.004); }
  K.at(-3.2, 0, 3.6, 0, () => { K.beam(M.walnut, [0, 0, 0], [0, 1.8, 0], 0.03, 0x4a3420, true); for (let k = 0; k < 3; k++) { const a = k * 2.09; K.beam(M.walnut, [Math.cos(a) * 0.28, 0, Math.sin(a) * 0.28], [0, 0.4, 0], 0.02, 0x4a3420, true); } K.put(M.paint, cyl(0.1, 0.12, 0.12, 14), 0.08, 1.74, 0, 0, 0, 0.3, 1, 1, 1, 0x3a3a40); K.put(M.paint, cyl(0.17, 0.17, 0.01, 18), 0.08, 1.68, 0, 0, 0, 0.3, 1, 1, 1, 0x3a3a40); });
  K.beam(M.metal, [0, H, 0.5], [0, H - 0.4, 0.5], 0.02, 0xe8e0d0, true, 8); K.put(M.metal, cyl(0.09, 0.09, 0.14, 14), 0, H - 0.46, 0.5, 0, 0, 0, 1, 1, 1, 0xe8e0d0);
  const fan = new THREE.Group(); fan.position.set(0, H - 0.52, 0.5); root.add(fan); { const k = new Kit(); for (let i = 0; i < 4; i++) k.at(0, 0, 0, i * Math.PI / 2, () => k.box(M.walnut, 0.08, 0.72, -0.004, 0.004, -0.06, 0.06, 0x7a5232, 0.004)); k.build(fan); }
  K.build(root);
  return { shafts, ribbon, fan, portrait: [PX, PY, Z0 + 0.05] };
}

// ================================================================= COSMOS (dream space)
function buildCosmos(root) {
  const R = rng(1905), K = new Kit();
  nond(mesh(root, sph(90, 48, 24), M.stars, 0, 0, 0, 0, 0, 0, false)).renderOrder = -5;
  // spacetime fabric: a grid sheet sagging into a well under the planet
  const PL = [0.6, 0, -3]; const sheet = new THREE.PlaneGeometry(44, 44, 140, 140); sheet.rotateX(-Math.PI / 2); { const p = sheet.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) - PL[0], z = p.getZ(i) - PL[2], r2 = x * x + z * z; p.setY(i, -3.2 / (1 + r2 / 5.5)); } sheet.computeVertexNormals(); }
  const grid = nond(mesh(root, sheet, M.grid, 0, 0, 0, 0, 0, 0, false)); grid.renderOrder = 2; const gfloor = nond(mesh(root, sheet, M.gridFloor, 0, -0.04, 0, 0, 0, 0, false)); gfloor.renderOrder = 1;
  const planet = mesh(root, sph(1.5, 40, 24), M.planet, PL[0], -0.9, PL[2], 0.3, 0, 0.25, false);
  const ring = nond(mesh(root, cached('ringg', () => new THREE.RingGeometry(1.9, 2.9, 64, 1)), M.ring, PL[0], -0.9, PL[2], -Math.PI / 2 + 0.35, 0, 0.25, false)); ring.renderOrder = 3;
  { const uv = ring.geometry.attributes.uv, p = ring.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const r = Math.hypot(p.getX(i), p.getY(i)); uv.setXY(i, (r - 1.9) / 1.0, 0.5); } }
  const halo = nond(mesh(root, plane(7, 7), M.glow, PL[0], -0.9, PL[2] - 0.5, 0, 0, 0, false)); halo.material = M.glow.clone(); halo.material.color.set(0x8a6aff); halo.material.opacity = 0.5; halo.renderOrder = 4;
  // the light beam bending past the planet (gravitational lensing), photons running along it
  const curve = new THREE.CatmullRomCurve3([[-16, 4.6, -16], [-8, 3.7, -9.5], [-3.0, 2.1, -5.8], [0.6, 1.25, -5.0], [4.2, 2.1, -6.0], [9, 3.6, -10], [16, 4.7, -16]].map((a) => new THREE.Vector3(...a)));
  const beam = nond(mesh(root, new THREE.TubeGeometry(curve, 160, 0.13, 10), M.beam, 0, 0, 0, 0, 0, 0, false)); beam.renderOrder = 5; const core = nond(mesh(root, new THREE.TubeGeometry(curve, 160, 0.035, 8), M.beamCore, 0, 0, 0, 0, 0, 0, false));
  const photons = []; for (let i = 0; i < 5; i++) { const p = nond(mesh(root, plane(0.9, 0.9), M.glow, 0, 0, 0, 0, 0, 0, false)); p.material = M.glow.clone(); p.material.color.set(0xfff0c0); p.material.opacity = 0.9; p.renderOrder = 6; photons.push(p); }
  // floating clocks: closer to the planet = slower (dilation); speeds in rev/frame of the minute hand
  const clocks = [];
  for (const [x, y, z, s, sp, v] of [[-3.4, 2.6, 0.6, 0.62, 0.05, 0], [3.4, 3.3, -0.2, 0.5, 0.04, 1], [-1.7, 0.9, -2.0, 0.42, 0.006, 1], [2.3, 0.8, -2.2, 0.36, 0.004, 0], [-5.6, 4.2, -5, 0.7, 0.07, 1], [5.4, 1.4, 1.6, 0.44, 0.06, 0]]) {
    const g = new THREE.Group(); g.position.set(x, y, z); root.add(g); const k = new Kit(); k.put(M.brass, cyl(1, 1, 0.12, 40), 0, 0, -0.06, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8b060); k.put(M.brass, tor(1, 0.07, 8, 40), 0, 0, 0.02, 0, 0, 0, 1, 1, 1, 0xe8c070); k.put(M.brass, sph(0.14, 10, 8), 0, 1.12, 0, 0, 0, 0, 1, 1, 1, 0xe8c070); k.put(M.brass, tor(0.12, 0.03, 6, 14), 0, 1.3, 0, 0, 0, 0, 1, 1, 1, 0xe8c070); k.build(g);
    mesh(g, cached('cface', () => new THREE.CircleGeometry(0.96, 40)), v ? M.clockV : M.clock, 0, 0, 0.005, 0, 0, 0, false);
    const hand = (L, w, c) => { const h = new THREE.Group(); g.add(h); h.position.z = 0.03 + w * 0.2; mesh(h, cached(`hand${L}|${w}`, () => new THREE.BoxGeometry(w, L, 0.012).translate(0, L / 2 - 0.08, 0)), M.paint, 0, 0, 0, 0, 0, 0, false).material = toon({ color: c }); return h; };
    const hh = hand(0.5, 0.07, 0x2b1d4a), mh = hand(0.78, 0.045, 0x2b1d4a); mesh(g, sph(0.06, 8, 6), M.brass, 0, 0, 0.06, 0, 0, 0, false);
    g.scale.setScalar(s); g.rotation.set((R() - 0.5) * 0.3, (R() - 0.5) * 0.6, (R() - 0.5) * 0.3); clocks.push({ g, hh, mh, sp, ph: R() * 10, base: [x, y, z], rot: [g.rotation.x, g.rotation.y] }); }
  // floating equations
  const eqs = []; for (const [s, x, y, z, w, col] of [['E = mc²', -2.3, 4.4, -1.5, 3.2, '#ffe8b0'], ['G_{μν} = 8πG T_{μν}', 2.6, 5.0, -4.5, 4.2, '#d8c8ff'], ["Δt' = Δt / √(1 − v²/c²)", -4.2, 1.7, -6, 4.4, '#b8e0ff'], ['c', 4.3, 2.4, -1.2, 1.4, '#fff0c0'], ['ds² = g_{μν}dx^{μ}dx^{ν}', 4.5, 3.6, -8, 4, '#e0c8ff']]) {
    const m = nond(mesh(root, plane(w, w / 4), eqMat(s, col), x, y, z, 0, -x * 0.04, 0, false)); m.renderOrder = 7; eqs.push({ m, y, ph: R() * 6 }); }
  // dust motes
  const motes = new THREE.InstancedMesh(plane(0.12, 0.12), (() => { const m = M.glow.clone(); m.color.set(0xd8c8ff); m.opacity = 0.8; return m; })(), 120); const m4 = new THREE.Matrix4(); for (let i = 0; i < 120; i++) { m4.makeTranslation((R() - 0.5) * 20, R() * 8 - 1, -12 + R() * 16); motes.setMatrixAt(i, m4); } nond(motes); motes.renderOrder = 8; root.add(motes);
  K.build(root);
  return { grid, planet, ring, beam, curve, photons, clocks, eqs, halo, motes, PL };
}

// ================================================================= lights, grades, practicals, views
const SET_LIGHT = {
  study: { top: '#000000', hor: '#2e2018', fog: '#2a1e18', fogN: 9, fogF: 40, sky: '#e8d8c8', ground: '#5a3a2a', hemiI: 1.05, fillCol: '#7a8ae8', fillI: 0.42, sunCol: '#ffcf96', sunI: 1.5, az: -48, el: 32, disc: '#000000', clouds: false, shadow: false, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
  house: { top: '#5a78c8', hor: '#ffd0a0', fog: '#f4c8a0', fogN: 28, fogF: 120, sky: '#9a98d8', ground: '#4a3a50', hemiI: 0.9, fillCol: '#6a78d8', fillI: 0.32, sunCol: '#ffbc78', sunI: 3.0, az: -58, el: 15, disc: '#fff0c8', discSize: 0.003, clouds: false, stars: 0, cardTint: '#fff0e0', fxTint: '#fff4e8', shafts: 0.6 },
  embassy: { top: '#000000', hor: '#2a1c18', fog: '#241814', fogN: 10, fogF: 45, sky: '#e8ecf4', ground: '#4a2a22', hemiI: 1.15, fillCol: '#8a9ae8', fillI: 0.4, sunCol: '#fff2dc', sunI: 1.35, az: 38, el: 40, disc: '#000000', clouds: false, shadow: false, stars: 0, cardTint: '#f8f2ec', fxTint: '#ffffff', shafts: 0 },
  jerusalem: { top: '#000000', hor: '#3a2e22', fog: '#3a2e24', fogN: 10, fogF: 45, sky: '#fff0d8', ground: '#8a6a4a', hemiI: 1.25, fillCol: '#8a98e0', fillI: 0.32, sunCol: '#ffd8a0', sunI: 1.6, az: -40, el: 42, disc: '#000000', clouds: false, shadow: false, stars: 0, cardTint: '#fff2e2', fxTint: '#ffffff', shafts: 0 },
  cosmos: { top: '#0c0620', hor: '#3a1e6a', fog: '#1a1036', fogN: 30, fogF: 140, sky: '#6a4ab8', ground: '#1a1030', hemiI: 0.9, fillCol: '#8a6aff', fillI: 0.5, sunCol: '#e8d8ff', sunI: 1.5, az: -30, el: 35, disc: '#000000', clouds: false, shadow: false, stars: 0.6, cardTint: '#f0e8ff', fxTint: '#f0e8ff', shafts: 0 },
};
const SET_GRADE = {
  study: { look: 'office', over: { exp: 1.24, con: 1.3, sat: 1.0, lift: [0.035, 0.03, 0.05], tS: ['#3a3a7a', 0.16], tH: ['#ffcc90', 0.1], bloom: [0.45, 0.78], hal: [0.26, '#ff9a50'], vig: [0.36, 0.46, '#2a1a28'] } },
  house: { look: 'golden', over: { exp: 1.08, con: 1.26, sat: 1.04, tS: ['#3a3a8a', 0.18], tH: ['#ffc080', 0.14], bloom: [0.42, 0.8], hal: [0.24, '#ffa040'], vig: [0.3, 0.5, '#2a2440'] } },
  embassy: { look: 'office', over: { exp: 1.28, con: 1.28, sat: 0.96, lift: [0.03, 0.03, 0.05], tS: ['#2a3a6a', 0.18], tH: ['#fff0d8', 0.06], bloom: [0.45, 0.76], hal: [0.2, '#ffd0a0'], vig: [0.34, 0.46, '#1e1420'] } },
  jerusalem: { look: 'office', over: { exp: 1.22, con: 1.26, sat: 1.04, lift: [0.035, 0.03, 0.04], tS: ['#4a3a7a', 0.14], tH: ['#ffd090', 0.12], bloom: [0.45, 0.78], hal: [0.24, '#ffb060'], vig: [0.3, 0.48, '#3a2a28'] } },
  cosmos: { look: 'night', over: { exp: 1.18, con: 1.25, sat: 1.1, lift: [0.03, 0.02, 0.06], tS: ['#3a1a8a', 0.24], tH: ['#ffe0c0', 0.1], bloom: [0.6, 0.62], hal: [0.36, '#a080ff'], vig: [0.38, 0.44, '#0c0620'] } },
};
const SET_PRACT = {
  study: [{ p: [-1.1, 1.35, -1.45], col: '#ffc070', I: 1.5, d: 3.5 }, { p: [-2.0, 1.9, -2.6], col: '#a8c0ff', I: 2.6, d: 6 }, { p: [1.7, 2.2, 1.6], col: '#ffd8a0', I: 1.3, d: 5 }, { p: [-3.1, 0.9, 1.1], col: '#ffa850', I: 0.6, d: 1.5 }],
  house: [{ p: [0, 2.0, -5.0], col: '#ffd8a0', I: 1.2, d: 5 }, { p: [-4.5, 3.4, 5.6], col: '#ffe0b0', I: 0.5, d: 4 }],
  embassy: [{ p: [-0.75, 1.1, -2.0], col: '#ffd890', I: 1.6, d: 3.5 }, { p: [-2.9, 2.2, -3.0], col: '#d8e4ff', I: 2.6, d: 7 }, { p: [2.9, 2.2, -3.0], col: '#d8e4ff', I: 2.6, d: 7 }, { p: [-3.4, 1.6, 1.2], col: '#ffe0b0', I: 1.4, d: 4 }],
  jerusalem: [{ p: [-1.8, 2.0, -2.4], col: '#fff0d0', I: 3.2, d: 7 }, { p: [-0.05, 1.12, -1.65], col: '#ffc878', I: 1.3, d: 3 }, { p: [1.5, 2.6, 1.5], col: '#ffdcb0', I: 1.4, d: 6 }],
  cosmos: [{ p: [0.6, 0.6, -1.5], col: '#a080ff', I: 6, d: 10 }, { p: [-3, 3, 2], col: '#ffe0b0', I: 2.0, d: 9 }, { p: [3, 2, 1], col: '#80c0ff', I: 2.0, d: 8 }],
};

export function buildPrinceton(ctx) {
  ({ THREE, toon, mkTex, PT } = ctx); NOND = ctx.NOND || null; CAM = ctx.camera || null; MACRO = ctx.macro || null;
  M = materials();
  const groups = {};
  for (const name of SETS) { const g = new THREE.Group(); g.name = 'ein_' + name; g.position.set(...O[name]); g.visible = false; ctx.scene.add(g); groups[name] = g; }
  const leaves = [];
  const st = buildStudy(groups.study), hs = buildHouse(groups.house, leaves), em = buildEmbassy(groups.embassy), jr = buildJerusalem(groups.jerusalem), cs = buildCosmos(groups.cosmos);
  const spots = {
    // study (floor 0; desk top 0.76)
    deskChair: W3('study', [-0.3, 0, -2.1]), desk: W3('study', [-0.3, 0.76, -1.25]), deskFront: W3('study', [-0.1, 0, -0.35]), chalkboard: W3('study', [0.85, 0, 0.3]), chalkboardFace: W3('study', [1.75, 1.5, 0.05]),
    studyWindow: W3('study', [-2.0, 0, -2.9]), armchair: W3('study', [-2.2, 0, 2.4]), radio: W3('study', [-3.1, 0.8, 0.9]), violin: W3('study', [0.42, 0.4, -3.4]), studyDoor: W3('study', [2.0, 0, 3.8]), envelope: W3('study', [0.2, 0.77, -1.03]), replySheet: W3('study', [-0.36, 0.77, -1.22]),
    // house
    porch: W3('house', [0, 0.62, -4.4]), porchL: W3('house', [-1.9, 0.62, -4.6]), frontDoor: W3('house', [0, 0.62, -5.6]), steps: W3('house', [0, 0, -2.4]), path: W3('house', [0, 0, 0.8]), gate: W3('house', [0, 0, 3.0]),
    mailbox: W3('house', [2.5, 0, 4.72]), mailman: W3('house', [3.05, 0, 4.25]), mailmanStreet: W3('house', [2.9, 0, 5.6]), sidewalkL: W3('house', [-5, 0, 4.1]), sidewalkR: W3('house', [6, 0, 4.1]), yard: W3('house', [-3.2, 0, -0.5]),
    // embassy
    embassyDesk: W3('embassy', [0, 0.78, -1.7]), embassyChair: W3('embassy', [0, 0, -2.55]), embassyFront: W3('embassy', [0.2, 0, -0.6]), typist: W3('embassy', em.typist), typewriter: W3('embassy', [-3.6, 0.68, 0.5]), embassyWindow: W3('embassy', [2.9, 0, -3.8]), flag: W3('embassy', [-1.55, 0, -3.95]), guestL: W3('embassy', [-1.3, 0, 0.7]), guestR: W3('embassy', [1.3, 0, 0.7]),
    // jerusalem
    pmDesk: W3('jerusalem', [0.3, 0.76, -1.35]), pmChair: W3('jerusalem', [0.3, 0, -2.1]), pmFront: W3('jerusalem', [-0.3, 0, -0.25]), pmWindow: W3('jerusalem', [-1.8, 0, -2.9]), portrait: W3('jerusalem', jr.portrait), aide: W3('jerusalem', [1.6, 0, 0.3]), phone: W3('jerusalem', [0.88, 0.8, -1.17]), pmVisitor: W3('jerusalem', [-0.3, 0, -0.25]),
    // cosmos
    planet: W3('cosmos', [0.6, -0.9, -3]), floatA: W3('cosmos', [-2.6, 0.6, 1.6]), floatB: W3('cosmos', [2.2, 0.8, 1.4]), cosmosCentre: W3('cosmos', [0, 1.2, 0]),
  };
  const V = (set, p, l, fov, cInf, fp, extra = {}) => { const c = { set, p: W3(set, p), l: W3(set, l), fov, cInf, fp: fp ? W3(set, fp) : null, ...extra }; c.focus = Math.hypot(...[0, 1, 2].map((i) => c.p[i] - (c.fp || c.l)[i])); return c; };
  const views = [
    V('study', [0.1, 1.45, 3.9], [-0.3, 1.0, -3], 52, 2.5, [-0.3, 1.0, -1.6], { chalk: 0.4, open: 0, reply: 0 }), // 0 study wide: desk, window, books, violin case, chalkboard edge
    V('study', [0.4, 1.45, 1.9], [-0.35, 0.95, -1.4], 42, 5, [-0.3, 0.9, -1.4], { open: 1, reply: 0.4 }), // 1 study medium: the desk (letters, pipe, lamp), window behind
    V('study', [-0.9, 1.4, 3.3], [1.5, 1.35, -0.2], 44, 5, [1.6, 1.4, 0.0], { chalk: 0.6 }), // 2 study chalkboard medium (Einstein at the board)
    V('study', [0, 0, 0], [0, 0, 0], 34, 7, null, { chalk: 0.65, insert: 'chalk' }), // 3 chalk insert (square to the board)
    V('study', [-0.3, 1.45, -0.62], [-0.36, 0.77, -1.2], 38, 7, [-0.36, 0.77, -1.2], { open: 1, reply: 0.7, insert: 'letter' }), // 4 reply insert (Einstein's handwritten answer, pen)
    V('house', [-2.0, 1.35, 13.8], [0.3, 3.5, -6], 50, 2.5, [0, 1.5, -4.5]), // 5 house wide: from across the street, maples, fence, mailbox
    V('house', [0.9, 1.4, 9.0], [0.1, 2.1, -4.0], 40, 5, [0.0, 1.4, -4.4]), // 6 house medium: porch + door through the gate
    V('house', [4.4, 1.1, 7.6], [2.5, 1.0, 4.6], 38, 6, [2.5, 1.15, 4.72]), // 7 mailbox close (house soft behind)
    V('embassy', [0.9, 1.6, 4.6], [-0.3, 1.45, -3], 50, 2.5, [0, 1.1, -1.7], { typing: 0.5 }), // 8 embassy wide: desk, flag, map, draped windows
    V('embassy', [0.55, 1.4, 1.5], [0, 1.05, -1.9], 42, 5, [0, 1.0, -1.8], { typing: 0.5 }), // 9 embassy medium: desk, nameplate, pens, flag
    V('embassy', [0, 0, 0], [0, 0, 0], 34, 7, null, { typing: 0.55, insert: 'typed' }), // 10 typewriter insert (page square, typist's side)
    V('embassy', [-2.2, 1.4, 2.1], [-3.7, 1.0, 0.35], 42, 5, [-3.6, 0.9, 0.5], { typing: 0.4 }), // 11 typing table medium
    V('jerusalem', [1.0, 1.6, 4.5], [-0.3, 1.4, -2.5], 50, 2.5, [0.3, 1.0, -1.4], { mourning: 1 }), // 12 PM office wide: desk, window onto Jerusalem, books, portrait
    V('jerusalem', [0.75, 1.35, 1.4], [0.15, 1.3, -2.0], 42, 5, [0.3, 1.0, -1.4], { mourning: 1 }), // 13 PM desk medium (phone, books, portrait above)
    V('jerusalem', [0.25, 1.75, -0.6], [0.0, 2.1, -3.45], 36, 7, [0.0, 2.15, -3.45], { mourning: 1 }), // 14 portrait close with the mourning ribbon
    V('cosmos', [0.2, 3.2, 12.5], [0.3, 0.6, -3], 50, 2, [0.6, 0, -3]), // 15 cosmos wide: grid well, planet, beam, clocks, equations
    V('cosmos', [-0.6, 2.0, 6.2], [0.4, 0.6, -2.5], 44, 3.5, [0.6, 0, -3]), // 16 cosmos medium: planet + bending beam + near clocks
    V('cosmos', [-2.1, 2.85, 3.7], [-3.05, 2.55, 0.55], 40, 6, [-3.4, 2.6, 0.6]), // 17 cosmos close: a ticking clock, planet glow behind
    V('study', [2.7, 1.5, 3.6], [-2.6, 1.0, 0.4], 46, 4, [-2.4, 0.8, 1.4]), // 18 study reverse medium-wide: left-wall books, cathedral radio, armchair
    V('study', [0.28, 1.4, -0.5], [0.2, 0.77, -1.06], 38, 7, [0.2, 0.77, -1.06], { open: 1, reply: 0 }), // 19 envelope insert (opened, Eban's letter sliding out)
  ];
  const square = (obj, v, d) => { obj.updateMatrixWorld(true); const c = new THREE.Vector3(), n = new THREE.Vector3(0, 0, 1); obj.getWorldPosition(c); n.applyQuaternion(obj.getWorldQuaternion(new THREE.Quaternion())); const p = c.clone().addScaledVector(n, d); v.p = p.toArray(); v.l = c.toArray(); v.focus = d; v.fp = v.l; };
  for (const g of Object.values(groups)) g.updateMatrixWorld(true);
  { st.board.updateMatrixWorld(true); const c = st.board.localToWorld(new THREE.Vector3(-0.05 * st.bw, 0.5 * st.bh - 0.6 * st.bh, 0)), n = new THREE.Vector3(0, 0, 1).applyQuaternion(st.board.getWorldQuaternion(new THREE.Quaternion())), v = views[3]; v.p = c.clone().addScaledVector(n, 1.7).toArray(); v.l = c.toArray(); v.focus = 1.7; v.fp = v.l; } { const v = views[10]; em.tw.updateMatrixWorld(true); const c = em.tw.localToWorld(new THREE.Vector3(-0.05, 0.31, -0.12)), n = new THREE.Vector3(0, Math.sin(0.22), Math.cos(0.22)).transformDirection(em.tw.matrixWorld); v.p = c.clone().addScaledVector(n, 0.7).toArray(); v.l = c.toArray(); v.focus = 0.7; v.fp = v.l; }
  let FRAME = 0, CUR = null, CHALK = -1, LET = { open: -1, reply: -1 }, TYPE = -1;
  const v3 = new THREE.Vector3(), q = new THREE.Quaternion(), e = new THREE.Euler(), s3 = new THREE.Vector3(), m4 = new THREE.Matrix4();
  const API = {
    groups, origin: O, spots, views, board: st.board, page: em.page, envelope: st.env, reply: st.reply, ribbon: jr.ribbon, planet: cs.planet,
    // chalkboard: t 0..1 writes CHALK_LINE in (prewritten scribbles always there); a chalk stick follows the tip while 0<t<1
    setChalk(t, o = {}) { t = Math.max(0, Math.min(1, t)); if (Math.abs(t - CHALK) > 1e-4) { CHALK = t; const tex = M.board.map, c = tex.image, g = c.getContext('2d');
        if (!API._boardBase) { boardBase(g, c.width, c.height); API._boardBase = g.getImageData(0, 0, c.width, c.height); } else g.putImageData(API._boardBase, 0, 0);
        const N = glyphCount(CHALK_LINE), r = hand(g, CHALK_LINE, c.width * 0.05, c.height * 0.8, c.height * 0.075, { chalk: true, col: 'rgba(250,250,244,0.96)', wob: 0.16, seed: 21, n: Math.round(t * N) }); API._chalkTip = [r.tip[0] / c.width, r.tip[1] / c.height]; tex.needsUpdate = true; }
      const show = o.stick ?? (t > 0.001 && t < 0.999); st.chalk.visible = show; if (show && API._chalkTip) { const [u, v] = API._chalkTip; st.chalk.position.set((u - 0.5) * st.bw + 0.02, st.by + (0.5 - v) * st.bh, 0.03); } },
    // envelope: open 0..1 (flap swings back, Eban's letter slides out); reply 0..1 (Einstein's handwritten answer writes itself, pen at the tip)
    setLetter(o = {}) { const open = Math.max(0, Math.min(1, o.open ?? 0)), reply = Math.max(0, Math.min(1, o.reply ?? 0));
      if (open !== LET.open) { LET.open = open; const a = Math.min(1, open * 1.6), sm = a * a * (3 - 2 * a); st.flapG.rotation.x = -Math.PI + 0.02 + sm * (Math.PI * 0.98); // closed: flap folded over the body; open: lies flat beyond the hinge
        const b = Math.max(0, (open - 0.55) / 0.45); st.inner.visible = b > 0; st.inner.position.set(0, 0.0012 + b * 0.004, -b * 0.13); }
      if (reply !== LET.reply) { LET.reply = reply; const tex = M.reply.map, c = tex.image, g = c.getContext('2d'); API._penTip = replyPage(g, c.width, c.height, reply); tex.needsUpdate = true; }
      st.reply.visible = o.replyVisible ?? true; const pen = o.pen ?? (reply > 0.001 && reply < 0.999); st.pen.visible = pen;
      if (pen && API._penTip) { const [u, v] = API._penTip; v3.set((u - 0.5) * 0.21, (0.5 - v) * 0.27, 0.004); st.reply.updateMatrixWorld(true); const wp = st.reply.localToWorld(v3.clone()); st.pen.parent.worldToLocal(wp); st.pen.position.copy(wp); st.pen.rotation.set(-0.45, 0, 0.35); } },
    // typewriter: t 0..1 types Eban's letter; the carriage shifts with the column
    setTyping(t) { t = Math.max(0, Math.min(1, t)); if (Math.abs(t - TYPE) < 1e-4) return; TYPE = t; const tex = M.typed.map, c = tex.image, g = c.getContext('2d'); const [u, v] = typedPage(g, c.width, c.height, t); tex.needsUpdate = true; em.carriage.position.x = -(u - 0.5) * 0.216;
      // the paper feeds up: only the part above the strike line shows (current line sits at the platen)
      const hv = Math.min(0.28, 0.02 + 0.28 * v), geo = new THREE.PlaneGeometry(0.216, hv); geo.translate(0, hv / 2, 0); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) > 0.5 ? 1 : 1 - hv / 0.28); em.page.geometry.dispose(); em.page.geometry = geo; },
    setMourning(on) { jr.ribbon.visible = !!on; },
    tick(f) { FRAME = f;
      if (CUR === 'house' || CUR == null) { leaves.forEach((L, i) => { const ph = (L[1] / 8 + f * 0.0016 * (0.7 + L[3])) % 1, y = 8 - ph * 8, sw = Math.sin(f * 0.06 + L[4]) * 0.6; v3.set(L[0] + sw + ph * 1.5, y, L[2] + Math.cos(f * 0.045 + L[4]) * 0.3); q.setFromEuler(e.set(f * 0.08 + L[4], f * 0.05 + i, Math.sin(f * 0.1 + i) * 1.2)); s3.setScalar(1); m4.compose(v3, q, s3); hs.fall.setMatrixAt(i, m4); }); hs.fall.instanceMatrix.needsUpdate = true; }
      if (CUR === 'jerusalem' || CUR == null) jr.fan.rotation.y = f * 0.09;
      if (CUR === 'study' || CUR == null) { st.shafts.forEach((s, i) => { s.material.opacity = 0.075 + 0.02 * Math.sin(f * 0.03 + i); }); st.lampGlow.material.opacity = 0.3; }
      if (CUR === 'cosmos' || CUR == null) {
        cs.clocks.forEach((c) => { const a = (f + c.ph * 100) * c.sp * TAU; c.mh.rotation.z = -a; c.hh.rotation.z = -a / 12 - c.ph; c.g.position.y = c.base[1] + Math.sin(f * 0.03 + c.ph) * 0.12; c.g.rotation.y = c.rot[1] + Math.sin(f * 0.012 + c.ph) * 0.15; });
        cs.eqs.forEach((q2) => { q2.m.position.y = q2.y + Math.sin(f * 0.025 + q2.ph) * 0.15; q2.m.material.opacity = 0.75 + 0.2 * Math.sin(f * 0.05 + q2.ph); });
        cs.photons.forEach((p, i) => { const u = ((f * 0.004 + i / cs.photons.length) % 1); p.position.copy(cs.curve.getPointAt(u)); if (CAM) p.quaternion.copy(CAM.quaternion); });
        cs.planet.rotation.y = f * 0.004; cs.beam.material.opacity = 0.3 + 0.06 * Math.sin(f * 0.07); cs.halo.material.opacity = 0.45 + 0.08 * Math.sin(f * 0.04); }
    },
    lightFor(name) { return { ...LIGHTS_[name === 'house' ? 'golden' : 'office'], ...SET_LIGHT[name] }; },
    gradeFor: (name) => ({ ...((SET_GRADE[name] || {}).over || {}) }),
    lookFor: (name) => (SET_GRADE[name] || {}).look || 'office',
    show(world, name) { for (const k in groups) groups[k].visible = k === name; CUR = name;
      if (name) { for (const k of ['road', 'stadium', 'office', 'car', 'dc']) if (world[k]) world[k].visible = false; if (world.rooms) world.rooms.show(world, null); API.tick(FRAME); } },
    placeLights(PRACT, name) { PRACT.forEach((l, i) => { const c = (SET_PRACT[name] || [])[i]; l.visible = true; if (!c) { l.intensity = 0; return; } l.position.set(...W3(name, c.p)); l.color.set(c.col); l.intensity = c.I; l.distance = c.d; l.decay = 1.6; }); API.face(name); },
    face(name = CUR) { const cam = CAM; if (!cam) return;
      if (name === 'study') st.lampGlow.quaternion.copy(cam.quaternion); if (name === 'embassy') em.lampGlow.quaternion.copy(cam.quaternion);
      if (name === 'cosmos') { cs.halo.quaternion.copy(cam.quaternion); cs.photons.forEach((p) => p.quaternion.copy(cam.quaternion)); } },
    // test-view helper (main.js ?einview=N; a: view = frame)
    viewFor(i, f = 0) { const k = ((i % views.length) + views.length) % views.length, c = views[k];
      return { i: k, mod: API, set: c.set, f, chalk: c.chalk ?? 1, open: c.open ?? 1, reply: c.reply ?? 1, typing: c.typing ?? 1, mourning: c.mourning ?? 1, L: API.lightFor(c.set), look: API.lookFor(c.set), grade: API.gradeFor(c.set), cam: { p: c.p, l: c.l, fov: c.fov, focus: c.focus, cInf: c.cInf, roll: c.roll || 0, shadowAt: c.fp || c.l } }; },
    apply(world, v) { API.show(world, v.set); API.setChalk(v.chalk ?? 1); API.setLetter({ open: v.open ?? 1, reply: v.reply ?? 1 }); API.setTyping(v.typing ?? 1); API.setMourning(v.mourning ?? 1); API.tick(v.f ?? FRAME); },
  };
  API.view = API.viewFor; API.setChalk(1, { stick: false }); API.setLetter({ open: 0, reply: 0, pen: false }); API.setTyping(1); API.setMourning(true); API.tick(0);
  return API;
}
