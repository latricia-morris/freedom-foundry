import React, { useState } from 'react';
import ChannelSnapshot from './ChannelSnapshot';
import SocialChannelsEditor from './SocialChannelsEditor';

const SNAPSHOT_FIELDS = [
  ['email_platform', 'Email platform'],
  ['email_frequency', 'Email frequency'],
  ['marketing_blasts', 'Marketing blasts'],
  ['drip_campaigns', 'Drip campaigns'],
  ['funnel_assets', 'Key funnel assets'],
  ['events_launches', 'Events & launches'],
];

/**
 * Business snapshot: one full-width comparative reach chart as the visual
 * focus, with the captured operational context as a quiet second layer.
 * Admins get an inline edit affordance for the channel list.
 */
export default function VisibilityBusinessSnapshot({ report, editable, onSaveChannels }) {
  const channels = report?.social_channels || [];
  const snap = report?.business_snapshot || {};
  const snapRows = SNAPSHOT_FIELDS.filter(([key]) => snap[key]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!channels.length && !snapRows.length) return null;

  const handleSave = async (rows) => {
    setSaving(true);
    try {
      await onSaveChannels(rows);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <ChannelSnapshot channels={channels} onEdit={editable ? () => setEditing(true) : undefined} />
      {editable && (
        <SocialChannelsEditor
          open={editing}
          channels={channels}
          saving={saving}
          onClose={() => setEditing(false)}
          onSave={handleSave}
        />
      )}
      {snapRows.length > 0 && (
        <div className="min-w-0">
          <h4 className="mb-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">Operational context</h4>
          <dl className="grid gap-2 sm:grid-cols-2">
            {snapRows.map(([key, label]) => (
              <div key={key} className="rounded-sm border border-border/60 bg-background/40 px-4 py-2.5">
                <dt className="text-[10px] uppercase tracking-widest text-muted-foreground/70">{label}</dt>
                <dd className="mt-0.5 break-words text-sm text-foreground">{snap[key]}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}