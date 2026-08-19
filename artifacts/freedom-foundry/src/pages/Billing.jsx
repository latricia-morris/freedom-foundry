import React, { useState } from 'react';
import { Check, Lock, Loader2, Sparkles, Users } from 'lucide-react';
import apiClient from '@/api/client';

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
      // Payments are not yet configured in this deployment.
      alert('Checkout is not available yet. Please contact us to upgrade your plan.');
    } finally {
      setLoadingPrice(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-light text-foreground mb-2">Billing & <span className="molten-text italic">Subscriptions</span></h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and billing preferences.</p>
      </div>

      <div className="editorial-container space-y-6">
        {status === 'success' && (
          <div className="p-6 text-center border border-black/10 rounded-lg bg-white/50">
            <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center bg-white mx-auto mb-3"><Check className="w-6 h-6 text-merlot" strokeWidth={1.5} /></div>
            <h3 className="font-heading text-lg mb-1">Payment Successful</h3>
            <p className="text-sm opacity-70">Your subscription is now active. Welcome to the next level.</p>
          </div>
        )}
        {status === 'cancelled' && (
          <div className="p-6 text-center border border-black/10 rounded-lg bg-white/50">
            <h3 className="font-heading text-lg mb-1">Checkout Cancelled</h3>
            <p className="text-sm opacity-70">No charges were made. You can upgrade anytime.</p>
          </div>
        )}

        {/* Current Plan */}
        <div className="p-6 border border-black/10 rounded-lg bg-white/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center bg-white"><Check className="w-5 h-5 text-merlot" strokeWidth={1.5} /></div>
              <div><h2 className="font-heading text-lg">Founding Member</h2><p className="text-xs opacity-60">Free Access</p></div>
            </div>
            <span className="px-3 py-1 rounded-full bg-merlot/10 text-merlot text-xs uppercase tracking-widest">Active</span>
          </div>
          <div className="space-y-3 pt-4 border-t border-black/10">
            <div className="flex items-center justify-between"><span className="text-sm opacity-60">Current Plan</span><span className="text-sm">Free Founding Member</span></div>
            <div className="flex items-center justify-between"><span className="text-sm opacity-60">Price</span><span className="text-sm">$0 / month</span></div>
            <div className="flex items-center justify-between"><span className="text-sm opacity-60">Renewal</span><span className="text-sm">No expiration</span></div>
          </div>
        </div>

        {/* Upgrade Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-black/10 rounded-lg bg-white/50">
            <div className="flex items-center gap-2 mb-4"><Sparkles className="w-4 h-4 text-merlot" strokeWidth={1.5} /><h3 className="font-heading text-lg">Freedom Foundry Pro</h3></div>
            <div className="mb-4"><span className="font-heading text-4xl">$29</span><span className="text-sm opacity-60">/month</span></div>
            <p className="text-sm opacity-70 mb-6">Full access to premium courses, workbooks, AI Studio tools, and brand power resources.</p>
            <ul className="space-y-2 mb-6">
              {['Unlimited workbook access', 'All course modules unlocked', 'AI Studio brand tools', 'Priority email support'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm opacity-70"><Check className="w-4 h-4 text-merlot flex-shrink-0" strokeWidth={1.5} /> {f}</li>
              ))}
            </ul>
            <button onClick={() => handleCheckout(PRO_PRICE_ID)} disabled={loadingPrice === PRO_PRICE_ID} className="w-full flex items-center justify-center gap-2 py-3 forged-gradient rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50">
              {loadingPrice === PRO_PRICE_ID ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Upgrade to Pro'}
            </button>
          </div>

          <div className="p-6 border border-black/10 rounded-lg bg-white/50" style={{ boxShadow: '0 2px 20px rgba(217, 98, 44, 0.08)' }}>
            <div className="flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-merlot" strokeWidth={1.5} /><h3 className="font-heading text-lg">Freedom Foundry Team</h3></div>
            <div className="mb-4"><span className="font-heading text-4xl">$99</span><span className="text-sm opacity-60">/month</span></div>
            <p className="text-sm opacity-70 mb-6">Multi-seat team access with collaborative brand management and admin controls.</p>
            <ul className="space-y-2 mb-6">
              {['Everything in Pro', 'Up to 5 team members', 'Shared brand profiles', 'Admin dashboard & controls'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm opacity-70"><Check className="w-4 h-4 text-merlot flex-shrink-0" strokeWidth={1.5} /> {f}</li>
              ))}
            </ul>
            <button onClick={() => handleCheckout(TEAM_PRICE_ID)} disabled={loadingPrice === TEAM_PRICE_ID} className="w-full flex items-center justify-center gap-2 py-3 forged-gradient rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50">
              {loadingPrice === TEAM_PRICE_ID ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Upgrade to Team'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs opacity-60">
          <Lock className="w-3 h-3" strokeWidth={1.5} /> Secure checkout powered by Stripe
        </div>
      </div>
    </div>
  );
}