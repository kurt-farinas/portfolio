# AGENTS.md — Portfolio (kurt-farinas-portfolio.vercel.app)

## Purpose
- This is Kurt Fariñas's recruiter-facing portfolio. Prioritize factual project ownership, mobile readability, working recruiter paths, and a maintainable React codebase over visual novelty.

## Source-of-truth hierarchy
When sources conflict, use this order:
1. Current user instruction
2. Active implementation and deployment files: `src/`, `public/`, `index.html`, and `vercel.json`
3. `AGENTS.md`
4. Tests and build configuration
5. Legacy files under `src/js/`

## Stack
- React 19 + Vite 6, with React Router and Vitest.
- Main portfolio data: `src/data/projectData.js`.
- Routes: `/`, `/after-hours`, `/downtime`, and `/outside-the-ide`.
- Source entry point: `src/main.jsx` → `src/App.jsx`.
- Hosted on Vercel as a static Vite build. Use `npm run dev`, `npm test -- --run`, and `npm run build`.
- CSS is split by responsibility under `src/styles/` and imported by `src/styles/index.css`.
- Treat `src/js/` as legacy code, not the source of truth for active features.
- Dark/light theme, monochrome palette, Space Grotesk/Inter/JetBrains Mono typography.

## Features to preserve (do not remove or degrade without asking)
- Project detail modals with screenshot carousel, case-study content, and screenshot lightbox
- Featured Projects includes Job Hunt Ledger, a local-only personal job-search dashboard with a public code repository but no hosted demo
- Resume PDF preview modal + direct download link
- Command palette, including the Ctrl/Cmd+K shortcut and keyboard navigation
- Action-feedback toast notifications
- Dark/light theme and sound controls

## Change boundaries
- Do not add new packages, analytics, tracking, APIs, or third-party widgets without explicit approval.
- Keep content, styling, and behavior changes scoped to the request.
- Do not modify unrelated legacy files during feature work.

## Version control and deployment
- Do not commit, push, create pull requests, change hosting configuration, or deploy without explicit approval.
- Preserve unrelated working-tree changes.
- Before a requested publish, inspect `git status`, `git diff --check`, branch, remote, and local/remote commit IDs.

## Hard rules
- Keep the existing Vite build and do not replace the React source with legacy vanilla files under `src/js/`.
- Never break or change the resume.pdf link path.
- Never modify canonical, og:*, or twitter:* meta tags without flagging it explicitly — these control how the site appears when shared and how it's indexed, which matters directly for job applications.
- Never remove or shrink content that establishes credibility (OJT rating, hours logged, project ownership scope) — this is a job-hunting asset, not a demo site.
- Check mobile responsiveness on every visual change. This site gets viewed on phones by recruiters.

## Visual safeguards
- Preserve the hero section's original scale. Compact other sections only when requested; do not make the hero smaller as a side effect.
- For visual changes, verify desktop and a 375px-wide viewport, no horizontal overflow, keyboard access, and visible focus states.

## Interaction safeguards
- Dialogs must support Escape to close, keep focus inside while open, and restore focus when closed.
- Do not replace React state/context interactions with direct DOM manipulation or new `window` globals.

## Content accuracy
- Never fabricate or round up stats, dates, or scope claims. Match what's actually true: HRIS frontend ownership only (backend is Denver Ballesteros's), gym system solo-built and defended.
- Keep tone factual and technical, not marketing copy. Avoid generic buzzwords ("passionate," "results-driven," "synergy").

## Content changes
- Before changing project claims, verify them against existing project data or user-provided evidence.
- Flag wording that could overstate ownership, scale, or production status.

## Accessibility
- Preserve semantic HTML, accessible names, keyboard navigation, and focus management.
- Respect `prefers-reduced-motion` for new animation.
- Do not use color as the only way to communicate status.

## Assets and links
- Keep `public/` asset paths stable unless every reference is updated and verified.
- For changed pages, verify internal navigation, resume links, project links, images, and downloadable files.
- New meaningful images require accurate alt text; decorative images should use empty alt text.
- Use `rel="noopener noreferrer"` for new external links opened in a new tab.

## SEO and social previews
- Metadata is maintained in `index.html`; treat canonical, Open Graph, Twitter, title, description, and JSON-LD changes as high-risk.
- If these fields change, verify that they match the portfolio identity, route behavior, and intended public URL.
- Do not create route-specific metadata behavior unless it is requested and verified.

## Validation requirements
- For React, JavaScript, styling, dependency, routing, or configuration changes, run `npm test -- --run`, `npm run build`, and `git diff --check`.
- For content-only or documentation-only changes, run `git diff --check`; run additional checks when the changed content affects rendering, links, or metadata.
- Verify the `/resume.pdf` preview and download paths after related changes.

## Communication style
- No "I've successfully..." preambles. Show the diff directly.
- Explicitly flag any change that affects SEO, social preview metadata, or mobile layout — these are the changes with the highest cost if wrong and lowest visibility if silently broken.

## Keeping this guide current
- When a visible feature is added, removed, or substantially changed, update this guide in the same change.
- Do not list CSS classes, unmounted components, or legacy scripts as active features.
