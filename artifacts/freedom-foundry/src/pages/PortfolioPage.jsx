import React from 'react';
import { ArrowRight, CircleDashed, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function PortfolioPage() {
  return (
    <div className="min-h-[100dvh] bg-[#f4ecdf] text-[#241a20]">
      <header className="border-b border-[#6f282e]/15 bg-[#f8f1e7]/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-5 lg:px-8">
          <Link to="/" data-testid="link-portfolio-home" className="flex items-center gap-3">
            <img src={`${basePath}/forge-logo.png`} alt="Freedom Foundry" className="h-10 w-10 rounded-xl object-cover" />
            <div className="leading-tight"><p className="font-heading text-lg tracking-[0.04em]">FREEDOM FOUNDRY</p><p className="text-[10px] uppercase tracking-[0.22em] text-[#7c3130]">By The Brand Revivalist®</p></div>
          </Link>
          <nav aria-label="Portfolio navigation" className="flex items-center gap-5 text-sm">
            <Link to="/services" data-testid="link-portfolio-services" className="text-[#603338] transition-colors hover:text-[#a23835]">Services</Link>
            <Link to="/sign-in" data-testid="link-portfolio-sign-in" className="text-[#603338] transition-colors hover:text-[#a23835]">Sign in</Link>
            <Link to="/sign-up" data-testid="link-portfolio-create-account" className="border border-[#7c3130]/35 px-4 py-2 text-[#6f282e] transition-colors hover:border-[#7c3130] hover:bg-[#ead5c0]">Create account</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-5 pb-16 pt-20 sm:pb-24 sm:pt-28 lg:px-8">
          <div className="max-w-4xl">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#a23835]"><span className="h-px w-10 bg-[#a23835]" />Portfolio</p>
            <h1 className="mt-7 font-heading text-6xl font-light leading-[0.93] sm:text-7xl lg:text-[7rem]">The work is being <span className="italic text-[#9d3a34]">curated.</span></h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#57434a]">There are not yet any published case studies in Freedom Foundry. We are shaping this space carefully rather than filling it with placeholders.</p>
          </div>
        </section>

        <section className="border-y border-[#f4ecdf]/20 bg-[#70272d]">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
            <div className="flex items-start gap-4 text-[#f5d9bd]"><CircleDashed className="mt-1 h-7 w-7 shrink-0" strokeWidth={1.4} /><p className="text-sm uppercase tracking-[0.2em]">Published work<br />coming together</p></div>
            <div><h2 className="max-w-2xl font-heading text-4xl leading-tight text-[#fff2e3] sm:text-5xl">A portfolio should show the thinking, not just the finish line.</h2><p className="mt-6 max-w-xl text-base leading-7 text-[#efd6c2]">When case studies are ready to publish, this is where they will live. Until then, you can get a feel for the kind of support the Foundry is built to hold.</p></div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:py-24 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
            <article className="border border-[#7c3130]/20 bg-[#fbf6ee] p-7 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a23835]">For the work in front of you</p>
              <h2 className="mt-5 max-w-xl font-heading text-4xl leading-tight text-[#2c1d23] sm:text-5xl">Find a considered next move.</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#57434a]">The Services Hub helps members choose a direction, explore the shape of the work, and start a conversation without committing to a package.</p>
              <Link to="/services" data-testid="link-learn-services" className="mt-8 inline-flex items-center gap-3 bg-[#7c3130] px-5 py-3.5 text-sm font-semibold text-[#fff4e8] transition-colors hover:bg-[#922f31]">Learn about services <ArrowRight className="h-4 w-4" /></Link>
            </article>
            <article className="flex flex-col justify-between border border-[#7c3130]/20 bg-[#ead5c0] p-7 sm:p-10">
              <div><LockKeyhole className="h-6 w-6 text-[#7c3130]" strokeWidth={1.5} /><h2 className="mt-8 font-heading text-3xl leading-tight text-[#321d25]">Make the Foundry yours.</h2><p className="mt-4 text-base leading-7 text-[#5f4147]">Create an account to keep your brand work, resources, and next steps in one private place.</p></div>
              <Link to="/sign-up" data-testid="link-portfolio-sign-up" className="mt-10 inline-flex items-center gap-3 text-sm font-semibold text-[#7c3130] transition-colors hover:text-[#a23835]">Create an account <ArrowRight className="h-4 w-4" /></Link>
            </article>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 border-t border-[#7c3130]/15 px-5 py-9 text-sm text-[#75565d] lg:px-8">
        <span>© {new Date().getFullYear()} The Brand Revivalist®</span>
        <div className="flex gap-5"><Link to="/" data-testid="link-portfolio-footer-home" className="hover:text-[#7c3130]">Home</Link><Link to="/privacy" data-testid="link-portfolio-footer-privacy" className="hover:text-[#7c3130]">Privacy</Link><Link to="/terms" data-testid="link-portfolio-footer-terms" className="hover:text-[#7c3130]">Terms</Link></div>
      </footer>
    </div>
  );
}