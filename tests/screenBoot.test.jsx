import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ModalProvider } from '../src/context/ModalContext';
import { DesktopWorkspaceContext } from '../src/context/DesktopWorkspaceContext';
import { RetroOSProvider, SCREEN_BOOT_MS, useRetroOS } from '../src/context/RetroOSContext';

function Probe() {
  const retro = useRetroOS();
  return <><output>{String(retro.screenBooting)}</output><button onClick={() => retro.finishBoot('3d')}>Finish</button></>;
}

describe('3D monitor power-on during the room intro', () => {
  let host, root;
  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.useFakeTimers();
    localStorage.setItem('kurt-os-sound', 'off');
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  });
  afterEach(async () => {
    await act(async () => root.unmount()); host.remove();
    vi.useRealTimers(); vi.unstubAllGlobals(); localStorage.clear(); sessionStorage.clear();
  });
  const mount = reducedMotion => act(async () => root.render(
    <MemoryRouter><ThemeProvider><ModalProvider>
      <DesktopWorkspaceContext.Provider value={{ canUse3D: true, reducedMotion, focusMonitor: vi.fn(), expandDesktop: vi.fn(), showDesk: vi.fn() }}>
        <RetroOSProvider><Probe /></RetroOSProvider>
      </DesktopWorkspaceContext.Provider>
    </ModalProvider></ThemeProvider></MemoryRouter>
  ));

  it('powers the monitor on when the boot hands over to the 3D room, then clears', async () => {
    await mount(false);
    await act(async () => host.querySelector('button').click());
    expect(host.querySelector('output').textContent).toBe('true');
    await act(async () => { vi.advanceTimersByTime(SCREEN_BOOT_MS); });
    expect(host.querySelector('output').textContent).toBe('false');
  });

  it('skips the power-on with reduced motion', async () => {
    await mount(true);
    await act(async () => host.querySelector('button').click());
    expect(host.querySelector('output').textContent).toBe('false');
  });
});
