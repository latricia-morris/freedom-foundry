import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { ChevronDown, Flame, Send, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PortalContentSection from '@/components/portal/PortalContentSection';
import { pageKeyFromPath } from '@/lib/portalPages';

const strategyNav = [
  { name: 'Overview', path: '/brand-portal', end: true },
  { name: 'Brand Up', path: '/brand-portal/brand-up' },
  { name: 'Big Picture', path: '/brand-portal/big-picture' },
  { name: 'Corporate Brand', path: '/brand-portal/corporate' },
  { name: 'Personal Brand', path: '/brand-portal/personal' },
  { name: 'Media Kit', path: '/brand-portal/media-kit' },
  { name: 'Visibility & Credibility', path: '/brand-portal/visibility' },
  { name: 'Checklist', path: '/brand-portal/checklist' },
];

const buildNav = [
  { name: 'Ignite OS', path: '/brand-portal/ignite', icon: 'flame' },
  { name: 'Brand Guidelines', path: '/brand-portal/guidelines' },
  { name: 'Brand Assets', path: '/brand-portal/assets' },
];

const supportNav = [
  { name: 'Request Brand Services', path: '/brand-portal/request-services', icon: 'send' },
];


function NavItem({ item }) {
  return (
    <NavLink
      to={item.path}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center justify-between border-l-2 px-3 py-2.5 text-sm transition-colors duration-200 ${
          isActive
             ? 'border-primary font-medium text-foreground bg-primary/5'
             : 'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
        }`
      }
    >
      {({ isActive }) =>
        <>
          <span
            className="mr-3">
            {item.name}
          </span>
          {item.icon === 'flame' &&
        <Flame
          className="w-4 h-4 flex-shrink-0"
          strokeWidth={1.5}
          style={{ stroke: 'url(#bp-nav-warm-gradient)' }}
          />

        }
          {item.icon === 'send' &&
        <Send
          className="w-3.5 h-3.5 flex-shrink-0 ml-2"
          strokeWidth={1.5}
          />

        }
          {item.icon === 'folder' &&
        <FolderOpen
          className="w-4 h-4 flex-shrink-0"
          strokeWidth={1.5}
          />
        }
        </>
      }
    </NavLink>);

}

export default function BrandPortalLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentItem = [...strategyNav, ...buildNav, ...supportNav]
    .find((item) => location.pathname === item.path) || strategyNav[0];
  const pageKey = pageKeyFromPath(location.pathname);

  const renderItems = (items) => items.map((item) => <NavItem key={item.path} item={item} />);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col gap-6 lg:flex-row lg:gap-10">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="bp-nav-warm-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b3232c" />
            <stop offset="55%" stopColor="#d9622c" />
            <stop offset="100%" stopColor="#f0d9b5" />
          </linearGradient>
        </defs>
      </svg>
      <aside className="hidden flex-shrink-0 flex-col border border-border bg-card/75 p-4 lg:sticky lg:top-28 lg:flex lg:h-fit lg:w-60">
        <p className="mb-3 px-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          Brand Portal
        </p>
        <nav aria-label="Brand Portal pages" className="flex flex-col gap-1">
          {renderItems(strategyNav)}
          <div className="mx-3 my-2 border-t border-border" />
          {renderItems(buildNav)}
          <div className="mt-3 border-t border-border pt-3">
            {renderItems(supportNav)}
          </div>
        </nav>
      </aside>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          className="flex min-h-14 w-full items-center justify-between rounded-xl border border-border bg-card px-4 text-left"
        >
          <span>
            <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Brand Portal</span>
            <span className="mt-1 block text-base font-medium text-foreground">{currentItem.name}</span>
          </span>
          <ChevronDown className={`h-5 w-5 text-primary transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
        </button>
        {mobileOpen && (
          <nav onClickCapture={() => setMobileOpen(false)} aria-label="Mobile Brand Portal pages" className="mt-2 grid grid-cols-1 gap-1 rounded-xl border border-border bg-card p-2">
            {renderItems(strategyNav)}
            <div className="my-1 border-t border-border" />
            {renderItems(buildNav)}
            <div className="my-1 border-t border-border" />
            {renderItems(supportNav)}
          </nav>
        )}
      </div>

      <main className="min-w-0 flex-1 lg:py-2">
        <Outlet />
        {pageKey && <PortalContentSection key={pageKey} pageKey={pageKey} />}
      </main>
    </div>
  );
}