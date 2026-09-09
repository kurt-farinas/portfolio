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
      id: 'desk',
      number: '01',
      title: 'Desk Setup and Gear',
      description: 'The hardware and everyday tools behind my work and downtime.'
    },
    {
      id: 'rituals',
      number: '02',
      title: 'Fragrance Collection',
      description: 'A small collection of daily and occasion fragrances.'
    }
  ], []);

  return (
    <main className="outside-page-wrap gear-showcase-page">
      {/* Interactive 3D Harmonic Wave Canvas Background */}
      <div className="outside-wave-bg-wrap" aria-hidden="true">
        <WaveBackground />
      </div>

      <section className="section gear-page-section">
        <div className="wrap profile-wrap">
          <div className="outside-page-nav-bar outside-page-nav-bar-top">
            <Link to="/" className="btn-back-home font-mono">
              ← RETURN TO MAIN PORTFOLIO
            </Link>
          </div>

          <header className="gear-header-block section-title-block">
            <span className="gear-header-eyebrow font-mono">Personal archive</span>
            <h1 className="profile-title gear-main-title">
              After Hours
            </h1>
          </header>

          <div className="gear-catalog-container">
            <section className="after-hours-photo-section gear-snapshots-deck-section" aria-label="Interactive personal photo stack">
              <PhotoDeckShuffler photos={snapshotsDeckData} />
            </section>

            {sections.map((section) => {
              const sectionItems = gearCatalogData.filter((item) => item.section === section.id);
              if (sectionItems.length === 0) return null;

              return (
                <section
                  key={section.id}
                  className="gear-category-section"
                  aria-labelledby={`sec-${section.id}`}
                >
                  <div className="gear-category-header">
                    <span className="gear-section-index font-mono">{section.number}</span>
                    <div>
                      <h2 id={`sec-${section.id}`} className="gear-section-heading">
                        {section.title}
                      </h2>
                      <p className="gear-section-sub">{section.description}</p>
                    </div>
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

          <div className="outside-page-nav-bar outside-page-nav-bar-bottom">
            <Link to="/" className="btn-back-home font-mono">
              ← RETURN TO MAIN PORTFOLIO
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
