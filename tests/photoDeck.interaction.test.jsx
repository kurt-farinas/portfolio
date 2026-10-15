import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ModalProvider, useModal } from '../src/context/ModalContext';
import PhotoDeckShuffler from '../src/components/common/PhotoDeckShuffler';

const photos = ['one', 'two', 'three'].map(id => ({ id, src: `/images/${id}.jpg`, title: id }));

function LightboxState() {
  const { lightbox } = useModal();
  return <output data-testid="lightbox">{lightbox.isOpen ? lightbox.caption : 'closed'}</output>;
}

describe('photo deck clicks', () => {
  let host;
  let root;
  const top = () => host.querySelector('.deck-stack-level-0 img').getAttribute('alt');
  const click = detail => host.querySelector('.deck-stack-level-0').dispatchEvent(new MouseEvent('click', { bubbles: true, detail }));

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    await act(async () => root.render(<ModalProvider><PhotoDeckShuffler photos={photos} /><LightboxState /></ModalProvider>));
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('double-click opens the photo it started on without shuffling', async () => {
    await act(async () => {
      click(1);
      click(2);
      host.querySelector('.deck-stack-level-0').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      vi.advanceTimersByTime(300);
    });
    expect(host.querySelector('[data-testid="lightbox"]').textContent).toBe('one');
    expect(top()).toBe('one');
  });

  it('a single click shuffles after the double-click window', async () => {
    await act(async () => click(1));
    expect(top()).toBe('one');
    await act(async () => vi.advanceTimersByTime(300));
    expect(top()).toBe('two');
  });
});
