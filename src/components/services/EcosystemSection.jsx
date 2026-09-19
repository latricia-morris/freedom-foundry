import React from 'react';
import { Boxes, BookOpen, BadgeCheck } from 'lucide-react';

const BLOCKS = [
  {
    icon: Boxes,
    title: 'Freedom Foundry',
    copy: 'Our client portal and support environment — guided brand resources, asset management, and a direct line for service requests. The working relationship between engagements, not a substitute for one.',
  },
  {
    icon: BookOpen,
    title: 'Guided tools & resources',
    copy: 'Workbooks, courses, and platform-based tools for the work that happens before, between, and after engagements. Practical material — no padded curriculum.',
  },
  {
    icon: BadgeCheck,
    title: 'Vetted software & partners',
    copy: 'A short list of software and partners used in real client work — some affiliate-supported. Every one earns its place or comes off the list. None are required, and none stand in for the services above.',
  },
];

export default function EcosystemSection() {
  return (
    <section id="ecosystem" aria-labelledby="ecosystem-title" className="mb-16 md:mb-24 scroll-mt-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-3">Additional support</p>
        <h2 id="ecosystem-title" className="font-heading text-3xl sm:text-4xl font-light text-foreground">
          Tools, platforms & resources.
        </h2>
        <p className="text-base text-muted-foreground mt-3 leading-relaxed">
          The work does not end when the engagement does. These support implementation and growth.
          They are not the service.
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {BLOCKS.map((block) => (
          <article key={block.title} className="rounded-lg border border-border bg-secondary/40 p-6">
            <block.icon className="w-5 h-5 text-muted-foreground mb-4" strokeWidth={1.5} />
            <h3 className="font-heading text-lg text-foreground mb-2">{block.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{block.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}