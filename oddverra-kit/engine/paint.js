// Procedural hand-painted texture painters (pure canvas 2D, no THREE).
// Every painter draws a seamlessly tiling image. Texture lines are always a darker,
// slightly indigo-leaning shade of the local base colour so they read as illustrated.
// Painters take (g, w, h, opts) and are wrapped by mkTex() in main.js.

// ---------- colour helpers ----------
const INK = [43, 29, 74]; // #2b1d4a
export const hex = (c) => (typeof c === 'number' ? [(c >> 16) & 255, (c >> 8) & 255, c & 255]
  : Array.isArray(c) ? c : [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]);
export const css = (c, a = 1) => { const [r, g, b] = hex(c); return `rgba(${r | 0},${g | 0},${b | 0},${a})`; };
const cl = (x) => Math.max(0, Math.min(255, x));
// darker illustrated shade: multiply value, lean toward indigo ink the darker it goes
export const shade = (c, k) => { const [r, g, b] = hex(c), t = (1 - k) * 0.32; return [cl(r * k * (1 - t) + INK[0] * t), cl(g * k * (1 - t) + INK[1] * t), cl(b * k * (1 - t) + INK[2] * t)]; };
// lighter: lift toward warm cream
export const tint = (c, k) => { const [r, g, b] = hex(c), t = Math.min(1, (k - 1)); return [cl(r + (255 - r) * t * 0.9), cl(g + (246 - g) * t * 0.9), cl(b + (226 - b) * t * 0.9)]; };
export const vary = (c, d) => (d >= 0 ? tint(c, 1 + d) : shade(c, 1 + d));
export const mixc = (a, b, t) => { const A = hex(a), B = hex(b); return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; };

// ---------- deterministic randomness ----------
export const rng = (seed) => { let a = (seed * 2654435761) >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const h2 = (i, j, s) => { let x = Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(s, 1442695041); x = Math.imul(x ^ (x >>> 13), 1274126177); return ((x ^ (x >>> 16)) >>> 0) / 4294967296; };
// periodic value noise; u,v in [0,1), px,py lattice cells per tile
const vnoise = (u, v, px, py, s) => {
  const x = u * px, y = v * py, i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const i0 = ((i % px) + px) % px, j0 = ((j % py) + py) % py, i1 = (i0 + 1) % px, j1 = (j0 + 1) % py;
  const a = h2(i0, j0, s), b = h2(i1, j0, s), c = h2(i0, j1, s), d = h2(i1, j1, s);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
};
export const fbm = (u, v, px, py, oct, s) => { let t = 0, amp = 0.5, n = 0; for (let o = 0; o < oct; o++) { t += amp * vnoise(u, v, px << o, py << o, s + o * 17); n += amp; amp *= 0.5; } return t / n; };

// per-pixel multiply by f(u,v) -> [mr,mg,mb] (or a number)
export const modulate = (g, w, h, f) => {
  const im = g.getImageData(0, 0, w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const m = f((x + 0.5) / w, (y + 0.5) / h), k = (y * w + x) * 4;
    if (typeof m === 'number') { d[k] = cl(d[k] * m); d[k + 1] = cl(d[k + 1] * m); d[k + 2] = cl(d[k + 2] * m); }
    else { d[k] = cl(d[k] * m[0]); d[k + 1] = cl(d[k + 1] * m[1]); d[k + 2] = cl(d[k + 2] * m[2]); }
  }
  g.putImageData(im, 0, 0);
};
// draw something at (x,y) and its wrapped copies so the tile stays seamless
const wrap = (w, h, x, y, r, fn) => { for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) { const X = x + dx, Y = y + dy; if (X + r < 0 || X - r > w || Y + r < 0 || Y - r > h) continue; fn(X, Y); } };
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// a small stone/pebble: fill, darker outline, light catch
const pebble = (g, x, y, rx, ry, rot, col, R) => {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = css(shade(col, 0.55), 0.35); g.beginPath(); g.ellipse(rx * 0.25, ry * 0.45, rx * 1.05, ry * 0.9, 0, 0, 7); g.fill();
  g.beginPath(); const n = 7; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, k = 0.82 + 0.3 * R(); const px = Math.cos(a) * rx * k, py = Math.sin(a) * ry * k; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath();
  g.fillStyle = css(col); g.fill(); g.lineWidth = Math.max(1, rx * 0.16); g.strokeStyle = css(shade(col, 0.5), 0.85); g.stroke();
  g.fillStyle = css(tint(col, 1.35), 0.7); g.beginPath(); g.ellipse(-rx * 0.25, -ry * 0.3, rx * 0.38, ry * 0.25, 0, 0, 7); g.fill();
  g.restore();
};
const crack = (g, x, y, len, ang, col, R, wdt = 1.3) => {
  g.strokeStyle = css(col, 0.75); g.lineCap = 'round'; g.lineJoin = 'round';
  const walk = (x, y, len, ang, lw) => { g.lineWidth = lw; g.beginPath(); g.moveTo(x, y); let L = 0; while (L < len) { const st = 3 + R() * 5; ang += (R() - 0.5) * 0.9; x += Math.cos(ang) * st; y += Math.sin(ang) * st; L += st; g.lineTo(x, y); if (R() < 0.12 && lw > 0.6) { g.stroke(); walk(x, y, len * 0.4, ang + (R() < 0.5 ? 1 : -1) * (0.6 + R() * 0.6), lw * 0.7); g.lineWidth = lw; g.beginPath(); g.moveTo(x, y); } } g.stroke(); };
  walk(x, y, len, ang, wdt);
};

// ---------- DIRT ROAD ----------
// u spans the full road width (edges at u=0/1), v runs along the road. opts.ruts: [[u, halfwidth]]
export function dirt(g, w, h, o = {}) {
  const base = hex(o.base || '#c9a26a'), R = rng(o.seed || 11), ruts = o.ruts || [[0.375, 0.03], [0.625, 0.03]];
  g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  const rutAt = (u, v) => { let m = 0; for (const [ru, rw] of ruts) { const c = ru + 0.012 * Math.sin(v * Math.PI * 2 * 2 + ru * 9) + 0.006 * Math.sin(v * Math.PI * 2 * 7); m = Math.max(m, 1 - smooth(rw * 0.5, rw * 1.25, Math.abs(u - c))); } return m; };
  modulate(g, w, h, (u, v) => {
    const big = fbm(u, v, 2, 6, 3, 3), mid = fbm(u, v, 8, 24, 3, 7), fine = vnoise(u, v, 64, 128, 9);
    let m = 0.86 + 0.28 * big + 0.06 * (mid - 0.5) + 0.0 * fine;
    m *= 1 - 0.1 * smooth(0.6, 0.75, fbm(u, v, 3, 9, 2, 21)); // damp darker patches
    const ed = Math.min(u, 1 - u) + 0.035 * (mid - 0.5); // darker, grassy-damp edges
    m *= 0.76 + 0.24 * smooth(0.02, 0.14, ed);
    const r = rutAt(u, v); m *= 1 - 0.13 * r;
    const crown = 1 - smooth(0.05, 0.13, Math.abs(u - 0.5)); m *= 1 + 0.035 * crown; // compacted lighter crown
    const warm = 0.5 + (big - 0.5) * 1.6; // value variation also shifts hue: darker -> redder umber
    return [m * (0.99 + 0.03 * warm), m * (0.985 + 0.01 * warm), m * (1.0 - 0.05 * warm + 0.03 * r)];
  });
  // wheel tracks: broken, wobbly darker lines along rut walls + faint tread streaks inside
  for (const [ru, rw] of ruts) for (const side of [-1, 0.0, 1]) {
    const n = side === 0 ? 2 : 1;
    for (let k = 0; k < n; k++) {
      g.strokeStyle = css(shade(base, side === 0 ? 0.78 : 0.6), side === 0 ? 0.35 : 0.6); g.lineWidth = side === 0 ? 1.2 : 1.8; g.lineCap = 'round';
      let v = 0; while (v < 1) { const len = 0.05 + R() * 0.2, gap = 0.01 + R() * 0.06; g.beginPath();
        for (let t = v; t <= Math.min(1, v + len) + 1e-6; t += 0.004) { const c = ru + 0.012 * Math.sin(t * Math.PI * 2 * 2 + ru * 9) + 0.006 * Math.sin(t * Math.PI * 2 * 7); const x = (c + side * rw * 1.05 + (side === 0 ? (k - 0.5) * rw * 0.7 : 0)) * w + (R() - 0.5) * 0.8; t === v ? g.moveTo(x, t * h) : g.lineTo(x, t * h); }
        g.stroke(); v += len + gap; }
    }
  }
  // speckle: dark grit + light sand grains
  // (no pixel speckle: the reference keeps flat ground calm; detail comes from structured marks)
  // soft illustrated sweep strokes: long, low-contrast, darker shade (wind/foot scuffs)
  for (let i = 0; i < 26; i++) { const x = R() * w, y = R() * h, L = 30 + R() * 70; g.strokeStyle = css(shade(base, 0.82), 0.22); g.lineWidth = 2 + R() * 2; g.lineCap = 'round';
    wrap(w, h, x, y, L, (X, Y) => { g.beginPath(); g.moveTo(X, Y); g.quadraticCurveTo(X + L * 0.5, Y + (R() - 0.5) * 10, X + L * (0.2 + R() * 0.2), Y + L * 0.9); g.stroke(); }); }
  // small dark divots / hoof marks
  for (let i = 0; i < 14; i++) { const x = R() * w, y = R() * h, r = 4 + R() * 5; wrap(w, h, x, y, r * 2, (X, Y) => { g.fillStyle = css(shade(base, 0.72), 0.45); g.beginPath(); g.ellipse(X, Y, r * 1.3, r, R() * 3, 0, 7); g.fill(); g.strokeStyle = css(tint(base, 1.2), 0.4); g.lineWidth = 1; g.beginPath(); g.arc(X, Y + 1, r, 0.2, 2.8); g.stroke(); }); }
  // cracks in the dry parts (avoid the ruts)
  for (let i = 0; i < (o.cracks ?? 10); i++) { let u = R(); if (rutAt(u, 0.5) > 0.3) u = (u + 0.12) % 1; const x = u * w, y = R() * h; crack(g, x, y, 40 + R() * 60, R() * 6.3, shade(base, 0.6), R, 1.5); }
  // pebbles, denser toward the edges
  const stone = mixc(base, [158, 146, 130], 0.55);
  for (let i = 0; i < (o.pebbles ?? 55); i++) { let u = R(); if (R() < 0.55) u = R() < 0.5 ? R() * 0.15 : 1 - R() * 0.15; const x = u * w, y = R() * h, r = 3.5 + Math.pow(R(), 2) * 8;
    const c = vary(stone, (R() - 0.5) * 0.3); wrap(w, h, x, y, r * 2, (X, Y) => pebble(g, X, Y, r, r * (0.6 + R() * 0.3), R() * 3, c, R)); }
  // grass creeping in at the edges
  if (o.edgeGrass !== false) { const gc = hex(o.grass || '#a8923e');
    for (let i = 0; i < 90; i++) { const u = R() < 0.5 ? R() * 0.05 : 1 - R() * 0.05, x = u * w, y = R() * h; tuft(g, x, y, 5 + R() * 7, R() < 0.7 ? shade(gc, 0.8) : tint(gc, 1.1), R, 0.9); } }
}

// a tuft: a fan of tapered blades
export function tuft(g, x, y, len, col, R, a = 1) {
  const n = 3 + Math.floor(R() * 4); g.fillStyle = css(col, a);
  for (let i = 0; i < n; i++) { const ang = -Math.PI / 2 + (i / (n - 1 || 1) - 0.5) * 1.5 + (R() - 0.5) * 0.3, L = len * (0.6 + R() * 0.5), bw = Math.max(1, len * 0.1);
    const tx = x + Math.cos(ang) * L, ty = y + Math.sin(ang) * L, cx = x + Math.cos(ang + 0.2) * L * 0.5, cy = y + Math.sin(ang + 0.2) * L * 0.5;
    g.beginPath(); g.moveTo(x - bw, y); g.quadraticCurveTo(cx - bw * 0.5, cy, tx, ty); g.quadraticCurveTo(cx + bw * 0.5, cy, x + bw, y); g.closePath(); g.fill(); }
}

// ---------- GRASS ----------
export function grass(g, w, h, o = {}) {
  const base = hex(o.base || '#c8b25a'), R = rng(o.seed || 23);
  g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  modulate(g, w, h, (u, v) => { const big = fbm(u, v, 3, 3, 3, 5), mid = fbm(u, v, 6, 6, 2, 8), f = 0.5;
    const clump = smooth(0.52, 0.72, big); const m = (0.94 + 0.14 * (mid - 0.5) + 0.05 * (f - 0.5)) * (1 - 0.16 * clump) * (1 + 0.06 * smooth(0.45, 0.25, big));
    return [m * (1 - 0.06 * clump), m * (1 + 0.01 * clump), m * (1 - 0.1 * clump + 0.02)]; });
  // darker clump patches under tufts
  for (let i = 0; i < 70; i++) { const x = R() * w, y = R() * h, r = 6 + R() * 16; wrap(w, h, x, y, r * 2, (X, Y) => { g.fillStyle = css(shade(base, 0.78), 0.28); g.beginPath(); g.ellipse(X, Y, r * 1.5, r * 0.8, 0, 0, 7); g.fill(); }); }
  // tufts: mostly darker shade of the base, some sunlit blades on top
  const N = o.tufts ?? 220;
  for (let i = 0; i < N; i++) { const x = R() * w, y = R() * h, L = 12 + R() * 16, c = R() < 0.72 ? shade(base, 0.66 + R() * 0.12) : (R() < 0.6 ? tint(base, 1.12 + R() * 0.1) : mixc(base, [138, 150, 70], 0.4));
    wrap(w, h, x, y, L + 2, (X, Y) => tuft(g, X, Y, L, c, R, 0.9)); }
  // sparse wildflower dots
  for (let i = 0; i < (o.flowers ?? 18); i++) { const x = R() * w, y = R() * h; g.fillStyle = css(R() < 0.6 ? [246, 238, 214] : [236, 196, 80], 0.9); g.beginPath(); g.arc(x, y, 1.4 + R() * 1.2, 0, 7); g.fill(); }
}

// ---------- WOOD PLANKS ----------
// planks run along u. opts: base, n (planks per tile), knots, nails, joints (butt joints per plank)
export function planks(g, w, h, o = {}) {
  const base = hex(o.base || '#a8744a'), R = rng(o.seed || 31), n = o.n || 8, ph = h / n;
  for (let i = 0; i < n; i++) {
    const y0 = i * ph, nj = o.joints ?? 1, js = []; let x = R() * w; for (let k = 0; k < nj; k++) { js.push(x); x = (x + w / nj * (0.7 + R() * 0.6)) % w; }
    js.sort((a, b) => a - b); const segs = js.length ? js.map((a, k) => [a, k + 1 < js.length ? js[k + 1] : js[0] + w]) : [[0, w]];
    for (const [a, b] of segs) {
      const col = vary(base, (R() - 0.5) * (o.varyAmt ?? 0.2)), hue = (R() - 0.5) * 0.06; const pc = [col[0] * (1 + hue), col[1], col[2] * (1 - hue)];
      const paint = (ox) => { g.save(); g.beginPath(); g.rect(a + ox, y0, b - a, ph); g.clip();
        g.fillStyle = css(pc); g.fillRect(a + ox, y0, b - a, ph);
        // grain: long wavy lines in darker shade of this plank's colour
        const ng = 5 + Math.floor(R() * 5), ksx = 1 + Math.floor(R() * 2);
        for (let q = 0; q < ng; q++) { const yy = y0 + ph * (0.08 + 0.84 * R()), amp = 0.6 + R() * ph * 0.06, ph0 = R() * 7;
          g.strokeStyle = css(shade(pc, 0.7 + R() * 0.12), 0.25 + R() * 0.35); g.lineWidth = 0.8 + R() * 1.0; g.beginPath();
          for (let xx = a + ox - 2; xx <= b + ox + 2; xx += 6) { const yv = yy + amp * Math.sin((xx / w) * Math.PI * 2 * ksx * 2 + ph0) + amp * 0.4 * Math.sin((xx / w) * Math.PI * 2 * 7 + ph0 * 2); xx === a + ox - 2 ? g.moveTo(xx, yv) : g.lineTo(xx, yv); }
          g.stroke(); }
        // short grain dashes / pores
        for (let q = 0; q < (b - a) / 60; q++) { const xx = a + ox + R() * (b - a), yy = y0 + R() * ph; g.strokeStyle = css(shade(pc, 0.7), 0.35); g.lineWidth = 1; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + 4 + R() * 12, yy + (R() - 0.5)); g.stroke(); }
        // knots with grain rings
        if (o.knots !== false && R() < 0.45) { const kx = a + ox + (b - a) * (0.2 + 0.6 * R()), ky = y0 + ph * (0.3 + 0.4 * R()), kr = ph * (0.1 + 0.08 * R());
          for (let r = 3; r >= 1; r--) { g.strokeStyle = css(shade(pc, 0.72), 0.35); g.lineWidth = 1; g.beginPath(); g.ellipse(kx, ky, kr * (1 + r * 0.9) * 1.8, kr * (1 + r * 0.6), 0, 0, 7); g.stroke(); }
          g.fillStyle = css(shade(pc, 0.55)); g.beginPath(); g.ellipse(kx, ky, kr * 1.5, kr, 0, 0, 7); g.fill(); g.fillStyle = css(shade(pc, 0.4)); g.beginPath(); g.ellipse(kx, ky, kr * 0.7, kr * 0.45, 0, 0, 7); g.fill(); }
        // worn lighter top edge, darker bottom edge (bevel read)
        g.fillStyle = css(tint(pc, 1.16), 0.55); g.fillRect(a + ox, y0 + 2, b - a, Math.max(1.5, ph * 0.05));
        const gr = g.createLinearGradient(0, y0 + ph * 0.75, 0, y0 + ph); gr.addColorStop(0, css(shade(pc, 0.85), 0)); gr.addColorStop(1, css(shade(pc, 0.8), 0.5)); g.fillStyle = gr; g.fillRect(a + ox, y0 + ph * 0.75, b - a, ph * 0.25);
        // worn ends
        for (const ex of [a + ox, b + ox]) { const eg = g.createLinearGradient(ex, 0, ex + (ex === a + ox ? 14 : -14), 0); eg.addColorStop(0, css(shade(pc, 0.78), 0.4)); eg.addColorStop(1, css(pc, 0)); g.fillStyle = eg; g.fillRect(Math.min(ex, ex + (ex === a + ox ? 14 : -14)), y0, 14, ph); }
        g.restore(); };
      paint(0); if (b > w) paint(-w);
      // butt joint seam + nail heads
      const jx = a % w, seam = shade(base, 0.42);
      g.fillStyle = css(seam, 0.9); g.fillRect(jx - 1, y0, 2.2, ph);
      if (o.nails !== false) for (const dx of [-6, 6]) for (const fy of [0.28, 0.72]) nail(g, jx + dx, y0 + ph * fy, Math.max(1.6, ph * 0.045), pc);
    }
    // seam between planks (gap)
    g.fillStyle = css(shade(base, 0.42), 0.95); g.fillRect(0, y0, w, Math.max(2, ph * 0.055));
    g.fillStyle = css(shade(base, 0.7), 0.5); g.fillRect(0, y0 + Math.max(2, ph * 0.055), w, 1.5);
    // nails over the joists
    if (o.nails !== false && o.joists !== false) for (const jx of [w * 0.25, w * 0.75]) for (const fy of [0.3, 0.7]) if (R() < 0.85) nail(g, jx + (R() - 0.5) * 3, y0 + ph * fy, Math.max(1.4, ph * 0.04), base);
  }
  // scuffs and light scratches + weathering blotches
  for (let i = 0; i < (o.scratches ?? 14); i++) { const x = R() * w, y = R() * h; g.strokeStyle = css(tint(base, 1.2), 0.35); g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 10 + R() * 25, y + (R() - 0.5) * 6); g.stroke(); }
  modulate(g, w, h, (u, v) => 0.95 + 0.1 * fbm(u, v, 4, 4, 2, o.seed || 31));
}
const nail = (g, x, y, r, col) => { g.fillStyle = css(shade(col, 0.35)); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = css(tint(col, 1.3), 0.6); g.beginPath(); g.arc(x - r * 0.3, y - r * 0.3, r * 0.4, 0, 7); g.fill(); };

// ---------- PAINTED CLAPBOARD SIDING ----------
export function siding(g, w, h, o = {}) {
  const base = hex(o.base || '#c84a3a'), R = rng(o.seed || 41), n = o.n || 12, bh = h / n, wood = hex(o.wood || '#b89a72');
  for (let i = 0; i < n; i++) { const y0 = i * bh, col = vary(base, (R() - 0.5) * 0.06);
    const gr = g.createLinearGradient(0, y0, 0, y0 + bh); gr.addColorStop(0, css(tint(col, 1.07))); gr.addColorStop(0.7, css(col)); gr.addColorStop(1, css(shade(col, 0.86))); g.fillStyle = gr; g.fillRect(0, y0, w, bh);
    // faint grain under the paint
    for (let q = 0; q < 3; q++) { const yy = y0 + bh * (0.2 + 0.6 * R()); g.strokeStyle = css(shade(col, 0.85), 0.18); g.lineWidth = 1; g.beginPath(); g.moveTo(0, yy); for (let x = 0; x <= w; x += 16) g.lineTo(x, yy + Math.sin(x / w * Math.PI * 4 + q) * 1.2); g.stroke(); }
    // lap shadow under each board + highlight on the lip
    g.fillStyle = css(shade(base, 0.45), 0.95); g.fillRect(0, y0 + bh - Math.max(2, bh * 0.1), w, Math.max(2, bh * 0.1));
    g.fillStyle = css(tint(col, 1.2), 0.6); g.fillRect(0, y0, w, 1.5);
    // occasional end joint
    if (R() < 0.5) { const x = R() * w; g.fillStyle = css(shade(base, 0.5), 0.85); g.fillRect(x, y0, 2, bh); }
  }
  // peeling paint showing bare wood, plus vertical weather streaks
  const pe = o.peel ?? 0.35;
  for (let i = 0; i < 26 * pe; i++) { const x = R() * w, y = R() * h, rw = 4 + R() * 18, rh = 1.5 + R() * 4;
    wrap(w, h, x, y, rw, (X, Y) => { g.fillStyle = css(wood, 0.85); g.beginPath(); g.ellipse(X, Y, rw, rh, 0, 0, 7); g.fill(); g.strokeStyle = css(shade(base, 0.55), 0.7); g.lineWidth = 1; g.stroke(); }); }
  modulate(g, w, h, (u, v) => { const s = fbm(u, v, 12, 2, 2, 5), b = fbm(u, v, 3, 3, 2, 9); return (0.93 + 0.08 * s) * (0.95 + 0.1 * b); });
}

// ---------- ROOF SHINGLES ----------
// rows of staggered shingles; courses step down +v. opts.rot rotates 90 degrees.
export function shingles(g, w, h, o = {}) {
  const base = hex(o.base || '#5a3e34'), R = rng(o.seed || 51), n = o.n || 10, rh = h / n;
  if (o.rot) { g.translate(w / 2, h / 2); g.rotate(Math.PI / 2); g.translate(-w / 2, -h / 2); }
  g.fillStyle = css(shade(base, 0.45)); g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { const y0 = i * rh; let x = (i % 2) * 18 + R() * 10 - 30;
    while (x < w + 40) { const sw = 26 + R() * 30, col = vary(base, (R() - 0.5) * 0.28);
      const draw = (X) => { const gr = g.createLinearGradient(0, y0, 0, y0 + rh); gr.addColorStop(0, css(shade(col, 0.72))); gr.addColorStop(0.35, css(col)); gr.addColorStop(1, css(tint(col, 1.06)));
        g.fillStyle = gr; const bot = y0 + rh + rh * 0.18 * (R() - 0.3); g.beginPath(); g.moveTo(X + 1.5, y0); g.lineTo(X + sw - 1.5, y0); g.lineTo(X + sw - 1.5, bot - 2); g.quadraticCurveTo(X + sw - 1.5, bot, X + sw - 4, bot); g.lineTo(X + 4, bot); g.quadraticCurveTo(X + 1.5, bot, X + 1.5, bot - 2); g.closePath(); g.fill();
        g.strokeStyle = css(shade(col, 0.5), 0.9); g.lineWidth = 1.6; g.beginPath(); g.moveTo(X + 1.5, bot - 1); g.lineTo(X + sw - 1.5, bot - 1); g.stroke();
        g.strokeStyle = css(shade(col, 0.75), 0.35); g.lineWidth = 1; for (let q = 0; q < 2; q++) { const gx = X + sw * (0.25 + 0.5 * R()); g.beginPath(); g.moveTo(gx, y0 + rh * 0.4); g.lineTo(gx + (R() - 0.5) * 2, bot - 3); g.stroke(); }
        if (R() < 0.08) { g.fillStyle = css(shade(col, 0.5)); g.beginPath(); g.moveTo(X + sw - 1.5, bot - 8); g.lineTo(X + sw - 1.5, bot); g.lineTo(X + sw - 10, bot); g.fill(); } };
      draw(x); if (x < 0) draw(x + w); if (x + sw > w) draw(x - w); x += sw; }
    // shadow cast by the course above
    const sg = g.createLinearGradient(0, y0, 0, y0 + rh * 0.3); sg.addColorStop(0, css(shade(base, 0.4), 0.55)); sg.addColorStop(1, css(shade(base, 0.4), 0)); g.fillStyle = sg; g.fillRect(0, y0, w, rh * 0.3);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  modulate(g, w, h, (u, v) => 0.92 + 0.16 * fbm(u, v, 4, 4, 2, 13));
}

// ---------- BRICK ----------
export function brick(g, w, h, o = {}) {
  const base = hex(o.base || '#a24a36'), R = rng(o.seed || 61), rows = o.rows || 16, cols = o.cols || 4, bh = h / rows, bw = w / cols, mortar = hex(o.mortar || mixc(base, [214, 200, 182], 0.7));
  g.fillStyle = css(mortar); g.fillRect(0, 0, w, h);
  for (let r = 0; r < rows; r++) for (let c = -1; c <= cols; c++) { const x = c * bw + (r % 2) * bw / 2, y = r * bh, col = vary(base, (R() - 0.5) * 0.3), m = Math.max(2, bh * 0.14);
    g.fillStyle = css(col); g.fillRect(x + m / 2, y + m / 2, bw - m, bh - m);
    g.fillStyle = css(tint(col, 1.15), 0.5); g.fillRect(x + m / 2, y + m / 2, bw - m, 1.5);
    g.fillStyle = css(shade(col, 0.7), 0.6); g.fillRect(x + m / 2, y + bh - m / 2 - 2, bw - m, 2);
    if (R() < 0.15) { g.fillStyle = css(shade(col, 0.6), 0.5); g.beginPath(); g.arc(x + bw * R(), y + bh * 0.5, 2 + R() * 3, 0, 7); g.fill(); } }
  modulate(g, w, h, (u, v) => 0.92 + 0.14 * fbm(u, v, 4, 4, 3, 17));
}

// ---------- FIELD STONE / COBBLE ----------
export function stone(g, w, h, o = {}) {
  const base = hex(o.base || '#9a8a78'), R = rng(o.seed || 71), N = o.n || 6, cw = w / N;
  g.fillStyle = css(shade(base, 0.5)); g.fillRect(0, 0, w, h);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const x = (i + 0.5 + (R() - 0.5) * 0.3) * cw, y = (j + 0.5 + (R() - 0.5) * 0.3) * cw, rx = cw * (0.52 + R() * 0.08), ry = cw * (0.46 + R() * 0.08), c = vary(base, (R() - 0.5) * 0.3), rot = R() * 3;
    wrap(w, h, x, y, cw, (X, Y) => pebble(g, X, Y, rx, ry, rot, c, R)); }
  modulate(g, w, h, (u, v) => 0.92 + 0.14 * fbm(u, v, 3, 3, 3, 19));
}

// ---------- METAL (soft highlights along u, e.g. around a cylinder) ----------
export function metal(g, w, h, o = {}) {
  const base = hex(o.base || '#8a8f96'), R = rng(o.seed || 81);
  g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  modulate(g, w, h, (u, v) => { const band = Math.exp(-Math.pow((u - 0.3) / 0.06, 2)) * 0.45 + Math.exp(-Math.pow((u - 0.4) / 0.015, 2)) * 0.35 + Math.exp(-Math.pow((u - 0.82) / 0.1, 2)) * -0.22;
    const brush = 0.03 * (vnoise(u, v, 4, 256, 3) - 0.5); const m = 1 + band + brush; return [m, m * 1.0, m * 1.03]; });
  if (o.rivets) for (const v of [0.08, 0.92]) for (let i = 0; i < 12; i++) nail(g, (i + 0.5) / 12 * w, v * h, 2.5, base);
  for (let i = 0; i < 6; i++) { g.strokeStyle = css(shade(base, 0.6), 0.25); g.lineWidth = 1; const x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 20 * R(), y + 3); g.stroke(); }
}

// ---------- FABRIC (canvas weave, soft folds, optional stripes / hem) ----------
export function fabric(g, w, h, o = {}) {
  const base = hex(o.base || '#f2f0ea'), R = rng(o.seed || 91);
  g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  if (o.stripes) { const s2 = hex(o.stripes), n = o.nStripes || 8; for (let i = 0; i < n; i += 2) { g.fillStyle = css(s2); g.fillRect(i * w / n, 0, w / n, h); } }
  // weave: fine crossing threads in a darker shade
  g.globalAlpha = 0.05; for (let x = 0; x < w; x += 3) { g.fillStyle = css(shade(base, 0.6)); g.fillRect(x, 0, 1, h); } for (let y = 0; y < h; y += 3) { g.fillStyle = css(shade(base, 0.7)); g.fillRect(0, y, w, 1); } g.globalAlpha = 1;
  for (let i = 0; i < w * h / 400; i++) { g.fillStyle = css(R() < 0.5 ? shade(base, 0.75) : tint(base, 1.15), 0.25); g.fillRect(R() * w, R() * h, 2, 1); }
  if (o.hem) { g.strokeStyle = css(shade(base, 0.55), 0.8); g.lineWidth = 2; g.setLineDash([7, 5]); for (const y of [h * 0.06, h * 0.94]) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.setLineDash([]); }
  const nf = o.folds ?? 2;
  modulate(g, w, h, (u, v) => { const f = Math.sin(u * Math.PI * 2 * nf + Math.sin(v * Math.PI * 2) * 0.6); return 0.95 + 0.06 * f + 0.05 * (fbm(u, v, 4, 4, 2, 23) - 0.5); });
}

// ---------- BARREL (vertical staves + iron hoops; cylinder uv) ----------
export function barrel(g, w, h, o = {}) {
  const base = hex(o.base || '#8a5a34'), R = rng(o.seed || 101), n = o.staves || 14, sw = w / n, iron = hex(o.iron || '#3e3640');
  for (let i = 0; i < n; i++) { const col = vary(base, (R() - 0.5) * 0.22); g.fillStyle = css(col); g.fillRect(i * sw, 0, sw, h);
    for (let q = 0; q < 4; q++) { const x = i * sw + sw * (0.15 + 0.7 * R()); g.strokeStyle = css(shade(col, 0.7), 0.4); g.lineWidth = 1; g.beginPath(); g.moveTo(x, 0); for (let y = 0; y <= h; y += 12) g.lineTo(x + Math.sin(y / h * 6 + q) * 1.5, y); g.stroke(); }
    g.fillStyle = css(shade(base, 0.42)); g.fillRect(i * sw, 0, 2, h); g.fillStyle = css(tint(col, 1.15), 0.5); g.fillRect(i * sw + 2, 0, 1.5, h); }
  modulate(g, w, h, (u, v) => 0.86 + 0.2 * Math.sin(v * Math.PI));
  for (const v of o.hoops || [0.12, 0.34, 0.66, 0.88]) { const y = v * h, hh = h * 0.045; g.fillStyle = css(iron); g.fillRect(0, y - hh / 2, w, hh); g.fillStyle = css(tint(iron, 1.35), 0.6); g.fillRect(0, y - hh / 2, w, 1.5); g.fillStyle = css(shade(iron, 0.5)); g.fillRect(0, y + hh / 2 - 1.5, w, 1.5);
    for (let i = 0; i < 8; i++) nail(g, (i + 0.5) / 8 * w, y, 1.8, iron); }
}

// ---------- HAY / STRAW ----------
export function hay(g, w, h, o = {}) {
  const base = hex(o.base || '#d8b860'), R = rng(o.seed || 111);
  g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  modulate(g, w, h, (u, v) => 0.9 + 0.2 * fbm(u, v, 4, 4, 3, 29));
  g.lineCap = 'round';
  for (let i = 0; i < w * h / 45; i++) { const x = R() * w, y = R() * h, a = (R() - 0.5) * 0.9 + (R() < 0.2 ? 1.57 : 0), L = 6 + R() * 18;
    g.strokeStyle = css(R() < 0.6 ? shade(base, 0.62 + R() * 0.2) : tint(base, 1.2), 0.55); g.lineWidth = 0.8 + R();
    wrap(w, h, x, y, L, (X, Y) => { g.beginPath(); g.moveTo(X, Y); g.lineTo(X + Math.cos(a) * L, Y + Math.sin(a) * L); g.stroke(); }); }
  for (const u of o.twine || []) { g.fillStyle = css(shade(base, 0.4), 0.9); g.fillRect(u * w - 2, 0, 4, h); }
}

// ---------- BARK ----------
export function bark(g, w, h, o = {}) {
  const base = hex(o.base || '#6b4a32'), R = rng(o.seed || 121);
  g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  modulate(g, w, h, (u, v) => 0.9 + 0.2 * fbm(u, v, 8, 2, 3, 31));
  for (let i = 0; i < 26; i++) { const x0 = R() * w, len = h * (0.2 + R() * 0.5), y0 = R() * h;
    g.strokeStyle = css(shade(base, 0.5), 0.8); g.lineWidth = 1.2 + R() * 1.8; g.beginPath(); for (let t = 0; t <= len; t += 8) { const x = x0 + Math.sin((y0 + t) / h * Math.PI * 4 + i) * 3, y = (y0 + t); t ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    g.strokeStyle = css(tint(base, 1.2), 0.35); g.lineWidth = 1; g.beginPath(); for (let t = 0; t <= len; t += 8) { const x = x0 + 3 + Math.sin((y0 + t) / h * Math.PI * 4 + i) * 3, y = (y0 + t); t ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
}

// ---------- PAPER (fibres, aged edges) ----------
export function paper(g, w, h, o = {}) {
  const base = hex(o.base || '#f3ecdc'), R = rng(o.seed || 131);
  g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  modulate(g, w, h, (u, v) => { const e = Math.min(u, 1 - u, v, 1 - v), age = 1 - 0.12 * (1 - smooth(0, 0.12, e)) - 0.05 * fbm(u, v, 3, 3, 3, 37); const f = 1; return [age * f, age * f * 0.985, age * f * 0.95]; });
  for (let i = 0; i < 0; i++) { g.strokeStyle = css(shade(base, 0.8), 0.18); g.lineWidth = 0.8; const x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 10, y + (R() - 0.5) * 10); g.stroke(); }
}
// rough rubber-stamp ink: knock random holes in what was just drawn inside (x,y,w,h)
export function inkWear(g, x, y, w, h, seed = 5, k = 1) {
  const R = rng(seed); g.save(); g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 900 * k; i++) { g.fillStyle = `rgba(0,0,0,${0.3 + R() * 0.6})`; g.beginPath(); g.arc(x + R() * w, y + R() * h, 0.6 + R() * 2.4, 0, 7); g.fill(); }
  g.restore();
}
