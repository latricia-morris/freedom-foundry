import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { hours } from '@/lib/crm';
import { money } from '@/components/crm/CrmUi';

/** Time, billing and client-message totals for one project, linking to the CRM screens that manage them. */
export default function ProjectCrmSummary({ project }) {
  const { data } = useQuery({
    queryKey: ['crm', 'project-summary', project.id],
    queryFn: async () => {
      const [time, inv, msgs] = await Promise.all([
        base44.entities.TimeEntry.aggregate({ query: { project_id: project.id }, groupBy: 'billable', sum: ['duration_minutes'] }),
        base44.entities.CrmInvoice.aggregate({ query: { project_id: project.id, status: { $ne: 'cancelled' } }, groupBy: 'status', sum: ['total'] }),
        project.client_id ? base44.entities.ClientMessage.count({ agency_client_id: project.client_id, is_from_client: true, read_by_agency: false }) : 0,
      ]);
      const mins = time.rows.reduce((s, r) => s + (r.sum_duration_minutes || 0), 0);
      const billed = inv.rows.reduce((s, r) => s + (r.sum_total || 0), 0);
      const paid = inv.rows.find((r) => r.status === 'paid')?.sum_total || 0;
      return { mins, billed, paid, unread: Number(msgs?.count ?? msgs) || 0 };
    },
  });
  const cells = [
    { label: 'Time logged', value: hours(data?.mins), to: '/admin/crm/time' },
    { label: 'Invoiced', value: money(data?.billed), to: '/admin/crm/invoices' },
    { label: 'Paid', value: money(data?.paid), to: '/admin/crm/invoices' },
    { label: 'Unread client messages', value: data?.unread ?? 0, to: '/admin/crm/messages' },
  ];
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cells.map((c) => (
        <Link key={c.label} to={c.to} className="dashboard-card block p-4 transition-colors hover:border-primary/40">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{c.label}</p>
          <p className="mt-1.5 font-heading text-2xl font-light text-foreground">{c.value}</p>
        </Link>
      ))}
    </div>
  );
}