import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import useDialogFocus from '../common/useDialogFocus';
import { useModal } from '../../context/ModalContext';
import { ContourCluster } from '../common/TopographicAccents';
import { scrollBehavior } from '../../utils/motion';
import { DesktopWorkspaceContext } from '../../context/DesktopWorkspaceContext';
import { useAsk } from '../common/AskOverlay';

const CONTACT_EMAIL = 'kurtfarinas2022@gmail.com';

function ContactDialog({ open, onClose }) {
  const dialogRef = useDialogFocus(open);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);

  const openGmailDraft = event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = `Portfolio inquiry from ${data.get('name')}`;
    const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`;
    const gmailUrl = new URL('https://mail.google.com/mail/');
    gmailUrl.search = new URLSearchParams({ view: 'cm', fs: '1', to: CONTACT_EMAIL, su: subject, body });
    window.open(gmailUrl.toString(), '_blank', 'noopener,noreferrer');
    onClose();
  };

  return <dialog ref={dialogRef} className="studio-contact-dialog" aria-labelledby="contact-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === dialogRef.current) onClose(); }}>
    <form className="studio-contact-card" onSubmit={openGmailDraft}>
      <button className="modal-close" type="button" aria-label="Close contact form" onClick={onClose}><NavIcon path="m6 6 12 12M6 18 18 6" /></button>
      <p className="modal-badge">GET IN TOUCH</p>
      <h2 className="modal-title" id="contact-title">Send me a message</h2>
      <p className="studio-contact-help">Your message will open as a draft in Gmail, ready for you to send.</p>
      <label className="studio-contact-field">Your name<input name="name" autoComplete="name" required maxLength="120" /></label>
      <label className="studio-contact-field">Your email<input name="email" type="email" autoComplete="email" required maxLength="254" /></label>
      <label className="studio-contact-field">Message<textarea name="message" required rows="5" maxLength="5000" /></label>
      <div className="studio-contact-actions"><button className="studio-action studio-action-outline" type="button" onClick={onClose}>Cancel</button><button className="studio-action" type="submit">Continue in Gmail</button></div>
    </form>
  </dialog>;
}

const sections = [
  { id: 'hero', label: 'Home', icon: 'M3 10 12 3l9 7v10h-6v-7H9v7H3Z' },
  { id: 'projects', to: '/projects', label: 'Projects', icon: 'M3 5h7l2 3h9v12H3Z' },
  { id: 'timeline', label: 'Experience', icon: 'M3 8h18v12H3ZM8 8V4h8v4M3 13h18M10 13v3h4v-3' },
  { id: 'skills', label: 'Stack', icon: 'm8 5-6 7 6 7m8-14 6 7-6 7M14 3l-4 18' },
  { id: 'awards', label: 'Recognition', icon: 'M7 3h10v7a5 5 0 0 1-10 0ZM7 5H3v3a4 4 0 0 0 4 4M17 5h4v3a4 4 0 0 1-4 4M12 15v6M8 21h8' }
];
const homeSectionIds = ['hero', 'about', 'projects', 'timeline', 'skills', 'awards'];

function NavIcon({ path }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>;
}

function ContourFidget() {
  const [turns, setTurns] = useState(0);
  return <div className="studio-sidebar-fidget">
    <span>Contour play</span>
    <button type="button" className="studio-icon-button studio-contour-button" aria-label="Rotate contour" title="Rotate contour" onClick={() => setTurns(value => value + 1)}>
      <ContourCluster className="studio-contour-glyph" style={{ transform: `rotate(${turns * 30}deg)` }} />
    </button>
  </div>;
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const { contactModalOpen, openContactModal, closeContactModal } = useModal();
  const { openAsk } = useAsk();
  const nativeDialogRef = useRef(null);
  const drawerRef = useDialogFocus(mobileMenuOpen);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileMenuOpen(false);
    const handleScroll = () => {
      if (location.pathname !== '/') return;
      const readingLine = window.innerHeight / 3;
      let current = 'hero';
      homeSectionIds.forEach(id => {
        const section = document.getElementById(id);
        if (section?.getBoundingClientRect().top <= readingLine) current = id === 'about' ? 'hero' : id;
      });
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = 'awards';
      setActiveSection(current);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const dialog = nativeDialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 1100px)');
    const closeOnDesktop = event => { if (event.matches) setMobileMenuOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [mobileMenuOpen]);

  const handleNavClick = sectionId => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') navigate(`/#${sectionId}`);
    else document.getElementById(sectionId)?.scrollIntoView({ behavior: scrollBehavior() });
  };
  const themeControl = <button type="button" className="studio-icon-button" onClick={toggleTheme} aria-label="Toggle Theme" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}><NavIcon path={theme === 'dark' ? 'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17m10-10 1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z' : 'M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z'} /></button>;
  const navigation = <div className="studio-nav-links">
    {sections.map(section => section.to
      ? <Link key={section.to} to={section.to} aria-current={location.pathname === section.to ? 'page' : location.pathname === '/' && activeSection === section.id ? 'location' : undefined} onClick={() => setMobileMenuOpen(false)}><NavIcon path={section.icon} />{section.label}</Link>
      : <button type="button" key={section.id} onClick={() => handleNavClick(section.id)} aria-current={location.pathname === '/' && activeSection === section.id ? 'location' : undefined}><NavIcon path={section.icon} />{section.label}</button>)}
    <div className="studio-nav-divider" aria-hidden="true" />
    <Link to="/after-hours" aria-current={location.pathname === '/after-hours' ? 'page' : undefined} onClick={() => setMobileMenuOpen(false)}><NavIcon path="M20 15.4A9 9 0 0 1 8.6 4 9 9 0 1 0 20 15.4Z" />After Hours</Link>
    <Link to="/gear" aria-current={['/gear', '/downtime', '/outside-the-ide'].includes(location.pathname) ? 'page' : undefined} onClick={() => setMobileMenuOpen(false)}><NavIcon path="M3 7h18v14H3zM7 7V4h10v3m-7 0v3m4-3v3M3 12h18" />Gear &amp; Collections</Link>
  </div>;
  const themeRow = <div className="studio-sidebar-theme"><span>{theme === 'dark' ? 'Dark' : 'Light'} appearance</span>{themeControl}</div>;
  const actions = <div className="studio-sidebar-actions">
    <button className="studio-action" type="button" onClick={() => { setMobileMenuOpen(false); openContactModal(); }}>Contact me</button>
    <button className="studio-action studio-action-outline" type="button" onClick={() => { setMobileMenuOpen(false); openAsk(); }} title="Alt K">Ask anything</button>
  </div>;

  // In Classic mode the top of the sidebar is the way back to the OS; the name stays in the profile intro.
  const exitClassic = useContext(DesktopWorkspaceContext)?.exitClassic;
  const backToOs = exitClassic && <button type="button" className="studio-logo studio-back-to-os" onClick={() => { setMobileMenuOpen(false); exitClassic(); }}>← Back to Kurt-OS</button>;

  return <>
    <nav className="studio-navbar" aria-label="Main navigation">
      <div className="studio-nav-inner">
        {backToOs || <Link to="/" className="studio-logo" aria-label="Kurt Fariñas Home" onClick={() => {
          setMobileMenuOpen(false);
          if (location.pathname === '/') window.scrollTo({ top: 0, behavior: scrollBehavior() });
        }}>Kurt Fariñas</Link>}
        <div className="studio-mobile-actions">{themeControl}<button type="button" className="studio-icon-button studio-menu-toggle" onClick={() => setMobileMenuOpen(true)} aria-label="Toggle navigation" aria-expanded={mobileMenuOpen} aria-controls="mobileMenu"><NavIcon path="M4 6h16M4 12h16M4 18h16" /></button></div>
      </div>
      <div className="studio-nav-desktop">{actions}<p className="studio-nav-label">Portfolio</p>{navigation}<div className="studio-sidebar-utilities"><ContourFidget />{themeRow}</div></div>
    </nav>
    {mobileMenuOpen && <dialog ref={nativeDialogRef} className="studio-drawer-backdrop" aria-label="Portfolio navigation" onCancel={event => { event.preventDefault(); setMobileMenuOpen(false); }} onClick={event => { if (event.target === event.currentTarget) setMobileMenuOpen(false); }}>
      <div ref={drawerRef} className="studio-mobile-menu" id="mobileMenu">
        <div className="studio-drawer-header">{backToOs || <strong>Kurt Fariñas</strong>}<button className="studio-icon-button" type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)}><NavIcon path="m6 6 12 12M6 18 18 6" /></button></div>
        {actions}<nav aria-label="Mobile navigation">{navigation}</nav><div className="studio-sidebar-utilities">{themeRow}</div>
      </div>
    </dialog>}
    <ContactDialog open={contactModalOpen} onClose={closeContactModal} />
  </>;
}
