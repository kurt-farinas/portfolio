import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SkillsSection from '../src/components/sections/SkillsSection';

describe('read-only Stack rows', () => {
  let host, root;

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  });

  it('shows every technology as static text with no interactive controls', async () => {
    await act(async () => root.render(<SkillsSection />));

    expect(host.querySelector('h2').textContent).toBe('Stack');
    expect(host.textContent).not.toContain('View all');
    expect(host.querySelectorAll('.studio-skill-row')).toHaveLength(5);
    expect(host.querySelectorAll('#skills button, #skills a, #skills input')).toHaveLength(0);

    const expectedByCategory = {
      Frontend: ['React', 'TypeScript', 'JavaScript', 'Inertia.js', 'Tailwind CSS', 'HTML / CSS', 'Chart.js', 'Next.js'],
      Backend: ['Laravel', 'PHP', 'FastAPI', 'Python'],
      Data: ['MySQL', 'SQLite'],
      Languages: ['Java'],
      Tools: ['PHPUnit & Pest', 'Git / GitHub', 'Docker']
    };
    const renderedRows = [...host.querySelectorAll('.studio-skill-row')].map((row) => ({
      category: row.querySelector('.studio-skill-category').textContent,
      technologies: [...row.querySelectorAll('.studio-skill-name')].map((skill) => skill.textContent)
    }));

    expect(renderedRows).toEqual(Object.entries(expectedByCategory).map(([category, technologies]) => ({ category, technologies })));
  });
});
