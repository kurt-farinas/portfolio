# AGENTS.md — Portfolio (kurt-farinas.github.io/portfolio)

## Stack
- Vanilla HTML, CSS, JS. No framework, no build step, no bundler.
- Hosted on GitHub Pages — deploys directly from the repo, so every change must work as plain static files.
- Dark theme, violet accent (#8B7CF6). Space Grotesk (headings) + JetBrains Mono (code/terminal elements).

## Features to preserve (do not remove or degrade without asking)
- Interactive terminal widget with command chips (whoami, cv, timeline, skills, projects, awards, sudo hire-kurt, clear)
- Kurt AI Assistant chatbot widget (answers questions about HRIS project, gym platform, stack, availability, credentials)
- Project detail modals with clickable architecture/workflow pipeline steps
- Resume PDF preview modal + direct download link
- Achievement toast notifications

## Hard rules
- Never introduce a build step (webpack, vite, npm scripts) without asking — this site is intentionally buildless so GitHub Pages can serve it directly.
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
