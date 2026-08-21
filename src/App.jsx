/* ========================================
   APP ROOT  |  Router, Context Providers, Global Modals
   ======================================== */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SoundProvider } from './context/SoundContext';
import { ModalProvider, useModal } from './context/ModalContext';

import Preloader from './components/common/Preloader';
import CustomCursor from './components/common/CustomCursor';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import ProjectModal from './components/common/ProjectModal';
import ResumeModal from './components/common/ResumeModal';
import ScreenshotLightbox from './components/common/ScreenshotLightbox';
import CommandPalette from './components/common/CommandPalette';
import ToastContainer from './components/common/ToastContainer';

import HomePage from './pages/HomePage';
import OutsideTheIdePage from './pages/OutsideTheIdePage';

function AppContent() {
  const location = useLocation();
  const { spawnToast } = useModal();

  // Handle hash scrolling on page load or navigation
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [location]);

  // Konami code easter egg listener
  useEffect(() => {
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiPos = 0;

    const handleKeyDown = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === konami[konamiPos]) {
        konamiPos++;
        if (konamiPos === konami.length) {
          konamiPos = 0;
          spawnToast('SECRET FOUND', 'Developer terminal activated: kurtfarinas2022@gmail.com');
        }
      } else {
        konamiPos = (key === konami[0]) ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spawnToast]);

  return (
    <div className="app-shell">
      <Preloader />
      <CustomCursor />
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/outside-the-ide" element={<OutsideTheIdePage />} />
      </Routes>

      <Footer />

      {/* Global Overlays & Modals */}
      <ProjectModal />
      <ResumeModal />
      <ScreenshotLightbox />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SoundProvider>
          <ModalProvider>
            <AppContent />
          </ModalProvider>
        </SoundProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
