import { describe, it, expect, beforeEach } from 'vitest';
import { initThemeToggle, initNavigation } from '../src/js/navigation.js';

describe('Navigation & Theme Switching', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.body.innerHTML = `
      <nav>
        <button id="hamburger" aria-expanded="false"></button>
        <div id="mobileMenu" class="mobile-menu"></div>
        <button id="themeToggleBtn"></button>
        <div class="nav-links">
          <a href="#hero">Home</a>
          <a href="#projects">Projects</a>
        </div>
      </nav>
      <div id="toastLayer"></div>
    `;
  });

  it('switches between dark and light themes and persists to localStorage (AAA)', () => {
    // 1. Arrange
    initThemeToggle();
    const btn = document.getElementById('themeToggleBtn');
    const root = document.documentElement;

    // 2. Act - Toggle to light
    btn.click();

    // 3. Assert
    expect(root.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('portfolio-theme')).toBe('light');

    // 4. Act - Toggle back to dark
    btn.click();

    // 5. Assert
    expect(root.getAttribute('data-theme')).toBeNull();
    expect(localStorage.getItem('portfolio-theme')).toBe('dark');
  });

  it('toggles mobile menu open state and updates aria-expanded (AAA)', () => {
    // 1. Arrange
    const btn = document.getElementById('hamburger');
    const menu = document.getElementById('mobileMenu');

    // 2. Act - Open menu
    window.toggleMenu();

    // 3. Assert
    expect(menu.classList.contains('open')).toBe(true);
    expect(btn.classList.contains('open')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('true');

    // 4. Act - Close menu
    window.closeMenu();

    // 5. Assert
    expect(menu.classList.contains('open')).toBe(false);
    expect(btn.classList.contains('open')).toBe(false);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('allows programmatic theme switching via setThemeAccent (AAA)', () => {
    // 1. Arrange & Act
    window.setThemeAccent('light');

    // 2. Assert
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('portfolio-theme')).toBe('light');
  });
});
