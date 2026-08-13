import { describe, it, expect, beforeEach } from 'vitest';
import { initCarousel } from '../src/js/carousel.js';

describe('Carousel Navigation & Lightbox', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div data-project="hris">
        <img id="hris-carousel-img" src="hris-admin.png">
        <span id="hris-carousel-label">Admin Dashboard</span>
        <div class="carousel-tab active"></div>
        <div class="carousel-tab"></div>
        <div class="carousel-tab"></div>
        <div class="carousel-dot active"></div>
        <div class="carousel-dot"></div>
        <div class="carousel-dot"></div>
      </div>
      <div id="screenshotModal" class="modal-overlay">
        <button class="screenshot-modal-close"></button>
        <img id="screenshotModalImg" src="">
        <div id="screenshotModalCaption"></div>
      </div>
    `;
    initCarousel();
  });

  it('cycles through carousel slides forwards and wraps around (AAA)', () => {
    // 1. Arrange
    const img = document.getElementById('hris-carousel-img');

    // 2. Act - Slide 1 (Approver)
    window.nextCarouselSlide('hris');
    expect(img.src).toContain('hris-approver.png');

    // 3. Act - Slide 2 (Applicant)
    window.nextCarouselSlide('hris');
    expect(img.src).toContain('hris-applicant.png');

    // 4. Act - Wrap back to Slide 0 (Admin)
    window.nextCarouselSlide('hris');
    expect(img.src).toContain('hris-admin.png');
  });

  it('cycles backwards with prevCarouselSlide (AAA)', () => {
    // 1. Arrange
    const img = document.getElementById('hris-carousel-img');

    // 2. Act - Previous from 0 wraps to 2 (Applicant)
    window.prevCarouselSlide('hris');

    // 3. Assert
    expect(img.src).toContain('hris-applicant.png');
  });

  it('opens fullscreen screenshot modal and closes on Escape (AAA)', () => {
    // 1. Arrange
    const modal = document.getElementById('screenshotModal');
    const modalImg = document.getElementById('screenshotModalImg');

    // 2. Act - Open screenshot
    window.openScreenshotModal('hris-admin.png', 'Admin View');

    // 3. Assert
    expect(modal.classList.contains('active')).toBe(true);
    expect(modalImg.src).toContain('hris-admin.png');

    // 4. Act - Press Escape
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    // 5. Assert
    expect(modal.classList.contains('active')).toBe(false);
  });
});
