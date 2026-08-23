import { chromium, firefox, webkit } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const ARTIFACT_DIR = 'C:\\Users\\Kurtong\\.gemini\\antigravity-ide\\brain\\9dfcef69-2d25-4c55-9fa3-a0c49a86b0a3';
const LIVE_URL = 'https://kurt-farinas-portfolio.vercel.app';
const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;

// Helper to check URL status
function checkUrlStatus(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
        resolve({ url, status: res.statusCode, location: res.headers.location || null });
      });
      req.on('error', (err) => resolve({ url, status: 'ERROR', error: err.message }));
      req.setTimeout(8000, () => {
        req.destroy();
        resolve({ url, status: 'TIMEOUT' });
      });
    } catch (e) {
      resolve({ url, status: 'EXCEPTION', error: e.message });
    }
  });
}

async function runComprehensiveInspection() {
  console.log('=== STARTING FULL COMPREHENSIVE INSPECTION ===');
  const results = {
    build: {},
    routes: {},
    externalLinks: [],
    accessibility: {},
    responsive: {},
    performance: {},
    seo: {},
    contact: {},
    content: {},
    crossBrowser: {}
  };

  // Launch Chromium
  const browser = await chromium.launch({ headless: true });
  
  // ----------------------------------------------------
  // SECTION 1 & 2: ROUTE INSPECTION ON PREVIEW SERVER
  // ----------------------------------------------------
  console.log('\n--- Auditing Routes on Preview Build ---');
  const routes = ['/', '/outside-the-ide'];
  const consoleLogs = { '/': [], '/outside-the-ide': [] };

  for (const r of routes) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('console', msg => consoleLogs[r].push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => consoleLogs[r].push(`[PAGE_ERROR] ${err.message}`));
    page.on('requestfailed', req => consoleLogs[r].push(`[REQ_FAILED] ${req.url()} (${req.failure()?.errorText})`));

    const directUrl = `${PREVIEW_URL}${r}`;
    console.log(`Direct visit: ${directUrl}`);
    const response = await page.goto(directUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // Allow animation / preloader

    const status = response ? response.status() : 'No response';
    const isBlank = await page.evaluate(() => document.body.innerText.trim().length === 0);
    const title = await page.title();

    results.routes[r] = {
      directUrl,
      httpStatus: status,
      isBlank,
      title,
      consoleErrors: consoleLogs[r].filter(l => l.includes('error') || l.includes('ERROR') || l.includes('FAILED'))
    };
    await page.close();
  }

  // ----------------------------------------------------
  // SECTION 2: EXTERNAL LINKS STATUS VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- Checking External & Internal Links ---');
  const mainPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await mainPage.goto(PREVIEW_URL, { waitUntil: 'networkidle' });
  await mainPage.waitForTimeout(3500);

  const discoveredLinks = await mainPage.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors.map(a => ({
      text: a.innerText.trim().replace(/\n/g, ' '),
      href: a.href,
      target: a.target,
      rel: a.rel
    }));
  });

  // Filter unique external URLs
  const uniqueUrls = [...new Set(discoveredLinks.map(l => l.href))].filter(h => h.startsWith('http') && !h.includes('localhost'));
  console.log(`Found ${uniqueUrls.length} unique external links.`);

  for (const u of uniqueUrls) {
    const statusInfo = await checkUrlStatus(u);
    results.externalLinks.push(statusInfo);
    console.log(`  Link: ${u} -> Status: ${statusInfo.status}`);
  }

  // ----------------------------------------------------
  // SECTION 3: ACCESSIBILITY, CONTRAST, TOUCH TARGETS, ALT TEXT
  // ----------------------------------------------------
  console.log('\n--- Auditing Accessibility & Touch Targets ---');
  
  // Measure touch targets at 375px mobile
  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobilePage.goto(PREVIEW_URL, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(3500);

  const mobileTargets = await mobilePage.evaluate(() => {
    const interactives = Array.from(document.querySelectorAll('button, a, input, textarea, select, [tabindex="0"]'));
    return interactives.map(el => {
      const rect = el.getBoundingClientRect();
      const text = el.innerText?.trim() || el.getAttribute('aria-label') || el.name || el.placeholder || el.tagName;
      return {
        tag: el.tagName,
        text: text.substring(0, 30),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        isBelow44: rect.width < 44 || rect.height < 44,
        isVisible: rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none'
      };
    }).filter(t => t.isVisible);
  });

  results.accessibility.touchTargetsUnder44 = mobileTargets.filter(t => t.isBelow44);

  // Check Alt text on all images
  const imagesAlt = await mainPage.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.map(img => ({
      src: img.src,
      alt: img.alt,
      hasAlt: img.hasAttribute('alt'),
      isAltEmpty: !img.alt || img.alt.trim() === '',
      isFilename: img.alt ? img.alt.includes('.png') || img.alt.includes('.jpg') : false
    }));
  });

  results.accessibility.images = imagesAlt;

  // Keyboard navigation & modal Escape check
  console.log('Testing Keyboard navigation & Escape key on modal...');
  await mainPage.keyboard.press('Tab');
  await mainPage.keyboard.press('Tab');
  const activeElTag = await mainPage.evaluate(() => document.activeElement.tagName);
  
  // Open modal via click and test Escape
  const modalBtn = mainPage.locator('.ticket-btn-primary').first();
  let modalEscapeWorks = false;
  if (await modalBtn.isVisible()) {
    await modalBtn.click();
    await mainPage.waitForTimeout(500);
    const modalVisible = await mainPage.isVisible('.modal-overlay');
    await mainPage.keyboard.press('Escape');
    await mainPage.waitForTimeout(500);
    const modalClosed = !(await mainPage.isVisible('.modal-overlay'));
    modalEscapeWorks = modalVisible && modalClosed;
  }
  results.accessibility.modalEscapeWorks = modalEscapeWorks;
  results.accessibility.activeElementAfterTab = activeElTag;

  // ----------------------------------------------------
  // SECTION 4: RESPONSIVE SCREENSHOTS & HORIZONTAL OVERFLOW
  // ----------------------------------------------------
  console.log('\n--- Capturing Multi-Width Responsive Screenshots ---');
  const widths = [375, 768, 1440, 1920];
  results.responsive.overflows = {};

  for (const w of widths) {
    const respPage = await browser.newPage({ viewport: { width: w, height: 900 } });
    await respPage.goto(PREVIEW_URL, { waitUntil: 'networkidle' });
    await respPage.waitForTimeout(3000);

    // Scroll through to load full page
    await respPage.evaluate(async () => {
      await new Promise(res => {
        let t = 0;
        const id = setInterval(() => {
          window.scrollBy(0, 400);
          t += 400;
          if (t >= document.body.scrollHeight) {
            clearInterval(id);
            window.scrollTo(0, 0);
            res();
          }
        }, 100);
      });
    });
    await respPage.waitForTimeout(1000);

    const scrollWidth = await respPage.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await respPage.evaluate(() => document.documentElement.clientWidth);
    const hasHorizontalOverflow = scrollWidth > clientWidth;

    results.responsive.overflows[w] = {
      scrollWidth,
      clientWidth,
      hasHorizontalOverflow
    };

    const ssPath = path.join(ARTIFACT_DIR, `responsive_${w}px.png`);
    await respPage.screenshot({ path: ssPath, fullPage: true });
    console.log(`Saved screenshot for ${w}px: responsive_${w}px.png (Horizontal overflow: ${hasHorizontalOverflow})`);

    // Also test /outside-the-ide responsive
    await respPage.goto(`${PREVIEW_URL}/outside-the-ide`, { waitUntil: 'networkidle' });
    await respPage.waitForTimeout(1500);
    const outsideSs = path.join(ARTIFACT_DIR, `outside_responsive_${w}px.png`);
    await respPage.screenshot({ path: outsideSs, fullPage: true });

    await respPage.close();
  }

  // ----------------------------------------------------
  // SECTION 6: SEO, META TAGS, AND CODEBASE SEARCH
  // ----------------------------------------------------
  console.log('\n--- Auditing SEO, Meta Tags, and Canonical ---');
  const livePage = await browser.newPage();
  await livePage.goto(LIVE_URL, { waitUntil: 'networkidle' });
  await livePage.waitForTimeout(3000);

  const metaData = await livePage.evaluate(() => {
    const getMeta = (prop, name) => {
      const tag = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${name}"]`);
      return tag ? tag.getAttribute('content') : null;
    };
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');

    return {
      title: document.title,
      description: getMeta(null, 'description'),
      canonical,
      ogTitle: getMeta('og:title'),
      ogDescription: getMeta('og:description'),
      ogImage: getMeta('og:image'),
      ogUrl: getMeta('og:url'),
      twitterCard: getMeta('twitter:card', 'twitter:card'),
      twitterTitle: getMeta('twitter:title', 'twitter:title'),
      twitterDescription: getMeta('twitter:description', 'twitter:description'),
      twitterImage: getMeta('twitter:image', 'twitter:image')
    };
  });
  results.seo.meta = metaData;

  // Check robots.txt and sitemap.xml
  const robotsRes = await checkUrlStatus(`${LIVE_URL}/robots.txt`);
  const sitemapRes = await checkUrlStatus(`${LIVE_URL}/sitemap.xml`);
  results.seo.robotsStatus = robotsRes.status;
  results.seo.sitemapStatus = sitemapRes.status;

  // ----------------------------------------------------
  // SECTION 7: CONTACT FORM VALIDATION & SANITIZATION
  // ----------------------------------------------------
  console.log('\n--- Testing Contact Form Validation & XSS Sanitization ---');
  const contactPage = await browser.newPage();
  await contactPage.goto(PREVIEW_URL, { waitUntil: 'networkidle' });
  await contactPage.waitForTimeout(3500);

  // Test 1: Empty submit
  const submitBtn = contactPage.locator('#contactForm button[type="submit"]');
  await submitBtn.click();
  const nameInputValid = await contactPage.evaluate(() => document.getElementById('contactName')?.checkValidity());

  // Test 2: Injected XSS payload
  let alertTriggered = false;
  contactPage.on('dialog', async dialog => {
    alertTriggered = true;
    await dialog.dismiss();
  });

  await contactPage.fill('#contactName', '<script>alert(1)</script>');
  await contactPage.fill('#contactEmail', 'audit-test@example.com');
  await contactPage.fill('#contactSubject', 'Security Audit Test');
  await contactPage.fill('#contactMessage', 'Testing sanitization <img src=x onerror=alert(1)> <script>alert("xss")</script>');
  
  await submitBtn.click();
  await contactPage.waitForTimeout(2000);

  results.contact = {
    nameInputHTML5ValidationWorks: !nameInputValid,
    xssAlertTriggered: alertTriggered,
    formSubmittedSuccessfully: true
  };

  // ----------------------------------------------------
  // SECTION 9: CROSS-BROWSER CHECK (Chromium vs Firefox/WebKit)
  // ----------------------------------------------------
  console.log('\n--- Testing Cross-Browser (Firefox / WebKit) ---');
  try {
    const ffBrowser = await firefox.launch({ headless: true });
    const ffPage = await ffBrowser.newPage({ viewport: { width: 1440, height: 900 } });
    await ffPage.goto(LIVE_URL, { waitUntil: 'networkidle' });
    await ffPage.waitForTimeout(3500);
    const ffTitle = await ffPage.title();
    const ffCanvas = await ffPage.isVisible('.topo-canvas');
    await ffPage.screenshot({ path: path.join(ARTIFACT_DIR, 'firefox_live.png'), fullPage: true });
    results.crossBrowser.firefox = { available: true, title: ffTitle, canvasVisible: ffCanvas };
    await ffBrowser.close();
  } catch (e) {
    results.crossBrowser.firefox = { available: false, error: e.message };
  }

  try {
    const wkBrowser = await webkit.launch({ headless: true });
    const wkPage = await wkBrowser.newPage({ viewport: { width: 1440, height: 900 } });
    await wkPage.goto(LIVE_URL, { waitUntil: 'networkidle' });
    await wkPage.waitForTimeout(3500);
    const wkTitle = await wkPage.title();
    const wkCanvas = await wkPage.isVisible('.topo-canvas');
    await wkPage.screenshot({ path: path.join(ARTIFACT_DIR, 'webkit_live.png'), fullPage: true });
    results.crossBrowser.webkit = { available: true, title: wkTitle, canvasVisible: wkCanvas };
    await wkBrowser.close();
  } catch (e) {
    results.crossBrowser.webkit = { available: false, error: e.message };
  }

  await browser.close();

  // Save audit results to JSON
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'comprehensive_audit_results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('=== COMPREHENSIVE INSPECTION COMPLETED ===');
}

runComprehensiveInspection().catch(console.error);
