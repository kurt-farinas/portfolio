import { describe, it, expect } from 'vitest';
import { projectDetails, timelineData, awardsData, beyondTilesData, gearCatalogData, snapshotsDeckData } from '../src/data/projectData.js';

describe('React Project Data Integrity', () => {
  it('contains valid definitions for HRIS and Gym Rebuild projects', () => {
    const projects = Object.keys(projectDetails);
    expect(projects).toContain('hris');
    expect(projects).toContain('gym');
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

  it('verifies 3 narrative career and education timeline milestones', () => {
    expect(timelineData).toHaveLength(3);
    const titles = timelineData.map(t => t.title);
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

  it('verifies beyond tiles data', () => {
    const tiles = Object.keys(beyondTilesData);
    expect(tiles).toHaveLength(4);
    expect(beyondTilesData.gaming.tags).toContain('Tactical Team Play');
    expect(beyondTilesData.gaming.tags).toContain('Sandbox Building');
  });

  it('verifies gearCatalogData definitions and section mapping', () => {
    expect(gearCatalogData.length).toBe(12);
    const ids = gearCatalogData.map((i) => i.id);
    expect(ids).toContain('mchose-ace60');
    expect(ids).toContain('attack-shark-x6');
    expect(ids).toContain('koorui-24e3');
    expect(ids).toContain('salnotes-zero');
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
    expect(keyboard.images.length).toBeGreaterThanOrEqual(2);
    expect(keyboard.images[0].src).toBe('/images/outside/mchose-ace60.jpg');

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
    expect(snapshotsDeckData.length).toBeGreaterThanOrEqual(4);
    const titles = snapshotsDeckData.map((s) => s.title);
    expect(titles).toContain('Barbell & Progressive Training');
    expect(titles).toContain('Lifting Gear & Workout Log');
  });
});
