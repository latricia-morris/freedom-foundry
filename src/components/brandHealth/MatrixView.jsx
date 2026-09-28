import React from 'react';
import { PRIORITY_COLORS, opportunityScore } from '@/lib/matrix';

/**
 * Equalizer-style Channel Map.
 *
 * Replaces the unlabeled scatter-dot chart with a horizontal set of
 * vertical "EQ bands" — one per channel. Each band shows:
 *   - current fill height = maturity (how established the channel is now)
 *   - a direction arrow = whether the consultant wants that channel
 *     turned up, held steady, or turned down
 *   - the channel name and opportunity score printed directly beneath it
 *
 * No coordinate math to interpret, no unlabeled dots, no legend required
 * to decode what you're looking at. Uses flex-wrap only (no fixed widths,
 * no absolute positioning), so it cannot overflow its container.
 */

const DIRECTION_BY_PRIORITY = {
  build: 'up',
  scale: 'up',
  test: 'up',
  optimize: 'hold',
  maintain: 'hold',
  deprioritize: 'down',
  not_applicable: 'hold',
};

const DIRECTION_ICON = { up: '▲', hold: '▬', down: '▼' };
const DIRECTION_LABEL = { up: 'Turn up', hold: 'Hold steady', down: 'Turn down' };

const TRACK_HEIGHT_PX = 140;

export default function ChannelEqualizer({ audit, matrixChannels = [] }) {
  const bands = matrixChannels
    .map((ch) => {
      const maturity = Number(ch.maturity);
      const level = Number.isFinite(maturity) ? Math.max(0, Math.min(5, maturity)) / 5 : 0;
      const priority = ch.consultant_priority || 'not_applicable';
      const direction = DIRECTION_BY_PRIORITY[priority] || 'hold';
      const color = PRIORITY_COLORS[priority] || PRIORITY_COLORS.not_applicable;
      const score = opportunityScore(ch, audit);
      return { channel: ch, level, direction, color, score, priority };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end justify-center gap-4 rounded-lg border border-border bg-card/40 p-6">
        {bands.map((band) => (
          <div key={band.channel.id || band.channel.channel_name} className="flex flex-col items-center" style={{ width: 84 }}>
            <span
              className="mb-1 text-sm"
              style={{ color: band.color }}
              title={DIRECTION_LABEL[band.direction]}
            >
              {DIRECTION_ICON[band.direction]}
            </span>

            <div
              className="relative w-6 overflow-hidden rounded-full bg-black/30"
              style={{ height: TRACK_HEIGHT_PX }}
              title={`${band.channel.channel_name} — maturity ${band.channel.maturity ?? '—'}/5`}
            >
              <div
                className="absolute bottom-0 left-0 w-full rounded-full transition-all"
                style={{
                  height: `${Math.round(band.level * 100)}%`,
                  backgroundColor: band.color,
                }}
              />
            </div>

            <span className="mt-2 rounded bg-black/20 px-1.5 py-0.5 text-[11px] font-medium text-foreground">
              {band.score}
            </span>

            <span className="mt-1 line-clamp-2 text-center text-[11px] leading-tight text-muted-foreground">
              {band.channel.channel_name}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span style={{ color: PRIORITY_COLORS.build }}>▲</span> Turn up
        </span>
        <span className="flex items-center gap-1">
          <span style={{ color: PRIORITY_COLORS.maintain }}>▬</span> Hold steady
        </span>
        <span className="flex items-center gap-1">
          <span style={{ color: PRIORITY_COLORS.deprioritize }}>▼</span> Turn down
        </span>
        <span className="ml-2">Bar height = current maturity · Number = opportunity score (0–100)</span>
      </div>
    </div>
  );
}