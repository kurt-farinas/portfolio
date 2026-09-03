/* ========================================
   ABOUT SECTION  |  Who I Am
   Concise bio copy, action links, square portrait.
   ======================================== */

import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutSection() {
  const scrollToContact = (e) => {
    e.preventDefault();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => document.getElementById('contactName')?.focus(), 300);
  };

  return (
    <section className="section about-section" id="about">
      <div className="wrap profile-wrap">
        {/* ── Two-column: Copy + Portrait ── */}
        <div className="about-layout">
          <div className="about-copy">
            <p className="about-lead">
              I&apos;m a junior full-stack developer building operational workflow systems with Laravel, Inertia.js, React, and Tailwind CSS. I built the CS Form No. 6 Digitalization System for DepEd San Jose City, and Boiyet&apos;s Fitness gym management platform.
            </p>

            <nav className="about-links font-mono" aria-label="About actions">
              <a href="/resume.pdf" download className="about-action-link">
                <span className="about-link-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </span>
                Download CV
              </a>
              <a href="#contact" onClick={scrollToContact} className="about-action-link">
                <span className="about-link-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                Get in touch
              </a>
              <Link to="/after-hours" className="about-action-link about-link-quiet">
                <span className="about-link-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                </span>
                After hours
              </Link>
            </nav>
          </div>

          <figure className="about-portrait">
            <div className="about-portrait-frame">
              <img
                src="/profile.jpg"
                alt="Kurt Fariñas"
                width="360"
                height="360"
                loading="eager"
              />
            </div>
            <Link to="/after-hours" className="about-portrait-action font-mono">
              <span className="about-link-icon" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
              </span>
              After hours
            </Link>
          </figure>
        </div>
      </div>
    </section>
  );
}
