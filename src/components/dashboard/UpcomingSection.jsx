import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import apiClient from '@/api/client';

const formatDue = (due) => {
  try {
    return format(parseISO(due), 'MMM d');
  } catch {
    return due;
  }
};

function buildUpcoming(tasks = [], plans = []) {
  const taskItems = tasks
    .filter((t) => t.status === 'pending' || t.status === 'in_progress')
    .map((t) => ({
      key: `task-${t.id}`,
      title: t.title,
      source: 'Checklist',
      due: t.deadline_date || null,
      to: '/brand-portal/checklist',
    }));
  const planItems = plans
    .filter(
      (p) =>
        p.status === 'active' &&
        ((p.action_items?.length || 0) > 0 || (p.milestones?.length || 0) > 0)
    )
    .map((p) => ({
      key: `ignite-${p.id}`,
      title: p.phase || 'Your Ignite OS plan',
      source: 'Ignite OS',
      due: null,
      to: '/brand-portal/ignite',
    }));
  return [...taskItems, ...planItems].sort((a, b) =>
    (a.due || '9999-12-31').localeCompare(b.due || '9999-12-31')
  );
}

/**
 * Upcoming — active checklist tasks and Ignite OS items for this member,
 * sorted by nearest deadline. Renders nothing when the member has none.
 */
export default function UpcomingSection({ limit = 4 }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiClient.entities.ChecklistTask.filter({}).catch(() => []),
      apiClient.entities.IgniteOS.filter({}).catch(() => []),
    ]).then(([tasks, plans]) => {
      if (active) setItems(buildUpcoming(tasks, plans).slice(0, limit));
    });
    return () => {
      active = false;
    };
  }, [limit]);

  if (!items || items.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-border/60">
      <div className="flex items-center gap-2 mb-3">
        <CalendarClock className="w-4 h-4" style={{ stroke: 'url(#warmGradient)' }} strokeWidth={1.5} />
        <span className="text-xs uppercase tracking-[0.25em] text-primary">Upcoming</span>
      </div>
      <div className="forged-well divide-y divide-border/40">
        {items.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className="flex items-center justify-between gap-3 px-4 py-3 group transition-colors hover:bg-background/40"
          >
            <div className="min-w-0">
              <p className="text-sm text-foreground truncate">{item.title}</p>
              <p className="text-xs mt-0.5 text-muted-foreground/80">
                {item.source}
                {item.due ? ` · due ${formatDue(item.due)}` : ''}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground/50 group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}