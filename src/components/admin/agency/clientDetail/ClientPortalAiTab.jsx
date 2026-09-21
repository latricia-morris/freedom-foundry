import React, { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import PortalAiDraftCard from '@/components/admin/agency/clientDetail/PortalAiDraftCard';
import { applyPortalChanges, loadPortalSnapshot, resolvePortalUser } from '@/lib/clientPortalData';

const MAX_FIELD_CHARS = 400;
const SUGGESTIONS = [
  'What is currently in this client\'s portal?',
  'Draft an overview note for the portal homepage.',
  'Refresh the media kit bio.',
];

const BUILTIN_KEYS = ['id', 'created_date', 'updated_date', 'created_by_id', 'user_id'];

function trimRecord(record) {
  if (!record) return null;
  const out = {};
  for (const [key, value] of Object.entries(record)) {
    if (BUILTIN_KEYS.includes(key)) continue;
    if (typeof value === 'string') out[key] = value.slice(0, MAX_FIELD_CHARS);
    else if (value !== null && value !== undefined) out[key] = value;
  }
  return out;
}

function snapshotForPrompt(snapshot) {
  const data = snapshot || {};
  const first = (rows) => (rows && rows[0] ? { id: rows[0].id, ...trimRecord(rows[0]) } : null);
  const assets = (data.BrandAsset || []).map((a) => ({ id: a.id, title: a.title, file_type: a.file_type }));
  return JSON.stringify({
    PortalContent: (data.PortalContent || []).map((c) => ({ id: c.id, ...trimRecord(c) })),
    BigPicture: first(data.BigPicture),
    PersonalBrandProfile: first(data.PersonalBrandProfile),
    CorporateBrandProfile: first(data.CorporateBrandProfile),
    MediaKit: first(data.MediaKit),
    BrandGuidelines: first(data.BrandGuidelines),
    BrandAsset: assets,
  });
}

const AI_CHANGE_SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
    proposed_changes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          entity: { type: 'string' },
          action: { type: 'string', enum: ['update', 'create'] },
          record_id: { type: 'string' },
          fields: { type: 'object' },
          summary: { type: 'string' },
        },
        required: ['entity', 'action', 'record_id', 'fields', 'summary'],
      },
    },
  },
  required: ['reply', 'proposed_changes'],
};

export default function ClientPortalAiTab({ client }) {
  const { toast } = useToast();
  const [user, setUser] = useState(undefined); // undefined = resolving, null = no member linked
  const [snapshot, setSnapshot] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(null);
  const [applying, setApplying] = useState(false);
  const threadRef = useRef(null);

  const reload = (portalUser) => {
    loadPortalSnapshot(portalUser.id).then(setSnapshot).catch(() => setSnapshot(null));
  };

  useEffect(() => {
    let active = true;
    resolvePortalUser(client)
      .then((u) => {
        if (!active) return;
        setUser(u);
        if (u) reload(u);
      })
      .catch(() => { if (active) setUser(null); });
    return () => { active = false; };
  }, [client.id]);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, draft]);

  const send = async (text) => {
    const request = (text ?? input).trim();
    if (!request || busy) return;
    if (!snapshot) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'The portal data is still loading. Try again in a moment.' }]);
      return;
    }
    setInput('');
    setMessages((prev) => [...prev, { role: 'admin', text: request }]);
    setBusy(true);
    try {
      const history = messages.slice(-6).map((m) => `${m.role === 'admin' ? 'Admin' : 'Assistant'}: ${m.text}`).join('\n');
      const prompt = [
        'You are the brand portal assistant inside an agency admin panel. You manage the brand portal for this client:',
        client.company_name,
        'The client\'s current portal data snapshot (JSON):',
        snapshotForPrompt(snapshot || {}),
        'Conversation so far:',
        history || '(new conversation)',
        'Admin request:',
        request,
        'Rules: Answer using only the snapshot. If the admin clearly asks you to change or add something, fill proposed_changes with the exact change objects. Entity names must be exactly one of: PortalContent, BigPicture, PersonalBrandProfile, CorporateBrandProfile, MediaKit, BrandGuidelines. For updates, record_id must be an existing id from the snapshot; for creates, use an empty record_id. Include only the fields that should change. If the admin is asking a question, return an empty proposed_changes array. Never invent data, ids, or results.',
      ].join('\n\n');
      const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: AI_CHANGE_SCHEMA });
      const data = res || {};
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply || '' }]);
      if ((data.proposed_changes || []).length) setDraft(data.proposed_changes);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', text: `That request did not go through. ${e.message || 'Try again.'}` }]);
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    if (!draft || applying) return;
    setApplying(true);
    try {
      const applied = await applyPortalChanges(user.id, client, draft);
      toast({ title: `Applied ${applied.length} portal change${applied.length === 1 ? '' : 's'}` });
      setMessages((prev) => [...prev, { role: 'assistant', text: `${applied.length} change${applied.length === 1 ? '' : 's'} applied to the portal and logged.` }]);
      setDraft(null);
      reload(user);
    } catch (e) {
      toast({ title: 'Could not apply the changes', description: e.message, variant: 'destructive' });
    } finally {
      setApplying(false);
    }
  };

  if (user === undefined) {
    return <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>;
  }

  if (user === null) {
    return (
      <div className="dashboard-card p-8 text-center">
        <Sparkles className="mx-auto mb-3 h-6 w-6 icon-warm" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">
          No portal member is linked to this client yet. The portal is matched by contact email
          (<span className="text-foreground">{client.primary_contact_email || 'none on file'}</span>). Invite that email as an app member and everything in their portal appears here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="dashboard-card flex h-[28rem] flex-col p-0">
        <div className="flex items-center gap-3 border-b border-border/50 px-5 py-4">
          <div className="icon-tile h-9 w-9">
            <Bot className="h-4 w-4 icon-warm" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading text-lg text-foreground">Portal assistant</h3>
            <p className="text-xs text-muted-foreground/70">{user.email} · view and update their portal with a draft first</p>
          </div>
        </div>
        <div ref={threadRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Ask what is in the portal, or request a change. Proposed edits wait for your approval before anything saves.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <p className={`max-w-[80%] whitespace-pre-wrap rounded-md px-4 py-2.5 text-sm ${m.role === 'admin' ? 'bg-primary/15 text-foreground' : 'border border-border/70 bg-background/40 text-foreground'}`}>
                {m.text}
              </p>
            </div>
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
            </div>
          )}
        </div>
        <div className="border-t border-border/50 p-4">
          <div className="mb-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                disabled={busy}
                className="rounded-sm border border-border px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="admin-input py-2 text-sm"
              placeholder="Ask about or update this client's portal…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              disabled={busy}
            />
            <button
              type="button"
              onClick={() => send()}
              disabled={busy || !input.trim()}
              className="btn-forge inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
            </button>
          </div>
        </div>
      </div>

      {draft && (
        <PortalAiDraftCard
          draft={draft}
          snapshot={snapshot || {}}
          onApprove={approve}
          onDiscard={() => setDraft(null)}
          applying={applying}
        />
      )}
    </div>
  );
}