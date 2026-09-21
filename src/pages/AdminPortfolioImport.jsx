import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, UploadCloud, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MultiSelectChips from '@/components/admin/portfolio/MultiSelectChips';
import { useToast } from '@/components/ui/use-toast';
import { WORK_TYPES, DETAIL_TAGS, slugify } from '@/lib/portfolioData';

/** Past-client intake: source material in, a factual draft record out, reviewed here. */
export default function AdminPortfolioImport() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [step, setStep] = useState('sources');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(null);
  const [missing, setMissing] = useState([]);

  const pickFiles = (list) => {
    setFiles((prev) => [...prev, ...[...list]]);
    if (fileRef.current) fileRef.current.value = '';
  };
  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const analyze = async () => {
    setBusy(true);
    try {
      const fileUrls = [];
      for (const file of files) {
        const uploaded = await base44.integrations.Core.UploadPublicFile({ file });
        if (uploaded?.file_url) fileUrls.push(uploaded.file_url);
      }
      const response = await base44.functions.invoke('portfolio-draft', {
        action: 'intake',
        payload: { website_url: websiteUrl, description, file_urls: fileUrls },
      });
      const result = response?.data || {};
      if (!result.draft) throw new Error(result.error || 'The draft could not be generated.');
      setDraft(result.draft);
      setMissing(result.draft.missing || []);
      setStep('review');
      if (result.website_fetch && result.website_fetch !== 'ok') {
        toast({ title: 'Website note', description: result.website_fetch });
      }
    } catch (e) {
      toast({ title: 'Import failed', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const set = (key) => (e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }));
  const toggleIn = (key) => (value) => setDraft((prev) => {
    const list = prev[key] || [];
    return { ...prev, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] };
  });

  const createDraft = async () => {
    setBusy(true);
    try {
      const created = await base44.entities.PortfolioProject.create({
        title: (draft.title || '').trim() || 'Untitled import',
        client_name: draft.client_name || '',
        industry: draft.industry || '',
        short_summary: draft.short_summary || '',
        work_types: draft.work_types || [],
        detail_tags: draft.detail_tags || [],
        primary_service_category: (draft.work_types || [])[0] || '',
        slug: (draft.slug || '').trim() || slugify(draft.title || draft.client_name),
        seo_title: draft.seo_title || '',
        meta_description: draft.meta_description || '',
        target_keywords: draft.target_keywords || [],
        client_website_url: websiteUrl,
        status: 'draft',
      });
      toast({ title: 'Draft project created.', description: 'Finish the story, upload the assets, and preview it in the editor.' });
      navigate(`/admin/portfolio/${created.id}`);
    } catch (e) {
      toast({ title: 'Create failed', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl animate-fade-in pb-12">
      <Link to="/admin/portfolio" className="link-warm inline-flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" /> Portfolio Manager
      </Link>
      <h1 className="mt-3 font-heading text-4xl font-light text-foreground">
        Import a <span className="molten-text italic font-medium">past client</span> project
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The draft comes only from real source material: the client's website, files you attach, and the facts you type.
      </p>

      {step === 'sources' && (
        <div className="dashboard-card mt-8 space-y-5 p-6">
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Client website URL</span>
            <input className="admin-input" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://client-site.com" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">What was the engagement?</span>
            <textarea
              className="admin-input min-h-28"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What you did, when, for whom, and anything the case study must say."
            />
          </label>
          <div>
            <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Reference files (brand guidelines, briefs, decks)</span>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
              <UploadCloud className="h-4 w-4" /> Attach files
              <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => pickFiles(e.target.files || [])} />
            </label>
            {files.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {files.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-1.5 text-xs">
                    <span className="truncate text-muted-foreground">{file.name}</span>
                    <button type="button" onClick={() => removeFile(index)} className="text-muted-foreground/60 hover:text-destructive" aria-label="Remove file">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground/70">Nothing is saved yet. The draft waits for your review.</p>
            <button
              type="button"
              onClick={analyze}
              disabled={busy || (!websiteUrl.trim() && !description.trim() && files.length === 0)}
              className="btn-forge inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" /> {busy ? 'Analyzing…' : 'Analyze & draft'}
            </button>
          </div>
        </div>
      )}

      {step === 'review' && draft && (
        <div className="mt-8 space-y-6">
          {missing.length > 0 && (
            <div className="dashboard-card border border-primary/40 p-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Needs your review: </span>
              {missing.join(', ')} — the source material did not support these, so nothing was invented.
            </div>
          )}

          <div className="dashboard-card space-y-5 p-6">
            <h2 className="font-heading text-2xl text-foreground">Review the draft</h2>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Project title</span>
              <input className="admin-input" value={draft.title || ''} onChange={set('title')} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Client / company name</span>
              <input className="admin-input" value={draft.client_name || ''} onChange={set('client_name')} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Industry</span>
              <input className="admin-input" value={draft.industry || ''} onChange={set('industry')} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Short summary</span>
              <textarea className="admin-input min-h-24" value={draft.short_summary || ''} onChange={set('short_summary')} />
            </label>
            <div className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Work types</span>
              <MultiSelectChips options={WORK_TYPES} selected={draft.work_types || []} onToggle={toggleIn('work_types')} />
            </div>
            <div className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Detail tags (internal)</span>
              <MultiSelectChips options={DETAIL_TAGS} selected={draft.detail_tags || []} onToggle={toggleIn('detail_tags')} />
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">URL slug</span>
              <input className="admin-input" value={draft.slug || ''} onChange={set('slug')} placeholder={slugify(draft.title || draft.client_name)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">SEO title tag</span>
              <input className="admin-input" value={draft.seo_title || ''} onChange={set('seo_title')} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Meta description</span>
              <textarea className="admin-input min-h-20" value={draft.meta_description || ''} onChange={set('meta_description')} />
            </label>
            {(draft.target_keywords || []).length > 0 && (
              <div className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Target keywords</span>
                <div className="flex flex-wrap gap-2">
                  {draft.target_keywords.map((keyword) => (
                    <span key={keyword} className="inline-flex items-center gap-1.5 rounded-sm border border-primary/40 px-2.5 py-1 text-xs text-primary">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => setDraft((prev) => ({ ...prev, target_keywords: (prev.target_keywords || []).filter((k) => k !== keyword) }))}
                        aria-label={`Remove ${keyword}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep('sources')}
              className="rounded-md border border-border px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Back to sources
            </button>
            <button
              type="button"
              onClick={createDraft}
              disabled={busy}
              className="btn-forge inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
            >
              {busy ? 'Creating…' : 'Create draft project'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}