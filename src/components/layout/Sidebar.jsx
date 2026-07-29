import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Vault as VaultIcon, BookOpen, Palette, Target, ClipboardList, Mic, Mail, CreditCard, Settings as SettingsIcon } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'The Vault', path: '/vault', icon: VaultIcon },
  { label: 'Brand Power Moves', path: '/workbooks', icon: BookOpen },
  { label: 'Brand Portal', path: '/brand-portal', icon: Palette },
  { label: 'Big Picture', path: '/big-picture', icon: Target },
  { label: 'Collaborations', path: '/services', icon: ClipboardList },
  { label: 'Billing', path: '/billing', icon: CreditCard },
  { label: 'Podcast', path: '/podcast', icon: Mic },
  { label: 'Contact', path: '/contact', icon: Mail },
  { label: 'Settings', path: '/settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col bg-sidebar border-r border-sidebar-border z-40">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)', boxShadow: '0 0 7px rgba(217, 98, 44, 0.45), 0 0 3px rgba(179, 35, 44, 0.7)' }}>
            <div className="w-[30px] h-[30px] rounded-full bg-sidebar flex items-center justify-center">
  <span className="font-heading text-base font-medium molten-text">TBR</span></div>
          </div>
          <div>
            <p className="font-heading text-sm tracking-wider text-foreground">FREEDOM FOUNDRY</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">By The Brand Revivalist</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-3 px-6 py-3 text-sm transition-all duration-200 ${
                isActive ? 'text-warm bg-sidebar-accent' : 'text-[#f7f2ea]/50 hover:text-[#f7f2ea] hover:bg-sidebar-accent/50'
              }`}
            >
              {isActive && <span className="absolute left-0 top-0 h-full w-0.5" style={{ background: 'linear-gradient(41deg, #4a0404, #7a1f1f, #b3232c, #d9622c, #f0d9b5)' }} />}
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              <span className="tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}