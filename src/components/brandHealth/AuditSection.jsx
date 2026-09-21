import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { COMPONENT_LABELS, PUBLISHED_STATUS, reviewStatusLine } from '@/lib/brandHealth';
import MatrixView from './MatrixView';
import PublishedReport from './PublishedReport';
import IntakeForm from './IntakeForm';

/**
 * One component's section on a Digital Brand Health subpage: intake prompt,
 * empty state, in-review state, or the published report — whichever matches
 * the audit's status. Intake only applies to the consultant-scored reviews.
 */
export default function AuditSection({ component, audit, findings, credit, onOpenStatus, reload, matrixChannels = [], leverage = [] }) {
  const [showIntake, setShowIntake] = useState(false);
  const needsIntake =
    audit && !audit.intake_received_date && audit.status !== PUBLISHED_STATUS;

  if (!audit) {
    return (
      <div className="dashboard-card flex flex-col items-center justify-center p-10 text-center">
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{component.missing}</p>
        <Link to="/services" className="link-warm mt-4 inline-block">Explore audit options →</Link>
      </div>
    );
  }

  if (showIntake) {
    return (
      <div>
        <h3 className="mb-4 font-heading text-2xl text-foreground">
          {COMPONENT_LABELS[component.key]} <span className="text-sm uppercase tracking-widest text-muted-foreground/70">Intake</span>
        </h3>
        <IntakeForm
          audit={audit}
          onSubmitted={() => {
            setShowIntake(false);
            if (reload) reload();
          }}
          onCancel={() => setShowIntake(false)}
        />
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
      <h3 className="mb-4 font-heading text-2xl text-foreground">
        {COMPONENT_LABELS[component.key]} <span className="text-muted-foreground/70 text-sm uppercase tracking-widest">Published report</span>
      </h3>
      {component.matrix ? (
        <MatrixView audit={audit} findings={findings} credit={credit} matrixChannels={matrixChannels} leverage={leverage} />
      ) : (
        <PublishedReport audit={audit} findings={findings} credit={credit} />
      )}
    </div>
  );
}