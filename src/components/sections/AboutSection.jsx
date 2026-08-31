/* ========================================
   ABOUT SECTION  |  Background
   Editorial intro: ownership, proof stats, portrait.
   ======================================== */

import React from 'react';

export default function AboutSection() {
  const scrollToContact = (e) => {
    e.preventDefault();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => document.getElementById('contactName')?.focus(), 300);
  };

  return (
    <section className="section about-section" id="about">
      <div className="wrap profile-wrap">
        {/* ── Section Header ── */}
        <div className="section-title-block">
          <h2 className="profile-title">Background</h2>
        </div>

        {/* ── Two-column: Copy + Portrait ── */}
        <div className="about-layout">
          <div className="about-copy">
            <p className="about-lead">
              I build operational systems that replace paper routing and front-desk work&nbsp;&mdash; leave approvals for a division office, and a gym platform I designed, built, and defended.
            </p>

            <div className="about-text">
              <p>
                During OJT at the <strong>DepEd Schools Division of San Jose City</strong>, I owned frontend development for a three-role approval workflow (Applicant &rarr; Admin &rarr; Approver). Backend is Denver Ballesteros&apos;s. Rating: <strong>98/100</strong> across <strong>342 logged hours</strong>.
              </p>
              <p>
                Capstone is a gym management system I built solo&nbsp;&mdash; QR attendance, point-of-sale, and revenue analytics&nbsp;&mdash; then rebuilt after a security audit. I&apos;m looking for a junior full-stack role, or other developer work where I can keep shipping.
              </p>
            </div>

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
            </nav>
          </div>

          <figure className="about-portrait">
            <div className="about-portrait-frame">
              <img
                src="/profile.jpg"
                alt="Kurt Fariñas"
                width="480"
                height="600"
                loading="eager"
              />
            </div>
            <figcaption>Kurt Fariñas</figcaption>
          </figure>
        </div>

        {/* ── Proof Stats ── */}
        <dl className="about-proof">
          <div>
            <dt>OJT rating</dt>
            <dd>98 <span className="proof-unit">/ 100</span></dd>
          </div>
          <div>
            <dt>Hours logged</dt>
            <dd>342</dd>
          </div>
          <div>
            <dt>Ownership</dt>
            <dd>HRIS frontend · gym solo</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
