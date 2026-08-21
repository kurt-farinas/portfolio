import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initPreloader, initHeroScrollAnimation } from '../src/js/effects.js';

describe('Effects & Preloader Accessibility', () => {
  beforeEach(() => {
    sessionStorage.clear();
    document.body.innerHTML = `
      <div id="preloaderOverlay" class="preloader-overlay">
        <div id="preloaderFill"></div>
        <div id="preloaderPercent">0%</div>
      </div>
      <header id="hero" class="hero hero-avery">
        <canvas id="topoCanvas"></canvas>
        <div class="hero-wrap">
          <div class="hero-status-pill"></div>
          <h1 id="heroH1" class="hero-title">
            <span class="title-line line-1">HI, I AM KURT</span>
            <span class="title-line line-2">JUNIOR FULL-STACK DEVELOPER</span>
          </h1>
          <p class="hero-subtitle"></p>
          <div class="hero-bottom-controls"></div>
        </div>
      </header>
    `;
  });

  it('skips preloader if prefers-reduced-motion is active (AAA)', () => {
    // 1. Arrange
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // 2. Act
    initPreloader();

    // 3. Assert
    const overlay = document.getElementById('preloaderOverlay');
    expect(overlay.classList.contains('finished')).toBe(true);
    expect(document.body.style.overflow).toBe('');
  });

  it('locks overflow and initializes progress during standard intro (AAA)', () => {
    // 1. Arrange
    window.matchMedia = vi.fn().mockImplementation(() => ({ matches: false }));

    // 2. Act
    initPreloader();

    // 3. Assert
    const overlay = document.getElementById('preloaderOverlay');
    expect(document.body.style.overflow).toBe('hidden');
    expect(overlay.classList.contains('finished')).toBe(false);
  });

  it('applies coordinated transitions, transforms and fades to all hero texts on scroll (AAA)', () => {
    // 1. Arrange
    window.matchMedia = vi.fn().mockImplementation(() => ({ matches: false }));
    window.scrollY = 200;
    window.innerHeight = 800;
    window.innerWidth = 1200;

    // 2. Act
    initHeroScrollAnimation();

    // 3. Assert
    const line1 = document.querySelector('.line-1');
    const line2 = document.querySelector('.line-2');
    const subtitle = document.querySelector('.hero-subtitle');
    const statusPill = document.querySelector('.hero-status-pill');
    const bottomControls = document.querySelector('.hero-bottom-controls');

    expect(line1.style.transform).toContain('translate3d(-');
    expect(line2.style.transform).toContain('translate3d(');
    expect(parseFloat(line1.style.opacity)).toBeLessThan(1);
    expect(parseFloat(line2.style.opacity)).toBeLessThan(1);
    expect(parseFloat(subtitle.style.opacity)).toBeLessThan(1);
    expect(parseFloat(statusPill.style.opacity)).toBeLessThan(1);
    expect(parseFloat(bottomControls.style.opacity)).toBeLessThan(1);
  });

  it('safely handles face eye tracker when portrait container is not present (AAA)', async () => {
    // 1. Arrange
    const { initFaceEyeTracker } = await import('../src/js/faceEyeTracker.js');

    // 2. Act & Assert
    expect(() => initFaceEyeTracker()).not.toThrow();
  });
});
