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

  // 2. 3D Perspective Tilt on Project Tickets & Bento Cards
  const tiltCards = document.querySelectorAll('.ticket, .bento-card, .showcase-card, .award-card, .fact-card');

  tiltCards.forEach(card => {
    let tiltFrame = null;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Set CSS spotlight coordinates
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // Calculate 3D tilt angle
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5.0; // max 5deg tilt
      const rotateY = ((x - centerX) / centerX) * 5.0;  // max 5deg tilt

      if (tiltFrame) cancelAnimationFrame(tiltFrame);

      tiltFrame = requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(4px)`;
        card.style.transition = 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)';
      });
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      if (tiltFrame) cancelAnimationFrame(tiltFrame);
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    }, { passive: true });
  });
}

