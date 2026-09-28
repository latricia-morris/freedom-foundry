import React from 'react';

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

function opportunityColor(score) {
  if (score >= 65) return COPPER;
  if (score >= 35) return EMBER;
  return SLATE;
}

function opportunityLabel(score) {
  if (score >= 65) return `Leverage · ${score}`;
  if (score >= 35) return `Moderate · ${score}`;
  return `Lower priority · ${score}`;
}

export default function ChannelEqualizer({ matrixChannels }) {
  // x = current maturity (0-1), y = target level from fit+impact (0-1),
  // opportunity = 0-100 score precomputed server-side. All come straight
  // from get-brand-health; no client-side recomputation.
  const bands = (matrixChannels || [])
    .map((ch) => {
      const level = Math.max(0, Math.min(1, Number(ch.x) || 0));
      const target = Math.max(0, Math.min(1, Number(ch.y) || 0));
      const opportunity = Math.max(0, Math.min(100, Number(ch.opportunity) || 0));
      return { channel: ch, level, target, opportunity, gap: target - level };
    })
    .sort((a, b) => b.opportunity - a.opportunity);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end justify-center gap-6 rounded-lg border border-border bg-card/40 p-8">
        {bands.map((band) => {
          const gradientId = `eq-grad-${(band.channel.channel_name || 'ch').replace(/[^a-zA-Z0-9]/g, '')}`;
          const capBottom = TRACK_HEIGHT_PX * band.level - CAP_HEIGHT_PX / 2;
          const tickBottom = TRACK_HEIGHT_PX * band.target;
          const color = opportunityColor(band.opportunity);

          return (
            <div key={band.channel.channel_name} className="flex flex-col items-center" style={{ width: 96 }}>
              <div
                className="relative overflow-visible"
                style={{ height: TRACK_HEIGHT_PX, width: TRACK_WIDTH_PX + 16 }}
                title={`${band.channel.channel_name} — now ${Math.round(band.level * 100)}%, target ${Math.round(band.target * 100)}%, opportunity ${band.opportunity}`}
              >
                <div
                  className="absolute bottom-0 bg-black/40"
                  style={{ width: TRACK_WIDTH_PX, height: TRACK_HEIGHT_PX, left: 8, borderRadius: CORNER_RADIUS }}
                />

                <svg width={TRACK_WIDTH_PX} height={TRACK_HEIGHT_PX} className="absolute bottom-0" style={{ left: 8 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor={SLATE} stopOpacity="0.7" />
                      <stop offset="45%" stopColor={BRASS} />
                      <stop offset="100%" stopColor={color} />
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
                style={{ borderRadius: 3, backgroundColor: `${color}22`, color }}
              >
                {opportunityLabel(band.opportunity)}
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
        <span>Badge = consultant-weighted opportunity score (0–100), sorted highest first</span>
      </div>
    </div>
  );
}
