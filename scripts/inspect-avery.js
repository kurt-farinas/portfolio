import { chromium } from '@playwright/test';
import path from 'path';

async function inspectAvery() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('https://averymacasa.vercel.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const outDir = 'C:\\Users\\Kurtong\\.gemini\\antigravity-ide\\brain\\9dfcef69-2d25-4c55-9fa3-a0c49a86b0a3';

  // Capture full page screenshot
  await page.screenshot({ path: path.join(outDir, 'avery_reference.png'), fullPage: true });

  // Extract layout and framing CSS styles
  const analysis = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section, main, div[class*="wrap"], div[class*="container"], div[class*="card"], div[class*="section"]'));
    return {
      bodyBg: window.getComputedStyle(document.body).backgroundColor,
      sections: sections.map(s => {
        const style = window.getComputedStyle(s);
        return {
          tag: s.tagName,
          id: s.id,
          className: s.className,
          border: style.border,
          borderTop: style.borderTop,
          borderBottom: style.borderBottom,
          borderRadius: style.borderRadius,
          background: style.backgroundColor,
          padding: style.padding,
          margin: style.margin,
          maxWidth: style.maxWidth,
          boxShadow: style.boxShadow
        };
      }).filter(s => s.className || s.id)
    };
  });

  console.log(JSON.stringify(analysis, null, 2));
  await browser.close();
}

inspectAvery().catch(console.error);
