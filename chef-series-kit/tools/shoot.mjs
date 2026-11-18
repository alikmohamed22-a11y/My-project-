// node shoot.mjs "2,3,8?n=SAM&e=happy"   |  node shoot.mjs anim   (renders 60 PNG frames to sheets/anim/)
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const root = path.resolve('.'); const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f)) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(f).pipe(r); }).listen(0);
const port = srv.address().port; const b = await chromium.launch({ args: ['--disable-gpu'] }); const p = await b.newPage();
p.on('pageerror', (e) => console.log('PAGEERROR', e.message)); p.on('console', (m) => console.log('console:', m.text()));
const grab = async (url, out, type = 'image/jpeg') => { await p.goto(url); await p.waitForFunction('window.done', { timeout: 30000 }); const d = await p.evaluate((t) => document.getElementById('c').toDataURL(t, 0.9), type); fs.writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); };
for (const s of (process.argv[2] || '1,2,2b,3,3b,4,4b,5,6,7,8,9,10,11,12,13,animStrip').split(',')) {
  if (s === 'anim') { fs.mkdirSync('sheets/anim', { recursive: true }); for (let f = 0; f < 60; f++) await grab(`http://localhost:${port}/sheet.html?s=anim&f=${f}`, `sheets/anim/f${String(f).padStart(3, '0')}.png`, 'image/png'); console.log('ok anim'); continue; }
  const [id, extra] = s.split('?'); const t0 = Date.now();
  await grab(`http://localhost:${port}/sheet.html?s=${id}${extra ? '&' + extra : ''}`, `sheets/sheet_${id}${extra ? '_' + extra.replace(/[=&]/g, '') : ''}.jpg`);
  console.log('ok', s, Date.now() - t0);
}
await b.close(); srv.close();
