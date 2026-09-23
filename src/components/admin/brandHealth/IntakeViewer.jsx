import React from 'react';
import { INTAKE_FIELDS } from '@/lib/brandHealthIntake';
import { fmtDate } from '@/lib/brandHealth';

/**
 * Consultant-side intake viewer: a locked, read-only rendering of exactly
 * what the client submitted, using the same field definitions as the client
 * form so the two can never drift.
 */
export default function IntakeViewer({ audit }) {
  const definition = INTAKE_FIELDS[audit.component];
  if (!definition) return null;

  const intake = audit.intake_data;
  const rows = [...definition.required, ...(definition.baseline || []), ...definition.optional];

  return (
    <div>
      {intake ? (
        <>
          <dl className="grid gap-4 sm:grid-cols-2">
            {rows.map((field) => (
              <div key={field.key}>
                <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{field.label}</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-foreground">{intake[field.key] || '—'}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 border-t border-border/40 pt-3 text-xs text-muted-foreground">
            Submitted {fmtDate(audit.intake_received_date)} · Read-only — the client cannot edit after submission.
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          The client has not submitted their intake yet. They will be prompted to complete it on their
          Digital Brand Health page.
        </p>
      )}
    </div>
  );
}