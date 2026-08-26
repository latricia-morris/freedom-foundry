import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Vault as VaultIcon, Palette, Target, ClipboardList, Mic } from 'lucide-react';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'The Vault', path: '/vault', icon: VaultIcon },
  { label: 'Brand Portal', path: '/brand-portal', icon: Palette },
  { label: 'Big Picture', path: '/brand-portal/big-picture', icon: Target },
  { label: 'Collaborations', path: '/services', icon: ClipboardList },
  { label: 'Podcast', path: '/podcast', icon: Mic },
];

export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col bg-sidebar border-r border-sidebar-border z-40">
      <Link to="/" className="block p-6 border-b border-sidebar-border hover:bg-sidebar-accent/30 transition-colors">
        <div className="flex items-center gap-3">
          <img
            src={`${basePath}/forge-logo.png`}
            alt="Freedom Foundry"
            className="h-9 w-9 rounded-xl object-cover shadow-[0_0_14px_rgba(217,98,44,0.28)]"
          />
          <div>
            <p className="font-heading text-sm tracking-wider text-foreground">FREEDOM FOUNDRY</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">By The Brand Revivalist</p>
          </div>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
                className={`relative flex items-center gap-3 px-6 py-3 text-sm transition-colors duration-200 ${
                 isActive ? 'font-medium text-[#f7f5f5]' : 'text-[#b7bfbd] hover:text-[#e0e4e3] hover:bg-white/[0.035]'
              }`}
               aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              <span className="tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}