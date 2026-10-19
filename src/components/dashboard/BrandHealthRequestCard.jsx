import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Activity } from 'lucide-react';
import useRequestContext from '@/components/projectRequests/useRequestContext';
import '@/components/projectRequests/requests.css';

export default function BrandHealthRequestCard() {
  const { data, isPending, error, refetch } = useRequestContext();
  if (isPending) return <div className="dashboard-card rounded-[7px] p-6 text-sm text-muted-foreground" role="status">Checking your Brand Health Index…</div>;
  if (data?.hasCompletedAudit) return null;
  return <section className="dashboard-card project-request flex flex-col justify-between gap-5 rounded-[7px] p-6 sm:flex-row sm:items-center" aria-labelledby="audit-invitation-title" data-testid="audit-invitation">
    <div className="max-w-2xl">
      <Activity className="icon-warm mb-3 h-6 w-6" aria-hidden="true" />
      <h2 id="audit-invitation-title" className="font-heading text-3xl font-light">Request a Brand Health <span className="molten-text italic">Index</span></h2>
      <p className="mt-2 text-sm text-muted-foreground">Find out where your brand stands and what deserves attention next. Request a review of your visibility, website, and marketing.</p>
      {error && <p role="alert" className="mt-2 text-sm">Audit history could not be checked. <button className="underline" onClick={() => refetch()}>Try again</button></p>}
    </div>
    <Link className="request-primary inline-flex shrink-0 items-center justify-center gap-2 px-5 py-3 text-sm font-semibold" to="/brand-portal/project-requests?intent=brand-health-index">Request my audit <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
  </section>;
}