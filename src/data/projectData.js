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
    badge: "DepEd OJT · Frontend Owner",
    desc: "DepEd San Jose's leave approval process ran on paper across 30+ division office staff and teachers with no audit trail and multi-day turnaround. I owned 100% of frontend development for a web system that digitized the full Applicant → Admin → Approver workflow, replacing manual CS Form No. 6 routing with print-ready PDF output and signature uploads tied directly to the approval chain.",
    cardSummary: "Delivered a three-role leave workflow for 30+ staff, replacing manual paper routing with automated PDF output.",
    codeStub: "Private repository: organizational confidentiality. Technical walkthrough available on request.",
    caseStudy: {
      problem: "DepEd San Jose's leave approval process ran entirely on paper. CS Form No. 6 documents were printed, hand-signed, and physically routed between 30+ staff, with no audit trail and multi-day turnaround.",
      decision: "Built a 3-role web workflow (Applicant → Admin → Approver) using React + Inertia.js on a Laravel backend, replacing physical routing with digital state transitions and e-signature stamping.",
      implementation: "Owned 100% of frontend development: form validation, multi-step approval UI, role-gated views, and a print-optimized PDF engine using browser-native print stylesheets with verified e-signature image stamping.",
      tradeoffs: "Used browser-native print CSS for PDF generation instead of a server-side library (wkhtmltopdf/DomPDF) for simpler deployment. Output depends on client browser rendering, which is acceptable for internal division office use.",
      result: "System delivered and deployed to DepEd San Jose Division Office. Earned 98/100 OJT performance rating across 342 logged internship hours. Backend developed by Denver Ballesteros."
    },
    architectureFlow: [
      { label: "React", sub: "Frontend" },
      { label: "Inertia.js", sub: "SPA Bridge" },
      { label: "Laravel", sub: "Backend" },
      { label: "MySQL", sub: "Database" }
    ],
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
      langTag: "JS / STATE MACHINE",
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
    badge: "Solo Full-Stack · 119 Passing Tests",
    cardSummary: "Rebuilt the thesis platform after a security audit, preserving core workflows with role-based access and 119 passing Pest tests.",
    desc: "Solo-built and later rebuilt member management and revenue platform after a self-conducted security audit surfaced real vulnerabilities in the original PHP build (public file storage, missing upload validation). Rearchitected on Laravel 12 with Inertia.js and React, covering 28 domain tables and 86 protected routes (92 total) with role-based access, backed by 119 passing Pest tests.\n\nBeyond core gym operations, the platform includes a relational workout plan builder (exercises, sets, reps, difficulty tiers), structured nutrition and meal planning with macro tracking, and client-facing progress logging for body metrics and completed workouts, giving trainers and clients a full coaching loop, not just administrative tooling.",
    caseStudy: {
      problem: "The original PHP thesis build had critical security issues I discovered post-defense: publicly accessible file storage, missing upload validation, no CSRF protection, and raw SQL queries vulnerable to injection.",
      decision: "Full rebuild on Laravel 12 with Inertia.js and React rather than patching. The original architecture made incremental fixes impractical because routing, auth, and data access were tightly coupled with no separation of concerns.",
      implementation: "Designed 28 normalized domain tables from scratch. Implemented 86 protected routes across 92 total with RBAC gates (Admin, Trainer, Client). Built contactless QR attendance with a 5-minute (300-second) server-side attendance state machine (checks in, returns 'already checked in' on repeat scans within 5 minutes, checks out and calculates duration after 5 minutes), POS with receipt generation, Chart.js analytics dashboards, and streamed CSV report exports with UTF-8 BOM for Excel/Sheets compatibility.",
      tradeoffs: "Full rebuild cost ~3 months vs. patching in weeks. Justified because the original had no tests, no middleware, and adding security retroactively would have required rewriting most controllers anyway. Also gained 119 Pest tests covering auth, gates, registration, and attendance flows.",
      result: "All original thesis features preserved with proper security (CSRF, validated uploads, private storage, parameterized queries). 119 passing Pest tests. Public repository available for code inspection."
    },
    architectureFlow: [
      { label: "React", sub: "Frontend" },
      { label: "Inertia.js", sub: "SPA Bridge" },
      { label: "Laravel 12", sub: "Controllers + RBAC" },
      { label: "MySQL", sub: "28 Tables" }
    ],
    demoUrl: "https://gym-management-systemv2.vercel.app/",
    codeUrl: "https://github.com/kurt-farinas/gym-management-systemv2",
    highlights: [
      "Security-Driven Full-Stack Rebuild: Rearchitected on Laravel 12 with Inertia.js and React, covering 28 domain tables and 86 protected routes (92 total) with strict role-based access.",
      "119 Passing Pest Tests: Built comprehensive test coverage across authentication, authorization gates, member registration, and attendance tracking.",
      "Server-Side QR Attendance State Machine: 5-minute (300-second) server-side state machine that checks in, returns 'already checked in' on repeat scans within 5 minutes, and checks out with duration calculation after 5 minutes.",
      "Chart.js Analytics & Financials: Interactive revenue trend curves, expense breakdowns, net profit tracking, and member BMI/strength progress dashboards.",
      "POS Receipts & Streamed CSV Reports: POS receipt generation alongside streamed CSV financial reports with UTF-8 BOM for Excel/Sheets compatibility."
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
      { step: "01", title: "QR Camera Ingestion", desc: "Camera scanner reads personal member QR token and posts payload to attendance API." },
      { step: "02", title: "5-Min State Machine Gate", desc: "Laravel 12 validates active plan, enforces 5-min cooldown, or calculates checkout duration." },
      { step: "03", title: "Live Telemetry & Dashboard", desc: "Access granted; attendance logged; real-time revenue & active occupancy updated." }
    ],
    codeSnippet: {
      langTag: "PHP / ATTENDANCE STATE MACHINE",
      title: "Server-Side QR Attendance State Machine (5-Minute Cooldown)",
      code: `public function scan(Request $request): JsonResponse
{
    $request->validate([
        'qr_code_token' => ['required', 'string', 'size:64'],
    ]);

    $token = $request->input('qr_code_token');

    // Documented rule: 64-character unguessable token lookup
    $user = User::where('qr_code_token', $token)->firstOrFail();

    // Validate membership status
    if ($user->membership_status !== 'active' || ($user->membership_expires_at && $user->membership_expires_at->isPast())) {
        return response()->json([
            'message' => 'Membership is expired or inactive.',
        ], 422);
    }

    $latestAttendance = Attendance::where('user_id', $user->id)
        ->latest('checked_in_at')
        ->first();

    // If there is an open check-in session
    if ($latestAttendance && $latestAttendance->checked_out_at === null) {
        $checkedInTimestamp = $latestAttendance->checked_in_at->getTimestamp();
        $nowTimestamp = now()->getTimestamp();
        $diffInSeconds = $nowTimestamp - $checkedInTimestamp;

        // 5-minute cooldown: scan within 5 minutes returns "already checked in", does not check out
        if ($diffInSeconds < 300) {
            return response()->json([
                'status' => 'already_checked_in',
                'message' => 'Already checked in. Please wait before scanning again.',
                'user_id' => $user->id,
            ]);
        }

        // Scan after 5 minutes: check out and calculate duration
        $durationMinutes = (int) max(1, round($diffInSeconds / 60));
        $latestAttendance->update([
            'checked_out_at' => now(),
            'duration_minutes' => $durationMinutes,
        ]);

        return response()->json([
            'status' => 'checked_out',
            'user_id' => $user->id,
            'duration_minutes' => $durationMinutes,
        ]);
    }

    // Subsequent scan creates a new check-in
    $attendance = Attendance::create([
        'user_id' => $user->id,
        'checked_in_at' => now(),
        'check_in_method' => 'qr',
    ]);

    return response()->json([
        'status' => 'checked_in',
        'user_id' => $user->id,
        'checked_in_at' => $attendance->checked_in_at->toDateTimeString(),
    ]);
}`
    },
    slides: [
      { src: '/boiyets-landing.png', label: "Boiyet's Gym Landing Page", tab: 'Landing' },
      { src: '/gym-admin.png', label: 'Admin Dashboard · Financials & User Access', tab: 'Admin' },
      { src: '/gym-trainer.png', label: 'Trainer Portal · Schedules & Client Tracking', tab: 'Trainer' },
      { src: '/gym-client.png', label: 'Client Portal · QR Attendance & Profile', tab: 'Client' }
    ]
  }
};

export const timelineData = [
  {
    id: 1,
    date: "2022 - 2026",
    title: "BS Computer Science | STI College San Jose",
    desc: "Bachelor of Science in Computer Science. Honored on the Presidential List (2022) with academic coursework in software engineering, database architecture, and OOP.",
    badge: "PRESIDENTIAL LIST (2022)",
    badgeType: "status-open-to-work",
    isFeatured: true
  },
  {
    id: 2,
    date: "FEB - MAR 2026 (342 HOURS)",
    title: "Software Developer Intern (OJT) | DepEd San Jose",
    desc: "Owned frontend development for the CS Form No. 6 Digitalization System (React, Inertia.js, Tailwind, Laravel). Replaced manual paper routing with 3-role RBAC, e-signatures, and print PDFs. Wrote 19 PHPUnit tests (AAA pattern) and earned 98/100 rating across appraisals.",
    badge: "98/100 OJT RATING",
    isFeatured: true
  },
  {
    id: 3,
    date: "NOVEMBER 2025",
    title: "Gym Management System | Thesis Defense (Defended)",
    desc: "Built and defended a commercial gym management platform (PHP, MySQL) with Admin, Trainer, and Client portals, POS with low-stock alerts, and contactless QR attendance with duplicate-scan protection.",
    badge: "THESIS DEFENDED",
    isFeatured: true
  }
];

export const awardsData = [
  {
    id: "thinkquest-champ",
    title: "ThinkQuest Champion | Tagisan ng Talino",
    issuer: "STI College San Jose · School Level · Mar 2025",
    category: "Academic Competition",
    isChampion: true
  },
  {
    id: "cisco-cyber",
    title: "Introduction to Cybersecurity",
    issuer: "Cisco Networking Academy · Sep 2025",
    category: "Industry Certification",
    isChampion: false
  },
  {
    id: "java-oracle",
    title: "Java Fundamentals | Terms 1 & 2",
    issuer: "Oracle Academy · 2023",
    category: "Technical Certification",
    isChampion: false
  },
  {
    id: "deped-sipp",
    title: "DepEd SIPP OJT Certificate of Completion",
    issuer: "DepEd Schools Division Office of San Jose City · Feb - Mar 2026",
    category: "Internship Credential",
    isChampion: false
  }
];

export const beyondTilesData = {
  gym: {
    id: "gym",
    title: "Gym & Physical Training",
    eyebrow: "01 · THE OFFLINE GRIND",
    badge: "Fitness & Health",
    photoSlot: "gym",
    photoCaption: "Photo frame · gym.jpg",
    desc: "Regular gym-goer focused on progressive overload and routine discipline. Living the day-to-day gym experience directly inspired me to design and solo-build the Boiyet's Fitness Gym Management System for real operational workflows.",
    tags: ["Push / Pull / Legs", "Consistency > Intensity", "Gym Thesis Origin"]
  },
  desk: {
    id: "desk",
    title: "Peripherals & Hardware",
    eyebrow: "02 · DESK ARSENAL",
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
    eyebrow: "03 · OLFACTORY",
    badge: "Collector",
    photoSlot: "perfume",
    photoCaption: "Photo frame · perfumes.jpg",
    desc: "Fascinated by fragrance architecture: how top, mid, and base notes evolve throughout the day like structured systems.",
    tags: ["Fresh Citrus", "Woody Amber", "Clean Musk", "Warm Vanilla"]
  },
  gaming: {
    id: "gaming",
    title: "Tactical & Sandbox",
    eyebrow: "04 · RESPAWN ZONE",
    badge: "Gaming",
    photoSlot: "gaming",
    photoCaption: "Photo frame · gaming.jpg",
    desc: "Unwinding through tactical team play, logic-driven sandbox builds, and casual variety sessions with friends.",
    // For /outside-the-ide route: genre labels
    tags: ["Tactical Team Play", "Sandbox Building", "Logic Puzzles", "Co-Op Sessions"]
  }
};

export const gearCatalogData = [
  {
    id: "mchose-ace60",
    title: "MCHOSE Ace 60 Pro",
    category: "Keyboard",
    section: "desk",
    sectionTitle: "Desk Setup and Gear",
    specs: "Magnetic Switches · 0.005mm RT Accuracy · 8K Polling · 0.1ms Latency · Hot-Swappable",
    desc: "Hall effect magnetic switch keyboard customized for rapid actuation, 8,000Hz polling rate, ultra-low input latency, and tactile typing precision during engineering & gaming.",
    icon: "keyboard",
    tags: ["Hall Effect", "0.005mm RT", "8K Polling", "0.1ms Latency"],
    url: "https://shopee.ph/MCHOSE-Ace60-Pro-Hall-Effect-Magnetic-Switch-Gaming-Keyboard-0.1ms-Latency-0.005mm-RT-Accuracy-8K-Polling-Rate-RGB-Hot-swappable-Gaming-Keyboard-i.1545423268.44003548801?extraParams=%7B%22display_model_id%22%3A290295496052%2C%22model_selection_logic%22%3A3%7D",
    featured: true,
    aspectRatio: "wide",
    images: [
      {
        src: "/images/outside/mchose-ace60.jpg",
        caption: "MCHOSE Ace 60 Pro — Magnetic switches with 0.005mm rapid trigger accuracy and 8K polling",
        alt: "MCHOSE Ace 60 Pro Keyboard Overview"
      },
      {
        src: "/images/outside/mchose-ace60-detail.jpg",
        caption: "Custom lubed Hall Effect switches & CNC aluminum chassis profile",
        alt: "MCHOSE Ace 60 Pro Switch Details"
      }
    ]
  },
  {
    id: "attack-shark-x6",
    title: "Attack Shark X6",
    category: "Mouse",
    section: "desk",
    sectionTitle: "Desk Setup and Gear",
    specs: "PAW3395 Sensor · 49g Ultralight · Tri-Mode Wireless · RGB Magnetic Dock",
    desc: "Tri-mode wireless gaming mouse equipped with PixArt PAW3395 flagship optical sensor and magnetic quick-charge dock.",
    icon: "mouse",
    tags: ["PAW3395", "49g", "Tri-Mode Wireless", "RGB Dock"],
    url: "https://shopee.ph/Attack-Shark-X6-Wireless-Ergonomic-Gaming-Mouse-Adjustable-DPI-Wired-2.4G-Bluetooth-High-Precision-Rechargeable-Mice-i.1672861652.40931474667?extraParams=%7B%22display_model_id%22%3A426019836346%2C%22model_selection_logic%22%3A3%7D",
    featured: false,
    aspectRatio: "standard",
    images: [
      {
        src: "/images/outside/attack-shark-x6.jpg",
        caption: "Attack Shark X6 on magnetic RGB fast-charging dock",
        alt: "Attack Shark X6 Wireless Mouse"
      }
    ]
  },
  {
    id: "koorui-24e3",
    title: "Koorui G2411P (24E3 V2)",
    category: "Display",
    section: "desk",
    sectionTitle: "Desk Setup and Gear",
    specs: "24\" FHD 1080p · 200Hz IPS · 1ms MPRT · FreeSync / G-Sync · Powered by HKC",
    desc: "High-refresh 200Hz FHD IPS panel delivering smooth frame pacing, accurate color reproduction, and zero screen tearing for engineering workflows and tactical gaming.",
    icon: "display",
    tags: ["200Hz IPS", "1ms MPRT", "FHD 1080p", "FreeSync"],
    url: "https://shopee.ph/Koorui-G2411P-(24E3-V2-powered-by-HKC)-24-Monitor-G2711P-27-FHD-IPS-200Hz-GamingMonitor-COD-i.199257947.20253645196?extraParams=%7B%22display_model_id%22%3A247851053729%2C%22model_selection_logic%22%3A3%7D",
    featured: false,
    aspectRatio: "standard",
    images: [
      {
        src: "/images/outside/koorui-24e3.jpg",
        caption: "Koorui G2411P 200Hz IPS — Crisp text rendering and fast motion clarity",
        alt: "Koorui G2411P Display"
      }
    ]
  },
  {
    id: "salnotes-zero",
    title: "7Hz Salnotes Zero",
    category: "Audio",
    section: "desk",
    sectionTitle: "Desk Setup and Gear",
    specs: "10mm Dynamic Driver · Metal Faceplate · 0.78mm 2-Pin Detachable Cable · Hi-Fi Tuning",
    desc: "In-Ear Monitors tuned with neutral sound signature for acoustic clarity, spatial awareness, and fatigue-free listening across long coding sessions.",
    icon: "audio",
    tags: ["10mm Driver", "Detachable Cable", "Hi-Fi Tuning", "IEM"],
    url: "https://shopee.ph/7Hz-Salnotes-Zero-TYPE-C-3.5mm-10mm-Dynamic-Driver-In-Ear-Earphone-HIFI-Audio-Music-Earbuds-Headset-0.78mm-Detachable-Cable-i.418622941.23676487815?extraParams=%7B%22display_model_id%22%3A59687074016%2C%22model_selection_logic%22%3A3%7D",
    featured: false,
    aspectRatio: "standard",
    images: [
      {
        src: "/images/outside/salnotes-zero.jpg",
        caption: "7Hz Salnotes Zero IEMs with custom braided 2-pin cable",
        alt: "7Hz Salnotes Zero In-Ear Monitors"
      }
    ]
  },
  {
    id: "asus-tuf-a15",
    title: "ASUS TUF Gaming A15 (2023)",
    category: "Compute & Battlestation",
    section: "desk",
    sectionTitle: "Desk Setup and Gear",
    specs: "AMD Ryzen 7 · NVIDIA GeForce RTX 40-Series · 144Hz FHD · MUX Switch + Advanced Optimus",
    desc: "My primary development and gaming battlestation engineered for high-performance compile cycles, containerized services, Docker containers, and high-intensity gaming.",
    icon: "laptop",
    tags: ["Ryzen 7", "RTX 40-Series", "MUX Switch", "Dev Rig"],
    url: "https://www.asus.com/ph/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2023/",
    featured: true,
    aspectRatio: "wide",
    images: [
      {
        src: "/images/outside/asus-tuf-a15.jpg",
        caption: "ASUS TUF Gaming A15 (2023) — Primary development and gaming powerhouse",
        alt: "ASUS TUF Gaming A15 (2023) Battlestation Rig"
      }
    ]
  },
  {
    id: "iphone-11",
    title: "iPhone 11",
    category: "Mobile Device",
    section: "desk",
    sectionTitle: "Desk Setup and Gear",
    specs: "Liquid Retina HD Display · A13 Bionic · 4K Video · Viewport Testing",
    desc: "Everyday communications device and handheld viewport for verifying responsive web builds, mobile layouts, and touch UX.",
    icon: "smartphone",
    tags: ["A13 Bionic", "Liquid Retina", "Mobile Testing", "iOS"],
    url: "https://support.apple.com/kb/SP804",
    featured: false,
    aspectRatio: "standard",
    images: [
      {
        src: "/images/outside/mobile-device.jpg",
        caption: "iPhone 11 — Handheld viewport for mobile layout inspection and responsive testing",
        alt: "iPhone 11 Mobile Testing Device"
      }
    ]
  },
  {
    id: "gym-kit",
    title: "Gym & Progressive Training Kit",
    category: "Fitness & Health",
    section: "edc",
    sectionTitle: "Snapshots",
    specs: "Lifting Straps · Protein Shaker · Progressive Overload Logbook",
    desc: "The physical discipline behind the thesis. Regular barbell and dumbbell training that directly inspired the architecture of Boiyet's Gym Management System.",
    icon: "dumbbell",
    tags: ["Push/Pull/Legs", "Progressive Overload", "Thesis Origin"],
    url: null,
    featured: true,
    aspectRatio: "wide",
    images: [
      {
        src: "/images/outside/gym-training.jpg",
        caption: "Barbell station & training setup — The offline consistency engine",
        alt: "Gym Training & Progressive Overload"
      },
      {
        src: "/images/outside/gym-gear.jpg",
        caption: "Heavy-duty lifting straps, shaker, and workout logs",
        alt: "Lifting Essentials"
      }
    ]
  },
  {
    id: "tactical-gaming",
    title: "Tactical & Sandbox Setup",
    category: "Tactical Gaming",
    section: "edc",
    sectionTitle: "Snapshots",
    specs: "Tactical Team Play · Logic Sandboxes · Low-Latency Voice Channels",
    desc: "Strategy, team coordination, and logic puzzle sandboxes for unwinding after intense coding sessions with friends.",
    icon: "gamepad",
    tags: ["Tactical Play", "Sandbox Building", "Voice Comms", "Team Strategy"],
    url: null,
    featured: false,
    aspectRatio: "standard",
    images: [
      {
        src: "/images/outside/gaming-setup.jpg",
        caption: "Tactical and sandbox session environment with low-latency comms",
        alt: "Tactical Gaming Rig Setup"
      }
    ]
  },
  {
    id: "hawas-ice",
    title: "Rasasi Hawas Ice",
    category: "Fresh Aquatic & Citrus",
    section: "rituals",
    sectionTitle: "Fragrance Collection",
    specs: "Frozen Apple · Italian Bergamot · Lemon · Star Anise · Plum · Ambergris",
    desc: "Crisp icy aquatic fragrance opening with frosty apple and bright citrus, drying down into smooth ambergris, driftwood, and clean musk.",
    icon: "perfume",
    tags: ["Frozen Apple", "Italian Bergamot", "Ambergris", "Beast Mode"],
    url: "https://shopee.ph/Dubai-Shop-Hawas-Ice-Her-Tropical-Perfumes-i.325803687.24497320511?extraParams=%7B%22display_model_id%22%3A321003737550%2C%22model_selection_logic%22%3A3%7D",
    featured: true,
    aspectRatio: "wide",
    images: [
      {
        src: "/images/outside/hawas-ice.jpg",
        caption: "Rasasi Hawas Ice — Icy frozen apple, Italian citrus, and ambergris",
        alt: "Rasasi Hawas Ice Perfume Bottle"
      }
    ]
  },
  {
    id: "afnan-sce",
    title: "Afnan Supremacy Collector's Edition",
    category: "Smoky Fruity Chypre",
    section: "rituals",
    sectionTitle: "Fragrance Collection",
    specs: "Pineapple · Blackcurrant · Apple · White Birch · Smoke · Ambergris · Oakmoss",
    desc: "Extrait de parfum featuring bold pineapple and blackcurrant balanced by smoky birch wood, earthy oakmoss, and rich ambergris.",
    icon: "perfume",
    tags: ["Pineapple", "Blackcurrant", "Smoky Birch", "Extrait de Parfum"],
    url: "https://shopee.ph/Afnan-Supremacy-Collectors-Edition-EDP-Perfume-100ML-i.325803687.44858179840?extraParams=%7B%22display_model_id%22%3A356401554492%2C%22model_selection_logic%22%3A3%7D",
    featured: false,
    aspectRatio: "standard",
    images: [
      {
        src: "/images/outside/afnan-sce.jpg",
        caption: "Afnan Supremacy Collector's Edition — Smoky pineapple, birch, and oakmoss",
        alt: "Afnan Supremacy Collector's Edition Bottle"
      }
    ]
  },
  {
    id: "liquid-brun",
    title: "Liquid Brun · French Avenue",
    category: "Warm Spicy Gourmand",
    section: "rituals",
    sectionTitle: "Fragrance Collection",
    specs: "Bourbon Vanilla · Cinnamon · Orange Blossom · Cardamom · Praline · Guaiac Wood",
    desc: "Luxurious warm spicy profile inspired by PdM Althair with creamy bourbon vanilla, toasted cinnamon, orange blossom, and rich woody undertones.",
    icon: "perfume",
    tags: ["Bourbon Vanilla", "Cinnamon", "Althair DNA", "Warm Gourmand"],
    url: "https://shopee.ph/Liquid-Brun-100ML-l-Limited-Edition-150ML-by-French-Avenue-(PDM-Althair)-i.325803687.40556445433?extraParams=%7B%22display_model_id%22%3A345664012222%2C%22model_selection_logic%22%3A3%7D",
    featured: true,
    aspectRatio: "wide",
    images: [
      {
        src: "/images/outside/liquid-brun.jpg",
        caption: "Liquid Brun by French Avenue — Bourbon vanilla, toasted cinnamon, and praline",
        alt: "Liquid Brun French Avenue Bottle"
      }
    ]
  },
  {
    id: "jaguar-red",
    title: "Jaguar Classic Red",
    category: "Fruity Aromatic Wood",
    section: "rituals",
    sectionTitle: "Fragrance Collection",
    specs: "Raspberry · Blueberry · Bergamot · Jasmine · Cedarwood · Amber · Tonka Bean",
    desc: "Smooth dynamic daily wear opening with tart red and blue berries, deepening into cedarwood, warm amber, and creamy tonka bean.",
    icon: "perfume",
    tags: ["Red Berries", "Warm Amber", "Cedarwood", "Daily Scent"],
    url: "https://shopee.ph/Jaguar-Classic-Red-Jaguar-for-men-i.220864586.26781305475?extraParams=%7B%22display_model_id%22%3A215932815162%2C%22model_selection_logic%22%3A3%7D",
    featured: false,
    aspectRatio: "standard",
    images: [
      {
        src: "/images/outside/jaguar-red.jpg",
        caption: "Jaguar Classic Red — Sweet berries, cedarwood, and tonka bean",
        alt: "Jaguar Classic Red Perfume Bottle"
      }
    ]
  }
];

export const snapshotsDeckData = [
  {
    id: "deck-barbell",
    title: "Barbell & Progressive Training",
    subtitle: "The physical discipline behind the thesis engineering & system architecture",
    date: "Discipline & Health",
    src: "/images/outside/gym-training.jpg",
    alt: "Gym Training & Progressive Overload",
    caption: "Barbell station & training setup — The offline consistency engine"
  },
  {
    id: "deck-gear",
    title: "Lifting Gear & Workout Log",
    subtitle: "Heavy-duty lifting straps, shaker, and trackable progressive overload logs",
    date: "Daily Grind",
    src: "/images/outside/gym-gear.jpg",
    alt: "Lifting Essentials & Workout Logs",
    caption: "Heavy-duty lifting straps, shaker, and workout logs"
  },
  {
    id: "deck-mobile",
    title: "Field Rig & Mobile Testing",
    subtitle: "iPhone 11 handheld viewport for verifying responsive web builds and MFA",
    date: "Daily Carry",
    src: "/images/outside/mobile-device.jpg",
    alt: "iPhone 11 Mobile Testing Device",
    caption: "iPhone 11 — Handheld viewport for mobile layout inspection and responsive testing"
  },
  {
    id: "deck-tactical",
    title: "Tactical & Sandbox Sessions",
    subtitle: "Strategy, team coordination, and logic puzzle sandboxes after coding sprints",
    date: "Logic Sandboxes",
    src: "/images/outside/gaming-setup.jpg",
    alt: "Tactical Gaming Setup",
    caption: "Tactical and sandbox session environment with low-latency comms"
  },
  {
    id: "deck-battlestation",
    title: "Battlestation Powerhouse",
    subtitle: "ASUS TUF A15 development rig engineered for containerized services & compiles",
    date: "Dev Station",
    src: "/images/outside/asus-tuf-a15.jpg",
    alt: "ASUS TUF Gaming A15",
    caption: "ASUS TUF Gaming A15 (2023) — Primary development and gaming powerhouse"
  }
];

