/* ========================================
   MAIN ENTRY POINT
   ======================================== */

// Import all JS modules
import { copyEmail, initAchievements, initKonamiCode } from './js/utils.js';
import { initTerminal } from './js/terminal.js';
import { initCarousel } from './js/carousel.js';
import { initModals } from './js/modals.js';
import { initPreloader, initSpotlight, initParallax, initBootSequence, initCounters, initScrollReveal, initScrollGlow, initProgressBar } from './js/effects.js';
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
  initSpotlight();
  initParallax();
  initBootSequence();
  initProgressBar();

  // Interactive features
  initTerminal();
  initCarousel();
  initModals();
  initNavigation();
  initContactForm();

  // Scroll-driven features
  initCounters();
  initScrollReveal();
  initScrollGlow();

  // Easter eggs & achievements
  initAchievements();
  initKonamiCode();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
