/* ========================================
   EFFECTS  |  Preloader, Slide Transitions, Boot, Observers
   Inspired by averymacasa.vercel.app
   ======================================== */

// Preloader curtain split & progress animation (with fail-safe)
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
      }, 500);
    }
  }

  if (!overlay) {
    unlockPage();
    return;
  }

  // Lock scrolling temporarily during intro
  document.body.style.overflow = 'hidden';

  // Fail-safe: Force unlock after 1.2 seconds max no matter what
  const failSafeTimer = setTimeout(() => {
    unlockPage();
  }, 1200);

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 25) + 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      clearTimeout(failSafeTimer);

      if (fill) fill.style.width = '100%';
      if (percentText) percentText.textContent = '100%';

      setTimeout(() => {
        unlockPage();
      }, 200);
    } else {
      if (fill) fill.style.width = progress + '%';
      if (percentText) percentText.textContent = progress + '%';
    }
  }, 35);
}

// Spotlight cursor tracking — disabled in monochrome mode
export function initSpotlight() {
  // No-op
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

// Boot sequence animation
export function initBootSequence() {
  const bootLines = [
    "> initializing kurt.dev",
    "> loading profile: Kurt Fariñas  |  BS Computer Science",
    "> checking status... <span class=\"ok\">OPEN_TO_WORK</span>",
    "> ready."
  ];
  const bootLog = document.getElementById('bootLog');
  let delay = 0;

  if (bootLog) {
    bootLog.innerHTML = '';
    bootLines.forEach((line) => {
      const el = document.createElement('span');
      el.className = 'line';
      el.innerHTML = line;
      bootLog.appendChild(el);
      delay += 160;
      setTimeout(() => el.classList.add('show'), delay);
    });
  }
}

// Animated number counters — disabled
export function initCounters() {
  // No-op
}

// Section element reveal on scroll
export function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.ticket, .timeline-item, .skill-group, .award-card, .reveal-on-scroll, .section-title, .fact-card').forEach(t => {
    t.classList.add('reveal-on-scroll');
    observer.observe(t);
  });
}

// Scroll-triggered border highlight observer
export function initScrollGlow() {
  const glowObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view-glow');
        entry.target.classList.add('show');
      } else {
        entry.target.classList.remove('in-view-glow');
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: "-20px 0px -20px 0px"
  });

  const glowTargets = document.querySelectorAll('.ticket, .skill-group, .award-card, .contact-box, .fact-card, .timeline-item');
  glowTargets.forEach(el => {
    el.classList.add('scroll-glow-target');
    glowObserver.observe(el);
  });
}

// Scroll progress bar
export function initProgressBar() {
  const progressBar = document.createElement('div');
  progressBar.style.cssText = 'position:fixed;top:0;left:0;height:2px;background:var(--text);z-index:200;transition:width 0.1s linear;width:0%;pointer-events:none;';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const percent = total > 0 ? (scrolled / total * 100).toFixed(1) : 0;
    progressBar.style.width = percent + '%';
  });
}
