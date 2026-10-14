import { chromium } from 'playwright';
import { preview } from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

async function main() {
  const server = await preview({ preview: { port: 4193 } });
  const serverUrl = 'http://localhost:4193/after-hours';
  console.log(`Preview server running on ${serverUrl}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const outputDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.git/portfolio-redesign/ui');
  await fs.mkdir(outputDir, { recursive: true });

  try {
    await page.goto(serverUrl, { waitUntil: 'networkidle' });
    const stack = page.locator('.photo-deck-stack');
    await stack.waitFor({ state: 'visible' });
    if (await stack.locator('.deck-photo-card').count() !== 3) throw new Error('Expected three layered After Hours photo cards.');
    if (await page.getByText('Swipe, drag, or use the arrow keys to explore the photo stack.').count()) {
      throw new Error('The removed photo stack instructions are still visible.');
    }

    await page.screenshot({ path: path.join(outputDir, 'after-hours-photo-stack.png'), fullPage: true });
    await page.locator('.deck-stack-level-0').click();
    await page.screenshot({ path: path.join(outputDir, 'after-hours-photo-stack-next.png'), fullPage: true });
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
