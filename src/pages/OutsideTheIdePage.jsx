import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { gearCatalogData } from '../data/projectData';
import GearCard from '../components/common/GearCard';
import WaveBackground from '../components/common/WaveBackground';
import { useModal } from '../context/ModalContext';

export default function OutsideTheIdePage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('bento'); // 'bento' | 'lookbook'
  const [showAssetGuide, setShowAssetGuide] = useState(false);
  const { openLightbox } = useModal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = useMemo(() => [
    {
      id: 'desk',
      title: 'Desk Setup & Battlestation'
    },
    {
      id: 'edc',
      title: 'Everyday Carry & Fitness'
    },
    {
      id: 'rituals',
      title: 'Sensory Architecture & Olfactory Chemistry'
    }
  ], []);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return gearCatalogData;
    return gearCatalogData.filter((item) => item.section === activeFilter);
  }, [activeFilter]);

  // Flatten all photos for the lookbook view
  const allPhotos = useMemo(() => {
    const photos = [];
    gearCatalogData.forEach((item) => {
      if (activeFilter === 'all' || item.section === activeFilter) {
        if (item.images && item.images.length > 0) {
          item.images.forEach((img, idx) => {
            photos.push({
              ...img,
              itemId: item.id,
              itemTitle: item.title,
              category: item.category,
              photoIndex: idx + 1,
              totalPhotos: item.images.length,
              icon: item.icon
            });
          });
        }
      }
    });
    return photos;
  }, [activeFilter]);

  const counts = useMemo(() => {
    return {
      all: gearCatalogData.length,
      desk: gearCatalogData.filter((i) => i.section === 'desk').length,
      edc: gearCatalogData.filter((i) => i.section === 'edc').length,
      rituals: gearCatalogData.filter((i) => i.section === 'rituals').length
    };
  }, []);

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
          <header className="gear-header-block" style={{ marginBottom: '24px' }}>
            <h1 className="profile-title gear-main-title" style={{ marginBottom: 0 }}>
              Outside the IDE
            </h1>
          </header>

          {/* Controls Bar: Category Filters + View Mode Switcher */}
          <div className="gear-controls-container">
            {/* Category Filter Pills */}
            <div className="gear-filter-bar" role="tablist" aria-label="Filter gear and photo categories">
              <button
                type="button"
                role="tab"
                aria-selected={activeFilter === 'all'}
                className={`gear-filter-btn font-mono ${activeFilter === 'all' ? 'is-active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All Items <span className="btn-count">({counts.all})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeFilter === 'desk'}
                className={`gear-filter-btn font-mono ${activeFilter === 'desk' ? 'is-active' : ''}`}
                onClick={() => setActiveFilter('desk')}
              >
                Desk Setup <span className="btn-count">({counts.desk})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeFilter === 'edc'}
                className={`gear-filter-btn font-mono ${activeFilter === 'edc' ? 'is-active' : ''}`}
                onClick={() => setActiveFilter('edc')}
              >
                Everyday &amp; Fitness <span className="btn-count">({counts.edc})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeFilter === 'rituals'}
                className={`gear-filter-btn font-mono ${activeFilter === 'rituals' ? 'is-active' : ''}`}
                onClick={() => setActiveFilter('rituals')}
              >
                Olfactory &amp; Scent <span className="btn-count">({counts.rituals})</span>
              </button>
            </div>

            {/* View Mode Toggle: Bento vs Lookbook */}
            <div className="gear-view-switch font-mono">
              <button
                type="button"
                className={`view-switch-btn ${viewMode === 'bento' ? 'is-active' : ''}`}
                onClick={() => setViewMode('bento')}
                title="Bento Card & Specs View"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>BENTO</span>
              </button>
              <button
                type="button"
                className={`view-switch-btn ${viewMode === 'lookbook' ? 'is-active' : ''}`}
                onClick={() => setViewMode('lookbook')}
                title="Pure Photography Lookbook View"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>LOOKBOOK</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          {viewMode === 'bento' ? (
            /* Bento & Specs Gallery View */
            <div className="gear-catalog-container">
              {activeFilter === 'all' ? (
                sections.map((section) => {
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
                })
              ) : (
                <div className="gear-filtered-view">
                  <div className="gear-category-header">
                    <h2 className="gear-section-heading font-mono">
                      {sections.find((s) => s.id === activeFilter)?.title}
                    </h2>
                  </div>
                  <div className="gear-bento-grid">
                    {filteredItems.map((item) => (
                      <GearCard key={item.id} item={item} featured={item.featured} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Lookbook Pure Photography Grid */
            <div className="gear-lookbook-container">
              <div className="gear-lookbook-header">
                <span className="font-mono text-faint" style={{ fontSize: '11px', letterSpacing: '0.08em' }}>
                  SHOWING {allPhotos.length} HIGH-RESOLUTION PHOTOGRAPHY FRAMES (CLICK TO EXPAND LIGHTBOX)
                </span>
              </div>
              <div className="gear-lookbook-grid">
                {allPhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="lookbook-card group"
                    onClick={() => openLightbox(photo.src, `${photo.itemTitle} — ${photo.caption}`)}
                    style={{ cursor: 'zoom-in' }}
                  >
                    <div className="lookbook-media-wrap">
                      <img
                        src={photo.src}
                        alt={photo.alt || photo.itemTitle}
                        className="lookbook-img"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="lookbook-fallback-schematic font-mono" style={{ display: 'none' }}>
                        <span className="camera-icon">📸</span>
                        <span className="photo-title">{photo.itemTitle}</span>
                        <span className="photo-path text-faint">{photo.src}</span>
                      </div>
                      <div className="lookbook-overlay">
                        <span className="lookbook-tag font-mono">{photo.category}</span>
                        <h4 className="lookbook-title">{photo.itemTitle}</h4>
                        <p className="lookbook-caption">{photo.caption}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photo Drop-in Helper Guide Toggle */}
          <div className="gear-asset-helper-block">
            <button
              type="button"
              className="gear-helper-toggle font-mono"
              onClick={() => setShowAssetGuide(!showAssetGuide)}
            >
              <span>{showAssetGuide ? '[-] HIDE PHOTO DIRECTORY GUIDE' : '[+] PHOTO DIRECTORY GUIDE (/public/images/outside/)'}</span>
            </button>
            {showAssetGuide && (
              <div className="gear-helper-content font-mono">
                <p className="helper-intro">
                  To load your real photos into these slots, place your images in <code>/public/images/outside/</code> matching the filenames below:
                </p>
                <div className="helper-files-grid">
                  {gearCatalogData.map((item) => (
                    <div key={item.id} className="helper-row">
                      <span className="helper-name">{item.title}:</span>
                      <code className="helper-path">
                        {item.images && item.images.length > 0 ? item.images.map((i) => i.src).join(', ') : `/images/outside/${item.id}.jpg`}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Return CTA Footer */}
          <div className="gear-footer-nav" style={{ marginTop: '64px', textAlign: 'center' }}>
            <Link to="/" className="btn btn-primary font-mono" style={{ padding: '14px 32px' }}>
              ← Return to Main Portfolio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
