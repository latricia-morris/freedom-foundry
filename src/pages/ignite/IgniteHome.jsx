import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useFolders, useLists } from '@/components/ignite/useIgnite';
import { E } from '@/components/ignite/igniteApi';

function ProjectCount({ folderId }) {
  const { data: lists } = useLists(folderId);
  return <p className="ig-muted" style={{ margin: 0 }}>{lists ? `${lists.length} project${lists.length === 1 ? '' : 's'}` : '…'}</p>;
}

export default function IgniteHome() {
  const { data: folders = [], isPending } = useFolders();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState('');

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const f = await E.IgniteFolder.create({ name: name.trim() });
    await qc.invalidateQueries({ queryKey: ['ig-folders'] });
    navigate(`/ignite-os/clients/${f.id}`);
  };

  return (
    <div style={{ paddingTop: 16, display: 'grid', gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>Active Projects</h1>
      <form onSubmit={create} style={{ display: 'flex', gap: 8, maxWidth: 480 }}>
        <input className="ig-input" style={{ flex: 1 }} placeholder="New client name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="ig-btn ig-primary">Add client</button>
      </form>
      {isPending ? <p className="ig-muted">Loading clients…</p> : !folders.length ? <p className="ig-muted">No clients yet. Add your first client above.</p> : (
        <div className="ig-grid">
          {folders.map((f) => (
            <Link key={f.id} to={`/ignite-os/clients/${f.id}`} className="ig-card ig-cardlink">
              <h2 style={{ margin: '0 0 4px', fontSize: 17 }}>{f.name}</h2>
              <ProjectCount folderId={f.id} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}