import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

/**
 * Sort, client filter, and active-only controls for agency list views.
 * Controlled component — the parent owns state via useListControls.
 */
export default function ListToolbar({ sortOptions, value, onChange, clients = [], showClientFilter = true, showActiveToggle = true }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-3">
      <label className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Sort</span>
        <select
          className="admin-input w-auto py-1.5 text-xs"
          value={value.sortBy}
          onChange={(e) => onChange({ sortBy: e.target.value })}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <button
          type="button"
          aria-label={value.sortDir === 'asc' ? 'Switch to descending order' : 'Switch to ascending order'}
          title={value.sortDir === 'asc' ? 'Ascending' : 'Descending'}
          onClick={() => onChange({ sortDir: value.sortDir === 'asc' ? 'desc' : 'asc' })}
          className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          {value.sortDir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
        </button>
      </label>

      {showClientFilter && (
        <label className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Client</span>
          <select
            className="admin-input w-auto py-1.5 text-xs"
            value={value.clientFilter || ''}
            onChange={(e) => onChange({ clientFilter: e.target.value })}
          >
            <option value="">All Clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.company_name}</option>
            ))}
          </select>
        </label>
      )}

      {showActiveToggle && (
        <button
          type="button"
          onClick={() => onChange({ activeOnly: !value.activeOnly })}
          className={`rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
            value.activeOnly
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          Active Only
        </button>
      )}
    </div>
  );
}