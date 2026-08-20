import React from 'react';
import { Outlet } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import MobileNav from './MobileNav';
import Sidebar from './Sidebar';
import UserAvatar from './UserAvatar';
import WarmGradientDefs from '@/components/shared/WarmGradientDefs';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <WarmGradientDefs />
      <Sidebar />
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-5 lg:ml-64 lg:px-8 border-b border-white/5 bg-[#0f0f1a]/95 backdrop-blur">
        <Link to="/" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
            style={{
              background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)',
              boxShadow: '0 0 7px rgba(217, 98, 44, 0.45), 0 0 3px rgba(179, 35, 44, 0.7)'
            }}
          >
            <div className="w-[30px] h-[30px] rounded-full bg-[#0f0f1a] flex items-center justify-center">
              <span className="font-heading text-sm font-medium molten-text">TBR</span>
            </div>
          </div>
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
      </header>

      <main className="px-4 py-6 pb-28 lg:ml-64 lg:px-8 lg:py-10 lg:pb-24">
        <Outlet />
      </main>

      <MobileNav />
    </div>);

}