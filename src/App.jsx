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

function DeskLoading({ stage, onUse2D }) {
  return (
    <div className="desk-loading" data-loading-stage={stage}>
      <span className="desk-loading-mark" aria-hidden="true">KF</span>
      <p role="status" aria-live="polite">{stage === 'module' ? 'Loading the 3D room…' : 'Preparing room photos and materials…'}</p>
      <div className="desk-loading-actions">
        <button type="button" className="studio-action" onClick={onUse2D}>Use 2D desktop</button>
        <a className="studio-action studio-action-outline" href="/resume.pdf" target="_blank" rel="noopener noreferrer">Open résumé PDF</a>
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
    <div className={'immersive-portfolio-shell theme-' + theme} data-view={view} onPointerDownCapture={() => retro.playSound('click')} onKeyDownCapture={event => {
      if (retro.bootOpen && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); event.stopPropagation(); return; }
      retro.pressKey(event.key);
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
                <p className="desktop-eyebrow">KURT FARIÑAS · PORTFOLIO</p>
                <h1>A closer look at how I work.</h1>
                <p>Open the desktop to explore my projects, experience, and workbench.</p>
                <div className="desk-welcome-actions">
                  <button type="button" className="studio-action" onClick={focusMonitor}>Open desktop</button>
                  <button type="button" className="studio-action studio-action-outline" onClick={() => openApplication('projects')}>View projects</button>
                  <button type="button" className="desk-text-action" onClick={() => openApplication('resume')}>Résumé app <span aria-hidden="true">↗</span></button>
                  <a className="desk-text-action" href="/resume.pdf" target="_blank" rel="noopener noreferrer">Open PDF directly <span aria-hidden="true">↗</span></a>
                </div>
              </div>
              <div className="desk-welcome-toolbar">
                <button type="button" className="desktop-toolbar-button" onClick={toggleCommandPalette} aria-label="Search portfolio apps">Search <kbd>Ctrl K</kbd></button>
                <button type="button" className="desktop-toolbar-button" onClick={toggleTheme} aria-label={'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme'}>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
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
      <RetroOSProvider><PortfolioView /></RetroOSProvider>
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
