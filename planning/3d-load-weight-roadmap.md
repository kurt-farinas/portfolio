# 3D load weight and polish leftovers — roadmap (card #65)

**Status:** Phase 1 (diagnosis) ready.

## Findings (2026-11-16)

**Chunk size.** The DeskScene chunk is 1,097 kB minified. By source size it is three.js 2,108 kB, @react-three/fiber 711 kB, scene code 123 kB, camera-controls 115 kB, modern-screenshot 53 kB, and drei 38 kB. R3F v9 pulls in all of three.js, so size work would save at most about 15 kB gzipped (modern-screenshot). **Skipped** (user chose the profiling route).

**Polish leftovers.** None concrete. The PIS screenshot is already WebP and loads cleanly.

**Frame time** (`scripts/profile-desk-performance.mjs`, 4x CPU throttle, RTX 4060 laptop):

| phase | p50 | p95 | max |
|---|---|---|---|
| load | 16.7 | 116.7 | **3,866 ms** |
| idle overview | 16.7 | 16.8 | **3,867 ms** (one run; 16.8 in another) |
| hover sweep | 16.7 | 33.4 | **1,133 ms** |
| to monitor / to desk | 16.7 | 33 | 100–117 |
| orbit drag | 16.7 | 33.4 | 50 |

Steady state is smooth. The problem is single long freezes: about 3.9 s around the end of loading, and about 1.1 s during hover. Divided by the 4x throttle, that is roughly 1 s and 0.3 s on a normal laptop.

**Suspects (unverified):**
1. The 3.9 s freeze could be the `SceneReady` `compileAsync` shader precompile, the room decor mount, or the first monitor snapshot, which may be firing at the same time.
2. The 1.1 s freeze matches the monitor snapshot capture (modern-screenshot, documented as about 250 ms unthrottled).

## Phase 1: Name the long tasks (ready)

- [ ] Record a Chrome performance trace of `load` and `hover sweep` at 4x throttle, using CDP `Tracing.start` in a copy of the profiler phases. Save it to `test-results/desk-trace/`.
- [ ] For every task over 500 ms, list the top self-time functions and map them to source: SceneReady, MergeStatic, the snapshot capture, or texture upload.
- **Gate:** the user picks which freeze to fix, based on the named causes.

## Phase 2: Fix (provisional)

Fix only the causes Phase 1 names. Candidates: stagger the first snapshot until after `SceneReady`; run the snapshot only on idle (`requestIdleCallback`); split precompile across frames. Re-run the profiler against the old build served side by side, as AGENTS.md describes.

## Also changed

`profile-desk-performance.mjs` now moves the cursor off the monitor before pressing Open desktop. The hover sweep could lock the camera onto the monitor and hide the button.

## Phase 1 results: causes named (2026-11-16)

CPU profile at 4x throttle, unminified build (scratchpad script `trace-freezes.mjs`):

- **Load freeze, 3.77 s, about 0.9 s real.** It is all the monitor snapshot: modern-screenshot `cloneNode` → `copyCssStyles` (getDiffStyle 2.4 s, applyTo 1.5 s). It copies the computed style of every desktop element. AGENTS.md documents the capture as about 250 ms, so it has grown about 4x with the desktop DOM.
- **Hover, 0.67 s.** Not a freeze: it is continuous ordinary WebGL rendering during the sweep, with no single long task. No fix needed.
- Shader compile and texture upload are not visible in this profile, so `SceneReady` precompile is fine.

**Fix candidates for Phase 2:**
1. Snapshot a smaller tree: skip the hidden or inert windows' content when cloning (modern-screenshot `filter` option).
2. Defer the first capture to `requestIdleCallback` after the intro, so it never overlaps loading.
3. Both of the above.

## Phase 2 results: fix (2026-11-16)

- Skipping content below the fold did little on its own: worst frame 3.4–3.6 s.
- The real cost was copying all ~400 computed properties per element (about 15 ms per element at 4x). Passing modern-screenshot `includeStyleProperties` with the ~90 properties the desktop uses cut the worst load frame to **1.3 s at 4x (about 0.3 s real)** over two runs. Before, it was 3.4–3.9 s.
- Captures now also wait for `requestIdleCallback` (2 s timeout).
- The monitor picture was checked in dark and light themes: icons, the About window, the avatar and the bevels are unchanged.
- Shortcut: a style that isn't in `SNAPSHOT_STYLES` won't show in the overview snapshot. Add it there if a new desktop style looks wrong only in the desk overview.
