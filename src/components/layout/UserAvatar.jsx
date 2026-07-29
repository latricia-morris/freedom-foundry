import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Settings as SettingsIcon, CreditCard, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function UserAvatar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || (user.full_name?.[0]?.toUpperCase() || 'U')
    : 'U';

  const avatarUrl = user?.headshot_image_url;

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 outline-none cursor-pointer group">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-9 h-9 rounded-full object-cover"
              style={{ filter: 'grayscale(100%) contrast(1.1)' }}
            />
          ) : (
            <div className="w-9 h-9 rounded-full forged-border flex items-center justify-center bg-card">
              <span className="font-heading text-sm text-foreground">{initials}</span>
            </div>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
          <SettingsIcon className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/billing')} className="cursor-pointer">
          <CreditCard className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>Billing & Subscriptions</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
          <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}