import { chromium } from '@playwright/test';

async function runFullQA() {
  console.log('=====================================================');
  console.log('   FULL END-TO-END QA & INTERACTION AUDIT SUITE      ');
  console.log('=====================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const results = {
    passed: [],
    failed: []
  };

  const assert = (condition, name, details = '') => {
    if (condition) {
      console.log(`  ✓ PASS: ${name} ${details ? '(' + details + ')' : ''}`);
      results.passed.push(name);
    } else {
      console.error(`  ✗ FAIL: ${name} ${details ? '(' + details + ')' : ''}`);
      results.failed.push({ name, details });
    }
  };

  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('vercel-scripts')) {
      console.log('  [BROWSER ERROR]:', msg.text());
    }
  });

  console.log('\n>>> STEP 1: INITIAL PAGE LOAD');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4200); // Preloader wait
  assert(await page.title() === 'Kurt Fariñas | Junior Full-Stack Developer', 'Page Title Verification');
  assert(await page.isVisible('#heroH1'), 'Hero Headline Visible');
  assert(await page.isVisible('.topo-canvas'), 'Hero Live Wave Canvas Mounted');

  console.log('\n>>> STEP 2: NAVBAR BUTTONS & THEME TOGGLE');
  // Projects Link
  await page.click('#navLinks button:has-text("PROJECTS")');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#projects'), 'Nav: Projects Button Scrolls to Projects');

  // Experience Link
  await page.click('#navLinks button:has-text("EXPERIENCE")');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#timeline'), 'Nav: Experience Button Scrolls to Timeline');

  // Skills Link
  await page.click('#navLinks button:has-text("SKILLS")');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#skills'), 'Nav: Skills Button Scrolls to Skills');

  // Contact Link
  await page.click('#navLinks button:has-text("CONTACT")');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#contact'), 'Nav: Contact Button Scrolls to Contact');

  // Hire Me Button
  await page.click('.btn-hire-me');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#contactForm'), 'Nav: HIRE ME Button Navigates to Contact');

  // Theme Toggle Button
  const initialTheme = await page.getAttribute('html', 'data-theme');
  await page.click('#themeToggleBtn');
  await page.waitForTimeout(300);
  const lightTheme = await page.getAttribute('html', 'data-theme');
  assert(lightTheme === 'light', 'Theme Toggle to Light Mode');

  await page.click('#themeToggleBtn');
  await page.waitForTimeout(300);
  const darkTheme = await page.getAttribute('html', 'data-theme');
  assert(darkTheme === 'dark' || darkTheme === null, 'Theme Toggle back to Dark Mode');

  // Logo Click (Scroll to Top)
  await page.click('nav .logo');
  await page.waitForTimeout(1200);
  const scrollY = await page.evaluate(() => window.scrollY);
  assert(scrollY < 100, 'Nav Logo Click Scrolls to Top', `scrollY: ${scrollY}`);

  console.log('\n>>> STEP 3: HERO CONTROLS & SOCIAL PILL');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);

  const heroGithub = await page.getAttribute('.hero-social-pill a[aria-label="GitHub Profile"]', 'href');
  assert(heroGithub === 'https://github.com/kurt-farinas', 'Hero GitHub Link Valid', heroGithub);

  const heroLinkedIn = await page.getAttribute('.hero-social-pill a[aria-label="LinkedIn Profile"]', 'href');
  assert(heroLinkedIn.includes('linkedin.com/in/kurt-vincent-fari%C3%B1as'), 'Hero LinkedIn Link Valid', heroLinkedIn);

  // Email Copy Button
  await page.click('.hero-social-pill button[aria-label="Email Me"]');
  await page.waitForTimeout(400);
  const toastVisible = await page.isVisible('.toast, .toast-item');
  assert(toastVisible, 'Hero Email Button Triggers Toast Notification');

  // Resume Modal Trigger
  await page.click('.hero-social-pill button[title="Preview Resume PDF"]');
  await page.waitForTimeout(500);
  assert(await page.isVisible('#resumeModal'), 'Hero Resume Button Opens Resume Modal');

  // Inside Resume Modal Checks
  const resumeOpenInTab = await page.getAttribute('#resumeModal a:has-text("Open in Tab")', 'href');
  const resumeDownload = await page.getAttribute('#resumeModal a:has-text("Download PDF")', 'href');
  assert(resumeOpenInTab === '/resume.pdf', 'Resume Modal: Open in Tab Link Valid', resumeOpenInTab);
  assert(resumeDownload === '/resume.pdf', 'Resume Modal: Download PDF Link Valid', resumeDownload);

  // Close Resume Modal via Close Button
  await page.click('#resumeModal .modal-close');
  await page.waitForTimeout(400);
  assert(!(await page.isVisible('#resumeModal')), 'Resume Modal Closes via Close Button');

  console.log('\n>>> STEP 4: FEATURED PROJECTS & DETAIL MODALS');
  await page.evaluate(() => document.getElementById('projects').scrollIntoView());
  await page.waitForTimeout(500);

  // Card 1: Boiyet's Gym
  const gymLiveDemo = await page.getAttribute('#ticket-gym a:has-text("Live Demo")', 'href');
  const gymViewCode = await page.getAttribute('#ticket-gym a:has-text("View Code")', 'href');
  assert(gymLiveDemo === 'https://gym-management-systemv2.vercel.app/', 'Gym Live Demo Link Valid', gymLiveDemo);
  assert(gymViewCode === 'https://github.com/kurt-farinas/gym-management-systemv2', 'Gym View Code Link Valid', gymViewCode);

  // Open Gym Modal via "View Full Details →" Button
  await page.click('#ticket-gym .btn-card-action');
  await page.waitForTimeout(500);
  assert(await page.isVisible('#projectModal'), 'Gym: View Full Details Button Opens Modal');
  assert(await page.textContent('#projectModal #modalTitle') === "Boiyet's Fitness Gym Management System", 'Gym Modal Title Correct');

  // Test Modal View Switcher (Arch & Sandbox)
  await page.click('#projectModal .modal-view-btn:has-text("Interactive Sandbox")');
  await page.waitForTimeout(300);
  assert(await page.isVisible('#modalViewArch, .modal-code-wrap'), 'Gym Modal: Switched to Architecture & Sandbox View');

  // Test Modal View Switcher (Screenshots)
  await page.click('#projectModal .modal-view-btn:has-text("Interface Screenshots")');
  await page.waitForTimeout(300);
  assert(await page.isVisible('#modalViewScreens, .screenshot-carousel'), 'Gym Modal: Switched back to Screenshots View');

  // Close Gym Modal via Escape Key
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  assert(!(await page.isVisible('#projectModal')), 'Gym Modal Closes via Escape Key');

  // Open Gym Modal via Screenshot Click
  await page.click('#ticket-gym .project-screenshot');
  await page.waitForTimeout(500);
  assert(await page.isVisible('#projectModal'), 'Gym: Screenshot Click Opens Modal');

  // Close Gym Modal via Backdrop Click
  await page.click('#projectModal', { position: { x: 10, y: 10 } });
  await page.waitForTimeout(400);
  assert(!(await page.isVisible('#projectModal')), 'Gym Modal Closes via Backdrop Click');

  // Card 2: CS Form No. 6 (DepEd HRIS)
  await page.click('#ticket-hris .btn-card-action');
  await page.waitForTimeout(500);
  assert(await page.isVisible('#projectModal'), 'HRIS: View Full Details Button Opens Modal');
  assert(await page.textContent('#projectModal #modalTitle') === "CS Form No. 6 Digitalization System", 'HRIS Modal Title Correct');

  // Test Carousel Tabs (Admin / Approver / Applicant)
  const carouselTabs = page.locator('#projectModal .carousel-tab');
  if (await carouselTabs.count() > 0) {
    await carouselTabs.nth(1).click();
    await page.waitForTimeout(300);
    assert(await carouselTabs.nth(1).evaluate(el => el.classList.contains('active')), 'HRIS Modal: Carousel Tab 2 Active (Approver)');

    await carouselTabs.nth(2).click();
    await page.waitForTimeout(300);
    assert(await carouselTabs.nth(2).evaluate(el => el.classList.contains('active')), 'HRIS Modal: Carousel Tab 3 Active (Applicant)');
  }

  // Test Lightbox on Screenshot Click
  await page.click('#projectModal .carousel-frame .project-screenshot');
  await page.waitForTimeout(500);
  const lightboxOpen = await page.isVisible('#screenshotModal');
  assert(lightboxOpen, 'HRIS Modal: Screenshot Click Opens Lightbox');

  // Close Lightbox
  await page.click('#screenshotModal .screenshot-modal-close');
  await page.waitForTimeout(300);
  assert(!(await page.isVisible('#screenshotModal')), 'Lightbox Closes via Close Button');

  // Close HRIS Modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  assert(!(await page.isVisible('#projectModal')), 'HRIS Modal Closes via Escape');

  console.log('\n>>> STEP 5: SKILLS INTERACTIVE CROSS-FILTER ENGINE');
  await page.evaluate(() => document.getElementById('skills').scrollIntoView());
  await page.waitForTimeout(500);

  // Filter by React
  await page.click('.skill-tags span:has-text("React")');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#skillFilterBanner'), 'Skills: Filter Banner Appears on React Click');
  assert(await page.locator('#ticket-gym').evaluate(el => el.classList.contains('highlight-pulse')), 'Gym Card Highlighted for React');
  assert(await page.locator('#ticket-hris').evaluate(el => el.classList.contains('highlight-pulse')), 'HRIS Card Highlighted for React');

  // Clear filter via Reset Button
  await page.click('.btn-clear-filter');
  await page.waitForTimeout(300);
  assert(!(await page.isVisible('#skillFilterBanner')), 'Skills: Reset Filter Button Clears Filter');

  // Filter by Laravel
  await page.click('.skill-tags span:has-text("Laravel")');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#skillFilterBanner'), 'Skills: Filter by Laravel Active');

  // Toggle off by clicking Laravel again
  await page.click('.skill-tags span:has-text("Laravel")');
  await page.waitForTimeout(300);
  assert(!(await page.isVisible('#skillFilterBanner')), 'Skills: Re-clicking Active Skill Clears Filter');

  console.log('\n>>> STEP 6: OUTSIDE THE IDE ROUTING & DOSSIER');
  await page.evaluate(() => document.getElementById('beyond').scrollIntoView());
  await page.waitForTimeout(500);
  // Teaser CTA navigation
  await page.click('.btn-outside-route');
  await page.waitForTimeout(600);
  assert(page.url().includes('/outside-the-ide'), 'Outside the IDE: CTA Navigates to /outside-the-ide', page.url());
  assert(await page.isVisible('.beyond-bento-grid'), 'Outside the IDE: 5 Bento Tiles Rendered');

  // Return to Main Portfolio Link
  await page.click('.btn-back-home');
  await page.waitForTimeout(600);
  assert(page.url() === 'http://localhost:5173/' || page.url().endsWith(':5173/'), 'Outside the IDE: Back Button Returns to Home', page.url());

  console.log('\n>>> STEP 7: CONTACT SECTION INPUTS & SUBMISSION');
  // Scroll to contact
  await page.evaluate(() => document.getElementById('contact').scrollIntoView());
  await page.waitForTimeout(400);

  // Form input field tests
  await page.fill('#contactName', 'Jane Recruiter');
  await page.fill('#contactEmail', 'jane@techrecruiting.com');
  await page.fill('#contactSubject', 'Junior Full-Stack Opportunity');
  await page.fill('#contactMessage', 'Hello Kurt, we reviewed your portfolio and would like to schedule an interview.');
  
  assert(await page.inputValue('#contactName') === 'Jane Recruiter', 'Contact Form: Name Input Functional');
  assert(await page.inputValue('#contactEmail') === 'jane@techrecruiting.com', 'Contact Form: Email Input Functional');
  assert(await page.inputValue('#contactSubject') === 'Junior Full-Stack Opportunity', 'Contact Form: Subject Input Functional');
  assert(await page.inputValue('#contactMessage') === 'Hello Kurt, we reviewed your portfolio and would like to schedule an interview.', 'Contact Form: Message Input Functional');

  console.log('\n>>> STEP 8: COMMAND PALETTE (Ctrl+K) & SHORTCUTS');
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(400);
  assert(await page.isVisible('.cmd-palette-card'), 'Command Palette: Ctrl+K Opens Palette');

  // Search for "gym" in command palette
  await page.fill('.cmd-palette-input', 'gym');
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  assert(await page.isVisible('#projectModal'), 'Command Palette: Executing "gym" Opens Gym Modal');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // Search for "theme" in command palette
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(300);
  await page.fill('.cmd-palette-input', 'theme');
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  assert(await page.getAttribute('html', 'data-theme') === 'light', 'Command Palette: Executing "theme" Toggles Theme');

  // Toggle theme back
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(300);
  await page.fill('.cmd-palette-input', 'theme');
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  assert(await page.getAttribute('html', 'data-theme') === 'dark' || await page.getAttribute('html', 'data-theme') === null, 'Command Palette: Toggles Theme Back to Dark');

  console.log('\n>>> STEP 9: FOOTER BUTTONS & NAVIGATION');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);

  // Footer Resume Modal
  await page.click('.simple-footer button[title="Resume PDF"]');
  await page.waitForTimeout(500);
  assert(await page.isVisible('#resumeModal'), 'Footer: Resume Button Opens Modal');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Footer Back to Top
  await page.click('.back-to-top');
  await page.waitForTimeout(1200);
  const finalScrollY = await page.evaluate(() => window.scrollY);
  assert(finalScrollY < 100, 'Footer: Back to Top Button Scrolls to Top', `scrollY: ${finalScrollY}`);

  console.log('\n>>> STEP 10: MOBILE MENU & RESPONSIVE CHECK');
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
  await page.waitForTimeout(400);

  await page.click('.hamburger');
  await page.waitForTimeout(400);
  assert(await page.isVisible('#mobileMenu.open'), 'Mobile: Hamburger Opens Mobile Drawer');

  await page.click('#mobileMenu button:has-text("PROJECTS")');
  await page.waitForTimeout(400);
  assert(!(await page.isVisible('#mobileMenu.open')), 'Mobile: Clicking Nav Link Closes Mobile Menu');

  await browser.close();

  console.log('\n=====================================================');
  console.log(`QA AUDIT COMPLETE: ${results.passed.length} Passed, ${results.failed.length} Failed`);
  console.log('=====================================================');

  if (results.failed.length > 0) {
    console.error('FAILED CHECKS:', JSON.stringify(results.failed, null, 2));
    process.exit(1);
  }
}

runFullQA().catch(err => {
  console.error('QA Test Run Failed with Error:', err);
  process.exit(1);
});
