# Frontend polish and performance — roadmap (card #55)

**Status:** Phase 1 ready for implementation. Phases 2–3 are provisional, with a measure-first gate.

## Goal and success criteria

Make Kurt-OS feel finished (B: polish) and load and run reliably on weak machines (C: performance).

- The boot screen shows no action buttons. A click or any key skips it, and it still auto-advances after about 3 s.
- The desk welcome card offers **Classic Portfolio** and **Projects**. Keyboard users can still reach the monitor.
- Phase 3 ships only changes that measurably improve the desk frame time or the time to the first 3D frame.

## Scope

**Included:** the boot screen buttons, the welcome card action, an audit of visual rough edges (B), and a measured performance pass (C).

**Excluded:** recruiter-flow redesign (option A), new apps or room objects, Classic Portfolio layout, SEO metadata, and deploying.

## Decisions

| Decision | Basis |
|---|---|
| Remove all 5 boot buttons (Enter 3D, Enter 2D, Go straight to Projects, Résumé PDF, Sound). | User-confirmed: there isn't time to click them. |
| Skipping works by click or any key. The footer reads "Click or press any key to skip." Sound is only in Settings. | User-confirmed (Q2 = A). |
| The welcome card's "Open desktop" becomes "Classic Portfolio", which opens classic mode. | User-confirmed. |
| Keep "Open desktop" as a visually hidden button that appears on keyboard focus, placed before the welcome actions. Without it, keyboard users couldn't reach the monitor, and 10 verifier scripts click it by name. | Assumption |
| Pick the B/C items from evidence (screenshots and profiler runs), not upfront. | Delegated ("what do u suggest") |
| Approach: edit the existing components in place. No new dependencies. | There's only one sensible way to do this. |

## Phase 1 — Boot screen and welcome card (ready)

**Files**
- [src/components/desktop/BootScreen.jsx:36-44](../src/components/desktop/BootScreen.jsx)
  - Delete the `.retro-boot-actions` block (lines 36-42).
  - Add `onClick={() => finishBoot(canUse3D ? '3d' : '2d')}` to the `<dialog>`.
  - Add a `keydown` listener on the dialog with the same action for any key. Escape keeps `onCancel`, which goes to 2D.
  - Change the footer text to "Starting Kurt-OS… Click or press any key to skip."
  - Drop `toggleSound`, `soundEnabled`, `openApplication`, and the `portfolioProfile.resume` usage if they become unused. Keep `soundError` only if something still sets it.
- The CSS for `.retro-boot-actions` and `.retro-boot-sound`: find it with grep and delete it.
- [src/App.jsx:118-122](../src/App.jsx)
  - Replace the "Open desktop" button with `<button className="studio-action" onClick={() => openApplication('classic')}>Classic Portfolio</button>`. Check that `openApplication('classic')` enters classic mode, the same way the Classic Portfolio app icon does.
  - Add `<button className="desk-skip-link" onClick={focusMonitor}>Open desktop</button>`. The `.desk-skip-link` class is visually hidden until `:focus-visible`, then shows the 3px accent outline.
  - Update the aria-label on line 98 to say "Click the monitor to open the desktop."
- Verifier scripts that click "Open desktop" keep working, because the hidden button keeps the name. Check that each one can still click it. A Playwright `.click()` on a visually hidden button may need `.focus()` followed by `.press('Enter')`. Adjust only the scripts that fail.
- `AGENTS.md` and `DESIGN.md`: rewrite the boot paragraph ("keeps résumé and Projects buttons visible" becomes "click/any key skips; no buttons") and the welcome card description.

**Test first** (in the existing BootScreen and App test files, or new ones under `src/**/__tests__`)
- `boot screen has no action buttons`: `queryAllByRole('button')` inside the dialog has length 0.
- `click skips boot`: a click on the dialog calls `finishBoot` once with `'3d'` when `canUse3D` is true.
- `key skips boot`: pressing Enter calls `finishBoot` once.
- `welcome card offers Classic Portfolio`: a button named "Classic Portfolio" exists, and clicking it enters classic mode.

**Check**
- `npm test -- --run`: all green.
- `npm run build`: no errors.
- `git diff --check`: no output.
- `npm run theme:check`
- `node scripts/verify-portfolio-ui.mjs`, `node scripts/verify-retro-apps.mjs` and `node scripts/verify-room-polish.mjs` against the production preview: all pass.

**Watch out for**
1. A click that lands during `showModal()` skips the boot instantly, before it renders. That's acceptable.
2. An Escape key press firing both `keydown` and `cancel` would finish the boot twice. Make sure `finishBoot` runs once.
3. Ctrl+K during the boot is already swallowed in App.jsx:92, so it must not also skip the boot.
4. Reduced-motion users still get a skippable boot.
5. On mobile, a tap skips the boot and goes to the 2D desktop.

## Phase 2 — Polish audit (provisional)

- [ ] Screenshot the desk overview, focused monitor, and every app at 1440, 1100 and 375 px, in dark and light, at day and night.
- [ ] List the rough edges, such as misalignment, inconsistent bevels, clipped text, and focus outlines. Rank them and let the user pick.
- **Gate:** the user approves the list before any fix.

**Audit findings (2026-11-16, from verifier screenshots at 1440 and 375 px):**
1. The project screenshots are letterboxed: black bars sit beside the image inside the frame on desktop, and gray bars on mobile.
2. During loading, the hint "Drag to look around · Click an object…" shows while there's no room yet.
3. On mobile, the window's left and right edges show a noisy striped texture, likely the CRT/scanline layer bleeding past the frame.
4. On the desk overview, the Projects sticky note overlaps the monitor bezel edge and reads as clipped.
5. The taskbar sound button at 1440 has a heavier, pressed-looking border than its neighbours.

**Phase 2 results:**
1. Fixed: the Kurt-OS project previews now fill the frame (`object-fit: cover`, top-aligned). The full screenshot stays available in the case-study dialog.
2. Fixed: the hint is hidden while `.desk-loading` is present.
3. Fixed: the cause was the CRT scanlines and vignette defaulting to **on**, against the AGENTS.md rule "start off". They now default to off and are opt-in from Settings.
4. Fixed: the Projects note moved right (x 2.65 → 2.74), clear of the bezel.
5. No change: at rest the sound button matches its neighbours. The audit screenshot showed the required focus outline after the script clicked it.

## Phase 3 — Performance pass (provisional)

- [ ] Baseline: `node scripts/profile-desk-performance.mjs` (4x CPU throttle) plus the initial bundle size from `npm run build`.
- [ ] Candidates, each kept only if it helps measurably: time to the first scene frame, draw calls, the initial JS chunk, and the image weight in `public/optimized/`.
- **Gate:** compare each change to the baseline, built side by side and run alternately.

## Next step

Build Phase 1 in this session, then have one reviewer check it.

**Phase 3 results (2026-11-16):**
- Baseline: the main JS is 456.29 kB (143.22 kB gzip), and the DeskScene chunk is 1,097.71 kB (already lazy).
- Change: ClassicPortfolio (17.14 kB) and RetroExtraApps (30.10 kB) are now lazy chunks.
- Result: the main JS is now **409.83 kB (126.59 kB gzip)**, 10% smaller.
- Frame time: not profiled, because no scene code changed.
- Next candidates, if wanted: profile the DeskScene chunk (three.js and drei tree-shaking), and serve `pmpc-pis-landing.webp` from `optimized/`.
