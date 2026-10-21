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
      <path fill="var(--desk-cat-fur)" d="M277 36q0-10 6-10t6 10zM278 29l1-6 3 4zm10 0l-1-6-3 4z" />
      <path fill="var(--desk-cat-eye)" d="M280 30h2v2h-2zm4 0h2v2h-2z" />
      <path fill="var(--desk-wainscot)" d="M0 77h340v47H0z" />
      <path stroke="var(--desk-trim)" strokeWidth="2" d="M0 77h340" />
      <path fill="var(--desk-curtain)" d="M263 9h12v57h-12zm48 0h12v57h-12z" />
      <path stroke="var(--desk-retro-shell)" strokeWidth="3" d="M293 12v48m-23-24h46" />
      <path fill="var(--desk-retro-shell)" d="M266 61h54v3h-54zM303 55h8l-1 7h-6z" />
      <path fill="var(--desk-plant)" d="M307 56q-12-12-5-13 7 1 5 13 0-16 7-14 4 5-7 14z" />
      <path stroke="var(--desk-fairy-wire)" fill="none" d="M22 15q50 24 100 0" />
      <path fill="var(--desk-paper)" d="m39 25 20 3-3 24-20-3zm38 1 20-3 3 24-20 3z" />
      <path fill="var(--desk-rug)" d="m39 44 8-8 9 12zm42-4 8-9 8 13z" />
      {/* Decorative gaming shelf with no miniature interaction targets. */}
      <path fill="var(--desk-board)" d="M8 69h101v4H8z" />
      <rect x="23" y="53" width="22" height="17" rx="1" fill="var(--desk-fragrance-stone)" />
      <path fill="var(--desk-hardware-edge)" d="M25 55h17v13H25z" />
      <path fill="var(--desk-sky-night)" d="M26 56h14v10H26z" />
      <path fill="var(--desk-curtain)" d="M26 62h14v4H26z" />
      <path stroke="var(--desk-fragrance-stone)" strokeWidth="1.5" fill="none" d="M29 59v4l-1 2m1-3 2 3m-2-5 3 1" />
      <path stroke="var(--desk-fragrance-red)" strokeWidth="1.5" fill="none" d="M37 59v4l1 2m-1-3-2 3m2-5-3 1" />
      <rect x="47" y="59" width="28" height="10" rx="2" fill="var(--desk-fragrance-stone)" />
      <ellipse cx="61" cy="60" rx="9" ry="3" fill="var(--desk-hardware-detail)" />
      <path stroke="var(--desk-hardware-edge)" fill="none" d="M55 68q-12 9 4 10t12-8" />
      <path fill="var(--desk-fragrance-stone)" d="m60 73 3-3h9l4 5-3 2-3-3h-5l-3 3z" />
      <path fill="var(--desk-book-b)" d="M78 54h11v15H78z" />
      <path fill="var(--desk-paper)" d="M91 54h11v15H91zM79 66h22v2H79z" />
      <path fill="var(--desk-pot)" d="M13 62h9l-1 7h-7z" />
      <path fill="var(--desk-plant)" d="M17 64q-10-12-9-1t3 16q9 5 2 7-7-10-1-14 4-3 5-8z" />
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
      <path fill="var(--desk-duck)" d="M33 103q0-4 6-4h3q1-5 4-5t3 4q0 2-2 3 3 1 2 4-2 3-8 3t-8-5zm-1-3 3 2-3 1z" />
      <path fill="var(--desk-duck-beak)" d="M49 97h3l-3 2z" />
      <path fill="var(--desk-note-ink)" d="M46 96h1v1h-1z" />
      <path fill="var(--desk-lamp)" d="M49 94h26v5H49zm10-37h4v37h-4z" />
      <path fill="var(--desk-lamp)" d="m50 59 22-7 7 16H47z" />
      <path fill="var(--desk-mug)" d="M267 88h12v13h-12z" />
      <path stroke="var(--desk-mug)" strokeWidth="3" fill="none" d="M279 91q10 0 0 7" />
      <path fill="var(--desk-hardware-edge)" d="M250 78h5v17h-5zm-3-12h11v14h-11z" />
      <path fill="var(--desk-board)" d="M284 96h43v5h-43z" />
      <rect x="287" y="84" width="8" height="13" rx="2" fill="var(--desk-hawas-blue)" />
      <path fill="var(--desk-hawas-cap)" d="M289 80h4v5h-4z" />
      <rect x="297" y="84" width="8" height="13" rx="1" fill="var(--desk-fragrance-stone)" />
      <path stroke="var(--desk-object-dark)" strokeWidth="2" fill="none" d="M300 84v-3m-1-3a2 2 0 1 0 4 0 2 2 0 1 0-4 0" />
      <path fill="var(--desk-fragrance-brown)" d="m307 84-1 13h8l-1-13zm-1-7h8v5h-8z" />
      <path stroke="var(--desk-fragrance-gold)" strokeWidth="2" d="M307 84h6m-6 12h6" />
      <rect x="316" y="84" width="8" height="13" rx="2" fill="var(--desk-fragrance-silver)" />
      <path fill="var(--desk-fragrance-red)" d="M317 86h6v10h-6z" />
      <path fill="var(--desk-fragrance-silver)" d="M318 79h4v6h-4z" />
      <path fill="var(--desk-note-yellow)" d="m232 62 19 2-2 21-19-2z" />
    </svg>
    <nav className="mobile-workbench-shortcuts" aria-label="Workstation shortcuts">
      <button type="button" onClick={() => openApplication('projects')}><RetroIcon id="projects" /><span>Projects</span></button>
      <button type="button" onClick={() => openApplication('resume')}><RetroIcon id="resume" /><span>Résumé</span></button>
      <button type="button" onClick={() => openApplication('contact')}><RetroIcon id="contact" /><span>Contact</span></button>
    </nav>
  </section>;
}
