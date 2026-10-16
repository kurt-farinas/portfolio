# Responsive Cursor Camera Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The desk camera reacts to the cursor as visibly and quickly as henryheffernan.com: larger movement, a slight turn toward the cursor, and a ~0.1 s response instead of 0.30 s.

**Architecture:** Replace the one-shot `setFocalOffset(..., true)` calls (limited by CameraControls' single 0.30 s `smoothTime` and tiny range) with a per-frame follower in `DeskCamera`. A `useFrame` loop eases a current follow state toward a target using `easeToward`, then applies it with `setFocalOffset(x, y, 0, false)` plus the incremental change in azimuth/polar via `rotate(dAz, dPolar, false)`, and calls `invalidate()` only until the state settles (scene still sleeps at rest). Orbit drag, distance, lock thresholds and `deskCameraMotion` stay untouched because rotation is applied as deltas.

**Tech Stack:** React 19, R3F v9 (`useFrame`, `invalidate`), Drei `CameraControls`, Vitest.

**Spec:** `AGENTS.md` "Smooth camera zoom" (follow sentence added in 3118062); `docs/superpowers/plans/2026-10-16-cursor-follow-camera.md`; this request: "the cursor is not that responsive as henry's cursor". Measured now (1440x900, dark): left-to-right cursor moves the projected desktop frame ~25 px; the target is at least 120 px.

## Global Constraints

- Keep `LOCK_DISTANCE = 5.5`, `UNLOCK_DISTANCE = 6`, `HOVER_DWELL_MS = 250`, ordinary smoothing 0.30, drag 0.18, dolly 0.75, intro 0.45.
- Reduced motion: no follow, state snaps to zero. Follow only in `view === 'desk'`; off over `.desk-projection-frame`, while `event.buttons`, or during `handoff.current`.
- No new timers or permanent frame loop: scene sleeps when the follow state is within `1e-3` of its target.
- Orbit limits `minAzimuthAngle -0.8`, `maxAzimuthAngle 0.8`, polar 0.65..1.42 must still hold (rotation deltas are small and clamped by CameraControls).
- Do not touch `bindDesktopCameraInput`. Do not commit or push without approval.

## Review Focus

- Cursor stops mid-screen: follow settles and rendering sleeps (no endless invalidation).
- User drags to orbit then releases: follow resumes from the new pose, no snap-back (deltas, not absolute angles).
- Cursor leaves the window or tab blurs: state eases to zero, angles return exactly to where they were (no accumulated drift).
- Hover-dwell or wheel lock starts while offset is non-zero: monitor view is straight on (state reset to zero without leaving a rotation residue).
- Frame-rate independence: same result at 30 and 144 fps (`easeToward` takes `dt`).

## File Structure

- Modify `src/components/desktop/deskCameraFollow.js`: new ranges and two pure functions.
- Modify `tests/desk-camera-follow.test.js`.
- Modify `src/components/desktop/DeskScene.jsx` (`DeskCamera` follow effect and `onControl`).
- Modify `AGENTS.md`, `DESIGN.md` (follow sentence).

### Task 1: Pure follow math

**Files:**
- Modify: `src/components/desktop/deskCameraFollow.js`
- Test: `tests/desk-camera-follow.test.js`

**Interfaces:**
- Produces:
  - `FOLLOW_RANGE = { x: 0.8, y: 0.4, azimuth: 0.14, polar: 0.06 }` (units / radians).
  - `FOLLOW_TAU = 0.1` (seconds).
  - `easeToward(current: number, target: number, dt: number, tau: number): number` returns `current + (target - current) * (1 - Math.exp(-dt / tau))`.
  - `cameraFollowTarget(nx: number, ny: number, progress: number, focus: [number, number]): { x: number, y: number, azimuth: number, polar: number }`: `x, y` as today's `cameraFocalOffset` with the new ranges; `azimuth = clamp(nx) * FOLLOW_RANGE.azimuth * (1 - progress)`, `polar = -clamp(ny) * FOLLOW_RANGE.polar * (1 - progress)` (cursor up tilts the view up).
  - `zoomProgress` unchanged. `cameraFocalOffset` is removed (replaced by `cameraFollowTarget`).

- [ ] **Step 1: Failing tests.** Update `tests/desk-camera-follow.test.js`: `easeToward(0, 1, 0.1, 0.1)` is within 1e-6 of `1 - Math.exp(-1)`; `easeToward(0, 1, 0, 0.1) === 0`; two steps of `dt=0.05` equal one step of `dt=0.1` (within 1e-9); `cameraFollowTarget(1, 1, 0, [0, 1])` equals `{ x: 0.8, y: 0.4, azimuth: 0.14, polar: -0.06 }`; `cameraFollowTarget(5, -5, 0, [0, 1])` clamps to `{ x: 0.8, y: -0.4, azimuth: 0.14, polar: 0.06 }`; `cameraFollowTarget(1, 1, 1, [0, 1])` equals `{ x: 0, y: 1, azimuth: 0, polar: -0 }` compared with `toMatchObject` using `toBeCloseTo` per field. Keep the four `zoomProgress` tests.
- [ ] **Step 2: Run** `npm test -- --run tests/desk-camera-follow.test.js`. Expected: FAIL (`easeToward` not exported).
- [ ] **Step 3: Implement** the new exports in `deskCameraFollow.js`.
- [ ] **Step 4: Run** the same command. Expected: PASS.

### Task 2: Per-frame follower in DeskCamera

**Files:**
- Modify: `src/components/desktop/DeskScene.jsx`

**Interfaces:**
- Consumes: `easeToward`, `cameraFollowTarget`, `zoomProgress`, `FOLLOW_TAU` (Task 1); existing `cursor`, `controls`, `handoff`, `reducedMotion`, `view`, `DESK_POSE`, `onControl`.
- Produces: refs `follow = { x, y, azimuth, polar }` (applied state) and `followTarget` (same shape); a `useFrame` in `DeskCamera`.

- [ ] **Step 1: Baseline measure.** With the production preview on port 4182, run the ad-hoc check from the previous task (move cursor x=40 then x=1400 at y=60, read `.desk-projection-frame` bounding x) and record the shift (~25 px).
- [ ] **Step 2: Implement.** In the pointer listener, only write `followTarget` from `cameraFollowTarget(nx, ny, progress, focus)` and call `invalidate()`. `pointerleave`/`blur`/cleanup set `followTarget` to zeros. Add `useFrame((_, delta) => ...)`: if `view !== 'desk'` or `reducedMotion`, reset `follow` to zeros and apply the negative of the applied rotation; otherwise ease each field toward `followTarget` with `easeToward(..., Math.min(delta, 0.05), FOLLOW_TAU)`, call `controls.current.setFocalOffset(follow.x, follow.y, 0, false)` and `controls.current.rotate(follow.azimuth - prev.azimuth, follow.polar - prev.polar, false)`, and `invalidate()` while any field differs from its target by more than `1e-3`. `onControl` writes `followTarget` (zoom progress) instead of calling `setFocalOffset`. The view-change effect zeroes both refs and undoes applied rotation before `move(pose, animate)`.
- [ ] **Step 3: Verify.** `npm run build`, `npx vite preview --port 4182 --host 127.0.0.1`, repeat the Step 1 measurement. Expected: shift >= 120 px; after the cursor stops, `.desk-projection-frame` x is unchanged across two reads 500 ms apart; wheel lock (7 notches) and wheel-out (+160 x3 from the bezel) still reach `screen` and `desk`; hover on glass reaches `screen`. Read `window.__cameraTestFrames` or the page's frame counter to confirm no frames are requested 1 s after rest.
- [ ] **Step 4: Regression.** `npm test -- --run`, `npm run build`, `git diff --check`.

### Task 3: Docs and ship

**Files:**
- Modify: `AGENTS.md`, `DESIGN.md` (replace the "focal offset (up to 0.35 units ...)" sentence)

- [ ] **Step 1:** State the new behaviour: eased per frame (about 0.1 s), up to 0.8/0.4 units of shift and 0.14/0.06 rad of turn, still off for reduced motion, over the projected desktop, and while a button is held.
- [ ] **Step 2:** `git diff --check`; commit `Make the desk camera follow the cursor faster and turn toward it` and push only with approval.

## Self-Review

Coverage: larger range and tilt (Task 1), faster response (Task 2 via `FOLLOW_TAU`), sleep and reduced motion (Task 2), docs (Task 3). Names consistent: `easeToward`, `cameraFollowTarget`, `FOLLOW_RANGE`, `FOLLOW_TAU`. Review Focus 1, 4 and the thresholds are asserted in Task 2 Step 3; items 2 and 3 hold by construction (deltas) and are checked by hand in the preview; item 5 is asserted in Task 1 Step 1.

Tuning risk: ranges and `FOLLOW_TAU` are first guesses against the reference; adjust the four constants by eye after Task 2 Step 3.
