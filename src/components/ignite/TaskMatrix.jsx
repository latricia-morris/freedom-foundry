import React, { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Field, StatusSelect } from './Bits';
import { useTaskUpdate, useUsers } from './useIgnite';
import { statusPatch } from './igniteApi';

export default function TaskMatrix({ task }) {
  const update = useTaskUpdate();
  const { data: users = [] } = useUsers();
  const [busy, setBusy] = useState(false);
  const assign = (e) => {
    const u = users.find((x) => x.email === e.target.value);
    update(task.id, { assignee_email: u?.email || '', assignee_name: u?.full_name || u?.email || '' });
  };
  const submit = async () => {
    setBusy(true);
    await update(task.id, statusPatch('Brand Review'));
    setBusy(false);
    toast({ title: 'Submitted for review', description: 'Sent to the Brand Review queue.' });
  };
  const inReview = task.status === 'Brand Review';
  return (
    <div className="ig-right">
      <Field label="Assignee">
        <select className="ig-select" style={{ width: '100%' }} value={task.assignee_email || ''} onChange={assign}>
          <option value="">Unassigned</option>
          {users.map((u) => <option key={u.id} value={u.email}>{u.full_name || u.email}</option>)}
        </select>
      </Field>
      {task.default_assignee_role && <p className="ig-muted" style={{ margin: '-8px 0 0', fontSize: 12 }}>Role: {task.default_assignee_role}</p>}
      <Field label="Due date">
        <input type="date" className="ig-input" style={{ width: '100%' }} value={task.due_date || ''} onChange={(e) => update(task.id, { due_date: e.target.value })} />
      </Field>
      <Field label="Status"><StatusSelect style={{ width: '100%' }} value={task.status} onChange={(s) => update(task.id, statusPatch(s))} /></Field>
      <Field label="Strategic outcome"><div className="ig-locked">{task.strategic_outcome || 'Not set'}</div></Field>
      <button className="ig-btn ig-primary" style={{ marginTop: 'auto', padding: 12 }} disabled={busy || inReview} onClick={submit}>
        {inReview ? 'In Brand Review' : busy ? 'Submitting…' : 'Submit for Review'}
      </button>
    </div>
  );
}