import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DesktopWorkspaceProvider, useDesktopWorkspace } from '../src/context/DesktopWorkspaceContext';
import RoomPicture, { ROOM_HOTSPOTS } from '../src/components/desktop/RoomPicture';

describe('room picture for PCs without WebGL', () => {
  let host, root, seen, originalWidth, originalMedia;
  const Probe = () => { const { canUse3D, roomPicture, view } = useDesktopWorkspace(); seen = { canUse3D, roomPicture, view }; return null; };
  const mountAt = async width => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
    await act(async () => root.render(<MemoryRouter initialEntries={['/']}><DesktopWorkspaceProvider><Probe /></DesktopWorkspaceProvider></MemoryRouter>));
  };
  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    originalWidth = window.innerWidth; originalMedia = window.matchMedia;
    window.matchMedia = query => ({ matches: /pointer: fine/.test(query) && window.innerWidth >= 1100, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  });
  afterEach(async () => {
    await act(async () => root.unmount()); host.remove();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth }); window.matchMedia = originalMedia;
    vi.restoreAllMocks(); vi.unstubAllGlobals();
  });

  it('large screen without WebGL starts on the room picture', async () => {
    await mountAt(1440);
    expect(seen).toEqual({ canUse3D: false, roomPicture: true, view: 'desk' });
  });

  it('small screen without WebGL stays on the 2D desktop', async () => {
    await mountAt(800);
    expect(seen).toEqual({ canUse3D: false, roomPicture: false, view: 'workspace' });
  });

  it('a slow room can switch to the lighter picture view', async () => {
    HTMLCanvasElement.prototype.getContext.mockReturnValue({ getExtension: () => null });
    let switchToLighterRoom;
    const Grab = () => { switchToLighterRoom = useDesktopWorkspace().switchToLighterRoom; return null; };
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
    await act(async () => root.render(<MemoryRouter initialEntries={['/']}><DesktopWorkspaceProvider><Probe /><Grab /></DesktopWorkspaceProvider></MemoryRouter>));
    expect(seen).toEqual({ canUse3D: true, roomPicture: false, view: 'desk' });
    await act(async () => switchToLighterRoom());
    expect(seen).toEqual({ canUse3D: false, roomPicture: true, view: 'desk' });
    await act(async () => window.dispatchEvent(new Event('resize')));
    expect(seen.roomPicture).toBe(true);
  });

  it('room picture hotspots open apps and the desktop', async () => {
    const onOpenApp = vi.fn(), onOpenDesktop = vi.fn();
    await act(async () => root.render(<RoomPicture theme="dark" onOpenApp={onOpenApp} onOpenDesktop={onOpenDesktop} />));
    expect(host.querySelectorAll('.room-picture-spot')).toHaveLength(ROOM_HOTSPOTS.length);
    await act(async () => host.querySelector('[aria-label="Open Projects"]').click());
    expect(onOpenApp).toHaveBeenCalledWith('projects');
    await act(async () => host.querySelector('[aria-label="Open desktop"]').click());
    expect(onOpenDesktop).toHaveBeenCalledTimes(1);
  });
});
