/* ========================================
   CAROUSEL  |  Screenshot Carousels
   ======================================== */

const carouselData = {
  hris: {
    current: 0,
    slides: [
      { src: 'hris-admin.png', label: 'Admin Dashboard' },
      { src: 'hris-approver.png', label: 'Approver Interface' },
      { src: 'hris-applicant.png', label: 'Applicant Form' }
    ]
  },
  gym: {
    current: 0,
    slides: [
      { src: 'gym-admin.png', label: 'Admin Dashboard' },
      { src: 'gym-trainer.png', label: 'Trainer Panel' },
      { src: 'gym-client.png', label: 'Client Portal' }
    ]
  }
};

let screenshotLastFocused = null;

function openScreenshotModal(src, caption) {
  screenshotLastFocused = document.activeElement;
  document.getElementById('screenshotModalImg').src = src;
  document.getElementById('screenshotModalCaption').textContent = caption;
  const modal = document.getElementById('screenshotModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  const closeBtn = modal.querySelector('.screenshot-modal-close');
  if (closeBtn) closeBtn.focus();
}

// Exposed globally for onclick handlers in HTML
window.setCarouselSlide = function(projectId, idx) {
  const data = carouselData[projectId];
  if (!data) return;
  data.current = idx;
  const slide = data.slides[idx];

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
  const data = carouselData[projectId];
  window.setCarouselSlide(projectId, (data.current - 1 + data.slides.length) % data.slides.length);
};

window.nextCarouselSlide = function(projectId) {
  const data = carouselData[projectId];
  window.setCarouselSlide(projectId, (data.current + 1) % data.slides.length);
};

window.openCurrentCarouselScreenshot = function(projectId) {
  const data = carouselData[projectId];
  const slide = data.slides[data.current];
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

