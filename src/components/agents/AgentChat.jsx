import React, { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ConversationSidebar from './ConversationSidebar';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';

/** Conversation surface for an in-app agent: list, history, streaming replies. */
export default function AgentChat({ agentName, emptyHint }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  const refresh = useCallback(async () => {
    const list = await base44.agents.listConversations({ agent_name: agentName });
    setConversations(list || []);
    return list || [];
  }, [agentName]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    base44.agents.getConversation(activeId).then((c) => {
      if (!cancelled) setMessages(c.messages || []);
    });
    const unsubscribe = base44.agents.subscribeToConversation(activeId, (data) => {
      setMessages(data.messages || []);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [activeId]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ block: 'end' });
  }, [messages]);

  const startNew = async () => {
    setBusy(true);
    try {
      const created = await base44.agents.createConversation({
        agent_name: agentName,
        metadata: { name: 'Portfolio curation', description: 'Asset curation draft' },
      });
      await refresh();
      setMessages([]);
      setActiveId(created.id);
    } finally {
      setBusy(false);
    }
  };

  const send = async (text) => {
    const conversation = conversations.find((c) => c.id === activeId);
    if (!conversation) return;
    setBusy(true);
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: text });
      setMessages((current) => [...current, { role: 'user', content: text }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={startNew}
        busy={busy}
      />
      <div className="flex min-h-[28rem] flex-1 flex-col rounded-2xl border border-border/70 bg-card/50 p-4">
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <p className="py-16 text-center text-sm leading-relaxed text-muted-foreground">{emptyHint}</p>
          )}
          {messages.map((message, idx) => (
            <MessageBubble key={idx} message={message} />
          ))}
          <div ref={bottomRef} />
        </div>
        <MessageComposer onSend={send} busy={busy} disabled={!activeId} />
      </div>
    </div>
  );
}