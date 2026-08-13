import { projectDetails } from './projectData.js';

let screenshotLastFocused = null;

window.openScreenshotModal = function(src, caption) {
  screenshotLastFocused = document.activeElement;
  document.getElementById('screenshotModalImg').src = src;
  document.getElementById('screenshotModalCaption').textContent = caption;
  const modal = document.getElementById('screenshotModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  const closeBtn = modal.querySelector('.screenshot-modal-close');
  if (closeBtn) closeBtn.focus();
};

const carouselCurrent = { hris: 0, gym: 0 };

// Exposed globally for onclick handlers in HTML
window.setCarouselSlide = function(projectId, idx) {
  const project = projectDetails[projectId];
  if (!project || !project.slides || !project.slides.length) return;
  carouselCurrent[projectId] = idx;
  const slide = project.slides[idx];

  const img = document.getElementById(`${projectId}-carousel-img`);
  if (img) {
    img.src = slide.src;
    img.onerror = () => { img.onerror = null; img.src = `${projectId}-mockup.png`; };
  }

  const lbl = document.getElementById(`${projectId}-carousel-label`);
  if (lbl) lbl.textContent = slide.label;

  document.querySelectorAll(`[data-project="${projectId}"] .carousel-tab`)
    .forEach((t, i) => t.classList.toggle('active', i === idx));
  document.querySelectorAll(`[data-project="${projectId}"] .carousel-dot`)
    .forEach((d, i) => d.classList.toggle('active', i === idx));
};

window.prevCarouselSlide = function(projectId) {
  const project = projectDetails[projectId];
  if (!project || !project.slides) return;
  const len = project.slides.length;
  window.setCarouselSlide(projectId, ((carouselCurrent[projectId] || 0) - 1 + len) % len);
};

window.nextCarouselSlide = function(projectId) {
  const project = projectDetails[projectId];
  if (!project || !project.slides) return;
  const len = project.slides.length;
  window.setCarouselSlide(projectId, ((carouselCurrent[projectId] || 0) + 1) % len);
};

window.openCurrentCarouselScreenshot = function(projectId) {
  const project = projectDetails[projectId];
  if (!project || !project.slides) return;
  const slide = project.slides[carouselCurrent[projectId] || 0];
  openScreenshotModal(slide.src, slide.label + '  |  ' + (projectId === 'hris' ? 'CS Form No. 6 System' : "Boiyet's Gym"));
};

window.closeScreenshotModal = function() {
  const modal = document.getElementById('screenshotModal');
  if (modal && modal.classList.contains('active')) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (screenshotLastFocused && typeof screenshotLastFocused.focus === 'function') {
      screenshotLastFocused.focus();
      screenshotLastFocused = null;
    }
  }
};

export function initCarousel() {
  // Close screenshot modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeScreenshotModal();
    }
  });
}

