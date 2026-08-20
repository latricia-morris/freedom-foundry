import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CircleAlert, Copy, FileUp, Layers3, Plus, Save, Send, Shield, Sparkles } from 'lucide-react';
import apiClient from '@/api/client';

const emptyPayload = () => ({
  personal: {}, corporate: {}, guidelines: {}, mediaKit: {}, bigPicture: {},
  assets: [], checklist: [], serviceRequests: [],
});

const copyPayload = (payload) => JSON.parse(JSON.stringify({ ...emptyPayload(), ...(payload || {}) }));

function Field({ label, value, onChange, placeholder, multiline = false }) {
  const base = 'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary';
  return <label className="block"><span className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</span>{multiline ? <textarea value={value || ''} onChange={(event) => onChange(event.target.value)} rows={3} placeholder={placeholder} className={base} /> : <input value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={base} />}</label>;
}

function Section({ title, description, children }) {
  return <section className="rounded-xl border border-border bg-card p-5"><div className="mb-4"><h2 className="font-heading text-xl text-foreground">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{children}</section>;
}

export default function ClientSetupWorkspace() {
  const { id } = useParams();
  const [setup, setSetup] = useState(null);
  const [payload, setPayload] = useState(emptyPayload);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [importText, setImportText] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [asset, setAsset] = useState({ title: '', description: '', file_url: '', file_type: '' });
  const [brandColor, setBrandColor] = useState({ name: '', hex: '#000000' });
  const [task, setTask] = useState({ title: '', deadline_date: '', assignee: '' });
  const [service, setService] = useState({ service_type: '', details: '' });

  const load = async () => {
    const [current, availableTemplates] = await Promise.all([
      apiClient.admin.getClientSetup(id),
      apiClient.admin.listClientSetupTemplates(),
    ]);
    setSetup(current);
    setPayload(copyPayload(current.payload));
    setTemplates(availableTemplates);
  };

  useEffect(() => {
    apiClient.auth.me().then(async (me) => {
      if (me.role !== 'admin') { setDenied(true); setLoading(false); return; }
      try { await load(); } catch (requestError) { setError(requestError.message || 'This client setup could not be loaded.'); }
      setLoading(false);
    }).catch(() => { setDenied(true); setLoading(false); });
  }, [id]);

  const summary = useMemo(() => {
    const sections = ['personal', 'corporate', 'guidelines', 'mediaKit', 'bigPicture'].filter((key) => Object.keys(payload[key] || {}).length > 0).length;
    return { sections, assets: payload.assets.length, tasks: payload.checklist.length, services: payload.serviceRequests.length, ready: sections > 0 && payload.assets.length > 0 };
  }, [payload]);

  const setSection = (section, key, value) => setPayload((current) => ({
    ...current,
    [section]: { ...current[section], [key]: value },
  }));

  const updateSetup = (key, value) => setSetup((current) => ({ ...current, [key]: value }));

  const save = async (status = setup.status) => {
    setSaving(true); setError(''); setNotice('');
    try {
      const updated = await apiClient.admin.updateClientSetup(id, {
        first_name: setup.first_name,
        last_name: setup.last_name,
        email: setup.email,
        business_name: setup.business_name,
        notes: setup.notes,
        status,
        payload,
      });
      setSetup(updated); setPayload(copyPayload(updated.payload)); setNotice('Private client setup saved.');
    } catch (requestError) { setError(requestError.message || 'The client setup could not be saved.'); }
    setSaving(false);
  };

  const addTo = (collection, value, reset) => {
    if (!value.title && !value.service_type) return;
    setPayload((current) => ({ ...current, [collection]: [...current[collection], value] }));
    reset();
  };

  const remove = (collection, index) => setPayload((current) => ({ ...current, [collection]: current[collection].filter((_, itemIndex) => itemIndex !== index) }));

  const addBrandColor = () => {
    if (!brandColor.name.trim() || !/^#[0-9a-fA-F]{6}$/.test(brandColor.hex)) return;
    setPayload((current) => ({
      ...current,
      corporate: {
        ...current.corporate,
        colors: [...(Array.isArray(current.corporate.colors) ? current.corporate.colors : []), { name: brandColor.name.trim(), hex: brandColor.hex.toUpperCase() }],
      },
    }));
    setBrandColor({ name: '', hex: '#000000' });
  };

  const removeBrandColor = (index) => setPayload((current) => ({
    ...current,
    corporate: { ...current.corporate, colors: (current.corporate.colors || []).filter((_, itemIndex) => itemIndex !== index) },
  }));

  const applyTemplate = async () => {
    if (!templateId) return;
    setError(''); setNotice('');
    try {
      const updated = await apiClient.admin.applyClientSetupTemplate(id, Number(templateId));
      setSetup(updated); setPayload(copyPayload(updated.payload)); setNotice('Agency template applied. Review it, then save when ready.');
    } catch (requestError) { setError(requestError.message || 'The agency template could not be applied.'); }
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) { setError('Name the agency template before saving it.'); return; }
    try {
      const template = await apiClient.admin.createClientSetupTemplate({ name: templateName.trim(), payload });
      setTemplates((current) => [...current, template]); setTemplateName(''); setNotice('Agency template saved for future client setups.');
    } catch (requestError) { setError(requestError.message || 'The agency template could not be saved.'); }
  };

  const importPayload = async () => {
    try {
      const parsed = JSON.parse(importText);
      const updated = await apiClient.admin.importClientSetup(id, parsed);
      setSetup(updated); setPayload(copyPayload(updated.payload)); setImportText(''); setNotice('Structured brand-kit data imported. Review the summary, then save or activate when ready.');
    } catch (requestError) { setError(requestError instanceof SyntaxError ? 'The import must be valid JSON.' : requestError.message || 'The import could not be completed.'); }
  };

  const invite = async () => {
    try {
      const saved = await apiClient.admin.updateClientSetup(id, {
        first_name: setup.first_name, last_name: setup.last_name, email: setup.email,
        business_name: setup.business_name, notes: setup.notes, status: 'ready_to_invite', payload,
      });
      const updated = await apiClient.admin.inviteClientSetup(id);
      setSetup(updated); setPayload(copyPayload(saved.payload));
      setNotice('Setup saved and account invitation sent. The prepared portal stays private until the client accepts it and you activate the setup.');
    }
    catch (requestError) { setError(requestError.message || 'The invitation could not be sent.'); }
  };

  const claim = async () => {
    try { const updated = await apiClient.admin.claimClientSetup(id); setSetup(updated); setPayload(copyPayload(updated.payload)); setNotice('The prepared portal is now active for the matching client account.'); }
    catch (requestError) { setError(requestError.message || 'The portal could not be activated yet.'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" /></div>;
  if (denied) return <div className="py-20 text-center"><Shield className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><h1 className="font-heading text-xl text-foreground">Admin Access Required</h1></div>;
  if (!setup) return <div className="py-20 text-center"><h1 className="font-heading text-xl text-foreground">Client setup not found</h1><Link to="/admin/client-setups" className="mt-3 inline-block text-sm text-primary">Back to client migrations</Link></div>;

  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/client-setups" className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Client migrations</Link>
        <div className="flex gap-2"><button onClick={() => save(summary.ready ? 'ready_to_invite' : 'draft')} disabled={saving || setup.status === 'claimed'} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-primary-foreground disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save setup'}</button></div>
      </div>

      <div className="mb-6 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-primary">Private client workspace</p><h1 className="font-heading text-3xl font-light text-foreground">{setup.business_name || `${setup.first_name || ''} ${setup.last_name || ''}`.trim() || setup.email}</h1><p className="mt-2 text-sm text-muted-foreground">{setup.email} · Draft work is never visible through public sharing.</p></div>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">{setup.status.replaceAll('_', ' ')}</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[
          ['Brand sections', `${summary.sections}/5`], ['Asset links', summary.assets], ['Starter tasks', summary.tasks], ['Service context', summary.services],
        ].map(([label, value]) => <div key={label} className="rounded-lg border border-white/10 bg-background/40 p-3"><p className="text-lg font-medium text-foreground">{value}</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p></div>)}</div>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{notice}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_290px]">
        <div className="space-y-6">
          <Section title="Client record" description="Internal setup details. Notes are never shown in the member portal.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name" value={setup.first_name} onChange={(value) => updateSetup('first_name', value)} placeholder="Client first name" />
              <Field label="Last name" value={setup.last_name} onChange={(value) => updateSetup('last_name', value)} placeholder="Client last name" />
              <div className="sm:col-span-2"><Field label="Business name" value={setup.business_name} onChange={(value) => updateSetup('business_name', value)} placeholder="Business or brand name" /></div>
              <div className="sm:col-span-2"><Field label="Internal notes" value={setup.notes} onChange={(value) => updateSetup('notes', value)} placeholder="Source links, history, or migration notes" multiline /></div>
            </div>
          </Section>

          <Section title="Core brand profile" description="Start with the details you already have. You can leave anything unknown blank.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Website" value={payload.personal.website} onChange={(value) => setSection('personal', 'website', value)} placeholder="https://client.com" />
              <Field label="Portal contact email" value={payload.personal.email} onChange={(value) => setSection('personal', 'email', value)} placeholder={setup.email} />
              <Field label="Brand voice" value={payload.personal.brand_voice} onChange={(value) => setSection('personal', 'brand_voice', value)} placeholder="Warm, direct, editorial…" />
              <Field label="Positioning" value={payload.personal.positioning} onChange={(value) => setSection('personal', 'positioning', value)} placeholder="Who they help and how" />
              <div className="sm:col-span-2"><Field label="Short bio" value={payload.personal.short_bio} onChange={(value) => setSection('personal', 'short_bio', value)} placeholder="A concise client or business introduction" multiline /></div>
            </div>
          </Section>

          <Section title="Brand system" description="Capture the current brand details so the portal is useful from day one.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Company tagline" value={payload.corporate.tagline} onChange={(value) => setSection('corporate', 'tagline', value)} placeholder="Tagline or core promise" />
              <Field label="Heading font" value={payload.guidelines.heading_font} onChange={(value) => setSection('guidelines', 'heading_font', value)} placeholder="e.g. Playfair Display" />
              <Field label="Body font" value={payload.guidelines.body_font} onChange={(value) => setSection('guidelines', 'body_font', value)} placeholder="e.g. Inter" />
              <Field label="Color usage notes" value={payload.guidelines.color_usage_notes} onChange={(value) => setSection('guidelines', 'color_usage_notes', value)} placeholder="Primary, secondary, accent usage" />
              <div>
                <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Brand color</span>
                <div className="flex gap-2"><input value={brandColor.name} onChange={(event) => setBrandColor((current) => ({ ...current, name: event.target.value }))} placeholder="Primary red" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" /><input type="color" value={brandColor.hex} onChange={(event) => setBrandColor((current) => ({ ...current, hex: event.target.value }))} className="h-10 w-12 rounded border border-border bg-background p-1" /></div>
                <button type="button" onClick={addBrandColor} className="mt-2 text-xs font-medium text-primary hover:opacity-80">Add color</button>
              </div>
              <div className="sm:col-span-2"><Field label="Voice and tone notes" value={payload.guidelines.tone_notes} onChange={(value) => setSection('guidelines', 'tone_notes', value)} placeholder="How this brand should sound" multiline /></div>
            </div>
            {Array.isArray(payload.corporate.colors) && payload.corporate.colors.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{payload.corporate.colors.map((color, index) => <button type="button" onClick={() => removeBrandColor(index)} key={`${color.name}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground" title="Remove color"><span className="h-3 w-3 rounded-full border border-black/20" style={{ backgroundColor: color.hex }} />{color.name} <span className="text-muted-foreground">{color.hex}</span></button>)}</div>}
          </Section>

          <Section title="Vision and media kit" description="Optional details to make the dedicated portal feel considered from day one.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Year-end goal" value={payload.bigPicture.end_of_year_goal} onChange={(value) => setSection('bigPicture', 'end_of_year_goal', value)} placeholder="What they are working toward" />
              <Field label="Annual revenue target" value={payload.bigPicture.annual_revenue} onChange={(value) => setSection('bigPicture', 'annual_revenue', value)} placeholder="Optional" />
              <div className="sm:col-span-2"><Field label="Media-kit long bio" value={payload.mediaKit.long_bio} onChange={(value) => setSection('mediaKit', 'long_bio', value)} placeholder="Longer biography or business background" multiline /></div>
            </div>
          </Section>

          <Section title="Linked brand assets" description="Paste links to the existing files. You can add several quickly, then save once.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Asset title" value={asset.title} onChange={(value) => setAsset((current) => ({ ...current, title: value }))} placeholder="Primary logo" />
              <Field label="File type" value={asset.file_type} onChange={(value) => setAsset((current) => ({ ...current, file_type: value }))} placeholder="PNG, PDF, Drive link…" />
              <div className="sm:col-span-2"><Field label="Asset URL" value={asset.file_url} onChange={(value) => setAsset((current) => ({ ...current, file_url: value }))} placeholder="https://…" /></div>
              <div className="sm:col-span-2"><Field label="Description" value={asset.description} onChange={(value) => setAsset((current) => ({ ...current, description: value }))} placeholder="How or when to use this asset" /></div>
            </div>
            <button onClick={() => addTo('assets', asset, () => setAsset({ title: '', description: '', file_url: '', file_type: '' }))} type="button" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-xs font-medium uppercase tracking-wider text-primary"><Plus className="h-4 w-4" /> Add asset link</button>
            {payload.assets.length > 0 && <div className="mt-4 space-y-2">{payload.assets.map((item, index) => <div key={`${item.title}-${index}`} className="flex items-center justify-between rounded-lg bg-background/70 px-3 py-2"><div className="min-w-0"><p className="truncate text-sm text-foreground">{item.title}</p><p className="truncate text-xs text-muted-foreground">{item.file_type || 'Link'} · {item.file_url || 'No URL yet'}</p></div><button type="button" onClick={() => remove('assets', index)} className="text-xs text-muted-foreground hover:text-red-300">Remove</button></div>)}</div>}
          </Section>

          <Section title="Starter content" description="Use this for welcome tasks, recommended next steps, and service context you already know.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Checklist item" value={task.title} onChange={(value) => setTask((current) => ({ ...current, title: value }))} placeholder="Review your brand portal" />
              <Field label="Due date (optional)" value={task.deadline_date} onChange={(value) => setTask((current) => ({ ...current, deadline_date: value }))} placeholder="YYYY-MM-DD" />
            </div>
            <button type="button" onClick={() => addTo('checklist', task, () => setTask({ title: '', deadline_date: '', assignee: '' }))} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-xs font-medium uppercase tracking-wider text-primary"><Plus className="h-4 w-4" /> Add checklist item</button>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Service context" value={service.service_type} onChange={(value) => setService((current) => ({ ...current, service_type: value }))} placeholder="Brand refresh" />
              <Field label="Service note" value={service.details} onChange={(value) => setService((current) => ({ ...current, details: value }))} placeholder="Scope or next step" />
            </div>
            <button type="button" onClick={() => addTo('serviceRequests', service, () => setService({ service_type: '', details: '' }))} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-xs font-medium uppercase tracking-wider text-primary"><Plus className="h-4 w-4" /> Add service context</button>
            {(payload.checklist.length > 0 || payload.serviceRequests.length > 0) && <div className="mt-4 space-y-2">{payload.checklist.map((item, index) => <div key={`task-${index}`} className="flex justify-between rounded-lg bg-background/70 px-3 py-2 text-sm text-foreground"><span>{item.title}</span><button type="button" onClick={() => remove('checklist', index)} className="text-xs text-muted-foreground hover:text-red-300">Remove</button></div>)}{payload.serviceRequests.map((item, index) => <div key={`service-${index}`} className="flex justify-between rounded-lg bg-background/70 px-3 py-2 text-sm text-foreground"><span>{item.service_type}</span><button type="button" onClick={() => remove('serviceRequests', index)} className="text-xs text-muted-foreground hover:text-red-300">Remove</button></div>)}</div>}
          </Section>

          <Section title="Structured brand-kit import" description="Optional low-credit shortcut: paste a JSON object with personal, corporate, guidelines, mediaKit, bigPicture, assets, checklist, and serviceRequests. It replaces the current draft payload after validation.">
            <textarea value={importText} onChange={(event) => setImportText(event.target.value)} rows={6} placeholder={'{ \"personal\": { \"short_bio\": \"…\" }, \"assets\": [{ \"title\": \"Logo\", \"file_url\": \"https://…\" }] }'} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-xs text-foreground outline-none focus:border-primary" />
            <button type="button" onClick={importPayload} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-xs font-medium uppercase tracking-wider text-primary"><FileUp className="h-4 w-4" /> Validate and import</button>
          </Section>
        </div>

        <aside className="space-y-5">
          <Section title="Portal review" description="A private readiness snapshot before this data is promoted to the client account.">
            <div className="space-y-3 text-sm">{[
              ['Brand data', summary.sections > 0, `${summary.sections} section${summary.sections === 1 ? '' : 's'} prepared`],
              ['Asset library', summary.assets > 0, `${summary.assets} linked asset${summary.assets === 1 ? '' : 's'}`],
              ['Starter path', summary.tasks > 0, `${summary.tasks} checklist item${summary.tasks === 1 ? '' : 's'}`],
            ].map(([label, done, value]) => <div key={label} className="flex items-start gap-2">{done ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />}<div><p className="text-foreground">{label}</p><p className="text-xs text-muted-foreground">{value}</p></div></div>)}</div>
            <div className="mt-4 rounded-lg bg-background/60 p-3"><p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Client-facing preview</p><p className="mt-1 font-heading text-lg text-foreground">{setup.business_name || setup.first_name || 'Client portal'}</p><p className="mt-1 text-xs text-muted-foreground">{payload.personal.short_bio || 'Brand assets, core guidance, and next steps will be ready here.'}</p></div>
          </Section>

          <Section title="Agency templates" description="Apply reusable generic content, then review the draft.">
            <select value={templateId} onChange={(event) => setTemplateId(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"><option value="">Choose a saved template</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select>
            <button type="button" onClick={applyTemplate} disabled={!templateId || setup.status === 'claimed'} className="mt-2 w-full rounded-lg border border-primary/30 px-3 py-2 text-xs font-medium uppercase tracking-wider text-primary disabled:opacity-50"><Layers3 className="mr-2 inline h-4 w-4" /> Apply template</button>
            <div className="mt-4 border-t border-border pt-4"><Field label="Save current generic starter content as" value={templateName} onChange={setTemplateName} placeholder="New-client foundation" /><button type="button" onClick={saveTemplate} disabled={!templateName.trim()} className="mt-2 w-full rounded-lg border border-primary/30 px-3 py-2 text-xs font-medium uppercase tracking-wider text-primary disabled:opacity-50"><Copy className="mr-2 inline h-4 w-4" /> Save agency template</button></div>
          </Section>

          <Section title="Activation" description="Only activate after the client has created their own account through the Clerk invitation.">
            {setup.status === 'claimed' ? <p className="rounded-lg bg-emerald-400/10 px-3 py-3 text-sm text-emerald-100">This private portal is active for the matching client account.</p> : <><button type="button" onClick={invite} disabled={!summary.ready} className="mb-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /> Invite when ready</button><button type="button" onClick={claim} disabled={setup.status !== 'invited'} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-primary disabled:opacity-50"><Sparkles className="h-4 w-4" /> Activate matching account</button><p className="mt-3 text-xs leading-relaxed text-muted-foreground">{summary.ready ? 'The invitation is available once you save this setup. Activation checks that the sign-in account has the same email as this private client setup.' : 'To invite, add at least one brand section and one linked asset.'}</p></>}
          </Section>
        </aside>
      </div>
    </div>
  );
}