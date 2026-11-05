import React from 'react';
import { X } from 'lucide-react';

export default function GuidelinesPanel({ open, folder, onClose }) {
  const g = folder?.guidelines || {};
  const rows = [['Core Substance', g.core_substance], ['Target Customer Triggers', g.customer_triggers], ['Language & Style Guide Constraints', g.style_constraints]];
  return (
    <aside className={`ig-guides ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Brand Guidelines</h2>
        <button className="ig-btn" onClick={onClose} aria-label="Close guidelines"><X size={14} /></button>
      </div>
      <p className="ig-muted" style={{ margin: '4px 0 0' }}>{folder?.name || 'No folder selected'}</p>
      {rows.map(([label, value]) => (
        <div key={label} style={{ marginTop: 18 }}>
          <span className="ig-label">{label}</span>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{value || 'Not set yet.'}</p>
        </div>
      ))}
      <div style={{ marginTop: 18 }}>
        <span className="ig-label">Banned terms</span>
        <p style={{ margin: 0 }}>{g.banned_terms?.length ? g.banned_terms.join(', ') : 'None listed.'}</p>
      </div>
    </aside>
  );
}