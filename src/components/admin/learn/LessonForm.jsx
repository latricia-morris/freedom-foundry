import React, { useState } from 'react';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { Field, GHOST, StatusSelect } from '@/components/admin/learn/fields';
import { ImageField, MediaField, mediaPatch, mediaValue } from '@/components/admin/learn/MediaFields';
import ResourcesEditor from '@/components/admin/learn/ResourcesEditor';
import WorksheetEditor from '@/components/admin/learn/WorksheetEditor';

/** One lesson or chapter: text, video, audio, resources, embed and worksheet. Empty fields never show to learners. */
export default function LessonForm({ lesson, modules, saving, onSave, onDelete }) {
  const [d, setD] = useState(lesson);
  const set = (patch) => setD((prev) => ({ ...prev, ...patch }));

  const submit = () => {
    const questions = (d.worksheet?.questions || []).filter((q) => q.label.trim());
    onSave({
      title: d.title.trim(), subtitle: d.subtitle || '', body: d.body || '', status: d.status, module_id: d.module_id || '',
      thumbnail_url: d.thumbnail_url || '', embed_code: d.embed_code || '', resources: d.resources || [],
      worksheet: { ...(d.worksheet || {}), questions },
      ...mediaPatch('video', mediaValue(d, 'video')), ...mediaPatch('audio', mediaValue(d, 'audio')),
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <Field label="Title"><input className="admin-input" value={d.title || ''} onChange={(e) => set({ title: e.target.value })} /></Field>
        <Field label="Status"><StatusSelect value={d.status} onChange={(status) => set({ status })} /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Subtitle"><input className="admin-input" value={d.subtitle || ''} onChange={(e) => set({ subtitle: e.target.value })} /></Field>
        <Field label="Placed in">
          <select className="admin-input" value={d.module_id || ''} onChange={(e) => set({ module_id: e.target.value })}>
            <option value="">No module</option>
            {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </Field>
      </div>

      <MediaField label="Video" accept="video/*" placeholder="YouTube, Vimeo or video file link" value={mediaValue(d, 'video')} onChange={(v) => set(mediaPatch('video', v))} />
      <ImageField label="Video thumbnail" value={d.thumbnail_url} onChange={(thumbnail_url) => set({ thumbnail_url })} />
      <MediaField label="Audio recording" accept="audio/*" placeholder="Audio file link" value={mediaValue(d, 'audio')} onChange={(v) => set(mediaPatch('audio', v))} />

      <Field label="Text" hint="Blank lines start a new paragraph. Use # for a heading, > for a quote, - for a list and **bold**.">
        <textarea className="admin-input min-h-80 leading-relaxed" value={d.body || ''} onChange={(e) => set({ body: e.target.value })} />
      </Field>

      <ResourcesEditor items={d.resources} onChange={(resources) => set({ resources })} />
      <Field label="Embed code" hint="Paste an embed snippet or an https link.">
        <textarea className="admin-input min-h-20 font-mono text-xs" value={d.embed_code || ''} onChange={(e) => set({ embed_code: e.target.value })} />
      </Field>
      <WorksheetEditor value={d.worksheet} onChange={(worksheet) => set({ worksheet })} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <button type="button" onClick={submit} disabled={saving || !d.title?.trim()} className="btn-forge inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </button>
        <button type="button" onClick={onDelete} className={GHOST}><Trash2 className="h-3.5 w-3.5" /> Delete</button>
      </div>
    </div>
  );
}