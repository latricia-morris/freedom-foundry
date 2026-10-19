import React, { useEffect, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'New' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
];

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AdminProjectRequests() {
  const [rows, setRows] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [signedUrls, setSignedUrls] = useState({});
  const [busyUri, setBusyUri] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      base44.entities.ServiceRequestSubmission.filter({ request_kind: 'project_request' }, '-created_date', 100),
      base44.entities.User.list().catch(() => []),
    ])
      .then(([subs, users]) => {
        if (!active) return;
        setRows(subs || []);
        const map = {};
        (users || []).forEach((u) => { map[u.id] = u.full_name || u.email || ''; });
        setUserNames(map);
      })
      .catch(() => { if (active) setRows([]); });
    return () => { active = false; };
  }, []);

  const openAttachment = async (uri) => {
    if (signedUrls[uri]) { window.open(signedUrls[uri], '_blank', 'noopener'); return; }
    setBusyUri(uri);
    try {
      const res = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri });
      const url = res?.signed_url ?? res?.data?.signed_url;
      if (url) {
        setSignedUrls((prev) => ({ ...prev, [uri]: url }));
        window.open(url, '_blank', 'noopener');
      }
    } catch { /* leave silent */ }
    setBusyUri('');
  };

  const setStatus = async (row, status) => {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
    await base44.entities.ServiceRequestSubmission.update(row.id, { status }).catch(() => {});
  };

  if (rows === null) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl animate-fade-in">
      <div className="mb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Inbox</span>
        <h1 className="font-heading text-3xl font-light text-foreground mt-1 mb-1">Project <span className="molten-text italic">Requests</span></h1>
        <p className="text-sm text-muted-foreground">Project requests submitted from the client portal.</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No project requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const details = row.details || {};
            const attachments = row.inspiration_file_uris || [];
            const names = details.attachments || [];
            const requester = userNames[row.user_id || row.created_by_id] || 'Member';
            return (
              <div key={row.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{requester}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(row.created_date)}</p>
                  </div>
                  <select
                    value={row.status || 'submitted'}
                    onChange={(e) => setStatus(row, e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {details.message || row.notes ? (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">{details.message || row.notes}</p>
                ) : null}

                {details.link ? (
                  <a
                    href={details.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#8a482d] hover:opacity-80"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> {details.link.length > 60 ? `${details.link.slice(0, 60)}…` : details.link}
                  </a>
                ) : null}

                {attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {attachments.map((uri, i) => (
                      <button
                        key={uri}
                        type="button"
                        onClick={() => openAttachment(uri)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {busyUri === uri
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <ExternalLink className="w-3.5 h-3.5" />}
                        {names[i] || `Attachment ${i + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}