import React, { useEffect, useState } from 'react';
import { BookOpen, TrendingDown, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatUsd } from '@/lib/agency';

/** Company books pulled live from QuickBooks: monthly income, expenses, net income. */
export default function CompanyBooksCard({ refreshKey }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setData(null);
    setError('');
    base44.functions
      .invoke('quickbooks-company-financials', {})
      .then((res) => {
        if (active) setData(res.data || {});
      })
      .catch((e) => {
        if (active) setError(e.message || 'QuickBooks financials are unavailable right now.');
      });
    return () => { active = false; };
  }, [refreshKey]);

  const cards = data
    ? [
        { label: 'Income — 12 months', value: data.totals.income_cents, icon: TrendingUp },
        { label: 'Expenses — 12 months', value: data.totals.expense_cents, icon: TrendingDown },
        { label: 'Net income — 12 months', value: data.totals.net_cents, icon: BookOpen, accent: true },
      ]
    : [];

  return (
    <div className="dashboard-card mb-8 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading text-2xl text-foreground">Company books — QuickBooks</h3>
        {data && (
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Synced {data.synced_at ? new Date(data.synced_at).toLocaleString() : ''}
          </span>
        )}
      </div>

      {error ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{error}</p>
      ) : !data ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {cards.map((card) => (
              <div key={card.label} className="rounded-md border border-border/70 bg-background/40 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <card.icon className="h-4 w-4 icon-warm" strokeWidth={1.5} />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{card.label}</span>
                </div>
                <p className={`font-heading text-2xl font-light ${card.accent ? 'text-primary' : 'text-foreground'}`}>
                  {formatUsd(card.value)}
                </p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/60">
                  {['Month', 'Income', 'Expenses', 'Net'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.months.map((m) => (
                  <tr key={m.label} className="border-t border-border/30">
                    <td className="px-4 py-2.5 text-sm text-foreground">{m.label}</td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">{formatUsd(m.income_cents)}</td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">{formatUsd(m.expense_cents)}</td>
                    <td className={`px-4 py-2.5 text-sm font-medium ${m.net_cents < 0 ? 'text-destructive' : 'text-foreground'}`}>
                      {formatUsd(m.net_cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}