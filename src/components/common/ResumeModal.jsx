/* ========================================
   RESUME MODAL  |  Curriculum Vitae PDF Preview & Download
   Resilient multi-tier PDF renderer with direct download & tab actions
   ======================================== */

import React from 'react';
import { useModal } from '../../context/ModalContext';

export default function ResumeModal() {
  const { resumeModalOpen, closeResumeModal } = useModal();

  if (!resumeModalOpen) return null;

  return (
    <div
      className="modal-overlay"
      id="resumeModal"
      role="dialog"
      aria-modal="true"
      aria-label="Kurt Fariñas Resume PDF Preview"
      onClick={closeResumeModal}
    >
      <div className="modal-card resume-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="resume-modal-header">
          <div>
            <span className="modal-badge">// OFFICIAL CURRICULUM VITAE</span>
            <h3 className="modal-title" style={{ marginBottom: 0, fontSize: '20px' }}>
              Kurt Fariñas — Resume
            </h3>
          </div>

          <div className="resume-modal-actions">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              <span>Open in Tab</span>
            </a>

            <a
              href="/resume.pdf"
              download="Kurt_Farinas_Resume.pdf"
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Download PDF</span>
            </a>

            <button
              type="button"
              className="modal-close"
              aria-label="Close resume modal"
              style={{ position: 'static' }}
              onClick={closeResumeModal}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="resume-embed-wrapper">
          <object
            data="/resume.pdf#toolbar=1&navpanes=0"
            type="application/pdf"
            width="100%"
            height="100%"
            className="resume-object-embed"
          >
            <div className="resume-fallback-panel">
              <p>PDF preview is not supported on this browser window.</p>
              <a href="/resume.pdf" download="Kurt_Farinas_Resume.pdf" className="btn btn-primary">
                Download Kurt Fariñas Resume PDF
              </a>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
}
