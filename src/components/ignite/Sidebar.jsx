import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLists } from './useIgnite';

const navClass = ({ isActive }) => `ig-nav ${isActive ? 'active' : ''}`;

function ClientNode({ folder, open, projectId }) {
  const { data: lists = [] } = useLists(open ? folder.id : null);
  return (
    <div>
      <Link to={`/ignite-os/clients/${folder.id}`} className={`ig-node ${open && !projectId ? 'active' : ''}`}>{folder.name}</Link>
      {open && lists.map((l) => (
        <Link key={l.id} to={`/ignite-os/clients/${folder.id}/projects/${l.id}`} className={`ig-child ${l.id === projectId ? 'active' : ''}`}>{l.name}</Link>
      ))}
    </div>
  );
}

export default function Sidebar({ folders, clientId, projectId, reviewCount }) {
  return (
    <aside className="ig-side">
      <Link to="/ignite-os" className="ig-brand">IGNITE OS</Link>
      <NavLink end to="/ignite-os" className={navClass}>Active Projects</NavLink>
      <div className="ig-tree">
        {folders.map((f) => <ClientNode key={f.id} folder={f} open={f.id === clientId} projectId={projectId} />)}
      </div>
      <NavLink to="/ignite-os/templates" className={navClass}>Master Brand Templates</NavLink>
      <NavLink to="/ignite-os/notifications" className={navClass}>
        Notifications{reviewCount > 0 && <span className="ig-badge">{reviewCount}</span>}
      </NavLink>
      <a href="/admin" className="ig-nav" style={{ marginTop: 'auto' }}>Back to Freedom Foundry</a>
    </aside>
  );
}