import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ProposalCanvas from '@/components/proposal/studio/ProposalCanvas';
import AcceptPaySection from '@/components/proposal/AcceptPaySection';
export default function StudioClientExperience({ proposal, installments, token, onRefresh, paymentCancelled }) {
  const [selections,setSelections] = useState(proposal.signing?.selections || {}), [quote,setQuote] = useState(null), [error,setError] = useState('');
  useEffect(()=>{let active=true;setQuote(null);base44.functions.invoke('proposal-microsite',{action:'quote-studio',token,selections}).then(res=>{if(active)setQuote(res.data.quote);}).catch(e=>{if(active)setError(e.response?.data?.error || e.message);});return()=>{active=false;};},[token,selections]);
  return <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 sm:px-6">{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<ProposalCanvas doc={proposal} quote={quote} selections={selections} setSelections={setSelections} acceptance={<AcceptPaySection proposal={proposal} installments={installments} selections={selections} quote={quote} token={token} paymentCancelled={paymentCancelled} onRefresh={onRefresh} />} /></div>;
}