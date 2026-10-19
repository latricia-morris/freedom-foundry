import React from 'react';
import useRequestContext from '@/components/projectRequests/useRequestContext';
import RequestComposer from '@/components/projectRequests/RequestComposer';
import RequestList from '@/components/projectRequests/RequestList';
import '@/components/projectRequests/requests.css';

export default function ProjectRequest() {
  const { data, isPending, error, refetch } = useRequestContext();
  return <div className="project-request max-w-3xl space-y-7 text-foreground">
    <header>
      <h1 className="font-heading text-4xl font-light">Request a <span className="molten-text italic">project</span></h1>
      <p className="mt-3 text-sm text-muted-foreground">Tell us what you need, when you need it, and any details that will help us understand the work. You can include a budget, two reference files, and a link.</p>
    </header>
    {isPending ? <p role="status" className="text-sm">Loading your account…</p> : error ? <p role="alert" className="text-sm">Account details could not be loaded. <button onClick={() => refetch()} className="underline">Try again</button></p> : <>
      <RequestComposer data={data} />
      <section className="space-y-4" aria-labelledby="my-requests-title"><h2 id="my-requests-title" className="font-heading text-2xl">My project requests</h2><RequestList context={data} /></section>
    </>}
  </div>;
}