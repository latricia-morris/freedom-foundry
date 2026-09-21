import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, FileText, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatUsd, PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_STYLES } from '@/lib/agency';

export default function AdminAgencyProposals() {
  const [proposals, setProposals] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Proposal.filter({}, '-created_date', 300).catch(() => []),
      base44.entities.AgencyClient.filter({}, '-created_date', 300).catch(() => []),
    ]).then(([p, c]) => { setProposals(p || []); setClients(c || []); setLoading(false); });
  }, []);

  const clientName = (id) => (clients.find((c) => c.id === id) || {}).company_name || '—';

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-4xl font-light text-foreground">Proposals</h1>
        <Link to="/admin/agency/proposals/new" className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold uppercase tracking-widest">
          <Plus className="h-4 w-4" /> New proposal
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
      ) : proposals.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No proposals yet.</p>
      ) : (
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/60">
                {['Proposal', 'Client', 'Status', 'Contract total', 'Expiration'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => (
                <tr key={p.id} className="border-t border-border/30 hover:bg-accent/40">
                  <td className="px-5 py-3">
                    <Link to={`/admin/agency/proposals/${p.id}`} className="flex items-center gap-2 text-sm text-foreground hover:text-primary">
                      <FileText className="h-4 w-4 text-muted-foreground/60" />
                      <span>
                        {p.title}
                        <span className="ml-2 text-xs text-muted-foreground/70">{p.proposal_number}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{clientName(p.client_id)}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${PROPOSAL_STATUS_STYLES[p.status] || 'border-border text-muted-foreground'}`}>
                      {PROPOSAL_STATUS_LABELS[p.status] || p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground">
                    {p.accepted_contract_total_cents != null ? formatUsd(p.accepted_contract_total_cents) : '—'}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground/70">
                    {p.expiration_date ? new Date(p.expiration_date).toLocaleDateString() : '—'}
                    {p.share_token && (
                      <button
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/p/${p.share_token}`)}
                        className="ml-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-3 w-3" /> link
                      </button>
                    )}
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