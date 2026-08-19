import React from 'react';
import { Activity as ActivityIcon } from 'lucide-react';

export default function ActivityCard({ activities = [] }) {
  const items = activities;

  return (
    <div className="dash-editorial-block h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ActivityIcon className="w-4 h-4" style={{ stroke: 'url(#warmGradient)' }} strokeWidth={1.5} />
          <h3 className="font-heading text-lg">Recent Activity</h3>
        </div>
      </div>
      <div className="space-y-4">
        {items.length === 0 && <p className="text-sm" style={{ color: '#8a8a92' }}>No recent activity.</p>}
        {items.map((item, i) => {
          const Icon = item.icon || ActivityIcon;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: '32px', height: '32px', background: 'rgba(15,15,26,0.05)' }}>
                <Icon className="w-4 h-4" style={{ stroke: 'url(#warmGradient)' }} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm">{item.description}</p>
                <p className="text-xs mt-0.5" style={{ color: '#8a8a92' }}>{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}