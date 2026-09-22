import React from 'react';
import { ExternalLink } from 'lucide-react';
import { fmtDate } from '@/lib/brandHealth';
import { CONSULTANT_PRIORITIES, JOURNEY_STAGES, JOURNEY_STATUS_LABELS, PRIORITY_COLORS, STRATEGIC_ROLES } from '@/lib/matrix';
import MatrixMapChart from '@/components/matrix/MatrixMapChart';
import HeroScore from './HeroScore';
import DashCard from './DashCard';
import GradientActions from './GradientActions';
import { CreditNote, FindingsList } from './FindingsAndPlan';

const roleLabel = (key) => (STRATEGIC_ROLES.find((r) => r.key === key) || {}).label || key;
const stageLabel = (key) => (JOURNEY_STAGES.find((s) => s.key === key) || {}).label || key;

const STATUS_STYLES = {
  strong: 'border-emerald-500/40 text-emerald-400',
  partial: 'border-primary/40 text-primary',
  missing: 'border-destructive/40 text-destructive',
  not_applicable: 'border-border text-muted-foreground',
};

/**
 * Published Marketing Matrix report — read-only, consultant-approved, and
 * presented as an open dashboard: big gradient alignment-index hero,
 * strategy summary with measures, channel map, channels, journey coverage,
 * growth opportunities, and the action plan elevated in the gradient
 * container. Internal scores, weights, and formulas never render.
 */
export default function MatrixView({ audit, findings, credit, matrixChannels = [], leverage = [] }) {
  const channels = matrixChannels.filter((c) => c.audit_id === audit.id);
  const opportunities = leverage.filter((o) => o.audit_id === audit.id);
  const scoreEntries = Object.entries(audit.matrix_scores_public || {});
  const journeyStages = (audit.journey_public || []).map((s) => ({
    ...s,
    channels: channels.filter((c) => c.journey_stage === s.stage),
  }));
  const actionItems = audit.action_plan || [];

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
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {typeof audit.mai === 'number' && (
          <HeroScore
            label={audit.mai_label || 'Market Alignment Index'}
            value={audit.mai}
            pill={`Reviewed ${fmtDate(audit.reviewed_date)}`}
            subline="How well your marketing mix fits your business, market, and customer journey right now."
          />
        )}
        <DashCard id="bh-strategy" className="flex flex-col justify-center">
          <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Your Marketing Strategy</h3>
          <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
            {audit.consultant_summary || 'Your consultant will walk you through your marketing strategy in detail.'}
          </p>
          {scoreEntries.length > 0 && (
            <div className="mt-6 space-y-4 border-t border-border/40 pt-5">
              {scoreEntries.map(([key, s]) => (
                <div key={key}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{s.client_label || key.replace(/_/g, ' ')}</p>
                    <p className="text-sm tabular-nums text-muted-foreground">
                      {typeof s.score === 'number' ? `${s.score}/100` : '—'}
                    </p>
                  </div>
                  <div className="well-track h-2 overflow-hidden">
                    <div className="molten-bar h-full" style={{ width: `${Math.max(0, Math.min(100, s.score || 0))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashCard>
      </div>

      <DashCard id="bh-channel-map">
        <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Your Channel Map</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Each channel your consultant reviewed, positioned by how strongly it is executing today and how much it moves buyers.
        </p>
        <div className="mt-5">
          <MatrixMapChart dots={dots} editable={false} />
        </div>
      </DashCard>

      {channels.length > 0 && (
        <DashCard id="bh-channels">
          <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Your Channels</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {channels.map((c) => (
              <div key={c.channel_name} className="rounded-lg border border-border/60 bg-background/40 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: PRIORITY_COLORS[c.consultant_priority] || PRIORITY_COLORS.not_applicable }}
                  />
                  <p className="text-sm font-medium text-foreground">{c.channel_name}</p>
                </div>
                {(c.strategic_role || c.journey_stage) && (
                  <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground/70">
                    {[c.strategic_role ? roleLabel(c.strategic_role) : null, c.journey_stage ? stageLabel(c.journey_stage) : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
                {c.description && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{c.description}</p>}
                {c.client_notes && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{c.client_notes}</p>}
              </div>
            ))}
          </div>
        </DashCard>
      )}

      {journeyStages.length > 0 && (
        <DashCard id="bh-journey">
          <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Customer Journey Coverage</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            How consistently your business supports buyers at each step of the journey.
          </p>
          <div className="mt-5 space-y-3">
            {journeyStages.map((s) => (
              <div key={s.stage} className="rounded-lg border border-border/60 bg-background/40 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{stageLabel(s.stage)}</p>
                  <div className="flex items-center gap-2">
                    {s.channels.length > 0 && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                        {s.channels.map((c) => c.channel_name).join(' · ')}
                      </span>
                    )}
                    {s.status && (
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLES[s.status] || STATUS_STYLES.not_applicable}`}
                      >
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
        </DashCard>
      )}

      {opportunities.length > 0 && (
        <DashCard id="bh-opportunities">
          <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Growth Opportunities</h3>
          <p className="mt-1 text-sm text-muted-foreground">Consultant-selected opportunities specific to your business.</p>
          <div className="mt-5 space-y-3">
            {opportunities.map((o) => (
              <div key={o.title} className="rounded-lg border border-border/60 bg-background/40 px-4 py-3">
                <p className="text-sm font-medium text-foreground">{o.title}</p>
                {o.client_summary && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{o.client_summary}</p>}
              </div>
            ))}
          </div>
        </DashCard>
      )}

      {(findings || []).length > 0 && (
        <DashCard>
          <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Consultant Findings</h3>
          <div className="mt-5">
            <FindingsList findings={findings} />
          </div>
        </DashCard>
      )}

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
          <ul className="mt-5 space-y-2">
            {(audit.evidence || []).map((e, i) => (
              <li key={i}>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-primary"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-primary" /> {e.title}
                </a>
              </li>
            ))}
          </ul>
        </DashCard>
      )}

      <CreditNote credit={credit} />
    </div>
  );
}