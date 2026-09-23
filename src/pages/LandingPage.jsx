import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowRight,
  ChevronDown,
  Compass,
  Layers3,
  Palette,
  Sparkles,
} from 'lucide-react';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

const images = {
  hero: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/0b259d369_modern-office-teamwork-co-working-space-quiet-a-2024-12-06-22-51-04-utc.webp',
  colleagues: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/106713cff_working-colleagues-2025-01-29-07-49-37-utc.webp',
  interior: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/2474a7b7d_stylish-and-cozy-interior-of-dining-room-2024-10-17-01-04-36-utc.webp',
  livingRoom: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/a38fb6e85_dark-blue-living-room-interior-with-cozy-luxury-le-2025-03-12-01-29-58-utc.webp',
  womanAtWork: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/9899a82d3_businesswoman-working-with-her-colleagues-at-offic-2025-03-16-06-52-50-utc.webp',
  strategyTable: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/b9ac87bed_businesspeople-sitting-and-working-at-desk-in-offi-2024-10-18-09-34-12-utc.webp',
};

const themes = {
  hero: 'linear-gradient(135deg, #17110f 0%, #26130f 46%, #45191b 100%)',
  cream: 'linear-gradient(135deg, #f8f0e5 0%, #f4e6d5 100%)',
  ember: 'linear-gradient(135deg, #461b22 0%, #7d232b 52%, #b54d28 100%)',
  ink: 'linear-gradient(135deg, #17110f 0%, #1b1313 48%, #08242a 100%)',
  rust: 'linear-gradient(135deg, #7d232b 0%, #9c3828 54%, #d9622c 120%)',
  closing: 'linear-gradient(135deg, #1b1110 0%, #371b1a 55%, #6e3026 100%)',
};

const outcomes = [
  {
    index: '01',
    icon: Compass,
    title: 'Your team stops second-guessing.',
    description: 'Everyone knows what you stand for and where you are headed. Decisions get faster, more consistent, and your whole operation moves like it is actually unified.',
  },
  {
    index: '02',
    icon: Sparkles,
    title: 'You show up with confidence.',
    description: 'No more wondering whether your brand looks amateur next to the competition. You know exactly who you are and why the right people should choose you.',
  },
  {
    index: '03',
    icon: Layers3,
    title: 'The right clients find you.',
    description: 'Instead of competing on price with everyone else, you attract people who understand what you are about and are willing to pay for it.',
  },
  {
    index: '04',
    icon: Palette,
    title: 'Growth becomes strategic, not chaotic.',
    description: 'Every opportunity gets filtered through your brand clarity. You say yes to what fits, no to what does not, and build something sustainable.',
  },
];

const pathways = [
  ['01', 'The Brand Revival', 'For businesses that have outgrown the version of themselves the market still sees.'],
  ['02', 'The Brand Foundation', 'For leaders who need strategic clarity before they invest in the next thing.'],
  ['03', 'Digital Authority', 'For brands whose online presence does not reflect their actual capability.'],
  ['04', 'The Foundry Extension', 'For teams that need strategic and creative direction as they grow.'],
];

const faqs = [
  ['What makes Freedom Foundry different?', 'Freedom Foundry begins with the business beneath the brand. We do not make things look better without first making sure your positioning, audience signal, message, and strategic foundation are doing their jobs.'],
  ['Who is a Brand Revival for?', 'A Brand Revival is for leaders whose business has evolved beyond the identity, website, message, or market perception currently representing it.'],
  ['Can you rebrand us without losing our existing reputation?', 'Yes. A thoughtful revival protects the equity you have earned while correcting what is no longer serving the business. The goal is recognition with renewed relevance.'],
  ['How long does a brand engagement take?', 'The right timeline depends on the depth of strategy, scope of implementation, and access to decision-makers. A focused foundation moves differently than a full identity and digital transformation.'],
];

function ThemeSection({ theme, id, className = '', children }) {
  return (
    <section id={id} data-theme={theme} className={`relative bg-transparent ${className}`}>
      {children}
    </section>
  );
}

function NaturalImage({ src, alt, className = '' }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`block h-auto w-full max-w-full object-contain object-center ${className}`}
    />
  );
}

export default function LandingPage() {
  const rootRef = useRef(null);
  const [activeTheme, setActiveTheme] = useState('hero');
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) setActiveTheme(current.target.dataset.theme || 'cream');
      },
      { rootMargin: '-34% 0px -45% 0px', threshold: [0.08, 0.22, 0.48] }
    );

    root.querySelectorAll('[data-theme]').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="relative min-h-[100dvh] overflow-hidden bg-[#17110f] text-[#f8f0e5]">
      {/* Scroll-driven page atmosphere. Sections are transparent; this layer transitions behind them. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 transition-[background] duration-1000 ease-out motion-reduce:transition-none"
        style={{ background: themes[activeTheme] }}
      />

      <header className="relative z-20 border-b border-[#f0d9b5]/15 bg-[#17110f]/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-5 lg:px-8">
          <Link to="/" data-testid="link-home" className="flex items-center gap-3">
            <img
              src={`${basePath}/forge-logo.png`}
              alt="Freedom Foundry"
              className="h-10 w-10 rounded-xl object-cover shadow-[0_0_20px_rgba(217,98,44,0.32)]"
            />
            <div className="leading-tight">
              <p className="font-heading text-lg tracking-[0.04em]">FREEDOM FOUNDRY</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#e3bd8f]">By The Brand Revivalist®</p>
            </div>
          </Link>

          <nav aria-label="Public navigation" className="order-3 flex w-full items-center gap-5 text-sm sm:order-2 sm:w-auto">
            <a href="#approach" className="text-[#c7b7ab] transition-colors hover:text-[#f8f0e5]">Approach</a>
            <Link to="/services" data-testid="link-services" className="text-[#c7b7ab] transition-colors hover:text-[#f8f0e5]">Services</Link>
            <Link to="/portfolio" data-testid="link-portfolio" className="text-[#c7b7ab] transition-colors hover:text-[#f8f0e5]">Portfolio</Link>
          </nav>

          <div className="order-2 flex items-center gap-4 text-sm sm:order-3">
            <Link to="/sign-in" data-testid="link-sign-in" className="text-[#c7b7ab] transition-colors hover:text-[#f8f0e5]">Sign in</Link>
            <Link to="/sign-up" data-testid="link-create-account" className="border border-[#e5cba9]/45 px-4 py-2 text-[#f8f0e5] transition-colors hover:border-[#e5cba9] hover:bg-[#e5cba9]/10">Create account</Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <ThemeSection theme="hero" className="overflow-hidden border-b border-[#f0d9b5]/10">
          <div className="pointer-events-none absolute inset-0">
            <img src={images.hero} alt="" className="h-full w-full object-cover object-center opacity-30 mix-blend-luminosity" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,17,15,.95)_0%,rgba(23,17,15,.7)_52%,rgba(23,17,15,.35)_100%)]" />
          </div>
          <div className="pointer-events-none absolute -right-40 top-[-8rem] h-[38rem] w-[38rem] rounded-full bg-[#8d2428]/25 blur-[120px]" />
          <div className="pointer-events-none absolute bottom-[-14rem] left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[#c8673d]/15 blur-[100px]" />

          <div className="relative mx-auto grid min-h-[41rem] max-w-7xl gap-14 px-5 py-20 sm:py-28 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:px-8 lg:py-36">
            <div>
              <p className="mb-7 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-[#dd8656]"><span className="h-px w-10 bg-[#dd8656]" />Strategic Brand Development</p>
              <h1 className="max-w-4xl font-heading text-6xl font-light leading-[0.92] sm:text-7xl lg:text-[6.8rem]">Build the brand your <span className="bg-gradient-to-r from-[#f0d9b5] via-[#dd8656] to-[#d9622c] bg-clip-text italic text-transparent">next chapter</span> requires.</h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-[#cbbeb2]">Strategic brand development for businesses ready to stop outgrowing the version of themselves the market still sees.</p>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                <Link to="/contact" data-testid="link-start-brand-revival" className="inline-flex items-center gap-3 bg-[#d9622c] px-5 py-3.5 text-sm font-semibold text-[#26130f] transition-transform hover:-translate-y-0.5 hover:bg-[#e7854e]">Start Your Brand Revival <ArrowRight className="h-4 w-4" /></Link>
                <a href="#work" className="inline-flex items-center gap-2 text-sm text-[#e5cba9] transition-colors hover:text-[#f8f0e5]">Explore transformations <ArrowDownRight className="h-4 w-4" /></a>
              </div>
            </div>

            <aside className="relative mx-auto w-full max-w-lg lg:pb-3">
              <div className="absolute -inset-6 rounded-[2px] bg-[#b3232c]/20 blur-3xl" />
              <div className="relative border border-[#efd8b5]/25 bg-[#211714]/90 p-5 shadow-2xl backdrop-blur-sm sm:p-7">
                <div className="flex items-center justify-between border-b border-[#efd8b5]/15 pb-5">
                  <span className="text-xs uppercase tracking-[0.24em] text-[#d9c5b2]">Inside the Foundry</span>
                  <span className="flex items-center gap-2 text-xs text-[#dd8656]"><span className="h-2 w-2 rounded-full bg-[#dd8656]" />Built to move</span>
                </div>
                <div className="border-b border-[#efd8b5]/15 py-8">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#b9957c]">The big picture</p>
                  <p className="mt-3 max-w-sm font-heading text-4xl leading-tight text-[#f9eee1]">Clarity creates momentum.</p>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-[#c3b2a6]">A stronger brand gives your business a clear center from which to decide, communicate, and grow.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-5">
                  <div className="border border-[#efd8b5]/15 bg-[#170f0e] p-4"><Compass className="h-5 w-5 text-[#dd8656]" /><p className="mt-6 text-sm text-[#e7d4c1]">Strategic clarity</p><p className="mt-1 text-xs leading-5 text-[#a99185]">A useful center for the next move.</p></div>
                  <div className="border border-[#efd8b5]/15 bg-[#170f0e] p-4"><Palette className="h-5 w-5 text-[#dd8656]" /><p className="mt-6 text-sm text-[#e7d4c1]">Brand expression</p><p className="mt-1 text-xs leading-5 text-[#a99185]">A system that can carry the work.</p></div>
                </div>
              </div>
            </aside>
          </div>
        </ThemeSection>

        <ThemeSection id="work" theme="cream" className="text-[#17110f]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:py-28 lg:px-8">
            <div className="mb-12 grid gap-6 lg:grid-cols-[1.1fr_.6fr] lg:items-end">
              <div><p className="text-xs uppercase tracking-[0.25em] text-[#9d422c]">Selected transformations</p><h2 className="mt-4 max-w-3xl font-heading text-5xl leading-[0.94] sm:text-6xl">Proof that the brand can catch up to the business.</h2></div>
              <p className="max-w-md text-sm leading-7 text-[#67544a]">Not a random wall of deliverables. A selection of work built to move perception, sharpen decisions, and create a presence that earns its place in the market.</p>
            </div>

            <div className="grid items-start gap-7 md:grid-cols-3">
              <Link to="/portfolio" className="group block text-[#17110f]">
                <div className="overflow-hidden bg-[#d8cabc]/45"><NaturalImage src={images.colleagues} alt="A collaborative work environment" className="transition duration-700 group-hover:scale-[1.015]" /></div>
                <div className="mt-4 border-t border-[#39231e]/20 pt-3"><div className="flex items-start justify-between gap-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d422c]">Brand Revival</p><ArrowDownRight className="h-4 w-4 shrink-0 text-[#9d422c] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></div><h3 className="mt-3 font-heading text-3xl leading-[0.98]">A brand system designed to lead, not just look good.</h3><p className="mt-3 text-xs uppercase tracking-[0.12em] text-[#756258]">Strategy · Identity · Rollout</p></div>
              </Link>
              <Link to="/portfolio" className="group block text-[#17110f] md:mt-0 lg:mt-24">
                <div className="overflow-hidden bg-[#d8cabc]/45"><NaturalImage src={images.interior} alt="A refined interior environment" className="transition duration-700 group-hover:scale-[1.015]" /></div>
                <div className="mt-4 border-t border-[#39231e]/20 pt-3"><div className="flex items-start justify-between gap-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d422c]">Digital Authority</p><ArrowDownRight className="h-4 w-4 shrink-0 text-[#9d422c] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></div><h3 className="mt-3 font-heading text-3xl leading-[0.98]">A web experience that finally matched the business behind it.</h3><p className="mt-3 text-xs uppercase tracking-[0.12em] text-[#756258]">Strategy · Website · Messaging</p></div>
              </Link>
              <Link to="/portfolio" className="group block text-[#17110f] md:mt-0 lg:mt-8">
                <div className="overflow-hidden bg-[#d8cabc]/45"><NaturalImage src={images.strategyTable} alt="A strategy session at a work table" className="transition duration-700 group-hover:scale-[1.015]" /></div>
                <div className="mt-4 border-t border-[#39231e]/20 pt-3"><div className="flex items-start justify-between gap-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d422c]">Brand in the Real World</p><ArrowDownRight className="h-4 w-4 shrink-0 text-[#9d422c] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></div><h3 className="mt-3 font-heading text-3xl leading-[0.98]">From first impression to real-world presence.</h3><p className="mt-3 text-xs uppercase tracking-[0.12em] text-[#756258]">Identity · Signage · Activation</p></div>
              </Link>
            </div>
            <div className="mt-12"><Link to="/portfolio" data-testid="link-explore-portfolio" className="inline-flex items-center gap-2 border-b border-[#17110f] pb-2 text-sm font-semibold text-[#17110f] transition-colors hover:text-[#9d422c]">Explore the work <ArrowRight className="h-4 w-4" /></Link></div>
          </div>
        </ThemeSection>

        <ThemeSection theme="ember" className="border-y border-[#f0d9b5]/15 text-[#fff3e5]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:py-28 lg:grid-cols-[.72fr_1.28fr] lg:px-8">
            <div><p className="text-xs uppercase tracking-[0.25em] text-[#f3cfac]">The point of view</p><h2 className="mt-4 font-heading text-5xl leading-[0.94] sm:text-6xl">Brand First.<br />Always.</h2></div>
            <div><p className="max-w-3xl font-heading text-3xl leading-tight text-[#fff3e5] sm:text-4xl">Mediocrity is a dream-killer. Market leadership demands showing up different, with the depth of clarity that lets you step out in conviction while your competitors react to market shifts.</p><p className="mt-7 max-w-2xl leading-8 text-[#f0d8c4]">Business moves at breakneck speed, often too fast for us to fully grasp what we are actually building. If you are reacting to the market, you will never shape it.</p></div>
          </div>
        </ThemeSection>

        <ThemeSection theme="ink" className="text-[#f8f0e5]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:py-28 lg:px-8">
            <div className="mb-12 grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="text-xs uppercase tracking-[0.25em] text-[#dd8656]">When you lead brand first</p></div><div><h2 className="font-heading text-5xl leading-[0.94] sm:text-6xl">What changes when the brand finally fits.</h2><p className="mt-5 max-w-2xl text-[#cbbeb2]">This is what brand strategy actually does. It gives you the clarity and confidence to show up in the market like you mean business.</p></div></div>
            <div className="grid gap-px border border-[#f0d9b5]/15 bg-[#f0d9b5]/15 md:grid-cols-2">
              {outcomes.map(({ index, icon: Icon, title, description }) => (
                <article key={index} className="bg-[#17110f]/90 p-7 backdrop-blur-sm sm:p-9"><div className="flex items-center justify-between"><span className="font-mono text-xs text-[#dd8656]">{index}</span><Icon className="h-5 w-5 text-[#e5cba9]" strokeWidth={1.5} /></div><h3 className="mt-16 max-w-md font-heading text-3xl leading-tight text-[#f8f0e5]">{title}</h3><p className="mt-4 max-w-xl text-base leading-7 text-[#b9a79a]">{description}</p></article>
              ))}
            </div>
          </div>
        </ThemeSection>

        <ThemeSection id="approach" theme="cream" className="text-[#17110f]">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:py-28 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8">
            <div><p className="text-xs uppercase tracking-[0.25em] text-[#9d422c]">Not just aesthetics</p><h2 className="mt-4 max-w-2xl font-heading text-5xl leading-[0.94] sm:text-6xl">Not a prettier version of the same problem.</h2><div className="mt-8 max-w-xl space-y-5 text-[15px] leading-7 text-[#67544a]"><p>Most design agencies create aesthetics, making things look good without asking if they actually work. We do not operate that way.</p><p>Every brand we build starts with strategy: clarity on who you are, who you serve, and why it matters. Then we translate that strategy into visual and verbal systems that communicate your brand in the market.</p><p>No handoffs mean no lost-in-translation moments. Strategy and execution stay aligned, so everything looks together, works together, and moves you where you belong.</p></div><Link to="/services" className="mt-8 inline-flex items-center gap-3 border border-[#17110f] px-5 py-3.5 text-sm font-semibold text-[#17110f] transition-colors hover:bg-[#17110f] hover:text-[#f8f0e5]">Discover Strategic Brand Solutions <ArrowRight className="h-4 w-4" /></Link></div>
            <div className="relative overflow-hidden bg-[#d8cabc]/45"><NaturalImage src={images.womanAtWork} alt="A strategic brand work session" /><div className="absolute bottom-0 left-0 max-w-xs bg-[#17110f] px-5 py-4 font-heading text-2xl leading-tight text-[#f8f0e5]">Strategy and expression, held together.</div></div>
          </div>
        </ThemeSection>

        <ThemeSection theme="rust" className="border-y border-[#f0d9b5]/15 text-[#fff3e5]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:py-28 lg:px-8">
            <div className="mb-12"><p className="text-xs uppercase tracking-[0.25em] text-[#f3cfac]">Ways to work together</p><h2 className="mt-4 max-w-3xl font-heading text-5xl leading-[0.94] sm:text-6xl">Build what is next with intention.</h2></div>
            <div className="grid gap-px border border-[#f0d9b5]/25 bg-[#f0d9b5]/25 md:grid-cols-2 lg:grid-cols-4">
              {pathways.map(([index, title, description]) => (
                <Link to="/services" key={index} className="group flex min-h-72 flex-col bg-[#42181d]/70 p-6 backdrop-blur-sm transition-colors hover:bg-[#2c1115]/80"><span className="font-mono text-xs text-[#f3cfac]">{index}</span><h3 className="mt-14 font-heading text-3xl leading-[0.98]">{title}</h3><p className="mt-4 text-sm leading-6 text-[#f0d8c4]">{description}</p><ArrowDownRight className="mt-auto h-5 w-5 text-[#f3cfac] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>
              ))}
            </div>
          </div>
        </ThemeSection>

        <ThemeSection theme="cream" className="text-[#17110f]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8"><p className="text-center text-xs uppercase tracking-[0.25em] text-[#9d422c]">Companies We&apos;ve Helped Move Forward</p><div className="mt-8 grid grid-cols-2 border-y border-[#39231e]/20 sm:grid-cols-4 lg:grid-cols-8">{['Grandview', 'JINJI', 'WAKO USA', 'Grand Masterpiece', 'Veneration Forge', 'Keim Resources', 'Olive', 'All Green'].map((name) => <span key={name} className="flex min-h-28 items-center justify-center border-r border-[#39231e]/20 px-3 text-center font-heading text-xl text-[#17110f]/55 last:border-r-0">{name}</span>)}</div></div>
        </ThemeSection>

        <ThemeSection theme="closing" className="border-y border-[#f0d9b5]/15 text-[#f8f0e5]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:py-24 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8">
            <div><p className="text-xs uppercase tracking-[0.25em] text-[#dd8656]">The next move</p><h2 className="mt-4 max-w-xl font-heading text-5xl leading-[0.94] sm:text-6xl">Ready to Take the Lead?</h2><p className="mt-6 max-w-xl leading-7 text-[#d7c5b9]">If your current efforts feel disjointed, more like chasing than leading, it may be time to reset.</p><p className="mt-4 max-w-xl leading-7 text-[#d7c5b9]">Let&apos;s map a brand solution that fits your ambition: a cohesive strategy, visual identity, and messaging that compels action as your path forward becomes clear.</p><Link to="/contact" className="mt-8 inline-flex items-center gap-3 bg-[#d9622c] px-5 py-3.5 text-sm font-semibold text-[#26130f] transition-transform hover:-translate-y-0.5 hover:bg-[#e7854e]">Start Your Brand Revival <ArrowRight className="h-4 w-4" /></Link></div>
            <figure className="border border-[#efd8b5]/25 bg-[#211714]/55 p-7 backdrop-blur-sm sm:p-9"><blockquote className="font-heading text-3xl leading-tight text-[#f9eee1] sm:text-4xl">“This company is one of a kind. The attention to detail and the genuine desire to create something specifically for you is rare.”</blockquote><figcaption className="mt-8 flex items-center justify-between border-t border-[#efd8b5]/15 pt-5"><span className="tracking-[0.2em] text-[#dd8656]">★★★★★</span><span className="text-xs uppercase tracking-[0.16em] text-[#c3b2a6]">Client testimonial</span></figcaption></figure>
          </div>
        </ThemeSection>

        <ThemeSection theme="cream" className="text-[#17110f]">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28 lg:px-8">
            <div className="text-center"><p className="text-xs uppercase tracking-[0.25em] text-[#9d422c]">Clarity before commitment</p><h2 className="mt-4 font-heading text-5xl leading-[0.94] sm:text-6xl">Frequently Asked Questions</h2></div>
            <div className="mt-12 border-t border-[#39231e]/20">
              {faqs.map(([question, answer], index) => {
                const isOpen = openFaq === index;
                return (
                  <article key={question} className="border-b border-[#39231e]/20">
                    <button type="button" onClick={() => setOpenFaq(isOpen ? -1 : index)} className="flex w-full items-center justify-between gap-8 py-6 text-left text-base font-semibold text-[#17110f]">
                      <span>{question}</span>
                      <ChevronDown className={`h-5 w-5 shrink-0 text-[#9d422c] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && <p className="max-w-3xl pb-6 text-sm leading-7 text-[#67544a]">{answer}</p>}
                  </article>
                );
              })}
            </div>
          </div>
        </ThemeSection>
      </main>

      <footer className="relative z-10 border-t border-[#f0d9b5]/10 bg-[#17110f]">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-5 py-9 text-sm text-[#a99185] lg:px-8">
          <span>© {new Date().getFullYear()} The Brand Revivalist®</span>
          <div className="flex gap-5"><Link to="/portfolio" data-testid="link-footer-portfolio" className="hover:text-[#f8f0e5]">Portfolio</Link><Link to="/privacy" data-testid="link-footer-privacy" className="hover:text-[#f8f0e5]">Privacy</Link><Link to="/terms" data-testid="link-footer-terms" className="hover:text-[#f8f0e5]">Terms</Link></div>
        </div>
      </footer>
    </div>
  );
}
