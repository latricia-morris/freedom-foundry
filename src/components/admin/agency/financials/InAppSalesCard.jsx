import React, { useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, ShoppingBag, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatUsd } from '@/lib/agency';

/** In-app product sales from Stripe, with a purchaser + usage drill-down per product. */
export default function InAppSalesCard({ refreshKey }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const load = () => {
    setData(null);
    setError('');
    base44.functions
      .invoke('stripe-inapp-sales', {})
      .then((res) => setData(res.data || {}))
      .catch((e) => setError(e.message || 'In-app sales are unavailable right now.'));
  };

  useEffect(load, [refreshKey]);

  const products = (data && data.products) || [];
  const totals = (data && data.totals) || { revenue_cents: 0, purchases: 0 };
  const active = selected ? products.find((p) => p.id === selected) : null;

  return (
    <div className="dashboard-card mb-8 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading text-2xl text-foreground">In-app sales</h3>
        {data && (
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
            {data.synced_at ? `Synced ${new Date(data.synced_at).toLocaleString()}` : ''}
          </span>
        )}
      </div>

      {error ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{error}</p>
      ) : !data ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : active ? (
        <div>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> All products
          </button>
          <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-md border border-border/70 bg-background/40 p-4">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Purchases</span>
              <p className="mt-1 font-heading text-2xl font-light text-foreground">{active.purchases}</p>
            </div>
            <div className="rounded-md border border-border/70 bg-background/40 p-4">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Revenue</span>
              <p className="mt-1 font-heading text-2xl font-light text-primary">{formatUsd(active.revenue_cents)}</p>
            </div>
            <div className="rounded-md border border-border/70 bg-background/40 p-4">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Price</span>
              <p className="mt-1 font-heading text-2xl font-light text-foreground">
                {active.price_cents != null ? formatUsd(active.price_cents) : '—'}
              </p>
            </div>
            <div className="rounded-md border border-border/70 bg-background/40 p-4">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Members</span>
              <p className="mt-1 font-heading text-2xl font-light text-foreground">
                {active.purchasers.filter((x) => x.is_member).length}
              </p>
            </div>
          </div>

          <h4 className="mb-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">
            Purchasers & product usage
          </h4>
          {active.purchasers.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No purchases of this product yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/60">
                    {['Buyer', 'Amount', 'Purchased', 'App member', 'Lessons completed', 'Last lesson'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {active.purchasers.map((p, i) => (
                    <tr key={`${p.email}-${i}`} className="border-t border-border/30">
                      <td className="px-4 py-2.5 text-sm text-foreground">
                        {p.name || '—'}
                        <span className="block text-xs text-muted-foreground/70">{p.email}</span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-muted-foreground">{formatUsd(p.amount_cents)}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground/70">
                        {p.date ? new Date(p.date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${p.is_member ? 'border-emerald-500/40 text-emerald-400' : 'border-border text-muted-foreground'}`}>
                          {p.is_member ? 'Member' : 'Guest'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-muted-foreground">{p.lessons_completed || 0}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground/70">
                        {p.last_lesson_at ? new Date(p.last_lesson_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-4">
            <div className="rounded-md border border-border/70 bg-background/40 p-4">
              <div className="mb-2 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 icon-warm" strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">In-app revenue</span>
              </div>
              <p className="font-heading text-2xl font-light text-primary">{formatUsd(totals.revenue_cents)}</p>
            </div>
            <div className="rounded-md border border-border/70 bg-background/40 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 icon-warm" strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Total purchases</span>
              </div>
              <p className="font-heading text-2xl font-light text-foreground">{totals.purchases}</p>
            </div>
          </div>

          {products.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No products yet. Products you create in Stripe appear here automatically.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/60">
                    {['Product', 'Price', 'Purchases', 'Revenue', ''].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="cursor-pointer border-t border-border/30 hover:bg-accent/40" onClick={() => setSelected(p.id)}>
                      <td className="px-4 py-2.5">
                        <p className="text-sm text-foreground">{p.name}</p>
                        {p.description && <p className="text-xs text-muted-foreground/60">{p.description.slice(0, 80)}</p>}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-muted-foreground">
                        {p.price_cents != null ? formatUsd(p.price_cents) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-foreground">{p.purchases}</td>
                      <td className="px-4 py-2.5 text-sm text-foreground">{formatUsd(p.revenue_cents)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-primary">
                          <CreditCard className="h-3.5 w-3.5" /> View buyers
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}