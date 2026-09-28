import React from 'react';
import { opportunityScore } from '@/lib/matrix';

// Freedom Foundry palette
const COPPER = '#E26E3C';
const BRASS = '#DC5338';
const EMBER = '#D9754A';
const CLOUDBONE = '#F3F4F6';
const SLATE = '#454E68';

const TRACK_HEIGHT_PX = 170;
const TRACK_WIDTH_PX = 28;
const CAP_HEIGHT_PX = 6;
const CORNER_RADIUS = 4;

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
      const score = opportunityScore(ch, audit);
      const gap = target - level;
      const gapPct = Math.round(gap * 100);
      return { channel: ch, level, target, score, gap, gapPct };
    })
    .sort((a, b) => b.gap - a.gap);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end justify-center gap-6 rounded-lg border border-border bg-card/40 p-8">
        {bands.map((band) => {
          const gradientId = `eq-grad-${(band.channel.id || band.channel.channel_name).replace(/[^a-zA-Z0-9]/g, '')}`;
          const capBottom = TRACK_HEIGHT_PX * band.level - CAP_HEIGHT_PX / 2;
          const tickBottom = TRACK_HEIGHT_PX * band.target;

          return (
            <div key={band.channel.id || band.channel.channel_name} className="flex flex-col items-center" style={{ width: 96 }}>
              <div
                className="relative overflow-visible"
                style={{ height: TRACK_HEIGHT_PX, width: TRACK_WIDTH_PX + 16 }}
                title={`${band.channel.channel_name} — now ${Math.round(band.level * 100)}%, target ${Math.round(band.target * 100)}%`}
              >
                {/* track */}
                <div
                  className="absolute bottom-0 bg-black/40"
                  style={{ width: TRACK_WIDTH_PX, height: TRACK_HEIGHT_PX, left: 8, borderRadius: CORNER_RADIUS }}
                />

                {/* gradient fill */}
                <svg width={TRACK_WIDTH_PX} height={TRACK_HEIGHT_PX} className="absolute bottom-0" style={{ left: 8 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor={SLATE} stopOpacity="0.7" />
                      <stop offset="45%" stopColor={BRASS} />
                      <stop offset="100%" stopColor={COPPER} />
                    </linearGradient>
                  </defs>
                  <rect
                    x="0"
                    y={TRACK_HEIGHT_PX * (1 - band.level)}
                    width={TRACK_WIDTH_PX}
                    height={TRACK_HEIGHT_PX * band.level}
                    rx={CORNER_RADIUS}
                    fill={`url(#${gradientId})`}
                  />
                </svg>

                {/* target tick — small squared-off notch off the right edge of the track */}
                <div
                  className="absolute"
                  style={{
                    height: 2,
                    width: 14,
                    left: TRACK_WIDTH_PX + 10,
                    bottom: tickBottom - 1,
                    backgroundColor: EMBER,
                  }}
                />

                {/* fader cap — squared bar, current level */}
                <div
                  className="absolute"
                  style={{
                    height: CAP_HEIGHT_PX,
                    width: TRACK_WIDTH_PX + 10,
                    left: 3,
                    bottom: Math.max(0, capBottom),
                    backgroundColor: CLOUDBONE,
                    borderRadius: 2,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                  }}
                />
              </div>

              <span className="mt-3 text-center text-[11px] leading-tight text-foreground font-medium">
                {band.channel.channel_name}
              </span>
              <span className="mt-1 text-[10px] text-muted-foreground">
                Now {Math.round(band.level * 100)}% → Target {Math.round(band.target * 100)}%
              </span>
              <span
                className="mt-1 px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  borderRadius: 3,
                  backgroundColor: band.gapPct > 15 ? `${COPPER}26` : 'rgba(255,255,255,0.06)',
                  color: band.gapPct > 15 ? COPPER : 'var(--muted-foreground)',
                }}
              >
                {band.gapPct > 15 ? `Leverage +${band.gapPct}%` : band.gapPct < -15 ? 'Pull back' : 'On target'}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-2" style={{ background: `linear-gradient(to top, ${SLATE}, ${COPPER})`, borderRadius: 2 }} />
          Current level
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3.5" style={{ backgroundColor: EMBER }} />
          Target level
        </span>
        <span>Badge = how much to lean in or pull back, in plain terms</span>
      </div>
    </div>
  );
}
