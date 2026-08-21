/* ========================================
   CUSTOM CURSOR  |  Tactile Hardware-Accelerated Pointer
   Disabled on touch/coarse devices for standard system ergonomics
   ======================================== */

import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const cursorDotRef = useRef(null);

  useEffect(() => {
    // Detect touch / coarse pointer devices
    const checkTouch = () => {
      const isCoarse =
        typeof window !== 'undefined' &&
        (window.matchMedia('(pointer: coarse)').matches ||
         window.matchMedia('(hover: none)').matches ||
         'ontouchstart' in window);
      setIsTouchDevice(isCoarse);
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);

    if (isTouchDevice) return () => window.removeEventListener('resize', checkTouch);

    const cursor = cursorDotRef.current;
    if (!cursor) return () => window.removeEventListener('resize', checkTouch);

    let mouseX = -100;
    let mouseY = -100;
    let isHovered = false;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      cursor.style.opacity = '1';
    };

    const onMouseLeave = () => {
      cursor.style.opacity = '0';
    };

    const onMouseOver = (e) => {
      const target = e.target;
      const isInteractive = target.closest('a, button, [role="button"], input, textarea, .ticket, .stack-pill, .award-card, .beyond-card');
      if (isInteractive && !isHovered) {
        isHovered = true;
        cursor.classList.add('cursor-hover');
      } else if (!isInteractive && isHovered) {
        isHovered = false;
        cursor.classList.remove('cursor-hover');
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseover', onMouseOver, { passive: true });

    return () => {
      window.removeEventListener('resize', checkTouch);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseover', onMouseOver);
    };
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <div
      ref={cursorDotRef}
      className="custom-cursor-dot"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: 'var(--text)',
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: 'difference',
        transition: 'transform 0.05s ease-out, width 0.2s ease, height 0.2s ease, opacity 0.2s ease',
        transform: 'translate3d(-100px, -100px, 0)',
        opacity: 0,
        willChange: 'transform'
      }}
    />
  );
}
