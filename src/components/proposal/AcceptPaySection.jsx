import React, { useMemo, useState } from 'react';
import { FileDown, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { fmtMoney, fmtDate } from '@/lib/proposalFormat';
import { downloadProposalPdf } from '@/lib/proposalPdf';
import SignaturePad from './SignaturePad';

const LABEL = 'space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground';

/**
 * Accept & Pay: final review, signature capture with explicit consents,
 * immediate invoice, Stripe deposit payment or approved cash/check preference,
 * and the signed download. Payment amounts are always computed server-side.
 */
export default function AcceptPaySection({ proposal, installments, selections, token, paymentCancelled, onRefresh }) {
  const signed = proposal.signing?.status === 'signed';
  const deposit = installments.find((i) => i.installment_type === 'deposit');
  const paid = deposit?.status === 'paid';
  const offlineMode = proposal.payment_preference === 'offline' || proposal.status === 'awaiting_offline_deposit';

  const [signerName, setSignerName] = useState(proposal.recipient?.full_name || '');
  const [signerEmail, setSignerEmail] = useState(proposal.recipient?.email || '');
  const [signerTitle, setSignerTitle] = useState(proposal.recipient?.title || '');
  const [signerCompany, setSignerCompany] = useState(proposal.recipient?.company_name || '');
  const [sigMode, setSigMode] = useState('type');
  const [sigData, setSigData] = useState('');
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);
  const [offlinePref, setOfflinePref] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const inv = proposal.investment || {};
  const items = inv.items || [];
  const scopeCents =
    items.filter((i) => i.kind === 'required').reduce((s, i) => s + (i.unit_price_cents || 0), 0) +
    items.filter((i) => i.kind === 'quantity_based').reduce((s, i) => s + (i.unit_price_cents || 0) * (selections[i.id]?.quantity ?? i.quantity_default ?? 0), 0) +
    items.filter((i) => i.kind === 'tier' && selections[i.id]?.selected).reduce((s, i) => s + (i.unit_price_cents || 0), 0);
  const totalCents = signed ? (proposal.signing?.total_cents || 0) : Math.max(0, scopeCents + items.filter((i) => i.kind === 'addon' && selections[i.id]?.selected).reduce((s, i) => s + (i.unit_price_cents || 0), 0));
  const depositDue = deposit ? deposit.amount_cents : Math.round((totalCents * ((inv.schedule?.[0]?.percent ?? 50) / 100)));
  const remaining = (signed ? totalCents : 0) - (deposit?.amount_paid_cents || 0);

  const isFramed = typeof window !== 'undefined' && window.self !== window.top;

  const openCheckout = async () => {
    setBusy(true);
    setFormError('');
    let tab = null;
    if (isFramed) {
      tab = window.open('', '_blank');
      if (!tab) {
        setBusy(false);
        setFormError('Allow popups to continue to checkout.');
        return;
      }
      tab.opener = null;
    }
    try {
      const res = (await base44.functions.invoke('proposal-microsite', { action: 'checkout', token }))?.data || {};
      if (res.paid) {
        tab?.close();
        await onRefresh();
        return;
      }
      if (tab) tab.location.replace(res.checkout_url);
      else window.location.assign(res.checkout_url);
    } catch (e) {
      tab?.close();
      setBusy(false);
      setFormError('Payment could not be started. Please try again.');
    }
  };

  const sign = async () => {
    setBusy(true);
    setFormError('');
    let tab = null;
    if (!offlinePref && isFramed) {
      tab = window.open('', '_blank');
      if (!tab) {
        setBusy(false);
        setFormError('Allow popups to continue to checkout.');
        return;
      }
      tab.opener = null;
    }
    try {
      const res = (await base44.functions.invoke('proposal-microsite', {
        action: 'sign',
        token,
        selections,
        signer_name: signerName,
        signer_email: signerEmail,
        signer_title: signerTitle,
        signer_company: signerCompany,
        consents: { proposal: c1, electronic: c2, authority: c3 },
        signature_kind: sigMode,
        signature_data: sigMode === 'draw' ? sigData : '',
        payment_preference: offlinePref ? 'offline' : 'online',
      }))?.data || {};
      if (res.error) {
        tab?.close();
        setBusy(false);
        const messages = {
          expired: 'This proposal has expired. Please request an updated version.',
          superseded: 'A newer version of this proposal is available.',
          already_accepted: 'This proposal has already been accepted.',
          validation: (res.errors || []).join(' '),
        };
        setFormError(messages[res.error] || 'Signing could not be completed. Please review your details and try again.');
        return;
      }
      if (res.offline) {
        await onRefresh();
        return;
      }
      if (tab) tab.location.replace(res.checkout_url);
      else window.location.assign(res.checkout_url);
    } catch (e) {
      tab?.close();
      setBusy(false);
      setFormError('Signing could not be completed. Please try again.');
    }
  };

  const saveOffline = async () => {
    setBusy(true);
    setFormError('');
    try {
      await base44.functions.invoke('proposal-microsite', { action: 'offline', token });
      await onRefresh();
    } catch (e) {
      setBusy(false);
      setFormError('The check or cash option is not currently available. Please pay online or contact us.');
    }
  };

  const invoiceRow = (label, value) => (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );

  if (proposal.status === 'deposit_paid' || proposal.status === 'paid_in_full' || paid) {
    return (
      <section id="accept" className="scroll-mt-24 space-y-6">
        <div className="dashboard-card p-8 text-center">
          <ShieldCheck className="icon-warm mx-auto h-10 w-10" strokeWidth={1.5} />
          <h2 className="mt-4 font-heading text-3xl font-light text-foreground">Payment received.</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Your signed agreement and required payment are on file. We will confirm the start date once the remaining
            project requirements are in place.
          </p>
          <button type="button" onClick={() => downloadProposalPdf(proposal, installments, true)} className="btn-forge mt-6 inline-flex items-center gap-2 rounded-sm px-5 py-3 text-sm font-semibold">
            <FileDown className="h-4 w-4" /> Download signed proposal
          </button>
        </div>
      </section>
    );
  }

  if (signed && offlineMode) {
    return (
      <section id="accept" className="scroll-mt-24 space-y-6">
        <div className="dashboard-card p-8 text-center">
          <h2 className="font-heading text-3xl font-light text-foreground">Signed. Awaiting deposit.</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Your preference to pay by check or cash has been saved. We will update your payment status once receipt is
            confirmed. Your project has not started.
          </p>
          <p className="mx-auto mt-4 max-w-lg whitespace-pre-line text-sm leading-relaxed text-foreground">{proposal.offline_instructions}</p>
          <p className="mx-auto mt-4 max-w-lg text-xs leading-relaxed text-muted-foreground">{proposal.offline_reminder}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => downloadProposalPdf(proposal, installments, true)} className="btn-forge inline-flex items-center gap-2 rounded-sm px-5 py-3 text-sm font-semibold">
              <FileDown className="h-4 w-4" /> Download signed proposal
            </button>
            <button type="button" onClick={openCheckout} disabled={busy} className="inline-flex items-center rounded-sm border border-primary/40 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary/10">
              Pay online instead
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (signed) {
    return (
      <section id="accept" className="scroll-mt-24 space-y-6">
        {paymentCancelled ? (
          <div className="dashboard-card border-destructive/40 p-5">
            <h2 className="font-heading text-xl text-foreground">Your signature is saved. Payment was not completed.</h2>
            <p className="mt-1 text-sm text-muted-foreground">You can try again or choose check or cash. Your project remains awaiting payment until receipt is confirmed.</p>
          </div>
        ) : null}
        <div className="dashboard-card p-8">
          <h2 className="font-heading text-3xl font-light text-foreground">Your proposal is signed.</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Thank you, {proposal.recipient?.greeting_name}. Your signed agreement is available below. Your next step is
            the required payment of {fmtMoney(depositDue, proposal.currency)}.
          </p>
          <div className="mt-6 rounded-sm border border-border/60 p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Invoice</p>
            {invoiceRow('Invoice number', deposit ? `INV-${String(deposit.id).slice(0, 8).toUpperCase()}` : 'Preparing')}
            {invoiceRow('Project', proposal.title)}
            {invoiceRow('Amount due', fmtMoney(depositDue, proposal.currency))}
            {invoiceRow('Payment due condition', deposit?.description || 'Due upon acceptance')}
            {invoiceRow('Remaining balance', fmtMoney(Math.max(0, totalCents - depositDue), proposal.currency))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={openCheckout} disabled={busy} className="btn-forge inline-flex items-center rounded-sm px-6 py-3 text-sm font-semibold disabled:opacity-50">
              Pay {fmtMoney(depositDue, proposal.currency)}
            </button>
            <button type="button" onClick={() => downloadProposalPdf(proposal, installments, true)} className="inline-flex items-center gap-2 rounded-sm border border-primary/40 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary/10">
              <FileDown className="h-4 w-4" /> Download signed proposal
            </button>
          </div>
          {proposal.offline_available && !offlineMode ? (
            <div className="mt-6 border-t border-border/60 pt-5">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={offlinePref} onChange={(e) => setOfflinePref(e.target.checked)} />
                I would prefer to pay by check or cash.
              </label>
              {offlinePref ? (
                <>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground">{proposal.offline_instructions}</p>
                  <p className="mt-3 max-w-xl text-xs leading-relaxed text-muted-foreground">{proposal.offline_reminder}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button type="button" onClick={saveOffline} disabled={busy} className="inline-flex items-center rounded-sm border border-primary/40 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary/10">
                      Save cash/check preference
                    </button>
                    <button type="button" onClick={() => setOfflinePref(false)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pay online instead</button>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  const isIndividual = proposal.recipient?.is_individual === true;
  const authorityText = (proposal.consents?.authority || '').replace('{contracting_party}', proposal.recipient?.contracting_party_name || '');
  const canSign = signerName.trim().length >= 2 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(signerEmail) && c1 && c2 && (isIndividual || c3) && (sigMode === 'type' || sigData);

  return (
    <section id="accept" className="scroll-mt-24 space-y-8">
      <div>
        <p className="text-warm text-[11px] font-semibold uppercase tracking-[0.16em]">Accept &amp; Pay</p>
        <h2 className="mt-1 font-heading text-3xl font-light text-foreground sm:text-4xl">Review your agreement.</h2>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <p className="text-muted-foreground"><span className="font-medium text-foreground">Recipient:</span> {proposal.recipient?.full_name}{signerTitle ? `, ${signerTitle}` : ''}</p>
          <p className="text-muted-foreground"><span className="font-medium text-foreground">Contracting party:</span> {proposal.recipient?.contracting_party_name}</p>
          <p className="text-muted-foreground"><span className="font-medium text-foreground">Version:</span> {proposal.version} &middot; Valid through {fmtDate(proposal.expiry_date)}</p>
          <p className="text-muted-foreground"><span className="font-medium text-foreground">Due upon acceptance:</span> {fmtMoney(depositDue, proposal.currency)}</p>
          {!isMonthlySummary(inv) ? <p className="text-muted-foreground"><span className="font-medium text-foreground">Remaining balance:</span> {fmtMoney(Math.max(0, totalCents - depositDue), proposal.currency)}</p> : null}
          <p className="text-muted-foreground"><span className="font-medium text-foreground">Full terms:</span> Agreement section above</p>
        </div>
      </div>

      <div className="dashboard-card space-y-5 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={LABEL}>Full legal name
            <input className="admin-input" value={signerName} onChange={(e) => setSignerName(e.target.value)} />
          </label>
          <label className={LABEL}>Email
            <input className="admin-input" type="email" value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)} />
          </label>
          <label className={LABEL}>Title or role
            <input className="admin-input" value={signerTitle} onChange={(e) => setSignerTitle(e.target.value)} />
          </label>
          <label className={LABEL}>Company
            <input className="admin-input" value={signerCompany} onChange={(e) => setSignerCompany(e.target.value)} disabled={isIndividual} />
          </label>
        </div>

        <div className="flex gap-2">
          {['type', 'draw'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSigMode(mode)}
              className={`rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                sigMode === mode ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {mode === 'type' ? 'Type signature' : 'Draw signature'}
            </button>
          ))}
        </div>
        {sigMode === 'type' ? (
          <input
            aria-label="Type your signature"
            className="font-heading admin-input text-2xl"
            style={{ fontStyle: 'italic' }}
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="Type your full legal name"
          />
        ) : (
          <SignaturePad onChange={setSigData} disabled={busy} />
        )}

        <div className="space-y-3">
          <label className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
            <input type="checkbox" className="mt-1" checked={c1} onChange={(e) => setC1(e.target.checked)} />
            {proposal.consents?.proposal}
          </label>
          <label className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
            <input type="checkbox" className="mt-1" checked={c2} onChange={(e) => setC2(e.target.checked)} />
            {proposal.consents?.electronic}
          </label>
          {!isIndividual ? (
            <label className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <input type="checkbox" className="mt-1" checked={c3} onChange={(e) => setC3(e.target.checked)} />
              {authorityText}
            </label>
          ) : null}
        </div>

        {formError ? <p className="text-sm text-red-400">{formError}</p> : null}
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={sign} disabled={!canSign || busy} className="btn-forge rounded-sm px-6 py-3 text-sm font-semibold disabled:opacity-50">
            {busy ? 'Working...' : 'Sign and accept'}
          </button>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            Your signature accepts the agreement. Work will not begin until the required deposit has been received and
            the remaining start conditions have been met.
          </p>
        </div>
      </div>
    </section>
  );
}

function isMonthlySummary(inv) {
  return inv?.mode === 'monthly';
}