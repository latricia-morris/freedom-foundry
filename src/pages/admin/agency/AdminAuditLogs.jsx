import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';

const SOURCES = ['ui', 'automation', 'stripe_webhook', 'api', 'admin_override'];

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');
  const [source, setSource] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.entities.AuditLog.filter({}, '-created_date', 300)
      .then((rows) => { setLogs(rows || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const entityTypes = useMemo(
    () => [...new Set(logs.map((l) => l.entity_type).filter(Boolean))].sort(),
    [logs],
  );

  const filtered = useMemo(() => logs.filter((l) => {
    const matchesType = type === 'all' || l.entity_type === type;
    const matchesSource = source === 'all' || l.source === source;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q
      || l.action?.toLowerCase().includes(q)
      || l.entity_id?.toLowerCase().includes(q)
      || l.actor?.toLowerCase().includes(q);
    return matchesType && matchesSource && matchesSearch;
  }), [logs, type, source, search]);

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <h1 className="mb-8 font-heading text-4xl font-light text-foreground">Audit <span className="molten-text italic">Logs</span></h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          className="admin-input max-w-xs py-2 text-sm"
          type="search"
          placeholder="Search action, actor, or record"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="admin-input max-w-52 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All record types</option>
          {entityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="admin-input max-w-44 py-2 text-sm" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="all">All sources</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <span className="text-xs text-muted-foreground/70">{filtered.length} of {logs.length}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No audit entries match your filters.</p>
      ) : (
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/60">
                {['When', 'Actor', 'Role', 'Record', 'Action', 'Source'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-t border-border/30 hover:bg-accent/40">
                  <td className="whitespace-nowrap px-5 py-3 text-xs text-muted-foreground">
                    {new Date(l.created_date).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{l.actor || '—'}</td>
                  <td className="px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground/70">{l.actor_role || '—'}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground/70">
                    {l.entity_type} · {l.entity_id ? String(l.entity_id).slice(0, 8) : '—'}
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground">{(l.action || '').replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {(l.source || 'ui').replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}