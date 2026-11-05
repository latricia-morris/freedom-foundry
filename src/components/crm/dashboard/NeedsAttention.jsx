import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Panel, Empty, label } from '@/components/crm/CrmUi';

const RISK = ['at_risk', 'delayed', 'waiting_on_client'];

export default function NeedsAttention({ projects, proposals }) {
  const items = [
    ...proposals.filter((p) => ['accepted_awaiting_deposit', 'deposit_checkout_opened'].includes(p.status))
      .map((p) => ({ id: p.id, to: `/admin/agency/proposals/${p.id}`, title: p.title, note: 'Awaiting deposit' })),
    ...projects.filter((p) => RISK.includes(p.client_project_health) || p.status === 'waiting_on_client')
      .map((p) => ({ id: p.id, to: `/admin/agency/projects/${p.id}`, title: p.name, note: label(p.client_project_health || p.status) })),
  ];

  return (
    <Panel title="Needs attention">
      {items.length === 0 ? <Empty>Nothing is blocked. Every deal and project is moving.</Empty> : (
        <div className="divide-y divide-border/40">
          {items.slice(0, 7).map((i) => (
            <Link key={i.id} to={i.to} className="flex items-center gap-3 px-5 py-3.5 hover:bg-accent/40">
              <AlertTriangle className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{i.title}</span>
              <span className="shrink-0 text-xs capitalize text-muted-foreground">{i.note}</span>
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );
}