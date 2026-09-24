import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, ChevronDown, Plus } from 'lucide-react';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

const C = {
  coal: '#0D0E11',
  graphite: '#14161A',
  secondary: '#1E1F24',
  muted: '#191B1F',
  accent: '#25272C',
  border: '#27292F',
  cloudbone: '#F3F4F6',
  foreground: '#F0F2F4',
  mutedForeground: '#C7CAD1',
  steel: '#84899A',
  slate: '#454E68',
  copper: '#E26E3C',
  brass: '#DC5338',
  ember: '#D9754A',
  oxblood: '#660000',
  merlot: '#460101',
};

const images = {
  hero: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/0b259d369_modern-office-teamwork-co-working-space-quiet-a-2024-12-06-22-51-04-utc.webp',
  workOne: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/106713cff_working-colleagues-2025-01-29-07-49-37-utc.webp',
  workTwo: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/2474a7b7d_stylish-and-cozy-interior-of-dining-room-2024-10-17-01-04-36-utc.webp',
  workThree: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/b9ac87bed_businesspeople-sitting-and-working-at-desk-in-offi-2024-10-18-09-34-12-utc.webp',
  approach: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/9899a82d3_businesswoman-working-with-her-colleagues-at-offic-2025-03-16-06-52-50-utc.webp',
};

const outcomes = [
  ['Your team stops second-guessing.', 'Everyone knows what you stand for and where you are headed. Decisions get faster, more consistent, and your whole operation moves like it is actually unified.'],
  ['You show up with confidence.', 'No more wondering if your brand looks amateur next to the competition. You know exactly who you are and why prospects should choose you.'],
  ['The right clients find you.', 'Instead of competing on price with everyone else, you attract people who get what you are about and are willing to pay for it.'],
  ['Growth becomes strategic, not chaotic.', 'Every opportunity gets filtered through your brand clarity. You say yes to what fits, no to what does not, and build something sustainable.'],
];

const services = [
  ['Brand Strategy', 'The strategic foundation that aligns your vision, values, and goals to guide every brand decision.'],
  ['Brand Identity', 'Complete visual and verbal identity systems, including guidelines and assets that command respect.'],
  ['Rebranding', 'Identity overhauls for established companies, mergers, and acquisitions, refreshing your presence while respecting what matters.'],
  ['Graphic Design', 'High-impact layouts and assets that look sharp and move prospects to action.'],
  ['Copywriting', 'Messaging frameworks and copy that captures your authentic voice and drives engagement.'],
  ['Web Design', 'Bespoke web design that leaves the right impressions.'],
  ['Speaking & Workshops', 'Engagements on branding, Christian entrepreneurship, and legacy-minded leadership.'],
  ['Package Design', 'Product packaging that puts your brand directly in consumers’ hands.'],
];

const faqs = [
  ['What makes Ox & Iron different from other branding agencies?', 'Every brand here represents real people building something meaningful. The work begins with strategy, then carries that clarity through the way the brand looks, sounds, and moves.'],
  ['How long does a branding project take?', 'The right timeline depends on the depth of strategy, scope of design work, and the decisions required to build a system that will last.'],
  ['Do you work with small businesses or just large companies?', 'The work is built for businesses ready to lead with intention, whether they are established, scaling, evolving, or entering a new chapter.'],
  ['What’s included in your brand strategy service?', 'Brand strategy clarifies who you are, who you serve, what matters, and how the brand should show up so future decisions have a clear foundation.'],
  ['Can you help rebrand without losing our existing reputation?', 'Yes. A strong rebrand keeps the equity you have earned while correcting what is no longer serving the business.'],
  ['What results can we expect from strategic branding?', 'A clearer message, stronger market presence, a more confident team, and a brand that helps the right people understand why you are the right choice.'],
];

function rgb(hex) {
  const value = hex.replace('#', '');
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
}

function blend(from, to, amount) {
  const [r1, g1, b1] = rgb(from);
  const [r2, g2, b2] = rgb(to);
  const mix = (a, b) => Math.round(a + (b - a) * amount).toString(16).padStart(2, '0');
  return `#${mix(r1, r2)}${mix(g1, g2)}${mix(b1, b2)}`;
}

/* Prevents Cloudbone + red from ever producing pink/mauve. */
function industrialBlend(from, to, amount) {
  const lightToFire = from === C.cloudbone && (to === C.oxblood || to === C.merlot);
  const fireToLight = to === C.cloudbone && (from === C.oxblood || from === C.merlot);

  if (lightToFire) {
    return amount < 0.5
      ? blend(from, C.coal, amount * 2)
      : blend(C.coal, to, (amount - 0.5) * 2);
  }

  if (fireToLight) {
    return amount < 0.5
      ? blend(from, C.coal, amount * 2)
      : blend(C.coal, to, (amount - 0.5) * 2);
  }

  return blend(from, to, amount);
}

function Chapter({ color, className = '', children, id }) {
  return <section id={id} data-industrial-color={color} className={`relative snap-start bg-transparent ${className}`}>{children}</section>;
}

function NaturalImage({ src, alt, className = '' }) {
  return <img src={src} alt={alt} className={`block h-auto w-full max-w-full object-contain object-center ${className}`} />;
}

function FireButton({ children, to }) {
  return <Link to={to} className="inline-flex items-center gap-3 bg-gradient-to-r from-[#DC5338] via-[#E26E3C] to-[#D9754A] px-5 py-3.5 text-sm font-semibold text-[#0F121A] shadow-[0_12px_30px_rgba(226,110,60,0.15)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_16px_38px_rgba(226,110,60,0.24)]">{children}</Link>;
}

export default function LandingPage() {
  const rootRef = useRef(null);
  const backgroundRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const html = document.documentElement;
    const previousSnap = html.style.scrollSnapType;
    html.style.scrollSnapType = 'y proximity';

    let animationFrame;
    const updateBackground = () => {
      const root = rootRef.current;
      const background = backgroundRef.current;
      if (!root || !background) return;

      const sections = [...root.querySelectorAll('[data-industrial-color]')];
      const focus = window.innerHeight * 0.5;
      const points = sections.map((section) => {
        const box = section.getBoundingClientRect();
        return { midpoint: box.top + box.height / 2, color: section.dataset.industrialColor };
      });

      if (!points.length) return;
      let color = points[0].color;

      if (focus <= points[0].midpoint) {
        color = points[0].color;
      } else if (focus >= points[points.length - 1].midpoint) {
        color = points[points.length - 1].color;
      } else {
        for (let i = 0; i < points.length - 1; i += 1) {
          const current = points[i];
          const next = points[i + 1];
          if (focus >= current.midpoint && focus <= next.midpoint) {
            const progress = Math.max(0, Math.min(1, (focus - current.midpoint) / (next.midpoint - current.midpoint)));
            color = industrialBlend(current.color, next.color, progress);
            break;
          }
        }
      }

      background.style.backgroundColor = color;
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateBackground);
    };

    updateBackground();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      html.style.scrollSnapType = previousSnap;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative min-h-[100dvh] overflow-x-hidden bg-[#0D0E11] text-[#F0F2F4]">
      <div ref={backgroundRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-[#0D0E11] motion-reduce:hidden" />

      <header className="relative z-20 bg-[#0D0E11]/88 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-5 lg:px-8">
          <Link to="/" data-testid="link-home" className="flex items-center gap-3">
            <img src={`${basePath}/forge-logo.png`} alt="Freedom Foundry" className="h-10 w-10 rounded-xl object-cover shadow-[0_0_22px_rgba(226,110,60,0.18)]" />
            <div className="leading-tight"><p className="font-heading text-lg tracking-[0.04em]">FREEDOM FOUNDRY</p><p className="text-[10px] uppercase tracking-[0.22em] text-[#C7CAD1]">By The Brand Revivalist®</p></div>
          </Link>
          <div className="flex items-center gap-4 text-sm"><Link to="/sign-in" className="text-[#C7CAD1] transition-colors hover:text-[#F0F2F4]">Sign in</Link><Link to="/sign-up" className="bg-[#1E1F24] px-4 py-2 text-[#F0F2F4] transition-colors hover:bg-[#25272C]">Create account</Link></div>
        </div>
      </header>

      <main className="relative z-10">
        <Chapter color={C.coal} className="min-h-[42rem] overflow-hidden">
          <div className="pointer-events-none absolute inset-0"><img src={images.hero} alt="" className="h-full w-full object-cover object-center opacity-32 grayscale-[10%]" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,14,17,.96)_0%,rgba(13,14,17,.7)_55%,rgba(13,14,17,.25)_100%)]" /><div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 86% 18%, rgba(226,110,60,0.13), transparent 28%), radial-gradient(circle at 10% 88%, rgba(102,0,0,0.2), transparent 38%)' }} /></div>
          <div className="relative mx-auto flex min-h-[42rem] max-w-7xl items-end px-5 py-20 sm:py-28 lg:px-8 lg:py-32"><div className="max-w-3xl"><p className="mb-6 text-xs uppercase tracking-[0.28em] text-[#C7CAD1]">Freedom Foundry by The Brand Revivalist®</p><h1 className="font-heading text-5xl font-light leading-[0.98] sm:text-6xl lg:text-7xl">Branding &amp; Marketing</h1><p className="mt-3 font-heading text-5xl leading-tight sm:text-7xl"><span className="bg-gradient-to-r from-[#DC5338] via-[#E26E3C] to-[#D9754A] bg-clip-text italic text-transparent">Elevate your brand to a category of one.</span></p><div className="mt-9"><FireButton to="/contact">Schedule a Brand Strategy Call <ArrowRight className="h-4 w-4" /></FireButton></div></div></div>
        </Chapter>

        <Chapter id="work" color={C.cloudbone} className="px-5 py-20 text-[#0D0E11] sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl"><h2 className="text-center font-heading text-5xl leading-none sm:text-6xl">Some of Our Work</h2><div className="mt-14 grid items-start gap-8 md:grid-cols-3"><Link to="/portfolio" className="group block overflow-hidden bg-[#E7E9EC]"><NaturalImage src={images.workOne} alt="Selected brand work" className="transition duration-500 group-hover:scale-[1.01]" /></Link><Link to="/portfolio" className="group block overflow-hidden bg-[#E7E9EC] md:mt-16"><NaturalImage src={images.workTwo} alt="Selected digital work" className="transition duration-500 group-hover:scale-[1.01]" /></Link><Link to="/portfolio" className="group block overflow-hidden bg-[#E7E9EC] md:mt-5"><NaturalImage src={images.workThree} alt="Selected strategy work" className="transition duration-500 group-hover:scale-[1.01]" /></Link></div><div className="mt-12 flex flex-wrap justify-center gap-5"><Link to="/portfolio" className="inline-flex items-center gap-3 bg-[#0D0E11] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F0F2F4] transition-colors hover:bg-[#1E1F24]">Explore Our Portfolio <ArrowRight className="h-4 w-4" /></Link><Link to="/services" className="inline-flex items-center gap-3 bg-[#1E1F24] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F0F2F4] transition-colors hover:bg-[#25272C]">Discover Strategic Brand Solutions <ArrowRight className="h-4 w-4" /></Link></div></div>
        </Chapter>

        <Chapter color={C.cloudbone} className="px-5 pb-20 pt-6 text-[#0D0E11] sm:pb-28 lg:px-8"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_.85fr]"><div className="max-w-2xl space-y-6 text-[15px] leading-7 text-[#27292F]"><p>Mediocrity is a dream-killer. Market leadership demands showing up different, with the depth of clarity that lets you step out in conviction. While your competitors react to market shifts, you&apos;ll be the one shaping them.</p><p>Business moves at breakneck speed, often too fast for us to fully grasp what we are actually building. If you&apos;re reacting to the market, you&apos;ll never shape it.</p></div><div className="flex items-end justify-end"><div className="font-heading text-[8rem] leading-[.7] text-[#0D0E11] sm:text-[12rem]">F</div></div></div></Chapter>

        <Chapter color={C.graphite} className="px-5 py-20 text-[#F0F2F4] sm:py-28 lg:px-8"><div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 82% 18%, rgba(226,110,60,0.15), transparent 30%), radial-gradient(circle at 12% 88%, rgba(102,0,0,0.2), transparent 36%)' }} /><div className="relative mx-auto max-w-7xl"><p className="text-xs uppercase tracking-[0.25em] text-[#C7CAD1]">Brand First. Always.</p><h2 className="mt-4 max-w-4xl font-heading text-5xl leading-[.98] sm:text-6xl">We offer strategic brand development for established companies ready to own their market position.</h2><p className="mt-7 max-w-5xl text-base leading-8 text-[#C7CAD1]">If you&apos;re navigating transitions, scaling strategically, or entering new markets, your brand is either your greatest asset or your biggest liability. We make sure it&apos;s the former.</p><p className="mt-7 font-heading text-2xl"><span className="bg-gradient-to-r from-[#DC5338] via-[#E26E3C] to-[#D9754A] bg-clip-text text-transparent">When you lead brand first, remarkable things happen:</span></p><div className="mt-8 grid gap-4 md:grid-cols-2">{outcomes.map(([title, description]) => <article key={title} className="bg-[#1E1F24] p-7 sm:p-9"><h3 className="font-heading text-3xl leading-tight">{title}</h3><p className="mt-4 text-sm leading-7 text-[#C7CAD1]">{description}</p></article>)}</div><p className="mt-8 text-[#C7CAD1]">This is what brand strategy actually does. It gives you the clarity and confidence to show up in the market like you mean business.</p></div></Chapter>

        <Chapter id="about" color={C.cloudbone} className="px-5 py-20 text-[#0D0E11] sm:py-28 lg:px-8"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_.9fr] lg:items-center"><div><p className="max-w-2xl text-[15px] leading-7 text-[#27292F]">Most design agencies create aesthetics, making things look good without asking if they actually work.</p><p className="mt-5 text-[15px] leading-7 text-[#27292F]">We don&apos;t operate that way.</p><p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#27292F]">Every brand we build starts with strategy: clarity on who you are, who you serve, and why it matters. We then translate that strategy into the visual and verbal elements that communicate your brand in the market, ensuring your brand is cohesive, compelling, and built to perform.</p><p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#27292F]">No handoffs means no lost-in-translation moments. No hoping your designer “gets” what the strategist meant.</p><p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#27292F]">You come to one place. We develop the strategy AND execute the brand. Everything stays aligned, everything looks together, and everything works together to move you where you belong.</p><Link to="/services" className="mt-8 inline-flex items-center gap-3 bg-[#0D0E11] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F0F2F4] transition-colors hover:bg-[#1E1F24]">Discover Our Strategic Brand Solutions <ArrowRight className="h-4 w-4" /></Link></div><div className="overflow-hidden bg-[#E7E9EC]"><NaturalImage src={images.approach} alt="A team collaborating at work" /></div></div></Chapter>

        <Chapter color={C.merlot} className="px-5 py-20 text-[#F0F2F4] sm:py-28 lg:px-8"><div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 84% 15%, rgba(226,110,60,0.22), transparent 27%), linear-gradient(135deg, #460101 0%, #660000 54%, #0D0E11 125%)' }} /><div className="relative mx-auto max-w-7xl"><p className="font-heading text-5xl leading-none text-[#F0F2F4]/16 sm:text-7xl">RISE ABOVE THE NOISE</p><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{services.map(([title, description]) => <Link to="/services" key={title} className="group min-h-60 bg-[#101114]/90 p-6 transition-colors hover:bg-[#1E1F24]"><h3 className="font-heading text-2xl">{title}</h3><p className="mt-4 text-sm leading-6 text-[#C7CAD1]">{description}</p><ArrowDownRight className="mt-8 h-4 w-4 text-[#E26E3C] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>)}</div></div></Chapter>

        <Chapter color={C.cloudbone} className="px-5 py-16 text-[#0D0E11] sm:py-20 lg:px-8"><div className="mx-auto max-w-7xl"><h2 className="text-center font-heading text-4xl sm:text-5xl">Companies We&apos;ve Worked With</h2><div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-8">{['Grandview', 'JINJI', 'WAKO USA', 'Grand Masterpiece', 'Veneration Forge', 'Keim Resources', 'Olive', 'All Green'].map((name) => <span key={name} className="flex min-h-24 items-center justify-center px-3 text-center font-heading text-xl text-[#454E68]">{name}</span>)}</div></div></Chapter>

        <Chapter color={C.graphite} className="px-5 py-20 text-[#F0F2F4] sm:py-24 lg:px-8"><div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 84% 20%, rgba(226,110,60,0.17), transparent 31%), radial-gradient(circle at 14% 90%, rgba(102,0,0,0.2), transparent 40%)' }} /><div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div><h2 className="font-heading text-5xl leading-[.96] sm:text-6xl">Ready to Take the Lead?</h2><p className="mt-6 max-w-xl leading-7 text-[#C7CAD1]">If your current efforts feel disjointed, more like chasing than leading, it may be time to reset.</p><p className="mt-5 max-w-xl leading-7 text-[#C7CAD1]">Let&apos;s map a brand solution that fits your ambition: a cohesive strategy, a visual identity that commands respect, and messaging that compels action as your path to market becomes clear.</p><p className="mt-5 font-heading text-xl italic"><span className="bg-gradient-to-r from-[#DC5338] via-[#E26E3C] to-[#D9754A] bg-clip-text text-transparent">Ready to discover what&apos;s possible when your brand leads the way?</span></p><div className="mt-8"><FireButton to="/contact">Contact Us <ArrowRight className="h-4 w-4" /></FireButton></div></div><figure className="bg-[#101114] p-7 sm:p-9"><blockquote className="font-heading text-3xl leading-tight text-[#F0F2F4] sm:text-4xl">“This company is one of a kind. You don&apos;t see the attention to detail or the genuine desire to create something unique designed specifically for you.”</blockquote><figcaption className="mt-8 flex items-center justify-between"><span className="bg-gradient-to-r from-[#DC5338] via-[#E26E3C] to-[#D9754A] bg-clip-text tracking-[0.2em] text-transparent">★★★★★</span><span className="text-xs uppercase tracking-[0.16em] text-[#C7CAD1]">Veneration Forge</span></figcaption></figure></div></Chapter>

        <Chapter color={C.cloudbone} className="px-5 py-20 text-[#0D0E11] sm:py-28 lg:px-8"><div className="mx-auto max-w-5xl"><h2 className="text-center font-heading text-5xl sm:text-6xl">Frequently Asked Questions</h2><div className="mt-12 space-y-3">{faqs.map(([question, answer], index) => { const open = openFaq === index; return <article key={question} className={`bg-[#E7E9EC] transition-colors ${open ? 'bg-[#E0E3E7]' : 'hover:bg-[#E0E3E7]'}`}><button type="button" onClick={() => setOpenFaq(open ? null : index)} className="flex w-full items-center justify-between gap-8 px-5 py-5 text-left text-base font-semibold sm:px-6"><span>{question}</span><span className="flex h-7 w-7 shrink-0 items-center justify-center text-[#E26E3C]">{open ? '−' : <Plus className="h-4 w-4" />}</span></button>{open && <p className="max-w-3xl px-5 pb-6 text-sm leading-7 text-[#454E68] sm:px-6">{answer}</p>}</article>; })}</div></div></Chapter>
      </main>

      <footer className="relative z-10 bg-[#0D0E11]"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-5 py-9 text-sm text-[#C7CAD1] lg:px-8"><span>© {new Date().getFullYear()} The Brand Revivalist®</span><div className="flex gap-5"><Link to="/privacy" className="hover:text-[#F0F2F4]">Privacy</Link><Link to="/terms" className="hover:text-[#F0F2F4]">Terms</Link></div></div></footer>
    </div>
  );