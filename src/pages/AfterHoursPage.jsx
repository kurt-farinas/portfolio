import React from 'react';
import PhotoDeckShuffler from '../components/common/PhotoDeckShuffler';
import { snapshotsDeckData } from '../data/projectData';

export function AfterHoursContent() {
  return (
    <section className="outside-page-wrap studio-after-hours desktop-collection-content">
      <div className="studio-archive-section">
        <div className="studio-container">
          <header className="studio-archive-header">
            <p className="desktop-eyebrow">PERSONAL COLLECTION</p>
            <h1>After Hours</h1>
            <p>A few things from the other side of the screen.</p>
          </header>

          <section className="after-hours-photo-section gear-snapshots-deck-section" aria-label="Interactive personal photo stack">
            <div className="studio-photo-intro">
              <h2>Life outside<br />the IDE.</h2>
            </div>
            <PhotoDeckShuffler photos={snapshotsDeckData} />
          </section>
        </div>
      </div>
    </section>
  );
}

export default function AfterHoursPage() {
  return <AfterHoursContent />;
}
