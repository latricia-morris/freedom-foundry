import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Vault as VaultIcon, BookOpen, Palette, ClipboardList } from 'lucide-react';

const navItems = [
  { label: 'Home', path: '/', icon: LayoutDashboard },
  { label: 'Vault', path: '/vault', icon: VaultIcon },
  { label: 'Workbooks', path: '/workbooks', icon: BookOpen },
  { label: 'Brand Portal', path: '/brand-portal', icon: Palette },
  { label: 'Collaborations', path: '/services', icon: ClipboardList },
];

export default function MobileNav() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f1a]/98 backdrop-blur border-t border-white/5"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-center justify-around py-3 lg:py-4 max-w-5xl mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col lg:flex-row items-center gap-1 lg:gap-2 px-2 lg:px-4 transition-colors duration-200"
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={1.5}
                style={{ color: active ? '#d9622c' : '#f7f2ea' }}
              />
              <span
                className="text-[10px] lg:text-xs uppercase tracking-wider transition-colors duration-200"
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
