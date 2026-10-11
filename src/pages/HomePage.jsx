/* ========================================
   HOME PAGE  |  Full Developer Portfolio
   ======================================== */

import React from 'react';
import Hero from '../components/sections/Hero';
import AboutSection from '../components/sections/AboutSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import TimelineSection from '../components/sections/TimelineSection';
import SkillsSection from '../components/sections/SkillsSection';
import AwardsSection from '../components/sections/AwardsSection';

export default function HomePage() {
  return (
    <main id="mainContent" className="studio-home">
      <Hero />
      <ProjectsSection />
      <AboutSection />
      <TimelineSection />
      <SkillsSection />
      <AwardsSection />
    </main>
  );
}
