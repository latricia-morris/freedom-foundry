import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Paperclip } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { shortDate } from '@/lib/crm';
import { E, useRecords, useRefresh } from '@/components/crm/useCrm';
import { PageHeader, Stat, Panel, Empty, Spinner, Pill, PrimaryButton, money } from '@/components/crm/CrmUi';
import { CrmDialog } from '@/components/crm/CrmForm';
import ExpenseForm from '@/components/crm/expenses/ExpenseForm';

const openReceipt = async (uri) => {
  const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 300 });
  window.open(signed_url, '_blank', 'noopener');
};

export default function CrmExpenses() {
  const refresh = useRefresh();
  const [editing, setEditing] = useState(null);
  const { data: expenses = [], isLoading } = useRecords('expenses', 'Expense', {}, '-date', 100);
  const { data: byCat = [] } = useQuery({
    queryKey: ['crm', 'expenses', 'by-cat'],
    queryFn: async () => (await E.Expense.aggregate({ groupBy: 'category', sum: ['amount'] })).rows,
  });
  const total = byCat.reduce((s, r) => s + (r.sum_amount || 0), 0);
  const top = [...byCat].sort((a, b) => (b.sum_amount || 0) - (a.sum_amount || 0)).slice(0, 2);

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <PageHeader title="Agency" accent="Expenses" subtitle="Track spend by category and project, including what can be billed back to clients.">
        <PrimaryButton onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add expense</PrimaryButton>
      </PageHeader>
      <div className="mb-6 grid grid-cols-3 gap-4">
        <Stat label="Total spend" value={money(total)} accent="text-primary" />
        {top.map((r) => <Stat key={r.category} label={r.category} value={money(r.sum_amount)} hint={`${r.count} expenses`} />)}
      </div>
      <Panel title="All expenses">
        {isLoading ? <Spinner /> : expenses.length === 0 ? <Empty>No expenses recorded yet.</Empty> : (
          <div className="divide-y divide-border/40">
            {expenses.map((x) => (
              <div key={x.id} className="flex items-center gap-4 px-5 py-3.5">
                <button onClick={() => setEditing(x)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm text-foreground">{x.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{shortDate(x.date)} · {x.vendor || 'No vendor'} · {x.project_name || 'Overhead'}</p>
                </button>
                <Pill>{x.category}</Pill>
                {x.billable && <Pill>{x.invoiced ? 'invoiced' : 'billable'}</Pill>}
                {x.receipt_file_uri && <button onClick={() => openReceipt(x.receipt_file_uri)} aria-label="Open receipt" className="text-muted-foreground hover:text-foreground"><Paperclip className="h-4 w-4" /></button>}
                <span className="w-20 shrink-0 text-right text-sm text-foreground">{money(x.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <CrmDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={editing?.id ? 'Edit expense' : 'New expense'}>
        {editing && <ExpenseForm expense={editing} onDone={() => { setEditing(null); refresh('expenses'); }} />}
      </CrmDialog>
    </div>
  );
}