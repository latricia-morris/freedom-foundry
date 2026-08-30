import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Palette } from 'lucide-react';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-[#14110f] text-[#f7f5f5]">
      <header className="border-b border-[#f0d9b5]/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src={`${basePath}/forge-logo.png`} alt="Freedom Foundry" className="h-10 w-10 rounded-xl object-cover shadow-[0_0_14px_rgba(217,98,44,0.4)]" />
            <div className="leading-tight">
              <p className="font-heading text-lg tracking-[0.04em]">FREEDOM FOUNDRY</p>
              <p className="text-[9px] uppercase tracking-[0.25em] text-[#d9c9a3]">By The Brand Revivalist</p>
            </div>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/sign-in" className="text-[#8d8b89] transition-colors hover:text-[#f7f5f5]">Sign in</Link>
            <Link to="/sign-up" className="rounded-lg border border-[#f0d9b5]/25 px-4 py-2 text-[#f7f5f5] transition-colors hover:border-[#f0d9b5]/60">Create account</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-[#7a1f1f]/20 blur-[120px]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-32">
            <div>
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.28em] text-[#d9622c]">Your brand, forged with intention</p>
              <h1 className="max-w-3xl font-heading text-5xl font-light leading-[1.04] sm:text-6xl lg:text-7xl">Build a brand that <span className="molten-text italic">moves</span> with you.</h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-[#b7b3b0]">Freedom Foundry is your private home for brand clarity, creative resources, and the next right moves—organized in one place.</p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link to="/sign-up" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#b3232c] via-[#d9622c] to-[#f0d9b5] px-5 py-3 text-sm font-medium text-[#24140e] shadow-[0_8px_30px_rgba(179,35,44,0.2)]">Enter Freedom Foundry <ArrowRight className="h-4 w-4" /></Link>
                <Link to="/sign-in" className="text-sm text-[#b7b3b0] transition-colors hover:text-[#f7f5f5]">Already a member? Sign in</Link>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#b3232c]/25 via-[#d9622c]/10 to-transparent blur-2xl" />
              <div className="relative rounded-[1.5rem] border border-[#f0d9b5]/15 bg-[#1a1512]/90 p-6 shadow-2xl">
                <div className="mb-6 flex items-center justify-between"><span className="text-[10px] uppercase tracking-[0.24em] text-[#8d8b89]">Your brand portal</span><span className="h-2 w-2 rounded-full bg-[#d9622c] shadow-[0_0_10px_#d9622c]" /></div>
                <div className="rounded-xl border border-[#f0d9b5]/10 bg-[#100e0c] p-5"><p className="text-xs uppercase tracking-widest text-[#8d8b89]">The big picture</p><p className="mt-3 font-heading text-2xl text-[#f7f5f5]">Clarity creates momentum.</p><p className="mt-3 text-sm leading-6 text-[#8d8b89]">Your brand foundation, resources, and next steps—ready when you are.</p></div>
                <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl border border-[#f0d9b5]/10 bg-[#100e0c] p-4"><Palette className="h-4 w-4 text-[#d9622c]" /><p className="mt-3 text-xs text-[#b7b3b0]">Brand portal</p></div><div className="rounded-xl border border-[#f0d9b5]/10 bg-[#100e0c] p-4"><BookOpen className="h-4 w-4 text-[#d9622c]" /><p className="mt-3 text-xs text-[#b7b3b0]">The Vault</p></div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#f0d9b5]/10 bg-[#100e0c]/60">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:grid-cols-3 lg:px-8">
            {[
              ['Your foundation', 'Shape your personal and corporate brand profile with guidance that stays yours.'],
              ['Your resources', 'Keep your brand kit, workbooks, and creative references easy to find.'],
              ['Your next moves', 'Turn clarity into momentum with practical prompts and focused action.'],
            ].map(([title, description]) => <div key={title}><h2 className="font-heading text-xl text-[#f7f5f5]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#8d8b89]">{description}</p></div>)}
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-5 py-8 text-xs text-[#8d8b89] lg:px-8">
        <span>© {new Date().getFullYear()} The Brand Revivalist</span>
        <div className="flex gap-4"><Link to="/privacy" className="hover:text-[#f7f5f5]">Privacy</Link><Link to="/terms" className="hover:text-[#f7f5f5]">Terms</Link></div>
      </footer>
    </div>
  );
}