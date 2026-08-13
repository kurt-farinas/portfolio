/* ========================================
   MAIN ENTRY POINT
   ======================================== */

// Import all active JS modules
import { copyEmail, initAchievements, initKonamiCode } from './js/utils.js';
import { initCarousel } from './js/carousel.js';
import { initModals } from './js/modals.js';
import { initPreloader, initParallax, initProgressBar, initTimelineProgress } from './js/effects.js';
import { initNavigation } from './js/navigation.js';
import { initContactForm } from './js/contact.js';
import { initTopoBackground } from './js/topoBackground.js';
import { initMagneticEffects } from './js/magneticEffects.js';
import { initCustomCursor } from './js/customCursor.js';

// Expose copyEmail globally for onclick handlers in HTML
window.copyEmail = copyEmail;

function startApp() {
  // Preloader & entrance animations
  initPreloader();
  initCustomCursor();
  initTopoBackground();
  initMagneticEffects();

  // Visual effects
  initParallax();
  initProgressBar();

  // Interactive features
  initCarousel();
  initModals();
  initNavigation();
  initContactForm();

  // Scroll-driven features
  initTimelineProgress();

  // Easter eggs & achievements
  initAchievements();
  initKonamiCode();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
