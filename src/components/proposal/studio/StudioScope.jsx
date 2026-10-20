import React from 'react';
import StudioField from '@/components/proposal/studio/StudioField';
import { MODE_LABELS } from '@/components/proposal/studio/StudioPassages';
export default function StudioScope({ doc, editing, onChange }) {
  const s = doc.content.studio;
  const update = (module, key, value) => {
    const old = module[key];
    const blocks = s.blocks.map(b => {
      const sharedRevision = key === 'revision_allowance' && /revision rounds/i.test(b.text) && !s.services.some(m => m.id === b.service_id && m.acceptance_mode === 'future');
      if (!(module.source_ids || []).includes(b.id) && b.service_id !== module.id && !sharedRevision) return b;
      let text = b.text;
      if (key === 'revision_allowance' && old) { text = text.replaceAll(String(old), value); text = text.replace(/\b(?:\d+|two|three) revision rounds(?: each| per page)?/gi, value); }
      if (key === 'quantity' && old != null) text = text.replace(new RegExp(`\\b${old}(?= (?:Priority Pages|[Pp]ages))`,'g'), String(value));
      return { ...b, text };
    });
    const services = s.services.map(m => m.id === module.id ? { ...m, [key]: value } : m);
    const items = doc.investment.items.map(i => (i.module_id === module.id || i.module_ids?.includes(module.id)) && key === 'acceptance_mode' ? { ...i, acceptance_mode: value } : i);
    onChange({ ...doc, content: { ...doc.content, studio: { ...s, services, blocks } }, investment: { ...doc.investment, items } });
  };
  return <div className="space-y-4"><h3 className="font-heading text-2xl">Scope particulars</h3>{s.services.map(m => <div key={m.id} data-service-id={m.id} className="rounded-sm border border-border bg-muted/30 p-4">
    <h3 className="font-heading text-xl">{m.name}</h3><p className="text-xs text-primary">{MODE_LABELS[m.acceptance_mode]}</p>
    {editing ? <details className="mt-3"><summary className="cursor-pointer text-sm">Edit scope, quantities and revisions</summary><div className="mt-3 grid gap-3 sm:grid-cols-2">
      <StudioField label={`${m.name} title`} value={m.name} onChange={v => update(m,'name',v)} />
      <StudioField label={`${m.name} acceptance`} value={m.acceptance_mode} options={Object.entries(MODE_LABELS)} onChange={v => update(m,'acceptance_mode',v)} />
      <StudioField label={`${m.name} quantity`} type="number" value={m.quantity} onChange={v => update(m,'quantity',v)} />
      <StudioField label={`${m.name} revisions`} value={m.revision_allowance} onChange={v => update(m,'revision_allowance',v)} />
      {['quantity_note','payment_trigger'].map(k => <StudioField key={k} multiline label={`${m.name} ${k.replaceAll('_',' ')}`} value={m[k]} onChange={v => update(m,k,v)} />)}
      {['deliverables','named_items','exclusions','client_responsibilities','dependencies'].map(k => <StudioField key={k} multiline label={`${m.name} ${k.replaceAll('_',' ')}`} value={(m[k] || []).join('\n')} onChange={v => update(m,k,v.split('\n').filter(Boolean))} />)}
    </div></details> : <div className="mt-2 space-y-1 text-sm text-muted-foreground">{(m.quantity != null || m.quantity_note) && <p>Quantity: {m.quantity != null ? m.quantity : ''} {m.quantity_note}</p>}{m.revision_allowance && <p>Revisions: {m.revision_allowance}</p>}{m.deliverables?.length > 0 && <ul className="list-inside list-disc">{m.deliverables.map((v,i)=><li key={i}>{v}</li>)}</ul>}{m.named_items?.length > 0 && <p>Named items: {m.named_items.join('; ')}</p>}{m.dependencies?.length > 0 && <p>Dependencies: {m.dependencies.join('; ')}</p>}{m.client_responsibilities?.length > 0 && <p>Client responsibilities: {m.client_responsibilities.join('; ')}</p>}{m.exclusions?.length > 0 && <p>Exclusions: {m.exclusions.join('; ')}</p>}{m.payment_trigger && <p>Payment trigger: {m.payment_trigger}</p>}</div>}
  </div>)}</div>;
}