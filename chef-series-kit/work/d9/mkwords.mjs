// beats_d9.js -> web/words_d9.json  (run: node work/mkwords.mjs)
import fs from 'fs';
fs.copyFileSync('web/beats_d9.js', 'work/_beats.mjs');
const { BEATS, S, TOTAL } = await import('./_beats.mjs');
const out = [];
for (const [n, , caps] of BEATS) for (const [off, text] of caps) text.split(' ').forEach((w, j) => { const s = (S[n] + off + j * 3) / 30; out.push({ w, s: +s.toFixed(3), e: +(s + 0.08).toFixed(3) }); });
fs.writeFileSync('web/words_d9.json', JSON.stringify(out, null, 0));
fs.unlinkSync('work/_beats.mjs');
console.log('words', out.length, 'TOTAL', TOTAL, JSON.stringify(S));
