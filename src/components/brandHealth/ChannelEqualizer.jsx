import React from 'react';
import {
  Facebook,
  Globe2,
  Instagram,
  Linkedin,
  MapPin,
  Mic2,
  Newspaper,
  Presentation,
  Radio,
  Search,
  UsersRound,
  Youtube,
} from 'lucide-react';

const COPPER = '#E26E3C';
const BRASS = '#DC5338';
const EMBER = '#D9754A';
const SLATE = '#454E68';
const CLOUDBONE = '#F3F4F6';
const TRACK_HEIGHT = 160;
const TRACK_WIDTH = 26;

function normalizeName(name = '') {
  return name.toLowerCase();
}

function iconFor(channelName) {
  const name = normalizeName(channelName);
  if (name.includes('linkedin')) return Linkedin;
  if (name.includes('instagram')) return Instagram;
  if (name.includes('facebook')) return Facebook;
  if (name.includes('youtube')) return Youtube;
  if (name.includes('podcast')) return Radio;
  if (name.includes('speaking') || name.includes('event')) return Presentation;
  if (name.includes('media') || name.includes('pr')) return Newspaper;
  if (name.includes('referral') || name.includes('word of mouth')) return UsersRound;
  if (name.includes('google business') || name.includes('local')) return MapPin;
  if (name.includes('website') || name.includes('search')) return Search;
  return Globe2;
}

function directiveFor(channelName, rank, total) {
  const name = normalizeName(channelName);
  const pct = total <= 1 ? 0 : rank / (total - 1);

  if (name.includes('speaking') || name.includes('referral') || name.includes('website') || name.includes('search')) {
    return {
      label: 'Build now',
      color: COPPER,
      reason: 'High-trust route with clear potential to create qualified strategic conversations.',
      next: name.includes('speaking')
        ? 'Capture attendee, booking, and inquiry source. Give every appearance one defined follow-up path.'
        : name.includes('referral')
          ? 'Install a closeout, review, introduction, and re-engagement process for completed work.'
          : 'Clarify service routing, place proof near high-intent actions, and measure qualified source-to-inquiry paths.',
    };
  }

  if (name.includes('linkedin')) {
    return {
      label: 'Scale deliberately',
      color: COPPER,
      reason: 'Your clearest recurring founder-authority channel for trust-led evaluation.',
      next: 'Connect strategic posts to proof, a relevant resource, and one clear next step.',
    };
  }

  if (name.includes('podcast') || name.includes('youtube') || name.includes('media') || name.includes('pr')) {
    return {
      label: 'Optimize connection',
      color: EMBER,
      reason: 'A valuable authority asset that needs a stronger bridge into the buyer journey.',
      next: name.includes('podcast')
        ? 'Give every episode one destination, one lead-capture route, and one follow-up asset.'
        : name.includes('youtube')
          ? 'Link each video to a relevant proof point, resource, or strategic inquiry path.'
          : 'Consolidate validation into a visible authority and proof library near high-consideration decisions.',
    };
  }

  if (name.includes('instagram') || name.includes('google business') || name.includes('local')) {
    return {
      label: 'Maintain presence',
      color: SLATE,
      reason: 'Useful for credibility and familiarity, but not the primary premium-growth engine.',
      next: name.includes('google business') || name.includes('local')
        ? 'Confirm and standardize core information as a credibility foundation.'
        : 'Repurpose stronger authority content rather than creating platform-first volume.',
    };
  }

  if (name.includes('facebook')) {
    return {
      label: 'Reduce effort',
      color: SLATE,
      reason: 'A supporting distribution channel, not a primary source of strategic demand.',
      next: 'Keep the presence credible and current without assigning primary growth time to it.',
    };
  }

  if (pct <= 0.33) {
    return {
      label: 'Build now',
      color: COPPER,
      reason: 'Ranks among the strongest current opportunities in this channel set.',
      next: 'Define a clear conversion path, measurement point, and follow-up rhythm.',
    };
  }
  if (pct <= 0.66) {
    return {
      label: 'Optimize connection',
      color: EMBER,
      reason: 'Has strategic value but needs a stronger connection to conversion and proof.',
      next: 'Give this channel one defined role, destination, and measure of success.',
    };
  }
  return {
    label: 'Maintain presence',
    color: SLATE,
    reason: 'Keep it credible without diverting attention from the primary growth system.',
    next: 'Maintain a clear, current baseline and repurpose stronger core content.',
  };
}

function IconTile({ Icon, color }) {
  return (
    <span
      className="mb-3 inline-flex h-9 w-9 items-center justify-center border"
      style={{
        borderRadius: 4,
        borderColor: `${color}66`,
        background: `linear-gradient(145deg, ${color}33 0%, rgba(18,18,21,0.88) 72%)`,
        boxShadow: `inset 0 1px 0 ${color}22`,
      }}
    >
      <Icon size={17} strokeWidth={1.6} style={{ color }} />
    </span>
  );
}

function InvestmentColumn({ title, description, items, color }) {
  return (
    <div className="border-l pl-4" style={{ borderColor: `${color}88` }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color }}>{title}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-3 space-y-1.5">
        {items.map((item) => (
          <p key={item.channel.channel_name} className="text-xs text-foreground">
            {item.channel.channel_name}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function ChannelEqualizer({ matrixChannels = [] }) {
  const channels = matrixChannels
    .map((channel) => {
      const current = Math.max(0, Math.min(1, Number(channel.x) || 0));
      const target = Math.max(0, Math.min(1, Number(channel.y) || 0));
      const opportunity = Math.max(0, Math.min(100, Number(channel.opportunity) || 0));
      return { channel, current, target, opportunity };
    })
    .sort((a, b) => b.opportunity - a.opportunity)
    .map((item, index, list) => ({
      ...item,
      directive: directiveFor(item.channel.channel_name, index, list.length),
    }));

  const buildNow = channels.filter((item) => ['Build now', 'Scale deliberately'].includes(item.directive.label));
  const optimize = channels.filter((item) => item.directive.label === 'Optimize connection');
  const maintain = channels.filter((item) => ['Maintain presence', 'Reduce effort'].includes(item.directive.label));

  return (
    <div className="w-full">
      <div className="border border-border bg-card/40 p-6 sm:p-8" style={{ borderRadius: 6 }}>
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Channel investment map</p>
            <h4 className="mt-1 font-heading text-xl text-foreground">Where to put attention now</h4>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
            Fill shows current maturity. The copper mark shows the recommended level of emphasis. The decision below each channel tells you what to do next.
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-center gap-x-6 gap-y-8">
          {channels.map((item) => {
            const { channel, current, target, directive } = item;
            const Icon = iconFor(channel.channel_name);
            const gradientId = `channel-fill-${(channel.channel_name || 'channel').replace(/[^a-zA-Z0-9]/g, '')}`;
            const capBottom = TRACK_HEIGHT * current - 3;
            const targetBottom = TRACK_HEIGHT * target;

            return (
              <div key={channel.channel_name} className="flex flex-col items-center" style={{ width: 112 }}>
                <IconTile Icon={Icon} color={directive.color} />

                <div
                  className="relative overflow-visible"
                  style={{ height: TRACK_HEIGHT, width: TRACK_WIDTH + 18 }}
                  title={`${channel.channel_name}: ${directive.label}`}
                >
                  <div
                    className="absolute bottom-0 bg-black/45"
                    style={{ left: 9, width: TRACK_WIDTH, height: TRACK_HEIGHT, borderRadius: 4 }}
                  />

                  <svg width={TRACK_WIDTH} height={TRACK_HEIGHT} className="absolute bottom-0" style={{ left: 9 }}>
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor={SLATE} stopOpacity="0.75" />
                        <stop offset="46%" stopColor={BRASS} />
                        <stop offset="100%" stopColor={directive.color} />
                      </linearGradient>
                    </defs>
                    <rect
                      x="0"
                      y={TRACK_HEIGHT * (1 - current)}
                      width={TRACK_WIDTH}
                      height={TRACK_HEIGHT * current}
                      rx="4"
                      fill={`url(#${gradientId})`}
                    />
                  </svg>

                  <div
                    className="absolute"
                    style={{
                      left: TRACK_WIDTH + 11,
                      bottom: targetBottom - 1,
                      height: 2,
                      width: 15,
                      backgroundColor: COPPER,
                    }}
                  />

                  <div
                    className="absolute"
                    style={{
                      left: 4,
                      bottom: Math.max(0, capBottom),
                      height: 6,
                      width: TRACK_WIDTH + 10,
                      borderRadius: 2,
                      backgroundColor: CLOUDBONE,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.45)',
                    }}
                  />
                </div>

                <p className="mt-3 min-h-[30px] text-center text-[11px] font-medium leading-tight text-foreground">
                  {channel.channel_name}
                </p>
                <p className="mt-1 text-center text-[10px] text-muted-foreground">
                  Today {Math.round(current * 100)}% · Recommended {Math.round(target * 100)}%
                </p>
                <span
                  className="mt-2 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em]"
                  style={{
                    borderRadius: 3,
                    color: directive.color,
                    backgroundColor: `${directive.color}20`,
                    border: `1px solid ${directive.color}45`,
                  }}
                >
                  {directive.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border pt-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-2" style={{ borderRadius: 2, background: `linear-gradient(to top, ${SLATE}, ${COPPER})` }} />Current maturity</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4" style={{ backgroundColor: COPPER }} />Recommended emphasis</span>
          <span>Investment decision is based on each channel's role, maturity, and relative opportunity.</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <InvestmentColumn
          title="Primary growth system"
          color={COPPER}
          description="Invest attention here first. These channels have the strongest combination of trust, strategic fit, and potential to create qualified conversations."
          items={buildNow}
        />
        <InvestmentColumn
          title="Supporting authority system"
          color={EMBER}
          description="Keep these active, then connect each asset to proof, a relevant resource, and a clear next step."
          items={optimize}
        />
        <InvestmentColumn
          title="Credibility maintenance"
          color={SLATE}
          description="Keep these channels aligned and current, but do not let them displace work on the primary growth system."
          items={maintain}
        />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Channel decisions</p>
            <h4 className="mt-1 font-heading text-xl text-foreground">What to do next</h4>
          </div>
          <p className="max-w-sm text-right text-xs leading-relaxed text-muted-foreground">
            Focus on the action that makes the channel more useful in the wider path from authority to strategic engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-2" style={{ borderRadius: 6 }}>
          {channels.map(({ channel, directive }) => {
            const Icon = iconFor(channel.channel_name);
            return (
              <div key={channel.channel_name} className="bg-card/80 p-4">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center border"
                    style={{
                      borderRadius: 4,
                      borderColor: `${directive.color}55`,
                      background: `linear-gradient(145deg, ${directive.color}26, rgba(18,18,21,0.9))`,
                    }}
                  >
                    <Icon size={15} strokeWidth={1.7} style={{ color: directive.color }} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{channel.channel_name}</p>
                      <span className="text-[9px] font-semibold uppercase tracking-[0.1em]" style={{ color: directive.color }}>
                        {directive.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{directive.reason}</p>
                    <p className="mt-2 border-l pl-2 text-xs leading-relaxed text-foreground" style={{ borderColor: directive.color }}>
                      {directive.next}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}