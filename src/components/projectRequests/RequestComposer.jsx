import React from 'react';
import ServiceChoices from '@/components/projectRequests/ServiceChoices';
import RequestTimeline from '@/components/projectRequests/RequestTimeline';
import RequestBudget from '@/components/projectRequests/RequestBudget';
import RequestReferences from '@/components/projectRequests/RequestReferences';
import RequestAcknowledgment from '@/components/projectRequests/RequestAcknowledgment';
import RequestAccount from '@/components/projectRequests/RequestAccount';
import RequestDetail from '@/components/projectRequests/RequestDetail';
import useRequestFiles from '@/components/projectRequests/useRequestFiles';
import useProjectRequest from '@/components/projectRequests/useProjectRequest';

export default function RequestComposer({ data }) {
  const uploads = useRequestFiles();
  const request = useProjectRequest(uploads.files, data);
  const { form, update } = request;
  if (request.submitted) return <section className="dashboard-card space-y-5 rounded-[7px] p-5 sm:p-7" data-testid="request-confirmation">
    <div role="status"><h2 className="font-heading text-3xl">Your request has been received.</h2><p className="mt-3 text-sm text-muted-foreground">We will review the work, timing, and details you shared. Please allow 3–5 business days for a response. You can find your request in Project Requests.</p></div>
    <details><summary className="cursor-pointer text-sm font-medium">View submitted details</summary><div className="pt-4"><RequestDetail row={request.submitted} /></div></details>
  </section>;
  return <>
    <RequestAccount data={data} brandId={form.agency_client_id || (data.brands.length === 1 ? data.brands[0].id : '')} onChange={(value) => update('agency_client_id', value)} />
    <form onSubmit={request.submit} className="dashboard-card rounded-[7px] p-5 sm:p-7" aria-label="Request a project">
      <fieldset disabled={request.submitting} className="min-w-0 space-y-7">
        <ServiceChoices options={data.services} selected={form.service_options} onChange={(value) => update('service_options', value)} />
        <section className="space-y-3"><label htmlFor="project-description" className="block font-medium">Tell us about the project</label>
          <p id="description-help" className="text-sm text-muted-foreground">What needs to be created or improved, and what would you like it to accomplish? A few clear sentences are enough.</p>
          <textarea id="project-description" className="admin-input min-h-40 resize-y" rows={5} required aria-describedby="description-help" placeholder="Describe the work, the goal, and anything important we should know." value={form.notes} onChange={(e) => update('notes', e.target.value)} />
        </section>
        <RequestTimeline options={data.timelines} form={form} update={update} />
        <RequestBudget form={form} update={update} />
        <RequestReferences uploads={uploads} link={form.link} onLink={(value) => update('link', value)} />
        {request.error && <p role="alert" className="rounded-[7px] border border-destructive p-3 text-sm">{request.error}</p>}
        <RequestAcknowledgment checked={form.acknowledged} onChange={(value) => update('acknowledged', value)} submitting={request.submitting} uploading={uploads.uploading} />
      </fieldset>
    </form>
  </>;
}