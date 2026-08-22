/* ========================================
   ABOUT SECTION  |  Who I Am & Development Principles
   ======================================== */

import React from 'react';

export default function AboutSection() {
  return (
    <section className="section profile-section" id="about">
      <div className="wrap profile-wrap">
        <div className="profile-header-divider">
          <span className="profile-eyebrow">
            <span className="eyebrow-index">// 01.00</span> — WHO I AM
          </span>
        </div>

        <div className="section-title-block">
          <h2 className="profile-title">Who I Am</h2>
          <p className="profile-header-sub">
            Full-stack developer focused on responsive interfaces and workflow systems.
          </p>
        </div>

        <div className="about-card">
          {/* At a Glance — Key credentials */}
          <div className="about-ledger-header">
            <span className="ledger-title">At a Glance</span>
          </div>

          <div className="about-ledger-grid">
            <div className="ledger-cell">
              <span className="ledger-label">ACADEMIC FOUNDATION</span>
              <span className="ledger-val">BS Computer Science</span>
              <span className="ledger-sub">STI College San Jose · Presidential List</span>
            </div>
            <div className="ledger-cell">
              <span className="ledger-label">GOVERNMENT OJT RECORD</span>
              <span className="ledger-val">342 Hours · 98/100 Rating</span>
              <span className="ledger-sub">SDO San Jose City (DepEd) · Frontend Owner</span>
            </div>
            <div className="ledger-cell">
              <span className="ledger-label">CORE DOMAINS</span>
              <span className="ledger-val">Relational &amp; Workflow Systems</span>
              <span className="ledger-sub">Laravel 12 · Inertia.js · React · MySQL · Pest</span>
            </div>
            <div className="ledger-cell">
              <span className="ledger-label">SECURITY &amp; TESTING</span>
              <span className="ledger-val">119 Passing Tests · RBAC (88/92)</span>
              <span className="ledger-sub">Security Audit Driven Rebuild</span>
            </div>
          </div>

          <div className="about-card-body about-split">
            {/* Left Column: Narrative Bio & Key Tags */}
            <div className="about-main">
              <div className="about-text">
                <p>
                  Junior full-stack developer and BS Computer Science graduate from <strong>STI College San Jose</strong> (Presidential List 2022). Owned frontend development on a three-role approval workflow system (CS Form No. 6) during OJT at DepEd Schools Division Office (342 hours, 98/100 rating), and built a full-stack gym management platform end to end, from custom database schema to POS and analytics dashboards.
                </p>
                <p>
                  Focused on workflow-driven applications, clean database design, and practical user experiences for multi-role systems, with a long-term interest in AI systems engineering.
                </p>
              </div>

              <div className="about-tags">
                <span className="stack-pill">BS Computer Science</span>
                <span className="stack-pill">Frontend Owner (DepEd)</span>
                <span className="stack-pill">PHP &amp; MySQL</span>
                <span className="stack-pill">React &amp; Laravel</span>
                <span className="stack-pill">Open to Work</span>
              </div>
            </div>

            {/* Right Column: Development Principles & Focus */}
            <div className="about-sidebar">
              <div className="about-sidebar-heading">Development Focus</div>

              <div className="about-principle-item">
                <div className="about-principle-title">01 / Workflow Systems</div>
                <div className="about-principle-desc">
                  Designing interfaces around operational procedures: multi-step approvals, printable documents, and role permissions.
                </div>
              </div>

              <div className="about-principle-item">
                <div className="about-principle-title">02 / Defensive State Handling</div>
                <div className="about-principle-desc">
                  Handling error states, input validation, network fallbacks, and database constraints reliably.
                </div>
              </div>

              <div className="about-principle-item">
                <div className="about-principle-title">03 / Practical Full-Stack</div>
                <div className="about-principle-desc">
                  Connecting clean relational schemas and secure endpoints directly to fast, responsive frontends.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
