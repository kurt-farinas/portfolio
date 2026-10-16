import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const DESKTOP_APPS = [
  { id: 'my-computer', label: 'My Computer', glyph: 'C', description: 'Browse the portfolio as drives' },
  { id: 'classic', label: 'Classic Portfolio', glyph: 'K', description: 'The editorial version of this portfolio' },
  { id: 'about', label: 'About', glyph: 'K', description: 'Profile and background' },
  { id: 'projects', label: 'Projects', glyph: '▧', description: 'Six projects and case studies' },
  { id: 'experience', label: 'Experience', glyph: '◷', description: 'Career and education' },
  { id: 'stack', label: 'Stack', glyph: '⌘', description: 'Selected technologies' },
  { id: 'recognition', label: 'Recognition', glyph: '✳', description: 'Honors and certifications' },
  { id: 'after-hours', label: 'After Hours', glyph: '▣', description: 'Personal photo collection' },
  { id: 'gear', label: 'Gear & Collections', glyph: '◈', description: 'Desk gear and fragrances' },
  { id: 'resume', label: 'Résumé', glyph: '▤', description: 'Preview and download résumé' },
  { id: 'contact', label: 'Contact', glyph: '↗', description: 'Message composer and profile links' },
  { id: 'kurtordle', label: 'KurtOrdle', glyph: 'W', description: 'Five-letter portfolio mini-game' },
  { id: 'bugsweeper', label: 'Bugsweeper', glyph: 'S', description: 'Find the bugs without stepping on one' },
  { id: 'bughunter', label: 'BugHunter 3D', glyph: 'B', description: 'Fictional raycaster mini-game' },
  { id: 'terminal', label: 'Terminal', glyph: '>', description: 'Simulated portfolio commands' },
  { id: 'credits', label: 'Credits', glyph: 'i', description: 'Verified profile and interface credits' }
];

// Games always open full-window so they are playable straight away.
const GAME_APPS = ['kurtordle', 'bugsweeper', 'bughunter'];
// Long reading apps open maximized on the desktop; Restore keeps each rectangle.
const READING_APPS = ['projects', 'experience', 'resume'];
// Short apps open as windows sized to their content (percent of the window area).
const APP_RECTS = {
  about: { x: 14, y: 3, width: 60, height: 92 },
  recognition: { x: 24, y: 6, width: 60, height: 88 },
  stack: { x: 32, y: 14, width: 56, height: 64 },
  contact: { x: 40, y: 2, width: 54, height: 94 }
};

// Matches the <title> in index.html.
const BASE_TITLE = 'Kurt Fariñas | Junior Full-Stack Developer';

const ROUTE_TO_APP = {
  '/projects': 'projects',
  '/after-hours': 'after-hours',
  '/gear': 'gear',
  '/downtime': 'gear',
  '/outside-the-ide': 'gear'
};

function appFromLocation(pathname, hash) {
  if (ROUTE_TO_APP[pathname]) return ROUTE_TO_APP[pathname];
  const anchor = (hash || '').replace(/^#/, '').split('&')[0];
  if (['my-computer', 'kurtordle', 'bugsweeper', 'bughunter', 'terminal', 'credits'].includes(anchor)) return anchor;
  if (anchor === 'timeline') return 'experience';
  if (anchor === 'skills') return 'stack';
  if (anchor === 'awards') return 'recognition';
  if (anchor === 'resume') return 'resume';
  if (anchor === 'contact') return 'contact';
  if (anchor === 'after-hours') return 'after-hours';
  if (anchor === 'gear') return 'gear';
  if (anchor === 'projects' || anchor.startsWith('pmpc-') || anchor === 'hris' || anchor === 'gym' || anchor === 'job-hunt-ledger') return 'projects';
  // Only a bare "/" or #about means About; any other in-page anchor leaves the active window alone.
  return anchor === '' || anchor === 'about' ? 'about' : null;
}

function pathForApp(appId, currentPath) {
  const paths = {
    about: '/#about',
    'my-computer': '/#my-computer',
    projects: '/projects',
    experience: '/#timeline',
    stack: '/#skills',
    recognition: '/#awards',
    'after-hours': '/after-hours',
    gear: '/gear',
    resume: '/#resume',
    contact: '/#contact',
    kurtordle: '/#kurtordle',
    bugsweeper: '/#bugsweeper',
    bughunter: '/#bughunter',
    terminal: '/#terminal',
    credits: '/#credits'
  };
  const hash = window.location.hash;
  if (appId === 'projects' && currentPath === '/projects' && hash.startsWith('#')) return '/projects' + hash;
  return paths[appId] || '/';
}

function canUseWebGL() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  const largeFine = window.innerWidth >= 1100 && window.matchMedia('(pointer: fine)').matches;
  if (!largeFine) return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) || canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return true;
  } catch {
    return false;
  }
}

export const DesktopWorkspaceContext = createContext(null);

const initialWindow = {
  appId: 'about',
  rect: APP_RECTS.about,
  minimized: false,
  maximized: false
};

export function DesktopWorkspaceProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [windows, setWindows] = useState([initialWindow]);
  const [activeAppId, setActiveAppId] = useState('about');
  const [view, setView] = useState(() => canUseWebGL() && location.pathname === '/' && !location.hash ? 'desk' : 'workspace');
  const [canUse3D, setCanUse3D] = useState(() => canUseWebGL());
  const [sceneFailed, setSceneFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const scrollPositions = useRef(new Map());
  const appStates = useRef(new Map());
  const didSyncRoute = useRef(false);
  // Classic mode swaps the OS for the editorial portfolio; it lasts for the browser session and /classic links straight to it.
  const [classicMode, setClassicMode] = useState(() => {
    if (location.pathname === '/classic') return true;
    try { return sessionStorage.getItem('kurt-os-classic') === 'true'; } catch { return false; }
  });
  const enterClassic = useCallback(() => {
    try { sessionStorage.setItem('kurt-os-classic', 'true'); } catch { /* Session storage is optional. */ }
    setClassicMode(true);
    navigate('/');
  }, [navigate]);
  const exitClassic = useCallback(() => {
    try { sessionStorage.removeItem('kurt-os-classic'); } catch { /* Session storage is optional. */ }
    setClassicMode(false);
    navigate('/');
  }, [navigate]);
  useEffect(() => {
    if (classicMode) document.documentElement.dataset.mode = 'classic';
    else delete document.documentElement.dataset.mode;
    if (classicMode && location.pathname === '/classic') navigate('/', { replace: true });
  }, [classicMode, location.pathname, navigate]);

  useEffect(() => {
    const appId = classicMode ? ROUTE_TO_APP[location.pathname] : activeAppId;
    const app = appId !== 'about' && DESKTOP_APPS.find(item => item.id === appId);
    document.title = app ? app.label + ' | Kurt Fariñas' : BASE_TITLE;
  }, [classicMode, location.pathname, activeAppId]);

  const openApplication = useCallback((appId, options = {}) => {
    if (appId === 'classic') { enterClassic(); return; }
    if (!DESKTOP_APPS.some(app => app.id === appId)) return;
    const maximize = GAME_APPS.includes(appId) || (READING_APPS.includes(appId) && canUse3D);
    // Reopening from the room or monitor maximizes again; the expanded desktop keeps a restored window as the visitor left it.
    const remaximize = maximize && (GAME_APPS.includes(appId) || view === 'desk' || view === 'screen');
    setWindows(current => {
      const found = current.find(windowItem => windowItem.appId === appId);
      if (found) return current.map(windowItem => windowItem.appId === appId ? { ...windowItem, minimized: false, maximized: remaximize || windowItem.maximized } : windowItem);
      const offset = current.length % 6;
      const windowItem = {
        appId,
        rect: APP_RECTS[appId] || { x: Math.min(8 + offset * 2, 18), y: Math.min(4 + offset * 2, 12), width: 78, height: 86 },
        minimized: false,
        maximized: maximize
      };
      return [...current, windowItem];
    });
    setActiveAppId(appId);
    setView(current => current === 'desk' ? 'screen' : current);
    if (options.writeHistory !== false) {
      const nextPath = options.path || pathForApp(appId, location.pathname);
      if (nextPath !== location.pathname + location.hash) navigate(nextPath, { state: { desktopApp: appId } });
    }
  }, [location.pathname, location.hash, navigate, enterClassic, canUse3D, view]);

  useEffect(() => {
    if (classicMode) return;
    const nextApp = appFromLocation(location.pathname, location.hash);
    if (location.pathname === '/' && !location.hash && !didSyncRoute.current) {
      didSyncRoute.current = true;
      return;
    }
    didSyncRoute.current = true;
    if (!nextApp) return;
    setWindows(current => {
      const found = current.find(item => item.appId === nextApp);
      if (found) return current.map(item => item.appId === nextApp ? { ...item, minimized: false } : item);
      return [...current, { appId: nextApp, rect: APP_RECTS[nextApp] || { x: 10, y: 6, width: 78, height: 86 }, minimized: false, maximized: GAME_APPS.includes(nextApp) || (READING_APPS.includes(nextApp) && canUse3D) }];
    });
    setActiveAppId(nextApp);
    if (view === 'desk') setView('screen');
  }, [location.pathname, location.hash]);

  const openWindowApps = windows.map(item => item.appId).join('|');
  useEffect(() => {
    const anchor = location.hash.replace(/^#/, '');
    // About is an app entry, not a biography anchor. Its scroller starts at zero
    // and restores its saved position without re-scrolling on window changes.
    if (!anchor || anchor === 'about') return undefined;
    const appId = appFromLocation(location.pathname, location.hash);
    if (!['about', 'projects', 'experience', 'stack', 'recognition'].includes(appId)) return undefined;
    let frame = 0;
    let attempts = 0;
    const focusAnchor = () => {
      const scrollRoot = document.querySelector('[data-app-scroll="' + appId + '"]');
      const byId = document.getElementById(anchor);
      const target = scrollRoot && byId && scrollRoot.contains(byId) ? byId : null;
      if (target) {
        target.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'instant' : 'smooth' });
      } else if (attempts < 8) {
        attempts += 1;
        frame = window.requestAnimationFrame(focusAnchor);
      }
    };
    frame = window.requestAnimationFrame(focusAnchor);
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash, activeAppId, openWindowApps, reducedMotion]);

  useEffect(() => {
    const largeQuery = window.matchMedia('(min-width: 1100px) and (pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let wasAvailable = canUse3D;
    const updateDisplay = () => {
      const available = largeQuery.matches && canUseWebGL();
      setCanUse3D(available);
      if (!available) setView('workspace');
      else if (!wasAvailable && window.location.pathname === '/' && !window.location.hash) setView('desk');
      wasAvailable = available;
    };
    const updateMotion = () => setReducedMotion(motionQuery.matches);
    largeQuery.addEventListener('change', updateDisplay);
    motionQuery.addEventListener('change', updateMotion);
    window.addEventListener('resize', updateDisplay);
    return () => {
      largeQuery.removeEventListener('change', updateDisplay);
      motionQuery.removeEventListener('change', updateMotion);
      window.removeEventListener('resize', updateDisplay);
    };
  }, []);

  const focusMonitor = useCallback(() => setView(canUse3D ? 'screen' : 'workspace'), [canUse3D]);
  const showDesk = useCallback(() => setView(canUse3D && !sceneFailed ? 'desk' : 'workspace'), [canUse3D, sceneFailed]);
  const expandDesktop = useCallback(() => setView('expanded'), []);
  const backToMonitor = useCallback(() => setView(canUse3D ? 'screen' : 'workspace'), [canUse3D]);
  const failScene = useCallback(() => {
    setSceneFailed(true);
    setCanUse3D(false);
    setView('workspace');
  }, []);

  const closeApplication = useCallback(appId => {
    setWindows(current => current.filter(item => item.appId !== appId));
    setActiveAppId(current => current === appId ? (windows.findLast(item => item.appId !== appId && !item.minimized)?.appId || null) : current);
  }, [windows]);
  const minimizeApplication = useCallback(appId => {
    setWindows(current => current.map(item => item.appId === appId ? { ...item, minimized: true } : item));
    setActiveAppId(current => current === appId ? (windows.findLast(item => item.appId !== appId && !item.minimized)?.appId || null) : current);
  }, [windows]);
  const restoreApplication = useCallback(appId => openApplication(appId), [openApplication]);
  const maximizeApplication = useCallback(appId => {
    setWindows(current => current.map(item => item.appId === appId ? { ...item, maximized: !item.maximized } : item));
    setActiveAppId(appId);
  }, []);
  const updateWindowRect = useCallback((appId, rect) => {
    setWindows(current => current.map(item => item.appId === appId ? { ...item, rect: { ...item.rect, ...rect } } : item));
  }, []);
  const saveScrollPosition = useCallback((appId, scrollTop) => scrollPositions.current.set(appId, scrollTop), []);
  const getScrollPosition = useCallback(appId => scrollPositions.current.get(appId) || 0, []);
  const getAppState = useCallback((key, fallback) => appStates.current.has(key) ? appStates.current.get(key) : fallback, []);
  const setAppState = useCallback((key, state) => appStates.current.set(key, state), []);

  const value = useMemo(() => ({
    apps: DESKTOP_APPS, windows, activeAppId, view, canUse3D, sceneFailed, reducedMotion, classicMode, enterClassic, exitClassic,
    openApplication, closeApplication, minimizeApplication, maximizeApplication, restoreApplication,
    updateWindowRect, setActiveAppId, focusMonitor, showDesk, expandDesktop, backToMonitor, failScene,
    saveScrollPosition, getScrollPosition, getAppState, setAppState
  }), [windows, activeAppId, view, canUse3D, sceneFailed, reducedMotion, classicMode, enterClassic, exitClassic, openApplication, closeApplication, minimizeApplication, maximizeApplication, restoreApplication, updateWindowRect, focusMonitor, showDesk, expandDesktop, backToMonitor, failScene, saveScrollPosition, getScrollPosition, getAppState, setAppState]);

  return <DesktopWorkspaceContext.Provider value={value}>{children}</DesktopWorkspaceContext.Provider>;
}

export function useDesktopWorkspace() {
  const context = useContext(DesktopWorkspaceContext);
  if (!context) throw new Error('useDesktopWorkspace must be used within DesktopWorkspaceProvider');
  return context;
}

export function useOptionalDesktopWorkspace() {
  return useContext(DesktopWorkspaceContext);
}
