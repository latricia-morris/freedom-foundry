import React from 'react';

/**
 * Strategic direction: a prominent black-glass panel with restrained ambient
 * fiery color. A short serif headline leads, the supporting paragraph reads as
 * body copy, followed by up to three takeaways (Keep / Change / Explore).
 * No composite score.
 */
export default function MatrixStrategicDirection({ audit }) {
  const summary = String(audit.consultant_summary || '').trim();
  const t = audit.takeaway || {};
  const groups = [
    { label: 'Keep', text: t.maintain || audit.takeaway_maintain },
    { label: 'Change', text: t.prioritize || audit.takeaway_prioritize },
    { label: 'Explore', text: t.test || audit.takeaway_test },
  ].filter((g) => g.text);
  if (!summary && !groups.length) return null;

  const lead = summary.split(/(?<=[.!?])\s/)[0] || '';
  const rest = lead && lead !== summary ? summary.slice(lead.length).trim() : '';

  return (
    <section className="relative overflow-hidden rounded-[3px] border border-border bg-card/70 p-6 forged-panel sm:p-10">
      <div className="ember-glow-bg pointer-events-none absolute -right-24 -top-28 h-80 w-80" />
      <div className="relative">
        <p className="text-[11px] font-medium tracking-[0.12em] text-primary">Strategic direction</p>
        {lead ? (
          <p className="mt-3 max-w-3xl font-heading text-2xl font-light leading-snug text-foreground sm:text-[28px]">
            {lead}
          </p>
        ) : null}
        {rest ? (
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">{rest}</p>
        ) : null}
        {groups.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {groups.map((g) => (
              <div key={g.label} className="border-t border-primary/25 pt-4">
                <p className="text-sm font-medium text-primary">{g.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.text}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}