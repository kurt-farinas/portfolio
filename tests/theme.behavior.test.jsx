import React, { act, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
// Mirrors the 3D room, which reads theme CSS variables in an effect keyed on the theme.
function EffectReader({ seen }) { const { theme } = useTheme(); useEffect(() => { seen.push(theme + ':' + document.documentElement.dataset.theme); }, [theme, seen]); return null; }
function Control() { const { theme, toggleTheme } = useTheme(); return <button onClick={toggleTheme}>{theme}</button>; }
describe('Portfolio theme preference', () => {
  let root, host, media;
  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    localStorage.clear();
    media = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    vi.stubGlobal('matchMedia', () => media);
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  });
  afterEach(async () => { await act(async () => root.unmount()); host.remove(); localStorage.clear(); vi.unstubAllGlobals(); });
  const render = () => act(async () => root.render(<ThemeProvider><Control /></ThemeProvider>));
  it('defaults to dark even on a light system and saves explicit choices', async () => {
    await render(); expect(host.textContent).toBe('dark');
    expect(localStorage.getItem('portfolio-theme')).toBeNull();
    expect(media.addEventListener).not.toHaveBeenCalled();
    await act(async () => host.querySelector('button').click());
    expect(localStorage.getItem('portfolio-theme')).toBe('light');
    expect(host.textContent).toBe('light');
  });
  it('retains a saved explicit theme instead of the system theme', async () => {
    localStorage.setItem('portfolio-theme', 'light'); await render();
    expect(host.textContent).toBe('light'); expect(document.documentElement.dataset.theme).toBe('light');
  });
  it('updates data-theme before child effects read theme colors', async () => {
    const seen = [];
    await act(async () => root.render(<ThemeProvider><Control /><EffectReader seen={seen} /></ThemeProvider>));
    await act(async () => host.querySelector('button').click());
    await act(async () => host.querySelector('button').click());
    expect(seen).toEqual(['dark:dark', 'light:light', 'dark:dark']);
  });
  it('defaults to dark when a saved value is invalid', async () => {
    localStorage.setItem('portfolio-theme', 'invalid'); await render(); expect(host.textContent).toBe('dark');
  });
});
