import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { scrollBehavior } from '../../utils/motion';

const sections = [
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'timeline', label: 'Experience' },
  { id: 'skills', label: 'Tools' }
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const menuButtonRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileMenuOpen(false);
    const handleScroll = () => {
      if (location.pathname !== '/') return;
      let current = 'hero';
      document.querySelectorAll('main section[id], main header[id]').forEach((section) => {
        if (window.scrollY >= section.offsetTop - 140) current = section.id;
      });
      setActiveSection(current);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileMenuOpen]);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') navigate(`/#${sectionId}`);
    else document.getElementById(sectionId)?.scrollIntoView({ behavior: scrollBehavior() });
  };

  return (
    <nav className="studio-navbar" aria-label="Main navigation">
      <div className="studio-container studio-nav-inner">
        <Link to="/" className="studio-logo" aria-label="Kurt Fariñas Home" onClick={() => {
          setMobileMenuOpen(false);
          if (location.pathname === '/') window.scrollTo({ top: 0, behavior: scrollBehavior() });
        }}><span className="studio-monogram" aria-hidden="true">kf.</span><span>kurt.dev</span></Link>
        <div className="studio-nav-actions">
          <div className="studio-nav-links">
            {sections.map((section) => <button type="button" key={section.id} onClick={() => handleNavClick(section.id)} aria-current={location.pathname === '/' && activeSection === section.id ? 'location' : undefined}>{section.label}</button>)}
            <Link to="/after-hours" aria-current={location.pathname !== '/' ? 'page' : undefined}>After Hours</Link>
          </div>
          <button type="button" className="studio-icon-button studio-theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            {theme === 'dark' ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z" /></svg>}
          </button>
          <a className="studio-action studio-nav-contact" href="mailto:kurtfarinas2022@gmail.com?subject=Portfolio%20Inquiry">Let's talk</a>
          <button ref={menuButtonRef} type="button" className="studio-icon-button studio-menu-toggle" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={mobileMenuOpen} aria-controls="mobileMenu">
            <span aria-hidden="true">{mobileMenuOpen ? '×' : '☰'}</span>
          </button>
        </div>
      </div>
      <div className="studio-mobile-menu studio-container" id="mobileMenu" hidden={!mobileMenuOpen}>
        {sections.map((section) => <button type="button" key={section.id} onClick={() => handleNavClick(section.id)} aria-current={location.pathname === '/' && activeSection === section.id ? 'location' : undefined}>{section.label}</button>)}
        <Link to="/after-hours" aria-current={location.pathname !== '/' ? 'page' : undefined} onClick={() => setMobileMenuOpen(false)}>After Hours</Link>
        <a href="mailto:kurtfarinas2022@gmail.com?subject=Portfolio%20Inquiry" onClick={() => setMobileMenuOpen(false)}>Contact</a>
        <a href="/resume.pdf" download onClick={() => setMobileMenuOpen(false)}>Download résumé</a>
      </div>
    </nav>
  );
}
