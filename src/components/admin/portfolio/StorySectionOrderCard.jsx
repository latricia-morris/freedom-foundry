import React from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { STORY_SECTIONS } from '@/lib/portfolioData';

/** Manual override of the story-section order used by the public case study. */
export default function StorySectionOrderCard({ form, onChange }) {
  const stored = Array.isArray(form?.section_order) ? form.section_order : [];
  const byKey = new Map(STORY_SECTIONS.map((section) => [section.key, section]));
  const rows = [...new Set([...stored, ...STORY_SECTIONS.map((section) => section.key)])]
    .map((key) => byKey.get(key))
    .filter(Boolean);

  const move = (index, dir) => {
    const neighbor = dir === 'up' ? index - 1 : index + 1;
    if (neighbor < 0 || neighbor >= rows.length) return;
    const next = [...rows];
    const [moved] = next.splice(index, 1);
    next.splice(neighbor, 0, moved);
    onChange({ section_order: next.map((section) => section.key) });
  };

  return (
    <div className="dashboard-card space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-2xl text-foreground">Story section order</h3>
          <p className="text-xs text-muted-foreground/70">
            How the case study presents the work: system, identity, digital expression, extensions, then smaller pieces.
            Reorder only when a project calls for it, then save.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ section_order: STORY_SECTIONS.map((section) => section.key) })}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
      <ol className="divide-y divide-border/50">
        {rows.map((section, index) => (
          <li key={section.key} className="flex items-center gap-3 py-2.5">
            <span className="w-5 text-xs text-muted-foreground/60">{index + 1}</span>
            <span className="flex-1 text-sm text-foreground">{section.label}</span>
            <button
              type="button"
              onClick={() => move(index, 'up')}
              disabled={index === 0}
              className="rounded-sm p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
              aria-label={`Move ${section.label} up`}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => move(index, 'down')}
              disabled={index === rows.length - 1}
              className="rounded-sm p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
              aria-label={`Move ${section.label} down`}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}