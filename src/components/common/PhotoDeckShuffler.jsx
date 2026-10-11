/* ========================================
   PHOTO DECK SHUFFLER
   Immediate cycling with pointer and keyboard controls and whole-pixel dragging.
   ======================================== */

import DitherImage from './DitherImage';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useModal } from '../../context/ModalContext';

export default function PhotoDeckShuffler({ photos = [] }) {
  const { openLightbox } = useModal();

  // Active deck order
  const [deck, setDeck] = useState(photos);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [imgErrors, setImgErrors] = useState({});

  const dragStartRef = useRef({ x: 0, y: 0, time: 0 });
  const isPointerDownRef = useRef(false);
  const hasMovedRef = useRef(false);
  const currentDragOffsetRef = useRef({ x: 0, y: 0 });

  // Sync if photos prop changes
  useEffect(() => {
    setDeck(photos);
  }, [photos]);

  const handleNextCard = useCallback(() => {
    setDeck(previous => previous.length > 1 ? [...previous.slice(1), previous[0]] : previous);
    setDragOffset({ x: 0, y: 0 });
    currentDragOffsetRef.current = { x: 0, y: 0 };
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      handleNextCard('right');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleNextCard('left');
    }
  };

  // Pointer drag event handlers for gesture swipe
  const onPointerDown = (e) => {
    isPointerDownRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isPointerDownRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
    }

    currentDragOffsetRef.current = { x: dx, y: dy * 0.35 };
    setDragOffset({ x: dx, y: dy * 0.35 });
  };

  const onPointerUp = (e) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    const dx = currentDragOffsetRef.current.x;
    const dy = currentDragOffsetRef.current.y;
    const elapsed = Date.now() - dragStartRef.current.time;
    const velocity = Math.abs(dx) / (elapsed || 1);

    // Ultra-responsive swipe threshold (> 40px or quick flick velocity > 0.3)
    if (Math.abs(dx) > 40 || velocity > 0.3) {
      const dir = dx < 0 ? 'left' : 'right';
      handleNextCard(dir, dx, dy);
    } else {
      // Smooth spring back to center
      setDragOffset({ x: 0, y: 0 });
      currentDragOffsetRef.current = { x: 0, y: 0 };
    }
  };

  const handleCardClick = (card) => {
    if (!hasMovedRef.current) {
      // Instant next card shuffle without delay
      handleNextCard('right');
    }
  };

  const handleDoubleClick = (card, e) => {
    e.stopPropagation();
    openLightbox(card.src, card.caption || card.title, null, null);
  };

  if (!deck || deck.length === 0) return null;

  // Render up to 4 stacked photo cards
  const visibleCards = deck.slice(0, 4);

  return (
    <div
      className="photo-deck-wrapper"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Interactive Photo Stack (Swipe or drag to shuffle)"
    >
      <div className="photo-deck-stack">
        {/* Render Active Stack Cards */}
        {visibleCards.map((card, stackIndex) => {
          const isTop = stackIndex === 0;
          let cardStyle = {};
          let cardClass = `deck-photo-card deck-stack-level-${stackIndex}`;

          if (isTop && isDragging) {

            cardStyle = {
              transform: `translate3d(${Math.round(dragOffset.x)}px, ${Math.round(dragOffset.y)}px, 0)`,
              cursor: 'grabbing',
              transition: 'none'
            };
          }

          const hasFailed = imgErrors[card.id];

          return (
            <div
              key={card.id}
              className={cardClass}
              style={cardStyle}
              onPointerDown={isTop ? onPointerDown : undefined}
              onPointerMove={isTop ? onPointerMove : undefined}
              onPointerUp={isTop ? onPointerUp : undefined}
              onPointerCancel={isTop ? onPointerUp : undefined}
              onClick={isTop ? () => handleCardClick(card) : undefined}
              onDoubleClick={isTop ? (e) => handleDoubleClick(card, e) : undefined}
            >
              {!hasFailed ? (
                <DitherImage
                  src={card.src}
                  alt={card.alt || card.title}
                  className="deck-photo-img"
                  loading={stackIndex === 0 ? 'eager' : 'lazy'}
                  onError={() => setImgErrors((prev) => ({ ...prev, [card.id]: true }))}
                  draggable="false"
                />
              ) : (
                <div className="deck-photo-fallback font-mono">
                  <div className="fallback-icon">📷</div>
                  <div className="fallback-title">{card.title}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="studio-photo-controls">
        <button type="button" onClick={() => handleNextCard('right')}>Next photo</button>
        <button type="button" onClick={() => openLightbox(deck[0].src, deck[0].caption || deck[0].title)}>View photo</button>
      </div>
    </div>
  );
}
