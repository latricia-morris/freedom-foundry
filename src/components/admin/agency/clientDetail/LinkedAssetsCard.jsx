import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { resolvePortalUser } from '@/lib/clientPortalData';
import { resolveLinkMeta } from '@/lib/assetLinks';

/** Reads a link's own title and preview image. */
async function canvaMeta(url) {
  return resolveLinkMeta(url);
}

/** Admin manager for a client's external asset links (Canva and other URLs). */
export default function LinkedAssetsCard({ client }) {
  const [target, setTarget] = useState(() => client.primary_contact_email ? { email: client.primary_contact_email.trim().toLowerCase() } : null);
  const [links, setLinks] = useState(null);
  const [form, setForm] = useState({ title: '', url: '' });
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    let active = true;
    // The contact email is sufficient to attach assets immediately; account
    // lookup must not block saving or claim that the contact email is missing.
    const fallback = client.primary_contact_email ? { email: client.primary_contact_email.trim().toLowerCase() } : null;
    setTarget(fallback);
    resolvePortalUser(client).catch(() => null).then((user) => {
      if (active) setTarget(user || fallback);
    });
    return () => { active = false; };
  }, [client.id, client.primary_contact_email]);

  useEffect(() => {
    if (!target?.id && !target?.email) return;
    let active = true;
    base44.entities.ClientAssetLink.filter(
      { $or: [...(target.id ? [{ user_id: target.id }] : []), ...(target.email ? [{ user_email: target.email.toLowerCase() }] : [])] },
      '-created_date',
      100
    )
      .then((rows) => active && setLinks(rows || []))
      .catch(() => active && setLinks([]));
    return () => { active = false; };
  }, [target?.id, target?.email]);

  // Canva links: prefill the title and preview image from the design's own
  // metadata so neither has to be typed manually.
  useEffect(() => {
    const url = form.url.trim();
    if (!url || !/canva\./i.test(url)) return undefined;
    const timer = setTimeout(async () => {
      const data = await canvaMeta(url);
      if (data.title || data.image) {
        setMeta(data);
        setForm((prev) => (prev.title.trim() ? prev : { ...prev, title: data.title || '' }));
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form.url]);

  const resetForm = () => { setForm({ title: '', url: '' }); setEditingId(null); setError(''); };

  const handleSave = async () => {
    if (!form.url.trim()) { setError('A URL is required.'); return; }
    if (!target) { setError('This client needs a contact email before links can be attached.'); return; }
    let title = form.title.trim();
    let preview_url = meta?.image || '';
    if (!title || !preview_url) {
      const data = await canvaMeta(form.url.trim());
      if (!title) title = data.title || '';
      if (!preview_url) preview_url = data.image || '';
    }
    setBusy(true); setError('');
    try {
      if (editingId && editingId !== '__new__') {
        await base44.entities.ClientAssetLink.update(editingId, { title, url: form.url.trim(), preview_url });
      } else {
        const created = await base44.entities.ClientAssetLink.create({
          ...(target.id ? { user_id: target.id } : {}),
          user_email: (target.email || '').toLowerCase(),
          title,
          preview_url,
          url: form.url.trim(),
          added_by: 'admin',
        });
        setLinks((prev) => [created, ...(prev || [])]);
      }
      resetForm();
    } catch (e) {
      setError('Could not save the link. Please try again.');
    }
    setBusy(false);
  };

  const handleDelete = async (id) => {
    setLinks((prev) => (prev || []).filter((l) => l.id !== id));
    await base44.entities.ClientAssetLink.delete(id).catch(() => {});
  };

  return (
    <div className="dashboard-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-lg text-foreground">Linked assets</h3>
          <span className="rounded-sm border border-border px-2 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
            Canva &amp; other links
          </span>
        </div>
      </div>

      {editingId || form.title || form.url ? ( // '__new__' sentinel still opens the form
        <div className="mb-4 rounded-sm border border-border bg-background/40 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="admin-input"
              placeholder="Title (e.g. Social Media Kit)"
              value={form.title}
              onChange={(e) => { setError(''); setForm({ ...form, title: e.target.value }); }}
            />
            <input
              className="admin-input"
              placeholder="https://www.canva.com/design/..."
              value={form.url}
              onChange={(e) => { setError(''); setForm({ ...form, url: e.target.value }); }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Canva links fill the title in automatically from the design's name — edit it if you prefer something else.</p>
          {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className="btn-forge rounded-sm px-4 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {busy ? 'Saving…' : editingId && editingId !== '__new__' ? 'Save changes' : 'Save link'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 rounded-sm border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => { setEditingId('__new__'); setForm({ title: '', url: '' }); }}
          className="mb-4 inline-flex items-center gap-2 rounded-sm border border-primary/40 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-primary/10"
        >
          <Plus className="h-4 w-4" /> Add link
        </button>
      )}

      {links === null ? (
        <p className="text-sm text-muted-foreground">Loading&hellip;</p>
      ) : links.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No linked assets yet. Add a Canva design or any other URL the client should reach from their Brand Assets page.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {links.map((link) => (
            <div key={link.id} className="flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{link.title}</p>
                <p className="truncate text-xs text-muted-foreground">{link.url}</p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-warm px-2 py-2"
                  aria-label="Open link"
                >
                  Open
                </a>
                <button
                  type="button"
                  onClick={() => { setEditingId(link.id); setForm({ title: link.title, url: link.url }); }}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Edit link"
                >
                  <Pencil className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(link.id)}
                  className="rounded-lg p-2 text-destructive/80 transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete link"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}