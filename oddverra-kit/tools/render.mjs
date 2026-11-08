// node render.mjs <outdir> "<frames>"   frames: "0-1284" or "5,40,90"; env WORKERS, RESUME=1
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const [out, spec] = process.argv.slice(2);
const frames = spec.split(',').flatMap((s) => { const [a, b] = s.split('-').map(Number); return b === undefined ? [a] : Array.from({ length: b - a + 1 }, (_, i) => a + i); });
fs.mkdirSync(out, { recursive: true });
const root = path.resolve('web'), types = { '.js': 'text/javascript', '.html': 'text/html' };
const srv = http.createServer((q, r) => { let f = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (q.url.startsWith('/three/')) f = path.resolve('node_modules/three/build', path.basename(f)); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0);
const port = srv.address().port;
const todo = frames.filter((f) => !(process.env.RESUME && fs.existsSync(`${out}/f${String(f).padStart(4, '0')}.jpg`)));
const N = +(process.env.WORKERS || 1);
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-accelerated-2d-canvas', '--disable-gpu-rasterization'] });
let done = 0; const t0 = Date.now();
await Promise.all(Array.from({ length: N }, async (_, w) => {
  const RS = +(process.env.RS || 1); const p = await b.newPage({ viewport: { width: Math.round(1080 * RS), height: Math.round(1920 * RS) } });
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message)); p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('console:', m.text().slice(0, 300)); });
  await p.goto(`http://localhost:${port}/index.html${process.env.Q || ''}${process.env.RS ? ((process.env.Q || '').includes('?') ? '&' : '?') + 'rs=' + process.env.RS : ''}`); await p.waitForFunction('window.ready', { timeout: 60000 });
  for (let i = w; i < todo.length; i += N) {
    const f = todo[i];
    const shot = (f) => p.evaluate((f) => { window.renderFrame(f); const c = document.querySelector('canvas'); const t = document.createElement('canvas'); t.width = 24; t.height = 42; const g = t.getContext('2d'); g.drawImage(c, 0, 0, 24, 42); const d = g.getImageData(0, 0, 24, 42).data; let m = 0; for (let i = 0; i < d.length; i += 4) m += d[i] + d[i + 1] + d[i + 2]; return [c.toDataURL('image/jpeg', 0.95), m / (d.length / 4) / 3]; }, f);
    let [url, mean] = await shot(f);
    for (let tries = 0; mean < 4 && tries < 3; tries++) { // black frame = lost GPU context: reload the page and retry
      console.log(`black frame ${f} (mean ${mean.toFixed(1)}), reloading page, retry ${tries + 1}`); await p.reload(); await p.waitForFunction('window.ready', { timeout: 600000 }); [url, mean] = await shot(f); }
    fs.writeFileSync(`${out}/f${String(f).padStart(4, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
    done++; if (done % 10 === 0 || done === todo.length) console.log(`progress ${done}/${todo.length} ${((Date.now() - t0) / done / 1000).toFixed(1)}s/f`);
  }
}));
await b.close(); srv.close(); console.log('DONE');
