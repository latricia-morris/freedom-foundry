import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMembership } from '@/lib/useMembership';
import { Check, ChevronRight, Lock } from 'lucide-react';

const BOOK_FLAT = "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/227d4a0ca_flatbookright.png";

const AMAZON = "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/8c18598fe_amazonorangesmile.png";
const AUDIBLE = "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/26c7b3c1d_audible.png";
const BAM = "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/0b3d3eb7e_bam2.png";
const BN = "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/1860e8669_barnesandnoblesquare.png";
const HUDSON = "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/a3d5f7b54_hudsonbooksellers.png";
const POWELL = "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/65b59ed35_Powellbooks.png";
const SPOTIFY = "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/ff4135637_spotify.png";
const APPLE = "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/14b6e127c_applebooks.png";

const UNLOCK_CODE = 'POWERMOVES';

export default function BrandPowerMovesUnlock({ onUnlocked }) {
  const { profile, user, refreshProfile } = useMembership();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [view, setView] = useState('landing');

  const handleUnlock = async () => {
    setError('');
    if (code.trim().toUpperCase() !== UNLOCK_CODE) {
      setError("That code doesn't match. Please check the book or your inbox and try again.");
      return;
    }
    setSubmitting(true);
    try {
      if (profile?.id) {
        await base44.entities.UserProfile.update(profile.id, {
          brand_power_moves_unlocked: true,
          unlock_method: 'code',
        });
      } else if (user?.id) {
        await base44.entities.UserProfile.create({
          user_id: user.id,
          account_type: 'free',
          brand_power_moves_unlocked: true,
          unlock_method: 'code',
        });
      }
      setSuccess(true);
      await refreshProfile();
      setTimeout(() => onUnlocked?.(), 1500);
    } catch (_) {
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}>
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-heading text-2xl text-[#f7f2ea] mb-2">Brand Power Moves Unlocked</h2>
        <p className="text-sm text-[#f7f2ea]/60">Loading your resources now...</p>
      </div>
    );
  }

  if (view === 'unlock') {
    return (
      <div className="max-w-lg mx-auto py-10 animate-fade-in">
        <button onClick={() => setView('landing')} className="text-xs uppercase tracking-widest text-[#f7f2ea]/40 hover:text-[#f7f2ea]/70 transition-colors mb-8">Back</button>
        <div className="editorial-container">
          <h2 className="font-heading text-2xl mb-2">Enter Your Unlock Code</h2>
          <p className="text-sm text-[#1a1420]/70 mb-6 leading-relaxed">
            If you already purchased Brand Power Moves, you should already have access to the unlock code.
            Print buyers will find it inside the book. E-book and direct-order buyers should have it in their inbox.
          </p>
          <div className="space-y-4">
            <input
              className="w-full rounded-xl px-4 py-3 text-base text-[#1a1420] bg-white border border-black/10 outline-none focus:border-[#b3232c] transition-colors tracking-widest uppercase placeholder:normal-case placeholder:tracking-normal"
              placeholder="Enter code"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={20}
            />
            {error && <p className="text-sm link-molten">{error}</p>}
            <button
              onClick={handleUnlock}
              disabled={!code.trim() || submitting}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
              style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
            >
              {submitting ? 'Unlocking...' : 'Unlock Brand Power Moves'}
            </button>
          </div>
          <div className="mt-6 pt-6 border-t border-black/10">
            <p className="text-xs text-[#1a1420]/50 leading-relaxed">
              {"Don't have a copy yet? "}<button onClick={() => setView('purchase')} className="link-molten font-medium hover:opacity-80 transition-opacity">Order one here.</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'purchase') {
    return (
      <div className="max-w-2xl mx-auto py-10 animate-fade-in">
        <button onClick={() => setView('landing')} className="text-xs uppercase tracking-widest text-[#f7f2ea]/40 hover:text-[#f7f2ea]/70 transition-colors mb-8">Back</button>
        <div className="mb-6">
          <h2 className="font-heading text-3xl font-light text-[#f7f2ea] mb-2">Order Brand Power Moves</h2>
          <p className="text-sm text-[#f7f2ea]/60">After purchasing directly, your digital access will be activated automatically.</p>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Standard Print Edition', sub: 'Usually ships within 10 business days', price: '$24.99', url: 'https://buy.stripe.com/eVqcN475ufaD2mYfOzgbm01' },
            { label: 'Expedited Print Edition', sub: 'Usually ships within 2 business days', price: '$28.99', url: 'https://buy.stripe.com/5kQaEWexW8Mf1iUbyjgbm02' },
            { label: 'E-Book / E-Pub', sub: 'Digital download', price: '$9.99', url: 'https://buy.stripe.com/eVq8wOdtS7Ib3r2eKvgbm00' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-5 rounded-2xl border border-white/[0.04] bg-white/[0.02]">
              <div>
                <p className="text-sm font-medium text-[#f7f2ea]">{item.label}</p>
                <p className="text-xs text-[#f7f2ea]/40 mt-0.5">{item.sub}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#f7f2ea]/70">{item.price}</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg text-white text-xs font-semibold"
                  style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
                >
                  Order
                </a>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#f7f2ea]/40 mt-6 text-center leading-relaxed italic">
          Brand Power Moves is available through major retailers in print and e-book formats. If you choose to order directly, it is sincerely appreciated — direct support makes a more meaningful difference than most retail channels allow.
        </p>
      </div>
    );
  }

  // Landing view
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col lg:flex-row items-center gap-10 mb-14">
        <div className="flex-1 order-2 lg:order-1">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#d9c9a3] block mb-3">The Masters' Playbook</span>
          <h1 className="font-heading text-4xl lg:text-5xl font-light text-[#f7f2ea] leading-tight mb-4">
            Brand Power <span className="molten-text italic">Moves</span>
          </h1>
          <p className="text-[#f7f2ea]/70 text-base leading-relaxed mb-8 max-w-md">
            Making Your Brand Your Unfair Advantage. The strategic playbook for brand-led businesses who are done competing on price and ready to own their position.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setView('unlock')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold"
              style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
            >
              <Lock className="w-4 h-4" /> I Have the Book
            </button>
            <button
              onClick={() => setView('purchase')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-[#f7f2ea]/80 text-sm hover:border-white/20 hover:text-[#f7f2ea] transition-colors"
            >
              Order a Copy <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-shrink-0 w-full max-w-[260px] order-1 lg:order-2">
          <img src={BOOK_FLAT} alt="Brand Power Moves" className="w-full object-contain drop-shadow-2xl" />
        </div>
      </div>

      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-[#d9c9a3] text-center mb-5">Available Now</p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {[{ src: BN, alt: 'Barnes & Noble' }, { src: BAM, alt: 'Books-A-Million' }, { src: HUDSON, alt: 'Hudson Booksellers' }, { src: POWELL, alt: "Powell's Books" }, { src: AMAZON, alt: 'Amazon' }].map(({ src, alt }) => (
            <img key={alt} src={src} alt={alt} className="h-7 object-contain opacity-60 hover:opacity-90 transition-opacity" />
          ))}
        </div>
        <p className="text-center text-xs text-[#f7f2ea]/30 mt-3">Print and E-Book formats available</p>
      </div>

      <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5 mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-[#d9c9a3] mb-4 text-center">Audio Coming Soon</p>
        <div className="flex items-center justify-center gap-8">
          <img src={SPOTIFY} alt="Spotify" className="h-6 opacity-35 object-contain" />
          <img src={APPLE} alt="Apple Books" className="h-6 opacity-35 object-contain" />
          <img src={AUDIBLE} alt="Audible" className="h-6 opacity-35 object-contain" />
        </div>
      </div>

      <p className="text-center text-sm text-[#f7f2ea]/45 leading-relaxed max-w-2xl mx-auto italic">
        Brand Power Moves is available through major retailers in print and e-book formats. If you choose to order directly, it is sincerely appreciated — direct support makes a more meaningful difference than most retail channels allow.
      </p>
    </div>
  );
}