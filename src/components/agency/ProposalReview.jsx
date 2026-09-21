import React, { useState } from 'react';
import { ArrowLeft, PenLine } from 'lucide-react';
import { formatUsd } from '@/lib/agency';

/** Final review + signature: selected scope, totals, deposit, balance, terms. */
export default function ProposalReview({ proposal, selections, totals, busy, errors, onBack, onAccept }) {
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');

  const milestones = proposal.milestone_rules || [];

  return (
    <div className="space-y-8">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to selections
      </button>

      <section>
        <h2 className="text-xs uppercase tracking-[0.24em] text-warm">Your selections</h2>
        <div className="mt-4 overflow-hidden rounded-md border border-border">
          {totals.lines.map((line) => (
            <div key={line.id} className="flex items-center gap-4 border-b border-border/50 bg-card/40 p-4 last:border-b-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{line.title}</p>
                {line.quantity > 1 && <p className="text-xs text-muted-foreground">Quantity: {line.quantity}</p>}
              </div>
              <span className="text-sm text-foreground">
                {line.pricing_visible ? formatUsd(line.line_total_cents) : 'Included'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-border bg-card/40 p-5">
        <div className="flex items-center justify-between py-1.5">
          <span className="text-sm text-muted-foreground">Total project investment</span>
          <span className="font-heading text-xl text-foreground">{formatUsd(totals.totalCents)}</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-sm text-muted-foreground">Deposit due today</span>
          <span className="font-heading text-xl text-primary">{formatUsd(totals.depositCents)}</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-sm text-muted-foreground">Remaining balance</span>
          <span className="text-sm text-foreground">{formatUsd(totals.balanceCents)}</span>
        </div>
        {milestones.length > 0 && (
          <div className="mt-4 border-t border-border/60 pt-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Scheduled payments</p>
            {milestones.map((m, i) => (
              <div key={i} className="mt-1.5 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{m.description}</span>
                <span className="text-xs text-muted-foreground">{m.percent}% of total</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {proposal.agreement_text && (
        <section>
          <h2 className="text-xs uppercase tracking-[0.24em] text-warm">Agreement</h2>
          <div className="editorial-card mt-4 max-h-64 overflow-y-auto whitespace-pre-wrap p-5">
            <p className="text-sm leading-relaxed text-muted-foreground">{proposal.agreement_text}</p>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 accent-[#d9622c]"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>
            I have read and agree to the terms above and the total investment of{' '}
            <span className="text-foreground">{formatUsd(totals.totalCents)}</span>, with a deposit of{' '}
            <span className="text-foreground">{formatUsd(totals.depositCents)}</span> due at signing.
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">
            Type your full name to sign
          </span>
          <input
            className="admin-input py-2.5 font-heading text-lg text-foreground"
            placeholder="Your full legal name"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
          />
        </label>

        {errors.map((message) => (
          <p key={message} className="text-sm text-destructive">{message}</p>
        ))}

        <button
          type="button"
          disabled={!agreed || signature.trim().length < 2 || busy}
          onClick={() => onAccept(signature.trim())}
          className="btn-forge inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-4 text-sm font-semibold disabled:opacity-50"
        >
          <PenLine className="h-4 w-4" />
          {busy ? 'Recording your acceptance…' : 'Sign & Pay Deposit Securely'}
        </button>

        <p className="text-center text-xs text-muted-foreground/70">
          You will be taken to our secure payment processor to complete your deposit. Work begins once your payment is verified.
        </p>
      </section>
    </div>
  );
}