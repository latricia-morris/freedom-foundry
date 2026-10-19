import React from 'react';
import { fmtDate } from '@/lib/brandHealth';
import {
  DIRECTION_LABELS,
  EFFORT_LABELS,
  EVIDENCE_LABELS,
  GOAL_TYPE_LABELS,
  RECOMMENDATION_BASIS_LABELS,
  STRATEGIC_ROLES,
} from '@/lib/matrix';
import { CATEGORY_REVIEW_LENS, categoryAnchor } from '@/lib/matrixCategories';
import CategoryIcon from './categoryIcons';

const effortLabel = (v) => (v === 'unknown' ? 'Not established' : EFFORT_LABELS[v] || null);
const roleLabel = (key) => (STRATEGIC_ROLES.find((r) => r.key === key) || {}).label || null;

const DIRECTION_TONES = {
  increase: 'border-primary/50 bg-primary/10 text-primary',
  establish: 'border-primary/50 bg-primary/10 text-primary',
  maintain: 'border-border bg-background/40 text-foreground',
  reduce: 'border-destructive/50 bg-destructive/10 text-destructive',
  test_first: 'border-[#d4a94e]/50 bg-[#d4a94e]/10 text-[#d4a94e]',
  assess_first: 'border-[#d4a94e]/40 bg-[#d4a94e]/5 text-[#d4a94e]',
};

function DirectionPill({ direction }) {
  const label = DIRECTION_LABELS[direction];
  if (!label) return null;
  return (
    <span
      className={`w-fit shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium ${
        DIRECTION_TONES[direction] || 'border-border text-muted-foreground'
      }`}
    >
      {label}
    </span>
  );
}

/** Clearly labeled metrics: what the number measures, its value, period, and source. */
function ResultsBlock({ results }) {
  const rows = (results || []).filter((r) => String(r.value ?? '').trim());
  if (!rows.length) {
    return <p className="mt-3 text-sm text-muted-foreground">No results recorded yet.</p>;
  }
  return (
    <ul className="mt-3 space-y-2">
      {rows.map((r, i) => {
        const num = Number(String(r.value).trim());
        return (
          <li key={i} className="text-sm text-foreground">
            {r.label ? <span className="text-muted-foreground">{r.label}: </span> : null}
            {Number.isFinite(num) ? num.toLocaleString('en-US') : String(r.value)}
            {r.unit ? ` ${r.unit}` : ''}
            {r.period ? <span className="text-muted-foreground"> · {r.period}</span> : null}
            {EVIDENCE_LABELS[r.evidence] ? (
              <span className="ml-2 rounded-full border border-border/70 px-2 py-0.5 text-[10px] text-muted-foreground">
                {EVIDENCE_LABELS[r.evidence]}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/** Source details and methodology, out of the reading flow. */
function SourceDetails({ channel }) {
  const eff = channel.effort || {};
  const goal = channel.goal || {};
  const facts = [
    eff.current ? `Current commitment: ${effortLabel(eff.current)}` : null,
    eff.recommended ? `Recommended commitment: ${effortLabel(eff.recommended)}` : null,
    EVIDENCE_LABELS[eff.evidence] ? `Evidence: ${EVIDENCE_LABELS[eff.evidence]}` : null,
    RECOMMENDATION_BASIS_LABELS[channel.recommendation_basis]
      ? `Basis: ${RECOMMENDATION_BASIS_LABELS[channel.recommendation_basis]}`
      : null,
    goal.type ? `Goal type: ${GOAL_TYPE_LABELS[goal.type]}` : null,
    channel.strategic_role ? `Intended role: ${roleLabel(channel.strategic_role)}` : null,
    channel.measurement_objective_label ? `Measured by: ${channel.measurement_objective_label}` : null,
    channel.qualified_conversation_definition
      ? `Qualified conversation: ${channel.qualified_conversation_definition}`
      : null,
  ].filter(Boolean);
  if (!facts.length) return null;
  return (
    <details className="group mt-4 border-t border-border/40 pt-3">
      <summary className="cursor-pointer list-none text-xs text-muted-foreground transition-colors hover:text-foreground">
        <span className="group-open:hidden">Source details</span>
        <span className="hidden group-open:inline">Hide source details</span>
      </summary>
      <ul className="mt-2.5 space-y-1 text-xs leading-relaxed text-muted-foreground">
        {facts.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
    </details>
  );
}

/**
 * One assessed activity, laid out by the reading sequence: what is happening
 * now, what the assessment indicates, what should change, and how the change
 * will be judged. Presentation flexes to the information available instead of
 * forcing every block into the same columns.
 */
function ChannelBlock({ channel }) {
  const eff = channel.effort || {};
  const goal = channel.goal || {};
  const cur = effortLabel(eff.current);
  const rec = effortLabel(eff.recommended);
  const commitmentChanges = cur && rec && cur !== rec;

  return (
    <article className="rounded-[3px] border border-border bg-card/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="font-heading text-xl font-light text-foreground">{channel.channel_name}</h4>
        <DirectionPill direction={eff.direction} />
      </div>

      {eff.rationale ? (
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-foreground/90">{eff.rationale}</p>
      ) : null}

      {EVIDENCE_LABELS[eff.evidence] ? (
        <p className="mt-2 text-xs text-muted-foreground">Evidence: {EVIDENCE_LABELS[eff.evidence]}</p>
      ) : null}

      <ResultsBlock results={channel.results} />

      {commitmentChanges ? (
        <p className="mt-4 text-sm text-foreground">
          Commitment: {cur} to {rec} effort
          {eff.commitment ? <span className="text-muted-foreground"> ({eff.commitment})</span> : null}
        </p>
      ) : null}

      {(goal.text || goal.timeframe || goal.tracking_method || goal.next_review_date) && (
        <div className="mt-4 border-t border-border/60 pt-3">
          <p className="text-xs font-medium text-muted-foreground">Review plan</p>
          <ul className="mt-1.5 space-y-1 text-sm leading-relaxed text-foreground/85">
            {goal.text ? <li>{goal.text}</li> : null}
            {goal.timeframe ? <li className="text-muted-foreground">Timeframe: {goal.timeframe}</li> : null}
            {goal.tracking_method ? <li className="text-muted-foreground">Tracking: {goal.tracking_method}</li> : null}
            {goal.next_review_date ? <li className="text-muted-foreground">Review: {fmtDate(goal.next_review_date)}</li> : null}
          </ul>
        </div>
      )}

      {channel.next_action ? (
        <p className="mt-4 text-sm text-foreground">
          <span className="text-warm font-medium">Next step: </span>
          {channel.next_action}
        </p>
      ) : null}

      <SourceDetails channel={channel} />
    </article>
  );
}

/**
 * One category chapter. Unassessed categories get a concise, honest state;
 * assessed categories keep the consistent reading sequence with presentation
 * that adapts to the finding.
 */
export default function MatrixCategorySection({ category, channels = [], emphasized = false, clientName }) {
  const anchor = categoryAnchor(category.key);

  if (!channels.length) {
    return (
      <section id={anchor} className="bh-card scroll-mt-[140px] p-6 sm:p-8 lg:scroll-mt-[180px]">
        <div className="flex items-center gap-3">
          <CategoryIcon iconKey={category.key} size="sm" />
          <h3 className="font-heading text-xl font-light text-foreground sm:text-2xl">{category.name}</h3>
        </div>
        {category.descriptor ? (
          <p className="mt-3 text-sm text-muted-foreground">{category.descriptor}</p>
        ) : null}
        <p className="mt-4 font-medium text-foreground">Not assessed</p>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Current activity and results have not been reviewed.
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A future review would look at {CATEGORY_REVIEW_LENS[category.key]}.
        </p>
      </section>
    );
  }

  return (
    <section
      id={anchor}
      className={`scroll-mt-[140px] space-y-5 lg:scroll-mt-[180px] ${emphasized ? 'border-l-2 border-l-primary pl-4 sm:pl-6' : ''}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CategoryIcon iconKey={category.key} />
          <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">{category.name}</h3>
        </div>
        {emphasized && (
          <span className="text-warm rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-[11px] font-medium">
            Leading opportunity
          </span>
        )}
      </div>

      {category.descriptor ? (
        <p className="text-sm text-muted-foreground">{category.descriptor}</p>
      ) : null}

      <p className="max-w-3xl text-sm text-muted-foreground">
        Reviewed: {channels.map((c) => c.channel_name).join(', ')}.
      </p>

      <div className="space-y-4">
        {channels.map((c) => (
          <ChannelBlock key={c.id || c.channel_name} channel={c} />
        ))}
      </div>
    </section>
  );
}