/* ========================================
   MODALS  |  Project Details + Workflow Steps
   ======================================== */

import { spawnToast } from './utils.js';

const projectDetails = {
  hris: {
    title: "DepEd HRIS Approval System",
    badge: "DEPED OJT SYSTEM PROJECT — 98/100 PERFORMANCE RATING (342 HRS LOGGED)",
    desc: "DepEd San Jose's leave approval process ran entirely on paper across 30+ ICT staff and teachers, with no audit trail and multi-day turnaround. I owned 100% of the frontend for a system that digitized the full Applicant → Admin → Approver workflow, including PDF export and digital signature capture, replacing the CS Form No. 6 paper process for the division office.",
    highlights: [
      "Earned a 98/100 Performance Rating across 342 logged OJT internship hours at DepEd San Jose Division Office.",
      "Implemented 3-Role Workflow: Applicant application submission → Admin verification → Approver digital sign-off.",
      "Built dynamic PDF Generator exporting official CS Form No. 6 documents with digital signatures.",
      "Owned 100% of frontend development using React, Inertia.js, and Tailwind CSS."
    ],
    stack: ["React", "Inertia.js", "Tailwind CSS", "Laravel", "PDF Engine"]
  },
  gym: {
    title: "Boiyet's Fitness Gym Management System",
    badge: "DEFENDED THESIS PROJECT & REAL CLIENT PLATFORM",
    desc: "I solo-built and defended a full-stack platform for a real gym client with no prior digital system — attendance and membership were tracked manually. The system includes three distinct roles (Admin, Trainer, Client), contactless QR attendance scanning, automated membership tracking, and revenue reporting with PDF export.",
    demoUrl: "https://boiyetsfitnessgym-managementsystem.site.je/index.php",
    highlights: [
      "QR Code Attendance Scanner: Replaced manual paper logbooks with instant camera QR check-ins.",
      "Member Portal: Automated membership expiration alerts, workout plans, and payment records.",
      "Revenue Analytics Dashboard: Gives gym management visual breakdown of daily/monthly earnings.",
      "Solo Full-Stack Architecture: Built independently using custom PHP, MySQL database schema, and AJAX."
    ],
    stack: ["PHP", "MySQL", "AJAX", "QR Camera Scanner", "JavaScript", "CSS Grid/Flexbox"]
  }
};

const workflowMessages = {
  hris: [
    "Step 1: Applicant fills out CS Form No. 6 leave application and attaches digital signature.",
    "Step 2: Admin reviews application details in division office management portal.",
    "Step 3: Approver grants final digital sign-off and system exports official PDF with signatures."
  ],
  gym: [
    "Step 1: Member scans personal QR code at gym entrance camera terminal.",
    "Step 2: Asynchronous AJAX request verifies membership status and expiration in MySQL.",
    "Step 3: Visual/audio green light access granted and timestamped attendance record created.",
    "Step 4: Real-time update sent to owner revenue, workout tracking, and active visitor dashboard."
  ]
};

let lastFocusedElement = null;

function trapFocus(modal) {
  const focusables = modal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  first.focus();

  modal._focusTrapHandler = function(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  modal.addEventListener('keydown', modal._focusTrapHandler);
}

function releaseFocus(modal) {
  if (modal._focusTrapHandler) {
    modal.removeEventListener('keydown', modal._focusTrapHandler);
    delete modal._focusTrapHandler;
  }
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

// Exposed globally for onclick handlers in HTML
window.openProjectModal = function(projectId) {
  const data = projectDetails[projectId];
  if (!data) return;
  lastFocusedElement = document.activeElement;
  document.getElementById('modalBadge').textContent = data.badge;
  document.getElementById('modalTitle').textContent = data.title;
  document.getElementById('modalDesc').textContent = data.desc;

  const hlList = document.getElementById('modalHighlights');
  hlList.innerHTML = data.highlights.map(h => `<li>${h}</li>`).join('');

  const stackRow = document.getElementById('modalStack');
  let stackHtml = data.stack.map(s => `<span class="stack-chip">${s}</span>`).join('');
  if (data.demoUrl) {
    stackHtml += `<div style="width:100%;margin-top:16px;">
      <a href="${data.demoUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm" style="display:inline-flex;align-items:center;gap:6px;text-decoration:none;">Launch Live Showcase Demo ↗</a>
      <p style="font-size:11px;color:var(--text-muted);margin-top:6px;margin-bottom:0;">Note: Interactive showcase environment hosted for demonstration purposes.</p>
    </div>`;
  }
  stackRow.innerHTML = stackHtml;

  const modal = document.getElementById('projectModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  trapFocus(modal);
};

window.closeProjectModal = function(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('modal-close')) return;
  const modal = document.getElementById('projectModal');
  if (modal.classList.contains('active')) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    releaseFocus(modal);
  }
};

window.setWorkflowStep = function(projectId, stepIdx) {
  const card = document.getElementById(`ticket-${projectId}`);
  if (!card) return;
  const steps = card.querySelectorAll('.workflow-step');
  steps.forEach((s, idx) => {
    if (idx === stepIdx) s.classList.add('active');
    else s.classList.remove('active');
  });
  const msg = workflowMessages[projectId][stepIdx];
  spawnToast(`WORKFLOW STEP ${stepIdx + 1}`, msg);
};

window.openResumeModal = function() {
  const modal = document.getElementById('resumeModal');
  if (modal) {
    lastFocusedElement = document.activeElement;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    spawnToast('CV PREVIEW', 'Loaded Kurt Fariñas Resume PDF viewer');
    trapFocus(modal);
  }
};

window.closeResumeModal = function(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('modal-close')) return;
  const modal = document.getElementById('resumeModal');
  if (modal && modal.classList.contains('active')) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    releaseFocus(modal);
  }
};

export function initModals() {
  // Close modals on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeProjectModal();
      window.closeResumeModal();
      if (typeof window.closeScreenshotModal === 'function') {
        window.closeScreenshotModal();
      }
    }
  });
}


