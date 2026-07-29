import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function BrandPowerCard({ workbooks = [] }) {
  const items = workbooks.slice(0, 4);

  return (
    <div className="forged-border rounded-2xl bg-card p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 icon-warm" strokeWidth={1.5} />
          <h3 className="font-heading text-lg text-foreground">Brand Power Moves</h3>
        </div>
        <Link to="/workbooks" className="link-warm">View All</Link>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Your strategic workbooks.</p>
      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="icon-tile">
                <BookOpen className="w-5 h-5 icon-warm" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{item.title}</p>
                <div className="h-1 bg-background rounded-full mt-2 overflow-hidden">
                  <div className="h-full forged-gradient rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No workbooks available yet.</p>
      )}
    </div>
  );
}