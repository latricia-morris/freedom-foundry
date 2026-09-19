import React from 'react';
import { Search, Globe, FileText, Linkedin, Mail, Megaphone, ShieldCheck } from 'lucide-react';

const ITEMS = [
  {
    icon: Search,
    title: 'SEO / AEO-informed updates',
    copy: 'Site content structured for how people actually search — including AI-driven search.',
  },
  {
    icon: Globe,
    title: 'Digital footprint support',
    copy: 'Listings, profiles, and public records kept accurate and consistent.',
  },
  {
    icon: FileText,
    title: 'Website updates & content additions',
    copy: 'New pages, offers, and edits handled as they come — no rebuild required.',
  },
  {
    icon: Linkedin,
    title: 'LinkedIn newsletters',
    copy: 'Where relevant, a publishing cadence that keeps leadership visible.',
  },
  {
    icon: Mail,
    title: 'Email marketing support',
    copy: 'Sequences and sends that stay on-brand and on-schedule.',
  },
  {
    icon: Megaphone,
    title: 'Select social graphics & posting',
    copy: 'Designed materials and posting support where social genuinely contributes.',
  },
  {
    icon: ShieldCheck,
    title: 'Brand consistency reviews',
    copy: 'Public-facing materials checked against the brand standard before they ship.',
  },
];

export default function PresenceSupport() {
  return (
    <section aria-labelledby="presence-title" className="mb-16 md:mb-24">
      <div className="dashboard-card border border-border p-6 sm:p-10">
        <div className="mb-8 max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-3">Ongoing support</p>
          <h2 id="presence-title" className="font-heading text-3xl sm:text-4xl font-light text-foreground">
            Brand Presence Management.
          </h2>
          <p className="text-base text-muted-foreground mt-3 leading-relaxed">
            After a build, rebrand, or launch, the brand still has to show up consistently in public.
            This is ongoing support for that work — brand presence support, not social media management.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
          {ITEMS.map((item) => (
            <div key={item.title} className="flex items-start gap-3.5">
              <span className="w-9 h-9 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </span>
              <div>
                <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}