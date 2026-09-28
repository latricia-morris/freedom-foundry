import React from 'react';
import { CREDIT_LANGUAGE, fmtDate, money } from '@/lib/brandHealth';
import {
  PRIORITY_COLORS,
  STRATEGIC_ROLES,
  MATRIX_SCORECARDS,
  JOURNEY_STAGES,
  JOURNEY_STATUS_LABELS,
  seededJourneyRows,
  LEVERAGE_CATEGORIES,
  LEVERAGE_PRIORITIES,
  ACTION_PRIORITIES,
} from '@/lib/matrix';
import ChannelEqualizer from './ChannelEqualizer';

const H = 'mb-1 font-heading text-2xl text-foreground';
const SUB = 'mb-6 max-w-2xl text-sm text-muted-foreground';

function labelFor(list, key) {
  const found = (list || []).find((item) => item.key === key);
  return found ? found.label : key || '—';
}

function parsedPayload(audit) {
  const raw = audit?.consultant_findings_payload;
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function MatrixView({ audit, findings = [], credit, matrixChannels = [], leverage = [] }) {
  const payload = parsedPayload(audit);
  const flatSummary = audit?.consultant_summary || '';

  const journeyRows = seededJourneyRows(audit);
  const sortedLeverage = [...(leverage || [])].sort((a, b) => {
    const order = LEVERAGE_PRIORITIES.map((p) => p.key);
    return order.indexOf(a.priority) - order.indexOf(b.priority);
  });
  const actionPlan = Array.isArray(audit?.action_plan) ? audit.action_plan : [];
  const sortedActions = [...actionPlan].sort(
    (a, b) => ACTION_PRIORITIES.indexOf(a.priority) - ACTION_PRIORITIES.indexOf(b.priority)
  );

  return (
    <div className="space-y-12">
      <section id="bh-strategy">
        <h3 className={H}>Your Marketing Strategy</h3>

        {flatSummary ? (
          <div className="dashboard-card mb-4 p-6">
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{flatSummary}</p>
          </div>
        ) : null}

        {payload ? (
          <div className="space-y-4">
            {MATRIX_SCORECARDS.map((card) => {
              const d = payload[card.key];
              if (!d) return null;
              return (
                <div key={card.key} className="dashboard-card p-5">
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="font-heading text-lg text-foreground">{card.label}</h4>
                    {typeof d.score === 'number' ? (
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">{d.score}/100</span>
                    ) : null}
                  </div>
                  {d.summary ? (
                    <p className="mb-2 text-sm leading-relaxed text-foreground">{d.summary}</p>
                  ) : null}
                  {d.interpretation ? (
                    <p className="mb-2 text-xs leading-relaxed text-muted-foreground">{d.interpretation}</p>
                  ) : null}
                  {Array.isArray(d.priorities) && d.priorities.length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                      {d.priorities.slice(0, 3).map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : !flatSummary ? (
          <div className="dashboard-card flex items-center justify-center p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Your consultant will walk you through your marketing strategy in detail.
            </p>
          </div>
        ) : null}
      </section>

      <section id="bh-channel-map">
        <h3 className={H}>Your Channel Map</h3>
        <p className={SUB}>Each channel your consultant reviewed: current level (fill) vs. target level (line), based on strategic fit and buyer impact.</p>
        {matrixChannels.length === 0 ? (
          <div className="dashboard-card flex items-center justify-center p-10 text-center">
            <p className="text-sm text-muted-foreground">Your consultant will publish the channel map here.</p>
          </div>
        ) : (
          <>
            <ChannelEqualizer audit={audit} matrixChannels={matrixChannels} />
            <h4 className="mt-8 mb-4 font-heading text-xl text-foreground">Your Channels</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {matrixChannels.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((ch) => {
                const color = PRIORITY_COLORS[ch.consultant_priority] || PRIORITY_COLORS.not_applicable;
                return (
                  <div key={ch.id || ch.channel_name} className="dashboard-card p-4">
                    <div className="mb-1 flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{ch.channel_name}</p>
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                          {labelFor(STRATEGIC_ROLES, ch.strategic_role)}
                          {ch.journey_stage ? ` · ${ch.journey_stage.replace(/_/g, ' ')}` : ''}
                        </p>
                      </div>
                    </div>
                    {ch.description ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{ch.description}</p> : null}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <section id="bh-journey">
        <h3 className={H}>Your Customer Journey</h3>
        <p className={SUB}>Whether ideal buyers have a clear, credible path from first awareness through retention and referral.</p>

        {payload?.journey_coverage?.summary ? (
          <div className="dashboard-card mb-4 p-5">
            <p className="text-sm leading-relaxed text-foreground">{payload.journey_coverage.summary}</p>
            {payload.journey_coverage.interpretation ? (
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{payload.journey_coverage.interpretation}</p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-3">
          {JOURNEY_STAGES.map((stage) => {
            const row = journeyRows.find((r) => r.stage === stage.key) || {};
            const statusKey = row.status || 'partial';
            return (
              <div key={stage.key} className="dashboard-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{stage.label}</p>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    {JOURNEY_STATUS_LABELS[statusKey] || statusKey}{typeof row.coverage === 'number' ? ` · ${row.coverage}%` : ''}
                  </span>
                </div>
                {row.client_visible && row.client_notes ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{row.client_notes}</p> : null}
              </div>
            );
          })}
        </div>
      </section>

      <section id="bh-opportunities">
        <h3 className={H}>Your Leverage Opportunities</h3>
        <p className={SUB}>Specific, high-leverage moves your consultant identified beyond standard channel execution.</p>
        {sortedLeverage.length === 0 ? (
          <div className="dashboard-card flex items-center justify-center p-10 text-center">
            <p className="text-sm text-muted-foreground">Your consultant will identify leverage opportunities here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sortedLeverage.map((item) => (
              <div key={item.id || item.title} className="dashboard-card p-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{labelFor(LEVERAGE_PRIORITIES, item.priority)}</span>
                </div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground/70">{labelFor(LEVERAGE_CATEGORIES, item.category)}</p>
                {item.description ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p> : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="bh-actions">
        <h3 className={H}>Your Action Plan</h3>

        {payload ? (
          <div className="mb-4 space-y-3">
            {MATRIX_SCORECARDS.map((card) => {
              const d = payload[card.key];
              if (!d || !Array.isArray(d.priorities) || d.priorities.length === 0) return null;
              return d.priorities.map((p, idx) => (
                <div key={`${card.key}-${idx}`} className="dashboard-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{p}</p>
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{card.label}</span>
                  </div>
                </div>
              ));
            })}
          </div>
        ) : null}

        {sortedActions.length === 0 && !payload ? (
          <div className="dashboard-card flex items-center justify-center p-10 text-center">
            <p className="text-sm text-muted-foreground">Your action plan will appear here once it is approved.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedActions.map((action, i) => (
              <div key={i} className="dashboard-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{action.title}</p>
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{action.priority}</span>
                </div>
                {action.detail ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{action.detail}</p> : null}
              </div>
            ))}
          </div>
        )}

        {credit ? (
          <div className="dashboard-card mt-4 p-4">
            <p className="text-sm text-foreground">Audit credit: {money(credit.amount_cents)}{credit.reviewed_date ? ` · reviewed ${fmtDate(credit.reviewed_date)}` : ''}</p>
          </div>
        ) : null}
        <p className="mt-6 text-xs italic leading-relaxed text-muted-foreground">{CREDIT_LANGUAGE}</p>
      </section>
    </div>
  );
}
