/* ========================================
   MAGNETIC EFFECTS & MICRO-INTERACTIONS
   Smooth physics cursor pull for buttons & 3D tilt for cards
   ======================================== */

export function initMagneticEffects() {
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  if (isTouchDevice) return; // Skip 3D tilt physics on touch devices

  // 1. Magnetic pull on interactive buttons & pills
  const magneticEls = document.querySelectorAll('.btn-view-projects, .btn-hire-me, .hero-social-pill a, .hero-social-pill button, .btn-primary, .btn-secondary, .theme-btn');

  magneticEls.forEach(el => {
    let isTracking = false;

    el.addEventListener('mouseenter', () => {
      isTracking = true;
      el.style.transition = 'none';
    }, { passive: true });

    el.addEventListener('mousemove', (e) => {
      if (!isTracking) return;
      const rect = el.getBoundingClientRect();
      const deltaX = (e.clientX - (rect.left + rect.width / 2)) * 0.22;
      const deltaY = (e.clientY - (rect.top + rect.height / 2)) * 0.22;
      el.style.transform = `translate3d(${deltaX.toFixed(1)}px, ${deltaY.toFixed(1)}px, 0) scale(1.03)`;
    }, { passive: true });

    el.addEventListener('mouseleave', () => {
      isTracking = false;
      el.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      el.style.transform = 'translate3d(0, 0, 0) scale(1)';
    }, { passive: true });
  });

  // 2. Lightweight GPU-accelerated Card Elevation (Clean hover without forced style recalculation)
  const tiltCards = document.querySelectorAll('.ticket, .bento-card, .showcase-card, .award-card, .fact-card');

  tiltCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease';
      card.style.transform = 'translateY(-3px)';
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    }, { passive: true });
  });
}

