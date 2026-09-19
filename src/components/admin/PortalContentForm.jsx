import React, { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import apiClient from '@/api/client';
import { PORTAL_PAGES } from '@/lib/portalPages';
import DriveFolderPicker from '@/components/admin/DriveFolderPicker';

const TYPES = [
  { value: 'note', label: 'Note', hint: 'A short message shown on the page you pick.' },
  { value: 'file', label: 'File', hint: 'An uploaded file the client can download.' },
  { value: 'drive_link', label: 'Google Drive Folder', hint: 'A Drive folder the client can browse live in their portal.' },
  { value: 'custom_section', label: 'Custom Section', hint: 'A titled section with your own content — add new deliverables over time.' },
];

export default function PortalContentForm({ client, item, onSaved, onCancel }) {
  const [form, setForm] = useState(() => ({
    type: item?.type || 'note',
    title: item?.title || '',
    body: item?.body || '',
    file_url: item?.file_url || '',
    drive_folder_id: item?.drive_folder_id || '',
    drive_folder_name: item?.drive_folder_name || '',
    target_page: item?.target_page || 'overview',
    order: item?.order ?? 0,
    visible: item?.visible ?? true,
  }));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await apiClient.integrations.Core.UploadPublicFile({ file });
      const url = res?.file_url || res?.url;
      if (!url) throw new Error('The file could not be uploaded.');
      setForm((previous) => ({
        ...previous,
        file_url: url,
        title: previous.title || file.name,
      }));
    } catch (err) {
      setError(err?.message || 'The file could not be uploaded.');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) { setError('Add a title.'); return; }
    if (form.type === 'file' && !form.file_url) { setError('Upload a file first.'); return; }
    if (form.type === 'drive_link' && !form.drive_folder_id) { setError('Pick a Google Drive folder.'); return; }
    setSaving(true);
    setError('');
    const payload = {
      user_id: client.id,
      type: form.type,
      title: form.title.trim(),
      body: form.type === 'note' || form.type === 'custom_section' ? form.body : '',
      file_url: form.type === 'file' ? form.file_url : '',
      target_page: form.target_page,
      order: Number(form.order) || 0,
      visible: form.visible,
      drive_folder_id: form.type === 'drive_link' ? form.drive_folder_id : '',
      drive_folder_name: form.type === 'drive_link' ? form.drive_folder_name : '',
    };
    try {
      if (item) {
        await apiClient.entities.PortalContent.update(item.id, payload);
      } else {
        await apiClient.entities.PortalContent.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(err?.message || 'The item could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const activeType = TYPES.find((t) => t.value === form.type);

  return (
    <form onSubmit={submit} className="dashboard-card border border-primary/30 p-6 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Type</span>
          <select value={form.type} onChange={(e) => set('type', e.target.value)} className="admin-input">
            {TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
          <span className="block text-[11px] text-muted-foreground mt-1.5">{activeType?.hint}</span>
        </label>
        <label className="block">
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Show on page</span>
          <select value={form.target_page} onChange={(e) => set('target_page', e.target.value)} className="admin-input">
            {PORTAL_PAGES.map((page) => <option key={page.key} value={page.key}>{page.label}</option>)}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Title</span>
        <input value={form.title} onChange={(e) => set('title', e.target.value)} className="admin-input" placeholder="e.g. Logo usage notes from our launch guide" />
      </label>

      {(form.type === 'note' || form.type === 'custom_section') && (
        <label className="block">
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Content</span>
          <textarea rows={5} value={form.body} onChange={(e) => set('body', e.target.value)} className="admin-input resize-y" placeholder="Write the note or section content the client will see..." />
        </label>
      )}

      {form.type === 'file' && (
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">File</span>
          {form.file_url ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5">
              <span className="text-sm text-foreground truncate">{form.title}</span>
              <button type="button" onClick={() => set('file_url', '')} className="text-xs uppercase tracking-wider text-[#8a482d]">Replace</button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-4 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {uploading ? 'Uploading...' : 'Choose a file to upload'}
              <input type="file" className="hidden" onChange={handleFile} />
            </label>
          )}
        </div>
      )}

      {form.type === 'drive_link' && (
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Drive folder</span>
          <DriveFolderPicker
            folderId={form.drive_folder_id}
            folderName={form.drive_folder_name}
            onChange={(folder) => setForm((previous) => ({
              ...previous,
              drive_folder_id: folder.id,
              drive_folder_name: folder.name,
              title: previous.title || folder.name,
            }))}
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 items-end">
        <label className="block">
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Display order</span>
          <input type="number" value={form.order} onChange={(e) => set('order', e.target.value)} className="admin-input" />
        </label>
        <label className="flex items-center gap-3 pb-2 cursor-pointer">
          <input type="checkbox" checked={form.visible} onChange={(e) => set('visible', e.target.checked)} className="w-4 h-4 accent-[#d9622c]" />
          <span className="text-sm text-foreground">Visible to the client</span>
        </label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="rounded-md px-4 py-2.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving || uploading} className="btn-forge inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-xs uppercase tracking-widest disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {item ? 'Save Changes' : 'Add to Portal'}
        </button>
      </div>
    </form>
  );
}