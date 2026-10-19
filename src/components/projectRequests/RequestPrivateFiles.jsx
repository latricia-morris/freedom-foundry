import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function RequestPrivateFiles({ row }) {
  const [urls, setUrls] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const prepare = async (uri) => {
    setBusy(uri); setError('');
    try {
      const result = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 300 });
      setUrls((current) => ({ ...current, [uri]: { url: result.signed_url, expires: Date.now() + 290000 } }));
    } catch { setError('This attachment could not be opened. Please try again.'); }
    finally { setBusy(''); }
  };
  const attachments = row.inspiration_file_uris || [];
  return <div className="space-y-2">
    {attachments.map((uri, index) => <div key={uri} className="flex flex-wrap items-center gap-2 text-sm">
      <span className="min-w-0 break-all">{row.details?.attachments?.[index] || `Attachment ${index + 1}`}</span>
      {urls[uri]?.expires > Date.now() ? <a className="link-warm" href={urls[uri].url} target="_blank" rel="noopener noreferrer">Open private file</a> : <button type="button" className="rounded-[7px] border border-border px-3 py-2 text-sm" disabled={!!busy} onClick={() => prepare(uri)}>{busy === uri ? 'Preparing…' : 'Prepare private file'}</button>}
    </div>)}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}