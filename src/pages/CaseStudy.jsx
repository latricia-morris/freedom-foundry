import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ExternalLink, LoaderCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import PortfolioCard from '@/components/portfolio/PortfolioCard';
import CaseStudySection from '@/components/portfolio/CaseStudySection';
import { ASSET_TYPE_LABELS } from '@/lib/portfolioData';

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

function setMeta(attr, name, content) {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export default function CaseStudy() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let active = true;
    setData(null);
    setMissing(false);
    base44.functions.invoke('portfolio-public', { action: 'get', slug })
      .then((response) => { if (active) setData(response?.data || null); })
      .catch(() => { if (active) setMissing(true); });
    return () => { active = false; };
  }, [slug]);

  const project = data?.project;
  const assets = data?.assets || [];
  const related = data?.related || [];

  useEffect(() => {
    if (!project) return;
    const title = project.seo_title || `${project.client_name} — Case Study | Freedom Foundry`;
    document.title = title;
    setMeta('name', 'description', project.meta_description);
    setMeta('property', 'og:title', project.og_title || title);
    setMeta('property', 'og:description', project.og_description || project.meta_description);
    setMeta('property', 'og:image', project.og_image_url || project.featured_image_url);
    setMeta('property', 'og:type', 'article');
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'case-study-jsonld';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.title,
      about: project.industry || undefined,
      description: project.short_summary || undefined,
      image: project.featured_image_url || undefined,
      keywords: (project.service_categories || []).join(', ') || undefined,
      dateCreated: project.year || undefined,
      creator: { '@type': 'Organization', name: 'Freedom Foundry by The Brand Revivalist' },
    });
    document.head.appendChild(script);
    return () => {
      document.getElementById('case-study-jsonld')?.remove();
      document.title = 'Freedom Foundry';
    };
  }, [project]);

  if (!data && !missing) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (missing || !project) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <h1 className="font-heading text-4xl font-light text-foreground">Case study not found</h1>
        <p className="mt-4 text-sm text-muted-foreground">This work may be unpublished or the link may have changed.</p>
        <Link to="/portfolio" className="link-warm mt-6 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to all work
        </Link>
      </div>
    );
  }

  const images = assets.filter((a) => IMAGE_EXT.test(a.file_url));
  const videos = assets.filter((a) => VIDEO_EXT.test(a.file_url));
  const imageIds = new Set(images.map((a) => a.id));
  const videoIds = new Set(videos.map((a) => a.id));
  const files = assets.filter((a) => !imageIds.has(a.id) && !videoIds.has(a.id));
  const deliverableLines = (project.deliverables || '').split('\n').map((l) => l.trim()).filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 sm:px-8">
      <Link to="/portfolio" className="link-warm inline-flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" /> All work
      </Link>

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
        {project.service_categories?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.service_categories.map((tag) => (
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

        <CaseStudySection label="Visual Gallery">
          {images.length === 0 && videos.length === 0 && files.length === 0 && (
            <p className="text-sm">Project visuals are being prepared.</p>
          )}
          {images.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          {videos.length > 0 && (
            <div className="space-y-6">
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
        </CaseStudySection>

        {project.results && (
          <CaseStudySection label="Outcome" title="Where the work landed">
            <p>{project.results}</p>
          </CaseStudySection>
        )}

        {project.testimonial && (
          <CaseStudySection label="In Their Words">
            <blockquote className="border-l-2 border-primary/60 pl-5">
              <p className="font-heading text-2xl font-light italic leading-relaxed text-foreground">“{project.testimonial}”</p>
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