import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import CustomCursor from '../components/common/CustomCursor';
import ScrollReveals from '../components/common/ScrollReveals';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProjectModal from '../components/common/ProjectModal';
import ResumeModal from '../components/common/ResumeModal';
import ScreenshotLightbox from '../components/common/ScreenshotLightbox';
import CommandPalette from '../components/common/CommandPalette';
import ToastContainer from '../components/common/ToastContainer';
import { Analytics } from '@vercel/analytics/react';
import HomePage from './HomePage';
import ProjectsPage from './ProjectsPage';
import AfterHoursPage from './AfterHoursPage';
import OutsideTheIdePage from './OutsideTheIdePage';
import { scrollBehavior } from '../utils/motion';

// The editorial portfolio, kept as a "Classic Portfolio" view next to Kurt-OS.
export default function ClassicPortfolio() {
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) return;
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: scrollBehavior() });
  }, [location]);
  return (
    <div className="app-shell studio-system classic-portfolio">
      <CustomCursor />
      <ScrollReveals />
      <Navbar />
      <Routes>
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/after-hours" element={<AfterHoursPage />} />
        <Route path="/gear" element={<OutsideTheIdePage />} />
        <Route path="/downtime" element={<OutsideTheIdePage />} />
        <Route path="/outside-the-ide" element={<OutsideTheIdePage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
      <ProjectModal />
      <ResumeModal />
      <ScreenshotLightbox />
      <CommandPalette />
      <ToastContainer />
      <Analytics />
    </div>
  );
}
