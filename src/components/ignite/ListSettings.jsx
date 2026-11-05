import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { Field } from './Bits';
import { E } from './igniteApi';

export default function ListSettings({ list }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ name: list.name, strategy_text: list.strategy_text || '', event_date: list.event_date || '', phases: (list.phases || []).join('\n') });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    await E.IgniteList.update(list.id, { name: f.name, strategy_text: f.strategy_text, event_date: f.event_date || undefined, phases: f.phases.split('\n').map((s) => s.trim()).filter(Boolean) });
    qc.invalidateQueries({ queryKey: ['ig-lists'] });
    toast({ title: 'List strategy saved' });
  };
  return (
    <form className="ig-card" onSubmit={save} style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0, fontSize: 18 }}>List: Strategy Anchor</h2>
      <Field label="List name"><input className="ig-input" style={{ width: '100%' }} value={f.name} onChange={set('name')} /></Field>
      <Field label="Strategy anchor (inherited by every task)"><textarea className="ig-input" rows={4} style={{ width: '100%' }} value={f.strategy_text} onChange={set('strategy_text')} /></Field>
      <Field label="Event target date"><input type="date" className="ig-input" value={f.event_date} onChange={set('event_date')} /></Field>
      <Field label="Phases (one per line)"><textarea className="ig-input" rows={3} style={{ width: '100%' }} value={f.phases} onChange={set('phases')} /></Field>
      <div><button className="ig-btn ig-primary">Save list</button></div>
    </form>
  );
}