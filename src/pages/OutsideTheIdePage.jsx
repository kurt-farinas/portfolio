/* ========================================
   DURING DOWNTIME PAGE
   Clean showcase for personal photo stack, desk hardware & gear, and fragrance collection.
   ======================================== */

import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { gearCatalogData, snapshotsDeckData } from '../data/projectData';
import GearCard from '../components/common/GearCard';
import PhotoDeckShuffler from '../components/common/PhotoDeckShuffler';
import WaveBackground from '../components/common/WaveBackground';

export default function OutsideTheIdePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = useMemo(() => [
    {
      id: 'edc',
      title: 'Snapshots'
    },
    {
      id: 'desk',
      title: 'Desk Setup and Gear'
    },
    {
      id: 'rituals',
      title: 'Fragrance Collection'
    }
  ], []);

  return (
    <main className="outside-page-wrap gear-showcase-page" style={{ paddingTop: '100px', minHeight: '85vh', position: 'relative' }}>
      {/* Interactive 3D Harmonic Wave Canvas Background */}
      <div className="outside-wave-bg-wrap" aria-hidden="true">
        <WaveBackground />
      </div>

      <section className="section gear-page-section" style={{ paddingTop: 0 }}>
        <div className="wrap profile-wrap">
          {/* Back Navigation Bar */}
          <div className="outside-page-nav-bar" style={{ marginBottom: '28px' }}>
            <Link to="/" className="btn-back-home font-mono">
              ← RETURN TO MAIN PORTFOLIO
            </Link>
          </div>

          {/* Header Title Block */}
          <header className="gear-header-block" style={{ marginBottom: '32px' }}>
            <h1 className="profile-title gear-main-title" style={{ marginBottom: 0 }}>
              After Hours
            </h1>
          </header>

          {/* Main Content Area */}
          <div className="gear-catalog-container">
            {sections.map((section) => {
              if (section.id === 'edc') {
                return (
                  <section key={section.id} className="gear-category-section gear-snapshots-deck-section" aria-label="Personal photo stack">
                    <PhotoDeckShuffler photos={snapshotsDeckData} />
                  </section>
                );
              }

              const sectionItems = gearCatalogData.filter((item) => item.section === section.id);
              if (sectionItems.length === 0) return null;

              return (
                <section key={section.id} className="gear-category-section" aria-labelledby={`sec-${section.id}`}>
                  <div className="gear-category-header">
                    <h2 id={`sec-${section.id}`} className="gear-section-heading font-mono">
                      {section.title}
                    </h2>
                  </div>

                  <div className="gear-bento-grid">
                    {sectionItems.map((item) => (
                      <GearCard key={item.id} item={item} featured={item.featured} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Bottom Back Button */}
          <div className="outside-page-nav-bar" style={{ marginTop: '48px', textAlign: 'center' }}>
            <Link to="/" className="btn-back-home font-mono">
              ← RETURN TO MAIN PORTFOLIO
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
