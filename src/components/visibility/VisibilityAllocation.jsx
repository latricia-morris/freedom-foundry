import React from 'react';

/**
 * Suggested marketing emphasis: a strategic allocation layer drafted from
 * the intake and score pattern. Each item carries its own rationale so the
 * recommendation reads as expert thinking, not bare percentages.
 */
export default function VisibilityAllocation({ allocation }) {
  const items = (allocation || []).filter((a) => a && a.area);
  if (!items.length) return null;

  return (
    <div className="space-y-6">
      {items.map((a, i) => {
        const pct = typeof a.percent === 'number' ? Math.min(100, a.percent) : 0;
        return (
          <div key={i}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-sm text-foreground">{a.area}</span>
              <span className="font-heading text-2xl font-light text-foreground">
                {typeof a.percent === 'number' ? `${a.percent}%` : '—'}
              </span>
            </div>
            <div className="well-track mb-2 h-2 w-full">
              <div className="molten-bar h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            {a.rationale && <p className="text-xs leading-relaxed text-muted-foreground">{a.rationale}</p>}
          </div>
        );
      })}
    </div>
  );
}