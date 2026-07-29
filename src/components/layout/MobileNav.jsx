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
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-md border-t border-[#f7f2ea]/10"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-center justify-around py-4 lg:py-4 max-w-3xl mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className="px-3"
            >
              <span
                className="text-[11px] lg:text-xs uppercase tracking-[0.15em] font-medium transition-opacity duration-200"
                style={
                  active
                    ? {
                        background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        color: 'transparent',
                        fontWeight: 600,
                      }
                    : { color: '#f7f2ea' }
                }
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
