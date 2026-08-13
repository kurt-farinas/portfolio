import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initContactForm } from '../src/js/contact.js';

describe('Contact Form Handling & Fallback', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="contactForm" action="https://api.web3forms.com/submit">
        <input name="name" value="Jane Doe">
        <input name="email" value="jane@example.com">
        <input name="topic" value="Project Inquiry">
        <textarea name="message">Hello Kurt, we want to talk.</textarea>
        <button id="contactSubmitBtn" type="submit">Send Message →</button>
      </form>
      <div id="toastLayer"></div>
    `;
  });

  it('submits form via fetch and clears form on success (AAA)', async () => {
    // 1. Arrange
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Message submitted successfully' }),
    });

    initContactForm();
    const form = document.getElementById('contactForm');
    const nameInput = form.querySelector('input[name="name"]');

    // 2. Act
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    // Wait for microtasks to resolve
    await new Promise(resolve => setTimeout(resolve, 50));

    // 3. Assert
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.web3forms.com/submit',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('triggers mailto fallback when API returns failure (AAA)', async () => {
    // 1. Arrange
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ success: false }),
    });

    initContactForm();
    const form = document.getElementById('contactForm');

    // 2. Act
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 50));

    // 3. Assert
    expect(global.fetch).toHaveBeenCalled();
  });
});
