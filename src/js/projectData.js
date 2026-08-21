/* ========================================
   PROJECT DATA  |  Single Source of Truth
   ======================================== */

export const projectDetails = {
  hris: {
    id: "hris",
    title: "CS Form No. 6 Digitalization System",
    ticketId: "TICKET #CSF6-2026-01",
    stamp: "98/100 OJT RATING (342 HRS)",
    roleTag: "FRONTEND OWNER",
    statusBadge: '<span class="status-dot-amber"></span> Built &amp; Delivered (Pending Institutional Rollout)',
    badge: "DEPED OJT SYSTEM PROJECT | 98/100 PERFORMANCE RATING (342 HRS LOGGED)",
    desc: "DepEd San Jose's leave approval process ran entirely on paper across 30+ ICT staff and teachers, with no audit trail and multi-day turnaround. I owned 100% of the frontend for a system that digitized the full Applicant → Admin → Approver workflow, replacing the manual CS Form No. 6 paper process for the division office with print-optimized PDF output and secure e-signature upload tied to the approval chain (designed to scale toward a future HRIS).",
    codeStub: "Code available on request",
    highlights: [
      "Earned a 98/100 Performance Rating across 342 logged OJT internship hours at DepEd San Jose Division Office.",
      "Implemented 3-Role Workflow: Applicant application submission → Admin verification → Approver digital sign-off.",
      "Print-Optimized PDF Engine: Formatted official CS Form No. 6 documents via browser-native print stylesheets with verified e-signature image stamping.",
      "Owned 100% of frontend development using React, Inertia.js, and Tailwind CSS."
    ],
    stack: ["React", "Inertia.js", "Tailwind CSS", "Laravel", "MySQL"],
    slides: [
      { src: 'hris-admin.png', label: 'Admin Dashboard', tab: 'Admin' },
      { src: 'hris-approver.png', label: 'Approver Interface', tab: 'Approver' },
      { src: 'hris-applicant.png', label: 'Applicant Form', tab: 'Applicant' }
    ]
  },
  gym: {
    id: "gym",
    title: "Boiyet's Fitness Gym Management System",
    ticketId: "TICKET #GYM-2025-02",
    stamp: "SOLO-BUILT & DEFENDED THESIS",
    roleTag: "SOLO DEVELOPER",
    statusBadge: '<span class="status-dot-green"></span> Built &amp; Defended Thesis Platform',
    badge: "DEFENDED THESIS PROJECT & REAL CLIENT PLATFORM",
    desc: "I solo-built and defended a full-stack platform for a real gym client with no prior digital system where attendance and membership were previously tracked manually. The system includes three distinct roles (Admin, Trainer, Client), contactless QR attendance scanning, automated membership tracking, and revenue reporting with exportable HTML/Excel reports. Revenue, expenses, and net profit are visualized through interactive Chart.js dashboards (line and doughnut charts), alongside client-facing weight, BMI, and strength progress charts.",
    codeUrl: "https://github.com/kurt-farinas/gym-management-systemv2",
    highlights: [
      "QR Code Attendance Scanner: Replaced manual paper logbooks with instant camera QR check-ins.",
      "Interactive Chart.js Analytics: Dashboards with revenue trends (line), revenue by category (doughnut), expense trends (line), expense breakdown (doughnut), net profit, and client weight/BMI/strength progress.",
      "POS Receipts & Financial Reports: PDF receipt generation for POS transactions alongside downloadable HTML and Excel (.xls) revenue exports.",
      "Solo Full-Stack Architecture: Built independently using custom PHP, MySQL database schema, Tailwind CSS, and AJAX."
    ],
    stack: ["PHP", "MySQL", "JavaScript", "Tailwind CSS", "Chart.js", "QR"],
    slides: [
      { src: 'gym-admin.png', label: 'Admin Analytics & Financials', tab: 'Admin' },
      { src: 'gym-trainer.png', label: 'Trainer Panel', tab: 'Trainer' },
      { src: 'gym-client.png', label: 'Client Portal', tab: 'Client' }
    ]
  }
};

export const workflowMessages = {
  hris: [
    "Step 1: Applicant fills out CS Form No. 6 leave application and attaches uploaded e-signature image.",
    "Step 2: Admin reviews application details in division office management portal.",
    "Step 3: Approver grants final digital sign-off and system generates print-optimized CS Form No. 6 document with stamped signatures."
  ],
  gym: [
    "Step 1: Member scans personal QR code at gym entrance camera terminal.",
    "Step 2: Asynchronous AJAX request verifies membership status and expiration in MySQL.",
    "Step 3: Visual/audio green light access granted and timestamped attendance record created.",
    "Step 4: Real-time update sent to owner revenue, workout tracking, and active visitor dashboard."
  ]
};
