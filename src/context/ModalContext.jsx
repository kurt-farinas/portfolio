/* ========================================
   MODAL & INTERACTION CONTEXT
   Manages Project Modal, Resume Modal, Screenshot Lightbox, 
   Command Palette, Skill Filter, and Achievement Toasts
   ======================================== */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSound } from './SoundContext';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const { playUiSound } = useSound();

  // Project detail modal
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [modalViewMode, setModalViewMode] = useState('screens'); // 'screens' | 'arch'
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Resume modal
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  // Screenshot lightbox
  const [lightbox, setLightbox] = useState({ isOpen: false, src: '', caption: '' });

  // Command palette
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Skill filter
  const [activeSkillFilter, setActiveSkillFilter] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const spawnToast = useCallback((title, body) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts(prev => [...prev, { id, title, body }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4200);
  }, []);

  const openProjectModal = useCallback((projectId) => {
    setSelectedProjectId(projectId);
    setModalViewMode('screens');
    setActiveSlideIndex(0);
    playUiSound('tab');
    document.body.style.overflow = 'hidden';
  }, [playUiSound]);

  const closeProjectModal = useCallback(() => {
    setSelectedProjectId(null);
    document.body.style.overflow = '';
  }, []);

  const openResumeModal = useCallback(() => {
    setResumeModalOpen(true);
    playUiSound('click');
    document.body.style.overflow = 'hidden';
  }, [playUiSound]);

  const closeResumeModal = useCallback(() => {
    setResumeModalOpen(false);
    document.body.style.overflow = '';
  }, []);

  const openLightbox = useCallback((src, caption) => {
    setLightbox({ isOpen: true, src, caption });
    playUiSound('click');
    document.body.style.overflow = 'hidden';
  }, [playUiSound]);

  const closeLightbox = useCallback(() => {
    setLightbox({ isOpen: false, src: '', caption: '' });
    if (!selectedProjectId && !resumeModalOpen) {
      document.body.style.overflow = '';
    }
  }, [selectedProjectId, resumeModalOpen]);

  const openCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
    playUiSound('tab');
  }, [playUiSound]);

  const closeCommandPalette = useCallback(() => {
    setCommandPaletteOpen(false);
  }, []);

  const toggleCommandPalette = useCallback(() => {
    setCommandPaletteOpen(prev => {
      playUiSound('tab');
      return !prev;
    });
  }, [playUiSound]);

  const filterBySkill = useCallback((skillName) => {
    playUiSound('click');
    if (activeSkillFilter === skillName) {
      setActiveSkillFilter(null);
      spawnToast('FILTER RESET', 'Showing all featured projects');
      return;
    }
    setActiveSkillFilter(skillName);
    const projectsEl = document.getElementById('projects');
    if (projectsEl) {
      projectsEl.scrollIntoView({ behavior: 'smooth' });
    }
    spawnToast('SKILL FILTER', `Showing projects built with ${skillName.toUpperCase()}`);
  }, [activeSkillFilter, playUiSound, spawnToast]);

  const clearSkillFilter = useCallback(() => {
    setActiveSkillFilter(null);
    playUiSound('click');
    spawnToast('FILTER RESET', 'Showing all featured projects');
  }, [playUiSound, spawnToast]);

  const copyEmail = useCallback(() => {
    playUiSound('success');
    const email = 'kurtfarinas2022@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      spawnToast('EMAIL COPIED', 'kurtfarinas2022@gmail.com copied to clipboard!');
    }).catch(() => {
      spawnToast('CONTACT EMAIL', 'kurtfarinas2022@gmail.com');
    });
  }, [playUiSound, spawnToast]);

  // Global keyboard shortcuts (Ctrl+K, ⌘K, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        toggleCommandPalette();
      }
      if (e.key === 'Escape') {
        if (lightbox.isOpen) closeLightbox();
        else if (commandPaletteOpen) closeCommandPalette();
        else if (selectedProjectId) closeProjectModal();
        else if (resumeModalOpen) closeResumeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.isOpen, commandPaletteOpen, selectedProjectId, resumeModalOpen, toggleCommandPalette, closeLightbox, closeCommandPalette, closeProjectModal, closeResumeModal]);

  return (
    <ModalContext.Provider
      value={{
        selectedProjectId,
        modalViewMode,
        setModalViewMode,
        activeSlideIndex,
        setActiveSlideIndex,
        openProjectModal,
        closeProjectModal,
        resumeModalOpen,
        openResumeModal,
        closeResumeModal,
        lightbox,
        openLightbox,
        closeLightbox,
        commandPaletteOpen,
        openCommandPalette,
        closeCommandPalette,
        toggleCommandPalette,
        activeSkillFilter,
        filterBySkill,
        clearSkillFilter,
        toasts,
        spawnToast,
        copyEmail
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
