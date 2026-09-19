import React from 'react';
import { Search, Globe, FileText, Linkedin, Mail, Megaphone, ShieldCheck } from 'lucide-react';

const ITEMS = [
  {
    icon: Search,
    title: 'SEO / AEO-informed updates',
    copy: 'Content structured for how people actually search — including AI-driven search, which most of the industry still treats like a rumor.',
  },
  {
    icon: Globe,
    title: 'Digital footprint support',
    copy: 'Listings, profiles, and public records kept accurate. A sloppy footprint undermines credibility before the conversation starts.',
  },
  {
    icon: FileText,
    title: 'Website updates & content additions',
    copy: 'New pages, offers, and edits as they come — the site stays current without a rebuild every time something changes.',
  },
  {
    icon: Linkedin,
    title: 'LinkedIn newsletters',
    copy: 'Where leadership visibility matters, a publishing cadence that holds — written for the reader, not ghosted into thought-leadership filler.',
  },
  {
    icon: Mail,
    title: 'Email marketing support',
    copy: 'Sequences and sends that stay on-brand, on-schedule, and worth opening.',
  },
  {
    icon: Megaphone,
    title: 'Select social graphics & posting',
    copy: 'Graphics and posting support where social genuinely earns its place. Where it does not, we say so.',
  },
  {
    icon: ShieldCheck,
    title: 'Brand consistency reviews',
    copy: 'Public-facing materials checked against the brand standard before they ship. Consistency is what makes the spend compound.',
  },
];

export default function PresenceSupport() {
  return (
    <section id="presence-management" aria-labelledby="presence-title" className="mb-16 md:mb-24 scroll-mt-8">
      <div className="dashboard-card border border-border p-6 sm:p-10">
        <div className="mb-8 max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-3">Ongoing support · 07</p>
          <h2 id="presence-title" className="font-heading text-3xl sm:text-4xl font-light text-foreground">
            Brand Presence Management.
          </h2>
          <p className="text-base text-muted-foreground mt-3 leading-relaxed">
            Most brands launch well and then quietly stop maintaining the brand. Presence Management
            is the discipline that prevents the fade — ongoing, deliberate, and held to the brand standard.
            This is brand presence support, not social media management.
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