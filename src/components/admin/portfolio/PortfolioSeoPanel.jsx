import React from 'react';
import { Check, ExternalLink, Sparkles, X } from 'lucide-react';
import { readiness, seoDraft, slugify } from '@/lib/portfolioData';
import KeywordLibrary from '@/components/admin/portfolio/KeywordLibrary';
import SearchOutput from '@/components/admin/portfolio/SearchOutput';

export default function PortfolioSeoPanel({ form, onChange, assets, onSetStatus, slugTaken }) {
  const patch = (next) => onChange(next);
  const set = (key) => (e) => patch({ [key]: e.target.value });
  const publicAssets = (assets || []).filter((a) => a.is_public && a.file_url);
  const ready = readiness(form, publicAssets);
  const blocked = ready.blockers.length > 0;
  const isPublished = form.status === 'published';

  const internalThemes = (form.seo_keywords || '').split(',').map((k) => k.trim()).filter(Boolean);
  const targetKeywords = form.target_keywords || [];

  const addTarget = (keyword) => {
    if (!targetKeywords.includes(keyword)) patch({ target_keywords: [...targetKeywords, keyword] });
  };
  const removeTarget = (keyword) => patch({ target_keywords: targetKeywords.filter((k) => k !== keyword) });
  const addTheme = (keyword) => {
    if (!internalThemes.includes(keyword)) patch({ seo_keywords: [...internalThemes, keyword].join(', ') });
  };
  const generateDraft = () => patch({ ...seoDraft(form), slug: form.slug || slugify(form.title || form.client_name) });

  return (
    <div className="space-y-8">
      <div className="dashboard-card space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-heading text-2xl text-foreground">SEO &amp; Discoverability</h3>
          <button type="button" onClick={generateDraft} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:border-primary/40 hover:text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Generate editable draft
          </button>
        </div>
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
          <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Open Graph image URL (defaults to the featured image)</span>
          <input className="admin-input" value={form.og_image_url || ''} onChange={set('og_image_url')} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Internal themes (never shown publicly)</span>
          <textarea className="admin-input min-h-16" value={form.seo_keywords || ''} onChange={set('seo_keywords')} />
        </label>
      </div>

      <div className="dashboard-card space-y-4 p-6">
        <h3 className="font-heading text-2xl text-foreground">Target keywords (public)</h3>
        <p className="text-xs leading-5 text-muted-foreground/70">
          Keywords marked as targets. The public page only ever sees the copy they are woven into — the list itself
          stays yours.
        </p>
        {targetKeywords.length === 0 ? (
          <p className="text-xs text-muted-foreground/60">No target keywords yet. Mark them in the library below.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {targetKeywords.map((keyword) => (
              <span key={keyword} className="inline-flex items-center gap-1.5 rounded-sm border border-primary/40 px-2.5 py-1 text-xs text-primary">
                {keyword}
                <button type="button" onClick={() => removeTarget(keyword)} className="hover:text-foreground" aria-label={`Remove ${keyword}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <KeywordLibrary targetKeywords={targetKeywords} internalThemes={internalThemes} onAddTarget={addTarget} onAddTheme={addTheme} />
      <SearchOutput form={form} />

      <div className="dashboard-card space-y-5 p-6">
        <h3 className="font-heading text-2xl text-foreground">Readiness &amp; Publishing</h3>
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="uppercase tracking-widest">Readiness</span>
            <span>{ready.score}% ready</span>
          </div>
          <div className="well-track mt-2 h-2 w-full">
            <div className="molten-bar h-full rounded-full transition-all" style={{ width: `${ready.score}%` }} />
          </div>
        </div>
        <ul className="space-y-2">
          {ready.blockers.map((blocker) => (
            <li key={blocker} className="flex items-center gap-3 text-sm text-destructive/90">
              <X className="h-4 w-4 shrink-0" /> {blocker}
            </li>
          ))}
          {ready.recommendations.map((item) => (
            <li key={item.key} className="flex items-center gap-3 text-sm">
              {item.pass
                ? <Check className="h-4 w-4 shrink-0 text-primary" />
                : <X className="h-4 w-4 shrink-0 text-muted-foreground/50" />}
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
              disabled={blocked}
              className="btn-forge inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Publish case study
            </button>
          )}
          {isPublished && (
            <>
              <button
                type="button"
                onClick={() => onSetStatus('draft')}
                className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm text-foreground hover:border-primary/40"
              >
                Unpublish
              </button>
              {form.slug && (
                <a
                  href={`/portfolio/${form.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary"
                >
                  View public page <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </>
          )}
          {!blocked && !isPublished && (
            <span className="text-xs text-muted-foreground/70">Recommendations never block publishing — they guide it.</span>
          )}
        </div>
      </div>
    </div>
  );
}