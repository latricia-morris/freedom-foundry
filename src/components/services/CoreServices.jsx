import React from 'react';
import { Compass, RefreshCw, PenTool, MessageSquare, Globe, Rocket } from 'lucide-react';
import ServiceCard from '@/components/services/ServiceCard';

const SERVICES = [
  {
    id: 'service-brand-strategy',
    icon: Compass,
    title: 'Brand Strategy',
    copy: 'Positioning, audience definition, competitive read, brand architecture, and the decisions that stop a business from competing on price alone. If the strategy is thin, everything downstream is decoration. This is the work that makes the rest of it mean something.',
  },
  {
    id: 'service-rebranding',
    icon: RefreshCw,
    title: 'Rebranding',
    copy: 'A rebrand is surgery, not a makeover. We keep the equity you have earned, retire what is working against you, and rebuild so the market reads the change as intent — not panic. Sequenced properly, handled quietly, launched once.',
  },
  {
    id: 'service-identity',
    icon: PenTool,
    title: 'Brand Identity & Graphic Design',
    copy: 'A logo is not an identity. This is the full system — marks, type, color, layout, and the templates your team actually uses: documents, decks, packaging, campaign assets. Built as one system, so nothing looks like it came from a different company.',
  },
  {
    id: 'service-messaging',
    icon: MessageSquare,
    title: 'Messaging & Copywriting',
    copy: 'What you say is a competitive position, not a writing exercise. Voice, positioning language, website copy, sales materials, and email sequences written to close the distance between what you do and what the market understands you do. No jargon, no hedging.',
  },
  {
    id: 'service-web',
    icon: Globe,
    title: 'Website Strategy, Design & Digital Experience',
    copy: 'Most websites are brochures that lost the argument. This is structure, content strategy, and design built around the decision a visitor has to make — findable in search, legible in five seconds, and maintainable without a developer on retainer.',
  },
  {
    id: 'service-launch',
    icon: Rocket,
    title: 'Launch / Brand Activation',
    copy: 'Launches fail in the seams — assets late, channels unbriefed, message drifting. We sequence the rollout, produce the launch assets, and coordinate the channels so the brand arrives as one deliberate move instead of a loose drip of posts.',
  },
];

export default function CoreServices() {
  return (
    <section id="core-services" aria-labelledby="core-services-title" className="mb-16 md:mb-24 scroll-mt-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-3">Core services</p>
        <h2 id="core-services-title" className="font-heading text-3xl sm:text-4xl font-light text-foreground">
          Seven categories of work.
        </h2>
        <p className="text-base text-muted-foreground mt-3 leading-relaxed">
          Six build the brand. The seventh — Brand Presence Management — keeps it standing.
          Every engagement is scoped to the actual problem, not to a package.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map((service, index) => (
          <ServiceCard key={service.id} number={`0${index + 1}`} {...service} />
        ))}
      </div>
    </section>
  );
}