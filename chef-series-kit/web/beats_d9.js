// Ep9 beat table (no voiceover): [name, duration in frames @30fps, captions [[offset, text], ...]]. story_d9.js derives shot starts
// from it and work/mkwords.mjs writes words_d9.json (one fake "word" per caption word, 3 frames apart) so the engine's word-pop
// captions run off the same timing. Captions are lower-case on purpose (the chunker splits on capitals); they display upper-case.
export const BEATS = [
  ['hook', 45, [[0, 'day 9.']]],
  ['phone', 90, [[2, 'a viewer said:'], [30, 'serve alfredo soup'], [60, 'with baked bread.']]],
  ['oven', 80, [[2, 'so sam baked bread.'], [34, 'for the first'], [58, 'time ever.']]],
  ['counter', 76, [[2, 'it came out'], [28, 'harder than a brick.']]],
  ['walk', 72, [[2, "then the city's"], [26, 'toughest critic'], [50, 'walks in.']]],
  ['name', 36, [[2, 'the iron palate.']]],
  ['panic', 56, [[2, 'sam panics'], [28, 'and drops the bread']]],
  ['splash', 56, [[0, 'in the soup.'], [24, 'splash!']]],
  ['stare', 58, [[2, 'the critic stares.'], [32, 'dips his spoon.']]],
  ['soak', 32, [[0, 'soaks the bread.']]],
  ['bite', 46, [[0, 'takes one bite.']]],
  ['silence', 36, [[2, 'silence.']]],
  ['write', 64, [[2, 'then he writes'], [30, 'one word.']]],
  ['cantread', 38, [[0, "sam can't read it."]]],
  ['bro', 36, [[4, 'bro…']]],
  ['days', 40, [[2, '21 days left.']]],
  ['end', 50, [[2, 'what did he write?']]],
];
export const S = {}; export const E = {};
let _a = 0; for (const [n, d] of BEATS) { S[n] = _a; E[n] = _a + d; _a += d; }
export const TOTAL = _a;
