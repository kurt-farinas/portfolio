/* ========================================
   EMAIL CTA  |  Direct Recruiter Contact
   ======================================== */

import React from 'react';

export default function EmailCta({ className = '' }) {
  return (
    <a
      className={`contact-email-cta ${className}`.trim()}
      href="mailto:kurtfarinas2022@gmail.com?subject=Portfolio%20Inquiry"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Email Kurt Fariñas at kurtfarinas2022@gmail.com"
    >
      <span className="contact-email-cta-icon" aria-hidden="true">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      </span>
      <span className="contact-email-cta-copy">
        <strong>Email Me Directly</strong>
        <small>kurtfarinas2022@gmail.com</small>
      </span>
      <span className="contact-email-cta-arrow" aria-hidden="true">↗</span>
    </a>
  );
}
