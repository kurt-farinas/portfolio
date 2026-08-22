/* ========================================
   HERO COMPONENT  |  Terminal Splitting Headline & Action Pill
   ======================================== */

import React, { useEffect, useRef } from 'react';
import { useModal } from '../../context/ModalContext';

export default function Hero() {
  const { openResumeModal, copyEmail } = useModal();
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      if (scrolled > 600) return;

      const factor = scrolled * 0.12;
      const opacity = Math.max(0, 1 - (scrolled / 450));

      if (line1Ref.current) {
        line1Ref.current.style.transform = `translateX(-${factor}px)`;
        line1Ref.current.style.opacity = opacity;
      }
      if (line2Ref.current) {
        line2Ref.current.style.transform = `translateX(${factor}px)`;
        line2Ref.current.style.opacity = opacity;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToProjects = (e) => {
    e.preventDefault();
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="hero hero-avery entered" id="hero">
      <div className="wrap hero-wrap">
        <div className="hero-center-content">
          <h1 id="heroH1" className="hero-title">
            <span ref={line1Ref} className="title-line line-1">HI, I AM KURT</span>
            <span ref={line2Ref} className="title-line line-2">JUNIOR FULL-STACK DEVELOPER</span>
          </h1>

          <p className="hero-subtitle">
            Building responsive web applications, multi-role approval systems, and clean relational backends with React, Inertia.js, Laravel, and MySQL.
          </p>
        </div>

        <div className="hero-bottom-controls hero-slide-up">
          <a href="#projects" className="btn-view-projects" onClick={scrollToProjects}>
            <span>VIEW PROJECTS</span>
            <span className="arrow">→</span>
          </a>

          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-view-resume"
          >
            <span>VIEW RESUME</span>
            <span className="arrow">↗</span>
          </a>

          <button
            type="button"
            className="btn-copy-email-pill"
            onClick={copyEmail}
            title="Click to copy kurtfarinas2022@gmail.com"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span className="copy-email-address">kurtfarinas2022@gmail.com</span>
            <span className="copy-pill-badge">COPY</span>
          </button>

          <div className="hero-social-pill">
            <a
              href="https://github.com/kurt-farinas"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
            >
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"></path>
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/kurt-vincent-fari%C3%B1as-315ab1367"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
            >
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75-1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"></path>
              </svg>
            </a>
            <button type="button" onClick={copyEmail} aria-label="Email Me">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </button>
            <button type="button" onClick={openResumeModal} aria-label="Preview Resume PDF" title="Preview Resume PDF">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
