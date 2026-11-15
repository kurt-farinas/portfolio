# Low-end PCs see the room — roadmap (card #66)

**Status:** Phase 1 ready. Phase 2 is provisional.

## Goal and success criteria

- A desktop visitor (1100 px or wider, with a mouse) **without usable WebGL** sees the room as a picture, with clickable objects, instead of the flat 2D desktop. This covers hardware acceleration turned off, a GPU on the blocklist, a software renderer, or a 3D crash.
- Visitors on weak GPUs that do run WebGL get a smoother room (Phase 2).

## Evidence (2026-11-16)

- `canUseWebGL()` ([DesktopWorkspaceContext.jsx:85](../src/context/DesktopWorkspaceContext.jsx)) asks for `failIfMajorPerformanceCaveat: true`, so a software renderer counts as "no 3D", and `canUse3D` becomes false. So "small screen" and "no GPU" currently share one flag and both fall to 2D.
- A headless test with `--disable-gpu --disable-software-rasterizer` returns **no WebGL**. Current Chrome stops falling back to SwiftShader for WebGL, so real no-acceleration PCs end here.
- `failScene()` (line 244) sends a WebGL crash to `view: 'workspace'`.

## Decisions

| Decision | Basis |
|---|---|
| No WebGL: show a pre-rendered picture of the room with HTML hotspots. | User-confirmed (Q6 = A) |
| Pictures: 6 captures (dark and light × day, dusk and night) at the 1440×900 overview pose, made by a script so they can be re-captured. | Delegated |
| Software renderers (the `failIfMajorPerformanceCaveat` case) also get the picture, not 2D. They'd run at about 1–5 fps. | Assumption |
| A WebGL crash during a visit switches to the picture, not 2D. | Assumption |
| Monitor hotspot → the expanded 2D desktop (`expandDesktop`); "Back to desk" returns to the picture. | Assumption |
| Low-fps work waits until Phase 1 ships. | Delegated |

## Phase 1 — Room picture fallback (ready)

**1. Capture script** `scripts/capture-room-pictures.mjs` (new)
- Reuse the Date fake from [verify-room-polish.mjs:12-14](../scripts/verify-room-polish.mjs) (hours 10, 18 and 22) and the theme `localStorage` key `portfolio-theme`.
- For each theme and phase:
  - Load `/` at 1440×900.
  - Wait for `.desk-loading` to detach, then 3 s.
  - Hide `.desk-welcome` and the cursor with injected CSS.
  - Screenshot to `public/images/room/{theme}-{phase}.png`.
- Then run `node scripts/prepare-portfolio-assets.mjs` and `npm run images` (WebP copies in `public/optimized/`).
- **Check:** 6 PNGs and 6 `.webp` files exist.

**2. Context flag** [src/context/DesktopWorkspaceContext.jsx](../src/context/DesktopWorkspaceContext.jsx)
- Split `canUseWebGL()` into `isLargeFine()` and `hasFastWebGL()`. `canUse3D = isLargeFine() && hasFastWebGL()`, the same meaning as today.
- New state `roomPicture = isLargeFine() && (!hasFastWebGL() || sceneFailed)`, exposed in the context value.
- Wherever the code picks `'desk'` only when `canUse3D` (the initial view and `showDesk`), also allow `'desk'` when `roomPicture`.
- `failScene` sets `view: roomPicture-capable ? 'desk' : 'workspace'`.
- The resize/media listener (line ~219) recomputes both flags.

**3. Component** `src/components/desktop/RoomPicture.jsx` (new)
- Props: `{ theme, onOpenApp(appId), onOpenDesktop() }`.
- Picks the image with `roomPhase(new Date())` from [src/utils/roomPhase.js](../src/utils/roomPhase.js), plus `theme`, through `PortfolioImage`.
- Layout: a 16:10 box centred and scaled to cover the viewport. Hotspots are `<button>`s placed by percentage inside that box, so they track the image.
- Each hotspot has an `aria-label` and `title` naming what it opens, a 44 px minimum size, and on hover/focus the accent outline (the same colour as the 3D hover tint).
- Hotspots in `ROOM_HOTSPOTS`, an exported array of `{ id, label, app | 'desktop', left, top, width, height }` in %, measured from the dark-night capture:
  - monitor → desktop
  - Projects note → projects
  - Contact note and microphone → contact
  - polaroids → afterhours
  - certificate → recognition
  - fragrance tray → gear
  - résumé sheet → resume
- **Shortcut:** hotspot % values are hand-measured. Re-measure them if the overview camera pose changes.

**4. App wiring** [src/App.jsx:90](../src/App.jsx)
- `renderPicture = roomPicture && view === 'desk'`.
- Render `<RoomPicture>` in place of `<RoomScene>`, keeping the welcome card. "Open desktop" calls `expandDesktop` when in picture mode.
- The scene hint reads "Click an object to open its app" (no "Drag").

**Test first** (`tests/desktop-workspace.interaction.test.jsx`)
- `large screen without WebGL starts on the room picture`: with `innerWidth` 1440, fine pointer, and `getContext` returning null, the context gives `canUse3D === false`, `roomPicture === true` and `view === 'desk'`.
- `small screen without WebGL stays on 2D`: with `innerWidth` 800, `roomPicture === false`.
- `room picture hotspots open apps`: rendering `<RoomPicture>` and clicking the button named "Open Projects" calls `onOpenApp('projects')`. There are `ROOM_HOTSPOTS.length` buttons.

**Check**
- `npm test -- --run`, `npm run build` and `git diff --check`.
- `node scripts/verify-room-polish.mjs`, `verify-portfolio-ui` and `verify-mobile-polish` (the mobile path must not change).
- A new headless check with `--disable-gpu --disable-software-rasterizer` (scratchpad `nogpu.mjs` pattern): the picture is visible, no `canvas` exists, and clicking the Projects hotspot opens Projects.

**Watch out for**
1. The theme toggle while the picture shows must swap the image.
2. A crash mid-visit with apps open: switching to the picture must keep the open windows (context state is untouched).
3. Very wide or tall windows: the cover crop must not hide the hotspots. Clamp the box so the monitor stays in view.
4. Reduced motion: no change needed, since the picture is static.
5. The image fails to load: `PortfolioImage` falls back to the PNG; if that fails, go to 2D.

## Phase 2 — Smoother room on weak GPUs (provisional)

- Run the existing adaptive step-down sooner (sample 20 frames instead of 45) and add a 0.75 pixel-ratio step. Per AGENTS.md, no step may recompile shaders.
- If the median frame time stays over 45 ms after every step, offer "Switch to the lighter room view?", which opens the Phase 1 picture.
- **Gate:** measure with `profile-desk-performance.mjs` at `CPU_THROTTLE=6` before and after.

## Next step

Build Phase 1, task 1 (the capture script).

## Phase 1 results (2026-11-16)

- Built: `scripts/capture-room-pictures.mjs`, 6 captures (about 50 kB each as WebP), `RoomPicture.jsx` with 9 hotspots, the `roomPicture` context flag, and boot, toolbar and App wiring.
- A 3D crash on a large screen now goes to the picture. The existing test was renamed and its expectation updated to match.
- Tests: 116 pass, including the 3 new ones in `tests/roomPicture.test.jsx`.
- Headless check with `--disable-gpu --disable-software-rasterizer`, both themes: no canvas, the picture loads (`room/*-night.png.webp`), 9 hotspots, the Projects hotspot opens Projects in the expanded desktop, and Back to desk returns to the picture. No page errors.
