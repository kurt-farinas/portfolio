/* ========================================
   BEYOND TEASER  |  Outside the IDE Interactive Telemetry Teaser
   Routes directly to full /outside-the-ide page with real SVG icons
   ======================================== */

import React from 'react';
import { Link } from 'react-router-dom';
import { beyondTilesData } from '../../data/projectData';

export default function BeyondTeaser() {
  const gym = beyondTilesData.gym;

  return (
    <section className="section beyond-teaser-section" id="beyond">
      <div className="wrap profile-wrap">
        <div className="section-title-block">
          <h2 className="profile-title">Outside the IDE</h2>
          <p className="profile-header-sub">
            What keeps me grounded, focused, and disciplined beyond writing code.
          </p>
        </div>

        <div className="beyond-teaser-wrapper">
          <div className="beyond-card beyond-card--wide">
            <div className="beyond-card-header">
              <div className="beyond-eyebrow-group">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 4v16M18 4v16M2 9h4M18 9h4M2 15h4M18 15h4M6 12h12"></path>
                </svg>
                <span className="beyond-eyebrow">{gym.eyebrow}</span>
              </div>
              <span className="beyond-badge">{gym.badge}</span>
            </div>

            <h3 className="beyond-card-title">{gym.title}</h3>
            <p className="beyond-card-desc">{gym.desc}</p>

            {/* Interactive Telemetry Sub-Channel Chips */}
            <div className="beyond-telemetry-panel">
              <div className="beyond-telemetry-heading">EXPLORE DOMAINS BEYOND CODE:</div>
              <div className="beyond-telemetry-chips">
                <Link to="/outside-the-ide" className="telemetry-chip-link" title="Explore Gym & Physical Training">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 4v16M18 4v16M2 9h4M18 9h4M2 15h4M18 15h4M6 12h12"></path>
                  </svg>
                  <span>GYM THESIS</span>
                  <span className="chip-arrow">↗</span>
                </Link>

                <Link to="/outside-the-ide" className="telemetry-chip-link" title="Explore Tactical & Sandbox Gaming">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"></path>
                  </svg>
                  <span>TACTICAL &amp; SANDBOX</span>
                  <span className="chip-arrow">↗</span>
                </Link>

                <Link to="/outside-the-ide" className="telemetry-chip-link" title="Explore Peripherals & Hardware Arsenal">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"></path>
                  </svg>
                  <span>HARDWARE ARSENAL</span>
                  <span className="chip-arrow">↗</span>
                </Link>

                <Link to="/outside-the-ide" className="telemetry-chip-link" title="Explore Daily Fuel & Ritual">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                  </svg>
                  <span>DAILY FUEL</span>
                  <span className="chip-arrow">↗</span>
                </Link>

                <Link to="/outside-the-ide" className="telemetry-chip-link" title="Explore Fragrance Collection">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0"></path>
                  </svg>
                  <span>OLFACTORY</span>
                  <span className="chip-arrow">↗</span>
                </Link>
              </div>
            </div>

            <div className="beyond-teaser-cta">
              <Link to="/outside-the-ide" className="btn-outside-route">
                <span>Open Full Outside the IDE Dossier (5 Tiles)</span>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
