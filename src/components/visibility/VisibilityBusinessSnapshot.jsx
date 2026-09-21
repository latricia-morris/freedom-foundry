import React from 'react';
import ChannelSnapshot from './ChannelSnapshot';

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
          <h4 className="mb-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">Channel snapshot</h4>
          <ChannelSnapshot channels={channels} />
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