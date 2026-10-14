/* ========================================
   MODAL & INTERACTION CONTEXT
   Manages Project Modal, Resume Modal, Screenshot Lightbox, 
   Command Palette, Skill Filter, and Achievement Toasts
   ======================================== */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

export const ModalContext = createContext();

export function ModalProvider({ children }) {
  // Project detail modal
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Resume modal
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Screenshot lightbox
  const [lightbox, setLightbox] = useState({ isOpen: false, src: '', caption: '', productUrl: null, actionLabel: null });

  // Command palette
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Short-lived feedback for copy, contact, and filtering actions
  const [toasts, setToasts] = useState([]);
  const toastTimersRef = useRef(new Set());
  const savedBodyOverflowRef = useRef('');

  const spawnToast = useCallback((title, body) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((current) => [...current.slice(-2), { id, title, body, visible: true }]);

    const hideTimer = window.setTimeout(() => {
      setToasts((current) => current.map((toast) => (
        toast.id === id ? { ...toast, visible: false } : toast
      )));
      toastTimersRef.current.delete(hideTimer);

      const removeTimer = window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
        toastTimersRef.current.delete(removeTimer);
      }, 400);
      toastTimersRef.current.add(removeTimer);
    }, 3200);

    toastTimersRef.current.add(hideTimer);
  }, []);

  useEffect(() => () => {
    toastTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    toastTimersRef.current.clear();
  }, []);

  const anyDialogOpen = Boolean(selectedProjectId || resumeModalOpen || lightbox.isOpen || commandPaletteOpen || contactModalOpen);
  useEffect(() => {
    if (anyDialogOpen && document.body.style.overflow !== 'hidden') {
      savedBodyOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else if (!anyDialogOpen && document.body.style.overflow === 'hidden') {
      document.body.style.overflow = savedBodyOverflowRef.current;
      savedBodyOverflowRef.current = '';
    }
    return () => {
      if (anyDialogOpen && document.body.style.overflow === 'hidden') {
        document.body.style.overflow = savedBodyOverflowRef.current;
        savedBodyOverflowRef.current = '';
      }
    };
  }, [anyDialogOpen]);

  const openProjectModal = useCallback((projectId) => {
    setSelectedProjectId(projectId);
    setActiveSlideIndex(0);
  }, []);

  const closeProjectModal = useCallback(() => {
    setSelectedProjectId(null);
  }, []);

  const openResumeModal = useCallback(() => {
    setResumeModalOpen(true);
  }, []);

  const closeResumeModal = useCallback(() => {
    setResumeModalOpen(false);
  }, []);

  const openContactModal = useCallback(() => setContactModalOpen(true), []);
  const closeContactModal = useCallback(() => setContactModalOpen(false), []);

  const openLightbox = useCallback((src, caption, productUrl = null, actionLabel = null) => {
    setLightbox({ isOpen: true, src, caption, productUrl, actionLabel });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox({ isOpen: false, src: '', caption: '', productUrl: null, actionLabel: null });
  }, []);

  const openCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setCommandPaletteOpen(false);
  }, []);

  const toggleCommandPalette = useCallback(() => {
    setCommandPaletteOpen(prev => !prev);
  }, []);

  const copyEmail = useCallback(() => {
    const email = 'kurtfarinas2022@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      spawnToast('EMAIL COPIED', 'kurtfarinas2022@gmail.com copied to clipboard!');
    }).catch(() => {
      spawnToast('CONTACT EMAIL', 'kurtfarinas2022@gmail.com');
    });
  }, [spawnToast]);

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
        else if (contactModalOpen) closeContactModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.isOpen, commandPaletteOpen, selectedProjectId, resumeModalOpen, contactModalOpen, toggleCommandPalette, closeLightbox, closeCommandPalette, closeProjectModal, closeResumeModal, closeContactModal]);

  return (
    <ModalContext.Provider
      value={{
        selectedProjectId,
        activeSlideIndex,
        setActiveSlideIndex,
        openProjectModal,
        closeProjectModal,
        resumeModalOpen,
        openResumeModal,
        closeResumeModal,
        contactModalOpen,
        openContactModal,
        closeContactModal,
        lightbox,
        openLightbox,
        closeLightbox,
        commandPaletteOpen,
        openCommandPalette,
        closeCommandPalette,
        toggleCommandPalette,
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
