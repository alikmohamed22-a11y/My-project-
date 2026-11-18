# world: world geometry and set dressing

## What changed and why
The reference worlds (r3, r7, r10, r12, r13, r15) are full of believable clutter at every depth: false-front storefronts with trim, painted signs, porches, telegraph wires, railings, trusses and props. Ours was built from icosahedron trees, cone tufts and flat boxes. All new set dressing is in a new module, **`web/world.js`**. It is procedural, an original 1904 Missouri town and farm, and does not recreate any reference scene.

- **Kit system (to keep the CPU cost down):**
  - `rboxGeo` is a rounded or chamfered box with per-face texel-scaled UVs, and it is cached.
  - `Kit` collects parts under a transform stack and merges them per material, with vertex colours, chunked along z/x so frustum culling still works.
  - `instance()` places merged prefabs as InstancedMeshes, with a per-instance tint on leaves and straw.
  - A few shared vertex-coloured toon materials replace hundreds of separate ones.
- **New painters, local to world.js, greyscale so they can be tinted:** clapboard siding, board-and-batten, weathered wood, shingles, brick, fieldstone, glass, leaves, straw, awning stripes, wallpaper, rug and book spines.
  - `signMat()` paints period signboards: a plank background, a double border and squeezed bold serif lettering with a drop shadow.
- **Road set (`dressRoad`):**
  - **Farm stretch:**
    - Fences: a worn post-and-rail fence with lean, sag and missing rails, plus a zig-zag split-rail worm fence.
    - Buildings: a two-storey farmhouse with porch, balusters, shutters, rocker and picket yard; a red gambrel barn with X-braced doors, hayloft and cupola; a lattice windmill; a white church/schoolhouse with bell tower.
    - Clutter: haystacks, square bales, wagons, a trough with hand pump, milk cans, mailboxes, barrels and crates.
  - **Main street (z −48…−215):** 16+ false-front storefronts with these parts:
    - cornices with brackets, display windows and transoms, panelled doors and kickplates
    - porches on posts or striped awnings
    - signs: GENERAL STORE, FEED & SEED, HOTEL (with balcony), BARBER, DRY GOODS, FARMERS BANK, POST OFFICE, HARDWARE, DRUGS, MEALS, HARNESS & SADDLES, BAKERY, LAND OFFICE, TELEGRAPH, OPERA HOUSE
    - painted side-wall ads (OZARK FLOUR, DR. HALE'S TONIC, LIVERY & FEED), chimneys
  - The street also has boardwalks, kerosene lamp posts, hitching rails, benches, barrels, crates, bunting across the street, a mileage signpost and a church at the end of town.
  - A telegraph line with crossarms, glass insulators and sagging catenary wires runs along the road.
  - Trees are built from 30 lumpy leaf clumps on a bent trunk with branches, shaded darker underneath (3 variants). Bushes, blade-cluster grass tufts, wildflowers and distant hills fill out the scene.
- **Stadium (`dressStadium`, `dressGate`):**
  - Plank tiers with seat boards and a white baluster railing.
  - A sloped roof on posts with W trusses, a scalloped red/white valance, bunting, flag poles and an OLYMPIC STADIUM board.
  - Back and end walls, stairs, and a perimeter board fence with ad boards.
  - Classical gate columns with plinths, fluting, capitals, gold finials and flags.
- **Office (`dressOffice`):** wainscot and wallpaper walls, a mullioned window with curtains, bookshelves with books, framed pictures, a wall clock, a filing cabinet, a coat rack and bowler, a patterned rug, a moulded desk (drawer pulls, leather blotter, inkwell, pen, candlestick telephone, lamp, books, papers, letter tray, spectacles, bell, nameplate), chairs and a plant.
- **Car (`dressCar`):** chassis rails, brass trim and dash rail, lamp bezels, side oil lamps, a rear deck and toolbox, step plates, a hand brake and a chain guard.
- **buildMass town (`dressStadiumTown`):** detailed instanced-kit houses with porches, shutters and picket fences, clumped trees, and a steepled church. These replace the cone-roof boxes.

## Regions touched in main.js
- An import line and `initWorld({THREE, toon, rnd})`.
- The road block is replaced with ground, stones and the existing sunflowers, then `dressRoad(g)`.
- `dressCar(body)` is called before `scene.add(c)`.
- Stadium: the old stands, roof, posts, cone flags and gate posts are replaced by `dressStadium(g); dressGate(g)`. FINISH, gate banner, boards, tape and setBoston are kept.
- Office: the furniture is replaced by `dressOffice(g)`. The doc mesh and light shaft are kept.
- In `buildMass`, the houses are replaced by `dressStadiumTown(G, avoid)`. The crowd is unchanged.

The `world.*` API is unchanged and no existing `P.*` painters were edited. That keeps it compatible with the texture, ink and light labs.

## Numbers
- **Render time:**
  - before: ~12 s per frame (machine idle)
  - after: 24–32 s per frame, measured while the other labs were rendering (load average about 17)
  - This has not been re-measured on an idle machine. The scene is heavier, so a fair idle comparison is still worth running.
- No console errors. All test frames rendered: 150, 190, 250, 420, 700, 1040, 1300 and 1830.

## Sheets
- Before: `/root/shorts/lab/world/before_sheet.jpg`
- After, in order:
  - `/root/shorts/lab/world/it1_sheet.jpg` (first pass)
  - `/root/shorts/lab/world/it2_sheet.jpg` (smoother, denser trees, softer leaf tint, side lamps moved off the dash)
  - `/root/shorts/lab/world/it3_sheet.jpg` (stadium perimeter ad boards)

## Notes
- Frame 1830 (the office) is a camera close-up of the doc, so only the desk edges and the blotter show. The new room detail only reads in wider office shots.
- The orchard shot (700) is still covered by the apple-tree FX cards.
- The camera, ink and grade agents own framing and line weight. The new geometry gives the ink pass many more edges to draw.
