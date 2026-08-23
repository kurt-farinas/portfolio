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
import ContactSection from '../components/sections/ContactSection';

export default function HomePage() {
  return (
    <main id="mainContent">
      <Hero />
      <AboutSection />
      <ProjectsSection />
      <TimelineSection />
      <SkillsSection />
      <AwardsSection />
      <ContactSection />
    </main>
  );
}
