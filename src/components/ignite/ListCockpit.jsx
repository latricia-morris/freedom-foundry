import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import PhaseAccordion from './PhaseAccordion';
import { StrategyRibbon } from './Bits';
import { useTasks, useTaskUpdate } from './useIgnite';
import { E, saveAsTemplate } from './igniteApi';

export default function ListCockpit({ list, onOpen }) {
  const qc = useQueryClient();
  const { data: tasks = [], isPending } = useTasks(list.id);
  const update = useTaskUpdate();
  const phases = [...new Set([...(list.phases || []), ...tasks.map((t) => t.phase || 'Unphased')])];
  const [title, setTitle] = useState('');
  const [outcome, setOutcome] = useState('');
  const [phase, setPhase] = useState(phases[0] || 'Unphased');
  const [saving, setSaving] = useState(false);

  const add = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await E.IgniteTask.create({ list_id: list.id, title: title.trim(), phase, strategic_outcome: outcome.trim(), status: 'Drafting', done: false, sort_order: tasks.length });
    setTitle(''); setOutcome('');
    qc.invalidateQueries({ queryKey: ['ig-tasks', list.id] });
  };
  const save = async () => {
    setSaving(true);
    await saveAsTemplate(list, tasks);
    setSaving(false);
    qc.invalidateQueries({ queryKey: ['ig-lists', 'templates'] });
    toast({ title: 'Saved as master template', description: list.name });
  };

  return (
    <>
      <StrategyRibbon text={list.strategy_text} />
      <form onSubmit={add} style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="ig-input" style={{ flex: '2 1 200px' }} placeholder="New task title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="ig-input" style={{ flex: '1 1 140px' }} placeholder="Strategic outcome" value={outcome} onChange={(e) => setOutcome(e.target.value)} />
        <select className="ig-select" value={phase} onChange={(e) => setPhase(e.target.value)}>{phases.map((p) => <option key={p}>{p}</option>)}</select>
        <button className="ig-btn">Add task</button>
        <button type="button" className="ig-btn ig-primary" onClick={save} disabled={saving || !tasks.length}>{saving ? 'Saving…' : 'Save Template'}</button>
      </form>
      {isPending ? <p className="ig-muted">Loading tasks…</p> : phases.map((p) => (
        <PhaseAccordion key={p} phase={p} tasks={tasks.filter((t) => (t.phase || 'Unphased') === p)} onOpen={onOpen} onUpdate={update} />
      ))}
    </>
  );
}