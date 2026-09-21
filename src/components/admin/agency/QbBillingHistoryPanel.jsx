import React, { useEffect, useState } from 'react';
import { Receipt } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const usd = (cents) =>
  `$${((cents || 0) / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const STATUS_STYLES = {
  paid: 'border-emerald-500/40 text-emerald-400',
  open: 'border-primary/40 text-primary',
  overdue: 'border-destructive/40 text-destructive',
};

export default function QbBillingHistoryPanel({ clientId }) {
  const [records, setRecords] = useState(null);

  useEffect(() => {
    let active = true;
    setRecords(null);
    base44.entities.ClientBillingRecord.filter({ agency_client_id: clientId }, '-txn_date', 500)
      .then((rows) => { if (active) setRecords(rows || []); })
      .catch(() => { if (active) setRecords([]); });
    return () => { active = false; };
  }, [clientId]);

  const totals = (records || []).reduce(
    (acc, r) => {
      if (r.record_type === 'payment') acc.paid += r.amount_cents || 0;
      if (r.record_type === 'invoice') acc.outstanding += r.balance_cents || 0;
      return acc;
    },
    { paid: 0, outstanding: 0 }
  );

  const statusOf = (r) => {
    if (r.record_type === 'payment') return 'paid';
    if ((r.balance_cents || 0) <= 0) return 'paid';
    if (r.due_date && new Date(r.due_date) < new Date(new Date().toDateString())) return 'overdue';
    return 'open';
  };

  return (
    <div className="rounded-sm border border-border/60 bg-muted/20 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="icon-tile h-9 w-9">
          <Receipt className="h-4 w-4 icon-warm" strokeWidth={1.5} />
        </div>
        <h4 className="font-heading text-lg text-foreground">QuickBooks billing history</h4>
        {records !== null && (
          <span className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground">
            {records.length} records
          </span>
        )}
      </div>

      {records === null ? (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : records.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">
          No QuickBooks billing history yet. Run a sync from the directory header to pull this client's invoices and payments.
        </p>
      ) : (
        <>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div className="dashboard-card p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Collected</p>
              <p className="font-heading text-2xl text-foreground">{usd(totals.paid)}</p>
            </div>
            <div className="dashboard-card p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Outstanding</p>
              <p className="font-heading text-2xl text-foreground">{usd(totals.outstanding)}</p>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  {['Date', 'Type', '#', 'Amount', 'Balance', 'Status'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const status = statusOf(r);
                  return (
                    <tr key={r.id} className="border-t border-border/30">
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {r.txn_date ? new Date(r.txn_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-3 py-2 text-xs capitalize text-muted-foreground">{r.record_type}</td>
                      <td className="px-3 py-2 text-xs text-foreground">{r.doc_number || '—'}</td>
                      <td className="px-3 py-2 text-sm text-foreground">{usd(r.amount_cents)}</td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">
                        {r.record_type === 'invoice' ? usd(r.balance_cents) : '—'}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`rounded-sm border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${STATUS_STYLES[status] || 'border-border text-muted-foreground'}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}