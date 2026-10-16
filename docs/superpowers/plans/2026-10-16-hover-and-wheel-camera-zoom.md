# Hover + Wheel Camera Zoom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The desk/monitor switch works from both cursor hover (250 ms dwell) and scroll-wheel distance (5.5 / 6 units), sharing one `handoff` guard.

**Architecture:** `DeskCamera` in `src/components/desktop/DeskScene.jsx` already has the hover effect (uncommitted working-tree change). Restore the wheel handoff effect and `onControl` threshold logic that it replaced (last present in `HEAD`, recover with `git show HEAD:src/components/desktop/DeskScene.jsx`). Both paths set `handoff.current = { view }` before calling `onOpenDesktop` / `onBackToDesk`, so whichever fires first suppresses the other until the transition ends.

**Tech Stack:** React 19, React Three Fiber v9, Drei `CameraControls`, Playwright verify scripts.

**Spec:** `AGENTS.md` sections "Portfolio desktop", "Smooth camera zoom", "Projected desktop input"; this request: "combine both the cursor hover and scroll".

## Global Constraints

- Thresholds `LOCK_DISTANCE = 5.5`, `UNLOCK_DISTANCE = 6`; hover dwell `HOVER_DWELL_MS = 250`.
- Smoothing 0.30 (ordinary), 0.18 (drag), wheel dolly speed 0.75; intro 0.45. Reduced motion and resize stay instant.
- Wheel handling must not touch events inside `.desk-projection-frame` (desktop scrolling stays native) and must not affect browser zoom (`event.ctrlKey`).
- A wheel handoff runs once at a time; same-direction wheel cannot retrigger; opposite wheel retargets from the visible pose.
- Hover ignores held buttons (`event.buttons`) and running transitions.
- Keep `bindDesktopCameraInput` unchanged. Do not commit without approval.

## Review Focus

- Wheel-in while the cursor rests on the glass: both hover timer and wheel fire. Expect one transition, no double `onOpenDesktop` (guarded by `handoff.current`).
- Wheel-out over the bezel in screen view, then cursor still outside the frame: expect desk view, no bounce back to screen.
- Cursor dwelling on the glass in desk view after wheel-out zoomed away: expect no re-entry until the pointer moves again.
- Wheel over the projected desktop (e.g. scrolling Projects): expect no view change.
- Hover timer pending when a wheel handoff starts: expect timer cleared or no-op (`handoff.current` check in the timer callback).

## File Structure

- Modify `src/components/desktop/DeskScene.jsx` (`DeskCamera`, constants block near `HOVER_DWELL_MS`).
- Modify `scripts/verify-camera-zoom.mjs` (re-add wheel steps next to hover steps).
- Modify `AGENTS.md`, `DESIGN.md` (camera paragraphs).

### Task 1: Restore wheel handoff beside hover

**Files:**
- Modify: `src/components/desktop/DeskScene.jsx` (constants, `DeskCamera`, `Spherical` import)
- Test: `scripts/verify-camera-zoom.mjs`

**Interfaces:**
- Consumes: `handoff` ref, `onOpenDesktop()`, `onBackToDesk()`, `controls` ref, `HOVER_DWELL_MS` (all in `DeskCamera`).
- Produces: constants `LOCK_DISTANCE = 5.5`, `UNLOCK_DISTANCE = 6`; `onControl` passed to `CameraControls`; wheel listener on `canvas.parentElement`.

- [ ] **Step 1: Extend the verify script (failing test).** In `scripts/verify-camera-zoom.mjs`, after the hover steps, add `wheelEntry` and `wheelExit` samples restored from `git show HEAD:scripts/verify-camera-zoom.mjs`. Assert, starting from desk view with the cursor on the glass centre: wheel `deltaY -120` immediately gives `data-view="screen"` (no 250 ms wait); then with the cursor off the frame, wheel `+160` gives `desk`. Add one more: wheel `-120` over the projected frame in screen view leaves `data-view="screen"` and scrolls content.
- [ ] **Step 2: Run to verify it fails.** `npm run build && npx vite preview --port 4182 --host 127.0.0.1` in a second shell, then `node scripts/verify-camera-zoom.mjs`. Expected: FAIL on the wheel-entry assertion.
- [ ] **Step 3: Restore code.** Re-add `LOCK_DISTANCE`/`UNLOCK_DISTANCE`, the `Spherical` import and `spherical` memo, the wheel effect and `onControl` from `HEAD` unchanged, and pass `onControl={onControl}` to `CameraControls`. Hover effect stays as is. In the hover timer callback keep the existing `if (handoff.current) return;` so a wheel handoff cancels a pending dwell.
- [ ] **Step 4: Run to verify it passes.** Same command. Expected: both themes print the passed line; `test-results/camera-zoom/` motion JSON written.
- [ ] **Step 5: Regression checks.** `npm test -- --run`, `npm run build`, `git diff --check` all clean. Then `node scripts/verify-desktop-input.mjs` against a preview on port 4176 (it hard-codes that port) and `node scripts/verify-portfolio-ui.mjs`.

### Task 2: Docs

**Files:**
- Modify: `AGENTS.md` (Portfolio desktop camera sentence; Smooth camera zoom paragraph), `DESIGN.md` (same paragraph, ~L81)

- [ ] **Step 1: Edit text.** State that the switch happens by either path: 250 ms hover on the glass / off the desktop, or wheel past 5.5 / 6 units; one handoff at a time; hover ignores held buttons.
- [ ] **Step 2: Verify.** `git diff --check`; grep both files for "250 ms" and "5.5".
- [ ] **Step 3: Commit (only with user approval).** Message: `Combine hover and wheel for the desk/monitor camera switch`, with the Co-Authored-By trailer from the session.

## Self-Review

Spec coverage: hover (kept), wheel (Task 1), docs (Task 2). Names consistent (`handoff`, `HOVER_DWELL_MS`, `LOCK_DISTANCE`). Risk is the interaction of the two paths, covered by Review Focus items 1–5; items 1, 2 and 4 are asserted in Task 1 Step 1, items 3 and 5 are guarded by the `handoff.current` checks and not separately asserted.
