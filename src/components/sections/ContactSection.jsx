import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import WaveBackground from '../common/WaveBackground';

export default function ContactSection() {
  const { spawnToast, copyEmail } = useModal();
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
    <section className="section contact-section hero-themed-contact" id="contact">
      {/* Ambient Wave Background matching Hero */}
      <div className="contact-bg-wrapper" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <WaveBackground />
      </div>

      <div className="wrap profile-wrap contact-wrap" style={{ position: 'relative', zIndex: 2 }}>
        {/* Hero-style Center Header */}
        <div className="hero-center-content contact-hero-header">
          <h2 className="hero-title contact-hero-title">
            <span className="title-line line-1">LET'S BUILD</span>
            <span className="title-line line-2">SOMETHING TOGETHER</span>
          </h2>
        </div>

        <div className="contact-box contact-box-hero">
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
                rows="5"
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
