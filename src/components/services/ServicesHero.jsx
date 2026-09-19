import React from 'react';

const SCOPE = [
  'Brand Strategy',
  'Rebranding',
  'Identity & Design',
  'Messaging & Copy',
  'Web & Digital',
  'Launch & Activation',
];

export default function ServicesHero() {
  return (
    <header className="relative mb-14 md:mb-20">
      <div className="absolute -left-10 -top-10 w-64 h-64 ember-glow-bg pointer-events-none" aria-hidden="true" />
      <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-5">Services</p>
      <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-foreground leading-[1.05] max-w-3xl">
        Brands don't need everything.
        <br />
        They need the right work, <span className="molten-text italic font-medium">done properly.</span>
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mt-6">
        The Brand Revivalist works across the full arc of a brand — strategy and rebranding,
        identity and design, messaging, websites, launch activation, and ongoing brand presence.
        Every engagement is scoped to the business in front of us, not sold as a package.
      </p>
      <nav aria-label="Service areas" className="flex flex-wrap gap-2 mt-8">
        {SCOPE.map((item) => (
          <span
            key={item}
            className="text-[10px] uppercase tracking-widest text-muted-foreground border border-border rounded-sm px-3 py-1.5"
          >
            {item}
          </span>
        ))}
      </nav>
    </header>
  );
}