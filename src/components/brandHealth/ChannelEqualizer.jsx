import React from 'react';
import { PRIORITY_COLORS, opportunityScore } from '@/lib/matrix';

const TRACK_HEIGHT_PX = 160;
const TRACK_WIDTH_PX = 22;
const TARGET_LINE_WIDTH_PX = 44;

function targetLevel(ch) {
  const fit = Number(ch.strategic_fit);
  const impact = Number(ch.buyer_impact);
  const f = Number.isFinite(fit) ? Math.max(1, Math.min(5, fit)) : 3;
  const i = Number.isFinite(impact) ? Math.max(1, Math.min(5, impact)) : 3;
  return (f + i) / 2 / 5;
}

function currentLevel(ch) {
  const maturity = Number(ch.maturity);
  return Number.isFinite(maturity) ? Math.max(0, Math.min(5, maturity)) / 5 : 0;
}

export default function ChannelEqualizer({ audit, matrixChannels }) {
  const bands = matrixChannels
    .map((ch) => {
      const level = currentLevel(ch);
      const target = targetLevel(ch);
      const priority = ch.consultant_priority || 'not_applicable';
      const color = PRIORITY_COLORS[priority] || PRIORITY_COLORS.not_applicable;
      const score = opportunityScore(ch, audit);
      const gap = target - level;
      return { channel: ch, level, target, color, score, gap };
    })
    .sort((a, b) => b.gap - a.gap);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end justify-center gap-5 rounded-lg border border-border bg-card/40 p-6">
        {bands.map((band) => {
          const gradientId = `eq-grad-${(band.channel.id || band.channel.channel_name).replace(/[^a-zA-Z0-9]/g, '')}`;
          return (
            <div key={band.channel.id || band.channel.channel_name} className="flex flex-col items-center" style={{ width: 90 }}>
              <div
                className="relative overflow-visible"
                style={{ height: TRACK_HEIGHT_PX, width: TRACK_WIDTH_PX }}
                title={`${band.channel.channel_name} — current ${Math.round(band.level * 100)}%, target ${Math.round(band.target * 100)}%`}
              >
                <div className="absolute inset-0 rounded-full bg-black/30" style={{ width: TRACK_WIDTH_PX }} />

                <svg width={TRACK_WIDTH_PX} height={TRACK_HEIGHT_PX} className="absolute bottom-0 left-0">
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor={band.color} stopOpacity="0.55" />
                      <stop offset="100%" stopColor={band.color} stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="0"
                    y={TRACK_HEIGHT_PX * (1 - band.level)}
                    width={TRACK_WIDTH_PX}
                    height={TRACK_HEIGHT_PX * band.level}
                    rx={TRACK_WIDTH_PX / 2}
                    fill={`url(#${gradientId})`}
                  />
                </svg>

                <div
                  className="absolute rounded-full bg-[#F3F4F6]"
                  style={{
                    height: 3,
                    width: TARGET_LINE_WIDTH_PX,
                    left: -(TARGET_LINE_WIDTH_PX - TRACK_WIDTH_PX) / 2,
                    bottom: TRACK_HEIGHT_PX * band.target - 1.5,
                    boxShadow: '0 0 4px rgba(243,244,246,0.6)',
                  }}
                />
              </div>

              <span className="mt-3 rounded bg-black/20 px-1.5 py-0.5 text-[11px] font-medium text-foreground">
                {band.score}
              </span>
              <span className="mt-1 line-clamp-2 text-center text-[11px] leading-tight text-muted-foreground">
                {band.channel.channel_name}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-2 rounded-full bg-gradient-to-t from-orange-900/60 to-orange-500" />
          Current level
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 rounded-full bg-[#F3F4F6]" />
          Target level
        </span>
        <span className="ml-2">Gap between fill and line = priority to close · Number = opportunity score (0–100)</span>
      </div>
    </div>
  );
}
