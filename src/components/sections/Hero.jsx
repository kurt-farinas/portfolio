import React from 'react';
import { useModal } from '../../context/ModalContext';
import PortfolioImage from '../common/PortfolioImage';
import { portfolioProfile } from '../../data/portfolioFacts';

export default function Hero() {
  const { copyEmail } = useModal();
  return (
    <header className="studio-hero" id="hero">
      <div className="studio-container">
        <div className="studio-profile-row">
          <PortfolioImage src="/images/kurt-farinas-profile.png" alt="Kurt Fariñas" className="studio-profile-photo" loading="eager" />
          <div><p className="studio-profile-name">Kurt Fariñas</p><p className="studio-hero-role">{portfolioProfile.role}</p></div>
          <a href={portfolioProfile.resume} target="_blank" rel="noopener noreferrer" className="studio-action studio-action-outline studio-profile-resume">Resume</a>
        </div>
        <h1 className="studio-hero-name">{portfolioProfile.statement}</h1>
        <nav className="studio-hero-actions studio-hero-socials" aria-label="Contact and profiles">
          <a href={portfolioProfile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" title="GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" /></svg>
          </a>
          <a href={portfolioProfile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" title="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
          </a>
          <button type="button" onClick={copyEmail} aria-label="Copy email address" title="Copy email">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
          </button>
        </nav>
      </div>
    </header>
  );
}
