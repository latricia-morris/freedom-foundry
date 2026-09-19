import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Linkedin, Youtube, Send, CheckCircle2 } from 'lucide-react';
import apiClient from '@/api/client';

const TOPIC_OPTIONS = [
  { value: 'general', label: 'General question' },
  { value: 'brand_consulting', label: 'Brand consulting' },
  { value: 'design', label: 'Design services' },
  { value: 'speaking_media', label: 'Speaking & media' },
  { value: 'support', label: 'Support' },
];

const BUSINESSES = [
  {
    name: 'The Brand Revivalist',
    descriptor: 'Brand Consulting',
    description: 'Brand strategy, positioning, and messaging for founders ready to own their market.',
    url: 'https://thebrandrevivalist.com',
    linkLabel: 'thebrandrevivalist.com',
  },
  {
    name: 'Ox & Iron, LLC',
    descriptor: 'Design Agency',
    description: 'Identity systems, print collateral, and digital design built to last.',
    url: 'https://oxandiron.co',
    linkLabel: 'oxandiron.co',
  },
];

const SOCIALS = [
  { label: 'Facebook', url: 'https://facebook.com/brandrevivalist', icon: Facebook },
  { label: 'Instagram', url: 'https://instagram.com/the.brand.revivalist', icon: Instagram },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/latricia-morris-447a35199', icon: Linkedin },
  { label: 'YouTube', url: 'https://youtube.com/@brandrevivalist', icon: Youtube },
];

const inputClass = 'w-full rounded-lg border border-border bg-input px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/25';
const labelClass = 'block text-sm font-medium text-foreground mb-2';

export default function Contact() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('general');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.auth.me()
      .then((user) => {
        const parts = (user.full_name || '').split(' ').filter(Boolean);
        setFirstName(user.first_name || parts[0] || '');
        setLastName(user.last_name || parts.slice(1).join(' ') || '');
        setEmail(user.email || '');
      })
      .catch(() => {});
  }, []);

  const canSubmit = firstName.trim() && email.trim() && message.trim() && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      await apiClient.contact.submit({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        category: topic,
        message: message.trim(),
      });
      setDone(true);
    } catch (err) {
      setError('Something went wrong sending your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground">Get in Touch</h1>
        <p className="text-base text-muted-foreground mt-2">
          Send a message and we'll reply by email — usually within two business days.
        </p>
      </div>

      <section className="bg-card border border-border rounded-lg p-6 sm:p-8">
        {done ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="font-heading text-2xl text-foreground mb-2">Message sent</h2>
            <p className="text-base text-muted-foreground mb-6">
              Thanks{firstName ? `, ${firstName}` : ''} — we've received your message and will reply to {email}.
            </p>
            <button
              onClick={() => { setDone(false); setMessage(''); }}
              className="text-sm text-primary hover:opacity-80 transition-opacity"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-first-name" className={labelClass}>First name</label>
                <input
                  id="contact-first-name"
                  type="text"
                  className={inputClass}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jordan"
                />
              </div>
              <div>
                <label htmlFor="contact-last-name" className={labelClass}>
                  Last name <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="contact-last-name"
                  type="text"
                  className={inputClass}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ellis"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-email" className={labelClass}>Email</label>
              <input
                id="contact-email"
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <p className="text-sm text-muted-foreground mt-2">We'll reply to this address.</p>
            </div>

            <div>
              <label htmlFor="contact-topic" className={labelClass}>What's this about?</label>
              <select
                id="contact-topic"
                className={inputClass}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                {TOPIC_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {topic === 'speaking_media' && (
                <p className="text-sm text-muted-foreground mt-2">
                  Booking Latricia Morris? Include dates, audience, and format in your message.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="contact-message" className={labelClass}>Message</label>
              <textarea
                id="contact-message"
                rows={6}
                className={`${inputClass} resize-y`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you need — a sentence or two is plenty."
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-forge inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl text-foreground mb-4">Where to find us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BUSINESSES.map((business) => (
            <div key={business.name} className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-heading text-lg text-foreground">{business.name}</h3>
              <p className="text-xs uppercase tracking-[0.15em] text-primary mt-1 mb-2">{business.descriptor}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{business.description}</p>
              <a
                href={business.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:opacity-80 transition-opacity"
              >
                {business.linkLabel} →
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 pt-8 border-t border-border">
        <p className="text-sm text-muted-foreground mb-4 text-center">Follow The Brand Revivalist®</p>
        <div className="flex items-center justify-center gap-3">
          {SOCIALS.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-card text-muted-foreground hover:text-primary transition-colors"
                aria-label={social.label}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}