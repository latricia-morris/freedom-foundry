import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { COMPONENT_LABELS, STATUS_LABELS, fmtDate } from '@/lib/brandHealth';

/**
 * Client-facing audit status view: only the facts the spec allows — package
 * name, status, dates, consultant contact, and any information-requested
 * message. No draft scores, findings, notes, or evidence.
 */
export default function AuditStatusPanel({ audit, onClose }) {
  return (
    <div className="dashboard-card mx-auto w-full max-w-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Audit Status</p>
          <h3 className="mt-1 font-heading text-2xl text-foreground">
            {COMPONENT_LABELS[audit.component] || 'Audit'}
            {audit.package_tier ? <span className="text-muted-foreground"> · {audit.package_tier}</span> : null}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close audit status"
          className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="text-foreground">{STATUS_LABELS[audit.status] || audit.status}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Intake received</dt>
          <dd className="text-foreground">{audit.intake_received_date ? fmtDate(audit.intake_received_date) : '—'}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Scheduled review / debrief</dt>
          <dd className="text-foreground">{audit.review_scheduled_date ? fmtDate(audit.review_scheduled_date) : 'To be scheduled'}</dd>
        </div>
      </dl>

      {audit.info_requested_note ? (
        <div className="mt-4 rounded-sm border border-primary/30 bg-primary/5 px-4 py-3">
          <p className="text-xs uppercase tracking-widest text-primary">Information requested</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{audit.info_requested_note}</p>
        </div>
      ) : null}

      <div className="mt-5 border-t border-border/40 pt-4">
        <p className="text-sm text-muted-foreground">Questions about your audit?</p>
        <Link to="/support" className="link-warm mt-1 inline-block">Contact your consultant →</Link>
      </div>
    </div>
  );
}