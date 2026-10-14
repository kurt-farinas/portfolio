import React, { useEffect, useRef, useState } from 'react';

const EFFECT_LIFETIME_MS = 240;
const RIPPLE_LAYERS = [
  { key: 'outer', className: 'cursor-click-ripple' },
  { key: 'second', className: 'cursor-click-ripple cursor-click-ripple-second' },
  { key: 'third', className: 'cursor-click-ripple cursor-click-ripple-third' },
  { key: 'fourth', className: 'cursor-click-ripple cursor-click-ripple-fourth' },
  { key: 'inner', className: 'cursor-click-ripple cursor-click-ripple-inner' }
];

export default function CustomCursor() {
  const [effects, setEffects] = useState([]);
  const nextId = useRef(0);
  const timers = useRef(new Map());

  useEffect(() => {
    const handlePointerDown = event => {
      if (!event.isPrimary || event.button !== 0) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const id = ++nextId.current;
      setEffects(current => [...current, { id, x: event.clientX, y: event.clientY }]);
      const timer = window.setTimeout(() => {
        timers.current.delete(id);
        setEffects(current => current.filter(effect => effect.id !== id));
      }, EFFECT_LIFETIME_MS);
      timers.current.set(id, timer);
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      timers.current.forEach(timer => window.clearTimeout(timer));
      timers.current.clear();
    };
  }, []);

  return (
    <div className="cursor-click-effects" aria-hidden="true">
      {effects.map(effect => (
        <span
          className="cursor-click-effect"
          key={effect.id}
          style={{ left: `${effect.x}px`, top: `${effect.y}px` }}
        >
          {RIPPLE_LAYERS.map(layer => <span className={layer.className} key={layer.key} />)}
        </span>
      ))}
    </div>
  );
}
