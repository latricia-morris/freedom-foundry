import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AtSign, Facebook, Globe, Instagram, Linkedin, Mail, Music2, Pin, Radio, Rss, Twitter, Youtube } from 'lucide-react';

/** Canonical platform registry — first match wins, so specific keys come first. */
const PLATFORM_DEFS = [
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, priority: 1, match: 'linkedin' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, priority: 2, match: 'youtube' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, priority: 3, match: 'instagram' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, priority: 4, match: 'facebook' },
  { key: 'x', label: 'X', icon: Twitter, priority: 5, match: ['twitter', 'x.com'] },
  { key: 'tiktok', label: 'TikTok', icon: Music2, priority: 6, match: 'tiktok' },
  { key: 'threads', label: 'Threads', icon: AtSign, priority: 7, match: 'threads' },
  { key: 'pinterest', label: 'Pinterest', icon: Pin, priority: 8, match: 'pinterest' },
  { key: 'podcast', label: 'Podcast', icon: Radio, priority: 9, match: ['podcast', 'buzzsprout', 'libsyn', 'podbean', 'podomatic'] },
  { key: 'spotify', label: 'Spotify', icon: Music2, priority: 10, match: 'spotify' },
  { key: 'newsletter', label: 'Newsletter', icon: Mail, priority: 11, match: ['newsletter', 'substack', 'beehiiv'] },
  { key: 'blog', label: 'Blog', icon: Rss, priority: 12, match: ['blog', 'medium.com'] },
  { key: 'website', label: 'Website', icon: Globe, priority: 20, match: 'website' },
];

function platformDef(name) {
  const text = String(name || '').toLowerCase();
  for (const def of PLATFORM_DEFS) {
    const terms = Array.isArray(def.match) ? def.match : [def.match];
    if (terms.some((t) => text.includes(t))) return def;
  }
  return { key: 'other', label: name || 'Channel', icon: Globe, priority: 50 };
}

/** Parses stored follower text ("124,800 followers", "82.4K", "2.3M") into a number. Never invents values. */
function followerCount(str) {
  const m = String(str || '').match(/(\d[\d,]*(?:\.\d+)?)\s*([kKmMbB])?/);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ''));
  if (!Number.isFinite(n)) return null;
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[(m[2] || '').toLowerCase()] || 1;
  return n * mult;
}

function compactNumber(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  return String(Math.round(n));
}

function handleText(channel) {
  if (channel.handle) {
    const h = String(channel.handle).trim();
    return h.startsWith('@') ? h : `@${h}`;
  }
  try {
    return new URL(channel.url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

const SURFACE_GRADIENT =
  'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0) 45%), linear-gradient(135deg, #14161A, #101216)';
const TRACK_GRADIENT = 'linear-gradient(90deg, #191B1F, #14161A)';
const TRACK_MUTED = 'linear-gradient(90deg, rgba(69,78,104,0.28), rgba(69,78,104,0.10))';
const BAR_GRADIENT = 'linear-gradient(90deg, #E26E3C, #D9754A, #DC5338)';

/**
 * Comparative channel reach: every connected social channel in one stacked
 * horizontal bar graph — icon + clickable handle on the left, one shared
 * scale in the middle, compact follower count on the right. Channels without
 * a stored follower count sit in a concise unavailable state below the chart.
 * Bars grow from zero, staggered by row, the first time the section is
 * reached; reduced-motion users get the final chart immediately.
 */
export default function ChannelSnapshot({ channels }) {
  const rows = useMemo(
    () =>
      (channels || []).map((c, i) => {
        const def = platformDef(c.platform);
        return { ...c, def, handle: handleText(c) || def.label, count: followerCount(c.followers), key: c.url || `${c.platform}-${i}` };
      }),
    [channels],
  );

  const ranked = useMemo(() => rows.filter((r) => r.count !== null).sort((a, b) => b.count - a.count), [rows]);
  const unavailable = useMemo(
    () => rows.filter((r) => r.count === null).sort((a, b) => a.def.priority - b.def.priority),
    [rows],
  );
  const max = ranked.length ? ranked[0].count : 0;

  const [revealed, setRevealed] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!rows.length) {
    return (
      <div className="rounded-sm border border-border/50 bg-input/30 px-5 py-8 text-center">
        <p className="text-sm text-muted-foreground">No social channels are connected to this snapshot yet.</p>
        <Link to="/services" className="link-warm mt-3 inline-block">Connect a channel</Link>
      </div>
    );
  }

  return (
    <div ref={ref} className="overflow-hidden rounded-sm border border-border/60" style={{ background: SURFACE_GRADIENT }}>
      <div className="divide-y divide-border/30">
        {ranked.map((r, i) => {
          const pct = max > 0 ? (r.count / max) * 100 : 0;
          const Label = r.url ? 'a' : 'div';
          return (
            <div key={r.key} className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.02] sm:gap-4 sm:px-5">
              <Label
                {...(r.url ? { href: r.url, target: '_blank', rel: 'noopener noreferrer', title: r.handle } : {})}
                className="flex w-[7rem] shrink-0 items-center gap-2 sm:w-44"
              >
                <r.def.icon className="icon-warm h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span className="truncate text-xs text-muted-foreground transition-colors group-hover:text-foreground sm:text-[13px]">
                  {r.handle}
                </span>
              </Label>
              <div className="h-1.5 min-w-0 flex-1 rounded-full" style={{ background: TRACK_GRADIENT }}>
                <div
                  className="h-full rounded-full transition-[width] duration-[900ms] group-hover:shadow-[0_0_14px_rgba(226,110,60,0.35)]"
                  style={{
                    width: revealed ? `${pct}%` : '0%',
                    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                    transitionDelay: revealed ? `${i * 80}ms` : '0ms',
                    background: BAR_GRADIENT,
                  }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-xs tabular-nums text-foreground">{compactNumber(r.count)}</span>
            </div>
          );
        })}
      </div>

      {unavailable.length > 0 && (
        <div className="border-t border-border/60 px-4 py-3 sm:px-5">
          <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/50">Follower data unavailable</p>
          <div className="space-y-2">
            {unavailable.map((r) => {
              const Label = r.url ? 'a' : 'div';
              return (
                <div key={r.key} className="flex items-center gap-3 sm:gap-4">
                  <Label
                    {...(r.url ? { href: r.url, target: '_blank', rel: 'noopener noreferrer', title: r.handle } : {})}
                    className="flex w-[7rem] shrink-0 items-center gap-2 sm:w-44"
                  >
                    <r.def.icon className="h-4 w-4 shrink-0 text-muted-foreground/40" strokeWidth={1.75} />
                    <span className="truncate text-xs text-muted-foreground/60 sm:text-[13px]">{r.handle}</span>
                  </Label>
                  <div className="h-1.5 min-w-0 flex-1 rounded-full" style={{ background: TRACK_MUTED }} />
                  <span className="w-16 shrink-0 text-right text-[10px] uppercase tracking-wider text-muted-foreground/50">Unavailable</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}