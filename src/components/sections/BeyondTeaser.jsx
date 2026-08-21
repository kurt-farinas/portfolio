/* ========================================
   BEYOND TEASER  |  Outside the IDE Single-Tile Homepage Teaser
   Routes directly to full /outside-the-ide page
   ======================================== */

import React from 'react';
import { Link } from 'react-router-dom';
import { beyondTilesData } from '../../data/projectData';

export default function BeyondTeaser() {
  const gym = beyondTilesData.gym;

  return (
    <section className="section beyond-section" id="beyond">
      <div className="wrap profile-wrap">
        <div className="profile-header-divider">
          <span className="profile-eyebrow">
            <span className="eyebrow-index">// 06.00</span> — OUTSIDE THE IDE
          </span>
        </div>

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

            <div className="beyond-photo-slot" data-photo="gym">
              <div className="photo-placeholder">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>{gym.photoCaption}</span>
              </div>
            </div>

            <h3 className="beyond-card-title">{gym.title}</h3>
            <p className="beyond-card-desc">{gym.desc}</p>

            <div className="beyond-tags">
              {gym.tags.map((tag, idx) => (
                <span key={idx} className="stack-pill">{tag}</span>
              ))}
            </div>

            <div className="beyond-teaser-cta">
              <Link to="/outside-the-ide" className="btn-outside-route">
                <span>See more about me (Hardware, Fragrances, Gaming, Focus)</span>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
