import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, BookOpen, Compass, Layers3, Palette, Sparkles } from 'lucide-react';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

const pillars = [
  {
    index: '01',
    icon: Compass,
    title: 'A clearer center',
    description: 'Shape the story, point of view, and practical foundation your next season can actually stand on.',
  },
  {
    index: '02',
    icon: Layers3,
    title: 'A useful home',
    description: 'Keep your brand profiles, workbooks, references, and important decisions together instead of scattered.',
  },
  {
    index: '03',
    icon: Sparkles,
    title: 'A next right move',
    description: 'Turn insight into action with focused resources and a considered path through the work.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] overflow-hidden bg-[#17110f] text-[#f8f0e5]">
      <header className="relative z-10 border-b border-[#f0d9b5]/15">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-5 lg:px-8">
          <Link to="/" data-testid="link-home" className="flex items-center gap-3">
            <img src={`${basePath}/forge-logo.png`} alt="Freedom Foundry" className="h-10 w-10 rounded-xl object-cover shadow-[0_0_20px_rgba(217,98,44,0.32)]" />
            <div className="leading-tight">
              <p className="font-heading text-lg tracking-[0.04em]">FREEDOM FOUNDRY</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#e3bd8f]">By The Brand Revivalist®</p>
            </div>
          </Link>
          <nav aria-label="Public navigation" className="order-3 flex w-full items-center gap-5 text-sm sm:order-2 sm:w-auto">
            <Link to="/services" data-testid="link-services" className="text-[#c7b7ab] transition-colors hover:text-[#f8f0e5]">Services</Link>
            <Link to="/portfolio" data-testid="link-portfolio" className="text-[#c7b7ab] transition-colors hover:text-[#f8f0e5]">Portfolio</Link>
          </nav>
          <div className="order-2 flex items-center gap-4 text-sm sm:order-3">
            <Link to="/sign-in" data-testid="link-sign-in" className="text-[#c7b7ab] transition-colors hover:text-[#f8f0e5]">Sign in</Link>
            <Link to="/sign-up" data-testid="link-create-account" className="border border-[#e5cba9]/45 px-4 py-2 text-[#f8f0e5] transition-colors hover:border-[#e5cba9] hover:bg-[#e5cba9]/10">Create account</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative border-b border-[#f0d9b5]/10">
          <div className="pointer-events-none absolute -right-40 top-[-8rem] h-[38rem] w-[38rem] rounded-full bg-[#8d2428]/25 blur-[120px]" />
          <div className="pointer-events-none absolute bottom-[-14rem] left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[#c8673d]/15 blur-[100px]" />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:py-28 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:px-8 lg:py-36">
            <div>
              <p className="mb-7 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-[#dd8656]"><span className="h-px w-10 bg-[#dd8656]" />A private brand portal</p>
              <h1 className="max-w-4xl font-heading text-6xl font-light leading-[0.92] sm:text-7xl lg:text-[6.8rem]">Make room for the brand <span className="molten-text italic">you mean.</span></h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-[#cbbeb2]">Freedom Foundry brings brand clarity, creative resources, and the next right moves into one considered place for entrepreneurs and creative teams.</p>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                <Link to="/sign-up" data-testid="link-enter-foundry" className="inline-flex items-center gap-3 bg-[#d9622c] px-5 py-3.5 text-sm font-semibold text-[#26130f] transition-transform hover:-translate-y-0.5 hover:bg-[#e7854e]">Enter Freedom Foundry <ArrowRight className="h-4 w-4" /></Link>
                <Link to="/portfolio" data-testid="link-view-portfolio" className="inline-flex items-center gap-2 text-sm text-[#e5cba9] transition-colors hover:text-[#f8f0e5]">See the portfolio <ArrowDownRight className="h-4 w-4" /></Link>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-lg lg:pb-3">
              <div className="absolute -inset-6 rounded-[2rem] bg-[#b3232c]/20 blur-3xl" />
              <div className="relative border border-[#efd8b5]/25 bg-[#211714]/95 p-5 shadow-2xl sm:p-7">
                <div className="flex items-center justify-between border-b border-[#efd8b5]/15 pb-5">
                  <span className="text-xs uppercase tracking-[0.24em] text-[#d9c5b2]">Inside the Foundry</span>
                  <span className="flex items-center gap-2 text-xs text-[#dd8656]"><span className="h-2 w-2 rounded-full bg-[#dd8656]" />Ready when you are</span>
                </div>
                <div className="border-b border-[#efd8b5]/15 py-8">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#b9957c]">The big picture</p>
                  <p className="mt-3 max-w-sm font-heading text-4xl leading-tight text-[#f9eee1]">Clarity creates momentum.</p>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-[#c3b2a6]">A calmer place to see what matters, keep the thread, and decide what comes next.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-5">
                  <div className="border border-[#efd8b5]/15 bg-[#170f0e] p-4"><Palette className="h-5 w-5 text-[#dd8656]" /><p className="mt-6 text-sm text-[#e7d4c1]">Brand portal</p><p className="mt-1 text-xs leading-5 text-[#a99185]">Your foundation, in view.</p></div>
                  <div className="border border-[#efd8b5]/15 bg-[#170f0e] p-4"><BookOpen className="h-5 w-5 text-[#dd8656]" /><p className="mt-6 text-sm text-[#e7d4c1]">The Vault</p><p className="mt-1 text-xs leading-5 text-[#a99185]">Resources that stay close.</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#f0d9b5]/10 bg-[#211613]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-[.7fr_1.3fr] sm:py-16 lg:px-8">
            <div><p className="text-xs uppercase tracking-[0.25em] text-[#dd8656]">The premise</p></div>
            <p className="max-w-3xl font-heading text-3xl leading-tight text-[#f6e6d5] sm:text-4xl">Your brand should not require a scavenger hunt to use well.</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div><p className="text-xs uppercase tracking-[0.25em] text-[#dd8656]">What lives here</p><h2 className="mt-4 max-w-xl font-heading text-4xl leading-tight sm:text-5xl">A working space for the work behind the work.</h2></div>
            <p className="max-w-xs text-sm leading-7 text-[#b9a79a]">Built to make the invisible decisions easier to find, revisit, and move forward.</p>
          </div>
          <div className="grid gap-px border border-[#f0d9b5]/15 bg-[#f0d9b5]/15 md:grid-cols-3">
            {pillars.map(({ index, icon: Icon, title, description }) => (
              <article key={index} data-testid={`card-pillar-${index}`} className="bg-[#17110f] p-7 sm:p-9">
                <div className="flex items-center justify-between"><span className="font-mono text-xs text-[#dd8656]">{index}</span><Icon className="h-5 w-5 text-[#e5cba9]" strokeWidth={1.5} /></div>
                <h3 className="mt-16 font-heading text-3xl text-[#f8f0e5]">{title}</h3>
                <p className="mt-4 text-base leading-7 text-[#b9a79a]">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[#f0d9b5]/10 bg-[#7d232b]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8">
            <div><p className="text-xs uppercase tracking-[0.25em] text-[#f3cfac]">Start where it is useful</p><h2 className="mt-4 max-w-2xl font-heading text-5xl leading-[0.98] text-[#fff3e5] sm:text-6xl">You do not need a perfect plan to begin.</h2><p className="mt-6 max-w-xl text-base leading-7 text-[#f0d8c4]">Create an account and make the Foundry a home for the decisions, resources, and direction already taking shape.</p></div>
            <Link to="/sign-up" data-testid="link-cta-create-account" className="inline-flex w-fit items-center gap-3 bg-[#f0d9b5] px-5 py-3.5 text-sm font-semibold text-[#32161a] transition-transform hover:-translate-y-0.5 hover:bg-[#f8e8ce]">Create your account <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-5 py-9 text-sm text-[#a99185] lg:px-8">
        <span>© {new Date().getFullYear()} The Brand Revivalist®</span>
        <div className="flex gap-5"><Link to="/portfolio" data-testid="link-footer-portfolio" className="hover:text-[#f8f0e5]">Portfolio</Link><Link to="/privacy" data-testid="link-footer-privacy" className="hover:text-[#f8f0e5]">Privacy</Link><Link to="/terms" data-testid="link-footer-terms" className="hover:text-[#f8f0e5]">Terms</Link></div>
      </footer>
    </div>
  );
}