import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Vault', path: '/vault' },
  { label: 'Brand Portal', path: '/brand-portal' },
  { label: 'Collaborations', path: '/services' },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-sidebar-border">
      <div className="flex items-center justify-around py-3 pb-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`text-[10px] uppercase tracking-wider transition-opacity ${isActive ? 'text-warm' : 'text-[#f7f2ea]/50'}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}