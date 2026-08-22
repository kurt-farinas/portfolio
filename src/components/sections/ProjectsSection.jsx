/* ========================================
   PROJECTS SECTION  |  Featured Production Platforms
   Supports skill cross-filtering and detailed modal triggers
   ======================================== */

import React from 'react';
import { useModal } from '../../context/ModalContext';
import { projectDetails } from '../../data/projectData';

export default function ProjectsSection() {
  const { openProjectModal, activeSkillFilter, clearSkillFilter } = useModal();

  const hris = projectDetails.hris;
  const gym = projectDetails.gym;

  const isSkillMatching = (skills) => {
    if (!activeSkillFilter) return false;
    return skills.some(s => s.toLowerCase().includes(activeSkillFilter.toLowerCase()));
  };

  return (
    <section className="section projects-section" id="projects">
      <div className="wrap profile-wrap">
        <div className="profile-header-divider">
          <span className="profile-eyebrow">
            <span className="eyebrow-index">// 03.00</span> — FEATURED PLATFORMS
          </span>
        </div>

        <div className="section-title-block">
          <h2 className="profile-title">Featured Projects</h2>
          <p className="profile-header-sub">Production systems built for real-world operations.</p>
        </div>

        {activeSkillFilter && (
          <div id="skillFilterBanner" className="skill-filter-banner" style={{ display: 'flex' }}>
            <span className="skill-filter-text">
              Filtered by: <strong>{activeSkillFilter.toUpperCase()}</strong>
            </span>
            <button type="button" className="btn-clear-filter" onClick={clearSkillFilter}>
              Reset Filter ×
            </button>
          </div>
        )}

        <div className="tickets">
          {/* CARD 1: Boiyet's Gym Management System — Strongest technical evidence */}
          <article
            className={`ticket ${isSkillMatching(gym.filterSkills) ? 'highlight-pulse' : ''}`}
            id="ticket-gym"
            data-skills={gym.filterSkills.join(',')}
          >
            <div className="ticket-header-meta">
              <span className="ticket-badge-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H7"></path>
                  <path d="M14 14.66V17c0 .55.45 1 1 1h2"></path>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                </svg>
                <span>{gym.badge}</span>
              </span>
            </div>

            <div
              className="project-screenshot"
              role="button"
              tabIndex={0}
              onClick={() => openProjectModal('gym')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') openProjectModal('gym');
              }}
            >
              <img
                src="/gym-admin.png"
                alt="Boiyet's Gym Management System - Admin Dashboard"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/gym-mockup.png';
                }}
              />
              <div className="project-screenshot-overlay">View Full Details ↗</div>
            </div>

            <div className="ticket-body">
              <div className="ticket-top">
                <div className="ticket-title">{gym.title}</div>
                <div className="ticket-telemetry-ribbon">
                  {gym.telemetry.map((t, idx) => (
                    <span key={idx}>{t}</span>
                  ))}
                </div>
                <p className="ticket-summary">{gym.cardSummary}</p>
              </div>

              <div className="ticket-stack">
                {gym.stack.map((s, idx) => (
                  <span key={idx} className="stack-pill">{s}</span>
                ))}
              </div>

              <div className="ticket-footer-actions">
                <button
                  type="button"
                  className="btn-card-action"
                  onClick={() => openProjectModal('gym')}
                >
                  View Full Details →
                </button>
                <a
                  href={gym.codeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="code-link-btn"
                >
                  <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"></path>
                  </svg>
                  <span>View Code</span>
                </a>
              </div>
            </div>
          </article>

          {/* CARD 2: CS Form No. 6 Digitalization System */}
          <article
            className={`ticket ${isSkillMatching(hris.filterSkills) ? 'highlight-pulse' : ''}`}
            id="ticket-hris"
            data-skills={hris.filterSkills.join(',')}
          >
            <div className="ticket-header-meta">
              <span className="ticket-badge-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>98/100 OJT Rating · 342 Hrs</span>
              </span>
            </div>

            <div
              className="project-screenshot"
              role="button"
              tabIndex={0}
              onClick={() => openProjectModal('hris')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') openProjectModal('hris');
              }}
            >
              <img
                src="/hris-admin.png"
                alt="CS Form No. 6 Digitalization System - Admin Dashboard"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/hris-mockup.png';
                }}
              />
              <div className="project-screenshot-overlay">View Full Details ↗</div>
            </div>

            <div className="ticket-body">
              <div className="ticket-top">
                <div className="ticket-title">{hris.title}</div>
                <div className="ticket-telemetry-ribbon">
                  {hris.telemetry.map((t, idx) => (
                    <span key={idx}>{t}</span>
                  ))}
                </div>
                <p className="ticket-summary">{hris.cardSummary}</p>
              </div>

              <div className="ticket-stack">
                {hris.stack.map((s, idx) => (
                  <span key={idx} className="stack-pill">{s}</span>
                ))}
              </div>

              <div className="ticket-footer-actions">
                <button
                  type="button"
                  className="btn-card-action"
                  onClick={() => openProjectModal('hris')}
                >
                  View Full Details →
                </button>
                <span className="code-link-stub">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <span>{hris.codeStub}</span>
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
