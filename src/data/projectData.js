/* ========================================
   PROJECT DATA & SITE CONTENT  |  Single Source of Truth
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
    cardSummary: "Digitized paper-based Form 6 leave approvals for 30+ division office staff with 3-role permissions and automated PDF generation.",
    codeStub: "Code available on request",
    highlights: [
      "Earned a 98/100 Performance Rating across 342 logged OJT internship hours at DepEd San Jose Division Office.",
      "Implemented 3-Role Workflow: Applicant application submission → Admin verification → Approver digital sign-off.",
      "Print-Optimized PDF Engine: Formatted official CS Form No. 6 documents via browser-native print stylesheets with verified e-signature image stamping.",
      "Owned 100% of frontend development using React, Inertia.js, and Tailwind CSS."
    ],
    stack: ["React", "Inertia.js", "Tailwind CSS", "Laravel", "MySQL"],
    filterSkills: ["react", "inertia", "tailwind", "laravel", "javascript"],
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
    stamp: "119 Passing Tests · Laravel 12 Rebuild",
    roleTag: "Solo Full-Stack Developer",
    statusBadge: '<span class="status-dot-green"></span> Production-Tested Rebuild',
    badge: "Solo Full-Stack · Security-Driven Rebuild · 119 Passing Tests · QR Attendance",
    cardSummary: "Solo-built and later rebuilt member management and revenue platform after a self-conducted security audit surfaced real vulnerabilities in the original PHP build (public file storage, missing upload validation). Rearchitected on Laravel 12 with Inertia.js and React, covering 29 domain tables and 88 of 92 routes with role-based access, backed by 119 passing Pest tests.",
    desc: "Solo-built and later rebuilt member management and revenue platform after a self-conducted security audit surfaced real vulnerabilities in the original PHP build (public file storage, missing upload validation). Rearchitected on Laravel 12 with Inertia.js and React, covering 29 domain tables and 88 of 92 routes with role-based access, backed by 119 passing Pest tests.",
    codeUrl: "https://github.com/kurt-farinas/gym-management-systemv2",
    highlights: [
      "Security-Driven Full-Stack Rebuild: Rearchitected on Laravel 12 with Inertia.js and React, covering 29 domain tables and 88 of 92 routes with strict role-based access.",
      "119 Passing Pest Tests: Built comprehensive test coverage across authentication, authorization gates, member registration, and attendance tracking.",
      "Contactless QR Attendance Scanner: Instant camera QR check-ins with client-side debounce and server-side membership validation.",
      "Chart.js Analytics & Financials: Interactive revenue trend curves, expense breakdowns, net profit tracking, and member BMI/strength progress dashboards.",
      "POS Receipts & Excel Reports: PDF receipt generation for POS retail transactions alongside downloadable HTML and Excel (.xls) financial summaries."
    ],
    stack: ["Laravel 12", "Inertia.js", "React", "Tailwind CSS", "MySQL", "Pest", "QR"],
    filterSkills: ["laravel", "inertia", "react", "tailwind", "mysql", "pest", "qr", "javascript"],
    telemetry: [
      "Solo Full-Stack",
      "Security Rebuild",
      "119 Pest Tests",
      "QR Attendance"
    ],
    architecturePipeline: [
      { step: "01", title: "QR Camera Ingestion", desc: "Contactless camera scanner reads personal member token with 3s debounce." },
      { step: "02", title: "Pest-Tested Auth Gate", desc: "Laravel 12 controller validates active plan, expiration, and multi-tenant constraints." },
      { step: "03", title: "Live Telemetry & Dashboard", desc: "Access granted; attendance logged; real-time revenue & active occupancy updated." }
    ],
    codeSnippet: {
      title: "Contactless QR Scanner & Real-Time Verification",
      code: `// Real-Time Contactless QR Verification Pipeline
async function handleQrScan(memberToken) {
  if (isDebounced(memberToken, 3000)) return; // Prevent duplicate scan bursts
  
  const response = await fetch('/api/attendance/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
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
      { src: 'gym-admin.png', label: 'Admin Analytics & Financials (Chart.js)', tab: 'Admin' },
      { src: 'gym-trainer.png', label: 'Trainer Panel & POS Records', tab: 'Trainer' },
      { src: 'gym-client.png', label: 'Client Portal & QR Passes', tab: 'Client' }
    ]
  }
};

export const timelineData = [
  {
    id: 1,
    date: "JULY 2026",
    title: "Graduated | BS Computer Science",
    desc: "Graduated with a Bachelor of Science in Computer Science from STI College San Jose.",
    badge: "OPEN_TO_WORK",
    badgeType: "status-open-to-work",
    isFeatured: false
  },
  {
    id: 2,
    date: "FEB – MARCH 2026 (342 HOURS)",
    title: "DepEd San Jose Division Office OJT",
    desc: "Owned 100% of frontend development for the DepEd CS Form No. 6 Digitalization System. Digitalized leave requests for ICT staff & teachers. Earned 98/100 performance rating.",
    badge: "98/100 PERFORMANCE RATING",
    isFeatured: true
  },
  {
    id: 3,
    date: "NOVEMBER 2025",
    title: "Boiyet's Gym Management Thesis Defense",
    desc: "Solo-built and defended a commercial gym management platform featuring QR attendance scanning, revenue analytics, and member fitness tracking.",
    badge: "THESIS DEFENDED",
    isFeatured: true
  },
  {
    id: 4,
    date: "SEPTEMBER 2025",
    title: "Cisco Cybersecurity Certification",
    desc: "Earned official Introduction to Cybersecurity certification from Cisco Networking Academy, applying secure authentication principles to web applications.",
    badge: "CERTIFIED",
    isFeatured: false
  },
  {
    id: 5,
    date: "MARCH 2024 & MARCH 2025",
    title: "2x Tagisan ng Talino | ThinkQuest Awards",
    desc: "Competed in STI College San Jose's annual Tagisan ng Talino academic competition, securing 3rd place in 2024 and crowning Champion (1st Place) in 2025.",
    badge: "COMPETITION CHAMPION",
    isFeatured: false
  },
  {
    id: 6,
    date: "2022 – 2026",
    title: "STI College San Jose | BS Computer Science",
    desc: "Enrolled in BSCS program; completed coursework in OOP, Database Systems, Web Development, and Java Fundamentals (Oracle Academy certified).",
    badge: "ACADEMIC FOUNDATION",
    isFeatured: false
  }
];

export const awardsData = [
  {
    id: "thinkquest-champ",
    title: "ThinkQuest Champion | Tagisan ng Talino",
    issuer: "STI College San Jose, School Level · Mar 2025",
    isChampion: true
  },
  {
    id: "java-oracle",
    title: "Java Fundamentals | 1st & 2nd Term",
    issuer: "Oracle Academy · 2023",
    isChampion: false
  },
  {
    id: "alumni-pres",
    title: "Alumni President | Batch 2025–2026",
    issuer: "STI College San Jose Alumni Association · 2025 – 2026",
    isChampion: false
  }
];

export const beyondTilesData = {
  gym: {
    id: "gym",
    title: "Gym & Physical Training",
    eyebrow: "// 01 · THE OFFLINE GRIND",
    badge: "Fitness & Health",
    photoSlot: "gym",
    photoCaption: "Photo frame · gym.jpg",
    desc: "Regular gym-goer focused on progressive overload and routine discipline. Living the day-to-day gym experience directly inspired me to design and solo-build the Boiyet's Fitness Gym Management System for real operational workflows.",
    tags: ["Push / Pull / Legs", "Consistency > Intensity", "Gym Thesis Origin"]
  },
  desk: {
    id: "desk",
    title: "Peripherals & Hardware",
    eyebrow: "// 02 · DESK ARSENAL",
    badge: "Battlestation Gear",
    photoSlot: "desk",
    photoCaption: "Photo frame · desk_setup.jpg",
    desc: "My daily driver hardware curated for tactile typing accuracy, clean audio, and responsive gaming sessions.",
    gear: [
      { type: "Keyboard", name: "MCHOSE Ace 60 Pro" },
      { type: "Mouse", name: "Attack Shark X6" },
      { type: "Audio", name: "7Hz Salnotes Zero IEMs" },
      { type: "Display", name: "Koorui 24E3 (165Hz IPS)" }
    ]
  },
  perfume: {
    id: "perfume",
    title: "Perfume Collection",
    eyebrow: "// 03 · OLFACTORY",
    badge: "Collector",
    photoSlot: "perfume",
    photoCaption: "Photo frame · perfumes.jpg",
    desc: "Fascinated by fragrance architecture—how top, mid, and base notes evolve throughout the day like structured systems.",
    tags: ["Fresh Citrus", "Woody Amber", "Clean Musk", "Warm Vanilla"]
  },
  gaming: {
    id: "gaming",
    title: "Tactical & Sandbox",
    eyebrow: "// 04 · RESPAWN ZONE",
    badge: "Gaming",
    photoSlot: "gaming",
    photoCaption: "Photo frame · gaming.jpg",
    desc: "Unwinding through tactical team play, logic-driven sandbox builds, and casual variety sessions with friends.",
    // For /outside-the-ide route: genre labels
    tags: ["Tactical Team Play", "Sandbox Building", "Logic Puzzles", "Co-Op Sessions"]
  },
  coffee: {
    id: "coffee",
    title: "Pure Black Coffee",
    eyebrow: "// 05 · DAILY FUEL",
    badge: "Ritual",
    photoSlot: "coffee",
    photoCaption: "Photo frame · black_coffee.jpg",
    desc: "Zero sugar. Zero milk. Pure black coffee powering late-night debugging sessions and uninterrupted focus states.",
    tags: ["100% Black", "Zero Sugar", "Hot & Iced", "Focus Catalyst"]
  }
};
