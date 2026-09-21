import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function QbSyncButton({ onSynced }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await base44.functions.invoke('quickbooks-sync', {});
      const data = res.data || {};
      if (typeof onSynced === 'function') onSynced(data);
    } catch (e) {
      setError(e.message || 'QuickBooks sync failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
        {busy ? 'Syncing QuickBooks…' : 'Sync QuickBooks'}
      </button>
      {error && <p className="max-w-sm text-right text-xs text-destructive">{error}</p>}
    </div>
  );
}