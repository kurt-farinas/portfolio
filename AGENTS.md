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

Smooth the miniature desktop in the zoomed-out overview with reciprocal scaling: a half-scale Html group, doubled outer clipping dimensions, and CSS zoom 2 on the inert overview frame. Preserve the 1280x760 logical desktop and physical monitor alignment. Focused monitor, fullscreen, and mobile desktop use normal scale. Keep input isolation and scroll state intact; do not increase the room canvas resolution to address HTML artifacts.

The desktop overview is a fictional retro workstation made from reusable geometry. The desk overview starts at a gentle three-quarter view (about 10 degrees off centre) of the whole setup, framed for a 2.21 aspect screen; narrower screens back the camera up along the same line (up to 1.4x) so the full desk stays visible. The welcome card sits top-left on the empty wall above the desk and drops its description below 1280px. The beige CRT opens the projected React desktop; Expand desktop and Back to desk move between views. Scrolling toward the monitor (closer than 5.5 units) locks the camera onto the screen, and scrolling out past 6 units over the bezel returns to the desk. All camera moves glide (0.30 s smoothing for ordinary moves; 0.45 s smoothing for the brief intro), settle through damping without a final snap, returning to demand rendering at rest and sleeping after the residual motion finishes, and are instant with reduced motion. Sticky notes open Projects and Contact, photos open After Hours, individual fragrances open their product photo while the tray opens Gear & Collections, the résumé sheet opens Résumé, and a framed certificate on the wall beside the window opens Recognition. The 3D stage shows a loading panel until the scene and its photo texture are ready. Keep an accessible 2D desktop ready during scene loading and use it after WebGL errors.

Use a beige CRT, instanced retro keyboard caps and legends, beige mouse on a mousepad, keyboard desk mat, articulated desk lamp, FIFINE-style microphone (Contact), glossy fragrance bottle (Gear), and a coffee mug. The room also has a wall shelf with books, a potted plant, a rug, curtains on the window, a cork board below the window (Projects), and a postage-stamp portrait of Kurt taped to the lamp shade. A string of warm fairy lights hangs in two swags on the back wall above the monitor, with five After Hours photos pegged on as polaroids; the bulbs glow and light the wall at night (or with the lamp setting on), twinkle and sway with the ambient motion, and clicking a polaroid opens that photo in the photo lightbox. Night ambient light is warm. All desk meshes cast hard-edged shadow-map shadows. In the desk overview, hovering a clickable object tints it with the accent colour and shows a Win98 tooltip naming what it opens. A retro desk clock and the taskbar show the visitor's local time, updating once a minute so the scene still sleeps. When Sound is on, finishing the boot plays a short original four-note chime. The room follows the visitor's local clock (day 7-17h, dusk 5-7h and 17-20h, night otherwise): a back-wall window shows sky, dusk or stars, lighting dims at night and the lamp switches itself on, with no animated transition. A beige dot-matrix printer feeds out a résumé page (real name and role only, about 1.4 s, skipped with reduced motion) and then opens the Résumé app. Session-only achievements (sessionStorage, nothing sent anywhere) unlock with a toast: Desk explorer, Case-study reader, Wordsmith, Exterminator, and Paper trail. The monitor has reversible power and the projected desktop remains aligned with it. Overview content is inert until focused. Gear & Collections retains the actual equipment. Gentle ambient motion runs only in the desk overview while the tab is visible and reduced motion is off: curtains sway, the plant leaves move, stars twinkle at night, coffee steam rises, and dust drifts in the lamp light. A 30 fps invalidate driver supplies the frames; the scene sleeps again in the monitor and expanded views. No blur or gradients.

Apps: My Computer (a Win98 drive list that opens Projects, Experience, Stack, Recognition, Résumé, and Contact, plus the session achievements list), Classic Portfolio (shown with the kf logo; opens classic mode), About, Projects, Experience, Stack, Recognition, After Hours, Gear & Collections, Résumé, Contact, KurtOrdle, Bugsweeper, BugHunter 3D, Terminal, and Credits. About opens first. Provide one non-modal window per app, drag, resize, minimize, maximize, close, focus, and taskbar restoration. Reopening an app focuses its existing window. Windows zoom in (200 ms scale from 85%) each time they appear. Keep windows inside the visible workspace when it resizes. Include keyboard Move/Resize controls, visible focus, and 44px minimum targets.

At widths below 1100px or on coarse pointers, show one full-screen 2D app window at a time and do not import the 3D scene. Browser Back/Forward follows app navigation and route/hash entry. Save app scroll positions and gallery selections across view changes. Ctrl/Cmd+K opens the searchable application palette.

Project, résumé, screenshot, and photo dialogs remain outside the projected screen, readable, and focus-contained. Escape closes the topmost dialog first and restores focus afterward. Keep action-feedback toasts, theme persistence, project screenshot carousel/lightbox, photo navigation, and product links.

## Classic Portfolio

The Classic Portfolio app and direct /classic links switch to classic mode for the browser session: the editorial HomePage, ProjectsPage, AfterHoursPage, Gear page, Navbar, and Footer with their original Figtree/Space Grotesk type, rounded cards, and plain controls (src/styles/classic.css, scoped to :root[data-mode='classic']). Kurt-OS retro styling must not change classic mode and vice versa. A fixed Back to Kurt-OS button leaves classic mode. Classic mode loads no 3D scene and shows no boot screen.

## Content safeguards

- Keep section introductions title-only: Projects, After Hours, and Gear & Collections omit generic eyebrow labels and explanatory subtitles. After Hours places the photo stack in one centered column without the duplicate Life outside the IDE heading. Résumé and Contact omit their generic eyebrow labels while retaining identity, role, actions, and useful instructions. Apply shared changes to Classic Portfolio too; preserve functional instructions, captions, and project evidence.

- The three PMPC case studies summarize verified contributions from September 16–October 15, 2026 in grouped highlights. Keep inherited attribution, concise cards, and separate confirmed deployed work from local implementation or unverified deployment. Evidence and superseded claims are recorded in docs/pmpc-contribution-audit.md; dates, commits, and an Unreleased heading alone do not establish authorship or deployment.

- Keep all six projects in their current order: PIS, WorkForce/DTR, General Merchandise, CS Form No. 6, Gym Management System, Job Hunt Ledger.
- Preserve contribution, ownership, release status, screenshot captions, and link distinctions already in projectData.js. PIS is inherited work; DepEd wording is frontend ownership and Denver Ballesteros developed the Laravel backend; the gym platform was solo-built and defended.
- Keep the current Junior Full-Stack Developer role at People's Multi-Purpose Cooperative from September 16, 2026, and retain the OJT 98/100 rating and 342 hours.
- Keep Job Hunt Ledger labelled local-only with no hosted demo. Do not invent stats, dates, releases, or responsibilities.
- Keep the supplied portrait, project screenshots, After Hours photos, gear photos and image fallbacks, original image dimensions, and public asset paths.
- PortfolioImage serves WebP copies from public/optimized/ and falls back to the original path. After adding or replacing images, run node scripts/prepare-portfolio-assets.mjs, then npm run images.
- Use the Win98 system font stack (Tahoma) for all text, keeping sizes and weights from variables.css. No rounded corners except avatars and status dots. Keep typography and color variables in src/styles/variables.css. Preserve the saved dark/light choice and dark default.
- Keep /resume.pdf unchanged in the hero/app/modal links. The Résumé app must retain open-in-tab, download, and accessible preview actions.

## Accessibility and behavior

- Preserve semantic HTML, labels, keyboard navigation, 3px visible focus outlines, 44px interactive targets, and focus containment/restoration in dialogs.
- Respect prefers-reduced-motion; camera view changes become instant, ambient scene motion stops, and app windows open without the zoom-in.
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
- First-visit homepage boot is a Win98-style Kurt-OS splash (no Microsoft branding) that auto-advances after about 3 s, is immediately skippable, keeps résumé and Projects buttons visible, and is bypassed on direct routes/hashes. In 3D it hands off to a one-time camera pull-back from the monitor to the whole desk, which is instant with reduced motion. Replay preserves apps. Sounds and static CRT effects start off; WebAudio starts only on opt-in. Settings include wallpaper, lamp, and reversible monitor power.
- Bugsweeper is a 9x7 board with 10 bugs; the first reveal and its neighbours are always safe. It supports click, right-click, Flag mode for touch, arrow-key roving focus with F to flag, 44px tiles, and descriptive tile names.
- KurtOrdle uses six five-letter attempts with correct duplicate scoring. BugHunter is a fictional raycaster with safe collision checks and scoped keyboard/touch input; it pauses when inactive, minimized, hidden, behind a modal, or in desk overview. Both retain progress and stop rendering while idle.
- Terminal is clearly simulated and renders escaped React text without command execution or HTML injection. Contact preserves the original Web3Forms validation, honeypot, honest success/error feedback, and draft recovery; mock submission during verification.
- Verify all 16 apps, boot bypass, audio opt-in, focused game input, pause behavior, terminal escaping, contact feedback, and mobile 3D exclusion. Do not commit, push, or deploy this trial.

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

The surroundings form a lived-in study: low painted wall paneling and trim, warm plank flooring, a restrained geometric rug border, rounded foliage, shelf brackets and book spine bands, a notebook/pencil and mug coaster, and a window sill plant overlooking layered hills and trees. The window shows a sun by day/dusk and a moon at night behind the existing stars. These details are decorative geometry using shared room tokens, with no extra assets, lights, interaction targets, or animation loops. Keep silhouettes clear of existing object shortcuts and the upper-left welcome panel. Mirror key details in the lightweight mobile SVG.

Keep the overview at a gentle three-quarter angle while the reading view faces the monitor straight on. Preserve the welcome panel's clear upper-left wall area, keep the window on the right, and separate the microphone, fragrance bottle, and mug across depth. The desk uses a small, deterministic irregular grain texture and a subtle bevel, with no external textures. A non-shadow-casting front fill keeps dark hardware readable at night; retain the 1024px shadow map and 1.25 pixel-ratio cap. The mobile SVG mirrors the angled desk, monitor side, and separated accessories without loading 3D.

The app shell distinguishes actual module loading from scene photos/material preparation. Both stages retain Use 2D desktop and direct /resume.pdf actions. The three-second boot stays immediately skippable. Intro ownership lives with the existing boot context so returning from an expanded view does not replay it. Camera moves freeze the visible pose before retargeting and only the latest transition may finish or report an error; resize and reduced-motion updates snap instantly. Ordinary desktop resizing preserves the current view. Keyboard focus entering an app window raises that window.

Run node scripts/verify-room-polish.mjs against the production preview for fixed-time day/dusk/night screenshots, responsive composition, slow loading and 2D escape, rapid transition interruptions, resize, keyboard window activation, and screenshot comparison artifacts. Keep the existing portfolio, desktop-input, retro-app, and monitor-framing verifiers.

## Smooth camera zoom

Ordinary camera smoothing is 0.30, pointer-drag smoothing is 0.18, and wheel dolly speed is 0.75; the intro retains 0.45 smoothing. A wheel handoff runs once at a time: further wheel input in the same direction cannot retrigger or overshoot it, while opposite input retargets from the visible pose. This guard applies only to camera input outside the projected desktop and leaves desktop scrolling and browser zoom untouched. Keep the 5.5/6-unit thresholds, zoom limits, camera framing and instant reduced-motion/resize behavior. At rest, stop forcing an exact final pose; Drei continues invalidating residual camera updates in demand mode until natural sleep. Retain generation checks so stale moves cannot stop a newer transition.

Run node scripts/verify-camera-zoom.mjs against the local production preview to sample projected-screen motion during entry, exit, wheel thresholds and reversals, check damping tails and idle rendering, and save motion traces/screenshots under test-results/camera-zoom/.

## Hawas Ice desk bottle

The Hawas Ice model on the fragrance tray is a stylized Rasasi Hawas Ice bottle, based on the existing Gear & Collections photo: rounded blue/violet glass, white HAWAS / ICE lettering and an ivory ridged cap. Its small procedural color map is a product-material detail, not an interface gradient. Use the product name for each bottle tooltip and open its photo directly. The tray rim retains the Gear & Collections action. Dispose generated textures and mirror all four bottles in the mobile illustration. Keep the original gallery image and product data unchanged.

## Personal fragrance tray

A compact walnut tray in the existing right-hand perfume area displays Hawas Ice, Afnan Supremacy Collector's Edition, Liquid Brun, then Jaguar Classic Red, using the existing collection data for names, photos, captions and links. Bottle silhouettes follow the supplied photos: ivory-capped blue/violet Hawas, speckled pale Afnan with a black ring cap, brown/gold Liquid Brun, and red/silver Jaguar. Each bottle highlights independently and opens the existing lightbox; Escape returns to the same camera pose. Stop bottle events from also activating the tray. The tray rim opens Gear & Collections, and existing galleries provide keyboard/touch access. Keep surrounding shortcuts unobstructed and mirror the tray in the decorative mobile SVG. No additional lights, ambient loops, external models or dependencies; dispose procedural textures.

The printer sits slightly back and left of the fragrance tray so its résumé action remains visible. Run node scripts/verify-fragrance-tray.mjs for all four bottle photos/product links, dialog focus, tray and adjacent shortcuts, both themes, day/dusk/night at 1440/1366/1100px, and mobile/coarse-pointer scene exclusion. Comparison captures are saved under test-results/fragrance-tray/.


## Decorative PlayStation corner

The expanded left background shelf combines existing books and a trailing plant with a stylized original gray PlayStation, circular disc lid, wired controller, memory card, continuously lit power indicator, and four game cases. Keep the upper-left welcome panel clear and the monitor dominant. The games selected by Kurt are Tekken 3, the original Resident Evil, Final Fantasy VII, and Metal Gear Solid; do not invent ownership, playtime, ratings, or personal stories.

The entire gaming corner is decorative: no click handlers, hover labels or highlights, hand cursor, controller-button response, collection app, launcher entry, or app hash. Keep the console, controller, and cases static while preserving the existing room ambience. Cover metadata and source links remain in the shared collection definition, with optimized local North American cover artwork attributed in Credits. Optional cover textures must not fail the room and must be disposed on unmount. No emulator, ROMs, extra audio, lights, dependencies, or independent rendering loops.

Mobile mirrors the shelf decor in inline SVG, without miniature targets or 3D imports. Preserve the classic portfolio, project order, camera/input isolation, fragrance tray, and surrounding shortcuts. Run node scripts/verify-playstation-corner.mjs alongside the portfolio, retro-app, room, desktop-input, and camera checks. Verify that hovering/clicking the console, controller, and cases opens nothing, shows no tooltip, and preserves the active app and camera view. Review all desktop widths in both themes and day/dusk/night.


## Quiet gaming CRT

A compact gray 4:3 CRT sits beside the decorative PlayStation on the widened, slightly lower 4.8-unit shelf, framed by existing books, trailing greenery, and four cover cases. Keep the entire CRT below the welcome panel at all desktop breakpoints and secondary to the portfolio monitor. The screen shows an original silent PS1-inspired fighting vignette: polygonal figures, perspective arena, small health bars, slow exchanges, retreat, and reset over 12 seconds. No actual game footage, recognizable characters, tiny text, flashes, app launch, hover feedback, or interactions.

One reusable 160x120 canvas texture uses nearest-neighbor sampling and updates at most 12 times per second through the existing overview frame driver. Advance only during the visible, motion-enabled desk overview. Freeze for monitor view, hidden tabs, and reduced motion; do not catch up after pauses. Keep the phase in the existing in-memory room state across expanded-view scene unmounts. The console power indicator stays lit and brightens gently once per reset. Dispose the generated texture on replacement/unmount. Add no lights, external models, dependencies, audio, timers, or rendering loops. Mirror a static CRT fighting pose in the mobile SVG without loading 3D. Preserve camera input isolation, window/scroll state, original covers, and Credits attribution. Run node scripts/verify-playstation-corner.mjs and node scripts/verify-gaming-crt.mjs with the existing browser suites; capture idle, exchange, and reset frames and check rendering sleep.
