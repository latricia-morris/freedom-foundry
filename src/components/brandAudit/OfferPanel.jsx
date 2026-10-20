import React from 'react';
import { Check } from 'lucide-react';

export default function OfferPanel({ selected, title, headline, price, copy, deliverable, scope, value, cta, onChoose }) {
  return (
    <article className={`dashboard-card flex flex-col rounded-[7px] p-6 ${selected ? 'ring-1 ring-primary' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.14em] text-primary">{title.toUpperCase()}</p>
        {selected && <span className="inline-flex items-center gap-1 text-xs text-foreground"><Check className="h-3.5 w-3.5" aria-hidden="true" /> Selected</span>}
      </div>
      <h3 className="mt-3 font-heading text-2xl font-light leading-snug sm:text-3xl">{headline}</h3>
      <p className="mt-2 text-lg font-semibold">{price}</p>
      <p className="mt-3 text-muted-foreground">{copy}</p>
      <p className="mt-3 text-muted-foreground">{deliverable}</p>
      <p className="forged-well mt-3 p-3 text-sm text-muted-foreground">{scope}</p>
      <p className="mt-3 text-sm text-muted-foreground">{value}</p>
      <button type="button" aria-pressed={selected} onClick={onChoose} className="request-primary mt-6 min-h-[44px] self-start px-5 py-2.5 text-sm font-semibold">{cta}</button>
    </article>
  );
}