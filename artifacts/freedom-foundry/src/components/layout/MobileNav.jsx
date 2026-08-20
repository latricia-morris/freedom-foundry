import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home', path: '/dashboard' },
  { label: 'Vault', path: '/vault' },
  { label: 'Brand Portal', path: '/brand-portal' },
  { label: 'Services', path: '/services' },
];

export default function MobileNav() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#f0d9b5]/15 bg-[#100d0b]/95 px-2 py-2 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-4xl items-stretch justify-between gap-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? 'page' : undefined}
                className={`flex min-w-0 flex-1 items-center justify-center rounded-lg px-1 py-2 text-center text-[10px] font-medium leading-tight tracking-normal transition-colors sm:px-2 sm:text-[11px] ${
                active
                   ? 'text-[#f7f5f5]'
                   : 'text-[#8d8b89] hover:text-[#b7b3b0]'
              }`}
            >
              <span className="max-w-full whitespace-normal">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}