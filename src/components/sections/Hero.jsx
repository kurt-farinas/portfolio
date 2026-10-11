import React from 'react';
import { useModal } from '../../context/ModalContext';
import HeroDither from '../common/HeroDither';

export default function Hero() {
  const { openResumeModal, copyEmail } = useModal();

  return (
    <header className="studio-hero" id="hero">
      <div className="studio-container studio-hero-inner">
        <div className="studio-hero-intro">
          <p className="studio-hero-role">Junior full-stack developer.</p>
          <p className="studio-availability"><span aria-hidden="true" />Open to developer opportunities</p>
        </div>
        <h1 className="studio-hero-name"><span>Kurt</span>{' '}<span>Fariñas<span className="studio-name-period">.</span></span><HeroDither /></h1>
        <div className="studio-hero-details">
          <p className="studio-hero-description">I build interfaces and workflow systems that make everyday work easier to manage.</p>
          <div className="studio-hero-links">
            <div className="studio-hero-actions">
              <a href="#projects" className="studio-action">Explore my work</a>
              <button type="button" className="studio-action studio-action-outline" onClick={openResumeModal}>Preview résumé</button>
            </div>
            <div className="studio-hero-socials" aria-label="Contact and profiles">
              <a href="https://github.com/kurt-farinas" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://www.linkedin.com/in/kurt-vincent-fari%C3%B1as-315ab1367" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <button type="button" onClick={copyEmail}>Copy email</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
