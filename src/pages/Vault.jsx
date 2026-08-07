import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMembership } from '@/lib/useMembership';
import BrandPowerMovesUnlock from './BrandPowerMovesUnlock';

export default function Vault() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isBpmUnlocked, loading: memberLoading, refreshProfile } = useMembership();
  const [showBpmUnlock, setShowBpmUnlock] = useState(false);

  useEffect(() => {
    base44.entities.VaultItem.filter({ status: 'published' }, 'order', 50)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const bpmItem = items.find(i =>
    i.title?.toLowerCase().includes('brand power moves') ||
    i.title?.toLowerCase().includes('brand power move')
  );
  const otherItems = items.filter(i => i !== bpmItem);

  const handleBpmClick = (e) => {
    if (!isBpmUnlocked) {
      e.preventDefault();
      setShowBpmUnlock(true);
    }
  };

  if (showBpmUnlock) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        <button
          onClick={() => setShowBpmUnlock(false)}
          className="text-xs uppercase tracking-widest text-[#f7f2ea]/40 hover:text-[#f7f2ea]/70 transition-colors mb-8 block"
        >
          ← Back to Vault
        </button>
        <BrandPowerMovesUnlock onUnlocked={() => { setShowBpmUnlock(false); refreshProfile(); }} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground mb-2">
          The <span className="molten-text italic">Vault</span>
        </h1>
        <p className="text-sm text-muted-foreground">Your resource library — courses, tools, workbooks, and brand resources.</p>
      </div>

      {loading || memberLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="vault-card">
              <div className="w-full h-full bg-card animate-pulse rounded-xl" style={{ aspectRatio: '9/16' }} />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="forged-border rounded-2xl bg-card p-12 text-center">
          <h3 className="font-heading text-xl text-foreground mb-2">The Vault is being stocked</h3>
          <p className="text-sm text-muted-foreground">Check back soon for premium brand resources.</p>
        </div>
      ) : (
        <>
          {/* Brand Power Moves — featured */}
          {bpmItem && (
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#d9c9a3] mb-4">Featured Resource</p>
              <div
                className="relative rounded-2xl overflow-hidden cursor-pointer group"
                style={{
                  background: 'linear-gradient(135deg, #1a0508, #2b0f14)',
                  border: '1px solid rgba(179,35,44,0.15)',
                }}
                onClick={handleBpmClick}
              >
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 lg:p-8">
                  {bpmItem.featured_image_url && (
                    <img
                      src={bpmItem.featured_image_url}
                      alt={bpmItem.title}
                      className="w-24 h-36 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 text-center sm:text-left">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#d9c9a3]">{bpmItem.type}</span>
                    <h2 className="font-heading text-2xl lg:text-3xl font-light text-[#f7f2ea] mt-1 mb-2">{bpmItem.title}</h2>
                    <p className="text-sm text-[#f7f2ea]/60 mb-4 max-w-lg">{bpmItem.description}</p>
                    {isBpmUnlocked ? (
                      <Link to="/workbooks" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}>
                        Open
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                          style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
                        >
                          <Lock className="w-3.5 h-3.5" /> Unlock Access
                        </button>
                        <span className="text-xs text-[#f7f2ea]/40">Have the book? Enter your code.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rest of vault */}
          {otherItems.length > 0 && (
            <>
              {bpmItem && <p className="text-[10px] uppercase tracking-[0.3em] text-[#d9c9a3] mb-4">All Resources</p>}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {otherItems.map((item) => (
                  <Link key={item.id} to={`/vault/${item.id}`} className="vault-card group">
                    <div className="vault-card__image-wrapper">
                      {item.featured_image_url ? (
                        <img src={item.featured_image_url} alt={item.title} className="vault-card__image" />
                      ) : (
                        <div className="vault-card__image flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a161d, #0f0f1a)' }}>
                          <span className="font-heading text-5xl molten-text opacity-30">{item.title?.[0]}</span>
                        </div>
                      )}
                      {!item.is_free && (
                        <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
                          <Lock className="w-3 h-3 text-primary" strokeWidth={2} />
                        </div>
                      )}
                    </div>
                    <div className="vault-card__body">
                      <span className="text-[10px] uppercase tracking-widest text-primary">{item.type}</span>
                      <h3 className="font-heading text-base text-foreground mt-1 mb-1 line-clamp-2">{item.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">{item.is_free ? 'FREE' : `$${item.price}`}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}