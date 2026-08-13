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

  if (btn) {
    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      setThemeImmediate(next);
    });
  }
}

window.setThemeAccent = function(themeName) {
  if (themeName === 'light' || themeName === 'dark') {
    const root = document.documentElement;
    if (themeName === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('portfolio-theme', themeName);
    spawnToast('THEME UPDATED', `Switched to ${themeName.toUpperCase()} mode`);
  }
};

// Skill cross-highlighting
window.highlightSkill = function(skillName) {
  const tickets = document.querySelectorAll('.ticket');
  let foundCount = 0;
  tickets.forEach(ticket => {
    const skills = (ticket.getAttribute('data-skills') || '').toLowerCase();
    if (skills.includes(skillName.toLowerCase())) {
      ticket.classList.add('highlight-pulse');
      foundCount++;
      setTimeout(() => ticket.classList.remove('highlight-pulse'), 3600);
    } else {
      ticket.classList.remove('highlight-pulse');
    }
  });
  if (foundCount > 0) {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
    spawnToast('SKILL FILTER', `Highlighted ${foundCount} project(s) using ${skillName.toUpperCase()}`);
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
