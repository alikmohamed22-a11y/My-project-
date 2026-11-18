// node projchk.mjs f1,f2,...  -> per actor: screen x,y in [-1,1] (and depth) for the story camera
import * as St from './web/story_alarm.js';
const fr = process.argv[2].split(',').map(Number);
for (const f of fr) { const c = St.camAt(f); const fw0 = [c.l[0] - c.p[0], c.l[1] - c.p[1], c.l[2] - c.p[2]], n = (v) => { const L = Math.hypot(...v); return v.map((x) => x / L); }, fw = n(fw0), r = n([-fw[2], 0, fw[0]]), u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]], t = Math.tan(c.fov * Math.PI / 360);
  const out = St.actorsAt(f).map((a) => { const d = [0, 1, 2].map((i) => a.pos[i] + (i === 1 ? 0.8 * (a.s || 1) : 0) - c.p[i]); const z = d[0] * fw[0] + d[1] * fw[1] + d[2] * fw[2]; const x = (d[0] * r[0] + d[1] * r[1] + d[2] * r[2]) / (z * t * 0.5625), y = (d[0] * u[0] + d[1] * u[1] + d[2] * u[2]) / (z * t); return `${a.o}:x${x.toFixed(2)} y${y.toFixed(2)} z${z.toFixed(1)}`; });
  console.log(f, St.shotAt(f).kind, out.join('  ')); }
