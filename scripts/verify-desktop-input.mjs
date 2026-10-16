import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const base=process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4176';
const browser=await chromium.launch();
const output='test-results/desktop-input';await fs.mkdir(output,{recursive:true});
try {
  for (const theme of ['dark','light']) {
    const context=await browser.newContext({viewport:{width:1440,height:900}});
    await context.addInitScript(theme=>{localStorage.setItem('portfolio-theme',theme);sessionStorage.setItem('kurt-os-boot-seen','true');},theme);
    const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error' && !message.location().url.includes('/_vercel/')) errors.push(message.text());});
    const pose=()=>page.locator('.desk-projected-html > div').evaluate(element=>element.style.transform);
    await page.goto(base+'/');await page.locator('.desk-projection-frame').waitFor();await page.getByRole('main').getByRole('button',{name:'Open desktop',exact:true}).click();
    await expect(page.locator('.desktop-workspace-screen')).toBeVisible();await page.waitForTimeout(1800);
    // Anchor scrolls (e.g. #about) must not scroll the 3D wrapper and throw the screen out of view.
    const icons=page.locator('.desktop-workspace-screen .desktop-icon');
    for (let index=0;index<await icons.count();index++) {
      const label=await icons.nth(index).getAttribute('aria-label');
      if (label==='Open Classic Portfolio') continue; // leaves the desktop for classic mode
      await icons.nth(index).click();await page.waitForTimeout(700);
      const state=await page.evaluate(()=>{const wrapper=document.querySelector('.desk-projected-html');const frame=document.querySelector('.desk-projection-frame').getBoundingClientRect();return {scroll:[wrapper.scrollTop,wrapper.scrollLeft],inView:frame.bottom>0&&frame.top<innerHeight};});
      expect(state,label+' must keep the projected screen in view').toEqual({scroll:[0,0],inView:true});
    }
    const initial=await pose();
    await page.getByRole('button',{name:'Open Projects',exact:true}).click();
    const scroller=page.locator('[data-app-scroll="projects"]');
    await scroller.hover();await page.mouse.wheel(0,450);
    await expect.poll(()=>scroller.evaluate(element=>element.scrollTop)).toBeGreaterThan(0);
    await page.waitForTimeout(400);expect(await pose(),'scroll must not move camera').toBe(initial);
    await scroller.getByRole('heading',{name:'Projects',exact:true,level:1}).click({clickCount:3});
    expect(await page.evaluate(()=>getSelection()?.toString()),'native text selection must remain usable').toContain('Projects');
    expect(await pose(),'text selection must not move camera').toBe(initial);
    await expect(page.locator('.desktop-window.is-active')).toHaveClass(/is-maximized/);
    await page.getByRole('button',{name:'Restore Projects window',exact:true}).click();
    const title=page.locator('.desktop-window.is-active .desktop-window-titlebar h2');
    const window=page.locator('.desktop-window.is-active');const before=await window.getAttribute('style');
    const box=await title.boundingBox();
    await page.mouse.move(box.x+45,box.y+20);await page.mouse.down();
    await page.mouse.move(1430,400,{steps:12});await page.waitForTimeout(200);
    expect(await pose(),'window drag outside screen must not move camera').toBe(initial);
    await page.mouse.up();expect(await window.getAttribute('style')).not.toBe(before);
    const handle=page.locator('.desktop-window.is-active .desktop-window-resize-handle');
    const handleBox=await handle.boundingBox();const oldSize=await window.getAttribute('style');
    await page.mouse.move(handleBox.x+20,handleBox.y+20);await page.mouse.down();
    await page.mouse.move(handleBox.x-90,handleBox.y-50,{steps:6});await page.mouse.up();
    expect(await window.getAttribute('style')).not.toBe(oldSize);
    expect(await pose(),'resizing must not move camera').toBe(initial);
    await page.mouse.move(8,350);await page.mouse.down();await page.mouse.move(15,420,{steps:8});await page.mouse.up();
    await expect.poll(pose,{message:'outside camera dragging must still work'}).not.toBe(initial);
    // Releasing a camera drag outside the screen lets hover zoom back out to the desk; hover the glass to return before expanding.
    const glass=await page.locator('.desk-projection-frame').boundingBox();
    await page.mouse.move(glass.x+glass.width/2,glass.y+glass.height/2,{steps:4});
    await expect(page.locator('.immersive-portfolio-shell')).toHaveAttribute('data-view','screen');
    await page.getByRole('button',{name:'Expand desktop',exact:true}).click();
    await expect(page.locator('.desktop-workspace-expanded')).toBeVisible();
    await page.getByRole('button',{name:'Back to monitor',exact:true}).click();await page.waitForTimeout(1800);
    await expect(page.locator('.desktop-workspace-screen')).toBeVisible({timeout:20000}).catch(async error=>{
      await page.screenshot({path:output+'/'+theme+'-failure.png'});
      console.log(JSON.stringify({errors,body:await page.locator('body').innerText(),html:await page.locator('body').evaluate(element=>element.innerHTML.slice(0,5000))}));throw error;
    });
    const restored=await pose();await scroller.hover();await page.mouse.wheel(0,-180);await page.waitForTimeout(400);
    expect(await pose(),'input guard must reattach after expansion').toBe(restored);
    await page.getByRole('button',{name:'Open Terminal',exact:true}).click();
    await page.getByRole('textbox',{name:'Portfolio command'}).fill('education');
    await page.getByRole('textbox',{name:'Portfolio command'}).press('Enter');
    await expect(page.locator('.retro-terminal-output')).toContainText('STI College San Jose');expect(await pose()).toBe(restored);
    await page.getByRole('button',{name:'Open app search'}).click();
    await expect(page.getByRole('dialog',{name:'Command palette'})).toBeVisible();await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Open BugHunter 3D',exact:true}).click();
    const arena=page.locator('.retro-bug-arena canvas');await arena.focus();await page.keyboard.press('Space');
    await expect(page.locator('[data-app-scroll="bughunter"]')).toContainText('Bugs squashed: 1');expect(await pose()).toBe(restored);
    await page.screenshot({path:output+'/'+theme+'-monitor.png'});
    await page.getByRole('button',{name:'Back to desk',exact:true}).click();await page.waitForTimeout(1800);
    await expect(page.getByRole('button',{name:'Open desktop',exact:true})).toBeVisible();expect(await pose()).not.toBe(restored);
    expect(errors).toEqual([]);await context.close();
  }
  console.log('Desktop input verified in both themes: scrolling, escaped dragging, resizing, outside camera control, transitions, terminal, games, and modal access.');
} finally {await browser.close();}
