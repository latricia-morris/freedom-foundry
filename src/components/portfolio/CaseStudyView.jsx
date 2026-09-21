import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Image } from '@/components/ui/image';
import PortfolioCard from '@/components/portfolio/PortfolioCard';
import { ASSET_TYPE_LABELS, groupAssetsByStory } from '@/lib/portfolioData';

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

/** Scroll-reveal wrapper: every block eases in as it enters the viewport, once. */
function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}

/** Short written beat, paced between the visual sections. */
function StoryBeat({ label, title, children }) {
  return (
    <section className="border-t border-border pt-8">
      <p className="text-xs uppercase tracking-[0.24em] text-warm">{label}</p>
      {title && <h2 className="mt-3 font-heading text-3xl font-light text-foreground">{title}</h2>}
      <div className="mt-4 max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

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
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-warm">After</p>
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

/** One ordered visual section: images in a grid, videos inline, files as quiet rows. */
function AssetSection({ section }) {
  const items = section.items || [];
  const images = items.filter((a) => IMAGE_EXT.test(a.file_url));
  const videos = items.filter((a) => VIDEO_EXT.test(a.file_url));
  const files = items.filter((a) => !IMAGE_EXT.test(a.file_url) && !VIDEO_EXT.test(a.file_url));

  return (
    <section className="border-t border-border pt-8">
      <p className="text-xs uppercase tracking-[0.24em] text-warm">{section.label}</p>
      <div className="mt-5 space-y-6">
        {images.length > 0 && (
          <div className={`grid gap-4 grid-cols-1 ${section.colClass}`}>
            {images.map((asset) => (
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
        )}
        {videos.map((asset) => (
          <div key={asset.id}>
            <video controls preload="metadata" src={asset.file_url} className="w-full rounded-md border border-border" />
            {(asset.caption || asset.title) && (
              <p className="mt-2 text-xs text-muted-foreground">{asset.caption || asset.title}</p>
            )}
          </div>
        ))}
        {files.length > 0 && (
          <ul className="space-y-2">
            {files.map((asset) => (
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
        )}
      </div>
    </section>
  );
}

/**
 * The public case-study layout, shared by the live page and the admin preview.
 * Guided showcase flow: opening visual, quick framing, brand system first,
 * identity next, digital expression after that, extensions later, small
 * collateral last — story beats paced between the visual sections.
 */
export default function CaseStudyView({ project, assets = [], beforeAfter = [], related = [], intro = null }) {
  const pairIds = new Set();
  (beforeAfter || []).forEach((pair) => {
    if (pair.before?.id) pairIds.add(pair.before.id);
    if (pair.after?.id) pairIds.add(pair.after.id);
  });

  const gallery = (assets || []).filter(
    (a) => a.asset_type !== 'featured_image' && a.asset_type !== 'before_after' && !pairIds.has(a.id),
  );
  const sections = groupAssetsByStory(gallery, project.section_order);
  const deliverableLines = (project.deliverables || '').split('\n').map((l) => l.trim()).filter(Boolean);

  const challengeBeat = project.challenge && (
    <StoryBeat label="The Situation" title="Where things stood">
      <p>{project.challenge}</p>
    </StoryBeat>
  );
  const objectivesBeat = project.objectives && (
    <StoryBeat label="The Objective" title="What the work needed to accomplish">
      <p>{project.objectives}</p>
    </StoryBeat>
  );
  const strategyBeat = project.strategy && (
    <StoryBeat label="Strategy & Creative Direction">
      <p>{project.strategy}</p>
    </StoryBeat>
  );

  // Beats stay anchored to their natural sections; without those assets they
  // fall back to the adjacent default position so nothing renders unplaced.
  const flow = [];
  if (challengeBeat) flow.push(challengeBeat);
  if (objectivesBeat && !sections.some((s) => s.key === 'system')) flow.push(objectivesBeat);
  sections.forEach((section) => {
    flow.push(<AssetSection key={section.key} section={section} />);
    if (section.key === 'system' && objectivesBeat && !flow.includes(objectivesBeat)) flow.push(objectivesBeat);
    if (section.key === 'logos' && strategyBeat && !flow.includes(strategyBeat)) flow.push(strategyBeat);
  });
  if (strategyBeat && !flow.includes(strategyBeat)) flow.push(strategyBeat);

  const quietItems = [
    { label: 'Services', value: (project.work_types || []).join(' · ') },
    { label: 'Industry', value: project.industry },
    { label: 'Location', value: project.location_served },
    { label: 'Year', value: project.year },
  ].filter((item) => item.value);
  const hasQuietDetails = quietItems.length > 0 || deliverableLines.length > 0 || Boolean(project.scope_of_work);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20 pt-6 sm:px-8">
      {intro}

      {/* 1 — Opening visual hit: the strongest image leads the page */}
      {project.featured_image_url && (
        <Reveal className="mt-4 overflow-hidden rounded-md border border-border">
          <Image
            src={project.featured_image_url}
            alt={project.featured_image_alt || project.title}
            fittingType="fit"
            className="w-full"
          />
        </Reveal>
      )}

      {/* 2 — Quick project framing */}
      <Reveal>
        <header className="mt-10">
          <p className="text-xs uppercase tracking-[0.28em] text-warm">Case Study</p>
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
                className="inline-flex items-center gap-2 rounded-md border border-primary/40 px-4 py-2.5 text-sm transition-colors hover:border-primary hover:bg-primary/10"
              >
                <span className="text-warm font-medium">Visit Site</span> <ExternalLink className="h-4 w-4 text-primary" />
              </a>
              <p className="text-xs text-muted-foreground/70">
                External site. Current appearance and functionality may change after project delivery.
              </p>
            </div>
          )}
        </header>
      </Reveal>

      {/* 3-9 — Ordered visual sections with story beats paced between them */}
      <div className="mt-12 space-y-12">
        {flow.map((block, index) => (
          <Reveal key={block.key || `flow-${index}`} delay={index === 0 ? 0 : 0.05}>
            {block}
          </Reveal>
        ))}

        {/* 10 — Before / after: only intentional pairs, never auto-generated */}
        {beforeAfter.length > 0 && (
          <Reveal>
            <section className="border-t border-border pt-8">
              <p className="text-xs uppercase tracking-[0.24em] text-warm">Before &amp; After</p>
              <div className="mt-5 space-y-8">
                {beforeAfter.map((pair, index) => <PairFigure key={index} pair={pair} index={index} />)}
              </div>
            </section>
          </Reveal>
        )}

        {/* 11 — Outcome / closing: short, factual, never invented */}
        {(project.results || project.testimonial) && (
          <Reveal>
            <section className="border-t border-border pt-8">
              {project.results && (
                <>
                  <p className="text-xs uppercase tracking-[0.24em] text-warm">Outcome</p>
                  <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">{project.results}</p>
                </>
              )}
              {project.testimonial && (
                <blockquote className="mt-8 border-l-2 border-primary/60 pl-5">
                  <p className="font-heading text-2xl font-light italic leading-relaxed text-foreground">"{project.testimonial}"</p>
                  {project.testimonial_source && (
                    <p className="mt-3 text-sm text-muted-foreground">— {project.testimonial_source}</p>
                  )}
                </blockquote>
              )}
            </section>
          </Reveal>
        )}

        {/* 12 — Quiet details: a subdued closing strip, never the lead */}
        {hasQuietDetails && (
          <Reveal>
            <section className="rounded-md border border-border/60 bg-card/30 p-6">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">Project details</p>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {quietItems.map((item) => (
                  <div key={item.label}>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">{item.label}</p>
                    <p className="mt-1.5 text-sm text-muted-foreground">{item.value}</p>
                  </div>
                ))}
                {deliverableLines.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Deliverables</p>
                    <ul className="mt-1.5 space-y-1">
                      {deliverableLines.map((line) => (
                        <li key={line} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full molten-bar" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {project.scope_of_work && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Scope</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{project.scope_of_work}</p>
                  </div>
                )}
              </div>
            </section>
          </Reveal>
        )}
      </div>

      {related.length > 0 && (
        <Reveal>
          <section className="mt-16 border-t border-border pt-10">
            <h2 className="font-heading text-3xl font-light text-foreground">Related <span className="italic text-muted-foreground">work</span></h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => <PortfolioCard key={item.id} project={item} />)}
            </div>
          </section>
        </Reveal>
      )}

      <Reveal>
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
      </Reveal>
    </div>
  );
}