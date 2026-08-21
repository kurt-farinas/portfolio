/* ========================================
   PROJECT DATA  |  Single Source of Truth
   ======================================== */

export const projectDetails = {
  hris: {
    id: "hris",
    title: "CS Form No. 6 Digitalization System",
    ticketId: "DepEd OJT Project",
    stamp: "98/100 OJT Rating (342 Hrs)",
    roleTag: "Frontend Ownership",
    statusBadge: '<span class="status-dot-amber"></span> Delivered to Division Office',
    badge: "DepEd San Jose Division Office · 342 Hours Logged",
    desc: "DepEd San Jose's leave approval process ran on paper across 30+ division office staff and teachers with no audit trail and multi-day turnaround. I owned 100% of frontend development for a web system that digitized the full Applicant → Admin → Approver workflow, replacing manual CS Form No. 6 routing with print-ready PDF output and signature uploads tied directly to the approval chain.",
    codeStub: "Code available on request",
    highlights: [
      "Earned a 98/100 Performance Rating across 342 logged OJT internship hours at DepEd San Jose Division Office.",
      "Implemented 3-Role Workflow: Applicant application submission → Admin verification → Approver digital sign-off.",
      "Print-Optimized PDF Engine: Formatted official CS Form No. 6 documents via browser-native print stylesheets with verified e-signature image stamping.",
      "Owned 100% of frontend development using React, Inertia.js, and Tailwind CSS."
    ],
    stack: ["React", "Inertia.js", "Tailwind CSS", "Laravel", "MySQL"],
    telemetry: [
      "Frontend Ownership",
      "3-Tier RBAC",
      "Print PDF Engine",
      "98/100 Rating"
    ],
    architecturePipeline: [
      { step: "01", title: "Applicant Submission", desc: "Applicant fills Form 6 details and attaches uploaded e-signature." },
      { step: "02", title: "Admin Verification", desc: "Division office verifies leave credits and flags in management portal." },
      { step: "03", title: "Approver Sign-Off", desc: "Division authority grants final sign-off; stamped PDF generated." }
    ],
    codeSnippet: {
      title: "Multi-Role State Machine & Approval Workflow",
      code: `// Multi-Role Leave Approval State Machine (CS Form No. 6)
const ApprovalStateMachine = {
  DRAFT: { submit: () => 'PENDING_ADMIN_VERIFICATION' },
  PENDING_ADMIN_VERIFICATION: {
    verify: (adminId) => ({ state: 'PENDING_APPROVER_SIGN', verifiedBy: adminId }),
    reject: (reason) => ({ state: 'REJECTED', reason })
  },
  PENDING_APPROVER_SIGN: {
    approve: (approverSig) => ({ 
      state: 'APPROVED_AND_STAMPED', 
      pdfOutput: generateForm6Pdf(approverSig) 
    }),
    returnForRevision: (remarks) => ({ state: 'RETURNED', remarks })
  }
};`
    },
    slides: [
      { src: 'hris-admin.png', label: 'Admin Dashboard', tab: 'Admin' },
      { src: 'hris-approver.png', label: 'Approver Interface', tab: 'Approver' },
      { src: 'hris-applicant.png', label: 'Applicant Form', tab: 'Applicant' }
    ]
  },
  gym: {
    id: "gym",
    title: "Boiyet's Fitness Gym Management System",
    ticketId: "Thesis Project & Client Platform",
    stamp: "Defended Thesis · Client System",
    roleTag: "Solo Full-Stack Developer",
    statusBadge: '<span class="status-dot-green"></span> Defended Thesis Platform',
    badge: "Defended Thesis & Real Client Platform",
    desc: "Solo-built and defended a full-stack web platform for a real gym client where attendance and membership were previously tracked on paper. The system features role-based access for Admin, Trainer, and Client, contactless camera QR check-ins, automated plan expirations, and financial reporting with exportable HTML and Excel sheets. Revenue and expenses are tracked in real time using Chart.js dashboards.",
    codeUrl: "https://github.com/kurt-farinas/gym-management-systemv2",
    highlights: [
      "QR Code Attendance Scanner: Replaced manual paper logbooks with instant camera QR check-ins.",
      "Interactive Chart.js Analytics: Dashboards with revenue trends (line), revenue by category (doughnut), expense trends (line), expense breakdown (doughnut), net profit, and client weight/BMI/strength progress.",
      "POS Receipts & Financial Reports: PDF receipt generation for POS transactions alongside downloadable HTML and Excel (.xls) revenue exports.",
      "Solo Full-Stack Architecture: Built independently using custom PHP, MySQL database schema, Tailwind CSS, and AJAX."
    ],
    stack: ["PHP", "MySQL", "JavaScript", "Tailwind CSS", "Chart.js", "QR"],
    telemetry: [
      "Solo Full-Stack",
      "QR Camera Scanner",
      "Chart.js Analytics",
      "POS & Excel Reports"
    ],
    architecturePipeline: [
      { step: "01", title: "QR Ingestion", desc: "Contactless camera scanner reads personal member token with 3s debounce." },
      { step: "02", title: "AJAX Auth Verification", desc: "Asynchronous PHP script validates active plan and expiration in MySQL." },
      { step: "03", title: "Live Telemetry Update", desc: "Access granted; attendance logged; real-time revenue & occupancy updated." }
    ],
    codeSnippet: {
      title: "Contactless QR Scanner & Real-Time Verification",
      code: `// Real-Time Contactless QR Verification Pipeline
async function handleQrScan(memberToken) {
  if (isDebounced(memberToken, 3000)) return; // Prevent duplicate scan bursts
  
  const response = await fetch('/api/attendance/checkin.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: memberToken, timestamp: Date.now() })
  });
  
  const { status, member, planValid } = await response.json();
  if (status === 'ACTIVE' && planValid) {
    triggerGreenLightAccess(member.name);
    syncDashboardMetrics({ activeCheckins: '+1' });
  }
}`
    },
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
