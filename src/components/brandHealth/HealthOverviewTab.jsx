import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { COMPONENTS, PUBLISHED_STATUS, fmtDate, reviewStatusLine } from '@/lib/brandHealth';

/**
 * Overview tab: three identical glass-effect cards, one per audit component.
 * Every card shares the same structure — title, fixed-height descriptor,
 * vertically centered state area, and a bottom-aligned status line with the
 * action link — so the three stay visually equal on desktop and stack on
 * mobile.
 */
export default function HealthOverviewTab({ latest, onOpenStatus, onOpenReport }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
      {COMPONENTS.map((component) => {
        const audit = latest[component.key];
        const published = audit?.status === PUBLISHED_STATUS;
        return (
          <div key={component.key} className="dashboard-card flex flex-col p-6">
            <h3 className="font-heading text-xl text-foreground">{component.title}</h3>
            <p className="mt-2 min-h-12 text-sm leading-relaxed text-muted-foreground">{component.descriptor}</p>

            <div className="flex min-h-44 flex-1 flex-col items-center justify-center py-8 text-center">
              {!audit ? (
                <p className="max-w-64 text-sm leading-relaxed text-muted-foreground">{component.missing}</p>
              ) : published ? (
                component.matrix ? (
                  <div>
                    <Compass className="mx-auto h-9 w-9 text-primary" strokeWidth={1.5} />
                    <p className="mt-3 font-heading text-2xl text-foreground">Market Alignment</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/80">Strategy view</p>
                  </div>
                ) : (
                  <p className="molten-text font-heading text-7xl font-light leading-none">
                    {typeof audit.score === 'number' ? audit.score : '—'}
                    <span className="text-2xl text-muted-foreground" style={{ WebkitTextFillColor: 'hsl(var(--muted-foreground))' }}>/100</span>
                  </p>
                )
              ) : (
                <p className="font-heading text-3xl font-light italic text-muted-foreground">In Review</p>
              )}
            </div>

            <div className="mt-6 flex flex-col items-center gap-2 border-t border-border/40 pt-4 text-center">
              <p className="min-h-4 text-xs text-muted-foreground">
                {!audit
                  ? 'Not started'
                  : published
                    ? `Complete · Reviewed ${fmtDate(audit.reviewed_date)}`
                    : reviewStatusLine(audit, component.matrix)}
              </p>
              {!audit ? (
                <Link to="/services" className="link-warm">Explore audit options →</Link>
              ) : published ? (
                <button type="button" onClick={() => onOpenReport(component.key)} className="link-warm">
                  {component.matrix ? 'View marketing matrix →' : 'View audit →'}
                </button>
              ) : (
                <button type="button" onClick={() => onOpenStatus(audit)} className="link-warm">View audit status →</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}