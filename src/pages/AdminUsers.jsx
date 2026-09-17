import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Search, UserPlus, X, Layers3 } from 'lucide-react';
import apiClient from '@/api/client';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');

  const sendInvite = async (event) => {
    event.preventDefault();
    setInviting(true);
    setInviteMessage('');
    try {
      const invitation = await apiClient.admin.inviteUser(inviteEmail);
      setInviteMessage(`Invitation sent to ${invitation.email}. They’ll choose their own sign-in details.`);
      setInviteEmail('');
    } catch (requestError) {
      setInviteMessage(requestError.message || 'The invitation could not be sent.');
    }
    setInviting(false);
  };

  useEffect(() => {
    apiClient.auth.me().then(u => {
      if (u.role !== 'admin') { setDenied(true); setLoading(false); return; }
      apiClient.entities.User.list()
        .then(setUsers)
        .catch((requestError) => setError(requestError.message || 'The member roster could not be loaded.'))
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
    const name = `${u.first_name || ''} ${u.last_name || ''}`.trim();
    return !q || (u.email || '').toLowerCase().includes(q) || name.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-light text-foreground mb-2">User <span className="molten-text italic">Management</span></h1>
          <p className="text-sm text-muted-foreground">Manage app users, access, and account content.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/client-setups" className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-card px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-foreground hover:border-primary">
            <Layers3 className="h-4 w-4 text-primary" /> Client migrations
          </Link>
          <button
            onClick={() => { setInviteOpen(true); setInviteMessage(''); }}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-white"
            style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c)' }}
          >
            <UserPlus className="h-4 w-4" /> Invite member
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      )}

      {inviteOpen && (
        <form onSubmit={sendInvite} className="mb-5 rounded-xl border border-primary/25 bg-card p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-lg text-foreground">Invite a member</h2>
              <p className="mt-1 text-sm text-muted-foreground">They’ll receive an email to set up their own Freedom Foundry account.</p>
            </div>
            <button type="button" onClick={() => setInviteOpen(false)} className="rounded-md p-1 text-muted-foreground hover:text-foreground" aria-label="Close invitation form">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={event => setInviteEmail(event.target.value)}
              placeholder="member@example.com"
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
            <button disabled={inviting} className="rounded-lg bg-primary px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-primary-foreground disabled:opacity-50">
              {inviting ? 'Sending…' : 'Send invitation'}
            </button>
          </div>
          {inviteMessage && <p role="status" className="mt-3 text-sm text-muted-foreground">{inviteMessage}</p>}
        </form>
      )}

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
                <td className="px-4 py-3 text-sm text-foreground">{`${u.first_name || ''} ${u.last_name || ''}`.trim() || '—'}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{u.email}</td>
                <td className="px-4 py-3"><span className={`text-xs uppercase tracking-widest ${u.role === 'admin' ? 'text-primary' : 'text-muted-foreground'}`}>{u.role || 'user'}</span></td>
                <td className="px-4 py-3"><Link to={`/admin/users/${u.id}`} aria-label={`Manage ${u.email || 'member'}`}><ArrowRight className="w-4 h-4 text-muted-foreground hover:text-foreground" strokeWidth={1.5} /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}