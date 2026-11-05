import React, { useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import ListCockpit from '@/components/ignite/ListCockpit';
import ListSettings from '@/components/ignite/ListSettings';
import { useLists } from '@/components/ignite/useIgnite';

export default function IgniteProjectPage() {
  const { clientId, projectId } = useParams();
  const { openTask } = useOutletContext();
  const { data: lists = [], isPending } = useLists(clientId);
  const [settings, setSettings] = useState(false);
  const list = lists.find((l) => l.id === projectId);

  if (isPending) return <p className="ig-muted" style={{ paddingTop: 16 }}>Loading project…</p>;
  if (!list) return <p className="ig-muted" style={{ paddingTop: 16 }}>This project could not be found.</p>;

  return (
    <ListCockpit key={list.id} list={list} onOpen={openTask}
      toolbarExtra={<button type="button" className="ig-btn" onClick={() => setSettings(!settings)}>{settings ? 'Close settings' : 'Project settings'}</button>}>
      {settings && <div style={{ marginBottom: 16 }}><ListSettings key={list.id} list={list} /></div>}
    </ListCockpit>
  );
}