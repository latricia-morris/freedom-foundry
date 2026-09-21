import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import EditableCell from './EditableCell';
import { PAYMENT_OPS_LABELS } from '@/lib/agency';

const PROJECT_STATUSES = ['pending_activation', 'onboarding', 'active', 'waiting_on_client', 'internal_review', 'client_review', 'delivery_hold', 'completed', 'archived', 'on_hold'];
const HEALTH = ['on_track', 'at_risk', 'delayed', 'waiting_on_client', 'on_hold'];

const cellInput = 'w-full bg-transparent px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/60';

/**
 * ClickUp-style project table: compact rows, every cell editable in place,
 * and a permanent add row at the bottom — type a name, Tab across columns,
 * Enter saves.
 */
export default function ProjectsTable({
  projects, clients, draft, aiDraft, busy,
  onDraftChange, onCommitDraft, onCellCommit, selectedIds, onToggleRow, allSelected, onToggleAll,
}) {
  const clientOptions = [{ value: '', label: '— client —' }, ...clients.map((c) => ({ value: c.id, label: c.company_name }))];
  const statusOptions = PROJECT_STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, ' ') }));
  const healthOptions = HEALTH.map((h) => ({ value: h, label: h.replace(/_/g, ' ') }));

  const enterCommit = (e) => { if (e.key === 'Enter') { e.preventDefault(); onCommitDraft(); } };

  return (
    <div className="dashboard-card overflow-x-auto">
      <table className="w-full min-w-[880px]">
        <thead>
          <tr className="bg-muted/60">
            <th className="w-10 px-3 py-2.5">
              <input type="checkbox" className="h-4 w-4 accent-[#d9622c]" checked={allSelected} onChange={onToggleAll} aria-label="Select all projects" />
            </th>
            {['Project', 'Client', 'Status', 'Health', 'Payment state', 'Due date', 'Manager'].map((h) => (
              <th key={h} className="px-3 py-2.5 text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 && (
            <tr>
              <td colSpan={8} className="px-5 py-8 text-center text-sm text-muted-foreground">
                No projects yet. Add your first below — type a name, pick a client, press Enter.
              </td>
            </tr>
          )}
          {projects.map((p) => (
            <tr key={p.id} className={`border-t border-border/30 hover:bg-accent/40 ${selectedIds.has(p.id) ? 'bg-primary/5' : ''}`}>
              <td className="px-3 py-2">
                <input type="checkbox" className="h-4 w-4 accent-[#d9622c]" checked={selectedIds.has(p.id)} onChange={() => onToggleRow(p.id)} aria-label={`Select ${p.name}`} />
              </td>
              <td className="min-w-52 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <Link to={`/admin/agency/projects/${p.id}`} className="rounded-sm p-0.5 text-muted-foreground/60 transition-colors hover:text-primary" aria-label={`Open ${p.name}`}>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <EditableCell value={p.name} placeholder="Untitled" onCommit={(v) => onCellCommit(p, 'name', v)} className="text-sm text-foreground" />
                  </div>
                </div>
              </td>
              <td className="min-w-40 px-3 py-2">
                <EditableCell type="select" value={p.client_id} options={clientOptions} onCommit={(v) => onCellCommit(p, 'client_id', v)} className="text-sm text-muted-foreground" />
              </td>
              <td className="min-w-32 px-3 py-2">
                <EditableCell type="select" value={p.status} options={statusOptions} onCommit={(v) => onCellCommit(p, 'status', v)} className="text-[10px] uppercase tracking-wider text-muted-foreground" />
              </td>
              <td className="min-w-28 px-3 py-2">
                <EditableCell type="select" value={p.client_project_health} options={healthOptions} onCommit={(v) => onCellCommit(p, 'client_project_health', v)} className="text-[10px] uppercase tracking-wider text-muted-foreground" />
              </td>
              <td className="px-3 py-2 text-xs text-muted-foreground">{PAYMENT_OPS_LABELS[p.payment_operational_status] || (p.payment_operational_status || '—').replace(/_/g, ' ')}</td>
              <td className="min-w-32 px-3 py-2">
                <EditableCell type="date" value={p.client_target_completion_date} onCommit={(v) => onCellCommit(p, 'client_target_completion_date', v)} />
              </td>
              <td className="min-w-36 px-3 py-2">
                <EditableCell value={p.assigned_project_manager} placeholder="Unassigned" onCommit={(v) => onCellCommit(p, 'assigned_project_manager', v)} className="text-xs text-muted-foreground" />
              </td>
            </tr>
          ))}
          <tr className={`border-t border-border/30 ${aiDraft ? 'bg-primary/10' : 'bg-muted/20'}`}>
            <td className="px-3 py-2 text-center">
              {aiDraft ? <Sparkles className="mx-auto h-3.5 w-3.5 text-primary" /> : <span className="text-muted-foreground/50">+</span>}
            </td>
            <td className="px-2 py-1.5">
              <input className={cellInput} placeholder="+ Add project" value={draft.name} disabled={busy} onChange={(e) => onDraftChange({ name: e.target.value })} onKeyDown={enterCommit} />
            </td>
            <td className="px-2 py-1.5">
              <select className={cellInput} value={draft.client_id} disabled={busy} onChange={(e) => onDraftChange({ client_id: e.target.value })} onKeyDown={enterCommit}>
                <option value="">— client —</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </td>
            <td className="px-2 py-1.5">
              <select className={cellInput} value={draft.status} disabled={busy} onChange={(e) => onDraftChange({ status: e.target.value })} onKeyDown={enterCommit}>
                {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </td>
            <td className="px-2 py-1.5 text-xs text-muted-foreground/60">{(draft.client_project_health || 'on_track').replace(/_/g, ' ')}</td>
            <td className="px-2 py-1.5 text-xs text-muted-foreground/60">{aiDraft ? 'AI draft — Enter saves' : '—'}</td>
            <td className="px-2 py-1.5">
              <input type="date" className={cellInput} value={draft.client_target_completion_date} disabled={busy} onChange={(e) => onDraftChange({ client_target_completion_date: e.target.value })} onKeyDown={enterCommit} />
            </td>
            <td className="px-2 py-1.5">
              <input className={cellInput} placeholder="Manager" value={draft.assigned_project_manager} disabled={busy} onChange={(e) => onDraftChange({ assigned_project_manager: e.target.value })} onKeyDown={enterCommit} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}