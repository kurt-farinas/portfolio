import React, { lazy, Suspense, useCallback, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ModalProvider, useModal } from './context/ModalContext';
import { DesktopWorkspaceProvider, useDesktopWorkspace } from './context/DesktopWorkspaceContext';
import { RetroOSProvider, useRetroOS } from './context/RetroOSContext';
import BootScreen from './components/desktop/BootScreen';

import CustomCursor from './components/common/CustomCursor';
import ProjectModal from './components/common/ProjectModal';
import ResumeModal from './components/common/ResumeModal';
import ScreenshotLightbox from './components/common/ScreenshotLightbox';
import CommandPalette from './components/common/CommandPalette';
import AskOverlay, { AskProvider } from './components/common/AskOverlay';
import ToastContainer from './components/common/ToastContainer';
import DesktopWorkspace from './components/desktop/DesktopWorkspace';
import ClassicPortfolio from './pages/ClassicPortfolio';
import { Analytics } from '@vercel/analytics/react';

const LazyDeskScene = lazy(() => import('./components/desktop/DeskScene'));

class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    this.props.onFailure(error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const LOADER_BLOCKS = 12;
// A Win98-style "copying files" dialog; blocks fill by stage and the next one blinks while it works.
function DeskLoading({ stage, onUse2D }) {
  const lit = stage === 'module' ? 4 : 9;
  return (
    <div className="desk-loading" data-loading-stage={stage}>
      <div className="desk-loading-dialog">
        <p className="desk-loading-title"><span className="desk-loading-mark" aria-hidden="true">KF</span>Kurt-OS Setup</p>
        <div className="desk-loading-body">
          <p role="status" aria-live="polite">{stage === 'module' ? 'Loading the 3D room…' : 'Preparing room photos and materials…'}</p>
          <div className="desk-loading-bar" aria-hidden="true">{Array.from({ length: LOADER_BLOCKS }, (_, index) => <i key={index} className={index < lit ? 'is-lit' : index === lit ? 'is-next' : undefined} />)}</div>
          <div className="desk-loading-actions">
            <button type="button" className="desktop-toolbar-button" onClick={onUse2D}>Use 2D desktop</button>
            <a className="desktop-toolbar-button" href="/resume.pdf" target="_blank" rel="noopener noreferrer">Open résumé PDF</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// This session persists between room/monitor views, and resets when the canvas remounts.
function RoomScene({ onUse2D, ...props }) {
  const [stage, setStage] = useState('module');
  const onLoading = useCallback(() => setStage('assets'), []);
  const onReady = useCallback(() => setStage('ready'), []);
  return <>
    <Suspense fallback={null}>
      <SceneErrorBoundary onFailure={props.onSceneFailure}>
        <LazyDeskScene {...props} onLoading={onLoading} onReady={onReady} />
      </SceneErrorBoundary>
    </Suspense>
    {stage !== 'ready' && <DeskLoading stage={stage} onUse2D={onUse2D} />}
  </>;
}

function ImmersivePortfolio() {
  const retro = useRetroOS();
  const { theme, toggleTheme } = useTheme();
  const {
    view, canUse3D, sceneFailed, reducedMotion, openApplication, focusMonitor, showDesk, expandDesktop, failScene
  } = useDesktopWorkspace();
  const { openResumeModal, toggleCommandPalette } = useModal();
  const [sceneRetryKey, setSceneRetryKey] = useState(0);
  const onSceneFailure = useCallback(() => {
    failScene();
    setSceneRetryKey(value => value + 1);
  }, [failScene]);

  const renderScene = canUse3D && !sceneFailed && (view === 'desk' || view === 'screen');
  const presentation = view === 'workspace' ? 'workspace' : 'expanded';

  return (
    <div className={'immersive-portfolio-shell theme-' + theme} data-view={view} onKeyDownCapture={event => {
      if (retro.bootOpen && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); event.stopPropagation(); return; }
      retro.pressKey(event);
    }}>
      <CustomCursor />
      {renderScene && (
        <>
          <div className="desk-scene-stage" aria-label={view === 'desk' ? 'Interactive 3D desk. Click the monitor or use Open desktop.' : 'Focused view of the portfolio desktop on the monitor.'}>
            <RoomScene
              key={sceneRetryKey}
              onUse2D={expandDesktop}
              view={view}
              theme={theme}
              reducedMotion={reducedMotion}
              onOpenDesktop={focusMonitor}
              onOpenApp={appId => openApplication(appId)}
              onOpenResume={openResumeModal}
              toggleTheme={toggleTheme}
              onBackToDesk={showDesk}
              onSceneFailure={onSceneFailure}
            />
          </div>

          {view === 'desk' && (
            <main className="desk-welcome">
              <div className="desk-welcome-copy">
                <p className="desktop-eyebrow">KURT FARIÑAS<br />JUNIOR FULL-STACK DEVELOPER</p>
                <h1>A closer look at how I work.</h1>
                <div className="desk-welcome-actions">
                  <button type="button" className="studio-action" onClick={focusMonitor}>Open desktop</button>
                  <button type="button" className="studio-action studio-action-outline" onClick={() => openApplication('projects')}>Projects</button>
                </div>
                <a className="desk-text-action desk-welcome-resume" href="/resume.pdf" target="_blank" rel="noopener noreferrer">Résumé PDF <span aria-hidden="true">↗</span></a>
              </div>
              <div className="desk-welcome-toolbar">
                <button type="button" className="desktop-toolbar-button desk-icon-button" onClick={toggleCommandPalette} aria-label="Search portfolio apps (Ctrl K)" title="Search  Ctrl K">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </button>
                <button type="button" className="desktop-toolbar-button desk-icon-button" onClick={toggleTheme} aria-label={'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme'} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
                  {theme === 'dark'
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>}
                </button>
              </div>
              <p className="desk-scene-hint">Drag to look around · Click an object to open its app</p>
            </main>
          )}

        </>
      )}

      {!renderScene && (
        <DesktopWorkspace
          presentation={presentation}
          theme={theme}
          toggleTheme={toggleTheme}
          openResumeModal={openResumeModal}
          onBackToDesk={showDesk}
        />
      )}

      <ProjectModal />
      <ResumeModal />
      <ScreenshotLightbox />
      <CommandPalette />
      <ToastContainer />
      <BootScreen />
      <Analytics />
    </div>
  );
}

function PortfolioView() {
  return useDesktopWorkspace().classicMode ? <ClassicPortfolio /> : <ImmersivePortfolio />;
}

function AppContent() {
  return (
    <DesktopWorkspaceProvider>
      <RetroOSProvider><AskProvider><PortfolioView /><AskOverlay /></AskProvider></RetroOSProvider>
    </DesktopWorkspaceProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ModalProvider>
          <AppContent />
        </ModalProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
