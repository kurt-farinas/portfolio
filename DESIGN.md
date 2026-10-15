# Portfolio Design

## Direction

The portfolio is an interactive workstation. The first desktop view shows an original 3D desk; its monitor contains the same React desktop that opens in full-screen mode. Narrow screens, coarse pointers, and WebGL failures use that desktop in 2D. Portfolio claims and project evidence remain factual and recruiter-facing.

The workstation uses simple reusable Three.js geometry with a low-power, demand-rendered React Three Fiber scene. Its screen content is a real React interface projected with Drei HTML. Camera changes, including the scroll-to-lock onto the monitor, glide smoothly and happen after user input, plus one pull-back from the monitor to the whole desk when the boot splash ends; all become instant when reduced motion is enabled. Gentle ambient motion runs only in the desk overview while the tab is visible and reduced motion is off: curtains sway, the plant leaves move, stars twinkle at night, coffee steam rises, and dust drifts in the lamp light. A 30 fps invalidate driver supplies the frames; the scene sleeps again in the monitor and expanded views. Desk meshes cast hard-edged shadow-map shadows. Clickable desk objects show a pale-yellow Win98 tooltip and an accent tint on hover; a desk clock and the taskbar show local time, redrawn once per minute. Room lighting and a wall window follow the visitor's time of day without animated transitions, and a dot-matrix printer feeds a résumé page on click. The room also has a wall shelf with books, a potted plant, a rug, curtains on the window, a cork board below the window (Projects), and a postage-stamp portrait of Kurt taped to the lamp shade. A string of warm fairy lights hangs in two swags on the back wall above the monitor, with five After Hours photos pegged on as polaroids; the bulbs glow and light the wall at night (or with the lamp setting on), twinkle and sway with the ambient motion, and clicking a polaroid opens that photo in the photo lightbox. Night ambient light is warm. A dynamic import keeps Three.js and the scene bundle out of the mobile path.

## Visual system

- Use the Win98 system font stack (Tahoma, Segoe UI, Verdana) for body and display text. The self-hosted Figtree/Space Grotesk files and license remain but are no longer loaded.
- Keep the saved dark/light theme, default to dark, and use src/styles/variables.css for interface and workstation material colors.
- The desktop has a compact top bar, a left app launcher on capable desktop screens, movable/resizable application windows, and a bottom taskbar. Reuse the app manager in the monitor and expanded 2D views.
- Use Windows 98-inspired solid gray chrome, navy active title bars, beveled borders, square controls, period-style SVG icons, and visible text labels. The same chrome covers buttons, dialogs, toasts, panels, and scrollbars; reading dialogs keep a paper client area. App content uses etched dividers, groove group boxes for project entries, sunken picture frames, and raised tags; text stays 16px. No rounded corners except avatars and status dots. Avoid gradients, blur, soft shadows, and card-heavy presentation. App windows zoom in briefly when they appear, except with reduced motion.
- Keep controls at least 44px tall with a visible 3px focus outline. Preserve native text entry, touch, drag, zoom, and pointer behavior. Respect reduced motion.
- Keep desktop window dragging on the title bar, resizing on the corner handle, and keyboard Move/Resize controls in the title bar. Keep one window per app, maintain window bounds after viewport changes, and save app scroll and gallery selection while changing views.
- On mobile or coarse-pointer devices, show one full-screen app at a time with the app launcher available from the top bar. Do not load the scene module or its Three.js dependencies.
- Keep the portfolio desktop immediately usable while the 3D chunk loads or when WebGL cannot start. Projects and the direct /resume.pdf path remain available.
- Global project, résumé, screenshot, and photo dialogs sit outside the projected monitor. They retain focus containment, Escape handling, focus restoration, readable dimensions, and modal priority. Ctrl/Cmd+K opens the searchable app palette.
- The fictional retro workstation uses a beige CRT, beige keyboard and mouse, a desk lamp, coffee mug, microphone, photo prints, fragrance bottle, and résumé sheet. Gear & Collections still shows Kurt's actual equipment.
- The CRT projects the real desktop even in overview, with inert controls until focused. Its physical power button is reversible. Sticky notes open Projects and Contact; photos, fragrance, and résumé open their corresponding apps; a framed wall certificate opens Recognition.
- The keyboard uses instanced beige caps and legends, with brief input-triggered key presses. Reduced motion disables key movement. The lamp is optional and starts off; coffee steam is part of the ambient motion.
- Camera controls support direct pointer movement only. Use frameloop=demand so the renderer sleeps between input and camera transitions.

## Content and routes

The single source of portfolio facts remains src/data/projectData.js with current React section components and public assets. Keep all six projects in this order: PMPC PIS, WorkForce/DTR, General Merchandise, CS Form No. 6, Gym Management System, Job Hunt Ledger. Preserve ownership wording, release caveats, project screenshots, website/code links, the OJT 98/100 rating and 342 hours, current job and education dates, and the local-only Job Hunt Ledger label.

The apps are About, Projects, Experience, Stack, Recognition, After Hours, Gear & Collections, Résumé, Contact, KurtOrdle, BugHunter 3D, Terminal, and Credits. About opens first. Do not invent project claims or change employment/ownership statements. Keep After Hours swipe, drag, keyboard, next, view, and lightbox behavior. Keep gear product links and image galleries. Keep résumé preview, direct open, and download paths.

Keep /projects, /after-hours, /gear, /downtime, and /outside-the-ide. The last two remain Gear aliases. Homepage section hashes open their matching app. Project hashes focus the matching Projects entry, and browser Back/Forward follows app navigation. Do not change canonical, Open Graph, Twitter, or other index metadata, public image paths, or Vercel configuration.

## Validation

Run npm test -- --run, npm run build, npm run theme:check, and git diff --check. Run node scripts/verify-portfolio-ui.mjs and node scripts/verify-retro-apps.mjs against the production preview. Verify 1440px and 375px in both themes, direct routes and hashes, all 13 apps, project order/details, modal priority and focus, gallery navigation, product links, theme saving, résumé paths, 44px targets, 3px outlines, no horizontal overflow, reduced motion, and browser-console/network errors.

The UI verifier also checks that narrow/coarse-pointer sessions never request the 3D chunk. A WebGL-capable wide desktop should load the scene lazily, transition between overview and screen/expanded views on request, and stop rendering while idle.

## Retro behavior and factual data

src/data/portfolioFacts.js derives shared project, timeline, recognition, and technology responses from the canonical data. Education is BS Computer Science, STI College San Jose, September 2022–July 2026. Preserve Presidential List recognition, DepEd February–March 2026, 342 hours, 98/100, and Denver Ballesteros's Laravel backend ownership. The supplied HTML is a visual reference, not a factual source or embedded runtime.

Start provides all 13 apps and settings. A first-visit homepage boot is immediately skippable into 3D or 2D; direct routes and hashes bypass it. Replaying boot preserves app state. Sounds and static CRT scanlines default off; audio starts only on explicit opt-in. Wallpaper, lamp, and monitor power changes are reversible. No fake hardware diagnostics claim to inspect the device.

KurtOrdle accepts alphabetic five-letter guesses, scores duplicates in two passes, and retains progress. BugHunter is a fictional canvas raycaster, draws only when state changes, accepts focused keyboard or touch input, checks collision/line of sight, and pauses behind dialogs, when inactive or hidden, and at the desk overview. The simulated terminal renders React text and never evaluates commands. Contact is an Outlook-inspired composer reusing Web3Forms validation, honeypot, submission, and honest feedback; QA mocks its network endpoint.

## Projected desktop input

The projected screen owns pointer, wheel, and keyboard-focus input. While its pointer or focus is inside, or a pointer gesture that began inside remains active, manual camera controls are disabled. Native capture guards disable camera input before its container listeners without cancelling desktop scrolling or React handlers. A desktop drag remains owned until release/cancellation, including outside the screen. Outside pointer-down releases focus ownership so camera dragging works immediately.

Desktop-origin events also skip scene raycasting so buttons cannot activate the monitor or desk objects behind them. Preserve the original event path when view changes detach a clicked button; keyboard clicks must never reuse stale scene pointer coordinates. The HTML portal uses a stable canvas host when returning from expanded view. Only residual manual camera motion is stopped on desktop entry; programmatic monitor/desk transitions remain intact. Locks clear on view changes, unmount, pointer cancellation, and window blur. Keep expanded/mobile desktop behavior unchanged. Run node scripts/verify-desktop-input.mjs against the production preview to verify input separation, escaping window drags/resizing, camera restoration, view transitions, terminal/game input, and modal access in both themes.

## Readable monitor Projects

Opening Projects from the room or projected desktop maximizes its existing window, including reopening a minimized window. Restore remains available and retains the previous window rectangle. Other apps and fullscreen/mobile opening behavior stay unchanged. The focused camera fits the monitor glass with a narrow bezel margin according to the viewport aspect ratio; Expand desktop remains available. Preserve desktop input isolation and instant reduced-motion transitions.

## Workstation art direction and project reading

The room follows a late-1990s home-workstation palette: ivory hardware, a walnut desk with a small procedural grain map, muted teal curtains/rug, and oxblood accents. Warm key light contrasts with the cooler window; lower ambient light keeps geometry and hard shadows readable. Preserve original photos, day/dusk/night behavior, lamp settings, and demand rendering.

The Kurt-OS Projects app presents each of the same six projects in the existing order as screenshot, role/status, Decision, Result, and the existing case-study action. Complete narratives, contributions, technology lists, release caveats, and original screenshots remain in the project dialog. Classic Portfolio keeps its detailed page layout. Keep the OJT 98/100 rating and 342 hours visible in the compact result. A separate Kurt-OS build-notes section after the six projects documents projection, shared state, camera input, fallback, accessibility, and rendering trade-offs; it is not another client project.

On small screens and coarse pointers, the About app starts with a lightweight inline-SVG workstation and three keyboard-accessible Projects, Résumé, and Contact shortcuts. It shares room palette tokens and adds no 3D imports or external assets. Other app layouts remain fullscreen and scrollable. Validate both schemes at 375px and coarse-pointer fallback as well as the desktop monitor.

## Room and transition polish

Give the workstation a believable setting rather than an empty backdrop. Low sage wall paneling meets warm plank flooring; an inset rug border and small woven-style diamonds anchor the desk. Layered landscape silhouettes, a sun/moon, a substantial sill and a small plant add depth outside the window. Rounded leaves, supported books, a notebook and pencil, and a cork mug coaster suggest daily use without competing with the real photos or monitor. Use existing ivory/walnut/teal/oxblood colors and centralized environment tokens. All additions are decorative procedural geometry; preserve existing motion gating, camera framing, clickable silhouettes, shadow budget, and mobile scene exclusion. The mobile illustration echoes the landscape, sill plant, paneling and notebook.

Keep the overview at a gentle three-quarter angle while the reading view faces the monitor straight on. Preserve the welcome panel's clear upper-left wall area, keep the window on the right, and separate the microphone, fragrance bottle, and mug across depth. The desk uses a small, deterministic irregular grain texture and a subtle bevel, with no external textures. A non-shadow-casting front fill keeps dark hardware readable at night; retain the 1024px shadow map and 1.25 pixel-ratio cap. The mobile SVG mirrors the angled desk, monitor side, and separated accessories without loading 3D.

The app shell distinguishes actual module loading from scene photos/material preparation. Both stages retain Use 2D desktop and direct /resume.pdf actions. The three-second boot stays immediately skippable. Intro ownership lives with the existing boot context so returning from an expanded view does not replay it. Camera moves freeze the visible pose before retargeting and only the latest transition may finish or report an error; resize and reduced-motion updates snap instantly. Ordinary desktop resizing preserves the current view. Keyboard focus entering an app window raises that window.

Run node scripts/verify-room-polish.mjs against the production preview for fixed-time day/dusk/night screenshots, responsive composition, slow loading and 2D escape, rapid transition interruptions, resize, keyboard window activation, and screenshot comparison artifacts. Keep the existing portfolio, desktop-input, retro-app, and monitor-framing verifiers.
