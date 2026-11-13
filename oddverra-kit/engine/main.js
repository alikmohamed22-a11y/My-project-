// Engine: toon world + canvas cards + ink/grade + DOF. Everything is a pure function of the frame number.
import * as THREE from './three/three.module.js';
import * as T from './toon.js';
import { oddverra } from './oddverra_next.js';
import { drawCat } from './cat.js'; // [KITTY-cat]
import { drawBear } from './bear.js'; // [TEDDY-cast]
import { LIB_ODD, libOpts } from './liberty_cast.js'; // [LIB-cast]
import { KCH_ODD, kchOpts, drawTommy, kchTestActs } from './ketchup_cast.js'; // [KCH-cast]
import { PD_ODD, pdOpts, drawDoughy, pdTestActs } from './playdoh_cast.js'; // [PD-cast]
import { HW_ODD, hwOpts, drawLilH, drawMule, drawBigLet, hwTestActs } from './hollywood_cast.js'; // [HW-cast]
import { LN_ODD, lnOpts, drawTopper, lnTestActs } from './ln_cast.js'; // [LN-cast]
import { BW_ODD, bwOpts, drawPoppy, bwTestActs } from './bw_cast.js'; // [BW-cast]
import { JG_ODD, jgOpts, jgTestActs } from './joughin_cast.js'; // [JG-cast]
import { buildRooms } from './rooms.js'; // [KITTY-rooms]
import { buildDC } from './dc.js'; // [KITTY-dc]
import { buildLouvre, drawMona } from './louvre.js'; globalThis.__drawMona = drawMona; // [MONA-louvre]
import { buildParis } from './paris.js'; // [MONA-paris]
import { buildStation } from './station.js'; // [BOOTH-station]
import { buildTheatre } from './theatre.js'; // [BOOTH-theatre]
import { buildHavana } from './havana.js'; // [CASTRO-havana]
import { buildBrooklyn } from './brooklyn.js'; // [TEDDY-brooklyn]
import { buildSwamp } from './swamp.js'; // [TEDDY-swamp]
import { buildPrinceton } from './princeton.js'; // [EIN-sets]
import { buildHarbor } from './harbor.js'; // [LIB-harbor]
import { buildEgypt } from './egypt.js'; // [LIB-egypt]
import { buildOhio } from './ohio.js'; // [KCH-sets1]
import { buildPills } from './pills.js'; // [KCH-sets2]
import { buildHomes } from './doh_homes.js'; // [PD-sets1]
import { buildWorks } from './doh_works.js'; // [PD-sets2]
import { buildHW } from './hw_sets.js'; // [HW-sets]
import { buildLN } from './ln_sets.js'; // [LN-sets] (story: examples/lincoln/story_lincoln.js)
import { buildBW } from './bw_sets.js'; // [BW-sets] (story: examples/bubblewrap/story_bubblewrap.js)
import { buildTitanic } from './titanic_sets.js'; // [JG-sets]
import { buildNapoleon } from './napoleon_sets.js'; // [NAP-sets] (story: examples/napoleon/story_napoleon.js)
import { NAP_ODD, napOpts, napTestActs } from './napoleon_cast.js'; // [NAP-cast]
import { buildCleo } from './cleo_sets.js'; // [CLEO-sets] (story: examples/cleopatra/story_cleo.js)
import { LB_ODD, lbOpts, drawClutchy, lbTestActs } from './lb_cast.js'; // [LB-cast]
import { NT_ODD, ntOpts, drawFuda, ntTestActs } from './nt_cast.js'; // [NT-cast]
import { buildNT } from './nt_sets.js'; // [NT-sets] (story: examples/nintendo/story_nintendo.js)
import { buildLB } from './lb_sets.js'; // [LB-sets] (story: examples/lambo/story_lambo.js)
import { CL_ODD, clOpts, drawPip, clTestActs } from './cleo_cast.js'; // [CLEO-cast]
import { buildReef } from './reef.js'; // [CASTRO-reef]
import { shotAt, camAt, lightFor, worldAt, actorsAt, fxAt, gradeAt, TALKER, roomAt, setAt } from './story_joughin.js'; // [JG-story] (was story_playdoh.js)
import { ENV } from './voice_env.js';
import { makeChar } from './char3d.js';
import * as PT from './paint.js';
import { setStadiumName, initWorld, dressRoad, dressStadium, dressGate, dressOffice, dressCar, dressStadiumTown } from './world.js';
const USE3D = location.search.includes('3d');
const chars3d = new Map();

const RS = +((location.search.match(/rs=([0-9.]+)/) || [])[1] || 1); const W = Math.round(1080 * RS), H = Math.round(1920 * RS), FAR = 2500; window.__RS = RS;
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = location.search.includes("pcf") ? THREE.PCFSoftShadowMap : THREE.VSMShadowMap;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, FAR);
scene.fog = new THREE.Fog(0xffffff, 60, 900);

// ---------- toon materials ----------
// 4-step gradient map (RGB): deep shadow, shadow, a thin terminator band, lit. Shadow steps lean purple.
// Cell i covers N.L in [i/8-1, (i+1)/8-1). The toon chunk is patched to read .rgb instead of .r.
const GSTEP = { deep: [107, 94, 148], shadow: [128, 112, 163], mid: [214, 205, 228], lit: [255, 255, 255] };
const grad = new THREE.DataTexture(new Uint8Array(Array.from({ length: 16 }, (_, i) => [...(i < 5 ? GSTEP.deep : i < 8 ? GSTEP.shadow : i < 9 ? GSTEP.mid : GSTEP.lit), 255]).flat()), 16, 1, THREE.RGBAFormat);
grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.generateMipmaps = false; grad.needsUpdate = true;
THREE.ShaderChunk.gradientmap_pars_fragment = THREE.ShaderChunk.gradientmap_pars_fragment.replace('vec3( texture2D( gradientMap, coord ).r )', 'texture2D( gradientMap, coord ).rgb');
const toon = (o) => new THREE.MeshToonMaterial({ gradientMap: grad, ...o });
// macro variation: world-space low-frequency value/hue noise over the albedo, so big tiled planes don't show repeats
const macro = (mat, amt = 0.14, sc = 0.035) => {
  const A = amt.toFixed(4), Sc = sc.toFixed(4);
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vMacW;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvMacW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vMacW;
float mH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float mN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(mH(i), mH(i + vec2(1., 0.)), f.x), mix(mH(i + vec2(0., 1.)), mH(i + vec2(1., 1.)), f.x), f.y); }`)
      .replace('#include <map_fragment>', `#include <map_fragment>
{ vec2 p = vMacW.xz * ${Sc}; float n = mN(p) * 0.55 + mN(p * 2.7 + 7.3) * 0.3 + mN(p * 7.1 - 3.1) * 0.15; float n2 = mN(p * 0.6 + 19.1);
  diffuseColor.rgb *= (1.0 + ${A} * (n - 0.5) * 2.0) * mix(vec3(1.03, 1.0, 0.94), vec3(0.95, 0.98, 1.04), n2); }`);
  };
  mat.customProgramCacheKey = () => 'macro' + A + Sc; return mat;
};
const NOND = new Set(); // hidden in the normal/depth pass
const CARDS = new Set();

const MAXANISO = renderer.capabilities.getMaxAnisotropy();
const mkTex = (w, h, draw, rep = [1, 1]) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d', { willReadFrequently: true }), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = MAXANISO; t.repeat.set(rep[0], rep[1]);
  return t;
};
const rnd = (k) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- painters (flat with dark seams) ----------
const P = {};
P.hull = (black) => mkTex(2048, 256, (g, w, h) => {
  g.fillStyle = black ? '#1f1f27' : '#f3f0e6'; g.fillRect(0, 0, w, h);
  g.fillStyle = black ? '#26262f' : '#e6e2d6';
  for (let x = 0; x < w; x += 128) g.fillRect(x, 0, 3, 171);
  g.fillStyle = black ? '#d9b45a' : '#3c8a4e'; g.fillRect(0, black ? 10 : 92, w, black ? 5 : 22);
  g.fillStyle = '#a63a30'; g.fillRect(0, 171, w, 85);
  g.fillStyle = '#1a1416'; g.fillRect(0, 168, w, 4);
  for (const [y, r] of [[52, 5], [80, 4.5]]) for (let x = 10; x < w; x += 26) {
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = black ? '#e8dcb5' : '#2b3140'; g.fill();
  }
  if (!black) for (const u of [0.22, 0.5, 0.78]) {
    const cx = u * w, cy = 128, a = 46, b = 15;
    g.fillStyle = '#ffffff'; g.fillRect(cx - a - 8, cy - a - 8, 2 * a + 16, 2 * a + 16);
    g.fillStyle = '#d23a3a'; g.fillRect(cx - b, cy - a, 2 * b, 2 * a); g.fillRect(cx - a, cy - b, 2 * a, 2 * b);
  }
});
P.hullGlow = () => mkTex(2048, 256, (g, w, h) => {
  g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
  for (const [y, r] of [[52, 5], [80, 4.5]]) for (let x = 10; x < w; x += 26) {
    if (rnd(x + y) < 0.25) continue;
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = '#ffcf6a'; g.fill();
  }
});
P.super = (glow) => mkTex(256, 256, (g, w, h) => {
  g.fillStyle = glow ? '#000' : '#f4f1e8'; g.fillRect(0, 0, w, h);
  for (const x of [30, 150]) {
    if (!glow) { g.fillStyle = '#c9c3b2'; g.fillRect(x - 6, 74, 88, 92); }
    g.fillStyle = glow ? '#ffd27a' : '#25304a'; g.fillRect(x, 80, 76, 80);
    if (!glow) { g.fillStyle = '#f4f1e8'; g.fillRect(x + 36, 80, 4, 80); }
  }
  if (!glow) { g.fillStyle = '#8a6a4a'; g.fillRect(0, 240, w, 16); }
});
P.deck = () => mkTex(256, 256, (g, w, h) => {
  g.fillStyle = '#cfa874'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 32) { g.fillStyle = '#9c7448'; g.fillRect(0, y, w, 3); for (let x = (y * 7) % 90; x < w; x += 150) g.fillRect(x, y, 3, 32); }
});
P.grey = () => mkTex(512, 128, (g, w, h) => {
  g.fillStyle = '#7f878f'; g.fillRect(0, 0, w, h); g.fillStyle = '#6c737b';
  for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 3, h);
  g.fillStyle = '#4b5259'; g.fillRect(0, 96, w, 32);
});
P.sea = () => mkTex(512, 512, (g, w, h) => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8e6ee'; g.lineCap = 'round';
  for (let i = 0; i < 70; i++) {
    const x = rnd(i) * w, y = rnd(i + 50) * h, l = 20 + 40 * rnd(i + 9);
    g.lineWidth = 3 + 4 * rnd(i + 3); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 6, x + l, y); g.stroke();
  }
});
P.wall = () => mkTex(512, 512, (g, w, h) => {
  g.fillStyle = '#efe2c4'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#8a5634'; g.fillRect(0, 300, w, 212);
  g.fillStyle = '#6e4228'; for (let x = 16; x < w; x += 128) g.fillRect(x, 320, 96, 172);
  g.fillStyle = '#9c6640'; for (let x = 22; x < w; x += 128) g.fillRect(x, 326, 84, 160);
  g.fillStyle = '#5a3420'; g.fillRect(0, 290, w, 14);
});
P.carpet = () => mkTex(256, 256, (g, w, h) => {
  g.fillStyle = '#9b2f33'; g.fillRect(0, 0, w, h); g.fillStyle = '#c9a24a';
  for (const [x, y] of [[64, 64], [192, 192]]) { g.beginPath(); g.moveTo(x, y - 22); g.lineTo(x + 22, y); g.lineTo(x, y + 22); g.lineTo(x - 22, y); g.fill(); }
});
P.wood = () => mkTex(256, 256, (g, w, h) => {
  g.fillStyle = '#a8744a'; g.fillRect(0, 0, w, h); g.fillStyle = '#7d5234';
  for (let y = 0; y < h; y += 42) g.fillRect(0, y, w, 4);
});

// ---------- helpers ----------
const S = 2; // metres per texture tile
function tbox(w, h, d, mat, s = S) {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) {
    const k = f * 4 + i; uv.setXY(k, uv.getX(k) * dims[f][0] / s, uv.getY(k) * dims[f][1] / s);
  }
  const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m;
}
const add = (parent, m, x = 0, y = 0, z = 0) => { m.position.set(x, y, z); parent.add(m); if (m.isMesh) { m.castShadow = m.receiveShadow = true; } return m; };
const boxAt = (parent, x0, x1, y0, y1, z0, z1, mat, s) => add(parent, tbox(x1 - x0, y1 - y0, z1 - z0, mat, s), (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, bot: { value: new THREE.Color() }, sun: { value: new THREE.Vector3(0, 1, 0) },
  sunCol: { value: new THREE.Color() }, sunSize: { value: 0.03 }, stars: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(2000, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top,hor,bot,sunCol,sun; uniform float sunSize,stars; varying vec3 vD;
    float h(vec3 p){ return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453); }
    void main(){ vec3 d=normalize(vD); float y=d.y;
      vec3 c = y>0. ? mix(hor, top, pow(smoothstep(0.,0.55,y),0.8)) : mix(hor, bot, smoothstep(0.,0.08,-y));
      float s = dot(d, normalize(sun)); c += sunCol*smoothstep(1.-sunSize, 1.-sunSize*0.7, s) + sunCol*0.25*pow(max(s,0.),24.);
      vec3 q=floor(d*420.); c += stars*step(0.9975,h(q))*smoothstep(0.05,0.3,y);
      gl_FragColor = linearToOutputTexel(vec4(c,1.)); }`,
}));
sky.renderOrder = -10; scene.add(sky); NOND.add(sky);

// ---------- lights ----------
// key (sun) + cool sky fill (hemi) + a soft opposing bounce/fill + warm practical lights for night/explain scenes
const hemi = new THREE.HemisphereLight(0xffffff, 0x445566, 1); scene.add(hemi);
const fill = new THREE.DirectionalLight(0x8fa8ff, 0.4); scene.add(fill); scene.add(fill.target); // no shadow: shapes the shadow side, cool
const sun = new THREE.DirectionalLight(0xffffff, 2); sun.castShadow = !location.search.includes('noshadow');
// tight, high-res shadow frustum fitted around the action each frame (see fitShadow); VSM for soft, blurred penumbrae
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 400 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 5; sun.shadow.blurSamples = 10; scene.add(sun); scene.add(sun.target);
// warm practicals (lanterns / lamps) placed per frame by placePracticals(); fixed count so shaders never recompile mid-shot
const PRACT = Array.from({ length: 4 }, () => { const l = new THREE.PointLight(0xffb060, 0, 14, 1.6); l.visible = false; scene.add(l); return l; });
// ---------- world ----------
const world = {};
initWorld({ THREE, toon, rnd });
// ---- hand-painted painters (see paint.js). Repeat is set so one tile = a sensible real-world size;
// callers' tbox() scale s maps metres -> uv, so rep = s / tileMetres.
// dirt: one tile spans the full road width (ruts/edges line up with the road) and 12.8 m along it.
P.dirt = (width = 6.4, s = 3, o = {}) => mkTex(512, 1024, (g, w, h) => PT.dirt(g, w, h, o), [s / width, s / 12.8]);
P.grass = (s = 2, o = {}) => mkTex(512, 512, (g, w, h) => PT.grass(g, w, h, o), [s / 4, s / 4]);
// boards: planks along u. n planks per tile; tile = s metres when called with the caller's s
P.boards = (col, o = {}) => mkTex(512, 512, (g, w, h) => PT.planks(g, w, h, { base: col, seed: (parseInt(String(col).slice(1), 16) % 997) + 3, ...o }), o.rep || [1, 1]);
P.siding = (col, o = {}) => mkTex(512, 512, (g, w, h) => PT.siding(g, w, h, { base: col, seed: (parseInt(String(col).slice(1), 16) % 991) + 5, ...o }), o.rep || [1, 1]);
P.shingles = (col, o = {}) => mkTex(512, 512, (g, w, h) => PT.shingles(g, w, h, { base: col, ...o }), o.rep || [1, 1]);
P.brick = (col, o = {}) => mkTex(512, 512, (g, w, h) => PT.brick(g, w, h, { base: col, ...o }), o.rep || [1, 1]);
P.stone = (col, o = {}) => mkTex(512, 512, (g, w, h) => PT.stone(g, w, h, { base: col, ...o }), o.rep || [1, 1]);
P.metal = (col, o = {}) => mkTex(256, 256, (g, w, h) => PT.metal(g, w, h, { base: col, ...o }), o.rep || [1, 1]);
P.fabric = (col, o = {}) => mkTex(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: col, ...o }), o.rep || [1, 1]);
P.barrel = (col, o = {}) => mkTex(512, 256, (g, w, h) => PT.barrel(g, w, h, { base: col, ...o }));
P.hay = (col, o = {}) => mkTex(256, 256, (g, w, h) => PT.hay(g, w, h, { base: col, ...o }), o.rep || [1, 1]);
P.bark = (col, o = {}) => mkTex(256, 256, (g, w, h) => PT.bark(g, w, h, { base: col, ...o }), o.rep || [1, 1]);
// banner: painted cloth with weave, hem stitching, inset border, slightly worn lettering
P.banner = (txt, bg, fg) => mkTex(1024, 192, (g, w, h) => {
  PT.fabric(g, w, h, { base: bg, folds: 3, seed: txt.length * 7 });
  g.strokeStyle = fg; g.lineWidth = 10; g.strokeRect(18, 18, w - 36, h - 36);
  g.strokeStyle = PT.css(PT.shade(bg, 0.55), 0.8); g.lineWidth = 2; g.setLineDash([8, 6]); g.strokeRect(7, 7, w - 14, h - 14); g.setLineDash([]);
  g.fillStyle = PT.css(PT.shade(bg, 0.6), 0.55); g.font = 'bold 110px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2 + 3, h / 2 + 10);
  g.fillStyle = fg; g.fillText(txt, w / 2, h / 2 + 6);
  PT.modulate(g, w, h, (u, v) => { const e = Math.min(v, 1 - v); return (0.9 + 0.1 * Math.min(1, e * 12)) * (0.96 + 0.08 * PT.fbm(u, v, 3, 1, 2, 41)); });
});
P.doc = (stamped) => mkTex(512, 680, (g, w, h) => { PT.paper(g, w, h, { seed: 7 }); g.fillStyle = '#241726'; g.textAlign = 'center'; g.font = 'bold 44px serif'; g.fillText('AMATEUR ATHLETIC', w / 2, 80); g.fillText('UNION', w / 2, 130); g.font = 'bold 30px serif'; g.fillText('ST. LOUIS, 1904', w / 2, 178);
  g.strokeStyle = 'rgba(36,23,38,0.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(90, 200); g.lineTo(w - 90, 200); g.stroke();
  g.font = 'bold 50px serif'; g.fillText('Fred Lorz', w / 2, 270); g.font = 'bold 40px serif'; g.fillText('rode in a car.', w / 2, 330); g.fillText('Ban: for life.', w / 2, 386); for (let i = 0; i < 4; i++) { g.fillStyle = '#b9ae96'; g.fillRect(70, 440 + i * 34, i % 2 ? 300 : 370, 10); }
  // fold crease across the middle third
  g.fillStyle = 'rgba(120,100,80,0.18)'; g.fillRect(0, h / 3, w, 2); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(0, h / 3 + 2, w, 2);
  if (stamped) { const c = document.createElement('canvas'); c.width = w; c.height = h; const s = c.getContext('2d');
    s.translate(w / 2, 560); s.rotate(-0.18); s.strokeStyle = '#c8302c'; s.lineWidth = 12; s.strokeRect(-190, -60, 380, 120); s.lineWidth = 3; s.strokeRect(-176, -46, 352, 92); s.fillStyle = '#c8302c'; s.font = 'bold 82px sans-serif'; s.textAlign = 'center'; s.textBaseline = 'middle'; s.fillText('BANNED', 0, 6);
    s.setTransform(1, 0, 0, 1, 0, 0); PT.inkWear(s, 40, 470, w - 80, 190, 9, 1.4); g.globalAlpha = 0.88; g.globalCompositeOperation = 'multiply'; g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; } });
{ // road along z (runners run toward +z), x = 0: ground + world.js set dressing (farms, town, props, trees)
  const g = new THREE.Group();
  boxAt(g, -3.2, 3.2, -0.05, 0, -400, 40, macro(toon({ map: P.dirt() }), 0.12, 0.05), 3);
  const gr = toon({ map: P.grass() });
  boxAt(g, -400, -3.2, -0.1, 0, -700, 60, gr, 2); boxAt(g, 3.2, 400, -0.1, 0, -700, 60, gr, 2);
  const stoneM = toon({ color: 0x9a8a78 }); const st = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.16, 0), stoneM, 500); const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), Sc = new THREE.Vector3();
  for (let i = 0; i < 500; i++) { const x = (rnd(i * 11) - 0.5) * 6, z = -390 + rnd(i * 13) * 430; M.compose(V.set(x, 0.03, z), Q.identity(), Sc.set(1, 0.5, 1).multiplyScalar(0.5 + rnd(i) * 0.8)); st.setMatrixAt(i, M); }
  st.castShadow = st.receiveShadow = true; g.add(st);
  dressRoad(g);

  // near-lens foreground props (blur with depth of field): sunflowers and a milestone along the right edge
  const stem = toon({ color: 0x5a8a3a }), petal = toon({ color: 0xf2c030 }), seed = toon({ color: 0x5a3a20 });
  for (let z = -380; z < 40; z += 7.5) { const x = 3.9 + rnd(z) * 0.5; add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.3, 6), stem), x, 0.65, z); const fh = new THREE.Group(); fh.position.set(x, 1.32, z + 0.05); g.add(fh); fh.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 12), petal)).rotation.x = Math.PI / 2; fh.add(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 10), seed)).rotation.x = Math.PI / 2; }
  scene.add(g); world.road = g;
}
{ // car: 1904 curved-dash runabout, faces +z
  const c = new THREE.Group(), body = new THREE.Group(); c.add(body); c.body = body;
  const red = toon({ color: 0xb8262a }), red2 = toon({ color: 0x8e1c22 }), blk = toon({ color: 0x1d1b22 }), brass = toon({ color: 0xe8b84a, emissive: 0x3a2400 }), leather = toon({ color: 0x4a2a22 }), wood = toon({ color: 0xc89a5a }), steel = toon({ color: 0x7a8088 }), glass = new THREE.MeshBasicMaterial({ color: 0xfff6d8 });
  const side = (pts, depth, mat, x0, bevel = 0.035) => { const sh = new THREE.Shape(); pts.forEach(([u, v], i) => i ? sh.lineTo(u, v) : sh.moveTo(u, v)); const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 12 }); g.rotateY(-Math.PI / 2); g.translate(x0, 0, 0); const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; body.add(m); return m; };
  const curve = (pts, n = 10) => { const out = []; for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]]; out.push(a); } out.push(pts[pts.length - 1]); return out; };
  // tub + curved dash (profile in z,y)
  const prof = []; prof.push([-1.25, 0.58], [-1.25, 1.0], [-1.1, 1.06], [-0.15, 1.02], [0.55, 0.86]);
  for (let i = 0; i <= 10; i++) { const t = i / 10; prof.push([0.55 + 0.7 * t, 0.86 + 0.55 * t * t]); }
  prof.push([1.3, 1.36], [1.18, 1.22]); for (let i = 0; i <= 8; i++) { const t = i / 8; prof.push([1.18 - 0.1 * t, 1.22 - 0.64 * t]); } prof.push([-1.25, 0.58]);
  side(prof, 1.24, red, 0.62);
  side([[-1.22, 1.0], [-0.2, 0.98], [-0.2, 1.03], [-1.22, 1.05]], 1.3, brass, 0.65, 0.01);
  // seat: cushion + curved back with tufting
  side([[-1.05, 1.0], [-0.25, 1.0], [-0.22, 1.16], [-1.05, 1.16]], 1.1, leather, 0.55, 0.05);
  const back = []; for (let i = 0; i <= 12; i++) { const t = i / 12; back.push([-1.12 + 0.12 * Math.sin(t * Math.PI) * 0, 1.06 + 0.72 * t]); } back.push([-0.95, 1.8], [-0.92, 1.1]);
  side([[-1.2, 1.05], [-1.2, 1.78], [-1.05, 1.85], [-0.95, 1.78], [-0.95, 1.12]], 1.12, leather, 0.56, 0.05);
  for (let i = 0; i < 4; i++) for (let k = 0; k < 2; k++) add(body, new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 4), toon({ color: 0x2a1812 })), -0.42 + i * 0.28, 1.32 + k * 0.28, -0.93);
  // running boards + chassis + leaf springs + axles
  for (const x of [-0.72, 0.72]) { boxAt(body, x - 0.1, x + 0.1, 0.46, 0.5, -0.9, 0.7, blk, 1); }
  boxAt(body, -0.5, 0.5, 0.42, 0.5, -1.2, 1.1, blk, 1);
  for (const z of [-0.95, 0.95]) { const sp = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.025, 6, 16, Math.PI * 0.45), steel); sp.rotation.set(0, Math.PI / 2, Math.PI * 1.275); sp.position.set(0, 0.84, z); body.add(sp); }
  // steering column + wheel (driver on the left)
  const col = add(body, new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.75, 10), blk), -0.32, 1.32, 0.18); col.rotation.x = -0.62;
  const sw = new THREE.Group(); sw.position.set(-0.32, 1.62, -0.06); sw.rotation.x = -0.95; body.add(sw); c.steer = sw;
  sw.add(new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.028, 8, 28), wood)); for (let k = 0; k < 3; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.025, 0.02), blk); sp.rotation.z = k * Math.PI / 3; sw.add(sp); }
  // brass lamps with glowing glass, bulb horn, radiator grille strip
  for (const x of [-0.5, 0.5]) { const l = add(body, new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.22, 16), brass), x, 1.18, 1.24); l.rotation.x = Math.PI / 2; const gl = add(body, new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), glass), x, 1.18, 1.36); gl.castShadow = false; add(body, new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 6), brass), x, 1.02, 1.18); }
  const horn = add(body, new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.4, 12, 1, true), brass), 0.8, 1.2, 0.75); horn.rotation.x = -Math.PI / 2; add(body, new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), blk), 0.8, 1.2, 0.53);
  // wheels: hub, 12 spokes, wooden felloe, rubber tyre; mudguards
  c.wheels = [];
  for (const [x, z, r] of [[-0.78, 0.92, 0.44], [0.78, 0.92, 0.44], [-0.78, -0.92, 0.5], [0.78, -0.92, 0.5]]) {
    const w = new THREE.Group(); w.position.set(x, r, z); c.add(w); w.r = r;
    const tire = new THREE.Mesh(new THREE.TorusGeometry(r - 0.045, 0.05, 10, 32), blk); tire.rotation.y = Math.PI / 2; w.add(tire);
    const fel = new THREE.Mesh(new THREE.TorusGeometry(r - 0.1, 0.028, 6, 32), wood); fel.rotation.y = Math.PI / 2; w.add(fel);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 12), brass); hub.rotation.z = Math.PI / 2; w.add(hub);
    for (let k = 0; k < 12; k++) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, r * 2 - 0.2, 6), wood); sp.rotation.x = k * Math.PI / 12; w.add(sp); }
    for (const m of w.children) m.castShadow = true;
    const fg = new THREE.Mesh(new THREE.TorusGeometry(r + 0.06, 0.09, 6, 20, Math.PI * 0.62), blk); fg.scale.set(1, 1, 1.6); fg.rotation.set(0, Math.PI / 2, Math.PI * 0.19); fg.position.set(x, r, z); fg.castShadow = true; body.add(fg);
    c.wheels.push(w);
  }
  dressCar(body);
  scene.add(c); world.car = c;
}
{ // stadium finish at x = 400: track along z
  const g = new THREE.Group(); g.position.set(400, 0, 0);
  boxAt(g, -60, 60, -0.1, 0, -80, 60, macro(toon({ map: P.grass(2, { seed: 77 }) }), 0.24, 0.03), 2);
  boxAt(g, -3.5, 3.5, -0.05, 0.01, -80, 60, macro(toon({ map: P.dirt(7, 3, { ruts: [[0.3, 0.05], [0.7, 0.05]], cracks: 4, seed: 19 }) }), 0.1, 0.05), 3);
  const stand = toon({ map: P.boards('#e8dcc0') }), roof = toon({ color: 0x8a3b3a });
  dressStadium(g); dressGate(g);
  const post = toon({ color: 0xf2f0ea });
  for (const x of [-3.8, 3.8]) boxAt(g, x - 0.12, x + 0.12, 0, 4.2, 4.9, 5.1, post, 1);
  const ban = new THREE.Mesh(new THREE.BoxGeometry(8, 1.1, 0.12), [post, post, post, post, toon({ map: P.banner('FINISH', '#f2f0ea', '#c0453a') }), post]); ban.position.set(0, 4.3, 5); ban.castShadow = true; g.add(ban);
  const gate = new THREE.Mesh(new THREE.BoxGeometry(14, 2, 0.4), [post, post, post, post, toon({ map: P.banner('ST. LOUIS 1904', '#1f3a6a', '#f2e6c0') }), post]); gate.position.set(0, 9.5, -34); g.add(gate); world.gate = gate; world.gateTex = [gate.material[4], toon({ map: P.banner('BOSTON 1905', '#7a1f2a', '#f2e6c0') })];
  const tape = []; for (const sd of [-1, 1]) { const t = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 0.03), toon({ color: 0xf2f0ea })); const piv = new THREE.Group(); piv.position.set(sd * 3.8, 1.2, 5); t.position.set(-sd * 1.9, 0, 0); piv.add(t); g.add(piv); tape.push(piv); }
  world.tape = tape;
  for (const x of [-3.3, -1.1, 1.1, 3.3]) boxAt(g, x - 0.04, x + 0.04, 0.012, 0.02, -80, 60, toon({ color: 0xfbfbf6 }), 1);
  const boardTex = [P.banner('OLYMPIC GAMES', '#1f3a6a', '#f2e6c0'), P.banner('ST. LOUIS 1904', '#c0453a', '#fff6e0'), P.banner('MARATHON', '#f2e6c0', '#1f3a6a')];
  for (let i = 0; i < 9; i++) for (const s of [-1, 1]) { const mt = toon({ map: boardTex[(i + (s > 0 ? 1 : 0)) % 3] }), wt = toon({ color: 0xe8dcc0 }); const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 4.2), [mt, mt, wt, wt, wt, wt]); b.position.set(s * 4.6, 0.45, -26 + i * 4.6); b.castShadow = true; g.add(b); (world.boards || (world.boards = [])).push([b, mt]); }
  boxAt(g, 4.9, 7.1, 0.75, 0.85, 1.5, 3.0, toon({ map: P.boards('#7a4e2c') }), 1); for (const [tx, tz] of [[5.0, 1.6], [7.0, 1.6], [5.0, 2.9], [7.0, 2.9]]) boxAt(g, tx - 0.05, tx + 0.05, 0, 0.75, tz - 0.05, tz + 0.05, toon({ color: 0x5a3a22 }), 1);
  add(g, new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 12, 1, true), toon({ color: 0xe0b450 })), 5.6, 1.0, 2.2).rotation.z = Math.PI / 2;
  const cam = new THREE.Group(); cam.position.set(-5.2, 0, 7.5); g.add(cam); for (let k = 0; k < 3; k++) { const leg = add(cam, new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 1.6, 6), toon({ color: 0x7a4e2c })), 0.3 * Math.cos(k * 2.1), 0.75, 0.3 * Math.sin(k * 2.1)); leg.rotation.set(0.2 * Math.sin(k * 2.1), 0, -0.2 * Math.cos(k * 2.1)); }
  boxAt(cam, -0.25, 0.25, 1.55, 1.95, -0.3, 0.3, toon({ color: 0x3a2a22 }), 1); add(cam, new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.25, 12), toon({ color: 0xe0b450 })), 0, 1.75, 0.42).rotation.x = Math.PI / 2; boxAt(cam, -0.3, 0.3, 1.95, 2.05, -0.35, 0.2, toon({ color: 0x1d1b22 }), 1);
  scene.add(g); world.stadium = g;
  const bt = [P.banner('BOSTON MARATHON', '#7a1f2a', '#f2e6c0'), P.banner('B.A.A. 1905', '#f2e6c0', '#7a1f2a'), P.banner('BOSTON MARATHON', '#1f3a6a', '#f2e6c0')].map((m) => toon({ map: m }));
  let bos = null; world.setBoston = (on) => { if (bos === on) return; bos = on; setStadiumName(on); const mm = world.gate.material.slice(); mm[4] = on ? world.gateTex[1] : world.gateTex[0]; world.gate.material = mm;
    world.boards.forEach(([b, mt], i) => { const m2 = b.material.slice(); m2[0] = m2[1] = on ? bt[i % 3] : mt; b.material = m2; }); };
}
const docTex = [P.doc(false), P.doc(true)];
{ // office 1908 at x = -400
  const g = new THREE.Group(); g.position.set(-400, 0, 0);
  dressOffice(g);
  const doc = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 1.0), toon({ map: docTex[0] })); doc.rotation.x = -Math.PI / 2; doc.rotation.z = 0.08; doc.position.set(0.1, 0.93, -0.35); g.add(doc); world.doc = doc;
  const shaft = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 4.5), new THREE.MeshBasicMaterial({ color: 0xfff2c8, transparent: true, opacity: 0.09, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); shaft.scale.set(0.6, 0.8, 1); shaft.position.set(-1.6, 2.0, -2.4); shaft.rotation.set(-0.35, 0, -0.3); g.add(shaft); NOND.add(shaft);
  scene.add(g); world.office = g;
}
world.docTex = docTex;
// [KITTY-rooms] 1960s interiors at x=-800: lab z=0, CIA office z=100, living room z=200 (hidden until shown)
const rooms = buildRooms({ THREE, toon, mkTex, PT, NOND, scene }); world.rooms = rooms;
world.dc = buildDC({ THREE, toon, rnd, P, mkTex, macro }); scene.add(world.dc); world.dc.visible = false; // [KITTY-dc]
// [MONA-louvre] Louvre sets near (0, 0, -1600) (hidden until shown). ?louvreview=N renders test view N (?louvreview=f: view = frame number)
const louvre = buildLouvre({ THREE, toon, mkTex, PT, NOND, scene }); world.louvre = louvre; const LVQ = (location.search.match(/louvreview=(\d+|f)/) || [])[1]; // [MONA-louvre]
const paris = buildParis({ THREE, toon, mkTex, PT, NOND, scene, macro, drawMona }); world.paris = paris; // [MONA-paris] Paris 1911 / Florence 1913 sets at x=1600 (hidden until shown)
const PARISV = (location.search.match(/parisview=(\d+|a)/) || [])[1]; // [MONA-paris] ?parisview=N test view N (?parisview=a: view = frame number)
const station = buildStation({ THREE, toon, mkTex, PT, NOND, scene, macro }); world.station = station; const STV = (location.search.match(/stationview=(\d+|a)/) || [])[1]; // [BOOTH-station] 1864 Jersey City platform + 1881 B&P waiting room at x=-1600 (hidden until shown); ?stationview=N test view
const theatre = buildTheatre({ THREE, toon, mkTex, PT, NOND, scene, macro }); world.theatre = theatre; globalThis.__theatre = theatre; /* [BOOTH-story] setAt drives setDim before lightFor */ const THV = (location.search.match(/theatreview=(\d+|a)/) || [])[1]; // [BOOTH-theatre] Ford's 1865 / Booth's dressing room / 1901 expo / study at x=-1600, z 400..1000 (hidden until shown); ?theatreview=N test view (a: view = frame)
const reef = buildReef({ THREE, toon, mkTex, PT, NOND, scene }); world.reef = reef; const RFV = (location.search.match(/reefview=(\d+|a)/) || [])[1]; // [CASTRO-reef] beach / underwater / senate / shoes at z=3200 (hidden until shown); ?reefview=N test view (a: view = frame)
const havana = buildHavana({ THREE, toon, mkTex, PT, NOND, scene, macro }); world.havana = havana; const HVQ = (location.search.match(/havanaview=(\d+|a)/) || [])[1]; // [CASTRO-havana] 1960-63 Havana sets at x=3200 (plaza/radio/talks/cigar, hidden until shown); ?havanaview=N test view
const brooklyn = buildBrooklyn({ THREE, toon, mkTex, PT, NOND, scene }); world.brooklyn = brooklyn; const BKV = (location.search.match(/brooklynview=(\d+|a)/) || [])[1]; // [TEDDY-brooklyn] 1902 Brooklyn street/window/shop/kids/world at x=3200, z=-3200..-3500 (hidden until shown); ?brooklynview=N test view
const swamp = buildSwamp({ THREE, toon, mkTex, PT, NOND, scene, macro, camera }); world.swamp = swamp; const SWV = (location.search.match(/swampview=(\d+|a)/) || [])[1]; // [TEDDY-swamp] swamp / camp / willow / newsroom at x=-3200..-4100, z=-3200 (hidden until shown); ?swampview=N test view
const princeton = buildPrinceton({ THREE, toon, mkTex, PT, NOND, scene, macro, camera }); world.princeton = princeton; const EIV = (location.search.match(/einview=(\d+|a)/) || [])[1]; // [EIN-sets] study / house / embassy / jerusalem / cosmos at x=-6400..-7600, z=0 (hidden until shown); ?einview=N test view
const harbor = buildHarbor({ THREE, toon, mkTex, PT, NOND, scene, macro, camera }); world.harbor = harbor; const HBV = (location.search.match(/hbview=(\d+|a)/) || [])[1]; // [LIB-harbor]
const egypt = buildEgypt({ THREE, toon, mkTex, PT, NOND, scene, macro, camera }); world.egypt = egypt; const EGV = (location.search.match(/egview=(\d+|a)/) || [])[1]; // [LIB-egypt] colossi / canal / palace at x=-9000, z=0..1200 (hidden until shown); ?egview=N test view
const ohio = buildOhio({ THREE, toon, mkTex, PT, NOND, scene, macro, camera }); world.ohio = ohio; const OHV = (location.search.match(/ohview=(\d+|a)/) || [])[1]; // [KCH-sets1] lecture / street / diner at x=-14000, z=0..1200 (hidden until shown); ?ohview=N test view
const pills = buildPills({ THREE, toon, mkTex, PT, NOND, scene, camera }); world.pills = pills; const PLV = (location.search.match(/plview=(\d+|a)/) || [])[1]; // [KCH-sets2] workshop / press / lab at x=-16500 (hidden until shown); ?plview=N test view
const homes = buildHomes({ THREE, toon, mkTex, PT, NOND, scene, macro, camera }); world.homes = homes; const DHV = (location.search.match(/dhview=(\d+|a)/) || [])[1]; // [PD-sets1] parlor / home50 / classroom at x=-19000, z=0..1200 (hidden until shown); ?dhview=N test view
const titanic = buildTitanic({ THREE, toon, mkTex, PT, NOND, scene, macro, camera }); world.titanic = titanic; const napoleon = buildNapoleon({ THREE, toon, mkTex, PT, NOND, scene, macro, camera }); world.napoleon = napoleon; const cleo = buildCleo({ THREE, toon, mkTex, PT, NOND, scene, macro, camera }); world.cleo = cleo; const CLV = (location.search.match(/clview=(\d+|a)/) || [])[1]; /* [CLEO-sets] giza/terrace/ruins (-52000,0,0/800/1600) road/moon/classroom (-54500,0,0/800/1600); ?clview=N */ const NPV = (location.search.match(/npview=(\d+|a)/) || [])[1]; /* [NAP-sets] ?npview=N */ const TIV = (location.search.match(/tiview=(\d+|a)/) || [])[1]; // [JG-sets] galley / deck / cabin / home at x=-24000, stern x=-26000, ocean x=-28000 (hidden until shown); ?tiview=N test view
const works = buildWorks({ THREE, toon, mkTex, PT, NOND, scene, macro, camera }); world.works = works; const DWV = (location.search.match(/dwview=(\d+|a)/) || [])[1]; // [PD-sets2] factory / toystore / playroom at x=-21500, z=0..1200 (hidden until shown); ?dwview=N test view
const hw = buildHW({ THREE, toon, mkTex, PT, NOND, scene, macro, camera }); world.hw = hw; const HWV = (location.search.match(/hwview=(\d+|a)/) || [])[1]; // [HW-sets] hill (-34000,0,0) / office (-36500,0,0) / gala (-36500,0,600) (hidden until shown); ?hwview=N test view
const ln = buildLN({ THREE, toon, mkTex, PT, NOND, scene, macro, camera }); world.ln = ln; const lb = buildLB({ THREE, toon, mkTex, PT, NOND, scene, macro, camera }); world.lb = lb; const nt = buildNT({ THREE, toon, mkTex, PT, NOND, scene, macro, camera }); world.nt = nt; const NTV = (location.search.match(/ntview=(\d+|a)/) || [])[1]; /* [NT-sets] shop/street/office (-70000,0,0/800/1600) home (-72500,0,0); ?ntview=N */ const LBV = (location.search.match(/lbview=(\d+|a)/) || [])[1]; /* [LB-sets] farm/shop/office (-64000,0,0/800/1600) factory/show (-66500,0,0/800); ?lbview=N */ const LNV = (location.search.match(/lnview=(\d+|a)/) || [])[1]; // [LN-sets] village/store/cabin (-46000,0,0..1200) / camp/hall (-48500,0,0..600) (hidden until shown); ?lnview=N test view
const bw = buildBW({ THREE, toon, mkTex, PT, NOND, scene, macro, camera }); world.bw = bw; const BWV = (location.search.match(/bwview=(\d+|a)/) || [])[1]; // [BW-sets] garage/living/green (-40000,0,0/600/1200) / factory/computer/modern (-42500,0,0/600/1200) (hidden until shown); ?bwview=N test view
// ---------- lighting practicals: lanterns hung on the road's telegraph poles, lit only in dark presets ----------
const LANT = []; // world-space bulb positions per set: { set, p:[x,y,z] }
{ const glassM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc477).multiplyScalar(3.2), fog: false }), capM = toon({ color: 0x1d1b22 });
  const lg = new THREE.Group(); lg.visible = false; world.road.add(lg); world.lanterns = lg;
  for (let z = -390; z < 40; z += 24) { const x = 5.75, y = 6.85;
    boxAt(lg, x - 0.012, x + 0.012, y + 0.22, 7.3, z - 0.012, z + 0.012, capM, 1);
    const cap = add(lg, new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.14, 4), capM), x, y + 0.2, z); cap.rotation.y = Math.PI / 4;
    const gl = add(lg, new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 0.2), glassM), x, y, z); gl.castShadow = false; gl.receiveShadow = false;
    boxAt(lg, x - 0.13, x + 0.13, y - 0.18, y - 0.14, z - 0.13, z + 0.13, capM, 1);
    LANT.push({ set: 'road', p: [x, y - 0.25, z] }); }
  LANT.push({ set: 'office', p: [-400 + 1.2, 1.6, -0.8] });
}
function placePracticals(L, tgt) {
  const on = (L.practI || 0) > 0;
  world.lanterns.visible = on;
  const set = world.road.visible ? 'road' : world.office.visible ? 'office' : 'stadium';
  const cand = on ? LANT.filter((l) => l.set === set).sort((a, b) => Math.hypot(a.p[0] - tgt.x, a.p[2] - tgt.z) - Math.hypot(b.p[0] - tgt.x, b.p[2] - tgt.z)) : [];
  // an off-screen practical just behind/beside the action makes a warm pool on the ground around the characters
  if (on && L.practKey) cand.unshift({ key: true, p: [tgt.x + L.practKey[0], L.practKey[1], tgt.z + L.practKey[2]] });
  PRACT.forEach((l, i) => { const c = cand[i]; l.visible = on; if (!c) { l.intensity = 0; return; }
    const key = !!c.key; l.position.set(...c.p); l.color.set(L.practCol || '#ffb060'); l.intensity = key ? L.practKeyI ?? L.practI : L.practI; l.distance = key ? L.practKeyD ?? 9 : L.practD || 16; l.decay = key ? 2 : 1.6; });
}
// clouds (painted billboards)
const cloudTex = [0, 1, 2].map((s) => { const c = document.createElement('canvas'); c.width = 600; c.height = 300; { const g = c.getContext('2d'); const blobs = [[150, 190, 80], [250, 150, 105], [360, 160, 95], [450, 195, 70], [300, 210, 90]]; for (const [col, dy, k] of [['#c9c2e6', 26, 1], ['#e6e8f6', 10, 0.97], ['#ffffff', 0, 0.9]]) { g.fillStyle = col; for (const [x, y, r] of blobs) { g.beginPath(); g.ellipse(x + ((s * 37) % 20) - 10, y - dy * 0 + (k < 1 ? -8 : 0), r * k, r * 0.8 * k, 0, 0, 7); g.fill(); } g.beginPath(); g.ellipse(300, 235 - (k < 1 ? 10 : 0), 230 * k, 40 * k, 0, 0, 7); g.fill(); } } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; });
const clouds = [];
for (let i = 0; i < 26; i++) {
  const a = rnd(i * 3) * Math.PI * 2, d = 700 + 500 * rnd(i * 5), s = 160 + 160 * rnd(i * 7);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s / 2), new THREE.MeshBasicMaterial({ map: cloudTex[i % 3], transparent: true, fog: false, depthWrite: false, color: 0xffffff }));
  m.position.set(Math.cos(a) * d, 60 + 140 * rnd(i * 11), Math.sin(a) * d); m.renderOrder = -5;
  scene.add(m); NOND.add(m); clouds.push(m);
}

// ---------- cards ----------
const SU = 0.00225;
const BODY = new THREE.PlaneGeometry(600 * SU, 1000 * SU); BODY.translate(0, 475 * SU, 0);
const HORSEG = new THREE.PlaneGeometry(1000 * SU, 880 * SU); HORSEG.translate(0, 410 * SU, 0);
const BOARDG = new THREE.PlaneGeometry(600 * SU, 800 * SU); BOARDG.translate(0, 390 * SU, 0);
const drawBoard = (p, a) => {
  const g = p.g;
  p.stroke([[170, 790], [300, 120]], 14, '#6b4a32'); p.stroke([[430, 790], [300, 120]], 14, '#6b4a32'); p.stroke([[300, 790], [300, 470]], 12, '#5a3c28');
  p.poly([[50, 90], [550, 90], [550, 480], [50, 480]], '#8a5a34', 10); p.poly([[78, 116], [522, 116], [522, 454], [78, 454]], '#2f4a3a', 6);
  g.fillStyle = '#f2f2ea'; g.font = 'bold 128px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(a.text || '', 300, 230);
  const n = a.n || 0;
  for (let i = 0; i < Math.min(n, 30); i++) { const grp = Math.floor(i / 5), k = i % 5, row = Math.floor(grp / 4), x0 = 110 + (grp % 4) * 105, y0 = 340 + row * 58;
    if (k < 4) p.stroke([[x0 + k * 18, y0], [x0 + k * 18 + 3, y0 + 46]], 7, '#f2f2ea'); else p.stroke([[x0 - 8, y0 + 34], [x0 + 70, y0 + 8]], 7, '#f2f2ea'); }
};
const UNIT = new THREE.PlaneGeometry(1, 1);
const blobTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(20,16,30,0.55)'); r.addColorStop(0.6, 'rgba(20,16,30,0.3)'); r.addColorStop(1, 'rgba(20,16,30,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
const pool = new Map(), free = [];
function canvasFor(key, w, h, k, draw, used) {
  const id = `${w}x${h}|${key}`;
  used.add(id);
  let e = pool.get(id);
  if (!e) {
    const i = free.findIndex((x) => x.w === w * k && x.h === h * k);
    e = i >= 0 ? free.splice(i, 1)[0] : (() => { const c = document.createElement('canvas'); c.width = w * k; c.height = h * k; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { c, t, w: w * k, h: h * k }; })();
    const g = e.c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(k, 0, 0, k, 0, 0);
    draw(new T.Pen(g)); e.t.needsUpdate = true; pool.set(id, e);
  }
  return e.t;
}
const cardMeshes = [], fxMeshes = [], blobMeshes = [];
const getMesh = (arr, i, mk) => arr[i] || (arr[i] = mk());
const mkCard = () => { const m = new THREE.Mesh(BODY, new THREE.MeshLambertMaterial({ alphaTest: 0.5, side: THREE.DoubleSide, emissive: 0xffffff, emissiveIntensity: 0.86 })); m.receiveShadow = true; m.castShadow = true; m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaTest: 0.5, side: THREE.DoubleSide }); m.renderOrder = 1; scene.add(m); CARDS.add(m); return m; };
const mkFx = () => { const m = new THREE.Mesh(UNIT, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide })); m.renderOrder = 3; scene.add(m); NOND.add(m); return m; };
const mkBlob = () => { const m = new THREE.Mesh(UNIT, new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.renderOrder = 0; scene.add(m); NOND.add(m); return m; };
const OUT = { FRED: T.FRED, HICKS: T.HICKS, DRIVER: T.DRIVER, OFFICIAL: T.OFFICIAL, KID: T.KID };
const SK = ['#f6c9a4', '#e8b48a', '#c98a5e', '#8a5a3e'];
const ODD = {
  FRED: { trim: '#c0453a', sash: '#c0453a', shirt: '#f4f2ea', pants: '#2f3a5a', hair: 'side', hairCol: '#3a2a20', bib: '31', skin: '#f6c9a4', head: 'egg', build: 'thin', noButtons: true },
  HICKS: { trim: '#f2f0ea', sash: '#f2f0ea', shirt: '#3f6fb5', pants: '#f2f0ea', hair: 'short', hairCol: '#7a4a2a', bib: '20', moustache: '#5a3a22', skin: '#f0c098', head: 'round', noButtons: true },
  DRIVER: { pattern: 'tweed', shirt: '#c9a46a', pants: '#5a4a3a', hat: 'cap', hatCol: '#5a4a3a', hair: 'short', hairCol: '#5a3a22', glasses: true, neck: 'scarf', neckCol: '#c0453a', skin: '#f0b890', head: 'wide' },
  OFFICIAL: { pattern: 'pinstripe', shirt: '#2a2d3a', pants: '#2a2d38', hat: 'top', hair: 'bald', hairCol: '#cfcbc6', moustache: '#e8e4dc', build: 'stout', head: 'wide', neck: 'tie', neckCol: '#8c2a3a', skin: '#f5c9a0', nose: 'round' },
  ROBERT: { shirt: '#2a2a36', pants: '#2a2a32', hat: 'top', hair: 'side', hairCol: '#2a1e18', neck: 'bow', neckCol: '#1e1e26', build: 'thin', head: 'egg', skin: '#f2c8a0', collar: '#f4f2ea' },
  ROBERT_OLD: { pattern: 'pinstripe', shirt: '#2e2c34', pants: '#2a2a30', hat: 'top', hair: 'side', hairCol: '#5a4a40', moustache: '#4a3a30', neck: 'tie', neckCol: '#5a2a30', build: 'stout', head: 'wide', skin: '#f0c098', glasses: false },
  EDWIN: { shirt: '#1e1a22', pants: '#1e1a22', hair: 'curly', hairCol: '#1a1414', moustache: '#1a1414', neck: 'scarf', neckCol: '#5a1e24', build: 'thin', head: 'tall', skin: '#f2c8a4' },
  JWB: { shirt: '#141218', pants: '#141218', hat: 'fedora', hatCol: '#141218', hair: 'curly', hairCol: '#141012', moustache: '#141012', build: 'adult', head: 'egg', skin: '#d8b090' },
  CONDUCTOR: { shirt: '#24325a', pants: '#24325a', hat: 'cap', hatCol: '#1a2442', hair: 'short', hairCol: '#8a6a4a', moustache: '#8a6a4a', neck: 'tie', neckCol: '#1a1a22', build: 'stout', head: 'round', skin: '#f0c098', button: '#e0b84a' },
  PERUGGIA: { shirt: '#f0eee6', pants: '#3a3430', hat: 'cap', hatCol: '#4a4038', hair: 'short', hairCol: '#2a1a12', moustache: '#2a1a12', build: 'thin', head: 'egg', skin: '#e8b48a', noButtons: true, collar: '#f0eee6' },
  GUARD: { shirt: '#26304a', pants: '#26304a', hat: 'cap', hatCol: '#1e2438', hair: 'short', hairCol: '#5a4a3a', moustache: '#5a4a3a', build: 'stout', head: 'wide', skin: '#f0c098', neck: 'tie', neckCol: '#c8a040', button: '#e0b84a' },
  PAINTER: { pattern: 'tweed', shirt: '#7a5a3a', pants: '#3a3430', hat: 'cap', hatCol: '#2a2a3a', hair: 'curly', hairCol: '#4a3426', moustache: '#4a3426', neck: 'bow', neckCol: '#3a5a8a', build: 'adult', head: 'round', skin: '#f6c9a4' },
  NEWSBOY: { pattern: 'plaid', shirt: '#8a6a4a', pants: '#3b3f52', hat: 'cap', hatCol: '#5a4a3a', hair: 'short', hairCol: '#b07a3a', build: 'kid', head: 'round', skin: '#ffe2c2' },
  DEALER: { pattern: 'pinstripe', shirt: '#3a2e2a', pants: '#2e2a28', hair: 'side', hairCol: '#2a1e18', moustache: '#2a1e18', glasses: true, neck: 'tie', neckCol: '#7a2a3a', build: 'stout', head: 'wide', skin: '#e8b48a' },
  POLICE: { shirt: '#1e2230', pants: '#1e2230', hat: 'cap', hatCol: '#14161e', hair: 'short', hairCol: '#2a1e18', moustache: '#2a1e18', neck: 'tie', neckCol: '#b0303a', build: 'adult', head: 'egg', skin: '#d8a070', button: '#e0b84a' },
  AGENT1: { shirt: '#3a4050', pants: '#2e3240', hat: 'fedora', hatCol: '#3a3430', hair: 'short', hairCol: '#2a1e18', neck: 'tie', neckCol: '#1e2a40', build: 'adult', head: 'egg', skin: '#f0c098', glasses: false },
  AGENT2: { shirt: '#5a5448', pants: '#3a3630', hat: 'fedora', hatCol: '#5a4a38', hair: 'short', hairCol: '#7a5a3a', neck: 'tie', neckCol: '#6a2a2a', build: 'stout', head: 'wide', skin: '#e8b48a', glasses: true },
  SOV1: { pattern: 'tweed', shirt: '#4a4a52', pants: '#2e2e36', hat: 'fedora', hatCol: '#2a2a30', hair: 'short', hairCol: '#3a3a3a', moustache: '#3a3a3a', neck: 'scarf', neckCol: '#7a2a2a', build: 'stout', head: 'wide', skin: '#f2c8a8' },
  SOV2: { shirt: '#3a3e46', pants: '#26282e', hat: 'fedora', hatCol: '#1e2024', hair: 'short', hairCol: '#c8c0b0', neck: 'tie', neckCol: '#3a3a3a', build: 'thin', head: 'tall', skin: '#f6d0b0', glasses: true },
  SURG1: { shirt: '#e8f0ec', pants: '#9ac8b8', hat: 'surgcap', hatCol: '#8ac0b0', hair: 'short', hairCol: '#3a2a20', build: 'adult', head: 'round', skin: '#f0c098', glasses: true, noButtons: true },
  SURG2: { shirt: '#e8f0ec', pants: '#9ac8b8', hat: 'surgcap', hatCol: '#8ac0b0', hair: 'bun', hairCol: '#6a3a24', build: 'thin', head: 'egg', skin: '#c98a5e', lashes: true, noButtons: true },
  GRANNY: { pattern: 'dots', dotCol: 'rgba(255,240,250,0.8)', shirt: '#c86a8a', pants: '#5a3a5a', hair: 'bun', hairCol: '#d8d4d0', glasses: true, lashes: true, build: 'stout', head: 'round', skin: '#f6d0b0', neck: 'bow', neckCol: '#f2e8d8' },
  BAAOFF: { pattern: 'tweed', shirt: '#6a4a32', pants: '#3a3040', hat: 'bowler', hair: 'short', hairCol: '#8a6a4a', moustache: '#8a6a4a', build: 'adult', head: 'round', neck: 'bow', neckCol: '#2f4a8a', skin: '#f0c098' },
  KID: { pattern: 'dots', shirt: '#f08a2c', stripe: '#f6c060', pants: '#3b5b9a', hat: 'cap', hatCol: '#e2453c', hair: 'short', hairCol: '#3a2a20', build: 'kid', head: 'round', skin: '#ffe2c2' },
};
// [BOOTH-story] period crowds: C64_* Jersey City 1864, AUD* New York theatre 1864, C81_* Washington 1881, C01_* Buffalo 1901 (no extra is reused across times/places)
Object.assign(ODD, {
  C64_0: { shirt: '#2c3d6e', pants: '#4a5a8a', hat: 'cap', hatCol: '#2c3d6e', hair: 'short', hairCol: '#6a4a2a', moustache: '#6a4a2a', build: 'adult', head: 'round', skin: '#f0c098', button: '#e0b84a', neck: 'tie', neckCol: '#1e2440' },
  C64_1: { shirt: '#5a2a4a', pants: '#3a2a3a', hair: 'bun', hairCol: '#3a2418', lashes: true, head: 'egg', skin: '#f2c8a8', neck: 'bow', neckCol: '#e8dcc8' },
  C64_2: { pattern: 'tweed', shirt: '#5a4a3a', pants: '#3a3430', hat: 'bowler', hatCol: '#2a2420', hair: 'short', hairCol: '#5a3a22', moustache: '#5a3a22', build: 'stout', head: 'wide', skin: '#e8b48a', neck: 'tie', neckCol: '#6a2a2a' },
  C64_3: { shirt: '#2a4a5a', pants: '#2a3a44', hair: 'long', hairCol: '#7a4a24', lashes: true, head: 'round', skin: '#f6d0b0' },
  C64_4: { shirt: '#2a2a30', pants: '#4a4440', hat: 'top', hair: 'short', hairCol: '#8a8078', moustache: '#c8c0b0', build: 'adult', head: 'tall', skin: '#f0c8a8', neck: 'tie', neckCol: '#3a3a5a' },
  C64_5: { shirt: '#3a3a40', pants: '#2a2a30', hat: 'cap', hatCol: '#2a2a30', hair: 'short', hairCol: '#1a1410', build: 'adult', head: 'egg', skin: '#8a5a3e', neck: 'scarf', neckCol: '#8a6a3a' },
  C64_6: { shirt: '#2c3d6e', pants: '#4a5a8a', hat: 'cap', hatCol: '#2c3d6e', hair: 'side', hairCol: '#b07a3a', build: 'thin', head: 'egg', skin: '#f6c9a4', button: '#e0b84a', neck: 'tie', neckCol: '#1e2440' },
  C64_7: { shirt: '#6a4a2a', pants: '#4a3020', hair: 'curly', hairCol: '#2a1a12', lashes: true, head: 'wide', skin: '#c98a5e', neck: 'bow', neckCol: '#f2e8d8' },
  C64_8: { pattern: 'plaid', shirt: '#4a5a3a', pants: '#3a3430', hat: 'cap', hatCol: '#3a3020', hair: 'short', hairCol: '#3a2a20', build: 'thin', head: 'round', skin: '#f0c098', neck: 'scarf', neckCol: '#7a2a2a' },
  C64_9: { shirt: '#3a2a24', pants: '#2a2420', hat: 'bowler', hair: 'short', hairCol: '#2a1a12', moustache: '#2a1a12', build: 'adult', head: 'egg', skin: '#d8a070', neck: 'bow', neckCol: '#1e1e26' },
  AUD0: { shirt: '#4a2a3a', pants: '#2a2028', hair: 'bun', hairCol: '#5a3a22', lashes: true, head: 'round', skin: '#f6d0b0', neck: 'bow', neckCol: '#f0e0c8' },
  AUD1: { pattern: 'pinstripe', shirt: '#26242c', pants: '#26242c', hair: 'side', hairCol: '#3a2a20', moustache: '#3a2a20', build: 'adult', head: 'wide', skin: '#f0c098', neck: 'bow', neckCol: '#f2f0ea' },
  AUD2: { shirt: '#2a3a2a', pants: '#2a2a24', hair: 'long', hairCol: '#2a1a12', lashes: true, head: 'egg', skin: '#e8b48a' },
  AUD3: { shirt: '#30283a', pants: '#2a2430', hair: 'curly', hairCol: '#9a7a5a', moustache: '#9a7a5a', build: 'stout', head: 'round', skin: '#f2c8a8', neck: 'tie', neckCol: '#8a2a2a' },
  AUD4: { shirt: '#5a3a2a', pants: '#3a2a20', hair: 'side', hairCol: '#1a1410', build: 'thin', head: 'tall', skin: '#c98a5e', neck: 'bow', neckCol: '#1e1e26' },
  C81_0: { pattern: 'tweed', shirt: '#6a5a44', pants: '#4a4034', hat: 'bowler', hatCol: '#3a3028', hair: 'short', hairCol: '#7a5a3a', moustache: '#7a5a3a', build: 'adult', head: 'round', skin: '#f0c098', neck: 'tie', neckCol: '#2a4a6a' },
  C81_1: { shirt: '#7a3a3a', pants: '#4a2a2a', hair: 'bun', hairCol: '#b07a3a', lashes: true, head: 'egg', skin: '#f6d0b0', neck: 'bow', neckCol: '#f2e8d8' },
  C81_2: { shirt: '#2a3440', pants: '#2a2e36', hat: 'top', hair: 'short', hairCol: '#c8c0b0', moustache: '#e0dcd4', build: 'stout', head: 'wide', skin: '#f2c8a8', neck: 'tie', neckCol: '#5a2a3a' },
  C81_3: { shirt: '#3a5a4a', pants: '#2a3a34', hair: 'curly', hairCol: '#3a2418', lashes: true, head: 'round', skin: '#e8b48a' },
  C81_4: { pattern: 'plaid', shirt: '#5a4a6a', pants: '#34303a', hat: 'cap', hatCol: '#3a3440', hair: 'short', hairCol: '#2a1a12', build: 'thin', head: 'tall', skin: '#8a5a3e', neck: 'scarf', neckCol: '#a07a3a' },
  C81_5: { shirt: '#44322a', pants: '#2e2620', hat: 'bowler', hair: 'side', hairCol: '#5a3a22', moustache: '#5a3a22', build: 'adult', head: 'egg', skin: '#f0c098', neck: 'bow', neckCol: '#2a2a3a' },
  C01_0: { shirt: '#e8e0cc', pants: '#3a3a44', hat: 'bowler', hatCol: '#2a2622', hair: 'short', hairCol: '#5a3a22', moustache: '#5a3a22', build: 'adult', head: 'wide', skin: '#f0c098', neck: 'tie', neckCol: '#2a3a6a' },
  C01_1: { shirt: '#c8a0b8', pants: '#5a4a5a', hair: 'bun', hairCol: '#7a4a24', lashes: true, head: 'egg', skin: '#f6d0b0', neck: 'bow', neckCol: '#f2f0ea' },
  C01_2: { pattern: 'pinstripe', shirt: '#4a4a5a', pants: '#3a3a44', hat: 'fedora', hatCol: '#4a3a30', hair: 'short', hairCol: '#2a1a12', build: 'thin', head: 'round', skin: '#e8b48a', neck: 'tie', neckCol: '#7a2a2a' },
  C01_3: { shirt: '#9ab0c8', pants: '#3a4a5a', hair: 'long', hairCol: '#d8a040', lashes: true, head: 'round', skin: '#f6d0b0' },
  C01_4: { pattern: 'tweed', shirt: '#7a6a4a', pants: '#4a4034', hat: 'cap', hatCol: '#5a4a38', hair: 'short', hairCol: '#b07a3a', build: 'stout', head: 'egg', skin: '#f2c8a8', neck: 'scarf', neckCol: '#3a5a3a' },
  C01_5: { shirt: '#2a2a32', pants: '#2a2a32', hat: 'top', hair: 'side', hairCol: '#3a2a20', moustache: '#3a2a20', build: 'adult', head: 'tall', skin: '#c98a5e', neck: 'bow', neckCol: '#c8a040' },
});
// [CASTRO-cast] 1960-63 Havana / 1963 Donovan / 1960s CIA / 1975 Senate / 2016 cast (oddverra_next.js features: beard, patrol cap, fatigues, boots, scuba, ...)
{ const CASTRO = { fatigue: true, shirt: '#5e6a3c', pants: '#59643a', belt: '#2e2a22', hat: 'patrol', hatCol: '#545e38', hair: 'short', hairCol: '#221814', beard: 'full', beardCol: '#2a1e1a', moustache: '#2a1e1a', boots: true, shoes: '#1e1a1e', build: 'tall', head: 'tall', skin: '#ecb88e', nose: 'long', cuff: '#5e6a3c' };
  Object.assign(ODD, {
    CASTRO, CASTRO_PATCHY: { ...CASTRO, beard: 'patchy' }, CASTRO_SHAVED: { ...CASTRO, beard: 'none' },
    CASTRO_DIVER: { ...CASTRO, scuba: true, shirt: '#1f2a3c', pants: '#1f2a3c', cuff: '#1f2a3c', hat: undefined, fatigue: false, boots: false, belt: undefined, noButtons: true },
    CASTRO_OLD: { track: true, shirt: '#22305a', pants: '#22305a', cuff: '#1a2448', noButtons: true, hair: 'receding', hairCol: '#cdc8c0', beard: 'full', beardCol: '#ece8e2', moustache: '#ece8e2', beardK: 0.82, build: 'thin', head: 'tall', skin: '#f0c4a4', nose: 'long', shoes: '#2a2a32' },
    CASTRO_OLD_GLASSES: { track: true, shirt: '#22305a', pants: '#22305a', cuff: '#1a2448', noButtons: true, hair: 'receding', hairCol: '#cdc8c0', beard: 'full', beardCol: '#ece8e2', moustache: '#ece8e2', beardK: 0.82, build: 'thin', head: 'tall', skin: '#f0c4a4', nose: 'long', shoes: '#2a2a32', glasses: true },
    DONOVAN: { shirt: '#7c8088', pants: '#73777f', neck: 'tie', neckCol: '#2a3a6a', collar: '#f4f2ea', glasses: true, hair: 'receding', hairCol: '#bcb8b2', build: 'adult', head: 'round', skin: '#f2c8a6', vest: '#7c8088' },
    CIA1: { shirt: '#2a2e3a', pants: '#262a34', neck: 'tie', neckCol: '#1c2232', tieK: 0.62, collar: '#f2f2ee', vest: '#2a2e3a', hair: 'crew', hairCol: '#5a4030', glasses: 'horn', build: 'adult', head: 'wide', skin: '#f0c098' },
    CIA2: { shirt: '#33353e', pants: '#2c2e35', neck: 'tie', neckCol: '#5a2a2e', tieK: 0.62, collar: '#f2f2ee', vest: '#33353e', hat: 'fedora', hatCol: '#2e2c30', hair: 'short', hairCol: '#2a1e18', build: 'thin', head: 'egg', skin: '#e8b48a' },
    CIA_LAB: { coat: true, shirt: '#f0f0ec', pants: '#3a3e4a', neck: 'tie', neckCol: '#2a3a5a', tieK: 0.7, collar: '#ffffff', cuff: '#f0f0ec', vest: '#f0f0ec', goggles: true, hair: 'side', hairCol: '#6a4a30', build: 'adult', head: 'round', skin: '#f2c8a6' },
    ENGINEER: { short: true, shirt: '#d2d8c6', pants: '#5a4a3a', pocket: '#3a5ab0', headphones: true, hair: 'short', hairCol: '#1e1612', moustache: '#1e1612', build: 'adult', head: 'round', skin: '#d8a070' },
    SENATOR: { shirt: '#3c3a44', pants: '#36343d', neck: 'tie', neckCol: '#8a5a2a', tieK: 1.3, collar: '#e8ecf2', vest: '#3c3a44', hair: 'side', hairCol: '#d4d0ca', glasses: true, build: 'old', head: 'wide', skin: '#f2c8a8' },
    CUBA0: { guayabera: true, short: true, shirt: '#f4f0e2', pants: '#c4b088', hat: 'straw', hair: 'short', hairCol: '#1a1410', moustache: '#1a1410', build: 'adult', head: 'round', skin: '#c98a5e', shoes: '#5a3a28' },
    CUBA1: { lashes: true, dress: true, short: true, pattern: 'dots', shirt: '#e0607a', pants: '#e0607a', hair: 'curly', hairCol: '#1a1210', head: 'egg', skin: '#e0a878', earring: '#f2cf5a', shoes: '#7a2a3a' },
    CUBA2: { guayabera: true, shirt: '#bcd4e6', pants: '#3a3a44', hair: 'side', hairCol: '#140e0c', build: 'thin', head: 'egg', skin: '#8a5a3e' },
    CUBA3: { lashes: true, dress: true, short: true, shirt: '#f0c850', pants: '#f0c850', hair: 'bun', hairCol: '#3a2418', head: 'round', skin: '#c98a5e', shoes: '#f2ece0' },
    CUBA4: { guayabera: true, short: true, shirt: '#ece2c8', pants: '#5a5040', hat: 'straw', hatCol: '#d0b068', hair: 'short', hairCol: '#c8c4bc', moustache: '#d8d4cc', build: 'stout', head: 'wide', skin: '#e0a878', shoes: '#3a2a20' },
    CUBA5: { lashes: true, dress: true, short: true, shirt: '#4ab0b0', pants: '#4ab0b0', hair: 'long', hairCol: '#2a1a12', head: 'egg', skin: '#f0c098', shoes: '#f2ece0' },
  }); }
// [CASTRO-story] six more 1960 Havana rally-goers (recoloured from CUBA0..5) so the plaza crowd does not repeat outfits side by side
Object.assign(ODD, { CUBA6: { ...ODD.CUBA0, shirt: '#e8c86a', pants: '#3a3440', hat: undefined, hair: 'curly', hairCol: '#140e0c', skin: '#8a5a3e', moustache: undefined },
  CUBA7: { ...ODD.CUBA1, shirt: '#5a8fc2', pants: '#5a8fc2', pattern: undefined, hair: 'long', skin: '#c98a5e' }, CUBA8: { ...ODD.CUBA2, shirt: '#f4f0e2', pants: '#5a5040', hat: 'straw', skin: '#e0a878' },
  CUBA9: { ...ODD.CUBA3, shirt: '#c84a3a', pants: '#c84a3a', hair: 'curly', hairCol: '#1a1210', skin: '#8a5a3e' }, CUBA10: { ...ODD.CUBA4, shirt: '#9ac8a0', hat: undefined, hair: 'short', hairCol: '#2a1e18', moustache: '#2a1e18', skin: '#c98a5e', build: 'adult' },
  CUBA11: { ...ODD.CUBA5, shirt: '#f0f0e8', pants: '#f0f0e8', pattern: 'dots', hair: 'bun', hairCol: '#3a2418', skin: '#e0a878' } });
// [TEDDY-cast] 1902 Mississippi hunt / Washington Post / 1902-03 Brooklyn / ending kids (oddverra_next.js: pince-nez, bushy moustache, slouch + wide hats,
// hunting jacket, bandana, knee boots, leggings, apron, sleeve garters, pencil, inky fingers, pyjamas, beanie, op.hug; props teddy rope pen newspaper needle; BEAR -> bear.js)
{ const TR = { hunt: true, shirt: '#a88a5a', pants: '#7a6446', belt: '#6a5236', hat: 'slouch', hatCol: '#8a6a48', neck: 'bandana', neckCol: '#b8323a', collar: '#e8dfc8', vest: '#8a7050', boots: 'knee', shoes: '#4a3022',
    hair: 'side', hairCol: '#6a4a30', moustache: '#7a5434', stache: 'bushy', glasses: 'pincenez', build: 'stout', head: 'wide', skin: '#f2c49c', nose: 'round', button: '#5a4030', cuff: '#a88a5a' };
  Object.assign(ODD, {
    TR, TR_SUIT: { shirt: '#262430', pants: '#24222c', vest: '#262430', neck: 'tie', neckCol: '#4a2a34', collar: '#f6f3ea', hair: 'side', hairCol: '#6a4a30', moustache: '#7a5434', stache: 'bushy', glasses: 'pincenez', build: 'stout', head: 'wide', skin: '#f2c49c', nose: 'round', noChain: false },
    COLLIER: { hunt: true, huntLong: true, shirt: '#6a5a44', pants: '#4a4034', belt: '#3a2c20', hat: 'wide', hatCol: '#5e4c3c', neck: 'scarf', neckCol: '#8a6a3a', collar: '#d8ccb0', vest: '#5a4636', boots: 'leggings', leggCol: '#8a5e36', shoes: '#3a2618',
      hair: 'short', hairCol: '#9a948c', beard: 'full', beardCol: '#d8d3ca', moustache: '#d8d3ca', beardShort: true, beardK: 0.78, build: 'adult', head: 'egg', skin: '#7a4c32', nose: 'round', button: '#3a2a1e', cuff: '#6a5a44', brow: '#d0c8bc' },
    GOVERNOR: { shirt: '#3a3440', pants: '#34303a', vest: '#4a3a3a', neck: 'tie', neckCol: '#6a2a2a', collar: '#f4f1e8', hat: 'bowler', hatCol: '#2a2420', hair: 'side', hairCol: '#4a3428', moustache: '#4a3428', build: 'adult', head: 'round', skin: '#f2c8a4' },
    HUNTER1: { hunt: true, shirt: '#7a6a4a', pants: '#5a4a38', hat: 'wide', hatCol: '#4a3c30', neck: 'bandana', neckCol: '#3a5a8a', boots: 'knee', shoes: '#3a2a1e', hair: 'short', hairCol: '#3a2a1e', beard: 'full', beardCol: '#5a3a24', moustache: '#5a3a24', beardK: 0.62, build: 'adult', head: 'round', skin: '#e8b48a' },
    HUNTER2: { plainCap: true, hunt: true, shirt: '#5a6a4a', pants: '#4a4434', pattern: 'tweed', hat: 'cap', hatCol: '#5a5040', neck: 'scarf', neckCol: '#8a3a2a', boots: 'leggings', leggCol: '#7a5a3a', hair: 'short', hairCol: '#b07a3a', moustache: '#b07a3a', build: 'thin', head: 'egg', skin: '#f2c8a8' },
    HUNTER3: { hunt: true, shirt: '#8a5a3a', pants: '#4a3c30', hat: 'slouch', hatCol: '#3e3630', neck: 'bandana', neckCol: '#d8b040', boots: 'knee', shoes: '#2a2018', hair: 'short', hairCol: '#1e1612', moustache: '#1e1612', build: 'stout', head: 'wide', skin: '#c98a5e' },
    BERRYMAN: { shirt: '#f2efe6', pants: '#3a3a44', vest: '#5a5048', garters: '#3a3a4a', collar: '#ffffff', neck: 'bow', neckCol: '#2a2a3a', pencil: true, inky: true, cuff: '#f2efe6', hair: 'side', hairCol: '#4a3a2c', moustache: '#4a3a2c', build: 'thin', head: 'egg', skin: '#f2c8a6' },
    MORRIS: { shirt: '#ece6d6', pants: '#3a3430', vest: '#4a3a30', rolled: true, apron: '#f2eee2', hat: 'cap', hatCol: '#4a4038', hair: 'short', hairCol: '#2a1c16', moustache: '#2a1c16', build: 'adult', head: 'round', skin: '#f0c4a0', noButtons: true },
    ROSE: { shirt: '#f2ead8', pants: '#3a3448', lashes: true, hair: 'bun', hairCol: '#3a2418', head: 'egg', skin: '#f2c8a6', collar: '#ffffff', button: '#e8dcc0' },
    CUST0: { shirt: '#5a3a4a', pants: '#3a2a34', lashes: true, hair: 'bun', hairCol: '#7a4a24', head: 'round', skin: '#f6d0b0', neck: 'bow', neckCol: '#e8dcc8' },
    CUST1: { plainCap: true, pattern: 'plaid', shirt: '#6a5a8a', pants: '#3a3a44', hat: 'cap', hatCol: '#4a4038', neck: 'scarf', neckCol: '#b8402e', hair: 'short', hairCol: '#b07a3a', build: 'kid', head: 'round', skin: '#ffe2c2' },
    CUST2: { shirt: '#2a3a4a', pants: '#2a2e36', hat: 'bowler', hatCol: '#2a2622', neck: 'scarf', neckCol: '#7a6a3a', hair: 'short', hairCol: '#2a1a12', moustache: '#2a1a12', build: 'stout', head: 'wide', skin: '#e8b48a' },
    CUST3: { shirt: '#3a5a4a', pants: '#2a3a34', lashes: true, hair: 'curly', hairCol: '#1a1210', head: 'egg', skin: '#8a5a3e', neck: 'bow', neckCol: '#f2e8d8' },
    CUST4: { shirt: '#c86a5a', pants: '#3a3448', lashes: true, hair: 'long', hairCol: '#d8a040', build: 'kid', head: 'round', skin: '#ffe0c4' },
    CUST5: { plainCap: true, pattern: 'tweed', shirt: '#6a5a44', pants: '#3a3430', hat: 'cap', hatCol: '#3a3430', neck: 'scarf', neckCol: '#3a5a8a', hair: 'short', hairCol: '#3a2a20', build: 'kid', head: 'round', skin: '#c98a5e' },
    KID0: { pj: true, pattern: 'vstripe', stripeCol: 'rgba(255,255,255,0.6)', shirt: '#5a8ac8', pants: '#5a8ac8', cuff: '#f2f0ea', collar: '#f2f0ea', hair: 'short', hairCol: '#3a2a20', build: 'kid', head: 'round', skin: '#ffe2c2', shoes: '#8a5a8a' },
    KID1: { pj: true, pattern: 'dots', shirt: '#e889a8', pants: '#e889a8', cuff: '#f8e8ee', collar: '#f8e8ee', hair: 'long', hairCol: '#1a1210', build: 'kid', head: 'egg', skin: '#8a5a3e', shoes: '#f2ece0' },
    KID2: { pj: true, pattern: 'plaid', shirt: '#4a8a5a', pants: '#4a8a5a', cuff: '#e8e0c8', collar: '#e8e0c8', hat: 'beanie', hatCol: '#e0a030', hair: 'short', hairCol: '#d8a040', build: 'kid', head: 'round', skin: '#ffe8d0', shoes: '#5a3a2a' },
    KID3: { pj: true, pattern: 'vstripe', stripeCol: 'rgba(255,230,120,0.7)', shirt: '#7a5ac9', pants: '#7a5ac9', cuff: '#f6e08a', collar: '#f6e08a', hair: 'curly', hairCol: '#140e0c', build: 'kid', head: 'round', skin: '#6a4430', shoes: '#3a3a5a' },
    KID4: { pj: true, pattern: 'dots', dotCol: 'rgba(255,240,180,0.85)', shirt: '#2f6a8a', pants: '#2f6a8a', cuff: '#f2f0ea', collar: '#f2f0ea', hair: 'bun', hairCol: '#1a1414', build: 'kid', head: 'egg', skin: '#f0c8a0', shoes: '#c8463c' },
    KID5: { pj: true, pattern: 'vstripe', stripeCol: 'rgba(255,255,255,0.55)', shirt: '#d86a4a', pants: '#d86a4a', cuff: '#f2f0ea', collar: '#f2f0ea', hat: 'beanie', hatCol: '#3a5ab0', pomCol: '#f2ece0', hair: 'short', hairCol: '#2a1a12', build: 'kid', head: 'round', skin: '#c98a5e', shoes: '#4a3a5a' },
  }); }
// [EIN-cast] 1952: Einstein at Princeton, Ben-Gurion, Ambassador Abba Eban, Helen Dukas, a US mailman, an Israeli aide, the press (oddverra_next.js: wild / tufts hair,
// cardigan, open collar, sandals (no socks), stoop, droopy eyes, age lines, bushy brows, glasses chain, satchel, press card, cap badge; props pipe chalk letter violin phone fountainpen envelope notepad flashcam)
{ const EIN = { cardigan: true, shirt: '#8d8a96', collar: '#e6eaf2', cuff: '#7c7986', button: '#4a3e36', pants: '#6a5e58', hair: 'wild', hairCol: '#efedf3', moustache: '#e9e7ee', stache: 'bushy', brow: '#d6d3de', bushyBrow: true,
    droopy: true, age: true, stoop: 1, sandals: true, shoes: '#8a5634', build: 'old', head: 'round', skin: '#f2c6a6', nose: 'round' };
  Object.assign(ODD, {
    EINSTEIN: EIN,
    BENGURION: { fatigue: true, openCollar: true, shirt: '#c9b68c', pants: '#7e6e52', belt: '#4a3826', cuff: '#c9b68c', hair: 'tufts', hairCol: '#f1eff4', brow: '#ddd9e2', bushyBrow: true, age: true,
      build: 'short', head: 'round', skin: '#ecb890', nose: 'round', shoes: '#3a2a20' },
    EBAN: { shirt: '#2b2d3a', pants: '#272934', neck: 'tie', neckCol: '#5a3a5e', tieK: 0.85, collar: '#f4f2ee', vest: '#2b2d3a', glasses: true, hair: 'side', hairCol: '#221a16', build: 'stout', head: 'round', skin: '#f0c4a0', noChain: true, shoes: '#1e1a1e' },
    DUKAS: { lashes: true, dress: true, cardigan: true, shirt: '#6f86a6', collar: '#7a4a5a', pants: '#7a4a5a', cuff: '#647a98', button: '#f0e8d8', hair: 'bun', hairCol: '#5e504c', glasses: true, glassChain: true,
      head: 'egg', skin: '#f2c8a6', shoes: '#3a2a2a', neck: 'bow', neckCol: '#7a4a5a' },
    MAILMAN: { shirt: '#5c6c86', pants: '#4f5b72', neck: 'tie', neckCol: '#2a2e3a', tieK: 0.7, collar: '#e8ecf2', vest: '#5c6c86', hat: 'cap', hatCol: '#4c586e', plainCap: true, capBadge: true, satchel: '#7a5434',
      hair: 'short', hairCol: '#3a2a20', moustache: '#3a2a20', build: 'adult', head: 'round', skin: '#e8b48a', button: '#d8b048', shoes: '#1e1a1e' },
    AIDE: { shirt: '#f4f2ec', rolled: true, openCollar: true, cuff: '#f4f2ec', pants: '#4a4a56', hair: 'side', hairCol: '#2a1e18', build: 'thin', head: 'egg', skin: '#e2ae84', shoes: '#2a2224', noButtons: false },
    PRESS0: { pattern: 'tweed', shirt: '#6a604e', pants: '#3e3a36', neck: 'tie', neckCol: '#7a2a2a', collar: '#f2efe6', hat: 'fedora', hatCol: '#4a4038', pressCard: true, hair: 'short', hairCol: '#2a1e18', build: 'adult', head: 'wide', skin: '#f0c098' },
    PRESS1: { coat: true, shirt: '#c4ae84', pants: '#3a3a44', neck: 'tie', neckCol: '#2a3a5a', tieK: 0.8, collar: '#f2f0ea', cuff: '#c4ae84', hat: 'fedora', hatCol: '#5a4a38', pressCard: true, hair: 'short', hairCol: '#6a4a30', moustache: '#6a4a30', build: 'thin', head: 'egg', skin: '#e8b48a' },
    PRESS2: { pattern: 'pinstripe', shirt: '#33363f', pants: '#2c2e35', neck: 'tie', neckCol: '#a0703a', collar: '#f4f2ee', hat: 'fedora', hatCol: '#2a2a30', pressCard: true, hair: 'short', hairCol: '#140e0c', glasses: 'horn', build: 'stout', head: 'round', skin: '#a06a48', noChain: true },
    PRESS3: { shirt: '#5a5a62', pants: '#3a3a40', neck: 'tie', neckCol: '#3a5a4a', tieK: 0.75, collar: '#f2f2ee', vest: '#5a5a62', hat: 'fedora', hatCol: '#6a6258', pressCard: true, hair: 'side', hairCol: '#b07a3a', build: 'adult', head: 'egg', skin: '#f6d0b0' },
  }); }
Object.assign(ODD, LIB_ODD); // [LIB-cast] Bartholdi / Khedive / Egypt / Paris / 1886 New York cast
Object.assign(ODD, KCH_ODD); const KCT = (location.search.match(/kchcast=(\d+)/) || [])[1]; // [KCH-cast] 1830s Ohio cast; ?kchcast=N cast test lineup in front of the camera
Object.assign(ODD, PD_ODD); Object.assign(ODD, JG_ODD); Object.assign(ODD, NAP_ODD); /* [NAP-cast] */ Object.assign(ODD, CL_ODD); const CLT = (location.search.match(/clcast=(\d+)/) || [])[1]; /* [CLEO-cast] ?clcast=N lineup */ const NPT = (location.search.match(/npcast=(\d+)/) || [])[1]; const JGT = (location.search.match(/jgcast=(\d+)/) || [])[1]; /* [JG-cast] */ const PDT = (location.search.match(/pdcast=(\d+)/) || [])[1]; // [PD-cast] Play-Doh cast + DOUGHY; ?pdcast=N cast test lineup in front of the camera
Object.assign(ODD, HW_ODD); const HWT = (location.search.match(/hwcast=(\d+)/) || [])[1]; // [HW-cast] Hollywood cast + LILH + MULE + BIGLET; ?hwcast=N lineup
Object.assign(ODD, NT_ODD); const NTT = (location.search.match(/ntcast=(\d+)/) || [])[1]; /* [NT-cast] */ Object.assign(ODD, LB_ODD); const LBT = (location.search.match(/lbcast=(\d+)/) || [])[1]; /* [LB-cast] */ Object.assign(ODD, LN_ODD); const LNT = (location.search.match(/lncast=(\d+)/) || [])[1]; // [LN-cast] Lincoln cast + TOPPER; ?lncast=N lineup
Object.assign(ODD, BW_ODD); const BWT = (location.search.match(/bwcast=(\d+)/) || [])[1]; // [BW-cast] Bubble Wrap cast + POPPY; ?bwcast=N lineup
const oddOf = (n) => {
  if (ODD[n]) return ODD[n];
  const v = +(n.replace(/\D/g, '')) || 0;
  if (n.startsWith('RUN')) return { trim: ['#3f6fb5', '#f2f0ea', '#e0b450', '#c0453a', '#f2f0ea'][v % 5], sash: v % 2 ? ['#3f6fb5', '#c0453a'][v % 2] : undefined, shirt: ['#f2f0ea', '#c0453a', '#3f6fb5', '#e0b450', '#4a8a5a'][v % 5], pants: ['#2f3444', '#f2f0ea', '#2f3444', '#7a2a2a'][v % 4], hair: ['short', 'spiky', 'curly', 'side'][v % 4], hairCol: ['#3a2a20', '#7a4a2a', '#1d1612', '#b07a3a'][v % 4], skin: SK[v % 4], bib: String(10 + v * 3), moustache: v % 3 === 2 ? '#3a2a20' : undefined, head: ['round', 'egg', 'wide', 'tall'][v % 4], build: v % 2 ? 'thin' : 'adult', noButtons: true };
  if (n.startsWith('TRN')) return { pattern: ['plaid', 'tweed'][v % 2], plaidLine: 'rgba(230,200,120,0.5)', shirt: ['#5a5148', '#3b4a5c'][v % 2], pants: '#3b3f52', hat: 'bowler', hair: 'short', hairCol: '#4a3426', moustache: v ? '#4a3426' : undefined, skin: SK[(v + 2) % 4], head: 'wide', build: v ? 'adult' : 'stout', neck: 'tie', neckCol: ['#3f6fb5', '#c0453a'][v % 2] };
  return v % 2 ? { pattern: ['dots', 'plaid', undefined][v % 3], shirt: ['#c25a7a', '#5a8fc2', '#d9a441', '#7b5ac9'][v % 4], pants: '#3b3f52', hair: ['bun', 'long', 'curly'][v % 3], hairCol: ['#7a3f24', '#2a1a12', '#d8a040'][v % 3], skin: SK[v % 4], head: 'egg', lashes: true, neck: v % 3 === 0 ? 'bow' : undefined }
    : { pattern: ['pinstripe', 'tweed', 'plaid', undefined][(v >> 1) % 4], shirt: ['#3f6fb5', '#8c3b4a', '#5d7a3a', '#b5653f'][(v >> 1) % 4], pants: '#3b3f52', hat: 'top', hair: 'short', hairCol: '#3a2a20', skin: SK[(v + 1) % 4], head: ['round', 'wide'][v % 2], moustache: v % 4 === 0 ? '#4a3426' : undefined, neck: 'tie' };
};
const FAM = { grin: ['excited', 'grin', 'mean', 'excited', 'laugh'], smile: ['happy', 'smile', 'excited', 'grin'], laugh: ['laugh', 'excited', 'happy', 'laugh'], nervous: ['nervous', 'sad', 'shock', 'nervous'],
  shock: ['shock', 'surprised', 'shock', 'sad'], angry: ['angry', 'mean', 'angry', 'angry'], worried: ['sad', 'nervous', 'worried', 'sad'], pained: ['pained', 'angry', 'sad', 'pained'], dazed: ['dazed', 'sad', 'dazed'], whistle: ['whistle', 'mean', 'happy'], happy: ['happy', 'excited', 'grin', 'laugh'] };
const q01 = (x) => Math.round(x * 20) / 20;
const hsh = (a, b) => { const x = Math.sin(a * 91.7 + b * 47.3) * 43758.5453; return x - Math.floor(x); };
const blink4 = (f, seed) => { let t = f + seed * 31, k = 0; for (;;) { const gap = 15 + Math.floor(hsh(k, seed) * 55); if (t < gap) break; t -= gap; k++; if (k > 400) break; } return t === 0 || t === 3 ? 0.5 : t === 1 || t === 2 ? 1 : 0; };
const acting = (base, f, seed) => { const fam = FAM[base]; if (!fam) return { expr: base, look: 0, beat: 0 };
  const len = 24 + (seed % 4) * 7, beat = Math.floor((f + seed * 13) / len), k = Math.floor(hsh(beat, seed) * fam.length);
  const look = Math.round((hsh(Math.floor((f + seed * 7) / 37), seed + 3) - 0.5) * 2.4 * 4) / 4;
  return { expr: fam[k], look, beat, since: (f + seed * 13) % len }; };
let GLOW = 0;
const EX = { grin: 'grin', smile: 'smile', laugh: 'laugh', relief: 'happy', smile_closed: 'happy', shock: 'shock', nervous: 'nervous', pained: 'pained', stern: 'angry', dazed: 'dazed', whistle: 'whistle', neutral: 'smile' };
Object.assign(EX, { sad: 'sad', worried: 'worried', surprised: 'surprised', calm: 'calm' }); FAM.calm = ['smile', 'happy', 'smile']; // [BOOTH-story] constant sad / worried / surprised faces + a quiet smile family
Object.assign(EX, { amused: 'amused', thoughtful: 'thoughtful', determined: 'determined', relieved: 'relieved' }); // [EIN-cast] constant faces
Object.assign(EX, { love: 'love', dreamy: 'dreamy', sly: 'sly' }); // [LIB-cast]
Object.assign(EX, { angry: 'angry', smug: 'smug', mean: 'mean', excited: 'excited', happy: 'happy', bored: 'bored' }); // [CASTRO-story] keep these faces as written (were falling back to the smile family)
const outfit = (n) => OUT[n] || (n.startsWith('RUN') ? T.RUNNER(+n.slice(3)) : n.startsWith('TRN') ? T.TRAINER(+n.slice(3)) : T.PASS(+n.slice(4)));
const FX = {
  speed: [400, 600, (p, a) => { const g = p.g; g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineCap = 'round'; for (let i = 0; i < 9; i++) { const x = 30 + i * 42, y0 = 40 + ((i * 97 + a.k * 61) % 260), l = 140 + (i * 53 % 160); g.lineWidth = 5 + (i % 3) * 3; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + l); g.stroke(); } }],
  thermo: [200, 600, (p, a) => { const g = p.g; p.poly([[60, 30], [140, 30], [140, 470], [60, 470]], '#f4f1e6', 8); p.ell(100, 520, 56, 56, '#d23a3a', 8); const lv = 460 - 400 * (a.lvl || 0); p.poly([[85, lv], [115, lv], [115, 500], [85, 500]], '#d23a3a', 0);
    for (let i = 0; i < 9; i++) p.stroke([[60, 70 + i * 45], [80, 70 + i * 45]], 4); g.fillStyle = '#241726'; g.font = 'bold 44px sans-serif'; g.textAlign = 'center'; g.fillText(String(Math.round(40 + 50 * (a.lvl || 0))) + '°', 100, 600 - 24); }],
  sign: [300, 420, (p, a) => { const g = p.g; p.stroke([[150, 410], [150, 150]], 18, '#6b4a32'); p.poly([[30, 20], [270, 20], [270, 180], [30, 180]], '#f2e6c0', 8); g.fillStyle = '#241726'; g.textAlign = 'center'; g.font = 'bold 40px serif'; g.fillText('MILE', 150, 70); g.font = 'bold 84px serif'; g.fillText(String(a.n), 150, 150); }],
  medal: [240, 340, (p) => { p.poly([[70, 10], [110, 10], [130, 170], [100, 170]], '#3f6fb5', 6); p.poly([[170, 10], [130, 10], [110, 170], [140, 170]], '#c0453a', 6); p.ell(120, 240, 80, 80, '#e8b830', 9); p.ell(120, 240, 52, 52, '#f6d460', 5); }],
  bottle: [220, 420, (p) => { const g = p.g; p.poly([[90, 20], [130, 20], [130, 110], [180, 170], [180, 400], [40, 400], [40, 170], [90, 110]], '#7a4a22', 9); p.poly([[50, 220], [170, 220], [170, 330], [50, 330]], '#f2e6c0', 6); g.fillStyle = '#241726'; g.font = 'bold 30px serif'; g.textAlign = 'center'; g.fillText('BRANDY', 110, 286); }],
  tin: [300, 260, (p) => { const g = p.g; p.poly([[30, 40], [270, 40], [270, 240], [30, 240]], '#4a8a5a', 9); p.ell(150, 40, 120, 22, '#5aa06a', 8); g.fillStyle = '#f2f0ea'; g.font = 'bold 36px sans-serif'; g.textAlign = 'center'; g.fillText('RAT', 150, 130); g.fillText('POISON', 150, 180); p.ell(150, 215, 16, 14, '#f2f0ea', 3); }],
  check: [400, 340, (p) => { p.stroke([[40, 180], [150, 290], [360, 50]], 86, '#ffffff'); p.stroke([[40, 180], [150, 290], [360, 50]], 60, '#3aa84a'); }],
  stamp: [260, 340, (p) => { p.poly([[100, 20], [160, 20], [160, 170], [100, 170]], '#6b4a32', 8); p.ell(130, 30, 60, 26, '#8a5a34', 8); p.poly([[30, 170], [230, 170], [230, 250], [30, 250]], '#2a2020', 8); p.poly([[40, 250], [220, 250], [220, 290], [40, 290]], '#c8302c', 6); }],
  steam: [300, 300, (p, a) => T.fxPuff(p, a.t)],
  note: [220, 240, (p, a) => T.fxNote(p, a.kind || 0, a.col || '#1f2a44')],
  sun: [300, 300, (p, a) => { p.ell(150, 150, 70, 70, a.moon ? '#f2f4ff' : '#ffd84a', 8); if (!a.moon) for (let i = 0; i < 10; i++) { const r = i * 0.628; p.stroke([[150 + 90 * Math.cos(r), 150 + 90 * Math.sin(r)], [150 + 130 * Math.cos(r), 150 + 130 * Math.sin(r)]], 12, '#ffd84a'); } else p.ell(180, 130, 60, 60, '#1e2c50', 0); }],
  paper: [600, 420, (p, a) => { const g = p.g; p.poly([[10, 10], [590, 10], [590, 410], [10, 410]], '#f3ecdc', 8); g.fillStyle = '#241726'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 30px serif'; g.fillText('BERLINER BLATT', 300, 42); p.stroke([[30, 66], [570, 66]], 4); g.font = 'bold 64px sans-serif'; g.fillText(a.head1 || '', 300, 120); g.fillText(a.head2 || '', 300, 190);
    for (let i = 0; i < 6; i++) p.stroke([[40, 250 + i * 26], [i % 2 ? 300 : 260, 250 + i * 26]], 6, '#9a9384'); p.poly([[330, 240], [560, 240], [560, 390], [330, 390]], '#c9bfa8', 5);
    g.save(); g.translate(340, 245); g.scale(0.2, 0.16); T.horseSide(new T.Pen(g), {}); g.restore(); }],
  hat: [240, 200, (p) => { p.poly([[70, 20], [170, 20], [176, 150], [64, 150]], '#2e2a36', 8); p.ell(120, 155, 110, 22, '#1d1b22', 8); p.band([[66, 120], [174, 120]], '#8c3b4a', 18, 3); }],
  bigx: [500, 500, (p) => { for (const [a, b] of [[[80, 80], [420, 420]], [[420, 80], [80, 420]]]) { p.stroke([a, b], 96, '#ffffff'); p.stroke([a, b], 70, '#e0352f'); } }],
  qmark: [200, 260, (p) => { const g = p.g; g.font = 'bold 220px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 18; g.strokeStyle = '#241726'; g.strokeText('?', 100, 140); g.fillStyle = '#ffd84a'; g.fillText('?', 100, 140); }],

  bpbg: [600, 1000, (p) => { const g = p.g; g.fillStyle = '#1d4a8a'; g.fillRect(0, 0, 600, 1000); g.strokeStyle = 'rgba(200,225,255,0.18)'; g.lineWidth = 1; for (let x = 0; x <= 600; x += 25) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1000); g.stroke(); } for (let y = 0; y <= 1000; y += 25) { g.beginPath(); g.moveTo(0, y); g.lineTo(600, y); g.stroke(); }
    g.strokeStyle = 'rgba(220,235,255,0.75)'; g.lineWidth = 3; g.strokeRect(24, 24, 552, 952); g.strokeRect(330, 860, 246, 116); g.fillStyle = 'rgba(225,238,255,0.9)'; g.font = 'bold 20px monospace'; g.fillText('PROJECT: ACOUSTIC KITTY', 342, 892); g.font = '15px monospace'; g.fillText('SUBJECT: 1 CAT (GREY)', 342, 918); g.fillText('SHEET 1 OF 1', 342, 942); g.font = 'bold 30px monospace'; g.fillText('FIG. 1', 48, 70); }],
  barrel: [300, 420, (p) => { const g = p.g; p.poly([[40, 60], [260, 60], [270, 400], [30, 400]], '#8a5a34', 9); for (const y of [110, 230, 350]) p.band([[34, y], [266, y]], '#4a3a3a', 14, 3); p.ell(150, 60, 112, 26, '#5a3a22', 8); p.ell(150, 60, 90, 16, '#2f3a5a', 3);
    g.fillStyle = '#f2e6c0'; g.fillRect(70, 150, 160, 60); g.strokeStyle = '#2b1d4a'; g.lineWidth = 5; g.strokeRect(70, 150, 160, 60); g.fillStyle = '#2b1d4a'; g.font = 'bold 40px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('WATER', 150, 182); }],
  board: [420, 380, (p, a) => { const g = p.g; p.stroke([[210, 370], [210, 200]], 20, '#6b4a32'); p.poly([[20, 20], [400, 20], [400, 220], [20, 220]], '#f2e6c0', 9); g.fillStyle = '#2b1d4a'; g.textAlign = 'center'; g.textBaseline = 'middle'; const L = a.lines || []; L.forEach((t, i) => { let fs = i ? 52 : 56; g.font = 'bold ' + fs + 'px serif'; while (g.measureText(t).width > 350 && fs > 24) { fs -= 2; g.font = 'bold ' + fs + 'px serif'; } /* [CASTRO-story] shrink long lines to fit the board */ g.fillStyle = i ? '#c0453a' : '#2b1d4a'; g.fillText(t, 210, 80 + i * 80); }); }],
  dog: [360, 260, (p, a) => { const col = ['#c98a4e', '#5a4a3e', '#e8dcc0'][a.v % 3], dk = ['#8a5a2e', '#2f2620', '#b8a888'][a.v % 3], k = a.k ? 1 : 0;
    // side view running left: legs stretched (k=0) or tucked (k=1)
    const legs = k ? [[[120, 160], [150, 230]], [[140, 160], [110, 232]], [[240, 160], [210, 232]], [[260, 160], [290, 230]]] : [[[120, 160], [50, 210]], [[140, 160], [80, 222]], [[240, 160], [310, 215]], [[260, 160], [330, 205]]];
    legs.forEach(([a1, b1], i) => p.stroke([a1, b1], 24, i % 2 ? col : dk));
    p.stroke([[280, 120], [340, 70 + k * 30]], 20, col);
    p.ell(190, 135, 100, 52, col, 9); p.ell(200, 150, 60, 22, '#f6e6d0', 0);
    p.ell(95, 90, 58, 50, col, 9); p.ell(48, 108, 34, 24, '#f6e6d0', 6); p.ell(22, 100, 11, 9, '#2b1d4a', 0);
    p.ell(118, 58 + k * 6, 20, 40, dk, 7, 0, 360, 30 - k * 25); p.ell(80, 84, 9, 13, '#2b1d4a', 0); p.ell(82, 80, 3, 3, '#ffffff', 0); p.stroke([[66, 66], [96, 62]], 7, '#2b1d4a');
    p.ell(44, 132, 10, 16, '#e2607a', 5); }],
  bark: [300, 200, (p, a) => { const g = p.g; g.globalAlpha = 1 - a.t; g.font = 'bold 120px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 16; g.strokeStyle = '#2b1d4a'; g.strokeText('WOOF!', 150, 100); g.fillStyle = '#ffd838'; g.fillText('WOOF!', 150, 100); g.globalAlpha = 1; }],
  appletree: [500, 500, (p, a) => { const g = p.g, L = '#3f8a3a', D = '#2c6a34', H = '#6fb04f', K = '#24442e';
    g.lineCap = 'round'; g.strokeStyle = K; g.lineWidth = 5; g.fillStyle = '#6b4a32'; g.beginPath(); g.moveTo(232, 490); g.lineTo(240, 320); g.lineTo(200, 260); g.lineTo(226, 255); g.lineTo(252, 300); g.lineTo(290, 250); g.lineTo(306, 262); g.lineTo(264, 330); g.lineTo(270, 490); g.closePath(); g.fill(); g.stroke();
    const cl = [[250, 210, 120], [150, 250, 90], [350, 245, 95], [250, 110, 95], [175, 150, 75], [330, 150, 80]];
    for (const [x, y, r] of cl) { g.beginPath(); g.ellipse(x, y, r, r * 0.82, 0, 0, 7); g.fillStyle = D; g.fill(); g.lineWidth = 4; g.strokeStyle = K; g.stroke(); }
    for (const [x, y, r] of cl) { g.beginPath(); g.ellipse(x - r * 0.12, y - r * 0.12, r * 0.8, r * 0.64, 0, 0, 7); g.fillStyle = L; g.fill(); g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.32, r * 0.38, r * 0.26, -0.4, 0, 7); g.fillStyle = H; g.fill(); }
    for (let i = 0; i < 16; i++) { const cc = cl[i % cl.length], an = (i * 2.39996 + a.v) % 6.283, rr = cc[2] * (0.25 + 0.6 * ((i * 0.618 + a.v * 0.37) % 1)), x = cc[0] + Math.cos(an) * rr, y = cc[1] + Math.sin(an) * rr * 0.8; g.beginPath(); g.arc(x, y, 10, 0, 7); g.fillStyle = '#c8322e'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#5a1418'; g.stroke(); g.beginPath(); g.arc(x - 3, y - 3, 3, 0, 7); g.fillStyle = '#ffb0a0'; g.fill(); } }],
  zzz: [200, 200, (p) => { const g = p.g; g.font = 'bold 150px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 16; g.strokeStyle = '#2b1d4a'; g.strokeText('Z', 100, 100); g.fillStyle = '#ffffff'; g.fillText('Z', 100, 100); }],
  cal: [360, 420, (p, a) => { const g = p.g, M = ['AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR']; p.poly([[20, 40], [340, 40], [340, 400], [20, 400]], '#fffdf6', 9); p.poly([[20, 40], [340, 40], [340, 140], [20, 140]], '#c0453a', 9); for (const x of [90, 270]) p.stroke([[x, 20], [x, 70]], 16, '#2b1d4a');
    g.fillStyle = '#ffffff'; g.font = 'bold 72px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(M[a.m || 0], 180, 92); g.fillStyle = '#2b1d4a'; g.font = 'bold 96px sans-serif'; g.fillText((a.m || 0) >= 5 ? '1905' : '1904', 180, 270); }],
  burst: [500, 500, (p, a) => T.fxBurst(p, a.t, a.col || '#fff3b0', a.rays || 10)],
  // [CASTRO-story] red rubber stamp: a.lines (1-2 lines), slight tilt, double border, ink speckle (no rotation here: roll via a.roll)
  rstamp: [640, 300, (p, a) => { const g = p.g, L = a.lines || ['NEVER']; g.save(); g.translate(320, 150); g.rotate(-0.12); const col = '#d0262c';
    g.fillStyle = 'rgba(255,246,236,0.92)'; g.fillRect(-292, -118, 584, 236); g.lineWidth = 16; g.strokeStyle = col; g.strokeRect(-280, -106, 560, 212); g.lineWidth = 5; g.strokeRect(-258, -84, 516, 168);
    g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; const n = L.length; L.forEach((t, i) => { let fs = n > 1 ? 70 : 96; g.font = 'bold ' + fs + 'px "DejaVu Sans", sans-serif'; while (g.measureText(t).width > 480 && fs > 30) { fs -= 4; g.font = 'bold ' + fs + 'px "DejaVu Sans", sans-serif'; } g.fillText(t, 0, n > 1 ? (i - 0.5) * 76 + 4 : 6); });
    g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 90; i++) { const x = Math.abs(Math.sin(i * 12.9898) * 43758.5453 % 1) * 580 - 290, y = Math.abs(Math.sin(i * 78.233) * 12345.678 % 1) * 230 - 115, r = 1.5 + (i % 5) * 1.1; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } g.restore(); }],
  // [EIN-story] speech bubble: a.lines (1-3), tail toward a.tail (-1 left / 1 right), pop scale handled by size
  bubble: [700, 420, (p, a) => { const g = p.g, L = a.lines || ['...'], s = a.tail || -1; g.save(); g.lineJoin = 'round';
    const bx = 30, by = 20, bw = 640, bh = 290, r = 70; const path = new Path2D(); path.roundRect(bx, by, bw, bh, r); const tx = 350 + s * 150;
    path.moveTo(tx - 50, by + bh - 4); path.lineTo(tx + s * 90, 405); path.lineTo(tx + 40, by + bh - 4);
    g.fillStyle = '#fffaf0'; g.fill(path); g.lineWidth = 14; g.strokeStyle = '#2b1d4a'; g.stroke(path); g.fillStyle = '#fffaf0'; g.fillRect(tx - 44, by + bh - 20, 80, 22);
    g.fillStyle = '#2b1d4a'; g.textAlign = 'center'; g.textBaseline = 'middle'; const n = L.length; L.forEach((t, i) => { let fs = n > 2 ? 64 : 80; g.font = 'bold ' + fs + 'px "DejaVu Sans", sans-serif'; while (g.measureText(t).width > 560 && fs > 30) { fs -= 3; g.font = 'bold ' + fs + 'px "DejaVu Sans", sans-serif'; } g.fillStyle = i === n - 1 && n > 1 ? '#c0453a' : '#2b1d4a'; g.fillText(t, 350, by + bh / 2 + (i - (n - 1) / 2) * (fs * 1.08)); });
    g.restore(); }],
  // [EIN-story] idea lightbulb (a.t 0..1 glow pulse)
  bulb: [260, 360, (p, a) => { const g = p.g, k = 0.6 + 0.4 * Math.sin((a.t || 0) * Math.PI * 2); g.save(); const gl = g.createRadialGradient(130, 130, 10, 130, 130, 130); gl.addColorStop(0, `rgba(255,240,150,${0.85 * k})`); gl.addColorStop(1, 'rgba(255,240,150,0)'); g.fillStyle = gl; g.fillRect(0, 0, 260, 260);
    g.beginPath(); g.arc(130, 125, 78, Math.PI * 0.78, Math.PI * 2.22); g.lineTo(162, 250); g.lineTo(98, 250); g.closePath(); g.fillStyle = '#ffe866'; g.fill(); g.lineWidth = 10; g.strokeStyle = '#2b1d4a'; g.stroke();
    g.beginPath(); g.ellipse(105, 100, 18, 30, -0.5, 0, 7); g.fillStyle = 'rgba(255,255,255,0.8)'; g.fill();
    g.lineWidth = 5; g.beginPath(); g.moveTo(110, 245); g.lineTo(118, 175); g.lineTo(130, 200); g.lineTo(142, 175); g.lineTo(150, 245); g.stroke();
    for (const y of [258, 284, 310]) { g.beginPath(); g.roundRect(92, y, 76, 22, 8); g.fillStyle = '#9aa0b4'; g.fill(); g.lineWidth = 7; g.stroke(); } g.beginPath(); g.arc(130, 336, 14, 0, Math.PI); g.fillStyle = '#2b1d4a'; g.fill(); g.restore(); }],
  splash: [800, 800, (p, a) => T.fxSplash(p, a.t)],
  stars: [420, 210, (p, a) => T.fxStars(p, a.t)],
  puff: [300, 300, (p, a) => T.fxPuff(p, a.t)],
  plank: [320, 110, (p) => T.fxPlank(p)],
  bubbles: [300, 300, (p, a) => { for (let i = 0; i < 7; i++) { const r = 10 + 16 * rnd(i + a.seed); p.ell(40 + 220 * rnd(i * 3 + a.seed), 260 - ((a.t * 300 + 260 * rnd(i * 7 + a.seed)) % 260), r, r, 'rgba(220,245,255,0.55)', 4); } }],
  baby: [300, 200, (p) => { p.ell(150, 110, 120, 60, '#f3ead8', 10, 0, 360, -12); p.ell(70, 95, 42, 40, '#ffe2c2', 8); p.arc(58, 95, 7, 4, 0, 180, 4); p.arc(84, 95, 7, 4, 0, 180, 4); p.ell(84, 70, 30, 24, '#9cc7e8', 6, 180, 380); }],
};

// [CHAR2] 2D cast cards (oddverra_next.js): facing view from motion relative to the camera (with hysteresis), walk phase from the
// distance actually travelled (planted feet), scene light, and no narrator lip-sync (mouths move only for op.say / op.sayEnv).
// All of it is a pure function of the frame: actorsAt results are cached per frame, hysteresis runs over a fixed window (C2.K),
// and travelled distance is integrated from the actor's first frame in its current run of frames (memoized).
const C2 = { K: 8, acts: new Map(), D: new Map(), a: new THREE.Vector3(), b: new THREE.Vector3(), L: null,
  STRIDE: { walk: 0.8, run: 1.3 } }; // metres per full cycle (2 steps) at card scale 1 = what the rig's planted foot covers
const c2acts = (f) => { let r = C2.acts.get(f); if (!r) { r = actorsAt(f); C2.acts.set(f, r); if (C2.acts.size > 400) C2.acts.delete(C2.acts.keys().next().value); } return r; };
const c2key = (a) => a.o + ':' + (a.opts.seed || 0);
const c2pos = (f, key) => { const r = c2acts(f).find((x) => c2key(x) === key); return r ? r.pos : null; };
const c2vel = (cam, f, key) => { const p1 = c2pos(f, key), p0 = c2pos(f - 1, key); if (!p1 || !p0) return null;
  const A = C2.a.set(...p0).applyMatrix4(cam.matrixWorldInverse), B = C2.b.set(...p1).applyMatrix4(cam.matrixWorldInverse); return [B.x - A.x, B.z - A.z]; }; // view space: x = screen right, z = toward camera
const C2B = [26, 62, 118, 154]; // |angle| from "toward the camera": front | 3/4 | side | 3/4 from behind | back
const c2step = (st, v) => { // Schmitt trigger: st = [kind 0 front | 1 34 | 2 side | 3 34B | 4 back, dir ±1]
  if (!v) return st; const sp = Math.hypot(v[0], v[1]), moving = sp > (st[0] ? 0.0035 : 0.007); if (!moving) return [0, st[1]];
  const ang = Math.abs(Math.atan2(v[0], v[1])) * 180 / Math.PI, m = 8, dir = Math.abs(v[0]) > 0.002 ? Math.sign(v[0]) : st[1], k = st[0];
  let n = 0; while (n < 4 && ang > C2B[n]) n++;
  if (n !== k && (k === 0 ? ang < C2B[0] + m : k === 4 ? ang > C2B[3] - m : ang > C2B[k - 1] - m && ang < C2B[k] + m)) n = k; // stay unless clearly past the band edge
  return [n, dir]; };
function c2view(cam, f, a) { const op = a.opts; if (op.view) return op.view; if (a.drive || op.mode === 'sit' || op.mode === 'fall') return 'front';
  const key = c2key(a); let st = [0, 1]; for (let j = f - C2.K; j <= f; j++) st = c2step(st, c2vel(cam, j, key));
  return ['front', '34', 'side', '34B', 'back'][st[0]] + (st[0] && st[0] < 4 ? (st[1] > 0 ? 'R' : 'L') : ''); }
function c2dist(key, f) { // horizontal distance travelled since the actor's current run of frames began (memoized)
  const mk = (j) => key + '|' + j; if (C2.D.has(mk(f))) return C2.D.get(mk(f));
  const todo = []; let j = f; while (j > f - 1500 && !C2.D.has(mk(j)) && c2pos(j, key)) { todo.push(j); j--; }
  let d = C2.D.get(mk(j)) ?? 0; for (let i = todo.length - 1; i >= 0; i--) { const jj = todo[i], p0 = c2pos(jj - 1, key), p1 = c2pos(jj, key); if (p0 && p1) d += Math.hypot(p1[0] - p0[0], p1[2] - p0[2]); C2.D.set(mk(jj), d); }
  if (C2.D.size > 50000) C2.D.clear(); return d; }
function c2gait(f, a) { // planted feet: phase = distance / stride; stride amplitude eases in/out over ~6 frames at starts and stops
  const op = a.opts, gait = op.gait || (op.lift || op.mode === 'run' ? 'run' : 'walk'), story = op.mode === 'march' || op.mode === 'run';
  if (a.drive || op.mode === 'sit' || op.mode === 'fall') return { gait };
  const key = c2key(a), d = c2dist(key, f), v = (d - c2dist(key, f - 6)) / 6, amt = Math.max(0, Math.min(1, v / 0.008)), e = amt * amt * (3 - 2 * amt);
  if (e < 0.02) return { gait }; // not travelling: keep the story's own mode/phase (e.g. marching on the spot)
  return { gait, mode: 'run', gaitAmt: story ? Math.max(e, 0.5) : e, phase: ((d / (C2.STRIDE[gait] * (a.s || 1)) + (op.seed || 0) * 0.37) % 1 + 1) % 1 }; }
function c2light(cam, L) { // key light: sun direction projected to the camera's screen x; colours from the light preset
  const el = (L.el ?? 50) * Math.PI / 180, az = (L.az ?? 0) * Math.PI / 180, d = C2.a.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).transformDirection(cam.matrixWorldInverse);
  return { lightDir: Math.max(-1, Math.min(1, d.x / Math.max(0.25, Math.hypot(d.x, d.z)))), keyCol: L.sunCol, rimCol: L.sky, ambient: (L.hemiI ?? 1) / ((L.hemiI ?? 1) + (L.sunI ?? 1) * 1.5) }; }
const c2opts = (cam, f, a) => ({ ...C2.L, view: c2view(cam, f, a), ...c2gait(f, a), talk: null, say: a.opts.say, sayEnv: a.opts.sayEnv, frame: f, ...libOpts(a.opts) /* [LIB-cast] */, ...kchOpts(a.opts) /* [KCH-cast] */, ...pdOpts(a.opts) /* [PD-cast] */, ...jgOpts(a.opts) /* [JG-cast] */, ...napOpts(a.opts) /* [NAP-cast] */, ...clOpts(a.opts) /* [CLEO-cast] */, ...hwOpts(a.opts) /* [HW-cast] */, ...lnOpts(a.opts) /* [LN-cast] */, ...bwOpts(a.opts) /* [BW-cast] */, ...lbOpts(a.opts) /* [LB-cast] */, ...ntOpts(a.opts) /* [NT-cast] */ }); // talk: null = no narrator lip-sync

function placeActors(f, cam, L) { if (location.search.includes('nocards')) { for (const c of cardMeshes) c.visible = false; for (const c of blobMeshes) c.visible = false; for (const c of fxMeshes) c.visible = false; return; }
  GLOW = ['explain', 'night', 'office'].includes(shotAt(f).light) ? 1 : 0;
  const used = new Set();
  const acts = NTT != null ? ntTestActs(+NTT, cam, +((location.search.match(/ntgy=(-?[0-9.]+)/) || [])[1] || 0), f) /* [NT-cast] */ : LBT != null ? lbTestActs(+LBT, cam, +((location.search.match(/lbgy=(-?[0-9.]+)/) || [])[1] || 0), f) /* [LB-cast] */ : CLT != null ? clTestActs(+CLT, cam, +((location.search.match(/clgy=(-?[0-9.]+)/) || [])[1] || 0), f) /* [CLEO-cast] */ : LNT != null ? lnTestActs(+LNT, cam, +((location.search.match(/lngy=(-?[0-9.]+)/) || [])[1] || 0), f) /* [LN-cast] */ : BWT != null ? bwTestActs(+BWT, cam, +((location.search.match(/bwgy=(-?[0-9.]+)/) || [])[1] || 0), f) /* [BW-cast] */ : NPT != null ? napTestActs(+NPT, cam, +((location.search.match(/npgy=(-?[0-9.]+)/) || [])[1] || 0), f) /* [NAP-cast] */ : HWT != null ? hwTestActs(+HWT, cam, +((location.search.match(/hwgy=(-?[0-9.]+)/) || [])[1] || 0), f) /* [HW-cast] */ : JGT != null ? jgTestActs(+JGT, cam, +((location.search.match(/jggy=(-?[0-9.]+)/) || [])[1] || 0), f) /* [JG-cast] */ : PDT != null ? pdTestActs(+PDT, cam, +((location.search.match(/pdgy=(-?[0-9.]+)/) || [])[1] || 0), f) /* [PD-cast] */ : KCT != null ? kchTestActs(+KCT, cam, +((location.search.match(/kchgy=(-?[0-9.]+)/) || [])[1] || 0), f) /* [KCH-cast] */ : c2acts(f), fxs = NTT != null || LBT != null || CLT != null || NPT != null || KCT != null || PDT != null || JGT != null || HWT != null || BWT != null /* [BW-cast] */ ? [] : fxAt(f); C2.L = c2light(cam, L); // [CHAR2] cached actorsAt + per-frame card light
  let ci = 0, bi = 0;
  for (const a of acts) {
    const m = getMesh(cardMeshes, ci++, mkCard);
    const isCrowd = a.o.startsWith('PASS');
    const k = (a.k || 2) * Math.min(RS, 2);
    const qq = (v) => v == null ? v : Math.round(v * 3) / 3;
    const key = isCrowd ? JSON.stringify([a.o, a.opts.seed, a.opts.expr, qq(a.opts.cheer), qq(a.opts.wave), a.opts.mode]) : JSON.stringify([a.o, a.opts]);
    if (USE3D && a.o !== 'HORSE' && a.o !== 'BOARD' && a.o !== 'CAT' && a.o !== 'BEAR' && a.o !== 'TOMMY' /* [KCH-cast] */ && a.o !== 'DOUGHY' /* [PD-cast] */ && a.o !== 'LILH' && a.o !== 'MULE' && a.o !== 'BIGLET' /* [HW-cast] */ && a.o !== 'TOPPER' /* [LN-cast] */ && a.o !== 'CLUTCHY' /* [LB-cast] */ && a.o !== 'FUDA' /* [NT-cast] */ && a.o !== 'POPPY' /* [BW-cast] */ && a.o !== 'PIP' /* [CLEO-cast] */) { // [TEDDY-cast] BEAR
      const op = a.opts, id = a.o + ':' + (op.seed || 0) + ':' + ci;
      let ch = chars3d.get(id); if (!ch) { ch = makeChar({ seed: op.seed || 0, ...oddOf(a.o) }, grad); scene.add(ch); chars3d.set(id, ch); }
      ch.userData.used = f; ch.visible = true; m.visible = false;
      const talking = TALKER[shotAt(f).id] === a.o && !['dazed', 'pained'].includes(EX[op.expr]); const act = acting(EX[op.expr] || 'smile', f, (op.seed || 0) + 1);
      const bl = act.since < 3 ? [0.5, 1, 0.5][act.since] : blink4(f, (op.seed || 0) + 5);
      ch.position.set(...a.pos); const yaw = Math.atan2(cam.position.x - a.pos[0], cam.position.z - a.pos[2]); ch.rotation.set(0, a.drive || op.mode === 'sit' ? yaw * 0.25 : yaw * 0.75, a.roll || 0);
      ch.update({ t: f + (op.seed || 0) * 7, expr: act.expr, look: act.look, blink: bl, talk: talking ? (ENV[Math.min(ENV.length - 1, f + 1)] || 0) : null, wave: op.wave, cheer: op.cheer ?? (act.expr === 'excited' && (!op.mode || op.mode === 'stand') && op.wave === undefined && !a.drive ? 1 : undefined), mode: op.mode === 'march' ? 'run' : op.mode, phase: op.phase || 0, drive: a.drive, tilt: (op.headTilt || 0) + (hsh(act.beat, 9) - 0.5) * 8 });
      continue;
    }
    if (a.o === 'PIP') { m.geometry = BODY; const op = a.opts, fq = f; m.material.map = canvasFor('pip|' + fq + key, 600, 1000, k, (p) => drawPip(p.g, {}, { t: fq, blink: blink4(f, (op.seed || 0) + 5), ...C2.L, ...op }), used); } else // [CLEO-cast]
    if (a.o === 'POPPY') { m.geometry = BODY; const op = a.opts, fq = f; m.material.map = canvasFor('poppy|' + fq + key, 600, 1000, k, (p) => drawPoppy(p.g, {}, { t: fq, blink: blink4(f, (op.seed || 0) + 5), ...C2.L, ...op }), used); } else // [BW-cast]
    if (a.o === 'FUDA') { m.geometry = BODY; const op = a.opts, fq = f; m.material.map = canvasFor('fuda|' + fq + key, 600, 1000, k, (p) => drawFuda(p.g, {}, { t: fq, blink: blink4(f, (op.seed || 0) + 7), ...C2.L, ...op }), used); } else /* [NT-cast] */
    if (a.o === 'CLUTCHY') { m.geometry = BODY; const op = a.opts, fq = f; m.material.map = canvasFor('clutchy|' + fq + key, 600, 1000, k, (p) => drawClutchy(p.g, {}, { t: fq, blink: blink4(f, (op.seed || 0) + 5), ...C2.L, ...op }), used); } else // [LB-cast]
    if (a.o === 'TOPPER') { m.geometry = BODY; const op = a.opts, fq = f; m.material.map = canvasFor('topper|' + fq + key, 600, 1000, k, (p) => drawTopper(p.g, {}, { t: fq, blink: blink4(f, (op.seed || 0) + 5), ...C2.L, ...op }), used); } else // [LN-cast]
    if (a.o === 'LILH') { m.geometry = BODY; const op = a.opts, fq = f; m.material.map = canvasFor('lilh|' + fq + key, 600, 1000, k, (p) => drawLilH(p.g, {}, { t: fq, blink: blink4(f, (op.seed || 0) + 5), ...C2.L, ...op }), used); } else // [HW-cast]
    if (a.o === 'BIGLET') { m.geometry = BODY; const op = a.opts, fq = f; m.material.map = canvasFor('biglet|' + key, 600, 1000, k, (p) => drawBigLet(p.g, {}, { t: fq, ...C2.L, ...op }), used); } else // [HW-cast]
    if (a.o === 'MULE') { m.geometry = HORSEG; const op = a.opts, fq = f; m.material.map = canvasFor('mule|' + fq + key, 1000, 880, k, (p) => drawMule(p.g, {}, { t: fq, blink: blink4(f, (op.seed || 0) + 5), ...C2.L, ...op }), used); } else // [HW-cast]
    if (a.o === 'DOUGHY') { m.geometry = BODY; const op = a.opts, fq = f; m.material.map = canvasFor('doughy|' + fq + key, 600, 1000, k, (p) => drawDoughy(p.g, {}, { t: fq, blink: blink4(f, (op.seed || 0) + 5), ...C2.L, ...op }), used); } else // [PD-cast]
    if (a.o === 'TOMMY') { m.geometry = BODY; const op = a.opts, fq = f; m.material.map = canvasFor('tommy|' + fq + key, 600, 1000, k, (p) => drawTommy(p.g, {}, { t: fq, blink: blink4(f, (op.seed || 0) + 5), ...C2.L, ...op }), used); } else // [KCH-cast]
    if (a.o === 'BEAR') { m.geometry = BODY; const op = a.opts, fq = f; m.material.map = canvasFor('bear|' + fq + key, 600, 1000, k, (p) => drawBear(p.g, { seed: op.seed || 0 }, { t: fq, blink: blink4(f, (op.seed || 0) + 5), ...C2.L, ...op }), used); } else // [TEDDY-cast]
    if (a.o === 'CAT') { m.geometry = BODY; const op = a.opts, fq = f; m.material.map = canvasFor('cat|' + fq + key, 600, 1000, k, (p) => drawCat(p.g, { seed: op.seed || 0 }, { t: fq, blink: blink4(f, (op.seed || 0) + 5), ...op }), used); } // [KITTY-cat]
    else if (a.o === 'HORSE') { m.geometry = HORSEG; m.material.map = canvasFor(key, 1000, 880, k, (p) => T.horseSide(p, a.opts), used); }
    else if (a.o === 'BOARD') { m.geometry = BOARDG; m.material.map = canvasFor(key, 600, 800, k, (p) => drawBoard(p, a.opts), used); }
    else { m.geometry = BODY; const op = a.opts; const talking = TALKER[shotAt(f).id] === a.o && !['dazed', 'pained'].includes(EX[op.expr]); const talk = talking ? (ENV[Math.min(ENV.length - 1, f + 1)] || 0) : null; const act = acting(EX[op.expr] || 'smile', f, (op.seed || 0) + 1); const bl = op.sleep ? 1 : act.since < 3 ? [0.5, 1, 0.5][act.since] : blink4(f, (op.seed || 0) + 5); const fq = f; m.material.map = canvasFor('ov' + (a.drive ? 'D' : '') + act.expr + act.look + (act.since < 4 ? 'b' : '') + bl + '|' + fq + (talking ? 'T' + talk : '') + key, 600, 1000, k, (p) => oddverra(p.g, { seed: op.seed || 0, ...oddOf(a.o) }, { t: fq + (op.seed || 0) * 7, talk, glow: GLOW, expr: act.expr, look: op.look || act.look, browPop: act.since < 4 ? 1 : 0, blink: bl, wave: op.wave, cheer: op.cheer ?? (act.expr === 'excited' && (!op.mode || op.mode === 'stand') && op.wave === undefined && !a.drive ? 1 : undefined), hip: act.expr === 'angry' && (!op.mode || op.mode === 'stand') && op.wave === undefined, mode: op.mode === 'march' ? 'run' : op.mode, phase: op.phase, prop: op.prop, reach: op.reach, drive: a.drive, steer: a.drive ? q01(0.35 * Math.sin(fq * 0.11) + 0.12 * Math.sin(fq * 0.37)) : 0, tilt: (op.headTilt || 0) + (hsh(act.beat, 9) - 0.5) * 8, beardLoss: op.beardLoss, mask: op.mask, cigarMouth: op.cigarMouth, smoke: op.smoke, lit: op.lit, dust: op.dust, painted: op.painted, giftCol: op.giftCol, ribbonCol: op.ribbonCol, hug: op.hug, teddyCol: op.teddyCol, /* [TEDDY-cast] */ ear: op.ear, flash: op.flash, pipeMouth: op.pipeMouth, pipeSide: op.pipeSide, chalkDust: op.chalkDust, /* [EIN-cast] */ /* [CASTRO-story] pass the cast's per-shot options through */ ...c2opts(cam, f, a) /* [CHAR2] overrides mode/phase/talk */ }), used); }
    const dark = ['explain', 'night', 'office', 'hall', 'under'].includes(shotAt(f).light); m.material.color.set(L.cardTint).multiplyScalar(dark ? 0.2 : 0.34); m.material.emissiveMap = m.material.map; if (m.customDepthMaterial) { m.customDepthMaterial.map = m.material.map; m.customDepthMaterial.needsUpdate = true; } m.material.emissive.set(dark ? '#ffffff' : L.cardTint); m.material.emissiveIntensity = dark ? 1.0 : 0.86;
    m.material.needsUpdate = true;
    m.position.set(...a.pos); m.scale.setScalar(a.s || 1);
    m.rotation.set(0, Math.atan2(cam.position.x - a.pos[0], cam.position.z - a.pos[2]), 0);
    m.rotateZ(a.roll || 0);
    m.visible = true;
    if (a.blob !== false) { const b = getMesh(blobMeshes, bi++, mkBlob); b.position.set(a.pos[0], a.pos[1] + 0.02, a.pos[2]); b.scale.set(a.blobW || 1.3, a.blobD || 0.8, 1); b.visible = true; }
  }
  for (; ci < cardMeshes.length; ci++) cardMeshes[ci].visible = false;
  for (const ch of chars3d.values()) if (ch.userData.used !== f) ch.visible = false;
  for (; bi < blobMeshes.length; bi++) blobMeshes[bi].visible = false;
  let fi = 0;
  for (const a of fxs) {
    const [w, h, draw] = FX[a.fx];
    const m = getMesh(fxMeshes, fi++, mkFx);
    const key = JSON.stringify({ ...a, pos: 0, size: 0, t: a.t != null ? Math.round(a.t * 40) / 40 : 0 });
    m.material.map = canvasFor(key, w, h, 1, (p) => draw(p, { ...a, t: a.t != null ? Math.round(a.t * 40) / 40 : 0 }), used);
    m.material.color.set(a.tint || L.fxTint); m.material.opacity = a.op ?? 1; m.material.needsUpdate = true;
    m.position.set(...a.pos); m.scale.set(a.size, a.size * h / w, 1);
    m.quaternion.copy(cam.quaternion); if (a.roll) m.rotateZ(a.roll);
    m.visible = true;
  }
  for (; fi < fxMeshes.length; fi++) fxMeshes[fi].visible = false;
  for (const [id, e] of pool) if (!used.has(id)) { pool.delete(id); free.push(e); }
}

// ---------- render targets + post ----------
const rtC = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const rtN = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const rtA = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const ndVert = `#include <common>
varying vec3 vN; varying float vD; varying vec2 vUv;
void main(){
  #include <beginnormal_vertex>
  #include <defaultnormal_vertex>
  #include <begin_vertex>
  #include <project_vertex>
  vN = normalize(transformedNormal); vD = -mvPosition.z; vUv = uv; }`;
const ndMats = {};
const ndMat = (side) => ndMats[side] || (ndMats[side] = new THREE.ShaderMaterial({ side, vertexShader: ndVert,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = gl_FrontFacing ? vN : -vN; gl_FragColor = vec4(normalize(n)*0.5+0.5, vD/${FAR}.); }` }));
const cardND = new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: { map: { value: null } }, vertexShader: ndVert,
  fragmentShader: `uniform sampler2D map; varying float vD; varying vec2 vUv; void main(){ if(texture2D(map,vUv).a<0.5) discard; gl_FragColor = vec4(0.,0.,0.,vD/${FAR}.); }` });
// FX billboards (props like apple trees, barrels, dogs) carry their own drawn ink: in the ND pass they only
// stamp the "card" marker (rgb = 0) over what is behind them and keep that depth, so world lines behind them are
// hidden and no second outline is drawn around them, while DOF still sees the depth it saw before.
const fxND = new THREE.ShaderMaterial({ side: THREE.DoubleSide, transparent: true, depthWrite: false, uniforms: { map: { value: null }, op: { value: 1 } }, vertexShader: ndVert,
  blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.ZeroFactor, blendDst: THREE.ZeroFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor,
  fragmentShader: `uniform sampler2D map; uniform float op; varying vec2 vUv; void main(){ if(texture2D(map,vUv).a*op<0.5) discard; gl_FragColor = vec4(0.); }` });
const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quad = (frag, uniforms) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms, depthTest: false, depthWrite: false,
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }', fragmentShader: frag })); const s = new THREE.Scene(); s.add(m); return { s, u: uniforms }; };
const inkPass = quad(`uniform sampler2D tC,tN; uniform vec2 px; uniform float inkR, sat, flash, vig; uniform vec3 gain, lift, inkCol; uniform float dbg, focus, cInf; varying vec2 vUv;
  float dep(vec4 s){ return max(s.a*${FAR}., 0.05); }
  bool isCard(vec4 s){ return s.r+s.g+s.b < 0.01; }
  float hsh(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
    return mix(mix(hsh(i), hsh(i+vec2(1.,0.)), f.x), mix(hsh(i+vec2(0.,1.)), hsh(i+vec2(1.,1.)), f.x), f.y); }
  void main(){
    vec3 c = texture2D(tC, vUv).rgb; vec4 n0 = texture2D(tN, vUv); float d0 = dep(n0); float ink = 0.;
    if(!isCard(n0) && n0.a < 0.999){
      // ---- world ink: silhouettes from inverse-depth discontinuities, creases from normal discontinuities ----
      // inverse depth is linear across any plane in screen space, so its Laplacian is ~0 on flat ground even at
      // grazing angles: only true depth steps (object in front of something farther) produce a line.
      float near = 1. - smoothstep(4., 90., d0);
      float wob = 0.8 + 0.4*vnoise(gl_FragCoord.xy/38.);              // slow weight variation along a stroke
      // the DOF pass blurs the ink afterwards: widen lines on out-of-focus surfaces by part of their blur radius so
      // they read as soft dark strokes instead of dissolving (background silhouettes, foreground props)
      float coc = min(cInf*abs(1. - focus/d0), cInf*1.3);
      float rs = inkR*mix(0.75, 1.45, near)*wob + min(0.35*coc, 3.);    // silhouette half-width (px)
      float rc = inkR*mix(0.4, 0.62, near)*wob;                        // crease radius (crease straddles the edge)
      float lo = mix(0.004, 0.016, smoothstep(10., 400., d0));          // distance-adaptive depth threshold
      float i0 = 1./d0; vec3 N0 = n0.rgb*2.-1.;
      float sil = 0., cr = 0.;
      vec2 dirs[4]; dirs[0]=vec2(1.,0.); dirs[1]=vec2(0.,1.); dirs[2]=vec2(.7071,.7071); dirs[3]=vec2(.7071,-.7071);
      for(int i=0;i<4;i++){
        vec2 o = dirs[i]*px*rs; vec4 a = texture2D(tN, vUv+o), b = texture2D(tN, vUv-o);
        if(!(isCard(a)||isCard(b))){
          float e = (i0 - 0.5*(1./dep(a) + 1./dep(b)))/i0;          // > 0 on the near side of a depth step
          sil = max(sil, smoothstep(lo, lo*2.6, e));
        }
        // creases read the nearest texel: a linearly filtered normal next to a card blends with the card marker
        // and would draw a false halo around every character
        ivec2 o2 = ivec2(floor(dirs[i]*rc + 0.5)); vec4 a2 = texelFetch(tN, ivec2(gl_FragCoord.xy) + o2, 0), b2 = texelFetch(tN, ivec2(gl_FragCoord.xy) - o2, 0);
        if(!(isCard(a2)||isCard(b2))){
          float m = min(dot(N0, a2.rgb*2.-1.), dot(N0, b2.rgb*2.-1.));
          cr = max(cr, smoothstep(0.86, 0.6, m));
        }
      }
      // far lines get lighter; inner creases fade sooner than silhouettes so the background stays calm
      float silA = 1. - 0.35*smoothstep(40., 500., d0);
      float crA = 0.85*(1. - 0.85*smoothstep(50., 420., d0));
      ink = max(sil*silA, cr*crA) * (0.9 + 0.1*vnoise(gl_FragCoord.xy/23. + 7.)) * (1. - smoothstep(600., 1400., d0));
    }
    // (ambient occlusion now comes from the separate half-res SSAO pass, see aoPass/aoApply)
    { float far = smoothstep(20., 300., d0);
      vec3 lc = mix(inkCol, c*0.16, 0.15);
      lc = mix(lc, c*0.3, far*0.4);
      c = mix(c, lc, clamp(ink*1.15, 0., 1.)); }
    c = c*gain + lift;
    float l = dot(c, vec3(0.2126,0.7152,0.0722)); c = mix(vec3(l), c, sat);
    vec2 q = vUv-0.5; c *= 1. - vig*smoothstep(0.25, 0.85, length(q*vec2(1.,1.4)));
    c = mix(c, vec3(1.), flash);
    if(dbg > 0.5) c = vec3(1. - ink);
    gl_FragColor = vec4(max(c,0.), 1.); }`,
  { tC: { value: rtC.texture }, tN: { value: rtN.texture }, px: { value: new THREE.Vector2(1 / W, 1 / H) }, dbg: { value: location.search.includes('inkdbg') ? 1 : 0 }, focus: { value: 5 }, cInf: { value: 0 }, inkR: { value: 2.2 * RS }, sat: { value: 1.1 }, flash: { value: 0 }, vig: { value: 0.25 },
    gain: { value: new THREE.Vector3(1, 1, 1) }, lift: { value: new THREE.Vector3(0, 0, 0) }, inkCol: { value: new THREE.Color(0x2b1d4a) } });
// ---------- SSAO (half res, from the normal/depth buffer) -> blurred -> multiplied into colour before ink ----------
const AW = W / 2, AH = H / 2;
const rtAO1 = new THREE.WebGLRenderTarget(AW, AH, { type: THREE.HalfFloatType }), rtAO2 = new THREE.WebGLRenderTarget(AW, AH, { type: THREE.HalfFloatType });
const rtCA = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const aoPass = quad(`uniform sampler2D tN; uniform vec2 px; uniform float tanY, aspect, rad, frame, aoS; varying vec2 vUv;
  vec3 vpos(vec2 uv, float d){ vec2 n = uv*2.-1.; return vec3(n.x*d*tanY*aspect, n.y*d*tanY, -d); }
  float hash(vec2 p){ return fract(52.9829189*fract(dot(p, vec2(0.06711056, 0.00583715)))); }
  void main(){
    vec4 s0 = texture2D(tN, vUv); float d0 = s0.a*${FAR}.;
    if(s0.a > 0.999 || s0.r+s0.g+s0.b < 0.01){ gl_FragColor = vec4(1.); return; } // sky and character cards receive none
    vec3 P = vpos(vUv, d0), N = normalize(s0.rgb*2.-1.);
    float sr = rad / (d0*tanY*2.) ; // world radius -> uv
    float a0 = hash(gl_FragCoord.xy)*6.2832, occ = 0.;
    const int NS = 7;
    for(int i=0;i<NS;i++){
      float fi = (float(i)+0.5)/float(NS); float a = a0 + float(i)*2.39996; float r = sr*mix(0.08, 1., fi*fi);
      vec2 uv = vUv + vec2(cos(a)/aspect, sin(a))*r;
      vec4 ss = texture2D(tN, uv); if(ss.a > 0.999) continue;
      vec3 v = vpos(uv, ss.a*${FAR}.) - P; float vv = dot(v,v);
      float o = max(0., dot(v, N) - 0.004*d0) / (vv + 0.0004*d0*d0 + 0.002);
      occ += o * (1. - smoothstep(rad*rad*0.6, rad*rad*2.2, vv)); }
    float ao = clamp(1. - aoS*occ*rad/float(NS), 0., 1.); ao = ao*ao;
    ao = mix(1., ao, 1. - smoothstep(70., 260., d0));
    gl_FragColor = vec4(vec3(ao), 1.); }`,
  { tN: { value: rtN.texture }, px: { value: new THREE.Vector2(1 / AW, 1 / AH) }, tanY: { value: 0.36 }, aspect: { value: W / H }, rad: { value: 0.7 }, frame: { value: 0 }, aoS: { value: 2.5 } });
const aoBlur = quad(`uniform sampler2D tI, tN; uniform vec2 dir; varying vec2 vUv;
  void main(){ float d0 = texture2D(tN, vUv).a; float a = 0., ws = 0.;
    for(int i=-3;i<=3;i++){ vec2 uv = vUv + dir*float(i); float d = texture2D(tN, uv).a; float w = exp(-float(i*i)/8.) * (1. - smoothstep(0.0, 0.06, abs(d-d0)/max(d0,1e-4)));
      a += texture2D(tI, uv).r*w; ws += w; }
    gl_FragColor = vec4(vec3(a/max(ws,1e-4)), 1.); }`, { tI: { value: null }, tN: { value: rtN.texture }, dir: { value: new THREE.Vector2() } });
const aoApply = quad(`uniform sampler2D tC, tAO; uniform float k; uniform vec3 tint; varying vec2 vUv;
  void main(){ vec3 c = texture2D(tC, vUv).rgb; float ao = texture2D(tAO, vUv).r; float occ = (1.-ao)*k;
    // occlusion darkens toward a deep purple (brand shadow colour) rather than grey
    gl_FragColor = vec4(c * mix(vec3(1.), tint, clamp(occ,0.,1.)), 1.); }`,
  { tC: { value: rtC.texture }, tAO: { value: rtAO1.texture }, k: { value: 0.85 }, tint: { value: new THREE.Vector3(0.24, 0.19, 0.30) } });
const WHITE = new THREE.WebGLRenderTarget(4, 4); { renderer.setRenderTarget(WHITE); renderer.setClearColor(0xffffff, 1); renderer.clear(); renderer.setRenderTarget(null); }
function renderAO(cam, L) {
  aoPass.u.tanY.value = Math.tan(cam.fov * Math.PI / 360); aoPass.u.rad.value = L.aoR ?? 0.55;
  renderer.setRenderTarget(rtAO1); renderer.render(aoPass.s, quadCam);
  aoBlur.u.tI.value = rtAO1.texture; aoBlur.u.dir.value.set(2 / AW, 0); renderer.setRenderTarget(rtAO2); renderer.render(aoBlur.s, quadCam);
  aoBlur.u.tI.value = rtAO2.texture; aoBlur.u.dir.value.set(0, 2 / AH); renderer.setRenderTarget(rtAO1); renderer.render(aoBlur.s, quadCam);
  aoApply.u.k.value = location.search.includes('aodbg') ? 1 : L.aoK ?? 0.8; if (location.search.includes('aodbg')) aoApply.u.tC.value = WHITE.texture; renderer.setRenderTarget(rtCA); renderer.render(aoApply.s, quadCam);
}
const dofPass = quad(`uniform sampler2D tA,tN,tP; uniform vec2 px; uniform float focus, cInf, bgK, fgK, rMax; varying vec2 vUv;
  // circle of confusion in px: background (behind focus) scaled by bgK and capped at rMax; foreground (in front) by fgK, capped near the old limit so mis-focused subjects stay crisp
  float coc(float d){ float k = 1. - focus/max(d,0.01); return k > 0. ? min(cInf*bgK*k, rMax) : min(-cInf*fgK*k, cInf*1.4); }
  void main(){
    vec3 c0 = texture2D(tA, vUv).rgb; float d0 = texture2D(tN, vUv).a*${FAR}.; float r0 = coc(d0);
    if(cInf < 0.5 || r0 < 0.6){ gl_FragColor = vec4(c0,1.); return; }
    vec3 acc = c0; float wsum = 1.; float rot = 0.; float pre = smoothstep(5., 14., r0); // wide blurs gather from a pre-blurred half-res copy so the sparse taps don't speckle
    for(int i=0;i<28;i++){
      float fi = float(i)+0.5; float r = sqrt(fi/28.)*r0; float a = fi*2.39996 + rot;
      vec2 uv = vUv + vec2(cos(a),sin(a))*r*px;
      float ds = texture2D(tN, uv).a*${FAR}.; float rs = coc(ds);
      // nearer samples only spread over us if their own blur reaches this far (keeps the sharp subject from haloing)
      float w = ds < d0 ? smoothstep(r-1., r, rs) : 1.;
      vec3 sc = mix(texture2D(tA, uv).rgb, texture2D(tP, uv).rgb, pre); w *= 1. + 0.6*smoothstep(0.85, 1.4, dot(sc, vec3(.2126,.7152,.0722)));
      acc += sc*w; wsum += w; }
    gl_FragColor = vec4(acc/wsum,1.); }`,
  { tA: { value: rtA.texture }, tN: { value: rtN.texture }, tP: { value: null }, px: { value: new THREE.Vector2(1 / W, 1 / H) }, focus: { value: 5 }, cInf: { value: 0 }, bgK: { value: 3.6 }, fgK: { value: 1.0 }, rMax: { value: 12 * RS } });

// ---------- glow, light shafts, motion blur, film finish ----------
const rtB = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const rtP1 = new THREE.WebGLRenderTarget(W / 2, H / 2, { type: THREE.HalfFloatType }), rtP2 = new THREE.WebGLRenderTarget(W / 2, H / 2, { type: THREE.HalfFloatType });
const QW = W / 4, QH = H / 4;
const rtQ1 = new THREE.WebGLRenderTarget(QW, QH, { type: THREE.HalfFloatType }), rtQ2 = new THREE.WebGLRenderTarget(QW, QH, { type: THREE.HalfFloatType }), rtQ3 = new THREE.WebGLRenderTarget(QW, QH, { type: THREE.HalfFloatType });
const brightPass = quad(`uniform sampler2D tB; uniform float thr; varying vec2 vUv; void main(){ vec3 c = texture2D(tB, vUv).rgb; float l = dot(c, vec3(.2126,.7152,.0722)); gl_FragColor = vec4(c * smoothstep(thr, thr + 0.5, l), 1.); }`, { tB: { value: rtB.texture }, thr: { value: 0.92 } });
const blurPass = quad(`uniform sampler2D tI; uniform vec2 dir; varying vec2 vUv; void main(){ vec3 a = vec3(0.); float w[5]; w[0]=.227; w[1]=.194; w[2]=.122; w[3]=.054; w[4]=.016;
  a += texture2D(tI, vUv).rgb*w[0]; for(int i=1;i<5;i++){ a += texture2D(tI, vUv+dir*float(i)*1.6).rgb*w[i]; a += texture2D(tI, vUv-dir*float(i)*1.6).rgb*w[i]; } gl_FragColor = vec4(a,1.); }`, { tI: { value: null }, dir: { value: new THREE.Vector2() } });
const rayPass = quad(`uniform sampler2D tB,tN; uniform vec2 sunUV; uniform float on; varying vec2 vUv; void main(){ if(on < 0.01){ gl_FragColor = vec4(0.); return; }
  vec2 d = (vUv - sunUV) / 40.; vec2 uv = vUv; vec3 acc = vec3(0.); float decay = 1.;
  for(int i=0;i<40;i++){ uv -= d; float sky = step(0.999, texture2D(tN, uv).a); vec3 c = texture2D(tB, uv).rgb; acc += c * sky * decay; decay *= 0.965; }
  gl_FragColor = vec4(acc / 40. * on, 1.); }`, { tB: { value: rtB.texture }, tN: { value: rtN.texture }, sunUV: { value: new THREE.Vector2() }, on: { value: 0 } });
const finalPass = quad(`uniform sampler2D tB,tN,tBloom,tRays; uniform mat4 prevVP, camWorld; uniform float tanY, aspect, frame, rayK, bloomK, mbK, gAmt; uniform vec3 rayCol; varying vec2 vUv;
  // per-scene look (see GRADES): exposure/gamma, S-curve, per-channel lift-gamma-gain, hue-selective saturation, split toning, vignette, halation
  uniform float lExp, lGam, lCon, lPiv, lSat, lSatS, lSatH, kHue, kW, kSat, kShift, yHue, yW, ySat, yShift, skinK, halK, vigK, vigR, tSK, tHK;
  uniform vec3 lLift, lGamma, lGain, tSC, tHC, halC, vigC;
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + frame*0.618) * 43758.5453); }
  vec3 rgb2hsv(vec3 c){ vec4 K = vec4(0.,-1./3.,2./3.,-1.); vec4 p = mix(vec4(c.bg,K.wz), vec4(c.gb,K.xy), step(c.b,c.g)); vec4 q = mix(vec4(p.xyw,c.r), vec4(c.r,p.yzx), step(p.x,c.r));
    float d = q.x - min(q.w,q.y); return vec3(abs(q.z + (q.w-q.y)/(6.*d+1e-6)), d/(q.x+1e-6), q.x); }
  vec3 hsv2rgb(vec3 c){ vec3 p = abs(fract(c.xxx + vec3(1.,2./3.,1./3.))*6. - 3.); return c.z * mix(vec3(1.), clamp(p-1., 0., 1.), c.y); }
  float band(float hu, float c, float w){ return 1. - smoothstep(0., w, abs(fract(hu - c + 0.5) - 0.5)); }
  float lum(vec3 c){ return dot(c, vec3(.2126,.7152,.0722)); }
  void main(){
    float d = texture2D(tN, vUv).a * ${FAR}.; d = min(d, 900.);
    vec2 ndc = vUv*2.-1.; vec4 wp = camWorld * vec4(ndc.x*d*tanY*aspect, ndc.y*d*tanY, -d, 1.);
    vec4 pc = prevVP * wp; vec2 puv = pc.xy/pc.w*0.5+0.5; vec2 vel = (vUv - puv) * 0.35 * mbK; if(length(vel*vec2(${W}.,${H}.)) < 1.5) vel = vec2(0.);
    float vl = length(vel*vec2(${W}.,${H}.)); if(vl > 36.) vel *= 36./vl;
    vec3 c = vec3(0.); for(int i=0;i<10;i++){ float t = float(i)/9. - 0.5; c += texture2D(tB, vUv + vel*t).rgb; } c /= 10.;
    vec3 bl = texture2D(tBloom, vUv).rgb;
    c += bl * bloomK;
    // film halation: a warm red-orange fringe that bleeds out of the bright areas
    c += halC * lum(bl) * halK;
    c += texture2D(tRays, vUv).rgb * rayCol * rayK;
    vec3 s = pow(clamp(c, 0., 4.), vec3(1./2.2)); s = min(s, vec3(1.));
    // base exposure (measured match: mids down, deep shadows)
    vec3 o = pow(s, vec3(lGam)) * lExp;
    // S-curve contrast around a pivot
    { vec3 x = clamp(o, 0., 1.); vec3 lo = lPiv * pow(x / lPiv, vec3(lCon)), hi = 1. - (1.-lPiv) * pow((1.-x) / (1.-lPiv), vec3(lCon)); o = mix(lo, hi, step(lPiv, x)); }
    // per-channel tone curves (lift / gamma / gain)
    o = lGain * pow(clamp(o + lLift*(1.-o), 0., 1.), 1./lGamma);
    // hue-selective saturation + hue nudges (key colour, sky colour), skin protected
    { vec3 hv = rgb2hsv(clamp(o, 0., 1.)); float Y = lum(o);
      float wK = band(hv.x, kHue, kW) * smoothstep(0.08, 0.3, hv.y), wY = band(hv.x, yHue, yW) * smoothstep(0.08, 0.3, hv.y);
      float skin = band(hv.x, 0.065, 0.05) * (1. - smoothstep(0.35, 0.62, hv.y)) * smoothstep(0.35, 0.65, hv.z) * skinK;
      hv.x = fract(hv.x + kShift*wK*(1.-skin) + yShift*wY);
      float wS = 1. - smoothstep(0., .5, Y), wH = smoothstep(.5, 1., Y);
      float sm = lSat * mix(1., lSatS, wS) * mix(1., lSatH, wH) * (1. + (kSat-1.)*wK + (ySat-1.)*wY);
      sm = mix(sm, min(sm, 1.06), skin);
      hv.y = clamp(hv.y * sm, 0., 0.96);
      o = hsv2rgb(hv); }
    // split toning: chroma-only shadow / highlight tints (luma kept), complementary per scene
    { float Y = lum(o); float wS = 1. - smoothstep(0.03, 0.4, Y), wH = smoothstep(0.5, 0.95, Y);
      o += (tSC - lum(tSC)) * wS * tSK + (tHC - lum(tHC)) * wH * tHK; }
    // vignette toward the scene's shadow colour
    { float r = length((vUv-0.5)*vec2(1., 1.25)) / 0.75; float v = vigK * smoothstep(vigR, 1.15, r); o = mix(o, o * vigC, v); }
    o = mix(s, o, gAmt);
    // highlight roll-off: cap warm, never pure white
    { float Y = lum(o); o = mix(o, o * vec3(1.0, 0.985, 0.965), smoothstep(0.7, 1.0, Y)); o = min(o, vec3(0.96, 0.95, 0.94)); }
    // soft shoulder: highlights roll into a warm cream ceiling (reference top-10% ~ #d5c7b7)
    { vec3 k = vec3(0.76); vec3 e = max(o - k, 0.); o = min(o, k) + (1. - k) * 0.82 * (1. - exp(-e / ((1. - k) * 0.82))); }
    o += (h(vUv*vec2(${W}.,${H}.)) - 0.5) * 0.018;
    gl_FragColor = vec4(clamp(o, 0., 1.), 1.); }`,
  { tB: { value: rtB.texture }, tN: { value: rtN.texture }, tBloom: { value: rtQ1.texture }, tRays: { value: rtQ3.texture }, prevVP: { value: new THREE.Matrix4() }, camWorld: { value: new THREE.Matrix4() },
    tanY: { value: 0.36 }, aspect: { value: W / H }, frame: { value: 0 }, rayK: { value: 0.7 }, bloomK: { value: 0.32 }, mbK: { value: 0 }, gAmt: { value: 1 }, rayCol: { value: new THREE.Color(1, 0.95, 0.85) },
    ...Object.fromEntries(['lExp', 'lGam', 'lCon', 'lPiv', 'lSat', 'lSatS', 'lSatH', 'kHue', 'kW', 'kSat', 'kShift', 'yHue', 'yW', 'ySat', 'yShift', 'skinK', 'halK', 'vigK', 'vigR', 'tSK', 'tHK'].map((k) => [k, { value: 0 }])),
    ...Object.fromEntries(['lLift', 'lGamma', 'lGain', 'tSC', 'tHC', 'halC', 'vigC'].map((k) => [k, { value: new THREE.Vector3(1, 1, 1) }])) });
const prevCam = new THREE.PerspectiveCamera(40, W / H, 0.1, FAR);
// Per-scene looks. One key hue (k*) + its complementary shadow tint (tSC); sky/second hue (y*) pops. Hues are 0..1 (0.08 orange, 0.12 ochre, 0.58 blue, 0.7 indigo, 0.9 magenta).
//   exp/gam: base exposure; con/piv: S-curve; lift/gamma/gain: per-channel curves; sat, satS/satH: shadow/highlight saturation scale;
//   tS/tH: shadow/highlight tint colours (chroma only) with strengths; vig: [amount, start radius, tint]; hal: halation strength + colour; bloom: bloom strength + threshold
const GRADES = {
  road: { exp: 1.08, gam: 1.28, con: 1.26, piv: 0.42, lift: [0.042, 0.020, 0.009], gamma: [1.02, 1.0, 1.0], gain: [1.02, 1.0, 0.99], sat: 0.92, satS: 0.82, satH: 0.85,
    k: [0.105, 0.06, 1.1, 0.0], y: [0.6, 0.09, 1.55, -0.012], tS: ['#3a5a8a', 0.12], tH: ['#ffc890', 0.04], vig: [0.24, 0.5, '#6a5a70'], hal: [0.16, '#ff6a30'], bloom: [0.32, 0.9] },
  stadium: { exp: 1.08, gam: 1.28, con: 1.26, piv: 0.42, lift: [0.042, 0.020, 0.014], gamma: [1.02, 1.0, 1.0], gain: [1.02, 1.0, 0.99], sat: 0.94, satS: 0.82, satH: 0.82,
    k: [0.985, 0.06, 1.2, 0.0], y: [0.62, 0.09, 1.5, -0.01], tS: ['#4a4a8a', 0.12], tH: ['#ffe0c0', 0.04], vig: [0.24, 0.5, '#6a5a78'], hal: [0.14, '#ff5a3a'], bloom: [0.30, 0.9] },
  night: { exp: 1.08, gam: 1.26, con: 1.22, piv: 0.3, lift: [0.032, 0.015, 0.039], gamma: [0.98, 0.99, 1.02], gain: [1.0, 1.0, 1.01], sat: 0.9, satS: 0.82, satH: 0.95,
    k: [0.09, 0.07, 1.45, 0.0], y: [0.64, 0.1, 0.9, 0.035], tS: ['#4a3090', 0.18], tH: ['#ffa040', 0.26], vig: [0.32, 0.45, '#4a3a6a'], hal: [0.30, '#ff8a3a'], bloom: [0.45, 0.75] },
  golden: { exp: 1.08, gam: 1.28, con: 1.24, piv: 0.4, lift: [0.062, 0.035, 0.044], gamma: [1.03, 0.99, 0.99], gain: [1.03, 0.99, 0.98], sat: 0.93, satS: 0.84, satH: 0.95,
    k: [0.07, 0.07, 0.86, -0.01], y: [0.04, 0.06, 1.0, -0.03], tS: ['#6a3a90', 0.16], tH: ['#ffa080', 0.06], vig: [0.18, 0.55, '#6a4a6a'], hal: [0.26, '#ff5a40'], bloom: [0.40, 0.85] },
  office: { exp: 1.06, gam: 1.3, con: 1.24, piv: 0.36, lift: [0.037, 0.015, 0.014], gamma: [1.03, 1.0, 0.98], gain: [1.03, 0.99, 0.96], sat: 0.9, satS: 0.86, satH: 0.85,
    k: [0.08, 0.07, 1.12, 0.0], y: [0.75, 0.1, 1.1, 0.0], tS: ['#6a3a5a', 0.16], tH: ['#ffc080', 0.06], vig: [0.38, 0.42, '#5a3a48'], hal: [0.24, '#ff7a40'], bloom: [0.38, 0.85] },
};
const LOOK_OF = { hot: 'road', day: 'stadium', explain: 'night', night: 'night', golden: 'golden', sunset: 'golden', dusk: 'golden', office: 'office' };
const hexV = (h) => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
const setGrade = (name, over = {}) => { const G = { ...GRADES[GRADES[name] ? name : LOOK_OF[name] || 'road'], ...over }, u = finalPass.u;
  u.lExp.value = G.exp; u.lGam.value = G.gam; u.lCon.value = G.con; u.lPiv.value = G.piv; u.lLift.value.set(...G.lift); u.lGamma.value.set(...G.gamma); u.lGain.value.set(...G.gain);
  u.lSat.value = G.sat; u.lSatS.value = G.satS; u.lSatH.value = G.satH;
  [u.kHue.value, u.kW.value, u.kSat.value, u.kShift.value] = G.k; [u.yHue.value, u.yW.value, u.ySat.value, u.yShift.value] = G.y; u.skinK.value = 1;
  u.tSC.value.set(...hexV(G.tS[0])); u.tSK.value = G.tS[1]; u.tHC.value.set(...hexV(G.tH[0])); u.tHK.value = G.tH[1];
  u.vigK.value = G.vig[0]; u.vigR.value = G.vig[1]; u.vigC.value.set(...hexV(G.vig[2]));
  u.halK.value = G.hal[0]; u.halC.value.set(...hexV(G.hal[1])); u.bloomK.value = G.bloom[0]; brightPass.u.thr.value = G.bloom[1]; u.gAmt.value = 1; };
const setCam = (cm, c) => { cm.position.set(...c.p); cm.up.set(0, 1, 0); cm.lookAt(...c.l); cm.rotateZ(c.roll || 0); cm.fov = c.fov; cm.updateProjectionMatrix(); cm.updateMatrixWorld(); };

// ---------- light presets ----------
function applyLight(L, f) {
  skyU.top.value.set(L.top); skyU.hor.value.set(L.hor); skyU.bot.value.set(L.ground);
  const el = L.el * Math.PI / 180, az = L.az * Math.PI / 180;
  const dir = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
  skyU.sun.value.copy(dir); skyU.sunCol.value.set(L.disc); skyU.sunSize.value = L.discSize ?? 0.0015; skyU.stars.value = L.stars || 0;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogN; scene.fog.far = L.fogF;
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemiI;
  sun.color.set(L.sunCol); sun.intensity = L.sunI; sun.castShadow = L.shadow !== false;
  // cool fill from the side opposite the key, low: lifts the shadow side with blue, keeps key/fill contrast
  const fa = az + Math.PI, fe = 25 * Math.PI / 180;
  fill.color.set(L.fillCol || L.sky); fill.intensity = L.fillI ?? 0.35;
  fill.position.set(Math.cos(fe) * Math.sin(fa), Math.sin(fe), Math.cos(fe) * Math.cos(fa)).multiplyScalar(100); fill.target.position.set(0, 0, 0);
  for (const c of clouds) { c.material.color.set(L.cloud); c.visible = L.clouds !== false; }
  return dir;
}

// fit the sun's ortho shadow frustum tightly to what the camera sees near the action: more texels where it matters
function fitShadow(cam, tgt, dir) {
  const d = cam.position.distanceTo(tgt), half = Math.tan(cam.fov * Math.PI / 360) * d;
  const ext = Math.min(60, Math.max(7, half * 1.9 + 3)); const sc = sun.shadow.camera;
  if (Math.abs(sc.right - ext) > 0.01) { sc.left = sc.bottom = -ext; sc.right = sc.top = ext; sc.updateProjectionMatrix(); }
  // keep penumbra roughly constant in world units (~6 cm) whatever the extent; slight extra softness for a low sun
  sun.shadow.radius = Math.min(10, Math.max(2, 0.06 / (2 * ext / sun.shadow.mapSize.x) * (dir.y < 0.35 ? 1.4 : 1)));
}
let cur = -1;

// ---------- mass crowd in the grandstands + town around the stadium (built once) ----------
let MASS = null;
function buildMass() {
  const mk = (v, st) => { const c = document.createElement('canvas'); c.width = 300; c.height = 500; const g = c.getContext('2d'); g.scale(0.5, 0.5);
    oddverra(g, { seed: 200 + v, ...oddOf('PASS' + v) }, { t: v * 7, expr: st === 2 ? 'shock' : ['grin', 'laugh', 'excited', 'happy'][v % 4], blink: 0, cheer: st === 0 && v % 3 !== 2 ? 1 : undefined, wave: st === 1 || (st === 0 && v % 3 === 2) ? 0.7 : undefined, tilt: (v % 5 - 2) * 3 });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return new THREE.MeshLambertMaterial({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: 0.86, color: new THREE.Color(0xffffff).multiplyScalar(0.34), alphaTest: 0.5, side: THREE.DoubleSide }); };
  const mats = Array.from({ length: 12 }, (_, v) => [0, 1, 2].map((st) => mk(v, st)));
  const G = new THREE.Group(); world.stadium.add(G); const list = [];
  const geo = BODY.clone(); geo.scale(0.92, 0.92, 0.92);
  for (const side of [-1, 1]) for (let r = 0; r < 6; r++) for (let z = -29.4; z <= 11.2; z += 0.78) {
    const x = side * (6.6 + r * 1.2);
    if (side > 0) { let near = false; for (let i = 0; i < 60; i++) { const rr = i % 5; if (rr !== r) continue; const cz = -26 + Math.floor(i / 5) * 3.0 + (rr % 2) * 1.3; if (Math.abs(cz - z) < 0.7) near = true; } if (near) continue; }
    const k = list.length, v = Math.floor(rnd2(k * 1.7) * 12);
    const m = new THREE.Mesh(geo, mats[v][0]); m.position.set(x + (rnd2(k) - 0.5) * 0.25, 0.6 + 0.6 * r, z + (rnd2(k + 9) - 0.5) * 0.2); m.receiveShadow = true; m.renderOrder = 1; G.add(m); list.push({ m, v, k });
  }
  dressStadiumTown(G, (x, z) => Math.abs(x) < 34 && z > -86 && z < 62);
  MASS = { list, mats };
}
const rnd2 = (k) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function updateMass(f, cam) { if (location.search.includes('nomass')) { if (MASS) for (const x of MASS.list) x.m.visible = false; if (!world.stadium.visible) return; }
  if (!world.stadium.visible) return; if (!MASS) buildMass();
  const shock = f >= 1395 && f < 1540;
  for (const { m, v, k } of MASS.list) { m.material = MASS.mats[v][shock ? 2 : Math.sin(f * 0.35 + k) > 0 ? 0 : 1]; m.rotation.set(0, Math.atan2(cam.position.x - (m.position.x + 400), cam.position.z - m.position.z), 0); m.position.y = Math.round((m.position.y - 0.6) / 0.6) * 0.6 + 0.6 + (shock ? 0 : 0.05 * Math.max(0, Math.sin(f * 0.35 + k))); }
}
window.renderFrame = (f) => { const TT0 = performance.now(); try { return renderFrame0(f); } finally { if (location.search.includes('prof')) { renderer.getContext().finish(); console.warn('PROF total ' + f + ' ' + Math.round(performance.now() - TT0) + 'ms'); } } };
const renderFrame0 = (f) => {
  const LV = LVQ == null ? null : louvre.viewFor(LVQ === 'f' ? f : +LVQ); // [MONA-louvre]
  const PV = NTV != null ? nt.viewFor(NTV === 'a' ? f : +NTV, f) : /* [NT-sets] */ LBV != null ? lb.viewFor(LBV === 'a' ? f : +LBV, f) : /* [LB-sets] */ CLV != null ? cleo.viewFor(CLV === 'a' ? f : +CLV, f) : /* [CLEO-sets] */ LNV != null ? ln.viewFor(LNV === 'a' ? f : +LNV, f) : /* [LN-sets] */ BWV != null ? bw.viewFor(BWV === 'a' ? f : +BWV, f) : /* [BW-sets] */ NPV != null ? napoleon.viewFor(NPV === 'a' ? f : +NPV, f) : /* [NAP-sets] */ HWV != null ? hw.viewFor(HWV === 'a' ? f : +HWV, f) : /* [HW-sets] */ TIV != null ? titanic.viewFor(TIV === 'a' ? f : +TIV, f) : /* [JG-sets] */ DHV != null ? homes.viewFor(DHV === 'a' ? f : +DHV, f) : /* [PD-sets1] */ DWV != null ? works.viewFor(DWV === 'a' ? f : +DWV, f) : /* [PD-sets2] */ OHV != null ? ohio.viewFor(OHV === 'a' ? f : +OHV, f) : /* [KCH-sets1] */ PLV != null ? pills.viewFor(PLV === 'a' ? f : +PLV, f) : /* [KCH-sets2] */ HBV != null ? harbor.viewFor(HBV === 'a' ? f : +HBV, f) : /* [LIB-harbor] */ EGV != null ? egypt.viewFor(EGV === 'a' ? f : +EGV, f) : /* [LIB-egypt] */ EIV != null ? princeton.viewFor(EIV === 'a' ? f : +EIV, f) : /* [EIN-sets] */ SWV != null ? swamp.viewFor(SWV === 'a' ? f : +SWV, f) : /* [TEDDY-swamp] */ BKV != null ? brooklyn.viewFor(BKV === 'a' ? f : +BKV, f) : /* [TEDDY-brooklyn] */ HVQ != null ? havana.viewFor(HVQ === 'a' ? f : +HVQ) : /* [CASTRO-havana] */ RFV != null ? reef.viewFor(RFV === 'a' ? f : +RFV, f) : /* [CASTRO-reef] */ PARISV == null ? (STV == null ? (THV == null ? null : theatre.viewFor(THV === 'a' ? f : +THV)) : station.view(STV === 'a' ? f : +STV)) : paris.view(PARISV === 'a' ? f : +PARISV); // [MONA-paris] [BOOTH-station] [BOOTH-theatre]
  let L; const sh = shotAt(f), RM = roomAt(f); L = PV ? PV.L : LV ? LV.L : RM ? rooms.lightFor(RM) : lightFor(f); const G = gradeAt(f); if (RM) G.over = rooms.gradeFor(RM); if (LV) Object.assign(G, { look: LV.look, over: LV.grade, flash: 0 }); // [MONA-louvre]
  if (PV) Object.assign(G, { look: PV.look, over: PV.grade, flash: 0 }); // [MONA-paris]
  const SA = !PV && !LV && setAt ? setAt(f) : null, SM = SA ? world[SA[0]] : null; // [MONA-sets] timeline-driven set module (louvre / paris)
  if (SM) { L = SM.lightFor(SA[1]); G.look = SM.lookFor(SA[1]); G.over = SM.gradeFor(SA[1]); }
  setGrade(G.look || sh.light, G.over);
  const dir = applyLight(L, f);
  world.dc.visible = false; world.curRoom = null; rooms.show(world, null);
  louvre.show(world, null); paris.show(world, null); station.show(world, null); theatre.show(world, null); // [BOOTH-station] [BOOTH-theatre]
  reef.show(world, null); reef.tick(f); // [CASTRO-reef]
  havana.show(world, null); // [CASTRO-havana]
  brooklyn.show(world, null); // [TEDDY-brooklyn]
  swamp.show(world, null); swamp.tick(f); // [TEDDY-swamp]
  princeton.show(world, null); princeton.tick(f); // [EIN-sets]
  harbor.show(world, null); harbor.tick(f); // [LIB-harbor]
  egypt.show(world, null); egypt.tick(f); // [LIB-egypt]
  ohio.show(world, null); ohio.tick(f); // [KCH-sets1]
  pills.show(world, null); pills.tick(f); // [KCH-sets2]
  homes.show(world, null); homes.tick(f); // [PD-sets1]
  works.show(world, null); works.tick(f); // [PD-sets2]
  hw.show(world, null); hw.tick(f); // [HW-sets]
  ln.show(world, null); ln.tick(f); // [LN-sets]
  titanic.show(world, null); titanic.tick(f); // [JG-sets]
  napoleon.show(world, null); napoleon.tick(f); // [NAP-sets]
  cleo.show(world, null); cleo.tick(f); // [CLEO-sets]
  bw.show(world, null); bw.tick(f); // [BW-sets]
  lb.show(world, null); lb.tick(f); // [LB-sets]
  nt.show(world, null); nt.tick(f); // [NT-sets]
  worldAt(f, world, T); if (world.dc.visible) world.dc.flag.wave(f / 30);
  if (SM) SM.show(world, SA[1]);
  if (LV) louvre.applyView(world, PRACT, LV.i); // [MONA-louvre]
  if (PV) (PV.mod || paris).apply(world, PV); // [MONA-paris] [BOOTH-station]
  { const hm = location.search.match(/hide=([0-9]+)-([0-9]+)/); if (hm && world.stadium.visible) { const a0 = +hm[1], a1 = +hm[2]; world.stadium.children.forEach((c, i) => { if (i >= a0 && i < a1) c.visible = false; }); } }
  if (location.search.includes('listst') && !window.__ls) { window.__ls = 1; world.stadium.children.forEach((c, i) => { let n = 0; c.traverse((o) => { if (o.isMesh) n++; }); }); console.warn('STCOUNT ' + world.stadium.children.length); }
  const c = PV ? PV.cam : LV ? LV.cam : camAt(f); // [MONA-louvre] [MONA-paris]
  camera.position.set(...c.p); camera.up.set(0, 1, 0); camera.lookAt(...c.l); camera.rotateZ(c.roll || 0);
  camera.fov = c.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  sky.position.copy(camera.position);
  const tgt = new THREE.Vector3(...(c.shadowAt || c.l));
  sun.target.position.copy(tgt); sun.position.copy(tgt).addScaledVector(dir, 150);
  fitShadow(camera, tgt, dir); fill.position.add(tgt); fill.target.position.copy(tgt);
  if (PV) (PV.mod || paris).placeLights(PRACT, PV.set, tgt); /* [BOOTH-station] */ else if (SM) SM.placeLights(PRACT, SA[1], tgt); else if (LV) louvre.placeLights(PRACT, LV.set); else if (world.curRoom) rooms.placeLights(PRACT, world.curRoom); else placePracticals(L, tgt); // [MONA-louvre]
  const T0 = performance.now(); placeActors(f, camera, L); updateMass(f, camera); const T1 = performance.now(); if (location.search.includes('prof')) console.warn('PROF actors ' + Math.round(T1 - T0) + 'ms cards=' + cardMeshes.filter((x) => x.visible).length + ' calls');
  // colour
  const T2 = performance.now();  renderer.setRenderTarget(rtC); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera); if (location.search.includes('prof')) { renderer.getContext().finish(); console.warn('PROF colour ' + Math.round(performance.now() - T2) + 'ms tris=' + renderer.info.render.triangles + ' draws=' + renderer.info.render.calls); }
  // normal + depth
  const saved = []; const fog = scene.fog; scene.fog = null; const sc = sun.castShadow; sun.castShadow = false;
  scene.traverse((o) => {
    if (!o.isMesh || !o.visible) return;
    if (fxMeshes.includes(o) && o.material.map) { saved.push([o, o.material, true]); const m = o.userData.nd || (o.userData.nd = fxND.clone()); m.uniforms.map.value = o.material.map; m.uniforms.op.value = o.material.opacity; o.material = m; return; }
    if (NOND.has(o) || o.userData.outline) { saved.push([o, o.material, false]); o.visible = false; return; }
    if (CARDS.has(o) || (!Array.isArray(o.material) && o.material.map && o.material.alphaTest >= 0.5)) { saved.push([o, o.material, true]); const m = o.userData.nd || (o.userData.nd = cardND.clone()); m.uniforms.map.value = o.material.map; o.material = m; return; }
    saved.push([o, o.material, true]);
    const side = Array.isArray(o.material) ? THREE.FrontSide : o.material.side;
    if (Array.isArray(o.material)) o.material = o.material.map((mm) => mm.visible === false ? mm : ndMat(mm.side)); else o.material = ndMat(side);
  });
  renderer.setRenderTarget(rtN); renderer.setClearColor(new THREE.Color(0.5, 0.5, 1), 1); renderer.clear(); renderer.render(scene, camera);
  for (const [o, m, v] of saved) { o.material = m; o.visible = true; }
  scene.fog = fog; sun.castShadow = sc;
  // ink + grade
  const SK = (k) => location.search.includes('skip' + k); if (!SK('ao')) renderAO(camera, L); inkPass.u.tC.value = SK('ao') ? rtC.texture : rtCA.texture;
  const u = inkPass.u; u.sat.value = 1.0; u.flash.value = G.flash; u.vig.value = 0; u.gain.value.set(1, 1, 1); u.lift.value.set(0, 0, 0);
  u.focus.value = c.focus || 5; u.cInf.value = c.cInf || 0;
  renderer.setRenderTarget(rtA); renderer.render(inkPass.s, quadCam);
  if (inkPass.u.dbg.value) { renderer.setRenderTarget(null); renderer.render(inkPass.s, quadCam); return sh.id; }
  dofPass.u.focus.value = c.focus || 5; dofPass.u.cInf.value = c.cInf || 0; dofPass.u.bgK.value = 1.2 * RS * (G.dofK ?? 1);
  if (dofPass.u.cInf.value >= 0.5) {
    for (const [src, dst, dx, dy] of [[rtA, rtP1, 1, 0], [rtP1, rtP2, 0, 1]]) { blurPass.u.tI.value = src.texture; blurPass.u.dir.value.set(dx / (W / 2), dy / (H / 2)); renderer.setRenderTarget(dst); renderer.render(blurPass.s, quadCam); }
    dofPass.u.tP.value = rtP2.texture; }
  if (SK('dof')) dofPass.u.cInf.value = 0; renderer.setRenderTarget(rtB); renderer.render(dofPass.s, quadCam);
  // bloom (quarter res)
  renderer.setRenderTarget(rtQ1); renderer.render(brightPass.s, quadCam);
  for (const [src, dst, dx, dy] of [[rtQ1, rtQ2, 1, 0], [rtQ2, rtQ1, 0, 1], [rtQ1, rtQ2, 1, 0], [rtQ2, rtQ1, 0, 1]]) { blurPass.u.tI.value = src.texture; blurPass.u.dir.value.set(dx / QW, dy / QH); renderer.setRenderTarget(dst); renderer.render(blurPass.s, quadCam); }
  // light shafts from the sun when it is on screen or just off it
  const sp = camera.position.clone().addScaledVector(dir, 1000).project(camera);
  const onScreen = sp.z < 1 && Math.abs(sp.x) < 1.6 && Math.abs(sp.y) < 1.6 && (L.shafts ?? 1) > 0 && dir.y > -0.05;
  rayPass.u.on.value = onScreen ? (L.shafts ?? 1) * (1 - Math.max(0, Math.hypot(sp.x, sp.y) - 0.9) / 0.7) : 0; rayPass.u.sunUV.value.set(sp.x * 0.5 + 0.5, sp.y * 0.5 + 0.5);
  if (SK('rays')) rayPass.u.on.value = 0; renderer.setRenderTarget(rtQ3); renderer.render(rayPass.s, quadCam);
  // motion blur from the camera move since the last frame + bloom + rays + film finish
  const pc = PV ? PV.cam : LV ? LV.cam : camAt(Math.max(0, f - 1)); setCam(prevCam, pc); // [MONA-louvre]
  const cut = shotAt(Math.max(0, f - 1)).id !== sh.id;
  finalPass.u.prevVP.value.multiplyMatrices(cut ? camera.projectionMatrix : prevCam.projectionMatrix, cut ? camera.matrixWorldInverse : prevCam.matrixWorldInverse);
  { const d0 = new THREE.Vector3(), d1 = new THREE.Vector3(); camera.getWorldDirection(d0); prevCam.getWorldDirection(d1); const turn = d0.angleTo(d1); finalPass.u.mbK.value = c.whip ? 1 : cut ? 0 : Math.min(1, Math.max(0, (turn - 0.004) / 0.02)); }
  finalPass.u.camWorld.value.copy(camera.matrixWorld); finalPass.u.tanY.value = Math.tan(camera.fov * Math.PI / 360); finalPass.u.frame.value = f;
  finalPass.u.rayCol.value.set(L.sunCol);
  renderer.setRenderTarget(null); renderer.render(finalPass.s, quadCam);
  return sh.id;
};
window.ready = true;
