/* ========================================
   SCREENSHOT LIGHTBOX  |  Full-Screen Image Preview
   ======================================== */

import React from 'react';
import { useModal } from '../../context/ModalContext';
import useDialogFocus from './useDialogFocus';

export default function ScreenshotLightbox() {
  const { lightbox, closeLightbox } = useModal();
  const dialogRef = useDialogFocus(lightbox.isOpen);

  if (!lightbox.isOpen) return null;

  return (
    <div
      id="screenshotModal"
      className="screenshot-modal-overlay active"
      role="dialog"
      aria-modal="true"
      aria-label="Screenshot Lightbox Preview"
      onClick={closeLightbox}
    >
      <div ref={dialogRef} className="screenshot-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="screenshot-modal-close"
          onClick={closeLightbox}
          aria-label="Close image preview"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <img
          id="screenshotModalImg"
          className="screenshot-modal-img"
          src={lightbox.src}
          alt={lightbox.caption || "Full-size project screenshot"}
        />
        {lightbox.caption && (
          <p id="screenshotModalCaption" className="screenshot-modal-caption">
            {lightbox.caption}
          </p>
        )}
      </div>
    </div>
  );
}
