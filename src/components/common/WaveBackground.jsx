/* ========================================
   WAVE BACKGROUND  |  Interactive 3D Harmonic Wave Lines
   Ultra-high performance 60fps canvas contour field
   ======================================== */

import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function WaveBackground() {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0;
    let height = 0;
    let animationFrameId = null;
    let isVisible = true;

    let cursorX = -1000;
    let cursorY = -1000;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();

    const handleMouseMove = (e) => {
      if (!isVisible) return;
      const rect = canvas.getBoundingClientRect();
      cursorX = e.clientX - rect.left;
      cursorY = e.clientY - rect.top;
      targetMouseX = (e.clientX / width - 0.5) * 30;
      targetMouseY = (e.clientY / height - 0.5) * 30;
    };

    const handleMouseLeave = () => {
      cursorX = -1000;
      cursorY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // Pause rendering when hero is out of view
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      isVisible = entry.isIntersecting;
      if (isVisible && !animationFrameId) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      } else if (!isVisible && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }, { threshold: 0.05 });

    observer.observe(canvas.parentElement || canvas);

    const numLines = 10;
    const segments = 45;
    let time = 0;
    let lastTime = performance.now();

    const render = (currentTime) => {
      if (!isVisible) {
        animationFrameId = null;
        return;
      }

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      time += delta * 0.38;

      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const isLight = document.documentElement.getAttribute('data-theme') === 'light' || theme === 'light';

      const baseRgb = isLight ? '30, 35, 45' : '255, 255, 255';
      const accentRgb = isLight ? '70, 80, 100' : '220, 230, 255';

      // Background ambient gradient glow
      const radialGlow = ctx.createRadialGradient(
        width * 0.5 + currentMouseX * 1.5,
        height * 0.4 + currentMouseY * 1.5,
        20,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.65
      );

      if (isLight) {
        radialGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        radialGlow.addColorStop(0.5, 'rgba(245, 247, 250, 0.3)');
        radialGlow.addColorStop(1, 'rgba(235, 238, 243, 0)');
      } else {
        radialGlow.addColorStop(0, 'rgba(255, 255, 255, 0.025)');
        radialGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.008)');
        radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      const lineSpacing = height / (numLines * 0.75);
      const startY = height * 0.08;
      const stepX = (width + 200) / segments;

      for (let i = 0; i < numLines; i++) {
        const baseY = startY + i * lineSpacing;
        const normalizedIndex = i / numLines;
        
        // Arch distribution: higher opacity in the center field
        const centerProximity = 1 - Math.abs(normalizedIndex - 0.5) * 1.6;
        const baseAlpha = Math.max(0.03, centerProximity * (isLight ? 0.16 : 0.20));

        ctx.beginPath();

        for (let j = 0; j <= segments; j++) {
          const x = -100 + j * stepX;
          const nx = (x / width) * 3.6;
          const ny = (baseY / height) * 2.8;

          // Harmonic wave equation for liquid organic undulation
          const waveA = Math.sin(nx * 1.6 + ny * 2.1 + time * 1.1) * 38;
          const waveB = Math.cos(nx * 2.8 - ny * 1.5 + time * 0.75 + i * 0.05) * 24;
          const waveC = Math.sin(nx * 0.9 + ny * 3.4 + time * 1.4 - i * 0.08) * 32;

          // Interactive cursor displacement & proximity ripples
          const dx = x - cursorX;
          const dy = baseY - cursorY;
          const distSq = dx * dx + dy * dy;
          let ripple = 0;
          const rippleRadius = 240;
          if (distSq < rippleRadius * rippleRadius) {
            const dist = Math.sqrt(distSq);
            const factor = 1 - dist / rippleRadius;
            ripple = Math.sin(dist * 0.05 - time * 3.8) * (factor * factor) * 26;
          }

          const y = baseY + waveA + waveB + waveC + ripple;

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        const isAccent = i % 3 === 0;
        const strokeColor = isAccent ? accentRgb : baseRgb;
        const finalAlpha = isAccent ? baseAlpha * 1.25 : baseAlpha;

        ctx.strokeStyle = `rgba(${strokeColor}, ${finalAlpha})`;
        ctx.lineWidth = isAccent ? 1.4 : 1.0;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="topo-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
}
