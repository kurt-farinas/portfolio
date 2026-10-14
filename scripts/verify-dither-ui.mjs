import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const base = process.env.DITHER_PREVIEW_URL || 'http://127.0.0.1:4173';
const output = process.env.DITHER_QA_OUTPUT || '.git/dither-baseline/ui';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const findings = [];
const errors = [];
const requestFailures = [];
const previewExceptions = [];
const routes = ['/', '/after-hours', '/downtime', '/outside-the-ide'];
const settleImages = async page => {
  for (const image of await page.locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(img => img.complete ? null : new Promise(resolve => { img.addEventListener('load', resolve, { once: true }); img.addEventListener('error', resolve, { once: true }); }));
  }
};
const scan = async (page, label) => {
  const result = await page.evaluate(() => {
    const visible = el => { const r=el.getBoundingClientRect(); return r.width>0 && r.height>0 && getComputedStyle(el).visibility!=='hidden'; };
    const controls = [...document.querySelectorAll('a, button, input, select, textarea, [role="button"], [role="option"], [tabindex]')].filter(visible);
    const undersized = controls.flatMap(el => {
      const r=el.getBoundingClientRect();
      return r.width<43.99 || r.height<43.99 ? [{tag:el.tagName, label:el.getAttribute('aria-label') || el.textContent.trim().slice(0,60),width:r.width,height:r.height}] : [];
    });
    const images = [...document.images].filter(visible).map(img=>({alt:img.alt,loaded:img.complete&&img.naturalWidth>0,dimensions:img.hasAttribute('width')&&img.hasAttribute('height'),pixelated:getComputedStyle(img).imageRendering==='pixelated'}));
    const badEffects = [...document.querySelectorAll('body *')].filter(visible).flatMap(el => {
      const s=getComputedStyle(el);
      const problems = [];
      if (Number(s.opacity)!==1) problems.push('opacity');
      if (s.boxShadow!=='none') problems.push('boxShadow');
      if (s.backdropFilter && s.backdropFilter!=='none') problems.push('backdropFilter');
      if (s.backgroundImage.includes('gradient')) problems.push('gradient');
      if (s.transitionDuration.split(',').some(v=>parseFloat(v)!==0)) problems.push('transition');
      if (s.animationName!=='none') problems.push('animation');
      return problems.length ? [el.className+':'+problems.join(',')] : [];
    });
    return {overflow:document.documentElement.scrollWidth>innerWidth,undersized,images,badEffects,theme:document.documentElement.dataset.theme};
  });
  const focusFailures = [];
  await page.keyboard.press('Tab');
  for (const item of await page.locator('a, button, input, [tabindex]:not([tabindex="-1"])').all()) {
    if (!await item.isVisible()) continue;
    const result = await item.evaluate(el => {
      el.focus(); const s=getComputedStyle(el);
      return {label:el.getAttribute('aria-label') || el.textContent.trim().slice(0,60),visible:el.matches(':focus-visible') && s.outlineStyle==='solid' && s.outlineWidth==='3px' && s.outlineOffset==='3px'};
    });
    if (!result.visible) focusFailures.push(result.label);
  }
  findings.push({label,...result,focusFailures});
  expect(result.overflow,label+' overflow').toBe(false);
  expect(result.undersized,label+' touch targets').toEqual([]);
  expect(result.badEffects,label+' effects').toEqual([]);
  expect(result.images.every(image=>image.loaded&&image.dimensions&&image.pixelated),label+' images').toBe(true);
  expect(focusFailures,label+' focus').toEqual([]);
};
try {
  for (const width of [1440,375]) for (const scheme of ['light','dark']) {
    const context = await browser.newContext({ viewport:{width,height:width===375?812:1000}, colorScheme:scheme });
    const page=await context.newPage();
    page.on('pageerror', error=>errors.push(error.message));
    page.on('console', message=>{
      if(message.type()!=='error') return;
      const record={message:message.text(),url:message.location().url};
      if(record.url?.endsWith('/_vercel/insights/script.js')) previewExceptions.push(record);
      else errors.push(record);
    });
    page.on('requestfailed', request=>{
      const record={url:request.url(),error:request.failure()?.errorText};
      if(record.url.endsWith('/_vercel/insights/script.js') || (record.url.endsWith('/resume.pdf') && record.error==='net::ERR_ABORTED')) previewExceptions.push(record);
      else requestFailures.push(record);
    });
    for (const route of routes) {
      await page.goto(base+route,{waitUntil:'networkidle'});
      await page.waitForTimeout(1000);
      await settleImages(page);
      await scan(page,width+' '+scheme+' '+route);
      await page.evaluate(()=>scrollTo(0,0));
      await page.screenshot({path:path.join(output,width+'-'+scheme+'-'+(route==='/'?'home':route.slice(1))+'.png'),fullPage:true});
    }
    await page.goto(base+'/',{waitUntil:'networkidle'});
    await settleImages(page);
    if(width===375) {
      await page.getByRole('button',{name:'Toggle navigation'}).click();
      await scan(page,width+' '+scheme+' mobile menu');
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button',{name:'Toggle navigation'})).toBeFocused();
    }
    for (const [index, count] of [[0,3],[1,4],[2,1]]) {
      const opener=page.getByRole('button',{name:'View case study'}).nth(index);
      await opener.click();
      await expect(page.locator('#projectModal')).toBeVisible();
      for(let slide=0;slide<count;slide++) {
        await settleImages(page);
        await scan(page,width+' '+scheme+' project '+index+' slide '+slide);
        if(count>1 && slide<count-1) await page.getByRole('button',{name:'Next slide',exact:true}).click();
      }
      const screenshot=page.locator('.project-screenshot');
      await screenshot.focus(); await page.keyboard.press('Enter');
      await expect(page.locator('#screenshotModal')).toBeVisible();
      await settleImages(page); await scan(page,width+' '+scheme+' project lightbox '+index);
      await page.keyboard.press('Escape');
      await expect(screenshot).toBeFocused();
      const last=page.locator('#projectModal a').last();
      if(await last.count()) { await last.focus(); await page.keyboard.press('Tab'); await expect(page.getByRole('button',{name:'Close project modal'})).toBeFocused(); }
      await page.keyboard.press('Escape'); await expect(opener).toBeFocused();
    }
    const resume=page.getByRole('button',{name:'Preview résumé',exact:true});
    await resume.click();
    await expect(page.locator('#resumeIframe')).toHaveAttribute('src','/resume.pdf#toolbar=1&navpanes=0');
    await expect(page.getByRole('link',{name:'Download PDF'})).toHaveAttribute('href','/resume.pdf');
    await scan(page,width+' '+scheme+' resume');
    await page.keyboard.press('Escape'); await expect(resume).toBeFocused();
    await page.keyboard.press('Control+k'); await expect(page.getByRole('combobox')).toBeVisible();
    await scan(page,width+' '+scheme+' commands');
    await page.getByRole('combobox').fill('Open: Boiyet'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
    await expect(page.locator('#projectModal')).toBeVisible(); await page.keyboard.press('Escape');
    await page.locator('button.studio-skill').filter({hasText:'React'}).first().click();
    await expect(page.locator('#skillFilterBanner')).toBeVisible();
    await expect(page.locator('.studio-project.is-matching')).toHaveCount(3);
    await page.getByRole('button',{name:'Reset Filter'}).click();
    await page.goto(base+'/after-hours',{waitUntil:'networkidle'}); await settleImages(page);
    const top=page.locator('.deck-stack-level-0 img');
    const initial=await top.getAttribute('alt');
    await page.locator('.photo-deck-wrapper').getByRole('button',{name:'Next photo',exact:true}).click();
    expect(await top.getAttribute('alt')).not.toBe(initial);
    await page.locator('.photo-deck-wrapper').focus(); await page.keyboard.press('ArrowLeft');
    const beforeDrag=await top.getAttribute('alt');
    await page.locator('.deck-stack-level-0').scrollIntoViewIfNeeded();
    const card=await page.locator('.deck-stack-level-0').boundingBox();
    await page.mouse.move(card.x+card.width/2,card.y+card.height/2);
    await page.mouse.down();
    await page.mouse.move(card.x+card.width/2+80,card.y+card.height/2,{steps:5});
    await page.mouse.up();
    expect(await top.getAttribute('alt')).not.toBe(beforeDrag);
    await page.getByRole('button',{name:'View photo',exact:true}).click();
    await expect(page.locator('#screenshotModal')).toBeVisible(); await settleImages(page); await scan(page,width+' '+scheme+' photo lightbox');
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'View MCHOSE Ace 60 Pro photo',exact:true}).click();
    await expect(page.locator('#screenshotModal')).toBeVisible(); await settleImages(page); await scan(page,width+' '+scheme+' gear lightbox');
    await page.keyboard.press('Escape');
    const keyboard=page.locator('.gear-card').filter({hasText:'MCHOSE Ace 60 Pro'});
    await keyboard.getByRole('button',{name:'Next photo',exact:true}).click();
    await expect(keyboard.locator('.gear-schematic-svg')).toBeVisible();
    await keyboard.getByRole('button',{name:'Previous photo',exact:true}).click();
    await expect(keyboard.locator('img')).toBeVisible();
    await context.close();
    console.log('Verified '+width+'px '+scheme+' routes and interactive overlays.');
  }
  const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:375,height:812}});
  const page=await reduced.newPage(); await page.goto(base+'/',{waitUntil:'networkidle'});
  expect(await page.locator('canvas').evaluate(canvas=>{const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data; return pixels.every(value=>value===0);})).toBe(true);
  await reduced.close();
  for (const route of ['/resume.pdf','/robots.txt','/sitemap.xml']) {
    const response=await fetch(base+route); expect(response.status).toBe(200);
    if(route==='/resume.pdf') expect(response.headers.get('content-type')).toContain('application/pdf');
  }
  expect(errors,'browser errors').toEqual([]);
  expect(requestFailures,'failed requests').toEqual([]);
  await fs.writeFile(path.join(output,'results.json'),JSON.stringify({findings,errors,requestFailures,previewExceptions},null,2));
  console.log('All '+findings.length+' UI scans passed; no unexpected browser errors or failed requests.');
  console.log('Recorded preview exceptions: existing Vercel insights endpoint is absent locally; PDF requests can be canceled when their viewer closes.');
} catch(error) {
  await fs.writeFile(path.join(output,'results.json'),JSON.stringify({findings,errors,requestFailures,previewExceptions,failure:error.message},null,2));
  throw error;
} finally { await browser.close(); }
