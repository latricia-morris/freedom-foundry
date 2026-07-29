import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Compass, Anvil, Diamond } from 'lucide-react';

const defaultWorkbooks = [
  { title: 'The Revivalist Mindset', progress: 0, icon: Flame, category: 'Foundation' },
  { title: 'Your Brand Compass', progress: 0, icon: Compass, category: 'Strategy' },
  { title: 'The Freedom Framework', progress: 0, icon: Anvil, category: 'Framework' },
  { title: 'Brand Identity Blueprint', progress: 0, icon: Diamond, category: 'Identity' },
];

export default function BrandPowerCard({ workbooks = [] }) {
  const items = workbooks.length > 0
    ? workbooks.slice(0, 4).map((w, i) => ({ ...defaultWorkbooks[i % 4], title: w.title, progress: 0 }))
    : defaultWorkbooks;

  return (
    <div className="forged-border rounded-2xl bg-card p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <Anvil className="w-4 h-4 text-primary" strokeWidth={1.5} />
        <h3 className="font-heading text-lg text-foreground">Brand Power Moves</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Your strategic pillars. Your transformation.</p>
      <div className="space-y-4">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{item.category}</p>
                <p className="text-sm text-foreground truncate">{i + 1}. {item.title}</p>
                <div className="h-1 bg-background rounded-full mt-2 overflow-hidden">
                  <div className="h-full forged-gradient rounded-full transition-all duration-700" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">{item.progress}%</span>
            </div>
          );
        })}
      </div>
      <Link to="/workbooks" className="block mt-5 text-xs uppercase tracking-widest text-primary hover:text-copper transition-colors">
        View All Workbooks →
      </Link>
    </div>
  );
}