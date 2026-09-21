import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CaseStudyView from '@/components/portfolio/CaseStudyView';

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
      keywords: (project.work_types || []).join(', ') || undefined,
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

  return (
    <CaseStudyView
      project={project}
      assets={data.assets || []}
      beforeAfter={data.before_after || []}
      related={data.related || []}
      intro={(
        <Link to="/portfolio" className="link-warm inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> All work
        </Link>
      )}
    />
  );
}