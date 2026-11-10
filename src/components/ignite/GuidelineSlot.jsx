import React from 'react';

export default function GuidelineSlot({ title, hint, status, children }) {
  return (
    <div className="ig-row" style={{ gridTemplateColumns: 'minmax(0,1fr) auto', whiteSpace: 'normal', alignItems: 'start' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: 'var(--ff-text-header)', fontWeight: 500 }}>{title}</div>
        <div className="ig-muted" style={{ fontSize: 13, overflowWrap: 'anywhere' }}>{status || hint}</div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>{children}</div>
    </div>
  );
}