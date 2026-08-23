/* ========================================
   NAVBAR COMPONENT  |  Header Navigation & State
   ======================================== */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useModal } from '../../context/ModalContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { spawnToast } = useModal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      if (location.pathname === '/') {
        const sections = document.querySelectorAll('section[id], header[id]');
        let current = 'hero';
        sections.forEach((sec) => {
          const secTop = sec.offsetTop - 140;
          if (window.scrollY >= secTop) {
            current = sec.getAttribute('id');
          }
        });
        setActiveSection(current);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={isScrolled ? 'scrolled' : ''}>
      <div className="wrap nav-wrap">
        <Link
          to="/"
          className="logo"
          aria-label="Kurt Fariñas Home"
          onClick={() => {
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <span className="dot-box"><span className="dot"></span></span>
          <span className="logo-text">kurt.dev</span>
        </Link>

        <div className="nav-right">
          <div className="nav-links" id="navLinks">
            <button
              type="button"
              className={`nav-link-btn ${location.pathname === '/' && activeSection === 'projects' ? 'active-glow' : ''}`}
              onClick={() => handleNavClick('projects')}
            >
              PROJECTS
            </button>
            <button
              type="button"
              className={`nav-link-btn ${location.pathname === '/' && activeSection === 'timeline' ? 'active-glow' : ''}`}
              onClick={() => handleNavClick('timeline')}
            >
              EXPERIENCE
            </button>
            <button
              type="button"
              className={`nav-link-btn ${location.pathname === '/' && activeSection === 'skills' ? 'active-glow' : ''}`}
              onClick={() => handleNavClick('skills')}
            >
              SKILLS
            </button>
            <button
              type="button"
              className={`nav-link-btn ${location.pathname === '/' && activeSection === 'contact' ? 'active-glow' : ''}`}
              onClick={() => handleNavClick('contact')}
            >
              CONTACT
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            className="theme-btn"
            id="themeToggleBtn"
            onClick={(e) => {
              toggleTheme(e);
              spawnToast('THEME UPDATED', `Switched to ${theme === 'dark' ? 'LIGHT' : 'DARK'} mode`);
            }}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <svg className="theme-icon theme-icon--sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg className="theme-icon theme-icon--moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          <button
            type="button"
            className="btn-hire-me"
            onClick={() => handleNavClick('contact')}
          >
            HIRE ME
          </button>

          <button
            type="button"
            className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`} id="mobileMenu">
        <button type="button" className="mobile-nav-btn" onClick={() => handleNavClick('projects')}>PROJECTS</button>
        <button type="button" className="mobile-nav-btn" onClick={() => handleNavClick('timeline')}>EXPERIENCE</button>
        <button type="button" className="mobile-nav-btn" onClick={() => handleNavClick('skills')}>SKILLS</button>
        <button type="button" className="mobile-nav-btn" onClick={() => handleNavClick('contact')}>CONTACT</button>
        <a href="/resume.pdf" download onClick={() => setMobileMenuOpen(false)}>RESUME ↓</a>
      </div>
    </nav>
  );
}
