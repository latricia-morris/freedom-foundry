import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function VaultQuickCard({ vaultItems = [] }) {
  const items = vaultItems.slice(0, 4);

  return (
    <div className="dash-editorial-block h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4" style={{ stroke: 'url(#warmGradient)' }} strokeWidth={1.5} />
          <h3 className="font-heading text-lg">The Vault</h3>
        </div>
        <Link to="/vault" className="link-warm text-xs uppercase tracking-wider">View All</Link>
      </div>
      <p className="text-sm mb-5" style={{ color: '#6b6b74' }}>Your resource library — courses, tools, and workbooks.</p>
      <div className="space-y-3 mb-6">
        {items.length === 0 && <p className="text-sm" style={{ color: '#8a8a92' }}>No resources available yet.</p>}
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm">{item.title}</span>
            <span className="text-xs uppercase tracking-wider" style={{ color: '#8a8a92' }}>{item.category}</span>
          </div>
        ))}
      </div>
      <Link to="/vault" className="link-warm text-sm">Browse The Vault</Link>
    </div>
  );
}