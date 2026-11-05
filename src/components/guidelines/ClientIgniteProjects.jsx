import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import './guidelines.css';
import { usePortalProjects } from './useIgniteClient';

// Client page(s) with their project child pages; hidden entirely when nothing is assigned.
export default function ClientIgniteProjects() {
  const { data } = usePortalProjects();
  const clients = (data?.clients || []).filter((c) => c.projects.length);
  if (!clients.length) return null;
  return (
    <div className="glx mb-8 rounded p-4 md:p-6" style={{ display: 'grid', gap: 16 }}>
      {clients.map((c) => (
        <section key={c.id} className="gl-card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 14px 10px' }}>
            <span className="gl-label">Active projects</span>
            <h2 style={{ margin: 0, fontSize: 20 }}>{c.name}</h2>
          </div>
          {c.projects.map((p) => (
            <Link key={p.id} to={`/brand-portal/ignite/${p.id}`} className="gl-link">
              <span>{p.name}</span><ChevronRight size={16} />
            </Link>
          ))}
        </section>
      ))}
    </div>
  );
}