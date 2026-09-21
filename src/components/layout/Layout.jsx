import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Briefcase, Palette } from 'lucide-react';
import MobileNav from './MobileNav';
import UserAvatar from './UserAvatar';
import WarmGradientDefs from '@/components/shared/WarmGradientDefs';
import { useAuth } from '@/lib/AuthContext';
import { AdminViewProvider } from '@/components/layout/AdminViewContext';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const onAdmin = location.pathname.startsWith('/admin');
  const [view, setView] = useState('brand');

  useEffect(() => {
    setView(onAdmin ? 'agency' : 'brand');
  }, [onAdmin, isAdmin]);

  const switchView = (next) => {
    setView(next);
    if (next === 'agency') {
      navigate('/admin/agency');
    } else if (onAdmin) {
      navigate('/dashboard');
    }
  };

  return (
    <AdminViewProvider value={{ isAdmin, view, switchView }}>
    <div className="min-h-screen bg-background text-foreground">
      <WarmGradientDefs />
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-5 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <img
            src={`${basePath}/forge-logo.png`}
            alt="Freedom Foundry"
            className="h-9 w-9 rounded-xl object-cover shadow-[0_0_14px_rgba(217,98,44,0.28)] transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-xl lg:text-2xl font-medium text-foreground tracking-[0.04em]">FREEDOM FOUNDRY

            </span>
            <span className="uppercase tracking-[0.25em] text-muted-foreground text-[11px]">BY THE BRAND REVIVALIST®</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div role="group" aria-label="Workspace view" className="flex items-center gap-1 rounded-full border border-border bg-card/70 p-1">
              <button
                type="button"
                aria-label="Brand View"
                title="Brand View"
                onClick={() => switchView('brand')}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  view === 'brand' ? 'btn-forge' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Palette className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span className="hidden sm:inline">Brand</span>
              </button>
              <button
                type="button"
                aria-label="Agency View"
                title="Agency View"
                onClick={() => switchView('agency')}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  view === 'agency' ? 'btn-forge' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span className="hidden sm:inline">Agency</span>
              </button>
            </div>
          )}
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
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
    </div>
    </AdminViewProvider>
  );

}