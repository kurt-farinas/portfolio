/* ========================================
   DURING DOWNTIME PAGE
   Clean showcase for personal photo stack, desk hardware & gear, and fragrance collection.
   ======================================== */

import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { gearCatalogData, snapshotsDeckData } from '../data/projectData';
import GearCard from '../components/common/GearCard';
import PhotoDeckShuffler from '../components/common/PhotoDeckShuffler';


export default function OutsideTheIdePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = useMemo(() => [
    {
      id: 'desk',
      title: 'Desk Setup and Gear',
      description: 'The hardware and everyday tools behind my work and downtime.'
    },
    {
      id: 'rituals',
      title: 'Fragrance Collection',
      description: 'A small collection of daily and occasion fragrances.'
    }
  ], []);

  return (
    <main className="outside-page-wrap gear-showcase-page studio-after-hours">
<section className="studio-archive-section">
        <div className="studio-container">
          <div className="outside-page-nav-bar outside-page-nav-bar-top">
            <Link to="/" className="studio-text-action font-mono">
              ← RETURN TO MAIN PORTFOLIO
            </Link>
          </div>

          <header className="studio-archive-header">
            <h1>
              After Hours
            </h1>
            <p>A few things from the other side of the screen.</p>
          </header>

          <div className="gear-catalog-container">
            <section className="after-hours-photo-section gear-snapshots-deck-section" aria-label="Interactive personal photo stack">
              <div className="studio-photo-intro">
                <h2>Life outside<br />the IDE.</h2>
                <p>Swipe, drag, or use the arrow keys to explore the photo stack.</p>
              </div>
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
            <Link to="/" className="studio-action font-mono">
              ← RETURN TO MAIN PORTFOLIO
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
