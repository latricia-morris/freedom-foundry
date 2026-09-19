import React, { useEffect, useState } from 'react';
import { Check, ExternalLink, Sparkles, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { publishChecklist, seoDraft, slugify } from '@/lib/portfolioData';

const SITE_LABELS = {
  'thebrandrevivalist.com': 'TBR',
  'oxandiron.co': 'Ox & Iron',
};

export default function PortfolioSeoPanel({ form, onChange, assets, onSetStatus, slugTaken }) {
  const [keywords, setKeywords] = useState([]);
  const patch = (next) => onChange(next);
  const set = (key) => (e) => patch({ [key]: e.target.value });
  const publicAssets = (assets || []).filter((a) => a.is_public && a.file_url);
  const checklist = publishChecklist(form, publicAssets);
  const allPass = checklist.every((item) => item.pass);
  const isPublished = form.status === 'published';

  useEffect(() => {
    let active = true;
    base44.entities.SeoKeyword.filter({ search_intent: 'Commercial' }, '-volume', 20)
      .then((rows) => { if (active) setKeywords(rows || []); })
      .catch(() => { if (active) setKeywords([]); });
    return () => { active = false; };
  }, []);

  const appendKeyword = (keyword) => {
    const current = (form.seo_keywords || '').split(',').map((k) => k.trim()).filter(Boolean);
    if (current.includes(keyword)) return;
    patch({ seo_keywords: [...current, keyword].join(', ') });
  };

  const generateDraft = () => patch({ ...seoDraft(form), slug: form.slug || slugify(form.title || form.client_name) });

  return (
    <div className="space-y-8">
      <div className="dashboard-card space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-heading text-2xl text-foreground">SEO & Discoverability</h3>
          <button type="button" onClick={generateDraft} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:border-primary/40 hover:text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Generate editable draft
          </button>
        </div>
        <p className="text-xs leading-5 text-muted-foreground/70">
          The draft is a starting point from the project title, client, industry, and summary — review and edit before
          publishing. Nothing generic or keyword-stuffed ships automatically.
        </p>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">SEO / title tag <span className="text-muted-foreground/50">({(form.seo_title || '').length}/60)</span></span>
          <input className="admin-input" value={form.seo_title || ''} onChange={set('seo_title')} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Meta description <span className="text-muted-foreground/50">({(form.meta_description || '').length}/155)</span></span>
          <textarea className="admin-input min-h-20" value={form.meta_description || ''} onChange={set('meta_description')} />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">URL slug</span>
            <input className="admin-input" value={form.slug || ''} onChange={set('slug')} />
            {slugTaken && <span className="mt-1 block text-xs text-destructive">⚠ Already used by another project.</span>}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Canonical URL (optional)</span>
            <input className="admin-input" value={form.canonical_url || ''} onChange={set('canonical_url')} placeholder="https://…" />
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Open Graph title</span>
            <input className="admin-input" value={form.og_title || ''} onChange={set('og_title')} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Open Graph description</span>
            <input className="admin-input" value={form.og_description || ''} onChange={set('og_description')} />
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Open Graph image URL (defaults to featured image)</span>
          <input className="admin-input" value={form.og_image_url || ''} onChange={set('og_image_url')} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Keyword themes (internal guidance only)</span>
          <textarea className="admin-input min-h-16" value={form.seo_keywords || ''} onChange={set('seo_keywords')} />
        </label>
      </div>

      <div className="dashboard-card space-y-4 p-6">
        <h3 className="font-heading text-2xl text-foreground">Keyword Reference</h3>
        <p className="text-xs leading-5 text-muted-foreground/70">
          Top commercial-intent keywords from the Brand Revivalist / Ox &amp; Iron research reports. Click one to add it
          to the keyword themes above.
        </p>
        {keywords.length === 0 ? (
          <p className="text-xs text-muted-foreground/60">No keyword research imported yet.</p>
        ) : (
          <div className="divide-y divide-border/50">
            {keywords.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => appendKeyword(row.keyword)}
                className="flex w-full items-center justify-between gap-3 py-2 text-left transition-colors hover:bg-accent/40"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-foreground">{row.keyword}</span>
                  <span className="block text-[11px] text-muted-foreground/70">
                    {[SITE_LABELS[row.website] || row.website, row.topic].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3 text-[11px] text-muted-foreground">
                  <span>{row.volume || 0}/mo</span>
                  <span className="rounded-sm border border-border px-1.5 py-0.5 uppercase tracking-wider">{row.difficulty || '—'}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-card space-y-5 p-6">
        <h3 className="font-heading text-2xl text-foreground">Publish Checklist</h3>
        <ul className="space-y-2">
          {checklist.map((item) => (
            <li key={item.key} className="flex items-center gap-3 text-sm">
              {item.pass
                ? <Check className="h-4 w-4 shrink-0 text-primary" />
                : <X className="h-4 w-4 shrink-0 text-destructive/80" />}
              <span className={item.pass ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
            </li>
          ))}
        </ul>
        <label className="flex cursor-pointer items-center gap-2.5 border-t border-border pt-4 text-sm text-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#d9622c]"
            checked={!!form.visibility_reviewed}
            onChange={(e) => patch({ visibility_reviewed: e.target.checked })}
          />
          I have reviewed the visibility settings — public assets, website link, and confidential flags.
        </label>
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
          {!isPublished && (
            <button
              type="button"
              onClick={() => onSetStatus('published')}
              disabled={!allPass}
              className="btn-forge inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Publish case study
            </button>
          )}
          {isPublished && (
            <button
              type="button"
              onClick={() => onSetStatus('draft')}
              className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm text-foreground hover:border-primary/40"
            >
              Unpublish
            </button>
          )}
          {isPublished && form.slug && (
            <a
              href={`/portfolio/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary"
            >
              View public page <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {!allPass && !isPublished && (
            <span className="text-xs text-muted-foreground/70">Every item must pass before this project can publish.</span>
          )}
        </div>
      </div>
    </div>
  );
}