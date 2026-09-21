import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleDollarSign, Receipt, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import QbBillingHistoryPanel from '@/components/admin/agency/QbBillingHistoryPanel';
import { formatUsd, INSTALLMENT_STATUS_LABELS, PROPOSAL_STATUS_LABELS } from '@/lib/agency';

const OUT_PROPOSAL_STATUSES = ['sent', 'viewed', 'selections_in_progress', 'accepted_awaiting_deposit', 'deposit_checkout_opened'];

const STATUS_STYLES = {
  paid: 'border-emerald-500/40 text-emerald-400',
  open: 'border-primary/40 text-primary',
  overdue: 'border-destructive/40 text-destructive',
};

const PROPOSAL_OUT_STYLES = {
  sent: 'border-primary/40 text-primary',
  viewed: 'border-primary/40 text-primary',
  selections_in_progress: 'border-amber-500/40 text-amber-400',
  accepted_awaiting_deposit: 'border-amber-500/40 text-amber-400',
  deposit_checkout_opened: 'border-amber-500/40 text-amber-400',
};

export default function ClientSalesTab({ client }) {
  const [proposals, setProposals] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [billing, setBilling] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      base44.entities.Proposal.filter({ client_id: client.id }, '-created_date', 100).catch(() => []),
      base44.entities.PaymentInstallment.filter({ client_id: client.id }, 'sort_order', 100).catch(() => []),
      base44.entities.ClientBillingRecord.filter({ agency_client_id: client.id }, '-txn_date', 500).catch(() => []),
    ]).then(([p, i, b]) => {
      if (!active) return;
      setProposals(p || []);
      setInstallments(i || []);
      setBilling(b || []);
      setLoading(false);
    });
    return () => { active = false; };
  }, [client.id]);

  // Payments received only — invoices never count toward collected totals.
  const money = useMemo(() => {
    let collected = 0;
    let outstanding = 0;
    for (const r of billing) {
      if (r.record_type === 'payment') collected += r.amount_cents || 0;
      if (r.record_type === 'invoice') outstanding += r.balance_cents || 0;
    }
    const contracted = proposals.reduce((sum, p) => sum + (p.accepted_contract_total_cents || 0), 0);
    return { collected, outstanding, contracted };
  }, [billing, proposals]);

  const proposalsOut = proposals.filter((p) => OUT_PROPOSAL_STATUSES.includes(p.status));
  const outstandingInvoices = billing
    .filter((r) => r.record_type === 'invoice' && (r.balance_cents || 0) > 0)
    .sort((a, b) => (b.balance_cents || 0) - (a.balance_cents || 0));

  const invoiceStatus = (r) => {
    if ((r.balance_cents || 0) <= 0) return 'paid';
    if (r.due_date && new Date(r.due_date) < new Date(new Date().toDateString())) return 'overdue';
    return 'open';
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="dashboard-card p-5">
          <div className="mb-2 flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 icon-warm" strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Collected</span>
          </div>
          <p className="font-heading text-3xl font-light text-primary">{formatUsd(money.collected)}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/60">Payments received</p>
        </div>
        <div className="dashboard-card p-5">
          <div className="mb-2 flex items-center gap-2">
            <Receipt className="h-4 w-4 icon-warm" strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Outstanding</span>
          </div>
          <p className="font-heading text-3xl font-light text-foreground">{formatUsd(money.outstanding)}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/60">Open invoice balances</p>
        </div>
        <div className="dashboard-card p-5">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 icon-warm" strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Proposals out</span>
          </div>
          <p className="font-heading text-3xl font-light text-foreground">{proposalsOut.length}</p>
        </div>
        <div className="dashboard-card p-5">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 icon-warm" strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Contracted value</span>
          </div>
          <p className="font-heading text-3xl font-light text-foreground">{formatUsd(money.contracted)}</p>
        </div>
      </div>

      <div className="dashboard-card p-6">
        <h3 className="mb-4 font-heading text-2xl text-foreground">Proposals</h3>
        {proposals.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No proposals for this client yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/60">
                  {['Proposal', 'Status', 'Value', 'Sent', 'Expires'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => (
                  <tr key={p.id} className="border-t border-border/30">
                    <td className="px-4 py-3">
                      <Link to={`/admin/agency/proposals/${p.id}`} className="text-sm text-foreground hover:text-primary">{p.title}</Link>
                      <p className="text-xs text-muted-foreground/70">{p.proposal_number || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${PROPOSAL_OUT_STYLES[p.status] || 'border-border text-muted-foreground'}`}>
                        {PROPOSAL_STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {p.accepted_contract_total_cents != null ? formatUsd(p.accepted_contract_total_cents) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground/70">{p.sent_at ? new Date(p.sent_at).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground/70">{p.expiration_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-card p-6">
        <h3 className="mb-4 font-heading text-2xl text-foreground">Outstanding invoices</h3>
        {outstandingInvoices.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nothing outstanding. All invoices are paid in full.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/60">
                  {['Invoice', 'Date', 'Due', 'Amount', 'Balance', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {outstandingInvoices.map((r) => {
                  const status = invoiceStatus(r);
                  return (
                    <tr key={r.id} className="border-t border-border/30">
                      <td className="px-4 py-3 text-sm text-foreground">{r.doc_number || '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground/70">{r.txn_date ? new Date(r.txn_date).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground/70">{r.due_date || '—'}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{formatUsd(r.amount_cents)}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{formatUsd(r.balance_cents)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_STYLES[status]}`}>{status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {installments.length > 0 && (
        <div className="dashboard-card p-6">
          <h3 className="mb-4 font-heading text-2xl text-foreground">Payment schedule</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/60">
                  {['Installment', 'Type', 'Amount', 'Status', 'Due'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {installments.map((i) => (
                  <tr key={i.id} className="border-t border-border/30">
                    <td className="px-4 py-3 text-sm text-foreground">{i.description || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground/70">{i.installment_type}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{formatUsd(i.amount_cents)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{INSTALLMENT_STATUS_LABELS[i.status] || i.status}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground/70">{i.due_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <QbBillingHistoryPanel clientId={client.id} />
    </div>
  );
}