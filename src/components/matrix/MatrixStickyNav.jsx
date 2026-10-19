import React, { useEffect, useState } from 'react';

/**
 * Compact sticky navigation for the Matrix report: appears once the category
 * overview leaves the viewport. Categories · current category ▾ · back to
 * overview. Respects reduced-motion preferences.
 */
export default function MatrixStickyNav({ items }) {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    if (!items?.length) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const overview = document.getElementById('mx-overview');
    const ovObs = overview
      ? new IntersectionObserver(([e]) => setVisible(!e.isIntersecting), { rootMargin: '-80px 0px 0px 0px' })
      : null;
    if (ovObs) ovObs.observe(overview);

    const secs = items.map(({ id }) => document.getElementById(id)).filter(Boolean);
    const secObs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    secs.forEach((el) => secObs.observe(el));
    return () => {
      ovObs?.disconnect();
      secObs.disconnect();
    };
  }, [items]);

  if (!items?.length) return null;

  const go = (id) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav
      aria-label="Category navigation"
      className={`sticky top-20 z-30 mb-2 transition-opacity duration-300 lg:top-28 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/90 py-1.5 pl-4 pr-1.5 shadow-lg backdrop-blur-md">
        <span className="hidden text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 sm:inline">
          Categories
        </span>
        <select
          aria-label="Jump to category"
          value={active}
          onChange={(e) => go(e.target.value)}
          className="min-w-0 flex-1 cursor-pointer appearance-none truncate rounded-full bg-transparent px-2 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground outline-none [&>option]:bg-card [&>option]:normal-case [&>option]:text-foreground"
        >
          <option value="" disabled>
            Select a category
          </option>
          {items.map(({ id, label }) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => go('mx-overview')}
          className="text-warm shrink-0 rounded-full px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-primary/10"
        >
          ↑ Overview
        </button>
      </div>
    </nav>
  );
}