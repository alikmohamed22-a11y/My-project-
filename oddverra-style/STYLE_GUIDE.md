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

## Craft rules (learned from studying top channels; our own wording, no copied content)
1. **Flow, not cuts.** Aim for 0 to 4 hard cuts per Short. Move between scenes with push-through-an-object moves, circle (iris) wipes, looking through a window or lens into the next scene, match moves, and quick dissolves.
2. **Something changes on every word or two.** That can be a new pose, a prop action, an expression, a camera move or an insert. Nothing holds still for more than about 1 second.
3. **Show every line literally.** Comparisons, numbers and jokes appear on screen exactly as they're said.
4. **Close-ups on hands and props.** Use extreme close-ups of the key object, with slow motion for the key moment. Put a big blurred foreground at the edge of the frame for depth.
5. **Scale reveals.** Do a crane or aerial pull-back to show how big the world is (crowds, towns, a fleet). Use a fully dressed world: signs, posters and clutter.
6. **Light follows the mood:**
   - Bright noon for the setup.
   - Golden sunset with long shadows for the escalation.
   - Warm lamp-lit interiors with dark red and purple shadows.
   - Deep blue night with window light beams for "You see…".
   - Warm sunrise for the payoff.
7. **Big emotions.** Use smug side-eyes, sweat drops, shocked round eyes and tears. Falls are comedy: the hat flies off, dust puffs up and dizzy eyes follow.
8. **Script.** A paradox hook. Use "you" or "imagine" to put the viewer in the scene where it fits. A doubter asks the question the viewer is thinking. Then 3–5 rising beats, "You see," with an everyday example, and a one-line ironic twist at the end.
9. **Cutaway diagrams.** Cut the world open to explain how something works: a ground cross-section, inside a machine, a side view of a mechanism. Then push the camera into it.
10. **One home location, many moods.** Come back to the same place at noon, sunset, night, in snow and at sunrise, so viewers feel time passing without being told.
11. **A sidekick reacts.** A pet, a kid or a bystander reacts to each beat (side-eye, shock, laugh). It doubles the emotion for free.
12. **Recurring motif.** One hero object (a bell, a jar, a button, a car) keeps coming back in every act and pays off in the last shot.
13. **Pace.** Narration runs 3.5–4 words per second, Shorts are 55–70 s long, and there are 0–5 hard cuts.
14. **Labels do the teaching.** Key terms appear as big readable words on objects in the world (crates, barrels, signs, bottles, road signs), never as floating text boxes.
15. **Objects come alive.** Give the key object a face and let it react (a nervous pill, a smug sack). It's an instant character with no extra setup.
16. **Turn abstract ideas into places.** If the topic is invisible (a body, a system, a law), build it as a location you can walk through: corridors, roads, doors, maps.
17. **Length.** 36–45 s works as well as 60 s when every second carries a beat. Cut anything that doesn't.
18. **Switch style for ideas.** For a theory, plan or "what if", change the look for a few seconds: a blueprint sketch, an old map, a retro screen, or a simple low-poly world. Then snap back.
19. **Numbers are props.** Big counters, scoreboards, tally boards and price tags with chunky digits that tick up live on screen.
20. **Wild camera for big moments.** Tilted (Dutch) angles, spinning or upside-down shots for falls, panic and chaos. Keep it calm and level for explanations.
21. **Visualise the thought.** A character's brain, memory or decision becomes a little character, room or machine you can see.

## Measured look targets (every frame of 22 reference Shorts at 30 fps)
| Measure | Reference average | Our old render | Rule |
|---|---|---|---|
| Mean brightness | 0.43 | 0.67 | Darker, moodier frames: keep mids down |
| Shadow colour | ~#26213a (deep indigo-brown) | #5e4454 (milky) | Crush shadows deep; tint them indigo |
| Highlight colour | ~#d5c7b7 (warm, never white) | #f5f2e8 | Cap highlights warm |
| Saturation | 0.47 | 0.37 | Richer colour |
| Seconds that are dark | 20 % | 0 % | Use real night and indoor scenes |
| Brightness range across a video | 0.44 | 0.24 | Big mood swings between acts |
| Frames with camera panning | 13 % | 50 % | Mostly locked or pushing-in camera; let the characters move |
| Hard cuts | ~2 per video | — | Keep 0–5 |
| Visual beats | ~0.5 per second | 0.47 | Something new about every 2 s, at minimum |

## Script shape (measured over 23 transcripts; structure only)
- 110–280 words (about 195), at 3.5–4 words per second.
- About 13 sentences. Most are 10–20 words, with 1–2 punchy fragments of four words or fewer.
- 15 of 23 use "You see". Either it comes right after the hook (in the first 10 %, explaining the setup), or it opens the reveal at 65–90 %.
- "So" (about 2) and "But" (about 2) drive the turns. About 1 question per script, usually a doubter's line or "How is that possible?".
- "You" appears about 5 times: put the viewer in the scene.
