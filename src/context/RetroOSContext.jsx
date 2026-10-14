import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { useDesktopWorkspace } from './DesktopWorkspaceContext';
import { portfolioProfile } from '../data/portfolioFacts';

export const RetroOSContext = createContext(null);
const noop = () => {};
const EMPTY_DRAFT = { name: '', email: '', message: '' };
const defaults = { theme: 'dark', bootOpen: false, introKey: 0, soundEnabled: false, soundError: '', crtEffects: false, warmLamp: false, wallpaper: 0, monitorOn: true, pressedKey: '', contactDraft: EMPTY_DRAFT, contactStatus: { kind: '', message: '' }, sending: false, toggleSound: noop, toggleCrt: noop, toggleLamp: noop, cycleWallpaper: noop, togglePower: noop, powerOn: noop, replayBoot: noop, finishBoot: noop, playSound: noop, pressKey: noop, setContactDraft: noop, sendContact: noop };

export function RetroOSProvider({ children }) {
  const location = useLocation();
  const { theme } = useTheme();
  const { canUse3D, focusMonitor, expandDesktop, showDesk, reducedMotion } = useDesktopWorkspace();
  const [bootOpen, setBootOpen] = useState(() => {
    try { return location.pathname === '/' && !location.hash && sessionStorage.getItem('kurt-os-boot-seen') !== 'true'; }
    catch { return location.pathname === '/' && !location.hash; }
  });
  const [introKey, setIntroKey] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundError, setSoundError] = useState('');
  const [crtEffects, setCrtEffects] = useState(false);
  const [warmLamp, setWarmLamp] = useState(false);
  const [wallpaper, setWallpaper] = useState(0);
  const [monitorOn, setMonitorOn] = useState(true);
  const [pressedKey, setPressedKey] = useState('');
  const [contactDraft, setContactDraft] = useState(EMPTY_DRAFT);
  const [contactStatus, setContactStatus] = useState({ kind: '', message: '' });
  const [sending, setSending] = useState(false);
  const audio = useRef(null);
  const audioEnabled = useRef(false);
  const keyTimer = useRef(null);
  const postGate = useRef(false);
  const requestController = useRef(null);

  useEffect(() => {
    if (location.pathname !== '/' || location.hash) setBootOpen(false);
  }, [location.pathname, location.hash]);
  useEffect(() => () => {
    clearTimeout(keyTimer.current);
    requestController.current?.abort();
    audio.current?.close?.().catch?.(() => {});
  }, []);

  const playSound = useCallback((kind = 'click') => {
    if (!audioEnabled.current || !audio.current) return;
    const context = audio.current;
    context.resume?.().catch?.(() => {});
    // 'boot' is an original C-E-G-C arpeggio whose last note rings out; 'startup' is the short toggle blip.
    const notes = kind === 'boot' ? [262, 330, 392, 523] : kind === 'startup' ? [262, 330, 392] : [kind === 'key' ? 420 : 880];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * (kind === 'boot' ? 0.11 : 0.08);
      const duration = kind === 'boot' ? (index === notes.length - 1 ? 0.6 : 0.14) : kind === 'startup' ? 0.1 : 0.025;
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.025, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start); oscillator.stop(start + duration);
    });
  }, []);
  const toggleSound = useCallback(() => {
    if (audioEnabled.current) { audioEnabled.current = false; setSoundEnabled(false); return; }
    try {
      const Constructor = window.AudioContext || window.webkitAudioContext;
      if (!Constructor) throw new Error('Audio is unavailable in this browser.');
      if (!audio.current) audio.current = new Constructor();
      audioEnabled.current = true; setSoundEnabled(true); setSoundError(''); playSound('startup');
    } catch { setSoundError('Audio is unavailable in this browser.'); }
  }, [playSound]);
  const pressKey = useCallback(key => {
    playSound('key');
    if (reducedMotion || !/^[a-z ]$/i.test(key)) return;
    clearTimeout(keyTimer.current); setPressedKey(key.toUpperCase());
    keyTimer.current = setTimeout(() => setPressedKey(''), 120);
  }, [playSound, reducedMotion]);
  const finishBoot = useCallback(mode => {
    try { sessionStorage.setItem('kurt-os-boot-seen', 'true'); } catch { /* Session storage is optional. */ }
    setBootOpen(false); setMonitorOn(true); playSound('boot');
    if (mode === '2d') expandDesktop();
    else if (canUse3D) { showDesk(); setIntroKey(key => key + 1); }
    else focusMonitor();
  }, [canUse3D, expandDesktop, showDesk, focusMonitor, playSound]);

  const sendContact = useCallback(async form => {
    if (postGate.current || !form.reportValidity()) return;
    const body = new FormData(form);
    if (body.get('botcheck')) { setContactStatus({ kind: 'error', message: 'Message could not be sent.' }); return; }
    if (!contactDraft.name.trim() || !contactDraft.message.trim()) { setContactStatus({ kind: 'error', message: 'Please enter your name and a message.' }); return; }
    body.set('name', contactDraft.name.trim()); body.set('message', contactDraft.message.trim());
    body.set('access_key', '7cc12d95-21e2-4303-ad52-e4ee6f819d5b');
    body.set('subject', 'New Portfolio Message from ' + contactDraft.name.trim());
    postGate.current = true; setSending(true); setContactStatus({ kind: '', message: '' });
    requestController.current = new AbortController();
    try {
      const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body, signal: requestController.current.signal });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.message || 'Message could not be sent.');
      setContactStatus({ kind: 'success', message: 'Message sent. Thanks for reaching out.' }); setContactDraft(EMPTY_DRAFT);
    } catch (error) {
      if (error.name !== 'AbortError') setContactStatus({ kind: 'error', message: error.message || 'Your message could not be sent. Please try again or email ' + portfolioProfile.email + ' directly.' });
    } finally { postGate.current = false; setSending(false); }
  }, [contactDraft]);

  return <RetroOSContext.Provider value={{ theme, bootOpen, introKey, soundEnabled, soundError, crtEffects, warmLamp, wallpaper, monitorOn, pressedKey, contactDraft, contactStatus, sending, toggleSound, playSound, pressKey, finishBoot, replayBoot: () => setBootOpen(true), toggleCrt: () => setCrtEffects(value => !value), toggleLamp: () => setWarmLamp(value => !value), cycleWallpaper: () => setWallpaper(value => (value + 1) % 3), togglePower: () => setMonitorOn(value => !value), powerOn: () => setMonitorOn(true), setContactDraft, sendContact }}>{children}</RetroOSContext.Provider>;
}
export function useRetroOS() { return useContext(RetroOSContext) || defaults; }
