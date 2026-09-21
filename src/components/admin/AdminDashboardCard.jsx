import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function AdminDashboardCard({ to, icon: Icon, title, description, footer }) {
  return (
    <Link
      to={to}
      className="dashboard-card p-6 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 hover:ember-glow-strong"
    >
      <div>
        <div className="mb-3 flex items-center gap-3">
          <div className="icon-tile">
            <Icon className="h-6 w-6 icon-warm" strokeWidth={1.5} />
          </div>
          <h2 className="font-heading text-2xl text-foreground">{title}</h2>
          <ArrowRight
            className="ml-auto h-5 w-5 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all transform group-hover:translate-x-1"
            strokeWidth={1.5}
          />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {footer && <div className="mt-6 flex items-center gap-4 border-t border-border pt-4">{footer}</div>}
    </Link>
  );
}