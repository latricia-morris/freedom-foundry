import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  LockKeyhole,
  Sparkles,
} from 'lucide-react';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

const C = {
  coal: '#0D0E11',
  graphite: '#15161A',
  panel: '#1B1D23',
  panelRaised: '#202229',
  border: 'rgba(255,255,255,0.12)',
  foreground: '#F4F1EC',
  mutedForeground: '#C8C5C0',
  muted: '#9A9895',
  copper: '#D8754A',
  ember: '#E78A5A',
  oxblood: '#5A0208',
  merlot: '#260104',
  gold: '#C39A66',
};

const benefits = [
  {
    icon: Sparkles,
    title: 'Tools for clearer brand decisions',
    description:
      'Access practical prompts, frameworks, and resources designed to help you build with more clarity and intention.',
  },
  {
    icon: LockKeyhole,
    title: 'A more organized place to grow',
    description:
      'Keep the ideas, direction, and resources that matter close instead of losing momentum across scattered tabs and folders.',
  },
  {
    icon: Check,
    title: 'A deeper connection to the work',
    description:
      'Get insider access to the perspective, guidance, and strategic thinking behind The Brand Revivalist.',
  },
];

const clientAccessItems = [
  'Your strategic foundation and key decisions',
  'Project resources, deliverables, and approvals',
  'Brand assets, guidance, and next steps',
  'A more elevated, organized way to work together',
];

const faqs = [
  {
    question: 'What is Freedom Foundry?',
    answer:
      'Freedom Foundry is the insider-access portal of The Brand Revivalist. It gives brand builders access to select tools, resources, and guidance, while giving active clients a dedicated workspace for their work together.',
  },
  {
    question: 'Is it free to create an account?',
    answer:
      'Yes. You can create a free account to access available brand-building tools, resources, and insider updates. Additional resources or experiences may be made available over time.',
  },
  {
    question: 'I am a Brand Revivalist client. Is this where my project lives?',
    answer:
      'Yes. Active clients can use Freedom Foundry to access relevant strategy, project materials, resources, approvals, deliverables, and next steps.',
  },
  {
    question: 'Can I hire The Brand Revivalist through Freedom Foundry?',
    answer:
      'Freedom Foundry is the access portal. To explore strategic branding, identity, messaging, web design, speaking, or a full engagement, visit The Brand Revivalist.',
  },
];

function PrimaryButton({ children, to, className = '' }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-3 bg-[#D8754A] px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#0D0E11] transition hover:bg-[#E78A5A] focus:outline-none focus:ring-2 focus:ring-[#E78A5A] focus:ring-offset-2 focus:ring-offset-[#0D0E11] ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4" strokeWidth={2} />
    </Link>
  );
}

function SecondaryButton({ children, to, className = '' }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-3 border border-white/30 px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#F4F1EC] transition hover:border-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-[#0D0E11] ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4" strokeWidth={2} />
    </Link>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#0D0E11] text-[#F4F1EC]">
      <header className="relative z-20 border-b border-white/10 bg-[#0D0E11]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-5 py-5 sm:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src={`${basePath}/forge-logo.png`}
              alt="Freedom Foundry"
              className="h-11 w-11 shrink-0 object-contain"
            />

            <div className="min-w-0 leading-tight">
              <p className="font-heading text-base tracking-[0.07em] sm:text-lg">
                FREEDOM FOUNDRY
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#C8C5C0] sm:text-[10px]">
                A Brand Revivalist Experience
              </p>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              to="/sign-in"
              className="hidden text-xs font-semibold text-[#C8C5C0] transition hover:text-white sm:inline"
            >
              Log in
            </Link>

            <Link
              to="/sign-up"
              className="border border-white/25 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:border-white hover:bg-white/10"
            >
              Create free account
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_74%_16%,rgba(216,117,74,0.22),transparent_24%),radial-gradient(circle_at_16%_88%,rgba(90,2,8,0.62),transparent_42%),linear-gradient(135deg,#0D0E11_0%,#171116_46%,#260104_100%)]"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)',
              backgroundSize: '42px 42px',
              maskImage:
                'linear-gradient(to bottom, black 0%, rgba(0,0,0,.45) 60%, transparent 100%)',
            }}
          />

          <div className="relative mx-auto flex min-h-[650px] max-w-6xl items-center px-5 py-24 sm:px-8 sm:py-32">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C39A66] sm:text-xs">
                Insider access by The Brand Revivalist
              </p>

              <h1 className="mt-6 font-heading text-5xl font-light leading-[0.94] sm:text-6xl lg:text-7xl">
                Build a brand with
                <span className="block italic text-[#E78A5A]">more behind it.</span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-[#C8C5C0] sm:text-lg">
                Freedom Foundry is the private access point for people building brands
                with intention. Create a free account for strategic tools, resources,
                and insider guidance—or enter your dedicated workspace as a Brand
                Revivalist client.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <PrimaryButton to="/sign-up">
                  Create your free account
                </PrimaryButton>

                <SecondaryButton to="/sign-in">
                  Client login
                </SecondaryButton>
              </div>

              <p className="mt-5 text-sm text-[#9A9895]">
                Already inside?{' '}
                <Link
                  to="/sign-in"
                  className="text-[#E78A5A] underline decoration-[#E78A5A]/50 underline-offset-4 transition hover:text-[#F4F1EC]"
                >
                  Continue to your workspace.
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#15161A] px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C39A66]">
                The Foundry is open
              </p>

              <h2 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">
                A better place to build from.
              </h2>

              <p className="mt-5 text-base leading-8 text-[#C8C5C0]">
                Good brands are not built through random inspiration, disconnected
                decisions, or a folder full of unfinished ideas. Freedom Foundry gives
                you a place to gather perspective, build with more clarity, and stay
                connected to the work that moves your brand forward.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
              {benefits.map(({ icon: Icon, title, description }) => (
                <article key={title} className="bg-[#15161A] p-7 sm:p-8">
                  <Icon className="h-5 w-5 text-[#E78A5A]" strokeWidth={1.6} />
                  <h3 className="mt-6 font-heading text-2xl">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#C8C5C0]">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#F2EFE8] px-5 py-16 text-[#0D0E11] sm:px-8 sm:py-24">
          <div
            aria-hidden="true"
            className="absolute -right-10 top-1/2 hidden -translate-y-1/2 select-none font-heading text-[20rem] leading-none text-[#0D0E11]/[0.045] lg:block"
          >
            F
          </div>

          <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8E4B35]">
                For Brand Revivalist clients
              </p>

              <h2 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">
                Your work deserves more than an inbox.
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-[#3F4145]">
                Freedom Foundry gives active clients a more elevated place to access
                their work, keep decisions connected, and carry the strategy forward
                long after a meeting ends.
              </p>

              <div className="mt-8">
                <PrimaryButton to="/sign-in">
                  Enter your workspace
                </PrimaryButton>
              </div>
            </div>

            <div className="border border-[#0D0E11]/15 bg-white p-7 shadow-[0_18px_50px_rgba(13,14,17,0.10)] sm:p-9">
              <p className="font-heading text-2xl">
                Inside Freedom Foundry, clients can access:
              </p>

              <ul className="mt-7 space-y-5">
                {clientAccessItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] leading-6 text-[#3F4145]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D8754A]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 border-t border-[#0D0E11]/10 pt-6">
                <p className="text-sm leading-7 text-[#55585E]">
                  The strategy does not stop being useful the day a project launches.
                  Freedom Foundry gives it a place to live, work, and keep moving.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0D0E11] px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C39A66]">
                Looking for strategic brand development?
              </p>

              <h2 className="mt-4 max-w-2xl font-heading text-4xl leading-tight sm:text-5xl">
                Start with The Brand Revivalist.
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-8 text-[#C8C5C0]">
                Freedom Foundry is where you access the tools and the experience.
                The Brand Revivalist is where we build the strategy, identity,
                messaging, and digital presence behind brands ready to lead.
              </p>
            </div>

            <div className="lg:justify-self-end">
              <a
                href="https://thebrandrevivalist.com"
                className="inline-flex items-center gap-3 border border-white/30 px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white/10"
              >
                Visit The Brand Revivalist
                <ExternalLink className="h-4 w-4" strokeWidth={1.8} />
              </a>
            </div>
          </div>
        </section>

        <section className="bg-[#F2EFE8] px-5 py-16 text-[#0D0E11] sm:px-8 sm:py-24">
          <div className="mx-auto max-w-4xl">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-[#8E4B35]">
              Questions, answered
            </p>

            <h2 className="mt-4 text-center font-heading text-4xl sm:text-5xl">
              Frequently Asked Questions
            </h2>

            <div className="mt-12 border-t border-[#0D0E11]/15">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <article key={faq.question} className="border-b border-[#0D0E11]/15">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left"
                    >
                      <span className="text-base font-semibold leading-6">
                        {faq.question}
                      </span>

                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-[#8E4B35] transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        strokeWidth={1.8}
                      />
                    </button>

                    {isOpen && (
                      <p className="max-w-3xl pb-7 text-[15px] leading-7 text-[#4D5157]">
                        {faq.answer}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#0D0E11]">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-7 px-5 py-9 sm:px-8 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <img
              src={`${basePath}/forge-logo.png`}
              alt=""
              className="h-9 w-9 object-contain opacity-80"
            />

            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-[#F4F1EC]">
                FREEDOM FOUNDRY
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[#9A9895]">
                A Brand Revivalist Experience
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-[#C8C5C0]">
            <a
              href="https://thebrandrevivalist.com"
              className="transition hover:text-white"
            >
              The Brand Revivalist
            </a>
            <Link to="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link to="/terms" className="transition hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}