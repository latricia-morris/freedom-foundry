import React from 'react';
import { LifeBuoy } from 'lucide-react';
import SupportForm from '@/components/support/SupportForm';

export default function Support() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Freedom Foundry</span>
        <h1 className="font-heading text-3xl font-light text-foreground mt-1 mb-1">
          Support <span className="molten-text italic">& Feedback</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Report a problem or suggest an improvement — screenshots help us fix things fast.
        </p>
      </div>
      <div className="editorial-container relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 ember-glow-bg opacity-30 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-2 mb-6">
          <LifeBuoy className="w-4 h-4" style={{ stroke: 'url(#warmGradient)' }} strokeWidth={1.5} />
          <h2 className="font-heading text-lg">Send a Submission</h2>
        </div>
        <div className="relative z-10">
          <SupportForm />
        </div>
      </div>
    </div>
  );
}