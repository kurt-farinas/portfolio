import React, { useEffect } from 'react';
import { useRetroOS } from '../../context/RetroOSContext';
import { useDesktopWorkspace } from '../../context/DesktopWorkspaceContext';
import useDialogFocus from '../common/useDialogFocus';
import { portfolioProfile } from '../../data/portfolioFacts';

const BOOT_MS = 3000;
// A playful BIOS power-on self test shown above the splash; the lines appear one by one (all at once with reduced motion).
export const POST_LINES = ['KURT-BIOS 4.20  Retro Portfolio Systems', 'CPU: React 19 @ Vite ........... OK', 'Memory test: 640K ............... OK', 'Detecting drives: Projects, Résumé, After Hours', 'Booting Kurt-OS...'];
const PROGRESS_BLOCKS = 14;

export default function BootScreen() {
  const { bootOpen, finishBoot, toggleSound, soundEnabled, soundError } = useRetroOS();
  const { canUse3D, openApplication } = useDesktopWorkspace();
  const dialogRef = useDialogFocus(bootOpen);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (bootOpen && dialog && !dialog.open) dialog.showModal();
    else if (!bootOpen && dialog?.open) dialog.close();
  }, [bootOpen]);
  // The splash continues on its own; any button or Escape finishes it sooner and clears this timer.
  useEffect(() => {
    if (!bootOpen) return undefined;
    const timer = setTimeout(() => finishBoot(canUse3D ? '3d' : '2d'), BOOT_MS);
    return () => clearTimeout(timer);
  }, [bootOpen, canUse3D, finishBoot]);
  return <dialog ref={dialogRef} className="retro-boot" aria-labelledby="retro-boot-title" style={{ '--boot-ms': BOOT_MS + 'ms' }} onCancel={event => { event.preventDefault(); finishBoot('2d'); }}>
    <pre className="retro-boot-post" aria-hidden="true">{POST_LINES.map((line, index) => <span key={line} style={{ '--line': index }}>{line}{'\n'}</span>)}</pre>
    <div className="retro-boot-splash">
      <span className="retro-boot-mark" aria-hidden="true">KF</span>
      <h1 id="retro-boot-title">Kurt-OS <span>Portfolio Edition</span></h1>
      <p className="retro-boot-owner">{portfolioProfile.name} · {portfolioProfile.role}</p>
      <div className="retro-boot-progress" role="progressbar" aria-label="Starting Kurt-OS">{Array.from({ length: PROGRESS_BLOCKS }, (_, index) => <i key={index} style={{ '--block': index }} />)}</div>
      <p className="retro-boot-note">A playful portfolio interface, not a real operating system.</p>
    </div>
    <div className="retro-boot-actions">
      <button type="button" onClick={() => finishBoot(canUse3D ? '3d' : '2d')}>{canUse3D ? 'Enter 3D workstation' : 'Enter desktop'}</button>
      {canUse3D && <button type="button" onClick={() => finishBoot('2d')}>Enter 2D desktop</button>}
      <button type="button" onClick={() => { finishBoot('2d'); openApplication('projects'); }}>Go straight to Projects</button>
      <a href={portfolioProfile.resume} target="_blank" rel="noopener noreferrer">Open résumé PDF</a>
      <button className="retro-boot-sound" type="button" onClick={toggleSound} aria-pressed={soundEnabled}>Sound: {soundEnabled ? 'On' : 'Off'}</button>
    </div>
    {soundError && <p role="status">{soundError}</p>}
    <p className="retro-boot-footer">Starting Kurt-OS… Press Escape to skip.</p>
  </dialog>;
}
