import React, { useEffect, useState } from 'react';

/**
 * Sticky in-page pill navigation: scrolls to sections and highlights the
 * one currently in view. Sections are elements carrying the given ids.
 */
export default function AnchorNav({ items }) {
  const [active, setActive] = useState(items?.[0]?.id);

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
  }, [items]);

  if (!items?.length) return null;

  const go = (id) => {
    setActive(id);
    const el = document.getElementById(id);
    if (!el) return;
    const offset = window.innerWidth < 1024 ? 140 : 180;
    const scrollToEl = () => {
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };
    scrollToEl();
    // one correction pass in case layout settles during the first scroll
    setTimeout(() => {
      if (Math.abs(el.getBoundingClientRect().top - offset) > 24) scrollToEl();
    }, 500);
  };

  return (
    <nav aria-label="Section navigation" className="sticky top-20 z-20 mb-2 lg:top-28">
      <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-border/70 bg-card/85 p-1.5 backdrop-blur-md">
        {items.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => go(id)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors ${
              active === id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}