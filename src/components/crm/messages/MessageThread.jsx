import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

/** Shared thread view. `mine(m)` decides which side a message sits on for the current viewer. */
export default function MessageThread({ messages, mine, onSend, placeholder = 'Write a message…' }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [messages.length]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true); setError('');
    try { await onSend(text.trim()); setText(''); } catch (err) { setError(err?.response?.data?.error || err.message || 'Message could not be sent.'); }
    setSending(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="max-h-[28rem] min-h-48 flex-1 space-y-3 overflow-y-auto p-5">
        {messages.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No messages yet. Start the conversation.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${mine(m) ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 ${mine(m) ? 'forged-gradient text-white' : 'forged-well'}`} style={{ borderRadius: 4 }}>
              <p className="whitespace-pre-wrap text-sm">{m.body}</p>
              <p className={`mt-1 text-[10px] ${mine(m) ? 'text-white/70' : 'text-muted-foreground'}`}>{m.sender_name} · {new Date(m.created_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t border-border/50 p-4">
        <textarea rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) submit(e); }} placeholder={placeholder} className="admin-input flex-1 resize-none" />
        <button disabled={sending || !text.trim()} aria-label="Send message" className="btn-forge rounded-md px-4 disabled:opacity-50"><Send className="h-4 w-4" /></button>
      </form>
      {error && <p role="alert" className="px-4 pb-3 text-xs text-destructive">{error}</p>}
    </div>
  );
}