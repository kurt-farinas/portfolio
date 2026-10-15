import React, { useLayoutEffect, useRef } from 'react';
import PortfolioImage from '../common/PortfolioImage';
import Hero from '../sections/Hero';
import AboutSection from '../sections/AboutSection';
import TimelineSection from '../sections/TimelineSection';
import SkillsSection from '../sections/SkillsSection';
import AwardsSection from '../sections/AwardsSection';
import { ProjectsContent } from '../../pages/ProjectsPage';
import { AfterHoursContent } from '../../pages/AfterHoursPage';
import { GearContent } from '../../pages/OutsideTheIdePage';
import { useDesktopWorkspace } from '../../context/DesktopWorkspaceContext';
import { useModal } from '../../context/ModalContext';
import { portfolioProfile } from '../../data/portfolioFacts';
import PortfolioContactForm from './PortfolioContactForm';
import { BugHunterApp, BugsweeperApp, CreditsApp, KurtOrdleApp, TerminalApp } from './RetroExtraApps';
import { ACHIEVEMENTS, useRetroOS } from '../../context/RetroOSContext';
import RetroIcon from './RetroIcon';
import MobileWorkbench from './MobileWorkbench';

const DRIVES = [['C', 'projects'], ['D', 'experience'], ['E', 'stack'], ['F', 'recognition'], ['G', 'resume'], ['H', 'contact']];

// Win98-style drive list; each drive opens an existing app with its existing label and description.
function MyComputerApp() {
  const { apps, openApplication } = useDesktopWorkspace();
  const { achievements } = useRetroOS();
  return <section className="retro-extra-app retro-my-computer"><p className="desktop-eyebrow">MY COMPUTER</p><h1>Kurt-OS drives</h1>
    <ul className="retro-drive-list">{DRIVES.map(([letter, id]) => { const app = apps.find(item => item.id === id); return app && <li key={id}><button type="button" onClick={() => openApplication(id)}><RetroIcon id="drive" /><span><strong>{app.label} ({letter}:)</strong><span>{app.description}</span></span></button></li>; })}</ul>
    <h2 className="retro-achievements-title">Achievements ({achievements.length}/{ACHIEVEMENTS.length})</h2>
    <p>Saved only for this browser session.</p>
    <ul className="retro-achievement-list">{ACHIEVEMENTS.map(item => { const done = achievements.includes(item.id); return <li key={item.id}><span aria-hidden="true">{done ? '✓' : '○'}</span><span><strong>{item.label}</strong> ({done ? 'unlocked' : 'locked'})<br />{item.hint}</span></li>; })}</ul>
  </section>;
}

function AboutApp() {
  return <div className="desktop-about-app"><MobileWorkbench /><Hero /><AboutSection /><dl className="retro-profile-facts"><dt>Education</dt><dd>{portfolioProfile.education}<br />{portfolioProfile.educationDates}</dd><dt>Current role</dt><dd>{portfolioProfile.employer}<br />Since {portfolioProfile.roleStarted}</dd></dl></div>;
}

function ResumeApp() {
  const { openResumeModal } = useModal();
  return (
    <section className="desktop-document-app">
      <div className="desktop-app-intro">
        <p className="desktop-eyebrow">CURRICULUM VITAE</p>
        <h1>Kurt Fariñas</h1>
        <p>{portfolioProfile.role}</p>
        <div className="desktop-action-row">
          <button type="button" className="studio-action" onClick={openResumeModal}>Open accessible résumé preview</button>
          <a className="studio-action studio-action-outline" href="/resume.pdf" target="_blank" rel="noopener noreferrer">Open PDF in new tab</a>
          <a className="studio-action studio-action-outline" href="/resume.pdf" download="Kurt_Farinas_Resume.pdf">Download PDF</a>
        </div>
      </div>
      <div className="desktop-resume-preview"><iframe src="/resume.pdf#toolbar=1&navpanes=0" title="Kurt Fariñas résumé PDF preview" /></div>
      <p className="desktop-resume-help">If your browser does not show the preview, open the PDF in a new tab or download it.</p>
    </section>
  );
}

function ContactApp() {
  const { copyEmail } = useModal();
  return (
    <section className="desktop-contact-app">
      <p className="desktop-eyebrow">GET IN TOUCH</p>
      <div className="desktop-contact-profile">
        <PortfolioImage src="/images/kurt-farinas-profile.png" alt="Kurt Fariñas" loading="eager" />
        <div><h1>Kurt Fariñas</h1><p>{portfolioProfile.role}</p></div>
      </div>
      <p>I work on interfaces and workflow systems for cooperative and education settings.</p>
      <PortfolioContactForm />
      <button type="button" className="studio-action studio-action-outline desktop-copy-email" onClick={copyEmail}>Copy email address</button>
      <div className="desktop-social-links">
        <a className="studio-action studio-action-outline" href={portfolioProfile.github} target="_blank" rel="noopener noreferrer">GitHub profile ↗</a>
        <a className="studio-action studio-action-outline" href={portfolioProfile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn profile ↗</a>
      </div>
    </section>
  );
}

function AppBody({ appId }) {
  switch (appId) {
    case 'about': return <AboutApp />;
    case 'projects': return <ProjectsContent compact />;
    case 'experience': return <TimelineSection />;
    case 'stack': return <SkillsSection />;
    case 'recognition': return <AwardsSection />;
    case 'after-hours': return <AfterHoursContent />;
    case 'gear': return <GearContent />;
    case 'resume': return <ResumeApp />;
    case 'contact': return <ContactApp />;
    case 'kurtordle': return <KurtOrdleApp />;
    case 'bugsweeper': return <BugsweeperApp />;
    case 'bughunter': return <BugHunterApp />;
    case 'terminal': return <TerminalApp />;
    case 'credits': return <CreditsApp />;
    case 'my-computer': return <MyComputerApp />;
    default: return <AboutApp />;
  }
}

export default function DesktopAppContent({ appId }) {
  const { getScrollPosition, saveScrollPosition } = useDesktopWorkspace();
  const scrollerRef = useRef(null);

  useLayoutEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = getScrollPosition(appId);
  }, [appId, getScrollPosition]);

  return (
    <div
      ref={scrollerRef}
      className="desktop-app-scroll"
      data-app-scroll={appId}
      onScroll={event => saveScrollPosition(appId, event.currentTarget.scrollTop)}
      tabIndex={0}
      aria-label={appId + ' application content'}
    >
      <AppBody appId={appId} />
    </div>
  );
}
