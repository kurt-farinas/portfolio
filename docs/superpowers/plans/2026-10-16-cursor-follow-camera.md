# Cursor-Follow Camera and Homing Zoom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In the desk overview the camera drifts smoothly with the cursor (parallax, as on henryheffernan.com), and scrolling in eases the view toward the monitor before the existing lock at 5.5 units.

**Architecture:** Both effects use CameraControls' *focal offset* (`setFocalOffset(x, y, 0, true)`), which shifts camera and target together in screen space. Orbit angles, distance, the 5.5/6 thresholds and `deskCameraMotion.freeze` (already preserves focal offset) stay untouched. Two pure functions in a new `deskCameraFollow.js` compute the offset; `DeskCamera` in `DeskScene.jsx` feeds them from a `pointermove` listener and from `onControl`.

**Tech Stack:** React 19, R3F v9, Drei `CameraControls`, Vitest, Playwright verify scripts.

**Spec:** `AGENTS.md` sections "Smooth camera zoom", "Projected desktop input", "Rendering performance"; this request ("make the cursor camera and scroll zoom better, like henryheffernan.com, camera follows the cursor"). Reference observed: cursor left/right shifts and tilts the desk view smoothly; click zooms to the monitor.

## Global Constraints

- Keep `LOCK_DISTANCE = 5.5`, `UNLOCK_DISTANCE = 6`, `HOVER_DWELL_MS = 250`, smoothing 0.30 / drag 0.18 / dolly 0.75, intro 0.45.
- Reduced motion: no cursor follow, no homing (instant, none). Follow runs only in `view === 'desk'`, tab visible.
- No new frame loop: rely on Drei demand invalidation until rest ("Drei continues invalidating residual camera updates in demand mode until natural sleep").
- Projected desktop keeps input ownership: no follow while the pointer is over `.desk-projection-frame` or `event.buttons` is held.
- Do not touch `bindDesktopCameraInput`. No new dependencies. Do not commit without approval.

## Review Focus

- Pointer leaves the canvas: offset eases back to `[0, 0]`, scene then sleeps (no endless invalidation).
- Reduced motion enabled mid-session: offset snaps to `[0, 0]`, follow stops.
- User drags to orbit, releases: follow resumes from the new pose, no jump.
- Hover dwell fires during follow: monitor transition starts from the visible pose with offset reset to `[0, 0]` (screen view faces the monitor straight on).
- Wheel back out (`UNLOCK_DISTANCE`) to desk: no residual offset, no bounce re-lock.

## File Structure

- Create `src/components/desktop/deskCameraFollow.js`: pure offset math.
- Create `tests/desk-camera-follow.test.js`.
- Modify `src/components/desktop/DeskScene.jsx` (`DeskCamera`).
- Modify `scripts/verify-camera-zoom.mjs`, `AGENTS.md`, `DESIGN.md`.

### Task 1: Offset math (pure)

**Files:**
- Create: `src/components/desktop/deskCameraFollow.js`
- Test: `tests/desk-camera-follow.test.js`

**Interfaces:**
- Produces:
  - `FOLLOW_RANGE = { x: 0.35, y: 0.18 }` (world units at the desk pose).
  - `zoomProgress(distance: number, deskDistance: number, lockDistance: number): number` returns smoothstep of `(deskDistance - distance) / (deskDistance - lockDistance)` clamped to 0..1.
  - `cameraFocalOffset(nx: number, ny: number, progress: number, focus: [number, number]): [number, number]` where `nx, ny` are cursor positions in -1..1 (clamped), `focus` is the monitor-centre offset from the desk target in camera space. Result is `FOLLOW_RANGE * (nx, ny) * (1 - progress) + focus * progress`.

- [ ] **Step 1: Write failing tests** in `tests/desk-camera-follow.test.js`: `zoomProgress(9, 9, 5.5) === 0`; `zoomProgress(5.5, 9, 5.5) === 1`; `zoomProgress(12, 9, 5.5) === 0`; `zoomProgress(7.25, 9, 5.5) === 0.5`; `cameraFocalOffset(1, -1, 0, [0, 1])` equals `[0.35, -0.18]`; `cameraFocalOffset(5, 5, 0, [0, 1])` equals `[0.35, 0.18]` (clamped); `cameraFocalOffset(1, 1, 1, [0, 1])` equals `[0, 1]`; `cameraFocalOffset(0, 0, 0, [0, 1])` equals `[0, 0]`.
- [ ] **Step 2: Run** `npm test -- --run tests/desk-camera-follow.test.js`. Expected: FAIL, module missing.
- [ ] **Step 3: Implement** both functions and `FOLLOW_RANGE` in `deskCameraFollow.js`.
- [ ] **Step 4: Run** the same command. Expected: PASS.

### Task 2: Wire into DeskCamera

**Files:**
- Modify: `src/components/desktop/DeskScene.jsx` (`DeskCamera`, ~L274-393)
- Test: `scripts/verify-camera-zoom.mjs`

**Interfaces:**
- Consumes: `cameraFocalOffset`, `zoomProgress` (Task 1); `controls` ref, `handoff` ref, `reducedMotion`, `view`, `DESK_POSE`, `onControl` (existing).
- Produces: a `pointermove`/`pointerleave` listener on `canvas.parentElement` active only when `view === 'desk' && !reducedMotion`; `onControl` also applies the zoom offset.

- [ ] **Step 1: Failing check.** In `scripts/verify-camera-zoom.mjs` add a "cursor follow" sample: in desk view move the cursor from x=15% to x=85% of the canvas (off the glass) and assert the monitor's projected screen centre shifts by at least 8 px and returns within 2 px of baseline after the cursor leaves and 1 s passes; assert rendering sleeps afterwards using the script's existing idle-frame check. Add a "homing" sample: wheel `-120` x2 (stays above 5.5) and assert the projected monitor centre moved toward viewport centre. Run against a preview (`npm run build`, then `npx vite preview --port 4182 --host 127.0.0.1`, `node scripts/verify-camera-zoom.mjs`). Expected: FAIL on both.
- [ ] **Step 2: Cursor follow.** Add an effect in `DeskCamera`: on `pointermove` (skip if `handoff.current`, `event.buttons`, target inside `.desk-projection-frame`) compute `nx, ny` from the canvas rect and call `controls.current.setFocalOffset(x, y, 0, true)` from `cameraFocalOffset(nx, ny, 0, [0, 0])`; on `pointerleave` and window `blur` ease back to `0, 0`. When `reducedMotion` or `view !== 'desk'`, set `0, 0` without transition and attach nothing. Hover-dwell effect stays unchanged.
- [ ] **Step 3: Homing zoom.** In `onControl`, before the threshold checks, when `view === 'desk'` and not `reducedMotion` compute `progress = zoomProgress(distance, deskDistance, LOCK_DISTANCE)` (`deskDistance` = distance of `DESK_POSE` to its target) and call `setFocalOffset` with `cameraFocalOffset(lastNx, lastNy, progress, [0, MONITOR_CENTER_Y - DESK_CAMERA_TARGET[1]])`, where `lastNx/lastNy` are stored in a ref by the pointer listener. Thresholds and handoff logic stay as they are.
- [ ] **Step 4: Reset on view change.** In the existing view effect, `controls.current?.setFocalOffset(0, 0, 0, false)` before `move(pose, animate)` so the monitor pose is straight on.
- [ ] **Step 5: Run** the verify script. Expected: follow and homing samples pass, existing entry/exit/wheel/hover samples still pass in both themes, motion JSON under `test-results/camera-zoom/`.
- [ ] **Step 6: Regression.** `npm test -- --run`, `npm run build`, `git diff --check`; then `node scripts/verify-desktop-input.mjs` (preview on port 4176) and `node scripts/verify-portfolio-ui.mjs`.

### Task 3: Docs

**Files:**
- Modify: `AGENTS.md` ("Smooth camera zoom"), `DESIGN.md` (camera paragraph)

- [ ] **Step 1:** State that the desk overview camera drifts with the cursor via focal offset (±0.35 / ±0.18 units, off for reduced motion, over the projected desktop, or while a button is held) and that scrolling in eases the view toward the monitor before the 5.5-unit lock.
- [ ] **Step 2:** `git diff --check`. Commit only with user approval; message `Make the desk camera follow the cursor and home in on scroll`.

## Self-Review

Coverage: follow (Task 2 Step 2), homing zoom (Step 3), reduced motion and reset (Steps 2 and 4), docs (Task 3). Names match across tasks (`cameraFocalOffset`, `zoomProgress`, `FOLLOW_RANGE`). Review Focus items 1 and 2 asserted in Task 2 Step 1 / by Step 2 logic; item 3 relies on focal offset being independent of orbit angles; items 4 and 5 covered by Step 4 plus existing hover/wheel samples.

Open tuning risk: ranges 0.35 / 0.18 are first guesses. Tune by eye in the preview after Step 5.
