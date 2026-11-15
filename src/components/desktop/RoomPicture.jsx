import React from 'react';
import PortfolioImage from '../common/PortfolioImage';
import { roomPhase } from '../../utils/roomPhase';

// The desk overview as still pictures, for PCs without usable WebGL (hardware acceleration off, blocked GPU, or a 3D crash).
// Pictures come from scripts/capture-room-pictures.mjs at the 1440x900 overview pose.
// shortcut: hotspot boxes are hand-measured % of that capture; re-measure if the overview camera pose changes.
export const ROOM_HOTSPOTS = [
  { id: 'monitor', label: 'Open desktop', app: 'desktop', left: 38.5, top: 35.3, width: 25.3, height: 27.4 },
  { id: 'projects-note', label: 'Open Projects', app: 'projects', left: 63.3, top: 42.6, width: 4.2, height: 6.3 },
  { id: 'cork-board', label: 'Open Projects (cork board)', app: 'projects', left: 69.3, top: 40.6, width: 7.8, height: 7.2 },
  { id: 'contact-note', label: 'Open Contact', app: 'contact', left: 35.6, top: 52.6, width: 3.7, height: 5.8 },
  { id: 'microphone', label: 'Open Contact (microphone)', app: 'contact', left: 66, top: 56.1, width: 2.8, height: 8.1 },
  { id: 'photos', label: 'Open After Hours', app: 'after-hours', left: 42.7, top: 22.8, width: 18.8, height: 9.4 },
  { id: 'certificate', label: 'Open Recognition', app: 'recognition', left: 62.2, top: 26.7, width: 4.7, height: 5.8 },
  { id: 'fragrances', label: 'Open Gear & Collections', app: 'gear', left: 70.5, top: 57.2, width: 12.5, height: 10 },
  { id: 'resume-sheet', label: 'Open Résumé', app: 'resume', left: 28.8, top: 65.1, width: 7.6, height: 5 }
];

export default function RoomPicture({ theme, onOpenApp, onOpenDesktop }) {
  const phase = roomPhase(new Date());
  return <div className="room-picture" data-room-phase={phase}>
    <div className="room-picture-frame">
      <PortfolioImage src={`/images/room/${theme === 'light' ? 'light' : 'dark'}-${phase}.png`} alt="Kurt's desk: a beige computer, sticky notes, photos and a fragrance tray" loading="eager" width={1440} height={900} />
      {ROOM_HOTSPOTS.map(spot => <button key={spot.id} type="button" className="room-picture-spot" aria-label={spot.label} title={spot.label}
        style={{ left: spot.left + '%', top: spot.top + '%', width: spot.width + '%', height: spot.height + '%' }}
        onClick={() => (spot.app === 'desktop' ? onOpenDesktop() : onOpenApp(spot.app))} />)}
    </div>
  </div>;
}
