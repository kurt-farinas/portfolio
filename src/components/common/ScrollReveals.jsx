import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const revealTargets = [
  '.studio-about-layout',
  '.studio-section-heading',
  '.studio-project',
  '.studio-timeline-item',
  '.studio-skill-row',
  '.studio-award',
  '.studio-project-detail-header',
  '.studio-project-detail-preview',
  '.studio-project-detail-content > section',
  '.studio-project-detail-actions',
  '.studio-archive-header',
  '.after-hours-photo-section',
  '.gear-category-header',
  '.gear-card'
].join(', ');
const staggerTargets = '.studio-project, .gear-card, .studio-timeline-item, .studio-skill-row, .studio-award';

export default function ScrollReveals() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window.IntersectionObserver !== 'function' || !window.matchMedia) return undefined;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionPreference.matches) return undefined;

    const animations = new Set();
    let disposed = false;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (disposed || !entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (motionPreference.matches || typeof entry.target.animate !== 'function') continue;

        const siblings = entry.target.matches(staggerTargets)
          ? Array.from(entry.target.parentElement.children).filter(element => element.matches(staggerTargets))
          : [];
        const delay = Math.min(siblings.indexOf(entry.target), 3) * 60;
        const animation = entry.target.animate(
          [
            { opacity: 0.65, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ],
          { duration: 450, delay: Math.max(0, delay), easing: 'ease-out', fill: 'backwards' }
        );
        animations.add(animation);
        animation.finished?.then(() => animations.delete(animation), () => animations.delete(animation));
      }
    }, { threshold: 0 });

    const observeOffscreenContent = () => {
      if (motionPreference.matches) return;
      const main = document.querySelector('.studio-system > main');
      main?.querySelectorAll(revealTargets).forEach(element => {
        const bounds = element.getBoundingClientRect();
        if (bounds.top >= window.innerHeight) observer.observe(element);
      });
    };
    // The route's hash scroll runs after 100ms; register below-view content after it lands.
    const startTimer = window.location.hash ? window.setTimeout(observeOffscreenContent, 150) : null;
    if (startTimer === null) observeOffscreenContent();

    const stopMotion = () => {
      if (!motionPreference.matches) return;
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
    };
    motionPreference.addEventListener('change', stopMotion);

    return () => {
      disposed = true;
      if (startTimer !== null) window.clearTimeout(startTimer);
      observer.disconnect();
      motionPreference.removeEventListener('change', stopMotion);
      animations.forEach(animation => animation.cancel());
      animations.clear();
    };
  }, [pathname]);

  return null;
}
