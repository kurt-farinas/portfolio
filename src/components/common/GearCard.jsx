/* ========================================
   GEAR & PHOTO CARD COMPONENT
   Photo-rich product & lifestyle card with multi-image slider, 
   lightbox zoom, and schematic blueprint fallbacks
   ======================================== */

import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';

function GearSchematic({ icon, title }) {
  switch (icon) {
    case 'keyboard':
      return (
        <svg viewBox="0 0 120 70" fill="none" className="gear-schematic-svg" aria-label={title}>
          <rect x="10" y="10" width="100" height="50" rx="8" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" fill="currentColor" fillOpacity="0.04" />
          <rect x="16" y="16" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="31" y="16" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="42" y="16" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="53" y="16" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="64" y="16" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="75" y="16" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="86" y="16" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          
          <rect x="16" y="27" width="15" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="34" y="27" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="45" y="27" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="56" y="27" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="67" y="27" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="78" y="27" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="89" y="27" width="15" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          
          <rect x="16" y="38" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="37" y="38" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="48" y="38" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="59" y="38" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="70" y="38" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="81" y="38" width="23" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          
          <rect x="16" y="49" width="14" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="33" y="49" width="10" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="46" y="49" width="34" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.8" fill="currentColor" fillOpacity="0.12" />
          <rect x="83" y="49" width="10" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
          <rect x="96" y="49" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
        </svg>
      );
    case 'mouse':
      return (
        <svg viewBox="0 0 120 70" fill="none" className="gear-schematic-svg" aria-label={title}>
          <path d="M45 14C45 8.5 51.5 5 60 5C68.5 5 75 8.5 75 14V48C75 58 68.5 65 60 65C51.5 65 45 58 45 48V14Z" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" fill="currentColor" fillOpacity="0.04" />
          <line x1="60" y1="5" x2="60" y2="30" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
          <path d="M45 28C52 30 68 30 75 28" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
          <rect x="57" y="12" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" fill="currentColor" fillOpacity="0.15" />
          <path d="M42 34C44 42 44 48 42 54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
          <path d="M78 34C76 42 76 48 78 54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
        </svg>
      );
    case 'display':
      return (
        <svg viewBox="0 0 120 70" fill="none" className="gear-schematic-svg" aria-label={title}>
          <rect x="15" y="8" width="90" height="48" rx="4" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" fill="currentColor" fillOpacity="0.04" />
          <rect x="18" y="11" width="84" height="42" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
          <path d="M25 32L38 32L44 22L52 42L60 26L68 36L74 32L95 32" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" />
          <path d="M55 56V62H42L38 66H82L78 62H65V56" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" />
        </svg>
      );
    case 'audio':
      return (
        <svg viewBox="0 0 120 70" fill="none" className="gear-schematic-svg" aria-label={title}>
          <path d="M38 18C46 16 54 22 52 34C50 44 40 50 32 46C24 42 22 30 28 22C31 19 34 18 38 18Z" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" fill="currentColor" fillOpacity="0.04" />
          <circle cx="38" cy="32" r="7" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" />
          <path d="M48 18L52 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.6" />
          <path d="M82 18C74 16 66 22 68 34C70 44 80 50 88 46C96 42 98 30 92 22C89 19 86 18 82 18Z" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" fill="currentColor" fillOpacity="0.04" />
          <circle cx="82" cy="32" r="7" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" />
          <path d="M72 18L68 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.6" />
          <path d="M52 10C55 4 65 4 68 10" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2" strokeOpacity="0.5" />
        </svg>
      );
    case 'laptop':
      return (
        <svg viewBox="0 0 120 70" fill="none" className="gear-schematic-svg" aria-label={title}>
          <rect x="28" y="12" width="64" height="40" rx="3" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" fill="currentColor" fillOpacity="0.04" />
          <rect x="33" y="17" width="54" height="30" rx="1.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
          <text x="60" y="35" textAnchor="middle" fill="currentColor" fillOpacity="0.75" fontFamily="monospace" fontSize="8" fontWeight="bold">TUF // A15</text>
          <path d="M18 54L26 52H94L102 54C104 55 103 57 100 57H20C17 57 16 55 18 54Z" stroke="currentColor" strokeWidth="1.8" strokeOpacity="0.8" fill="currentColor" fillOpacity="0.08" />
          <rect x="52" y="53" width="16" height="2" rx="1" fill="currentColor" fillOpacity="0.5" />
        </svg>
      );
    case 'cpu':
      return (
        <svg viewBox="0 0 120 70" fill="none" className="gear-schematic-svg" aria-label={title}>
          <rect x="35" y="10" width="50" height="50" rx="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" fill="currentColor" fillOpacity="0.04" />
          <rect x="43" y="18" width="34" height="34" rx="3" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" />
          <text x="60" y="38" textAnchor="middle" fill="currentColor" fillOpacity="0.7" fontFamily="monospace" fontSize="9" fontWeight="bold">RIG // X</text>
          <line x1="42" y1="5" x2="42" y2="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="51" y1="5" x2="51" y2="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="60" y1="5" x2="60" y2="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="69" y1="5" x2="69" y2="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="78" y1="5" x2="78" y2="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="42" y1="60" x2="42" y2="65" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="51" y1="60" x2="51" y2="65" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="60" y1="60" x2="60" y2="65" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="69" y1="60" x2="69" y2="65" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="78" y1="60" x2="78" y2="65" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
        </svg>
      );
    case 'dumbbell':
      return (
        <svg viewBox="0 0 120 70" fill="none" className="gear-schematic-svg" aria-label={title}>
          <line x1="28" y1="35" x2="92" y2="35" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.8" />
          <rect x="52" y="32" width="16" height="6" rx="1" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" fill="currentColor" fillOpacity="0.1" />
          <rect x="22" y="16" width="6" height="38" rx="2" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.7" fill="currentColor" fillOpacity="0.08" />
          <rect x="14" y="22" width="6" height="26" rx="2" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.6" fill="currentColor" fillOpacity="0.06" />
          <rect x="92" y="16" width="6" height="38" rx="2" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.7" fill="currentColor" fillOpacity="0.08" />
          <rect x="100" y="22" width="6" height="26" rx="2" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.6" fill="currentColor" fillOpacity="0.06" />
        </svg>
      );
    case 'smartphone':
      return (
        <svg viewBox="0 0 120 70" fill="none" className="gear-schematic-svg" aria-label={title}>
          <rect x="42" y="8" width="36" height="54" rx="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" fill="currentColor" fillOpacity="0.04" />
          <line x1="54" y1="12" x2="66" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
          <rect x="46" y="18" width="28" height="38" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
          <circle cx="60" cy="37" r="5" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
        </svg>
      );
    case 'gamepad':
      return (
        <svg viewBox="0 0 120 70" fill="none" className="gear-schematic-svg" aria-label={title}>
          <path d="M30 18C40 14 80 14 90 18C100 22 104 46 96 58C90 66 78 58 72 48C68 46 52 46 48 48C42 58 30 66 24 58C16 46 20 22 30 18Z" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" fill="currentColor" fillOpacity="0.04" />
          <path d="M35 32H43M39 28V36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
          <circle cx="79" cy="30" r="1.8" fill="currentColor" fillOpacity="0.7" />
          <circle cx="85" cy="34" r="1.8" fill="currentColor" fillOpacity="0.7" />
          <circle cx="73" cy="34" r="1.8" fill="currentColor" fillOpacity="0.7" />
          <circle cx="79" cy="38" r="1.8" fill="currentColor" fillOpacity="0.7" />
        </svg>
      );
    case 'perfume':
      return (
        <svg viewBox="0 0 120 70" fill="none" className="gear-schematic-svg" aria-label={title}>
          <rect x="52" y="6" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" strokeOpacity="0.7" fill="currentColor" fillOpacity="0.1" />
          <rect x="56" y="16" width="8" height="4" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.6" />
          <rect x="36" y="20" width="48" height="44" rx="4" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" fill="currentColor" fillOpacity="0.04" />
          <rect x="42" y="26" width="36" height="32" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
          <line x1="42" y1="46" x2="78" y2="46" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 120 70" fill="none" className="gear-schematic-svg" aria-label={title}>
          <rect x="25" y="12" width="70" height="46" rx="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.6" fill="currentColor" fillOpacity="0.04" />
          <circle cx="60" cy="35" r="12" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
        </svg>
      );
  }
}

export default function GearCard({ item }) {
  const { openLightbox } = useModal();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [imgLoadFailed, setImgLoadFailed] = useState(false);

  const images = item.images && item.images.length > 0 ? item.images : [];
  const currentPhoto = images[activePhotoIdx] || null;
  const hasMultiplePhotos = images.length > 1;

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setImgLoadFailed(false);
    setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setImgLoadFailed(false);
    setActivePhotoIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleZoom = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (currentPhoto && !imgLoadFailed) {
      openLightbox(
        currentPhoto.src,
        currentPhoto.caption || item.title,
        item.url,
        'PRODUCT LINK'
      );
    }
  };

  return (
    <article className="gear-card group">
      {/* Top Square White Showcase Frame */}
      <div 
        className="gear-media-box" 
        onClick={currentPhoto && !imgLoadFailed ? handleZoom : undefined}
        style={{ cursor: currentPhoto && !imgLoadFailed ? 'zoom-in' : 'default' }}
      >
        {currentPhoto && !imgLoadFailed ? (
          <div className="gear-photo-container">
            <img
              src={currentPhoto.src}
              alt={currentPhoto.alt || item.title}
              className="gear-photo-img"
              loading="lazy"
              onError={() => setImgLoadFailed(true)}
            />
            {/* Zoom Action Icon Indicator on Hover */}
            <div className="gear-photo-zoom-hint" title="Click to expand fullscreen">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </div>
          </div>
        ) : (
          <div className="gear-schematic-frame">
            <GearSchematic icon={item.icon} title={item.title} />
          </div>
        )}

        {/* Multi-Photo Navigation Controls */}
        {hasMultiplePhotos && (
          <div className="gear-photo-controls" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="gear-photo-nav-btn prev"
              onClick={handlePrevPhoto}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <div className="gear-photo-dots">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`gear-photo-dot ${idx === activePhotoIdx ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgLoadFailed(false);
                    setActivePhotoIdx(idx);
                  }}
                  aria-label={`Jump to photo ${idx + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              className="gear-photo-nav-btn next"
              onClick={handleNextPhoto}
              aria-label="Next photo"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* Card Content: Title + Arrow & Specs */}
      <div className="gear-info-block">
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="gear-title-link"
            title={`Open ${item.title} product link`}
          >
            <div className="gear-title-row">
              <h3 className="gear-title">{item.title}</h3>
              <span className="gear-arrow" aria-hidden="true">↗</span>
            </div>
          </a>
        ) : (
          <div className="gear-title-row">
            <h3 className="gear-title">{item.title}</h3>
          </div>
        )}
        <p className="gear-specs-text">{item.specs}</p>
      </div>
    </article>
  );
}
