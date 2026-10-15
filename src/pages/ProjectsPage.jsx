import React from 'react';
import PortfolioBuildNotes from '../components/desktop/PortfolioBuildNotes';
import PortfolioImage from '../components/common/PortfolioImage';
import { useModal } from '../context/ModalContext';
import { featuredProjectIds, projectDetails } from '../data/projectData';

const caseStudySections = [
  ['problem', 'Problem'],
  ['decision', 'Decision'],
  ['implementation', 'Implementation'],
  ['tradeoffs', 'Trade-offs'],
  ['result', 'Result']
];

// Release labels are stored in caps for the browser-bar badge; the card reads them as one sentence-case line.
const sentenceCase = text => text.charAt(0) + text.slice(1).toLowerCase();

function ProjectPreview({ project, eager = false }) {
  const preview = project.slides?.[0];
  if (!preview) return null;
  return <figure className="studio-project-detail-preview">
    <PortfolioImage src={preview.src} alt={preview.label} loading={eager ? 'eager' : 'lazy'} onError={event => { event.currentTarget.style.display = 'none'; }} />
    {project.previewCallout && <figcaption><strong>{project.previewCallout.label}</strong><span>{project.previewCallout.note}</span></figcaption>}
  </figure>;
}

export function ProjectsContent({ compact = false }) {
  const { openProjectModal } = useModal();

  return (
    <main id="projects" className={"studio-project-page desktop-projects-content" + (compact ? " compact-projects" : "")}>
      <div className="studio-container">
        <header className="studio-project-page-header">
          <h1>Projects</h1>
        </header>

        <div className="studio-project-detail-list">
          {featuredProjectIds.map((projectKey, index) => {
            const project = projectDetails[projectKey];

            return (
              <article className={"studio-project-detail" + (compact ? " is-compact" : "")} id={project.id} key={project.id}>
                {compact && <ProjectPreview project={project} eager={index === 0} />}
                <header className="studio-project-detail-header">
                  <p className="studio-project-detail-kicker">{project.ticketId}</p>
                  <h2>{project.title}</h2>
                  <p className="studio-project-detail-role">
                    {project.roleTag}
                    {project.browserStatus && <span> · {sentenceCase(project.browserStatus)}</span>}
                  </p>
                  {!compact && <p className="studio-project-detail-summary">{project.cardSummary}</p>}
                </header>

                {!compact && <ProjectPreview project={project} eager={index === 0} />}

                <div className="studio-project-detail-content">
                  {compact && <dl className="project-quick-read">
                    <div><dt>Decision</dt><dd>{project.decisionSummary}</dd></div>
                    <div><dt>Result</dt><dd>{project.resultSummary}</dd></div>
                  </dl>}
                  {!compact && <>
                  {project.caseStudy ? (
                    <section aria-label={project.title + ' case study'}>
                      <h3>Case study</h3>
                      <div className="studio-project-case-grid">
                        {caseStudySections.map(([key, label]) => (
                          <div className="studio-project-case-item" key={key}>
                            <h4>{label}</h4>
                            <p>{project.caseStudy[key]}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : <p className="studio-project-detail-description">{project.desc}</p>}

                  <section aria-label={project.title + ' contributions'}>
                    <h3>Key contributions</h3>
                    <ul className="studio-project-detail-highlights">
                      {project.highlights?.map(highlight => <li key={highlight}>{highlight}</li>)}
                    </ul>
                  </section>

                  <section aria-label={project.title + ' technologies'}>
                    <h3>Technologies</h3>
                    <ul className="studio-project-detail-stack">
                      {project.stack?.map(technology => <li key={technology}>{technology}</li>)}
                    </ul>
                  </section>

                  </>}
                  <div className="studio-project-detail-actions">
                    <button type="button" className="studio-action" aria-label={'View project: ' + project.title} onClick={() => openProjectModal(projectKey)}>
                      View project
                    </button>
                    {project.websiteUrl && <a className="studio-text-action" href={project.websiteUrl} target="_blank" rel="noopener noreferrer">Visit website ↗</a>}
                    {project.demoUrl && <a className="studio-text-action" href={project.demoUrl} target="_blank" rel="noopener noreferrer">Live demo ↗</a>}
                    {project.codeUrl && <a className="studio-text-action" href={project.codeUrl} target="_blank" rel="noopener noreferrer">View code ↗</a>}
                  </div>
                  {project.id === 'hris' && <p className="studio-project-detail-access">Live demo and source are not public for this government workflow project.</p>}
                </div>
              </article>
            );
          })}
        </div>
        {compact && <PortfolioBuildNotes />}
      </div>
    </main>
  );
}

export default function ProjectsPage() {
  return <ProjectsContent />;
}
