import React from 'react';
import { ACTION_PRIORITIES } from '@/lib/matrix';
import { categoryAnchor, parentCategoryFor } from '@/lib/matrixCategories';

/**
 * Prioritized next moves: the fiery gradient panel, up to five reviewed
 * actions in actual priority order, each linked to its underlying finding.
 */
export default function MatrixPriorityMoves({ actions, channels }) {
  const sorted = [...(actions || [])]
    .sort((a, b) => ACTION_PRIORITIES.indexOf(a.priority) - ACTION_PRIORITIES.indexOf(b.priority))
    .slice(0, 5);
  if (!sorted.length) return null;

  const anchorFor = (action) => {
    const channel = (channels || []).find((c) => c.channel_name === action.associated_channel);
    const { key } = parentCategoryFor(channel || { channel_name: action.associated_channel });
    return key ? categoryAnchor(key) : null;
  };

  return (
    <section className="action-gradient scroll-mt-32 p-6 sm:p-10">
      <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/[0.07] blur-2xl" />
      <div className="relative">
        <h3 className="font-heading text-2xl font-light text-white sm:text-3xl">Prioritized next moves</h3>
        <p className="mt-1.5 text-sm text-white/75">The reviewed actions in priority order. Deeper context sits inside each category section.</p>
        <ol className="mt-6 space-y-6">
          {sorted.map((a, i) => {
            const anchor = anchorFor(a);
            return (
              <li key={i} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-xs font-semibold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="break-words text-base font-medium leading-snug text-white">{a.title}</p>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/70">
                    {a.associated_channel ? <span>{a.associated_channel}</span> : null}
                    {a.due_date ? <span>Timeframe: {a.due_date}</span> : null}
                  </div>
                  {a.detail ? <p className="mt-1.5 break-words text-sm leading-relaxed text-white/75">{a.detail}</p> : null}
                  {a.completion_condition ? (
                    <p className="mt-1.5 break-words text-sm leading-relaxed text-white/85">
                      Complete when: {a.completion_condition}
                    </p>
                  ) : null}
                  {anchor && (
                    <a href={`#${anchor}`} className="mt-2 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
                      See the finding
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}