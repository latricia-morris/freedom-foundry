import React, { useState } from 'react';
import { Mic, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const socialLinks = [
  { label: 'Facebook', url: 'https://facebook.com/brandrevivalist', icon: Facebook },
  { label: 'Instagram', url: 'https://instagram.com/the.brand.revivalist', icon: Instagram },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/latricia-morris-447a35199', icon: Linkedin },
  { label: 'YouTube', url: 'https://youtube.com/@brandrevivalist', icon: Youtube },
];

const TBR_LOGO = 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/b99a4000c_60TBRMakersMark_1300x.png';
const OX_IRON_LOGO = 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/7e5b337a9_BlackWideNoBorder-100.jpg';

const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

export default function Contact() {
  const [showMediaForm, setShowMediaForm] = useState(false);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground mb-2">
          <span className="molten-text italic">Contact</span>
        </h1>
        <p className="text-sm text-muted-foreground">Connect with The Brand Revivalist. We're here to help you forge your legacy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* TheBrandRevivalist.com — Brand Consulting */}
        <div className="contact-card">
          <img
            src={TBR_LOGO}
            alt="The Brand Revivalist"
            className="contact-card__logo"
            style={{ height: '56px', width: '56px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <h3 className="font-heading text-xl text-[#1a1420] mb-1">TheBrandRevivalist.com</h3>
            <p className="contact-card__descriptor">Brand Consulting</p>
          </div>
          <p className="text-sm leading-relaxed text-[#2c2c33]">{LOREM}</p>
          <a href="https://thebrandrevivalist.com" target="_blank" rel="noopener noreferrer" className="contact-card__button">
            Get in Touch
          </a>
        </div>

        {/* Ox & Iron, LLC — Design Agency */}
        <div className="contact-card">
          <img
            src={OX_IRON_LOGO}
            alt="Ox & Iron, LLC"
            className="contact-card__logo"
            style={{ mixBlendMode: 'multiply' }}
          />
          <div>
            <h3 className="font-heading text-xl text-[#1a1420] mb-1">Ox &amp; Iron, LLC</h3>
            <p className="contact-card__descriptor">Design Agency</p>
          </div>
          <p className="text-sm leading-relaxed text-[#2c2c33]">{LOREM}</p>
          <a href="https://oxandiron.co" target="_blank" rel="noopener noreferrer" className="contact-card__button">
            Get in Touch
          </a>
        </div>
      </div>

      {/* Speaking & Media Requests */}
      <Dialog open={showMediaForm} onOpenChange={setShowMediaForm}>
        <DialogTrigger asChild>
          <button className="w-full forged-border rounded-2xl bg-card p-6 flex items-center gap-4 text-left transition-all hover:ember-glow-strong">
            <div className="icon-tile">
              <Mic className="w-5 h-5 icon-warm" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-lg text-foreground mb-1">Speaking &amp; Media Requests</h3>
              <p className="text-sm text-muted-foreground">Book Latricia Morris for speaking engagements and media appearances.</p>
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl bg-popover border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-foreground">Speaking &amp; Media Requests</DialogTitle>
          </DialogHeader>
          <div className="overflow-hidden rounded-lg" style={{ maxHeight: '600px' }}>
            <iframe src="https://links.oxandiron.co/widget/form/sRSQvrnrZJQsc2AVtyGi" style={{ border: 'none', width: '100%', minHeight: '550px' }} title="Speaking & Media Requests" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Social Links */}
      <div className="mt-8 pt-8 border-t border-border">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 text-center">Follow The Brand Revivalist</p>
        <div className="flex items-center justify-center gap-4">
          {socialLinks.map(social => {
            const Icon = social.icon;
            return (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full forged-border flex items-center justify-center bg-card text-muted-foreground hover:text-primary transition-colors"
                aria-label={social.label}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}