# Camera / shot scale — REPORT (agent "camera")

## What changed and why
Reference (22 videos): the camera moves in ~13 % of frames. Shots are mostly locked or slow push-ins, characters are full-body and small (head 1/8–1/6 of frame height), and close-ups are saved for emphasis.
Ours tracked constantly (55 % of frames moving) and filled frames with heads at 0.25–0.68 of frame height, with two-shots clipped at the edges.

| metric (camstat.mjs, all 2008 f) | before | after |
|---|---|---|
| frames with pan/slide (view rot + translation/focus > 0.0025 rad/f) | **55 %** | **10 %** |
| typical head height / frame (wides) | 0.16–0.36 | 0.06–0.14 |
| beat close-ups (cramp, medal, "On purpose", stamp) | — | 0.17–0.52, intentional |
| subjects clipped by frame edge at sample frames | 9 of 21 | 0 (except deliberate CU crops) |

Per shot (new timeline):
- **0–187 car hook:** a tripod telephoto (fov 11→26) far ahead of the car, panning gently. The car grows out of the heat haze past the runners. Was: tracking alongside the car.
- **187–275 stadium:** a slow crane-down establishing wide, reduced from a 30 m sweep to about 4 m.
- **275–330:** thermometer insert, very slow push.
- **330–460 water:** a locked wide; the runners trudge in to the barrel.
- **460–496 "On purpose.":** close-up with a slow push.
- **496–556 dropping runners:** a locked high wide. The runners walk in and fall; the camera no longer slides with them.
- **556–650 dogs:** a locked, low dutch-angle shot. Runner and dogs charge at the lens.
- **650–802 orchard:** a locked wide. The nap stays fully in frame.
- **802–910 Fred:** runs into a locked wide past mile 9, then a 7-frame **punch-in (fov 36→17)** on the cramp.
- **910–1030:** locked shots of the roadside and the car pickup, with the car kept in frame.
- **1030–1075:** a locked shot down the road; the car drives past the runners toward the lens.
- **1075–1147:** locked. The car drives in and dies in frame, a car "drive-through".
- **1147–1221:** locked. Fred hops out and jogs toward the lens.
- **1221–1273 finish:** locked, low wide. Fred runs in through the tape.
- **1273–1326 crowd:** slow push.
- **1326–1378 medal:** a two-shot with both actors fully in frame, slow push (12 %).
- **1378–1438:** three-shot as the kid enters, then a push to Fred on "the car".
- **1438–1538 Hicks:** a locked wide; the trio walks in.
- **1538–1703 night:** a two-shot with a slow push. The props and the tick fx are in frame.
- **1703–1801 golden hour:** a locked low wide; the trio walks in.
- **1801–1854 office:** a medium-wide of the official at his desk, then a **snap-in to the stamp** on impact (old frames 1288–1296).
- **1854–1940 Boston:** a new, higher 3/4 wide (an override). The calendar stays in frame.
- **1940–2008:** the medal two-shot is reused.

Focus: `fp` is now each shot's subject head, so `focus` equals the subject distance. `cInf` is 5–6 for wides (soft background, sharp subject) and 7–9 for close-ups.
Zoom-through links at cuts are kept unchanged in story7 `camAt`. The kick shakes are kept too.

## Code touched
- `web/story.js`:
  - `camRaw` rewritten, plus `push` and `lock` helpers.
  - In `camAt`, removed the blanket fov creep (0.14 %/frame on every shot). Pushes are now explicit per shot.
  - `actorsAt`: roadside spectators now sit on a **world-anchored grid** (`SPECW` z-window per shot), so they don't pop or swap under locked cameras. Before, they were re-laid out around the moving car or Fred.
- `web/story7.js`:
  - `newCam` rewritten (water, purpose, dogs, orchard).
  - New `OVR` per-segment camera overrides (seg 12 car pass, seg 24 Boston).
  - New `tiltTo`: an optional `fy` composition key tilts the lens so the subject's head lands at a set screen height (lower third).
  - Removed the new-shot fov creep.
- New tool `camstat.mjs` (lab dir, not web): computes per-frame head size, frame bounds and the moving-frame % without rendering.
  Usage: `node camstat.mjs web "0,100,..."` or `node camstat.mjs web 0-2007 q`.

## Sheets
- Before: `/root/shorts/lab/camera/before_sheet.jpg` (21 frames, every 100, base code)
- Iteration 1: `/root/shorts/lab/camera/it1_sheet.jpg`
- Iteration 2: `/root/shorts/lab/camera/it2_sheet.jpg`
- After: `/root/shorts/lab/camera/after_sheet.jpg`
- Diff: `/root/shorts/lab/camera/changes.diff`

The iterations:
- **it1:** wide and locked everywhere.
- **it2:** added the `fy` lower-third tilt, re-aimed the orchard (the napper had been cut off) and the car pickup (the car had been clipped).
- **after:** widened the breakdown shot (fov 40) and re-centred the three-shot so the kid is in frame.

No console errors in any render. Frame 1800 is the existing white-flash time jump.

## Notes for other agents
- **Character agent:** the owner asked for readable silhouettes at small size. Wides now show heads at ~1/8–1/12 of frame height (≈ 160–240 px tall at 1080×1920), so the clothing and accessory detail needs to read at that scale. Thick ink at that size is fine, but fine detail will vanish.
- **World agent:** the lower ~35 % of road wides is plain dirt. Ruts, stones, puddles or foreground props there would pay off.
- The apple-tree canopies (fx billboards) dominate the orchard frame top.

## Camera grammar (reusable)
**Shot sizes** (character card ≈ 1.7 u tall, head ≈ 0.67 u; head fraction ≈ 0.67 / (2·d·tan(fov/2)))

| size | head / frame | d @ fov 36–40 | use |
|---|---|---|---|
| EXTREME WIDE / establishing | < 0.06 | 15–55 (or telephoto) | opening, new location, crane-downs, car approaching |
| WIDE (default) | 0.07–0.13 | 7–13 | action, entrances, gags carried by body movement; the world dominates |
| MEDIUM-WIDE | 0.14–0.19 | 5–7 | dialogue two-shots, props; every person fully in frame |
| CLOSE-UP | 0.25–0.35 | 3–4 (or a punch-in to fov ~17) | **emotional beats only**: cramp, "On purpose", reaction to "the car" |
| INSERT / ECU | object fills frame | 1.5–3 | stamp, thermometer, medal or document text |

Budget: about 70 % wide or medium-wide, at most 15 % close-up or insert, and at most one close-up per ~10 s.

**Movement**
- Default is **locked**. Let actors and vehicles move through the frame: walk toward the lens, cross on a diagonal, drive in and stop.
- **Slow push** is `push(p, l, k, sm(f0, f1, f))` with k ≤ 0.12 per shot. That keeps translation/focus at ≤ 0.001 per frame, roughly a 2–4 % size change per second. Use it on held shots longer than 2 s and on dialogue.
- **Punch-in / snap-in** is a fov or dolly change in 6–8 frames (`eo`), on the exact beat frame: cramp, stamp impact.
- **Pans** only follow a vehicle from a tripod. Keep pan speed under 0.003 rad/frame, and use a telephoto so the pan angle stays small.
- **Never** continuously track the subject: it was 55 % of our frames and reads as cheap. Keep moving frames at or below ~15 % of the runtime (measure with `camstat.mjs`).
- Keep the zoom-through fov link on ±6 frames at each cut. It is the only "fast" camera move.

**Composition**
- 9:16 is narrow: frame width ≈ 0.56 × height. Shoot *along* roads and tracks, and put two-shots at d ≥ 5.8.
- Use `fy: -0.08 … -0.14` (head at or below frame centre) so feet land near the bottom-third line, with the world and horizon above.
- Offset the subject to a vertical third, and put the second subject or the background payoff (gate, sign, car) on the other third.
- Use leading lines: road ruts, fences and track lanes converge to the subject.
- Add foreground depth: leave a near runner, fence post or sunflower at the frame edge, 1–3 u from the lens, and let DOF blur it.
- Camera height: 1.2–1.5 for heroic or ground-level wides. Go higher (2.0–2.6) for crowds and group falls.

**Focus**
- Set `fp` to the subject's head, so `focus` = subject distance.
- `cInf` is 5–6 for wides, 6–7 for medium-wides and 7–9 for close-ups. Use 2–3 for establishing shots and crowds, where the background is the subject.
- Spectators and props in the background rely on blur for separation, so never put the focus on the background.
