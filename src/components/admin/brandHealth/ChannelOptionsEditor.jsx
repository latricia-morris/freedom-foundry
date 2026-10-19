import React, { useEffect, useState } from 'react';
import { CATEGORY_OPTIONS, USE_STATES } from '@/lib/matrixOptions';
import { parentCategoryFor } from '@/lib/matrixCategories';

/**
 * The Marketing Masterplan option library for one channel record, scoped to
 * the channel's parent category. Records what the business uses now, what it
 * is considering, what each activity is meant to accomplish, and what does
 * not apply. Selecting an option is a use-state, not an assessment, and
 * nothing here publishes to the client report.
 */
export default function ChannelOptionsEditor({ channel, onChange, busy }) {
  const [draft, setDraft] = useState(channel.usage_profile || {});

  useEffect(() => {
    setDraft(channel.usage_profile || {});
  }, [channel?.id, channel?.updated_date]);

  if (!channel) return null;

  const catKey = (parentCategoryFor(channel) || {}).key;
  const options = CATEGORY_OPTIONS[catKey] || [];
  if (!options.length) return null;

  const saved = draft.options || [];
  const rowFor = (name) => saved.find((o) => o.name === name) || {};
  const stateFor = (name) => rowFor(name).state || '';
  const purposeFor = (name) => rowFor(name).purpose || '';

  const commit = (next) => {
    setDraft(next);
    const ordered = options.map((n) => (next.options || []).find((o) => o.name === n)).filter(Boolean);
    onChange(channel.id, { usage_profile: { ...next, options: ordered } });
  };

  const setState = (name, state) => {
    const rest = saved.filter((o) => o.name !== name);
    const withNew = state ? [...rest, { name, state, purpose: purposeFor(name) || undefined }] : rest;
    commit({ ...draft, options: options.map((n) => withNew.find((o) => o.name === n)).filter(Boolean) });
  };

  const setPurpose = (name, purpose) => {
    commit({
      ...draft,
      options: options
        .map((n) => {
          const row = n === name ? { ...rowFor(n), purpose: purpose || undefined } : rowFor(n);
          return row.name ? row : null;
        })
        .filter(Boolean),
    });
  };

  return (
    <details className="mt-3 rounded-sm border border-border/50 px-4 py-3">
      <summary className="cursor-pointer text-[10px] uppercase tracking-widest text-muted-foreground">
        Options library — platforms, formats, tools, tactics
      </summary>
      <p className="mt-2 text-xs text-muted-foreground">
        Mark what the business uses now, what it is considering, or what does not apply. Selecting an
        option records a use state, not an assessment, and does not publish to the client report.
      </p>
      <div className="mt-3 space-y-2">
        {options.map((name) => {
          const state = stateFor(name);
          const needsPurpose = state && !['not_used', 'not_applicable', 'unknown'].includes(state);
          return (
            <div key={name} className="flex flex-wrap items-center gap-2">
              <span className="min-w-44 text-xs text-foreground">{name}</span>
              <select
                className="admin-input !w-auto !py-1 text-xs"
                value={state}
                disabled={busy}
                onChange={(e) => setState(name, e.target.value)}
              >
                <option value="">Not selected</option>
                {USE_STATES.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
              {needsPurpose ? (
                <input
                  className="admin-input min-w-48 flex-1 !py-1 text-xs"
                  placeholder="What it is intended to accomplish"
                  value={purposeFor(name)}
                  disabled={busy}
                  onChange={(e) => setDraft((d) => ({
                    ...d,
                    options: options
                      .map((n) => {
                        const row = n === name ? { ...rowFor(n), name, purpose: e.target.value || undefined } : rowFor(n);
                        return row.name ? row : null;
                      })
                      .filter(Boolean),
                  }))}
                  onBlur={(e) => setPurpose(name, e.target.value)}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </details>
  );
}