import React from 'react';

export default function DashSection({ title, hint, children }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-border/50 pb-2">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">{children}</div>
    </section>
  );
}