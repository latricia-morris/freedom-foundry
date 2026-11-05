import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Panel, money } from '@/components/crm/CrmUi';

export default function SalesSnapshot() {
  const { data } = useQuery({
    queryKey: ['crm', 'snapshot'],
    queryFn: async () => {
      const [deals, inv, msgs] = await Promise.all([
        base44.entities.CrmOpportunity.aggregate({ query: { stage: { $nin: ['won', 'lost'] } }, groupBy: 'stage', sum: ['value'] }),
        base44.entities.CrmInvoice.aggregate({ query: { status: { $in: ['sent', 'overdue'] } }, groupBy: 'status', sum: ['total'] }),
        base44.entities.ClientMessage.count({ is_from_client: true, read_by_agency: false }),
      ]);
      const s = (rows, f) => rows.reduce((t, r) => t + (r[f] || 0), 0);
      return { deals: deals.rows.reduce((t, r) => t + r.count, 0), pipeline: s(deals.rows, 'sum_value'), unpaid: s(inv.rows, 'sum_total'), overdue: inv.rows.find((r) => r.status === 'overdue')?.sum_total || 0, unread: Number(msgs?.count ?? msgs) || 0 };
    },
  });
  const rows = [
    { to: '/admin/crm/pipeline', label: 'Open deals', value: `${data?.deals ?? 0} · ${money(data?.pipeline)}` },
    { to: '/admin/crm/invoices', label: 'Unpaid invoices', value: money(data?.unpaid) },
    { to: '/admin/crm/invoices', label: 'Overdue', value: money(data?.overdue) },
    { to: '/admin/crm/messages', label: 'Unread client messages', value: data?.unread ?? 0 },
  ];
  return (
    <Panel title="Sales & billing">
      <div className="divide-y divide-border/40">
        {rows.map((r) => (
          <Link key={r.label} to={r.to} className="flex items-center justify-between px-5 py-3.5 hover:bg-accent/40">
            <span className="text-sm text-muted-foreground">{r.label}</span>
            <span className="text-sm text-foreground">{r.value}</span>
          </Link>
        ))}
      </div>
    </Panel>
  );
}