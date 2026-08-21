/* ========================================
   SKILLS SECTION  |  Tech Stack & Tool Arsenal
   Clickable chips that filter and highlight matching projects
   ======================================== */

import React from 'react';
import { useModal } from '../../context/ModalContext';

export default function SkillsSection() {
  const { activeSkillFilter, filterBySkill } = useModal();

  const isSkillActive = (name) => {
    if (!activeSkillFilter) return false;
    return activeSkillFilter.toLowerCase() === name.toLowerCase();
  };

  return (
    <section className="section skills-section" id="skills">
      <div className="wrap profile-wrap">
        <div className="profile-header-divider">
          <span className="profile-eyebrow">
            <span className="eyebrow-index">// 04.00</span> — TECH STACK &amp; TOOLS
          </span>
        </div>

        <div className="section-title-block">
          <h2 className="profile-title">Tools &amp; Technologies</h2>
          <p className="profile-header-sub">Tools &amp; technologies I build with. (Click any skill to filter)</p>
        </div>

        <div className="skill-legend">
          <span className="prof-badge prof-pro">Production</span>
          <span className="prof-badge prof-mid">Proficient</span>
          <span className="prof-badge prof-learn">Learning</span>
        </div>

        <div className="skills-grid">
          {/* Group 1: Languages */}
          <div className="skill-group">
            <h4>Languages</h4>
            <div className="skill-tags">
              <span
                role="button"
                tabIndex={0}
                aria-label="Filter projects by JavaScript"
                onClick={() => filterBySkill('javascript')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') filterBySkill('javascript'); }}
                className={`has-prof ${isSkillActive('javascript') ? 'active-skill-pill' : ''}`}
              >
                JavaScript<em className="prof-dot prof-pro" title="Production level"></em>
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label="Filter projects by PHP"
                onClick={() => filterBySkill('php')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') filterBySkill('php'); }}
                className={`has-prof ${isSkillActive('php') ? 'active-skill-pill' : ''}`}
              >
                PHP<em className="prof-dot prof-pro" title="Production level"></em>
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label="Filter projects by HTML/CSS"
                onClick={() => filterBySkill('html')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') filterBySkill('html'); }}
                className={`has-prof ${isSkillActive('html') ? 'active-skill-pill' : ''}`}
              >
                HTML / CSS<em className="prof-dot prof-pro" title="Production level"></em>
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label="Filter projects by SQL"
                onClick={() => filterBySkill('sql')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') filterBySkill('sql'); }}
                className={`has-prof ${isSkillActive('sql') ? 'active-skill-pill' : ''}`}
              >
                SQL<em className="prof-dot prof-mid" title="Proficient"></em>
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label="Filter projects by Java"
                onClick={() => filterBySkill('java')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') filterBySkill('java'); }}
                className={`has-prof ${isSkillActive('java') ? 'active-skill-pill' : ''}`}
              >
                Java<em className="prof-dot prof-mid" title="Oracle Academy certified"></em>
              </span>
            </div>
          </div>

          {/* Group 2: Frameworks */}
          <div className="skill-group">
            <h4>Frameworks</h4>
            <div className="skill-tags">
              <span
                role="button"
                tabIndex={0}
                aria-label="Filter projects by React"
                onClick={() => filterBySkill('react')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') filterBySkill('react'); }}
                className={`has-prof ${isSkillActive('react') ? 'active-skill-pill' : ''}`}
              >
                React<em className="prof-dot prof-pro" title="Production level"></em>
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label="Filter projects by Inertia.js"
                onClick={() => filterBySkill('inertia')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') filterBySkill('inertia'); }}
                className={`has-prof ${isSkillActive('inertia') ? 'active-skill-pill' : ''}`}
              >
                Inertia.js<em className="prof-dot prof-pro" title="Production level"></em>
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label="Filter projects by Laravel"
                onClick={() => filterBySkill('laravel')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') filterBySkill('laravel'); }}
                className={`has-prof ${isSkillActive('laravel') ? 'active-skill-pill' : ''}`}
              >
                Laravel<em className="prof-dot prof-pro" title="Production level"></em>
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label="Filter projects by Tailwind CSS"
                onClick={() => filterBySkill('tailwind')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') filterBySkill('tailwind'); }}
                className={`has-prof ${isSkillActive('tailwind') ? 'active-skill-pill' : ''}`}
              >
                Tailwind CSS<em className="prof-dot prof-pro" title="Production level"></em>
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label="Filter projects by Pest"
                onClick={() => filterBySkill('pest')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') filterBySkill('pest'); }}
                className={`has-prof ${isSkillActive('pest') ? 'active-skill-pill' : ''}`}
              >
                Pest<em className="prof-dot prof-pro" title="119 Passing Tests"></em>
              </span>
            </div>
          </div>

          {/* Group 3: Tools & APIs */}
          <div className="skill-group">
            <h4>Tools &amp; APIs</h4>
            <div className="skill-tags">
              <span
                role="button"
                tabIndex={0}
                aria-label="Filter projects by Git"
                onClick={() => filterBySkill('git')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') filterBySkill('git'); }}
                className={`has-prof ${isSkillActive('git') ? 'active-skill-pill' : ''}`}
              >
                Git / GitHub<em className="prof-dot prof-pro" title="Production level"></em>
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label="Filter projects by MySQL"
                onClick={() => filterBySkill('mysql')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') filterBySkill('mysql'); }}
                className={`has-prof ${isSkillActive('mysql') ? 'active-skill-pill' : ''}`}
              >
                MySQL<em className="prof-dot prof-pro" title="Production level"></em>
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label="Filter projects by VS Code"
                onClick={() => filterBySkill('vscode')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') filterBySkill('vscode'); }}
                className={`has-prof ${isSkillActive('vscode') ? 'active-skill-pill' : ''}`}
              >
                VS Code<em className="prof-dot prof-pro" title="Daily driver"></em>
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label="Filter projects by Gemini API"
                onClick={() => filterBySkill('gemini')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') filterBySkill('gemini'); }}
                className={`has-prof ${isSkillActive('gemini') ? 'active-skill-pill' : ''}`}
              >
                Gemini API<em className="prof-dot prof-mid" title="Integrated into Form 6 workflow"></em>
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label="Filter projects by Linux"
                onClick={() => filterBySkill('linux')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') filterBySkill('linux'); }}
                className={`has-prof ${isSkillActive('linux') ? 'active-skill-pill' : ''}`}
              >
                Linux / SysAdmin<em className="prof-dot prof-mid" title="Self-hosted services"></em>
              </span>
            </div>
          </div>

          {/* Group 4: In Progress / Expanding */}
          <div className="skill-group">
            <h4>In Progress / Expanding</h4>
            <div className="skill-tags">
              <span className="has-prof">TypeScript<em className="prof-dot prof-learn" title="Learning"></em></span>
              <span className="has-prof">Next.js<em className="prof-dot prof-learn" title="Learning"></em></span>
              <span className="has-prof">Node.js<em className="prof-dot prof-learn" title="Learning"></em></span>
              <span className="has-prof">Docker<em className="prof-dot prof-learn" title="Learning"></em></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
