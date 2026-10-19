import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import BrainHubBoard from '@/components/brainhub/BrainHubBoard';

const TABS = [
  { key: 'mood_board', label: 'Mood Boards' },
  { key: 'vision_board', label: 'Vision Boards' },
  { key: 'checklist', label: 'Checklists' },
  { key: 'idea_dump', label: 'Idea Dumps' },
];

export default function BrainHub() {
  const [tab, setTab] = useState('mood_board');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    base44.entities.BrainHubItem.filter({}, { sort: '-created_date', limit: 100 })
      .then((page) => setItems(page.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const tabItems = items.filter((item) => item.tab === tab);

  return (
    <div className="max-w-5xl animate-fade-in">
      <div className="mb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Brand Portal</span>
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground mt-1 mb-2">
          Brain <span className="molten-text italic">Hub</span>
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-md">
          Your working space for inspiration, planning, and raw ideas.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6" role="tablist" aria-label="Brain Hub sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              tab === t.key
                ? 'btn-forge font-semibold'
                : 'border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <BrainHubBoard tab={tab} items={tabItems} loading={loading} onReload={load} />
    </div>
  );
}