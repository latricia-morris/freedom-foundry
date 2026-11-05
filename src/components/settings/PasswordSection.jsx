import React, { useState } from 'react';
import { KeyRound, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Sends the platform's secure password email to the signed-in account's own address.
export default function PasswordSection({ email }) {
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  const send = async () => {
    setState('sending');
    setError('');
    try {
      await base44.auth.resetPasswordRequest(email);
      setState('sent');
    } catch (e) {
      setError(e.message || 'Unable to send the password email. Please try again.');
      setState('idle');
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-merlot" strokeWidth={1.5} />
        <h2 className="font-heading text-lg">Password</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Set or change the password for this account. Use it alongside Google sign-in to log in with your email and password whenever you need to.
      </p>
      {state === 'sent' ? (
        <p className="flex items-center gap-2 text-sm text-foreground">
          <Check className="w-4 h-4 text-primary" /> We sent a secure link to {email}. Open it to set your password.
        </p>
      ) : (
        <button onClick={send} disabled={!email || state === 'sending'} className="flex items-center gap-2 px-6 py-2.5 forged-gradient rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50">
          {state === 'sending' ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Set or change password'}
        </button>
      )}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </section>
  );
}