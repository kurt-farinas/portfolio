import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AskOverlay, { AskProvider, describeBrowser, describeLookup, useAsk } from '../src/components/common/AskOverlay';

const lookup = { success: true, ip: '203.0.113.7', city: 'Quezon City', region: 'Metro Manila', country: 'Philippines', latitude: 14.676, longitude: 121.0437, connection: { isp: 'Example Fiber' } };

function OpenAsk() {
  const { openAsk } = useAsk();
  return <button type="button" onClick={openAsk}>Open ask</button>;
}

function typeQuestion(input, value) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('Ask anything overlay', () => {
  let host;
  let root;
  let openSpy;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.stubGlobal('requestAnimationFrame', callback => setTimeout(callback, 0));
    vi.stubGlobal('cancelAnimationFrame', clearTimeout);
    vi.stubGlobal('matchMedia', query => ({ matches: query.includes('reduced-motion'), media: query, addEventListener() {}, removeEventListener() {} }));
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => lookup })));
    openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{ width: 100, height: 44 }]);
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    await act(async () => root.render(<AskProvider><OpenAsk /><AskOverlay /></AskProvider>));
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const openWithButton = async () => {
    const opener = host.querySelector('button');
    opener.focus();
    await act(async () => opener.click());
    await act(async () => vi.advanceTimersByTime(10));
    return opener;
  };

  const ask = async text => {
    const input = host.querySelector('#ask-input');
    await act(async () => typeQuestion(input, text));
    await act(async () => input.form.requestSubmit());
  };

  it('opens with Alt+K but leaves Ctrl+K alone', async () => {
    await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', ctrlKey: true })));
    expect(host.querySelector('[role="dialog"]')).toBeNull();
    await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: '˚', code: 'KeyK', altKey: true })));
    expect(host.querySelector('[role="dialog"]').getAttribute('aria-modal')).toBe('true');
    expect(host.textContent).toContain('what do you want to ask?');
  });

  it('reveals the lookup and browser details, then opens a Google search', async () => {
    await openWithButton();
    expect(document.activeElement.id).toBe('ask-input');
    await ask('what is a closure & why?');
    expect(host.querySelector('.ask-bubble').textContent).toContain('what is a closure & why?');
    expect(host.textContent).toContain('thinking…');
    expect(fetch).toHaveBeenCalledWith('https://ipwho.is/', expect.objectContaining({ signal: expect.any(AbortSignal) }));

    await act(async () => vi.advanceTimersByTimeAsync(20000));
    const log = host.querySelector('.ask-log').textContent;
    expect(log).toContain('203.0.113.7');
    expect(log).toContain('Quezon City, Metro Manila, Philippines');
    expect(log).toContain('Example Fiber');
    expect(log).toContain('none of this needed your permission');
    expect(log).toContain('search for it yourself :)');
    expect(openSpy).toHaveBeenCalledWith('https://www.google.com/search?q=what%20is%20a%20closure%20%26%20why%3F', '_blank', 'noopener');
    expect(host.querySelector('a.ask-button').getAttribute('href')).toContain('google.com/search');
  });

  it('skips the IP lines when the lookup fails', async () => {
    fetch.mockRejectedValueOnce(new Error('offline'));
    await openWithButton();
    await ask('hello');
    await act(async () => vi.advanceTimersByTimeAsync(20000));
    const log = host.querySelector('.ask-log').textContent;
    expect(log).not.toContain('IP address');
    expect(log).toContain('none of this needed your permission');
    expect(openSpy).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape, cancels the sequence, and restores focus', async () => {
    const opener = await openWithButton();
    await ask('cancel me');
    await act(async () => host.querySelector('[role="dialog"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(host.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
    await act(async () => vi.advanceTimersByTimeAsync(20000));
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('closes on a backdrop click', async () => {
    await openWithButton();
    await act(async () => host.querySelector('.ask-overlay').click());
    expect(host.querySelector('[role="dialog"]')).toBeNull();
  });

  it('describes failed lookups and missing browser details honestly', () => {
    expect(describeLookup({ success: false })).toEqual([]);
    const lines = describeBrowser({ userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/130.0', hardwareConcurrency: 8, language: 'en-PH' }, '');
    expect(lines).toContain('you are on Windows');
    expect(lines).toContain('your device has 8 CPU cores');
    expect(lines).toContain('you browse with Chrome, in en-PH');
    expect(lines.some(line => line.includes('memory'))).toBe(false);
    expect(lines.at(-1)).toBe('no referrer, so you came here directly');
  });
});
