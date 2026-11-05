import React from 'react';
import { Link } from 'react-router-dom';

export function PageHeader({ eyebrow = 'Agency OS', title, accent, subtitle, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-1 font-heading text-4xl font-light text-foreground">
          {title} {accent && <span className="molten-text italic">{accent}</span>}
        </h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, accent }) {
  return (
    <div className="dashboard-card p-5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{label}</p>
      <p className={`mt-2 font-heading text-3xl font-light ${accent || 'text-foreground'}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({ title, to, linkLabel = 'View all', children, className = '' }) {
  return (
    <div className={`dashboard-card overflow-hidden ${className}`}>
      <div className="flex items-center justify-between border-b border-border/50 p-5">
        <h3 className="font-heading text-xl text-foreground">{title}</h3>
        {to && <Link to={to} className="text-xs uppercase tracking-widest link-warm">{linkLabel}</Link>}
      </div>
      {children}
    </div>
  );
}

export const Empty = ({ children }) => <p className="p-8 text-center text-sm text-muted-foreground">{children}</p>;

export const Spinner = () => (
  <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
);

export const PrimaryButton = ({ className = '', ...p }) => (
  <button {...p} className={`btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-50 ${className}`} />
);

export const GhostLink = ({ to, children }) => (
  <Link to={to} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">{children}</Link>
);

export const Pill = ({ children }) => (
  <span className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">{children}</span>
);

export const label = (s) => (s || '').replace(/_/g, ' ');
export const money = (n, cur = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n || 0);