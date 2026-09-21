import React from 'react';
import { fmtDate } from '@/lib/brandHealth';
import { ActionPlanList, CreditNote, FindingsList } from './FindingsAndPlan';

/**
 * Published Marketing Matrix strategy view: consultant-defined channel fit
 * and customer journey alignment, presented read-only.
 */
export default function MatrixView({ audit, findings, credit }) {
  return (
    <div className="space-y-6">
      <div className="dashboard-card p-6">
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-heading text-xl text-foreground">Market Alignment Strategy</h3>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Complete · Reviewed {fmtDate(audit.reviewed_date)}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {audit.matrix_strategy_note || 'Your consultant will walk you through this strategy in detail.'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="dashboard-card p-6">
          <h3 className="mb-4 font-heading text-xl text-foreground">Channel Fit</h3>
          {(audit.matrix_channels || []).length === 0 ? (
            <p className="text-sm text-muted-foreground/70">Channels will appear here once the matrix is published.</p>
          ) : (
            <div className="space-y-3">
              {audit.matrix_channels.map((c, i) => (
                <div key={i} className="rounded-sm border border-border/60 bg-background/40 px-4 py-3">
                  <p className="text-sm text-foreground">{c.channel}</p>
                  {c.fit_note ? <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{c.fit_note}</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="dashboard-card p-6">
          <h3 className="mb-4 font-heading text-xl text-foreground">Customer Journey</h3>
          {(audit.matrix_stages || []).length === 0 ? (
            <p className="text-sm text-muted-foreground/70">Journey stages will appear here once the matrix is published.</p>
          ) : (
            <div className="space-y-3">
              {audit.matrix_stages.map((s, i) => (
                <div key={i} className="rounded-sm border border-border/60 bg-background/40 px-4 py-3">
                  <p className="text-sm text-foreground">
                    <span className="mr-2 text-xs uppercase tracking-widest text-primary">Stage {i + 1}</span>
                    {s.stage}
                  </p>
                  {s.note ? <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.note}</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {(findings || []).length > 0 && (
        <div className="dashboard-card p-6">
          <h3 className="mb-4 font-heading text-xl text-foreground">Consultant Findings</h3>
          <FindingsList findings={findings} />
        </div>
      )}

      {(audit.action_plan || []).length > 0 && (
        <div className="dashboard-card p-6">
          <h3 className="mb-4 font-heading text-xl text-foreground">Your Action Plan</h3>
          <ActionPlanList items={audit.action_plan} />
        </div>
      )}

      <CreditNote credit={credit} />
    </div>
  );
}