import React from 'react';

const ROWS = [
  ['Finding', 'The homepage names the service category but not who it is for, so first-time visitors have to scroll to learn whether it fits them.'],
  ['Evidence', 'Homepage headline and first screen reviewed on desktop and mobile; the audience appears only in the third section.'],
  ['Implication', 'Qualified visitors may leave before reaching the proof that would earn their trust.'],
  ['Recommendation', 'Name the audience and outcome in the opening line, and move one proof point above the first call to action.'],
];

export default function ReportPreview() {
  return (
    <div className="dashboard-card rounded-[7px] p-6">
      <p className="text-xs font-semibold tracking-[0.14em] text-primary">ILLUSTRATIVE REPORT EXAMPLE</p>
      <dl className="mt-4 grid gap-4 md:grid-cols-2">
        {ROWS.map(([k, v]) => <div key={k}><dt className="text-sm font-semibold text-foreground">{k}</dt><dd className="mt-1 text-sm text-muted-foreground">{v}</dd></div>)}
      </dl>
      <div className="mt-5 border-t border-border pt-4">
        <p className="text-sm font-semibold text-foreground">Marketing Matrix example: Email Marketing</p>
        <p className="mt-1 text-sm text-muted-foreground">Monthly newsletter is consistent but not connected to an offer. Recommendation: maintain the cadence and test one service-focused sequence for new subscribers.</p>
      </div>
    </div>
  );
}