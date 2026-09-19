import React, { useState } from 'react';
import { Loader2, UserPlus, X } from 'lucide-react';
import apiClient from '@/api/client';

export default function NewClientForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', business_name: '', phone: '', email: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const submit = async () => {
    if (!form.email.trim()) {
      setError('An email address is required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const user = await apiClient.admin.createClient(form);
      onCreated(user);
    } catch (err) {
      setError(err?.message || 'The client could not be created. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dashboard-card border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl text-foreground">New Client</h3>
          <p className="text-sm text-muted-foreground mt-1">Enter their details, then upload their brand files.</p>
        </div>
        <button type="button" onClick={onCancel} aria-label="Cancel new client" className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="admin-input" placeholder="First name" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} />
        <input className="admin-input" placeholder="Last name" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} />
      </div>
      <input className="admin-input" placeholder="Company / business name" value={form.business_name} onChange={(e) => update('business_name', e.target.value)} />
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="admin-input" placeholder="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        <input className="admin-input" type="email" placeholder="Email address" value={form.email} onChange={(e) => update('email', e.target.value)} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="btn-forge inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-xs uppercase tracking-widest disabled:opacity-50"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
        {busy ? 'Creating client...' : 'Create & Continue'}
      </button>
      <p className="text-xs text-muted-foreground">
        If the email is new, the client receives an invite email — their portal fills in once you save the import.
      </p>
    </div>
  );
}