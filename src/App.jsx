/* ========================================
   APP ROOT  |  Router, Context Providers, Global Modals
   ======================================== */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SoundProvider } from './context/SoundContext';
import { ModalProvider } from './context/ModalContext';

import { HeroMotionProvider } from './components/common/HeroDither';
import CustomCursor from './components/common/CustomCursor';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import ProjectModal from './components/common/ProjectModal';
import ResumeModal from './components/common/ResumeModal';
import ScreenshotLightbox from './components/common/ScreenshotLightbox';
import CommandPalette from './components/common/CommandPalette';
import ToastContainer from './components/common/ToastContainer';
import { Analytics } from '@vercel/analytics/react';

import HomePage from './pages/HomePage';
import OutsideTheIdePage from './pages/OutsideTheIdePage';
import { scrollBehavior } from './utils/motion';

function AppContent() {
  const location = useLocation();

  // Handle hash scrolling on page load or navigation
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: scrollBehavior() }), 100);
      }
    }
  }, [location]);

  return (
    <div className="app-shell studio-system">
      <CustomCursor />
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/after-hours" element={<OutsideTheIdePage />} />
        <Route path="/downtime" element={<OutsideTheIdePage />} />
        <Route path="/outside-the-ide" element={<OutsideTheIdePage />} />
      </Routes>

      <Footer />

      {/* Global Overlays & Modals */}
      <ProjectModal />
      <ResumeModal />
      <ScreenshotLightbox />
      <CommandPalette />
      <ToastContainer />
      <Analytics />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SoundProvider>
          <HeroMotionProvider>
            <ModalProvider>
              <AppContent />
            </ModalProvider>
          </HeroMotionProvider>
        </SoundProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
