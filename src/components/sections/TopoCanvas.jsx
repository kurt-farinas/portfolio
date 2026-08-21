/* ========================================
   TOPO CANVAS  |  3D Organic Wave Relief (High Performance)
   Pauses automatically when scrolled out of view
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

    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      const dpr = 1.0;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();

    const onMouseMove = (e) => {
      if (!isVisible) return;
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 16;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 16;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Intersection observer to pause off-screen rendering
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

    const numLines = 22;
    const segments = 36;

    const draw = (currentTime) => {
      if (!isVisible) {
        animationFrameId = null;
        return;
      }

      const delta = (currentTime - lastFrameTime) / 1000;
      lastFrameTime = currentTime;
      time += delta * 0.45;

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const bgColor = isLight ? '#FAF9F6' : '#08080A';
      const ridgeColor = isLight ? 'rgba(0, 0, 0, 0.07)' : 'rgba(255, 255, 255, 0.07)';

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      const centerY = height * 0.52;
      const stepY = (height * 0.75) / numLines;

      for (let i = 0; i < numLines; i++) {
        const lineFraction = i / (numLines - 1);
        const baseY = centerY - (height * 0.35) + (i * stepY);

        ctx.beginPath();
        for (let j = 0; j <= segments; j++) {
          const xFraction = j / segments;
          const x = xFraction * width;

          const wave1 = Math.sin(xFraction * 4.2 + time + i * 0.28) * 18;
          const wave2 = Math.cos(xFraction * 2.5 - time * 0.7 + i * 0.15) * 12;
          const centerDist = Math.abs(xFraction - 0.5) * 2;
          const centerFalloff = 1 - Math.pow(centerDist, 2);

          const y = baseY + (wave1 + wave2) * centerFalloff + (mouseY * (1 - lineFraction));

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = ridgeColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return <canvas ref={canvasRef} id="topoCanvas" className="topo-canvas" />;
}
