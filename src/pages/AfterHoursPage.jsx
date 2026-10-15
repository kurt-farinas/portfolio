import React from 'react';
import PhotoDeckShuffler from '../components/common/PhotoDeckShuffler';
import { snapshotsDeckData } from '../data/projectData';

export function AfterHoursContent() {
  return (
    <section className="outside-page-wrap studio-after-hours desktop-collection-content">
      <div className="studio-archive-section">
        <div className="studio-container">
          <header className="studio-archive-header">
            <h1>After Hours</h1>
          </header>

          <section className="after-hours-photo-section gear-snapshots-deck-section" aria-label="Interactive personal photo stack">
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
