import React from 'react';
import {
  DIRECTION_LABELS,
  EVIDENCE_LABELS,
  EFFORT_LABELS,
  GOAL_TYPE_LABELS,
  RECOMMENDATION_BASIS_LABELS,
  TARGET_STATUS_LABELS,
} from '@/lib/matrix';

const LABEL = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-primary';
const H = 'font-heading text-lg text-foreground';
const P = 'text-sm leading-relaxed text-muted-foreground';

function EvidenceChip({ label }) {
  if (!label) return null;
  return (
    <span className="inline-flex rounded-[3px] border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {EVIDENCE_LABELS[label] || label}
    </span>
  );
}

function hasResults(channel) {
  return (channel.results || []).some((r) => r && String(r.label || '').trim() && String(r.value ?? '').trim() !== '');
}

function resultLine(r) {
  const value = [String(r.value).trim(), String(r.unit || '').trim()].filter(Boolean).join(' ');
  return { label: r.label, value, period: r.period, evidence: r.evidence, attribution: r.attribution };
}

/**
 * Expanded channel detail: why this channel, the current picture with
 * evidence labels, the recommended commitment, goal and tracking, and one
 * next action. Only sections with content render.
 */
export default function MatrixChannelDetail({ channel }) {
  const eff = channel.effort || {};
  const goal = channel.goal || {};
  const basis = RECOMMENDATION_BASIS_LABELS[channel.recommendation_basis];
  const objectiveLabel =
    channel.measurement_objective === 'other'
      ? channel.measurement_objective_label
      : {
          qualified_demand: 'Qualified demand',
          relationships: 'Relationships and partnerships',
          authority: 'Authority',
          revenue: 'Speaking revenue',
        }[channel.measurement_objective];

  return (
    <div className="grid gap-8 border-t border-border/70 p-5 pt-5 lg:grid-cols-2">
      <div className="space-y-8">
        <div>
          <h4 className={H}>Why this channel</h4>
          <p className={`mt-2 ${P}`}>{eff.rationale}</p>
        </div>

        <div>
          <h4 className={H}>Current picture</h4>
          <div className="mt-2 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Current effort:</span>
              <span className="text-foreground">{EFFORT_LABELS[eff.current] || 'Not established'}</span>
              <EvidenceChip label={eff.evidence} />
            </div>
            {eff.monthly_hours ? (
              <p className="text-sm text-muted-foreground">
                Current commitment: {eff.monthly_hours}
                {eff.evidence ? ` · ${EVIDENCE_LABELS[eff.evidence] || ''}` : ''}
              </p>
            ) : null}
            {eff.monthly_spend ? (
              <p className="text-sm text-muted-foreground">
                Current spend: {eff.monthly_spend}
                {eff.evidence ? ` · ${EVIDENCE_LABELS[eff.evidence] || ''}` : ''}
              </p>
            ) : null}
            {hasResults(channel) ? (
              <ul className="space-y-2">
                {(channel.results || []).filter(resultLine).map((r, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium text-foreground">{r.label}:</span>{' '}
                    <span className="text-foreground">{r.value}</span>
                    <span className="text-muted-foreground">
                      {r.period ? ` · Period: ${r.period}` : ''}
                      {r.evidence ? ` · Source: ${EVIDENCE_LABELS[r.evidence] || r.evidence}` : ''}
                    </span>
                    {r.attribution ? (
                      <span className="ml-1 text-xs text-muted-foreground/80">
                        ({r.attribution === 'originated' ? 'originated through this channel' : r.attribution === 'influenced' ? 'influenced by this channel' : 'attribution uncertain'})
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={P}>
                Results are not currently tracked. This recommendation is based on strategic fit, not demonstrated
                performance.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h4 className={H}>Recommended commitment</h4>
          <p className={`mt-2 ${P}`}>{eff.commitment}</p>
          {eff.capacity_note ? <p className={`mt-2 ${P}`}>Capacity: {eff.capacity_note}</p> : null}
          {basis ? (
            <p className="mt-2 text-sm">
              <span className={LABEL}>Recommendation basis</span>
              <span className={`mt-1 block ${P}`}>{basis}</span>
            </p>
          ) : null}
        </div>

        {goal && (goal.text || goal.tracking_method || goal.baseline || goal.target) ? (
          <div>
            <h4 className={H}>Goal and tracking</h4>
            <div className="mt-2 space-y-2 text-sm">
              {goal.type ? <p className="text-xs uppercase tracking-wider text-muted-foreground">{GOAL_TYPE_LABELS[goal.type] || ''}</p> : null}
              {goal.text ? <p className="text-foreground">{goal.text}</p> : null}
              {goal.baseline ? (
                <p className={P}><span className={LABEL}>Baseline</span><span className="mt-1 block">{goal.baseline}</span></p>
              ) : null}
              {goal.target ? (
                <p className={P}>
                  <span className={LABEL}>Target</span>
                  <span className="mt-1 block text-foreground">
                    {goal.target}
                    {goal.target_status === 'proposed' ? ' (proposed, awaiting confirmation)' : ''}
                    {goal.target_status && goal.target_status !== 'proposed' ? ` (${TARGET_STATUS_LABELS[goal.target_status] || ''})` : ''}
                  </span>
                </p>
              ) : null}
              {goal.timeframe ? <p className={P}><span className={LABEL}>Timeframe</span><span className="mt-1 block">{goal.timeframe}</span></p> : null}
              {goal.tracking_method ? <p className={P}><span className={LABEL}>Tracking method</span><span className="mt-1 block">{goal.tracking_method}</span></p> : null}
              {goal.next_review_date ? <p className={P}><span className={LABEL}>Review date</span><span className="mt-1 block">{goal.next_review_date}</span></p> : null}
            </div>
          </div>
        ) : null}

        {objectiveLabel ? (
          <p className={P}><span className={LABEL}>Tracking objective</span><span className="mt-1 block">{objectiveLabel}</span></p>
        ) : null}
        {channel.qualified_conversation_definition ? (
          <p className={P}>
            <span className={LABEL}>Qualified conversation, as used in this report</span>
            <span className={`mt-1 block ${P}`}>{channel.qualified_conversation_definition}</span>
          </p>
        ) : null}
      </div>

      {channel.next_action ? (
        <div className="lg:col-span-2">
          <h4 className={H}>Next action</h4>
          <p className="mt-2 border-l-2 border-primary/60 pl-3 text-sm text-foreground">{channel.next_action}</p>
        </div>
      ) : null}
    </div>
  );
}