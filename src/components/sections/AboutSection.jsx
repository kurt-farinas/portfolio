/* ========================================
   ABOUT SECTION  |  Who I Am
   ======================================== */

import React from 'react';

export default function AboutSection() {
  return (
    <section className="section profile-section" id="about">
      <div className="wrap profile-wrap">
        <div className="profile-header-divider">
          <span className="profile-eyebrow">
            <span className="eyebrow-index">// 04.00</span> — WHO I AM
          </span>
        </div>

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

              <div className="about-ledger-grid about-proof-grid">
                <div className="ledger-cell">
                  <span className="ledger-label">GOVERNMENT OJT</span>
                  <span className="ledger-val">342 Hours · 98/100 Rating</span>
                  <span className="ledger-sub">DepEd San Jose · Frontend Owner</span>
                </div>
                <div className="ledger-cell">
                  <span className="ledger-label">THESIS PLATFORM</span>
                  <span className="ledger-val">Solo-Built &amp; Defended</span>
                  <span className="ledger-sub">Gym management, POS, QR attendance, analytics</span>
                </div>
                <div className="ledger-cell">
                  <span className="ledger-label">LARAVEL REBUILD</span>
                  <span className="ledger-val">119 Passing Tests · RBAC</span>
                  <span className="ledger-sub">Security-driven redesign of the platform</span>
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
