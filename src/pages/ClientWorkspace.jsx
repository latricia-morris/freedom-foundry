import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Spinner, Panel, Empty } from '@/components/crm/CrmUi';
import ClientProjectCard from '@/components/crm/client/ClientProjectCard';
import ClientInvoiceList from '@/components/crm/client/ClientInvoiceList';
import MessageThread from '@/components/crm/messages/MessageThread';

export default function ClientWorkspace() {
  const qc = useQueryClient();
  const [clientId, setClientId] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['client-workspace'],
    queryFn: async () => (await base44.functions.invoke('crmClient', { action: 'workspace' })).data,
    refetchInterval: 30000,
  });

  if (isLoading) return <Spinner />;
  const { clients = [], projects = [], tasks = [], deliverables = [], invoices = [], messages = [] } = data || {};
  const active = clientId || clients[0]?.id;

  const send = async (body) => {
    await base44.functions.invoke('crmClient', { action: 'send', agency_client_id: active, body });
    qc.invalidateQueries({ queryKey: ['client-workspace'] });
  };

  return (
    <div className="max-w-4xl animate-fade-in">
      <div className="mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Brand Portal</span>
        <h1 className="mt-1 font-heading text-3xl font-light text-foreground">Client <span className="molten-text italic">Workspace</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">Your active projects, invoices and a direct line to the team.</p>
      </div>

      {clients.length === 0 ? (
        <div className="dashboard-card p-8 text-center">
          <h2 className="font-heading text-2xl font-light text-foreground">No client account linked yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Your workspace opens once the team links your email to your client account. Reach out from the Contact page if you're expecting access.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {clients.length > 1 && (
            <select className="admin-input w-auto" value={active} onChange={(e) => setClientId(e.target.value)} aria-label="Client account">
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          {projects.filter((p) => p.client_id === active).length === 0 ? (
            <Panel title="Projects"><Empty>Your projects will appear here once the team opens them to you.</Empty></Panel>
          ) : projects.filter((p) => p.client_id === active).map((p) => (
            <ClientProjectCard key={p.id} project={p} tasks={tasks.filter((t) => t.project_id === p.id)} deliverables={deliverables.filter((d) => d.project_id === p.id)} />
          ))}
          <ClientInvoiceList invoices={invoices.filter((i) => i.client_id === active)} />
          <Panel title="Messages">
            <MessageThread messages={messages.filter((m) => m.client_id === active)} mine={(m) => m.from_client} onSend={send} placeholder="Ask a question or share an update…" />
          </Panel>
        </div>
      )}
    </div>
  );
}