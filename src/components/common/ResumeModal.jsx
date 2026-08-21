/* ========================================
   RESUME MODAL  |  Curriculum Vitae PDF Preview
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
            <span className="modal-badge">CURRICULUM VITAE PREVIEW</span>
            <h3 className="modal-title" style={{ marginBottom: 0, fontSize: '22px' }}>
              Kurt Fariñas | Resume
            </h3>
          </div>
          <div className="resume-modal-actions">
            <a href="/resume.pdf" download className="btn btn-primary btn-sm">
              Download PDF
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
          <iframe id="resumeIframe" src="/resume.pdf" title="Kurt Fariñas Resume PDF"></iframe>
        </div>
      </div>
    </div>
  );
}
