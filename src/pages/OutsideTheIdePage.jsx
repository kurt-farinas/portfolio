import React from 'react';
import { gearCatalogData } from '../data/projectData';
import GearCard from '../components/common/GearCard';

const sections = [
  { id: 'desk', title: 'Desk Setup and Gear' },
  { id: 'rituals', title: 'Fragrance Collection' }
];

export function GearContent() {
  const collections = sections.map(section => ({
    ...section,
    items: gearCatalogData.filter(item => item.section === section.id)
  })).filter(section => section.items.length > 0);

  return (
    <section className="outside-page-wrap studio-after-hours studio-gear-collections desktop-collection-content">
      <div className="studio-archive-section">
        <div className="studio-container">
          <header className="studio-archive-header">
            <p className="desktop-eyebrow">PERSONAL COLLECTION</p>
            <h1>Gear &amp; Collections</h1>
          </header>

          <div className="gear-catalog-container">
            {collections.map(section => (
              <section key={section.id} className="gear-category-section" aria-labelledby={'sec-' + section.id}>
                <div className="gear-category-header">
                  <h2 id={'sec-' + section.id} className="gear-section-heading">{section.title}</h2>
                </div>
                <div className="gear-bento-grid">
                  {section.items.map(item => <GearCard key={item.id} item={item} featured={item.featured} />)}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function OutsideTheIdePage() {
  return <GearContent />;
}
