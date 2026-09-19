import React from 'react';

const SCOPE = [
  { label: 'Brand Strategy', href: '#service-brand-strategy' },
  { label: 'Rebranding', href: '#service-rebranding' },
  { label: 'Identity & Design', href: '#service-identity' },
  { label: 'Messaging & Copy', href: '#service-messaging' },
  { label: 'Web & Digital', href: '#service-web' },
  { label: 'Launch & Activation', href: '#service-launch' },
  { label: 'Brand Presence Management', href: '#presence-management' },
];

export default function ServicesHero() {
  return (
    <header className="relative mb-14 md:mb-20">
      <div className="absolute -left-10 -top-10 w-64 h-64 ember-glow-bg pointer-events-none" aria-hidden="true" />
      <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-5">Services</p>
      <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-foreground leading-[1.05] max-w-3xl">
        Most branding is decoration.
        <br />
        This is the <span className="molten-text italic font-medium">work underneath.</span>
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mt-6">
        The Brand Revivalist handles the full arc of a brand — positioning, rebranding, identity,
        messaging, the website, the launch, and the presence that has to hold long after launch day.
        Seven categories of work, one operating standard: a brand that knows what it is
        doesn't waste money pretending otherwise.
      </p>
      <nav aria-label="Service areas" className="flex flex-wrap gap-2 mt-8">
        {SCOPE.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground border border-border hover:border-primary/60 rounded-sm px-3 py-1.5 transition-colors"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}