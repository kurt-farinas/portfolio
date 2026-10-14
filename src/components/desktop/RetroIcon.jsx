import React from 'react';

const paths = {
  'my-computer': 'M3 3h18v12H3z M6 6h12v6H6z M9 15v3 M15 15v3 M5 18h14v3H5z',
  drive: 'M2 8h20v8H2z M5 12h6 M17 12h1',
  about: 'M4 3h16v18H4z M8 7h8 M8 11h8 M8 15h5',
  projects: 'M2 7h8l2 3h10v10H2z M2 7V4h8l2 3',
  experience: 'M3 7h18v14H3z M8 7V3h8v4 M3 12h18 M10 12v3h4v-3',
  stack: 'M8 5l-6 7 6 7 M16 5l6 7-6 7 M14 3l-4 18',
  recognition: 'M7 3h10v7a5 5 0 0 1-10 0z M7 5H3v3a4 4 0 0 0 4 4 M17 5h4v3a4 4 0 0 1-4 4 M12 15v6 M8 21h8',
  'after-hours': 'M2 4h20v16H2z M4 17l5-6 4 4 3-3 4 5 M7 8h1',
  gear: 'M4 4h16v12H4z M8 20h8 M12 16v4',
  resume: 'M5 2h10l4 4v16H5z M15 2v5h4 M8 11h8 M8 15h8 M8 19h5',
  contact: 'M2 5h20v14H2z M2 5l10 8L22 5',
  kurtordle: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  bughunter: 'M6 8h12v11H6z M9 8V4h6v4 M2 10h4 M18 10h4 M2 16h4 M18 16h4 M9 12h1 M14 12h1 M12 14v5',
  terminal: 'M2 4h20v16H2z M6 8l4 4-4 4 M12 16h6',
  credits: 'M4 2h16v20H4z M8 7h8 M8 11h8 M8 15h8 M8 19h5'
};
export default function RetroIcon({ id }) {
  return <svg className="retro-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="miter" aria-hidden="true"><path d={paths[id] || paths.about} /></svg>;
}
