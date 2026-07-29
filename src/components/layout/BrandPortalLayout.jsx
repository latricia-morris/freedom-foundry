import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Overview', path: '/brand-portal' },
  { label: 'Personal Brand', path: '/brand-portal/personal' },
  { label: 'Corporate Brand', path: '/brand-portal/corporate' },
  { label: 'Big Picture', path: '/big-picture' },
  { label: 'Media Kit', path: '/media-kit' },
];

export default function BrandPortalLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="hidden lg:block w-52 flex-shrink-0">
        <nav className="sticky top-24">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 pb-3 border-b border-border">Brand Portal</p>
          <div className="space-y-1">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className={`bp-nav-item ${isActive ? 'bp-nav-item--active' : ''}`}>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      <div className="lg:hidden mb-6">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`bp-nav-item whitespace-nowrap ${isActive ? 'bp-nav-item--active' : ''}`}>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}