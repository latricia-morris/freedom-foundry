import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Vault() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.VaultItem.filter({ status: 'published' }, 'order', 50)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground mb-2">
          The <span className="molten-text italic">Vault</span>
        </h1>
        <p className="text-sm text-muted-foreground">Your core brand assets. Secured. Organized. Always at hand.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="forged-border rounded-2xl bg-card p-12 text-center">
          <h3 className="font-heading text-xl text-foreground mb-2">The Vault is being stocked</h3>
          <p className="text-sm text-muted-foreground">Check back soon for premium brand resources.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/vault/${item.id}`}
              className="group forged-border rounded-xl bg-card overflow-hidden transition-all duration-300 hover:ember-glow-strong"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                {item.featured_image_url ? (
                  <img src={item.featured_image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-background">
                    <span className="font-heading text-5xl molten-text opacity-30">{item.title?.[0]}</span>
                  </div>
                )}
                {!item.is_free && (
                  <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
                    <Lock className="w-3 h-3 text-primary" strokeWidth={2} />
                  </div>
                )}
              </div>
              <div className="p-4">
                <span className="text-[10px] uppercase tracking-widest text-primary">{item.type}</span>
                <h3 className="font-heading text-base text-foreground mt-1 mb-1 line-clamp-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">{item.is_free ? 'FREE' : `$${item.price}`}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}