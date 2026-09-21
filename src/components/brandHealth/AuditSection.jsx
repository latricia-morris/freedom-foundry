import React from 'react';
import { Link } from 'react-router-dom';
import { COMPONENT_LABELS, PUBLISHED_STATUS, reviewStatusLine } from '@/lib/brandHealth';
import MatrixView from './MatrixView';
import PublishedReport from './PublishedReport';

/**
 * One component's section inside the tab views: empty state, in-review
 * state, or the published report — whichever matches the audit's status.
 */
export default function AuditSection({ component, audit, findings, credit, onOpenStatus }) {
  if (!audit) {
    return (
      <div className="dashboard-card flex flex-col items-center justify-center p-10 text-center">
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{component.missing}</p>
        <Link to="/services" className="link-warm mt-4 inline-block">Explore audit options →</Link>
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
        <MatrixView audit={audit} findings={findings} credit={credit} />
      ) : (
        <PublishedReport audit={audit} findings={findings} credit={credit} />
      )}
    </div>
  );
}