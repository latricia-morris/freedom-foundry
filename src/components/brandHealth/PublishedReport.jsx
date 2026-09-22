import React from 'react';
import { ExternalLink } from 'lucide-react';
import { COMPONENT_LABELS, fmtDate } from '@/lib/brandHealth';
import HeroScore from './HeroScore';
import DashCard from './DashCard';
import GradientActions from './GradientActions';
import { CreditNote, FindingsList } from './FindingsAndPlan';

/**
 * Published client report for a scored audit (Website Discoverability or
 * Conversion Readiness): big gradient score hero, consultant summary with
 * subscores, findings, and the action plan elevated inside the forged
 * gradient container.
 */
export default function PublishedReport({ audit, findings, credit }) {
  const score = typeof audit.score === 'number' ? audit.score : null;
  const actionItems = audit.action_plan || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <HeroScore
          label={`${COMPONENT_LABELS[audit.component] || 'Review'} Score`}
          value={score}
          pill={`Reviewed ${fmtDate(audit.reviewed_date)}`}
        />
        <DashCard className="flex flex-col justify-center">
          <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Consultant Summary</h3>
          <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
            {audit.consultant_summary || 'Your consultant will walk you through this report in detail.'}
          </p>
          {audit.show_subscores !== false && (audit.subscores || []).length > 0 && (
            <div className="mt-6 space-y-3 border-t border-border/40 pt-5">
              {audit.subscores.map((s, i) => (
                <div key={i}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{s.label}</span>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {typeof s.score === 'number' ? `${s.score}/100` : '—'}
                    </span>
                  </div>
                  <div className="well-track h-2 w-full">
                    <div
                      className="molten-bar h-full rounded-full"
                      style={{ width: `${Math.max(0, Math.min(100, s.score || 0))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashCard>
      </div>

      <DashCard>
        <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Consultant Findings</h3>
        <div className="mt-5">
          <FindingsList findings={findings} />
        </div>
      </DashCard>

      {actionItems.length > 0 ? (
        <GradientActions id="bh-actions" title="Your Action Plan" subtitle="Your approved next steps, in order." items={actionItems} />
      ) : (
        <DashCard id="bh-actions">
          <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Your Action Plan</h3>
          <p className="mt-3 text-sm text-muted-foreground/70">Your action plan will appear here once it is approved.</p>
        </DashCard>
      )}

      {(audit.evidence || []).length > 0 && (
        <DashCard>
          <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Supporting Materials</h3>
          <div className="mt-5 flex flex-wrap gap-3">
            {(audit.evidence || []).map((e, i) => (
              <a key={i} href={e.url} target="_blank" rel="noreferrer" className="link-warm inline-flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> {e.title}
              </a>
            ))}
          </div>
        </DashCard>
      )}

      <CreditNote credit={credit} />
    </div>
  );
}