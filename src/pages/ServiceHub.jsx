import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, PenTool, Code, ArrowRight, Sparkles } from 'lucide-react';

const services = [
  { type: 'branding', title: 'Branding Services', description: 'Strategic brand development, identity design, and positioning that sets you apart.', icon: Palette },
  { type: 'design', title: 'Graphic Design', description: 'Custom design solutions for digital and print — from social media to full campaigns.', icon: PenTool },
  { type: 'software', title: 'Software & Assets', description: 'SEO, content fulfillment, and digital asset solutions powered by FatJoe and partners.', icon: Code },
];

export default function ServiceHub() {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground mb-2">Service <span className="molten-text italic">Requests</span></h1>
        <p className="text-sm text-muted-foreground">Choose a service category to get started. We'll be in touch soon.</p>
      </div>

      <div className="forged-border rounded-2xl bg-card p-6 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-12 h-12 rounded-full forged-border flex items-center justify-center bg-background"><Sparkles className="w-5 h-5 text-primary" strokeWidth={1.5} /></div>
        <div className="flex-1 text-center sm:text-left"><h3 className="font-heading text-lg text-foreground mb-1">GoHighLevel CRM</h3><p className="text-xs text-muted-foreground">Power your business with the same CRM platform that runs Freedom Foundry.</p></div>
        <a href="https://www.gohighlevel.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 forged-border rounded-lg text-xs uppercase tracking-widest text-primary hover:text-copper transition-colors">Learn More →</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map(service => {
          const Icon = service.icon;
          return (
            <Link key={service.type} to={`/services/${service.type}`} className="group forged-border rounded-2xl bg-card p-6 transition-all duration-300 hover:ember-glow-strong">
              <div className="w-12 h-12 rounded-full forged-border flex items-center justify-center bg-background mb-4"><Icon className="w-5 h-5 text-primary" strokeWidth={1.5} /></div>
              <h3 className="font-heading text-lg text-foreground mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
              <span className="text-xs uppercase tracking-widest text-primary group-hover:text-copper transition-colors flex items-center gap-1">Get Started <ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}