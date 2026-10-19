import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { LoaderCircle } from 'lucide-react';
import ProposalNav, { PROPOSAL_SECTIONS } from '@/components/proposal/ProposalNav';
import OverviewSections from '@/components/proposal/OverviewSections';
import ProjectSection from '@/components/proposal/ProjectSection';
import TimelineSection from '@/components/proposal/TimelineSection';
import InvestmentSection from '@/components/proposal/InvestmentSection';
import AgreementSection from '@/components/proposal/AgreementSection';
import AcceptPaySection from '@/components/proposal/AcceptPaySection';
import ChangeRequestModal from '@/components/proposal/ChangeRequestModal';
import { fmtDate } from '@/lib/proposalFormat';

const EMBERS_VIDEO =
  'https://media.base44.com/videos/public/6a6982f0647238bf2b5d67bf/8d01159f7_rising-golden-embers-on-black-background-2025-12-17-19-25-08-utc.mp4';

async function callMicrosite(action, payload = {}) {
  try {
    const res = await base44.functions.invoke('proposal-microsite', { action, ...payload });
    return (res && res.data) || {};
  } catch (e) {
    const status = e?.response?.status || e?.status;
    if (status === 401) {
      // Not signed in yet: continue onboarding from the login page, then
      // come straight back to this proposal.
      base44.auth.redirectToLogin(window.location.pathname + window.location.search);
      return { error: 'redirecting' };
    }
    if (status === 403) return { error: 'forbidden' };
    const msg = String(e?.message || '');
    if (msg.includes('superseded')) return { error: 'superseded' };
    if (msg.includes('expired')) return { error: 'expired' };
    if (msg.includes('not_found')) return { error: 'not_found' };
    return { error: msg || 'error' };
  }
}

/**
 * Public proposal microsite: six categories, frozen published content,
 * signing, invoicing, and payment. Background reuses the login embers video.
 */
export default function ProposalMicrosite() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loadError, setActiveToken] = useState(null);
  const [error, setError] = useState(null);
  const [selections, setSelections] = useState({});
  const [changeOpen, setChangeOpen] = useState(false);
  const [active, setActive] = useState('overview');

  const load = useCallback(async () => {
    const res = await callMicrosite('view', { token });
    if (res.error === 'redirecting') return;
    if (res.error) {
      setError(res.error);
      setActiveToken(res.active_token || '');
      return;
    }
    setError(null);
    // Prime default selections: single tiers preselect, quantities default
    const prime = {};
    (res.proposal?.investment?.items || []).forEach((item) => {
      if (item.kind === 'tier') prime[item.id] = { selected: false };
      else if (item.kind === 'quantity_based') prime[item.id] = { quantity: item.quantity_default ?? 0, selected: true };
    });
    setSelections(prime);
    setData(res);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // After a Stripe redirect: poll for the verified webhook, then reload.
  useEffect(() => {
    if (searchParams.get('payment') !== 'success' || !data) return undefined;
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      const res = await callMicrosite('status', { token });
      if ((res.status === 'deposit_paid' || tries > 10) && !res.error) {
        clearInterval(timer);
        await load();
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [searchParams, data, token, load]);

  // Scroll-spy for the six-category nav
  useEffect(() => {
    const onScroll = () => {
      let current = 'overview';
      for (const item of PROPOSAL_SECTIONS) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top < 140) current = item.id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (error === 'not_found') {
    return (
      <StateScreen title="Proposal not found" body="This proposal link is not valid. Please request a link from LaTricia Morris." />
    );
  }
  if (error === 'forbidden') {
    return (
      <StateScreen
        title="Different account needed"
        body="This proposal was prepared for a different email address. Sign in with the email your invitation was sent to, or contact us and we will resend it to the right address."
      />
    );
  }
  if (error === 'superseded') {
    return (
      <StateScreen
        title="A newer proposal is available."
        body="This version is no longer available for acceptance. Please review the current version."
        action={loadError ? { label: 'View current proposal', href: `/proposal/${loadError}` } : null}
      />
    );
  }
  if (error === 'expired' || data?.proposal?.status === 'expired') {
    return (
      <StateScreen
        title="This proposal needs to be refreshed."
        body="The acceptance window for this version has closed. Request an updated proposal so we can confirm the current scope, pricing, and availability."
        actionLabel="Request an updated proposal"
        onAction={async () => {
          await callMicrosite('request-change', {
            token,
            message: 'The acceptance window has closed. Please send an updated proposal confirming current scope, pricing, and availability.',
            from_name: data?.proposal?.recipient?.full_name || 'Client',
          });
          setError('change_sent');
        }}
        sentTitle="Request sent."
        sentBody="Your request has been sent. No changes to scope or pricing take effect until an updated agreement is accepted."
        sent={error === 'change_sent'}
      />
    );
  }
  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050506]">
        <LoaderCircle className="h-8 w-8 animate-spin text-[#e4a06e]" />
      </div>
    );
  }

  const proposal = data.proposal;
  const installments = data.installments || [];
  const idx = PROPOSAL_SECTIONS.findIndex((s) => s.id === active);
  const prev = PROPOSAL_SECTIONS[idx - 1];
  const next = PROPOSAL_SECTIONS[idx + 1];

  return (
    <div className="relative min-h-screen text-foreground">
      <video autoPlay muted loop playsInline className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-30" aria-hidden="true">
        <source src={EMBERS_VIDEO} type="video/mp4" />
      </video>
      <div className="pointer-events-none fixed inset-0 bg-[#050506]/60" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1200px] px-5 py-10 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <ProposalNav active={active} />
          <main className="min-w-0 flex-1 space-y-20">
            <OverviewSections proposal={proposal} onRequestChange={() => setChangeOpen(true)} />
            <ProjectSection proposal={proposal} />
            <TimelineSection proposal={proposal} />
            <InvestmentSection proposal={proposal} selections={selections} setSelections={setSelections} />
            <AgreementSection proposal={proposal} />
            <AcceptPaySection
              proposal={proposal}
              installments={installments}
              selections={selections}
              token={token}
              paymentCancelled={searchParams.get('payment') === 'cancelled'}
              onRefresh={load}
            />
            <div className="flex items-center justify-between border-t border-border/60 pt-6">
              {prev ? <a href={`#${prev.id}`} className="text-sm text-muted-foreground transition-colors hover:text-foreground">&larr; {prev.label}</a> : <span />}
              {next ? <a href={`#${next.id}`} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{next.label} &rarr;</a> : <span />}
            </div>
            <footer className="pb-8 text-center text-xs text-muted-foreground">
              {proposal.agency?.presentation_brand} | {proposal.agency?.legal_entity} · Questions: {proposal.agency?.notice_email}
            </footer>
          </main>
        </div>
      </div>
      <ChangeRequestModal
        open={changeOpen}
        onClose={() => setChangeOpen(false)}
        token={token}
        fromName={proposal.recipient?.full_name}
      />
    </div>
  );
}

function StateScreen({ title, body, action, actionLabel, onAction, sent, sentTitle, sentBody }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050506] p-6">
      <div className="w-full max-w-lg rounded-sm border border-border bg-card p-8 text-center">
        <h1 className="font-heading text-3xl font-light text-foreground">{sent ? sentTitle : title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{sent ? sentBody : body}</p>
        {action?.href ? (
          <a href={action.href} className="btn-forge mt-6 inline-block rounded-sm px-5 py-3 text-sm font-semibold">{action.label}</a>
        ) : null}
        {!sent && actionLabel ? (
          <button type="button" onClick={onAction} className="btn-forge mt-6 inline-block rounded-sm px-5 py-3 text-sm font-semibold">{actionLabel}</button>
        ) : null}
      </div>
    </div>
  );
}