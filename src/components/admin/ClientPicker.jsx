import React, { useEffect, useMemo, useState } from 'react';
import { Search, UserCheck } from 'lucide-react';
import apiClient from '@/api/client';

export default function ClientPicker({ selected, onSelect }) {
  const [users, setUsers] = useState(null);
  const [term, setTerm] = useState('');

  useEffect(() => {
    let active = true;
    apiClient.entities.User.list()
      .then((rows) => {
        if (!active) return;
        setUsers((rows || []).filter((u) => u.role !== 'admin'));
      })
      .catch(() => active && setUsers([]));
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    const t = term.trim().toLowerCase();
    if (!t) return users;
    return users.filter((u) =>
      (u.email || '').toLowerCase().includes(t)
      || `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(t)
      || (u.business_name || '').toLowerCase().includes(t));
  }, [users, term]);

  return (
    <div className="dashboard-card border border-border p-6">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search members by name, email, or business..."
          className="admin-input pl-9"
        />
      </div>

      {!users ? (
        <div className="flex justify-center py-10">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">No members match that search.</p>
      ) : (
        <div className="max-h-96 overflow-y-auto divide-y divide-border/50">
          {filtered.map((user) => {
            const isSelected = selected?.id === user.id;
            return (
              <button
                type="button"
                key={user.id}
                onClick={() => onSelect(user)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-3 text-left transition-colors ${
                  isSelected ? 'bg-primary/10' : 'hover:bg-accent/50'
                }`}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground truncate">
                    {user.first_name || user.last_name
                      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                      : 'Unnamed member'}
                  </span>
                  <span className="block text-xs text-muted-foreground truncate">{user.email || '—'}</span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  {user.account_type && (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded-sm px-2 py-0.5">
                      {user.account_type}
                    </span>
                  )}
                  {isSelected && <UserCheck className="w-4 h-4 text-primary" />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}