/* ========================================
   BROWSER CHROME  |  Shared Project Preview Frame
   ======================================== */

import React from 'react';

export default function BrowserChrome({ label, statusLabel = 'LIVE UI' }) {
  return (
    <div className="browser-chrome" aria-hidden="true">
      <span className="browser-chrome-dots">
        <i></i><i></i><i></i>
      </span>
      <span className="browser-chrome-label">{label}</span>
      <span className="browser-chrome-status">{statusLabel}</span>
    </div>
  );
}
