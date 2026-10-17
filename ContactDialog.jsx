import React, { useEffect, useRef } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import Arrow from './Arrow';

export default function ContactDialog({ onClose }) {
  const dialog = useRef(null);
  const [formState, submit] = useForm('mjyglvln', { data: { subject: 'XLARGI website enquiry' } });
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = old; };
  }, []);
  return <dialog ref={dialog} className="contact-dialog" aria-labelledby="contact-title" onCancel={onClose} onClick={event => { if (event.target === dialog.current) onClose(); }}>
    <div className="dialog-inner">
      <button className="close-button" type="button" onClick={onClose} aria-label="Close contact form">×</button>
      <p className="eyebrow">LET’S BUILD WHAT’S NEXT</p>
      <h2 id="contact-title">Start a conversation.</h2>
      <p className="dialog-intro">Tell us where you want to go. We’ll help you get there.</p>
      {formState.succeeded ? <div className="contact-success" role="status"><h3>Message received.</h3><p>Thank you for getting in touch. We’ll be in touch soon.</p><button type="button" className="pill light" onClick={onClose}>Done <Arrow /></button></div> : <form action="https://formspree.io/f/mjyglvln" method="POST" onSubmit={submit} aria-busy={formState.submitting}>
        <input type="text" name="_gotcha" tabIndex="-1" autoComplete="off" className="contact-honeypot" aria-hidden="true" />
        <div className="form-row"><label>Your name<input name="name" autoComplete="name" required /></label><label>Work email<input type="email" name="email" autoComplete="email" required /></label></div>
        <label>Company<input name="company" autoComplete="organization" /></label>
        <label>What are you working on?<textarea name="message" rows="3" required /></label>
        <div className="contact-errors" role="alert"><ValidationError field="name" prefix="Name" errors={formState.errors} /><ValidationError field="email" prefix="Email" errors={formState.errors} /><ValidationError field="message" prefix="Message" errors={formState.errors} /><ValidationError errors={formState.errors} /></div>
        <button type="submit" className="pill light" disabled={formState.submitting}>{formState.submitting ? 'Sending…' : 'Message us'} <Arrow /></button>
      </form>}
    </div>
  </dialog>;
}

