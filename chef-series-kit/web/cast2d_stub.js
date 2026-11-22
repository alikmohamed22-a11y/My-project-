// STUB cast — replaced by the real cast2d.js. Same API; rough placeholder drawing only.
export const CAST = ['SAM', 'SAM_SOOT', 'SAM_CHEF', 'HEADCHEF', 'ROOMMATE', 'MOM'];
const COL = { SAM: '#f08a3c', SAM_SOOT: '#6b5a50', SAM_CHEF: '#f4f1ea', HEADCHEF: '#ffffff', ROOMMATE: '#4fa3d9', MOM: '#d96aa0' };
const INK = '#1c1530';
export function bounds(name, o) {
  const { x, y, h } = o; const hr = h * 0.17;
  return { x: x - h * 0.22, y: y - h, w: h * 0.44, h, head: { x: x, y: y - h + hr * 1.05, r: hr }, hand: { x: x + h * 0.2, y: y - h * 0.5 } };
}
export function drawChar(ctx, name, o) {
  const { x, y, h, expr = 'neutral', say, t = 0, pose } = o; const b = bounds(name, o), hd = b.head;
  ctx.save(); ctx.lineWidth = Math.max(4, h * 0.008); ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  const bw = h * 0.36, by = y - h * 0.62; const sit = pose === 'sit';
  ctx.fillStyle = COL[name] || '#ccc'; ctx.beginPath(); ctx.roundRect(x - bw / 2, by, bw, h * (sit ? 0.45 : 0.62), bw * 0.3); ctx.fill(); ctx.stroke();
  ctx.fillStyle = name === 'SAM_SOOT' ? '#a07a60' : '#f2c09a'; ctx.beginPath(); ctx.arc(hd.x, hd.y, hd.r, 0, 7); ctx.fill(); ctx.stroke();
  if (name === 'HEADCHEF' || name === 'SAM_CHEF' || name === 'SAM_SOOT') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(hd.x - hd.r * 0.7, hd.y - hd.r * (name === 'HEADCHEF' ? 2.6 : 2), hd.r * 1.4, hd.r * (name === 'HEADCHEF' ? 1.8 : 1.2), hd.r * 0.4); ctx.fill(); ctx.stroke(); }
  const [lx, ly] = o.look || [0, 0];
  for (const s of [-1, 1]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(hd.x + s * hd.r * 0.38, hd.y - hd.r * 0.05, hd.r * 0.25, hd.r * (o.blink > 0.5 ? 0.04 : 0.3), 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(hd.x + s * hd.r * 0.38 + lx * hd.r * 0.1, hd.y + ly * hd.r * 0.1, hd.r * 0.09, 0, 7); ctx.fill(); }
  const talking = say && t >= say.t0 && t <= say.t1; const mo = talking ? Math.abs(Math.sin(t * 22)) * hd.r * 0.2 : hd.r * 0.04;
  ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(hd.x, hd.y + hd.r * 0.5, hd.r * 0.25, mo + 2, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = `700 ${Math.round(h * 0.045)}px Inter`; ctx.textAlign = 'center'; ctx.fillText(`${name} ${pose || ''} ${expr}`, x, by + h * 0.2);
  ctx.restore();
}
