/* ========================================
   AWARDS SECTION  |  Honors & Recognition (4 Curated Entries)
   ======================================== */

import React from 'react';
import { awardsData } from '../../data/projectData';

export default function AwardsSection() {
  return (
    <section className="section awards-section" id="awards">
      <div className="wrap profile-wrap">
        <div className="section-title-block">
          <h2 className="profile-title">Honors &amp; Certifications</h2>
          <p className="profile-header-sub">Academic competition win and verified technical credentials.</p>
        </div>

        <div className="awards-grid">
          {awardsData.map((award) => (
            <div
              key={award.id}
              className={`award-card ${award.isChampion ? 'award-card-champion' : ''}`}
            >
              <div className="award-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
                {award.isChampion ? (
                  <svg className="award-badge award-badge-champion" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                    <path d="M4 22h16"></path>
                    <path d="M10 14.66V17c0 .55-.45 1-1 1H7"></path>
                    <path d="M14 14.66V17c0 .55.45 1 1 1h2"></path>
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                  </svg>
                ) : (
                  <svg className="award-badge" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                )}
                {award.category && (
                  <span className="award-category-pill" style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: award.isChampion ? 'var(--text)' : 'var(--text-faint)',
                    background: award.isChampion ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    border: '1px solid var(--border)'
                  }}>
                    {award.category}
                  </span>
                )}
              </div>
              <div className="award-text">
                <h4>{award.title}</h4>
                <p>{award.issuer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
