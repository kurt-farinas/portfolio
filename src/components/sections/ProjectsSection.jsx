/* ========================================
   PROJECTS SECTION  |  Featured Production Platforms
   Supports skill cross-filtering and detailed modal triggers
   ======================================== */

import React from 'react';
import { useModal } from '../../context/ModalContext';
import { projectDetails } from '../../data/projectData';
import BrowserChrome from '../common/BrowserChrome';

const featuredProjectIds = ['hris', 'gym', 'jobHuntLedger'];

function ExternalIcon() {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.484 22 12.017 22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function ProjectsSection() {
  const { openProjectModal, activeSkillFilter, clearSkillFilter } = useModal();
  const projects = featuredProjectIds.map((projectKey) => ({
    projectKey,
    ...projectDetails[projectKey]
  }));

  const isSkillMatching = (skills) => (
    Boolean(activeSkillFilter) && skills.some((skill) => skill.toLowerCase().includes(activeSkillFilter.toLowerCase()))
  );

  return (
    <section className="section projects-section" id="projects">
      <div className="wrap profile-wrap">
        <div className="section-title-block">
          <h2 className="profile-title">Featured Projects</h2>
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
          {projects.map((project) => {
            const preview = project.slides[0];

            return (
              <article
                key={project.id}
                className={`ticket ${isSkillMatching(project.filterSkills) ? 'highlight-pulse' : ''}`}
                id={`ticket-${project.id}`}
                data-skills={project.filterSkills.join(',')}
              >
                <BrowserChrome label={project.browserLabel || `${project.id}.local`} statusLabel={project.browserStatus} />
                <div className="project-screenshot project-screenshot-static">
                  <img
                    src={preview.src}
                    alt={preview.label}
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

                <div className="ticket-body">
                  <div className="ticket-top">
                    <div className="ticket-title">{project.title}</div>
                    <p className="ticket-summary">{project.cardSummary}</p>
                  </div>

                  <div className="ticket-stack">
                    {project.stack.map((skill) => <span key={skill} className="stack-pill">{skill}</span>)}
                  </div>

                  <div className="ticket-footer-actions">
                    <button type="button" className="btn-card-action" onClick={() => openProjectModal(project.projectKey)}>
                      View Full Details →
                    </button>
                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="code-link-btn btn-showcase-demo">
                        <ExternalIcon />
                        <span>Live Demo ↗</span>
                      </a>
                    )}
                    {project.codeUrl && (
                      <a href={project.codeUrl} target="_blank" rel="noopener noreferrer" className="code-link-btn">
                        <GitHubIcon />
                        <span>View Code</span>
                      </a>
                    )}
                    {!project.demoUrl && !project.codeUrl && (
                      <p className="project-access-note">Live demo and source are not public for this government workflow project.</p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
