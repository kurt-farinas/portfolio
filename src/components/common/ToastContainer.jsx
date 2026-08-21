/* ========================================
   TOAST CONTAINER  |  Achievement & Feedback Alerts
   ======================================== */

import React from 'react';
import { useModal } from '../../context/ModalContext';

export default function ToastContainer() {
  const { toasts } = useModal();

  if (!toasts.length) return <div id="toastLayer"></div>;

  return (
    <div id="toastLayer">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast show">
          <svg className="badge-icon" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L14.5 8.5L21 9.5L16 14L17.5 20.5L12 17L6.5 20.5L8 14L3 9.5L9.5 8.5L12 2Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
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
