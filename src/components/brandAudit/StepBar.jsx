import React from 'react';
import { STEPS } from '@/lib/brandAudit';

export default function StepBar({ step, onJump }) {
  return (
    <nav aria-label="Request progress">
      <p className="mb-2 text-sm text-muted-foreground sm:hidden">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
      <ol className="hidden flex-wrap gap-2 sm:flex">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button type="button" onClick={() => onJump(i)} disabled={i >= step} aria-current={i === step ? 'step' : undefined}
              className={`${i === step ? 'request-primary' : 'request-choice'} min-h-[40px] px-4 py-2 text-sm disabled:cursor-default ${i > step ? 'opacity-60' : ''}`}>
              {i + 1}. {label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}