/* ========================================
   CONTACT FORM  |  Web3Forms / Direct Submission Handler
   ======================================== */

import { spawnToast } from './utils.js';

export function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('contactSubmitBtn');
    const originalText = submitBtn ? submitBtn.innerHTML : 'Send Message →';

    // Set loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending...</span>';
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success !== false) {
        spawnToast('MESSAGE SENT', 'Thanks for reaching out! Kurt will reply as soon as possible.');
        form.reset();
      } else {
        // Trigger mailto fallback with filled fields if key is inactive
        spawnToast('EMAIL CLIENT OPENED', 'Opening your mail app to send directly to kurtfarinas2022@gmail.com...');
        const name = formData.get('name') || '';
        const email = formData.get('email') || '';
        const topic = formData.get('topic') || '';
        const message = formData.get('message') || '';

        const mailtoUrl = `mailto:kurtfarinas2022@gmail.com?subject=${encodeURIComponent(topic || 'Portfolio Contact')}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
        setTimeout(() => {
          window.location.href = mailtoUrl;
        }, 800);
      }
    } catch (err) {
      // Graceful fallback for network issues or client error
      spawnToast('MESSAGE QUEUED', 'Opening email client as fallback...');
      const name = formData.get('name') || '';
      const email = formData.get('email') || '';
      const topic = formData.get('topic') || '';
      const message = formData.get('message') || '';

      const mailtoUrl = `mailto:kurtfarinas2022@gmail.com?subject=${encodeURIComponent(topic || 'Portfolio Contact')}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
      window.location.href = mailtoUrl;
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    }
  });
}
