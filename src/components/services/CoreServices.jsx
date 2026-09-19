import React from 'react';
import { Compass, RefreshCw, PenTool, MessageSquare, Globe, Rocket } from 'lucide-react';
import ServiceCard from '@/components/services/ServiceCard';

const SERVICES = [
  {
    icon: Compass,
    title: 'Brand Strategy',
    copy: 'Positioning, audience definition, competitive read, and brand architecture. The strategy phase settles what the brand stands for, who it serves, and how it should show up — before anything gets designed.',
  },
  {
    icon: RefreshCw,
    title: 'Rebranding',
    copy: 'For brands whose current identity no longer fits the business. We assess what equity to keep, what to retire, and how to rebuild without losing recognition in the market or clarity inside the company.',
  },
  {
    icon: PenTool,
    title: 'Brand Identity & Graphic Design',
    copy: 'Logo systems, typography, color, and the collateral that carries them — documents, templates, decks, and campaign assets designed to work as one system rather than as one-offs.',
  },
  {
    icon: MessageSquare,
    title: 'Messaging & Copywriting',
    copy: 'Voice, positioning language, and the words the business publishes: website copy, sales materials, and marketing sequences written to say clearly what the company does and why it matters.',
  },
  {
    icon: Globe,
    title: 'Website Strategy, Design & Digital Experience',
    copy: 'Structure, content strategy, and design for websites built to be found, understood, and acted on — delivered with what your team needs to keep the site current.',
  },
  {
    icon: Rocket,
    title: 'Launch / Brand Activation',
    copy: 'Launch planning and rollout for new brands and rebrands: sequencing, launch assets, channel readiness, and coordination, so the brand enters the market as one coherent move.',
  },
];

export default function CoreServices() {
  return (
    <section id="core-services" aria-labelledby="core-services-title" className="mb-16 md:mb-24 scroll-mt-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-3">Core services</p>
        <h2 id="core-services-title" className="font-heading text-3xl sm:text-4xl font-light text-foreground">
          Six areas of work.
        </h2>
        <p className="text-base text-muted-foreground mt-3 leading-relaxed">
          Each engagement is strategy-led and built for the business in front of us — no template decks, no recycled playbooks.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map((service, index) => (
          <ServiceCard key={service.title} number={`0${index + 1}`} {...service} />
        ))}
      </div>
    </section>
  );
}