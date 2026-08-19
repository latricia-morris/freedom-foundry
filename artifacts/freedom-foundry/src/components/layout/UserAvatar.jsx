import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Settings as SettingsIcon, CreditCard, LogOut, Mail } from 'lucide-react';
import apiClient from '@/api/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function UserAvatar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    apiClient.auth.me().then(setUser).catch(() => {});
  }, []);

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U'
    : 'U';

  const avatarUrl = user?.headshot_image_url;

  const handleLogout = async () => {
    await apiClient.auth.logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-9 h-9 rounded-full object-cover"
              style={{ filter: 'grayscale(100%) contrast(1.1)' }}
            />
          ) : (
            <div className="w-9 h-9 rounded-full forged-border flex items-center justify-center">
              <span className="font-heading text-sm text-[#f7f2ea]">{initials}</span>
            </div>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-[#f7f2ea]/60 group-hover:text-[#f7f2ea]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-[#15151f] border border-white/10">
        <DropdownMenuItem onClick={() => navigate('/settings')} className="text-[#f7f2ea] focus:text-[#f7f2ea] focus:bg-white/5 cursor-pointer">
          <SettingsIcon className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/billing')} className="text-[#f7f2ea] focus:text-[#f7f2ea] focus:bg-white/5 cursor-pointer">
          <CreditCard className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>Billing &amp; Subscriptions</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/contact')} className="text-[#f7f2ea] focus:text-[#f7f2ea] focus:bg-white/5 cursor-pointer">
          <Mail className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>Contact</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-[#f7f2ea] focus:text-[#f7f2ea] focus:bg-white/5">
          <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
