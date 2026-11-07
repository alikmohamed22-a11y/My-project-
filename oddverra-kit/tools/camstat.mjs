// node camstat.mjs [web dir] [frames] : per-frame camera stats (head size, framing, motion) without rendering.
import path from 'path';
const dir = path.resolve(process.argv[2] || 'web');
const S = await import(dir + '/story7.js');
const SU = 0.00225, AS = 1080 / 1920;
const sub = (a, b) => a.map((x, i) => x - b[i]), dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a) => { const l = Math.hypot(...a); return a.map((x) => x / l); };
function basis(c) { const fw = nrm(sub(c.l, c.p)); let r = nrm(cross(fw, [0, 1, 0])); let u = cross(r, fw); const k = c.roll || 0; if (k) { const r2 = r.map((x, i) => x * Math.cos(k) + u[i] * Math.sin(k)), u2 = u.map((x, i) => u[i] * Math.cos(k) - r[i] * Math.sin(k)); r = r2; u = u2; } return { fw, r, u }; }
function proj(c, B, P) { const d = sub(P, c.p), z = dot(d, B.fw); const t = Math.tan(c.fov * Math.PI / 360); return [dot(d, B.r) / (z * t * AS), dot(d, B.u) / (z * t), z]; }
const spec = process.argv[3] || Array.from({ length: 21 }, (_, i) => Math.min(2007, i * 100)).join(',');
const frames = spec.split(',').flatMap((s) => { const [a, b] = s.split('-').map(Number); return b === undefined ? [a] : Array.from({ length: b - a + 1 }, (_, i) => a + i); });
const verbose = !process.argv[4];
let moving = 0, total = 0;
for (const f of frames) {
  const c = S.camAt(f), B = basis(c);
  if (f > 0 && S.shotAt(f).id === S.shotAt(f - 1).id) {
    const p = S.camAt(f - 1), Bp = basis(p); const rot = Math.acos(Math.min(1, dot(B.fw, Bp.fw))); const tr = Math.hypot(...sub(c.p, p.p)) / Math.max(1, c.focus);
    total++; if (rot + tr > 0.0025) moving++;
  }
  if (!verbose) continue;
  const A = S.actorsAt(f).filter((a) => !/^PASS/.test(a.o));
  const out = A.map((a) => { const sit = a.opts.mode === 'sit'; const sc = a.s || 1; const top = a.pos[1] + (sit ? 1.47 : 1.71) * sc, hc = top - 0.33 * sc, bot = a.pos[1] + 0.05;
    const pt = proj(c, B, [a.pos[0], top, a.pos[2]]), ph = proj(c, B, [a.pos[0], top - 0.67 * sc, a.pos[2]]), pb = proj(c, B, [a.pos[0], bot, a.pos[2]]);
    const head = (pt[1] - ph[1]) / 2; const inF = pt[2] > 0 && Math.abs(pt[0]) < 1 && pt[1] < 1 && pb[1] > -1;
    return `${a.o}:h${head.toFixed(2)} x${pt[0].toFixed(2)} y${pt[1].toFixed(2)}..${pb[1].toFixed(2)} z${pt[2].toFixed(1)}${inF ? '' : ' OUT'}`; });
  const sh = S.shotAt(f);
  console.log(`${String(f).padStart(4)} s${sh.id} ${sh.kind || 'old' + sh.old} fov${c.fov.toFixed(0)} foc${c.focus.toFixed(1)} cInf${c.cInf}  ${out.join(' | ')}`);
}
console.log(`moving frames: ${moving}/${total} = ${(100 * moving / total).toFixed(0)}%`);
