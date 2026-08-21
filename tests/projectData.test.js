import { describe, it, expect } from 'vitest';
import { projectDetails, timelineData, awardsData, beyondTilesData } from '../src/data/projectData.js';

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
    expect(gym.slides).toHaveLength(3);
  });

  it('verifies 3 curated honors and awards', () => {
    expect(awardsData).toHaveLength(3);
    const titles = awardsData.map(a => a.title);
    expect(titles).toContain('ThinkQuest Champion | Tagisan ng Talino');
    expect(titles).toContain('Java Fundamentals | 1st & 2nd Term');
    expect(titles).toContain('Alumni President | Batch 2025–2026');
  });

  it('verifies 5 Outside the IDE tiles with genre tags for gaming', () => {
    const tiles = Object.keys(beyondTilesData);
    expect(tiles).toHaveLength(5);
    expect(beyondTilesData.gaming.tags).toContain('Tactical Team Play');
    expect(beyondTilesData.gaming.tags).toContain('Sandbox Building');
  });
});
