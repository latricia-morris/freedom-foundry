import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, FilePlus2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import VisibilityIntake from '@/components/admin/agency/VisibilityIntake';
import { formatDate, scoreLabel } from '@/lib/visibility';

const STATUS_STYLES = {
  active: 'border-emerald-500/40 text-emerald-400',
  prospect: 'border-primary/40 text-primary',
  inactive: 'border-border text-muted-foreground',
  archived: 'border-border text-muted-foreground/70',
};

export default function AdminVisibilityReports() {
  const [clients, setClients] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [intakeClientId, setIntakeClientId] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.entities.AgencyClient.filter({}, 'company_name', 300),
      base44.entities.VisibilityReport.filter({}, '-report_date', 500),
    ])
      .then(([c, r]) => {
        setClients(c || []);
        setReports(r || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients
      .filter(
        (c) =>
          !q ||
          (c.company_name || '').toLowerCase().includes(q) ||
          (c.primary_contact_name || '').toLowerCase().includes(q)
      )
      .map((c) => {
        const mine = reports.filter((r) => r.agency_client_id === c.id);
        const sources = new Set(mine.map((r) => r.source_model || 'Unlabeled source'));
        return { client: c, count: mine.length, latest: mine[0], sources: sources.size };
      });
  }, [clients, reports, search]);

  const intakeClient = clients.find((c) => c.id === intakeClientId) || null;

  return (
    <div className="mx-auto max-w-5xl animate-fade-in pb-12">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-light text-foreground">
          Visibility &amp; <span className="molten-text italic">Credibility</span> Reports
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Turn raw AI audit output into gated client scorecards. Paste or upload findings, review the extracted draft, publish the snapshot.
        </p>
      </div>

      {intakeClient && (
        <VisibilityIntake
          client={intakeClient}
          onCancel={() => setIntakeClientId(null)}
          onSaved={() => {
            setIntakeClientId(null);
            load();
          }}
        />
      )}

      <div className="dashboard-card mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
        <input
          className="admin-input max-w-xs"
          placeholder="Search clients by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="text-xs text-muted-foreground">
          {reports.length} snapshot{reports.length === 1 ? '' : 's'} across {rows.filter((r) => r.count > 0).length} client{rows.filter((r) => r.count > 0).length === 1 ? '' : 's'}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : !rows.length ? (
        <div className="dashboard-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No agency clients yet. Add clients first to start publishing visibility reports.</p>
        </div>
      ) : (
        <div className="dashboard-card overflow-x-auto p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 text-left text-[10px] uppercase tracking-widest text-muted-foreground/70">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Latest Score</th>
                <th className="px-5 py-3 font-medium">Snapshots</th>
                <th className="px-5 py-3 font-medium">Sources</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ client, count, latest, sources }) => (
                <tr key={client.id} className="border-t border-border/30">
                  <td className="px-5 py-3">
                    <p className="text-sm text-foreground">{client.company_name}</p>
                    <p className="text-xs text-muted-foreground/70">{client.primary_contact_name || client.primary_contact_email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_STYLES[client.status] || STATUS_STYLES.inactive}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {latest ? (
                      <>
                        <p className="text-sm text-foreground">
                          {typeof latest.composite_score === 'number' ? `${latest.composite_score}/100` : '—'}{' '}
                          <span className="text-xs text-muted-foreground">{typeof latest.composite_score === 'number' ? scoreLabel(latest.composite_score) : ''}</span>
                        </p>
                        <p className="text-xs text-muted-foreground/70">{formatDate(latest.report_date)}</p>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground/60">No report yet</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{count}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{count ? sources : '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIntakeClientId(client.id)}
                        className="btn-forge inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest"
                      >
                        <FilePlus2 className="h-3.5 w-3.5" /> New report
                      </button>
                      {count > 0 && (
                        <Link
                          to={`/admin/agency/visibility/${client.id}`}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" /> Open
                        </Link>
                      )}
                    </div>
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