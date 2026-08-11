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
      className="fixed bottom-0 left-0 right-0 z-50 bg-black"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-center justify-between gap-1.5 px-3 py-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} className="flex-1 min-w-0 text-center">
              <span
                className="block px-2 py-1.5 uppercase text-[10px] tracking-wide whitespace-nowrap rounded-[7px]"
                style={{
                  border: '1px solid transparent',
                  borderRadius: '7px',
                  backgroundImage:
                    'linear-gradient(#000, #000), linear-gradient(135deg, #d16298, #f7f2ea)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  color: active ? '#f7f2ea' : '#94a3b8',
                  fontWeight: active ? 700 : 400,
                }}
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
