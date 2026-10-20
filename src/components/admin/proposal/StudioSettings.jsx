import React from 'react';
import StudioField from '@/components/proposal/studio/StudioField';
export default function StudioSettings({ doc, onChange }) {
  return <details className="rounded-sm border border-border bg-card p-4"><summary className="cursor-pointer text-sm">Proposal settings and private notes</summary><div className="mt-3 grid gap-3 sm:grid-cols-2">{['title','project_type','issue_date','expiry_date'].map(key=><StudioField key={key} label={`Proposal ${key.replaceAll('_',' ')}`} type={key.endsWith('date') ? 'date':'text'} value={doc[key]} onChange={v=>onChange({...doc,[key]:v})} />)}<StudioField multiline label="Private agency notes" value={doc.admin_notes} onChange={v=>onChange({...doc,admin_notes:v})} /></div></details>;
}