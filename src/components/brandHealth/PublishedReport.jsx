import React from 'react';
import { ExternalLink } from 'lucide-react';
import { COMPONENT_LABELS, PUBLISHED_STATUS, fmtDate } from '@/lib/brandHealth';
import { ActionPlanList, CreditNote, FindingsList } from './FindingsAndPlan';

/**
 * Published client report for a scored audit (Website Discoverability or
 * Conversion Readiness): the consultant's score, summary, findings, action
 * plan, public evidence, and audit-credit language.
 */
export default function PublishedReport({ audit, findings, credit }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="dashboard-card flex flex-col items-center justify-center p-8 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{COMPONENT_LABELS[audit.component]} Score</p>
          <p className="molten-text font-heading text-7xl font-light leading-none">
            {typeof audit.score === 'number' ? audit.score : '—'}
            <span className="text-2xl text-muted-foreground" style={{ WebkitTextFillColor: 'hsl(var(--muted-foreground))' }}>/100</span>
          </p>
          <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">Complete · Reviewed {fmtDate(audit.reviewed_date)}</p>
        </div>
        <div className="dashboard-card p-6">
          <h3 className="mb-3 font-heading text-xl text-foreground">Consultant Summary</h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {audit.consultant_summary || 'Your consultant will walk you through this report in detail.'}
          </p>
          {(audit.subscores || []).length > 0 && (
            <div className="mt-5 space-y-3 border-t border-border/40 pt-4">
              {audit.subscores.map((s, i) => (
                <div key={i}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-sm text-foreground">{s.label}</span>
                    <span className="text-xs text-muted-foreground">{typeof s.score === 'number' ? `${s.score}/100` : '—'}</span>
                  </div>
                  <div className="well-track h-2 w-full">
                    <div className="molten-bar h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, s.score || 0))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card p-6">
        <h3 className="mb-4 font-heading text-xl text-foreground">Consultant Findings</h3>
        <FindingsList findings={findings} />
      </div>

      <div className="dashboard-card p-6">
        <h3 className="mb-4 font-heading text-xl text-foreground">Your Action Plan</h3>
        <ActionPlanList items={audit.action_plan} />
      </div>

      {(audit.evidence || []).length > 0 && (
        <div className="dashboard-card p-6">
          <h3 className="mb-4 font-heading text-xl text-foreground">Supporting Materials</h3>
          <div className="flex flex-wrap gap-3">
            {audit.evidence.map((e, i) => (
              <a key={i} href={e.url} target="_blank" rel="noreferrer" className="link-warm inline-flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> {e.title}
              </a>
            ))}
          </div>
        </div>
      )}

      <CreditNote credit={credit} />
    </div>
  );
}