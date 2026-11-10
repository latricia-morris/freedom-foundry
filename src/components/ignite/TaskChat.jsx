import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { E } from './igniteApi';

const TOKEN = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;

function renderBody(body, onOpen) {
  const out = [];
  let last = 0;
  for (const m of body.matchAll(TOKEN)) {
    out.push(body.slice(last, m.index));
    out.push(<button key={m.index} className="ig-link" onClick={() => onOpen(m[2])}>{m[1]}</button>);
    last = m.index + m[0].length;
  }
  out.push(body.slice(last));
  return out;
}

export default function TaskChat({ task, siblings, onOpen }) {
  const qc = useQueryClient();
  const key = ['ig-comments', task.id];
  const { data: comments = [] } = useQuery({ queryKey: key, queryFn: () => E.IgniteComment.filter({ task_id: task.id }, 'created_date', 200) });
  const { data: me } = useQuery({ queryKey: ['ig-me'], queryFn: () => base44.auth.me() });
  useEffect(() => E.IgniteComment.subscribe((ev) => {
    if (ev.data?.task_id === task.id) qc.invalidateQueries({ queryKey: ['ig-comments', task.id] });
  }), [task.id, qc]);

  const [text, setText] = useState('');
  const m = text.match(/@@([^@\n]*)$/);
  const matches = m ? siblings.filter((s) => s.id !== task.id && s.title.toLowerCase().includes(m[1].toLowerCase())).slice(0, 8) : [];
  const pick = (s) => setText(`${text.slice(0, m.index)}[[${s.title.replace(/[|\]]/g, '')}|${s.id}]] `);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await E.IgniteComment.create({ task_id: task.id, list_id: task.list_id, body: text.trim(), author_name: me?.full_name || me?.email || 'Team member' });
    setText('');
    qc.invalidateQueries({ queryKey: key });
  };

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid var(--ff-line)', paddingTop: 12, display: 'flex', flexDirection: 'column', minHeight: 170, flex: 1 }}>
      <span className="ig-label">Chat activity feed</span>
      <div className="ig-feed">
        {!comments.length && <p className="ig-muted" style={{ margin: 0 }}>No messages yet.</p>}
        {comments.map((c) => (
          <div key={c.id} className="ig-msg">
            <b>{c.author_name}:</b> {renderBody(c.body, onOpen)}
            <span className="ig-time">{new Date(c.created_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
          </div>
        ))}
      </div>
      <form onSubmit={send} style={{ position: 'relative', display: 'flex', gap: 6 }}>
        {matches.length > 0 && (
          <div className="ig-mentions">{matches.map((s) => <button type="button" key={s.id} onClick={() => pick(s)}>{s.title}</button>)}</div>
        )}
        <input className="ig-input" style={{ flex: 1 }} placeholder="Type message... use @@ to pull link" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="ig-btn ig-primary">Send</button>
      </form>
    </div>
  );
}