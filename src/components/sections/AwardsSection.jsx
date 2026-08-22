/* ========================================
   AWARDS SECTION  |  Honors & Recognition (3 Curated Entries)
   ======================================== */

import React from 'react';
import { awardsData } from '../../data/projectData';

export default function AwardsSection() {
  return (
    <section className="section awards-section" id="awards">
      <div className="wrap profile-wrap">
        <div className="profile-header-divider">
          <span className="profile-eyebrow">
            <span className="eyebrow-index">// 05.00</span> — HONORS &amp; CERTIFICATIONS
          </span>
        </div>

        <div className="section-title-block">
          <h2 className="profile-title">Honors &amp; Certifications</h2>
          <p className="profile-header-sub">Academic honors and technical certifications.</p>
        </div>

        <div className="awards-grid">
          {awardsData.map((award) => (
            <div
              key={award.id}
              className={`award-card ${award.isChampion ? 'award-card-champion' : ''}`}
            >
              <svg className="award-badge" width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L14.5 8.5L21 9.5L16 14L17.5 20.5L12 17L6.5 20.5L8 14L3 9.5L9.5 8.5L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
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
