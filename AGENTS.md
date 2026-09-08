# AGENTS.md — Portfolio (kurt-farinas.github.io/portfolio)

## Purpose
- This is Kurt Fariñas's recruiter-facing portfolio. Prioritize factual project ownership, mobile readability, working recruiter paths, and a maintainable React codebase over visual novelty.

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
- Resume PDF preview modal + direct download link
- Command palette
- Action-feedback toast notifications
- Dark/light theme and sound controls

## Hard rules
- Keep the existing Vite build and do not replace the React source with legacy vanilla files under `src/js/`.
- Never break or change the resume.pdf link path.
- Never modify canonical, og:*, or twitter:* meta tags without flagging it explicitly — these control how the site appears when shared and how it's indexed, which matters directly for job applications.
- Never remove or shrink content that establishes credibility (OJT rating, hours logged, project ownership scope) — this is a job-hunting asset, not a demo site.
- Check mobile responsiveness on every visual change. This site gets viewed on phones by recruiters.

## Visual safeguards
- Preserve the hero section's original scale. Compact other sections only when requested; do not make the hero smaller as a side effect.
- For visual changes, verify desktop and a 375px-wide viewport, no horizontal overflow, keyboard access, and visible focus states.

## Content accuracy
- Never fabricate or round up stats, dates, or scope claims. Match what's actually true: HRIS frontend ownership only (backend is Denver Ballesteros's), gym system solo-built and defended.
- Keep tone factual and technical, not marketing copy. Avoid generic buzzwords ("passionate," "results-driven," "synergy").

## Validation requirements
- For every code change, run `npm test -- --run`, `npm run build`, and `git diff --check`.
- Verify the `/resume.pdf` preview and download paths after related changes.

## Communication style
- No "I've successfully..." preambles. Show the diff directly.
- Explicitly flag any change that affects SEO, social preview metadata, or mobile layout — these are the changes with the highest cost if wrong and lowest visibility if silently broken.
