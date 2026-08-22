/* ========================================
   PROJECT MODAL  |  Architecture Pipeline & Screenshot Carousel
   ======================================== */

import React from 'react';
import { useModal } from '../../context/ModalContext';
import { projectDetails } from '../../data/projectData';
import useDialogFocus from './useDialogFocus';

export default function ProjectModal() {
  const {
    selectedProjectId,
    closeProjectModal,
    modalViewMode,
    setModalViewMode,
    activeSlideIndex,
    setActiveSlideIndex,
    openLightbox
  } = useModal();
  const dialogRef = useDialogFocus(Boolean(selectedProjectId));

  if (!selectedProjectId) return null;

  const project = projectDetails[selectedProjectId];
  if (!project) return null;

  const slides = project.slides || [];
  const currentSlide = slides[activeSlideIndex] || { src: '', label: '' };

  const prevSlide = () => {
    setActiveSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setActiveSlideIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      className="modal-overlay active"
      id="projectModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      onClick={closeProjectModal}
    >
      <div ref={dialogRef} className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          aria-label="Close project modal"
          onClick={closeProjectModal}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="modal-meta-row">
          <span className="modal-badge">{project.badge || "SYSTEM ARCHITECTURE"}</span>
          {project.stamp && <span className="stamp modal-stamp-badge">{project.stamp}</span>}
        </div>

        <div className="modal-heading-row">
          <h3 className="modal-title" id="modalTitle">{project.title}</h3>
          {project.roleTag && <span className="role-tag">{project.roleTag}</span>}
        </div>

        {project.statusBadge && (
          <div
            className="project-status-badge modal-status-wrap"
            dangerouslySetInnerHTML={{ __html: project.statusBadge }}
          />
        )}

        {/* Modal View Mode Switcher */}
        <div className="modal-view-switcher">
          <button
            type="button"
            className={`modal-view-btn ${modalViewMode === 'screens' ? 'active' : ''}`}
            onClick={() => setModalViewMode('screens')}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <span>Interface Screenshots</span>
          </button>
          <button
            type="button"
            className={`modal-view-btn ${modalViewMode === 'arch' ? 'active' : ''}`}
            onClick={() => setModalViewMode('arch')}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            <span>Interactive Sandbox &amp; Architecture</span>
          </button>
        </div>

        {/* VIEW 1: Screenshots Carousel */}
        {modalViewMode === 'screens' && (
          <div id="modalViewScreens">
            <div className="screenshot-carousel" data-project={project.id}>
              {slides.length > 1 && (
                <div className="carousel-tabs">
                  {slides.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`carousel-tab ${idx === activeSlideIndex ? 'active' : ''}`}
                      onClick={() => setActiveSlideIndex(idx)}
                    >
                      {s.tab || s.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="carousel-frame">
                <div
                  className="project-screenshot"
                  role="button"
                  tabIndex={0}
                  onClick={() => openLightbox(currentSlide.src, `${currentSlide.label} | ${project.title}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openLightbox(currentSlide.src, `${currentSlide.label} | ${project.title}`);
                    }
                  }}
                >
                  <img
                    src={currentSlide.src}
                    alt={currentSlide.label || "Project Screenshot"}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `/${project.id}-mockup.png`;
                    }}
                  />
                  <div className="project-screenshot-overlay">View Full Screenshot ↗</div>
                </div>

                {slides.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="carousel-arrow carousel-prev"
                      onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                      aria-label="Previous slide"
                    >
                      &#8249;
                    </button>
                    <button
                      type="button"
                      className="carousel-arrow carousel-next"
                      onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                      aria-label="Next slide"
                    >
                      &#8250;
                    </button>
                  </>
                )}
              </div>

              <div className="carousel-footer">
                <span className="carousel-label">{currentSlide.label}</span>
                {slides.length > 1 && (
                  <div className="carousel-slide-chips" role="tablist" aria-label="Screenshot slide selection">
                    {slides.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`carousel-slide-chip ${idx === activeSlideIndex ? 'active' : ''}`}
                        onClick={() => setActiveSlideIndex(idx)}
                        aria-label={`Slide 0${idx + 1}: ${s.tab || s.label}`}
                        aria-selected={idx === activeSlideIndex}
                      >
                        <span className="chip-counter">0{idx + 1}/0{slides.length}</span>
                        <span className="chip-label-text">{s.tab || s.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Architecture Pipeline & Code Pattern */}
        {modalViewMode === 'arch' && (
          <div id="modalViewArch">
            <div className="modal-arch-container">
              <div className="modal-arch-subtitle">WORKFLOW STATE PROGRESSION</div>
              <div className="modal-pipeline-grid">
                {project.architecturePipeline?.map((step, idx) => (
                  <div key={idx} className="pipeline-step-box">
                    <div className="pipeline-step-num font-mono">{step.step}</div>
                    <div className="pipeline-step-title">{step.title}</div>
                    <div className="pipeline-step-desc">{step.desc}</div>
                  </div>
                ))}
              </div>

              {project.codeSnippet && (
                <>
                  <div className="modal-arch-subtitle" style={{ marginTop: '20px' }}>
                    SYSTEM ARCHITECTURE CODE PATTERN
                  </div>
                  <div className="modal-code-box">
                    <div className="code-box-header">
                      <span className="code-lang-tag">JS / STATE PATTERN</span>
                      <span className="code-box-title">{project.codeSnippet.title}</span>
                    </div>
                    <pre className="code-pre font-mono"><code>{project.codeSnippet.code}</code></pre>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Engineering Case Study: Problem → Decision → Implementation → Trade-offs → Result */}
        {project.caseStudy && (
          <>
            <div className="modal-section-title">Engineering Case Study</div>
            <div className="case-study-grid">
              <div className="case-study-item">
                <span className="case-study-label">Problem</span>
                <p className="case-study-text">{project.caseStudy.problem}</p>
              </div>
              <div className="case-study-item">
                <span className="case-study-label">Decision</span>
                <p className="case-study-text">{project.caseStudy.decision}</p>
              </div>
              <div className="case-study-item">
                <span className="case-study-label">Implementation</span>
                <p className="case-study-text">{project.caseStudy.implementation}</p>
              </div>
              <div className="case-study-item">
                <span className="case-study-label">Trade-offs</span>
                <p className="case-study-text">{project.caseStudy.tradeoffs}</p>
              </div>
              <div className="case-study-item case-study-result">
                <span className="case-study-label">Result</span>
                <p className="case-study-text">{project.caseStudy.result}</p>
              </div>
            </div>
          </>
        )}

        {/* Architecture Flow Diagram */}
        {project.architectureFlow && (
          <>
            <div className="modal-section-title">System Architecture</div>
            <div className="arch-flow-diagram">
              {project.architectureFlow.map((node, idx) => (
                <React.Fragment key={idx}>
                  <div className="arch-flow-node">
                    <span className="arch-flow-label">{node.label}</span>
                    <span className="arch-flow-sub">{node.sub}</span>
                  </div>
                  {idx < project.architectureFlow.length - 1 && (
                    <span className="arch-flow-arrow" aria-hidden="true">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </>
        )}

        <div className="modal-section-title">Key Development Highlights</div>
        <ul className="modal-list">
          {project.highlights?.map((hl, idx) => (
            <li key={idx}>{hl}</li>
          ))}
        </ul>

        <div className="modal-section-title">Tech Stack &amp; Tools</div>
        <div className="stack-row">
          {project.stack?.map((tech, idx) => (
            <span key={idx} className="stack-pill">{tech}</span>
          ))}
        </div>

        <div className="modal-section-title">Project Links &amp; Resources</div>
        <div className="modal-links-row">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="code-link-btn btn-showcase-demo"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              <span>Live Showcase Demo ↗</span>
            </a>
          )}
          {project.codeUrl ? (
            <a
              href={project.codeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="code-link-btn"
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"></path></svg>
              <span>View Repository on GitHub ↗</span>
            </a>
          ) : (
            <span className="code-link-stub">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              <span>{project.codeStub || "Code Available on Request"}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
