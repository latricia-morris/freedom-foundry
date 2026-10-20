import React from 'react';
import EditableText from '@/components/proposal/studio/EditableText';
import PassageTable from '@/components/proposal/studio/PassageTable';
export const MODE_LABELS = { included: 'Included in this agreement', optional_now: 'Optional, select explicitly', future: 'Future engagement, separate acceptance', unclear: 'Acceptance needs review' };
export default function StudioPassages({ doc, section, editing, onChange }) {
  const s = doc.content.studio, blocks = s.blocks.filter(b => b.section === section && (editing || b.visible !== false));
  const change = (id,text) => onChange({ ...doc, content: { ...doc.content, studio: { ...s, blocks: s.blocks.map(b => b.id === id ? { ...b, text } : b) } } });
  return <div className="space-y-6">{blocks.map(b => { const service = s.services.find(m => m.id === b.service_id); return <div key={b.id} data-passage-id={b.id} className={b.visible === false ? 'opacity-50' : ''}>
    {(b.acceptance_mode === 'future' || (service && /^#{1,6}\s/.test(b.text))) && <p className="mb-2 text-xs font-semibold text-primary">{MODE_LABELS[b.acceptance_mode || service?.acceptance_mode]}</p>}
    {b.text.trim().startsWith('|') ? <PassageTable block={b} editing={editing} onChange={text => change(b.id,text)} /> : <EditableText label={`passage ${b.id}`} value={b.text} editing={editing} onChange={text => change(b.id,text)} />}
    {editing && <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={b.visible !== false} onChange={e => onChange({ ...doc, content: { ...doc.content, studio: { ...s, blocks: s.blocks.map(x => x.id === b.id ? { ...x, visible: e.target.checked, reviewed: !e.target.checked } : x) } } })} />Visible to client</label>}
  </div>; })}</div>;
}