import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CircleDashed, LoaderCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PortfolioCard from '@/components/portfolio/PortfolioCard';
import { DELIVERABLE_CATEGORIES, SERVICE_CATEGORIES } from '@/lib/portfolioData';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function PortfolioPage() {
  const [items, setItems] = useState(null);
  const [failed, setFailed] = useState(false);
  const [service, setService] = useState('All Work');
  const [industry, setIndustry] = useState('');
  const [deliverable, setDeliverable] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  useEffect(() => {
    let active = true;
    base44.functions.invoke('portfolio-public', { action: 'list' })
      .then((response) => { if (active) setItems(response?.data?.items || []); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);

  const industries = useMemo(
    () => [...new Set((items || []).map((i) => i.industry).filter(Boolean))].sort(),
    [items],
  );

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => {
      if (service !== 'All Work' && !(item.service_categories || []).includes(service)) return false;
      if (industry && item.industry !== industry) return false;
      if (deliverable && !(item.deliverable_categories || []).includes(deliverable)) return false;
      if (featuredOnly && !item.is_featured) return false;
      return true;
    });
  }, [items, service, industry, deliverable, featuredOnly]);

  return (
    <div className="min-h-[100dvh]">
      <header className="border-b border-border bg-[#100e0c]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src={`${basePath}/forge-logo.png`} alt="Freedom Foundry" className="h-10 w-10 rounded-xl object-cover" />
            <div className="leading-tight">
              <p className="font-heading text-lg tracking-[0.04em] text-foreground">FREEDOM FOUNDRY</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-primary/80">By The Brand Revivalist®</p>
            </div>
          </Link>
          <nav aria-label="Portfolio navigation" className="flex items-center gap-5 text-sm">
            <Link to="/services" className="text-muted-foreground transition-colors hover:text-primary">Services</Link>
            <Link to="/login" className="text-muted-foreground transition-colors hover:text-primary">Sign in</Link>
            <Link to="/register" className="rounded-sm border border-primary/40 px-4 py-2 text-primary transition-colors hover:border-primary hover:bg-primary/10">Create account</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-10 pt-14 sm:px-8 sm:pt-20">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-primary/90">
          <span className="h-px w-10 bg-primary" /> Portfolio
        </p>
        <h1 className="mt-6 font-heading text-5xl font-light leading-[0.98] text-foreground sm:text-7xl">
          Selected <span className="molten-text italic">work.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
          A curated case-study library from The Brand Revivalist® and Ox &amp; Iron Co. — brand strategy, identity,
          and digital work, shown with the thinking that shaped it.
        </p>
      </section>

      {items === null && !failed && (
        <div className="flex justify-center py-20">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {items !== null && items.length > 0 && (
        <>
          <div className="sticky top-0 z-20 border-y border-border bg-[#100e0c]/90 backdrop-blur">
            <div className="mx-auto max-w-6xl px-5 py-3 sm:px-8">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Service filters">
                {['All Work', ...SERVICE_CATEGORIES].map((label) => {
                  const active = service === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setService(label)}
                      aria-pressed={active}
                      className={`rounded-sm px-3 py-1.5 text-xs tracking-wide transition-colors ${
                        active
                          ? 'btn-forge font-semibold'
                          : 'border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  aria-label="Filter by industry"
                  className="admin-input w-auto py-1.5 text-xs"
                >
                  <option value="">All industries</option>
                  {industries.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
                <select
                  value={deliverable}
                  onChange={(e) => setDeliverable(e.target.value)}
                  aria-label="Filter by deliverable"
                  className="admin-input w-auto py-1.5 text-xs"
                >
                  <option value="">All deliverables</option>
                  {DELIVERABLE_CATEGORIES.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setFeaturedOnly((v) => !v)}
                  aria-pressed={featuredOnly}
                  className={`rounded-sm px-3 py-1.5 text-xs tracking-wide transition-colors ${
                    featuredOnly
                      ? 'btn-forge font-semibold'
                      : 'border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  Featured work
                </button>
                <span className="ml-auto text-xs text-muted-foreground/70">
                  {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
                </span>
              </div>
            </div>
          </div>

          <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
            {filtered.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No projects match that selection yet.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((project) => <PortfolioCard key={project.id} project={project} />)}
              </div>
            )}
          </section>
        </>
      )}

      {items !== null && items.length === 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
          <div className="dashboard-card ember-glow relative overflow-hidden p-10 sm:p-14">
            <div className="absolute -right-16 -bottom-16 h-64 w-64 ember-glow-bg" />
            <div className="relative z-10 max-w-2xl">
              <CircleDashed className="h-8 w-8 text-primary" strokeWidth={1.4} />
              <h2 className="mt-6 font-heading text-4xl font-light text-foreground sm:text-5xl">
                The work is being <span className="molten-text italic">curated.</span>
              </h2>
              <p className="mt-5 text-base leading-7 text-muted-foreground">
                Case studies are being shaped carefully rather than filled with placeholders. Until then, you can
                get a feel for the kind of work the Foundry is built to hold.
              </p>
              <Link
                to="/services"
                className="btn-forge mt-8 inline-flex items-center gap-3 rounded-md px-5 py-3.5 text-sm font-semibold"
              >
                Learn about services <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {failed && (
        <p className="py-20 text-center text-sm text-muted-foreground">
          The portfolio could not be loaded. Please refresh in a moment.
        </p>
      )}

      <footer className="mt-10 border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-5 py-9 text-sm text-muted-foreground sm:px-8">
          <span>© {new Date().getFullYear()} The Brand Revivalist®</span>
          <div className="flex gap-5">
            <Link to="/" className="hover:text-primary">Home</Link>
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
            <Link to="/terms" className="hover:text-primary">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}