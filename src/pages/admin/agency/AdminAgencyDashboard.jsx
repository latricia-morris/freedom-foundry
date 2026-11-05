import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Users, Kanban, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatUsd } from '@/lib/agency';
import { PageHeader, Stat, Panel, Empty, Spinner, GhostLink, label } from '@/components/crm/CrmUi';
import NeedsAttention from '@/components/crm/dashboard/NeedsAttention';
import UpcomingWork from '@/components/crm/dashboard/UpcomingWork';
import SalesSnapshot from '@/components/crm/dashboard/SalesSnapshot';

const E = base44.entities;
const page = (p) => p?.items || p || [];

export default function AdminAgencyDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['agency-command'],
    queryFn: async () => {
      const [clients, projects, proposals, installments, audits] = await Promise.all([
        E.AgencyClient.count({ status: 'active' }),
        E.Project.filter({ status: { $nin: ['completed', 'archived'] } }, { sort: '-updated_date', limit: 50 }),
        E.Proposal.filter({ status: { $in: ['sent', 'viewed', 'selections_in_progress', 'accepted_awaiting_deposit', 'deposit_checkout_opened'] } }, { sort: '-updated_date', limit: 50 }),
        E.PaymentInstallment.aggregate({ groupBy: 'status', sum: ['amount_cents', 'amount_paid_cents'] }),
        E.AuditLog.filter({}, { sort: '-created_date', limit: 8 }),
      ]);
      const sum = (s, f) => (installments.rows || []).filter((r) => s.includes(r.status)).reduce((t, r) => t + (r[`sum_${f}`] || 0), 0);
      return {
        clients: Number(clients?.count ?? clients) || 0, projects: page(projects), proposals: page(proposals), audits: page(audits),
        collected: sum(['paid'], 'amount_paid_cents'), outstanding: sum(['pending', 'checkout_opened'], 'amount_cents'),
      };
    },
  });

  if (isLoading) return <Spinner />;
  const { clients, projects, proposals, audits, collected, outstanding } = data;

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <PageHeader title="Agency" accent="Command Center" subtitle="Clients, pipeline, delivery and revenue at a glance. Open an area to manage it.">
        <Link to="/admin/agency/proposals/new" className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold uppercase tracking-widest"><FileText className="h-4 w-4" /> New proposal</Link>
        <GhostLink to="/admin/agency/clients"><Users className="h-4 w-4" /> Clients</GhostLink>
        <GhostLink to="/admin/crm/pipeline"><Kanban className="h-4 w-4" /> Pipeline</GhostLink>
        <GhostLink to="/admin/crm/time"><Clock className="h-4 w-4" /> Log time</GhostLink>
      </PageHeader>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Active clients" value={clients} />
        <Stat label="Active projects" value={projects.length} />
        <Stat label="Collected" value={formatUsd(collected)} accent="text-primary" />
        <Stat label="Outstanding" value={formatUsd(outstanding)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <NeedsAttention projects={projects} proposals={proposals} />
        <SalesSnapshot />
        <UpcomingWork />
        <Panel title="Active projects" to="/admin/agency/projects">
          {projects.length === 0 ? <Empty>Projects appear here once a deposit is verified.</Empty> : (
            <div className="divide-y divide-border/40">
              {projects.slice(0, 6).map((p) => (
                <Link key={p.id} to={`/admin/agency/projects/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-accent/40">
                  <p className="min-w-0 truncate text-sm text-foreground">{p.name}</p>
                  <span className="shrink-0 text-xs capitalize text-muted-foreground">{label(p.status)}</span>
                </Link>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Recent activity" to="/audit-logs">
          {audits.length === 0 ? <Empty>Activity appears here as the system runs.</Empty> : (
            <div className="divide-y divide-border/40">
              {audits.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-2 px-5 py-3">
                  <span className="truncate text-sm capitalize text-foreground">{label(a.action)}</span>
                  <span className="shrink-0 text-xs text-muted-foreground/70">{new Date(a.created_date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}