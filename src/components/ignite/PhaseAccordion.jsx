import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import TaskRow from './TaskRow';

export default function PhaseAccordion({ phase, tasks, onOpen, onUpdate }) {
  const [open, setOpen] = useState(true);
  const inReview = tasks.filter((t) => t.status === 'Brand Review').length;
  return (
    <section className="ig-phase">
      <button className="ig-phasehead" onClick={() => setOpen(!open)} aria-expanded={open}>
        <ChevronDown size={16} className={`ig-chev ${open ? '' : 'closed'}`} />
        {phase}
        {inReview > 0 && <span className="ig-dot" title={`${inReview} in Brand Review`} />}
        <span className="ig-count">{tasks.length}</span>
      </button>
      <div className="ig-rows" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div>
          {tasks.map((t) => <TaskRow key={t.id} task={t} onOpen={onOpen} onUpdate={onUpdate} />)}
          {!tasks.length && <p className="ig-muted" style={{ padding: '10px 14px', margin: 0, borderTop: '1px solid var(--ff-line)' }}>No tasks in this phase.</p>}
        </div>
      </div>
    </section>
  );
}