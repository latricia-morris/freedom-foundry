import React from 'react';
import { STATUSES, initials } from './igniteApi';

export function Avatar({ name }) {
  return <div className="ig-avatar" title={name || 'Unassigned'}>{initials(name) || '–'}</div>;
}

export function StatusSelect({ value, onChange, style }) {
  return (
    <select className="ig-select" style={style} value={value || 'Drafting'} onChange={(e) => onChange(e.target.value)} aria-label="Status">
      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}

export function Field({ label, children }) {
  return <label style={{ display: 'block' }}><span className="ig-label">{label}</span>{children}</label>;
}

export function StrategyRibbon({ text }) {
  return (
    <div className="ig-ribbon">
      <h2>LIST STRATEGY ANCHOR</h2>
      <p>{text || 'No strategy set for this list yet. Add one in System Settings.'}</p>
    </div>
  );
}