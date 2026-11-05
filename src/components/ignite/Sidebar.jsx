import React from 'react';

const NAV = [['projects', 'Active Projects'], ['templates', 'Master Brand Templates'], ['notifications', 'Notifications'], ['settings', 'System Settings']];

export default function Sidebar({ view, setView, reviewCount }) {
  return (
    <aside className="ig-side">
      <div className="ig-brand">IGNITE OS</div>
      {NAV.map(([key, label]) => (
        <button key={key} className={`ig-nav ${view === key ? 'active' : ''}`} onClick={() => setView(key)}>
          {label}
          {key === 'notifications' && reviewCount > 0 && <span className="ig-badge">{reviewCount}</span>}
        </button>
      ))}
      <a href="/admin" className="ig-nav" style={{ marginTop: 'auto' }}>Back to Freedom Foundry</a>
    </aside>
  );
}