import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Search } from 'lucide-react';
import apiClient from '@/api/client';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiClient.auth.me().then(u => {
      if (u.role !== 'admin') { setDenied(true); setLoading(false); return; }
      apiClient.entities.User.list()
        .then(setUsers)
        .catch(() => {})
        .finally(() => setLoading(false));
    }).catch(() => { setDenied(true); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  if (denied) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-3" strokeWidth={1} />
        <h1 className="font-heading text-xl text-foreground mb-1">Admin Access Required</h1>
        <p className="text-sm text-muted-foreground">You don't have permission to view this page.</p>
      </div>
    </div>
  );

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || (u.email || '').toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q);
  });

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-light text-foreground mb-2">User <span className="molten-text italic">Management</span></h1>
        <p className="text-sm text-muted-foreground">Manage app users and roles.</p>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors" />
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-card/50">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">Role</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-card/50 transition-colors">
                <td className="px-4 py-3 text-sm text-foreground">{u.full_name || '—'}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{u.email}</td>
                <td className="px-4 py-3"><span className={`text-xs uppercase tracking-widest ${u.role === 'admin' ? 'text-primary' : 'text-muted-foreground'}`}>{u.role || 'user'}</span></td>
                <td className="px-4 py-3"><Link to={`/admin/users/${u.id}`}><ArrowRight className="w-4 h-4 text-muted-foreground hover:text-foreground" strokeWidth={1.5} /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}