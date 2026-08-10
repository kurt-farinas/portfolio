/* ========================================
   MAGNETIC EFFECTS & MICRO-INTERACTIONS
   Smooth physics cursor pull for buttons & cards
   ======================================== */

export function initMagneticEffects() {
  const magneticEls = document.querySelectorAll('.btn-view-projects, .btn-hire-me, .hero-social-pill a, .hero-social-pill button, .btn-primary, .btn-secondary, .theme-btn');

  magneticEls.forEach(el => {
    let animationFrame = null;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate magnetic offset relative to center of element
      const deltaX = (e.clientX - centerX) * 0.28;
      const deltaY = (e.clientY - centerY) * 0.28;

      if (animationFrame) cancelAnimationFrame(animationFrame);

      animationFrame = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${deltaX.toFixed(2)}px, ${deltaY.toFixed(2)}px, 0) scale(1.04)`;
        el.style.transition = 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)';
      });
    }, { passive: true });

    el.addEventListener('mouseleave', () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      el.style.transform = 'translate3d(0, 0, 0) scale(1)';
      el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    }, { passive: true });
  });

  // Card cursor spotlight tracking
  const cards = document.querySelectorAll('.ticket, .award-card, .fact-card, .skill-group');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }, { passive: true });
  });
}
