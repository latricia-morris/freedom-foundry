import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Settings2, 
  ArrowRight, 
  Activity, 
  UserPlus,
  Crown,
  ChevronRight
} from 'lucide-react';
import apiClient from '@/api/client';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    apiClient.auth.me()
      .then(u => {
        if (u.role !== 'admin') {
          setDenied(true);
          setLoading(false);
          return;
        }
        return apiClient.entities.User.list();
      })
      .then(userList => {
        if (userList) {
          setUsers(userList);
        }
      })
      .catch(() => {
        setDenied(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (denied) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] animate-fade-in">
        <div className="text-center dashboard-card p-10 max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 molten-bar" />
          <Shield className="w-12 h-12 text-primary mx-auto mb-4 opacity-80" strokeWidth={1} />
          <h1 className="font-heading text-2xl text-foreground mb-2">Command Denied</h1>
          <p className="text-sm text-muted-foreground">
            This sector of the Foundry requires administrator clearance.
          </p>
          <Link to="/dashboard" className="mt-8 inline-flex items-center gap-2 text-sm link-warm">
            Return to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const admins = users.filter(u => u.role === 'admin');
  const regularUsers = users.filter(u => u.role !== 'admin');
  
  // Sort users by created_at descending (assuming ISO strings), fallback to id if no created_at
  const recentUsers = [...users]
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="mb-10 relative">
        <div className="absolute -left-8 -top-8 w-64 h-64 ember-glow-bg z-[-1]" />
        <h1 className="font-heading text-4xl font-light text-foreground mb-3 tracking-wide">
          Foundry <span className="molten-text italic font-medium">Command</span>
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
          Oversee member profiles, guide brand architecture, and monitor activity across the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Navigation Card: Users */}
        <Link 
          to="/admin/users" 
          className="dashboard-card p-6 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 hover:ember-glow-strong"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="icon-tile">
                <Users className="w-6 h-6 text-copper" strokeWidth={1.5} />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all transform group-hover:translate-x-1" strokeWidth={1.5} />
            </div>
            <h2 className="font-heading text-2xl text-foreground mb-2">Member <span className="italic text-muted-foreground">Roster</span></h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Manage all member access, view individual profiles, and update administrative privileges.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-4 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-light text-foreground">{users.length}</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Total</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-xl font-light text-foreground">{admins.length}</span>
              <span className="text-xs uppercase tracking-widest text-primary/70">Admins</span>
            </div>
          </div>
        </Link>

        {/* Navigation Card: Brand Up */}
        <Link 
          to="/admin/brand-up" 
          className="dashboard-card p-6 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 hover:ember-glow-strong relative overflow-hidden"
        >
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="icon-tile">
                <Settings2 className="w-6 h-6 text-copper" strokeWidth={1.5} />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all transform group-hover:translate-x-1" strokeWidth={1.5} />
            </div>
            <h2 className="font-heading text-2xl text-foreground mb-2">Brand Up <span className="italic text-muted-foreground">Engine</span></h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Configure prompts, inspirational notes, and structural guidelines for the Brand Up module.
            </p>
          </div>
          <div className="mt-6 flex items-center border-t border-border pt-4 relative z-10">
            <span className="text-xs uppercase tracking-widest text-primary/80 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Module Configuration
            </span>
          </div>
        </Link>
      </div>

      {/* Recent Members Section */}
      <div className="dashboard-card border border-border/50 overflow-hidden">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-primary opacity-80" strokeWidth={1.5} />
            <h3 className="font-heading text-xl text-foreground">Recent <span className="italic text-muted-foreground">Initiates</span></h3>
          </div>
          <Link to="/admin/users" className="text-xs uppercase tracking-widest link-warm">
            View All
          </Link>
        </div>
        
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No members found in the database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black/20">
                  <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium">Member</th>
                  <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium hidden sm:table-cell">Contact</th>
                  <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium">Clearance</th>
                  <th className="w-12 px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.id} className="border-t border-border/30 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : 'Unknown User'}
                        </span>
                        {u.created_at && (
                          <span className="text-xs text-muted-foreground/60 mt-0.5">
                            Joined {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">{u.email || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-[10px] uppercase tracking-wider text-primary">
                          <Crown className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider text-muted-foreground">
                          Member
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/admin/users/${u.id}`}
                        className="inline-flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
