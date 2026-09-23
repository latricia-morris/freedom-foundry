import React from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Past curation conversations for the agent, plus a new-conversation action. */
export default function ConversationSidebar({ conversations, activeId, onSelect, onNew, busy }) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-3 sm:w-64">
      <Button type="button" onClick={onNew} disabled={busy} className="btn-forge w-full justify-center gap-2">
        <Plus className="h-4 w-4" /> New curation draft
      </Button>
      <div className="flex-1 space-y-1 overflow-y-auto">
        {(conversations || []).length === 0 && (
          <p className="px-1 text-xs text-muted-foreground">No curation conversations yet.</p>
        )}
        {(conversations || []).map((c) => {
          const label = (c.metadata && (c.metadata.name || c.metadata.description)) || 'Curation draft';
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                active
                  ? 'border-primary/50 bg-primary/10 text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}