# AGENTS.md — Portfolio (kurt-farinas.github.io/portfolio)

## Stack
- React 19 + Vite 6, with React Router and Vitest.
- Source entry point: `src/main.jsx` → `src/App.jsx`.
- Hosted on Vercel as a static Vite build. Use `npm run dev`, `npm test -- --run`, and `npm run build`.
- CSS is split by responsibility under `src/styles/` and imported by `src/styles/index.css`.
- Dark/light theme, monochrome palette, Space Grotesk/Inter/JetBrains Mono typography.

## Features to preserve (do not remove or degrade without asking)
- Interactive terminal widget with command chips (whoami, cv, timeline, skills, projects, awards, sudo hire-kurt, clear)
- Kurt AI Assistant chatbot widget (answers questions about HRIS project, gym platform, stack, availability, credentials)
- Project detail modals with clickable architecture/workflow pipeline steps
- Resume PDF preview modal + direct download link
- Achievement toast notifications

## Hard rules
- Keep the existing Vite build and do not replace the React source with legacy vanilla files under `src/js/`.
- Never break or change the resume.pdf link path.
- Never modify canonical, og:*, or twitter:* meta tags without flagging it explicitly — these control how the site appears when shared and how it's indexed, which matters directly for job applications.
- Never remove or shrink content that establishes credibility (OJT rating, hours logged, project ownership scope) — this is a job-hunting asset, not a demo site.
- Check mobile responsiveness on every visual change. This site gets viewed on phones by recruiters.

## Content accuracy
- Never fabricate or round up stats, dates, or scope claims. Match what's actually true: HRIS frontend ownership only (backend is Denver Ballesteros's), gym system solo-built and defended.
- Keep tone factual and technical, not marketing copy. Avoid generic buzzwords ("passionate," "results-driven," "synergy").

## Communication style
- No "I've successfully..." preambles. Show the diff directly.
- Explicitly flag any change that affects SEO, social preview metadata, or mobile layout — these are the changes with the highest cost if wrong and lowest visibility if silently broken.
