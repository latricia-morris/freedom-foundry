import React, { useState } from 'react';
import { Mic, ExternalLink, Mail, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const socialLinks = [
  { label: 'Facebook', url: 'https://facebook.com/brandrevivalist', icon: Facebook },
  { label: 'Instagram', url: 'https://instagram.com/the.brand.revivalist', icon: Instagram },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/latricia-morris-447a35199', icon: Linkedin },
  { label: 'YouTube', url: 'https://youtube.com/@brandrevivalist', icon: Youtube },
];

export default function Contact() {
  const [showMediaForm, setShowMediaForm] = useState(false);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground mb-2"><span className="molten-text italic">Contact</span></h1>
        <p className="text-sm text-muted-foreground">Connect with The Brand Revivalist. We're here to help you forge your legacy.</p>
      </div>

      <div className="space-y-4">
        <Dialog open={showMediaForm} onOpenChange={setShowMediaForm}>
          <DialogTrigger asChild>
            <button className="w-full forged-border rounded-2xl bg-card p-6 flex items-center gap-4 text-left transition-all hover:ember-glow-strong">
              <div className="w-12 h-12 rounded-full forged-border flex items-center justify-center bg-background flex-shrink-0"><Mic className="w-5 h-5 text-primary" strokeWidth={1.5} /></div>
              <div className="flex-1"><h3 className="font-heading text-lg text-foreground mb-1">Speaking & Media Requests</h3><p className="text-sm text-muted-foreground">Book Latricia Morris for speaking engagements and media appearances.</p></div>
              <ExternalLink className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-popover border-border">
            <DialogHeader><DialogTitle className="font-heading text-xl text-foreground">Speaking & Media Requests</DialogTitle></DialogHeader>
            <div className="overflow-hidden rounded-lg" style={{ maxHeight: '600px' }}>
              <iframe src="https://links.oxandiron.co/widget/form/sRSQvrnrZJQsc2AVtyGi" style={{ border: 'none', width: '100%', minHeight: '550px' }} title="Speaking & Media Requests" />
            </div>
          </DialogContent>
        </Dialog>

        <a href="https://thebrandrevivalist.com" target="_blank" rel="noopener noreferrer" className="w-full forged-border rounded-2xl bg-card p-6 flex items-center gap-4 transition-all hover:ember-glow-strong">
          <div className="w-12 h-12 rounded-full forged-border flex items-center justify-center bg-background flex-shrink-0"><ExternalLink className="w-5 h-5 text-primary" strokeWidth={1.5} /></div>
          <div className="flex-1"><h3 className="font-heading text-lg text-foreground mb-1">Brand Consulting</h3><p className="text-sm text-muted-foreground">Strategic brand consulting with The Brand Revivalist.</p></div>
          <ExternalLink className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
        </a>

        <a href="https://oxandiron.co" target="_blank" rel="noopener noreferrer" className="w-full forged-border rounded-2xl bg-card p-6 flex items-center gap-4 transition-all hover:ember-glow-strong">
          <div className="w-12 h-12 rounded-full forged-border flex items-center justify-center bg-background flex-shrink-0"><ExternalLink className="w-5 h-5 text-primary" strokeWidth={1.5} /></div>
          <div className="flex-1"><h3 className="font-heading text-lg text-foreground mb-1">Design Agency</h3><p className="text-sm text-muted-foreground">Ox & Iron — full-service design and creative agency.</p></div>
          <ExternalLink className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
        </a>

        <a href="mailto:onbrand@oxandiron.co" className="w-full forged-border rounded-2xl bg-card p-6 flex items-center gap-4 transition-all hover:ember-glow-strong">
          <div className="w-12 h-12 rounded-full forged-border flex items-center justify-center bg-background flex-shrink-0"><Mail className="w-5 h-5 text-primary" strokeWidth={1.5} /></div>
          <div className="flex-1"><h3 className="font-heading text-lg text-foreground mb-1">Email Us</h3><p className="text-sm text-muted-foreground">onbrand@oxandiron.co</p></div>
          <Mail className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
        </a>
      </div>

      <div className="mt-8 pt-8 border-t border-border">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 text-center">Follow The Brand Revivalist</p>
        <div className="flex items-center justify-center gap-4">
          {socialLinks.map(social => {
            const Icon = social.icon;
            return (
              <a key={social.label} href={social.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full forged-border flex items-center justify-center bg-card text-muted-foreground hover:text-primary transition-colors" aria-label={social.label}>
                <Icon className="w-4 h-4" strokeWidth={1.5} />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}