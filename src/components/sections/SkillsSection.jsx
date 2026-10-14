/* ========================================
   SKILLS SECTION  |  Selected Technology Stack
   ======================================== */

import React from 'react';

import { technologyGroups } from '../../data/portfolioFacts';

const skills = Object.entries(technologyGroups).flatMap(([category, names]) => names.map(name => ({ name, category })));
const categories = Object.keys(technologyGroups);

export default function SkillsSection() {
  return (
    <section className="studio-section studio-technologies" id="skills">
      <div className="studio-container">
        <div className="studio-stack-heading">
          <h2>Stack</h2>
        </div>

        <div className="studio-skills" role="list" aria-label="Technologies by category">
          {categories.map((category) => {
            const categorySkills = skills.filter((skill) => skill.category === category);

            return (
              <div className="studio-skill-row" role="listitem" key={category}>
                <span className="studio-skill-category">{category}</span>
                <ul className="studio-skill-list" aria-label={`${category} technologies`}>
                  {categorySkills.map((skill, index) => (
                    <li key={skill.name}>
                      <span className="studio-skill studio-skill-name">{skill.name}</span>
                      {index < categorySkills.length - 1 && <span className="studio-skill-separator" aria-hidden="true">,</span>}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
