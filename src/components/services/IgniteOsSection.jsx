import React from 'react';
import { ListChecks, UserCheck, Zap, LifeBuoy } from 'lucide-react';

const PILLARS = [
  {
    icon: ListChecks,
    title: 'Structure',
    copy: 'Every launch step defined and sequenced in one place — nothing living in a scattered doc.',
  },
  {
    icon: UserCheck,
    title: 'Ownership',
    copy: 'Each task has a name on it, not a group chat.',
  },
  {
    icon: Zap,
    title: 'Momentum',
    copy: 'The rollout moves on schedule, with fewer dropped threads and fewer internal scrambles.',
  },
  {
    icon: LifeBuoy,
    title: 'Support',
    copy: 'Guidance through each phase of the rollout — not a handoff and a goodbye.',
  },
];

export default function IgniteOsSection() {
  return (
    <section aria-labelledby="ignite-title" className="mb-16 md:mb-24">
      <div className="dashboard-card border border-primary/25 p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 ember-glow-bg pointer-events-none" aria-hidden="true" />
        <div className="mb-8 max-w-2xl relative">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-3">Proprietary framework</p>
          <h2 id="ignite-title" className="font-heading text-3xl sm:text-4xl font-light text-foreground">
            Ignite <span className="molten-text italic font-medium">OS</span>
          </h2>
          <p className="text-base text-muted-foreground mt-3 leading-relaxed">
            Ignite OS is our brand launch and activation framework. It coordinates the rollout and
            execution side of a launch — the part that usually lives in scattered documents and unanswered messages.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6 relative">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="flex items-start gap-3.5">
              <span className="w-9 h-9 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
                <pillar.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </span>
              <div>
                <h3 className="text-sm font-medium text-foreground">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">{pillar.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}