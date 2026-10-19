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

const LABEL = 'text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70';
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
      className={`w-fit shrink-0 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
        DIRECTION_TONES[direction] || 'border-border text-muted-foreground'
      }`}
    >
      {label}
    </span>
  );
}

function ResultsList({ results }) {
  const rows = (results || []).filter((r) => String(r.value ?? '').trim());
  if (!rows.length) return <p className="mt-1 text-xs italic text-muted-foreground">No results recorded yet.</p>;
  return (
    <ul className="mt-1 space-y-1.5">
      {rows.map((r, i) => {
        const num = Number(String(r.value).trim());
        return (
          <li key={i} className="text-sm text-foreground">
            {Number.isFinite(num) ? num.toLocaleString('en-US') : String(r.value)}
            {r.unit ? ` ${r.unit}` : ''}
            {r.period ? <span className="text-muted-foreground"> · {r.period}</span> : null}
            {EVIDENCE_LABELS[r.evidence] ? (
              <span className="ml-2 rounded-full border border-border/70 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                {EVIDENCE_LABELS[r.evidence]}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function ChannelBlock({ channel }) {
  const eff = channel.effort || {};
  const goal = channel.goal || {};
  const role = channel.strategic_role || channel.measurement_objective_label || null;
  return (
    <article className="rounded-[3px] border border-border bg-card/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="font-heading text-xl font-light text-foreground">{channel.channel_name}</h4>
        <DirectionPill direction={eff.direction} />
      </div>

      {eff.rationale ? (
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-foreground/90">{eff.rationale}</p>
      ) : null}

      <div className="mt-4 grid gap-5 border-t border-border/60 pt-4 text-sm sm:grid-cols-3">
        <div>
          <p className={LABEL}>Commitment</p>
          <p className="mt-1 text-foreground">
            {[effortLabel(eff.current), effortLabel(eff.recommended)].filter(Boolean).join(' → ') || 'Not set'}
          </p>
          {eff.commitment ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{eff.commitment}</p> : null}
        </div>
        <div>
          <p className={LABEL}>Results</p>
          <ResultsList results={channel.results} />
        </div>
        <div>
          <p className={LABEL}>Review plan</p>
          <ul className="mt-1 space-y-1 text-xs leading-relaxed text-muted-foreground">
            {goal.text ? <li className="text-foreground/85">{goal.text}</li> : null}
            {goal.timeframe ? <li>Timeframe: {goal.timeframe}</li> : null}
            {goal.tracking_method ? <li>Tracking: {goal.tracking_method}</li> : null}
            {goal.next_review_date ? <li>Review: {fmtDate(goal.next_review_date)}</li> : null}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/40 pt-3 text-xs text-muted-foreground">
        {goal.type ? <span className="uppercase tracking-[0.12em] text-muted-foreground/80">{GOAL_TYPE_LABELS[goal.type]}</span> : null}
        {role ? <span>Intended role: {roleLabel(channel.strategic_role) || role}</span> : null}
        {EVIDENCE_LABELS[eff.evidence] ? <span>Evidence: {EVIDENCE_LABELS[eff.evidence]}</span> : null}
        {RECOMMENDATION_BASIS_LABELS[channel.recommendation_basis] ? (
          <span>Basis: {RECOMMENDATION_BASIS_LABELS[channel.recommendation_basis]}</span>
        ) : null}
        {channel.next_action ? <span className="text-foreground/80">Next step: {channel.next_action}</span> : null}
      </div>
    </article>
  );
}

/**
 * One category chapter: consistent reading sequence (current picture →
 * assessment → recommended change → how to judge progress), with presentation
 * that adapts to the information available.
 */
export default function MatrixCategorySection({ category, channels = [], emphasized = false, clientName }) {
  const anchor = categoryAnchor(category.key);

  if (!channels.length) {
    return (
      <section id={anchor} className="bh-card scroll-mt-[140px] p-6 sm:p-8 lg:scroll-mt-[180px]">
        <div className="flex items-center gap-4">
          <CategoryIcon iconKey={category.key} muted size="sm" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">{category.num}</p>
            <h3 className="font-heading text-xl font-light text-foreground sm:text-2xl">{category.name}</h3>
          </div>
        </div>
        {category.descriptor ? (
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground/70">{category.descriptor}</p>
        ) : null}
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Not assessed in this cycle. We have not yet reviewed {category.name.toLowerCase()}
          {clientName ? ` for ${clientName}` : ''}: {CATEGORY_REVIEW_LENS[category.key]}. No findings and no
          recommendations are offered here until that review happens, so nothing is invented to fill the gap.
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
        <div className="flex items-center gap-4">
          <CategoryIcon iconKey={category.key} />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">{category.num}</p>
            <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl">{category.name}</h3>
          </div>
        </div>
        {emphasized && (
          <span className="rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
            Leading opportunity
          </span>
        )}
      </div>

      {category.descriptor ? (
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground/70">{category.descriptor}</p>
      ) : null}

      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Reviewed in this cycle:{' '}
        {channels
          .map((c) => `${c.channel_name} (${effortLabel((c.effort || {}).current) || 'effort not set'})`)
          .join(', ')}
        .
      </p>

      <div className="space-y-4">
        {channels.map((c) => (
          <ChannelBlock key={c.id || c.channel_name} channel={c} />
        ))}
      </div>
    </section>
  );
}