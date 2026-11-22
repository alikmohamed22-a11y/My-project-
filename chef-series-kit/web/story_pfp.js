// Profile-picture stills (square crop of the centre 1080x1080: y 420..1500). Frame = variant.
import { drawBg, drawFg } from './bg.js';
import * as FX from './fx.js';
import { drawChar, bounds } from './cast2d.js';
export const LEN = 4; export const CAPTIONS = false;
const V = [
  { bg: '#f2b632', bg2: '#f7c548', name: 'SAM_CHEF', expr: 'nervous', sweat: 1, pose: 'stand' },
  { bg: '#f2b632', bg2: '#f7c548', name: 'SAM', expr: 'grin', pose: 'stand' },
  { bg: '#2b2f73', bg2: '#353a85', name: 'SAM_CHEF', expr: 'proud', pose: 'proudChest' },
  { bg: '#e2483d', bg2: '#ec5a4e', name: 'SAM_CHEF', expr: 'shock', sweat: 1, pose: 'stand' },
];
function draw(ctx, lf, f) {
  const v = V[Math.round(f)] || V[0];
  drawBg(ctx, 'solid', { col: v.bg, col2: v.bg2, pattern: 'burst', t: 0, cy: 960, vig: false });
  FX.actionLines(ctx, 540, 960, 0, { col: 'rgba(255,255,255,0.28)', r0: 470, seed: 3 });
  // head ~ fills the circle: probe bounds at h=1000, then scale so head radius ≈ 300 centred at (540, 1000)
  const probe = bounds(v.name, { x: 0, y: 0, h: 1000, view: 'front', pose: v.pose });
  const k = 205 / probe.head.r, h = 1000 * k;
  const o = { x: 540 - probe.head.x * k, y: 1075 - probe.head.y * k, h, view: 'front', pose: v.pose, expr: v.expr, t: 30, blink: 0, look: [0.15, -0.1], sweat: v.sweat || 0, soot: 0.3, seed: 4, saccade: false, rim: 'warm' };
  drawChar(ctx, v.name, o);
  FX.sparkle(ctx, 250, 560, 1.4, 0.3); FX.sparkle(ctx, 860, 640, 1.0, 1.1);
}
export const SHOTS = [{ a: 0, b: LEN, cam: {}, draw }];
