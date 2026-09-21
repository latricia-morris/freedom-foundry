import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import SubscoresEditor from '@/components/admin/brandHealth/SubscoresEditor';
import ActionPlanEditor from '@/components/admin/brandHealth/ActionPlanEditor';
import MatrixEditor from '@/components/admin/brandHealth/MatrixEditor';
import EvidenceList from '@/components/admin/brandHealth/EvidenceList';
import NotesPanel from '@/components/admin/brandHealth/NotesPanel';
import CreditPanel from '@/components/admin/brandHealth/CreditPanel';
import { AUDIT_STATUSES, COMPONENT_LABELS, PUBLISHED_STATUS, STATUS_LABELS } from '@/lib/brandHealth';

const SECTION_TITLE = 'mb-3 font-heading text-xl text-foreground';

/** Consultant workspace for one audit: status, scoring, notes, matrix, publishing, and credit. */
export default function AdminBrandHealthAuditDetail() {
  const { auditId } = useParams();
  const [audit, setAudit] = useState(null);
  const [client, setClient] = useState(null);
  const [notes, setNotes] = useState([]);
  const [credit, setCredit] = useState(null);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [infoNote, setInfoNote] = useState('');
  const [summary, setSummary] = useState('');
  const { toast } = useToast();

  const load = () => {
    base44.entities.BrandHealthAudit.get(auditId)
      .then((a) => {
        setAudit(a);
        setInfoNote(a.info_requested_note || '');
        setSummary(a.consultant_summary || '');
        if (a.agency_client_id) {
          base44.entities.AgencyClient.get(a.agency_client_id).then(setClient).catch(() => setClient(null));
        }
      })
      .catch(() => setMissing(true));
    base44.entities.ConsultantNote.filter({ audit_id: auditId }, '-created_date', 300).then(setNotes).catch(() => setNotes([]));
    base44.entities.AuditCredit.filter({ audit_id: auditId }, '-created_date', 5)
      .then((rows) => setCredit((rows || [])[0] || null))
      .catch(() => setCredit(null));
  };
  useEffect(load, [auditId]);

  if (!audit && !missing) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (missing) {
    return (
      <div className="dashboard-card p-10 text-center">
        <p className="text-sm text-muted-foreground">This audit could not be found.</p>
        <Link to="/admin/brand-health" className="link-warm mt-3 inline-block">Back to Digital Brand Health</Link>
      </div>
    );
  }

  const updateAudit = async (patch) => {
    setBusy(true);
    try {
      const updated = await base44.entities.BrandHealthAudit.update(auditId, patch);
      setAudit(updated);
      toast({ title: 'Saved' });
    } catch (err) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const publishToggle = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (audit.status === PUBLISHED_STATUS) {
      updateAudit({ status: 'draft_complete', published_at: null });
    } else {
      updateAudit({
        status: PUBLISHED_STATUS,
        published_at: audit.published_at || today,
        reviewed_date: audit.reviewed_date || today,
      });
    }
  };

  const convertNoteToAction = async (note) => {
    const priorityMap = { critical: 'critical', high: 'high', medium: 'medium', opportunity: 'opportunity', observation: 'opportunity' };
    const plan = [
      ...(audit.action_plan || []),
      { title: note.title || 'Follow up', detail: note.body, priority: priorityMap[note.priority] || 'medium', status: 'open' },
    ];
    await base44.entities.BrandHealthAudit.update(auditId, { action_plan: plan });
    setAudit((prev) => ({ ...prev, action_plan: plan }));
  };

  const commitScore = (value) => {
    const next = value === '' ? null : Number(value);
    if (next !== (audit.score ?? null)) updateAudit({ score: next });
  };

  const isPublished = audit.status === PUBLISHED_STATUS;
  const isMatrix = audit.component === 'marketing_matrix';

  return (
    <div className="mx-auto max-w-5xl animate-fade-in pb-12">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/admin/brand-health" className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All audits
          </Link>
          <h1 className="font-heading text-3xl font-light text-foreground">
            {client?.company_name || 'Client'} <span className="text-muted-foreground">·</span>{' '}
            {COMPONENT_LABELS[audit.component] || audit.component}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {audit.package_tier ? `${audit.package_tier} · ` : ''}
            <span className="uppercase tracking-widest">{STATUS_LABELS[audit.status] || audit.status}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={publishToggle}
          disabled={busy}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50 ${
            isPublished ? 'border border-border text-muted-foreground transition-colors hover:text-foreground' : 'btn-forge border-transparent'
          }`}
        >
          {isPublished ? 'Unpublish report' : 'Publish to client'}
        </button>
      </div>

      <div className="dashboard-card mb-6 p-6">
        <h3 className={SECTION_TITLE}>Status &amp; Schedule</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
            Status
            <select className="admin-input" value={audit.status} onChange={(e) => updateAudit({ status: e.target.value })} disabled={busy}>
              {AUDIT_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
            Intake received
            <input className="admin-input" type="date" value={audit.intake_received_date || ''} onChange={(e) => updateAudit({ intake_received_date: e.target.value || null })} disabled={busy} />
          </label>
          <label className="space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
            Review / debrief date
            <input className="admin-input" type="date" value={audit.review_scheduled_date || ''} onChange={(e) => updateAudit({ review_scheduled_date: e.target.value || null })} disabled={busy} />
          </label>
          <label className="space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
            Reviewed date (client-facing)
            <input className="admin-input" type="date" value={audit.reviewed_date || ''} onChange={(e) => updateAudit({ reviewed_date: e.target.value || null })} disabled={busy} />
          </label>
        </div>
        <label className="mt-3 block space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
          Information requested (shown to the client on the status view)
          <textarea className="admin-input" rows={2} value={infoNote} onChange={(e) => setInfoNote(e.target.value)} onBlur={() => { if (infoNote !== (audit.info_requested_note || '')) updateAudit({ info_requested_note: infoNote || null }); }} placeholder="Optional — ask the client for clarification" />
        </label>
      </div>

      {!isMatrix ? (
        <div className="dashboard-card mb-6 p-6">
          <h3 className={SECTION_TITLE}>Scoring</h3>
          <label className="mb-4 block max-w-40 space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
            Overall score (0–100)
            <input
              className="admin-input"
              type="number"
              min="0"
              max="100"
              defaultValue={audit.score ?? ''}
              onBlur={(e) => commitScore(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commitScore(e.target.value); }
              }}
            />
          </label>
          <SubscoresEditor subscores={audit.subscores} onSave={(rows) => updateAudit({ subscores: rows })} />
        </div>
      ) : (
        <div className="dashboard-card mb-6 p-6">
          <h3 className={SECTION_TITLE}>Marketing Matrix</h3>
          <MatrixEditor audit={audit} onSave={(patch) => updateAudit(patch)} />
        </div>
      )}

      <div className="dashboard-card mb-6 p-6">
        <h3 className={SECTION_TITLE}>Client-Facing Summary</h3>
        <textarea
          className="admin-input"
          rows={4}
          placeholder="What the client reads at the top of their published report"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          onBlur={() => { if (summary !== (audit.consultant_summary || '')) updateAudit({ consultant_summary: summary || null }); }}
        />
      </div>

      <div className="dashboard-card mb-6 p-6">
        <h3 className={SECTION_TITLE}>Action Plan</h3>
        <ActionPlanEditor items={audit.action_plan} onSave={(rows) => updateAudit({ action_plan: rows })} />
      </div>

      <div className="dashboard-card mb-6 p-6">
        <h3 className={SECTION_TITLE}>Evidence &amp; Screenshots</h3>
        <EvidenceList items={audit.evidence} onSave={(rows) => updateAudit({ evidence: rows })} />
      </div>

      <div className="dashboard-card mb-6 p-6">
        <h3 className={SECTION_TITLE}>Consultant Notes</h3>
        <NotesPanel audit={audit} notes={notes} reload={load} onConvertToAction={convertNoteToAction} />
      </div>

      <div className="dashboard-card p-6">
        <h3 className={SECTION_TITLE}>Audit Credit</h3>
        <CreditPanel audit={audit} credit={credit} reload={load} />
      </div>
    </div>
  );
}