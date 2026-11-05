import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useTaskUpdate } from './useIgnite';

export default function SubtaskList({ task }) {
  const update = useTaskUpdate();
  const [title, setTitle] = useState('');
  const subs = task.subtasks || [];
  const save = (next) => update(task.id, { subtasks: next });
  const add = (e) => {
    e.preventDefault();
    if (!title.trim() || subs.length >= 25) return;
    save([...subs, { subtask_id: crypto.randomUUID(), subtask_title: title.trim(), is_completed: false }]);
    setTitle('');
  };
  return (
    <div style={{ marginTop: 14 }}>
      <span className="ig-label">Subtasks ({subs.length}/25)</span>
      {subs.map((s) => (
        <div key={s.subtask_id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '3px 0' }}>
          <button className={`ig-check ${s.is_completed ? 'on' : ''}`} aria-label="Toggle subtask" onClick={() => save(subs.map((x) => (x.subtask_id === s.subtask_id ? { ...x, is_completed: !x.is_completed } : x)))}>
            {s.is_completed && <Check size={12} color="#fff" strokeWidth={3} />}
          </button>
          <span style={{ flex: 1, color: s.is_completed ? '#b8b9b9' : undefined }}>{s.subtask_title}</span>
          <button className="ig-link" style={{ color: '#b8b9b9' }} aria-label="Remove subtask" onClick={() => save(subs.filter((x) => x.subtask_id !== s.subtask_id))}><X size={12} /></button>
        </div>
      ))}
      {subs.length < 25 && (
        <form onSubmit={add} style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          <input className="ig-input" style={{ flex: 1 }} placeholder="Add a subtask" value={title} onChange={(e) => setTitle(e.target.value)} />
          <button className="ig-btn">Add</button>
        </form>
      )}
    </div>
  );
}