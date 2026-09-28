import React from 'react';
import { CREDIT_LANGUAGE, fmtDate, money } from '@/lib/brandHealth';
import {
  PRIORITY_COLORS,
  opportunityScore,
  STRATEGIC_ROLES,
  CONSULTANT_PRIORITIES,
  JOURNEY_STAGES,
  JOURNEY_STATUS_LABELS,
  seededJourneyRows,
  LEVERAGE_CATEGORIES,
  LEVERAGE_PRIORITIES,
  ACTION_PRIORITIES,
} from '@/lib/matrix';

/**
 * Full Marketing Matrix results view. Renders the five anchor sections the
 * page's AnchorNav expects (bh-strategy, bh-channel-map, bh-journey,
 * bh-opportunities, bh-actions). This replaces the previous file in full —
 * it does not assume any other component still exists for these sections.
 *
 * Props match exactly what AuditSection.jsx already passes:
 *   <MatrixView audit={audit} findings={findings} credit={credit}
 *               matrixChannels={matrixChannels} leverage={leverage} />
 */

const SECTION_HEADING = 'mb-1 font-heading text-2xl text-foreground';
const SECTION_SUB = 'mb-6 max-w-2xl text-sm text-muted-foreground';

function labelFor(list, key) {
  const found = (list || []).find((item) => item.key === key);
  return found ? found.label : key || '—';
}

// ---------------------------------------------------------------------------
// Channel Equalizer (Channel Map visual)
// ---------------------------------------------------------------------------

const DIRECTION_BY_PRIORITY = {
  build: 'up',
  scale: 'up',
  test: 'up',
  optimize: 'hold',
  maintain: 'hold',
  deprioritize: 'down',
  not_applicable: 'hold',
};
const DIRECTION_ICON = { up: '▲', hold: '▬', down: '▼' };
const DIRECTION_LABEL = { up: 'Turn up', hold: 'Hold steady', down: 'Turn down' };
const TRACK_HEIGHT_PX = 140;

function ChannelEqualizer({ audit, matrixChannels }) {
  const bands = matrixChannels
    .map((ch) => {
      const maturity = Number(ch.maturity);
      const level = Number.isFinite(maturity) ? Math.max(0, Math.min(5, maturity)) / 5 : 0;
      const priority = ch.consultant_priority || 'not_applicable';
      const direction = DIRECTION_BY_PRIORITY[priority] || 'hold';
      const color = PRIORITY_COLORS[priority] || PRIORITY_COLORS.not_applicable;
      const score = opportunityScore(ch, audit);
      return { channel: ch, level, direction, color, score, priority };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end justify-center gap-4 rounded-lg border border-border bg-card/40 p-6">
        {bands.map((band) => (
          <div key={band.channel.id || band.channel.channel_name} className="flex flex-col items-center" style={{ width: 84 }}>
            <span className="mb-1 text-sm" style={{ color: band.color }} title={DIRECTION_LABEL[band.direction]}>
              {DIRECTION_ICON[band.direction]}
            </span>
            <div
              className="relative w-6 overflow-hidden rounded-full bg-black/30"
              style={{ height: TRACK_HEIGHT_PX }}
              title={`${band.channel.channel_name} — maturity ${band.channel.maturity ?? '—'}/5`}
            >
              <div
                className="absolute bottom-0 left-0 w-full rounded-full transition-all"
                style={{ height: `${Math.round(band.level * 100)}%`, backgroundColor: band.color }}
              />
            </div>
            <span className="mt-2 rounded bg-black/20 px-1.5 py-0.5 text-[11px] font-medium text-foreground">
              {band.score}
            </span>
            <span className="mt-1 line-clamp-2 text-center text-[11px] leading-tight text-muted-foreground">
              {band.channel.channel_name}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span style={{ color: PRIORITY_COLORS.build }}>▲</span> Turn up</span>
        <span className="flex items-center gap-1"><span style={{ color: PRIORITY_COLORS.maintain }}>▬</span> Hold steady</span>
        <span className="flex items-center gap-1"><span style={{ color: PRIORITY_COLORS.deprioritize }}>▼</span> Turn down</span>
        <span className="ml-2">Bar height = current maturity · Number = opportunity score (0–100)</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function MatrixView({ audit, findings = [], credit, matrixChannels = [], leverage = [] }) {
  const strategySummary = audit?.consultant_summary || audit?.consultant_findings_summary || '';

  const journeyRows = seededJourneyRows(audit);

  const sortedLeverage = [...leverage].sort((a, b) => {
    const order = LEVERAGE_PRIORITIES.map((p) => p.key);
    return order.indexOf(a.priority) - order.indexOf(b.priority);
  });

  const actionPlan = Array.isArray(audit?.action_plan) ? audit.action_plan : [];
  const sortedActions = [...actionPlan].sort(
    (a, b) => ACTION_PRIORITIES.indexOf(a.priority) - ACTION_PRIORITIES.indexOf(b.priority)
  );

  return (
    <div className="space-y-12">
      {/* STRATEGY --------------------------------------------------------- */}
      <section id="bh-strategy">
        <h3 className={SECTION_HEADING}>Your Marketing Strategy</h3>
        <div className="dashboard-card p-6">
          {strategySummary ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{strategySummary}</p>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your consultant will walk you through your marketing strategy in detail.
            </p>
          )}
        </div>
      </section>

      {/* CHANNEL MAP -------------------------------------------------------- */}
      <section id="bh-channel-map">
        <h3 className={SECTION_HEADING}>Your Channel Map</h3>
        <p className={SECTION_SUB}>
          Each channel your consultant reviewed, and whether it should be turned up, held steady, or turned down.
        </p>

        {matrixChannels.length === 0 ? (
          <div className="dashboard-card flex items-center justify-center p-10 text-center">
            <p className="text-sm text-muted-foreground">Your consultant will publish the channel map here.</p>
          </div>
        ) : (
          <>
            <ChannelEqualizer audit={audit} matrixChannels={matrixChannels} />

            <h4 className="mt-8 mb-4 font-heading text-xl text-foreground">Your Channels</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {matrixChannels
                .slice()
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((ch) => {
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
                      {ch.description ? (
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{ch.description}</p>
                      ) : null}
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </section>

      {/* JOURNEY ------------------------------------------------------------ */}
      <section id="bh-journey">
        <h3 className={SECTION_HEADING}>Your Customer Journey</h3>
        <p className={SECTION_SUB}>
          Whether ideal buyers have a clear, credible path from first awareness through retention and referral.
        </p>
        <div className="space-y-3">
          {JOURNEY_STAGES.map((stage) => {
            const row = journeyRows.find((r) => r.stage === stage.key) || {};
            const statusKey = row.status || 'partial';
            return (
              <div key={stage.key} className="dashboard-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{stage.label}</p>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    {JOURNEY_STATUS_LABELS[statusKey] || statusKey}
                    {typeof row.coverage === 'number' ? ` · ${row.coverage}%` : ''}
                  </span>
                </div>
                {row.client_visible && row.client_notes ? (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{row.client_notes}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* OPPORTUNITIES -------------------------------------------------------- */}
      <section id="bh-opportunities">
        <h3 className={SECTION_HEADING}>Your Leverage Opportunities</h3>
        <p className={SECTION_SUB}>
          Specific, high-leverage moves your consultant identified beyond standard channel execution.
        </p>
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
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {labelFor(LEVERAGE_PRIORITIES, item.priority)}
                  </span>
                </div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground/70">
                  {labelFor(LEVERAGE_CATEGORIES, item.category)}
                </p>
                {item.description ? (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ACTIONS -------------------------------------------------------- */}
      <section id="bh-actions">
        <h3 className={SECTION_HEADING}>Your Action Plan</h3>
        {sortedActions.length === 0 ? (
          <div className="dashboard-card flex items-center justify-center p-10 text-center">
            <p className="text-sm text-muted-foreground">Your action plan will appear here once it is approved.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedActions.map((action, i) => (
              <div key={i} className="dashboard-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{action.title}</p>
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {action.priority}
                  </span>
                </div>
                {action.detail ? (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{action.detail}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {credit ? (
          <div className="dashboard-card mt-4 p-4">
            <p className="text-sm text-foreground">
              Audit credit: {money(credit.amount_cents)}
              {credit.reviewed_date ? ` · reviewed ${fmtDate(credit.reviewed_date)}` : ''}
            </p>
          </div>
        ) : null}

        <p className="mt-6 text-xs italic leading-relaxed text-muted-foreground">{CREDIT_LANGUAGE}</p>
      </section>
    </div>
  );
}