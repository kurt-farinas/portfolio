import PortfolioImage from './PortfolioImage';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useModal } from '../../context/ModalContext';
import { useOptionalDesktopWorkspace } from '../../context/DesktopWorkspaceContext';

export default function PhotoDeckShuffler({ photos = [] }) {
  const { openLightbox } = useModal();
  const desktopWorkspace = useOptionalDesktopWorkspace();
  const getAppState = desktopWorkspace?.getAppState;
  const saveAppState = desktopWorkspace?.setAppState;
  const [deck, setDeckInternal] = useState(() => getAppState ? getAppState('after-hours.photoDeck', photos) : photos);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [imgErrors, setImgErrors] = useState({});
  const dragStartRef = useRef({ x: 0, y: 0, time: 0 });
  const isPointerDownRef = useRef(false);
  const hasMovedRef = useRef(false);
  const currentDragOffsetRef = useRef({ x: 0, y: 0 });
  // A single click shuffles only after the double-click window, so a double-click opens the photo it started on.
  const clickTimerRef = useRef(0);
  useEffect(() => () => clearTimeout(clickTimerRef.current), []);

  const setDeck = useCallback(update => setDeckInternal(current => {
    const next = typeof update === 'function' ? update(current) : update;
    saveAppState?.('after-hours.photoDeck', next);
    return next;
  }), [saveAppState]);

  const handleNextCard = useCallback(() => {
    setDeck((previous) => previous.length > 1 ? [...previous.slice(1), previous[0]] : previous);
    setDragOffset({ x: 0, y: 0 });
    currentDragOffsetRef.current = { x: 0, y: 0 };
  }, []);

  const handleKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowRight' || event.key === ' ') {
      event.preventDefault();
      handleNextCard();
    } else if (event.key === 'Enter' && deck[0]) {
      event.preventDefault();
      openLightbox(deck[0].src, deck[0].caption || deck[0].title);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setDeck((previous) => previous.length > 1 ? [previous[previous.length - 1], ...previous.slice(0, -1)] : previous);
    }
  };

  const onPointerDown = (event) => {
    isPointerDownRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: event.clientX, y: event.clientY, time: Date.now() };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!isPointerDownRef.current) return;
    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMovedRef.current = true;
    currentDragOffsetRef.current = { x: dx, y: dy * 0.35 };
    setDragOffset(currentDragOffsetRef.current);
  };

  const onPointerUp = (event) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDragging(false);
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch (_) {}

    const { x, y } = currentDragOffsetRef.current;
    const elapsed = Date.now() - dragStartRef.current.time;
    if (Math.abs(x) > 40 || Math.abs(x) / (elapsed || 1) > 0.3) {
      handleNextCard();
    } else {
      setDragOffset({ x: 0, y: 0 });
      currentDragOffsetRef.current = { x: 0, y: 0 };
    }
  };

  if (!deck.length) return null;
  const visibleCards = deck.slice(0, 3);

  return (
    <div className="photo-deck-wrapper">
      <div className="photo-deck-stack" tabIndex={0} onKeyDown={handleKeyDown} role="region" aria-label="Interactive photo stack. Drag or use arrow keys to browse; Enter or double-click opens the photo.">
        {visibleCards.map((card, stackIndex) => {
          const isTop = stackIndex === 0;
          const cardStyle = isTop && isDragging
            ? { transform: `translate3d(${Math.round(dragOffset.x)}px, ${Math.round(dragOffset.y)}px, 0)`, transition: 'none' }
            : undefined;

          return (
            <div
              key={card.id}
              className={`deck-photo-card deck-stack-level-${stackIndex}`}
              style={cardStyle}
              onPointerDown={isTop ? onPointerDown : undefined}
              onPointerMove={isTop ? onPointerMove : undefined}
              onPointerUp={isTop ? onPointerUp : undefined}
              onPointerCancel={isTop ? onPointerUp : undefined}
              onClick={isTop ? (event) => {
                if (hasMovedRef.current || event.detail > 1) return;
                clearTimeout(clickTimerRef.current);
                clickTimerRef.current = setTimeout(handleNextCard, 250);
              } : undefined}
              onDoubleClick={isTop ? (event) => { event.stopPropagation(); clearTimeout(clickTimerRef.current); openLightbox(card.src, card.caption || card.title); } : undefined}
            >
              {!imgErrors[card.id] ? (
                <PortfolioImage
                  src={card.src}
                  alt={card.alt || card.title}
                  className="deck-photo-img"
                  loading={stackIndex === 0 ? 'eager' : 'lazy'}
                  onError={() => setImgErrors((previous) => ({ ...previous, [card.id]: true }))}
                  draggable="false"
                />
              ) : (
                <div className="deck-photo-fallback" aria-hidden="true">Photo unavailable</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
