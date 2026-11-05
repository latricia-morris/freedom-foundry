import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import GuidelineBundle from '@/components/guidelines/GuidelineBundle';
import { useGuidelines } from '@/components/guidelines/useIgniteClient';

export default function GuidelinesPanel({ open, folder, onClose }) {
  const { data, isPending, isError } = useGuidelines(folder?.id, !!(open && folder));
  const g = data?.guideline;
  return (
    <aside className={`ig-guides ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Brand Guidelines</h2>
        <button className="ig-btn" onClick={onClose} aria-label="Close guidelines"><X size={14} /></button>
      </div>
      <p className="ig-muted" style={{ margin: '4px 0 12px' }}>{folder?.name}</p>
      {open && folder && (isPending ? <p className="ig-muted">Loading guidelines…</p>
        : isError ? <p className="ig-muted">Guidelines could not be loaded.</p>
        : g ? <>
            <Link to={`/ignite-os/clients/${folder.id}/guidelines`} onClick={onClose} className="ig-btn" style={{ display: 'inline-block', textDecoration: 'none', marginBottom: 8 }}>Open full view</Link>
            <GuidelineBundle guideline={g} compact />
          </>
        : <p className="ig-muted">No guidelines have been added for this client yet. Add them from the client page.</p>)}
    </aside>
  );
}