# Oddverra Style Guide

The look of every Oddverra animated Short. Keep these rules the same in every video so viewers recognise the channel.

## Signature details (never change these)
1. **Bean eyes with an orbit shine:** solid dark oval eyes. The highlight is a tiny ringed planet, like the Oddverra logo.
2. **Indigo ink:** outlines are deep indigo `#2b1d4a`, never pure black. Lines are thicker on the shadow side.
3. **Blue-violet rim light:** a soft `rgba(150,170,255,0.75)` glow along the shadow edge of every shape.
4. **Two-tone cel shading:** hard-edged shadows that lean purple (shadow colour mixed 22 % toward `#3a2a7a`).
5. **Blush:** soft pink cheeks on every character. Little blush lines appear when they're happy.

## Characters
- **Heads:** big, about 1/3 of total height. Four shapes: `round`, `egg`, `wide`, `tall`. Vary them in every crowd.
- **Bodies:** `adult`, `thin`, `stout`, `kid`, `old`. Pear-shaped torso, tube limbs, mitten hands with a thumb, chunky shoes with laces.
- **Faces:** small soft mouths. Laughing closes the eyes (`^ ^`). No toothy grins and no big white staring eyes, because those read as creepy.
- **Hair:** `side`, `short`, `spiky`, `curly`, `bun`, `long`, `bald`. Hats: `top`, `bowler`, `cap`.
- **Details:** ties, bow ties, scarves, pockets, belts, cuffs, glasses, earrings.
- **Expressions:** smile, grin, laugh, happy, shock, nervous (sweat drop), pained, angry, worried, dazed (spiral eyes), whistle, smug.
- **Poses:** stand, relaxed (weight on one leg), hand on hip, wave, cheer, run, sit, fall, holding a stick or pen.

## World and camera
- 2D characters in a colourful 3D toon world with ink outlines.
- Bright, saturated light: warm sun with cool shadows, glowing lamps, and a night-blue grade for "You see…" explanations.
- Mostly smooth camera moves, slow push-ins during holds, and quick ease-out bursts. A white flash for time jumps.

## Captions
- Font: **Luckiest Guy** (included, Apache 2.0 licence), white, with a thick dark outline.
- Key words in yellow `#FFD838`.
- One word at a time, or up to 3 words, in the lower middle of the frame (above YouTube's buttons).

## Voice and script
- Narrator: ElevenLabs **"Jesse – Elearning, Casual Friendly Male"**, speed about 1.15.
- Formula: a paradox hook in line 1, then the setting, then 3–5 escalating beats, then "You see," with the real reason, then a short ironic payoff as the last line.
- Every fact is checked against reliable sources. Legends are labelled as legends.
- Our own stories and scripts only. Never remake another channel's topics, scripts or scenes.

## Files
- `oddverra.js` is the character drawing code (`oddverra(ctx, outfit, opts)` on a 600×1000 canvas, soles at y = 965).
- `captions.py` is the caption builder (word timings to an ASS subtitle file).
- `poses.png` and `face_options.png` are reference sheets. Face option 1 (bean eyes) is the official one.
