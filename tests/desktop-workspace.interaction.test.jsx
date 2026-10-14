import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ModalProvider, useModal } from '../src/context/ModalContext';
import { DesktopWorkspaceProvider, useDesktopWorkspace } from '../src/context/DesktopWorkspaceContext';
import DesktopWorkspace from '../src/components/desktop/DesktopWorkspace';

function StateHarness() {
  const workspace = useDesktopWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div>
      <output data-testid="view">{workspace.view}</output>
      <output data-testid="fallback">{String(!workspace.canUse3D)}</output>
      <output data-testid="failure">{String(workspace.sceneFailed)}</output>
      <output data-testid="active">{workspace.activeAppId}</output>
      <output data-testid="location">{location.pathname + location.hash}</output>
      <output data-testid="windows">{workspace.windows.map(item => item.appId + (item.minimized ? ':min' : '')).join(',')}</output>
      <button onClick={() => workspace.openApplication('projects')}>Open projects</button>
      <button onClick={() => workspace.openApplication('gear')}>Open gear</button>
      <button onClick={() => navigate('/gear')}>Navigate to gear route</button>
      <button onClick={() => navigate(-1)}>Browser back</button>
      <button onClick={workspace.failScene}>Simulate 3D failure</button>
      <DesktopWorkspace presentation="workspace" theme="dark" />
    </div>
  );
}

function OverlayHarness() {
  const modal = useModal();
  return (
    <div>
      <button onClick={() => {
        modal.openProjectModal('gym');
        modal.openLightbox('/images/outside/1.jpg', 'A photo');
      }}>Open project and image</button>
      <output data-testid="project-open">{String(Boolean(modal.selectedProjectId))}</output>
      <output data-testid="image-open">{String(modal.lightbox.isOpen)}</output>
    </div>
  );
}

describe('portfolio desktop workspace', () => {
  let host;
  let root;
  let oldWidth;
  let oldMatchMedia;

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    Element.prototype.scrollIntoView = vi.fn();
    oldWidth = window.innerWidth;
    oldMatchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: query => ({
        media: query,
        matches: query.includes('prefers-reduced-motion') ? false : query.includes('pointer: fine') || (query.includes('min-width') && window.innerWidth >= 1100),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn()
      })
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      getExtension: () => ({ loseContext: vi.fn() })
    });
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  });

  afterEach(async () => {
    if (root) await act(async () => root.unmount());
    host?.remove();
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: oldWidth });
    if (oldMatchMedia) Object.defineProperty(window, 'matchMedia', { configurable: true, value: oldMatchMedia });
    else delete window.matchMedia;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  async function renderWorkspace(path = '/', width = 1440) {
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[path]}>
          <ThemeProvider>
            <ModalProvider>
              <DesktopWorkspaceProvider><StateHarness /></DesktopWorkspaceProvider>
            </ModalProvider>
          </ThemeProvider>
        </MemoryRouter>
      );
    });
  }

  it('opens one existing app, updates the URL, and restores it through browser history', async () => {
    await renderWorkspace();
    await act(async () => host.querySelectorAll('button')[0].click());
    expect(host.querySelector('[data-testid="location"]').textContent).toBe('/projects');
    expect(host.querySelector('[data-testid="active"]').textContent).toBe('projects');
    await act(async () => host.querySelectorAll('button')[1].click());
    expect(host.querySelector('[data-testid="location"]').textContent).toBe('/gear');
    await act(async () => host.querySelectorAll('button')[3].click());
    expect(host.querySelector('[data-testid="location"]').textContent).toBe('/projects');
    expect(host.querySelector('[data-testid="active"]').textContent).toBe('projects');
    expect(host.querySelectorAll('.desktop-window[aria-labelledby]')).toHaveLength(3);
  });

  it('provides keyboard move and resize controls and restores minimized windows', async () => {
    await renderWorkspace();
    const title = host.querySelector('#desktop-window-title-about');
    const initialLeft = host.querySelector('.desktop-window').style.left;
    await act(async () => host.querySelector('[aria-label="Move About window"]').click());
    title.focus();
    await act(async () => title.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
    expect(host.querySelector('.desktop-window').style.left).not.toBe(initialLeft);

    await act(async () => host.querySelector('.desktop-window-controls [aria-label="Resize About window"]').click());
    title.focus();
    const initialWidth = host.querySelector('.desktop-window').style.width;
    await act(async () => title.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
    expect(host.querySelector('.desktop-window').style.width).not.toBe(initialWidth);

    await act(async () => host.querySelector('[aria-label="Minimize About window"]').click());
    expect(host.querySelector('.desktop-window')).toBeNull();
    await act(async () => host.querySelector('[aria-label="Restore About"]').click());
    expect(host.querySelector('.desktop-window')).not.toBeNull();
  });

  it('switches to 2D at mobile width and recovers to 2D after a 3D failure', async () => {
    await renderWorkspace('/', 1440);
    expect(host.querySelector('[data-testid="view"]').textContent).toBe('desk');
    expect(host.querySelector('[data-testid="fallback"]').textContent).toBe('false');

    await act(async () => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 375 });
      window.dispatchEvent(new Event('resize'));
    });
    expect(host.querySelector('[data-testid="view"]').textContent).toBe('workspace');
    expect(host.querySelector('[data-testid="fallback"]').textContent).toBe('true');

    await act(async () => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 1440 });
      window.dispatchEvent(new Event('resize'));
    });
    expect(host.querySelector('[data-testid="view"]').textContent).toBe('desk');
    expect(host.querySelector('[data-testid="fallback"]').textContent).toBe('false');
    await act(async () => host.querySelectorAll('button')[4].click());
    expect(host.querySelector('[data-testid="view"]').textContent).toBe('workspace');
    expect(host.querySelector('[data-testid="fallback"]').textContent).toBe('true');
    expect(host.querySelector('[data-testid="failure"]').textContent).toBe('true');
  });

  it('closes the image lightbox before the project dialog when Escape is pressed', async () => {
    await act(async () => root.render(<MemoryRouter><ThemeProvider><ModalProvider><OverlayHarness /></ModalProvider></ThemeProvider></MemoryRouter>));
    await act(async () => host.querySelector('button').click());
    expect(host.querySelector('[data-testid="project-open"]').textContent).toBe('true');
    expect(host.querySelector('[data-testid="image-open"]').textContent).toBe('true');
    await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(host.querySelector('[data-testid="image-open"]').textContent).toBe('false');
    expect(host.querySelector('[data-testid="project-open"]').textContent).toBe('true');
    await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(host.querySelector('[data-testid="project-open"]').textContent).toBe('false');
  });
});
