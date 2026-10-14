import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Hero from '../src/components/sections/Hero';
import PortfolioImage, { hasPortfolioImage } from '../src/components/common/PortfolioImage';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ModalProvider } from '../src/context/ModalContext';

describe('Profile introduction and original imagery', () => {
  let host, root;
  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  });
  afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
  it('shows the concise profile and labeled contact icons without a canvas', async () => {
    await act(async () => root.render(<ThemeProvider><ModalProvider><Hero /></ModalProvider></ThemeProvider>));
    expect(host.querySelector('h1').textContent).toContain('interfaces and workflow systems');
    expect(host.textContent).not.toContain('98/100'); expect(host.textContent).not.toContain('342');
    expect(host.textContent).not.toContain('Open to developer opportunities');
    expect(host.querySelector('.studio-availability')).toBeNull();
    expect(host.querySelector('canvas')).toBeNull();
    expect(host.querySelector('img').getAttribute('src')).toBe('/optimized/images/kurt-farinas-profile.png.webp');
    const resumeLink = host.querySelector('a.studio-profile-resume');
    expect(resumeLink.getAttribute('href')).toBe('/resume.pdf');
    expect(resumeLink.getAttribute('target')).toBe('_blank');
    expect(resumeLink.getAttribute('rel')).toBe('noopener noreferrer');
    expect(host.querySelector('a[href="#projects"]')).toBeNull();
    expect(host.querySelector('.studio-hero-description')).toBeNull();
    expect(host.querySelector('[aria-label="GitHub profile"] svg')).not.toBeNull();
    expect(host.querySelector('[aria-label="LinkedIn profile"] svg')).not.toBeNull();
    expect(host.querySelector('[aria-label="Copy email address"] svg')).not.toBeNull();
  });
  it('renders original screenshots with their original dimensions in any scheme', async () => {
    document.documentElement.dataset.theme = 'dark';
    await act(async () => root.render(<PortfolioImage src="hris-admin.png" alt="Admin dashboard" />));
    const image = host.querySelector('img');
    expect(image.getAttribute('src')).toBe('/optimized/hris-admin.png.webp');
    expect(Number(image.getAttribute('width'))).toBeGreaterThan(0);
    expect(Number(image.getAttribute('height'))).toBeGreaterThan(0);
    expect(image.getAttribute('loading')).toBe('lazy');
    expect(hasPortfolioImage('/images/outside/mchose-ace60-side.jpg')).toBe(false);
    expect(hasPortfolioImage('/images/kurt-farinas-profile.png')).toBe(true);
  });
  it('falls back to the original file when the WebP copy fails, then reports a second failure', async () => {
    const onError = vi.fn();
    await act(async () => root.render(<PortfolioImage src="/hris-admin.png" alt="Admin dashboard" onError={onError} />));
    const image = host.querySelector('img');
    await act(async () => image.dispatchEvent(new Event('error')));
    expect(image.getAttribute('src')).toBe('/hris-admin.png');
    expect(onError).not.toHaveBeenCalled();
    await act(async () => image.dispatchEvent(new Event('error')));
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
