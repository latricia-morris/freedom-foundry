import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import EffortIndicator from './EffortIndicator';
import MatrixChannelDetail from './MatrixChannelDetail';
import { DIRECTION_LABELS, STRATEGIC_ROLES } from '@/lib/matrix';

const roleLabel = (key) => (STRATEGIC_ROLES.find((r) => r.key === key) || {}).label || null;
const COPPER_DIRECTIONS = ['increase', 'establish', 'test_first'];

function DirectionLabel({ direction }) {
  const copper = COPPER_DIRECTIONS.includes(direction);
  return (
    <span
      className={`inline-flex rounded-[3px] border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
        copper ? 'border-primary/40 text-primary' : 'border-border text-muted-foreground'
      }`}
    >
      {DIRECTION_LABELS[direction] || 'Review'}
    </span>
  );
}

const MOBILE_LABEL = 'mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground lg:hidden';

/**
 * Effort allocation matrix: an aligned list of channels with current effort,
 * recommended effort, direction, and expandable detail. Effort levels are
 * commitment categories, not shares of a budget, and unknown stays visibly
 * unknown.
 */
export default function MatrixChannels({ channels }) {
  const [open, setOpen] = useState({});
  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  const allOpen = channels.every((c) => open[c.channel_name]);
  const anyOpen = channels.some((c) => open[c.channel_name]);

  return (
    <div>
      <div className="mb-4 rounded-[3px] border border-border bg-card/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">How to read this</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Effort levels describe the commitment to a channel, not its effectiveness. Recommendations reflect this
          business's goals, audience, resources, and available evidence. These are not shares of a fixed budget.
        </p>
      </div>

      <div className="mb-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(Object.fromEntries(channels.map((c) => [c.channel_name, true])))}
          className="rounded-[3px] border border-border px-3 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
        {anyOpen && !allOpen ? (
          <button
            type="button"
            onClick={() => setOpen({})}
            className="rounded-[3px] border border-border px-3 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            Collapse all
          </button>
        ) : null}
      </div>

      <div className="hidden gap-4 border-b border-border px-4 pb-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground lg:grid lg:grid-cols-[1.5fr_1fr_1fr_0.9fr_1.5rem]">
        <span>Channel</span>
        <span>Current effort</span>
        <span>Recommended effort</span>
        <span>Direction</span>
        <span />
      </div>

      <div className="divide-y divide-border">
        {channels.map((channel) => {
          const eff = channel.effort || {};
          const isOpen = !!open[channel.channel_name];
          const rowId = `matrix-row-${(channel.channel_name || '').replace(/\s+/g, '-').toLowerCase()}`;
          return (
            <div key={channel.channel_name} className="border-b border-border/60 last:border-b-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={rowId}
                onClick={() => toggle(channel.channel_name)}
                className="w-full text-left transition-colors hover:bg-background/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/70"
              >
                <div className="grid gap-3 p-4 lg:grid-cols-[1.5fr_1fr_1fr_0.9fr_1.5rem] lg:items-center lg:gap-4">
                  <div>
                    <p className="font-medium text-foreground">{channel.channel_name}</p>
                    {roleLabel(channel.strategic_role) ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{roleLabel(channel.strategic_role)}</p>
                    ) : null}
                    <span className="mt-2 inline-flex lg:hidden">
                      <DirectionLabel direction={eff.direction} />
                    </span>
                  </div>
                  <div>
                    <span className={MOBILE_LABEL}>Current effort</span>
                    <EffortIndicator level={eff.current} tone="slate" />
                  </div>
                  <div>
                    <span className={MOBILE_LABEL}>Recommended effort</span>
                    <EffortIndicator level={eff.recommended} tone="copper" />
                  </div>
                  <div className="hidden lg:block">
                    <DirectionLabel direction={eff.direction} />
                  </div>
                  <ChevronDown
                    className={`hidden h-4 w-4 text-muted-foreground transition-transform lg:block ${isOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>
              {isOpen ? (
                <div id={rowId}>
                  <MatrixChannelDetail channel={channel} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}