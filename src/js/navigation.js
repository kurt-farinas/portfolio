/* ========================================
   NAVIGATION  |  Hamburger, Active Links, Themes, Skill Filter
   ======================================== */

import { spawnToast } from './utils.js';

// Hamburger mobile menu
window.toggleMenu = function() {
  const menu = document.getElementById('mobileMenu');
  const btn = document.getElementById('hamburger');
  const isOpen = menu.classList.toggle('open');
  btn.classList.toggle('open', isOpen);
  btn.setAttribute('aria-expanded', isOpen);
};

window.closeMenu = function() {
  const menu = document.getElementById('mobileMenu');
  const btn = document.getElementById('hamburger');
  menu.classList.remove('open');
  btn.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
};

export function initThemeToggle() {
  const btn = document.getElementById('themeToggleBtn');
  const root = document.documentElement;

  // Restore saved theme
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  setThemeImmediate(savedTheme);

  function setThemeImmediate(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('portfolio-theme', theme);
  }

  function toggleThemeWithRipple(e) {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';

    // Calculate origin (x, y) from button center or click coordinates
    let x = window.innerWidth - 80;
    let y = 30;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else if (e && e.clientX) {
      x = e.clientX;
      y = e.clientY;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || prefersReducedMotion) {
      setThemeImmediate(next);
      return;
    }

    const transition = document.startViewTransition(() => {
      setThemeImmediate(next);
    });

    transition.ready.then(() => {
      const clipAnimation = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];

      document.documentElement.animate(
        {
          clipPath: clipAnimation
        },
        {
          duration: 550,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  }

  if (btn) {
    btn.addEventListener('click', (e) => {
      toggleThemeWithRipple(e);
    });
  }
}

window.setThemeAccent = function(themeName) {
  if (themeName === 'light' || themeName === 'dark') {
    const root = document.documentElement;
    const btn = document.getElementById('themeToggleBtn');
    
    let x = window.innerWidth - 80;
    let y = 30;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const applyTheme = () => {
      if (themeName === 'light') {
        root.setAttribute('data-theme', 'light');
      } else {
        root.removeAttribute('data-theme');
      }
      localStorage.setItem('portfolio-theme', themeName);
      spawnToast('THEME UPDATED', `Switched to ${themeName.toUpperCase()} mode`);
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || prefersReducedMotion) {
      applyTheme();
      return;
    }

    const transition = document.startViewTransition(applyTheme);
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 550,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  }
};

// Recruiter Fast-Track (15-Second Executive Mode)
window.toggleFastTrack = function(forceState) {
  const body = document.body;
  const btn = document.getElementById('fastTrackToggle');
  const hud = document.getElementById('fastTrackHud');

  const isCurrentlyActive = body.classList.contains('recruiter-fast-track');
  const nextState = typeof forceState === 'boolean' ? forceState : !isCurrentlyActive;

  body.classList.toggle('recruiter-fast-track', nextState);
  if (btn) btn.classList.toggle('active', nextState);
  if (hud) hud.classList.toggle('active', nextState);

  if (nextState) {
    spawnToast('HIGHLIGHTS ACTIVE', 'Focusing on verified experience and core systems');
    const aboutSec = document.getElementById('about');
    if (aboutSec) aboutSec.scrollIntoView({ behavior: 'smooth' });
  } else {
    spawnToast('SHOWING ALL', 'Returned to full portfolio view');
  }
};

// Skill cross-highlighting & active filter state
window.activeSkillFilter = null;

window.clearSkillFilter = function() {
  window.activeSkillFilter = null;
  document.querySelectorAll('.skill-tags span').forEach(el => el.classList.remove('active-skill-pill'));
  document.querySelectorAll('.ticket').forEach(ticket => ticket.classList.remove('highlight-pulse'));
  const banner = document.getElementById('skillFilterBanner');
  if (banner) banner.style.display = 'none';
  spawnToast('FILTER RESET', 'Showing all featured projects');
};

window.highlightSkill = function(skillName) {
  if (window.activeSkillFilter === skillName) {
    window.clearSkillFilter();
    return;
  }

  window.activeSkillFilter = skillName;
  const tickets = document.querySelectorAll('.ticket');
  let foundCount = 0;

  // Highlight active skill chip in Tech Stack section
  document.querySelectorAll('.skill-tags span').forEach(el => {
    const text = el.textContent.toLowerCase();
    el.classList.toggle('active-skill-pill', text.includes(skillName.toLowerCase()));
  });

  // Pulse matching project cards
  tickets.forEach(ticket => {
    const skills = (ticket.getAttribute('data-skills') || '').toLowerCase();
    if (skills.includes(skillName.toLowerCase())) {
      ticket.classList.add('highlight-pulse');
      foundCount++;
    } else {
      ticket.classList.remove('highlight-pulse');
    }
  });

  // Update banner in Projects section
  const banner = document.getElementById('skillFilterBanner');
  const bannerName = document.getElementById('skillFilterName');
  if (banner && bannerName) {
    bannerName.textContent = skillName.toUpperCase();
    banner.style.display = 'flex';
  }

  if (foundCount > 0) {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
    spawnToast('SKILL FILTER', `Showing ${foundCount} project(s) built with ${skillName.toUpperCase()}`);
  }
};

export function initNavigation() {
  const nav = document.querySelector('nav');
  initThemeToggle();

  function handleNavScroll() {
    if (!nav) return;
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  // Initial check & scroll listener
  handleNavScroll();
  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (nav && !nav.contains(e.target)) window.closeMenu();
  });

  // Active nav link scroll tracker
  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    let current = '';
    sections.forEach(sec => {
      const secTop = sec.offsetTop - 120;
      if (window.scrollY >= secTop) {
        current = sec.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active-glow');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active-glow');
      }
    });
  }, { passive: true });
}
