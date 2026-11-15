## 2026-11-16 04:51 — 83f905a — Room picture for PCs without usable WebGL
- By: Claude Code, requested by Kurt Fariñas
- Card: #66
- Code: eb26308 → 83f905a
- Migrations: none
- Backup: none (static site; roll back by redeploying eb26308 in Vercel)
- Data changes: none
- Verified: Vercel build succeeded; on https://kurt-farinas-portfolio.vercel.app/ with Chromium --disable-gpu --disable-software-rasterizer (both themes) there is no canvas, room/*-night.png.webp loads with 9 hotspots, the Projects hotspot opens Projects in the expanded desktop, Back to desk returns to the picture, and there are no page errors; with the GPU on, the 3D room and projected desktop load as before.

## 2026-11-16 04:19 — 610797a — Cut the desk-load freeze from the monitor snapshot
- By: Claude Code, requested by Kurt Fariñas
- Card: #65
- Code: 4ba3281 → 610797a
- Migrations: none
- Backup: none (static site; roll back by redeploying 4ba3281 in Vercel)
- Data changes: none
- Verified: Vercel build succeeded; live DeskScene-DwSdysc4.js contains the new style list; profile-desk-performance.mjs against https://kurt-farinas-portfolio.vercel.app at 4x CPU throttle shows the worst load frame at 1,267 ms (was about 3,900 ms) and a steady 16.7 ms idle; the monitor overview snapshot renders correctly in dark and light themes.

## 2026-11-16 03:46 — e3bd706 — Preload Classic Portfolio chunk
- By: Claude Code, requested by Kurt Fariñas
- Card: #55
- Code: da120ed → e3bd706
- Migrations: none
- Backup: none (static site; roll back by redeploying da120ed in Vercel)
- Data changes: none
- Verified: Vercel build succeeded; on https://kurt-farinas-portfolio.vercel.app/ at 1440px the ClassicPortfolio-CYlQjNZ1.js chunk downloads without a click, and clicking Classic Portfolio shows the classic page immediately with no blank screen.

## 2026-11-16 02:05 — e6b6a0d — Boot screen, preview polish and lazy-loaded apps
- By: Claude Code, requested by Kurt Fariñas
- Card: #55
- Code: 423a82b → e6b6a0d
- Migrations: none
- Backup: none (static site; roll back by redeploying 423a82b in Vercel)
- Data changes: none
- Verified: Vercel build succeeded; https://kurt-farinas-portfolio.vercel.app/ serves index-D5o06Hs9.js (same as the local build) with the new "Click or press any key to skip." boot text and no old boot buttons; /resume.pdf returns 200.
