import React from 'react';
import { Avatar } from './Bits';

export default function NotificationsView({ tasks, onOpen }) {
  return (
    <div style={{ paddingTop: 16 }}>
      <h1 style={{ fontSize: 22, margin: '0 0 12px' }}>Brand Review Queue</h1>
      {!tasks.length ? <p className="ig-muted">Nothing is awaiting review.</p> : (
        <div className="ig-phase">
          {tasks.map((t) => (
            <div key={t.id} className="ig-row" style={{ gridTemplateColumns: '8px minmax(0,1fr) 28px 150px' }}>
              <span className="ig-dot" />
              <button className="ig-title" onClick={() => onOpen(t.id)}>{t.title}</button>
              <Avatar name={t.assignee_name} />
              <span className="ig-due">{t.submitted_for_review_at ? new Date(t.submitted_for_review_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}