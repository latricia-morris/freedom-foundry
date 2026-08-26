import React from 'react';
import { Outlet } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import MobileNav from './MobileNav';
import UserAvatar from './UserAvatar';
import WarmGradientDefs from '@/components/shared/WarmGradientDefs';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#14110f]">
      <WarmGradientDefs />
      <header className="sticky top-0 z-30 border-b border-[#f0d9b5]/10 bg-[#14110f]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-5 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <img
            src={`${basePath}/forge-logo.png`}
            alt="Freedom Foundry"
            className="h-9 w-9 rounded-xl object-cover shadow-[0_0_14px_rgba(217,98,44,0.28)] transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-xl lg:text-2xl font-medium text-[#f7f2ea] tracking-[0.04em]">FREEDOM FOUNDRY

            </span>
            <span className="uppercase tracking-[0.25em] text-[#d9c9a3] text-[11px]">BY THE BRAND REVIVALIST</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-[#f7f2ea]/70 hover:text-[#f7f2ea] transition-colors">
            <Bell className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <UserAvatar />
        </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 pb-28 lg:px-8 lg:py-10 lg:pb-28">
        <Outlet />
      </main>

      <MobileNav />
    </div>);

}