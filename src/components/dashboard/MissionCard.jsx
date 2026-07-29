import React from 'react';
import ProgressRing from '@/components/foundry/ProgressRing';

export default function MissionCard({ completedCount = 0, totalCount = 0 }) {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="relative rounded-2xl overflow-hidden h-full forged-border bg-[#15151f]">
      <div className="p-8 lg:p-12 flex flex-col lg:flex-row-reverse items-center lg:items-start justify-between gap-8">
        <div className="flex-shrink-0 relative">
          <div className="absolute -inset-12 ember-glow-bg opacity-90" />
          <div className="relative z-10">
            <ProgressRing percentage={percentage} size={220} strokeWidth={10} />
          </div>
          <p className="relative z-10 text-center text-sm text-[#f7f2ea]/90 mt-3">
            {completedCount} / {totalCount} Workbooks Completed
          </p>
        </div>
        <div className="flex-1 text-center lg:text-left">
          <span className="text-xs uppercase tracking-[0.3em] text-[#d9c9a3]">
            Brand Progress
          </span>
          <h1 className="font-heading text-3xl lg:text-4xl font-light leading-tight mt-2 text-[#f7f2ea]">
            You're building freedom. <br />We're forging <span className="italic molten-text">legacy.</span>
          </h1>
          <p className="text-base text-[#f7f2ea]/80 max-w-md mx-auto lg:mx-0 mt-4">
            Track your workbook completion and resource activity.
          </p>
        </div>
      </div>
    </div>
  );
}
