/* ========================================
   EFFECTS  |  Preloader, Slide Transitions, Boot, Observers
   Inspired by averymacasa.vercel.app
   ======================================== */

// Preloader curtain split & requestAnimationFrame intro animation
export function initPreloader() {
  const overlay = document.getElementById('preloaderOverlay');
  const fill = document.getElementById('preloaderFill');
  const percentText = document.getElementById('preloaderPercent');
  const hero = document.getElementById('hero');

  function unlockPage() {
    document.body.style.overflow = '';
    if (hero) hero.classList.add('entered');
    if (overlay) {
      overlay.classList.add('finished');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 1600);
    }
  }

  if (!overlay) {
    unlockPage();
    return;
  }

  // Respect prefers-reduced-motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    unlockPage();
    return;
  }

  // Lock scrolling during intro preloader
  document.body.style.overflow = 'hidden';

  // Smooth requestAnimationFrame progress bar update (~2.4s)
  const startTime = performance.now();
  const totalDuration = 2400;

  // Fallback safety timeout
  const safetyTimer = setTimeout(() => {
    unlockPage();
  }, 4000);

  function updateProgress(now) {
    const elapsed = now - startTime;
    const progress = Math.min(100, Math.floor((elapsed / totalDuration) * 100));

    if (fill) fill.style.width = progress + '%';
    if (percentText) percentText.textContent = progress + '%';

    if (elapsed < totalDuration) {
      requestAnimationFrame(updateProgress);
    } else {
      clearTimeout(safetyTimer);
      setTimeout(() => {
        unlockPage();
      }, 350);
    }
  }

  requestAnimationFrame(updateProgress);
}

// 3D Parallax tilt effect for hero showcase card
export function initParallax() {
  const showcaseContainer = document.getElementById('heroShowcase');
  const showcaseCard = document.getElementById('showcaseCard');
  if (!showcaseContainer || !showcaseCard) return;

  showcaseContainer.addEventListener('mousemove', (e) => {
    const rect = showcaseCard.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (-y / rect.height) * 14;
    const rotateY = (x / rect.width) * 14;
    showcaseCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  showcaseContainer.addEventListener('mouseleave', () => {
    showcaseCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  });
}

// Scroll progress bar (throttled for high performance)
export function initProgressBar() {
  const progressBar = document.createElement('div');
  progressBar.style.cssText = 'position:fixed;top:0;left:0;height:2px;background:var(--text);z-index:200;transition:transform 0.1s linear;width:100%;transform-origin:0 0;transform:scaleX(0);pointer-events:none;will-change:transform;';
  document.body.appendChild(progressBar);

  let ticking = false;

  function updateProgress() {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;
    progressBar.style.transform = `scaleX(${ratio})`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });
}

// Timeline vertical scroll-progress line filler & circle-touch reveal
export function initTimelineProgress() {
  const container = document.querySelector('.timeline-container');
  const progressLine = document.getElementById('timeline-progress-line');
  if (!container || !progressLine) return;

  const items = container.querySelectorAll('.timeline-item');
  let ticking = false;

  function updateTimelineLine() {
    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const containerHeight = rect.height;

    // Line expands down as section scrolls up past the 55% screen mark
    const triggerOffset = windowHeight * 0.55;
    const scrolledDistance = triggerOffset - rect.top;

    let percentage = (scrolledDistance / containerHeight) * 100;
    percentage = Math.max(0, Math.min(100, percentage));

    progressLine.style.height = `${percentage}%`;

    // Exact pixel position of line tip relative to timeline container
    const lineTipPx = (percentage / 100) * containerHeight;

    // Check each circle (timeline-icon) position vs line tip
    items.forEach(item => {
      const icon = item.querySelector('.timeline-icon');
      const circleTop = item.offsetTop + (icon ? icon.offsetTop : 0);

      // Only reveal content if line tip has reached or passed the circle
      if (lineTipPx >= circleTop - 2) {
        item.classList.add('is-visible');
        item.classList.add('show');
        item.classList.add('in-view-glow');
      } else {
        item.classList.remove('is-visible');
        item.classList.remove('show');
        item.classList.remove('in-view-glow');
      }
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateTimelineLine);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateTimelineLine);
  updateTimelineLine();
}
