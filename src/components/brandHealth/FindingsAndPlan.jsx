import React from 'react';
import { ExternalLink } from 'lucide-react';
import { CREDIT_LANGUAGE, fmtDate, money } from '@/lib/brandHealth';

const PRIORITY_LABEL = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  opportunity: 'Opportunity',
  observation: 'Observation',
};

const PRIORITY_STYLE = {
  critical: 'border-red-500/40 text-red-400',
  high: 'border-primary/40 text-primary',
  medium: 'border-border text-muted-foreground',
  opportunity: 'border-border text-muted-foreground',
  observation: 'border-border text-muted-foreground/70',
};

/** Consultant Findings — only notes the consultant explicitly marked client-facing. */
export function FindingsList({ findings }) {
  if (!(findings || []).length) {
    return <p className="text-sm text-muted-foreground/70">Findings will appear here once your consultant publishes them.</p>;
  }
  return (
    <div className="grid gap-4">
      {findings.map((f, i) => (
        <article key={i} className="bh-card p-5 sm:p-7">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <span className="molten-text font-heading text-2xl font-light leading-none">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h4 className="font-heading text-xl font-light leading-tight text-foreground sm:text-2xl">{f.title || 'Finding'}</h4>
            {f.priority && (
              <span className={`ml-auto rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${PRIORITY_STYLE[f.priority] || PRIORITY_STYLE.medium}`}>
                {PRIORITY_LABEL[f.priority] || f.priority}
              </span>
            )}
          </div>
          {f.body && <p className="mt-3 max-w-3xl whitespace-pre-wrap break-words text-base leading-relaxed text-foreground/90">{f.body}</p>}
          {(f.attachments || []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {f.attachments.map((a, j) => (
                <a key={j} href={a.url} target="_blank" rel="noreferrer" className="link-warm inline-flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> {a.title}
                </a>
              ))}
            </div>
          )}
          {f.published_at ? (
            <p className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground/60">Published {fmtDate(f.published_at)}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

/** Consultant-approved action plan items. */
export function ActionPlanList({ items }) {
  if (!(items || []).length) {
    return <p className="text-sm text-muted-foreground/70">Your action plan will appear here once it is approved.</p>;
  }
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm text-muted-foreground">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border border-primary/40 text-[10px] font-semibold text-primary">
            {i + 1}
          </span>
          <div>
            <p className="text-foreground">{item.title}</p>
            {item.detail ? <p className="mt-0.5 leading-relaxed">{item.detail}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Client-facing credit language, with live remaining credit when a record exists. */
export function CreditNote({ credit }) {
  return (
    <div className="rounded-sm border border-border/60 bg-background/40 px-4 py-3">
      <p className="text-sm leading-relaxed text-muted-foreground">{CREDIT_LANGUAGE}</p>
      {credit ? (
        <p className="mt-2 text-xs text-foreground">
          Remaining audit credit: <span className="font-semibold text-primary">{money(credit.remaining_cents)}</span>
          {credit.monthly_credit_cents ? <> · applied as {money(credit.monthly_credit_cents)} per month</> : null}
          {credit.expiration_date ? <> · valid through {fmtDate(credit.expiration_date)}</> : null}
        </p>
      ) : null}
    </div>
  );
}