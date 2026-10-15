import React, { useCallback, useEffect, useRef, useState } from 'react';
import DesktopAppContent from './DesktopAppContent';
import { useDesktopWorkspace } from '../../context/DesktopWorkspaceContext';
import { useModal } from '../../context/ModalContext';
import { useRetroOS } from '../../context/RetroOSContext';
import RetroIcon from './RetroIcon';
import useMinuteClock, { formatClock } from './useMinuteClock';

function TaskbarClock() {
  const now = useMinuteClock();
  return <time className="desktop-taskbar-clock" dateTime={now.toISOString()}>{formatClock(now)}</time>;
}

function DesktopIcon({ app, openApplication, compact = false }) {
  return (
    <button type="button" className={'desktop-icon' + (compact ? ' desktop-icon-compact' : '')} onClick={() => openApplication(app.id)} aria-label={'Open ' + app.label} title={app.description}>
      <span className="desktop-icon-glyph" aria-hidden="true"><RetroIcon id={app.id} /></span>
      <span className="desktop-icon-label">{app.label}</span>
    </button>
  );
}

function DesktopWindow({ appId, app, item, active, areaRef }) {
  const { setActiveAppId, closeApplication, minimizeApplication, maximizeApplication, updateWindowRect } = useDesktopWorkspace();
  const titleRef = useRef(null);
  const dragRef = useRef(null);
  const [keyboardMode, setKeyboardMode] = useState('');

  const movePointer = useCallback(event => {
    const drag = dragRef.current;
    const area = areaRef.current;
    if (!drag || !area) return;
    const bounds = area.getBoundingClientRect();
    const dx = ((event.clientX - drag.startX) / bounds.width) * 100;
    const dy = ((event.clientY - drag.startY) / bounds.height) * 100;
    if (drag.kind === 'move') {
      updateWindowRect(appId, {
        x: Math.max(0, Math.min(100 - item.rect.width, drag.rect.x + dx)),
        y: Math.max(0, Math.min(100 - item.rect.height, drag.rect.y + dy))
      });
    } else {
      updateWindowRect(appId, {
        width: Math.max(32, Math.min(100 - item.rect.x, drag.rect.width + dx)),
        height: Math.max(36, Math.min(100 - item.rect.y, drag.rect.height + dy))
      });
    }
  }, [appId, areaRef, item.rect, updateWindowRect]);

  useEffect(() => {
    const finish = () => { dragRef.current = null; };
    document.addEventListener('pointermove', movePointer);
    document.addEventListener('pointerup', finish);
    document.addEventListener('pointercancel', finish);
    return () => {
      document.removeEventListener('pointermove', movePointer);
      document.removeEventListener('pointerup', finish);
      document.removeEventListener('pointercancel', finish);
    };
  }, [movePointer]);

  const beginPointerOperation = (event, kind) => {
    if (event.button !== 0) return;
    event.preventDefault();
    setActiveAppId(appId);
    const area = areaRef.current;
    if (!area) return;
    dragRef.current = {
      kind,
      startX: event.clientX,
      startY: event.clientY,
      rect: { ...item.rect }
    };
  };

  const runKeyboardOperation = event => {
    if (!keyboardMode) return;
    if (event.key === 'Escape' || event.key === 'Enter') {
      event.preventDefault();
      setKeyboardMode('');
      return;
    }
    const direction = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1]
    }[event.key];
    if (!direction) return;
    event.preventDefault();
    const step = event.shiftKey ? 5 : 2;
    const dx = direction[0] * step;
    const dy = direction[1] * step;
    if (keyboardMode === 'move') {
      updateWindowRect(appId, { x: Math.max(0, Math.min(100 - item.rect.width, item.rect.x + dx)), y: Math.max(0, Math.min(100 - item.rect.height, item.rect.y + dy)) });
    } else {
      updateWindowRect(appId, { width: Math.max(32, Math.min(100 - item.rect.x, item.rect.width + dx)), height: Math.max(36, Math.min(100 - item.rect.y, item.rect.height + dy)) });
    }
  };

  const setOperation = mode => {
    setKeyboardMode(mode);
    titleRef.current?.focus();
  };

  return (
    <section
      className={'desktop-window' + (active ? ' is-active' : '') + (item.maximized ? ' is-maximized' : '')}
      data-app-id={appId}
      style={item.maximized ? undefined : { left: item.rect.x + '%', top: item.rect.y + '%', width: item.rect.width + '%', height: item.rect.height + '%' }}
      aria-labelledby={'desktop-window-title-' + appId}
      aria-hidden={item.minimized || undefined}
      hidden={item.minimized}
      onPointerDown={() => setActiveAppId(appId)}
      onFocusCapture={() => setActiveAppId(appId)}
    >
      <header className="desktop-window-titlebar" onPointerDown={event => beginPointerOperation(event, 'move')}>
        <h2 id={'desktop-window-title-' + appId} ref={titleRef} tabIndex={0} onKeyDown={runKeyboardOperation} aria-describedby={keyboardMode ? 'desktop-window-keyboard-help' : undefined}>
          <span className="desktop-window-glyph" aria-hidden="true"><RetroIcon id={app.id} /></span>
          {app.label}
        </h2>
        <div className="desktop-window-controls" aria-label={app.label + ' window controls'}>
          <button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => setOperation('move')} aria-label={'Move ' + app.label + ' window'} title="Move with arrow keys">↕</button>
          <button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => setOperation('resize')} aria-label={'Resize ' + app.label + ' window'} title="Resize with arrow keys">⤢</button>
          <button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => minimizeApplication(appId)} aria-label={'Minimize ' + app.label + ' window'} title="Minimize">−</button>
          <button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => maximizeApplication(appId)} aria-label={(item.maximized ? 'Restore ' : 'Maximize ') + app.label + ' window'} title={item.maximized ? 'Restore' : 'Maximize'}>{item.maximized ? '❐' : '□'}</button>
          <button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => closeApplication(appId)} aria-label={'Close ' + app.label + ' window'} title="Close">×</button>
        </div>
      </header>
      {keyboardMode && <p id="desktop-window-keyboard-help" className="desktop-window-keyboard-help" role="status">{keyboardMode === 'move' ? 'Move' : 'Resize'} with arrow keys. Shift moves farther. Enter or Escape ends keyboard control.</p>}
      <DesktopAppContent appId={appId} />
      {!item.maximized && <button type="button" className="desktop-window-resize-handle" aria-label={'Resize ' + app.label + ' window'} onPointerDown={event => beginPointerOperation(event, 'resize')} onKeyDown={runKeyboardOperation} title="Drag to resize. Choose Resize for keyboard controls.">⤡</button>}
    </section>
  );
}

export default function DesktopWorkspace({ presentation = 'expanded', toggleTheme, theme, onBackToDesk }) {
  const { apps, windows, activeAppId, openApplication, setActiveAppId, restoreApplication, focusMonitor, backToMonitor, expandDesktop, canUse3D, sceneFailed } = useDesktopWorkspace();
  const { toggleCommandPalette } = useModal();
  const retro = useRetroOS();
  const areaRef = useRef(null);
  const menuRef = useRef(null);
  const startRef = useRef(null);
  const [appsOpen, setAppsOpen] = useState(false);
  const appById = new Map(apps.map(app => [app.id, app]));
  const visibleWindows = windows.filter(item => !item.minimized);
  useEffect(() => { if (appsOpen) menuRef.current?.querySelector('button')?.focus({ preventScroll: true }); }, [appsOpen]);
  const chooseApp = appId => { retro.powerOn(); openApplication(appId); setAppsOpen(false); };
  const closeMenu = event => {
    if (event.key === 'Escape' && appsOpen) { event.preventDefault(); event.stopPropagation(); setAppsOpen(false); startRef.current?.focus(); }
  };
  return (
    <section className={'desktop-workspace desktop-workspace-' + presentation} aria-label="Kurt Fariñas portfolio desktop" data-testid="desktop-workspace" data-wallpaper={retro.wallpaper} data-crt={retro.crtEffects || undefined} onKeyDown={closeMenu}>
      {/* Ordered-dither texture over the wallpaper colour, like a 256-colour desktop. */}
      <svg className="retro-wallpaper-dither" width="100%" height="100%" aria-hidden="true"><defs><pattern id={'dither-' + presentation} width="4" height="4" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="var(--retro-dither-light)" /><rect x="2" y="2" width="1" height="1" fill="var(--retro-dither-light)" /><rect x="2" width="1" height="1" fill="var(--retro-dither-dark)" /><rect y="2" width="1" height="1" fill="var(--retro-dither-dark)" /></pattern></defs><rect width="100%" height="100%" fill={'url(#dither-' + presentation + ')'} /></svg>
      <div className="retro-desktop-content" inert={!retro.monitorOn ? true : undefined}>
        <header className="desktop-menubar">
          <button type="button" className="desktop-brand" onClick={() => chooseApp('about')} aria-label="Open About app"><span className="desktop-brand-mark">KF</span><span>Kurt-OS</span></button>
          <button type="button" className="desktop-toolbar-button desktop-apps-button" onClick={() => setAppsOpen(value => !value)} aria-expanded={appsOpen} aria-controls="retro-start-menu">Apps</button>
          <div className="desktop-menubar-context">Portfolio desktop</div>
          <div className="desktop-menubar-actions">
            {['screen', 'expanded'].includes(presentation) && canUse3D && <button type="button" className="desktop-toolbar-button" onClick={onBackToDesk} aria-label="Back to desk">Back to desk</button>}
            {presentation === 'screen' && <button type="button" className="desktop-toolbar-button" onClick={expandDesktop}>Expand desktop</button>}
            {presentation === 'expanded' && canUse3D && <button type="button" className="desktop-toolbar-button" onClick={backToMonitor}>Back to monitor</button>}
            {presentation === 'workspace' && canUse3D && <button type="button" className="desktop-toolbar-button" onClick={focusMonitor}>Open desk</button>}
            {toggleTheme && <button type="button" className="desktop-toolbar-button" onClick={toggleTheme} aria-label={'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme'}>{theme === 'dark' ? 'Light' : 'Dark'}</button>}
            <button type="button" className="desktop-toolbar-button desktop-command-button" onClick={toggleCommandPalette} aria-label="Open app search">Search <kbd>Ctrl K</kbd></button>
          </div>
        </header>
        {sceneFailed && <p className="desktop-fallback-note" role="status">The 3D desk is unavailable here. The portfolio desktop is ready.</p>}
        <div id="desktop-launcher" className={'desktop-launcher' + (appsOpen ? ' is-open' : '')} hidden={appsOpen} aria-label="Applications">{apps.map(app => <DesktopIcon key={app.id} app={app} openApplication={chooseApp} />)}</div>
        <div className="desktop-window-area" ref={areaRef} aria-label="Open application windows" onPointerDown={() => setAppsOpen(false)}>
          {visibleWindows.map(item => {
            const app = appById.get(item.appId);
            return app ? <DesktopWindow key={app.id} appId={app.id} app={app} item={item} active={activeAppId === app.id} areaRef={areaRef} /> : null;
          })}
          {visibleWindows.length === 0 && <div className="desktop-empty-state"><h1>Choose an app to open</h1><p>Use Start or the desktop shortcuts.</p></div>}
        </div>
        {appsOpen && <nav id="retro-start-menu" className="retro-start-menu" aria-label="Start menu" ref={menuRef}>
          <div className="retro-start-banner">KURT-OS</div><div className="retro-start-items">
            <p>Portfolio</p>{apps.slice(0,9).map(app => <DesktopIcon key={app.id} app={app} openApplication={chooseApp} />)}
            <p>Extras</p>{apps.slice(9).map(app => <DesktopIcon key={app.id} app={app} openApplication={chooseApp} />)}
            <p>Settings</p>
            <button type="button" onClick={retro.toggleSound} aria-pressed={retro.soundEnabled}>Sound: {retro.soundEnabled ? 'On' : 'Off'}</button>
            <button type="button" onClick={retro.toggleCrt} aria-pressed={retro.crtEffects}>CRT effects: {retro.crtEffects ? 'On' : 'Off'}</button>
            <button type="button" onClick={retro.toggleLamp} aria-pressed={retro.warmLamp}>Desk lamp: {retro.warmLamp ? 'On' : 'Off'}</button>
            <button type="button" onClick={retro.cycleWallpaper}>Wallpaper: {['Teal','Blue','Plum'][retro.wallpaper]}</button>
            <button type="button" onClick={() => { retro.togglePower(); setAppsOpen(false); }}>Turn monitor off</button>
            <button type="button" onClick={() => { setAppsOpen(false); retro.replayBoot(); }}>Replay boot</button>
            {retro.soundError && <p role="status">{retro.soundError}</p>}
          </div>
        </nav>}
        <nav className="desktop-taskbar" aria-label="Open applications">
          <button ref={startRef} type="button" className="desktop-taskbar-home" onClick={() => setAppsOpen(value => !value)} aria-label="Open application list" aria-expanded={appsOpen}>Start</button>
          <div className="desktop-taskbar-apps">{windows.map(item => {
            const app = appById.get(item.appId);
            return app ? <button type="button" key={item.appId} className={'desktop-taskbar-item' + (activeAppId === item.appId && !item.minimized ? ' is-active' : '')} onClick={() => { retro.powerOn(); item.minimized || activeAppId !== item.appId ? restoreApplication(item.appId) : setActiveAppId(item.appId); }} aria-pressed={activeAppId === item.appId && !item.minimized} aria-label={(item.minimized ? 'Restore ' : 'Focus ') + app.label} title={app.label}><RetroIcon id={app.id} /><span className="desktop-taskbar-label">{app.label}</span></button> : null;
          })}</div>
          <button type="button" className="desktop-taskbar-item desktop-taskbar-sound" onClick={retro.toggleSound} aria-pressed={retro.soundEnabled} aria-label={retro.soundEnabled ? 'Mute sound' : 'Turn sound on'} title={retro.soundEnabled ? 'Sound on' : 'Sound off'}>
            <svg width="18" height="18" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M2 6h3l4-3v10l-4-3H2z" />{retro.soundEnabled ? <path fill="currentColor" d="M11 5h1v6h-1zM13 3h1v10h-1z" /> : <path fill="currentColor" d="M11 6h1v1h-1zM12 7h1v1h-1zM13 8h1v1h-1zM14 9h1v1h-1zM14 6h1v1h-1zM13 7h1v1h-1zM12 8h1v1h-1zM11 9h1v1h-1z" />}</svg>
          </button><TaskbarClock />
        </nav>
        {retro.crtEffects && <>
          <svg className="retro-scanlines" width="100%" height="100%" aria-hidden="true"><defs><pattern id={'scanlines-' + presentation} width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 0H3" stroke="var(--retro-scanline)" strokeWidth="1" /></pattern></defs><rect width="100%" height="100%" fill={'url(#scanlines-' + presentation + ')'} /></svg>
          <div className="retro-crt-vignette" aria-hidden="true" />
        </>}
      </div>
      {!retro.monitorOn && <div className="retro-monitor-off"><p>Monitor is off. Your apps are preserved.</p><button type="button" onClick={retro.powerOn}>Power on monitor</button>{canUse3D && <button type="button" onClick={onBackToDesk}>Back to desk</button>}<a href="/resume.pdf" target="_blank" rel="noopener noreferrer">Open résumé PDF</a></div>}
    </section>
  );
}

export { DesktopIcon };
