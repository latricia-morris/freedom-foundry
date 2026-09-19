import React from 'react';

export default function ServiceCard({ id, number, icon: Icon, title, copy }) {
  return (
    <article id={id} className="dashboard-card border border-border p-6 flex flex-col gap-4 transition-shadow hover:ember-glow scroll-mt-24">
      <div className="flex items-center justify-between">
        <div className="icon-tile">
          <Icon className="w-5 h-5 text-copper" strokeWidth={1.5} />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 tabular-nums">{number}</span>
      </div>
      <h3 className="font-heading text-xl text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{copy}</p>
    </article>
  );
}