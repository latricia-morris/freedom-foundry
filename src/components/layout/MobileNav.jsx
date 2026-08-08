import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Vault', path: '/vault' },
  { label: 'Brand Portal', path: '/brand-portal' },
  { label: 'Resources Hub', path: '/services' },
];

export default function MobileNav() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-md border-t border-[#f7f2ea]/10"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-center justify-center gap-2 py-3 max-w-3xl mx-auto px-3">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex-1 text-center"
              style={{ maxWidth: '130px' }}
            >
              <span
                className="block px-3 py-1.5 text-[9px] uppercase tracking-[0.06em] font-medium whitespace-nowrap transition-opacity duration-200"
                style={{
                  border: '1px solid transparent',
                  borderRadius: '7px',
                  backgroundImage: 'linear-gradient(#0f0f1a, #0f0f1a) padding-box, linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5) border-box',
                }}
              >
                <span
                  style={
                    active
                      ? {
                          background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          color: 'transparent',
                          fontWeight: 700,
                        }
                      : { color: '#f7f2ea' }
                  }
                >
                  {item.label}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}