import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import useAuditState from '@/components/brandAudit/useAuditState';
import StepBar from '@/components/brandAudit/StepBar';
import OfferStep from '@/components/brandAudit/OfferStep';
import DetailsStep from '@/components/brandAudit/DetailsStep';
import PayStep from '@/components/brandAudit/PayStep';
import AuditConfirmation from '@/components/brandAudit/AuditConfirmation';
import { auditCall, getStoredBrand, storeBrand } from '@/lib/brandAudit';
import '@/components/projectRequests/requests.css';

const STAGE_STEP = { offers: 0, details: 1, review: 2 };

export default function BrandReview() {
  const params = new URLSearchParams(window.location.search);
  const brandKey = params.get('brand') || getStoredBrand();
  const sessionId = params.get('session_id');
  const qc = useQueryClient();
  const { data, isPending, error } = useAuditState(brandKey);
  const [step, setStep] = useState(null);
  const [tier, setTier] = useState(null);
  const [details, setDetails] = useState(null);
  const [verify, setVerify] = useState(sessionId ? 'checking' : null);
  const created = useRef(false);

  useEffect(() => { if (data?.brand?.key) storeBrand(data.brand.key); }, [data?.brand?.key]);

  useEffect(() => {
    if (!data || step !== null) return;
    const r = data.request;
    setTier(r?.tier || null);
    setDetails(r?.details || data.prefill);
    setStep(STAGE_STEP[r?.stage] ?? 0);
    if (!r && !data.legacy_released && !created.current && !sessionId) {
      created.current = true;
      auditCall('save', { brand_key: data.brand.key, stage: 'offers' }).then(() => qc.invalidateQueries({ queryKey: ['brand-audit'] }));
    }
  }, [data, step, qc, sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    let tries = 0;
    const run = () => auditCall('verify', { session_id: sessionId }).then((res) => {
      if (res.paid) { setVerify('paid'); qc.invalidateQueries({ queryKey: ['brand-audit'] }); }
      else if (++tries < 5) setTimeout(run, 2500); else setVerify('pending');
    }).catch(() => setVerify('failed'));
    run();
  }, [sessionId, qc]);

  if (isPending || step === null) return <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>;
  if (error) return <div className="dash-editorial-block"><p>Your request could not be loaded. Please try again in a moment.</p></div>;

  const r = data.request;
  const save = (patch) => auditCall('save', { brand_key: data.brand.key, ...patch }).then(() => qc.invalidateQueries({ queryKey: ['brand-audit'] }));
  const go = (n, patch = {}) => { setStep(n); window.scrollTo({ top: 0, behavior: 'smooth' }); save({ stage: ['offers', 'details', 'review'][n], ...patch }); };
  const done = r && !['draft', 'awaiting_payment'].includes(r.status);

  return (
    <div className="project-request mx-auto max-w-5xl animate-fade-in space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-primary">BRAND HEALTH INDEX</p>
          <h1 className="mt-2 font-heading text-4xl font-light sm:text-5xl">Brand <span className="molten-text italic">Review</span></h1>
        </div>
        <p className="text-sm text-muted-foreground">For <span className="text-foreground">{data.brand.label}</span> · <Link className="underline" to="/dashboard">Back to dashboard</Link></p>
      </div>
      {verify === 'checking' && <p role="status" className="dashboard-card rounded-[7px] p-5 text-sm">Confirming your payment with our processor…</p>}
      {verify === 'pending' && !done && <p role="status" className="dashboard-card rounded-[7px] p-5 text-sm">Your payment is still processing. This page will show your confirmation once it clears. You won’t be charged twice.</p>}
      {verify === 'failed' && <p role="alert" className="dashboard-card rounded-[7px] p-5 text-sm">We couldn’t confirm your payment yet. Refresh this page in a moment, or reply to your receipt email if it continues.</p>}
      {params.get('canceled') && !done && <p role="status" className="dashboard-card rounded-[7px] p-5 text-sm">Checkout was canceled and nothing was charged. Your selection is saved, so you can try again or change to the courtesy report.</p>}
      {done || (!r && data.legacy_released) ? <AuditConfirmation request={r} /> : (
        <>
          <StepBar step={step} onJump={(n) => n < step && go(n)} />
          {step === 0 && <OfferStep tier={tier} onChoose={(t) => { setTier(t); go(1, { tier: t }); }} />}
          {step === 1 && <DetailsStep tier={tier} details={details} setDetails={setDetails} onChange={() => go(0, { details })} brandKey={data.brand.key}
            onDone={(d) => tier === 'courtesy' ? auditCall('submit_courtesy', { brand_key: data.brand.key, details: d }).then(() => qc.invalidateQueries({ queryKey: ['brand-audit'] })) : go(2, { details: d })} />}
          {step === 2 && <PayStep tier={tier} details={details} brandKey={data.brand.key} onBack={() => go(1)} />}
        </>
      )}
    </div>
  );
}