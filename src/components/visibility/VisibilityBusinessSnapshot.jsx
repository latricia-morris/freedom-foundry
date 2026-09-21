import React from 'react';
import { ExternalLink } from 'lucide-react';

const SNAPSHOT_FIELDS = [
  ['email_platform', 'Email platform'],
  ['email_frequency', 'Email frequency'],
  ['marketing_blasts', 'Marketing blasts'],
  ['drip_campaigns', 'Drip campaigns'],
  ['funnel_assets', 'Key funnel assets'],
  ['events_launches', 'Events & launches'],
];

/**
 * Compact business snapshot: the operational context behind the scores.
 * Renders social channels plus whatever snapshot fields are captured.
 */
export default function VisibilityBusinessSnapshot({ report }) {
  const channels = report?.social_channels || [];
  const snap = report?.business_snapshot || {};
  const snapRows = SNAPSHOT_FIELDS.filter(([key]) => snap[key]);

  if (!channels.length && !snapRows.length) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {channels.length > 0 && (
        <div>
          <h4 className="mb-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">Social channels</h4>
          <ul className="space-y-2">
            {channels.map((c, i) => (
              <li key={i} className="rounded-sm border border-border/60 bg-background/40 px-4 py-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="text-sm text-foreground">
                    {c.platform}
                    {c.handle ? <span className="text-muted-foreground"> · {c.handle}</span> : null}
                  </span>
                  {c.followers && <span className="text-xs text-muted-foreground">{c.followers}</span>}
                </div>
                {c.notes && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground/80">{c.notes}</p>}
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-warm mt-1.5 inline-flex items-center gap-1"
                  >
                    Open channel <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {snapRows.length > 0 && (
        <div>
          <h4 className="mb-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">Operational context</h4>
          <dl className="space-y-2">
            {snapRows.map(([key, label]) => (
              <div key={key} className="rounded-sm border border-border/60 bg-background/40 px-4 py-2.5">
                <dt className="text-[10px] uppercase tracking-widest text-muted-foreground/70">{label}</dt>
                <dd className="mt-0.5 text-sm text-foreground">{snap[key]}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}