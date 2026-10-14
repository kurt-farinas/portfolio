# AGENTS.md — Portfolio

## Purpose and source of truth

This is Kurt Fariñas's recruiter-facing portfolio. Keep project ownership accurate, evidence visible, navigation usable on phones, and the React application maintainable.

When sources conflict, follow: current user instruction; active implementation and deployment files in src/, public/, index.html, and vercel.json; this guide; tests/build configuration; legacy files in src/js/.

## Stack and routes

- React 19, Vite 6, React Router, and Vitest. The app starts at src/main.jsx → src/App.jsx; portfolio data remains in src/data/projectData.js.
- The workstation uses Three.js, React Three Fiber v9, and Drei. Load the scene through a dynamic import. The initial bundle and mobile/coarse-pointer flows must avoid downloading the scene and Three.js.
- Routes: /, /projects, /after-hours, and /gear; /downtime and /outside-the-ide remain Gear & Collections aliases. Homepage section hashes open their matching app. Project hashes focus that Projects entry. Keep direct /resume.pdf access.
- Hosted as a static Vite build on Vercel. Use npm run dev, npm test -- --run, npm run build, and npm run theme:check.
- Keep src/js/ as legacy code, not active feature source.

## Portfolio desktop

The desktop overview is a fictional retro workstation made from reusable geometry. The desk overview starts at a low, head-on view of the whole setup, framed for a 2.21 aspect screen; narrower screens back the camera up along the same line (up to 1.4x) so the full desk stays visible. The welcome card sits top-left on the empty wall above the desk and drops its description below 1280px. The beige CRT opens the projected React desktop; Expand desktop and Back to desk move between views. Scrolling toward the monitor (closer than 5.5 units) locks the camera onto the screen, and scrolling out past 6 units over the bezel returns to the desk. All camera moves glide (0.3 s smoothing, about 1 s of visible motion; 0.9 s smoothing for the intro), snap to the exact pose once at rest so the demand-rendered scene sleeps, and are instant with reduced motion. Sticky notes open Projects and Contact, photos open After Hours, fragrance opens Gear & Collections, and the résumé sheet opens Résumé. Keep an accessible 2D desktop ready during scene loading and use it after WebGL errors.

Use a beige CRT, instanced retro keyboard caps and legends, beige mouse on a mousepad, keyboard desk mat, articulated desk lamp, FIFINE-style microphone (Contact), glossy fragrance bottle (Gear), and a static coffee mug. All desk meshes cast hard-edged shadow-map shadows. In the desk overview, hovering a clickable object tints it with the accent colour and shows a Win98 tooltip naming what it opens. A retro desk clock and the taskbar show the visitor's local time, updating once a minute so the scene still sleeps. When Sound is on, finishing the boot plays a short original four-note chime. The monitor has reversible power and the projected desktop remains aligned with it. Overview content is inert until focused. Gear & Collections retains the actual equipment. No automatic scene motion, steam, blur, or gradients.

Apps: My Computer (a Win98 drive list that opens Projects, Experience, Stack, Recognition, Résumé, and Contact), About, Projects, Experience, Stack, Recognition, After Hours, Gear & Collections, Résumé, Contact, KurtOrdle, BugHunter 3D, Terminal, and Credits. About opens first. Provide one non-modal window per app, drag, resize, minimize, maximize, close, focus, and taskbar restoration. Reopening an app focuses its existing window. Keep windows inside the visible workspace when it resizes. Include keyboard Move/Resize controls, visible focus, and 44px minimum targets.

At widths below 1100px or on coarse pointers, show one full-screen 2D app window at a time and do not import the 3D scene. Browser Back/Forward follows app navigation and route/hash entry. Save app scroll positions and gallery selections across view changes. Ctrl/Cmd+K opens the searchable application palette.

Project, résumé, screenshot, and photo dialogs remain outside the projected screen, readable, and focus-contained. Escape closes the topmost dialog first and restores focus afterward. Keep action-feedback toasts, theme persistence, project screenshot carousel/lightbox, photo navigation, and product links.

## Content safeguards

- Keep all six projects in their current order: PIS, WorkForce/DTR, General Merchandise, CS Form No. 6, Gym Management System, Job Hunt Ledger.
- Preserve contribution, ownership, release status, screenshot captions, and link distinctions already in projectData.js. PIS is inherited work; DepEd wording is frontend ownership and Denver Ballesteros developed the Laravel backend; the gym platform was solo-built and defended.
- Keep the current Junior Full-Stack Developer role at People's Multi-Purpose Cooperative from September 16, 2026, and retain the OJT 98/100 rating and 342 hours.
- Keep Job Hunt Ledger labelled local-only with no hosted demo. Do not invent stats, dates, releases, or responsibilities.
- Keep the supplied portrait, project screenshots, After Hours photos, gear photos and image fallbacks, original image dimensions, and public asset paths.
- Use the Win98 system font stack (Tahoma) for all text, keeping sizes and weights from variables.css. No rounded corners except avatars and status dots. Keep typography and color variables in src/styles/variables.css. Preserve the saved dark/light choice and dark default.
- Keep /resume.pdf unchanged in the hero/app/modal links. The Résumé app must retain open-in-tab, download, and accessible preview actions.

## Accessibility and behavior

- Preserve semantic HTML, labels, keyboard navigation, 3px visible focus outlines, 44px interactive targets, and focus containment/restoration in dialogs.
- Respect prefers-reduced-motion; camera view changes become instant and no scene animation runs automatically.
- Preserve native touch, text selection, drag, zoom, and text-entry behavior.
- Keep mobile behavior readable without horizontal overflow. Verify desktop and 375px in dark and light themes.
- Do not replace React context/state interactions with direct DOM manipulation or new window globals.

## Change boundaries and publishing

- Keep interface colors in variables.css; prefer solid grayscale UI surfaces and restrained borders. Keep the warm workstation palette in theme tokens.
- Keep interface changes scoped to this replacement. Do not add analytics, tracking, APIs, or third-party widgets.
- Do not change canonical, Open Graph, Twitter, description, title, or JSON-LD metadata without flagging the SEO/social-preview impact.
- Do not change hosting configuration, commit, push, create a pull request, or deploy without explicit approval.
- Preserve unrelated user changes. Do not modify unreferenced legacy files during active feature work.

## Required validation

For JavaScript, CSS, routing, dependency, or configuration changes, run npm test -- --run, npm run build, and git diff --check. For visual changes, also run npm run theme:check and node scripts/verify-portfolio-ui.mjs and node scripts/verify-retro-apps.mjs against the production preview. Verify internal navigation, project links, images, all résumé paths, both schemes, keyboard operation, and 3D failure recovery.

Update this guide and DESIGN.md when visible features change.

## Retro extras

- Share profile facts and terminal responses through src/data/portfolioFacts.js, deriving project and timeline content from projectData.js. Use BS Computer Science, STI College San Jose, September 2022–July 2026, Presidential List recognition, and the verified employment/OJT facts. Never copy unsupported prototype claims.
- Use Windows 98-inspired gray chrome, navy active title bars, beveled borders, SVG icons, Start menu, and taskbar. Buttons, dialogs, toasts, panels, and scrollbars use the same beveled chrome; reading dialogs keep a paper client area. App content uses etched dividers, groove group boxes for project entries, sunken picture frames, and raised tags; text stays 16px. The boot screen stays a monospace BIOS-style terminal.
- First-visit homepage boot is a Win98-style Kurt-OS splash (no Microsoft branding) that auto-advances after about 3 s, is immediately skippable, keeps résumé and Projects buttons visible, and is bypassed on direct routes/hashes. In 3D it hands off to a one-time camera pull-back from the monitor to the whole desk, which is the only automatic scene motion and is instant with reduced motion. Replay preserves apps. Sounds and static CRT effects start off; WebAudio starts only on opt-in. Settings include wallpaper, lamp, and reversible monitor power.
- KurtOrdle uses six five-letter attempts with correct duplicate scoring. BugHunter is a fictional raycaster with safe collision checks and scoped keyboard/touch input; it pauses when inactive, minimized, hidden, behind a modal, or in desk overview. Both retain progress and stop rendering while idle.
- Terminal is clearly simulated and renders escaped React text without command execution or HTML injection. Contact preserves the original Web3Forms validation, honeypot, honest success/error feedback, and draft recovery; mock submission during verification.
- Verify all 14 apps, boot bypass, audio opt-in, focused game input, pause behavior, terminal escaping, contact feedback, and mobile 3D exclusion. Do not commit, push, or deploy this trial.

## Projected desktop input

The projected screen owns pointer, wheel, and keyboard-focus input. While its pointer or focus is inside, or a pointer gesture that began inside remains active, manual camera controls are disabled. Native capture guards disable camera input before its container listeners without cancelling desktop scrolling or React handlers. A desktop drag remains owned until release/cancellation, including outside the screen. Outside pointer-down releases focus ownership so camera dragging works immediately.

Desktop-origin events also skip scene raycasting so buttons cannot activate the monitor or desk objects behind them. The HTML portal uses a stable canvas host when returning from expanded view. Only residual manual camera motion is stopped on desktop entry; programmatic monitor/desk transitions remain intact. Locks clear on view changes, unmount, pointer cancellation, and window blur. Keep expanded/mobile desktop behavior unchanged. Run node scripts/verify-desktop-input.mjs against the production preview to verify input separation, escaping window drags/resizing, camera restoration, view transitions, terminal/game input, and modal access in both themes.
