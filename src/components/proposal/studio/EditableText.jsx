import React, { useState } from 'react';
import ProposalText from '@/components/proposal/studio/ProposalText';
export default function EditableText({ value, onChange, label, editing, small = false }) {
  const [open, setOpen] = useState(false), [text, setText] = useState('');
  if (open && editing) return <label className="block text-xs text-muted-foreground">{label}<textarea autoFocus aria-label={label} className="admin-input mt-1" rows={small ? 2 : Math.min(12, Math.max(3, text.split('\n').length + 1))} value={text} onChange={e => setText(e.target.value)} onBlur={() => { onChange(text); setOpen(false); }} onKeyDown={e => { if (e.key === 'Escape') setOpen(false); if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) e.currentTarget.blur(); }} /></label>;
  return <div role={editing ? 'button' : undefined} tabIndex={editing ? 0 : undefined} aria-label={editing ? `Edit ${label}` : undefined} className={editing ? 'rounded-sm border border-transparent p-2 -m-2 cursor-text hover:border-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring' : ''} onClick={editing ? () => { setText(value || ''); setOpen(true); } : undefined} onKeyDown={editing ? e => { if (e.key === 'Enter') { setText(value || ''); setOpen(true); } } : undefined}>
    <ProposalText text={value || (editing ? `Add ${label.toLowerCase()}` : '')} />
  </div>;
}