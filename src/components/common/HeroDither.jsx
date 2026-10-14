import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const HeroMotionContext = createContext();
export function HeroMotionProvider({ children }) {
  const played = useRef(false);
  return <HeroMotionContext.Provider value={played}>{children}</HeroMotionContext.Provider>;
}
const bayer = [
  [0,48,12,60,3,51,15,63], [32,16,44,28,35,19,47,31],
  [8,56,4,52,11,59,7,55], [40,24,36,20,43,27,39,23],
  [2,50,14,62,1,49,13,61], [34,18,46,30,33,17,45,29],
  [10,58,6,54,9,57,5,53], [42,26,38,22,41,25,37,21],
];
export default function HeroDither() {
  const canvasRef = useRef(null);
  const played = useContext(HeroMotionContext);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;
  useEffect(() => {
    const canvas = canvasRef.current;
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!canvas || played.current) return;
    if (media?.matches) { played.current = true; return; }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame;
    let start;
    let lastLevel = -1;
    let finished = false;
    let width = 0;
    let height = 0;
    let lastTheme;
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = Math.ceil(rect.width); height = Math.ceil(rect.height);
      canvas.width = width; canvas.height = height;
      ctx.imageSmoothingEnabled = false;
      lastLevel = -1;
    };
    const stop = () => { finished = true; cancelAnimationFrame(frame); ctx.clearRect(0, 0, width, height); };
    const changedMotion = () => { if (media.matches) { played.current = true; stop(); } };
    const draw = now => {
      if (finished) return;
      if (start === undefined) { start = now; played.current = true; }
      const level = Math.min(12, Math.floor((now - start) / 75));
      if (level !== lastLevel || lastTheme !== themeRef.current) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
        const threshold = (1 - level / 12) * 64;
        for (let y = 0; y < height; y += 4) for (let x = 0; x < width; x += 4) {
          if (bayer[(y / 4) % 8][(x / 4) % 8] < threshold) ctx.fillRect(x, y, 4, 4);
        }
        lastLevel = level; lastTheme = themeRef.current;
      }
      if (level < 12) frame = requestAnimationFrame(draw);
      else stop();
    };
    resize();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
    observer?.observe(canvas.parentElement);
    window.addEventListener('resize', resize);
    media?.addEventListener?.('change', changedMotion);
    // Start after the DOM has painted; neither fonts nor content wait for the effect.
    frame = requestAnimationFrame(draw);
    return () => { stop(); observer?.disconnect(); window.removeEventListener('resize', resize); media?.removeEventListener?.('change', changedMotion); };
  }, [played]);
  return <canvas ref={canvasRef} className="hero-dither-canvas" aria-hidden="true" />;
}
