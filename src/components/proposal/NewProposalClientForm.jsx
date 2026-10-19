import React, { useState } from 'react';
import { Loader2, UserPlus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Inline capture of a prospect's contact details (name, email, company,
 * phone) so a proposal can be prepared for someone who has no client record
 * yet. Creates an AgencyClient prospect; the client onboards their portal
 * account from the proposal invitation.
 */
export default function NewProposalClientForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({ company_name: '', contact_name: '', email: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    if (!form.contact_name.trim()) {
      setError('The contact name is required.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      setError('A valid email address is required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const created = await base44.entities.AgencyClient.create({
        company_name: form.company_name.trim() || form.contact_name.trim(),
        primary_contact_name: form.contact_name.trim(),
        primary_contact_email: form.email.trim().toLowerCase(),
        primary_contact_phone: form.phone.trim(),
        status: 'prospect',
      });
      onCreated(created);
    } catch (err) {
      setError(err?.message || 'The client could not be saved. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="rounded-sm border border-border bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">New client details</p>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel new client"
          className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input className="admin-input" placeholder="Company name" value={form.company_name} onChange={set('company_name')} />
        <input className="admin-input" placeholder="Contact name *" value={form.contact_name} onChange={set('contact_name')} />
        <input className="admin-input" type="email" placeholder="Email address *" value={form.email} onChange={set('email')} />
        <input className="admin-input" placeholder="Phone" value={form.phone} onChange={set('phone')} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        The proposal invitation is emailed to this address. If they don't have a portal account yet, the invitation walks
        them through creating one before they review.
      </p>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="btn-forge mt-3 inline-flex items-center gap-2 rounded-sm px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        {busy ? 'Saving…' : 'Create client'}
      </button>
    </div>
  );
}