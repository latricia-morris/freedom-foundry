import React, { useState } from 'react';
import useProposalStudio from '@/hooks/useProposalStudio';
import StudioImport from '@/components/admin/proposal/StudioImport';
import StudioWorkspace from '@/components/admin/proposal/StudioWorkspace';
import StudioDocuments from '@/components/admin/proposal/StudioDocuments';
import StudioOffline from '@/components/admin/proposal/StudioOffline';
import NewProposalClientForm from '@/components/proposal/NewProposalClientForm';

export default function AdminProposalStudio() {
  const studio = useProposalStudio();
  const [addingClient,setAddingClient] = useState(false);
  return <div className="mx-auto max-w-6xl space-y-6">
    <header><h1 className="font-heading text-4xl font-light">Proposal <span className="molten-text italic">Studio</span></h1><p className="mt-2 text-sm text-muted-foreground">Compose the complete proposal, edit in place, save a draft and review the exact client version before publication.</p></header>
    {studio.error && <div role="alert" className="whitespace-pre-wrap border border-destructive/50 bg-card p-4 text-sm text-destructive">{studio.error}</div>}
    {studio.busy && <p role="status" className="text-sm text-muted-foreground">Working on your proposal…</p>}
    {!studio.doc && <div className="space-y-3"><label className="block text-xs text-muted-foreground">Find a client<input aria-label="Find a client" className="admin-input mt-1" value={studio.clientSearch} onChange={e=>studio.setClientSearch(e.target.value)} /></label>{addingClient ? <NewProposalClientForm onCreated={c=>{studio.addClient(c);setAddingClient(false);}} onCancel={()=>setAddingClient(false)} /> : <button type="button" className="text-sm text-primary" onClick={()=>setAddingClient(true)}>Add a new client</button>}</div>}
    <StudioImport studio={studio} />
    <StudioWorkspace studio={studio} />
    <StudioDocuments studio={studio} />
    <StudioOffline studio={studio} />
  </div>;
}