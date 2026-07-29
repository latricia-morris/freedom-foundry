import React, { useState } from 'react';
import { Check, Lock, Loader2, Sparkles, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PRO_PRICE_ID = 'price_1TyQ2EDMNCPQozJEfFmrfjX5';
const TEAM_PRICE_ID = 'price_1TyQ2EDMNCPQozJEnfNqBdlL';

export default function Billing() {
  const [loadingPrice, setLoadingPrice] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status');

  const handleCheckout = async (priceId) => {
    if (window.self !== window.top) {
      alert("Checkout works only from a published app. Please open the app directly to upgrade.");
      return;
    }
    setLoadingPrice(priceId);
    try {
      const response = await base44.functions.invoke('create-checkout-session', {
        price_id: priceId,
        mode: 'subscription',
      });
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoadingPrice(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-light text-foreground mb-2">Billing & <span className="molten-text italic">Subscriptions</span></h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and billing preferences.</p>
      </div>

      {status === 'success' && (
        <div className="forged-border rounded-2xl bg-card p-6 mb-6 text-center border-primary/30">
          <div className="w-12 h-12 rounded-full forged-border flex items-center justify-center bg-background mx-auto mb-3"><Check className="w-6 h-6 text-primary" strokeWidth={1.5} /></div>
          <h3 className="font-heading text-lg text-foreground mb-1">Payment Successful</h3>
          <p className="text-sm text-muted-foreground">Your subscription is now active. Welcome to the next level.</p>
        </div>
      )}
      {status === 'cancelled' && (
        <div className="forged-border rounded-2xl bg-card p-6 mb-6 text-center">
          <h3 className="font-heading text-lg text-foreground mb-1">Checkout Cancelled</h3>
          <p className="text-sm text-muted-foreground">No charges were made. You can upgrade anytime.</p>
        </div>
      )}

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="forged-border rounded-2xl bg-card p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-4"><Sparkles className="w-4 h-4 text-primary" strokeWidth={1.5} /><h3 className="font-heading text-lg text-foreground">Freedom Foundry Pro</h3></div>
          <div className="mb-4"><span className="font-heading text-4xl text-foreground">$29</span><span className="text-sm text-muted-foreground">/month</span></div>
          <p className="text-sm text-muted-foreground mb-6">Full access to premium courses, workbooks, AI Studio tools, and brand power resources.</p>
          <ul className="space-y-2 mb-6">
            {['Unlimited workbook access', 'All course modules unlocked', 'AI Studio brand tools', 'Priority email support'].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} /> {f}</li>
            ))}
          </ul>
          <button onClick={() => handleCheckout(PRO_PRICE_ID)} disabled={loadingPrice === PRO_PRICE_ID} className="w-full flex items-center justify-center gap-2 py-3 forged-gradient rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50">
            {loadingPrice === PRO_PRICE_ID ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Upgrade to Pro'}
          </button>
        </div>

        <div className="forged-border rounded-2xl bg-card p-6 lg:p-8 ember-glow">
          <div className="flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-primary" strokeWidth={1.5} /><h3 className="font-heading text-lg text-foreground">Freedom Foundry Team</h3></div>
          <div className="mb-4"><span className="font-heading text-4xl text-foreground">$99</span><span className="text-sm text-muted-foreground">/month</span></div>
          <p className="text-sm text-muted-foreground mb-6">Multi-seat team access with collaborative brand management and admin controls.</p>
          <ul className="space-y-2 mb-6">
            {['Everything in Pro', 'Up to 5 team members', 'Shared brand profiles', 'Admin dashboard & controls'].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} /> {f}</li>
            ))}
          </ul>
          <button onClick={() => handleCheckout(TEAM_PRICE_ID)} disabled={loadingPrice === TEAM_PRICE_ID} className="w-full flex items-center justify-center gap-2 py-3 forged-gradient rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50">
            {loadingPrice === TEAM_PRICE_ID ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Upgrade to Team'}
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="w-3 h-3" strokeWidth={1.5} /> Secure checkout powered by Stripe
      </div>
    </div>
  );
}