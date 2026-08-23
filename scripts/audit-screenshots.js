import { chromium } from 'playwright';
import { preview } from 'vite';

const OUT = 'C:/Users/Kurtong/.gemini/antigravity-ide/brain/1a0b358d-5235-4f13-8c7e-ed145940cba2';

async function main() {
  const server = await preview({ preview: { port: 4195 } });
  const browser = await chromium.launch({ headless: true });

  // Desktop viewport
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4195/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500); // preloader

  // 1. Hero
  await page.screenshot({ path: `${OUT}/audit_hero.png`, fullPage: false });

  // 2. Full page screenshot
  await page.screenshot({ path: `${OUT}/audit_fullpage.png`, fullPage: true });

  // 3. Scroll to About
  await page.evaluate(() => document.getElementById('about')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/audit_about.png` });

  // 4. Scroll to Projects
  await page.evaluate(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/audit_projects.png` });

  // 5. Scroll to Timeline
  await page.evaluate(() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/audit_timeline.png` });

  // 6. Scroll to Skills
  await page.evaluate(() => document.getElementById('skills')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/audit_skills.png` });

  // 7. Scroll to Awards
  await page.evaluate(() => document.getElementById('awards')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/audit_awards.png` });

  // 8. Scroll to Contact
  await page.evaluate(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/audit_contact.png` });

  // 9. Light mode
  await page.evaluate(() => document.getElementById('themeToggleBtn')?.click());
  await page.waitForTimeout(300);
  await page.evaluate(() => document.getElementById('about')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/audit_light_about.png` });
  await page.evaluate(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/audit_light_projects.png` });

  // 10. Mobile (dark mode)
  await page.evaluate(() => document.getElementById('themeToggleBtn')?.click());
  await page.waitForTimeout(200);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/audit_mobile_hero.png` });
  await page.evaluate(() => document.getElementById('about')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/audit_mobile_about.png` });
  await page.evaluate(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/audit_mobile_projects.png` });
  await page.evaluate(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/audit_mobile_contact.png` });

  // 11. After Hours page (desktop)
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4195/after-hours', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/audit_afterhours.png` });

  console.log('All audit screenshots captured.');
  await browser.close();
  await server.httpServer.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
