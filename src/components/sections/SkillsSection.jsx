/* ========================================
   SKILLS SECTION  |  Selected Technology Stack
   ======================================== */

import React from 'react';
import { useModal } from '../../context/ModalContext';

const skills = [
  { name: 'React', filter: 'react' },
  { name: 'TypeScript', filter: 'typescript' },
  { name: 'JavaScript', filter: 'javascript' },
  { name: 'Inertia.js', filter: 'inertia' },
  { name: 'Tailwind CSS', filter: 'tailwind' },
  { name: 'Laravel', filter: 'laravel' },
  { name: 'PHP' },
  { name: 'MySQL', filter: 'mysql' },
  { name: 'FastAPI' },
  { name: 'Python' },
  { name: 'SQLite' },
  { name: 'PHPUnit & Pest', filter: 'pest' },
  { name: 'Git / GitHub' },
  { name: 'HTML / CSS' },
  { name: 'Chart.js' },
  { name: 'Linux / CLI' },
  { name: 'Java' },
  { name: 'Next.js' },
  { name: 'Docker' }
];

export default function SkillsSection() {
  const { activeSkillFilter, filterBySkill } = useModal();

  return (
    <section className="section skills-section" id="skills">
      <div className="wrap profile-wrap">
        <div className="section-title-block">
          <h2 className="profile-title">Tools &amp; Technologies</h2>
        </div>

        <div className="skills-minimal-list" aria-label="Technology stack">
          {skills.map((skill) => {
            const isActive = skill.filter && activeSkillFilter?.toLowerCase() === skill.filter;

            if (!skill.filter) {
              return <span key={skill.name} className="skill-chip skill-chip-static">{skill.name}</span>;
            }

            return (
              <button
                key={skill.name}
                type="button"
                className={`skill-chip ${isActive ? 'active-skill-pill' : ''}`}
                onClick={() => filterBySkill(skill.filter)}
                aria-label={`Filter projects by ${skill.name}`}
              >
                {skill.name}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
