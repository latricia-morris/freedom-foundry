import React from 'react';
import { CREDIT_LANGUAGE, fmtDate, money, ACTION_PRIORITIES } from '@/lib/brandHealth';
import {
  MATRIX_SCORECARDS,
  JOURNEY_STAGES,
  JOURNEY_STATUS_LABELS,
  LEVERAGE_CATEGORIES,
  LEVERAGE_PRIORITIES,
} from '@/lib/matrix';
import ChannelEqualizer from './ChannelEqualizer';

const H = 'mb-1 font-heading text-2xl text-foreground';
const SUB = 'mb-6 max-w-2xl text-sm text-muted-foreground';

// Freedom Foundry palette
const COPPER = '#E26E3C';
const BRASS = '#DC5338';
const EMBER = '#D9754A';
const SLATE = '#454E68';
const CHIP_RADIUS = 3;

function labelFor(list, key) {
  const found = (list || []).find((item) => item.key === key);
  return found ? found.label : key || '—';
}

function priorityColor(key) {
  const k = (key || '').toLowerCase();
  if (k === 'critical') return COPPER;
  if (k === 'high') return BRASS;
  if (k === 'medium' || k === 'opportunity') return EMBER;
  return SLATE;
}

function statusColor(key) {
  const k = (key || '').toLowerCase();
  if (k.includes('complete') || k.includes('strong')) return COPPER;
  if (k.includes('partial')) return EMBER;
  if (k.includes('missing') || k.includes('gap') || k.includes('none')) return SLATE;
  return SLATE;
}

function Chip({ label, color }) {
  return (
    <span
      className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{ borderRadius: CHIP_RADIUS, backgroundColor: `${color}22`, color }}
    >
      {label}
    </span>
  );
}

function ScoreBar({ score }) {
  if (typeof score !== 'number') return null;
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden bg-black/30" style={{ borderRadius: CHIP_RADIUS }}>
      <div
        className="h-full"
        style={{
          width: `${Math.max(0, Math.min(100, score))}%`,
          borderRadius: CHIP_RADIUS,
          background: `linear-gradient(to right, ${SLATE}, ${BRASS}, ${COPPER})`,
        }}
      />
    </div>
  );
}

export default function MatrixView({ audit, findings = [], credit, matrixChannels = [], leverage = [] }) {
  const flatSummary = audit?.consultant_summary || '';
  // Client-shaped fields actually sent by get-brand-health — not the internal
  // consultant_findings_payload, which never crosses the wire.
  const scoresPublic = audit?.matrix_scores_public || {};
  const journeyPublic = Array.isArray(audit?.journey_public) ? audit.journey_public : [];

  const sortedLeverage = [...(leverage || [])].sort((a, b) => {
    const order = LEVERAGE_PRIORITIES.map((p) => p.key);
    return order.indexOf(a.priority) - order.indexOf(b.priority);
  });
  const actionPlan = Array.isArray(audit?.action_plan) ? audit.action_plan : [];
  const sortedActions = [...actionPlan].sort(
    (a, b) => ACTION_PRIORITIES.indexOf(a.priority) - ACTION_PRIORITIES.indexOf(b.priority)
  );

  const hasScorecards = Object.keys(scoresPublic).length > 0;

  return (
    <div className="space-y-12">
      <section id="bh-strategy">
        <h3 className={H}>Your Marketing Strategy</h3>
        {flatSummary ? (
          <div className="dashboard-card mb-4 p-6">
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{flatSummary}</p>
          </div>
        ) : null}
        {hasScorecards ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {MATRIX_SCORECARDS.map((card) => {
              const d = scoresPublic[card.key];
              if (!d || typeof d.score !== 'number') return null;
              return (
                <div key={card.key} className="dashboard-card p-5">
                  <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="font-heading text-lg text-foreground">{d.client_label || card.label}</h4>
                    <span className="text-xs font-semibold text-foreground">{d.score}<span className="text-muted-foreground">/100</span></span>
                  </div>
                  <ScoreBar score={d.score} />
                </div>
              );
            })}
          </div>
        ) : !flatSummary ? (
          <div className="dashboard-card flex items-center justify-center p-10 text-center">
            <p className="text-sm text-muted-foreground">Your consultant will walk you through your marketing strategy in detail.</p>
          </div>
        ) : null}
      </section>

      {/* CHANNEL MAP — the equalizer IS the answer. No redundant list below it. */}
      <section id="bh-channel-map">
        <h3 className={H}>Your Channel Map</h3>
        <p className={SUB}>How hard to push each channel right now — fill is where it stands today, the line is where it should be.</p>
        {matrixChannels.length === 0 ? (
          <div className="dashboard-card flex items-center justify-center p-10 text-center">
            <p className="text-sm text-muted-foreground">Your consultant will publish the channel map here.</p>
          </div>
        ) : (
          <ChannelEqualizer matrixChannels={matrixChannels} />
        )}
      </section>

      <section id="bh-journey">
        <h3 className={H}>Your Customer Journey</h3>
        <p className={SUB}>Whether ideal buyers have a clear, credible path from first awareness through retention and referral.</p>
        {journeyPublic.length === 0 ? (
          <div className="dashboard-card flex items-center justify-center p-10 text-center">
            <p className="text-sm text-muted-foreground">Your consultant will map your customer journey here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {JOURNEY_STAGES.map((stage) => {
              const row = journeyPublic.find((r) => r.stage === stage.key);
              if (!row) return null;
              const statusKey = row.status || 'partial';
              return (
                <div key={stage.key} className="dashboard-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{stage.label}</p>
                    <div className="flex items-center gap-2">
                      <Chip label={JOURNEY_STATUS_LABELS[statusKey] || statusKey} color={statusColor(statusKey)} />
                      {typeof row.coverage === 'number' ? (
                        <span className="text-xs text-muted-foreground">{row.coverage}%</span>
                      ) : null}
                    </div>
                  </div>
                  {row.client_notes ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{row.client_notes}</p> : null}
                </div>
              );
            })}
          </div>
        )}
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
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <Chip label={labelFor(LEVERAGE_PRIORITIES, item.priority)} color={priorityColor(item.priority)} />
                </div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground/70">{labelFor(LEVERAGE_CATEGORIES, item.category)}</p>
                {item.client_summary ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.client_summary}</p> : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="bh-actions">
        <h3 className={H}>Your Action Plan</h3>
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
                  <Chip label={action.priority} color={priorityColor(action.priority)} />
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
