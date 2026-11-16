## 2026-11-16 14:29 — 09c24f5 — Live-site screenshots; test-count claims removed
- By: Claude Code, requested by Kurt Fariñas
- Card: #85
- Code: 14b6adb → 09c24f5
- Migrations: none
- Backup: none (static site; roll back by redeploying 5d0f7ea in Vercel)
- Data changes: none
- Verified: git push to main; on https://kurt-farinas-portfolio.vercel.app/ resume.pdf, pmpc-workforce.png, boiyets-landing.png, pmpc-pis-landing.webp and pmpc-gen-mdse.jpg are byte-for-byte the same size as the local files, and the live JS bundle no longer contains "119 Passing". Not checked: how the new images look on the live Projects page in each theme.

## 2026-11-16 14:23 — 14b6adb — Refresh PMPC case studies and résumé through Nov 16
- By: Claude Code, requested by Kurt Fariñas
- Card: #84
- Code: b907bd5 → 14b6adb
- Migrations: none
- Backup: none (static site; roll back by redeploying 3923adf in Vercel)
- Data changes: none
- Verified: git push to main; https://kurt-farinas-portfolio.vercel.app/resume.pdf returns 200 at 72,232 bytes (the new file) and the live JS bundle contains the new PIS copy (KaagapayAI). Not checked on the live site: the case-study dialogs in each theme, or the PDF opened in a viewer.

## 2026-11-16 05:12 — 3923adf — Weak GPUs step down sooner; lighter room view
- By: Claude Code, requested by Kurt Fariñas
- Card: #66
- Code: ed7b73e → 3923adf
- Migrations: none
- Backup: none (static site; roll back by redeploying ed7b73e in Vercel)
- Data changes: none
- Verified: Vercel build succeeded; on https://kurt-farinas-portfolio.vercel.app/ at 20x CPU throttle the "Use the lighter view" link appears and switches to the room picture with no canvas; with the GPU disabled the room picture (dusk capture) still loads in both themes with 9 hotspots. The smoothness gain on a real weak-GPU PC is not verified.

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
