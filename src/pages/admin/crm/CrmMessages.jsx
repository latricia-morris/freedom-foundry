import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { E, useClientOptions, useRefresh } from '@/components/crm/useCrm';
import { PageHeader, Panel } from '@/components/crm/CrmUi';
import MessageThread from '@/components/crm/messages/MessageThread';

export default function CrmMessages() {
  const refresh = useRefresh();
  const { data: clients = [] } = useClientOptions();
  const [clientId, setClientId] = useState('');
  const { data: unread = [] } = useQuery({
    queryKey: ['crm', 'messages', 'unread'],
    queryFn: async () => (await E.ClientMessage.aggregate({ query: { is_from_client: true, read_by_agency: false }, groupBy: 'agency_client_id' })).rows,
  });
  const { data: thread = [] } = useQuery({
    queryKey: ['crm', 'messages', clientId],
    enabled: !!clientId,
    queryFn: async () => (await E.ClientMessage.filter({ agency_client_id: clientId }, { sort: '-created_date', limit: 200 })).items.reverse(),
  });

  useEffect(() => base44.entities.ClientMessage.subscribe(() => refresh('messages')), []);
  useEffect(() => {
    if (clientId && unread.some((r) => r.agency_client_id === clientId)) {
      E.ClientMessage.updateMany({ agency_client_id: clientId, is_from_client: true, read_by_agency: false }, { $set: { read_by_agency: true } }).then(() => refresh('messages'));
    }
  }, [clientId, unread]);

  const send = async (body) => {
    const me = await base44.auth.me();
    await E.ClientMessage.create({ agency_client_id: clientId, body, is_from_client: false, sender_name: me.full_name || 'Freedom Foundry', read_by_agency: true });
    refresh('messages');
  };
  const count = (id) => unread.find((r) => r.agency_client_id === id)?.count || 0;
  const sorted = [...clients].sort((a, b) => count(b.id) - count(a.id));

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <PageHeader title="Client" accent="Messages" subtitle="Conversations clients start from their workspace. Replies appear in their portal instantly." />
      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <div className="dashboard-card max-h-[34rem] overflow-y-auto p-2">
          {sorted.map((c) => (
            <button key={c.id} onClick={() => setClientId(c.id)} className={`flex w-full items-center justify-between border-l-2 px-3 py-2.5 text-left text-sm ${clientId === c.id ? 'border-primary bg-primary/5 text-foreground' : 'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground'}`}>
              <span className="truncate">{c.company_name}</span>
              {count(c.id) > 0 && <span className="rounded-full bg-primary px-2 text-[10px] font-semibold leading-4 text-primary-foreground">{count(c.id)}</span>}
            </button>
          ))}
        </div>
        <Panel title={clients.find((c) => c.id === clientId)?.company_name || 'Choose a client'}>
          {clientId ? <MessageThread messages={thread} mine={(m) => !m.is_from_client} onSend={send} placeholder="Reply to the client…" /> : <p className="p-10 text-center text-sm text-muted-foreground">Select a client to view the conversation.</p>}
        </Panel>
      </div>
    </div>
  );
}