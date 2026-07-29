import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, PenTool, Code } from 'lucide-react';

const services = [
  { type: 'branding', title: 'Branding Services', description: 'Strategic brand development, identity design, and positioning that sets you apart.', icon: Palette },
  { type: 'design', title: 'Graphic Design', description: 'Custom design solutions for digital and print — from social media to full campaigns.', icon: PenTool },
  { type: 'software', title: 'Software & Assets', description: 'SEO, content fulfillment, and digital asset solutions powered by FatJoe and partners.', icon: Code },
];

export default function ServiceHub() {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground mb-2">Collaborations</h1>
        <p className="text-sm text-muted-foreground">Choose a service category to get started. We'll be in touch soon.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map(service => {
          const Icon = service.icon;
          return (
            <Link key={service.type} to={`/services/${service.type}`} className="dashboard-card p-6 group transition-all duration-300">
              <div className="icon-tile mb-4">
                <Icon className="w-5 h-5 icon-warm" strokeWidth={1.5} />
              </div>
              <h3 className="font-heading text-lg text-foreground mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
              <span className="link-warm">Get Started</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}