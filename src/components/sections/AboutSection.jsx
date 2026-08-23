/* ========================================
   ABOUT SECTION  |  Who I Am
   Primary introduction directly after Hero with Profile Photo,
   Bio, and Quick Action to After Hours.
   ======================================== */

import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutSection() {
  return (
    <section className="section about-section" id="about">
      <div className="wrap profile-wrap">
        <div className="section-title-block">
          <h2 className="profile-title">About Me</h2>
          <p className="profile-header-sub">Background, project ownership, and career goals.</p>
        </div>

        <div className="about-profile-card">
          {/* Avatar Column with Status Indicator */}
          <div className="about-avatar-col">
            <div className="about-avatar-frame">
              <img
                src="/profile.jpg"
                alt="Kurt Fariñas"
                className="about-avatar-img"
                loading="eager"
              />
              <div className="about-status-indicator font-mono">
                <span className="status-dot"></span>
                <span>OPEN TO WORK</span>
              </div>
            </div>

            <div className="about-quick-specs font-mono">
              <div className="about-spec-item">
                <span className="spec-k">LOCATION:</span>
                <span className="spec-v">San Jose City, PH</span>
              </div>
              <div className="about-spec-item">
                <span className="spec-k">DEGREE:</span>
                <span className="spec-v">BS Computer Science</span>
              </div>
              <div className="about-spec-item">
                <span className="spec-k">COLLEGE:</span>
                <span className="spec-v">STI College San Jose</span>
              </div>
            </div>
          </div>

          {/* Content Column with Exact Bio Copy & Actions */}
          <div className="about-content-col">
            <div className="about-paragraphs">
              <p className="about-p">
                I&apos;m a full-stack developer and BS Computer Science graduate from <strong>STI College San Jose</strong>.
              </p>
              <p className="about-p">
                During my OJT with the <strong>DepEd Schools Division of San Jose City</strong>, I owned frontend development for a three-role approval workflow system. I also designed and built a full-stack gym management system as my capstone project, handling QR-based attendance, point-of-sale, and revenue analytics from the ground up.
              </p>
              <p className="about-p highlight-p">
                I&apos;m currently looking for a junior full-stack developer role, or other developer opportunities where I can keep growing.
              </p>
            </div>

            {/* Action Bar with After Hours Button */}
            <div className="about-action-bar">
              <Link to="/after-hours" className="btn-about-afterhours font-mono">
                <span className="afterhours-sparkle">✦</span>
                <span>AFTER HOURS</span>
                <span className="arrow-icon">↗</span>
              </Link>

              <a href="/resume.pdf" download className="btn-about-secondary font-mono">
                <span>DOWNLOAD CV</span>
                <span className="arrow-icon">↓</span>
              </a>

              <a
                href="#contact"
                className="btn-about-secondary font-mono"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  setTimeout(() => document.getElementById('contactName')?.focus(), 300);
                }}
              >
                <span>GET IN TOUCH</span>
                <span className="arrow-icon">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
