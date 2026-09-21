import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Banknote, CalendarClock, FileCheck, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatUsd } from '@/lib/agency';

const OUTSTANDING = ['draft', 'pending', 'checkout_opened'];
const NON_CONTRACT_STATUSES = ['declined', 'cancelled', 'expired', 'superseded'];
const ACTUAL_COLOR = '#d9754a';
const FORECAST_COLOR = '#454e68';

function shortUsd(cents) {
  const dollars = (Number(cents) || 0) / 100;
  if (Math.abs(dollars) >= 1000) return `$${Math.round(dollars / 100) / 10}k`;
  return `$${Math.round(dollars)}`;
}

export default function AdminFinancialOverview() {
  const [installments, setInstallments] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.PaymentInstallment.filter({}, 'sort_order', 500).catch(() => []),
      base44.entities.Proposal.filter({}, '-created_date', 300).catch(() => []),
      base44.entities.AgencyClient.filter({}, 'name', 300).catch(() => []),
    ]).then(([i, p, c]) => {
      setInstallments(i || []);
      setProposals(p || []);
      setClients(c || []);
      setLoading(false);
    });
  }, []);

  const clientName = (id) => (clients.find((c) => c.id === id) || {}).company_name || '—';

  const data = useMemo(() => {
    let collected = 0;
    let forecast = 0;
    const paid = [];
    const outstanding = [];
    const now = new Date();
    const monthMap = new Map();
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, { label: d.toLocaleDateString('en-US', { month: 'short' }), actual: 0, forecast: 0 });
    }
    for (const item of installments) {
      if (item.status === 'paid') {
        const amount = item.amount_paid_cents ?? item.amount_cents ?? 0;
        collected += amount;
        paid.push(item);
        const stamp = item.paid_at || item.due_date;
        const key = stamp ? String(stamp).slice(0, 7) : null;
        if (key && monthMap.has(key)) monthMap.get(key).actual += amount;
      } else if (OUTSTANDING.includes(item.status)) {
        const amount = item.amount_cents ?? 0;
        forecast += amount;
        outstanding.push(item);
        const key = item.due_date ? String(item.due_date).slice(0, 7) : null;
        if (key && monthMap.has(key)) monthMap.get(key).forecast += amount;
      }
    }
    paid.sort((a, b) => new Date(b.paid_at || b.due_date || 0) - new Date(a.paid_at || a.due_date || 0));
    outstanding.sort((a, b) => String(a.due_date || '').localeCompare(String(b.due_date || '')));
    const contracted = proposals
      .filter((p) => !NON_CONTRACT_STATUSES.includes(p.status))
      .reduce((sum, p) => sum + (p.accepted_contract_total_cents || 0), 0);
    return {
      collectedCents: collected,
      forecastCents: forecast,
      contractedCents: contracted,
      months: [...monthMap.values()],
      recentCollected: paid.slice(0, 8),
      upcomingForecast: outstanding.slice(0, 8),
    };
  }, [installments, proposals]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  const cards = [
    { label: 'Collected revenue', value: data.collectedCents, icon: Banknote },
    { label: 'Forecasted revenue', value: data.forecastCents, icon: TrendingUp },
    { label: 'Accepted contract value', value: data.contractedCents, icon: FileCheck },
    { label: 'Total pipeline', value: data.collectedCents + data.forecastCents, icon: CalendarClock },
  ];

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <h1 className="mb-8 font-heading text-4xl font-light text-foreground">Financial <span className="molten-text italic">Overview</span></h1>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
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

      <div className="dashboard-card mb-8 p-6">
        <h3 className="mb-4 font-heading text-2xl text-foreground">Actual vs forecasted — last 12 months</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.months} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'hsl(220 10% 70%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={shortUsd} tick={{ fill: 'hsl(220 10% 70%)', fontSize: 11 }} axisLine={false} tickLine={false} width={52} />
              <Tooltip
                formatter={(value, name) => [formatUsd(value), name === 'actual' ? 'Collected' : 'Forecasted']}
                contentStyle={{ background: 'hsl(225 13% 9%)', border: '1px solid hsl(225 9% 17%)', borderRadius: 2, fontSize: 12 }}
                labelStyle={{ color: 'hsl(220 14% 95%)' }}
                cursor={{ fill: 'rgba(148,163,184,0.06)' }}
              />
              <Bar dataKey="actual" name="actual" fill={ACTUAL_COLOR} radius={[2, 2, 0, 0]} />
              <Bar dataKey="forecast" name="forecast" fill={FORECAST_COLOR} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">Recent collections</h3>
          {data.recentCollected.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No payments collected yet.</p>
          ) : (
            <div className="dashboard-card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/60">
                    {['Client', 'Installment', 'Amount', 'Collected'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentCollected.map((item) => (
                    <tr key={item.id} className="border-t border-border/30">
                      <td className="px-4 py-3 text-sm text-foreground">{clientName(item.client_id)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{item.description || '—'}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{formatUsd(item.amount_paid_cents ?? item.amount_cents)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground/70">
                        {item.paid_at ? new Date(item.paid_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div>
          <h3 className="mb-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">Forecasted installments</h3>
          {data.upcomingForecast.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No pending payments on the books.</p>
          ) : (
            <div className="dashboard-card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/60">
                    {['Client', 'Installment', 'Amount', 'Due'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.upcomingForecast.map((item) => (
                    <tr key={item.id} className="border-t border-border/30">
                      <td className="px-4 py-3 text-sm text-foreground">{clientName(item.client_id)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{item.description || '—'}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{formatUsd(item.amount_cents)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground/70">
                        {item.due_date ? new Date(item.due_date).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}