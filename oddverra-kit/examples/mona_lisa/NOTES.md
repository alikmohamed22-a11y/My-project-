# Example 3: the 1911 Mona Lisa theft

- **Timeline:** `story_mona.js` has 21 shots over 1,740 frames (58 s). Each shot names a set module and a set through `setAt(f)` → `['louvre'|'paris', name]`. main.js then calls that module's `show`, `lightFor`, `lookFor`, `gradeFor` and `placeLights` automatically.
- **Sets:**
  - `louvre.js`: the Salon Carré gallery (the empty wall with 4 hooks via `setEmpty`), the service stairwell (`setStairBeat`) and the street front with the queue spots. `drawMona(g, w, h)` is the stylised painting, shared with the props and newspapers through `globalThis.__drawMona`.
  - `paris.js`: a 1911 street corner with a newsstand (`paintNewspaper`, headlines), Peruggia's attic with the trunk and false bottom (`setTrunk`, `setFalseBottom`), and the Florence shop with its ANTICHITÀ sign.
- **Cast:** PERUGGIA, GUARD, PAINTER, NEWSBOY, DEALER and POLICE. The `mona` and `framed` hand props are in `oddverra_next.js`.
- **Sound:** `audio_mona.py` is an accordion musette waltz built from synthesized reeds:
  - sneaky plucked strings for the theft
  - a hush on "Nobody notices"
  - a full waltz for the frenzy
  - a music box for the two years
  - mandolin plucks for Italy
  - a final cadence on "In France."
- **Quality:** rendered with `RS=1.5`, exported in 4K with `finish4k.sh`.
