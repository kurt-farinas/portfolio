/* ========================================
   ASK ANYTHING  |  A prank prompt (Alt+K)
   It looks like an assistant, reads what the browser already exposes,
   explains why that matters, then sends the question to Google.
   Nothing is stored or sent anywhere except the one IP lookup.
   ======================================== */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRetroOS } from '../../context/RetroOSContext';
import useDialogFocus from './useDialogFocus';
import '../../styles/ask.css';

const IP_LOOKUP_URL = 'https://ipwho.is/';
const LOOKUP_TIMEOUT = 3500;
const LINE_DELAY = 2500;
const REDUCED_LINE_DELAY = 200;

const AskContext = createContext({ askOpen: false, openAsk: () => {}, closeAsk: () => {} });

export function AskProvider({ children }) {
  const [askOpen, setAskOpen] = useState(false);
  const openAsk = useCallback(() => setAskOpen(true), []);
  const closeAsk = useCallback(() => setAskOpen(false), []);
  const value = useMemo(() => ({ askOpen, openAsk, closeAsk }), [askOpen, openAsk, closeAsk]);
  return <AskContext.Provider value={value}>{children}</AskContext.Provider>;
}

export function useAsk() {
  return useContext(AskContext);
}

function detectOs(agent, platform) {
  const source = (platform || '') + ' ' + agent;
  if (/android/i.test(source)) return 'Android';
  if (/iphone|ipad|ipod/i.test(source)) return 'iOS';
  if (/cros/i.test(source)) return 'ChromeOS';
  if (/win/i.test(source)) return 'Windows';
  if (/mac/i.test(source)) return 'macOS';
  if (/linux/i.test(source)) return 'Linux';
  return '';
}

function detectBrowser(agent) {
  if (/edg\//i.test(agent)) return 'Edge';
  if (/opr\/|opera/i.test(agent)) return 'Opera';
  if (/samsungbrowser/i.test(agent)) return 'Samsung Internet';
  if (/firefox|fxios/i.test(agent)) return 'Firefox';
  if (/chrome|crios|chromium/i.test(agent)) return 'Chrome';
  if (/safari/i.test(agent)) return 'Safari';
  return '';
}

// The lines a page can read without asking. Missing values are skipped rather than guessed.
export function describeBrowser(nav = navigator, referrer = document.referrer, now = new Date()) {
  const lines = [];
  const agent = nav.userAgent || '';
  const os = detectOs(agent, nav.userAgentData?.platform || nav.platform);
  if (os) lines.push('you are on ' + os);
  if (nav.hardwareConcurrency) lines.push('your device has ' + nav.hardwareConcurrency + ' CPU cores');
  if (nav.deviceMemory) lines.push('and roughly ' + nav.deviceMemory + ' GB of memory');
  const browser = detectBrowser(agent);
  if (browser || nav.language) lines.push([browser && 'you browse with ' + browser, nav.language && 'in ' + nav.language].filter(Boolean).join(', '));
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    lines.push((zone ? 'your timezone is ' + zone + ', so it is ' : 'it is ') + time + ' for you');
  } catch { /* Intl is optional. */ }
  const connection = nav.connection;
  if (connection?.effectiveType) lines.push('your connection feels like ' + connection.effectiveType + (connection.downlink ? ' at about ' + connection.downlink + ' Mbps' : ''));
  let host = '';
  try { host = referrer ? new URL(referrer).host : ''; } catch { /* An unreadable referrer counts as none. */ }
  lines.push(host ? 'you got here from ' + host : 'no referrer, so you came here directly');
  return lines;
}

export function describeLookup(data) {
  if (!data || data.success === false || !data.ip) return [];
  const lines = ['your IP address is ' + data.ip];
  const place = [data.city, data.region, data.country].filter(Boolean).join(', ');
  if (place) lines.push('which puts you around ' + place);
  if (data.connection?.isp) lines.push('your internet comes from ' + data.connection.isp);
  if (Number.isFinite(data.latitude) && Number.isFinite(data.longitude)) lines.push('roughly at ' + data.latitude.toFixed(2) + ', ' + data.longitude.toFixed(2));
  return lines;
}

async function lookupVisitor(signal) {
  try {
    const response = await fetch(IP_LOOKUP_URL, { signal, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function AskOverlay() {
  const { askOpen, openAsk, closeAsk } = useAsk();
  const { bootOpen } = useRetroOS();
  const [question, setQuestion] = useState('');
  const [asked, setAsked] = useState('');
  const [status, setStatus] = useState('');
  const [lines, setLines] = useState([]);
  const [searchUrl, setSearchUrl] = useState('');
  const sequenceRef = useRef(0);
  const timersRef = useRef(new Set());
  const abortRef = useRef(null);
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const closeRef = useRef(null);
  const dialogRef = useDialogFocus(askOpen);

  // Every close or new question bumps the sequence, so stale steps stop where they are.
  const cancelSequence = useCallback(() => {
    sequenceRef.current += 1;
    timersRef.current.forEach(timer => window.clearTimeout(timer));
    timersRef.current.clear();
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  useEffect(() => {
    const onKeyDown = event => {
      if (event.altKey && !event.ctrlKey && !event.metaKey && event.code === 'KeyK' && !bootOpen) {
        event.preventDefault();
        openAsk();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openAsk, bootOpen]);

  useEffect(() => {
    if (askOpen) return undefined;
    cancelSequence();
    setQuestion('');
    setAsked('');
    setStatus('');
    setLines([]);
    setSearchUrl('');
    return undefined;
  }, [askOpen, cancelSequence]);

  useEffect(() => cancelSequence, [cancelSequence]);

  useEffect(() => {
    if (!askOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [askOpen]);

  // The input unmounts once the question is asked; keep focus inside the dialog.
  useEffect(() => {
    if (asked) closeRef.current?.focus();
  }, [asked]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [lines, status]);

  const runSequence = async text => {
    cancelSequence();
    const sequence = sequenceRef.current;
    const alive = () => sequenceRef.current === sequence;
    const reduced = prefersReducedMotion();
    const wait = ms => new Promise(resolve => {
      const timer = window.setTimeout(() => { timersRef.current.delete(timer); resolve(); }, reduced ? Math.min(ms, REDUCED_LINE_DELAY) : ms);
      timersRef.current.add(timer);
    });
    const say = (line, kind = 'fact') => setLines(current => [...current, { id: current.length, text: line, kind }]);

    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), LOOKUP_TIMEOUT);
    timersRef.current.add(timeout);
    const lookup = lookupVisitor(controller.signal);

    setAsked(text);
    setStatus('thinking');
    await wait(1400);
    if (!alive()) return;
    setStatus('analyzing');
    const [visitor] = await Promise.all([lookup, wait(1800)]);
    window.clearTimeout(timeout);
    timersRef.current.delete(timeout);
    if (!alive()) return;
    setStatus('');

    const facts = [...describeLookup(visitor), ...describeBrowser()];
    for (const fact of facts) {
      say(fact);
      await wait(LINE_DELAY);
      if (!alive()) return;
    }
    say('none of this needed your permission.', 'lesson');
    await wait(LINE_DELAY);
    if (!alive()) return;
    say('every site you open can read the same details. a VPN hides your IP, and privacy-focused browsers trim the rest.', 'lesson');
    await wait(LINE_DELAY);
    if (!alive()) return;
    say('as for your question…', 'answer');
    await wait(LINE_DELAY);
    if (!alive()) return;
    say("i don't want to waste tokens on that, search for it yourself :)", 'answer');
    await wait(1200);
    if (!alive()) return;
    const url = 'https://www.google.com/search?q=' + encodeURIComponent(text);
    setSearchUrl(url);
    window.open(url, '_blank', 'noopener');
  };

  const submit = event => {
    event.preventDefault();
    const text = question.trim();
    if (!text || asked) return;
    runSequence(text);
  };

  const onKeyDown = event => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    closeAsk();
  };

  if (!askOpen) return null;

  return (
    <div className="ask-overlay" onClick={closeAsk}>
      <div
        ref={dialogRef}
        className="ask-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Ask anything"
        onClick={event => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        {!asked ? (
          <form className="ask-form" onSubmit={submit}>
            <label className="ask-prompt" htmlFor="ask-input">what do you want to ask?</label>
            <div className="ask-field">
              <input
                ref={inputRef}
                id="ask-input"
                className="ask-input"
                type="text"
                value={question}
                onChange={event => setQuestion(event.target.value)}
                autoComplete="off"
                spellCheck="false"
                enterKeyHint="send"
                maxLength="200"
              />
              <span className="ask-typed" aria-hidden="true">{question}<span className="ask-caret" /></span>
            </div>
            <p className="ask-hint"><span>Press Enter to ask · Esc to close</span><button type="submit" className="ask-button" disabled={!question.trim()}>Ask</button></p>
          </form>
        ) : (
          <div className="ask-conversation">
            <p className="ask-bubble"><span className="ask-visually-hidden">You asked: </span>{asked}</p>
            <div className="ask-log" ref={logRef} role="log" aria-live="polite">
              {status && <p className="ask-status">{status === 'thinking' ? 'thinking…' : 'analyzing…'}{status === 'analyzing' && <span className="ask-loader" aria-hidden="true"><i /><i /><i /></span>}</p>}
              {lines.map(line => <p key={line.id} className={'ask-line ask-line-' + line.kind}>{line.text}</p>)}
            </div>
            {searchUrl && <a className="ask-button" href={searchUrl} target="_blank" rel="noopener noreferrer">Open the Google search</a>}
          </div>
        )}
        <button ref={closeRef} type="button" className="ask-button ask-close" onClick={closeAsk} aria-label="Close Ask anything">Close</button>
      </div>
    </div>
  );
}
