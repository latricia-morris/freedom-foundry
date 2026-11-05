import { base44 } from '@/api/base44Client';

export const E = base44.entities;
export const STATUSES = ['Drafting', 'Brand Review', 'Approved', 'Live'];
export const today = () => new Date().toLocaleDateString('en-CA');
export const initials = (name) => (name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
export const fmtDate = (d) => (d ? new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date');
export const statusPatch = (status) => (status === 'Brand Review' ? { status, submitted_for_review_at: new Date().toISOString() } : { status });

export const addDays = (date, n) => {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-CA');
};
const diffDays = (a, b) => Math.round((new Date(`${a}T12:00:00`) - new Date(`${b}T12:00:00`)) / 86400000);

const blueprint = (k) => ({
  title: k.title, description: k.description, phase: k.phase, sort_order: k.sort_order,
  default_assignee_role: k.default_assignee_role, strategic_outcome: k.strategic_outcome,
  subtasks: (k.subtasks || []).map((s) => ({ ...s, is_completed: false })),
});

export async function saveAsTemplate(list, tasks) {
  const tpl = await E.IgniteList.create({ folder_id: list.folder_id, name: list.name, strategy_text: list.strategy_text, phases: list.phases, is_template: true });
  if (tasks.length) await E.IgniteTask.bulkCreate(tasks.map((k) => ({
    ...blueprint(k), list_id: tpl.id, status: 'Drafting', done: false,
    rolling_day_offset: k.due_date && list.event_date ? diffDays(k.due_date, list.event_date) : (k.rolling_day_offset ?? 0),
  })));
  return tpl;
}

export async function deployTemplate(tpl, tasks, { name, event_date, folder_id }) {
  const list = await E.IgniteList.create({ folder_id, name, strategy_text: tpl.strategy_text, phases: tpl.phases, event_date, template_source_id: tpl.id, is_template: false });
  if (tasks.length) await E.IgniteTask.bulkCreate(tasks.map((k) => ({
    ...blueprint(k), list_id: list.id, status: 'Drafting', done: false, rolling_day_offset: k.rolling_day_offset,
    due_date: event_date ? addDays(event_date, k.rolling_day_offset || 0) : undefined,
  })));
  return list;
}