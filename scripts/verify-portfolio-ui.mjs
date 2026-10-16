import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const base = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4174';
const output = process.env.PORTFOLIO_QA_OUTPUT || 'test-results/portfolio-ui';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];
const requestFailures = [];
const sceneRequests = [];
const previewWarnings = [];

async function settleImages(page) {
  for (const image of await page.locator('img').all()) {
    if (!await image.isVisible().catch(() => false)) continue;
    const intersectsViewport = await image.evaluate(img => {
      const rect = img.getBoundingClientRect();
      let clip = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
      for (let ancestor = img.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor);
        if (!['auto', 'scroll', 'hidden', 'clip'].some(value => [style.overflow, style.overflowX, style.overflowY].includes(value))) continue;
        const bounds = ancestor.getBoundingClientRect();
        clip = {
          left: Math.max(clip.left, bounds.left),
          top: Math.max(clip.top, bounds.top),
          right: Math.min(clip.right, bounds.right),
          bottom: Math.min(clip.bottom, bounds.bottom)
        };
      }
      return rect.width > 0 && rect.height > 0 && rect.right > clip.left && rect.left < clip.right && rect.bottom > clip.top && rect.top < clip.bottom;
    });
    if (!intersectsViewport) continue;
    await image.evaluate(img => img.complete ? null : new Promise(resolve => {
      const finish = () => { clearTimeout(timeout); resolve(); };
      const timeout = setTimeout(finish, 3000);
      img.addEventListener('load', finish, { once: true });
      img.addEventListener('error', finish, { once: true });
    }));
  }
}

async function scan(page, label) {
  // Window zoom-in animations scale targets briefly; measure the settled layout.
  await page.evaluate(() => Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {}))));
  const result = await page.evaluate(() => {
    const isVisible = element => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if (rect.width <= 0 || rect.height <= 0 || style.display === 'none' || style.visibility === 'hidden' || element.closest('[hidden],[inert]')) return false;
      if (rect.right <= 0 || rect.bottom <= 0 || rect.left >= innerWidth || rect.top >= innerHeight) return false;
      for (let ancestor = element.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
        const overflow = getComputedStyle(ancestor);
        if (!['auto', 'scroll', 'hidden', 'clip'].some(value => [overflow.overflow, overflow.overflowX, overflow.overflowY].includes(value))) continue;
        const clip = ancestor.getBoundingClientRect();
        if (rect.right <= clip.left || rect.left >= clip.right || rect.bottom <= clip.top || rect.top >= clip.bottom) return false;
      }
      const point = document.elementFromPoint(Math.max(0, Math.min(innerWidth - 1, rect.left + rect.width / 2)), Math.max(0, Math.min(innerHeight - 1, rect.top + rect.height / 2)));
      return !point || point === element || element.contains(point) || point.contains(element);
    };
    const controls = [...document.querySelectorAll('a,button,input,select,textarea,[role="button"],[role="option"],[tabindex]')].filter(isVisible);
    const undersized = controls.flatMap(element => {
      const rect = element.getBoundingClientRect();
      return rect.width < 43.99 || rect.height < 43.99
        ? [{ name: element.getAttribute('aria-label') || element.textContent.trim().slice(0, 48), width: Math.round(rect.width), height: Math.round(rect.height) }]
        : [];
    });
    const images = [...document.images].filter(isVisible).map(image => ({
      alt: image.alt,
      loaded: image.complete && image.naturalWidth > 0,
      dimensions: image.hasAttribute('width') && image.hasAttribute('height'),
      original: getComputedStyle(image).imageRendering !== 'pixelated' && getComputedStyle(image).filter === 'none'
    }));
    const effects = [...document.querySelectorAll('body *')].filter(isVisible).flatMap(element => {
      const style = getComputedStyle(element);
      const issues = [];
      if (style.boxShadow !== 'none') issues.push('shadow');
      if (style.backdropFilter !== 'none') issues.push('blur');
      if (style.backgroundImage.includes('gradient')) issues.push('gradient');
      if (style.transitionDuration.split(',').some(value => parseFloat(value) > 0.2)) issues.push('long transition');
      if (style.animationIterationCount === 'infinite') issues.push('automatic animation');
      return issues.length ? [element.className + ':' + issues.join(',')] : [];
    });
    return {
      overflow: document.documentElement.scrollWidth > innerWidth,
      undersized,
      images,
      effects,
      theme: document.documentElement.dataset.theme,
      view: document.querySelector('.immersive-portfolio-shell')?.dataset.view
    };
  });
  const focusFailures = [];
  await page.keyboard.press('Tab');
  for (const control of await page.locator('a,button,input,[tabindex]:not([tabindex="-1"])').all()) {
    if (!await control.isVisible().catch(() => false)) continue;
    const check = await control.evaluate(element => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height || element.closest('[inert]')) return null;
      element.focus({ preventScroll: true });
      const style = getComputedStyle(element);
      return {
        name: element.getAttribute('aria-label') || element.textContent.trim().slice(0, 48),
        // Mobile Kurt-OS chrome uses a 2px offset so outlines fit the compact title bar and toolbar.
        visible: element.matches(':focus-visible') && style.outlineStyle === 'solid' && style.outlineWidth === '3px' && (style.outlineOffset === '3px' || (window.matchMedia('(max-width: 1099px), (pointer: coarse)').matches && style.outlineOffset === '2px' && Boolean(element.closest('.desktop-workspace'))))
      };
    });
    if (check && !check.visible) focusFailures.push(check.name);
  }
  expect(result.overflow, label + ' horizontal overflow').toBe(false);
  expect(result.undersized, label + ' rendered targets under 44px').toEqual([]);
  expect(result.effects, label + ' visual effects').toEqual([]);
  expect(result.images.every(image => image.loaded && image.dimensions && image.original), label + ' images').toBe(true);
  expect(focusFailures, label + ' focus outlines').toEqual([]);
  return { ...result, focusFailures };
}

function monitorPage(page, width) {
  page.on('pageerror', error => errors.push(width + ' page error: ' + error.message));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const row = { width, message: message.text(), url: message.location().url };
    if (row.url.includes('/_vercel/')) previewWarnings.push(row);
    else errors.push(row);
  });
  page.on('requestfailed', request => {
    const row = { width, url: request.url(), error: request.failure()?.errorText };
    if (row.url.includes('/_vercel/') || (row.url.endsWith('/resume.pdf') && row.error === 'net::ERR_ABORTED')) previewWarnings.push(row);
    else requestFailures.push(row);
  });
  page.on('request', request => {
    if (request.url().includes('DeskScene')) sceneRequests.push({ width, url: request.url() });
  });
}

const schemes = (process.env.PORTFOLIO_QA_SCHEMES || 'dark,light').split(',');
const widths = (process.env.PORTFOLIO_QA_WIDTHS || '1440,375').split(',').map(Number);
let scanCount = 0;
try {
  for (const width of widths) {
    for (const scheme of schemes) {
      const mobile = width < 600;
      const context = await browser.newContext({
        viewport: { width, height: mobile ? 812 : 900 },
        colorScheme: scheme,
        isMobile: mobile,
        hasTouch: mobile,
        acceptDownloads: true
      });
      await context.addInitScript(theme => {
        localStorage.setItem('portfolio-theme', theme);
        sessionStorage.setItem('kurt-os-boot-seen', 'true');
        const original = window.requestAnimationFrame.bind(window);
        window.__portfolioRafCount = 0;
        window.requestAnimationFrame = callback => {
          window.__portfolioRafCount += 1;
          return original(callback);
        };
      }, scheme);
      const page = await context.newPage();
      monitorPage(page, width);
      await page.goto(base + '/', { waitUntil: 'networkidle' });
      await expect(page.locator('.immersive-portfolio-shell')).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);

      if (width >= 1100) {
        await page.waitForTimeout(1800);
        await page.screenshot({ path: path.join(output, width + '-' + scheme + '-desk.png'), fullPage: true });
        if (await page.getByRole('button', { name: 'Open desktop', exact: true }).count()) {
          await page.getByRole('button', { name: 'Open desktop', exact: true }).click();
          await page.locator('[data-testid="desktop-workspace"]').waitFor({ timeout: 20000 });
        }
        await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', 'about');
        await page.waitForTimeout(1800);
        await page.screenshot({ path: path.join(output, width + '-' + scheme + '-monitor.png'), fullPage: true });
      }

      await expect(page.locator('[data-testid="desktop-workspace"]')).toHaveCount(1);
      if (width < 1100) {
        const shortcuts = page.getByRole('navigation', { name: 'Workstation shortcuts' });
        await expect(shortcuts).toBeVisible();
        await page.screenshot({ path: path.join(output, width + '-' + scheme + '-workstation.png'), fullPage: true });
        for (const [label, appId] of [['Projects', 'projects'], ['Résumé', 'resume'], ['Contact', 'contact']]) {
          await shortcuts.getByRole('button', { name: label, exact: true }).focus();
          await page.keyboard.press('Enter');
          await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', appId);
          await page.getByRole('button', { name: 'Home: Open About app', exact: true }).click();
        }
      }
      await expect(page.getByRole('button', { name: 'Open application list' })).toBeVisible();
      await page.getByRole('button', { name: 'Open application list' }).click();
      await expect(page.locator('#desktop-launcher .desktop-icon')).toHaveCount(16);

      const apps = [
        ['about', 'About'],
        ['projects', 'Projects'],
        ['experience', 'Experience'],
        ['stack', 'Stack'],
        ['recognition', 'Recognition'],
        ['after-hours', 'After Hours'],
        ['gear', 'Gear & Collections'],
        ['resume', 'Résumé'],
        ['contact', 'Contact'],
        ['kurtordle', 'KurtOrdle'], ['bughunter', 'BugHunter 3D'], ['terminal', 'Terminal'], ['credits', 'Credits']
      ];
      for (const [appId, label] of apps) {
        if (mobile && !await page.locator('#desktop-launcher').evaluate(element => element.classList.contains('is-open'))) {
          await page.getByRole('button', { name: 'Open application list' }).click();
        }
        const shortcut = page.getByRole('button', { name: 'Open ' + label, exact: true });
        await shortcut.click();
        await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', appId);
        await settleImages(page);
        await scan(page, width + ' ' + scheme + ' app ' + appId);
        scanCount += 1;
      }
      await page.goto(base + '/#contact', { waitUntil: 'domcontentloaded' });
      expect(await page.locator('[data-testid="desktop-workspace"]').count()).toBe(1);
      await scan(page, width + ' ' + scheme + ' contact');
      scanCount += 1;
      await page.screenshot({ path: path.join(output, width + '-' + scheme + '-contact.png'), fullPage: true });

      const searchButton = page.getByRole('button', { name: 'Open app search' });
      await searchButton.click();
      await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible();
      await page.getByRole('combobox', { name: 'Search commands' }).fill('After Hours');
      await page.keyboard.press('Enter');
      await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', 'after-hours');

      await page.goto(base + '/projects', { waitUntil: 'networkidle' });
      await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', 'projects');
      const projectRows = page.locator('.desktop-window.is-active .studio-project-detail');
      await expect(projectRows).toHaveCount(6);
      expect(await projectRows.evaluateAll(rows => rows.map(row => row.id))).toEqual([
        'pmpc-pis', 'pmpc-workforce', 'pmpc-gen-mdse', 'hris', 'gym', 'job-hunt-ledger'
      ]);
      await expect(page.locator('#pmpc-pis')).toContainText('PUBLIC SITE');
      await expect(page.locator('#pmpc-workforce')).toContainText('SIGN-IN');
      await expect(page.locator('#pmpc-gen-mdse')).toContainText('PUBLIC LANDING');
      await expect(page.locator('#pmpc-workforce img')).toHaveAttribute('src', '/optimized/images/projects/pmpc-workforce.png.webp');
      await expect(page.locator('#pmpc-gen-mdse img')).toHaveAttribute('src', '/optimized/images/projects/pmpc-gen-mdse.jpg.webp');
      await expect(page.locator('#pmpc-pis').getByRole('link', { name: /Visit website/ })).toHaveCount(1);
      await expect(page.locator('#pmpc-workforce').getByRole('link', { name: /Visit website/ })).toHaveCount(0);
      await expect(page.locator('#pmpc-gen-mdse').getByRole('link', { name: /Visit website/ })).toHaveCount(0);
      await expect(page.locator('#hris')).toContainText('98/100');
      await expect(page.locator('#hris')).toContainText('342');
      await expect(page.locator('.project-quick-read')).toHaveCount(6);
      await expect(page.locator('.studio-project-detail-highlights')).toHaveCount(0);
      expect(await projectRows.first().evaluate(el => el.firstElementChild.tagName)).toBe('FIGURE');
      await page.locator('.desktop-window.is-active .studio-project-detail img').first().scrollIntoViewIfNeeded();
      await settleImages(page);
      const projectScan = await scan(page, width + ' ' + scheme + ' projects');
      scanCount += 1;
      await page.screenshot({ path: path.join(output, width + '-' + scheme + '-projects.png'), fullPage: true });
      expect(projectScan.images.length).toBeGreaterThan(0);

      const opener = page.locator('.desktop-window.is-active').getByRole('button', { name: 'View project: CS Form No. 6 Digitalization System', exact: true });
      await opener.click();
      await expect(page.locator('#projectModal')).toBeVisible();
      await expect(page.locator('#projectModal')).toContainText('CS Form No. 6');
      const screenshot = page.locator('.project-screenshot');
      await screenshot.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#screenshotModal')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('#screenshotModal')).toHaveCount(0);
      await expect(screenshot).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.locator('#projectModal')).toHaveCount(0);
      await expect(opener).toBeFocused();
      for (const title of ["PMPC People's Information System", 'CS Form No. 6 Digitalization System']) {
        const imageOpener = page.locator('.desktop-window.is-active').getByRole('button', { name: 'Open case study: ' + title, exact: true });
        await imageOpener.focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('#projectModal')).toContainText(title);
        await page.keyboard.press('Escape');
        await expect(page.locator('#projectModal')).toHaveCount(0);
        await expect(imageOpener).toBeFocused();
      }
      await expect(page.locator('.desktop-window.is-active .studio-project-preview-open')).toHaveCount(6);
      const buildNotes = page.locator('.portfolio-engineering-details');
      await buildNotes.locator('summary').focus();
      await page.keyboard.press('Enter');
      await expect(buildNotes).toHaveAttribute('open', '');
      await expect(buildNotes).toContainText('Scene raycasts skip desktop events');
      const focusOutline = await buildNotes.locator('summary').evaluate(el => getComputedStyle(el).outlineWidth);
      expect(focusOutline).toBe('3px');
      await scan(page, width + ' ' + scheme + ' portfolio build notes');
      scanCount += 1;
      await page.screenshot({ path: path.join(output, width + '-' + scheme + '-build-notes.png'), fullPage: true });

      await page.goto(base + '/after-hours', { waitUntil: 'networkidle' });
      await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', 'after-hours');
      await expect(page.locator('.photo-deck-stack')).toHaveCount(1);
      const photoStack = page.locator('.photo-deck-stack');
      const firstPhoto = await photoStack.locator('.deck-stack-level-0 img').getAttribute('src');
      await photoStack.focus();
      await page.keyboard.press('ArrowRight');
      await expect(photoStack.locator('.deck-stack-level-0 img')).not.toHaveAttribute('src', firstPhoto);
      await photoStack.locator('.deck-stack-level-0').dblclick();
      await expect(page.locator('#screenshotModal')).toBeVisible();
      await page.keyboard.press('Escape');

      for (const route of ['/gear', '/downtime', '/outside-the-ide']) {
        await page.goto(base + route, { waitUntil: 'networkidle' });
        await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', 'gear');
        await expect(page.locator('.desktop-window.is-active h1')).toContainText('Gear & Collections');
        await expect(page.locator('.desktop-window.is-active .gear-card')).toHaveCount(11);
        const productLinks = page.locator('.desktop-window.is-active .gear-title-link');
        expect(await productLinks.evaluateAll(links => links.every(link =>
          link.target === '_blank' && link.rel.includes('noopener') && link.rel.includes('noreferrer') && link.href.startsWith('https://')
        ))).toBe(true);
        await settleImages(page);
        await scan(page, width + ' ' + scheme + ' ' + route);
        scanCount += 1;
      }

      await page.goto(base + '/#timeline', { waitUntil: 'networkidle' });
      await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', 'experience');
      await expect(page.locator('[data-app-scroll="experience"]')).toContainText('98/100');
      await expect(page.locator('[data-app-scroll="experience"]')).toContainText('342');
      await expect(page.locator('[data-app-scroll="experience"]')).toContainText('SEP 16, 2026');

      await page.goto(base + '/#skills', { waitUntil: 'networkidle' });
      await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', 'stack');
      await expect(page.locator('#skills')).toContainText('React');
      await expect(page.locator('#skills')).toContainText('Laravel');

      await page.goto(base + '/#awards', { waitUntil: 'networkidle' });
      await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', 'recognition');
      await expect(page.locator('#awards')).toBeVisible();

      await page.goto(base + '/projects#job-hunt-ledger', { waitUntil: 'networkidle' });
      await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', 'projects');
      await expect(page.locator('#job-hunt-ledger')).toBeVisible();
      expect(await page.locator('[data-app-scroll="projects"]').evaluate(element => element.scrollTop)).toBeGreaterThan(0);

      await page.goto(base + '/#resume', { waitUntil: 'networkidle' });
      await expect(page.locator('.desktop-window.is-active')).toHaveAttribute('data-app-id', 'resume');
      await expect(page.locator('.desktop-window.is-active iframe')).toHaveAttribute('src', '/resume.pdf#toolbar=1&navpanes=0');
      await expect(page.locator('.desktop-window.is-active a[href="/resume.pdf"][target="_blank"]')).toBeVisible();
      const pdfResponse = await page.request.get(base + '/resume.pdf');
      expect(pdfResponse.status()).toBe(200);
      expect(pdfResponse.headers()['content-type']).toContain('application/pdf');
      await page.getByRole('button', { name: 'Open accessible résumé preview' }).click();
      await expect(page.locator('#resumeModal')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('#resumeModal')).toHaveCount(0);

      await page.goto(base + '/', { waitUntil: 'networkidle' });
      const lightSwitch = page.getByRole('button', { name: 'Switch to ' + (scheme === 'dark' ? 'light' : 'dark') + ' theme' }).first();
      await lightSwitch.click();
      const nextScheme = scheme === 'dark' ? 'light' : 'dark';
      await expect(page.locator('html')).toHaveAttribute('data-theme', nextScheme);
      expect(await page.evaluate(() => localStorage.getItem('portfolio-theme'))).toBe(nextScheme);
      await scan(page, width + ' ' + scheme + ' theme change');
      scanCount += 1;

      if (width < 1100) {
        expect(sceneRequests.filter(item => item.width === width)).toEqual([]);
      }

      if (width >= 1100 && sceneRequests.some(item => item.width === width)) {
        await page.goto(base + '/', { waitUntil: 'networkidle' });
        await page.getByRole('button', { name: 'Open desktop', exact: true }).click();
        await page.locator('[data-testid="desktop-workspace"]').waitFor({ timeout: 20000 });
        await page.waitForTimeout(1800);
        // Camera damping finishes naturally; wait for actual idle rather than
        // assuming that a fixed wall-clock delay means the last frame rendered.
        await expect.poll(async () => {
          const count = await page.evaluate(() => window.__portfolioRafCount);
          await page.waitForTimeout(300);
          return await page.evaluate(() => window.__portfolioRafCount) - count;
        }, { timeout: 12000 }).toBe(0);
        const before = await page.evaluate(() => window.__portfolioRafCount);
        await page.waitForTimeout(1200);
        const after = await page.evaluate(() => window.__portfolioRafCount);
        expect(after - before, '3D canvas should sleep while idle').toBeLessThanOrEqual(1);
      }

      await context.close();
    }
  }

  const coarseContext = await browser.newContext({ viewport: { width: 1280, height: 800 }, hasTouch: true });
  await coarseContext.addInitScript(() => { localStorage.setItem('portfolio-theme', 'dark'); sessionStorage.setItem('kurt-os-boot-seen', 'true'); });
  const coarsePage = await coarseContext.newPage();
  monitorPage(coarsePage, 'coarse-1280');
  await coarsePage.goto(base + '/', { waitUntil: 'networkidle' });
  await expect(coarsePage.locator('.desktop-workspace')).toBeVisible();
  await expect(coarsePage.locator('.desk-canvas')).toHaveCount(0);
  expect(sceneRequests.filter(item => item.width === 'coarse-1280')).toEqual([]);
  await coarseContext.close();

  if (errors.length || requestFailures.length) {
    throw new Error('Preview errors: ' + JSON.stringify({ errors, requestFailures, previewWarnings }));
  }
  console.log('Portfolio desktop verified with ' + scanCount + ' layout/accessibility scans. Routes, apps, modal priority, gallery, theme, résumé, and 2D fallback passed.');
  console.log('3D scene requests: ' + sceneRequests.length + '; narrow/coarse sessions made none. Results saved under ' + output + '.');
} finally {
  await browser.close();
}
