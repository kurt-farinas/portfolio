import { chromium } from 'playwright';
import { preview } from 'vite';

async function main() {
  const server = await preview({ preview: { port: 4193 } });
  const serverUrl = 'http://localhost:4193/after-hours';
  console.log(`Preview server running on ${serverUrl}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(serverUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4500);

  // Scroll to snapshots section
  const deckSection = await page.$('.gear-category-section:nth-of-type(2)');
  if (deckSection) {
    await deckSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: 'C:/Users/Kurtong/.gemini/antigravity-ide/brain/1a0b358d-5235-4f13-8c7e-ed145940cba2/pure_deck_initial.png', fullPage: true });
  console.log('Pure deck initial screenshot saved.');

  // Click on top card to trigger card slide/shuffle
  const topCard = await page.$('.deck-photo-card.deck-stack-level-0');
  if (topCard) {
    await topCard.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'C:/Users/Kurtong/.gemini/antigravity-ide/brain/1a0b358d-5235-4f13-8c7e-ed145940cba2/pure_deck_after_click.png', fullPage: true });
    console.log('Pure deck after click saved.');
  }

  await browser.close();
  server.httpServer.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
