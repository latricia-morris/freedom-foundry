import React from 'react';

/**
 * Big hero score: oversized molten-gradient number with kicker label,
 * status pill, supporting line, and optional mini stat chips.
 */
export default function HeroScore({ label, value, suffix = '/100', pill, subline, stats }) {
  return (
    <div className="bh-card relative overflow-hidden p-6 sm:p-10">
      <div className="ember-glow-bg pointer-events-none absolute -right-16 -top-20 h-72 w-72 opacity-70" />
      <div className="relative">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3">
          <p className="molten-text font-heading text-6xl font-light leading-none sm:text-8xl">
            {typeof value === 'number' ? value : '—'}
          </p>
          {typeof value === 'number' && (
            <span className="font-heading text-2xl text-muted-foreground sm:text-3xl">{suffix}</span>
          )}
        </div>
        {pill && (
          <span className="mt-5 inline-flex rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            {pill}
          </span>
        )}
        {subline && <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{subline}</p>}
        {stats?.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-border/60 bg-background/40 px-3.5 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{s.label}</p>
                <p className="molten-text font-heading text-2xl font-light leading-snug sm:text-3xl">
                  {typeof s.value === 'number' ? s.value : '—'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}