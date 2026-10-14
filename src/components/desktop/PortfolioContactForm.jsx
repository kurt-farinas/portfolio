import React from 'react';
import { useRetroOS } from '../../context/RetroOSContext';
import { portfolioProfile } from '../../data/portfolioFacts';

export default function PortfolioContactForm() {
  const { contactDraft, setContactDraft, contactStatus, sending, sendContact } = useRetroOS();
  const update = event => setContactDraft(current => ({ ...current, [event.target.name]: event.target.value }));
  return <form className="retro-mail-form" onSubmit={event => { event.preventDefault(); sendContact(event.currentTarget); }}>
    <p className="retro-mail-to"><strong>To:</strong> {portfolioProfile.name} &lt;{portfolioProfile.email}&gt;</p>
    <p className="retro-mail-to"><strong>Subject:</strong> Portfolio message</p>
    <p>Your message will be sent directly to Kurt’s inbox through Web3Forms.</p>
    <input className="studio-contact-honeypot" type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <label>Your name<input name="name" autoComplete="name" required maxLength={120} value={contactDraft.name} onChange={update} disabled={sending} /></label>
    <label>Your email<input name="email" type="email" autoComplete="email" required maxLength={254} value={contactDraft.email} onChange={update} disabled={sending} /></label>
    <label>Message<textarea name="message" required rows={6} maxLength={5000} value={contactDraft.message} onChange={update} disabled={sending} /></label>
    {contactStatus.message && <p className={'retro-mail-status is-' + contactStatus.kind} role="status">{contactStatus.message}</p>}
    <button type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send message'}</button>
    <a href={'mailto:' + portfolioProfile.email}>Email directly instead</a>
  </form>;
}
