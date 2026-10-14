import React, { act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HeroDither, { HeroMotionProvider } from '../src/components/common/HeroDither';
import { ThemeProvider } from '../src/context/ThemeContext';

describe('Dither hero lifecycle', () => {
  let root, host, frames, frameId, ctx, motion, listeners, observers;
  const render = (visible = true) => act(async () => root.render(
    <StrictMode><ThemeProvider><HeroMotionProvider><h1>Kurt {visible && <HeroDither />}</h1></HeroMotionProvider></ThemeProvider></StrictMode>
  ));
  const step = now => act(async () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(now)); });
  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    frames = new Map(); frameId = 0; listeners = new Set(); observers = [];
    ctx = { clearRect: vi.fn(), fillRect: vi.fn(), fillStyle: '', imageSmoothingEnabled: true };
    motion = { matches: false, addEventListener: vi.fn((event, callback) => listeners.add(callback)), removeEventListener: vi.fn((event, callback) => listeners.delete(callback)) };
    vi.stubGlobal('matchMedia', query => query.includes('reduced-motion') ? motion : { matches: false });
    vi.stubGlobal('requestAnimationFrame', callback => { frames.set(++frameId, callback); return frameId; });
    vi.stubGlobal('cancelAnimationFrame', id => frames.delete(id));
    vi.stubGlobal('ResizeObserver', class { constructor() { this.disconnect = vi.fn(); observers.push(this); } observe() {} });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 96, height: 64 });
    localStorage.clear();
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  });
  afterEach(async () => {
    await act(async () => root.unmount()); host.remove(); localStorage.clear();
    vi.restoreAllMocks(); vi.unstubAllGlobals();
  });
  it('renders selectable text immediately and completes in 12 discrete levels under Strict Mode', async () => {
    await render();
    expect(host.querySelector('h1').textContent).toBe('Kurt ');
    expect(host.querySelector('canvas').getAttribute('aria-hidden')).toBe('true');
    expect(document.body.style.overflow).not.toBe('hidden');
    expect(frames.size).toBe(1);
    for (let level = 0; level <= 12; level++) await step(level * 75);
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(frames.size).toBe(0);
    expect(ctx.clearRect).toHaveBeenLastCalledWith(0, 0, 96, 64);
  });
  it('skips all drawing and scheduling for reduced motion', async () => {
    motion.matches = true; await render();
    expect(frames.size).toBe(0); expect(ctx.fillRect).not.toHaveBeenCalled();
  });
  it('does not replay after route unmount and remount', async () => {
    await render(); await step(0); await render(false); await render(true);
    expect(frames.size).toBe(0);
  });
  it('clears pending frames and listeners on unmount', async () => {
    await render(); await step(0); await render(false);
    expect(frames.size).toBe(0); expect(listeners.size).toBe(0);
    expect(observers.every(observer => observer.disconnect.mock.calls.length === 1)).toBe(true);
  });
  it('stops immediately if reduced motion becomes enabled', async () => {
    await render(); await step(0); motion.matches = true;
    await act(async () => [...listeners].forEach(callback => callback()));
    expect(frames.size).toBe(0);
  });
});
