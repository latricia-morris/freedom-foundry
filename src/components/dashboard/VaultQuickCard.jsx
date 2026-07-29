import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function VaultQuickCard({ vaultItems = [] }) {
  const items = vaultItems.slice(0, 4);

  return (
    <div className="dashboard-card p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 icon-warm" strokeWidth={1.5} />
          <h3 className="font-heading text-lg text-foreground">The Vault</h3>
        </div>
        <Link to="/vault" className="link-warm">View All</Link>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Your resource library — courses, tools, and workbooks.</p>
      <div className="space-y-3 mb-6">
        {items.length === 0 && <p className="text-sm text-muted-foreground">No resources available yet.</p>}
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm text-foreground">{item.title}</span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{item.type}</span>
          </div>
        ))}
      </div>
      <Link to="/vault" className="link-warm">Browse The Vault</Link>
    </div>
  );
}