// Ep1 hook cut: cold open on the ceiling-egg beat, then the story. Plays v3 (slowed) segments in a new order.
import * as V from './story_v3.js';
export const SHOTS = V.SHOTS, STORYLEN = V.STORYLEN, TMAP = V.TMAP;
export const SEGMAP = [[0, 164, 1458], [164, 356, 0], [356, 740, 270], [740, 957, 722], [957, 1080, 1002], [1080, 1302, 1622]];
export const LEN = 1302;
export const CAPCONF = { ...V.CAPCONF, file: 'words_hook.json', quotes: [[807, 861], [883, 901], [9, 91], [1080, 1125]] };
