import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ScrollReveals from '../src/components/common/ScrollReveals';

const observers = [];
const animations = [];

class MockObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.targets = new Set();
    this.observe = vi.fn(target => this.targets.add(target));
    this.unobserve = vi.fn(target => this.targets.delete(target));
    this.disconnect = vi.fn(() => this.targets.clear());
    observers.push(this);
  }

  enter(targets) {
    this.callback(targets.filter(target => this.targets.has(target)).map(target => ({ target, isIntersecting: true })));
  }
}

function Fixture({ itemClass = 'studio-project' }) {
  const navigate = useNavigate();
  return (
    <div className="studio-system">
      <button onClick={() => navigate('/gear')}>Change route</button>
      <ScrollReveals />
      <main>
        <div className="studio-about-layout" data-reveal="visible">Already visible</div>
        <div className="items">
          {[0, 1, 2, 3, 4].map(index => <div className={itemClass} key={index}>Item {index}</div>)}
        </div>
      </main>
    </div>
  );
}

describe('ScrollReveals', () => {
  let host, root, preference, animationDescriptor;

  beforeEach(() => {
    observers.length = 0;
    animations.length = 0;
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.stubGlobal('IntersectionObserver', MockObserver);
    preference = {
      matches: false,
      listeners: new Set(),
      addEventListener: vi.fn(function (_event, listener) { this.listeners.add(listener); }),
      removeEventListener: vi.fn(function (_event, listener) { this.listeners.delete(listener); })
    };
    vi.stubGlobal('matchMedia', () => preference);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      const top = this.dataset.reveal === 'visible' ? 0 : 900;
      return { top, bottom: top + 100, left: 0, right: 100, width: 100, height: 100 };
    });
    animationDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'animate');
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      value: vi.fn(() => {
        const animation = { cancel: vi.fn(), finished: new Promise(() => {}) };
        animations.push(animation);
        return animation;
      })
    });
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
    if (animationDescriptor) Object.defineProperty(HTMLElement.prototype, 'animate', animationDescriptor);
    else delete HTMLElement.prototype.animate;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const render = async (root) => {
    await act(async () => root.render(<MemoryRouter initialEntries={['/projects']}><Fixture /></MemoryRouter>));
  };

  it('reveals only offscreen siblings once, with a capped stagger', async () => {
    await render(root);
    const cards = [...host.querySelectorAll('.studio-project')];
    expect([...observers[0].targets]).toEqual(cards);
    expect(observers[0].options).toEqual({ threshold: 0 });

    observers[0].enter(cards);
    expect(HTMLElement.prototype.animate).toHaveBeenCalledTimes(5);
    expect(HTMLElement.prototype.animate.mock.calls.map(([, options]) => options.delay)).toEqual([0, 60, 120, 180, 180]);
    expect(HTMLElement.prototype.animate.mock.calls[0]).toEqual([
      [{ opacity: 0.65, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 450, delay: 0, easing: 'ease-out', fill: 'backwards' }
    ]);
    observers[0].enter(cards);
    expect(HTMLElement.prototype.animate).toHaveBeenCalledTimes(5);
  });

  it.each(['gear-card', 'studio-timeline-item', 'studio-skill-row', 'studio-award'])(
    'staggered %s siblings share the same cap', async itemClass => {
      await act(async () => root.render(<MemoryRouter><Fixture itemClass={itemClass} /></MemoryRouter>));
      observers[0].enter([...host.querySelectorAll(`.${itemClass}`)]);
      expect(HTMLElement.prototype.animate.mock.calls.map(([, options]) => options.delay)).toEqual([0, 60, 120, 180, 180]);
    }
  );

  it('cancels running reveals when the route changes', async () => {
    await render(root);
    observers[0].enter([host.querySelector('.studio-project')]);
    await act(async () => host.querySelector('button').click());
    expect(observers[0].disconnect).toHaveBeenCalledOnce();
    expect(animations[0].cancel).toHaveBeenCalledOnce();
    expect(observers).toHaveLength(2);
  });

  it('skips reveals for reduced motion and cancels them when the preference changes', async () => {
    preference.matches = true;
    await render(root);
    expect(observers).toHaveLength(0);
    await act(async () => root.unmount());
    root = createRoot(host);
    preference.matches = false;
    await render(root);
    observers[0].enter([host.querySelector('.studio-project')]);
    preference.matches = true;
    preference.listeners.forEach(listener => listener());
    expect(observers[0].disconnect).toHaveBeenCalledOnce();
    expect(animations[0].cancel).toHaveBeenCalledOnce();
    expect(host.querySelector('.studio-project').style.opacity).toBe('');
  });

  it('leaves content visible without IntersectionObserver or animate', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    await render(root);
    expect(observers).toHaveLength(0);
    expect(host.querySelector('.studio-project').style.transform).toBe('');
    await act(async () => root.unmount());
    root = createRoot(host);
    vi.stubGlobal('IntersectionObserver', MockObserver);
    delete HTMLElement.prototype.animate;
    await render(root);
    observers[0].enter([host.querySelector('.studio-project')]);
    expect(animations).toHaveLength(0);
    expect(host.querySelector('.studio-project').style.opacity).toBe('');
  });
});
