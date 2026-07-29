import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, BookOpen, FolderOpen, Users, User as UserIcon } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/', icon: HomeIcon },
  { label: 'Workbooks', path: '/workbooks', icon: BookOpen },
  { label: 'Resources', path: '/resources', icon: FolderOpen },
  { label: 'Community', path: '/community', icon: Users },
  { label: 'Profile', path: '/settings', icon: UserIcon },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-sidebar-border">
      <div className="flex items-center justify-around py-2 pb-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-[9px] uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}