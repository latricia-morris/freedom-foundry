import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, PenTool, Globe, Code } from 'lucide-react';
import Testimonials from '@/components/shared/Testimonials';

const TBR_LOGO = 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/b99a4000c_60TBRMakersMark_1300x.png';
const OX_IRON_LOGO = 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/7e5b337a9_BlackWideNoBorder-100.jpg';

const serviceCategories = [
  {
    type: 'branding',
    title: 'Strategy & Identity',
    provider: 'The Brand Revivalist',
    description: 'Identity clarifies who the brand is, and strategy decides how it shows up. Strong brands are built on a defined core, sharp positioning, and value expressed with precision.',
    offerings: [
      'Brand Discovery and Research',
      'Brand Architecture and Positioning',
      'Audience Mapping and Competitive Analysis',
      'Messaging Frameworks and Brand Voice Development',
      'Story Branding',
      'Logo Design and Identity Systems',
      'Iconography and Typography Systems',
      'Comprehensive Brand Guideline Development',
    ],
    icon: Palette,
  },
  {
    type: 'design',
    title: 'Brand Collateral & Assets',
    provider: 'Ox & Iron',
    description: 'Execution carries the brand identity into tangible assets and materials. The key is impact over volume, so your message draws the right people closer, faster.',
    offerings: [
      'Print Collateral (brochures, sell sheets, stationery)',
      'Packaging Design',
      'Trade Show & Event Materials',
      'Social Assets and Ad Creative',
      'Digital Design (email templates, digital ads)',
      'Copywriting',
    ],
    icon: PenTool,
  },
  {
    type: 'branding',
    title: 'Digital Presence',
    provider: 'The Brand Revivalist',
    description: 'Execution carries the brand identity into digital channels. Identity must be defined clearly enough that the right people recognize themselves in it.',
    offerings: [
      'Custom Website Design and Development',
      'UX/UI and Information Architecture',
      'Website Copywriting',
      'SEO Copywriting',
      'CRM Integration and Lead Capture Development',
    ],
    icon: Globe,
  },
  {
    type: 'software',
    title: 'Software & Tools',
    provider: 'Freedom Foundry',
    description: 'SaaS solutions, digital tools, and carefully curated affiliate resources to help you build, automate, and scale your brand infrastructure.',
    offerings: [
      'Brand Management Platform (Freedom Foundry)',
      'Workflow & Automation Tools',
      'SEO & Content Fulfillment (via FatJoe)',
      'Curated Software Recommendations',
      'Affiliate Resources & Partner Tools',
    ],
    icon: Code,
  },
];

export default function ServiceHub() {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground mb-2">
          Resources <span className="molten-text italic">Hub</span>
        </h1>
        <p className="text-sm text-muted-foreground">A menu of offerings from The Brand Revivalist, Ox &amp; Iron, and our trusted partners.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {serviceCategories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <div key={i} className="dashboard-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-tile">
                  <Icon className="w-5 h-5 icon-warm" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-heading text-lg text-foreground">{cat.title}</h3>
                  <span className="text-[10px] uppercase tracking-widest text-[#d9c9a3]">{cat.provider}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{cat.description}</p>
              <ul className="space-y-1.5 mb-5">
                {cat.offerings.map((offering, j) => (
                  <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {offering}
                  </li>
                ))}
              </ul>
              <Link to={`/services/${cat.type}`} className="link-warm">Get Started</Link>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] uppercase tracking-[0.3em] text-[#d9c9a3] mb-4">Get In Touch Directly</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="contact-card">
          <img src={TBR_LOGO} alt="The Brand Revivalist" className="contact-card__logo" style={{ height: '56px', width: '56px', borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <h3 className="font-heading text-xl text-[#1a1420] mb-1">TheBrandRevivalist.com</h3>
            <p className="contact-card__descriptor">Brand Strategy &amp; Consulting</p>
          </div>
          <p className="text-sm leading-relaxed text-[#2c2c33]">Brand strategy, positioning, and messaging for founders ready to own their market.</p>
          <a href="https://thebrandrevivalist.com" target="_blank" rel="noopener noreferrer" className="contact-card__button">Get in Touch</a>
        </div>
        <div className="contact-card">
          <img src={OX_IRON_LOGO} alt="Ox & Iron, LLC" className="contact-card__logo" style={{ mixBlendMode: 'multiply' }} />
          <div>
            <h3 className="font-heading text-xl text-[#1a1420] mb-1">Ox &amp; Iron, LLC</h3>
            <p className="contact-card__descriptor">Design &amp; Creative Direction</p>
          </div>
          <p className="text-sm leading-relaxed text-[#2c2c33]">Full-service design and creative direction for brands that refuse to blend in.</p>
          <a href="https://oxandiron.co" target="_blank" rel="noopener noreferrer" className="contact-card__button">Get in Touch</a>
        </div>
      </div>

      <Testimonials />
    </div>
  );
}