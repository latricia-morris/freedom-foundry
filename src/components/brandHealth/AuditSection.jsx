import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { COMPONENT_LABELS, PUBLISHED_STATUS, reviewStatusLine } from '@/lib/brandHealth';
import { BASELINE_FIELDS, resolveMatrixFlags } from '@/lib/matrix';
import MatrixView from './MatrixView';
import PublishedReport from './PublishedReport';
import IntakeForm from './IntakeForm';
import BaselineQuiz from './BaselineQuiz';

const HEADING = 'mb-4 font-heading text-2xl text-foreground';

/**
 * One component's section on a Digital Brand Health subpage. Non-matrix
 * reviews keep the intake → review → published flow. The Marketing Matrix is
 * routed by its computed matrix_state instead, so consultant-loaded findings
 * are never trapped behind the intake screen:
 *   awaiting_intake   → intake prompt
 *   baseline_gap      → only the missing baseline questions
 *   results_available → results immediately, no blocker copy
 *   ready_for_review  → internal review state
 */
export default function AuditSection({ component, audit, findings, credit, onOpenStatus, reload, matrixChannels = [], leverage = [] }) {
  const [showIntake, setShowIntake] = useState(false);
  const [showBaseline, setShowBaseline] = useState(false);
  const isMatrix = !!component.matrix || (audit && audit.component === 'marketing_matrix');

  if (!audit) {
    return (
      <div className="dashboard-card flex flex-col items-center justify-center p-10 text-center">
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{component.missing}</p>
        <Link to="/services" className="link-warm mt-4 inline-block">Explore audit options →</Link>
      </div>
    );
  }

  const done = () => {
    setShowIntake(false);
    setShowBaseline(false);
    if (reload) reload();
  };

  if (isMatrix) {
    const flags = resolveMatrixFlags(audit);
    const label = (
      <h3 className={HEADING}>
        {COMPONENT_LABELS.marketing_matrix}{' '}
        <span className="text-sm uppercase tracking-widest text-muted-foreground/70">Marketing Matrix</span>
      </h3>
    );

    if (showIntake) {
      return (
        <div>
          {label}
          <IntakeForm audit={audit} onSubmitted={done} onCancel={() => setShowIntake(false)} />
        </div>
      );
    }

    if (showBaseline) {
      const missing = BASELINE_FIELDS.filter((f) => flags.missing_baseline_fields.includes(f.key));
      return (
        <div>
          {label}
          <BaselineQuiz audit={audit} fields={missing} onSubmitted={done} onCancel={() => setShowBaseline(false)} />
        </div>
      );
    }

    if (flags.matrix_state === 'results_available') {
      return (
        <div>
          <h3 className={HEADING}>
            {COMPONENT_LABELS.marketing_matrix}{' '}
            <span className="text-sm uppercase tracking-widest text-muted-foreground/70">Your results</span>
          </h3>
          <MatrixView audit={audit} findings={findings} credit={credit} matrixChannels={matrixChannels} leverage={leverage} />
        </div>
      );
    }

    if (flags.matrix_state === 'baseline_gap') {
      return (
        <div className="dashboard-card flex flex-col items-center justify-center p-10 text-center">
          <ClipboardList className="h-9 w-9 text-primary" strokeWidth={1.5} />
          <h3 className="mt-3 font-heading text-xl text-foreground">We just need a few final details.</h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Your Marketing Matrix is already in progress. Complete these remaining baseline items so we can
            finish your results.
          </p>
          <button type="button" onClick={() => setShowBaseline(true)} className="link-warm mt-4 inline-block">
            Complete remaining questions →
          </button>
        </div>
      );
    }

    if (flags.matrix_state === 'ready_for_review') {
      return (
        <div className="dashboard-card flex flex-col items-center justify-center p-10 text-center">
          <h3 className="font-heading text-xl text-foreground">{component.title}</h3>
          <p className="mt-4 font-heading text-3xl font-light italic text-muted-foreground">In Review</p>
          <p className="mt-2 text-xs text-muted-foreground">{reviewStatusLine(audit, true)}</p>
          <button type="button" onClick={() => onOpenStatus(audit)} className="link-warm mt-4 inline-block">View audit status →</button>
        </div>
      );
    }

    // awaiting_intake
    return (
      <div className="dashboard-card flex flex-col items-center justify-center p-10 text-center">
        <ClipboardList className="h-9 w-9 text-primary" strokeWidth={1.5} />
        <h3 className="mt-3 font-heading text-xl text-foreground">Start your Marketing Matrix intake.</h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          We’ll use a few baseline details to evaluate the best-fit channels for your business.
        </p>
        <button type="button" onClick={() => setShowIntake(true)} className="link-warm mt-4 inline-block">
          Start intake →
        </button>
      </div>
    );
  }

  const needsIntake = !audit.intake_received_date && audit.status !== PUBLISHED_STATUS;

  if (showIntake) {
    return (
      <div>
        <h3 className={HEADING}>
          {COMPONENT_LABELS[component.key]} <span className="text-sm uppercase tracking-widest text-muted-foreground/70">Intake</span>
        </h3>
        <IntakeForm audit={audit} onSubmitted={done} onCancel={() => setShowIntake(false)} />
      </div>
    );
  }

  if (needsIntake) {
    return (
      <div className="dashboard-card flex flex-col items-center justify-center p-10 text-center">
        <ClipboardList className="h-9 w-9 text-primary" strokeWidth={1.5} />
        <h3 className="mt-3 font-heading text-xl text-foreground">{component.title}</h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Before your consultant begins the review, complete a short intake so we know exactly what to
          examine for your business.
        </p>
        <button type="button" onClick={() => setShowIntake(true)} className="link-warm mt-4 inline-block">
          Complete your intake →
        </button>
      </div>
    );
  }

  if (audit.status !== PUBLISHED_STATUS) {
    return (
      <div className="dashboard-card flex flex-col items-center justify-center p-10 text-center">
        <h3 className="font-heading text-xl text-foreground">{component.title}</h3>
        <p className="mt-4 font-heading text-3xl font-light italic text-muted-foreground">In Review</p>
        <p className="mt-2 text-xs text-muted-foreground">{reviewStatusLine(audit, component.matrix)}</p>
        <button type="button" onClick={() => onOpenStatus(audit)} className="link-warm mt-4 inline-block">View audit status →</button>
      </div>
    );
  }

  return (
    <div>
      <h3 className={HEADING}>
        {COMPONENT_LABELS[component.key]} <span className="text-muted-foreground/70 text-sm uppercase tracking-widest">Published report</span>
      </h3>
      <PublishedReport audit={audit} findings={findings} credit={credit} />
    </div>
  );
}