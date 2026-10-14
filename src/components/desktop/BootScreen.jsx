import React, { useEffect } from 'react';
import { useRetroOS } from '../../context/RetroOSContext';
import { useDesktopWorkspace } from '../../context/DesktopWorkspaceContext';
import useDialogFocus from '../common/useDialogFocus';
import { portfolioProfile } from '../../data/portfolioFacts';

export default function BootScreen() {
  const { bootOpen, finishBoot, toggleSound, soundEnabled, soundError } = useRetroOS();
  const { canUse3D, openApplication } = useDesktopWorkspace();
  const dialogRef = useDialogFocus(bootOpen);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (bootOpen && dialog && !dialog.open) dialog.showModal();
    else if (!bootOpen && dialog?.open) dialog.close();
  }, [bootOpen]);
  return <dialog ref={dialogRef} className="retro-boot" aria-labelledby="retro-boot-title" onCancel={event => { event.preventDefault(); finishBoot('2d'); }}>
    <div className="retro-boot-header"><span>KF / PORTFOLIO SYSTEM</span><span>VISUAL BOOT SEQUENCE</span></div>
    <p className="retro-boot-kicker">KURT-OS · PORTFOLIO EDITION</p>
    <h1 id="retro-boot-title">{portfolioProfile.name}</h1>
    <p>{portfolioProfile.role}</p>
    <div className="retro-boot-log"><p>[READY] Portfolio apps and verified project data</p><p>[READY] Real résumé, screenshots, and contact paths</p><p>[MODE] {canUse3D ? '3D workstation or 2D desktop' : 'Responsive 2D desktop'}</p></div>
    <p>This is a playful portfolio interface, not a real operating system or hardware diagnostic.</p>
    <div className="retro-boot-actions">
      <button type="button" onClick={() => finishBoot(canUse3D ? '3d' : '2d')}>{canUse3D ? 'Enter 3D workstation' : 'Enter desktop'}</button>
      {canUse3D && <button type="button" onClick={() => finishBoot('2d')}>Enter 2D desktop</button>}
      <button type="button" onClick={() => { finishBoot('2d'); openApplication('projects'); }}>Go straight to Projects</button>
      <a href={portfolioProfile.resume} target="_blank" rel="noopener noreferrer">Open résumé PDF</a>
    </div>
    <button className="retro-boot-sound" type="button" onClick={toggleSound} aria-pressed={soundEnabled}>Sound: {soundEnabled ? 'On' : 'Off'}</button>
    {soundError && <p role="status">{soundError}</p>}
    <p className="retro-boot-footer">Ready immediately. Choose a view above, or press Escape for the desktop.</p>
  </dialog>;
}
