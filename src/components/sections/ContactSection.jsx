/* ========================================
   CONTACT SECTION  |  Web3Forms Submission & Reliable Mailto Fallback
   ======================================== */

import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';

export default function ContactSection() {
  const { copyEmail, openResumeModal, spawnToast } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submissionData = new FormData();
    submissionData.append('access_key', 'ec413636-eea9-417e-b7e8-4ca659c3a80b');
    submissionData.append('subject', `Portfolio Message: ${formData.topic || 'General Inquiry'} from ${formData.name}`);
    submissionData.append('name', formData.name);
    submissionData.append('email', formData.email);
    submissionData.append('topic', formData.topic);
    submissionData.append('message', formData.message);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: submissionData,
        headers: {
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success !== false) {
        spawnToast('MESSAGE SENT', 'Thanks for reaching out! Kurt will reply as soon as possible.');
        setFormData({ name: '', email: '', topic: '', message: '' });
      } else {
        // Fallback to mailto if API key is invalid or blocked
        spawnToast('OPENING EMAIL APP', 'Opening your mail client to send directly to kurtfarinas2022@gmail.com...');
        const mailtoUrl = `mailto:kurtfarinas2022@gmail.com?subject=${encodeURIComponent(formData.topic || 'Portfolio Contact')}&body=${encodeURIComponent(`From: ${formData.name} (${formData.email})\n\n${formData.message}`)}`;
        setTimeout(() => {
          window.location.href = mailtoUrl;
        }, 600);
      }
    } catch {
      // Graceful fallback for network issues
      spawnToast('MESSAGE QUEUED', 'Opening email client directly to kurtfarinas2022@gmail.com...');
      const mailtoUrl = `mailto:kurtfarinas2022@gmail.com?subject=${encodeURIComponent(formData.topic || 'Portfolio Contact')}&body=${encodeURIComponent(`From: ${formData.name} (${formData.email})\n\n${formData.message}`)}`;
      window.location.href = mailtoUrl;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section contact-section" id="contact">
      <div className="wrap profile-wrap">
        <div className="profile-header-divider">
          <span className="profile-eyebrow">
            <span className="eyebrow-index">// 07.00</span> — CONTACT
          </span>
        </div>

        <div className="section-title-block" style={{ textAlign: 'center' }}>
          <h2 className="profile-title">Get in Touch</h2>
          <p className="profile-header-sub">
            <span className="status-open-to-work">Open to Junior Full-Stack Developer roles</span>.
          </p>
        </div>

        <div className="contact-box">
          {/* Quick Contact Toolbar */}
          <div className="quick-contact-bar">
            <button type="button" className="quick-contact-btn" onClick={copyEmail}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              <span>Copy Email</span>
            </button>

            <button type="button" className="quick-contact-btn" onClick={openResumeModal}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>Resume PDF</span>
            </button>

            <a
              href="https://www.linkedin.com/in/kurt-vincent-fari%C3%B1as-315ab1367"
              target="_blank"
              rel="noopener noreferrer"
              className="quick-contact-btn"
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75-1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"></path>
              </svg>
              <span>LinkedIn ↗</span>
            </a>

            <a
              href="https://github.com/kurt-farinas"
              target="_blank"
              rel="noopener noreferrer"
              className="quick-contact-btn"
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"></path>
              </svg>
              <span>GitHub ↗</span>
            </a>
          </div>

          {/* Contact Form */}
          <form id="contactForm" className="contact-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="contactName">Your Name</label>
                <input
                  type="text"
                  id="contactName"
                  name="name"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactEmail">Your Email</label>
                <input
                  type="email"
                  id="contactEmail"
                  name="email"
                  required
                  placeholder="alex@company.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contactSubject">Subject</label>
              <input
                type="text"
                id="contactSubject"
                name="topic"
                required
                placeholder="Job Opportunity / Frontend Contract / System Project"
                value={formData.topic}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactMessage">Message</label>
              <textarea
                id="contactMessage"
                name="message"
                rows="4"
                required
                placeholder="Your message or project details..."
                value={formData.message}
                onChange={handleChange}
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary form-submit-btn"
              id="contactSubmitBtn"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Sending Message...' : 'Send Message →'}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
