import React from 'react';
import { CreditCard, LoaderCircle, ShieldCheck } from 'lucide-react';
import { formatUsd } from '@/lib/agency';

/** Post-acceptance states: pay deposit, verifying payment, confirmed. */
export default function ProposalPayment({ state, proposal, depositCents, totalCents, busy, onPay, errors }) {
  if (state === 'verifying') {
    return (
      <div className="editorial-card space-y-4 text-center">
        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" />
        <h2 className="font-heading text-2xl text-foreground">Verifying your payment</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your deposit was submitted. We confirm every payment on our end before your project begins —
          this page updates automatically, usually within a few seconds.
        </p>
      </div>
    );
  }

  if (state === 'confirmed') {
    return (
      <div className="editorial-card space-y-4 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
        <h2 className="font-heading text-3xl text-foreground">Deposit confirmed</h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Welcome aboard. Your project is officially underway — your onboarding and next steps are being
          prepared now, and your project team will reach out shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-border bg-card/40 p-6">
        <h2 className="font-heading text-2xl text-foreground">Proposal accepted</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed by {proposal.signed_by_name || 'you'} — thank you. One step left to start the work.
        </p>
        <div className="mt-5 space-y-2 border-t border-border/60 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Project investment</span>
            <span className="font-heading text-xl text-foreground">{formatUsd(totalCents)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Deposit due today</span>
            <span className="font-heading text-xl text-primary">{formatUsd(depositCents)}</span>
          </div>
          {Number.isFinite(totalCents) && Number.isFinite(depositCents) && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Remaining balance</span>
              <span className="text-sm text-foreground">{formatUsd(totalCents - depositCents)}</span>
            </div>
          )}
        </div>
      </section>

      {(errors || []).map((message) => (
        <p key={message} className="text-sm text-destructive">{message}</p>
      ))}

      <button
        type="button"
        onClick={onPay}
        disabled={busy}
        className="btn-forge inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-4 text-sm font-semibold disabled:opacity-50"
      >
        <CreditCard className="h-4 w-4" />
        {busy ? 'Opening secure checkout…' : 'Securely Pay Deposit'}
      </button>
      <p className="text-center text-xs text-muted-foreground/70">
        Payments are processed by Stripe. Your project starts once your deposit is verified.
      </p>
    </div>
  );
}