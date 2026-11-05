import React from 'react';
import { Trash2 } from 'lucide-react';

export const ROLE_LABELS = { owner: 'Owner', brand_admin: 'Brand Admin', team_member: 'Team Member' };

export default function BrandMemberRow({ email, role, onRole, onRemove, busy }) {
  return (
    <li className="flex flex-wrap items-center gap-3 px-5 py-3">
      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{email}</span>
      {onRole ? (
        <select className="admin-input w-auto py-1.5 text-xs" value={role} disabled={busy} onChange={(e) => onRole(e.target.value)} aria-label={`Role for ${email}`}>
          <option value="brand_admin">Brand Admin</option>
          <option value="team_member">Team Member</option>
        </select>
      ) : (
        <span className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">{ROLE_LABELS[role]}</span>
      )}
      {onRemove && (
        <button type="button" onClick={onRemove} disabled={busy} aria-label={`Remove ${email}`} className="p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-50">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}