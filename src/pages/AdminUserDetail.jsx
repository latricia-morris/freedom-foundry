import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    base44.auth.me().then(me => {
      if (me.role !== 'admin') { setDenied(true); setLoading(false); return; }
      base44.entities.User.list()
        .then(users => users.find(u => u.id === id))
        .then(u => setUser(u || null))
        .catch(() => {})
        .finally(() => setLoading(false));
    }).catch(() => { setDenied(true); setLoading(false); });
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  if (denied) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-3" strokeWidth={1} />
        <h1 className="font-heading text-xl text-foreground mb-1">Admin Access Required</h1>
      </div>
    </div>
  );
  if (!user) return (
    <div className="text-center py-20">
      <h1 className="font-heading text-xl text-foreground mb-2">User not found</h1>
      <Link to="/admin/users" className="text-sm text-primary">← Back to Users</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link to="/admin/users" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Link>

      <div className="border border-border rounded-xl bg-card p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border border-border flex items-center justify-center bg-background">
            <span className="font-heading text-lg text-foreground">{(user.full_name || user.email || 'U')[0].toUpperCase()}</span>
          </div>
          <div>
            <h1 className="font-heading text-xl text-foreground">{user.full_name || 'Unnamed User'}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">User ID</span>
            <span className="text-sm text-foreground font-mono">{user.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Role</span>
            <span className={`text-xs uppercase tracking-widest ${user.role === 'admin' ? 'text-primary' : 'text-muted-foreground'}`}>{user.role || 'user'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Joined</span>
            <span className="text-sm text-foreground">{user.created_date ? new Date(user.created_date).toLocaleDateString() : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}