import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Save, Shield } from 'lucide-react';
import apiClient from '@/api/client';

const TEMPLATE_FIELDS = [
  ['internal_subject', 'Internal subject'],
  ['internal_intro', 'Internal introduction'],
  ['confirmation_subject', 'Confirmation subject'],
  ['confirmation_intro', 'Confirmation introduction'],
];

function text(value) {
  return typeof value === 'string' ? value : '';
}

function normalizeCategories(categories) {
  return (Array.isArray(categories) ? categories : []).map((category) => ({
    ...category,
    key: category.key || category.category_key || '',
    title: text(category.title || category.name),
    description: text(category.description || category.summary),
    cta: text(category.cta),
    examples: Array.isArray(category.examples || category.offerings)
      ? (category.examples || category.offerings).join('\n')
      : text(category.examples),
    pricing_text: text(category.pricing_text),
    visible: category.visible !== false,
    status: text(category.status || 'active'),
  }));
}

export default function AdminServices() {
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState(null);
  const [requests, setRequests] = useState([]);
  const [savingRequest, setSavingRequest] = useState(null);

  useEffect(() => {
    Promise.all([apiClient.auth.me(), apiClient.admin.getServiceHubConfig(), apiClient.admin.listServiceRequests()])
      .then(([me, nextConfig, nextRequests]) => {
        if (me.role !== 'admin') {
          setDenied(true);
          return;
        }
        setConfig({
          ...nextConfig,
          categories: normalizeCategories(nextConfig.categories),
          notification_templates: {
            ...(nextConfig.notification_templates || {}),
          },
        });
        setRequests(Array.isArray(nextRequests) ? nextRequests : []);
      })
      .catch((requestError) => setError(requestError.message || 'The Services Hub admin area could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  const updateConfig = (key, value) => setConfig((current) => ({ ...current, [key]: value }));

  const updateCategory = (index, key, value) => {
    setConfig((current) => ({
      ...current,
      categories: current.categories.map((category, categoryIndex) => categoryIndex === index ? { ...category, [key]: value } : category),
    }));
  };

  const updateTemplate = (key, value) => setConfig((current) => ({
    ...current,
    notification_templates: { ...current.notification_templates, [key]: value },
  }));

  const saveConfig = async (event) => {
    event.preventDefault();
    setError('');
    setSaved(false);
    try {
      const savedConfig = await apiClient.admin.updateServiceHubConfig({
        categories: config.categories.map((category) => ({
          key: category.key,
          title: category.title,
          description: category.description,
          examples: category.examples.split('\n').map((example) => example.trim()).filter(Boolean),
          cta: category.cta,
          route: category.route || 'conversation',
          visible: category.visible,
          status: category.status || 'active',
          pricing_text: category.pricing_text || null,
        })),
        notification_recipient: config.notification_recipient,
        update_threshold_months: Number(config.update_threshold_months) || 12,
        notification_templates: config.notification_templates,
      });
      setConfig({
        ...savedConfig,
        categories: normalizeCategories(savedConfig.categories),
        notification_templates: savedConfig.notification_templates || {},
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch (requestError) {
      setError(requestError.message || 'The Services Hub settings could not be saved.');
    }
  };

  const saveRequest = async (request) => {
    setSavingRequest(request.id);
    setError('');
    try {
      const updated = await apiClient.admin.updateServiceRequest(request.id, {
        status: request.status,
        internal_notes: request.internal_notes || '',
      });
      setRequests((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (requestError) {
      setError(requestError.message || 'The request could not be updated.');
    } finally {
      setSavingRequest(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  if (denied) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center dashboard-card p-10 max-w-md">
          <Shield className="w-10 h-10 text-primary mx-auto mb-4" strokeWidth={1} />
          <h1 className="font-heading text-2xl text-foreground mb-2">Admin Access Required</h1>
          <p className="text-sm text-muted-foreground">This Services Hub control room is limited to administrators.</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return <div className="max-w-3xl mx-auto py-12"><p role="alert" className="text-sm text-red-300">{error || 'Configuration unavailable.'}</p></div>;
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-16">
      <div className="flex items-center justify-between gap-4 mb-8">
        <Link to="/admin" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Command
        </Link>
        <span className="text-[10px] uppercase tracking-[0.24em] text-[#d9c9a3]">Services Hub control room</span>
      </div>
      <header className="mb-8">
        <h1 className="font-heading text-4xl font-light text-foreground">Services <span className="molten-text italic">Configuration</span></h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">Keep the member-facing service shelf concise, current, and routed to the right conversation.</p>
      </header>

      {error && <p role="alert" className="mb-6 rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-200">{error}</p>}

      <form onSubmit={saveConfig} className="space-y-6">
        <section className="dashboard-card p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-heading text-2xl text-foreground">Member-facing categories</h2>
              <p className="text-xs text-muted-foreground mt-1">One example per line. Pricing stays hidden when its field is empty.</p>
            </div>
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs uppercase tracking-wider text-primary-foreground">
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />} {saved ? 'Saved' : 'Save settings'}
            </button>
          </div>
          <div className="space-y-4">
            {config.categories.map((category, index) => (
              <div key={category.key || index} className="rounded-xl border border-border bg-background/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-primary">{category.key}</span>
                  <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" checked={category.visible} onChange={(event) => updateCategory(index, 'visible', event.target.checked)} />
                    Visible to members
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input aria-label={`${category.key} title`} value={category.title} onChange={(event) => updateCategory(index, 'title', event.target.value)} placeholder="Category title" className="admin-input" />
                  <input aria-label={`${category.key} CTA`} value={category.cta} onChange={(event) => updateCategory(index, 'cta', event.target.value)} placeholder="CTA label" className="admin-input" />
                  <textarea aria-label={`${category.key} description`} value={category.description} onChange={(event) => updateCategory(index, 'description', event.target.value)} placeholder="Short description" rows={2} className="admin-input md:col-span-2" />
                  <textarea aria-label={`${category.key} examples`} value={category.examples} onChange={(event) => updateCategory(index, 'examples', event.target.value)} placeholder="Examples, one per line" rows={3} className="admin-input" />
                  <div className="space-y-3">
                    <input aria-label={`${category.key} status`} value={category.status} onChange={(event) => updateCategory(index, 'status', event.target.value)} placeholder="Status" className="admin-input" />
                    <input aria-label={`${category.key} pricing`} value={category.pricing_text} onChange={(event) => updateCategory(index, 'pricing_text', event.target.value)} placeholder="Approved pricing text (optional)" className="admin-input" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-card p-5 sm:p-7">
          <h2 className="font-heading text-2xl text-foreground mb-1">Routing and messages</h2>
          <p className="text-xs text-muted-foreground mb-5">The webhook remains server-side; these settings control its recipients and message copy.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs text-muted-foreground">Notification recipient
              <input value={config.notification_recipient || ''} onChange={(event) => updateConfig('notification_recipient', event.target.value)} className="admin-input mt-2" />
            </label>
            <label className="text-xs text-muted-foreground">Business update threshold (months)
              <input type="number" min="1" max="120" value={config.update_threshold_months || 12} onChange={(event) => updateConfig('update_threshold_months', event.target.value)} className="admin-input mt-2" />
            </label>
            {TEMPLATE_FIELDS.map(([key, label]) => (
              <label key={key} className="text-xs text-muted-foreground">{label}
                <textarea value={config.notification_templates?.[key] || ''} onChange={(event) => updateTemplate(key, event.target.value)} rows={2} className="admin-input mt-2" />
              </label>
            ))}
          </div>
        </section>
      </form>

      <section className="dashboard-card mt-8 overflow-hidden">
        <div className="p-5 sm:p-7 border-b border-border">
          <h2 className="font-heading text-2xl text-foreground">Member requests</h2>
          <p className="text-xs text-muted-foreground mt-1">Update status and keep internal notes without exposing them to members.</p>
        </div>
        {requests.length === 0 ? <p className="p-7 text-sm text-muted-foreground">No service requests yet.</p> : (
          <div className="divide-y divide-border">
            {requests.map((request) => (
              <div key={request.id} className="p-5 sm:p-7">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-foreground">{request.service_type}</p>
                    <p className="text-xs text-muted-foreground mt-1">{request.category_key || 'General services'} · {request.client_status || 'new'} · {request.created_at ? new Date(request.created_at).toLocaleString() : 'Date unavailable'}</p>
                    {request.objective && <p className="text-sm text-muted-foreground mt-3 max-w-2xl">{request.objective}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={request.status || 'submitted'} onChange={(event) => setRequests((current) => current.map((item) => item.id === request.id ? { ...item, status: event.target.value } : item))} className="admin-input min-w-36">
                      <option value="submitted">Submitted</option>
                      <option value="in_review">In review</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="complete">Complete</option>
                      <option value="closed">Closed</option>
                      <option value="draft">Saved</option>
                    </select>
                    <button type="button" onClick={() => saveRequest(request)} disabled={savingRequest === request.id} className="rounded-lg border border-primary/40 px-3 py-2 text-xs uppercase tracking-wider text-primary disabled:opacity-50">
                      {savingRequest === request.id ? 'Saving' : 'Update'}
                    </button>
                  </div>
                </div>
                <textarea value={request.internal_notes || ''} onChange={(event) => setRequests((current) => current.map((item) => item.id === request.id ? { ...item, internal_notes: event.target.value } : item))} rows={2} placeholder="Internal notes" className="admin-input mt-4 w-full" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}