import React from 'react';
import { CreditCard, Check, Lock } from 'lucide-react';

export default function Billing() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-light text-foreground mb-2">Billing & <span className="molten-text italic">Subscriptions</span></h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and billing preferences.</p>
      </div>

      <div className="forged-border rounded-2xl bg-card p-6 lg:p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full forged-border flex items-center justify-center bg-background"><Check className="w-5 h-5 text-primary" strokeWidth={1.5} /></div>
            <div><h2 className="font-heading text-lg text-foreground">Founding Member</h2><p className="text-xs text-muted-foreground">Free Access</p></div>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs uppercase tracking-widest">Active</span>
        </div>
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Current Plan</span><span className="text-sm text-foreground">Free Founding Member</span></div>
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Price</span><span className="text-sm text-foreground">$0 / month</span></div>
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Renewal</span><span className="text-sm text-foreground">No expiration</span></div>
        </div>
      </div>

      <div className="forged-border rounded-2xl bg-card p-6 lg:p-8">
        <div className="flex items-center gap-2 mb-4"><Lock className="w-4 h-4 text-primary" strokeWidth={1.5} /><h3 className="font-heading text-lg text-foreground">Premium Tiers Coming Soon</h3></div>
        <p className="text-sm text-muted-foreground mb-4">Paid membership tiers with advanced features are being forged. As a founding member, you'll be notified the moment they launch.</p>
        <div className="space-y-2">
          {['The Velocity Method — accelerated brand growth program', 'Ignite OS — operating system for brand founders', 'AI Studio — LLM-powered brand tools with credit limits', 'Corporate Team Access — multi-seat team management'].map(feature => (
            <div key={feature} className="flex items-center gap-3 text-sm text-muted-foreground"><CreditCard className="w-4 h-4 text-muted-foreground/50" strokeWidth={1.5} /> {feature}</div>
          ))}
        </div>
      </div>
    </div>
  );
}