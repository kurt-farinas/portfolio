import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { useDesktopWorkspace } from './DesktopWorkspaceContext';
import { useModal } from './ModalContext';
import { portfolioProfile } from '../data/portfolioFacts';
import { featuredProjectIds } from '../data/projectData';
import { createSoundKit, keySoundFor } from '../utils/retroSound';

// Session-only achievements: stored in sessionStorage, never sent anywhere.
export const ACHIEVEMENTS = [
  { id: 'explorer', label: 'Desk explorer', hint: 'Open apps from 5 different desk objects' },
  { id: 'reader', label: 'Case-study reader', hint: 'Open all six project case studies' },
  { id: 'wordsmith', label: 'Wordsmith', hint: 'Solve KurtOrdle' },
  { id: 'exterminator', label: 'Exterminator', hint: 'Clear a Bugsweeper board' },
  { id: 'paper-trail', label: 'Paper trail', hint: 'Print the résumé from the desk printer' }
];
const ACHIEVEMENT_KEY = 'kurt-os-achievements';
const SOUND_KEY = 'kurt-os-sound';
const CRT_KEY = 'kurt-os-crt';
// Length of the 3D monitor power-on shown during the room intro (matches the CSS animation in retro-os.css).
export const SCREEN_BOOT_MS = 2800;

export const RetroOSContext = createContext(null);
const noop = () => {};
const EMPTY_DRAFT = { name: '', email: '', message: '' };
const defaults = { theme: 'dark', bootOpen: false, introKey: 0, claimIntro: () => false, achievements: [], unlock: noop, noteDeskOpen: noop, soundEnabled: false, soundError: '', screenBooting: false, endScreenBoot: noop, crtEffects: false, warmLamp: false, wallpaper: 0, monitorOn: true, pressedKey: '', contactDraft: EMPTY_DRAFT, contactStatus: { kind: '', message: '' }, sending: false, toggleSound: noop, toggleCrt: noop, toggleLamp: noop, cycleWallpaper: noop, togglePower: noop, powerOn: noop, replayBoot: noop, finishBoot: noop, playSound: noop, pressKey: noop, setContactDraft: noop, sendContact: noop };

export function RetroOSProvider({ children }) {
  const location = useLocation();
  const { theme } = useTheme();
  const { canUse3D, focusMonitor, expandDesktop, showDesk, reducedMotion } = useDesktopWorkspace();
  const [bootOpen, setBootOpen] = useState(() => {
    try { return location.pathname === '/' && !location.hash && sessionStorage.getItem('kurt-os-boot-seen') !== 'true'; }
    catch { return location.pathname === '/' && !location.hash; }
  });
  const [introKey, setIntroKey] = useState(0);
  const playedIntro = useRef(0);
  const claimIntro = useCallback(key => {
    if (!key || key <= playedIntro.current) return false;
    playedIntro.current = key;
    return true;
  }, []);
  // Sound is on by default and remembered; the browser only lets audio start inside the visitor's first click or key press.
  const [soundEnabled, setSoundEnabled] = useState(() => { try { return localStorage.getItem(SOUND_KEY) !== 'off'; } catch { return true; } });
  const [audioReady, setAudioReady] = useState(false);
  const [soundError, setSoundError] = useState('');
  const [crtEffects, setCrtEffects] = useState(() => { try { return localStorage.getItem(CRT_KEY) !== 'off'; } catch { return true; } });
  const [warmLamp, setWarmLamp] = useState(false);
  const [wallpaper, setWallpaper] = useState(0);
  const [monitorOn, setMonitorOn] = useState(true);
  const [pressedKey, setPressedKey] = useState('');
  const [contactDraft, setContactDraft] = useState(EMPTY_DRAFT);
  const [contactStatus, setContactStatus] = useState({ kind: '', message: '' });
  const [sending, setSending] = useState(false);
  const audio = useRef(null);
  const kit = useRef(null);
  const audioEnabled = useRef(soundEnabled);
  const keyTimer = useRef(null);
  const [screenBooting, setScreenBooting] = useState(false);
  const bootTimers = useRef([]);
  const postGate = useRef(false);
  const requestController = useRef(null);

  useEffect(() => {
    if (location.pathname !== '/' || location.hash) setBootOpen(false);
  }, [location.pathname, location.hash]);
  useEffect(() => () => {
    clearTimeout(keyTimer.current);
    bootTimers.current.forEach(clearTimeout);
    requestController.current?.abort();
    audio.current?.close?.().catch?.(() => {});
  }, []);

  // Created lazily from the first sound request, which comes from a click or key press.
  const ensureAudio = useCallback(() => {
    if (kit.current) { audio.current.resume?.().catch?.(() => {}); return true; }
    try {
      const Constructor = window.AudioContext || window.webkitAudioContext;
      if (!Constructor) throw new Error('unavailable');
      audio.current = new Constructor();
      kit.current = createSoundKit(audio.current);
      setAudioReady(true);
      return true;
    } catch { setSoundError('Audio is unavailable in this browser.'); return false; }
  }, []);
  const playSound = useCallback((kind = 'click') => {
    if (!kind || !audioEnabled.current || !ensureAudio()) return;
    kit.current.play(kind);
  }, [ensureAudio]);
  const toggleSound = useCallback(() => {
    const next = !audioEnabled.current;
    audioEnabled.current = next; setSoundEnabled(next);
    try { localStorage.setItem(SOUND_KEY, next ? 'on' : 'off'); } catch { /* Storage is optional. */ }
    if (next) { setSoundError(''); playSound('startup'); }
  }, [playSound]);
  // Ambient PC fan + CRT hum while sound is on, the monitor is powered and the tab is visible.
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  useEffect(() => {
    const change = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  const pressKey = useCallback(event => {
    playSound(keySoundFor(event));
    const key = event.key;
    if (reducedMotion || !/^[a-z ]$/i.test(key)) return;
    clearTimeout(keyTimer.current); setPressedKey(key.toUpperCase());
    keyTimer.current = setTimeout(() => setPressedKey(''), 120);
  }, [playSound, reducedMotion]);
  const { spawnToast, selectedProjectId } = useModal();
  const [achievements, setAchievements] = useState(() => { try { return JSON.parse(sessionStorage.getItem(ACHIEVEMENT_KEY)) || []; } catch { return []; } });
  const unlock = useCallback(id => setAchievements(current => {
    if (current.includes(id)) return current;
    const next = [...current, id];
    try { sessionStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(next)); } catch { /* Session storage is optional. */ }
    spawnToast?.('Achievement unlocked', ACHIEVEMENTS.find(item => item.id === id)?.label);
    return next;
  }), [spawnToast]);
  const deskOpens = useRef(new Set());
  const noteDeskOpen = useCallback(target => { deskOpens.current.add(target); if (deskOpens.current.size >= 5) unlock('explorer'); }, [unlock]);
  const projectsRead = useRef(new Set());
  useEffect(() => {
    if (!selectedProjectId) return;
    projectsRead.current.add(selectedProjectId);
    // Project dialogs are keyed by featuredProjectIds (e.g. 'pmpcPis'), not by each project's id field.
    if (featuredProjectIds.every(id => projectsRead.current.has(id))) unlock('reader');
  }, [selectedProjectId, unlock]);
  useEffect(() => {
    if (!kit.current) return;
    if (soundEnabled && audioReady && monitorOn && pageVisible) kit.current.startAmbient();
    else kit.current.stopAmbient();
  }, [soundEnabled, audioReady, monitorOn, pageVisible]);
  const togglePower = useCallback(() => { if (!monitorOn) playSound('power'); setMonitorOn(value => !value); }, [monitorOn, playSound]);
  const finishBoot = useCallback(mode => {
    try { sessionStorage.setItem('kurt-os-boot-seen', 'true'); } catch { /* Session storage is optional. */ }
    setBootOpen(false); setMonitorOn(true);
    bootTimers.current.forEach(clearTimeout);
    if (mode !== '2d' && canUse3D && !reducedMotion) {
      // The room's monitor powers on during the intro: CRT thunk first, then the POST beep as the BIOS text appears.
      setScreenBooting(true); playSound('power');
      bootTimers.current = [setTimeout(() => playSound('boot'), 800), setTimeout(() => setScreenBooting(false), SCREEN_BOOT_MS)];
    } else playSound('boot');
    if (mode === '2d') expandDesktop();
    else if (canUse3D) { showDesk(); setIntroKey(key => key + 1); }
    else focusMonitor();
  }, [canUse3D, reducedMotion, expandDesktop, showDesk, focusMonitor, playSound]);
  const endScreenBoot = useCallback(() => { bootTimers.current.forEach(clearTimeout); bootTimers.current = []; setScreenBooting(false); }, []);

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

  return <RetroOSContext.Provider value={{ theme, bootOpen, introKey, claimIntro, achievements, unlock, noteDeskOpen, soundEnabled, soundError, screenBooting, endScreenBoot, crtEffects, warmLamp, wallpaper, monitorOn, pressedKey, contactDraft, contactStatus, sending, toggleSound, playSound, pressKey, finishBoot, replayBoot: () => setBootOpen(true), toggleCrt: () => setCrtEffects(value => { try { localStorage.setItem(CRT_KEY, value ? 'off' : 'on'); } catch { /* Storage is optional. */ } return !value; }), toggleLamp: () => setWarmLamp(value => !value), cycleWallpaper: () => setWallpaper(value => (value + 1) % 3), togglePower, powerOn: () => { setMonitorOn(true); playSound('power'); }, setContactDraft, sendContact }}>{children}</RetroOSContext.Provider>;
}
export function useRetroOS() { return useContext(RetroOSContext) || defaults; }
