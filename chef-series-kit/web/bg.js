// Backgrounds v2 — layered sets with parallax, cached static layers, lighting passes and ambient animation.
// drawBg(ctx,name,o): back layers (far/mid/near...) behind characters. drawFg(ctx,name,o): front layers + the set's colour grade.
// Set definitions live in bg_apt.js, bg_lum.js, bg_cards.js; the layer system in bgkit.js; camera/parallax in camera.js.
import { SETS, drawLayers, STATS } from './bgkit.js';
import { KITCHEN, drawAlarm, carStreaks } from './bg_apt.js';
import { OFFICE, LUMEXT, DINING, stopwatch } from './bg_lum.js';
import { MONTAGE, speedLinesBg } from './bg_cards.js';
export { eggSplat, shell, puff, scorch, noodleCup, person, defSet, SETS, STATS } from './bgkit.js';
export { KITCHEN, OFFICE, LUMEXT, DINING, MONTAGE, drawAlarm, stopwatch, carStreaks, speedLinesBg };
export function drawBg(ctx, name, o = {}) { if (!SETS[name]) throw new Error('unknown set ' + name); ctx.save(); drawLayers(ctx, name, o, false); ctx.restore(); }
export function drawFg(ctx, name, o = {}) { if (!SETS[name]) return; ctx.save(); drawLayers(ctx, name, o, true); ctx.restore(); }
export function setNames() { return Object.keys(SETS); }
