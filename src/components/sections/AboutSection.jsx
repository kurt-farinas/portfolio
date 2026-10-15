/* ========================================
   ABOUT SECTION  |  Who I Am
   Concise bio copy and action links; the portrait appears in the introduction.
   ======================================== */

import React from 'react';

export default function AboutSection({ compact = false }) {
  return (
    <section className="studio-section studio-about" id={compact ? undefined : 'about'} aria-label="About">
      <div className="studio-container">
        <div className="studio-about-layout">
          <div className="studio-about-copy">
            <p className="studio-about-lead">
              I&apos;m a Junior Full-Stack Developer at People&apos;s Multi-Purpose Cooperative, working on the People&apos;s Information System, WorkForce / DTR, and General Merchandise website.{!compact && " Previously, I led frontend development for DepEd San Jose City's CS Form No. 6 Digitalization System and solo-built and defended Boiyet's Fitness gym management platform."}
            </p>
            {compact && <p className="studio-about-lead">Previously, I led frontend development for DepEd San Jose City&apos;s CS Form No. 6 Digitalization System and solo-built and defended Boiyet&apos;s Fitness gym management platform.</p>}
          </div>

        </div>
      </div>
    </section>
  );
}
