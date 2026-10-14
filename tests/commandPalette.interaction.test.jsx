import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ModalProvider, useModal } from '../src/context/ModalContext';
import CommandPalette from '../src/components/common/CommandPalette';

function OpenPalette() {
  const { openCommandPalette } = useModal();
  return <button onClick={openCommandPalette}>Open commands</button>;
}

describe('Command palette keyboard navigation', () => {
  let host;
  let root;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.stubGlobal('requestAnimationFrame', (callback) => setTimeout(callback, 0));
    vi.stubGlobal('cancelAnimationFrame', clearTimeout);
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{ width: 100, height: 44 }]);
    HTMLElement.prototype.scrollIntoView = vi.fn();
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    await act(async () => {
      root.render(<MemoryRouter><ThemeProvider><ModalProvider><OpenPalette /><CommandPalette /></ModalProvider></ThemeProvider></MemoryRouter>);
    });
    await act(async () => {
      host.querySelector('button').focus();
      host.querySelector('button').click();
    });
    await act(async () => vi.runAllTimers());
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    localStorage.clear();
  });

  async function press(key) {
    await act(async () => document.querySelector('input').dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })));
  }

  async function search(value) {
    const input = document.querySelector('input');
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  it('moves one command per arrow key and wraps in both directions', async () => {
    const selected = () => document.querySelector('[role="option"][aria-selected="true"]')?.id;
    expect(selected()).toBe('command-jump-experience');
    await press('ArrowDown');
    expect(selected()).toBe('command-jump-about');
    await press('ArrowUp');
    expect(selected()).toBe('command-jump-experience');
    await press('ArrowUp');
    expect(selected()).toBe('command-action-theme');
    expect(document.querySelector('input').getAttribute('aria-activedescendant')).toBe(selected());
  });

  it('recovers keyboard selection after a search with no results', async () => {
    await search('no-command-matches-this');
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(0);
    await press('ArrowDown');
    await press('Enter');
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    await search('');
    expect(document.querySelector('[aria-selected="true"]').id).toBe('command-jump-experience');
    await press('ArrowDown');
    expect(document.querySelector('[aria-selected="true"]').id).toBe('command-jump-about');
  });

  it('closes on Escape and restores the opening button focus', async () => {
    const opener = host.querySelector('button');
    await press('Escape');
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('does not execute a command when Enter is pressed on the close button', async () => {
    const closeButton = document.querySelector('[aria-label="Close command palette"]');
    HTMLElement.prototype.scrollIntoView.mockClear();
    await act(async () => {
      closeButton.focus();
      closeButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
    await act(async () => closeButton.click());
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});
