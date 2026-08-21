import { describe, it, expect } from 'vitest';
import { projectDetails, workflowMessages } from '../src/js/projectData.js';

describe('Project Data Integrity', () => {
  it('contains valid definitions for HRIS and Gym projects', () => {
    // 1. Arrange & Act
    const projects = Object.keys(projectDetails);

    // 2. Assert
    expect(projects).toContain('hris');
    expect(projects).toContain('gym');
  });

  it('verifies CS Form No. 6 (HRIS) metadata and slides', () => {
    // 1. Arrange
    const hris = projectDetails.hris;

    // 2. Assert
    expect(hris.title).toBe('CS Form No. 6 Digitalization System');
    expect(hris.roleTag).toBe('Frontend Ownership');
    expect(hris.ticketId).toBe('DepEd OJT Project');
    expect(hris.highlights).toBeInstanceOf(Array);
    expect(hris.highlights.length).toBeGreaterThanOrEqual(3);
    expect(hris.stack).toContain('React');
    expect(hris.stack).toContain('Laravel');
    expect(hris.slides).toHaveLength(3);
    expect(hris.slides[0].src).toBe('hris-admin.png');
  });

  it('verifies Boiyet Gym project metadata and links', () => {
    // 1. Arrange
    const gym = projectDetails.gym;

    // 2. Assert
    expect(gym.title).toContain("Boiyet's");
    expect(gym.roleTag).toBe('Solo Full-Stack Developer');
    expect(gym.codeUrl).toContain('github.com');
    expect(gym.stack).toContain('PHP');
    expect(gym.stack).toContain('Chart.js');
    expect(gym.slides).toHaveLength(3);
    expect(gym.slides[0].src).toBe('gym-admin.png');
  });

  it('verifies workflow messages for interactive project modals', () => {
    // 1. Arrange & Act
    const hrisSteps = workflowMessages.hris;
    const gymSteps = workflowMessages.gym;

    // 2. Assert
    expect(hrisSteps.length).toBe(3);
    expect(gymSteps.length).toBe(4);
  });
});
