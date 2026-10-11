/* ========================================
   ABOUT SECTION  |  Who I Am
   Concise bio copy, action links, square portrait.
   ======================================== */

import DitherImage from '../common/DitherImage';
import React from 'react';
import { Link } from 'react-router-dom';
import EmailCta from '../common/EmailCta';
import SectionHeading from '../common/SectionHeading';

export default function AboutSection() {
  return (
    <section className="studio-section studio-about" id="about">
      <div className="studio-container">
        <SectionHeading title="About me." />
        {/* ── Two-column: Copy + Portrait ── */}
        <div className="studio-about-layout">
          <div className="studio-about-copy">
            <p className="studio-about-lead">
              I&apos;m a junior full-stack developer focused on operational workflow systems. I led frontend development for DepEd San Jose City&apos;s CS Form No. 6 Digitalization System and solo-built and defended Boiyet&apos;s Fitness gym management platform.
            </p>

            <EmailCta className="about-email-cta" />

            <nav className="studio-about-links font-mono" aria-label="About actions">
              <a href="/resume.pdf" download className="studio-text-action">
                <span className="about-link-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </span>
                Download CV
              </a>
              <Link to="/after-hours" className="studio-text-action">
                <span className="about-link-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                </span>
                After hours
              </Link>
            </nav>
          </div>

          <figure className="studio-about-portrait">
            <div className="studio-portrait-frame">
              <DitherImage
                src="/profile.jpg"
                alt="Kurt Fariñas"
                width="360"
                height="360"
                loading="lazy"
              />
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
