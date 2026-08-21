/* ========================================
   COMMAND PALETTE  |  Raycast & Linear Style (Ctrl+K / ⌘K)
   Keyboard-first navigation for developers & recruiters
   ======================================== */

import { playUiSound } from './sound.js';

const PALETTE_COMMANDS = [
  {
    id: 'jump-about',
    group: 'Navigation',
    title: 'Jump to About Me',
    subtitle: 'Bio, background, and development focus',
    icon: 'user',
    shortcut: 'A',
    handler: () => {
      const el = document.getElementById('about');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  },
  {
    id: 'jump-experience',
    group: 'Navigation',
    title: 'Jump to Experience & Timeline',
    subtitle: 'DepEd OJT 342 hrs, thesis defense, graduation',
    icon: 'briefcase',
    shortcut: 'E',
    handler: () => {
      const el = document.getElementById('timeline');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  },
  {
    id: 'jump-projects',
    group: 'Navigation',
    title: 'Jump to Featured Projects',
    subtitle: 'Form 6 digital approval system & Gym platform',
    icon: 'folder',
    shortcut: 'P',
    handler: () => {
      const el = document.getElementById('projects');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  },
  {
    id: 'jump-skills',
    group: 'Navigation',
    title: 'Jump to Tech Stack',
    subtitle: 'React, Inertia.js, Laravel, PHP, MySQL, Tailwind',
    icon: 'code',
    shortcut: 'S',
    handler: () => {
      const el = document.getElementById('skills');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  },
  {
    id: 'jump-awards',
    group: 'Navigation',
    title: 'Jump to Honors & Recognition',
    subtitle: 'ThinkQuest Champion, Cisco cert, Alumni President',
    icon: 'award',
    shortcut: 'W',
    handler: () => {
      const el = document.getElementById('awards');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  },
  {
    id: 'jump-contact',
    group: 'Navigation',
    title: 'Jump to Contact Form',
    subtitle: 'Send direct message or inquiry',
    icon: 'mail',
    shortcut: 'C',
    handler: () => {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      const input = document.getElementById('contactName');
      if (input) setTimeout(() => input.focus(), 400);
    }
  },
  {
    id: 'open-hris',
    group: 'Project Deep Dive',
    title: 'Open: CS Form No. 6 Digitalization System',
    subtitle: 'DepEd OJT · 98/100 Rating · 3-Tier RBAC & PDF Engine',
    icon: 'layers',
    shortcut: '1',
    handler: () => {
      if (typeof window.openProjectModal === 'function') window.openProjectModal('hris');
    }
  },
  {
    id: 'open-gym',
    group: 'Project Deep Dive',
    title: "Open: Boiyet's Fitness Gym Management",
    subtitle: 'Defended Thesis · Solo Full-Stack · QR & Analytics',
    icon: 'layers',
    shortcut: '2',
    handler: () => {
      if (typeof window.openProjectModal === 'function') window.openProjectModal('gym');
    }
  },
  {
    id: 'action-resume',
    group: 'Quick Actions',
    title: 'Preview & Download Resume PDF',
    subtitle: 'Curriculum Vitae (STI CS Graduate, 342 OJT Hours)',
    icon: 'file-text',
    shortcut: 'R',
    handler: () => {
      if (typeof window.openResumeModal === 'function') window.openResumeModal();
    }
  },
  {
    id: 'action-email',
    group: 'Quick Actions',
    title: 'Copy Email to Clipboard',
    subtitle: 'farinas.kurtvincent@gmail.com',
    icon: 'copy',
    shortcut: 'M',
    handler: () => {
      if (typeof window.copyEmail === 'function') window.copyEmail();
    }
  },
  {
    id: 'action-theme',
    group: 'Quick Actions',
    title: 'Toggle Dark / Light Theme',
    subtitle: 'Switch color mode with circular ripple animation',
    icon: 'sun-moon',
    shortcut: 'T',
    handler: () => {
      const themeBtn = document.getElementById('themeToggleBtn');
      if (themeBtn) themeBtn.click();
    }
  },
  {
    id: 'action-highlights',
    group: 'Quick Actions',
    title: 'Toggle Highlights Mode',
    subtitle: 'Highlight core proof points & show quick executive HUD',
    icon: 'zap',
    shortcut: 'H',
    handler: () => {
      if (typeof window.toggleFastTrack === 'function') window.toggleFastTrack();
    }
  },
  {
    id: 'action-sound',
    group: 'Quick Actions',
    title: 'Toggle UI Sound Effects',
    subtitle: 'Enable or mute procedural Web Audio click feedback',
    icon: 'volume',
    shortcut: 'U',
    handler: () => {
      if (typeof window.toggleSound === 'function') window.toggleSound();
    }
  }
];

let selectedIdx = 0;
let filteredCommands = [...PALETTE_COMMANDS];

function getCommandIcon(type) {
  switch (type) {
    case 'briefcase':
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>';
    case 'folder':
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>';
    case 'code':
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>';
    case 'award':
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>';
    case 'mail':
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>';
    case 'layers':
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>';
    case 'file-text':
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>';
    case 'copy':
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    case 'sun-moon':
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line></svg>';
    case 'zap':
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>';
    case 'volume':
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
    default:
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>';
  }
}

export function openCommandPalette() {
  const dialog = document.getElementById('cmdPalette');
  const input = document.getElementById('cmdPaletteInput');
  if (!dialog) return;

  playUiSound('tab');
  dialog.showModal();
  document.body.style.overflow = 'hidden';
  if (input) {
    input.value = '';
    filterPalette('');
    setTimeout(() => input.focus(), 30);
  }
}

export function closeCommandPalette() {
  const dialog = document.getElementById('cmdPalette');
  if (!dialog || !dialog.open) return;

  playUiSound('click');
  dialog.close();
  document.body.style.overflow = '';
}

function filterPalette(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) {
    filteredCommands = [...PALETTE_COMMANDS];
  } else {
    filteredCommands = PALETTE_COMMANDS.filter(cmd =>
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle.toLowerCase().includes(q) ||
      cmd.group.toLowerCase().includes(q) ||
      (cmd.shortcut && cmd.shortcut.toLowerCase() === q)
    );
  }
  selectedIdx = 0;
  renderPaletteResults();
}

function renderPaletteResults() {
  const list = document.getElementById('cmdPaletteList');
  const empty = document.getElementById('cmdPaletteEmpty');
  if (!list) return;

  if (filteredCommands.length === 0) {
    list.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  // Group commands
  const groups = {};
  filteredCommands.forEach((cmd, idx) => {
    if (!groups[cmd.group]) groups[cmd.group] = [];
    groups[cmd.group].push({ ...cmd, globalIdx: idx });
  });

  let html = '';
  for (const [groupName, items] of Object.entries(groups)) {
    html += `<div class="cmd-group-title">${groupName}</div>`;
    items.forEach(item => {
      const isSelected = item.globalIdx === selectedIdx;
      html += `
        <div class="cmd-item ${isSelected ? 'selected' : ''}" 
             data-idx="${item.globalIdx}" 
             role="option" 
             aria-selected="${isSelected}"
             onclick="window.executePaletteIndex(${item.globalIdx})">
          <div class="cmd-item-icon">${getCommandIcon(item.icon)}</div>
          <div class="cmd-item-text">
            <span class="cmd-item-title">${item.title}</span>
            <span class="cmd-item-sub">${item.subtitle}</span>
          </div>
          ${item.shortcut ? `<span class="cmd-keycap">${item.shortcut}</span>` : ''}
        </div>
      `;
    });
  }

  list.innerHTML = html;

  // Scroll selected item into view if needed
  const selectedEl = list.querySelector(`.cmd-item[data-idx="${selectedIdx}"]`);
  if (selectedEl) {
    selectedEl.scrollIntoView({ block: 'nearest' });
  }
}

export function executePaletteIndex(idx) {
  const cmd = filteredCommands[idx];
  if (!cmd) return;
  closeCommandPalette();
  playUiSound('success');
  cmd.handler();
}

export function initCommandPalette() {
  window.openCommandPalette = openCommandPalette;
  window.closeCommandPalette = closeCommandPalette;
  window.executePaletteIndex = executePaletteIndex;

  const dialog = document.getElementById('cmdPalette');
  const input = document.getElementById('cmdPaletteInput');

  if (input) {
    input.addEventListener('input', (e) => {
      filterPalette(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredCommands.length > 0) {
          selectedIdx = (selectedIdx + 1) % filteredCommands.length;
          playUiSound('tab');
          renderPaletteResults();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredCommands.length > 0) {
          selectedIdx = (selectedIdx - 1 + filteredCommands.length) % filteredCommands.length;
          playUiSound('tab');
          renderPaletteResults();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executePaletteIndex(selectedIdx);
      }
    });
  }

  if (dialog) {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        closeCommandPalette();
      }
    });
    dialog.addEventListener('cancel', () => {
      document.body.style.overflow = '';
    });
  }

  // Global Keyboard Shortcuts (Ctrl+K, ⌘K, /)
  window.addEventListener('keydown', (e) => {
    const isCmdOrCtrl = e.metaKey || e.ctrlKey;
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    const isTyping = activeTag === 'input' || activeTag === 'textarea' || document.activeElement.isContentEditable;

    if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (dialog && dialog.open) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
      return;
    }

    if (e.key === '/' && !isTyping && (!dialog || !dialog.open)) {
      e.preventDefault();
      openCommandPalette();
      return;
    }

    if (e.key === 'Escape' && dialog && dialog.open) {
      closeCommandPalette();
    }
  });
}
