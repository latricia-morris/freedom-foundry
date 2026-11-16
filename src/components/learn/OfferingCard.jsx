import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, FileDown, GraduationCap } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { kindLabel, priceLabel } from '@/lib/learn';

/** One course or book in the library. Shows only what the offering actually has. */
export default function OfferingCard({ offering }) {
  const o = offering;
  const Icon = o.kind === 'book' ? BookOpen : o.kind === 'resource' ? FileDown : GraduationCap;
  const pct = o.lesson_count ? Math.round(((o.completed_count || 0) / o.lesson_count) * 100) : 0;

  return (
    <Link to={`/learn/${o.id}`} className="group flex flex-col overflow-hidden border border-border bg-card transition-transform duration-500 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        {o.thumbnail_url ? (
          <Image src={o.thumbnail_url} alt="" className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="forged-gradient flex h-full w-full items-end p-5">
            <span className="font-heading text-7xl font-light leading-none text-primary-foreground/30">{(o.title || '').charAt(0)}</span>
          </div>
        )}
        <span className="smoked-glass absolute left-3 top-3 inline-flex items-center gap-1.5 border border-border/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground">
          <Icon className="h-3 w-3" strokeWidth={1.5} /> {kindLabel(o)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-2xl font-medium leading-tight text-foreground">{o.title}</h3>
        {o.subtitle && <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{o.subtitle}</p>}
        <div className="mt-auto pt-5">
          {o.has_access && o.lesson_count > 0 && (
            <div className="mb-3">
              <div className="well-track h-1.5 w-full"><div className="molten-bar h-full rounded-full" style={{ width: `${pct}%` }} /></div>
              <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{pct}% complete</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{o.has_access ? 'In your library' : priceLabel(o)}</span>
            <span className="link-warm inline-flex items-center gap-1">{o.kind === 'resource' ? 'Open' : o.has_access ? 'Continue' : 'View'} <ArrowUpRight className="h-3.5 w-3.5 text-primary" /></span>
          </div>
        </div>
      </div>
    </Link>
  );
}