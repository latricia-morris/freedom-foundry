import React from 'react';

/**
 * Suggested actions, elevated: a full-width forged-gradient container that
 * reads as the priority takeaway of the page. Accepts plain strings or
 * { title, detail } items.
 */
export default function GradientActions({ id, title = 'Suggested Actions', subtitle, items, footer }) {
  const list = (items || []).filter(Boolean);
  if (!list.length) return null;

  return (
    <section id={id} className="action-gradient scroll-mt-32 p-6 sm:p-10 lg:scroll-mt-44">
      <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/[0.07] blur-2xl" />
      <div className="relative">
        <h3 className="font-heading text-2xl font-light text-white sm:text-3xl">{title}</h3>
        {subtitle && <p className="mt-1.5 text-sm text-white/75">{subtitle}</p>}
        <ol className="mt-6 space-y-5">
          {list.map((raw, i) => {
            const item = typeof raw === 'string' ? { title: raw } : raw;
            return (
              <li key={i} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-xs font-semibold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="break-words text-base font-medium leading-snug text-white">{item.title}</p>
                  {item.detail && (
                    <p className="mt-1 break-words text-sm leading-relaxed text-white/75">{item.detail}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        {footer && <p className="mt-7 border-t border-white/20 pt-4 text-xs leading-relaxed text-white/70">{footer}</p>}
      </div>
    </section>
  );
}