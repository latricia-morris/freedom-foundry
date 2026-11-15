import React, { useEffect, useState } from 'react';
import OfferingCard from '@/components/learn/OfferingCard';
import { learnApi } from '@/lib/learn';

const TABS = [['all', 'Everything'], ['course', 'Courses'], ['book', 'Books']];

export default function LearnLibrary() {
  const [offerings, setOfferings] = useState(null);
  const [tab, setTab] = useState('all');

  useEffect(() => { learnApi('catalog').then((res) => setOfferings(res.offerings)); }, []);

  const shown = (offerings || []).filter((o) => tab === 'all' || o.kind === tab);
  const mine = shown.filter((o) => o.has_access);
  const rest = shown.filter((o) => !o.has_access);

  return (
    <div className="animate-fade-in pb-12">
      <header className="mb-10 max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">The Academy</p>
        <h1 className="mt-2 font-heading text-5xl font-light leading-[1.05] text-foreground">
          Read, listen, and <span className="molten-text italic">do the work</span>
        </h1>
        <p className="mt-4 text-muted-foreground">Courses and books from The Brand Revivalist, with audio and worksheets built in.</p>
      </header>

      <div role="tablist" aria-label="Filter library" className="mb-8 flex gap-6 border-b border-border">
        {TABS.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
            className={`-mb-px border-b-2 pb-3 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${tab === key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {label}
          </button>
        ))}
      </div>

      {!offerings ? (
        <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
      ) : !shown.length ? (
        <p className="py-20 text-center text-muted-foreground">Nothing has been published here yet.</p>
      ) : (
        <div className="space-y-12">
          {mine.length > 0 && (
            <section>
              <h2 className="mb-5 font-heading text-2xl text-foreground">Your library</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{mine.map((o) => <OfferingCard key={o.id} offering={o} />)}</div>
            </section>
          )}
          {rest.length > 0 && (
            <section>
              {mine.length > 0 && <h2 className="mb-5 font-heading text-2xl text-foreground">Explore</h2>}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{rest.map((o) => <OfferingCard key={o.id} offering={o} />)}</div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}