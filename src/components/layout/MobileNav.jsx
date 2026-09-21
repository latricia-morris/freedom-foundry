import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const brandNav = [
  { label: 'Home', path: '/dashboard' },
  { label: 'Vault', path: '/vault' },
  { label: 'Brand Portal', path: '/brand-portal' },
  { label: 'Services', path: '/services' },
];

const agencyNav = [
  { label: 'Operations', path: '/admin/agency' },
  { label: 'Projects', path: '/admin/agency/projects' },
  { label: 'Clients', path: '/admin/agency/clients' },
  { label: 'Team', path: '/admin/users' },
  { label: 'Sales', path: '/admin/agency/proposals' },
];

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const items = isAdmin && view === 'agency' ? agencyNav : brandNav;

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 px-3 py-2.5 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-2">
        {isAdmin && (
          <div
            role="group"
            aria-label="View switcher"
            className="mx-auto flex items-center gap-1 rounded-md border border-border bg-card/60 p-1"
          >
            <button
              type="button"
              onClick={() => switchView('brand')}
              className={`rounded-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                view === 'brand' ? 'btn-forge' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Brand View
            </button>
            <button
              type="button"
              onClick={() => switchView('agency')}
              className={`rounded-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                view === 'agency' ? 'btn-forge' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Agency View
            </button>
          </div>
        )}
        <div className="flex items-stretch justify-between gap-3">
          {items.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className={`flex shrink-0 items-center justify-center rounded-lg px-1.5 py-2 text-center text-xs font-medium leading-tight tracking-normal transition-colors sm:px-2 sm:text-[13px] ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="whitespace-nowrap font-medium text-xs uppercase tracking-[0.08em] sm:text-[13px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}