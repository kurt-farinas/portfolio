/* ========================================
   COMMAND PALETTE  |  Raycast & Linear Style (Ctrl+K / ⌘K)
   ======================================== */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { useTheme } from '../../context/ThemeContext';
import { useOptionalDesktopWorkspace } from '../../context/DesktopWorkspaceContext';
import useDialogFocus from './useDialogFocus';
import { useAsk } from './AskOverlay';

export default function CommandPalette() {
  const {
    commandPaletteOpen,
    closeCommandPalette,
    openProjectModal,
    openResumeModal,
    copyEmail
  } = useModal();

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const desktopWorkspace = useOptionalDesktopWorkspace();
  const { openAsk } = useAsk();
  const openApplication = appId => {
    if (desktopWorkspace) return desktopWorkspace.openApplication(appId);
    const fallbackPaths = { about: '/#about', projects: '/projects', experience: '/#timeline', stack: '/#skills', recognition: '/#awards', 'after-hours': '/after-hours', gear: '/gear', contact: '/#contact' };
    navigate(fallbackPaths[appId] || '/');
  };

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const dialogRef = useDialogFocus(commandPaletteOpen);

  const commands = useMemo(() => [
    ...(desktopWorkspace?.apps.filter(app => ['my-computer', 'classic', 'kurtordle', 'bugsweeper', 'bughunter', 'terminal', 'credits'].includes(app.id)).map(app => ({ id: 'app-' + app.id, group: 'Portfolio extras', title: 'Open ' + app.label, subtitle: app.description, icon: 'code', handler: () => openApplication(app.id) })) || []),
    {
      id: 'jump-experience',
      group: 'Navigation',
      title: 'Open Experience',
      subtitle: 'DepEd OJT 342 hrs, thesis defense, graduation',
      icon: 'briefcase',
      shortcut: 'E',
      handler: () => openApplication('experience')
    },
    {
      id: 'jump-about',
      group: 'Navigation',
      title: 'Open About',
      subtitle: 'Full-stack background, OJT experience, and career goals',
      icon: 'user',
      shortcut: 'B',
      handler: () => openApplication('about')
    },
    {
      id: 'jump-projects',
      group: 'Navigation',
      title: 'Open Projects',
      subtitle: 'Project details, contributions, screenshots, and links',
      icon: 'folder',
      shortcut: 'P',
      handler: () => openApplication('projects')
    },
    {
      id: 'jump-skills',
      group: 'Navigation',
      title: 'Open Stack',
      subtitle: 'React, Inertia.js, Laravel, PHP, MySQL, Tailwind',
      icon: 'code',
      shortcut: 'S',
      handler: () => openApplication('stack')
    },
    {
      id: 'jump-awards',
      group: 'Navigation',
      title: 'Open Recognition',
      subtitle: 'ThinkQuest Champion, Alumni President, Cisco, Oracle Java',
      icon: 'award',
      shortcut: 'W',
      handler: () => openApplication('recognition')
    },
    {
      id: 'action-email-direct',
      group: 'Actions & Utilities',
      title: 'Open Contact',
      subtitle: 'Send a message to kurtfarinas2022@gmail.com',
      icon: 'mail',
      shortcut: 'C',
      handler: () => openApplication('contact')
    },
    {
      id: 'open-hris',
      group: 'Project Deep Dive',
      title: 'Open CS Form No. 6 Digitalization System',
      subtitle: 'DepEd OJT · 98/100 Rating · 3-Tier RBAC & PDF Engine',
      icon: 'layers',
      shortcut: '1',
      handler: () => openProjectModal('hris')
    },
    {
      id: 'open-gym',
      group: 'Project Deep Dive',
      title: "Open Boiyet's Gym Management System",
      subtitle: 'Solo Rebuild · Laravel 12 & Inertia.js · 119 Pest Tests',
      icon: 'layers',
      shortcut: '2',
      handler: () => openProjectModal('gym')
    },
    {
      id: 'action-resume',
      group: 'Actions & Utilities',
      title: 'Open Résumé',
      subtitle: 'Preview, open, or download the PDF',
      icon: 'file-text',
      shortcut: 'R',
      handler: () => openResumeModal()
    },
    {
      id: 'open-after-hours',
      group: 'Applications',
      title: 'Open After Hours',
      subtitle: 'Browse personal photos',
      icon: 'image',
      shortcut: 'A',
      handler: () => openApplication('after-hours')
    },
    {
      id: 'open-gear',
      group: 'Applications',
      title: 'Open Gear & Collections',
      subtitle: 'Desk setup and fragrance collection',
      icon: 'layers',
      shortcut: 'G',
      handler: () => openApplication('gear')
    },
    {
      id: 'action-email',
      group: 'Actions & Utilities',
      title: 'Copy Email to Clipboard',
      subtitle: 'kurtfarinas2022@gmail.com',
      icon: 'copy',
      shortcut: 'M',
      handler: () => copyEmail()
    },
    {
      id: 'action-ask',
      group: 'Actions & Utilities',
      title: 'Open Ask anything',
      subtitle: 'Ask a question (Alt K)',
      icon: 'code',
      handler: () => openAsk()
    },
    {
      id: 'action-theme',
      group: 'Actions & Utilities',
      title: `Switch Theme to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      subtitle: `Currently using ${theme.toUpperCase()} theme`,
      icon: theme === 'dark' ? 'sun' : 'moon',
      shortcut: 'T',
      handler: (e) => toggleTheme(e)
    },
  ], [openApplication, openProjectModal, openResumeModal, copyEmail, theme, toggleTheme, openAsk]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    // Fold accents so "resume" matches "Résumé" and vice versa.
    const fold = text => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    const q = fold(query.trim());
    const matches = commands.filter(c =>
      fold(c.title).includes(q) ||
      fold(c.subtitle).includes(q) ||
      fold(c.group).includes(q)
    );

    return matches.sort((a, b) => {
      const aTitle = fold(a.title).includes(q);
      const bTitle = fold(b.title).includes(q);
      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;
      return 0;
    });
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!commandPaletteOpen) return;
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
  }, [commandPaletteOpen, selectedIndex, query]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const executeCommand = (cmd) => {
    closeCommandPalette();
    cmd.handler();
  };

  const handleKeyDown = (e) => {
    if (e.target !== inputRef.current || !filteredCommands.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="cmd-palette-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={closeCommandPalette}
    >
      <div
        ref={dialogRef}
        className="cmd-palette-card"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="cmd-palette-search-row">
          <svg className="cmd-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            ref={inputRef}
            type="text"
            className="cmd-palette-input"
            placeholder="Type a command or search (e.g. projects, resume, theme)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            role="combobox"
            aria-label="Search commands"
            aria-expanded="true"
            aria-controls="command-list"
            aria-activedescendant={filteredCommands[selectedIndex] ? `command-${filteredCommands[selectedIndex].id}` : undefined}
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="button"
            className="cmd-esc-badge"
            onClick={closeCommandPalette}
            aria-label="Close command palette"
          >
            ESC
          </button>
        </div>

        <div className="cmd-palette-list" id="command-list" ref={listRef} role="listbox" aria-label="Commands">
          {filteredCommands.map((cmd, idx) => (
            <div
              key={cmd.id}
              id={`command-${cmd.id}`}
              role="option"
              aria-selected={idx === selectedIndex}
              className={`cmd-palette-item ${idx === selectedIndex ? 'selected' : ''}`}
              onClick={() => executeCommand(cmd)}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <div className="cmd-item-left">
                <span className="cmd-item-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"></circle></svg>
                </span>
                <div className="cmd-item-info">
                  <div className="cmd-item-title">{cmd.title}</div>
                  <div className="cmd-item-desc">{cmd.subtitle}</div>
                </div>
              </div>
              <div className="cmd-item-right">
                <span className="cmd-item-group">{cmd.group}</span>
                {cmd.shortcut && <kbd className="keycap">{cmd.shortcut}</kbd>}
              </div>
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="cmd-palette-empty">
              <span>No matching commands found for "{query}"</span>
            </div>
          )}
        </div>

        <div className="cmd-palette-footer">
          <div className="cmd-footer-keys">
            <span><kbd className="keycap">↑</kbd><kbd className="keycap">↓</kbd> navigate</span>
            <span><kbd className="keycap">↵</kbd> select</span>
            <span><kbd className="keycap">esc</kbd> close</span>
          </div>
          <span className="cmd-footer-brand">Kurt-OS · React SPA</span>
        </div>
      </div>
    </div>
  );
}
