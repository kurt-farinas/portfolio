import { chromium } from '@playwright/test';
import http from 'http';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function verifyTouchAndDomain() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();

  console.log('Navigating to preview build on 375px mobile viewport...');
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);

  // 1. Measure all 5 elements
  const touchTargets = await page.evaluate(() => {
    const getDims = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        selector,
        width: Math.round(rect.width * 10) / 10,
        height: Math.round(rect.height * 10) / 10,
        isGe44x44: rect.width >= 44 && rect.height >= 44
      };
    };

    return {
      heroSocialGithub: getDims('.hero-social-pill a[aria-label="GitHub Profile"]'),
      heroSocialEmail: getDims('.hero-social-pill button[aria-label="Email Me"]'),
      mobileHamburger: getDims('.hamburger'),
      navHireMe: getDims('.btn-hire-me'),
      skillFilterReact: getDims('.skill-tags span[role="button"]'),
      footerSocialGithub: getDims('.footer-simple-links a[aria-label="GitHub Profile"]'),
      footerBackToTop: getDims('.footer-simple-links button[aria-label="Back to Top"]')
    };
  });

  console.log('--- TOUCH TARGET MEASUREMENTS (375px VIEWPORT) ---');
  console.log(JSON.stringify(touchTargets, null, 2));

  // 2. Fetch robots.txt and sitemap.xml from preview build
  console.log('\n--- FETCHING ROBOTS.TXT & SITEMAP.XML ---');
  const robots = await fetchUrl('http://localhost:4173/robots.txt');
  const sitemap = await fetchUrl('http://localhost:4173/sitemap.xml');

  console.log('robots.txt status:', robots.status);
  console.log('robots.txt content:\n', robots.data.trim());

  console.log('\nsitemap.xml status:', sitemap.status);
  console.log('sitemap.xml content:\n', sitemap.data.trim());

  await browser.close();
}

verifyTouchAndDomain().catch(console.error);
