import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { Field } from './Bits';
import { E } from './igniteApi';

export default function FolderSettings({ folder }) {
  const qc = useQueryClient();
  const g = folder.guidelines || {};
  const [f, setF] = useState({ name: folder.name, core_substance: g.core_substance || '', customer_triggers: g.customer_triggers || '', style_constraints: g.style_constraints || '', banned: (g.banned_terms || []).join(', ') });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    await E.IgniteFolder.update(folder.id, { name: f.name, guidelines: { core_substance: f.core_substance, customer_triggers: f.customer_triggers, style_constraints: f.style_constraints, banned_terms: f.banned.split(',').map((s) => s.trim()).filter(Boolean) } });
    qc.invalidateQueries({ queryKey: ['ig-folders'] });
    toast({ title: 'Folder guidelines saved' });
  };
  return (
    <form className="ig-card" onSubmit={save} style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0, fontSize: 18 }}>Folder: Brand Guidelines</h2>
      <Field label="Folder name"><input className="ig-input" style={{ width: '100%' }} value={f.name} onChange={set('name')} /></Field>
      <Field label="Core substance"><textarea className="ig-input" rows={3} style={{ width: '100%' }} value={f.core_substance} onChange={set('core_substance')} /></Field>
      <Field label="Target customer triggers"><textarea className="ig-input" rows={3} style={{ width: '100%' }} value={f.customer_triggers} onChange={set('customer_triggers')} /></Field>
      <Field label="Language & style constraints"><textarea className="ig-input" rows={3} style={{ width: '100%' }} value={f.style_constraints} onChange={set('style_constraints')} /></Field>
      <Field label="Banned terms (comma separated)"><input className="ig-input" style={{ width: '100%' }} value={f.banned} onChange={set('banned')} /></Field>
      <div><button className="ig-btn ig-primary">Save guidelines</button></div>
    </form>
  );
}