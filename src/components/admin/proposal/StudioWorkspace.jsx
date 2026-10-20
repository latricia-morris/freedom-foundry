import React from 'react';
import ProposalCanvas from '@/components/proposal/studio/ProposalCanvas';
import StudioReview from '@/components/admin/proposal/StudioReview';
import StudioSettings from '@/components/admin/proposal/StudioSettings';
import { fmtMoney } from '@/lib/proposalFormat';
export default function StudioWorkspace({ studio }) {
  const doc = studio.doc;
  if (!doc) return null;
  if (doc.content?.studio?.schema_version !== 2) return <div className="border border-border p-5"><p className="text-sm">This existing document is preserved in its original format. Compare an import above to compose it in the new editor.</p>{doc.share_token && <a href={`/proposal/${doc.share_token}`} className="text-primary">Open complete client proposal</a>}</div>;
  const readOnly = doc.status !== 'draft', preview = studio.previewDoc;
  return <div className="space-y-5">
    <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border border-border bg-card p-4"><div><p className="text-xs text-muted-foreground">{readOnly ? `Issued v${doc.version}, frozen` : studio.dirty ? 'Unsaved edits' : 'Saved draft'} · {doc.recipient.full_name}</p><p className="font-heading text-xl">{studio.quote ? fmtMoney(studio.quote.totalCents) : 'Calculating…'} current agreement</p></div><div className="flex flex-wrap gap-2">
      {!readOnly && <button type="button" className="border border-border px-4 py-2 text-sm disabled:opacity-50" disabled={studio.busy} onClick={studio.save}>Save draft</button>}
      <button type="button" className="border border-border px-4 py-2 text-sm disabled:opacity-50" disabled={studio.busy} onClick={studio.preview}>{preview ? 'Refresh client preview' : 'Preview as client'}</button>
      {!readOnly ? <button type="button" className="btn-forge px-4 py-2 text-sm disabled:opacity-50" disabled={studio.busy || !studio.approvedDigest || studio.dirty} onClick={studio.publish}>Publish approved version</button> : <button type="button" className="btn-forge px-4 py-2 text-sm" disabled={studio.busy} onClick={studio.newVersion}>Create next draft version</button>}
    </div></div>
    {preview && <div className="space-y-4 rounded-sm border border-primary/40 p-4"><div className="flex items-center justify-between gap-3"><h2 className="font-heading text-2xl">Complete client preview</h2><button type="button" className="text-sm text-primary" onClick={()=>studio.setPreviewDoc(null)}>Close preview</button></div><p className="text-xs text-muted-foreground">The same composed proposal used by the client. Signing and payment are disabled in this agency preview.</p><ProposalCanvas doc={preview} preview quote={studio.quote || studio.previewQuote} selections={studio.selections} setSelections={studio.setSelections} /></div>}
    {!readOnly && <><StudioSettings doc={doc} onChange={studio.edit} /><p className="text-xs text-muted-foreground">Click proposal text to edit it. Lists, tables, scope, prices, payment events and terms are saved with this draft.</p></>}
    <ProposalCanvas doc={doc} editing={!readOnly} onChange={studio.edit} quote={studio.quote} selections={studio.selections} setSelections={studio.setSelections} preview />
    {!readOnly && <StudioReview doc={doc} onChange={studio.edit} blockers={studio.blockers} />}
    {doc.share_token && <p className="text-sm">Issued version {doc.version}: <a href={`/proposal/${doc.share_token}`} target="_blank" rel="noreferrer" className="text-primary underline">Open actual client view</a>. Publishing does not send an invitation; use Email invite below when ready.</p>}
  </div>;
}