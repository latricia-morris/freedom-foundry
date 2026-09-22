import React, { useMemo } from 'react';
import { AtSign, ExternalLink, Facebook, Globe, Instagram, Linkedin, Mail, Music2, Pin, Radio, Rss, Twitter, Youtube } from 'lucide-react';
import SocialReachChart from './SocialReachChart';

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
  { key: 'podcast', label: 'Podcast', icon: Radio, priority: 9, match: ['podcast', 'buzzsprout', 'libsyn', 'podbean', 'podomatic'], defaultScope: 'media' },
  { key: 'spotify', label: 'Spotify', icon: Music2, priority: 10, match: 'spotify', defaultScope: 'media' },
  { key: 'newsletter', label: 'Newsletter', icon: Mail, priority: 11, match: ['newsletter', 'substack', 'beehiiv'], defaultScope: 'media' },
  { key: 'blog', label: 'Blog', icon: Rss, priority: 12, match: ['blog', 'medium.com'], defaultScope: 'media' },
  { key: 'website', label: 'Website', icon: Globe, priority: 20, match: 'website' },
];

const GROUPS = [
  { key: 'personal', label: 'Personal presence' },
  { key: 'brand', label: 'Brand presence' },
  { key: 'media', label: 'Media & podcast' },
];

function platformDef(name) {
  const text = String(name || '').toLowerCase();
  for (const def of PLATFORM_DEFS) {
    const terms = Array.isArray(def.match) ? def.match : [def.match];
    if (terms.some((t) => text.includes(t))) return def;
  }
  return { key: 'other', label: name || 'Channel', icon: Globe, priority: 50 };
}

/**
 * Scope inference. Personal and company signals win (URL patterns and
 * explicit words are high-confidence), media is the fallback for
 * media-native platforms and podcast-related channels — so a founder's
 * primary LinkedIn never gets buried under the company page, while the
 * podcast ecosystem is pulled into its own cluster.
 */
function inferScope(channel, def) {
  const platformText = String(channel.platform || '').toLowerCase();
  const fullText = `${channel.platform} ${channel.handle} ${channel.notes} ${channel.url}`.toLowerCase();
  if (fullText.includes('/in/') || /personal|founder|author page|speaker/.test(platformText)) return 'personal';
  if (fullText.includes('/company/') || /company|business page|brand page|corporate/.test(platformText)) return 'brand';
  if (/podcast|newsletter|show\b|episode/.test(fullText) || def.defaultScope === 'media') return 'media';
  if (def.key === 'linkedin') return 'personal';
  return 'brand';
}

function followerCount(channel) {
  const match = String(channel.followers || '').match(/([\d,]+)\s*followers?/i);
  return match ? Number(match[1].replace(/,/g, '')) : null;
}

function compactNumber(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

function pageName(channel) {
  if (channel.handle) return channel.handle;
  try {
    return new URL(channel.url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Channel snapshot: the brand's public footprint as compact, scannable
 * rows — platform icon, platform name, handle/page, and link target.
 * Channels cluster by personal / brand / media presence so one-brand,
 * multi-entity, and founder-plus-company-page clients all read cleanly.
 * Notes and secondary metadata sit in a quiet second line, never as
 * headline copy.
 */
export default function ChannelSnapshot({ channels }) {
  const rows = useMemo(() => {
    const parsed = (channels || []).map((c, i) => {
      const def = platformDef(c.platform);
      return {
        ...c,
        key: c.url || `${c.platform}-${c.handle}-${i}`,
        def,
        scope: inferScope(c, def),
        page: pageName(c),
        count: followerCount(c),
      };
    });

    // Tag rows only where the same platform carries multiple presence
    // types (e.g. a personal and a company LinkedIn) — everywhere else
    // the tag would be noise.
    const scopesByPlatform = {};
    for (const r of parsed) {
      scopesByPlatform[r.def.key] = scopesByPlatform[r.def.key] || new Set();
      scopesByPlatform[r.def.key].add(r.scope);
    }

    return parsed.map((r) => ({
      ...r,
      tag:
        (scopesByPlatform[r.def.key] || new Set()).size > 1
          ? GROUPS.find((g) => g.key === r.scope)?.label.replace(' presence', '') ||
            (r.scope === 'media' ? 'Podcast' : r.scope === 'personal' ? 'Personal' : 'Company')
          : null,
    }));
  }, [channels]);

  if (!rows.length) return null;

  // The reach chart shares the same canonical labels as the rows — with the
  // handle appended only when one platform carries multiple accounts.
  const nameCollisions = {};
  for (const r of rows) nameCollisions[r.def.key] = (nameCollisions[r.def.key] || 0) + 1;
  const chartChannels = rows.map((r) => ({
    ...r,
    platform: nameCollisions[r.def.key] > 1 && r.page ? `${r.def.label} · ${r.page}` : r.def.label,
  }));

  const groupedList = GROUPS.map((g) => ({
    ...g,
    items: rows
      .filter((r) => r.scope === g.key)
      .sort((a, b) =>
        a.def.priority - b.def.priority ||
        (b.count || 0) - (a.count || 0) ||
        String(a.handle || '').localeCompare(String(b.handle || '')),
      ),
  })).filter((g) => g.items.length);

  const showHeaders = groupedList.length > 1;

  return (
    <div className="min-w-0">
      <SocialReachChart channels={chartChannels} />
      <div className="space-y-5">
        {groupedList.map((group) => (
          <div key={group.key}>
            {showHeaders && (
              <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">{group.label}</p>
            )}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {group.items.map((r) => {
                const Row = r.url ? 'a' : 'div';
                return (
                  <Row
                    key={r.key}
                    {...(r.url ? { href: r.url, target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group flex items-center gap-3 rounded-sm border border-border/70 bg-background/40 px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-border bg-input">
                      <r.def.icon className="icon-warm h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className="truncate text-sm font-medium text-foreground">{r.def.label}</span>
                        {r.tag && (
                          <span className="shrink-0 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70">{r.tag}</span>
                        )}
                      </span>
                      {r.page && (
                        <span className="mt-0.5 flex min-w-0 items-baseline justify-between gap-2">
                          <span className="truncate text-xs text-muted-foreground">{r.page}</span>
                          {r.count !== null && (
                            <span className="shrink-0 text-[11px] text-muted-foreground/70">{compactNumber(r.count)} followers</span>
                          )}
                        </span>
                      )}
                      {r.notes && (
                        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground/50" title={r.notes}>
                          {r.notes}
                        </span>
                      )}
                    </span>
                    {r.url && (
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary" />
                    )}
                  </Row>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}