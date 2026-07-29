import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function BrandPowerCard({ workbooks = [] }) {
  const items = workbooks.slice(0, 4).map(w => ({ title: w.title, progress: 0 }));

  return (
    <div className="border border-border rounded-xl bg-card p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <BookOpen className="w-4 h-4 text-primary" strokeWidth={1.5} />
        <h3 className="font-heading text-lg text-foreground">Brand Power Moves</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Your strategic workbooks.</p>
      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{i + 1}. {item.title}</p>
                <div className="h-1 bg-background rounded-full mt-2 overflow-hidden">
                  <div className="h-full forged-gradient rounded-full transition-all duration-700" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">{item.progress}%</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No workbooks available yet.</p>
      )}
      <Link to="/workbooks" className="block mt-5 text-xs uppercase tracking-widest text-primary hover:text-copper transition-colors">
        View All →
      </Link>
    </div>
  );
}