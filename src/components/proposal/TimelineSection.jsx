import React from 'react';
import { TIMELINE_INTRO } from '@/lib/proposalAgencyClient';

/**
 * Timeline: one dataset drives the desktop phase chart, the mobile stacked
 * timeline, and the milestone table. All timing is labeled estimated.
 */
export default function TimelineSection({ proposal }) {
  const timeline = proposal.timeline || {};
  const phases = timeline.phases || [];
  const milestones = timeline.milestones || [];

  return (
    <section id="timeline" className="scroll-mt-24 space-y-10">
      <div>
        <p className="text-warm text-[11px] font-semibold uppercase tracking-[0.16em]">Timeline</p>
        <h2 className="mt-1 font-heading text-3xl font-light text-foreground sm:text-4xl">How the project moves forward.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{timeline.intro || TIMELINE_INTRO}</p>
      </div>

      <div>
        <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Estimated sequence</p>
        {phases.length ? (
          <>
            <div className="hidden gap-1 md:flex" aria-hidden="true">
              {phases.map((p, i) => (
                <div
                  key={p.name}
                  className="molten-bar h-2 flex-1 rounded-full"
                  style={{ opacity: 0.45 + (i / Math.max(1, phases.length - 1)) * 0.55 }}
                  title={p.name}
                />
              ))}
            </div>
            <div className="mt-1.5 hidden gap-1 md:flex">
              {phases.map((p) => (
                <p key={p.name} className="flex-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">{p.name}</p>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <th className="py-2.5 pr-4 font-semibold">Phase</th>
              <th className="py-2.5 pr-4 font-semibold">Deliverable / action</th>
              <th className="py-2.5 pr-4 font-semibold">Estimated timing or condition</th>
              <th className="py-2.5 font-semibold">Dependency</th>
            </tr>
          </thead>
          <tbody>
            {phases.map((p) => (
              <tr key={p.name} className="border-b border-border/50 align-top">
                <td className="py-3 pr-4 font-medium text-foreground">{p.name}</td>
                <td className="py-3 pr-4 text-muted-foreground">{p.action}</td>
                <td className="py-3 pr-4 text-muted-foreground">{p.timing}</td>
                <td className="py-3 text-muted-foreground">{p.dependency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {phases.map((p) => (
          <div key={p.name} className="dashboard-card p-4">
            <p className="font-heading text-lg text-foreground">{p.name}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.action}</p>
            <p className="mt-1 text-xs text-muted-foreground">Timing: {p.timing}</p>
            {p.dependency ? <p className="mt-0.5 text-xs text-muted-foreground">Depends on: {p.dependency}</p> : null}
          </div>
        ))}
      </div>

      {milestones.length ? (
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Payment milestones</p>
          <ul className="space-y-2">
            {milestones.map((m, i) => (
              <li key={`${m.description}-${i}`} className="flex flex-wrap gap-2 text-sm">
                <span className="font-medium text-foreground">{m.description}</span>
                <span className="text-muted-foreground">{m.due_event}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">All dates on this page are estimates unless expressly identified as a binding deadline in a signed amendment.</p>
    </section>
  );
}