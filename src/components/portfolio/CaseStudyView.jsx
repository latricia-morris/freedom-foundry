import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Image } from '@/components/ui/image';
import PortfolioCard from '@/components/portfolio/PortfolioCard';
import CaseStudySection from '@/components/portfolio/CaseStudySection';
import { ASSET_TYPE_LABELS, groupAssetsByFamily } from '@/lib/portfolioData';

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

function PairFigure({ pair, index }) {
  return (
    <figure>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Before</p>
          <Image
            src={pair.before.file_url}
            alt={pair.before.alt_text || pair.before.title}
            fittingType="fill"
            className="aspect-[4/3] w-full rounded-md border border-border"
          />
        </div>
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-primary/90">After</p>
          <Image
            src={pair.after.file_url}
            alt={pair.after.alt_text || pair.after.title}
            fittingType="fill"
            className="aspect-[4/3] w-full rounded-md border border-border"
          />
        </div>
      </div>
      {(pair.caption || pair.before.title || pair.after.title) && (
        <figcaption className="mt-3 text-xs text-muted-foreground">
          {pair.caption || `${pair.before.title} → ${pair.after.title}`}
        </figcaption>
      )}
      <span className="sr-only">Pair {index + 1}</span>
    </figure>
  );
}

/** The public case-study layout, shared by the live page and the admin preview. */
export default function CaseStudyView({ project, assets = [], beforeAfter = [], related = [], intro = null }) {
  const pairIds = new Set();
  (beforeAfter || []).forEach((pair) => {
    if (pair.before?.id) pairIds.add(pair.before.id);
    if (pair.after?.id) pairIds.add(pair.after.id);
  });

  const gallery = (assets || []).filter((a) => a.asset_type !== 'featured_image' && !pairIds.has(a.id));
  const images = gallery.filter((a) => IMAGE_EXT.test(a.file_url));
  const videos = gallery.filter((a) => VIDEO_EXT.test(a.file_url));
  const files = gallery.filter((a) => !IMAGE_EXT.test(a.file_url) && !VIDEO_EXT.test(a.file_url));
  const imageGroups = groupAssetsByFamily(images);
  const fileGroups = groupAssetsByFamily(files);
  const deliverableLines = (project.deliverables || '').split('\n').map((l) => l.trim()).filter(Boolean);
  const hasGallery = images.length + videos.length + files.length > 0;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 sm:px-8">
      {intro}

      <header className="mt-8">
        <p className="text-xs uppercase tracking-[0.28em] text-primary/90">Case Study</p>
        <h1 className="mt-4 font-heading text-5xl font-light leading-[1.02] text-foreground sm:text-6xl">
          {project.client_name}
        </h1>
        <p className="mt-3 text-sm uppercase tracking-[0.2em] text-muted-foreground">{project.industry}</p>
        {(project.location_served || project.year) && (
          <p className="mt-1.5 text-sm text-muted-foreground/80">
            {[project.location_served, project.year].filter(Boolean).join('  ·  ')}
          </p>
        )}
        {project.work_types?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.work_types.map((tag) => (
              <span key={tag} className="rounded-sm border border-border px-2.5 py-1 text-[11px] tracking-wide text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}
        {project.title && project.title !== project.client_name && (
          <h2 className="mt-10 font-heading text-3xl font-light italic text-foreground/90">{project.title}</h2>
        )}
        {project.short_summary && (
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{project.short_summary}</p>
        )}
        {project.website_url && (
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={project.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-primary/40 px-4 py-2.5 text-sm text-primary transition-colors hover:border-primary hover:bg-primary/10"
            >
              Visit Site <ExternalLink className="h-4 w-4" />
            </a>
            <p className="text-xs text-muted-foreground/70">
              External site. Current appearance and functionality may change after project delivery.
            </p>
          </div>
        )}
      </header>

      {project.featured_image_url && (
        <div className="mt-10 overflow-hidden rounded-md border border-border">
          <Image
            src={project.featured_image_url}
            alt={project.featured_image_alt || project.title}
            fittingType="fit"
            className="w-full"
          />
        </div>
      )}

      <div className="mt-12 space-y-12">
        {project.challenge && (
          <CaseStudySection label="The Situation" title="Where things stood">
            <p>{project.challenge}</p>
          </CaseStudySection>
        )}
        {project.objectives && (
          <CaseStudySection label="The Objective" title="What the work needed to accomplish">
            <p>{project.objectives}</p>
          </CaseStudySection>
        )}
        {project.scope_of_work && (
          <CaseStudySection label="Scope of Work">
            <p>{project.scope_of_work}</p>
          </CaseStudySection>
        )}
        {project.strategy && (
          <CaseStudySection label="Strategy & Creative Direction">
            <p>{project.strategy}</p>
          </CaseStudySection>
        )}
        {deliverableLines.length > 0 && (
          <CaseStudySection label="Selected Deliverables">
            <ul className="space-y-2">
              {deliverableLines.map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {line}
                </li>
              ))}
            </ul>
          </CaseStudySection>
        )}

        {(hasGallery || beforeAfter.length > 0) && (
          <CaseStudySection label="Visual Gallery">
            <div className="space-y-10">
              {beforeAfter.length > 0 && (
                <div className="space-y-8">
                  {beforeAfter.map((pair, index) => <PairFigure key={index} pair={pair} index={index} />)}
                </div>
              )}

              {imageGroups.map(({ key, label, items }) => (
                <div key={key} className="space-y-4">
                  {imageGroups.length > 1 && (
                    <p className="text-xs uppercase tracking-[0.2em] text-primary/80">{label}</p>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((asset) => (
                      <figure key={asset.id} className="overflow-hidden rounded-md border border-border bg-card/40">
                        <Image
                          src={asset.file_url}
                          alt={asset.alt_text || asset.title}
                          fittingType="fill"
                          className="aspect-square w-full"
                        />
                        {(asset.caption || asset.title) && (
                          <figcaption className="p-3 text-xs text-muted-foreground">{asset.caption || asset.title}</figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                </div>
              ))}

              {videos.length > 0 && (
                <div className="space-y-6">
                  {imageGroups.length > 0 && (
                    <p className="text-xs uppercase tracking-[0.2em] text-primary/80">Photo & Video</p>
                  )}
                  {videos.map((asset) => (
                    <div key={asset.id}>
                      <video controls preload="metadata" src={asset.file_url} className="w-full rounded-md border border-border" />
                      {(asset.caption || asset.title) && (
                        <p className="mt-2 text-xs text-muted-foreground">{asset.caption || asset.title}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {fileGroups.map(({ key, label, items }) => (
                <div key={key} className="space-y-3">
                  {fileGroups.length > 1 && (
                    <p className="text-xs uppercase tracking-[0.2em] text-primary/80">{label}</p>
                  )}
                  <ul className="space-y-2">
                    {items.map((asset) => (
                      <li key={asset.id} className="flex items-center justify-between gap-4 rounded-md border border-border px-4 py-3">
                        <span className="text-sm text-foreground">
                          {asset.title}
                          <span className="ml-2 text-xs text-muted-foreground/70">{ASSET_TYPE_LABELS[asset.asset_type] || ''}</span>
                        </span>
                        {asset.allow_download ? (
                          <a href={asset.file_url} target="_blank" rel="noopener noreferrer" className="link-warm shrink-0">Download</a>
                        ) : (
                          <span className="shrink-0 text-xs text-muted-foreground/60">{ASSET_TYPE_LABELS[asset.asset_type] || 'File'}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CaseStudySection>
        )}

        {project.results && (
          <CaseStudySection label="Outcome" title="Where the work landed">
            <p>{project.results}</p>
          </CaseStudySection>
        )}

        {project.testimonial && (
          <CaseStudySection label="In Their Words">
            <blockquote className="border-l-2 border-primary/60 pl-5">
              <p className="font-heading text-2xl font-light italic leading-relaxed text-foreground">"{project.testimonial}"</p>
              {project.testimonial_source && (
                <p className="mt-3 text-sm text-muted-foreground">— {project.testimonial_source}</p>
              )}
            </blockquote>
          </CaseStudySection>
        )}
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="font-heading text-3xl font-light text-foreground">Related <span className="italic text-muted-foreground">work</span></h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => <PortfolioCard key={item.id} project={item} />)}
          </div>
        </section>
      )}

      <section className="dashboard-card ember-glow relative mt-16 overflow-hidden p-8 text-center sm:p-12">
        <div className="absolute -right-16 -bottom-16 h-64 w-64 ember-glow-bg" />
        <div className="relative z-10">
          <h2 className="font-heading text-4xl font-light text-foreground">Want work like this?</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Tell us where the brand stands and where it needs to go. We will tell you what the work actually requires.
          </p>
          <Link to="/contact" className="btn-forge mt-8 inline-flex items-center gap-3 rounded-md px-6 py-3.5 text-sm font-semibold">
            Request a Proposal <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}