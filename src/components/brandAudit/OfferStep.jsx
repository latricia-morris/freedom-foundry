import React from 'react';
import OfferPanel from '@/components/brandAudit/OfferPanel';
import ReportPreview from '@/components/brandAudit/ReportPreview';
import { CREDIT_NOTE, DELIVERY_TEXT, WEBSITE_SCOPE } from '@/lib/brandAudit';

export default function OfferStep({ tier, onChoose }) {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <h2 className="font-heading text-3xl font-light sm:text-4xl">Make your next investment an informed one.</h2>
        <p className="mt-3 text-muted-foreground">More traffic won’t fix an unclear offer, and more posting won’t fix a disconnected marketing mix. Keep your courtesy report, or have us look deeper before you commit more time and money.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <OfferPanel selected={tier === 'website'} title="Website Discoverability & Conversion Readiness" headline="Find out what your website is making harder than it should." price="$697 one-time payment"
          copy="Before you buy more traffic or commission another redesign, understand what needs fixing. We examine your core pages and the main route a prospective customer takes to understand your offer, trust your business, and inquire or buy."
          deliverable="You receive the Visibility & Credibility assessment plus a website review identifying specific pages and elements needing attention, discoverability findings, and recommended corrections. We’ll explain the findings and next steps on your call, then place the report and recommendations in your dashboard."
          scope={WEBSITE_SCOPE}
          value="Use it to decide whether the next investment belongs in visibility, messaging, proof, navigation, or the conversion experience instead of paying to change everything."
          cta="Choose the website audit · $697" onChoose={() => onChoose('website')} />
        <OfferPanel selected={tier === 'complete'} title="Complete Brand Health Review" headline="Make your marketing earn its place in the plan." price="$1,497 one-time payment"
          copy="We connect your brand and website findings with an assessment of your marketing activities, what they’re meant to accomplish, and what evidence exists of their contribution. This includes a full customer journey audit to help you fortify your pipeline to increase your company’s profitability."
          deliverable="You receive both earlier assessments plus a Marketing Matrix showing your current activity, the gaps and connections we identify, and what we recommend maintaining, improving, testing, reducing, or stopping. We’ll discuss the findings and next steps on your call, then make the report and included recommendations available in your dashboard."
          scope={WEBSITE_SCOPE}
          value="Choose where your effort belongs instead of adding another platform or campaign because you feel you should."
          cta="Choose the complete review · $1,497" onChoose={() => onChoose('complete')} />
      </div>
      <div className="dashboard-card rounded-[7px] p-6">
        <h3 className="font-heading text-2xl font-light">How delivery works</h3>
        <p className="mt-2 text-muted-foreground">{DELIVERY_TEXT}</p>
        <h3 className="mt-5 font-heading text-2xl font-light">An expert assessment, not another automated report.</h3>
        <p className="mt-2 text-muted-foreground">We review the available evidence, prepare your findings, and walk through them with you. Where something can’t be verified, we’ll say so rather than turn an assumption into a result.</p>
        <p className="mt-4 text-sm text-muted-foreground">{CREDIT_NOTE}</p>
      </div>
      <ReportPreview />
      <div className={`dashboard-card rounded-[7px] p-6 ${tier === 'courtesy' ? 'ring-1 ring-primary' : ''}`}>
        <p className="text-xs font-semibold tracking-[0.14em] text-primary">YOUR COURTESY REPORT</p>
        <h3 className="mt-2 font-heading text-2xl font-light">Visibility & Credibility</h3>
        <p className="mt-1 text-sm text-foreground">Your first report is complimentary.</p>
        <p className="mt-2 max-w-3xl text-muted-foreground">We examine the public picture of your brand, including clarity, consistency, credibility signals, and relevant AI-search findings. We’ll discuss the strengths, gaps, and unanswered questions we find, then make your report available in your account.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className="request-choice min-h-[44px] px-5 py-2.5 text-sm font-semibold" aria-pressed={tier === 'courtesy'} onClick={() => onChoose('courtesy')}>No thanks, keep my courtesy report</button>
          <span className="text-sm text-muted-foreground">No payment required.</span>
        </div>
      </div>
    </div>
  );
}