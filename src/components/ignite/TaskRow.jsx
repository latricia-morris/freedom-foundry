import React from 'react';
import { Check } from 'lucide-react';
import { Avatar, StatusSelect } from './Bits';
import { fmtDate, statusPatch, today } from './igniteApi';

export default function TaskRow({ task, onOpen, onUpdate }) {
  const overdue = task.due_date && task.due_date < today() && !task.done && task.status !== 'Live';
  return (
    <div className={`ig-row ${overdue ? 'overdue' : ''} ${task.done ? 'done' : ''}`}>
      <button className={`ig-check ${task.done ? 'on' : ''}`} aria-label="Mark complete" onClick={() => onUpdate(task.id, { done: !task.done })}>
        {task.done && <Check size={12} color="#fff" strokeWidth={3} />}
      </button>
      <button className="ig-title" onClick={() => onOpen(task.id)}>{task.title}</button>
      <Avatar name={task.assignee_name} />
      <span className="ig-due">{fmtDate(task.due_date)}</span>
      <StatusSelect value={task.status} onChange={(s) => onUpdate(task.id, statusPatch(s))} />
    </div>
  );
}