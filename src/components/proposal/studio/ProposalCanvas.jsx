import React, { useState } from 'react';
import { PROPOSAL_SECTIONS } from '@/components/proposal/ProposalNav';
import EditableText from '@/components/proposal/studio/EditableText';
import StudioPassages from '@/components/proposal/studio/StudioPassages';
import StudioAgency from '@/components/proposal/studio/StudioAgency';
import StudioScope from '@/components/proposal/studio/StudioScope';
import StudioTimeline from '@/components/proposal/studio/StudioTimeline';
import StudioInvestment from '@/components/proposal/studio/StudioInvestment';
import StudioAgreement from '@/components/proposal/studio/StudioAgreement';
import StudioAcceptance from '@/components/proposal/studio/StudioAcceptance';
import AcceptPaySection from '@/components/proposal/AcceptPaySection';
export default function ProposalCanvas({ doc, editing = false, onChange = () => {}, quote, selections = {}, setSelections = () => {}, preview = false, acceptance }) {
  const [active,setActive] = useState('overview');
  const tab = PROPOSAL_SECTIONS.find(t => t.id === active), index = PROPOSAL_SECTIONS.indexOf(tab);
  return <div className="min-w-0" data-testid={editing ? 'proposal-editor' : 'proposal-client-preview'}>
    <nav aria-label="Composed proposal sections" className="sticky top-0 z-20 flex gap-1 overflow-x-auto border-b border-border bg-card p-2">{PROPOSAL_SECTIONS.map(t => <button type="button" key={t.id} aria-current={active === t.id ? 'page' : undefined} onClick={() => setActive(t.id)} className={`shrink-0 px-3 py-2 text-sm ${active === t.id ? 'bg-primary/15 font-semibold text-foreground' : 'text-muted-foreground'}`}>{t.label}</button>)}</nav>
    <section className="space-y-8 rounded-sm border border-border bg-card p-5 sm:p-8" data-proposal-section={active}>
      <p className="text-xs uppercase tracking-widest text-primary">{tab.label} · Proposal v{doc.version || 1}</p>
      {active === 'overview' && <><h1 className="font-heading text-3xl sm:text-4xl"><EditableText value={doc.title} label="proposal title" editing={editing} onChange={title => onChange({ ...doc,title })} /></h1><p className="text-sm text-muted-foreground">Prepared for {doc.recipient.full_name} · {doc.recipient.company_name}<br />Issued {doc.issue_date} · Valid through {doc.expiry_date || 'Not specified'}</p></>}
      <StudioPassages doc={doc} section={active} editing={editing} onChange={onChange} />
      {active === 'overview' && <StudioAgency doc={doc} editing={editing} onChange={onChange} />}
      {active === 'project' && <StudioScope doc={doc} editing={editing} onChange={onChange} />}
      {active === 'timeline' && <StudioTimeline doc={doc} editing={editing} onChange={onChange} quote={quote} />}
      {active === 'investment' && <StudioInvestment doc={doc} editing={editing} onChange={onChange} quote={quote} selections={selections} setSelections={setSelections} />}
      {active === 'agreement' && <StudioAgreement doc={doc} editing={editing} onChange={onChange} />}
      {active === 'accept' && (acceptance || (editing ? <StudioAcceptance doc={doc} editing onChange={onChange} quote={quote} /> : <AcceptPaySection proposal={doc} installments={[]} selections={selections} quote={quote} preview={preview} />))}
      <div className="flex justify-between border-t border-border pt-5">{index > 0 ? <button type="button" className="text-sm text-primary" onClick={() => setActive(PROPOSAL_SECTIONS[index-1].id)}>Previous: {PROPOSAL_SECTIONS[index-1].label}</button> : <span />}{index < 5 && <button type="button" className="text-sm text-primary" onClick={() => setActive(PROPOSAL_SECTIONS[index+1].id)}>Next: {PROPOSAL_SECTIONS[index+1].label}</button>}</div>
    </section>
  </div>;
}