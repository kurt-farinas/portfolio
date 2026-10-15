import { describe, expect, it, vi } from 'vitest';
import { createDeskCameraMotion } from '../src/components/desktop/deskCameraMotion';

function rig() {
  const pending = [];
  const vector = values => ({ toArray: () => values });
  const controls = {
    getPosition: vi.fn(() => vector([1, 3, 9])),
    getTarget: vi.fn(() => vector([0, 2, 0])),
    getFocalOffset: vi.fn(() => vector([0, 0, 0])),
    setFocalOffset: vi.fn(),
    setLookAt: vi.fn((...args) => args.at(-1)
      ? new Promise((resolve, reject) => pending.push({ resolve, reject })) : Promise.resolve())
  };
  const frames = vi.fn();
  const clock = { getDelta: vi.fn() };
  return { controls, pending, frames, clock, motion: createDeskCameraMotion(() => controls, clock, frames) };
}

describe('interrupted desk camera transitions', () => {
  it('starts from the visible pose and lets only the latest move settle', async () => {
    const { controls, pending, frames, motion } = rig();
    const first = [0, 2, 4, 0, 2, 0];
    const latest = [2, 4, 12, 0, 2, 0];
    const a = motion.move(first, true);
    const b = motion.move(latest, true);
    expect(controls.getPosition).toHaveBeenCalledWith(undefined, false);
    expect(controls.setLookAt).toHaveBeenCalledWith(1, 3, 9, 0, 2, 0, false);
    pending[0].resolve(); await a;
    expect(controls.setLookAt).not.toHaveBeenCalledWith(...first, false);
    expect(frames).not.toHaveBeenCalledWith('demand');
    pending[1].resolve(); await b;
    expect(controls.setLookAt).toHaveBeenLastCalledWith(...latest, false);
    expect(frames).toHaveBeenLastCalledWith('demand');
  });

  it('ignores a stale completion after the scene unmounts', async () => {
    const { controls, pending, frames, motion } = rig();
    const pose = [0, 2, 4, 0, 2, 0];
    const move = motion.move(pose, true);
    motion.dispose();
    const calls = controls.setLookAt.mock.calls.length;
    pending[0].resolve(); await move;
    expect(controls.setLookAt).toHaveBeenCalledTimes(calls);
    expect(frames).toHaveBeenLastCalledWith('demand');
  });

  it('snaps reduced-motion and resize updates without continuous rendering', async () => {
    const { controls, frames, clock, motion } = rig();
    const pose = [0, 2, 4, 0, 2, 0];
    await motion.move(pose, false);
    expect(controls.setLookAt).toHaveBeenLastCalledWith(...pose, false);
    expect(frames).not.toHaveBeenCalledWith('always');
    expect(clock.getDelta).not.toHaveBeenCalled();
  });

  it('reports active failures but ignores failures belonging to replaced moves', async () => {
    const { pending, motion, frames } = rig();
    const pose = [0, 2, 4, 0, 2, 0];
    const stale = motion.move(pose, true);
    const active = motion.move(pose, true);
    pending[0].reject(new Error('old transition')); await stale;
    pending[1].reject(new Error('active transition'));
    await expect(active).rejects.toThrow('active transition');
    expect(frames).toHaveBeenLastCalledWith('demand');
  });
});
