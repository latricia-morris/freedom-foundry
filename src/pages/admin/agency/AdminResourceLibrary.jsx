import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = ['SOPs & Process', 'Templates & Boilerplate', 'Reference & Research', 'Tools & Software', 'Contracts & Legal', 'Other'];
const EMPTY = { title: '', category: 'Other', description: '', link_url: '' };

export default function AdminResourceLibrary() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [openingId, setOpeningId] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const load = () => {
    base44.entities.InternalResource.filter({}, '-created_date', 300)
      .then((rows) => { setResources(rows || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  const log = (action, id) => base44.entities.AuditLog.create({
    actor_role: 'admin', entity_type: 'InternalResource', entity_id: id, action, source: 'ui',
  }).catch(() => {});

  const filtered = useMemo(() => resources.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q
      || r.title?.toLowerCase().includes(q)
      || r.description?.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }), [resources, search, categoryFilter]);

  const add = async () => {
    if (!draft.title.trim()) {
      setError('Give the resource a title.');
      return;
    }
    if (!file && !draft.link_url.trim()) {
      setError('Attach a file or paste a link.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      let file_uri = null;
      let file_name = null;
      if (file) {
        const uploaded = await base44.integrations.Core.UploadPrivateFile({ file });
        file_uri = uploaded.file_uri;
        file_name = file.name;
      }
      const created = await base44.entities.InternalResource.create({
        title: draft.title,
        category: draft.category,
        description: draft.description,
        link_url: draft.link_url || '',
        file_uri,
        file_name,
      });
      await log('resource_created', created.id);
      setDraft(EMPTY);
      setFile(null);
      setToast('Resource added');
      load();
    } catch (e) {
      setError(e.message || 'Could not save the resource.');
    } finally {
      setBusy(false);
    }
  };

  const open = async (r) => {
    setOpeningId(r.id);
    try {
      if (r.link_url) {
        window.open(r.link_url, '_blank', 'noopener');
      } else if (r.file_uri) {
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: r.file_uri, expires_in: 300 });
        window.open(signed_url, '_blank', 'noopener');
      }
    } catch (e) {
      setToast(e.message || 'Could not open the resource.');
    } finally {
      setOpeningId(null);
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete "${r.title}"? This cannot be undone.`)) return;
    await base44.entities.InternalResource.delete(r.id).catch(() => {});
    await log('resource_deleted', r.id);
    setToast('Resource deleted');
    load();
  };

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <h1 className="mb-8 font-heading text-4xl font-light text-foreground">Resource <span className="molten-text italic">Library</span></h1>

      <div className="dashboard-card mb-8 p-6">
        <h3 className="mb-4 font-heading text-2xl text-foreground">Add a resource</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Title</span>
            <input className="admin-input py-2 text-sm" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Category</span>
            <select className="admin-input py-2 text-sm" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Link (optional)</span>
            <input className="admin-input py-2 text-sm" type="url" placeholder="https://" value={draft.link_url} onChange={(e) => setDraft({ ...draft, link_url: e.target.value })} />
          </label>
          <label className="block sm:col-span-2 lg:col-span-2">
            <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Description</span>
            <input className="admin-input py-2 text-sm" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">File (optional)</span>
            <input
              type="file"
              className="w-full text-xs text-muted-foreground file:mr-3 file:rounded-sm file:border file:border-border file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:text-muted-foreground"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <button type="button" onClick={add} disabled={busy} className="btn-forge mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
          <Plus className="h-4 w-4" /> {busy ? 'Saving…' : 'Save resource'}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          className="admin-input max-w-xs py-2 text-sm"
          type="search"
          placeholder="Search resources"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="admin-input max-w-56 py-2 text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-xs text-muted-foreground/70">{filtered.length} of {resources.length}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No resources match your filters.</p>
      ) : (
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/60">
                {['Title', 'Category', 'Source', 'Added', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border/30 hover:bg-accent/40">
                  <td className="px-5 py-3">
                    <p className="text-sm text-foreground">{r.title}</p>
                    {r.description && <p className="max-w-md truncate text-xs text-muted-foreground/70">{r.description}</p>}
                  </td>
                  <td className="px-5 py-3"><span className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{r.category}</span></td>
                  <td className="px-5 py-3 text-xs text-muted-foreground/70">
                    {r.link_url && r.file_uri ? 'Link + file' : r.link_url ? 'Link' : r.file_name || 'File'}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground/70">{new Date(r.created_date).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => open(r)}
                        disabled={openingId === r.id}
                        aria-label={`Open ${r.title}`}
                        className="rounded-sm p-1 text-muted-foreground/60 transition-colors hover:text-primary disabled:opacity-40"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(r)}
                        aria-label={`Delete ${r.title}`}
                        className="rounded-sm p-1 text-muted-foreground/60 transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-sm border border-border bg-card px-4 py-2 text-sm text-foreground shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}