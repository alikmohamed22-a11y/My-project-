// node tools/render.mjs <outdir> "<frames>"   frames: "0-1304" or "5,40,90" (mixable: "0-10,50")
// env: WORKERS=n (pages in parallel), RS=2 (2160x3840), RESUME=1 (skip existing), Q="?nocap=1" (extra query)
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '../web');
const [out, spec] = process.argv.slice(2);
if (!out || !spec) { console.log('usage: node tools/render.mjs <outdir> "0-1304"'); process.exit(1); }
const frames = spec.split(',').flatMap((s) => { const [a, b] = s.split('-').map(Number); return b === undefined ? [a] : Array.from({ length: b - a + 1 }, (_, i) => a + i); });
fs.mkdirSync(out, { recursive: true });
const types = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.ttf': 'font/ttf' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0);
const port = srv.address().port;
const todo = frames.filter((f) => !(process.env.RESUME && fs.existsSync(`${out}/f${String(f).padStart(4, '0')}.jpg`)));
const N = Math.max(1, +(process.env.WORKERS || 1)), RS = +(process.env.RS || 1);
const b = await chromium.launch({ args: ['--disable-gpu'] });
let done = 0, errors = 0, rsum = 0, rmax = 0, rmaxf = -1; const t0 = Date.now();
await Promise.all(Array.from({ length: N }, async (_, w) => {
  const p = await b.newPage({ viewport: { width: 540, height: 960 } });
  p.on('pageerror', (e) => { errors++; console.log('PAGEERROR', e.message); });
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') { errors++; console.log('console:', m.text().slice(0, 300)); } });
  const q = new URLSearchParams((process.env.Q || '').replace(/^\?/, '')); if (RS !== 1) q.set('rs', RS);
  await p.goto(`http://localhost:${port}/index.html?${q}`); await p.waitForFunction('window.ready', null, { timeout: 60000 });
  for (let i = w; i < todo.length; i += N) {
    const f = todo[i];
    const [ms, url] = await p.evaluate((f) => { const ms = window.renderFrame(f); return [ms, document.querySelector('canvas').toDataURL('image/jpeg', 0.92)]; }, f);
    rsum += ms || 0; if (ms > rmax) { rmax = ms; rmaxf = f; }
    fs.writeFileSync(`${out}/f${String(f).padStart(4, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
    done++; if (done % 20 === 0 || done === todo.length) console.log(`progress ${done}/${todo.length} ${((Date.now() - t0) / done / 1000).toFixed(2)}s/f (wall, ${N} workers)`);
  }
}));
await b.close(); srv.close(); console.log(`DONE ${done} frames, ${errors} errors; renderFrame avg ${(rsum / Math.max(1, done)).toFixed(0)} ms, max ${rmax.toFixed(0)} ms (f${rmaxf})`);
