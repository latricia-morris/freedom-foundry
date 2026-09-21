import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';

export default function PortfolioCard({ project }) {
  return (
    <Link to={`/portfolio/${project.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-md border border-border bg-card/60 transition-all duration-300 group-hover:border-primary/50 group-hover:ember-glow-strong">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-background">
          {project.featured_image_url ? (
            <Image
              src={project.featured_image_url}
              alt={project.featured_image_alt || project.title}
              fittingType="fill"
              className="h-full w-full grayscale transition-all duration-500 group-hover:grayscale-0"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-heading text-4xl italic text-muted-foreground/30">FF</span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className="font-heading text-xl font-medium leading-tight text-cloudbone">{project.title}</h3>
            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-cloudbone/60">
              {[project.client_name, project.year, project.industry].filter(Boolean).join('  ·  ')}
            </p>
            {project.work_types?.length > 0 && (
              <p className="mt-2 text-[11px] text-cloudbone/70">
                {project.work_types.slice(0, 3).join('  /  ')}
              </p>
            )}
          </div>
          {project.is_featured && (
            <span className="absolute right-3 top-3 rounded-sm border border-primary/40 bg-background/80 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary">
              Featured
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}