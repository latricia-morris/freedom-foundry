import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

const defaultCategories = [];

export default function VaultQuickCard({ vaultItems = [] }) {
  const categories = vaultItems.length > 0
    ? vaultItems.slice(0, 4).map(item => ({ name: item.title, count: 1 }))
    : defaultCategories;

  return (
    <div className="forged-border rounded-2xl bg-card p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" strokeWidth={1.5} />
          <h3 className="font-heading text-lg text-foreground">The Vault</h3>
        </div>
        <Link to="/vault" className="text-xs uppercase tracking-widest text-primary hover:text-copper transition-colors">View All →</Link>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Your resource library — courses, tools, and workbooks.</p>
      <div className="space-y-3 mb-6">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm text-foreground">{cat.name}</span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{cat.count} {cat.count === 1 ? 'File' : 'Files'}</span>
          </div>
        ))}
      </div>
      <Link to="/vault" className="block w-full text-center py-3 bg-background text-foreground text-xs uppercase tracking-[0.2em] rounded-lg border border-border hover:border-primary hover:text-primary transition-all">
        Browse The Vault →
      </Link>
    </div>
  );
}