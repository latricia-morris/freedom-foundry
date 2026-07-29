import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function BrandPowerCard({ workbooks = [] }) {
  const items = workbooks.slice(0, 4);

  return (
    <div className="dash-editorial-block h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" style={{ stroke: 'url(#warmGradient)' }} strokeWidth={1.5} />
          <h3 className="font-heading text-lg">Brand Power Moves</h3>
        </div>
        <Link to="/workbooks" className="link-warm text-xs uppercase tracking-wider">View All</Link>
      </div>
      <p className="text-sm mb-5" style={{ color: '#6b6b74' }}>Your active workbook progress.</p>
      <div className="space-y-4">
        {items.length > 0 ? (
          items.map((wb) => (
            <div key={wb.id} className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{wb.title}</span>
              <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(15,15,26,0.08)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${wb.progress}%`, background: 'linear-gradient(131deg, #b3232c 0%, #d9622c 55%, #f0d9b5 100%)' }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm italic" style={{ color: '#8a8a92' }}>No active workbooks.</p>
        )}
      </div>
    </div>
  );
}