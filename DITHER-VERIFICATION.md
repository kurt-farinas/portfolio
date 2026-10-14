# Dither implementation verification

Implemented locally on theme/dither on 2026-10-11. No push or deployment.

## Results

- Unit tests: 20 passing across five files.
- Production build: passes with no Vite warnings.
- Image verification: 31 generated PNGs pass; every pixel is opaque black or white.
- Source audit: active CSS/components and index.html pass the two-color/effect checks.
- Browser verification: 78 scans pass across all four routes, light/dark schemes,
  and 1440x1000 / 375x812 viewports.
- No horizontal overflow. Measured controls satisfy 44x44px targets, with visible
  3px focus outlines. No computed CSS animations, transitions, gradients,
  fractional opacity, blurred shadows, or backdrop filters.
- All rendered images have intrinsic dimensions, preserved alt text, and pixelated
  rendering. All applicable below-fold images load lazily.
- Project carousel slides, keyboard lightboxes, Escape, focus restoration and
  focus wrapping pass. Resume preview/download paths are unchanged and the PDF
  returns application/pdf. Command search/keyboard execution, skill filters,
  photo buttons/keyboard/pointer dragging, gear previews and fallback pass.
- Reduced motion draws no hero effect. Unit coverage verifies one-run behavior,
  Strict Mode scheduling, cancellation, observer/listener cleanup, and system/
  persisted theme preferences.
- All three font requests return 200 from the local origin. Only Pixelify Sans 400
  and Atkinson Hyperlegible 400 are preloaded; Atkinson 700 loads normally.
- git diff --check passes. No lint command is configured.

## Preservation and assumptions

The starting working tree contained a substantial earlier redesign. Its current
content, section order, accessibility behavior, and interaction fixes were retained
as the baseline; its old visual theme was replaced. Related inherited edits are
included in the theme commits. The unused pre-existing public/images/connected-systems.webp
was left untracked and unstaged.

SHA-256 comparisons confirm projectData.js, resume.pdf, vercel.json, robots.txt,
and sitemap.xml are identical to the starting snapshot. All meta tags, title,
canonical link, and JSON-LD match the starting snapshot. Public originals and
their URLs remain intact. Google font links were replaced with self-hosted font
preloads, and an early saved-theme initializer avoids a theme flash.

The optional OG regeneration and theme-color modification were skipped. Existing
arrows embedded in copy, uppercase source text, and source captions were preserved;
decorative arrow spans and CSS-generated arrows were removed.

## Image legibility

All eight project images were inspected at 600px and 1200px. The 600px versions
lost useful UI labels. Each exports at 1200px without cropping, retaining the full
interface evidence and improving major-label and layout legibility:

| Image | Export width | Crop |
| --- | ---: | --- |
| hris-admin.png | 1200 | None |
| hris-approver.png | 1200 | None |
| hris-applicant.png | 1200 | None |
| boiyets-landing.png | 1200 | None |
| gym-admin.png | 1200 | None |
| gym-trainer.png | 1200 | None |
| gym-client.png | 1200 | None |
| job-hunt-ledger.png | 1200 | None |

Personal viewer images export at 600px, and the 280px portrait frame uses a 140px
export. The detailed sizing/provenance is recorded in scripts/dither-report.json.
Fine screenshot text remains small at phone widths, as in the original images;
the written project evidence remains readable and the image viewer preserves the
full screenshot. Image scaling is pixelated; exact integer scaling is used where
the layout permits it.

## Known boundaries

- The absent /images/outside/mchose-ace60-detail.jpg retains the existing keyboard
  schematic fallback. It is not requested as a broken network image.
- The existing Vercel analytics endpoint /_vercel/insights/script.js is unavailable
  in the local Vite preview. Its known 404 is recorded separately from unexpected
  browser errors. Analytics implementation was preserved.
- PDF network requests can be canceled when their modal closes; the PDF itself
  returns 200 and remains unchanged.
- Four untouched, unreferenced legacy files retain old effects:
  src/js/effects.js, src/js/faceEyeTracker.js, src/js/facePointCloud.js, and
  src/js/topoBackground.js. They are excluded from the active-theme pass and
  explicitly reported by the source audit.
- npm reported five dependency advisories during installation. Existing locked
  package versions did not change; no dependency-wide update was performed.
- Verification is local Chromium testing, not production or cross-browser
  certification. No hosting changes were made.

## Reproduce

Run npm test -- --run, npm run build, npm run dither:check, npm run theme:check,
and git diff --check. Start npm run preview -- --host 127.0.0.1 --port 4173,
then run node scripts/verify-dither-ui.mjs. Set DITHER_QA_OUTPUT to choose the
browser report and screenshot directory.

## Changed files

- `AGENTS.md`
- `DESIGN.md`
- `DITHER-VERIFICATION.md`
- `index.html`
- `package-lock.json`
- `package.json`
- `scripts/check-dither-images.mjs`
- `scripts/check-dither-theme.mjs`
- `scripts/dither-config.mjs`
- `scripts/dither-images.mjs`
- `scripts/dither-report.json`
- `scripts/verify-dither-ui.mjs`
- `src/App.jsx`
- `src/assets/personal-src/1.jpg`
- `src/assets/personal-src/2.jpg`
- `src/assets/personal-src/3.jpg`
- `src/assets/personal-src/4.jpg`
- `src/assets/personal-src/5.jpg`
- `src/assets/personal-src/6.jpg`
- `src/assets/personal-src/7.jpg`
- `src/assets/personal-src/8.jpg`
- `src/assets/personal-src/9.jpg`
- `src/assets/personal-src/afnan-sce.jpg`
- `src/assets/personal-src/asus-tuf-a15.jpg`
- `src/assets/personal-src/attack-shark-x6.jpg`
- `src/assets/personal-src/gaming-setup.jpg`
- `src/assets/personal-src/gym-gear.jpg`
- `src/assets/personal-src/gym-training.jpg`
- `src/assets/personal-src/hawas-ice.jpg`
- `src/assets/personal-src/jaguar-red.jpg`
- `src/assets/personal-src/koorui-24e3.jpg`
- `src/assets/personal-src/liquid-brun.jpg`
- `src/assets/personal-src/mchose-ace60.jpg`
- `src/assets/personal-src/mobile-device.jpg`
- `src/assets/personal-src/profile.jpg`
- `src/assets/personal-src/salnotes-zero.jpg`
- `src/assets/personal/1.png`
- `src/assets/personal/2.png`
- `src/assets/personal/3.png`
- `src/assets/personal/4.png`
- `src/assets/personal/5.png`
- `src/assets/personal/6.png`
- `src/assets/personal/7.png`
- `src/assets/personal/8.png`
- `src/assets/personal/9.png`
- `src/assets/personal/afnan-sce.png`
- `src/assets/personal/asus-tuf-a15.png`
- `src/assets/personal/attack-shark-x6.png`
- `src/assets/personal/gaming-setup.png`
- `src/assets/personal/gym-gear.png`
- `src/assets/personal/gym-training.png`
- `src/assets/personal/hawas-ice.png`
- `src/assets/personal/jaguar-red.png`
- `src/assets/personal/koorui-24e3.png`
- `src/assets/personal/liquid-brun.png`
- `src/assets/personal/mchose-ace60.png`
- `src/assets/personal/mobile-device.png`
- `src/assets/personal/profile.png`
- `src/assets/personal/salnotes-zero.png`
- `src/assets/projects-src/boiyets-landing.png`
- `src/assets/projects-src/gym-admin.png`
- `src/assets/projects-src/gym-client.png`
- `src/assets/projects-src/gym-trainer.png`
- `src/assets/projects-src/hris-admin.png`
- `src/assets/projects-src/hris-applicant.png`
- `src/assets/projects-src/hris-approver.png`
- `src/assets/projects-src/job-hunt-ledger.png`
- `src/assets/projects/boiyets-landing.png`
- `src/assets/projects/gym-admin.png`
- `src/assets/projects/gym-client.png`
- `src/assets/projects/gym-trainer.png`
- `src/assets/projects/hris-admin.png`
- `src/assets/projects/hris-applicant.png`
- `src/assets/projects/hris-approver.png`
- `src/assets/projects/job-hunt-ledger.png`
- `src/components/common/CommandPalette.jsx`
- `src/components/common/DitherImage.jsx`
- `src/components/common/EmailCta.jsx`
- `src/components/common/GearCard.jsx`
- `src/components/common/HeroDither.jsx`
- `src/components/common/PhotoDeckShuffler.jsx`
- `src/components/common/Preloader.jsx`
- `src/components/common/ProjectModal.jsx`
- `src/components/common/ResumeModal.jsx`
- `src/components/common/ScreenshotLightbox.jsx`
- `src/components/common/SectionHeading.jsx`
- `src/components/common/WaveBackground.jsx`
- `src/components/layout/Footer.jsx`
- `src/components/layout/Navbar.jsx`
- `src/components/sections/AboutSection.jsx`
- `src/components/sections/AwardsSection.jsx`
- `src/components/sections/Hero.jsx`
- `src/components/sections/ProjectsSection.jsx`
- `src/components/sections/SkillsSection.jsx`
- `src/components/sections/TimelineSection.jsx`
- `src/context/ModalContext.jsx`
- `src/context/ThemeContext.jsx`
- `src/data/ditherManifest.json`
- `src/pages/HomePage.jsx`
- `src/pages/OutsideTheIdePage.jsx`
- `src/styles/animations.css`
- `src/styles/components.css`
- `src/styles/fonts.css`
- `src/styles/index.css`
- `src/styles/layout.css`
- `src/styles/reset.css`
- `src/styles/studio-after-hours.css`
- `src/styles/studio-home.css`
- `src/styles/studio-overlays.css`
- `src/styles/studio-shared.css`
- `src/styles/variables.css`
- `src/utils/motion.js`
- `tests/commandPalette.interaction.test.jsx`
- `tests/heroDither.behavior.test.jsx`
- `tests/theme.behavior.test.jsx`
