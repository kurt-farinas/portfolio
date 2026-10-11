/* ========================================
   SKILLS SECTION  |  Selected Technology Stack
   ======================================== */

import React from 'react';
import { useModal } from '../../context/ModalContext';
import SectionHeading from '../common/SectionHeading';

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
    <section className="studio-section studio-technologies" id="skills">
      <div className="studio-container">
        <SectionHeading title="Tools & Technologies" description="Select a technology to highlight the related projects above." />

        <div className="studio-skills" aria-label="Technology stack">
          {skills.map((skill) => {
            const isActive = skill.filter && activeSkillFilter?.toLowerCase() === skill.filter;

            if (!skill.filter) {
              return <span key={skill.name} className="studio-skill studio-skill-static">{skill.name}</span>;
            }

            return (
              <button
                key={skill.name}
                type="button"
                className="studio-skill"
                onClick={() => filterBySkill(skill.filter)}
                aria-label={`Filter projects by ${skill.name}`}
                aria-pressed={Boolean(isActive)}
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
