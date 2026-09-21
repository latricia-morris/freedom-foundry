import React from 'react';
import { Lock } from 'lucide-react';

/**
 * Visibly locked teaser for the withheld action plan. Shows a blurred
 * skeleton so the withheld value is apparent without revealing any content.
 */
export default function LockedActionPlan({ label = 'Full action plan available with your engagement' }) {
  return (
    <div className="relative overflow-hidden rounded-sm border border-border bg-card/60">
      <div aria-hidden="true" className="pointer-events-none select-none space-y-3 p-6 blur-[7px]">
        <div className="h-4 w-1/3 rounded-sm bg-muted" />
        <div className="h-2.5 w-full rounded-sm bg-muted" />
        <div className="h-2.5 w-11/12 rounded-sm bg-muted" />
        <div className="h-2.5 w-4/5 rounded-sm bg-muted" />
        <div className="h-2.5 w-2/3 rounded-sm bg-muted" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/40 px-6 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/40 bg-background">
          <Lock className="h-5 w-5 text-primary" strokeWidth={1.5} />
        </div>
        <p className="max-w-xs text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}