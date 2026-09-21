import React from 'react';
import { ExternalLink } from 'lucide-react';
import { fmtDate } from '@/lib/brandHealth';
import { CONSULTANT_PRIORITIES, JOURNEY_STAGES, JOURNEY_STATUS_LABELS, PRIORITY_COLORS, STRATEGIC_ROLES } from '@/lib/matrix';
import MatrixMapChart from '@/components/matrix/MatrixMapChart';
import { ActionPlanList, CreditNote, FindingsList } from './FindingsAndPlan';

const roleLabel = (key) => (STRATEGIC_ROLES.find((r) => r.key === key) || {}).label || key;
const priorityLabel = (key) => (CONSULTANT_PRIORITIES.find((p) => p.key === key) || {}).label || key;
const stageLabel = (key) => (JOURNEY_STAGES.find((s) => s.key === key) || {}).label || key;

const STATUS_STYLES = {
  strong: 'border-emerald-500/40 text-emerald-400',
  partial: 'border-primary/40 text-primary',
  missing: 'border-destructive/40 text-destructive',
  not_applicable: 'border-border text-muted-foreground',
};

/**
 * Published Marketing Matrix report — strictly read-only and strictly
 * consultant-approved: the index and component scores appear only if the
 * consultant switched them on; the map shows only channels marked
 * client-facing; journey stages and leverage opportunities carry only
 * consultant-written copy. Internal scores, weights, and formulas never render.
 */
export default function MatrixView({ audit, findings, credit, matrixChannels = [], leverage = [] }) {
  const channels = matrixChannels.filter((c) => c.audit_id === audit.id);
  const opportunities = leverage.filter((o) => o.audit_id === audit.id);
  const scoreEntries = Object.entries(audit.matrix_scores_public || {});
  const journeyStages = (audit.journey_public || []).map((s) => ({
    ...s,
    channels: channels.filter((c) => c.journey_stage === s.stage),
  }));

  const dots = channels.map((c) => ({
    id: c.channel_name,
    label: c.channel_name,
    x: c.x,
    y: c.y,
    opportunity: c.opportunity,
    priority: c.consultant_priority,
  }));

  return (
    <div className="space-y-6">
      <div className="dashboard-card p-6">
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-heading text-xl text-foreground">Your Marketing Strategy</h3>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Complete · Reviewed {fmtDate(audit.reviewed_date)}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {audit.consultant_summary || 'Your consultant will walk you through your marketing strategy in detail.'}
        </p>
      </div>

      {(audit.mai != null || scoreEntries.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          {audit.mai != null && (
            <div className="dashboard-card flex flex-col items-center justify-center p-8 text-center">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{audit.mai_label || 'Market Alignment Index'}</p>
              <p className="molten-text font-heading text-7xl font-light leading-none">{audit.mai}</p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                How well your marketing mix fits your business, market, and customer journey right now.
              </p>
            </div>
          )}
          {scoreEntries.length > 0 && (
            <div className="dashboard-card p-6">
              <h3 className="mb-4 font-heading text-lg text-foreground">What the Measures Cover</h3>
              <div className="space-y-4">
                {scoreEntries.map(([key, s]) => (
                  <div key={key}>
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <p className="text-sm text-foreground">{s.client_label || key.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">{s.score}/100</p>
                    </div>
                    <div className="well-track h-2 overflow-hidden">
                      <div className="molten-bar h-full" style={{ width: `${Math.max(0, Math.min(100, s.score))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="dashboard-card p-6">
        <h3 className="mb-1 font-heading text-xl text-foreground">Your Channel Map</h3>
        <p className="mb-4 text-xs text-muted-foreground/70">
          Each channel your consultant reviewed, positioned by how strongly it is executing today and how much it moves buyers.
        </p>
        <MatrixMapChart dots={dots} editable={false} />
      </div>

      {channels.length > 0 && (
        <div className="dashboard-card p-6">
          <h3 className="mb-4 font-heading text-xl text-foreground">Your Channels</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {channels.map((c) => (
              <div key={c.channel_name} className="rounded-sm border border-border/60 bg-background/40 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[c.consultant_priority] || PRIORITY_COLORS.not_applicable }} />
                  <p className="text-sm text-foreground">{c.channel_name}</p>
                </div>
                {(c.strategic_role || c.journey_stage) && (
                  <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground/70">
                    {[c.strategic_role ? roleLabel(c.strategic_role) : null, c.journey_stage ? stageLabel(c.journey_stage) : null].filter(Boolean).join(' · ')}
                  </p>
                )}
                {c.description && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{c.description}</p>}
                {c.client_notes && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{c.client_notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {journeyStages.length > 0 && (
        <div className="dashboard-card p-6">
          <h3 className="mb-1 font-heading text-xl text-foreground">Customer Journey Coverage</h3>
          <p className="mb-4 text-xs text-muted-foreground/70">How consistently your business supports buyers at each step of the journey.</p>
          <div className="space-y-3">
            {journeyStages.map((s) => (
              <div key={s.stage} className="rounded-sm border border-border/60 bg-background/40 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-foreground">{stageLabel(s.stage)}</p>
                  <div className="flex items-center gap-2">
                    {s.channels.length > 0 && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                        {s.channels.map((c) => c.channel_name).join(' · ')}
                      </span>
                    )}
                    {s.status && (
                      <span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_STYLES[s.status] || STATUS_STYLES.not_applicable}`}>
                        {JOURNEY_STATUS_LABELS[s.status] || s.status}
                      </span>
                    )}
                  </div>
                </div>
                {typeof s.coverage === 'number' && (
                  <div className="well-track mt-2 h-1.5 overflow-hidden">
                    <div className="molten-bar h-full" style={{ width: `${Math.max(0, Math.min(100, s.coverage))}%` }} />
                  </div>
                )}
                {s.client_notes && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.client_notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {opportunities.length > 0 && (
        <div className="dashboard-card p-6">
          <h3 className="mb-1 font-heading text-xl text-foreground">Growth Opportunities</h3>
          <p className="mb-4 text-xs text-muted-foreground/70">Consultant-selected opportunities specific to your business.</p>
          <div className="space-y-3">
            {opportunities.map((o) => (
              <div key={o.title} className="rounded-sm border border-border/60 bg-background/40 px-4 py-3">
                <p className="text-sm text-foreground">{o.title}</p>
                {o.client_summary && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{o.client_summary}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

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

      {(audit.evidence || []).length > 0 && (
        <div className="dashboard-card p-6">
          <h3 className="mb-4 font-heading text-xl text-foreground">Supporting Materials</h3>
          <ul className="space-y-2">
            {(audit.evidence || []).map((e, i) => (
              <li key={i}>
                <a href={e.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-primary">
                  <ExternalLink className="h-3.5 w-3.5 text-primary" /> {e.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <CreditNote credit={credit} />
    </div>
  );
}