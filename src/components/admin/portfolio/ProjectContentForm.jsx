import React from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import MultiSelectChips from '@/components/admin/portfolio/MultiSelectChips';
import DraftStoryButton from '@/components/admin/portfolio/DraftStoryButton';
import RewriteButton from '@/components/admin/portfolio/RewriteButton';
import { WORK_TYPES, DETAIL_TAGS, slugify } from '@/lib/portfolioData';

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground/70">{hint}</span>}
    </label>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#d9622c]"
      />
      {label}
    </label>
  );
}

function NarrativeField({ label, field, form, set, patch, hint }) {
  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <RewriteButton field={field} form={form} onChange={patch} />
      </div>
      <textarea className="admin-input min-h-24" value={form[field] || ''} onChange={set(field)} />
      {hint && <span className="mt-1 block text-xs text-muted-foreground/70">{hint}</span>}
    </div>
  );
}

const STATUS_LABELS = {
  unchecked: 'Unchecked',
  reachable: 'Reachable',
  redirecting: 'Redirecting',
  error: 'Error',
  timeout: 'Timeout',
  manual_hold: 'Held for review',
};

export default function ProjectContentForm({ form, onChange, projects, assets, onCheckWebsite, checking, slugTaken }) {
  const patch = (next) => onChange(next);
  const set = (key) => (e) => patch({ [key]: e.target.value });
  const toggleIn = (key) => (value) => {
    const list = form[key] || [];
    patch({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  const relatedOptions = projects
    .filter((p) => p.id !== form.id)
    .map((p) => ({ value: p.id, label: p.client_name ? `${p.title} — ${p.client_name}` : p.title }));

  return (
    <div className="space-y-8">
      <div className="dashboard-card space-y-5 p-6">
        <h3 className="font-heading text-2xl text-foreground">Project Identity</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Project title">
            <input className="admin-input" value={form.title || ''} onChange={set('title')} placeholder="Full rebrand & identity system" />
          </Field>
          <Field label="Client / company name">
            <input className="admin-input" value={form.client_name || ''} onChange={set('client_name')} placeholder="Client or company name" />
          </Field>
          <Field label="URL slug" hint={slugTaken ? '⚠ This slug is already used by another project.' : 'Used in the public case-study URL: /portfolio/your-slug'}>
            <div className="flex gap-2">
              <input className="admin-input" value={form.slug || ''} onChange={set('slug')} placeholder="acme-rebrand" />
              <button
                type="button"
                onClick={() => patch({ slug: slugify(form.title) })}
                className="shrink-0 rounded-md border border-border px-3 text-xs uppercase tracking-widest text-muted-foreground hover:border-primary/40 hover:text-foreground"
              >
                From title
              </button>
            </div>
          </Field>
          <Field label="Industry">
            <input className="admin-input" value={form.industry || ''} onChange={set('industry')} placeholder="Professional services" />
          </Field>
          <Field label="Location / service area">
            <input className="admin-input" value={form.location_served || ''} onChange={set('location_served')} placeholder="Charlotte, NC" />
          </Field>
          <Field label="Project year" hint="Optional — defaults to the last-updated year if left blank.">
            <input className="admin-input" value={form.project_year || ''} onChange={set('project_year')} placeholder="2026" />
          </Field>
        </div>
        <div className="flex flex-wrap gap-6 pt-1">
          <Toggle checked={!!form.is_featured} onChange={(v) => patch({ is_featured: v })} label="Featured project (floats to the top of the portfolio)" />
          <Toggle checked={!!form.confidential} onChange={(v) => patch({ confidential: v })} label="Confidential — never show publicly" />
          <Toggle checked={!!form.nda_sensitive} onChange={(v) => patch({ nda_sensitive: v })} label="NDA-sensitive (internal reminder)" />
        </div>
      </div>

      <div className="dashboard-card space-y-5 p-6">
        <h3 className="font-heading text-2xl text-foreground">Client Website Link</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Client website URL">
            <input className="admin-input" value={form.client_website_url || ''} onChange={set('client_website_url')} placeholder="https://client-site.com" />
          </Field>
          <div className="flex items-end gap-4">
            <Toggle checked={!!form.website_public} onChange={(v) => patch({ website_public: v })} label="Show website publicly" />
            <button
              type="button"
              onClick={onCheckWebsite}
              disabled={checking || !form.client_website_url}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-40"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${checking ? 'animate-spin' : ''}`} /> Check link
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className={`rounded-sm border px-2 py-1 uppercase tracking-wider ${form.website_link_status === 'reachable' ? 'border-primary/50 text-primary' : 'border-border'}`}>
            {STATUS_LABELS[form.website_link_status || 'unchecked']}
          </span>
          {form.website_last_checked && (
            <span className="inline-flex items-center gap-1.5">Last checked {new Date(form.website_last_checked).toLocaleString()} <ExternalLink className="h-3 w-3" /></span>
          )}
        </div>
        <p className="text-xs leading-5 text-muted-foreground/70">
          The public "Visit Site" button only appears when a URL is entered, approved for public display, and the check
          passes. Broken, timed-out, or unchecked links stay hidden.
        </p>
        <Field label="Link quality / ownership notes (admin only)">
          <textarea className="admin-input min-h-16" value={form.website_override_note || ''} onChange={set('website_override_note')} />
        </Field>
      </div>

      <div className="dashboard-card space-y-5 p-6">
        <h3 className="font-heading text-2xl text-foreground">Categorization</h3>
        <Field label="Work types" hint="The public portfolio filter and the case-study tags.">
          <MultiSelectChips options={WORK_TYPES} selected={form.work_types || []} onToggle={toggleIn('work_types')} />
        </Field>
        <Field label="Primary work type" hint="The one that leads. Used for SEO emphasis.">
          <select className="admin-input" value={form.primary_service_category || ''} onChange={set('primary_service_category')}>
            <option value="">— Select —</option>
            {(form.work_types || []).map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </Field>
        <Field label="Detail tags (internal)" hint="Organize the work behind the scenes. Never shown on the public site.">
          <MultiSelectChips options={DETAIL_TAGS} selected={form.detail_tags || []} onToggle={toggleIn('detail_tags')} />
        </Field>
        <Field label="Related work (shown on the case study)">
          <MultiSelectChips options={relatedOptions} selected={form.related_project_ids || []} onToggle={toggleIn('related_project_ids')} emptyText="Create more projects to relate them." />
        </Field>
      </div>

      <div className="dashboard-card space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-heading text-2xl text-foreground">Case Study Narrative</h3>
          <DraftStoryButton form={form} assets={assets} onChange={patch} />
        </div>
        <NarrativeField label="Short summary (used on portfolio cards and search)" field="short_summary" form={form} set={set} patch={patch} />
        <NarrativeField label="The situation / challenge" field="challenge" form={form} set={set} patch={patch} />
        <NarrativeField label="What the work needed to accomplish" field="objectives" form={form} set={set} patch={patch} />
        <NarrativeField label="Scope of work" field="scope_of_work" form={form} set={set} patch={patch} />
        <NarrativeField label="Strategy / creative direction" field="strategy" form={form} set={set} patch={patch} />
        <NarrativeField label="Deliverables (one per line)" field="deliverables" form={form} set={set} patch={patch} />
        <NarrativeField label="Results / outcomes" field="results" form={form} set={set} patch={patch} hint="Optional. Never invent metrics — leave blank and say what you know." />
        <Field label="Testimonial (optional)">
          <textarea className="admin-input min-h-20" value={form.testimonial || ''} onChange={set('testimonial')} />
        </Field>
        <Field label="Testimonial source / role (optional)">
          <input className="admin-input" value={form.testimonial_source || ''} onChange={set('testimonial_source')} placeholder="Jane Doe, Founder" />
        </Field>
        <Field label="Project credit notes (optional)">
          <textarea className="admin-input min-h-16" value={form.credit_notes || ''} onChange={set('credit_notes')} />
        </Field>
        <Field label="Internal notes (admin only — never shown publicly)">
          <textarea className="admin-input min-h-20" value={form.internal_notes || ''} onChange={set('internal_notes')} />
        </Field>
      </div>
    </div>
  );
}