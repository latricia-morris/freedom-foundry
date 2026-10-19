import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Client change request. Requests and responses stay with the proposal; no
 * scope or pricing changes take effect until an updated agreement is accepted.
 */
export default function ChangeRequestModal({ open, onClose, token, fromName }) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await base44.functions.invoke('proposal-microsite', {
        action: 'request-change',
        token,
        message,
        from_name: fromName || 'Client',
      });
      setSent(true);
    } catch (e) {
      setError(String(e?.message || 'Could not send the request. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-sm border border-border bg-card p-6 shadow-2xl">
        {sent ? (
          <div>
            <h3 className="font-heading text-2xl font-light text-foreground">Request sent.</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your request has been sent. No changes to scope or pricing take effect until an updated agreement is accepted.
            </p>
            <button type="button" onClick={onClose} className="btn-forge mt-5 rounded-sm px-5 py-2.5 text-sm font-semibold">Close</button>
          </div>
        ) : (
          <div>
            <h3 className="font-heading text-2xl font-light text-foreground">What would you like to adjust?</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Tell me what you would like to discuss about the scope, timing, or investment. I will review your request
              before issuing any changes.
            </p>
            <label className="mt-4 block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              Your message
              <textarea
                className="admin-input min-h-28"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
            <div className="mt-4 flex items-center gap-3">
              <button type="button" onClick={submit} disabled={busy || message.trim().length < 5} className="btn-forge rounded-sm px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
                {busy ? 'Sending...' : 'Send request'}
              </button>
              <button type="button" onClick={onClose} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}