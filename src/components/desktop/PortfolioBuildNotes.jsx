import React from 'react';

const engineeringNotes = [
  ['Projected desktop', 'The monitor contains real React content rendered through Drei’s transformed Html component. A stable portal keeps that content mounted correctly when switching between the monitor and expanded desktop. The room is built with reusable Three.js geometry rather than a video or a screenshot.'],
  ['Window management', 'React context owns each app’s rectangle, focus, minimized state, and maximized state. Reopening an app restores its existing window. App routes follow browser history; scroll positions and app state survive view changes during the session.'],
  ['Camera and input', 'The projected screen owns pointer, wheel, and keyboard-focus input. A drag that starts inside stays a desktop gesture until release, even outside the screen. Scene raycasts skip desktop events so a button cannot also activate the monitor behind it. Camera movement remains available outside the screen.'],
  ['Responsive fallback', 'The 3D scene loads separately and is reserved for large screens with a fine pointer. Small screens, touch-first devices, and WebGL failures use the same React apps in a 2D desktop. Expanding the desktop also removes the perspective constraint for reading.'],
  ['Accessibility and motion', 'App windows have keyboard Move and Resize controls. Dialogs contain focus, close with Escape, and restore focus. The command palette supports keyboard navigation. Reduced motion makes camera transitions instant and stops ambient animation. The résumé stays available as a direct PDF link.'],
  ['Rendering trade-offs', 'HTML keeps text, forms, and scrolling native, but perspective reduces effective reading space. Projects therefore opens maximized in the monitor, with Expand desktop available. The canvas renders on demand outside the animated desk overview; pixel ratio is capped to limit GPU work.']
];

export default function PortfolioBuildNotes() {
  return <section className="portfolio-build-notes" aria-labelledby="portfolio-build-title">
    <h2 id="portfolio-build-title">Kurt-OS: an interactive portfolio</h2>
    <p>A Windows 98-inspired workstation built with React, Three.js, React Three Fiber, and Drei. The design challenge is to keep a playful room usable as a portfolio.</p>
    <details className="portfolio-engineering-details">
      <summary>How this portfolio works</summary>
      <div className="portfolio-engineering-grid">{engineeringNotes.map(([title, description]) => <section key={title}><h3>{title}</h3><p>{description}</p></section>)}</div>
    </details>
  </section>;
}
