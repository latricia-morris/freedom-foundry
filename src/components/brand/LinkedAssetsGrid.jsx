import React, { useEffect, useState } from 'react';
import { ExternalLink, Link2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { canvaEmbedUrl, linkSourceLabel } from '@/lib/assetLinks';

function SourceTile({ link }) {
  const embed = canvaEmbedUrl(link.url);
  if (embed) {
    return (
      <iframe
        src={embed}
        title={link.title}
        loading="lazy"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    );
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
      <ExternalLink className="icon-warm h-6 w-6" strokeWidth={1.5} />
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{linkSourceLabel(link.url)}</span>
    </div>
  );
}

function LinkTile({ link }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${link.title}`}
        className="relative block aspect-video bg-muted"
      >
        <SourceTile link={link} />
      </a>
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{link.title}</p>
          <p className="text-xs text-muted-foreground">{linkSourceLabel(link.url)}</p>
        </div>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`Open ${link.title} in a new tab`}
        >
          <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
        </a>
      </div>
    </div>
  );
}

/**
 * Client-facing "Linked Assets" section: Canva designs and other external
 * links saved by the agency, shown apart from Drive-browsed files.
 */
export default function LinkedAssetsGrid({ user }) {
  const [links, setLinks] = useState(null);

  useEffect(() => {
    if (!user?.id && !user?.email) return;
    let active = true;
    // A link matches by the client's account id or their contact email,
    // so links saved before the client's account exists still surface.
    base44.entities.ClientAssetLink.filter(
      { $or: [{ user_id: user.id }, { user_email: (user.email || '').toLowerCase() }] },
      '-created_date',
      50
    )
      .then((rows) => active && setLinks(rows || []))
      .catch(() => active && setLinks([]));
    return () => { active = false; };
  }, [user?.id, user?.email]);

  if (!user?.id && !user?.email) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <Link2 className="icon-warm h-4 w-4" strokeWidth={1.5} />
        <h2 className="font-heading text-xl text-foreground">Linked Assets</h2>
      </div>
      {links === null ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground/70">Loading linked assets&hellip;</p>
        </div>
      ) : links.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground/70">No linked assets yet. Canva designs and other links your brand team saves will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => <LinkTile key={link.id} link={link} />)}
        </div>
      )}
    </section>
  );
}