import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { resolveLinkMeta } from '@/lib/assetLinks';
import { Image } from '@/components/ui/image';

function LinkTile({ link }) {
  const [meta, setMeta] = useState(null);
  const preview = link.preview_url || meta?.image || '';
  const title = link.title || meta?.title || '';

  // Links saved before previews were supported resolve their metadata the
  // first time they are shown, then persist it so later visits are instant.
  useEffect(() => {
    if (preview || !/canva\./i.test(link.url)) return undefined;
    let active = true;
    resolveLinkMeta(link.url)
      .then((data) => {
        if (!active || (!data.title && !data.image)) return;
        setMeta(data);
        const update = {};
        if (!link.title && data.title) update.title = data.title;
        if (!link.preview_url && data.image) update.preview_url = data.image;
        if (Object.keys(update).length) {
          base44.entities.ClientAssetLink.update(link.id, update).catch(() => {});
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [link.id, link.title, link.preview_url, link.url, preview]);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40"
    >
      {preview ? (
        <div className="aspect-video w-full overflow-hidden">
          <Image src={preview} alt={title || 'Asset preview'} className="h-full w-full" fittingType="fill" />
        </div>
      ) : null}
      <div className="px-4 py-3">
        <p className="truncate text-sm font-medium text-foreground">{title || 'Open asset'}</p>
      </div>
    </a>
  );
}

/**
 * Client-facing "Linked Assets" section: Canva designs and other external
 * links saved by the agency, shown apart from Drive-browsed files. Each tile
 * shows the design's own preview image and original title.
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
      <h2 className="mb-4 font-heading text-xl text-foreground">Linked Assets</h2>
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