import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Vault', path: '/vault' },
  { label: 'Brand Portal', path: '/brand-portal' },
  { label: 'Resources', path: '/services' },
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
      <div className="flex items-center justify-between gap-1 px-2 py-2 w-full overflow-hidden">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex-1 min-w-0 text-center"
              style={{ maxWidth: '25%' }}
            >
              <span
                className="block uppercase whitespace-nowrap overflow-hidden text-ellipsis rounded-[7px]"
                style={{
                  padding: '6px 4px',
                  fontSize: '9px',
                  letterSpacing: '0.02em',
                  border: 0px solid transparent',
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
