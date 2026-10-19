import React from 'react';

const ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'project', label: 'Your Project' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'investment', label: 'Investment' },
  { id: 'agreement', label: 'Agreement' },
  { id: 'accept', label: 'Accept & Pay' },
];

export const PROPOSAL_SECTIONS = ITEMS;

/** Six-category navigation: left rail on desktop, compact menu on mobile. */
export default function ProposalNav({ active }) {
  return (
    <>
      <aside className="hidden flex-shrink-0 flex-col border border-border bg-card/75 p-4 lg:sticky lg:top-28 lg:flex lg:h-fit lg:w-56">
        <p className="mb-3 px-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Proposal</p>
        <nav aria-label="Proposal sections" className="flex flex-col gap-1">
          {ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={active === item.id ? 'true' : undefined}
              className={`border-l-2 px-3 py-2.5 text-sm transition-colors duration-200 ${
                active === item.id
                  ? 'border-transparent font-medium text-foreground bg-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      <div className="lg:hidden">
        <nav aria-label="Proposal sections" className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1.5">
          {ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium ${
                active === item.id ? 'bg-accent text-foreground' : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}