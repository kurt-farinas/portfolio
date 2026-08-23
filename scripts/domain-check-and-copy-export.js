import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import https from 'https';

function checkDomain(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({
        url,
        statusCode: res.statusCode,
        headers: res.headers,
        location: res.headers.location || null
      });
    }).on('error', (err) => {
      resolve({ url, error: err.message });
    });
  });
}

async function runTasks() {
  console.log('=== TASK 1: DOMAIN RESOLUTION CHECK ===');
  const noHyphenRes = await checkDomain('https://kurtfarinasportfolio.vercel.app/');
  console.log('No-hyphen domain (https://kurtfarinasportfolio.vercel.app/):', noHyphenRes);

  const hyphenRes = await checkDomain('https://kurt-farinas-portfolio.vercel.app/');
  console.log('Hyphen domain (https://kurt-farinas-portfolio.vercel.app/):', hyphenRes);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Try visiting no-hyphen in browser
  try {
    const res = await page.goto('https://kurtfarinasportfolio.vercel.app/', { waitUntil: 'domcontentloaded', timeout: 10000 });
    console.log('Browser no-hyphen status:', res?.status(), 'Title:', await page.title());
  } catch (e) {
    console.log('Browser no-hyphen load error:', e.message);
  }

  console.log('\n=== TASK 2: EXTRACT VISIBLE RENDERED COPY FROM PREVIEW BUILD ===');
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000); // Allow animations & mounting

  const homeCopy = await page.evaluate(() => {
    const getText = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.innerText.trim() : '';
    };

    const getList = (sel) => {
      return Array.from(document.querySelectorAll(sel)).map(e => e.innerText.trim());
    };

    return {
      nav: {
        logo: getText('.logo-text'),
        links: getList('.nav-links button, .nav-links a'),
        hireBtn: getText('.btn-hire-me')
      },
      hero: {
        headline1: getText('.hero-title .line-1'),
        headline2: getText('.hero-title .line-2'),
        subtitle: getText('.hero-subtitle'),
        socialPillAria: Array.from(document.querySelectorAll('.hero-social-pill a, .hero-social-pill button')).map(e => e.getAttribute('aria-label') || e.innerText.trim())
      },
      projects: {
        sectionTitle: getText('#projects .profile-title'),
        sectionSub: getText('#projects .profile-header-sub'),
        cards: Array.from(document.querySelectorAll('#projects .ticket')).map(card => ({
          stamp: card.querySelector('.ticket-stamp')?.innerText.trim() || '',
          title: card.querySelector('.ticket-title')?.innerText.trim() || '',
          roleTag: card.querySelector('.ticket-role-tag')?.innerText.trim() || '',
          desc: card.querySelector('.ticket-summary-lead')?.innerText.trim() || '',
          stack: Array.from(card.querySelectorAll('.ticket-tech-pills span')).map(s => s.innerText.trim()),
          actions: Array.from(card.querySelectorAll('.ticket-actions a, .ticket-actions button')).map(a => a.innerText.trim())
        }))
      },
      timeline: {
        sectionTitle: getText('#timeline .profile-title'),
        sectionSub: getText('#timeline .profile-header-sub'),
        items: Array.from(document.querySelectorAll('#timeline .timeline-item')).map(item => ({
          num: item.querySelector('.timeline-num')?.innerText.trim() || '',
          date: item.querySelector('.timeline-date')?.innerText.trim() || '',
          title: item.querySelector('.timeline-title')?.innerText.trim() || '',
          desc: item.querySelector('.timeline-desc')?.innerText.trim() || '',
          badge: item.querySelector('.timeline-badge')?.innerText.trim() || ''
        }))
      },
      skills: {
        sectionTitle: getText('#skills .profile-title'),
        sectionSub: getText('#skills .profile-header-sub'),
        legend: getList('#skills .skill-legend .prof-badge'),
        groups: Array.from(document.querySelectorAll('#skills .skill-group')).map(g => ({
          category: g.querySelector('h4')?.innerText.trim() || '',
          tags: Array.from(g.querySelectorAll('.skill-tags span')).map(t => t.innerText.trim())
        }))
      },
      about: {
        sectionTitle: getText('#about .profile-title'),
        sectionSub: getText('#about .profile-header-sub'),
        bio: getText('#about .about-text'),
        focusGrid: Array.from(document.querySelectorAll('#about .focus-cell')).map(c => ({
          num: c.querySelector('.focus-num')?.innerText.trim() || '',
          label: c.querySelector('.focus-label')?.innerText.trim() || '',
          desc: c.querySelector('.focus-desc')?.innerText.trim() || ''
        })),
        stackPills: getList('#about .about-tags .stack-pill')
      },
      awards: {
        sectionTitle: getText('#awards .profile-title'),
        sectionSub: getText('#awards .profile-header-sub'),
        cards: Array.from(document.querySelectorAll('#awards .award-card')).map(c => ({
          title: c.querySelector('.award-title')?.innerText.trim() || '',
          issuer: c.querySelector('.award-issuer')?.innerText.trim() || ''
        }))
      },
      beyondTeaser: {
        sectionTitle: getText('#beyond .profile-title'),
        sectionSub: getText('#beyond .profile-header-sub'),
        badge: getText('#beyond .beyond-badge'),
        category: getText('#beyond .beyond-category'),
        title: getText('#beyond .beyond-title'),
        desc: getText('#beyond .beyond-desc'),
        pills: getList('#beyond .beyond-pills .beyond-pill'),
        cta: getText('#beyond .beyond-cta')
      },
      contact: {
        title: getText('#contact .contact-hero-title'),
        labels: getList('#contact .form-group label'),
        placeholders: Array.from(document.querySelectorAll('#contact input, #contact textarea')).map(i => i.getAttribute('placeholder')),
        button: getText('#contact .btn-submit-hero')
      },
      footer: {
        logo: getText('.simple-footer .logo-text'),
        copy: getText('.simple-footer .footer-copy-text'),
        buttonsAria: Array.from(document.querySelectorAll('.simple-footer .footer-simple-links a, .simple-footer .footer-simple-links button')).map(e => e.getAttribute('aria-label') || e.innerText.trim())
      }
    };
  });

  // Extract Outside the IDE page
  await page.goto('http://localhost:4173/outside-the-ide', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const outsideCopy = await page.evaluate(() => {
    const getText = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.innerText.trim() : '';
    };

    return {
      backBtn: getText('.btn-back-home'),
      title: getText('.profile-title'),
      subtitle: getText('.profile-header-sub'),
      bentoTiles: Array.from(document.querySelectorAll('.beyond-bento-tile')).map(tile => ({
        tag: tile.querySelector('.beyond-tile-tag')?.innerText.trim() || '',
        num: tile.querySelector('.beyond-tile-num')?.innerText.trim() || '',
        title: tile.querySelector('.beyond-tile-title')?.innerText.trim() || '',
        desc: tile.querySelector('.beyond-tile-desc')?.innerText.trim() || '',
        specs: Array.from(tile.querySelectorAll('.beyond-tile-spec-row')).map(r => r.innerText.trim())
      }))
    };
  });

  await browser.close();

  // Format into markdown
  let md = `# Site Copy Export (Rendered On-Screen Text)

> **Export Date:** ${new Date().toISOString().split('T')[0]}  
> **Source:** Production Preview Build (\`npm run build && npm run preview\`)  
> **Note:** Verbatim text extracted directly from rendered DOM elements.

---

## 1. NAVIGATION BAR
- **Logo:** \`${homeCopy.nav.logo}\`
- **Navigation Links:** ${homeCopy.nav.links.join(' | ')}
- **CTA Button:** \`${homeCopy.nav.hireBtn}\`

---

## 2. HERO SECTION
### Headline Line 1:
${homeCopy.hero.headline1}

### Headline Line 2:
${homeCopy.hero.headline2}

### Subtitle:
${homeCopy.hero.subtitle}

### Social & Quick Actions (Accessible Labels):
${homeCopy.hero.socialPillAria.map(a => `- ${a}`).join('\n')}

---

## 3. FEATURED PROJECTS SECTION
### Section Header:
**Title:** ${homeCopy.projects.sectionTitle}  
**Subtitle:** ${homeCopy.projects.sectionSub}

### Project Cards:
`;

  homeCopy.projects.cards.forEach((c, idx) => {
    md += `
#### Project ${idx + 1}: ${c.title}
- **Badge / Stamp:** \`${c.stamp}\`
- **Role Tag:** ${c.roleTag}
- **Summary:** ${c.desc}
- **Tech Stack:** ${c.stack.join(', ')}
- **Actions / Buttons:** ${c.actions.join(' | ')}
`;
  });

  md += `
---

## 4. CAREER & EDUCATION TIMELINE
### Section Header:
**Title:** ${homeCopy.timeline.sectionTitle}  
**Subtitle:** ${homeCopy.timeline.sectionSub}

### Timeline Entries:
`;

  homeCopy.timeline.items.forEach((item) => {
    md += `
#### ${item.num}. ${item.title}
- **Date / Scope:** \`${item.date}\`
- **Description:** ${item.desc}
- **Badge:** \`${item.badge}\`
`;
  });

  md += `
---

## 5. TOOLS & TECHNOLOGIES (SKILLS)
### Section Header:
**Title:** ${homeCopy.skills.sectionTitle}  
**Subtitle:** ${homeCopy.skills.sectionSub}

### Proficiency Legend:
${homeCopy.skills.legend.join(' · ')}

### Skill Categories & Tags:
`;

  homeCopy.skills.groups.forEach((g) => {
    md += `
- **${g.category}:** ${g.tags.join(', ')}
`;
  });

  md += `
---

## 6. WHO I AM (ABOUT ME)
### Section Header:
**Title:** ${homeCopy.about.sectionTitle}  
**Subtitle:** ${homeCopy.about.sectionSub}

### Bio Statement:
${homeCopy.about.bio}

### Technical Focus Areas:
`;

  homeCopy.about.focusGrid.forEach((f) => {
    md += `
- **${f.num} · ${f.label}:** ${f.desc}
`;
  });

  md += `
### Primary Stack Tags:
${homeCopy.about.stackPills.join(' · ')}

---

## 7. HONORS & CERTIFICATIONS (AWARDS)
### Section Header:
**Title:** ${homeCopy.awards.sectionTitle}  
**Subtitle:** ${homeCopy.awards.sectionSub}

### Awards & Certifications:
`;

  homeCopy.awards.cards.forEach((a) => {
    md += `
- **${a.title}**  
  *${a.issuer}*
`;
  });

  md += `
---

## 8. OUTSIDE THE IDE (TEASER CARD ON HOME PAGE)
### Section Header:
**Title:** ${homeCopy.beyondTeaser.sectionTitle}  
**Subtitle:** ${homeCopy.beyondTeaser.sectionSub}

### Featured Preview:
- **Index & Eyebrow:** \`${homeCopy.beyondTeaser.badge}\`
- **Category:** \`${homeCopy.beyondTeaser.category}\`
- **Headline:** **${homeCopy.beyondTeaser.title}**
- **Description:** ${homeCopy.beyondTeaser.desc}
- **Quick Links:** ${homeCopy.beyondTeaser.pills.join(' | ')}
- **Call-to-Action:** \`${homeCopy.beyondTeaser.cta}\`

---

## 9. CONTACT SECTION
### Headline:
${homeCopy.contact.title.replace(/\n/g, ' ')}

### Form Fields:
- **Labels:** ${homeCopy.contact.labels.join(', ')}
- **Placeholders:** ${homeCopy.contact.placeholders.join(', ')}
- **Submit Button:** \`${homeCopy.contact.button}\`

---

## 10. FOOTER
- **Logo:** \`${homeCopy.footer.logo}\`
- **Copyright / Identity:** ${homeCopy.footer.copy}
- **Actions (Accessible Labels):** ${homeCopy.footer.buttonsAria.join(' · ')}

---

## 11. OUTSIDE THE IDE (FULL PAGE: \`/outside-the-ide\`)
- **Navigation:** \`${outsideCopy.backBtn}\`
- **Page Title:** **${outsideCopy.title}**
- **Page Subtitle:** ${outsideCopy.subtitle}

### Bento Tiles:
`;

  outsideCopy.bentoTiles.forEach((t) => {
    md += `
#### ${t.num} · ${t.title} [${t.tag}]
- **Description:** ${t.desc}
${t.specs.length > 0 ? `- **Details / Specs:**\n  - ` + t.specs.join('\n  - ') : ''}
`;
  });

  fs.writeFileSync('c:\\xampp\\htdocs\\portfolio\\site-copy-export.md', md);
  fs.writeFileSync('C:\\Users\\Kurtong\\.gemini\\antigravity-ide\\brain\\9dfcef69-2d25-4c55-9fa3-a0c49a86b0a3\\site-copy-export.md', md);
  console.log('Successfully saved site-copy-export.md!');
}

runTasks().catch(console.error);
