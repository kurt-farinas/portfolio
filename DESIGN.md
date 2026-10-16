# Portfolio Design

## Direction

The portfolio is an interactive workstation. The first desktop view shows an original 3D desk; its monitor contains the same React desktop that opens in full-screen mode. Narrow screens, coarse pointers, and WebGL failures use that desktop in 2D. Portfolio claims and project evidence remain factual and recruiter-facing.

The workstation uses simple reusable Three.js geometry with a demand-rendered React Three Fiber scene that requests the high-performance GPU. Its screen content is a real React interface projected with Drei HTML. Camera changes, including the scroll-to-lock onto the monitor, glide smoothly and happen after user input, plus one pull-back from the monitor to the whole desk when the boot splash ends; all become instant when reduced motion is enabled. Gentle ambient motion runs only in the desk overview while the tab is visible and reduced motion is off: the plant leaves move, stars twinkle at night, and coffee steam rises; the curtains hang still and there are no dust motes. A vsync-paced ~30 fps invalidate driver supplies the frames; the scene sleeps again in the monitor and expanded views. Desk meshes cast hard-edged shadow-map shadows. Clickable desk objects show a pale-yellow Win98 tooltip and an accent tint on hover; a desk clock and the taskbar show local time, redrawn once per minute. Room lighting and a wall window follow the visitor's time of day without animated transitions, and a dot-matrix printer feeds a résumé page on click. The room also has a wall shelf with books, a potted plant, a rug, curtains on the window, a cork board below the window (Projects), and a postage-stamp portrait of Kurt taped to the lamp shade. A string of warm fairy lights hangs in two swags on the back wall above the monitor, with five After Hours photos pegged on as polaroids; the bulbs glow and light the wall at night (or with the lamp setting on), twinkle and sway with the ambient motion, and clicking a polaroid opens that photo in the photo lightbox. Night ambient light is warm. A dynamic import keeps Three.js and the scene bundle out of the mobile path.

## Visual system

- Use the Win98 system font stack (Tahoma, Segoe UI, Verdana) for body and display text. Window chrome, title bars, buttons, the taskbar, and the boot screen use the pixel font (--font-pixel). The self-hosted Figtree/Space Grotesk files and license remain but are no longer loaded.
- Keep the saved dark/light theme, default to dark, and use src/styles/variables.css for interface and workstation material colors.
- The desktop has a compact top bar, a left app launcher on capable desktop screens, movable/resizable application windows, and a bottom taskbar. Reuse the app manager in the monitor and expanded 2D views.
- Use Windows 98-inspired solid gray chrome, navy active title bars, beveled borders, square controls, period-style SVG icons, and visible text labels. The same chrome covers buttons, dialogs, toasts, panels, and scrollbars; reading dialogs keep a paper client area. App content uses etched dividers, groove group boxes for project entries, sunken picture frames, and raised tags; text stays 16px. No rounded corners except avatars and status dots. Avoid gradients, blur, soft shadows, and card-heavy presentation. App windows zoom in briefly when they appear, except with reduced motion.
- Keep controls at least 44px tall with a visible 3px focus outline. Preserve native text entry, touch, drag, zoom, and pointer behavior. Respect reduced motion.
- Keep desktop window dragging on the title bar, resizing on the corner handle, and keyboard Move/Resize controls in the title bar of restored windows. Keep one window per app, maintain window bounds after viewport changes, and save app scroll and gallery selection while changing views.
- On mobile or coarse-pointer devices, show one full-screen app at a time with the app launcher available from the top bar. Do not load the scene module or its Three.js dependencies.
- Keep the portfolio desktop immediately usable while the 3D chunk loads or when WebGL cannot start. Projects and the direct /resume.pdf path remain available.
- Global project, résumé, screenshot, and photo dialogs sit outside the projected monitor. They retain focus containment, Escape handling, focus restoration, readable dimensions, and modal priority. Ctrl/Cmd+K opens the searchable app palette.
- The fictional retro workstation uses a beige CRT, beige keyboard and mouse, a desk lamp, coffee mug, microphone, photo prints, fragrance bottle, and résumé sheet. Gear & Collections still shows Kurt's actual equipment.
- The CRT projects the real desktop even in overview, with inert controls until focused. Its physical power button is reversible. Sticky notes open Projects and Contact; photos, fragrance, and résumé open their corresponding apps; a framed wall certificate opens Recognition.
- The keyboard uses instanced beige caps and legends, with brief input-triggered key presses. Reduced motion disables key movement. The lamp is optional and starts off; coffee steam is part of the ambient motion.
- Camera controls support direct pointer movement only. Use frameloop=demand so the renderer sleeps between input and camera transitions.

## Content and routes

- Kurt-OS About is a compact profile: portrait/name/role and wrapping résumé action, a 24px statement, two biography paragraphs, and paired Education/Current role rows. A single 24px inset (12px mobile) aligns all content with 16px gaps. Container queries stack actions and facts below 480px of app content width. Classic keeps the original editorial presentation. `#about` belongs to the app root; route entry starts at the profile while app/view changes preserve scroll. Validate using `scripts/verify-about-layout.mjs`.

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

On the 3D-capable desktop, the long reading apps (Projects, Experience, Résumé) open maximized. Reopening one from the room or monitor maximizes it again, including a minimized window; in the expanded desktop a restored window stays restored. Restore remains available and retains the previous window rectangle. Short apps open as windows sized to their content and cascaded so their title bars stay visible: About (starts open), Recognition, Stack, and Contact. Games stay full-window; My Computer, After Hours, Gear & Collections, Terminal, and Credits open as default windows. Mobile and 2D-fallback opening behavior stay unchanged. Title bars show Minimize, Maximize/Restore, and Close; the keyboard Move/Resize controls exist only on restored windows and stay off-screen until reached with the keyboard. The focused camera fits the monitor glass with a narrow bezel margin according to the viewport aspect ratio; Expand desktop remains available. Preserve desktop input isolation and instant reduced-motion transitions.

## Workstation art direction and project reading

The room follows a late-1990s home-workstation palette: ivory hardware, a walnut desk with a small procedural grain map, muted teal curtains/rug, and oxblood accents. Warm key light contrasts with the cooler window; lower ambient light keeps geometry and hard shadows readable. Preserve original photos, day/dusk/night behavior, lamp settings, and demand rendering.

The Kurt-OS Projects app presents each of the same six projects in the existing order as screenshot, role/status, Decision, Result, and the existing case-study action. Complete narratives, contributions, technology lists, release caveats, and original screenshots remain in the project dialog. Classic Portfolio keeps its detailed page layout. Keep the OJT 98/100 rating and 342 hours visible in the compact result. A separate Kurt-OS build-notes section after the six projects documents projection, shared state, camera input, fallback, accessibility, and rendering trade-offs; it is not another client project.

On small screens and coarse pointers, the About app starts with a lightweight inline-SVG workstation and three keyboard-accessible Projects, Résumé, and Contact shortcuts. It shares room palette tokens and adds no 3D imports or external assets. Because its Résumé shortcut sits directly above, the profile Resume button is hidden there; desktop About keeps it. Other app layouts remain fullscreen and scrollable. Validate both schemes at 375px and coarse-pointer fallback as well as the desktop monitor.

## Room and transition polish

Give the workstation a believable setting rather than an empty backdrop. Low sage wall paneling meets warm plank flooring; an inset rug border and small woven-style diamonds anchor the desk. Layered landscape silhouettes, a sun/moon, a substantial sill and a small plant add depth outside the window. Rounded leaves, supported books, a notebook and pencil, and a cork mug coaster suggest daily use without competing with the real photos or monitor. Use existing ivory/walnut/teal/oxblood colors and centralized environment tokens. All additions are decorative procedural geometry; preserve existing motion gating, camera framing, clickable silhouettes, shadow budget, and mobile scene exclusion. The mobile illustration echoes the landscape, sill plant, paneling and notebook.

Keep the overview at a gentle three-quarter angle while the reading view faces the monitor straight on. Preserve the welcome panel's clear upper-left wall area, keep the window on the right, and separate the microphone, fragrance bottle, and mug across depth. The desk uses a small, deterministic irregular grain texture and a subtle bevel, with no external textures. A non-shadow-casting front fill keeps dark hardware readable at night; retain the 1024px shadow map and 1.25 pixel-ratio cap. The mobile SVG mirrors the angled desk, monitor side, and separated accessories without loading 3D.

For smoother miniature text and bevel borders in the zoomed-out overview, use reciprocal HTML scaling: Html group scale 0.5, 2560x1520 outer clipping area, and CSS zoom 2 on the inert 1280x760 logical frame. The scales cancel geometrically, retaining screen placement and camera framing while rasterizing the miniature interface at higher density. Focused monitor, fullscreen, and mobile retain normal scale and native input. Preserve scrolling, focus, camera input isolation, and expanded-view state. Do not increase WebGL resolution to fix HTML artifacts.

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


## Mobile navigation and visual polish

Mobile and coarse-pointer Kurt-OS retains the fullscreen app model, static workstation, and bottom app switcher. Start is the sole app-menu trigger; the upper toolbar keeps Home, theme, and search. The toolbar/title bar/taskbar measure 52/50/56px before safe-area additions, with matching content/menu offsets and 44px targets. Dynamic viewport sizing removes the old 520/560px floor in landscape and short viewports. Open-app buttons retain usable minimum widths and scroll horizontally instead of shrinking as more apps open.

Primary app headings use the 24px mobile typography token, body text remains 16px, and content uses 12px horizontal padding. Contained project previews are capped at 160px without changing captions or ownership/status information. Profile, shortcut, introduction, and project spacing are refined using existing tokens. Beveled active/selected states and visible 3px keyboard focus remain consistent. Saved theme/effect preferences are unchanged. These rules affect only Kurt-OS touch/narrow layouts; desktop and Classic retain their presentation. Verify with scripts/verify-mobile-polish.mjs and before/after captures under test-results/mobile-polish/.

## Section headers

Kurt-OS windows omit the redundant Portfolio address row and reclaim its 36px for content without changing window rectangles. Project actions use View project with specific accessible names, and inherited ownership stays in the card attribution/modal badge rather than repeated prose. Contact starts with identity and the form; build notes retain their technical introduction and expandable details without a category eyebrow or architecture overview. Modal labels are Contributions and Technologies. Each project screenshot (Kurt-OS and Classic) is also a button named "Open case study: <title>" that opens the same project dialog as View project; focus returns to it on close.

Section headers keep their titles without generic category labels or explanatory taglines. Projects, After Hours, and Gear & Collections begin directly with their titles; After Hours centers its photo stack in a single column after removing the duplicate introduction. Résumé and Contact retain name/role and functional content without generic eyebrow text. The shared pages use this treatment in both Kurt-OS and Classic Portfolio.

## PMPC contribution coverage

The PIS, WorkForce/DTR, and General Merchandise cards remain compact Decision/Result summaries. Their existing case-study dialogs group the September 16–October 15, 2026 contribution period without introducing a changelog interface. PIS includes September accounting work and subsequently deployed request, notification, and portal improvements. WorkForce and General Merchandise distinguish confirmed releases from local additions; no blanket unreleased label or proposed-only wording obscures completed implementation. Keep inherited ownership, original project order, screenshots, links, and classic layout. See docs/pmpc-contribution-audit.md for evidence and limits.

## Quiet gaming CRT

A compact gray 4:3 CRT sits beside the decorative PlayStation on the widened, slightly lower 4.8-unit shelf, framed by existing books, trailing greenery, and four cover cases. Keep the entire CRT below the welcome panel at all desktop breakpoints and secondary to the portfolio monitor. The screen shows an original silent PS1-inspired fighting vignette: polygonal figures, perspective arena, small health bars, slow exchanges, retreat, and reset over 12 seconds. No actual game footage, recognizable characters, tiny text, flashes, app launch, hover feedback, or interactions.

One reusable 160x120 canvas texture uses nearest-neighbor sampling and updates at most 12 times per second through the existing overview frame driver. Advance only during the visible, motion-enabled desk overview. Freeze for monitor view, hidden tabs, and reduced motion; do not catch up after pauses. Keep the phase in the existing in-memory room state across expanded-view scene unmounts. The console power indicator stays lit and brightens gently once per reset. Dispose the generated texture on replacement/unmount. Add no lights, external models, dependencies, audio, timers, or rendering loops. Mirror a static CRT fighting pose in the mobile SVG without loading 3D. Preserve camera input isolation, window/scroll state, original covers, and Credits attribution. Run node scripts/verify-playstation-corner.mjs and node scripts/verify-gaming-crt.mjs with the existing browser suites; capture idle, exchange, and reset frames and check rendering sleep.


## Recruiter-facing polish

The desk welcome card labels Kurt Fariñas and Junior Full-Stack Developer on two eyebrow lines. Sticky notes show one large label (Projects, Contact); the hover tooltip names the action. The bottom-right scene hint sits on a solid surface chip so it stays readable over the room in both themes. Recognition lists five entries, including Alumni President for the STI College San Jose Batch 2026 graduates (no date shown). Command-palette search ignores accents, its entries use one "Open …" verb pattern, and its footer reads Kurt-OS · React SPA; the classic footer shows Kurt Fariñas. Project cards show role and release status as one sentence-case line. On desktop the Kurt-OS Projects column widens to --content-width-wide with screenshots up to 420px tall, and the first project screenshot loads eagerly. Case-study badges use raised-tag padding, with space above the contribution period.

Focus outlines stay 3px wide. On mobile/coarse-pointer Kurt-OS, chrome buttons and links keep the 3px accent outline at a 2px offset so it is not clipped by the compact title bar and toolbar.

## Redundancy cleanup

Start is the only app-menu trigger on every screen; the desktop toolbar has no separate Apps button or non-interactive "Portfolio desktop" label. Project dialogs show the ownership badge without repeating the role tag beside the title; cards keep the role and release-status line. The Stack app lists only technologies backed by a shown project, certification, or the résumé (no Next.js or Docker). The unused dither pipeline, empty style stubs, unreferenced one-off scripts, root screenshots and copies, the outdated root résumé, and unused public images were removed; og-preview.jpg and profile.jpg stay because external links may point to them.

## Desktop app compositions

On the fine-pointer desktop (1100px and wider), each reading app has its own Win98 composition inside its window, with no shared side pane or status bar. About shows a profile card group box (96px sunken portrait, name, role, Resume button, statement, and profile icons), the biography, and an Education/Current role group box. Experience entries and Recognition awards are groove group boxes (awards in two columns); Stack lists technologies as raised tags beside each category; Contact places its mail lines and form in one group box at the header's width; Résumé keeps its actions and a sunken preview frame at one width. Mobile and Classic layouts are unchanged. The Kurt-OS About Resume button is hidden only on mobile/coarse-pointer screens, where the Résumé shortcut sits directly above it.
