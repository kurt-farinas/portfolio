/* ========================================
   COMMAND PALETTE  |  Raycast & Linear Style (Ctrl+K / ⌘K)
   ======================================== */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { useTheme } from '../../context/ThemeContext';
import useDialogFocus from './useDialogFocus';

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
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const dialogRef = useDialogFocus(commandPaletteOpen);

  const commands = useMemo(() => [
    {
      id: 'jump-about',
      group: 'Navigation',
      title: 'Jump to About Me',
      subtitle: 'Bio, background, and development focus',
      icon: 'user',
      shortcut: 'A',
      handler: () => {
        if (location.pathname !== '/') {
          navigate('/#about');
        } else {
          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        }
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
        if (location.pathname !== '/') {
          navigate('/#timeline');
        } else {
          document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' });
        }
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
        if (location.pathname !== '/') {
          navigate('/#projects');
        } else {
          document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        }
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
        if (location.pathname !== '/') {
          navigate('/#skills');
        } else {
          document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      id: 'jump-awards',
      group: 'Navigation',
      title: 'Jump to Honors & Recognition',
      subtitle: 'ThinkQuest Champion, Oracle Java, Alumni President',
      icon: 'award',
      shortcut: 'W',
      handler: () => {
        if (location.pathname !== '/') {
          navigate('/#awards');
        } else {
          document.getElementById('awards')?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      id: 'jump-outside',
      group: 'Navigation',
      title: 'Jump to Outside the IDE',
      subtitle: 'Gym, hardware, perfumes, gaming, black coffee',
      icon: 'coffee',
      shortcut: 'O',
      handler: () => {
        navigate('/outside-the-ide');
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
        if (location.pathname !== '/') {
          navigate('/#contact');
        } else {
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => document.getElementById('contactName')?.focus(), 300);
        }
      }
    },
    {
      id: 'open-hris',
      group: 'Project Deep Dive',
      title: 'Open: CS Form No. 6 Digitalization System',
      subtitle: 'DepEd OJT · 98/100 Rating · 3-Tier RBAC & PDF Engine',
      icon: 'layers',
      shortcut: '1',
      handler: () => openProjectModal('hris')
    },
    {
      id: 'open-gym',
      group: 'Project Deep Dive',
      title: "Open: Boiyet's Gym Management System",
      subtitle: 'Solo Rebuild · Laravel 12 & Inertia.js · 119 Pest Tests',
      icon: 'layers',
      shortcut: '2',
      handler: () => openProjectModal('gym')
    },
    {
      id: 'action-resume',
      group: 'Actions & Utilities',
      title: 'View Resume (PDF Preview)',
      subtitle: 'Open integrated CV modal viewer',
      icon: 'file-text',
      shortcut: 'R',
      handler: () => openResumeModal()
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
      id: 'action-theme',
      group: 'Actions & Utilities',
      title: `Switch Theme to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      subtitle: `Currently using ${theme.toUpperCase()} theme`,
      icon: theme === 'dark' ? 'sun' : 'moon',
      shortcut: 'T',
      handler: (e) => toggleTheme(e)
    },
  ], [location.pathname, navigate, openProjectModal, openResumeModal, copyEmail, theme, toggleTheme]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.subtitle.toLowerCase().includes(q) ||
      c.group.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

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
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh'
      }}
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

        <div className="cmd-palette-list" ref={listRef} role="listbox">
          {filteredCommands.map((cmd, idx) => (
            <div
              key={cmd.id}
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
          <span className="cmd-footer-brand">kurt.dev · React SPA</span>
        </div>
      </div>
    </div>
  );
}
