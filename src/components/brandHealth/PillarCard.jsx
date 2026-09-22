import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import KeyPoints from './KeyPoints';

const STATUS_TONES = {
  complete: 'border-primary/40 bg-primary/10 text-primary',
  progress: 'border-primary/30 bg-primary/5 text-primary/90',
  muted: 'border-border/70 bg-background/50 text-muted-foreground',
};

/**
 * Index pillar card: large molten-gradient score(s), a status pill, and
 * skimmable key points. The whole card opens the pillar's dashboard.
 */
export default function PillarCard({ to, title, scores = [], status, statusTone = 'muted', points, fallback }) {
  const hasScore = scores.some((s) => typeof s.value === 'number');
  const shown = hasScore ? scores : [{ label: '', value: null }];

  return (
    <Link
      to={to}
      className="bh-card bh-card-hover group flex scroll-mt-32 flex-col p-6 sm:p-8 lg:scroll-mt-44"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-2xl font-light leading-tight text-foreground">{title}</h3>
        <ArrowRight
          className="h-5 w-5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary"
          strokeWidth={1.5}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-5">
        {shown.map((s, i) => (
          <div key={i}>
            <p className="molten-text font-heading text-6xl font-light leading-none sm:text-7xl">
              {typeof s.value === 'number' ? s.value : '—'}
            </p>
            {s.label && (
              <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">{s.label}</p>
            )}
          </div>
        ))}
      </div>

      {status && (
        <span
          className={`mt-5 w-fit rounded-full border px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${STATUS_TONES[statusTone] || STATUS_TONES.muted}`}
        >
          {status}
        </span>
      )}

      <div className="mt-6 border-t border-border/50 pt-5">
        {points?.filter(Boolean).length ? (
          <KeyPoints points={points} max={3} />
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">{fallback}</p>
        )}
      </div>
    </Link>
  );
}