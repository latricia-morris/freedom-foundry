import React, { useEffect, useMemo, useState } from 'react';
import { Banknote, CalendarClock, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatUsd, INSTALLMENT_STATUS_LABELS } from '@/lib/agency';

const OUTSTANDING = ['draft', 'pending', 'checkout_opened'];

/** Sales view: collected revenue plus forecasted revenue from outstanding installments. */
export default function AgencySalesTab() {
  const [installments, setInstallments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.PaymentInstallment.filter({}, 'sort_order', 500).catch(() => []),
      base44.entities.AgencyClient.filter({}, 'name', 300).catch(() => []),
    ]).then(([i, c]) => { setInstallments(i || []); setClients(c || []); setLoading(false); });
  }, []);

  const clientName = (id) => (clients.find((c) => c.id === id) || {}).company_name || '—';

  const { actualCents, forecastCents, byClient, outstanding } = useMemo(() => {
    let actual = 0;
    let forecast = 0;
    const map = new Map();
    for (const item of installments) {
      const bucket = map.get(item.client_id) || { actual: 0, forecast: 0 };
      if (item.status === 'paid') {
        const amount = item.amount_paid_cents ?? item.amount_cents ?? 0;
        actual += amount;
        bucket.actual += amount;
      } else if (OUTSTANDING.includes(item.status)) {
        const amount = item.amount_cents ?? 0;
        forecast += amount;
        bucket.forecast += amount;
      }
      map.set(item.client_id, bucket);
    }
    return {
      actualCents: actual,
      forecastCents: forecast,
      byClient: [...map.entries()].map(([clientId, v]) => ({ clientId, ...v })),
      outstanding: installments.filter((i) => OUTSTANDING.includes(i.status)),
    };
  }, [installments]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  const cards = [
    { label: 'Collected to date', value: actualCents, icon: Banknote },
    { label: 'Forecasted — pending payments', value: forecastCents, icon: TrendingUp },
    { label: 'Total contracted pipeline', value: actualCents + forecastCents, icon: CalendarClock },
  ];

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="dashboard-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <card.icon className="h-4 w-4 icon-warm" strokeWidth={1.5} />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{card.label}</span>
            </div>
            <p className="font-heading text-3xl font-light text-foreground">{formatUsd(card.value)}</p>
          </div>
        ))}
      </div>

      {byClient.length > 0 && (
        <div className="dashboard-card mb-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/60">
                {['Client', 'Collected', 'Forecasted', 'Total'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byClient.map((row) => (
                <tr key={row.clientId} className="border-t border-border/30">
                  <td className="px-5 py-3 text-sm text-foreground">{clientName(row.clientId)}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{formatUsd(row.actual)}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{formatUsd(row.forecast)}</td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{formatUsd(row.actual + row.forecast)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="mb-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">Outstanding installments</h3>
      {outstanding.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No pending payments. Everything outstanding has been collected.</p>
      ) : (
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/60">
                {['Client', 'Installment', 'Type', 'Amount', 'Due', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {outstanding.map((item) => (
                <tr key={item.id} className="border-t border-border/30">
                  <td className="px-5 py-3 text-sm text-foreground">{clientName(item.client_id)}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{item.description || '—'}</td>
                  <td className="px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">{(item.installment_type || 'deposit').replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{formatUsd(item.amount_cents)}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground/70">{item.due_date ? new Date(item.due_date).toLocaleDateString() : '—'}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-sm border border-primary/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                      {INSTALLMENT_STATUS_LABELS[item.status] || item.status}
                    </span>
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