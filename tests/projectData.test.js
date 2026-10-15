import { describe, it, expect } from 'vitest';
import { projectDetails, timelineData, awardsData, gearCatalogData, snapshotsDeckData } from '../src/data/projectData.js';

describe('React Project Data Integrity', () => {
  it('contains valid definitions for HRIS and Gym Rebuild projects', () => {
    const projects = Object.keys(projectDetails);
    expect(projects).toContain('hris');
    expect(projects).toContain('gym');
  });

  it('keeps live site links off the PMPC WorkForce and General Merchandise projects', () => {
    expect(projectDetails.pmpcPis.websiteUrl).toBe('https://peoplesmpcoop.com/');
    expect(projectDetails.pmpcWorkforce).not.toHaveProperty('websiteUrl');
    expect(projectDetails.pmpcGenMdse).not.toHaveProperty('websiteUrl');
  });

  it('keeps PMPC screenshot captions factual and distinct', () => {
    expect(projectDetails.pmpcPis.previewCallout.label).toBe('PUBLIC SITE');
    expect(projectDetails.pmpcWorkforce.previewCallout.label).toBe('SIGN-IN');
    expect(projectDetails.pmpcWorkforce.previewCallout.note).toContain('empty credential fields');
    expect(projectDetails.pmpcWorkforce.slides[0].src).toBe('/images/projects/pmpc-workforce.png');
    expect(projectDetails.pmpcGenMdse.previewCallout.label).toBe('PUBLIC LANDING');
    expect(projectDetails.pmpcGenMdse.previewCallout.note).toContain('internal General Merchandise system');
    expect(projectDetails.pmpcGenMdse.slides.map(slide => slide.src)).toEqual([
      '/images/projects/pmpc-gen-mdse.jpg',
      '/images/projects/pmpc-gen-mdse-prototype.jpg'
    ]);
    expect(projectDetails.pmpcGenMdse.slides.map(slide => slide.tab)).toEqual(['Landing page', 'Local prototype']);
    expect(projectDetails.pmpcGenMdse.slides[1].label).toContain('not deployed');
  });

  it('verifies CS Form No. 6 (HRIS) metadata', () => {
    const hris = projectDetails.hris;
    expect(hris.title).toBe('CS Form No. 6 Digitalization System');
    expect(hris.roleTag).toBe('Frontend Ownership');
    expect(hris.highlights.length).toBeGreaterThanOrEqual(3);
    expect(hris.stack).toContain('React');
    expect(hris.stack).toContain('Inertia.js');
    expect(hris.slides).toHaveLength(3);
  });

  it('verifies Boiyet Gym project Laravel 12 & Pest Rebuild details', () => {
    const gym = projectDetails.gym;
    expect(gym.title).toContain("Boiyet's");
    expect(gym.roleTag).toBe('Solo Full-Stack Developer');
    expect(gym.stack).toContain('Laravel 12');
    expect(gym.stack).toContain('Inertia.js');
    expect(gym.stack).toContain('React');
    expect(gym.stack).toContain('Pest');
    expect(gym.badge).toContain('119 Passing Tests');
    expect(gym.slides).toHaveLength(4);
    expect(gym.slides[0].src).toBe('/boiyets-landing.png');
    expect(gym.slides[1].src).toBe('/gym-admin.png');
    expect(gym.slides[2].src).toBe('/gym-trainer.png');
    expect(gym.slides[3].src).toBe('/gym-client.png');
  });

  it('verifies 4 narrative career and education timeline milestones', () => {
    expect(timelineData).toHaveLength(4);
    const titles = timelineData.map(t => t.title);
    const currentRole = timelineData.find(t => t.id === 'pmpc-role');
    expect(currentRole.title).toBe("Junior Full-Stack Developer | People's Multi-Purpose Cooperative");
    expect(currentRole.date).toBe('SEP 16, 2026 – PRESENT');
    expect(currentRole.desc).toContain('People\'s Information System, WorkForce / DTR, and General Merchandise website');
    expect(currentRole.desc).toContain('note unreleased work');
    expect(timelineData.find(t => t.title === 'BS Computer Science | STI College San Jose').date).toBe('SEP 2022 – JUL 2026');
    expect(timelineData.find(t => t.title === 'Software Developer Intern (OJT) | DepEd San Jose').desc).toContain('Denver Ballesteros developed the Laravel backend');
    expect(timelineData.find(t => t.title === 'Software Developer Intern (OJT) | DepEd San Jose').desc).toContain('98/100 OJT rating');
    expect(timelineData.find(t => t.title === 'Gym Management System | Thesis Defense (Defended)').desc).toContain('Solo-built and defended');
    expect(titles).toContain('BS Computer Science | STI College San Jose');
    expect(titles).toContain('Software Developer Intern (OJT) | DepEd San Jose');
    expect(titles).toContain('Gym Management System | Thesis Defense (Defended)');
  });

  it('verifies 4 curated honors and certifications from resume', () => {
    expect(awardsData).toHaveLength(4);
    const titles = awardsData.map(a => a.title);
    expect(titles).toContain('ThinkQuest Champion | Tagisan ng Talino');
    expect(titles).toContain('DepEd SIPP OJT Certificate of Completion');
    expect(titles).toContain('Introduction to Cybersecurity');
    expect(titles).toContain('Java Fundamentals | Terms 1 & 2');
  });

  it('verifies gearCatalogData definitions and section mapping', () => {
    expect(gearCatalogData.length).toBe(13);
    const ids = gearCatalogData.map((i) => i.id);
    expect(ids).toContain('mchose-ace60');
    expect(ids).toContain('attack-shark-x6');
    expect(ids).toContain('koorui-24e3');
    expect(ids).toContain('salnotes-zero');
    expect(ids).toContain('fifine-k678');
    expect(ids).toContain('asus-tuf-a15');
    expect(ids).toContain('gym-kit');
    expect(ids).toContain('hawas-ice');
    expect(ids).toContain('afnan-sce');
    expect(ids).toContain('liquid-brun');
    expect(ids).toContain('jaguar-red');
    expect(ids).not.toContain('black-coffee');

    const keyboard = gearCatalogData.find((i) => i.id === 'mchose-ace60');
    expect(keyboard.specs).toContain('0.005mm RT');
    expect(keyboard.category).toBe('Keyboard');
    expect(keyboard.section).toBe('desk');
    expect(keyboard.sectionTitle).toBe('Desk Setup and Gear');
    expect(keyboard.images).toHaveLength(1);
    expect(keyboard.images[0].src).toBe('/images/outside/mchose-ace60.jpg');

    const microphone = gearCatalogData.find((i) => i.id === 'fifine-k678');
    expect(microphone.title).toBe('FIFINE K678');
    expect(microphone.images[0].src).toBe('/images/outside/fifine-k678.png');

    const laptop = gearCatalogData.find((i) => i.id === 'asus-tuf-a15');
    expect(laptop.title).toContain('ASUS TUF Gaming A15');
    expect(laptop.url).toContain('asus.com');

    const iphone = gearCatalogData.find((i) => i.id === 'iphone-11');
    expect(iphone.title).toBe('iPhone 11');
    expect(iphone.section).toBe('desk');
    expect(iphone.sectionTitle).toBe('Desk Setup and Gear');

    const gymItem = gearCatalogData.find((i) => i.id === 'gym-kit');
    expect(gymItem.sectionTitle).toBe('Snapshots');

    const hawas = gearCatalogData.find((i) => i.id === 'hawas-ice');
    expect(hawas.title).toBe('Rasasi Hawas Ice');
    expect(hawas.sectionTitle).toBe('Fragrance Collection');
    expect(hawas.url).toContain('shopee.ph');
  });

  it('verifies snapshotsDeckData for card deck shuffler', () => {
    expect(snapshotsDeckData).toHaveLength(12);
    expect(snapshotsDeckData.map((s) => s.src)).toEqual([
      '/images/outside/1.jpg',
      '/images/outside/2.jpg',
      '/images/outside/3.jpg',
      '/images/outside/4.jpg',
      '/images/outside/5.jpg',
      '/images/outside/6.jpg',
      '/images/outside/7.jpg',
      '/images/outside/8.jpg',
      '/images/outside/9.jpg',
      '/images/outside/10.jpg',
      '/images/outside/11.jpg',
      '/images/outside/12.jpg'
    ]);
  });
});
