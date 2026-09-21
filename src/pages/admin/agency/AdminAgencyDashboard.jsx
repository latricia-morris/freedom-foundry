import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CircleDollarSign, FileText, LayoutList, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatUsd, PROPOSAL_STATUS_LABELS } from '@/lib/agency';

export default function AdminAgencyDashboard() {
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [audits, setAudits] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Proposal.filter({}, '-created_date', 200).catch(() => []),
      base44.entities.AgencyClient.filter({}, '-created_date', 200).catch(() => []),
      base44.entities.Project.filter({}, '-created_date', 200).catch(() => []),
      base44.entities.PaymentInstallment.filter({}, 'sort_order', 300).catch(() => []),
      base44.entities.AuditLog.filter({}, '-created_date', 10).catch(() => []),
    ]).then(([p, c, pr, i, a]) => {
      setProposals(p || []); setClients(c || []); setProjects(pr || []);
      setInstallments(i || []); setAudits(a || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>;
  }

  const openPipeline = proposals.filter((p) => ['sent', 'viewed', 'selections_in_progress'].includes(p.status));
  const awaitingDeposit = proposals.filter((p) => ['accepted_awaiting_deposit', 'deposit_checkout_opened'].includes(p.status));
  const paidCents = installments.filter((i) => i.status === 'paid').reduce((s, i) => s + (i.amount_paid_cents || 0), 0);
  const outstandingCents = installments
    .filter((i) => ['pending', 'checkout_opened'].includes(i.status))
    .reduce((s, i) => s + (i.amount_cents || 0), 0);
  const exceptions = installments.filter((i) => i.status === 'manual_review' || i.verification_status === 'mismatch');
  const activeProjects = projects.filter((p) => !['completed', 'archived'].includes(p.status));

  const stat = (label, value, accent) => (
    <div className="dashboard-card p-5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{label}</p>
      <p className={`mt-2 font-heading text-3xl font-light ${accent || 'text-foreground'}`}>{value}</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-light text-foreground">Agency <span className="molten-text italic">Operations</span></h1>
        <p className="mt-2 text-sm text-muted-foreground">Proposals, deposits, activations, and delivery — the full client journey in one place.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stat('Open pipeline', openPipeline.length)}
        {stat('Awaiting deposit', awaitingDeposit.length, 'text-amber-400')}
        {stat('Collected', formatUsd(paidCents), 'text-primary')}
        {stat('Outstanding', formatUsd(outstandingCents))}
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link to="/admin/agency/proposals/new" className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold uppercase tracking-widest">
          <FileText className="h-4 w-4" /> New Proposal
        </Link>
        <Link to="/admin/agency/proposals" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <LayoutList className="h-4 w-4" /> Proposals
        </Link>
        <Link to="/admin/agency/clients" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <Users className="h-4 w-4" /> Clients
        </Link>
        <Link to="/admin/agency/projects" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <LayoutList className="h-4 w-4" /> Projects
        </Link>
      </div>

      {exceptions.length > 0 && (
        <div className="mb-8 rounded-md border border-destructive/40 bg-destructive/5 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-heading text-xl text-foreground">Payment exceptions — manual review</h3>
          </div>
          <div className="mt-3 space-y-2">
            {exceptions.map((i) => (
              <div key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 bg-card/40 px-4 py-3">
                <span className="text-sm text-foreground">{i.description} · {INSTALLMENT_LABEL(i)}</span>
                <span className="text-sm text-destructive">{formatUsd(i.amount_cents)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="dashboard-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/50 p-5">
            <h3 className="font-heading text-xl text-foreground">Pipeline</h3>
            <Link to="/admin/agency/proposals" className="text-xs uppercase tracking-widest link-warm">View all</Link>
          </div>
          {proposals.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No proposals yet — create your first one.</p>
          ) : (
            <div className="divide-y divide-border/40">
              {proposals.slice(0, 6).map((p) => (
                <Link key={p.id} to={`/admin/agency/proposals/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-accent/40">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{p.title}</p>
                    <p className="text-xs text-muted-foreground/70">{p.proposal_number}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">{PROPOSAL_STATUS_LABELS[p.status] || p.status}</p>
                    {p.accepted_contract_total_cents != null && (
                      <p className="text-sm text-foreground">{formatUsd(p.accepted_contract_total_cents)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/50 p-5">
            <h3 className="font-heading text-xl text-foreground">Active projects</h3>
            <Link to="/admin/agency/projects" className="text-xs uppercase tracking-widest link-warm">View all</Link>
          </div>
          {activeProjects.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Projects appear here the moment a verified deposit lands.
            </p>
          ) : (
            <div className="divide-y divide-border/40">
              {activeProjects.slice(0, 6).map((p) => (
                <Link key={p.id} to={`/admin/agency/projects/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-accent/40">
                  <p className="min-w-0 truncate text-sm text-foreground">{p.name}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{p.status.replace(/_/g, ' ')}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card mt-6 overflow-hidden">
        <div className="border-b border-border/50 p-5">
          <h3 className="font-heading text-xl text-foreground">Recent activity</h3>
        </div>
        {audits.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Audit events will appear here as the system runs.</p>
        ) : (
          <div className="divide-y divide-border/40">
            {audits.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <span className="text-sm text-foreground">{a.action.replace(/_/g, ' ')}</span>
                <span className="text-xs text-muted-foreground/70">
                  {a.entity_type} · {a.source} · {new Date(a.created_date).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function INSTALLMENT_LABEL(i) {
  return `${i.installment_type} · ${i.verification_status}`;
}