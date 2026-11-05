import React, { useState } from 'react';
import { EVENT_TYPES } from '@/lib/crm';
import { E, useClientOptions } from '@/components/crm/useCrm';
import { Field, Select, FormActions } from '@/components/crm/CrmForm';

const local = (iso) => (iso ? new Date(iso).toLocaleString('sv').slice(0, 16).replace(' ', 'T') : '');

export default function EventForm({ event, onDone }) {
  const { data: clients = [] } = useClientOptions();
  const [f, setF] = useState({ title: '', type: 'meeting', location: '', video_link: '', description: '', agency_client_id: '', ...event, start: local(event.start_time), end: local(event.end_time) });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { title: f.title, type: f.type, start_time: new Date(f.start).toISOString(), end_time: f.end ? new Date(f.end).toISOString() : undefined, location: f.location, video_link: f.video_link, description: f.description, agency_client_id: f.agency_client_id || undefined };
    if (f.id) await E.CalendarEvent.update(f.id, data); else await E.CalendarEvent.create(data);
    setSaving(false);
    onDone();
  };
  const remove = async () => { if (window.confirm('Delete this event?')) { await E.CalendarEvent.delete(f.id); onDone(); } };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title"><input required className="admin-input" value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Brand review call" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Starts"><input type="datetime-local" required className="admin-input" value={f.start} onChange={(e) => set('start', e.target.value)} /></Field>
        <Field label="Ends"><input type="datetime-local" className="admin-input" value={f.end} onChange={(e) => set('end', e.target.value)} /></Field>
        <Field label="Type"><Select value={f.type} onChange={(v) => set('type', v)} options={EVENT_TYPES} /></Field>
        <Field label="Client"><Select value={f.agency_client_id} onChange={(v) => set('agency_client_id', v)} placeholder="None" options={clients.map((c) => ({ value: c.id, label: c.company_name }))} /></Field>
        <Field label="Location"><input className="admin-input" value={f.location || ''} onChange={(e) => set('location', e.target.value)} /></Field>
        <Field label="Video link"><input type="url" className="admin-input" value={f.video_link || ''} onChange={(e) => set('video_link', e.target.value)} /></Field>
      </div>
      <Field label="Notes"><textarea rows={2} className="admin-input" value={f.description || ''} onChange={(e) => set('description', e.target.value)} /></Field>
      <FormActions saving={saving} onDelete={f.id ? remove : null} />
    </form>
  );
}