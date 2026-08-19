import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';

const defaultRequests = [
  { title: 'No requests yet', status: '—', date: '' },
];

export default function ServiceRequestsCard({ requests = [] }) {
  const items = requests.length > 0 ? requests : defaultRequests;

  return (
    <div className="rounded-2xl bg-card p-6 h-full border border-[#f7f2ea]/[0.04]">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" strokeWidth={1.5} />
          <h3 className="font-heading text-lg text-foreground">Service Requests</h3>
        </div>
        <Link to="/services" className="text-xs uppercase tracking-widest text-primary hover:text-copper transition-colors">View All →</Link>
      </div>
      <div className="space-y-4 mb-6">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">{item.title}</p>
              {item.date && <p className="text-xs text-muted-foreground mt-0.5">{item.date}</p>}
            </div>
            <span className="text-xs uppercase tracking-wider text-primary">{item.status}</span>
          </div>
        ))}
      </div>
      <Link to="/services" className="block w-full text-center py-3 bg-background text-foreground text-xs uppercase tracking-[0.2em] rounded-lg border border-border hover:border-primary hover:text-primary transition-all">
        New Service Request →
      </Link>
    </div>
  );
}