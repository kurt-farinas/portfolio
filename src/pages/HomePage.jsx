/* ========================================
   HOME PAGE  |  Full Developer Portfolio
   ======================================== */

import React, { useEffect } from 'react';
import Hero from '../components/sections/Hero';
import AboutSection from '../components/sections/AboutSection';
import TimelineSection from '../components/sections/TimelineSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import SkillsSection from '../components/sections/SkillsSection';
import AwardsSection from '../components/sections/AwardsSection';
import BeyondTeaser from '../components/sections/BeyondTeaser';
import ContactSection from '../components/sections/ContactSection';
import { useModal } from '../context/ModalContext';

export default function HomePage() {
  const { spawnToast } = useModal();

  // Scroll achievements observer
  useEffect(() => {
    let seenProjects = false;
    let seenContact = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.target.id === 'projects' && !seenProjects) {
          seenProjects = true;
          spawnToast('ACHIEVEMENT UNLOCKED', 'Found the actual work section.');
        }
        if (entry.target.id === 'contact' && !seenContact) {
          seenContact = true;
          spawnToast('ACHIEVEMENT UNLOCKED', 'Scrolled to the end. Rare among recruiters.');
        }
      });
    }, { threshold: 0.3 });

    ['projects', 'contact'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [spawnToast]);

  return (
    <main id="mainContent">
      <Hero />
      <AboutSection />
      <TimelineSection />
      <ProjectsSection />
      <SkillsSection />
      <AwardsSection />
      <BeyondTeaser />
      <ContactSection />
    </main>
  );
}
