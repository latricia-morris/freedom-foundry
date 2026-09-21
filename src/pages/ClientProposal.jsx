import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import ProposalSelections from '@/components/agency/ProposalSelections';
import ProposalReview from '@/components/agency/ProposalReview';
import ProposalPayment from '@/components/agency/ProposalPayment';
import { computeClientTotals, depositCentsFor, tierGroupErrors } from '@/lib/agency';

const ACCEPTED_STATES = ['accepted_awaiting_deposit', 'deposit_checkout_opened'];

function gotoCheckout(url) {
  if (window.self !== window.top) {
    // Stripe Checkout cannot complete inside the builder's preview iframe.
    window.alert('For secure payment, open this proposal page in a full browser window, then continue.');
    return;
  }
  window.location.href = url;
}

export default function ClientProposal() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const paymentParam = searchParams.get('payment');

  const [data, setData] = useState(null);
  const [missing, setMissing] = useState(false);
  const [selections, setSelections] = useState({});
  const [step, setStep] = useState('select');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState([]);
  const [payState, setPayState] = useState(paymentParam === 'success' ? 'verifying' : 'pay');

  useEffect(() => {
    let active = true;
    base44.functions.invoke('agency-proposals', { action: 'view', token })
      .then((res) => {
        if (!active) return;
        const payload = res.data || {};
        if (!payload.proposal) { setMissing(true); return; }
        setData(payload);
        const next = {};
        (payload.items || []).forEach((item) => {
          if (item.item_type === 'quantity_based') {
            next[item.id] = { quantity: item.default_quantity ?? item.quantity_min ?? 1 };
          }
        });
        setSelections(next);
      })
      .catch(() => { if (active) setMissing(true); });
    return () => { active = false; };
  }, [token]);

  const proposal = data?.proposal;
  const paid = proposal && (proposal.status === 'deposit_paid' || proposal.status === 'activated');
  const accepted = proposal && ACCEPTED_STATES.includes(proposal.status);

  // Poll for the verified webhook result after returning from Stripe.
  useEffect(() => {
    if (payState !== 'verifying' || !token) return;
    let tries = 0;
    let active = true;
    const poll = async () => {
      try {
        const res = await base44.functions.invoke('agency-proposals', { action: 'status', token });
        const payload = res.data || {};
        if (payload.status === 'deposit_paid') {
          const view = await base44.functions.invoke('agency-proposals', { action: 'view', token });
          if (active) { setData(view.data || null); setPayState('confirmed'); }
          return;
        }
      } catch (e) { /* keep polling */ }
      tries += 1;
      if (tries < 25 && active) setTimeout(poll, 3000);
    };
    poll();
    return () => { active = false; };
  }, [payState, token]);

  const totals = useMemo(() => {
    if (!data) return null;
    const { lines, totalCents } = computeClientTotals(data.items, selections);
    const deposit = depositCentsFor(totalCents, proposal?.deposit_rule_type, proposal?.deposit_rule_value);
    return { lines, totalCents, depositCents: deposit, balanceCents: totalCents - deposit };
  }, [data, selections, proposal]);

  if (!data && !missing) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (missing || !proposal) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center bg-background px-5">
        <div className="max-w-md text-center">
          <h1 className="font-heading text-3xl font-light text-foreground">Proposal not found</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This link may have expired or been replaced. Ask your project contact for a current link.
          </p>
        </div>
      </div>
    );
  }

  const shell = (children) => (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <p className="text-xs uppercase tracking-[0.24em] text-warm">The Brand Revivalist</p>
        <h1 className="mt-3 font-heading text-4xl font-light text-foreground">{proposal.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Prepared for {proposal.client.company_name || 'your business'}
        </p>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );

  if (paid || payState === 'confirmed') {
    return shell(
      <ProposalPayment
        state="confirmed"
        proposal={proposal}
        depositCents={proposal.deposit_cents}
        totalCents={proposal.accepted_contract_total_cents}
      />
    );
  }

  if (payState === 'verifying') {
    return shell(
      <ProposalPayment state="verifying" proposal={proposal} />
    );
  }

  if (accepted) {
    return shell(
      <ProposalPayment
        state="pay"
        proposal={proposal}
        depositCents={proposal.deposit_cents}
        totalCents={proposal.accepted_contract_total_cents}
        busy={busy}
        onPay={async () => {
          setBusy(true);
          setErrors([]);
          try {
            const res = await base44.functions.invoke('agency-proposals', { action: 'checkout', token });
            const url = (res.data || {}).checkout_url;
            if (url) gotoCheckout(url);
            else if ((res.data || {}).paid) setPayState('confirmed');
            else setErrors(['Payment is not available right now. Please contact your project team.']);
          } catch (e) {
            setErrors([e.message || 'Could not open secure checkout. Try again.']);
          } finally {
            setBusy(false);
          }
        }}
        errors={errors}
      />
    );
  }

  if (proposal.status === 'expired') {
    return shell(
      <div className="editorial-card text-center">
        <h2 className="font-heading text-2xl text-foreground">This proposal has expired</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Reach out to your project contact and we will send a fresh proposal.
        </p>
      </div>
    );
  }

  if (step === 'review') {
    return shell(
      <ProposalReview
        proposal={proposal}
        items={data.items}
        selections={selections}
        totals={totals}
        busy={busy}
        errors={errors}
        onBack={() => { setStep('select'); setErrors([]); }}
        onAccept={async (signatureName) => {
          setBusy(true);
          setErrors([]);
          try {
            const res = await base44.functions.invoke('agency-proposals', {
              action: 'accept',
              token,
              selections,
              signature_name: signatureName,
              agree: true,
            });
            const payload = res.data || {};
            if (payload.checkout_url) {
              gotoCheckout(payload.checkout_url);
            } else {
              const view = await base44.functions.invoke('agency-proposals', { action: 'view', token });
              setData(view.data || null);
              setPayState('pay');
            }
          } catch (e) {
            const message = e?.response?.data?.error || e.message || 'Something went wrong. Try again.';
            setErrors([friendlyError(message)]);
          } finally {
            setBusy(false);
          }
        }}
      />
    );
  }

  return shell(
    <ProposalSelections
      proposal={proposal}
      items={data.items}
      selections={selections}
      onChange={setSelections}
      totals={totals}
      onContinue={() => setStep('review')}
    />
  );
}

function friendlyError(code) {
  if (code === 'validation') return 'Please complete your selections before signing.';
  if (code === 'expired') return 'This proposal has expired.';
  if (code === 'signature_required') return 'Please type your full name to sign.';
  return code;
}