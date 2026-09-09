/* ========================================
   PROJECT DATA & SITE CONTENT  |  Single Source of Truth
   ======================================== */

export const projectDetails = {
  jobHuntLedger: {
    id: "job-hunt-ledger",
    title: "Job Hunt Ledger",
    ticketId: "Personal Developer Tool",
    stamp: "Local-Only · Privacy-First",
    roleTag: "Solo Full-Stack Developer",
    statusBadge: '<span class="status-dot-green"></span> Local-Only Personal Tool',
    badge: "Solo Full-Stack · Local-Only",
    browserLabel: "job-hunt-ledger.local",
    browserStatus: "LOCAL ONLY",
    cardSummary: "Built a private dashboard that finds credible developer roles, explains each match, and keeps application tracking under my control.",
    desc: "Job Hunt Ledger is a local personal dashboard for junior frontend and full-stack roles in Metro Manila, the Philippines, and remote-friendly markets. It uses approved structured job sources, records readable match reasons, prevents duplicate listings, and preserves deliberate manual application tracking.",
    caseStudy: {
      problem: "Job searching across several sources makes it difficult to compare relevant roles, avoid reviewing the same listing twice, and keep application decisions organized without putting personal notes into a hosted service.",
      decision: "Built a local-only application around approved structured sources rather than browser scraping or automatic applications. The interface keeps source facts and match evidence visible next to deliberate tracking controls.",
      implementation: "Created a React and TypeScript frontend with a FastAPI and SQLite backend. A shared refresh pipeline normalizes approved-source listings, applies deterministic preferences, deduplicates records with a SHA-256 identity, and preserves statuses, notes, and status history across refreshes.",
      tradeoffs: "The dashboard is intentionally not publicly hosted and its in-process scheduled refresh works only while the local application is running. That limits convenience in exchange for privacy and direct user control.",
      result: "A working local workspace for filtering, sorting, saving views, exporting filtered CSVs, backing up the database, and tracking applications without automated submissions, email sending, or hidden status changes."
    },
    codeUrl: "https://github.com/kurt-farinas/job-hunt-ledger",
    highlights: [
      "Approved Structured Sources: Fetches from configured APIs and feeds without browser scraping, then shows readable match evidence beside each lead.",
      "Deterministic Deduplication: Uses a SHA-256 identity from normalized company, title, and source URL so rediscovered listings preserve existing manual tracking.",
      "Deliberate Application Tracking: Status changes and notes are explicit actions with immutable history; refreshes never overwrite manual decisions.",
      "Private Local Operations: Supports filters, saved views, CSV export, consistent SQLite backups, and optional Gmail read-only suggestions that require confirmation before any status change."
    ],
    stack: ["React", "TypeScript", "FastAPI", "Python", "SQLite", "Vite"],
    filterSkills: ["react", "typescript"],
    telemetry: ["Local-Only", "Explainable Matching", "SHA-256 Dedupe", "Manual Tracking"],
    slides: [
      { src: "/job-hunt-ledger.png", label: "Job Hunt Ledger dashboard", tab: "Dashboard" }
    ]
  },
  hris: {
    id: "hris",
    title: "CS Form No. 6 Digitalization System",
    ticketId: "DepEd OJT Project",
    stamp: "98/100 OJT Rating (342 Hrs)",
    roleTag: "Frontend Ownership",
    statusBadge: '<span class="status-dot-amber"></span> Delivered to Division Office',
    badge: "DepEd OJT · Frontend Owner",
    desc: "DepEd San Jose's leave approval process ran on paper across 30+ division office staff and teachers with no audit trail and multi-day turnaround. I owned 100% of frontend development for a web system that digitized the full Applicant → Admin → Approver workflow, replacing manual CS Form No. 6 routing with print-ready PDF output and signature uploads tied directly to the approval chain.",
    cardSummary: "Frontend owner for a three-role DepEd leave workflow serving 30+ staff. Built digital approval screens and print-ready forms.",
    caseStudy: {
      problem: "DepEd San Jose's leave approval process ran entirely on paper. CS Form No. 6 documents were printed, hand-signed, and physically routed between 30+ staff, with no audit trail and multi-day turnaround.",
      decision: "Implemented the React + Inertia.js frontend for a 3-role workflow (Applicant → Admin → Approver) on Denver Ballesteros's Laravel backend, replacing physical routing with digital state transitions and e-signature stamping.",
      implementation: "Owned 100% of frontend development: form validation, multi-step approval UI, role-gated views, and a print-optimized PDF engine using browser-native print stylesheets with verified e-signature image stamping.",
      tradeoffs: "Used browser-native print CSS for PDF generation instead of a server-side library (wkhtmltopdf/DomPDF) for simpler deployment. Output depends on client browser rendering, which is acceptable for internal division office use.",
      result: "System delivered and deployed to DepEd San Jose Division Office. Earned 98/100 OJT performance rating across 342 logged internship hours. Backend developed by Denver Ballesteros."
    },
    highlights: [
      "Earned a 98/100 Performance Rating across 342 logged OJT internship hours at DepEd San Jose Division Office.",
      "Implemented the frontend for a 3-role workflow: Applicant application submission → Admin verification → Approver digital sign-off.",
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
    cardSummary: "Solo rebuilt a gym management thesis platform with role-based access and 119 passing Pest tests.",
    desc: "Solo-built and later rebuilt member management and revenue platform after a self-conducted security audit surfaced real vulnerabilities in the original PHP build (public file storage, missing upload validation). Rearchitected on Laravel 12 with Inertia.js and React, covering 28 domain tables and 86 protected routes (92 total) with role-based access, backed by 119 passing Pest tests.\n\nBeyond core gym operations, the platform includes a relational workout plan builder (exercises, sets, reps, difficulty tiers), structured nutrition and meal planning with macro tracking, and client-facing progress logging for body metrics and completed workouts, giving trainers and clients a full coaching loop, not just administrative tooling.",
    caseStudy: {
      problem: "The original PHP thesis build had critical security issues I discovered post-defense: publicly accessible file storage, missing upload validation, no CSRF protection, and raw SQL queries vulnerable to injection.",
      decision: "Full rebuild on Laravel 12 with Inertia.js and React rather than patching. The original architecture made incremental fixes impractical because routing, auth, and data access were tightly coupled with no separation of concerns.",
      implementation: "Designed 28 normalized domain tables from scratch. Implemented 86 protected routes across 92 total with RBAC gates (Admin, Trainer, Client). Built contactless QR attendance with a 5-minute (300-second) server-side attendance state machine (checks in, returns 'already checked in' on repeat scans within 5 minutes, checks out and calculates duration after 5 minutes), POS with receipt generation, Chart.js analytics dashboards, and streamed CSV report exports with UTF-8 BOM for Excel/Sheets compatibility.",
      tradeoffs: "Full rebuild cost ~3 months vs. patching in weeks. Justified because the original had no tests, no middleware, and adding security retroactively would have required rewriting most controllers anyway. Also gained 119 Pest tests covering auth, gates, registration, and attendance flows.",
      result: "All original thesis features preserved with proper security (CSRF, validated uploads, private storage, parameterized queries). 119 passing Pest tests. Public repository available for code inspection."
    },
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
    desc: "Led frontend development for the CS Form No. 6 Digitalization System; Denver Ballesteros developed the Laravel backend. Built the React, Inertia.js, and Tailwind CSS interface for three approval roles, e-signatures, and print-ready forms. Wrote 19 PHPUnit tests and earned a 98/100 OJT rating.",
    badge: "98/100 OJT RATING",
    isFeatured: true
  },
  {
    id: 3,
    date: "NOVEMBER 2025",
    title: "Gym Management System | Thesis Defense (Defended)",
    desc: "Built and defended a gym management thesis platform (PHP, MySQL) with Admin, Trainer, and Client portals, POS with low-stock alerts, and contactless QR attendance with duplicate-scan protection.",
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
    id: "deck-photo-1",
    title: "After Hours Snapshot 01",
    subtitle: "A view from above",
    date: "Snapshot 01",
    src: "/images/outside/1.jpg",
    alt: "Aerial view over mountain terraces",
    caption: "After Hours snapshot 01"
  },
  {
    id: "deck-photo-2",
    title: "After Hours Snapshot 02",
    subtitle: "A quiet moment away from the screen",
    date: "Snapshot 02",
    src: "/images/outside/2.jpg",
    alt: "After Hours personal snapshot 02",
    caption: "After Hours snapshot 02"
  },
  {
    id: "deck-photo-3",
    title: "After Hours Snapshot 03",
    subtitle: "A personal view beyond the IDE",
    date: "Snapshot 03",
    src: "/images/outside/3.jpg",
    alt: "After Hours personal snapshot 03",
    caption: "After Hours snapshot 03"
  },
  {
    id: "deck-photo-4",
    title: "After Hours Snapshot 04",
    subtitle: "Small details from the day",
    date: "Snapshot 04",
    src: "/images/outside/4.jpg",
    alt: "After Hours personal snapshot 04",
    caption: "After Hours snapshot 04"
  },
  {
    id: "deck-photo-5",
    title: "After Hours Snapshot 05",
    subtitle: "A meal shared away from the desk",
    date: "Snapshot 05",
    src: "/images/outside/5.jpg",
    alt: "A shared meal and drink",
    caption: "After Hours snapshot 05"
  },
  {
    id: "deck-photo-6",
    title: "After Hours Snapshot 06",
    subtitle: "A different kind of screen time",
    date: "Snapshot 06",
    src: "/images/outside/6.jpg",
    alt: "After Hours personal snapshot 06",
    caption: "After Hours snapshot 06"
  },
  {
    id: "deck-photo-7",
    title: "After Hours Snapshot 07",
    subtitle: "Life outside the workbench",
    date: "Snapshot 07",
    src: "/images/outside/7.jpg",
    alt: "After Hours personal snapshot 07",
    caption: "After Hours snapshot 07"
  },
  {
    id: "deck-photo-8",
    title: "After Hours Snapshot 08",
    subtitle: "Another frame from the archive",
    date: "Snapshot 08",
    src: "/images/outside/8.jpg",
    alt: "After Hours personal snapshot 08",
    caption: "After Hours snapshot 08"
  },
  {
    id: "deck-photo-9",
    title: "After Hours Snapshot 09",
    subtitle: "The setup after the sprint",
    date: "Snapshot 09",
    src: "/images/outside/9.jpg",
    alt: "A development and gaming setup",
    caption: "After Hours snapshot 09"
  }
];
