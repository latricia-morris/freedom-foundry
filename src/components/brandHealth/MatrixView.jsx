import React from 'react';
import { CREDIT_LANGUAGE, fmtDate, money } from '@/lib/brandHealth';
import MatrixChannels from './MatrixChannels';

const SECTION = 'scroll-mt-28';
const H = 'mb-1 font-heading text-2xl text-foreground';
const SUB = 'mb-6 max-w-2xl text-sm text-muted-foreground';
const P = 'text-base leading-relaxed text-foreground';

const DEFAULT_EVIDENCE_NOTE =
  'Effort levels describe commitment, not effectiveness. Results marked Client-reported come directly from you; results marked Recorded are documented in an identified source; anything marked Not tracked has no usable measurement yet. Recommendations rest on the stated basis for each channel, and available capacity should be confirmed before committing.';

function Takeaway({ audit }) {
  const summary = audit.consultant_summary || '';
  const groups = [
    { label: 'Prioritize', text: audit.takeaway_prioritize },
    { label: 'Maintain', text: audit.takeaway_maintain },
    { label: 'Test or measure', text: audit.takeaway_test },
  ].filter((g) => g.text);
  if (!summary && !groups.length) return null;
  return (
    <section id="bh-takeaway" className={SECTION}>
      <h3 className={H}>Strategic takeaway</h3>
      {summary ? <p className={`mt-2 max-w-3xl ${P}`}>{summary}</p> : null}
      {groups.length ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g.label} className="border-l border-border pl-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{g.label}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{g.text}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ActionPlan({ actions }) {
  return (
    <section id="bh-actions" className={SECTION}>
      <h3 className={H}>Prioritized action plan</h3>
      <ol className="mt-4 space-y-3">
        {actions.map((a, i) => (
          <li key={i} className="rounded-[3px] border border-border bg-card/40 p-4">
            <div className="flex items-baseline gap-3">
              <span className="font-heading text-xl text-primary">{i + 1}</span>
              <p className="font-medium text-foreground">{a.title}</p>
            </div>
            <div className="mt-2 space-y-1 pl-8 text-sm">
              {a.associated_channel ? <p className="text-muted-foreground">Channel: {a.associated_channel}</p> : null}
              {a.detail ? <p className="text-muted-foreground">{a.detail}</p> : null}
              {a.completion_condition ? <p className="text-muted-foreground">Complete when: {a.completion_condition}</p> : null}
              {a.due_date ? <p className="text-muted-foreground">Timeframe: {a.due_date}</p> : null}
              {a.owner ? <p className="text-muted-foreground">Owner: {a.owner}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function MeasurementNote({ audit, credit }) {
  return (
    <section id="bh-evidence" className={SECTION}>
      <h3 className={H}>Measurement and evidence note</h3>
      <p className={`mt-2 max-w-3xl ${P}`}>{audit.evidence_note || DEFAULT_EVIDENCE_NOTE}</p>
      {credit ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Audit credit: {money(credit.amount_cents)}
          {credit.reviewed_date ? ` · reviewed ${fmtDate(credit.reviewed_date)}` : ''}
        </p>
      ) : null}
      <p className="mt-4 text-sm italic leading-relaxed text-muted-foreground">{CREDIT_LANGUAGE}</p>
    </section>
  );
}

/**
 * Marketing Matrix client report: header, strategic takeaway, effort
 * allocation matrix, prioritized action plan, and the measurement note.
 * Sections without content are omitted; nothing here is generated or inferred.
 */
export default function MatrixView({ audit, matrixChannels = [], credit, clientName }) {
  const included = (matrixChannels || []).filter((c) => c.effort && (c.effort.recommended || c.effort.current));
  const actions = (audit.action_plan || []).slice(0, 5);
  const assessmentDate = audit.results_generated_at || audit.created_date;

  return (
    <div className="space-y-12">
      <section className={SECTION}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Marketing Matrix</p>
        <h2 className="mt-1 font-heading text-3xl font-light text-foreground sm:text-4xl">
          Where to focus your marketing effort, and how to measure progress.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {clientName ? `${clientName} · ` : ''}Assessment {fmtDate(assessmentDate)}
          {audit.reviewed_date ? ` · Reviewed ${fmtDate(audit.reviewed_date)}` : ''}
        </p>
      </section>

      <Takeaway audit={audit} />

      {included.length ? (
        <section id="bh-channels" className={SECTION}>
          <h3 className={H}>Effort allocation</h3>
          <p className={SUB}>What you commit to each channel today, what we recommend committing next, and the direction of travel.</p>
          <MatrixChannels channels={included} />
        </section>
      ) : null}

      {actions.length ? <ActionPlan actions={actions} /> : null}

      <MeasurementNote audit={audit} credit={credit} />
    </div>
  );
}