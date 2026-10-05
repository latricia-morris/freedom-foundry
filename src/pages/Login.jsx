import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from 'lucide-react';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

const videoUrl =
  'https://media.base44.com/videos/public/6a6982f0647238bf2b5d67bf/8d01159f7_rising-golden-embers-on-black-background-2025-12-17-19-25-08-utc.mp4';

export default function FreedomFoundryLoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#050506] text-[#F7F3ED]">
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Readability and depth overlays */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,4,5,0.94)_0%,rgba(4,4,5,0.83)_37%,rgba(4,4,5,0.54)_62%,rgba(4,4,5,0.76)_100%)]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_16%_76%,rgba(87,4,10,0.38),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(225,115,60,0.13),transparent_24%)]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,.70), transparent 78%)',
        }}
      />

      <header className="relative z-20">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-5 py-5 sm:px-8 lg:px-12 lg:py-7">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src={`${basePath}/forge-logo.png`}
              alt="Freedom Foundry"
              className="h-11 w-11 shrink-0 object-contain drop-shadow-[0_0_18px_rgba(226,110,60,0.22)] sm:h-12 sm:w-12"
            />

            <div className="min-w-0 leading-tight">
              <p className="font-heading text-base tracking-[0.07em] text-[#F7F3ED] sm:text-lg">
                FREEDOM FOUNDRY
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-[0.19em] text-[#D7D0C8]/75 sm:text-[10px]">
                A Brand Revivalist Experience
              </p>
            </div>
          </Link>

          <a
            href="https://thebrandrevivalist.com"
            className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60 transition hover:text-white sm:inline-flex"
          >
            The Brand Revivalist
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.7} />
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-85px)] max-w-[1440px] items-center px-5 pb-8 sm:px-8 lg:min-h-[calc(100dvh-104px)] lg:px-12 lg:pb-12">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(400px,500px)] lg:items-center lg:gap-16 xl:gap-24">
          {/* Left: identity and free-access explanation */}
          <section className="max-w-2xl pt-4 lg:pt-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#D5A06A] sm:text-xs">
              Insider access by The Brand Revivalist
            </p>

            <h1 className="mt-6 max-w-xl font-heading text-5xl font-light leading-[0.94] tracking-[-0.025em] sm:text-6xl xl:text-7xl">
              The work behind
              <span className="block bg-[linear-gradient(100deg,#E9BE83_0%,#D66A3B_50%,#B71929_100%)] bg-clip-text italic text-transparent">
                brands built to last.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-[15px] leading-7 text-[#E5DFD7]/76 sm:text-base sm:leading-8">
              Freedom Foundry is your access point to brand-building tools,
              strategic resources, and the thinking behind The Brand Revivalist.
              Create a free account to step inside—or sign in to continue your work.
            </p>

            <div className="mt-8 flex max-w-xl items-start gap-3 border-l border-[#D8754A]/60 pl-4">
              <Sparkles
                className="mt-0.5 h-4 w-4 shrink-0 text-[#E29A61]"
                strokeWidth={1.7}
              />
              <p className="text-sm leading-6 text-[#D7D0C8]/80">
                Brand Revivalist clients receive access to their dedicated
                workspace, project materials, strategy, resources, approvals,
                and next steps inside Freedom Foundry.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                to="/sign-up"
                className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#F2D0A9] transition hover:text-white"
              >
                Create a free account
                <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
              </Link>

              <span className="hidden h-4 w-px bg-white/20 sm:block" />

              <a
                href="https://thebrandrevivalist.com"
                className="inline-flex items-center gap-2 text-xs font-semibold text-white/55 transition hover:text-white sm:hidden"
              >
                Visit The Brand Revivalist
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.7} />
              </a>
            </div>
          </section>

          {/* Right: black glass login panel */}
          <section
            className="relative overflow-hidden rounded-[28px] border border-white/[0.16] bg-[#090A0D]/[0.64] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.56)] backdrop-blur-2xl sm:p-8 lg:p-9"
            style={{
              boxShadow:
                '0 30px 100px rgba(0,0,0,.56), inset 0 1px 0 rgba(255,255,255,.11), inset 0 -1px 0 rgba(255,255,255,.025)',
            }}
          >
            {/* Subtle internal glass reflection */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,.085)_0%,rgba(255,255,255,.018)_48%,transparent_100%)]"
            />

            {/* Warm glow behind the form—subtle, not flat orange */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#C33C1B]/15 blur-3xl"
            />

            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D8754A]/30 bg-[#D8754A]/10 text-[#E7A06B]">
                  <LockKeyhole className="h-4 w-4" strokeWidth={1.8} />
                </span>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D5A06A]">
                    Member access
                  </p>
                  <h2 className="mt-1 font-heading text-3xl leading-none text-[#F7F3ED]">
                    Welcome back.
                  </h2>
                </div>
              </div>

              <p className="mt-6 text-sm leading-6 text-[#D7D0C8]/75">
                Sign in to access your Freedom Foundry workspace, resources,
                and brand-building tools.
              </p>

              <form className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-[#D7D0C8]/65">
                    Email address
                  </span>

                  <span className="relative block">
                    <Mail
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
                      strokeWidth={1.8}
                    />

                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="h-13 w-full rounded-xl border border-white/[0.15] bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/25 focus:border-[#D8754A]/75 focus:bg-black/40 focus:ring-4 focus:ring-[#D8754A]/10"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-[#D7D0C8]/65">
                    Password
                  </span>

                  <span className="relative block">
                    <LockKeyhole
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
                      strokeWidth={1.8}
                    />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="h-13 w-full rounded-xl border border-white/[0.15] bg-black/30 py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/25 focus:border-[#D8754A]/75 focus:bg-black/40 focus:ring-4 focus:ring-[#D8754A]/10"
                    />

                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" strokeWidth={1.8} />
                      ) : (
                        <Eye className="h-4 w-4" strokeWidth={1.8} />
                      )}
                    </button>
                  </span>
                </label>

                <div className="flex items-center justify-between gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-white/55">
                    <input
                      type="checkbox"
                      name="remember"
                      className="h-3.5 w-3.5 rounded border-white/30 bg-black/30 accent-[#D8754A]"
                    />
                    Remember me
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#E9B27C] transition hover:text-white"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="group relative flex h-13 w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-[linear-gradient(105deg,#9F1824_0%,#D55835_47%,#E29A61_100%)] px-5 text-xs font-bold uppercase tracking-[0.15em] text-[#160B09] shadow-[0_12px_30px_rgba(184,52,32,0.28)] transition duration-300 hover:brightness-110 hover:shadow-[0_16px_36px_rgba(217,117,74,0.38)] focus:outline-none focus:ring-4 focus:ring-[#D8754A]/25"
                >
                  <span className="absolute inset-x-0 top-0 h-px bg-white/45" />
                  Log in to Freedom Foundry
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
                </button>
              </form>

              <div className="mt-7 border-t border-white/[0.12] pt-6 text-center">
                <p className="text-sm text-white/55">
                  New to Freedom Foundry?{' '}
                  <Link
                    to="/sign-up"
                    className="font-semibold text-[#EDB985] transition hover:text-white"
                  >
                    Create your free account.
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="absolute inset-x-0 bottom-0 z-20 hidden lg:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-12 pb-6 text-[10px] uppercase tracking-[0.12em] text-white/35">
          <span>© {new Date().getFullYear()} The Brand Revivalist®</span>

          <div className="flex items-center gap-5">
            <Link to="/privacy" className="transition hover:text-white/75">
              Privacy
            </Link>
            <Link to="/terms" className="transition hover:text-white/75">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}