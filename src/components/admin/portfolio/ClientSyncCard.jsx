import React, { useEffect, useState } from 'react';
import { Link2, X } from 'lucide-react';
import apiClient from '@/api/client';
import ClientPicker from '@/components/admin/ClientPicker';

/** Links a portfolio project to a client account so intake uploads also
 *  sync into the client's own asset library. */
export default function ClientSyncCard({ project, onChange }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let active = true;
    apiClient.entities.User.list()
      .then((rows) => { if (active) setUsers(rows || []); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const selected = users.find((u) => u.id === project?.client_user_id) || null;

  return (
    <div className="dashboard-card space-y-4 p-6">
      <div>
        <h3 className="font-heading text-2xl text-foreground">Client asset library sync</h3>
        <p className="text-xs text-muted-foreground/70">
          Link this project to a client and every public asset uploaded here also lands in their
          asset library. Nothing gets uploaded twice.
        </p>
      </div>

      {selected ? (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-primary/30 bg-primary/5 p-3">
          <Link2 className="h-4 w-4 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {[selected.first_name, selected.last_name].filter(Boolean).join(' ') || selected.email}
            </p>
            <p className="truncate text-xs text-muted-foreground/70">{selected.email}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ client_user_id: '' })}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" /> Unlink
          </button>
        </div>
      ) : (
        <ClientPicker selected={null} onSelect={(user) => onChange({ client_user_id: user.id })} />
      )}
    </div>
  );
}