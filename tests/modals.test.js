import { describe, it, expect, beforeEach } from 'vitest';
import { initModals } from '../src/js/modals.js';

describe('Project Modals & Keyboard Accessibility', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="projectModal" class="modal-overlay">
        <div class="modal-card">
          <button class="modal-close" onclick="closeProjectModal()"></button>
          <span id="modalBadge"></span>
          <span id="modalStamp"></span>
          <h3 id="modalTitle"></h3>
          <span id="modalRoleTag"></span>
          <div id="modalStatusBadge"></div>
          <div id="modalCarousel" data-project="">
            <div id="modalCarouselTabs"></div>
            <img id="modalCarouselImg" src="">
            <span id="modalCarouselLabel"></span>
            <div id="modalCarouselDots"></div>
          </div>
          <p id="modalDesc"></p>
          <ul id="modalHighlights"></ul>
          <div id="modalStack"></div>
          <div id="modalLinks"></div>
        </div>
      </div>
      <div id="screenshotModal" class="modal-overlay">
        <button class="screenshot-modal-close" onclick="closeScreenshotModal()"></button>
        <img id="screenshotModalImg" src="">
        <div id="screenshotModalCaption"></div>
      </div>
      <div id="toastLayer"></div>
    `;
    initModals();
  });

  it('opens HRIS project modal and populates correct content (AAA)', () => {
    // 1. Arrange
    const modal = document.getElementById('projectModal');
    const title = document.getElementById('modalTitle');
    const roleTag = document.getElementById('modalRoleTag');

    // 2. Act
    window.openProjectModal('hris');

    // 3. Assert
    expect(modal.classList.contains('active')).toBe(true);
    expect(title.textContent).toBe('CS Form No. 6 Digitalization System');
    expect(roleTag.textContent).toBe('Frontend Ownership');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('opens Gym project modal and populates live demo link (AAA)', () => {
    // 1. Arrange & Act
    window.openProjectModal('gym');
    const modal = document.getElementById('projectModal');
    const links = document.getElementById('modalLinks');

    // 2. Assert
    expect(modal.classList.contains('active')).toBe(true);
    expect(links.innerHTML).toContain('View Code');
  });

  it('closes modal on closeProjectModal call and restores body overflow (AAA)', () => {
    // 1. Arrange
    window.openProjectModal('hris');
    const modal = document.getElementById('projectModal');

    // 2. Act
    window.closeProjectModal();

    // 3. Assert
    expect(modal.classList.contains('active')).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('closes project modal on Escape key press (AAA)', () => {
    // 1. Arrange
    window.openProjectModal('hris');
    const modal = document.getElementById('projectModal');

    // 2. Act
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    // 3. Assert
    expect(modal.classList.contains('active')).toBe(false);
  });

  it('navigates modal carousel slides with next and previous controls (AAA)', () => {
    // 1. Arrange
    window.openProjectModal('hris');
    const img = document.getElementById('modalCarouselImg');

    // 2. Act - next slide
    window.nextModalCarouselSlide();

    // 3. Assert
    expect(img.src).toContain('hris-approver.png');

    // 4. Act - prev slide
    window.prevModalCarouselSlide();

    // 5. Assert
    expect(img.src).toContain('hris-admin.png');
  });
});
