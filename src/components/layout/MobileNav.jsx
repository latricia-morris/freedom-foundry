import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Vault', path: '/vault' },
  { label: 'Workbooks', path: '/workbooks' },
  { label: 'Brand Portal', path: '/brand-portal' },
  { label: 'Collaborations', path: '/services' },
];

export default function MobileNav() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-center justify-around py-3 pb-4">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className="text-[10px] uppercase tracking-wider transition-opacity"
              style={
                active
                  ? {
                      background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      color: 'transparent',
                    }
                  : { color: '#f7f2ea' }
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}