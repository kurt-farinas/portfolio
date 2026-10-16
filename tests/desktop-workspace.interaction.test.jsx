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
      <button onClick={workspace.focusMonitor}>Focus monitor</button>
      <button onClick={() => workspace.openApplication('bugsweeper')}>Open bugsweeper</button>
      <button onClick={() => workspace.openApplication('my-computer')}>Open my computer</button>
      <button onClick={() => workspace.openApplication('experience')}>Open experience</button>
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
    expect(document.title).toBe('Projects | Kurt Fariñas');
    await act(async () => host.querySelectorAll('button')[1].click());
    expect(host.querySelector('[data-testid="location"]').textContent).toBe('/gear');
    await act(async () => host.querySelectorAll('button')[3].click());
    expect(host.querySelector('[data-testid="location"]').textContent).toBe('/projects');
    expect(host.querySelector('[data-testid="active"]').textContent).toBe('projects');
    expect(host.querySelectorAll('.desktop-window[aria-labelledby]')).toHaveLength(3);
  });

  it('maximizes Projects in the monitor and preserves its restore rectangle on reopening', async () => {
    await renderWorkspace();
    await act(async () => host.querySelector('[data-testid="active"]').parentNode.querySelector('button').click());
    const projectWindow = () => host.querySelector('#desktop-window-title-projects').closest('.desktop-window');
    expect(projectWindow().classList.contains('is-maximized')).toBe(true);
    await act(async () => host.querySelector('[aria-label="Restore Projects window"]').click());
    const restoredStyle = projectWindow().getAttribute('style');
    expect(projectWindow().classList.contains('is-maximized')).toBe(false);
    await act(async () => host.querySelector('[aria-label="Minimize Projects window"]').click());
    await act(async () => host.querySelector('[aria-label="Restore Projects"]').click());
    expect(projectWindow().classList.contains('is-maximized')).toBe(true);
    await act(async () => host.querySelector('[aria-label="Restore Projects window"]').click());
    expect(projectWindow().getAttribute('style')).toBe(restoredStyle);
    expect(host.querySelector('#desktop-window-title-about').closest('.desktop-window').classList.contains('is-maximized')).toBe(false);
  });

  it('keeps mobile Projects opening behavior unchanged', async () => {
    await renderWorkspace('/', 375);
    await act(async () => host.querySelector('button').click());
    expect(host.querySelector('#desktop-window-title-projects').closest('.desktop-window').classList.contains('is-maximized')).toBe(false);
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

  it('opens compact project evidence from the mobile workstation without dropping credibility or details access', async () => {
    await renderWorkspace('/', 375);
    const shortcut = host.querySelector('.mobile-workbench-shortcuts button');
    await act(async () => shortcut.click());
    expect(host.querySelector('[data-testid="active"]').textContent).toBe('projects');
    const entries = host.querySelectorAll('.studio-project-detail');
    expect(entries).toHaveLength(6);
    expect(entries[0].firstElementChild.tagName).toBe('FIGURE');
    expect(host.querySelectorAll('.project-quick-read')).toHaveLength(6);
    expect(host.querySelector('.studio-project-detail-highlights')).toBeNull();
    expect(host.querySelector('#hris').textContent).toContain('98/100');
    expect(host.querySelector('#hris').textContent).toContain('342');
    expect(host.querySelector('#pmpc-workforce').textContent).toContain('Deployed improvements');
    expect(host.querySelector('#pmpc-workforce').textContent).toContain('HR account-setup');
    expect(host.querySelectorAll('.studio-project-detail-actions button')).toHaveLength(6);
    expect(host.querySelector('.portfolio-engineering-details summary').textContent).toBe('How this portfolio works');
  });

  it('keeps the monitor view while resizing within desktop eligibility', async () => {
    await renderWorkspace();
    await act(async () => [...host.querySelectorAll('button')].find(button => button.textContent === 'Focus monitor').click());
    expect(host.querySelector('[data-testid="view"]').textContent).toBe('screen');
    await act(async () => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 1366 });
      window.dispatchEvent(new Event('resize'));
    });
    expect(host.querySelector('[data-testid="view"]').textContent).toBe('screen');
  });

  it('raises a covered window when keyboard focus enters its content', async () => {
    await renderWorkspace();
    await act(async () => host.querySelector('button').click());
    expect(host.querySelector('[data-testid="active"]').textContent).toBe('projects');
    await act(async () => host.querySelector('[data-app-id="about"] a').focus());
    expect(host.querySelector('[data-testid="active"]').textContent).toBe('about');
    expect(host.querySelector('[data-app-id="about"]').classList.contains('is-active')).toBe(true);
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

  it('keeps the clicked app active instead of jumping back to About', async () => {
    await renderWorkspace('/', 1440);
    const click = async label => act(async () => [...host.querySelectorAll('button')].find(button => button.textContent === label).click());
    for (const [label, appId] of [['Open bugsweeper', 'bugsweeper'], ['Open my computer', 'my-computer']]) {
      await click('Open projects');
      expect(host.querySelector('[data-testid="active"]').textContent).toBe('projects');
      await click(label);
      expect(host.querySelector('[data-testid="active"]').textContent).toBe(appId);
    }
  });

  it('opens reading apps maximized on the desktop but not as extras', async () => {
    await renderWorkspace('/', 1440);
    const click = async label => act(async () => [...host.querySelectorAll('button')].find(button => button.textContent === label).click());
    await click('Open experience');
    expect(host.querySelector('[data-app-id="experience"]').classList.contains('is-maximized')).toBe(true);
    await click('Open my computer');
    expect(host.querySelector('[data-app-id="my-computer"]').classList.contains('is-maximized')).toBe(false);
  });

  it('opens games full-window', async () => {
    await renderWorkspace('/', 1440);
    await act(async () => [...host.querySelectorAll('button')].find(button => button.textContent === 'Open bugsweeper').click());
    expect(host.querySelector('[data-app-id="bugsweeper"]').classList.contains('is-maximized')).toBe(true);
  });

  it('starts About at the profile and preserves its scroll through app switches and remounts', async () => {
    await renderWorkspace('/#about', 375);
    await act(async () => new Promise(resolve => requestAnimationFrame(resolve)));
    const scroll = () => host.querySelector('[data-app-scroll="about"]');
    expect(scroll().scrollTop).toBe(0);
    expect(scroll().querySelector('#about').className).toBe('desktop-about-app');
    expect(scroll().querySelectorAll('.studio-about-lead')).toHaveLength(2);
    await act(async () => {
      scroll().scrollTop = 120;
      scroll().dispatchEvent(new Event('scroll', { bubbles: true }));
    });
    await act(async () => [...host.querySelectorAll('button')].find(button => button.textContent === 'Open projects').click());
    await act(async () => [...host.querySelectorAll('button')].find(button => button.textContent === 'Browser back').click());
    expect(scroll().scrollTop).toBe(120);
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
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
