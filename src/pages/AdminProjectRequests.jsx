import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import useRequestContext from '@/components/projectRequests/useRequestContext';
import RequestFilters from '@/components/projectRequests/RequestFilters';
import RequestList from '@/components/projectRequests/RequestList';
import { EMPTY_FILTERS } from '@/components/projectRequests/requestQuery';
import '@/components/projectRequests/requests.css';

export default function AdminProjectRequests() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const context = useRequestContext();
  const users = useQuery({ queryKey: ['request-account-names'], queryFn: () => base44.entities.User.list(), staleTime: 60000 });
  const userNames = Object.fromEntries((users.data || []).map((user) => [user.id, user.full_name || user.email]));
  return <div className="project-request max-w-5xl space-y-6">
    <header><h1 className="font-heading text-4xl font-light">Project <span className="molten-text italic">Requests</span></h1><p className="mt-2 text-sm text-muted-foreground">Review member requests. Categories, budgets, and timing inform a human decision, never automatic approval.</p></header>
    {context.isPending ? <p role="status">Loading review tools…</p> : context.error ? <p role="alert">Review tools could not be loaded. <button className="underline" onClick={() => context.refetch()}>Try again</button></p> : <>
      <RequestFilters filters={filters} setFilters={setFilters} context={context.data} />
      <RequestList context={context.data} filters={filters} userNames={userNames} admin />
    </>}
  </div>;
}