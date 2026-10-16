# Quiet Clicks and Follow Direction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the mouse-click sound that fires on every pointer press in the open desktop, and flip the horizontal direction of the desk camera's cursor-follow (vertical stays).

**Architecture:** Two independent one-spot edits. (1) Remove the `onPointerDownCapture` that plays `'click'` on the shell in `src/App.jsx`. (2) Negate the horizontal outputs (`x`, `azimuth`) of `cameraFollowTarget` in `src/components/desktop/deskCameraFollow.js`; both call sites in `DeskScene.jsx` consume it unchanged.

**Tech Stack:** React 19, React Three Fiber, camera-controls (via Drei), Vitest.

**Spec:** User request, 2026-10-17: "remove the clicky on the open desktop, also the follow pan camera feels reversed". Builds on `docs/superpowers/plans/2026-10-16-responsive-cursor-camera.md`.

## Assumptions (flag if wrong)

- "Clicky" = the synthesized ball-mouse click played by `playSound('click')` on every pointer-down. It only plays when the user has turned Sound on. Key-press sounds, power, boot, print, etc. stay.
- "Reversed" = horizontal only (confirmed by user: vertical is good). Flip `x` and `azimuth`; leave `y` and `polar` unchanged. If only the shift or only the turn feels wrong horizontally, revert that one (Task 2 Step 5 checks by eye).

## Global Constraints

- `FOLLOW_RANGE` stays `{ x: 1.2, y: 0.6, azimuth: 0.2, polar: 0.08 }` and `FOLLOW_TAU` stays `0.1`; only signs change.
- Follow stays off with reduced motion, over the projected desktop, and while a button is held.
- No commit, push, or deploy without explicit approval (AGENTS.md).
- Run `npm test -- --run`, `npm run build`, `git diff --check` after the change.

## Review Focus

- Zoomed-in blend: at `progress = 1` the monitor `focus` offset must stay positive (not negated), or the lock-on framing drifts off the screen.
- Cursor at exact centre / outside the canvas: target stays all zeros (no `-0` surprises in strict equality at `DeskScene.jsx:429`).
- Keyboard typing still plays key sounds after the click handler is removed.
- Sound on, press on the projected desktop: silence on pointer-down.
- Reduced motion: still no follow.

## File Structure

- Modify `src/App.jsx:90`: drop the `onPointerDownCapture` prop.
- Modify `src/components/desktop/deskCameraFollow.js:16-25`: flip horizontal signs.
- Modify `tests/desk-camera-follow.test.js:29-45`: update expected signs, add the `-0` and focus-blend assertions.

---

### Task 1: Remove the pointer-down click sound

**Files:**
- Modify: `src/App.jsx:90`

**Interfaces:**
- Consumes: `retro.pressKey(event)` (unchanged, still on `onKeyDownCapture`).
- Produces: nothing new. `retro.playSound` remains exported for other callers.

- [ ] **Step 1: Edit `src/App.jsx:90`.** Delete only `onPointerDownCapture={() => retro.playSound('click')} ` from the shell `<div>`; leave `className`, `data-view`, and `onKeyDownCapture` as is.
- [ ] **Step 2: Confirm no other pointer-click sound remains.** Run: `grep -rn "playSound('click')" src --include=*.jsx --include=*.js` (excluding `src/js/`). Expected: no matches. (`playSound()` with no argument defaults to `'click'` in `RetroOSContext.jsx:87`; the grep from planning showed no argument-less callers.)
- [ ] **Step 3: Run `npm test -- --run`.** Expected: all pass.

### Task 2: Flip the horizontal cursor-follow direction

**Files:**
- Modify: `src/components/desktop/deskCameraFollow.js:16-25`
- Test: `tests/desk-camera-follow.test.js:29-45`

**Interfaces:**
- Consumes: nothing new.
- Produces: `cameraFollowTarget(nx, ny, progress, focus) -> { x, y, azimuth, polar }` with the same signature, now:
  - `x = -cx * FOLLOW_RANGE.x * follow + focus[0] * progress`
  - `y = cy * FOLLOW_RANGE.y * follow + focus[1] * progress` (unchanged)
  - `azimuth = -cx * FOLLOW_RANGE.azimuth * follow`
  - `polar = -cy * FOLLOW_RANGE.polar * follow` (unchanged)

- [ ] **Step 1: Update the tests first** in `tests/desk-camera-follow.test.js`. In the existing `cameraFollowTarget` cases, flip only horizontal expectations: `(1, 1, 0, [0, 1])` gives `x -1.2`, `y +0.6`, `azimuth -0.2`, `polar -0.08`; `(5, -5, 0, …)` clamps and gives `x -1.2`, `azimuth -0.2`, `polar +0.08`. Keep the `progress = 1` case expecting `azimuth 0`, `polar 0`, and `y` equal to `focus[1]`. Add `it('returns +0 at the centre')`: `cameraFollowTarget(0, 0, 0, [0, 0])` satisfies `Object.is(t.x, 0)` for all four fields.
- [ ] **Step 2: Run `npm test -- --run tests/desk-camera-follow.test.js`.** Expected: FAIL on the flipped horizontal signs and the `+0` case.
- [ ] **Step 3: Implement the horizontal sign flips** in `cameraFollowTarget` per the Interfaces block. For `+0`, write the negations as `0 - cx * …` (or add `+ 0`), since `-0 + 0 === 0` but `-(0)` is `-0`.
- [ ] **Step 4: Run `npm test -- --run`.** Expected: PASS.
- [ ] **Step 5: Eyeball in the preview.** `preview_start` the dev server, open `/`, skip boot, move the cursor left/right over the desk (not over the monitor glass). Expected: horizontal follow now feels right; up/down is unchanged. If only the shift or only the turn feels wrong, revert that one in `cameraFollowTarget` and its test.
- [ ] **Step 6: Run `npm run build` and `git diff --check`.** Expected: both clean.
- [ ] **Step 7: Update `docs`.** In `AGENTS.md` ("Smooth camera zoom") append one sentence: the horizontal follow direction was flipped (vertical unchanged). No change needed to `DESIGN.md` unless it states a direction (the grep found none).

---

**Self-review:** Both requests map to a task. `cameraFollowTarget` is defined once and used at `DeskScene.jsx:362` and `:419` with the same signature, so no caller changes. The sign assumption is stated up top.
