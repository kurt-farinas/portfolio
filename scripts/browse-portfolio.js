import { chromium } from '@playwright/test';

async function explorePortfolio() {
  console.log('--- Launching Playwright Chromium ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const url = 'http://localhost:5173/';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait for preloader animation & curtains to finish
  await page.waitForTimeout(4200);

  // Title and Hero check
  const title = await page.title();
  console.log(`Page Title: "${title}"`);

  const heroH1 = await page.textContent('#heroH1');
  console.log(`Hero Headline: "${heroH1?.replace(/\s+/g, ' ').trim()}"`);

  // Screenshot 1: Hero view
  await page.screenshot({ path: 'portfolio-hero-playwright.png' });
  console.log('✓ Captured screenshot: portfolio-hero-playwright.png');

  // Test Interaction 1: Open Project Modal (Boiyet's Gym)
  console.log('Testing Interaction: Opening Boiyet\'s Gym Project Modal...');
  const gymBtn = page.locator('#ticket-gym .btn-card-action').first();
  if (await gymBtn.count() > 0) {
    await gymBtn.click();
    await page.waitForTimeout(500);
    const modalVisible = await page.isVisible('.modal-overlay');
    console.log(`Project Modal (.modal-overlay) opened: ${modalVisible}`);
    await page.screenshot({ path: 'portfolio-modal-playwright.png' });
    console.log('✓ Captured screenshot: portfolio-modal-playwright.png');

    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    console.log('✓ Closed modal with Escape key');
  }

  // Test Interaction 2: Command Palette (Ctrl+K)
  console.log('Testing Interaction: Triggering Command Palette (Ctrl+K)...');
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(400);
  const cmdPaletteVisible = await page.isVisible('.cmd-palette-card');
  console.log(`Command Palette visible: ${cmdPaletteVisible}`);

  if (cmdPaletteVisible) {
    await page.fill('.cmd-palette-input', 'theme');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'portfolio-cmd-palette-playwright.png' });
    console.log('✓ Captured screenshot: portfolio-cmd-palette-playwright.png');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // Test Interaction 3: Skills filtering
  console.log('Testing Interaction: Clicking Skill Filter "React"...');
  const reactSkill = page.locator('.skill-tags span:has-text("React")').first();
  if (await reactSkill.count() > 0) {
    await reactSkill.click();
    await page.waitForTimeout(400);
    const bannerVisible = await page.isVisible('#skillFilterBanner');
    console.log(`Skill Filter Banner visible: ${bannerVisible}`);
    await page.screenshot({ path: 'portfolio-skill-filtered-playwright.png' });
    console.log('✓ Captured screenshot: portfolio-skill-filtered-playwright.png');
  }

  await browser.close();
  console.log('--- Playwright inspection and interaction completed successfully ---');
}

explorePortfolio().catch((err) => {
  console.error('Playwright execution error:', err);
  process.exit(1);
});
