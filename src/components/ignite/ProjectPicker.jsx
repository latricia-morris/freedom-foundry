import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { E } from './igniteApi';

export default function ProjectPicker({ folders, lists, folderId, listId, setFolderId, setListId }) {
  const qc = useQueryClient();
  const [mode, setMode] = useState(null);
  const [name, setName] = useState('');

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (mode === 'folder') {
      const f = await E.IgniteFolder.create({ name: name.trim() });
      await qc.invalidateQueries({ queryKey: ['ig-folders'] });
      setFolderId(f.id);
    } else {
      const l = await E.IgniteList.create({ folder_id: folderId, name: name.trim(), is_template: false, phases: ['Phase 1: Pre-Event', 'Phase 2: Live Setup'] });
      await qc.invalidateQueries({ queryKey: ['ig-lists', folderId] });
      setListId(l.id);
    }
    setMode(null); setName('');
  };

  if (mode) return (
    <form onSubmit={create} style={{ display: 'flex', gap: 8 }}>
      <input autoFocus className="ig-input" placeholder={mode === 'folder' ? 'Folder name' : 'List name'} value={name} onChange={(e) => setName(e.target.value)} />
      <button className="ig-btn ig-primary">Create</button>
      <button type="button" className="ig-btn" onClick={() => setMode(null)}>Cancel</button>
    </form>
  );
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 0, flexWrap: 'wrap' }}>
      <select className="ig-select" value={folderId} onChange={(e) => setFolderId(e.target.value)} aria-label="Folder">
        {!folders.length && <option value="">No folders</option>}
        {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
      <span className="ig-muted">/</span>
      <select className="ig-select" value={listId} onChange={(e) => setListId(e.target.value)} aria-label="List">
        {!lists.length && <option value="">No lists</option>}
        {lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
      </select>
      <button className="ig-btn" onClick={() => setMode('folder')}>+ Folder</button>
      {folderId && <button className="ig-btn" onClick={() => setMode('list')}>+ List</button>}
    </div>
  );
}