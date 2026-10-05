import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from 'lucide-react';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

const videoUrl =
  'https://media.base44.com/videos/public/6a6982f0647238bf2b5d67bf/8d01159f7_rising-golden-embers-on-black-background-2025-12-17-19-25-08-utc.mp4';

export default function FreedomFoundryLoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#050506] text-[#F3F4F6]">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="fixed inset-0 -z-20 h-[100dvh] w-full object-cover"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(180deg,rgba(4,4,5,0.85)_0%,rgba(4,4,5,0.78)_42%,rgba(4,4,5,0.90)_100%)] lg:bg-[linear-gradient(90deg,rgba(4,4,5,0.94)_0%,rgba(4,4,5,0.84)_39%,rgba(4,4,5,0.58)_63%,rgba(4,4,5,0.80)_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_14%_70%,rgba(87,4,10,0.34),transparent_36%),radial-gradient(circle_at_86%_14%,rgba(225,115,60,0.10),transparent_25%)]"
      />

      <header className="relative z-20">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-6 lg:px-12 lg:py-7">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src={`${basePath}/forge-logo.png`}
              alt="Freedom Foundry"
              className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_0_18px_rgba(226,110,60,0.22)] sm:h-12 sm:w-12"
            />

            <div className="min-w-0 leading-tight">
              <p className="truncate font-heading text-[15px] tracking-[0.055em] text-[#F3F4F6] sm:text-lg">
                FREEDOM FOUNDRY
              </p>

              <p className="mt-1 truncate text-[8px] uppercase tracking-[0.16em] text-[#D7D0C8]/75 sm:text-[10px] sm:tracking-[0.19em]">
                A Brand Revivalist Experience
              </p>
            </div>
          </Link>

          <a
            href="https://thebrandrevivalist.com"
            className="hidden shrink-0 items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-white/60 transition hover:text-white sm:inline-flex"
          >
            The Brand Revivalist
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1440px] px-5 pb-10 pt-6 sm:px-8 sm:pb-12 sm:pt-10 lg:flex lg:min-h-[calc(100dvh-104px)] lg:items-center lg:px-12 lg:py-12">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(410px,480px)] lg:items-center lg:gap-16 xl:gap-24">
          <section className="min-w-0 max-w-[620px]">
            <p className="text-[9px] font-medium uppercase tracking-[0.20em] text-[#D5A06A] sm:text-xs sm:tracking-[0.22em]">
              Insider access by The Brand Revivalist
            </p>

            <div className="mt-6 sm:mt-8">
              <p className="font-sans text-[1.15rem] font-medium leading-[1.15] tracking-[-0.02em] sm:text-3xl">
                <span className="bg-[linear-gradient(100deg,#E9BE83_0%,#D66A3B_48%,#B71929_100%)] bg-clip-text text-transparent">
                  Don&apos;t just build a business.
                </span>
              </p>

              <h1 className="mt-3 max-w-[600px] font-heading text-[clamp(2.75rem,7vw,5.15rem)] font-normal leading-[0.92] tracking-[-0.03em] text-[#F3F4F6] sm:mt-4">
                <span className="block">Forge your freedom</span>
                <span className="block">and your legacy.</span>
              </h1>
            </div>

            <p className="mt-6 max-w-[590px] text-[15px] leading-7 text-[#E5DFD7]/80 sm:mt-8 sm:text-base sm:leading-8">
              Freedom Foundry is your access point to brand-building tools,
              strategic resources, and the thinking behind The Brand Revivalist.
              Create a free account to step inside or sign in to access your
              dedicated brand portal.
            </p>

            <div className="mt-7 sm:mt-8">
              <Link
                to="/sign-up"
                className="group relative inline-flex max-w-full items-center gap-2.5 overflow-hidden rounded-[7px] bg-[linear-gradient(105deg,#9F1824_0%,#D55835_47%,#E29A61_100%)] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.09em] text-white shadow-[0_8px_22px_rgba(184,52,32,0.22)] transition duration-300 hover:brightness-110 hover:shadow-[0_12px_28px_rgba(217,117,74,0.30)] focus:outline-none focus:ring-4 focus:ring-[#D8754A]/25 sm:text-[11px] sm:tracking-[0.11em]"
              >
                <span className="absolute inset-x-0 top-0 h-px bg-white/40" />
                <span className="relative">Create a free account</span>
                <ArrowRight
                  className="relative h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={1.7}
                />
              </Link>
            </div>
          </section>

          <section
            className="relative w-full min-w-0 max-w-[480px] justify-self-stretch overflow-hidden rounded-[7px] border border-white/[0.16] bg-[#090A0D]/[0.64] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.56)] backdrop-blur-2xl sm:justify-self-end sm:p-7 lg:p-9"
            style={{
              boxShadow:
                '0 30px 100px rgba(0,0,0,.56), inset 0 1px 0 rgba(255,255,255,.11), inset 0 -1px 0 rgba(255,255,255,.025)',
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,.085)_0%,rgba(255,255,255,.018)_48%,transparent_100%)] sm:h-40"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#C33C1B]/15 blur-3xl"
            />

            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D8754A]/30 bg-[#D8754A]/10 text-[#E7A06B] sm:h-10 sm:w-10">
                  <LockKeyhole className="h-4 w-4" strokeWidth={1.8} />
                </span>

                <div className="min-w-0">
                  <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-[#D5A06A] sm:text-[10px] sm:tracking-[0.16em]">
                    Member access
                  </p>

                  <h2 className="mt-1 font-heading text-[1.7rem] leading-none text-[#F3F4F6] sm:text-3xl">
                    Welcome back.
                  </h2>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-[#D7D0C8]/75 sm:mt-6">
                Sign in to access your Freedom Foundry workspace, resources,
                and brand-building tools.
              </p>

              <form className="mt-7 space-y-4 sm:mt-8 sm:space-y-5">
                <label className="block">
                  <span className="mb-2 block text-[9px] font-medium uppercase tracking-[0.13em] text-[#D7D0C8]/65 sm:text-[10px]">
                    Email address
                  </span>

                  <span className="relative block">
                    <Mail
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
                      strokeWidth={1.7}
                    />

                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="h-11 w-full min-w-0 rounded-[7px] border border-white/[0.15] bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/25 focus:border-[#D8754A]/75 focus:bg-black/40 focus:ring-4 focus:ring-[#D8754A]/10 sm:h-12"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[9px] font-medium uppercase tracking-[0.13em] text-[#D7D0C8]/65 sm:text-[10px]">
                    Password
                  </span>

                  <span className="relative block">
                    <LockKeyhole
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
                      strokeWidth={1.7}
                    />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="h-11 w-full min-w-0 rounded-[7px] border border-white/[0.15] bg-black/30 py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/25 focus:border-[#D8754A]/75 focus:bg-black/40 focus:ring-4 focus:ring-[#D8754A]/10 sm:h-12"
                    />

                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[7px] text-white/45 transition hover:bg-white/10 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" strokeWidth={1.7} />
                      ) : (
                        <Eye className="h-4 w-4" strokeWidth={1.7} />
                      )}
                    </button>
                  </span>
                </label>

                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-white/55">
                    <input
                      type="checkbox"
                      name="remember"
                      className="h-3.5 w-3.5 rounded-[3px] border-white/30 bg-black/30 accent-[#D8754A]"
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
                  className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-[7px] bg-[linear-gradient(105deg,#9F1824_0%,#D55835_47%,#E29A61_100%)] px-4 py-3 text-[10px] font-medium uppercase tracking-[0.08em] text-white shadow-[0_8px_22px_rgba(184,52,32,0.22)] transition duration-300 hover:brightness-110 hover:shadow-[0_12px_28px_rgba(217,117,74,0.30)] focus:outline-none focus:ring-4 focus:ring-[#D8754A]/25 sm:px-5 sm:text-[11px] sm:tracking-[0.11em]"
                >
                  <span className="absolute inset-x-0 top-0 h-px bg-white/40" />
                  <span className="relative">Log in to Freedom Foundry</span>
                  <ArrowRight
                    className="relative h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={1.7}
                  />
                </button>
              </form>

              <div className="mt-6 border-t border-white/[0.12] pt-5 text-center sm:mt-7 sm:pt-6">
                <p className="text-sm leading-6 text-white/55">
                  New to Freedom Foundry?{' '}
                  <Link
                    to="/sign-up"
                    className="font-medium text-[#EDB985] transition hover:text-white"
                  >
                    Create your free account.
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="relative z-20 border-t border-white/[0.06] lg:absolute lg:inset-x-0 lg:bottom-0 lg:border-t-0">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-6 text-[9px] uppercase tracking-[0.11em] text-white/35 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12 lg:py-0 lg:pb-6 lg:text-[10px] lg:tracking-[0.12em]">
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