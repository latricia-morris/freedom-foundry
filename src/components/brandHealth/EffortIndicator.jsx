import React from 'react';
import { EFFORT_LABELS } from '@/lib/matrix';

const SEGMENTS = 4;
const FILLED = { none: 0, occasional: 1, consistent: 2, high: 3 };

/**
 * Compact four-segment effort indicator with a mandatory text label. Effort
 * levels describe commitment, not effectiveness; Unknown shows no indicator.
 */
export default function EffortIndicator({ level, tone = 'slate' }) {
  const label = EFFORT_LABELS[level];
  if (!label) return <span className="text-sm text-muted-foreground">Not set</span>;
  if (level === 'unknown') {
    return <span className="text-sm text-muted-foreground">Not established</span>;
  }
  const filled = FILLED[level] ?? 0;
  const color = tone === 'copper' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))';
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <span
            key={i}
            className="h-2.5 w-1.5 rounded-[1px]"
            style={{ backgroundColor: i < filled ? color : 'hsl(var(--border))' }}
          />
        ))}
      </span>
      <span className="text-sm text-foreground">{label}</span>
    </span>
  );
}