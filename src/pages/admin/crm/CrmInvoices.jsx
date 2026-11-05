import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Eye } from 'lucide-react';
import { INVOICE_STATUSES, shortDate } from '@/lib/crm';
import { E, useRecords, useRefresh } from '@/components/crm/useCrm';
import { PageHeader, Stat, Panel, Empty, Spinner, Pill, PrimaryButton, money } from '@/components/crm/CrmUi';
import { CrmDialog } from '@/components/crm/CrmForm';
import InvoiceForm from '@/components/crm/invoices/InvoiceForm';

export default function CrmInvoices() {
  const refresh = useRefresh();
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null);
  const { data: invoices = [], isLoading } = useRecords('invoices', 'CrmInvoice', status ? { status } : {}, '-issue_date', 100);
  const { data: rows = [] } = useQuery({ queryKey: ['crm', 'invoices', 'totals'], queryFn: async () => (await E.CrmInvoice.aggregate({ groupBy: 'status', sum: ['total'] })).rows });
  const sum = (s) => rows.filter((r) => s.includes(r.status)).reduce((t, r) => t + (r.sum_total || 0), 0);

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <PageHeader title="Client" accent="Invoices" subtitle="Bill clients for project work. Shared invoices appear in the client's workspace.">
        <PrimaryButton onClick={() => setEditing({})}><Plus className="h-4 w-4" /> New invoice</PrimaryButton>
      </PageHeader>
      <div className="mb-6 grid grid-cols-3 gap-4">
        <Stat label="Paid" value={money(sum(['paid']))} accent="text-primary" />
        <Stat label="Awaiting payment" value={money(sum(['sent']))} />
        <Stat label="Overdue" value={money(sum(['overdue']))} accent="text-destructive" />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {['', ...INVOICE_STATUSES].map((s) => (
          <button key={s || 'all'} onClick={() => setStatus(s)} className={`rounded-sm border px-3 py-1.5 text-xs uppercase tracking-widest ${status === s ? 'border-primary text-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}>{s || 'All'}</button>
        ))}
      </div>
      <Panel title="Invoices">
        {isLoading ? <Spinner /> : invoices.length === 0 ? <Empty>No invoices here yet.</Empty> : (
          <div className="divide-y divide-border/40">
            {invoices.map((i) => (
              <button key={i.id} onClick={() => setEditing(i)} className="flex w-full items-center gap-4 px-5 py-3.5 text-left hover:bg-accent/40">
                <span className="w-24 shrink-0 text-xs text-muted-foreground">{i.invoice_number}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{i.client_name}</p>
                  <p className="text-xs text-muted-foreground">Issued {shortDate(i.issue_date)} · Due {shortDate(i.due_date)}</p>
                </div>
                {i.client_visible && <Eye className="h-4 w-4 text-muted-foreground" aria-label="Shared with client" />}
                <Pill>{i.status}</Pill>
                <span className="w-24 shrink-0 text-right text-sm text-foreground">{money(i.total)}</span>
              </button>
            ))}
          </div>
        )}
      </Panel>
      <CrmDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={editing?.id ? `Invoice ${editing.invoice_number}` : 'New invoice'}>
        {editing && <InvoiceForm invoice={editing} onDone={() => { setEditing(null); refresh('invoices'); }} />}
      </CrmDialog>
    </div>
  );
}