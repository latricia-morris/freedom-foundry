import React from 'react';

export default function CaseStudySection({ label, title, children }) {
  return (
    <section className="border-t border-border pt-8">
      <p className="text-xs uppercase tracking-[0.24em] text-primary/80">{label}</p>
      {title && <h2 className="mt-3 font-heading text-3xl font-light text-foreground">{title}</h2>}
      <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}