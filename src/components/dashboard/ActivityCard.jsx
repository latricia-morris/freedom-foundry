import React from 'react';
import { Activity as ActivityIcon } from 'lucide-react';

export default function ActivityCard({ activities = [] }) {
  const items = activities;

  return (
    <div className="forged-border rounded-2xl bg-card p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ActivityIcon className="w-4 h-4 icon-warm" strokeWidth={1.5} />
          <h3 className="font-heading text-lg text-foreground">Recent Activity</h3>
        </div>
      </div>
      <div className="space-y-4">
        {items.length === 0 && <p className="text-sm text-muted-foreground">No recent activity.</p>}
        {items.map((item, i) => {
          const Icon = item.icon || ActivityIcon;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="icon-tile" style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                <Icon className="w-4 h-4 icon-warm" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-foreground">{item.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}