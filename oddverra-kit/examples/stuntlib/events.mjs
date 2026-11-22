// [STUNT] node events.mjs -> out/events.json (jump/landing/near-miss/wanted timeline of the library, for audio + edit sync)
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const root = path.resolve('web'); const srv = http.createServer((q, r) => { let f = path.join(root, q.url.split('?')[0]); if (q.url.startsWith('/three/')) f = path.resolve('node_modules/three/build', path.basename(f)); if (!fs.existsSync(f)) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(f).pipe(r); }).listen(0);
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 540, height: 480 } });
await p.goto(`http://localhost:${srv.address().port}/index.html?rs=0.5`); await p.waitForFunction('window.ready', { timeout: 600000 });
fs.writeFileSync('out/events.json', JSON.stringify(await p.evaluate(() => window.EVENTS), null, 0)); await b.close(); srv.close(); console.log('events written');
