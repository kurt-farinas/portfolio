import React from 'react';
import { useDesktopWorkspace } from '../../context/DesktopWorkspaceContext';
import RetroIcon from './RetroIcon';

export default function MobileWorkbench() {
  const { openApplication } = useDesktopWorkspace();
  return <section className="mobile-workbench" aria-labelledby="mobile-workbench-title">
    <div className="mobile-workbench-heading"><span id="mobile-workbench-title">Kurt’s workstation</span><span>Personal desktop</span></div>
    <svg viewBox="0 0 340 124" aria-hidden="true" focusable="false">
      <path fill="var(--desk-wall)" d="M0 0h340v124H0z" />
      <path fill="var(--desk-sky-day)" d="M270 12h46v48h-46z" />
      <circle cx="306" cy="22" r="4" fill="var(--desk-fairy-bulb)" />
      <path fill="var(--desk-land-far)" d="M270 43q12-17 25-7t21-4v28h-46z" />
      <path fill="var(--desk-land-near)" d="M270 51q14-12 26-4t20-2v15h-46z" />
      <path fill="var(--desk-wainscot)" d="M0 77h340v47H0z" />
      <path stroke="var(--desk-trim)" strokeWidth="2" d="M0 77h340" />
      <path fill="var(--desk-curtain)" d="M263 9h12v57h-12zm48 0h12v57h-12z" />
      <path stroke="var(--desk-retro-shell)" strokeWidth="3" d="M293 12v48m-23-24h46" />
      <path fill="var(--desk-retro-shell)" d="M266 61h54v3h-54zM303 55h8l-1 7h-6z" />
      <path fill="var(--desk-plant)" d="M307 56q-12-12-5-13 7 1 5 13 0-16 7-14 4 5-7 14z" />
      <path stroke="var(--desk-fairy-wire)" fill="none" d="M22 15q50 24 100 0" />
      <path fill="var(--desk-paper)" d="m39 25 20 3-3 24-20-3zm38 1 20-3 3 24-20 3z" />
      <path fill="var(--desk-rug)" d="m39 44 8-8 9 12zm42-4 8-9 8 13z" />
      <g transform="translate(4 -2)">
      <path fill="var(--desk-retro-edge)" d="M229 19 239 26v66h-10z" />
      <path fill="var(--desk-retro-shell)" d="M117 19h112v73H117z" />
      <path fill="var(--desk-retro-recess)" d="M124 26h98v56h-98z" />
      <path fill="var(--retro-wallpaper-0)" d="M128 30h90v48h-90z" />
      <path fill="var(--retro-chrome)" d="M144 37h64v34h-64z" />
      <path fill="var(--retro-title)" d="M146 39h60v7h-60z" />
      <path fill="var(--desk-paper)" d="M150 51h24v15h-24z" />
      <path stroke="var(--retro-ink)" strokeWidth="2" d="M180 52h21m-21 6h16m-16 6h19" />
      <path fill="var(--desk-retro-edge)" d="M160 92h27v8h-27z" />
      </g>
      <path fill="var(--desk-board)" d="M14 99 307 94 330 105 35 113Z" />
      <path fill="var(--desk-frame)" d="M35 113 330 105v7L35 120Z" />
      <path fill="var(--desk-frame)" d="M28 111h7v13h-7zm277 0h7v13h-7z" />
      <path fill="var(--desk-retro-key)" d="M137 101h73v6h-73z" />
      <path fill="var(--desk-mug)" d="m83 101 23-1 1 8-23 1z" />
      <path fill="var(--desk-paper)" d="m85 101 20-1 1 6-20 1z" />
      <path stroke="var(--desk-note-yellow)" strokeWidth="2" d="m110 100 3 8" />
      <path fill="var(--desk-lamp)" d="M49 94h26v5H49zm10-37h4v37h-4z" />
      <path fill="var(--desk-lamp)" d="m50 59 22-7 7 16H47z" />
      <path fill="var(--desk-mug)" d="M267 88h12v13h-12z" />
      <path stroke="var(--desk-mug)" strokeWidth="3" fill="none" d="M279 91q10 0 0 7" />
      <path fill="var(--desk-hardware-edge)" d="M250 78h5v17h-5zm-3-12h11v14h-11z" />
      <path fill="var(--desk-accent)" d="M301 83h9v15h-9z" />
      <path fill="var(--desk-object-dark)" d="M302 79h7v4h-7z" />
      <path fill="var(--desk-note-yellow)" d="m232 62 19 2-2 21-19-2z" />
    </svg>
    <nav className="mobile-workbench-shortcuts" aria-label="Workstation shortcuts">
      <button type="button" onClick={() => openApplication('projects')}><RetroIcon id="projects" /><span>Projects</span></button>
      <button type="button" onClick={() => openApplication('resume')}><RetroIcon id="resume" /><span>Résumé</span></button>
      <button type="button" onClick={() => openApplication('contact')}><RetroIcon id="contact" /><span>Contact</span></button>
    </nav>
  </section>;
}
