import React from 'react';
import { Anvil } from 'lucide-react';
import ProgressRing from '@/components/foundry/ProgressRing';

export default function MissionCard({ completedCount = 0, totalCount = 0 }) {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="relative forged-border rounded-2xl bg-card overflow-hidden">
      <div className="p-6 lg:p-10 flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
            <Anvil className="w-4 h-4 icon-warm" strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">The Mission</span>
          </div>
          <h1 className="font-heading text-3xl lg:text-4xl font-light leading-tight text-foreground mb-3">
            Your <span className="molten-text italic">Progress</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed mx-auto lg:mx-0">
            Track your workbook completion and resource activity.
          </p>
        </div>
        <div className="flex-shrink-0 relative">
          <div className="absolute -inset-10 ember-glow-bg" />
          <div className="relative z-10">
            <ProgressRing percentage={percentage} size={220} strokeWidth={18} label={`${percentage}%`} sublabel="Overall Progress" />
          </div>
          <p className="relative z-10 text-center text-xs text-muted-foreground mt-3 uppercase tracking-widest">
            {completedCount} / {totalCount} Workbooks Completed
          </p>
        </div>
      </div>
    </div>
  );
}