/* ========================================
   TOAST CONTAINER  |  Action Feedback Alerts
   ======================================== */

import React from 'react';
import { useModal } from '../../context/ModalContext';

export default function ToastContainer() {
  const { toasts } = useModal();

  return (
    <div id="toastLayer" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${toast.visible ? 'show' : 'hide'}`}
          role="status"
        >
          <svg className="badge-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <div className="toast-text">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-body">{toast.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
