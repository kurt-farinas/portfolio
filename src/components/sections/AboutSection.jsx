/* ========================================
   ABOUT SECTION  |  Who I Am
   ======================================== */

import React from 'react';

export default function AboutSection() {
  return (
    <section className="section profile-section" id="about">
      <div className="wrap profile-wrap">
        <div className="section-title-block">
          <h2 className="profile-title">Who I Am</h2>
          <p className="profile-header-sub">Junior full-stack developer focused on workflow-driven web applications.</p>
        </div>

        <div className="about-card">
          <div className="about-card-body">
            <div className="about-main">
              <div className="about-text">
                <p>
                  I’m a BS Computer Science graduate from <strong>STI College San Jose</strong>, focused on workflow-driven web applications. During my OJT at DepEd San Jose, I owned frontend development for a three-role CS Form No. 6 approval system. I also solo-built and defended a gym management platform, then rebuilt it with Laravel, React, Inertia.js, MySQL, role-based access, and automated tests after auditing security issues in the original version.
                </p>
              </div>

              <div className="about-focus-grid">
                <div className="focus-cell">
                  <div className="focus-header">
                    <span className="focus-num font-mono">01</span>
                    <span className="focus-label">FRONTEND ARCHITECTURE</span>
                  </div>
                  <p className="focus-desc">Component-driven SPAs with React, complex form state handling, and accessible UI workflows.</p>
                </div>
                <div className="focus-cell">
                  <div className="focus-header">
                    <span className="focus-num font-mono">02</span>
                    <span className="focus-label">REST &amp; RBAC BACKEND</span>
                  </div>
                  <p className="focus-desc">Multi-tier role authorization, RESTful controllers, and normalized MySQL relational schemas.</p>
                </div>
                <div className="focus-cell">
                  <div className="focus-header">
                    <span className="focus-num font-mono">03</span>
                    <span className="focus-label">AUTOMATED TESTING</span>
                  </div>
                  <p className="focus-desc">Test-driven feature development with Pest and PHPUnit (AAA pattern) and regression suites.</p>
                </div>
              </div>

              <div className="about-tags">
                <span className="stack-pill">Primary stack:</span>
                <span className="stack-pill">React</span>
                <span className="stack-pill">Laravel</span>
                <span className="stack-pill">Inertia.js</span>
                <span className="stack-pill">MySQL</span>
                <span className="stack-pill">PHP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
