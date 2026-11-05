import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTasks } from './useIgnite';
import { deployTemplate } from './igniteApi';

export default function TemplateCard({ tpl, folders, onDeployed }) {
  const qc = useQueryClient();
  const { data: tasks = [] } = useTasks(tpl.id);
  const [name, setName] = useState(tpl.name);
  const [date, setDate] = useState('');
  const [folderId, setFolderId] = useState(tpl.folder_id || folders[0]?.id || '');
  const [busy, setBusy] = useState(false);

  const deploy = async (e) => {
    e.preventDefault();
    setBusy(true);
    const list = await deployTemplate(tpl, tasks, { name, event_date: date || undefined, folder_id: folderId });
    await qc.invalidateQueries({ queryKey: ['ig-lists', folderId] });
    setBusy(false);
    onDeployed(list);
  };

  return (
    <form className="ig-card" onSubmit={deploy} style={{ display: 'grid', gap: 10 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 17 }}>{tpl.name}</h2>
        <p className="ig-muted" style={{ margin: '2px 0 0' }}>{folders.find((f) => f.id === tpl.folder_id)?.name || 'No folder'} · {tasks.length} tasks · {(tpl.phases || []).length} phases</p>
        {tpl.strategy_text && <p style={{ margin: '8px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tpl.strategy_text}</p>}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input className="ig-input" style={{ flex: '2 1 200px' }} value={name} onChange={(e) => setName(e.target.value)} aria-label="New list name" />
        <input type="date" className="ig-input" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Event date" title="Event date — due dates roll from here" />
        <select className="ig-select" value={folderId} onChange={(e) => setFolderId(e.target.value)} aria-label="Folder">
          {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <button className="ig-btn ig-primary" disabled={busy || !name.trim() || !folderId}>{busy ? 'Deploying…' : 'Deploy template'}</button>
      </div>
    </form>
  );
}