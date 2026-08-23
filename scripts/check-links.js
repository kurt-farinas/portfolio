import { chromium } from '@playwright/test';

async function testExternalLinks() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Test Gym Vercel app
  console.log('Testing gym demo...');
  try {
    const res = await page.goto('https://gym-management-systemv2.vercel.app/', { waitUntil: 'load', timeout: 15000 });
    console.log('Gym Demo Status:', res?.status(), 'Title:', await page.title());
  } catch (e) {
    console.log('Gym Demo Error:', e.message);
  }

  // Test GitHub
  console.log('Testing GitHub repo...');
  try {
    const res = await page.goto('https://github.com/kurt-farinas/gym-management-systemv2', { waitUntil: 'load', timeout: 15000 });
    console.log('Gym Repo Status:', res?.status(), 'Title:', await page.title());
  } catch (e) {
    console.log('Gym Repo Error:', e.message);
  }

  // Test LinkedIn
  console.log('Testing LinkedIn URL...');
  try {
    const res = await page.goto('https://www.linkedin.com/in/kurt-vincent-fari%C3%B1as-315ab1367', { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('LinkedIn Status:', res?.status(), 'Title:', await page.title());
  } catch (e) {
    console.log('LinkedIn Error:', e.message);
  }

  await browser.close();
}

testExternalLinks().catch(console.error);
