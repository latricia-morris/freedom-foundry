import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Vault as VaultIcon, Flame, BookOpen, FolderOpen, ClipboardList, Users, Settings as SettingsIcon, Anvil } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'The Vault', path: '/vault', icon: VaultIcon },
  { label: 'Brand Power', path: '/brand-power', icon: Flame },
  { label: 'Workbooks', path: '/workbooks', icon: BookOpen },
  { label: 'Resource Library', path: '/resources', icon: FolderOpen },
  { label: 'Service Requests', path: '/services', icon: ClipboardList },
  { label: 'Community', path: '/community', icon: Users },
  { label: 'Settings', path: '/settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col bg-sidebar border-r border-sidebar-border z-40">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full forged-border flex items-center justify-center bg-card">
            <span className="font-heading text-base font-medium molten-text">TBR</span>
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
                isActive ? 'text-primary bg-sidebar-accent' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              {isActive && <span className="absolute left-0 top-0 h-full w-0.5 forged-gradient" />}
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              <span className="tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="forged-border rounded-lg p-4 bg-card/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full forged-border flex items-center justify-center">
              <Anvil className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Forging</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">You're building momentum. Keep going.</p>
        </div>
      </div>
    </aside>
  );
}