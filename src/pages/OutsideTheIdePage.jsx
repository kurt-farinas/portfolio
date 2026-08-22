/* ========================================
   OUTSIDE THE IDE PAGE  |  /outside-the-ide Route
   5 Lifestyle & Discipline Bento Tiles (No Daily Rhythm / Focus Audio)
   ======================================== */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { beyondTilesData } from '../data/projectData';

export default function OutsideTheIdePage() {
  const { gym, desk, perfume, gaming, coffee } = beyondTilesData;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="outside-page-wrap" style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <section className="section beyond-section" style={{ paddingTop: 0 }}>
        <div className="wrap profile-wrap">
          {/* Back Navigation Bar */}
          <div className="outside-page-nav-bar" style={{ marginBottom: '24px' }}>
            <Link to="/" className="btn-back-home font-mono">
              ← RETURN TO MAIN PORTFOLIO
            </Link>
          </div>

          <div className="section-title-block">
            <h1 className="profile-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Outside the IDE
            </h1>
            <p className="profile-header-sub">
              What keeps me grounded, focused, and energized beyond writing code.
            </p>
          </div>

          {/* 5-Card Bento Grid */}
          <div className="beyond-bento-grid">
            {/* TILE 1: Gym & Physical Training (Wide Card) */}
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
            </div>

            {/* TILE 2: Hardware Arsenal (Wide Card) */}
            <div className="beyond-card beyond-card--wide">
              <div className="beyond-card-header">
                <div className="beyond-eyebrow-group">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8"></path>
                  </svg>
                  <span className="beyond-eyebrow">{desk.eyebrow}</span>
                </div>
                <span className="beyond-badge">{desk.badge}</span>
              </div>

              <div className="beyond-photo-slot" data-photo="desk">
                <div className="photo-placeholder">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <span>{desk.photoCaption}</span>
                </div>
              </div>

              <h3 className="beyond-card-title">{desk.title}</h3>
              <p className="beyond-card-desc">{desk.desc}</p>
              <div className="beyond-gear-list">
                {desk.gear.map((g, idx) => (
                  <div key={idx} className="gear-item">
                    <span className="gear-type">{g.type}</span>
                    <span className="gear-name font-mono">{g.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TILE 3: Fragrance Architecture (Standard Card) */}
            <div className="beyond-card">
              <div className="beyond-card-header">
                <div className="beyond-eyebrow-group">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M9 3h6M10 3v3M14 3v3M6 9h12a2 2 0 0 1 2 2v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8a2 2 0 0 1 2-2z"></path>
                  </svg>
                  <span className="beyond-eyebrow">{perfume.eyebrow}</span>
                </div>
                <span className="beyond-badge">{perfume.badge}</span>
              </div>

              <div className="beyond-photo-slot" data-photo="perfume">
                <div className="photo-placeholder">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <span>{perfume.photoCaption}</span>
                </div>
              </div>

              <h3 className="beyond-card-title">{perfume.title}</h3>
              <p className="beyond-card-desc">{perfume.desc}</p>
              <div className="beyond-tags">
                {perfume.tags.map((tag, idx) => (
                  <span key={idx} className="stack-pill">{tag}</span>
                ))}
              </div>
            </div>

            {/* TILE 4: Tactical & Sandbox with Genre Labels (Standard Card) */}
            <div className="beyond-card">
              <div className="beyond-card-header">
                <div className="beyond-eyebrow-group">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="6" y1="12" x2="10" y2="12"></line>
                    <line x1="8" y1="10" x2="8" y2="14"></line>
                    <line x1="15" y1="13" x2="15.01" y2="13"></line>
                    <line x1="18" y1="11" x2="18.01" y2="11"></line>
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                  </svg>
                  <span className="beyond-eyebrow">{gaming.eyebrow}</span>
                </div>
                <span className="beyond-badge">{gaming.badge}</span>
              </div>

              <div className="beyond-photo-slot" data-photo="gaming">
                <div className="photo-placeholder">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <span>{gaming.photoCaption}</span>
                </div>
              </div>

              <h3 className="beyond-card-title">{gaming.title}</h3>
              <p className="beyond-card-desc">{gaming.desc}</p>
              <div className="beyond-tags">
                {gaming.tags.map((tag, idx) => (
                  <span key={idx} className="stack-pill">{tag}</span>
                ))}
              </div>
            </div>

            {/* TILE 5: Pure Black Coffee (Standard Card) */}
            <div className="beyond-card">
              <div className="beyond-card-header">
                <div className="beyond-eyebrow-group">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                  </svg>
                  <span className="beyond-eyebrow">{coffee.eyebrow}</span>
                </div>
                <span className="beyond-badge">{coffee.badge}</span>
              </div>

              <div className="beyond-photo-slot" data-photo="coffee">
                <div className="photo-placeholder">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <span>{coffee.photoCaption}</span>
                </div>
              </div>

              <h3 className="beyond-card-title">{coffee.title}</h3>
              <p className="beyond-card-desc">{coffee.desc}</p>
              <div className="beyond-tags">
                {coffee.tags.map((tag, idx) => (
                  <span key={idx} className="stack-pill">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '48px', textAlign: 'center' }}>
            <Link to="/" className="btn btn-primary" style={{ padding: '12px 28px' }}>
              ← Return to Main Portfolio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
