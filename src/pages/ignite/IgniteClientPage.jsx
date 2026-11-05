import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useFolders, useLists } from '@/components/ignite/useIgnite';
import { E, fmtDate } from '@/components/ignite/igniteApi';
import GuidelineManager from '@/components/ignite/GuidelineManager';
import ClientSettings from '@/components/ignite/ClientSettings';

export default function IgniteClientPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: folders = [], isPending } = useFolders();
  const { data: lists = [] } = useLists(clientId);
  const [name, setName] = useState('');
  const folder = folders.find((f) => f.id === clientId);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const l = await E.IgniteList.create({ folder_id: clientId, name: name.trim(), is_template: false, phases: ['Phase 1: Pre-Event', 'Phase 2: Live Setup'] });
    await qc.invalidateQueries({ queryKey: ['ig-lists', clientId] });
    navigate(`/ignite-os/clients/${clientId}/projects/${l.id}`);
  };

  if (isPending) return <p className="ig-muted" style={{ paddingTop: 16 }}>Loading client…</p>;
  if (!folder) return <p className="ig-muted" style={{ paddingTop: 16 }}>This client could not be found.</p>;

  return (
    <div style={{ paddingTop: 16, display: 'grid', gap: 20, maxWidth: 900 }}>
      <header>
        <span className="ig-label">Client</span>
        <h1 style={{ margin: 0, fontSize: 26 }}>{folder.name}</h1>
      </header>
      <section className="ig-phase">
        <div className="ig-phasehead" style={{ cursor: 'default' }}>Projects<span className="ig-count">{lists.length}</span></div>
        {lists.map((l) => (
          <Link key={l.id} to={`/ignite-os/clients/${clientId}/projects/${l.id}`} className="ig-row ig-projrow">
            <span className="ig-title">{l.name}</span>
            <span className="ig-due">{l.event_date ? `Event ${fmtDate(l.event_date)}` : ''}</span>
          </Link>
        ))}
        <form onSubmit={create} className="ig-row" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
          <input className="ig-input" placeholder="New project name" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="ig-btn">Add project</button>
        </form>
      </section>
      <GuidelineManager folderId={folder.id} />
      <ClientSettings key={folder.id} folder={folder} />
    </div>
  );
}