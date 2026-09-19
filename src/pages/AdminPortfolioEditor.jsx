import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProjectContentForm from '@/components/admin/portfolio/ProjectContentForm';
import PortfolioAssetManager from '@/components/admin/portfolio/PortfolioAssetManager';
import PortfolioSeoPanel from '@/components/admin/portfolio/PortfolioSeoPanel';
import { useToast } from '@/components/ui/use-toast';

const EDITABLE_FIELDS = [
  'title', 'slug', 'client_name', 'client_website_url', 'website_public',
  'website_override_note', 'industry', 'location_served', 'project_year',
  'is_featured', 'confidential', 'nda_sensitive', 'visibility_reviewed',
  'service_categories', 'deliverable_categories', 'primary_service_category',
  'related_project_ids', 'short_summary', 'challenge', 'objectives',
  'scope_of_work', 'strategy', 'deliverables', 'results', 'testimonial',
  'testimonial_source', 'credit_notes', 'internal_notes', 'seo_title',
  'meta_description', 'canonical_url', 'og_title', 'og_description',
  'og_image_url', 'seo_keywords',
];

const STATUS_STYLE = {
  draft: 'border-border text-muted-foreground',
  published: 'border-primary/50 text-primary',
  archived: 'border-border text-muted-foreground/60',
};

export default function AdminPortfolioEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState(null);
  const [assets, setAssets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tab, setTab] = useState('content');
  const [saving, setSaving] = useState(false);

  const loadProjects = () => {
    base44.entities.PortfolioProject.filter({}, 'order', 500)
      .then((rows) => setProjects(rows || []))
      .catch(() => setProjects([]));
  };

  useEffect(() => {
    let active = true;
    if (isNew) {
      setForm({ status: 'draft', website_link_status: 'unchecked', website_last_checked: null });
      loadProjects();
      return () => { active = false; };
    }
    base44.entities.PortfolioProject.get(id)
      .then((record) => { if (active) setForm(record); })
      .catch(() => { if (active) setForm(null); });
    loadProjects();
    return () => { active = false; };
  }, [id, isNew]);

  const reloadAssets = () => {
    if (isNew) return;
    base44.entities.PortfolioAsset.filter({ project_id: id }, 'sort_order', 500)
      .then((rows) => setAssets(rows || []))
      .catch(() => setAssets([]));
  };

  useEffect(() => { reloadAssets(); }, [id, isNew]);

  const slugTaken = (projects || []).some((p) => p.id !== form?.id && p.slug && p.slug === form?.slug);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const ARRAY_FIELDS = ['service_categories', 'deliverable_categories', 'related_project_ids'];
      const payload = {};
      EDITABLE_FIELDS.forEach((key) => {
        const value = form[key];
        if (ARRAY_FIELDS.includes(key)) {
          if (Array.isArray(value)) payload[key] = value;
        } else if (value !== undefined && value !== null) {
          payload[key] = value;
        }
      });
      if (isNew) {
        const created = await base44.entities.PortfolioProject.create(payload);
        toast({ title: 'Project created as a draft.' });
        navigate(`/admin/portfolio/${created.id}`, { replace: true });
      } else {
        await base44.entities.PortfolioProject.update(id, payload);
        toast({ title: 'Project saved.' });
        setForm((prev) => ({ ...prev, ...payload }));
        loadProjects();
      }
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (status) => {
    await save();
    await base44.entities.PortfolioProject.update(form.id || id, { status });
    setForm((prev) => ({ ...prev, status }));
    toast({ title: status === 'published' ? 'Case study published.' : `Status set to ${status}.` });
  };

  const mergeForm = (next) => setForm((prev) => ({ ...prev, ...next }));

  const checkWebsite = async () => {
    try {
      const response = await base44.functions.invoke('portfolio-public', {
        action: 'check-link',
        url: form.client_website_url,
        project_id: form.id || null,
      });
      setForm((prev) => ({
        ...prev,
        website_link_status: response?.data?.status || 'error',
        website_last_checked: response?.data?.checked_at || new Date().toISOString(),
      }));
      toast({ title: `Link check: ${response?.data?.status}` });
    } catch (error) {
      toast({ title: 'Link check failed', description: error.message, variant: 'destructive' });
    }
  };

  if (form === null) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  const tabs = [
    { key: 'content', label: 'Content' },
    { key: 'assets', label: 'Assets' },
    { key: 'seo', label: 'SEO & Publish' },
  ];

  return (
    <div className="mx-auto max-w-5xl animate-fade-in pb-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/admin/portfolio" className="link-warm inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Portfolio Manager
          </Link>
          <h1 className="mt-3 font-heading text-4xl font-light text-foreground">
            {isNew ? 'New project' : (form.title || 'Untitled project')}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-widest ${STATUS_STYLE[form.status] || STATUS_STYLE.draft}`}>
              {form.status}
            </span>
            {form.is_featured && <span className="text-[10px] uppercase tracking-widest text-primary">Featured</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-forge inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="mb-6 flex gap-2 border-b border-border">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors ${
              tab === key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'content' && (
        <ProjectContentForm
          form={form}
          onChange={mergeForm}
          projects={projects}
          onCheckWebsite={checkWebsite}
          checking={false}
          slugTaken={slugTaken}
        />
      )}
      {tab === 'assets' && (
        <PortfolioAssetManager project={form} assets={assets} onReload={reloadAssets} />
      )}
      {tab === 'seo' && (
        <PortfolioSeoPanel
          form={form}
          onChange={mergeForm}
          assets={assets}
          onSetStatus={setStatus}
          slugTaken={slugTaken}
        />
      )}
    </div>
  );
}