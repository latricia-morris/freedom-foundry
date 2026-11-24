import React from 'react';
import AuditSections from './AuditSections';
import { formatDate } from '@/lib/visibility';

/**
 * The consolidated Brand Health Index, rendered inside the scorecard: every
 * section the consolidation carries, in its own words, in presentation order.
 * The sections themselves hold the scope, the evidence boundaries, each index
 * point, and the priority plan, so nothing is paraphrased here.
 */
export default function ConsolidatedAssessment({ report }) {
  if (!report) return null;
  return (
    <div className="space-y-5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
        Consolidated assessment · {formatDate(report.report_date)}
      </p>
      <AuditSections report={report} />
    </div>
  );
}