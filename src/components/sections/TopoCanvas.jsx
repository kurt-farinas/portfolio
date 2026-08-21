/* ========================================
   TOPO CANVAS  |  3D Interactive Wave Relief with Cursor Physics
   High-performance procedural topography with radial cursor ripple
   ======================================== */

import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function TopoCanvas() {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    let width = 0;
    let height = 0;
    let animationFrameId = null;
    let isVisible = true;
    let lastFrameTime = performance.now();
    let time = 0;

    // Smooth cursor coordinates
    let targetCursorX = -1000;
    let targetCursorY = -1000;
    let cursorX = -1000;
    let cursorY = -1000;
    let cursorSpeed = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      canvas.width = Math.floor(width);
      canvas.height = Math.floor(height);
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();

    const onMouseMove = (e) => {
      if (!isVisible) return;
      const rect = canvas.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;

      const dx = newX - lastMouseX;
      const dy = newY - lastMouseY;
      cursorSpeed = Math.min(1.5, Math.sqrt(dx * dx + dy * dy) * 0.04);
      lastMouseX = newX;
      lastMouseY = newY;

      targetCursorX = newX;
      targetCursorY = newY;
    };

    const onMouseLeave = () => {
      targetCursorX = -1000;
      targetCursorY = -1000;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    // Intersection observer to pause rendering when scrolled past hero
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      isVisible = entry.isIntersecting;
      if (isVisible && !animationFrameId) {
        lastFrameTime = performance.now();
        animationFrameId = requestAnimationFrame(draw);
      } else if (!isVisible && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }, { threshold: 0.05 });

    observer.observe(canvas.parentElement || canvas);

    const numLines = 26;
    const segments = 48;
    const rippleRadius = 240;

    const draw = (currentTime) => {
      if (!isVisible) {
        animationFrameId = null;
        return;
      }

      const delta = Math.min(0.1, (currentTime - lastFrameTime) / 1000);
      lastFrameTime = currentTime;
      time += delta * 0.55;

      // Smooth cursor interpolation
      cursorX += (targetCursorX - cursorX) * 0.12;
      cursorY += (targetCursorY - cursorY) * 0.12;
      cursorSpeed *= 0.94;

      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const bgColor = isLight ? '#F4F4F5' : '#08080A';
      const baseLineColor = isLight ? 'rgba(24, 24, 27, 0.075)' : 'rgba(255, 255, 255, 0.075)';

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      const centerY = height * 0.5;
      const stepY = (height * 0.85) / numLines;

      for (let i = 0; i < numLines; i++) {
        const lineFraction = i / (numLines - 1);
        const baseY = centerY - (height * 0.4) + (i * stepY);

        ctx.beginPath();
        for (let j = 0; j <= segments; j++) {
          const xFraction = j / segments;
          const x = xFraction * width;

          // Ambient natural wave motion
          const wave1 = Math.sin(xFraction * 4.5 + time + i * 0.22) * 16;
          const wave2 = Math.cos(xFraction * 2.8 - time * 0.8 + i * 0.14) * 10;
          const centerDist = Math.abs(xFraction - 0.5) * 2;
          const centerFalloff = 1 - Math.pow(centerDist, 2.2);

          // Interactive Cursor Ripple Calculation
          const dx = x - cursorX;
          const dy = baseY - cursorY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let rippleDisplacement = 0;

          if (dist < rippleRadius && cursorX > -500) {
            const norm = dist / rippleRadius;
            const waveStrength = (1 - norm) * (24 + cursorSpeed * 18);
            // Ripple wave crests and troughs
            rippleDisplacement = Math.cos(norm * Math.PI * 3.2 - time * 4) * waveStrength;
          }

          const y = baseY + ((wave1 + wave2) * centerFalloff) + rippleDisplacement;

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = baseLineColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      observer.disconnect();
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="topo-canvas" aria-hidden="true" />;
}
