import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initPreloader } from '../src/js/effects.js';

describe('Effects & Preloader Accessibility', () => {
  beforeEach(() => {
    sessionStorage.clear();
    document.body.innerHTML = `
      <div id="preloaderOverlay" class="preloader-overlay">
        <div id="preloaderFill"></div>
        <div id="preloaderPercent">0%</div>
      </div>
      <div id="hero"></div>
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
});
