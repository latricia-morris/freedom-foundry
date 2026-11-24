import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

/**
 * Admin switcher for Brand Health Index reports: jump straight from one client's
 * report to another. Clients holding reports are listed first and labelled with
 * how many snapshots they have, so report availability is visible before choosing.
 */
export default function ReportClientSwitcher({ clients = [], reports = [], currentClientId = '' }) {
  const navigate = useNavigate();

  const counts = useMemo(() => {
    const map = {};
    reports.forEach((r) => {
      if (r.agency_client_id) map[r.agency_client_id] = (map[r.agency_client_id] || 0) + 1;
    });
    return map;
  }, [reports]);

  const ordered = useMemo(
    () =>
      [...clients].sort(
        (a, b) =>
          (counts[b.id] || 0) - (counts[a.id] || 0) ||
          (a.company_name || '').localeCompare(b.company_name || '')
      ),
    [clients, counts]
  );

  return (
    <label className="flex items-center gap-2">
      <span className="whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
        Switch client
      </span>
      <span className="relative">
        <select
          aria-label="Switch to another client's brand health index report"
          className="admin-input appearance-none pr-9"
          value={currentClientId}
          onChange={(e) => e.target.value && navigate(`/admin/agency/visibility/${e.target.value}`)}
        >
          <option value="">Choose a client…</option>
          {ordered.map((c) => {
            const count = counts[c.id] || 0;
            return (
              <option key={c.id} value={c.id}>
                {c.company_name || 'Untitled client'} — {count ? `${count} report${count === 1 ? '' : 's'}` : 'no report yet'}
              </option>
            );
          })}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </span>
    </label>
  );
}