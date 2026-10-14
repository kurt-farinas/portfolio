import React from 'react';
import { Link } from 'react-router-dom';
import PortfolioImage from '../common/PortfolioImage';
import SectionHeading from '../common/SectionHeading';
import { featuredProjectIds, projectDetails } from '../../data/projectData';

export default function ProjectsSection() {
  return (
    <section className="studio-section studio-projects" id="projects">
      <div className="studio-container">
        <SectionHeading title="Featured Projects" />
        <div className="studio-project-list">
          {featuredProjectIds.map(projectKey => {
            const project = projectDetails[projectKey];
            const preview = project.slides?.[0];

            return (
              <Link
                key={project.id}
                to={`/projects#${project.id}`}
                className="studio-project"
                id={`ticket-${project.id}`}
                aria-label={project.previewCallout
                  ? `Read about ${project.title}. ${project.previewCallout.label}: ${project.previewCallout.note}`
                  : `Read about ${project.title}`}
              >
                <figure className="studio-project-preview">
                  <div className="studio-project-image">
                    {preview && <PortfolioImage src={preview.src} alt={preview.label} loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; }} />}
                  </div>
                  {project.previewCallout && <figcaption className="studio-project-preview-label">{project.previewCallout.label}</figcaption>}
                </figure>
                <h3 className="studio-project-title">{project.title}</h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
