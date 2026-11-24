import React, { useEffect, useState } from 'react';

/**
 * Sticky in-page pill navigation: scrolls to sections and highlights the
 * one currently in view. Sections are elements carrying the given ids.
 */
export default function AnchorNav({ items }) {
  const [active, setActive] = useState(items?.[0]?.id);
  // Re-observe only when the set of sections changes, not on every render.
  const key = (items || []).map((i) => i.id).join('|');

  useEffect(() => {
    if (!items?.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    for (const { id } of items) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!items?.length) return null;

  // scrollIntoView follows whichever element actually scrolls (window or an
  // inner container), and each section's scroll-mt keeps it clear of the nav.
  const go = (id) => {
    setActive(id);
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav aria-label="Section navigation" className="sticky top-20 z-20 mb-2 lg:top-28">
      <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-border/70 bg-card/85 p-1.5 backdrop-blur-md">
        {items.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              go(id);
            }}
            aria-current={active === id ? 'true' : undefined}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors ${
              active === id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}