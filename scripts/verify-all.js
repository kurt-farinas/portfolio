import { chromium } from '@playwright/test';

async function verifyAll() {
  console.log('--- Starting Comprehensive Playwright Verification ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });

  console.log('Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000); // Wait for preloader

  // 1. Verify Project 1 (Gym) Modal
  console.log('\n[1] Testing Boiyet\'s Gym "View Full Details →" button...');
  const gymBtn = page.locator('#ticket-gym .btn-card-action');
  await gymBtn.scrollIntoViewIfNeeded();
  await gymBtn.click();
  await page.waitForTimeout(600);

  const gymModalVisible = await page.isVisible('#projectModal');
  const gymModalTitle = await page.textContent('#projectModal #modalTitle');
  console.log(`Gym modal visible: ${gymModalVisible}, Title: "${gymModalTitle}"`);

  await page.screenshot({ path: 'verify-gym-modal.png' });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 2. Verify Project 2 (HRIS) Modal
  console.log('\n[2] Testing CS Form No. 6 "View Full Details →" button...');
  const hrisBtn = page.locator('#ticket-hris .btn-card-action');
  await hrisBtn.scrollIntoViewIfNeeded();
  await hrisBtn.click();
  await page.waitForTimeout(600);

  const hrisModalVisible = await page.isVisible('#projectModal');
  const hrisModalTitle = await page.textContent('#projectModal #modalTitle');
  console.log(`HRIS modal visible: ${hrisModalVisible}, Title: "${hrisModalTitle}"`);

  await page.screenshot({ path: 'verify-hris-modal.png' });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 3. Verify Projects Section & Stack Pills layout
  console.log('\n[3] Capturing Projects Section Screenshot...');
  const projectsSection = page.locator('#projects');
  await projectsSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'verify-projects-section.png' });

  // 4. Verify Resume Modal from Hero Pill
  console.log('\n[4] Testing Hero Resume Pill button...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  const heroResumeBtn = page.locator('.hero-social-pill button[title="Preview Resume PDF"]');
  await heroResumeBtn.click();
  await page.waitForTimeout(600);

  const resumeModalVisible = await page.isVisible('#resumeModal');
  console.log(`Resume modal visible: ${resumeModalVisible}`);
  await page.screenshot({ path: 'verify-resume-modal.png' });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  await browser.close();
  console.log('\n--- Verification script finished successfully ---');
}

verifyAll().catch(err => {
  console.error('Test script failed:', err);
  process.exit(1);
});
