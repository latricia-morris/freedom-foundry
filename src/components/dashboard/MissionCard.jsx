import React from 'react';
import ProgressRing from '@/components/foundry/ProgressRing';

export default function MissionCard({ completedCount = 0, totalCount = 0 }) {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="relative rounded-2xl overflow-hidden h-full" style={{ background: '#000000' }}>
      <div className="p-6 lg:p-10 flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-1 text-center lg:text-left">
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground block mb-4">Brand Progress</span>
          <h1 className="font-heading text-2xl lg:text-3xl font-light leading-tight text-foreground mb-3">
            You're building freedom. <br />We're forging <span className="molten-text italic">legacy.</span>
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