import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Settings as SettingsIcon, CreditCard, LogOut, Mail, ShieldCheck, Bug } from 'lucide-react';
import apiClient from '@/api/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
      <DropdownMenuContent align="end" className="w-60 rounded-xl border border-[#f0d9b5]/15 bg-[#1a130f] p-1.5 text-[#f7f2ea] shadow-2xl">
        <DropdownMenuLabel className="px-3 py-2 font-normal">
          <p className="truncate text-sm text-[#fff5e8]">{user?.email || 'Your account'}</p>
          <p className="mt-0.5 text-xs text-[#d9c9a3]">Account &amp; support</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#f0d9b5]/10" />
        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer text-[#f7f2ea] focus:bg-[#f0d9b5]/10 focus:text-[#fff5e8]">
          <SettingsIcon className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/billing')} className="cursor-pointer text-[#f7f2ea] focus:bg-[#f0d9b5]/10 focus:text-[#fff5e8]">
          <CreditCard className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>Billing &amp; Subscriptions</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/contact')} className="cursor-pointer text-[#f7f2ea] focus:bg-[#f0d9b5]/10 focus:text-[#fff5e8]">
          <Mail className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>Contact</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings#quickbooks-support')} className="cursor-pointer text-[#f7f2ea] focus:bg-[#f0d9b5]/10 focus:text-[#fff5e8]">
          <Bug className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>Report QuickBooks Issue</span>
        </DropdownMenuItem>
        {user?.role === 'admin' && (
          <>
            <DropdownMenuSeparator className="bg-[#f0d9b5]/10" />
            <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer text-[#f0d9b5] focus:bg-[#f0d9b5]/10 focus:text-[#fff5e8]">
              <ShieldCheck className="mr-2 h-4 w-4" strokeWidth={1.5} />
              <span>Admin Dashboard</span>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator className="bg-[#f0d9b5]/10" />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-[#f7f2ea] focus:bg-[#f0d9b5]/10 focus:text-[#fff5e8]">
          <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
