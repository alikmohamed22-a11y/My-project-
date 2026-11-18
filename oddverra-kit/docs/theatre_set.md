# theatre — 1865 / 1901 sets for "Booth saved Lincoln's son" [BOOTH-theatre]

New module: `web/theatre.js` (exports `buildTheatre(ctx)`, `paintLetter`, `paintEnvelope`, `paintPlaybill`, `PLAYBILLS`, `THEATRE_ORIGIN`).
main.js hooks: 4 lines marked `// [BOOTH-theatre]` (import; build + `world.theatre` + `?theatreview=N|a`; the view rides the shared PV slot via `mod: theatre` exactly like station.js; `theatre.show(world, null)` each frame). Lab rebased on the current booth (station merged) so `changes.diff` holds only theatre work.

## Sets (group origins; each set built in a local frame, floor y = 0, camera side +z)
| name | what | origin |
|---|---|---|
| `fordsExt` | Ford's Theatre, Tenth St., night 14 Apr 1865: brick 5-arch facade, FORD'S THEATRE sign band, lit lobby, OUR AMERICAN COUSIN playbills + A-frame, 7 gas lamps, brougham + horse (static), Star Saloon + row houses, dirt street | (-1600, 0, 400) |
| `box` | interior from the audience: gaslit stage, footlights, painted garden backdrop, wings, velvet drapes, 280 seats + audience silhouettes, dress circle, chandelier + sconces; presidential box (upper right, x = 6.2) with 35-star flags, bunting, oval portrait, staff flag, rocking chair + seated silhouette, dark back doorway + vestibule | (-1600, 0, 500) |
| `dressing` | Edwin Booth's dressing room: mirror + two gas sconces, cluttered makeup table, prop skull, flowers, Hamlet costume on a stand + cloak, open trunk, washstand, hat + cloak on hooks, playbills "EDWIN BOOTH as HAMLET", letter + envelope | (-1600, 0, 600) |
| `expo` | Pan-American Exposition 1901 at dusk: Electric Tower (~96 m, cascade niche, gilt figure), colonnade wings, 2 Spanish-Renaissance halls with towers + domed pavilions, Temple of Music (lettered), fountain basin, lamp standards, flags, ~600 crowd figures; **thousands of emissive bulbs** (count in `info.bulbs`) in one InstancedMesh (blooms, excluded from ink) | (-1600, 0, 800) |
| `study` | Robert Lincoln's study (1900s): bookshelf wall, desk with green leather + lamp + clutter, WHITE HOUSE envelope, leather desk chair + wing armchair, dusk window w/ curtains, fireplace, portrait, globe | (-1600, 0, 1000) |

## API (`world.theatre`)
- `show(world, name|null)`, `lightFor(name)`, `lookFor(name)`, `gradeFor(name)`, `placeLights(PRACT, name, tgt)` — same contract as paris.js; timeline uses `setAt(f) -> ['theatre', '<set>']`.
- `views`, `viewFor(i)` (alias `view`), `apply(world, v)`; test hook `?theatreview=N` (or `a` = view per frame).
- `setDim(t)` house lights down (chandelier/sconces/practicals/hemi dim; stage + footlights stay). `setFigure(t)` shadowy figure slides into the box's back doorway (0 hidden, 1 in doorway; silhouette only, no props). `setPresident(on)`.
- Doc meshes: `letter` (dressing table) + `setLetter(opts | fn(g,w,h))`; `envelope` (study desk) + `setEnvelope(opts | fn)`. Default painters `paintLetter(g,w,h,{head,date,lines,sign})`, `paintEnvelope(g,w,h,{to,addr,city,year})`.
- Objects: `president` (group), `figure`, `carriage`, `bulbs`, `groups`, `origin`, `info` (bulb/crowd counts).
- `spots` (world coords): fordsFacade, fordsDoor, fordsSidewalk, fordsStreet, playbill, playbillAframe, carriage, horseHead, starSaloon, stageCentre, stageFront, aisle, seatRow, orchestra, boxRail, boxPortrait, presidentChair, presidentHead, boxDoor, figureInDoor, boxFloor, galleryFront, mirror, makeupTable, dressingChair, standAtMirror, skull, letter, hamletCostume, trunk, standInDressing, plaza, electricTower, towerTop, templeOfMusic, templeDoor, basin, desk, envelope, deskChair, standBehindDesk, armchair, studyWindow, standInStudy.

## Test views (`?theatreview=N`)
0 Ford's wide · 1 low playbill/lobby · 2 theatre wide w/ box · 3 box close-up (silhouette) · 4 dressing room wide · 5 makeup table (skull + letter) · 6 expo wide (tower + bulbs) · 7 Temple of Music · 8 study wide · 9 envelope close-up · 10 box close-up, house dimmed + figure in doorway.
Stills: `/root/shorts/blab/theatre/stills/` (views 0,2,3,4,5,6,9,10), sheet `/root/shorts/blab/theatre/sheet.jpg`. Lookscore 0.65 (night/interior sets read darker and warmer than the mostly-day references).

## Caveats
- Presidential box sits on audience-right; the doorway is cheated to the box's back wall so it reads from the audience side.
- Letter text is a plausible prop (signed A. Badeau), not a verbatim quote; override with `setLetter`.
- box and dressing use `shadow: false` (paris attic pattern); the study keeps the sun shadow on, so the window throws a cool patch.
- No weapons are modelled anywhere; violence must be cut away in the timeline.
