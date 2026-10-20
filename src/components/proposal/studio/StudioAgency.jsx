import React from 'react';
import EditableText from '@/components/proposal/studio/EditableText';
import StudioAsset from '@/components/proposal/studio/StudioAsset';
import { MEDIA_LIBRARY } from '@/lib/proposalAgencyClient';
export default function StudioAgency({ doc, editing, onChange }) {
  const s = doc.content.studio;
  const change = (id,key,value) => onChange({ ...doc, content: { ...doc.content, studio: { ...s, presentation: s.presentation.map(p => p.id === id ? { ...p,[key]:value } : p) } } });
  return <div className="space-y-12">{s.presentation.map(p => (editing || (p.visible !== false && doc.sections_visible?.[p.id] !== false)) && <section key={p.id} data-agency-section={p.id} className="space-y-4 border-t border-border pt-8">
    {editing && <label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={p.visible !== false && doc.sections_visible?.[p.id] !== false} onChange={e => onChange({ ...doc, sections_visible: { ...doc.sections_visible,[p.id]:e.target.checked }, content: { ...doc.content, studio: { ...s, presentation: s.presentation.map(x => x.id === p.id ? { ...x,visible:e.target.checked } : x) } } })} />Show agency presentation section</label>}
    <h3 className="font-heading text-2xl"><EditableText small value={p.title} editing={editing} label={`${p.id} heading`} onChange={v => change(p.id,'title',v)} /></h3>
    <EditableText value={p.body} editing={editing} label={`${p.id} presentation`} onChange={v => change(p.id,'body',v)} />
    <div className="grid gap-4 sm:grid-cols-2">{Object.entries(doc.media || {}).filter(([,a]) => a.section === p.id).map(([key,asset]) => <StudioAsset key={key} asset={asset} editing={editing} onChange={a => onChange({ ...doc,media:{ ...doc.media,[key]:a } })} onRemove={() => onChange({ ...doc,media:Object.fromEntries(Object.entries(doc.media).filter(([k]) => k !== key)) })} />)}</div>
    {editing && <label className="block text-xs text-muted-foreground">Assign agency image to {p.title}<select aria-label={`Assign image to ${p.id}`} className="admin-input mt-1" value="" onChange={e => { const a = MEDIA_LIBRARY.find(x => x.key === e.target.value); if (a) onChange({ ...doc,media:{ ...doc.media,[`${p.id}-${a.key}`]:{ url:a.url,name:a.slot,section:p.id,alt:a.slot,fit:'fit' } } }); }}><option value="">Choose agency image</option>{MEDIA_LIBRARY.filter(a => a.url).map(a => <option key={a.key} value={a.key}>{a.slot}</option>)}</select></label>}
  </section>)}</div>;
}