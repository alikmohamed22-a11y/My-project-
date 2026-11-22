# add [GC] hooks next to the [RV] hooks of a main.js (idempotent)
import sys, re
p = sys.argv[1]; s = open(p).read()
if '[GC-sets]' in s: print('already hooked', p); sys.exit(0)
def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt: raise SystemExit(f'anchor x{n}: {old[:80]}')
    s = s.replace(old, new)
rep("import { buildRV } from './rv_sets.js'; // [RV-sets] (story: examples/revere/story_revere.js)\n",
    "import { buildRV } from './rv_sets.js'; // [RV-sets] (story: examples/revere/story_revere.js)\nimport { GC_ODD, gcOpts, drawPagey, gcTestActs } from './gc_cast.js'; // [GC-cast]\nimport { buildGC } from './gc_sets.js'; // [GC-sets] (story: examples/calendar/story_calendar.js)\n")
rep("world.rv = rv; ", "world.rv = rv; const gc = buildGC({ THREE, toon, mkTex, PT, NOND, scene, macro, camera }); world.gc = gc; const GCV = (location.search.match(/gcview=(\\d+|a)/) || [])[1]; /* [GC-sets] bed/cosmos/hall (-154000,0,0/800/1600) map/london/petro (-156500,0,0/800/1600); ?gcview=N */ ")
rep("Object.assign(ODD, RV_ODD);", "Object.assign(ODD, GC_ODD); const GCT = (location.search.match(/gccast=(\\d+)/) || [])[1]; /* [GC-cast] */ Object.assign(ODD, RV_ODD);")
rep("...rvOpts(a.opts) /* [RV-cast] */", "...rvOpts(a.opts) /* [RV-cast] */, ...gcOpts(a.opts) /* [GC-cast] */")
s, n1 = re.subn(r"const acts = ([A-Z]+T) != null \?", lambda m: "const acts = GCT != null ? gcTestActs(+GCT, cam, +((location.search.match(/gcgy=(-?[0-9.]+)/) || [])[1] || 0), f) /* [GC-cast] */ : " + m.group(1) + " != null ?", s, count=1)
s, n2 = re.subn(r"fxs = ([A-Z]+T) != null \|\|", lambda m: "fxs = GCT != null || " + m.group(1) + " != null ||", s, count=1)
assert n1 == 1 and n2 == 1
rep("&& a.o !== 'RVRIDE' /* [RV-cast] */", "&& a.o !== 'RVRIDE' /* [RV-cast] */ && a.o !== 'PAGEY' /* [GC-cast] */")
rep("    if (a.o === 'LANTY') {", "    if (a.o === 'PAGEY') { m.geometry = BODY; const op = a.opts, fq = f; m.material.map = canvasFor('pagey|' + fq + key, 600, 1000, k, (p) => drawPagey(p.g, {}, { t: fq, blink: blink4(f, (op.seed || 0) + 11), ...C2.L, ...op }), used); } else /* [GC-cast] */\n    if (a.o === 'LANTY') {")
s, n3 = re.subn(r"const PV = ([A-Z]+V) != null \?", lambda m: "const PV = GCV != null ? gc.viewFor(GCV === 'a' ? f : +GCV, f) : /* [GC-sets] */ " + m.group(1) + " != null ?", s, count=1); assert n3 == 1
rep("  rv.show(world, null); rv.tick(f); // [RV-sets]\n", "  rv.show(world, null); rv.tick(f); // [RV-sets]\n  gc.show(world, null); gc.tick(f); // [GC-sets]\n")
if len(sys.argv) > 2:
    s, n = re.subn(r"from '\./story_[a-z]+\.js'; // \[[A-Z]+-story\] \(was [a-z_]+\.js\)", "from './story_calendar.js'; // [GC-story] (was story_revere.js)", s); print('story', n)
open(p, 'w').write(s); print('hooked', p)
