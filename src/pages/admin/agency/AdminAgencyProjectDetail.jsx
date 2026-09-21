import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, PackageCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  DELIVERABLE_REVIEW_LABELS, formatUsd, INSTALLMENT_STATUS_LABELS,
  PAYMENT_OPS_LABELS, RELEASE_RULE_LABELS, TASK_STATUS_LABELS,
} from '@/lib/agency';

const PROJECT_STATUSES = ['pending_activation', 'onboarding', 'active', 'waiting_on_client', 'internal_review', 'client_review', 'delivery_hold', 'completed', 'archived', 'on_hold'];
const HEALTH = ['on_track', 'at_risk', 'delayed', 'waiting_on_client', 'on_hold'];
const REVIEW_STATUSES = ['not_started', 'in_production', 'internal_review', 'ready_for_client_review', 'client_reviewing', 'revisions_requested', 'client_approved', 'awaiting_payment_release', 'released'];

export default function AdminAgencyProjectDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = () => {
    base44.entities.Project.get(id).then((p) => {
      setProject(p);
      if (p?.client_id) base44.entities.AgencyClient.get(p.client_id).then(setClient).catch(() => {});
    }).catch(() => setProject(null));
    base44.entities.ProjectTask.filter({ project_id: id }, 'sort_order', 300).then(setTasks).catch(() => setTasks([]));
    base44.entities.Deliverable.filter({ project_id: id }, 'created_date', 200).then(setDeliverables).catch(() => setDeliverables([]));
    base44.entities.PaymentInstallment.filter({ project_id: id }, 'sort_order', 20).then(setInstallments).catch(() => setInstallments([]));
  };
  useEffect(load, [id]);

  if (!project) {
    return <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>;
  }

  const updateProject = async (patch) => {
    await base44.entities.Project.update(project.id, patch).catch((e) => toast({ title: 'Update failed', description: e.message, variant: 'destructive' }));
    load();
  };

  const updateTask = async (taskId, patch) => {
    await base44.entities.ProjectTask.update(taskId, patch).catch(() => {});
    load();
  };

  const updateDeliverable = async (deliverable, patch) => {
    await base44.entities.Deliverable.update(deliverable.id, patch).catch(() => {});
    load();
  };

  const releaseDeliverable = async (deliverable) => {
    if (!window.confirm(`Release "${deliverable.title}"? Final assets become client-visible and the release is logged.`)) return;
    setBusy(true);
    try {
      await base44.entities.Deliverable.update(deliverable.id, {
        review_status: 'released',
        release_eligibility_status: 'released',
        final_release_status: 'released',
      });
      await base44.entities.AuditLog.create({
        actor_role: 'admin', entity_type: 'Deliverable', entity_id: deliverable.id,
        action: 'deliverable_released', source: 'ui',
        before_value: { final_release_status: deliverable.final_release_status },
        after_value: { final_release_status: 'released' },
      });
      toast({ title: 'Released', description: 'The client can now access the final assets.' });
      load();
    } catch (e) {
      toast({ title: 'Release failed', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const phases = [...new Set(tasks.map((t) => t.phase || 'General'))];

  return (
    <div className="mx-auto max-w-5xl animate-fade-in pb-12">
      <Link to="/admin/agency/projects" className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>

      <div className="dashboard-card mb-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-light text-foreground">{project.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{client?.company_name} · {PAYMENT_OPS_LABELS[project.payment_operational_status] || project.payment_operational_status}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select className="admin-input w-auto py-1.5 text-xs" value={project.status} onChange={(e) => updateProject({ status: e.target.value })}>
              {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <select className="admin-input w-auto py-1.5 text-xs" value={project.client_project_health} onChange={(e) => updateProject({ client_project_health: e.target.value })}>
              {HEALTH.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 grid gap-4 text-xs text-muted-foreground/80 sm:grid-cols-4">
          <div><p className="uppercase tracking-widest text-muted-foreground/60">Client start</p><p className="mt-1 text-sm text-foreground">{project.client_start_date || '—'}</p></div>
          <div><p className="uppercase tracking-widest text-muted-foreground/60">Client target</p><p className="mt-1 text-sm text-foreground">{project.client_target_completion_date || '—'}</p></div>
          <div><p className="uppercase tracking-widest text-muted-foreground/60">Internal target</p><p className="mt-1 text-sm text-foreground">{project.internal_target_completion_date || '—'}</p></div>
          <div><p className="uppercase tracking-widest text-muted-foreground/60">Activated</p><p className="mt-1 text-sm text-foreground">{project.activated_at ? new Date(project.activated_at).toLocaleDateString() : '—'}</p></div>
        </div>
      </div>

      {installments.length > 0 && (
        <div className="dashboard-card mb-6 overflow-x-auto p-0">
          <div className="border-b border-border/50 p-5"><h3 className="font-heading text-xl text-foreground">Payment schedule</h3></div>
          <table className="w-full">
            <tbody>
              {installments.map((i) => (
                <tr key={i.id} className="border-t border-border/30">
                  <td className="px-5 py-3 text-sm text-foreground">{i.description}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{formatUsd(i.amount_cents)}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{INSTALLMENT_STATUS_LABELS[i.status] || i.status}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground/70">{i.verification_status}{i.paid_at ? ` · ${new Date(i.paid_at).toLocaleDateString()}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {phases.map((phase) => (
        <div key={phase} className="dashboard-card mb-6 p-6">
          <h3 className="mb-4 font-heading text-xl text-foreground">{phase}</h3>
          <div className="space-y-2">
            {tasks.filter((t) => (t.phase || 'General') === phase).map((task) => (
              <div key={task.id} className="flex flex-wrap items-center gap-3 rounded-md border border-border/70 bg-background/40 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground/70">
                    Internal ready: {task.internal_ready_date || '—'} · Client due: {task.client_due_date || '—'}
                  </p>
                </div>
                <select
                  className="admin-input w-auto py-1.5 text-xs"
                  value={task.status}
                  onChange={(e) => updateTask(task.id, { status: e.target.value })}
                >
                  {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}

      {deliverables.length > 0 && (
        <div className="dashboard-card mb-6 p-6">
          <h3 className="mb-4 font-heading text-xl text-foreground">Deliverables & release control</h3>
          <div className="space-y-3">
            {deliverables.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-md border border-border/70 bg-background/40 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{d.title}</p>
                  <p className="text-xs text-muted-foreground/70">
                    {RELEASE_RULE_LABELS[d.release_rule] || d.release_rule} ·{' '}
                    {d.final_release_status === 'released' ? 'Released' : (DELIVERABLE_REVIEW_LABELS[d.review_status] || d.review_status)}
                  </p>
                </div>
                {d.final_release_status !== 'released' ? (
                  <>
                    <select
                      className="admin-input w-auto py-1.5 text-xs"
                      value={d.review_status}
                      onChange={(e) => updateDeliverable(d, { review_status: e.target.value })}
                    >
                      {REVIEW_STATUSES.map((s) => <option key={s} value={s}>{DELIVERABLE_REVIEW_LABELS[s] || s}</option>)}
                    </select>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => releaseDeliverable(d)}
                      className="btn-forge inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest disabled:opacity-50"
                    >
                      <PackageCheck className="h-3.5 w-3.5" /> Release
                    </button>
                  </>
                ) : (
                  <span className="rounded-sm border border-emerald-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-400">Released</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}