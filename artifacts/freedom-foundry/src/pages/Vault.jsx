import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import apiClient from '@/api/client';
import { useMembership } from '@/lib/useMembership';
import BrandPowerMovesUnlock from './BrandPowerMovesUnlock';

export default function Vault() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isBpmUnlocked, loading: memberLoading, refreshProfile } = useMembership();
  const [showBpmUnlock, setShowBpmUnlock] = useState(false);

  useEffect(() => {
    apiClient.entities.VaultItem.filter({ status: 'published' }, 'order', 50)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const bpmItem = items.find(i =>
    i.title?.toLowerCase().includes('brand power moves') ||
    i.title?.toLowerCase().includes('brand power move')
  );
  const otherItems = items.filter(i => i !== bpmItem);
  const sortedItems = bpmItem ? [bpmItem, ...otherItems] : otherItems;

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedItems.map((item) => {
            const isBpm = item === bpmItem;
            const to = isBpm ? '/workbooks' : `/vault/${item.id}`;
            const locked = (isBpm && !isBpmUnlocked) || (!item.is_free && !isBpm);
            return (
              <Link key={item.id} to={to} onClick={isBpm ? handleBpmClick : undefined} className="vault-card group">
                <div className="vault-card__image-wrapper">
                  {item.featured_image_url ? (
                    <img src={item.featured_image_url} alt={item.title} className="vault-card__image" />
                  ) : (
                    <div className="vault-card__image flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a161d, #0f0f1a)' }}>
                      <span className="font-heading text-5xl molten-text opacity-30">{item.title?.[0]}</span>
                    </div>
                  )}
                  {locked && (
                    <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
                      <Lock className="w-3 h-3" strokeWidth={2} style={{ stroke: 'url(#warmGradientSvg)' }} />
                    </div>
                  )}
                </div>
                <div className="vault-card__body">
                  <span className="text-[10px] uppercase tracking-widest molten-text">{item.type}</span>
                  <h3 className="font-heading text-base text-foreground mt-1 mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.subtitle || item.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      {isBpm ? (isBpmUnlocked ? 'Unlocked' : 'Free with book purchase') : item.is_free ? 'FREE' : `$${item.price}`}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}