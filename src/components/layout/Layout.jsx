import React from 'react';
import { Outlet } from 'react-router-dom';
import { Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import UserAvatar from './UserAvatar';

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-4 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3">
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-full forged-border flex items-center justify-center bg-card">
                <span className="font-heading text-xs font-medium molten-text">TBR</span>
              </div>
            </div>
            <h2 className="font-heading text-lg lg:text-xl text-foreground hidden sm:block">
              Welcome back, <span className="italic molten-text">Revivalist</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <UserAvatar />
          </div>
        </header>

        <main className="px-4 lg:px-8 py-6 pb-24 lg:pb-12">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}