import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Settings as SettingsIcon, CreditCard, LogOut, Mail, ShieldCheck, Bug, Moon, Sun } from 'lucide-react';
import apiClient from '@/api/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/lib/theme';

export default function UserAvatar() {
  const navigate = useNavigate();
  const { lightMode, toggleTheme } = useTheme();
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
               <span className="font-heading text-sm text-foreground">{initials}</span>
            </div>
          )}
        </div>
         <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
      </DropdownMenuTrigger>
       <DropdownMenuContent align="end" className="w-60 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-2xl">
        <DropdownMenuLabel className="px-3 py-2 font-normal">
           <p className="truncate text-sm text-foreground">{user?.email || 'Your account'}</p>
           <p className="mt-0.5 text-xs text-muted-foreground">Account &amp; support</p>
        </DropdownMenuLabel>
         <DropdownMenuSeparator className="bg-border" />
         <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer text-foreground focus:bg-accent focus:text-foreground">
          <SettingsIcon className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>Settings</span>
        </DropdownMenuItem>
         <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer text-foreground focus:bg-accent focus:text-foreground">
          {lightMode ? <Moon className="mr-2 h-4 w-4" strokeWidth={1.5} /> : <Sun className="mr-2 h-4 w-4" strokeWidth={1.5} />}
          <span>{lightMode ? 'Use dark mode' : 'Use light mode'}</span>
        </DropdownMenuItem>
         <DropdownMenuItem onClick={() => navigate('/billing')} className="cursor-pointer text-foreground focus:bg-accent focus:text-foreground">
          <CreditCard className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>Billing &amp; Subscriptions</span>
        </DropdownMenuItem>
         <DropdownMenuItem onClick={() => navigate('/contact')} className="cursor-pointer text-foreground focus:bg-accent focus:text-foreground">
          <Mail className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>Contact</span>
        </DropdownMenuItem>
         <DropdownMenuItem onClick={() => navigate('/support')} className="cursor-pointer text-foreground focus:bg-accent focus:text-foreground">
          <Bug className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>Report a Bug or Suggest a Feature</span>
         </DropdownMenuItem>
        {(user?.role === 'admin' || user?.role === 'super_admin') && (
          <>
             <DropdownMenuSeparator className="bg-border" />
             <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer text-primary focus:bg-accent focus:text-foreground">
              <ShieldCheck className="mr-2 h-4 w-4" strokeWidth={1.5} />
              <span>Admin Dashboard</span>
            </DropdownMenuItem>
          </>
        )}
         <DropdownMenuSeparator className="bg-border" />
         <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-foreground focus:bg-accent focus:text-foreground">
          <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}