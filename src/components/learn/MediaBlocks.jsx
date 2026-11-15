import React from 'react';
import { ArrowUpRight, FileDown, Link2 } from 'lucide-react';
import { embedSrc, videoEmbedUrl } from '@/lib/learn';

const FRAME = 'aspect-video w-full overflow-hidden border border-border bg-background';

/** A linked or uploaded video. Renders nothing when there is no video. */
export function VideoBlock({ video, poster }) {
  const file = video?.src || (video?.url && !videoEmbedUrl(video.url) ? video.url : '');
  const embed = !video?.src && videoEmbedUrl(video?.url);
  if (!file && !embed) return null;
  return (
    <div className={FRAME} onContextMenu={(e) => e.preventDefault()}>
      {embed
        ? <iframe src={embed} title="Video" className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen />
        : <video src={file} poster={poster || undefined} controls controlsList="nodownload noplaybackrate" disablePictureInPicture playsInline className="h-full w-full" />}
    </div>
  );
}

/** Embedded content. Only the https address from the pasted code is used, inside an isolated frame. */
export function EmbedBlock({ code }) {
  const src = embedSrc(code);
  if (!src) return null;
  return (
    <div className={FRAME}>
      <iframe src={src} title="Embedded content" className="h-full w-full" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation" allowFullScreen />
    </div>
  );
}

/** Files and links attached to a course, module or lesson. Renders nothing when empty. */
export function ResourceList({ title = 'Resources', items }) {
  if (!items?.length) return null;
  return (
    <section>
      <h3 className="mb-3 font-heading text-2xl text-foreground">{title}</h3>
      <ul className="divide-y divide-border border border-border bg-card">
        {items.map((r, i) => {
          const Icon = r.kind === 'file' ? FileDown : Link2;
          return (
            <li key={i}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent/40">
                <Icon className="h-4 w-4 flex-shrink-0 text-primary" strokeWidth={1.5} />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{r.title}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}