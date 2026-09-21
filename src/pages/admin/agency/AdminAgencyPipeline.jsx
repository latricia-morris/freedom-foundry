import React, { useState } from 'react';
import AdminAgencyProposals from './AdminAgencyProposals';
import AgencySalesTab from '@/components/admin/agency/AgencySalesTab';

const TAB_KEY = 'ff-pipeline-tab';
const TABS = [
  { id: 'proposals', label: 'Proposals' },
  { id: 'sales', label: 'Sales' },
];

export default function AdminAgencyPipeline() {
  const [tab, setTab] = useState(() => window.sessionStorage.getItem(TAB_KEY) || 'proposals');

  const select = (next) => {
    setTab(next);
    window.sessionStorage.setItem(TAB_KEY, next);
  };

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <h1 className="mb-6 font-heading text-4xl font-light text-foreground">Pipeline</h1>
      <div
        role="tablist"
        aria-label="Pipeline views"
        className="mb-8 flex w-fit items-center gap-1 rounded-full border border-border bg-card/70 p-1"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => select(t.id)}
            className={`rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              tab === t.id ? 'btn-forge' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'proposals' ? <AdminAgencyProposals /> : <AgencySalesTab />}
    </div>
  );
}